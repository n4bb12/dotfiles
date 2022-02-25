#!/usr/bin/env bash
set -ex

npm i -g yarn pnpm

npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set python python2.7
npm config set shell bash
npm config set msvs_version 2019
npm config set prefix 'D:\Tools\npm\global'
npm config set cache 'D:\Tools\npm\cache'

yarn config set prefix 'D:\Tools\yarn'
yarn config set cache-folder 'D:\Tools\yarn\cache'
yarn config set global-folder 'D:\Tools\yarn\global'

pnpm config set prefix 'D:\Tools\pnpm'
pnpm config set store-dir 'D:\Tools\pnpm\cache'
pnpm config set global-dir 'D:\Tools\pnpm\global'
