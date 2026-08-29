---
title: pi 解剖：四个工具、六个"不做"，和一个 9.9 万星的开源实验
subtitle: A MINIMAL AGENT HARNESS
series: DEV NOTES
---

# pi 解剖：四个工具、六个"不做"，和一个 9.9 万星的开源实验

先交代方法。这篇文章全部基于公开材料写成，README、源码、作者博客、第三方批评，每处引用都给了出处，单一看源的数据我会当场标出来。我没有跑过任何基准测试，也没有受雇于任何人。你要较真，顺着文末的来源清单去查就行。

2026 年的 coding agent 竞赛是一道加法题。MCP（Model Context Protocol，模型接工具的事实标准）、sub-agent（子代理）、plan mode、hooks、权限确认、后台任务，每家都在往里塞。有个项目反着来，默认只给模型四个工具，README 里有一整节，写的全是"我们刻意不做什么"。它叫 pi。GitHub 页面显示 98.8k stars（约 9.9 万，单源抓取，2026-08-29），它同时是另一个爆火工具 OpenClaw 的底层框架。

它是什么，凭什么，代价是什么。这是全文要回答的三个问题，顺序也是这个顺序。

## 缘起：为什么又是一个 agent (WHY)

<!-- fig-1 芯片链时间线：2025-11-30 发布 → 2026-01-31 Ronacher 评述 → 2026-04-08 加入 Earendil → 2026-08-28 v0.84.4 -->

写 pi 的人叫 Mario Zechner，GitHub ID 是 badlogic。老玩家应该眼熟，Java 游戏框架 libGDX 就是他的作品，社区养了十几年还活着。在开源世界里，这种履历自带一种信用：他见过一个项目怎么长大，也见过它怎么死。

按他自己的说法，做 pi 是因为现有的 coding agent "往上下文窗口里塞了太多东西，还把正在发生的事藏起来"（大意，出自其 2025-11-30 的设计博文，原文为英文）。这话有两层不满。前一层是空间上的，系统提示词、工具说明、各种隐藏注入，还没开始干活，上下文先被吃掉一大截；后一层是黑盒，工具在后台做了什么，你只能看个大概。pi 把这两个不满都做成了设计决策，后面每一章都能看到回声。

时间线不复杂。2025 年 11 月 30 日，他发博文宣布 pi，标题里带着 "opinionated" 这个词，固执己见的意思。两个多月后，Flask 的作者 Armin Ronacher 写了篇长文捧场，说 pi 是 "a minimal agent harness"（一个极简的 agent 执行框架）。pi.dev 官网后来把一句话挂在了首页，算是定位的自白，"There are many agent harnesses but this one is yours"。harness 这个词指包在模型外面、负责跑工具管状态的那层程序，直译过来就是，执行框架有很多，但这一个是你的。所有权，而不是体验，才是 pi 的卖点。2026 年 4 月 8 日，Zechner 发了篇标题很直白的文章，《I've sold out》，宣布带着 pi 加入 Earendil 公司，同队名单里有 Ronacher。仓库从 badlogic 名下迁到 earendil-works，npm 包名跟着换，这是后话，第七章算账。到我写这篇文章时，最新版本是 v0.84.4（2026-08-28），仅 8 月就发了 5 个版本，历史累计约 250 个 release，节奏像呼吸一样稳定。

还有个绕不开的引爆点。OpenClaw，这个 2026 年初走红（有旁证称病毒式传播，我未做量化核实）的工具，底层的 agent 框架就是 pi。官网上把 OpenClaw 列为 SDK 集成实例，Ronacher 的文章里也明说了这层关系。一个做底盘的项目，因为别人在它上面造出了爆款整车，被更多人看见了。

第一眼看到那个星数我以为是写错了。后来想明白，它早就不是"个人项目"三个字能概括的东西。

## 架构解剖：一切皆事件 (ARCH)

<!-- fig-2 分层架构图：pi-ai（统一 LLM API + agent loop）→ pi-agent-core（事件运行时）→ pi-coding-agent（CLI 组装）+ pi-tui -->

