#!/usr/bin/env bash
# 核对「页面会加载的每个本地文件」都被 Dockerfile 的 COPY 带进了镜像。
#
# 为什么要有它：容器里少一个文件，docker build 照样成功、healthcheck 照样绿，只有那一个请求静默 404。
# 刷刷 3.9.0 就这样栽过；岗岗的案头手册又是运行时才注入 vendor/ 下的运行库，更不容易被人眼发现。
#
# 核对范围：
#   1. index.html 本身，以及它里面每个 <script src> 与 <link href> 引用的本地文件（去掉 ?v= 查询串；http(s)、//、data: 不算）；
#   2. 若页面引用了 desk-book.js，再从它的源码里 grep 出运行时注入的每个 vendor/*.js 路径（不在这里写死）。
# 每一项都必须：真实存在于仓库；并被某条目标在站点根目录内的 COPY 覆盖，且落地后的 URL 路径与仓库相对路径一致
# （逐个列出，或它所在的目录被整目录 COPY，如 `COPY vendor/ ./vendor/`）。缺一个就非零退出并打印缺的是哪个。
#
# 用法：bash tools/check-dockerfile-copy.sh [Dockerfile 路径]   默认用仓库里的 Dockerfile。
# 只支持 shell 形式的 COPY（本仓库就是这种写法）；带 --from= 的多阶段 COPY 与目标为绝对路径的 COPY 不算站点文件。
# 本脚本只在 CI 与本机用，.dockerignore 排除了 tools/，它不进镜像。
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dockerfile="${1:-$repo/Dockerfile}"
[ -f "$dockerfile" ] || { echo "找不到 Dockerfile：$dockerfile" >&2; exit 2; }
[ -f "$repo/index.html" ] || { echo "找不到 $repo/index.html" >&2; exit 2; }

# ---- 1. 收集页面要加载的本地文件 ----
local_ref() {
  # 读 stdin 的 URL，去掉查询串与片段、开头的 ./，丢掉外部地址
  sed -e 's/[?#].*$//' -e 's#^\./##' | grep -Ev '^(https?:|//|data:|$)' || true
}

refs="$(
  {
    echo "index.html"   # 页面入口本身也得在
    grep -oE '<script[^>]*[[:space:]]src="[^"]+"' "$repo/index.html" | sed -E 's/.*src="([^"]+)"/\1/'
    grep -oE '<link[^>]*[[:space:]]href="[^"]+"' "$repo/index.html" | sed -E 's/.*href="([^"]+)"/\1/'
  } | local_ref
)"

if printf '%s\n' "$refs" | grep -qx 'desk-book.js'; then
  runtime="$(grep -oE '"vendor/[^"]+\.js"' "$repo/desk-book.js" | tr -d '"' || true)"
  if [ -z "$runtime" ]; then
    echo "desk-book.js 里没 grep 到任何 \"vendor/….js\" 路径——注入写法变了？请同步更新本脚本。" >&2
    exit 1
  fi
  refs="$(printf '%s\n%s\n' "$refs" "$runtime")"
fi
refs="$(printf '%s\n' "$refs" | sed '/^$/d' | sort -u)"

# ---- 2. 解析 Dockerfile 的 COPY：把续行拼起来，得到「源 … 目标」 ----
copies="$(
  sed -e ':a' -e '/\\$/N; s/\\\n/ /; ta' "$dockerfile" \
    | grep -E '^[[:space:]]*COPY[[:space:]]' \
    | grep -v -- '--from=' || true
)"

# 某个文件被哪条 COPY 覆盖、且落地路径与仓库相对路径一致，就算覆盖到。
covered() {
  local want="$1" line
  local -a words sources
  local dest src served last word
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    read -r -a words <<< "$line"
    sources=()
    for word in "${words[@]:1}"; do
      case "$word" in --*) continue ;; esac
      sources+=("$word")
    done
    [ "${#sources[@]}" -ge 2 ] || continue
    last=$(( ${#sources[@]} - 1 ))
    dest="${sources[$last]}"
    sources=("${sources[@]:0:$last}")
    case "$dest" in /*) continue ;; esac   # 目标是绝对路径（如 /etc/nginx/…）：不是站点文件
    dest="${dest#./}"
    for src in "${sources[@]}"; do
      src="${src#./}"
      if [ "$src" = "." ]; then
        served="${dest%/}/$want"   # 整个构建上下文
      elif [ "${src%/}" != "$src" ]; then
        # 整目录：want 在这个目录下，落地为 dest + 目录内相对路径
        case "$want" in "$src"*) served="${dest%/}/${want#"$src"}" ;; *) continue ;; esac
      elif [ "$src" = "$want" ]; then
        if [ -z "$dest" ] || [ "${dest%/}" != "$dest" ]; then served="${dest}${want##*/}"; else served="$dest"; fi
      else
        continue
      fi
      served="${served#/}"
      [ "$served" = "$want" ] && return 0
    done
  done <<< "$copies"
  return 1
}

missing=0
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  problems=""
  [ -f "$repo/$ref" ] || problems="仓库里不存在"
  if ! covered "$ref"; then problems="${problems:+$problems；}Dockerfile 的 COPY 没覆盖到"; fi
  if [ -n "$problems" ]; then
    echo "缺  $ref  （$problems）" >&2
    missing=1
  else
    echo "有  $ref"
  fi
done <<< "$refs"

if [ "$missing" != 0 ]; then
  echo "核对失败：上面标「缺」的文件进不了镜像或根本不存在，线上会静默 404。（Dockerfile：${dockerfile}）" >&2
  exit 1
fi
echo "核对通过：页面引用与运行时注入的本地文件都会被 COPY 进镜像。（Dockerfile：${dockerfile}）"
