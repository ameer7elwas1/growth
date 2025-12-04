# سكريبت النسخ الاحتياطي التلقائي
# Auto Backup Script for HTML Projects

param(
    [string]$SourcePath = "d:\Projects\HTML\growth\agents_growth_iraqcell.html",
    [string]$BackupFolder = "d:\Projects\HTML\growth\backups",
    [int]$MaxBackups = 10,
    [switch]$Compress = $true,
    [switch]$Verbose = $false
)

# إعدادات الألوان للرسائل
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
            Write-ColorOutput "تم إنشاء مجلد النسخ الاحتياطية: $Path" $SuccessColor
            return $true
        }
        catch {
            Write-ColorOutput "خطأ في إنشاء مجلد النسخ الاحتياطية: $($_.Exception.Message)" $ErrorColor
            return $false
        }
    }
    return $true
}

function New-Backup {
    param(
        [string]$SourceFile,
        [string]$BackupDir,
        [bool]$CompressBackup
    )
    
    $timestamp = Get-Timestamp
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($SourceFile)
    $fileExtension = [System.IO.Path]::GetExtension($SourceFile)
    
    if ($CompressBackup) {
        $backupName = "${fileName}_backup_${timestamp}.zip"
        $tempFile = "${BackupDir}\${fileName}_temp_${timestamp}${fileExtension}"
        
        try {
            # نسخ الملف مؤقتاً
            Copy-Item $SourceFile $tempFile -Force
            
            # ضغط الملف
            Compress-Archive -Path $tempFile -DestinationPath "${BackupDir}\${backupName}" -Force
            
            # حذف الملف المؤقت
            Remove-Item $tempFile -Force
            
            Write-ColorOutput "تم إنشاء النسخة الاحتياطية المضغوطة: $backupName" $SuccessColor
            return "${BackupDir}\${backupName}"
        }
        catch {
            Write-ColorOutput "خطأ في إنشاء النسخة المضغوطة: $($_.Exception.Message)" $ErrorColor
            return $null
        }
    }
    else {
        $backupName = "${fileName}_backup_${timestamp}${fileExtension}"
        $backupPath = "${BackupDir}\${backupName}"
        
        try {
            Copy-Item $SourceFile $backupPath -Force
            Write-ColorOutput "تم إنشاء النسخة الاحتياطية: $backupName" $SuccessColor
            return $backupPath
        }
        catch {
            Write-ColorOutput "خطأ في إنشاء النسخة الاحتياطية: $($_.Exception.Message)" $ErrorColor
            return $null
        }
    }
}

function Remove-OldBackups {
    param(
        [string]$BackupDir,
        [int]$MaxCount
    )
    
    try {
        $backupFiles = Get-ChildItem $BackupDir -File | Sort-Object LastWriteTime -Descending
        
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

function Get-BackupInfo {
    param([string]$BackupDir)
    
    $backupFiles = Get-ChildItem $BackupDir -File
    $totalSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-ColorOutput "`n=== معلومات النسخ الاحتياطية ===" $InfoColor
    Write-ColorOutput "عدد النسخ الاحتياطية: $($backupFiles.Count)" $InfoColor
    Write-ColorOutput "الحجم الإجمالي: $sizeInMB MB" $InfoColor
    Write-ColorOutput "أحدث نسخة: $($backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { $_.Name })" $InfoColor
}

# بداية السكريبت الرئيسي
Write-ColorOutput "`n=== بدء النسخ الاحتياطي التلقائي ===" $InfoColor
Write-ColorOutput "الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $InfoColor

# التحقق من وجود الملف المصدر
if (-not (Test-Path $SourcePath)) {
    Write-ColorOutput "خطأ: الملف المصدر غير موجود: $SourcePath" $ErrorColor
    exit 1
}

# التحقق من مجلد النسخ الاحتياطية
if (-not (Test-BackupFolder $BackupFolder)) {
    exit 1
}

# إنشاء النسخة الاحتياطية
Write-ColorOutput "`nإنشاء النسخة الاحتياطية..." $InfoColor
$backupResult = New-Backup -SourceFile $SourcePath -BackupDir $BackupFolder -CompressBackup $Compress

if ($backupResult) {
    # تنظيف النسخ القديمة
    Write-ColorOutput "`nتنظيف النسخ القديمة..." $InfoColor
    Remove-OldBackups -BackupDir $BackupFolder -MaxCount $MaxBackups
    
    # عرض معلومات النسخ الاحتياطية
    Get-BackupInfo -BackupDir $BackupFolder
    
    Write-ColorOutput "`n=== تم إكمال النسخ الاحتياطي بنجاح ===" $SuccessColor
}
else {
    Write-ColorOutput "`n=== فشل في إنشاء النسخة الاحتياطية ===" $ErrorColor
    exit 1
}

# إضافة السجل إلى ملف
$logFile = "${BackupFolder}\backup_log.txt"
$logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Backup completed successfully - Source: $SourcePath"
Add-Content -Path $logFile -Value $logEntry -Encoding UTF8