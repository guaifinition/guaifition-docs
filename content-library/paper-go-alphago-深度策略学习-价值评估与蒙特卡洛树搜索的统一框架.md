## 摘要

AlphaGo 是将深度卷积神经网络、强化学习（Reinforcement Learning，RL）与蒙特卡洛树搜索（Monte Carlo Tree Search，MCTS）统一到同一在线决策系统中的代表性工作。其关键创新并不是以神经网络取代搜索，而是分别利用策略模型提供行动先验、利用价值模型近似长期胜负结果，并通过树搜索在当前局面上对这些近似进行前瞻验证与统计修正。原始 AlphaGo 构造了监督学习策略网络 $p_\sigma$、强化学习策略网络 $p_\rho$、快速推演策略 $p_\pi$ 与价值网络 $v_\theta$，形成“专家棋谱监督学习—自我博弈策略改进—价值函数学习—Policy/Value-guided MCTS”的分阶段技术路线。本文以课程 ASR 的知识主线为基础，结合 Silver 等人在 _Nature_ 发表的原始论文及 Google DeepMind 官方资料，对 AlphaGo 的问题背景、技术难点、训练流程、网络结构、搜索机制、工程实现、实验结果和后续演化进行系统重构，并对课程口述中容易产生歧义的模型角色、快速推演策略性质和搜索先验作用作技术性校正。

**关键词：**AlphaGo；Monte Carlo Tree Search（MCTS）；Policy Network；Value Network；Reinforcement Learning（RL）；Self-play；Policy Gradient；PUCT；Computer Go

## 1\. 研究背景：为什么围棋长期构成计算机博弈难题

围棋属于确定性、双人、零和、完全信息序贯博弈。若状态空间和计算资源均无限，则可以通过完整博弈树递归计算最优价值函数 $v^*(s)$，并在每个状态选择使最终收益最大的行动。然而实际搜索树规模近似随 $b^d$ 增长，其中 $b$ 为平均分支因子，$d$ 为对局深度。Silver 等人在原始 AlphaGo 论文中给出的典型数量级为：国际象棋约有 $b\approx35,d\approx80$，围棋则约有 $b\approx250,d\approx150$。Google DeepMind 官方资料进一步给出围棋可能棋盘配置约为 $10^{170}$ 的数量级。如此大的状态和行动空间使穷举式前瞻搜索不可行。

围棋相较国际象棋还存在显著的局面评价困难。国际象棋中的棋子具有相对稳定的物质价值，传统程序可以通过棋子价值、王安全、中心控制等手工特征构造局面评价函数；围棋中单个棋子的价值高度依赖整体势力、棋链、气、厚薄与潜在转换关系，局部得失经常需要在较长时间尺度后才能确定。因此，围棋同时面临**搜索宽度过大**与**局面价值函数难以人工构造**两个问题。

≈250AlphaGo 原论文给出的围棋典型平均分支因子数量级

≈150典型完整对局深度数量级

10170DeepMind 官方说明中的围棋棋盘配置数量级

2015AlphaGo 以 5∶0 战胜樊麾，首次在十九路无让子正式比赛击败职业棋手

蒙特卡洛树搜索（MCTS）的出现缓解了传统围棋程序对人工评价函数的依赖。其基本思想是通过大量模拟估计行动价值，并使用树搜索逐步将计算集中到表现较好的分支。MCTS 使计算机围棋从较弱水平提升至较强业余水平，但仅依赖浅层模式策略和大规模 rollout 仍然存在搜索资源分散、模拟质量受限和方差较高等问题。AlphaGo 的主要贡献是把深度学习得到的策略先验和局面价值函数嵌入 MCTS，使搜索从“近似盲目的大量采样”转变为“学习模型引导下的选择性计算”。

## 2\. 核心难点：搜索宽度、搜索深度与估值误差

对于大规模博弈树，降低计算复杂度主要存在两个互补方向。第一类方法降低**有效搜索深度**：在某个中间状态 $s$ 截止继续展开，并用近似价值函数 $v(s)\approx v^*(s)$ 预测后续结果。第二类方法降低**有效搜索宽度**：使用策略分布 $p(a\mid s)$ 使有限搜索资源优先投入概率较高或潜力较大的行动，而不是对所有合法行动平均分配计算。

