> 一句话主线：当编码 Agent 正在连续读文件、改代码、跑命令、调子 Agent 时，用户新敲下的一句话“何时、以何种方式”成为当前决策的一部分，才是决定交互质量与安全性的核心运行时协议——而不是那个输入框本身。 研究方法：只用第一方或接近第一方的技术资料（主仓库源码、测试、官方文档、变更日志、官方问题跟踪器），不以聚合博客或论坛帖子作为机制性结论依据。

编码 Agent 已经从“单次问答工具”演化为长期运行系统：它会连续读取文件、修改代码、执行命令、调用子 Agent。用户在 Agent **执行期间**提交的新输入如何被接收、排序、注入与执行，因此成了运行时的核心并发问题。本文把运行中输入划分为三种语义——**硬中断（interrupt）**、**边界引导（steer，本文亦称“边界引导”）**、**后续排队（follow-up queue）**——并据此比较 Codex CLI、Claude Code CLI、OpenCode（现行实现与 V2 Beta）与 Pi CLI。全文用一套证据分级标注每条关键结论：源代码得到的事实标 `A1`，测试得到的标 `A2`，官方文档标 `B1`，变更日志标 `B2`，问题跟踪器标 `C1`，基于证据的推断标 `I`。

| 等级 | 证据类型 | 可支持的结论 |
| --- | --- | --- |
| `A1` | 官方主仓库源代码 | 数据结构、控制流、边界条件、状态转换 |
| `A2` | 官方测试用例与快照 | 实际请求序列、失败路径、回归约束 |
| `B1` | 官方技术文档 | 用户可见语义、稳定 API、设计意图 |
| `B2` | 官方变更日志 | 功能首次引入、行为修复、版本演化 |
| `C1` | 官方问题跟踪器 | 尚未实现的需求、当前限制；不能单独证明内部实现 |
| `I` | 基于 A/B 证据的推断 | 明确标注为推断，不表述为已公开事实 |

## 1\. 研究问题与范围

本文回答四个问题：四类 CLI 在 Agent 运行期间收到新输入时各采用何种调度语义（RQ1）；为什么有的产品表现为“几乎立即纠偏”、有的表现为“当前任务结束后再处理”（RQ2）；Codex 的 steer 如何在协议层、状态层、Agent Loop 层与工具层共同实现快速响应（RQ3）；对想实现类似能力的运行时，哪些机制是必要条件、哪些只是界面层优化（RQ4）。

范围聚焦于**前台交互会话中的用户新输入**。不重点讨论：多会话调度与云端作业队列；模型内部的 speculative decoding、KV cache 或推理服务器调度；终端渲染与网络传输优化；完整权限系统、沙箱与自动上下文压缩；模型侧生成质量差异。这些都影响总体验，但不改变本文的核心问题：**新输入何时成为当前 Agent 决策的一部分。**

由于这些项目持续快速更新，本文所有结论都应理解为**截至研究截止日（2026-08-04）的实现快照**，不是永久产品契约。采用的资料快照为：Codex `openai/codex` 主分支（含 commit `9873cba8...`）；Claude Code 官方文档与当日 changelog（页面版本 `2.1.221`）；OpenCode `anomalyco/opencode` 的 `dev` 分支（含 commit `c387fe19...`），区分现行实现与 V2 Beta；Pi `earendil-works/pi` 主分支（含 commit `ab5f8d88...`）与官方 latest 文档。

## 2\. 三种运行中输入语义

三种语义的区别不在“输入框”，而在**新输入相对活动 turn 的生效位置**。下图把三者画在同一条时间线上。

![三种运行中输入语义：硬中断取消当前 turn；边界引导在同一 turn 的下一个安全检查点注入并重新采样；后续排队在当前 run 静止后作为新 turn 执行](/content-assets/tech-series/tech-series-编码-agent-的运行中输入调度-中断-引导与排队/a1ade0b992.svg)

_图 1 · 三种运行中输入语义。同一条新输入 x，在硬中断下取消当前 turn（可能丢弃未提交输出、且不回滚已发生副作用）；在边界引导下于下一个安全检查点 B 注入、并要求 Agent 基于已发生状态重新规划；在后续排队下则等 run A 静止后作为全新 turn B 执行。这是一张概念图。_

### 2.1 硬中断（interrupt）

