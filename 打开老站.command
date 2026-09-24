#!/bin/bash
# 双击启动：在本机起一个只读的本地服务器，打开书生子白首页。关掉这个终端窗口就停了。
# 为什么要服务器：打飞机、立方体跳跃这类游戏双击打开时，浏览器会以跨域为由拦下图片。
cd "$(dirname "$0")" || exit 1
PORT=8766
while lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT+1)); done
echo "老站已在 http://localhost:$PORT 打开，关掉这个窗口就停止。"
( sleep 1; open "http://localhost:$PORT/Blog/Home.html" ) &
exec python3 -m http.server "$PORT" --bind 127.0.0.1
