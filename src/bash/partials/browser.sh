#  
# 
#   Open Things in the Browser
# 
#   Examples
#     $ browser example.com
#     $ browser https://www.google.de/search?q=restaurants
#     $ browser
# 
#   (fallback to $BROWSER or system default browser)
# 
# ==========================================================

require-node-package 'urlencode-cli'

url-encode() {
  input=$(cat -)
  urlencode "$input"
}

browser() {
  if [ ! -z $BROWSER ]; then
    browser="$BROWSER"
    require-binary "$BROWSER"
  elif command -v chrome > /dev/null 2>&1; then
    browser=chrome
  elif command -v google-chrome > /dev/null 2>&1; then
    browser=google-chrome
  else
    browser=opn
    warn 'Chrome not found, using default browser.'
    warn "You can speed open time by setting \$BROWSER."
    require-node-package 'opn-cli'
  fi

  domain="$1"
  shift
  path=$(echo "$@" | url-encode)

  ("$browser" "$domain$path" &)
}

alias b='browser'
alias g='browser'
