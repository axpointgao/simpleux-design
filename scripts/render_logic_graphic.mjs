#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderLogicGraphicDocument, renderLogicGraphic } from "../assets/logic-graphics/components.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, "..");
const assetRoot = path.join(skillRoot, "assets", "logic-graphics");
const examplesDir = path.join(assetRoot, "examples");
const tokensPath = path.join(assetRoot, "tokens.css");

function usage() {
  console.log(`Usage:
  node scripts/render_logic_graphic.mjs input.json --out output.html
  node scripts/render_logic_graphic.mjs input.json --fragment --out fragment.html
  node scripts/render_logic_graphic.mjs --examples --out-dir assets/logic-graphics/generated

Options:
  --out <file>       输出 HTML 文件
  --out-dir <dir>    批量输出目录
  --examples         批量渲染内置 examples/*.json
  --fragment         只输出可嵌入片段，不输出完整 HTML 文档
`);
}

function parseArgs(argv) {
  const args = {
    input: null,
    out: null,
    outDir: null,
    examples: false,
    fragment: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--examples") {
      args.examples = true;
    } else if (arg === "--fragment") {
      args.fragment = true;
    } else if (arg === "--out") {
      args.out = argv[++index];
    } else if (arg === "--out-dir") {
      args.outDir = argv[++index];
    } else if (!args.input) {
      args.input = arg;
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }
  return args;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function renderFile(inputPath, outputPath, options = {}) {
  const data = readJson(inputPath);
  const cssText = fs.readFileSync(tokensPath, "utf8");
  const html = options.fragment ? renderLogicGraphic(data, { cssText }) : renderLogicGraphicDocument(data, { cssText });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");
  return outputPath;
}

function renderExamples(outDir) {
  const jsonFiles = fs.readdirSync(examplesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (jsonFiles.length === 0) {
    throw new Error(`未找到示例 JSON：${examplesDir}`);
  }
  return jsonFiles.map((file) => {
    const inputPath = path.join(examplesDir, file);
    const outputPath = path.join(outDir, file.replace(/\.json$/i, ".html"));
    return renderFile(inputPath, outputPath);
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return 0;
  }

  if (args.examples) {
    const outDir = path.resolve(args.outDir || path.join(assetRoot, "generated"));
    const outputs = renderExamples(outDir);
    outputs.forEach((file) => console.log(`✓ ${path.relative(process.cwd(), file)}`));
    return 0;
  }

  if (!args.input) {
    usage();
    return 1;
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.out || inputPath.replace(/\.json$/i, ".html"));
  const output = renderFile(inputPath, outputPath, { fragment: args.fragment });
  console.log(`✓ ${path.relative(process.cwd(), output)}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
