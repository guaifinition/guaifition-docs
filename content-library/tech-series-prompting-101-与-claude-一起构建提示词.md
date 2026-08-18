> **Prompting 101 | Code w/ Claude** · Anthropic · 中文讲座报告 以 31 张视频关键帧与完整英文自动字幕重建讲座实况：一个瑞典车险理赔场景，五轮提示词迭代，一套十要素清单。

本报告把这场 25 分钟的实战讲座还原为可脱离视频阅读的中文技术文档。主线是一个真实客户改编的场景：让 Claude 阅读一份瑞典语车祸报告表单和一幅人工手绘草图，判断事故经过与责任方。讲者 Hannah Moran 与 Christian Ryan 从一条最简单的提示词出发，经过 V1 到 V5 五个版本，逐步演示任务上下文、语气、背景数据、示例、提醒、输出格式化等最佳实践如何改变模型行为。文中幻灯片文字以视频帧截图为准（`SCREENSHOT`），讲者口述来自英文自动字幕（`ASR`），表格与文字流程图为编辑性归纳（`EDITORIAL`）。

## 1\. 讲座元信息

| 项目 | 内容 |
| --- | --- |
| 议题名称 | **Prompting 101 \| Code w/ Claude** |
| 讲者 | **Hannah Moran**、**Christian Ryan** — Applied AI, Anthropic |
| 大会 | Code w/ Claude（Anthropic 开发者大会） |
| 发布 | 2025 年 7 月 31 日 |
| 时长 | 24 分 52 秒 |
| 录播 | [https://www.youtube.com/watch?v=ysPbXH0LpIE](https://www.youtube.com/watch?v=ysPbXH0LpIE)（Anthropic 官方频道） |
| 形式 | 双人交替讲解 + Anthropic Console 实机演示，提示词从 v1 迭代到 v5 |
| 演示场景 | 瑞典保险公司车险理赔：车祸报告表单（17 个复选框）+ 人工手绘事故草图 |
| 演示模型 | Claude Sonnet 4，温度（temperature）设为 0，最大 token 预算设得非常大 |

## 2\. 证据边界与阅读方式

| 标记 | 含义 | 阅读方式 |
| --- | --- | --- |
| `SCREENSHOT` | 视频关键帧可直接核验的幻灯片文字、Console 界面与模型输出 | 以嵌入帧截图为准 |
| `ASR` | 讲者口述，来自英文自动字幕；已纠错 claw→Claude、entropic→Anthropic、cloud→Claude 等 | 保留口述边界，不扩写为官方文档结论 |
| `EDITORIAL` | 本报告的组织性说明、表格归纳与文字流程图 | 帮助阅读，不新增技术主张 |

官方没有发布独立 PPT 或讲稿。下文嵌入的 31 张图均为录播视频的关键帧截图，版权归 Anthropic 所有，本站仅用于教育性评论与引用；需要观看实机画面时，请使用原始 YouTube 链接并跳到图注中的时间码。

## 3\. 开场：什么是提示工程

![标题页：Prompting 101，讲者 Hannah Moran 与 Christian Ryan（Applied AI, Anthropic）](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/77ddd1f07e.jpg)

_图 1 · 00:01 · 标题页与两位讲者。Hannah 与 Christian 均来自 Anthropic 应用 AI 团队，本场将用真实场景共同构建一条提示词。_

Hannah 开场给出提示工程的定义：它是与语言模型沟通、引导模型完成预期任务的方式，具体包括为模型编写清晰的指令、提供完成任务所需的上下文，并仔细考量如何组织这些信息以获得最佳结果。她强调细节很多、思路很多，而掌握它的最佳途径就是反复实践（`ASR`）。

![幻灯片：What is 'prompt engineering' anyway? 定义与技能清单](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/375e77c2cf.jpg)

_图 2 · 00:26 · 定义页。提示工程是"通过测试、评估、分析与优化提示，系统性改进 LLM 应用提示的实践"，涉及九项技能。_

定义页把提示工程描述为"通过测试、评估、分析与优化提示，系统性改进 LLM 应用提示的实践"（`SCREENSHOT`），并列出了所需技能：

| 技能（幻灯片原文） | 中文对照 |
| --- | --- |
| Programming in natural language | 用自然语言"编程" |
| Clear, unambiguous, precise writing | 清晰、无歧义、精确的写作 |
| Conceptual engineering | 概念工程 |
| Creating code with a scientific mindset | 以科学思维创建代码 |
| Product thinking — what is the ideal model behavior for your product? | 产品思维——你的产品的理想模型行为是什么？ |
| Testing | 测试 |
| Understanding the LLMs | 理解大语言模型 |
| Aggregating and analyzing failure modes + thinking of ways to fix | 汇总分析失败模式并思考修复方式 |
| Making LLMs scale to a wide range of inputs | 让 LLM 扩展到广泛的输入 |

## 4\. 动手场景：瑞典车险理赔

![幻灯片：Hands-on scenario](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/06dce402a0.jpg)

_图 3 · 00:57 · 动手场景页。示例改编自一位真实客户，内容做过修改。_

场景设定是：假设你就职于一家瑞典保险公司，日常处理汽车保险理赔。任务是分析图像、提取事实性信息，并让 Claude 对识别到的内容作出判断。Hannah 特别提到她本人不懂瑞典语，但 Christian 和 Claude 都懂（`ASR`）。

![幻灯片：Prompt Claude to analyze car accident reporting forms，左侧表单、右侧手绘草图](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/64980ebc4a.jpg)

_图 4 · 01:45 · 场景页全貌：左侧为车祸报告表单，右侧为人工手绘事故草图，草图下方写着街道名 Köpmangatan。_

### 4.1 两份输入：表单与草图

系统会收到两份信息。第一份是车祸报告表单，包含 17 个复选框，逐项记录实际发生的事情，左右两栏分别对应车辆 A 与车辆 B；第二份是人工手绘的事故草图，用方框和箭头表示两车动态（`ASR` + `SCREENSHOT`）。

![Console 上传文件视图：瑞典语车祸报告表单，17 行复选框](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/0f5f1fe868.jpg)

_图 5 · 06:49 · Console 中上传的表单原件。表单结构固定不变，变化的只是每次的勾选方式——这类信息适合放进系统提示词。_

![Console 上传文件视图：手绘草图全幅，车辆 A 标注 stillastående（静止），车辆 B 标注 körde（行驶），街道为 Köpmangatan](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/284f6def5a.jpg)

_图 6 · 07:13 · 草图全幅。瑞典语标注：车辆 A "stillastående"（静止），车辆 B "körde"（行驶）；同一场景的另一个数据点。_

草图上的瑞典语标注是理解后续判定的关键：车辆 A 被标注为静止（stillastående），车辆 B 被标注为行驶（körde），事故发生在 Köpmangatan 街（`SCREENSHOT`）。表单与草图是同一场景的两个数据点，需要互相印证。

## 5\. V1：直接丢进 Console

![幻灯片：What if we just throw it all into the console?](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/c47a122b0b.jpg)

_图 7 · 02:09 · "如果直接把所有东西丢进 Console 会怎样？"——演示从最朴素的基线开始。_

第一版提示词只做了最基本的铺垫：说明任务是审阅一份事故报告表，并最终判断事故经过与谁负有责任。运行设置为 Claude Sonnet 4、温度 0、非常大的最大 token 预算，以排除配置对模型能力的限制（`ASR` + `SCREENSHOT`）。

![Console v1：简单提示词 + 两张图片，模型设置 Claude Sonnet 4、温度 0](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/9a7db21cce.jpg)

_图 8 · 02:17 · Console v1。用户提示词只有一句话级别的任务描述，附件为 form-svenska.jpg 与 IMG\_8117.jpg。_

![Console v1 输出：Claude 误判为滑雪事故，街道名读作 Chappangan](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/fc0736e9d7.jpg)

_图 9 · 02:49 · v1 输出。Claude 认为这与一起"滑雪事故"有关，并把街道名读成 Chappangan——一个无害但信息量很大的错误。_

结果 Claude 认为这与一起发生在瑞典某街道的滑雪事故有关。讲者评价：这个初步猜测"不算太糟"，因为提示词里确实没有任何铺垫说明当前是车辆场景；但这也暴露出大量可以注入的直觉性信息（`ASR`）。

## 6\. 提示工程是实证科学

![幻灯片：Let's take a step back and do some prompt engineering! Engineer → Test → Refine 循环](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/4350387b68.jpg)

_图 10 · 03:13 · "提示工程是一门实证的科学：永远测试你的提示词并经常迭代！"循环图：构建初步提示 → 用用例测试 → 精炼提示。_

幻灯片给出核心方法论：提示工程是实证科学，要永远测试、经常迭代。循环只有三步——构建初步提示词、对用例测试、精炼提示词——然后不断重复（`SCREENSHOT`）。用文字流程图表示即：

```text
Engineer preliminary prompt        构建初步提示词
        │
        ▼
Test prompt against cases ──────► 用真实用例测试（例如：必须识别出这是车辆场景，而非滑雪）
        │
        ▼
Refine prompt ─────────────────► 精炼提示词，把失败模式转化为新的上下文
        │
        └──────► 回到 Test，继续迭代
```

讲者补充：可以为此设置测试用例，例如要求 Claude 确认它理解当前是汽车或车辆环境、与滑雪无关；通过这种方式迭代地完善提示词，确保它真正解决你想解决的问题（`ASR`）。

## 7\. 推荐的提示词结构

![幻灯片：Prompt structure 五段式，右侧为完整提示词代码面板](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/bdd40ac5af.jpg)

_图 11 · 04:17 · 提示结构五段式与右侧对应的完整提示词示例。目标场景使用 API 单消息一次到位，而非聊天式来回。_

讲者先区分两种交互方式：聊天机器人式的来回对话，以及 API 场景下"只发一条消息就一次到位"。对于后者，他们推荐的结构是：开头给出任务描述（角色与职责），然后提供动态内容（如图像或从其他系统检索的数据），再给出分步的详细指令，可选地提供示例，最后重复最关键的信息并让模型开始工作（`ASR`）。

| 序号 | 结构块（幻灯片原文） | 作用 |
| --- | --- | --- |
| 1 | 1-2 sentences to establish role and high level task description | 用一两句话确立角色与高层任务 |
| 2 | Dynamic / retrieved content | 动态或检索得到的内容（图像、文档等） |
| 3 | Detailed task instructions | 详细的分步任务指令 |
| 4 | Examples (is also optional) | 示例（可选） |
| 5 | Repeat critical instructions (particularly useful for very long prompts) | 在结尾重复关键指令，长提示词尤其有用 |

随后幻灯片把五段式展开为十要素清单，作为整场演示的骨架：

![幻灯片：Prompt structure 十要素彩色列表 + 完整提示词代码面板](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/a8f6daf361.jpg)

_图 12 · 05:05 · 十要素清单：1 任务上下文、2 语气上下文、3 背景数据/文档/图像、4 详细任务描述与代码、5 示例、6 对话历史、7 即时任务描述或请求、8 逐步思考、9 输出格式化、10 预填充响应（如有）。_

## 8\. V2：任务上下文与语气上下文

![Console 提示词版本下拉：Accident Report Form Analysis v1–v5](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/853093cd7f.jpg)

_图 13 · 06:33 · Console 中保存的五个提示词版本 v1–v5，对应讲座的五轮迭代。_

V2 加入前两个要素。**任务上下文**：明确 Claude 所处场景——协助人类理赔员审阅瑞典语车祸报告表单，避免模型过度猜测；**语气上下文**：要求 Claude 保持事实性与确定性，看不懂就不要猜，评估要尽可能清晰、有把握，否则整个流程就会失去线索（`ASR`）。

![Console v2：系统提示词加入任务与语气上下文](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/4e9b5806e9.jpg)

_图 14 · 07:37 · v2 系统提示词：明确 AI 助手协助理赔员审阅瑞典语表单，并强调"若无十足把握则不应作出评估"。_

![Console v2 输出：识别为车祸，读出车辆 A 勾选 1、车辆 B 勾选 12，但对责任判定仍不 fully confident](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/a4d063c48e.jpg)

_图 15 · 08:09 · v2 输出。模型已回到车辆场景，并读出关键勾选，但承认信息不足以完全有把握地判定责任方——这正是语气上下文期望的行为。_

V2 的效果：Claude 识别出这与车祸而非滑雪有关，读出车辆 A 勾选在复选框 1、车辆 B 勾选在复选框 12；但向下滚动可以看到，它仍然缺少足够信息来完全有把握地判定责任。讲者认为这是好事——任务设定要求它不作非事实断言、只在有把握时评估（`ASR`）。缺的那部分信息，恰恰是关于表单本身的知识，最佳放置位置是系统提示词。

## 9\. V3：背景数据、文档与图像进系统提示词

![构建页：3. Background data, documents, and images 高亮](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/6c8aa2291f.jpg)

_图 16 · 08:49 · 第三要素高亮。表单结构每次查询都完全相同，是放入系统提示词的典型信息。_

V3 对应第三要素：背景数据、文档与图像。讲者指出，这份表单每次完全相同、永不改变，变的只是填写方式；因此"表单结构"是放入系统提示词的绝佳信息。他们还提到这正适合使用提示缓存（prompt caching）：这部分内容永远不变，缓存后 Claude 每次不必重新理解表单结构，读取效果也更好（`ASR`）。

在组织方式上，幻灯片专门讲了一页"如何在提示词中组织信息"：

![幻灯片：how to organize information in your prompts——XML 标签作为分隔符](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/70301060ff.jpg)

_图 17 · 09:37 · 组织信息页：杂乱的提示词难以理解；用 XML 标签等分隔符组织；Claude 理解各种分隔符，但团队偏好 XML，因为边界清晰且 token 高效。_

要点是：杂乱的提示词对 Claude 来说难以理解；像 XML 标签这样的分隔符能帮 Claude 理解提示词结构，正如章节标题帮助人类阅读；Claude 理解各种分隔符，团队偏好 XML 是因为边界清晰、token 高效（`SCREENSHOT`）。

![Console v3：系统提示词写入表单标题、两栏、17 行含义与填写习惯](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/6a483e7a75.jpg)

_图 18 · 10:49 · v3 系统提示词：告知表单为瑞典语、有两栏（各代表一辆车）、逐行解释 17 行含义，并说明人类填写可能有圈画、涂写等多种标记。_

V3 的系统提示词把表单的一切告诉 Claude：这是瑞典语车祸表单，有标题、两栏分别代表不同车辆，17 行每一行的含义都提前给出；还说明表单由人填写，标记可能是圈、涂写或叉，并解释表单的用途与解读方式。此前 Claude 需要逐行读取以猜测每行含义，现在这些信息被前置提供（`ASR` + `SCREENSHOT`）。

![Console v3 输出：基于表单与草图，有信心地判定车辆 B 负有责任](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/ee0bc060cc.jpg)

_图 19 · 12:25 · v3 输出。模型不再复述表单结构，直接列出勾选与草图信息，并有信心地给出"车辆 B 负有责任"的判断。_

运行后，Claude 花在"叙述表单是什么"上的篇幅明显减少，转而给出完整的勾选清单与草图描述，并有信心地判定：基于草图，车辆 B 在本案中负有责任。讲者表示，如果人类看这张图和清单，也会得出同样结论（`ASR`）。

## 10\. 少样本示例与对话历史

![幻灯片：providing examples——示例作为具体模板](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/7d7707a392.jpg)

_图 20 · 13:37 · 示例页：示例是具体模板；对一致格式、行业术语等任务尤为关键；展示一两个示例往往比文字描述所有 nuances 更有效；要求相关性、多样性、数量至少 3–5 个。_

第五要素是示例（少样本，few-shot）。幻灯片给出四条主张：示例充当具体模板，让 Claude 更容易理解并复现期望输出；对需要一致格式、特定行话或行业标准的任务尤为关键；展示一两个期望输出的示例，往往比用文字穷尽所有细微之处更有效；示例要讲究相关性、多样性，数量至少 3–5 个（`SCREENSHOT`）。

讲者进一步说明用法：把人类直觉与人工标注的正确结论固化进系统提示词——例如将疑难事故的图像 base64 编码后作为示例数据，再附上"如何拆解和理解它"的描述；并建立反馈回路，把线上出错的模式补进示例集，使下次遇到类似案例时模型有据可参照。在真实保险公司场景里，这样的示例可能积累数十甚至数百个（`ASR`）。

![构建页：5. Examples 与 6. Conversation history 高亮](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/7d25f1d9a1.jpg)

_图 21 · 14:17 · 第五、六要素高亮。对话历史与示例同类：为 Claude 提供上下文丰富的信息；面向用户、存在长对话的应用应把它放入系统提示词。_

第六要素是对话历史。本场演示是后台自动化系统（末尾可能有人工介入），并不面向长对话用户；但讲者指出，若构建面向用户、存在相关长对话历史的应用，系统提示词中这一位置是引入它的理想之处，因为它能丰富 Claude 工作时的上下文（`ASR`）。

## 11\. V4：即时任务提醒与防幻觉

![幻灯片：preventing hallucinations 四宫格](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/bc4fdabc75.jpg)

_图 22 · 15:53 · 防幻觉四法：让 Claude 在不知道时说"我不知道"；只在非常自信时作答；先思考再回答；对长文档先找相关引文、再基于引文作答。_

第七要素是即时任务描述或请求：在提示词结尾回到"当前任务是什么"，并提醒模型遵循重要准则。其目的之一是防幻觉。幻灯片给出四个可操作的技巧：让 Claude 在不知道时说"我不知道"；告诉它只在非常自信时才作答；让它先思考再回答；对长文档要求它先找到相关引文、再基于引文作答（`SCREENSHOT`）。讲者举例：如果无法判断哪个框被勾选，不希望 Claude 猜测甚至虚构勾选；如果草图画得糟到人类也看不懂，希望 Claude 如实说明（`ASR`）。

![Console v4：用户提示词加入分步任务清单，强调先表单后草图](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/434f11b02e.jpg)

_图 23 · 17:05 · v4 在系统提示词不变的前提下，加入"Follow the following Tasks"的分步清单：先逐框核验表单，再分析草图，最后互相印证。_

V4 保持系统提示词不变，只加入详细的分步任务清单。讲者强调一个关键发现：**Claude 分析信息的顺序非常重要**。类比人类：你不会先盯着一堆方框和线条的草图猜测含义，而会先读表单，知道这是车祸、各车辆在做什么，再回头理解草图。因此 v4 明确指示：先非常仔细地查看表单，确认哪些框被勾选、不要遗漏，并为自己列一份清单；然后带着从表单获得的事实去解读草图，互相印证后给出最终评估（`ASR`）。

![Console v4 输出：逐框报告勾选情况，并以 XML 标签分节给出表单分析、事故概要、草图分析](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/7a333d2261.jpg)

_图 24 · 18:17 · v4 输出。模型"展示工作过程"：逐框回答是否勾选；随后以 XML 分节输出表单分析、事故概要、草图分析，并维持"车辆 B 显然有责"的结论。_

运行后出现一个值得注意的行为：因为被要求"仔细检查每一个选框"，Claude 便逐框展示核验过程。讲者提醒，这未必是最终想要的详略程度，可以调整；但逐步推进的思维方式在更复杂的草图、更不清晰的表单下，对正确评估的影响非常显著（`ASR`）。

![构建页：8. Thinking step by step / take a deep breath 高亮](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/6e07db95f6.jpg)

_图 25 · 19:53 · 第八要素高亮：逐步思考 / 深呼吸。_

## 12\. V5：输出格式化与最终裁定

![Console v5：加入 Important guidelines 与输出格式要求](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/7c6eaf3d35.jpg)

_图 26 · 20:41 · v5 加入"Important guidelines"：摘要要清晰、简明、准确；最终裁定用 XML 标签包裹，便于应用层解析。_

第九要素是输出格式化。讲者从数据工程师视角解释：精巧的铺垫固然好，但应用最终需要的是能存入数据库（例如 SQL）的核心信息，其余叙述对应用并不必要。因此 v5 加入"重要准则"部分，强化机械性行为：摘要清晰、简明、准确；除正在分析的数据外没有任何因素妨碍评估；最终裁定结论用 XML 标签包裹，应用层只解析该标签内容（`ASR` + `SCREENSHOT`）。

![Console v5 输出：更简洁的过程 + final verdict XML 标签包裹的裁定](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/e727a678f5.jpg)

_图 27 · 21:37 · v5 输出。过程更简洁，结尾以 final verdict XML 标签给出可解析的裁定结论。_

![构建页：十要素齐备](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/ee30257383.jpg)

_图 28 · 22:09 · 构建页十要素齐备：1 任务上下文、2 语气上下文、3 背景数据、4 详细任务描述、5 示例、6 对话历史、7 即时任务提醒、8 逐步思考、9 输出格式化、10 预填充响应。_

讲者回顾整条演进线：从滑雪事故，到第二版不够自信的输出，再到如今格式化严格、置信度高的可解析输出——已经可以围绕它构建真正帮助现实车险公司的应用（`ASR`）。

## 13\. 预填充与扩展思考

![幻灯片：Prefill Claude's response——在 Assistant 角色预写文本](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/c9c2b87aec.jpg)

_图 29 · 22:49 · 预填充页：在 Assistant 字段预写文本，Claude 会从你停下的地方继续；可引导行为、更强控制输出格式（如 JSON 可序列化）。_

第十要素是预填充响应（prefill）：在 Assistant 角色预写一段文本，Claude 会从你停下的地方继续。这可以引导模型行为、更强地控制输出格式——例如要结构化 JSON 输出以便后续调用可序列化时，可以预填充一个左方括号；在本场景也可以预填充 final verdict 的 XML 起始标签，然后再解析（`ASR` + `SCREENSHOT`）。

![幻灯片：What about extended thinking? / Extended thinking vs. prompt engineering](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/b56ef9bff3.jpg)

_图 30 · 23:37 · 扩展思考页。何时用：给 Claude 更多思考时间；跟随思考轨迹反哺系统提示词。代价：思考中可能"重复造轮子"导致 token 更高；思考要求 temperature = 1，有时不可复现。_

最后讲扩展思考。Claude 3.7 与尤其是 Claude 4 属于混合推理模型，扩展思考（extended thinking）可供使用：它提供 thinking 标签与草稿板，让你分析模型如何处理数据，从而把观察到的模式固化进系统提示词——这不仅在 token 使用上更高效，也是理解"没有人类直觉的模型如何读数据"的窗口（`ASR`）。幻灯片同时给出取舍：

| 何时使用扩展思考 | 代价 |
| --- | --- |
| 给 Claude 更多思考时间的绝佳第一步 | 思考过程可能"重复造轮子"，token 用量更高 |
| 跟随思考轨迹理解模型思路，用以反哺系统提示词 | 思考要求 temperature = 1，有时不可复现 |

## 14\. 十要素清单与五版迭代回顾

| 要素 | 内容 | 引入版本 |
| --- | --- | --- |
| 1 | Task context 任务上下文 | V2 |
| 2 | Tone context 语气上下文（事实性、确定性） | V2 |
| 3 | Background data, documents, and images 背景数据进系统提示词 | V3 |
| 4 | Detailed task description & code 详细任务描述 | V4 |
| 5 | Examples 少样本示例 | 演示未用，重点讲解 |
| 6 | Conversation history 对话历史 | 演示未用，重点讲解 |
| 7 | Immediate task description or request 即时任务提醒 | V4 |
| 8 | Thinking step by step / take a deep breath 逐步思考 | V4 |
| 9 | Output formatting 输出格式化 | V5 |
| 10 | Prefilled response (if any) 预填充响应 | 讲解收尾 |

| 版本 | 主要变化 | 观察到的行为 |
| --- | --- | --- |
| V1 | 一句话任务描述 + 两张图 | 误判为滑雪事故，街道名读错 |
| V2 | \+ 任务上下文、语气上下文 | 回到车祸场景，读出勾选 1 与 12，但承认把握不足 |
| V3 | \+ 表单结构等背景数据进系统提示词（可配提示缓存）、XML 组织 | 不再复述表单，有信心判定车辆 B 有责 |
| V4 | \+ 分步任务清单、先表单后草图、逐步思考 | 逐框核验并展示工作过程，XML 分节分析 |
| V5 | \+ 重要准则、输出格式化、final verdict XML 标签 | 输出简洁、裁定可解析，可围绕其构建应用 |

## 15\. 收尾

![结束页：Thank you](/content-assets/tech-series/tech-series-prompting-101-与-claude-一起构建提示词/1e797657ad.jpg)

_图 31 · 24:41 · 结束页。讲者全天在场交流，并预告后续场次：Prompting for agents 与 Claude plays Pokemon 演示。_

讲座以一场完整的实证循环收束：从一条朴素提示词的滑雪事故误判出发，通过任务上下文、语气、背景数据、任务顺序、提醒与格式化的逐轮注入，把模型行为塑造为可解析、可信赖、可工程化的输出。对工程师而言，可带走的结论是：提示工程不是一次性写作，而是以测试用例驱动的版本迭代；系统提示词承载稳定知识，用户提示词承载动态内容与即时任务；而示例、预填充与扩展思考则是进一步塑造行为的三件工具（`EDITORIAL`）。

## 16\. 来源与说明

-   录播视频：[https://www.youtube.com/watch?v=ysPbXH0LpIE](https://www.youtube.com/watch?v=ysPbXH0LpIE)，Anthropic 官方频道，2025-07-31 发布，时长 24:52。
-   字幕证据：英文自动字幕（ASR）json3，2026-08-05 检索下载；已纠错专有名词（claw/cloud/clone→Claude、entropic→Anthropic、system problem→system prompt 等）。
-   图像证据：本地下载 720p 视频流后以 ffmpeg 抽取 31 张关键帧，存于 `public/images/prompting-101/`；帧截图版权归 Anthropic 所有，仅用于教育性评论与引用。
-   时间码以 8 秒网格定位，误差约 ±4 秒；Console 小字在 720p 下不完全清晰，正文只转述可核验部分。
-   官方未发布独立 PPT 或讲稿；文中表格与文字流程图为编辑性归纳（`EDITORIAL`），不新增技术主张。