硬中断的目标是取消当前活动操作或 turn：触发 cancellation token / abort controller，停止当前模型流、工具或 Agent Run，清理状态并返回可输入状态。它优先级最高，可能丢弃未提交的模型输出；但**不保证回滚已经发生的文件、网络或进程副作用**；需要工具与子进程支持协作式取消，或由运行时强制终止（`I`，此为通用并发语义归纳）。

### 2.2 边界引导（steer）

Steer 在运行期间接收新指令，但不把整个会话视作一个已经结束的旧任务。其本质是：**在当前 run 的下一个可重入决策点，把新输入加入模型可见上下文，并要求 Agent 基于已发生的状态重新规划。** 它一般**不能修改已经提交给推理服务器的单次 prompt**，也不能把用户输入插进正在生成的第 N 个 token；它改变的是**下一次模型采样**（`I`）。

### 2.3 后续排队（follow-up queue）

Queue 保存新输入，但不改变当前 run：run A 执行期间到达的新输入 B 进入队列，等 run A 到达静止状态后再启动 run B。它对应“完成当前工作后再做另一件事”，语义与“立即纠正当前方向”截然不同。把两者混成一个模糊的“队列”，就无法表达用户究竟想纠偏还是追加（`I`）。

## 3\. 形式化模型：安全检查点与延迟

### 3.1 安全检查点与 L\_steer

把一个活动 Agent Run 记为离散序列 `R = {M1, T1, M2, T2, ..., Mn}`，其中 `Mi` 是第 i 次模型采样，`Ti` 是模型返回后的一批工具执行，`Bi` 是模型调用、工具批次、等待状态或审批状态之间的**安全边界**。新输入 x 在时刻 t 到达时，steer 的实际生效时点通常是**大于 t 的最近一个边界**，即 `t_effective = min{ Bi | Bi > t }`。

因此体验延迟可近似分解为三项：`L_steer = L_ingress + L_checkpoint + L_replan`——其中 `L_ingress` 是输入进入运行时队列的延迟，`L_checkpoint` 是等待下一个安全检查点的时间，`L_replan` 是重建上下文并拿到下一次模型响应的时间。在本地 CLI 中 ingress 往往很小，决定体验的主要是 checkpoint：若当前状态是可唤醒等待，延迟可接近即时；若当前是不可中断的长命令，延迟可能接近该命令的剩余时间。

![安全检查点时间线：新输入在时刻 t 到达，落在下一个安全边界 B；L\_steer 分解为 ingress、checkpoint、replan 三段；可唤醒的等待型工具让 checkpoint 段坍缩到近乎零](/content-assets/tech-series/tech-series-编码-agent-的运行中输入调度-中断-引导与排队/3ee7af2547.svg)

_图 2 · 安全检查点时间线。新输入 x 在 T1 执行期间（时刻 t）到达，被路由到下一个安全边界 B 才注入并重新采样；`L_steer` 由 ingress + checkpoint + replan 组成，本地 CLI 里 checkpoint 通常主导。底部绿条说明：可唤醒等待（如 Codex 的 `sleep` / `wait_agent`，用 `tokio::select!` 同时监听计时与 input activity）让 checkpoint 段坍缩，这正是 Codex “感觉更快”的机制来源。这是一张概念图。_

### 3.2 四个运行时平面

一个可靠的输入调度系统至少包含四个相互独立的平面（`I`，本文提出的分析框架）：

| 平面 | 职责 |
| --- | --- |
| 数据面 | 保存 steer、queue、附件、客户端消息 ID 与顺序 |
| 控制面 | 通知活动任务有新输入，触发唤醒或取消 |
| 历史面 | 决定何时把新输入写入模型可见对话历史 |
| 副作用面 | 跟踪工具、进程、文件、网络操作是否已发生、是否可取消或补偿 |

很多“看起来像 steer”的实现只做了数据面排队；真正快速的 steer 通常还需要控制面通知与高频安全检查点。

## 4\. 总览比较矩阵

下表与下图给出五个系统的横向比较。核心结论：Codex 与 Pi 都**显式区分** steer 与 follow-up，而不是用一个模糊的“队列”覆盖两种意图；OpenCode V2 已从串行队列演化为显式的 `steer | queue` 持久化交付模型；Claude Code 的官方语义是可运行中纠偏（steer），但其内部运行时不开源。

