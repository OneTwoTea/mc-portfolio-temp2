/**
 * ═══════════════════════════════════════════════════════════
 *  BUILD.MJS — Script build production
 *  Xóa dist/, ghép config + template → HTML, chạy Tailwind CLI
 * ═══════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// ─── MÀU TERMINAL ────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

function log(msg) { console.log(`${c.cyan}[build]${c.reset} ${msg}`); }
function warn(msg) { console.log(`${c.yellow}⚠ [cảnh báo]${c.reset} ${msg}`); }
function error(msg) { console.log(`${c.red}✗ [lỗi]${c.reset} ${msg}`); }
function success(msg) { console.log(`${c.green}✓${c.reset} ${msg}`); }

/** Import ES module kèm ?t=Date.now() để luôn lấy bản mới nhất (dùng khi dev tự build lại) */
function freshImport(...parts) {
  return import(`${pathToFileURL(join(ROOT, ...parts)).href}?t=${Date.now()}`);
}

// ─── BƯỚC 1: XÓA DIST ──────────────────────────────────
export function cleanDist() {
  const dist = join(ROOT, "dist");
  if (existsSync(dist)) {
    // Windows đôi khi khóa file tạm thời (trình duyệt/antivirus) → thử lại vài lần
    rmSync(dist, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
  }
  mkdirSync(dist, { recursive: true });
  log("Đã xóa thư mục dist/");
}

// ─── BƯỚC 2: CHÉP TÀI NGUYÊN ────────────────────────────
export function copyAssets() {
  const dist = join(ROOT, "dist");

  // Chép public/ → dist/public/
  const publicDir = join(ROOT, "public");
  if (existsSync(publicDir)) {
    cpSync(publicDir, join(dist, "public"), { recursive: true });
    success("Đã chép public/ → dist/public/");
  }

  // Chép main.js → dist/assets/js/
  const jsDir = join(dist, "assets", "js");
  mkdirSync(jsDir, { recursive: true });
  const mainJs = join(ROOT, "src", "js", "main.js");
  if (existsSync(mainJs)) {
    cpSync(mainJs, join(jsDir, "main.js"));
    success("Đã chép src/js/main.js → dist/assets/js/main.js");
  }

  // Tạo .nojekyll
  writeFileSync(join(dist, ".nojekyll"), "");

  // Tạo thư mục CSS
  mkdirSync(join(dist, "assets", "css"), { recursive: true });
}

// ─── BƯỚC 3: BUILD HTML ─────────────────────────────────
export async function buildHtml() {
  const dist = join(ROOT, "dist");

  // Import config + templates (cache-bust)
  const { SITE_CONFIG } = await freshImport("site.config.js");
  const { renderPage } = await freshImport("src", "templates.js");

  // Đọc file khung
  const template = readFileSync(join(ROOT, "index.html"), "utf-8");

  // Render
  const { html, missing } = renderPage(template, SITE_CONFIG);

  // Ghi ra dist/index.html
  writeFileSync(join(dist, "index.html"), html, "utf-8");
  success("Đã tạo dist/index.html");

  return { html, missing, config: SITE_CONFIG };
}

// ─── BƯỚC 4: BUILD CSS (TAILWIND CLI) ────────────────────
export function buildCss({ minify = true } = {}) {
  const require = createRequire(import.meta.url);

  // Tìm file chạy của @tailwindcss/cli qua package.json
  let cliBin;
  try {
    const cliPkgPath = require.resolve("@tailwindcss/cli/package.json");
    const cliPkg = JSON.parse(readFileSync(cliPkgPath, "utf-8"));
    const bin = typeof cliPkg.bin === "string" ? cliPkg.bin : cliPkg.bin?.tailwindcss || Object.values(cliPkg.bin || {})[0];
    cliBin = join(dirname(cliPkgPath), bin);
  } catch {
    error("Không tìm thấy @tailwindcss/cli — hãy chạy `npm install` trước.");
    process.exitCode = 1;
    return false;
  }

  const args = ["-i", join(ROOT, "src", "input.css"), "-o", join(ROOT, "dist", "assets", "css", "style.css")];
  if (minify) args.push("--minify");

  log(`Chạy Tailwind CLI${minify ? " (minify)" : ""}...`);
  const result = spawnSync(process.execPath, [cliBin, ...args], { cwd: ROOT, stdio: "pipe", encoding: "utf-8" });

  if (result.status !== 0) {
    error("Tailwind CSS build thất bại:");
    if (result.error) console.log(result.error.message);
    if (result.stderr) console.log(result.stderr);
    process.exitCode = 1;
    return false;
  }

  success("Đã tạo dist/assets/css/style.css");
  return true;
}

// ─── BƯỚC 5: KIỂM TRA ──────────────────────────────────
function checkResults(html, missing, config) {
  let hasError = false;

  // Kiểm tra file public/ được tham chiếu nhưng không tồn tại
  const publicRefs = html.match(/public\/[^\s"'<>)]+/g) || [];
  const missingFiles = [];
  for (const ref of [...new Set(publicRefs)]) {
    const fullPath = join(ROOT, ref);
    if (!existsSync(fullPath)) {
      missingFiles.push(ref);
    }
  }
  if (missingFiles.length > 0) {
    console.log("");
    warn(`${missingFiles.length} file được tham chiếu nhưng không tồn tại:`);
    missingFiles.forEach((f) => console.log(`  ${c.dim}→ ${f}${c.reset}`));
  }

  // Kiểm tra placeholder còn sót — quét cả config vì link placeholder đã được đổi thành #contact trong HTML
  // (bắt đầu bằng chữ cái để không nhầm với class Tailwind như z-[60])
  const placeholders = (html + JSON.stringify(config)).match(/\[[A-Z][A-Z0-9_]*\]/g) || [];
  const uniquePlaceholders = [...new Set(placeholders)];
  if (uniquePlaceholders.length > 0) {
    console.log("");
    warn(`${uniquePlaceholders.length} placeholder cần thay thế:`);
    uniquePlaceholders.forEach((p) => console.log(`  ${c.dim}→ ${p}${c.reset}`));
  }

  // Kiểm tra key template thiếu
  if (missing.length > 0) {
    console.log("");
    error(`${missing.length} key template không tìm thấy trong config:`);
    missing.forEach((m) => console.log(`  ${c.red}→ ${m}${c.reset}`));
    hasError = true;
  }

  return hasError;
}

// ─── MAIN BUILD ─────────────────────────────────────────
/**
 * Build toàn bộ. Trả về true nếu không có lỗi.
 * @param {{ minify?: boolean, htmlOnly?: boolean }} options
 */
export async function build({ minify = true, htmlOnly = false } = {}) {
  console.log("");
  log(`${c.bold}Bắt đầu build...${c.reset}`);
  const start = Date.now();

  // 1. Xóa dist  2. Chép tài nguyên
  cleanDist();
  copyAssets();

  // 3. Ghép HTML
  let result;
  try {
    result = await buildHtml();
  } catch (err) {
    error(`Không render được HTML: ${err.message}`);
    process.exitCode = 1;
    return false;
  }

  // 4. Build CSS (trừ khi --html-only)
  let cssOk = true;
  if (htmlOnly) log("Bỏ qua CSS (--html-only)");
  else cssOk = buildCss({ minify });

  // 5. Kiểm tra
  const hasError = checkResults(result.html, result.missing, result.config) || !cssOk;

  const elapsed = Date.now() - start;
  console.log("");
  if (hasError) {
    error(`Build hoàn tất nhưng có lỗi (${elapsed}ms)`);
    process.exitCode = 1;
  } else {
    success(`${c.bold}Build thành công!${c.reset} (${elapsed}ms)`);
  }
  console.log("");
  return !hasError;
}

// Chỉ tự chạy khi gọi trực tiếp `node scripts/build.mjs` (không chạy khi dev.mjs import)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build({
    minify: !process.argv.includes("--no-minify"),
    htmlOnly: process.argv.includes("--html-only"),
  });
}
