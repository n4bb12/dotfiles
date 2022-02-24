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

bash install/git.sh
bash install/npm-windows.sh

Write-Host "All apps were successfully configured."
Read-Host -Prompt "Press any key to continue"
