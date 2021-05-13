$script = $PSScriptRoot + "\config.ps1"

powershell Start-Process powershell -Verb runAs $script
