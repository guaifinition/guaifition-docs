> **结论**：OpenAI 与 Anthropic 均未公开这些闭源模型的真实总参数量、MoE 专家数或每 token 激活参数量。下文数字是基于官方信息、Reuters/FT、LifeArchitect 参数估计、2026 年最新 IKP 黑箱测量，以及已公开的 Kimi K3 等 MoE 架构进行的综合推断（`INFERENCE`）。

本报告是作者的自撰分析稿，目标不是给出"官方数字"，而是为模型架构、算力、显存与推理成本的近似分析提供一组**可辩护的数量级与相对关系**。文中区分：外部来源事实（`SOURCE`）、原文引用（`QUOTE`）、作者推断（`INFERENCE`）与组织性说明（`EDITORIAL`）。

## 1\. 元信息与阅读方式

| 项目 | 内容 |
| --- | --- |
| 文档性质 | 自撰分析稿（作者推断为主），数据截至 2026-08-10 |
| 覆盖模型 | OpenAI GPT-5.6 系列（Sol / Terra / Luna）与 Anthropic Claude 系列（Fable 5 / Opus 5 / Sonnet 5 / Haiku 4.5） |
| 主要方法 | LifeArchitect 算力—能力交叉校准；IKP 黑箱知识容量测量；FT/Reuters 行业估计；公开 MoE 架构比例外推 |
| 上游来源 | Reuters、Financial Times、LifeArchitect、eigenigma（IKP）、Kimi K3 arXiv、OpenAI/Anthropic 官方（文末列表） |
| 关键提醒 | 所有参数数字均为推断，置信度见各表；闭源模型是否采用稀疏 MoE / hybrid-MoE 未经官方确认 |

| 标记 | 含义 |
| --- | --- |
| `SOURCE` | 外部来源给出的事实与数字 |
| `QUOTE` | 保留原文措辞的引用（注明出处） |
| `INFERENCE` | 本文作者的推断（范围、中心值、相对排序） |
| `EDITORIAL` | 本文的组织性说明 |

## 2\. 核心结论速览

1.  两家前沿实验室均未披露真实总参数量、MoE 专家数与激活参数量（`SOURCE`）。
2.  最值得信任的是**数量级和相对关系**，而非个位数百分比的精度（`EDITORIAL`）。
3.  IKP 黑箱测量的 `effective parameters` 是"知识容量相当于多大普通开放模型"，**不是实际权重数**，不能与 raw weights 混用（`SOURCE`）。
4.  GPT-5.6 的 Sol / Terra / Luna 更可能是**三个独立训练的 base**，而非同一底模的简单蒸馏缩放（IKP fingerprint 分析，`SOURCE`）。
5.  Anthropic 官方确认 **Fable 5 与 Mythos 5 为同一底层模型**，因此若 FT 报道的 Mythos 约 8T 行业估计成立，Fable 5 主模型也应接近 8T（`QUOTE` + `INFERENCE`）。

## 3\. 七个模型的总参数与激活参数估计

下表为作者认为最合理的估计范围与中心值（`INFERENCE`；"激活参数"建立在底层为稀疏 MoE / hybrid-MoE 的假设上，未经官方确认）：

| 模型 | 总参数量（估计） | 每 token 激活（估计） | 我认为最可能的中心值 | 置信度 |
| --- | --- | --- | --- | --- |
| GPT-5.6 Sol | 4–6T | 180–320B | 约 5T / 约 250B active | 总量：中；激活：低 |
| GPT-5.6 Terra | 1.5–2.5T | 70–140B | 约 2T / 约 100B active | 中低 |
| GPT-5.6 Luna | 1.2–2.2T | 40–90B | 约 1.5–1.8T / 约 60B active | 低 |
| Claude Fable 5 | 6–8T | 250–450B | 约 8T / 约 350B active | 总量：中；激活：低 |
| Claude Opus 5 | 4–6T | 160–300B | 约 5T / 约 230B active | 中 |
| Claude Sonnet 5 | 1–2T | 40–100B | 约 1.3–1.5T / 约 60–80B active | 中低 |
| Claude Haiku 4.5 | 约 80–250B | 约 15–50B | 约 120–180B / 约 30B active | 低 |

