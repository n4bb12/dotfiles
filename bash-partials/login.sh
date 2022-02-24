require-binary 'git'

login() {
  git config --unset-all user.name
  git config --unset-all user.email

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

  git config user.name "Abraham Schilling"
  git config user.email
}
