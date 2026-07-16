#!/usr/bin/env node
/**
 * update-law-registry.mjs — 同步「法規登記系統.html」裡每部法規的官方修正日期
 *
 * 用法（GitHub Actions 內，跟 update-laws.mjs 用同一批下載的全庫檔案）：
 *   node scripts/update-law-registry.mjs ChLaw.json ChOrder.json
 *
 * 行為：
 *   1. 從 法規登記系統.html 的 `const DATA = {...}` 取出目前所有法規的 {name, pcode}
 *      （法規登記系統橫跨「法律」與「命令」兩個層級，所以兩份全庫都要查）
 *   2. 以 PCode 完全比對（比法規名稱更準，不受簡繁/用字差異影響）
 *   3. 輸出 law-registry-sync.json：{updated, records:{PCODE:{mod, name, abolished}}}
 *      法規登記系統.html 網頁載入時會 fetch 這個檔案，疊加最新修正日期，
 *      不影響管理者在 localStorage 裡自行編輯的合規狀態、產業別等欄位。
 *
 * 只寫 law-registry-sync.json，不碰 法規登記系統.html 本身或 localStorage。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [chlawPath, chorderPath] = process.argv.slice(2);
if (!chlawPath || !chorderPath) {
  console.error("用法: node scripts/update-law-registry.mjs <ChLaw.json> <ChOrder.json>");
  process.exit(1);
}

function loadDb(path) {
  const text = readFileSync(path, "utf8").replace(/^﻿/, "");
  const raw = JSON.parse(text);
  return Array.isArray(raw) ? raw : (raw.Laws || raw.laws || []);
}

const combined = [...loadDb(chlawPath), ...loadDb(chorderPath)];
console.log(`📚 全庫載入 ${combined.length} 部法規（法律 + 命令）`);

const byPcode = new Map();
for (const law of combined) {
  const url = law.LawURL || "";
  const m = url.match(/[?&]pcode=([^&]+)/i);
  if (m) byPcode.set(decodeURIComponent(m[1]).toUpperCase(), law);
}

// ── 從 法規登記系統.html 取出目前登記的 {name, pcode} 清單 ──
const htmlPath = fileURLToPath(new URL("../法規登記系統.html", import.meta.url));
const html = readFileSync(htmlPath, "utf8");
const m = html.match(/const DATA = (\{[\s\S]*?\n\};)/);
if (!m) { console.error("❌ 在 法規登記系統.html 找不到 DATA 物件"); process.exit(1); }
const DATA = new Function(`return ${m[1].slice(0, -1)};`)();

const rows = [];
for (const cat of Object.values(DATA)) rows.push(...(cat.rows || []));
console.log(`📋 法規登記系統目前登記 ${rows.length} 筆（含重複分類）`);

const records = {};
let updated = 0, unmatched = new Set();
for (const r of rows) {
  if (!r.p) continue;
  const pcode = r.p.toUpperCase();
  if (records[pcode]) continue; // 已比對過
  const hit = byPcode.get(pcode);
  if (!hit) { unmatched.add(`${r.n}（${r.p}）`); continue; }
  const modRaw = hit.LawModifiedDate || "";
  let mod = "";
  if (/^\d{8}$/.test(modRaw)) {
    mod = `${(+modRaw.slice(0, 4)) - 1911}/${modRaw.slice(4, 6)}/${modRaw.slice(6, 8)}`;
  }
  records[pcode] = {
    name: hit.LawName || r.n,
    mod,
    abolished: String(hit.LawAbandonNote || "").trim() !== "",
  };
  updated++;
}

const output = {
  updated: new Date().toISOString(),
  source: "全國法規資料庫（law.moj.gov.tw）",
  records,
};
const outPath = fileURLToPath(new URL("../law-registry-sync.json", import.meta.url));
writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(`✅ 比對到 ${updated} 部法規的最新修正日期，寫入 law-registry-sync.json`);
if (unmatched.size) {
  console.log(`⚠️  以下 ${unmatched.size} 筆 PCode 在全庫中查無資料（可能已廢止或 PCode 有誤）：`);
  unmatched.forEach(n => console.log("   - " + n));
}
