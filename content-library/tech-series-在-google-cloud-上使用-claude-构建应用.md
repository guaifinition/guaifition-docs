> **Building with Claude on Google Cloud** · Code w/ Claude 2026 · 中文技术知识库

这是一份脱离网站外壳也可以独立阅读的讲座报告。它以旧金山场录播的**完整英文自动字幕（ASR）576 条时间轴片段**为主要证据，结合来源清单和重建报告整理而成。字幕原文共 **24,652 字符（约 24.6k）**；文中技术主张以讲者口述为边界，并在关键处保留时间戳。

报告有三个重要边界：

-   官方没有发布独立 PPT 或讲稿。下文的架构图、角色链条和流程图都改成了**文字化概念说明**；此前网页报告中的 SVG 是依据字幕和讲者口述重建的原创示意，**不是官方幻灯片截图**。
-   录播播放器 facade、封面图、筛选器和网站交互不属于本知识库；需要观看实机画面时，请使用原始 YouTube 链接并跳到相应时间点。
-   **第 12.4 节明确是讲座外的 Google 官方文档补充**，不应与讲者在现场说过的内容混为一谈。

## 1\. 讲座元信息

| 项目 | 内容 |
| --- | --- |
| 议题名称 | **Building with Claude on Google Cloud** |
| 讲者 | **Ivan Nardini** — Developer Relations Engineer (AI/ML)，Google Cloud |
| 大会 | Code w/ Claude 2026（Anthropic 开发者大会） |
| 旧金山场 | 2026 年 5 月 6 日 16:05–16:35 |
| 伦敦场 | 2026 年 5 月 19 日 16:05–16:35，同一议题重讲 |
| 时长 | 约 26 分钟（含现场演示）；议题时段约 30 分钟 |
| 旧金山录播 | [https://www.youtube.com/watch?v=SqHsS737CeA](https://www.youtube.com/watch?v=SqHsS737CeA)（Claude 官方频道） |
| 旧金山议题页 | [https://claude.com/code-with-claude/session/sf-building-with-claude-on-google-cloud](https://claude.com/code-with-claude/session/sf-building-with-claude-on-google-cloud) |
| 伦敦议题页 | [https://claude.com/code-with-claude/session/ldn-building-with-claude-on-google-cloud](https://claude.com/code-with-claude/session/ldn-building-with-claude-on-google-cloud) |
| 形式 | “from zero to deployed” 的现场实战：一个人依次扮演 5 个角色，构建反馈应用并走完软件生命周期 |

### 资料获取与证据边界

-   **录播与字幕：完整取得访问内容。** 研究记录确认已取得旧金山场录播及其英文 ASR，共 576 条片段、24,652 字符；但播放器后来无法初始化，因此没有取得实况画面帧。本报告的技术内容按字幕逐条整理，而不是根据一张未公开的幻灯片猜测。
-   **PPT / 讲稿：未公开。** 议题页和大会录播汇总页没有 slides、transcript 或 captions 下载入口。因此所有图形在脱离网站后均以文字说明呈现；原网页中的 SVG 仅是基于口述的重建，不冒充原始幻灯片。
-   **示例代码：未给出仓库 URL。** 讲者在 [25:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1536s) 说演示代码会在议题结束后随即发布，并提到 quickstart，但没有口播具体地址。
-   **字幕校正：必要且有记录。** ASR 把 Claude 识别成 `cloud`、`clock`、`claw` 或 `co code`，把 Anthropic 识别成 `Antropic` 或 `entropic`，也误识别了 Looker、OWASP 等专名；完整校正表见第 16 章。
-   **本次迁移的输入边界：** `docs/research/building-with-claude-on-google-cloud-source.md` 与 `docs/research/building-with-claude-on-google-cloud-sources.md`。迁移前的独立 HTML/CSS/JS 只作为历史版式参考，不是当前知识库正文；字幕获取方法和来源置信度保留在第 16 章。

## 2\. 讲座的核心命题

在 [0:31](https://www.youtube.com/watch?v=SqHsS737CeA&t=31s) 左右，讲者提出两个举手问题：

1.  过去一周，有多少人使用过 AI 工具写代码或构建应用？——**绝大多数人举手**。
2.  有多少人用**同一个** AI 工具在 Google Cloud 上构建**并部署**应用？——**只有极少数人举手**。

两次举手之间的落差定义了整场要解决的问题：AI 编码工具已经普及，但“用 AI 一路做到在云上部署上线”仍是少数人的能力。讲者的目标，是让后者也变得同样简单。

为了证明这一点，他在 [1:08](https://www.youtube.com/watch?v=SqHsS737CeA&t=68s) 宣布自己会依次戴上 5 顶“帽子”：用 Claude Code 把一个真实功能从想法推进到上线，再把运行中的数据反馈回产品决策。最终产出的是一个反馈打分应用，现场观众还可以给讲座评分。

## 3\. 理论框架：软件开发生命周期中的 5 个角色

讲者在 [1:17](https://www.youtube.com/watch?v=SqHsS737CeA&t=77s) 将企业交付新功能的过程简化成一条信息流。文字化概念图如下（不是幻灯片截图）：

```text
PM（idea）
  → UI/UX 设计师（让想法有形状）
  → 软件工程师（实现核心逻辑）
  → 安全工程师（通过发布前评审提高发布信心）
  → 数据角色（从上线数据产生 insights）
  └──────────────────────────────→ 反馈给 PM，驱动产品迭代
```

| 角色 | 职责 | 传统协作中的摩擦 |
| --- | --- | --- |
| **PM（产品经理）** | 产生改进产品或实现新功能的 **idea** | 想法通常要先交给设计师，才能被别人“看见” |
| **UI/UX 设计师** | 把想法设计和可视化出来，让它 **get a shape** | 需要通过原型和多轮沟通把想法变成界面 |
| **软件工程师** | 实现背后的核心逻辑，使功能可交付、可访问 | 还要回答云架构、服务选型和部署问题 |
| **安全工程师** | 发布前运行安全评审，**be confident in the release** | 云上发布还引入身份、权限和暴露面的考量 |
| **数据角色**（增长营销 / 数据分析师） | 分析应用收集的数据，产生 **insights** 并回传 PM | 若没有分析链路，发布后的反馈无法进入下一轮产品迭代 |

在 [3:01](https://www.youtube.com/watch?v=SqHsS737CeA&t=181s)，讲者的关键论点是：Claude Code **增强（augment）全部角色**，而不只是软件工程师。演示中贯穿的组件包括：

-   **Subagents**（子代理），把可拆分的工作并行化；
-   **MCP servers**（Model Context Protocol 服务器），让 agent 获得外部知识和系统能力；
-   **Skills**（技能），覆盖架构中的具体实现模块；
-   **Plan Mode**（计划模式），在写代码前提出方案；
-   **CLAUDE.md**，提供项目级角色和任务上下文；
-   内置 **security review**，在发布前检查并处理问题。

讲者也明确承认这是一种“**对真实情况的强烈简化（a strong simplification）**”。例如本次 demo 里，安全工程师不只批准应用是否足够安全，还顺手完成了部署；真实企业通常会把这两项职责分开，但 demo 给了他这样的自由度。

## 4\. 环境搭建：让 Claude Code 使用 Google Cloud 上的 Claude 模型

在 [3:40](https://www.youtube.com/watch?v=SqHsS737CeA&t=220s) 起，讲者说明 Google Cloud 与 Anthropic 共同把接入过程做得尽量直接。

### 4.1 多种接入方式，首选 ADC

Claude Code 使用 Google Cloud 上的 Claude 模型有多种方式，但讲者称最简单、最快的是 **Application Default Credentials（ADC，应用默认凭据）**。ADC 会自动发现凭据（例如用户凭据），并依据当前运行环境自动适配。

### 4.2 新增的向导式配置

讲者介绍 Claude Code 近期加入的配置向导（wizard）。它可以：

1.  自动检测你的 **project**；
2.  检测模型所在的 **region**；
3.  检查项目中有哪些模型可用；
4.  允许你把选定模型 **pin** 住，随后开始构建应用。

### 4.3 工程收益

ADC 加上向导意味着：

-   **无需轮换 API keys**（no API keys to rotate）；
-   **无需设置环境变量**（no environment variables to set）。

讲者对此的评价是：“在这个方面，这是一次质的飞跃。”这里记录的是讲座中的体验判断；向导具体能力的来源等级和获取方法见第 16 章的 S15。

## 5\. 为什么在 Google Cloud 上使用 Claude

在 [4:46](https://www.youtube.com/watch?v=SqHsS737CeA&t=286s)，讲者预设了一个企业听众会问的问题：既然已经会用 Claude Code 和 Claude 模型，把 Claude 放到 GCP 上有什么不同？他的回答可以归纳为五项理由。

### 5.1 按用量计费

-   按 **token** 计费，为实际使用量付费。
-   不会收到 **message cap（消息数上限）**；讲者将它视为与订阅制额度模型的关键差异。

### 5.2 生产级容量：Provisioned Throughput

对于需要进入生产环境的企业应用，可以使用 **Provisioned Throughput（预留吞吐量）**，预留一部分吞吐能力来支撑应用，从而获得更确定的容量保障。

### 5.3 配置简单

结合第 4 章的 ADC 方式，没有 API key 要轮换，也没有环境变量要设置。

### 5.4 治理、隔离与数据边界

-   在自己的项目中访问模型，并应用自己设定的策略（**your own policies set**）。
-   讲者强调 **the data stays in your project**：与 Claude Code 交互相关的数据留在你的项目内。这是他为企业采纳提出的数据边界论据；报告不把它扩展成字幕之外的独立合规承诺。

### 5.5 地域与可用性

-   模型在多个区域提供服务。
-   可以在 **global endpoint**（全球端点）与 **regional endpoint**（区域端点）之间按可用性需求选择。
-   讲者以 Google Cloud 的身份强调其 **availability service standards**，并称可以在“市场上最高性能的基础设施之一”上运行 Claude。

因此，按讲者的企业论证，Google Cloud 上的 Claude 组合了可按量计费、可预留容量、低摩擦接入、项目内数据边界以及多区域与端点的可用性选择。

## 6\. 角色一：PM——从餐巾纸草图到可运行原型

### 6.1 传统流程与新流程

在 [6:51](https://www.youtube.com/watch?v=SqHsS737CeA&t=411s) 前后，讲者对比了两种路径：过去是“有想法 → 找 UI/UX 设计师 → 反复 **back and forth** → 拿到第一版原型”；现在则可以把一张在旧金山咖啡馆随手画的草图直接交给 Claude Code。

```text
传统：idea → UI/UX 设计师 → 第一版原型
                 ↕ 多轮 back and forth
演示：手绘草图 → Claude Code + CLAUDE.md → 几分钟内得到 wireframe/prototype
                                                     → 交给 UX 设计师
```

### 6.2 演示实现细节

[7:43](https://www.youtube.com/watch?v=SqHsS737CeA&t=463s) 的演示使用 Claude Code 界面和一张非常简单的手绘图片。`CLAUDE.md` 提供了项目上下文，明确告诉 Claude：**我们是 PM**，希望从这张图出发渲染一个应用的 **prototype / wireframe**，供 UX 设计师继续使用。

输入是图片，结果是 Claude 在几分钟内完成原型渲染。

### 6.3 要点

这一步的价值不只在于生成一张界面：它压缩了过去为了让 idea 获得第一版形状而产生的沟通成本，也证明 Claude Code 可以增强非工程角色（PM）。讲者希望听众关注的是节省的时间量级，而不是把 demo 当成企业设计流程的完整替代品。

## 7\. 角色二：UI/UX 设计师——Plan Mode 与设计规范注入

PM 交付原型后，UI/UX 设计师要把它变成更稳固、可用于生产的界面（**a more solid interface**）。本次用例至少包含三个页面：

1.  **Landing page**（落地页）；
2.  **Thank-you page**（感谢页）；
3.  **Dashboard**（仪表盘），实时展示现场观众提交的反馈。

### 7.1 Plan Mode 的机制

在 [9:26](https://www.youtube.com/watch?v=SqHsS737CeA&t=566s)，讲者刻意启用 Claude Code 的 **Plan Mode（计划模式）**。它把 Claude 置于一种状态：**在实现任何代码之前，先思考并提出它将要做什么（it thinks and proposes what it's going to do before implementing any code）**。

文字化流程如下：

```text
提示 + 线框图
      ↓
Plan Mode：提出计划（此时还没有写代码）
      ↑
个人偏好，或外部规范（例如通过 MCP server 访问 Figma）
      ↓
人工查看 → 认可 → accept
      ↓
Claude Code 实现全部组件 → 优化后的版本
```

Plan Mode 留出一个明确的介入窗口：使用者可以在代码产生前，根据自己的 **preference** 或某项 **standard** 改变方向。外部设计规范可能经由访问 Figma 的 MCP server 获得；本场实际演示并没有声称已经连接 Figma。

### 7.2 演示细节

在 [9:59](https://www.youtube.com/watch?v=SqHsS737CeA&t=599s)，讲者以 PM 交付的 wireframe 为起点，开启 Plan Mode，并用一份 **design doc** 模拟“从 Figma 接收设计指令”的真实场景。Claude 先针对幻灯片口述中定义的所有组件生成计划；讲者查看计划、认可并 `accept`，然后让 Claude Code 实现全部组件。

结果是一个优化后的版本：从“原型”跃迁为可以在本场会议中真实使用的东西。这个方法论要点是：**外部设计规范在计划阶段参与决策，而不是事后才审查代码。**

## 8\. 角色三：软件工程师——MCP + Skills + Subagents 三件套

### 8.1 问题设定

在 [11:00](https://www.youtube.com/watch?v=SqHsS737CeA&t=660s)，软件工程师接手前端和全部组件。讲者故意设置了一个贴近听众的前提：这位工程师“就像这个房间里的一些人一样”，可能完全不知道怎样把应用部署到 Google Cloud。问题变成：为了部署一个简单应用，GCP 上究竟需要哪些组件？

### 8.2 Google Cloud 的两项关键投入

讲者说 Google Cloud 花了大量时间与快速成长的 **vibe coding** 生态集成，并在最近几个月发布了两个重要组件。

#### Developer Knowledge API + 配套 MCP server

在 [11:55](https://www.youtube.com/watch?v=SqHsS737CeA&t=715s)，他介绍了 Developer Knowledge API 及其配套 **MCP server**：

-   它提供来自 Google Cloud 的**最新文档**；
-   Claude Code 可以通过 MCP server 直接消费这些文档；
-   目标是帮助 agent 判断在 Google Cloud 上部署某类应用的合适架构和实现方式。

因此讲者的核心论点是：**你不需要预先知道如何在 Google Cloud 上部署应用**，可以借助 Claude Code 和这个 MCP server 来完成设计与构建。

#### Google Cloud Skills

[12:23](https://www.youtube.com/watch?v=SqHsS737CeA&t=743s) 介绍了另一项投入：**Google Cloud Skills**。讲者给出的分工非常明确：

| 组件 | 解决的问题 |
| --- | --- |
| **MCP server（Developer Knowledge）** | 设计整体架构（design the architecture），提供全局图景 |
| **Skills** | 覆盖架构中的单个模块（cover the single blocks），处理具体实现 |

例如，Skill 可以帮助 Claude 在 **Cloud Run** 上部署 API，或把 **Cloud Run** 与 **Firestore** 连接起来。一句话概括：**MCP 负责“该用什么架构”，Skills 负责“这一块具体怎么落地”。**

### 8.3 目标架构与数据流

[13:02](https://www.youtube.com/watch?v=SqHsS737CeA&t=782s) 讲到的演示架构，用文字化概念图表示为：

```text
[前端反馈应用]
       ↓
[Feedback API] ──部署于──> [Cloud Run：serverless / 无服务器服务]
       ↓
[Firestore：面向 Web 的数据库，收集原始反馈响应]
       ↓
[BigQuery：分析型数据仓库，存放原始响应并做后处理]
       ↓
[Looker：消费加工后的信息，提供报表与可视化仪表盘]
```

讲者给出的选型理由是：

-   **Cloud Run**：Feedback API 部署为 `serverless function`。他随后补充，对不熟悉 GCP 的人来说，Cloud Run 是可用于部署应用的**无服务器服务**。
-   **Firestore**：面向 Web 的数据库，用来收集反馈应用提交的原始响应。
-   **BigQuery**：应用需要数据分析，因此原始响应要进入分析型数据仓库，并在其中做后处理。
-   **Looker**：构建仪表盘来消费这些信息。

他再次强调：使用 Claude Code 加 MCP server 可以搭建这套链路，而无需具备相关的 GCP 前置知识（**without you having a prior knowledge of how to do that**）。

### 8.4 Subagents：并行化实现

当文档 MCP server 和 Skills 就绪后，架构可以并行实现。[15:02](https://www.youtube.com/watch?v=SqHsS737CeA&t=902s) 的演示启动了 3 个不同的 **Subagents**：

| 子代理 | 负责部分 |
| --- | --- |
| 1 | **API** |
| 2 | **Ingestion pipeline**（数据摄取管道） |
| 3 | **Dashboard**（仪表盘） |

讲者把它比作日常开发生命周期里运行一个团队的 **sprint**：并行的 agent 执行对应并行的人力协作。

### 8.5 演示执行顺序

[15:34](https://www.youtube.com/watch?v=SqHsS737CeA&t=934s) 的工程演示按以下顺序进行：

1.  展示已启用的文档 MCP server 和若干预先构建好的 Skills。
2.  输入一个非常简单的提示词。
3.  先设计 **cloud-native backend**，让 Claude 产出架构草案；这一步本可以再次使用 Plan Mode，但讲者为简洁起见没有使用。
4.  使用其中一个 Skill 实现 API。
5.  确认 **API spec** 满意，此时“架构 + API 规范”已经就绪。
6.  并行运行多个 agent，实现应用的三个组件。
7.  由 Claude Code 在实现完成后管理测试环节（**manage the testing part**）。
8.  得到一个准备部署到 Google Cloud 的应用。

## 9\. 角色四：安全工程师——发布前的安全评审

### 9.1 为什么需要这一步

在 [16:49](https://www.youtube.com/watch?v=SqHsS737CeA&t=1009s)，代码已经准备部署；但应用要上云并向更大范围的受众开放，需要能够**有信心地部署（deploy it confidently）**。因此，讲者把安全评审放在发布前，用来提高发布信心。

### 9.2 两个典型检查项

讲者在 [17:20](https://www.youtube.com/watch?v=SqHsS737CeA&t=1040s) 强调，具体要求取决于企业，并举了两个例子：

1.  **OWASP 常见问题**：检查应用面对最常见的 OWASP 问题是否足够稳固。
2.  **Service Account 的最小权限**：云上应用往往使用服务账号。应限制该账号调用特定 API（例如读写数据库 API）的权限，把它约束在某个 **certain role** 内，以限制应用在云上操作时可能造成的影响。

这代表了相对本地运行新增的一类考量：身份与权限边界，即 **IAM / least privilege**。这只是示例，不是对某个具体企业安全基线的完整定义。

### 9.3 演示执行与结果

讲者在 [18:09](https://www.youtube.com/watch?v=SqHsS737CeA&t=1089s) 再次说明这部分是强烈简化：demo 中安全工程师既做批准，又负责部署；真实企业往往会分离职责。

[18:39](https://www.youtube.com/watch?v=SqHsS737CeA&t=1119s) 的实际流程是：

1.  调用 Claude Code 预置的 **security review**，只给一个非常简单的提示词；
2.  Claude Code 运行首轮检查，复核实现是否对齐要求；
3.  发现一个潜在问题；
4.  自动修复该问题；
5.  完成安全检查后部署后端 API；
6.  产生一个承载应用的 endpoint，应用上线（**the app is live**）。

## 10\. 现场实机演示：应用真实上线并收集反馈

### 10.1 运行中的应用

[19:24](https://www.youtube.com/watch?v=SqHsS737CeA&t=1164s) 讲者切换到自己的笔记本，展示运行在 GCP **Cloud Run** 上的应用。它对应最初的反馈 wireframe，于是手绘草图、原型、实现和部署形成了一条连续路径。

### 10.2 现场互动与实时仪表盘

[20:04](https://www.youtube.com/watch?v=SqHsS737CeA&t=1204s)，讲者邀请观众为演讲评分。现场有人给了 **5 分**，并填写评论提交；仪表盘实时更新了响应数量、评分和可视化。

### 10.3 Feedback Analyzer

[20:30](https://www.youtube.com/watch?v=SqHsS737CeA&t=1230s)，讲者展示一个“为了好玩”额外做的 **Feedback Analyzer**。点击后，它调用 **Google Cloud 上的 Claude**，根据已经收到的反馈与评论生成摘要。

这个附加功能揭示了一个重要的运行时关系：Claude 不只是构建期的工具，也是应用的一部分；同一套 Google Cloud 上的 Claude 既帮助开发应用，又成为应用本身可调用的推理能力。

### 10.4 视频限制

本知识库不嵌入视频，也不放置网页报告中的播放器 facade。研究时 YouTube 播放器在浏览器自动化窗口中拒绝初始化：`Error 153`，`video.readyState` 始终为 `0`，`videoWidth` 为 `0`，所以无法提取实况帧。读者可通过 [YouTube 录播](https://www.youtube.com/watch?v=SqHsS737CeA) 跳到本章的时间戳观看现场画面。

## 11\. 角色五：数据角色——分析、洞察与产品闭环

### 11.1 生命周期尚未结束

应用上线并开始收集使用数据后，生命周期还有最后一步。[20:56](https://www.youtube.com/watch?v=SqHsS737CeA&t=1256s) 讲者用仪表盘中的 **Response time（响应时间）** 作为 KPI 示例：一个人完成一次反馈提交所花的时长。

它代表完整闭环：

```text
收集数据 → 分析数据 → 生成 insights → 改进应用 → 回到 PM
```

这条数据角色到 PM 的反馈回路，正好闭合第 3 章的五角色模型。

### 11.2 BigQuery 与 Looker

在 [21:42](https://www.youtube.com/watch?v=SqHsS737CeA&t=1302s)，讲者为 GCP 新手点出两个分析服务：

-   **BigQuery**：分析型数据仓库，承担数据分析；
-   **Looker**：承担 reporting（报表）和仪表盘呈现。

### 11.3 这部分没有现场演示

讲者表示不需要先掌握 BigQuery 查询或 Looker 仪表盘构建，因为这两者同样提供 **MCP server**。但由于时间关系，他没有现场查询 BigQuery 或搭建 Looker 看板，而是告诉观众去哪里找资料，把这部分留作练习（**as an exercise**），等待演示代码和 quickstart。按他的评价，两部分集成“相当直接”，而可做出的仪表盘“相当强大”。这段是讲者的介绍和建议，不应写成已经在现场完成的步骤。

## 12\. Google Cloud 的 MCP 生态：Agent Platform 与 Agent Registry

### 12.1 Agent Platform 与 Agent Registry

[22:43](https://www.youtube.com/watch?v=SqHsS737CeA&t=1363s)，讲者切回笔记本，展示 Google Cloud 近期发布的 **Agent Platform**。其中的一项服务是 **Agent Registry（代理注册中心）**；讲者说它列出了 Google Cloud 上原生支持（**natively support**）的全部 MCP server。

他现场指出其中两个：

1.  **Developer Knowledge service**，也就是前面用于架构设计的服务；
2.  **BigQuery MCP server**，可以查询刚从反馈应用收集的数据。

### 12.2 Agent Registry 的三项价值

[23:15](https://www.youtube.com/watch?v=SqHsS737CeA&t=1395s)，讲者明确列出注册中心的作用：

1.  告诉你如何在自己一侧配置该 MCP server；
2.  提供一些 **observability（可观测性）** 特性；
3.  提供该 MCP server 全部 **tools 的描述**，让你知道 Claude Code 将如何使用它查询数据。

第三点特别关键：了解有哪些 tool 以及每个 tool 做什么，才有可能预判 agent 的行为和它会如何操作数据。这里关于“工具描述决定行为可预期性”的表述，是本报告基于讲者列举的能力作出的实践推论，不是讲者逐字给出的结论。

### 12.3 MCP Toolbox for Databases：Looker 集成

[23:51](https://www.youtube.com/watch?v=SqHsS737CeA&t=1431s)，讲者介绍 **MCP Toolbox for Databases**：

-   一个开源的 **Model Context Protocol server**；
-   包含与 **Looker** 的集成；
-   quickstart 文档完善，说明如何配置 Claude Code 并开始使用；
-   用来消费 BigQuery 数据和构建仪表盘。

### 12.4 补充背景：讲座外的 Google 官方文档

> **证据边界：本小节不是讲座内容。** `docs/research/building-with-claude-on-google-cloud-sources.md` 记录了 Google 文档的 WebFetch 摘要，但没有保留 S10–S12 的规范 URL；迁移前的版式参考中也没有这些链接。因此下面保留为来源 ledger 摘要，但独立 URL 核查状态标为 `unknown/open（未知/待补）`。不要把它们当作当前、独立核验过的官方文档，也不要回写成 Ivan Nardini 在录播中说过的话。`developerknowledge.googleapis.com` 是 ledger 记录的服务端点，不是文档 URL。

-   **S10 — Developer Knowledge API / MCP server（规范 URL：`unknown/open`）：** 来源 ledger 摘要称，这是一项托管式服务，让 AI 开发工具检索 Google 开发者文档，覆盖 Firebase、Google Cloud、Android、Maps 等产品，并返回 Markdown 文档；记录的端点是 `developerknowledge.googleapis.com`。摘要还称其目标是减少 agent “自信地写出不存在的代码”或引用过时 API 版本的问题，并可通过 MCP 的 `tools/list` 方法枚举工具；官方文档 URL 在现有证据中仍待补。
-   **S11 — Agent Registry（规范 URL：`unknown/open`）：** 来源 ledger 摘要称，这是存储、发现和治理 MCP servers、tools、skills 与 agents 的集中式目录；记录了自动注册，以及通过 API、`gcloud` CLI 或 Terraform 手动注册，还提到 Google 与 Google Cloud 远程 MCP server 可能在启用相应服务时自动注册，并可依托 **Cloud IAM Deny policy** 做细粒度访问控制。官方文档 URL 在现有证据中仍待补。
-   **S12 — Google 托管 MCP server 的传输（规范 URL：`unknown/open`）：** 来源 ledger 摘要称，Google 托管 MCP server 使用 **Streamable HTTP**，而非本地 server 常见的 `stdio`，并可整合 **Cloud IAM** 与 **Audit Logs**。官方文档 URL 在现有证据中仍待补。

## 13\. 总结：讲者给出的两点结论

讲者在 [24:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1476s) 收尾时说，全场本质上想传达两件事：

1.  **Claude Code 的组件能真正加速软件开发。** **Skills、MCP server、Subagents** 等能力可以显著加速开发过程。这个 demo 用约 26 分钟跨越 5 个角色，从手绘草图走到云上部署，再连接到数据分析链路。
2.  **在 GCP 上使用 Claude 模型是无缝的。** 可以“以非常无缝的方式（in a very seamless way）”让 Claude Code 配合 GCP 上的 Claude 模型。讲者的依据是跨越多个角色运行多段会话时，体验仍然直接、顺畅。

### 后续资源

在 [25:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1536s)，讲者提到：

-   演示代码会在议题结束后随即发布，但未口播具体仓库 URL；
-   有一份高质量 **quickstart**；
-   Google Cloud 侧和 Anthropic 侧都有维护良好的文档，建议直接查阅。

## 14\. 技术要点速查清单

### Claude Code 侧

| 组件 | 本讲中的用途 | 关键机制 |
| --- | --- | --- |
| **CLAUDE.md** | 声明“我们是 PM”以及任务目标 | 向 Claude 提供项目级指令上下文 |
| **图片输入** | 手绘草图 → wireframe/prototype | 用多模态输入直接驱动原型实现 |
| **Plan Mode** | UI/UX 阶段先生成实现计划，等待人工确认 | 写代码前先提出方案，提供按个人偏好或外部规范调整的窗口 |
| **MCP servers** | Developer Knowledge 设计架构；BigQuery 查询数据；MCP Toolbox for Databases 连接 Looker 做看板；Figma 获取设计规范（本场以 design doc 模拟） | 让 agent 获得外部知识和外部系统操作能力 |
| **Skills** | 在 Cloud Run 上部署 API；连接 Cloud Run 与 Firestore | 覆盖架构中的**单个实现模块**，与 MCP 的整体架构职责相对 |
| **Subagents** | 3 个并行任务：API / Ingestion pipeline / Dashboard | 并行实现，类比团队 sprint |
| **内置 security review** | 发布前评审，发现并自动修复一个问题 | 预置能力，简单提示词即可触发 |
| **测试管理** | 实现结束后处理测试环节 | 由 Claude Code 一并管理 |

### Google Cloud 侧

| 服务或能力 | 本讲中的角色 |
| --- | --- |
| **Application Default Credentials (ADC)** | Claude Code 接入 Claude 模型的最简认证方式 |
| **Cloud Run** | 无服务器部署 Feedback API |
| **Firestore** | 面向 Web 的数据库，保存原始反馈 |
| **BigQuery** | 分析型数据仓库，存储原始数据并后处理 |
| **Looker** | 报表与仪表盘 |
| **Service Account + IAM 角色限制** | 以 least privilege 约束应用在云上的操作边界 |
| **Developer Knowledge API + MCP server** | 提供最新的官方文档，支撑架构决策 |
| **Agent Platform / Agent Registry** | MCP server 目录、配置指引、可观测性和工具描述 |
| **MCP Toolbox for Databases** | 开源 MCP server，含 Looker 集成 |
| **Provisioned Throughput** | 为生产级企业应用预留吞吐量 |
| **Global / Regional endpoints** | 按可用性需求选择模型服务地域 |

### 企业选择 Google Cloud 上 Claude 的五项理由

1.  按 token 计费，**没有 message cap**；
2.  用 **Provisioned Throughput** 支撑生产应用；
3.  使用 ADC，**无需密钥轮换、无需环境变量**；
4.  在自有项目中访问模型、应用自有策略，**数据留在项目内**；
5.  多区域服务、**global / regional endpoints** 与可用性服务标准。

## 15\. 时间轴索引

以下保留录播的 34 个关键时间点。Markdown 不提供网页筛选器；每个时间戳都直接链接到同一支旧金山场录播。

| 时间 | 阶段 | 内容 |
| --- | --- | --- |
| [0:05](https://www.youtube.com/watch?v=SqHsS737CeA&t=5s) | 开场 | 讲者自我介绍：Google Cloud Developer Advocate，与 Anthropic 合作构建内容 |
| [0:31](https://www.youtube.com/watch?v=SqHsS737CeA&t=31s) | 开场 | 两个举手问题，定义问题空间 |
| [1:08](https://www.youtube.com/watch?v=SqHsS737CeA&t=68s) | 开场 | 宣布将扮演 5 个角色 |
| [1:17](https://www.youtube.com/watch?v=SqHsS737CeA&t=77s) | 框架 | 企业团队场景与 5 角色模型 |
| [3:01](https://www.youtube.com/watch?v=SqHsS737CeA&t=181s) | 框架 | Claude Code 增强全部角色的论点 |
| [3:40](https://www.youtube.com/watch?v=SqHsS737CeA&t=220s) | 环境 | ADC 与配置向导 |
| [4:46](https://www.youtube.com/watch?v=SqHsS737CeA&t=286s) | 论证 | 选择 Google Cloud 上 Claude：计费、预留吞吐、配置、数据边界、地域可用性 |
| [6:51](https://www.youtube.com/watch?v=SqHsS737CeA&t=411s) | 角色一 | **PM**：草图到原型 |
| [7:43](https://www.youtube.com/watch?v=SqHsS737CeA&t=463s) | 角色一 | PM 实机演示：`CLAUDE.md` 与图片输入 |
| [8:40](https://www.youtube.com/watch?v=SqHsS737CeA&t=520s) | 角色二 | **UI/UX**：三个页面需求 |
| [9:26](https://www.youtube.com/watch?v=SqHsS737CeA&t=566s) | 角色二 | Plan Mode 机制与价值，含 Figma MCP 规范注入 |
| [9:59](https://www.youtube.com/watch?v=SqHsS737CeA&t=599s) | 角色二 | UI/UX 实机演示：design doc 模拟 Figma、计划确认、优化版本 |
| [11:00](https://www.youtube.com/watch?v=SqHsS737CeA&t=660s) | 角色三 | **软件工程师**：不懂 GCP 部署的问题设定 |
| [11:55](https://www.youtube.com/watch?v=SqHsS737CeA&t=715s) | 角色三 | Developer Knowledge API + MCP server |
| [12:23](https://www.youtube.com/watch?v=SqHsS737CeA&t=743s) | 角色三 | Google Cloud Skills |
| [13:02](https://www.youtube.com/watch?v=SqHsS737CeA&t=782s) | 角色三 | 目标架构：Cloud Run / Firestore / BigQuery / Looker |
| [14:04](https://www.youtube.com/watch?v=SqHsS737CeA&t=844s) | 角色三 | MCP 与 Skills 的职责分工：整体架构 vs. 单个模块 |
| [15:02](https://www.youtube.com/watch?v=SqHsS737CeA&t=902s) | 角色三 | Subagents 并行实现，类比 team sprint |
| [15:34](https://www.youtube.com/watch?v=SqHsS737CeA&t=934s) | 角色三 | 架构草案 → Skill 实现 API → 并行实现 → 测试 → 待部署 |
| [16:49](https://www.youtube.com/watch?v=SqHsS737CeA&t=1009s) | 角色四 | **安全工程师**：需要有信心地部署 |
| [17:20](https://www.youtube.com/watch?v=SqHsS737CeA&t=1040s) | 角色四 | OWASP 检查与 Service Account 最小权限 |
| [18:09](https://www.youtube.com/watch?v=SqHsS737CeA&t=1089s) | 角色四 | 讲者自陈该角色表示为强烈简化 |
| [18:39](https://www.youtube.com/watch?v=SqHsS737CeA&t=1119s) | 角色四 | 预置 security review → 发现并自动修复一个问题 → 部署 API → 应用上线 |
| [19:24](https://www.youtube.com/watch?v=SqHsS737CeA&t=1164s) | 实机 | 切换笔记本，展示 Cloud Run 上真实运行的应用 |
| [20:04](https://www.youtube.com/watch?v=SqHsS737CeA&t=1204s) | 实机 | **现场互动打分**：观众给出 5 分，仪表盘实时更新 |
| [20:30](https://www.youtube.com/watch?v=SqHsS737CeA&t=1230s) | 实机 | Feedback Analyzer 调用 Google Cloud 上的 Claude 生成反馈摘要 |
| [20:56](https://www.youtube.com/watch?v=SqHsS737CeA&t=1256s) | 数据 | **数据角色**：Response time KPI 与洞察闭环 |
| [21:42](https://www.youtube.com/watch?v=SqHsS737CeA&t=1302s) | 数据 | BigQuery 与 Looker；MCP server 免除前置知识 |
| [22:43](https://www.youtube.com/watch?v=SqHsS737CeA&t=1363s) | 生态 | Agent Platform 与 Agent Registry 实机展示 |
| [23:15](https://www.youtube.com/watch?v=SqHsS737CeA&t=1395s) | 生态 | Agent Registry 三项价值：配置指引、可观测性、工具描述 |
| [23:51](https://www.youtube.com/watch?v=SqHsS737CeA&t=1431s) | 生态 | MCP Toolbox for Databases 与 Looker 集成 |
| [24:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1476s) | 收尾 | 两点结论 |
| [25:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1536s) | 收尾 | 代码发布、quickstart 与 Google Cloud / Anthropic 文档指引 |
| [26:00](https://www.youtube.com/watch?v=SqHsS737CeA&t=1560s) | 收尾 | 致谢与联系方式（社交媒体） |

## 16\. 字幕校正、方法说明与来源

### 16.1 ASR 字幕专有名词校正表

自动字幕里的误识别不应被当作技术名称。以下表格保留原始错误形态，方便和英文字幕对照：

| ASR 中的错误形式 | 校正后的名称 |
| --- | --- |
| `cloud code / co code / clock code / claw code / cl code / coco` | **Claude Code** |
| `cloud models / clock models / claw` | **Claude models** |
| `cloud on Google cloud / claw on GCP` | **Claude on Google Cloud** |
| `Antropic / Antropi / entropic / entropics` | **Anthropic** |
| `Nardini` | **Ivan Nardini** |
| `sub aents` | **Subagents** |
| `bequery` | **BigQuery** |
| `Lucer / looker` | **Looker** |
| `fire store` | **Firestore** |
| `OASP` | **OWASP** |
| `MCP toolbox of DB` | **MCP Toolbox for Databases** |
| `provisioning throughput` | **Provisioned Throughput** |
| `agent registry / agent platform` | **Agent Registry / Agent Platform** |
| `developer knowledge API` | **Developer Knowledge API** |
| `UIUX` | **UI/UX** |

### 16.2 字幕获取方法

研究过程中的匿名下载通道均被 YouTube 拦截：

-   `yt-dlp` 的 `web`、`tv`、`mweb`、`ios`、`web_embedded` client 都返回 `Sign in to confirm you're not a bot`；
-   innertube `player` API 返回空的 caption 列表；
-   `timedtext` 端点以 4 种格式请求时均返回 HTTP 200，但内容为 **0 字节**，原因是缺少 proof-of-origin token；
-   `get_transcript` innertube 端点返回 `400 Precondition check failed`。

最终通过 **browser-skill** 驱动已登录的 Chromium，展开 transcript engagement panel，把 `visibility` 属性设为 `ENGAGEMENT_PANEL_VISIBILITY_EXPANDED`，再从 DOM 的 `ytd-transcript-segment-renderer` 提取成功。结果是 **576 条**字幕片段，落盘为 `transcript_raw.txt`，共 **24,652 字符**。

### 16.3 无法获取的内容与明确声明

1.  **幻灯片原图（S07）**：官方没有发布 PPT 文件。所有原网页图形和本迁移报告的概念图都只是依据讲者口述重建；SVG（如在原网页中出现）是原创重建，**不是官方幻灯片截图**。
2.  **讲座实况画面（S09）**：播放器初始化失败，显示 `Error 153`；`video.readyState` 恒为 `0`、`videoWidth` 为 `0`，因此无法提取视频帧。Markdown 不放播放器 facade，读者应直接访问录播链接。
3.  **演示代码仓库**：讲者在 [25:36](https://www.youtube.com/watch?v=SqHsS737CeA&t=1536s) 承诺会发布代码，但未口播 URL，本次研究未找到对应仓库。

### 16.4 来源清单与置信度

置信度定义：`verified` 表示在可访问的一手页面或本机输出中直接确认；`ASR-supported`（中文正文简称“字幕支持”）表示由自动生成字幕和时间戳支持，但未用音频/视频或官方材料独立核对；`documented-plan` 表示来源 ledger 报告了官方文档摘要，但本次没有实测；`inference` 表示结构或语境推断；`unknown/open（未知/待补）` 表示主张或规范 URL 无法用现有证据独立核验。以下记录的检索日期均为 **2026-08-04**。

| ID | 主张或资产 | 来源 | 置信度 | 备注 |
| --- | --- | --- | --- | --- |
| S01 | 议题标题、讲者 Ivan Nardini、旧金山场 2026-05-06 16:05–16:35 | [旧金山议题页](https://claude.com/code-with-claude/session/sf-building-with-claude-on-google-cloud) | `verified` | 一手议题页 |
| S02 | 伦敦场 2026-05-19 同题重讲 | [伦敦议题页](https://claude.com/code-with-claude/session/ldn-building-with-claude-on-google-cloud) | `verified` | 一手议题页 |
| S03 | 视频标题与 Claude 官方频道 | [YouTube oEmbed / 视频](https://www.youtube.com/watch?v=SqHsS737CeA) | `verified` | oEmbed JSON / 视频元信息 |
| S04 | 完整英文 ASR、576 条片段、24,652 字符 | YouTube 视频 `SqHsS737CeA` 的 transcript 面板 | `verified` | 通过已登录浏览器提取 |
| S05 | 技术论点、5 角色模型、架构选型和演示流程 | S04 字幕逐条 | `字幕支持` | 保留时间戳；未用音频/视频或官方幻灯片独立核对 |
| S06 | 官方未发布 PPT、讲稿或字幕下载文件 | S01、S02 与大会录播汇总页 | `verified` | 页面无下载入口 |
| S07 | 5 角色图、架构图、并行子代理图等幻灯片画面 | 无法获取 | `unknown` | 仅可依据 S04 口述重建；不是官方截图 |
| S08 | 视频封面缩略图 | [https://i.ytimg.com/vi/SqHsS737CeA/maxresdefault.jpg](https://i.ytimg.com/vi/SqHsS737CeA/maxresdefault.jpg) | `verified` | HTTP 200、68,749 字节；本 Markdown 不作为播放器 facade 使用 |
| S09 | 讲座实况画面帧 | 无法获取 | `unknown` | 播放器返回 Error 153，无法截帧 |
| S10 | Developer Knowledge API / MCP 端点、覆盖产品、Markdown 返回、`tools/list` | Google 官方文档（WebFetch 摘要；未保留规范 URL） | `unknown/open（未知/待补）` | **讲座外补充**；URL 核查仍待补 |
| S11 | Agent Registry 的 MCP/tools/skills/agents 目录、注册与治理机制 | Google 官方文档（WebFetch 摘要；未保留规范 URL） | `unknown/open（未知/待补）` | **讲座外补充**；URL 核查仍待补 |
| S12 | Google 托管 MCP server 使用 Streamable HTTP，并集成 Cloud IAM / Audit Logs | Google 官方文档（WebFetch 摘要；未保留规范 URL） | `unknown/open（未知/待补）` | **讲座外补充**；URL 核查仍待补 |
| S13 | ASR 专名误识别对照 | S04 原文与技术语境比对 | `字幕支持` | 基于字幕的编辑校正；第 16.1 节完整公布 |
| S14 | SF 页面的视频 ID 为 `SqHsS737CeA`，与伦敦搜索结果 ID 不同但标题相同 | S01 页面 HTML + S03 | `verified` | 判定为同题两场重讲；正文基于 SF 场 |
| S15 | Claude Code 向导可检测 project / region / 可用模型并 pin 模型 | S04 的 3:40–4:46 字幕 | `字幕支持` | 讲者称近期引入；未独立实测或用官方文档核对 |

### 16.5 主要参考来源

-   讲座录播（旧金山场，含完整自动字幕）：[https://www.youtube.com/watch?v=SqHsS737CeA](https://www.youtube.com/watch?v=SqHsS737CeA)
-   旧金山议题页：[https://claude.com/code-with-claude/session/sf-building-with-claude-on-google-cloud](https://claude.com/code-with-claude/session/sf-building-with-claude-on-google-cloud)
-   伦敦议题页（同题重讲）：[https://claude.com/code-with-claude/session/ldn-building-with-claude-on-google-cloud](https://claude.com/code-with-claude/session/ldn-building-with-claude-on-google-cloud)
-   大会录播汇总：[https://claude.com/code-with-claude/san-francisco#recordings](https://claude.com/code-with-claude/san-francisco#recordings)
-   Claude Code 在 Google Cloud Agent Platform 上的配置文档：[https://code.claude.com/docs/en/google-vertex-ai](https://code.claude.com/docs/en/google-vertex-ai)
-   Claude on Google Cloud 平台文档：[https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)

> **最终来源声明：** 本条目的讲座部分严格基于 576 条英文 ASR 及其上下文校正；S05、S13、S15 标为 `字幕支持`，不冒充独立事实核验；S10–S12 / 第 12.4 节是单独标注的来源 ledger 摘要，规范 URL 核查状态为 `unknown/open（未知/待补）`。官方幻灯片未公开，SVG 只能被称为重建示意；视频画面因 Error 153 未获取，网页 facade 和交互筛选器均不属于这份 Markdown 知识库。
