const CANVAS = { width: 1920, height: 1080 };

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function attrs(obj) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${esc(value)}"`)
    .join(" ");
}

function viewBoxPath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`).join(" ") + " Z";
}

function textBlock(lines, className) {
  return `<div class="${className}">${(lines || []).map((line) => `<div>${esc(line)}</div>`).join("")}</div>`;
}

function pointAtTriangleY(cx, topY, baseY, halfWidth, y) {
  const ratio = Math.max(0, Math.min(1, (y - topY) / (baseY - topY)));
  return {
    left: cx - halfWidth * ratio,
    right: cx + halfWidth * ratio,
  };
}

function triangleBandPath({ cx, topY, baseY, halfWidth, y1, y2, inset = 0 }) {
  const top = pointAtTriangleY(cx, topY, baseY, halfWidth, y1);
  const bottom = pointAtTriangleY(cx, topY, baseY, halfWidth, y2);
  const topInset = Math.min(inset, Math.max(0, (top.right - top.left) / 2 - 2));
  const bottomInset = Math.min(inset, Math.max(0, (bottom.right - bottom.left) / 2 - 2));
  return viewBoxPath([
    [top.left + topInset, y1],
    [top.right - topInset, y1],
    [bottom.right - bottomInset, y2],
    [bottom.left + bottomInset, y2],
  ]);
}

function cssVarTokens(theme = {}) {
  const pairs = Object.entries(theme)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `--tm-${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}:${esc(value)};`);
  return pairs.length ? ` style="${pairs.join("")}"` : "";
}

const MOTIF_STYLE_TOKENS = {
  "simpleux-light": {
    cycleAccent: "#24c253",
    cycleAccentDark: "#16a34a",
    cycleAccentSoft: "#e8f8ed",
    cycleInk: "#111827",
    cycleMuted: "#7c8794",
    cycleRing: "#cfd2d6",
    cycleCard: "#ffffff",
    cycleCardBorder: "rgba(148, 163, 184, 0.20)",
    cycleShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
    cycleRadius: "8px",
    focusLeft: "#24c253",
    focusRight: "#1f2c3b",
    focusConeLeft: "#e8f8ed",
    focusConeRight: "#eef0f3",
    focusInk: "#111827",
    focusMuted: "#6b7280",
    focusAxis: "#cfd2d6",
    networkPrimary: "#24c253",
    networkDark: "#1f2c3b",
    networkLine: "#cfd2d6",
    networkInk: "#111827",
    networkGlow: "rgba(36, 194, 83, 0.26)",
  },
  pentagram: { cycleAccent: "#e11d48", cycleAccentSoft: "#fff1f2", cycleRing: "#d4d4d8", cycleShadow: "none", cycleRadius: "2px", focusLeft: "#e11d48", focusRight: "#111827", focusConeLeft: "#fff1f2", focusConeRight: "#f4f4f5" },
  stamen: { cycleAccent: "#6f8f72", cycleAccentSoft: "#edf4e9", cycleRing: "#d8c8b5", cycleShadow: "0 12px 28px rgba(97, 82, 63, 0.12)", cycleRadius: "10px", focusLeft: "#6f8f72", focusRight: "#28435a", focusConeLeft: "#edf4e9", focusConeRight: "#eef3f6" },
  "information-architects": { cycleAccent: "#0000ee", cycleAccentSoft: "#eef2ff", cycleRing: "#cbd5e1", cycleShadow: "none", cycleRadius: "0px", focusLeft: "#0000ee", focusRight: "#111827", focusConeLeft: "#eef2ff", focusConeRight: "#f1f5f9" },
  fathom: { cycleAccent: "#1d4ed8", cycleAccentSoft: "#eff6ff", cycleRing: "#94a3b8", cycleShadow: "0 10px 28px rgba(15, 23, 42, 0.08)", cycleRadius: "4px", focusLeft: "#1d4ed8", focusRight: "#172554", focusConeLeft: "#eff6ff", focusConeRight: "#eef2f7" },
  locomotive: { cycleAccent: "#f97316", cycleAccentSoft: "#fff7ed", cycleRing: "#cbd5e1", cycleCard: "#111827", cycleInk: "#f8fafc", cycleMuted: "#94a3b8", cycleShadow: "0 22px 60px rgba(15, 23, 42, 0.24)", cycleRadius: "6px", focusLeft: "#f97316", focusRight: "#111827", focusConeLeft: "#fff7ed", focusConeRight: "#f3f4f6" },
  "active-theory": { cycleAccent: "#22d3ee", cycleAccentSoft: "#ecfeff", cycleRing: "#67e8f9", cycleCard: "#07111f", cycleInk: "#e0f2fe", cycleMuted: "#93c5fd", cycleShadow: "0 18px 52px rgba(34, 211, 238, 0.24)", cycleRadius: "4px", focusLeft: "#22d3ee", focusRight: "#07111f", focusConeLeft: "#ecfeff", focusConeRight: "#e0f2fe" },
  "field-io": { cycleAccent: "#8b5cf6", cycleAccentSoft: "#f3e8ff", cycleRing: "#c4b5fd", cycleShadow: "0 18px 48px rgba(124, 58, 237, 0.16)", cycleRadius: "12px", focusLeft: "#8b5cf6", focusRight: "#241447", focusConeLeft: "#f3e8ff", focusConeRight: "#f4f0ff" },
  resn: { cycleAccent: "#f43f5e", cycleAccentSoft: "#fff1f2", cycleRing: "#fecdd3", cycleShadow: "0 20px 50px rgba(244, 63, 94, 0.16)", cycleRadius: "14px", focusLeft: "#f43f5e", focusRight: "#172033", focusConeLeft: "#fff1f2", focusConeRight: "#f3f4f6" },
  "experimental-jetset": { cycleAccent: "#111827", cycleAccentSoft: "#f4f4f5", cycleRing: "#a1a1aa", cycleShadow: "none", cycleRadius: "0px", focusLeft: "#111827", focusRight: "#111827", focusConeLeft: "#f4f4f5", focusConeRight: "#e5e7eb" },
  "muller-brockmann": { cycleAccent: "#dc2626", cycleAccentSoft: "#f8fafc", cycleRing: "#111827", cycleShadow: "none", cycleRadius: "0px", focusLeft: "#dc2626", focusRight: "#111827", focusConeLeft: "#fef2f2", focusConeRight: "#f3f4f6" },
  build: { cycleAccent: "#b58b5b", cycleAccentSoft: "#f8f3ec", cycleRing: "#ddd6cf", cycleInk: "#1f1c18", cycleMuted: "#8a8178", cycleShadow: "0 18px 44px rgba(57, 45, 31, 0.10)", cycleRadius: "6px", focusLeft: "#b58b5b", focusRight: "#1f1c18", focusConeLeft: "#f8f3ec", focusConeRight: "#f0ece7" },
  "sagmeister-walsh": { cycleAccent: "#ec4899", cycleAccentSoft: "#fdf2f8", cycleRing: "#f9a8d4", cycleShadow: "0 24px 58px rgba(236, 72, 153, 0.16)", cycleRadius: "16px", focusLeft: "#ec4899", focusRight: "#111827", focusConeLeft: "#fdf2f8", focusConeRight: "#f3f4f6" },
  "zach-lieberman": { cycleAccent: "#14b8a6", cycleAccentSoft: "#ecfdf5", cycleRing: "#99f6e4", cycleShadow: "0 16px 44px rgba(20, 184, 166, 0.18)", cycleRadius: "10px", focusLeft: "#14b8a6", focusRight: "#0f172a", focusConeLeft: "#ecfdf5", focusConeRight: "#f1f5f9" },
  "raven-kwok": { cycleAccent: "#111827", cycleAccentSoft: "#f8fafc", cycleRing: "#64748b", cycleShadow: "none", cycleRadius: "0px", focusLeft: "#111827", focusRight: "#111827", focusConeLeft: "#f8fafc", focusConeRight: "#e5e7eb" },
  "ash-thorp": { cycleAccent: "#facc15", cycleAccentSoft: "#111827", cycleCard: "#0f172a", cycleInk: "#f8fafc", cycleMuted: "#cbd5e1", cycleRing: "#334155", cycleShadow: "0 24px 70px rgba(15, 23, 42, 0.30)", cycleRadius: "4px", focusLeft: "#facc15", focusRight: "#0f172a", focusConeLeft: "#fef9c3", focusConeRight: "#e5e7eb" },
  "territory-studio": { cycleAccent: "#38bdf8", cycleAccentSoft: "#082f49", cycleCard: "#0f172a", cycleInk: "#f8fafc", cycleMuted: "#bae6fd", cycleRing: "#0ea5e9", cycleShadow: "0 20px 60px rgba(14, 165, 233, 0.18)", cycleRadius: "4px", focusLeft: "#38bdf8", focusRight: "#0f172a", focusConeLeft: "#e0f2fe", focusConeRight: "#e5e7eb" },
  takram: { cycleAccent: "#2fbf73", cycleAccentSoft: "#e9f5ee", cycleRing: "#cad7cf", cycleInk: "#1f2a24", cycleMuted: "#7a8b81", cycleShadow: "0 14px 34px rgba(31, 42, 36, 0.10)", cycleRadius: "8px", focusLeft: "#2fbf73", focusRight: "#1f2c3b", focusConeLeft: "#e9f5ee", focusConeRight: "#edf0f2", focusInk: "#1f2a24" },
  "kenya-hara": { cycleAccent: "#8aa389", cycleAccentSoft: "#f4f1ea", cycleRing: "#d8d2c6", cycleInk: "#25231f", cycleMuted: "#8c877c", cycleShadow: "none", cycleRadius: "3px", focusLeft: "#8aa389", focusRight: "#25231f", focusConeLeft: "#f4f1ea", focusConeRight: "#efede8", focusInk: "#25231f" },
  "irma-boom": { cycleAccent: "#ef4444", cycleAccentSoft: "#fff7ed", cycleRing: "#111827", cycleShadow: "0 10px 0 rgba(17, 24, 39, 0.12)", cycleRadius: "0px", focusLeft: "#ef4444", focusRight: "#111827", focusConeLeft: "#fff7ed", focusConeRight: "#f4f4f5" },
  "neo-shen": { cycleAccent: "#9b6b43", cycleAccentSoft: "#f5efe7", cycleRing: "#d6c8b8", cycleInk: "#2b2118", cycleMuted: "#8d7d6d", cycleShadow: "0 18px 46px rgba(91, 68, 45, 0.10)", cycleRadius: "12px", focusLeft: "#9b6b43", focusRight: "#2b2118", focusConeLeft: "#f5efe7", focusConeRight: "#eee8df", focusInk: "#2b2118" },
};

function resolveMotifStyle(data) {
  const styleName = data.style || data.canvas?.theme || "simpleux-light";
  const baseTokens = MOTIF_STYLE_TOKENS["simpleux-light"];
  const styleTokens = MOTIF_STYLE_TOKENS[styleName] || {};
  const userTokens = data.themeTokens || {};
  const mergedTokens = {
    ...baseTokens,
    ...styleTokens,
    ...userTokens,
  };
  return {
    styleName,
    tokens: {
      ...mergedTokens,
      networkPrimary: userTokens.networkPrimary || styleTokens.networkPrimary || styleTokens.focusLeft || styleTokens.cycleAccent || mergedTokens.networkPrimary,
      networkDark: userTokens.networkDark || styleTokens.networkDark || styleTokens.focusRight || "#1f2c3b",
      networkLine: userTokens.networkLine || styleTokens.networkLine || styleTokens.cycleRing || mergedTokens.networkLine,
      networkInk: userTokens.networkInk || styleTokens.networkInk || styleTokens.focusInk || styleTokens.cycleInk || mergedTokens.networkInk,
    },
  };
}

function frame(data, inner) {
  const canvas = data.canvas || {};
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920, initial-scale=1">
<title>${esc(canvas.title || "Template Motif")}</title>
<link rel="stylesheet" href="../template-motifs.css">
</head>
<body>
<main class="tm-page" data-logic-graphic="true" data-lg-component="GraphicFrame" data-lg-token-version="logic-graphics-v1" data-template-motif="${esc(data.type)}">
<header class="tm-caption" data-lg-zone="header">${canvas.title ? esc(canvas.title) : ""}</header>
<section class="tm-main" data-lg-zone="main">
${inner}
</section>
<footer class="tm-footer" data-lg-zone="footer"></footer>
</main>
</body>
</html>`;
}

