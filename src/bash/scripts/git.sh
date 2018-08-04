#  
# 
#   git config
#   https://git-scm.com/docs/git-config
# 
# ================================================

git config --global alias.amend "commit --amend --no-edit"
git config --global alias.chmod "update-index --chmod"
git config --global alias.fix "commit --fixup"
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
git config --global push.followTags true
