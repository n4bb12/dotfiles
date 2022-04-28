#!/usr/bin/env bash
set -ex

npm i -g yarn pnpm

npm config delete prefix
npm config delete cache
yarn config -s delete prefix
yarn config -s delete cache-folder
yarn config -s delete global-folder
pnpm config delete prefix
pnpm config delete store-dir
pnpm config delete global-dir

npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set python python2.7
npm config set shell bash
npm config set msvs_version 2019

npm config set prefix 'D:\Tools\npm\global'
npm config set cache 'D:\Tools\npm\cache'
yarn config -s set prefix 'D:\Tools\yarn'
yarn config -s set cache-folder 'D:\Tools\yarn\cache'
yarn config -s set global-folder 'D:\Tools\yarn\global'
pnpm config set prefix 'D:\Tools\pnpm'
pnpm config set store-dir 'D:\Tools\pnpm\cache'
pnpm config set global-dir 'D:\Tools\pnpm\global'
