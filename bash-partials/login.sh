require-binary 'git'

login() {
  git config --unset-all user.name
  git config --unset-all user.email

  case $1 in
    foobar)
      git config user.email "abraham@foobar.agency"
      git config user.name "Abraham Schilling"
      ;;
    *)
      git config user.email "AbrahamSchilling@gmail.com"
      git config user.name "Abraham Schilling"
      ;;
  esac

  git config user.name
  git config user.email
}
