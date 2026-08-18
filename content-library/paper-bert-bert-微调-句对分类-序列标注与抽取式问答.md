## 摘要

本文围绕“BERT 微调：句对分类、序列标注与抽取式问答”对课程 ASR 进行高密度论文式重构，并围绕 BERT fine-tuning、sequence classification、token classification、extractive QA、\[CLS\] 检索英文原论文、官方研究页面和高校课程资料。文章不保留课堂逐句口述，而以问题背景、技术难点、形式化定义、核心机制、理论或实验依据、局限与后续发展重新组织知识，并对可确认的 ASR 误识别和概念边界进行校正。

**关键词：**BERT fine-tuning；sequence classification；token classification；extractive QA；\[CLS\]

## 1\. 研究背景

BERT 把 Transformer Encoder 的双向 self-attention 用于大规模文本预训练，通过 Masked Language Modeling 学习上下文表示，再以较少任务特定参数完成分类、序列标注和抽取式问答。

它与 GPT 的根本差别不只是“编码器 vs 解码器”标签，更在于预训练条件信息：BERT 允许目标 token 同时利用左右上下文，而自回归 GPT 必须保持因果掩码。

本讲进一步聚焦**BERT 微调：句对分类、序列标注与抽取式问答**。正式分析首先需要明确该方法试图压缩哪一种计算复杂度、拟合哪一种统计规律或改进哪一类表示，再讨论公式和实现。只有把技术目标与评价标准绑定，才能避免把课堂示意性操作误写成普遍结论。

![BERT 微调：句对分类、序列标注与抽取式问答 技术流程图](/content-assets/paper-bert/paper-bert-bert-微调-句对分类-序列标注与抽取式问答/1834017129.svg)

**图 1　技术主线。** 将本讲知识重构为“问题表示—核心计算—评价/决策”的依赖关系。依据课程 ASR 确认的主题和本章权威资料重新绘制。

## 2\. 核心难点

该主题的难度不仅来自公式本身，还来自模型假设、数据/状态规模和工程资源的共同约束。结合本讲内容与一手资料，可将主要问题归纳为以下四类。

#### 难点 1

双向上下文预训练必须避免直接把目标 token 暴露给预测头，因此采用 masking。

#### 难点 2

预训练任务与下游任务之间存在目标差异，需要 fine-tuning 或其他适配。

#### 难点 3

固定最大长度和二次 attention 成本限制长文本处理。

#### 难点 4

NSP 等原始设计并非后来所有 BERT 变体都沿用，需明确版本边界。

## 3\. 主要工作与技术路线

课程原有知识可压缩为一条完整方法链路。与课堂按幻灯片顺序逐项说明不同，本文按可复现算法过程重排如下：

1.  **构造 \[CLS\]/\[SEP\] 与双向输入**：围绕 BERT fine-tuning 建立可验证的输入、计算与评价关系。
2.  **随机 mask 部分 token 形成预训练目标**：围绕 sequence classification 建立可验证的输入、计算与评价关系。
3.  **多层 Transformer Encoder 学习上下文表示**：围绕 token classification 建立可验证的输入、计算与评价关系。
4.  **添加轻量任务头进行 fine-tuning**：围绕 extractive QA 建立可验证的输入、计算与评价关系。
5.  **按任务指标评估表示迁移**：围绕 \[CLS\] 建立可验证的输入、计算与评价关系。

这些步骤共同回答三个问题：候选对象如何表示；核心计算如何改变或评价它；最终结果在什么条件下可以被视为有效。后续章节的公式、图表和实验均围绕这条链路展开。

## 4\. 概念与形式化

BERT 下游任务头

$
\hat y=\operatorname{Head}(H_{BERT})
$

微调通常在共享 Encoder 顶部添加很小的任务特定参数。

| 核心对象 | 正式技术含义 | 关联形式化 |
| --- | --- | --- |
| **BERT fine-tuning** | BERT Fine-tuning 在预训练 Encoder 顶部添加小型任务头，并联合微调全部或部分参数，以较少任务特定结构适配分类、标注和问答。 | BERT 下游任务头 |
| **sequence classification** | Sequence Classification 为整段文本/句对输出单个类别，BERT 常使用 \[CLS\] 最终表示连接线性分类层。 | BERT 下游任务头 |
| **token classification** | Token Classification 为每个 token 预测标签，常用于命名实体识别等序列标注任务。 | BERT 下游任务头 |
| **extractive QA** | Extractive Question Answering 在给定 passage 中预测答案起始和结束 token 位置，而不是自由生成答案。 | BERT 下游任务头 |
| **\[CLS\]** | 本讲核心技术对象；其定义需结合当前章节的输入、输出和假设理解。 | BERT 下游任务头 |

![核心概念关系图](/content-assets/paper-bert/paper-bert-bert-微调-句对分类-序列标注与抽取式问答/ece5229b40.svg)

**图 2　核心对象之间的功能关系。** 图示说明表示、计算机制与评价之间的依赖，不复刻课程 PPT。

## 5\. 核心技术机制

### 1\. BERT fine-tuning

BERT Fine-tuning 在预训练 Encoder 顶部添加小型任务头，并联合微调全部或部分参数，以较少任务特定结构适配分类、标注和问答。

### 2\. sequence classification

Sequence Classification 为整段文本/句对输出单个类别，BERT 常使用 \[CLS\] 最终表示连接线性分类层。

### 3\. token classification

Token Classification 为每个 token 预测标签，常用于命名实体识别等序列标注任务。

### 4\. extractive QA

