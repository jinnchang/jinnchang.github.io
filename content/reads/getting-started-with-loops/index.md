+++
title = 'Loop engineering: Getting started with loops'
date = '2026-06-30T00:00:00+08:00'

description = "用 Anthropic 的 Claude Code 进行 Loop 工程化：设计轮次型、目标型、时间型和主动型 Agent Loop，让它们运行到满足停止条件。"
categories = ["Agent"]
series = ["Loop Engineering"]
authors = ["Delba de Oliveira", "Michael Segner"]

toc = true
externalLink = ""
canonicalUrl = "https://claude.com/blog/getting-started-with-loops"
disableComments = false
+++

{{< notice note >}} 了解 Claude Code 团队如何定义 Agent Loop，并获得从轮次型到目标型、时间型和主动型 Loop 逐步进阶的实用指南，以及何时使用哪一种。 {{< /notice >}}

## Loop 入门

如今，关于 Loop 工程化（或者说"设计 Loop"）而不只是给编程 Agent 写 prompt，讨论很多。如果你在 X 上花点时间，想弄清 Loop 到底是什么，会得到好几种不同的答案。

在 Claude Code 团队，我们把 **Loop 定义为 Agent 反复执行工作循环，直到满足停止条件**。我们根据以下几点来划分不同类型的 Loop：

- 它们如何被触发
- 它们如何停止
- 使用了哪种 Claude Code 基础构件
- 每种类型最适合哪类任务

我们会介绍主要的 Loop 类型、每种类型用在何时，以及如何在管理 token 用量的同时保持代码质量。并不是所有任务都需要复杂的 Loop；从最简单的方案入手，有选择地使用这些模式。

## 轮次型 Loop

![图示](di.png)

- **触发方式**：用户的一次 prompt。
- **停止条件**：Claude 判断任务已经完成，或需要补充上下文。
- **最佳适用场景**：不属于常规流程或固定时间表的较短任务。
- **如何控制用量**：编写具体的 prompt，并用 Skill 改进验证，以减少轮次。

你发出的每一个 prompt 都会启动一个手动 Loop，由你在每一轮中主导。Claude 收集上下文、采取行动、检查自己的工作、必要时重复，然后做出回复。我们把这称为 Agent Loop。

例如，让 Claude 创建一个点赞按钮。它会读取你的代码、做出修改、运行测试，再交给你一个它 *认为* 能用的结果。之后你手动检查这项工作，然后写下下一个 prompt。

你可以把手动步骤写成一份 SKILL.md，从而改进验证环节，让 Claude 能端到端地检查更多自己的工作。（关于在这类自动化中如何选择 Skill、Hook 和 Subagent，参见我们关于[引导 Claude Code](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)的指南。）

这应该包含一些工具或连接器，让 Claude 能够 *看到*、*衡量* 结果，或 *与结果交互*。检查越量化，Claude 就越容易自我验证。

例如，你可以在 SKILL.md 文件中这样规定：

```plaintext
---
name: verify-frontend-change
description: Verify any UI change end-to-end before declaring it done.
---

# Verifying frontend changes
Never report a UI change as complete based on a successful edit alone. Verify it the way a human reviewer would:

1. Start the dev server and open the edited page in the browser.

2. Interact with the change directly. For a new control (button, input, toggle): click it, confirm the expected state change, and screenshot before/after.

3. Check the browser console: zero new errors or warnings.

4. Use the Chrome Devtools MCP, run a performance trace and audit Core Web Vitals.

If any step fails, fix the issue and rerun from step 1 — do not hand back partially verified work.

```

## 目标型 Loop（`/goal`）

![](goal-based-loop-goal.png)

- **触发方式**：实时的手动 prompt。
- **停止条件**：达成目标，或达到最大轮次数。
- **最佳适用场景**：有可验证退出条件的任务。
- **如何控制用量**：设定明确的完成标准，并显式设置轮次上限，比如"尝试 5 次后停止"。

有时候，一轮是不够的，尤其是面对更复杂的任务。Agent 在能够迭代时会表现得更好。你可以用 `/goal` 定义"完成"是什么样子，从而延长 Claude 持续迭代的时间。

当你定义了成功标准后，Claude 就不必自己去判断什么是"足够好"，从而提前结束 Loop。每当 Claude 尝试停止时，会有一个评估模型来检查你的条件，让它继续工作，直到目标达成或达到你设定的轮次数。

这就是为什么像通过的测试数量或达到某个分数阈值这类确定性标准如此有效。

例如：

```plaintext
/goal get the homepage Lighthouse score to 90 or above, stop after 5 tries.

```

## 时间型 Loop（`/loop` 和 `/schedule`）

- **触发方式**：指定的时间间隔。
- **停止条件**：你手动取消，或工作完成（PR 合并、队列清空）。
- **最佳适用场景**：重复性工作，或与外部环境/系统对接的场景。
- **如何控制用量**：设置更长的间隔，或基于事件而非时间做出响应。

有些 Agent 工作是重复性的：任务不变，只有输入在变，比如每天早上汇总 Slack 消息。还有些工作依赖外部系统，与之对接的一个简单办法，就是按间隔检查并响应变化，比如一个可能会收到代码评审或 CI 失败的 PR。

对于这类工作，你可以用 `/loop` 触发 Claude 运行，它会按间隔重新执行某个 prompt。例如：

