# pi（coding agent）原理与架构调研 — Searcher-A（原理与架构维度）

- 调研对象：Mario Zechner（badlogic）的开源极简 coding agent **pi**，仓库 `earendil-works/pi`（GitHub About："AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI"），官网 pi.dev。
- 调研/访问日期：2026-08-29。注意：本调研的 pi 是 coding agent，不是 Physical Intelligence 的机器人模型 π0。
- 格式说明：每条素材 = 结论一句话 + 来源 + 原文短引 + 可信度。可信度标注含义：官方=作者博客/官网/官方仓库 README 与 docs；工程=从仓库页面/API 抓取的工程事实；社区=社区资料（本次基本未用）。

---

## 一、Agent loop 如何实现

### 1.1 agent loop 内置于 pi-ai 层，负责全部编排，循环直到模型停止调用工具
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （作者博客，发布 2025-11-30 / 访问 2026-08-29）
- 原文短引："pi-ai contains an agent loop implementation that handles all the orchestration: streaming responses, tool call arguments aggregation, checking for tool calls, executing the tools, and appending the tool results as tool messages to the context, looping until the model stops calling tools."
- 可信度：官方

### 1.2 循环无最大步数限制，直到模型自行判定完成
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：作者强调 loop 的终止条件是模型不再发起 tool call，即"runs until the model decides it's done"（由模型决定何时结束，而非外部步数上限）。
- 可信度：官方

### 1.3 与模型交互通过统一 LLM API：流式 + 工具调用（TypeBox schema 校验）+ thinking + token/cost 统计 + 跨 provider 上下文接力
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：博客描述 pi-ai 提供 "streaming, tool calling with TypeBox schemas, thinking support, cross-provider context handoffs, token/cost tracking" 等能力（作者对 pi-ai 职责的自述）。
- 可信度：官方

### 1.4 pi-agent-core 是 pi-ai 之上的薄层：Agent 类 + 状态管理 + 事件订阅 + 消息排队 + 传输抽象
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：pi-agent-core 被描述为 "a thin, transparent layer on top of pi-ai"，提供 Agent 类、状态管理、事件订阅、两种模式的 message queuing、附件处理，以及 HTTP/WebSocket/内存等 transport 抽象；设计口号是 "Everything is an event"。
- 可信度：官方

### 1.5 CLI 有三种运行模式：交互式 TUI、print 模式、headless（JSON 流式 / RPC）
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：博客提到 pi 支持 interactive、print、headless（JSON streaming and RPC mode）等模式，headless 通过流式 JSON 对接程序化使用。
- 可信度：官方

---

## 二、为什么只有 read/write/edit/bash 四个工具

### 2.1 核心论点：coding agent 只需要四个工具，其余工具基本是 bash 的语法糖
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：作者论证 "a coding agent really only needs four tools: read, write, edit, and bash"，理由是模型会被训练适配这类最小 schema，额外工具与 bash 能力重叠。
- 可信度：官方

### 2.2 系统提示词 + 全部工具定义合计低于 1000 tokens
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引："pi's system prompt and tool definitions together come in below 1000 tokens."（精简 prompt 是刻意设计，把上下文留给代码。）
- 可信度：官方

### 2.3 系统提示词极短、鼓励自主完成，并内置"未知符号先查证"的 grounding 指令
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：系统提示词开头为 "You are an expert AI agent connected to a shell. Your primary goal is to complete the user's requested tasks using the tools available."；并包含 "You don't need to ask for permission. The user expects you to work autonomously until the task is complete." 以及对未知符号/函数/API 的指令："If you identify an unknown symbol, function, or API: list all relevant candidate sources. Explore each one systematically to ground your understanding in verifiable code or documentation."
- 可信度：官方

### 2.4 read 工具：分页 + 行号，支持 offset 读大文件，支持图片
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：read 工具对大文件做分页读取（带行号与 offset 参数），博客指出各家模型都被训练过处理这种分页式 read 输出；也支持读取图片。
- 可信度：官方

### 2.5 write 工具：全量覆盖写文件；edit 工具：简单 diff 格式 + 模糊匹配
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：write 即整文件覆盖写入；edit 采用简单的 diff（old/new 文本对）格式并带模糊匹配（fuzzy matching），以容忍模型输出中的细微空白差异。
- 可信度：官方

### 2.6 bash 工具：执行命令 + 超时配置 + 后台运行，仅此而已
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引："Bash is a simple tool. You pass it a command and it executes it"，作者提到后来仅增加了 timeout 设置与后台（background）运行支持，再无其他。
- 可信度：官方

### 2.7 另有可选只读工具（grep/find/ls 等）但默认关闭，用 `pi --tools` 启用
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：博客给出示例 `pi --tools read,grep,find,ls` 用于只读/受限场景；说明这组额外 read-only 工具存在但非默认。
- 可信度：官方

