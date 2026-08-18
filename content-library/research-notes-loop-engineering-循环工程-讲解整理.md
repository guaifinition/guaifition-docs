> 来源：`Loop Engineering explained in 8min` 字幕翻译整理

## 1. 为什么出现 Loop Engineering

随着大语言模型应用的发展，工程方法不断演进。早期我们关注的是 Prompt
Engineering（提示词工程），后来出现了 Harness
Engineering（支架/编排工程），现在又出现了 Loop
Engineering（循环工程）。

它并不只是一个营销术语，而是反映了 AI Agent 系统设计方式的变化。

## 2. 从 Prompt Engineering 到 Agent 系统

提示词工程主要关注：

-   如何设计输入给模型的指令；
-   如何让模型理解任务；
-   如何获得更稳定的输出。

例如：

"你是一名友好的客服，请礼貌地帮助客户。"

这属于典型的 Prompt Engineering。

但是，随着任务复杂度增加，仅靠一次提示词已经无法满足需求。

## 3. Harness Engineering

Harness Engineering 关注的是如何围绕模型构建运行环境，包括：

-   工具调用；
-   数据访问；
-   工作流程控制；
-   状态管理。

模型本身只是系统中的一个组件，需要外部工程结构帮助它完成复杂任务。

## 4. Loop Engineering 的核心

Loop Engineering 更进一步，把 AI 系统设计成持续循环：

1.  Agent 接收目标；
2.  进行分析和规划；
3.  执行动作；
4.  检查结果；
5.  根据反馈调整策略；
6.  继续下一轮循环。

重点不再是"一次生成正确答案"，而是让系统通过多轮反馈不断改进。

## 5. 为什么需要循环

现实任务通常具有：

-   不确定性；
-   长执行周期；
-   多步骤依赖；
-   需要验证和修正。

因此，优秀的 Agent 不应该只是回答问题，而应该能够：

-   观察环境；
-   采取行动；
-   获取反馈；
-   修改计划。

## 6. Loop Engineering 的意义

Loop Engineering 代表 AI 工程从：

> 编写更好的提示词

发展到：

> 设计能够持续工作的智能系统。

未来的 Agent 会承担越来越复杂的任务，而循环机制将成为构建可靠 AI
系统的重要方式。

## 关键词

-   Prompt Engineering：提示词工程
-   Harness Engineering：AI 系统编排工程
-   Loop Engineering：循环工程
-   Agent：智能代理
-   Feedback Loop：反馈循环
