+++
date = '2026-06-12T14:17:12+08:00'
title = 'Claude Code / Agent SDK / CLI -p'
summary = "以 Claude Code 为基准线，对比 Agent SDK 与 CLI -p 的能力差异"
toc = true
categories = ["AI"]
series = []
externalLink = ""
disableComments = false
+++

Y=支持，N=不支持，部分支持会备注

## 基础能力

| 能力                        | Claude Code | Agent SDK | CLI -p |
| --------------------------- | :---------: | :-------: | :----: |
| 文件读写（Read/Write/Edit） |      Y      |     Y     |   Y    |
| 命令执行（Bash）            |      Y      |     Y     |   Y    |
| 文件搜索（Glob/Grep）       |      Y      |     Y     |   Y    |
| 网页获取（WebFetch）        |      Y      |     Y     |   Y    |
| 网页搜索（WebSearch）       |      Y      |     Y     |   Y    |
| Notebook 编辑               |      Y      |     Y     |   Y    |
| MCP 资源读写                |      Y      |     Y     |   Y    |
| 多轮 Agentic Loop           |      Y      |     Y     |   Y    |

## 工具与扩展

| 能力                                                  | Claude Code | Agent SDK |      CLI -p       |
| ----------------------------------------------------- | :---------: | :-------: | :---------------: |
| 挂载外部 MCP Server（stdio/sse/http）                 |      Y      |     Y     | Y（--mcp-config） |
| 同进程 MCP Server（createSdkMcpServer）               |      N      |     Y     |         N         |
| 自定义 MCP 工具（tool() 函数）                        |      N      |     Y     |         N         |
| 限制可用工具（--tools / tools）                       |      Y      |     Y     |         Y         |
| 允许/禁止特定工具                                     |      Y      |     Y     |         Y         |
| 工具别名映射（toolAliases）                           |      N      |     Y     |         N         |
| 严格 MCP 配置（忽略项目/用户 MCP）                    |      Y      |     Y     |         Y         |
| 权限提示通过 MCP 工具代理（permissionPromptToolName） |      N      |     Y     |         N         |

## Agent 与子 Agent

| 能力                            | Claude Code | Agent SDK |       CLI -p       |
| ------------------------------- | :---------: | :-------: | :----------------: |
| 指定主 Agent（--agent / agent） |      Y      |     Y     |         Y          |
| 定义自定义子 Agent              |      Y      |     Y     | Y（--agents JSON） |
| 子 Agent 后台执行               |      Y      |     Y     |         Y          |
| 子 Agent 模型指定               |      Y      |     Y     |         Y          |

## 权限控制

| 能力                                 | Claude Code | Agent SDK | CLI -p |
| ------------------------------------ | :---------: | :-------: | :----: |
| 交互式权限弹窗                       |      Y      |     N     |   N    |
| 预设权限模式（default/auto/plan 等） |      Y      |     Y     |   Y    |
| 细粒度权限回调（canUseTool）         |      N      |     Y     |   N    |
| 用户对话回调（onUserDialog）         |      N      |     Y     |   N    |
| 沙箱执行                             |      Y      |     Y     |   Y    |

## Hook 生命周期

| 能力                             | Claude Code | Agent SDK  |  CLI -p  |
| -------------------------------- | :---------: | :--------: | :------: |
| Shell 命令 Hook（settings 配置） |      Y      |     Y      |    Y     |
| TypeScript 回调 Hook             |      N      |     Y      |    N     |
| PreToolUse / PostToolUse Hook    |  Y(shell)   | Y(TS 回调) | Y(shell) |
| PermissionRequest Hook           |  Y(shell)   | Y(TS 回调) | Y(shell) |
| SessionStart / SessionEnd Hook   |  Y(shell)   | Y(TS 回调) | Y(shell) |
| Stop / SubagentStop Hook         |  Y(shell)   | Y(TS 回调) | Y(shell) |
| Elicitation Hook                 |  Y(shell)   | Y(TS 回调) | Y(shell) |
| 全部 30 种 Hook 事件             |  Y(shell)   | Y(TS 回调) | Y(shell) |

## 会话管理

| 能力                                     |  Claude Code   | Agent SDK |            CLI -p             |
| ---------------------------------------- | :------------: | :-------: | :---------------------------: |
| 恢复会话（resume）                       |       Y        |     Y     |         Y（--resume）         |
| 继续最近会话（continue）                 |       Y        |     Y     |            Y（-c）            |
| 分支会话（fork）                         |       Y        |     Y     |      Y（--fork-session）      |
| 指定会话 ID                              |       Y        |     Y     |       Y（--session-id）       |
| 从 PR 恢复会话                           | Y（--from-pr） |     N     |        Y（--from-pr）         |
| 列出历史会话（listSessions）             |       Y        |     Y     |               N               |
| 读取会话消息（getSessionMessages）       |       Y        |     Y     |               N               |
| 读取子 Agent 消息（getSubagentMessages） |       Y        |     Y     |               N               |
| 重命名会话（renameSession）              |       Y        |     Y     |               N               |
| 删除会话（deleteSession）                |       Y        |     Y     |               N               |
| 标记会话（tagSession）                   |       Y        |     Y     |               N               |
| 禁用会话持久化                           |       N        |     Y     | Y（--no-session-persistence） |
| 会话镜像到外部存储（SessionStore）       |       N        | Y(alpha)  |               N               |

## 输出与交互

