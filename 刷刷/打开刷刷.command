#!/bin/bash
# 双击即可在 macOS 上只启动刷刷；不启动小屋、数据库或其他工具。

set -u

SHUA_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SHUA_DIR" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 没有找到 Node.js。请先安装 Node.js 24 LTS。"
  echo
  read -r -p "按回车键关闭窗口..." _
  exit 1
fi

exec node "$SHUA_DIR/serve.mjs"
