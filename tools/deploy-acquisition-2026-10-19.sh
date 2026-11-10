#!/usr/bin/env bash
set -euo pipefail
bundle=/home/customer/ecowise-acquisition-20261019
root=/home/customer/www/ecowiseitaly.com/public_html
cd "$root"
test "$(wp option get stylesheet)" = ecowise-custom-v33
test "$(sha256sum "$bundle/ecowise-custom-theme-2026-10-19-v34.zip" | cut -d ' ' -f 1)" = 256821b2e4c4eee22e3a996678fd1088e0c1851435c06517f16e7a560c309757
if [ ! -d wp-content/themes/ecowise-custom-v34 ]; then
  mkdir -p "$bundle/candidate"
  unzip -q "$bundle/ecowise-custom-theme-2026-10-19-v34.zip" -d "$bundle/candidate"
  find "$bundle/candidate" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"
  mv "$bundle/candidate/ecowise-custom" wp-content/themes/ecowise-custom-v34
fi
ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file /home/customer/ecowise-news-20261019/preflight/tools/validate-wordpress.php
if [ ! -f "$bundle/pre-deploy-database.sql" ]; then wp db export "$bundle/pre-deploy-database.sql" --quiet; fi
rollback() { code=$?; if [ "$code" -ne 0 ]; then wp theme activate ecowise-custom-v33 --quiet || true; wp sg purge || true; fi; exit "$code"; }
trap rollback EXIT
wp theme activate ecowise-custom-v34 --quiet
wp sg purge
ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file /home/customer/ecowise-news-20261019/preflight/tools/validate-wordpress.php
wp eval-file "$bundle/test-acquisition.php"
curl --fail --silent --show-error https://ecowiseitaly.com/for-schools/science-field-work-data-collection-trips/ -o "$bundle/fieldwork.html"
grep -q 'IB Biology &amp; ESS Fieldwork Trips' "$bundle/fieldwork.html"
grep -q 'ecowiseAcquisition' "$bundle/fieldwork.html"
grep -q 'IB biology and environmental studies fieldwork in Italy' "$bundle/fieldwork.html"
trap - EXIT
echo 'Acquisition release 1.3.0 active; SEO, form and aggregate measurement verified.'