pi 的仓库是个 TypeScript monorepo，拆成五个能独立安装的 npm 包。从下往上数：pi-ai、pi-agent-core、pi-tui、pi-coding-agent、pi-telemetry。我数过两遍，没有一个包名字里带 platform 或者 engine。

先走一遍一轮对话里发生的事，这是理解 pi 的最短路径。你在终端里敲下"帮我修复这个报错"，消息进了 pi-ai，也就是最底下那层。这层名字像模型适配库，实际上把 agent loop 也做进去了：它把你的消息和系统提示词发给模型，模型流式地回，返回里如果带着工具调用，pi-ai 负责把流式碎片里的参数一点点聚合成完整对象，然后执行工具，再把结果作为一条工具消息回填进上下文，紧接着再问一次模型。循环，直到模型不再发起工具调用为止。没有最大步数限制，什么时候算干完，模型自己说了算。

这层还承包了所有和"换个模型"有关的脏活。Anthropic、OpenAI、Google、xAI、Groq、Cerebras、OpenRouter 都有统一接口，国产的 GLM、Qwen、Kimi、DeepSeek、MiniMax 在列表里，也支持任意 OpenAI 兼容端点。带 TypeBox schema 校验的工具调用、thinking 支持、跨 provider 的上下文接力、token 和成本统计，全在这里。跨 provider 接力这件事值得单独说一句。你上半场用 Claude 读完了代码库，下半场可以切到 DeepSeek 继续干活，上下文能跟着走。

层薄还有个常被低估的好处，出问题时你能找到责任在哪层。模型抽风、循环卡死、界面错乱，在 pi 里对应三个包的事，在一体化的工具里是一团黑盒。

中间层 pi-agent-core 在博客里的自我定位是 "a thin, transparent layer"，薄薄一层运行时。Agent 类、状态管理、事件订阅、消息排队，外加 HTTP、WebSocket、内存三种传输抽象。设计口号是 "Everything is an event"，一切皆事件，工具开始执行是一个事件，模型吐了一个 token 也是一个事件。上层的一切界面和扩展，都建立在这个事件流上。

再往上分两路。pi-tui 是自研的终端界面库，retained mode 加差分渲染，没用 ncurses，屏幕只重绘变化的部分。pi-coding-agent 负责最终组装，会话、扩展、主题、上下文文件，加三种运行模式：交互式 TUI、print 单发模式，以及 headless。print 模式朴实好用，`pi -p "Summarize this codebase"` 一发一收，管道里喂段文本进去也行，脚本党会喜欢这种朴素。headless 走 JSON 流或 RPC 接口，意思是你可以把 pi 当作一个可编程组件嵌进自己的程序，而不是只把它当一个终端工具。想想 OpenClaw 是怎么用 pi 的，这条路已经有人蹚通了。顺带一提，还有个 pi-telemetry 包，做厂商中立的遥测契约，这层在作者当年的博客里还没出现，是后来长出来的，说明抽象边界还在演化。

上下文纪律同样干脆。整个项目里，只有 AGENTS.md 一个东西会被注入提示词，全局一份、项目一份，塞在系统提示词底部。除此之外不加戏，你甚至可以用 `.pi/SYSTEM.md` 把整个系统提示词换掉。

压轴的数字是这个：系统提示词加全部工具定义，加起来不到 1000 tokens。作为对比，不少同类工具光系统提示词就比这长得多。省下来的上下文，全留给了你的代码。

## 四工具哲学 (PHILOSOPHY)

<!-- fig-3 六个"No"对照表：声明 / 官方替代路径 -->

pi 默认给模型四个工具：read、write、edit、bash。每个都朴素到近乎无趣，但各有各的讲究。

read 带分页和行号，大文件按 offset 翻页读，输出格式各家模型都被训练过处理，连图片也能读。write 就是整文件覆盖，没有任何花活。edit 用最简单的 diff 格式，一段 old 文本、一段 new 文本，配上模糊匹配。模糊匹配是这里真正的机关：模型输出的空格和缩进经常有细微漂移，严格匹配会让 edit 频繁失败，容忍几个字符的出入，工具成功率就上来了。这是个典型的小设计解决大问题的例子。bash 就是 bash，执行命令，后来只加了超时设置，再无其他，长驻进程官方让你交给 tmux。

