@echo off
setlocal enabledelayedexpansion

REM Initial port number
set PORT=1880

REM Directory to store data for each server
set DATA_DIR=C:\NodeRedServers

REM File to log server information
set LOG_FILE=servers_log.txt

REM Create the main data directory if it doesn't exist
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM Clear the log file before starting
echo Starting servers... > %LOG_FILE%

REM Loop to start 100 servers
for /L %%i in (1,1,100) do (
    REM Data directory for the current server
    set SERVER_DIR=%DATA_DIR%\Server%%i
    
    REM Create the server directory if it doesn't exist
    if not exist "!SERVER_DIR!" mkdir "!SERVER_DIR!"

    REM Start Node-RED server on the specified port with the unique user directory
    start /b node-red -p !PORT! -u "!SERVER_DIR!"
    
    REM Log server address and port
    echo Server %%i running at http://localhost:!PORT! >> %LOG_FILE%
    
    REM Increment the port number for the next server
    set /a PORT=PORT+1
)

REM Display log file content
type %LOG_FILE%

REM Listen for 'E' key press to terminate all Node-RED servers
:WAIT_FOR_EXIT
echo.
echo Press [E] to stop all servers.
choice /c E /n /m " "
if errorlevel 1 goto :STOP_SERVERS

:STOP_SERVERS
taskkill /f /im node-red.exe > nul 2>&1
echo All servers have been stopped.
pause
