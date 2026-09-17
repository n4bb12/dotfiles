## WSL VHDX kompaktieren

Cleanup script ausführen.

Danach **Docker Desktop schließen** und **alle WSL-Terminals / VSCode-WSL-Sessions schließen**.

Anschließend in **PowerShell als Administrator**:

```powershell
param(
    [string]$Distro = "Ubuntu"
)

$ErrorActionPreference = "Stop"

wsl.exe --shutdown

$key = Get-ChildItem "HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss" |
    Where-Object { $_.GetValue("DistributionName") -eq $Distro } |
    Select-Object -First 1

if (-not $key) {
    throw "Distro '$Distro' nicht gefunden."
}

$basePath = $key.GetValue("BasePath") -replace '^\\\\\?\\', ''
$vhd = Join-Path $basePath "ext4.vhdx"

if (-not (Test-Path -LiteralPath $vhd)) {
    throw "VHDX nicht gefunden: $vhd"
}

$before = (Get-Item -LiteralPath $vhd).Length

$temp = Join-Path $env:TEMP "wsl-compact.txt"

@"
select vdisk file="$vhd"
compact vdisk
exit
"@ | Set-Content -LiteralPath $temp -Encoding ASCII

diskpart.exe /s $temp

Remove-Item $temp -Force

$after = (Get-Item -LiteralPath $vhd).Length

"VHDX:    $vhd"
"Vorher:  {0:N1} GB" -f ($before / 1GB)
"Nachher: {0:N1} GB" -f ($after / 1GB)
"Gespart: {0:N1} GB" -f (($before - $after) / 1GB)
```
