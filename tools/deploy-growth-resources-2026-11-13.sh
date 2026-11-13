#!/usr/bin/env bash
set -euo pipefail
bundle=/home/customer/ecowise-growth-20261113
root=/home/customer/www/ecowiseitaly.com/public_html
cd "$root"
test "$(wp option get stylesheet)" = ecowise-custom-v34
test "$(sha256sum "$bundle/ecowise-custom-theme-2026-11-13-v35.zip" | cut -d ' ' -f 1)" = b1c67e62e0cdc0a7624d0f2e02cb6feee9e8702ce498c25397bc0e1349e60c6e
test ! -e wp-content/themes/ecowise-custom-v35
ECOWISE_REPOSITORY_ROOT=/home/customer/ecowise-news-20261019/preflight ECOWISE_EXPECTED_PAGES=31 ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file "$bundle/validate-wordpress.php"
wp db export "$bundle/pre-deploy-database.sql" --quiet
mkdir "$bundle/candidate"
unzip -q "$bundle/ecowise-custom-theme-2026-11-13-v35.zip" -d "$bundle/candidate"
find "$bundle/candidate" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"
rollback() {
  code=$?
  if [ "$code" -ne 0 ]; then
    wp eval 'foreach(array("planning-a-school-trip-to-italy","school-travel-partners") as $slug){$p=get_page_by_path($slug);if($p && get_post_meta($p->ID,"_ecowise_resource_owned",true)){wp_update_post(array("ID"=>$p->ID,"post_status"=>"draft"));}}' || true
    wp theme activate ecowise-custom-v34 --quiet || true
    wp sg purge || true
  fi
  exit "$code"
}
trap rollback EXIT
mv "$bundle/candidate/ecowise-custom" wp-content/themes/ecowise-custom-v35
wp theme activate ecowise-custom-v35 --quiet
wp eval-file "$bundle/provision-growth-resources.php"
wp sg purge
ECOWISE_REPOSITORY_ROOT=/home/customer/ecowise-news-20261019/preflight ECOWISE_EXPECTED_PAGES=33 ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file "$bundle/validate-wordpress.php"
wp eval-file "$bundle/test-acquisition.php"
for route in planning-a-school-trip-to-italy school-travel-partners; do
  curl --fail --silent --show-error "https://ecowiseitaly.com/$route/" -o "$bundle/$route.html"
  grep -q 'eco-resource-page' "$bundle/$route.html"
  grep -q 'BreadcrumbList' "$bundle/$route.html"
done
trap - EXIT
echo 'EcoWise Italy 1.4.0 active, two resource pages published and measurements verified.'