式（1）完整博弈树的组合增长

$

          |\mathcal{T}| \approx b^d
          
$

传统 Monte Carlo rollout 通过从状态 $s$ 采样一条或多条完整行动序列直到终局，以终局胜负作为状态价值估计。它避免了在每一层都展开全部行动，因此实际上用随机采样压缩搜索宽度；但如果 rollout policy 较弱，则单次模拟方差很高，需要大量重复推演。AlphaGo 将这一问题分解为三个互补子问题：首先利用 **Policy Network** 为搜索建立非均匀先验；其次利用 **Value Network** 直接估计局面结果，减少对完整随机推演的依赖；最后利用 **MCTS** 根据真实博弈动力学在线校正模型误差。

#### 难点 A：行动空间过宽

每一步存在大量合法落子，若搜索资源近似均匀分配，大部分计算会消耗在低价值分支。

#### 难点 B：长期价值难估计

局部棋形对最终胜负的影响可能跨越很长时间尺度，单纯短视启发函数难以可靠评价。

#### 难点 C：Rollout 方差

弱策略模拟至终局可以获得真实终局标签，但单次样本噪声较大，需要高吞吐量重复采样。

#### 难点 D：模型与搜索的接口

高质量深度网络推理速度显著慢于浅层启发式，系统必须在准确率、延迟与并行吞吐量间平衡。

## 3\. AlphaGo 的核心工作与贡献

原始 AlphaGo 的技术路线可以理解为对“学习”和“规划”进行功能分工。离线学习阶段把专家经验和自我博弈数据压缩为策略函数与价值函数；在线决策阶段则通过 MCTS 将这些近似函数转化为针对当前局面的具体行动。其主要工作包括：

1.  以人类高手棋谱训练监督学习策略网络（Supervised Learning Policy Network，SL policy network）$p_\sigma$，学习专家行动分布；
2.  从 $p_\sigma$ 初始化强化学习策略网络（Reinforcement Learning Policy Network，RL policy network）$p_\rho$，通过自我博弈与 policy gradient 直接优化最终胜率；
3.  使用 $p_\rho$ 生成大规模去相关的自我博弈状态，训练价值网络（Value Network）$v_\theta$ 预测长期比赛结果；
4.  训练一个计算极快的 rollout policy $p_\pi$，用于叶节点终局模拟；
5.  构建 Asynchronous Policy and Value MCTS（APV-MCTS），综合先验概率 $P(s,a)$、访问次数、网络价值与 rollout 结果进行在线搜索；
6.  通过异步 GPU/CPU 计算、并行搜索与 virtual loss 等工程机制提高吞吐量。

![AlphaGo总体技术架构图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/488f653fe7.svg)

**图 1　AlphaGo 总体技术架构。** 原始 AlphaGo 并非由单一网络直接输出最佳落子，而是采用分阶段训练并在实战中由 MCTS 汇总多个估计器。根据 Silver et al. (2016) 的训练与搜索流程重新绘制，非原论文图像。

## 4\. 模型体系与功能分工

课程 ASR 将 AlphaGo 描述为“若干策略网络加一个估值网络”，这一主线基本正确，但不同策略模型的性质和实际角色需要严格区分。原始系统中的四个关键模型如下。

| 模型 | 英文名称 / 记号 | 训练方式 | 主要用途 | 实战 MCTS 中的角色 |
| --- | --- | --- | --- | --- |
| 监督学习策略网络 | SL policy network $p_\sigma$ | 专家棋谱监督学习 | 预测专家在状态 $s$ 下选择行动 $a$ 的概率 | 为树节点提供 prior probability $P(s,a)$ |
| 强化学习策略网络 | RL policy network $p_\rho$ | Self-play + policy gradient | 直接提高最终比赛胜率；生成更强的自我博弈状态分布 | 主要承担训练链路作用，不作为最终搜索中的主要 prior |
| 快速推演策略 | Rollout policy $p_\pi$ | 专家数据监督拟合 | 以极低延迟从叶节点模拟至终局 | 提供 rollout outcome $z_L$ |
| 价值网络 | Value network $v_\theta$ | 自我博弈状态—终局结果回归 | 直接估计状态的长期胜负价值 | 提供 leaf evaluation $v_\theta(s_L)$ |

