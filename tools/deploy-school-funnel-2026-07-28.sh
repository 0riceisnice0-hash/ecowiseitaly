#!/usr/bin/env bash
set -euo pipefail

bundle=/home/customer/ecowise-deploy-20260728-v23
root=/home/customer/www/ecowiseitaly.com/public_html
theme="$root/wp-content/themes/ecowise-custom"
candidate="$bundle/candidate"
swap="$bundle/ecowise-custom-pre-v23"
archive="$bundle/ecowise-custom-theme-2026-07-28-v23.zip"
expected_sha=9447bc9f55ceb53f1939718989807451280de93d7869c0526084c21fb303f098

cd "$root"
test "$(sha256sum "$archive" | cut -d ' ' -f 1)" = "$expected_sha"
test ! -e "$candidate"
test ! -e "$swap"

mkdir "$candidate"
unzip -q "$archive" -d "$candidate"
test "$(find "$candidate/ecowise-custom" -type f | wc -l)" -eq 739
grep -q '^Version: 1.1.0$' "$candidate/ecowise-custom/style.css"
find "$candidate/ecowise-custom" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"

wp db export "$bundle/pre-deploy-database.sql" --quiet
wp option get template > "$bundle/pre-deploy-template.txt"
wp option get stylesheet > "$bundle/pre-deploy-stylesheet.txt"
wp plugin list --format=json > "$bundle/pre-deploy-plugins.json"
wp user list --fields=ID,user_login,user_email,roles --format=json > "$bundle/pre-deploy-users.json"

rollback_theme() {
	code=$?
	if [ "$code" -ne 0 ]; then
		if [ -d "$theme" ]; then
			mv "$theme" "$bundle/ecowise-custom-failed"
		fi
		if [ -d "$swap" ]; then
			mv "$swap" "$theme"
			wp theme activate ecowise-custom --quiet || true
		fi
	fi
	exit "$code"
}
trap rollback_theme EXIT

mv "$theme" "$swap"
mv "$candidate/ecowise-custom" "$theme"
wp theme activate ecowise-custom --quiet
wp eval-file "$bundle/provision-growth-pages.php"
wp rewrite flush --quiet
wp cache flush --quiet
wp sg purge

test "$(wp theme get ecowise-custom --field=version)" = '1.1.0'
test "$(find "$theme" -type f | wc -l)" -eq 739
test "$(wp post list --post_type=page --name=school-trips-italy --post_status=publish --field=ID | wc -l)" -eq 1

trap - EXIT
echo 'EcoWise Italy school funnel release 1.1.0 deployed.'
