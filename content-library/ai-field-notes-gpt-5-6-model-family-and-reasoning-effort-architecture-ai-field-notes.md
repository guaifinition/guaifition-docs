**A public-evidence deep research report on Sol, Terra, Luna, reasoning effort, Pro mode, and Ultra/multi-agent execution**

> **中文译文**
> 
> **关于 Sol、Terra、Luna、推理强度、Pro 模式与 Ultra/多代理执行的公开证据深度研究报告**

Research date: 23 July 2026 Primary language order: English analytical paragraph, followed by Simplified Chinese translation.

研究日期： 2026 年 7 月 23 日 主要排版顺序： 英文分析段落在前，对应的简体中文译文在后。

* * *

## Abstract  
摘要

This report reconstructs the publicly observable architecture of the GPT-5.6 family. It distinguishes three model tiers—Sol, Terra, and Luna—from the single-agent `reasoning.effort` control and from execution modes such as `pro` and multi-agent orchestration. The central conclusion is that model tier, reasoning effort, and execution topology are independent control dimensions. Public sources describe interfaces, token accounting, tool orchestration, safety layers, and benchmark behavior, but they do not disclose parameter counts, layer counts, hidden dimensions, attention layout, expert routing, or whether each model is dense or Mixture-of-Experts.

> **中文译文**
> 
> 本报告基于公开证据重建 GPT-5.6 模型家族可观察到的系统架构。报告将 Sol、Terra、Luna 三种模型规格，与单代理的 `reasoning.effort` 推理强度控制，以及 `pro`、多代理编排等执行模式严格区分。核心结论是：模型规格、推理强度与执行拓扑是三个彼此独立的控制维度。公开资料披露了接口、token 计量、工具编排、安全层和基准行为，但没有公开参数量、层数、隐藏维度、注意力布局、专家路由，也没有说明各规格采用稠密模型还是 Mixture-of-Experts（MoE）结构。\[O1\]\[O3\]\[O4\]\[O5\]\[O6\]\[O7\]\[O8\]

The report therefore uses four evidence grades: **A** for explicit OpenAI statements; **B** for directly observable API contracts and accounting behavior; **C** for mechanisms demonstrated in independent primary research; and **D** for architectural inference. Grade D statements are hypotheses, not claims about undisclosed OpenAI internals.

> **中文译文**
> 
> 因此，本报告采用四级证据体系：**A 级**表示 OpenAI 明确披露的事实；**B 级**表示可由 API 契约与计量行为直接验证的事实；**C 级**表示独立一手研究已经验证的通用机制；**D 级**表示架构推断。D 级内容仅为假设，不代表对 OpenAI 未公开内部实现的事实性断言。

* * *

## 1\. Terminology correction: the controls are not one linear ladder  
1\. 术语澄清：这些控制项不是一条线性阶梯

The phrase “low, mid, high, max, ultra” combines controls from different product surfaces. In the API, the official parameter value is `medium`, not `mid`, and GPT-5.6 supports `none`, `low`, `medium`, `high`, `xhigh`, and `max`. In standard ChatGPT conversations, the user-facing options are simplified: Medium, High, and Extra High use GPT-5.6 Sol, while Instant remains GPT-5.5 Instant. Ultra is not a seventh single-agent reasoning effort; it is a multi-agent setting that coordinates four agents by default. Pro is another independent execution mode that performs more model work and can be combined with a selected effort.

> **中文译文**
> 
> “low、mid、high、max、ultra”这一说法混合了不同产品界面的控制项。API 中的正式参数值是 `medium`，而不是 `mid`；GPT-5.6 支持 `none`、`low`、`medium`、`high`、`xhigh` 和 `max`。在标准 ChatGPT 对话中，面向用户的选项经过简化：Medium、High 和 Extra High 由 GPT-5.6 Sol 提供，而 Instant 仍由 GPT-5.5 Instant 提供。Ultra 不是第七档单代理推理强度，而是默认协调四个代理的多代理设置。Pro 则是另一个独立执行模式，它会执行更多模型工作，并且可以与所选推理强度组合使用。\[O1\]\[O2\]\[O3\]\[O4\]\[O5\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/33116384bc.svg)

**Figure 1. Three independent control axes.**

> **图 1：三个彼此独立的控制轴。**

### 1.1 Product-surface mapping  
1.1 产品界面映射

