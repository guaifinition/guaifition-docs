[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_000_c6d72446a4.webp)

](https://substackcdn.com/image/fetch/$s_!Igi_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcae88335-48f0-4ab3-baef-790df9e6f2ed_1920x1080.gif)

### Transformer架构

-   1.1 大语言模型简介
    
-   1.2 Transformer块的剖析
    
-   1.3 Tokenization
    
-   1.4 字节对编码
    
-   1.5 词嵌入
    
-   1.6 Transformer块
    
-   1.7 注意力机制的必要性
    
-   1.8 自注意力机制
    
-   1.9 理解输入嵌入矩阵
    
-   1.10 从嵌入到查询、键和价值观
    
-   1.11 矩阵乘法快速说明
    
-   1.12 为什么要衡量注意力分数？
    
-   1.13 因果关系蒙面关注
    
-   1.14 带有 Dropout 的因果注意力
    
-   1.15 自注意力总结
    
-   1.16 多头注意力的直觉
    
-   1.17 层标准化
    
-   1.18 前馈网络
    
-   1.19 快捷连接
    
-   1.20为什么Transformer的扩展性比RNN和CNN更好
    
-   1.21 Transformer 中的预训练、微调和迁移学习
    
-   1.22 Transformer 的局限性和挑战
    
-   1.23 动手编写用于序列分类的微型Transformer
    
-   1.24 总结
    

**您可以在此处修改代码笔记本**

[https://github.com/VizuaraAI/Transformers-for-vision-BOOK](https://github.com/VizuaraAI/Transformers-for-vision-BOOK)

## 1.1 大语言模型简介

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_001_6c930d0926.webp)

](https://substackcdn.com/image/fetch/$s_!rQ5f!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F45d25b86-c09e-46fb-b2bb-b7fadfac0c3e_1086x246.png)

_**图1.1** 大型语言模型将一系列单词作为输入并预测最有可能的下一个单词，一次生成一个token的文本。_

大型语言模型是在大量文本数据集上训练的神经网络，用于执行基本任务：预测序列中的下一个单词。这个简单的目标推动了我们在 GPT 和 ChatGPT 等系统中看到的复杂功能。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_002_a0a86219b6.webp)

](https://substackcdn.com/image/fetch/$s_!kOd8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ef8c075-dead-43d6-a915-9a243dda6be7_1410x984.png)

_**图1.2** 自回归文本生成。该模型预测下一个单词，将其附加到输入中，然后重复该过程以生成整个段落。_

当您与LLM互动时，它会一次生成一个单词的响应。给出“The cat sat on the”这样的提示，模型会预测下一个单词，可能是“mat”。该单词被添加到序列中，成为“The cat sat on the mat”，然后作为预测下一个单词的输入。通过这个迭代过程，LLM会产生完整的段落和复杂的回答。

LLM充当概率引擎，根据训练期间学到的模式计算单词可能性。

转换器架构使这些模型能够考虑整个输入序列中的直接上下文和远程依赖性，从而保持扩展文本生成的一致性。

尽管下一个单词预测看起来很简单，但这种机制带来了卓越的语言理解和生成能力。了解 Transformer 如何完成这项任务对于掌握现代语言模型的工作原理至关重要。

#### 使用 OpenAI 的LLM预测下一个单词

让我们看一个简单的例子，看看LLM如何在给定部分句子的情况下预测下一个单词：

您可以在 Colab 上参考本练习的完整源代码笔记本。

[预测下一个单词笔记本](https://github.com/VizuaraAI/Transformers-for-vision-BOOK/blob/main/Ch02-Transformers/Predicting_the_Next_Word_with_OpenAI's_LLM.ipynb)

使用给定的代码，我们可以预测 **下一个词** 在一个基于概率分配的句子中 **大语言模型（LLM）。** 假设我们的输入句子是

```
“After years of hard work, your effort will take you”
```

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_003_035b755e3f.webp)

](https://substackcdn.com/image/fetch/$s_!Pl2R!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ef611d8-481b-4120-8dfc-d8ca6bb267fc_1194x225.png)

_**图1.3** 输入句子馈送到 LLM 进行下一个单词预测。_

如果你会观察 **顶部** **10 个预测下一个单词** 以及它们的概率（请参阅笔记本）

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_004_e6e9956b2c.webp)

](https://substackcdn.com/image/fetch/$s_!QOgv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa180a073-691a-4a3c-a1b1-df38ae1a9514_450x519.png)

_**图2.4** 前 10 名预测了下一个单词及其概率。 “to”占主导地位，占 90.7%，反映了最自然的延续。_

当检查大型语言模型如何对潜在的下一个单词进行排序时，大型语言模型的概率性质就变得清晰起来。第一个token（例如“to”）的概率可能最高，为 90.7%，因为它代表基于给定上下文的最自然的延续。当我们查看替代单词选择时，概率逐渐降低，每个后续选项代表一个不太常见但仍然有效的完成。

这种分布揭示了大型语言模型的基本机制：它们充当概率引擎，根据学习的模式预测最有可能的下一个token。LLM不是选择单个正确答案，而是评估每个可能的下一个单词，并根据训练期间学到的大量模式分配可能性分数。这种概率方法使模型能够生成多样化的、适合上下文的文本，同时保持输出的灵活性。

#### 为什么LLM有“大”？

大型语言模型中的“大”一词反映了一个基本原则：大小直接影响性能。 [缩放定律](https://arxiv.org/pdf/2001.08361) 表明模型能力随着更多参数的增加而可预测地提高，从而实现较小模型无法执行的推理和代码生成等复杂任务。最关键的是，算术推理和多语言理解等新兴属性仅在模型超过一定规模阈值时才会出现。规模和能力之间的这种关系解释了为什么数十亿个参数对于实现复杂的语言理解至关重要。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_005_e71e8ccb6c.webp)

](https://substackcdn.com/image/fetch/$s_!LBdv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6538586e-2173-419e-a626-603a5cb4add0_1251x669.png)

_**图1.5** 缩放定律证明了一系列基准中模型大小和性能之间的可预测关系_

LLM有 **数十亿到数万亿个参数。** 第一篇探索缩放定律的重要论文是 **[GPT-3论文](https://arxiv.org/pdf/2005.14165)** (_语言模型是小样本学习者_）。研究表明 **当我们增加模型尺寸时**， 从 **1.3B参数至13B至175B**，模型的性能 **显着改善。**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_006_bc9415585d.webp)

](https://substackcdn.com/image/fetch/$s_!XCDN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa7a90c35-172e-456a-a2eb-b2c48df03a09_1266x738.png)

_**图1.6** 从 20 世纪 50 年代至今，语言模型的规模呈指数级增长。橙色点代表语言模型，其中一些模型已经跨越了一万亿个参数。_

这些年来，我们看到了 **指数增长** 从 20 世纪 50 年代至今，LLM的规模。在上图中， **橙色点** 代表语言模型，显示它们的大小如何随着时间的推移而急剧增加。部分型号已经 **突破1万亿参数！**

#### 为什么我们关心LLM的规模？

大型语言模型的规模很重要，主要是因为涌现的属性：较小模型中不存在的能力，但当模型达到一定规模时会自发出现。这些新兴功能从根本上将大型模型与小型模型区分开来。随着LLM的成长超越特定的参数阈值，他们突然获得了诸如解决复杂算术方程、在不同语言之间进行细致入微的理解以及将字母解读为有意义的单词等技能。这些能力不会随着规模的大小而逐渐提高，而是在特定规模下突然出现，这使得模型大小不仅是一个技术细节，而且是决定LLM可以执行哪些任务的关键因素。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_007_c3d14a540e.webp)

](https://substackcdn.com/image/fetch/$s_!lcrc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ce4bbd8-55d7-4c6b-8e58-795c36ea19dd_1296x729.png)

_**图1.7** 大型语言模型的新兴能力。某些任务的性能保持在接近于零的水平，直到模型达到临界尺寸，之后准确性急剧上升。_

在上图中， **X轴代表模型尺寸** （或计算能力），我们可以观察到 **接送点,** 模特们的舞台 **突然开始表现明显更好** 在这些任务中。 [大型语言模型的新兴能力](https://arxiv.org/pdf/2206.07682)

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_008_7b80b7b6c0.webp)

](https://substackcdn.com/image/fetch/$s_!4ztO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4ee2044-608e-4392-b839-8fbc250e4e43_1191x600.png)

_**图1.8** 在更大范围内，LLM超越了简单的单词预测，擅长执行多语言翻译、文本摘要和语法纠正等专业任务。_

在更大的范围内，LLM超越了简单的单词预测，擅长执行多语言翻译、文本摘要和语法纠正等专业任务。从基本预测到复杂语言理解的演变推动了构建越来越大型语言模型的竞赛。不同 NLP 任务的参数数量和性能之间的直接相关性使得规模成为关键的竞争优势。

## 1.2 Transformer块的剖析

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_009_e1214dd666.webp)

](https://substackcdn.com/image/fetch/$s_!SNlH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe14e2ffb-c10d-48ec-987c-b9fe4248c1e7_933x1092.png)

_**图1.9** 来自“Attention Is All You Need”论文的原始 Transformer 架构，由左侧的编码器堆栈和右侧的解码器堆栈组成，通过交叉注意力连接。_

2017 年开创性论文中介绍的Transformer架构 [“你所需要的就是注意力”](https://arxiv.org/pdf/1706.03762) 彻底改变了人工智能和自然语言处理。这篇论文目前已被引用超过 20 万次，提出了自注意力的概念，从根本上改变了我们实现 NLP 系统的方式。 Transformer 架构由两个主要组件组成：编码器和解码器。编码器架构为 BERT 等模型提供动力，而解码器架构构成了 GPT 和 ChatGPT 的基础。

现代 LLM 的核心在于这种 Transformer 架构，它用自注意力机制取代了 LSTM 和 GRU 等传统模型。这项创新带来了关键的优势：捕获文本中的长距离依赖性的能力、能够实现更快训练的并行处理以及允许构建日益强大的模型的前所未有的可扩展性。了解解码器部分的工作原理本质上揭示了 GPT 模型的工作原理，因为它们只是解码器架构。

Transformer块本身包含几个按顺序工作的关键组件。输入文本首先被token并转换为嵌入，然后与位置编码相结合。这些流经多头注意力、标准化和前馈网络层，并应用 dropout 进行正则化。输出层最终产生用于下一个token预测的 logits。虽然完整的架构图可能因其众多的模块和连接而显得复杂，但每个组件都有特定的用途，将输入文本转换为有意义的预测。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_010_09bb43f474.webp)

](https://substackcdn.com/image/fetch/$s_!BWeA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F27cb3b6d-7c69-482f-b5eb-1f87e1a76494_1170x849.png)

_**图1.10** 一个简化的仅解码器Transformer，显示主要组件：token和位置嵌入、具有多头注意力的Transformer块、前馈网络、层归一化和 dropout，然后是输出层。_

仅解码器架构为 GPT 等模型提供动力，可以通过检查 Transformer 解码器组件的简化版本来理解。虽然完整的架构可能看起来很复杂，有许多互连的模块，但为了清晰起见，我们可以将其分解为三个可管理的部分。这种模块化方法使我们能够系统地检查每个组件，而不是试图立即掌握整个系统。通过依次关注这三个核心部分，我们可以全面了解解码器如何将输入文本转换为预测。

LLM 架构的三个部分是输入、处理和输出。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_011_4c01755194.webp)

](https://substackcdn.com/image/fetch/$s_!dA9N!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc765a97b-410b-42db-8bf8-3c0e11fe5587_1119x900.png)

_**图1.11** LLM 的三个阶段：输入阶段（Tokenization和嵌入）、处理阶段（Transformer块）和输出阶段（用于下一个token预测的线性层和 softmax）。_

所以一切都始于 **输入级**，在进入之前发生了几个关键的转变 **处理单元**，通常称为 **Transformer块**.

首先，原始文本经过 **Tokenization**，将句子分解为更小的单元的过程，称为 **token**，这些可以是单词、子单词或字符，具体取决于所使用的Tokenization方法。这一步确保模型能够有效地处理语言，

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_012_1d49d3b66d.webp)

](https://substackcdn.com/image/fetch/$s_!mlkV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf3bf47e-a3bb-4250-9d59-0718154cdccd_1272x264.png)

_**图1.12** 输入管道：原始文本被标记为子字单元，每个token接收一个数字嵌入，并添加位置嵌入以编码序列顺序。_

接下来，每个token通过以下方式转换为数字表示： **token嵌入**。这些嵌入为每个token分配一个唯一的向量，捕获语义和单词之间的关系。然而，由于token嵌入本身并不能保留序列顺序，因此我们引入 **位置嵌入**。这些嵌入对句子中每个token的位置进行编码，使模型能够理解 **顺序和结构** 输入的。

通过Tokenization、token嵌入和位置嵌入，输入现在已完全准备好 **Transformer块**，其中深度学习机制，例如 **多头注意力和前馈神经网络**，处理文本以生成有意义的预测。

### 1.3 Tokenization

在文本进入转换器模型之前，它会经历Tokenization，这是一个将原始文本转换为token的过程，然后为token分配唯一的 ID。Tokenization方法主要有三种，每种方法都有不同的特点。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_013_5ffcfa1eba.webp)

](https://substackcdn.com/image/fetch/$s_!I-93!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb7f83f76-66c2-4c71-a80c-5bc1539234cc_1530x183.png)

_**图1.13** 应用于单词“Tokenization”的三种Tokenization策略：基于单词（每个单词一个token）、基于字符（每个字符一个token）和基于子词（有意义的子词单元）。_

基于单词的Tokenization将每个完整的单词视为单独的token，创建词汇表中所有单词的字典。虽然直观，但这种方法在词汇量方面遇到了困难，并且无法有效地处理新单词或拼写错误的单词。基于字符的Tokenization将文本分解为单个字符，使每个字符成为一个token。这会产生非常小的词汇量，但会产生非常长的序列，处理起来的计算成本很高。

基于子词的Tokenization是现代LLM的首选方法，它将单词分解为有意义的子词单元。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_014_d452490e91.webp)

](https://substackcdn.com/image/fetch/$s_!xlNJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb290ec8d-c044-4329-aaee-57bd7d9d00c1_459x264.png)

_**图1.14** 子词Tokenization示例：单词“playground”分为“play”和“ground”，每个都是可重用的有意义的单元。_

子词是一个较小的有意义的单元，可以在不同的单词之间重复使用。例如，“playground”可能会分为“play”和“ground”，而“unhappiness”可能会变成“un”和“happiness”。这种方法允许模型通过识别熟悉的组件来理解新单词。 “神经”一词可能被标记为“ne”和“ural”，使模型能够处理以前从未见过的变化和新组合。

当处理具有共同词根的相关词时，子词Tokenization的优势变得显而易见。该模型可以利用共享的子词模式，而不是将每个变体视为全新的token。这减少了词汇量，同时保持了表示任何文本的能力，使其成为大型语言模型的最佳选择。类似的工具 [TikTokenizer](https://tiktokenizer.vercel.app) 演示原始文本如何分解为这些子词token，揭示LLM用来理解和生成语言的构建块。

#### 1.3.1 Tokenization方法的问题

**基于单词的Tokenization限制**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_015_5101d2521b.webp)

](https://substackcdn.com/image/fetch/$s_!vw13!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8a6bed41-e0cd-4bb9-86e0-6e59a95df8ff_1155x639.png)

_**图1.15** 基于单词的Tokenization的局限性：诸如“learn”、“learn-ing”、“learned”和“learnt”之类的相关单词被视为完全独立的token，并且无法处理词汇表之外的单词。_

基于单词的Tokenization将每个单词视为一个独立的单元，这给语言模型带来了根本性的挑战。最重要的问题是无法识别相关单词之间的关系。具有共同词根的单词（例如“learn”、“learning”、“learned”和“learnt”）被视为完全独立的token，迫使模型独立学习每个变体，而不了解它们之间的联系。

词汇量爆炸带来了另一个关键问题。仅英语就需要超过 200,000 个单词token，其中诸如“this”、“is”和“a”之类的填充词尽管贡献的语义价值极小，但却消耗了宝贵的词汇空间。最关键的是，词汇量不足的问题使得模型在遇到看不见的单词时束手无策。简单的拼写错误会将“running”变成无法识别的“runing”，而新术语或专有名词则变得无法处理，导致模型无法对含义做出有根据的猜测

**基于字符的Tokenization的缺点**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_016_6953c2d707.webp)

](https://substackcdn.com/image/fetch/$s_!_K34!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbedeb0d-7a49-47d9-a970-34169a660d45_549x219.png)

_**图1.16** 基于字符的Tokenization将词汇量减少到 256 个 ASCII 字符，但显着增加了序列长度。_

字符Tokenization仅使用 256 个 ASCII 字符解决了词汇量问题，但却产生了严重的新问题。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_017_239d4ca2d6.webp)

](https://substackcdn.com/image/fetch/$s_!7jkO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd95ab27-dc06-4249-8b38-4800ba0b15f2_1290x642.png)

_**图1.17** 通过字符Tokenization实现序列长度爆炸：“Hello，world！”从几个单词token增长到十三个字符token，并且单个字母不携带任何语义含义。_

序列长度急剧爆炸：“你好，世界！”从两个（或六个）单词token增长到十三个字符token。这种扩展使得处理计算成本昂贵，并且很快耗尽较长文本中的上下文窗口。

更根本的是，字符Tokenization破坏了语义理解。单个字母没有任何意义，迫使模型从头开始重建单词边界和含义。该模型无法识别“最低”和“最高”共享表示最高级的有意义的后缀“est”。当出现“Hello,world!”时作为单个字符，该模型看到的是无意义的符号而不是问候语，完全失去了语言结构的本质。

**子词Tokenization解决方案**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_018_64b56fda7a.webp)

](https://substackcdn.com/image/fetch/$s_!hCuh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fea116c52-9a03-463c-9c38-007670046d9e_531x234.png)

_**图1.18** 子词Tokenization将“现代化”分为“现代”和“化”，这两个可重用的组件在许多英语单词中都存在。_

子词Tokenization提供了最佳平衡，将单词分解为有意义的组成部分。 “现代化”变成“现代化”和“化”，这两个可重复使用的部分出现在许多单词中。这种方法在保留含义的同时保持合理的词汇量，通过熟悉的组件处理新单词，并使token计数保持可控。该模型现在可以通过识别已知的子词模式来理解拼写错误和新术语。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_019_1552be6e97.webp)

](https://substackcdn.com/image/fetch/$s_!VTMU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F00c70d8d-df18-45eb-937c-3f601cc9d126_1149x552.png)

_**图1.19** Tokenization挑战：“学习”应该如何分割？ Byte PairEncoding 提供了系统的、数据驱动的答案。_

挑战依然存在：“学习”应该如何Tokenization？作为一个token，作为“learn”加“ing”，还是进一步分解？字节对编码提供了系统的答案，使用频率分析来确定平衡词汇效率与语义保留的最佳分割。

### 1.4 字节对编码

字节对编码将Tokenization的挑战转化为系统化的过程。 BPE 最初是在 20 世纪 90 年代作为文本压缩算法开发的，现在已成为 GPT 等模型中Tokenization的基础。该算法迭代地合并最常见的字符对，自下而上构建词汇表。

**对于LLM，BPE 系统地构建词汇表。考虑这个语料库的词频：**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_020_2347400f81.webp)

](https://substackcdn.com/image/fetch/$s_!D0Cy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd8ed98b9-629f-4e2a-a6b2-eb93e6178b85_1431x366.png)

_**图1.20** 用于说明 BPE 算法的词频小语料库：“old”出现 7 次，“older”出现 3 次，“finest”出现 9 次，“lowest”出现 4 次。_

**第 1 步：添加词尾token**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_021_003d58acdb.webp)

](https://substackcdn.com/image/fetch/$s_!YLzn!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feba016d7-e2e2-4f5d-bf3f-3b163fe0cf73_1395x384.png)

_**图1.21** 附加到每个单词的词尾token (</w>) 用于区分单词边界并保留形态信息。_

BPE 的第一步添加 **词尾token (</w>)** 来区分单词边界。词语转变为：旧的变成 **老</w>**，变老变成 **较旧的</w>**，最好的变成 **最好的</w>**，最低变为 **最低的**。这 **界碑** 至关重要，因为相同的字符序列根据位置具有不同的含义。序列“est”的作用是 **后缀** 在“最低”中（表示最高级）但作为 **前缀** “尊重”（含义完全不同）。如果没有这些token，分词器就无法区分服务于不同语言角色的相同字符序列，从而丢失有关的关键信息 **词的结构和形态**.

**第 2 步：拆分为角色**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_022_77ba46ae39.webp)

](https://substackcdn.com/image/fetch/$s_!J2gh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5bfe92a5-ce38-40ff-9c4a-0e539b565be7_1053x231.png)

_**图1.22** 每个单词都被分解为单独的字符，为迭代合并提供原子单元。_

添加词尾token后，每个词都是 **分解为单个字符**，将每个都视为一个单独的token。这个词 **老</w>** 变为序列 \[o, l, d, </w>\]，而 **较旧的</w>** 分成 \[o, l, d, e, r, </w>\]。相似地， **最好的</w>** 分解为 \[f, i, n, e, s, t, </w>\] 和 **最低的** 至\[l、o、w、e、s、t、</w>\]。这 **字符级分解** 作为 BPE 的起点，提供 **原子单位** 根据数据中的频率模式，通过迭代合并，可以构建更大、更有意义的token。

**第 3 步：计算字符对和字符对合并**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_023_2430d6aae0.webp)

](https://substackcdn.com/image/fetch/$s_!7WLZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8e6e3f6-aa81-484d-9562-0403a2c4a516_1584x471.png)

_**图1.23** 计算语料库中的相邻字符对，并按词频加权。 “es”对出现 13 次并被选择用于第一次合并。_

现在的算法 **计算所有相邻字符对的数量** 整个语料库，按词频加权。出现“es”对 **13次** （“最好”中的 9 加“最低”中的 4），与具有相同分布的“st”一样。分别出现“ol”和“ld”对 **10次** （“old”中的 7 个加上“older”中的 3 个），而“ne”和“finest”中的“in”则有贡献 **每个出现 9 次**.

以“es”为 **最常见的对**，该算法执行其 **第一次合并**，创建一个新的token“es”并更新表示：finest</w>变成 \[f, i, n, **英语**，t，</w>\]和最低</w>变成 \[l, o, w, **英语**，t，</w>\]。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_024_56677e8266.webp)

](https://substackcdn.com/image/fetch/$s_!RodN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb0bfcee5-e085-4ce2-a16d-b556d30a5280_1572x381.png)

_**图1.24** 第一次合并（“es”）后，对重新计数，“est”成为下一个最频繁的对，触发第二次合并。_

在用这个新的token重新计算配对后，“est”出现的频率很高，引发了 **第二次合并**。token“est”替换了“es”和“t”序列，将 best 转换为进入 \[f, i, n, **东部时间**、 </w>\] 和最低的</w>进入 \[l, o, w, **东部时间**，</w>\]。通过这些 **迭代合并**，BPE 从数据中最常见的模式逐步构建更大、更有意义的token，创建捕获常见语言结构的高效词汇表。

**第四步：建立完整的词汇表**

合并过程不断迭代，识别出日益复杂的模式。 **常用前缀** 像“old”这样的词，当它们频繁出现在多个单词中时，就会变成单个token。 **带结束token的后缀** 就像“est”保留为单位以维持其语法功能。 **频繁的字符序列** 就像“low”合并成单个token，无论它们的位置如何。

经过多次迭代，最终的词汇表变​​成 **分层集合** 不同粒度的token。它包含 **个别字符** \[o, l, d, e, r, f, i, n, w, s, t\] 用于处理稀有序列， **常见子词** \[es, est, old, low, fin\] 出现在多个单词中，以及 **完成常用词** \[旧的</w>，最好的</w>\]经常发生足以保证它们自己的token。这种多层次的词汇使 **高效编码** 常见模式的同时保持对任何可能输入进行token的灵活性。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_025_013dd91d82.webp)

](https://substackcdn.com/image/fetch/$s_!04vJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc538cc8f-8181-4aaf-ac59-07988e26b952_1200x615.png)

_**图1.25** GPT-2 的最终词汇包含 50,257 个token，由 50,000 个 BPE 合并构建而成。每个token都映射到模型内部使用的唯一数字 ID。_

GPT-2 执行 **50,000 次合并** 为了构建其词汇表，创建一个丰富的token集来平衡压缩与表现力。该词汇表中的每个token都被分配了一个 **唯一的tokenID**，模型内部使用的数字标识符。例如，在 GPT-2 的词汇表中，“Building”等常见单词映射到 ID 25954，而“</endoftext>”等特殊token映射到 ID 25954。接收像 50256 这样的 ID，创建一个完整的 **包含 50,257 个 token-ID 对的字典** 它充当文本和数字处理之间的桥梁。

当模型遇到不熟悉的单词时， **优雅地降级** 更小的子词或单个字符，确保对拼写错误、新词或外来术语的稳健处理。这 **后备机制** 使 BPE 具有非凡的弹性，能够处理任何文本，同时保持常见模式的效率。

现在，我们的文本通过 BPE 转换为有意义的token并映射到数字 ID，下一个挑战是将这些离散符号转换为神经网络可以处理的连续数字表示，从而引导我们得出以下关键概念： **嵌入**.

### 1.5 词嵌入

在Tokenization将文本转换为离散符号并为其分配数字 ID 后，我们面临一个根本性的挑战：这些 ID 只是不传达任何语义信息的标签。 “Building”的token ID 25954 不会告诉模型任何有关建筑物、构造或架构的信息。为了使神经网络能够有意义地处理语言，我们需要将这些离散token转换为 **连续数值表示** 捕获语义关系。这是哪里 **词嵌入** 变得至关重要。

**简单编码的局限性**

早期的数值表示方法揭示了严重的局限性。 **独热编码** 将每个token表示为一个由 0 组成的向量，在该token的位置上只有一个 1。对于包含 50,000 个token的词汇表，“cat”可能会被编码为 50,000 个零，除了位置 3 处的一个零。虽然这消除了任意排序，但它创建了 **稀疏的高维向量** 其中每个单词与其他单词的距离相等。 “猫”和“狗”的向量与“猫”和“量子”的向量一样正交，不提供语义信号。相似地， **词袋** 模型计算单词出现次数，但丢失所有顺序信息，将“狗咬人”和“人咬狗”视为相同的，尽管它们的含义相反。

**通过上下文学习意义**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_026_240844c2c8.webp)

](https://substackcdn.com/image/fetch/$s_!3_j-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3dd0160d-a948-49a9-a777-81e1d4e39e49_666x501.png)

_**图1.26** 高维嵌入将语义意义转换为几何坐标。在这个 768 维空间中，语言关系由邻近性定义，将动物和水果等概念分组到不同的邻域中。_

突破来自于 **分布假说**：出现在相似上下文中的单词往往具有相似的含义。如果“咖啡”经常出现在“早晨”、“杯子”和“酿造”附近，而“茶”出现在相似的单词附近，则模型可以了解到咖啡和茶是相关的概念。 **词向量** 通过训练神经网络根据上下文预测单词（CBOW）或根据单词预测上下文（Skip-gram），彻底改变了这种方法。通过数百万个训练样本，网络的隐藏层学会在向量空间中将相似的单词放置在彼此靠近的位置。经过训练后，“国王”自然会聚集在“女王”和“王子”附近，而“香蕉”则与“苹果”和“水果”聚集在一起。最值得注意的是，这些嵌入捕获了 **类比关系** 几何上：向量算术“国王 - 男人 + 女人”产生的向量几乎与“女王”相同，表明该模型已经学习了抽象概念，例如性别和皇室作为空间方向。

**大型语言模型中的嵌入**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_027_f2c42a3813.webp)

](https://substackcdn.com/image/fetch/$s_!8vEa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d9853a7-0260-4dd4-9c1e-d135ab75264e_537x363.png)

_**图1.27：** 密集嵌入向量将token ID 转换为高维表示，其中特定维度对学习到的语义特征进行编码。该层充当学习的查找表，将token映射到唯一的向量，使模型能够捕获细微的语义属性，例如词性或分类关系。_

现代LLM将token ID 转换为 **密集嵌入向量**，通常范围从 768 到 4096 维度，其中每个维度编码在训练期间学到的含义的各个方面。与 Word2Vec 的静态嵌入（其中每个单词都有一个固定的表示）不同，Transformer模型采用 **上下文嵌入** 根据周围的token动态调整。 “银行”一词在“河岸”和“投资银行”中出现时会获得不同的向量表示，从而使模型能够通过上下文消除含义的歧义。这些嵌入是在训练期间端到端学习的，模型会发现最佳表示，从而最大限度地提高其预测下一个token的能力。嵌入层变成 **学习查找表** 它将 50,000 多个token ID 中的每一个映射到高维空间中的唯一向量，其中语义相似性转化为几何接近度。

LLM 嵌入的强大之处在于它们能够同时编码多层语言信息。每个向量捕获 **语义** （猫靠近狗）， **句法角色** （动词与名词分开聚类）， **概念关系** （相似的术语组合在一起），甚至 **抽象图案** 比如情感或形式。通过数十亿个训练示例，该模型学习在该空间中定位token，以便向量运算对应于有意义的转换。这种几何结构使 Transformer 能够通过注意力机制和前馈网络操纵这些向量来执行复杂的推理，将语言理解转化为数学计算。

然而，仅嵌入无法捕捉语言的顺序性质，其中词序从根本上改变了含义。这种限制导致我们 **位置嵌入**，它对序列中每个token的位置进行编码，使 Transformer 能够理解“狗咬人”与“人咬狗”的显着不同。

### 位置嵌入

**对位置信息的需求**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_028_9361288a14.webp)

](https://substackcdn.com/image/fetch/$s_!Ln5k!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb87adbe9-89ae-4701-859b-1ae1a681b7d1_1713x585.png)

_**图1.28：** 位置嵌入通过向token嵌入添加独特的位置感知向量，将顺序上下文引入到 Transformer 架构中。这种求和允许模型区分出现在不同序列位置的相同token，使架构能够捕获句法和引用关系，尽管其本质上是并行的、基于集合的处理性质。_

在自然语言中，词序从根本上决定了意义。考虑一下“狗追猫”和“猫追狗”这两个句子。虽然两个句子都包含相同的单词，但它们的含义根据单词的位置完全不同。像 RNN 这样的传统顺序模型本质上是通过其循环性质来捕获这种顺序的。然而，Transformer 架构通过自注意力同时处理所有 token，将输入视为无序集。如果没有明确的位置信息，Transformer就会为“狗”产生相同的表示，无论它在句子中的位置如何，从而无法区分不同的事件或理解顺序关系。

当处理代词和指称时，这种限制变得尤其成问题。在“狗追球但它无法接住它”中，“it”的两个实例仅根据它们相对于其他词的位置来指代不同的实体。为了解决这一基本限制，Transformers 结合了位置嵌入，将序列顺序信息直接编码到模型的表示中。

#### **整数位置编码：最简单的方法**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_029_0976d0027a.webp)

](https://substackcdn.com/image/fetch/$s_!HHUV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc8e966e3-34bc-4a6b-bb67-3dd12b2eb2fd_690x570.png)

**图1.29：** 通过将token嵌入与基于整数的位置向量相结合来注入位置数据的加法方法，同时注意到大整数值可能会干扰并可能混淆有关原始单词语义的模型的缺点。

最直接的解决方案是为每个位置分配一个唯一的整数值。在此方案中，如果token出现在序列中的位置 300，我们将创建一个位置嵌入向量，其中每个维度都包含值 300。该向量与token嵌入维度匹配，按元素添加到token嵌入中。

对于具有 8 维嵌入空间的具体示例，位置 300 处的token“dog”将接收 \[300, 300, 300, 300, 300, 300, 300, 300\] 的位置嵌入。最终的输入表示成为token嵌入和位置嵌入的总和。

然而，这种方法存在一个严重缺陷：规模不匹配。token嵌入通常包含聚集在零附近的小值，经过仔细学习以捕获语义细微差别。位置值，特别是对于较长的序列，可以任意增大。当位置 500 将 \[500, 500, ...\] 添加到具有诸如 \[0.23, -0.15, 0.08, ...\] 之类的值的精致token嵌入时，位置信号完全压倒了语义信息。该模型失去了区分不同单词的能力，而是专注于它们的位置。

#### **二进制位置编码：限制范围**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_030_e2bccd2e52.webp)

](https://substackcdn.com/image/fetch/$s_!gwb8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5c62418b-3bbd-4695-8be8-70ab0e87e522_630x594.png)

_**图1.30：** 该技术使用二进制位字符串来表示位置，以将值保持在 0 和 1 之间，但它会在嵌入空间中产生突然的跳跃，从而使模型的训练过程变得复杂。_

为了解决整数编码中固有的大小问题，二进制位置编码使用其二进制表示形式来表示位置，自然地将所有值限制在 0 和 1 之间。这种方法将每个位置数字转换为其二进制形式，并直接使用这些位作为位置嵌入向量。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_031_7bf028f995.webp)

](https://substackcdn.com/image/fetch/$s_!3CDH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F54369dc5-d301-4650-8ba6-9ca2659b7a85_858x471.png)

_**图1.31：** 这演示了二进制表示如何在连续的整数位置上变化。它强调了最低有效位位置中的快速位翻转，这会产生频率振荡，使模型的优化变得更加困难。_

考虑显示位置 64 到 75 及其 8 位二进制表示的可视化。第 64 位，相当于二进制的 01000000，成为嵌入向量 \[0, 1, 0, 0, 0, 0, 0, 0\]。这里，每个比特位置对应于嵌入空间中的一个维度，其中i=8代表最高有效位（MSB），i=1代表最低有效位（LSB）。

观察连续位置的模式揭示了一个令人着迷的结构。位置 64 以 \[0, 1, 0, 0, 0, 0, 0, 0\] 开头。位置 65 变为 \[0, 1, 0, 0, 0, 0, 0, 1\]，位置 66 变换为 \[0, 1, 0, 0, 0, 0, 1, 0\]，位置 67 生成 \[0, 1, 0, 0, 0, 0, 1, 1\]。最右边的位 (i=1) 随着每个位置增量而翻转，从而在 0 和 1 之间快速交替。

右侧第二位 (i=2) 遵循不同的节奏，在翻转之前保持两个位置的值。对于位置 64-65，它保持 0，对于位置 66-67，切换到 1，对于位置 68-69，返回到 0，依此类推。第三位(i=3)每四个位置改变一次，从64-67保持稳定，然后翻转为68-71。

这创建了一个分层编码方案，其中每个比特位置以不同的频率运行。 LSB 振荡最快，捕获相邻token之间的细粒度位置差异。向左移动各个位，振荡频率呈指数下降。第四位每 8 个位置改变一次，第五位每 16 个位置改变一次，第六位每 32 个位置改变一次，第七位每 64 个位置改变一次。在翻转之前，MSB (i=8) 在 128 个连续位置中保持不变。

在可视化中，这种模式立即变得显而易见。最右边的列显示每个位置在 (0) 和 (1) 之间不断闪烁。 i=2 列显示成对的相同单元格。 i=3 列显示四组，并且这种加倍模式在所有维度上都持续存在。最左边的列 (i=8) 在整个可见范围内保持一致，因为位置 64-75 都共享相同的 MSB 值 0。

这种编码完美地解决了困扰整数编码的规模问题。现在，每个维度都包含 0 或 1，而不是可能达到数千个的值。当添加到聚集在零附近的token嵌入时，这些二进制值保留语义信息，同时以可比较的规模注入位置信号。

分层结构同时为模型提供了多个粒度的位置信息。较低索引的维度对局部顺序关系进行编码，帮助模型了解哪些token彼此靠近。索引较高的维度捕获全局位置上下文，指示token是否出现在序列的前半部分和后半部分，或者出现在早期季度还是后期季度。

然而，二进制编码引入了一个关键的限制：不连续性。 0 和 1 之间的硬过渡创建阶跃函数而不是平滑梯度。当模型需要学习位置 67 (\[0, 1, 0, 0, 0, 0, 1, 1\]) 和 68 (\[0, 1, 0, 0, 0, 1, 0, 0\]) 之间的关系时，多个维度同时翻转。这些突然的变化使基于梯度的优化变得复杂，因为损失景观包含尖锐的边缘和不连续的区域。

在反向传播过程中，这些离散的跳跃会阻止平滑的梯度流。小参数更新无法逐渐转变模型对二元状态的理解。优化器必须绕过这些不连续性，可能会陷入次优配置或需要仔细的学习率调度来处理不平滑的优化环境。

尽管存在这些挑战，二进制编码展示了可以通过不同频率的振荡模式对位置信息进行编码的关键见解。这一概念上的突破表明不同的维度可以在不同的时间尺度上运行，直接启发了正弦位置编码的发展，该编码保持了这些有益的振荡模式，同时确保整个嵌入空间的连续、可微的表示。

#### **正弦位置编码：连续表示**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_032_5a032449be.webp)

](https://substackcdn.com/image/fetch/$s_!oceS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa821d6d5-84c3-420b-bfb0-78ef1bd2eb14_1443x627.png)

_**图1.32：** 正弦 PE 应用三角正弦和余弦函数来生成连续和有界的位置向量，这使模型能够学习顺序关系，同时避免整数和二进制位置编码中固有的优化挑战和不连续性。_

位置编码的突破来自正弦方法，该方法在开创性的“Attention Is All You Need”论文中引入。该方法保留了二进制编码中发现的振荡模式，同时确保 -1 和 1 之间的平滑连续值，从而消除了阻碍优化的不连续性问题。

**数学基础**

正弦曲线公式在维度上采用交替的正弦和余弦函数：

对于偶数索引尺寸(我\=0,2,4,…), 位置编码定义为：

磷乙(p哦s,2我)\=罪⁡(p哦s100002我d米哦de我)

对于奇数索引维度(我\=1,3,5,…),位置编码定义为：

磷乙(p哦s,2我+1)\=因斯⁡(p哦s100002我d米哦de我)

其中 pos 表示token在序列中的位置， **我** 表示维度索引，并且 **d\_模型** 表示总嵌入维数。常数 **10000** 作为在不同维度上创建波长几何级数的基础。

**频谱分析**

以 GPT-2 的架构为例，d\_model = 768，最大上下文长度 = 1024，我们可以观察不同维度如何以不同频率编码位置信息。对于任何给定位置，我们使用交替正弦余弦公式计算 768 个值。

在最低维度 (i=0)，公式简化为 sin(pos/1) = sin(pos)，从而产生快速振荡。相邻维度使用 cos(pos/1) = cos(pos)。随着维数指数的增加，分母 10000^(2i/768) 呈指数增长，振荡频率逐渐减慢。  

**不同维度的正弦模式**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_033_947cf09994.webp)

](https://substackcdn.com/image/fetch/$s_!qmq6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7c4d4b47-41c6-4f0b-a19f-4abd9bdcf7c1_1489x390.png)

_**图1.33：** 可视化揭示了位置编码在四个不同维度索引中的行为方式：_

在 **我=1**，正弦和余弦分量都极其快速地振荡，呈现为在大约 -1 和 1 之间交替的密集垂直线。这种高频模式几乎随每个位置而变化，捕获相邻token之间的细粒度局部关系。

在 **我=50**，振荡频率明显降低。正弦波和余弦波形成周期跨越大约 20-30 个位置的规则模式。这些中频成分对短语或句子级别的关系进行编码。

在 **我=150**，波浪变得平滑且渐变，可见清晰的正弦曲线。正弦（绿色）和余弦（蓝色）分量保持其 90 度相位偏移，在整个 1024 个位置范围内仅完成 2-3 个完整周期。这些维度捕获关于token是否出现在序列的早期、中期或后期部分的更广泛的结构信息。

在 **我=250**，振荡变得极其缓慢，函数几乎无法在整个上下文中完成一个周期。余弦分量几乎保持在 1 左右恒定，而正弦分量保持接近 0，为全局位置上下文提供稳定的锚定。

正弦编码创建了一个分层表示，其中每个位置接收一个唯一的 768 维指纹。较低的维度在位置之间快速振荡，捕获局部token关系和词序，而较高的维度逐渐变化，编码更广泛的上下文，如段落边界和文档结构。不同频率的多个正余弦对的组合为每个位置生成独特的签名。与二进制编码从 0 到 1 的突变不同，正弦编码提供平滑、连续的函数，可在反向传播过程中实现稳定的梯度流，从而显着提高训练效率。 -1 和 1 之间的有界范围使位置信号保持与token嵌入相当的规模，防止位置信息压倒语义内容，同时允许优化器进行增量改进。

正弦方法具有显着的实际优势：它不需要学习参数，降低了模型复杂性和训练开销，并且其数学公式自然扩展到任意序列长度，有可能实现超出训练上下文大小的泛化。实际上，位置编码是针对最大序列长度预先计算的，并存储为查找表。在处理过程中，这些编码被检索并按元素添加到token嵌入中，在注入位置信号的同时保留语义信息。这种简单而优雅的解决方案同时解决了多个挑战：维护有界值、确保平滑优化、提供唯一的位置识别以及编码多尺度时间信息。这些属性将正弦位置编码确立为 Transformer 架构的基石，激发了众多变化，同时仍以其原始形式在现代语言模型中广泛使用。

## 1.6 Transformer块

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_034_e19be65cae.webp)

](https://substackcdn.com/image/fetch/$s_!vzlj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdae2fc2b-b5ed-4fb3-98d0-3eb22c68dbab_1245x876.png)

_**图1.34** 在 Transformer 块内部：多头注意力、前馈网络、层归一化和 dropout 层依次工作以处理 token 表示_

通过Tokenization和嵌入将原始文本转换为有意义的数字表示后，我们现在进入语言模型的核心：Transformer Block。这才是真正的魔法发生的地方。该块包含多个按顺序工作的组件，包括层归一化、dropout 层和前馈网络。然而，在我们深入研究这些支持元素之前，我们需要了解节目的明星：注意力机制。多头注意力层赋予 Transformer 卓越的理解上下文和单词之间关系的能力，无论它们在句子中出现的距离有多远。一旦我们掌握了注意力的工作原理并探索了随后的前馈网络，我们就可以回过头来了解其他组件（例如 dropout 和层标准化）如何帮助稳定和改进整个系统。现在，让我们关注Transformer真正强大的原因：它们的注意力机制。

## 1.7 注意力机制的必要性

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_035_1f935bf455.webp)

](https://substackcdn.com/image/fetch/$s_!ckXX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc3126410-19cd-43b8-8698-3e72cda4797a_675x267.png)

_**图1.35** 从早期 RNN 到 LSTM 的序列建模方法的时间线、RNN、Transformer 和 GPT 模型的注意力机制。_

前馈神经网络将每个输入视为独立的。对于诸如“The cat sat on the mat”这样的句子，模型会单独处理每个单词，并且没有内置的顺序或上下文概念。这对于语言来说是不够的，语言的意义取决于单词的排列方式。

循环神经网络引入了沿着序列传递的隐藏状态。编码器逐个读取token，在每一步更新其隐藏状态，并将最终状态交给解码器。解码器必须使用这个单个向量作为整个输入句子的摘要。随着序列变长，早期信息被压缩到这种固定大小的状态并逐渐消失。这就是上下文瓶颈。

LSTM 通过单元状态和控制存储内容和忘记内容的门来改善这种情况。与基本 RNN 相比，它们在更长的时间内维护信息，但它们仍然逐步处理token，并且仍然依赖于压缩的隐藏状态。长句子仍然可以克服这个瓶颈。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_036_7cc45a718f.webp)

](https://substackcdn.com/image/fetch/$s_!70c8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2715aee9-a689-47a5-bc2b-139f210052fb_666x393.png)

_**图1.36：** 句子“I will eat”的编码器-解码器 RNN 显示编码器隐藏状态 h1、h2、h3 和必须依赖于单个摘要向量的解码器状态。_

为了更具体地了解瓶颈，请考虑将英语句子“I will eat 翻译成法语”的编码器解码器模型。编码器为三个输入token生成隐藏状态 h1、h2、h3 以及传递给解码器的最终状态。如果没有注意，解码器只能在生成第一个法语单词时使用此最终状态。它没有直接的方法来返回 h1 或 h2。

**注意力**

注意力通过让解码器直接访问所有编码器状态来消除硬瓶颈。在每个解码步骤中，模型都会将当前解码器状态与每个编码器状态进行比较并生成注意力分数。经过 softmax 之后，这些分数就变成了注意力权重，总和为 1。

然后，解码器形成上下文向量作为编码器状态的加权和。如果第一个输入词与当前输出最相关，则其权重可能接近于 1，而其他词则接近于 0。下一步，重新计算权重，模型可以将其焦点转移到句子的不同部分。

在翻译示例中，当解码器生成第一个法语单词时，它可能几乎完全集中在 h1 上。当它移动到第二个法语单词时，它可以更多地关注 h2，依此类推。解码器现在不再依赖于单个最终状态，而是在每一步都可以灵活地查看整个输入序列。

**巴达瑙关注**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_037_8fea73478a.webp)

](https://substackcdn.com/image/fetch/$s_!h_cL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F68ce7bad-59ec-47ef-b9d8-c16e5c95ee94_663x465.png)

_**图1.37：** Bahdanau注意力架构：编码器产生一系列状态，解码器将其自己的状态与由所有编码器状态的加权和形成的上下文向量相结合_

Bahdanau 注意力是这一想法的第一个广泛采用的实施。编码器仍然是一个产生一系列隐藏状态的循环网络。解码器也是循环的，但在预测每个目标token之前，它会计算当前状态和每个编码器状态之间的对齐分数。这些分数成为注意力权重，它们的加权和是用于预测的上下文向量。

注意力权重可以可视化为一个矩阵，其行对应于目标词，列对应于源词。每个单元格显示模型在生成特定目标单词时对特定源单词的关注程度。这种观点将注意力揭示为两个句子之间的软对齐。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_038_748f346aba.webp)

](https://substackcdn.com/image/fetch/$s_!UlIz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F215a9571-23c9-481c-9e8c-74ed79e6b64b_1008x585.png)

_**图1.38**：法语到英语句子对的注意力热图。左侧网格显示整体对齐；右侧网格突出显示模型在生成“欧洲经济区”时如何关注“欧洲经济区”，捕获单词重新排序。_

这些热图显示许多单词沿着近对角线对齐，这表明两种语言的顺序相似。非对角线图案揭示了重新排序的短语。例如，对应于“欧洲”的法语形容词出现在短语的最后，但其注意力权重指向第一个英语单词。这种按含义而不是位置进行对齐的能力使得基于注意力的模型能够处理灵活的词序和长范围依赖性。

最后，记住这个注意力块在前面章节的完整Transformer模型中的位置是有帮助的。 Transformer 编码器和解码器都包含对token和位置嵌入进行操作的堆叠注意力和前馈子层。

我们现在准备好看看为什么注意力成为现代语言模型的中心思想。从简单的循环网络和 LSTM 开始，我们看到了上下文瓶颈如何让我们很难记住长句子的所有细节。 Bahdanau 注意力通过让解码器回顾每个编码器状态并学习源词和目标词之间的软对齐来解决这个问题，我们通过注意力权重和热图将其可视化。到目前为止，注意力已经连接了两个不同的序列，例如英语和法语句子。在下一节中，我们将详细研究自注意力，并了解如何让每个token关注其他token成为Transformer的核心操作。

### 1.8 自注意力机制

#### 自注意力实际上意味着什么？

现在我们了解了注意力的机制，让我们澄清一下是什么造成的 _自己_\- 特别注意，Transformer等现代语言模型背后的关键概念。

#### 两种类型的注意力

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_039_b46f63017c.webp)

](https://substackcdn.com/image/fetch/$s_!0Qjk!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefcfd51b-f8d5-435b-b451-880a7c63be24_694x310.png)

_**图1.39：** 两种类型的注意力：交叉注意力连接不同序列中的单词（例如翻译），而自注意力连接同一序列内的单词。_

要理解 self-attention，我们首先需要看看attention 之前用在了哪里。注意力有两种基本的运作方式：

**序列之间：** 注意力将不同序列的单词连接起来，想想从一种语言翻译成另一种语言。

**在序列中：** 注意力将同一序列中的单词连接起来以捕获关系和上下文。

#### 翻译中的注意

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_040_85b070cc46.webp)

](https://substackcdn.com/image/fetch/$s_!XF0j!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F708737bd-f9e4-467a-a8b0-8b19885b817b_364x272.png)

_**图1.40：** 翻译中的交叉注意力：英语短语“The next day is beautiful”与法语短语对齐，注意力决定哪些源单词对应哪些目标单词。_

在传统的翻译任务中，注意力在两个序列之间进行。想象一下将英语短语“第二天是光明的”翻译成法语。词序可能会改变。 “Day”可能与“jour”一致，但它在法语句子中的位置可能不同。注意力可以帮助模型找出这些跨语言对齐，即哪个英语单词对应哪个法语单词。这对于翻译来说非常有效。但是当我们根本不翻译时会发生什么？

#### 输入自我注意力

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_041_ca8f83ed27.webp)

](https://substackcdn.com/image/fetch/$s_!RWTH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0b52462a-9a4a-44f1-8be9-303368e1927e_296x82.png)

_**图1.41：** 自注意力：单个句子中的每个单词都会关注同一个句子中的所有其他单词，以建立上下文理解。_

考虑一个不同的任务：预测句子中的下一个单词。或者理解代词所指的含义。或者只是试图理解句子的含义。在这里，我们没有两个单独的序列。我们只有一个，就是句子本身。这就是自我关注的用武之地。

自注意力意味着句子中的每个单词都会关注所有其他单词 _在同一句话中_。该模型不是查看两个不同的序列（如英语和法语），而是检查单词在单个序列中如何相互关联。 “天”这个词涉及“下一个”、“明亮”、“那个”，以及它自己句子中的一切。它的注意力转向内部。顺序会自行处理。这就是为什么我们称之为 _自己_\-注意力。我们无法仅使用原始输入嵌入直接在注意力机制中对这些复杂关系进行编码。单词之间的联系取决于上下文、语法、含义以及句子之间变化的其他十几个微妙因素。

那么，当面对无法硬编码的复杂性时，我们该怎么办？我们让模型学习它。我们将其留给可以训练的权重矩阵。在我们深入研究机制之前，让我们先明确一下我们的目标。我们从输入嵌入、单词的数字表示开始。但这就是我们最终想要的结果： **上下文向量**.

#### 有什么区别？

输入嵌入代表一个孤立的单词。无论您谈论的是金融机构还是河边，“银行”的嵌入始终是相同的。但是上下文向量代表一个单词 _正如它在特定句子中出现的那样_，注入了周围单词的信息。

想想

“狗追着球，但是 **它** 抓不到 **它。**”

第二个“it”的输入嵌入不知道“it”指的是什么，它只是一个通用表示。但我们正在构建的上下文向量将携带来自“ball”、“catch”和整个句子的信息。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_042_da449e898a.webp)

](https://substackcdn.com/image/fetch/$s_!SjLz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb20610a-e7fe-45dc-b4bd-ef7e95dbee3c_448x348.png)

_**图1.42：** 从输入嵌入到上下文向量：单词的静态表示通过自注意力从周围所有单词的信息中得到丰富。_

它将 _理解_ 这个特定的“它”指的是球。因此，我们的整个自我注意力之旅、查询、键、我们将要探索的注意力分数，所有这些都服务于一个目的：将静态输入嵌入转换为能够理解上下文含义的动态上下文向量。

## 1.9 理解输入嵌入矩阵

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_043_26779bd1a9.webp)

](https://substackcdn.com/image/fetch/$s_!ZMRe!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52530a2c-9ce0-4c5e-9b79-8995e7b37da3_478x300.png)

_**图1.43：** 对于每个单词，将单词嵌入和位置嵌入相加以生成输入嵌入向量。_

正如我们已经看到的，对于句子中的每个单词，我们都有一个与位置信息相结合的嵌入向量，即单词嵌入加上告诉我们该单词在序列中的位置的位置嵌入。这两者的总和给了我们我们的 **输入嵌入向量** 对于每个单词。

当我们将整个句子的所有这些输入嵌入向量堆叠在一起时，我们得到了所谓的 **输入嵌入矩阵**.

假设我们正在处理这个句子

“第二天天就亮了”

这是五个字。我们的输入嵌入矩阵的维度为 (5, 8)。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_044_dffadc32cf.webp)

](https://substackcdn.com/image/fetch/$s_!Bwux!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1dffb3e-d016-4c40-9ecb-8805f3e05d19_504x300.png)

_**图1.44：** 句子“The next day is Bright”的输入嵌入矩阵具有形状 (5, 8)：五行（每个单词一个）和八列（嵌入维度）。_

这些数字意味着什么？

这 **5行** 来自5个词。够简单的。每个单词在矩阵中都有自己的行。如果我们有十个单词，我们就会有十行。行数始终与序列中的单词数匹配。

这 **8 列** 代表我们为嵌入选择的维度。每个单词都表示为一个 8 维向量，即捕获其含义的八个数字。这个维度是我们在构建模型时决定的。这是一个设计选择。

例如，在 GPT-2 中，嵌入尺寸各不相同：GPT-2 Small 为 768，GPT-2 XL 则高达 1,600。更大的维度可以捕获更细致的信息，但也需要更多的计算。

#### 我们正在解决的问题

现在我们有了输入嵌入矩阵。每个单词都有其 8 维向量。但缺少的是：这些向量是孤立存在的。他们互相不了解。

看看我们句子“第二天是光明的”中的“天”这个词。它的输入嵌入向量只是单词“day”的通用表示。它不知道自己应该注意“明亮”。它在提供时间上下文之前并不知道“下一个”。它不知道应该给予“the”或“is”或句子中的任何其他单词多大的重要性。

这正是我们需要将输入嵌入转换为上下文向量的原因。我们需要整合所有其他单词的信息。我们需要每个单词的表示不仅反映它是什么，而且反映它在这个被这些特定邻居包围的特定句子中的含义。这就是我们即将踏上的旅程。

* * *

在执行任何注意力计算之前，我们必须首先定义输入序列及其相应的嵌入矩阵。我们将使用 PyTorch 库创建一个张量，用于保存示例句子的信息：“第二天是光明的”。每个单词由一个8维向量表示

#### **清单 1.1 定义输入嵌入矩阵**

```
import torch

words = [’The’, ‘next’, ‘day’, ‘is’, ‘bright’]

inputs = torch.tensor([
    [0.32, 0.21, 0.43, 0.21, 0.86, 0.67, 0.98, 0.23], # The
    [0.43, 0.56, 0.43, 0.56, 0.69, 0.21, 0.56, 0.21], # next
    [0.56, 0.21, 0.43, 0.21, 0.54, 0.12, 0.89, 0.98], # day
    [0.87, 0.34, 0.18, 0.32, 0.75, 0.12, 0.54, 0.92], # is
    [0.76, 0.21, 0.85, 0.34, 0.98, 0.23, 0.68, 0.34]  # bright
], dtype=torch.float32)

print(”Input Embedding Matrix:”)
print(inputs)
print(”\nMatrix Shape:”)
print(inputs.shape)
```

**运行前面的代码会打印以下输出**

```
Input Embedding Matrix:
tensor([
[0.3200, 0.2100, 0.4300, 0.2100, 0.8600, 0.6700, 0.9800, 0.2300],  [0.4300, 0.5600, 0.4300, 0.5600, 0.6900, 0.2100, 0.5600, 0.2100],
[0.5600, 0.2100, 0.4300, 0.2100, 0.5400, 0.1200, 0.8900, 0.9800],
[0.8700, 0.3400, 0.1800, 0.3200, 0.7500, 0.1200, 0.5400, 0.9200],
[0.7600, 0.2100, 0.8500, 0.3400, 0.9800, 0.2300, 0.6800, 0.3400]
])

Matrix Shape:
torch.Size([5, 8])
```

输出显示了我们的 **输入** 对象是一个 **张量** 形状为 **火炬.Size(\[5,8\])**。这证实了我们有一个 5 行矩阵，每行一行代表我们的每个 token，还有 8 列，代表每个 token 的 8 维嵌入向量。该矩阵是自注意力机制的起点，但如上所述，这些向量是孤立存在的，并且缺乏来自邻居的任何上下文信息。

### 1.10 从嵌入到查询、键和价值观

这就是我们遇到自注意力核心的地方：三个可训练的权重矩阵，称为查询、键和值。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_045_a9861ef5c1.webp)

](https://substackcdn.com/image/fetch/$s_!_dbx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F583ec1f6-bc6e-4405-8473-d2f182cc64a8_906x262.png)

_**图1.45：** 输入嵌入矩阵乘以三个单独的权重矩阵 Wq、Wk 和 Wv，以生成查询、键和值矩阵_

您可能会想，为什么是三个？为什么不直接使用输入嵌入？

答案在于神经网络的基本原理：它们是通用函数逼近器。如果我们给他们正确的结构，他们就可以学习复杂的模式。因此，我们没有尝试手动编写单词如何相互关联，而是做一些更聪明的事情。

我们在开始时用随机值初始化三个权重矩阵。然后我们让训练过程来解决这个问题。在训练过程中，这些矩阵学习如何以捕获有意义的关系的方式转换嵌入。查询矩阵学习创建“提出问题”的向量。关键矩阵学习创建向量来“回答”它们是否相关。那么价值矩阵？一旦我们知道哪些词很重要，它就会知道实际上应该传递哪些信息。我们并不是告诉模型注意力应该如何发挥作用，而是为它提供了自行学习的工具。

让我们通过一个例子来理解这一点

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_046_f034b2082f.webp)

](https://substackcdn.com/image/fetch/$s_!ekUt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8c24effe-f42e-4607-9d92-a264102e0e9e_296x82.png)

**图1.46：** _句子“The next day is beautiful”中突出显示“next”一词作为当前注意力机制的焦点。_

当我们专注于某个特定词时，请说“下一个”。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_047_ec582a48c3.webp)

](https://substackcdn.com/image/fetch/$s_!wjsX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8bad022a-ad58-4c05-9ccc-cbf736b93e1c_984x170.png)

_**图 147：** “下一个”这个词充当查询，询问它应该对句子中的其他单词给予多少关注。_

我们需要决定它应该对句子中的所有其他单词给予多少关注。这就是我们的术语变得重要的地方。我们关注的词（**“下一个”**）被称为 **查询（问）**.

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_048_6f0c8ac8d2.webp)

](https://substackcdn.com/image/fetch/$s_!vkgL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F55fca8b9-24f6-455d-abfd-9ee99269053b_984x170.png)

_**图 148：** 其他词“the”、“day”、“is”、“bright”用作查询评估相关性的键。_

**句子中的其他单词“the”、“day”、“is”、“bright”被称为键（K）。** 这些是查询将评估的单词。它们是潜在的信息来源。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_049_8abfbcaf0b.webp)

](https://substackcdn.com/image/fetch/$s_!CUo9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6510b275-f5fa-454f-a577-c710430c3833_984x426.png)

_**图 149：** 查询词“next”和所有键之间的注意力分数α。每个分数都量化了“下一个”应该关注其他单词的强度。_

现在到了关键的部分： **注意力得分（α）**。该分数决定了“下一个”对其他每个单词的重要性。 “下一步”应该更关注“日”（紧随其后的词）还是“亮”（更远）？注意力分数准确地告诉了我们这一点。

因此，“下一个”使用这些注意力分数来关注句子中的其他单词，权衡一些更重要，另一些则不太重要。这就是单词构建其对上下文的理解的方式。

例如，注意力分数 **α₂₁** 方法：

-   **“下一个”(X2) 正在关注“The”(X₁)。**
    
-   第一个 **2** 代表“下一个”（句子中的位置 2）。
    
-   第二个 **1** 代表“the”（句子中的位置1）。
    

这 **自我关注的目标** 就是获取这些注意力分数（α值）并用它们来 **修改原始输入嵌入**, 创造 **上下文向量** 包含 **更富有** 信息。

-   **输入嵌入（X2 - “下一个”）**: 只代表单词本身。
    
-   **上下文向量（C2 - “下一个”）**：现在包含 **来自所有相关词的信息** 围绕它，基于注意力分数。
    

不仅仅是将“下一个”视为一个孤立的词， **“下一个”的上下文向量** 现在明白了：

-   “下一个”与“一天”的关系有多大 (α2₃)
    
-   “下一个”与“那个”有多少关系 (α2₁)
    
-   “下一个”与“是”有多少关系 (α2₄)
    

这种转变来自 **上下文向量的输入嵌入** 是什么让 **自我关注如此强大**，它帮助模型理解关系 **单词之间，而不仅仅是单个token**.

> 上下文向量是一种丰富的嵌入向量。它结合了来自所有其他输入元素的信息

#### 查询、键和值矩阵的维度

现在我们来谈谈这些权重矩阵的实际形状和大小。了解它们的维度对于理解自注意力在数学上的工作原理至关重要。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_050_831395bb0c.webp)

](https://substackcdn.com/image/fetch/$s_!66Tp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F840a6e66-e128-4dc9-a08d-316d67d62285_876x526.png)

_**图1.50：** 权重矩阵的维度：Wq、Wk 和 Wv 各自具有形状 (d\_in, d\_out)，其中 din 与嵌入维度匹配，d\_out 是设计选择。_

如果我们查看查询、键和值矩阵（Wq、Wk 和 Wv）的维度，我们会注意到一些有趣的事情。

这 **行数** 在每个矩阵中都等于 **列数** 在我们的输入嵌入矩阵中。请记住，我们的输入嵌入矩阵具有维度 **(5, 8)**， 在哪里 **8 是我们的嵌入维度**。所以我们的权重矩阵将有 8 行。

这 **列数** 然而，在这些权重矩阵中，可以是我们选择的任何内容。这是一个设计决定。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_051_394d4e17c5.webp)

](https://substackcdn.com/image/fetch/$s_!OPNH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb38c4dfe-6963-4389-b024-8e60b6f77098_310x264.png)

_**图1.51：** 术语 d\_in 和 d\_out：din = 8 是输入嵌入维度，d\_out 是为查询、键和值选择的输出维度。_

在编码 GPT-2 或 GPT-3 等语言模型时，我们对这些维度使用特定术语：

**d\_in（输入维度）：** 我们输入嵌入的维度。在我们的示例中，这是 8。

**d\_out（输出维度）：** 我们想要的查询、键和值向量的维度。这是我们的权重矩阵中的列数。

重要的一点是：您可以为 d\_out 选择任何值。在实践中，为了简单起见，它通常设置为等于 d\_in。因此，如果我们的输入维度是 8，我们也可以将输出维度设置为 8。但我们不必这样做。在我们的示例中，我们使用 d\_out = 4。为什么？证明输出维度是灵活的。您可以自由选择最适合您的模型的方式。

#### **清单 1.2：提取token嵌入并设置维度**

```
x_2 = inputs[1]          # embedding for “next”
d_in = inputs.shape[1]   # input dimension
d_out = 4                # dimension for Q, K, V in this toy example

print(x_2)
print(d_in)
print(d_out)
```

这里选择输入矩阵的第二行，这是单词“next”的 8 维嵌入。变量 `d_in` 证实嵌入维数为 8，与理论相符。变量 `d_out` 设置为 2，这意味着在以下示例中每个查询键和值向量将位于二维空间中。在真实模型中 `d_out` 要大得多，但使用 2 可以使打印的张量保持可读。

**输出**

```
tensor([0.4300, 0.5600, 0.4300, 0.5600, 0.6900, 0.2100, 0.5600, 0.2100])
8
4
```

#### 这些矩阵如何学习

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_052_256ad6b552.webp)

](https://substackcdn.com/image/fetch/$s_!hFQu!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47fb5b05-b296-4eb3-87f2-11c00a829b16_754x354.png)

_**图1.52：** 权重矩阵使用随机值进行初始化，并在训练过程中通过反向传播进行更新，学习生成有意义的查询、键和值表示。_

一开始，这些权重矩阵中的所有值都是随机初始化的。他们一开始对语言或注意力模式一无所知。但这就是训练的魔力所在。

当我们使用反向传播训练模型时，这些随机值会逐渐自我更新。矩阵学习哪些转换有助于模型更好地理解语言。

他们学习如何创建提出正确问题的查询向量、识别相关信息的关键向量以及携带正确内容的价值向量。

### 1.11 矩阵乘法快速说明

在我们深入研究嵌入矩阵相乘之前，让我们确保我们对于矩阵乘法的实际工作原理达成共识。 **如果您已经知道这一点，请随意跳过**。但如果矩阵感觉有点模糊，请跟随我一会儿。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_053_ba08519ceb.webp)

](https://substackcdn.com/image/fetch/$s_!k-gS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F050688e4-1c8e-4af6-83ca-9deeeab868cf_702x302.png)

_**图1.53：** 矩阵乘法：形状为 (3, 2) 的矩阵 A 乘以形状为 (2, 3) 的矩阵 B，得到形状为 (3, 3) 的结果。内部尺寸必须匹配。_

我们有 **矩阵A** 有尺寸 **(3, 2)** 和 **矩阵B** 有尺寸 **(2, 3)**。请注意一些重要的事情：矩阵 A 中的列数（为 2）与矩阵 B 中的行数（也是 2）相匹配。这并非巧合。为了使矩阵乘法起作用，这些内部维度必须匹配。

当我们将它们相乘时，我们得到维度为 (3, 3) 的结果。外部维度保留：矩阵 A 的 3 行和矩阵 B 的 3 列。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_054_4275a66584.webp)

](https://substackcdn.com/image/fetch/$s_!UorR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5f22e2ac-08f8-4c8e-938d-6b4f5d886c12_1096x302.png)

_**图1.54：** 矩阵乘法中的逐元素计算：每个输出条目是第一个矩阵的行和第二个矩阵的列的点积。_

要计算结果中的每个元素，您需要从第一个矩阵中取出一行，并将其与第二个矩阵中的一列配对。将相应元素相乘，然后将它们相加。

**例子：** 查找位置 (1, 1) 处的元素：

-   从矩阵 A 中取出第 1 行：\[1, 2\]
    
-   从矩阵 B 中取出第 1 列：\[7, 10\]
    
-   计算：(1 × 7) + (2 × 10) = 7 + 20 = **27**
    

**另一个例子：** 对于位置 (2, 1)：

-   从矩阵 A 中取出第 2 行：\[3, 4\]
    
-   从矩阵 B 中取出第 1 列：\[7, 10\]
    
-   计算：(3 × 7) + (4 × 10) = 21 + 40 = **61**
    

你对每个位置都重复这个模式。行与列的结合，乘法和求和。这就是整个过程。

* * *

#### \[步骤 1\] 创建查询、键和值向量

将输入嵌入矩阵转换为上下文嵌入的第一步很简单：矩阵乘法。让我们从如何创建查询向量开始仔细地完成这个过程。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_055_7000377477.webp)

](https://substackcdn.com/image/fetch/$s_!XJzM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F84bb6337-2753-4dd1-9e2d-f2a1450e5e60_902x392.png)

_**图1.55** 输入嵌入矩阵 (5,8) 乘以查询权重矩阵 W\_q (8,4) 以生成查询矩阵 (5,4)。_

我们将输入嵌入矩阵乘以查询权重矩阵 (W\_q)。这种转换为我们提供了查询向量。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_056_8d216d8bfc.webp)

](https://substackcdn.com/image/fetch/$s_!ZGgK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf39ee72-1f82-4a7d-85c4-78e68d0a2c9b_1659x588.png)

_**图1.56：** 矩阵乘法详解：每个8维词嵌入通过权重矩阵进行投影，产生4维查询向量_

输入矩阵的每一行代表一个具有 8 维嵌入的单词。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_057_0efad44262.webp)

](https://substackcdn.com/image/fetch/$s_!FNBe!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fef2a6b4b-8ac3-4f9d-9cb0-b7c553eeb872_1659x1428.png)

_**图1.57：** 逐步计算显示输入矩阵的一行乘以 W\_q 如何生成查询矩阵的一行。_

当我们将此行乘以权重矩阵时，我们在输出中得到一个新行，a **4维查询向量** 为了那个词。所有五个单词都会同时发生这种情况。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_058_9414016da6.webp)

](https://substackcdn.com/image/fetch/$s_!DF1M!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F917157c6-ea62-46bd-88ec-cca327ec9f21_1106x392.png)

_**图1.58：** 生成的查询矩阵：五个单词现在具有 4 维查询向量，从原始 8 维嵌入转换而来。_

结果？一个查询矩阵，其中五个单词现在都有自己的查询向量，从 8 维转换为 4 维。

#### 完整的图片

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_059_fee6638e58.webp)

](https://substackcdn.com/image/fetch/$s_!mlje!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d6908dd-57c4-48de-9565-9fddcd392325_1022x1190.png)

_**图 1.59：**_ _所有三个投影都是并行的：输入嵌入矩阵同时乘以 W\_q、W\_k 和 W\_v，以生成查询、键和值矩阵，每个矩阵的形状为 (5, 4)_

创建查询向量仅仅是开始。相同的转换过程又发生两次，每次都有自己的权重矩阵，所有转换过程都是并行操作的。

**对于关键向量，** 我们将输入嵌入矩阵乘以密钥权重矩阵 (W\_K)。相同的尺寸，相同的工艺。每个单词都有自己的键向量。

**对于值向量，** 我们将输入嵌入矩阵乘以值权重矩阵（W\_V）。每个单词现在也有一个值向量。

有一点需要认识到：我们已经从 8 维空间转移到 4 维空间。更重要的是，我们已经进入了一个完全不同的空间。我们不再处理输入嵌入，即单词的静态表示。我们现在正在处理查询、键和值向量。每个人都生活在自己的改造空间中，并针对注意力机制中的特定目的进行了优化。

这似乎是一个奇怪的弯路。为什么要改变我们的嵌入？为什么不直接与他们合作？

这个将数据转换到不同空间的技巧是深度学习的基础，它的强大有一个简单的原因：有时我们需要的模式在原始数据中不可见。这样想吧。在计算机视觉中，早期系统使用手工制作的特征，例如边缘和角落。然后，卷积神经网络出现并学会自动发现自己的特征，找到人类从未想过寻找的模式。这就是这里发生的事情。我们并不局限于输入嵌入中的固定关系。相反，我们让模型通过训练来学习哪些转换实际上可以帮助它理解语言。

可以把它想象成同时将我们的输入传递通过三个不同的镜头。每个镜头、每个权重矩阵以不同的方式转换相同的输入嵌入，提取不同方面的含义。当所有三个变换完成后，我们就得到了三个并排的新矩阵，它们都具有相同的维度 (5, 4)。这三个矩阵现在已为注意力机制的下一步做好准备。查询和键将交互以确定谁应该关注谁。但这是下一节的故事。

#### **清单 1.3 初始化查询、键和值权重矩阵**

```
torch.manual_seed(123)

W_query = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)
W_key   = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)
W_value = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)

print(”W_query:”)
print(W_query)
print(”\nW_key:”)
print(W_key)
print(”\nW_value:”)
print(W_value)
```

**输出**

```
W_query:
Parameter containing:
tensor([[ 0.2961,  0.5166, -0.0973,  0.2340],
        [ 0.2517,  0.6886,  0.0451, -0.4128],
        [ 0.0740,  0.8665,  0.3210,  0.0185],
        [ 0.1366,  0.1025, -0.2314,  0.5642],
        [ 0.1841,  0.7264, -0.1035,  0.3399],
        [ 0.3153,  0.6871,  0.2478, -0.1520],
        [ 0.0756,  0.1966,  0.5142,  0.0813],
        [ 0.3164,  0.4017, -0.0879,  0.2904]])

W_key:
Parameter containing:
tensor([[ 0.1186,  0.8274,  0.1040, -0.3055],
        [ 0.3821,  0.6605, -0.2103,  0.1428],
        [ 0.8536,  0.5932, -0.1449,  0.3170],
        [ 0.6367,  0.9826,  0.2553, -0.0872],
        [ 0.2745,  0.6584,  0.0342,  0.5051],
        [ 0.2775,  0.8573, -0.2984,  0.1907],
        [ 0.8993,  0.0390,  0.1206,  0.2843],
        [ 0.9268,  0.7388, -0.0721,  0.3419]])

W_value:
Parameter containing:
tensor([[ 0.7179,  0.7058, -0.1630,  0.3310],
        [ 0.9156,  0.4340,  0.0982, -0.2753],
        [ 0.0772,  0.3565,  0.2056,  0.1468],
        [ 0.1479,  0.5331, -0.0925,  0.2391],
        [ 0.4066,  0.2318,  0.0194,  0.1844],
        [ 0.4545,  0.9737, -0.3086, -0.0417],
        [ 0.4606,  0.5159,  0.1274,  0.0219],
        [ 0.4220,  0.5786, -0.0853,  0.3640]])
```

此代码创建三个可训练的权重矩阵，将输入嵌入转换为查询、键和值向量。  
变量 **d\_in** 是每个输入嵌入的大小，这里是8。变量 **输出** 是我们想要的查询、键和值向量的大小，这里是 4。

张量 **W\_查询**, **W键** 和 **W值** 被包裹在 **torch.nn.参数**，它告诉 PyTorch 这些张量是可学习的权重。在训练期间，梯度下降将更新这些矩阵，以便它们学习有用的变换。  
最后打印的形状确认每个权重矩阵都有形状 `8, 4`，符合理论中行数等于的描述 **d\_in** 列数等于 **输出**.

#### **清单 1.4：计算查询、键和值向量**

```
queries = inputs @ W_query   # shape: (5, 4)
keys    = inputs @ W_key     # shape: (5, 4)
values  = inputs @ W_value   # shape: (5, 4)

print(”queries.shape:”, queries.shape)
print(”keys.shape   :”, keys.shape)
print(”values.shape :”, values.shape)

print(”\nqueries:”)
print(queries)
print(”\nkeys:”)
print(keys)
print(”\nvalues:”)
print(values)
```

**输出**

```
queries.shape: torch.Size([5, 4])
keys.shape   : torch.Size([5, 4])
values.shape : torch.Size([5, 4])

queries:
tensor([[ 0.8840,  2.0469,  0.3419,  0.5755],
        [ 0.8723,  2.0443,  0.3241,  0.3917],
        [ 0.9738,  1.9925,  0.3154,  0.7673],
        [ 1.1051,  2.1175,  0.2772,  0.9102],
        [ 0.9692,  2.5180,  0.2741,  0.8069]])

keys:
tensor([[ 2.2381,  2.7132,  0.0507,  0.8830],
        [ 2.1564,  2.7927, -0.0064,  0.8684],
        [ 2.6705,  2.7739,  0.0891,  1.0862],
        [ 2.4087,  3.1074,  0.0683,  1.0651],
        [ 2.6735,  3.1745,  0.0538,  1.2434]])

values:
tensor([[ 2.1213,  2.5079, -0.2830,  0.7693],
        [ 2.0476,  2.1981, -0.2301,  0.4927],
        [ 2.1971,  2.4733, -0.2806,  0.9121],
        [ 2.4207,  2.5415, -0.3020,  0.9874],
        [ 2.2625,  2.5902, -0.2714,  0.9625]])
```

这里我们将三个权重矩阵应用于完整的输入矩阵。每行 **输入** 是一个单词的嵌入。  
矩阵乘法 **输入** `@` **W\_查询** 获取每个词嵌入并将其投影到查询空间中。结果是一个形状为的查询矩阵 `5, 4`，五个单词中的每一个都有一个长度为 4 的查询向量。键和值也会发生同样的情况。

这反映了文本中的解释，我们现在有三个新矩阵，每个矩阵的大小 `number of tokens, d_out`。我们不再使用原始输入嵌入，而是使用为搜索、被搜索和混合而定制的转换表示。

#### \[步骤2\]计算注意力分数

现在我们有了查询、键和值向量，我们已经准备好进入注意机制的核心：找出哪些单词应该注意哪些其他单词。请记住，每个单词都有一个查询向量和一个键向量。当我们计算查询和键之间的点积时，我们会得到一个表示它们对齐程度的数字。高点积意味着强烈的一致性，这意味着高度的关注。低点积意味着弱对齐，这意味着较少的关注。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_060_23388aa206.webp)

](https://substackcdn.com/image/fetch/$s_!gldU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c9fa9fd-3c3a-4ac1-bc5d-882d08202aba_538x334.png)

_**图1.60：** 查询向量和关键向量之间的点积产生标量注意力分数，指示它们的对齐程度。_

这就是我们遇到的一个小技术障碍的地方。我们希望使用矩阵乘法一次性计算所有这些点积。我们的查询矩阵具有维度 (5, 4)，我们的键矩阵也具有维度 (5, 4)。如果我们尝试直接将它们相乘（Query × Keys），我们就会遇到问题。为了使矩阵乘法起作用，第一个矩阵中的列数必须等于第二个矩阵中的行数。但 Query 有 4 列，Keys 有 5 行。他们不匹配。乘法根本行不通。该问题的解决方法是对Keys矩阵进行转置。

* * *

#### 关于矩阵转置的快速说明

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_061_493ce29b72.webp)

](https://substackcdn.com/image/fetch/$s_!RvNM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22fe456c-7021-4035-a62f-ed157c5657d6_576x297.png)

_**图1.61：** 矩阵转置：行变成列，列变成行，将 (3, 2) 矩阵转换为 (2, 3) 矩阵。_

如果您已经熟悉矩阵转置，请随意 **跳至下一节。** 但如果转置感觉不熟悉或者您想快速复习一下，请跟我呆一会儿。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_062_260f1bf15f.webp)

](https://substackcdn.com/image/fetch/$s_!zBlY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ba794ba-11d8-4708-893a-939db1dc9e47_1614x444.png)

_**图1.62：** 将 Keys 矩阵从 (5, 4) 转置为 (4, 5)，以便它可以与 (5, 4) 查询矩阵相乘。_

当我们转置一个矩阵时，我们沿着它的对角线翻转它。行变成列，列变成行。如果您有一个维度为 (3, 2) 的矩阵，则其转置将具有维度 (2, 3)。原始矩阵的第一行成为转置矩阵的第一列。第二行成为第二列，依此类推。这就像将整个矩阵旋转 90 度并进行反射。这个简单的操作非常有用，因为它可以让我们在维度不匹配时对齐矩阵乘法的维度。

* * *

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_063_4e2d11e092.webp)

](https://substackcdn.com/image/fetch/$s_!RLn5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0a84325b-e1b4-4f95-8134-c8f601791fbf_626x314.png)

_**图1.63：** Keys 矩阵转置：每个单词的键向量变成一列，将 (5, 4) 矩阵转换为 (4, 5)。_

当我们转置 Keys 矩阵时，每一行都变成一列。注意第一行是如何 **“这”** **\[1.4, 1.0, 1.8, 2.2\]** 原始 Keys 矩阵中的第一列变为 **\[1.4, 1.0, 1.8, 2.2\]** 在转置版本中向下阅读。每个词都会发生同样的情况， **“下一个”** 成为第二列， **“天”** 成为第三列，依此类推，将我们的 (5, 4) 矩阵转换为准备乘法的 (4, 5) 矩阵。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_064_1cbc9d99f5.webp)

](https://substackcdn.com/image/fetch/$s_!WiSM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fac8f9f81-7d94-4033-b50e-a5096a6a6153_1245x429.png)

_**图1.64：** 将 Query (5, 4) 乘以 K\_T (4, 5) 会生成 (5, 5) 注意力分数矩阵，捕获每个可能的单词与单词之间的关系。_

Query 和 Keys 向量的点积结果是 (5, 5) 注意力分数矩阵。该矩阵捕获了单词之间所有可能的关系。

#### 解释注意力分数矩阵

现在我们有了注意力分数矩阵，让我们了解它实际上告诉我们什么。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_065_c7baa6220c.webp)

](https://substackcdn.com/image/fetch/$s_!tuQG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff134868-35bb-4722-8400-f068644d682e_561x567.png)

_**图1.65：** (5, 5) 注意力分数矩阵：行代表查询，列代表键。条目 (i, j) 显示单词 i 关注单词 j 的程度。_

(5, 5) 矩阵中的每个数字表示一个单词应该关注另一个单词的程度。阅读这个矩阵的关键很简单：

> **行** 代表 **查询**， 和 **列** 代表 **键**.

让我们看一些具体的例子。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_066_e2e77a656e.webp)

](https://substackcdn.com/image/fetch/$s_!OFAG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe10235d9-2b97-497f-a1a8-f6177fb09c8f_1347x519.png)

_**图1.66：** 读取注意力矩阵：第 2 行第 1 列的条目给出了从“next”（查询）到“The”（键）的注意力分数。_

寻找之间的关注 **“下一个”** 和 **“这”：**

单词“next”位于位置 2，因此我们查看第 2 行。单词“The”位于位置 1，因此我们查看第 1 列。位置 (2, 1) 处的值告诉我们“next”关注“The”的程度。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_067_23077b48c9.webp)

](https://substackcdn.com/image/fetch/$s_!dNhs!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6dff7f0-ba2b-4107-9674-e4da9d4eabd8_1347x519.png)

_**图1.67：** 第 2 行、第 2 列的条目显示了自注意力分数：“下一个”关注自身的程度。_

寻找之间的关注 **“下一个”** 和它本身：

同一个词，但模式成立。第 2 行“next”作为查询，第 2 列“next”作为键。位置 (2, 2) 处的值显示“下一个”关注自身的程度。

这就是有趣的地方。每一行都讲述了一个关于一个单词的注意力模式的完整故事。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_068_80b9673726.webp)

](https://substackcdn.com/image/fetch/$s_!ELKJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9b55187d-82aa-4e76-b8d3-96c362e4899f_486x516.png)

_**图1.68：** 每一行都讲述了一个完整的故事，讲述了一个单词相对于句子中所有其他单词的注意力模式。_

以第二行为例。整行代表“下一个”（查询）和所有其他单词（键）之间的注意力分数。当你在列之间移动时，你会看到“下一个”应该在多大程度上关注“The”，然后是“下一个”本身，然后是“day”，然后是“is”，最后是“bright”。

第一行对“The”执行相同的操作。第三行代表“天”。每一行都遵循这种模式。

#### 注意力分数矩阵的问题

我们有注意力分数矩阵，它捕获了单词之间的关系。但我们需要解决一个根本问题。看第二行，它代表“下一个”应该关注所有其他单词的程度。这些值可能类似于 1.3、0.9、1.9、1.9 和 1.2。这些数字告诉我们相对重要性，但它们很难解释。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_069_fec8ee623a.webp)

](https://substackcdn.com/image/fetch/$s_!rz16!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52ca8b24-be7b-4ec7-bf37-56d171047874_453x453.png)

_**图1.69：** 原始注意力分数的总和不等于 1，并且不能解释为概率。我们需要标准化来创建适当的注意力分配。_

我们真正想要的是做出清晰、直观的陈述，例如“下一步应该将 30% 的注意力集中在‘day’，25% 的注意力集中在‘is’，20% 的注意力集中在自身，15% 的注意力集中在‘The’，10% 的注意力集中在‘bright’。”我们希望百分比之和为 100%，或者用数学术语来说，概率之和为 1。

这将使我们将注意力理解为一种分布，就像饼图的切片一样，我们可以立即看到哪些单词最重要。现在，我们的原始分数没有这个属性（11.0 + 10.2 + 10.1 + 10.4 + 11.2），你得到的是 52.9，而不是 1。每行中的值总和不等于 1，有些甚至可能是负值。我们不能将它们解释为百分比或概率，这会产生两个问题。

首先，存在可解释性问题。我们无法对注意力分配做出明确的陈述。当数字不代表百分比时，我们不能说“下一个对‘bright’给予 22% 的关注”。其次，存在训练稳定性问题。训练大型语言模型时，最好将数字保持在受控范围内，最好在 0 到 1 之间。这使得训练过程更加稳定。梯度表现更好，模型学习更可靠。

这就是我们需要解决的问题，解决方案就是将注意力分数转化为注意力权重。注意力权重有两个关键属性：每行的总和为 1，并且每个单独的权重位于 0 和 1 之间。这种转换称为归一化。

* * *

#### 关于简单归一化和 Softmax 的快速说明

**简单标准化**

最简单的标准化方法很简单。获取一行中的每个值，并将其除以该行中所有值的总和。

_公式_

标准化值\=x我x1+x2+x3+⋯+xn

例子

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_070_ba8f2e328d.webp)

](https://substackcdn.com/image/fetch/$s_!-WmL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35ef0079-534b-4a38-95f1-c98df98c19bc_1785x867.png)

_**图1.70：** 简单标准化将每个值除以行总和，准确保留比例。 Softmax 首先求幂，显着放大差异，因此最大值占主导地位。_

考虑注意力分数\=\[1,2,3,6\]

和\=1+2+3+6\=12

简单的标准化给我们带来：\- 1/12≈0.083(8.3%)\- 2/12≈0.167(16.7%)\- 3/12≈0.250(25.0%)\- 6/12≈0.500(50.0%)

这些值的总和为 1，这很好。差异是成比例的。值 6 是 3 的两倍，标准化后，0.5 是 0.25 的两倍。比例被精确保留。

**Softmax 归一化**

Softmax 采用了不同的方法。它不是直接除以总和，而是首先对每个值求幂，然后按指数总和进行归一化。

_公式_

软最大(x我)\=ex我ex1+ex2+ex3+⋯+exn

例子

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_071_bcdbb0499d.webp)

](https://substackcdn.com/image/fetch/$s_!Kj0Y!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F30cf53c7-7675-4de2-8d68-a7207ff26afc_1785x1140.png)

_**图1.71：** Softmax 归一化：最大值 (6) 接收 93% 的权重，而较小的值则受到严重抑制，从而创建清晰且决定性的注意力分布。_

使用相同的注意力分数\[1,2,3,6\]

第 1 步：对每个值求幂\- e1≈2.72\- e2≈7.39\- e3≈20.09\- e6≈403.43

第 2 步：对指数求和和≈2.72+7.39+20.09+403.43\=433.63

第 3 步：标准化\- 2.72/433.63≈0.006(0.6%)\- 7.39/433.63≈0.017(1.7%)\- 20.09/433.63≈0.046(4.6%)\- 403.43/433.63≈0.930(93.0%)

注意一些戏剧性的事情。现在，最大值 (6) 完全占据主导地位，占据了 93% 的注意力，而较小的值则受到严重抑制（参见图中的条形图）。这是简单归一化和 softmax 之间的主要区别。

#### 为什么 Softmax 效果更好

**差异的放大**

Softmax 有一个至关重要的特性：它放大差异。较大的值会得到不成比例的较大权重，较小的值会得到不成比例的较小权重。这使得最终的分布更加清晰、更加决定性。

在我们简单归一化的示例中，值 6 比 1 大六倍，归一化后，其权重 (50%) 也比 1 的权重 (8.3%) 大六倍。比例保持完全相同。

但使用 softmax 时，值 6 获得 93% 的权重，而 1 只获得 0.6%。这个比例超过150倍！差异急剧放大。这种放大正是我们在注意力机制中想要的。当一个词应该清楚地关注另一个词时，softmax 会使这种关系变得牢固而清晰。该模型可以对将注意力集中在哪里做出大胆、果断的选择。

**处理负值**

Softmax 还有另一个重要的优点：它可以优雅地处理负数。

**简单标准化**

考虑注意力分数\[1,2,−3,5\]

简单标准化：和\=1+2+(−3)+5\=515\=0.20 (20%)25\=0.40 (40%)−35\=−0.60 (−60%)55\=1.00 (100%)

我们有一个问题。负概率（-60%）没有意义。概率必须介于 0 和 1 之间。

**软最大**

软最大：e1≈2.72e2≈7.39e−3≈0.050e5≈148.41

和≈158.57

标准化：2.72158.57≈0.017 (1.7%)7.39158.57≈0.047 (4.7%)0.050158.57≈0.0003 (0.03%)148.41158.57≈0.936 (93.6%)

所有的价值观都是积极的！负分 (-3) 被简单地抑制到接近零 (0.03%)，而最大值 (5) 占主导地位。 Softmax 自动确保所有输出都是有效概率，无论输入值如何。

#### **清单 1.5：计算原始注意力分数**

```
attn_scores = queries @ keys.T     # shape (5, 5)

print(”Attention scores matrix:”)
print(attn_scores)

# attention scores only for the word “next”
idx = 1                            # index 1 is “next”
query_next = queries[idx]          # shape (4,)

keys_T = keys.T                    # shape (4, 5)
attn_scores_next = query_next @ keys_T

print(”\nAttention scores for ‘next’:”)
print(attn_scores_next)
```

**输出**

```
Attention scores matrix:
tensor([[10.3564, 10.4507, 10.9581, 11.3706, 11.7368],
        [10.0395, 10.1182, 10.6117, 11.0026, 11.3353],
        [10.2672, 10.3379, 10.8698, 11.2815, 11.6372],
        [10.5471, 10.6268, 11.1764, 11.5984, 11.9785],
        [11.0007, 11.1326, 11.7058, 12.2208, 12.6405]])

Attention scores for ‘next’:
tensor([10.0395, 10.1182, 10.6117, 11.0026, 11.3353])
```

矩阵 **attn\_分数** 包含缩放或 softmax 之前的所有原始注意力分数。每一行对应一个查询token。每一列对应一个密钥token。入口 **(i,j)** 是token的查询向量之间的点积 **我** 和token的关键向量 **j。**

一步计算完整矩阵只是我们之前对单个token所做的矩阵形式。在代码的第二部分中，我们选择查询 **“下一个”** 并将其与转置的密钥矩阵相乘。所得向量 **attn\_scores\_next** 只是满分矩阵的第一行，并显示了有多强 **“下一个”** 匹配句子中每个单词的键，包括它本身。

* * *

#### \[步骤3\]将注意力分数转换为注意力权重

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_072_0006f35aa8.webp)

](https://substackcdn.com/image/fetch/$s_!wC4X!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35cc6c38-d007-4e35-a8d7-f27737778818_1218x651.png)

_**图1.72：** 逐行应用 softmax 将原始注意力分数转换为归一化注意力权重，总和为 1，从而创建可解释的概率分布。_

现在让我们应用 softmax 将注意力分数转换为注意力权重。我们将在一行中完成这个工作，看看它到底是如何工作的。

看看我们的注意力分数矩阵，让我们将第二行作为“下一个”。 The values are:

\[11.010.210.110.411.2\]

这些分别代表“下一个”应该在多大程度上关注“The”、“next”、“day”、“is”和“bright”。

**第 1 步：对每个分数求幂**

e11.0≈59,874e10.2≈26,903e10.1≈24,343e10.4≈32,960e11.2≈73,130

**第 2 步：计算总和**

和\=59,874+26,903+24,343+32,960+73,130\=217,210

**步骤 3：将每个指数除以总和**

关注:59,874217,210≈0.276 (27.6%)注意下一步:26,903217,210≈0.124 (12.4%)当天注意:24,343217,210≈0.112 (11.2%)注意的是:32,960217,210≈0.152 (15.2%)注意明亮:73,130217,210≈0.336 (33.6%)

现在我们可以做出清晰、可解释的陈述：“next”将 33.6% 的注意力集中在“bright”上，27.6% 的注意力集中在“The”上，15.2% 的注意力集中在“is”上，12.4% 的注意力集中在自己身上，11.2% 的注意力集中在“day”上。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_073_85f0b5f305.webp)

](https://substackcdn.com/image/fetch/$s_!Ko99!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6665c82f-0d35-4a45-990a-7f10af2799cb_1182x504.png)

_**图1.73：** 经过softmax之后的完整注意力权重矩阵：每个值都在0到1之间，并且每行总和为1。_

We apply this same softmax operation to every row in our attention scores matrix.每行都有自己独立的 softmax 变换，将原始分数转换为归一化的注意力权重，总和为 1。结果是我们的注意力权重矩阵，其中每个值都在 0 到 1 之间，每行总和为 1，我们最终可以将这些数字解释为有意义的概率。

* * *

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_074_f495b956a8.webp)

](https://substackcdn.com/image/fetch/$s_!HGG5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8a939138-81a6-45da-b0a4-392c2aeee6f3_1245x582.png)

_**图1.74：** 来自原始Transformer论文的缩放点积注意力公式。_

在我们继续前进之前，有一些重要的事情需要我们一直在构建注意力公式。刚才我们介绍的是 softmax 操作，将注意力分数转换为注意力权重。但实际上，在我们应用 softmax 之前会发生两个额外的操作：按关键维度的平方根进行缩放，并添加掩码。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_075_2a8b072e50.webp)

](https://substackcdn.com/image/fetch/$s_!CB5Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4d4f409-81c6-43fe-ad78-8e5c9cdb628a_1557x426.png)

_**图 1.75：** 完整的注意力管道：计算 QK^T ，按 √ d\_k 缩放，可选地应用掩码，然后应用 softmax 以获得注意力权重_

你可能想知道为什么我们在解释了 softmax 之后现在才提到这一点。原因是教育学上的。首先了解 softmax 可以更容易地理解为什么这些额外的步骤很重要。如果我们同时引入所有三个操作，情况会更加混乱。通过按此顺序学习它们，您不仅会了解这些操作的作用，还会了解它们为何必要。

如果现在这听起来有点抽象，请不要担心。下一节将澄清一切。我们将逐步介绍缩放和掩蔽，到最后，您将准确理解它们如何融入完整的注意力机制。

### 1.12 为什么要衡量注意力分数？

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_076_26c8ad9806.webp)

](https://substackcdn.com/image/fetch/$s_!ohqR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F452d9c4d-2576-4765-a8e6-a4fe56034212_1449x501.png)

_**图1.76：** 缩放因子标准化点积的方差，防止 softmax 产生极其尖锐的分布_

在 Transformer 模型中，注意力机制使用以下公式计算分数：

注意力(问,K,V)\=软最大(问K时间dk)V

该公式的一个关键组成部分是比例因子，

dk.

哪里dk 是键向量和查询向量的维度。

这种缩放不是任意的；这对于稳定培训过程至关重要。

#### 非标度分数的问题

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_077_02690a26ac.webp)

](https://substackcdn.com/image/fetch/$s_!jSaN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb4083918-5d3c-4f92-baf6-f4a368c4a364_885x408.png)

_**图1.77：** 随着关键维度 d\_k 的增加，点积的方差会增加，导致分数较大，从而将 softmax 推向饱和，导致梯度消失。_

注意力分数是根据查询向量 (Q) 和关键向量 (K^T) 的点积计算得出的。点积是元素级积的总和：

q1k1+q2k2+⋯+qdkkdk

问题是，随着维度 (d\_k) 的增加，该点积的方差也会增加。更大的维度意味着更多的项被添加到一起，这可能导致最终分数的幅度非常大。

然后将这些大分数传递到 **软最大** 功能。 softmax 函数对大输入敏感。如果一个分数明显大于其他分数，softmax 将为它分配一个非常接近 1.0 的概率，而所有其他分数将被分配一个非常接近 0.0 的概率。这被称为 **饱和**.

当这种情况发生时，注意力就会变得“坚硬”和“尖锐”，只集中在一个位置上。这使得模型很难学习，因为反向传播期间的梯度变得非常小，有效地消失并停止了该注意力头的训练过程。

#### 统计解决方案

的选择dk 是精确的统计校正。

如果我们假设 (Q) 和 (K) 的分量是均值为 0 且方差为 1 的独立随机变量，则它们的点积 (Q K^T) 的均值将为 0，但方差为 d\_k。为了对其进行归一化，我们希望缩放点积，使其方差保持为 1，无论维度 d\_k 是多少。

点积的标准差是其方差的平方根，即

dk

通过将点积 (Q K^T) 除以其标准差 (，我们确保 softmax 函数的输入具有稳定的方差 1。

#### 让我们计算缩放后的注意力矩阵

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_078_a631779207.webp)

](https://substackcdn.com/image/fetch/$s_!SFX8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fafd7cd53-720e-41f6-a83f-4f9fae79a7e1_768x426.png)

_**图1.78：** 计算缩放注意力分数，关键维度为4，因此√d\_k = 2，并且每个原始分数在softmax之前除以2。_

“Keys Vectors” 具有以下形状的矩阵 **(5, 4)**.

这意味着有 5 个关键向量，每个向量的维度为 **4**.

时间小时eref哦re,dk\=4

缩放因子为dk\=4\=2

为了获得缩放分数，我们必须将“注意力分数”矩阵中的每个数字除以新的缩放因子， **2**.

这就是“注意力分数”

\[10.710.09.910.311.011.010.210.110.411.212.611.711.512.012.813.212.212.012.313.412.511.511.411.512.7\]

计算（除以2）：

\[10.7÷210.0÷29.9÷210.3÷211.0÷211.0÷210.2÷210.1÷210.4÷211.2÷2⋮⋮⋮⋮⋮\]

最终“注意力等级评分”（基于 d\_k=4）：

\[5.355.004.955.155.505.505.105.055.205.606.305.855.756.006.406.606.106.006.156.706.255.755.705.756.35\]

#### **清单 1.6：缩放分数和计算注意力权重**

```
d_k = keys.shape[-1]   # key dimension, 4

# scale scores and convert to attention weights for all tokens

scaled_scores = attn_scores / d_k**0.5
attn_weights = torch.softmax(scaled_scores, dim=-1)

print(”Attention weights matrix:”)
print(attn_weights)
print(”\nRow sums:”, attn_weights.sum(dim=-1))

# same thing, but shown explicitly for the word “next”

scaled_scores_next = attn_scores_next / d_k**0.5
attn_weights_next = torch.softmax(scaled_scores_next, dim=-1)

print(”\nScaled scores for ‘next’:”)
print(scaled_scores_next)
print(”Attention weights for ‘next’:”)
print(attn_weights_next)
print(”Sum of weights for ‘next’:”, attn_weights_next.sum())
```

**输出**

```
Attention weights matrix:

tensor([[0.1331, 0.1401, 0.1781, 0.2413, 0.3074],
        [0.1375, 0.1430, 0.1779, 0.2361, 0.3056],
        [0.1342, 0.1394, 0.1797, 0.2406, 0.3060],
        [0.1307, 0.1352, 0.1776, 0.2426, 0.3139],
        [0.1180, 0.1271, 0.1660, 0.2553, 0.3336]])

Row sums: tensor([1., 1., 1., 1., 1.])

Scaled scores for ‘next’:

tensor([5.0198, 5.0591, 5.3059, 5.5013, 5.6677])
Attention weights for ‘next’:

tensor([0.1375, 0.1430, 0.1779, 0.2361, 0.3056])

Sum of weights for ‘next’: tensor(1.)
```

当关键维度增加时，原始点积会变大并且难以解释。因此，第一步通过除以关键维度的平方根来缩放分数 **d\_k**。这使得分数的方差大致保持恒定，并防止 softmax 产生极其尖锐的分布。

致电给 **火炬.softmax** 然后将每一行缩放分数转换为适当的概率分布。所有条目都在 0 到 1 之间，每行总和为 1，如打印的内容所确认 **row sums**。位置上的注意力权重 **(i,j)** 现在表示token的分数 **我**分配给 token 的注意力 **j。**

例如，向量 **attn\_weights\_next** 显示了这个词如何 **“下一个”** 将注意力分散到五个token上。在上面的示例中，它将大约百分之三十的权重放在最后一个单词上，其余的百分之七十分布在前面的单词上。

#### \[步骤4\]从注意力权重到上下文向量

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_079_31401588c3.webp)

](https://substackcdn.com/image/fetch/$s_!9f2c!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F338cb0ea-ce60-4769-9075-e3e3ccaeea68_978x228.png)

_**图 1.79：** 自注意力的最后一步：将注意力权重矩阵乘以值矩阵以产生上下文向量。_

> **简要说明：** 本节描述的计算说明了缩放点积注意力的核心机制。为简单起见，此示例不应用因果或前瞻屏蔽，这在基于解码器的模型（如 GPT）中至关重要，以防止token“看到”未来的token。

在自注意力机制中，最后一步是计算 **上下文向量** 对于每个token。一个常见的误解是注意力集中在原始输入嵌入上。相反，注意力被用来创建新的加权和， _转变的_ 输入的表示。这种新的表示形式称为 **值（V）矩阵**.

#### 值 (V) 矩阵的作用

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_080_8b0cd6ef4a.webp)

](https://substackcdn.com/image/fetch/$s_!LROB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44b98b9b-f1f4-4d77-829a-9985218708e0_960x378.png)

_**图1.80：** 值矩阵是通过将输入嵌入乘以单独的权重矩阵 W\_V 创建的。它提供根据注意力权重混合的表示。_

正如我们通过将输入嵌入 (X) 与可训练权重矩阵（W\_q 和 W\_k）相乘来创建查询 (Q) 和键 (K) 矩阵一样，我们通过将输入嵌入与其自身的可训练权重矩阵 W\_v 相乘来创建值 (V) 矩阵。

V\=X×瓦v

这种转变至关重要。它允许模型学习输入token的表示，即 _专门针对构建最终的上下文输出进行了优化_。键矩阵是为了“被搜索”而设计的，而查询矩阵是为了“搜索”而设计的，而值矩阵是为了“被混合”而设计的。

我们不是直接混合输入向量，而是混合这些新的值向量。这赋予模型更多的灵活性和表达能力。

#### 计算上下文矩阵

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_081_99a6e24b52.webp)

](https://substackcdn.com/image/fetch/$s_!Z70_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd5ace98f-6087-4486-8186-e240d7580e0a_1215x501.png)

_**图 1.81：** 上下文矩阵被计算为单个矩阵乘法：注意力权重 (5, 5) 乘以值 (5, 4) 生成 (5, 4) 上下文矩阵，每个token包含一个上下文向量。_

最终上下文矩阵的计算是单个矩阵乘法：

C哦ntext\=一个ttent我哦n瓦e我克小时ts×V

让我们使用示例中的维度来分解它。

1\. **注意力权重（A）：** 这是我们之前计算的归一化分数的 (5, 5) 矩阵。该矩阵的每一行 (i) 代表token (i) 对每个其他token（包括其自身）的“注意力”。

2\. **值（V）矩阵：** 这是变换后的输入向量的 (5, 4) 矩阵。每行对应一个token，但它现在存在于维度为 4 的“值空间”中。因此，乘法为：

上下文(5,4)\=注意力权重(5,5)×V(5,4)

生成的 (5, 4) 上下文矩阵包含五个新的上下文向量，每个输入token一个。每个新向量的维度都是 4，与我们的值空间的维度相匹配。

#### 什么是上下文向量？

最终上下文矩阵中的每一行都是其相应token的新的“上下文感知”向量。这个新向量是 **加权和** 的 _全部_ 序列中的值向量。让我们通过计算第三个token的上下文向量来说明， **“天”** （第 3 行）。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_082_46e8f80ba1.webp)

](https://substackcdn.com/image/fetch/$s_!KMCy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa82457ed-ad0e-466c-b24e-78d5d3090d74_1203x501.png)

_**图1.82：** 计算“day”的上下文向量：将其注意力权重与相应的值向量相乘并求和以生成混合来自所有token的信息的新表示。_

1\. 获取权重：我们从注意力权重矩阵中取出第 3 行。这些是来自的权重 **“天”** 到所有其他token：

\[0.280.120.090.160.35\]

2\. **获取值：** 我们使用 _全部的_ (5, 4) **价值** 矩阵。

V\=\[1.51.21.62.41.41.21.72.11.41.51.52.11.61.61.82.01.71.71.62.4\]

3\. **执行加权和：** “day”的新上下文向量是通过将其注意力权重乘以相应的值向量并对结果求和来计算的：

“天”的上下文向量\=(0.28×V这)+(0.12×V下一个)+(0.09×V天)+(0.16×V是)+(0.35×V明亮的)(1,4)

\[1.571.471.642.27\]

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_083_f5827d2c1b.webp)

](https://substackcdn.com/image/fetch/$s_!gyXB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd31cbb52-0b6d-4108-819b-a9b33b22d537_1209x687.png)

_**图1.83：** 显示“day”的上下文向量的第一个元素如何计算为所有值向量的第一个元素的加权和的详细计算。_

由于涉及的值数量太多，矩阵计算有时会让人感到不知所措，因此您可以看到如何计算token“day”的上下文向量第一列中的值。

这个新向量是所有token“值”表示的混合或加权平均值。混合由注意力分数决定。在这种情况下，“day”的新含义受“bright”值（35%）的影响最大，其次是它自己的原始值（9%），以及其他token的值。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_084_2536945f1b.webp)

](https://substackcdn.com/image/fetch/$s_!xdm3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77672a56-3385-4170-bc23-20412046f5b6_1398x396.png)

_**数字** **1.84 :** 完整的转换：输入嵌入（静态、上下文无关）通过自注意力机制转换为上下文向量（动态、上下文感知）。_

我们从输入嵌入矩阵开始，其中每个token的向量单独表示其含义，不知道其周围环境。自注意力机制通过将这些静态输入投影到三个新空间中来对其进行转换：查询、键和值。通过比较查询矩阵和关键矩阵，模型生成注意力权重矩阵。该权重矩阵充当精确的“混合配方”，量化序列中每个token与每个其他token的确切相关性和关系。结果是上下文向量矩阵，其中每个token的原始向量被新的上下文感知表示替换。这种从孤立的、静态的意义到丰富的、情境化的表示的根本转变是自注意力机制的核心力量。

#### **清单 1.7：根据注意力权重计算上下文向量**

```
# compute context vectors for all tokens
context = attn_weights @ values      # shape (5, 4)

print(”Context vectors:”)
print(context)
print(”context.shape:”, context.shape)

# context vector for the word “next” only
context_next = attn_weights_next @ values
print(”\nContext vector for ‘next’:”)
print(context_next)
```

**输出**

```
Context vectors:
tensor([[ 2.2118,  2.4971, -0.2800,  0.8843],
        [ 2.2038,  2.4754, -0.2794,  0.8741],
        [ 2.2062,  2.4855, -0.2796,  0.8797],
        [ 2.2100,  2.4933, -0.2802,  0.8884],
        [ 2.2229,  2.5209, -0.2808,  0.9064]])
context.shape: torch.Size([5, 4])

Context vector for ‘next’:
tensor([ 2.2038,  2.4754, -0.2794,  0.8741])
```

自注意力的最后一步是使用注意力权重作为系数来组合值向量。每个上下文向量都是所有值向量的加权和，其中权重来自注意力矩阵中的相应行。

矩阵乘积

**上下文 = attn\_weights @ 值**

立即对所有五个token实施此操作。自从 **attn\_权重** 有形状 **5, 5** 和 **价值观** 有形状 **5, 4**，结果有形状 **5, 4**。中的每一行 **语境** 是句子中一个token的新上下文感知表示。

行 **上下文\_下一个** 显示更新后的表示 **“下一个”**。它与值向量位于相同的 4 维空间中，但它现在根据学习到的注意力模式对句子中所有token聚合的信​​息进行编码。这正是理论部分在讨论从静态输入嵌入到动态上下文向量时描述的转换。

#### **清单 1.8：将 Self-Attention 备份到 PyTorch 模块中**

```
import torch.nn as nn

class SelfAttention(nn.Module):

    def __init__(self, d_in, d_out):
        super().__init__()
        self.W_query = nn.Parameter(torch.randn(d_in, d_out))
        self.W_key   = nn.Parameter(torch.randn(d_in, d_out))
        self.W_value = nn.Parameter(torch.randn(d_in, d_out))

    def forward(self, x):
        queries = x @ self.W_query    # (seq_len, d_out)
        keys    = x @ self.W_key      # (seq_len, d_out)
        values  = x @ self.W_value    # (seq_len, d_out)

        attn_scores  = queries @ keys.T
        d_k = keys.shape[-1]
        attn_weights = torch.softmax(
            attn_scores / d_k**0.5, dim=-1
        )

        context = attn_weights @ values
        return context

torch.manual_seed(123)
sa = SelfAttention(d_in=8, d_out=4)
out = sa(inputs)
print(out.shape)
```

输出

```
torch.Size([5, 4])
```

这 **班级** 将缩放点积自注意力的各个步骤收集到可重用的组件中。构造函数创建三个可训练参数矩阵，每个矩阵的形状 **d\_输入、d\_输出**。当模块是模型的一部分时，这些参数将由 **优化器** 训练期间。

这 **向前** 方法实现了我们手动导出的相同管道。它将输入嵌入投影到查询、键和值中，使用单个矩阵乘积计算所有注意力分数，使用 softmax 对其进行缩放和标准化，最后使用生成的权重将值向量混合到上下文向量中。

最后两行创建了一个图层实例 **d\_in** 等于 **8** 和 **输出** 等于 **4**，将其应用于输入句子并打印输出的形状。结果 **5, 4** 确认对于五个token的序列，该层返回五个上下文向量，每个向量都存在于注意力头的 4 维空间中。这正是将传递到Transformer块中的前馈网络的表示。

### 1.13 因果关系蒙面关注

在上一节中，我们研究了自注意力如何将输入嵌入转换为上下文感知向量。然而，这种解释忽略了生成模型的一个重要组成部分： **因果关注**。这种机制很重要，因为它确保模型尊重文本的顺序，并且不会通过查看未来的token来“欺骗”。

现在您已经对完整的自注意力管道有了深入的了解，现在是介绍这个概念的最佳时机。该掩蔽步骤直接应用于注意力分数，就在 softmax 函数之前，以阻止序列中后续位置的任何信息。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_085_af639565c8.webp)

](https://substackcdn.com/image/fetch/$s_!vwwM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbf983454-2dee-4cd0-97c4-4fdb048e2c78_498x288.png)

_**图 1.85：** 因果屏蔽确保在处理token i 时，模型只能处理位置 0 到 i 的token，从而防止未来token的信息泄漏。_

像 ChatGPT 这样的大型语言模型通过一次预测一个token来生成文本。每个预测的token都附加到输入中，创建一个不断增长的上下文窗口，用于预测下一个token。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_086_060a3c423e.webp)

](https://substackcdn.com/image/fetch/$s_!r0Va!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F12bc6d99-d215-4826-92bd-bd97af3f9a6b_921x369.png)

_**图1.86：** 顺序文本生成：模型一次预测一个token，将每个预测附加到输入，然后生成下一个。_

这个顺序过程施加了一个基本约束：当计算任何token的上下文向量时，只有该token和前面的token应该有影响。未来的token不得贡献，因为它们尚未生成。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_087_e4cf64c218.webp)

](https://substackcdn.com/image/fetch/$s_!KLup!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb8dd0410-ba90-4236-a286-6fab2f5720e8_1026x504.png)

_**图1.87** 因果约束：在处理“科学”时，模型只能访问“计算机”及其自身。 “is”、“the”和后续token被屏蔽。_

考虑顺序 **“电脑”** , **“科学”**, **“是”** , **“这”**, **“学习...”** 加工时 **“科学”** ，模型应该只访问它自己并且 **“电脑”** 。一定不能看到 **“是”**, **“这”**，或任何后续token。相似地， **“电脑”** 应该只顾自己，而 **“是”** 可以参加 **“电脑”**, **“科学”** ，以及它本身，但不包括它后面的token。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_088_289dbc5e8c.webp)

](https://substackcdn.com/image/fetch/$s_!IU1L!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49a1e4aa-ac3c-44ad-9f35-ef25ed58cc85_1170x747.png)

_**数字** **1.88:** 下三角注意矩阵强制执行因果约束。对角线上方的所有条目均为零，确保没有token参与未来的位置。_

为了强制执行此约束，我们使用屏蔽注意力。对于充当查询的每个token，我们通过将其注意力分数设置为零来屏蔽与未来位置相对应的所有键。token **“电脑”** 仅对其自身具有非零注意力分数。token **“科学”** 注意力分数为 **“电脑”** 及其本身，但所有未来token的得分为零，例如 **“是”** 和 **“这”** 。这种掩蔽创建了一个下三角注意矩阵，其中对角线上方的所有条目均为零。

屏蔽后，我们将每行中剩余的注意力权重标准化为总和为 1。为了 **“电脑”** ，单个剩余权重设置为1。为了 **“科学”**，剩余的两个权重被归一化，因此它们的总和等于 1。这种标准化是通过对每行中的非屏蔽权重求和并将每个权重除以该总和来实现的，从而在每个查询可以处理的token上创建适当的概率分布。这种机制称为因果注意或掩蔽自我注意，使语言模型能够生成连贯的文本，同时尊重预测的顺序性质。

#### 通过零掩蔽实现因果注意力

为了实现因果注意力，我们可以从原始注意力分数开始。考虑序列“计算机科学就是研究”的 5x5 注意力得分矩阵

#### 第 1 步：初始注意力分数

这是原始的、非标准化的矩阵。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_089_056a375bc5.webp)

](https://substackcdn.com/image/fetch/$s_!GQ3u!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e8f8a9b-eb24-416f-b44f-74f6a287468f_444x406.png)

_**图 1.89：** 应用任何掩蔽之前的原始 5×5 注意力得分矩阵。_

在 PyTorch 中，我们可以使用以下函数构建下三角掩模 **火炬.tril()**

```
torch.tril(MatrixA)
```

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_090_16a90b3ff6.webp)

](https://substackcdn.com/image/fetch/$s_!O4Ok!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a9f6e7c-c5e1-4cbc-a349-96413c101795_1170x546.png)

_**图1.90：** torch.tril() 函数创建一个下三角掩码：对角线上方和下方的 1，上方的 0。_

此函数创建一个矩阵，其中对角线上方和下方的元素为 1，而对角线上方的元素为 0。该掩码矩阵的大小必须与我们的注意力得分矩阵的维度相匹配，这是由上下文长度决定的。

上下文长度只是序列中当前token的数量。对于示例序列“计算机”、“科学”、“是”、“该”、“研究”，上下文长度为 5。

#### **清单 1.9：使用 torch.tril 理解三角形遮罩**

```
import torch

# A simple 3x3 example matrix

A = torch.tensor([
    [1., 2., 3.],
    [4., 5., 6.],
    [7., 8., 9.],
])

print(”A:”)
print(A)

# Lower-triangular version of A

A_tril = torch.tril(A)

print(”\ntorch.tril(A):”)
print(A_tril)

# A pure mask built from ones

mask_ones = torch.tril(torch.ones_like(A))

print(”\nLower-triangular mask from ones:”)
print(mask_ones)

# Using the mask to zero out the upper triangle

A_masked = A * mask_ones

print(”\nA * mask_ones:”)
print(A_masked)
```

**输出**

```
A:
tensor([[1., 2., 3.],
        [4., 5., 6.],
        [7., 8., 9.]])

torch.tril(A):
tensor([[1., 0., 0.],
        [4., 5., 0.],
        [7., 8., 9.]])

Lower-triangular mask from ones:
tensor([[1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.]]).tril()
tensor([[1., 0., 0.],
        [1., 1., 0.],
        [1., 1., 1.]])

A * mask_ones:
tensor([[1., 0., 0.],
        [4., 5., 0.],
        [7., 8., 9.]])
```

功能 **火炬.tril** 返回矩阵的下三角部分：主对角线上和下方的所有内容都保留，其上方的所有内容都设置为零。

**火炬.tril(A)** 将原始数据放入 **一个** 并将对角线上方的条目归零。

**torch.tril(torch.ones\_like(A))** 构建一个掩码：对角线上方和下方的 1，上方的 0。

乘法 **一个** 通过这个面具 **A \* mask\_ones** 保留下三角形并将上三角形归零。

因果注意力正是使用了这个想法。我们不屏蔽 3×3 矩阵，而是屏蔽 **序列长度** × **序列长度** 注意力分数矩阵使得token **我** 只能看到token **0..i** 而不是未来的token。

**为 5 个token序列构建因果掩码**

假设我们有五个token的序列，例如：

\[“计算机”、“科学”、“是”、“该”、“研究”\]

注意力分数 **attn\_分数** 区域 **5×5** 矩阵。

#### **清单 1.10：为 5 个token序列构建因果掩码**

```
seq_len = 5

# Build a 5x5 causal mask

causal_mask = torch.tril(torch.ones(seq_len, seq_len, dtype=torch.bool))

print(”Causal mask (True = allowed, False = masked):”)
print(causal_mask)
```

**输出**

```
Causal mask (True = allowed, False = masked):
tensor([[ True, False, False, False, False],
        [ True,  True, False, False, False],
        [ True,  True,  True, False, False],
        [ True,  True,  True,  True, False],
        [ True,  True,  True,  True,  True]])
```

该掩码允许每个token仅关注其自身和所有先前的token，从而阻止对未来token的关注以防止信息泄漏。

#### 第 2 步：创建并应用蒙版

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_091_65ab80b4f4.webp)

](https://substackcdn.com/image/fetch/$s_!Niiy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06ffae20-aba1-4b29-b77f-738e796d6b65_1560x480.png)

_**图1.91：** 通过逐元素乘法将下三角掩码应用于注意力分数，将所有未来token条目归零。_

掩码被创建为 5x5 的下三角矩阵。

中号\=\[1000011000111001111011111\]

然后，我们通过逐元素乘法将此掩码应用于我们的注意力分数。

中号一个skedSc哦res一个分数′\=一个分数⊙中号

此操作将上三角形中的所有元素设置为零，同时保留下三角形元素。

相乘后，与未来token相对应的注意力分数现在为零，而当前和过去token的分数保持不变。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_092_235b1023b0.webp)

](https://substackcdn.com/image/fetch/$s_!22Rj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6928b18b-85d8-4e68-a714-309409d3262d_879x531.png)

_**图1.92：** 屏蔽后，行尚未标准化。每行必须除以其总和才能形成有效的概率分布。_

然而，仅此掩蔽是不够的。这些行未标准化，且总和不为 1，这违反了注意力权重形成概率分布的要求。我们必须通过将每个元素除以行总和来标准化每一行，确保每行中的非零权重总和为 1。

#### 第 3 步：逐行归一化

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_093_98ccc96c51.webp)

](https://substackcdn.com/image/fetch/$s_!cqHM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f3b97bc-1273-4d50-9383-648b2db08c36_1512x432.png)

_**数字** **1.93:** 屏蔽注意力分数的按行归一化：将每个条目除以其行总和会产生总和为 1 的注意力权重。_

首先，我们找到屏蔽矩阵中每一行的总和：

第 1 行总和：0.20第 2 行总和：0.23+0.27\=0.50第 3 行总和：0.22+0.25+0.18\=0.65第 4 行总和：0.22+0.24+0.19+0.15\=0.80第 5 行总和：0.22+0.25+0.18+0.15+0.18\=0.98

现在，我们将每个元素除以其行总和以获得最终权重。

\[1.000.000.000.000.001.000.460.540.000.000.001.000.340.380.280.000.001.000.280.300.240.190.001.000.220.260.180.150.181.00\]

这个标准化步骤完成了这个（有缺陷的）版本的因果注意力的实现。

#### 问题：注意力计算中的数据泄漏

乍一看，屏蔽自注意力方法似乎解决了防止查询关注未来token的问题。我们屏蔽注意力矩阵的上三角部分并对剩余的权重进行归一化。然而，仔细检查就会发现这种方法的一个关键缺陷。

为了理解这个问题，我们必须重新审视注意力权重的计算方式。该过程从构建查询、键和值矩阵开始。我们计算查询矩阵和关键矩阵转置之间的点积，生成注意力分数，指示每个token对其他token的关注程度。然后通过将每个元素除以关键维度的平方根来缩放这些分数，从而产生缩放后的点积。当我们通过逐行应用 softmax 函数将缩放后的点积转换为注意力权重时，关键的一步就发生了。

问题就在这里。当我们将 softmax 应用于缩放点积矩阵中的一行时，分母会考虑该行中的所有元素，包括与未来token相对应的元素。考虑第一行，它对应于token“计算机”。计算 softmax 时，分母中的总和包括所有token的缩放点积值，包括“science”、“is”、“the”和“study”。类似地，对于对应于“science”的第二行，softmax 分母包括来自未来token“is”、“the”和“study”的值。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_094_0d14b3697b.webp)

](https://substackcdn.com/image/fetch/$s_!NvYh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa360d81a-343d-46aa-8924-abfa4beb580c_1239x570.png)

_**图 1.94：** 数据泄漏：当在屏蔽之前计算 softmax 时，分母已经包含了未来 token 的贡献，微妙地影响了注意力权重。_

当我们获得注意力权重时，每个元素已经通过 softmax 归一化受到未来token的影响。掩盖注意力权重 _后_ 该计算并没有消除这种影响。来自未来token的信息已经通过 softmax 分母泄漏到计算中。

这种现象称为数据泄漏。我们打算使用屏蔽自注意力来防止查询访问有关未来token的信息，但这种预防失败了，因为泄漏发生在 softmax 计算本身期间。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_095_1a21277122.webp)

](https://substackcdn.com/image/fetch/$s_!mnkC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6471bb6a-140c-4593-b6b7-2bf741196e8c_1104x561.png)

_**图 1.95：** 为了防止数据泄漏，必须在 softmax 之前应用屏蔽，以便将来的token完全排除在 softmax 分母之外。_

为了正确实施因果注意，我们必须进行干预 _前_ 应用softmax。每行的 softmax 分母应该只考虑当前token位置之前的元素（包括当前token位置）。未来的密钥必须完全排除在此求和之外。屏蔽操作必须发生在应用softmax函数之前的缩放点积阶段，以真正防止数据泄漏。

#### 解决方案：用负无穷大进行掩蔽

数据泄漏问题的解决方案涉及一种巧妙的技术，即在 softmax 操作之前应用屏蔽。我们不是在计算 softmax 后将注意力权重归零，而是将负无穷大值分配给我们想要在缩放点积矩阵中屏蔽的位置。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_096_639530e878.webp)

](https://substackcdn.com/image/fetch/$s_!7Qhg!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F66d7e713-d01b-4d19-983a-ecce51b2fae3_996x444.png)

**数字** **1.96:** 负无穷大掩码：在 softmax 之前将上三角条目设置为 −∞，这将它们映射到恰好为零的概率，同时正确地对可见token进行归一化。

该过程的工作原理如下。在通过查询矩阵和关键矩阵之间的点积计算注意力分数之后，在应用 softmax 之前，我们将所有上三角元素设置为负无穷大。即使在按关键维度的平方根缩放后，这些负无穷大值仍然存在，因为将负无穷大除以任何有限数仍然会产生负无穷大。

要了解此方法为何有效，请考虑 softmax 函数在负无穷值下的表现。

_公式_

软最大(x我)\=ex我∑jexj

假设我们有一行包含值 2、3 和 5。

x1\=2,x2\=3,x3\=5软最大(2)\=e2e2+e3+e5软最大(3)\=e3e2+e3+e5软最大(5)\=e5e2+e3+e5

那么值将如下所示

S哦ft米一个x(2)\=0.0420S哦ft米一个x(3)\=0.1142S哦ft米一个x(5)\=0.8438

现在考虑一下当我们想要屏蔽最后两个元素时会发生什么。我们用负无穷大替换它们，得到序列 2，负无穷大，负无穷大。

x\=\[2,−∞,−∞\]

当我们应用softmax时，第一个元素是这样的

软最大(x1)\=e2e2+e−∞+e−∞

关键的见解是

e−∞\=1e∞→0

因此，第一个元素简化为 1

软最大(x1)\=e2e2+0+0\=1

**被屏蔽的元素会发生什么？**

考虑包含负无穷大的第二个位置，它变为零。第三个位置同样也变为零。

软最大(x2)\=e−∞e2\=0,软最大(x3)\=e−∞e2\=0

经过softmax之后，我们的序列转换为1,0,0。

⇒软最大(\[2,−∞,−∞\])\=\[1,0,0\]

#### 我们再举一个例子，

现在我们将仅屏蔽第三个元素

x\=\[2,3,−∞\]

软最大(x1)\=e2e2+e3+e−∞\=e2e2+e3

软最大(x2)\=e3e2+e3+e−∞\=e3e2+e3

软最大(x3)\=e−∞e2+e3+e−∞\=0

未屏蔽的 softmax 值 0.2689 和 0.7311 加起来为 1，这证实它们在未屏蔽的元素上形成了正确的概率分布

软最大(\[2,3,−∞\])\=\[0.2689, 0.7311, 0\]

该方法的优雅之处在于其自动归一化特性。通过在softmax之前将屏蔽位置设置为负无穷大，得到的注意力权重自然满足两个要求。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_097_bacbfe6b85.webp)

](https://substackcdn.com/image/fetch/$s_!f0VW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83700855-a1ee-462c-b48e-700ed0a40c33_1704x444.png)

_**图 1.97：** 完整的因果掩蔽流程：(1) 计算缩放点积，(2) 将上三角条目设置为 −∞，(3) 应用 softmax。屏蔽位置恰好为零，不会发生数据泄漏。_

首先，在 softmax 之后，所有屏蔽位置都恰好为零。其次，每行中剩余的非屏蔽权重自动求和为 1，因为 softmax 函数保证对所有有限输入值进行归一化。这消除了屏蔽后任何额外的归一化步骤的需要，解决了数据泄漏问题，同时保持了注意力权重所需的数学属性。

现在我们将因果掩模应用于缩放后的注意力分数。

#### **清单 1.11：将因果掩模应用于缩放注意力分数**

```
import math

scaled_scores = attn_scores / math.sqrt(d_k)
print(”Scaled scores (unmasked):”)
print(scaled_scores)

# Build the boolean causal mask again

seq_len = attn_scores.size(0)
causal_mask = torch.tril(torch.ones(seq_len, seq_len, dtype=torch.bool))

# Apply the mask: set disallowed positions to -inf

masked_scaled_scores = scaled_scores.masked_fill(~causal_mask, float(”-inf”))

print(”\nScaled scores with causal mask:”)
print(masked_scaled_scores)
```

**输出**

```
Scaled scores (unmasked):
tensor([[0.5000, 1.0000, 1.5000, 2.0000, 2.5000],
        [0.7500, 1.2500, 1.7500, 2.2500, 2.7500],
        [1.0000, 1.5000, 2.0000, 2.5000, 3.0000],
        [1.2500, 1.7500, 2.2500, 2.7500, 3.2500],
        [1.5000, 2.0000, 2.5000, 3.0000, 3.5000]])

Scaled scores with causal mask:
tensor([[0.5000,   -inf,   -inf,   -inf,   -inf],
        [0.7500, 1.2500,   -inf,   -inf,   -inf],
        [1.0000, 1.5000, 2.0000,   -inf,   -inf],
        [1.2500, 1.7500, 2.2500, 2.7500,   -inf],
        [1.5000, 2.0000, 2.5000, 3.0000, 3.5000]])
```

我们首先应用通常的缩放因子 **1/sqrt(d\_k)** 到分数。

然后

```
masked_scaled_scores = scaled_scores.masked_fill(~causal_mask, float(”-inf”))
```

做了两件事：

-   **~因果掩码** 反转布尔掩码。曾担任的职位 **错误的** （未来的token）成为 **真的**.
    
-   **蒙版填充** 写 **\-inf** 进入这些职位。
    

所有允许的位置（对角线上方和下方）均保留其原始缩放分数。不允许的位置变为负无穷大。这保证了，当我们接下来应用 softmax 时，未来的token将做出贡献 **零** 可能性。

现在让我们应用 softmax 从屏蔽分数中获取因果注意力权重

#### **清单 1.12：使用 Softmax 计算因果注意力权重**

```
attn_weights_causal = torch.softmax(masked_scaled_scores, dim=-1)

print(”Causal attention weights:”)
print(attn_weights_causal)
print(”\nRow sums:”, attn_weights_causal.sum(dim=-1))
```

**输出**

```
Causal attention weights:
tensor([[1.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.3777, 0.6223, 0.0000, 0.0000, 0.0000],
        [0.1863, 0.3072, 0.5065, 0.0000, 0.0000],
        [0.1015, 0.1674, 0.2760, 0.4551, 0.0000],
        [0.0580, 0.0956, 0.1577, 0.2599, 0.4288]])

Row sums: tensor([1.0000, 1.0000, 1.0000, 1.0000, 1.0000])
```

Softmax 现在应用于仅在对角线上方和下方包含有限分数的行，而屏蔽位置设置为 -inf，因此它们的指数变为零。结果，第一个token只能关注其自身，给出类似 \[1, 0, 0, 0, 0\] 的分布；第二个token仅关注前两个位置，并且这两个权重之和为 1；最后一个token可以出现在所有五个位置，因此它的行是序列上的完整概率分布。在每种情况下，对角线上方的所有条目都恰好为零，因此没有token会关注未来的token，并且每行的总和仍然为一，因此每一行都是有效的注意力分布。因为这种掩蔽是在 softmax 之前应用的，所以未来位置不会有数据泄漏，这给了我们真正的因果注意力。

### 1.14 带有 Dropout 的因果注意力

* * *

#### 辍学的概念

在探讨 dropout 如何应用于因果注意力之前，我们首先回顾一下 dropout 的概念及其在神经网络中的用途。 Dropout 是一种正则化技术，旨在防止过度拟合并确保网络中的所有神经元对学习过程做出有意义的贡献。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_098_bed7917767.webp)

](https://substackcdn.com/image/fetch/$s_!1131!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F702b2c16-8212-4e2e-b5fc-0d476a1112ee_786x276.png)

_**图 1.98：** Dropout 在训练过程中随机停用神经元，迫使惰性神经元参与并防止网络依赖于少数主导连接。_

考虑一个神经网络层，其中某些神经元主导计算，而其他神经元贡献最小。例如，在具有五个神经元的层中，一个神经元可能具有非常大的权重，而另外两个神经元具有较小的权重。这个主导神经元有效地控制该层的输出，而其他神经元则成为我们所说的惰性神经元。这些惰性神经元不会显着影响前向传递，因此在训练期间不会学习有用的表示。该网络本质上是由于过于依赖神经元子集而过度拟合的。

Dropout 通过在训练期间随机停用神经元来解决这个问题。在每次通过网络的前向传递中，神经元都会以一定的概率（通常为 0.5）关闭。这意味着从统计上看，在任何给定的训练迭代中，一半的神经元将被停用。选择是概率性的、自动的，而不是手动的。

当先前的主导神经元被关闭时，惰性神经元必须参与前向传播。在反向传播过程中，现在必须调整这些先前不活动的神经元的权重，以最大限度地减少损失。如果没有 dropout，如果前向传播完全依赖于一两个已经产生低损失的主导神经元，那么惰性神经元的权重将永远不会更新。通过强制不同的神经元子集在训练迭代中处于活动状态，dropout 可确保所有神经元学会从数据中提取有用的特征。

这项技术可以防止网络过度依赖特定神经元，并鼓励在整个网络中开发更强大的分布式表示。

* * *

#### **为什么辍学在注意力机制中很重要**

当我们为语言模型构建注意力机制时，有时会遇到某些单词彼此过度依赖的问题。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_099_15c8552064.webp)

](https://substackcdn.com/image/fetch/$s_!PsfA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F41606981-5d62-4c62-8ee4-f5e0d2a59d09_1095x258.png)

_**数字** **1.99:** 如果没有辍学，“学习”这个词可能会过度关注特定的早期单词，记住模式而不是学习一般的语言规则。_

考虑一下“计算机科学是一门研究”这句话。如果“学习”这个词过度关注特定的早期单词，模型可能会记住这些特定的模式，而不是学习一般的语言规则。token之间的过度依赖可能会损害模型泛化到新句子的能力。

Dropout 为这个问题提供了一个优雅的解决方案。通过在训练期间随机删除一些注意力连接，我们迫使模型学习不依赖于任何单一强连接的更稳健的模式。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_100_5fb604b8c2.webp)

](https://substackcdn.com/image/fetch/$s_!gLSm!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc9824b2e-377b-4bab-8979-6a8ec904f0aa_1185x537.png)

_**图 1.100：** 应用了 dropout 的因果注意力：一些有效的注意力连接（以红色显示）在训练过程中被随机清零，同时保留因果掩模。_

让我们看看 dropout 的适用范围。考虑我们的示例，其中包含 5 个输入token：“computer”、“science”、“is”、“the”、“study”。每个token都表示为一个向量，正如您在自注意力部分中所看到的，我们有注意力权重。

对于单向注意力（也称为因果注意力），我们掩盖该矩阵的上三角形。这确保了每个token只能处理先前的token及其自身，而不能处理未来的token。从可视化来看，“computer”只能看到它本身，“science”可以看到“computer”和它本身，“is”可以看到前三个词，等等。灰色区域代表注意力被遮挡的这些被遮蔽的位置。

这就是 dropout 的用武之地。获得注意力权重后，我们以概率 p 随机将其中一些权重设置为零。在右图中，我们看到应用了 dropout 的单向注意力。红色框突出显示了应用 dropout 的位置，有效地将这些注意力连接归零。

请注意 dropout 如何尊重因果结构。它只影响有效的注意力权重（下三角部分），而不会触及已经被遮盖的上三角。一些以前活跃的注意力权重现在被删除（显示在红色框中），迫使模型依赖于不同的连接模式。

#### 比例因子解释

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_101_7722093444.webp)

](https://substackcdn.com/image/fetch/$s_!6EOV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F023f2489-f774-4035-84d8-ca08fd46e9b1_1287x687.png)

_图 1.101：dropout缩放：当连接以概率 p dropout时，剩余权重按 1/( 1−p) 缩放，以在训练和推理之间保持一致的预期输出幅度。_

**当我们应用 dropout 时，有一个至关重要的细节：**

我们需要扩大剩余的权重。这种缩放可以保持训练和推理之间行为的一致性。假设在第 4 行中，我们最初的注意力权重分布在前四个位置上。如果概率为 0.5 的 dropout 删除了一半的连接，则剩余的权重需要加倍才能保持相同的预期输出幅度。例如，参考矩阵，如果第四行的四个非零位置最初的注意力权重为\[0.25,0.26,0.25,0.24\]，并且以0.5的概率dropout将其中两个值清零，例如第二个和第四个值，那么剩下的两个在缩放2后可能会变成\[0.50,0,0.50,0\]。这确保了总信号强度保持一致。

在应用 dropout 和缩放之后，注意力矩阵的每一行仍然表示可以关注的token的有效概率分布，只是活动连接较少。

该技术已成为 Transformer 架构中的标准组件，有助于其在自然语言处理任务中取得巨大成功。随机删除连接的简单行为与适当的缩放相结合，可以产生强大的正则化效果，帮助这些模型在看不见的数据上获得更好的性能。

这里我们添加一下 **辍学** 到因果注意力权重，然后计算上下文向量。  
我们保持一样 **attn\_权重\_因果关系** 如上所述并假设我们已经有一个形状为的值矩阵 `(5, 4)` 来自自我关注部分。

#### **清单 1.13：将 Dropout 应用于因果注意力权重**

```
dropout = torch.nn.Dropout(p=0.5)

torch.manual_seed(0)  # to get a stable example mask
attn_weights_causal_drop = dropout(attn_weights_causal)

print(”Causal attention weights before dropout:”)
print(attn_weights_causal)

print(”\nCausal attention weights after dropout (training mode):”)
print(attn_weights_causal_drop)
print(”Row sums after dropout:”, attn_weights_causal_drop.sum(dim=-1))

# Use the dropped weights to compute context vectors
context_causal = attn_weights_causal_drop @ values

print(”\nCausal context vectors with dropout:”)
print(context_causal)
print(”context_causal.shape:”, context_causal.shape)
```

**输出**

```
Causal attention weights before dropout:
tensor([[1.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.3777, 0.6223, 0.0000, 0.0000, 0.0000],
        [0.1863, 0.3072, 0.5065, 0.0000, 0.0000],
        [0.1015, 0.1674, 0.2760, 0.4551, 0.0000],
        [0.0580, 0.0956, 0.1577, 0.2599, 0.4288]])

Causal attention weights after dropout (training mode):
tensor([[2.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.7554, 0.0000, 0.0000, 0.0000, 0.0000],
        [0.3726, 0.6144, 0.0000, 0.0000, 0.0000],
        [0.2030, 0.3348, 0.0000, 0.9102, 0.0000],
        [0.0000, 0.1912, 0.3154, 0.5198, 0.0000]])

Row sums after dropout:
tensor([2.0000, 0.7554, 0.9870, 1.4480, 1.0264])

Causal context vectors with dropout:
tensor([[ 4.2400,  5.0200, -0.5600,  1.5400],
        [ 1.6020,  1.7000, -0.1600,  0.3700],
        [ 2.2640,  2.4060, -0.2700,  0.7000],
        [ 2.4240,  2.6460, -0.2800,  0.9700],
        [ 2.2670,  2.5410, -0.2800,  0.9100]])
context_causal.shape: torch.Size([5, 4])
```

Dropout 在训练过程中随机将一些注意力权重设置为零。每个重量都保存有 **概率 1 - p** 并有概率掉落 **p**，其余权重为 **按 1 / 1 - p 缩放** 从而预期的总关注度保持不变。重要的是，dropout 永远不会解锁未来的位置，因此对角线上方的所有条目都保持为零，并且保留了因果结构。它只会稀疏有效的下三角连接。在这个正则化步骤之后，dropout的注意力权重仍然以通常的方式使用，通过将它们与值矩阵相乘来计算上下文向量。

最后，上下文向量计算为

```
context_causal = attn_weights_causal_drop @ values
```

每行 **上下文因果关系** 是下一个token的上下文向量 **因果关注与辍学**。这些向量具有形状 **(5,4)**，匹配token的数量和注意力头维度，并且是在生成模型训练期间输入到Transformer块内的前馈网络中的内容。

### 1.15 自注意力总结

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_102_41fcea2cbe.webp)

](https://substackcdn.com/image/fetch/$s_!Umfy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e51b450-96c5-4592-a76f-6721a2e4a4ac_1713x663.png)

_**图1.102：** 完整的自注意力管道：输入嵌入被投影到 Q、K、V 中；注意力分数通过 QK^T 计算、缩放、可选屏蔽、通过 softmax（带有可选 dropout），并乘以 V 以生成上下文向量。_

在深入了解什么是多头注意力之前，我们先总结一下上一节中介绍的自注意力机制。因此，当输入token转换为 **输入嵌入** 矩阵。该矩阵被线性投影为三个不同的矩阵： **查询（问）**, **键 (K)**， 和 **值（V）**。这是通过将输入嵌入矩阵乘以三个独立的可训练权重矩阵来实现的。一旦生成了 Q、K 和 V，就不再需要输入嵌入矩阵。

核心注意力计算从计算 **注意力分数**。如第一个“MatMul”步骤所示，这是通过 Q 矩阵与 K 矩阵转置的点积来完成的。然后，这些原始分数在“缩放”步骤中进行标准化，其中它们除以密钥维度的平方根。这种缩放对于训练期间稳定梯度至关重要。

缩放后，可以应用“可选掩模”。这一步对于实施至关重要 **因果关注**，它屏蔽了与未来token相对应的所有分数，确保token只能处理其自身和之前的token。接下来， **软最大** 函数应用于缩放（可能是屏蔽）分数的每一行。这会将分数转换为总和为 1 的正值，从而有效地将它们转变为最终分数 **注意力权重**此处可以应用“Optional Dropout”层以防止过度拟合。

在最后一步中，这些注意力权重乘以值（V）矩阵，如第二个“MatMul”操作所示。这产生了 **上下文向量** （Z）。该 Z 矩阵的每一行都是相应输入token的新的、上下文丰富的向量，因为它现在包含来自允许它处理的所有其他token的信息的加权组合。

#### 自注意力机制的局限性

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_103_716b5b529a.webp)

](https://substackcdn.com/image/fetch/$s_!rEvD!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1a14a76d-319b-449c-a182-a5e8cd3a667e_717x483.png)

_**图1.103：** 语言歧义：“艺术家用画笔画了一个女人的肖像”有两种有效的解释，画笔是绘画的工具，或者肖像中的女人拿着画笔。_

单一自注意力机制的一个重要问题是其有效处理语言歧义的能力有限。这个挑战可以用这句话来说明：

“艺术家用画笔画了一个女人的肖像。”

该声明有两种截然不同且有效的解释。

第一种解释是艺术家使用画笔作为工具来执行绘画动作。在这种情况下，短语“用刷子”修饰动词“画”。

第二种解释是，画中的主题是一个拿着画笔的女人。这里的“用画笔”修饰的是“女人”或“肖像”。

单个自注意力层可能很难同时捕获这两种潜在关系。它可能会错误地平均这些依赖关系或仅关注其中一个，从而导致上下文向量无法代表句子的全部细微差别。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_104_97db7827a4.webp)

](https://substackcdn.com/image/fetch/$s_!1QEM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08e36698-65e2-4b58-9904-30d0cd1a84a8_1119x525.png)

_**图1.104：** 单个注意力头只能产生一个注意力矩阵，要么捕获工具解释，要么捕获主题解释，但不能同时捕获两者。_

第一种解释是艺术家使用画笔，将生成一个注意力分数矩阵，其中“艺术家”一词对“画笔”具有较高的注意力分数。

第二种解释是肖像中的女人拿着画笔，这将生成一个完全不同的矩阵，其中“女人”和“肖像”对“画笔”的关注度得分很高。

单个自注意力层只能产生这些注意力矩阵之一。它要么会选择一种观点，要么会产生两种无益的平均。这导致上下文向量无法表示输入的全部丰富性和潜在的歧义性，从而限制了模型理解复杂语言中存在的多个角度或含义的能力。

这种限制表明需要一种更强大的机制，多头注意力可以解决这一问题。

### 1.16 多头注意力的直觉

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_105_8de22d801d.webp)

](https://substackcdn.com/image/fetch/$s_!pGSP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fef3185ce-bb23-4291-a775-c5319fd80ea3_1521x642.png)

_**图1.105：** 每个多头注意力：相同的输入被输入到多个独立的自注意力头中，头学习一组不同的关系。它们的输出被连接成一个丰富的上下文矩阵。_

由于单个自注意力机制仅限于从输入序列中捕获一个视角，因此解决方案是并行使用多个自注意力机制。这种架构被称为多头注意力。核心思想是将相同的输入嵌入矩阵输入到多个独立的自注意力“头”中。每个头都会生成自己独特的上下文向量矩阵，有效地学习一组不同的关系或专注于输入的不同方面，例如一个头捕获以动词为中心的关系，而另一个头捕获不同的语义细微差别。这些单独的上下文向量矩阵，每个都代表一个独特的视角，然后被组合或合并。这个过程会产生一个更丰富的最终上下文向量矩阵，因为它合并了所有单独头捕获的多个视角，从而产生更全面的输入表示。

为了实现多头注意力，我们必须调整查询、键和值矩阵操作以支持并行操作的多个注意力机制。确定了单个自注意力层的局限性后，我们的目标是看看我们如何实际实现具有多个头的系统，例如双头注意力机制。该过程将演示如何生成两组独立的注意力分数和两个相应的上下文向量矩阵。这种并行处理是多头注意力的核心，因为它允许模型产生多个不同的表示，每个头从输入序列中捕获不同的视角或一组关系。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_106_799ef5f766.webp)

](https://substackcdn.com/image/fetch/$s_!P2PR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F26494253-5ef2-4ef9-9c03-939eeb79dbf6_1215x1509.png)

_**图1.106：** 从单头注意力到双头注意力：输入嵌入矩阵由每个头的单独权重矩阵处理，产生独立的 Q、K 和 V 向量集。_

该过程从输入嵌入矩阵开始。使用具有 5 个token的示例句子“The next day is beautiful”，我们从输入嵌入矩阵开始。如图所示，每个token都由八个维度的嵌入表示。这种配置会产生维度为 5 x 8 的输入嵌入矩阵。双头注意力机制的目标是将这个单个输入矩阵转换为两个不同的上下文向量矩阵，每个矩阵捕获不同的视角。

要建立基线，请回忆一下单个注意力头的过程。在本例中，5 x 8 输入嵌入矩阵乘以三个单独的可训练权重矩阵。如图所示，它们是维度为 8 x 4 的查询权重矩阵 (W\_q)、维度为 8 x 4 的键权重矩阵 (W\_k) 和维度为 8 x 4 的值权重矩阵 (W\_v)。此矩阵乘法运算会生成一个查询向量矩阵（5 x 4）、一个键向量矩阵（5 x 4）和一个值向量矩阵（5 x 4）。这一组查询、键和值矩阵是多头注意力机制将扩展的内容。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_107_52b5a6c54a.webp)

](https://substackcdn.com/image/fetch/$s_!4a-y!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec120595-d137-447a-adff-c0d3e5cb4e98_1515x738.png)

_**图1.107：** 头部维度：d\_out = 4 分为 2 个头部，每个头部在减小的维度 2 上运行。权重矩阵 W\_k1 和 W\_k2 各自具有形状 (8, 2)。_

要从单头过渡到多头机构（例如具有两个头的机构），第一步是调整可训练权重矩阵。我们现在初始化两个单独的矩阵 W\_q1 和 W\_q2，而不是单个查询权重矩阵 (W\_q)，每个头一个。同样的除法也应用于键和值矩阵，创建 W\_k1、W\_k2、W\_v1 和 W\_v2}。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_108_c2238efebc.webp)

](https://substackcdn.com/image/fetch/$s_!IXwV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce4222d2-c11f-4e22-8fe5-4357b3004108_873x609.png)

_**图1.108：** 每个头在缩小的子空间上运行。头 1 产生形状 (5, 2) 的 Q1、K1、V1；头 2 产生形状 (5, 2) 的 Q2、K2、V2。_

这些新矩阵的维度由“头维度”决定。该值是通过将原始总输出尺寸 (d\_out) 除以磁头数量来计算的。例如，如果原始 d\_out 为 4，则对于双头系统，头维度为 4 除以 2，等于 2。这意味着虽然原始权重矩阵可能为 8 x 4，但每个新的头特定矩阵（如 W\_k1 和 W\_k2）将具有 8 x 2 的维度。此步骤的主要思想是创建可训练 W\_q、W\_k 和 W\_v 矩阵的多个较小副本。作为直接结果，当与输入嵌入相乘时，这自然会产生多组查询向量、键向量和值向量。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_109_c74cffce7b.webp)

](https://substackcdn.com/image/fetch/$s_!qmdB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd7b7a3c3-0341-49c7-9797-1bc00a225753_1698x1851.png)

_**图1.109：** 并行注意力计算：输入嵌入通过头部特定权重矩阵进行投影，为每个头部生成独立的 Q、K、V 矩阵_

多头注意力通过创建可以同时捕获不同类型关系的并行注意力计算来扩展基本注意力机制。从我们的五个token的维度为 5×8 的输入嵌入矩阵开始，该过程将注意力分成多个头。对于输出维度为 4 的双头配置，每个头在减少的维度 2 上运行。输入嵌入与单独的权重矩阵相乘，为每个头生成查询、键和值矩阵。 Head 1 生成 Q1、K1 和 V1 矩阵，而 Head 2 生成 Q2、K2 和 V2 矩阵，所有矩阵的尺寸均为 5×2，以匹配 5 个token和头尺寸 2。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_110_6a44fa8f90.webp)

](https://substackcdn.com/image/fetch/$s_!kT_J!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9b54c5fc-b3df-4b98-865e-7c2daa0e5dd2_1617x1467.png)

**数字** _**1.110:**_ 每个头通过将 Q 与 K^T 相乘来独立计算其 (5, 5) 注意力得分矩阵，保持捕获所有成对token关系的能力。

然后，每个头通过将其查询矩阵与转置的密钥矩阵相乘来独立计算其注意力分数。

每个头的查询矩阵具有形状 (5,2)，密钥矩阵具有形状 (2,5)，其中 5 表示序列中token的数量。当我们将这些矩阵相乘（Q 乘以 K 转置）时，我们得到每个头的 (5,5) 注意力得分矩阵。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_111_ec2e167cfb.webp)

](https://substackcdn.com/image/fetch/$s_!pbUt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7f57bf0-4c65-4288-8577-2dbb2630ddba_1581x663.png)

_**数字** **1.111:** 来自两个头的两个独立的 (5, 5) 注意力评分矩阵：每个矩阵都可以捕获数据中不同类型的关系。_

**这是至关重要的见解：** 尽管每个头使用原始维度的一半，但生成的注意力分数矩阵保持完整的 (5,5) 形状，它表示所有token对之间的关​​系。这意味着，如果有 2 个头，我们会生成两个独立的 (5,5) 注意力分数矩阵，而不是一个。每个矩阵可以捕获数据中不同类型的关系。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_112_869bb712b5.webp)

](https://substackcdn.com/image/fetch/$s_!cADS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbde028dd-14b0-45ff-b051-922b47d493af_1578x951.png)

_**数字** **1.112:** 每个头独立地应用缩放和 softmax 来生成自己的注意力权重矩阵，然后通过与其值矩阵相乘来计算上下文向量。_

然后，这些注意力分数在每个头内独立地进行标准缩放和 softmax 归一化。通过将注意力权重与值矩阵相乘来计算上下文向量后，所有头的输出被连接在一起以恢复原始输出维度。与具有全维度的单一注意机制相比，这种架构允许模型同时学习和表示token关系的多个视角，而不增加计算成本。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_113_06d91f1565.webp)

](https://substackcdn.com/image/fetch/$s_!GRx6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0819c40f-b61b-43f7-9d24-3877946872b0_963x975.png)

_**数字** **1.113:** 来自两个头的上下文向量：头 1 生成 (5, 2) 上下文矩阵，头 2 生成另一个 (5, 2) 上下文矩阵，每个矩阵捕获不同的视角。_

一旦我们有了两个头、每个维度的注意力权重矩阵，我们就开始计算上下文向量。这是通过将每个头的注意力权重与其相应的值矩阵相乘来完成的。

对于 Head 1，我们将 (5,5) 注意力权重矩阵与 (5,2) 值矩阵 V1 相乘，生成 (5,2) 上下文矩阵。类似地，对于 Head 2，我们将其 (5,5) 注意力权重矩阵与 (5,2) 值矩阵 V2 相乘，产生另一个 (5,2) 上下文矩阵。每个上下文矩阵表示应如何根据该特定头学习到的注意力模式来表示token。

多头注意力的最后一步涉及连接所有头的上下文矩阵以产生统一的输出表示。每个头通过将其注意力权重与其相应的值矩阵相乘来生成自己的上下文矩阵。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_114_ca64a88773.webp)

](https://substackcdn.com/image/fetch/$s_!V8KX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5da5bdd-2e23-4745-a610-5a766284f3fe_1101x465.png)

_**数字** **1.114:** 连接：Head 1 和 Head 2 的 (5, 2) 输出沿特征维度连接以恢复原始输出维度，形成 (5, 4) 最终上下文矩阵。_

在我们的示例中，两个头处理 5 个token的序列，头 1 生成一个上下文矩阵，表示token关系的第一个视角，而头 2 独立生成另一个上下文矩阵，捕获第二个不同的视角。为了结合这些互补的视角，上下文矩阵沿着特征维度串联起来。具体来说，Head 1 中的 (5,2) 矩阵与 Head 2 中的 (5,2) 矩阵并排放置，形成单个 (5,4) 输出矩阵。此串联操作水平合并输出，将每个token位置的每个头的特征向量并排堆叠。生成的 (5,4) 最终上下文矩阵保持 5 个token的序列长度，同时恢复 4 的原始输出维度，该维度等于头部维度乘以头部数量。这种串联表示现在包含来自两个注意力头的丰富信息，允许每个token的最终表示同时编码不同头发现的多种类型的关系和模式。连接的输出作为多头注意力机制的完整输出，并且通常在进入Transformer架构中的后续层之前通过最终的线性投影层。

#### 多头注意力的维度权衡

虽然多头注意力在捕获不同视角方面具有显着优势，但它确实涉及其设计中的基本权衡。当输出维度被分割到多个头时，与单头注意力相比，每个头以降低的维度进行操作。在我们的示例中，输出维度 4 分为 2 个头，每个头仅适用于 2 个维度，而不是单头注意力中可用的完整 4 个维度。每个头部维度的减少意味着每个头部具有较小的表征能力和较少的参数来捕捉其特定视角内的细微差别模式。由于可处理的维度较少，每个头可能会受到其可编码关系的复杂性和细节的限制。然而，这种明显的限制被可以并行学习的视角数量的增加所抵消。该架构本质上实现了分而治之的策略：该模型不是试图捕获单个高维空间内的所有类型的token关系，而是将该学习任务分配给多个专门的头，每个头专注于输入的不同方面。虽然一个头可能会捕获其二维的句法依赖性，但另一个头会同时学习与其自己的二维的语义关系。这种并行化允许模型在相同的计算预算下探索更广泛的注意力模式。所有头的输出串联最终重建了完整的输出维度，确保组合表示受益于多个互补的视角。因此，虽然每个磁头的运行容量减少，但整体多磁头架构通过多样化实现了更大的表现力，使得这种权衡对于大多数应用来说都是值得的。

#### **清单 1.14：为多头注意力创建输入张量**

```
import torch
torch.manual_seed(123)
torch.set_printoptions(precision=3, suppress=True)

# b, num_tokens, d_in = (1, 3, 6)
x = torch.tensor([[
    [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],   # “The”
    [6.0, 5.0, 4.0, 3.0, 2.0, 1.0],   # “kid”
    [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],   # “smiles”
]])

print(”x.shape:”, x.shape)
```

**输出**

```
x.shape: torch.Size([1, 3, 6])
```

张量 **x** 保存一小批token嵌入。形状 **1, 3, 6** 读取为批量大小一，每个序列三个token，每个token六个特征。三行对应“The”、“kid”和“smiles”，每行有六个嵌入值。

#### **清单 1.15：将输入投影到查询、键和值**

```
b, num_tokens, d_in = x.shape

d_out = 6          # final output dimension we want per token
num_heads = 2
head_dim = d_out // num_heads   # 6 // 2 = 3

W_q = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)
W_k = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)
W_v = torch.nn.Parameter(torch.randn(d_in, d_out), requires_grad=False)

q = x @ W_q    # (1, 3, 6)
k = x @ W_k    # (1, 3, 6)
v = x @ W_v    # (1, 3, 6)

print(”q.shape:”, q.shape)
print(”k.shape:”, k.shape)
print(”v.shape:”, v.shape)
```

**输出**

```
q.shape: torch.Size([1, 3, 6])
k.shape: torch.Size([1, 3, 6])
v.shape: torch.Size([1, 3, 6])
```

我们没有为每个头使用单独的权重矩阵，而是遵循权重分割的想法。我们保留一个大型查询、键和值矩阵 **6, 6** 乘以 **1, 3, 6** 由一个输入 **6, 6** 重量赋予新的 **1, 3, 6** 张量为 **q、k 和 v**。此时张量中没有明确的头概念；每个token的所有六个输出特征都打包到最后一个维度中。

#### **清单 1.16：将投影分割成多个头**

```
# reshape from (b, num_tokens, d_out) to (b, num_tokens, num_heads, head_dim)
q = q.view(b, num_tokens, num_heads, head_dim)
k = k.view(b, num_tokens, num_heads, head_dim)
v = v.view(b, num_tokens, num_heads, head_dim)

print(”q after view:”, q.shape)
print(”k after view:”, k.shape)
print(”v after view:”, v.shape)
```

**输出**

```
q after view: torch.Size([1, 3, 2, 3])
k after view: torch.Size([1, 3, 2, 3])
v after view: torch.Size([1, 3, 2, 3])
```

每个投影产生的六个特征现在被解释为两个头部，每个头部具有三个特征。这 **看法** 操作不会改变任何值；它只会改变我们索引它们的方式。新形状 **1, 3, 2, 3** 可以理解为批量大小一、三个token、两个头、每个头三个特征。对于给定的token位置，最后两个维度现在包含头一和头二的表示。

#### **清单 1.17：重新排序维度以按头分组**

```
# move the head dimension in front of the token dimension
# from (b, num_tokens, num_heads, head_dim)
# to   (b, num_heads, num_tokens, head_dim)
q = q.transpose(1, 2)
k = k.transpose(1, 2)
v = v.transpose(1, 2)

print(”q after transpose:”, q.shape)
print(”k after transpose:”, k.shape)
print(”v after transpose:”, v.shape)
```

**输出**

```
q after transpose: torch.Size([1, 2, 3, 3])
k after transpose: torch.Size([1, 2, 3, 3])
v after transpose: torch.Size([1, 2, 3, 3])
```

分割成头之后，可以方便地将属于同一头的所有token分组在一起。转置调用交换token轴和头轴。新形状 **1, 2, 3, 3** 读作批量大小一，两个头，三个token，每个头三个特征。如果你隔离 **q\[0, 0\]** 您会看到第一个头的三个查询向量，而 **q\[0, 1\]** 包含头 2 的三个查询向量。同样的解释也适用于 **k** 和 **v**。这种布局允许单个张量运算并行计算所有头的注意力。

#### **清单 1.18：计算人均注意力分数和上下文向量**

```
import math

# scaled dot product attention for all heads at once
scores = q @ k.transpose(-1, -2)        # (b, num_heads, num_tokens, num_tokens)
print(”scores.shape:”, scores.shape)

scale = math.sqrt(head_dim)
weights = torch.softmax(scores / scale, dim=-1)
print(”weights.shape:”, weights.shape)
print(”weights[0, 0]:”)
print(weights[0, 0])

# context vectors inside each head
context = weights @ v                   # (b, num_heads, num_tokens, head_dim)
print(”context per head shape:”, context.shape)
print(”context[0, 0]:”)
print(context[0, 0])
```

**输出**

```
scores.shape: torch.Size([1, 2, 3, 3])
weights.shape: torch.Size([1, 2, 3, 3])
weights[0, 0]:
tensor([[0.59 , 0.24 , 0.17 ],
        [0.29 , 0.45 , 0.26 ],
        [0.22 , 0.31 , 0.47 ]])
context per head shape: torch.Size([1, 2, 3, 3])
context[0, 0]:
tensor([[ 0.564, -3.817,  2.064],
        [ 3.116,  9.936, 14.649],
        [-2.124, -4.104,  2.056]])
```

张量 **分数** 有形状 **1, 2, 3, 3**。对于每个批次和头，它包含三个token的完整三乘三注意力得分矩阵。除以 **sqrt(head\_dim)** 沿最后一个轴应用 softmax 将这些分数转换为注意力权重，同样针对每个头单独进行。形状为 **重量** 匹配的是 **分数**.

将权重乘以 **v** 产生形状的上下文张量 **1, 2, 3, 3**。对于每个头，您现在拥有三个上下文向量，每个token一个，每个向量具有三个特征。在打印的切片中 **上下文\[0,0\]** 您可以看到第一个头为“The”、“kid”和“smiles”生成的三个向量，它们与输出结构相匹配。

#### **清单 1.19：将 Heads 合并到最终的上下文矩阵中**

```
# move tokens back in front of heads and merge head and feature dimensions
context = context.transpose(1, 2).contiguous()  # (b, num_tokens, num_heads, head_dim)
context = context.view(b, num_tokens, num_heads * head_dim)

print(”final context.shape:”, context.shape)
print(”final context:”)
print(context)
```

**输出**

```
final context.shape: torch.Size([1, 3, 6])
final context:
tensor([[[ 0.564, -3.817,  2.064,  3.116,  9.936, 14.649],
         [-2.124, -4.104,  2.056,  3.098,  9.814, 14.479],
         [-2.120, -4.099,  2.053,  3.113,  9.915, 14.620]]])
```

为了返回每个token的单个上下文矩阵，我们撤消之前的重新排序，然后将头部维度和每个头部特征维度折叠回一个。转置使我们从 **1, 2, 3, 3** 到 **1, 3, 2, 3** 将每个token的所有头分组在一起。决赛 **看法** 然后解释最后两个维度 **2, 3** 作为大小为六的单一维度。

结果是 **1, 3, 6** 张量。现在，每一行都是一个token的六维上下文向量，通过连接第一头的三个特征和第二头的三个特征而构建。与单头注意力相比，评分或权重没有任何变化。不同之处在于，我们使用重塑和转置来让两个单独的注意力头在较小的子空间上并行操作，然后合并它们的输出以恢复每个token的原始六维表示。

#### 总结多头注意力

多头注意力通过并行运行多个独立的注意力机制来扩展单头注意力，每个注意力机制都有自己学习的查询、键和在减少的头维度上的值投影。对于输入嵌入矩阵，每个头在所有token对上生成自己的注意力分数，然后生成自己的上下文矩阵，因此不同的头可以专门处理序列中不同类型的关系。然后，这些上下文矩阵沿着特征维度连接以恢复原始输出大小，因此每个token表示组合了同一输入的多个互补视图。虽然每个头部的尺寸较小，因此容量比单个大型注意力模块低，但不同头部的集合使整体表示更具表现力，最终的线性投影可以进一步混合和细化这些组合特征。

### 1.17 层标准化

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_115_c15993754b.webp)

](https://substackcdn.com/image/fetch/$s_!XVeS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7114008-fcc3-41e7-baa7-1760269de241_408x735.png)

_**图1.115：** 层归一化在Transformer块中多次出现：在多头注意力之前，在前馈网络之前，并且通常在输出层之前。_

在Transformer块中，层归一化出现了多次。它被应用在多头注意力子层之前，再次在前馈网络之前，并且通常在最终输出层之前的块之外再次应用。由于它的使用非常频繁，因此当我们对模型进行编码时，将其实现为自己的可重用模块很方便。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_116_abcb459e1d.webp)

](https://substackcdn.com/image/fetch/$s_!MdOy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c9e3c68-3b73-46b3-90f6-eecf71732f59_909x933.png)

_**图1.116：** 深度网络中的梯度流问题：如果没有归一化，梯度可能会爆炸（非常大的激活）或消失（非常小的激活），从而使训练不稳定。_

要理解为什么层归一化如此重要，有助于退后一步并查看具有输入层、多个隐藏层和输出层的标准深度神经网络。在前向传播期间，激活从左向右流动，而在反向传播期间，梯度沿相反方向流动，从输出层通过每个隐藏层返回到输入。

每层都有参数，因此接收相对于这些参数的损失梯度。给定层的梯度很大程度上取决于该层的输出。如果层输出的量级非常大，当我们通过网络向后链接它们时，相应的梯度往往会变得非常大。当它们到达较早的层时，它们可能会爆炸到非常大的值。这就是梯度爆炸问题，它会导致训练过程中不稳定的更新和发散。

相反的情况也可能发生。如果某个层的输出非常小，则依赖于它们的梯度在通过多个层向后传播时会快速缩小。然后，早期层接收的梯度几乎为零，并且它们的参数几乎没有变化。这就是梯度消失问题，它使学习变得极其缓慢或完全停止。

在这两种情况下，中间层中非常大或非常小的激活会产生太大或太小的梯度幅度。这样训练就会变得不稳定且低效。因此，稳定梯度的一种方法是控制层输出本身的大小。这正是标准化层的设计目的。

**内部协变量偏移**

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_117_a2ccab5401.webp)

](https://substackcdn.com/image/fetch/$s_!2xLN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F288908b6-a1d7-4f91-9649-f18f421fcbd6_1191x609.png)

_**图1.117：** 内部协变量偏移：随着早期层在训练期间更新其权重，输入到后面层的激活分布不断变化，使学习成为一个移动目标。_

深度网络中存在第二个问题，称为内部协变量偏移。在训练过程中，随着早期层更新其权重，它们输入到后续层的激活分布不断变化。想象一下在训练开始时查看特定隐藏层的输入。它们可能大致遵循一种分布。经过几次训练迭代后，随着权重的更新，同一层现在可能会看到具有不同均值或方差或倾斜形状的输入。该层正在尝试学习良好的映射，但其输入的分布不断漂移，因此该层不断适应移动目标。这会减慢收敛速度并使优化变得更加困难。

如果我们能够在训练迭代中保持每层输入的均值和方差更加稳定，学习就会变得更容易。标准化通过重新调整激活值来实现这一点，以便它们的分布随着时间的推移更加一致。这减少了内部协变量偏移并帮助模型更快收敛。

**层归一化的核心思想**

层归一化是应用于层输出的简单过程。考虑一个训练示例，并关注该示例的某个层生成的激活向量。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_118_ce2e619c65.webp)

](https://substackcdn.com/image/fetch/$s_!b8dM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06a8d13c-cbb4-406e-b56b-7b23af0511df_960x657.png)

_**图1.118：** 层归一化的实际应用：平均值为 0.6、方差为 0.07 的六个激活以均值 0 为中心，并重新调整为方差 1，从而产生标准化激活。_

想象一个单层为一个训练示例产生六个输出

x1\=0.78,x2\=1.05,x3\=0.44,x4\=0.73,x5\=0.65,x6\=0.28

这些是图中中间行显示的值。层归一化首先计算这些激活的平均值

意思是\=x1+x2+x3+x4+x5+x66≈0.6

接下来计算方差

变量\=16\[(x1−意思是)2+(x2−意思是)2+(x3−意思是)2+(x4−意思是)2+(x5−意思是)2+(x6−意思是)2\]≈0.07

每次激活时 _希_ 进行归一化时，首先对其进行平移，使其均值变为零，然后重新缩放，使其方差变为零。此过程称为居中和重新缩放。公式

x^我\=x我−意思是变量

意味着对于每个输出值，减去所有输出的平均值（居中），然后除以它们的标准差（重新缩放）。这种转换确保归一化激活集的平均值为零和单位方差，从而使神经网络的下一层更容易处理它们。

如果对所有六个值执行此计算，您将获得大约

0.44,1.48,−0.85,0.28,−0.01,−1.33

这些是图中顶行所示的归一化输出。通过构造，这些归一化激活的平均值为零，方差为 1，这就是为什么插图左侧报告平均值等于 0.0，方差等于 1.00。此示例演示了层归一化如何将均值 0.6 和方差 0.07 的一组层输出转换为一组在数值上表现更好的标准化激活，从而使基于梯度的训练更加稳定。

在实践中，层归一化之后通常是学习的尺度和偏移。计算归一化激活 x hat i 后，该层产生新的激活

y我\=γx^我+β

这里 gamma 和 beta 是可训练参数，其大小与激活向量相同。只要有利于性能，他们就让模型撤消或修改标准化。换句话说，网络可以学习它喜欢的任何输出分布，同时在训练过程中仍然享受归一化的稳定效果。

计算均值和方差的方式是将层归一化与基于批次的方法区分开来的。对于层归一化，我们对单个示例的特征进行归一化，而不是对小批量中的不同示例进行归一化。每个token表示或层输出向量都被独立处理并在其维度上进行标准化。这使得该过程独立于批量大小，并且对于查看可变长度序列并一次执行一个token的自回归解码的Transformer模型来说非常方便。

在Transformer块内，在token表示进入多头注意模块之前，将层归一化应用于token表示。这可以控制输入的规模并稳定其梯度。在注意力及其剩余捷径之后，在前馈网络之前再次应用层归一化，以便该网络也看到表现良好的激活。许多架构进一步规范化每个块的最终输出，并且通常是预测下一个token的语言建模头之前的最后一个块的输出。

### 1.18 前馈网络

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_119_71d09e742f.webp)

](https://substackcdn.com/image/fetch/$s_!Bx2T!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F300dd920-eb07-464b-aef6-2a8bff075467_408x735.png)

_**图1.119：** 前馈网络位于每个Transformer块内的 dropout 和层归一化之间，独立处理每个 token 表示_

在多头注意力之后，Transformer块内的第二个主要组件是前馈网络。在框图中，这显示为前馈神经网络框，位于 dropout 和层归一化之间。从概念上讲，它是一个普通的两层神经网络，中间有一个激活函数，独立应用于每个token表示。关键是同一个小网络，具有相同的权重，可重复用于批次中的所有token和所有示例。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_120_7ecf6c9397.webp)

](https://substackcdn.com/image/fetch/$s_!Cy6Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff72ea384-3507-4c36-a22a-5c27b942f9fb_1131x594.png)

  
_**图1.120：** 前馈网络使用共享权重独立处理每个token向量。对于形状为（batch、tokens、768）的输入张量，每个 768 维向量都是并行处理的。_

2, 3, 768。第一个条目是批量大小，第二个条目是上下文窗口中的token数量，第三个条目是每个token的嵌入维度。重要的一点是，前馈网络独立应用于长度为 768 的每个token向量，但它对批次中的所有token和所有示例使用相同的权重。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_121_c05ce605a8.webp)

](https://substackcdn.com/image/fetch/$s_!V_ZW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6dff2498-7f95-448d-b828-fa75a5cfe079_1642x1038.png)

_**图1.121：**_ 前馈网络的内部结构：从768维线性扩展至3072维，然后进行GELU激活，然后线性收缩回768维。

该网络的内部结构如详细图表所示。它由两个线性层组成，中间有一个激活函数。第一个线性层执行扩展。它采用每个 768 维输入向量并将其投影到具有 4 × 768 = 3072 个隐藏单元的更大空间中。在矩阵形式中，这是乘以 768 x 3072 权重矩阵加上偏置项。直观上，这种扩展使模型有更多能力在再次压缩之前从每个token表示构造丰富的中间特征。由于每个输入维度都与每个隐藏单元交互，因此该单层已经在 768 个输入特征之间引入了密集混合。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_122_f42eaae837.webp)

](https://substackcdn.com/image/fetch/$s_!bGXQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff4435de6-c71c-4252-ad33-6bdde6f02e9f_1449x789.png)

_**图1.122：**_ ReLU 和 GELU 激活函数的比较。 GELU 在任何地方都是平滑的，包括在零处，并且保留小的负激活而不是将它们折叠到恰好为零

展开后，输出通过非线性。早期的 Transformer 实现使用 ReLU 激活函数。当 x 为正时，ReLU 仅返回 x；当 x 为负时，ReLU 返回零。从图形上看，对于正输入，这是一条穿过原点的直线；对于负输入，这是一条位于零处的平坦线。 ReLU 很容易实现，并且在许多卷积和全连接网络中运行良好，但在此设置中它有两个重要的缺点。首先，每个负输入都被压缩到恰好为零，因此存储在负激活幅度中的任何信息都会丢失。如果许多单元变为负值，则网络的很大一部分可以有效地停止学习，这个问题通常被非正式地描述为死亡神经元。其次，ReLU 曲线在零处有一个尖角，并且在那里不可微。在实践中，我们仍然可以计算次梯度并进行训练，但函数并不平滑。

由于这些问题，Transformer 语言模型已在很大程度上转向 GELU 激活。 GELU 曲线（图中 ReLU 旁边所示）是一个平滑的 S 形函数。对于大的正输入，它的行为与 ReLU 类似，并且返回接近恒等式的值。对于大的负输入，它会将激活发送到零，因此非常负的单元仍然被关闭。重要的差异出现在零附近。 GELU 不是将所有低于零的值都精确为零，而是平滑地逐渐减小，并将小的负输入映射到小的负输出。这有两个后果。首先，该函数在任何地方都是可微的，包括零处，这使得优化更加平滑。其次，网络不会dropout小负激活所携带的所有信息。在接近零的区域中，模型仍然可以使用它们的符号和幅度来编码细微的区别。与层归一化一起，将激活保持在适中的范围内并防止非常大的负值或正值，这会导致更稳定的训练和在实践中稍微更好的性能。

前馈网络的输出张量与其输入具有完全相同的形状，即批量大小、上下文长度、嵌入维度。这种设计选择是经过深思熟虑的。由于主要隐藏维度保持不变，因此我们可以在前馈子层周围添加残差连接，并将任意数量的Transformer块堆叠在彼此之上，而无需重塑张量。在非常深的模型中插入更多块、删除块或重用相同的块结构变得非常简单，因为在此示例中每个块都期望并返回大小为 768 的向量。

将其与网络一次看到多少token的问题联系起来也很有帮助。虽然前馈网络独立地对每个token向量进行操作，但由于前面的多头注意力，每个向量已经编码了有关整个上下文窗口的信息。在上下文长度为 3 的示例中，张量的形状为 2, 3, 768，给定序列的三个向量中的每一个都总结了其他位置上下文中的该位置。然后，前馈网络对这些上下文向量中的每一个应用丰富的非线性变换。当自回归生成文本时，模型仍然一次预测下一个token，但这一预测基于完整的上下文表示，该表示已通过注意力和前馈扩展、激活和收缩进行了细化。

总之，Transformer块中的位置明智的前馈网络是一个强大的每个token多层感知器。它将嵌入维度扩展到更高维度的空间，应用平滑且信息保留的 GELU 非线性，并将表示形式收缩回原始大小。这种结构提供了模型中的大部分深度和非线性，而注意力则处理跨位置的交互。它们共同赋予 Transformer 学习token序列中复杂模式的能力。

### 1.19 快捷连接

层归一化有助于稳定激活的规模，但其本身不足以可靠地训练非常深的Transformer堆栈。在上一节中，我们看到每个块已经包含一个强大的前馈网络，该网络扩展嵌入维度，应用 GELU 非线性，然后再次收缩。如果我们简单地堆叠许多这些注意力加上前馈块，则通过所有这些非线性层向后流动的梯度将很快变得非常小。为了保持这种深度Transformer的可训练性，我们依赖于另一个关键思想快捷连接，也称为残差连接。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_123_e71cd6ac99.webp)

](https://substackcdn.com/image/fetch/$s_!Zqu9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7d1217c6-45c7-4d46-b4d8-90c15da48dd0_1587x669.png)

_**图1.123：** 快捷连接对梯度的影响。左：没有快捷方式，渐变消失（0.00003，0.00001）。右图：使用捷径，梯度仍然很大（0.45，0.52），从而能够在早期层中进行有效学习。_

快捷连接只是将模块的输入添加到其输出，从而为信号提供绕过一个或多个非线性层的模型的额外路径。事实证明，这条额外的路径对于防止梯度在反向传播过程中消失非常有效。

您可以在两层图中看到效果。左边我们有一个小型网络，它接受一个输入向量，例如 \[1.0, 0.0, 0.0, minus 1.0\]，应用线性层和 GELU 激活两次，然后将梯度从输出传播回前面的层。如果没有快捷连接，第 2 层的梯度可能约为 0.00003，第 1 层的梯度可能约为 0.00001。这些微小的值是梯度消失问题的一个例子，早期层几乎接收不到任何学习信号。

现在将其与右侧的版本进行比较，右侧的版本在每个线性加 GELU 块周围添加了剩余连接。前馈相同的输入，但现在将第 1 层的输入添加到其输出，并将第 1 层的输出添加到第 2 层的输出。有了这些快捷路径，对于相同的网络深度值，反向传播期间的梯度要大得多，例如图中第 1 层为 0.45，第 2 层为 0.52。通过快捷链接将输入向前推进可以在较早的层中保留更强的梯度，这使得学习更加有效。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_124_8f3efb2dbd.webp)

](https://substackcdn.com/image/fetch/$s_!G1lq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F322e3622-8aa4-4ee0-80fd-56bce225211a_1173x531.png)

_**图1.124：**_ 损失景观比较：没有跳跃连接的情况下，表面是锯齿状的，有许多尖锐的山峰（左），而有跳跃连接的情况下，景观变得光滑，有宽阔的山谷（右）。

还有一个与损失景观图相关的优化视角。如果将没有快捷连接的深层网络的损失可视化为其参数的函数，则表面通常看起来呈锯齿状，有许多尖锐的峰和狭窄的谷。这使得基于梯度的优化变得困难，并且可能使训练陷入不良的局部最小值。当您添加跳跃连接时，同一网络往往会表现出更平滑的损失表面，具有更宽的山谷和更少的尖锐尖峰。更平滑的景观会导致更可预测的梯度，并使像 Adam 这样的简单优化器更容易找到好的解决方案。

Transformer利用整个架构的快捷连接。在每个转换器块内，输入token表示被传递到子层，例如多头注意力或前馈网络，并且子层输出被添加回原始输入。在反向传播期间，梯度可以流经子层并直接沿着恒等捷径流动。残差路径和层归一化的结合使得 Transformer 能够堆叠许多注意力和前馈块，同时仍然在大型数据集上进行可靠的训练。

### 1.20为什么Transformer的扩展性比RNN和CNN更好

Transformer 从根本上是为了可扩展性而设计的，无论是在模型大小还是训练效率方面。与按顺序处理token并因此受到有限并行性影响的循环神经网络不同，Transformer会同时对整个序列进行操作。自注意力允许每个token直接与单层中的每个其他token交互，从而无需随时间逐步传播信息。这种并行结构自然地映射到 GPU 和 TPU 等现代硬件，从而能够有效利用大量计算预算。与依赖固定感受野并需要深度堆栈来捕获长范围依赖关系的卷积神经网络相比，Transformers 从一开始就明确地对全局上下文进行建模。随着模型变得越来越大，这种将全局上下文与并行计算相结合的能力可以带来可预测的性能改进，使 Transformer 非常适合大规模训练制度。

Transformer可扩展性背后的另一个关键因素是架构一致性。相同的Transformer块可以通过最小的修改重复堆叠，从而可以系统地增加深度和宽度。即使使用数百层，残差连接和归一化也能稳定训练，而注意力权重会动态适应不同的输入，而不是像卷积中那样进行硬编码。这种组合会产生平滑的扩展行为，其中增加参数、数据和计算会带来一致的增益。相比之下，RNN 通常会遇到大规模梯度消失的问题，并且 CNN 需要特定于任务的架构调整。因此，Transformer 提供了一个通用的主干，可以直接从规模中受益，而无需进行大量的重新设计。

### 1.21 Transformer 中的预训练、微调和迁移学习

预训练是赋予 Transformer 通用功能的过程。在此阶段，使用自我监督目标（例如下一个token预测）对大量未token数据进行模型训练。目标不是解决特定任务，而是学习语言或其他方式的广泛统计结构。在预训练期间，Transformer学习捕获语法、语义和长范围依赖关系的表示。这些表示分布在各个层和注意力头中，形成了一个可重用的基础，可以支持许多下游任务。由于目标简单且数据丰富，因此预训练可以根据模型大小和数据集大小有效扩展。

微调使预训练的Transformer适应特定的任务或领域。不是从头开始训练，而是使用预训练的权重作为初始化，并在较小的token数据集上继续训练。这个过程将学习到的表示重塑为任务相关模式，同时保留在预训练期间获得的一般知识。迁移学习自然而然地从这种设置中产生，因为相同的预训练模型可以在许多任务（例如分类、生成或问答）中重复使用。在实践中，与为每个任务构建单独的模型相比，这大大减少了数据需求和训练时间。它还可以实现快速实验，因为目标或数据集的更改不需要重新设计整个架构。

### 1.22 Transformer 的局限性和挑战

尽管取得了成功，Transformer也并非没有局限性。最重大的挑战在于自注意力相对于序列长度的二次成本。随着输入序列变长，内存使用和计算量迅速增加，从而对上下文大小造成实际限制。虽然存在各种近似和稀疏注意力机制，但它们通常会在效率和建模保真度之间进行权衡。这使得长上下文建模成为一个活跃的研究领域，而不是一个已解决的问题。

Transformer还需要大量数据和计算才能充分发挥其潜力。在小型或噪声数据集上训练的大型模型可能会过度拟合或学习虚假相关性，从而导致不可靠的行为。此外，预训练的 Transformer 继承了训练数据中存在的偏差，这些偏差可能在下游使用过程中显现出来。从工程角度来看，训练和部署大型Transformer模型带来了与成本、延迟和能耗相关的挑战。这些限制意味着，虽然 Transformer 在理论上可以很好地扩展，但实际部署必须在模型大小与效率、可靠性和负责任的使用之间取得平衡。

### 1.23 动手编写用于序列分类的微型Transformer

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_125_20e0eb5d63.webp)

](https://substackcdn.com/image/fetch/$s_!4v7f!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5d2e220-3a50-4b51-91b8-cb924aa0f0a6_909x657.png)

_**图1.245：** 使用 BERT 进行序列分类，其中输入句子被编码，通过分类token进行总结，并通过分类器映射到情感标签。_

**笔记本代码可在此处找到**

[https://github.com/VizuaraAI/Transformers-for-vision-BOOK](https://github.com/VizuaraAI/Transformers-for-vision-BOOK)

到目前为止，我们已经在概念层面上讨论了 Transformer 架构及其核心组件。为了使这些想法具体化，我们现在从头开始实现一个小型Transformer模型，从理论转向实践。本节的目标不是重新创建完整的 BERT 模型，而是清楚地了解其基本设计如何转化为工作代码。

在本次实践演练中，我们使用 IMDB 电影评论数据集构建了一个用于序列分类的微型转换器。该数据集由标有积极或消极情绪的文本评论组成，使其成为理解 Transformer 如何处理和分类整个文本序列的实用且直观的示例。序列分类凸显了 Transformer 编码器的关键优势之一：它们能够跨完整输入捕获双向上下文。

我们将逐步构建模型，从数据加载和Tokenization开始，然后实现嵌入、自注意力和转换器块，最后添加一个简单的分类头。每个组件都是明确引入的，因此通过模型的信息流保持透明。在本节结束时，您将拥有一个在 IMDB 数据集上训练的工作 Transformer 分类器，并清楚地了解如何从头开始构建 BERT 风格的序列分类模型。

#### **清单 1.20：安装所需的依赖项**

```
!pip install torch datasets tiktoken tqdm scikit-learn
```

#### **清单 1.21：导入所有必需的 Python 模块**

```
import math
import os
import torch
import torch.nn as nn
import torch.nn.functional as F

from torch.utils.data import Dataset, DataLoader
from datasets import load_dataset
from tqdm import tqdm
import tiktoken

from sklearn.metrics import classification_report, confusion_matrix
```

#### **清单 1.22：选择计算设备**

```
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device)
```

**输出**

```
device(type='cuda')
```

在 **清单 1.20**，我们首先安装实现基于Transformer的序列分类模型所需的核心依赖项。 PyTorch 提供基础张量运算和神经网络抽象，用于定义嵌入、注意力机制和训练循环。数据集库允许我们轻松加载 IMDB 电影评论数据集，而 tiktoken 提供适合 Transformer 模型的现代子词token器。 tqdm 库用于可视化训练进度，scikit learn 提供标准评估实用程序，稍后将帮助我们解释分类性能。

环境准备好了， **清单 1.21** 导入所有必需的 Python 模块。除了 math 和 os 等标准库之外，我们还导入 PyTorch 的神经网络组件，包括层、激活函数和数据加载实用程序。 Dataset 和 DataLoader 类定义了训练期间文本样本的结构和批处理方式。 load\_dataset 函数简化了数据集检索，tqdm 支持训练迭代期间的进度跟踪。最后，导入分类报告、混淆矩阵等评估工具，支持训练后模型预测的定量分析。

最后，在 **清单 1.22**，我们选择模型将在其上运行的计算设备。该代码检查启用 CUDA 的 GPU 是否可用，并在可能的情况下将其分配为执行设备，否则默认为 CPU。这种条件设置允许相同的实现从本地实验扩展到加速训练环境，而无需修改。安装依赖项、导入模块并配置计算设备后，我们已经为接下来的部分中从头开始构建和训练 Transformer 模型奠定了坚实的基础。

* * *

在构建 Transformer 模型之前，我们首先需要一个能够清楚说明序列分类任务的数据集。在本节中，我们使用 IMDB 电影评论数据集，这是一种广泛使用的情感分析基准。该数据集包含 50,000 条电影评论，均匀分为训练集和测试集。每条评论都标有两类之一：积极情绪或消极情绪。文本样本的长度和风格各不相同，从简短的意见到长而详细的批评，这使得该数据集非常适合评估模型理解完整自然语言序列的能力。典型的样本包括评论，例如

“这部电影很慢，但表演很出色”，搭配一个表明其情绪的二元标签。

#### **清单 1.23：加载 IMDb 数据集**

```
dataset = load_dataset("imdb")

train_texts = dataset["train"]["text"]
train_labels = dataset["train"]["label"]

test_texts = dataset["test"]["text"]
test_labels = dataset["test"]["label"]

len(train_texts), len(test_texts)
```

**输出**

```
(25000, 25000)
```

在 **清单 1.23**，我们使用数据集库加载 IMDB 数据集，该库会自动下载并以标准化格式准备数据。数据集分为训练和测试分区，每个分区包含 25,000 个样本。从每个分割中，我们提取原始评论文本及其相应的情感标签。标签被编码为整数，其中 0 代表负面情绪，1 代表正面情绪。在此阶段，数据仍保持原始文本形式，这使我们能够在后面的部分中应用自定义Tokenization和预处理步骤。

#### **清单 1.24：初始化字节对编码分词器**

```
tokenizer = tiktoken.get_encoding("gpt2")
base_vocab_size = tokenizer.n_vocab
base_vocab_size
```

**输出**

```
50257
```

在 **清单 1.24**，我们使用 GPT 2 词汇表初始化字节对编码分词器。正如前面在Tokenization部分中所讨论的。 GPT 2 token生成器具有 50,257 个token的固定基本词汇量，其中包括常见单词、子词、标点符号和特殊字节级编码。我们重用这个分词器以避免从头开始设计词汇，并确保有效覆盖电影评论中的多种语言。在这里，我们记录基本词汇量，因为我们将在下一步中扩展它。

#### 为 Transformer 准备文本输入和批处理

在引入特殊token并进入 BERT 特定输入结构之前，我们首先需要了解原始文本如何转换为转换器可以处理的批次。 Transformer 不直接对自由格式文本进行操作。相反，文本必须经过一系列结构化转换，以确定模型将什么视为输入以及训练它来预测什么。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_126_deff0aee06.webp)

](https://substackcdn.com/image/fetch/$s_!GCPJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcd6896e5-e781-471b-a503-ff9083cfeb05_1332x924.png)

_**图1.246：** 为转换器准备文本：原始文本被Tokenization，分成上下文窗口，并排列成输入-输出批处理对，其中每个目标都是下一个token。_

我们从一段连续的文本开始，它首先被分解为token。在如图所示的示例中，段落中的每个单词都映射到相应的 token id。在此阶段，文本仍被视为一个长序列。由于 Transformer 具有固定的上下文大小，因此模型无法立即处理整个序列。相反，选择一个上下文窗口，它定义模型在一次前向传递中可以处理多少个连续token。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_127_637185710a.webp)

](https://substackcdn.com/image/fetch/$s_!DYYx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06a6e926-f278-46d2-9466-d4d0ee5b1917_1590x471.png)

_**图1.247：** 滑动窗口机制：token序列被分割成重叠的片段，每个片段成为一个训练样本，其中输出是输入移动一个位置_

使用这个固定的上下文窗口，token序列被分割成重叠的片段。每个片段都成为一个训练示例。如图所示，输入批次包含上下文窗口内的token序列，而输出批次包含移动一个位置的相同序列。这种转变就是学习信号。该模型经过训练可以预测每个位置的下一个token，这就是为什么输入和输出批次除了对齐之外几乎相同。

如果您看到第二张图，输入批次中的每一行对应于从原始句子中提取的一个短语，输出批次中的每一行代表该短语的直接延续。这种滑动窗口机制允许单个句子生成许多训练示例。当这些示例堆叠在一起时，它们形成一个批次，可以由Transformer有效地并行处理。

该图突出了下一个token预测的一个重要属性。该模型不仅仅预测句子的最终单词。相反，它会根据目前看到的上下文来学习预测每个位置的下一个token。这就是上下文增量增长以及自回归模型需要因果屏蔽的原因。在每个步骤中，模型只允许关注上下文窗口中的先前token。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_128_b96d06c86d.webp)

](https://substackcdn.com/image/fetch/$s_!Xqze!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F611bf97a-b91b-43bb-a791-b6b459a826a1_684x285.png)

_**图1.248：** 对于 BERT 式的分类，多个独立的句子分别被token，产生不同长度的序列。_

该图中显示的下一个转换从下一个token预测转向序列级处理。在这里，我们从多个独立的句子而不是一个长文档开始。每个句子都被单独token，产生不同长度的序列。在此阶段，这些序列尚无法一起处理，因为Transformer要求批次中的所有输入共享相同的长度。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_129_691b413d36.webp)

](https://substackcdn.com/image/fetch/$s_!D8it!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b04cb4c-ba31-49e1-ae26-2807ca4bb7b2_936x516.png)

_**图1.249：** BERT 输入格式：在开头添加一个分类token，在末尾添加一个分隔符token，并使用填充token将较短的序列填充到统一的长度。_

如下图所示，BERT 如何通过结构化输入格式解决此问题。每个句子在开头都增加了一个分类token，在末尾增加了一个分隔符token。较短的序列会被填充，以便所有示例达到相同的长度。填充token不代表真实文本，稍后会被注意掩模忽略，但它们对于形成矩形批量张量至关重要。

* * *

#### **清单 1.25：使用 BERT 特殊token扩展token生成器**

```
PAD_ID = base_vocab_size
CLS_ID = base_vocab_size + 1
SEP_ID = base_vocab_size + 2

VOCAB_SIZE = base_vocab_size + 3
VOCAB_SIZE

```

**输出**

```
50260
```

这里介绍的分类token起着特殊的作用。在自我关注期间，它会关注序列中的所有其他token，从而使其能够积累整个句子的信息。通过最后的转换器层，其隐藏状态充当序列的紧凑摘要。这是用于序列分类任务（例如情感分析）的表示。

从用于下一个token预测的滑动上下文窗口到用于 BERT 风格处理的填充句子级批次，这一进展说明了 Transformer 如何使用文本的关键转变。自回归模型通过预测未来的token来学习，而 BERT 通过一次编码整个序列来学习。建立了这个概念基础后，我们现在准备在代码中正式引入特殊token，并解释它们在 BERT 实现中的确切作用。

通过将这些token附加在原始 GPT 2 词汇表之后，我们保留了所有现有的token映射，同时将词汇表大小扩展到 50,260。此设置允许 Transformer 模型处理可变长度输入，并以与 BERT 风格架构一致的方式执行序列级分类。

#### **清单 1.26：将文本编码为固定长度的 BERT 输入序列**

```
MAX_LEN = 256

def encode(text):
    token_ids = tokenizer.encode(text)
    token_ids = token_ids[:MAX_LEN - 2]

    token_ids = [CLS_ID] + token_ids + [SEP_ID]

    if len(token_ids) < MAX_LEN:
        token_ids += [PAD_ID] * (MAX_LEN - len(token_ids))

    return token_ids
```

该函数将原始文本转换为 BERT 模型可以处理的固定长度输入序列。首先使用分词器将文本分词为子词token ID，然后截断序列以为特殊token留出空间。然后将分类token添加到序列的开头，将分隔token添加到序列的末尾，从而为模型建立清晰的边界。如果生成的序列短于最大长度，则会附加填充token，直到达到所需的长度。输出是统一长度的token序列，这确保所有输入都可以堆叠成批次并由Transformer高效处理。

关于序列长度的注意事项：我们将序列长度限制为 _256 个token_ 随着自注意力机制的计算成本呈二次方增长，以保持训练效率

O(氮2）与长度。

虽然这加快了处理速度，但它使用“仅头部”截断，这可能会dropout评论末尾经常发现的重要情绪线索；对于较长的文档，“头+尾”策略（保留第一个和最后一个块）通常是更有效的替代方案。

然而，这只是一个演示。如果您想提高准确性，可以保留整个文本，但请注意，这将显着增加训练时间和计算成本。

#### **清单 1.27：为填充token创建注意力掩码**

```
def create_attention_mask(input_ids):
    return (input_ids != PAD_ID).long()
```

该函数构造了一个注意掩码，用于区分真实token和填充token。每个包含填充token的位置都标记为 0，而所有其他位置都标记为 1。在自注意力期间，此掩码可确保忽略填充位置，因此它们不会影响模型的表示。在批处理可变长度序列时，注意力掩码至关重要，因为它们允许Transformer在填充输入上进行操作，而无需从人工填充中学习。

#### **清单 1.28：定义 IMDb 数据集类**

```
class IMDBDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        ids = torch.tensor(encode(self.texts[idx]))
        mask = create_attention_mask(ids)
        label = torch.tensor(self.labels[idx])

        return ids, mask, label
```

该数据集类将原始文本和标签包装成与 PyTorch 训练循环兼容的格式。对于每个示例，文本被编码为固定长度的token序列，生成注意掩码，并返回相应的标签。通过在数据集中集中编码和屏蔽，数据管道保持干净和一致，确保输入模型的每个批次都遵循相同的预处理逻辑。

#### **清单 1.29：创建用于训练和评估的 DataLoader**

```
train_ds = IMDBDataset(train_texts, train_labels)
test_ds = IMDBDataset(test_texts, test_labels)

train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=16)
```

在这里，数据集对象被传递到 DataLoader 实例中，该实例自动处理批处理和洗牌。训练数据被打乱，以防止模型学习基于顺序的工件，同时评估数据保持确定性。 DataLoaders 支持对数据集进行高效迭代，并确保输入、掩码和标签以正确结构化的批次传递到模型。

#### **清单 1.30：实现 BERT 嵌入层**

```
class BERTEmbedding(nn.Module):
    def __init__(self, vocab_size, embed_dim, max_len, dropout=0.1):
        super().__init__()
        self.token = nn.Embedding(vocab_size, embed_dim, padding_idx=PAD_ID)
        self.position = nn.Embedding(max_len, embed_dim)
        self.segment = nn.Embedding(2, embed_dim)
        self.norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, T = x.size()
        pos = torch.arange(T).unsqueeze(0).to(x.device)
        seg = torch.zeros_like(x)

        embeddings = (
            self.token(x) +
            self.position(pos) +
            self.segment(seg)
        )

        embeddings = self.norm(embeddings)
        embeddings = self.dropout(embeddings)
        return embeddings
```

该模块实现了 BERT 风格模型中使用的嵌入层。token嵌入对单词标识进行编码，位置嵌入捕获单词顺序，分段嵌入提供句子级上下文，即使此处使用单个分段也是如此。这些嵌入被求和以形成Transformer编码器的输入表示。应用层归一化和 dropout 来稳定训练并提高泛化能力。该嵌入层充当入口点，原始 token id 被转换为适合自注意力的密集向量。

[

![](/content-assets/the-transformers/the-transformers-the-transformers-架构深度解析与从零构建-bert/fig_130_656289daa1.webp)

](https://substackcdn.com/image/fetch/$s_!M02g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98bd6529-6a83-4ce2-9602-fc94d3f87953_840x381.png)

_**图 1.250：** 单句子 IMDb 分类的 BERT 输入表示，显示token嵌入（CLS + token + SEP）、跨所有token的统一段 A 嵌入（尽管使用单个句子来保持句子 A/B 区分的预训练格式，但一致使用）以及位置嵌入的总和。_  

#### **清单 1.31：实现多头自注意力**

```
class MultiHeadSelfAttention(nn.Module):
    def __init__(self, dim, heads, dropout=0.1):
        super().__init__()
        assert dim % heads == 0

        self.heads = heads
        self.d = dim // heads

        self.qkv = nn.Linear(dim, dim * 3)
        self.out = nn.Linear(dim, dim)

        self.attn_dropout = nn.Dropout(dropout)
        self.out_dropout = nn.Dropout(dropout)

    def forward(self, x, mask):
        B, T, C = x.shape

        q, k, v = self.qkv(x).chunk(3, dim=-1)

        q = q.view(B, T, self.heads, self.d).transpose(1, 2)
        k = k.view(B, T, self.heads, self.d).transpose(1, 2)
        v = v.view(B, T, self.heads, self.d).transpose(1, 2)

        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.d)

        mask = mask.unsqueeze(1).unsqueeze(2)
        scores = scores.masked_fill(mask == 0, -1e9)

        attn = F.softmax(scores, dim=-1)
        attn = self.attn_dropout(attn)

        out = attn @ v
        out = out.transpose(1, 2).reshape(B, T, C)

        out = self.out(out)
        out = self.out_dropout(out)
        return out
```

该模块实现了 BERT 内部使用的核心自注意力机制。输入嵌入首先使用单个线性层投影到查询、键和值中，然后分割到多个注意力头中。每个头在嵌入维度的较小子空间上运行，允许模型并行处理不同的关系。缩放点积注意力应用于每个头内，并且注意力掩模用于防止填充token对计算做出贡献。然后将所有头的输出连接起来，投影回原始嵌入维度，并通过 dropout 进行正则化。

这种 BERT 风格的注意力与 GPT 中使用的注意力之间的关键架构差异在于掩蔽。在 BERT 中，自注意力是完全双向的，这意味着每个 token 都可以关注序列中的每个其他 token。这里应用的唯一屏蔽是忽略填充token。相比之下，GPT 使用因果屏蔽来防止token关注未来的位置，从而强制执行从左到右的自回归结构。除了这种屏蔽行为之外，多头自注意力的数学公式在两种架构中保持相同。

#### **清单 1.32：实现前馈网络**

```
class FeedForward(nn.Module):
    def __init__(self, dim, hidden, dropout=0.1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, hidden),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden, dim),
            nn.Dropout(dropout)
        )

    def forward(self, x):
        return self.net(x)
```

该模块定义了每个Transformer编码器层内使用的位置明智的前馈网络。在自注意力混合token之间的信息后，前馈网络使用同一组参数独立地转换每个token表示。它由两个线性投影组成，中间有一个 GELU 激活，这引入了非线性并允许模型学习更具表现力的特征变换。在每个线性层之后应用 Dropout 以减少过度拟合并提高泛化能力。尽管结构简单，但这种前馈网络通过细化每一层的token表示并补充自注意力执行的关系建模而发挥着关键作用。

#### **清单 1.33：定义 Transformer 编码器块**

```
class TransformerBlock(nn.Module):
    def __init__(self, dim, heads, ff_dim, dropout=0.1):
        super().__init__()
        self.attn = MultiHeadSelfAttention(dim, heads, dropout)
        self.ff = FeedForward(dim, ff_dim, dropout)
        self.norm1 = nn.LayerNorm(dim)
        self.norm2 = nn.LayerNorm(dim)

    def forward(self, x, mask):
        x = x + self.attn(self.norm1(x), mask)
        x = x + self.ff(self.norm2(x))
        return x
```

该模块将Transformer编码器的两个基本组件汇集到一个可重用的块中。每个块首先应用多头自注意力以允许token跨序列交换信息，然后应用位置明智的前馈网络来独立地细化每个token表示。在每个子层之前应用层归一化以稳定训练，而残差连接将子层输出添加回原始输入。这种设计保留了深度网络中的梯度流，并能够堆叠许多编码器块而不会降低性能。通过重复应用此块，模型逐渐构建更丰富、更上下文相关的输入序列表示，这是 BERT 风格编码器背后的核心机制。

#### **清单 1.34：构建 BERT 编码器堆栈**

```
class BERTEncoder(nn.Module):
    def __init__(self, vocab_size, dim, max_len, layers, heads, ff_dim):
        super().__init__()
        self.embed = BERTEmbedding(vocab_size, dim, max_len)
        self.layers = nn.ModuleList([
            TransformerBlock(dim, heads, ff_dim)
            for _ in range(layers)
        ])

    def forward(self, x, mask):
        x = self.embed(x)
        for layer in self.layers:
            x = layer(x, mask)
        return x
```

定义嵌入层和 Transformer 编码器块后，我们现在可以组装完整的 BERT 编码器。此步骤将迄今为止引入的所有组件连接到单个相干模块中。编码器首先使用 BERT 嵌入层将输入 token id 转换为密集向量表示，该嵌入层注入 token 身份、位置信息和分段上下文。这些嵌入用作输入序列的初始表示。

一旦嵌入形成，它们就会通过一堆Transformer编码器块。每个块应用多头自注意力来混合token之间的信息，然后通过前馈网络来细化每个token表示。通过堆叠多个这样的块，模型重复地将序列置于上下文中，从而允许更高层基于早期发现的模式进行构建。编码器的输出是一系列深度上下文化的token嵌入，其中每个token表示都反映来自整个输入的信息。该编码器堆栈构成了 BERT 架构的核心，并提供了稍后将用于序列级分类的表示。

#### **清单 1.35：添加序列分类头**

```
class BERTForClassification(nn.Module):
    def __init__(self, vocab_size, dim, max_len, layers, heads, ff_dim):
        super().__init__()
        self.bert = BERTEncoder(
            vocab_size, dim, max_len, layers, heads, ff_dim
        )
        self.classifier = nn.Sequential(nn.Dropout(0.1),nn.Linear(dim, 2))

    def forward(self, x, mask):
        out = self.bert(x, mask)
        cls = out[:, 0]
        return self.classifier(cls)
```

BERT 编码器堆栈就位后，最后一步是使其适应具体的下游任务。在这个模块中，我们在编码器顶部附加了一个轻量级序列分类头。编码器本身保持不变，并继续为输入序列中的每个token生成上下文嵌入。这里的新内容是我们如何将这些token级别表示转换为单个预测。

在前向传递过程中，BERT 编码器的输出是一个张量，每个token包含一个嵌入。我们显式选择序列中第一个token的表示，它对应于前面介绍的分类token。如前所述，该token通过自注意力关注所有其他token，因此充当整个序列的紧凑摘要。分类头应用 dropout 进行正则化，然后使用线性层将此摘要表示映射到类 logits。这种设计将通用语言编码与特定于任务的预测清晰地分开，允许相同的编码器以最小的修改重复用于不同的分类任务。

#### **清单 1.36：初始化模型**

```
model = BERTForClassification(
    vocab_size=VOCAB_SIZE,
    dim=256,
    max_len=MAX_LEN,
    layers=4,
    heads=6,
    ff_dim=1024
).to(device)

print(model)
```

**输出**

```
BERTForClassification(
  (bert): BERTEncoder(
    (embed): BERTEmbedding(
      (token): Embedding(50260, 256, padding_idx=50257)
      (position): Embedding(256, 256)
      (segment): Embedding(2, 256)
      (norm): LayerNorm((256,), eps=1e-05, elementwise_affine=True)
      (dropout): Dropout(p=0.1, inplace=False)
    )
    (layers): ModuleList(
      (0-5): 6 x TransformerBlock(
        (attn): MultiHeadSelfAttention(
          (qkv): Linear(in_features=256, out_features=768, bias=True)
          (out): Linear(in_features=256, out_features=256, bias=True)
          (attn_dropout): Dropout(p=0.1, inplace=False)
          (out_dropout): Dropout(p=0.1, inplace=False)
        )
        (ff): FeedForward(
          (net): Sequential(
            (0): Linear(in_features=256, out_features=1024, bias=True)
            (1): GELU(approximate='none')
            (2): Dropout(p=0.1, inplace=False)
            (3): Linear(in_features=1024, out_features=256, bias=True)
            (4): Dropout(p=0.1, inplace=False)
          )
        )
        (norm1): LayerNorm((256,), eps=1e-05, elementwise_affine=True)
        (norm2): LayerNorm((256,), eps=1e-05, elementwise_affine=True)
      )
    )
  )
  (classifier): Sequential(
    (0): Dropout(p=0.1, inplace=False)
    (1): Linear(in_features=256, out_features=2, bias=True)
  )
)
```

最后，我们准备通过汇集迄今为止构建的所有组件来定义完整的模型。在此阶段，嵌入层、Transformer编码器堆栈和序列分类头不再是独立的部分，而是单个端到端架构的一部分。

该模型使用 256 的嵌入维度进行初始化，这决定了整个网络中使用的向量表示的大小。四个 Transformer 编码器层堆叠在一起以逐步细化上下文信息，而每层中的六个注意力头允许模型并行捕获多个关系。在每一层内部，前馈网络将表示形式扩展至 1024 维，然后将其投影回去，从而保留标准Transformer设计模式。词汇表大小包括基本token器和添加的 BERT 特定特殊token，最大序列长度定义了模型可以处理的最长输入。

实例化后，模型将移动到选定的计算设备，完成设置阶段。现在架构已完全定义，BERT 模型已准备好在 IMDB 数据集上进行训练，标志着从模型构建到优化的过渡。

#### 清单 1.37：定义损失函数和优化器

模型架构完全定义和实例化后，我们现在设置训练所需的两个组件：损失函数和优化器。

对于损失函数，我们使用“CrossEntropyLoss”，这是分类任务的标准选择。交叉熵损失衡量模型在两个类别（正面和负面情绪）上的预测概率分布与真实标签之间的差异。在内部，PyTorch 的 CrossEntropyLoss 将 softmax 函数应用于模型生成的原始 logits，然后计算负对数似然，因此在将 logits 传递给损失函数之前我们不需要自己应用 softmax。

```
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
```

> **亚当·W**
> 
> _亚当优化器_ 是训练深度神经网络的流行选择。然而，在我们的训练循环中，我们选择 _AdamW 优化器_。 AdamW 是 Adam 的一个变体，它改进了权重衰减方法，旨在最大限度地降低模型复杂性，并通过惩罚较大的权重来防止过度拟合。这种调整使得 AdamW 能够实现更有效的正则化和更好的泛化；因此，AdamW 经常用于 Transformer 模型的训练。

#### 清单 1.38：训练模型

```
EPOCHS = 100

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0

    for ids, mask, labels in tqdm(train_loader):
        ids, mask, labels = ids.to(device), mask.to(device), labels.to(device)

        optimizer.zero_grad()
        logits = model(ids, mask)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch+1} | Train Loss: {total_loss:.2f}")
```

**输出** （略）

```
Epoch 1 | Train Loss: 1078.51
Epoch 2 | Train Loss: 1040.23
Epoch 3 | Train Loss: 1009.87
...
Epoch 50 | Train Loss: 512.34
...
Epoch 98 | Train Loss: 289.45
Epoch 99 | Train Loss: 287.12
Epoch 100 | Train Loss: 285.67
```

现在是实施训练循环的时候了。训练过程遵循标准 PyTorch 模式：对于每个 epoch，我们迭代训练 DataLoader 中的所有批次，计算前向传递以获得 logits，计算损失，执行反向传播以计算梯度，并使用优化器更新模型参数。

在每个时期开始时，我们使用以下命令将模型设置为训练模式 **模型.train()**。这确保了诸如 _辍学_ 和 _层规范_ 在训练期间表现正确，dropout 随机将元素归零以防止过度拟合，并且层归一化使用批次级统计数据。在每批开始时，我们调用 **优化器.zero\_grad()** 重置从上一次迭代中累积的梯度，因为 PyTorch 默认情况下累积梯度。前向传递从模型中生成 logits，根据真实标签计算损失，并且 **loss.backward()** 通过反向传播计算梯度。最后， **优化器.step()** 使用计算的梯度更新所有模型参数。

我们训练相对较多的 epoch，以允许小模型收敛。在每个时期结束时打印所有批次的累积损失，以监控训练进度。各个时期的损失不断减少表明该模型正在成功学习区分正面评论和负面评论。

从输出中可以看出，训练损失在各个时期稳步下降，表明模型正在从训练数据中学习有意义的表示。在第一个时期损失开始很高，因为模型的权重是随机初始化的，并且预测本质上是随机猜测。在训练过程中，模型会调整其参数以产生越来越准确的情绪预测。

> **培训时间注意事项：**
> 
> 在批量大小为 16 的 25,000 个样本上训练 100 个 epoch，每个 epoch 大约有 156,250 个参数更新。在现代 GPU 上，这需要几个小时。如果计算资源有限，将 epoch 数量减少到 10-20 仍然会产生一个性能明显高于随机概率的模型，尽管精度较低。

#### 清单 1.39：在测试集上评估模型

```
def evaluate(model, loader):
    model.eval()
    correct, total = 0, 0

    with torch.no_grad():
        for ids, mask, labels in loader:
            ids, mask, labels = ids.to(device), mask.to(device), labels.to(device)
            preds = model(ids, mask).argmax(dim=1)

            correct += (preds == labels).sum().item()
            total += labels.size(0)

    return correct / total
```

```
accuracy = evaluate(model, test_loader)
print("Test Accuracy:", accuracy)
```

**输出**

```
Test Accuracy: 0.8074
```

训练后，我们在保留的测试集上评估模型，以衡量其泛化性能，即它对训练期间从未见过的评论进行分类的效果。这是关键的一步，因为在训练数据上表现良好但在未见过的数据上表现不佳的模型已经 _过拟合_ 到训练集并且尚未学习可概括的模式。

在评估过程中，我们使用以下方法将模型设置为评估模式 **模型.eval(),** 它禁用 dropout 并确保层标准化使用其学习的运行统计数据而不是批处理级别的统计数据。我们还将评估循环封装在里面 **火炬.no\_grad()**，这会禁用梯度计算。由于我们在评估期间不会更新模型的参数，因此禁用梯度可以减少内存使用并加快计算速度。

对于每个批次，模型都会生成 logits，我们采用 **最大精量** 沿着类维度获得预测标签（0 为负，1 为正）。然后，我们将这些预测与真实标签进行比较，并累积正确预测的数量以计算总体准确性。

该模型在测试集上的准确率约为 80.7%。考虑到这是一个完全从头开始训练的 BERT 模型，在仅包含 256 个 token 的截断输入序列上采用简化架构（256 维嵌入、4 层和 6 个注意力头），这是一个合理的结果。作为参考，原始的 BERT-Base 模型（768 维嵌入、12 层、12 个头）在大量语料库上进行预训练，然后在 IMDb 上进行微调，通常可以达到 93-95% 左右的准确率。鉴于模型大小、预训练数据和输入序列长度的显着差异，性能差距是预期的。

#### 清单 1.40：生成详细的分类报告

虽然总体准确性提供了有用的单数摘要，但有时可能会产生误导，尤其是在不平衡的数据集上。为了更详细地了解模型的性能，我们使用 scikit-learn 生成完整的分类报告 _分类报告_ 功能。本报告包括 _精确_, _记起_， 和 _F1分数_ 每个班级。

精度衡量模型预测为给定类别的样本中实际属于该类别的比例。召回率衡量模型正确识别出真正属于给定类别的样本的比例。 F1 分数是精确率和召回率的调和平均值，提供了一个平衡这两个问题的单一指标。当类具有不同的分布或误报和误报的成本不同时，这些每类指标尤其有用。

为了生成此报告，我们首先通过在禁用梯度的评估模式下运行模型来从测试集中收集所有预测和真实标签。

```
all_preds, all_labels = [], []

model.eval()
with torch.no_grad():
    for ids, mask, labels in test_loader:
        preds = model(ids.to(device), mask.to(device)).argmax(dim=1).cpu()
        all_preds.extend(preds.numpy())
        all_labels.extend(labels.numpy())

print(classification_report(all_labels, all_preds, target_names=["Negative", "Positive"]))
```

输出

```
              precision    recall  f1-score   support

    Negative       0.81      0.80      0.81     12500
    Positive       0.81      0.81      0.81     12500

    accuracy                           0.81     25000
   macro avg       0.81      0.81      0.81     25000
weighted avg       0.81      0.81      0.81     25000
```

分类报告确认模型在两个类别中表现一致。负类别和正类别的精度、召回率和 F1 分数均约为 0.81，每个类别均支持 12,500 个样本。这种对称性表明该模型不会表现出对预测一个类别相对于另一个类别的偏见，这是平衡二元分类任务中理想的属性。

#### 清单 1.41：保存经过训练的模型

训练和评估后，保存模型非常重要，以便稍后加载以进行推理或进一步微调，而无需从头开始重新训练。在 PyTorch 中，标准方法是保存模型的 _状态字典_，这是一个 Python 字典，将每个层名称映射到其相应的参数张量。保存 _状态字典_ 推荐的做法而不是整个模型对象，因为它更具可移植性，并且当代码结构在会话之间发生变化时更不容易出现问题。

除了模型权重之外，我们还保存token生成器元数据，特别是特殊token ID 和最大序列长度，以便推理所需的所有信息都可以在一处获得。这确保了可重复性：稍后加载模型的任何人都将拥有以与训练期间处理新输入相同的方式Tokenization新输入所需的精确配置。

```
SAVE_DIR = "bert_from_scratch_imdb"
os.makedirs(SAVE_DIR, exist_ok=True)

torch.save(model.state_dict(), f"{SAVE_DIR}/model.pt")

torch.save({
    "pad_id": PAD_ID,
    "cls_id": CLS_ID,
    "sep_id": SEP_ID,
    "max_len": MAX_LEN
}, f"{SAVE_DIR}/tokenizer_info.pt")

print("Model saved successfully!")
```

**输出**

```
Model saved successfully!
```

#### 清单 1.42：加载保存的模型进行推理

在对新文本运行推理之前，我们将保存的模型权重加载回模型架构中。这 _火炬负载_ 函数读取保存的 _状态字典_ 从磁盘，以及 _model.load\_state\_dict()_ 将这些权重应用于模型。这 _地图位置_ 参数确保权重加载到正确的设备上，当在 GPU 上训练的模型稍后加载到仅使用 CPU 的机器时，这一点特别有用。

加载后，我们将模型设置为评估模式 _模型.eval()。_ 这是至关重要的，因为如果没有它，dropout 层仍然会随机将激活归零，从而导致推理时的预测不一致和降级。

```
model.load_state_dict(torch.load(f"{SAVE_DIR}/model.pt", map_location=device))
model.eval()
print("Model loaded successfully!")
```

**输出**

```
Model loaded successfully!
```

#### 清单 1.43：对新文本运行推理

加载训练好的模型后，我们现在可以使用它对任意文本输入的情感进行分类。推理管道反映了训练期间使用的预处理步骤：使用字节对编码对原始文本进行token，使用分类和分隔符token进行增强，填充到固定序列长度，然后转换为张量。创建一个注意掩码来指示哪些位置包含真实token与填充。然后，该模型会生成两个类别的 logits，我们采用 _最大精量_ 以获得预测的标签。

我们在多个例句上测试模型，以验证它是否已经学习了有意义的情感表示。

一些例子是

```
text = "Bromwell High is a brilliantly conceived, executed and acted, but sadly overlooked sitcom. The writing is razor sharp, the characters are well drawn and the jokes are genuinely funny. The animation is also excellent, with a style that suits the material perfectly. It's a shame that it didn't get a proper chance in the UK, as it deserves to be up there with the likes of The Simpsons and South Park. Highly recommended for anyone who likes clever, witty humour."

ids = torch.tensor([encode(text)]).to(device)
mask = (ids != PAD_ID).long()

with torch.no_grad():
    pred = model(ids, mask).argmax(dim=1).item()

print("Prediction:", "Positive" if pred == 1 else "Negative")
```

**输出**

```
Prediction: Positive
```

```
text = "In fact I must confess, so bad was it I fast forwarded through most of the garbage... As for the title characters, they barely even have a footnote in the film."

ids = torch.tensor([encode(text)]).to(device)
mask = (ids != PAD_ID).long()

with torch.no_grad():
    pred = model(ids, mask).argmax(dim=1).item()

print("Prediction:", "Positive" if pred == 1 else "Negative")
```

**输出**

```
Prediction: Negative
```

如输出所示，模型对所有两个测试输入进行了正确分类。强烈正面的评论被预测为正面，明显负面的评论被预测为负面。虽然这些例子包含相对明确的情感线索，但它们表明该模型已经学会了将特定的语言模式关联起来，例如“出色”、“优秀”和“强烈推荐”等词语与积极情绪，以及“浪费时间”、“令人畏缩”和“垃圾”等短语与消极情绪。

值得注意的是，在截断序列上从头开始训练的小模型无法完美处理每个边缘情况。带有复杂情绪、严重讽刺或位于 256 个token截断点之外的关键信息的评论可能会被错误分类。尽管如此，该模型正确分类简单示例的能力证实了 BERT 架构，即使规模较小，在足够大的token数据集上进行训练时也可以学习有意义的双向表示以进行情感分析。

## 资源

Raj 博士制作了一个非常详细的播放列表，用于从头开始建立 LLM，您也可以参考

[从头开始构建LLM](https://youtube.com/playlist?list=PLPTV0NXA_ZSgsLAr8YCgCwhPIJNNtexWu&si=2vzAspB2zerjhGXa)

您也可以参考 Sebastian Raschka 的书

[构建大型语言模型（从头开始）](https://www.manning.com/books/build-a-large-language-model-from-scratch)

## 1.24 总结

-   大型语言模型预测序列中的下一个单词，并使用这个简单的目标来发展复杂的语言理解。模型大小至关重要：只有当模型跨越某些参数阈值时，算术推理等新兴能力才会出现。
    
-   Transformer 架构用自注意力机制取代了循环和卷积方法，从而实现了第一层的并行处理和全局上下文。其核心组件是Tokenization、嵌入、多头注意力、前馈网络、层归一化和残差连接。
    
-   字节对编码通过迭代合并 90 个 Transformer 架构最常见的字符对来构建子词词汇表，平衡词汇量大小与表示任何文本的能力。
    
-   自注意力通过将静态输入嵌入投影到查询、键和值中，将静态输入嵌入转换为动态上下文向量。注意力分数通过缩放点积计算，用 softmax 标准化，并用于混合值向量。
    
-   因果屏蔽通过在 softmax 之前将上三角分数设置为负无穷大来防止token参与未来位置，从而消除数据泄漏。
    
-   多头注意力并行运行多个独立的注意力头，每个注意力头捕获不同类型的关系，并将它们的输出连接起来以形成更丰富的表示。
    
-   层归一化通过居中和重新缩放激活来稳定训练，而残余连接则通过Transformer块的深层堆栈保留梯度流。
    
-   Transformer 的扩展能力比 RNN 和 CNN 更好，因为它们具有并行计算、架构一致性以及随着参数和数据的增加而平滑扩展的行为。
    
-   对大量未token数据进行预训练可以创建通用表示，可以通过微调有效地适应特定任务，从而大大减少下游应用程序的数据需求。
