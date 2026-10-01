#!/usr/bin/env bash
# 案头手册（design-proposal.md §9）两份运行库的制作配方。站点运行不需要本目录的任何东西。
#
# three 从 r160 起不再发经典脚本版，0.186 的包里只有 ES module；而 file:// 双击打开是硬约束
# （不能用 module / importmap / 动态 import），所以只能自己打一份挂 window.THREE 的 IIFE。
# GSAP 官方仍发 UMD 版，原样拷贝即可。
#
# 用法（先在本目录 npm install；node_modules 已被 .gitignore 排除）：
#   bash build.sh                 重打 three.min.js、拷 gsap.min.js，写进 ../../vendor/
#   bash build.sh --out DIR       同上，但写进 DIR（在仓库外的副本里制作时用）
#   bash build.sh --check [DIR]   打到临时目录，与 DIR（默认 ../../vendor）里的两份比 sha256，不一致非零退出
#
# esbuild 是按操作系统区分的原生二进制：node_modules 在 Mac 上装的，拿到 Windows/Linux 上用不了，
# 换平台必须在那个平台上重新 npm install（仓库在 SMB 共享卷上时尤其容易踩到）。
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THREE_VERSION="0.186.0"
GSAP_VERSION="3.15.0"
ESBUILD_VERSION="0.28.1"
BANNER="/*! three@${THREE_VERSION} subset for desk-book.js, rebuilt by tools/vendor-3d/build.sh | MIT License, Copyright 2010-2026 Three.js Authors | full text: vendor/LICENSE-three.txt */"

mode="build"
target="$here/../../vendor"
case "${1:-}" in
  "") ;;
  --out) target="${2:?--out 需要一个目录}" ;;
  --check) mode="check"; target="${2:-$target}" ;;
  *) echo "用法：bash build.sh [--out DIR | --check [DIR]]" >&2; exit 2 ;;
esac

nm="$here/node_modules"
esbuild="$nm/.bin/esbuild"
[ -x "$esbuild" ] || esbuild="$nm/esbuild/bin/esbuild"
if [ ! -x "$esbuild" ]; then
  echo "找不到 esbuild：先在 $here 下执行 npm install" >&2
  exit 1
fi

# 版本钉死：装错版本打出来的产物与仓库对不上，与其打出一份「看着能用」的，不如当场停。
pkgver() { node -p "require(process.argv[1]).version" "$nm/$1/package.json"; }
fail=0
[ "$(pkgver three)" = "$THREE_VERSION" ] || { echo "three 版本不是 $THREE_VERSION：$(pkgver three)" >&2; fail=1; }
[ "$(pkgver gsap)" = "$GSAP_VERSION" ] || { echo "gsap 版本不是 $GSAP_VERSION：$(pkgver gsap)" >&2; fail=1; }
[ "$("$esbuild" --version)" = "$ESBUILD_VERSION" ] || { echo "esbuild 版本不是 $ESBUILD_VERSION：$("$esbuild" --version)" >&2; fail=1; }
[ "$fail" = 0 ] || exit 1

sha() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1
  else shasum -a 256 "$1" | cut -d' ' -f1; fi
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

"$esbuild" "$here/three-entry.js" \
  --bundle --format=iife --global-name=THREE --minify --legal-comments=inline --target=es2020 \
  "--banner:js=$BANNER" --log-level=warning --outfile="$work/three.min.js"
cp "$nm/gsap/dist/gsap.min.js" "$work/gsap.min.js"

if [ "$mode" = "build" ]; then
  mkdir -p "$target"
  for name in three.min.js gsap.min.js; do
    cp "$work/$name" "$target/$name"
    printf '%s  %s  %s 字节，gzip -9 后 %s 字节\n' "$(sha "$target/$name")" "$name" \
      "$(wc -c < "$target/$name" | tr -d ' ')" "$(gzip -9c "$target/$name" | wc -c | tr -d ' ')"
  done
  exit 0
fi

status=0
for name in three.min.js gsap.min.js; do
  want="$(sha "$work/$name")"
  if [ ! -f "$target/$name" ]; then
    echo "缺文件：$target/$name" >&2; status=1; continue
  fi
  have="$(sha "$target/$name")"
  if [ "$want" = "$have" ]; then
    echo "一致  $name  $have"
  else
    echo "不一致  $name  重打=$want  现有=$have" >&2; status=1
  fi
done
exit "$status"
