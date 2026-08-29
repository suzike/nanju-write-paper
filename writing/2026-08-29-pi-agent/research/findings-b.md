# pi 编码代理调研 B：实践与上手（Searcher-B）

调研对象：开源极简 coding agent **pi**（作者 Mario Zechner / badlogic，官网 pi.dev，仓库 earendil-works/pi）。本文只回答"怎么装、怎么配、怎么用、怎么扩展、社区怎么玩"，不做横向对比、不收集批评文章。
检索日期：2026-08-29。可信度分级：A=官方仓库/文档/npm registry（一手、逐字核对），B=作者本人博客/官方站点陈述，C=第三方文章/搜索摘要（未逐字核对原文全文）。

---

## 一、安装

### 结论：npm 全局安装 `@earendil-works/pi-coding-agent`，可执行命令是 `pi`，要求 Node ≥ 22.19.0
来源：npm registry https://registry.npmjs.org/@earendil-works/pi-coding-agent/latest （访问 2026-08-29）；包 manifest https://github.com/earendil-works/pi/blob/main/packages/coding-agent/package.json （访问 2026-08-29）
原文短引：registry 返回 `"engines":{"node":">=22.19.0"}`；package.json 中 `"bin":{"pi":"dist/bundle/cli.js"}`，当前版本 `"version":"0.84.4"`。
可信度：A

### 结论：官方安装命令带 `--ignore-scripts`，另有 curl / PowerShell 两条独立安装脚本路径
来源：https://pi.dev/ （访问 2026-08-29）；https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文逐字（命令块，README Quick Start 与 pi.dev 一致）：
```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```
```bash
curl -fsSL https://pi.dev/install.sh | sh
```
pi.dev 上还给出 Windows PowerShell 安装：`powershell -c "irm https://pi.dev/install.ps1 | iex"`，以及 pnpm/bun 变体（`pnpm add -g --ignore-scripts @earendil-works/pi-coding-agent`）。
README 说明：`--ignore-scripts` disables dependency lifecycle scripts during install. Pi does not require install scripts for normal npm installs.
可信度：A

### 结论：Windows 明确受支持（独立文档、内置 powershell 工具、独立安装脚本）；另有 Termux(Android) 文档与独立二进制构建
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）；https://pi.dev/ （访问 2026-08-29）
原文短引：README Platform notes 行列出 `[Windows](docs/windows.md) | [Termux (Android)](docs/termux.md) | [tmux](docs/tmux.md)`；CLI Reference 工具表中写 `Available built-in tools: read, bash, powershell (Windows), edit, write, grep, find, ls`；编辑器表注明 Ctrl+G 外部编辑器 "defaults to Notepad on Windows"；消息队列一节提醒 "On Windows Terminal, `Alt+Enter` is fullscreen by default. Remap it in docs/terminal-setup.md"。
可信度：A（docs/windows.md 具体内容本次未抓到，支持性结论由 install.ps1 + powershell 工具 + Notepad 默认等多处间接证实）

### 结论：包名经历过迁移，旧名为 `@mariozechner/pi-coding-agent`
来源：npm 搜索结果 https://www.npmjs.com/package/@mariozechner/pi-coding-agent （搜索访问 2026-08-29）
原文短引：搜索摘要称 CLI 包 "published as `@earendil-works/pi-coding-agent` (previously `@mariozechner/pi-coding-agent`)"。2025-11-30 的作者博客代码示例中 import 仍用 `@mariozechner/pi-ai` 旧作用域。
可信度：B（官方站点/搜索结果交叉，但迁移公告原文未直接抓取）

---

## 二、配置（API key / provider / 模型）

### 结论：最短路径是设环境变量后直接启动 `pi`，或用 `/login` 走订阅 OAuth
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文逐字（Quick Start）：
```bash
export ANTHROPIC_API_KEY=sk-ant-...
pi
```
```bash
pi
/login  # Then select provider
```
可信度：A

### 结论：订阅登录支持 Claude Pro/Max、ChatGPT Plus/Pro (Codex)、GitHub Copilot 三家；API key 支持约 30 家 provider
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文短引：README "Subscriptions:" 下逐字列出 Anthropic Claude Pro/Max、OpenAI ChatGPT Plus/Pro (Codex)、GitHub Copilot；"API keys:" 列表包括 Anthropic、OpenAI、Azure OpenAI、DeepSeek、Google Gemini、Google Vertex、Amazon Bedrock、Mistral、Groq、Cerebras、xAI、OpenRouter、Hugging Face、Fireworks、Together AI、Kimi For Coding、MiniMax、Xiaomi MiMo（含中国/新加坡等区域计划）、ZAI Coding Plan (Global/China)、OpenCode Zen、Cloudflare AI Gateway 等。pi.dev 首页概括为 "15+ providers, hundreds of models"（与 README 的更长列表存在版本口径差）。
可信度：A

