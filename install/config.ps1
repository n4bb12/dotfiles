function Add-To-Path {
	param(
		[Parameter(Mandatory)]
		[string]$PathToAdd
	)

  $OldPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')

  if($OldPath -like "*$PathToAdd*") {
    Write-Host "$PathToAdd already exists in Path"
  } else {
    $NewPath = "$OldPath;$PathToAdd"
    $env:Path = "$NewPath"
    [Environment]::SetEnvironmentVariable("Path", "$NewPath", "Machine")
    Write-Host "$PathToAdd added to Path"
  }
}

Add-To-Path "C:\Users\Abraham\AppData\Local\Microsoft\WindowsApps"
Add-To-Path "C:\Program Files (x86)\Yarn\bin"
Add-To-Path "C:\Program Files\Git\bin"
Add-To-Path "C:\Program Files\Google\Chrome\Application"
Add-To-Path "C:\Program Files\MongoDB\CLI\bin"
Add-To-Path "C:\Program Files\MongoDB\Shell\bin"
Add-To-Path "C:\Program Files\MongoDB\Tools\100\bin"
Add-To-Path "C:\Program Files\PostgreSQL\13\bin"
Add-To-Path "D:\Tools\node-14"
Add-To-Path "D:\Tools\npm\global"
Add-To-Path "D:\Tools\yarn\bin"
Add-To-Path 'D:\Tools\pnpm\global'

Set-PSDebug -Trace 1

git config --global alias.lg 'log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
git config --global color.ui auto
git config --global core.attributesFile ~/.gitattributes
git config --global core.autocrlf false
git config --global core.editor 'code --wait'
git config --global core.eol lf
git config --global core.excludesfile ~/.gitignore
git config --global core.ignorecase false
git config --global diff.tool 'code'
git config --global difftool.code.cmd 'code --wait --diff $LOCAL $REMOTE'
git config --global fetch.prune true
git config --global log.date iso
git config --global pull.rebase true
git config --global push.default current
git config --global push.followTags true
git config --global rebase.autosquash true

npm config set cache 'D:\Tools\npm\cache'
npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set msvs_version 2019
npm config set prefix 'D:\Tools\npm\global'
npm config set progress true
npm config set python python2.7
npm config set shell bash

yarn config set prefix 'D:\Tools\yarn'
yarn config set cache-folder 'D:\Tools\yarn\cache'
yarn config set global-folder 'D:\Tools\yarn\global'

npm i -g pnpm
pnpm config set prefix 'D:\Tools\pnpm'
pnpm config set store-dir 'D:\Tools\pnpm\cache'
pnpm config set global-dir 'D:\Tools\pnpm\global'

Set-PSDebug -Trace 0

Write-Host "All apps were successfully configured."
Read-Host -Prompt "Press any key to continue"
