#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const EXPECTED_TOKEN_VERSION = "logic-graphics-v1";

function usage() {
  console.log(`Usage:
  node scripts/verify_logic_graphics.mjs path/to/page.html
  node scripts/verify_logic_graphics.mjs path/to/page.html --json

检查对象：
  - 当前页面内所有 [data-logic-graphic] 区域
  - iframe 内所有 [data-logic-graphic] 区域
`);
}

function parseArgs(argv) {
  const args = { input: null, json: false, wait: 800 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--wait") args.wait = Number(argv[++index]) || 800;
    else if (!args.input) args.input = arg;
    else throw new Error(`未知参数：${arg}`);
  }
  return args;
}

function evaluateLogicGraphics() {
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const EXPECTED_TOKEN_VERSION = "logic-graphics-v1";
  const EPS = 1.5;
  const MIN_NODE_GAP = 8;

  const textLength = (value) => Array.from(String(value || "").trim()).length;

  const rectOf = (element, baseRect) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left - baseRect.left,
      y: rect.top - baseRect.top,
      w: rect.width,
      h: rect.height,
      right: rect.right - baseRect.left,
      bottom: rect.bottom - baseRect.top,
    };
  };

  const intersects = (a, b, pad = 0) => (
    a.x < b.right + pad &&
    a.right > b.x - pad &&
    a.y < b.bottom + pad &&
    a.bottom > b.y - pad
  );

  const overlapArea = (a, b) => {
    const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
    const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
    return w * h;
  };

  const segmentIntersectsRect = (p1, p2, rect) => {
    const expanded = {
      x: rect.x - 3,
      y: rect.y - 3,
      right: rect.right + 3,
      bottom: rect.bottom + 3,
    };
    const pointInside = (p) => p.x >= expanded.x && p.x <= expanded.right && p.y >= expanded.y && p.y <= expanded.bottom;
    if (pointInside(p1) || pointInside(p2)) return true;

    const lines = [
      [{ x: expanded.x, y: expanded.y }, { x: expanded.right, y: expanded.y }],
      [{ x: expanded.right, y: expanded.y }, { x: expanded.right, y: expanded.bottom }],
      [{ x: expanded.right, y: expanded.bottom }, { x: expanded.x, y: expanded.bottom }],
      [{ x: expanded.x, y: expanded.bottom }, { x: expanded.x, y: expanded.y }],
    ];

    const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    const segmentCross = (a, b, c, d) => ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
    return lines.some(([a, b]) => segmentCross(p1, p2, a, b));
  };

  const readNumber = (value) => {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  };

  const results = [];

  document.querySelectorAll("[data-logic-graphic]").forEach((root, index) => {
    const issues = [];
    const rootRect = root.getBoundingClientRect();
    const rootBox = rectOf(root, rootRect);
    const selectorLabel = root.id ? `#${root.id}` : `[data-logic-graphic] #${index + 1}`;

    if (Math.abs(rootRect.width - CANVAS_WIDTH) > EPS || Math.abs(rootRect.height - CANVAS_HEIGHT) > EPS) {
      issues.push(`画布尺寸必须是 1920×1080，当前为 ${Math.round(rootRect.width)}×${Math.round(rootRect.height)}。`);
    }

    if (root.getAttribute("data-lg-token-version") !== EXPECTED_TOKEN_VERSION) {
      issues.push(`根节点缺少 data-lg-token-version="${EXPECTED_TOKEN_VERSION}"。`);
    }

    const header = root.querySelector('[data-lg-zone="header"]');
    const main = root.querySelector('[data-lg-zone="main"]');
    const footer = root.querySelector('[data-lg-zone="footer"]');
    if (!header || !main || !footer) {
      issues.push("GraphicFrame 必须包含 header、main 和 footer 三个 zone。");
    }

    const headerBox = header ? rectOf(header, rootRect) : null;
    const mainBox = main ? rectOf(main, rootRect) : null;
    const footerBox = footer ? rectOf(footer, rootRect) : null;

    const checkInside = (label, box, container) => {
      if (!box || !container) return;
      if (box.x < container.x - EPS || box.y < container.y - EPS || box.right > container.right + EPS || box.bottom > container.bottom + EPS) {
        issues.push(`${label} 越过允许区域。`);
      }
    };

    const allComponents = Array.from(root.querySelectorAll("[data-lg-component]"));
    allComponents.forEach((element) => {
      if (element === root) return;
      const box = rectOf(element, rootRect);
      checkInside(element.getAttribute("data-lg-component") || element.className || "组件", box, {
        x: 0,
        y: 0,
        right: CANVAS_WIDTH,
        bottom: CANVAS_HEIGHT,
      });
      if (main && main.contains(element) && !element.matches("svg, path, defs, marker")) {
        checkInside(element.getAttribute("data-lg-component") || "主图形组件", box, mainBox);
      }
      if (headerBox && mainBox && intersects(box, headerBox)) {
        issues.push(`${element.getAttribute("data-lg-component") || "组件"} 压住标题区。`);
      }
      if (footerBox && mainBox && intersects(box, footerBox)) {
        issues.push(`${element.getAttribute("data-lg-component") || "组件"} 压住页脚区。`);
      }
    });

    const textElements = Array.from(root.querySelectorAll("[data-lg-max-chars]"));
    textElements.forEach((element) => {
      const max = Number(element.getAttribute("data-lg-max-chars"));
      const length = textLength(element.textContent);
      if (length > max) {
        const role = element.getAttribute("data-lg-text-role") || "文本";
        issues.push(`${role} 文本过长：${length}/${max}。`);
      }
    });

    const nodes = Array.from(root.querySelectorAll('[data-lg-component="GraphicNode"]')).map((element) => ({
      element,
      id: element.getAttribute("data-lg-node-id") || "",
      emphasis: element.getAttribute("data-lg-emphasis") === "true",
      box: rectOf(element, rootRect),
    }));

    const emphasisCount = nodes.filter((node) => node.emphasis).length;
    if (emphasisCount > 1) {
      issues.push(`主焦点过多：当前 ${emphasisCount} 个，最多 1 个。`);
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const area = overlapArea(a.box, b.box);
        if (area > 4) {
          issues.push(`节点重叠：${a.id || i + 1} 与 ${b.id || j + 1}。`);
        } else if (intersects(a.box, b.box, MIN_NODE_GAP)) {
          issues.push(`节点距离过近：${a.id || i + 1} 与 ${b.id || j + 1} 小于 ${MIN_NODE_GAP}px。`);
        }
      }
    }

    const nodeTitles = Array.from(root.querySelectorAll(".lg-node-title"));
    const titleFontSizes = new Set(nodeTitles.map((element) => getComputedStyle(element).fontSize));
    if (titleFontSizes.size > 1) {
      issues.push(`同层级节点标题字号不一致：${Array.from(titleFontSizes).join(", ")}。`);
    }

    const nodeBodies = Array.from(root.querySelectorAll(".lg-node-body"));
    const bodyFontSizes = new Set(nodeBodies.map((element) => getComputedStyle(element).fontSize));
    if (bodyFontSizes.size > 1) {
      issues.push(`同层级节点正文字号不一致：${Array.from(bodyFontSizes).join(", ")}。`);
    }

    const connectors = Array.from(root.querySelectorAll('[data-lg-component="GraphicConnector"]'));
    const strokeWidths = new Set(connectors.map((element) => getComputedStyle(element).strokeWidth || element.getAttribute("stroke-width") || ""));
    if (strokeWidths.size > 1) {
      issues.push(`连接线线宽不一致：${Array.from(strokeWidths).join(", ")}。`);
    }

    const labels = Array.from(root.querySelectorAll(".lg-connector-label")).map((element) => ({
      element,
      box: rectOf(element, rootRect),
    }));
    labels.forEach((label, labelIndex) => {
      nodes.forEach((node) => {
        if (overlapArea(label.box, node.box) > 2) {
          issues.push(`连接线标签压住节点：标签 ${labelIndex + 1} 与 ${node.id}。`);
        }
      });
    });

    connectors.forEach((connector, connectorIndex) => {
      let points = [];
      try {
        points = JSON.parse(connector.getAttribute("data-lg-points") || "[]");
      } catch (_) {
        issues.push(`连接线 ${connectorIndex + 1} 的 data-lg-points 不是合法 JSON。`);
      }
      const from = connector.getAttribute("data-lg-from") || "";
      const to = connector.getAttribute("data-lg-to") || "";
      for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
        const p1 = { x: readNumber(points[pointIndex].x) + (mainBox?.x || 0), y: readNumber(points[pointIndex].y) + (mainBox?.y || 0) };
        const p2 = { x: readNumber(points[pointIndex + 1].x) + (mainBox?.x || 0), y: readNumber(points[pointIndex + 1].y) + (mainBox?.y || 0) };
        nodes.forEach((node) => {
          if (node.id === from || node.id === to) return;
          if (segmentIntersectsRect(p1, p2, node.box)) {
            issues.push(`连接线穿过非目标节点：${from} → ${to} 压住 ${node.id}。`);
          }
        });
      }
    });

    results.push({
      selector: selectorLabel,
      ok: issues.length === 0,
      issues,
    });
  });

  return results;
}