作者的理由写在博客里：模型都被训练过适配这种最小 schema，其他工具多半是 bash 的语法糖，再堆只是浪费上下文。grep、find、ls 这几个只读工具存在，默认关着，`pi --tools` 想开就开。

系统提示词本身也值得一读。开头一句是 "You are an expert AI agent connected to a shell"，紧接着就告诉模型 "You don't need to ask for permission. The user expects you to work autonomously until the task is complete."，放手让它干到完。最妙的是防幻觉的那条：遇到不认识的符号、函数、API，先列出所有候选来源，挨个查证，把理解锚在可验证的代码或文档上（"ground your understanding in verifiable code or documentation"）。这几行字就是 pi 胆敢只带四个工具出门的底气，模型自己的判断力被当成第一道防线来用。

比四工具更有辨识度的是 README 里那节 Philosophy，六个"No"，每个后面都跟着一条替代路径，我原样抄下来：

| 刻意不做 | 官方给的替代路径 |
|---|---|
| No MCP | 用带 README 的 CLI 工具（见 Skills），或写扩展加上 MCP 支持 |
| No sub-agents | 用 tmux 起 pi 实例，或写扩展，或装别人做好的包 |
| No permission popups | 放容器里跑，或用扩展写自己的确认流程 |
| No plan mode | 计划写成文件，或写扩展，或装包 |
| No built-in to-dos | 原话是"它们会把模型搞糊涂"，用 TODO.md 或扩展 |
| No background bash | 用 tmux，全量可观测，直接交互 |

第一遍读我以为这是偷懒的体面说法。第二遍才反应过来，每个 No 后面那句"你可以自己造"才是正主。这六个 No 是立场，不是缺口，第五章会看到官方自己交的作业。

安全这块的思路一脉相承。pi 没有内置权限系统，进程以启动它的用户权限直接跑，不弹窗、不拦截。官方的建议很干脆，放容器里去，文档里点名了 Docker、Gondolin micro-VM、OpenShell。轻量一点的玩法也有，只读模式，`pi --tools read,grep,find,ls -p "Review the code"`，一个只带眼睛不带手的 pi，想使坏都没有手。这是我见过的最体贴的安全姿态之一，不靠弹窗，靠裁剪能力。配套的供应链纪律倒是做得细，官方安装命令带着 `--ignore-scripts`，装包时跳过依赖的生命周期脚本；文档里还有依赖精确锁版、release 最小存活期、脚本白名单这一套。风险没有消失，只是从工具侧挪到了环境侧，变成你的显式选择。

## 上手：十分钟到会话树 (HANDS-ON)

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

第一个坑在 Node 版本。npm 上的 engines 字段写死 `>=22.19.0`，而不少机器的默认 LTS 还停在 20，装之前先 `node -v` 一下。Windows 用户不用绕路，官方有 install.ps1 安装脚本，内置工具里还带一个 powershell（Windows 专属），连 Termux 的文档都有。

登录是双轨制。一轨是 API key，约 30 家 provider 自选，按量付费，钱花在模型厂；另一轨是 `/login` 走订阅，认 Claude Pro/Max、ChatGPT Codex、GitHub Copilot 三家，钱花在订阅里。这个选择比看上去重要，订阅党不用管 API 涨价，重度用户按量付费反而更省，pi 不在这中间抽成，pi.dev 上至今没有定价页。想跑本地模型，llama.cpp 的 router server 是一等公民，`/login llama.cpp` 配置、`/llama` 管模型下载加载，Ollama 也在支持列表里。两轨怎么选，算笔小账就清楚，API key 按量付费，贵的时候一晚上烧掉几十块很正常，但模型随便挑；订阅包月在额度内随便用，跨过额度就等重置。pi 对两轨一视同仁，功能上没有任何差别，它不关心你从哪儿付钱。

进去之后，`/model` 或 Ctrl+L 换模型，Shift+Tab 切思考档位，Ctrl+P 在收藏的模型间轮换。`/session` 能看当前会话的 token 数和花费，心里有账。

