> 本文整理本次 session 中讨论的核心知识点，覆盖 Stable Diffusion 的训练/推理机制、RNN/LSTM/GRU 与 Transformer 的差异、中文 RNN 语言模型训练、GPT 系列演进、GPT-3 的 scaling 与 RLHF 边界，以及 DeepSeek-R1/R1-Zero 与 OpenAI o1 的关系。

---

## 1. Stable Diffusion：不是单纯 image-to-image，而是条件扩散

Stable Diffusion 的核心不是直接在像素空间生成图像，而是在 **VAE latent space** 中做扩散建模。

可以把它拆成三个模块：

```text
VAE：图像 <-> latent 的压缩与还原
Text Encoder：文本 prompt/caption -> text embedding
U-Net：在 latent 上执行条件去噪
```

### 1.1 训练阶段的真实流程

训练 Stable Diffusion 时，输入不是只有图像，还有对应的文本描述。

```text
训练样本：
(image x, caption text)

图像分支：
image x
→ VAE Encoder
→ latent z_0
→ 加高斯噪声
→ noisy latent z_t

文本分支：
caption text
→ tokenizer
→ token ids
→ text encoder
→ text embedding c

扩散分支：
z_t + timestep t + text embedding c
→ U-Net
→ 预测噪声 ε_pred
→ 和真实噪声 ε 计算 denoising loss
```

核心目标可以写成：

```text
ε_pred = U-Net(z_t, t, c)
loss = MSE(ε_pred, ε)
```

其中：

- `z_0` 是真实图像经过 VAE Encoder 得到的干净 latent；
- `z_t` 是在 `z_0` 上加噪后的 latent；
- `c` 是 caption 经过 Text Encoder 得到的文本条件；
- U-Net 学的是“在文本条件下如何把 noisy latent 拉回真实图像 latent 分布”。

所以，Stable Diffusion 的 text-to-image 训练不是普通 image-to-image。

更准确说：

```text
Stable Diffusion 训练 = 图像 latent 去噪任务 + 文本 embedding 条件控制
```

---

## 2. 为什么 latent 要加高斯噪声

给 latent 加高斯噪声的目的，不是简单“破坏图像”，而是构造一个可学习的生成路径。

前向过程：

```text
真实图像 latent 分布
→ 少量噪声
→ 中等噪声
→ 大量噪声
→ 近似标准高斯噪声
```

反向过程：

```text
随机高斯噪声
→ 去噪一步
→ 去噪一步
→ ...
→ 干净 latent
→ VAE Decoder
→ 图像
```

### 2.1 高斯噪声的收益

| 收益 | 说明 |
|---|---|
| 起点简单 | 推理时可以从标准高斯噪声采样 |
| 训练目标明确 | 直接监督模型预测加入的噪声 |
| 数学性质好 | 高斯分布有闭式加噪公式，便于训练和采样 |
| 生成任务被拆解 | 从“一步生成图像”变成“多步去噪” |
| 稳定性强 | 不需要 GAN 式判别器对抗训练 |
| 可控性强 | 可控制 noise schedule、采样步数、denoising strength |

可以把扩散建模理解为：

```text
人为设计一条从真实数据分布到标准高斯分布的路径；
训练模型学习这条路径的反方向；
生成时从高斯噪声沿反方向走回真实图像分布。
```

---

## 3. Stable Diffusion 训练、文生图推理、图生图推理的区别

### 3.1 训练流程

```text
image x
→ VAE Encoder
→ latent z_0
→ 加噪得到 z_t

caption
→ Text Encoder
→ text embedding c

z_t + t + c
→ U-Net
→ 预测噪声
→ loss
```

训练时一般不需要每一步都 VAE Decode 成图像。

---

### 3.2 text-to-image 推理

真正加载 pretrained SD 做普通文生图时，没有输入图像。

流程是：

```text
prompt
→ Text Encoder
→ text embedding

random latent noise z_T
→ U-Net 多步去噪
→ latent z_0
→ VAE Decoder
→ image x
```

所以普通文生图推理不需要：

