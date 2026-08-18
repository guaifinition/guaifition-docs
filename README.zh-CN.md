# Guaifinition Docs

Guaifinition Docs 是统一的中文 AI 技术课程与研究知识库，采用 OpenAI Docs 风格展示课程目录和技术文章。

项目采用分层设计：Markdown 是内容层，Next.js 是渲染层，GitHub Actions 是发布层。文章可以继续作为独立 Markdown 文件在 Obsidian 中维护，并由统一渲染器处理标题、目录、公式、表格、代码、图片和主题切换。

## 在线访问

<https://guaifinition.github.io/guaifition-docs/>

## 本地运行

```bash
npm ci
npm run dev -- --port 4173
```

然后访问 <http://localhost:4173/>。

## 目录说明

- `content-library/`：文章 Markdown 与内容索引。
- `public/content-assets/`：图片、SVG 和图表资源。
- `src/components/docs/`：统一文档布局与 Markdown 渲染组件。
- `src/lib/content.ts`：课程与文章数据访问层。
- `scripts/import-content.mjs`：内容与资源导入脚本。
- `scripts/check-content.mjs`：内容质量检查脚本。

## 检查

```bash
npm run content:import
npm run check
```

公开站点仅包含经过整理的课程与技术研究内容，不包含公司业务资料、鉴权信息、工作区导出或本地调试记录。
