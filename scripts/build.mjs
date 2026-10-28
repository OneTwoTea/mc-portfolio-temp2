/* ============================================================================
 *  BUILD.MJS — ghép site.config.js + index.html → dist/ (Node thuần)
 *  Dùng:  npm run build              (build đầy đủ, CSS đã nén)
 *         node scripts/build.mjs --html-only   (chỉ dựng lại dist/index.html)
 * ========================================================================== */
import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DIST = join(ROOT, "dist");
const require = createRequire(import.meta.url);

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36), dim: paint(2), bold: paint(1) };

const PLACEHOLDER_RE = /\[[A-Z0-9_]+\]/g;

/** Chép public/ → dist/public/, main.js → dist/assets/js/, tạo .nojekyll */
export async function copyAssets() {
  await mkdir(join(DIST, "assets", "js"), { recursive: true });
  const pub = join(ROOT, "public");
  if (existsSync(pub)) {
    await cp(pub, join(DIST, "public"), { recursive: true, filter: (src) => !src.endsWith(".gitkeep") });
  }
  await copyFile(join(ROOT, "src", "js", "main.js"), join(DIST, "assets", "js", "main.js"));
  await writeFile(join(DIST, ".nojekyll"), "");
}

/** Ghép dữ liệu vào khung → dist/index.html */
export async function buildHtml() {
  const t = Date.now(); // ?t= để dev server luôn đọc bản mới nhất
  const { SITE_CONFIG } = await import(`${pathToFileURL(join(ROOT, "site.config.js")).href}?t=${t}`);
  const { renderPage } = await import(`${pathToFileURL(join(ROOT, "src", "templates.js")).href}?t=${t}`);
  const template = await readFile(join(ROOT, "index.html"), "utf8");
  const exists = (p) => existsSync(join(ROOT, decodeURIComponent(p)));
  const result = renderPage(template, SITE_CONFIG, { exists });
  await mkdir(DIST, { recursive: true });
  await writeFile(join(DIST, "index.html"), result.html);
  return { ...result, config: SITE_CONFIG };
}

/** Gọi Tailwind CLI → dist/assets/css/style.css */
export function buildCss({ minify = true } = {}) {
  const pkgPath = require.resolve("@tailwindcss/cli/package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const binRel = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.tailwindcss ?? Object.values(pkg.bin)[0];
  const out = join(DIST, "assets", "css", "style.css");
  const args = [join(dirname(pkgPath), binRel), "-i", join(ROOT, "src", "input.css"), "-o", out];
  if (minify) args.push("--minify");
  const res = spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8" });
  if (res.status !== 0) throw new Error(`Tailwind lỗi:\n${res.stderr || res.stdout || res.error}`);
  return out;
}

/** Liệt kê placeholder còn sót trong config, kèm đường dẫn key */
function findPlaceholders(obj, path = "", out = []) {
  if (typeof obj === "string") {
    const hits = obj.match(PLACEHOLDER_RE);
    if (hits) out.push({ path, hits: [...new Set(hits)] });
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => findPlaceholders(v, `${path}[${i}]`, out));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) findPlaceholders(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/** Gom file thiếu theo thư mục cho dễ đọc */
function groupByFolder(files) {
  const groups = new Map();
  for (const f of files.sort()) {
    const dir = f.slice(0, f.lastIndexOf("/"));
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(f.slice(dir.length + 1));
  }
  return groups;
}

function report({ html, missing, missingAssets, config }, cssPath) {
  const kb = (p) => `${(statSync(p).size / 1024).toFixed(1)} KB`;
  console.log(`${c.green("✔")} HTML  ${c.dim("dist/index.html")} ${c.dim(kb(join(DIST, "index.html")))}`);
  if (cssPath) console.log(`${c.green("✔")} CSS   ${c.dim("dist/assets/css/style.css")} ${c.dim(kb(cssPath))}`);

  // File public/... được tham chiếu trong HTML nhưng không tồn tại
  const refs = new Set(html.match(/public\/[\w\-./%]+\.[a-z0-9]+/gi) ?? []);
  const absent = new Set(missingAssets);
  for (const r of refs) if (!existsSync(join(ROOT, decodeURIComponent(r)))) absent.add(r);
  if (absent.size) {
    console.log(`\n${c.yellow("⚠")} ${c.bold(`${absent.size} file ảnh/video chưa có`)} ${c.dim("(trang đang hiện khung thay thế)")}`);
    for (const [dir, names] of groupByFolder([...absent])) {
      console.log(`  ${c.cyan(dir + "/")}  ${names.join(", ")}`);
    }
  }

  const ph = findPlaceholders(config);
  if (ph.length) {
    const unique = new Set(ph.flatMap((p) => p.hits));
    console.log(`\n${c.yellow("⚠")} ${c.bold(`${unique.size} placeholder chưa điền`)} ${c.dim(`(ở ${ph.length} chỗ trong site.config.js)`)}`);
    for (const p of ph) console.log(`  ${c.dim(p.path.padEnd(42))} ${p.hits.join(" ")}`);
  }

  if (missing.length) {
    console.log(`\n${c.red("✖")} ${c.bold("Key trong index.html không có trong config / templates.js:")}`);
    for (const k of missing) console.log(`  ${c.red(k)}`);
    process.exitCode = 1;
    return false;
  }
  return true;
}

/** Build đầy đủ. Trả về true nếu không có lỗi key template. */
export async function build({ minify = true, htmlOnly = false } = {}) {
  const started = Date.now();
  if (!htmlOnly) {
    await rm(DIST, { recursive: true, force: true });
    await copyAssets();
  }
  const result = await buildHtml();
  const cssPath = htmlOnly ? null : buildCss({ minify });
  const ok = report(result, cssPath);
  console.log(`\n${ok ? c.green("Build xong") : c.red("Build có lỗi")} ${c.dim(`sau ${Date.now() - started} ms`)}`);
  return ok;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  build({ htmlOnly: process.argv.includes("--html-only") }).catch((err) => {
    console.error(c.red(`✖ ${err.message}`));
    process.exitCode = 1;
  });
}
