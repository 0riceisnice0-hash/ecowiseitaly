#!/usr/bin/env bash
set -euo pipefail
bundle=/home/customer/ecowise-news-20261019
root=/home/customer/www/ecowiseitaly.com/public_html
theme="$root/wp-content/themes/ecowise-custom-v32"
cd "$root"
test "$(wp option get stylesheet)" = ecowise-custom-v32
ECOWISE_EXPECTED_URL=https://ecowiseitaly.com ECOWISE_EXPECTED_ADMIN_EMAIL=marketinghydron@gmail.com wp eval-file "$bundle/preflight/tools/validate-wordpress.php"
find "$theme" -name '*.php' -type f -print0 | xargs -0 -n1 php -l > "$bundle/php-lint.txt"
if [ ! -f "$bundle/current.sha256" ]; then cp "$bundle/before.sha256" "$bundle/current.sha256"; fi
(cd "$theme" && sha256sum -c "$bundle/current.sha256")
(cd "$bundle/candidate" && sha256sum -c "$bundle/after.sha256")
if [ ! -e "$bundle/backup" ]; then
  mkdir "$bundle/backup"
  while read -r digest name; do
    mkdir -p "$bundle/backup/$(dirname "$name")"
    cp -p "$theme/$name" "$bundle/backup/$name"
  done < "$bundle/before.sha256"
fi
(cd "$bundle/backup" && sha256sum -c "$bundle/before.sha256")
rollback() {
  code=$?
  if [ "$code" -ne 0 ]; then
    while read -r digest name; do cp -p "$bundle/backup/$name" "$theme/$name"; done < "$bundle/before.sha256"
    wp sg purge || true
  fi
  exit "$code"
}
trap rollback EXIT
while read -r digest name; do
  cp "$bundle/candidate/$name" "$theme/$name.ecowise-next"
  mv "$theme/$name.ecowise-next" "$theme/$name"
done < "$bundle/after.sha256"
(cd "$theme" && sha256sum -c "$bundle/after.sha256")
wp sg purge
curl --fail --silent --show-error https://ecowiseitaly.com/news/ -o "$bundle/news-after.html"
grep -q '1088675720460799' "$bundle/news-after.html"
trap - EXIT
echo 'News post published; seven original files retained in the deployment backup.'
