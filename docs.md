# 杂志排版布局项目文档

> 本项目展示 7 种经典杂志版面结构，并使用 Pretext.js 实现交互式排版演示。

## 项目概述

这是一个杂志排版布局示例项目，包含：

1. **7 种经典版面结构** - 从通栏式到自由版式的完整布局系统
2. **交互式演示** - 使用 Pretext.js 实现的动态排版测量
3. **详细文档** - 布局说明、技术实现和 API 文档

## 文档导航

### 📐 布局系统
- [经典杂志排版布局](layout.md) - 7 种基础版面结构详解
  - 通栏式 · Single Column
  - 双栏式 · Two-Column
  - 三栏式 · Three-Column
  - 图文绕排 · Text Wrap
  - 交错对位 · Staggered / Alternating
  - 模块化网格 · Modular Grid
  - 自由版式 · Free / Asymmetric

### 🛠️ 技术实现
- [Pretext.js 使用文档](pretext.md) - 文本测量与布局库完整指南
  - 安装与配置
  - API 参考
  - 实际应用示例
  - 高级用法

### 📁 项目文件
- [README.md](README.md) - 项目简介和快速开始
- [magazine-pretext.html](magazine-pretext.html) - 交互式排版演示

## 快速开始

### 1. 查看布局说明
阅读 [经典杂志排版布局](layout.md) 了解 7 种基础版面结构的特点和适用场景。

### 2. 运行演示
在浏览器中打开 `magazine-pretext.html` 查看交互式排版演示：
- 调整字体大小查看不同排版效果
- 测量文本高度和行数
- 体验不同布局的响应式表现

### 3. 技术集成
参考 [Pretext.js 使用文档](pretext.md) 将文本测量功能集成到您的项目中。

## 布局选择指南

根据内容类型选择合适的布局：

| 内容类型 | 推荐布局 | 原因 |
|---------|---------|------|
| 编辑手记、社论 | 通栏式 | 阅读连续性好，适合长篇内容 |
| 专题报道、深度文章 | 双栏式 | 平衡信息密度和阅读体验 |
| 参考手册、年鉴 | 三栏式 | 高信息密度，适合碎片化阅读 |
| 人物专访、产品展示 | 图文绕排 | 图文融合度高，视觉吸引力强 |
| 作品集、项目展示 | 交错对位 | 节奏感强，引导视线流动 |
| 目录页、产品目录 | 模块化网格 | 结构清晰，适合分类展示 |
| 时尚杂志、艺术刊物 | 自由版式 | 视觉冲击力强，适合创意表达 |

## 技术架构

### 前端技术栈
- **Pretext.js** - 文本测量与布局引擎
- **现代 CSS** - Grid、Flexbox、多列布局
- **原生 JavaScript** - 交互控制与动态测量

### 核心功能
1. **文本测量** - 精确计算文本高度和行数
2. **动态布局** - 根据容器大小调整排版
3. **响应式设计** - 适配不同屏幕尺寸
4. **交互控制** - 实时调整字体大小、列数等参数

### 性能优化
- 使用 Pretext.js 避免 DOM 重流
- 缓存文本测量结果
- 按需重算布局参数

## 示例代码

### 基本文本测量
```javascript
import { prepare, layout } from '@chenglou/pretext'

// 准备文本
const prepared = prepare('这是一段测试文本', '16px "Noto Sans SC"')

// 测量布局
const { height, lineCount } = layout(prepared, 320, 24)
console.log(`高度: ${height}px，行数: ${lineCount}`)
```

### 响应式布局调整
```javascript
// 根据容器宽度调整列数
function adjustColumns(containerWidth) {
  if (containerWidth > 1200) return 3
  if (containerWidth > 800) return 2
  return 1
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  const columns = adjustColumns(window.innerWidth)
  // 更新布局...
})
```

## 最佳实践

### 布局设计原则
1. **呼吸感** - 合理使用留白，避免视觉疲劳
2. **节奏感** - 通过布局变化引导阅读节奏
3. **一致性** - 保持整体风格统一
4. **响应式** - 适配不同设备和屏幕尺寸

### 性能考虑
1. **避免频繁重排** - 使用 Pretext.js 进行文本测量
2. **缓存计算结果** - 对相同文本和配置复用测量结果
3. **按需加载** - 只在需要时计算布局参数
4. **防抖处理** - 对窗口大小变化等事件进行防抖

## 扩展资源

### 相关工具
- [Pretext.js 官方文档](https://github.com/chenglou/pretext)
- [Pretext.js 在线演示](https://chenglou.me/pretext/)

### 设计参考
- 杂志排版设计原则
- 网格系统设计
- 响应式排版最佳实践

### 技术文档
- CSS 多列布局
- CSS Grid 布局
- Flexbox 布局

## 贡献指南

欢迎贡献代码和文档：

1. Fork 项目仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发起 Pull Request
- 邮件联系

---

*本文档最后更新于 2026 年 6 月 27 日*