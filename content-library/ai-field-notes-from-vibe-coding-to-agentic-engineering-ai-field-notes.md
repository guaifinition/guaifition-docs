## Document profile 文档信息

| Field 字段 | Value 内容 |
| --- | --- |
| Video ID | `96jN2OCOfLs` |
| Duration 时长 | 00:29:45 |
| Chapters 章节 | 9 |
| Bilingual semantic paragraphs 双语语义段落 | 59 |
| Transcript source 字幕来源 | User-provided English auto-generated SRT 用户提供的英文自动字幕 |
| Translation mode 翻译方式 | Paragraph-level academic translation; not sentence-by-sentence 语义段落级学术翻译，非逐句对照 |
| Obsidian | Native Markdown; local images; CSS snippet included 原生 Markdown、本地图片、附 CSS snippet |

## Method and limitations 方法与限制

English

The transcript was reconstructed from auto-generated captions, merged into semantic paragraphs, and translated at paragraph level. The English text preserves the supplied captions rather than silently rewriting them. Obvious recognition errors are documented separately. Research notes distinguish interview claims from independently verifiable documentation and analytical inference.

简体中文

本文档依据自动生成字幕重建正文，并按语义合并为段落，再进行段落级翻译。英文部分保留用户提供字幕的基本形态，不对原文进行无提示改写；明显的语音识别错误另行列出。研究注释明确区分访谈中的观点、可独立核验的公开文档事实，以及分析性推断。

Auto-generated captions can misidentify product names, technical terms, speaker changes, and punctuation. Consult the video when exact wording is material.

自动字幕可能错误识别产品名称、技术术语、说话人切换与标点。涉及精确措辞时，应回看原视频。

## Contents 目录