| 系统/运行时 | Steer | 独立 Follow-up | Interrupt | Steer 交付边界 | 改正在进行的单次推理 | 状态持久化 |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | 是 | 是 | 是 | 同一活动 turn 的下一次模型采样前 | 否 | 会话历史持久；pending steer 主要为活动 turn 态 |
| Claude Code | 是（官方明确） | 未公开对等模式 | 是 | 未公开（官方仅说“停止并调整”） | 无证据表明可以 | 内部运行时未开源 |
| OpenCode 现行 | 未见同 run steer | 是（串行 queue） | 是 | 当前普通 turn 完成后 | 否 | 本地队列；应用层可持久 |
| OpenCode V2 Beta | 是 | 是 | 是 | 下一 safe provider-turn boundary | 否 | 是（durable admission inbox） |
| Pi | 是 | 是 | 是 | 工具调用完成后、下一次 LLM 调用前 | 否 | 消息进会话历史后持久 |

![五个系统的运行中输入调度比较矩阵：Codex、Claude Code、OpenCode 现行、OpenCode V2、Pi 在 steer、follow-up、interrupt、交付边界、是否改在途推理、持久化六列上的对比](/content-assets/tech-series/tech-series-编码-agent-的运行中输入调度-中断-引导与排队/e76aec8732.svg)

_图 3 · 比较矩阵。✓ 支持、✕ 无或未见、? 未公开或不可验证。一个贯穿全表的事实：没有任何系统能改写已经开始的单次 LLM token 流；所谓“快”都来自结束或唤醒当前步骤并重新采样。这是一张概念图。_

## 5\. Codex：显式三分输入模型

### 5.1 Agent Loop 与采样边界

OpenAI 对 Codex Harness 的公开说明显示，一个用户 turn 可以包含多次“模型推理—工具调用—工具结果—再次推理”的循环 `B1`。因而一个长任务不是单个不可分割请求，而是一串离散决策点：

```text
用户初始输入 → M1 → tool call → T1 → M2 → tool call → T2 → M3 / 最终消息
```

Steer 的实现空间正来自这些重复出现的采样边界。Codex TUI 的输入流程明确区分了几类意图：`InputResult::Submitted`（可在 turn 运行时立即提交，成为当前 turn 的 steer）、`InputResult::Queued`（进入 `queued_user_messages`，只在空闲时自动发送，成为下一 turn）、`pending_steers`（已提交到 Core、尚未在历史中确认的引导）、`rejected_steers_queue`（因当前 turn 不可 steer 而被拒、需后续重试的输入）`A1`。这说明 Codex 不是维护一个 FIFO，而是把用户意图分成不同状态。

### 5.2 协议层：turn/steer 与 expectedTurnId

Codex App Server 把 steer 暴露为独立请求，而不是复用普通 `turn/start` `A1`：

```json
{
  "method": "turn/steer",
  "params": {
    "threadId": "thread-id",
    "expectedTurnId": "active-turn-id",
    "input": [{ "type": "text", "text": "停止重构 service，改为检查 middleware" }]
  }
}
```

处理器会校验：thread 是否存在、当前是否有活动 turn、`expectedTurnId` 是否与当前活动 turn 一致、turn 类型是否可 steer、输入是否为空或超长 `A1`。其中 `expectedTurnId` 是关键的**因果保护**：没有它，网络延迟或 UI 状态滞后可能让一条纠偏指令错误地进入另一个已经开始的任务。

### 5.3 状态层：turn-local pending input

Codex Core 定义了 turn 输入的类型，并让每个活动 turn 维护自己的 pending input：

```rust
enum TurnInput {
    UserInput { /* ... */ },
    ResponseItem(/* ... */),
    InterAgentCommunication(/* ... */),
}
```

`InputQueue` 同时维护 turn-local pending input、session-level mailbox、`InputQueueActivity::{Mailbox, Steer}` 状态、Tokio `watch` 通知通道与异步互斥 `A1`。steer 到达时的核心操作可抽象为两行——一行属于数据面，一行属于控制面：

```rust
turn_state.pending_input.items.extend(new_input);   // 数据面：入队
activity_tx.send_replace(InputQueueActivity::Steer); // 控制面：通知
```

