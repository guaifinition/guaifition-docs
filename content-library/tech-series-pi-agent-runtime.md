> Agent、Harness 与 Coding Agent 编排架构的源码级研究报告。

这篇文章把 Pi 看成一组可以独立检查的运行时边界，而不是一张把所有能力揉在一起的 Agent 大图。阅读路径从 `pi-ai` 的模型抽象开始，经过流式 Agent Loop、`AgentHarness` 与 Session，再到 Coding Agent 的资源、工具、扩展和交付协议。文中同时标出当前实现、文档规划和工程推论，避免把“已经能运行”与“设计上准备支持”混为一谈。

## 阅读说明

### 范围与基准

-   **检视对象**：Pi 当前浅克隆 HEAD，版本标记为 `v0.83.0`。
-   **检视提交**：`9786716d4de2a0a23c53b011f5bbc1f4084f700f`（界面中显示短 commit `9786716d4de2`）。
-   **仓库状态**：`main / origin/main`。
-   **主要内容来源**：Pi v0.83.0 源码仓库、Agent Harness 文档和本文件列出的外部理论资料；网站展示由 `src/app/[slug]/page.tsx` 从本 Markdown 生成。
-   **文章目的**：把依赖网站导航、状态切换和 SVG 图的报告迁移为脱离 UI 仍可阅读的 Markdown 知识库；交互图在下文改写为概念图说明，不改变其技术断言。

### 证据边界

| 标记 | 含义 | 阅读方式 |
| --- | --- | --- |
| `CURRENT` | 以该基准检查到的当前实现或当前产品路径 | 可以作为现状描述，但仍应以源码和版本为准 |
| `ROADMAP` | Harness 文档或设计中规划的能力 | 不能因为出现在设计文档里就视为已实现 |
| `INFERENCE` | 根据实现边界做出的架构解释、比较或建议 | 是带前提的工程判断，不是源码逐字事实 |

报告的核心结论是：先让模型—工具循环足够小、透明，再把认证、会话、资源、UI 与远程协议放在外围。这样 Provider 不需要理解 Coding Agent，TUI 也不需要解析原始 SSE，宿主应用可以只取自己需要的层。

## 1\. 四层架构：稳定边界，而不是巨型 Agent 图

### 1.1 分层总览

| 层 | 代码/产品标签 | 主要职责 | 基准状态 |
| --- | --- | --- | --- |
| 01 | `pi-ai` / Model Infrastructure | 统一 `Model`、`Context`、标准消息、工具描述与 `AssistantMessageEventStream`，隔离 OpenAI、Anthropic、Google、Bedrock 等 Provider 差异 | `CURRENT` |
| 02 | `agent-loop` / Agent Core | 用窄状态机完成 `Prompt → LLM → Tool → Result → Next Turn`，并处理取消、重试、steer 与 follow-up | `CURRENT` |
| 03 | `agent-harness` / Harness 与 Session | 把 turn snapshot、operation phase、队列、pending writes、持久化、上下文压缩和树导航提升为可嵌入编排层 | `CURRENT` 能力与 `ROADMAP` 设计并存 |
| 04 | `coding-agent` / Product Surface | 提供项目资源、文件工具、Bash、Extension、TUI、Print、JSON、RPC 与 SDK | `CURRENT`；主路径尚未完全迁移到新 Harness |

图的纵向语义是：向上是抽象化与可复用性增加，向下是产品策略与运行环境依赖增加。它们不是互相替代的四种 Agent；同一次运行可以从底层事件流一路被包装成产品体验。

### 1.2 概念交互图说明

原报告提供“分层”和“执行链路”两种交互图。用 Markdown 表达时，可以把分层关系读作：

```text
pi-ai / Provider
  │  统一流式事件与消息转换
  ▼
runAgentLoop
  │  tool call · queue · abort
  ▼
AgentHarness
  │  snapshot · save point · hooks
  ▼
Coding Agent · TUI · SDK · RPC
```

这不是说所有调用都必须沿一条同步链路完成，而是说明依赖方向：底层不认识上层产品策略，上层通过稳定事件和 Session 边界使用底层能力。

执行链路的五个概念节点是：

