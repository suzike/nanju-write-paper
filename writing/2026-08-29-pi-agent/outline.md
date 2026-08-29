# Outline · pi 深度文（L ≈9千字，全景式）

标题（备选）：《pi：把 coding agent 拆回四个工具的人》 / 主选：《pi 解剖：四个工具、六个"不做"，和一个 9.9 万星的开源实验》
系列：DEV NOTES ｜ 副标：A MINIMAL AGENT HARNESS

| # | 章节 (H2) | 核心论点 | 引用 | 配图 | 字数 |
|---|---|---|---|---|---|
| — | 封面 | 标题+副标+主线芯片链 | — | 封面暗卡 | — |
| — | 开篇（无编号引言段） | 2026 年 agent 全在堆功能，pi 反着做；本文回答三个问题：它是什么、凭什么、代价是什么 | L16,L17 | — | 600 |
| 01 | 缘起：为什么又是一个 agent | 动机=现有 agent 塞满上下文且黑盒；时间线：2025-11 发布 → Ronacher 评述 → 2026-04 入 Earendil → v0.84.4；OpenClaw 底座引爆 | L26,L21,L19,L17,L16 | fig-1 芯片链时间线 | 900 |
| 02 | 架构解剖：一切皆事件 | 四层极薄：pi-ai（统一 API+内置 loop，循环到模型停手）→ pi-agent-core（事件运行时）→ pi-coding-agent（组装）+ pi-tui；<1000 tokens 起步；AGENTS.md 唯一注入 | L1,L2,L7,L8,L9 | fig-2 分层架构图 | 1400 |
| 03 | 四工具哲学 | read/write/edit/bash 够用的论证；六个"No"逐字表+官方替代路径；无权限系统→容器化，安全是显式选择 | L3,L4,L5,L2 | fig-3 六个"No"对照表（dtable） | 1300 |
| 04 | 上手：十分钟到第一次扩展 | 安装/登录/首会话；会话树 /tree /fork /clone 是最有辨识度的操作；Enter/Alt+Enter 排队；从 Claude Code 迁移无痛（认 CLAUDE.md） | L10,L11,L12,L6,L9 | fig-4 上手流程 + 代码卡（安装命令） | 1500 |
| 05 | 扩展系统：极简的反面是可编程 | ExtensionAPI 三件套+真实源码 protected-paths；pi install 分发；skills/prompts/themes；社区把"没有的"全造了（oh-my-pi 子代理、pi-doom） | L13,L14,L15 | fig-5 汇聚图（四件套→自造能力）+ 代码卡（扩展示例） | 1400 |
| 06 | 横向定位：底盘 vs 整车 | pi vs Claude Code vs OpenCode 对比表；MCP 有无是最大分歧；模型面与许可差异；pi.dev 无定价 | L18,L8,L11,L3,L4,L20 | fig-6 三方对比表（dtable） | 1000 |
| 07 | 批判：极简的账单 | ①无 MCP（连自己人都列第一缺点，披露 Ronacher 立场）②无现成生态（"nothing"）③TS 门槛 ④商业化悬念（enshitification 帖 vs MIT 承诺+Fair Source）⑤好评圈层问题；收尾=不该用清单 | L22,L23,L24,L19,L20,L21,L25 | fig-7 不该用清单（points/tier） | 1600 |
| — | 总结页（暗色） | 六个词条提炼 + 谁该用/谁不该用 + 一个判断：pi 的价值不在"更好用"，在"可拥有" | — | sumlist+chipline | 500 |

合计 ≈ 9200 字（±20% 内）。

**写作纪律**：L16 星数必须标"单源抓取（2026-08-29）"；L23 标"转引，原帖未读全"；L26 标"作者自述转述"；L25 防误用纪律生效（不把线性流引句当 pi 批评）；不写 Windows 体验好坏（只写支持事实）；无权限事故不渲染。
**人味锚点计划**：每千字 ≥3 —— 01 的"我第一次看到六个 No 的 README 时的反应"、03 的"把 plan mode 关掉试试"式体感、04 的安装踩坑提示（node 版本）、05 的"第一次读 protected-paths 源码只用了 30 秒"、07 的"我查每个好评作者时发现都在同一家公司"的现场感、至少 1 处"存疑/我没搞明白"（Earendil 靠什么赚钱）、1 处让步-反驳（MCP 之争双方）。
