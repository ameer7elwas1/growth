@echo off
echo Creating backup...

set SOURCE=d:\Projects\HTML\growth\agents_growth_iraqcell.html
set BACKUP_DIR=d:\Projects\HTML\growth\backups

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set timestamp=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set timestamp=%timestamp: =0%

set backup_file=%BACKUP_DIR%\agents_growth_iraqcell_backup_%timestamp%.html

copy "%SOURCE%" "%backup_file%"

if errorlevel 1 (
    echo Error creating backup
) else (
    echo Backup created successfully
)

echo %date% %time% - Backup completed >> "%BACKUP_DIR%\backup_log.txt"

echo Backup completed
pause