1.  **Prompt**：输入、资源与 system prompt。
2.  **Stream**：消费 Provider 事件流。
3.  **Tool**：校验参数、执行 Hook 与工具。
4.  **Save**：在 `message_end` / Session 边界保存消息。
5.  **Next turn**：刷新下一轮 snapshot。

执行可以并发，语义仍需有序：工具可能并行完成，完成事件按真实完成顺序发出，但最终的 tool result 按 assistant 原始调用顺序生成。

> **关键事实（`CURRENT`）**：当前 `packages/coding-agent` 的主路径仍由 `AgentSession + Agent + coding-agent SessionManager` 驱动；`packages/agent/src/harness` 已有可运行的通用实现，但 Durable Harness、统一 Hooks 和产品迁移仍属于演进方向（`ROADMAP`）。

## 2\. Agent Loop：`Prompt → LLM → Tool → Result → Next Turn`

> **状态（`CURRENT`）**：这是核心闭环，已在基准中实现。

`packages/agent/src/agent-loop.ts` 没有把 Planner、Multi-Agent 或业务策略塞进核心。它只关心三个相邻问题：当前 assistant 是否需要工具、是否存在 steering/follow-up，以及下一次 LLM 请求应该看到什么上下文。这个窄腰使 Agent Core 能在 CLI、SDK、RPC 或自定义宿主中复用。

### 2.1 一轮执行的阶段

| 阶段 | 发生什么 |
| --- | --- |
| Prompt | 加入 user message，准备输入、资源和 system prompt |
| Stream | 消费 `AssistantMessageEvent` / Provider 事件流 |
| Validate | 用 schema 校验 tool arguments |
| Execute | 按工具策略并行或顺序执行 |
| Continue | 保存结果，准备下一轮 context |

### 2.2 两层循环与队列语义

内层循环处理 tool calls 和 steering：工具必须完成后，steer 才会被插入下一次模型请求。外层循环处理 follow-up：只有 Agent 原本准备停止、且没有工具和 steering 时，follow-up 才成为下一次 turn。

这对应交互式 Coding Agent 的两类输入：steering 是“当前动作完成后改变方向”，follow-up 是“原任务收束后追加任务”。这种分离既不打断正在运行的 Provider，也不把用户输入静默丢掉。

下面是报告中的概念代码；它用于表达循环与队列边界，不是对所有实现细节的逐行替代：

```typescript
while (true) {
  while (hasMoreToolCalls || pendingSteering.length > 0) {
    const assistant = await streamAssistantResponse();
    const results = await executeToolCalls(assistant);
    prepareNextTurn();
  }

  const followUp = dequeueFollowUp();
  if (!followUp) break;
  pendingSteering.push(followUp);
}
```

### 2.3 工具验证、并发与错误闭合

-   **参数先验证，再执行（`CURRENT`）**：TypeBox schema 失败会生成 `isError` tool result，不触发外部副作用。`beforeToolCall` 可以阻止已经校验过的调用，`afterToolCall` 可以调整 result 或要求 terminate。
-   **执行并发、语义有序（`CURRENT`）**：默认工具可以并发执行；完成事件按实际完成顺序发出，但 tool result 按 assistant 原始调用顺序生成。需要写入顺序时，工具可以声明 `sequential`。
-   **失败也闭合事件流（`CURRENT`）**：Provider error、截断的 tool call 和 abort 会映射为结构化 `AssistantMessage` / `toolResult`。低层 Loop 不假设外部副作用可回滚，但保证状态机具有可处理的结束边界。

> **并行不等于事务（`INFERENCE`）**：文件变更队列只能协调进程内的 mutation；自定义工具仍需声明幂等性、锁需求或副作用策略。Pi 保证 transcript 的顺序，不承诺外部世界的 exactly-once。

## 3\. `AgentHarness`：把一次运行变成可解释的操作生命周期

`packages/agent/src/harness/agent-harness.ts` 中的 `AgentHarness` 直接调用 `runAgentLoop()`，在其上增加 Session、phase、turn snapshot、队列、pending writes、Provider Hooks、压缩和树导航。它解决的不是“如何让模型思考”，而是“配置何时生效、事件何时持久化、多个操作如何互斥”。

### 3.1 Operation phases

每个 phase 都有清晰的可变性边界：

