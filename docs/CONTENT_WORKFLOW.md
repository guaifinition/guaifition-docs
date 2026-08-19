# 新增文章工作流

## 1. 内容层与渲染层分离

本项目将内容和网站界面分开：

- content-library/*.md 是文章正文和知识库内容层；
- content-library/index.json 是课程、文章顺序、标题、摘要和文件路径的结构化索引；
- public/content-assets/ 是随仓库发布的图片、插图和图表资源；
- src/ 是统一的 OpenAI Docs 风格渲染层和页面布局；
- scripts/ 负责导入、检查和构建前的数据处理。

因此，新增文章通常只需要增加 Markdown、复制图片资源、更新索引，不需要复制一套 HTML 模板。

## 2. 最稳妥的新增文章方法

### 第一步：创建 Markdown

在 content-library/ 中创建唯一文件名，例如：

~~~
content-library/agentic-ai-new-article.md
~~~

正文建议采用以下结构：

~~~
# 文章标题

## 摘要

正式、完整的摘要段落。

## 关键词

Agentic AI、LLM、evaluation

## 1. 背景

正文段落。

## 2. 方法与分析

正文段落。

### 2.1 子问题

正文段落。

## 3. 结论

正文段落。

## 参考资料

- [官方资料标题](https://example.com)
~~~

文章页面会根据 Markdown 标题生成左侧目录。标题应保持层级连续：## 作为文章一级章节，### 作为其子章节，不要在没有 ## 的情况下直接使用大量 ###。

## 3. 公式、表格、代码和图片

### LaTeX 公式

行内公式使用单美元符号：

~~~
模型的损失函数为 $L(\theta)$。
~~~

独立公式使用双美元符号：

~~~
$$
L(\theta)=\frac{1}{n}\sum_{i=1}^{n}\ell(f_\theta(x_i),y_i)
$$
~~~

不要把公式写成图片或未经转义的 HTML。项目使用 KaTeX 渲染数学公式。

### 表格

使用 GitHub Flavored Markdown 表格：

~~~
| 方法 | 优点 | 局限 |
| --- | --- | --- |
| RAG | 可接入外部知识 | 依赖检索质量 |
~~~

### 图片和插图

图片文件应复制到 public/content-assets/ 下的明确子目录，例如：

~~~
public/content-assets/agentic-ai/new-article/architecture.png
~~~

Markdown 中使用以网站根路径为基准的地址：

~~~
![系统架构图](/content-assets/agentic-ai/new-article/architecture.png)
~~~

不要引用当前电脑的绝对路径、临时目录、file:/// 地址或仅存在于旧电脑的相对路径。提交前必须在浏览器中确认图片返回 HTTP 200 并正常显示。

## 4. 更新 index.json

每篇文章需要在 content-library/index.json 的 records 数组中添加记录，并把文章加入对应课程的 items。现有记录可作为字段模板，常见字段包括：

~~~
{
  "id": "agentic-ai-new-article",
  "course": "agentic-ai",
  "courseTitle": "Agentic AI 智能体工作流",
  "module": "工作流设计",
  "title": "文章标题",
  "summary": "一到两句正式摘要",
  "bodyFile": "agentic-ai-new-article.md",
  "sourceFiles": [],
  "type": "article",
  "order": 32,
  "tags": ["Agentic AI", "LLM"]
}
~~~

注意事项：

- id 必须唯一；
- bodyFile 必须与 content-library/ 中的文件名一致；
- order 应放在课程内正确位置；
- 课程的 count、items 和模块信息应同步更新；
- 不要在文章正文或摘要中写 [返回首页]、调试信息或原始 Markdown 标记；
- 不要把模型内部引用标记写入发布内容；
- 中英文标题需要在语义上分行时，使用清晰的 Markdown 标题或段落，不要把两个标题拼成难以阅读的一行。

## 5. 新文章检查

至少执行：

~~~
npm run content:check
npm run check
npm run dev -- --port 4173
~~~

浏览器中检查：

- 首页课程目录是否出现新文章；
- 课程页顺序是否正确；
- 文章左侧目录是否没有重复项；
- 标题、英文副标题、段落和列表是否正常换行；
- LaTeX 是否渲染为公式，而不是显示原始美元符号；
- 表格是否没有溢出正文区域；
- 图片是否实际显示，没有破图图标；
- 深色和浅色模式是否都可读；
- 浏览器控制台没有 React key、404 资源或未处理异常。

## 6. 是否运行 content:import

默认不要运行：

~~~
npm run content:import
~~~

这个命令会清理并重建 content-library/ 和 public/content-assets/，然后从仓库外的源目录重新导入。它不是“增加一篇文章”的增量命令。如果新电脑没有完整的原始资料目录，运行后可能导致内容减少或资源缺失。

只有在已经准备好所有外部源目录，并且明确需要重新生成整个内容库时，才使用它；运行前应先创建 Git 分支或备份当前内容。

## 7. 新文章必须生成总结图

从 `2026-08-19` 起，新增文章必须在发布前生成一张基于正文内容的高清总结图，并在 `content-library/index.json` 中填写：

~~~json
{
  "publishedAt": "2026-08-19",
  "coverImage": "/content-assets/<course>/<article>/summary.png",
  "coverAlt": "文章主题总结图"
}
~~~

全局规则保存在 `content-library/publishing-config.json`：默认图像模型为 `gpt-image-2`，用途为文章封面和首页最新文章卡片，质量要求为可用范围内的最高分辨率。

生成图应放入 `public/content-assets/`，不要只保留在 Codex 的临时生成目录。建议优先绘制技术流程、系统架构、算法关系或学习路线；图中避免小号文字、品牌 Logo、水印和未经文章支持的具体数值。

`npm run content:check` 会检查所有 `publishedAt` 不早于强制日期的文章是否具备有效本地总结图。没有总结图的文章不能通过发布检查。