![总参数（对数轴）与激活参数（线性轴）对比](/content-assets/tech-series/tech-series-闭源前沿模型的参数规模估计/37deb727e2.svg)

_图 1 · 七个模型的总参数（对数轴）与激活参数（线性轴）对比。总参数相差两个数量级，激活参数集中在 30–350B 区间。_

## 4\. 估计方法：算力交叉校准与黑箱知识探针

两条独立的方法线支撑上述数字（`EDITORIAL`）。

**LifeArchitect 方法**：不是单一 benchmark 猜测，而是综合训练算力、推理供给、API 定价、能力以及已公开模型交叉校准；作者明确说明这类闭源参数数字是中心估计而非官方披露，典型不确定区间可达约 ±50% 甚至 factor-of-two（`SOURCE`）。

**IKP 黑箱测量**（Incompressible Knowledge Probes，2026-07）：测量的是"知识容量相当于一个约 X 的普通开放模型"，即 `IKP-effective parameters`，不是实际 raw weights（`SOURCE`）。其 90% 区间通常跨越一个数量级以上，例如 GPT-5.6 Sol 的 559B–6.7T（`SOURCE`）。

![IKP 黑箱测量的 effective parameters](/content-assets/tech-series/tech-series-闭源前沿模型的参数规模估计/c80a1ea614.svg)

_图 2 · IKP 黑箱测量结果（effective parameters）。Sol 系 1.93–1.99T、Fable/Opus 约 2.1T、Sonnet 972B；Haiku 4.5 因 refusal 率 43.1% 无可靠点估计。_

第三类来源是行业媒体转述：2026 年 8 月 7 日 Financial Times 引述知情人士称 Anthropic 的 Mythos 系统约为 8T 参数，Reuters 转述并明确提醒 Anthropic 未正式披露、Reuters 无法独立验证（`SOURCE`）。

## 5\. GPT-5.6：Sol / Terra / Luna

**Sol（作者倾向约 5T / 激活约 200–300B）**：LifeArchitect 当前模型表直接估为 5,000B；IKP 测得其 1.93T effective（Sol Pro 1.99T，90% 区间 559B–6.7T），但该数字不能解释为"Sol 有 1.93T 权重"（`SOURCE`）。综合后，`GPT-5.6 Sol 约 5T raw / 约 200–300B active` 是作者目前认为比较合理的工作假设（`INFERENCE`）。

**Terra 与 Luna 不是单纯的蒸馏缩放**。IKP 对三个系列得到 Sol 1.93T / Terra 702B / Luna 744B / Sol Pro 1.99T / Terra Pro 750B / Luna Pro 808B（`SOURCE`）；更关键的是 fingerprint 分析认为 Sol、Terra、Luna 是**三个独立训练的 base**，每个系列内部的 Pro 才更像同一底模的推理配置变体（`SOURCE`）。因此作者不采用"Sol 5T → Terra 500B → Luna 100B"的简单缩放，而倾向于 Sol 约 5T、Terra 约 2T、Luna 约 1.5T 左右，并通过不同 MoE 稀疏度、层数、专家大小、routing、speculative decoding 与 serving 优化拉开实际推理成本（`INFERENCE`）；Terra 约 70–140B active、Luna 约 40–90B active（`INFERENCE`）。

## 6\. Claude：Fable 5 / Opus 5 / Sonnet 5 / Haiku 4.5

