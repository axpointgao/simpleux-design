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

## 可选依赖

核心技能只需要安装到 Codex 技能目录即可。只有在使用本地脚本导出 PDF/PPTX、渲染逻辑图形或跑 Playwright 验证时，才需要安装依赖。

```bash
cd "${CODEX_HOME:-$HOME/.codex}/skills/simpleux-design"
npm install
npm run install-browsers
python3 -m pip install -r requirements.txt
```

## 常用验证

```bash
npm run logic:verify-examples
npm run logic:verify-bad-fixtures
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
