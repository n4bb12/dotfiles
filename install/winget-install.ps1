Add-Type -AssemblyName "PresentationFramework"

function Install-Software {
	param(
		[Parameter(Mandatory)]
		[string]$file
	)

	foreach($line in Get-Content $file) {
    if($line -match $regex){
      Write-Output "winget install --silent --id $line"
      winget install --silent --id $line
    }
  }
}

$tools = $PSScriptRoot + "\winget-packages.txt"
$tools2 = $PSScriptRoot + "\winget-packages-optional.txt"

Install-Software -file $tools

$message = "Would you like to install optional apps? Click 'Yes' to continue."
$continue = [System.Windows.MessageBox]::Show($message, "Optional Apps", 'YesNo')

if ($continue -eq 'Yes') {
  Install-Software -file $tools2
}

Write-Host "All apps were successfully configured."
Read-Host -Prompt "Press any key to continue"