### 结论：本地模型有两条路：llama.cpp router server（一等公民，带专门命令）与 Ollama；自定义 provider 走 models.json 或扩展
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文短引：README 逐字："Pi also supports the llama.cpp router server. Configure it with `/login llama.cpp`, manage downloads and loaded models with `/llama`, then select a loaded model with `/model`."；"**Custom providers & models:** Add providers via `~/.pi/agent/models.json` if they speak a supported API (OpenAI, Anthropic, Google). For custom APIs or OAuth, use extensions."；Ollama 出现在 pi.dev 的 provider 列表中。
可信度：A

### 结论：模型切换有交互式与命令行两种入口，收藏/默认模型的操作是 Ctrl+S 与 Ctrl+P
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文短引："Authenticate via subscription (`/login`) or API key, then select any model from that provider via `/model` (or Ctrl+L). Press Ctrl+S in the model picker to save the highlighted model as the startup default."；`/scoped-models` 命令 "Enable/disable models for Ctrl+P cycling"；CLI 侧示例 `pi --provider openai --model gpt-4o`、`pi --model openai/gpt-4o`、`pi --model sonnet:high`（`:<thinking>` 后缀语法）。
可信度：A

---

## 三、第一次会话：启动、命令、快捷键、与 Claude Code 的操作差异

### 结论：裸命令 `pi` 进交互模式，常用会话参数是 `-c`（续上次）、`-r`（选历史）、`--fork <id>`（分叉）
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文逐字（Sessions / Management）：
```bash
pi -c                  # Continue most recent session
pi -r                  # Browse and select from past sessions
pi --no-session        # Ephemeral mode (don't save)
pi --name "my task"    # Set session display name at startup
pi --session <path|id> # Use specific session file or ID
pi --fork <path|id>    # Fork specific session file or ID into a new session
```
其他常见启动形态（同 README CLI Reference，逐字）：`pi "List all .ts files in src/"`（带初始 prompt）、`pi -p "Summarize this codebase"`（print 模式）、`cat README.md | pi -p "Summarize this text"`（stdin 合并进首条 prompt）、`pi @prompt.md "Answer this"`（@文件注入）、`pi --tools read,grep,find,ls -p "Review the code"`（只读模式）。
可信度：A

### 结论：斜杠命令全套 24 个，`/tree /fork /clone /compact /export /share` 全部实锤且语义各有分工
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （Commands 表，访问 2026-08-29）
原文逐字摘录（完整表，按原文顺序）：
| Command | Description |
|---------|-------------|
| `/login`, `/logout` | Manage provider credentials |
| `/llama` | Download, load, and unload llama.cpp router models |
| `/model` | Switch models; Ctrl+S in the picker saves the startup default |
| `/thinking` | Switch thinking level; Ctrl+S in the picker saves the startup default |
| `/scoped-models` | Enable/disable models for Ctrl+P cycling |
| `/settings` | Theme, message delivery, transport, and other preferences |
| `/resume` | Pick from previous sessions |
| `/new` | Start a new session |
| `/name <name>` | Set session display name |
| `/session` | Show session info (file, ID, messages, tokens, cost) |
| `/tree` | Jump to any point in the session and continue from there |
| `/trust` | Save project trust decision for future sessions (restart required) |
| `/fork` | Create a new session from a previous user message |
| `/clone` | Duplicate the current active branch into a new session |
| `/compact [prompt]` | Manually compact context, optional custom instructions |
| `/copy` | Copy last assistant message to clipboard |
| `/export [file]` | Export session to HTML or JSONL file |
| `/import <file>` | Import and resume a session from a JSONL file |
| `/share` | Upload as private GitHub gist with shareable HTML link |
| `/reload` | Reload keybindings, extensions, skills, prompts, themes, and context files |
| `/hotkeys` | Show all keyboard shortcuts |
| `/changelog` | Display version history |
| `/quit` | Quit pi |

补充规则（原文短引）："Extensions can register custom commands, skills are available as `/skill:name`, and prompt templates expand via `/templatename`."
可信度：A