**Fable 5（约 6–8T / 250–450B active，中心偏向 8T / 350B）**：Anthropic 官方明确表示 Fable 5 与 Mythos 5 是同一个 underlying model，区别主要在 safeguards，Fable 的部分高风险请求还可能 fallback/routing 到 Opus（`QUOTE`）；若 FT 的 8T 行业估计准确，则 Fable 5 主模型也应接近 8T——这是推论而非官方披露（`INFERENCE`）。

**Opus 5（约 5T / 160–300B active）**：LifeArchitect 估约 5,000B；IKP 独立测得约 2.1T effective（90% 区间 609B–7.2T）。作者强调 Fable 与 Opus 的 IKP 结果同为约 2.1T，并不意味着两者参数相同——IKP 测的是长尾事实知识容量，模型可以把额外参数与算力主要转化为 reasoning、agentic planning、multimodal capacity、representation quality 等，而不会按比例增加长尾事实记忆（`SOURCE` + `INFERENCE`）。建模时作者取 5T / 约 230B active（`INFERENCE`）。

**Sonnet 5（约 1–2T / 40–100B active，最可能 1.3–1.5T）**：IKP 修正结果为 972B effective（90% 区间 282B–3.4T），与"约 1T 级容量模型"的外部估计基本吻合，但不能把 972B 当成真实权重数（`SOURCE`）。若给单一数字，作者写 **约 1.4T total / 70B active**（`INFERENCE`）。

**Haiku：当前最新仍是 Claude Haiku 4.5**。截至 2026-08-10，Anthropic 官方当前模型列表为 Fable 5 / Opus 5 / Sonnet 5 / **Haiku 4.5**，不存在官方发布的 Haiku 5（`SOURCE`）。Haiku 最难估计：早期 Pine AI 探针测得约 65B effective（90% 区间 22–194B），但最新复测发现其 refusal 率高达 43.1%，方法基本失效，最新研究甚至明确选择不给出可信的新点估计（`SOURCE`）。作者只敢给宽范围：raw 约 80–250B、active 约 15–50B，押一个值则约 150B total / 30B active——此项不确定性明显高于 Sonnet/Opus（`INFERENCE`）。

## 7\. 激活参数先验：为什么 active 远小于 total

目前最好的公开参照是 Kimi K3：Moonshot 官方论文明确披露 2.8T total、104B active、896 个 routed experts、每 token 激活 16 个专家（`SOURCE`），即：

104B2800B≈3.7\\frac{104\\text{B}}{2800\\text{B}}\\approx3.7%

公开模型中还有类似比例：DeepSeek V4-Pro 约 1.6T / 49B active，Kimi K2.6 约 1T / 32B active（`SOURCE`）。因此对 2026 年超大 frontier MoE，采用"每 token 实际激活约占 raw parameters 的 3–6%"作为先验是有现实架构依据的；但 OpenAI/Anthropic 是否使用相同比例完全未知（`INFERENCE`）。

![公开 MoE 模型的激活参数占比](/content-assets/tech-series/tech-series-闭源前沿模型的参数规模估计/4f13abc1c6.svg)

_图 3 · 公开 MoE 参照的激活占比（K3 3.7%、V4-Pro 约 3.1%、K2.6 约 3.2%）与本文 3–6% 先验区间。_

据此可得数量级估计：

5T×55\\text{T}\\times 5%\\approx250\\text{B}

这也是作者把 Sol / Opus 的 active 估计放在 200B 级、而非 1T 级的主要原因之一（`INFERENCE`）。

## 8\. 两种排序并存：raw size 与 IKP effective size

作者认为目前最有外部证据支撑的 **raw-size** 排序是：

**Fable/Mythos 约 6–8T > Sol 约 Opus 约 5T > Terra 约 2T > Luna 约 Sonnet 约 1–1.6T ≫ Haiku 约 0.1–0.2T**（`INFERENCE`）。

但若比较**知识容量的黑箱 effective size**，结果却是：

**Fable 约 Opus 约 Sol 约 2T effective > Sonnet 约 1T > Terra 约 Luna 约 0.7T**（`SOURCE`）。

