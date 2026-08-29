# 写作工作流 Graph（选题输入 → 深度成稿）

> Phase A = 本文件。Phase B（排版）见 [SKILL.md](../SKILL.md) 与 [md-mapping.md](md-mapping.md)。
> 目标文体：**技术深度、知识分享型，篇幅大、介绍全面**，且必须过 [human-voice.md](human-voice.md) 的活人感契约。
> 执行者：主 Agent 负责编排与闸门；重活派子 Agent（ZCode Agent 工具，`general-purpose`）。
> 所有状态落盘为文件——上下文再长、会话再断，都能从磁盘续跑。

## 0. 方法论出处（对标借鉴）

- claim→source 素材纪律：本机 `research` skill
- 研究缺口显式化 `[Research needed]`：GitHub `ComposioHQ/awesome-claude-skills` content-research-writer
- 信息 DAG 依赖检查：本机 `edit-article`；倒序起草：本机 `research-paper-writer`
- 成败判据表：本机 `blog-writer`；bite-sized + 预期输出：本机 `writing-plans`
- 多 Agent 上下文传递（任务卡四要素 / 产物落盘只回传指针）：Anthropic 工程博客 "How we built our multi-agent research system"
- Claim-Evidence 状态机（supported/weak/unsourced，无证据即降级或删除）与反提纲（reverse outlining）：`Master-cai/Research-Paper-Writing-Skills`
- 对抗式 Devil's Advocate 与核心结论 ≥2 独立来源交叉验证：`imbad0202/academic-research-skills`
- 版面密度量化（55–75% 占用、禁近空页）：`JimLiu/baoyu-design` make-a-deck
- AI 味模式清单与 detect-only 审计：`conorbronsdon/avoid-ai-writing`、`blader/humanizer`、少数派实测、`KKKKhazix/khazix-skills`
- 终稿回灌样例库飞轮：本机 `blog-writer`（同类竞品中独有）

## 1. 总览

```
[用户] 选题 + 简单要求
   │
   ▼
G0 简报闸门 ──── brief.md 八项（加载 voice-profile 做风格基线）──► 用户确认
   │
   ▼
S1 素材与调研 ── research-plan.md 先落盘 → 复杂度定路数 → N×Searcher 并行（任务卡四要素）
   │              → findings 落盘、ledger 台账（claim 带来源与独立来源数）
   │              └─ 缺口循环（≤2 轮）：回答率 ≥80%，或缺口被声明为"本文不覆盖"
   ▼
S2 编排梳理 ──── evidence-map.md（每条 claim 带 status）→ outline.md（DAG 校验+配图计划）
   │              闸门规则：不带未声明的 open gap 进入写作
   ▼
G1 大纲闸门 ──── ► 用户确认（可增删调序）
   │
   ▼
S3 写作扩展 ──── 倒序起草 + 节末反提纲 diff（防越写越水）
   │              ├─ Depth Expander 补深度块   ├─ Diagrammer 配图（diagram-check）
   │              └─ 全程遵守 human-voice.md 活人感契约
   ▼
S4 审查循环 ──── 5×Reviewer 并行：事实30% 结构20% 深度25% 文风15% 人味10%
   │              总分 = Σ(权重×各维0-10分)；≥8.0 且无 P0 → PASS
   │              └─ 打回循环（≤3 轮）：每轮修全部 P0/P1 点名条目 → 再审
   ▼
G2 终稿闸门 ──── final.md + sources.md 归档；回灌 writing-samples/ + 更新 voice-profile.md
   │
   ▼
S5 最终排版（Phase B：两问四选项 → 模板 → 渲染校验）
```

## 2. 阶段细则

### G0 写作简报（`brief.md`）
八项：①选题与一句话论点 ②读者与前置知识 ③深度档位（入门/进阶/专家）④篇幅档（S≈3千/M≈6千/L≈1万字+）⑤必须覆盖点 ⑥明确不写的范围 ⑦成功标准 ⑧对标文章 2–3 篇及差异化。
先加载 `references/voice-profile.md`（不存在则标注"首次运行，无风格基线"）。
**闸门缺省**：产出后请用户确认；追问 1 次仍无回复 → 按简报建议值继续，产物头部标注「未经用户确认」。

