/* ============================================================================
 *  TEMPLATES.JS — BỘ RENDER: site.config.js → HTML
 * ============================================================================
 *  - `{{ duong.dan }}`        trong index.html → giá trị trong config (đã escape).
 *  - `{{{ @tenRenderer }}}`   trong index.html → HTML do hàm trong createRenderers sinh ra.
 *  - Toàn bộ class Tailwind nằm ở đây và index.html (Tailwind quét 2 file này).
 *  - Thiết kế mobile-first: class không tiền tố là cho điện thoại.
 * ========================================================================== */

import { existsSync } from "node:fs";

/* ---------- 1. Tiện ích cơ bản ---------- */

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);

const PLACEHOLDER_RE = /\[[A-Z0-9_]+\]/;
/** Rỗng hoặc còn chứa [TEN_IN_HOA] → coi như chưa điền. */
export const isPlaceholder = (value) =>
  value == null || String(value).trim() === "" || PLACEHOLDER_RE.test(String(value));

const isExternal = (href) => /^https?:\/\//i.test(String(href));
const slug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ---------- 2. Icon SVG inline (nét 24×24, không dùng emoji) ---------- */

export const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  zalo: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/><path d="M9 9h6l-6 5.5h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  tiktok: '<path d="M9 12a4 4 0 1 0 4 4V3a5 5 0 0 0 5 5"/>',
  youtube:
    '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
  "arrow-up": '<path d="M12 19V5M6 11l6-6 6 6"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="m9 5 3 3 3-3-1.5-2.5h-3z"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
  sparkles:
    '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  film: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
};

export function icon(name, cls = "size-5") {
  const body = ICONS[name] ?? ICONS.sparkles;
  return `<svg class="${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

/* ---------- 3. Ảnh: <picture> mobile-first + khung thay thế khi chưa có ảnh ---------- */

/**
 * media({ mobile, desktop, alt, w, h, dw, dh, eager, cls, sizes }, ctx)
 * - `mobile` là nguồn mặc định; `desktop` chỉ nạp qua <source media> ở màn hình lớn.
 * - Ảnh chưa có (placeholder hoặc file không tồn tại) → khung nền cùng tỉ lệ.
 * - ctx.exists(path) do build cung cấp để kiểm tra file; ctx.missingAssets gom file thiếu.
 */
export function media(opts, ctx = {}) {
  const { mobile, desktop, alt = "", w = 1200, h = 800, dw, dh, eager = false, cls = "", sizes, bp = 1024, hint = true, dark = false } = opts;
  const exists = ctx.exists ?? (() => true);
  const ok = (p) => !isPlaceholder(p) && (isExternal(p) || exists(p));
  for (const p of [mobile, desktop]) if (!isPlaceholder(p) && !isExternal(p) && !exists(p)) ctx.missingAssets?.add(p);

  const hasM = ok(mobile);
  const hasD = ok(desktop);
  if (!hasM && !hasD) return placeholderFrame({ alt, file: mobile || desktop, hint, cls, dark });

  const src = hasM ? mobile : desktop;
  const [width, height] = hasM ? [w, h] : [dw ?? w, dh ?? h];
  const source =
    hasM && hasD && desktop !== mobile
      ? `<source media="(min-width: ${bp}px)" srcset="${esc(desktop)}"${dw && dh ? ` width="${dw}" height="${dh}"` : ""}>`
      : "";
  const loading = eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"';
  return `<picture class="contents">${source}<img src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}"${sizes ? ` sizes="${esc(sizes)}"` : ""}${loading} class="${esc(cls)}"></picture>`;
}

function placeholderFrame({ alt, file, hint, cls, dark }) {
  const name = file && !isPlaceholder(file) ? String(file).split("/").pop() : "";
  const label = alt ? ` role="img" aria-label="${esc(alt)}"` : ' aria-hidden="true"';
  return `<div class="ph${dark ? " ph-dark" : ""} ${esc(cls)}"${label}><span class="ph-icon">${icon("image", "size-6")}</span>${hint && name ? `<span class="ph-hint">${esc(name)}</span>` : ""}</div>`;
}

