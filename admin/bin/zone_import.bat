@echo off 
if "%GOSU_OPTS%" == "" set GOSU_OPTS=-Xmn128m -Xmx1024m
if "%OS%" == "Windows_NT" setlocal 
%~dp0gosu.cmd %~dp0zone_import.gsp %* 
:end 
