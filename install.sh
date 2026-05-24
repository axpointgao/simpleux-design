#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${SIMPLEUX_DESIGN_REPO:-https://github.com/axpointgao/simpleux-design.git}"
REF="${SIMPLEUX_DESIGN_REF:-main}"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
DEST="${SIMPLEUX_DESIGN_DEST:-$CODEX_SKILLS_DIR/simpleux-design}"

if ! command -v git >/dev/null 2>&1; then
  echo "未找到 git，请先安装 git 后重试。"
  exit 1
fi

mkdir -p "$(dirname "$DEST")"

if [ -d "$DEST/.git" ]; then
  echo "检测到已安装目录：$DEST"
  git -C "$DEST" fetch --tags origin "$REF"
  if git -C "$DEST" rev-parse --verify --quiet "refs/remotes/origin/$REF" >/dev/null; then
    git -C "$DEST" checkout -B "$REF" "origin/$REF"
    git -C "$DEST" pull --ff-only origin "$REF"
  else
    git -C "$DEST" checkout "$REF"
  fi
elif [ -e "$DEST" ]; then
  echo "目标目录已存在但不是 Git 仓库：$DEST"
  echo "请先备份或删除该目录，再重新安装。"
  exit 1
else
  git clone --branch "$REF" --depth 1 "$REPO_URL" "$DEST"
fi

echo "simpleux-design 已安装/更新到：$DEST"
echo "请重启 Codex 以加载技能。"
