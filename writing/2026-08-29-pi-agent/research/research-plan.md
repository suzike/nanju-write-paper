# Research Plan · pi（极简 coding agent）

- 日期：2026-08-29 ｜ 篇幅档：L（8千-1万字）｜ 深度：混合（进阶为主+关键机制源码深潜）｜ 侧重：全景式
- 选题：pi —— Mario Zechner (badlogic) 的开源极简 coding agent（pi.dev / GitHub earendil-works/pi）

## 主线问题
pi 的"极简 harness"设计（4 工具、无内置 sub-agent）好在哪、代价是什么？中文开发者该关注/采用它吗？

## 子问题
1. 架构与原理：agent loop 如何实现；read/write/edit/bash 四工具设计取舍；session 管理；pi-mono 单仓组成（pi-ai / pi-agent / pi-tui / pi-coding-agent / pi-web 各层职责）
2. 扩展机制：TypeScript extensions API 能改什么；skills、prompt templates、themes、自定义工具；扩展能力边界（能否自补 sub-agent/MCP 类能力）
3. 上手路径：安装（npm 包名）、provider/API key 配置、支持的模型、第一次会话体验、常用命令、项目上下文文件（PI.md?）
4. 横向定位：pi vs Claude Code vs OpenCode（工具数/扩展模型/开源程度/许可/依赖哲学）；在"极简 agent"谱系里的位置
5. 生态与现状：GitHub stars/版本/release 频率；作者背景（libGDX、badlogic）；earendil-works 与 pi.dev 的关系；社区规模

## 反方问题
R1. 极简的真实代价：没有内置 MCP/sub-agent，实际工作流缺什么？谁补（用户自己写扩展？）？对非 TypeScript 用户门槛多高？
R2. 争议与风险：外部批评（如 lucumr.pocoo.org 的评述）、"又一个 agent"质疑、单人维护/bus factor、与 OpenClaw 的关系（外部文章标题提及）

## 证据需求
官方 README/文档原文、Zechner 博客关键句、扩展示例代码片段、对比参数、stars/版本号数字、批评原文引句。每条必须带 URL+日期+原文短引。

## 分工（4 路，各 ≤12 次检索）
- A 原理与架构 ｜ B 实践与上手 ｜ C 对比与生态 ｜ D 反方与坑
