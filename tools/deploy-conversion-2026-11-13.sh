#!/usr/bin/env bash
set -euo pipefail
bundle=/home/customer/ecowise-conversion-20261113
root=/home/customer/www/ecowiseitaly.com/public_html
cd "$root"
test "$(wp option get stylesheet)" = ecowise-custom-v35
test "$(sha256sum "$bundle/ecowise-custom-theme-2026-11-13-v36.zip" | cut -d ' ' -f 1)" = eeaa8958a2df1e8b75949bc483ec01b0a706a87915f5f05bd4fec96366ef1e11
test ! -e wp-content/themes/ecowise-custom-v36
ECOWISE_REPOSITORY_ROOT=/home/customer/ecowise-news-20261019/preflight ECOWISE_EXPECTED_PAGES=33 ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file "$bundle/validate-wordpress.php"
wp db export "$bundle/pre-deploy-database.sql" --quiet
mkdir "$bundle/candidate"
unzip -q "$bundle/ecowise-custom-theme-2026-11-13-v36.zip" -d "$bundle/candidate"
find "$bundle/candidate" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"
rollback() { code=$?; if [ "$code" -ne 0 ]; then wp theme activate ecowise-custom-v35 --quiet || true; wp sg purge || true; fi; exit "$code"; }
trap rollback EXIT
mv "$bundle/candidate/ecowise-custom" wp-content/themes/ecowise-custom-v36
wp theme activate ecowise-custom-v36 --quiet
wp sg purge
ECOWISE_REPOSITORY_ROOT=/home/customer/ecowise-news-20261019/preflight ECOWISE_EXPECTED_PAGES=33 ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file "$bundle/validate-wordpress.php"
wp eval-file "$bundle/test-acquisition.php"
curl --fail --silent --show-error https://ecowiseitaly.com/family-ecoadventures/ -o "$bundle/family-after.html"
grep -q 'ecowise-customer-cta' "$bundle/family-after.html"
grep -q 'interest=family' "$bundle/family-after.html"
curl --fail --silent --show-error https://ecowiseitaly.com/corporate-team-building-vacation/ -o "$bundle/corporate-after.html"
grep -q 'interest=corporate' "$bundle/corporate-after.html"
trap - EXIT
echo 'EcoWise Italy 1.4.1 customer conversion release active.'
