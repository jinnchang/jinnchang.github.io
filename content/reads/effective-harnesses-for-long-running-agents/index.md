+++
title = 'Effective harnesses for long-running agents'
date = '2025-11-26T00:00:00+08:00'

description = "Effective Harnesses for Long Running Agents"
categories = ["Agent"]
series = ["Harness"]
authors = ["Justin Young"]

toc = true
externalLink = ""
canonicalUrl = "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents"
disableComments = false
+++

> Agent 在处理大量上下文窗口时仍面临挑战。我们从人类工程师身上汲取灵感，为长时间运行的 Agent 打造了一套更高效的管控框架。

随着 AI 代理变得越来越强大，开发者越来越多地要求它们承担需要跨越数小时甚至数天工作的复杂任务。然而，让代理在多个上下文窗口中持续取得进展仍然是一个未解决的问题。

长时间运行代理的核心挑战在于，它们必须在离散的会话中工作，而每个新会话开始时对之前发生的事情毫无记忆。想象一个由轮班工程师组成的软件项目，每位新工程师到来时对上一班次发生的事情一无所知。由于上下文窗口是有限的，而且大多数复杂项目无法在单个窗口内完成，代理需要一种方式来弥合编码会话之间的间隙。

我们开发了一个双管齐下的解决方案，使 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 能够在多个上下文窗口中有效工作：一个**初始化代理**在首次运行时设置环境，以及一个**编码代理**在每个会话中负责取得增量进展，同时为下一个会话留下清晰的产物。你可以在附带的[快速入门](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding)中找到代码示例。

## 长时间运行代理的问题

Claude Agent SDK 是一个功能强大的通用代理框架，擅长编码以及其他需要模型使用工具来收集上下文、规划和执行的任务。它具有上下文管理能力，例如压缩，使代理能够在不耗尽上下文窗口的情况下完成任务。理论上，在这种设置下，代理应该能够在任意长的时间内持续进行有价值的工作。

然而，压缩并不足够。开箱即用的情况下，即使像 Opus 4.5 这样的前沿编码模型在 Claude Agent SDK 上跨多个上下文窗口循环运行，如果只给它一个高层提示词，比如"构建一个 [claude.ai](http://claude.ai/redirect/website.v1.e7bea586-2051-40fa-9555-3b97efe99cb8) 的克隆"，也无法构建出生产级质量的 Web 应用。

Claude 的失败表现为两种模式。首先，代理倾向于一次做太多事情——本质上是试图一次性完成整个应用。这通常导致模型在实现过程中耗尽上下文，使下一个会话面对一个半成品且缺乏文档的功能。然后代理不得不猜测之前发生了什么，并花费大量时间试图让基本应用重新运行起来。即使有压缩，这种情况也会发生，因为压缩并不总是能向下一个代理传递完全清晰的指令。

第二种失败模式通常在项目后期出现。在已经构建了一些功能之后，后续的代理实例会环顾四周，看到已经取得了进展，然后宣布任务完成。

这将问题分解为两个部分。首先，我们需要设置一个初始环境，为给定提示词所需的*所有*功能奠定基础，使代理能够逐步、逐功能地工作。其次，我们应该提示每个代理朝着目标取得增量进展，同时在会话结束时将环境保持在干净状态。所谓"干净状态"，我们指的是适合合并到主分支的那种代码：没有重大 bug，代码整洁且有良好的文档，总体而言，开发者可以轻松地开始新功能的开发，而不必先清理无关的混乱。

在内部实验中，我们使用两部分解决方案来应对这些问题：

1. 初始化代理：第一个代理会话使用专门的提示词，要求模型设置初始环境：一个 `init.sh` 脚本、一个记录代理工作日志的 claude-progress.txt 文件，以及一个显示添加了哪些文件的初始 git 提交。
2. 编码代理：每个后续会话要求模型取得增量进展，然后留下结构化的更新。[^1]

这里的关键洞察是找到一种方式，让代理在以全新的上下文窗口开始时能够快速理解工作状态，这通过 claude-progress.txt 文件和 git 历史来实现。这些实践的灵感来自于了解优秀的软件工程师每天所做的事情。

