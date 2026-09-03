# 外部内容源迁移说明

## 1. 为什么需要这份说明

项目当前采用“内容 Markdown + 统一渲染器”的结构。已发布内容已经提交到仓库，因此正常运行和发布不依赖原始资料目录；但是 scripts/import-content.mjs 仍保留了从旧项目和本地资料批量导入的能力。

批量导入不是增量编辑命令。它会清理并重建内容目录，因此迁移时必须明确区分：

- 直接使用仓库中现有的 content-library/：安全、可立即运行；
- 重新从原始来源导入：需要额外准备外部目录，并可能改变现有内容集合。

## 2. 当前电脑上的可用源目录

当前已确认存在：

~~~
<workspace>/agentic-ai-blog
<workspace>/mcts-blog
<workspace>/tech-series
<downloads>/AI课程_论文式HTML知识库_13门88讲\AI课程_论文式HTML知识库
~~~

它们大致对应：

- agentic-ai-blog：Agentic AI 系列 Markdown 内容；
- mcts-blog：蒙特卡洛树搜索文章及原始网页资源；
- tech-series：技术系列文章、HTML 和媒体资源；
- AI课程_论文式HTML知识库：13 门课程、88 讲的历史课程资料。

## 3. 已不完整或不存在的历史来源

索引中的部分 sourceFiles 指向旧的 Documents 目录，但这些目录在当前电脑上并不完整，例如：

~~~
<documents>/md
<documents>/anthropic-ai-field-notes
<documents>/x-waterloo-intern 2
<documents>/grok-build-analysis.html
<documents>/xwechat_files
~~~

这些路径是历史来源记录，不代表网站运行时还会读取它们。content-library/ 中的最终 Markdown 和 public/content-assets/ 中的最终资源已经是当前发布版本的实际内容。

## 4. 新电脑是否必须复制这些目录

不必须。若目标是：

- 启动当前网站；
- 修改已有文章；
- 新增一篇 Markdown 文章；
- 运行检查并发布；

只需克隆 guaifition-docs 仓库，按照冷启动指南操作。

只有在以下情况才需要迁移外部源目录：

- 需要重新批量导入旧网站；
- 需要从原始 HTML、字幕或素材重新生成文章；
- 需要复核某篇文章的原始素材，而仓库内 Markdown 不够用。

## 5. 如果确实要迁移原始资料

建议将源资料集中复制到新电脑的一个明确目录，例如：

~~~
D:\guaifinition-content-sources\
├─ agentic-ai-blog\
├─ mcts-blog\
├─ tech-series\
└─ AI课程_论文式HTML知识库\
~~~

随后检查 scripts/import-content.mjs 中的源目录配置和排除规则，按新电脑路径调整，不要直接假定旧电脑的本地绝对路径仍然存在。

执行导入前建议：

~~~
git switch -c content-reimport-test
git status
npm run content:import
npm run content:check
~~~

确认文章数量、课程数量、图片数量没有异常，再决定是否合并到 master。如果只是新增文章，放弃这条流程，直接按新增文章工作流编辑仓库内 Markdown。

## 6. 长期迁移建议

为了让项目真正做到“换电脑即可接手”，后续建议逐步完成：

1. 将仍然需要长期维护的原始 Markdown、图片和关键 HTML 资料归档进仓库或独立的版本化资料仓库；
2. 将导入器改为显式的源目录参数，而不是依赖固定的用户目录；
3. 为导入流程增加 manifest 和校验报告，记录每个来源是否存在；
4. 将最终 content-library/ 作为发布事实源，批量导入只在专门分支执行；
5. 给每篇文章保留来源链接和编辑状态，但不要把内部调试信息显示到网页正文。
