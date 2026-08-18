> **一句话结论**：模型参数量只告诉我们权重文件有多大；训练系统还必须同时管理梯度、优化器状态、反向传播所需的激活值、通信缓冲区和临时工作区。因此，“训练资源约为模型参数存储规模六倍”只能作为快速筛查的 **heuristic（启发式）**，不能当作与精度、优化器和框架实现无关的定律。

## 摘要

大语言模型（Large Language Model，LLM）的规模从早期的百万级、亿级参数扩展到数百亿乃至数千亿参数。Transformer 的并行计算结构、更多训练数据和更强的硬件共同推动了能力提升，但也把训练变成了存储、计算与通信协同的问题。

推理通常可以从权重开始估算；训练则是一个持续更新的动态优化过程。以常见的 BF16/FP16 + AdamW 混合精度账本为例，每个参数可能对应低精度权重 2 B、梯度 2 B、FP32 主权重 4 B、AdamW 一阶矩 4 B 和二阶矩 4 B，合计约 **16 B/parameter**。这只是持久训练状态的一个常见基线，不包括 activation、通信 buffer、临时 workspace、内存碎片或安全余量（safety margin）。

本文保留原始 DOCX 的八章论点，并将其整理为可复核的公式、表格和文字流程。重点回答四个问题：

1.  推理和训练到底分别保存哪些状态？
2.  AdamW 为什么会产生与模型同规模的“隐形状态”？
3.  激活值、序列长度和 Attention 的 IO 如何制造峰值显存？
4.  ZeRO 与 PyTorch FSDP 如何把单卡复制问题转化为分片与通信问题？

## 关键数字与先决条件

| 数字或关系 | 含义 | 边界 |
| --- | --- | --- |
| `2 B/parameter` | BF16 或 FP16 权重的常用近似 | 仅计算权重，不含 KV cache、workspace 或运行时保留区 |
| `16 B/parameter` | 一种 BF16/FP16 + AdamW 混合精度持久状态基线：`2 + 2 + 4 + 4 + 4` | 不是 AdamW 的唯一实现；精度、主权重策略、分片和 offload 都会改变它 |
| `70B × 2 B ≈ 140 GB` | 70B 参数模型的 BF16 权重数量级 | 采用十进制 GB；GPU 工具常显示 GiB |
| `70B × 16 B ≈ 1,120 GB` | 同一模型的上述持久状态基线 | 尚未计入 activation、通信、临时 tensor 和安全余量 |
| `6×` | 快速资源筛查时常见的经验说法 | **heuristic，不是常数**；在上述明确账本下，`16/2 = 8×`，恰好说明不能机械套用六倍 |
| `O(S²)` | 标准 Attention 物化相关矩阵随序列长度 `S` 的直觉规模 | FlashAttention 等 kernel 可以避免显式物化完整矩阵，但不会消除全部训练显存 |

## 证据标记与范围

本文在论述中使用以下标记来避免把估算写成事实：

| 标记 | 用法 |
| --- | --- |
| **DOCX 原文** | 来自 `docs/research/LLM_training_memory_source.md` 的原始八章正文转录；其原始文件名为 `LLM_training_memory_whitepaper_final_v3.docx`。 |
| **外部验证** | 由论文、PyTorch/DeepSpeed 官方文档或工程指南支持的概念与 API 行为；链接集中列在文末。 |
| **工程估算** | 本知识库为教学和容量筛查补充的字节账本、公式、场景表和解释，所有假设都显式写出。 |
| **未知/限制** | 原始材料和公开资料无法确定、必须通过具体配置或 profiler 验证的内容。 |

原始 DOCX 通过读取 `word/document.xml` 的段落与样式进行转录；研究记录说明文档未包含 `word/media/` 图片资源。本文不依赖交互估算器或 SVG 图表，所有可读结论都以公式、表格和文字流程表达。

## 1\. 研究背景：参数规模是起点，不是训练成本答案

**DOCX 原文。** Transformer 提出后，凭借并行化计算和序列建模能力，逐渐成为基础模型的核心架构。随着数据规模、计算资源和模型结构改进，扩大参数量通常能带来能力收益，因此参数规模成为最直观的模型指标。

但参数量不是训练成本的完整描述。一次训练迭代包含前向计算、损失计算、反向传播和参数更新；训练会重复数百万乃至数十亿次。模型文件是静态参数集合，而训练系统维护的是不断变化的优化过程：当前参数、梯度历史、优化器统计量和反向传播依赖必须在适当时刻共存。

这造成了一个常见误区：一个模型可能在推理环境中只需要几十 GB 或几百 GB 显存，却在训练环境中需要数倍甚至更多资源。因此，“权重能否放进一张 GPU”不能直接回答“模型能否训练”。规模增长会同时放大：

