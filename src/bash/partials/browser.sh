#  
# 
#   Open Things in the Browser
# 
#   Examples
#     $ browser example.com
#     $ browser https://www.google.de/search?q=close+restaurants
#     $ browser
# 
#   (fallback to $BROWSER or system default browser)
# 
# ==========================================================

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
    warn "Chrome not found, using default browser."
    warn "You can speed open time by setting \$BROWSER."
    require-node-package "opn-cli"
  fi

  base="$1"
  shift
  input="$@"

  ("$browser" "$base$input" &)
}