## 环境管理

在更新的 [Claude 4 提示词指南](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices#multi-context-window-workflows)中，我们分享了多上下文窗口工作流的一些最佳实践，包括一种使用"第一个上下文窗口使用不同提示词"的框架结构。这个"不同的提示词"要求初始化代理设置环境，包含未来编码代理有效工作所需的所有必要上下文。在这里，我们深入探讨这种环境的一些关键组件。

### 功能列表

为了解决代理一次性完成应用或过早认为项目完成的问题，我们提示初始化代理编写一份全面的功能需求文件，对用户的初始提示词进行展开。在 [claude.ai](http://claude.ai/redirect/website.v1.e7bea586-2051-40fa-9555-3b97efe99cb8) 克隆的例子中，这意味着超过 200 个功能，例如"用户可以打开新对话，输入查询，按回车键，并看到 AI 回复"。这些功能最初都被标记为"失败"，这样后续的编码代理就能清楚地了解完整功能应该是什么样子。

```json
{
  "category": "functional",
  "description": "New chat button creates a fresh conversation",
  "steps": [
    "Navigate to main interface",
    "Click the 'New Chat' button",
    "Verify a new conversation is created",
    "Check that chat area shows welcome state",
    "Verify conversation appears in sidebar"
  ],
  "passes": false
}
```

我们提示编码代理只能通过更改 passes 字段的状态来编辑此文件，并使用措辞强烈的指令，如"删除或编辑测试是不可接受的，因为这可能导致功能缺失或出现 bug。"经过一些实验，我们最终选择使用 JSON 格式，因为与 Markdown 文件相比，模型不太可能不当修改或覆盖 JSON 文件。

### 增量进展

有了这个初始环境脚手架，编码代理的下一轮迭代被要求一次只处理一个功能。这种增量方法对于解决代理倾向于一次做太多事情的问题至关重要。

一旦采用增量工作方式，模型在进行代码更改后将环境保持在干净状态仍然至关重要。在我们的实验中，我们发现引发这种行为的最佳方式是要求模型将进展提交到 git 并附带描述性的提交信息，以及在进展文件中写入进展摘要。这使得模型能够使用 git 回退不良的代码更改，恢复代码库的工作状态。

这些方法也提高了效率，因为它们消除了代理猜测之前发生了什么并花费时间试图让基本应用重新运行的需要。

### 测试

我们观察到的最后一个主要失败模式是 Claude 倾向于在没有适当测试的情况下将功能标记为完成。在没有明确提示的情况下，Claude 倾向于进行代码更改，甚至使用单元测试或 `curl` 命令对开发服务器进行测试，但未能认识到该功能端到端并不工作。

在构建 Web 应用的场景中，一旦明确提示 Claude 使用浏览器自动化工具并像人类用户一样进行所有测试，它在端到端验证功能方面表现得相当不错。

![Claude 通过 Puppeteer MCP 服务器测试 claude.ai 克隆时截取的屏幕截图。](screenshots-taken-by-claude-through-the-puppeteer.png)
*Claude 通过 Puppeteer MCP 服务器测试 claude.ai 克隆时截取的屏幕截图。*

为 Claude 提供这类测试工具显著提升了性能，因为代理能够识别并修复仅从代码中不易发现的 bug。

一些问题仍然存在，比如 Claude 的视觉能力和浏览器自动化工具的局限性，使得识别所有类型的 bug 变得困难。例如，Claude 无法通过 Puppeteer MCP 看到浏览器原生的警告弹窗，依赖这些弹窗的功能因此往往 bug 更多。

## 快速上手

有了以上所有设置，每个编码代理都会被提示运行一系列步骤来了解当前状况，其中一些非常基础但仍然有帮助：

1. *运行 `pwd` 查看你正在工作的目录。你只能编辑此目录中的文件。*
2. *阅读 git 日志和进展文件，了解最近的工作内容。*
3. *阅读功能列表文件，选择尚未完成的最高优先级功能来工作。*

这种方法在每个会话中为 Claude 节省了一些 token，因为它不必弄清楚如何测试代码。让初始化代理编写一个可以运行开发服务器的 init.sh 脚本也很有帮助，然后在实现新功能之前运行基本的端到端测试。

在 claude.ai 克隆的例子中，这意味着代理总是先启动本地开发服务器，并使用 Puppeteer MCP 发起新对话、发送消息并接收回复。这确保了 Claude 能够快速识别应用是否处于损坏状态，并立即修复现有的 bug。如果代理转而开始实现新功能，很可能会使问题变得更糟。

综上所述，一个典型的会话以以下助手消息开始：

```plain
[Assistant] I'll start by getting my bearings and understanding the current state of the project.
[Tool Use] <bash - pwd>
[Tool Use] <read - claude-progress.txt>
[Tool Use] <read - feature_list.json>
[Assistant] Let me check the git log to see recent work.
[Tool Use] <bash - git log --oneline -20>
[Assistant] Now let me check if there's an init.sh script to restart the servers.
<Starts the development server>
[Assistant] Excellent! Now let me navigate to the application and verify that some fundamental features are still working.
<Tests basic functionality>
[Assistant] Based on my verification testing, I can see that the fundamental functionality is working well. The core chat features, theme switching, conversation loading, and error handling are all functioning correctly. Now let me review the tests.json file more comprehensively to understand what needs to be implemented next.
<Starts work on a new feature>
```

## 代理失败模式与解决方案

| **问题**                                       | **初始化代理行为**                                                                 | **编码代理行为**                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Claude 过早地宣布整个项目完成。                | 设置功能列表文件：根据输入规格，创建一个包含端到端功能描述列表的结构化 JSON 文件。 | 在会话开始时阅读功能列表文件。选择单个功能开始工作。                                                                           |
| Claude 将环境留在存在 bug 或进展未记录的状态。 | 写入初始 git 仓库和进展笔记文件。                                                  | 会话开始时阅读进展笔记文件和 git 提交日志，并在开发服务器上运行基本测试以捕获未记录的 bug。会话结束时写入 git 提交和进展更新。 |
| Claude 过早地将功能标记为完成。                | 设置功能列表文件。                                                                 | 自行验证所有功能。仅在仔细测试后才将功能标记为"通过"。                                                                         |
| Claude 需要花时间弄清楚如何运行应用。          | 编写一个可以运行开发服务器的 `init.sh` 脚本。                                      | 会话开始时阅读 `init.sh`。                                                                                                     |

总结长时间运行 AI 代理中四种常见失败模式及解决方案。

## 未来工作

这项研究展示了长时间运行代理框架中一组可能的解决方案，使模型能够在多个上下文窗口中取得增量进展。然而，仍然存在一些开放性问题。

最值得注意的是，目前仍不清楚单个通用编码代理是否在跨上下文场景中表现最佳，还是通过多代理架构可以实现更好的性能。看起来合理的是，像测试代理、质量保证代理或代码清理代理这样的专业化代理，可以在软件开发生命周期的子任务上做得更好。

此外，此演示针对全栈 Web 应用开发进行了优化。一个未来的方向是将这些发现推广到其他领域。这些经验教训中的部分或全部很可能适用于其他领域所需的长时间运行代理任务，例如科学研究或金融建模。

### 致谢

由 Justin Young 撰写。特别感谢 David Hershey、Prithvi Rajasakeran、Jeremy Hadfield、Naia Bouscal、Michael Tingley、Jesse Mu、Jake Eaton、Marius Buleandara、Maggie Vo、Pedram Navid、Nadine Yasser 和 Alex Notov 的贡献。

这项工作反映了 Anthropic 多个团队的集体努力，他们使 Claude 能够安全地进行长周期自主软件工程，尤其是代码 RL 和 Claude Code 团队。有兴趣贡献的候选人欢迎在 [anthropic.com/careers](http://anthropic.com/careers) 申请。

## 原文链接

[https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

### 脚注

[^1]: 我们在此上下文中将它们称为不同的代理，仅仅是因为它们有不同的初始用户提示词。系统提示词、工具集和整体代理框架在其他方面完全相同。