### S1 素材与调研（`research/research-plan.md`、`findings-*.md`、`ledger.md`）
1. **先落盘 research-plan.md 再派工**：主线问题 1、子问题 4–8、反方问题 ≥2、证据需求清单。
2. **复杂度定路数**：简报为 S 档或窄题 → 2 路；M/L 档 → 4 路（原理规范 / 实践案例 / 数据对比 / 反方与坑）。每路给工具调用预算（≤12 次 WebSearch+Fetch），防过度并行烧 token。
3. **任务卡四要素**（每个 Searcher 的提示词必须含齐，见 §3 骨架）：目标、输出格式（findings schema）、工具指引、任务边界（不查什么）。
4. **findings schema**：每条 = 结论一句 ｜ 来源 URL ｜ 发布日期 ｜ 原文短引 ≤2 句 ｜ 可信度分级（官方/论文/工程/社区）｜ 归入研究问题编号。**落盘文件，回传主 Agent 只带"文件路径 + 3 行摘要"**，不把全文灌回上下文。
5. **ledger schema**：`#编号 ｜ 研究问题 ｜ 结论 ｜ 来源 ｜ 独立来源数 ｜ 状态(supported/weak/unsourced) ｜ 拟用章节`。核心结论类 claim 强制 ≥2 个相互独立来源，否则标 `weak`。
6. **缺口循环**：未答关键问题 → 定向补调（≤2 轮）。之后仍缺的三选一：补调 / 降级为观点 / **声明"本文明确不覆盖 X"并回写简报⑥**。禁止带着未声明的缺口进入 S3。
**放行判据**：关键问题回答率 ≥80%，其余缺口全部已声明；每章 ≥3 条可用素材。

### S2 编排梳理（`evidence-map.md`、`outline.md`）
1. **evidence-map schema**：`章节 → 论点 → 支撑 claim（ledger 编号）→ status`。`unsourced` 的核心 claim 必须降级措辞（写成有观点色彩的表述）或删除——不许带红色状态进 S3。
2. **outline schema**：每节 = 标题 ｜ 核心论点 ｜ 引用 claim 编号 ｜ 配图计划（图式+fig-N 编号）｜ 字数预算 ｜ 深潜标记（是否需要 Depth Expander）。总预算 = 篇幅档 ±20%。
3. **信息 DAG 校验**：列"概念→首次使用位置"，先使用后定义 = 打回重排。
**闸门缺省**：同 G0（追问 1 次无回复按大纲继续并标注）。

### S3 写作与深度扩展（`draft-v1/v2/...`）
1. **倒序起草**：技术主体章 → 对比/收尾 → 开篇与摘要。
2. **散文纪律**：正文以成段散文为主，bullet 只用于真正的并列项（配置步骤/对比维度），禁"观点罗列式 bullet 堆叠"；图表注、台账除外。
3. **活人感**：全程遵守 [human-voice.md](human-voice.md)；写作前读 voice-profile。
4. **节末反提纲 diff**：每写完一节，抽取各段首句重建 mini-outline，与 S2 大纲比对；偏移记入 `deviation-log.md`，偏差大就本节局部重写（这是防"越写越水/前后不一"的主机制）。
5. **Depth Expander**：对深潜标记节补：机制层拆解、边界条件与反例、机理对比、常见误读纠正。素材不够回 S1 补，**不许编**。
6. **Diagrammer**：按大纲配图计划 + [diagram-guide.md](diagram-guide.md) 手搭图示（内嵌正文 HTML，无独立图片文件；fig-N 编号与大纲对账），跑 `assets/diagram-check.js`。
**成败判据**：全章落盘、无未声明 `[Research needed]`、反提纲 diff 已清、diagram-check PASS。

### S4 审查循环（`reviews/r1/r2/...md`）
5 个 Reviewer 子 Agent **并行**，各自只读 draft + 证据材料：

