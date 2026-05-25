# Slide Decks：HTML-first 幻灯片主流程

本文件只保留默认执行路径。需要完整踩坑记录、长案例和脚本细节时，再读 `references/deck-case-notes.md`。

## 能力边界

- 默认产物是 HTML 演示版：`index.html` + `slides/*.html`，浏览器里键盘翻页、全屏演讲。
- PDF 是 HTML 的派生快照：视觉保真、文字可搜、不可直接编辑。
- 可编辑 PPTX 是 HTML 的结构化派生物：必须从第一版 HTML 起遵守 `references/editable-pptx.md` 的约束。
- 演示控制层只属于浏览器预览辅助，不属于 slide 内容；全屏演讲、16:9 投影、截图、打印和导出时不得出现上一页、下一页、计数器或箭头提示。
- HTML 演示版必须默认稳定键盘翻页；不需要用户额外提示才修。单文件 `<deck-stage>` 和多文件 `index.html` 都必须响应 `←` / `→` / `Space` / `PgUp` / `PgDown` / `Home` / `End`，并在 iframe、body、stage 获得焦点时保持可用。
- HTML 翻页提示器和计数器默认属于预览控制层，交付态默认隐藏；按 `C` 只用于调试临时显示。一旦进入全屏，必须强制隐藏计数器、左右热区和箭头提示，即使调试控制层当前开启。

## 开工决策

## 开工停止门禁

下面这些条件任一命中时，必须先停在“计划 + 2 页确认稿”，不能直接批量制作完整高保真 deck：

- 正文 `>= 5` 页。
- 正式客户汇报、方案汇报、报告型 deck、课件或长讲座。
- 面向明确客户、品牌、产品或机构。
- 用户一次性给出大量文案，要求生成完整 PPT。

确认前允许产出：

- `brand-spec.md` 或等价品牌/业务语境摘要。
- 交付格式、架构选择、页数范围、章节规划、目录/章节页/封底判断。
- 2-3 个视觉方向建议，或 1 个推荐方向 + 1-2 个备选。
- 2 页视觉确认稿或等价 showcase，通常选视觉差异最大的两页。

确认前禁止产出：

- 完整 5+ 页高保真 deck。
- 32 页这类整套批量页面。
- 未经确认的最终 PDF/PPTX。
- 缺少 SimpleUX 署名策略、封底策略和 publisher 资产计划的客户交付 deck。

继续制作剩余页面前，必须拿到用户明确确认，并在项目中留下记录，例如 `STYLE_CONFIRMATION.md`：

```markdown
# Style Confirmation

- confirmed: true
- confirmed_at: YYYY-MM-DD HH:mm
- confirmed_by: user
- approved_pages: 01-cover.html, 08-service-page.html
- approved_scope: 字体、色彩、间距、masthead、图像规则、信息密度、署名策略、封底策略、情绪基调
```

如果用户明确要求跳过确认直接生成全套，先说明跳过视觉确认会增加整套返工风险；只有用户再次明确接受风险后，才可以继续，并在 `STYLE_CONFIRMATION.md` 记录 `bypass_confirmed: true` 和用户确认摘要。

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

如果 deck 面向明确客户、品牌、产品或机构，先执行 `references/brand-asset-protocol.md`。至少查找或询问 logo、品牌色、官网、现有 App/产品截图、业务关键词、品牌主张和可用素材，并形成 `brand-spec.md` 或等价调研摘要。没有完成品牌调研前，不要直接进入风格方向、2 页确认稿或整套高保真制作。

开工前还必须确认视觉方向。如果用户只给文案、结构或主题，没有给品牌资产、视觉风格或参考方向，先提出 2-3 个适合该主题的视觉方向，或给 1 个推荐方向 + 1-2 个备选；说明背景、字体、色彩、版式、图像、设备展示、SimpleUX 页脚署名和固定封底策略。未确认视觉方向前，不要直接批量生成整套高保真页面。

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

- 正文 `>= 10` 页、正式客户汇报、报告型 deck、课件、长讲座、多 agent 并行、包含多个截图页/章节页/封底页：必须使用多文件架构。
- 正文 `<= 10` 页、pitch demo、强跨页交互或全局 Tweaks：可使用单文件 `<deck-stage>`。

