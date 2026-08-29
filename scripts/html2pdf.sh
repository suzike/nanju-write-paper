#!/usr/bin/env bash
# html2pdf.sh — 用本机 Edge/Chrome 把排版 HTML 打成 PDF（页面尺寸来自 HTML 里的 @page）
# 用法: bash html2pdf.sh input.html output.pdf
# 说明: 独立临时用户目录，避免与常驻 Edge/Chrome 的 Profile 单例锁冲突；
#       stderr 写入 <output>.log，失败时打印末尾几行便于定位。
set -uo pipefail

IN="${1:-}"; OUT="${2:-}"
[ -f "$IN" ] || { echo "ERROR: 找不到 $IN"; exit 1; }
[ -n "$OUT" ] || { echo "ERROR: 缺少输出路径"; exit 1; }

# Windows 实际路径（先解析为绝对路径）与 file:// URL（PowerShell 负责中文百分号编码）
IN_ABS=$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")
OUT_DIR_ABS=$(cd "$(dirname "$OUT")" && pwd)
IN_WIN=$(cygpath -w "$IN_ABS")
OUT_WIN=$(cygpath -w "$OUT_DIR_ABS/$(basename "$OUT")")
FILE_URL=$(powershell -NoProfile -Command "[Uri]::EscapeUriString((('file:///' + (Get-Item -LiteralPath '$IN_WIN').FullName).Replace('\','/')))")
PROFILE_DIR=$(mktemp -d 2>/dev/null || echo "$TEMP/nanju-pdf-profile-$$")
LOG="$OUT.log"

# 候选浏览器（x86/x64 + 用户级安装全覆盖）
CANDIDATES=(
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"
  "/c/Program Files/Google/Chrome/Application/chrome.exe"
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"
  "$LOCALAPPDATA/Microsoft/Edge/Application/msedge.exe"
)
BIN=""
for c in "${CANDIDATES[@]}"; do
  # Git Bash 下 $LOCALAPPDATA 形如 C:\Users\xxx，转一下再探测
  c_fixed=$(echo "$c" | sed 's|\\|/|g; s|^\([A-Za-z]\):|/\L\1|')
  [ -x "$c_fixed" ] && BIN="$c_fixed" && break
done
[ -z "$BIN" ] && { echo "ERROR: 未找到 Edge/Chrome，请检查安装路径"; exit 2; }

"$BIN" --headless=new --disable-gpu \
  --user-data-dir="$(cygpath -w "$PROFILE_DIR" 2>/dev/null || echo "$PROFILE_DIR")" \
  --no-pdf-header-footer \
  --print-to-pdf="$OUT_WIN" "$FILE_URL" >"$LOG" 2>&1

if [ -f "$OUT" ]; then
  rm -f "$LOG"
  echo "OK -> $OUT"
else
  echo "ERROR: PDF 未生成。浏览器日志（末 5 行）："
  tail -5 "$LOG" 2>/dev/null || echo "(无日志)"
  exit 3
fi