export function renderLayeredStack3D(data) {
  const layers = data.layers || [];
  const x = 560;
  const y = 210;
  const w = 680;
  const d = 170;
  const h = 96;
  const gap = 36;
  const colors = data.colors || ["#e6f5e8", "#ccefd1", "#a8e1ad", "#79ce7d", "#24c253"];
  const layerSvg = layers.map((layer, index) => {
    const top = y + index * (h + gap);
    const leftShift = index % 2 === 0 ? 0 : -2;
    const points = [
      [x + leftShift, top + h],
      [x + d + leftShift, top],
      [x + w + d + leftShift, top],
      [x + w + leftShift, top + h],
    ];
    return `<path class="tm-stack-plane" data-lg-component="GraphicGroup" d="${viewBoxPath(points)}" fill="${esc(layer.color || colors[index % colors.length])}" opacity="${layer.opacity || 1}"></path>`;
  }).join("");
  const guides = [0, 1, 2, 3].map((index) => {
    const top = y + index * (h + gap);
    return `<line class="tm-stack-guide" x1="${x}" y1="${top + h}" x2="${x}" y2="${y + layers.length * (h + gap) - gap + h}"></line>`;
  }).join("");
  const labels = layers.map((layer, index) => {
    const top = y + index * (h + gap);
    return `<div class="tm-stack-label" data-lg-component="GraphicLabel" style="left:${x + 280}px;top:${top + 34}px;">${esc(layer.title)}</div>`;
  }).join("");
  const axis = data.axis || {};
  return frame(data, `
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  ${layerSvg}
  ${guides}
  <line class="tm-stack-wall" x1="${x + w + d}" y1="${y}" x2="${x + w + d}" y2="${y + layers.length * (h + gap) - gap + h}"></line>
  <line class="tm-axis" x1="1530" y1="310" x2="1530" y2="820"></line>
  <polygon points="1530,270 1514,310 1546,310" fill="#c9cdd2"></polygon>
  <polygon points="1530,860 1514,820 1546,820" fill="#1f2937"></polygon>
</svg>
${labels}
<div class="tm-axis-top">${esc(axis.top || "具象的")}</div>
<div class="tm-axis-bottom">${esc(axis.bottom || "抽象的")}</div>
<div class="tm-bottom-title">${esc(data.footer || "设计中的阶段模型")}</div>`);
}