多文件架构优先，因为每页 CSS 隔离、可单页验证、便于并行开发。

禁止为了省事把长篇正式汇报默认做成单文件 `<deck-stage>`。如果用户明确要求单文件，先说明风险：CSS 全局污染、单页调试困难、导出路径更复杂、后续维护和多人协作成本更高；用户确认接受风险后再执行。

## 批量制作规则

Deck 正文 `>= 5` 页时，必须先做 2 页 showcase 或视觉确认稿定视觉 grammar。这是停止门禁，不是建议：

1. 选择视觉结构差异最大的两页，如封面 + 内容页、章节页 + 产品展示页、服务页 + 总结页、数据页 + 截图页。
2. 截图给用户确认字体、色彩、间距、masthead、图像规则、信息密度和情绪基调。
3. 用户确认后再批量制作剩余页面，并保存 `STYLE_CONFIRMATION.md` 或等价确认记录。

这样可以把“方向错”的返工面控制在 2 页，而不是整套 deck。

如果用户明确要求跳过确认直接生成全套，先说明跳过视觉方向确认和 2 页 showcase 会增加整套返工风险；用户确认接受风险后，才可以继续，并记录 bypass 确认。没有确认记录时，交付门禁检查应失败。

## 设计系统

开工前先口头确认 deck 系统：

```markdown
Deck 系统：
- 背景：白底为主，少量深色章节页
- 字型：中文必须使用无衬线字体；英文 display 可按风格选择
- 色彩：品牌主色 + 中性色，accent 每页不超过 3 处
- 版式：封面 / 章节页 / 内容页 / 数据页 / 引用页 / 封底页六类
- 图像：产品截图用设备框，照片 full-bleed，数据页图表做主角
- 出品方署名：客户交付材料按需在左下角放 SimpleUX 保密署名
- 封底页：客户交付 deck 默认生成 N 页内容 + 1 页固定 SimpleUX 封底
- 演示控制：控制层默认隐藏；需要调试时用 C 键临时显示，交付观感保持干净
- 键盘翻页：默认稳定支持方向键、空格、PageUp/PageDown、Home/End；不把键盘翻页留给用户后续提示修复
- 全屏演讲：全屏时强制隐藏浏览器 deck 控制层，画面只保留 slide 内容
```

尺度规则：

- 中文标题、正文、注释、图形节点、页脚和封底信息不得使用中文衬线字体。
- 中文字体栈优先使用 `"PingFang SC"`, `"Microsoft YaHei"`, `"Noto Sans SC"`, `system-ui`, `sans-serif`；不要使用宋体、思源宋体、Noto Serif SC 等中文衬线。
- 英文 display、品牌英文标识或少量英文装饰文本可按风格使用 serif，但不得让中文跟随回落到衬线字体。
- 正文最小 20px，理想 24-36px；演讲型核心正文优先 28-36px。
- 20-23px 只用于辅助说明、注释、图表标签、页脚或高密度信息区，不承载核心结论。
- 内容页 H1 使用 48-64px，默认 56-60px；除非是封面、章节页或大字观点页，不要超过 64px。
- 内容页标题容器默认 `max-width: 80%`（以扣除页面 padding 后的内容区为参照），不要因为标题短就强制收窄或换行。
- 允许 `text-wrap: balance` 为视觉均衡提前换行；说明“80%”时要写成容器上限，不要暗示文字必须撑满 80% 才换行。
- 只有为了给右侧截图、图表、模型图或其他视觉主角让位时，才把标题容器收窄到约 56%-64%。
- Hero / 章节 / 大字观点页标题最多 120px；只有标题本身是页面主视觉时才使用。
- 每页 1 个核心记忆点，超过就拆页。

### Deck 结构规划

制作 deck 时，即使用户没有明确要求目录页或章节页，也要先做轻量结构判断。这个判断只决定目录页和章节页是否需要；固定 SimpleUX 封底页按客户交付 deck 默认规则追加，不因结构规划省略。

- 先从文档标题、一级标题、阶段词和内容主题中归纳一级章节。
- 一级章节建议 3-5 个，最多不得超过 5 个。
- 如果原始材料有 6+ 个标题，不要逐个变成章节；必须合并、降级或归入二级主题。
- 章节是演讲导航，不是 Markdown 标题映射。

