#!/usr/bin/env python3
"""Build and self-verify a deterministic Ecowise Custom theme ZIP."""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import struct
import sys
import zipfile
import zlib


REPOSITORY_ROOT = pathlib.Path(__file__).resolve().parent.parent
THEME_ROOT = REPOSITORY_ROOT / "wp-content" / "themes" / "ecowise-custom"
FIXED_TIMESTAMP = (2026, 7, 22, 0, 0, 0)
TEXT_EXTENSIONS = {
    ".css", ".html", ".htm", ".js", ".json", ".md", ".mjs", ".php", ".po", ".pot", ".properties", ".svg", ".txt", ".xml",
}
TEXT_FILENAMES = {"LICENSE", "README"}


def theme_files() -> list[pathlib.Path]:
    return sorted(
        (path for path in THEME_ROOT.rglob("*") if path.is_file()),
        key=lambda path: path.relative_to(THEME_ROOT).as_posix(),
    )


def packaged_bytes(source: pathlib.Path) -> bytes:
    content = source.read_bytes()
    if source.suffix.lower() in TEXT_EXTENSIONS or source.name.upper() in TEXT_FILENAMES or source.name.upper().startswith("LICENSE_"):
        content = content.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return content


def write_archive(output: pathlib.Path, files: list[pathlib.Path]) -> None:
    dos_time = 0
    dos_date = ((FIXED_TIMESTAMP[0] - 1980) << 9) | (FIXED_TIMESTAMP[1] << 5) | FIXED_TIMESTAMP[2]
    utf8_flag = 0x0800
    central_records: list[bytes] = []
    with output.open("wb") as archive:
        for source in files:
            name = f"ecowise-custom/{source.relative_to(THEME_ROOT).as_posix()}".encode("utf-8")
            content = packaged_bytes(source)
            crc = zlib.crc32(content) & 0xFFFFFFFF
            offset = archive.tell()
            archive.write(struct.pack("<IHHHHHIIIHH", 0x04034B50, 20, utf8_flag, 0, dos_time, dos_date, crc, len(content), len(content), len(name), 0))
            archive.write(name)
            archive.write(content)
            central_records.append(
                struct.pack(
                    "<IHHHHHHIIIHHHHHII",
                    0x02014B50, (3 << 8) | 20, 20, utf8_flag, 0, dos_time, dos_date, crc,
                    len(content), len(content), len(name), 0, 0, 0, 0, (0o100644 & 0xFFFF) << 16, offset,
                ) + name
            )
        central_offset = archive.tell()
        for record in central_records:
            archive.write(record)
        central_size = archive.tell() - central_offset
        archive.write(struct.pack("<IHHHHIIH", 0x06054B50, 0, 0, len(files), len(files), central_size, central_offset, 0))


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
    # Write the small, stored ZIP structure explicitly so platform-specific
    # pathlib and zipfile defaults cannot alter release bytes.
    write_archive(output, files)

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
            if os.environ.get("GITHUB_ACTIONS") == "true":
                print(f"::error title=Release manifest mismatch::expected {expected_manifest}; built {actual}")
            raise SystemExit(f"Release manifest mismatch: expected {expected_manifest}, built {actual}")
        print(f"Release manifest verified: {manifest_path}")
    print(f"Theme package verified: {len(files)} files, {size} bytes")
    print(f"SHA-256 {digest}")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
