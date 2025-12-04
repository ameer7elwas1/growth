# سكريبت النسخ الاحتياطي لقاعدة البيانات
# Database Backup Script for Supabase

param(
    [string]$SupabaseUrl = "",
    [string]$SupabaseKey = "",
    [string]$BackupFolder = "d:\Projects\HTML\growth\database_backups",
    [int]$MaxBackups = 10,
    [switch]$IncludeLocalStorage = $true,
    [switch]$Compress = $true,
    [switch]$Verbose = $false
)

# إعدادات الألوان
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Get-Timestamp {
    return Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
}

function Test-BackupFolder {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        try {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
            Write-ColorOutput "تم إنشاء مجلد نسخ قاعدة البيانات: $Path" $SuccessColor
            return $true
        }
        catch {
            Write-ColorOutput "خطأ في إنشاء مجلد النسخ الاحتياطية: $($_.Exception.Message)" $ErrorColor
            return $false
        }
    }
    return $true
}

function Export-SupabaseData {
    param(
        [string]$SupabaseUrl,
        [string]$SupabaseKey,
        [string]$BackupDir,
        [string]$Timestamp
    )
    
    try {
        Write-ColorOutput "تصدير البيانات من Supabase..." $InfoColor
        
        # قائمة الجداول للتصدير
        $tables = @("users", "agents", "sales", "transactions", "reports")
        $exportedData = @{}
        
        foreach ($table in $tables) {
            try {
                Write-ColorOutput "تصدير جدول: $table" $InfoColor
                
                # استخدام Supabase REST API لتصدير البيانات
                $headers = @{
                    "apikey" = $SupabaseKey
                    "Authorization" = "Bearer $SupabaseKey"
                    "Content-Type" = "application/json"
                }
                
                $url = "$SupabaseUrl/rest/v1/$table"
                $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers -ErrorAction Stop
                
                $exportedData[$table] = $response
                Write-ColorOutput "تم تصدير $($response.Count) سجل من جدول $table" $SuccessColor
            }
            catch {
                Write-ColorOutput "تحذير: فشل في تصدير جدول $table - $($_.Exception.Message)" $WarningColor
                $exportedData[$table] = @()
            }
        }
        
        # حفظ البيانات المصدرة
        $backupFile = "${BackupDir}\supabase_data_${timestamp}.json"
        $exportedData | ConvertTo-Json -Depth 10 | Out-File -FilePath $backupFile -Encoding UTF8
        
        Write-ColorOutput "تم حفظ بيانات Supabase في: $backupFile" $SuccessColor
        return $backupFile
    }
    catch {
        Write-ColorOutput "خطأ في تصدير بيانات Supabase: $($_.Exception.Message)" $ErrorColor
        return $null
    }
}

function Export-LocalStorageData {
    param(
        [string]$BackupDir,
        [string]$Timestamp
    )
    
    try {
        Write-ColorOutput "تصدير بيانات localStorage..." $InfoColor
        
        # إنشاء ملف HTML لتصدير localStorage
        $exportScript = @"
<!DOCTYPE html>
<html>
<head>
    <title>تصدير localStorage</title>
</head>
<body>
    <script>
        // تصدير جميع بيانات localStorage
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            localStorageData[key] = localStorage.getItem(key);
        }
        
        // تحويل إلى JSON وتنزيل
        const dataStr = JSON.stringify(localStorageData, null, 2);
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
        
        $exportFile = "${BackupDir}\export_localStorage_${timestamp}.html"
        $exportScript | Out-File -FilePath $exportFile -Encoding UTF8
        
        Write-ColorOutput "تم إنشاء سكريبت تصدير localStorage: $exportFile" $SuccessColor
        Write-ColorOutput "افتح الملف في المتصفح لتصدير البيانات" $InfoColor
        
        return $exportFile
    }
    catch {
        Write-ColorOutput "خطأ في إنشاء سكريبت تصدير localStorage: $($_.Exception.Message)" $ErrorColor
        return $null
    }
}

function Create-DatabaseBackup {
    param(
        [string]$BackupDir,
        [string]$Timestamp,
        [bool]$CompressBackup
    )
    
    try {
        $backupName = "database_backup_${timestamp}"
        
        if ($CompressBackup) {
            $backupPath = "${BackupDir}\${backupName}.zip"
            
            # جمع جميع ملفات النسخ الاحتياطي
            $filesToCompress = Get-ChildItem $BackupDir -File | Where-Object { $_.Name -like "*_${timestamp}*" }
            
            if ($filesToCompress.Count -gt 0) {
                Compress-Archive -Path $filesToCompress.FullName -DestinationPath $backupPath -Force
                
                # حذف الملفات الأصلية بعد الضغط
                $filesToCompress | Remove-Item -Force
                
                Write-ColorOutput "تم إنشاء النسخة الاحتياطية المضغوطة: $backupPath" $SuccessColor
                return $backupPath
            }
        }
        else {
            Write-ColorOutput "تم إنشاء النسخة الاحتياطية في مجلد: $BackupDir" $SuccessColor
            return $BackupDir
        }
    }
    catch {
        Write-ColorOutput "خطأ في إنشاء النسخة الاحتياطية: $($_.Exception.Message)" $ErrorColor
        return $null
    }
}

