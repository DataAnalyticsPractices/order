@echo off
chcp 65001 > nul
echo ====================================
echo    订单管理系统 - 启动脚本
echo ====================================
echo.

echo [1/3] 检查 MongoDB 服务...
sc query MongoDB | find "RUNNING" > nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB 服务运行中
) else (
    echo ⚠ MongoDB 服务未运行
    echo.
    echo 尝试启动 MongoDB 服务...
    net start MongoDB > nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MongoDB 服务启动成功
    ) else (
        echo ⚠ 无法自动启动 MongoDB
        echo.
        echo 请手动启动 MongoDB:
        echo 1. 以管理员身份运行命令提示符
        echo 2. 运行: net start MongoDB
        echo 或者直接运行 mongod.exe
        echo.
        echo 按任意键退出...
        pause > nul
        exit
    )
)

echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 依赖未安装,正在安装...
    call npm install
    echo ✓ 依赖安装完成
) else (
    echo ✓ 依赖已安装
)

echo.
echo [3/3] 启动应用...
echo.
echo ====================================
echo   前端地址: http://localhost:3000
echo   后端地址: http://localhost:5000
echo ====================================
echo.
echo 按 Ctrl+C 可停止服务
echo.

call npm start

pause
