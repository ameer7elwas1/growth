# سكريبت استيراد البيانات لقاعدة البيانات
# Database Import Script

param(
    [string]$ImportFile = "",
    [string]$BackupFolder = "d:\Projects\HTML\growth\database_backups",
    [switch]$RestoreMode = $false,
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

function Test-ImportFile {
    param([string]$FilePath)
    
    if (-not $FilePath) {
        Write-ColorOutput "خطأ: لم يتم تحديد ملف للاستيراد" $ErrorColor
        return $false
    }
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "خطأ: الملف غير موجود: $FilePath" $ErrorColor
        return $false
    }
    
    $extension = [System.IO.Path]::GetExtension($FilePath)
    if ($extension -ne ".json") {
        Write-ColorOutput "خطأ: يجب أن يكون الملف من نوع JSON" $ErrorColor
        return $false
    }
    
    return $true
}

function Import-DatabaseData {
    param(
        [string]$FilePath,
        [bool]$IsRestoreMode
    )
    
    try {
        Write-ColorOutput "قراءة ملف البيانات..." $InfoColor
        
        # قراءة الملف
        $jsonContent = Get-Content $FilePath -Raw -Encoding UTF8
        $importData = $jsonContent | ConvertFrom-Json
        
        # التحقق من صحة البيانات
        if (-not $importData.data) {
            throw "تنسيق الملف غير صحيح - لا يحتوي على بيانات"
        }
        
        Write-ColorOutput "تم العثور على البيانات:" $InfoColor
        Write-ColorOutput "  - تاريخ التصدير: $($importData.metadata.exportDate)" $InfoColor
        Write-ColorOutput "  - عدد العناصر: $($importData.metadata.itemCount)" $InfoColor
        Write-ColorOutput "  - إصدار الملف: $($importData.version)" $InfoColor
        
        # إنشاء ملف HTML لاستيراد البيانات
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $importScript = @"
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>استيراد البيانات</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #1a1a2e;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
        }
        .success { color: #10b981; }
        .error { color: #f43f5e; }
        .warning { color: #f59e0b; }
        .info { color: #6366f1; }
    </style>
</head>
<body>
    <div class="container">
        <h1>استيراد البيانات</h1>
        <div id="status">جاري الاستيراد...</div>
        <div id="progress"></div>
    </div>

    <script>
        const importData = $($importData | ConvertTo-Json -Depth 10);
        
        function showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<span class="\${type}">\${message}</span>\`;
        }
        
        function updateProgress(current, total) {
            const progressDiv = document.getElementById('progress');
            const percentage = Math.round((current / total) * 100);
            progressDiv.innerHTML = \`التقدم: \${current}/\${total} (\${percentage}%)\`;
        }
        
        async function importData() {
            try {
                showStatus('بدء عملية الاستيراد...', 'info');
                
                const data = importData.data;
                const keys = Object.keys(data);
                const totalItems = keys.length;
                
                let importedCount = 0;
                
                if ($IsRestoreMode) {
                    showStatus('تحذير: وضع الاستعادة - سيتم مسح جميع البيانات الحالية', 'warning');
                    
                    if (!confirm('تحذير: سيتم مسح جميع البيانات الحالية واستبدالها بالبيانات من الملف. هل أنت متأكد؟')) {
                        showStatus('تم إلغاء العملية', 'error');
                        return;
                    }
                    
                    // مسح البيانات الحالية
                    localStorage.clear();
                    showStatus('تم مسح البيانات الحالية', 'warning');
                }
                
                // استيراد البيانات
                for (const key of keys) {
                    localStorage.setItem(key, data[key]);
                    importedCount++;
                    updateProgress(importedCount, totalItems);
                    
                    // تأخير صغير لعرض التقدم
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
                
                showStatus(\`تم استيراد البيانات بنجاح! تم استيراد \${importedCount} عنصر\`, 'success');
                
                // إضافة معلومات الاستيراد
                localStorage.setItem('lastImport', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    importedCount: importedCount,
                    sourceFile: '$([System.IO.Path]::GetFileName($FilePath))',
                    importMode: '$($IsRestoreMode ? "restore" : "import")'
                }));
                
                setTimeout(() => {
                    showStatus('سيتم إعادة تحميل الصفحة لتطبيق التغييرات...', 'info');
                    setTimeout(() => {
                        window.location.href = '../agents_growth_iraqcell.html';
                    }, 2000);
                }, 3000);
                
            } catch (error) {
                console.error('خطأ في الاستيراد:', error);
                showStatus(\`حدث خطأ في الاستيراد: \${error.message}\`, 'error');
            }
        }
        
        // بدء الاستيراد عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', importData);
    </script>
</body>
</html>
"@
        
        $importHtmlFile = "${BackupFolder}\import_data_${timestamp}.html"
        $importScript | Out-File -FilePath $importHtmlFile -Encoding UTF8
        
        Write-ColorOutput "تم إنشاء سكريبت الاستيراد: $importHtmlFile" $SuccessColor
        Write-ColorOutput "افتح الملف في المتصفح لإكمال عملية الاستيراد" $InfoColor
        
        return $importHtmlFile
        
    }
    catch {
        Write-ColorOutput "خطأ في استيراد البيانات: $($_.Exception.Message)" $ErrorColor
        return $null
    }
}

function Show-ImportInstructions {
    param([string]$ImportFile)
    
    Write-ColorOutput "`n=== تعليمات الاستيراد ===" $InfoColor
    Write-ColorOutput "1. افتح الملف المنشأ في المتصفح" $InfoColor
    Write-ColorOutput "2. اتبع التعليمات على الشاشة" $InfoColor
    Write-ColorOutput "3. تأكد من أنك في نفس المتصفح الذي يحتوي على البيانات" $InfoColor
    Write-ColorOutput "4. بعد الاستيراد، سيتم إعادة توجيهك إلى الصفحة الرئيسية" $InfoColor
    
    if ($RestoreMode) {
        Write-ColorOutput "`nتحذير: وضع الاستعادة سيمسح جميع البيانات الحالية!" $WarningColor
    }
}

function Get-ImportFileInfo {
    param([string]$FilePath)
    
    try {
        $jsonContent = Get-Content $FilePath -Raw -Encoding UTF8
        $importData = $jsonContent | ConvertFrom-Json
        
        Write-ColorOutput "`n=== معلومات الملف ===" $InfoColor
        Write-ColorOutput "اسم الملف: $([System.IO.Path]::GetFileName($FilePath))" $InfoColor
        Write-ColorOutput "حجم الملف: $([math]::Round((Get-Item $FilePath).Length / 1KB, 2)) KB" $InfoColor
        Write-ColorOutput "تاريخ التصدير: $($importData.metadata.exportDate)" $InfoColor
        Write-ColorOutput "عدد العناصر: $($importData.metadata.itemCount)" $InfoColor
        Write-ColorOutput "إصدار الملف: $($importData.version)" $InfoColor
        
        # عرض قائمة بالمفاتيح الرئيسية
        if ($importData.data) {
            $keys = $importData.data.PSObject.Properties.Name
            Write-ColorOutput "`nالمفاتيح الرئيسية:" $InfoColor
            foreach ($key in $keys) {
                Write-ColorOutput "  - $key" $InfoColor
            }
        }
        
    }
    catch {
        Write-ColorOutput "خطأ في قراءة معلومات الملف: $($_.Exception.Message)" $ErrorColor
    }
}

# بداية السكريبت الرئيسي
Write-ColorOutput "`n=== سكريبت استيراد البيانات ===" $InfoColor
Write-ColorOutput "الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $InfoColor

# التحقق من وجود مجلد النسخ الاحتياطية
if (-not (Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
    Write-ColorOutput "تم إنشاء مجلد النسخ الاحتياطية: $BackupFolder" $SuccessColor
}

# التحقق من ملف الاستيراد
if (-not (Test-ImportFile $ImportFile)) {
    Write-ColorOutput "`nالاستخدام:" $InfoColor
    Write-ColorOutput ".\database_import.ps1 -ImportFile 'path\to\backup.json'" $InfoColor
    Write-ColorOutput ".\database_import.ps1 -ImportFile 'path\to\backup.json' -RestoreMode" $InfoColor
    exit 1
}

# عرض معلومات الملف
Get-ImportFileInfo -FilePath $ImportFile

# إنشاء سكريبت الاستيراد
$importScript = Import-DatabaseData -FilePath $ImportFile -IsRestoreMode $RestoreMode

if ($importScript) {
    # عرض تعليمات الاستيراد
    Show-ImportInstructions -ImportFile $importScript
    
    # إضافة السجل
    $logFile = "${BackupFolder}\import_log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Import script created - File: $([System.IO.Path]::GetFileName($ImportFile)) - Mode: $($RestoreMode ? 'restore' : 'import')"
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    
    Write-ColorOutput "`n=== تم إنشاء سكريبت الاستيراد بنجاح ===" $SuccessColor
}
else {
    Write-ColorOutput "`n=== فشل في إنشاء سكريبت الاستيراد ===" $ErrorColor
    exit 1
}
