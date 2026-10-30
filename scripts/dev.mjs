/**
 * ═══════════════════════════════════════════════════════════
 *  DEV.MJS — Server phát triển
 *  Phục vụ dist/ + tự build lại khi thay đổi file
 * ═══════════════════════════════════════════════════════════
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, watch, statSync } from "node:fs";
import { join, extname, resolve, dirname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { networkInterfaces } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// ─── FLAGS ──────────────────────────────────────────────
const args = process.argv.slice(2);
const noWatch = args.includes("--no-watch");
const baseArg = args.find((a) => a.startsWith("--base="));
// VD: --base=/mc-portfolio/ → giả lập GitHub Pages dạng project (https://user.github.io/mc-portfolio/)
const baseName = baseArg ? baseArg.split("=")[1].replace(/^\/+|\/+$/g, "") : "";
const basePath = baseName ? "/" + baseName : "";
const PORT = parseInt(process.env.PORT || "5173", 10);

// ─── MIME TYPES ─────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".gif": "image/gif",
};

// ─── MÀU ────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

// ─── IP MẠNG LAN ────────────────────────────────────────
/** Danh sách địa chỉ IPv4 nội bộ (VD 192.168.1.5) để mở thử trên điện thoại cùng Wi-Fi */
function lanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((n) => n && (n.family === "IPv4" || n.family === 4) && !n.internal)
    .map((n) => n.address);
}

// ─── BUILD ──────────────────────────────────────────────
async function runBuild() {
  try {
    // Dynamic import + cache bust, build không minify cho dễ đọc
    const mod = await import(`${pathToFileURL(join(ROOT, "scripts", "build.mjs")).href}?t=${Date.now()}`);
    await mod.build({ minify: false });
    process.exitCode = 0; // lỗi build không làm dừng dev server
  } catch (err) {
    console.log(`${c.red}✗ Build lỗi:${c.reset}`, err.message);
  }
}

// ─── SERVER ─────────────────────────────────────────────
function startServer() {
  const dist = join(ROOT, "dist");

  const server = createServer((req, res) => {
    let url = req.url || "/";

    // Xử lý base path: /ten-repo/... → phục vụ dist/...
    if (basePath) {
      if (url === basePath || !url.startsWith(basePath + "/")) {
        res.writeHead(302, { Location: basePath + "/" });
        res.end();
        return;
      }
      url = url.slice(basePath.length);
    }

    // Loại bỏ query string, giải mã ký tự (%20...)
    try {
      url = decodeURIComponent(url.split("?")[0]);
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    // Mặc định index.html
    if (url.endsWith("/")) url += "index.html";

    const filePath = join(dist, url);

    // Bảo mật: không cho truy cập ngoài dist
    if (filePath !== dist && !filePath.startsWith(dist + sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(existsSync(dist) ? "404 — Không tìm thấy" : "Chưa có dist/ — hãy chạy `npm run build` trước");
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";

    const content = readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(content);
  });

  server.on("error", (err) => {
    console.log(`${c.red}✗ Không mở được cổng ${PORT}:${c.reset} ${err.message} (đổi cổng: PORT=3000 npm run dev)`);
    process.exit(1);
  });

  // Lắng nghe 0.0.0.0 để điện thoại cùng Wi-Fi mở được qua IP LAN của máy tính
  server.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log(`${c.cyan}${c.bold}  ╔═══════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ║  🚀 Dev Server đang chạy             ║${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ╠═══════════════════════════════════════╣${c.reset}`);
    console.log(`${c.cyan}  ║  ${c.reset}Local:  ${c.green}http://localhost:${PORT}${basePath}/${c.reset}`);
    for (const ip of lanAddresses()) {
      console.log(`${c.cyan}  ║  ${c.reset}Mạng LAN (điện thoại): ${c.green}http://${ip}:${PORT}${basePath}/${c.reset}`);
    }
    if (noWatch) {
      console.log(`${c.cyan}  ║  ${c.reset}Chế độ: ${c.yellow}preview (không theo dõi)${c.reset}`);
    } else {
      console.log(`${c.cyan}  ║  ${c.reset}Chế độ: ${c.green}dev (tự build khi thay đổi)${c.reset}`);
    }
    console.log(`${c.cyan}${c.bold}  ╚═══════════════════════════════════════╝${c.reset}`);
    console.log("");
  });
}

// ─── WATCH ──────────────────────────────────────────────
function startWatch() {
  const watchPaths = [
    join(ROOT, "index.html"),
    join(ROOT, "site.config.js"),
    join(ROOT, "src"),
    join(ROOT, "public"),
  ];

  let debounce = null;
  let building = false;

  function onChange(eventType, filename) {
    if (building) return;
    if (filename && /(^|[\\/])\.|~$/.test(filename)) return; // bỏ qua file tạm của editor
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      building = true;
      console.log(`${c.dim}[${new Date().toLocaleTimeString()}]${c.reset} ${c.yellow}Phát hiện thay đổi${filename ? `: ${filename}` : ""}${c.reset}`);
      await runBuild();
      console.log(`${c.dim}[${new Date().toLocaleTimeString()}]${c.reset} ${c.green}Build xong — tải lại trình duyệt${c.reset}`);
      building = false;
    }, 200);
  }

  for (const p of watchPaths) {
    if (!existsSync(p)) continue;
    try {
      watch(p, { recursive: true }, onChange);
    } catch {
      // Một số hệ thống không hỗ trợ recursive watch
      watch(p, onChange);
    }
  }

  console.log(`${c.cyan}[watch]${c.reset} Đang theo dõi: index.html, site.config.js, src/, public/`);
}

// ─── MAIN ───────────────────────────────────────────────
async function main() {
  if (!noWatch) {
    // Build trước khi khởi động
    console.log(`${c.cyan}[dev]${c.reset} Build lần đầu...`);
    await runBuild();
  }

  startServer();

  if (!noWatch) {
    startWatch();
  }
}

main();

