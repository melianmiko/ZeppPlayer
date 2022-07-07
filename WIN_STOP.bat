@echo off

rem Stop web server
cd lib\nginx
call nginx.exe -s quit