```text
像素图像 x → VAE Encoder → latent z
```

它直接从随机 latent noise 开始。

---

### 3.3 image-to-image 推理

图生图才会用到输入图像：

```text
输入图像 x
→ VAE Encoder
→ latent z_0
→ 按 denoising strength 加噪得到 z_t
→ U-Net 从 z_t 开始去噪
→ VAE Decoder
→ 输出图像 x'
```

`denoising strength` 控制变化幅度：

```text
strength 越低：保留原图越多，变化越小
strength 越高：加噪越重，原图结构保留越少，变化越大
```

---

## 4. SD 的 Text Encoder：Transformer / Attention，不是 RNN/LSTM

Stable Diffusion 的 text encoder 不是 RNN、LSTM、GRU，而是基于 Transformer attention 的文本编码器。

不同版本大致如下：

| 模型 | Text Encoder | 结构 |
|---|---|---|
| SD 1.x / 1.5 | CLIP ViT-L/14 text encoder | Transformer encoder |
| SD 2.x | OpenCLIP text encoder | Transformer encoder |
| SDXL | OpenCLIP-ViT/G + CLIP-ViT/L | 两个 Transformer text encoders |
| SD3 / FLUX 类模型 | CLIP / T5 等组合 | Transformer encoder |

完整文本处理流程：

```text
prompt 文本
→ tokenizer
→ token ids
→ token embedding + position embedding
→ Transformer text encoder
→ text embeddings
→ U-Net cross-attention
```

注意：

```text
tokenizer 只是字符串到 token id 的映射工具；
text encoder 才是负责语义建模的神经网络。
```

---

## 5. CLIP 的文本处理也是 attention

CLIP 是图文对齐模型，通常有两个编码器：

```text
image encoder：ViT 或 ResNet
text encoder：Transformer text encoder
```

CLIP 的 text encoder 也是 Transformer attention 结构，不是 RNN/LSTM。

CLIP 文本侧流程：

```text
text
→ BPE tokenizer
→ token ids
→ token embedding + position embedding
→ Transformer text encoder
→ text embedding
```

CLIP 训练目标是图文对比学习：

```text
匹配的 image embedding 和 text embedding 更近
不匹配的 image embedding 和 text embedding 更远
```

而 Stable Diffusion 训练不是 CLIP 式图文 embedding 对齐。SD 使用 text embedding 作为条件，让 U-Net 在该文本条件下做去噪。

---

## 6. RNN、LSTM、GRU 的关系

RNN 是基础序列网络。LSTM 和 GRU 都是 RNN 的门控变体。

结构关系可以写成：

```text
RNN
├── vanilla RNN
├── LSTM
└── GRU
```

### 6.1 LSTM 是 RNN 的改进

普通 RNN 的主要问题：

```text
长序列训练时容易梯度消失 / 梯度爆炸
```

LSTM 引入：

```text
cell state
input gate
forget gate
output gate
```

目标是更好地保留长期依赖。

---

### 6.2 GRU 是 LSTM 的简化替代，而不是严格升级版

GRU 同样是门控 RNN，但结构比 LSTM 简化。

| 模型 | 状态 | 门控 | 特点 |
|---|---|---|---|
| vanilla RNN | hidden state | 无门控 | 简单，但长依赖差 |
| LSTM | cell state + hidden state | input / forget / output | 表达力强，参数更多 |
| GRU | hidden state | update / reset | 更简单，训练更快，效果常接近 LSTM |

准确表述：

```text
LSTM 是 RNN 的改进；
GRU 是受 LSTM 启发的简化门控 RNN，不是严格意义上的 LSTM 升级版。
```

---

## 7. RNN 不是 seq2seq，但可以做 seq2seq

RNN 是网络结构，seq2seq 是任务/建模范式。

```text
RNN / LSTM / GRU：序列建模网络结构
seq2seq：输入序列 -> 输出序列的建模方式
```

RNN 可用于多种任务：