![raw 总参数 vs IKP effective 参数（对数轴）](/content-assets/tech-series/tech-series-闭源前沿模型的参数规模估计/523c3a0ff5.svg)

_图 4 · 同一批模型的 raw 估计与 IKP effective 测量对比（对数轴）。两者的差距与错位说明"存储的权重"与"表现出的知识容量"是两回事。_

这两个排序并不矛盾：前者试图估算**实际存储的 raw weights**，后者测量的是**权重中表现出来的事实知识容量**（`EDITORIAL`）。

## 9\. 单点值汇总（建模用）

若为模型架构、算力、显存、推理成本的近似分析而必须给每个模型一个数字，作者建议采用（`INFERENCE`）：

| 模型 | 总参数单点估计 | 激活参数单点估计 |
| --- | --- | --- |
| GPT-5.6 Sol | 5,000B | 250B |
| GPT-5.6 Terra | 2,000B | 100B |
| GPT-5.6 Luna | 1,600B | 60B |
| Claude Fable 5 | 7,000–8,000B | 350B |
| Claude Opus 5 | 5,000B | 230B |
| Claude Sonnet 5 | 1,400B | 70B |
| Claude Haiku 4.5 | 150B | 30B |

## 10\. 结论与使用注意

-   **可复用的是数量级与相对关系**：Fable/Mythos 是这批模型中 raw 规模最大的候选；Sol 与 Opus 同处约 5T 档；Terra、Luna、Sonnet 落在 1–2T 档；Haiku 是约百亿到数百亿级的轻量档（`INFERENCE`）。
-   单点值仅用于近似建模，真实值可能偏离 ±50% 甚至 factor-of-two（`SOURCE`）。
-   IKP effective parameters 不等于 raw weights；闭源模型是否 MoE 未经确认；Haiku 一项的不确定性最高（`EDITORIAL`）。
-   若后续出现官方披露或更可靠的黑箱测量，本文数字应随之修正（`EDITORIAL`）。

## 11\. 来源

1.  Reuters / FT：ByteDance targets mega AI model that could match Mythos scale —— [https://www.reuters.com/technology/bytedance-targets-mega-ai-model-nearing-anthropics-mythos-ft-reports-2026-08-07/](https://www.reuters.com/technology/bytedance-targets-mega-ai-model-nearing-anthropics-mythos-ft-reports-2026-08-07/)
2.  eigenigma（IKP）：Estimating the Parameter Counts of the Claude 5 and GPT-5.6 Families（2026-07-31）—— [https://eigenigma.io/en/articles/estimating-parameter-counts-of-claude-5-and-gpt-5-6/](https://eigenigma.io/en/articles/estimating-parameter-counts-of-claude-5-and-gpt-5-6/)
3.  LifeArchitect.ai：Models Table（10,000+ data points）—— [https://lifearchitect.ai/models-table/](https://lifearchitect.ai/models-table/)
4.  Anthropic：Claude Fable 5 and Claude Mythos 5（官方确认同底模）—— [https://www.anthropic.com/news/claude-fable-5-mythos-5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
5.  Anthropic Docs：Models overview（当前模型列表）—— [https://docs.anthropic.com/en/docs/about-claude/models/overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)
6.  LifeArchitect.ai：Models Table Methodology —— [https://lifearchitect.ai/models-table-methodology/](https://lifearchitect.ai/models-table-methodology/)
7.  arXiv：Kimi K3: Open Frontier Intelligence（2.8T total / 104B active / 896 experts）—— [https://arxiv.org/abs/2607.24653](https://arxiv.org/abs/2607.24653)
8.  OpenAI：GPT-5.6: Frontier intelligence that scales with your ambition —— [https://openai.com/index/gpt-5-6/](https://openai.com/index/gpt-5-6/)

_注：本文为自撰分析稿的整理发布；文中"作者"即本稿作者，非外部媒体。图表为本站原创生成。_
