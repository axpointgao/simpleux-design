# Third Party Notices

本文件记录 simpleux-design 随技能分发的第三方资产和依赖来源。

## Bootstrap Icons

`assets/icon/` 包含 Bootstrap Icons 的 SVG、CSS、字体和索引文件。

- Source: https://github.com/twbs/icons
- License: MIT License
- Copyright: The Bootstrap Authors

这些图标作为本地设计资产库分发，用于原型、deck、信息图和图解页中按需复制使用。

## Node Dependencies

`package.json` 中的 Node 依赖仅用于本地辅助脚本，例如 Playwright 验证、PDF/PPTX 导出和图片处理。依赖本身不随仓库提交，用户需要时可运行 `npm install` 安装。

## Python Dependencies

`requirements.txt` 中的 Python 依赖仅用于本地 HTML 验证脚本。依赖本身不随仓库提交，用户需要时可用 `python3 -m pip install -r requirements.txt` 安装。