| Phase | 语义 |
| --- | --- |
| `idle` | 结构操作、配置建立 |
| `turn` | LLM 与工具循环 |
| `compaction` | 摘要与上下文重建 |
| `branch_summary` | 分支切换与摘要 |
| `retry` | 类型已定义，策略仍在演进 |

### 3.2 Turn snapshot：不让在途请求漂移

每个 turn snapshot 固定以下内容：

-   当前 branch context；
-   system prompt；
-   resources；
-   tools；
-   model；
-   thinking level；
-   stream options。

如果运行中修改模型或工具，当前 Provider 请求保持不变；到下一次 save point 才刷新配置。与一个被多处闭包共享的全局 context 相比，这种边界更容易推理：`setModel()` 的生效时刻明确，tool execution 不会让同一次请求的一半使用旧配置、另一半使用新配置。

### 3.3 Save point：持久化也有顺序

运行期间 append message 会进入 pending write 队列。关键顺序是：

1.  `message_end` 先保存 assistant / `toolResult`；
2.  再通知 subscriber；
3.  `turn_end` flush pending writes；
4.  下一轮读取最新 snapshot。

这保护了工具调用与工具结果之间的消息顺序。若队列通知失败，已经取出的 steering/follow-up 会放回队列，避免扩展或观测故障悄悄吞掉用户意图。

### 3.4 `CURRENT` 与 `ROADMAP`

| `CURRENT`：当前已有能力 | `ROADMAP`：文档规划方向 |
| --- | --- |
| phase 与 busy lock | operation/task/tool durable records |
| turn snapshot 与下一轮刷新 | crash recovery 与 replay-safe policy |
| pending Session writes | 统一 Hooks facade 与 cleanup |
| context、tool、Provider hooks | auto-compaction decision point |
| explicit compact 与 branch navigation | runtime-neutral observability |

> **边界声明**：当前 Harness 能在正常生命周期中保存消息、配置和分支。Durable Harness 文档设计了 crash recovery、single writer、operation records 和 tool replay policy；这些设计并不等于当前代码已经实现。应将此处的 Durable 能力标为 `ROADMAP`，而不是 `CURRENT`。

## 4\. Session 与持久化：Append-only tree

> **状态（`CURRENT`）**：Core Session 以 JSONL v3 保存 append-only 树。

### 4.1 Session 树不是一条被覆盖的历史

Core Session 用 `id / parentId / timestamp` 组成树，`leaf` 记录当前指针。它不覆盖历史：用户可以从旧节点继续创建新 branch，保留原始路径，并在跨分支时生成 branch summary。模型上下文只是这棵树的有损投影，不是历史本身。

```text
SESSION TREE（完整 JSONL）
└─ session_info
   └─ user prompt
      └─ assistant + tools
         ├─ compaction summary
         │  └─ current leaf
         └─ alternate branch

MODEL CONTEXT（投影窗口）
└─ system prompt
   └─ compaction summary
      └─ retained tail
         └─ new messages
```

上图的含义是：完整树保留原始记录、分支和当前 leaf；Provider 只接收经过 projector 选择的窗口。

### 4.2 Compaction 是有损压缩，不是删除历史

当 context tokens 接近窗口上限，Coding Agent 会从尾部寻找完整的 turn 边界，确保 tool call 与 tool result 不被拆开。极端情况下会生成 history summary 与 turn-prefix summary。摘要通常保留：

-   Goal；
-   Constraints；
-   Progress；
-   Decisions；
-   Next Steps；
-   关键文件。

完整 JSONL 仍然可以回看、导出和分支；但摘要是另一个模型生成的模型上下文，可能遗漏事实。因此，“可回溯原文”是 Session 树存在的必要条件。压缩改善的是送给 LLM 的上下文窗口，不是把历史事实变得无损。

### 4.3 两套 Session 实现

当前存在两条语义相近但不是同一个类的实现：

| 路径 | 定位 | 特征 |
| --- | --- | --- |
| `packages/agent/src/harness/session` | 更通用的 Harness Session | 面向异步 backend、projector 与 `ExecutionEnv` |
| `packages/coding-agent/src/core/session-manager.ts` | Coding Agent 产品专用路径 | 包含 v1→v2→v3 迁移、Bash/CustomMessage 与交互式树操作 |