```plaintext
/loop 5m check my PR, address review comments, and fix failing CI

```

`/loop` 在你的电脑上运行，所以一旦关掉电脑它就会停止。你可以用 `/schedule` 创建一个例行任务，把 Loop 移到云端。

## 主动型 Loop

![](proactive-loops.png)

- **触发方式**：事件或时间表，全程无人工实时介入。
- **停止条件**：每个任务在达成目标时退出。例行任务本身持续运行，直到你手动关闭。
- **最佳适用场景**：重复出现且定义明确的工作：Bug 报告、问题分诊、迁移、依赖升级等。
- **如何控制用量**：把例行任务路由到更小、更快的模型，只在需要判断时才用最强大的模型。

上述基础构件，加上 **自动模式** 和 **动态工作流**（研究预览）等其他 Claude Code 功能，可以组合成一个用于长期运行的 Loop。

例如，要处理进来的反馈，你可以使用：

1. **`/schedule`**（研究预览）来运行一个检查新报告的例行任务
2. **`/goal`** 来定义"完成"是什么样子，以及 **Skill** 来记录如何验证它
3. **动态工作流** 来编排 Agent，让它们对每份报告分诊、修复并评审修复结果
4. **自动模式**，让例行任务无需中途停下请求许可即可持续运行

把这些组合起来，一个 prompt 可能是这样的：

```plaintext
/schedule every hour: check #project-feedback for bug reports. /goal: don't stop until every report found this run is triaged, actioned, and responded to. When fixing a bug, use a workflow to explore three solutions in parallel worktrees and have a judge adversarially review them.

```

## 保持代码质量

Loop 输出的质量取决于它周围的系统。在设计这个系统时：

- **保持代码库本身干净**：Claude 会遵循代码库中已有的模式和约定。
- **给 Claude 一个自我验证的途径**：用 [Skill](https://code.claude.com/docs/en/skills) 把"好"的标准固化下来，为你和团队所用。
- **让文档触手可及**：框架和库的文档里有最新的最佳实践。
- **用第二个 Agent 做代码评审**：带着全新上下文做评审的 Agent 偏见更少，也不受主 Agent 推理的影响。你可以使用内置的 `/code-review` Skill，或面向 GitHub 的 [Code Review](https://code.claude.com/docs/en/code-review)。写代码的 Loop 需要检查代码的 Loop——参见 [Anthropic 如何保障 AI 原生的 SDLC](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)。

当某个结果不达标时，别只修复这一个问题，试着把它固化下来，让系统在未来所有迭代中都能受益。

## 管理 token 用量

要管理 token 用量，Loop 应当有清晰的边界：

- **为任务选择合适的基础构件和模型**：小任务不需要多个 Agent 或多个 Loop，有些任务可以用更便宜、更快的模型。
- **定义清晰的完成与停止标准**：明确"完成"是什么样子，让 Claude 能更快找到解决方案（但又不会太快）。
- **大规模运行之前先试点**：动态工作流可能启动成百上千个 Agent。先在较小的工作切片上评估用量。
- **确定性工作交给脚本**：运行脚本比逐步推理更便宜。比如一个 PDF Skill 可以附带一个填表脚本，让 Claude 每次直接运行，而不是重新推导代码。
- **别让例行任务跑得比需要的更频繁**：让间隔匹配你所关注的事物的变化频率。
- **复盘用量**：`/usage` 命令按 Skill、Subagent 和 MCP 分解近期的用量；不带参数运行 `/goal` 会显示当前的轮次数和 token 用量；`/workflows` 会显示每个 Agent 的 token 用量，并且你可以随时停掉某个 Agent。

你对[模型和 effort 级别](https://claude.com/blog/claude-model-and-effort-level-in-claude-code)的选择，是影响 Loop 成本的最主要因素之一。

## 开始实践

总结一下：

| Loop | 你交出什么 | 何时使用 | 对应工具 |
| --- | --- | --- | --- |
| 轮次型 | 验证检查 | 你在探索或做决定 | 自定义验证 Skill |
| 目标型 | 停止条件 | 你知道"完成"是什么样子 | `/goal` |
| 时间型 | 触发条件 | 工作按时间表发生在项目之外 | `/loop`、`/schedule` |
| 主动型 | prompt | 工作是重复且定义明确的 | 以上所有，再加上动态工作流 |

要上手 Loop，可以先看看自己已经在做的工作。挑一个你成为瓶颈的任务，想想自己能交出哪一部分：你能不能写出验证检查？目标是否足够清晰？工作是否会按时间表到来？

一旦有了想法，就运行这个 Loop，观察它在哪里卡住、在哪里越界，然后大胆地去迭代。

更多信息可参阅 Claude Code 文档中关于[并行运行 Agent](https://code.claude.com/docs/en/agents)的页面，以及 [Loop](https://code.claude.com/docs/en/goal)、[Schedule](https://code.claude.com/docs/en/routines)、[Goal](https://code.claude.com/docs/en/goal) 和[动态工作流](https://code.claude.com/docs/en/workflows#orchestrate-subagents-at-scale-with-dynamic-workflows)页面。要让检查在各会话之间可复用，请参见[用 Skill 在 Claude Code 中构建验证 Loop](https://claude.com/blog/building-verification-loops-in-claude-code-with-skills)。

## 原文链接

[https://claude.com/blog/getting-started-with-loops](https://claude.com/blog/getting-started-with-loops)
