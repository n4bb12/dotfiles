# Start SSH Agent
#----------------------------

SSH_ENV="$HOME/.ssh/environment"

function run_ssh_env {
  if [ -f "${SSH_ENV}" ]; then
    . "${SSH_ENV}" > /dev/null
  fi
}

function start_ssh_agent {
  echo 'Initializing new SSH agent...'
  ssh-agent | sed 's/^echo/#echo/' > "${SSH_ENV}"
  echo 'succeeded'
  chmod 600 "${SSH_ENV}"
  run_ssh_env;
  if [ -f ~/.ssh/id_rsa ]; then
    ssh-add ~/.ssh/id_rsa;
  fi
}

if [ -f "${SSH_ENV}" ]; then
  run_ssh_env;
  ps -ef | grep ${SSH_AGENT_PID} | grep ssh-agent$ > /dev/null || {
    start_ssh_agent;
  }
else
  start_ssh_agent;
fi