1.  [00:00:00 — Introduction and feeling behind as a coder](#chapter-1-introduction-and-feeling-behind-as-a-coder)
2.  [00:02:28 — Software 3.0 explained](#chapter-2-software-30-explained)
3.  [00:03:44 — Agents as the installer](#chapter-3-agents-as-the-installer)
4.  [00:04:49 — MenuGen versus raw prompts](#chapter-4-menugen-versus-raw-prompts)
5.  [00:07:37 — What becomes obvious by 2026](#chapter-5-what-becomes-obvious-by-2026)
6.  [00:09:41 — Verifiability and jagged intelligence](#chapter-6-verifiability-and-jagged-intelligence)
7.  [00:13:39 — Founder advice and automation](#chapter-7-founder-advice-and-automation)
8.  [00:15:46 — From vibe coding to agentic engineering](#chapter-8-from-vibe-coding-to-agentic-engineering)
9.  [00:25:17 — Agents everywhere, education, and learning](#chapter-9-agents-everywhere-education-and-learning)

## Research synthesis 研究综合

### 1\. Central thesis: the unit of engineering is changing 核心论点：工程活动的基本单元正在变化

English

Karpathy describes a transition from local code completion to coherent agentic workflows. The important change is not merely higher token-level accuracy. It is that an agent can maintain enough state, use tools, traverse a repository, and produce an integrated artifact. Under this regime, the engineer’s scarce resource shifts from keystrokes to specification quality, decomposition, verification, and attention allocation.

简体中文

Karpathy 所描述的变化，不是局部代码补全准确率的小幅提升，而是从局部生成进入连贯的智能体工作流：智能体能够保持足够的任务状态、调用工具、遍历代码仓库，并交付集成后的完整产物。在这种工作方式下，工程师的稀缺资源从键盘输入速度转移到需求规格质量、任务分解、验证能力和注意力配置。

### 2\. Software 3.0 is a runtime model, not a replacement slogan Software 3.0 是运行时模型，而不是“全面替代”口号

English

The interview frames natural-language context as a new kind of program and the LLM as an interpreter. A precise reading is that probabilistic model execution becomes another layer in the software stack. It does not abolish deterministic code, databases, access controls, protocols, or tests. Production systems remain hybrid: probabilistic planning and generation are bounded by deterministic interfaces and verification.

简体中文

访谈把自然语言上下文视为一种新的程序形式，把 LLM 视为解释器。更严格的理解是：概率模型执行成为软件栈中的新增层，而不是取消确定性代码、数据库、访问控制、协议或测试。生产系统仍然是混合架构：由概率性规划与生成负责提出动作，再由确定性接口和验证机制约束其行为。

### 3\. Verifiability explains part of capability jaggedness 可验证性解释了能力锯齿性的一部分

English

Tasks with compilers, unit tests, exact answers, or simulators provide dense and comparatively reliable feedback. They are easier to optimize through reinforcement learning, search, and iterative correction. Tasks involving taste, stakeholder alignment, incomplete requirements, or delayed consequences expose weaker reward signals. Verifiability is therefore a strong explanatory variable, but not a complete theory: training distribution, tool quality, context availability, and interface design also matter.

简体中文

具有编译器、单元测试、精确答案或模拟器的任务能够提供密集且相对可靠的反馈，因此更适合通过强化学习、搜索和迭代纠错进行优化。涉及审美、利益相关者协调、不完整需求或长期后果的任务，其奖励信号更弱。因此，可验证性是解释能力锯齿性的重要变量，但并非完整理论；训练数据分布、工具质量、上下文供给和接口设计同样关键。

### 4\. Agentic engineering retains responsibility Agentic Engineering 不会转移工程责任

English

The distinction between vibe coding and agentic engineering is primarily a distinction in accountability. In exploratory work, the user may accept opaque code and weak validation. In production work, the operator remains responsible for security, privacy, reliability, licensing, regressions, and operational cost. The new bottlenecks are therefore specifications, test design, observability, review evidence, and controlled deployment.

简体中文

Vibe coding 与 agentic engineering 的主要区别在于责任边界。探索性项目可以容忍代码不透明和验证不足；生产工程中，操作者仍需对安全、隐私、可靠性、许可证、回归风险和运行成本负责。因此，新的瓶颈集中在规格说明、测试设计、可观测性、审查证据和受控部署。

### 5\. Agent-native products expose machine-actionable affordances Agent-native 产品需要机器可执行的交互界面

English

An agent-native service should not assume that a human will visually navigate every screen. Stable APIs, structured errors, idempotent operations, machine-readable documentation, auditable permissions, and deterministic test environments become first-class product surfaces. This is not simply “adding an API”; it is redesigning the system so an automated principal can discover, act, verify, and recover.

简体中文

面向智能体的服务不能假设所有流程都由人类逐屏操作。稳定 API、结构化错误、幂等操作、机器可读文档、可审计权限以及确定性的测试环境，都应成为一等产品界面。这并不只是“增加一个 API”，而是重新设计系统，使自动化主体能够发现能力、执行动作、验证结果并从失败中恢复。

### 6\. Education: outsource execution without outsourcing understanding 教育：可以外包执行，但不能外包理解

English

The interview’s educational implication is not that foundational knowledge becomes obsolete. Higher-level delegation increases the value of mental models because the user must detect incoherent plans, choose verification strategies, and understand failure modes. Personal knowledge bases can externalize retrieval and organization, but they should support comprehension rather than replace it.

简体中文

访谈对教育的含义并不是基础知识失效。恰恰相反，委托层级越高，心智模型越重要，因为使用者必须识别不连贯的计划、选择验证策略并理解失败模式。个人知识库可以承担检索和组织功能，但应服务于理解，而不是取代理解。

## Concept map 概念图谱

Software 3.0 execution stack Software 3.0 执行栈

![Agentic engineering control loop](/content-assets/ai-field-notes/ai-field-notes-from-vibe-coding-to-agentic-engineering-ai-field-notes/4335aa626b.svg)

Agentic engineering control loop 智能体工程控制闭环

![Verifiability and jagged capability](/content-assets/ai-field-notes/ai-field-notes-from-vibe-coding-to-agentic-engineering-ai-field-notes/e6344fe9be.svg)

Verifiability and jagged capability 可验证性与能力锯齿性

## Analytical comparison 分析对照

| Dimension 维度 | Vibe coding | Agentic engineering |
| --- | --- | --- |
| Primary objective 主要目标 | Rapid exploration 快速探索 | Reliable delivery 可靠交付 |
| Specification 规格 | Informal and evolving 非正式、持续变化 | Explicit constraints and acceptance tests 明确约束与验收测试 |
| Verification 验证 | Manual plausibility checks 人工合理性检查 | Automated tests, review evidence, security checks 自动测试、审查证据、安全检查 |
| Code ownership 代码责任 | Often weak or temporary 通常较弱或临时 | Human or organization remains accountable 人或组织持续承担责任 |
| Deployment 部署 | Local prototype 本地原型 | Controlled integration and observability 受控集成与可观测性 |
| Suitable risk 适用风险 | Low consequence 低后果 | Production and regulated contexts only with governance 生产与受监管场景需治理机制 |

## Key terms 关键术语

| Term | Working definition 工作定义 | Status 性质 |
| --- | --- | --- |
| Vibe coding | Prompt-driven construction where speed and experiential feedback dominate formal specification and verification. 以提示驱动构建，速度与体验反馈优先于正式规格和验证。 | Transcript + analysis |
| Agentic engineering | Engineering in which agents perform substantial work inside explicit control, testing, review, and deployment loops. 智能体承担大量工作，但被置于明确的控制、测试、审查和部署闭环中。 | Analysis |
| Software 3.0 | The thesis that natural-language context programs an LLM runtime; best interpreted as an additional probabilistic software layer. 用自然语言上下文对 LLM 运行时进行编程；宜理解为新增的概率软件层。 | Transcript + analysis |
| Jagged capability | Uneven performance across tasks and domains rather than a single scalar intelligence level. 模型在不同任务和领域呈现不均匀能力，而非单一标量智能。 | Transcript + external research |
| Verifiability | Availability of objective, timely and low-noise feedback that can score an action or artifact. 是否存在客观、及时、低噪声的反馈来评价动作或产物。 | Analysis |

## Editorial notes on caption recognition 字幕识别编辑说明

-   Alpha code adjacent → likely “Claude Code–adjacent” or “AlphaCode-adjacent”; context is ambiguous 语境可能指 Claude Code 或 AlphaCode 一类工具
-   menu gen → MenuGen, the example product name used in the talk 演讲中的示例产品名 MenuGen
-   SFTP piece → likely SFT or a training-related term 可能是 SFT 或训练相关术语

## Full bilingual transcript 中英双语全文

## Chapter 1: Introduction and feeling behind as a coder

Chapter start 章节起点： 00:00:00

### 00:00:02

Open at 00:00:02 从此处播放

English

We're so excited for our very first special guest. He has helped build modern AI, then explain modern AI, and then occasionally rename modern AI. He actually helped co-found OpenAI right inside of this office, was the one who actually got autopilot working at Tesla back in the day. And he has a rare gift of making the most complex technical shifts feel both accessible and inevitable.

简体中文

我们非常高兴迎来本次活动的首位特别嘉宾。他既参与构建了现代人工智能，又长期致力于解释现代人工智能，偶尔还会为现代人工智能提出新的命名。他曾在这间办公室里参与创立 OpenAI，也曾在 Tesla 推动 Autopilot 真正落地。他有一种少见的能力：能够把最复杂的技术变迁解释得既容易理解，又让人看到其发展方向具有某种必然性。

### 00:00:30

Open at 00:00:30 从此处播放

English

You all know him for having coined the term vibe coding last year, but just in the last few months he said something even more startling, that he's never felt more behind as a programmer. That's where we're starting today. Thank you, Andre, for joining us. Yeah, hello. I'm excited to be here and to kick us off. Okay, so just a couple months ago you said that you've never felt more behind as a programmer. That's startling to hear from you of all people. Um can you help us unpack that? Was that feeling exhilarating or unsettling?

简体中文

大家都知道，他去年提出了“vibe coding（氛围编程）”这一说法；但就在几个月前，他又说了一句更令人意外的话：自己从未像现在这样感到作为程序员已经落后。我们今天就从这里谈起。Andrej，感谢你参加。——很高兴来到这里。——几个月前你说，自己从未如此强烈地感到跟不上编程的发展。由你说出这句话尤其令人震动。你能具体解释一下吗？这种感受更多是兴奋，还是不安？

### 00:01:00

Open at 00:01:00 从此处播放

English

Uh yeah, mixture of both for sure. Uh well, first of all, um I guess like as many of you I've been using agentic tools like Alpha code adjacent things uh for a while, maybe over the last year as it came out. And it was very good at, you know, chunks of code. And sometimes it would mess up and you have to edit them, and it was kind of helpful. And then I would say December was this uh clear point where for me uh I was on a break, so I had a bit more time. I think many other people were similar. And uh I just start to notice that with the latest models uh the chunks just came out fine. And then I kept asking for more, and just came out fine. And then I can't remember the last time I corrected it. And then I was I just uh you know, trusted the system more and more. And then I was vibe coding.

简体中文

两者都有。首先，和在座许多人一样，过去一年里，随着相关工具逐渐出现，我一直在使用 AlphaCode 一类的智能体式编程工具。起初，它们很擅长生成局部代码，但有时会出错，需要人工修改，因此总体上只是“有帮助”。大约到去年十二月，对我而言出现了一个非常清晰的转折点。当时我正好休假，有更多时间尝试；我想很多人也有类似经历。我开始注意到，最新模型生成的代码块基本都能直接工作。我不断要求它完成更多内容，结果仍然正确；后来我甚至想不起上一次亲自修正它的输出是什么时候。于是，我对系统的信任逐步提高，最终进入了真正的 vibe coding 状态。

### 00:01:38

Open at 00:01:38 从此处播放

English

\>> \[laughter\] >> And uh so it was kind of a I do think that it was a very stark transition. I think that a lot of people actually I tried to I tried to stress this on uh Twitter and or X because I think a lot of people experienced AI uh last year as ChatGPT adjacent thing, uh but you really had to look again, and you had to look as of December uh because things have changed fundamentally and uh especially on this like agentic coherent workflow that really started to actually work. Um and so I would say that um yeah, it was just that realization that really uh had me um go down the whole rabbit hole of just, you know, infinity side project. Uh my side projects folder is like extremely full with lots of random things and uh just I've been coding all the time. Uh so uh yeah, that kind of happened in December, I would say.

简体中文

这确实是一次非常突兀的转变。我曾在 Twitter／X 上反复强调这一点，因为很多人去年对 AI 的体验仍然停留在“类似 ChatGPT 的聊天工具”层面。但到了十二月，必须重新审视它：情况已经发生根本变化，尤其是连贯的智能体工作流终于开始真正可用。意识到这一点后，我迅速陷入了无穷无尽的个人项目之中。我的 side-project 文件夹塞满了各种随机项目，我几乎一直在编程。对我来说，这一切大约就是从十二月开始的。

### 00:02:25

Open at 00:02:25 从此处播放

English

And I was looking at the repercussions of that since.

简体中文

从那以后，我一直在观察这场变化带来的后续影响。

## Chapter 2: Software 3.0 explained

Chapter start 章节起点： 00:02:28

### 00:02:28

Open at 00:02:28 从此处播放

English

Um you've talked a lot about this idea of LLMs as a new computer. Um that it isn't just better software, it's a whole new computing paradigm. And um software 1.0 was explicit rules, software 2.0 was learned weights, software 3.0 is this. Um if that's actually true, what does a team build differently the day they actually believe this? Right. So uh yeah, exactly. So software 1.0 I'm writing code, software 2.0 I'm actually programming by creating data sets and training uh training neural networks. So the programming is kind of like arranging data sets and maybe some objectives and neural network architectures. And then what happened is that basically if you train one of these GPT models or LLMs on a sufficiently large set of tasks implicit basically implicitly because by training on the internet you have to multitask all the things that are in the data set. Uh these actually become kind of like a

简体中文

你经常谈到“LLM 是一种新计算机”这一观点：它不只是更好的软件，而是一种全新的计算范式。Software 1.0 是显式规则，Software 2.0 是学习得到的权重，Software 3.0 则是当前这种形态。假如这一判断成立，那么一个团队在真正接受它的当天，应该以何种不同方式构建产品？——确实如此。Software 1.0 是由我直接编写代码；Software 2.0 则是通过构造数据集、训练神经网络来进行编程，此时“编程”表现为组织数据集、设定目标函数以及设计神经网络架构。随后发生的事情是：当一个 GPT 模型或 LLM 在足够广泛的任务集合上训练时——互联网训练数据本身隐含了大量多任务学习——它在某种意义上就变成了一台可编程计算机。

### 00:03:19

Open at 00:03:19 从此处播放

English

programmable computer in a certain sense. So software 3.0 is kind of about uh you know, your programming now turns to prompting and what's in the context window is your lever over the interpreter that is the LLM that is kind of like interpreting your context and uh performing computation in the digital digital information space. So I guess um yeah, that's kind of the transition and I think there's a few examples of that really drove it home for me and maybe that might be instructive. Uh so for

简体中文

Software 3.0 的核心在于：编程活动转向 prompting，而 context window 中的内容成为你控制“解释器”的主要杠杆。这个解释器就是 LLM，它读取上下文，并在数字信息空间中执行计算。这就是这一范式转移。我之所以真正理解它，是因为有几个具体例子给了我非常强烈的直观认识；这些例子或许也有助于说明问题。

## Chapter 3: Agents as the installer

Chapter start 章节起点： 00:03:44

### 00:03:45

Open at 00:03:45 从此处播放

English

example, when you when Open Claw came out when you want to install Open Claw, you would expect that normally this is a bash bash script like a shell script. So, run the shell script to run uh to install OpenClaw. Um but the thing is that in order to target lots of different platforms and lots of different types of computers you might run an OpenClaw, uh this these shell scripts usually ballooned up and become extremely complex. But the thing is you're still stuck in a software 1.0 universe of wanting to write the code.

简体中文

例如，当 OpenClaw 出现后，如果你要安装它，按照传统预期，通常会运行一个 Bash／shell 安装脚本。为了兼容许多不同平台和计算机环境，这类脚本往往不断膨胀，最终变得异常复杂。但无论脚本多复杂，你仍然被限制在 Software 1.0 的世界里：试图把所有安装逻辑明确写成代码。

### 00:04:09

Open at 00:04:09 从此处播放

English

And actually the OpenClaw installation is a is a copy-paste of a bunch of text that you're supposed to give to your agent. Uh so, basically it's it's a little skill of uh you know, copy-paste this and give it to your agent and it will install OpenClaw. And the reason this is a lot more powerful is you're working now in the software 3.0 paradigm where you don't have to precisely uh spell out, you know, all the individual details of that setup. The agent has its own intelligence that it packages up and then it kind of like follows the instructions and it looks at your environment, your computer, and it kind of like performs intelligent actions to make things work and debugs things in the loop. And it's just like so much more powerful, right? So, I think that's a very different kind of like way of thinking about it. It's just like, what is the piece of text to copy-paste to your agent? That's the programming

简体中文

OpenClaw 实际采用的安装方式，是复制一段文字并把它交给你的智能体。换言之，它提供了一个很小的 skill：把这些指令交给智能体，智能体就会完成安装。这种方式强大得多，因为你已经在 Software 3.0 范式中工作，不必逐项精确描述环境配置的所有细节。智能体自带一定的通用智能，会遵循指令、检查你的计算机环境、采取合适的操作使系统运行，并在执行过程中自行调试。思考方式因此发生变化：不再问“该写怎样的安装脚本”，而是问“应当复制哪段文字交给智能体”。

### 00:04:49

Open at 00:04:49 从此处播放

English

paradigm now. I think one more maybe uh

简体中文

这就是当前新的编程范式。另一个更极端的例子是 MenuGen。

## Chapter 4: MenuGen versus raw prompts

Chapter start 章节起点： 00:04:49

### 00:04:51

Open at 00:04:51 从此处播放

English

example that comes to mind that is even more extreme than that is when I was building um MenuGen. So, MenuGen is this idea where you um you come to a restaurant, they give you a menu, there's no pictures usually, so I don't know what any of these things are. Uh usually I like 30% of the things I don't have no idea what they are, 50%. So, I wanted to take a photo of the restaurant menu and to get pictures of what those things might look like in a generic sense.

简体中文

MenuGen 的设想是：你到一家餐厅，拿到的菜单通常没有图片，因此其中相当一部分菜名你并不知道具体是什么。我希望拍一张菜单照片，就能看到这些菜品通常可能呈现出的样子。

### 00:05:16

Open at 00:05:16 从此处播放

English

And so, I built I built coded this app that basically lets you upload a photo and it does all this stuff and it runs on Vercel and uh it basically re-renders the menu and it gives you like all the items and it gives you a picture that it uses an image um you know, generator uh for to basically OCR all the different titles, uh use the image generator to get pictures of them and then shows it to you.

简体中文

为此，我编写了一个应用：用户上传照片，应用部署在 Vercel 上，随后重新渲染菜单。它先通过 OCR 识别各个菜名，再调用图像生成模型为每道菜生成图片，最后把所有结果展示给用户。

### 00:05:38

Open at 00:05:38 从此处播放

English

And then I saw the software 3.0 version of this, which is which blew my mind, which is literally just take your photo, give it to Gemini, and say use Nano Banana to overlay the the things onto the menu." Uh Uh and Nana Banana basically returned an image that is exactly the picture of the menu that I took, but it actually put into the pixels, it rendered the different things in the menu.

简体中文

后来我看到了 Software 3.0 版本的实现，这让我非常震撼：只需要把菜单照片交给 Gemini，并要求它使用 Nano Banana 把菜品图像叠加到菜单上。Nano Banana 返回的仍然是我拍摄的那张菜单图片，但它直接在像素层面把相应菜品渲染进了原图。

### 00:06:00

Open at 00:06:00 从此处播放

English

And this blew my mind because actually all of my menu gen is spurious. It's working in the old paradigm that app shouldn't exist. Uh and uh yeah, the software 3.0 paradigm is a lot more kind of raw. It just um your neural network is doing more and more of the work, and your prompt or context is just the image, and the output is an image, and there's no need to have any of the app in between.

简体中文

这让我意识到，原来的 MenuGen 应用实际上是多余的。它仍然按照旧范式构建，而这个应用本身或许根本不应该存在。在 Software 3.0 范式中，神经网络承担越来越多的工作：输入上下文就是一张图片，输出也是一张图片，中间不再需要那套应用流水线。

### 00:06:23

Open at 00:06:23 从此处播放

English

Um so, I think that people have to kind of like reframe, you know, not to work in the existing paradigm of what things existed and just think about it as a speed up of what exists. It's actually like new things are available now. And going back to your programming question, it's not even I think that's also an example of working in the in the old mindset because it's not just about programming and programming becoming faster. This is more general information processing that is automatable now. So, um it's not just even about code. So, previous code worked over a kind of like structured data, right? And uh you write code over structured data. But like for example with my LLM knowledge bases project, um uh basically you get LLMs to create wikis for your organization or for you in person, etc. This is not even a program. This is not something that could exist before because there was no there was no code that would create a

简体中文

因此，人们需要重构自己的思考框架：不要只在既有范式中，把新技术理解为对旧流程的加速；现在实际上出现了全新的能力。回到“编程”这个问题，只讨论编程是否更快，本身仍然是旧思维。这里发生的是更一般的信息处理自动化，而不只是代码生成。传统代码主要作用于结构化数据；但以我的 LLM knowledge bases 项目为例，LLM 可以为组织或个人创建 wiki。过去并不存在一种普通程序，能够仅根据一组事实自动生成这样的知识库。

### 00:07:08

Open at 00:07:08 从此处播放

English

knowledge base based on a bunch of facts. But now you can just take these documents and uh basically uh recompile them in a different way, and uh reorder them, and create something that is uh new and interesting uh as a reframing of the data. And so, these are new things that weren't possible. Uh and so, I think this is uh something that I keep trying to get back to as to not only what can we do that existed that is faster now, but I think there's new opportunities of just things that couldn't be possible before. And I almost think that that's more exciting.

简体中文

现在，你可以把文档交给模型，让它以另一种方式重新编译、重新排序和组织，从而形成对原始数据的新表述。这些属于过去无法实现的新型信息处理。因此，我一直提醒自己：重要的不只是把已有事情做得更快，更在于发现此前根本不可能完成的事情。我认为后者甚至更令人兴奋。

## Chapter 5: What becomes obvious by 2026

Chapter start 章节起点： 00:07:37

### 00:07:37

Open at 00:07:37 从此处播放

English

I love the menu gen progression and dichotomy that you laid out, and I think even I'm sure many folks here followed your own progression of programming from last October to early January, February this year. If you extrapolate that further, what is the 2026 equivalent for building websites in the '90s, building mobile apps in the 2010s, building SaaS in the last cloud era?

简体中文

我很喜欢你刚才用 MenuGen 展示出的演进路径和范式对照。在座很多人应该也关注了你从去年十月，到今年一月、二月期间自身编程方式的变化。如果继续向前外推，那么 2026 年的机会，相当于 1990 年代的网站、2010 年代的移动应用，或者上一轮云计算时代的 SaaS，会是什么？

### 00:08:02

Open at 00:08:02 从此处播放

English

What will look completely obvious in hindsight that is still mostly unbuilt today? Um >> \[clears throat\] >> Well, going with the example of MenuGen, I guess. So, a lot of this code shouldn't exist and it's just neural networks doing most of the work. Um I do think that the extrapolation looks very weird because you could basically imagine I don't think I Yeah, so you could imagine completely neural computers in a certain sense. Uh you feed a raw videos like imagine a device that takes raw videos or audio into basically what's a neural net and uses diffusion to render a UI that is kind of like, you know, unique for that moment in a certain sense. And um I kind of feel like in the early days of computing actually, people were a little bit confused as to whether computers would look like calculators or computers would look like neural nets. And in '50s and '60s, it was not really obvious which way would go. And of course, we

简体中文

今天仍然几乎没有被构建、但事后回看会显得极其明显的东西是什么？——沿用 MenuGen 的例子，很多现有代码其实不应该存在，主要工作应当直接由神经网络完成。继续外推会得到一种非常陌生的图景：可以设想某种“完全神经化的计算机”。例如，一台设备直接接收原始视频或音频，由神经网络处理，再通过 diffusion 为当下情境实时渲染独特的用户界面。计算机发展的早期，人们其实并不确定计算机会更像计算器，还是更像神经网络；在 20 世纪五六十年代，技术路线并没有今天看起来那么显然。后来我们选择了计算器式路径，建立了经典计算体系。

### 00:08:52

Open at 00:08:52 从此处播放

English

went down the calculator path and ended up building classical computing and then neural nets are currently running virtualized on existing computers. But you could imagine I think that a lot of this will flip and that the neural net becomes kind of like the host process. And the CPUs become kind of like the co-processor. So, we saw the diagram of, you know, intelligence compute is going to neural networks is going to take over and become the dominant spend of flops.

简体中文

当前的神经网络只是虚拟化地运行在既有计算机之上。但未来这种主从关系可能反转：神经网络成为 host process，而 CPU 退居 co-processor。我们已经看到，越来越多的智能计算负载正转移到神经网络，它们将占据 FLOPs 支出的主体。

### 00:09:14

Open at 00:09:14 从此处播放

English

So, you could imagine something really weird and foreign when where neural nets are doing most of the heavy lifting, they're using tool use as just like, you know, historical appendage for some kinds of like deterministic tasks. But what's really running the show is these neural nets that are networked in a certain way. Um so, you can imagine something extremely foreign as the extrapolation, but I think we're going to probably get there sort of piece by piece.

简体中文

因此，可以设想一种极其陌生的系统：大部分核心工作由相互联网的神经网络完成，传统 tool use 只作为历史遗留接口，用于少数要求确定性的任务。真正主导系统运行的是这些经过特定连接和编排的神经网络。长期外推的终点可能非常异质，但现实中大概会逐步、分阶段地走向那里。

### 00:09:37

Open at 00:09:37 从此处播放

English

And I don't Yeah, I don't that that progression is TBD, I would say. >> \[snorts\]

简体中文

至于具体演进路径，目前仍然是 TBD（尚待确定）。

## Chapter 6: Verifiability and jagged intelligence

Chapter start 章节起点： 00:09:41

### 00:09:41

Open at 00:09:41 从此处播放

English

\>> I'd love to talk a little bit about um, uh, this concept of verifiability. The fact that AI will automate faster and more easily domains where the output can be verified. Um, if that framework is right, what work is about to move much faster than people realize? And what professions do we have that people actually think are safe, but they're actually highly verifiable?

简体中文

我想进一步讨论 verifiability（可验证性）。AI 会更快、更容易地自动化那些输出能够被验证的领域。假如这一框架成立，哪些工作即将以超出人们预期的速度发展？又有哪些职业现在被认为相对安全，实际上却具有很强的可验证性？

### 00:10:03

Open at 00:10:03 从此处播放

English

Uh, yes, so I I spent uh, some time writing about verifiability and um, basically like traditional computers can easily automate what you can specify in code. And uh, kind of this latest round of LLMs can easily automate what you can uh, verify in a certain in a certain sense. Uh, because the way this works is that when frontier labs are training these LLMs, these are giant reinforcement learning environments. So, they are given a verification rewards. And then because of the way that these models are trained, they end up basically uh, progressing and creating these like jagged entities that really peak in capability in kind of like verifiable domains like math and code and adjacent.

简体中文

我花了一些时间思考和写作可验证性。传统计算机容易自动化那些能够用代码明确指定的任务；而这一代 LLM 更容易自动化那些能够被验证的任务。原因在于，前沿实验室训练 LLM 时，实际上构建了大规模 reinforcement learning 环境，并向模型提供可验证的奖励信号。受这种训练机制影响，模型会形成高度不均匀、呈锯齿状的能力分布：在数学、代码及其邻近的可验证领域达到很高峰值。

### 00:10:39

Open at 00:10:39 从此处播放

English

And kind of like stagnate and are a little bit um, you know, rougher on the edges when uh, things are not kind of like in that in that space. So, I think the reason I wrote about verifiability is I'm trying to understand why these things are so jagged. Um, and some of it has to do with how the labs train the models, but I think some of it also has to do with um, the focus of the labs and what they happen to put into the data distribution. Uh, because some things basically are significantly more valuable in economy and end up creating more environments because the labs wanted to work in those settings. So, I think code is a good example of that. There's probably lots of verifiable environments they could think about that happen not to make it into the mix because they're just not that useful to have the capability around.

简体中文

一旦离开这些领域，能力进展往往停滞，边缘表现也更粗糙。我写“可验证性”，就是为了理解这种 jaggedness 从何而来。一部分原因是实验室的训练方法，另一部分则是实验室选择关注什么、把什么纳入数据分布。某些能力在经济上价值更高，因此实验室愿意为它们建立更多训练环境；代码就是典型例子。理论上还可以设计许多其他可验证环境，但如果对应能力没有足够商业价值，它们可能根本不会被加入训练组合。

### 00:11:15

Open at 00:11:15 从此处播放

English

Um, but I think to me the big um, I guess like the big mystery is uh, the favorite example for a while was that how many letters are are in a strawberry? And the models would famously get this wrong and it's an example of jaggedness. Uh, the models now patch this, I think, but the new one is I want to go to a car wash to wash my car, and it's 50 m away, should I drive or should I walk? And state-of-the-art models today will tell you to walk because it's so close. How is it possible that state-of-the-art Opus 4.7 will simultaneously refactor a 100,000 like >> \[laughter\]

简体中文

过去常用的锯齿能力示例是：模型会答错 strawberry 中有几个字母 r。现在这个问题似乎已经被修补。新的例子是：我要开车去洗车店，而洗车店只有 50 米远，我应该开车还是步行？当前最先进的模型会因为距离很近而建议步行。问题在于，它忘记了任务的目的正是去洗车。与此同时，同一个最先进的模型却可能重构一个十万行代码库。

### 00:11:48

Open at 00:11:48 从此处播放

English

\>> code base a line code base or find zero-day vulnerabilities and yet tells me to walk to this car wash? This is insane. And to whatever extent these models are remain jagged, it's an indication that number one, maybe something slightly off. Or number two, you need to actually be in the loop a little bit and you need to treat them as tools and you do have to kind of stay in touch with what they're doing. And so I think all of my writing, long story short, about verifiability is just trying to understand um why these things are jagged, is there any pattern to it? And I think it's a some kind of combination of verifiable plus labs care. Maybe one more anecdote that is instructive is from GPT-3.5 to GPT-4, people noticed that chess improved a lot and I think a lot of people thought, oh well, it's just a progression of the capabilities.

简体中文

它甚至能够发现 zero-day vulnerability，却会建议你步行去洗车，这显然极不协调。只要模型仍然具有这种锯齿性，就意味着两种可能：第一，系统的某些部分仍有根本缺陷；第二，人在实际使用中仍需保持 in the loop，把它当作工具，并持续了解它正在做什么。简言之，我关于可验证性的写作，是试图寻找这种锯齿能力背后的规律。我目前的判断是，它由“任务可验证”与“实验室是否重视该能力”共同决定。另一个有启发性的例子是，从 GPT-3.5 到 GPT-4，很多人注意到模型的国际象棋能力显著提升，并把它理解为一般能力自然进步。

### 00:12:36

Open at 00:12:36 从此处播放

English

But actually it's it's more that I think this is public information, I think I saw it on the internet. Um a huge amount of like data of chess made it into the pre-training set. And just because it's in the data distribution, basically the model improved a lot more than it would just by default. So someone at OpenAI decided to add this data and now you have a capability that just peaked a lot more. And so that's why I think I'm stressing this dimension of it as we are slightly at the mercy of whatever the labs are doing, whatever they happen to put into the mix and you have to actually explore this thing that they give you that has no manual and it works in certain settings but maybe not in some settings and you have to kind of explore it a little bit and if you're in the circuits that were part of the RL, you fly and if you're in the circuits that are out of the data distribution, you're going to

简体中文

但更具体的原因可能是——据我看到的公开信息——大量棋局数据被加入了 pre-training 数据集。仅仅因为这类数据进入了训练分布，模型的棋力提升就远大于默认尺度。也OpenAI 内部有人决定加入这些数据，于是某项能力出现了显著峰值。这也是我强调训练分布这一维度的原因：我们在一定程度上受制于实验室把什么放进模型。实验室交给用户的是一种没有说明书的系统，它在某些场景有效，在另一些场景却未必有效，因此你必须自行探索。如果你的应用恰好落在 RL 覆盖的能力回路中，效果会非常强；如果落在训练分布之外，就会遇到困难。

### 00:13:23

Open at 00:13:23 从此处播放

English

struggle and you have to kind of figure out which which circuits you're in in your application. And if you and if you're not in the circuits, then you have to really look at fine-tuning and doing some of your own work because it's not going to necessarily come out of the LLM out of the box. I'd love to come back to the concept of jagged intelligence in a little bit. Um

简体中文

你必须判断自己的应用位于哪些能力回路中。若不在模型已经强化过的区域，就需要认真考虑 fine-tuning 或自行构建训练与评测，因为相应能力不一定能由通用 LLM 开箱即用地提供。稍后我们还会回到 jagged intelligence 这个概念。

## Chapter 7: Founder advice and automation

Chapter start 章节起点： 00:13:39

### 00:13:40

Open at 00:13:40 从此处播放

English

if you were a founder today and thinking about building a company, you are trying to solve a problem that you think is tractable, something that uh is a domain that is verifiable, but you look around and you think, "Oh my gosh, well the labs have really really started uh got getting to escape velocity and the ones that seem most obvious, math, coding, and others." What would your advice be to to the founders in the audience?

简体中文

假设你今天是一名创业者，正在寻找一个可解决、可验证的领域；但你看到前沿实验室已经在数学、编程等最明显方向上迅速取得突破，似乎进入了“逃逸速度”。你会给现场创业者什么建议？

### 00:14:06

Open at 00:14:06 从此处播放

English

Um So, I think maybe that comes to the previous question of I do think that verifiability because it um Let me think. So, verifiability makes something tractable in the current paradigm because you can throw huge amount of RL at it. Um So, maybe one way to see it is that uh that remains true even if the labs are not focusing on it directly. So, if you are in a a verifiable setting where you could create these RL environments or examples, then that actually sets you up to potentially do your own fine-tuning and you might benefit from that. But, that is fundamentally technology that just works. You can pull a lever. If you have huge amount of diverse data sets of RL environments, etc., uh you can use your favorite fine-tuning framework and um and uh pull the lever and get something that actually uh works pretty well. So, um I don't know what the examples of this might be. Um but I do think there are some very

简体中文

这可以回到前一个问题。可验证性之所以重要，是因为在当前范式中，只要能够构造验证信号，就可以投入大量 RL，使问题变得可处理。即使前沿实验室没有直接聚焦某个领域，这一点仍然成立。如果你所在的场景能够建立 RL 环境和训练样本，那么你就具备自行 fine-tuning 的条件，并可能获得明显收益。这是一套已经可用的技术杠杆：只要拥有大量、多样化的 RL 环境数据，就可以利用合适的微调框架进行训练，通常能得到相当有效的系统。具体领域有哪些，我暂时不便直接给出答案，但我确实认为存在一些非常有价值、尚未被充分利用的强化学习环境。

### 00:14:56

Open at 00:14:56 从此处播放

English

valuable uh reinforcement learning environments that people could think of that I think are not part of the Yeah, I don't want to give away the answer, but there is one domain that I think is very uh Oh, okay. Sorry. I don't mean to vague post on on the stage, but uh there are some examples of this. On the flip side, what do you think still feels automatable only from a distance?

简体中文

我不想在台上故意含糊其辞，但的确有这样的例子。反过来说，哪些事情只是远看似乎能自动化，真正实施时却仍然困难？

### 00:15:15

Open at 00:15:15 从此处播放

English

I do think that ultimately almost everything can be made uh verifiable to some extent, some things easier than others. Um because even for like things that are like writing or so on, you can imagine having a council of LLM judges and probably get get to some get something reasonable out of the from from this kind of an approach. So, it's more about what's easy or hard.

简体中文

从终局看，我认为几乎一切都能在某种程度上被转化为可验证问题，只是难度不同。即使是写作等主观任务，也可以设想由多个 LLM judge 组成评审委员会，从而产生某种足够合理的反馈信号。因此，区别更多在于验证容易还是困难。

### 00:15:36

Open at 00:15:36 从此处播放

English

Um So, I I do think that ultimately um Uh yeah, I think uh Everything. >> \[laughter\] >> Everything is automatable. Amazing. Okay. Um so, last year you

简体中文

所以从长期看，我的回答大概是：所有事情都可以自动化。——很好。那么，去年你提出了……

## Chapter 8: From vibe coding to agentic engineering

Chapter start 章节起点： 00:15:46

### 00:15:48

Open at 00:15:48 从此处播放

English

coined the term vibe coding and today we're in a world that feels a little bit more serious, more agentic engineering. What do you think is the difference between the two and what would you actually call what we're in today? Uh yeah, so I would say vibe coding is about raising the floor for everyone in terms of what they can do in software. So, the floor rises, everyone can vibe code anything, and that's amazing, incredible. But then I would say agentic engineering is about preserving the quality bar of what existed before in professional software. So, you're not allowed to introduce uh vulnerabilities due to vibe coding. Um you are um you're still responsible for your software just as before, but can you go faster? And spoiler is you can, but how do you how do you do that properly? And so, to me agentic engineering when I I call it that because I do think it's kind of like an engineering discipline. You have

简体中文

去年你提出了 vibe coding，而今天我们似乎进入了一个更严肃的阶段，更接近 agentic engineering。二者有什么区别？你会如何定义当前所处的阶段？——我认为，vibe coding 的作用是提高所有人在软件领域能够达到的最低能力水平：能力下限整体上升，任何人都可以通过自然语言快速做出软件，这非常了不起。但 agentic engineering 则要求在提高速度的同时，保持专业软件原有的质量门槛。你不能因为采用 vibe coding 就引入安全漏洞；软件责任仍然由你承担，标准与过去相同。问题只是：能否更快？答案是可以，但关键在于怎样以正确方式实现。因此我把它称作 agentic engineering，因为它确实是一门工程学科。

### 00:16:31

Open at 00:16:31 从此处播放

English

these agents which are these like spiky entities, they're a bit fallible, a little bit stochastic, but they are extremely powerful. And it's how do you how do you coordinate them to go faster without sacrificing your quality bar? And doing that well and correctly um is the the realm of agentic engineering. Um so, I kind of see them as as different. Like one is about maybe raising the raising the floor, and the other is about um you know, extrapolating. And what I'm seeing I think is there is a very high ceiling on agent engineer uh capability. And you know, people used to talk about the 10x engineer previously. I think that this is uh magnified a lot more. Uh 10x is uh is not uh the speed up you gain. Um and I think uh it does seem to me like people who are very good at this um peak a lot more than 10x uh from from my perspective right now. I really like that framing. Um one thing that when Sam Altman came to

简体中文

你面对的智能体能力很强，但分布尖锐、会犯错，而且具有一定随机性。Agentic engineering 研究的是：如何协调这些智能体，在不降低质量标准的条件下显著提高开发速度。我因此把二者看作不同方向：vibe coding 主要抬高能力下限；agentic engineering 则继续向上扩展专业能力上限。目前我看到的 agent engineer 能力上限非常高。过去人们常谈“10x engineer”，但这里的放大效应可能远高于十倍；从我现在的观察看，真正精通这种工作方式的人，生产力提升远不止 10x。

### 00:17:23

Open at 00:17:23 从此处播放

English

AI sent last year, one memorable thing he said was that people of different generations use ChatGPT differently. So, if you're in your 30s, you use it as a Google search replacement, but if you're in your teens, ChatGPT is your gateway to the internet. What is the parallel here in coding today? If we were to watch two people code using open claw, cloud code, codex, one you'd consider mediocre at it and one you would consider fully AI native, how would you describe the difference?

简体中文

去年 Sam Altman 参加 AI Ascent 时说过一件令人印象深刻的事：不同年龄段的人使用 ChatGPT 的方式不同。三十多岁的人可能把它当作 Google Search 的替代品，而青少年可能把 ChatGPT 当作进入互联网的主要入口。今天在编程领域，对应的差异是什么？假设我们观察两个人使用 OpenClaw、Claude Code 或 Codex，其中一个水平普通，另一个完全 AI-native，他们的表现会有哪些区别？

### 00:17:51

Open at 00:17:51 从此处播放

English

I \[clears throat\] mean, I think it's just trying to get the most out of the tools that are available, utilizing all of their features, investing into your own kind of setup. So, just like previously, all the engineers are used to basically getting the most out of the tools you use, either it's Vim or VS Code or now it's you know, cloud code or codex or so on. So, um just investing into your setup and utilizing a lot of the, you know, tools that are available to you.

简体中文

本质上，是能否把现有工具的能力充分释放出来：是否使用其全部功能，是否持续投入并优化自己的工作环境。过去优秀工程师会深入掌握 Vim、VS Code 等工具；现在同样需要深入配置和理解 Claude Code、Codex 等智能体工具。差别主要体现在是否认真建设自己的 setup，并充分利用工具所提供的能力。

### 00:18:18

Open at 00:18:18 从此处播放

English

Um and I think it just kind of looks like that. I do think that maybe related thought is um a lot of people are maybe hiring for this, right? Because they want to hire strong agentic engineers. I do think that what I'm seeing is that the, you know, most people are still not refactored their their hiring process for agentic engineer capability, right? Like if you're giving out puzzles to solve, then this is still the old paradigm. I would say that hiring have to has to look like give me a really big project and see someone implement that big project. Like let's write, say a Twitter clone for agents and then make it really good, make it really secure, and then have some agents simulate some activity on this Twitter. And then I'm going to use 10 codex 5.4 x high to try to break your break your this website that you deployed and

简体中文

另一个相关问题是招聘。许多公司希望招到优秀的 agentic engineer，但多数招聘流程尚未针对这种能力完成重构。如果面试仍然只是让候选人解一道算法谜题，那依旧属于旧范式。更合理的方式应该是给出一个大型项目，观察候选人如何借助智能体完整实现。例如，为智能体构建一个类似 Twitter 的系统，要求它功能完善且安全；再让一些智能体在其中模拟真实活动。随后，我可以调度十个高推理强度的 Codex 实例，尝试攻击候选人部署的网站。

### 00:19:14

Open at 00:19:14 从此处播放

English

they're going to try to basically break it and they should not be able to break it. And so maybe it looks like that, right? And so yeah, watching people in that that setting and building some bigger projects and utilize utilizing the tooling is maybe what I would look at for the most part. And as agents do more, what human skill do you think becomes more valuable, not less?

简体中文

这些攻击智能体应当无法突破系统。相比传统小题，观察候选人在这种环境下完成大型项目、组织工具和验证质量，可能更能反映 agentic engineering 能力。随着智能体承担越来越多工作，哪些人类技能会变得更重要，而不是更不重要？

### 00:19:35

Open at 00:19:35 从此处播放

English

Also, yeah, it's a good question. I think um Well, right now the answer is that the agents are catalog these internal entities, right? So it's remarkable um you basically still have to be in charge of the aesthetics, the the judgment, the taste, and a little bit of oversight. And maybe one one of my favorite examples of like the the weirdness of agents is um for menu gen, you sign up with a Google Google account, but you purchase credits using a Stripe account and both of them have email addresses.

简体中文

目前的答案是：人仍然需要负责审美、判断、taste 和一定程度的监督。智能体是一种内部行为并不均匀的实体。以 MenuGen 为例，用户通过 Google 账户登录，却通过 Stripe 账户购买 credits；两边都有 email address。

### 00:20:05

Open at 00:20:05 从此处播放

English

And my agent actually tries to basically um like when you purchase credits, it assigned it using the email address from Stripe to the Google email address. Like there wasn't a persistent user ID that that for people. It was trying to match up the email addresses, but you could use different email address for your Stripe and your Google and basically would not associate the funds. And so this is the kind of thing that these agents still will make mistakes about.

简体中文

我的智能体在处理充值时，竟试图通过 Stripe 邮箱与 Google 邮箱来匹配用户，而没有建立一个持久、唯一的 user ID。用户完全可能在 Stripe 和 Google 中使用不同邮箱，此时购买的 credits 就无法正确归属。这正是智能体目前仍会犯的错误类型。

### 00:20:30

Open at 00:20:30 从此处播放

English

It's like why would you use email addresses to try to cross-correlate the funds? They can be arbitrary. You can use different emails, etc. Like this is such a weird thing to do. So I think people have to be in charge of this spec, this plan, and actually don't even like the plan mode. I would I mean, obviously it's very useful, but I think there's something more general here where you have to work with your agent to design a spec that is very detailed and maybe it's a maybe basically the docs and then get the agents to write them. And you're in charge of the oversight and the top-level categories, but the agents are doing a lot of the under the hood. And so I think you're not caring about some of the details. So as an example also with um, a race or tensors in neural networks, um, there's a ton of details between PyTorch and NumPy and all the different like pandas and so on for all the different little API details. And

简体中文

为什么要用邮箱地址跨系统关联资金？邮箱是任意的，也可以不同。这是一种非常奇怪的设计。因此，人必须负责 specification 和整体方案。我甚至认为，单独的 plan mode 仍不足以概括这种工作：你需要与智能体共同形成一份足够详细的 specification，可能最终表现为完整文档，再让智能体按照文档实现。人负责监督和顶层类别，智能体负责大量底层细节。于是，某些 API 细节已经不再需要人记忆。例如在神经网络 tensor 操作中，PyTorch、NumPy、pandas 等库有大量细微差别。

### 00:21:17

Open at 00:21:17 从此处播放

English

I'll I already forgot about the keep dims versus keep dim or whether it's dim or axis or reshape or permute or transpose. I don't remember this stuff anymore, right? Because you don't have to. This is the kind of details that are handled by the intern because they have very good recall. And but you still have to know for example that um, you know, there's underlying tensor, there's an underlying view and then you can view of the same storage or you can have different storage which will be less efficient. As we still have to have an understanding of what this stuff is doing and some of the fundamentals um, so that you're not copying memory around unnecessarily and so on. But uh, the details of the APIs are now handed off.

简体中文

我已经记不清 \`keepdims\` 还是 \`keepdim\`、参数叫 \`dim\` 还是 \`axis\`，也不会记住该用 \`reshape\`、\`permute\` 还是 \`transpose\`。这些细节可以交给记忆能力很强的“实习生”——也就是智能体。但你仍然必须理解 tensor 的底层 storage 和 view：某个操作是共享同一存储的视图，还是创建了新的存储；后者可能效率更低。也人仍需掌握系统原理和基础，以免产生不必要的内存复制；只是具体 API 拼写可以委托给智能体。

### 00:21:52

Open at 00:21:52 从此处播放

English

So it um, you're in charge of the taste, the engineering, the design uh, and that it makes sense and that you're asking for the right things and that you're saying that okay, that these have to be unique user IDs that we're going to tie everything to. Um, and so you're doing some of the design and development and the engineers are doing the fill in the blanks. And that's currently kind of like where we are and I think that's what everyone of course is seeing I think right now. Do you think there's a chance that this um, taste and judgment matters less over time or will the ceiling just keep rising?

简体中文

因此，人负责 taste、工程、设计以及整体合理性；负责提出正确问题，并明确诸如“所有关联必须建立在唯一 user ID 上”这样的关键约束。人完成系统设计与方向选择，智能体补齐实现细节。这大致就是当前状态。未来 taste 与 judgment 是否会逐渐不再重要，还是能力上限会继续上升？

### 00:22:21

Open at 00:22:21 从此处播放

English

Um, yeah, it's a good question. I would say um, I mean I'm hoping that the that it improves. I think probably the reason it doesn't improve right now is again it's not part of the RL. There's probably no aesthetics cost or reward or it's not good enough or something like that. Um, I do think that when you actually look at the code, sometimes I get a little bit of a heart attack because it's not like super amazing code necessarily all the time and it's very bloated and there's a lot of copy-paste and there's awkward abstractions that are brittle and like it works but it's just really gross. Um, and I do I do hope that this can improve in future models. Um, a good example also is this uh, you know, the micro GPT project uh, which where I was trying to simplify uh LLM training to be as simple as possible. The models hate this. They can't do it. I tried to I keep I kept trying to prompt an LLM to simplify

简体中文

这是一个好问题。我当然希望模型在这方面也会改善。现在进步有限，可能还是因为审美质量没有被纳入 RL：训练中缺少合适的 aesthetics cost／reward，或者奖励模型还不够好。实际查看智能体生成的代码时，我有时会非常紧张：代码未必优雅，经常很臃肿，有大量复制粘贴，抽象结构别扭而脆弱。它可以运行，但整体非常粗糙。我希望未来模型能改进这一点。microGPT 项目就是一个很好的例子：我试图把 LLM 训练过程简化到极致，但模型非常不擅长这件事。我不断要求 LLM 继续简化。

### 00:23:11

Open at 00:23:11 从此处播放

English

more, simplify more, and it just can't You feel like you're outside of the RL circuits. It feels like it you're obviously, you know, you're pulling teeth. It's not like light speed. So, I think um I do think that people are still remain in charge of this, but I do think that there's nothing fundamental again that's preventing it. It's just the labs haven't done it yet almost.

简体中文

但它就是无法做到。你会明显感觉自己处于 RL 覆盖范围之外，整个过程像是在强行拔牙，而不是以极高速度前进。因此，目前人仍然负责这种极致简化与品味判断。不过我不认为存在不可逾越的根本障碍；更像是实验室尚未针对它完成训练。

### 00:23:30

Open at 00:23:30 从此处播放

English

Yeah. So, I'd love to come back to this idea of uh jagged forms of intelligence. You wrote a little bit about this with uh very thought-provoking piece around animals versus ghosts. Um and the idea is that we're not building animals. We are summoning ghosts. Um and these are jagged forms of intelligence that are shaped by data and reward functions, but not by intrinsic motivation or fun or curiosity or empowerment, uh things that kind of came about via evolution.

简体中文

我们再回到 jagged intelligence。你曾写过一篇很有启发性的文章，把“animals”与“ghosts”相对照：我们并不是在构建动物，而是在召唤幽灵。这些智能具有锯齿状能力，是由数据和 reward function 塑造的，却没有动物经由进化形成的 intrinsic motivation、乐趣、好奇心或 empowerment。

### 00:24:00

Open at 00:24:00 从此处播放

English

Um why does that framing matter? And what does it actually change about how you build and deploy and evaluate or even trust them? Uh yes, so Yeah, I think the reason I wrote about this is because I'm trying to wrap my head around what these things are, right? Because if you have a good model of what they are or are not, then you're going to be more competent at uh using them. Um and I do think that um I don't know if it has I'm not sure if it actually has like real power.

简体中文

这种框架为什么重要？它会如何改变我们构建、部署、评估乃至信任模型的方式？——我提出这一框架，是为了更好理解这些系统究竟是什么、又不是什么。只有形成更准确的心智模型，用户才能更胜任地使用它们。不过我也不确定这种哲学框架是否能直接产生非常具体的工程能力。

### 00:24:28

Open at 00:24:28 从此处播放

English

\>> \[laughter\] >> I think it's a little bit of philosophizing. But I do think that um I think it's just um coming to terms with the fact that these things are not, you know, animal intelligences. Like if you yell at them, they're not going to work better or or worse or it doesn't have any impact. Um and uh it's all just kind of like these statistical simulation circuits where the the substrate is pre-training, so like statistics. And then but then there's RL bolting on top, so it kind of like increases the disadvantages and um maybe it's just kind of like a mindset of what I'm coming into or what's likely to work or not likely to work or how to modify it, but I don't actually I don't know that I have like here are the five obvious outcomes of how to make your system better. It's more just being suspicious of it and um figuring out over time.

简体中文

它确实带有一定哲学思辨色彩。但关键是承认：这些系统不是动物式智能。对它们吼叫不会让它们工作得更好或更差，也不会产生真正的心理影响。它们更像一组统计模拟回路：底层基质是 pre-training 所形成的统计结构，随后又叠加了 RL，使某些能力优势进一步放大。这种理解主要帮助我们建立正确预期：什么方法可能有效、什么可能无效、应如何修改系统。我并不能给出“五条立刻改进系统的方法”；更重要的是保持怀疑，持续通过实践理解它。

### 00:25:16

Open at 00:25:16 从此处播放

English

That's where it starts. Okay, so you are

简体中文

这只是起点。接下来，你已经非常深入地在使用……

## Chapter 9: Agents everywhere, education, and learning

Chapter start 章节起点： 00:25:17

### 00:25:18

Open at 00:25:18 从此处播放

English

so deep in working with agents that don't just chat. They have real permissions. They have local contacts. They actually take action on your your behalf. What does the world look like when we all start to live in that world? Yeah, I think I think a lot of people probably here are excited about what this agentic you know, native agentic environment looks like and everything has to be rewritten. Everything is still fundamentally written for humans and has to be moved around. I still use most of the time when I use different frameworks or libraries or things like that. They still have docs that are fundamentally written for humans. This is my favorite pet peeve. Like I don't Why are people still telling me what to do? Like I don't want to do anything. What is the thing I should copy paste to my agent?

简体中文

你正在使用的不只是聊天型智能体。它们拥有真实权限、能够访问本地上下文，并且会代表你采取行动。当所有人都开始生活在这样的环境中，世界会是什么样？——我想，现场很多人都对真正 agent-native 的环境感到兴奋。几乎所有基础设施都需要重写，因为今天的一切本质上仍然面向人类。每当我使用框架或软件库时，文档基本都是写给人的。这是我最常抱怨的事情：为什么还在告诉我本人应该做什么？我不想亲自做这些操作；我需要知道的是，应该把哪段内容复制给我的智能体。

### 00:26:00

Open at 00:26:00 从此处播放

English

\>> \[laughter\] >> So it's just every time I'm told, you know, go to this URL or something like that. It's just like ah. >> \[laughter\] >> You know. >> \[snorts\] >> So um everyone is I think excited about how do we decompose the workloads that need to happen into fundamentally sensors over the world, actuators over the world. How do we make it agent native? Basically describe it to agents first. Um and then I have a lot of automation around you know, the Yeah, around data structures that are very legible to the LLMs.

简体中文

每当文档要求我访问某个 URL、进入某个设置页面，我都会感到非常低效。未来需要把工作负载分解成遍布现实与数字环境的 sensors 和 actuators，并让整个系统优先面向智能体：首先用智能体可理解、可执行的方式描述任务。我自己也已经构建了很多自动化，并尽量使用对 LLM 高度可读的数据结构。

### 00:26:32

Open at 00:26:32 从此处播放

English

So I think yeah, I'm hoping that there's a lot of agent first infrastructure out there and that you know, for MenuGen famously when I wrote the not I'm not sure how famously, but when I wrote the blog post about MenuGen \[laughter\] a lot of the work a lot of the trouble was not even writing the code for MenuGen. It was deploying it on Vercel because I had to work with all these different services and I just string them up and I just go to their settings and the menus, and you know, configure my DNS, and it was just so annoying. And so, that's a good example of I would hope that MenuGen that I could give a prompt to an LLM, build MenuGen, and then I didn't have to touch anything, and it's deployed in that same way on the internet. I think that would be a good kind of a test for whether or not a lot of our infrastructure is becoming more and more agent native. And then ultimately, I would say

简体中文

我希望出现更多 agent-first infrastructure。以 MenuGen 为例，真正麻烦的部分甚至不是编写应用，而是部署到 Vercel：要连接多个服务、进入各自的设置菜单、配置 DNS，整个过程非常烦琐。理想状态是，我只需对 LLM 说“构建 MenuGen”，随后不再进行任何手工操作，系统便自动完成开发、配置并部署到互联网。这可以作为判断基础设施是否真正 agent-native 的一个测试。

### 00:27:17

Open at 00:27:17 从此处播放

English

yeah, I I do think we're going towards a world where there's agent representation for people and for organizations, and um you know, I'll have my agent talk to your agent to figure out some of the details of our meetings or things like that. So, >> \[laughter\] >> um I do think that that's roughly where things are going, but um yeah, I think everyone here is excited about that. I really like the visual analogy of sensors and actuators. I actually hadn't thought of that. That's super interesting.

简体中文

更进一步，我认为未来个人与组织都会拥有自己的 agent representation。我的智能体可以与另一个人的智能体协商会议时间和其他具体事项。这大致是我们正在前往的方向。——我很喜欢你用 sensors 和 actuators 描述这个世界，这个视觉化框架很有启发性。

### 00:27:43

Open at 00:27:43 从此处播放

English

\>> Right. Um okay, I think we have to end on a question about education, um because you are probably one of the very best in the world at making complex technical concepts simple and deeply thoughtful about how we design education around it. Um what still remains worth learning deeply when intelligence gets cheap as we move into the next era of AI?

简体中文

最后必须谈教育。你非常擅长把复杂技术概念解释得简洁清楚，也长期思考如何围绕新技术设计教育。当智能变得廉价、我们进入下一个 AI 时代时，还有哪些内容值得人类深入学习？

### 00:28:05

Open at 00:28:05 从此处播放

English

Yeah. Uh there was a tweet that blew my mind recently, and I keep thinking about it like every other day. It was something along the lines of um you can outsource your thinking, but you can't outsource your understanding. And um I think that's really nicely put. I so yeah, because I still I'm still part of the system, and I still I still have to somehow information still has to make it into my brain, and I feel like I'm becoming a bottleneck of just even knowing what we're trying to build, why is it worth doing, uh how do I direct you know, how do I direct my my agents, and so on. So, I do still think that ultimately something has to direct the thinking and the processing, and so on. And um that's still kind of fundamentally constrained somehow by understanding.

简体中文

最近有一条推文让我非常震动，我几乎隔几天就会想到它：‘You can outsource your thinking, but you can’t outsource your understanding.’——你可以外包思考过程，却无法外包理解。我仍然是整个系统的一部分，信息最终仍然必须进入我的大脑。我越来越感到，真正的瓶颈是：我是否理解我们要构建什么、为什么值得构建，以及如何有效指挥我的智能体。无论具体思考和处理由谁完成，最终总要有某个主体确定方向，而这种方向控制仍然受制于理解。

### 00:28:46

Open at 00:28:46 从此处播放

English

And this is one reason I also was very excited about all the all the knowledge bases because I feel like that's that's a way for me to process information. And anytime I see a different projection onto information, I always like feel like I gain insight. So, it's really just a lot of prompts for me to do synthetic data generation kind of over over some fixed data. Uh so, I I really enjoy uh whenever I read an article, I have my uh you know, my wiki that's being built up from these articles. And I love asking questions about things or um and I I think that ultimately these are tools to enhance understanding in a certain way.

简体中文

这也是我对 knowledge base 特别感兴趣的原因。它们是我处理信息的一种方式；每当看到信息被投影为另一种结构，我通常都会获得新的洞见。本质上，我是在固定数据之上通过大量 prompt 进行 synthetic data generation。每读一篇文章，我都会把内容逐渐汇入自己的 wiki，并基于这些资料提出问题。我认为，这类工具能够以某种方式增强人的理解。

### 00:29:17

Open at 00:29:17 从此处播放

English

And this is still kind of like a bit of a bottleneck because then you can't direct the uh you you can't be a good director if you still uh cuz the LLMs certainly don't excel at understanding. You still are uniquely in charge of that. So, uh yeah, I think uh tools to that effect I think are incredibly interesting and exciting. I'm excited to be back here in a couple years and to see if we've been fully automated out of the loop and they actually take care of understanding as well. Uh thank you so much for joining us, Andre. We really appreciate it.

简体中文

理解仍然是瓶颈：如果自己不理解，就无法成为优秀的指挥者，而 LLM 目前显然并不真正擅长理解。因此，人仍然独特地负责这一部分。围绕理解而设计的工具会非常重要。也许几年后我们再次见面时，人已经完全被移出回路，智能体连理解本身也接管了。——Andrej，非常感谢你参加这次对话。

### 00:29:43

Open at 00:29:43 从此处播放

English

\[applause\]

简体中文

［掌声］

## Sources 来源

1.  Source video. Primary audiovisual source; the supplied SRT is used for the transcript. 一手视频来源；全文以用户上传 SRT 为准。 https://www.youtube.com/watch?v=96jN2OCOfLs
    
2.  Sequoia Capital, AI Ascent 2026. Official event page; identifies the 2026 AI Ascent context. 官方活动页面。 https://sequoiacap.com/article/ai-ascent-2026/
    
3.  METR, Task-Completion Time Horizons. External research on agent performance across well-specified software tasks and its limitations. 关于明确软件任务上智能体能力及局限的外部研究。 https://metr.org/time-horizons/
    

## Evidence policy 证据规则

| Label | Meaning 含义 |
| --- | --- |
| Transcript | A claim or thesis stated in the uploaded captions; not independently validated merely by appearing in the interview. 上传字幕中的观点；不能因其出现在访谈中而视为已经独立证实。 |
| Official | Confirmed by an official repository, first-party page, or government source. 由官方仓库、一手页面或政府来源确认。 |
| Analysis | A reasoned synthesis or systems-design inference; explicitly not a disclosure of private implementation details. 基于公开材料的分析或系统设计推断，不代表任何未公开实现。 |

* * *

Generated from the supplied SRT on 2026-07-23. 根据用户提供的 SRT 生成。

Bilingual research edition 中英双语研究版
