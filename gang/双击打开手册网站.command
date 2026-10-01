#!/bin/bash
# 双击本文件即可在默认浏览器中打开手册网站首页。
cd "$(dirname "$0")" || exit 1
open "$(pwd)/index.html"