| Surface 产品界面 | Model choice 模型选择 | Reasoning control 推理控制 | Execution topology 执行拓扑 |
| --- | --- | --- | --- |
| OpenAI API | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` | `none`, `low`, `medium`, `high`, `xhigh`, `max` | `standard`, `pro`; multi-agent beta |
| Standard ChatGPT | GPT-5.5 Instant; GPT-5.6 Sol; GPT-5.6 Sol Pro | Instant, Medium, High, Extra High | Single-agent product path; Pro option |
| ChatGPT Work Codex | Sol, Terra, Luna | User-selectable effort, including `max` where available | `ultra` on eligible plans/products |

The supplied Sebastian Raschka article correctly identifies the three GPT-5.6 sizes and the existence of several effort settings. Its statement that Ultra is approximately similar to Max in effort should be treated as secondary interpretation. OpenAI confirms the four-agent default and the higher token use, but does not publicly define Ultra as “Max plus four agents” or disclose the per-agent effort configuration.

> **中文译文**
> 
> 用户提供的 Sebastian Raschka 文章正确指出了 GPT-5.6 的三种规格以及多档推理强度设置。文章将 Ultra 描述为与 Max 大致相近的推理强度，这应视为二手解释。OpenAI 明确确认 Ultra 默认使用四个代理，并会消耗更多 token，但没有公开将 Ultra 定义为“Max 加四个代理”，也没有披露每个子代理实际采用的推理强度。\[O1\]\[O5\]\[SRC\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/d32f71ea3d.jpg)

**Figure 2. Context figure from the user-supplied article. It is retained as secondary framing, not as an official architecture specification.**

> **图 2：来自用户所提供文章的背景图。该图仅作为二手研究框架保留，不视为官方架构规范。**

* * *

## 2\. The three GPT-5.6 model tiers  
2\. GPT-5.6 的三个模型规格

OpenAI describes Sol as the frontier tier, Terra as the balanced intelligence-cost tier, and Luna as the cost-sensitive high-volume tier. The model pages state that these roughly correspond to the unsuffixed/full, mini, and nano tiers used in earlier GPT-5 families. This is a capability-tier analogy, not a disclosure of physical parameter scale.

> **中文译文**
> 
> OpenAI 将 Sol 定位为前沿旗舰规格，将 Terra 定位为能力与成本均衡的规格，将 Luna 定位为面向成本敏感和高吞吐工作负载的规格。模型页面说明，它们大致对应早期 GPT-5 家族中的无后缀/完整规格、mini 规格和 nano 规格。这只是能力层级的类比，并不等于物理参数规模的披露。\[O1\]\[O6\]\[O7\]\[O8\]

| Property 属性 | GPT-5.6 Sol | GPT-5.6 Terra | GPT-5.6 Luna |
| --- | --- | --- | --- |
| Model ID | `gpt-5.6-sol` | `gpt-5.6-terra` | `gpt-5.6-luna` |
| Alias | `gpt-5.6` routes here | None stated | None stated |
| Public tier analogy | Full unsuffixed | Mini-like | Nano-like |
| Positioning | Frontier professional work | Intelligence-cost balance | High-volume, lowest family cost |
| Input price 1M tokens | $5.00 | $2.50 | $1.00 |
| Cached input 1M tokens | $0.50 | $0.25 | $0.10 |
| Output price 1M tokens | $30.00 | $15.00 | $6.00 |
| Context window | 1,050,000 | 1,050,000 | 1,050,000 |
| Maximum output | 128,000 | 128,000 | 128,000 |
| Knowledge cutoff | 16 Feb 2026 | 16 Feb 2026 | 16 Feb 2026 |
| Input modalities | Text, image | Text, image | Text, image |
| Output modalities | Text | Text | Text |
| Reasoning efforts | none–max | none–max | none–max |
| Fine-tuning | Not supported | Not supported | Not supported |
| Responses tools | Web/file search, image generation, code interpreter, shell, patching, skills, computer use, MCP, tool search | Same documented set | Same documented set |

The identical context window, maximum output, modalities, and tool surface do not imply identical model architecture. They indicate a normalized serving contract. A smaller model can be exposed through the same API envelope while using a different checkpoint, capacity, routing configuration, quantization policy, or serving topology. None of those physical details are publicly specified for GPT-5.6.

> **中文译文**
> 
> 三种规格具有相同的上下文窗口、最大输出、模态与工具接口，并不意味着它们拥有相同的模型结构。这些一致性仅说明 OpenAI 提供了标准化的服务契约。较小模型完全可以在相同 API 封装下使用不同的 checkpoint、容量、路由配置、量化策略或服务拓扑。GPT-5.6 的公开资料没有披露这些物理实现细节。\[O6\]\[O7\]\[O8\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/e5cba211cd.png)

**Figure 3. API token prices. Reasoning tokens are billed at the output-token rate.**

> **图 3：API token 价格。推理 token 按输出 token 费率计费。**

* * *

## 3\. What is known—and unknown—about the model structure  
3\. 关于模型结构：已知与未知

The strongest verified structural statement is that GPT-5.6 belongs to OpenAI’s reasoning-model family: it generates internal reasoning tokens before or between actions, was trained through reinforcement learning to improve reasoning behavior, and can plan, use tools, inspect alternatives, recover from ambiguity, and revise. The system card states that reasoning models learn to refine their thinking, try different strategies, and recognize mistakes.

> **中文译文**
> 
> 关于 GPT-5.6 结构，公开资料中最强的可验证结论是：它属于 OpenAI 的推理模型家族，会在输出或执行动作之前、以及动作之间生成内部推理 token；它通过强化学习训练以改善推理行为，并能够规划、使用工具、检查替代方案、从歧义中恢复以及修订方案。系统卡还说明，推理模型会学习改进思考过程、尝试不同策略并识别错误。\[O4\]\[O9\]\[O10\]

OpenAI has not published the parameter count, number of Transformer blocks, hidden dimension, attention-head count, tokenizer vocabulary, positional encoding, dense-versus-MoE choice, number of experts, expert-routing policy, KV-cache design, training FLOPs, data mixture, or the exact RL algorithm used for GPT-5.6. Any diagram that labels those details as facts would be fabricated.

> **中文译文**
> 
> OpenAI 没有公布 GPT-5.6 的参数量、Transformer 层数、隐藏维度、注意力头数量、tokenizer 词表、位置编码、稠密模型或 MoE 选择、专家数量、专家路由策略、KV cache 设计、训练 FLOPs、数据混合比例，也没有公布 GPT-5.6 所使用的具体强化学习算法。任何将这些细节标注为事实的架构图都属于虚构。

| Layer of description 描述层级 | Public status 公开状态 | Safe conclusion 可安全得出的结论 |
| --- | --- | --- |
| Product tier | Disclosed | Sol > Terra > Luna on the general capability-cost frontier |
| API context and output limits | Disclosed | Same serving envelope across the family |
| Internal reasoning tokens | Disclosed | Opaque tokens consume context and output-token billing |
| Tool-use orchestration | Disclosed | Direct calls, programmatic tool programs, multi-agent beta |
| Persisted reasoning state | Disclosed | Opaque compatible reasoning items can be reused across turns |
| Safety architecture | Partially disclosed | Trained safeguards plus real-time checks/monitors |
| Neural network physical topology | Not disclosed | No defensible layer/MoE/parameter diagram is possible |
| Effort-conditioning implementation | Not disclosed | Control exists; exact encoding/training recipe is unknown |
| Pro internal aggregation topology | Not disclosed | More model work is performed; mechanism is unspecified |

* * *

## 4\. Observable single-agent data flow  
4\. 可观察的单智能体数据流

A GPT-5.6 Responses API call can be modeled as a control-plane pipeline. The application assembles instructions, multimodal inputs, tool schemas, visible conversation state, and optional persisted reasoning references. The service renders an effective context, invokes the selected model tier, allocates internal reasoning tokens according to the requested effort and task difficulty, and produces either visible text, a tool action, or a programmatic tool program. Tool results can re-enter the model for additional reasoning until a final response is produced.

> **中文译文**
> 
> GPT-5.6 的 Responses API 请求可以建模为控制平面流水线。应用程序首先组装系统、开发者和用户指令，多模态输入，工具 schema，可见对话状态，以及可选的持久化推理引用。服务端随后渲染有效上下文，调用所选模型规格，根据请求的推理强度和任务难度分配内部推理 token，并生成可见文本、工具动作或程序化工具程序。工具结果可以重新进入模型，继续进行推理，直至生成最终响应。\[O3\]\[O4\]\[O11\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/afddf3f57b.svg)

**Figure 4. Interface-level data flow. This is not a claim about the undisclosed neural network topology.**

> **图 4：接口层数据流。该图不代表对未公开神经网络拓扑的断言。**

### 4.1 Request assembly  
4.1 请求组装

The effective request contains more than the user prompt. It can include system and developer instructions, previous visible messages, images, function definitions, hosted-tool declarations, response-format constraints, safety identifiers, and state references such as `previous_response_id`. These components compete for context space before the current reasoning and visible output are generated.

> **中文译文**
> 
> 有效请求并不只包含用户提示词。它还可以包含系统指令、开发者指令、此前可见消息、图片、函数定义、托管工具声明、响应格式约束、安全标识符，以及 `previous_response_id` 等状态引用。在生成当前推理 token 和可见输出之前，这些内容都会占用上下文空间。\[O4\]\[O6\]\[O7\]\[O8\]

### 4.2 Internal reasoning workspace  
4.2 内部推理工作区

Reasoning tokens are hidden from the API user, but the response usage object reports their count. They occupy the context window and are billed as output tokens. OpenAI states that a task may use from a few hundred to tens of thousands of reasoning tokens. Therefore, `max_output_tokens` limits the combined generated budget, not only the visible answer.

> **中文译文**
> 
> 推理 token 对 API 用户不可见，但响应的 usage 对象会报告其数量。它们会占用上下文窗口，并按输出 token 计费。OpenAI 表示，一个任务可能使用数百至数万枚推理 token。因此，`max_output_tokens` 限制的是生成阶段的总预算，而不仅是最终可见答案。\[O4\]

The generated-token budget can be represented as:

> **中文译文**
> 
> 生成阶段的 token 预算可以表示为：
 T_{\mathrm{generated}}</h1><p class="lang-en source-en-block">T_{\mathrm{reasoning}} + T_{\mathrm{visible}} + T_{\mathrm{format}}

$

A simplified context constraint is:

> **中文译文**
> 
> 简化后的上下文约束为：

Tinput+Thistory+Trenderedreasoningstate+Tgenerated≤Tcontext T\_{\\mathrm{input}} + T\_{\\mathrm{history}} + T\_{\\mathrm{rendered\\ reasoning\\ state}} + T\_{\\mathrm{generated}} \\leq T\_{\\mathrm{context}}

### 4.3 Tool loop  
4.3 工具循环

In direct tool calling, the model chooses one tool call, receives its result, and reasons again. In Programmatic Tool Calling, GPT-5.6 can generate JavaScript that runs in a fresh isolated V8 runtime, using loops, conditions, parallel calls, and local intermediate variables. This reduces model round trips when control flow is predictable and large tool outputs can be filtered or aggregated in code.

> **中文译文**
> 
> 在直接工具调用中，模型选择一个工具调用，接收结果后再次推理。在 Programmatic Tool Calling 中，GPT-5.6 可以生成 JavaScript，并在全新的隔离 V8 runtime 中执行；程序可以使用循环、条件、并行调用和本地中间变量。当控制流可预测，且大型工具输出可以通过代码筛选或聚合时，这种方式能够减少模型往返次数。\[O1\]\[O11\]

### 4.4 Safety checks  
4.4 安全检查

OpenAI documents safeguards trained into the model together with real-time classifiers, monitoring, and a reasoning monitor for sensitive domains. The API guidance warns that some cyber or biology requests may pause for several seconds while synchronous classifiers inspect generated output. The exact ordering and implementation of all safety stages are not public.

> **中文译文**
> 
> OpenAI 披露的安全体系包括训练进模型的防护机制、实时分类器、持续监控，以及针对敏感领域的推理监控器。API 指南指出，某些网络安全或生物领域请求可能在生成过程中暂停数秒，以便同步分类器检查输出。所有安全阶段的准确顺序和实现均未公开。\[O1\]\[O3\]\[O9\]

### 4.5 Response object  
4.5 响应对象

The final API response can contain opaque reasoning items, optional reasoning summaries, assistant messages, function calls, tool results, and usage accounting. A reasoning summary is a generated summary, not the raw chain of thought. Persisted reasoning similarly reuses opaque reasoning items without exposing their text.

> **中文译文**
> 
> 最终 API 响应可以包含不透明的 reasoning item、可选的推理摘要、助手消息、函数调用、工具结果和 usage 计量。推理摘要是模型生成的摘要，而不是原始 chain of thought。持久化推理同样只复用不透明的推理项，不会公开其文本内容。\[O4\]

* * *

## 5\. Reasoning-effort semantics  
5\. 推理强度的语义

`reasoning.effort` is an ordinal control signal, not a published fixed token quota. OpenAI explicitly states that models reason adaptively within each level: simple tasks may use fewer tokens, while complex tasks may use more. Adjacent levels can therefore overlap in actual reasoning-token counts. The safest interpretation is that effort changes the model’s prior or allowed operating region for planning, exploration, verification, and revision.

> **中文译文**
> 
> `reasoning.effort` 是序数型控制信号，而不是公开的固定 token 配额。OpenAI 明确说明，模型在每个档位内部仍会自适应推理：简单任务可能使用较少 token，复杂任务可能使用更多 token。因此，相邻档位的实际推理 token 数量可能重叠。最稳妥的解释是，推理强度会改变模型在规划、探索、验证和修订方面的先验倾向或允许的运行区域。\[O3\]\[O4\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/f805d7c9fb.svg)

**Figure 5. Effort levels are ordered preferences, not deterministic budgets.**

> **图 5：推理档位是有序偏好，而不是确定性预算。**

| Effort | Official use orientation 官方用途定位 | Operational interpretation 运行层解释 | Typical trade-off 典型权衡 |
| --- | --- | --- | --- |
| `none` | Latency-critical retrieval, classification, voice-like tasks | Direct answer path; avoid reasoning-heavy or multi-chained tool workflows | Lowest reasoning cost and latency; weakest hard-task reliability |
| `low` | Efficient tool use, planning, search, multi-step decisions | Short plan, limited exploration, selective tool calls | Modest latency increase; suitable for production assistants |
| `medium` | Balanced default for planning, judgment, research, artifacts | Multi-step plan, tool coordination, normal verification | Recommended starting point for most workloads |
| `high` | Hard reasoning, complex debugging, deep planning | Broader hypothesis search, deeper checks, longer agentic trajectory | Higher quality potential; higher latency and cost |
| `xhigh` | Deep research, long-running agentic and security workflows | Extended exploration and repeated validation | Use only when evals justify the extra compute |
| `max` | Maximum reasoning for the hardest tasks | More time than `xhigh` for alternatives, checks, and revision | Highest single-agent reasoning investment |

The “operational interpretation” column is a systems-level synthesis, not a disclosed deterministic algorithm. OpenAI does not publish a rule such as “low equals N reasoning tokens” or “high performs exactly K self-checks.”

> **中文译文**
> 
> 表中的“运行层解释”是系统层综合分析，并非 OpenAI 披露的确定性算法。OpenAI 没有公布“low 固定等于 N 枚推理 token”或“high 精确执行 K 次自检”之类规则。

### 5.1 `none`  
5.1 none：不启用推理

At `none`, the service is optimized as a latency baseline for tasks that do not benefit from reasoning or chained tool use. The model still performs normal neural inference; “none” does not mean zero computation. It means that the reasoning-model-specific hidden deliberation path is minimized or disabled at the control level.

> **中文译文**
> 
> `none` 主要作为低延迟基线，适用于不需要推理或链式工具调用的任务。模型仍然会执行正常的神经网络前向推理；“none”不表示零计算，而表示推理模型特有的隐藏审议过程在控制层被最小化或关闭。\[O4\]

### 5.2 `low`  
5.2 low：低强度

At `low`, the model is allowed modest hidden reasoning. The practical difference from `none` is most visible on tasks that require a short plan, one or several tool calls, lightweight data analysis, or execution-oriented coding. Because the model remains adaptive, a trivial question can still terminate quickly.

> **中文译文**
> 
> 在 `low` 档位，模型获得适度的隐藏推理空间。它与 `none` 的实际差异，主要体现在需要短计划、一次或数次工具调用、轻量数据分析或执行型编码的任务上。由于模型仍然自适应，极其简单的问题仍可快速结束。\[O4\]

### 5.3 `medium`  
5.3 medium：中等强度

`medium` is the documented default for GPT-5.6 in both standard and Pro modes when effort is omitted. It is intended to sit near a balanced point on the quality-latency-cost Pareto frontier. For research reports, spreadsheets, slides, agentic coding, and multi-step knowledge work, it is the rational baseline for evaluation.

> **中文译文**
> 
> 当未指定推理强度时，`medium` 是 GPT-5.6 在 standard 与 Pro 模式下的默认值。其目标是在质量、延迟和成本的 Pareto 前沿上取得相对均衡。对于研究报告、电子表格、幻灯片、代理式编码和多步骤知识工作，`medium` 是合理的评测基线。\[O3\]\[O4\]

### 5.4 `high`  
5.4 high：高强度

`high` increases the model’s incentive or allowance to sustain difficult reasoning, debugging, and planning. In observable workflows, this commonly manifests as longer reasoning-token use, more complete tool trajectories, and greater willingness to compare alternatives or validate intermediate results. The exact internal schedule is not disclosed.

> **中文译文**
> 
> `high` 会提高模型持续执行困难推理、调试和规划的倾向或资源许可。在可观察工作流中，这通常表现为更多推理 token、更完整的工具调用轨迹，以及更强的替代方案比较和中间结果验证倾向。具体内部调度策略未公开。\[O4\]

### 5.5 `xhigh`  
5.5 xhigh：超高强度

`xhigh` is intended for deep research and long-running agentic work. It should not be selected merely because a task is important; it should be selected when repeated evaluation shows a measurable gain over `high` or `medium`. This is because longer reasoning can create diminishing returns, unnecessary tool calls, and overthinking.

> **中文译文**
> 
> `xhigh` 面向深度研究与长时间代理工作。不能仅因为任务“重要”就默认选择该档位；应当通过重复评测确认它相较 `high` 或 `medium` 存在可测量收益。原因在于，更长推理可能出现收益递减、不必要的工具调用以及 overthinking（过度思考）。\[O4\]\[A5\]\[A6\]

### 5.6 `max`  
5.6 max：最大强度

OpenAI states that `max` gives GPT-5.6 more time than `xhigh` to reason, explore alternatives, run checks, and revise its approach. This is the highest published single-agent effort setting. It is not equivalent to Pro mode and not equivalent to Ultra.

> **中文译文**
> 
> OpenAI 明确表示，`max` 会给予 GPT-5.6 比 `xhigh` 更多的时间，用于推理、探索替代方案、执行检查和修订方法。这是公开的最高单代理推理强度。它不等同于 Pro 模式，也不等同于 Ultra。\[O1\]\[O3\]\[O4\]

* * *

## 6\. Cross-product: model tier × reasoning effort  
6\. 交叉组合：模型规格 × 推理强度

The three models expose the same effort labels, but the labels should not be assumed to represent equal absolute compute, equal reasoning-token limits, or equal quality. Effort is conditioned within a model. A Luna `max` request can be cheaper than a Sol `medium` request on token price, yet the final quality can still be lower because the base model tier differs. Conversely, Terra or Luna can be the rational choice when the task is high-volume, narrow, well-specified, and easy to verify.

> **中文译文**
> 
> 三种模型规格都暴露相同的推理档位，但不能假定同名档位代表相同的绝对计算量、相同的推理 token 上限或相同的质量。推理强度是在特定模型内部生效的条件控制。Luna 的 `max` 请求按 token 单价可能低于 Sol 的 `medium`，但由于基础模型规格不同，最终质量仍可能较低。反之，当任务具有高吞吐、范围窄、定义明确且容易验证等特点时，Terra 或 Luna 可能是更合理的选择。\[O1\]\[O3\]\[O6\]\[O7\]\[O8\]

| Workload 工作负载 | Recommended baseline 建议基线 | Why 原因 |
| --- | --- | --- |
| Low-latency classification | Luna `none` or `low` | Lowest family price; simple outputs |
| Customer-support assistant with tools | Luna/Terra `low` | Short planning and tool calls at controlled cost |
| Routine coding and data analysis | Terra `medium` | Balanced capability and price |
| Long document or spreadsheet work | Terra/Sol `medium` | Larger capability reserve; normal verification |
| Complex codebase debugging | Sol `high` | Stronger base capability plus deeper reasoning |
| Deep research or high-value analysis | Sol `high` → `xhigh` A/B test | Escalate only when measured gains appear |
| Maximum single-agent quality | Sol `max` | Highest published single-agent effort |
| Parallelizable research/implementation | Sol Ultra or API multi-agent | Parallel workstreams reduce wall-clock time |

### 6.1 Selected official benchmark comparison  
6.1 部分官方基准对比

The launch table shows that Sol usually leads the family, but Terra remains close on several professional, coding, academic, and long-context evaluations. Luna is more variable: it remains strong on some academic and coding tasks, but shows a large gap on the 512K–1M long-context retrieval evaluation. These results demonstrate capability-tier differences; they do not reveal parameter counts or internal architecture.

> **中文译文**
> 
> 官方发布表显示，Sol 通常在家族中领先，但 Terra 在若干专业、编码、学术与长上下文评测上仍与 Sol 较为接近。Luna 的表现波动更大：它在部分学术与编码任务上仍然较强，但在 512K–1M 长上下文检索评测中出现明显差距。这些结果反映能力层级差异，但不能用于反推出参数量或内部架构。\[O1\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/093833956e.png)

**Figure 6. Selected official GPT-5.6 launch benchmarks. Scores come from different evaluation domains and should not be averaged into a single capability number.**

> **图 6：GPT-5.6 官方发布中的部分基准。不同指标来自不同任务域，不应简单平均成单一能力分数。**

| Benchmark | Sol | Terra | Luna |
| --- | --- | --- | --- |
| Agents’ Last Exam | 52.7% | 50.4% | 50.3% |
| Terminal-Bench 2.1 | 88.8% | 87.4% | 84.7% |
| BrowseComp | 90.4% | 87.5% | 83.3% |
| GPQA Diamond | 94.6% | 92.9% | 92.3% |
| FrontierMath Tier 4 | 83.0% | 68.3% | 58.5% |
| MRCR 8-needle 512K–1M | 73.8% | 72.5% | 41.3% |

* * *

## 7\. Max, Pro, and Ultra are different mechanisms  
7\. Max、Pro 与 Ultra 是不同机制

`max` is a value of `reasoning.effort`; it controls single-agent reasoning investment. `pro` is a value of `reasoning.mode`; it performs more model work and aggregates that work into one final answer, while retaining an independently selected effort. Ultra is a product-level multi-agent setting that coordinates four agents by default. The three mechanisms can increase quality through different computational paths.

> **中文译文**
> 
> `max` 是 `reasoning.effort` 的取值，用于控制单代理推理投入。`pro` 是 `reasoning.mode` 的取值，会执行更多模型工作，并将这些工作聚合为一个最终答案；同时，推理强度仍可独立选择。Ultra 是产品层的多代理设置，默认协调四个代理。三者通过不同的计算路径提升质量。\[O1\]\[O3\]\[O4\]\[O5\]

| Dimension 维度 | `max` | `pro` | Ultra multi-agent |
| --- | --- | --- | --- |
| Control field | `reasoning.effort: "max"` | `reasoning.mode: "pro"` | Product Ultra or API `multi_agent.enabled` |
| Primary topology | One agent | More model work, one returned answer; internal topology undisclosed | Root agent + parallel subagents |
| Parallelism | Not stated | Not stated | Explicit parallel subagents |
| Relationship to effort | It is an effort value | Effort remains independently selectable | Per-agent effort is not publicly fixed |
| Latency effect | Usually higher | Higher | Can reduce wall-clock time on parallelizable tasks |
| Token effect | Higher reasoning-token potential | More aggregate model work | Sum of root and subagent tokens can be much higher |
| Best task shape | Single hard chain of reasoning | Difficult tasks needing reliability and hidden aggregation | Independent bounded workstreams |

### 7.1 Pro mode  
7.1 Pro 模式

OpenAI says Pro mode performs more model work than standard mode and bills the aggregated work at the selected model’s normal token rates. It does not disclose whether this is implemented through repeated sampling, internal debate, verifier passes, sequential refinement, or another mechanism. Therefore, those mechanisms remain hypotheses.

> **中文译文**
> 
> OpenAI 说明，Pro 模式会比 standard 模式执行更多模型工作，并按照所选模型的标准 token 费率对聚合后的工作计费。OpenAI 没有披露它是否通过重复采样、内部辩论、验证器 pass、顺序修订或其他机制实现。因此，这些具体机制都只能作为假设。\[O3\]\[O4\]

### 7.2 Ultra and multi-agent  
7.2 Ultra 与多智能体

OpenAI states that Ultra coordinates four agents in parallel by default. In the API multi-agent beta, a root agent can spawn a tree of subagents, send messages, wait for results, and synthesize a final response. Subagents share the request model and available tools, but maintain bounded contexts. This is useful when independent research, code exploration, implementation, testing, or hypothesis evaluation can proceed concurrently.

> **中文译文**
> 
> OpenAI 明确说明 Ultra 默认并行协调四个代理。在 API 的 multi-agent beta 中，根代理可以生成子代理树，向子代理发送消息、等待结果并综合最终响应。子代理共享请求中指定的模型和可用工具，但各自维护边界化上下文。当独立研究、代码探索、模块实现、测试或假设评估可以并行推进时，这种结构尤其有效。\[O1\]\[O5\]

![](/content-assets/ai-field-notes/ai-field-notes-gpt-5-6-model-family-and-reasoning-effort-architecture-ai-field-notes/51409292b1.svg)

**Figure 7. Ultra-like execution uses explicit orchestration rather than only increasing one agent’s reasoning length.**

> **图 7：Ultra 类执行依赖显式代理编排，而不仅是增加单个代理的推理长度。**

Multi-agent execution is less suitable when every step depends on the previous step, agents must frequently write to the same mutable resource, one slow external operation dominates latency, or a deterministic fixed graph is required. More agents can also increase token use and coordination overhead.

> **中文译文**
> 
> 当每一步都严格依赖前一步、多个代理需要频繁写入同一可变资源、延迟主要由单个缓慢外部操作决定，或者系统要求确定性的固定执行图时，多代理执行通常不适合。增加代理数量还会提高 token 消耗与协调开销。\[O5\]

The multi-agent cost can be represented as:

> **中文译文**
> 
> 多代理成本可表示为：

# $
 C_{\mathrm{multi}}</h1><p class="lang-en source-en-block">C_{\mathrm{root}} + \sum_{i=1}^{N} C_{\mathrm{subagent},i} +
C_{\mathrm{tools}} 
$

Wall-clock time is closer to the critical path than to the sum of all agent durations:

> **中文译文**
> 
> 多代理墙钟时间更接近关键路径，而不是所有代理耗时之和：

Lmulti≈Ldecomposition+maxiLsubagent,i+Lsynthesis L\_{\\mathrm{multi}} \\approx L\_{\\mathrm{decomposition}} + \\max\_i L\_{\\mathrm{subagent},i} + L\_{\\mathrm{synthesis}}

* * *

## 8\. Multi-turn reasoning state and persistence  
8\. 多轮推理状态与持久化

Visible conversation state and reasoning state are distinct. Passing previous messages preserves what the user and assistant could see. Persisted reasoning allows compatible opaque reasoning items from earlier turns to be rendered into the next model context. `reasoning.context: "current_turn"` excludes prior-turn reasoning from the next sample, while `all_turns` makes compatible earlier reasoning available when the request has access to earlier response items.

> **中文译文**
> 
> 可见对话状态与推理状态是不同的数据层。传递此前消息会保留用户和助手可见的对话历史。持久化推理则允许将此前轮次中兼容的不透明 reasoning item 渲染到下一次模型上下文中。`reasoning.context: "current_turn"` 不会将更早轮次的推理渲染到下一次采样中；当请求能够访问之前的响应项时，`all_turns` 会使兼容的早期推理可用于当前请求。\[O3\]\[O4\]

This mechanism can improve continuity and cache efficiency in long-running workflows, but it does not expose raw reasoning. From an architecture perspective, it creates a second state channel alongside visible messages: an opaque reasoning-state channel managed by the service.

> **中文译文**
> 
> 该机制能够改善长时间工作流中的连续性和缓存效率，但不会公开原始推理。从架构角度看，它在可见消息之外形成了第二条状态通道：由服务端管理的不透明推理状态通道。\[O3\]\[O4\]

* * *

## 9\. How effort control may be learned: verified facts and research analogues  
9\. 推理强度控制可能如何学习：已验证事实与研究类比

OpenAI confirms that its reasoning models are trained through reinforcement learning and learn to refine thinking, try different strategies, and recognize mistakes. It also confirms that GPT-5.6 uses adaptive reasoning across effort settings. It does not disclose the GPT-5.6 effort-conditioning representation, training labels, reward design, curriculum, rollout policy, or whether separate effort specialists are trained.

> **中文译文**
> 
> OpenAI 确认其推理模型通过强化学习训练，并学习改进思考过程、尝试不同策略和识别错误。OpenAI 也确认 GPT-5.6 会在不同推理档位中进行自适应推理。但它没有披露 GPT-5.6 的推理强度条件表示、训练标签、奖励设计、课程学习、rollout 策略，也没有说明是否训练了独立的推理强度专家模型。\[O3\]\[O4\]\[O9\]\[O10\]

Independent primary research provides several plausible implementation families. These mechanisms explain how controllable reasoning can be built in general, but they cannot be attributed to GPT-5.6 without direct evidence.

> **中文译文**
> 
> 独立一手研究提供了若干可行的实现范式。这些机制能够解释一般意义上如何构建可控推理，但在缺少直接证据的情况下，不能归因于 GPT-5.6。

### 9.1 RLVR and emergent long reasoning  
9.1 RLVR 与涌现的长链推理

DeepSeek-R1 demonstrates that reinforcement learning with verifiable rewards can induce self-reflection, verification, and strategy adaptation. The verifier can score final mathematical or code outcomes without supervising every reasoning step. This supports the general claim that a model can learn to allocate and improve test-time reasoning through outcome-based reinforcement learning.

> **中文译文**
> 
> DeepSeek-R1 表明，通过可验证奖励强化学习（RLVR），模型可以涌现自我反思、验证和策略调整行为。验证器可以根据数学或代码任务的最终结果评分，而无需监督每一个推理步骤。这支持一个一般性结论：模型可以通过基于结果的强化学习，学习如何分配和改善推理时计算。\[A1\]

### 9.2 Mode fusion and thinking budgets  
9.2 模式融合与思考预算

Qwen3 demonstrates a unified model with thinking and non-thinking behavior, post-training stages that fuse modes, and inference-time thinking budgets. This is evidence that one checkpoint can learn multiple reasoning regimes and expose user control without requiring a completely separate model for each effort level.

> **中文译文**
> 
> Qwen3 展示了统一模型中的 thinking 与 non-thinking 行为、用于融合模式的后训练阶段，以及推理时 thinking budget。这证明单个 checkpoint 可以学习多种推理状态，并向用户暴露控制接口，而不必为每个推理档位都训练完全独立的模型。\[A2\]

### 9.3 Budget forcing  
9.3 预算强制

The s1 study demonstrates a hard inference-time control: terminate reasoning at a token budget, or append “Wait” when the model attempts to finish early. This can lengthen reasoning and sometimes repair mistakes. It is a concrete implementation of test-time budget control, but there is no evidence that GPT-5.6 uses literal “Wait” tokens or hard public token thresholds.

> **中文译文**
> 
> s1 研究展示了一种硬性推理时控制：在达到 token 预算时终止推理，或者当模型试图过早结束时追加“Wait”。这可以延长推理，并在部分任务中修复错误。它是推理时预算控制的具体实现，但没有证据表明 GPT-5.6 使用字面上的“Wait” token 或公开的硬 token 阈值。\[A4\]

### 9.4 Compute-optimal allocation  
9.4 计算最优分配

Research on test-time compute shows that the optimal strategy depends on prompt difficulty. A smaller model with appropriately allocated inference compute can outperform a much larger model on some tasks, while extra compute can be wasted on easy or unsalvageable problems. This supports adaptive effort rather than a universal fixed budget.

> **中文译文**
> 
> 关于 test-time compute 的研究表明，最优策略依赖于问题难度。在某些任务上，较小模型配合适当分配的推理时计算，可以超过大得多的模型；而在过于简单或无法挽救的问题上，额外计算可能被浪费。这支持自适应推理强度，而不是统一固定预算。\[A3\]\[A5\]

### 9.5 Overthinking and diminishing returns  
9.5 过度思考与收益递减

Longer reasoning does not guarantee monotonic improvement for every prompt. Recent studies document overthinking, repeated reformulation, and performance degradation beyond a task-dependent sweet spot. This is why production systems should select effort through evaluation rather than always choosing `max`.

> **中文译文**
> 
> 更长推理并不保证每个问题都单调提升。近期研究记录了 overthinking、重复改写问题以及超过任务相关最优点后的性能下降。这正是生产系统应通过评测选择推理强度，而不是始终选择 `max` 的原因。\[A5\]\[A6\]

### 9.6 Evidence matrix for possible GPT-5.6 mechanisms  
9.6 GPT-5.6 可能机制的证据矩阵

| Candidate mechanism 候选机制 | Evidence for GPT-5.6 针对 GPT-5.6 的证据 | Assessment 判断 |
| --- | --- | --- |
| Learned ordinal effort conditioning | API and product expose stable effort labels | **High confidence that conditioning exists; representation unknown** |
| Adaptive token allocation within a level | Explicitly documented | **Confirmed** |
| Hard token budgets per effort | Not documented | **Unknown** |
| Prompt prefix such as “reasoning effort: high” | Not documented for GPT-5.6 | **Possible analogue, not evidence** |
| Separate checkpoints for each effort | Product uses same model IDs across efforts | **No public evidence** |
| Outcome-based RL RLVR-like training | Reasoning RL confirmed; exact reward system undisclosed | **General family confirmed, exact recipe unknown** |
| Multiple hidden samples/verifiers in Pro | More model work confirmed | **Topology unknown** |
| Four-agent parallel orchestration in Ultra | Explicitly documented | **Confirmed** |
| Sixteen-agent research/eval configurations | Launch charts mention 16-agent cases on selected evals | **Confirmed for evaluation configurations, not default product behavior** |

* * *

## 10\. Concrete API execution patterns  
10\. 具体 API 执行模式

### 10.1 Standard single-agent request  
10.1 标准单智能体请求

The following request selects Terra with medium effort. The model may emit hidden reasoning tokens, call tools if supplied, and return visible text. Omitting `reasoning.effort` would also default GPT-5.6 to `medium`.

> **中文译文**
> 
> 以下请求选择 Terra，并使用 `medium` 推理强度。模型可以生成隐藏推理 token，在提供工具时调用工具，并返回可见文本。对于 GPT-5.6，省略 `reasoning.effort` 同样会默认使用 `medium`。\[O3\]\[O4\]

```
from openai import OpenAI

