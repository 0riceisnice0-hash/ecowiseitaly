#!/usr/bin/env python3
"""Build and self-verify a deterministic Ecowise Custom theme ZIP."""

from __future__ import annotations

import hashlib
import pathlib
import sys
import zipfile


REPOSITORY_ROOT = pathlib.Path(__file__).resolve().parent.parent
THEME_ROOT = REPOSITORY_ROOT / "wp-content" / "themes" / "ecowise-custom"
OUTPUT = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else REPOSITORY_ROOT / "dist" / "ecowise-custom-theme.zip"
FIXED_TIMESTAMP = (2026, 7, 22, 0, 0, 0)


def theme_files() -> list[pathlib.Path]:
    return sorted(path for path in THEME_ROOT.rglob("*") if path.is_file())


def main() -> int:
    files = theme_files()
    if not files:
        raise SystemExit(f"Theme is empty or missing: {THEME_ROOT}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source in files:
            relative = source.relative_to(THEME_ROOT)
            info = zipfile.ZipInfo(f"ecowise-custom/{relative.as_posix()}", FIXED_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100644 & 0xFFFF) << 16
            archive.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

    expected = [f"ecowise-custom/{path.relative_to(THEME_ROOT).as_posix()}" for path in files]
    with zipfile.ZipFile(OUTPUT, "r") as archive:
        actual = archive.namelist()
        if actual != expected:
            raise SystemExit("Package verification failed: ZIP inventory differs from the theme source.")
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Package verification failed: corrupt member {bad}")

    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest().upper()
    print(f"Theme package verified: {len(files)} files, {OUTPUT.stat().st_size} bytes")
    print(f"SHA-256 {digest}")
    print(OUTPUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
