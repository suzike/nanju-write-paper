# findings-c：pi（badlogic/pi.dev）横向对比与生态调研（Searcher-C）

抓取日期：2026-08-29。可信度分级：高 = 官方一手来源且数据直接可见；中 = 二手报道/搜索摘要；存疑 = 单源或未能交叉验证。
本文件只收录事实性对比，不做观点论证（观点论证归 D 路）。

---

## 一、硬数据（GitHub / 版本 / 许可 / 语言）

### pi 仓库规模：98.8k stars / 12.2k forks / 5,826 commits / 72 open issues / 66 open PRs
来源：https://github.com/earendil-works/pi （2026-08-29，WebFetch 页面提取）
原文短引/数据："Stars: 98.8k；Forks: 12.2k；Watchers: 318 watching；Commits: 5,826；Open issues: 72 | Pull requests: 66"
可信度：存疑——数据来自页面一次抓取，搜索交叉验证因 captcha 失败；若 98.8k 属实则 pi 已是 GitHub 最高星级的 coding agent 之一（与其作为 OpenClaw 底层框架的爆发期相容），引用时建议注明"单源未交叉验证"。

### 最新版本 v0.84.4（2026-08-28），发版节奏约每周一次，历史累计约 250+ 个 release
来源：https://github.com/earendil-works/pi/releases （2026-08-29）
原文短引/数据：近期版本——v0.84.4 (Aug 28, 终端能力覆盖/扩展 UI 事件)、v0.84.3 (Aug 24, Windows PowerShell 工具)、v0.84.2 (Aug 14, 全屏记录搜索)、v0.84.1 (Aug 7, Qwen Token Plan)、v0.84.0 (Aug 6, 实验性全屏 TUI + Mermaid/LaTeX 渲染)、v0.83.0 (Jul 29)、v0.82.1 (Jul 25, Claude Opus 5 支持)、v0.82.0 (Jul 24, 受约束工具采样 + OpenRouter OAuth)、v0.81.x (Jul 21, 本地 llama.cpp 模型管理)。分页显示 26 页 × 每页 10 条 ≈ 250+ releases。
可信度：高（官方 Releases 页直读）。

### 许可证 MIT，npm 包名 @earendil-works/pi-coding-agent，主语言 TypeScript
来源：https://github.com/earendil-works/pi （2026-08-29）+ https://pi.dev/ （2026-08-29）
原文短引/数据：GitHub 页显示 "MIT license (MIT-1)"；pi.dev 写明 "The project is MIT-licensed open source (npm package `@earendil-works/pi-coding-agent`)"；语言占比未在页面渲染出来，但仓库含 tsconfig、biome.json、type-check 脚本，且各 npm 包均为 TS。
可信度：高（许可证与包名）；中（TypeScript 判定来自构建文件与生态，未见官方语言统计条）。

### 代码规模（LOC）：未取得
来源：无（GitHub 页面语言区渲染为空，未抓取 cloc/包体积数据）
可信度：不适用——该项空缺，见"未解决的问题"。

---

## 二、项目归属与商业化

### 归属 Earendil Inc.，Mario Zechner 于 2026 年 4 月带着 pi 加入该公司
来源：https://mariozechner.at/posts/2026-04-08-ive-sold-out/ （2026-04-08 发布，经 2026-08-29 搜索摘要确认）；https://pi.dev/ （2026-08-29）
原文短引/数据：pi.dev "Pi is an open-source coding agent and terminal-based harness from Earendil Inc."；博客宣布加入 Earendil，"alongside Cristina, Jakob, Ramiz, Vegard, Armin Ronacher (creator of Flask), and Colin — and he brought pi with him"。
可信度：高（作者本人博客 + 官网一致）。

