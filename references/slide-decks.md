# Slide Decks：HTML-first 幻灯片主流程

本文件只保留默认执行路径。需要完整踩坑记录、长案例和脚本细节时，再读 `references/deck-case-notes.md`。

## 能力边界

- 默认产物是 HTML 演示版：`index.html` + `slides/*.html`，浏览器里键盘翻页、全屏演讲。
- PDF 是 HTML 的派生快照：视觉保真、文字可搜、不可直接编辑。
- 可编辑 PPTX 是 HTML 的结构化派生物：必须从第一版 HTML 起遵守 `references/editable-pptx.md` 的约束。

## 开工决策

先问最终交付格式：

```text
你需要哪个导出格式？
- 只要 HTML：视觉自由度最高。
- HTML + PDF：视觉自由度最高，完成后导出矢量 PDF。
- HTML + 可编辑 PPTX：从第一行 HTML 起按 PPTX 约束写，会牺牲渐变、web component 和复杂 SVG。
```

决策树：

```text
HTML-first deck
├─ 只演讲/存档：多文件 HTML 即完成
├─ 要 PDF：多文件 HTML → export_deck_pdf.mjs
└─ 要可编辑 PPTX：按 editable HTML 约束 → export_deck_pptx.mjs
```

如果 HTML 已经自由写完才发现要可编辑 PPTX，不要硬转；优先建议 PDF。用户坚持 editable 时，按视觉稿重写一版 editable HTML。

## 架构选择

默认使用多文件架构：

```text
deck/
├── index.html
├── shared/
│   └── tokens.css
└── slides/
    ├── 01-cover.html
    ├── 02-agenda.html
    └── ...
```

选择规则：

- `>= 10` 页、长讲座、课件、报告、多 agent 并行：使用多文件架构。
- `<= 10` 页、pitch demo、强跨页交互或全局 Tweaks：可使用单文件 `<deck-stage>`。

多文件架构优先，因为每页 CSS 隔离、可单页验证、便于并行开发。

## 批量制作规则

Deck `>= 5` 页时，先做 2 页 showcase 定视觉 grammar：

1. 选择视觉结构差异最大的两页，如封面 + 内容页、章节页 + 数据页。
2. 截图给用户确认字体、色彩、间距、masthead、图像规则。
3. 确认后再批量制作剩余页面。

这样可以把“方向错”的返工面控制在 2 页，而不是整套 deck。

## 设计系统

开工前先口头确认 deck 系统：

```markdown
Deck 系统：
- 背景：白底为主，少量深色章节页
- 字型：display 用 [字体]，body 用 [字体]
- 色彩：品牌主色 + 中性色，accent 每页不超过 3 处
- 版式：封面 / 章节页 / 内容页 / 数据页 / 引用页五类
- 图像：产品截图用设备框，照片 full-bleed，数据页图表做主角
- 出品方署名：客户交付材料按需在左下角放 SimpleUX 保密署名
```

尺度规则：

- 正文最小 24px，理想 28-36px。
- 标题 60-120px。
- Hero 字 180-240px。
- 每页 1 个核心记忆点，超过就拆页。

### 出品方署名

`assets/publisher/` 内置我司 SimpleUX 纯 logo：

- `simpleux-dark.png`：浅底使用的深色 logo。
- `simpleux-light.png`：深底使用的浅色 logo。

在方案 deck、汇报材料、客户交付材料中，内页可在左下角放置出品方保密署名：

`[logo] SimpleUX | CONFIDENTIAL&PROPRIETARY`

使用原则：

- 这是设计方/出品方署名，不是客户品牌；客户品牌仍按品牌资产协议决定主视觉。
- 页脚署名只做轻量归属和保密提示，不参与主视觉竞争。
- 不是所有页面都放。封面、章节页、强视觉页、左下角已有正文/图表/客户品牌信息、或会与内容冲突时，不放。
- 不允许为了放署名压缩正文、遮挡图表或破坏构图。
- 浅底页面使用 `simpleux-dark.png`；深底页面使用 `simpleux-light.png`。

## 多文件模板

每页是完整 HTML，`body` 就是固定画布：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>P05 · Chapter Title</title>
<link rel="stylesheet" href="../shared/tokens.css">
<style>
  body { width: 1920px; height: 1080px; overflow: hidden; }
  .page { width: 100%; height: 100%; padding: 96px 120px; }
</style>
</head>
<body>
  <main class="page">
    <h1>标题用断言句</h1>
    <p>副标题补充上下文</p>
  </main>
</body>
</html>
```

`index.html` 从 `assets/deck_index.html` 复制，修改 `window.DECK_MANIFEST`：

```js
window.DECK_MANIFEST = [
  { file: "slides/01-cover.html", label: "01 封面" },
  { file: "slides/02-agenda.html", label: "02 目录" }
];
```

## 单文件 `<deck-stage>` 注意事项

使用 `assets/deck_stage.js` 时：

- `<script src="deck_stage.js">` 放在 `</deck-stage>` 之后，或在 `<head>` 中加 `defer`。
- 不要给 `deck-stage > section` 写 `display:flex/grid`。
- layout 写到 section 内部 wrapper，或只给 `section.active` 写 display。

完整 CSS 陷阱和修复记录见 `references/deck-case-notes.md`。

## 导出

多文件 PDF：

```bash
node scripts/export_deck_pdf.mjs --slides slides --out deck.pdf
```

单文件 deck-stage PDF：

```bash
node scripts/export_deck_stage_pdf.mjs --html deck.html --out deck.pdf
```

可编辑 PPTX：

```bash
node scripts/export_deck_pptx.mjs --slides slides --out deck.pptx
```

运行脚本前，在 `simpleux-design/` 或项目目录安装依赖：

```bash
npm install
npm run install-browsers
```

PPTX 约束详见 `references/editable-pptx.md`。

## 验证清单

1. 浏览器打开 `index.html`，首页无破图、字体正常。
2. 按方向键翻完所有页，无空白页、重叠、裁切。
3. 随机打开 3 个 `slides/*.html` 单页检查。
4. Playwright 批量截图，人工肉眼过一遍。
5. 搜 `TODO` / `placeholder`，确认没有未替换内容。
6. 如导出 PDF/PPTX，打开最终文件逐页检查。