未来迁移的难点不是 JSONL 写入本身，而是 custom message 投影、同步/异步 API、leaf 语义以及扩展渲染依赖。

### 4.4 Context projection

报告中的投影流程可以脱离 UI 表达为：

```text
完整 entries
   │
   ├─ branch state：model / thinking / active tools
   │
   └─ context projector
        ├─ compaction barrier
        ├─ retained tail
        ├─ custom message -> AgentMessage
        └─ excludeFromContext -> 不送给 LLM
```

持久化层可以比 LLM 消息丰富：自定义事件、通知或 Bash 执行记录可以保留在 AgentMessage/Session 中，再由 `transformContext()`、projector 和后续转换决定哪些内容进入下一次请求。

## 5\. LLM API 与 Provider：把差异压缩成稳定事件流

> **状态（`CURRENT`）**：`pi-ai` 的统一 API 与 Provider 事件边界已实现。

### 5.1 `pi-ai` 的边界

`packages/ai` 的价值不只是把几个 SDK 包在一起。它定义 `Model`、`Context`、标准消息与 `AssistantMessageEventStream`，再让各 Provider 把自己的 SSE、Responses item、thinking block 或错误格式转换为同一份事件契约。

| 概念 | 责任 |
| --- | --- |
| Provider | 认证与请求行为 |
| Model | 模型能力与成本元数据 |
| Models | Provider 与模型的运行时集合 |
| Lazy stream | 将认证、动态 import 或初始化失败转为 error event 与最终 `AssistantMessage`，而不是不可控的 rejected Promise |
| Message transform | 处理图像降级、tool ID 规范化、orphan tool call、thinking signature 与跨 Provider replay |
| 分层重试 | 将 Provider 传输重试、Coding Agent turn retry、compaction retry 分开，避免 Agent Loop 了解网络与认证 |

### 5.2 内部消息不等于 LLM 消息

Pi 用 `AgentMessage[]` 允许扩展加入 `bashExecution`、`compactionSummary`、通知和领域事件。每次请求前，再通过 `transformContext()` 与 `convertToLlm()` 把内部上下文投影为 Provider 可以理解的标准消息。

这条边界让 UI 与持久化可以拥有更丰富的事件，而 API adapter 不必知道 Coding Agent 的全部概念。内部 transcript 是产品状态；送给 Provider 的消息是面向当前模型能力的投影。

### 5.3 Provider 兼容的真实难点

跨 Provider 不是简单的 schema rename，至少还要处理：

-   工具参数的增量 JSON；
-   不同的 tool call ID 约束；
-   reasoning item 的可重放性；
-   图片能力差异；
-   error assistant 在历史中的处理。

统一中间表示必须在能力保真与最小公分母之间取舍。

报告中的 Provider 边界代码如下：

```typescript
type StreamFn = (
  model: Model,
  context: Context,
  options?: StreamOptions,
) => AssistantMessageEventStream;

// Provider error is represented in the stream.
// Agent Core consumes one stable contract.
```

这里的要点不是某个 SDK 的函数名，而是错误也进入事件流；Agent Core 因而消费一份稳定契约。

## 6\. Coding Agent：把通用 Loop 变成代码工作台

用户感受到的 Pi 不只是一个 while-loop。`createAgentSession()` 还要解析 cwd、Session、settings、模型与认证，加载 `AGENTS` / `CLAUDE` / `SYSTEM` 文件，构建 system prompt，注册 read/write/edit/bash 工具，并把事件桥接给 TUI、RPC 或 SDK。

### 6.1 产品运行生命周期

| 步骤 | 操作 | 典型内容 |
| --- | --- | --- |
| 01 | `resolve` | cwd · agentDir · settings · model |
| 02 | `load` | ResourceLoader · Skills · prompt files |
| 03 | `compose` | system prompt · tools · hooks |
| 04 | `run` | Agent · AgentSession · SessionManager |
| 05 | `settle` | retry · compaction · queued follow-up |

### 6.2 `ModelRuntime`：产品级模型注册表

`ModelRuntime` 是产品级模型注册表。它在 `pi-ai.Models` 之上叠加：

