/* nanju-write-paper 配图质量检查脚本（detect-only）
 * 用法：浏览器加载排版页面后，把本文件全文作为一段 JS 执行（Playwright browser_evaluate / 控制台）。
 * 返回问题字符串；"PASS" = 通过。修完必须重跑。
 * 覆盖：出边界 / 整页裁切 / 越画布 / 重叠 / 标签裸文字压线 / 越权绝对定位 / 时序图规模。
 * 注意：SVG 手绘图（diagram-guide §5）机器检查不覆盖，必须逐图截图目检。
 */
(() => {
  const issues = [];
  const txt = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);

  // 0) 样式加载守卫：.page 必须命中画幅定宽，否则全部后续检查无意义
  const first = document.querySelector('.page');
  if (!first) return 'FAIL: 页面上没有 .page 元素';
  const w = first.getBoundingClientRect().width;
  if (![794, 1080, 1280, 900].some(c => Math.abs(w - c) < 2)) {
    return 'FAIL: 主题样式未加载（.page 宽度 ' + Math.round(w) + 'px 不等于任何画幅定宽），请检查 theme.css 引用路径';
  }

  const nodeSel = ['.dnode', '.fcard', '.state', '.hub', '.ring .node', '.chip-dark',
    '.actor', '.tier-row', '.elab', '.msg .lab', '.pill', '.codecard'];

  // 1) 节点内文字出边界：滚动尺寸 > 客户尺寸
  document.querySelectorAll('.page ' + nodeSel.join(',.page ')).forEach(el => {
    if (el.scrollWidth > el.clientWidth + 1)
      issues.push(`[overflow-x] ${el.className.split(' ')[0]} "${txt(el)}" 溢出 ${el.scrollWidth - el.clientWidth}px`);
    if (el.scrollHeight > el.clientHeight + 1)
      issues.push(`[overflow-y] ${el.className.split(' ')[0]} "${txt(el)}" 溢出 ${el.scrollHeight - el.clientHeight}px`);
  });

  // 2) 整页/面板被 .page 的 overflow:hidden 静默裁切
  document.querySelectorAll('.page,.panel').forEach(box => {
    const dh = box.scrollHeight - box.clientHeight, dw = box.scrollWidth - box.clientWidth;
    if (dh > 2) issues.push(`[clipped-y] ${box.className.split(' ')[0]} 内容超高 ${dh}px，底部被裁切`);
    if (dw > 2) issues.push(`[clipped-x] ${box.className.split(' ')[0]} 内容超宽 ${dw}px，右侧被裁切`);
  });

  // 3) 节点超出画布边界
  document.querySelectorAll('.page').forEach(page => {
    const pr = page.getBoundingClientRect();
    page.querySelectorAll(nodeSel.join(',')).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.left < pr.left - 1 || r.right > pr.right + 1 || r.top < pr.top - 1 || r.bottom > pr.bottom + 1)
        issues.push(`[out-of-page] "${txt(el)}" 超出画布边界`);
    });
  });

  // 4) 节点重叠：同一 flex/grid 容器的直接子元素矩形相交超过 2px（双向）
  document.querySelectorAll('.frow,.arch .nodes,.arch .layer,.fan .col,.chipline,.seq,.tier').forEach(c => {
    const kids = [...c.children].filter(k => k.getBoundingClientRect().width > 0);
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) issues.push(`[overlap] "${txt(kids[i])}" 与 "${txt(kids[j])}" 重叠`);
    }
  });

  // 5) 时序图标签必须带底色（防压线），且不得溢出
  document.querySelectorAll('.msg .lab').forEach(l => {
    if (getComputedStyle(l).backgroundColor === 'rgba(0, 0, 0, 0)')
      issues.push(`[label-no-bg] 时序标签 "${txt(l)}" 没有底色，会压线`);
    if (l.scrollWidth > l.clientWidth + 1)
      issues.push(`[overflow-x] 时序标签 "${txt(l)}" 溢出`);
  });

  // 6) 越权绝对定位：只扫描图容器的直接子元素；
  //    豁免设计内建定位（.msg 及其子元素、.ring 全家、.hub）
  document.querySelectorAll('.panel,.arch,.fan,.seq,.frow,.points,.tier').forEach(c => {
    [...c.children].forEach(el => {
      if (el.classList.contains('msg') || el.closest('.ring')) return;
      if (getComputedStyle(el).position === 'absolute')
        issues.push(`[absolute-misuse] "${txt(el)}" 在非环形图容器里用了绝对定位`);
    });
  });

  // 7) 时序图规模与生命线贯穿性
  document.querySelectorAll('.seq').forEach(s => {
    const n = s.querySelectorAll('.msg').length;
    if (n > 8) issues.push(`[too-many-msgs] 时序图有 ${n} 条消息，建议拆成两张`);
    const la = s.querySelectorAll('.actor').length, ll = s.querySelectorAll('.life').length;
    if (ll < la) issues.push(`[lifelines-missing] 时序图缺生命线：${la} 个参与者只有 ${ll} 条 life`);
  });

  if (!issues.length) return 'PASS 无出边界/裁切/重叠/压线/越界';
  return ['发现 ' + issues.length + ' 个问题：', ...issues].join('\n');
})();