function Remove-OldDatabaseBackups {
    param(
        [string]$BackupDir,
        [int]$MaxCount
    )
    
    try {
        $backupFiles = Get-ChildItem $BackupDir -File | Where-Object { $_.Name -like "*database_backup_*" } | Sort-Object LastWriteTime -Descending
        
        if ($backupFiles.Count -gt $MaxCount) {
            $filesToDelete = $backupFiles | Select-Object -Skip $MaxCount
            
            foreach ($file in $filesToDelete) {
                Remove-Item $file.FullName -Force
                Write-ColorOutput "تم حذف النسخة القديمة: $($file.Name)" $WarningColor
            }
            
            Write-ColorOutput "تم تنظيف النسخ القديمة. العدد الحالي: $($backupFiles.Count - $filesToDelete.Count)" $InfoColor
        }
    }
    catch {
        Write-ColorOutput "خطأ في تنظيف النسخ القديمة: $($_.Exception.Message)" $ErrorColor
    }
}

function Show-DatabaseBackupInfo {
    param([string]$BackupDir)
    
    $backupFiles = Get-ChildItem $BackupDir -File | Where-Object { $_.Name -like "*database_backup_*" }
    $totalSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-ColorOutput "`n=== معلومات نسخ قاعدة البيانات ===" $InfoColor
    Write-ColorOutput "عدد النسخ الاحتياطية: $($backupFiles.Count)" $InfoColor
    Write-ColorOutput "الحجم الإجمالي: $sizeInMB MB" $InfoColor
    
    if ($backupFiles.Count -gt 0) {
        $latestBackup = $backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-ColorOutput "أحدث نسخة: $($latestBackup.Name)" $InfoColor
    }
}

# بداية السكريبت الرئيسي
Write-ColorOutput "`n=== بدء النسخ الاحتياطي لقاعدة البيانات ===" $InfoColor
Write-ColorOutput "الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $InfoColor

# التحقق من مجلد النسخ الاحتياطية
if (-not (Test-BackupFolder $BackupFolder)) {
    exit 1
}

$timestamp = Get-Timestamp
$backupResults = @()

# تصدير بيانات Supabase إذا كانت المعلومات متوفرة
if ($SupabaseUrl -and $SupabaseKey) {
    $supabaseBackup = Export-SupabaseData -SupabaseUrl $SupabaseUrl -SupabaseKey $SupabaseKey -BackupDir $BackupFolder -Timestamp $timestamp
    if ($supabaseBackup) {
        $backupResults += $supabaseBackup
    }
}
else {
    Write-ColorOutput "تحذير: لم يتم توفير معلومات Supabase. تخطي تصدير قاعدة البيانات السحابية" $WarningColor
}

# تصدير بيانات localStorage إذا كان مطلوباً
if ($IncludeLocalStorage) {
    $localStorageBackup = Export-LocalStorageData -BackupDir $BackupFolder -Timestamp $timestamp
    if ($localStorageBackup) {
        $backupResults += $localStorageBackup
    }
}

# إنشاء النسخة الاحتياطية النهائية
if ($backupResults.Count -gt 0) {
    $finalBackup = Create-DatabaseBackup -BackupDir $BackupFolder -Timestamp $timestamp -CompressBackup $Compress
    
    if ($finalBackup) {
        # تنظيف النسخ القديمة
        Write-ColorOutput "`nتنظيف النسخ القديمة..." $InfoColor
        Remove-OldDatabaseBackups -BackupDir $BackupFolder -MaxCount $MaxBackups
        
        # عرض معلومات النسخ الاحتياطية
        Show-DatabaseBackupInfo -BackupDir $BackupFolder
        
        Write-ColorOutput "`n=== تم إكمال النسخ الاحتياطي لقاعدة البيانات بنجاح ===" $SuccessColor
    }
    else {
        Write-ColorOutput "`n=== فشل في إنشاء النسخة الاحتياطية النهائية ===" $ErrorColor
        exit 1
    }
}
else {
    Write-ColorOutput "`n=== لم يتم إنشاء أي نسخ احتياطية ===" $WarningColor
}

# إضافة السجل إلى ملف
$logFile = "${BackupFolder}\database_backup_log.txt"
$logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Database backup completed - Files: $($backupResults.Count)"
Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