/* ---------- 4. Link liên hệ ---------- */

export function createHelpers(config) {
  const c = config.contact ?? {};
  const digits = (s) => String(s).replace(/[^\d+]/g, "");
  const safe = (value, build) => (isPlaceholder(value) ? "#contact" : build(String(value).trim()));

  const tel = safe(c.phone, (v) => `tel:${digits(v)}`);
  const zaloValue = c.zalo ? c.zalo : c.phone; // zalo để "" → dùng số phone
  const zalo = safe(zaloValue, (v) => (isExternal(v) ? v : `https://zalo.me/${digits(v).replace(/^\+/, "")}`));
  const mail = safe(c.email, (v) => `mailto:${v}`);
  const social = Object.fromEntries(
    ["facebook", "instagram", "tiktok", "youtube"].map((k) => [k, c[k] === "" ? "" : safe(c[k], (v) => v)])
  );

  /** "zalo" | "phone" | "email" | "#id" | "https://…" → href */
  const action = (name) => {
    if (name === "zalo") return zalo;
    if (name === "phone") return tel;
    if (name === "email") return mail;
    return isPlaceholder(name) ? "#contact" : name;
  };
  /** Thuộc tính href (+ target/rel cho link ngoài). */
  const hrefAttrs = (href) =>
    isExternal(href) ? `href="${esc(href)}" target="_blank" rel="noopener"` : `href="${esc(href)}"`;

  return { tel, zalo, mail, social, action, hrefAttrs, isExternal };
}

/* ---------- 5. Renderer cho từng khu vực ---------- */

