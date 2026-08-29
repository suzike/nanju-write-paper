---
title: pi 解剖：四个工具、六个"不做"，和一个 9.9 万星的开源实验
subtitle: A MINIMAL AGENT HARNESS
series: DEV NOTES
---

# pi 解剖：四个工具、六个"不做"，和一个 9.9 万星的开源实验

先交代方法：这篇文章全部基于公开材料写成，README、源码、作者博客、第三方批评，每处引用都给了出处，单一看源的数字我会标出来。我没有跑过任何基准测试，也没有受雇于任何人。你要较真，可以顺着编号去查。

2026 年的 coding agent 竞赛是一道加法题。MCP、sub-agent、plan mode、hooks、权限确认、后台任务，每家都在往里塞。有个项目反着来：默认只给模型四个工具，README 里一整节写的全是"我们刻意不做什么"。它叫 pi，GitHub 页面显示约 9.9 万星（单源抓取，2026-08-29，见文末说明），还是另一个爆火项目 OpenClaw 的底层框架。

它是什么，凭什么，代价是什么。下面三部分把这三个问题讲完。

## 缘起：为什么又是一个 agent (WHY)

<!-- fig-1 芯片链时间线：2025-11-30 发布 → 2026-01-31 Ronacher 评述 → 2026-04-08 加入 Earendil → 2026-08-28 v0.84.4 -->

写 pi 的人叫 Mario Zechner，GitHub ID 是 badlogic，老玩家应该眼熟：Java 游戏框架 libGDX 就是他的作品，维护了十几年。按他自己的说法，做 pi 是因为现有的 coding agent "往上下文窗口里塞了太多东西，还把正在发生的事藏起来"（大意，出自其 2025-11-30 的设计博文，原文为英文）。

时间线不复杂。2025 年 11 月 30 日，他发博文宣布 pi，定位是 "opinionated and minimal coding agent"。两个多月后，Flask 的作者 Armin Ronacher 写了篇长文捧场。2026 年 4 月 8 日，Zechner 发了篇标题很直白的文章，《I've sold out》，宣布带着 pi 加入 Earendil 公司，同队名单里有 Ronacher。仓库从 badlogic 名下迁到 earendil-works，npm 包名也跟着换了。到我写这篇文章时，最新版本是 v0.84.4（2026-08-28），仅 8 月就发了 5 个版本，历史上累计约 250 个 release。

还有个绕不开的引爆点：OpenClaw。这个 2026 年初病毒式走红的工具，底层 agent 框架就是 pi。官网上把 OpenClaw 列为 SDK 集成的实例，Ronacher 的文章里也明说了这层关系。

第一眼看到那个星数我以为是写错了。后来想明白了，它早就不是"个人项目"三个字能概括的东西。

## 架构解剖：一切皆事件 (ARCH)

<!-- fig-2 分层架构图：pi-ai（统一 LLM API + agent loop）→ pi-agent-core（事件运行时）→ pi-coding-agent（CLI 组装）+ pi-tui -->

pi 的仓库是个 TypeScript monorepo，拆成五个能独立安装的 npm 包。从下往上数：pi-ai、pi-agent-core、pi-tui、pi-coding-agent、pi-telemetry。我数过，没有一个包名字里带 platform 或者 engine。

最底下那层 pi-ai 名字像模型适配层，实际上把 agent loop 也做进去了。流式输出、工具参数聚合、执行工具、把结果回填进上下文，全在这一层，一直循环到模型不再发起工具调用为止。没有最大步数限制，什么时候停由模型自己判断。这层还管掉了不少脏活：流式、带 TypeBox schema 校验的工具调用、thinking 支持、跨 provider 的上下文接力、token 与成本统计。

模型接入面是 pi 少有的"宽"：Anthropic、OpenAI、Google、xAI、Groq、Cerebras、OpenRouter 都有，国产的 GLM、Qwen、Kimi、DeepSeek、MiniMax 也在列表里，还支持任意 OpenAI 兼容端点。

中间层 pi-agent-core 在博客里的自我定位是"a thin, transparent layer"，薄薄一层运行时：Agent 类、状态管理、事件订阅、消息排队、HTTP/WebSocket/内存三种传输抽象。设计口号是 "Everything is an event"，一切皆事件。TUI 这层 pi-tui 是自研的，retained mode 加差分渲染，没用 ncurses。最上面的 pi-coding-agent 负责组装：会话、扩展、主题、上下文文件，加上交互式、print、headless 三种运行模式。headless 模式走 JSON 流或 RPC，意味着你可以把 pi 当零件焊进自己的程序里，而不是只把它当一个终端工具。还有个 pi-telemetry 包，做厂商中立的遥测契约，这层在作者当年的博客里都还没出现，是后来长出来的。

