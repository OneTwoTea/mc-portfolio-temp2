/* ============================================================================
 *  DEV.MJS — server xem thử (node:http, không thư viện)
 *  npm run dev                 build (không nén) + tự build lại khi sửa file + tự tải lại trang
 *  npm run preview             chỉ phục vụ dist/ đang có (--no-watch)
 *  --base=/ten-repo/           giả lập GitHub Pages dạng project
 *  PORT=3000 npm run dev       đổi cổng (mặc định 5173)
 *  Server nghe trên 0.0.0.0 → mở bằng điện thoại cùng Wi-Fi qua địa chỉ LAN in ra.
 * ========================================================================== */
import http from "node:http";
import os from "node:os";
import { existsSync, statSync, watch, createReadStream, readFileSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { build, DIST, ROOT } from "./build.mjs";

const args = process.argv.slice(2);
const watching = !args.includes("--no-watch");
const baseArg = args.find((a) => a.startsWith("--base="));
const base = `/${(baseArg ? baseArg.slice(7) : "/").replace(/^\/+|\/+$/g, "")}/`.replace(/\/+/g, "/");
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const clients = new Set();
const RELOAD_SNIPPET = `<script>new EventSource("${base}__reload").onmessage=()=>location.reload()</script>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);

  if (watching && path === `${base}__reload`) {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write(": ok\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (!path.startsWith(base)) {
    if (path === "/" || path === base.slice(0, -1)) {
      res.writeHead(302, { Location: base });
      return res.end();
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`Không tìm thấy. Trang nằm ở ${base}`);
  }

  path = path.slice(base.length);
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST + sep) && file !== DIST) {
    res.writeHead(403);
    return res.end();
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`404 — không có file: ${path}`);
  }

  const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
  const headers = { "Content-Type": type, "Cache-Control": "no-store" };
  if (watching && type.startsWith("text/html")) {
    const html = readFileSync(file, "utf8").replace("</body>", `${RELOAD_SNIPPET}</body>`);
    res.writeHead(200, headers);
    return res.end(html);
  }
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
});

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === "IPv4" && !n.internal)
    .map((n) => n.address);
}

async function rebuild() {
  try {
    const ok = await build({ minify: false });
    if (ok) process.exitCode = 0;
    for (const res of clients) res.write("data: reload\n\n");
  } catch (err) {
    console.error(`\x1b[31m✖ ${err.message}\x1b[0m`);
  }
}

if (watching) {
  await rebuild();
  let timer;
  let running = false;
  let queued = false;
  const trigger = (file) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return void (queued = true);
      running = true;
      console.log(`\n\x1b[36m↻ Thay đổi: ${file ?? ""} — đang build lại…\x1b[0m`);
      await rebuild();
      running = false;
      if (queued) {
        queued = false;
        trigger();
      }
    }, 120);
  };
  for (const target of ["index.html", "site.config.js", "src", "public"]) {
    const full = join(ROOT, target);
    if (!existsSync(full)) continue;
    const recursive = statSync(full).isDirectory();
    watch(full, { recursive }, (_, name) => trigger(name ? join(target, String(name)) : target));
  }
} else if (!existsSync(join(DIST, "index.html"))) {
  console.log("\x1b[33m⚠ Chưa có dist/. Chạy `npm run build` trước.\x1b[0m");
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n\x1b[1m${watching ? "Dev server" : "Preview"} đang chạy\x1b[0m`);
  console.log(`  Máy này:    \x1b[36mhttp://localhost:${PORT}${base}\x1b[0m`);
  for (const ip of lanAddresses()) console.log(`  Điện thoại: \x1b[36mhttp://${ip}:${PORT}${base}\x1b[0m  (cùng Wi-Fi)`);
  console.log(`  ${watching ? "Đang theo dõi index.html, site.config.js, src/, public/. " : ""}Ctrl+C để dừng.\n`);
});
