# Device Mockups

`assets/device-mockups/` 存放可复用的真实设备样机壳。制作 App 原型、产品截图页或 deck 中的移动端界面展示时，优先使用这些样机资产，不要默认用 CSS 手画黑色圆角框。

## 使用原则

- 样机壳只用于承载和展示真实 UI 截图，不替代 UI 本身的设计。
- 正面、透视或倾斜样机都优先使用 1000x1000 组件坐标：屏幕填充形状层在下，透明设备壳在上。
- 屏幕填充层的圆角按 Figma 组件坐标缩放，例如 `calc(var(--mockup-size) * 0.04)`；不要写成 `4%`，否则非正方形屏幕层会产生错误圆角并露出 UI 四角。
- 透视或倾斜样机必须保留屏幕层变换参数；不要用普通矩形或手写 `clip-path` 硬套。
- 不要把整机截图当成死图使用，否则后续无法替换屏幕内容。
- 找不到匹配设备时，才使用 CSS 设备框作为临时占位。
- Deck 中展示样机时，样机本身不能抢正文、标题和核心图表的主视觉。
- 深色外壳和浅色外壳没有绝对使用规则。选择时以页面整体气质、背景深浅、客户品牌色、图像重量和版面平衡为准；目标是让外壳和页面协调，而不是机械按深底/浅底套用。

## 可用资产

| Key | 文件 | 屏幕区域 |
| --- | --- | --- |
| `iphone-15-pro-black-titanium-portrait` | `iphone-15-pro-black-titanium-portrait-frame.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-natural-titanium-left-perspective` | `iphone-15-pro-natural-titanium-left-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-natural-titanium-right-perspective` | `iphone-15-pro-natural-titanium-right-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-portrait` | `iphone-15-pro-silver-portrait-frame.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-left-perspective` | `iphone-15-pro-silver-left-perspective.png` | `screenShape` 百分比参数 |
| `iphone-15-pro-silver-right-perspective` | `iphone-15-pro-silver-right-perspective.png` | `screenShape` 百分比参数 |

详细坐标见 `assets/device-mockups/manifest.json`。

选择外壳时先判断表达目的：需要更强对比或偏专业沉稳时可用黑色/自然钛；需要轻量、明亮、减少视觉重量时可用银色。它们不是强制规则，最终以页面整体搭配协调为准。角度选择由版面决定：正面用于清晰展示 UI，左透视/右透视用于增加空间感或配合页面动势。

## 使用时机

- 当页面需要展示移动端 App/UI 界面时，优先使用 `assets/device-mockups/` 中的真实设备外壳。
- 正面外壳用于清晰展示 UI 内容和界面细节；倾斜外壳只用于展示 UI 效果、产品氛围或多屏组合，不用于承载需要阅读细节的界面。
- 当源 UI 是长截图时，不要把整张长图压缩进屏幕区域。默认只展示首屏区域：屏幕容器保持外壳对应比例，UI 图片顶端对齐，超出部分由屏幕层 `overflow: hidden` 截掉。
- 只有在明确需要展示完整长图流程时，才可以在屏幕区域内加入纵向滚动动效；滚动过程中必须始终被屏幕形状裁切，不能让 UI 从外壳边缘穿帮。
- 多张 UI 效果展示时，可以组合不同角度外壳，例如左侧放右透视、右侧放左透视，允许轻微重叠；也可以使用正面 + 侧面组合。组合时以整体版面动势和内容层级为准，不要让外壳抢主标题或关键结论。

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
