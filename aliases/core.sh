# ENV ==================================

export USER=$(whoami)

# COLORS ===============================

  black="\e[30m"
    red="\e[31m"
  green="\e[32m"
 yellow="\e[33m"
   blue="\e[34m"
magenta="\e[35m"
   cyan="\e[36m"
   gray="\e[37m"
  reset="\e[39m"

fail() {
  printf "${red}${@}${reset}\n"
  return 1
}

warn() {
  printf "${yellow}${@}${reset}\n"
}

# NAVIGATION ===========================

alias l='ls'
alias ll='ls -aFhl --group-directories-first'

alias ~='cd ~'
alias ..='cd ..'
alias ..1='cd ..'
alias ..2='cd ../..'
alias ..3='cd ../../..'
alias ..4='cd ../../../..'
alias ..5='cd ../../../../..'

# NPM/YARN/PNPM ========================

alias npm="corepack npm"
alias npx="corepack npx"
alias pnpm="corepack pnpm"
alias pnpx="corepack pnpx"
alias yarn="corepack yarn"
alias yarnpkg="corepack yarnpkg"

alias yip='yarn install --production --ignore-scripts --prefer-offline'
alias yup='yarn upgrade'
alias yupi='yarn upgrade-interactive'
alias yupl='yarn upgrade --latest'
alias yupil='yarn upgrade-interactive --latest'

# MORE ALIASES =========================

alias open='open-cli'

alias scripts='cat package.json | fx .scripts'
alias deps='cat package.json | fx .dependencies'
alias devdeps='cat package.json | fx .devDependencies'

alias bp='bundle-phobia'
alias psize='bundle-phobia'
alias phobia='bundle-phobia'

alias idea="idea64"

alias kill='fkill --force'

alias clip='clip.exe'

alias ncuui='ncu -u -i'
alias deps='ncuui'

# FUNCTIONS ============================

# Create a new directory and enter it
mkcd() {
  mkdir -p "$@"
	cd "$_"
}

size() {
  if du -b /dev/null > /dev/null 2>&1; then
    local arg=-sbh;
  else
    local arg=-sh;
  fi
  if [[ -n "$@" ]]; then
    du $arg -- "$@";
  else
    du $arg .[^.]* ./*;
  fi;
}

slug() {
  if (( $# == 0 )) ; then
    input=$(cat -)
    slugify "$input"
  else
    slugify "$1"
  fi
}

free-name() {
  all-the-package-names | grep -E "^${1}$" > /dev/null
  status="$?"

  if [ "$status" -ne '0' ]; then
    echo -e Package name "${green}${1}${reset}" is available!
  else
    echo -e Package name "${red}${1}${reset}" is already in use: \
      "${cyan}https://www.npmjs.com/package/${1}${reset}"
  fi
}

cleanup_command() {
  echo
  echo "$@"
  set -x
  "$@"
  set +x
}

cleanup() {
  before=$(df -h / | tail -1 | awk '{print $3}')

  cleanup_command npm cache clean -f
  cleanup_command pnpm store prune -f
  cleanup_command yarn cache clean -f
  cleanup_command docker system prune -a -f

  cleanup_command rm -rf ~/.local/share/pnpm/
  cleanup_command rm -rf ~/.npm/_npx/
  cleanup_command rm -rf ~/.yarn/berry/store/

  cleanup_command find ~ -type d -name ".cache" -exec rm -rf {} +

  cleanup_command sudo apt autoremove
  cleanup_command sudo apt clean

  after=$(df -h / | tail -1 | awk '{print $3}')
  echo
  echo "Cleanup complete. Space available before: $before, after: $after"
}

zerofill() {
  set -x
  sudo dd if=/dev/zero of=zero.fill bs=1M
  sudo rm zero.fill
  set +x

  echo "To optimize the VHDX file, run in PowerShell:"
  echo "wsl --shutdown"
  echo "wsl -l -v"
  echo "Optimize-VHD -Path "C:\wsl\Ubuntu\ext4.vhdx" -Mode Full"
}

# Why did I need this?
#
# aws_login() {
#   unset AWS_ACCESS_KEY_ID
#   unset AWS_SECRET_ACCESS_KEY
#   unset AWS_SESSION_TOKEN

#   json=$(aws sts get-session-token --serial-number arn:aws:iam::693991698473:mfa/abraham.schilling --token-code "$1")

#   export AWS_ACCESS_KEY_ID=$(echo "$json" | fx .Credentials.AccessKeyId)
#   export AWS_SECRET_ACCESS_KEY=$(echo "$json" | fx .Credentials.SecretAccessKey)
#   export AWS_SESSION_TOKEN=$(echo "$json" | fx .Credentials.SessionToken)
# }

# LOGIN ================================

login() {
  account="$1"

	# git
	# https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
  if [ "$account" = git ]; then
    echo "Your git user is: $(git config user.name) <$(git config user.email)>"
		echo "To change your git user, run: switch <name>"

	# npm
	# https://docs.npmjs.com/cli/v9/commands/npm-login
	elif [ "$account" = npm ]; then
    npm login "$@"

	# yarn
	# https://yarnpkg.com/cli/npm/login
	elif [ "$account" = "yarn" ]; then
    yarn npm login "$@"

	# pnpm
	elif [ "$account" = "pnpm" ]; then
    pnpm login "$@"

	# aws
	# https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html
  elif [ "$account" = "aws" ]; then
    aws configure "$@"

	# gcloud
	# https://cloud.google.com/sdk/gcloud/reference/auth/login
	elif [ "$account" = "gcloud" ] || [ "$account" = "gcp" ]; then
    gcloud auth login "$@"

	# heroku
	# https://devcenter.heroku.com/articles/authentication
	elif [ "$account" = "heroku" ]; then
    heroku login "$@"

	# vercel
	# https://vercel.com/docs/cli#commands/login
	elif [ "$account" = "vercel" ]; then
    vercel login "$@"

	# salesforce
	# https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_auth_web.htm
	elif [ "$account" = "salesforce" ] || [ "$account" = "sf" ] || [ "$account" = "sfdx" ]; then
    sfdx auth:web:login "$@"

	# kubectl
	# https://kubernetes.io/docs/reference/kubectl/#in-cluster-authentication-and-namespace-overrides
  elif [ "$account" = "kubectl" ]; then
    kubectl config set-context --current "$@"

	else
    echo -e "Unknown account: ${red}${account}${reset}"
  fi
}

who() {
  account="$1"

  if [ ! -z "$account" ]; then
    shift
  fi

  if [ -z "$account" ]; then
    whoami

	elif [ "$account" = git ]; then
    echo "$(git config user.name) <$(git config user.email)>"

	elif [ "$account" = npm ]; then
    npm whoami "$@"

	elif [ "$account" = "yarn" ]; then
    yarn login "$@"

	elif [ "$account" = "pnpm" ]; then
    pnpm login "$@"

	elif [ "$account" = "aws" ]; then
		aws iam get-user

	elif [ "$account" = "gcloud" ] || [ "$account" = "gcp" ]; then
    gcloud auth list
    gcloud config get project

	elif [ "$account" = "heroku" ]; then
    heroku auth:whoami "$@"

	elif [ "$account" = "vercel" ]; then
    vercel whoami "$@"

	elif [ "$account" = "salesforce" ] || [ "$account" = "sf" ] || [ "$account" = "sfdx" ]; then
    sfdx force:org:list "$@"

	elif [ "$account" = "kubectl" ]; then
    kubectl config current-context "$@"
  else
    echo -e "Unknown account: ${red}${account}${reset}"
  fi
}
