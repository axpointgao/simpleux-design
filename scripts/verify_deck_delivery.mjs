#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

function parseArgs(argv) {
  const args = {
    deck: ".",
    customer: false,
    minSlides: 5,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--deck") {
      args.deck = argv[++i];
    } else if (arg === "--customer") {
      args.customer = true;
    } else if (arg === "--min-slides") {
      args.minSlides = Number(argv[++i]);
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      fail([`未知参数: ${arg}`]);
    }
  }

  return args;
}

function printHelp() {
  console.log(`用法:
  node scripts/verify_deck_delivery.mjs --deck <deck-dir> [--customer] [--min-slides 5]

检查多文件 deck 的交付门禁：
  - index.html / DECK_MANIFEST
  - STYLE_CONFIRMATION.md
  - SimpleUX publisher 资产
  - 固定封底页
  - 普通内页 SimpleUX 保密署名
  - PUBLISHER_EXCEPTIONS.md 署名例外记录`);
}

function fail(issues) {
  console.error("\n❌ deck 交付门禁失败");
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function exists(file) {
  return fs.existsSync(file);
}

function parseManifest(indexHtml) {
  const match = indexHtml.match(/window\.DECK_MANIFEST\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) return null;

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`manifest = ${match[1]}`, sandbox, { timeout: 1000 });
  return Array.isArray(sandbox.manifest) ? sandbox.manifest : null;
}

function hasStyleConfirmation(deckDir) {
  const file = path.join(deckDir, "STYLE_CONFIRMATION.md");
  if (!exists(file)) return false;

  const text = read(file);
  return (
    /^\s*-?\s*confirmed\s*:\s*true\s*$/im.test(text) ||
    /^\s*-?\s*bypass_confirmed\s*:\s*true\s*$/im.test(text)
  );
}

function readExceptions(deckDir) {
  const file = path.join(deckDir, "PUBLISHER_EXCEPTIONS.md");
  if (!exists(file)) return "";
  return read(file);
}

function isTemplateOrNonOrdinarySlide(item) {
  const file = String(item.file || "").toLowerCase();
  const label = String(item.label || "").toLowerCase();
  return (
    /(^|\/)\d*[-_]*(cover|toc|agenda|section|chapter|back-cover|back_cover|thanks|封底)\.html$/.test(file) ||
    /(封面|目录|章节|封底|cover|toc|agenda|section|chapter|thanks)/i.test(label)
  );
}

function hasPublisherSignature(html) {
  return (
    /publisher-confidential/i.test(html) ||
    /CONFIDENTIAL\s*&?\s*PROPRIETARY/i.test(html) ||
    /SimpleUX\s*\|\s*CONFIDENTIAL/i.test(html)
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const deckDir = path.resolve(args.deck);
  const issues = [];

  const indexPath = path.join(deckDir, "index.html");
  if (!exists(indexPath)) {
    fail([`缺少 index.html: ${indexPath}`]);
  }

  let manifest = null;
  try {
    manifest = parseManifest(read(indexPath));
  } catch (error) {
    issues.push(`DECK_MANIFEST 解析失败: ${error.message}`);
  }

  if (!manifest || manifest.length === 0) {
    issues.push("index.html 缺少有效的 window.DECK_MANIFEST");
  }

  if (manifest && manifest.length >= args.minSlides && !hasStyleConfirmation(deckDir)) {
    issues.push(`正文达到 ${args.minSlides} 页以上，但缺少 STYLE_CONFIRMATION.md 或 confirmed: true / bypass_confirmed: true`);
  }

  if (args.customer) {
    const publisherDir = path.join(deckDir, "shared", "publisher");
    for (const asset of ["simpleux-dark.png", "simpleux-light.png", "SimpleUX.mp4", "FullSpeed&SimpleUX.png"]) {
      if (!exists(path.join(publisherDir, asset))) {
        issues.push(`客户交付 deck 缺少 publisher 资产: shared/publisher/${asset}`);
      }
    }

    if (manifest && manifest.length > 0) {
      const last = manifest[manifest.length - 1];
      const lastFile = String(last.file || "");
      const lastPath = path.join(deckDir, lastFile);
      if (!/back[-_]?cover|封底/i.test(lastFile + " " + String(last.label || ""))) {
        issues.push("DECK_MANIFEST 最后一页不是固定封底页");
      }
      if (!exists(lastPath)) {
        issues.push(`封底页文件不存在: ${lastFile}`);
      } else {
        const backCover = read(lastPath);
        if (!/back-cover/i.test(backCover) || !/FullSpeed&SimpleUX|SimpleUX\.mp4/i.test(backCover)) {
          issues.push(`封底页不像固定 SimpleUX 封底模板: ${lastFile}`);
        }
      }

      const exceptions = readExceptions(deckDir);
      for (const item of manifest) {
        if (isTemplateOrNonOrdinarySlide(item)) continue;
        const file = String(item.file || "");
        const slidePath = path.join(deckDir, file);
        if (!exists(slidePath)) {
          issues.push(`DECK_MANIFEST 中的页面不存在: ${file}`);
          continue;
        }
        const html = read(slidePath);
        if (!hasPublisherSignature(html) && !exceptions.includes(file)) {
          issues.push(`普通内页缺少 SimpleUX 保密署名，且未写入 PUBLISHER_EXCEPTIONS.md: ${file}`);
        }
      }
    }
  }

  if (issues.length) fail(issues);

  ok(`deck 交付门禁通过: ${deckDir}`);
  if (manifest) ok(`DECK_MANIFEST 共 ${manifest.length} 页`);
}

main();
