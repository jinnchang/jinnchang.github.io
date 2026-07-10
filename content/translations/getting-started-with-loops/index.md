+++
date = '2026-06-30T20:45:11+08:00'
title = 'Getting Started With Loops'
summary = "了解 Claude Code 团队如何定义代理循环，以及从回合制循环到目标驱动、时间驱动和主动式循环的实践指南——还有何时使用每种循环。"
toc = true
categories = ["Claude Code"]
series = ["Claude Code"]
originalURL = "https://claude.com/blog/getting-started-with-loops"
originalTitle = "Getting Started with Loops"
originalAuthor = "Delba"
originalDate = "2026-06-30"
externalLink = ""
disableComments = false
+++

> 了解 Claude Code 团队如何定义代理循环，以及从回合制循环到目标驱动、时间驱动和主动式循环的实践指南——还有何时使用每种循环。

现在有很多关于"设计循环"而非提示你的编码代理的讨论。如果你在 X 上花些时间试图弄清楚循环到底是什么，你会发现多种不同的答案。

在 Claude Code 团队，我们将**循环定义为代理重复工作周期，直到满足停止条件**。我们根据以下维度对几种不同类型的循环进行分类：

- 如何触发
- 如何停止
- 使用哪种 Claude Code 原语
- 每种循环最适合什么类型的任务

我们将介绍主要的循环类型、何时使用每种循环，以及如何在管理 token 用量的同时保持代码质量。并非所有任务都需要复杂的循环；从最简单的方案开始，有选择地使用这些模式。

## 回合制循环

![图](di.png)

- **触发方式**：用户提示词。
- **停止条件**：Claude 判断任务已完成或需要更多上下文。
- **最适用于**：不属于常规流程或计划的较短任务。
- **用量管理方式**：编写具体的提示词，并使用技能改进验证以减少回合数。

你发送的每一条提示词都会启动一个手动循环，由你指挥每个回合。Claude 收集上下文、采取行动、检查工作、必要时重复，然后回复。我们称之为代理循环。

例如，让 Claude 创建一个点赞按钮。它会读取你的代码、进行编辑、运行测试，然后交出它*认为*可用的结果。然后你手动检查工作，写下下一条提示词。

你可以通过将手动步骤编码为 SKILL.md 来改进验证步骤，这样 Claude 就能端到端地检查更多自己的工作。（关于在技能、钩子和子代理之间选择哪种自动化方式，请参阅我们的[驾驭 Claude Code 指南](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)。）

这应该包括让 Claude 能够*看到*、*衡量*或*交互*结果的工具或连接器。检查越量化，Claude 就越容易自我验证。

例如，在你的 SKILL.md 文件中，你可以指定：

