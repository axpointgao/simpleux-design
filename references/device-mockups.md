# Device Mockups

`assets/device-mockups/` 存放真实设备样机壳。制作 App/Web 原型、产品截图页或 deck 中的设备界面展示时，必须优先使用这些资产，不要默认用 CSS 手画设备框。

这是交付门禁，不是视觉建议。凡页面展示 App、Web、PC、移动端 UI、后台系统截图或产品界面，先从 `assets/device-mockups/manifest.json` 选择匹配样机壳；没有匹配资产时，先说明缺口并向用户索取或选择最接近资产。只有用户确认接受临时占位时，才可以使用 CSS 设备框。

## 使用原则

- 样机壳只承载真实 UI 截图，不替代 UI 本身的设计。
- 移动端外壳使用 1000x1000 组件坐标：屏幕填充层在下，透明设备壳在上。
- PC 外壳使用 2000x2000 组件坐标：MacBook 外壳在下，UI 屏幕层在上，由屏幕形状裁切；PC 截图默认 `contain` 完整展示，剩余屏幕区域用黑色填满。
- 屏幕坐标、圆角、变换参数以 `assets/device-mockups/manifest.json` 为准。圆角按组件坐标缩放，例如 `calc(var(--mockup-size) * 0.04)`；不要写成 `4%`。
- 透视或倾斜样机必须保留屏幕层变换参数，不要用普通矩形或手写 `clip-path` 硬套。
- 不要把整机截图当成死图使用，否则后续无法替换屏幕内容。
- 找不到匹配设备时，才使用 CSS 设备框作为临时占位；临时占位必须在交付说明中标明，不能伪装成正式设备样机。
- 禁止默认手画黑色圆角手机框、黑色浏览器框、普通黑色矩形外框来替代本地样机库资产。
- Deck 中展示样机时，样机本身不能抢正文、标题和核心图表的主视觉。

## 可用资产

| Key | 文件 | 屏幕区域 |
| --- | --- | --- |
| `iphone-15-pro-black-titanium-portrait` | `iphone-15-pro-black-titanium-portrait-frame.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-natural-titanium-left-perspective` | `iphone-15-pro-natural-titanium-left-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-natural-titanium-right-perspective` | `iphone-15-pro-natural-titanium-right-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-portrait` | `iphone-15-pro-silver-portrait-frame.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-left-perspective` | `iphone-15-pro-silver-left-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-right-perspective` | `iphone-15-pro-silver-right-perspective.png` | `screenShape` 百分比参数 |
| `macbook-pro-black-front` | `macbook-pro-black-front-shell.png` | `screenShape` 百分比参数 |
| `macbook-pro-silver-front` | `macbook-pro-silver-front-shell.png` | `screenShape` 百分比参数 |

详细坐标见 `assets/device-mockups/manifest.json`。

选择外壳时以页面整体协调为准，不按深底/浅底机械套用。需要更强对比或偏专业沉稳时可用黑色/自然钛；需要轻量、明亮、减少视觉重量时可用银色。正面用于清晰展示 UI，左透视/右透视用于展示效果、空间感或配合页面动势。

## 使用时机

- 当页面需要展示移动端 App/UI 或 PC/Web 界面时，优先使用真实设备外壳。
- 客户汇报、方案 deck、产品展示页、首页/服务页/我的页等 UI 对比页，必须使用真实设备样机壳或明确说明为什么没有使用。
- 正面外壳用于清晰展示 UI 内容和界面细节；倾斜外壳只用于展示 UI 效果、产品氛围或多屏组合，不用于承载需要阅读细节的界面。
- 当源 UI 是长截图时，不要把整张长图压缩进屏幕区域。默认只展示首屏区域：屏幕容器保持外壳对应比例，UI 图片顶端对齐，超出部分由屏幕层 `overflow: hidden` 截掉。
- 只有在明确需要展示完整长图流程时，才可以在屏幕区域内加入纵向滚动动效；滚动过程中必须始终被屏幕形状裁切，不能让 UI 从外壳边缘穿帮。
- 多张 UI 效果展示时，可以组合不同角度外壳，例如左侧放右透视、右侧放左透视，允许轻微重叠；也可以使用正面 + 侧面组合。组合时以整体版面动势和内容层级为准，不要让外壳抢主标题或关键结论。

## 多端组合

多端设计项目同时展示 PC 与移动端效果时，不要平铺，使用固定重叠组合：

- PC 作为背景主设备，移动端作为前景设备，必须放在 PC 左侧并叠加在 PC 屏幕区域上。
- 用屏幕区域判断叠放关系：移动端屏幕高度约为 PC 屏幕高度的 5/6。
- 移动端屏幕右侧约一半宽度进入 PC 屏幕，左侧约一半伸出 PC 屏幕边界。
- 移动端屏幕底线应与 PC 屏幕底线接近同一平面，避免看起来飘在空中。
- 移动端不要压在键盘、底座或屏幕外空白区域，也不要遮挡 PC 核心内容。
- 组合不必严格按真实物理比例，但必须整体协调、主次清楚，并且两端关键 UI 都能看清。