**技术校正：**快速推演策略 $p_\pi$ 不是“较小的深度神经网络”。原始论文明确将其描述为基于局部模式特征的 _linear softmax policy_。其专家落子预测准确率较低，但单步选择仅约 $2\,\mu s$，而深度策略网络一次行动选择约需 $3\,ms$。该设计体现的是搜索系统中的准确率—延迟折衷。

## 5\. 棋局表示与监督学习策略网络

### 5.1 多通道棋盘状态表示

AlphaGo 将十九路围棋棋盘视为具有空间局部结构的二维数据，并以多个 $19\times19$ 特征平面表示状态。策略网络输入包含棋子颜色、落子历史、棋链气数（liberties）、提子规模（capture size）、自紧气（self-atari）、落子后的气、征子（ladder）状态以及合法/合理落子等信息。完整 SL policy network 使用 48 个输入特征平面。因此，2016 年 AlphaGo 并非完全从原始黑白棋盘“无先验”学习，而是仍保留了相当程度的人工围棋特征工程。

这种表示方式的目的不是把人工规则直接写成最终评价函数，而是把有助于卷积网络识别局部结构的信息组织成标准张量，使网络能够通过层级卷积学习高阶棋形模式。后来的 AlphaGo Zero 才显著减少这类人工领域特征，仅依赖棋盘状态及其历史进行自我学习。

### 5.2 策略网络目标

监督学习策略网络 $p_\sigma(a\mid s)$ 输出在当前状态 $s$ 下各合法落子 $a$ 的概率分布。训练数据由专家实际走子构成，优化目标是提高真实专家行动的对数似然：

式（2）监督策略学习目标

$

          \Delta \sigma \propto \frac{\partial \log p_\sigma(a\mid s)}{\partial \sigma}
          
$

因此，策略网络输出首先是**专家行动概率模型**，而不是数学意义上的“落子质量函数”。高概率表示该行动更符合训练数据中的专家选择规律；进入 MCTS 后，它被转换为搜索边的 prior $P(s,a)$，由搜索统计进一步确认或修正。

### 5.3 数据规模与网络结构

原始论文使用来自 KGS Go Server 的约 16 万盘高水平对局，形成约 3000 万个训练状态；棋手等级为 KGS 6–9 dan。这里的 KGS 等级不能直接等同于职业段位。网络主体为 13 层深度卷积结构：第一层使用较大的 $5\times5$ 卷积获取较宽局部感受野，后续主要使用 $3\times3$ 卷积和 rectifier non-linearity，最后产生棋盘行动概率分布。比赛版本使用每层 192 个卷积 filters。

![策略网络抽象结构图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/2f6ad82068.svg)

**图 2　监督策略网络的抽象结构。** 图中省略了具体层数和通道宽度，只强调从多平面棋局表示到行动概率分布的计算路径。根据 Silver et al. (2016) 的结构描述重新绘制。

### 5.4 预测准确率及其搜索意义

原论文报告：使用完整输入特征时，SL policy network 在独立测试集上的专家行动预测准确率达到 57.0%；只使用原始棋盘位置与落子历史时约为 55.7%；当时其他研究工作报告的最高结果约为 44.4%。快速 rollout policy 的准确率为 24.2%。这些指标不能直接等同于实际棋力，但论文实验显示，策略预测准确率的小幅提高会显著提高 AlphaGo 在 MCTS 中的对局强度，说明高质量 prior 能有效提高单位搜索计算量的价值。

![策略模型专家落子预测准确率比较图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/e60f647ffa.svg)

**图 3　专家落子预测准确率比较。** 该指标反映监督预测能力，不应直接解释为胜率；其意义在于提高 MCTS prior 的信息质量。数据依据 Silver et al. (2016) 主文 Figure 1/2 附近报告值重新绘制。

