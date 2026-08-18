## 摘要

本文围绕“RLHF：监督微调、奖励模型与 PPO 对齐”对课程 ASR 进行高密度论文式重构，并围绕 RLHF、SFT、reward model、preference data、PPO 检索英文原论文、官方研究页面和高校课程资料。文章不保留课堂逐句口述，而以问题背景、技术难点、形式化定义、核心机制、理论或实验依据、局限与后续发展重新组织知识，并对可确认的 ASR 误识别和概念边界进行校正。

**关键词：**RLHF；SFT；reward model；preference data；PPO；KL penalty；reference model

## 1\. 研究背景

预训练语言模型的 next-token likelihood 并不直接表达“遵循指令、帮助用户、避免不期望行为”等交互偏好。RLHF 通过人类比较数据训练偏好代理，再把该代理作为后训练优化信号。

技术上需要区分 SFT 模型、Reward Model、Reference Model 与 Policy，它们在数据来源、是否冻结和优化目标上承担不同角色。

本讲进一步聚焦**RLHF：监督微调、奖励模型与 PPO 对齐**。正式分析首先需要明确该方法试图压缩哪一种计算复杂度、拟合哪一种统计规律或改进哪一类表示，再讨论公式和实现。只有把技术目标与评价标准绑定，才能避免把课堂示意性操作误写成普遍结论。

![RLHF：监督微调、奖励模型与 PPO 对齐 技术流程图](/content-assets/paper-rlhf/paper-rlhf-rlhf-监督微调-奖励模型与-ppo-对齐/b7ec441e25.svg)

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

1.  **先进行监督微调建立参考策略**：围绕 RLHF 建立可验证的输入、计算与评价关系。
2.  **收集同 prompt 的人类偏好排序**：围绕 SFT 建立可验证的输入、计算与评价关系。
3.  **训练 reward model 近似偏好**：围绕 reward model 建立可验证的输入、计算与评价关系。
4.  **用 PPO/策略优化提高奖励并加 KL 约束**：围绕 preference data 建立可验证的输入、计算与评价关系。
5.  **持续做人类评测和分布外安全检查**：围绕 PPO 建立可验证的输入、计算与评价关系。

这些步骤共同回答三个问题：候选对象如何表示；核心计算如何改变或评价它；最终结果在什么条件下可以被视为有效。后续章节的公式、图表和实验均围绕这条链路展开。

## 4\. 概念与形式化

偏好奖励模型损失

$
L_R=-\mathbb E\left[\log\sigma\big(r_\phi(x,y_w)-r_\phi(x,y_l)\big)\right]
$

奖励模型学习人类在成对回答中的相对偏好，而不是直接拟合一个绝对“道德分数”。

RLHF 中的参考策略约束

$
R(x,y)=r_\phi(x,y)-\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{ref}(y\mid x)}
$

KL 惩罚限制策略偏离监督微调参考模型过远。

| 核心对象 | 正式技术含义 | 关联形式化 |
| --- | --- | --- |
| **RLHF** | Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |
| **SFT** | Supervised Fine-Tuning（SFT）用人工示范的 prompt–response 对微调预训练模型，使其先学会基本指令格式与回答风格。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |
| **reward model** | Reward Model 接收 prompt 与候选回答，输出用于排序偏好的标量。训练数据通常是同一 prompt 下的成对/多回答排序；模型学习的是特定标注协议下的偏好代理，因此存在 distribution shift、reward hacking 和标注偏差风险。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |
| **preference data** | Preference Data 通常包含同一 prompt 的多个候选回答及人类排序，用来训练 reward model 或直接偏好优化。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |
| **PPO** | Proximal Policy Optimization（PPO）通过新旧策略概率比的 clipped surrogate objective 限制单次更新过大。PPO 原论文属于 on-policy family：数据来自旧策略的当前批次，并在有限 epochs 内复用；把它概括为“off-policy”是不准确的。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |
| **KL penalty** | 本讲核心技术对象；其定义需结合当前章节的输入、输出和假设理解。 | 偏好奖励模型损失 / RLHF 中的参考策略约束 |

![核心概念关系图](/content-assets/paper-rlhf/paper-rlhf-rlhf-监督微调-奖励模型与-ppo-对齐/513fc98f9e.svg)

**图 2　核心对象之间的功能关系。** 图示说明表示、计算机制与评价之间的依赖，不复刻课程 PPT。

## 5\. 核心技术机制

### 1\. RLHF

Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。

### 2\. SFT

Supervised Fine-Tuning（SFT）用人工示范的 prompt–response 对微调预训练模型，使其先学会基本指令格式与回答风格。

### 3\. reward model

Reward Model 接收 prompt 与候选回答，输出用于排序偏好的标量。训练数据通常是同一 prompt 下的成对/多回答排序；模型学习的是特定标注协议下的偏好代理，因此存在 distribution shift、reward hacking 和标注偏差风险。

### 4\. preference data

Preference Data 通常包含同一 prompt 的多个候选回答及人类排序，用来训练 reward model 或直接偏好优化。

### 5\. PPO

Proximal Policy Optimization（PPO）通过新旧策略概率比的 clipped surrogate objective 限制单次更新过大。PPO 原论文属于 on-policy family：数据来自旧策略的当前批次，并在有限 epochs 内复用；把它概括为“off-policy”是不准确的。

### 方法流程

将核心概念放回执行过程后，可以得到下表。正式算法描述必须同时给出状态更新、评价标准与终止条件，而不能只记录操作顺序。

