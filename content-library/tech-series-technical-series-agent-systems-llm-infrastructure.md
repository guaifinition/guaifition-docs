基于来源的研究
_记住、思考与训练_

一组面向工程实践的双语技术研究：从 Agent Runtime 的状态编排，到大型语言模型训练的内存账本，再到 Claude 与云平台如何把能力交付到生产环境。

源码与文档可复核 公式、假设与边界显式化 图示与估算辅助理解

10笔记

阅读清单

01

技术报告

## [Pi Agent Runtime](/tech-series/pi-agent-runtime/)

### Agent、Harness 与 Coding Agent 的编排边界

从统一 LLM API、窄 Agent Loop、Session 树与上下文压缩，到 Extensions 和多种交付协议，源码级拆解 Pi 如何把可嵌入的单 Agent Runtime 组织成代码工作流产品。

Agent RuntimeAgent LoopAgentHarnessCoding AgentSessionLLM APIExtensions

约 16 分钟 来源: Pi v0.83.0 源码审计；https://github.com/earendil-works/pi[阅读本文](/tech-series/pi-agent-runtime/)

02

技术报告

## [大语言模型训练资源需求分析](/tech-series/llm-training-memory/)

### 参数规模、优化状态、显存机制与系统优化技术

将“训练资源约为模型文件数倍”的经验口诀还原为可审计的状态账本，解释 AdamW、激活值、Attention、FlashAttention、ZeRO 与 FSDP 如何共同决定训练峰值。

LLM训练系统显存AdamWBF16FlashAttentionZeROFSDP

约 22 分钟 来源: LLM\_training\_memory\_whitepaper\_final\_v3.docx 转录、外部论文与官方文档[阅读本文](/tech-series/llm-training-memory/)

03

技术报告

## [在 Google Cloud 上使用 Claude 构建应用](/tech-series/building-with-claude-on-google-cloud/)

### 从餐巾纸草图到 Cloud Run 上线：一场贯穿五个角色的软件交付实战

基于 Code w/ Claude 2026 旧金山场完整 576 条英文自动字幕整理的双语技术知识库，记录 Claude Code、Google Cloud、MCP、Skills、Subagents 与安全评审如何协同完成从想法到部署和数据闭环。

Claude CodeGoogle CloudMCPAgent PlatformCloud RunFirestoreBigQueryLookerAI-assisted development

约 24 分钟 来源: https://www.youtube.com/watch?v=SqHsS737CeA[阅读本文](/tech-series/building-with-claude-on-google-cloud/)

04

技术报告

## [Prompting 101：与 Claude 一起构建提示词](/tech-series/prompting-101-code-with-claude/)

### Anthropic 应用 AI 团队以瑞典车险理赔为场景，五轮迭代演示提示工程最佳实践

基于 Code w/ Claude 大会《Prompting 101 | Code w/ Claude》完整英文自动字幕与 31 张视频关键帧重建的双语讲座报告，覆盖提示结构五段式与十要素、系统提示词、少样本示例、防幻觉提醒、输出格式化、预填充响应与扩展思考取舍。

Prompt EngineeringClaudeSystem PromptFew-shotExtended ThinkingAnthropic

约 16 分钟 来源: https://www.youtube.com/watch?v=ysPbXH0LpIE[阅读本文](/tech-series/prompting-101-code-with-claude/)

05

技术报告

## [AI 智能体长期记忆：Memory Bank](/tech-series/ai-agent-long-term-memory-bank/)

### Google Cloud Agent Memory 系列第三集：用 Vertex AI Memory Bank 实现跨会话、多模态的长期记忆

基于 Google Cloud Tech《AI agent long-term memory with memory bank》英文人工字幕与 15 张视频关键帧重建的双语讲座报告，覆盖会话服务与记忆服务的分工、内存版与 Vertex AI Memory Bank 的取舍、两条记忆写入路径、PreloadMemory 自动检索，以及三层记忆体系总结。

Agent MemoryVertex AIMemory BankGeminiGoogle CloudLong-term Memory

约 8 分钟 来源: https://www.youtube.com/watch?v=KZPo15M2DbM[阅读本文](/tech-series/ai-agent-long-term-memory-bank/)

06

技术报告

## [详解 Kimi K3：冲击前沿的开放权重模型](/tech-series/kimi-k3-latepost-interview/)

### 基于《晚点聊 LateTalk》访谈的源码级技术解读：混合注意力、九专家蒸馏、Agent 环境与开源护城河

以晚点LatePost《详解 Kimi K3：强到冲击 Anthropic 估值的模型什么样？》为唯一来源的双语研究笔记，拆解 K3 的 KDA–MLA 混合注意力、NoPE、Attention Residuals、Quantile Balancing、Per-Head Muon、MOPD 九专家蒸馏、AgentENV 与 Kernel Development Agent，并讨论开源与闭源的代差和护城河。

Kimi K3Open WeightsLinear AttentionMoEDistillationInference Infrastructure

约 12 分钟 来源: https://mp.weixin.qq.com/s/KydWDORAkByannmR9jt5ZQ[阅读本文](/tech-series/kimi-k3-latepost-interview/)

07

技术报告

## [闭源前沿模型的参数规模估计](/tech-series/frontier-model-parameter-estimates/)

### GPT-5.6 与 Claude 5 系列的总参数 / 激活参数推断：方法、数字与不确定性

