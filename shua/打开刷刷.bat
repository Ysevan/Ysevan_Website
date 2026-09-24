@echo off
chcp 65001 >nul
title 刷刷

rem 只启动刷刷的本地静态服务；不启动小屋、数据库或其他工具。
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
