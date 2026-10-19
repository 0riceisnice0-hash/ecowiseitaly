#!/usr/bin/env bash
set -euo pipefail
bundle=/home/customer/ecowise-growth-20261019
root=/home/customer/www/ecowiseitaly.com/public_html
previous=ecowise-custom-v32
next=ecowise-custom-v33
archive="$bundle/ecowise-custom-theme-2026-10-19-v33.zip"
cd "$root"
test "$(wp option get stylesheet)" = "$previous"
test "$(sha256sum "$archive" | cut -d ' ' -f 1)" = c054490c3bbe4def8b18c3da803170b241fbe88f7d3b4f93f42c076fb8bfa04f
test ! -e "$bundle/candidate"
test ! -e "$root/wp-content/themes/$next"
mkdir "$bundle/candidate"
unzip -q "$archive" -d "$bundle/candidate"
candidate="$bundle/candidate/ecowise-custom"
test "$(find "$candidate" -type f | wc -l)" -eq 775
grep -q '^Version: 1.2.0$' "$candidate/style.css"
find "$candidate" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"
ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file /home/customer/ecowise-news-20261019/preflight/tools/validate-wordpress.php
wp db export "$bundle/pre-deploy-database.sql" --quiet
wp option get stylesheet > "$bundle/pre-deploy-stylesheet.txt"
rollback() {
  code=$?
  if [ "$code" -ne 0 ]; then wp theme activate "$previous" --quiet || true; wp sg purge || true; fi
  exit "$code"
}
trap rollback EXIT
mv "$candidate" "$root/wp-content/themes/$next"
wp theme activate "$next" --quiet
wp sg purge
ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file /home/customer/ecowise-news-20261019/preflight/tools/validate-wordpress.php
curl --fail --silent --show-error https://ecowiseitaly.com/school-trips-italy/ -o "$bundle/school-after.html"
grep -q 'id="teacher-resources"' "$bundle/school-after.html"
grep -q 'id="school-evidence"' "$bundle/school-after.html"
for file in ecowise-italy-teacher-planning-pack.pdf ecowise-italy-school-travel-partner-brief.pdf; do
  curl --fail --silent --show-error "https://ecowiseitaly.com/wp-content/themes/$next/assets/documents/$file" -o "$bundle/$file"
  cmp "$bundle/$file" "$root/wp-content/themes/$next/assets/documents/$file"
done
trap - EXIT
echo 'EcoWise Italy 1.2.0 school sales release activated with teacher and partner resources.'
