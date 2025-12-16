# سكريبت إعداد المهمة المجدولة للنسخ الاحتياطي التلقائي
# Scheduled Task Setup Script for Auto Backup

param(
    [string]$TaskName = "HTML_Project_Auto_Backup",
    [string]$ScriptPath = "d:\Projects\HTML\growth\auto_backup.ps1",
    [string]$Interval = "Hourly",  # Hourly, Daily, Weekly
    [int]$StartHour = 9,
    [switch]$RunAsAdmin = $false,
    [switch]$CreateTask = $true,
    [switch]$RemoveTask = $false
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

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function New-ScheduledBackupTask {
    param(
        [string]$TaskName,
        [string]$ScriptPath,
        [string]$Interval,
        [int]$StartHour
    )
    
    try {
        # التحقق من وجود السكريبت
        if (-not (Test-Path $ScriptPath)) {
            Write-ColorOutput "خطأ: سكريبت النسخ الاحتياطي غير موجود: $ScriptPath" $ErrorColor
            return $false
        }
        
        # حذف المهمة الموجودة إذا كانت موجودة
        $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($existingTask) {
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            Write-ColorOutput "تم حذف المهمة الموجودة: $TaskName" $WarningColor
        }
        
        # إنشاء الإجراء
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""
        
        # إنشاء المشغل حسب الفترة المحددة
        switch ($Interval.ToLower()) {
            "hourly" {
                $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 365)
                Write-ColorOutput "تم تعيين النسخ الاحتياطي كل ساعة" $InfoColor
            }
            "daily" {
                $trigger = New-ScheduledTaskTrigger -Daily -At "$StartHour`:00"
                Write-ColorOutput "تم تعيين النسخ الاحتياطي يومياً في الساعة $StartHour" $InfoColor
            }
            "weekly" {
                $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "$StartHour`:00"
                Write-ColorOutput "تم تعيين النسخ الاحتياطي أسبوعياً يوم الاثنين في الساعة $StartHour" $InfoColor
            }
            default {
                $trigger = New-ScheduledTaskTrigger -Daily -At "$StartHour`:00"
                Write-ColorOutput "تم تعيين النسخ الاحتياطي يومياً في الساعة $StartHour (افتراضي)" $InfoColor
            }
        }
        
        # إعدادات المهمة
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
        
        # تسجيل المهمة
        Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "نسخ احتياطي تلقائي لمشروع HTML - Auto backup for HTML project"
        
        Write-ColorOutput "تم إنشاء المهمة المجدولة بنجاح: $TaskName" $SuccessColor
        return $true
    }
    catch {
        Write-ColorOutput "خطأ في إنشاء المهمة المجدولة: $($_.Exception.Message)" $ErrorColor
        return $false
    }
}

function Remove-ScheduledBackupTask {
    param([string]$TaskName)
    
    try {
        $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($task) {
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            Write-ColorOutput "تم حذف المهمة المجدولة: $TaskName" $SuccessColor
            return $true
        }
        else {
            Write-ColorOutput "المهمة غير موجودة: $TaskName" $WarningColor
            return $false
        }
    }
    catch {
        Write-ColorOutput "خطأ في حذف المهمة: $($_.Exception.Message)" $ErrorColor
        return $false
    }
}

function Show-ScheduledTasks {
    Write-ColorOutput "`n=== المهام المجدولة المتعلقة بالنسخ الاحتياطي ===" $InfoColor
    
    $backupTasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*backup*" -or $_.TaskName -like "*Backup*" }
    
    if ($backupTasks) {
        foreach ($task in $backupTasks) {
            Write-ColorOutput "اسم المهمة: $($task.TaskName)" $InfoColor
            Write-ColorOutput "الحالة: $($task.State)" $InfoColor
            Write-ColorOutput "آخر تشغيل: $($task.LastRunTime)" $InfoColor
            Write-ColorOutput "النتيجة الأخيرة: $($task.LastTaskResult)" $InfoColor
            Write-ColorOutput "---" $InfoColor
        }
    }
    else {
        Write-ColorOutput "لا توجد مهام مجدولة للنسخ الاحتياطي" $WarningColor
    }
}

function Show-TaskDetails {
    param([string]$TaskName)
    
    try {
        $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($task) {
            Write-ColorOutput "`n=== تفاصيل المهمة: $TaskName ===" $InfoColor
            Write-ColorOutput "الحالة: $($task.State)" $InfoColor
            Write-ColorOutput "آخر تشغيل: $($task.LastRunTime)" $InfoColor
            Write-ColorOutput "النتيجة الأخيرة: $($task.LastTaskResult)" $InfoColor
            Write-ColorOutput "الوصف: $($task.Description)" $InfoColor
            
            # عرض المشغلات
            $triggers = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
            Write-ColorOutput "عدد المشغلات: $($triggers.Count)" $InfoColor
        }
        else {
            Write-ColorOutput "المهمة غير موجودة: $TaskName" $WarningColor
        }
    }
    catch {
        Write-ColorOutput "خطأ في عرض تفاصيل المهمة: $($_.Exception.Message)" $ErrorColor
    }
}

# بداية السكريبت الرئيسي
Write-ColorOutput "`n=== إعداد المهمة المجدولة للنسخ الاحتياطي التلقائي ===" $InfoColor
Write-ColorOutput "الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $InfoColor

# التحقق من صلاحيات المدير
if ($RunAsAdmin -and -not (Test-Administrator)) {
    Write-ColorOutput "تحذير: هذا السكريبت يحتاج صلاحيات المدير لإنشاء المهام المجدولة" $WarningColor
    Write-ColorOutput "يرجى تشغيل PowerShell كمدير" $WarningColor
}

if ($RemoveTask) {
    Write-ColorOutput "`nحذف المهمة المجدولة..." $InfoColor
    Remove-ScheduledBackupTask -TaskName $TaskName
}
elseif ($CreateTask) {
    Write-ColorOutput "`nإنشاء المهمة المجدولة..." $InfoColor
    $result = New-ScheduledBackupTask -TaskName $TaskName -ScriptPath $ScriptPath -Interval $Interval -StartHour $StartHour
    
    if ($result) {
        Write-ColorOutput "`nتم إعداد النسخ الاحتياطي التلقائي بنجاح!" $SuccessColor
        Write-ColorOutput "يمكنك إدارة المهمة من Task Scheduler" $InfoColor
    }
}

# عرض المهام الموجودة
Show-ScheduledTasks

# عرض تفاصيل المهمة المحددة
if ($CreateTask -and -not $RemoveTask) {
    Show-TaskDetails -TaskName $TaskName
}

Write-ColorOutput "`n=== انتهى السكريبت ===" $InfoColor
