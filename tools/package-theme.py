#!/usr/bin/env python3
"""Build and self-verify a deterministic Ecowise Custom theme ZIP."""

from __future__ import annotations

import hashlib
import json
import pathlib
import sys
import zipfile


REPOSITORY_ROOT = pathlib.Path(__file__).resolve().parent.parent
THEME_ROOT = REPOSITORY_ROOT / "wp-content" / "themes" / "ecowise-custom"
FIXED_TIMESTAMP = (2026, 7, 22, 0, 0, 0)
TEXT_EXTENSIONS = {
    ".css", ".html", ".htm", ".js", ".json", ".md", ".mjs", ".php", ".po", ".pot", ".properties", ".svg", ".txt", ".xml",
}
TEXT_FILENAMES = {"LICENSE", "README"}


def theme_files() -> list[pathlib.Path]:
    return sorted(path for path in THEME_ROOT.rglob("*") if path.is_file())


def packaged_bytes(source: pathlib.Path) -> bytes:
    content = source.read_bytes()
    if source.suffix.lower() in TEXT_EXTENSIONS or source.name.upper() in TEXT_FILENAMES or source.name.upper().startswith("LICENSE_"):
        content = content.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return content


def main() -> int:
    arguments = [argument for argument in sys.argv[1:] if argument != "--check-manifest"]
    if len(arguments) > 1:
        raise SystemExit("Usage: package-theme.py [output.zip] [--check-manifest]")
    output = pathlib.Path(arguments[0]).resolve() if arguments else REPOSITORY_ROOT / "dist" / "ecowise-custom-theme.zip"
    check_manifest = "--check-manifest" in sys.argv[1:]
    files = theme_files()
    if not files:
        raise SystemExit(f"Theme is empty or missing: {THEME_ROOT}")

    output.parent.mkdir(parents=True, exist_ok=True)
    # Stored entries avoid zlib-version-dependent output and make the archive
    # byte-identical across Windows, Linux and CI runners.
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED) as archive:
        for source in files:
            relative = source.relative_to(THEME_ROOT)
            info = zipfile.ZipInfo(f"ecowise-custom/{relative.as_posix()}", FIXED_TIMESTAMP)
            info.create_system = 3
            info.create_version = 20
            info.extract_version = 20
            info.compress_type = zipfile.ZIP_STORED
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, packaged_bytes(source), compress_type=zipfile.ZIP_STORED)

    expected = [f"ecowise-custom/{path.relative_to(THEME_ROOT).as_posix()}" for path in files]
    with zipfile.ZipFile(output, "r") as archive:
        actual = archive.namelist()
        if actual != expected:
            raise SystemExit("Package verification failed: ZIP inventory differs from the theme source.")
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Package verification failed: corrupt member {bad}")
        for source, member in zip(files, expected):
            if archive.read(member) != packaged_bytes(source):
                raise SystemExit(f"Package verification failed: content differs for {member}")

    digest = hashlib.sha256(output.read_bytes()).hexdigest().upper()
    size = output.stat().st_size
    if check_manifest:
        manifest_path = REPOSITORY_ROOT / "release" / "theme-package.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        actual = {"sha256": digest, "fileCount": len(files), "bytes": size}
        expected_manifest = {key: manifest.get(key) for key in actual}
        if actual != expected_manifest:
            raise SystemExit(f"Release manifest mismatch: expected {expected_manifest}, built {actual}")
        print(f"Release manifest verified: {manifest_path}")
    print(f"Theme package verified: {len(files)} files, {size} bytes")
    print(f"SHA-256 {digest}")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
