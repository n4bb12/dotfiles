#!/usr/bin/env bash
set -ex

npm i -g yarn pnpm

npm config delete cache
npm config delete msvs_version
npm config delete prefix
npm config delete python
npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set shell bash

yarn config unset cacheFolder
yarn config unset globalFolder

pnpm config delete prefix
pnpm config delete store-dir
pnpm config delete global-dir
