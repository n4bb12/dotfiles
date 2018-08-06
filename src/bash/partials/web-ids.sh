#
#
#   Profile Pages
#
# ==========================================================
id() {
  args="$@"
  command="$1"
  shift
  rest="$@"

  if false; then echo false
  elif [ "$command" == "gh" ]; then
    id github "$rest"
  elif [ "$command" == "github" ]; then
    browser 'https://github.com/n4bb12' "$rest"
  elif [ "$command" == "gitlab" ]; then
    browser 'https://gitlab.com/n4bb12' "$rest"
  elif [ "$command" == "gl" ]; then
    id gitlab "$rest"
  else
    echo Unknown id "$args"
  fi
}