async function collectFrameResults(page) {
  const results = [];
  for (const frame of page.frames()) {
    const frameResults = await frame.evaluate(evaluateLogicGraphics).catch((error) => [{
      selector: "frame",
      ok: false,
      issues: [`无法检查 frame：${error.message}`],
    }]);
    const url = frame.url();
    frameResults.forEach((result) => {
      results.push({ ...result, frameUrl: url });
    });
  }
  return results.filter((result) => result.selector);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return 0;
  }
  if (!args.input) {
    usage();
    return 1;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (error) {
    console.error("ERROR: playwright 未安装。请在 simpleux-design/ 下运行 npm install && npm run install-browsers。");
    return 1;
  }

  const inputPath = path.resolve(args.input);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(args.wait);
  const results = await collectFrameResults(page);
  await browser.close();

  if (pageErrors.length > 0) {
    results.push({
      selector: "page",
      frameUrl: pathToFileURL(inputPath).href,
      ok: false,
      issues: pageErrors.map((error) => `页面脚本错误：${error}`),
    });
  }

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log("\n逻辑图形质检");
    console.log("=".repeat(50));
    if (results.length === 0) {
      console.log("未发现 data-logic-graphic 区域。");
    }
    results.forEach((result) => {
      const name = result.frameUrl ? `${result.selector} (${result.frameUrl})` : result.selector;
      if (result.ok) {
        console.log(`✓ ${name}`);
      } else {
        console.log(`✗ ${name}`);
        result.issues.forEach((issue) => console.log(`  - ${issue}`));
      }
    });
  }

  const failed = results.some((result) => !result.ok) || results.length === 0;
  return failed ? 1 : 0;
}

main().then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