`run_turn` 在循环中决定是否 drain pending input：允许时先从活动 turn 取出 pending input、跑输入 hook、记为模型可见对话项、重建采样请求、再发起下一次 Responses API 请求 `A1`。因此 steer 的准确语义是：**输入可在模型或工具工作期间被异步接收，但只在下一次模型请求构造前才成为 prompt 的一部分。** 每次采样后 Codex 计算 `needs_follow_up = model_needs_follow_up OR has_pending_input`——即便模型已准备给出阶段性最终消息，只要此时有 pending input，活动任务仍会在**同一 turn 内**继续，而非必然新建一个用户 turn `A1`。

### 5.4 唤醒等待：sleep 与 wait\_agent

Codex 体验上“立即停下来重新思考”的最直接证据，是它的等待型工具不是被动等待，而是可被 steer 信号唤醒。`sleep` 工具通过 `tokio::select!` 同时等待“睡眠计时结束”与“input activity channel 变化”，新输入到达时可提前返回，并向模型提供 `Sleep interrupted by new input.` `A1`。`wait_agent` 也订阅相同活动信号，区分 `MailboxActivity`、`Steered`、`TimedOut`；steer 到达后等待工具返回 “Wait interrupted by new input”，随后下一次模型请求即包含 steer `A1` `A2`。**某些原本可能持续数秒到数分钟的等待，因此可以立即结束。**

### 5.5 不可夸大的部分

Codex 的 steer 不代表所有操作都能即时取消（`I`，基于源码边界的谨慎归纳）：已开始的单次模型推理通常不会被改写输入；普通 shell 子进程能否终止取决于执行器与取消路径；已完成的文件写入不会自动回滚；网络请求、包安装、外部系统操作可能已产生副作用；`review`、`compact` 等 turn 类型可能明确不可 steer。因此必须区分两种操作：steer 是“保留已完成的结果，但下一步改走另一条路线”；interrupt 是“立即停止当前活动操作，接受可能需要清理或重试”。

## 6\. Claude Code：用户语义明确，内部 Harness 不透明

### 6.1 当前官方语义与 changelog

Claude Code 官方“工作原理”文档明确写明：用户可以在 Claude 走错方向时直接输入纠正并按 Enter，Claude 会停止正在做的事情、并根据输入调整方法 `B1`。变更日志进一步显示了这项能力的演化 `B2`：`0.2.75` 支持运行期间按 Enter 排入额外消息；`0.2.108` 支持在 Claude 工作期间发送消息进行实时 steer；`1.0.84` 修复任务收尾时有时忽略实时 steering；`2.0.68` 修复子 Agent 工作时 steering message 丢失；后续版本持续修复 queued message、附件、multi-tool turn 与 interrupt 后队列推进问题。

这说明 Claude Code 内部确实存在“运行中消息的暂存/排队表示”，但这些 queued message 的用户语义可以是**当前 run 的 steer**，并不必然等于“完成当前任务后才执行的 follow-up queue”。

### 6.2 可验证与不可验证边界

可验证的事实包括：`Enter` 是聊天提交、`Ctrl+C` 取消当前操作、`Escape` 取消当前输入，官方文档把运行中纠正描述为 “interrupt and steer” `B1`。**不可验证**的事实包括：是否使用 turn-local queue；是否用 event channel 或 cancellation token 唤醒工具；steering message 何时正式写入 transcript；哪些工具可协作式取消；是否存在与 Codex `expectedTurnId` 对等的公开因果校验。Claude Code 主仓库主要公开发行信息与问题跟踪，不提供完整 Agent Runtime 源码 `C1`，因此本文不对其内部数据结构作确定性描述。

用户之所以可能观察到“等待当前任务结束”，可能来自：当前工具或外部进程不能被新输入直接终止；新输入只能在工具结果返回或模型流结束时注入；当前跑的是子 Agent，父会话需等子 Agent 边界；特定版本存在 steer 丢失或收尾忽略；CLI、Desktop、IDE、Remote Control 输入路由不同；或 UI 把 pending steer 显示为 queued message 造成语义误读（`I`）。用户观察是有效的体验证据，但不能据此断言 Claude Code “只支持下一 turn 队列”。

### 6.3 独立 follow-up queue 的现状