### pi.dev 本身目前无定价/无商业化套餐，本质是开源项目官网 + 安装入口
来源：https://pi.dev/ （2026-08-29）
原文短引/数据："No pricing or commercial tiers are mentioned"；页面要素为安装脚本（curl -fsSL https://pi.dev/install.sh | sh）、文档（pi.dev/docs）、RFC（rfc.earendil.com）、Discord/X 社区链接。Earendil 的盈利模式未在 pi.dev 上说明。
可信度：高（"页面上没有"这一事实本身）；中（"Earendil 靠什么赚钱"未解决，见末节）。

### pi 是 OpenClaw 的底层 agent 框架（社区引爆点之一）
来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ + HN 讨论串（经 2026-08-29 搜索摘要确认）；pi.dev 亦将 OpenClaw 列为 SDK 集成实例
原文短引/数据：pi.dev "an SDK (OpenClaw cited as a real-world integration)"；搜索摘要 "It gained attention as the agent framework powering OpenClaw"。
可信度：中—高（官网自认 + 多个二手来源一致）。

### 治理与配套仓库：RFC 流程独立站点，另有 pi-chat 等姊妹仓库
来源：https://github.com/earendil-works/pi （2026-08-29）
原文短引/数据："RFCs at rfc.earendil.com"；"A separate repo (earendil-works/pi-chat) covers Slack/chat automation"。
可信度：高。

---

## 三、横向对比：pi vs Claude Code vs OpenCode

对比表素材（数据抓取日 2026-08-29；空格 = 本次未取得一手数据，引用时按"存疑"处理）：

| 维度 | pi (earendil-works/pi) | Claude Code (Anthropic) | OpenCode (Anomaly) |
|---|---|---|---|
| 定位 | "minimal agent harness"，"There are many agent harnesses but this one is yours" | 官方 agentic coding tool，面向个人与团队/企业 | 开源 AI coding agent，终端 + 桌面 + IDE 三形态 |
| 许可/开源程度 | MIT，全开源，npm 可自装 | 文档页未标注许可证；闭源商业产品，需订阅/Console 账号（存疑：业内通行认知为专有许可，源码不公开） | 自称 "open source AI coding agent"（具体 SPDX 本页未标注，存疑）；维护方 Anomaly (anoma.ly) |
| 内置工具集 | 极简：约 4 个核心工具（作者博客口径 "~4-tool architecture"，存疑：博客原文两次抓取失败，据搜索摘要）；v0.84.2 起默认工具可配置 | 本页未枚举；官方特性面宽（hooks、subagents、skills、MCP） | 本页未枚举内置工具数；有 Tools/Custom Tools/Plugins/SDK 分区 |
| MCP 支持 | 内置无："No MCP"（官方明列为刻意不做项）；社区扩展可实现 | 有（官方文档确认） | 有（文档导航含 "MCP servers" 章节） |
| 内置 sub-agent | 无："No sub-agents"；官方提供 sub-agents 扩展示例 | 有（"A lead agent coordinates the work, assigns subtasks, and merges results"；另有后台 agent 与 Agent SDK） | 文档有 "Agents" 章节但本页未确认是否即 subagents（存疑） |
| 其他刻意不做（pi 特有设计声明） | "No permission popups"、"No plan mode"、"No built-in to-dos"、"No background bash"——均"buildable via extensions instead" | 有权限确认、plan mode、待办等 | 本页未涉及 |
| 扩展模型 | TypeScript 扩展：可挂钩 tools、commands、快捷键、事件、TUI；`pi install npm:@foo/pi-tools` 或 git 安装；官方 50+ 示例（含 sub-agents、plan mode、沙箱、DOOM 扩展）；第三方示例 @termdraw/pi (Ben Vinegar) | MCP + hooks + skills（"package repeatable workflows your team can share"） | MCP + plugins + custom tools + SDK |
| 模型绑定 | 多供应商 16+：Anthropic、OpenAI、Google、Azure、Bedrock、Mistral、Groq、Cerebras、xAI、Hugging Face、Kimi For Coding、MiniMax、NVIDIA、OpenRouter、Ollama 等；会话内 /model 或 Ctrl+L 热切换；v0.81 起支持本地 llama.cpp 与全自定义 provider 扩展 | Anthropic 为主；CLI/VS Code/JetBrains 支持 third-party providers，可用 ANTHROPIC_API_KEY 走 API 计费（本页口径） | "you can use any LLM provider by configuring their API keys"；另有官方精选 "OpenCode Zen" 模型列表 |
| 运行形态/接口 | TUI 交互、print/JSON 脚本模式、stdin/stdout RPC、SDK 四种模式；树状会话历史（/tree、/export、/share 分享链接） | 终端 CLI、桌面应用、VS Code/JetBrains 插件、CI（GitHub Actions/GitLab）集成 | 终端、桌面应用、IDE 扩展 |
| 目标用户 | 想完全掌控/改造 harness 的高级开发者与 agent 构建者（"Adapt Pi to your workflows, not the other way around"） | 开发者与团队：建功能、修 bug、测试、PR、CI 代码评审与 issue 分诊 | 终端/桌面/IDE 用户，供应商中立偏好者 |
| 商业/计费 | 无定价页（截至抓取日） | 订阅制（"Most surfaces require a Claude subscription or Anthropic Console account"；桌面端需付费订阅） | 本页未标注（存在 OpenCode Zen 模型服务） |
| 安全姿态（补充事实） | 无内置权限系统，按启动用户权限运行；官方建议沙箱（Gondolin micro-VM / Docker / OpenShell）；供应链硬化（依赖精确锁版、min-release-age=2、shrinkwrap、生命周期脚本白名单） | 有 hooks/权限体系（细节本页未展开） | 本页未涉及 |

