#
#
#   Docker
#   https://docs.docker.com/
#
# ==========================================================

require-binary 'docker'

# Turn off POSIX-to-Windows path mangling
# https://github.com/git-for-windows/build-extra/blob/master/ReleaseNotes.md#new-features-61
alias       docker='MSYS_NO_PATHCONV=1 docker'