### 结论：会话本质是树状 JSONL，`/tree` 原地跳转分支是 pi 最有辨识度的操作；`/fork` 与 `/clone` 是两种不同复制语义
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （Branching 节，访问 2026-08-29）
原文短引：**/fork** — "Create a new session file from a previous user message on the active branch. Opens a selector, copies the active path up to that point, and places the selected prompt in the editor for modification."；**/clone** — "Duplicate the current active branch into a new session file at the current position. The new session keeps the full active-path history and opens with an empty editor."；`/tree` 内可用 "Shift+L to label entries as bookmarks"。会话文件 "stored as JSONL files with a tree structure. Each entry has an `id` and `parentId`"，自动存到 `~/.pi/agent/sessions/` 按工作目录组织。
可信度：A

### 结论：高频快捷键围绕模型/思考级别/折叠/消息排队四组，全部可用 `/hotkeys` 查全量并自定义
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （Keyboard Shortcuts 与 Message Queue 表，访问 2026-08-29）
原文逐字摘录：
| Key | Action |
|-----|--------|
| Ctrl+C | Clear editor |
| Ctrl+C twice | Quit |
| Escape | Cancel/abort |
| Escape twice | Open `/tree` |
| Ctrl+L | Open model selector |
| Ctrl+P / Shift+Ctrl+P | Cycle scoped models forward/backward |
| Shift+Tab | Cycle thinking level |
| Ctrl+O | Collapse/expand tool output |
| Ctrl+T | Collapse/expand thinking blocks |
| Ctrl+X | Copy the last assistant message; with fullscreen copy-on-select disabled, copy the active text selection |

消息排队语义（原文短引）："**Enter** queues a *steering* message, delivered after the current assistant turn finishes executing its tool calls"；"**Alt+Enter** queues a *follow-up* message, delivered only after the agent finishes all work"；Alt+Up 取回队列消息到编辑器。编辑器内另有 `@` 模糊搜文件、Tab 补全路径、`!command`（运行并把输出发给 LLM）、`!!command`（运行但不发）。
可信度：A