export function renderSplitPyramidMatrix(data) {
  const left = data.left || [];
  const right = data.right || [];
  const centerX = 960;
  const topY = 150;
  const baseY = 865;
  const side = 430;
  const rows = 3;
  const rowH = (baseY - topY) / rows;
  const leftBlocks = left.map((item, index) => {
    const y1 = topY + index * rowH;
    const y2 = topY + (index + 1) * rowH - 2;
    const t1 = (y1 - topY) / (baseY - topY);
    const t2 = (y2 - topY) / (baseY - topY);
    const p = [
      [centerX - side * t1 - 42, y1],
      [centerX - 42, y1],
      [centerX - 42, y2],
      [centerX - side * t2 - 42, y2],
    ];
    return `<path class="tm-pyramid-zone" d="${viewBoxPath(p)}" fill="${esc(item.color || (index === 1 ? "#24c253" : "#effaf1"))}"></path>`;
  }).join("");
  const rightBlocks = right.map((item, index) => {
    const y1 = topY + index * rowH;
    const y2 = topY + (index + 1) * rowH - 2;
    const t1 = (y1 - topY) / (baseY - topY);
    const t2 = (y2 - topY) / (baseY - topY);
    const p = [
      [centerX + 42, y1],
      [centerX + side * t1 + 42, y1],
      [centerX + side * t2 + 42, y2],
      [centerX + 42, y2],
    ];
    return `<path class="tm-pyramid-zone" d="${viewBoxPath(p)}" fill="${esc(item.color || (index === 1 ? "#1f2937" : "#effaf1"))}"></path>`;
  }).join("");
  const labels = [...left.map((item, index) => ({ ...item, side: "left", index })), ...right.map((item, index) => ({ ...item, side: "right", index }))].map((item) => {
    const y = topY + item.index * rowH + rowH / 2 - 42;
    const x = item.side === "left" ? 720 : 1175;
    const contrast = item.color === "#24c253" || item.color === "#1f2937" ? " tm-invert" : "";
    return `<div class="tm-pyramid-label${contrast}" data-lg-component="GraphicLabel" style="left:${x}px;top:${y}px;"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle || "")}</span></div>`;
  }).join("");
  return frame(data, `
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <path class="tm-pyramid-back" d="M 960 150 L 520 865 L 1400 865 Z"></path>
  ${leftBlocks}${rightBlocks}
  <line class="tm-pyramid-split" x1="960" y1="150" x2="960" y2="865"></line>
  <line class="tm-pyramid-axis" x1="260" y1="870" x2="760" y2="870"></line>
  <line class="tm-pyramid-axis" x1="1160" y1="870" x2="1660" y2="870"></line>
</svg>
${labels}
<div class="tm-rot-label left">${esc(data.leftAxis || "用户关系链发展趋势")}</div>
<div class="tm-rot-label right">${esc(data.rightAxis || "用户社交需求走向")}</div>
<div class="tm-bottom-title">${esc(data.footer || "社交活动")}</div>`);
}

