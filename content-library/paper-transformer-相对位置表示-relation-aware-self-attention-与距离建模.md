## 摘要

本文围绕“相对位置表示：Relation-aware Self-Attention 与距离建模”对课程 ASR 进行高密度论文式重构，并围绕 relative position representation、relation-aware attention、relative distance、self-attention 检索英文原论文、官方研究页面和高校课程资料。文章不保留课堂逐句口述，而以问题背景、技术难点、形式化定义、核心机制、理论或实验依据、局限与后续发展重新组织知识，并对可确认的 ASR 误识别和概念边界进行校正。

**关键词：**relative position representation；relation-aware attention；relative distance；self-attention

## 1\. 研究背景

Transformer 用 attention 代替 RNN 的逐时间递归，在训练阶段可以并行处理序列位置，并允许任意两个 token 在单层中直接建立依赖。

完整架构并非只有 Attention：位置表示、Multi-Head 投影、Residual、Normalization、FFN、因果掩码与 Encoder–Decoder 接口共同决定模型如何表示和生成序列。

本讲进一步聚焦**相对位置表示：Relation-aware Self-Attention 与距离建模**。正式分析首先需要明确该方法试图压缩哪一种计算复杂度、拟合哪一种统计规律或改进哪一类表示，再讨论公式和实现。只有把技术目标与评价标准绑定，才能避免把课堂示意性操作误写成普遍结论。

![相对位置表示：Relation-aware Self-Attention 与距离建模 技术流程图](/content-assets/paper-transformer/paper-transformer-相对位置表示-relation-aware-self-attention-与距离建模/a655133817.svg)

**图 1　技术主线。** 将本讲知识重构为“问题表示—核心计算—评价/决策”的依赖关系。依据课程 ASR 确认的主题和本章权威资料重新绘制。

## 2\. 核心难点

该主题的难度不仅来自公式本身，还来自模型假设、数据/状态规模和工程资源的共同约束。结合本讲内容与一手资料，可将主要问题归纳为以下四类。

#### 难点 1

Self-Attention 本身不包含序列顺序，需要显式位置或关系信息。

#### 难点 2

标准全注意力在序列长度上具有二次 score matrix 成本。

#### 难点 3

Multi-Head、Residual、Normalization、FFN 和 masking 共同构成完整架构，不能只用 attention 一项概括。

#### 难点 4

训练阶段高度并行，但自回归解码仍存在严格逐 token 依赖。

## 3\. 主要工作与技术路线

课程原有知识可压缩为一条完整方法链路。与课堂按幻灯片顺序逐项说明不同，本文按可复现算法过程重排如下：

1.  **embedding 并注入位置**：围绕 relative position representation 建立可验证的输入、计算与评价关系。
2.  **线性投影得到 Q/K/V**：围绕 relation-aware attention 建立可验证的输入、计算与评价关系。
3.  **attention 聚合上下文**：围绕 relative distance 建立可验证的输入、计算与评价关系。
4.  **Residual + Norm + FFN 深层变换**：围绕 self-attention 建立可验证的输入、计算与评价关系。
5.  **按 Encoder/Decoder 结构完成理解或生成**：围绕 self-attention 建立可验证的输入、计算与评价关系。

这些步骤共同回答三个问题：候选对象如何表示；核心计算如何改变或评价它；最终结果在什么条件下可以被视为有效。后续章节的公式、图表和实验均围绕这条链路展开。

## 4\. 概念与形式化

相对位置自注意力（抽象）

$
e_{ij}=\frac{q_i^\top(k_j+a^K_{ij})}{\sqrt{d_k}},\qquad z_i=\sum_j\alpha_{ij}(v_j+a^V_{ij})
$

Shaw et al. 直接把相对距离表示加入 key/value 关系，从结构上建模 token 间距离。

