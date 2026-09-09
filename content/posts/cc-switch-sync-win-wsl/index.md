+++
title = 'CC Switch 统一管理 Win 和 WSL 配置'
date = '2026-09-09T10:00:00+08:00'

description = "让 CC Switch 切换一次、Windows 与 WSL 两边的 Claude Code 配置同时生效，只同步 settings.json，其余内容各自独立。"
categories = ["Tools"]
series = []
authors = []

toc = true
externalLink = ""
canonicalUrl = ""
disableComments = false
+++

Windows 和 WSL 是两套环境，Claude Code 的配置各管各的：

- CC Switch 在 Windows 上写的是 `C:\Users\<User>\.claude\settings.json`
- WSL 里的 Claude Code 读的却是 `~/.claude/settings.json`

本文只做一件事：把 `settings.json` 打通，CC Switch 切换一次、两边同时生效。其余内容（`.claude.json`、plugins、skills、会话记录）各自独立，一律不动。

## 先把目标收敛到「只同步 settings.json」

最直接的思路是把整个配置目录打通，比如在 WSL 里设 `CLAUDE_CONFIG_DIR=/mnt/c/Users/<User>/.claude`。它能生效，但搬走的是整个目录：`settings.json`、`.claude.json`、plugins、skills、会话记录全都会被共享，远超想要的粒度。

所以目标就是：只让 `settings.json` 一个文件在两边打通。下面两种做法都能做到，区别只在谁当写者、文件物理上住在哪。

## 方案 A：单文件软链（写走 Windows，读走 WSL）

`settings.json` 物理上留在 Windows 原生位置，CC Switch 照旧直接写它；WSL 里用一个软链指向它，Claude Code 只读。

```bash
ln -s /mnt/c/Users/<User>/.claude/settings.json ~/.claude/settings.json
```

这样 `~/.claude` 里其余内容、以及 `~/.claude.json` 仍是 WSL 原生，完全独立。

注意：如果 WSL 里的 Claude Code 反过来重写 `settings.json`（比如在 WSL 里 `/config`、`/permissions` 加白名单），可能把软链替换成普通文件，同步静默失效。正常场景下 CC Switch 是唯一写者，风险很小。

## 方案 B：CC Switch 直接写 WSL（配置留在 WSL）

`settings.json` 物理上留在 WSL，把 CC Switch 的写入目标指到 WSL 目录。CC Switch 的切换动作本来只写 `settings.json`，不碰 transcripts、skills。

先在 WSL 里拿到 Windows 能识别的 UNC 路径：

```bash
wslpath -w ~/.claude
# 输出形如 \\wsl.localhost\Ubuntu\home\<User>\.claude
```

再在 CC Switch 的「设置 → 目录 → Claude Code 配置目录」填入该路径（去掉末尾的 `settings.json`）：

```plaintext
\\wsl.localhost\Ubuntu\home\<User>\.claude
```

注意：需 v3.20.0 及以上（v3.19.2 写 `\\wsl.localhost` 路径有回归 bug），且 WSL 发行版需处于运行状态。

## 怎么选

| 你的情况 | 选 |
| --- | --- |
| Windows 原生和 WSL 都跑 Claude Code | A（配置留 Windows，两边都读得到） |
| 只在 WSL 用，且希望配置物理留在 WSL | B |

方案 A 写入走 Windows 原生、更稳，代价是一个跨文件系统软链；方案 B 配置落在 WSL、零软链，代价是依赖版本和 WSL 运行态。