最有辨识度的是会话系统。每个会话是棵树，存在 `~/.pi/agent/sessions/` 按项目目录归档，文件格式是 JSONL，每一行一条记录，记录之间靠 id 和 parentId 挂成树，你当前所在的位置叫 active leaf。用户消息、助手回复、工具调用、压缩摘要，全是树上的节点。跳分支不改历史，只换路径，被放弃的分支还能让 pi 自动做个摘要挂在岔路口，回来的时候读一眼就能接上。这带来一个别的工具没有的自由度：连按两次 Escape 进树视图，跳回任意历史节点接着聊。`/fork` 从某条历史消息开新会话，`/clone` 把当前分支整个复制走，一个是"回到过去改个决定"，一个是"平行世界再来一遍"。

打字的时候也有讲究。Enter 排进去的是 steering 消息，当前这轮工具跑完就插进去，用来纠偏；Alt+Enter 排的是 follow-up，等它全部干完才送，用来排队喂任务。编辑器里 `@` 可以模糊搜文件，`!command` 直接跑命令把输出喂给模型。

从 Claude Code 迁移过来的用户，肌肉记忆大体能用。AGENTS.md 和 CLAUDE.md 它都认，/compact 它也有，24 个斜杠命令里一半以上似曾相识。最大的适应成本反而是"少"，没有内置待办、没有权限弹窗、没有后台任务面板，刚开始会有点空落落的，习惯之后你会发现屏幕上少了很多可点的东西，多了一条完整的命令流。

## 扩展系统：极简的反面是可编程 (EXTENSIONS)

<!-- fig-5 汇聚图：Extensions / Skills / Prompt Templates / Themes → 自造 sub-agent、plan mode、权限门 -->

前面六个"No"里被拒掉的能力，在扩展系统里全能造回来。这是 pi 设计里我最喜欢的部分。它不预定你的工作流，它给你改自己的工具的自由。

扩展就是一个默认导出的工厂函数。API 就三件事，`pi.registerTool` 注册工具，`pi.registerCommand` 注册命令，`pi.on` 挂事件，事件里最常用的是 `tool_call`，能拦截每一次工具调用。官方示例里有个 protected-paths.ts，保护敏感文件不被写入，完整源码如下：

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

这段代码我从头读到尾花了半分钟。这才是重点，你真的可以读完你的 agent 的全部行为。扩展放在 `~/.pi/agent/extensions/`（全局）或 `.pi/extensions/`（项目），改完 `/reload` 立即生效。

打包分发也是成体系的。一个 pi package 就是在 package.json 里声明 `pi` 字段，列出带哪些 extensions、skills、prompts、themes，发到 npm 打上 `pi-package` 关键词，或者直接给 git 地址，别人 `pi install` 一条命令装好。装完想停用某个部分，`pi config` 里开关，不用卸载。官方文档对此有个不加修饰的提醒，pi 包以你的完整系统权限运行，装第三方包之前先读源码。skills 那套遵循 agentskills.io 标准，markdown 文件写清楚"什么时候用我、步骤是什么"，`/skill:name` 调用；prompt template 放个 markdown 文件就是 `/模板名`，支持 `{{变量}}` 占位。

官方仓库里躺着 50 多个扩展示例，名单读起来像个讽刺笑话。第三章被拒掉的每样东西，这里都有官方参考实现：`subagent/` 示例教你造子代理，`plan-mode/` 示例教你造计划模式，`permission-gate.ts` 是权限弹窗，`sandbox/` 是沙箱，甚至有一个 pi-doom，等模型干活的时候玩毁灭战士。社区里也已经有成型的第三方包，比如 oh-my-pi，把 hash 锚定编辑、LSP、浏览器、子代理打包进来；pi-mom 把 Slack 消息委派给 agent（这两个的口径来自官网与二手综述，我没逐个核过仓库）。作者本人更绝，把自己的 pi 开发会话全部公开在 Hugging Face 上，任何人可以下载真实工作记录去看这个项目是怎么被自己的工具做出来的。