## 6\. 从模仿专家到直接优化胜率：RL Policy Network

监督学习的目标是模仿人类行动，但“预测人类会下什么”并不等价于“选择最能提高最终胜率的行动”。因此 AlphaGo 以监督策略网络参数作为初始值，进一步训练 RL policy network $p_\rho$。其结构与 SL policy network 基本相同，但训练信号改为完整对局的最终胜负结果。

自我博弈并不是简单地让当前模型永远与自身完全相同的副本对弈。论文从历史策略版本池中随机抽取对手，从而减弱模型只针对当前单一对手过拟合的风险。对非终局时刻奖励设为零，终局结果记为 $z_t\in\{-1,+1\}$，参数通过 policy gradient 沿提高期望比赛结果的方向更新：

式（3）强化学习策略更新的核心形式

$

          \Delta\rho \propto z_t\,\nabla_\rho \log p_\rho(a_t\mid s_t)
          
$

训练后的 RL policy 在不使用搜索的情况下即明显强于 SL policy：原论文报告二者直接对弈时，RL policy 的胜率超过 80%；面对执行约十万次 simulations/步的开源围棋程序 Pachi，RL policy 即使不执行 look-ahead search 也取得约 85% 胜率。这一结果说明深度策略本身已具备高水平的模式决策能力。

**关键事实：**最终 AlphaGo 搜索使用 SL policy $p_\sigma$ 作为 prior，而不是直接使用对局更强的 $p_\rho$。原论文解释为：SL policy 学到的是更为多样的 promising moves，适合作为搜索的候选先验；RL policy 则更倾向将概率集中到其认为的单一最佳行动。对 MCTS 而言，“单独下棋更强”与“更适合作为搜索先验”是两个不同目标。

## 7\. 价值网络：用函数逼近替代大量终局模拟

### 7.1 状态价值定义

Value Network $v_\theta(s)$ 的目标是预测从当前状态出发、后续双方按照较强策略继续行动时的期望比赛结果。可以写为：

式（4）给定策略下的状态价值

$

          v^p(s)=\mathbb{E}\!\left[z\mid s_t=s,\;a_{t:T}\sim p\right]
          
$

其中 $z$ 为终局胜负标签，$p$ 表示后续策略。AlphaGo 使用强化学习策略 $p_\rho$ 产生自我博弈并训练 $v_\theta$，使其逼近强策略诱导的状态价值。与策略网络输出多个行动概率不同，价值网络只输出一个标量。

### 7.2 监督回归目标与样本相关性问题

每个训练样本由中间状态 $s$ 与该盘自我博弈最终结果 $z$ 构成，价值网络最小化均方误差：

式（5）价值网络回归损失

$

          L(\theta)=\left(z-v_\theta(s)\right)^2
          
$

如果直接把同一盘完整对局中的大量连续状态全部作为独立训练样本，则相邻状态高度相关，而且整盘状态共享同一个终局标签。论文报告，这种朴素数据构造会产生明显过拟合：训练 MSE 约为 0.19，而测试 MSE 约为 0.37。为降低样本相关性，研究者生成约 3000 万个独立 self-play positions，并使不同训练状态尽可能来自不同对局。重新训练后，训练和测试 MSE 分别约为 0.226 与 0.234，差距显著缩小。

![价值网络数据构造对过拟合影响图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/7d731baec7.svg)

**图 4　样本相关性对价值网络泛化的影响。** 将一盘棋中的大量相邻状态同时训练会造成明显 train–test gap；按不同自我博弈构造独立状态后，训练与测试误差趋于一致。数据依据 Silver et al. (2016) 报告值重新绘制。

原论文还指出，一次价值网络前向评价可以接近高质量 Monte Carlo rollouts 的预测效果，但计算量低约 15,000 倍。其意义不是证明 value network 可以无条件替代 rollout，而是说明大量离线自我博弈所学习到的统计知识能够被压缩进固定成本的函数逼近器。

## 8\. 神经网络与 Monte Carlo Tree Search 的融合

