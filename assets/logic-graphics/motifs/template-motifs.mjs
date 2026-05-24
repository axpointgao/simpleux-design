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

function polarPoint(cx, cy, r, angleDeg) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(angle)) * 100) / 100,
    y: Math.round((cy + r * Math.sin(angle)) * 100) / 100,
  };
}

function annularSectorPath({ cx, cy, innerR, outerR, startAngle, endAngle }) {
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const outerStart = polarPoint(cx, cy, outerR, startAngle);
  const outerEnd = polarPoint(cx, cy, outerR, endAngle);
  const innerEnd = polarPoint(cx, cy, innerR, endAngle);
  const innerStart = polarPoint(cx, cy, innerR, startAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
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
      ribbonPrimary: userTokens.ribbonPrimary || styleTokens.ribbonPrimary || styleTokens.focusLeft || styleTokens.cycleAccent || mergedTokens.networkPrimary,
      ribbonDark: userTokens.ribbonDark || styleTokens.ribbonDark || styleTokens.focusRight || "#1f2c3b",
      ribbonSoft: userTokens.ribbonSoft || styleTokens.ribbonSoft || styleTokens.focusConeLeft || styleTokens.cycleAccentSoft || mergedTokens.cycleAccentSoft,
      ribbonLine: userTokens.ribbonLine || styleTokens.ribbonLine || styleTokens.cycleRing || mergedTokens.networkLine,
      ribbonInk: userTokens.ribbonInk || styleTokens.ribbonInk || styleTokens.focusInk || styleTokens.cycleInk || mergedTokens.networkInk,
      ribbonMuted: userTokens.ribbonMuted || styleTokens.ribbonMuted || styleTokens.cycleMuted || "#7c8794",
      ribbonShadow: userTokens.ribbonShadow || styleTokens.ribbonShadow || styleTokens.cycleShadow || "0 14px 34px rgba(15, 23, 42, 0.10)",
      triadPrimary: userTokens.triadPrimary || styleTokens.triadPrimary || styleTokens.focusLeft || styleTokens.cycleAccent || mergedTokens.networkPrimary,
      triadDark: userTokens.triadDark || styleTokens.triadDark || styleTokens.focusRight || "#1f2c3b",
      triadSoft: userTokens.triadSoft || styleTokens.triadSoft || styleTokens.focusConeLeft || styleTokens.cycleAccentSoft || mergedTokens.cycleAccentSoft,
      triadLine: userTokens.triadLine || styleTokens.triadLine || styleTokens.cycleRing || mergedTokens.networkLine,
      triadInk: userTokens.triadInk || styleTokens.triadInk || styleTokens.focusInk || styleTokens.cycleInk || mergedTokens.networkInk,
      layeredPrimary: userTokens.layeredPrimary || styleTokens.layeredPrimary || styleTokens.focusLeft || styleTokens.cycleAccent || mergedTokens.networkPrimary,
      layeredDark: userTokens.layeredDark || styleTokens.layeredDark || styleTokens.focusRight || "#1f2c3b",
      layeredSoft: userTokens.layeredSoft || styleTokens.layeredSoft || styleTokens.focusConeLeft || styleTokens.cycleAccentSoft || mergedTokens.cycleAccentSoft,
      layeredLine: userTokens.layeredLine || styleTokens.layeredLine || styleTokens.cycleRing || mergedTokens.networkLine,
      layeredInk: userTokens.layeredInk || styleTokens.layeredInk || styleTokens.focusInk || styleTokens.cycleInk || mergedTokens.networkInk,
      layeredMuted: userTokens.layeredMuted || styleTokens.layeredMuted || styleTokens.cycleMuted || "#7c8794",
      bilateralPrimary: userTokens.bilateralPrimary || styleTokens.bilateralPrimary || styleTokens.focusLeft || styleTokens.cycleAccent || mergedTokens.networkPrimary,
      bilateralDark: userTokens.bilateralDark || styleTokens.bilateralDark || styleTokens.focusRight || "#1f2c3b",
      bilateralSoft: userTokens.bilateralSoft || styleTokens.bilateralSoft || styleTokens.focusConeLeft || styleTokens.cycleAccentSoft || mergedTokens.cycleAccentSoft,
      bilateralLine: userTokens.bilateralLine || styleTokens.bilateralLine || styleTokens.cycleRing || mergedTokens.networkLine,
      bilateralInk: userTokens.bilateralInk || styleTokens.bilateralInk || styleTokens.focusInk || styleTokens.cycleInk || mergedTokens.networkInk,
      bilateralMuted: userTokens.bilateralMuted || styleTokens.bilateralMuted || styleTokens.cycleMuted || "#7c8794",
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

function deploymentStepNodeHtml(step, index) {
  const positions = [
    { x: 314, y: 873 },
    { x: 438, y: 634 },
    { x: 651, y: 471 },
    { x: 913, y: 413 },
    { x: 1175, y: 471 },
    { x: 1388, y: 634 },
    { x: 1512, y: 873 },
  ];
  const pos = positions[index];
  if (!pos) return "";
  return `<div class="tm-deploy-step-node" data-lg-component="GraphicNode" data-lg-node-id="deploy-step-${index + 1}" style="left:${pos.x}px;top:${pos.y}px;">
    <span data-lg-text-role="部署步骤节点" data-lg-max-chars="8">${esc(step.title || step.label || step)}</span>
  </div>`;
}

function deploymentMilestoneHtml(item, side, index) {
  const positions = {
    left: [
      { x: 32, y: 675 },
      { x: 135, y: 520 },
      { x: 353, y: 337 },
    ],
    right: [
      { x: 1357, y: 337 },
      { x: 1575, y: 520 },
      { x: 1678, y: 675 },
    ],
  };
  const pos = positions[side]?.[index];
  if (!pos) return "";
  return `<article class="tm-deploy-milestone ${side}" data-lg-component="GraphicCallout" style="left:${pos.x}px;top:${pos.y}px;">
    <i aria-hidden="true"></i>
    <div>
      <strong data-lg-text-role="外侧阶段标签" data-lg-max-chars="4">${esc(item.title || item.label || "阶段")}</strong>
      <span data-lg-text-role="外侧阶段说明" data-lg-max-chars="14">${esc(item.subtitle || item.body || "")}</span>
    </div>
  </article>`;
}

function deploymentArcLabelHtml(item, index) {
  const positions = [
    { x: 492, y: 868 },
    { x: 617, y: 711 },
    { x: 778, y: 633 },
    { x: 986, y: 633 },
    { x: 1147, y: 711 },
    { x: 1272, y: 868 },
  ];
  const pos = positions[index];
  if (!pos) return "";
  return `<div class="tm-deploy-arc-label" data-lg-component="GraphicLabel" data-lg-text-role="步骤关系标签" data-lg-max-chars="16" style="left:${pos.x}px;top:${pos.y}px;">
    <strong>${esc(item.title || item.label || "")}</strong>
    <span>${esc(item.subtitle || item.body || "")}</span>
  </div>`;
}

export function renderDeploymentOrbitSteps(data) {
  const title = data.title || {};
  const center = data.center || {};
  const steps = (data.steps || []).slice(0, 7);
  const leftMilestones = (data.leftMilestones || []).slice(0, 3);
  const rightMilestones = (data.rightMilestones || []).slice(0, 3);
  const arcLabels = (data.arcLabels || []).slice(0, 6);
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-deploy-orbit" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <circle class="tm-deploy-dome" cx="960" cy="1080" r="820"></circle>
  <path class="tm-deploy-outer-track" d="M 340 1080 A 620 620 0 0 1 1580 1080"></path>
  <path class="tm-deploy-inner-track" d="M 530 1080 A 430 430 0 0 1 1390 1080"></path>
</svg>
<header class="tm-deploy-title" data-lg-component="GraphicLabel">
  <strong data-lg-text-role="图形标题" data-lg-max-chars="18">${esc(title.heading || "数字员工部署实施关键步骤")}</strong>
  <span data-lg-text-role="图形副标题" data-lg-max-chars="12">${esc(title.subtitle || "依托行业真")}</span>
</header>
<div class="tm-deploy-center" data-lg-component="GraphicNode" data-lg-node-id="deploy-center" data-lg-emphasis="true">
  <strong data-lg-text-role="中心标题" data-lg-max-chars="8">${esc(center.title || "双模协同")}</strong>
  <span data-lg-text-role="中心说明" data-lg-max-chars="12">${esc(center.subtitle || "关键文本信息替换")}</span>
</div>
${steps.map((step, index) => deploymentStepNodeHtml(step, index)).join("")}
${leftMilestones.map((item, index) => deploymentMilestoneHtml(item, "left", index)).join("")}
${rightMilestones.map((item, index) => deploymentMilestoneHtml(item, "right", index)).join("")}
${arcLabels.map((item, index) => deploymentArcLabelHtml(item, index)).join("")}
</div>`);
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

function ribbonBadgeHtml(badge, owner, index) {
  const startPositions = {
    top: { x: 180, y: 310 },
    right: { x: 326, y: 485 },
    bottom: { x: 180, y: 690 },
  };
  const endPositions = {
    "top-left": { x: 1452, y: 365 },
    "bottom-left": { x: 1452, y: 645 },
    top: { x: 1452, y: 365 },
    bottom: { x: 1452, y: 645 },
  };
  const fallback = owner === "start"
    ? [{ x: 180, y: 310 }, { x: 326, y: 485 }, { x: 180, y: 690 }]
    : [{ x: 1452, y: 365 }, { x: 1452, y: 645 }];
  const positions = owner === "start" ? startPositions : endPositions;
  const pos = positions[badge.position] || fallback[index % fallback.length];
  return `<div class="tm-ribbon-badge ${owner}" data-lg-component="GraphicBadge" style="left:${pos.x}px;top:${pos.y}px;"><span data-lg-text-role="阶段辅助标签" data-lg-max-chars="8">${esc(badge.title || badge.label || "短标签")}</span></div>`;
}

function ribbonStageHtml(stage, index, total) {
  const positions = total <= 2
    ? [{ x: 545, y: 360 }, { x: 1015, y: 360 }]
    : [{ x: 485, y: 360 }, { x: 815, y: 360 }, { x: 1145, y: 360 }];
  const pos = positions[index] || positions[index % positions.length];
  const lines = stage.lines || (stage.body ? [stage.body] : []);
  return `<article class="tm-ribbon-stage" data-lg-component="GraphicGroup" style="left:${pos.x}px;top:${pos.y}px;">
    <div class="tm-ribbon-stage-dot" data-lg-component="GraphicNode" data-lg-node-id="stage-${index + 1}">
      <span data-lg-text-role="阶段标题" data-lg-max-chars="10">${esc(stage.title || `阶段${index + 1}`)}</span>
      <div class="tm-ribbon-stage-copy" data-lg-component="GraphicLabel" data-lg-text-role="阶段说明" data-lg-max-chars="42">
        ${lines.slice(0, 2).map((line) => `<span>${esc(line)}</span>`).join("")}
      </div>
    </div>
  </article>`;
}

export function renderRibbonStagePipeline(data) {
  const start = data.start || {};
  const end = data.end || {};
  const stages = (data.stages || []).slice(0, 3);
  const normalizedStages = stages.length ? stages : [
    { title: "阶段一", lines: ["短说明", "短说明"] },
    { title: "阶段二", lines: ["短说明", "短说明"] },
  ];
  const startBadges = (start.badges || data.badges?.start || []).slice(0, 3);
  const endBadges = (end.badges || data.badges?.end || []).slice(0, 2);
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-ribbon-pipeline" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <linearGradient id="tm-ribbon-band-fill" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-ribbon-soft)" stop-opacity="0.76"></stop>
      <stop offset="70%" stop-color="var(--tm-ribbon-soft)" stop-opacity="0.62"></stop>
      <stop offset="100%" stop-color="var(--tm-ribbon-soft)" stop-opacity="0"></stop>
    </linearGradient>
    <linearGradient id="tm-ribbon-arrow-fill" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="var(--tm-ribbon-primary)" stop-opacity="0.18"></stop>
      <stop offset="42%" stop-color="var(--tm-ribbon-primary)" stop-opacity="0.72"></stop>
      <stop offset="100%" stop-color="var(--tm-ribbon-primary)" stop-opacity="1"></stop>
    </linearGradient>
  </defs>
  <path class="tm-ribbon-band" d="M 304 486 L 1354 -30 L 1920 -30 L 1920 1110 L 1336 1110 L 304 642 Z"></path>
  <circle class="tm-ribbon-end-ring start" cx="214" cy="560" r="184"></circle>
  <circle class="tm-ribbon-end-ring end" cx="1712" cy="560" r="184"></circle>
  <path class="tm-ribbon-stage-arc one top" d="M 672 270 C 710 352 734 443 744 523"></path>
  <path class="tm-ribbon-stage-arc one bottom" d="M 744 597 C 732 684 704 774 666 845"></path>
  <path class="tm-ribbon-stage-arc two top" d="M 1084 90 C 1144 226 1190 384 1208 523"></path>
  <path class="tm-ribbon-stage-arc two bottom" d="M 1208 597 C 1190 738 1144 895 1084 1030"></path>
  <path class="tm-ribbon-flow" d="M 920 514 L 980 560 L 920 606 Z"></path>
  <path class="tm-ribbon-flow" d="M 1398 514 L 1458 560 L 1398 606 Z"></path>
</svg>
<div class="tm-ribbon-endpoint start" data-lg-component="GraphicNode" data-lg-node-id="start">
  <span data-lg-text-role="起点标题" data-lg-max-chars="10">${esc(start.title || "起点")}</span>
</div>
<div class="tm-ribbon-endpoint end" data-lg-component="GraphicNode" data-lg-node-id="end">
  <span data-lg-text-role="终点标题" data-lg-max-chars="10">${esc(end.title || "终点")}</span>
</div>
${normalizedStages.map((stage, index) => ribbonStageHtml(stage, index, normalizedStages.length)).join("")}
${startBadges.map((badge, index) => ribbonBadgeHtml(badge, "start", index)).join("")}
${endBadges.map((badge, index) => ribbonBadgeHtml(badge, "end", index)).join("")}
</div>`);
}

function triadNodeHtml(node, slot) {
  const positions = {
    top: { x: 838, y: 76, tone: "dark" },
    left: { x: 543, y: 642, tone: "primary" },
    right: { x: 1132, y: 642, tone: "primary" },
  };
  const pos = positions[slot];
  return `<div class="tm-triad-node ${pos.tone} ${slot}" data-lg-component="GraphicNode" data-lg-node-id="triad-${slot}" style="left:${pos.x}px;top:${pos.y}px;">
    <strong data-lg-text-role="环绕节点标题" data-lg-max-chars="10">${esc(node.title || "视觉符号")}</strong>
    <span data-lg-text-role="环绕节点说明" data-lg-max-chars="18">${esc(node.subtitle || "品牌体验规范")}</span>
  </div>`;
}

function triadPillHtml(item, group, index) {
  const positions = {
    left: [
      { x: 105, y: 605 },
      { x: 105, y: 715 },
      { x: 105, y: 825 },
    ],
    topRight: [
      { x: 1346, y: 132 },
      { x: 1346, y: 242 },
    ],
    right: [
      { x: 1610, y: 550 },
      { x: 1610, y: 660 },
      { x: 1610, y: 770 },
      { x: 1610, y: 880 },
    ],
  };
  const pos = (positions[group] || positions.left)[index];
  if (!pos) return "";
  return `<div class="tm-triad-pill ${group}" data-lg-component="GraphicBadge" data-lg-text-role="属性标签" data-lg-max-chars="8" style="left:${pos.x}px;top:${pos.y}px;">${esc(item.title || item.label || item)}</div>`;
}

export function renderTriadOrbitConcept(data) {
  const center = data.center || {};
  const nodes = {
    top: data.nodes?.top || data.nodes?.[0] || {},
    left: data.nodes?.left || data.nodes?.[1] || {},
    right: data.nodes?.right || data.nodes?.[2] || {},
  };
  const pillGroups = {
    left: (data.pillGroups?.left || []).slice(0, 3),
    topRight: (data.pillGroups?.topRight || []).slice(0, 2),
    right: (data.pillGroups?.right || []).slice(0, 4),
  };
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-triad-orbit" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <filter id="tm-triad-soft-shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="rgba(15, 23, 42, 0.12)" flood-opacity="1"></feDropShadow>
    </filter>
    <marker id="tm-triad-arrow-head" viewBox="0 0 24 24" refX="18" refY="12" markerWidth="28" markerHeight="28" markerUnits="userSpaceOnUse" orient="auto">
      <path d="M 4 4 L 20 12 L 4 20 Z" fill="var(--tm-triad-primary)"></path>
    </marker>
  </defs>
  <circle class="tm-triad-center-back" cx="970" cy="568" r="278"></circle>
  <path class="tm-triad-orbit-arrow left" d="M 602 503 A 374 374 0 0 1 794 238"></path>
  <path class="tm-triad-orbit-arrow right" d="M 1146 238 A 374 374 0 0 1 1338 503"></path>
  <path class="tm-triad-orbit-arrow bottom" d="M 1134 904 A 374 374 0 0 1 806 904"></path>
  <path class="tm-triad-bracket left" d="M 390 700 C 420 742 420 780 390 820"></path>
  <line class="tm-triad-bracket-line left" x1="410" y1="760" x2="482" y2="760"></line>
  <path class="tm-triad-bracket top-right" d="M 1288 178 C 1260 222 1260 258 1288 302"></path>
  <line class="tm-triad-bracket-line top-right" x1="1208" y1="240" x2="1260" y2="240"></line>
  <path class="tm-triad-bracket right" d="M 1576 705 C 1545 760 1545 800 1576 855"></path>
  <line class="tm-triad-bracket-line right" x1="1500" y1="775" x2="1547" y2="775"></line>
</svg>
<div class="tm-triad-center-label" data-lg-component="GraphicLabel">
  <strong data-lg-text-role="中心概念标题" data-lg-max-chars="14">${esc(center.title || "核心概念")}</strong>
  <span data-lg-text-role="中心概念副标题" data-lg-max-chars="24">${esc(center.subtitle || "Central concept")}</span>
</div>
${triadNodeHtml(nodes.top, "top")}
${triadNodeHtml(nodes.left, "left")}
${triadNodeHtml(nodes.right, "right")}
${pillGroups.left.map((item, index) => triadPillHtml(item, "left", index)).join("")}
${pillGroups.topRight.map((item, index) => triadPillHtml(item, "topRight", index)).join("")}
${pillGroups.right.map((item, index) => triadPillHtml(item, "right", index)).join("")}
</div>`);
}

function layeredInputHtml(item, index) {
  const positions = [
    { x: 586, y: 131 },
    { x: 784, y: 131 },
    { x: 982, y: 131 },
    { x: 1180, y: 131 },
  ];
  const pos = positions[index];
  if (!pos) return "";
  return `<div class="tm-layered-input" data-lg-component="GraphicNode" data-lg-node-id="input-${index + 1}" style="left:${pos.x}px;top:${pos.y}px;">
    <span data-lg-text-role="顶部输入节点" data-lg-max-chars="8">${esc(item.title || item.label || item)}</span>
  </div>`;
}

function layeredCoreHtml(item, index) {
  const positions = [
    { x: 720, y: 448, tone: "primary" },
    { x: 980, y: 448, tone: "dark" },
  ];
  const pos = positions[index];
  if (!pos) return "";
  return `<div class="tm-layered-core-node ${pos.tone}" data-lg-component="GraphicNode" data-lg-node-id="core-${index + 1}" style="left:${pos.x}px;top:${pos.y}px;">
    <span data-lg-text-role="核心节点" data-lg-max-chars="10">${esc(item.title || item.label || item)}</span>
  </div>`;
}

function layeredSideRowHtml(row, side, index) {
  const y = [350, 506, 662][index];
  if (y === undefined) return "";
  const left = side === "left" ? 48 : 1352;
  const labelLeft = side === "left" ? 336 : 1372;
  const textLeft = side === "left" ? 68 : 1610;
  const titleTone = side === "left" ? "primary" : "muted";
  const lines = row.lines || (row.body ? [row.body] : []);
  const text = lines.slice(0, 2).map((line) => `<span>${esc(line)}</span>`).join("");
  return `<article class="tm-layered-side-row ${side}" data-lg-component="GraphicCallout" style="left:${left}px;top:${y}px;">
    <div class="tm-layered-row-label ${titleTone}" data-lg-component="GraphicBadge" data-lg-text-role="${side === "left" ? "左侧层级标签" : "右侧属性标签"}" data-lg-max-chars="8" style="left:${labelLeft - left}px;">${esc(row.title || row.label || "标签")}</div>
    <div class="tm-layered-row-copy" data-lg-component="GraphicLabel" data-lg-text-role="侧边说明" data-lg-max-chars="34" style="left:${textLeft - left}px;">${text}</div>
  </article>`;
}

function layeredBottomPillHtml(item, index) {
  const positions = [
    { x: 496, y: 825 },
    { x: 816, y: 825 },
    { x: 1136, y: 825 },
  ];
  const pos = positions[index];
  if (!pos) return "";
  return `<div class="tm-layered-bottom-pill" data-lg-component="GraphicBadge" data-lg-text-role="底部问题标签" data-lg-max-chars="10" style="left:${pos.x}px;top:${pos.y}px;">${esc(item.title || item.label || item)}</div>`;
}

export function renderLayeredCoreDiagnosis(data) {
  const topInputs = (data.topInputs || []).slice(0, 4);
  const cores = (data.cores || []).slice(0, 2);
  const leftRows = (data.leftRows || []).slice(0, 3);
  const rightRows = (data.rightRows || []).slice(0, 3);
  const bottomItems = (data.bottomItems || []).slice(0, 3);
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  return frame(data, `
<div class="tm-layered-diagnosis" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <linearGradient id="tm-layered-bridge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--tm-layered-primary)" stop-opacity="0"></stop>
      <stop offset="36%" stop-color="var(--tm-layered-primary)" stop-opacity="0.95"></stop>
      <stop offset="64%" stop-color="var(--tm-layered-primary)" stop-opacity="0.95"></stop>
      <stop offset="100%" stop-color="var(--tm-layered-primary)" stop-opacity="0"></stop>
    </linearGradient>
  </defs>
  <ellipse class="tm-layered-back-ring" cx="960" cy="565" rx="600" ry="420"></ellipse>
  <path class="tm-layered-bridge top" d="M 920 300 L 1000 300 C 980 335 980 375 1000 410 L 920 410 C 940 374 940 335 920 300 Z"></path>
  <path class="tm-layered-bridge bottom" d="M 920 705 L 1000 705 C 980 742 980 782 1000 820 L 920 820 C 940 782 940 742 920 705 Z"></path>
  <polygon class="tm-layered-side-tab left" points="690,520 650,548 690,576"></polygon>
  <polygon class="tm-layered-side-tab right" points="1230,520 1270,548 1230,576"></polygon>
</svg>
<section class="tm-layered-top-group" data-lg-component="GraphicGroup"></section>
<section class="tm-layered-core-group" data-lg-component="GraphicGroup"></section>
<section class="tm-layered-bottom-group" data-lg-component="GraphicGroup"></section>
${topInputs.map((item, index) => layeredInputHtml(item, index)).join("")}
${cores.map((item, index) => layeredCoreHtml(item, index)).join("")}
${leftRows.map((row, index) => layeredSideRowHtml(row, "left", index)).join("")}
${rightRows.map((row, index) => layeredSideRowHtml(row, "right", index)).join("")}
${bottomItems.map((item, index) => layeredBottomPillHtml(item, index)).join("")}
</div>`);
}

function bilateralEndpointHtml(endpoint, side) {
  const pos = side === "left"
    ? { x: 160, y: 390, tone: "primary" }
    : { x: 1510, y: 390, tone: "dark" };
  return `<div class="tm-bilateral-endpoint ${side} ${pos.tone}" data-lg-component="GraphicNode" data-lg-node-id="${side}-endpoint" style="left:${pos.x}px;top:${pos.y}px;">
    <strong data-lg-text-role="${side === "left" ? "左端节点标题" : "右端节点标题"}" data-lg-max-chars="8">${esc(endpoint.title || "协同提效")}</strong>
    <span data-lg-text-role="${side === "left" ? "左端节点说明" : "右端节点说明"}" data-lg-max-chars="16">${esc(endpoint.subtitle || "模块协同 风险规避")}</span>
  </div>`;
}

function bilateralOutsideLabelHtml(item, side, index) {
  const positions = {
    left: [
      { x: 65, y: 220 },
      { x: 65, y: 810 },
    ],
    right: [
      { x: 1608, y: 220 },
      { x: 1608, y: 810 },
    ],
  };
  const pos = positions[side]?.[index];
  if (!pos) return "";
  return `<article class="tm-bilateral-outside ${side}" data-lg-component="GraphicCallout" style="left:${pos.x}px;top:${pos.y}px;">
    <strong data-lg-text-role="外侧说明标题" data-lg-max-chars="10">${esc(item.title || "聚合模型")}</strong>
    <span data-lg-text-role="外侧说明副标题" data-lg-max-chars="14">${esc(item.subtitle || "AI digital")}</span>
  </article>`;
}

function bilateralFlowLabelHtml(item, side) {
  const positions = {
    left: { x: 410, y: 529 },
    right: { x: 1296, y: 529 },
  };
  const pos = positions[side];
  if (!pos) return "";
  return `<div class="tm-bilateral-flow-label ${side}" data-lg-component="GraphicLabel" data-lg-text-role="横向关系标签" data-lg-max-chars="16" style="left:${pos.x}px;top:${pos.y}px;">${esc(item.label || item.title || item)}</div>`;
}

function bilateralDiagonalLabelHtml(item, side, index) {
  const positions = {
    left: [
      { x: 500, y: 326, rotate: -31 },
      { x: 500, y: 716, rotate: 31 },
    ],
    right: [
      { x: 1216, y: 326, rotate: 31 },
      { x: 1216, y: 716, rotate: -31 },
    ],
  };
  const pos = positions[side]?.[index];
  if (!pos) return "";
  return `<div class="tm-bilateral-diagonal-label ${side}" data-lg-component="GraphicLabel" data-lg-text-role="斜向关系标签" data-lg-max-chars="16" style="left:${pos.x}px;top:${pos.y}px;--tm-bilateral-label-rotate:${pos.rotate}deg;">${esc(item.label || item.title || item)}</div>`;
}

function bilateralArcBadgeHtml(item, slot) {
  const positions = {
    top: { x: 852, y: 62 },
    bottom: { x: 852, y: 930 },
  };
  const pos = positions[slot];
  return `<div class="tm-bilateral-arc-badge ${slot}" data-lg-component="GraphicBadge" data-lg-text-role="外层闭环标签" data-lg-max-chars="12" style="left:${pos.x}px;top:${pos.y}px;">${esc(item.label || item.title || "AI digital")}</div>`;
}

export function renderBilateralCoreLoop(data) {
  const center = data.center || {};
  const left = data.left || {};
  const right = data.right || {};
  const quadrants = (data.quadrants || []).slice(0, 4);
  const normalizedQuadrants = quadrants.length ? quadrants : [
    { title: "风险\n规避" },
    { title: "定位\n增强" },
    { title: "协同\n提效" },
    { title: "运营\n聚合" },
  ];
  const leftLabels = (left.labels || []).slice(0, 2);
  const rightLabels = (right.labels || []).slice(0, 2);
  const leftFlows = (data.flows?.left || []).slice(0, 2);
  const rightFlows = (data.flows?.right || []).slice(0, 2);
  const leftDiagonals = (data.diagonalFlows?.left || data.diagonals?.left || leftFlows).slice(0, 2);
  const rightDiagonals = (data.diagonalFlows?.right || data.diagonals?.right || rightFlows).slice(0, 2);
  const arcLabels = {
    top: data.arcLabels?.top || { label: "AI digital" },
    bottom: data.arcLabels?.bottom || { label: "AI digital" },
  };
  const motifStyle = resolveMotifStyle(data);
  const themeVars = cssVarTokens(motifStyle.tokens);
  const cx = 960;
  const cy = 540;
  const outerR = 246;
  const innerR = 120;
  const sectorAngles = [
    [-90, 0],
    [0, 90],
    [90, 180],
    [180, 270],
  ];
  const sectorHtml = normalizedQuadrants.map((item, index) => {
    const [startAngle, endAngle] = sectorAngles[index] || sectorAngles[0];
    return `<path class="tm-bilateral-sector sector-${index + 1}" data-lg-component="GraphicGroup" d="${annularSectorPath({ cx, cy, innerR, outerR, startAngle, endAngle })}"></path>`;
  }).join("");
  const quadrantLabelPositions = [
    { x: 1046, y: 394 },
    { x: 1046, y: 626 },
    { x: 774, y: 626 },
    { x: 774, y: 394 },
  ];
  const quadrantLabels = normalizedQuadrants.map((item, index) => {
    const pos = quadrantLabelPositions[index] || quadrantLabelPositions[0];
    return `<div class="tm-bilateral-quadrant-label" data-lg-component="GraphicLabel" data-lg-text-role="中心环分区标签" data-lg-max-chars="8" style="left:${pos.x}px;top:${pos.y}px;">${esc(item.title || item.label || item)}</div>`;
  }).join("");
  return frame(data, `
<div class="tm-bilateral-loop" data-template-style="${esc(motifStyle.styleName)}"${themeVars}>
<svg class="tm-canvas" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" aria-hidden="true">
  <defs>
    <marker id="tm-bilateral-arrow-primary" viewBox="0 0 24 24" refX="19" refY="12" markerWidth="24" markerHeight="24" markerUnits="userSpaceOnUse" orient="auto">
      <path d="M 4 4 L 20 12 L 4 20 Z" fill="var(--tm-bilateral-primary)"></path>
    </marker>
    <marker id="tm-bilateral-arrow-muted" viewBox="0 0 20 20" refX="17" refY="10" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto">
      <path d="M 4 4 L 17 10 L 4 16 Z" fill="rgba(31, 42, 36, 0.48)"></path>
    </marker>
  </defs>
  <path class="tm-bilateral-soft-band left" d="M 374 540 L 730 244 L 730 836 Z"></path>
  <path class="tm-bilateral-soft-band right" d="M 1546 540 L 1190 244 L 1190 836 Z"></path>
  <path class="tm-bilateral-outer-arc top" d="M 404 214 C 680 82 1240 82 1516 214"></path>
  <path class="tm-bilateral-outer-arc bottom" d="M 404 866 C 680 998 1240 998 1516 866"></path>
  <path class="tm-bilateral-outer-arrow top" d="M 1488 198 C 1500 205 1509 211 1516 214"></path>
  <path class="tm-bilateral-outer-arrow bottom" d="M 404 866 C 411 863 420 857 432 850"></path>
  <path class="tm-bilateral-diagonal-line left top" d="M 700 330 L 430 475"></path>
  <path class="tm-bilateral-diagonal-line left bottom" d="M 700 750 L 430 605"></path>
  <path class="tm-bilateral-diagonal-line right top" d="M 1220 330 L 1490 475"></path>
  <path class="tm-bilateral-diagonal-line right bottom" d="M 1220 750 L 1490 605"></path>
  <path class="tm-bilateral-flow-line muted left top" d="M 652 482 L 420 482"></path>
  <path class="tm-bilateral-flow-line muted left bottom" d="M 420 598 L 652 598"></path>
  <path class="tm-bilateral-flow-line muted right top" d="M 1268 482 L 1500 482"></path>
  <path class="tm-bilateral-flow-line muted right bottom" d="M 1500 598 L 1268 598"></path>
  <circle class="tm-bilateral-core-shadow" cx="${cx}" cy="${cy}" r="302"></circle>
  <circle class="tm-bilateral-core-shell" cx="${cx}" cy="${cy}" r="278"></circle>
  ${sectorHtml}
  <line class="tm-bilateral-sector-split" x1="${cx}" y1="${cy - outerR}" x2="${cx}" y2="${cy - innerR}"></line>
  <line class="tm-bilateral-sector-split" x1="${cx + innerR}" y1="${cy}" x2="${cx + outerR}" y2="${cy}"></line>
  <line class="tm-bilateral-sector-split" x1="${cx}" y1="${cy + innerR}" x2="${cx}" y2="${cy + outerR}"></line>
  <line class="tm-bilateral-sector-split" x1="${cx - innerR}" y1="${cy}" x2="${cx - outerR}" y2="${cy}"></line>
  <circle class="tm-bilateral-core-hole" cx="${cx}" cy="${cy}" r="${innerR}"></circle>
</svg>
${bilateralArcBadgeHtml(arcLabels.top, "top")}
${bilateralArcBadgeHtml(arcLabels.bottom, "bottom")}
${bilateralEndpointHtml(left, "left")}
${bilateralEndpointHtml(right, "right")}
${leftLabels.map((item, index) => bilateralOutsideLabelHtml(item, "left", index)).join("")}
${rightLabels.map((item, index) => bilateralOutsideLabelHtml(item, "right", index)).join("")}
${bilateralFlowLabelHtml(leftFlows[0] || {}, "left")}
${bilateralFlowLabelHtml(rightFlows[0] || {}, "right")}
${leftDiagonals.map((item, index) => bilateralDiagonalLabelHtml(item, "left", index)).join("")}
${rightDiagonals.map((item, index) => bilateralDiagonalLabelHtml(item, "right", index)).join("")}
${quadrantLabels}
<div class="tm-bilateral-center-label" data-lg-component="GraphicNode" data-lg-node-id="bilateral-center" data-lg-emphasis="true">
  <strong data-lg-text-role="中心标题" data-lg-max-chars="10">${esc(center.title || "AI digital")}</strong>
  <span data-lg-text-role="中心副标题" data-lg-max-chars="14">${esc(center.subtitle || "AI digital")}</span>
</div>
</div>`);
}

export function renderTemplateMotif(data) {
  if (data.type === "layered-stack-3d") return renderLayeredStack3D(data);
  if (data.type === "split-pyramid-matrix") return renderSplitPyramidMatrix(data);
  if (data.type === "triangle-cycle") return renderTriangleCycle(data);
  if (data.type === "orbit-flywheel") return renderOrbitFlywheel(data);
  if (data.type === "deployment-orbit-steps") return renderDeploymentOrbitSteps(data);
  if (data.type === "dual-focus-cone") return renderDualFocusCone(data);
  if (data.type === "hub-orbit-network") return renderHubOrbitNetwork(data);
  if (data.type === "ribbon-stage-pipeline") return renderRibbonStagePipeline(data);
  if (data.type === "triad-orbit-concept") return renderTriadOrbitConcept(data);
  if (data.type === "layered-core-diagnosis") return renderLayeredCoreDiagnosis(data);
  if (data.type === "bilateral-core-loop") return renderBilateralCoreLoop(data);
  throw new Error(`未知模板母题类型：${data.type}`);
}
