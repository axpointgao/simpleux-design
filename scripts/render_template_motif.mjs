#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplateMotif } from "../assets/logic-graphics/motifs/template-motifs.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const examplesDir = path.join(root, "assets", "logic-graphics", "motifs", "examples");
const generatedDir = path.join(root, ".tmp", "logic-graphics", "motifs", "generated");

function parseArgs(argv) {
  const args = { input: null, out: null, examples: false, outDir: generatedDir };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--examples") args.examples = true;
    else if (arg === "--out") args.out = argv[++index];
    else if (arg === "--out-dir") args.outDir = path.resolve(argv[++index]);
    else if (!args.input) args.input = path.resolve(arg);
    else throw new Error(`未知参数：${arg}`);
  }
  return args;
}

function renderFile(input, out) {
  const data = JSON.parse(fs.readFileSync(input, "utf8"));
  const html = renderTemplateMotif(data);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.examples) {
    const files = fs.readdirSync(examplesDir).filter((file) => file.endsWith(".json")).sort();
    files.forEach((file) => {
      const out = renderFile(path.join(examplesDir, file), path.join(args.outDir, file.replace(/\.json$/, ".html")));
      console.log(`✓ ${path.relative(process.cwd(), out)}`);
    });
    return 0;
  }
  if (!args.input) {
    console.error("用法：node scripts/render_template_motif.mjs input.json --out output.html，或 --examples");
    return 1;
  }
  const out = path.resolve(args.out || args.input.replace(/\.json$/, ".html"));
  console.log(`✓ ${path.relative(process.cwd(), renderFile(args.input, out))}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
