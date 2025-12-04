# Database Backup Script - Simplified Version
param(
    [string]$BackupFolder = "d:\Projects\HTML\growth\database_backups",
    [switch]$IncludeLocalStorage = $true
)

Write-Host "=== Database Backup Script ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

# Create backup folder if it doesn't exist
if (-not (Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
    Write-Host "Created backup folder: $BackupFolder" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Create localStorage export script
if ($IncludeLocalStorage) {
    Write-Host "Creating localStorage export script..." -ForegroundColor Yellow
    
    $exportScript = @"
<!DOCTYPE html>
<html>
<head>
    <title>تصدير localStorage</title>
</head>
<body>
    <script>
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            localStorageData[key] = localStorage.getItem(key);
        }
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: localStorageData,
            metadata: {
                itemCount: localStorage.length,
                exportDate: new Date().toLocaleString('ar-SA'),
                userAgent: navigator.userAgent
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'localStorage_backup_${timestamp}.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('تم تصدير localStorage بنجاح');
    </script>
</body>
</html>
"@
    
    $exportFile = "${BackupFolder}\export_localStorage_${timestamp}.html"
    $exportScript | Out-File -FilePath $exportFile -Encoding UTF8
    
    Write-Host "Created localStorage export script: $exportFile" -ForegroundColor Green
    Write-Host "Open the file in browser to export data" -ForegroundColor Cyan
}

# Create backup info
$backupInfo = @{
    timestamp = $timestamp
    created = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    files = @()
}

if ($IncludeLocalStorage) {
    $backupInfo.files += "export_localStorage_${timestamp}.html"
}

# Save backup info
$infoFile = "${BackupFolder}\backup_info_${timestamp}.json"
$backupInfo | ConvertTo-Json | Out-File -FilePath $infoFile -Encoding UTF8

# Add to log
$logFile = "${BackupFolder}\backup_log.txt"
$logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Database backup script completed - Files: $($backupInfo.files.Count)"
Add-Content -Path $logFile -Value $logEntry -Encoding UTF8

Write-Host "`n=== Database backup completed successfully ===" -ForegroundColor Green
Write-Host "Files created: $($backupInfo.files.Count)" -ForegroundColor White
Write-Host "Backup folder: $BackupFolder" -ForegroundColor White
