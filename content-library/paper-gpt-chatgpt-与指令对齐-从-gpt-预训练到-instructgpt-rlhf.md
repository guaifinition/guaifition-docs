## 摘要

本文围绕“ChatGPT 与指令对齐：从 GPT 预训练到 InstructGPT/RLHF”对课程 ASR 进行高密度论文式重构，并围绕 ChatGPT、InstructGPT、instruction tuning、RLHF、human preference 检索英文原论文、官方研究页面和高校课程资料。文章不保留课堂逐句口述，而以问题背景、技术难点、形式化定义、核心机制、理论或实验依据、局限与后续发展重新组织知识，并对可确认的 ASR 误识别和概念边界进行校正。

**关键词：**ChatGPT；InstructGPT；instruction tuning；RLHF；human preference

## 1\. 研究背景

GPT 系列把 Transformer Decoder 的自回归语言建模作为统一预训练目标。技术演化从 GPT-1 的“预训练 + 任务微调”逐步扩展到 GPT-2 的 zero-shot transfer、GPT-3 的 in-context learning，再到基于人类反馈的指令对齐。

不同代际论文对应不同模型、数据和实验条件，不能把后续产品能力反向写入早期论文。本文按原论文时间顺序区分可验证事实。

本讲进一步聚焦**ChatGPT 与指令对齐：从 GPT 预训练到 InstructGPT/RLHF**。正式分析首先需要明确该方法试图压缩哪一种计算复杂度、拟合哪一种统计规律或改进哪一类表示，再讨论公式和实现。只有把技术目标与评价标准绑定，才能避免把课堂示意性操作误写成普遍结论。

![ChatGPT 与指令对齐：从 GPT 预训练到 InstructGPT/RLHF 技术流程图](/content-assets/paper-gpt/paper-gpt-chatgpt-与指令对齐-从-gpt-预训练到-instructgpt-rlhf/6ee338dd0e.svg)

**图 1　技术主线。** 将本讲知识重构为“问题表示—核心计算—评价/决策”的依赖关系。依据课程 ASR 确认的主题和本章权威资料重新绘制。

## 2\. 核心难点

该主题的难度不仅来自公式本身，还来自模型假设、数据/状态规模和工程资源的共同约束。结合本讲内容与一手资料，可将主要问题归纳为以下四类。

#### 难点 1

人类偏好只能通过有限比较样本近似，reward model 是代理而非完整价值函数。

#### 难点 2

策略优化可能利用 reward model 的漏洞，造成 reward hacking 或分布外失真。

#### 难点 3

偏好标注存在人群差异、任务依赖和一致性限制。

#### 难点 4

对齐效果不能只看训练奖励，还必须进行独立人类评测和安全测试。

## 3\. 主要工作与技术路线

课程原有知识可压缩为一条完整方法链路。与课堂按幻灯片顺序逐项说明不同，本文按可复现算法过程重排如下：

1.  **先进行监督微调建立参考策略**：围绕 ChatGPT 建立可验证的输入、计算与评价关系。
2.  **收集同 prompt 的人类偏好排序**：围绕 InstructGPT 建立可验证的输入、计算与评价关系。
3.  **训练 reward model 近似偏好**：围绕 instruction tuning 建立可验证的输入、计算与评价关系。
4.  **用 PPO/策略优化提高奖励并加 KL 约束**：围绕 RLHF 建立可验证的输入、计算与评价关系。
5.  **持续做人类评测和分布外安全检查**：围绕 human preference 建立可验证的输入、计算与评价关系。

这些步骤共同回答三个问题：候选对象如何表示；核心计算如何改变或评价它；最终结果在什么条件下可以被视为有效。后续章节的公式、图表和实验均围绕这条链路展开。

## 4\. 概念与形式化

指令对齐流程

$
\text{Pretrain}\rightarrow\text{SFT}\rightarrow\text{Preference/RM}\rightarrow\text{RL}
$

ChatGPT 的公开技术脉络与 InstructGPT 的三阶段人类反馈流程密切相关，但具体产品训练细节并非全部公开。