## 统一样机模板

```html
<div class="mockup-slot iphone-front">
  <div class="mockup-screen">
    <img src="screen.png" alt="App screen">
  </div>
  <img class="mockup-frame" src="assets/device-mockups/iphone-15-pro-black-titanium-portrait-frame.png" alt="">
</div>
```

```css
.mockup-slot {
  --mockup-size: 320px;
  position: relative;
  width: var(--mockup-size);
  height: var(--mockup-size);
  overflow: visible;
}

.mockup-screen {
  position: absolute;
  left: 30.3%;
  right: 30.4%;
  top: 7.4%;
  bottom: 7.4%;
  overflow: hidden;
  border-radius: calc(var(--mockup-size) * 0.04);
  background: #cde7ff;
}

.mockup-screen img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.mockup-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
```

所有新产物都使用上面的 `screenShape + frame` 结构，以便正面、左透视、右透视共享一套定位、缩放和替换逻辑。

如果生成页面中出现 `.phone-frame`、`.device-frame`、`.browser-frame`、纯 CSS 圆角黑框或类似手画设备容器，必须检查是否违反本门禁；除临时占位外，应改为 `mockup-screen + mockup-frame` 或 `pc-shell + pc-screen` 结构。

## PC 样机模板

MacBook 外壳是底座和机身，不覆盖屏幕区域。使用时先放外壳，再把 UI 屏幕层放到外壳上方，并保持 `overflow: hidden`。常见 PC/Web 截图多为 1920x1080，默认不要裁切 UI；使用 `object-fit: contain`，上下空区用黑色填满，避免出现透明或浅色穿帮。

```html
<div class="pc-mockup">
  <img class="pc-shell" src="assets/device-mockups/macbook-pro-black-front-shell.png" alt="">
  <div class="pc-screen">
    <img src="web-screen.png" alt="Web UI screen">
  </div>
</div>
```

```css
.pc-mockup {
  --mockup-size: 720px;
  position: relative;
  width: var(--mockup-size);
  height: var(--mockup-size);
  overflow: visible;
}

.pc-shell {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.pc-screen {
  position: absolute;
  left: 13.25%;
  top: 24.6%;
  width: 73.75%;
  height: 47.7%;
  overflow: hidden;
  border-radius: calc(var(--mockup-size) * 0.007);
  background: #050505;
}

.pc-screen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

## 透视样机处理

透视或倾斜样机必须优先导出 Figma 中的透明外框 PNG，并复用 Figma 的屏幕填充形状层参数。不要用普通矩形或手写 `clip-path` 拟合。

- `type: "screen-shape-frame"`
- `file`：透明外框 PNG，置于屏幕填充层上方
- `screenShape`：屏幕填充形状层的 left/right/top/bottom、transform、borderRadius、fit。`borderRadius` 使用 Figma 组件坐标中的 px 值，并按外层 1000 基准等比缩放。
- `frame`：外框相对组件的校准偏移，例如 `top: -1.8%`

稳定写法：组件外层只定义位置和整体尺寸，内部全部使用百分比坐标。不要使用 `transform: scale(calc(size / 1000))` 这类 CSS 除法写法，容易导致浏览器不按预期缩放。

```html
<div class="perspective-slot">
  <div class="perspective-mockup">
    <div class="screen-shape">
      <img src="screen.png" alt="App screen">
    </div>
    <img class="perspective-frame" src="assets/device-mockups/iphone-15-pro-natural-titanium-left-perspective.png" alt="">
  </div>
</div>
```

```css
.perspective-slot {
  --mockup-size: 320px;
  position: relative;
  width: var(--mockup-size);
  height: var(--mockup-size);
  overflow: visible;
}

.perspective-mockup {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.screen-shape {
  position: absolute;
  left: 32.8%;
  right: 36.2%;
  top: 7.32%;
  bottom: 11.66%;
  overflow: hidden;
  border-radius: calc(var(--mockup-size) * 0.04);
  background: #cde7ff;
  transform: matrix(0.99, 0.15, 0, 1, 0, 0);
  transform-origin: center center;
}

.screen-shape img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.perspective-frame {
  position: absolute;
  left: 0;
  top: -1.8%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
```

判断标准：同一组件放在不同位置、不同尺寸时，屏幕填充层与外框必须保持相同相对比例；如果缩放后漂移，禁止进入正式 assets。

右侧透视样机使用同样结构，但 `screenShape` 参数不同：

```css
.screen-shape.right-perspective {
  left: 30.5%;
  top: 7.264%;
  width: 31.069%;
  height: 81.013%;
  transform: matrix(0.99, -0.16, 0, 1, 0, 0);
}
```