它的上下文纪律也值得单独说。整个项目里，只有 AGENTS.md 一个东西会被注入提示词，全局一份、项目一份，塞在系统提示词底部。除此之外不加戏，你甚至可以用 `.pi/SYSTEM.md` 把整个系统提示词换掉。

压轴的数字是这个：系统提示词加全部工具定义，加起来不到 1000 tokens。省下来的上下文，全留给了你的代码。

## 四工具哲学 (PHILOSOPHY)

<!-- fig-3 六个"No"对照表：声明 / 官方替代路径 -->

pi 默认给模型四个工具：read、write、edit、bash。read 带分页和行号，能读图片；write 整文件覆盖；edit 用简单的 diff 格式加模糊匹配；bash 就是 bash，加了个超时和后台运行。作者的理由写在博客里：模型都被训练过处理这种最小 schema，其他工具多半是 bash 的语法糖。grep、find、ls 这几个只读工具存在，默认关着，`pi --tools` 想开就开。

比四工具更有辨识度的是 README 里那节 Philosophy，六个"No"，每个后面都跟着一条替代路径，我原样抄下来：

| 刻意不做 | 官方给的替代路径 |
|---|---|
| No MCP | 用带 README 的 CLI 工具（见 Skills），或写扩展加上 MCP 支持 |
| No sub-agents | 用 tmux 起 pi 实例，或写扩展，或装别人做好的包 |
| No permission popups | 放容器里跑，或用扩展写自己的确认流程 |
| No plan mode | 计划写成文件，或写扩展，或装包 |
| No built-in to-dos | 原话是"它们会把模型搞糊涂"，用 TODO.md 或扩展 |
| No background bash | 用 tmux，全量可观测，直接交互 |

第一遍读我以为这是偷懒的体面说法。第二遍才反应过来，每个 No 后面那句"你可以自己造"才是正主，这六个 No 是立场，不是缺口。

安全这块的思路一脉相承。pi 没有内置权限系统，进程以启动它的用户权限直接跑，不弹窗、不拦截。官方的建议很干脆：放容器里去，文档里点名了 Docker、Gondolin micro-VM、OpenShell。风险没有消失，只是从工具侧挪到了环境侧，变成你的显式选择。

## 上手：十分钟到第一次扩展 (HANDS-ON)

<!-- fig-4 上手流程：安装 → 登录 → 首会话 → 会话树 -->

```bash
# 安装（Node ≥ 22.19.0，v0.84.4）
npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# 两条登录路径二选一
export ANTHROPIC_API_KEY=sk-ant-...
pi
# 或者交互里走订阅
/login
```

第一个坑在 Node 版本。npm 上的 engines 字段写死 `>=22.19.0`，而不少机器的默认 LTS 还停在 20，装之前先 `node -v` 一下。Windows 用户不用绕路，官方有 install.ps1，内置工具里还带一个 powershell（Windows 专属），连 Termux 的文档都有。

登录两条路：环境变量喂 API key，约 30 家 provider 任选；或者 `/login` 走订阅，认 Claude Pro/Max、ChatGPT Codex、GitHub Copilot 三家。想跑本地模型，llama.cpp 的 router server 是一等公民，`/login llama.cpp` 配置、`/llama` 管模型下载加载，Ollama 也在列表里。

进去之后，`/model` 或 Ctrl+L 换模型，Shift+Tab 切思考档位，Ctrl+P 在收藏的模型间轮换。最有辨识度的是会话系统：每个会话是个 JSONL 树，存在 `~/.pi/agent/sessions/` 按项目目录归档。连按两次 Escape 直接进树视图，跳回任意节点接着聊；`/fork` 从某条历史消息开新会话，`/clone` 把当前分支整个复制走，`/compact` 手工压缩上下文。

打字的时候也有讲究。Enter 排进去的是 steering 消息，当前这轮工具跑完就插进去；Alt+Enter 排的是 follow-up，等它全部干完才送。前者用来纠偏，后者用来排队喂任务。

