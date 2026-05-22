# Fallback Advisor

当需求模糊、没有 design context、或用户只说“做个好看的”时，走这套流程。

## 触发条件

- 需求模糊
- 想要“推荐风格”
- 没有 design system / UI kit / 参考图
- 用户自己也不确定方向

## 什么时候 skip

- 已经有明确风格参考
- 用户说清楚要什么
- 只是小修小补

## 8 个 Phase

### Phase 1 · 深度理解需求

一次最多问 3 个关键问题：

- 目标受众
- 核心信息
- 情感基调
- 输出格式

### Phase 2 · 顾问式重述

用自己的话重述本质需求，并以“我准备了 3 个方向”收尾。

### Phase 3 · 推荐 3 套设计哲学

每个方向都要：

- 有设计师或机构名
- 解释为什么适合
- 给 3-4 个视觉特征
- 给 3-5 个气质关键词

先读 `references/design-styles.md` 做快速选择；如果需要更多候选、提示词 DNA 或细分风格，再读 `references/design-styles-full.md`。

### Phase 4 · 展示预制 showcase

先看 `assets/showcases/INDEX.md`，优先找对应场景的预制样例。

### Phase 5 · 生成 3 个视觉 Demo

- 3 个方向各做一个
- 用真实内容，不要 Lorem ipsum
- 能并行就并行

### Phase 6 · 用户选择

用户可以：

- 选一个深化
- 混合两个方向
- 微调
- 重来

### Phase 7 · 生成 AI 提示词

结构是：

`[设计哲学约束] + [内容描述] + [技术参数]`

### Phase 8 · 进入主干

方向确认后，回到 Junior Designer 主流程。

## 差异化原则

3 个方向必须来自 3 个不同流派，不要同质化。