| 形式 | 输入 | 输出 | 示例 |
|---|---|---|---|
| many-to-one | 序列 | 单个标签 | 情感分类 |
| many-to-many 同步 | 序列 | 等长序列 | 词性标注、NER |
| seq2seq | 序列 | 另一个序列 | 翻译、摘要 |
| autoregressive LM | 前文 token | 下一个 token | 文本续写 |

所以 RNN 可以做类似 GPT 的自回归生成：

```text
prompt
→ RNN 读入 token 序列
→ 得到 hidden state
→ 预测下一个 token
→ 把生成 token 再喂回模型
→ 继续生成
```

区别在于：

```text
RNN 用 hidden state 递归传递历史；
GPT 用 causal self-attention 直接访问上下文 token。
```

---

## 8. RNN 语言模型训练：next-token prediction

长度为 10 的句子：

```text
token1 token2 token3 ... token10
```

训练目标是：

```text
token1        → predict token2
token1-2      → predict token3
token1-3      → predict token4
...
token1-9      → predict token10
```

实现上通常不是拆成 9 条独立样本，而是一次前向计算得到所有位置的预测。

输入和标签右移：

```text
input:
token1 token2 token3 ... token9

target:
token2 token3 token4 ... token10
```

RNN 前向：

```text
x1 → h1 → pred2
x2 → h2 → pred3
x3 → h3 → pred4
...
x9 → h9 → pred10
```

总 loss：

```text
loss = CE(pred2, token2) + CE(pred3, token3) + ... + CE(pred10, token10)
```

然后一次 `loss.backward()`。

---

## 9. RNN 与 GPT 训练并行性的区别

RNN 也可以一次算完整序列 loss 并做一次 BP，但时间步计算有递归依赖：

```text
h_t = f(x_t, h_{t-1})
```

因此：

```text
算 h5 前必须先算 h4
算 h4 前必须先算 h3
...
```

RNN 可以并行 batch 维度和矩阵乘法内部，但不能很好并行 sequence length 维度。

GPT / Transformer decoder 则不同：

```text
X = [x1, x2, ..., xn]

Q = XW_Q
K = XW_K
V = XW_V

causal self-attention
→ 同时得到所有位置输出
```

通过 causal mask 限制每个位置只能看左侧 token：

```text
token1 只能看 token1
token2 可以看 token1-2
token3 可以看 token1-3
...
```

对比：

| 项目 | RNN/LSTM/GRU | GPT/Transformer |
|---|---|---|
| 训练目标 | next-token prediction | next-token prediction |
| 是否一次算多个位置 loss | 可以 | 可以 |
| 是否一次 backward | 可以 | 可以 |
| 时间步前向是否并行 | 基本不能 | 可以 |
| 长距离依赖 | 压缩进 hidden state | attention 直接访问上下文 |
| GPU 利用率 | 较差 | 更好 |

---

## 10. PyTorch 中可直接使用的 RNN/LSTM/GRU

在 PyTorch 生态里，传统 RNN/LSTM/GRU 首选官方 `torch.nn`：

```python
torch.nn.RNN
torch.nn.LSTM
torch.nn.GRU
torch.nn.RNNCell
torch.nn.LSTMCell
torch.nn.GRUCell
```

Hugging Face Transformers 主要面向 Transformer / LLM，不是传统 RNN 的主阵地。

scikit-learn 不适合深度 RNN 序列建模，因为它主要面向传统机器学习和 MLP，没有成熟 GPU 深度序列训练能力。

典型 LSTM 语言模型结构：

```python
import torch
import torch.nn as nn

class LSTMLanguageModel(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_size: int, num_layers: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
        )
        self.lm_head = nn.Linear(hidden_size, vocab_size)

    def forward(self, input_ids):
        x = self.embedding(input_ids)
        output, _ = self.lstm(x)
        logits = self.lm_head(output)
        return logits
```

---

## 11. 中文 RNN 语言模型：tokenizer、vocab、embedding

训练中文 RNN 时，需要区分三件事：

```text
tokenizer：文本 -> token 序列 / token ids
vocab：token <-> id 映射表
embedding：token id -> 向量
```