官方仓库 issue #50246 请求增加一个与当前 interrupt/steer 行为并列的 “message queue mode”，让 Claude 先完成当前任务、再自动处理后续消息；该问题截至 2026-08-03 仍为 open `C1`。这支持一个谨慎结论：**Claude Code 当前公开产品语义强调运行中 steer；尚未通过公开文档确认存在一个像 Codex/Pi 那样可由用户显式选择、并保证在当前 run 静止后才交付的独立 follow-up 模式。** 这是证据边界，不是产品缺陷判断。

## 7\. OpenCode：从串行队列到持久化双交付模式

OpenCode 的结论必须按运行时版本拆分；忽略版本分层会得到错误结论。

### 7.1 现行 direct interactive：串行 queue

现行 `packages/opencode/src/cli/cmd/run/runtime.queue.ts` 把自身描述为 “Serial prompt queue for direct interactive mode” `A1`。其行为是典型的 follow-up queue：用户输入普通 prompt；若已有普通 turn 活动，新 prompt 进入本地队列；队列项在 turn 开始前可显示、编辑或移除；`drain()` 等待当前 `input.run(...)` 完成后再发下一条。

```text
Active turn ──┬─ prompt B → local queue
              └─ prompt C → local queue
turn complete → send B → send C
```

App 层的 prompt submit 逻辑（`shouldQueue` / `onQueue` / `FollowupDraft` / `sendFollowupDraft` / `onAbort`）与 session 页面的 `followup.items` / `failed` / `paused` / `edit` 让队列具有可见性与可恢复性：session busy 且启用 queue 时输入被存为 follow-up，不再 busy 时取第一条发送，队列项可编辑、删除、失败后重试 `A1`。但它仍属于“当前 run 完成后处理”。

### 7.2 V2 Beta：steer | queue 与 durable inbox

V2 的 schema 明确定义交付模式 `Delivery = "steer" | "queue"` `A1`。每个新输入先进入 durable `session_input` admission inbox，带上 `admittedSeq`、message ID、session ID、prompt、delivery mode、creation time 与可选 `promotedSeq`。输入被 admit 后**尚未**立即成为模型历史；只有 runner 发布 `Prompted` 并完成 promotion，它才进入模型可见 Session history。`SessionInput` 提供 `promoteSteers(...)`（按 durable admission sequence 批量提升 steer）、`promoteNextQueued(...)`（FIFO 提升一条 queue）、`hasPending(...)` `A1`。Runner 的核心循环可概括为：

```ts
promotion = hasSteer ? "steer" : hasQueue ? "queue" : undefined
while (shouldRun) {
  while (needsContinuation) {
    runTurn(sessionID, promotion, step)
    promotion = "steer"
    if (!needsContinuation) needsContinuation = hasPending("steer")
  }
  shouldRun = hasPending("queue")
  promotion = shouldRun ? "queue" : undefined
}
```

规范规定：`steer` 在下一安全 provider-turn boundary 被提升、可在当前 drain 内触发继续执行；`queue` 在当前 drain 不再需要 continuation 时 FIFO 一次提升一条；多个 steer 在同一边界按 durable admission order 合并；interrupt 停止当前进程内执行、但不删除 durable inbox `A1` `B1`。runner 还会在副作用开始前持久记录 tool call、eager 启动本地 tool fibers、等待已启动工具结算、对中断或遗留 running 工具写失败状态、重载 durable history 后再继续下一 provider turn `A1`。因此 V2 的 steer 主要作用于 **provider-turn 安全边界**，不等于“新输入一到、任意工具进程立刻被杀死”。

### 7.3 V1 与 V2 的差异

| 维度 | 现行 direct interactive | V2 Beta |
| --- | --- | --- |
| 输入模式 | 串行普通 prompt queue | `steer \| queue` |
| 队列位置 | 进程 / UI 本地 | durable session inbox |
| Steer | 未在该路径发现 | 明确支持 |
| 排队提升 | 当前 run 完成后 | 当前 drain 静止后 FIFO 单条 |
| 因果顺序 | 内存队列顺序 | durable event sequence |
| 崩溃恢复 | 取决于前端状态 | inbox 可重放；provider dispatch 歧义恢复仍是已知限制 |
| 成熟度 | 当前产品路径 | Beta，API 与行为可能变化 |

## 8\. Pi：显式 Steer/Follow-up 双队列

Pi 官方文档把交互分得很清楚：`Enter` 提交 steering message、`Alt+Enter` 提交 follow-up message、`Escape` abort 并把排队消息恢复到编辑器、`Alt+Up` 从队列取回消息编辑 `B1`。RPC 模式也分别暴露 `{"type":"steer",...}`、`{"type":"follow_up",...}` 与 `{"type":"abort"}` `B1`。

