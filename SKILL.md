---
name: nanju-write-paper
description: "南橘写作流水线：从选题输入到深度技术长文再到最终排版的一条龙 skill。Phase A 写作（简报闸门→多路并行调研[claim→source台账+独立来源验证]→证据地图[状态机]→大纲闸门[信息DAG校验]→倒序写作[节末反提纲diff防跑偏]+深度扩展+风格化配图→五角色审查打分打回循环[含AI味审计,加权≥8.0]→终稿回灌样例库+voice-profile飞轮）；Phase B 排版（南橘卡片设计系统：赤陶橙×米色、衬线+等宽双字体，输出 PDF/HTML/公众号HTML × A4/16:9/3:4卡片/长图，手搭HTML/CSS/SVG配图+机器检查+渲染验收）。手动调用：用户点名时使用（「用 nanju-write-paper 写…」「用 nanju-write-paper 排版…」）；排版必走两问四选项（用户已明确项免问）。Use for 深度文章写作、技术博客、调研成稿、去AI味写作、文章排版、公众号排版、PDF文档."
---

# nanju-write-paper · 南橘写作流水线

把「选题输入」变成「深度成稿」，再把「成稿」变成「南橘版式成品」。
两个阶段共用一套证据与设计纪律；所有中间产物落盘，可断点续跑。

```
选题 ─► G0简报 ─► S1调研 ─► S2编排 ─► G1大纲 ─► S3写作 ─► S4审查(循环≤3) ─► G2终稿 ─► S5排版
```

## 触发与调用礼仪

**手动触发**：用户点名本 skill（如「用 nanju-write-paper 写一篇…」「用 nanju-write-paper 把这篇排版成公众号」）。
用户只是随手发文案、没点名时，不自动套用。

判断来意后分流：

1. **写作模式**：给了选题或写作要求 → Phase A（[references/writing-graph.md](references/writing-graph.md)）；成稿后主动问是否接着排版。
2. **排版模式**：给了现成文案（Markdown/文本/文件路径）→ Phase B。

### Phase B「两问四选项」

逐条询问（一次一问，每问恰好 4 个选项；环境支持提问组件就用组件）。**用户请求里已明确的项目不复述提问，改为复述确认（一句话）即可**；只有未明确的项目才正式问。

**问题 1｜这次要哪种格式？**
- A. **PDF** —— 打印、存档、发文件
- B. **简单 HTML** —— 浏览器直接打开
- C. **公众号 HTML** —— 内联样式，复制粘贴进公众号编辑器
- D. **三种全要**

**问题 2｜用什么尺寸/画幅？**
- A. **竖版 A4** —— 长文档、可打印
- B. **16:9 横版** —— PPT 感、横屏演示
- C. **3:4 竖版卡片**（1080×1440）—— 手机阅读、小红书、配图
- D. **手机长图**（宽 900，高随内容）—— 手机端连续长文

规则：格式选 C 跳过问题 2（微信宽度固定）；选 D（全要）时问题 2 只作用于 PDF 与简单 HTML。**画幅即形态**（style-guide §6.8）：16:9=演示形态（每页必有视觉主体，纯文字页禁止，单页 ≤350 字，真图 ≥5/图式 ≥4）；A4/长图=文章形态（图文并茂、文字多无妨）；3:4=半图半文。PPT 形态下段落型章节必须转译为"图 + 卡"叙事。

## Phase A：写作流水线

完整 Graph、闸门判据、产物 schema、Agent 提示词骨架见 **[references/writing-graph.md](references/writing-graph.md)**。执行要点：

1. **G0 简报**：`writing/<日期>-<slug>/brief.md` 八项；加载 `references/voice-profile.md` 做风格基线（首次运行没有就标注）。闸门缺省：追问 1 次无回复 → 按建议值继续并标注「未经用户确认」。
2. **S1 调研**：先落盘 `research-plan.md` 再派工；Searcher 2–4 路（按篇幅档），任务卡四要素（目标/输出格式/工具指引/边界），工具预算 ≤12 次/路；findings 落盘、回传只带路径+摘要；`ledger.md` 台账每条 claim 带来源+独立来源数+状态（supported/weak/unsourced）；核心结论 ≥2 独立来源，否则标 weak。
3. **S2 编排**：`evidence-map.md`（claim 带状态；unsourced 核心论点降级或删）→ `outline.md`（DAG 校验、配图计划 fig-N、字数预算）；不带未声明缺口进写作。
4. **S3 写作**：倒序起草；**每节写完做反提纲 diff**（抽段首句对大纲，偏移记 deviation-log，偏了大就局部重写）；遵守 [references/human-voice.md](references/human-voice.md)（禁套话黑名单、句长节奏、人味锚点密度）；Depth Expander 补深潜节；Diagrammer 按 [references/diagram-guide.md](references/diagram-guide.md) 配图并跑 [assets/diagram-check.js](assets/diagram-check.js)。
5. **S4 审查**：5 个 Reviewer 并行——事实 30% / 结构 20% / 深度 25%（兼 Devil's Advocate，出必须回应清单）/ 文风 15% / **人味 10%**（按 human-voice §6 十四条快检）。总分=加权求和，≥8.0 且无 P0 才 PASS；每轮修完全部 P0/P1 点名条目再再审，≤3 轮，之后升级用户裁决（接受现状 / 指定方向再改 1 轮）。
6. **G2 终稿**：`final.md` + `sources.md` 落盘；复制进 `writing-samples/`（YYYY-MM-DD-slug.md，>20 篇淘汰最旧 5 篇）；**增量更新 `references/voice-profile.md`**。