完整流程：

```text
中文文本
→ tokenizer
→ token ids
→ embedding layer
→ RNN / LSTM / GRU
→ lm_head
→ 下一个 token 概率
```

---

### 11.1 中文 tokenization 方案

#### 方案 A：按字

```text
我喜欢机器学习
→ 我 / 喜 / 欢 / 机 / 器 / 学 / 习
```

优点：

- 简单；
- 不依赖分词器；
- OOV 少；
- 适合小实验和教学。

缺点：

- 序列较长；
- 词级语义被拆开。

---

#### 方案 B：按词

```text
我喜欢机器学习
→ 我 / 喜欢 / 机器学习
```

优点：

- 序列短；
- 词义更明确。

缺点：

- 依赖中文分词质量；
- 词表可能很大；
- 新词/OOV 问题明显。

---

#### 方案 C：BPE / WordPiece / SentencePiece

类似现代 GPT/BERT/LLM 的子词 tokenizer。

优点：

- 词表规模可控；
- 适合中英文混合、数字、符号；
- OOV 更少；
- 更接近现代 LLM 处理方式。

结论：

```text
RNN 也可以用 BPE / SentencePiece。
tokenizer 不依赖 Transformer。
```

---

### 11.2 embedding 可以随机初始化

自己从零训练中文 RNN 语言模型时，embedding 可以随机初始化。

```python
embedding = nn.Embedding(num_embeddings=50000, embedding_dim=256)
```

这会创建一个可训练矩阵：

```text
[50000, 256]
```

初始化时没有语义，训练过程中通过 loss 反向传播学习。

```text
token id
→ 查 embedding 表
→ 得到向量
→ 输入 RNN
→ 预测下一个 token
→ cross entropy loss
→ 反向传播
→ 更新 embedding + RNN + lm_head
```

简化结论：

```text
tokenizer 负责 token -> id；
nn.Embedding 随机初始化 id -> vector；
RNN 学序列关系；
loss 反向传播同时更新 embedding 和 RNN。
```

---

## 12. GPT 系列演进概览

GPT 系列主线从一开始就是：

```text
decoder-only Transformer
+ causal self-attention
+ next-token prediction
```

不同阶段的重点不同。

| 时间 | 模型 | 参数量公开情况 | 核心亮点 |
|---|---|---:|---|
| 2018 | GPT-1 | 约 117M | 生成式预训练 + 下游微调 |
| 2019 | GPT-2 | 最大 1.5B | 更大规模语言模型，zero-shot 生成增强 |
| 2020 | GPT-3 | 最大 175B | few-shot / in-context learning |
| 2022 | InstructGPT | 1.3B / 6B / 175B | SFT + reward model + RLHF |
| 2022 | ChatGPT / GPT-3.5 | 未公开 | 对话式产品，指令遵循和 RLHF 对齐 |
| 2023 | GPT-4 | 未公开 | 多模态，复杂推理、代码、视觉能力提升 |
| 2024 | GPT-4o | 未公开 | 原生文本/视觉/音频多模态 |
| 2024 | o1 | 未公开 | 推理模型，回答前花更多计算“思考” |
| 2025+ | GPT-5 系列 | 未公开 | 统一快答/深度推理、工具使用、agentic work |

注意：

```text
GPT-4 之后，OpenAI 不再公开模型参数量和完整架构细节。
```

网上关于 GPT-4 / GPT-5 参数量、MoE 专家数等说法，大多属于外部猜测，不应当当作事实。

---

## 13. GPT-3：没有 RLHF

原始 GPT-3 是：

```text
decoder-only Transformer
+ 大规模 next-token prediction 预训练
+ prompt / few-shot / in-context learning 推理
```

它没有使用 RLHF。

GPT-3 论文中的 few-shot 指的是：

```text
在 prompt 中给任务说明和少量示例；
模型参数不更新；
直接生成答案。
```

也就是：

```text
不做 gradient update
不做 task-specific fine-tuning
不做 RLHF
```

---

