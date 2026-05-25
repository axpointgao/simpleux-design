# SimpleUX Design

SimpleUX Design 是一个面向 Codex 的 HTML-first 设计技能，用于创建高保真 App/Web 原型、演示 deck、信息图、逻辑图形、品牌资产整理和结构化设计评审。

## 安装

使用公开 GitHub 仓库安装到 Codex 技能目录：

```bash
curl -fsSL https://raw.githubusercontent.com/axpointgao/simpleux-design/main/install.sh | bash
```

安装完成后，重启 Codex 让技能生效。

如果你想指定安装版本或分支：

```bash
SIMPLEUX_DESIGN_REF=v0.1.0 bash -c "$(curl -fsSL https://raw.githubusercontent.com/axpointgao/simpleux-design/main/install.sh)"
```

## 更新

重复执行安装命令会自动更新已安装的 Git 目录：

```bash
curl -fsSL https://raw.githubusercontent.com/axpointgao/simpleux-design/main/install.sh | bash
```

也可以在本地已安装目录执行：

```bash
bash "${CODEX_HOME:-$HOME/.codex}/skills/simpleux-design/update.sh"
```

## 目录结构

```text
simpleux-design/
├── SKILL.md                 # 技能入口和触发说明
├── agents/openai.yaml       # Codex UI 展示元数据
├── references/              # 按需读取的工作流、设计规则和评审指南
├── assets/                  # 设备样机、图标、deck 模板、showcase 和出品方资产
├── scripts/                 # 验证、逻辑图形渲染、PDF/PPTX 导出脚本
├── package.json             # Node 脚本依赖
└── requirements.txt         # Python 验证脚本依赖
```

## 完整依赖

核心技能只需要安装到 Codex 技能目录即可。若只让 Codex 读取 `SKILL.md` 和 `references/`，不需要安装 Node 或 Python 依赖。

如果要完整使用本技能的本地脚本能力，例如 PDF/PPTX 导出、逻辑图形渲染、逻辑图形质检、deck 交付门禁、Playwright 截图验证，需要先准备：

- Git：安装和更新技能。
- curl 与 bash：执行一行安装命令。
- Node.js 18+ 与 npm：运行 `scripts/*.mjs`、PDF/PPTX 导出、逻辑图形渲染和 Node 版 Playwright。
- Python 3.9+ 与 pip：运行 `scripts/verify.py`。
- Chromium：由 Playwright 安装，用于截图、PDF 导出和 HTML 验证。

完整安装命令：

```bash
cd "${CODEX_HOME:-$HOME/.codex}/skills/simpleux-design"
npm install
npm run install-browsers
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium
```

Linux 用户如果遇到 Chromium 缺少系统库，可追加安装 Playwright 系统依赖：

```bash
npx playwright install-deps chromium
python3 -m playwright install-deps chromium
```

依赖对应关系：

```text
技能触发、读取工作流                 不需要额外依赖
逻辑图形 JSON 渲染                  Node.js + npm install
逻辑图形质检                         Node.js + Playwright Chromium
客户 deck 交付门禁                   Node.js + npm install
PDF 导出                             Node.js + Playwright Chromium + pdf-lib
可编辑 PPTX 导出                     Node.js + Playwright Chromium + pptxgenjs + sharp
HTML 截图与控制台验证                Python + Python Playwright Chromium
```

## 常用验证

```bash
npm run logic:verify-examples
npm run logic:verify-bad-fixtures
npm run deck:verify -- --deck /path/to/deck --customer --min-slides 5
python3 scripts/verify.py path/to/file.html
```

## 发布边界

- `assets/icon/` 内置 Bootstrap Icons 的 SVG 和字体资源，供原型、deck 和信息图按需复制使用，不建议把整套图标复制到交付项目。
- `assets/showcases/` 是风格方向展示素材，用来帮助快速比较视觉方向。
- `assets/publisher/` 是 SimpleUX 出品方署名和封底模板使用的品牌资产。
- `package.json` 仅用于技能辅助脚本依赖，本仓库不作为 npm 包发布。
- 用户自己的品牌资产、客户资料和私有素材不要放入技能目录，避免后续更新时被覆盖或误分发。

## 许可证

本技能代码和文档使用 MIT License。第三方资产说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