从 Claude Code 迁移过来的用户，肌肉记忆大体能用：AGENTS.md 和 CLAUDE.md 它都认，/compact 它也有，斜杠命令一共 24 个，`/hotkeys` 可以查全量。

## 扩展系统：极简的反面是可编程 (EXTENSIONS)

<!-- fig-5 汇聚图：Extensions / Skills / Prompt Templates / Themes → 自造 sub-agent、plan mode、权限门 -->

前面六个"No"里被拒掉的能力，在扩展系统里全能造回来。这是 pi 设计里我最喜欢的部分：它不预定你的工作流，它给你改自己的工具的自由。

扩展就是一个默认导出的工厂函数。官方示例里有个 protected-paths.ts，我贴正文里这段的完整源码：

```typescript
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

这段代码我从头读到尾花了半分钟。这才是重点：你真的可以读完你的 agent 的全部行为。API 就三件事，`pi.registerTool` 注册工具、`pi.registerCommand` 注册命令、`pi.on` 挂事件。扩展放在 `~/.pi/agent/extensions/`（全局）或 `.pi/extensions/`（项目），第三方分发走 `pi install npm:@foo/pi-tools` 或 `pi install git:...`。

官方仓库里躺着 50 多个扩展示例，名单读起来像个讽刺笑话：sub-agent、plan mode、permission-gate、sandbox、custom-compaction，甚至有一个 pi-doom，等模型干活的时候玩毁灭战士。skills 那套遵循 agentskills.io 标准，`/skill:name` 调用；prompt template 放个 markdown 文件就是 `/模板名`。社区里已经有成型的第三方包，比如 oh-my-pi，把 hash 锚定编辑、LSP、浏览器、子代理打包进来（此处口径来自官网与二手综述，我没逐个核过仓库）。

当然，"能自己造"和"已经造好"是两回事。这笔账，下一章算。

## 横向定位：底盘 vs 整车 (COMPARE)

<!-- fig-6 三方对比表 -->

把 pi 放回赛道里看，它和 Claude Code、OpenCode 根本不是同一类商品。

| 维度 | pi | Claude Code | OpenCode |
|---|---|---|---|
| 定位 | 极简 agent harness | 官方全能 coding 工具 | 开源多形态 agent |
| 许可 | MIT，全开源 | 闭源商业产品（订阅制） | 开源（维护方 Anomaly） |
| 内置工具 | 4 个核心 + 可选只读 | 面宽（未公开枚举） | 未枚举 |
| MCP | 刻意不做，可扩展补 | 有 | 有 |
| sub-agent | 无内置，有示例扩展 | 有（lead agent 协调） | 有 Agents 章节形态 |
| 扩展模型 | TS 扩展 + pi package | MCP + hooks + skills | MCP + plugins + SDK |
| 模型 | 16+ 供应商 + 本地 llama.cpp | Anthropic 为主，可第三方 key | 多供应商 |
| 形态 | 纯终端（TUI/print/headless） | 终端 + 桌面 + IDE 插件 | 终端 + 桌面 + IDE |
| 计费 | 免费，pi.dev 无定价页 | 订阅制 | 未标注 |

空着的格子是我没拿到一手数据的地方，宁可空着不编。表格看完，分歧点其实只有一个：MCP。Claude Code 和 OpenCode 都把 MCP 当标配，pi 刻意不做。这决定了 pi 是"底盘"，另外两家是"整车"。底盘的好处是每一颗螺丝都能换，坏处是上路由你自己负责。

## 批判：极简的账单 (CRITIQUE)

<!-- fig-7 不该用清单 -->

现在算账。极简不是免费的，每一笔都有出处。

第一笔，无 MCP。连 pi 的头号拥趸都把这条列为第一缺点。Flask 作者 Ronacher 在那篇评述里写："The most obvious omission is support for MCP. There is no MCP support in it." 这里必须交代立场：那篇文章整体是软文，Ronacher 自称已经成了 shill，而且他写文前后和 Zechner 进了同一家公司。自己人说"这缺失最明显"，分量反而更重。MCP 在 2026 年已是事实标准，不兼容意味着所有现成 MCP 工具都不能开箱即用。官方的替代路线是写扩展或桥接，而 Ronacher 对桥接的原话是："Or not, I don't know :)"。拥趸对自家核心替代路径的可靠性，态度是"我不知道"。

第二笔，无现成生态。同一篇文章里还有一句更狠的："There is no MCP, there are no community skills, nothing." Reddit 上有篇实测帖，说法类似："No find tool, no git tool. No sub-agents built in."（转引自搜索摘要，原帖被反爬拦住，我没读到楼主最终结论。）能力获取等于自己写代码，没有装包即用的路径。

第三笔，TS 门槛。官方对"不满意"的标准答案是：直接重写 internals，它就是一堆可替换的 TypeScript 文件。这话的另一面是，深度定制的入场券是会写 TypeScript。要说明的是，我没搜到非 TS 用户抱怨这一点的直接引语，上面这句是我的推断，不是用户的声音。

第四笔，商业化悬念。2026 年 4 月收购消息出来当天，r/LocalLLaMA 上就有人立帖，标题是 "pi.dev enroute to enshitification?"。Zechner 的回应是承诺："pi is MIT licensed. It will stay MIT licensed. You can use it, fork it, build products on top of it, sell those products. Nothing changes." 同时，未来的商业功能会走 Fair Source 许可（这条来自第三方对 RFC 0015 的转述）。到发稿为止，我没找到开源用户被背刺的实例，风险是结构性的，不是已然的。但迁移成本已经真实发生过一次：仓库和 npm 包名都换了。

还有个写作之外的花絮，值得单独说。我核引文作者的时候发现，pi 最重要的几篇好评，作者要么在 Earendil，要么和它互相依存。HN 上流传最广的那句"linear flow 真让人沮丧"，我查了原文，是 Zechner 在批评别家，根本不是在骂 pi。这个圈子的好评要打折听。

最后收个清单，五种情况别用 pi：你的团队依赖现成 MCP 服务器生态；你要开箱即用的 sub-agent、内置 git 和社区 skills；你不会 TypeScript 又想深度定制；你是 IDE/GUI 重度用户；你的组织对许可分层有洁癖。

写到这里我得承认一件没查明白的事：Earendil 靠什么把 pi 变成生意。pi.dev 上没有定价页，这是我能确认的全部。

## 提炼 (SUMMARY)

六个词条收个尾。

- **缘起**：不满"塞满上下文、黑盒操作"，libGDX 作者的极简实验，被 OpenClaw 点爆。
- **架构**：五层薄切，agent loop 就在模型接入层里，系统提示词加工具定义不到 1000 tokens。
- **四工具**：read/write/edit/bash，六个"No"每个都配了替代路径，安全外包给容器。
- **上手**：一条 npm 命令，两分钟配置，会话树和消息排队是最值得练熟的两个操作。
- **扩展**：三件套 API 半分钟能读完，sub-agent、plan mode 官方示例全都有。
- **账单**：无 MCP、无现成生态、TS 门槛、商业化悬念，外加一个互推朋友圈。

一句话判断：pi 的价值不在"更好用"，在"可拥有"。你能读完它的全部行为，改掉其中任何一处，然后真正拥有你的 agent。如果你要的是一辆提包就走的车，去对面买 Claude Code；如果你想自己造车，底盘在这儿，零件清单也在这儿。

## 参考来源

- pi 官网与文档：https://pi.dev/
- 仓库与 README（Philosophy、Quick Start、Extensions、Sessions）：https://github.com/earendil-works/pi
- npm 包元数据（engines/版本）：https://registry.npmjs.org/@earendil-works/pi-coding-agent/latest
- Zechner 设计博文（2025-11-30）：https://mariozechner.at/posts/2025-11-30-pi-coding-agent/
- Zechner《I've sold out》（2026-04-08）：https://mariozechner.at/posts/2026-04-08-ive-sold-out/
- Ronacher 评述（2026-01-31，立场见正文）：https://lucumr.pocoo.org/2026/1/31/pi/
- protected-paths.ts 扩展源码：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/protected-paths.ts
- 会话文档：https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md
- GitHub Releases（v0.84.4，2026-08-28）：https://github.com/earendil-works/pi/releases
- Reddit 实测评（转引）：https://www.reddit.com/r/AI_Agent_Reviews/comments/1t62nnj/
- r/LocalLLaMA 商业化质疑帖（转引）：https://www.reddit.com/r/LocalLLaMA/comments/1u6a499/

> 说明：GitHub 星数 98.8k 为单源页面抓取（2026-08-29），未能二次核验，引用时请自行复核。oh-my-pi 等社区包的描述来自官网与二手综述，未逐仓核验。
