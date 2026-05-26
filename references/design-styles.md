# 设计哲学风格索引

本文件用于快速选择方向。需要完整 20 种风格的哲学、特征和提示词 DNA 时，再读 `references/design-styles-full.md`。

## 使用原则

- 需求模糊、需要方向探索或用户要求比较时，推荐 3 个有明显差异的方向，优先来自不同流派。
- 已有明确品牌、设计方向、样稿基准或用户只要求深化时，不硬造 3 个风格方向。
- 不要直接写 “in the style of 某机构/设计师”；要抽取可执行的视觉特征。
- 选择方向时结合场景：App/Web 原型、PPT、PDF、封面、品牌稿的适配性不同。
- 如果已有品牌资产，品牌资产优先于风格库。

## 五类风格

| 流派 | 适合 | 常用关键词 |
|---|---|---|
| 信息建筑派 | B2B、数据页、开发者文档、报告 | 克制、网格、信息层级、黑白+单色强调 |
| 运动诗学派 | 产品官网、交互原型、技术概念页 | 滚动叙事、空间感、深色、技术流动 |
| 极简主义派 | 品牌稿、封面、精品发布、PPT | 留白、精致、低饱和、微妙字重 |
| 实验先锋派 | 概念封面、AI 视觉、强记忆点页面 | 生成艺术、未来感、强视觉主角 |
| 东方哲学派 | 温和科技、知识产品、长期主义品牌 | 空、自然色、柔和秩序、含蓄细节 |

## 方向不明时的推荐组合

需求模糊时，优先用这 3 个方向拉开差异：

1. **Pentagram / 信息建筑派**
   - 适合：B2B、数据、报告、开发者工具。
   - 特征：瑞士网格、强字体层级、黑白灰 + 1 个强调色、信息即视觉。

2. **Build / 极简主义派**
   - 适合：品牌、精品产品、封面、轻奢感 PPT。
   - 特征：大量留白、低饱和暖色、细线、轻字重、精致但克制。

3. **Takram / 东方哲学派**
   - 适合：温和科技、知识产品、AI 工具、长期主义叙事。
   - 特征：米色/灰绿/自然色、柔和图表、有机秩序、安静的科技感。

## 场景速选

| 场景 | 首选方向 | 备选方向 |
|---|---|---|
| App/Web 原型 | Takram、Information Architects | Build |
| SaaS/开发者产品 | Pentagram、Information Architects | Build |
| 演示 PPT | Pentagram、Build、Takram | Müller-Brockmann |
| 数据页 / 报告页 | Fathom、Pentagram | Müller-Brockmann |
| 品牌封面 | Build、Pentagram | Experimental Jetset |
| AI 概念视觉 | Field.io、Territory Studio | Takram |

## Showcase

先看 `assets/showcases/INDEX.md`。如果场景匹配，直接展示对应的 3 风格截图；如果不匹配，再按 `references/design-styles-full.md` 现场生成 3 个 demo。

## 质量控制

- 每个方向要说明为什么适合，不只给名字。
- 每个方向列 3-4 个视觉特征和 3-5 个气质关键词。
- 方向之间要有明显差异：例如“网格理性 / 极简留白 / 柔和科技”。
- 用户选择后，进入 `references/workflow.md` 的 Junior Designer 主流程。
