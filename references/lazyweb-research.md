# Lazyweb 设计研究规则

设计调研是 simpleux-design 的独立能力范围。用户可以直接要求做设计调研、竞品研究、模式研究、参考图板、相似截图比较或创意发散，默认交付中文 HTML 视觉研究板。

Lazyweb 是外部真实产品界面参考源，用于增强设计调研。它可以帮助分析真实 App/Web 截图、用户流程和产品 UI 模式，但不得成为隐藏的默认调用步骤。

## 证据边界

基于用户截图、公开截图或 Lazyweb 结果，可以做：

- 可见范围内的界面结构、信息层级、导航组织、关键模块和视觉表现分析。
- 基于截图序列的有限流程推断，例如入口、步骤、反馈和转化触点。
- 表现层对比，例如布局密度、组件语言、品牌表达、内容组织、视觉重心和状态表达。
- 有明确证据的体验问题、模式参考、设计启发和不可照抄项。
- 为项目方案、POC 提案或设计提案提供截图证据、参考模式和页面表达素材。

必须谨慎标注：

- 仅凭单张截图推断完整信息架构、业务规则、后台能力、运营机制或转化效果。
- 仅凭视觉表现判断产品战略、用户规模、业务指标或真实转化结果。
- 把 Lazyweb 截图集合包装成完整竞品调研、行业研究或 deep research。

输出时区分三类信息：

- 可见事实：截图中能直接看到的内容。
- 设计推断：基于界面结构和常见产品模式的合理判断。
- 待验证假设：需要用户、客户材料、公开来源或外部研究继续确认的判断。

如果用于方案 deck，必须在材料整合或逐页表达规格中标注证据来源，不把截图推断写成确定事实。

## 触发条件

只有用户明确提出以下需求时，才进入 Lazyweb 候选：

- 设计调研、设计研究、视觉研究板、产品模式研究。
- 真实产品参考、真实界面截图、参考案例。
- 竞品调研、对标产品、行业 UI 模式分析。
- onboarding、pricing、paywall、dashboard、settings、checkout、billing、team management 等产品流参考。
- 用真实产品证据改进现有界面或设计评审。
- 根据当前截图查相似界面或比较相似产品模式。

以下情况不要触发 Lazyweb：

- 普通 HTML deck、App 原型、Web 页面或设计稿请求，且没有提出调研或真实产品参考。
- 用户只说“做一个原型”“做一套 PPT”“优化排版”，但没有提出真实参考或竞品研究。
- 品牌资产调研。品牌 logo、色值、字体、官网和官方素材仍按 `brand-asset-protocol.md`。

## 确认规则

Lazyweb 不默认调用。命中候选但用户没有直接授权时，先问：

```markdown
我可以用 Lazyweb 搜真实产品界面参考来支撑这次设计判断。是否使用？
```

用户确认后，当前任务只确认一次，不要为每次搜索重复打断。

如果用户直接说“用 Lazyweb 查一下”“用 Lazyweb 研究 onboarding”“拿 Lazyweb 做竞品参考”等等价表达，视为已确认，不需要二次询问。

如果用户只要求“做设计调研”但没有点名 Lazyweb，仍需先确认是否使用 Lazyweb；用户不确认时，继续用用户素材、公开网页、项目上下文和本地设计判断生成中文研究板。

## 使用方式

用户确认后，优先使用 Lazyweb 官方插件技能或命令；没有对应技能时，再直接调用 MCP 工具。

责任边界：
- Lazyweb MCP 本身提供搜索、相似查找、图片比较、分类和集合等结构化数据能力。
- 已验证 `lazyweb_search` 会返回 `companyName`、`category`、`platform`、`pageUrl`、`imageUrl`、`visionDescription`、`similarity`、`matchCount` 等字段；其中 `imageUrl` 可用于下载参考图。
- Lazyweb 官方技能/命令负责把 MCP 结果下载、筛选、分组并拼装成 HTML report。
- 如果环境里没有 Lazyweb 官方技能/命令，但 MCP 工具可用，simpleux-design 需要自己按本文件的产物规则拼装 `report.html` 和 `references/`。

Lazyweb 官方插件的核心入口：

| 任务 | 优先入口 | 产物目录 |
|------|----------|----------|
| 快速找几个参考截图 | `lazyweb-quick-references` | `.lazyweb/quick-references/{topic}-{date}/` |
| 深度竞品/最佳实践研究 | `lazyweb-design-research` | `.lazyweb/design-research/{topic}-{date}/` |
| 基于现有界面做改进建议 | `lazyweb-design-improve` | `.lazyweb/design-improve/{screen}-{date}/` |
| 跨行业创意发散 | `lazyweb-design-brainstorm` | `.lazyweb/design-brainstorm/{topic}-{date}/` |

