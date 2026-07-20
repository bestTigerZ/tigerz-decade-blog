## 目标
在**不改变视觉风格**的前提下，优化 TigerZ 博客的排版与桌面/移动端体验。以重写 `style.css` 为主，辅以少量 HTML/JS 微调，并新增 ≤360px 超窄屏断点。

## 一、建立统一的间距/排版体系（style.css 新增）
- 在 `:root` 定义设计 token：`--space-section`、`--container-pad`、`--radius-card` 等，替换散落在 HTML 里的硬编码 `py-24`/`px-6`/`mb-16`，让间距随断点统一缩放。
- 给正文加 `text-rendering: optimizeLegibility`、`-webkit-font-smoothing: antialiased`，中文段落 `line-height: 1.75`。
- 数字使用 `font-variant-numeric: tabular-nums`（QQ 号、百分比、日期），避免跳动。

## 二、桌面端排版优化
1. **容器与留白**
   - `max-w-7xl`（1280px）→ 桌面阅读区收紧到 `max-w-6xl`（正文区），hero/section 用 `max-w-7xl`；section padding 改 `py-20 md:py-28`。
   - 标题块 `mb-16` → `mb-12 md:mb-16`，减少空旷感。
2. **Hero 区**
   - 左右栏 `gap-16` → `gap-12 lg:gap-20`；数据统计 `max-w-md` → `max-w-lg`，三栏卡片加大内边距。
   - CTA 按钮加 `min-h-48px`，符合桌面点击区域。
3. **关于我**：`lg:grid-cols-5 (2+3)` 保留，`gap-8` → `gap-6 lg:gap-10`；信息卡行间距 `space-y-4` → `space-y-3` 让密集信息更紧凑。
4. **博客网格**：卡片标题加 `line-clamp-2`，摘要 `line-clamp-2`（已有），统一卡片高度用 `flex flex-col h-full`，避免长标题撑高破坏对齐。
5. **约稿网格**：`gap-4` → `gap-4 md:gap-5`；hover 信息层加 `backdrop-blur`。
6. **联系方式**：`max-w-4xl` → `max-w-5xl`，卡片加大内边距到 `p-7`，提升呼吸感。

## 三、移动端重写 `@media (max-width: 768px)` 段
**移除有问题的 `!important` 暴力覆盖**（`#home p/a/h1/h2` 全局覆盖会误伤卡片），改为**精确作用域**：
- hero 标题只针对 `.hero-title` 类，不波及 section 内卡片标题。
- section `py-24` → 移动端 `py-16`，标题块 `mb-16` → `mb-10`，减少滚动疲劳。
- 数据统计三栏在 ≤480px 改为 `grid-cols-3` 但缩小字号与 padding；≤360px 时维持 3 栏但进一步压缩。
- hero 两个 CTA 在 ≤480px 改 `flex-col` 全宽堆叠。

**新增触控目标尺寸**（WCAG 建议 ≥44px）：
- nav hamburger 按钮、footer 社交图标、back-to-top 按钮：统一 `min-w-44 min-h-44`。
- 移动菜单 `.mobile-menu-link` 宽度从固定 `200px` → `width: min(80vw, 280px)`，并 `min-h-52px`。
- 文章/约稿卡片整体已是可点区域，保持。

## 四、新增 ≤360px 超窄屏断点
```
@media (max-width: 360px) { ... }
```
- hero `h1` 缩到 `text-4xl`，`h2` 缩到 `text-2xl`，介绍段 `text-sm`。
- hero 标签 `inline-flex ... whitespace-nowrap` 改为允许换行或缩小 padding，防止溢出。
- 数据统计卡片 padding 压缩，字号 `text-xl`。
- 移动菜单 logo/标题字号小幅下调。
- footer 四列改 `grid-cols-2`（社交图标换行排列）。

## 五、HTML 微调（最小化）
1. hero `<h1>/<h2>` 加 `hero-title` 类，给 CSS 精确控制句柄（替换原来的 `#home h1` 选择器）。
2. hero 底部角色标签 `whitespace-nowrap` → 加 `max-w-[90vw]` 防溢出。
3. footer 社交图标 `w-8 h-8` → `w-10 h-10`（桌面）/ 移动端 `w-11 h-11`。
4. nav hamburger 按钮补 `min-w-[44px] min-h-[44px] flex items-center justify-center`。
5. 博客/约稿"加载中"占位与卡片容器补 `h-full`/`flex`，统一网格行高。
6. `script.js` 中博客卡片渲染：标题加 `line-clamp-2`，卡片根加 `flex flex-col h-full`，"阅读 →" 用 `mt-auto` 推到底部。

## 六、文章详情模态框排版
- `padding: 30px 40px` → 移动端 `20px`，桌面保留。
- 正文 `line-height: 1.8`、`font-size: 16px`（移动端 `15px`）。
- 代码块/图片加 `overflow-x-auto` 和圆角，防止移动端横向溢出。
- modal 标题 `28px` → 移动端 `22px`（已有 `20px !important`，调整为非 important 的 `22px`）。

## 七、不做的事（避免过度改动）
- 不动 Tailwind CDN、字体加载、JS 业务逻辑（博客/约稿/Lightbox 功能保持原样）。
- 不动颜色体系、动画时序（已做过 GPU 优化）。
- 不动 `articles.json`/`gallery.json` 内容。

## 验证方式
- 本地用浏览器 devtools 在 360 / 375 / 414 / 768 / 1024 / 1440 / 1920 多个尺寸目测。
- 重点检查：hero 不溢出、卡片高度对齐、长标题截断、触控目标达标、modal 不横向滚动。

## 改动文件
- `style.css`（主要重写 media query 段 + 新增 token）
- `index.html`（约 6 处微调，加类名/触控尺寸）
- `script.js`（博客卡片渲染处加 line-clamp 和 h-full）