实现上，Pi Harness 维护两个独立队列与各自的交付模式（默认均为 `one-at-a-time`，也可配置一次交付全部）`A1` `B1`：

```ts
steerQueue: UserMessage[]
followUpQueue: UserMessage[]
steeringQueueMode: "all" | "one-at-a-time"
followUpQueueMode: "all" | "one-at-a-time"
```

`steer()` 与 `followUp()` 分别写入不同队列并发布 `queue_update` `A1`。Pi 的 `runLoop` 用内外两层循环把两种语义彻底分离——外层在 Agent 即将停止时检查 follow-up，内层处理工具调用、读取 steering message 并在下一次 assistant response 前注入：

```ts
pendingMessages = getSteeringMessages()
while (true) {
  while (hasMoreToolCalls || pendingMessages.length > 0) {
    inject(pendingMessages)
    message = streamAssistantResponse()
    executeToolCalls(message)
    pendingMessages = getSteeringMessages()
  }
  followUps = getFollowUpMessages()
  if (followUps.length > 0) { pendingMessages = followUps; continue }
  break
}
```

官方 latest 文档把 steer 定义为“在当前 assistant turn 完成其工具调用后、下一次 LLM 调用前交付” `B1`：即不修改正在生成的 assistant response、通常等当前工具批次完成、下一次 LLM 调用看到 steer、follow-up 只有在没有更多工具调用或 steering message 时才交付。Pi 0.32.0 的发布说明曾把它概括为“当前工具完成后中断 mid-run” `B2`；结合当前 Agent Loop 源码，最稳妥的解释是：**它在工具/assistant-turn 边界抢占后续规划，而非保证强制终止任意正在执行的工具**（`I`）。

## 9\. 为什么 Codex 的 Steer 主观上更快

Queue 模式通常要经历“当前 turn 完成 → 写入最终状态 → UI 收到完成事件 → 队列出队 → 创建新 turn → 模型重新读取上下文”一整串状态转换；Codex steer 则可以在“当前步骤结束或被唤醒 → pending input 进入当前历史 → 同一活动 turn 发起下一次采样”里完成，省掉了完成—重启之间的额外转换（`I`，基于第 5 节源码）。

更快还来自三个机制：其一，**控制面通知避免轮询**——Codex 用 `watch` 通道发布 activity，对订阅者而言新输入是一个可等待事件 `wait(tool completion, input activity)`，而不是 `sleep(固定时间) → 检查队列 → 再 sleep` 的被动轮询，这降低了可唤醒状态下的尾延迟 `A1`。其二，**可中断等待工具**——`wait_agent` 与 `sleep` 的提前返回让原本数秒到数分钟的等待立即结束，对用户就像 Agent “听见了”新指令 `A1`。其三，**上下文连续性**——下一次采样天然包含原始任务、已完成推理与工具调用、已产生的工具结果、新 steer 与当前环境状态，模型不必从零分析，而是在当前执行轨迹上重新规划，因此常能迅速回答“明白，停止修改 A，改检查 B”。

需要强调：`L_checkpoint` 随当前状态变化很大（可唤醒等待 → activity 到达即唤醒；模型流即将结束 → 等当前 response 完成再采样；短工具 → 等工具返回；长外部 shell → 可能等待、轮询或需显式 interrupt；已进入不可 steer turn → steer 被拒转恢复/队列）。所以“steer 很快”不是常数性能保证，而是运行时为大量状态设计了较短的安全边界（`I`）。

## 10\. 中断不等于回滚：副作用面

必须区分四种“长任务”对 steer 的响应能力（`I`）：由多次短模型/工具步骤组成的长 Agent Run，通常能在最近边界调整；可唤醒等待，能接近立即结束；单个长模型推理流，通常只能取消或等待完成、不能热改 prompt；单个长外部进程，取决于子进程管理，steer 本身不等于 kill。

更关键的是：**即使进程被终止，也可能已经发生文件部分写入、数据库迁移部分执行、依赖锁文件修改、网络请求已发送、Git 工作区处于中间状态、子 Agent 已提交独立结果。** 因此成熟 Harness 应维护副作用记录，让每个 ToolCall 走过 `admitted → started → side_effect_started → completed / failed / interrupted → compensating_action?` 的生命周期。OpenCode V2 对 tool call 的 durable settlement 是这一方向的实例；Codex 则通过 turn item、工具结果与中断生命周期维持对话一致性 `A1`。绝不应向用户暗示 steer 会自动撤销已发生的操作。