AlphaGo 的实际决策核心是 Asynchronous Policy and Value MCTS（APV-MCTS）。搜索树中每条边 $(s,a)$ 保存 prior probability $P(s,a)$、访问统计和 action value。每次 simulation 依次执行 **Selection → Expansion → Evaluation → Backup** 四个阶段。不同于传统 MCTS 主要依赖浅层启发式，AlphaGo 把深度 policy/value 网络直接嵌入搜索环路。

![AlphaGo MCTS四阶段流程图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/b81c698cae.svg)

**图 5　AlphaGo MCTS 的四阶段计算循环。** 与普通流程图相比，关键差异在于 policy prior 与 value network 被直接注入 selection、expansion 和 evaluation。根据 Silver et al. (2016) Figure 3 与 Methods 重新绘制。

### 8.1 Selection：策略先验引导的探索—利用平衡

在树内搜索阶段，AlphaGo 从根节点开始反复选择使 action value 与探索奖励之和最大的行动：

式（6）树内行动选择

$

          a_t=\arg\max_a\left(Q(s_t,a)+u(s_t,a)\right)
          
$

主文用 $u(s,a)\propto P(s,a)/(1+N(s,a))$ 表达其核心关系：探索奖励与策略网络先验 $P(s,a)$ 正相关，并随该行动被反复访问而衰减。Methods 中的异步 APV-MCTS 使用 PUCT 变体，在 prior、父节点累计搜索量和本边访问次数之间建立进一步的缩放关系。其本质仍然是：高 prior、低访问次数的行动在早期获得更高探索优先级；随着搜索证据增加，$Q(s,a)$ 的经验价值逐渐占主导。

**概念澄清：**策略网络并非简单“砍掉”低概率分支。更精确的说法是，它改变搜索预算的分配密度。低 prior 的合法行动仍可被探索，而高 prior 行动会更早、更频繁获得计算资源。这保留了 MCTS 根据真实搜索结果纠正神经网络先验的能力。

### 8.2 Expansion：异步深度网络评价

当搜索抵达叶节点并满足展开条件时，新状态被加入树。深度策略网络的推理速度远慢于浅层 tree policy，因此 AlphaGo 采用异步 GPU evaluation：节点可以先用快速 placeholder prior 参与搜索，随后由 GPU 计算的 SL policy 输出替换其先验概率。论文正式版本还使用访问阈值决定何时真正扩展后继状态。这种实现说明，AlphaGo 的搜索算法从一开始就与硬件延迟和并行吞吐量共同设计。

### 8.3 Evaluation：Value 与 Rollout 的互补

叶节点 $s_L$ 同时使用两种估值器。Value Network 直接输出 $v_\theta(s_L)$；Rollout policy 则继续快速行动至终局，得到 $z_L$。主文将二者组合为：

式（7）叶节点混合估值

$

          V(s_L)=(1-\lambda)v_\theta(s_L)+\lambda z_L
          
$

论文实验表明两类估值具有互补性：value network 计算稳定、成本固定，但可能产生模型偏差；rollout 按真实游戏规则运行至终局，不需要提前截断，但单次结果方差较高并依赖 rollout policy 质量。正式系统采用二者混合，而不是仅依赖其中之一。

### 8.4 Backup 与最终行动

叶节点估值沿本次 simulation 路径向根节点传播，更新访问次数和平均 action value。若用 $N(s,a)$ 表示边访问次数、$V(s_L^i)$ 表示第 $i$ 次经过该边的 simulation 所得到的叶节点价值，则主文给出：

式（8）访问次数与平均行动价值

$

          N(s,a)=\sum_{i=1}^{n}\mathbf{1}(s,a,i), \qquad
          Q(s,a)=\frac{1}{N(s,a)}\sum_{i=1}^{n}\mathbf{1}(s,a,i)V(s_L^i)
          
$

达到时间或 simulation budget 后，AlphaGo 最终选择**根节点访问次数最多的行动**，而不是直接选择 policy probability 最大或瞬时 $Q$ 值最大的行动。访问次数是搜索全过程中 prior、探索、价值和 rollout 信息共同作用后的统计结果，因此可以视为 MCTS 对原始神经网络预测进行在线重估后的决策。