-   `models.json`；
-   运行时 API key；
-   credential storage；
-   OAuth；
-   远程 catalog；
-   native extension Provider；
-   model fallback。

`ModelResolver` 再处理 `provider/model:thinking`、alias、glob scope 与能力 clamp。这说明 Coding Agent 的模型选择不仅是调用一个静态模型对象，还包含凭据、能力和回退策略。

### 6.3 Runtime replacement 不是崩溃恢复

`/new`、`/resume`、`/fork`、`/clone` 触发产品内的 Session replacement。安全顺序是：

1.  abort 旧 Agent；
2.  等待保存完成；
3.  发送 `session_shutdown`；
4.  使旧 Extension Context 失效；
5.  重建 `ResourceLoader`、`ModelRuntime`、`SettingsManager` 与 `AgentSession`。

这不是进程级 crash recovery，而是在一个仍运行的产品进程内替换 Session 与运行时对象。

> **当前实现边界（`CURRENT`）**：自动重试和自动压缩目前主要由 `AgentSession` 提供。Coding Agent 遇到 overflow 或可重试 Provider error 时，可以删除内存中的失败 assistant、退避、压缩并 continue；新 `AgentHarness` 的通用 auto-compaction decision point 与 retry handling 仍在演进（`ROADMAP`）。

## 7\. Extensions 与工具：控制平面，而不只是几个回调函数

> **状态（`CURRENT`）**：Extension 支持动态加载；其能力面覆盖工具、UI、Provider、Session 与策略。

Extension 可以注册：

-   工具、命令、快捷键与 flag；
-   Provider、OAuth 与模型目录；
-   renderer、UI 与自定义组件；
-   Skills 与 Prompt Template；
-   session custom entries、message projector 与 branch-aware 状态。

因此 plan mode、sub-agent、审批、MCP client 和领域工具可以留在宿主层组合，而不是让核心 Loop 持续膨胀。

### 7.1 能力面

| 能力 | Extension 可提供的内容 |
| --- | --- |
| Tools | TypeBox schema、执行策略、update、renderer、sourceInfo |
| UI | selector、confirm、input、widget、header/footer、custom component |
| Prompts | Skills、Prompt Templates、context files、system prompt snippets |
| Providers | native/configured Provider、OAuth 与模型目录 |
| Session | custom entries、message projector、branch-aware 状态 |
| Policy | `beforeToolCall`、`tool_result`、approval 与外部 sandbox adapter |

### 7.2 ResourceLoader 的信任边界

全局目录、项目 `.pi`、祖先 `.agents/skills`、package 和 CLI 路径会合并资源。Project Trust 只控制项目资源是否自动加载；它不是 shell、文件或网络沙箱。动态 Extension 本质上仍是当前进程中的任意代码。

### 7.3 工具的定义、执行、展示分离

`ToolDefinition` 同时描述 schema、prompt guidance、`executionMode`、`execute` 与 renderer。文件 mutation queue 可以串行化进程内写操作，但不能提供版本控制事务，也不能替代容器隔离。

报告中的扩展工具示例：

```typescript
pi.registerTool({
  name: "inspect_runtime",
  label: "Inspect runtime",
  parameters: Type.Object({ scope: Type.String() }),
  executionMode: "sequential",
  async execute(_toolCallId, params, signal, onUpdate) {
    onUpdate?.({ content: [{ type: "text", text: "reading" }] });
    return { content: [{ type: "text", text: params.scope }] };
  },
});
```

这个例子同时展示了命名、标签、TypeBox 参数、顺序执行、增量 update 与最终工具结果；它不意味着 Extension 自动获得沙箱能力。

## 8\. 运行模式与协议：同一个 Runtime 的四种交付形态

协议层不是 Agent Loop 的替代，而是它的运输和观察边界。相同的 Runtime 可以通过以下表面交付：

| 表面 | 协议/形态 | 适合场景与内容 |
| --- | --- | --- |
| Interactive | TUI | 实时工具反馈、steering、队列、快捷键、Extension UI |
| Print | JSONL | 一次 prompt、最终输出、脚本与评测 |
| RPC | stdin/stdout | command/response envelope、UI request、backpressure |
| SDK | embedded | 应用自定义模型、Session、工具与宿主 UI |

