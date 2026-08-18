# 风景园林案例灵感库 Web

基于 **React 18 + Vite 6** 重构的浏览端，沿用原 `index.html` 的森林绿 + 暖调灰设计语言。

## 快速运行

- 开发预览：双击 `start-dev.bat`，浏览器打开 `http://127.0.0.1:5180`
- 生产构建：双击 `build.bat`，产物输出到 `dist/` 目录

## 功能要点

1. **全屏 HERO 首页**
   - 大标题「藏山川于像素，赋场地以新生」
   - 背景轮播 + 暗色遮罩 + 颗粒纹理
   - 动态统计（案例数 / 景观类型 / 设计风格）

2. **悬浮玻璃导航栏**
   - 顶部居中悬浮胶囊条，毛玻璃 backdrop-blur
   - 滚动后切换为浅色玻璃状态
   - 集成「灵感库 / 管理中心」切换

3. **瀑布流 + 多维筛选**
   - CSS multi-column 瀑布流，响应 1~5 列
   - 一级分类标签（沿用原分类规则）
   - 搜索框 + 6 个下拉筛选 + 排序 + 只看收藏
   - 已选条件以 chip 形式展示，可快速移除

4. **详情弹窗 + 图片查看器**
   - 三栏布局：左侧大图、中间元数据、右侧推荐
   - 图片查看器支持：滚轮缩放（以光标为锚点）、拖拽平移、双击放大/还原、工具栏缩放按钮
   - 键盘快捷键：`+/-` 缩放，`0` 还原，`←/→` 切换图片，`Esc` 关闭

5. **管理中心**
   - 统计面板 + 全量 AI 打标明细表

## 数据源与素材

项目已**自包含**，克隆后即可运行，不再依赖仓库以外的文件：

- `data.js`（仓库根目录）：案例数据，由 `generate_data.py` 生成。Vite 插件 `virtual:inspiration-data` 将其转为虚拟模块并支持热更新。
- `public/小红书素材爬取/`：图片素材（已随仓库提交）。开发时由 Vite 直接从 `public/` 提供，构建时自动拷贝进 `dist/`。

> 更新数据/图片：重新生成 `data.js`，或往 `public/小红书素材爬取/` 放入图片后重新构建即可。

## 目录结构

```
web\
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js         base: './'，读取本地 data.js + public/ 素材
├── data.js                案例数据（已提交）
├── start-dev.bat          一键启动开发服务器
├── build.bat              一键构建
├── public\
│   └── 小红书素材爬取\      图片素材（已提交，构建时拷贝进 dist/）
├── src/
│   ├── main.jsx
│   ├── App.jsx            主状态管理
│   ├── data/items.js      数据归一化 + 分类规则
│   ├── utils/format.js    日期、计数等工具
│   ├── styles/global.css  全部样式
│   └── components/        各功能组件
└── dist/                  构建产物（npm run build 生成，已被 .gitignore 忽略）
```

## 部署到 GitHub Pages

项目已设置 `base: './'`，构建产物可部署到任意子路径（含 `https://<user>.github.io/<repo>/`）：

1. `npm install`
2. `npm run build`（产物在 `dist/`）
3. 将 `dist/` 内容推送到 `gh-pages` 分支，或用 GitHub Actions 自动部署。

也可直接将 `dist/` 托管到任意静态服务器。