-   **存储压力**：权重、梯度、主权重、moment 和激活张量占用更多内存；
-   **计算压力**：每一层都要完成前向和反向计算，检查点策略还可能增加重算；
-   **通信压力**：多 GPU 需要同步梯度或聚合分片参数；
-   **运行时压力**：allocator、通信 bucket、临时 tensor、CUDA workspace 和 checkpoint 都会产生额外峰值。

### 从“模型多大”改问“哪些状态必须存在”

规划训练系统时，可以先问四个问题：

1.  任务是推理、微调还是从头训练？
2.  每个状态使用什么 dtype，是否保留 FP32 主副本？
3.  activation 的峰值由多少层、hidden size、micro-batch 和 sequence length 决定？
4.  状态是在每个 rank 复制，还是由 ZeRO/FSDP 分片并在计算时临时重组？

这组问题比把参数量乘以一个未经说明的倍数更容易审计，也更容易与 profiler 的结果对照。

## 2\. 训练状态账本：从每个参数的字节开始

### 2.1 符号与内存分类

设模型有 `N` 个参数。为避免把不同来源的数字混在一起，使用下列符号：

| 符号 | 含义 |
| --- | --- |
| `N` | 参数数量；`70B` 表示约 `70 × 10⁹` 个参数 |
| `b_w` | 权重每参数字节数；BF16/FP16 常取 `2` |
| `b_g` | 梯度每参数字节数；常见为 `2–4` |
| `b_master` | FP32 主权重每参数字节数；常取 `4`，但并非所有实现都保留独立副本 |
| `b_m`, `b_v` | AdamW 一阶矩 `m` 与二阶矩 `v` 的每参数字节数；常见 FP32 各为 `4` |
| `B` | micro-batch 或 batch 相关维度 |
| `S` | sequence length，即每个样本的 token 数 |
| `L` | Transformer 层数 |
| `D` | hidden size |
| `n_h` | attention head 数 |
| `W` | world size，即参与分布式训练的 rank 数 |

把状态分成两类更有用：

-   **持久状态（persistent state）**：权重、梯度、主权重和 optimizer states；在一次或多次更新之间持续存在。
-   **动态状态（dynamic/temporary state）**：激活值、通信 bucket、完整参数分片 FSDP 或 ZeRO-3 all-gather 产生的临时参数视图、CUDA workspace、allocator 保留区等；峰值随 batch、序列长度和实现策略变化。

### 2.2 推理：权重只是第一项

BF16 与 FP16 都通常按 2 bytes/parameter 估算权重文件：

Mweights≈N×bwM\_{weights} \\approx N \\times b\_w

这不是完整的推理容量模型。服务运行时还可能需要 KV cache、batch padding、CUDA workspace、allocator 保留区和框架开销。长上下文或高并发下，KV cache 甚至可能超过权重成为主导项。

### 2.3 训练：持久状态加动态峰值

一个适合容量筛查的持久状态公式是：

Mpersistent≈N×(bw+bg+bmaster+bm+bv)M\_{persistent} \\approx N \\times (b\_w + b\_g + b\_{master} + b\_m + b\_v)

而训练峰值应写成：

Mpeak\=Mpersistent+Mactivation+Mtemp+McommM\_{peak} = M\_{persistent} + M\_{activation} + M\_{temp} + M\_{comm}

这两个式子是工程模型，不是某个框架的精确 profiler 结果。它们的作用是提醒规划者不要漏掉状态；每一项的实际布局必须结合框架、dtype、optimizer、并行方式和运行时行为核对。

在常见混合精度基线下，账本可以展开为：

| 状态 | 常见格式 | 近似字节数（B/parameter） | 作用 |
| --- | --- | --: | --- |
| 模型权重 | BF16 / FP16 | 2 | 前向计算与参数表示 |
| 梯度 | BF16 / FP16 或 FP32 | 2–4 | 反向传播输出，等待归约和更新 |
| FP32 主权重 | FP32 | 4 | 以更高精度执行参数更新的常见做法 |
| 一阶矩 `m` | FP32 | 4 | 历史梯度方向的移动平均 |
| 二阶矩 `v` | FP32 | 4 | 梯度平方尺度的移动平均 |
| **合计（示例）** | — | **16** | `2 + 2 + 4 + 4 + 4`，不含 activation 等动态状态 |

> **工程估算边界。** `16 B/parameter` 是一个可解释的混合精度基线，不是协议或定律。8-bit optimizer、不同梯度格式、不保留独立 master weights、状态分片或 CPU/NVMe offload 都会改变单个 rank 的持有量；offload 通常改变位置，不会凭空消除整个作业的状态。

### 2.4 六倍经验与显式账本的关系

“训练资源约为模型参数存储规模六倍”适合在信息不足时做第一次数量级筛查。例如，70B BF16 权重约 140 GB，按 6× 粗略得到 840 GB。但这个数不是从所有训练张量唯一推导出的比例。

