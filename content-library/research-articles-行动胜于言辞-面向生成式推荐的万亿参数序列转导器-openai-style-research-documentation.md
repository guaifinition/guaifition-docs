## 摘要

大规模推荐系统的特征在于：它们依赖高基数（high-cardinality）的异构特征，并且需要每天处理数百亿次用户行为。尽管工业界的大多数 Deep Learning Recommendation Models（深度学习推荐模型，DLRMs）使用包含数千个特征的海量数据进行训练，但其性能通常无法随计算量的增加而扩展。受 Transformers 在语言与视觉领域取得成功的启发，我们重新审视推荐系统中的基础设计选择。

我们在生成式建模框架内将推荐问题重新表述为序列转导任务（sequential transduction tasks，即“Generative Recommenders”），并提出一种面向高基数、非平稳流式推荐数据的新架构 HSTU。HSTU 在合成数据集和公开数据集上相较基线将 NDCG 最多提高 65.8%，并且在长度为 8192 的序列上比基于 FlashAttention2 的 Transformers 快 5.3 倍至 15.2 倍。

基于 HSTU 构建的、具有 1.5 万亿参数的 Generative Recommenders 模型在线上 A/B 测试中使指标提升 12.4%，并已部署于一个拥有数十亿用户的大型互联网平台的多个产品界面。

更重要的是，Generative Recommenders 的模型质量在三个数量级的训练计算量范围内在经验上遵循幂律关系，并扩展至 GPT-3/LLaMa-2 的规模；这减少了未来模型开发产生的碳足迹，并进一步为推荐领域首批基础模型（foundation models）铺平道路。

**关键词：**Generative Recommenders；Generative Recommendations；Sequential Recommendations；Generative Modeling；Actions Speak Louder Than Words；HSTU；Hierarchical Sequential Transduction Units；Recommendation Systems；Machine Learning；ICML

## 1 引言

