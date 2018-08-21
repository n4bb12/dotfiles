#
#
#   Websites
#
# ==========================================================
circleci() { browser 'https://circleci.com/gh/n4bb12' "$@"; }
contacts() { browser 'https://contacts.google.com' "$@"; }
dango() { browser 'https://getdango.com/interactive/?banner=0' "$@"; }
escape() { browser 'http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php' "$@"; }
github() { browser 'https://github.com/n4bb12' "$@"; }
gitlab() { browser 'https://gitlab.com/n4bb12' "$@"; }
mail() { browser 'https://mail.google.com' "$@"; }
music() { browser 'https://music.youtube.com' "$@"; }
pull-requests() { browser 'https://github.com/pulls' "$@"; }
wallpapers() { browser 'https://interfacelift.com/wallpaper/downloads/date/wide_16:9/3840x2160/' "$@"; }
youtube() { browser 'https://www.youtube.com' "$@"; }
alias ci='circleci'
alias gh='github'
alias gl='gitlab'
alias prs='pull-requests'
alias yt='youtube'