export function createRenderers(config, ctx = {}) {
  const hp = createHelpers(config);
  const ui = config.ui ?? {};
  const exists = ctx.exists ?? (() => true);
  const assetOk = (p) => !isPlaceholder(p) && (isExternal(p) || exists(p));
  const img = (opts) => media({ hint: ui.imageHints !== false, ...opts }, ctx);

  /** Nút "Xem thêm (N)" / "Thu gọn" cho danh sách dài. */
  const collapseToggle = ({ id, total, visible, more, less, onlyMobile = false }) => {
    const extra = total - visible;
    if (extra <= 0) return "";
    const moreText = `${more} (${extra})`;
    return `<div class="collapse-actions mt-6 flex justify-center ${onlyMobile ? "lg:hidden" : ""}"><button type="button" class="btn btn-ghost" data-collapse-toggle aria-expanded="false" aria-controls="${esc(id)}" data-more="${esc(moreText)}" data-less="${esc(less)}" hidden><span data-label>${esc(moreText)}</span>${icon("chevron-down", "chev size-5")}</button></div>`;
  };

  const ctaLink = (cta, cls, iconName) => {
    if (!cta?.label) return "";
    return `<a ${hp.hrefAttrs(hp.action(cta.action))} class="${cls}">${iconName ? icon(iconName, "size-5") : ""}<span>${esc(cta.label)}</span></a>`;
  };

  const ytThumb = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;

  /** Khung video: hiện poster, chỉ tải video khi bấm (main.js). Không JS → mở link. */
  const videoFrame = (v, { sizes } = {}) => {
    const yt = isPlaceholder(v.youtube) ? "" : String(v.youtube).trim();
    if (!isPlaceholder(v.src) && !exists(v.src)) ctx.missingAssets?.add(v.src);
    const src = assetOk(v.src) ? v.src : "";
    const poster = v.poster ?? {};
    const hasPoster = assetOk(poster.mobile) || assetOk(poster.desktop);
    const posterHtml =
      !hasPoster && yt
        ? img({ mobile: ytThumb(yt), alt: poster.alt || v.title, w: 480, h: 360, sizes, cls: "h-full w-full object-cover" })
        : img({ mobile: poster.mobile, desktop: poster.desktop, alt: poster.alt || v.title, w: 1280, h: 720, dw: 1920, dh: 1080, sizes, dark: true, cls: "h-full w-full object-cover" });
    const href = yt ? `https://www.youtube.com/watch?v=${encodeURIComponent(yt)}` : src;
    const play = href
      ? `<a class="video-play" data-video-play href="${esc(href)}" target="_blank" rel="noopener" aria-label="${esc(`${ui.playLabel}: ${v.title}`)}"><span class="video-play-btn">${icon("play", "size-6 translate-x-0.5")}</span></a>`
      : `<span class="video-soon">${icon("film", "size-4")}${esc(ui.videoSoon)}</span>`;
    const posterSrc = assetOk(poster.mobile) ? poster.mobile : assetOk(poster.desktop) ? poster.desktop : "";
    return `<div class="video-frame" data-video${yt ? ` data-youtube="${esc(yt)}"` : ""}${src ? ` data-src="${esc(src)}"` : ""}${posterSrc ? ` data-poster="${esc(posterSrc)}"` : ""} data-title="${esc(v.title)}">${posterHtml}${play}</div>`;
  };

  const socialList = (variant) => {
    const names = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
    const items = Object.entries(hp.social)
      .filter(([, href]) => href)
      .map(([k, href]) => `<li><a ${hp.hrefAttrs(href)} class="btn-icon ${variant === "dark" ? "btn-icon-night" : "btn-icon-soft"}" aria-label="${names[k]}">${icon(k, "size-5")}</a></li>`)
      .join("");
    return items ? `<ul class="flex flex-wrap gap-3">${items}</ul>` : "";
  };

  return {
    /* SEO: canonical, og:url, og:image tuyệt đối, JSON-LD */
    seoHead() {
      const s = config.seo ?? {};
      const base = isPlaceholder(s.siteUrl) ? "" : String(s.siteUrl).replace(/\/?$/, "/");
      const abs = (p) => (base ? new URL(p, base).href : p);
      const out = [];
      if (base) out.push(`<link rel="canonical" href="${esc(base)}">`, `<meta property="og:url" content="${esc(base)}">`);
      if (s.ogImage) {
        out.push(
          `<meta property="og:image" content="${esc(abs(s.ogImage))}">`,
          `<meta property="og:image:width" content="1200">`,
          `<meta property="og:image:height" content="630">`,
          `<meta name="twitter:image" content="${esc(abs(s.ogImage))}">`
        );
      }
      const c = config.contact ?? {};
      const ld = { "@context": "https://schema.org", "@type": "Person", name: config.brand?.name, jobTitle: config.brand?.role, description: s.description };
      if (base) ld.url = base;
      if (!isPlaceholder(c.phone)) ld.telephone = c.phone;
      if (!isPlaceholder(c.email)) ld.email = c.email;
      const sameAs = Object.values(hp.social).filter((u) => isExternal(u));
      if (sameAs.length) ld.sameAs = sameAs;
      out.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
      return out.join("\n    ");
    },

    /* Menu máy tính */
    navLinks() {
      return `<ul class="flex items-center gap-2">${(config.nav ?? [])
        .map((n) => `<li><a href="${esc(n.href)}" class="nav-link">${esc(n.label)}</a></li>`)
        .join("")}</ul>`;
    },

    /* Menu điện thoại (mở bằng nút hamburger) */
    mobileMenu() {
      const links = (config.nav ?? [])
        .map((n, i) => `<li style="--i:${i}"><a href="${esc(n.href)}" class="mobile-menu-link"><span>${esc(n.label)}</span>${icon("arrow-right", "size-5 text-ink-soft")}</a></li>`)
        .join("");
      const c = config.contact?.labels ?? {};
      return `<nav aria-label="${esc(ui.mainNav)}"><ul>${links}</ul></nav>
        <div class="mt-6 flex items-center gap-3">
          <a ${hp.hrefAttrs(hp.tel)} class="btn-icon btn-icon-soft" aria-label="${esc(c.phone)}">${icon("phone")}</a>
          <a ${hp.hrefAttrs(hp.zalo)} class="btn-icon btn-icon-soft" aria-label="${esc(c.zalo)}">${icon("zalo")}</a>
          ${ctaLink(config.header?.cta, "btn btn-primary flex-1", "calendar")}
        </div>`;
    },

    headerCta() {
      return ctaLink(config.header?.cta, "btn btn-primary btn-sm", "calendar");
    },

    /* HERO */
    heroBackground() {
      const b = config.hero?.background ?? {};
      if (!assetOk(b.mobile) && !assetOk(b.desktop)) return "";
      return `<div class="hero-bg" aria-hidden="true">${img({ mobile: b.mobile, desktop: b.desktop, alt: "", w: 1080, h: 1920, dw: 2560, dh: 1440, hint: false, cls: "h-full w-full object-cover" })}</div>`;
    },

    heroMedia() {
      const im = config.hero?.image ?? {};
      return img({ mobile: im.mobile, desktop: im.desktop, alt: im.alt, w: 1080, h: 720, dw: 2400, dh: 1050, eager: true, sizes: "(min-width: 1152px) 1104px, 100vw", cls: "hero-img h-full w-full object-cover" });
    },

    heroActions() {
      const hero = config.hero ?? {};
      return `<div class="grid gap-3 sm:flex sm:flex-wrap sm:items-center lg:justify-center">
          ${ctaLink(hero.primaryCta, "btn btn-primary btn-lg", "zalo")}
          ${ctaLink(hero.secondaryCta, "btn btn-ghost btn-lg", "play")}
        </div>${hero.note ? `<p class="mt-3 text-center text-ink-soft sm:text-left lg:text-center">${esc(hero.note)}</p>` : ""}`;
    },

    /* GIỚI THIỆU */
    aboutMedia() {
      const im = config.about?.image ?? {};
      return img({ mobile: im.mobile, desktop: im.desktop, alt: im.alt, w: 1080, h: 1350, sizes: "(min-width: 1024px) 40vw, 75vw", cls: "h-full w-full object-cover" });
    },

    aboutHighlights() {
      const items = config.about?.highlights ?? [];
      if (!items.length) return "";
      return `<dl class="mt-6 grid grid-cols-3 gap-2.5">${items
        .map(
          (s) => `<div class="stat flex flex-col-reverse rounded-2xl bg-white/80 px-2 py-3 text-center ring-1 ring-line"><dt class="stat-label">${esc(s.label)}</dt><dd class="stat-value">${esc(s.value)}</dd></div>`
        )
        .join("")}</dl>`;
    },

    aboutBio() {
      const a = config.about ?? {};
      if (!a.bio?.length) return "";
      return `<details class="more-details mt-5">
          <summary><span>${esc(a.moreLabel)}</span>${icon("plus", "summary-icon size-5")}</summary>
          <div class="details-body mt-3 space-y-3 text-ink-soft">${a.bio.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
        </details>`;
    },

    /* DỊCH VỤ */
    services() {
      const s = config.services ?? {};
      const items = s.items ?? [];
      const visible = s.mobileVisible ?? 3;
      const tones = ["tone-rose", "tone-violet", "tone-peach", "tone-mint", "tone-butter", "tone-sky"];
      const cards = items
        .map((it, i) => {
          const extra = i >= visible;
          const pic = it.image
            ? `<div class="-mx-5 -mt-5 mb-5 aspect-[16/10] overflow-hidden rounded-t-[1.5rem]">${img({ mobile: it.image, alt: it.title, w: 1080, h: 675, cls: "h-full w-full object-cover" })}</div>`
            : "";
          return `<li class="service-card card p-5 sm:p-6 ${extra ? "" : "reveal"}"${extra ? " data-extra" : ` style="--i:${i}"`}>
            ${pic}<div class="flex items-start gap-4">
              <span class="icon-chip ${tones[i % tones.length]}">${icon(it.icon, "size-6")}</span>
              <div class="min-w-0"><h3 class="text-lg font-semibold leading-snug sm:text-xl">${esc(it.title)}</h3><p class="mt-1.5 text-ink-soft">${esc(it.desc)}</p></div>
            </div></li>`;
        })
        .join("");
      return `<ul id="services-list" class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">${cards}</ul>${collapseToggle({ id: "services-list", total: items.length, visible, more: s.moreLabel, less: s.lessLabel, onlyMobile: true })}`;
    },

    /* VIDEO */
    showreel() {
      const v = config.videos?.showreel;
      if (!v) return "";
      const meta = [v.title, v.duration].filter(Boolean).map(esc).join('<span aria-hidden="true"> · </span>');
      return `<figure class="reveal">${videoFrame(v, { sizes: "(min-width: 1152px) 1104px, 100vw" })}<figcaption class="mt-3 font-medium text-night-soft">${meta}</figcaption></figure>`;
    },

    videoList() {
      const v = config.videos ?? {};
      const items = v.items ?? [];
      if (!items.length) return "";
      const visible = v.mobileVisible ?? 2;
      const cards = items
        .map(
          (it, i) => `<li${i >= visible ? " data-extra" : ""}>${videoFrame(it, { sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" })}
            <div class="mt-3 flex items-baseline justify-between gap-3"><h3 class="min-w-0 font-semibold leading-snug">${esc(it.title)}</h3>${it.tag ? `<span class="tag-night shrink-0">${esc(it.tag)}</span>` : ""}</div></li>`
        )
        .join("");
      return `<ul id="video-list" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${cards}</ul>${collapseToggle({ id: "video-list", total: items.length, visible, more: v.moreLabel, less: v.lessLabel, onlyMobile: true })}`;
    },

    /* GALLERY: thanh chọn danh mục + mỗi danh mục một section */
    galleryNav() {
      const cats = config.gallery?.categories ?? [];
      if (cats.length < 2) return "";
      return `<nav aria-label="${esc(ui.galleryNav)}" class="chip-scroller mt-6"><ul class="flex w-max gap-2">${cats
        .map((c) => `<li><a href="#gallery-${esc(slug(c.id || c.title))}" class="chip">${esc(c.title)}</a></li>`)
        .join("")}</ul></nav>`;
    },

    gallery() {
      const g = config.gallery ?? {};
      return (g.categories ?? [])
        .map((cat) => {
          const id = `gallery-${slug(cat.id || cat.title)}`;
          const listId = `${id}-list`;
          const images = cat.images ?? [];
          const visible = cat.mobileVisible ?? g.mobileVisible ?? 6;
          const items = images
            .map((im, i) => {
              const full = assetOk(im.src) ? im.src : assetOk(im.thumb) ? im.thumb : "";
              const thumb = assetOk(im.thumb) ? im.thumb : im.src;
              const pic = img({ mobile: thumb, alt: im.alt, w: 600, h: 750, sizes: "(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw", cls: "gallery-img h-full w-full object-cover" });
              const inner = full ? `<a href="${esc(full)}" class="gallery-link" data-lightbox="${esc(id)}" data-alt="${esc(im.alt)}">${pic}</a>` : pic;
              return `<li class="gallery-item"${i >= visible ? " data-extra" : ""}>${inner}</li>`;
            })
            .join("");
          return `<section id="${esc(id)}" class="gallery-cat" aria-labelledby="${esc(id)}-title">
            <div class="flex items-end justify-between gap-4">
              <div class="min-w-0"><h3 id="${esc(id)}-title" class="text-2xl font-semibold tracking-tight">${esc(cat.title)}</h3>${cat.summary ? `<p class="mt-1 text-ink-soft">${esc(cat.summary)}</p>` : ""}</div>
              <span class="count-pill shrink-0">${images.length} ${esc(g.countLabel)}</span>
            </div>
            <div data-collapse data-collapse-mode="always"><ul id="${esc(listId)}" class="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">${items}</ul>${collapseToggle({ id: listId, total: images.length, visible, more: g.moreLabel, less: g.lessLabel })}</div>
          </section>`;
        })
        .join("");
    },

    /* KHÁCH HÀNG: dải logo chạy ngang (tắt chuyển động khi prefers-reduced-motion) */
    clients() {
      const items = config.clients?.items ?? [];
      if (!items.length) return "";
      const one = items
        .map((c) => {
          if (!isPlaceholder(c.logo) && !exists(c.logo)) ctx.missingAssets?.add(c.logo);
          return assetOk(c.logo)
            ? `<li class="logo-item"><img src="${esc(c.logo)}" alt="${esc(c.name)}" width="160" height="64" loading="lazy" decoding="async" class="h-9 w-auto"></li>`
            : `<li class="logo-item logo-text">${esc(c.name)}</li>`;
        })
        .join("");
      return `<div class="marquee mt-6"><div class="marquee-track"><ul class="marquee-group">${one}</ul><ul class="marquee-group" aria-hidden="true">${one}</ul></div></div>`;
    },

    /* LIÊN HỆ */
    contactChannels() {
      const c = config.contact ?? {};
      const L = c.labels ?? {};
      const rows = [
        { icon: "phone", label: L.phone, value: c.phone, href: hp.tel, tone: "tone-rose" },
        { icon: "zalo", label: L.zalo, value: c.zalo || c.phone, href: hp.zalo, tone: "tone-sky" },
        { icon: "mail", label: L.email, value: c.email, href: hp.mail, tone: "tone-violet" },
      ].filter((r) => r.value);
      const list = rows
        .map(
          (r) => `<li><a ${hp.hrefAttrs(r.href)} class="channel"><span class="icon-chip ${r.tone}">${icon(r.icon, "size-6")}</span><span class="min-w-0 flex-1"><span class="channel-label">${esc(r.label)}</span><span class="channel-value">${esc(r.value)}</span></span>${icon("arrow-up-right", "size-5 shrink-0 text-ink-soft")}</a></li>`
        )
        .join("");
      const info = [
        c.area ? `<li class="flex items-center gap-2">${icon("map-pin", "size-5 shrink-0 text-rose")}<span><span class="sr-only">${esc(L.area)}: </span>${esc(c.area)}</span></li>` : "",
        c.hours ? `<li class="flex items-center gap-2">${icon("clock", "size-5 shrink-0 text-rose")}<span><span class="sr-only">${esc(L.hours)}: </span>${esc(c.hours)}</span></li>` : "",
      ].join("");
      const socials = socialList("light");
      return `<ul class="mt-6 grid gap-2.5">${list}</ul>
        ${info ? `<ul class="mt-5 grid gap-2 text-ink-soft">${info}</ul>` : ""}
        ${socials ? `<div class="mt-5"><p class="sr-only">${esc(L.socials)}</p>${socials}</div>` : ""}`;
    },

    contactForm() {
      const c = config.contact ?? {};
      const f = c.form;
      if (!f?.enabled) return "";
      const F = f.fields ?? {};
      const endpoint = isPlaceholder(f.action) ? "" : f.action;
      const hasMail = !isPlaceholder(c.email);
      let formAttrs;
      if (endpoint) formAttrs = `action="${esc(endpoint)}" method="post" data-mode="endpoint"`;
      else if (hasMail) formAttrs = `action="mailto:${esc(c.email)}" method="post" enctype="text/plain" data-mode="compose"`;
      else formAttrs = `action="#contact" method="get" data-mode="compose"`;
      const data = [
        hasMail ? `data-email="${esc(c.email)}"` : "",
        hp.zalo !== "#contact" ? `data-zalo="${esc(hp.zalo)}"` : "",
        `data-subject="${esc(f.subject)}" data-success="${esc(f.success)}" data-error="${esc(f.error)}" data-copied="${esc(f.copied)}"`,
      ].join(" ");
      const field = (name, label, control, wide = false) =>
        `<div class="field${wide ? " sm:col-span-2" : ""}"><label for="f-${name}">${esc(label)}</label>${control}</div>`;
      const options = (f.eventTypes ?? []).map((t) => `<option>${esc(t)}</option>`).join("");
      return `<form id="contact-form" class="contact-form" ${formAttrs} ${data}>
          <h3 class="text-xl font-semibold">${esc(f.title)}</h3>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            ${field("name", F.name, `<input id="f-name" name="name" type="text" class="input" autocomplete="name" enterkeyhint="next" data-label="${esc(F.name)}" required>`)}
            ${field("phone", F.phone, `<input id="f-phone" name="phone" type="tel" class="input" inputmode="tel" autocomplete="tel" enterkeyhint="next" pattern="[0-9+ ().\\-]{8,}" data-label="${esc(F.phone)}" required>`)}
            ${field("email", F.email, `<input id="f-email" name="email" type="email" class="input" inputmode="email" autocomplete="email" enterkeyhint="next" data-label="${esc(F.email)}">`, true)}
            ${field("date", F.date, `<input id="f-date" name="date" type="date" class="input" data-label="${esc(F.date)}">`)}
            ${field("type", F.type, `<select id="f-type" name="type" class="input select" data-label="${esc(F.type)}">${options}</select>`)}
            ${field("message", F.message, `<textarea id="f-message" name="message" rows="3" class="input" data-label="${esc(F.message)}"></textarea>`, true)}
          </div>
          <button type="submit" class="btn btn-primary btn-lg mt-5 w-full">${icon("send", "size-5")}<span>${esc(f.submitLabel)}</span></button>
          <p class="form-status mt-3 font-medium" data-form-status role="status" aria-live="polite"></p>
          ${f.note ? `<p class="mt-1 text-ink-soft">${esc(f.note)}</p>` : ""}
        </form>`;
    },

    /* FOOTER */
    footerNav() {
      return `<ul class="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-2">${(config.nav ?? [])
        .map((n) => `<li><a href="${esc(n.href)}" class="footer-link">${esc(n.label)}</a></li>`)
        .join("")}</ul>`;
    },

    footerSocials() {
      return socialList("dark");
    },

    copyright() {
      return esc(String(config.footer?.copyright ?? "").replace("{year}", new Date().getFullYear()));
    },

    /* NÚT CTA NỔI */
    ctaBar() {
      const b = config.ctaBar;
      if (!b?.enabled) return "";
      return `<div id="cta-bar" class="cta-bar"><div class="cta-bar-inner">
          <a ${hp.hrefAttrs(hp.tel)} class="btn-icon btn-icon-soft" aria-label="${esc(b.callLabel)}">${icon("phone")}</a>
          <a ${hp.hrefAttrs(hp.zalo)} class="btn-icon btn-icon-soft" aria-label="${esc(b.zaloLabel)}">${icon("zalo")}</a>
          ${ctaLink({ label: b.label, action: b.action }, "btn btn-primary flex-1 lg:flex-none", "calendar")}
        </div></div>`;
    },
  };
}

