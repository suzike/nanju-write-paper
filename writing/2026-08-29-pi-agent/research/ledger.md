# Research Ledger · pi（2026-08-29）

格式：`编号 | 结论 | 来源 | 独立来源数 | 状态 | 拟用章节`
状态：supported = 可直接引用；weak = 单源/转引，文中需标注口径。详见 findings-{a,b,c,d}.md 对应小节。

| # | 结论 | 来源 | 源数 | 状态 | 章节 |
|---|---|---|---|---|---|
| L1 | agent loop 内置于 pi-ai：流式+工具参数聚合+结果回填，循环至模型不再调工具，无步数上限 | a§1.1-1.2 作者博客 | 1 | supported | 02 |
| L2 | 系统提示词+全部工具定义 <1000 tokens | a§2.2 | 1 | supported | 02,03 |
| L3 | 默认四工具 read/write/edit/bash；grep/find/ls 为可选只读默认关（`pi --tools`）；另有 Windows powershell 工具 | a§2.1,2.7 + b§3 README | 2 | supported | 03 |
| L4 | 官方 Philosophy 六个"No"：No MCP / No sub-agents / No permission popups / No plan mode / No built-in to-dos / No background bash，均给替代路径 | b§3 README 逐字 | 1官方 | supported | 03 |
| L5 | 无内置权限系统，按启动用户权限运行，官方建议 Docker/微 VM 沙箱 | a§2.8 README | 1 | supported | 03 |
| L6 | 会话为 JSONL 树（id/parentId/active leaf），`~/.pi/agent/sessions/` 按目录组织；/tree /fork /clone /compact /export /share；分支切换可摘要 | a§3 + b§3 | 2 | supported | 04 |
| L7 | 单仓 5 包：pi-ai / pi-agent-core（"Everything is an event"薄层）/ pi-tui（差分渲染）/ pi-coding-agent / pi-telemetry；无 pi-web | a§4 | 1 | supported | 02 |
| L8 | pi-ai 多 provider：Anthropic/OpenAI/Google/xAI/Groq/Cerebras/OpenRouter 等 + GLM/Qwen/Kimi/DeepSeek/MiniMax 等模型 | a§4.2 + b§2 | 2 | supported | 02,06 |
| L9 | AGENTS.md 是唯一注入上下文（全局+项目两级）；系统提示词可整体替换（.pi/SYSTEM.md）；认 CLAUDE.md | a§5 + b§3 | 2 | supported | 02,04 |
| L10 | 安装 `npm i -g --ignore-scripts @earendil-works/pi-coding-agent`（bin=pi）；engines node≥22.19.0；v0.84.4；Windows 有 install.ps1 + 内置 powershell 工具 | b§1 npm registry+README | 2 | supported | 04 |
| L11 | 登录：/login 订阅（Claude Pro/Max、ChatGPT Codex、Copilot）或 ~30 家 API key；本地 llama.cpp/Ollama；自定义走 models.json/扩展 | b§2 | 1官方 | supported | 04,06 |
| L12 | 24 个斜杠命令全表；快捷键（Ctrl+L 模型、Ctrl+P 轮换、Shift+Tab 思考档、Esc×2=/tree）；Enter=steering / Alt+Enter=follow-up 消息排队 | b§3 | 1官方 | supported | 04 |
| L13 | 扩展 = 默认导出 `(pi: ExtensionAPI)=>void`；三件套 registerTool/registerCommand/on("tool_call")；protected-paths.ts 完整源码；目录 ~/.pi/agent/extensions/ 与 .pi/extensions/；`pi install npm:/git:` | b§4 官方源码 | 1 | supported | 05 |
| L14 | Skills 遵循 agentskills.io 标准（/skill:name）、prompt templates（/name）、themes；pi-package 经 npm/git 分发；官方警示第三方包全系统权限 | b§5 | 1 | supported | 05 |
| L15 | 社区包：oh-my-pi（hash 锚定编辑+LSP+浏览器+子代理）、pi-mom（Slack）、pi-doom、@termdraw/pi | b§5 官网+二手综述 | 1-2 | weak（转述口径） | 05 |
| L16 | GitHub 98.8k stars / 12.2k forks / 5,826 commits | c§1 页面单源抓取 | 1 | weak（标注单源与日期） | 01 |
| L17 | 最新 v0.84.4（2026-08-28）；约 250+ releases；2026-08 单月 5 个版本 | c§1 releases 页 | 1官方 | supported | 01 |
| L18 | MIT 许可；TypeScript monorepo；RFC 站 rfc.earendil.com | c§1 + a§4.9 | 2 | supported | 06,07 |
| L19 | 2026-04-08 Zechner 宣布加入 Earendil（与 Flask 作者 Ronacher 同队）；仓库与 npm scope 随之迁移 | c§2 + d§四 + b§1 | 3 | supported | 01,07 |
| L20 | pi.dev 无定价/商业套餐（页面缺失性事实） | c§2 | 1 | supported | 07 |
| L21 | OpenClaw 以 pi 为底层 agent 框架（官网自认 SDK 集成 + Ronacher 原文） | c§2 + d§四 | 2 | supported | 01 |
| L22 | Ronacher 评述三连："The most obvious omission is support for MCP" / "no community skills, nothing" / 对桥接可靠性 "Or not, I don't know :)"；其自称 shill 且与 Zechner 同队（引用须披露立场） | d§1 A级原文 | 1 | supported | 07 |
| L23 | Reddit 实测："very minimal, only four tools… No find tool, no git tool. No sub-agents built in." | d§1-3 B级转引（反爬未读全帖） | 1 | weak | 07 |
| L24 | 社区以 "enshitification" 立帖质疑商业化；Zechner 承诺 "pi is MIT licensed. It will stay MIT licensed…Nothing changes."；未来商业功能走 Fair Source（RFC 0015 转述） | d§三/四 | 1-2 | supported（RFC 细节 weak） | 07 |
| L25 | 防误用：HN 广传的 "linear flow… frustrating and limiting" 出自 Zechner 批评别家，不是对 pi 的批评 | d 防失真声明 | 1 | supported | （写作纪律） |
| L26 | 作者动机：现有 agent "stuffed too much into the context window and hid what they were doing" | c§四 B级转述 | 1 | weak | 01 |

**声明不覆盖**：Windows 实际体验引句（零直接证据）、中文社区一手案例（未检索到）、Earendil 商业模式、Discord 量化数据、无权限系统的实际事故（无案例，禁止渲染）。
**回答率**：主线+子问题 5/5 已答，反方 2/2 已答 → 放行。