对于远程服务，客户端不能只依赖流式 progress event 重建状态。`Protocol snapshot` 应是权威状态，progress event 只是瞬时提示。系统需要明确：

-   Session ownership；
-   writer；
-   认证；
-   snapshot；
-   backpressure；
-   reconnect 策略。

实验性 CBOR protocol 已为这些边界留下设计空间。对应的阅读入口是 `packages/protocol/README.md`。

## 9\. 理论与方案比较

> **章节性质（`INFERENCE`）**：以下是基于实现边界的研究判断与方案比较。

### 9.1 Pi 的理论位置

Pi 的实现与 ReAct 的 Reason–Act–Observe 结构同构，但把 thinking、toolCall、toolResult 作为结构化 block，而不是要求模型输出 `Thought:` 和 `Action:` 文本；这样更容易保留 Provider 的原生能力。

它也遵循 Anthropic 所倡导的“先从最简单有效的 Agent 开始”：核心 loop 保持窄，把 Workflow、plan mode、MCP、审批和 sub-agent 留给 Extension 与宿主组合。

### 9.2 与两类常见运行时的比较

| 维度 | Pi | OpenAI Agents SDK 风格 | LangGraph 风格 |
| --- | --- | --- | --- |
| 核心单位 | 单 Agent Loop + Coding Harness | Agent、handoff 与 workflow | 状态图、节点、边与 checkpoint |
| 状态模型 | JSONL 树、leaf、分支摘要、compaction | Session/history 抽象 | 持久化图状态与可恢复执行 |
| 多 Agent | 核心不内置，由 Extension/SDK 组合 | handoff 是一等概念 | 可用图节点显式编排 |
| 安全边界 | Project Trust 不是沙箱，隔离交给宿主 | guardrail/approval 可编排 | 需结合节点策略与执行环境 |
| 适合场景 | 本地 Coding Agent、嵌入式 Runtime | 面向模型生态的 Agent 应用 | 长时任务、审批和复杂工作流 |

> **研究判断（`INFERENCE`）**：Pi 更像可嵌入的单 Agent Runtime，而不是多 Agent 图引擎。这个判断来自核心单位、Session 形态和扩展位置的差异，不是对其他产品内部实现的完整审计。

### 9.3 三个参照点

