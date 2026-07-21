# Ecowise Italy custom WordPress theme

This repository contains the code-driven replacement for the former Elementor site at `ecowiseitaly.com`.

The implementation has two deliberate layers:

1. **Fidelity snapshots** preserve the exact public HTML for the current indexed routes while the site is moved off Elementor.
2. **Native templates** render archives, search, errors and any new WordPress content without Elementor or ACF.

The WordPress database and uploads are deployment inputs and are intentionally not stored in Git. See `HANDOVER.md` for restoration and activation instructions.

## Theme location

`wp-content/themes/ecowise-custom`

## First deployment

1. Restore the supplied database and uploads backup to staging.
2. Copy this repository's `wp-content/themes/ecowise-custom` directory into WordPress.
3. Activate **Ecowise Custom**.
4. Save **Settings → Permalinks** once.
5. Validate the URL inventory in `audit/indexed-routes.json` and the checklist in `HANDOVER.md` before changing DNS or production files.

