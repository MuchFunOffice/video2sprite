# Video2Sprite v2.0 🎮

强大的视频转精灵图工具，采用模块化架构，支持高级背景处理算法。

## ✨ 特性

- 🎨 **现代化UI** - 使用 Tailwind CSS 构建的响应式界面
- 🧩 **模块化架构** - 清晰的代码结构，易于维护和扩展
- 🎯 **多种抠图算法** - 边缘检测、颜色阈值、智能组合、绿幕处理
- ⚡ **高性能处理** - 优化的视频帧提取和处理流程
- 📱 **完全本地化** - 无需服务器，浏览器端完成所有处理
- 💾 **灵活导出** - 支持精灵图和配置文件下载

## 🏗️ 项目结构

```
video2sprite/
├── index.html                 # 主页面
├── js/
│   ├── app.js                # 应用入口
│   ├── core/                 # 核心模块
│   │   ├── VideoProcessor.js # 视频处理核心
│   │   ├── BackgroundRemover.js # 背景移除算法
│   │   └── SpriteGenerator.js # 精灵图生成
│   ├── ui/                   # 用户界面模块
│   │   ├── UIManager.js      # 界面管理
│   │   └── ProgressManager.js # 进度管理
│   └── utils/                # 工具模块
│       └── FileManager.js    # 文件管理
└── README.md
```

## 🚀 使用方法

1. 用浏览器打开 `index.html`
2. 拖拽或选择视频文件
3. 调整参数设置
4. 选择背景处理算法（可选）
5. 点击"开始转换"
6. 下载生成的精灵图和配置文件

## 🎨 背景处理算法

### 边缘检测法
- 适用于纯色背景
- 可调节边缘区域大小和亮度阈值
- 支持渐变透明效果

### 颜色阈值法
- 自动检测背景色
- 基于欧几里得距离的颜色匹配
- 精确的颜色相似度控制

### 智能组合法 (推荐)
- 结合多种算法优势
- 三遍处理：边缘 → 颜色 → 形态学清理
- 最佳综合效果

### 绿幕/蓝幕处理
- 专业色彩键控技术
- 支持自动检测或手动指定
- 适用于专业视频制作

## 🔧 技术栈

- **前端框架**: 原生 JavaScript (ES6 Modules)
- **UI框架**: Tailwind CSS
- **构建工具**: 无需构建，直接运行
- **浏览器支持**: 现代浏览器 (Chrome, Firefox, Safari, Edge)

## 📋 系统要求

- 支持 ES6 Modules 的现代浏览器
- Canvas API 支持
- Video API 支持
- File API 支持

## 🛠️ 开发者工具

项目提供了丰富的开发者工具：

```javascript
// 在浏览器控制台中使用
window.app.devTools.info()        // 查看应用信息
window.app.devTools.exportState() // 导出应用状态
window.app.devTools.reset()       // 重置应用
```

## 📝 配置文件格式

生成的配置文件包含以下信息：

```json
{
  "spritesheet": "spritesheet.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "totalFrames": 64,
  "columns": 8,
  "rows": 8,
  "frameInterval": 100,
  "backgroundRemoved": true,
  "backgroundMethod": "smart",
  "quality": 0.9,
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0"
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Video2Sprite v2.0** - 让视频转精灵图变得简单而强大！ 🎮✨ 