| 能力                                     | Claude Code |      Agent SDK       |             CLI -p             |
| ---------------------------------------- | :---------: | :------------------: | :----------------------------: |
| 交互式 TUI                               |      Y      |          N           |               N                |
| Slash 命令                               |      Y      |          N           |               N                |
| 流式输出                                 |   Y(TUI)    | Y(SDKMessage 事件流) |         Y(stream-json)         |
| JSON 输出                                |      N      |          Y           |    Y(--output-format json)     |
| 流式 JSON 输出                           |      N      |          Y           | Y(--output-format stream-json) |
| JSON Schema 结构化输出                   |      N      |          Y           |        Y(--json-schema)        |
| 部分消息流（includePartialMessages）     |      N      |          Y           |               Y                |
| Hook 事件流（includeHookEvents）         |      N      |          Y           |               Y                |
| 子 Agent 文本转发（forwardSubagentText） |      N      |          Y           |               N                |
| 进度建议（promptSuggestions）            |      N      |          Y           |               N                |
| Agent 进度摘要（agentProgressSummaries） |      N      |          Y           |               N                |
| 流式输入（stream-json / AsyncIterable）  |      N      |   Y(AsyncIterable)   | Y(--input-format stream-json)  |
| 向用户提问（AskUserQuestion）            |      Y      |          N           |               N                |
| 向用户发消息（SendUserMessage/brief）    |      Y      |          N           |           Y(--brief)           |
| MCP Elicitation 回调（onElicitation）    | Y(内置 UI)  |      Y(TS 回调)      |               N                |

## 模型与推理

| 能力                                       | Claude Code | Agent SDK |    CLI -p    |
| ------------------------------------------ | :---------: | :-------: | :----------: |
| 指定模型                                   |      Y      |     Y     |      Y       |
| 推理力度（effort）                         |      Y      |     Y     |      Y       |
| Thinking 配置（adaptive/enabled/disabled） |      Y      |     Y     |      Y       |
| 最大轮次限制（maxTurns）                   |      Y      |     Y     | Y(隐藏 flag) |
| 最大预算限制（maxBudgetUsd）               |      N      |     Y     |      Y       |
| 备选模型（fallbackModel）                  |      N      |     Y     |      Y       |
| Task budget（token 预算感知）              |      N      | Y(alpha)  |      N       |

## 系统提示与配置

| 能力                                               | Claude Code | Agent SDK | CLI -p |
| -------------------------------------------------- | :---------: | :-------: | :----: |
| 自定义系统提示                                     |      Y      |     Y     |   Y    |
| 追加系统提示                                       |      Y      |     Y     |   Y    |
| 系统提示缓存边界（SYSTEM_PROMPT_DYNAMIC_BOUNDARY） |      N      |     Y     |   N    |
| 排除动态系统提示段落                               |      Y      |     Y     |   Y    |
| Plan mode 自定义指令（planModeInstructions）       |      N      |     Y     |   N    |
| 设置来源控制（settingSources）                     |      Y      |     Y     |   Y    |
| 托管设置注入（managedSettings）                    |      N      |     Y     |   N    |
| 解析设置（resolveSettings）                        |      N      |     Y     |   N    |

## 进程与部署

| 能力                                     | Claude Code | Agent SDK |   CLI -p    |
| ---------------------------------------- | :---------: | :-------: | :---------: |
| 指定运行时（bun/deno/node）              |   Y(自动)   |     Y     |   Y(自动)   |
| 自定义进程启动（spawnClaudeCodeProcess） |      N      |     Y     |      N      |
| 指定 CLI 可执行文件路径                  |      N      |     Y     |      N      |
| 环境变量完全替换（env option）           |      N      |     Y     |      N      |
| 启动预热（startup）                      |      N      |     Y     |      N      |
| Debug 模式                               |      Y      |     Y     |      Y      |
| stderr 回调                              |      N      |     Y     |      N      |
| Bare 模式（跳过 LSP/插件/自动内存等）    |      Y      |     Y     | Y（--bare） |
| 文件下载（--file）                       |      Y      |     N     |      Y      |

## Bridge / Remote Control

| 能力                                   | Claude Code | Agent SDK | CLI -p |
| -------------------------------------- | :---------: | :-------: | :----: |
| Remote Control 模式                    |      Y      |     N     |   N    |
| Bridge 会话连接（attachBridgeSession） |      N      | Y(alpha)  |   N    |
| 创建远端会话（createCodeSession）      |      N      | Y(alpha)  |   N    |
| 获取远端凭证（fetchRemoteCredentials） |      N      | Y(alpha)  |   N    |
| Assistant Worker（runAssistantWorker） |      N      | Y(alpha)  |   N    |

## 产品特性

| 能力                                      | Claude Code | Agent SDK |            CLI -p             |
| ----------------------------------------- | :---------: | :-------: | :---------------------------: |
| CLAUDE.md 自动加载                        |      Y      |     Y     |               Y               |
| Skills 系统                               |      Y      |     Y     |               Y               |
| Plugins 系统                              |      Y      |     Y     |               Y               |
| 自动内存                                  |      Y      |     Y     |               Y               |
| Git Worktree                              |      Y      |     Y     |               Y               |
| Chrome 集成                               |      Y      |     N     |               N               |
| IDE 集成                                  |      Y      |     N     |               N               |
| 文件变更检查点（enableFileCheckpointing） |      Y      |     Y     |               N               |
| 跨会话文件回退（rewindFiles）             |  Y(/undo)   |     Y     |               N               |
| 定时任务（Cron/ScheduleWakeup）           |      Y      |     Y     |               Y               |
| Verbose 模式                              |      Y      |     Y     |               Y               |
| 禁用 Slash 命令/ Skills                   |      Y      |     Y     | Y（--disable-slash-commands） |
