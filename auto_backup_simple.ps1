# Auto Backup Script - Simplified Version
param(
    [string]$SourcePath = "d:\Projects\HTML\growth\agents_growth_iraqcell.html",
    [string]$BackupFolder = "d:\Projects\HTML\growth\backups",
    [int]$MaxBackups = 10
)

Write-Host "=== Auto Backup Script ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

# Check if source file exists
if (-not (Test-Path $SourcePath)) {
    Write-Host "Error: Source file not found: $SourcePath" -ForegroundColor Red
    exit 1
}

# Create backup folder if it doesn't exist
if (-not (Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
    Write-Host "Created backup folder: $BackupFolder" -ForegroundColor Green
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$fileName = [System.IO.Path]::GetFileNameWithoutExtension($SourcePath)
$fileExtension = [System.IO.Path]::GetExtension($SourcePath)
$backupName = "${fileName}_backup_${timestamp}${fileExtension}"
$backupPath = "${BackupFolder}\${backupName}"

Write-Host "Creating backup..." -ForegroundColor Yellow
Write-Host "Source: $SourcePath" -ForegroundColor White
Write-Host "Destination: $backupPath" -ForegroundColor White

# Create backup
try {
    Copy-Item $SourcePath $backupPath -Force
    Write-Host "Backup created successfully: $backupName" -ForegroundColor Green
}
catch {
    Write-Host "Error creating backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean old backups
Write-Host "Cleaning old backups..." -ForegroundColor Yellow
$backupFiles = Get-ChildItem $BackupFolder -File | Where-Object { $_.Name -like "*_backup_*" } | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -gt $MaxBackups) {
    $filesToDelete = $backupFiles | Select-Object -Skip $MaxBackups
    foreach ($file in $filesToDelete) {
        Remove-Item $file.FullName -Force
        Write-Host "Deleted old backup: $($file.Name)" -ForegroundColor Yellow
    }
}

# Show backup info
$finalCount = (Get-ChildItem $BackupFolder -File | Where-Object { $_.Name -like "*_backup_*" }).Count
$totalSize = (Get-ChildItem $BackupFolder -File | Where-Object { $_.Name -like "*_backup_*" } | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "`n=== Backup Information ===" -ForegroundColor Cyan
Write-Host "Number of backups: $finalCount" -ForegroundColor White
Write-Host "Total size: $sizeInMB MB" -ForegroundColor White
Write-Host "Latest backup: $backupName" -ForegroundColor White

# Add to log
$logFile = "${BackupFolder}\backup_log.txt"
$logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Backup completed successfully - Source: $SourcePath"
Add-Content -Path $logFile -Value $logEntry -Encoding UTF8

Write-Host "`n=== Backup completed successfully ===" -ForegroundColor Green