/* ---------- 6. Ghép template ---------- */

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** Mặc định: kiểm tra file trong thư mục dự án (templates.js chỉ chạy lúc build, trên Node). */
const fileExists = (p) => existsSync(new URL(`../${decodeURIComponent(p)}`, import.meta.url));

/**
 * renderPage(template, config, { exists }) → { html, missing, missingAssets }
 * - missing: key/renderer có trong template nhưng không có trong config/templates.js
 * - missingAssets: file ảnh/video được khai báo nhưng chưa có trong public/
 *   (ghi thêm vào comment cuối HTML để scripts/build.mjs quét được và cảnh báo)
 */
export function renderPage(template, config, options = {}) {
  const ctx = { exists: options.exists ?? fileExists, missingAssets: new Set() };
  const renderers = createRenderers(config, ctx);
  const missing = new Set();

  const html = template
    .replace(/^\uFEFF?\s*<!--\s*ĐÂY LÀ FILE KHUNG[\s\S]*?-->\s*/, "")
    .replace(/\{\{\{\s*@([\w-]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, (_, renderer, path) => {
      if (renderer) {
        const fn = renderers[renderer];
        if (typeof fn !== "function") {
          missing.add(`@${renderer}`);
          return "";
        }
        return fn();
      }
      const value = getPath(config, path);
      if (value == null || typeof value === "object") {
        missing.add(path);
        return "";
      }
      return esc(value);
    });

  const missingAssets = [...ctx.missingAssets];
  const note = missingAssets.length ? `<!-- File chưa có: ${missingAssets.join(" ")} -->\n` : "";
  return { html: html.replace("</body>", `${note}</body>`), missing: [...missing], missingAssets };
}
