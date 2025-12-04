@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM سكريبت النسخ الاحتياطي السريع
REM Quick Backup Script

set "SOURCE_FILE=d:\Projects\HTML\growth\agents_growth_iraqcell.html"
set "BACKUP_FOLDER=d:\Projects\HTML\growth\backups"
set MAX_BACKUPS=10

echo.
echo ==========================================
echo    النسخ الاحتياطي التلقائي السريع
echo    Quick Auto Backup Script
echo ==========================================
echo.

REM إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
if not exist "%BACKUP_FOLDER%" (
    mkdir "%BACKUP_FOLDER%"
    echo تم إنشاء مجلد النسخ الاحتياطية
)

REM التحقق من وجود الملف المصدر
if not exist "%SOURCE_FILE%" (
    echo خطأ: الملف المصدر غير موجود
    echo %SOURCE_FILE%
    pause
    exit /b 1
)

REM إنشاء اسم النسخة الاحتياطية مع التاريخ والوقت
for /f "tokens=1-6 delims=: " %%a in ("%date% %time%") do (
    set "year=%%c"
    set "month=%%b"
    set "day=%%a"
    set "hour=%%d"
    set "minute=%%e"
    set "second=%%f"
)

REM تنظيف التاريخ والوقت
set "year=%year:~-4%"
if "%month%"=="Jan" set "month=01"
if "%month%"=="Feb" set "month=02"
if "%month%"=="Mar" set "month=03"
if "%month%"=="Apr" set "month=04"
if "%month%"=="May" set "month=05"
if "%month%"=="Jun" set "month=06"
if "%month%"=="Jul" set "month=07"
if "%month%"=="Aug" set "month=08"
if "%month%"=="Sep" set "month=09"
if "%month%"=="Oct" set "month=10"
if "%month%"=="Nov" set "month=11"
if "%month%"=="Dec" set "month=12"

REM إضافة صفر في بداية اليوم إذا كان أقل من 10
if %day% LSS 10 set "day=0%day%"

REM إضافة صفر في بداية الساعة والدقيقة والثانية إذا كانت أقل من 10
if %hour% LSS 10 set "hour=0%hour%"
if %minute% LSS 10 set "minute=0%minute%"
if %second% LSS 10 set "second=0%second%"

set "timestamp=%year%-%month%-%day%_%hour%-%minute%-%second%"
set "backup_name=agents_growth_iraqcell_backup_%timestamp%.html"
set "backup_path=%BACKUP_FOLDER%\%backup_name%"

echo إنشاء النسخة الاحتياطية...
echo المصدر: %SOURCE_FILE%
echo الوجهة: %backup_path%

REM نسخ الملف
copy "%SOURCE_FILE%" "%backup_path%" >nul
if errorlevel 1 (
    echo خطأ في إنشاء النسخة الاحتياطية
    pause
    exit /b 1
)

echo تم إنشاء النسخة الاحتياطية بنجاح: %backup_name%

REM تنظيف النسخ القديمة
echo.
echo تنظيف النسخ القديمة...

REM عد النسخ الاحتياطية الموجودة
set "backup_count=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    set /a backup_count+=1
)

echo عدد النسخ الاحتياطية الحالية: !backup_count!

REM حذف النسخ القديمة إذا تجاوزت العدد المحدد
if !backup_count! GTR %MAX_BACKUPS% (
    set /a "files_to_delete=!backup_count!-%MAX_BACKUPS%"
    echo سيتم حذف !files_to_delete! نسخة قديمة
    
    REM ترتيب الملفات حسب التاريخ وحذف الأقدم
    for /f "skip=%MAX_BACKUPS%" %%f in ('dir "%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html" /b /o:d') do (
        del "%BACKUP_FOLDER%\%%f"
        echo تم حذف: %%f
    )
)

REM عرض معلومات النسخ الاحتياطية
echo.
echo ==========================================
echo           معلومات النسخ الاحتياطية
echo ==========================================

REM عد النسخ الاحتياطية مرة أخرى بعد التنظيف
set "final_count=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    set /a final_count+=1
)

echo عدد النسخ الاحتياطية: !final_count!
echo الحد الأقصى المسموح: %MAX_BACKUPS%

REM حساب الحجم الإجمالي
set "total_size=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    for %%s in ("%%f") do set /a total_size+=%%~zs
)

set /a "size_mb=!total_size!/1048576"
echo الحجم الإجمالي: !size_mb! MB تقريباً

REM عرض أحدث نسخة
for /f %%f in ('dir "%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html" /b /o:-d') do (
    echo أحدث نسخة: %%f
    goto :found_latest
)
:found_latest

REM إضافة السجل
echo %date% %time% - Backup completed successfully >> "%BACKUP_FOLDER%\backup_log.txt"

echo.
echo ==========================================
echo        تم إكمال النسخ الاحتياطي بنجاح
echo ==========================================
echo.

REM انتظار لمدة 3 ثواني قبل الإغلاق
timeout /t 3 /nobreak >nul

REM إلغاء التعليق على السطر التالي إذا كنت تريد إبقاء النافذة مفتوحة
REM pause