目录页判断：

- 正式客户汇报、方案汇报、报告型 deck 或课件，只要内容天然分成 3+ 个一级章节，默认生成目录页；不要等用户额外提示。
- 目录页不是按页数机械添加。
- 正文 6-8 页通常不默认添加目录页；除非是正式客户汇报，且内容天然分成 3+ 个清晰章节。
- 正文 9-12 页可考虑目录页，但如果是线性叙事、短 pitch 或页数紧张，不加。
- 正文 12 页以上默认考虑目录页。
- 用户指定固定页数时，目录页计入内容页数；如果会挤压核心内容，优先不放独立目录页。

章节页判断：

- 章节页只服务一级章节，不为二级主题单独生成章节页。
- 正式客户汇报、报告型 deck 或课件如果已经规划 3+ 个一级章节，且每章至少 2 页内容，默认生成章节页；不要等用户额外提示。
- 通常 12+ 页，或 3+ 个一级章节且每章有多页内容时，才使用独立章节页。
- 短 deck 不默认放章节页；可用页内 masthead、章节标签、页码结构表达章节感。

结构页稳定性门禁：

- `DECK_MANIFEST` 必须把目录页、章节页、封底页按实际演讲顺序列出，不能只在文件夹中放模板但不接入。
- 决定不放目录页或章节页时，必须在 deck 计划或交付说明中写明原因，例如页数短、线性叙事、章节不足或固定页数挤压正文。
- 客户交付 deck 默认追加固定 SimpleUX 封底页；只有用户明确要求去除 SimpleUX 封底，或品牌/合规冲突时才可省略，并在交付说明中记录原因。

### 固定模板页

目录页、章节页和封底页是固定模板页型。凡结构判断需要目录页或章节页，或客户交付 deck 默认需要封底页时，必须复制 `assets/deck-templates/toc.html`、`assets/deck-templates/section.html` 或 `assets/deck-templates/back-cover.html` 到项目 `slides/` 目录，再替换文案和 CSS 变量。不得临场从零重写这些页面的结构。结构、字体类别和字号固定；色彩、背景、分隔线透明度、光效、图片氛围和署名 logo 使用当前 deck token 适配，不逐像素复制参考页。

`assets/deck-templates/` 只放可以复制到 `slides/` 的页面模板；`assets/publisher/` 只放这些模板依赖的 SimpleUX logo、视频和组合标识等品牌媒体资源。

模板复制后至少设置这些变量：

```css
:root {
  --deck-bg: 当前 deck 背景色;
  --deck-fg: 当前 deck 前景文字色;
  --deck-muted: 当前 deck 辅助文字色;
  --deck-accent: 当前 deck 强调色;
  --deck-line: 当前 deck 细分隔线颜色;
  --signature-logo: url("../shared/publisher/simpleux-light.png");
}
```

模板资源按页面所在位置选择路径：在 skill 的 `assets/deck-templates/` 目录直接预览时，模板使用 `../publisher/` 内置资源；复制到项目 `slides/` 目录后，模板默认使用 `../shared/publisher/` 项目资源。制作实际 deck 时，必须把署名 logo 复制到项目 `shared/publisher/` 或明确覆盖 `--signature-logo`，不能留下空 logo 占位。交付前必须打开目录页/章节页检查 SimpleUX 保密署名可见且没有破图。

浅底目录页或章节页必须把 `--signature-logo` 覆盖为 `url("../shared/publisher/simpleux-dark.png")`，或使用项目内等价深色 logo 路径；不要沿用默认浅色 logo。

目录页模板：

- 左上放页面类型标识：中文 `目录`，可附小号英文 `CONTENT`。
- 主体使用 2-5 个一级章节条目；超过 5 个时必须合并或降级为右侧短说明里的二级主题。每条包含 DIN 类数字编号、章节主标题和可选右侧短说明。
- 章节编号约 64px，使用 DIN 类数字字体；章节主标题约 48px；右侧短说明约 16-18px，并使用较轻字重和低强调文字 token。
- 条目之间使用横向 1px 细分隔线或等价网格线；不使用卡片堆叠，不使用复杂图形替代目录结构。
- 目录页只承担全局导航，不承载正文段落、图表或复杂逻辑图形。

章节页模板：