## 11\. 给 Agent Harness 设计者的建议

综合以上机制，给想实现类似能力的运行时几条建议（`I`）：

第一，**提供三种一等公民操作**，别只给一个含糊的 `sendMessage()` 让前端猜测：

```ts
steer(message, expectedTurnId?)   // 纠偏当前 run
enqueue(message)                  // 追加下一个 run
interrupt(turnId?)                // 取消当前活动操作
```

第二，**分离数据面与控制面**：`pendingSteers.push(message)` 之外必须有 `activity.notify("steer")`——只有队列没有通知会增加响应延迟，只有取消信号没有消息保存会丢上下文。第三，**定义可协作取消协议**：工具接口接收 `AbortSignal`，等待型工具用事件竞争 `race(toolCompletion, steerActivity, hardInterrupt)`，并明确区分“提前返回并重新规划（steer）”与“取消当前操作（interrupt）”。第四，**建立安全检查点**：推荐在模型流结束、单个顺序工具完成、并行工具批次完成、等待/轮询事件到达、审批完成、子 Agent 汇报、自动压缩前后、最终消息提交前设点——检查点过少会让 steer 迟钝，过多会破坏工具协议、增加竞态与上下文不一致。

第五，**用 turn identity 与客户端消息 ID** 记录 thread/session ID、active turn ID、client message ID、admission sequence、delivery mode、accepted/promoted 时间戳，以便拒绝过期 steer、去重重试、解释输入去向。第六，**队列 UI 应显示状态**（draft / accepted / pending-steer / queued-follow-up / promoted / rejected / canceled / failed）并支持编辑、删除、改交付模式、重发与查看目标 turn。第七，**建立副作用账本**（调用参数、起止时间、是否可取消、子进程 PID、修改文件集合、网络目标、完成/失败/中断、是否有补偿操作）。第八，**测试覆盖并发竞态**：steer 在模型 reasoning / 单工具 / 并行工具期间到达、steer 与 turn completion 同时发生、queue 与 steer 交错、interrupt 后 pending steer 恢复、stale turn ID、子 Agent 等待期间 steer、自动压缩期间 steer、网络重试导致重复消息、进程崩溃后 durable inbox 恢复——Codex 的 pending input 测试与 OpenCode V2 的 durable promotion 测试都提供了可借鉴方向 `A2`。

## 12\. 局限性

一，Claude Code 核心运行时未完整开源，本文无法验证其内部队列与取消机制 `C1`。二，Codex、OpenCode、Pi 主分支持续变化，commit 快照不代表未来版本。三，OpenCode V2 为 Beta，与当前稳定 CLI/TUI 的部署比例和默认行为可能不同。四，不同模型提供商的流式 API、工具调用协议与取消支持会影响实际延迟。五，终端、Desktop、IDE、Remote Control、SDK 可能使用不同输入路由。六，本文没有在统一硬件、网络与任务集下做定量延迟基准，所有“快/慢”结论均为机制分析。七，工具“被中断”与外部副作用“被回滚”是不同问题，本文只分析前者的调度条件。

## 13\. 结论

运行中输入处理不是一个文本框功能，而是 Agent Runtime 的核心并发协议。一个真正的 steer 机制至少需要**异步输入接收 + 当前 run 的 pending input + 安全检查点 + 下一次采样前历史注入**；若要体验接近“立即响应”，还需要**控制面通知 + 可唤醒等待 + 协作式取消 + 高频工具/模型边界**。

Codex 当前公开实现最完整地展示了这一组合：协议层 `turn/steer`、turn identity 校验、Core pending queue、Tokio activity 通道、同一 turn 内继续采样、等待型工具提前唤醒，共同形成快速纠偏体验。Pi 以更小而清晰的双队列内外两层 Agent Loop 分离 steer 与 follow-up；OpenCode V2 把该模型推进到持久化 admission/promotion；Claude Code 提供明确的实时 steer 用户语义，但内部 Harness 仍是黑箱。最终，最佳实践不是追求“任何时刻都能修改正在推理的模型”，而是设计一个可解释、可审计且副作用安全的边界调度系统，让用户输入在**尽可能早、且仍然一致的决策点**生效。