如果明确采用上表的 `16 B/parameter` 基线，那么持久状态相对于 2 B/parameter 权重是 `16 ÷ 2 = 8×`，而不是 6×。这并不意味着 8× 是新的普适常数；它只说明：**倍数取决于账本假设**，而且 activation、通信、临时工作区和安全余量还要另算。六倍应始终标注为 heuristic，不能用来承诺某型号 GPU 的容量或集群规模。

### 2.5 单位：GB 与 GiB

本文的示例使用十进制单位，便于参数量级沟通：

-   `1 GB = 10⁹ bytes`；
-   `1 GiB = 2³⁰ bytes`；
-   `140 GB` 约等于 `130.4 GiB`；
-   `1,120 GB` 约等于 `1,043 GiB`。

GPU 监控工具常以 GiB 显示。容量规划必须统一单位，并为峰值和安全余量留出空间。

## 3\. AdamW：为什么优化器会制造一份“隐形模型”

**DOCX 原文。** AdamW 是大型语言模型训练常用的优化器。它不只使用当前梯度，而是为每个参数维护一阶矩和二阶矩：前者记录梯度的平均方向，后者记录梯度平方的平均尺度，从而进行自适应的更新。两个统计量都与参数同规模，所以优化器状态本身可以达到数百 GB。

### 3.1 更新方程

下面的方程用于说明状态从哪里来。它是概念性写法；实际实现可能使用 fused optimizer、参数分组、不同 dtype 或分片布局。

mtamp;\=β1mt−1+(1−β1)gt vtamp;\=β2vt−1+(1−β2)gt<sup\>2 m^tamp;\=mt1−β1</sup\>t,v^t\=vt1−β2t θt+1amp;\=θt−ηm^tv^t+ϵ−ηλθt\\begin{aligned} m\_t &amp;= \\beta\_1 m\_{t-1} + (1-\\beta\_1)g\_t \\ v\_t &amp;= \\beta\_2 v\_{t-1} + (1-\\beta\_2)g\_t<sup>2 \\ \\hat m\_t &amp;= \\frac{m\_t}{1-\\beta\_1</sup>t}, \\qquad \\hat v\_t = \\frac{v\_t}{1-\\beta\_2^t} \\ \\theta\_{t+1} &amp;= \\theta\_t - \\eta\\frac{\\hat m\_t}{\\sqrt{\\hat v\_t}+\\epsilon} - \\eta\\lambda\\theta\_t \\end{aligned}

其中：

-   `g_t` 是当前梯度；
-   `m_t` 是一阶矩，`v_t` 是二阶矩；
-   `β₁`、`β₂` 控制历史统计量的衰减；
-   `η` 是学习率，`ε` 用于数值稳定；
-   最后一项表示 AdamW 将 weight decay 与梯度更新解耦的形式。

