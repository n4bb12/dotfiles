#!/usr/bin/env bash
set -euo pipefail

export PATH=~/go/bin:$PATH
go install github.com/six-ddc/plow@latest