## 14. RLHF 是 InstructGPT / ChatGPT 路线

RLHF 主要出现在 GPT-3 之后的 InstructGPT 和 ChatGPT 路线中。

训练流程大致是：

```text
GPT-3 预训练模型
→ SFT：用人工示范数据做监督微调
→ Reward Model：用人类偏好排序训练奖励模型
→ RLHF / PPO：强化学习优化
→ InstructGPT
→ ChatGPT / GPT-3.5 对话模型
```

区别：

| 模型 | 是否 RLHF | 说明 |
|---|---:|---|
| 原始 GPT-3 | 否 | 纯大规模自回归预训练 |
| InstructGPT | 是 | SFT + reward model + RLHF |
| ChatGPT / GPT-3.5 | 是，属于 RLHF 对齐路线 | 对话和指令遵循优化 |
| text-davinci-002/003 | 接近指令模型路线 | 具体细节未完全公开 |

一句话：

```text
GPT-3 本体没有 RLHF；
RLHF 是在 GPT-3 预训练基座之上发展出的对齐阶段。
```

---

## 15. GPT-3 few-shot / in-context learning 为什么变强

GPT-3 的 few-shot / in-context learning 比 GPT-2 明显增强，最大直接原因是 **scaling**。

GPT-2 最大 1.5B 参数，GPT-3 最大 175B 参数。架构仍然是 decoder-only Transformer，训练目标仍然是 next-token prediction。

核心变化是：

```text
更大参数量
+ 更多训练数据
+ 更多训练计算量
→ 更强 zero-shot / few-shot / in-context learning
```

但需要补充：

```text
不是只加参数量；
而是参数量、数据量、训练算力共同扩大。
```

GPT-3 的 few-shot 并不是训练时临时更新参数，而是：

```text
prompt 中给任务说明和示例
→ 模型识别任务格式
→ 根据上下文继续生成符合格式的答案
```

可以理解为：

```text
任务识别
+ 格式归纳
+ 模式续写
+ 语义知识调用
```

而不是 SGD 意义上的“学习”。

---

## 16. GPT-3 175B 在哪里训练，什么硬件能训

GPT-3 175B 在 Microsoft Azure 上为 OpenAI 建设的 AI supercomputer / GPU 集群上训练。

公开可确认的信息：

```text
平台：Microsoft Azure
集群：Microsoft 与 OpenAI 合作建设，供 OpenAI 使用
规模：约 10,000 GPUs，285,000+ CPU cores
网络：每个 GPU server 最高 400 Gbps 级连接
```

GPU 型号在 GPT-3 论文中没有完整公开。常见技术分析认为主要使用 NVIDIA V100，但严格说这不是 GPT-3 论文直接披露的核心事实。

175B 参数如果只按 FP16 权重计算：

```text
175B × 2 bytes ≈ 350 GB
```

但训练时还需要：

```text
weights
+ gradients
+ optimizer states
+ activations
+ communication buffers
```

所以训练态显存远高于 350GB。

能训练 GPT-3 的原因不是单卡能力，而是大规模分布式训练：

```text
data parallelism
+ tensor/model parallelism
+ pipeline parallelism
+ optimizer state sharding
+ activation checkpointing
+ 高速 GPU 间通信
```

简化结论：

```text
单张或少量 V100 不能训练 GPT-3 175B；
能训是因为有万卡级高带宽 GPU 集群和成熟分布式训练工程。
```

---

## 17. DeepSeek-R1 / R1-Zero 与 OpenAI o1

### 17.1 是否受 o1 启发

可以说：

```text
DeepSeek-R1 / R1-Zero 明显沿着 o1 打开的“推理模型 / 长思考模型”方向做，
并且直接把 OpenAI-o1 作为主要 benchmark 对标对象。
```

但不能说：

```text
DeepSeek 复现了 o1 的内部训练方法。
```

因为 OpenAI o1 的完整训练细节、奖励设计、数据构造、架构细节没有公开。

---

### 17.2 R1-Zero

R1-Zero 的核心实验是：