- 顶部保留 masthead、项目名或细分隔线，作为 deck 连续性线索。
- 左侧使用大号 DIN 类章节编号 + 中文章节标题；编号约 128px，标题约 104px。
- 标题下放 1-4 条短主题，字号约 22-24px，用来说明本章范围；主题行属于辅助信息，必须比章节标题更轻、更小，并通过低强调文字 token 降低视觉权重。
- 左下固定放置 SimpleUX 保密署名，沿用出品方署名规则。
- 右侧可放弱化英文背景词，只做氛围和空间平衡，不参与主要阅读。
- 可使用深色照片遮罩、纯色品牌底、黑底光带或极简线条，但必须映射到当前 deck token。
- 章节页只做节奏切换，不承载大量正文、图表或复杂逻辑图形。

### 设备样机壳

Deck 中展示 App/Web/PC/移动端 UI 截图时，必须读取 `references/device-mockups.md`，并使用 `assets/device-mockups/` 的真实设备样机壳和 `manifest.json` 屏幕区域参数，不要默认手画黑色圆角框、黑色浏览器框或普通黑色矩形外框。手机外壳和 PC 外壳层级不同；具体使用时机、长图裁切、透视外壳限制、PC 屏幕填充和组合方式见 `references/device-mockups.md`。

如果当前项目确实没有匹配设备资产，先告诉用户缺少匹配样机并询问是否接受临时 CSS 占位；用户确认前，不要把 CSS 手画设备框当作正式交付。

### 图形表达

图形只是增强理解的手段，不是 deck 优秀与否的核心。制作 deck 时先判断图形是否能让当前页更清楚：如果标题、分组文本、数据或图片已经足够表达，就保持常规 deck 版式；但当页面核心是关系、流程、阶段、系统、矩阵、模型、闭环、架构、服务地图、体验链路、经营逻辑、信息图或图解说明时，必须读取 `references/logic-graphics.md` 并做逻辑图形选型。

执行规则：

- 不要为了“更丰富”强行画图；如果图形不能减少理解成本，就不要画。
- 先找内容关系，再找表达方式：并列、流程、闭环、层级、系统、对照、矩阵或诊断。
- 简单图解优先用当前 deck 的 HTML/CSS 自由设计；需要稳定结构、复用组件或质检时再使用组件库。
- 如需记录制作判断，可用 `graphicIntent`：`none`、`simple-custom`、`component-json`、`template-motif`，但不要把它变成繁琐流程。对于关系/流程/系统/矩阵/模型页，如果选择 `none` 或 `simple-custom`，必须能说明为什么组件库或模板母题不合适。
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
- 如果内页使用出品方署名，把 `simpleux-dark.png` 和 `simpleux-light.png` 复制到项目内的 `deck/shared/publisher/`。
- 使用目录页或章节页固定模板时，必须保证对应 logo 资源可用；深底默认使用 `simpleux-light.png`，浅底必须覆盖为 `simpleux-dark.png`。
- 客户交付 deck 的普通内页默认使用 SimpleUX 保密署名页脚，除非该页是封面、强视觉页、客户品牌冲突页，或左下角已有正文/图表/关键信息会与署名冲突。
- 所有普通内页如果不放署名，必须在 `PUBLISHER_EXCEPTIONS.md` 记录页文件和原因；不能批量省略。
- 生成 HTML deck 时，页脚署名是默认产物要求，不是可选增强项；AI 不应等用户明确说“加页脚署名”才补。
- 页脚署名只做轻量归属和保密提示，不参与主视觉竞争。
- 页脚署名文字必须很小，建议文字约 11px；但 logo 不应缩到不可识别，建议保持约 24px 高，只让说明文字轻量化。
- 以上小字号只适用于出品方署名这种辅助角标，是特殊处理，不影响 deck 正文最小字号和内容页尺度规范。
- 目录页和章节页作为固定模板默认放左下 SimpleUX 保密署名。
- 不能因为省事完全省略普通内页署名。若某页不放署名，应有明确构图或品牌冲突原因。
- 不允许为了放署名压缩正文、遮挡图表或破坏构图。
- 浅底页面使用 `simpleux-dark.png`；深底页面使用 `simpleux-light.png`。

### 固定封底页