## 9\. 工程实现：异步搜索与异构计算

AlphaGo 的性能不仅来自算法结构，也依赖对神经网络延迟和搜索吞吐量的工程处理。深层 policy/value 网络提供高质量估值，但 GPU 前向传播的延迟显著高于简单线性 rollout；另一方面，MCTS 需要执行大量 simulation，适合 CPU 高并发。因此最终系统采用 CPU 与 GPU 分工：CPU 执行树搜索和高速 rollout，GPU 负责批量 policy/value network inference，并通过异步队列把网络结果返回搜索线程。

论文报告的最终单机版本使用 40 个 search threads、48 CPUs 和 8 GPUs；分布式版本扩展到 40 个 search threads、1,202 CPUs 和 176 GPUs。这里的硬件数字是 2016 年论文中具体实验配置，不是 AlphaGo 算法定义本身。它们说明当时达到顶尖职业棋力既依赖模型与搜索方法，也依赖大规模并行计算。

| 配置 | Search Threads | CPU | GPU | 主要作用 |
| --- | --- | --- | --- | --- |
| 最终单机版本 | 40 | 48 | 8 | 多线程树搜索 + GPU 并行 policy/value inference |
| 分布式版本 | 40 | 1,202 | 176 | 多机并行 rollout 与异步深度网络评价，提高搜索规模 |

为了减少并发搜索线程反复进入同一路径，APV-MCTS 还引入 virtual loss。某条边被一个线程临时占用后，会对其统计值施加暂时性惩罚，使其他线程更倾向选择不同分支；待该线程 simulation 完成后再撤销虚拟损失并写入真实结果。这是典型的并行 MCTS 工程机制，其目标是在不使用全局锁的情况下提高并行搜索多样性。

## 10\. 实验设计与结果

### 10.1 策略网络与无搜索棋力

原论文首先分别评价策略模型本身。SL policy network 在专家行动预测上取得 57.0% 的测试准确率；进一步通过 self-play 训练的 RL policy 与 SL policy 直接对弈时胜率超过 80%。更重要的是，RL policy 在完全不执行搜索的情况下，对执行约十万次 simulations/步的 Pachi 取得约 85% 胜率。这一实验说明：深度策略模型已经能够把大量专家模式与自我博弈经验压缩为高质量的即时行动分布。

### 10.2 搜索组件消融

AlphaGo 的实验并未只给出最终比赛结果，而是比较了 policy network、value network 和 rollouts 的不同组合。结果显示，单独使用 policy prior、单独使用 value 或 rollout 都可以提升系统性能；而将 value network 与 rollouts 组合后表现最佳。这一点对理解 AlphaGo 非常重要：2016 年系统的突破并非由某一个“神奇网络”独立产生，而是多个估计器通过 MCTS 形成系统级协同。

### 10.3 程序间锦标赛与人类比赛

原始 _Nature_ 论文报告，AlphaGo 在与其他围棋程序的测试中取得 99.8% 总体胜率；2015 年 10 月在正式五番棋中以 5∶0 战胜欧洲冠军樊麾（Fan Hui），这是首次有计算机程序在完整十九路棋盘、无让子的正式比赛条件下战胜职业围棋棋手。2016 年 3 月，AlphaGo 又以 4∶1 战胜李世石（Lee Sedol）。DeepMind 官方将后者视为 AlphaGo 发展中的关键里程碑。

![AlphaGo关键实验和比赛结果时间线](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/8f9ea90826.svg)

**图 6　AlphaGo 的关键公开节点。** 图中用于展示技术发展顺序，不代表统一实验条件下的横向性能曲线。比赛结果依据 Nature 2016、Google DeepMind 官方 AlphaGo 页面及 Nature 2017。

如何解释实验结果

“99.8% 对其他程序胜率”“Fan Hui 5–0”和“Lee Sedol 4–1”来自不同对手、不同时间和不同实验/比赛条件，不能把三组数字当作同一统计总体直接比较。它们共同支持的结论是：Policy/Value + MCTS 体系将计算机围棋从强业余程序推进到职业顶级水平，但不能由这些比赛数字单独推导算法对任意对手的普遍胜率。