**外部验证。** Adam 的一阶/二阶矩机制可参见 [Kingma and Ba, _Adam: A Method for Stochastic Optimization_](https://arxiv.org/abs/1412.6980)。混合精度训练的数值动机可参见 [Micikevicius et al., _Mixed Precision Training_](https://arxiv.org/abs/1710.03740)。若需要专门讨论解耦 weight decay，可进一步参阅 [Loshchilov and Hutter, _Decoupled Weight Decay Regularization_](https://arxiv.org/abs/1711.05101)。

### 3.2 为什么混合精度仍会有 FP32 状态

混合精度通常用 BF16/FP16 做部分计算和参数表示，以降低存储与带宽压力；为了减少更新过程中的舍入误差，常见实现会保留更高精度的主权重或 optimizer states。PyTorch AMP 文档中的 `autocast`、`GradScaler` 等运行时机制并不等于所有训练配置都采用同一种内存布局，尤其是 BF16 与 FP16 的数值策略可能不同。

因此不能只看到“模型用 BF16”就把所有训练状态都按 2 B/parameter 计算，也不能假定每个框架必然保留独立 FP32 master weights。精确答案要以具体 optimizer、参数 dtype、框架版本和 profiler 为准。

### 3.3 70B 工作示例：先算持久状态

对一个约 70B 参数的模型：

1.  BF16 权重：`70 × 10⁹ × 2 bytes ≈ 140 GB`；
2.  显式的 16 B/parameter 基线：`70 × 10⁹ × 16 bytes ≈ 1,120 GB`；
3.  这些 `1,120 GB` 包含权重、梯度、FP32 主权重、`m` 和 `v`，**不包含** activation、通信 buffer、临时 workspace、碎片或安全余量；
4.  仅以 6× 权重作 heuristic 筛查则是 `140 × 6 ≈ 840 GB`，它不能替代上面的状态账本。

如果使用 ZeRO/FSDP，改变的是每个 rank 保存的份额和运行时通信路径；整个训练作业仍然要表示同一组全局状态。

## 4\. 激活值与 activation checkpointing：随 batch 和序列长度变化的峰值

### 4.1 激活值为何不能按参数量线性外推

**DOCX 原文。** 激活值是前向传播产生的中间结果，例如 hidden states、attention 中间结果和前馈网络内部表示。反向传播需要这些结果计算梯度，因此训练框架必须保存一部分中间张量。Transformer 层数增加、hidden size 增大或输入序列变长时，激活值会显著增加；长上下文尤其容易带来压力。

与权重和 optimizer states 相比，activation 更像是随配置变化的动态账本。常见影响因素包括：

-   层数 `L` 与 hidden size `D`；
-   micro-batch `B`；
-   sequence length `S`；
-   attention heads 与 attention kernel 是否物化中间矩阵；
-   MLP 中间维度、残差与归一化路径；
-   gradient accumulation 的 micro-batch 设计；
-   activation checkpointing、重计算和 kernel fusion 策略。

隐藏状态类张量至少表现出 `B × S × D` 的线性形状，并在层数方向上累积；标准 Attention 的部分中间结果还可能出现 `B × n_h × S²` 的项。这里是形状和数量级直觉，不是对某个模型的完整 activation 公式。

### 4.2 前向、反向与检查点的文字流程

```text
普通路径：
输入/Embedding
    -> Attention 中间结果
    -> MLP 中间表示
    -> Residual + Norm
    -> 保存反向所需的多个中间张量
    -> Backward 使用这些张量

Checkpoint 路径：
输入/Embedding
    -> 只保留选定的边界 checkpoint
    -> 释放部分中间激活
    -> Backward 到达该段时重新执行 Forward
    -> 用额外计算换取更低的显存峰值
```

**外部验证。** 单 GPU 训练和 activation checkpointing 的显存/性能权衡可参见 [Hugging Face GPU training guide](https://huggingface.co/docs/transformers/perf_train_gpu_one)。

### 4.3 三个最直接的旋钮

| 旋钮 | 显存影响 | 代价或注意事项 |
| --- | --- | --- |
| 增大 sequence length | hidden states 线性增大；标准 Attention 相关矩阵可能按 `S²` 增长 | 长上下文可能同时受显存、带宽和计算量限制 |
| 增大 micro-batch | 单次 forward 同时存储更多 activation | 吞吐可能提升，但 per-rank 峰值也上升 |
| 减少保存的 activation | checkpointing 使峰值下降 | backward 时重算，计算时间上升；需要重新评估吞吐 |

Gradient accumulation 可以在保持有效 batch 的同时调节单次 micro-batch，但它不是免费的显存消除方案：每次前向/反向仍有自己的 activation、通信和临时峰值。

## 5\. Attention、IO 与 FlashAttention

### 5.1 标准自注意力的形状与复杂度

**DOCX 原文。** 自注意力构造 Query、Key、Value，并计算 Query 与 Key 的相关矩阵。当序列长度为 `n` 时，该矩阵的规模与 `n²` 相关，所以长上下文会造成非线性显存压力。

标准形式可写为：

Attention⁡(Q,K,V)\=softmax⁡(QKTdk)V\\operatorname{Attention}(Q,K,V) = \\operatorname{softmax}\\left(\\frac{QK^T}{\\sqrt{d\_k}}\\right)V

若单个 head 的 `Q` 形状为 `S × d`、`K^T` 为 `d × S`，那么 `QK^T` 是 `S × S`。在 batch 和多 head 情况下，物化该矩阵的直觉式内存规模为：

Mattention∝B×nh×S2×bM\_{attention} \\propto B \\times n\_h \\times S^2 \\times b

其中 `b` 是中间张量的每元素字节数。注意力计算量也随序列长度呈平方增长，但 kernel 是否显式保存 `S × S` 矩阵，会改变显存峰值的具体表现。

### 5.2 IO-aware 的核心

GPU 的峰值 FLOPs 不会自动转化为训练吞吐。数据需要在 HBM、L2、shared memory 和寄存器等层级之间移动；如果同一中间结果被反复写入和读出 HBM，kernel 可能受内存带宽和 IO 限制。

**外部验证。** [Vaswani et al., _Attention Is All You Need_](https://arxiv.org/abs/1706.03762) 奠定了 Transformer 自注意力架构；[Dao et al., _FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness_](https://arxiv.org/abs/2205.14135) 说明了通过 IO-aware tiling 组织 exact attention 的路线。

可以用以下文字图理解两条路径：

```text
标准路径：
Q (S×d) + Kᵀ (d×S)
          -> 显式物化 QKᵀ (S×S)
          -> softmax
          -> 再与 V 相乘
          -> 长序列时，中间矩阵成为显存压力点

FlashAttention 思路：
Q/K/V 分块载入
          -> tile 内计算与 online softmax
          -> 让中间结果尽量停留在更快的片上存储
          -> 避免反复读写完整的 S×S 矩阵
          -> 用计算组织换取更少的 HBM ↔ SRAM IO
```

FlashAttention 的关键不是把 Attention 换成近似算法，而是重新安排数据流和归一化过程，目标仍是 **exact attention**。它可以减少 Attention 中间存储与 HBM 访问压力，但不会让参数、梯度、optimizer states、其他 activation、通信 bucket 和框架开销消失。

> **不要过度外推。** `O(S²)` 是标准物化实现的风险提示，不是每个现代 kernel 的显存实测曲线；反过来，使用 FlashAttention 也不等于整个训练作业只剩权重显存。必须结合 kernel、序列长度、head 配置和 profiler 测量。

## 6\. 分布式训练：ZeRO 与 FSDP 如何把复制变成分片

### 6.1 传统数据并行的复制问题

当模型规模达到数百亿参数，单 GPU 往往无法保存完整训练状态。最基础的数据并行让不同 GPU 处理不同数据 batch，并同步梯度；但每个 rank 通常都复制完整的模型参数、梯度和 optimizer states。计算可以并行，状态却被无意义地复制。

ZeRO（Zero Redundancy Optimizer）和 PyTorch FSDP（Fully Sharded Data Parallel）的共同思想是分片，但不同 Stage/strategy 并不使用同一套运行时交换。下面成对出现的参数 `all-gather` / 梯度 `reduce-scatter` 路径，主要描述 ZeRO Stage 3 和完整参数分片的 FSDP。ZeRO Stage 1 只分片 optimizer states；Stage 2 进一步分片 gradients，但 parameters 仍然复制。具体梯度 collective 取决于实现和配置。

```text
完整参数分片路径（ZeRO-3 / full-shard FSDP）：
数据 batch 分到各 rank
        -> 每个 rank 持有自己的状态 shard
        -> forward/backward 需要时 all-gather 参数分片
        -> 通过 reduce-scatter 归约梯度并保留对应 shard
        -> optimizer 在本 rank 更新自己负责的状态
        -> 进入下一轮
```

这不是 ZeRO Stage 1/2 的统一流程：它们不会因为状态分片就都执行参数 all-gather；Stage 2 的梯度分片可能使用 `reduce-scatter` 或其他梯度归约 collective，需以具体配置为准。分片降低的是单卡持有量，同时引入通信、调度、预取和 overlap 复杂度。

### 6.2 ZeRO 的分片层级

**外部验证。** [Rajbhandari et al., _ZeRO: Memory Optimizations Toward Training Trillion Parameter Models_](https://arxiv.org/abs/1910.02054) 介绍了分片思路；[DeepSpeed ZeRO tutorial](https://www.deepspeed.ai/tutorials/zero/) 给出了 Stage 1/2/3 和 offload 的工程说明。

| 阶段 | 分片范围 | 每个 rank 仍可能复制 | 直觉 |
| --- | --- | --- | --- |
| ZeRO Stage 1 | optimizer states | 参数、梯度 | 先消除 AdamW 状态的复制 |
| ZeRO Stage 2 | optimizer states + gradients | 参数 | 再消除完整梯度副本 |
| ZeRO Stage 3 | parameters + gradients + optimizer states | 只在计算窗口临时聚合所需部分 | 分片完整模型状态，按需 all-gather |
| Offload（可选） | 将部分状态迁移到 CPU 或 NVMe | 取决于配置 | GPU 显存下降，但主机内存、存储和 IO 成为新约束 |

Stage 1/2/3 是逐步扩大分片范围的概念；真实实现还会受 bucket、参数分组、prefetch、重叠和 offload 策略影响。

### 6.3 FSDP 的运行时交换

**外部验证。** [PyTorch FullyShardedDataParallel documentation](https://docs.pytorch.org/docs/stable/fsdp.html) 将 FSDP 定义为 fully sharded data parallel，并描述参数、梯度和 optimizer state 的分布式管理。对于 full-shard strategy，典型运行时要点包括：

-   在 forward 或 backward 的适当时机，对参数执行 `all-gather`，形成计算所需的临时完整视图；
-   在梯度归约时执行 `reduce-scatter` 等 collective，让每个 rank 保留自己负责的梯度分片；
-   在计算窗口之外释放完整视图或重新分片；
-   optimizer state 也需要与分片布局和 checkpoint 策略一致。

其他 FSDP sharding strategy 保留的状态量不同，因此这不是所有 FSDP 配置的统一描述。

因此，“理想分片”只能给出下限：

Mrank,lower≈MpersistentWM\_{rank,lower} \\approx \\frac{M\_{persistent}}{W}

真实的 per-rank 峰值还要加上参数 all-gather 窗口、通信 bucket、临时 tensor、prefetch、allocator fragmentation 和安全余量。每张 GPU 更省不等于作业没有通信；分片降低的是冗余和局部容量压力，不是全局状态总量。

## 7\. 资源估算：用公式筛查，用 profiler 决策

本节全部属于 **工程估算**。它的正确用途是尽早发现数量级错误，例如判断单卡是否显然不足、需要多少 rank 才能容纳持久状态，以及长序列是否可能把 activation 推过上限；它不能替代真实模型配置、框架 profiler、吞吐测试或故障注入。

### 7.1 最小估算模型

给定参数量 `N`、每项 dtype 的字节数和 world size `W`，可以按以下顺序估算：

Mweightsamp;≈N×bw Mpersistentamp;≈N×(bw+bg+bmaster+bm+bv) Mrank,loweramp;≈Mpersistent/W Mpeak,rankamp;≈Mrank,lower+Mactivation,rank+Mcomm,rank amp;+Mtemp,rank+Mfragmentation+Msafety\\begin{aligned} M\_{weights} &amp;\\approx N \\times b\_w \\ M\_{persistent} &amp;\\approx N \\times (b\_w+b\_g+b\_{master}+b\_m+b\_v) \\ M\_{rank,lower} &amp;\\approx M\_{persistent}/W \\ M\_{peak,rank} &amp;\\approx M\_{rank,lower} + M\_{activation,rank} + M\_{comm,rank} \\ &amp;\\quad + M\_{temp,rank} + M\_{fragmentation} + M\_{safety} \\end{aligned}

对标准 Attention 的中间相关矩阵，可以先用下式做压力筛查：

Mattention∝B×nh×S2×bM\_{attention} \\propto B \\times n\_h \\times S^2 \\times b

该式不应被当作所有 kernel 的精确占用；FlashAttention 等实现可能通过分块避免完整物化。

### 7.2 代表性参数规模表

下表使用十进制 GB，统一假设 BF16 权重为 2 B/parameter、持久状态为 16 B/parameter；不含 activation、通信、临时工作区、碎片和安全余量。

| 参数量 | BF16 权重 | 16 B/parameter 持久状态 | 解释 |
| --: | --: | --: | --- |
| 7B | 14 GB | 112 GB | 单卡训练通常仍需分片或 offload |
| 13B | 26 GB | 208 GB | 权重可能接近某些单卡容量，但训练状态远超权重 |
| 70B | **140 GB** | **1,120 GB** | 集群、分片和通信成为一等问题 |
| 175B | 350 GB | 2,800 GB | 仅持久状态就需要多 rank 协同 |

### 7.3 70B 在不同理想分片规模下

这张表把交互估算器改写为静态、可独立阅读的下限示例。除以 `W` 只表示持久状态的理想均匀分片，不是实际 GPU 峰值。

| 参数量 | BF16 权重总量 | 持久状态总量 | `W=1` 理想状态/rank | `W=8` 理想状态/rank | `W=16` 理想状态/rank | `W=64` 理想状态/rank |
| --: | --: | --: | --: | --: | --: | --: |
| 70B | 140 GB | 1,120 GB | 1,120 GB | 140 GB | 70 GB | 17.5 GB |

例如，`W=8` 时表中的 140 GB 仍未加入 activation 和 full-shard 参数 all-gather 峰值；它不能直接解释为“8 张 140 GB GPU 就一定能训练”。真实规划还要核对每张卡的可用显存、通信拓扑、batch/sequence 配置、checkpoint 方式和安全余量。

### 7.4 估算步骤与检查清单

1.  **确定任务**：区分推理、微调和预训练；它们的状态集合不同。
2.  **列出 dtype**：分别记录权重、梯度、master weights、`m`、`v` 和 activation 的字节数。
3.  **计算持久下限**：使用 `N × (w + g + master + m + v)`，不要把六倍藏成隐式常量。
4.  **加入动态项**：根据 `B`、`S`、`L`、`D`、attention kernel 和 checkpoint 策略估算 activation。
5.  **加入分布式项**：估算理想分片，再在策略实际使用时（尤其是 ZeRO-3/full-shard FSDP）加入参数 all-gather、梯度 reduce-scatter、bucket、临时 tensor 和 offload IO。
6.  **统一单位并留余量**：区分 GB/GiB，预留 allocator fragmentation、故障恢复和运行时波动。
7.  **实测验证**：绑定具体模型配置、框架版本、GPU 型号和拓扑，用 profiler、吞吐和数值稳定性结果校正估算。

## 8\. 趋势与工程建议

**DOCX 原文。** 降低训练成本不会只靠增加 GPU 数量；更高效的优化算法、更低精度计算、更智能的状态管理、更好的并行策略和专用 AI 硬件需要共同工作。

### 8.1 可能的优化方向

| 方向 | 可能收益 | 新的约束 |
| --- | --- | --- |
| 更低精度：BF16、FP16、FP8 或更细粒度量化 | 降低存储和带宽，可能提高吞吐 | 数值范围、舍入误差、loss scaling 和收敛稳定性需要单独验证 |
| 状态管理：8-bit optimizer、分片、offload、paged state、checkpoint | 让不常用状态离开昂贵的 GPU 内存 | CPU/NVMe 容量、IO 带宽、恢复时间和实现复杂度增加 |
| 并行策略：数据、张量、流水线、序列、专家并行 | 改变内存和通信的形状，突破单卡限制 | 需要匹配模型结构、通信拓扑、负载均衡和调度 |
| 系统协同：kernel fusion、IO-aware algorithm、NVLink/网络拓扑、专用 accelerator | 减少数据搬运并提高单位硬件吞吐 | 优化通常依赖特定硬件、kernel 和软件版本 |

### 8.2 面向容量规划的建议

下一代训练系统值得优化的不是一个固定倍数，而是“每个字节产生的模型能力”。实际工作中建议按以下顺序执行：

1.  先确认哪些状态必须存在，再问需要多少 GPU；
2.  用显式字节账本替代“六倍”口诀；
3.  用 activation checkpointing 在计算时间和显存之间做有意识的交换；
4.  用 ZeRO/FSDP 减少跨 rank 的状态复制，同时把通信路径纳入预算；
5.  用 IO-aware kernel 降低 Attention 中间结果的搬运，不把局部优化外推成整机容量结论；
6.  最后用 profiler、吞吐、收敛和数值稳定性验证，而不是把启发式当作容量承诺。

## 9\. 术语表

| 术语 | 定义 |
| --- | --- |
| **BF16（Brain Floating Point 16）** | 16 位浮点格式，通常保留与 FP32 相近的指数宽度；常用于训练，以较低存储/带宽成本换取较大的动态范围。 |
| **FP16** | 16 位 IEEE 浮点格式；相比 BF16 通常具有不同的指数与尾数分配，训练时的数值策略和 scaling 要单独考虑。 |
| **Mixed precision** | 用低精度执行部分计算，同时在必要位置保留更高精度状态或累积，以平衡吞吐、显存与数值稳定性。 |
| **AdamW** | 带解耦 weight decay 的 Adam 类优化器；为每个参数维护一阶矩和二阶矩。 |
| **Master weights** | 混合精度训练中可能保留的 FP32 参数副本，用于更稳定的更新；不是所有实现都采用独立副本。 |
| **Activation** | 前向传播生成、反向传播可能需要的中间张量，包括 hidden states、attention 中间值、MLP 表示、残差和归一化路径。 |
| **Activation checkpointing** | 只保存部分中间结果，在 backward 时重算其他 forward 段，以额外计算换取较低显存峰值。 |
| **HBM** | GPU 高带宽显存；容量和带宽有限，数据在 HBM 与片上存储之间的搬运会影响 kernel 性能。 |
| **SRAM / on-chip memory** | 更靠近计算单元、容量较小但访问更快的片上存储层级，FlashAttention 会将其纳入数据流设计。 |
| **IO-aware** | 把 HBM、片上存储和数据搬运成本作为算法设计的一部分，而不只比较数学 FLOPs。 |
| **FlashAttention** | 通过 tiling、融合和 online softmax 减少 Attention 的 IO 与中间物化，同时保持 exact attention 的计算目标。 |
| **ZeRO** | DeepSpeed 的 Zero Redundancy Optimizer 思路；Stage 1/2/3 依次分片 optimizer states、gradients、parameters。 |
| **FSDP** | PyTorch 的 Fully Sharded Data Parallel；在 rank 间分片参数、梯度和 optimizer state，并在计算窗口按需通信。 |
| **Rank / world size** | rank 是一个分布式进程或设备的编号；world size `W` 是参与该分布式组的 rank 数量。 |
| **All-gather** | 集体通信操作，使各 rank 汇集分片数据。本文的参数汇集路径主要指 full-shard FSDP 与 ZeRO Stage 3；具体用法取决于分片策略。 |
| **Reduce-scatter** | 先对各 rank 的数据做归约，再把结果分发为分片。本文成对讨论的梯度路径主要指 full-shard FSDP 与 ZeRO Stage 3；其他 ZeRO stage/配置可能采用不同的 collective 组合。 |
| **Micro-batch** | 一次 forward/backward 实际处理的小批次；gradient accumulation 可以用多个 micro-batch 形成更大的有效 batch。 |
| **KV cache** | 推理时缓存历史 Key/Value 的运行时状态；长上下文和高并发下可能成为推理显存的主导项。 |
| **FLOPs** | 浮点运算次数；训练性能还受内存带宽、IO、通信、调度和 kernel 实现影响，不能只看 FLOPs。 |

## 10\. 参考文献与来源映射

### 10.1 原始材料

原始文件是 Microsoft Word 2007+（DOCX）格式；转录从 `word/document.xml` 提取段落与样式，研究记录显示其中没有 `word/media/` 图片资源。

1.  **DOCX 原文转录**：`docs/research/LLM_training_memory_source.md`，对应原始文件 `LLM_training_memory_whitepaper_final_v3.docx`。保留摘要、研究背景、参数/梯度/训练状态、AdamW、激活值、Attention、分布式训练、资源估算和未来趋势八章。
2.  **来源与事实边界记录**：`docs/research/LLM_training_memory_sources.md`。记录检索日期（2026-07-31）、外部链接、原始内容与扩展内容的区分，以及不应据此推断的未知项。

### 10.2 外部论文、官方文档与工程指南

| 来源 | 用途 | 类型 |
| --- | --- | --- |
| [Vaswani et al., _Attention Is All You Need_ (2017)](https://arxiv.org/abs/1706.03762) | Transformer 与自注意力架构 | 论文 |
| [Rajbhandari et al., _ZeRO: Memory Optimizations Toward Training Trillion Parameter Models_ (2019)](https://arxiv.org/abs/1910.02054) | 状态冗余与 ZeRO 分片思想 | 论文 |
| [DeepSpeed ZeRO tutorial](https://www.deepspeed.ai/tutorials/zero/) | Stage 1/2/3 与 offload 的工程说明 | 官方工程文档 |
| [Dao et al., _FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness_ (2022)](https://arxiv.org/abs/2205.14135) | IO-aware tiling、online softmax 与 exact attention | 论文 |
| [PyTorch Fully Sharded Data Parallel](https://docs.pytorch.org/docs/stable/fsdp.html) | FSDP 的分片与 collective 行为 | 官方 API 文档 |
| [PyTorch AMP](https://docs.pytorch.org/docs/stable/amp.html) | `autocast`、`GradScaler` 等混合精度运行时 | 官方 API 文档 |
| [Micikevicius et al., _Mixed Precision Training_ (2018)](https://arxiv.org/abs/1710.03740) | 低精度训练与数值稳定性 | 论文 |
| [Kingma and Ba, _Adam: A Method for Stochastic Optimization_ (2014)](https://arxiv.org/abs/1412.6980) | 一阶矩、二阶矩和 Adam 更新基础 | 论文 |
| [Loshchilov and Hutter, _Decoupled Weight Decay Regularization_ (2017)](https://arxiv.org/abs/1711.05101) | AdamW 的解耦 weight decay 背景 | 论文 |
| [Hugging Face GPU training guide](https://huggingface.co/docs/transformers/perf_train_gpu_one) | 单 GPU 训练显存与 activation checkpointing 实践 | 工程指南 |

### 10.3 事实边界总表

| 内容 | 本文如何处理 |
| --- | --- |
| 原文八章和主要论点 | 作为 **DOCX 原文** 保留并专业编辑，不把页面壳层内容当成原始文档事实。 |
| 字节账本、16 B/parameter、`70B/140 GB/1,120 GB`、分片下限与场景表 | 作为带显式假设的 **工程估算**；采用十进制 GB，忽略动态项的地方均已注明。 |
| Adam、混合精度、Transformer、FlashAttention、ZeRO、FSDP 与 AMP 行为 | 用对应 **外部验证** 链接补足，不声称外部资料验证了某个特定模型的峰值显存。 |
| 六倍经验 | 明确标为 **heuristic**；它不是跨精度、优化器、框架、batch、sequence length 或 GPU 拓扑的常数。 |

## 11\. 限制说明

1.  原始 DOCX 没有给出特定模型的层数、hidden size、head 数、batch、sequence length、GPU 型号、GPU 拓扑或框架版本；本文不能由参数量推导真实峰值显存。
2.  `16 B/parameter` 只是常见 BF16/FP16 + AdamW 持久状态基线。某些实现可能不保留独立 FP32 主权重，或使用 8-bit optimizer、不同梯度 dtype、fused layout、sharding 和 offload。
3.  `70B → 140 GB` 与 `70B → 1,120 GB` 是十进制数量级计算，不是 GPU 厂商容量承诺，也不包含 activation、通信 buffer、临时 workspace、allocator fragmentation 和安全余量。
4.  `6×` 只用于缺少细节时的快速筛查；它不能替代逐项账本。显式基线的 `16/2 = 8×` 也不是新的通用常数。
5.  `O(S²)` 描述标准 Attention 物化相关矩阵的风险；FlashAttention 可以通过 IO-aware tiling 减少中间物化和 HBM 访问，但具体峰值仍依赖 kernel 和配置。
6.  文中没有给出训练总 FLOPs、总成本、吞吐、收敛速度或可靠性结论；这些需要 token 数、模型结构、硬件实测和训练实验。
7.  外部文档和 API 会随版本更新；本文的来源清单按 2026-07-31 的检索记录整理，生产决策应重新核对当前版本。
8.  最终容量规划必须绑定具体模型、dtype、optimizer、框架版本、GPU 拓扑、并行配置和 profiler 结果，并为故障恢复与运行时波动保留余量。
