# Icon Assets：本地图标资产

`assets/icon/` 存放本地 SVG 图标库，适合在 HTML 原型、deck、信息图、图解页和设计评审 demo 中按需使用通用 UI 图标、数字图标、品牌图标和提示图标。

## 使用原则

- 只挑选当前产物真正需要的少量图标，不要把整个 `assets/icon/` 复制到交付目录。
- 优先直接引用单个 SVG 文件，或把少量 SVG inline 到 HTML 中，便于改色、缩放和无网络运行。
- 图标只承担识别和操作提示，不替代正文说明；关键业务含义仍用文字讲清楚。
- 同一页面内图标应共享尺寸、线宽、颜色和视觉层级。
- 如果项目已有图标系统或组件库，优先使用项目内图标；本地图标库只作为缺省资源。

## 查找方式

```bash
find simpleux-design/assets/icon -name '*arrow*.svg'
find simpleux-design/assets/icon -name '*bank*.svg'
find simpleux-design/assets/icon -name '*check*.svg'
```

常见类型：

- `arrow-*`：方向、流转、返回、展开。
- `check-*` / `x-*`：状态、确认、错误。
- `bank*` / `building*`：金融、机构、城市空间。
- `bar-chart*` / `graph*`：数据、趋势、指标。
- `*-circle.svg` / `*-square.svg`：数字或状态符号。

## 交付注意

- 多文件 HTML deck 中，建议把实际使用的图标复制到项目自己的 `shared/icons/` 或 `assets/icons/`。
- 单文件 HTML 中，建议 inline 少量 SVG，避免路径丢失。
- 不要依赖 `bootstrap-icons.css` 或 icon font，除非当前产物明确需要整套字体图标。
