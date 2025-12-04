@echo off
chcp 65001 >nul
title النسخ الاحتياطي التلقائي - Auto Backup

echo.
echo ==========================================
echo    نظام النسخ الاحتياطي التلقائي
echo    Auto Backup System
echo ==========================================
echo.

:menu
echo اختر الخيار المطلوب:
echo.
echo 1. نسخ احتياطي سريع (Batch)
echo 2. نسخ احتياطي متقدم (PowerShell)
echo 3. إعداد النسخ التلقائي المجدول
echo 4. تشغيل النسخ التلقائي المجدول الآن
echo 5. عرض المهام المجدولة
echo 6. حذف المهام المجدولة
echo 7. فتح مجلد النسخ الاحتياطية
echo 8. عرض سجل النسخ الاحتياطية
echo 9. خروج
echo.

set /p choice="أدخل رقم الخيار (1-9): "

if "%choice%"=="1" goto quick_backup
if "%choice%"=="2" goto advanced_backup
if "%choice%"=="3" goto setup_scheduled
if "%choice%"=="4" goto run_scheduled
if "%choice%"=="5" goto show_tasks
if "%choice%"=="6" goto remove_tasks
if "%choice%"=="7" goto open_backup_folder
if "%choice%"=="8" goto show_log
if "%choice%"=="9" goto exit
goto menu

:quick_backup
echo.
echo تشغيل النسخ الاحتياطي السريع...
call "%~dp0quick_backup.bat"
pause
goto menu

:advanced_backup
echo.
echo تشغيل النسخ الاحتياطي المتقدم...
powershell -ExecutionPolicy Bypass -File "%~dp0auto_backup.ps1"
pause
goto menu

:setup_scheduled
echo.
echo إعداد النسخ التلقائي المجدول...
echo.
echo اختر الفترة:
echo 1. كل ساعة
echo 2. يومياً في الساعة 9 صباحاً
echo 3. يومياً في الساعة 6 مساءً
echo 4. أسبوعياً يوم الاثنين
echo.
set /p schedule_choice="أدخل رقم الخيار (1-4): "

if "%schedule_choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduled_backup.ps1" -Interval Hourly
) else if "%schedule_choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduled_backup.ps1" -Interval Daily -StartHour 9
) else if "%schedule_choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduled_backup.ps1" -Interval Daily -StartHour 18
) else if "%schedule_choice%"=="4" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduled_backup.ps1" -Interval Weekly -StartHour 9
) else (
    echo خيار غير صحيح
)
pause
goto menu

:run_scheduled
echo.
echo تشغيل النسخ التلقائي المجدول الآن...
powershell -ExecutionPolicy Bypass -File "%~dp0auto_backup.ps1" -Verbose
pause
goto menu

:show_tasks
echo.
echo عرض المهام المجدولة...
powershell -ExecutionPolicy Bypass -Command "Get-ScheduledTask | Where-Object { $_.TaskName -like '*backup*' -or $_.TaskName -like '*Backup*' } | Format-Table TaskName, State, LastRunTime, LastTaskResult -AutoSize"
pause
goto menu

:remove_tasks
echo.
echo حذف المهام المجدولة...
powershell -ExecutionPolicy Bypass -File "%~dp0setup_scheduled_backup.ps1" -RemoveTask
pause
goto menu

:open_backup_folder
echo.
echo فتح مجلد النسخ الاحتياطية...
explorer "%~dp0backups"
goto menu

:show_log
echo.
echo عرض سجل النسخ الاحتياطية...
if exist "%~dp0backups\backup_log.txt" (
    type "%~dp0backups\backup_log.txt"
) else (
    echo لا يوجد سجل للنسخ الاحتياطية
)
pause
goto menu

:exit
echo.
echo شكراً لاستخدام نظام النسخ الاحتياطي التلقائي
echo Thank you for using the Auto Backup System
timeout /t 2 /nobreak >nul
exit
