@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Quick Backup Script - Simplified
set "SOURCE_FILE=d:\Projects\HTML\growth\agents_growth_iraqcell.html"
set "BACKUP_FOLDER=d:\Projects\HTML\growth\backups"
set MAX_BACKUPS=10

echo.
echo ==========================================
echo    Quick Auto Backup Script
echo ==========================================
echo.

REM Create backup folder if it doesn't exist
if not exist "%BACKUP_FOLDER%" (
    mkdir "%BACKUP_FOLDER%"
    echo Created backup folder
)

REM Check if source file exists
if not exist "%SOURCE_FILE%" (
    echo Error: Source file not found
    echo %SOURCE_FILE%
    pause
    exit /b 1
)

REM Generate timestamp
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "day=%%a"
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "month=%%b"
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "year=%%c"
for /f "tokens=1-2 delims=:" %%a in ("%time%") do set "hour=%%a"
for /f "tokens=2 delims=:" %%a in ("%time%") do set "minute=%%a"

REM Clean up timestamp
set "year=%year:~-4%"
if %day% LSS 10 set "day=0%day%"
if %month% LSS 10 set "month=0%month%"
if %hour% LSS 10 set "hour=0%hour%"
if %minute% LSS 10 set "minute=0%minute%"

set "timestamp=%year%-%month%-%day%_%hour%-%minute%"
set "backup_name=agents_growth_iraqcell_backup_%timestamp%.html"
set "backup_path=%BACKUP_FOLDER%\%backup_name%"

echo Creating backup...
echo Source: %SOURCE_FILE%
echo Destination: %backup_path%

REM Copy file
copy "%SOURCE_FILE%" "%backup_path%" >nul
if errorlevel 1 (
    echo Error creating backup
    pause
    exit /b 1
)

echo Backup created successfully: %backup_name%

REM Clean old backups
echo.
echo Cleaning old backups...

REM Count backup files
set "backup_count=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    set /a backup_count+=1
)

echo Current backup count: !backup_count!

REM Delete old backups if exceeding limit
if !backup_count! GTR %MAX_BACKUPS% (
    set /a "files_to_delete=!backup_count!-%MAX_BACKUPS%"
    echo Will delete !files_to_delete! old backups
    
    REM Delete oldest files
    for /f "skip=%MAX_BACKUPS%" %%f in ('dir "%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html" /b /o:d') do (
        del "%BACKUP_FOLDER%\%%f"
        echo Deleted: %%f
    )
)

REM Show backup info
echo.
echo ==========================================
echo           Backup Information
echo ==========================================

REM Count final backups
set "final_count=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    set /a final_count+=1
)

echo Number of backups: !final_count!
echo Maximum allowed: %MAX_BACKUPS%

REM Calculate total size
set "total_size=0"
for %%f in ("%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html") do (
    for %%s in ("%%f") do set /a total_size+=%%~zs
)

set /a "size_mb=!total_size!/1048576"
echo Total size: !size_mb! MB approximately

REM Show latest backup
for /f %%f in ('dir "%BACKUP_FOLDER%\agents_growth_iraqcell_backup_*.html" /b /o:-d') do (
    echo Latest backup: %%f
    goto :found_latest
)
:found_latest

REM Add to log
echo %date% %time% - Backup completed successfully >> "%BACKUP_FOLDER%\backup_log.txt"

echo.
echo ==========================================
echo        Backup completed successfully
echo ==========================================
echo.

REM Wait 3 seconds before closing
timeout /t 3 /nobreak >nul