| 角色 | 关注点 | 权重 |
|---|---|---|
| R1 事实核查员 | 逐条 claim 对 ledger；unsourced=未证实，矛盾=P0；核对独立来源数 | 30% |
| R2 结构编辑 | 信息 DAG、章节衔接、重复冗余、节奏与篇幅分配 | 20% |
| R3 深度批评（资深工程师人设，兼 Devil's Advocate） | 哪里浅、缺什么机制/边界/反例/成本分析；输出**必须回应清单**（不计分，但打回轮次必须逐条销项，3 轮未销项的 claim 降级） | 25% |
| R4 文风编辑 | 术语一致、精炼度、中英混排规范（按 human-voice §1.4） | 15% |
| R5 人味审读（独立上下文，只读成稿） | 按 human-voice §6 快检清单 14 条逐项勾选，输出问题→修复表 | 10% |

- **总分 = 0.3×R1 + 0.2×R2 + 0.25×R3 + 0.15×R4 + 0.1×R5**（各维 0–10）；**≥8.0 且无 P0 未解 → PASS**。
- **打回**：意见统一用固定模板（位置 → 问题 → 修改建议，附原文→建议版）；每轮 Writer **修完全部 P0/P1 点名条目**（P2 择机），"一次一维"仅作意见归因标签。出新版本再审。
- **上限 3 轮**；仍不过 → 升级用户裁决，出口二选一：①接受现状发布（记录未销项）②按用户指定方向再改 1 轮。
- R5 两次不过 → 不再机器迭代，交人工终审（human-voice §6）。

### G2 终稿闸门（`final.md` + `sources.md`）
1. 终稿 + 来源清单落盘（来源按"官方/论文/工程/社区"分组）。
2. 复制进 `writing-samples/`（`YYYY-MM-DD-<slug>.md`；超 20 篇淘汰最旧 5 篇）。
3. **增量更新 `references/voice-profile.md`**（字段见 human-voice §5）。

## 3. Agent 名册与提示词骨架

| 需求类 | Agent | 实施方式 |
|---|---|---|
| (a) 信息搜集 | Research Planner / Searcher×N / Ledger | 主 Agent + 并行子 Agent（数量按复杂度 2–4） |
| (b) 编排与编辑 | Synthesizer / Outline / R2 / R4 | 主 Agent + 并行 Reviewer |
| (c) 深度知识扩展 | Depth Expander / R3(兼 Devil's Advocate) | 子 Agent |
| (d) 方法论与活人感 | 本文件全套 + human-voice 契约 + R5 | 固化在 skill 内 |

子 Agent 提示词必须自包含（子 Agent 看不到主对话）。骨架：

```
角色：你是<角色名>，人设：<一句话>。
任务：<一句话>。
输入：必读文件（绝对路径）：<列表>。你没有其他上下文；缺信息去读文件，仍缺就在产出里标 [信息缺口]。
产出：写入 <产物绝对路径>，格式：<schema 关键字段>。回传给我的只有：产物路径 + ≤5 行摘要。
硬性纪律：<该角色检查项/格式要求，从 §2 对应小节抄>。
禁止：编造事实或来源；修改其他角色的产物；超出任务边界。
```

派 Searcher 时补：工具预算（≤12 次）、查重口径（与已有 findings 重复的来源跳过）。
派 Writer/Reviewer 时补：先抽读 `writing-samples/` 最近 2–3 篇校准文风；R5 额外声明"只读成稿、detect-only、禁改稿"。

## 4. 可调参数（默认值，用户可改）

| 参数 | 默认 | 说明 |
|---|---|---|
| Searcher 路数 | S档2 / M·L档4 | 复杂度路由，可手动覆盖 |
| 单路工具预算 | ≤12 次 | 防过度并行 |
| 补调轮数上限 | 2 | 之后缺口必须"声明不覆盖" |
| 审查轮数上限 | 3 | 超过升级用户裁决 |
| PASS 阈值 | 8.0（加权） | 无 P0 是硬条件 |
| 篇幅档 | M≈6千字 | 简报可指定 S/M/L |
| 闸门缺省 | 追问1次无回复→按建议值继续并标注 | 也可指定为"必须等用户" |