### 2.8 无内置权限系统：以启动用户的权限直接运行，官方建议容器化/沙箱
- 来源：https://github.com/earendil-works/pi （README，访问 2026-08-29）
- 原文短引：README 说明 Pi 不内置 permission 系统，"runs with the permissions of the user and process that launched it"，推荐用 Docker、Gondolin micro-VM、OpenShell 等容器化/沙箱方案；另见 `packages/coding-agent/docs/containerization.md`。
- 可信度：官方

---

## 三、Session 管理机制

### 3.1 会话自动保存为 JSONL 树结构文件，存于 `~/.pi/agent/sessions/`，按工作目录组织
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （官方 docs，访问 2026-08-29）
- 原文短引："Sessions auto-save to `~/.pi/agent/sessions/`, organized by working directory. Each session is a JSONL file with a tree structure."
- 可信度：官方

### 3.2 每个 entry 带 `id` 与 `parentId`，当前所在位置是 active leaf —— 分支（tree/branching）是会话的一等结构
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （访问 2026-08-29）
- 原文短引："Sessions are stored as trees. Every entry has an `id` and `parentId`, and the current position is the active leaf. `/tree` lets you jump to any previous point and continue from there without creating a new file."
- 可信度：官方

### 3.3 CLI 会话参数：continue / resume / no-session / session / fork
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （访问 2026-08-29）
- 原文短引：`pi -c`（继续最近会话）、`pi -r`（浏览并选择历史会话）、`pi --no-session`（临时模式不保存）、`pi --session`（指定会话文件或部分会话 ID）、`pi --fork`（把某会话 fork 成新会话）。
- 可信度：官方

### 3.4 交互内会话命令：/resume /new /name /session /tree /fork /clone /compact /export /share
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （访问 2026-08-29）
- 原文短引：docs 给出命令表：`/tree`（同文件内浏览分支树）、`/fork`（从早期 user message 开新会话文件）、`/clone`（复制当前 active branch 为新会话）、`/compact [prompt]`（压缩旧上下文）、`/export`（导出 HTML）、`/share`（上传为私有 GitHub gist 并生成可分享 HTML 链接）。
- 可信度：官方

### 3.5 多会话选择器与命名；删除走 trash 而非永久删除
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （访问 2026-08-29）
- 原文短引："`/resume` opens an interactive session picker for the current project"（支持搜索、按路径显示切换 Ctrl+P、排序切换 Ctrl+S、命名过滤 Ctrl+N、重命名 Ctrl+R、删除 Ctrl+D）；"When available, pi uses the `trash` CLI for deletion instead of permanently removing files."
- 可信度：官方

### 3.6 切换分支时可对被放弃分支做摘要（branch summaries）挂到新位置
- 来源：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md （访问 2026-08-29）
- 原文短引："When `/tree` switches away from one branch to another, pi can summarize the abandoned branch and attach that summary at the new position."
- 可信度：官方

---

## 四、pi-mono 单仓分层组成

### 4.1 仓库定位与包列表（5 个 npm 包，均为 @earendil-works scope）
- 来源：https://github.com/earendil-works/pi （README / 仓库 About，访问 2026-08-29）
- 原文短引：仓库 About："AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI"。README 包表：`@earendil-works/pi-coding-agent`（Interactive coding agent CLI）、`@earendil-works/pi-agent-core`（Agent runtime with tool calling and state management）、`@earendil-works/pi-ai`（Unified multi-provider LLM API (OpenAI, Anthropic, Google, etc.)）、`@earendil-works/pi-tui`（Terminal UI library with differential rendering）、`@earendil-works/pi-telemetry`（Vendor-neutral telemetry contracts, reference adapter, conformance tests, and typed schemas）。仓库目录含 `packages/agent`、`packages/ai`、`packages/coding-agent` 等（GitHub contents API，访问 2026-08-29）。
- 可信度：官方/工程

### 4.2 pi-ai：统一多 provider LLM API + 内置 agent loop，是最底层
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：pi-ai 支持 provider：Anthropic、OpenAI、Google、xAI、Groq、Cerebras、OpenRouter 及任意 OpenAI 兼容 endpoint；博客模型表列出 GLM、MiniMax、Qwen、Claude、GPT、Gemini、Grok、Kimi、DeepSeek；能力包括流式、TypeBox 工具调用、thinking、跨 provider 上下文接力、token/成本统计。
- 可信度：官方

### 4.3 pi-agent-core（目录 packages/agent）：在 pi-ai 之上的运行时薄层
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29） + https://github.com/earendil-works/pi （README）
- 原文短引：README："Agent runtime with tool calling and state management"；博客：thin, transparent layer，提供 Agent 类、状态、事件、消息排队、附件、传输抽象（HTTP/WebSocket/内存）。
- 可信度：官方