client = OpenAI()
response = client.responses.create(
    model="gpt-5.6-terra",
    reasoning={
        "effort": "medium",
        "summary": "auto",
        "context": "current_turn",
    },
    input="Analyze the failure modes of this distributed transaction design.",
    max_output_tokens=30_000,
)

print(response.output_text)
print(response.usage.output_tokens_details.reasoning_tokens)
```

### 10.2 Maximum single-agent effort  
10.2 最大单智能体强度

This request uses Sol with `max`. It increases the available reasoning investment but remains a single-agent request unless multi-agent is separately enabled.

> **中文译文**
> 
> 以下请求使用 Sol 与 `max`。它会提高可用推理投入，但如果没有单独启用 multi-agent，仍然是单代理请求。\[O1\]\[O3\]\[O4\]

```
response = client.responses.create(
    model="gpt-5.6-sol",
    reasoning={"effort": "max"},
    input="Audit this compiler optimization proof and find hidden assumptions.",
    max_output_tokens=80_000,
)
```

### 10.3 Pro mode with independently selected effort  
10.3 独立选择推理强度的 Pro 模式

Pro mode and effort are independent. This example requests Pro execution at high effort. OpenAI documents more model work and higher token usage, but not the internal aggregation algorithm.

> **中文译文**
> 
> Pro 模式与推理强度相互独立。以下示例请求在 `high` 推理强度下使用 Pro 执行。OpenAI 只披露 Pro 会执行更多模型工作并消耗更多 token，没有披露内部聚合算法。\[O3\]\[O4\]

```
response = client.responses.create(
    model="gpt-5.6-sol",
    reasoning={
        "mode": "pro",
        "effort": "high",
    },
    input="Review this database migration plan and identify failure modes.",
)
```

### 10.4 Ultra-like multi-agent request  
10.4 类 Ultra 多智能体请求

The API multi-agent beta enables the root model to create subagents. The application can cap concurrency, but the model directs decomposition and synthesis. The example asks for three focused workstreams; the product Ultra default is four agents.

> **中文译文**
> 
> API 的 multi-agent beta 允许根模型创建子代理。应用程序可以限制并发数，但任务分解与结果综合由模型主导。以下示例要求三个专门工作流；产品 Ultra 的默认值则是四个代理。\[O1\]\[O5\]

```
response = client.beta.responses.create(
    model="gpt-5.6-sol",
    input=(
        "Review this pull request with separate workstreams for correctness, "
        "security, and missing tests. Reconcile conflicts and prioritize findings."
    ),
    multi_agent={
        "enabled": True,
        "max_concurrent_subagents": 3,
    },
    betas=["responses_multi_agent=v1"],
)
```

### 10.5 Persist reasoning across calls  
10.5 跨调用持久化推理

`previous_response_id` carries response state, while `reasoning.context: "all_turns"` makes compatible opaque reasoning from earlier turns available. This preserves continuity without exposing raw reasoning text.

> **中文译文**
> 
> `previous_response_id` 用于传递响应状态，而 `reasoning.context: "all_turns"` 会使此前轮次中兼容的不透明推理可用于当前请求。这能够保持连续性，但不会公开原始推理文本。\[O3\]\[O4\]

```
first = client.responses.create(
    model="gpt-5.6-sol",
    input="Inspect this repository and identify the likely bug.",
    reasoning={"context": "current_turn"},
)

