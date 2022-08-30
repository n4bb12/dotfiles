#
#
#   Simplifies working in environments with
#   multiple accounts.
#
# ================================================

export USER=$(whoami)

whoami() {
  account="$1"

  if [ ! -z "$account" ]; then
    require-binary "$account"
    shift
  fi

  if [ -z "$account" ]; then
    echo "$USER";
  elif [ "$account" = git ]; then
    echo "$(git config user.name) <$(git config user.email)>"
  elif [ "$account" = npm ]; then
    npm whoami "$@"
  elif [ "$account" = "yarn" ]; then
    yarn login "$@"
  elif [ "$account" = "pnpm" ]; then
    pnpm login "$@"
  elif [ "$account" = "heroku" ]; then
    heroku auth:whoami "$@"
  elif [ "$account" = "salesforce" ] || [ "$account" = "sf" ] || [ "$account" = "sfdx" ]; then
    sfdx force:org:list "$@"
  elif [ "$account" = "gcloud" ] || [ "$account" = "gcp" ]; then
    gcloud auth list "$@"
  elif [ "$account" = "kubectl" ]; then
    kubectl config current-context "$@"
  else
    fail "Unknown account: $account"
  fi
}