## Phase B：排版

1. 两问四选项确认（已明确项复述确认免问）。
2. 读 [references/style-guide.md](references/style-guide.md)（视觉权威）与 [references/md-mapping.md](references/md-mapping.md)（元素映射）。
3. 从 [assets/](assets/) 模板改造：`template-a4.html` / `template-card.html` / `template-wide.html` / `wechat-template.html`。**产物必须是单文件**：发布前把 `theme.css` 全文内联进 `<style>`（产物与源文件可能不同目录，相对链接会断）；公众号版天然全内联。
4. 配图：手搭模块或固定坐标 SVG，**禁用 Mermaid 自动排版**；执行 **配图配额硬约束**（diagram-guide §1.5：真图 ≥4、图式 ≥3 种、fig-N 对账、表格清单不算图；时序/信息图/架构有触发词）；构建后执行 diagram-check（注意 `[clipped-*]` 抓整页裁切）+ 逐图截图目检；**SVG 对外分发（README/网页）必须跑 assets/svg-autofit.js 做回退字体收字**（diagram-guide §5.1）。**工作文件的 CSS 引用按 HTML 实际目录层级写**（`../../assets/theme.css` 之类），diagram-check 第 0 步的样式守卫会拦截路径错误。
5. 导出与验收闭环（渲染 → 检查 → 修 → 复检）：
   - **渲染程序标准**：浏览器打开页面时同步监听 `requestfailed` 与 console error（404 的 CSS/图片在这里现形）；机器检查 PASS 只是必要条件，**首次版式必须再过一轮 judge/人工目检**——机器检查在无样式、空数据时可能假通过。
   - **跨介质交付规范（style-guide §7 十条例）**：公众号图表一律预渲染 PNG + 随稿封面图/摘要；长图 890-1080px 宽、单张 ≤5000px、超限切分；3:4 安全区；打印场景提示深色页墨耗；A4 显式 @page+页码+break-inside；HTML 带 viewport/color-scheme/letterbox；多画幅交付附**降级地图**（PPT 压缩了什么、细节在完整版哪一章）。
   - PDF：`bash scripts/html2pdf.sh <in.html> <out.pdf>`（或 Playwright `page.pdf`）。导出后核对页数与页尺寸（MediaBox）与 @page 一致。渲染后逐页检查：文字出边界、页底空洞、图被裁切、断行尴尬。**版面密度红线：内容版面占用 55–75%，页底空白 ≤15% 页高，禁止连续两张近空页。**
   - 长图/公众号：整页截图再**按固定高度分段截图检查**（超长截图会失真或超限）。
   - 公众号交付说明必须包含：等宽/衬线字体在微信端会被归一化（接受降级）；文内图片需用户先上传素材库。
6. 产物命名：有源文件放同目录 `<name>.pdf` / `<name>.html` / `<name>.wechat.html`；直接粘贴的文案放 `writing/<日期>-<slug>/` 下。

## 质量红线

- 事实性断言必须有来源；unsourced 的核心 claim 降级为观点或删除。
- 概念先定义后使用（信息 DAG）；节末反提纲 diff 不清不放行。
- 色板与双字体系统是硬约束（style-guide §1/§2/§6）；版面密度红线（55–75%）。
- 活人感：human-voice 黑名单零命中；R5 快检清单是 S4 的组成部分，不是可选项。
- 任何输出在交付前必须真实渲染检查过；没渲染过的不能称"可直接用"。

## 文件地图（按需加载，禁止一次全读）

| 时机 | 文件 |
|---|---|
| 总入口 | SKILL.md（本文件） |
| Phase A 开始 | references/writing-graph.md |
| G0 / G2 | references/voice-profile.md（首次运行时创建） |
| S3 写作、S4 审查 | references/human-voice.md |
| S3 配图、Phase B | references/diagram-guide.md + assets/diagram-check.js |
| Phase B | references/style-guide.md、references/md-mapping.md、assets/template-*.html（三种画幅）、assets/wechat-template.html（公众号）、assets/theme.css、scripts/html2pdf.sh |
| 示例 | examples/（sample.md、diagram-specimens.html 配图标本、render/ 渲染产物） |
| 真实案例 | writing/2026-08-29-pi-agent/（端到端全产物：简报/台账/证据地图/大纲/终稿/六份审查/17页宽屏排版，可作为范例参照） |
| 飞轮 | writing-samples/（终稿回灌库）、000-reference/（风格提取的 8 张原始参考图） |
