/* nanju-write-paper · svg-autofit.js — SVG 分发场景的字体自适应修正器
 *
 * 解决什么：SVG 以源文件分发（README / 网页）时，在访客机器上用回退字体渲染，
 * 拉丁字符与标点可能比作者机器的字宽 10-20%，导致文字出边界 / 压线。
 * 本脚本按「最宽常见回退字体」模拟检测，并自动缩小超界文字的 font-size（下限 9px）。
 *
 * 用法（与 diagram-check.js 相同的运行方式）：
 *   1. 浏览器加载 SVG（file:// 直接打开，或内嵌进页面后选中该 <svg>）；
 *   2. 执行本文件全文；脚本会：注入最宽回退字体模拟 → 逐元素检测（画布越界 /
 *      容器越界 / 文字互压）→ 自动缩字 → 移除模拟样式 → 序列化整个 SVG；
 *   3. 返回值 = { fixes, residual, xml }；把 xml 写回 .svg 文件即可。
 *      （Agent 执行时：拿 xml → Write 回原路径 → 重跑一遍应报 fixes=0）
 *
 * 规则出处：diagram-guide.md §5「SVG 分发场景的字体适配」。
 * 适用：对外分发的 SVG。内嵌进 PDF/HTML 的图不必跑（字体已随介质确定）。
 */
(() => {
  const W = (document.documentElement.getAttribute('width') || 1440) * 1;
  const H = (document.documentElement.getAttribute('height') || 620) * 1;
  const MIN_FS = 9;

  // 注入最宽回退字体模拟（Windows 访客默认 CJK 回退 = 微软雅黑）
  const sim = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  sim.id = 'autofit-sim';
  sim.textContent = "text { font-family: 'Microsoft YaHei', sans-serif !important; }";
  document.documentElement.appendChild(sim);

  const rects = [...document.querySelectorAll('rect')].map(r => ({
    x: r.x.baseVal.value, y: r.y.baseVal.value,
    w: r.width.baseVal.value, h: r.height.baseVal.value,
  }));
  const hostOf = (cx, cy) => {
    let best = null;
    for (const r of rects)
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h)
        if (!best || r.w * r.h < best.w * best.h) best = r;
    return best;
  };

  let fixes = 0;
  const residual = [];
  for (let round = 0; round < 4; round++) {
    let roundFixes = 0;
    for (const t of document.querySelectorAll('text')) {
      const b = t.getBBox();
      if (b.width <= 0) continue;
      const fs = parseFloat(getComputedStyle(t).fontSize);
      const anchor = t.getAttribute('text-anchor') || 'start';
      let need = 1;
      // 画布越界（留 6px 边距）
      if (b.x + b.width > W - 6) need = Math.min(need, (W - 6 - b.x) / b.width);
      if (b.x < 6) need = Math.min(need, (b.x + b.width - 6) / b.width);
      // 容器越界（找包含文字中心的最小 rect，四边各留 7px）
      const host = hostOf(b.x + b.width / 2, b.y + b.height / 2);
      if (host && host.w < W * 0.92 && host.h < H * 0.92) {
        const pad = 7;
        if (b.width > host.w - pad * 2) {
          const lim = anchor === 'middle'
            ? Math.min(b.x + b.width - host.x - pad, host.x + host.w - pad - b.x)
            : host.x + host.w - pad - b.x;
          if (lim > 24) need = Math.min(need, lim / b.width);
        }
        if (b.height > host.h - pad * 2) need = Math.min(need, (host.h - pad * 2) / b.height);
      }
      if (need < 0.995) {
        const nfs = Math.max(MIN_FS, fs * need);
        if (nfs < fs - 0.05) { t.setAttribute('font-size', nfs.toFixed(1)); roundFixes++; }
      }
    }
    // 文字互压：后绘制的那个缩小
    const boxes = [...document.querySelectorAll('text')]
      .map(t => ({ t, b: t.getBBox() })).filter(o => o.b.width > 0);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].b, b = boxes[j].b;
      const ox = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ox > 4 && oy > 4) {
        const fs = parseFloat(getComputedStyle(boxes[j].t).fontSize);
        const nfs = Math.max(MIN_FS, fs * 0.85);
        if (nfs < fs - 0.05) { boxes[j].t.setAttribute('font-size', nfs.toFixed(1)); roundFixes++; }
      }
    }
    fixes += roundFixes;
    if (roundFixes === 0) break;
  }

  // 残余检测（缩到 9px 仍放不下的，需要人工缩短文案）
  for (const t of document.querySelectorAll('text')) {
    const b = t.getBBox();
    if (b.width <= 0) continue;
    if (b.x < -2 || b.x + b.width > W + 2 || b.y < -2 || b.y + b.height > H + 2)
      residual.push(`画布越界: "${(t.textContent || '').trim().slice(0, 20)}"`);
    const host = hostOf(b.x + b.width / 2, b.y + b.height / 2);
    if (host && host.w < W * 0.92 && (b.width > host.w - 10 || b.height > host.h - 10))
      residual.push(`容器越界: "${(t.textContent || '').trim().slice(0, 20)}" —— 请缩短文案后重跑`);
  }

  // 移除模拟样式后序列化（交付的 SVG 不携带模拟规则）
  sim.remove();
  const xml = new XMLSerializer().serializeToString(document.documentElement);

  return {
    fixes,
    residual,
    xml,
    note: residual.length
      ? '仍有残余越界，按 residual 提示缩短文案后重跑'
      : '已按最宽回退字体完成收字，xml 可直接写回 .svg 文件',
  };
})();