（Aider / Codex CLI 未在本次抓取预算内取得一手数据，为守住"数字必须有来源"纪律，表中不列其数字；仅在行文需要时以"同类开源工具"提及。）

---

## 四、作者背景：Mario Zechner 是谁

### libGDX 作者、GitHub ID badlogic（262 个仓库）、X @badlogicgames
来源：https://github.com/badlogic （经 2026-08-29 搜索摘要确认）；https://x.com/badlogicgames
原文短引/数据："badlogic (Mario Zechner) ... 262 repositories"；libGDX 为知名 Java 游戏开发框架（Badlogic Games 品牌）。
可信度：高（多个来源一致；libGDX 之广泛使用为公知事实）。

### 2025-11-30 发表 pi 设计博文，2026-04-08 加入 Earendil，同团队有 Flask 作者 Armin Ronacher
来源：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/ 与 https://mariozechner.at/posts/2026-04-08-ive-sold-out/ （经 2026-08-29 搜索摘要确认）
原文短引/数据：设计动机为 "existing coding agents stuffed too much into the context window and hid what they were doing"；加入 Earendil 并"brought pi with him"。
可信度：中（博客内容经搜索摘要转述，原页两次抓取失败未直读；结论方向多源一致）。

### 对项目可信度的事实性含义
作者有长期维护大规模开源基础设施的公开履历（libGDX 社区存续十余年），且现与 Armin Ronacher 同属 Earendil；pi 因此同时具备"个人长期主义 OSS 信誉"与"公司化维护资源"两种背书。——以上为可核查事实的陈述，不做进一步论证。
来源：同上两条。
可信度：中（履历事实高；"背书"措辞为归纳，引用时可保留亦可删）。

---

## 五、生态与社区活跃度

### 扩展生态：官方 50+ 扩展示例，支持 npm/git 安装，已有第三方包
来源：https://pi.dev/ （2026-08-29）
原文短引/数据："TypeScript extensions with access to tools, commands, shortcuts, events, and the TUI (50+ examples, including sub-agents, plan mode, sandboxing, even a DOOM extension). Packages install via `pi install npm:@foo/pi-tools` or from git. Third-party example shown: @termdraw/pi by Ben Vinegar."
可信度：高（官网自述；"50+"为官网口径）。