second = client.responses.create(
    model="gpt-5.6-sol",
    previous_response_id=first.id,
    input="Now patch the bug and explain the change.",
    reasoning={"context": "all_turns"},
)
```

* * *

## 11\. Cost, latency, and token accounting  
11\. 成本、延迟与 token 计费

A simplified single-agent API cost model is:

> **中文译文**
> 
> 简化后的单代理 API 成本模型为：

# $
 C</h1><p class="lang-en source-en-block">p_{\mathrm{in}}T_{\mathrm{in}} +
p_{\mathrm{cache}}T_{\mathrm{cached}} + p_{\mathrm{out}} \left(
T_{\mathrm{reasoning}} + T_{\mathrm{visible}} + T_{\mathrm{format}}
\right) + C_{\mathrm{tools}} 
$

Reasoning tokens are not a free hidden channel. They are output tokens for billing and consume the context window. An incomplete response can therefore incur reasoning cost without producing visible text if the generation budget is exhausted before the answer begins.

> **中文译文**
> 
> 推理 token 并不是免费的隐藏通道。它们会按输出 token 计费，并占用上下文窗口。如果生成预算在可见答案开始前耗尽，请求可能产生推理成本，却没有返回可见文本。\[O4\]

Latency has several components:

> **中文译文**
> 
> 延迟由多个部分构成：

# $
 L_{\mathrm{total}}</h1><p class="lang-en source-en-block">L_{\mathrm{queue}} + L_{\mathrm{prefill}} + L_{\mathrm{reasoning}} +
L_{\mathrm{tools}} + L_{\mathrm{safety}} + L_{\mathrm{visible\ decode}}

$

OpenAI does not publish a deterministic latency multiplier for each effort. Real latency depends on task difficulty, generated reasoning length, tool calls, external tool latency, service tier, safety pauses, and whether multi-agent work can run in parallel.

> **中文译文**
> 
> OpenAI 没有公布各推理档位对应的确定性延迟倍数。实际延迟取决于任务难度、生成的推理长度、工具调用、外部工具延迟、服务等级、安全检查暂停，以及多代理任务是否能够并行执行。\[O1\]\[O3\]\[O4\]\[O5\]

* * *

## 12\. Experimental protocol for comparing tiers and efforts  
12\. 对比模型规格与推理强度的实验方案

A reliable comparison must hold the task set, prompt, tools, state policy, output limit, and service tier constant. Each configuration should be repeated because reasoning models are stochastic and tool environments can vary. The primary metrics should include task success, rubric score, reasoning tokens, visible output tokens, tool-call count, wall-clock latency, total cost, incomplete-response rate, and human rework.

> **中文译文**
> 
> 可靠对比必须固定任务集、提示词、工具、状态策略、输出上限与服务等级。由于推理模型具有随机性，工具环境也可能变化，因此每种配置应重复运行。主要指标应包括任务成功率、rubric 得分、推理 token、可见输出 token、工具调用次数、墙钟延迟、总成本、不完整响应率以及人工返工量。

| Variable group 变量组 | Keep fixed 应固定 | Sweep 应遍历 |
| --- | --- | --- |
| Task | Dataset, prompt, attachments, success rubric | Difficulty strata |
| Model | Tool permissions, API version, service tier | Sol Terra / Luna |
| Reasoning | `reasoning.context`, output limit | none low / medium / high / xhigh / max |
| Execution | Same standard/pro policy | standard vs pro |
| Agent topology | Same tools and task decomposition prompt | single-agent vs multi-agent |
| Measurement | Same timer and cost accounting | Multiple random seeds/runs |

A practical utility function is:

> **中文译文**
> 
> 可采用如下实用效用函数：

# $
 U</h1><h2 class="lang-en" id="q">Q</h2><h2 class="lang-en" id="lambda-c">\lambda C</h2><h2 class="lang-en" id="mu-l">\mu L</h2><p class="lang-en source-en-block">\nu R_{\mathrm{rework}} 
$

where QQ is quality, CC is monetary cost, LL is latency, and RreworkR\_{\\mathrm{rework}} is the human correction burden.

> **中文译文**
> 
> 其中，QQ 表示质量，CC 表示货币成本，LL 表示延迟，RreworkR\_{\\mathrm{rework}} 表示人工修订负担。

OpenAI’s migration guidance is operationally sound: start at the current effort or `medium`, then test the same level and one level lower. Use `high` or `xhigh` only when measured quality improves, and reserve `max` for quality-first workloads. This procedure avoids paying for reasoning that does not change the outcome.

> **中文译文**
> 
> OpenAI 的迁移建议在工程上是合理的：从当前档位或 `medium` 开始，然后测试同档位和低一档。只有在质量测量出现改善时才使用 `high` 或 `xhigh`，并将 `max` 保留给质量优先的工作负载。该流程能够避免为不改变结果的额外推理付费。\[O3\]\[O4\]

* * *

## 13\. Failure modes and architectural risks  
13\. 失败模式与架构风险

### 13.1 Overthinking  
13.1 过度思考

More reasoning can cause repeated reformulation, self-doubt, late-stage answer changes, or unnecessary exploration. A higher effort setting can therefore reduce efficiency and occasionally reduce correctness on easy tasks. Effort selection should be difficulty-aware.

> **中文译文**
> 
> 更多推理可能导致重复改写、自我怀疑、在末期改变正确答案，或进行无必要的探索。因此，对于简单任务，更高推理档位可能降低效率，偶尔还会降低正确性。推理强度选择应与任务难度相匹配。\[A5\]\[A6\]

### 13.2 Hidden-state opacity  
13.2 隐藏状态的不透明性

Raw reasoning is not exposed through the API. Reasoning summaries are not a faithful audit log by definition; they are user-facing generated summaries. Applications that require verifiability should rely on external evidence, tool traces, executable checks, citations, tests, and structured intermediate artifacts.

> **中文译文**
> 
> API 不会公开原始推理。推理摘要从定义上就不是完整审计日志，而是面向用户生成的摘要。需要可验证性的应用，应依赖外部证据、工具轨迹、可执行检查、引用、测试和结构化中间产物。\[O4\]\[O9\]

### 13.3 Tool-loop amplification  
13.3 工具循环放大

At higher effort, a model may perform more tool calls or longer tool trajectories. This can improve coverage but also amplify external errors, stale data, prompt injection, or destructive actions. Tool permissions, write boundaries, confirmation policies, and deterministic validators remain necessary.

> **中文译文**
> 
> 在更高推理强度下，模型可能执行更多工具调用或更长的工具轨迹。这能够改善覆盖率，但也可能放大外部错误、过期数据、prompt injection 或破坏性操作。因此，工具权限、写入边界、确认策略和确定性验证器仍然不可缺少。\[O5\]\[O9\]

### 13.4 Multi-agent coordination overhead  
13.4 多智能体协调开销

Multi-agent execution can produce duplicated work, conflicting conclusions, context fragmentation, and synthesis errors. The root agent must reconcile findings, and the application should preserve provenance for each subagent result when auditability matters.

> **中文译文**
> 
> 多代理执行可能产生重复工作、结论冲突、上下文碎片化和综合错误。根代理必须协调不同结果；当可审计性重要时，应用程序还应保存每个子代理结果的来源信息。\[O5\]

### 13.5 Benchmark extrapolation  
13.5 基准测试外推

Published benchmark scores are not direct predictions of application performance. They are sensitive to harnesses, tools, reasoning settings, time limits, safeguards, and scoring methods. A model that leads on a benchmark can lose on a constrained production workflow.

> **中文译文**
> 
> 公开基准分数不能直接预测具体应用表现。结果会受到评测 harness、工具、推理档位、时间限制、安全策略和评分方法影响。在某项基准上领先的模型，可能在受约束的生产工作流中落后。\[O1\]\[O9\]

* * *

## 14\. Consolidated architectural interpretation  
14\. 综合架构解释

The most defensible architecture for GPT-5.6 is not a speculative neural-network diagram. It is a layered runtime model: a capability tier selects Sol, Terra, or Luna; an effort controller conditions adaptive hidden reasoning; a reasoning runtime interleaves planning, tool use, and revision; optional persisted reasoning provides an opaque state channel; standard or Pro mode changes the amount of model work; multi-agent orchestration changes the topology from one sequential agent to a root-and-subagent graph; and safety systems inspect behavior during deployment.

> **中文译文**
> 
> 对 GPT-5.6 最可靠的架构描述，不是猜测性的神经网络结构图，而是分层运行时模型：能力规格选择 Sol、Terra 或 Luna；推理强度控制器对自适应隐藏推理施加条件；推理运行时在规划、工具使用和修订之间交替；可选的持久化推理提供不透明状态通道；standard 或 Pro 模式改变模型工作量；多代理编排将拓扑从单个顺序代理改为根代理与子代理构成的图；安全系统则在部署过程中检查模型行为。\[O1\]\[O3\]\[O4\]\[O5\]\[O9\]\[O11\]

For deployment, the rational sequence is: choose the cheapest model tier that can plausibly solve the task; begin at `medium` or one level below the existing baseline; measure quality, reasoning tokens, latency, and rework; escalate effort before escalating model tier only when the smaller model is near the required quality; use Pro for quality-first hidden aggregation; and use Ultra/multi-agent only when the work decomposes into independent streams.

> **中文译文**
> 
> 在部署实践中，合理顺序是：首先选择有可能完成任务的最低成本模型规格；从 `medium` 或当前基线低一档开始；测量质量、推理 token、延迟与返工量；仅当较小模型已接近目标质量时，才考虑先提高推理强度，再升级模型规格；对质量优先且需要更多隐藏聚合的任务使用 Pro；只有当任务能够拆分成相互独立的工作流时，才使用 Ultra 或 multi-agent。

* * *

## 15\. Source index  
15\. 来源索引

### Official OpenAI sources  
OpenAI 官方来源

-   **\[O1\] GPT-5.6 launch:** MODEL tiers, Ultra, max, benchmarks, pricing, Programmatic Tool Calling, availability.  
    [https://openai.com/index/gpt-5-6/](https://openai.com/index/gpt-5-6/)
-   **\[O2\] GPT-5.6 in ChatGPT:** user-facing model picker, plan availability, ChatGPT mappings.  
    [https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt](https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt)
-   **\[O3\] GPT-5.6 model guidance:** target-model selection, reasoning effort, Pro mode, persisted reasoning, multi-agent.  
    [https://developers.openai.com/api/docs/guides/latest-model](https://developers.openai.com/api/docs/guides/latest-model)
-   **\[O4\] Reasoning models API guide:** reasoning tokens, context accounting, effort semantics, Pro mode, summaries, persistence.  
    [https://developers.openai.com/api/docs/guides/reasoning](https://developers.openai.com/api/docs/guides/reasoning)
-   **\[O5\] Multi-agent API guide:** root/subagent topology, parallelism, bounded context, limitations, beta API.  
    [https://developers.openai.com/api/docs/guides/responses-multi-agent](https://developers.openai.com/api/docs/guides/responses-multi-agent)
-   **\[O6\] GPT-5.6 Sol model page:** model contract, pricing, context, modalities, tools.  
    [https://developers.openai.com/api/docs/models/gpt-5.6-sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
-   **\[O7\] GPT-5.6 Terra model page:** model contract, pricing, context, modalities, tools.  
    [https://developers.openai.com/api/docs/models/gpt-5.6-terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
-   **\[O8\] GPT-5.6 Luna model page:** model contract, pricing, context, modalities, tools.  
    [https://developers.openai.com/api/docs/models/gpt-5.6-luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
-   **\[O9\] GPT-5.6 System Card:** training overview, safety architecture, chain-of-thought monitoring, capability evaluation.  
    [https://deploymentsafety.openai.com/gpt-5-6](https://deploymentsafety.openai.com/gpt-5-6)
-   **\[O10\] Learning to reason with LLMs:** reinforcement learning and test-time compute scaling.  
    [https://openai.com/index/learning-to-reason-with-llms/](https://openai.com/index/learning-to-reason-with-llms/)
-   **\[O11\] Programmatic Tool Calling:** generated JavaScript orchestration and isolated V8 runtime.  
    [https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)

### Independent primary research  
独立的一手研究

-   **\[A1\] DeepSeek-R1:** reinforcement learning and verifiable reward mechanisms for reasoning.  
    [https://arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948)
-   **\[A2\] Qwen3 Technical Report:** thinking/non-thinking mode fusion and thinking budgets.  
    [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388)
-   **\[A3\] Scaling LLM Test-Time Compute Optimally:** difficulty-dependent compute allocation.  
    [https://arxiv.org/abs/2408.03314](https://arxiv.org/abs/2408.03314)
-   **\[A4\] s1: Simple Test-Time Scaling:** budget forcing with termination and “Wait” continuation.  
    [https://arxiv.org/abs/2501.19393](https://arxiv.org/abs/2501.19393)
-   **\[A5\] Reasoning on a Budget:** survey taxonomy for controllable and adaptive test-time compute.  
    [https://arxiv.org/abs/2507.02076](https://arxiv.org/abs/2507.02076)
-   **\[A6\] Overthinking in LLM Test-Time Compute Scaling:** evidence of non-monotonic returns and overthinking.  
    [https://arxiv.org/html/2604.10739v1](https://arxiv.org/html/2604.10739v1)

### Supplied secondary source  
用户提供的二手来源

-   **\[SRC\] Sebastian Raschka, “Controlling Reasoning Effort in LLMs.”** Used as the framing document supplied by the user; claims were independently checked against primary sources.  
    [https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms](https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms)

* * *

## 16\. Research limitations  
16\. 研究局限

This report is current as of 23 July 2026. Product availability, prices, API fields, model aliases, and usage limits can change. The physical neural architecture and exact GPT-5.6 training recipe remain undisclosed. All internal-process descriptions beyond the documented API/runtime behavior are explicitly labeled as interpretation or analogy.

> **中文译文**
> 
> 本报告的信息截至 2026 年 7 月 23 日。产品可用性、价格、API 字段、模型别名和使用限制均可能变化。GPT-5.6 的物理神经网络架构与准确训练方法仍未公开。凡超出官方 API 与运行时文档的内部过程描述，均已明确标注为解释或类比。
