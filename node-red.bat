@echo off
setlocal enabledelayedexpansion

REM Initial port
set PORT=1880

REM Directory to store data for each server
set DATA_DIR=C:\NodeRedServers

REM File to log all server addresses
set LOG_FILE=server_log.txt

REM Create the data directory if it does not exist
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM Clear the log file if it exists
if exist "%LOG_FILE%" del "%LOG_FILE%"

REM Loop to start 100 servers
for /L %%i in (1,1,100) do (
    REM Data directory for each server
    set SERVER_DIR=%DATA_DIR%\Server%%i
    
    REM Create server directory if it does not exist
    if not exist "!SERVER_DIR!" mkdir "!SERVER_DIR!"

    REM Start Node-RED server
    start cmd /k node-red -p !PORT! -u "!SERVER_DIR!"

    REM Log the server address
    echo Server %%i running at http://localhost:!PORT! >> "%LOG_FILE%"
    
    REM Increment the port for the next server
    set /a PORT=PORT+1
)

REM Display the log file content
type "%LOG_FILE%"
echo -----------------------------------------------------
echo Press "E" to terminate all servers.
echo -----------------------------------------------------

:WAIT_INPUT
set INPUT=
set /p INPUT=Enter Command: 
if /i "!INPUT!"=="E" goto TERMINATE_ALL

REM Wait for input again
goto WAIT_INPUT

:TERMINATE_ALL
REM Close all Node-RED servers
taskkill /f /im node.exe > nul 2>&1
echo All servers have been terminated.
pause