基于 Reuters/FT、LifeArchitect 参数估算、2026 年 IKP 黑箱测量与 Kimi K3 等公开 MoE 架构，对 OpenAI GPT-5.6（Sol/Terra/Luna）与 Anthropic Claude（Fable 5/Opus 5/Sonnet 5/Haiku 4.5）的总参数与激活参数进行综合推断，附四张对比图表与证据标签。

Model ParametersMoEGPT-5.6Claude 5IKPLifeArchitectParameter Estimation

约 8 分钟 来源: 自撰分析稿（2026-08-10）；引用 Reuters/FT、LifeArchitect、IKP eigenigma、Kimi K3 arXiv、OpenAI/Anthropic 官方[阅读本文](/tech-series/frontier-model-parameter-estimates/)

08

技术报告

## [AI Harness 深解：把黑箱模型拴在稳定的现实上](/tech-series/ai-harness-deep-dive/)

### 基于 Tejas Kumar（IBM）在 AI Engineer 的演讲《Harnesses in AI: A Deep Dive》重建的源基讲座报告

以 Tejas Kumar 在 AI Engineer 大会的演讲为基础，系统讲解什么是 agent harness、它为何以可靠性为核心、六个典型组成部分、N+M 嵌套循环，以及一个“提示词一字未改、只逐步加 harness”的浏览器代理演示如何从崩溃撒谎走到成功登录点赞；并把 harness 概念与本系列 Pi Agent Runtime、Prompting 101 相连接。附三张原创概念图与证据标签。

Agent HarnessAI AgentsReliabilityGuardrailsVerify StepContext CompactionTejas Kumar

约 10 分钟 来源: https://www.youtube.com/watch?v=C\_GG5g38vLU （Harnesses in AI: A Deep Dive — Tejas Kumar, IBM · AI Engineer · 2026-05-17）[阅读本文](/tech-series/ai-harness-deep-dive/)

09

技术报告

## [GPT-5.6 Sol 的推理等级与路由机制：官方能证明什么，什么仍不可知](/tech-series/gpt-5-6-sol-reasoning-routing/)

### 基于 OpenAI 官方帮助中心、API 文档、系统卡与界面证据，对 ChatGPT 中「智能 / 极速 / 中 / 高 / 极高」的源基技术核验

以 OpenAI 公开资料为唯一证据边界，厘清 ChatGPT 网页版里「智能、极速 5.5、中、高、极高」到底分别是什么——它们不是同一个模型的几个推理档，而是模型层级、推理强度、模式与路由策略的混合。文章用 A/B/C/D 证据分级贯穿始终，讲清 Medium/High/Extra High 都是同一个 GPT-5.6 Sol 的不同推理预设、隐藏推理 Token 是按任务自适应的软预算、请求要穿过七层路由与执行链路，并明确划出参数量、MoE、固定阈值、UI→API 枚举映射等未公开边界。附三张原创概念图与可复现的验证方案。

GPT-5.6Reasoning ModelsOpenAIModel RoutingReasoning TokensEvidence GradingChatGPT

约 25 分钟 来源: OpenAI 官方资料：https://openai.com/index/gpt-5-6/ · https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt · https://developers.openai.com/api/docs/guides/reasoning （GPT-5.6 Sol · 2026-07 发布）[阅读本文](/tech-series/gpt-5-6-sol-reasoning-routing/)

10

技术报告

## [编码 Agent 的运行中输入调度：中断、引导与排队](/tech-series/coding-agent-input-scheduling/)

### 以源代码与官方文档为依据，比较 Codex、Claude Code、OpenCode（含 V2 Beta）与 Pi 如何调度“Agent 跑着时到达的新输入”

当编码 Agent 正在读文件、改代码、跑命令时，用户敲下的新一句话何时、以何种方式成为当前决策的一部分？本文把运行中输入形式化为硬中断、边界引导、后续排队三种语义，基于主仓库源码、测试、官方文档、变更日志与问题跟踪器，逐一拆解 Codex 的 turn/steer + expectedTurnId + pending\_input + Tokio watch 通道 + 可唤醒等待、Claude Code 明确的用户语义与不透明的内部运行时（issue #50246）、OpenCode 从串行队列到 V2 持久化 steer|queue、Pi 的双队列内外两层循环；解释“为什么 Codex 感觉更快”，区分“中断不等于回滚”，并给出面向 Harness 设计者的建议。附三张原创概念图与 A1–I 证据分级。

Coding AgentsAgent HarnessSteeringMessage QueueCooperative CancellationCodexClaude CodeOpenCodePi

约 21 分钟 来源: 源代码与官方文档：github.com/openai/codex · github.com/anomalyco/opencode · github.com/earendil-works/pi · code.claude.com/docs （2026-08 快照）[阅读本文](/tech-series/coding-agent-input-scheduling/)

编辑方法

## 从原始材料出发，把复杂系统写成可检查的路径

每篇文章都区分当前实现、设计规划与工程推论；引用原始源码、官方文档和论文，并用本地生成的 SVG 图示与交互控件解释那些不能只靠一张截图理解的机制。

建议按顺序阅读：先理解 Agent 运行时状态，再进入训练系统的内存与并行化问题，最后观察 Claude 与云平台如何把能力交付到生产环境。每篇文章底部都提供上一篇、下一篇、首页与返回顶部导航。
