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
- 版式：封面 / 章节页 / 内容页 / 数据页 / 引用页 / 封底页六类
- 图像：产品截图用设备框，照片 full-bleed，数据页图表做主角
- 出品方署名：客户交付材料按需在左下角放 SimpleUX 保密署名
- 封底页：所有 deck 额外追加固定 SimpleUX 封底页，用于署名和留资
```

尺度规则：

- 正文最小 24px，理想 28-36px。
- 标题 60-120px。
- Hero 字 180-240px。
- 每页 1 个核心记忆点，超过就拆页。

### 设备样机壳

Deck 中展示 App/Web/PC/移动端 UI 截图时，必须读取 `references/device-mockups.md`，优先使用 `assets/device-mockups/` 的真实设备样机壳，不要默认手画黑色圆角框。手机外壳和 PC 外壳层级不同；具体使用时机、长图裁切、透视外壳限制、PC 屏幕填充和组合方式见 `references/device-mockups.md`。

### 图形表达

图形只是增强理解的手段，不是 deck 优秀与否的核心。制作 deck 时先判断图形是否能让当前页更清楚：如果标题、分组文本、数据或图片已经足够表达，就保持常规 deck 版式；只有当页面核心是关系、流程、阶段、系统、矩阵、模型、信息图或图解说明时，才读取 `references/logic-graphics.md` 并考虑图形表达。

执行规则：

- 不要为了“更丰富”强行画图；如果图形不能减少理解成本，就不要画。
- 先找内容关系，再找表达方式：并列、流程、闭环、层级、系统、对照、矩阵或诊断。
- 简单图解优先用当前 deck 的 HTML/CSS 自由设计；需要稳定结构、复用组件或质检时再使用组件库。
- 如需记录制作判断，可用 `graphicIntent`：`none`、`simple-custom`、`component-json`、`template-motif`，但不要把它变成繁琐流程。
- `component-json` 使用 `scripts/render_logic_graphic.mjs` 生成完整 HTML 页面或可嵌入片段；`template-motif` 使用 `scripts/render_template_motif.mjs`。
- 使用组件库或模板母题时，组件根节点必须带 `data-logic-graphic`，固定 1920×1080 画布。
- 文字优先使用 HTML 文本块，避免中文长句直接写入 SVG 单行文本。
- 同一层级组件必须共享字号、线宽、圆角、颜色和间距 token。
- 带 `data-logic-graphic` 的页面生成后运行 `scripts/verify_logic_graphics.mjs`，或在 `scripts/verify.py` 中加 `--logic-graphics`。

图形页交付前做轻量质量门槛检查，这不是复杂流程，而是设计师的最后一眼：

- 图形必须比普通排版更快说明关系；如果读图成本更高，退回文字、分区或数据页。
- 文本、节点、标签、箭头和装饰线不得互相遮挡；连接线不得穿过正文。
- 箭头只表达真实方向、因果或流转；能用空间位置、分组、编号或方向带说明时，少用箭头。
- 箭头、连接线和节点边缘之间要留安全距离，不贴字、不插入卡片、不压中心标题。
- 曲线箭头的箭头角度要顺着曲线末端自然延续；做不到时改直线、折线、方向带或三栏流程。
- 半透明线条不要叠出脏色或让箭头尾部穿帮；关键箭头优先用实色浅线、低对比实色或更简洁的分区表达。

基础组合示例只说明 JSON、布局和组件调用方式，不是可以直接作为 deck 交付页的稳定模板。不要把历史页面或外部参考翻译成逐像素坐标；真实项目应根据当前页要表达的关系选择轻量自定义图解、组件库 JSON 或模板母题。

### 出品方署名

`assets/publisher/` 内置我司 SimpleUX 纯 logo：

- `simpleux-dark.png`：浅底使用的深色 logo。
- `simpleux-light.png`：深底使用的浅色 logo。

在方案 deck、汇报材料、客户交付材料中，内页可在左下角放置出品方保密署名：

`[logo] SimpleUX | CONFIDENTIAL&PROPRIETARY`

使用原则：

- 这是设计方/出品方署名，不是客户品牌；客户品牌仍按品牌资产协议决定主视觉。
- 页脚署名只做轻量归属和保密提示，不参与主视觉竞争。
- 页脚署名文字必须很小，建议文字约 11px；但 logo 不应缩到不可识别，建议保持约 24px 高，只让说明文字轻量化。
- 以上小字号只适用于出品方署名这种辅助角标，是特殊处理，不影响 deck 正文最小字号和内容页尺度规范。
- 不是所有页面都放。封面、章节页、强视觉页、左下角已有正文/图表/客户品牌信息、或会与内容冲突时，不放。
- 不允许为了放署名压缩正文、遮挡图表或破坏构图。
- 浅底页面使用 `simpleux-dark.png`；深底页面使用 `simpleux-light.png`。

### 固定封底页

所有 deck 默认额外追加一页 SimpleUX 封底页，作为最后一页，用于正式收尾、设计方署名和留资。封底页不是内页页脚变体，也不替代客户品牌主视觉。

封底页布局固定，参考 `简立方公司封底.pptx`：

- 黑底全屏。
- 左上大号绿色 `Thanks`。
- `Thanks` 下方放公司一句话定位，必须单行显示，并与左侧留资信息的专线左边缘对齐。
- 留资信息按参考封底排版：左侧纵向放专线、固定电话和官网，整体字号小于定位语，并与定位语拉开足够行距；右侧放 `公司地址:` 标题与 3+2 城市地址网格。
- 留资信息区域应以底部绿色品牌带为参考进行 bottom 锚定，和底部区域保持稳定高度关系，不要悬在页面中部。
- 固定电话保持统一格式：区号含 `-` 独立对齐，号码部分按 4 位加空格分组并对齐；城市括号标注保持当前辅助字号，不再跟随留资号码继续缩小。
- 官网必须是可点击链接，跳转到 `https://www.simpleux.cn`；链接下划线用连续线，不能被字母下伸部打断。
- 公司详细地址固定两行：第一行城市和区，第二行详细地址；第二行不换行。
- 右上角放 `assets/publisher/SimpleUX.mp4` 作为 3D 品牌图形，尺寸应接近右上视觉主角，必须自动、静音、循环播放；若导出环境不支持视频，取首帧或静态替代图。
- 底部放整条绿色品牌带，左侧使用 `assets/publisher/FullSpeed&SimpleUX.png` 组合标识，右侧放 `全速集团旗下用户体验设计品牌`；两者尺寸都要明显小于内容区文字，只承担品牌归属。

封底页字体可跟随当前 deck 字体系统，但字号、层级和空间比例必须接近参考封底：`Thanks` 和右上 3D 图形是主视觉，定位语单行且与留资左缘对齐，联系信息、地址、底部组合标识和品牌说明都要降级处理。封底留资和底部品牌带的小字号属于固定封底的特殊信息层级，不改变常规 deck 正文最小字号规则。

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
6. 如果页面包含 `data-logic-graphic`，运行逻辑图形质检并处理所有失败项。
7. 如导出 PDF/PPTX，打开最终文件逐页检查。
