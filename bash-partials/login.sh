require-binary 'git'

login() {
  git config --unset-all user.name
  git config --unset-all user.email

  git config user.email "Abraham Schilling"

  case $1 in
    foobar)
      git config user.email "abraham@foobar.agency"
      ;;
    senacor)
      git config user.email "abraham.schilling@senacor.com"
      ;;
    *)
      git config user.email "AbrahamSchilling@gmail.com"
      ;;
  esac

  echo "$(git config user.name) <$(git config user.email)>"
}
