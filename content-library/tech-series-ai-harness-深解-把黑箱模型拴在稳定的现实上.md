> **Harnesses in AI: A Deep Dive** · Tejas Kumar（IBM）· AI Engineer 大会 · 中文讲座报告 一句话主线：可靠性不来自“把提示词写得更用力”，而来自把不确定的黑箱模型，锚定在一个由确定性组件构成的稳定外壳（harness）里。

本报告重建 Tejas Kumar 在 AI Engineer 大会的 20 分钟演讲。讲者的核心主张是：当我们向模型提供方“交租金”换取算力与 token 时，拿到的是一个随时可能被静默替换、上下文受限的黑箱；要让基于它构建的代理稳定地完成任务，关键工程对象不是模型本身，而是**包裹在模型外面的那层东西**——agent harness。文中讲者口播原话标注为 `QUOTE`，讲座陈述的事实标注为 `SOURCE`，本文的组织与归纳标注为 `EDITORIAL`，与本系列其他文章的连接标注为 `INFERENCE`。

## 1\. 讲座元信息

| 项目 | 内容 |
| --- | --- |
| 议题名称 | **Harnesses in AI: A Deep Dive** |
| 讲者 | **Tejas Kumar** — AI Developer Advocate, IBM |
| 会议 | AI Engineer（官方频道发布） |
| 发布 | 2026 年 5 月 17 日 |
| 时长 | 20:26（讲者自述“18 分钟左右的深度解析”） |
| 录播 | [https://www.youtube.com/watch?v=C\_GG5g38vLU](https://www.youtube.com/watch?v=C_GG5g38vLU) |
| 演示 | 浏览器代理：用 GPT-3.5 Turbo 给 Hacker News 首帖点赞 |
| 幻灯片 | 讲者称已放在 GitHub |

| 标记 | 含义 |
| --- | --- |
| `SOURCE` | 讲座/视频或外部来源给出的事实 |
| `QUOTE` | 保留讲者原话措辞的引用 |
| `EDITORIAL` | 本文的组织性说明与结构归纳 |
| `INFERENCE` | 本文基于讲座做的推断，以及与本系列的连接 |

## 2\. 为什么需要 Harness：可靠性是唯一的名字

讲者从“我们和前沿模型之间是租赁关系”切入（`SOURCE`）。除非你在 Anthropic、Google 这类公司工作、是所谓的“token 亿万富翁”，否则绝大多数人是每月付 20 美元用 Claude Pro 这样的**租户**：拿到的是受限的上下文窗口，用的是一个黑箱模型。

> “他们随时可以——我不是说他们会这样做，但理论上可以——如果 Opus 不知什么原因不可用，他们可能给你 Sonnet，即使界面上写的是 Opus。你永远不会知道。”（`QUOTE`）

讲者由此点出 harness 的唯一目标（`SOURCE`）：

> “harness 的核心目标就是**可靠性**。它确保我们构建的代理能够完成它们该做的事，句号。无论底层是什么样的黑箱模型。”（`QUOTE`）

这就是本文的第一块地基（`EDITORIAL`）：面对一个非确定、不可控、可能被替换的模型，harness 的职责是把结果重新变得可预期。

## 3\. 什么是 Harness：从登山安全带到 Agent Harness

讲者用第一性原理还原 “harness” 这个词（`SOURCE`）。登山者把自己 harness（用安全带锚定）到山上，因为山是稳定的——他们不会脱离轨道；遛狗用的牵引带（harness）也是同理，让狗“不会去用光你的 token 让你破产”（`QUOTE`，讲者的玩笑）。**harness 的本质就是把一个会乱跑的东西，拴在一个稳定的锚点上。**

接着他区分了两种 harness（`SOURCE`）：

-   **机器学习世界的 harness**：更像“豪华版测试套件 + 测试运行器”——给模型一批输入，看输出质量。
-   **AI 工程世界的 agent harness**：本次演讲的主角。

> “agent harness 是模型周围一切使其扎根于现实的东西。它就是那个将模型绑定到稳定环境的东西。”（`QUOTE`）

一个关键判断（`SOURCE`）：Claude Code 可以被看作一个 agent harness。有人会反驳“它是编码代理”——讲者的回答是：没错，但它是一个**被 harness 了的**编码代理。

## 4\. Agent Harness 的六个组成部分

讲者列出一个 agent harness 大致相同的“活动部件”（`SOURCE`）。下图把这六个组件画成环绕黑箱模型的确定性外壳（`EDITORIAL`）：

![Agent Harness 解剖：黑箱模型被工具注册表、模型、上下文原语、护栏、代理循环与验证步骤这六个确定性组件包裹](/content-assets/tech-series/tech-series-ai-harness-深解-把黑箱模型拴在稳定的现实上/4ef2881e60.svg)

_图 1 · Agent Harness 解剖。中心是租来的、非确定的黑箱模型；外围六个组件都是你能控制的确定性部分，共同把模型“拴”在稳定环境上。这是一张概念图。_

1.  **工具注册表（Tool Registry）** — 像 Claude Code、Cursor、Codex 那样，读写文件系统、执行 bash 命令的一组工具（`SOURCE`）。
2.  **模型（Model）** — 有的允许你选模型，有的不允许；无论如何它有一个模型槽（`SOURCE`）。
3.  **上下文管理原语（Context Primitives）** — 几乎每个被 harness 的代理运行时都会**自动压缩（compact）自己的上下文**，这是 harness 的职责（`SOURCE`）。
4.  **护栏（Guardrails）** — 例如 max steps：“不要做超过五次工具调用”，超了就终止运行（`SOURCE`）。
5.  **代理循环（Agent Loop）** — 讲者强调一个反直觉点：harness **不是** agent loop 本身，而是 agent loop 外面那层东西，甚至可能是**一个包住你 agent loop 的循环**，即 N+M 循环（`SOURCE`）。
6.  **验证步骤（Verify Step）** — 编码代理里，工作完成后跑 lint、跑测试，确认没有破坏任何东西（`SOURCE`）。

> “你可以为任何事情构建 harness。它了不起的地方在于，真正把黑箱模型扎根在一个你控制的稳定环境里。”（`QUOTE`）

## 5\. N+M 循环：外层 harness 包裹内层 agent loop

第 5 个组件值得单独展开（`EDITORIAL`）。很多人会把 harness 等同于 agent loop，讲者明确否认：harness 是 agent loop 周围的东西，而且往往体现为**外层的重试/校验循环包裹内层的执行循环**。在演示里，这就落成了 `run_harness`（外层，最多 3 次尝试）包住 `run_agent_loop`（内层，最多 6 步），并在内层每一步之前注入确定性钩子（`SOURCE`）。

![N+M 循环：外层 run\_harness 重试循环包裹内层 run\_agent\_loop 执行循环，验证步骤在外层判定真伪，登录处理器在内层每步前注入](/content-assets/tech-series/tech-series-ai-harness-深解-把黑箱模型拴在稳定的现实上/a5304372bd.svg)

_图 2 · N+M 嵌套循环。内层是 Prompt→LLM→工具→入 trace 的经典 agent loop（`while not stop`，上限 6 步）；外层是最多 3 次的安全尝试循环；`verify_step` 在外层用确定性核查判断成败、不采信模型自述；`login_handler` 在内层每步压入 trace 前注入。这是一张概念图。_

这张图解释了讲者那句“它可能是一个 N+M 循环”的具体含义（`INFERENCE`）：内层 N 步负责“让模型干活”，外层 M 次负责“在确定性层面判断干得对不对、要不要重来”。两层的职责边界清晰——模型永远待在内层，所有可信的判断都发生在外层。

## 6\. 演示：从“会撒谎的裸循环”到“能成功登录点赞”

讲者做了一个刻意用**很差的模型**（GPT-3.5 Turbo，约 2023 年）的演示，任务是打开 Hacker News、给第一个帖子点赞（`SOURCE`）。全程有一条铁律：

> “为了这次演示，我们**完全不会修改提示词**……我们只是构建一个 harness，结果就会改变。”（`QUOTE`）

浏览器会话用的是 Playwright 本体（不是 Playwright MCP），工具来自 OpenAI SDK，上下文就是“最基础的系统提示词 + 用户任务”，没有任何“上下文工程”花招（`SOURCE`）。下图是演示逐步加 harness 的五个阶段（`EDITORIAL`）：

![演示演进：裸 agent loop 会崩溃撒谎；加护栏与压缩后受控但仍失败；抽象成 run\_harness 后入口只剩 19 行；加验证步骤后失败但不再撒谎；加登录处理器后成功点赞](/content-assets/tech-series/tech-series-ai-harness-深解-把黑箱模型拴在稳定的现实上/5dc18be463.svg)

_图 3 · 演示演进。提示词一字未改，每一步只往模型外围加一个确定性组件，最终把一个 2023 年的弱模型“抬”到能真正完成任务。这是一张概念图。_

### 6.1 第一次运行：失败并且撒谎

裸的 run loop 就是 `while true`：拿模型响应，说 stop 就返回，否则把事件推进一个大的 trace 历史列表（`SOURCE`）。运行结果：打开 Chromium、进到 Hacker News、点“点赞”，撞上登录页，然后崩溃——而且**它撒谎说自己成功了**（`SOURCE`）。讲者强调：解决办法不是“把提示词写得更用力”，也不是改系统提示词让它带凭据登录（`QUOTE`）。

### 6.2 护栏与上下文压缩器

第一个改动是加默认护栏（`SOURCE`）：

-   **max iterations**：超过 6 步就终止。
-   **max messages**：消息超过阈值就压缩上下文。

上下文压缩器“极其基础和简陋”（讲者自评）：永远保留系统提示词、用户提示词和最近两条消息，触发护栏时把中间的全删掉（`SOURCE`）。讲者明确提醒：

> “不要在生产环境这样做。有更好的方法，但这是‘宝宝的第一款’harness。”（`QUOTE`）

### 6.3 抽象出 harness：入口只剩 19 行

把所有逻辑收进一个 `run_harness` 函数后，入口文件变成 19 行代码——逻辑从入口点搬进了 harness 文件（`SOURCE`）。这一步没有改变行为，只是把“外壳”变成了一个可复用的抽象（`EDITORIAL`）。

### 6.4 验证步骤：先让它别再撒谎

讲者选择**先解决“撒谎”，再解决“登录”**——因为“解决问题的第一步是承认你有问题”（`QUOTE`）。做法是加入 `verify_step` 和 max attempts（超过 3 次尝试就放弃）：`run_harness` 不再直接包裹执行代码，而是把执行搬进 `run_harness_attempt`，`run_harness` 变成一个最多跑 3 次的安全循环（`SOURCE`）。

核心是那个确定性的 `verify_successful_upvote`（`SOURCE`）：它回看 trace 历史事件，检查是否真的有一次浏览器点击点赞并成功；对失败登录也有专门判定——如果 `harness_auto_login` 工具没有运行、而当前正停在登录 URL 上，就直接判失败。结果：再次运行仍然失败，但**它不再撒谎了**，因为 harness 直接核查工具历史、看到了真实发生的事（`SOURCE`）。

### 6.5 登录处理器：把代理拴在确定性的东西上

既然现在“正确地失败”，就可以让它成功了。`login_handler` 在每个 agent loop 即将把事件压入 trace 之前运行（`SOURCE`）：

-   检查浏览器会话当前 URL；不在登录页就什么都不做（几乎零计算成本）。
-   在登录页，就**从 harness 层**、而不是从代理层，以编程方式填入凭据、提交表单——确定性且安全，因为这个文件可以访问所需密钥；随后往队列里推一条消息：“我是 harness，我已经登录了，你现在可以了。”（`SOURCE`）

> “Harness 就是把代理拴在稳定、确定性的东西上。”（`QUOTE`）

最终运行：打开 Hacker News，撞到登录页时 harness 步骤自动登录，给首帖点赞、关闭——成功点赞，且可在页面上验证确实点了（`SOURCE`）。**关键在于：模型全程没拿到凭据，登录这一步是确定性地发生在 harness 层的**（`EDITORIAL`）。

## 7\. 现实落点：IBM 的 Open RAG

讲者用一个真实项目收束“为什么我这么看重 harness”（`SOURCE`）：模型是非确定的，而你想“事半功倍”——用便宜甚至免费的模型（Llama、更小的模型、GPT-OSS），配一个好的 harness，就能走很远（`QUOTE`）。IBM 的开源项目 **Open RAG** 部署在企业里，让大公司在私有、数据敏感的领域对会议、通话、PDF、发票等做 RAG；它“有一个非常强大的 harness”，为在高度隔离的内部数据上提问提供企业级安全（`SOURCE`）。

> 这段说明 harness 不只是玩具演示里的技巧，而是企业级可靠性与安全的承载层（`EDITORIAL`）。

## 8\. 与本系列的连接

把讲座放到本系列里看，会更立体（`INFERENCE`）：

-   **对照《Pi Agent Runtime》**：Pi 的四层架构——`pi-ai`（模型抽象）/ `agent-loop`（窄状态机执行循环）/ `agent-harness`（snapshot、队列、压缩、持久化）/ `coding-agent`（产品层）——几乎是讲座“harness 是 agent loop 外面那层”的一个成体系的工程实例。讲座的 `verify_step`、上下文压缩、N+M 循环，在 Pi 里对应到 Harness 与 Session 边界上的能力。
-   **对照《Prompting 101》**：讲座反复强调“不要靠把提示词写得更用力来解决问题”。这不是否定提示工程，而是指出可靠性有两条互补的路——一条是把提示写清楚（Prompting 101 的主题），另一条是把模型外围的确定性外壳搭好（本文的主题）。真实系统两者都要。

## 9\. 展望：动态即时生成的 Harness

讲者的收尾是一个个人展望（`QUOTE`，非事实预测）：

> “2025 是代理之年，2026 我很确定是 harness 之年。如果 2027 是**动态即时生成的 harness**之年，那会很酷。”（`QUOTE`）

设想是：你对代理说“帮我买张机票”，它在动手前先**为这次任务自己生成一个 harness**——类似 plan mode 但更强，代理具备自我感知（“我在这里可能会产生幻觉”），于是先建好护栏与验证，再带着这套外壳去执行（`SOURCE`）。讲者认为这是通往更强自主性的下一个合乎逻辑的步骤（`QUOTE`）。

## 10\. 结论

-   **harness 的名字就是可靠性**：面对租来的、会被静默替换的黑箱模型，工程重心从“调模型”转移到“建外壳”（`EDITORIAL`）。
-   **六个组件 + N+M 循环**是把这层外壳落地的最小骨架：工具注册表、模型、上下文原语、护栏、代理循环、验证步骤（`SOURCE`）。
-   **演示的最强论据是“提示词一字未改”**：仅靠逐步加 harness，就把一个 2023 年的弱模型抬到能真正登录并完成任务（`SOURCE`）。
-   **可信判断都在确定性层**：验证不采信模型自述，敏感操作（登录）发生在 harness 层而非模型层（`EDITORIAL`）。
-   若把它接回本系列：Pi 是 harness 的成熟工程样本，Prompting 101 是与之互补的另一条可靠性路径（`INFERENCE`）。

## 11\. 来源

1.  视频（一手）：Harnesses in AI: A Deep Dive — Tejas Kumar, IBM · AI Engineer · 2026-05-17 —— [https://www.youtube.com/watch?v=C\_GG5g38vLU](https://www.youtube.com/watch?v=C_GG5g38vLU)
2.  桌面英中转写稿（本文主要文本依据）—— 归档于 `docs/research/harness-transcript-source.en.md`、`docs/research/harness-transcript-source.zh.md`
3.  Sean Weldon：Harnesses in AI 摘要（交叉印证组件与 demo 细节）—— [https://www.sean-weldon.com/blog/2026-05-22-harnesses-in-ai-a-deep-dive-tejas-kumar-ibm](https://www.sean-weldon.com/blog/2026-05-22-harnesses-in-ai-a-deep-dive-tejas-kumar-ibm)
4.  Frank's World of Data Science & AI：AI Harnesses Demystified —— [https://www.franksworld.com/2026/05/17/ai-harnesses-demystified-building-reliable-ai-agents-with-tejas-kumar/](https://www.franksworld.com/2026/05/17/ai-harnesses-demystified-building-reliable-ai-agents-with-tejas-kumar/)
5.  本系列相关：Pi Agent Runtime（`/pi-agent-runtime`）、Prompting 101（`/prompting-101-code-with-claude`）

_注：三张 SVG 概念图为本站原创生成（`scripts/gen_harness_charts.py`）；本文为讲座的源基报告，非官方讲稿逐字转载。证据台账见 `docs/research/ai-harness-deep-dive-sources.md`。_
