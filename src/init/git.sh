#  
# 
#   git config
#   https://git-scm.com/docs/git-config
# 
# ================================================

git config --global core.autocrlf false
git config --global core.editor "code --wait"
git config --global diff.tool "vs-code"
git config --global difftool.cmd "code --wait --diff $LOCAL $REMOTE"
git config --global push.default simple
git config --global push.followTags true
