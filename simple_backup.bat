@echo off
echo Creating backup...

set "SOURCE=d:\Projects\HTML\growth\agents_growth_iraqcell.html"
set "BACKUP_DIR=d:\Projects\HTML\growth\backups"

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "day=%%a"
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "month=%%b" 
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set "year=%%c"
for /f "tokens=1-2 delims=:" %%a in ("%time%") do set "hour=%%a"
for /f "tokens=2 delims=:" %%a in ("%time%") do set "minute=%%a"

set "year=%year:~-4%"
if %day% LSS 10 set "day=0%day%"
if %month% LSS 10 set "month=0%month%"
if %hour% LSS 10 set "hour=0%hour%"
if %minute% LSS 10 set "minute=0%minute%"

set "timestamp=%year%-%month%-%day%_%hour%-%minute%"
set "backup_file=%BACKUP_DIR%\agents_growth_iraqcell_backup_%timestamp%.html"

copy "%SOURCE%" "%backup_file%"

if errorlevel 1 (
    echo Error creating backup
) else (
    echo Backup created: agents_growth_iraqcell_backup_%timestamp%.html
)

echo %date% %time% - Backup completed >> "%BACKUP_DIR%\backup_log.txt"

echo Backup completed successfully
pause