| 核心对象 | 正式技术含义 | 关联形式化 |
| --- | --- | --- |
| **relative position representation** | Relative Position Representation 直接将 token 间距离/关系加入 attention score 或 value 聚合，而不是只给每个 token 一个绝对坐标。Shaw et al. (2018) 证明 relation-aware self-attention 可以有效利用相对距离并推广到带标签关系的图。 | 相对位置自注意力（抽象） |
| **relation-aware attention** | Relation-aware Attention 在 token 对之间增加可学习关系表示，使 attention 不仅依赖内容，还依赖相对距离或其他边标签。 | 相对位置自注意力（抽象） |
| **relative distance** | Relative Distance 通常用 j-i 或其裁剪/分桶版本表示两个 token 的相对位置，比绝对索引更直接表达局部和长程间隔。 | 相对位置自注意力（抽象） |
| **self-attention** | Self-Attention 的 Q/K/V 都由同一序列线性投影得到，每个 token 可根据内容直接聚合其他位置的信息。单层即可建立长距离依赖，但如果没有位置机制，纯 attention 对输入排列缺乏显式顺序信息。 | 相对位置自注意力（抽象） |

![核心概念关系图](/content-assets/paper-transformer/paper-transformer-相对位置表示-relation-aware-self-attention-与距离建模/660f92af2f.svg)

**图 2　核心对象之间的功能关系。** 图示说明表示、计算机制与评价之间的依赖，不复刻课程 PPT。

## 5\. 核心技术机制

### 1\. relative position representation

Relative Position Representation 直接将 token 间距离/关系加入 attention score 或 value 聚合，而不是只给每个 token 一个绝对坐标。Shaw et al. (2018) 证明 relation-aware self-attention 可以有效利用相对距离并推广到带标签关系的图。

### 2\. relation-aware attention

Relation-aware Attention 在 token 对之间增加可学习关系表示，使 attention 不仅依赖内容，还依赖相对距离或其他边标签。

### 3\. relative distance

Relative Distance 通常用 j-i 或其裁剪/分桶版本表示两个 token 的相对位置，比绝对索引更直接表达局部和长程间隔。

### 4\. self-attention

Self-Attention 的 Q/K/V 都由同一序列线性投影得到，每个 token 可根据内容直接聚合其他位置的信息。单层即可建立长距离依赖，但如果没有位置机制，纯 attention 对输入排列缺乏显式顺序信息。

### 方法流程

将核心概念放回执行过程后，可以得到下表。正式算法描述必须同时给出状态更新、评价标准与终止条件，而不能只记录操作顺序。

| 阶段 | 处理步骤 | 主要技术对象 |
| --- | --- | --- |
| 1 | **embedding 并注入位置** | relative position representation |
| 2 | **线性投影得到 Q/K/V** | relation-aware attention |
| 3 | **attention 聚合上下文** | relative distance |
| 4 | **Residual + Norm + FFN 深层变换** | self-attention |
| 5 | **按 Encoder/Decoder 结构完成理解或生成** | self-attention |

### 相关对象的功能比较

| 对象 | 定义 | 使用边界 |
| --- | --- | --- |
| relative position representation | Relative Position Representation 直接将 token 间距离/关系加入 attention score 或 value 聚合，而不是只给每个 token 一个绝对坐标。Shaw et al. (2018) 证明 relation-aware self-attention 可以有效利用相对距离并推广到带标签关系的图。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| relation-aware attention | Relation-aware Attention 在 token 对之间增加可学习关系表示，使 attention 不仅依赖内容，还依赖相对距离或其他边标签。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| relative distance | Relative Distance 通常用 j-i 或其裁剪/分桶版本表示两个 token 的相对位置，比绝对索引更直接表达局部和长程间隔。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| self-attention | Self-Attention 的 Q/K/V 都由同一序列线性投影得到，每个 token 可根据内容直接聚合其他位置的信息。单层即可建立长距离依赖，但如果没有位置机制，纯 attention 对输入排列缺乏显式顺序信息。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |

## 6\. 性质、实验与证据

### 训练与推理的边界

模型结构定义的是可计算函数，训练算法决定参数如何从数据中估计，推理过程则在固定参数下执行预测或生成。把三者分开可以避免把训练技巧误写成网络结构，也避免把推理阶段行为反向解释成训练目标。

