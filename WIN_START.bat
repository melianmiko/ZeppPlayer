@echo off

rem Run nginx web server
cd lib\nginx
start /b nginx.exe

rem Open browser
start http://localhost:8002
