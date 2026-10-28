/* ============================================================================
 *  MAIN.JS — JS phía trình duyệt (thuần, không thư viện)
 *  1. Header khi cuộn      5. Video chỉ tải khi bấm
 *  2. Menu điện thoại      6. Lightbox + vuốt
 *  3. Thu gọn / mở rộng    7. Thanh CTA nổi
 *  4. Hiện dần khi cuộn    8. Hiệu ứng gợn khi chạm nút · 9. Form liên hệ
 *  Trang vẫn đọc được đầy đủ khi tắt JS (nội dung thu gọn có sẵn trong HTML).
 * ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => (reduceMotion.matches ? "auto" : "smooth");

  let locks = 0;
  const lockScroll = (on) => {
    locks = Math.max(0, locks + (on ? 1 : -1));
    root.classList.toggle("is-locked", locks > 0);
  };

  /* 1. Header đổi nền khi cuộn */
  const header = $("#site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2. Menu điện thoại: aria-expanded, khóa cuộn, Esc, bấm ra ngoài, chọn mục */
  const toggle = $("#menu-toggle");
  const menu = $("#mobile-menu");
  if (toggle && menu) {
    const panel = $(".mobile-menu-panel", menu);
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    let hideTimer;
    const setOpen = (open, { focusToggle = false } = {}) => {
      if (open === isOpen()) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
      root.classList.toggle("menu-open", open);
      lockScroll(open);
      clearTimeout(hideTimer);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add("is-open"));
      } else {
        menu.classList.remove("is-open");
        hideTimer = setTimeout(() => (menu.hidden = true), reduceMotion.matches ? 0 : 230);
        if (focusToggle) toggle.focus();
      }
    };
    toggle.addEventListener("click", () => setOpen(!isOpen()));
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a") || !panel.contains(e.target)) setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) setOpen(false, { focusToggle: true });
    });
    matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setOpen(false));
  }

  /* 3. Thu gọn / mở rộng danh sách dài */
  $$("[data-collapse]").forEach((group) => {
    const btn = $("[data-collapse-toggle]", group);
    if (!btn) return;
    const label = $("[data-label]", btn) || btn;
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const open = !group.classList.contains("is-open");
      group.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      label.textContent = open ? btn.dataset.less : btn.dataset.more;
      if (!open) (group.closest("section") || group).scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    });
  });

  /* 4. Hiện dần khi cuộn */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* 5. Video: chỉ tải khi bấm Play (poster hiện trước) */
  document.addEventListener("click", (e) => {
    const play = e.target.closest("[data-video-play]");
    const frame = play?.closest("[data-video]");
    if (!frame) return;
    e.preventDefault();
    const { youtube, src, title = "", poster } = frame.dataset;
    let el;
    if (youtube) {
      el = document.createElement("iframe");
      el.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?autoplay=1&rel=0&playsinline=1`;
      el.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      el.allowFullscreen = true;
      el.title = title;
    } else if (src) {
      el = document.createElement("video");
      Object.assign(el, { src, controls: true, autoplay: true, playsInline: true, preload: "auto" });
      el.setAttribute("playsinline", "");
      if (poster) el.poster = poster;
    } else return;
    el.className = "video-embed";
    frame.replaceChildren(el);
    el.focus();
  });

  /* 6. Lightbox: phím ← →, Esc; vuốt trái/phải để chuyển, vuốt xuống để đóng */
  const lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    const img = $("[data-lb-img]", lb);
    const stage = $("[data-lb-stage]", lb);
    const caption = $("[data-lb-caption]", lb);
    const count = $("[data-lb-count]", lb);
    let items = [];
    let index = 0;
    let trigger = null;

    const preload = (i) => {
      const a = items[(i + items.length) % items.length];
      if (a) new Image().src = a.href;
    };
    const show = (i) => {
      index = (i + items.length) % items.length;
      const a = items[index];
      img.classList.remove("is-in");
      img.style.transform = "";
      img.onload = () => img.classList.add("is-in");
      img.src = a.href;
      img.alt = a.dataset.alt || "";
      caption.textContent = a.dataset.alt || "";
      count.textContent = `${index + 1} / ${items.length}`;
      if (img.complete) img.classList.add("is-in");
      preload(index + 1);
      preload(index - 1);
    };

    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-lightbox]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      items = $$(`[data-lightbox="${CSS.escape(a.dataset.lightbox)}"]`);
      trigger = a;
      lb.showModal();
      lockScroll(true);
      show(items.indexOf(a));
    });
    lb.addEventListener("close", () => {
      lockScroll(false);
      img.removeAttribute("src");
      trigger?.focus({ preventScroll: true });
    });
    $("[data-lb-prev]", lb).addEventListener("click", () => show(index - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(index + 1));
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    stage.addEventListener("click", (e) => e.target === stage && lb.close());
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    let x0 = null;
    let y0 = 0;
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return (x0 = null);
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      img.classList.add("is-dragging");
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (x0 === null) return;
      const dx = e.touches[0].clientX - x0;
      const dy = e.touches[0].clientY - y0;
      img.style.transform = Math.abs(dx) > Math.abs(dy) ? `translateX(${dx}px)` : `translateY(${Math.max(0, dy)}px)`;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      img.classList.remove("is-dragging");
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      img.style.transform = "";
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
      else if (dy > 90 && dy > Math.abs(dx)) lb.close();
    });
  }

  /* 7. Thanh CTA nổi: hiện khi đã cuộn qua nút ở hero, ẩn khi đang xem Liên hệ */
  const bar = $("#cta-bar");
  const heroCta = $("#hero-cta");
  const contact = $("#contact");
  if (bar && heroCta && "IntersectionObserver" in window) {
    let pastHero = false;
    let inContact = false;
    const update = () => {
      const shown = pastHero && !inContact;
      bar.classList.toggle("is-shown", shown);
      bar.inert = !shown;
    };
    new IntersectionObserver(([en]) => {
      pastHero = !en.isIntersecting && en.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);
    if (contact) {
      new IntersectionObserver(([en]) => {
        inContact = en.isIntersecting;
        update();
      }, { threshold: 0.12 }).observe(contact);
    }
    update();
  } else if (bar) {
    bar.classList.add("is-shown");
  }

  /* 8. Hiệu ứng gợn sóng khi chạm nút */
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".btn, .btn-icon");
    if (!btn || reduceMotion.matches) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const dot = document.createElement("span");
    dot.className = "ripple";
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.append(dot);
    dot.addEventListener("animationend", () => dot.remove());
  });

  /* 9. Form liên hệ: gửi tới endpoint (Formspree…) hoặc soạn sẵn email / Zalo */
  const form = $("#contact-form");
  if (form) {
    const status = $("[data-form-status]", form);
    const submit = $('[type="submit"]', form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = form.dataset;
      if (d.mode === "endpoint") {
        submit.disabled = true;
        try {
          const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(res.statusText);
          form.reset();
          status.textContent = d.success;
        } catch {
          status.textContent = d.error;
        } finally {
          submit.disabled = false;
        }
        return;
      }
      const text = [...new FormData(form)]
        .filter(([, v]) => String(v).trim())
        .map(([k, v]) => `${form.elements[k]?.dataset.label || k}: ${v}`)
        .join("\n");
      if (d.email) {
        location.href = `mailto:${d.email}?subject=${encodeURIComponent(d.subject || "")}&body=${encodeURIComponent(text)}`;
        status.textContent = d.success;
      } else if (d.zalo) {
        try {
          await navigator.clipboard.writeText(text);
        } catch {}
        status.textContent = d.copied;
        window.open(d.zalo, "_blank", "noopener");
      } else {
        status.textContent = d.error;
      }
    });
  }
})();
