# Deck Quick Guide：HTML-first 轻量默认路径

本文件是常规 HTML deck 的默认读取入口，覆盖普通短 deck、内部草稿和快速演示。项目方案、POC 提案和设计提案属于正式方案场景：上游先读 `references/scenario-workflows.md`，进入制作阶段后直接读 `references/slide-decks.md`，不走本 quick guide。

## 默认路径

1. 先确认交付格式：HTML、HTML+PDF，或 HTML+可编辑 PPTX。
2. 常规 deck 默认使用多文件架构：`index.html` + `slides/*.html` + `shared/`。
3. 正文 5 页以上、正式汇报、报告型 deck、课件、长讲座或客户交付 deck，先停在“结构计划 + 2 页视觉确认稿”，不要直接批量生成完整高保真页面。
4. 用户确认字体、色彩、间距、masthead、图像规则、信息密度、署名策略、封底策略和情绪基调后，再制作剩余页面，并保存 `STYLE_CONFIRMATION.md` 或等价记录。

## 不适用场景

遇到以下任务，不要停留在 quick guide：

- 项目方案、项目建议、合作方案、体验升级建议。
- POC 提案、招标设计方案、评分标准响应、指定样稿命题。
- 设计提案、多方向方案、方向评审、交互或视觉方向对比。
- 正式客户交付、报告型 deck、复杂目录/章节/封底判断或署名策略冲突。

三类方案场景必须先完成场景确认、输入检查、材料整合、章节规划、逐页稿和逐页表达规格确认，再进入 `references/slide-decks.md` 制作。

## 轻量 Deck 系统

- 字体：中文标题、正文、注释、图形节点、页脚和封底信息默认使用无衬线字体。
- 尺度：正文最小 20px；内容页 H1 默认 56-60px，常规范围 48-64px。
- 结构：先判断是否需要目录页和章节页；客户交付 deck 默认额外追加固定 SimpleUX 封底页。
- 署名：客户交付 deck 的普通内页默认使用 SimpleUX 保密署名页脚；省略时写入 `PUBLISHER_EXCEPTIONS.md`。
- 演示：HTML 默认稳定键盘翻页；全屏、截图、打印和导出时不得显示计数器、箭头提示或左右热区。

## 深读触发条件

只在需要时读取对应专项文档：

- `references/slide-decks.md`：项目方案、POC 提案、设计提案的制作阶段，正式客户交付、复杂章节/目录/封底判断、署名策略冲突、常规 quick guide 不足以决策。
- `references/deck-case-notes.md`：导出疑难、单文件 `<deck-stage>` 历史坑、PDF/PPTX 踩坑、复杂打印/截图问题。
- `references/editable-pptx.md`：用户需要可编辑 PPTX。
- `references/device-mockups.md`：页面展示 App/Web/PC/移动端 UI 截图或设备界面。
- `references/logic-graphics.md`：页面核心是关系、流程、阶段、系统、矩阵、模型、闭环、架构、服务地图或体验链路。
- `references/design-styles-full.md`：快速风格索引不够用，且需要完整 20 风格库、提示词 DNA 或现场生成 3 个 demo。

## 分层 QA

- Level 1 默认 QA：HTML 可打开、控制台无错误、脚本硬门禁、关键翻页交互、全屏隐藏控制层。
- Level 2 抽样 QA：检查封面、目录/章节页、1-2 张普通内页、封底，以及所有设备样机页、逻辑图形页和强视觉页。
- Level 3 全量 QA：客户交付、正式汇报、正文 15 页以上、用户明确要求、脚本失败后修复或视觉风险高时逐页检查。

默认不要把每页截图和每页 HTML/CSS 都转成文字复述；只总结失败项、修复项和必要证据。

## 搜索与读取卫生

- 搜索规则和模板时默认排除 `node_modules/`、`assets/icon/` 和大媒体文件。
- 需要图标时先查图标名称或目标 SVG，不批量读取图标全集。
- 需要设备样机时先读 `assets/device-mockups/manifest.json` 和目标资产路径，不展开整个资产目录。
- 需要 publisher 资源时只确认目标文件是否存在，不读取视频或图片二进制内容。
