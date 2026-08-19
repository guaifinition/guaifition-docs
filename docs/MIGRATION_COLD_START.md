# 另一台电脑冷启动与接手指南

本指南用于在一台没有现成本地环境的新电脑上接手 Guaifinition Docs，运行现有网站、增加文章并发布到 GitHub Pages。

## 1. 安装必要软件

必须安装：

1. Git；
2. Node.js 24 或兼容的 Node.js 版本；
3. npm（随 Node.js 安装）；
4. GitHub CLI gh，用于认证、查看工作流和排查发布状态。

建议使用 nvm 管理 Node.js。仓库中的 .nvmrc 已指定主版本 24。

安装后检查：

~~~
node --version
npm --version
git --version
gh --version
~~~

若使用 nvm：

~~~
nvm install 24
nvm use 24
~~~

## 2. 克隆项目

~~~
cd C:\Users\<你的用户名>\Projects
git clone https://github.com/guaifinition/guaifition-docs.git
cd guaifition-docs
~~~

不要把项目路径硬编码为原电脑的用户名。只要路径中没有特殊字符，放在任意工作目录均可。

## 3. 安装依赖

使用锁文件安装完全一致的依赖：

~~~
npm ci
~~~

不要优先使用 npm install 替代 npm ci。只有在确实要升级依赖时，才修改 package.json 和 package-lock.json，并完整运行检查。

## 4. 第一次检查

~~~
npm run content:check
npm run check
~~~

content:check 检查文章索引、Markdown、公式、表格和本地资源；check 还会执行 lint、TypeScript 检查和生产构建。

若只想先启动网站：

~~~
npm run dev -- --port 4173
~~~

浏览器访问：<http://localhost:4173/>。

## 5. 本地运行方式

日常编辑使用开发服务器：

~~~
npm run dev -- --port 4173
~~~

Next.js 会在文件变化后自动刷新。终止服务按 Ctrl+C。

验证 GitHub Pages 形式的静态导出时，在 PowerShell 中执行：

~~~
$env:NEXT_PUBLIC_BASE_PATH = '/guaifition-docs'
npm run build
npx serve out -l 4173
~~~

如果只访问根路径本地预览，也可以省略 NEXT_PUBLIC_BASE_PATH。本项目的 next.config.ts 使用 output: 'export'，因此日常预览推荐 npm run dev 或 npx serve out -l 4173；不要把 npm start 当作主要部署路径。

## 6. GitHub 认证

GitHub 登录状态属于每台电脑的本机配置，不能从旧电脑复制。新电脑执行：

~~~
gh auth login
gh auth status
git remote -v
~~~

登录时选择 GitHub.com、HTTPS，并按提示完成浏览器设备认证。需要对仓库拥有写入权限，才能推送和触发 Pages 部署。

不要把 Token、Cookie、SSH 私钥或 .codex 用户配置提交到仓库。

## 7. 修改、检查和发布

推荐流程：

~~~
# 修改 content-library、public/content-assets 或 src
npm run content:check
npm run check
git status
git diff --stat
git add content-library public/content-assets src scripts docs package.json package-lock.json
git commit -m "add new article"
git push origin master
~~~

如果修改了其他配置文件，应根据 git status 有选择地加入。不要无差别提交 .next/、out/ 或 node_modules/。

推送后，GitHub Actions 会自动运行 .github/workflows/deploy-pages.yml。可以查看：

~~~
gh run list --repo guaifinition/guaifition-docs --limit 5
gh run watch <运行编号> --repo guaifinition/guaifition-docs
~~~

发布成功后访问：<https://guaifinition.github.io/guaifition-docs/>。GitHub Pages 可能需要短暂缓存刷新时间。

## 8. 发布失败时的排查顺序

1. 本地运行 npm run content:check；
2. 本地运行 npm run check；
3. 用 git status 确认新 Markdown、图片和 index.json 已提交；
4. 用 gh run list 找到失败的工作流；
5. 用 gh run view <运行编号> --log-failed 查看失败步骤；
6. 修复后重新检查、提交并推送。

## 9. 安全回滚

已经发布的错误修改，优先使用产生反向提交的方式回滚：

~~~
git log --oneline -10
git revert <错误提交ID>
git push origin master
~~~

这样保留完整历史，GitHub Pages 会按照新的提交重新部署。
