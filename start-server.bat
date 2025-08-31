@echo off
echo Starting server with detailed logging...
set NODE_DEBUG=http,net,tls,https
set DEBUG=*
node src/server.js
pause
