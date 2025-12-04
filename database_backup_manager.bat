@echo off
chcp 65001 >nul
title إدارة النسخ الاحتياطي لقاعدة البيانات

echo.
echo ==========================================
echo    إدارة النسخ الاحتياطي لقاعدة البيانات
echo    Database Backup Management
echo ==========================================
echo.

:menu
echo اختر الخيار المطلوب:
echo.
echo 1. فتح أداة النسخ الاحتياطي (واجهة ويب)
echo 2. نسخ احتياطي سريع للملفات
echo 3. نسخ احتياطي لقاعدة البيانات (PowerShell)
echo 4. استيراد البيانات من ملف
echo 5. فتح مجلد النسخ الاحتياطية
echo 6. عرض سجل العمليات
echo 7. تنظيف النسخ القديمة
echo 8. خروج
echo.

set /p choice="أدخل رقم الخيار (1-8): "

if "%choice%"=="1" goto open_web_tool
if "%choice%"=="2" goto quick_file_backup
if "%choice%"=="3" goto database_backup
if "%choice%"=="4" goto import_data
if "%choice%"=="5" goto open_backup_folder
if "%choice%"=="6" goto show_logs
if "%choice%"=="7" goto cleanup_backups
if "%choice%"=="8" goto exit
goto menu

:open_web_tool
echo.
echo فتح أداة النسخ الاحتياطي...
start "" "database_backup_tool.html"
echo تم فتح أداة النسخ الاحتياطي في المتصفح
pause
goto menu

:quick_file_backup
echo.
echo تشغيل النسخ الاحتياطي السريع للملفات...
call "easy_backup.bat"
pause
goto menu

:database_backup
echo.
echo تشغيل النسخ الاحتياطي لقاعدة البيانات...
echo.
echo ملاحظة: تأكد من إعداد معلومات Supabase في السكريبت
powershell -ExecutionPolicy Bypass -File "database_backup.ps1" -Verbose
pause
goto menu

:import_data
echo.
echo استيراد البيانات من ملف...
echo.
set /p import_file="أدخل مسار ملف JSON للاستيراد: "
if "%import_file%"=="" (
    echo لم يتم تحديد ملف
    pause
    goto menu
)

echo.
echo اختر نوع الاستيراد:
echo 1. استيراد عادي (إضافة للبيانات الموجودة)
echo 2. استعادة كاملة (مسح البيانات الحالية)
echo.
set /p import_mode="أدخل رقم الخيار (1-2): "

if "%import_mode%"=="1" (
    powershell -ExecutionPolicy Bypass -File "database_import.ps1" -ImportFile "%import_file%"
) else if "%import_mode%"=="2" (
    powershell -ExecutionPolicy Bypass -File "database_import.ps1" -ImportFile "%import_file%" -RestoreMode
) else (
    echo خيار غير صحيح
)

pause
goto menu

:open_backup_folder
echo.
echo فتح مجلد النسخ الاحتياطية...
if exist "database_backups" (
    explorer "database_backups"
) else (
    echo مجلد النسخ الاحتياطية غير موجود
)
pause
goto menu

:show_logs
echo.
echo عرض سجل العمليات...
echo.
if exist "database_backups\backup_log.txt" (
    echo === سجل النسخ الاحتياطي ===
    type "database_backups\backup_log.txt"
    echo.
)

if exist "database_backups\import_log.txt" (
    echo === سجل الاستيراد ===
    type "database_backups\import_log.txt"
    echo.
)

if exist "backups\backup_log.txt" (
    echo === سجل نسخ الملفات ===
    type "backups\backup_log.txt"
    echo.
)

pause
goto menu

:cleanup_backups
echo.
echo تنظيف النسخ القديمة...
echo.
set /p max_backups="أدخل عدد النسخ الاحتياطية المراد الاحتفاظ بها (افتراضي: 10): "
if "%max_backups%"=="" set max_backups=10

echo تنظيف نسخ قاعدة البيانات...
powershell -ExecutionPolicy Bypass -Command "Get-ChildItem 'database_backups' -File | Where-Object { $_.Name -like '*database_backup_*' } | Sort-Object LastWriteTime -Descending | Select-Object -Skip %max_backups% | Remove-Item -Force"

echo تنظيف نسخ الملفات...
powershell -ExecutionPolicy Bypass -Command "Get-ChildItem 'backups' -File | Where-Object { $_.Name -like '*backup_*' } | Sort-Object LastWriteTime -Descending | Select-Object -Skip %max_backups% | Remove-Item -Force"

echo تم تنظيف النسخ القديمة
pause
goto menu

:exit
echo.
echo شكراً لاستخدام نظام إدارة النسخ الاحتياطي
echo Thank you for using the Database Backup Management System
timeout /t 2 /nobreak >nul
exit
