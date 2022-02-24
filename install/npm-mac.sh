#!/usr/bin/env bash
set -ex

npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set python python2.7
npm config set shell bash
npm config set msvs_version 2019
npm config delete prefix
npm config delete cache

npm i -g yarn
yarn config delete prefix
yarn config delete cache-folder
yarn config delete global-folder

npm i -g pnpm
pnpm config delete prefix
pnpm config delete store-dir
pnpm config delete global-dir