| 阶段 | 处理步骤 | 主要技术对象 |
| --- | --- | --- |
| 1 | **先进行监督微调建立参考策略** | RLHF |
| 2 | **收集同 prompt 的人类偏好排序** | SFT |
| 3 | **训练 reward model 近似偏好** | reward model |
| 4 | **用 PPO/策略优化提高奖励并加 KL 约束** | preference data |
| 5 | **持续做人类评测和分布外安全检查** | PPO |

### 相关对象的功能比较

| 对象 | 定义 | 使用边界 |
| --- | --- | --- |
| RLHF | Reinforcement Learning from Human Feedback（RLHF）使用人类偏好提供传统自监督目标中缺失的“哪种回答更符合指令/偏好”信号。InstructGPT 型流程通常包含 supervised fine-tuning、preference comparison/reward modeling 和基于 PPO 的策略优化。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| SFT | Supervised Fine-Tuning（SFT）用人工示范的 prompt–response 对微调预训练模型，使其先学会基本指令格式与回答风格。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| reward model | Reward Model 接收 prompt 与候选回答，输出用于排序偏好的标量。训练数据通常是同一 prompt 下的成对/多回答排序；模型学习的是特定标注协议下的偏好代理，因此存在 distribution shift、reward hacking 和标注偏差风险。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| preference data | Preference Data 通常包含同一 prompt 的多个候选回答及人类排序，用来训练 reward model 或直接偏好优化。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| PPO | Proximal Policy Optimization（PPO）通过新旧策略概率比的 clipped surrogate objective 限制单次更新过大。PPO 原论文属于 on-policy family：数据来自旧策略的当前批次，并在有限 epochs 内复用；把它概括为“off-policy”是不准确的。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |

## 6\. 性质、实验与证据

### 采样分布与稳定性

强化学习更新使用由当前/旧策略生成的数据，策略变化会同时改变训练数据分布。Actor–Critic、PPO 和 KL regularization 都可视为控制估计方差或限制分布漂移的机制。

### 奖励与目标错配

优化器只会提高被形式化的 reward/代理目标。若 reward model 不能完整表达人类偏好，策略可能利用代理缺陷。因此 RLHF 的关键不仅是 PPO，还包括偏好数据质量、奖励模型泛化和对策略偏移的约束。

对于具有明确理论条件的算法，本节优先说明正确性、最优性、收敛性或复杂度的前提；对于以实验建立有效性的学习模型，则区分训练指标、验证指标、消融实验和最终任务结果。任何数值都应绑定数据集、模型版本、硬件或搜索预算，不能脱离实验条件泛化。

## 7\. 课程主线与事实核查

**课程知识主线。** 根据原 ASR，可以确认本讲的教学主线集中在 **RLHF、SFT、reward model、preference data、PPO、KL penalty** 及其相互关系。课程中的逐图指点、重复设问、口头自我修正和非技术性铺垫均已删除；保留下来的知识被重排为“问题定义—形式化—算法/模型机制—评价—边界”的书面结构。

**事实核查与校订：**

-   RLHF 奖励模型学习的是标注偏好代理；不能把它描述成完整“人类价值观函数”。

**外部扩充边界。** 外部检索材料只用于补充标准定义、原始论文结果、算法成立条件和后续技术发展；它们不会被反向写成讲师原本展示过的 PPT 参数。对纯 ASR 无法唯一恢复的图中数字、箭头和公式局部符号，正文只保留能够由上下文与权威资料共同确认的技术关系。

## 8\. 局限与实践边界

任何课程级算法都存在适用条件。工程使用时必须重新检查数据或状态分布、目标函数、计算预算和评价协议，而不是机械复制示例超参数。随机方法应报告随机种子、重复试验与预算；学习模型应严格区分训练、验证和测试；搜索算法应明确最优性前提、重复状态处理和资源上限。

本讲涉及的核心对象之间通常存在明确折衷：更强的表示或估值可能增加计算成本，更激进的剪枝或近似可能损失保证，更复杂的模型可能需要更多数据和正则化。正式结论因此应表述为“在给定假设和评价条件下有效”，而不是无条件优于其他方法。

## 9\. 展望

后续对齐方法逐渐扩展到 rejection sampling、direct preference optimization、AI feedback 与可验证奖励。研究重点从“是否使用 PPO”转向偏好数据质量、代理目标稳健性和可审计评测。

后续技术是否构成真正改进，应使用与当前方法可比的基准、预算和评价协议验证。对于快速演进的软件或模型版本，正文只把稳定原理写入主结论，把易变化的工程参数视为版本性信息。

## 10\. 结论

“RLHF：监督微调、奖励模型与 PPO 对齐”应被理解为由**RLHF、SFT、reward model、preference data、PPO**共同构成的完整技术问题，而不是若干课堂操作的顺序记录。论文式说明必须同时回答方法解决什么问题、基于何种假设、如何计算、怎样评价以及在哪些条件下可能失效。经过 ASR 主线提取、英文一手资料检索和事实核查后，本章将原有口语课程转换为可独立阅读、可追溯来源且信息密度更高的正式技术文本。

## 参考文献与核查来源

1.  **Ouyang et al. (2022)**. _Training Language Models to Follow Instructions with Human Feedback_. [source](https://arxiv.org/abs/2203.02155).
2.  **OpenAI**. _Aligning language models to follow instructions — official_. [source](https://openai.com/index/instruction-following/).
3.  **Schulman et al. (2017)**. _Proximal Policy Optimization Algorithms_. [source](https://arxiv.org/abs/1707.06347).

生成流程：ASR 知识主线提取 → 论文式重构 → 英文一手资料检索与交叉核验 → 技术扩充 → SVG/表格/MathJax 排版。正文采用 UTF-8。MathJax 通过 CDN 加载；无网络时 LaTeX 源码仍保留，但完整数学排版需要可访问 MathJax。
