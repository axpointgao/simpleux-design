# Brand Asset Protocol

涉及具体品牌、产品或明确客户时，必须走这套流程。

## 核心顺序

资产 > 规范。先认出品牌，再谈风格。

## 资产优先级

| 资产 | 优先级 | 是否必需 |
|---|---|---|
| Logo | 最高 | 必需 |
| 产品图 / 产品渲染图 | 很高 | 实体产品必需 |
| UI 截图 / 界面素材 | 很高 | 数字产品必需 |
| 色值 | 中 | 辅助 |
| 字体 | 低 | 辅助 |
| 气质关键词 | 低 | 辅助 |

## Step 1 · 一次问全

按这个清单问用户：

1. Logo
2. 产品图 / 官方渲染图
3. UI 截图 / 界面素材
4. 色值清单
5. 字体清单
6. Brand guidelines / Figma / 官网链接

## Step 2 · 搜官方渠道

| 资产 | 搜索路径 |
|---|---|
| Logo | 官网 brand / press / press-kit / header inline SVG |
| 产品图 | 产品页 hero + gallery / 官方 launch film / 官方新闻稿 |
| UI 截图 | App Store / Google Play 截图 / 官网 screenshots / 官方视频截帧 |
| 色值 | 官网 CSS / Tailwind config / brand guide |
| 字体 | 官网字体引用 / Google Fonts / brand guide |

## Step 3 · 下载资产

### Logo

1. 独立 SVG/PNG。
2. 官网 HTML 里提取 inline SVG。
3. 官方社媒头像作为最后手段。

### 产品图

1. 官方 hero image。
2. 官方 press kit。
3. 官方 launch video 截帧。
4. Wikimedia Commons。
5. 实在没有时，才用 AI 生成兜底，但不要用 CSS/SVG 手画代替真实产品图。

### UI 截图

1. App Store / Google Play 截图。
2. 官网 screenshots。
3. 官方演示视频截帧。
4. 用户真实账号截图。

## Step 4 · 验证与提取

- Logo 要能打开，最好有深底 / 浅底两版。
- 产品图至少一张高分辨率主视角图。
- UI 截图要是最新版本，不能混入用户数据污染。
- 色值从真实资产里提取，不凭记忆猜。

### 质量门槛

遵守 `5-10-2-8`：

- 搜 5 轮
- 凑 10 个候选
- 选 2 个最好
- 每个至少 8/10

宁缺毋滥。

## Step 5 · 固化成 brand-spec.md

把这些写进去：

- 资产来源
- Logo 路径
- 产品图路径
- UI 截图路径
- 色板
- 字体
- 禁区
- 气质关键词

## 失败兜底

- Logo 找不到：停下问用户。
- 产品图找不到：优先 AI 参考生成，其次问用户，最后才诚实 placeholder。
- UI 截图找不到：向用户索取真实截图。
- 色值完全找不到：走设计方向顾问模式。

## 结构纪律

- HTML 必须引用 `brand-spec.md` 里的真实文件路径。
- Logo 和产品图都要用真实图片，不要手画。
- 想临时换色，先改 spec。
- 客户品牌资产决定主视觉；`assets/publisher/` 里的 SimpleUX 标识只作为设计方/出品方署名使用，不应覆盖、替代或干扰客户品牌系统。
