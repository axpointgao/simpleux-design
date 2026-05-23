export const CANVAS = Object.freeze({
  width: 1920,
  height: 1080,
  header: { x: 120, y: 64, w: 1680, h: 126 },
  main: { x: 140, y: 226, w: 1640, h: 734 },
  footer: { x: 120, y: 1000, w: 1680, h: 34 },
});

export const TOKEN_VERSION = "logic-graphics-v1";

const NODE_LIMITS = Object.freeze({
  title: 18,
  body: 48,
  connectorLabel: 12,
  badge: 8,
  calloutTitle: 14,
  calloutBody: 56,
  canvasTitle: 30,
  canvasSubtitle: 40,
});

const THEMES = new Set(["simpleux-light", "simpleux-dark"]);
const NODE_KINDS = new Set(["circle", "rect", "pill", "diamond", "index"]);
const LAYOUT_TYPES = new Set(["stack", "path", "radial", "matrix", "loop", "modules"]);

function textLength(value) {
  return Array.from(String(value || "").trim()).length;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function groupKey(node) {
  return node.layer || node.group || "default";
}

function groupTitle(key, data) {
  const group = (data.groups || []).find((item) => item.id === key || item.title === key);
  return group?.title || (key === "default" ? "" : key);
}

function normalizeNode(node, index) {
  return {
    id: String(node.id || `n${index + 1}`),
    kind: NODE_KINDS.has(node.kind) ? node.kind : "rect",
    title: String(node.title || `节点 ${index + 1}`),
    body: String(node.body || ""),
    group: node.group ? String(node.group) : undefined,
    layer: node.layer ? String(node.layer) : undefined,
    emphasis: Boolean(node.emphasis),
    tone: node.tone || "default",
    badge: node.badge ? String(node.badge) : undefined,
    level: node.level || (node.emphasis ? "primary" : "secondary"),
  };
}

function normalizeData(input) {
  const data = input || {};
  const canvas = data.canvas || {};
  const layout = data.layout || {};
  const type = LAYOUT_TYPES.has(layout.type) ? layout.type : "modules";
  const nodes = (data.nodes || []).map(normalizeNode);
  if (nodes.length === 0) {
    throw new Error("逻辑图形至少需要 1 个节点。");
  }
  return {
    ...data,
    canvas: {
      title: String(canvas.title || "逻辑图形"),
      subtitle: String(canvas.subtitle || ""),
      theme: THEMES.has(canvas.theme) ? canvas.theme : "simpleux-light",
      footer: String(canvas.footer || "SimpleUX Logic Graphics"),
    },
    layout: {
      ...layout,
      type,
    },
    nodes,
    connectors: Array.isArray(data.connectors) ? data.connectors : [],
    callouts: Array.isArray(data.callouts) ? data.callouts : [],
    badges: Array.isArray(data.badges) ? data.badges : [],
    labels: Array.isArray(data.labels) ? data.labels : [],
    groups: Array.isArray(data.groups) ? data.groups : [],
  };
}

function nodeSize(kind, layoutType, emphasis, availableWidth = 320) {
  const compact = layoutType === "modules" || layoutType === "matrix";
  if (kind === "circle") {
    const side = emphasis ? 244 : compact ? 170 : 196;
    return { w: side, h: side };
  }
  if (kind === "diamond") {
    const side = emphasis ? 246 : compact ? 186 : 216;
    return { w: side, h: side };
  }
  if (kind === "pill") {
    return { w: clamp(availableWidth, 230, emphasis ? 380 : 330), h: emphasis ? 146 : 126 };
  }
  if (kind === "index") {
    return { w: clamp(availableWidth, 260, emphasis ? 400 : 350), h: emphasis ? 156 : 138 };
  }
  return { w: clamp(availableWidth, 250, emphasis ? 390 : 340), h: emphasis ? 158 : 136 };
}

function uniqueGroups(nodes) {
  const keys = [];
  for (const node of nodes) {
    const key = groupKey(node);
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

function centerPlace(node, x, y, w, h) {
  return { ...node, x: Math.round(x - w / 2), y: Math.round(y - h / 2), w: Math.round(w), h: Math.round(h) };
}

function stackLayout(data) {
  const groups = uniqueGroups(data.nodes);
  const rowGap = 30;
  const rowH = (CANVAS.main.h - rowGap * (groups.length - 1)) / groups.length;
  const placed = [];
  const groupRects = [];
  groups.forEach((key, rowIndex) => {
    const items = data.nodes.filter((node) => groupKey(node) === key);
    const top = rowIndex * (rowH + rowGap);
    const title = groupTitle(key, data);
    groupRects.push({
      id: key,
      title,
      x: 0,
      y: Math.round(top),
      w: CANVAS.main.w,
      h: Math.round(rowH),
    });
    const innerTop = top + (title ? 54 : 26);
    const innerH = rowH - (title ? 72 : 52);
    const gap = 34;
    const slotW = (CANVAS.main.w - 96 - gap * (items.length - 1)) / items.length;
    items.forEach((node, index) => {
      const size = nodeSize(node.kind, "stack", node.emphasis, slotW * 0.82);
      placed.push(centerPlace(node, 48 + slotW * index + gap * index + slotW / 2, innerTop + innerH / 2, size.w, size.h));
    });
  });
  return { nodes: placed, groups: groupRects };
}

function pathLayout(data) {
  const nodes = data.nodes;
  const gap = 38;
  const maxW = (CANVAS.main.w - 88 - gap * (nodes.length - 1)) / nodes.length;
  const placed = [];
  const twoRows = nodes.length > 6;
  const rows = twoRows ? 2 : 1;
  const perRow = Math.ceil(nodes.length / rows);
  const rowCenters = twoRows ? [CANVAS.main.h * 0.36, CANVAS.main.h * 0.66] : [CANVAS.main.h * 0.52];
  nodes.forEach((node, index) => {
    const row = twoRows ? Math.floor(index / perRow) : 0;
    const col = twoRows ? index % perRow : index;
    const rowCount = row === 0 ? Math.min(perRow, nodes.length) : nodes.length - perRow;
    const rowMaxW = (CANVAS.main.w - 88 - gap * (rowCount - 1)) / rowCount;
    const size = nodeSize(node.kind === "rect" ? "index" : node.kind, "path", node.emphasis, Math.min(maxW, rowMaxW) * 0.86);
    const startX = 44 + (CANVAS.main.w - 88 - rowCount * rowMaxW - (rowCount - 1) * gap) / 2;
    const x = startX + col * (rowMaxW + gap) + rowMaxW / 2;
    placed.push(centerPlace({ ...node, kind: node.kind === "rect" ? "index" : node.kind }, x, rowCenters[row], size.w, size.h));
  });
  return { nodes: placed, groups: [] };
}

function radialLayout(data) {
  const centerIndex = Math.max(0, data.nodes.findIndex((node) => node.emphasis));
  const centerNode = data.nodes[centerIndex];
  const outer = data.nodes.filter((_, index) => index !== centerIndex);
  const placed = [];
  const centerSize = nodeSize(centerNode.kind === "rect" ? "circle" : centerNode.kind, "radial", true);
  placed.push(centerPlace({ ...centerNode, kind: centerNode.kind === "rect" ? "circle" : centerNode.kind, emphasis: true }, CANVAS.main.w / 2, CANVAS.main.h / 2, centerSize.w, centerSize.h));
  const rx = Math.min(610, CANVAS.main.w * 0.38);
  const ry = Math.min(255, CANVAS.main.h * 0.36);
  outer.forEach((node, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / outer.length;
    const x = CANVAS.main.w / 2 + Math.cos(angle) * rx;
    const y = CANVAS.main.h / 2 + Math.sin(angle) * ry;
    const size = nodeSize(node.kind, "radial", false, 260);
    placed.push(centerPlace(node, x, y, size.w, size.h));
  });
  return { nodes: placed, groups: [] };
}

function matrixLayout(data) {
  const columns = clamp(Number(data.layout.columns) || Math.ceil(Math.sqrt(data.nodes.length)), 2, 4);
  const rows = Math.ceil(data.nodes.length / columns);
  const gapX = 34;
  const gapY = 30;
  const cellW = (CANVAS.main.w - 72 - gapX * (columns - 1)) / columns;
  const cellH = (CANVAS.main.h - 50 - gapY * (rows - 1)) / rows;
  const placed = [];
  data.nodes.forEach((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const size = nodeSize(node.kind, "matrix", node.emphasis, cellW * 0.82);
    const x = 36 + col * (cellW + gapX) + cellW / 2;
    const y = 25 + row * (cellH + gapY) + cellH / 2;
    placed.push(centerPlace(node, x, y, size.w, Math.min(size.h, cellH * 0.78)));
  });
  return { nodes: placed, groups: [] };
}

function loopLayout(data) {
  const count = data.nodes.length;
  const rx = Math.min(570, CANVAS.main.w * 0.36);
  const ry = Math.min(250, CANVAS.main.h * 0.34);
  const placed = data.nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const x = CANVAS.main.w / 2 + Math.cos(angle) * rx;
    const y = CANVAS.main.h / 2 + Math.sin(angle) * ry;
    const size = nodeSize(node.kind, "loop", node.emphasis, 250);
    return centerPlace(node, x, y, size.w, size.h);
  });
  return { nodes: placed, groups: [] };
}

function modulesLayout(data) {
  const groups = uniqueGroups(data.nodes);
  const groupCount = groups.length;
  const columns = clamp(Number(data.layout.columns) || Math.min(3, groupCount || 3), 1, 3);
  const rows = Math.ceil(groupCount / columns);
  const gapX = 32;
  const gapY = 30;
  const panelW = (CANVAS.main.w - gapX * (columns - 1)) / columns;
  const panelH = (CANVAS.main.h - gapY * (rows - 1)) / rows;
  const placed = [];
  const groupRects = [];
  groups.forEach((key, groupIndex) => {
    const row = Math.floor(groupIndex / columns);
    const col = groupIndex % columns;
    const panelX = col * (panelW + gapX);
    const panelY = row * (panelH + gapY);
    const items = data.nodes.filter((node) => groupKey(node) === key);
    const title = groupTitle(key, data);
    groupRects.push({ id: key, title, x: Math.round(panelX), y: Math.round(panelY), w: Math.round(panelW), h: Math.round(panelH) });
    const innerX = panelX + 34;
    const innerY = panelY + (title ? 68 : 38);
    const innerW = panelW - 68;
    const innerH = panelH - (title ? 96 : 66);
    const nodeGap = 20;
    const nodeH = clamp((innerH - nodeGap * (items.length - 1)) / items.length, 94, 132);
    items.forEach((node, index) => {
      const size = nodeSize(node.kind, "modules", node.emphasis, innerW);
      const h = Math.min(nodeH, size.h);
      placed.push({
        ...node,
        x: Math.round(innerX),
        y: Math.round(innerY + index * (nodeH + nodeGap) + (nodeH - h) / 2),
        w: Math.round(innerW),
        h: Math.round(h),
      });
    });
  });
  return { nodes: placed, groups: groupRects };
}

function computeNodesAndGroups(data) {
  switch (data.layout.type) {
    case "stack":
      return stackLayout(data);
    case "path":
      return pathLayout(data);
    case "radial":
      return radialLayout(data);
    case "matrix":
      return matrixLayout(data);
    case "loop":
      return loopLayout(data);
    case "modules":
    default:
      return modulesLayout(data);
  }
}

function anchorPoint(from, to) {
  const fx = from.x + from.w / 2;
  const fy = from.y + from.h / 2;
  const tx = to.x + to.w / 2;
  const ty = to.y + to.h / 2;
  const dx = tx - fx || 1;
  const dy = ty - fy || 1;
  const scaleX = Math.abs(dx) / (from.w / 2);
  const scaleY = Math.abs(dy) / (from.h / 2);
  if (scaleX > scaleY) {
    return { x: fx + Math.sign(dx) * (from.w / 2 + 8), y: fy + dy / scaleX };
  }
  return { x: fx + dx / scaleY, y: fy + Math.sign(dy) * (from.h / 2 + 8) };
}

function connectorPath(points, kind) {
  if (kind === "curve") {
    const [start, end] = points;
    const dx = end.x - start.x;
    const c1 = { x: start.x + dx * 0.44, y: start.y };
    const c2 = { x: end.x - dx * 0.44, y: end.y };
    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function sampleCurve(start, end, count = 10) {
  const dx = end.x - start.x;
  const c1 = { x: start.x + dx * 0.44, y: start.y };
  const c2 = { x: end.x - dx * 0.44, y: end.y };
  const points = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const mt = 1 - t;
    points.push({
      x: mt ** 3 * start.x + 3 * mt ** 2 * t * c1.x + 3 * mt * t ** 2 * c2.x + t ** 3 * end.x,
      y: mt ** 3 * start.y + 3 * mt ** 2 * t * c1.y + 3 * mt * t ** 2 * c2.y + t ** 3 * end.y,
    });
  }
  return points;
}

function polylineMidpoint(points) {
  if (points.length === 2) {
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  }
  const middle = Math.floor(points.length / 2);
  return { x: (points[middle - 1].x + points[middle].x) / 2, y: (points[middle - 1].y + points[middle].y) / 2 };
}

function defaultConnectors(data) {
  if (data.connectors.length > 0) return data.connectors;
  if (data.layout.type === "path") {
    return data.nodes.slice(0, -1).map((node, index) => ({ from: node.id, to: data.nodes[index + 1].id, kind: "arrow" }));
  }
  if (data.layout.type === "loop") {
    return data.nodes.map((node, index) => ({ from: node.id, to: data.nodes[(index + 1) % data.nodes.length].id, kind: "curve" }));
  }
  if (data.layout.type === "radial") {
    const center = data.nodes.find((node) => node.emphasis) || data.nodes[0];
    return data.nodes.filter((node) => node.id !== center.id).map((node) => ({ from: center.id, to: node.id, kind: "line" }));
  }
  return [];
}

function computeConnectors(data, placedNodes) {
  const byId = new Map(placedNodes.map((node) => [node.id, node]));
  return defaultConnectors(data).flatMap((connector, index) => {
    const from = byId.get(String(connector.from));
    const to = byId.get(String(connector.to));
    if (!from || !to) return [];
    const start = anchorPoint(from, to);
    const end = anchorPoint(to, from);
    const kind = connector.kind || "arrow";
    let points = [start, end];
    if (kind === "elbow") {
      const midX = (start.x + end.x) / 2;
      points = [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
    }
    const samplePoints = kind === "curve" ? sampleCurve(start, end) : points;
    const labelPoint = polylineMidpoint(samplePoints);
    return [{
      id: connector.id || `c${index + 1}`,
      from: from.id,
      to: to.id,
      kind,
      label: connector.label ? String(connector.label) : "",
      dashed: connector.kind === "dashed" || connector.dashed,
      arrow: kind !== "line" && kind !== "dashed",
      d: connectorPath(points, kind),
      points: samplePoints.map((point) => ({ x: Math.round(point.x), y: Math.round(point.y) })),
      labelX: Math.round(labelPoint.x),
      labelY: Math.round(labelPoint.y),
    }];
  });
}

function computeBadges(data, placedNodes) {
  const byId = new Map(placedNodes.map((node) => [node.id, node]));
  const nodeBadges = placedNodes.filter((node) => node.badge).map((node) => ({
    target: node.id,
    text: node.badge,
    tone: node.tone,
  }));
  return [...nodeBadges, ...data.badges].flatMap((badge, index) => {
    const target = byId.get(String(badge.target || ""));
    if (!target) return [];
    const text = String(badge.text || badge.title || "");
    const width = clamp(textLength(text) * 18 + 36, 72, 150);
    return [{
      id: badge.id || `b${index + 1}`,
      text,
      tone: badge.tone || "default",
      x: Math.round(target.x + target.w - width * 0.72),
      y: Math.round(target.y - 18),
      w: width,
      h: 34,
    }];
  });
}

function computeCallouts(data, placedNodes) {
  const byId = new Map(placedNodes.map((node) => [node.id, node]));
  return data.callouts.flatMap((callout, index) => {
    const target = byId.get(String(callout.target || ""));
    if (!target) return [];
    const w = Number(callout.width) || 330;
    const h = Number(callout.height) || 122;
    const rightSpace = CANVAS.main.w - (target.x + target.w);
    const leftSpace = target.x;
    let x = rightSpace >= w + 58 ? target.x + target.w + 44 : target.x - w - 44;
    if (leftSpace < w + 58 && rightSpace < w + 58) {
      x = target.x + target.w / 2 - w / 2;
    }
    const y = clamp(target.y + target.h / 2 - h / 2 + index * 8, 0, CANVAS.main.h - h);
    return [{
      id: callout.id || `callout${index + 1}`,
      target: target.id,
      title: String(callout.title || ""),
      body: String(callout.body || ""),
      x: Math.round(clamp(x, 0, CANVAS.main.w - w)),
      y: Math.round(y),
      w,
      h,
    }];
  });
}

function computeFreeLabels(data) {
  return data.labels.map((label, index) => ({
    id: label.id || `label${index + 1}`,
    text: String(label.text || ""),
    x: Math.round(Number(label.x) || 0),
    y: Math.round(Number(label.y) || 0),
  }));
}

export function layoutLogicGraphic(input) {
  const data = normalizeData(input);
  const base = computeNodesAndGroups(data);
  const connectors = computeConnectors(data, base.nodes);
  const badges = computeBadges(data, base.nodes);
  const callouts = computeCallouts(data, base.nodes);
  const labels = computeFreeLabels(data);
  return { data, nodes: base.nodes, groups: base.groups, connectors, badges, callouts, labels };
}

function renderGroup(group) {
  const title = group.title ? `<div class="lg-group-title">${escapeHtml(group.title)}</div>` : "";
  return `<div class="lg-group" data-lg-component="GraphicGroup" data-lg-group-id="${escapeAttr(group.id)}" style="left:${group.x}px;top:${group.y}px;width:${group.w}px;height:${group.h}px;">${title}</div>`;
}

function renderNode(node, index) {
  const title = escapeHtml(node.title);
  const body = node.body ? `<div class="lg-node-body" data-lg-text-role="node-body" data-lg-max-chars="${NODE_LIMITS.body}">${escapeHtml(node.body)}</div>` : "";
  const indexBadge = node.kind === "index" ? `<div class="lg-node-index">${index + 1}</div>` : "";
  return [
    `<div class="lg-node lg-node--${escapeAttr(node.kind)}"`,
    `data-lg-component="GraphicNode"`,
    `data-lg-node-id="${escapeAttr(node.id)}"`,
    `data-lg-kind="${escapeAttr(node.kind)}"`,
    `data-lg-level="${escapeAttr(node.level)}"`,
    `data-lg-emphasis="${node.emphasis ? "true" : "false"}"`,
    `data-lg-title-length="${textLength(node.title)}"`,
    `data-lg-body-length="${textLength(node.body)}"`,
    `style="left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px;">`,
    indexBadge,
    `<div class="lg-node-title" data-lg-text-role="node-title" data-lg-max-chars="${NODE_LIMITS.title}">${title}</div>`,
    body,
    `</div>`,
  ].join(" ");
}

function renderConnector(connector) {
  const marker = connector.arrow ? ` marker-end="url(#lg-arrow)"` : "";
  const dashed = connector.dashed ? "true" : "false";
  return `<path class="lg-connector-path" data-lg-component="GraphicConnector" data-lg-connector="${escapeAttr(connector.id)}" data-lg-from="${escapeAttr(connector.from)}" data-lg-to="${escapeAttr(connector.to)}" data-lg-kind="${escapeAttr(connector.kind)}" data-lg-dashed="${dashed}" data-lg-points="${escapeAttr(JSON.stringify(connector.points))}" d="${escapeAttr(connector.d)}"${marker}></path>`;
}

function renderConnectorLabel(connector) {
  if (!connector.label) return "";
  const width = clamp(textLength(connector.label) * 20 + 34, 82, 180);
  return `<div class="lg-connector-label" data-lg-component="GraphicLabel" data-lg-text-role="connector-label" data-lg-max-chars="${NODE_LIMITS.connectorLabel}" style="left:${Math.round(connector.labelX - width / 2)}px;top:${Math.round(connector.labelY - 17)}px;width:${width}px;">${escapeHtml(connector.label)}</div>`;
}

function renderBadge(badge) {
  return `<div class="lg-badge" data-lg-component="GraphicBadge" data-lg-tone="${escapeAttr(badge.tone)}" data-lg-text-role="badge" data-lg-max-chars="${NODE_LIMITS.badge}" style="left:${badge.x}px;top:${badge.y}px;width:${badge.w}px;height:${badge.h}px;">${escapeHtml(badge.text)}</div>`;
}

function renderCallout(callout) {
  return [
    `<aside class="lg-callout" data-lg-component="GraphicCallout" data-lg-target="${escapeAttr(callout.target)}" style="left:${callout.x}px;top:${callout.y}px;width:${callout.w}px;height:${callout.h}px;">`,
    callout.title ? `<div class="lg-callout-title" data-lg-text-role="callout-title" data-lg-max-chars="${NODE_LIMITS.calloutTitle}">${escapeHtml(callout.title)}</div>` : "",
    callout.body ? `<div class="lg-callout-body" data-lg-text-role="callout-body" data-lg-max-chars="${NODE_LIMITS.calloutBody}">${escapeHtml(callout.body)}</div>` : "",
    `</aside>`,
  ].join("");
}

function renderLabel(label) {
  return `<div class="lg-label" data-lg-component="GraphicLabel" style="left:${label.x}px;top:${label.y}px;">${escapeHtml(label.text)}</div>`;
}

export function renderLogicGraphic(input, options = {}) {
  const { data, nodes, groups, connectors, badges, callouts, labels } = layoutLogicGraphic(input);
  const title = escapeHtml(data.canvas.title);
  const subtitle = data.canvas.subtitle ? `<div class="lg-subtitle" data-lg-text-role="canvas-subtitle" data-lg-max-chars="${NODE_LIMITS.canvasSubtitle}">${escapeHtml(data.canvas.subtitle)}</div>` : "";
  return [
    `<main class="lg-page" data-logic-graphic="true" data-lg-component="GraphicFrame" data-lg-token-version="${TOKEN_VERSION}" data-lg-theme="${escapeAttr(data.canvas.theme)}" style="width:${CANVAS.width}px;height:${CANVAS.height}px;">`,
    `<header class="lg-header" data-lg-zone="header">`,
    `<div class="lg-title" data-lg-text-role="canvas-title" data-lg-max-chars="${NODE_LIMITS.canvasTitle}">${title}</div>`,
    subtitle,
    `</header>`,
    `<section class="lg-main" data-lg-zone="main" data-lg-layout="${escapeAttr(data.layout.type)}">`,
    `<div class="lg-layer lg-group-layer">${groups.map(renderGroup).join("")}</div>`,
    `<svg class="lg-layer lg-connector-layer" data-lg-component="GraphicConnectorLayer" viewBox="0 0 ${CANVAS.main.w} ${CANVAS.main.h}" width="${CANVAS.main.w}" height="${CANVAS.main.h}" aria-hidden="true">`,
    `<defs><marker id="lg-arrow" viewBox="0 0 16 16" refX="13" refY="8" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M 2 2 L 14 8 L 2 14 z" fill="var(--lg-line)"></path></marker></defs>`,
    connectors.map(renderConnector).join(""),
    `</svg>`,
    `<div class="lg-layer lg-node-layer">${nodes.map(renderNode).join("")}</div>`,
    `<div class="lg-layer lg-label-layer">${connectors.map(renderConnectorLabel).join("")}${labels.map(renderLabel).join("")}</div>`,
    `<div class="lg-layer lg-badge-layer">${badges.map(renderBadge).join("")}</div>`,
    `<div class="lg-layer lg-callout-layer">${callouts.map(renderCallout).join("")}</div>`,
    `</section>`,
    `<footer class="lg-footer" data-lg-zone="footer"><span>${escapeHtml(data.canvas.footer)}</span></footer>`,
    `</main>`,
  ].join("\n");
}

export function renderLogicGraphicDocument(input, options = {}) {
  const cssText = options.cssText || "";
  const data = normalizeData(input);
  const title = escapeHtml(data.canvas.title);
  const body = renderLogicGraphic(data, options);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920, initial-scale=1">
<title>${title}</title>
<style>
${cssText}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}
