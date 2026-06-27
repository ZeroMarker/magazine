# Pretext.js 使用文档

> 纯 JavaScript/TypeScript 多行文本测量与布局库。快速、准确，支持所有语言。可渲染到 DOM、Canvas、SVG。

## 简介

Pretext 是一个用于多行文本测量和布局的 JavaScript 库。它避免了 DOM 测量（如 `getBoundingClientRect`、`offsetHeight`）引起的布局重流，而是使用浏览器的字体引擎作为基准，实现自己的文本测量逻辑。

## 安装

```bash
npm install @chenglou/pretext
```

或通过 CDN 引入：

```javascript
import { prepare, layout } from 'https://esm.sh/@chenglou/pretext@0.0.4'
```

## 基本用法

### 1. 测量段落高度（不接触 DOM）

```javascript
import { prepare, layout } from '@chenglou/pretext'

// 准备文本（一次性工作）
const prepared = prepare('这是一段测试文本，用于测量高度。', '16px "Noto Sans SC"')

// 计算布局（纯算术运算）
const { height, lineCount } = layout(prepared, 320, 24) // 320px 最大宽度，24px 行高

console.log(`高度: ${height}px，行数: ${lineCount}`)
```

### 2. 手动布局段落行

```javascript
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('这是一段测试文本。', '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26)

for (let i = 0; i < lines.length; i++) {
  console.log(`第 ${i + 1} 行: ${lines[i].text}`)
}
```

## API 参考

### 准备函数

#### `prepare(text, font, options?)`
一次性文本分析和测量，返回不透明的句柄。

- `text`: 要测量的文本
- `font`: CSS 字体字符串，如 `'16px Inter'`
- `options`: 可选配置
  - `whiteSpace`: `'normal'`（默认）或 `'pre-wrap'`
  - `wordBreak`: `'normal'`（默认）或 `'keep-all'`
  - `letterSpacing`: 字母间距（像素值）

#### `prepareWithSegments(text, font, options?)`
与 `prepare()` 相同，但返回更丰富的结构用于手动布局。

### 布局函数

#### `layout(prepared, maxWidth, lineHeight)`
计算给定宽度和行高的文本高度。

- `prepared`: `prepare()` 返回的句柄
- `maxWidth`: 最大宽度（像素）
- `lineHeight`: 行高（像素）
- 返回: `{ height: number, lineCount: number }`

#### `layoutWithLines(prepared, maxWidth, lineHeight)`
高级 API，返回所有行的详细信息。

- 返回: `{ height, lineCount, lines: LayoutLine[] }`

#### `walkLineRanges(prepared, maxWidth, onLine)`
低级 API，遍历每一行而不构建文本字符串。

```javascript
walkLineRanges(prepared, 320, line => {
  console.log(`行宽: ${line.width}px`)
})
```

### 测量函数

#### `measureLineStats(prepared, maxWidth)`
返回行数和最宽行的宽度。

- 返回: `{ lineCount: number, maxLineWidth: number }`

#### `measureNaturalWidth(prepared)`
返回最宽的强制换行宽度。

### 流式布局

#### `layoutNextLine(prepared, start, maxWidth)`
迭代器 API，每行可以使用不同的宽度。

```javascript
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

while (true) {
  const line = layoutNextLine(prepared, cursor, 320)
  if (!line) break
  
  console.log(`行文本: ${line.text}`)
  cursor = line.end
  y += 26
}
```

#### `layoutNextLineRange(prepared, start, maxWidth)`
与 `layoutNextLine()` 相同，但不分配文本字符串。

#### `materializeLineRange(prepared, line)`
将 `LayoutLineRange` 转换为包含完整文本的 `LayoutLine`。

### 富文本内联流

#### `prepareRichInline(items)`
编译内联项目数组。

```javascript
import { prepareRichInline, walkRichInlineLineRanges } from '@chenglou/pretext/rich-inline'

const prepared = prepareRichInline([
  { text: 'Hello ', font: '16px Inter' },
  { text: '@user', font: 'bold 16px Inter', break: 'never', extraWidth: 20 },
  { text: ' world', font: '16px Inter' }
])
```

### 工具函数

#### `clearCache()`
清除 Pretext 的内部缓存。

#### `setLocale(locale?)`
设置区域设置。

## 类型定义

```typescript
type LayoutLine = {
  text: string
  width: number
  start: LayoutCursor
  end: LayoutCursor
}

type LayoutLineRange = {
  width: number
  start: LayoutCursor
  end: LayoutCursor
}

type LayoutCursor = {
  segmentIndex: number
  graphemeIndex: number
}
```

## 项目中的实际应用

在 `magazine-pretext.html` 中，Pretext 用于动态测量不同排版布局的文本：

```javascript
import { prepare as p_, layout as l_ } from 'https://esm.sh/@chenglou/pretext@0.0.4'

// 测量函数
const ms = (txt, font, w, lh) => {
  try {
    return l_(p_(txt, font, { whiteSpace: 'normal' }), w, lh)
  } catch (e) {
    return null
  }
}

// 使用示例
const result = ms('这是一段文本', '16px "Noto Sans SC"', 320, 24)
if (result) {
  console.log(`行数: ${result.lineCount}, 高度: ${result.height}`)
}
```

### 实际应用场景

1. **动态调整字体大小**: 根据容器大小自动调整文本显示
2. **计算阅读时间**: 基于字数和行数估算阅读时间
3. **响应式布局**: 根据屏幕宽度调整列数和文本排列
4. **虚拟滚动**: 精确计算文本高度用于虚拟列表

## 注意事项

1. `prepare()` 和 `prepareWithSegments()` 是一次性操作，不要重复调用
2. 调整窗口大小时，只需重新调用 `layout()`，无需重新 `prepare()`
3. 需要支持 `Intl.Segmenter` 和 Canvas 2D 文本测量的环境
4. 字符串使用 CSS 字体格式，如 `'16px Inter'` 或 `'bold 14px "Helvetica Neue"'`
5. 空字符串返回 `{ lineCount: 0, height: 0 }`，需要与浏览器行为一致时请自行处理

## 更多资源

- [官方文档](https://github.com/chenglou/pretext)
- [在线演示](https://chenglou.me/pretext/)
- [npm 包](https://www.npmjs.com/package/@chenglou/pretext)
