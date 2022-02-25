$script = $PSScriptRoot + "\winget-install.ps1"

PowerShell Start-Process PowerShell -Verb RunAs $script