### 4.4 pi-tui：retained mode + 差分渲染的自研终端 UI 框架
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29） + https://github.com/earendil-works/pi （README）
- 原文短引：README："Terminal UI library with differential rendering"；博客：retained-mode TUI，differential rendering，synchronized output，不用 ncurses，自研 ANSI 后端，内置 Editor、Markdown、Image、Loader、Tabs 等组件。
- 可信度：官方

### 4.5 pi-coding-agent（目录 packages/coding-agent）：组装层，负责 session、扩展、主题、上下文文件与三种模式
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29） + https://github.com/earendil-works/pi （README）
- 原文短引：README："Interactive coding agent CLI"；博客：负责 "wiring everything together"——session 管理、扩展系统（自定义工具、事件处理、自定义命令、键绑定、TUI 组件）、themes、project context files，以及 interactive/print/headless 三种模式。
- 可信度：官方

### 4.6 pi-telemetry：vendor 无关的遥测契约包（README 新列，博客未提）
- 来源：https://github.com/earendil-works/pi （README，访问 2026-08-29）
- 原文短引："Vendor-neutral telemetry contracts, reference adapter, conformance tests, and typed schemas."
- 可信度：官方

### 4.7 关于 pi-web：未找到 pi-web 包的公开资料
- 来源：https://github.com/earendil-works/pi （README + packages 目录，访问 2026-08-29）
- 原文短引：README 包表与 packages 目录均未见 pi-web；README 文档链接另指向独立仓库 earendil-works/pi-chat（Slack/chat 自动化）与官网 pi.dev（docs 位于 pi.dev/docs/latest）。
- 可信度：官方（缺失性证据，按"未找到公开资料"处理）

### 4.8 npm scope 曾迁移：作者博客示例用 @mariozechner/，现 README 用 @earendil-works/
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30）与 https://github.com/earendil-works/pi （访问 2026-08-29）对比
- 原文短引：博客代码示例导入 `@mariozechner/pi-ai`；当前 README 表中全部包为 `@earendil-works/pi-*`。两边口径不同，提示仓库/包 scope 在博客发布后迁移至 earendil-works。当前精确版本号未核实（见"未解决的问题"）。
- 可信度：官方（两处一手来源对比）

### 4.9 许可证与仓库形态
- 来源：https://github.com/earendil-works/pi （访问 2026-08-29）
- 原文短引：License：MIT；单仓多包（monorepo，packages/ 目录），README 开发流程为 `npm install --ignore-scripts` / `npm run build` / `npm run check` / `./test.sh`；项目规则文件 AGENTS.md，RFC 站点 rfc.earendil.com。
- 可信度：工程（页面抓取）

---

## 五、项目上下文文件机制（PI.md / AGENTS.md）

### 5.1 AGENTS.md 是唯一被注入的项目上下文：全局一份 + 项目一份，注入在系统提示词底部
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引："The only thing that gets injected at the bottom is your AGENTS.md file. Both the global one that applies to all your sessions and the project-specific one stored in your project directory."（分层：全局 → 项目级）
- 可信度：官方

### 5.2 AGENTS.md 之外的上下文不加戏，甚至允许整体替换系统提示词
- 来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ （2025-11-30 / 2026-08-29）
- 原文短引：作者强调 pi 对 prompt/上下文注入保持极简（无隐藏注入），"You can even replace the full system prompt if you want to."
- 可信度：官方

### 5.3 PI.md 兼容性：未找到公开资料
- 来源：经博客、GitHub README 与 docs 检索（访问 2026-08-29）
- 原文短引：未在已获取的官方资料中发现 pi 支持 `PI.md` 或与 `PI.md` 兼容的表述；官方口径统一使用 `AGENTS.md`。
- 可信度：官方（缺失性证据）

---

## 未解决的问题

1. **pi-web**：未找到该包。README 包表（pi-coding-agent / pi-agent-core / pi-ai / pi-tui / pi-telemetry）与 packages 目录均无 pi-web；仅见独立仓库 earendil-works/pi-chat。若任务方预期存在 pi-web，可能指旧版仓库布局（作者博客时期）或误记，待后续调研确认。
2. **GitHub star 数**：README 页面抓取摘要报 98.8k stars / 12.2k forks，但未能通过 API 二次核实（抓取结果截断），暂不采信，本文未引用。
3. **session 文件 JSONL 的完整字段规格**：已确认树结构（id/parentId/active leaf），但 `packages/coding-agent/docs/session-format.md` 的完整 entry 类型与字段列表未读到（该文件存在，引用于 sessions.md），entry 细粒度 schema 待补。
4. **npm 包当前精确版本号**：未核实（仅确认 scope 为 @earendil-works/）。
5. **PI.md 兼容**：官方资料中未发现，不排除在 changelog/RFC 中有相关讨论，待查 rfc.earendil.com。
6. **扩展系统的具体文件放置路径**（如自定义工具放哪个目录）：博客与已读 docs 未给出确切路径，待查 packages/coding-agent/docs 下 extensions 相关文档。