| 核心对象 | 正式技术含义 | 关联形式化 |
| --- | --- | --- |
| **ChatGPT** | ChatGPT 是面向对话交互的产品/模型系列。公开的 2022 介绍明确说明其训练与 InstructGPT 类方法有关，但具体产品的全部数据、模型结构和训练超参数并未完全公开，因此技术文章应把可验证的公开流程与推测区分开。 | 指令对齐流程 |
| **InstructGPT** | InstructGPT 是 OpenAI 2022 公开的指令对齐研究，采用 demonstration SFT、human ranking reward model 和 PPO 三阶段流程，是理解早期 ChatGPT 对齐公开脉络的重要来源。 | 指令对齐流程 |
| **instruction tuning** | Instruction Tuning 使用多任务指令—响应数据监督微调，使模型更稳定地把自然语言指令解释为任务规范。 | 指令对齐流程 |
| **RLHF** | Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。 | 指令对齐流程 |
| **human preference** | 本讲核心技术对象；其定义需结合当前章节的输入、输出和假设理解。 | 指令对齐流程 |

![核心概念关系图](/content-assets/paper-gpt/paper-gpt-chatgpt-与指令对齐-从-gpt-预训练到-instructgpt-rlhf/55eddc0679.svg)

**图 2　核心对象之间的功能关系。** 图示说明表示、计算机制与评价之间的依赖，不复刻课程 PPT。

## 5\. 核心技术机制

### 1\. ChatGPT

ChatGPT 是面向对话交互的产品/模型系列。公开的 2022 介绍明确说明其训练与 InstructGPT 类方法有关，但具体产品的全部数据、模型结构和训练超参数并未完全公开，因此技术文章应把可验证的公开流程与推测区分开。

### 2\. InstructGPT

InstructGPT 是 OpenAI 2022 公开的指令对齐研究，采用 demonstration SFT、human ranking reward model 和 PPO 三阶段流程，是理解早期 ChatGPT 对齐公开脉络的重要来源。

### 3\. instruction tuning

Instruction Tuning 使用多任务指令—响应数据监督微调，使模型更稳定地把自然语言指令解释为任务规范。

### 4\. RLHF

Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。

### 方法流程

将核心概念放回执行过程后，可以得到下表。正式算法描述必须同时给出状态更新、评价标准与终止条件，而不能只记录操作顺序。

| 阶段 | 处理步骤 | 主要技术对象 |
| --- | --- | --- |
| 1 | **先进行监督微调建立参考策略** | ChatGPT |
| 2 | **收集同 prompt 的人类偏好排序** | InstructGPT |
| 3 | **训练 reward model 近似偏好** | instruction tuning |
| 4 | **用 PPO/策略优化提高奖励并加 KL 约束** | RLHF |
| 5 | **持续做人类评测和分布外安全检查** | human preference |

### 相关对象的功能比较

| 对象 | 定义 | 使用边界 |
| --- | --- | --- |
| ChatGPT | ChatGPT 是面向对话交互的产品/模型系列。公开的 2022 介绍明确说明其训练与 InstructGPT 类方法有关，但具体产品的全部数据、模型结构和训练超参数并未完全公开，因此技术文章应把可验证的公开流程与推测区分开。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| InstructGPT | InstructGPT 是 OpenAI 2022 公开的指令对齐研究，采用 demonstration SFT、human ranking reward model 和 PPO 三阶段流程，是理解早期 ChatGPT 对齐公开脉络的重要来源。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| instruction tuning | Instruction Tuning 使用多任务指令—响应数据监督微调，使模型更稳定地把自然语言指令解释为任务规范。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| RLHF | Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| human preference | 核心技术对象 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |

## 6\. 性质、实验与证据

### 采样分布与稳定性

强化学习更新使用由当前/旧策略生成的数据，策略变化会同时改变训练数据分布。Actor–Critic、PPO 和 KL regularization 都可视为控制估计方差或限制分布漂移的机制。

### 奖励与目标错配

