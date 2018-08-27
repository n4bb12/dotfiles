#!/usr/bin/env bash

export DOT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export "PATH=$PATH:$DOT_ROOT/node_modules/.bin"

import() {
  source "$DOT_ROOT/bash/partials/$1.sh"
}

# --> /
import fs
import colors
import explorer

# --> colors
import env

# --> env
import git
import node-global
import whoami

# --> node-global
import angular
import bitly
import browser
import change-case
import clipboard
import docker
import free-port
import http-server
import kill
import npm
import npm-name-available
import open
import pnpm
import sort-package-json
import ssh-agent
import tldr
import tunnel
import typescript
import underscore
import words
import yarn

# --> browser
import web-google
import web-ids
import web-refs
import web-resources
import web-search
import web-sites
import web-tools