```plain
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

## 目标驱动循环（/goal）

![目标驱动循环](goal-based-loop-goal.png)

- **触发方式**：实时的手动提示词。
- **停止条件**：目标达成或达到最大回合数。
- **最适用于**：具有可验证退出条件的任务。
- **用量管理方式**：设定具体的完成条件和明确的回合上限，例如"5 次尝试后停止"。

有时，单个回合是不够的，尤其是对于更复杂的任务。代理在能够迭代时表现更好。你可以通过 /goal 定义"完成"的样子来延长 Claude 的迭代时间。

当你定义了成功标准，Claude 就不必自行判断什么是"足够好"而过早结束循环。每次 Claude 尝试停止时，评估模型会检查你的条件，并将其送回继续工作，直到目标达成或达到你定义的回合数。

这就是为什么确定性标准——例如通过的测试数量或达到某个分数阈值——如此有效。

例如：

```plain
/goal get the homepage Lighthouse score to 90 or above, stop after 5 tries.
```

## 时间驱动循环（/loop 和 /schedule）

- **触发方式**：指定的时间间隔。
- **停止条件**：你取消它，或工作完成（PR 合并、队列为空）。
- **最适用于**：重复性工作，或与外部环境/系统交互。
- **用量管理方式**：设置更长的间隔，或基于事件而非时间来响应。

一些代理工作是重复性的：任务不变，只是输入变化。例如，每天早上总结 Slack 消息。另一些工作依赖外部系统，与外部系统交互的一种简单方式是按间隔检查并响应变化。例如，一个可能收到代码审查或 CI 失败的 PR。

对于这些情况，你可以使用 `/loop` 触发 Claude 按间隔重新运行提示词。例如：

```plain
/loop 5m check my PR, address review comments, and fix failing CI
```

`/loop` 在你的电脑上运行，所以如果你关机，它就会停止。你可以通过 `/schedule` 创建例程将循环迁移到云端。

## 主动式循环

![主动式循环](proactive-loops.png)

- **触发方式**：事件或计划，无需实时人工参与。
- **停止条件**：每个任务在目标达成时退出。例程本身持续运行，直到你关闭它。
- **最适用于**：定义明确的重复性工作流：缺陷报告、问题分类、迁移、依赖升级等。
- **用量管理方式**：将例程路由到更小、更快的模型，将最有能力的模型用于判断决策。

上述原语，连同 Claude Code 的其他功能如**自动模式**和**动态工作流**（研究预览），可以组合成用于长时间运行工作的循环。

例如，要处理收到的反馈，你可以使用：

1. **`/schedule`**（研究预览）运行检查新报告的例程
2. **`/goal`** 定义完成的样子，以及**技能**来记录如何验证
3. **动态工作流**编排代理对每个报告进行分类、修复并审查修复结果
4. **自动模式**让例程无需停下来请求许可即可运行

组合起来，提示词可能如下：

```plain
/schedule every hour: check #project-feedback for bug reports. /goal: don't stop until every report found this run is triaged, actioned, and responded to. When fixing a bug, use a workflow to explore three solutions in parallel worktrees and have a judge adversarially review them.
```

## 保持代码质量

循环输出的质量取决于围绕它的系统。在设计系统时：

- **保持代码库本身整洁**：Claude 会遵循代码库中已有的模式和约定。
- **给 Claude 一种验证自身工作的方式**：用[技能](https://code.claude.com/docs/en/skills)编码你和你的团队认为好的标准是什么。
- **让文档触手可及**：框架和库的文档包含最新的最佳实践。
- **使用第二个代理进行代码审查**：拥有全新上下文的审查者偏见更少，不受主代理推理的影响。你可以使用内置的 `/code-review` 技能或 GitHub 的[代码审查](https://code.claude.com/docs/en/code-review)。

当单个结果未达到标准时，不要止步于修复个别问题，尝试将其编码以改进系统在所有未来迭代中的表现。

## 管理 token 用量

为了管理 token 用量，循环应该有明确的边界：

- **为任务选择合适的原语和模型**：较小的任务不需要多个代理或循环。有些任务可以使用更便宜、更快的模型。
- **定义明确的成功和停止条件**：具体说明完成的样子，这样 Claude 能更快地找到解决方案（但不会太快）。
- **大规模运行前先试点**：动态工作流可以生成数百个代理。先在较小的工作切片上评估用量。
- **用脚本处理确定性工作**：运行脚本比推理步骤更便宜。例如，PDF 技能可以附带一个表单填充脚本，让 Claude 每次运行它，而不是重新推导代码。
- **不要比需要更频繁地运行例程**：将间隔与你所监控事物的变化频率相匹配
- **审查用量**：`/usage` 命令按技能、子代理和 MCP 分解近期用量；不带参数的 `/goal` 显示当前回合数和 token 用量；`/workflows` 显示每个代理的 token 用量，你可以随时停止某个代理。

## 入门指南

总结如下：

| 循环类型 | 你交出的是 | 适用场景                 | 使用工具                 |
| -------- | ---------- | ------------------------ | ------------------------ |
| 回合制   | 检查       | 你在探索或做决策         | 自定义验证技能           |
| 目标驱动 | 停止条件   | 你知道完成的样子         | `/goal`                  |
| 时间驱动 | 触发器     | 工作按计划在项目外部发生 | `/loop`、`/schedule`     |
| 主动式   | 提示词     | 工作是重复且定义明确的   | 以上所有，以及动态工作流 |

要开始使用循环，看看你已经在做的工作。选择一个你是瓶颈的任务，问问自己可以交出哪一部分：你能编写验证检查吗？目标是否足够清晰？工作是否按计划到达？

一旦有了想法，运行循环，观察结果——比如它在哪里卡住或过度延伸——不要害怕对它进行迭代改进。

了解更多信息，请阅读 Claude Code 文档中关于[并行运行代理](https://code.claude.com/docs/en/agents)的内容，以及[循环](https://code.claude.com/docs/en/goal)、[计划](https://code.claude.com/docs/en/routines)、[目标](https://code.claude.com/docs/en/goal)和[动态工作流](https://code.claude.com/docs/en/workflows#orchestrate-subagents-at-scale-with-dynamic-workflows)页面。

---

## 参考

- 原文链接：[https://claude.com/blog/getting-started-with-loops](https://claude.com/blog/getting-started-with-loops)
