#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

function add-to-path() {
  directory="$1"

  if [ -d "$directory" ]; then
    if [[ ":$PATH:" != *":$directory:"* ]]; then
      PATH="${PATH:+"$PATH:"}$directory"
      setx PATH "$PATH"
    fi
  else
    echo "Directory '$directory' doesn't exist."
  fi
}

add-to-path 'C:\Users\Abraham\AppData\Local\Microsoft\WindowsApps'
add-to-path 'C:\Program Files (x86)\Yarn\bin'
add-to-path 'C:\Program Files\Git\bin'
add-to-path 'C:\Program Files\Google\Chrome\Application'
add-to-path 'C:\Program Files\MongoDB\CLI\bin'
add-to-path 'C:\Program Files\MongoDB\Shell\bin'
add-to-path 'C:\Program Files\MongoDB\Tools\100\bin'
add-to-path 'C:\Program Files\PostgreSQL\13\bin'
add-to-path 'D:\Tools\node-14'
add-to-path 'D:\Tools\npm\global'
add-to-path 'D:\Tools\yarn\bin'
add-to-path 'D:\Tools\pnpm\global'

echo 'All apps were successfully configured."'
