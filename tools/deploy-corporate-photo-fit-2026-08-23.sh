#!/usr/bin/env bash
set -euo pipefail

bundle=/home/customer/ecowise-deploy-20260823-v30
root=/home/customer/www/ecowiseitaly.com/public_html
previous_theme=ecowise-custom-v30
next_theme=ecowise-custom-v31
candidate="$bundle/candidate"
archive="$bundle/ecowise-custom-theme-2026-08-23-v30.zip"
expected_sha=d330a10bcbe67e3ca30a020f2d75077fa434c88e58e6e7c1b28f751739e8be1a

cd "$root"
test "$(sha256sum "$archive" | cut -d ' ' -f 1)" = "$expected_sha"
test ! -e "$candidate"
test ! -e "$root/wp-content/themes/$next_theme"

mkdir "$candidate"
unzip -q "$archive" -d "$candidate"
test "$(find "$candidate/ecowise-custom" -type f | wc -l)" -eq 773
grep -q '^Version: 1.1.9$' "$candidate/ecowise-custom/style.css"
find "$candidate/ecowise-custom" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"

wp db export "$bundle/pre-deploy-database.sql" --quiet
wp option get template > "$bundle/pre-deploy-template.txt"
wp option get stylesheet > "$bundle/pre-deploy-stylesheet.txt"
wp user list --fields=ID,user_login,user_email,roles --format=json > "$bundle/pre-deploy-users.json"

rollback_theme() {
	code=$?
	if [ "$code" -ne 0 ]; then
		wp theme activate "$previous_theme" --quiet || true
		wp rewrite flush --quiet || true
		wp cache flush --quiet || true
		wp sg purge || true
	fi
	exit "$code"
}
trap rollback_theme EXIT

mv "$candidate/ecowise-custom" "$root/wp-content/themes/$next_theme"
wp theme activate "$next_theme" --quiet
wp rewrite flush --quiet
wp cache flush --quiet
wp sg purge

test "$(wp theme get "$next_theme" --field=version)" = '1.1.9'
test "$(find "$root/wp-content/themes/$next_theme" -type f | wc -l)" -eq 773
test "$(wp option get stylesheet)" = "$next_theme"
test "$(wp user list --role=administrator --field=user_email | wc -l)" -eq 1
test "$(wp user list --role=administrator --field=user_email)" = 'marketinghydron@gmail.com'

trap - EXIT
echo 'EcoWise Italy corporate photo-fit release 1.1.9 deployed as ecowise-custom-v31.'
