@echo off
chcp 65001 > nul
echo ====================================
echo    MongoDB 手动启动脚本
echo ====================================
echo.

echo 正在启动 MongoDB...
echo.

REM 尝试常见的 MongoDB 安装路径
set MONGO_PATH1="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
set MONGO_PATH2="C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
set MONGO_PATH3="C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"

if exist %MONGO_PATH1% (
    echo 找到 MongoDB 7.0
    %MONGO_PATH1% --dbpath="C:\data\db"
    goto :end
)

if exist %MONGO_PATH2% (
    echo 找到 MongoDB 6.0
    %MONGO_PATH2% --dbpath="C:\data\db"
    goto :end
)

if exist %MONGO_PATH3% (
    echo 找到 MongoDB 5.0
    %MONGO_PATH3% --dbpath="C:\data\db"
    goto :end
)

echo 未找到 MongoDB 安装!
echo 请确认已安装 MongoDB Community Server
echo 下载地址: https://www.mongodb.com/try/download/community
echo.

:end
pause