## 11\. 讨论：AlphaGo 方法的意义与局限

### 11.1 方法论意义：Learning + Planning

AlphaGo 最重要的可迁移思想是把**离线学习**与**在线规划**建立明确接口。策略网络回答“哪些行动应优先投入搜索资源”，价值网络回答“当前叶节点的长期结果大致如何”，树搜索则回答“在当前具体局面下，这些模型判断经过真实前瞻后应如何修正”。这种结构避免了两个极端：一方面，不必完全依赖人工启发函数；另一方面，也没有把所有决策责任交给单次神经网络前向传播。

式（9）AlphaGo 的方法论抽象

$

          \boxed{\text{Learned Policy}+\text{Learned Value}+\text{Online Tree Search}}
          
$

### 11.2 原始 AlphaGo 的局限

从后续 AlphaGo Zero 的视角观察，原始 AlphaGo 仍然具有明显的系统复杂性。首先，它依赖人类高手棋谱进行 supervised learning；其次，输入包含大量人工设计的围棋特征；再次，policy、value 和 rollout 由多个不同模型承担，并需要复杂的异步搜索基础设施。2016 年系统达到顶级水平还使用了大量 CPU/GPU 计算资源，因此它并非一个轻量、通用的“只知道规则即可学习”的算法。

此外，value network 与 rollout 都是近似估值器：前者存在函数逼近偏差，后者存在较高采样方差；MCTS 虽然能够缓解两类误差，但并不提供有限计算条件下的全局最优保证。AlphaGo 的成功应理解为统计学习、搜索控制和大规模工程优化共同作用的结果，而不是形式意义上的完全求解围棋。

## 12\. 技术演进与展望：从 AlphaGo 到 AlphaGo Zero 与 AlphaZero

2017 年 AlphaGo Zero 对原始体系进行了根本性简化。它不再使用人类棋谱作为监督数据，只给定围棋规则并从随机策略开始自我博弈；policy 与 value 被合并到同一个 residual neural network；同时取消原始 AlphaGo 的快速 Monte Carlo rollout，由网络直接为 MCTS 同时输出 action priors 与 state value。新的训练环路形成闭环：当前网络引导 MCTS，MCTS 产生更强的 self-play actions 与终局结果，新的自我博弈数据再反向更新网络。

Nature 2017 报告 AlphaGo Zero 在三天训练后以 100∶0 战胜此前公开、曾击败李世石的 AlphaGo 版本。其重要性不仅是棋力更强，而在于证明专家数据、复杂手工棋形和独立 rollout policy 并不是实现超人围棋的必要条件。随后 AlphaZero 将这一思路推广到 chess、shogi 与 Go，形成更一般的 self-play reinforcement learning + neural MCTS 框架。

![AlphaGo到AlphaGo Zero和AlphaZero演化图](/content-assets/paper-go/paper-go-alphago-深度策略学习-价值评估与蒙特卡洛树搜索的统一框架/c810a14453.svg)

**图 7　从 AlphaGo 到 AlphaGo Zero / AlphaZero 的技术演进。** 核心方向是减少专家数据、人工特征和独立组件，并把 policy/value/self-play/MCTS 统一为更加通用的闭环。根据 Nature 2016、Nature 2017 与 AlphaZero 原始论文重新绘制。

从更一般的人工智能视角，AlphaGo 系列展示了一个重要范式：当环境模型可用于精确模拟未来状态时，可以让神经网络负责近似难以解析求解的 policy/value，并让搜索负责在具体实例上进行有限预算的在线推理。后续 MuZero 等方法进一步尝试在未知环境转移模型时学习可用于规划的潜在动力学，因此 AlphaGo 的影响并不限于围棋本身。

## 13\. 结论

AlphaGo 解决的并不是一个单纯的“棋谱模仿”问题，也不是把传统搜索简单替换为深度神经网络。其核心在于建立 **Policy–Value–Search** 三者之间的协同关系：SL policy network 从专家棋谱中获取高质量行动先验；RL policy network 通过自我博弈把目标从模仿人类转变为直接优化获胜概率；value network 用大规模去相关自我博弈数据近似长期状态价值；快速 rollout policy 以极低延迟补充终局模拟信息；APV-MCTS 则在运行时对所有先验与估值进行前瞻校验，并用访问统计形成最终行动决策。