在 Claude Code 一类支持 slash skill 的环境中，入口可能表现为 `/lazyweb:lazyweb-quick-references`、`/lazyweb:lazyweb-design-research`、`/lazyweb:lazyweb-design-improve`、`/lazyweb:lazyweb-design-brainstorm`；在 Codex 中优先使用已安装 Lazyweb 插件暴露的同名技能或 MCP 工具。

直接调用 MCP 时，常用工具是：

- `lazyweb_health`：确认 Lazyweb MCP 可用。
- `lazyweb_search`：按文字搜索真实产品截图。
- `lazyweb_find_similar`：根据 Lazyweb 截图 ID 找相似截图。
- `lazyweb_compare_image`：根据当前设计截图找视觉相似参考。
- `lazyweb_list_categories` / `lazyweb_list_collections`：需要筛选范围时使用。

搜索规则：
- 先用 1-3 个具体查询切入，例如 `mobile onboarding`、`B2B SaaS pricing page`、`team settings billing`。
- 默认只保留 3-6 条强相关结果进入结论，不把大批截图描述塞进上下文。
- 不要假设 MCP 的 `limit` 等于最终展示数量；最终 report 的截图数量以二次筛选后的强相关结果为准。
- 设计空间很宽时，可从不同角度追加查询，但每次查询都要服务当前决策。
- 评审现有界面时，先总结当前界面问题，再用 Lazyweb 参考验证或反驳判断。
- 使用任何截图前先读 `visionDescription` 或等价描述；描述不匹配就不要使用该截图。

## 输出产物

Lazyweb 不是只输出 Markdown。确认使用 Lazyweb 后，默认在用户当前项目目录生成本地 HTML 视觉参考板，并下载参考图。优先让 Lazyweb 官方技能/命令按它自己的 output behavior 生成；如果只能直接调 MCP，则由 simpleux-design 自己生成同等结构：

```text
.lazyweb/
  quick-references|design-research|design-improve|design-brainstorm/
    {topic-or-screen}-{YYYY-MM-DD}/
      report.html
      references/
        current-state.png
        {company}-{screen}.png
```

规则：
- `report.html` 是主产物，必须包含参考图、分组、caption、关键模式和对当前设计的影响。
- `report.html` 必须全中文：标题、导航、分组名、caption、状态说明、结论、建议、风险和按钮/标签等面向用户可见文字都用中文；品牌名、产品名、URL、命令名、文件路径、原始字段名和无法翻译的专有名词可以保留原文。
- 如果使用 Lazyweb 官方技能/命令生成报告，simpleux-design 必须在调用或后处理时要求中文化；不得直接交付英文默认 report。
- `references/` 存放下载的 Lazyweb 参考图、当前设计截图和必要的 live web capture。
- 不创建 `report.md` 作为正式研究产物；对话里的 Markdown 只做简短摘要和文件路径说明。
- 不在 `simpleux-design/` 技能目录生成研究产物；必须放在用户项目工作目录下的 `.lazyweb/`。
- 如果 Lazyweb 只返回文字、图片下载失败或浏览器截图不可用，`report.html` 仍要生成，并在对应卡片说明缺少图片的原因。

HTML report 的内容至少包含这些中文模块：

- 研究结论：3-5 条核心发现。
- 当前状态：如果有当前界面，展示当前截图。
- 参考图板：按模式分组展示参考图。
- 设计启发：这些参考如何影响本次原型、deck 或评审判断。
- 不可照抄：明确不能照抄的品牌、文案、专有图形或不适合当前场景的做法。

对话中的简短摘要可以使用：

```markdown
**Lazyweb 参考摘要**
- 参考方向：[界面类型/产品流]
- 观察到的模式：[3-5 条]
- 对本次设计的影响：[具体布局、信息架构、状态或交互决策]
- 不照抄项：[品牌、文案、专有图形或不适合当前场景的做法]
- 本地参考板：[.lazyweb/.../report.html]
```

如果结果不足或相关性弱，直接说明，不要强行包装成证据。

## 降级策略

如果用户拒绝、未确认，或 Lazyweb MCP 不可用：

- 回退到用户素材、项目代码、品牌资产协议、本地参考文档和通用设计判断。
- 明确说明当前判断不基于 Lazyweb 真实产品参考。
- 不要求用户安装 Lazyweb，除非用户主动要求配置或接入。

## 禁止事项

- 不保存 Lazyweb token。
- 不修改 Codex 全局 MCP 配置。
- 不把 Lazyweb token、安装状态或本地配置写入仓库。
- 不把 Lazyweb 作为默认步骤或隐藏成本。
- 不用 Lazyweb 替代客户品牌资产协议。
- 不照抄截图中的 UI、文案、品牌资产或专有图形。