-   **ReAct**：Pi 用 assistant reasoning、tool call、tool result 实现同构的结构化行动循环，但不强制文本化 thought。
    -   论文：[ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
-   **Anthropic**：从简单 Agent 开始；将 Workflow、plan mode、MCP、审批与 sub-agent 放在可组合层，避免把策略固定成一张大图。
    -   原文：[Building effective agents](https://www.anthropic.com/research/building-effective-agents)
-   **MCP**：协议可以作为扩展。Pi 不把 MCP 设为核心依赖；需要互操作时，可以在 Extension 或独立 Tool Gateway 中接入而不改变 agent-loop。
    -   规范：[Model Context Protocol Specification](https://modelcontextprotocol.io/specification)

选择建议同样属于 `INFERENCE`：如果任务核心是本地代码库、低延迟和可组合工具，Pi 的薄核心很合适；如果业务核心是审批节点、并行分支、跨进程恢复和可视化工作流，应在 Pi 之上增加图/工作流层，或选择专门的 graph runtime。

## 10\. 风险与改进路线

### 10.1 当前约束

当前架构最值得投资的是边界，而不是功能数量。以下问题决定 Pi 从“好用的本地工具”走向“可托管基础设施”时的上限：

-   新旧 Session / 编排体系并存；
-   crash recovery 尚未成为当前实现能力；
-   Hook 存在重入风险；
-   Provider replay 复杂度高；
-   Extension 权限边界仍依赖宿主执行环境。

这些是基于当前报告与设计边界的风险归纳；其中 Durable 相关能力必须保持 `ROADMAP` 标记。

### 10.2 五项改进建议

1.  **统一新旧运行时的兼容表**：保留 `AgentSession` 的产品能力，把通用 Session、消息 projector 与 Harness Hook 逐步适配；不要让第三方猜测哪条 API 才是长期方向。
2.  **先实现半持久化，再谈 exactly-once**：记录 operation、tool started、pending write 与 replay policy；未完成的外部 Provider 请求默认标为 `interrupted`，不自动重发。
3.  **把安全落实为 capability**：`ExecutionEnv`、Bash 以及外部 Docker/Gondolin/OpenShell adapter 应在执行边界实施路径、网络、进程与 approval policy。
4.  **建立脱敏 Observability**：记录 latency、usage、cost、tool status、compaction 与 retry；默认不记录 prompt、completion、文件内容和凭据。
5.  **用故障注入测试时序**：覆盖 append 前崩溃、tool 后崩溃、abort、hook throw、queue rollback、provider retry 与 `waitForIdle` 重入。

### 10.3 推荐顺序

```text
Contract
  → Session projector
  → durable records
  → policy
  → observability
```

先冻结概念与兼容边界，再统一消息/Session 读取，之后用 single writer 和故障注入落地恢复能力。多 Agent、MCP 与 plan mode 继续留在上层组合，而不是提前塞进核心 Loop。

## 11\. 来源地图与代码阅读顺序

### 11.1 基准与可追溯性

本报告以 Pi 当前浅克隆 HEAD 为事实基准，并用公开理论与文档做概念比较。链接指向原始仓库或原始资料；规划能力不会因为出现在设计文档中就被标记为已实现。

-   **版本**：`v0.83.0`
-   **基准 commit**：[`9786716d4de2a0a23c53b011f5bbc1f4084f700f`](https://github.com/earendil-works/pi/commit/9786716d4de2a0a23c53b011f5bbc1f4084f700f)
-   **仓库**：[`earendil-works/pi`](https://github.com/earendil-works/pi)
-   **Agent 文档目录**：[`packages/agent/docs`](https://github.com/earendil-works/pi/tree/main/packages/agent/docs)

### 11.2 外部来源

| 来源 | 用途 | URL |
| --- | --- | --- |
| Pi 源码仓库 | 主仓库与发布信息 | [GitHub: earendil-works/pi](https://github.com/earendil-works/pi) |
| Agent Harness 文档 | Harness、Durable、Hooks、Observability | [Pi `packages/agent/docs`](https://github.com/earendil-works/pi/tree/main/packages/agent/docs) |
| OpenAI model guidance | 本页面的信息架构与视觉参考；不是 Pi 实现事实的唯一依据 | [Latest model guidance](https://developers.openai.com/api/docs/guides/latest-model) |
| Anthropic: Building effective agents | Workflow 与 Agent 的工程取舍 | [Anthropic Research](https://www.anthropic.com/research/building-effective-agents) |
| ReAct 论文 | Reason–Act–Observe 理论基础 | [arXiv: 2210.03629](https://arxiv.org/abs/2210.03629) |
| Model Context Protocol | 工具与资源互操作协议 | [Specification](https://modelcontextprotocol.io/specification) |

### 11.3 本地提取入口与建议阅读顺序

本文由源码审计报告材料迁移而来；以下路径是当前知识库和构建入口：

-   `content/articles/pi-agent-runtime.zh-CN.md` / `content/articles/pi-agent-runtime.en-US.md`：中英文 canonical source。
-   `src/lib/knowledge-base.ts`：读取 frontmatter、渲染 Markdown、生成文章导航。
-   `src/app/[slug]/page.tsx`：按 slug 静态生成文章路由。

按运行时由下到上的顺序阅读 Pi 源码：

1.  `packages/ai/src/types.ts`
2.  `packages/agent/src/agent-loop.ts`
3.  `packages/agent/src/harness/agent-harness.ts`
4.  `packages/agent/src/harness/session/session.ts`
5.  `packages/coding-agent/src/core/agent-session.ts`
6.  `packages/coding-agent/src/core/model-runtime.ts`
7.  `packages/coding-agent/src/core/extensions/runner.ts`
8.  `packages/protocol/README.md`

## 结语

Pi 的价值不在于把所有 Agent 技巧内置进去，而在于把模型事件、循环控制、持久化状态、产品资源与宿主策略放在可以检查的边界上。当前实现已经足以支撑本地和嵌入式 Coding Agent；要成为可托管基础设施，还需要把 Durable Harness 中的记录、恢复、重放、策略和可观测性从设计边界推进到可验证的生命周期语义。
