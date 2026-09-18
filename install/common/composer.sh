#!/usr/bin/env bash
set -euo pipefail

expected="$(curl -fsSL https://composer.github.io/installer.sig)"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
actual="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

if [ "$expected" != "$actual" ]; then
  rm -f composer-setup.php
  echo "Composer installer checksum mismatch" >&2
  exit 1
fi

php composer-setup.php --quiet
rm -f composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