![历年深度学习模型训练计算量](https://arxiv.org/html/2402.17152v3/x1.png)

**图 1：**历年用于训练深度学习模型的总计算量。DLRM 结果来自 Mudigere et al. (2022)；GR 为本文部署的模型。DLRM/GR 在流式设置中持续训练；此处报告每年使用的计算量。

推荐系统是在线内容平台和电子商务领域的核心组成部分，每天在为数十亿用户提供个性化体验方面发挥关键作用。大约十年来，推荐领域的最先进方法一直建立在 Deep Learning Recommendation Models（DLRMs）之上（Mudigere et al., 2022；Covington et al., 2016；Cheng et al., 2016；Zhou et al., 2018；Tang et al., 2020；Wang et al., 2021；Xia et al., 2023）。

DLRMs 的典型特征是使用异构特征，例如计数器和比率等数值特征、嵌入，以及创作者 ID、用户 ID 等类别特征。由于每分钟都会加入新内容和新商品，特征空间具有极高基数，规模通常达到数十亿（Eksombatchai et al., 2018）。

为了利用数以万计的此类特征，DLRMs 使用多种神经网络来组合特征、变换中间表示并构成最终输出。

尽管使用了大量人工设计的特征集合，并在海量数据上训练，工业界大多数 DLRMs 仍难以随计算量扩展（Zhao et al., 2023）。这一限制十分显著，但尚未得到解决。

受 Transformers 在语言和视觉领域成功的启发，我们重新审视现代推荐系统中的基础设计选择。我们观察到，面向十亿用户规模的替代性表述需要克服三个挑战。第一，推荐系统中的特征缺乏显式结构。

尽管小规模设置中已经探索过序列表述（详见附录 B），但高基数 ID、交叉特征、计数器和比率等异构特征在工业级 DLRMs 中发挥关键作用（Mudigere et al., 2022）。第二，推荐系统使用规模达数十亿且持续变化的词表。

与语言领域约 10 万规模的静态词表（Brown et al., 2020）不同，十亿规模的动态词表会带来训练困难；同时，由于需要以目标感知（target-aware）的方式考虑数以万计的候选项，还会带来很高的推理成本（Zhou et al., 2018；Wang et al., 2020）。最后，计算成本是实现大规模序列模型的主要瓶颈。

GPT-3 使用数千块 GPU，在 1—2 个月内对总计 3000 亿个 token 进行了训练（Brown et al., 2020）。这一规模看似巨大，但与用户行为的规模相比则不然。最大的互联网平台拥有数十亿日活跃用户，这些用户每天与数十亿条帖子、图像和视频交互。用户序列的长度可达 $10^{5}$（Chang et al., 2023）。

因此，推荐系统每天需要处理的 token 数量比语言模型在 1—2 个月内处理的数量高出若干数量级。

在本文中，我们将用户行为视为生成式建模中的一种新模态。我们的关键洞见是：a）在采用适当的新特征空间后，工业级推荐器中的核心排序和召回任务可以转化为生成式建模问题；b）这一范式使我们能够系统地利用特征、训练和推理中的冗余来提高效率。

得益于新的问题表述，我们部署的模型计算复杂度比现有最先进方法高出三个数量级，同时将顶层业务指标提高了 12.4%，如图 1 所示。

本文贡献如下。首先，我们在第 2 节提出 Generative Recommenders（生成式推荐器，GRs），这是一种替代 DLRMs 的新范式。我们将 DLRMs 中的异构特征空间序列化并统一；当序列长度趋于无穷时，新方法可逼近完整的 DLRM 特征空间。这使我们能够把主要推荐问题——排序与召回——重新表述为 GRs 中的纯序列转导任务。

重要的是，这进一步使模型能够以序列化的生成式方式进行训练，从而在相同计算量下使用高出若干数量级的数据。

随后，我们处理训练和推理全过程中的计算成本问题。我们提出一种新的序列转导架构 Hierarchical Sequential Transduction Units（分层序列转导单元，HSTU）。HSTU 针对大型非平稳词表修改注意力机制，并利用推荐数据集的特性，使其在长度为 8192 的序列上相较基于 FlashAttention2 的 Transformers 实现 5.3 倍至 15.2 倍的加速。

此外，通过一种利用微批处理完全摊销计算成本的新算法 M-FALCON（第 3.4 节），我们能够在与传统 DLRMs 相同的推理预算下，服务计算复杂度高出 285 倍的 GR 模型，同时实现 1.50 倍至 2.99 倍加速。

最后，我们在第 4 节使用合成数据集、公开数据集，以及一个拥有数十亿日活跃用户的大型互联网平台上的多个部署场景，对所提出技术进行了验证。据我们所知，本文首次表明，在生成式设置（GRs）中，HSTU 这类纯序列转导架构能够在大规模工业环境中显著优于 DLRMs。

尤其值得注意的是，我们不仅克服了传统 DLRMs 已知的扩展瓶颈，还成功表明扩展定律（scaling law；Kaplan et al., 2020）适用于推荐问题，这可能意味着推荐系统的“ChatGPT 时刻”。

## 2 将推荐表述为序列转导任务：从 DLRMs 到 GRs

### 2.1 统一 DLRMs 中的异构特征空间

![DLRMs 与 GRs 的特征和训练流程比较](https://arxiv.org/html/2402.17152v3/x2.png)

**图 2：**特征和训练流程比较：DLRMs 与 GRs。$E,F,G,H$ 表示类别特征。$\Phi_i$ 表示合并后的主时间序列中的第 $i$ 个条目。$\Psi_k(t_j)$ 表示在时间 $t_j$ 发出的第 $k$ 个训练样本。完整记号见附录 A。

现代 DLRM 模型通常使用大量类别（“稀疏”）特征和数值（“稠密”）特征进行训练。在 GRs 中，我们将这些特征整合并编码为单一统一时间序列，如图 2 所示。

**类别（“稀疏”）特征。**此类特征的示例包括用户点赞过的条目、用户关注的某一类别（例如户外）中的创作者、用户语言、用户加入的社区、发起请求的城市等。我们按如下方式对这些特征进行序列化。首先，我们选择最长的时间序列作为主时间序列，通常做法是合并表示用户曾与之交互的条目的特征。

其余特征通常是随时间缓慢变化的时间序列，例如人口统计属性或所关注的创作者。我们通过保留每个连续片段中的首个条目来压缩这些时间序列，然后将结果合并到主时间序列中。由于这些时间序列变化非常缓慢，这种方法不会显著增加总体序列长度。

**数值（“稠密”）特征。**此类特征的示例包括加权并衰减的计数器、比率等。例如，一个特征可以表示用户过去对符合某一主题的条目的点击率（click-through rate，CTR）。与类别特征相比，这些特征变化更频繁，可能在每一次（用户，条目）交互时都发生变化。因此，从计算和存储角度看，完全序列化此类特征不可行。

然而，一个重要观察是：我们执行这些聚合所依据的类别特征（例如条目主题、位置）已经在 GRs 中完成序列化和编码。因此，只要采用具有足够表达能力的序列转导架构，并结合目标感知表述（Zhou et al., 2018），随着 GRs 中总体序列长度和计算量增加，我们即可移除数值特征，同时仍能有效捕获其信息。

### 2.2 将排序和召回重新表述为序列转导任务

给定按时间顺序排列的 $n$ 个 token 列表 $x_0,x_1,\ldots,x_{n-1}$（$x_i\in\mathbb{X}$），以及观察到这些 token 的时间 $t_0,t_1,\ldots,t_{n-1}$，序列转导任务将该输入序列映射到输出 token $y_0,y_1,\ldots,y_{n-1}$（$y_i\in\mathbb{X}\cup\{\varnothing\}$），其中 $y_i=\varnothing$ 表示 $y_i$ 未定义。

我们使用 $\Phi_i\in\mathbb{X}_c$（$\mathbb{X}_c\subseteq\mathbb{X}$）表示系统提供给用户的一项内容（例如图像或视频）。由于新内容不断生成，$\mathbb{X}_c$ 和 $\mathbb{X}$ 是非平稳的。用户可以通过某种行为 $a_i$（例如点赞、跳过、完整观看视频并分享）响应 $\Phi_i$，其中 $a_i\in\mathbb{X}$。我们用 $n_c$ 表示用户已经交互过的内容总数。

因此，在因果自回归设置下，标准的排序与召回任务可以定义为序列转导任务（表 1）。由此得到以下观察：

| 任务 | 规格 | 输入／输出 |
| --- | --- | --- |
| 排序 | $x_i$ | $\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_{n_c-1},a_{n_c-1}$ |
| $y_i$ | $a_0,\varnothing,a_1,\varnothing,\ldots,a_{n_c-1},\varnothing$ |
| 召回 | $x_i$ | $(\Phi_0,a_0),(\Phi_1,a_1),\ldots,(\Phi_{n_c-1},a_{n_c-1})$ |
| $y_i$ | $\Phi'_1,\Phi'_2,\ldots,\Phi'_{n_c-1},\varnothing$ |
| 若 $a_i$ 为正，则 $\Phi'_i=\Phi_i$；否则为 $\varnothing$。 |

**表 1：**将排序与召回表述为序列转导任务。为简化起见，省略其他类别特征。第 B.2 节比较 GRs 与传统序列推荐器。

**召回。**在推荐系统的召回阶段，我们学习定义于 $\Phi_{i+1}\in\mathbb{X}_c$ 上的分布 $p(\Phi_{i+1}\mid u_i)$，其中 $u_i$ 是 token $i$ 处的用户表示。一个典型目标是选择 $\operatorname*{arg\,max}_{\Phi\in\mathbb{X}_c}p(\Phi\mid u_i)$，以最大化某种奖励。该设置与标准自回归设置存在两点差异。第一，$x_i$ 的监督信号 $y_i$ 不一定是 $\Phi_{i+1}$，因为用户可能对 $\Phi_{i+1}$ 作出负向响应。

第二，当 $x_{i+1}$ 表示与交互无关的类别特征（例如人口统计属性）时，$y_i$ 未定义。

**排序。**GRs 中的排序任务面临独特挑战，因为工业推荐系统通常要求“目标感知”表述。在此类设置中，目标 $\Phi_{i+1}$ 与历史特征之间的“交互”必须尽可能早地发生；而在标准自回归设置中，“交互”发生得很晚（例如在编码器输出后通过 softmax），因而无法满足这一要求。

我们通过在表 1 中交错排列条目与行为来解决该问题，从而将排序任务表述为 $p(a_{i+1}\mid\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_{i+1})$（在加入类别特征之前）。在实际系统中，我们使用一个小型神经网络，把 $\Phi_{i+1}$ 位置的输出转换为多任务预测。重要的是，这使我们能够在一次前向过程中，对全部 $n_c$ 次交互应用 target-aware cross-attention（目标感知交叉注意力）。

### 2.3 生成式训练

工业推荐器通常在流式设置中训练，其中每个样本在可用时按顺序处理。在这一设置中，基于 self-attention（自注意力）的序列转导架构（例如 Transformers；Vaswani et al., 2017）的总计算量按 $\sum_i n_i(n_i^2d+n_id_{ff}d)$ 扩展，其中 $n_i$ 是用户 $i$ 的 token 数量，$d$ 是嵌入维度。

括号内第一项来自自注意力；我们假设其扩展因子为 $O(n^2)$，因为大多数次二次算法都会带来质量权衡，并且在实际运行时间上不及二次算法（Dao et al., 2022）。第二项来自逐点 MLP 层，其隐藏层大小为 $O(d_{ff})=O(d)$。令 $N=\max_i n_i$，总体时间复杂度可写为 $O(N^3d+N^2d^2)$，这在推荐设置中成本过高。

为可扩展地训练长序列上的序列转导模型，我们从传统的曝光级训练转向生成式训练，如图 2 顶部所示，将计算复杂度降低 $O(N)$ 倍。通过这种方式，编码器成本被摊销到多个目标上。

更具体地，当我们以速率 $s_u(n_i)$ 采样第 $i$ 个用户时，总训练成本变为 $\sum_i s_u(n_i)n_i(n_i^2d+n_id^2)$；将 $s_u(n_i)$ 设为 $1/n_i$ 后，该成本降至 $O(N^2d+Nd^2)$。在工业级系统中，一种实现方式是在用户请求或会话结束时生成训练样本，从而得到 $\hat{s}_u(n_i)\propto1/n_i$。

## 3 面向生成式推荐的高性能自注意力编码器

为将 GRs 扩展到具有大型非平稳词表的工业级推荐系统，我们接下来引入一种新的编码器设计 Hierarchical Sequential Transduction Unit（HSTU）。HSTU 由一组通过残差连接（residual connections；He et al., 2015）连接的相同层堆叠而成。每一层包含三个子层：Pointwise Projection（逐点投影，式 1）、Spatial Aggregation（空间聚合，式 2）和 Pointwise Transformation（逐点变换，式 3）：

$
U(X),V(X),Q(X),K(X)=\text{Split}(\phi_1(f_1(X)))\tag{1}
$

$
A(X)V(X)=\phi_2\left(Q(X)K(X)^T+\text{rab}^{p,t}\right)V(X)\tag{2}
$

$
Y(X)=f_2\left(\text{Norm}\left(A(X)V(X)\right)\odot U(X)\right)\tag{3}
$

其中，$f_i(X)$ 表示 MLP；为降低计算复杂度，我们对 $f_1$ 和 $f_2$ 均使用单个线性层，即 $f_i(X)=W_i(X)+b_i$，并通过融合内核对 query（查询）$Q(X)$、key（键）$K(X)$、value（值）$V(X)$ 和 gating weight（门控权重）$U(X)$ 的计算；$\phi_1$ 和 $\phi_2$ 表示非线性函数，二者均采用 SiLU（Elfwing et al., 2017）；Norm 为 layer normalization（层归一化）；$\text{rab}^{p,t}$ 表示结合位置 $p$ 与时间 $t$ 信息的 relative attention bias（相对注意力偏置；Raffel et al., 2020）。

所用完整记号见表 9。

![DLRMs 与 GRs 关键模型组件比较](https://arxiv.org/html/2402.17152v3/x3.png)

**图 3：**关键模型组件比较：DLRMs 与 GRs。左侧展示完整 DLRM 设置（Mudigere et al., 2022），右侧展示简化的 HSTU。

HSTU 编码器设计允许用单一模块化块替换 DLRMs 中的异构模块。我们观察到，DLRMs 实际上包含三个主要阶段：Feature Extraction（特征提取）、Feature Interactions（特征交互）以及 Transformations of Representations（表示变换）。特征提取负责获得类别特征的池化嵌入表示。其最先进版本可以概括为 pairwise attention（成对注意力）和 target-aware pooling（目标感知池化；Zhou et al., 2018），这些操作可由 HSTU 层表示。

特征交互是 DLRMs 最关键的部分。常用方法包括 factorization machines（因子分解机）及其神经网络变体（Rendle, 2010；Guo et al., 2017；Xiao et al., 2017）、高阶特征交互（Wang et al., 2021）等。HSTU 通过 $\text{Norm}(A(X)V(X))\odot U(X)$，使注意力池化后的特征能够直接与其他特征“交互”，从而替代特征交互模块。

这一设计源于使用学习得到的 MLP 逼近点积的困难（Rendle et al., 2020；Zhai et al., 2023a）。由于对 $U(X)$ 应用了 SiLU，$\text{Norm}(A(X)V(X))\odot U(X)$ 也可解释为 SwiGLU（Shazeer, 2020）的一个变体。

表示变换通常使用 Mixture of Experts（专家混合，MoEs）及 routing（路由）来处理多样、异构的人群。其核心思想是针对不同用户专门化不同子网络，从而执行条件计算（Ma et al., 2018；Tang et al., 2020）。HSTU 中的逐元素点积在归一化因子的意义上，可以实现 MoEs 所使用的门控操作。

### 3.1 逐点聚合注意力

HSTU 采用新的 pointwise aggregated (normalized) attention（逐点聚合〔归一化〕注意力）机制；相较之下，softmax attention 会在整个序列上计算归一化因子。该设计基于两个因素。第一，与目标相关的历史数据点数量本身就是一项重要特征，可表征用户偏好的强度，而 softmax 归一化之后很难捕获这一信息。

这点至关重要，因为我们既需要预测交互强度，例如用户在某一条目上花费的时间，也需要预测条目之间的相对顺序，例如预测一种可最大化 AUC 的排序。第二，尽管 softmax 激活在结构上对噪声具有鲁棒性，但它不太适合流式设置中的非平稳词表。

所提出的逐点聚合注意力机制见式 2。重要的是，在逐点池化之后需要 layer norm（层归一化）来稳定训练。理解该设计的一种方式，是考察由 Dirichlet Process（狄利克雷过程）生成非平稳词表流式数据的合成数据（详见附录 C）。在这一设置中，如表 2 所示，softmax 与逐点注意力设置之间的差距可高达 44.7%。

| 架构 | HR@10 | HR@50 |
| --- | --- | --- |
| Transformers | .0442 | .2025 |
| HSTU（去除 $\text{rab}^{p,t}$，Softmax） | .0617 | .2496 |
| HSTU（去除 $\text{rab}^{p,t}$） | .0893 | .3170 |

**表 2：**单遍流式设置中的合成数据结果。

### 3.2 利用稀疏性并通过算法提高稀疏性

在推荐系统中，用户历史序列长度通常服从偏斜分布，因此输入序列具有稀疏性，尤其是在超长序列设置中。可以利用这种稀疏性显著提高编码器效率。为此，我们开发了一种面向 GPU 的高效注意力内核；它以类似 Rabe & Staats (2021) 和 Dao et al. (2022) 的方式融合连续的 GEMM 运算，但完全支持 ragged（不规则长度）的注意力计算。

这实质上将注意力计算转换为不同尺寸的 grouped GEMMs（分组 GEMM；附录 G）。因此，从内存访问量看，HSTU 中的自注意力成为 memory-bound（内存带宽受限）操作，并按 $\Theta(\sum_i n_i^2d_{qk}^2R^{-1})$ 扩展，其中 $n_i$ 是样本 $i$ 的序列长度，$d_{qk}$ 是注意力维度，$R$ 是寄存器大小。仅凭这一方法即可将吞吐量提升 2—5 倍，详见第 4.2 节。

我们进一步通过 Stochastic Length（随机长度，SL）算法提高用户历史序列的稀疏性。推荐场景中的用户历史序列有一个关键特征：用户行为在时间上具有重复性，因为用户行为会在其整个交互历史中的多个尺度上显现。这提供了一个机会：在不损害模型质量的情况下人工提高稀疏性，从而显著降低按 $\Theta(\sum_i n_i^2)$ 扩展的编码器成本。

可以将用户 $j$ 的历史表示为序列 $(x_i)_{i=0}^{n_{c,j}}$，其中 $n_{c,j}$ 是该用户交互过的内容数量。令 $N_c=\max_j n_{c,j}$。令 $(x_{i_k})_{k=0}^{L}$ 表示从原序列 $(x_i)_{i=0}^{n_{c,j}}$ 构造的长度为 $L$ 的子序列。$SL$ 按如下方式选择输入序列：

$

\begin{split}
{(x_i)_{i=0}^{n_{c,j}}}&amp;\quad\text{若 }n_{c,j}\le N_c^{\alpha/2}\\
{(x_{i_k})_{k=0}^{N_c^{\alpha/2}}}&amp;\quad\text{若 }n_{c,j}&gt;N_c^{\alpha/2},\ \text{概率为 }1-N_c^\alpha/n_{c,j}^2\\
{(x_i)_{i=0}^{n_{c,j}}}&amp;\quad\text{若 }n_{c,j}&gt;N_c^{\alpha/2},\ \text{概率为 }N_c^\alpha/n_{c,j}^2
\end{split}\tag{4}

$

这将注意力相关复杂度降低为 $O(N_c^\alpha d)=O(N^\alpha d)$，其中 $\alpha\in(1,2]$。对子序列选择的更完整讨论见第 F.1 节。我们指出，将 SL 用于训练会得到一种成本有效的系统设计，因为训练通常比推理需要显著更高的计算成本。

表 3 给出一个具有 30 天用户历史的代表性工业级配置，在不同序列长度和 $\alpha$ 值下的稀疏率（见附录 F）。模型质量下降可忽略的设置在原文中以下划线和蓝色标出。标记为“$\alpha=2.0$”的行表示不使用 SL 时的基础稀疏性。较小的 $\alpha$ 可用于更长序列，直至我们测试的最大序列长度 8192。

| Alpha（$\alpha$） | 1024 | 2048 | 4096 | 8192 |
| --- | --- | --- | --- | --- |
| 1.6 | 71.5% | 76.1% | 80.5% | 84.4% |
| 1.7 | 56.1% | 63.6% | 69.8% | 75.6% |
| 1.8 | 40.2% | 45.3% | 54.1% | 66.4% |
| 1.9 | 17.2% | 21.0% | 36.3% | 64.1% |
| 2.0 | 3.1% | 6.6% | 29.1% | 64.1% |

**表 3：**Stochastic Length（SL）对序列稀疏性的影响。

### 3.3 最小化激活内存使用量

在推荐系统中，大批量训练对于训练吞吐量（Mudigere et al., 2022）和模型质量（Yang et al., 2020；Chen et al., 2020；Zhai et al., 2023a）都至关重要。因此，与通常采用小批量训练且主要受参数内存支配的大语言模型不同，激活内存使用量成为推荐模型扩展的主要瓶颈。

与 Transformers 相比，HSTU 采用简化且完全融合的设计，从而显著减少激活内存使用量。首先，HSTU 将注意力之外的线性层数量从六个减至两个，这与近期使用逐元素门控来减少 MLP 计算的工作一致（Hua et al., 2022；Gu et al., 2022）。

其次，HSTU 积极地将计算融合为单个算子，包括式 1 中的 $\phi_1(f_1(\cdot))$，以及式 3 中的 layer norm、可选 dropout 和输出 MLP。该简化设计使 bfloat16 下每层激活内存使用量降至 $2d+2d+4hd_{qk}+4hd_v+2hd_v=14d$。

作为比较，Transformers 在注意力后使用一个前馈层和 dropout（中间状态为 $3hd_v$），随后是由 layer norm、linear、activation、linear 和 dropout 组成的逐点前馈块，其中间状态为 $2d+4d_{ff}+2d+1d=4d+4d_{ff}$。这里采用标准假设 $hd_v\ge d$ 且 $d_{ff}=4d$（Vaswani et al., 2017；Brown et al., 2020）。

因此，在计入输入与输入 layer norm（$4d$）以及 qkv 投影之后，总激活状态为 $33d$。由此，HSTU 的设计能够扩展到深度超过两倍的网络层数。

此外，用于表示词表的大规模原子 ID 也需要大量内存。对于 100 亿词表、512 维嵌入和 Adam 优化器，仅以 fp32 存储嵌入与优化器状态就需要 60 TB 内存。为缓解内存压力，我们采用 rowwise AdamW（逐行 AdamW）优化器（Gupta et al., 2014；Khudia et al., 2021），并将优化器状态放置于 DRAM，从而将每个浮点数的 HBM 占用从 12 字节降至 2 字节。

### 3.4 通过成本摊销扩展推理

我们处理的最后一个挑战，是推荐系统在服务时需要处理大量候选项。我们重点讨论排序，因为在召回中，编码器成本可以完全摊销，并且无论是利用量化、哈希或分区的 MIPS（maximum inner product search，最大内积搜索；Jegou et al., 2011；Shrivastava & Li, 2014；Li et al., 2002；Zhai et al., 2011），还是通过 beam search（束搜索）或分层召回处理非 MIPS 情形（Zhuo et al., 2020；Zhai et al., 2023a），都已有高效算法。

在排序阶段，候选项数量可达数万（Covington et al., 2016；Wang et al., 2020）。我们提出算法 M-FALCON（Microbatched-Fast Attention Leveraging Cacheable OperatioNs），用于在输入序列长度为 $n$ 时对 $m$ 个候选项执行推理。

在一次前向传播中，M-FALCON 通过修改注意力掩码和 $\text{rab}^{p,t}$ 偏置，并行处理 $b_m$ 个候选项，使得这 $b_m$ 个候选项所执行的注意力操作完全相同。当相对于 $n$，$b_m$ 可视为一个较小常数时，这会把 cross-attention 的成本从 $O(b_mn^2d)$ 降为 $O((n+b_m)^2d)=O(n^2d)$。

我们还可以选择把全部 $m$ 个候选项划分为 $\lceil m/b_m\rceil$ 个大小为 $b_m$ 的微批次，以利用编码器级 KV caching（KV 缓存；Pope et al., 2022）；缓存既可跨前向传播复用以降低成本，也可跨请求复用以最小化尾延迟（详见附录 H）。

总体而言，M-FALCON 使模型复杂度可以随传统 DLRMs 排序阶段的候选项数量线性扩展；对于第 4.3 节讨论的典型排序配置，我们在保持推理预算不变的情况下，成功部署了复杂度高 285 倍的目标感知 cross-attention 模型，并实现 1.5—3 倍吞吐量。

## 4 实验

### 4.1 验证 HSTU 编码器的归纳假设

| 数据集 | 方法 | HR@10 | HR@50 | HR@200 | NDCG@10 | NDCG@200 |
| --- | --- | --- | --- | --- | --- | --- |
| ML-1M | SASRec (2023) | .2853 | .5474 | .7528 | .1603 | .2498 |
| HSTU | .3097 (+8.6%) | .5754 (+5.1%) | .7716 (+2.5%) | .1720 (+7.3%) | .2606 (+4.3%) |
| HSTU-large | .3294 (+15.5%) | .5935 (+8.4%) | .7839 (+4.1%) | .1893 (+18.1%) | .2771 (+10.9%) |
| ML-20M | SASRec (2023) | .2906 | .5499 | .7655 | .1621 | .2521 |
| HSTU | .3252 (+11.9%) | .5885 (+7.0%) | .7943 (+3.8%) | .1878 (+15.9%) | .2774 (+10.0%) |
| HSTU-large | .3567 (+22.8%) | .6149 (+11.8%) | .8076 (+5.5%) | .2106 (+30.0%) | .2971 (+17.9%) |
| Books | SASRec (2023) | .0292 | .0729 | .1400 | .0156 | .0350 |
| HSTU | .0404 (+38.4%) | .0943 (+29.5%) | .1710 (+22.1%) | .0219 (+40.6%) | .0450 (+28.6%) |
| HSTU-large | .0469 (+60.6%) | .1066 (+46.2%) | .1876 (+33.9%) | .0257 (+65.8%) | .0508 (+45.1%) |

**表 4：**在多遍、完全打乱设置下对公开数据集进行的方法评估。

#### 4.1.1 传统序列设置

首先，我们在两个常用推荐数据集 MovieLens 和 Amazon Reviews 上评估 HSTU 的性能。我们遵循文献中的序列推荐设置，包括完全打乱和多轮训练。基线采用 SASRec，即一种最先进的 Transformer 实现（Kang & McAuley, 2018）。其他基线结果见附录 D。

与近期工作一致（Dallmann et al., 2021；Zhai et al., 2023a），我们在整个语料库上报告 Hit Rate@K 和 NDCG@K。

结果见表 4。“SASRec (2023)”表示 Zhai et al. (2023a) 报告的最佳 SASRec 训练配置。标记为“HSTU”的行使用与 SASRec 相同的配置（层数、注意力头数等均相同）。“HSTU-large”表示更大的 HSTU 编码器（层数为 4 倍，注意力头数为 2 倍）。

结果表明：a）采用针对推荐优化的设计后，HSTU 在相同配置下显著优于基线；b）继续扩大 HSTU 后，性能进一步提高。

需要指出的是，此处使用的评估方法与工业级设置存在显著差异，因为完全打乱和多轮训练通常不适用于工业界采用的流式设置（Liu et al., 2022）。

#### 4.1.2 工业级流式设置

接下来，我们在流式设置中使用工业级数据集，比较 HSTU、消融后的 HSTU 和 Transformers 的性能。在本节其余部分，我们对排序任务报告 Normalized Entropy（归一化熵，NE；He et al., 2014）。我们在 1000 亿个样本（DLRM 等价量）上训练模型，每个作业使用 64—256 块 H100。由于排序采用多任务设置，我们报告主要交互事件（“E-Task”）和主要消费事件（“C-Task”）。

在本文场景中，我们认为 NE 降低 0.001 即具有显著意义，因为对于数十亿用户，这通常会带来约 0.5% 的顶层指标提升。对于召回，由于其设置类似语言建模，我们报告 log perplexity（对数困惑度）。受资源限制，我们在较小规模设置中固定编码器参数（排序为 $l=3,n=2048,d=512$，召回为 $l=6,n=512,d=256$），并对其他超参数进行网格搜索。

| 架构 | 召回 log pplx. | 排序 E-Task（NE） | 排序 C-Task（NE） |
| --- | --- | --- | --- |
| Transformers | 4.069 | NaN | NaN |
| HSTU（去除 $\text{rab}^{p,t}$，Softmax） | 4.024 | .5067 | .7931 |
| HSTU（去除 $\text{rab}^{p,t}$） | 4.021 | .4980 | .7860 |
| Transformer++ | 4.015 | .4945 | .7822 |
| HSTU（原始 rab） | 4.029 | .4941 | .7817 |
| HSTU | 3.978 | .4937 | .7805 |

**表 5：**在单遍流式设置下，对工业级数据集上的 HSTU、消融 HSTU 和 Transformers 进行评估。

结果见表 5。第一，HSTU 显著优于 Transformers，尤其是在排序任务中，这很可能源于逐点注意力和改进的相对注意力偏置。第二，消融 HSTU 与完整 HSTU 之间的差距验证了各项设计的有效性。由于训练稳定性问题，基于 Softmax 的 HSTU 和 Transformer 的最优学习率约比其余模型低 10 倍。

即使使用更低学习率和 pre-norm residual connections（预归一化残差连接；Xiong et al., 2020），我们在标准 Transformers 的排序训练中仍频繁遭遇损失爆炸。最后，HSTU 也优于 LLM 中常用的 Transformer 变体 Transformer++（Touvron et al., 2023a），后者使用 RoPE（Su et al., 2023）、SwiGLU 等组件。总体而言，在这一小规模设置中，HSTU 以快 1.5—2 倍的实际运行时间和少 50% 的 HBM 使用量，获得更高模型质量。

### 4.2 编码器效率

**Stochastic Length。**图 4 和图 5(a) 展示 stochastic length（SL）对模型指标的影响。当 $\alpha=1.6$ 时，长度为 4096 的序列在大多数情况下会被转换为长度为 776 的序列，即移除超过 80% 的 token。即使稀疏率提高到 64%—84%，主要任务的 NE 也没有退化超过 0.002（0.2%）。

这些证据表明，在选择合适 $\alpha$ 时，SL 不会对模型质量造成负面影响，并允许通过高稀疏性降低训练成本。第 F.3 节进一步验证 SL 显著优于现有的序列长度外推技术。

![SL 对 n=4096 指标的影响](https://arxiv.org/html/2402.17152v3/x4.png)![SL 对 n=8192 指标的影响](https://arxiv.org/html/2402.17152v3/x5.png)

**图 4：**Stochastic Length（SL）对指标的影响。左：$n=4096$。右：$n=8192$。完整结果见附录 F。

**编码器效率。**图 5 比较 HSTU 与 Transformer 编码器在训练和推理设置中的效率。对于 Transformers，我们使用最先进的 FlashAttention-2 实现（Dao, 2023）。我们考虑从 1024 到 8192 的序列长度，并在训练期间应用 Stochastic Length（SL）。

在评估中，HSTU 与 Transformer 使用相同配置（$d=512,h=8,d_{qk}=64$）；考虑到第 4.1.2 节已证明 HSTU 即使不使用 $\text{rab}^{p,t}$ 也优于 Transformers，我们在此消融相对注意力偏置。我们在 NVIDIA H100 GPU 上以 bfloat16 比较编码器级性能。总体而言，在训练和推理中，HSTU 分别最多比 Transformers 高效 15.2 倍和 5.6 倍。

此外，第 3.3 节所述的激活内存使用量下降，使我们能够构造深度超过 Transformers 两倍的 HSTU 网络。

![训练 NE](https://arxiv.org/html/2402.17152v3/extracted/5575956/figures/exp_encoder_ne_fwd%2Bbwd_at_sparsity_v4.png)![训练加速比](https://arxiv.org/html/2402.17152v3/extracted/5575956/figures/exp_encoder_efficiency_fwd%2Bbwd_at_sparsity_v4.png)![推理加速比](https://arxiv.org/html/2402.17152v3/x6.png)

**图 5：**编码器级效率：HSTU 与基于 FlashAttention2 的 Transformers 在训练（a、b）和推理（c）中的比较。（a）训练 NE；（b）训练加速比；（c）推理加速比。

### 4.3 工业级流式设置中的 Generative Recommenders 与 DLRMs

最后，我们在工业级流式设置中比较 GRs 与最先进 DLRM 基线的端到端性能。我们的 GR 实现反映生产中使用的典型配置，而 DLRM 设置则反映数百人在多年间的持续迭代。由于推荐系统的召回阶段使用多个生成器，我们同时报告加入 GR（“add source”）和替换现有主要 DLRM 源（“replace source”）的在线结果。

表 6 和表 7 表明，GR 不仅在线下显著优于 DLRMs，还在 A/B 测试中带来 12.4% 的提升。

| 方法 | 离线 HR@100 | 离线 HR@500 | 在线 E-Task | 在线 C-Task |
| --- | --- | --- | --- | --- |
| DLRM | 29.0% | 55.5% | +0% | +0% |
| DLRM（消融特征） | 28.3% | 54.3% | — | — |
| GR（仅内容） | 11.6% | 18.8% | — | — |
| GR（仅交互） | 35.6% | 61.7% | — | — |
| GR（新来源） | 36.9% | 62.4% | +6.2% | +5.0% |
| GR（替换来源） | — | — | +5.1% | +1.9% |

**表 6：**召回模型的离线／在线比较。

| 方法 | 离线 E-Task NE | 离线 C-Task NE | 在线 E-Task | 在线 C-Task |
| --- | --- | --- | --- | --- |
| DLRM | .4982 | .7842 | +0% | +0% |
| DLRM（DIN+DCN） | .5053 | .7899 | — | — |
| DLRM（消融特征） | .5053 | .7925 | — | — |
| GR（仅交互） | .4851 | .7903 | — | — |
| GR | .4845 | .7645 | +12.4% | +4.4% |

**表 7：**排序模型的离线／在线比较。

如第 2 节所述，GRs 建立在原始类别交互特征之上，而 DLRMs 通常使用显著更多的特征进行训练，其中大部分是从原始信号人工构造的。如果将 GRs 使用的同一组特征提供给 DLRMs（“DLRM〔消融特征〕”），DLRMs 的性能会显著下降；这表明 GRs 可以通过其架构和统一特征空间有效捕获这些特征所表达的信息。

我们还通过与仅考虑用户交互条目的传统序列推荐器设置（Kang & McAuley, 2018；“GR〔仅交互〕”）比较，进一步验证第 2.2 节中的 GR 表述。该设置的结果显著更差；其排序变体在主要消费任务中的 NE 比完整 GRs 差 2.6%。

考虑到基于内容的方法（包括 LMs）十分流行，我们还加入一个仅使用内容特征的 GR 基线（“GR〔仅内容〕”）。基于内容的基线与 DLRMs/GRs 之间的巨大性能差距，凸显了高基数用户行为的重要性。

![推理吞吐量比较](https://arxiv.org/html/2402.17152v3/x7.png)

**图 6：**在最具挑战性的排序设置中比较推理吞吐量。完整结果见第 H.1 节。

最后，我们在图 6 中比较 GRs 与生产 DLRMs 的效率。尽管 GR 模型的计算复杂度高 285 倍，但由于 HSTU 和第 3.4 节提出的 M-FALCON 算法，当评分 1024／16384 个候选项时，我们分别实现了 1.50／2.99 倍更高的 QPS。

#### 4.3.1 推荐系统的扩展定律

![召回扩展图 1](https://arxiv.org/html/2402.17152v3/x8.png)![召回扩展图 2](https://arxiv.org/html/2402.17152v3/x9.png)![排序扩展图](https://arxiv.org/html/2402.17152v3/x10.png)

**图 7：**可扩展性：大规模工业设置中，DLRMs 与 GRs 在召回（上、中）和排序（下）任务上的比较。HR 提高 0.005 和 NE 降低 0.001 均代表显著改进。

众所周知，在大规模工业设置中，DLRMs 的质量会在某些计算量和参数规模区间内饱和（Zhao et al., 2023）。为更好理解这一现象，我们比较 GRs 与 DLRMs 的可扩展性。

由于特征交互层对 DLRM 性能至关重要（Mudigere et al., 2022），在排序设置中，我们使用 Transformers（Vaswani et al., 2017）、DHEN（Zhang et al., 2022），以及生产环境中使用、以残差连接（He et al., 2015）增强的 DCN 变体（Wang et al., 2021），来扩展 DLRM 基线。

对于召回基线，由于原基线采用残差设置，我们扩大了隐藏层大小、嵌入维度和层数。对于基于 HSTU 的 Generative Recommenders（GRs），我们通过调整 HSTU 的超参数来扩大型语言模型，包括残差层数、序列长度、嵌入维度、注意力头数等。我们还调整了召回中的负样本数量。

结果见图 7。在低计算量区间，由于人工构造特征，DLRMs 可能优于 GRs，这印证了特征工程在传统 DLRMs 中的重要性。然而，GRs 相对于 FLOPs 表现出显著更好的可扩展性，而 DLRM 性能趋于平台期，这与既有工作的发现一致。我们还观察到，GRs 对嵌入参数和非嵌入参数都具有更好的可扩展性。

GRs 最终扩展到 1.5 万亿参数模型，而 DLRMs 的性能在约 2000 亿参数处饱和。

最后，在选择适当超参数后，我们的所有主要指标——包括召回的 Hit Rate@100 和 Hit Rate@500，以及排序的 NE——都经验性地按计算量的幂律扩展。

我们在三个数量级上观察到这一现象，直至能够测试的最大型语言模型（序列长度 8192、嵌入维度 1024、24 层 HSTU）；此时，由于我们采用标准流式训练设置，将计算量归一化到 365 天后，所用总计算量接近 GPT-3（Brown et al., 2020）和 LLaMa-2（Touvron et al., 2023b）的总训练计算量，如图 1 所示。

在合理范围内，相较于施加的总训练计算量，具体模型超参数的重要性较低。与语言建模（Kaplan et al., 2020）不同，序列长度在 GRs 中发挥着显著更为重要的作用，因此必须同步扩大序列长度和其他参数。

这可能是所提出方法最重要的优势，因为我们首次表明，LLMs 的扩展定律也可能适用于大规模推荐系统。

## 5 相关工作

既有序列推荐器工作将用户交互简化为条目上的单一同质序列（Hidasi et al., 2016；Kang & McAuley, 2018）。序列方法的工业级应用主要采用 pairwise attention（Zhou et al., 2018），或将序列编码器作为 DLRMs 的组成部分（Chen et al., 2019；Xia et al., 2023）。为提高效率，也有研究使用多阶段注意力代替自注意力（Chang et al., 2023）。

在召回任务中，已有工作探索将 ID 表示为 token 序列的生成式方法（Zhuo et al., 2020）。第 B.1 节提供了更全面的既有工作讨论。

由于自注意力具有 $O(n^2)$ 扩展因子，高效注意力一直是主要研究方向，代表性工作包括 factorized attentions（分解注意力；Child et al., 2019）、low-rank approximations（低秩近似；Katharopoulos et al., 2020）等。近期也有研究探索序列转导设置的替代表述（Gu et al., 2022；Hua et al., 2022）。尤其是，HSTU 的逐元素门控设计受到 FLASH（Hua et al., 2022）启发。

近期的 hardware-aware（硬件感知）表述已被证明可以显著降低内存使用量（Rabe & Staats, 2021；Korthikanti et al., 2022；Zhai et al., 2023b），并显著改善实际运行时间（Dao et al., 2022）。长度外推允许在短序列上训练的模型进行泛化，但多数工作聚焦于微调或改进偏置机制（Press et al., 2022）。

与此不同，本文在长度维度引入随机性，其灵感来自在深度维度引入随机性的研究（Huang et al., 2016）。

对 large language models（大语言模型，LLMs）的兴趣推动了若干工作，它们将各种推荐任务视为预训练 LLMs 之上的 in-context learning（上下文学习；Sileo et al., 2022）、instruction tuning（指令微调；Bao et al., 2023）或 transfer learning（迁移学习；Li et al., 2023）。LLMs 中嵌入的世界知识可以迁移到下游任务（Cui et al., 2022），并在 zero-shot（零样本）或 few-shot（少样本）场景中改进推荐。

用户行为序列的文本表示也在中等规模数据集上表现出良好的扩展行为（Shin et al., 2023）。大多数面向推荐的 LLM 研究集中于低数据量区间；在大规模设置中，它们尚未在 MovieLens 上优于 collaborative filtering（协同过滤；Hou et al., 2024）。

## 6 结论

本文提出 Generative Recommenders（GRs），这是一种将排序和召回表述为序列转导任务的新范式，使二者能够以生成式方式训练。该范式由新的 HSTU 编码器设计实现；HSTU 在长度为 8192 的序列上比最先进 Transformers 快 5.3—15.2 倍，同时结合 M-FALCON 等新的训练和推理算法。借助 GRs，我们在使用更少推理计算量的情况下，部署了复杂度高 285 倍的模型。

GRs 和 HSTU 在生产环境中使指标提升 12.4%，并相较传统 DLRMs 表现出更优的扩展性能。我们的结果证明，用户行为是生成式建模中尚未得到充分探索的一种模态——正如标题所言，“行动胜于言辞”。

本文对特征的显著简化，使跨领域使用统一特征空间成为可能，从而为推荐、搜索和广告领域的首批基础模型铺平道路。GRs 的完全序列化设置也使推荐能够在端到端生成式框架中表述。这两点共同使推荐系统能够更全面地辅助用户。

#### 影响声明

我们认为，本文工作具有广泛的积极影响。降低推荐、搜索和广告系统对大量异构特征的依赖，可以在改善用户体验的同时，使这些系统更有利于隐私保护。

通过完全序列表述，使推荐系统能够将用户的长期结果归因于短期决策，可能降低网络上不符合用户长期目标的内容（包括点击诱饵和虚假新闻）的普遍程度，并使平台激励与用户价值观更一致。

最后，基础模型和扩展定律的应用可以帮助减少推荐、搜索及相关用例的模型研究与开发所产生的碳足迹。

### 致谢

本文工作代表数百人的共同努力；若无以下贡献者的工作，本文不可能完成（按字母顺序）：Adnan Akhundov, Bugra Akyildiz, Shabab Ayub, Alex Bao, Renqin Cai, Jennifer Cao, Guoqiang Jerry Chen, Lei Chen, Sean Chen, Xianjie Chen, Huihui Cheng, Weiwei Chu, Ted Cui, Shiyan Deng, Nimit Desai, Fei Ding, Francois Fagan, Lu Fang, Liang Guo, Liz Guo, Jeevan Gyawali, Yuchen Hao, Daisy Shi He, Samuel Hsia, Jie Hua, Yanzun Huang, Hongyi Jia, Rui Jian, Jian Jin, Rahul Kindi, Changkyu Kim, Yejin Lee, Fu Li, Hong Li, Shen Li, Wei Li, Zhijing Li, Xueting Liao, Emma Lin, Hao Lin, Jingzhou Liu, Xingyu Liu, Kai Londenberg, Liang Luo, Linjian Ma, Matt Ma, Yun Mao, Bert Maher, Matthew Murphy, Satish Nadathur, Min Ni, Jongsoo Park, Jing Qian, Lijing Qin, Alex Singh, Timothy Shi, Dennis van der Staay, Xiao Sun, Colin Taylor, Shin-Yeh Tsai, Rohan Varma, Omkar Vichare, Alyssa Wang, Pengchao Wang, Shengzhi Wang, Wenting Wang, Xiaolong Wang, Zhiyong Wang, Wei Wei, Bin Wen, Carole-Jean Wu, Eric Xu, Bi Xue, Zheng Yan, Chao Yang, Junjie Yang, Zimeng Yang, Chunxing Yin, Daniel Yin, Yiling You, Keke Zhai, Yanli Zhao, Zhuoran Zhao, Hui Zhang, Jingjing Zhang, Lu Zhang, Lujia Zhang, Na Zhang, Rui Zhang, Xiong Zhang, Ying Zhang, Zhiyun Zhang, Charles Zheng, Erheng Zhong, Xin Zhuang。

我们感谢 Shikha Kapoor, Rex Cheung, Lana Dam, Ram Ramanathan, Nipun Mathur, Bo Feng, Yanhong Wu, Zhaohui Guo, Hongjie Bai, Wen-Yun Yang, Zellux Wang, Arun Singh, Bruce Deng, Yisong Song, Haotian Wu, Meihong Wang 提供产品支持，并感谢 Joseph Laria, Akshay Hegde, Abha Jain, Raj Ganapathy 在项目管理方面提供协助。

最后，我们感谢 Ajit Mathews, Shilin Ding, Hong Yan, Lars Backstrom 提供领导支持，并感谢与 Andrew Tulloch, Liang Xiong, Kaushik Veeraraghavan, Gaofeng Zhao 进行的富有洞见的讨论。

## 参考文献

1.  Bao, K., Zhang, J., Zhang, Y., Wang, W., Feng, F., and He, X. Tallrec: An effective and efficient tuning framework to align large language model with recommendation. In Proceedings of the 17th ACM Conference on Recommender Systems, RecSys ’23. ACM, 2023.
2.  Brown, T. B., Mann, B., Ryder, N., et al. Language models are few-shot learners. 2020.
3.  Chang, J., Zhang, C., Fu, Z., et al. Twin: Two-stage interest network for lifelong user behavior modeling in CTR prediction at Kuaishou. 2023.
4.  Chen, Q., Zhao, H., Li, W., Huang, P., and Ou, W. Behavior sequence transformer for e-commerce recommendation in Alibaba. DLP-KDD, 2019.
5.  Chen, T., Kornblith, S., Norouzi, M., and Hinton, G. A simple framework for contrastive learning of visual representations. ICML, 2020.
6.  Cheng, H.-T., Koc, L., Harmsen, J., et al. Wide & deep learning for recommender systems. DLRS, 2016.
7.  Child, R., Gray, S., Radford, A., and Sutskever, I. Generating long sequences with sparse transformers. 2019.
8.  Covington, P., Adams, J., and Sargin, E. Deep neural networks for YouTube recommendations. RecSys, 2016.
9.  Cui, Z., Ma, J., Zhou, C., Zhou, J., and Yang, H. M6-rec: Generative pretrained language models are open-ended recommender systems. 2022.
10.  Dallmann, A., Zoller, D., and Hotho, A. A case study on sampling strategies for evaluating neural sequential item recommendation models. RecSys, 2021.
11.  Dao, T. FlashAttention-2: Faster attention with better parallelism and work partitioning. 2023.
12.  Dao, T., Fu, D. Y., Ermon, S., Rudra, A., and Ré, C. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. NeurIPS, 2022.
13.  Devlin, J., Chang, M., Lee, K., and Toutanova, K. BERT: Pre-training of deep bidirectional transformers for language understanding. NAACL-HLT, 2019.
14.  Eksombatchai, C., Jindal, P., Liu, J. Z., et al. Pixie: A system for recommending 3+ billion items to 200+ million users in real-time. WWW, 2018.
15.  Elfwing, S., Uchibe, E., and Doya, K. Sigmoid-weighted linear units for neural network function approximation in reinforcement learning. 2017.
16.  Gao, W., Fan, X., Wang, C., et al. Learning an end-to-end structure for retrieval in large-scale recommendations. CIKM, 2021.
17.  Gillenwater, J., Kulesza, A., Fox, E., and Taskar, B. Expectation-maximization for learning determinantal point processes. NIPS, 2014.
18.  Gu, A., Goel, K., and Ré, C. Efficiently modeling long sequences with structured state spaces. ICLR, 2022.
19.  Guo, H., Tang, R., Ye, Y., Li, Z., and He, X. DeepFM: A factorization-machine based neural network for CTR prediction. IJCAI, 2017.
20.  Gupta, M. R., Bengio, S., and Weston, J. Training highly multiclass classifiers. JMLR, 2014.
21.  He, K., Zhang, X., Ren, S., and Sun, J. Deep residual learning for image recognition. 2015.
22.  He, X., Pan, J., Jin, O., et al. Practical lessons from predicting clicks on ads at Facebook. ADKDD, 2014.
23.  Hidasi, B., Karatzoglou, A., Baltrunas, L., and Tikk, D. Session-based recommendations with recurrent neural networks. ICLR, 2016.
24.  Hou, Y., Zhang, J., Lin, Z., et al. Large language models are zero-shot rankers for recommender systems. ECIR, 2024.
25.  Hua, W., Dai, Z., Liu, H., and Le, Q. V. Transformer quality in linear time. ICML, 2022.
26.  Huang, G., Sun, Y., Liu, Z., Sedra, D., and Weinberger, K. Deep networks with stochastic depth. 2016.
27.  Jegou, H., Douze, M., and Schmid, C. Product quantization for nearest neighbor search. IEEE TPAMI, 2011.
28.  Kang, W.-C. and McAuley, J. Self-attentive sequential recommendation. ICDM, 2018.
29.  Kaplan, J., McCandlish, S., Henighan, T., et al. Scaling laws for neural language models. 2020.
30.  Katharopoulos, A., Vyas, A., Pappas, N., and Fleuret, F. Transformers are RNNs: Fast autoregressive transformers with linear attention. ICML, 2020.
31.  Khudia, D., Huang, J., Basu, P., et al. FBGEMM: Enabling high-performance low-precision deep learning inference. 2021.
32.  Klenitskiy, A. and Vasilev, A. Turning dross into gold loss: Is BERT4Rec really better than SASRec? RecSys, 2023.
33.  Korthikanti, V., Casper, J., Lym, S., et al. Reducing activation recomputation in large transformer models. 2022.
34.  Li, C., Chang, E., Garcia-Molina, H., and Wiederhold, G. Clustering for approximate similarity search in high-dimensional spaces. IEEE TKDE, 2002.
35.  Li, J., Wang, M., Li, J., et al. Text is all you need: Learning language representations for sequential recommendation. KDD, 2023.
36.  Liu, Z., Zou, L., Zou, X., et al. Monolith: Real time recommendation system with collisionless embedding table. 2022.
37.  Ma, J., Zhao, Z., Yi, X., Chen, J., Hong, L., and Chi, E. H. Modeling task relationships in multi-task learning with multi-gate mixture-of-experts. KDD, 2018.
38.  Mudigere, D., Hao, Y., Huang, J., et al. Software-hardware co-design for fast and scalable training of deep learning recommendation models. ISCA, 2022.
39.  Peng, B., Quesnelle, J., Fan, H., and Shippole, E. YaRN: Efficient context window extension of large language models. ICLR, 2024.
40.  Pope, R., Douglas, S., Chowdhery, A., et al. Efficiently scaling transformer inference. 2022.
41.  Press, O., Smith, N. A., and Lewis, M. Train short, test long: Attention with linear biases enables input length extrapolation. ICLR, 2022.
42.  Rabe, M. N. and Staats, C. Self-attention does not need $O(n^2)$ memory. 2021.
43.  Raffel, C., Shazeer, N., Roberts, A., et al. Exploring the limits of transfer learning with a unified text-to-text transformer. JMLR, 2020.
44.  Rendle, S. Factorization machines. ICDM, 2010.
45.  Rendle, S., Krichene, W., Zhang, L., and Anderson, J. Neural collaborative filtering vs. matrix factorization revisited. RecSys, 2020.
46.  Shazeer, N. GLU variants improve transformer. 2020.
47.  Shin, K., Kwak, H., Kim, S. Y., et al. Scaling law for recommendation models: Towards general-purpose user representations. AAAI, 2023.
48.  Shrivastava, A. and Li, P. Asymmetric LSH for sublinear time maximum inner product search. NeurIPS, 2014.
49.  Sileo, D., Vossen, W., and Raymaekers, R. Zero-shot recommendation as language modeling. ECIR, 2022.
50.  Su, J., Lu, Y., Pan, S., et al. RoFormer: Enhanced transformer with rotary position embedding. 2023.
51.  Sun, F., Liu, J., Wu, J., et al. BERT4Rec: Sequential recommendation with bidirectional encoder representations from transformer. CIKM, 2019.
52.  Tang, H., Liu, J., Zhao, M., and Gong, X. Progressive layered extraction: A novel multi-task learning model for personalized recommendations. RecSys, 2020.
53.  Touvron, H., Lavril, T., Izacard, G., et al. LLaMA: Open and efficient foundation language models. 2023a.
54.  Touvron, H., Martin, L., Stone, K., et al. Llama 2: Open foundation and fine-tuned chat models. 2023b.
55.  Vaswani, A., Shazeer, N., Parmar, N., et al. Attention is all you need. NIPS, 2017.
56.  Wang, R., Shivanna, R., Cheng, D., et al. DCN V2: Improved deep & cross network and practical lessons for web-scale learning to rank systems. WWW, 2021.
57.  Wang, Z., Zhao, L., Jiang, B., et al. COLD: Towards the next generation of pre-ranking system. 2020.
58.  Xia, X., Eksombatchai, P., Pancha, N., et al. TransAct: Transformer-based realtime user action model for recommendation at Pinterest. KDD, 2023.
59.  Xiao, J., Ye, H., He, X., et al. Attentional factorization machines: Learning the weight of feature interactions via attention networks. IJCAI, 2017.
60.  Xiong, R., Yang, Y., He, D., et al. On layer normalization in the transformer architecture. ICML, 2020.
61.  Yang, J., Yi, X., Cheng, D. Z., et al. Mixed negative sampling for learning two-tower neural networks in recommendations. WWW Companion, 2020.
62.  Zhai, J., Lou, Y., and Gehrke, J. Atlas: A probabilistic algorithm for high dimensional similarity search. SIGMOD, 2011.
63.  Zhai, J., Gong, Z., Wang, Y., et al. Revisiting neural retrieval on accelerators. KDD, 2023a.
64.  Zhai, Y., Jiang, C., Wang, L., et al. ByteTransformer: A high-performance transformer boosted for variable-length inputs. IPDPS, 2023b.
65.  Zhang, B., Luo, L., Liu, X., et al. DHEN: A deep and hierarchical ensemble network for large-scale click-through rate prediction. 2022.
66.  Zhao, X., Xia, L., Zhang, L., et al. Deep reinforcement learning for page-wise recommendations. RecSys, 2018.
67.  Zhao, Z., Yang, Y., Wang, W., et al. Breaking the curse of quality saturation with user-centric ranking. 2023.
68.  Zhou, G., Zhu, X., Song, C., et al. Deep interest network for click-through rate prediction. KDD, 2018.
69.  Zhou, K., Wang, H., Zhao, W. X., et al. S3-Rec: Self-supervised learning for sequential recommendation with mutual information maximization. CIKM, 2020.
70.  Zhuo, J., Xu, Z., Dai, W., et al. Learning optimal tree models under beam search. ICML, 2020.

## 附录 A　记号

表 8 和表 9 汇总本文使用的关键记号。

| 符号 | 说明 |
| --- | --- |
| $\Psi_k(t_j)$ | 特征日志系统在时间 $t_j$ 发出的第 $k$ 个训练样本（$k$ 按全局顺序编号）。在典型 DLRM 推荐系统中，用户消费某项内容 $\Phi_i$ 后（即以跳过、完整观看视频、分享等行为 $a_i$ 作出响应），特征日志系统将二元组 $(\Phi_i,a_i)$ 与用于对 $\Phi_i$ 排序的特征连接，并将 $(\Phi_i,a_i,\text{用于 }\Phi_i\text{ 的特征})$ 作为训练样本 $\Psi_k(t_j)$ 发出。正如第 2.3 节所述，DLRMs 与 GRs 处理的训练样本数量不同；GRs 中的样本数量通常少 1—2 个数量级。 |
| $n_c$（$n_{c,i}$） | 用户（或用户／样本 $i$）已经交互过的内容数量。 |
| $\Phi_0,\ldots,\Phi_{n_c-1}$ | 在推荐系统语境中，用户已经交互过的内容列表。 |
| $a_0,\ldots,a_{n_c-1}$ | 与各 $\Phi_i$ 对应的用户行为列表。当所有预测事件均为二值时，每个行为可视为由点赞、分享、评论、图像查看、视频启动、视频完整播放、隐藏等原子事件构成的 multi-hot（多热）向量。 |
| $E,F$ | 图 2 中 DLRMs 的类别特征。$E_0,E_1,\ldots,E_7,E_8$ 和 $F_0,F_1,\ldots,F_7$ 表示通过特征提取，在不同时间点从 $(\Phi_0,a_0,t_0),\ldots,(\Phi_{n_c-1},a_{n_c-1},t_{n_c-1})$ 获得的变换结果（例如最近点赞的 10 张图像、与当前候选项相比用户过去点击过的 50 个最相似 URL 等）。“merge & sequentialize”表示获得原始交互序列 $(\Phi_0,a_0,t_0),\ldots,(\Phi_{n_c-1},a_{n_c-1},t_{n_c-1})$ 的（虚拟）逆过程。 |
| $G,H$ | 图 2 中与用户—内容交互无关的 DLRM 类别特征。正如第 2.1 节所述并在图 2 中所示，这些特征（例如人口统计属性或所关注的创作者）被合并进主时间序列（用户交互内容列表，例如 $\Phi_0,a_0,\ldots,\Phi_{n_c-1},a_{n_c-1}$）。 |
| $n$（$n_i$） | 序列转导任务中（用户／样本 $i$）的 token 数量。虽然 $O(n)=O(n_c)$，但即使不存在与非交互相关的类别特征，$n$ 仍可能与 $n_c$ 不同；例如见表 1。 |
| $x_0,\ldots,x_{n-1}$ | 序列转导任务中的输入 token 列表。 |
| $y_0,\ldots,y_{n-1}$ | 序列转导任务中的输出 token 列表。 |
| $t_0,\ldots,t_{n-1}$ | 观察到 $x_0,\ldots,x_{n-1}$ 时对应的时间戳列表。 |
| $\mathbb X,\mathbb X_c$ | 全部输入／输出 token 的词表 $\mathbb X$，以及其中的内容子集 $\mathbb X_c$。 |
| $N,N_c$ | 分别为 $\max_i n_i$ 和 $\max_i n_{c,i}$。 |
| $u_t$ | 时间 $t$ 的用户表示。 |
| $s_u(n_i),\hat s_u(n_i)$ | 生成式训练中用户 $i$ 的采样率（第 2.3 节）。 |
| $d$ | 模型维度（嵌入维度）。 |
| $d_{qk}$ | HSTU 与 Transformers 的注意力维度大小，适用于式 1 中的 $Q(X)$ 和 $K(X)$。 |
| $d_v$ | HSTU 的 value 维度大小。对于 Transformers，通常有 $d_{qk}=d_v$。 |
| $d_{ff}$ | Transformers 逐点前馈层的隐藏维度大小。HSTU 不使用前馈层；见下文 $U(X)$。 |
| $h$ | 注意力头数量。 |
| $l$ | HSTU 的层数。对 Transformers 而言，一个注意力层与一个逐点前馈层共同构成一层。 |

**表 8：**记号表（续表见表 9）。

| 符号 | 说明 |
| --- | --- |
| $X$ | HSTU 层的输入。按标准术语（批处理前），若输入序列含 $N$ 个 token，则 $X\in\mathbb R^{N\times d}$。 |
| $Q(X),K(X),V(X)$ | 基于式 1 从给定输入 $X$ 获得的 HSTU query、key 和 value。其定义类似标准 Transformers 中的 $Q,K,V$。有 $Q(X),K(X)\in\mathbb R^{h\times N\times d_{qk}}$，$V(X)\in\mathbb R^{h\times N\times d_v}$。 |
| $U(X)$ | 在式 3 中，HSTU 使用 $U(X)$ 对注意力池化后的 value（$V(X)$）进行“门控”；它与 $f_2(\cdot)$ 共同使 HSTU 能完全避免前馈层。$U(X)\in\mathbb R^{h\times N\times d_v}$。 |
| $A(X)$ | 输入 $X$ 对应的注意力张量，$A(X)\in\mathbb R^{h\times N\times N}$。 |
| $Y(X)$ | HSTU 层对输入 $X$ 产生的输出，$Y(X)\in\mathbb R^d$。 |
| $\text{Split}(\cdot)$ | 将张量拆分为若干块的操作。式 1 中 $\phi_1(f_1(X))\in\mathbb R^{N\times(2hd_{qk}+2hd_v)}$；通过 $U(X),V(X),Q(X),K(X)=\text{Split}(\phi_1(f_1(X)))$ 拆分较大张量（并置换维度），得到 $U(X),V(X)$（形状均为 $h\times N\times d_v$）以及 $Q(X),K(X)$（形状均为 $h\times N\times d_{qk}$）。 |
| $\text{rab}^{p,t}$ | 同时结合位置信息（Raffel et al., 2020）和时间信息的相对注意力偏置；时间信息基于观察 token 的时间 $t_0,\ldots,t_{n-1}$，一种可能实现是对 $(t_j-t_i)$ 进行分桶。实践中，同一层不同注意力头共享 $\text{rab}^{p,t}$，因此 $\text{rab}^{p,t}\in\mathbb R^{1\times N\times N}$。 |
| $\alpha$ | 控制 HSTU 所用 Stochastic Length 算法稀疏性的参数（第 3.2 节）。 |
| $R$ | 第 3.2 节 HSTU 算法语境下的 GPU 寄存器大小。 |
| $m$ | 推荐系统排序阶段考虑的候选项数量。 |
| $b_m$ | 第 3.4 节 M-FALCON 算法中的微批次大小。 |

**表 9：**记号表（续）。

## 附录 B　Generative Recommenders：背景与表述

鉴于经典 Deep Learning Recommendation Models（DLRMs）从 YouTube DNN 时代起即广为流行（Covington et al., 2016），并被所有大型在线内容与电子商务平台广泛使用（Cheng et al., 2016；Zhou et al., 2018；Wang et al., 2021；Chang et al., 2023；Xia et al., 2023；Zhai et al., 2023a），许多读者可能更熟悉 DLRMs（Mudigere et al., 2022）。

DLRMs 在异构特征空间上运行，并使用多种神经网络，包括特征交互模块（Guo et al., 2017；Xiao et al., 2017；Wang et al., 2021）、序列池化或目标感知成对注意力模块（Hidasi et al., 2016；Zhou et al., 2018；Chang et al., 2023），以及先进的多专家多任务模块（Ma et al., 2018；Tang et al., 2020）。

因此，第 2 节和第 3 节通过与经典 DLRMs 显式对比，给出了 Generative Recommenders（GRs）的概述。本节从经典序列推荐器文献出发，为读者提供另一种视角。

### B.1 背景：学术界和工业界的序列推荐

#### B.1.1 学术研究（传统序列推荐器设置）

GRU4Rec（Hidasi et al., 2016）首次将 recurrent neural networks（循环神经网络，RNNs）用于推荐场景。Hidasi et al. (2016) 考察 Gated Recurrent Units（门控循环单元，GRUs），并在 RecSys Challenge 2015 与 VIDEO（私有数据集）两个数据集上应用该方法。

在两种情况下，输入序列都仅保留正事件，即被点击的电子商务条目，或用户观看时间至少达到一定阈值的视频。我们进一步观察到，在由召回和排序阶段构成的经典工业级两阶段推荐系统中（Covington et al., 2016），Hidasi et al. (2016) 所解决的任务主要对应召回任务。

**Transformers、序列转导架构及其变体。**此后序列转导架构的发展，尤其是 Transformers（Vaswani et al., 2017），推动了推荐系统中的类似进展。SASRec（Kang & McAuley, 2018）首次在自回归设置中应用 Transformers。

该工作将评论或评分的存在视为正反馈，从而把 Amazon Reviews 和 MovieLens 等经典数据集转换为正条目序列，类似 GRU4Rec。

其使用 binary cross-entropy（二元交叉熵）损失，其中正目标定义为下一个“正”条目（本质上只是存在评论或评分），负目标从条目语料 $\mathbb X=\mathbb X_c$ 中随机采样。

此后大多数研究都建立在上述 GRU4Rec（Hidasi et al., 2016）和 SASRec（Kang & McAuley, 2018）的类似设置之上，例如 BERT4Rec（Sun et al., 2019）采用 BERT（Devlin et al., 2019）的双向编码器设置，S3Rec（Zhou et al., 2020）引入显式预训练阶段等。

#### B.1.2 作为 Deep Learning Recommendation Models（DLRMs）组成部分的工业应用

序列方法（包括序列编码器和成对注意力模块）能够作为 DLRMs 的组成部分增强用户表示，因此已广泛用于工业设置。DLRMs 通常使用相对较短的序列长度，例如 BST（Chen et al., 2019）为 20，DIN（Zhou et al., 2018）为 1000，TransAct（Xia et al., 2023）为 100。我们观察到，这些长度比本文的 8192（第 4.3 节）小 1—3 个数量级。

尽管序列较短，大多数 DLRMs 仍能成功捕获长期用户偏好。这可以归因于两个关键因素。第一，现代 DLRMs 通常使用预计算用户画像／嵌入（Xia et al., 2023）或外部向量存储（Chang et al., 2023），二者都能有效延长回溯窗口。

第二，系统通常采用大量上下文侧、用户侧和条目侧特征（Zhou et al., 2018；Chen et al., 2019；Chang et al., 2023；Xia et al., 2023），并使用 FMs（Xiao et al., 2017；Guo et al., 2017）、DCNs（Wang et al., 2021）、MoEs 等多种异构网络来变换表示和组合输出。

与第 B.1.1 节讨论的序列设置不同，所有主要工业工作都在（用户／请求，候选条目）对上定义损失。在排序设置中，通常使用多任务 binary cross-entropy 损失。在召回设置中，two-tower（双塔）设置（Covington et al., 2016）仍是主流方法。

### B.2 表述：在 Generative Recommenders（GRs）中将排序与召回建模为序列转导任务

本节进一步比较 GRs 与传统序列推荐器。我们首先指出传统序列推荐器与工业推荐设置之间的三项关键差异。

**传统序列推荐器忽略与负面交互或非交互相关的异构特征。**传统序列推荐器通常只对“正”交互序列建模。例如，GRU4Rec 只保留用户点击的电子商务条目或观看达到一定时长的视频；SASRec、BERT4Rec 和 S3Rec 则把存在评论或评分视为正反馈。此类设置忽略负反馈和其他类别特征。

相比之下，工业级推荐系统依赖大量异构特征，包括正面与负面交互、人口统计属性、所关注创作者、请求上下文等。忽略这些特征会显著限制模型质量。

我们通过实验验证了这一点：忽略此类特征的传统“仅交互”表述会显著降低模型质量。表 6 和表 7 中标记为“GR（仅交互）”的行显示，仅使用交互历史会使召回 Hit Rate@100 降低 1.3%，并使排序 NE 恶化 2.6%（第 4.1.2 节与第 4.3.1 节已说明，NE 变化 0.1% 即具有显著意义）。

**用户表示在目标无关设置中计算。**第二个问题是，大多数传统序列推荐器——包括 GRU4Rec（Hidasi et al., 2016）、SASRec（Kang & McAuley, 2018）、BERT4Rec（Sun et al., 2019）、S3Rec（Zhou et al., 2020）等——都采用目标无关表述：对于目标条目 $\Phi_i$，使用 $\Phi_0,\Phi_1,\ldots,\Phi_{i-1}$ 作为编码器输入计算用户表示，随后基于该表示进行预测。

相反，工业设置中使用的主要 DLRM 方法通常以目标感知方式表述其序列模块，使用户表示能够纳入“目标”（排序候选项）信息。这些方法包括 DIN（Zhou et al., 2018；Alibaba）、BST（Chen et al., 2019；Alibaba）、TWIN（Chang et al., 2023；Kwai）和 TransAct（Xia et al., 2023；Pinterest）。

Generative Recommenders（GRs）通过交错内容序列与行为序列（第 2.2 节），结合两类方法的优势，从而在因果自回归设置中应用目标感知注意力。表 10 对既有工作与本文方法进行分类和比较。大多数大规模工业推荐系统由于日志数据量巨大，需要在流式／单遍设置中训练。

| 方法 | 目标条目 $i$ 的输入 | 目标条目 $i$ 的期望输出 | 架构 | 训练流程 |
| --- | --- | --- | --- | --- |
| GRs | $\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_i$ | $a_i$（目标感知） | Self-attention（HSTU） | 因果自回归（流式／单遍） |
| GRU4Rec | $\Phi_0,\Phi_1,\ldots,\Phi_{i-1}$ | $\Phi_i$ | RNNs（GRUs） | 因果自回归（多遍） |
| SASRec | Self-attention（Transformers） |
| BERT4Rec | 推理时为 $\Phi_0,\Phi_1,\ldots,\Phi_{i-1}$ | $\Phi_i$ | Self-attention（Transformers） | 序列多遍训练 |
| S3Rec |
| DIN | $\Phi_0,\Phi_1,\ldots,\Phi_i$ | $a_i$（目标感知，隐式作为 DLRMs 的组成部分） | Pairwise attention | 逐点（通常流式／单遍） |
| BST | Self-attention（Transformers） |
| TWIN | Two-stage pairwise attention |
| TransAct | $(\Phi_0,a_0),\ldots,(\Phi_{i-1},a_{i-1}),\Phi_i$ | Self-attention（Transformers） |

**表 10：**排序设置中，既有序列推荐器工作与 GRs 的比较；为完整起见，也列出 DLRMs。BERT4Rec 通过 Cloze 与逐点（最后一个条目）监督损失的混合进行多遍训练；S3Rec 则将预训练与微调作为两个独立阶段。

**判别式表述将既有序列推荐器工作限制在逐点设置。**最后，传统序列推荐器在设计上属于判别式模型。包括 GRU4Rec 和 SASRec 等奠基性工作在内的既有序列推荐器文献，对 $p(\Phi_i\mid\Phi_0,a_0,\ldots,\Phi_{i-1},a_{i-1})$ 建模，即在给定用户当前状态时，下一个推荐条目的条件分布。

另一方面，我们观察到标准推荐系统中存在两个概率过程：推荐系统向用户建议内容 $\Phi_i$（例如照片或视频）的过程，以及用户通过某种行为 $a_i$（可由点赞、完整观看视频、跳过等组合构成）响应所建议内容 $\Phi_i$ 的过程。

生成式方法需要对建议内容与用户行为序列的联合分布建模，即 $p(\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_{n_c-1},a_{n_c-1})$，如第 2.2 节所述。所提出的 Generative Recommenders 能够对此类分布建模，如表 11（图 8）所示。

需要注意，下一个行为 token（$a_i$）预测任务正是表 1 所讨论的 GR 排序设置；下一个内容 token（$\Phi_i$）预测任务则类似适配到交错设置的召回任务，但其目标经过修改，以学习输入数据分布。

| 任务 | 项目 | 规格 |
| --- | --- | --- |
| 下一个行为 token（$a_i$）预测 | $x_i$ | $\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_{n_c-2},a_{n_c-2},\Phi_{n_c-1},a_{n_c-1}$ |
| $y_i$ | $a_0,\varnothing,a_1,\varnothing,\ldots,a_{n_c-2},\varnothing,a_{n_c-1},\varnothing$ |
| $n$ | $2n_c$ |
| 下一个内容 token（$\Phi_i$）预测 | $x_i$ | $\Phi_0,a_0,\Phi_1,a_1,\ldots,\Phi_{n_c-2},a_{n_c-2},\Phi_{n_c-1},a_{n_c-1}$ |
| $y_i$ | $\varnothing,\Phi_1,\varnothing,\Phi_2,\ldots,\varnothing,\Phi_{n_c-1},\varnothing,\varnothing$ |
| $n$ | $2n_c$ |

**表 11：**对 $p(\Phi_0,a_0,\ldots,\Phi_{n_c-1},a_{n_c-1})$ 的生成式建模。图 8 给出示意。

![传统序列推荐器](https://arxiv.org/html/2402.17152v3/x11.png)![生成式推荐器](https://arxiv.org/html/2402.17152v3/x12.png)

**图 8：**传统序列推荐器（左）与 Generative Recommenders（右）的比较。为便于比较，左侧以因果自回归设置中的序列推荐器为例，右侧展示不含上下文特征的 GRs。在左侧，行为类型 $a_i$ 要么被忽略，要么在进入自注意力块之前通过 MLP 与条目信息 $\Phi_i$ 组合。

重要的是，该表述不仅能够正确建模数据分布，还可通过 beam search 等方法，直接采样要推荐给用户的条目序列。我们推测，与传统 listwise（列表级）设置（例如 DPP；Gillenwater et al., 2014，以及 RL；Zhao et al., 2018）相比，这将形成更优方法；我们将此类系统的完整表述与评估（第 6 节作了简要讨论）留作未来工作。

## 附录 C　评估：合成数据

正如第 3.1 节所述，标准 softmax attention 由于其归一化因子，很难捕获对用户表示学习至关重要的用户偏好强度。在推荐场景中，这一点很重要，因为系统除了需要预测条目的相对排序外，还可能需要预测交互强度，例如未来在某一主题上的正面行为数量。

为理解这种行为，我们按照 Dirichlet Process 构造合成数据，使其在动态词表集合上生成流式数据。Dirichlet Process 能够捕获用户交互历史中的“富者愈富”行为。合成实验设置如下：

-   将 20,000 个条目 ID 中的每一个随机且唯一地分配给 100 个类别之一。
-   生成 1,000,000 条长度均为 128 的记录，前 90% 用于训练，后 10% 用于测试。为模拟流式训练，初始只提供 40% 的条目 ID，其余 ID 以相等间隔逐步开放；例如，在第 500,000 条记录处，可采样的最大 ID 为 $(40\%+60\%\times0.5)\times20{,}000=14{,}000$。
-   对每条记录，从 100 个类别中随机选择最多 5 个类别，并在这 5 个类别上随机采样先验 $H_c$。随后按可能类别上的 Dirichlet process，为各位置依次采样类别：当 $n&gt;1$ 时，以概率 $\alpha/(\alpha+n-1)$ 从 $H_c$ 抽取类别 $c$；以概率 $n_c/(\alpha+n-1)$ 抽取类别 $c$，其中 $n_c$ 是此前属于类别 $c$ 的条目数量；最后在满足流式约束的条件下，随机采样一个属于类别 $c$ 的条目。

其中，$\alpha$ 从 $(1.0,500.0)$ 上均匀随机采样。

结果见表 2。由于该数据集没有时间戳，我们始终对 HSTU 消融 $\text{rab}^{p,t}$。相较标准 Transformers，HSTU 将 Hit Rate@10 提高超过 100%。重要的是，以 softmax 替换 HSTU 的逐点注意力机制（“HSTU w/ Softmax”）同样会显著降低命中率，从而验证了逐点注意力式聚合机制的重要性。

## 附录 D　评估：传统序列推荐器设置

第 4.1.1 节的评估侧重于使用最新训练方案，将 HSTU 与最先进 Transformer 基线 SASRec 进行比较。本节进一步考察另外两种替代方法。

**Recurrent neural networks（RNNs）。**我们考虑经典序列推荐工作 GRU4Rec（Hidasi et al., 2016），以帮助读者理解：在完整纳入最新建模与训练改进后，包括 Transformers 和 HSTU 在内的自注意力模型与传统 RNNs 相比表现如何。

**Self-supervised sequential approaches（自监督序列方法）。**我们考察最常用的 BERT4Rec（Sun et al., 2019），以理解 BERT4Rec 通过 Cloze 目标利用的双向自监督，与 SASRec 和 HSTU 等单向因果自回归设置之间的差异。

| 数据集 | 方法 | HR@10 | HR@50 | HR@200 | NDCG@10 | NDCG@200 |
| --- | --- | --- | --- | --- | --- | --- |
| ML-1M | SASRec (2023) | .2853 | .5474 | .7528 | .1603 | .2498 |
| BERT4Rec | .2843 (-0.4%) | — | — | .1537 (-4.1%) | — |
| GRU4Rec | .2811 (-1.5%) | — | — | .1648 (+2.8%) | — |
| HSTU | .3097 (+8.6%) | .5754 (+5.1%) | .7716 (+2.5%) | .1720 (+7.3%) | .2606 (+4.3%) |
| HSTU-large | .3294 (+15.5%) | .5935 (+8.4%) | .7839 (+4.1%) | .1893 (+18.1%) | .2771 (+10.9%) |
| ML-20M | SASRec (2023) | .2906 | .5499 | .7655 | .1621 | .2521 |
| BERT4Rec | .2816 (-3.4%) | — | — | .1703 (+5.1%) | — |
| GRU4Rec | .2813 (-3.2%) | — | — | .1730 (+6.7%) | — |
| HSTU | .3252 (+11.9%) | .5885 (+7.0%) | .7943 (+3.8%) | .1878 (+15.9%) | .2774 (+10.0%) |
| HSTU-large | .3567 (+22.8%) | .6149 (+11.8%) | .8076 (+5.5%) | .2106 (+30.0%) | .2971 (+17.9%) |
| Books | SASRec (2023) | .0292 | .0729 | .1400 | .0156 | .0350 |
| HSTU | .0404 (+38.4%) | .0943 (+29.5%) | .1710 (+22.1%) | .0219 (+40.6%) | .0450 (+28.6%) |
| HSTU-large | .0469 (+60.6%) | .1066 (+46.2%) | .1876 (+33.9%) | .0257 (+65.8%) | .0508 (+45.1%) |

**表 12：**传统序列推荐器设置（多遍、完全打乱）下公开数据集上的方法评估。与表 4 相比，为完整起见加入 GRU4Rec 和 BERT4Rec 两个基线。

结果见表 12。ML-1M 和 ML-20M 上的 BERT4Rec 与 GRU4Rec 结果复用 Klenitskiy & Vasilev (2023) 的报告。由于采用 sampled softmax loss（采样 softmax 损失），为保证方法间公平比较，我们固定负样本数量：ML-1M 和 ML-20M 为 128，Amazon Books 为 512。

结果确认，在使用 sampled softmax loss 时，SASRec 仍是传统序列推荐设置中最具竞争力的方法之一（Zhai et al., 2023a；Klenitskiy & Vasilev, 2023）；同时，HSTU 显著优于所评估的 Transformers、RNNs 和自监督双向 Transformers。

## 附录 E　评估：传统 DLRM 基线

第 4 节使用的 DLRM 基线配置，反映数百名研究人员和工程师在多年间的持续迭代，并近似于 HSTUs/GRs 部署前，一个拥有数十亿日活跃用户的大型互联网平台上的生产配置。下文给出所用模型的高层描述。

**排序设置。**如 Mudigere et al. (2022) 所述，排序基线模型使用约一千个稠密特征和五十个稀疏特征。

我们纳入多种建模技术，包括 Mixture of Experts（Ma et al., 2018）、Deep & Cross Network 的变体（Wang et al., 2021）、多种序列推荐模块（包括目标感知成对注意力；工业设置中常用的一种变体见 Zhou et al., 2018），以及特殊交互层上的残差连接（He et al., 2015；Zhang et al., 2022）。

对于扩展定律部分（第 4.3.1 节）的低 FLOPs 区间，为达到所需 FLOPs，部分高计算成本模块被简化，或替换为 DCNs 等其他最先进变体。

出于保密考虑，我们无法披露精确设置；但据我们所知，在完整纳入近期研究后，该基线代表目前已知最佳 DLRM 方法之一。

为验证这一说法并帮助读者理解，我们在表 7 中报告一个使用完全相同特征、但只采用 DIN（Zhou et al., 2018）、DCN（Wang et al., 2021）和 MMoE（Ma et al., 2018）等主要已发表结果的典型设置（“DLRM〔DIN+DCN〕”）；组合架构见图 9。

与生产 DLRM 设置相比，该设置在主要 E-Task 上的 NE 比生产设置高出 0.71%，在主要 C-Task 上高出 0.57%（其中 NE 变化 0.1% 即具有显著意义）。

![DLRM 排序基线架构](https://arxiv.org/html/2402.17152v3/x13.png)

**图 9：**DLRM 排序基线模型的高层架构（表 7 中“DLRM〔DIN+DCN〕”）；该模型使用 DIN（Zhou et al., 2018）、DCN（Wang et al., 2021）和 MMoE（Ma et al., 2018）等主要已发表工作。

**召回设置。**召回基线模型采用标准 two-tower neural retrieval（双塔神经召回）设置（Covington et al., 2016），并结合批内与批外混合采样。输入特征集合同时包含高基数稀疏特征（例如条目 ID、用户 ID）和低基数稀疏特征（例如语言、主题、兴趣实体）。一组带残差连接的前馈层（He et al., 2015）用于将输入特征压缩为用户嵌入和条目嵌入。

**特征与序列长度。**两个 DLRM 基线所用特征（包括由各种序列编码器／成对注意力模块使用的主要用户交互历史）都是所有 GR 候选模型所用特征的严格超集。该陈述适用于本文进行的全部研究，包括扩展研究（第 4.3.1 节）。

## 附录 F　Stochastic Length

### F.1　子序列选择

在公式 4 中，为提高稀疏性，我们从完整用户历史中选择一个长度为 $L$ 的子序列。

我们的经验结果表明，审慎设计子序列选择技术可以改善模型质量。

我们计算度量 $f_i=t_n-t_i$，其对应于用户自与条目 $x_i$ 交互以来经过的时间。

我们使用以下子序列选择方法开展离线实验：

-   **Greedy Selection（贪心选择）**——从 $S$ 中选择 $f_i$ 值最小的 $L$ 个条目。
-   **Random Selection（随机选择）**——从 $S$ 中随机选择 $L$ 个条目。
-   **Feature-Weighted Selection（特征加权选择）**——按照加权分布 $1-f_{n,i}/(\sum_{j=1}^{L}f_{j,i})$，从 $S$ 中选择 $L$ 个条目。

在我们的离线实验中，特征加权子序列选择方法取得了最佳模型质量，如表 13 所示。

| 指标名称 | 选择类型 |
| --- | --- |
| Greedy | Weighted \| Random |
| --- | --- | --- |
| 主要参与度指标（NE） | 0.495 | 0.494 \| 0.495 |
| 主要消费指标（NE） | 0.792 | 0.789 \| 0.791 |

**表 13：**Stochastic Length 的不同子序列选择方法在模型质量上的比较，模型质量以 Normalized Entropy（归一化熵，NE）衡量。

### F.2　Stochastic Length 对序列稀疏性的影响

在表 3 中，我们针对一个具有 30 天用户参与历史的代表性工业规模配置，展示 Stochastic Length 对序列稀疏性的影响。

序列稀疏性定义为：1 减去所有样本的平均序列长度与最大序列长度之比。

为更准确地刻画稀疏注意力的计算成本，我们还定义了 $s2$，其定义为一减去注意力矩阵的稀疏性。

作为参考，我们分别在表 14 和表 15 中给出 60 天与 90 天用户参与历史的结果。

| Alpha | 最大序列长度 |
| --- | --- |
| 1,024 | 2,048 \| 4,096 \| 8,192 |
| --- | --- | --- | --- |
| sparsity | s2 | sparsity | s2 \| sparsity \| s2 \| sparsity \| s2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.6 | 71.5% | 89.4% | 75.8% | 92.3% | 79.4% | 94.7% | 83.8% \| 97.3% |
| 1.7 | 57.3% | 77.6% | 60.6% | 79.8% | 67.3% | 86.6% | 74.5% \| 93.3% |
| 1.8 | 37.5% | 56.2% | 42.6% | 62.1% | 51.9% | 74.2% | 62.6% \| 85.5% |
| 1.9 | 15.0% | 25.2% | 17.7% | 29.0% | 29.6% | 47.5% | 57.8% \| 80.9% |
| 2.0 | 1.2% | 1.7% | 2.5% | 3.5% | 18.9% | 30.8% | 57.6% \| 80.6% |

**表 14：**在 60 天用户参与历史上，Stochastic Length（SL）对序列稀疏性的影响。

| Alpha | 最大序列长度 |
| --- | --- |
| 1,024 | 2,048 \| 4,096 \| 8,192 |
| --- | --- | --- | --- |
| sparsity | s2 | sparsity | s2 \| sparsity \| s2 \| sparsity \| s2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.6 | 68.0% | 85.0% | 74.6% | 90.8% | 78.6% | 93.5% | 83.5% \| 97.3% |
| 1.7 | 56.3% | 76.1% | 61.2% | 80.6% | 67.5% | 87.0% | 74.3% \| 93.3% |
| 1.8 | 38.9% | 58.3% | 42.0% | 61.3% | 50.4% | 72.4% | 61.0% \| 84.4% |
| 1.9 | 16.2% | 27.3% | 17.3% | 28.6% | 27.2% | 44.4% | 54.3% \| 77.8% |
| 2.0 | 0.9% | 1.2% | 1.6% | 2.1% | 13.5% | 22.5% | 54.0% \| 77.4% |

**表 15：**在 90 天用户参与历史上，Stochastic Length（SL）对序列稀疏性的影响。

![SL 对排序指标的影响，n=1024](https://arxiv.org/html/2402.17152v3/x14.png)![SL 对排序指标的影响，n=2048](https://arxiv.org/html/2402.17152v3/x15.png)![SL 对排序指标的影响，n=4096](https://arxiv.org/html/2402.17152v3/x16.png)![SL 对排序指标的影响，n=8192](https://arxiv.org/html/2402.17152v3/x17.png)

**图 10：**Stochastic Length（SL）对排序模型指标的影响。从左至右：$n=[1024,2048,4096,8192]$（如第 2.2 节所述，为在因果掩码设置中支持 target-aware cross attention（目标感知交叉注意力），此处的 $n$ 是经过交错算法后的长度）。

### F.3　与序列长度外推技术的比较

我们开展额外研究，以验证 Stochastic Length 相对于语言建模中现有序列长度外推技术具有竞争力。

许多现有方法通过修改 RoPE（Su et al., 2023）执行序列长度外推。

为与现有方法比较，我们训练一个不含相对注意力偏置、采用 rotary embeddings（旋转位置嵌入）的 HSTU 变体 HSTU-RoPE。

我们在 HSTU-RoPE 上评估以下序列长度外推方法：

-   **Zero-Shot**——应用 NTK-Aware RoPE（Peng et al., 2024），随后在不进行微调的情况下直接评估模型；
-   **Fine-tune**——应用 NTK-by-parts（Peng et al., 2024）后，对模型微调 1,000 步。

我们在 HSTU（包含相对注意力偏置，不含旋转嵌入）上评估以下序列长度外推方法：

-   **Zero-Shot**——根据最大训练序列长度截断相对位置偏置，并直接评估模型（Raffel et al., 2020；Press et al., 2022）；
-   **Fine-tune**——根据最大训练序列长度截断相对位置偏置，在评估模型前对其微调 1,000 步。

在表 16 中，我们报告训练期间引入数据稀疏性的模型（Stochastic Length、zero-shot、fine-tuning）与在完整数据上训练的模型之间的 NE 差异。

对于 zero-shot 和 fine-tuning 技术，我们将稀疏性定义为训练期间的平均序列长度除以评估期间的最大序列长度。

所有 zero-shot 和 fine-tuned 模型均在序列长度为 1,024 的数据上训练，并在序列长度为 2,048 和 4,096 的数据上评估。

为针对这些技术确定适当的 Stochastic Length 基线，我们选择产生相同数据稀疏性度量的 Stochastic Length 设置。

我们认为，zero-shot 和 fine-tuning 序列长度外推方法并不适用于处理高基数 ID 的推荐场景。

经验上，我们观察到 Stochastic Length 显著优于 fine-tuning 和 zero-shot 方法。

我们认为，这可能是由我们的大词表规模所致。

Zero-shot 和 fine-tuning 方法无法为较早出现的 ID 学习良好表示，这可能损害其充分利用较长序列所含信息的能力。

| 评估策略 | 模型类型 | 相对于完整序列基线的平均 NE 差异 |
| --- | --- | --- |
| 2,048／52% 稀疏性 | 4,096／75% 稀疏性 |
| --- | --- |
| Zero-shot | HSTU（Raffel et al., 2020） \| 6.46% \| 10.35% |
| HSTU-RoPE（Peng et al., 2024） | 7.51% \| 11.27% |
| Fine-tune | HSTU（Raffel et al., 2020） \| 1.92% \| 2.21% |
| HSTU-RoPE（Peng et al., 2024） | 1.61% \| 2.19% |
| Stochastic Length（SL） | HSTU \| 0.098% \| 0.64% |

**表 16：**Stochastic Length（SL）与现有 Length Extrapolation（长度外推）方法的比较。

## 附录 G　Sparse Grouped GEMMs 与 Fused Relative Attention Bias

本节补充介绍第 3.2 节提出的高效 HSTU 注意力内核。

我们的方法以 Memory-efficient Attention（Rabe & Staats, 2021）和 FlashAttention（Dao et al., 2022）为基础，是一种 memory-efficient self-attention mechanism（内存高效自注意力机制）：它将输入划分为块，并避免在反向传播时物化大型 $h\times N\times N$ 中间注意力张量。

通过利用输入序列的稀疏性，我们可以将注意力计算重构为一组形状不同、首尾相接执行的 GEMMs。

我们实现了高效 GPU 内核以加速该计算。

由于内存访问开销，相对注意力偏置的构造也成为瓶颈。

为解决该问题，我们将相对偏置构造和 grouped GEMMs（分组 GEMM）融合到单个 GPU 内核中，并在反向传播期间使用 GPU 的高速 shared memory（共享内存）累积梯度。

尽管我们的算法需要在反向传播中重新计算注意力和相对偏置，但与 Transformers 使用的标准方法相比，其速度显著更快，且占用更少内存。

## 附录 H　Microbatched-Fast Attention Leveraging Cacheable OperatioNs（M-FALCON）

本节详细说明第 3.4 节讨论的 M-FALCON 算法。

我们在算法 1 中给出 M-FALCON 的伪代码。

M-FALCON 引入三个关键思想。

![GR 排序模型的因果自回归训练](https://arxiv.org/html/2402.17152v3/x18.png)![使用 M-FALCON 的 GR 排序模型推理](https://arxiv.org/html/2402.17152v3/x19.png)

**图 11：**M-FALCON 算法示意图。上：GR 在目标感知表述下的模型训练，即因果自回归设置中的 GR 排序模型训练（具有 $n=2n_c$ 个 token）。下：使用 M-FALCON 算法的 GR 排序模型推理。推理时有 $m$ 个候选 $\Phi'_0,\ldots,\Phi'_{m-1}$，其被划分为 $\lceil m/b_m\rceil$ 个微批次；图中虚线上方展示第一个微批次 $\Phi'_0,\ldots,\Phi'_{b_m-1}$ 的模型推理（计入 $\Phi_0,a_0,\ldots,\Phi_{n_c-1},a_{n_c-1}$ 后，共有 $2n_c+b_m$ 个 token）。注意，自注意力算法经过修改，使得当 $i\neq j$ 时，$\Phi'_i$ 不能注意到 $\Phi'_j$；图中以“$\times$”突出表示这一点。

**Batched inference（批处理推理）可应用于因果自回归设置。**如第 2.2 节所述，GR 中的排序任务以目标感知方式表述。

通常的观点认为，在目标感知设置中，我们需要逐条目执行推理；对于 $m$ 个候选和长度为 $n$ 的序列，其成本为 $O(mn^2d)$。

我们在此表明，这并非最优解决方案；即使使用原始 Transformers，我们也可以修改自注意力中使用的注意力掩码，对这些操作进行批处理（“batched inference”），并将成本降低至 $O((n+m)^2d)=O(n^2d)$。

图 11 给出了示意说明。

图 11(a) 与图 11(b) 均涉及因果自回归设置中的注意力掩码矩阵。

关键差异在于，图 11(a) 对因果训练采用大小为 $2n_c$ 的标准下三角矩阵；图 11(b) 则修改大小为 $2n_c+b_m$ 的下三角矩阵，将满足 $i,j\geq2n_c, i\neq j$ 的 $(i,j)$ 位置设为 False 或 $-\infty$，以阻止目标位置 $\Phi'_0,\ldots,\Phi'_{b_m-1}$ 相互注意。

由此容易看出，针对 $\Phi'_i,a'_i$ 的自注意力块输出仅依赖于 $\Phi_0,a_0,\ldots,\Phi_{n_c-1},a_{n_c-1}$，而不依赖于 $\Phi'_j$（$i\neq j$）。

换言之，使用修改后的注意力掩码对 $(2n_c+b_m)$ 个 token 执行一次前向传播，即可使最后 $b_m$ 个 token 获得与下述操作相同的结果：分别对 $(2n_c+1)$ 个 token 执行 $b_m$ 次前向传播，并在第 $i$ 次使用标准因果注意力掩码的前向传播中，将 $\Phi'_i$ 放置在第 $2n_c$ 个位置（从 0 开始计数）。

**Microbatching（微批处理）将批处理推理扩展至大型候选集合。**排序阶段可能需要处理大量排序候选，数量可达数万（Wang et al., 2020）。

我们可以将全部 $m$ 个候选划分为 $\lceil m/b_m\rceil$ 个大小为 $b_m$ 的微批次，使得 $O(b_m)=O(n)$；对于大多数实际推荐设置，即使候选数量达到数万，这仍可保持前述 $O((n+m)^2d)=O(n^2d)$ 的运行时间。

**Encoder-level caching（编码器级缓存）支持请求内与请求间的计算共享。**最后，KV caching（KV 缓存）（Pope et al., 2022）可同时应用于请求内部和请求之间。

例如，对于本文提出的 HSTU 模型（第 3 节），$K(X)$ 和 $V(X)$ 可以在微批次内部和／或请求之间完全缓存。

对于一次带缓存的前向传播，我们仅需为最后 $b_m$ 个 token 计算 $U(X)$、$Q(X)$、$K(X)$ 和 $V(X)$，同时复用包含 $n$ 个 token 的序列化用户历史所对应的已缓存 $K(X)$ 和 $V(X)$。

类似地，$f_2(\text{Norm}(A(X)V(X))\odot U(X))$ 也只需针对 $b_m$ 个候选重新计算。

这将带缓存前向传播的计算复杂度降低至 $O(b_md^2+b_mnd)$；即使 $b_m=n$，相较 $O((n+b_m)d^2+(n+b_m)^2d)$，其仍可获得 2–4 倍的显著改进。

### 算法 1　M-FALCON Algorithm

**1:　输入：**合并后的 token 序列 $x_0,x_1,\ldots,x_{n-1}$（例如，可以是 $(\Phi_0,a_0,\ldots,\Phi_{n_c-1},a_{n_c-1})$，其中 $n=2n_c$）；$m$ 个排序候选 $\Phi'_0,\ldots,\Phi'_{m-1}$；一个在因果自回归设置下训练的、具有 $b$ 层和 $h$ 个注意力头的自注意力模型（例如 HSTU 或 Transformers）$f(X,cacheStates,attnMask)\rightarrow(X',updatedCacheStates)$，其中 $X,X'\in\mathbb{R}^{N\times d}$、$attnMask\in\mathbb{R}^{N\times N}$，且 $cachedStates,updatedCacheStates\in\mathbb{R}^{b\times h\times N\times d_{qk}}\times\mathbb{R}^{b\times h\times N\times d_{qk}}$（因为跨 $b$ 层缓存 $K(X)$ 和 $V(X)$）；微批次大小 $b_m$。为简化表述，假设 $m$ 是 $b_m$ 的整数倍。

**2:　输出：**全部 $m$ 个排序候选的预测 $(a'_0,\ldots,a'_{m-1})$。

**3:**　$numMicrobatches=(m+b_m-1)//b_m$

**4:**　$attnMask=L_{n+b_m}$　{$L_{n+b_m}$ 表示下三角矩阵。下三角位置为 0，其余位置为 $-\infty$。}

**5:**　对 $i,j\geq n,i\neq j$，令 $attnMask[i,j]=-\infty$　{这会阻止最后 $b_m$ 个条目相互注意。}

**6:**　$(a'_0,a'_1,\ldots,a'_{b_m-1}),kvCache\leftarrow f(embLayer((x_0,x_1,\ldots,x_{n-1},\Phi'_0,\ldots,\Phi'_{b_m-1})),\varnothing,attnMask)$

**7:**　$predictions=(a'_0,a'_1,\ldots,a'_{b_m-1})$

**8:**　$i=1$

**9:**　**while** $i&lt;numMicrobatches$ **do**

**10:**　　$(a'_{b_mi},a'_{b_mi+1},\ldots,a'_{b_m(i+1)-1}),\_\leftarrow f(embLayer((x_0,x_1,\ldots,x_{n-1},\Phi'_{b_mi},\ldots,\Phi'_{b_m(i+1)-1})),kvCache,attnMask)$

**11:**　　$predictions\leftarrow predictions+(a'_{b_mi},a'_{b_mi+1},\ldots,a'_{b_m(i+1)-1})$

**12:**　　$i\leftarrow i+1$

**13:**　**end while**

**14:**　**return** $predictions$

为帮助理解，算法 1 在图 11 中进行示意。

需要指出的是，M-FALCON 不仅适用于 HSTUs 和 GRs；作为一种推理优化算法，它也广泛适用于基于自注意力架构的其他目标感知因果自回归设置。

### H.1　推理吞吐量评估：采用 M-FALCON 的 Generative Recommenders（GRs）与 DLRMs

如第 3.4 节所述，M-FALCON 并行处理 $b_m$ 个候选，以在推理时将计算成本摊销至全部 $m$ 个候选。

为理解我们的设计，我们基于相同硬件设置，比较 GRs 与 DLRMs 的吞吐量，即每秒评分的候选数量（QPS）。

如图 12 和图 13 所示，由于批处理推理支持成本摊销，GRs 的吞吐量随排序阶段候选数量 $m$ 呈次线性增长，直至达到某一上限；在我们的案例研究中，该上限为 $m=2048$。

这证实了批处理推理在因果自回归设置中的关键性。

由于注意力复杂度按 $O((n+b_m)^2)$ 扩展，仅使用多个微批次本身即可提高吞吐量。

在微批处理基础上，缓存进一步消除了冗余的线性计算和注意力计算。

如图 13 所示，相对于采用单个微批次的 $b_m=m=1024$ 基线，两者结合可额外带来最高 1.99 倍加速。

总体而言，借助高效 HSTU 编码器设计并使用 M-FALCON，基于 HSTU 的 Generative Recommenders 在大规模生产设置中的吞吐量最高可比 DLRMs 高 2.99 倍，尽管 GRs 按 FLOPs 衡量的复杂度高 285 倍。

![DLRMs 与使用 M-FALCON 的 GRs 端到端推理吞吐量](https://arxiv.org/html/2402.17152v3/x20.png)

**图 12：**大规模工业设置中的端到端推理吞吐量：DLRMs 与采用 M-FALCON 的 GRs。注意，此图与图 6 相同，此处重新给出以便阅读。

![M-FALCON 吞吐量扩展](https://arxiv.org/html/2402.17152v3/x21.png)

**图 13：**端到端推理吞吐量：在大批量设置下，M-FALCON 在 285 倍 FLOPs 的 GR 模型之上的吞吐量扩展；其中 $m$（排序候选总数）从 1,024 变化至 16,384，且 $b_m=1024$。
