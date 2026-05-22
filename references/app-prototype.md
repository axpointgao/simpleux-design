# App / iOS Prototype

这是给 iOS / Android / 移动 App 原型的专门规则。

App/Web/PC 原型和展示图需要设备外壳时，必须读取 `references/device-mockups.md`，优先使用 `assets/device-mockups/` 中的真实样机壳；只有缺少匹配设备或需要极简 wireframe 表达时，才使用 CSS 手绘设备框。

## 0. 默认架构

- 默认用单文件 inline React。
- JSX、data、styles 都写进主 HTML 的 `<script type="text/babel">`。
- 不要默认拆外部文件。
- 本地图片优先用 base64 或可直接访问的本地资源。

## 1. 先找真图

默认主动找真实图片，不要拿 placeholder 顶着。

常用来源：

- Wikimedia Commons
- Met Museum Open Access
- Art Institute of Chicago API
- Unsplash / Pexels
- 用户本地素材目录

## 2. 交付形态先选

先判断是：

- Overview 平铺
- Flow demo 单机

### Overview 平铺

适合设计 review、比较布局、看全貌。

### Flow demo 单机

适合演示一条明确用户流程。

## 3. iPhone 外框

做 iPhone mockup 时，必须使用 `assets/ios_frame.jsx`。

不要在 HTML 里自己手写：

- Dynamic Island
- status bar
- home indicator
- bezel

## 4. 交付前验证

至少做 3 项点击测试：

- 进入详情
- 关键标注点
- tab 切换

检查 console / pageerror 为 0。

## 5. 设计原则

- 没图标就留诚实 placeholder。
- 没数据就不要编。
- App 原型要像可用产品，不要像说明书。
- 如果是 flow demo，所有屏都要通过状态机或 callback 驱动。

## 6. 推荐组件

- `design_canvas.jsx`：静态 variations 对比
- `ios_frame.jsx`：iPhone 框
- `android_frame.jsx`：Android 框
- `browser_window.jsx`：网页浏览器框
- `macos_window.jsx`：桌面窗口框