Extractive Question Answering 在给定 passage 中预测答案起始和结束 token 位置，而不是自由生成答案。

### 方法流程

将核心概念放回执行过程后，可以得到下表。正式算法描述必须同时给出状态更新、评价标准与终止条件，而不能只记录操作顺序。

| 阶段 | 处理步骤 | 主要技术对象 |
| --- | --- | --- |
| 1 | **构造 \[CLS\]/\[SEP\] 与双向输入** | BERT fine-tuning |
| 2 | **随机 mask 部分 token 形成预训练目标** | sequence classification |
| 3 | **多层 Transformer Encoder 学习上下文表示** | token classification |
| 4 | **添加轻量任务头进行 fine-tuning** | extractive QA |
| 5 | **按任务指标评估表示迁移** | \[CLS\] |

### 相关对象的功能比较

| 对象 | 定义 | 使用边界 |
| --- | --- | --- |
| BERT fine-tuning | BERT Fine-tuning 在预训练 Encoder 顶部添加小型任务头，并联合微调全部或部分参数，以较少任务特定结构适配分类、标注和问答。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| sequence classification | Sequence Classification 为整段文本/句对输出单个类别，BERT 常使用 \[CLS\] 最终表示连接线性分类层。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| token classification | Token Classification 为每个 token 预测标签，常用于命名实体识别等序列标注任务。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| extractive QA | Extractive Question Answering 在给定 passage 中预测答案起始和结束 token 位置，而不是自由生成答案。 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |
| \[CLS\] | 核心技术对象 | 主要承担表示/计算/评价链路中的一个明确角色；实际效果依赖章节所述假设与数据条件。 |

## 6\. 性质、实验与证据

### 训练与推理的边界

模型结构定义的是可计算函数，训练算法决定参数如何从数据中估计，推理过程则在固定参数下执行预测或生成。把三者分开可以避免把训练技巧误写成网络结构，也避免把推理阶段行为反向解释成训练目标。

### 复杂度与工程约束

理论公式通常忽略内存带宽、并行度、batching 和数值精度。实际系统需要同时考虑参数量、激活占用、序列长度和硬件吞吐；因此“准确率更高”的组件未必适合所有在线位置，AlphaGo 的快速 rollout 与大型语言模型中的 KV cache 都体现了类似工程折衷。

对于具有明确理论条件的算法，本节优先说明正确性、最优性、收敛性或复杂度的前提；对于以实验建立有效性的学习模型，则区分训练指标、验证指标、消融实验和最终任务结果。任何数值都应绑定数据集、模型版本、硬件或搜索预算，不能脱离实验条件泛化。

## 7\. 课程主线与事实核查

**课程知识主线。** 根据原 ASR，可以确认本讲的教学主线集中在 **BERT fine-tuning、sequence classification、token classification、extractive QA、\[CLS\]** 及其相互关系。课程中的逐图指点、重复设问、口头自我修正和非技术性铺垫均已删除；保留下来的知识被重排为“问题定义—形式化—算法/模型机制—评价—边界”的书面结构。

**外部扩充边界。** 外部检索材料只用于补充标准定义、原始论文结果、算法成立条件和后续技术发展；它们不会被反向写成讲师原本展示过的 PPT 参数。对纯 ASR 无法唯一恢复的图中数字、箭头和公式局部符号，正文只保留能够由上下文与权威资料共同确认的技术关系。

## 8\. 局限与实践边界

任何课程级算法都存在适用条件。工程使用时必须重新检查数据或状态分布、目标函数、计算预算和评价协议，而不是机械复制示例超参数。随机方法应报告随机种子、重复试验与预算；学习模型应严格区分训练、验证和测试；搜索算法应明确最优性前提、重复状态处理和资源上限。

本讲涉及的核心对象之间通常存在明确折衷：更强的表示或估值可能增加计算成本，更激进的剪枝或近似可能损失保证，更复杂的模型可能需要更多数据和正则化。正式结论因此应表述为“在给定假设和评价条件下有效”，而不是无条件优于其他方法。

## 9\. 展望

Encoder-only 预训练随后发展出 RoBERTa、DeBERTa 等变体，并在检索、分类和表示任务中持续使用。长文本建模、参数高效微调与检索增强是其重要扩展方向。

后续技术是否构成真正改进，应使用与当前方法可比的基准、预算和评价协议验证。对于快速演进的软件或模型版本，正文只把稳定原理写入主结论，把易变化的工程参数视为版本性信息。

## 10\. 结论

“BERT 微调：句对分类、序列标注与抽取式问答”应被理解为由**BERT fine-tuning、sequence classification、token classification、extractive QA、\[CLS\]**共同构成的完整技术问题，而不是若干课堂操作的顺序记录。论文式说明必须同时回答方法解决什么问题、基于何种假设、如何计算、怎样评价以及在哪些条件下可能失效。经过 ASR 主线提取、英文一手资料检索和事实核查后，本章将原有口语课程转换为可独立阅读、可追溯来源且信息密度更高的正式技术文本。

## 参考文献与核查来源

1.  **Devlin et al. (2018)**. _BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding_. [source](https://arxiv.org/abs/1810.04805).
2.  **Vaswani et al. (2017)**. _Attention Is All You Need_. [source](https://arxiv.org/abs/1706.03762).

生成流程：ASR 知识主线提取 → 论文式重构 → 英文一手资料检索与交叉核验 → 技术扩充 → SVG/表格/MathJax 排版。正文采用 UTF-8。MathJax 通过 CDN 加载；无网络时 LaTeX 源码仍保留，但完整数学排版需要可访问 MathJax。
