# 项目盘点

## 1. 项目身份

当前本地仓库是统一后的 Guaifinition Docs 网站项目：

~~~
<workspace>/guaifition-docs
~~~

GitHub 远程仓库：

~~~
https://github.com/guaifinition/guaifition-docs.git
~~~

当前分支：master

当前发布站点：

~~~
https://guaifinition.github.io/guaifition-docs/
~~~

本地开发站点：

~~~
http://localhost:4173/
~~~

当前仓库已经包含运行现有网站所需的正文 Markdown、内容索引、图片资源、渲染代码和 GitHub Pages 工作流。正常情况下，另一台电脑只需克隆此仓库，不需要复制当前电脑的整个用户目录。

## 2. 当前内容规模

本次盘点时仓库内容索引约包含：

- 150 篇文章记录；
- 20 个课程或内容集合；
- 约 174 个静态导出页面；
- 约 422 个正文关联资源。

实际数量以以下命令输出为准：

~~~
npm run content:check
~~~

## 3. 仓库内的重要目录

~~~
ai-website-cloner-template/
├─ content-library/       # 正文 Markdown、内容索引 index.json
├─ public/content-assets/ # 正文图片、插图、图表等本地资源
├─ public/sites/          # 站点级静态资源
├─ src/                   # Next.js 页面、组件、Markdown 渲染与主题样式
├─ scripts/               # 内容导入、校验和 AI 配置同步脚本
├─ docs/                  # 本交接、迁移和内容生产文档
├─ .github/workflows/     # CI 检查与 GitHub Pages 发布工作流
├─ .claude/               # clone-website Skill 的源文件
├─ .codex/、.cursor/ 等   # 面向不同 AI 编程工具的配置副本
├─ package.json           # 命令和依赖
├─ package-lock.json      # 固定依赖版本
├─ next.config.ts         # 静态导出和 GitHub Pages basePath
├─ tsconfig.json          # TypeScript 配置
└─ .nvmrc                 # Node.js 主版本：24
~~~

## 4. 哪些内容需要迁移

### 必须迁移或从 GitHub 克隆的内容

以下内容已经在 Git 中，应随仓库迁移：

- content-library/：所有当前网站正文 Markdown 和 index.json；
- public/content-assets/：当前正文使用的图片和其他资源；
- src/：网站页面、文章渲染器、目录侧栏、主题切换和布局；
- scripts/：内容校验和导入逻辑；
- package.json、package-lock.json、.nvmrc；
- next.config.ts、TypeScript、ESLint、Tailwind 和 PostCSS 配置；
- .github/workflows/：持续集成与 GitHub Pages 部署；
- 本目录及仓库根目录中的项目说明文档。

### 不需要复制的目录

这些目录属于本地生成物或依赖缓存，不能作为迁移依据：

- node_modules/：运行 npm ci 重新安装；
- .next/：Next.js 构建缓存，运行构建时自动生成；
- out/：静态导出结果，运行构建时自动生成；
- 本机用户目录下的 Codex 登录信息、GitHub Token、浏览器 Cookie 和密钥。

## 5. 当前电脑上的外部内容目录

这些目录位于 Git 仓库外，主要供 npm run content:import 重新导入原始资料使用：

~~~
<workspace>/agentic-ai-blog
<workspace>/mcts-blog
<workspace>/tech-series
<downloads>/AI课程_论文式HTML知识库_13门88讲\AI课程_论文式HTML知识库
~~~

当前这些目录仍可找到。另一个旧的技术文档仓库 tech-series-source 没有保留本地克隆，也已经不作为当前项目依赖。

索引中还留有一些历史来源记录，指向当前电脑 Documents 下曾经存在、但现在并不完整的目录，例如：

~~~
<documents>/md
<documents>/anthropic-ai-field-notes
<documents>/x-waterloo-intern 2
<documents>/grok-build-analysis.html
<documents>/xwechat_files
~~~

这些历史目录不是现有网站正常构建的必要条件。由于部分原始文件已经不在当前电脑上，不能把 npm run content:import 视为完全可复现的迁移步骤，详见外部内容源迁移说明。

## 6. 当前网站能否只靠 GitHub 仓库运行

可以。现有版本的正文和图片已经进入仓库，另一台电脑执行 npm ci、npm run content:check 和 npm run dev 即可运行。

不能保证的是：在没有原始外部目录的情况下，重新执行 npm run content:import 后仍然得到完全相同的全部内容。新机器上增加文章时，建议直接在 content-library/ 增加 Markdown 并更新 index.json，不要无准备地执行导入脚本。

## 7. 已删除的旧公开入口

统一站点发布前，以下旧 GitHub 仓库已经按要求删除：

- guaifinition/mcts-blog
- guaifinition/tech-series
- guaifinition/tech-series-source
- guaifinition/agentic-ai-blog

当前用户入口统一为：<https://guaifinition.github.io/guaifition-docs/>。
