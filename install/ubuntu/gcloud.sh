#!/usr/bin/env bash
set -euo pipefail

sudo apt-get install -y apt-transport-https ca-certificates gnupg curl sudo
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

if [ ! -f /etc/apt/sources.list.d/google-cloud-sdk.list ]; then
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
fi

sudo apt-get update && sudo apt-get install -y google-cloud-cli
gcloud config set disable_usage_reporting True
gcloud init
