<#
.SYNOPSIS
  Script Đồng Bộ 2 Chiều Antigravity & Bài Giảng Video (Windows)
.DESCRIPTION
  Dùng 1 lệnh duy nhất để đồng bộ toàn bộ 43 skills, não bộ, lịch sử chat và bài giảng video giữa Mac và Windows.
#>

param (
    [switch]$Pull,
    [switch]$Push
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonExe = "python"

if (-not (Get-Command $PythonExe -ErrorAction SilentlyContinue)) {
    Write-Host "Khong tim thay Python! Vui long cai dat Python." -ForegroundColor Red
    exit 1
}

$DongBoPy = Join-Path $ScriptDir "dong_bo.py"
if (-not (Test-Path $DongBoPy)) {
    $DongBoPy = "$env:USERPROFILE\Documents\CODE\antigravity-config-backup\dong_bo.py"
}

if ($Pull) {
    & $PythonExe $DongBoPy --pull
} elseif ($Push) {
    & $PythonExe $DongBoPy --push
} else {
    Write-Host "=== DONG BO ANTIGRAVITY & BAI GIANG VIDEO ===" -ForegroundColor Cyan
    Write-Host "1. Keo du lieu ve may:  .\dong_bo.ps1 -Pull"
    Write-Host "2. Day du lieu len Git: .\dong_bo.ps1 -Push"
}
