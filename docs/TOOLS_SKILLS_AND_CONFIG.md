# 工具、Skills 与配置

## 1. 必要运行环境

### Git

用于克隆仓库、查看变更、提交和推送。

### Node.js 24 与 npm

用于运行 Next.js、TypeScript、Markdown 渲染和构建流程。版本约束写在：

~~~
.nvmrc
package.json
~~~

依赖版本由 package-lock.json 固定。正常安装使用 npm ci。

### GitHub CLI

gh 不是网站运行时依赖，但建议安装，用于：

- gh auth login：新电脑登录 GitHub；
- gh auth status：确认认证状态；
- gh run list：查看 Pages 工作流；
- gh run view <id> --log-failed：查看失败日志。

## 2. 项目主要技术

项目运行时和构建依赖包括：

- Next.js 16；
- React 19；
- TypeScript；
- Tailwind CSS v4；
- react-markdown 与 remark-gfm；
- remark-math 与 rehype-katex；
- rehype-raw；
- cheerio、turndown 及 GFM 转换插件；
- lucide-react；
- ESLint。

完整版本以 package.json 和 package-lock.json 为准，不建议在另一台电脑手动逐个安装这些包。

## 3. 重要项目配置

### .nvmrc

指定 Node.js 主版本 24。

### next.config.ts

启用静态导出：

~~~
output: 'export'
trailingSlash: true
basePath: process.env.NEXT_PUBLIC_BASE_PATH || ''
~~~

GitHub Pages 项目站点构建时使用：

~~~
NEXT_PUBLIC_BASE_PATH=/guaifition-docs
~~~

### .github/workflows/

- ci.yml：安装依赖、同步 AI 配置、执行 lint、TypeScript 检查和 build；
- deploy-pages.yml：执行内容检查、静态构建并部署到 GitHub Pages。

### .gitignore

忽略 node_modules、.next、out 等生成内容。不要为了“让 Git 看见”而强行添加这些目录。

## 4. 仓库内的 AI 编程配置

仓库中保留了面向不同 AI 编程代理的协作配置：

- AGENTS.md：代理协作说明；
- CLAUDE.md、GEMINI.md：指向代理规则；
- .claude/skills/clone-website/SKILL.md：网站逆向克隆 Skill 的源文件；
- .codex/、.cursor/、.windsurf/、.kiro/、.cline/、.roo/ 等：不同代理或编辑器的配置副本。

同步脚本：

~~~
node scripts/sync-skills.mjs
bash scripts/sync-agent-rules.sh
~~~

这些配置有助于继续做网站逆向和风格维护，但不是“运行现有网站”或“新增普通 Markdown 文章”的硬性依赖。新电脑可以先完成网站冷启动，再按使用的 AI 工具安装对应 Skill。

## 5. Codex 本机 Skills 和插件

当前电脑的 Codex Skills 位于用户目录，例如：

~~~
~/.codex/skills/openai-html-theme/SKILL.md
~/.codex/plugins/cache/...
~~~

这些是 Codex 的机器级配置，不在 GitHub 仓库内，也不应复制其中的登录凭据。另一台电脑若使用 Codex，可重新安装或配置：

- openai-html-theme：继续生成或维护 OpenAI Docs 风格页面时有用；
- 浏览器控制 Skill：用于检查本地页面的视觉和交互；
- GitHub 相关 Skill：用于仓库、工作流和发布协作。

这些 Skill 只服务于开发协作，网站最终运行不依赖它们。项目自己的 Markdown 渲染器和 src/ 代码才是网站运行时的实际实现。

## 6. 可选工具

- Python：当前网站日常构建不需要；处理历史转录、批量资料转换或研究脚本时可选；
- 浏览器：用于视觉检查和确认图片、公式、目录与主题切换；
- VS Code 或其他编辑器：用于编辑 Markdown、JSON 和 TypeScript；
- Docker：仓库提供 Dockerfile 和 docker-compose.yml，但普通本地开发不要求 Docker。

## 7. 认证和秘密管理

以下内容只能在新电脑重新认证，不要复制进仓库：

- GitHub CLI 登录状态和 Token；
- SSH 私钥；
- 浏览器 Cookie；
- Codex 或其他 AI 工具的账号配置；
- .env* 中的私密环境变量。

仓库公开发布前，任何文章、图片元数据、日志和 Markdown 都应再次检查，不得包含公司内部接口、业务字段、密钥、用户数据或本地绝对路径。