```text
base model
→ 不先做 supervised fine-tuning
→ 直接大规模 reinforcement learning
→ reasoning 行为自然出现
```

它验证的是：

```text
只靠可验证奖励 + RL，
也可能激发长链推理、自我验证、策略调整等行为。
```

R1-Zero 的问题包括：

```text
可读性较差
语言混杂
输出风格不稳定
```

---

### 17.3 R1

DeepSeek-R1 在 R1-Zero 基础上加入：

```text
cold-start data
+ 多阶段 RL
+ 可读性和语言一致性优化
+ reasoning trace 蒸馏
```

目标是解决 R1-Zero 的可读性和稳定性问题，同时保持强 reasoning 性能。

对比：

| 模型 | 训练路线 | 目的 |
|---|---|---|
| R1-Zero | base model → large-scale RL | 验证纯 RL 激发 reasoning |
| R1 | cold-start data → RL → 多阶段训练 | 提升可读性、稳定性和综合表现 |
| o1 | OpenAI 未公开完整细节 | 推理前花更多计算，数学/代码/科学更强 |

准确表述：

```text
R1/R1-Zero 是 o1 之后开源 reasoning model 路线的重要成果；
方向和目标明显对标 o1；
但没有证据表明它复现了 o1 的内部方法。
```

---

## 18. 关键概念速查

### 18.1 tokenizer、vocab、embedding

```text
tokenizer：文本 -> token
vocab：token <-> id
embedding：id -> dense vector
```

---

### 18.2 next-token prediction

```text
输入：token1 token2 ... tokenN-1
目标：token2 token3 ... tokenN
```

用于：

```text
RNN language model
GPT
大多数自回归语言模型
```

---

### 18.3 decoder-only Transformer

GPT 系列核心架构：

```text
token embedding
+ positional encoding
+ causal self-attention
+ feed-forward network
+ LM head
→ next token distribution
```

---

### 18.4 in-context learning

不是训练时更新参数，而是：

```text
prompt 中给任务说明和示例
→ 模型在上下文中识别任务
→ 直接生成答案
```

---

### 18.5 RLHF

```text
SFT：人工示范监督微调
Reward Model：学习人类偏好
RLHF/PPO：用奖励模型优化输出偏好
```

主要用于：

```text
InstructGPT
ChatGPT
GPT-3.5 及后续对话模型路线
```

原始 GPT-3 不属于 RLHF 模型。

---

### 18.6 Stable Diffusion 三类流程

```text
训练：
image + caption
→ VAE Encoder + Text Encoder
→ noisy latent + text condition
→ U-Net 预测噪声

文生图推理：
prompt
→ Text Encoder
random latent noise
→ U-Net 去噪
→ VAE Decoder
→ image

图生图推理：
input image
→ VAE Encoder
→ latent 加噪
→ U-Net 去噪
→ VAE Decoder
→ output image
```

---

## 19. 总结

本次讨论可以串成一条技术主线：

```text
早期序列模型：
RNN / LSTM / GRU
→ 可以做语言模型和 seq2seq
→ 但时间步难并行、长上下文弱

现代语言模型：
Transformer decoder
→ causal self-attention
→ next-token prediction
→ GPT-1/2/3 scaling
→ GPT-3 出现强 in-context learning

对齐与推理：
GPT-3 本体无 RLHF
→ InstructGPT / ChatGPT 引入 SFT + RLHF
→ GPT-4 之后转向多模态、工具、长上下文
→ o1 / R1 类模型强调 test-time reasoning / RL 激发推理

现代图像生成：
扩散模型
→ DDPM 使用 U-Net 去噪
→ Stable Diffusion 把扩散放到 VAE latent space
→ 文本条件通过 Transformer text encoder 和 cross-attention 注入 U-Net
```

整体来看，生成模型的发展不是单一技术替换，而是多条路线叠加：

```text
规模化 scaling
+ 更适合并行的 Transformer 架构
+ 表征学习与条件控制
+ 人类反馈对齐
+ 推理时计算
+ 工具与多模态系统化
```
