#!/usr/bin/env bash
set -euo pipefail

DEST="${SIMPLEUX_DESIGN_DEST:-${CODEX_HOME:-$HOME/.codex}/skills/simpleux-design}"
REF="${SIMPLEUX_DESIGN_REF:-main}"

if [ ! -d "$DEST/.git" ]; then
  echo "未找到 Git 安装目录：$DEST"
  echo "请先运行 install.sh 安装 simpleux-design。"
  exit 1
fi

git -C "$DEST" fetch --tags origin "$REF"
if git -C "$DEST" rev-parse --verify --quiet "refs/remotes/origin/$REF" >/dev/null; then
  git -C "$DEST" checkout -B "$REF" "origin/$REF"
  git -C "$DEST" pull --ff-only origin "$REF"
else
  git -C "$DEST" checkout "$REF"
fi

echo "simpleux-design 已更新：$DEST"
echo "请重启 Codex 以加载最新技能。"