export function renderTriangleCycle(data) {
  const levels = (data.levels || []).slice(0, 4);
  const normalizedLevels = levels.length >= 2 ? levels : [
    { title: "能力层一" },
    { title: "能力层二" },
    { title: "能力层三" },
  ];
  const callouts = data.callouts || [];
  const topBullets = data.topBullets || [];
  const sideLabels = data.sideLabels || {};
  const cx = 960;
  const core = {
    topY: 300,
    baseY: 748,
    half: 258,
  };
  const triangleSlope = core.half / (core.baseY - core.topY);
  const outer = {
    topY: 218,
    baseY: 812,
  };
  outer.half = Math.round((outer.baseY - outer.topY) * triangleSlope);
  const bandGap = 8;
  const bandHeight = (core.baseY - core.topY) / normalizedLevels.length;
  const zones = normalizedLevels.map((level, index) => {
    const y1 = core.topY + index * bandHeight + (index === 0 ? 0 : bandGap / 2);
    const y2 = core.topY + (index + 1) * bandHeight - (index === normalizedLevels.length - 1 ? 0 : bandGap / 2);
    const opacity = level.muted ? 0.82 : 1;
    return `<path class="tm-triangle-cycle-band" data-lg-component="GraphicGroup" d="${triangleBandPath({ cx, topY: core.topY, baseY: core.baseY, halfWidth: core.half, y1, y2, inset: 2 })}" fill="${esc(level.color || "var(--tm-cycle-accent)")}" opacity="${esc(opacity)}"></path>`;
  }).join("");
  const separators = Array.from({ length: Math.max(0, normalizedLevels.length - 1) }, (_, index) => {
    const y = core.topY + bandHeight * (index + 1);
    return `<path class="tm-triangle-cycle-separator" d="${triangleBandPath({ cx, topY: core.topY, baseY: core.baseY, halfWidth: core.half, y1: y, y2: y + 1 })}"></path>`;
  }).join("");
  const labels = normalizedLevels.map((level, index) => {
    const y1 = core.topY + index * bandHeight;
    const y2 = core.topY + (index + 1) * bandHeight;
    const y = y1 + (y2 - y1) / 2 - 24;
    return `<div class="tm-triangle-cycle-level" data-lg-component="GraphicLabel" data-lg-text-role="三角分层标题" data-lg-max-chars="14" style="left:${cx - 150}px;top:${Math.round(y)}px;">${esc(level.title)}</div>`;
  }).join("");
  const calloutPositions = {
    left: { x: 236, y: 328, w: 330, h: 198 },
    right: { x: 1354, y: 328, w: 330, h: 198 },
    bottom: { x: 795, y: 842, w: 330, h: 150 },
  };
  const anchors = {
    left: {
      x: calloutPositions.left.x + calloutPositions.left.w + 62,
      y: calloutPositions.left.y + calloutPositions.left.h / 2,
    },
    right: {
      x: calloutPositions.right.x - 62,
      y: calloutPositions.right.y + calloutPositions.right.h / 2,
    },
    bottom: {
      x: calloutPositions.bottom.x + calloutPositions.bottom.w / 2,
      y: calloutPositions.bottom.y - 24,
    },
  };
  const arrows = {
    left: {
      start: { x: cx - 112, y: core.topY - 18 },
      end: { x: cx - 318, y: core.baseY - 94 },
    },
    right: {
      start: { x: cx + 112, y: core.topY - 18 },
      end: { x: cx + 318, y: core.baseY - 94 },
    },
  };
  const calloutHtml = ["left", "right", "bottom"].map((slot, index) => {
    const item = callouts.find((entry) => entry.slot === slot) || callouts[index] || {};
    const pos = calloutPositions[slot];
    const title = item.title ? `<strong data-lg-text-role="说明卡标题" data-lg-max-chars="12">${esc(item.title)}</strong>` : "";
    const lines = item.lines || (item.body ? [item.body] : []);
    return `<article class="tm-triangle-cycle-card ${slot}" data-lg-component="GraphicCallout" data-lg-callout-slot="${slot}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.w}px;min-height:${pos.h}px;">
      ${title}
      ${textBlock(lines, "tm-triangle-cycle-card-text")}
    </article>`;
  }).join("");
  const bulletHtml = topBullets.length
    ? `<ul class="tm-triangle-cycle-bullets" data-lg-component="GraphicLabel" data-lg-text-role="顶部要点" data-lg-max-chars="90">
        ${topBullets.slice(0, 4).map((line) => `<li>${esc(line)}</li>`).join("")}
      </ul>`
    : "";
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-triangle-cycle" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <marker id="tm-cycle-arrow" viewBox="0 0 28 28" refX="19" refY="14" markerWidth="30" markerHeight="30" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path d="M 6 5 L 22 14 L 6 23 Z" fill="var(--tm-cycle-accent)"></path>
    </marker>
  </defs>
  <circle class="tm-triangle-cycle-ring" cx="${cx}" cy="560" r="486"></circle>
  <path class="tm-triangle-cycle-back" d="${viewBoxPath([[cx, outer.topY], [cx - outer.half, outer.baseY], [cx + outer.half, outer.baseY]])}"></path>
  ${zones}
  ${separators}
  <path class="tm-triangle-cycle-arrow" data-lg-component="GraphicConnector" data-lg-from="cycle-top" data-lg-to="cycle-left" data-lg-points='[{"x":${arrows.left.start.x},"y":${arrows.left.start.y}},{"x":${arrows.left.end.x},"y":${arrows.left.end.y}}]' d="M ${arrows.left.start.x} ${arrows.left.start.y} L ${arrows.left.end.x} ${arrows.left.end.y}"></path>
  <path class="tm-triangle-cycle-arrow" data-lg-component="GraphicConnector" data-lg-from="cycle-top" data-lg-to="cycle-right" data-lg-points='[{"x":${arrows.right.start.x},"y":${arrows.right.start.y}},{"x":${arrows.right.end.x},"y":${arrows.right.end.y}}]' d="M ${arrows.right.start.x} ${arrows.right.start.y} L ${arrows.right.end.x} ${arrows.right.end.y}"></path>
  <circle class="tm-triangle-cycle-anchor" data-anchor-slot="left" cx="${anchors.left.x}" cy="${anchors.left.y}" r="13"></circle>
  <circle class="tm-triangle-cycle-anchor" data-anchor-slot="right" cx="${anchors.right.x}" cy="${anchors.right.y}" r="13"></circle>
  <circle class="tm-triangle-cycle-anchor" data-anchor-slot="bottom" cx="${anchors.bottom.x}" cy="${anchors.bottom.y}" r="13"></circle>
</svg>
<div class="tm-triangle-cycle-title top" data-lg-component="GraphicLabel" data-lg-text-role="顶部标签" data-lg-max-chars="10">${esc(data.topLabel || sideLabels.top || "设计功能")}</div>
${bulletHtml}
<div class="tm-triangle-cycle-title left" data-lg-component="GraphicLabel" data-lg-text-role="左侧标签" data-lg-max-chars="10">${esc(sideLabels.left || data.leftLabel || "设计功能")}</div>
<div class="tm-triangle-cycle-title right" data-lg-component="GraphicLabel" data-lg-text-role="右侧标签" data-lg-max-chars="10">${esc(sideLabels.right || data.rightLabel || "设计功能")}</div>
${labels}${calloutHtml}
</div>`);
}

export function renderOrbitFlywheel(data) {
  const satellites = data.satellites || [];
  const center = data.center || {};
  const positions = [
    [470, 110],
    [1305, 360],
    [820, 728],
  ];
  const satelliteHtml = satellites.map((item, index) => {
    const [x, y] = positions[index] || positions[0];
    return `<div class="tm-orbit-card" data-lg-component="GraphicNode" style="left:${x}px;top:${y}px;">
      <strong>${esc(item.title)}</strong>
      <span>${esc(item.subtitle || "")}</span>
      <em>${esc(item.metric || "")}</em>
    </div>`;
  }).join("");
  const notes = (data.notes || []).map((note, index) => {
    const pos = [[1310, 135], [330, 690], [1400, 805]][index] || [330, 690];
    return `<div class="tm-orbit-note" data-lg-component="GraphicLabel" style="left:${pos[0]}px;top:${pos[1]}px;">${esc(note)}</div>`;
  }).join("");
  return frame(data, `
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <circle class="tm-orbit-guide" cx="960" cy="560" r="372"></circle>
  <path class="tm-orbit-main" d="M 1040 198 A 372 372 0 1 1 914 929"></path>
  <path class="tm-orbit-outer left" d="M 380 260 A 610 610 0 0 0 630 958"></path>
  <path class="tm-orbit-outer right" d="M 1490 -20 A 610 610 0 0 1 1610 365"></path>
</svg>
<div class="tm-orbit-center" data-lg-component="GraphicNode">
  <span>${esc(center.title || "核心增长")}</span>
  <strong>${esc(center.metric || "50%")}</strong>
</div>
${satelliteHtml}
${notes}`);
}

function focusPointHtml(item, side, index) {
  const top = 338 + index * 128;
  const left = side === "left" ? 92 : 1505;
  return `<div class="tm-dual-focus-point ${side}" data-lg-component="GraphicLabel" data-lg-text-role="${side === "left" ? "左侧要点" : "右侧要点"}" data-lg-max-chars="18" style="left:${left}px;top:${top}px;">${esc(item)}</div>`;
}

export function renderDualFocusCone(data) {
  const left = data.left || {};
  const right = data.right || {};
  const axis = data.axis || {};
  const leftPoints = (left.points || []).slice(0, 3);
  const rightPoints = (right.points || []).slice(0, 3);
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  const axisLabels = {
    top: axis.top || "业务侧",
    middle: axis.middle || "客户侧",
    bottom: axis.bottom || "用户侧",
  };
  return frame(data, `
<div class="tm-dual-focus" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <linearGradient id="tm-focus-left-fade" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-focus-cone-left)" stop-opacity="0"></stop>
      <stop offset="46%" stop-color="var(--tm-focus-cone-left)" stop-opacity="0.82"></stop>
      <stop offset="100%" stop-color="var(--tm-focus-cone-left)" stop-opacity="0.96"></stop>
    </linearGradient>
    <linearGradient id="tm-focus-right-fade" x1="100%" y1="50%" x2="0%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-focus-cone-right)" stop-opacity="0"></stop>
      <stop offset="48%" stop-color="var(--tm-focus-cone-right)" stop-opacity="0.80"></stop>
      <stop offset="100%" stop-color="var(--tm-focus-cone-right)" stop-opacity="0.96"></stop>
    </linearGradient>
  </defs>
  <path class="tm-dual-focus-cone left" d="M 58 64 L 642 500 L 58 1016 Z"></path>
  <path class="tm-dual-focus-cone right" d="M 1862 64 L 1278 500 L 1862 1016 Z"></path>
  <line class="tm-dual-focus-axis" x1="960" y1="368" x2="960" y2="446"></line>
  <polygon class="tm-dual-focus-axis-arrow" points="960,474 947,450 973,450"></polygon>
  <line class="tm-dual-focus-axis" x1="960" y1="600" x2="960" y2="676"></line>
  <polygon class="tm-dual-focus-axis-arrow" points="960,704 947,680 973,680"></polygon>