当然，"能自己造"和"已经造好"是两回事。官方示例到生产可用之间那段路，得你自己走。这笔账，第七章算。

## 横向定位：底盘 vs 整车 (COMPARE)

<!-- fig-6 三方对比表 -->

把 pi 放回赛道里看，它和 Claude Code、OpenCode 根本不是同一类商品。

| 维度 | pi | Claude Code | OpenCode |
|---|---|---|---|
| 定位 | 极简 agent harness | 官方全能 coding 工具 | 开源多形态 agent |
| 许可 | MIT，全开源 | 闭源商业产品（订阅制，业内通识，官方页未标注，存疑） | 开源（维护方 Anomaly） |
| 内置工具 | 4 个核心 + 可选只读 | 面宽（未公开枚举） | 未枚举 |
| MCP | 刻意不做，可扩展补 | 有 | 有 |
| sub-agent | 无内置，有示例扩展 | 有（lead agent 协调） | 有 Agents 形态 |
| 扩展模型 | TS 扩展 + pi package | MCP + hooks + skills | MCP + plugins + SDK |
| 模型 | 16+ 供应商 + 本地 llama.cpp | Anthropic 为主，可第三方 key | 多供应商 |
| 形态 | 纯终端（TUI/print/headless） | 终端 + 桌面 + IDE 插件 | 终端 + 桌面 + IDE |
| 计费 | 免费，pi.dev 无定价页 | 订阅制 | 未标注 |

空着的格子是我没拿到一手数据的地方，宁可空着不编。表格看完，分歧点其实只有一个：MCP。另外两家把 MCP 当标配，pi 刻意不做，这意味着 pi 的能力边界由你和它的扩展生态决定，另外两家的能力边界由厂商决定。

所以我说 pi 是底盘，另外两家是整车。选底盘意味着每一处都能改，也意味着组装和维护的工作归你；选整车意味着上路就能开，也意味着路线是别人画的。没有对错，只有你想要什么。模型自由度上也有个容易忽略的差异。pi 的 /model 是会话内热切换，配合前面说的跨 provider 上下文接力，一条工作流里混用两家模型是常规操作。OpenCode 走的是策展思路，官方精选了 OpenCode Zen 模型列表；pi 的思路是全量开放，接什么模型你自己定。

## 批判：极简的账单 (CRITIQUE)

<!-- fig-7 不该用清单 -->

现在把账摊开。极简不是免费的，我找到六笔，每一笔都有出处。

第一笔，无 MCP。连 pi 的头号拥趸都把这条列为第一缺点。Flask 作者 Ronacher 在那篇评述里写："The most obvious omission is support for MCP. There is no MCP support in it." 这里必须交代立场。那篇文章整体是软文，Ronacher 自称已经成了 shill（推销客），而且他和 Zechner 在同一家公司。自己人说"这缺失最明显"，分量反而更重。MCP 在 2026 年已是事实标准，不兼容意味着所有现成 MCP 服务器都不能开箱即用。官方的替代路线是写扩展或桥接，而 Ronacher 对桥接可靠性的原话是："Or not, I don't know :)"。拥趸对自家核心替代路径的态度是"我不知道"，这句比任何批评都诚实。

第二笔，无现成生态。同一篇文章里还有一句更狠的："There is no MCP, there are no community skills, nothing."（这句是 2026 年 1 月的判断。）Reddit 上有篇实测帖，说法类似："No find tool, no git tool. No sub-agents built in."（转引自搜索摘要，原帖被反爬拦住，我没读到楼主最终结论。）把这三句放在一起读，结论是能力获取基本等于自己写代码。要公平地说，第五章列的社区包是存在的，只是它们和 Claude Code 那种 marketplace 式的即插即用生态不是一个量级。

第三笔，TS 门槛，以及它背后的账。官方对"不满意"的标准答案是直接重写 internals，它就是一堆可替换的 TypeScript 文件。这话的另一面是，深度定制的入场券是会写 TypeScript。而且自建的扩展是你自己的代码，模型升级行为漂移了，得你自己修。自己写扩展省下的配置成本，会变成维护一堆自己生成的 TS 代码的成本。要说明白，我没搜到非 TS 用户抱怨这一点的直接引语，上面这两句是我的推断，不是用户的声音。

