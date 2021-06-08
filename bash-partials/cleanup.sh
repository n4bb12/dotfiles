require-binary 'docker'

cleanup() {
  command="$1"
  shift

  if [ "$command" == "docker" ]; then
    docker system prune -a "$@"
  fi
}