</svg>
<div class="tm-dual-focus-circle left" data-lg-component="GraphicNode" data-lg-node-id="left-focus">
  <strong data-lg-text-role="左焦点标题" data-lg-max-chars="8">${esc(left.title || "视觉")}</strong>
  <span data-lg-text-role="左焦点副标题" data-lg-max-chars="16">${esc(left.subtitle || "Vision")}</span>
</div>
<div class="tm-dual-focus-circle right" data-lg-component="GraphicNode" data-lg-node-id="right-focus">
  <strong data-lg-text-role="右焦点标题" data-lg-max-chars="8">${esc(right.title || "交互")}</strong>
  <span data-lg-text-role="右焦点副标题" data-lg-max-chars="16">${esc(right.subtitle || "Interaction")}</span>
</div>
${leftPoints.map((item, index) => focusPointHtml(item, "left", index)).join("")}
${rightPoints.map((item, index) => focusPointHtml(item, "right", index)).join("")}
<div class="tm-dual-axis-label top" data-lg-component="GraphicLabel" data-lg-text-role="轴顶部标签" data-lg-max-chars="8">${esc(axisLabels.top)}</div>
<div class="tm-dual-axis-label middle" data-lg-component="GraphicLabel" data-lg-text-role="轴中部标签" data-lg-max-chars="8">${esc(axisLabels.middle)}</div>
<div class="tm-dual-axis-label bottom" data-lg-component="GraphicLabel" data-lg-text-role="轴底部标签" data-lg-max-chars="8">${esc(axisLabels.bottom)}</div>
</div>`);
}

function hubTargetHtml(target, index) {
  const positions = [
    { x: 1555, y: 310, size: 160 },
    { x: 1755, y: 440, size: 160 },
    { x: 1570, y: 615, size: 160 },
  ];
  const pos = positions[index] || positions[positions.length - 1];
  return `<div class="tm-hub-target" data-lg-component="GraphicNode" data-lg-node-id="target-${index + 1}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.size}px;height:${pos.size}px;">
    <span data-lg-text-role="结果节点" data-lg-max-chars="10">${esc(target.title || target)}</span>
  </div>`;
}

function hubOrbitNodeHtml(node, index) {
  const positions = [
    { x: 622, y: 265 },
    { x: 1118, y: 265 },
    { x: 622, y: 695 },
    { x: 1118, y: 695 },
  ];
  const pos = positions[index] || positions[index % positions.length];
  return `<div class="tm-hub-orbit-node" data-lg-component="GraphicNode" data-lg-node-id="orbit-${index + 1}" style="left:${pos.x}px;top:${pos.y}px;">
    <span data-lg-text-role="轨道节点" data-lg-max-chars="4">${esc(node.title || node.label || node)}</span>
  </div>`;
}

export function renderHubOrbitNetwork(data) {
  const source = data.source || {};
  const hub = data.hub || {};
  const orbitNodes = (data.orbitNodes || []).slice(0, 4);
  const targets = (data.targets || []).slice(0, 3);
  const orbitLabels = {
    top: data.orbitLabels?.top || "上方关系",
    left: data.orbitLabels?.left || "左侧关系",
    right: data.orbitLabels?.right || "右侧关系",
    bottom: data.orbitLabels?.bottom || "下方关系",
    outerTop: data.orbitLabels?.outerTop || "外层传递",
    outerBottom: data.orbitLabels?.outerBottom || "外层认同",
  };
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-hub-network" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <filter id="tm-hub-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="var(--tm-network-glow)" flood-opacity="1"></feDropShadow>
    </filter>
    <linearGradient id="tm-hub-flow-left" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-network-primary)" stop-opacity="0.10"></stop>
      <stop offset="100%" stop-color="var(--tm-network-primary)" stop-opacity="0.92"></stop>
    </linearGradient>
    <linearGradient id="tm-hub-flow-right" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-network-primary)" stop-opacity="0.10"></stop>
      <stop offset="100%" stop-color="var(--tm-network-primary)" stop-opacity="0.92"></stop>
    </linearGradient>
  </defs>
  <ellipse class="tm-hub-outer-loop" cx="960" cy="540" rx="720" ry="430"></ellipse>
  <ellipse class="tm-hub-inner-loop" cx="960" cy="540" rx="330" ry="300"></ellipse>
  <ellipse class="tm-hub-target-loop" cx="1735" cy="540" rx="170" ry="170"></ellipse>
  <line class="tm-hub-spoke" x1="960" y1="540" x2="700" y2="345"></line>
  <line class="tm-hub-spoke" x1="960" y1="540" x2="1220" y2="345"></line>
  <line class="tm-hub-spoke" x1="960" y1="540" x2="700" y2="775"></line>
  <line class="tm-hub-spoke" x1="960" y1="540" x2="1220" y2="775"></line>
  <path class="tm-hub-flow left" d="M 468 520 L 512 520 L 512 498 L 554 540 L 512 582 L 512 560 L 468 560 Z"></path>
  <path class="tm-hub-flow right" d="M 1365 520 L 1410 520 L 1410 498 L 1452 540 L 1410 582 L 1410 560 L 1365 560 Z"></path>
  <polygon class="tm-hub-loop-arrow top outer" points="960,90 980,110 960,130"></polygon>
  <polygon class="tm-hub-loop-arrow top inner" points="960,220 980,240 960,260"></polygon>
  <polygon class="tm-hub-loop-arrow bottom inner" points="960,860 940,840 960,820"></polygon>
  <polygon class="tm-hub-loop-arrow bottom outer" points="960,990 940,970 960,950"></polygon>
</svg>
<div class="tm-hub-source" data-lg-component="GraphicNode" data-lg-node-id="source">
  <span data-lg-text-role="起点节点" data-lg-max-chars="10">${esc(source.title || "起点")}</span>
</div>
<div class="tm-hub-center" data-lg-component="GraphicNode" data-lg-node-id="hub" data-lg-emphasis="true">
  <strong data-lg-text-role="中心标题" data-lg-max-chars="8">${esc(hub.title || "核心")}</strong>
  <span data-lg-text-role="中心副标题" data-lg-max-chars="16">${esc(hub.subtitle || "Hub")}</span>
</div>
${orbitNodes.map((node, index) => hubOrbitNodeHtml(node, index)).join("")}
${targets.map((target, index) => hubTargetHtml(target, index)).join("")}
<div class="tm-hub-label top" data-lg-component="GraphicLabel" data-lg-text-role="上方关系标签" data-lg-max-chars="10">${esc(orbitLabels.top)}</div>
<div class="tm-hub-label left" data-lg-component="GraphicLabel" data-lg-text-role="左侧关系标签" data-lg-max-chars="10">${esc(orbitLabels.left)}</div>
<div class="tm-hub-label right" data-lg-component="GraphicLabel" data-lg-text-role="右侧关系标签" data-lg-max-chars="10">${esc(orbitLabels.right)}</div>
<div class="tm-hub-label bottom" data-lg-component="GraphicLabel" data-lg-text-role="下方关系标签" data-lg-max-chars="10">${esc(orbitLabels.bottom)}</div>
<div class="tm-hub-label outer-top" data-lg-component="GraphicLabel" data-lg-text-role="外层上标签" data-lg-max-chars="10">${esc(orbitLabels.outerTop)}</div>
<div class="tm-hub-label outer-bottom" data-lg-component="GraphicLabel" data-lg-text-role="外层下标签" data-lg-max-chars="10">${esc(orbitLabels.outerBottom)}</div>
</div>`);
}

export function renderTemplateMotif(data) {
  if (data.type === "layered-stack-3d") return renderLayeredStack3D(data);
  if (data.type === "split-pyramid-matrix") return renderSplitPyramidMatrix(data);
  if (data.type === "triangle-cycle") return renderTriangleCycle(data);
  if (data.type === "orbit-flywheel") return renderOrbitFlywheel(data);
  if (data.type === "dual-focus-cone") return renderDualFocusCone(data);
  if (data.type === "hub-orbit-network") return renderHubOrbitNetwork(data);
  throw new Error(`未知模板母题类型：${data.type}`);
}