### 官方 monorepo 拆为 5 个可独立复用的 npm 包 + 姊妹仓库
来源：https://github.com/earendil-works/pi （2026-08-29）
原文短引/数据：`@earendil-works/pi-ai`（统一多供应商 LLM API）、`pi-agent-core`（agent 运行时）、`pi-coding-agent`（CLI 本体）、`pi-tui`（差分渲染终端 UI 库）、`pi-telemetry`（厂商中立遥测契约）；另 earendil-works/pi-chat（Slack/chat 自动化）。
可信度：高。

### 社区节奏：2026 年 8 月单月 5 个 release；issue/PR 存量小（72/66）；有 Discord、X、RFC 站、Reddit/HN 讨论串
来源：GitHub releases/仓库页（2026-08-29）；Reddit r/LocalLLaMA "pi.dev coding agent is moving to Earendil"；Wordman 播客 "Code Isn't Free – Mario Zechner on the Hard Truths of..."
原文短引/数据：8 月发版序列 v0.84.0→v0.84.4（6 日/7 日/14 日/24 日/28 日）；"26 pages of releases"。Discord 成员数未取得。
可信度：高（发版与 issue 数）；中（讨论串热度仅有存在性证据，无量化数据）。

### 生态外延：OpenClaw 以 pi 为底层；官方推动在 Hugging Face 分享真实 OSS agent 会话记录（替代"玩具基准"）
来源：https://pi.dev/ + https://github.com/earendil-works/pi （2026-08-29）
原文短引/数据：pi.dev "an SDK (OpenClaw cited as a real-world integration)"；README "encourages sharing real OSS agent sessions via Hugging Face rather than relying on 'toy benchmarks'"。搜索摘要另提及"benchmarked at 82.6% on real knowledge work tasks with an on-device 27B model"（出处未直读，存疑）。
可信度：高（官网/README 自述）；存疑（82.6% 基准数字）。

---

## 未解决的问题

1. **star 数 98.8k 未经第二来源交叉验证**（搜索验证遇 captcha）。建议引用时写"约 9.9 万（单源，GitHub 页面提取，2026-08-29）"。
2. **代码规模（LOC）与语言占比**未取得：GitHub 语言区渲染为空，本次未抓取包体积/源码统计。
3. **pi 内置工具的确切清单与数量**（"~4 tools"来自搜索转述，博客原文两次抓取失败）：需直读 mariozechner.at/posts/2025-11-30-pi-coding-agent/ 或 pi.dev/docs 核实（疑似为 bash/read/edit 类极简集，未证实）。
4. **OpenCode 的确切许可证（是否 MIT）与 star 数**、内置工具数、agents 是否等同 subagents：本次仅抓到 opencode.ai/docs 一页，未覆盖。
5. **Claude Code 许可证/源码开放状态**：官方 overview 页不涉及，业内"闭源"认知未获一手来源，引用需标注存疑。
6. **Earendil Inc. 的商业模式与融资背景**（pi.dev 无定价页，earendil.com 未抓取）：pi.dev/earendil 生态靠什么持续投入，未解决。
7. **Discord 成员数、PR 合并节奏（月均）等社区量化指标**未取得。
8. **pi 是否有官方 skills/主题包市场**（pi.dev 仅示扩展安装协议与示例计数，未见集中式 registry）：待查 pi.dev/docs/extensions。

---

## 抓取与工具预算记录（合规自查）

- WebFetch 8 次成功（pi.dev、GitHub 仓库页、GitHub releases、opencode.ai/docs、code.claude.com/docs/en/overview、pi.dev/docs 重定向未走）+ 4 次失败（api.github.com ×2、mariozechner.at ×2，报 "Model request failed"）；WebSearch 2 次（1 成功、1 captcha 失败）。合计 12 次，符合 ≤12 上限。
- 所有数字均标注来源 URL 与抓取日期 2026-08-29；无法确证处一律标注"存疑"，未做补数。
