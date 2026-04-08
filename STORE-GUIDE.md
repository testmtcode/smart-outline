# Chrome Web Store 发布指南

## 📸 截图要求

Chrome Web Store 需要至少 1 张截图，推荐 3-5 张。

### 截图规格
- **尺寸**: 1280x800 (推荐) 或 640x400
- **格式**: PNG 或 JPEG
- **大小**: 每张不超过 5MB

### 截图内容建议

已有截图可用（在根目录）：
- `compat-掘金.png` - 掘金网站效果
- `compat-MDN.png` - MDN 文档效果
- `compat-GitHub.png` - GitHub README 效果

**推荐截图内容：**
1. **主界面** - 悬浮球和大纲面板并排展示
2. **掘金文章** - 技术文章阅读场景
3. **MDN 文档** - 文档类网站使用
4. **GitHub README** - 代码仓库场景
5. **快捷键演示** - Alt+O 快速呼出

### 制作新截图

打开浏览器，访问以下网址截图：
```
掘金: https://juejin.cn/post/6844904042186825736
MDN: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide
GitHub: https://github.com/facebook/react/blob/main/README.md
```

截图时：
1. 确保悬浮球和面板都显示
2. 页面内容清晰可见
3. 使用浏览器全屏模式 (F11)
4. 分辨率设为 1280x800

---

## 📝 商店描述模板

### 简短描述（132字符以内）
```
中文：为任何网页自动生成目录大纲，悬浮导航一键跳转
英文：Auto-generate table of contents for any webpage with floating navigation
```

### 详细描述

```markdown
## SmartOutline - 智能网页大纲

一键生成任意网页的目录导航，让长文阅读更轻松！

### ✨ 主要功能

- 🎯 **自动识别** - 智能分析页面标题结构
- 🚀 **悬浮导航** - 右下角悬浮球，随时呼出
- ⚡ **快速跳转** - 点击大纲项瞬间定位
- 🌐 **广泛兼容** - 支持知乎、掘金、MDN、GitHub 等主流网站
- ⌨️ **快捷键支持** - Alt+O 快速开关
- 🎨 **优雅设计** - 简洁美观的界面风格

### 📝 使用方法

1. 安装扩展后访问任意网页
2. 点击右下角「目录」悬浮球
3. 选择要跳转的章节

### 🔒 隐私保护

- ✅ 纯本地运行，不上传任何数据
- ✅ 不收集个人信息
- ✅ 开源透明

### 📧 反馈

遇到问题或有建议？欢迎提交 GitHub Issue！

---

## SmartOutline - Intelligent Webpage Outline

One-click table of contents for any webpage, making long articles easier to read!

### Features

- Auto-detect page heading structure
- Floating navigation button
- One-click jump to sections
- Support major websites
- Keyboard shortcut (Alt+O)
- Clean and elegant design

### Privacy

- Runs locally only
- No data collection
- Open source
```

---

## 🔗 隐私政策链接

发布后上传到 GitHub Pages 或其他静态托管，获取公开链接。

临时可用链接：
```
https://github.com/testmtcode/smart-outline/blob/main/PRIVACY-POLICY.md
```

**你的 GitHub 仓库地址：**
```
https://github.com/testmtcode/smart-outline
```

---

## 📤 上传步骤

1. 访问 https://chrome.google.com/webstore/devconsole
2. 点击 "New Item"
3. 上传 `smart-outline-v1.0.0.zip`
4. 填写商店信息
5. 提交审核

## 💰 费用

- 开发者注册费：**$5 USD**（一次性）
- 可使用支付宝/信用卡支付