## 14\. 与本系列的连接

把这项比较放回本系列会更立体（`I`）：

-   **对照《Pi Agent Runtime》（`/pi-agent-runtime`）**：本文对 Pi 双队列与内外两层循环的拆解，正是那篇文章所描述的 `agent-harness` 层职责（队列、快照、压缩、持久化）在“运行中输入”这一具体问题上的落地——`steerQueue` / `followUpQueue` 就活在 Harness 边界上。想看 Pi 的整体四层架构，从那篇读起最顺。
-   **对照《AI Harness 深解》（`/ai-harness-deep-dive`）**：那篇讲“harness 是 agent loop 外面那层确定性外壳”，而本文讨论的 steer / queue / interrupt 调度，恰恰就是这层外壳最吃并发正确性的部分——安全检查点、协作式取消、副作用账本都是 harness 的职责，而不是模型的能力。两篇合起来，一篇讲外壳“是什么”，一篇讲外壳“如何调度实时输入”。

## 15\. 来源

主仓库源代码、测试、官方文档、变更日志与问题跟踪器（编号对应文末台账 `docs/research/coding-agent-input-scheduling-sources.md`）：

1.  OpenAI · _Unrolling the Codex agent loop_（2026-01-23）—— [https://openai.com/index/unrolling-the-codex-agent-loop/](https://openai.com/index/unrolling-the-codex-agent-loop/)
2.  Codex 源码 `codex-rs/core/src/session/input_queue.rs` —— [https://github.com/openai/codex/blob/main/codex-rs/core/src/session/input\_queue.rs](https://github.com/openai/codex/blob/main/codex-rs/core/src/session/input_queue.rs)
3.  Codex 源码 `codex-rs/core/src/session/turn.rs`；4. `codex-rs/core/src/tasks/regular.rs`；5. `codex-rs/app-server/src/request_processors/turn_processor.rs`；6–7. TUI `input_flow.rs` / `input_submission.rs`；8–9. 工具 `sleep.rs` / `multi_agents_v2/wait.rs`；10. 测试 `tests/suite/pending_input.rs` —— 均见 [https://github.com/openai/codex](https://github.com/openai/codex)
4.  Anthropic · _How Claude Code works（Interrupt and steer）_ —— [https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)
5.  Anthropic · _Claude Code changelog_ —— [https://code.claude.com/docs/en/changelog](https://code.claude.com/docs/en/changelog)；13. _Keybindings_ —— [https://code.claude.com/docs/en/keybindings](https://code.claude.com/docs/en/keybindings)
6.  Claude Code issue #50246 · _Message queue mode_（open） —— [https://github.com/anthropics/claude-code/issues/50246](https://github.com/anthropics/claude-code/issues/50246)
7.  OpenCode `runtime.queue.ts`；16. `prompt-input/submit.ts`；17. `pages/session.tsx`；18. V2 `session/input.ts` 与 `schema/session-delivery.ts`；19. V2 `session/runner/llm.ts`；20. V2 规范 `specs/v2/session.md`；21. _V2 Compaction_ —— 均见 [https://github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) 与 [https://opencode.ai/v2/docs/compaction](https://opencode.ai/v2/docs/compaction)
8.  Pi · _Using Pi（Message Queue）_ —— [https://pi.dev/docs/latest/usage](https://pi.dev/docs/latest/usage)；23. _RPC Mode_ —— [https://pi.dev/docs/latest/rpc](https://pi.dev/docs/latest/rpc)；24. `packages/agent/src/agent-loop.ts`；25. `packages/agent/src/harness/agent-harness.ts`；26. _Settings（Message Delivery）_ —— [https://pi.dev/docs/latest/settings](https://pi.dev/docs/latest/settings)；27. _Release 0.32.0_ —— [https://pi.dev/news/releases/0.32.0](https://pi.dev/news/releases/0.32.0)

_注：三张 SVG 概念图为本站原创生成（`scripts/gen_scheduling_charts.py`）；本文为源代码与官方文档驱动的比较研究报告，非任一仓库文档的逐字转载。完整参考编号 \[1\]–\[27\]、证据分级与已知局限见 `docs/research/coding-agent-input-scheduling-sources.md`。_