### 复杂度与工程约束

理论公式通常忽略内存带宽、并行度、batching 和数值精度。实际系统需要同时考虑参数量、激活占用、序列长度和硬件吞吐；因此“准确率更高”的组件未必适合所有在线位置，AlphaGo 的快速 rollout 与大型语言模型中的 KV cache 都体现了类似工程折衷。

对于具有明确理论条件的算法，本节优先说明正确性、最优性、收敛性或复杂度的前提；对于以实验建立有效性的学习模型，则区分训练指标、验证指标、消融实验和最终任务结果。任何数值都应绑定数据集、模型版本、硬件或搜索预算，不能脱离实验条件泛化。

## 7\. 课程主线与事实核查

**课程知识主线。** 根据原 ASR，可以确认本讲的教学主线集中在 **relative position representation、relation-aware attention、relative distance、self-attention** 及其相互关系。课程中的逐图指点、重复设问、口头自我修正和非技术性铺垫均已删除；保留下来的知识被重排为“问题定义—形式化—算法/模型机制—评价—边界”的书面结构。

**事实核查与校订：**

-   相对位置编码不是单一公式家族；本讲以 Shaw et al. (2018) relation-aware attention 为基准扩充。

**外部扩充边界。** 外部检索材料只用于补充标准定义、原始论文结果、算法成立条件和后续技术发展；它们不会被反向写成讲师原本展示过的 PPT 参数。对纯 ASR 无法唯一恢复的图中数字、箭头和公式局部符号，正文只保留能够由上下文与权威资料共同确认的技术关系。

## 8\. 局限与实践边界

任何课程级算法都存在适用条件。工程使用时必须重新检查数据或状态分布、目标函数、计算预算和评价协议，而不是机械复制示例超参数。随机方法应报告随机种子、重复试验与预算；学习模型应严格区分训练、验证和测试；搜索算法应明确最优性前提、重复状态处理和资源上限。

本讲涉及的核心对象之间通常存在明确折衷：更强的表示或估值可能增加计算成本，更激进的剪枝或近似可能损失保证，更复杂的模型可能需要更多数据和正则化。正式结论因此应表述为“在给定假设和评价条件下有效”，而不是无条件优于其他方法。

## 9\. 展望

Transformer 已成为语言、视觉、语音和多模态模型的通用骨架。后续改进主要围绕位置表示、长序列复杂度、归一化稳定性、稀疏注意力、KV cache 与并行训练/推理展开。

后续技术是否构成真正改进，应使用与当前方法可比的基准、预算和评价协议验证。对于快速演进的软件或模型版本，正文只把稳定原理写入主结论，把易变化的工程参数视为版本性信息。

## 10\. 结论

“相对位置表示：Relation-aware Self-Attention 与距离建模”应被理解为由**relative position representation、relation-aware attention、relative distance、self-attention**共同构成的完整技术问题，而不是若干课堂操作的顺序记录。论文式说明必须同时回答方法解决什么问题、基于何种假设、如何计算、怎样评价以及在哪些条件下可能失效。经过 ASR 主线提取、英文一手资料检索和事实核查后，本章将原有口语课程转换为可独立阅读、可追溯来源且信息密度更高的正式技术文本。

## 参考文献与核查来源

1.  **Vaswani et al. (2017)**. _Attention Is All You Need_. [source](https://arxiv.org/abs/1706.03762).
2.  **Shaw, Uszkoreit, Vaswani (2018)**. _Self-Attention with Relative Position Representations_. [source](https://arxiv.org/abs/1803.02155).
3.  **Stanford CS224N**. _Natural Language Processing with Deep Learning — course materials_. [source](https://web.stanford.edu/class/cs224n/).

生成流程：ASR 知识主线提取 → 论文式重构 → 英文一手资料检索与交叉核验 → 技术扩充 → SVG/表格/MathJax 排版。正文采用 UTF-8。MathJax 通过 CDN 加载；无网络时 LaTeX 源码仍保留，但完整数学排版需要可访问 MathJax。