客户交付 deck 默认额外追加一页 SimpleUX 封底页，作为最后一页，用于正式收尾、设计方署名和留资。封底页不是内页页脚变体，也不替代客户品牌主视觉。

用户要求 N 页内容时，默认交付为 N 页内容 + 1 页固定封底；只有用户明确说不要 SimpleUX 署名/封底时才省略。

制作步骤：

1. 复制 `assets/deck-templates/back-cover.html` 为项目内的 `slides/99-back-cover.html`。
2. 把 `assets/publisher/SimpleUX.mp4` 与 `assets/publisher/FullSpeed&SimpleUX.png` 复制到项目内的 `shared/publisher/`，保持模板内的 `../shared/publisher/` 资源引用可用。
3. 在 `DECK_MANIFEST` 末尾追加封底页。
4. 运行 `npm run deck:verify -- --deck path/to/deck --customer` 或等价命令，确认封底、署名和 publisher 资源齐全。

```text
deck/
├── slides/
│   └── 99-back-cover.html
└── shared/
    └── publisher/
        ├── FullSpeed&SimpleUX.png
        └── SimpleUX.mp4
```

```js
{ file: "slides/99-back-cover.html", label: "封底" }
```

封底页必须作为 `index.html` 演示流的最后一页参与键盘翻页和全屏演讲，不要作为独立文件单独交付。`assets/deck_index.html` 支持接收 iframe 内页面发出的翻页命令；封底模板已内置方向键、Space、Home/End 和 P 打印的转发逻辑。

不要临场重写封底布局。除非用户明确要求，否则不修改模板结构、文案、联系信息、底部品牌带、媒体引用、`#stage` 适配逻辑或键盘转发脚本。具体布局由 `assets/deck-templates/back-cover.html` 维护；历史说明和维护细节见 `references/deck-case-notes.md`。

## 交付门禁脚本

客户交付 deck、正式汇报或正文 5 页以上 deck 交付前，必须运行：

```bash
cd simpleux-design
npm run deck:verify -- --deck /path/to/deck --customer --min-slides 5
```

脚本检查：

- `index.html` 是否存在 `DECK_MANIFEST`。
- `STYLE_CONFIRMATION.md` 是否记录用户确认或 bypass 确认。
- `shared/publisher/` 是否包含 `simpleux-dark.png`、`simpleux-light.png`、`SimpleUX.mp4`、`FullSpeed&SimpleUX.png`。
- `DECK_MANIFEST` 最后一页是否为封底，且对应文件来自 `back-cover` 模板。
- 普通内页是否包含 `publisher-confidential` 或 `SimpleUX | CONFIDENTIAL&PROPRIETARY` 等署名结构。
- 缺署名的普通内页是否在 `PUBLISHER_EXCEPTIONS.md` 记录原因。
- `index.html` 是否内置稳定键盘翻页逻辑。
- `index.html` 是否在全屏时隐藏计数器、左右热区和箭头提示。

脚本失败时不得交付，先返工。

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
8. 打开 `index.html` 后不点击页面，直接按方向键和空格，确认可翻页。
9. 若有目录页/章节页/封底页，确认它们来自固定模板，并已接入 `DECK_MANIFEST`。
10. 确认 `shared/publisher/` 中有 SimpleUX 署名和封底所需资产，目录页/章节页/普通内页页脚没有破图。
11. 若页面展示 App/Web/PC/移动端 UI，确认使用了 `assets/device-mockups/` 真实样机壳和屏幕层结构；不得出现未说明的手画黑框设备。
12. 若页面表达关系/流程/系统/矩阵/模型/闭环/架构/服务地图，确认已做逻辑图形选型；使用 `component-json` 或 `template-motif` 时必须带 `data-logic-graphic` 并通过质检。
13. 确认演示控制层不进入 slide 内容：默认打开、全屏、16:9 投影、截图、打印和导出时不得看到上一页、下一页、计数器或箭头提示；只允许用 C 键临时显示控制层做调试。
14. 正文 5 页以上或客户交付 deck，确认存在 `STYLE_CONFIRMATION.md`，并运行 deck 交付门禁脚本。
15. 客户交付 deck，确认普通内页有 SimpleUX 保密署名页脚；省略署名的页面必须写入 `PUBLISHER_EXCEPTIONS.md` 并说明构图或品牌冲突原因。