从计算结构上看，Policy Network 主要降低有效搜索宽度，Value Network 主要降低对深度完整模拟的依赖，而 MCTS 则负责在有限预算下平衡探索与利用、修正模型误差并利用真实游戏规则完成在线规划。AlphaGo 的研究价值因此不应局限于“机器战胜职业棋手”的历史事件，其更重要的贡献是证明：对于巨大组合搜索空间，可以通过**学习得到的先验与价值函数对搜索进行结构化引导**，再利用搜索把近似模型转化为可靠决策。这一思想随后经 AlphaGo Zero 与 AlphaZero 被进一步抽象和推广，成为现代基于自我博弈的深度强化学习与规划方法的重要基础。

## 附录 A　核心技术术语

| 中文术语 | 英文原名 | 缩写/记号 | 本文中的严格含义 |
| --- | --- | --- | --- |
| 蒙特卡洛树搜索 | Monte Carlo Tree Search | MCTS | 通过模拟、树扩展与统计回传进行在线规划的搜索框架 |
| 监督学习策略网络 | Supervised Learning Policy Network | SL policy, $p_\sigma$ | 由专家棋谱训练，为 MCTS 提供行动先验 |
| 强化学习策略网络 | Reinforcement Learning Policy Network | RL policy, $p_\rho$ | 通过 self-play 和 policy gradient 直接优化比赛结果 |
| 快速推演策略 | Rollout Policy | $p_\pi$ | 低延迟 linear softmax policy，用于快速模拟至终局 |
| 价值网络 | Value Network | $v_\theta$ | 从棋局直接预测长期期望胜负结果 |
| 自我博弈 | Self-play | — | 模型与自身或历史版本对弈，以产生强化学习经验和价值训练数据 |
| 策略梯度 | Policy Gradient | — | 直接对参数化策略的期望回报进行梯度优化 |
| 先验概率 | Prior Probability | $P(s,a)$ | 由策略网络提供的候选行动搜索先验，不等同于最终胜率 |
| 行动价值 | Action Value | $Q(s,a)$ | 搜索过程中由 simulation 结果形成的经验价值统计 |
| 虚拟损失 | Virtual Loss | — | 并行 MCTS 中用于避免多个线程重复搜索同一路径的暂时性统计惩罚 |

## 参考文献

1.  Silver, D., Huang, A., Maddison, C. J., et al. Mastering the Game of Go with Deep Neural Networks and Tree Search. _Nature_, 529, 484–489, 2016. DOI: 10.1038/nature16961. [Nature](https://www.nature.com/articles/nature16961).
2.  Google DeepMind. AlphaGo. Official Research Page. [Google DeepMind](https://deepmind.google/research/alphago/).
3.  Silver, D., Schrittwieser, J., Simonyan, K., et al. Mastering the Game of Go without Human Knowledge. _Nature_, 550, 354–359, 2017. DOI: 10.1038/nature24270. [Nature](https://www.nature.com/articles/nature24270).
4.  Silver, D., Hubert, T., Schrittwieser, J., et al. Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm. arXiv:1712.01815, 2017. [arXiv](https://arxiv.org/abs/1712.01815).
5.  课程 ASR：《计算机是如何学会下棋的》第五讲（AlphaGo 第一部分）。本文使用该 ASR 确定课程知识主线，并依据上述英文一手资料进行事实核查、技术修正与扩充。

**资料与写作说明：**本文不是对课程录音的逐句转写，而是按照“ASR 核心知识提取 → 英文一手资料核验与扩充 → 论文式重构”的流程生成。正文中的结构图、流程图和统计图均为依据公开论文数据重新绘制的原创示意图，不复制 Nature 原论文图像。数学公式使用 MathJax 3 渲染；页面编码为 UTF-8，并配置中文衬线字体回退，以降低不同操作系统中的乱码风险。