第四笔，商业化悬念。2026 年 4 月加入 Earendil 的消息出来后不久，r/LocalLLaMA 上就有人立帖，标题是 "pi.dev enroute to enshitification?"。Zechner 在官宣博文里的承诺原文是："pi is MIT licensed. It will stay MIT licensed. You can use it, fork it, build products on top of it, sell those products. Nothing changes." 同时，未来的商业功能会走 Fair Source 许可（一种源码公开但限制竞品直接使用的许可思路，这条来自第三方对 RFC 0015 的转述）。到发稿为止，我没找到开源用户被背刺的实例，风险是结构性的，不是已然的。但有一条成本已经真实发生：仓库从 badlogic 迁到 earendil-works，npm 包名跟着换，装着旧包的用户得自己迁移。

第五笔，好评的圈层。我核引文作者的时候发现，pi 最重要的几篇好评，作者要么在 Earendil，要么和它互相依存。OpenClaw 的作者 Peter Steinberger 也在这个朋友圈里。还有个花絮，HN 上流传最广的那句"linear flow 真让人沮丧"，我查了原文，是 Zechner 在批评别家，根本不是在骂 pi。这个圈子的好评要打折听，不是因为他们说谎，而是因为圈子太小，好评难免互相捧场，参考价值得自己折算。

第六笔，任务规模的边界。四工具加单人循环的架构，在单人单仓的日常开发里游刃有余，但大型仓库的全库检索、多任务并行的长流程，官方的答案都是 tmux 和扩展。具体一点说，让 pi 在一个上百个目录的仓库里找一个变量的所有引用，它能靠 grep 加耐心做到，就是慢；同时开三个任务互不干扰地并行，官方答案是开三个 tmux 窗口各跑一个 pi，编排、汇总、冲突处理都归你。Claude Code 把这些做成了产品功能，pi 把它们留成了练习题。这不是缺陷，是边界，但买底盘的人应该提前知道自己要开什么路。

收个清单，五种情况别用 pi。你的团队依赖现成 MCP 服务器生态；你要开箱即用的 sub-agent、内置 git 和社区 skills；你不会 TypeScript 又想深度定制；你是 IDE/GUI 重度用户；你的组织对许可分层有洁癖。

写到这里我得承认一件没查明白的事。Earendil 靠什么把 pi 变成生意，pi.dev 上没有定价页，RFC 站点上也读不出商业路线，这是我能确认的全部。答案可能要等它的商业功能发布才会有。

## 提炼 (SUMMARY)

用六个问题收尾。

缘起是什么？一个做了十几年开源的作者，对"塞满上下文、黑盒操作"的集体路线投了反对票，顺手被 OpenClaw 点爆。

架构巧在哪？五层薄切，agent loop 就住在模型接入层里，系统提示词加工具定义不到 1000 tokens，一切皆事件。

四工具的底气？read/write/edit/bash 覆盖了 coding 的全部动作原语，六个"No"每个都有官方替代路径，安全从工具侧挪到了环境侧。

上手难不难？一条 npm 命令，双轨登录，会话树和消息排队是两个值得练熟的操作，Claude Code 用户迁移几乎无痛。

扩展的真相？"没有的"官方示例里全能找到造法，但示例和产品之间隔着你自己写的代码。

账单有哪些？无 MCP、无现成生态、TS 门槛、自建维护成本、商业化悬念、好评圈层，六笔都有出处。

一句话判断。pi 的价值不在"更好用"，在"可拥有"。你能读完它的全部行为，改掉其中任何一处，然后真正拥有你的 agent。想开现成的车，另外两家更合适；想拥有一台完全按自己想法改装的，pi 值得这场折腾。

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

> 说明：GitHub 星数 98.8k 为单源页面抓取（2026-08-29），未能二次核验。oh-my-pi 等社区包的描述来自官网与二手综述，未逐仓核验。Claude Code 的闭源状态为业内通识，官方页面未标注，已按存疑处理。