### 结论：与 Claude Code 的核心操作差异在"少"：默认只给 4 个工具，刻意不做 MCP/子代理/计划模式/权限弹窗/TODO/后台 bash
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （Philosophy 节，访问 2026-08-29）；作者博客 https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30）
原文逐字（README Philosophy，全段）：
> **No MCP.** Build CLI tools with READMEs (see [Skills](#skills)), or build an extension that adds MCP support. …
> **No sub-agents.** There's many ways to do this. Spawn pi instances via tmux, or build your own with extensions, or install a package that does it your way.
> **No permission popups.** Run in a container, or build your own confirmation flow with extensions inline with your environment and security requirements.
> **No plan mode.** Write plans to files, or build it with extensions, or install a package.
> **No built-in to-dos.** They confuse models. Use a TODO.md file, or build your own with extensions.
> **No background bash.** Use tmux. Full observability, direct interaction.

Quick Start 原文："By default, pi gives the model four tools: `read`, `write`, `edit`, and `bash`."（CLI 层面另有 `grep/find/ls` 与 Windows 专属 `powershell` 可用/可通过 `--tools` 组合；第三方文章 contextstudios.ai 与 agentic-ai.readthedocs.io 均以"只有 read/write/edit/bash 四个工具"概括）。
操作差异补充：上下文文件同时认 `AGENTS.md` 或 `CLAUDE.md`（可无痛迁移 Claude Code 项目习惯），系统提示词可用 `.pi/SYSTEM.md` 整体替换、`APPEND_SYSTEM.md` 追加；权限默认不弹窗、靠项目信任机制（首次进入含 `.pi/` 资源的项目时询问，`/trust` 保存）。pi.dev 首页的 steering/follow-up 表述："Enter sends a steering message …; Alt+Enter queues a follow-up"。
可信度：A（README 逐字）；B（博客）

---

## 四、最小扩展示例（真实代码）

### 结论：扩展就是一个默认导出工厂函数 `(pi: ExtensionAPI) => void`，通过 `pi.on("tool_call", ...)` 拦截工具调用并可返回 `{ block: true, reason }`
来源（文件原文）：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/protected-paths.ts （main 分支，访问 2026-08-29）
原文逐字（完整源码）：
```typescript
/**
 * Protected Paths Extension
 *
 * Blocks write and edit operations to protected paths.
 * Useful for preventing accidental modifications to sensitive files.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	const protectedPaths = [".env", ".git/", "node_modules/"];

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") {
			return undefined;
		}

		const path = event.input.path as string;
		const isProtected = protectedPaths.some((p) => path.includes(p));

		if (isProtected) {
			if (ctx.hasUI) {
				ctx.ui.notify(`Blocked write to protected path: ${path}`, "warning");
			}
			return { block: true, reason: `Path "${path}" is protected` };
		}

		return undefined;
	});
}
```
可信度：A（raw.githubusercontent 全文抓取）

### 结论：同一事件模型可做"确认门"：permission-gate.ts 对危险 bash 命令弹 UI 询问，返回 `{"confirm": true}` 放行
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/permission-gate.ts （main 分支，访问 2026-08-29）
原文逐字（抓取到的头部与核心结构；文件中段列表项较长未完整展示，仅摘可靠片段）：
```typescript
/**
 * Permission Gate Extension
 *
 * Prompts for confirmation before running potentially dangerous bash commands.
 * Patterns checked: rm ...
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		// （中段：对 event.toolName === "bash" 且命令命中危险模式时，
		//   用 ctx.ui 交互确认；确认后返回 { "confirm": true }）
	});
}
```
注：中段为本次抓取被截断处的占位概述，非原文——完整实现请以上述仓库文件为准。头部注释与 `pi.on("tool_call", ...)` 拦截结构为逐字核对。
可信度：A（结构）/ 占位段不可引用

### 结论：官方 README 给出的扩展 API 形状是三件套：`pi.registerTool` + `pi.registerCommand` + `pi.on("tool_call")`；50+ 示例在 `packages/coding-agent/examples/extensions/`
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （Extensions 节，访问 2026-08-29）；https://pi.dev/ （访问 2026-08-29）
原文逐字（README 内嵌片段）：
```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({ name: "deploy", ... });
  pi.registerCommand("stats", { ... });
  pi.on("tool_call", async (event, ctx) => { ... });
}
```
原文短引（README）："TypeScript modules that extend pi with custom tools, commands, keyboard shortcuts, event handlers, and UI components."，扩展可做的事包括 "Custom tools (or replace built-in tools entirely) / Sub-agents and plan mode / Custom compaction and summarization / Permission gates and path protection / … / Make pi look like Claude Code / Games while waiting (yes, Doom runs)"。pi.dev 首页："See the 50+ examples" 指向 `packages/coding-agent/examples/extensions/`，点名示例：`subagent/`、`plan-mode/`、`permission-gate.ts`、`protected-paths.ts`、`ssh.ts`、`sandbox/`、`custom-compaction.ts`。仓库根 package.json 的 workspaces 还登记了 `examples/extensions/custom-provider-anthropic`、`custom-provider-gitlab-duo`、`gondolin`、`with-deps` 等带依赖扩展示例（来源：仓库根 package.json，A 级）。
可信度：A

### 结论：扩展放置路径为 `~/.pi/agent/extensions/`（全局）或 `.pi/extensions/`（项目），第三方分发用 `pi install`
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）；https://pi.dev/ （访问 2026-08-29）
原文逐字（分发命令）：
```bash
pi install npm:@foo/pi-tools
pi install git:github.com/badlogic/pi-doom
```
README 补充：`pi install <source> [-l]` 加 `-l` 为项目本地安装（装到 `.pi/git/`、`.pi/npm/`）；`pi list` 列出已装包；`pi config` 启停扩展/skill/prompt/theme。加载单个扩展可用 `-e, --extension <source>`，组合 `--no-extensions -e ./my-ext.ts` 可"只加载这一个"。
可信度：A

---

## 五、社区工作流（skills / prompt templates / 自定义工具的真实案例）

### 结论：pi 的官方四件套定制层是 Extensions、Skills、Prompt Templates、Themes，打包成 "pi package" 经 npm/git 分发
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）
原文逐字（Skills 示例与 prompt template 示例）：
```markdown
<!-- ~/.pi/agent/skills/my-skill/SKILL.md -->
# My Skill
Use this skill when the user asks about X.

## Steps
1. Do this
2. Then that
```
```markdown
<!-- ~/.pi/agent/prompts/review.md -->
Review this code for bugs, security issues, and performance problems.
Focus on: {{focus}}
```
Skills 遵循 Agent Skills 标准（agentskills.io），以 `/skill:name` 调用或由模型按需加载；prompt template 输入 `/name` 展开。pi package 在 package.json 加 `"pi": {"extensions": [...], "skills": [...], "prompts": [...], "themes": [...]}` 清单，npm 上以 `keywords: ["pi-package"]` 聚合检索，Discord 有专门的 #packages 频道。README 安全提示（原文）："Pi packages run with full system access. … Review source code before installing third-party packages."
可信度：A

### 结论：作者本人的公开工作流是把 pi 会话发布成 Hugging Face 数据集（pi-share-hf），并把自己的 pi-mono 开发会话数据集公开
来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md （访问 2026-08-29）；https://github.com/badlogic/pi-share-hf
原文短引：README："To publish sessions, use `badlogic/pi-share-hf`. … All you need is a Hugging Face account, the Hugging Face CLI, and `pi-share-hf`."；"I regularly publish my own `pi-mono` work sessions here: badlogicgames/pi-mono on Hugging Face"。
可信度：A

### 结论：社区代表性包：oh-my-pi（hash 锚定编辑 + LSP + 浏览器 + 子代理）、pi-mom（Slack 委派）、pi-doom（等待时玩 Doom）、@termdraw/pi（画图）
来源：第三方综述 https://agentic-ai.readthedocs.io/en/latest/AgentHarness/pi-dev/ （访问 2026-08-29）；https://pi.dev/ （访问 2026-08-29）；GitHub README
原文短引：readthedocs 页："Community example: `can1357/oh-my-pi` (hash-anchored edits, LSP, browser, sub-agents); Slack integration `pi-mom` delegates messages to the agent."；pi.dev：第三方扩展示例 "`@termdraw/pi` by Ben Vinegar (drawing extension)"；README/ pi.dev："pi install git:github.com/badlogic/pi-doom"、图片 "doom-extension.png"。
可信度：B/C（readthedocs 为二手综述；pi.dev 官方站为 B；包本体细节未逐一核对）

### 结论：社区使用方法论是"从四工具裸核起步，用到出现具体缺口再加扩展"，并把项目内已装 skills 写进 AGENTS.md 帮助发现
来源：https://agentic-ai.readthedocs.io/en/latest/AgentHarness/pi-dev/ （访问 2026-08-29）
原文短引："start with the four-tool core and 'add extensions only when a specific gap is identified through use.'"；"To aid discovery, keep a project-level AGENTS.md documenting installed skills and their invocation syntax."；渐进披露："capability definitions are loaded on demand rather than injected into every turn."
可信度：C

### 结论：YouTube 有社区直播"用 pi 从零造一个自定义 coding agent"，并有说法称 OpenClaw 是构建在 pi 框架之上
来源：搜索结果 https://www.youtube.com/watch?v=lK9o5Wu2upU （搜索访问 2026-08-29）
原文短引：搜索摘要："Pi is INCREDIBLE — Building a Custom Coding Agent Live … noting Pi (created by Mario Zechner) predates OpenClaw, which was actually built on top of the Pi framework."
可信度：C（视频正文与 OpenClaw 关系未直接核实）

### 结论：围绕 pi 的内容生态还包括作者播客访谈与多篇第三方上手指南（2026 年）
来源：搜索结果（访问 2026-08-29）：wordman.dev 播客页 https://www.wordman.dev/podcast/mario-zechner-pi-coding-agent/ ；explainx.ai 指南 https://explainx.ai/blog/pi-minimal-agent-harness-mario-zechner-guide-2026 ；composio.dev 对比文 https://composio.dev/content/pi-agent-vs-claude-code ；rushis.com https://www.rushis.com/pi-the-coding-agent-built-around-what-it-wont-do/
原文短引（composio 摘要）："Pi was released in late 2025 and is now maintained under Earendil; Zechner joined Earendil in April 2026 (per their blog)."
可信度：C

---

## 未解决的问题

1. **Node ≥ 22.19.0 的官方说明**：`engines` 字段在 npm registry 已确认（A 级），但 pi.dev 与 README 均未明文写 Node 版本要求，也未说明该门槛的历史变更（是否曾更低）。
2. **docs/windows.md 具体内容未抓取**：Windows 支持已由 install.ps1 / 内置 powershell 工具 / Notepad 默认 / Alt+Enter 重映射提示多点证实，但 Windows 专页的已知坑（如终端模拟器兼容清单）未读到。
3. **permission-gate.ts 中段代码被截断**：本文件记录了头部与 `tool_call` 拦截结构，`ctx.ui` 确认交互与 `{"confirm": true}` 返回处的逐字代码需回仓库核对，切勿引用本文占位段。
4. **作者博客（2025-11-30）全文只抓到前段**：已确认其包含系统提示词设计、四工具集、自定义斜杠命令示例与"~120 行最小 agent 核心"等内容，但后半部分（若含社区工作流章节）未读全；博客示例用旧作用域 `@mariozechner/pi-ai`，与当前 `@earendil-works` 包名存在时间差。
5. **pi.dev 官网"15+ providers"与 README 约 30 家 key-provider 列表口径不一**：推测为文档更新节奏差异，未找到官方澄清。
6. **中文社区（知乎/掘金/V2EX 等）的 pi 真实用法本次未搜到结果**：WebSearch 返回以英文内容为主，中文一手案例缺失，不等于不存在。
7. **can1357/oh-my-pi、pi-mom、@termdraw/pi 的仓库内容均未逐仓库核验**：仅来自官方站点与二手综述转述。
