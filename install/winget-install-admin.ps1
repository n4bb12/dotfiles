$script = $PSScriptRoot + "\winget-install.ps1"

powershell Start-Process powershell -Verb runAs $script