优化器只会提高被形式化的 reward/代理目标。若 reward model 不能完整表达人类偏好，策略可能利用代理缺陷。因此 RLHF 的关键不仅是 PPO，还包括偏好数据质量、奖励模型泛化和对策略偏移的约束。

对于具有明确理论条件的算法，本节优先说明正确性、最优性、收敛性或复杂度的前提；对于以实验建立有效性的学习模型，则区分训练指标、验证指标、消融实验和最终任务结果。任何数值都应绑定数据集、模型版本、硬件或搜索预算，不能脱离实验条件泛化。

## 7\. 课程主线与事实核查

**课程知识主线。** 根据原 ASR，可以确认本讲的教学主线集中在 **ChatGPT、InstructGPT、instruction tuning、RLHF、human preference** 及其相互关系。课程中的逐图指点、重复设问、口头自我修正和非技术性铺垫均已删除；保留下来的知识被重排为“问题定义—形式化—算法/模型机制—评价—边界”的书面结构。

**事实核查与校订：**

-   公开资料支持 ChatGPT 使用与 InstructGPT 类似的人类反馈训练方法；未公开细节不作推测。

**外部扩充边界。** 外部检索材料只用于补充标准定义、原始论文结果、算法成立条件和后续技术发展；它们不会被反向写成讲师原本展示过的 PPT 参数。对纯 ASR 无法唯一恢复的图中数字、箭头和公式局部符号，正文只保留能够由上下文与权威资料共同确认的技术关系。

## 8\. 局限与实践边界

任何课程级算法都存在适用条件。工程使用时必须重新检查数据或状态分布、目标函数、计算预算和评价协议，而不是机械复制示例超参数。随机方法应报告随机种子、重复试验与预算；学习模型应严格区分训练、验证和测试；搜索算法应明确最优性前提、重复状态处理和资源上限。

本讲涉及的核心对象之间通常存在明确折衷：更强的表示或估值可能增加计算成本，更激进的剪枝或近似可能损失保证，更复杂的模型可能需要更多数据和正则化。正式结论因此应表述为“在给定假设和评价条件下有效”，而不是无条件优于其他方法。

## 9\. 展望

GPT 系列后续演进集中于规模化预训练、in-context learning、instruction tuning、RLHF/偏好优化、长上下文和工具使用。模型细节变化快速，技术文章应始终以具体版本的公开文献为边界。

后续技术是否构成真正改进，应使用与当前方法可比的基准、预算和评价协议验证。对于快速演进的软件或模型版本，正文只把稳定原理写入主结论，把易变化的工程参数视为版本性信息。

## 10\. 结论

“ChatGPT 与指令对齐：从 GPT 预训练到 InstructGPT/RLHF”应被理解为由**ChatGPT、InstructGPT、instruction tuning、RLHF、human preference**共同构成的完整技术问题，而不是若干课堂操作的顺序记录。论文式说明必须同时回答方法解决什么问题、基于何种假设、如何计算、怎样评价以及在哪些条件下可能失效。经过 ASR 主线提取、英文一手资料检索和事实核查后，本章将原有口语课程转换为可独立阅读、可追溯来源且信息密度更高的正式技术文本。

## 参考文献与核查来源

1.  **Radford et al. (2018)**. _Improving Language Understanding by Generative Pre-Training_. [source](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf).
2.  **Radford et al. (2019)**. _Language Models are Unsupervised Multitask Learners_. [source](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf).
3.  **Brown et al. (2020)**. _Language Models are Few-Shot Learners_. [source](https://arxiv.org/abs/2005.14165).
4.  **Ouyang et al. (2022)**. _Training Language Models to Follow Instructions with Human Feedback_. [source](https://arxiv.org/abs/2203.02155).
5.  **OpenAI (2022)**. _Introducing ChatGPT — official_. [source](https://openai.com/index/chatgpt/).

生成流程：ASR 知识主线提取 → 论文式重构 → 英文一手资料检索与交叉核验 → 技术扩充 → SVG/表格/MathJax 排版。正文采用 UTF-8。MathJax 通过 CDN 加载；无网络时 LaTeX 源码仍保留，但完整数学排版需要可访问 MathJax。
