/* ============================================================================
 *  SITE.CONFIG.JS — TOÀN BỘ NỘI DUNG CỦA WEBSITE NẰM Ở ĐÂY
 * ============================================================================
 *  Cách dùng:
 *  - Muốn đổi chữ, ảnh, video, link, SEO… chỉ sửa file này, KHÔNG sửa index.html.
 *  - `npm run dev`   → xem trang tại http://localhost:5173, tự tải lại khi lưu file.
 *  - `npm run build` → xuất website hoàn chỉnh ra thư mục dist/.
 *  - Chỗ nào còn dạng [TEN_IN_HOA] là PLACEHOLDER chưa điền. Lệnh build sẽ liệt kê
 *    tất cả placeholder còn sót. Link (điện thoại, Zalo, email, mạng xã hội) còn
 *    placeholder sẽ tự trỏ về mục Liên hệ thay vì tạo link hỏng.
 *  - Đường dẫn ảnh/video luôn viết dạng "public/..." (KHÔNG có dấu "/" ở đầu).
 *  - Ảnh nên dùng .webp, tên kebab-case có số thứ tự: service-01.webp.
 *    Bản riêng cho điện thoại thêm đuôi "-m": hero-01-m.webp.
 *  - Ảnh chưa có vẫn build được: trang hiện khung nền thay thế đúng tỉ lệ.
 *  - Kích thước ảnh gợi ý ghi theo thứ tự: ĐIỆN THOẠI trước → MÁY TÍNH sau.
 *  - `mobileVisible`: số mục hiện sẵn trên điện thoại, phần còn lại thu gọn sau
 *    nút "Xem thêm". Đổi số này là đủ, không cần sửa code.
 *  - Muốn ẩn một dòng (VD: Instagram), để chuỗi rỗng "".
 * ========================================================================== */

/* Tiện ích tạo nhanh danh sách ảnh cho Gallery.
 * album("public/images/gallery/dam-cuoi/dam-cuoi", 8, "Khoảnh khắc đám cưới")
 * → dam-cuoi-01.webp … dam-cuoi-08.webp, alt "Khoảnh khắc đám cưới 1…8".
 * Không thích dùng? Cứ viết mảng { src, alt } bằng tay như ví dụ bên dưới. */
const album = (prefix, count, alt, ext = "webp") =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { src: `${prefix}-${n}.${ext}`, alt: `${alt} ${i + 1}` };
  });

export const SITE_CONFIG = {
  /* 1. SEO — tiêu đề tab, mô tả trên Google, ảnh khi chia sẻ Facebook/Zalo
   *    Ảnh OG: 1200×630 px (.jpg hoặc .png, < 300 KB) — dùng chung mọi thiết bị. */
  seo: {
    title: "[TEN_THUONG_HIEU] — MC đám cưới & sự kiện doanh nghiệp",
    description:
      "MC dẫn chương trình đám cưới, hội nghị, gala và sự kiện doanh nghiệp. Dẫn dắt tự nhiên, đúng nhịp, chạm cảm xúc. Đặt lịch nhanh qua Zalo.",
    keywords: "MC sự kiện, MC đám cưới, MC hội nghị, MC gala dinner, MC doanh nghiệp",
    siteUrl: "[URL_WEBSITE]", // VD: https://ten-ban.github.io/mc-portfolio/ (có dấu / ở cuối)
    ogImage: "public/images/og/og-image.jpg",
    ogImageAlt: "[TEN_THUONG_HIEU] — MC sự kiện",
    locale: "vi_VN",
    lang: "vi",
    themeColor: "#FBF8F4", // màu thanh địa chỉ trên điện thoại (trùng màu nền trang)
  },

  /* 2. THƯƠNG HIỆU — tên ở logo, footer, dữ liệu Google */
  brand: {
    name: "[TEN_THUONG_HIEU]",
    role: "MC sự kiện",
    tagline: "Dẫn dắt bằng cảm xúc — sự kiện trọn vẹn",
  },

  /* 3. MENU — thứ tự mục trong menu. href là id của khu vực. */
  nav: [
    { label: "Giới thiệu", href: "#about" },
    { label: "Dịch vụ", href: "#services" },
    { label: "Video", href: "#videos" },
    { label: "Hình ảnh", href: "#gallery" },
    { label: "Đối tác", href: "#clients" },
    { label: "Liên hệ", href: "#contact" },
  ],

  /* 4. HEADER — nút "Đặt lịch" luôn hiện góc phải.
   *    action: "zalo" | "phone" | "email" | "#id-khu-vuc" | "https://..." */
  header: {
    cta: { label: "Đặt lịch", action: "zalo" },
  },

  /* 5. HERO — màn hình đầu tiên
   *    Ảnh ngang cỡ lớn:
   *    - Điện thoại (mobile): 1080×720 px, tỉ lệ 3:2  → hero-01-m.webp
   *    - Máy tính  (desktop): 2400×1050 px, tỉ lệ 16:7 → hero-01.webp
   *    Chỉ có 1 ảnh? Điền vào `mobile`, để `desktop` rỗng.
   *    background (không bắt buộc): ảnh nghệ thuật mờ phía sau hero,
   *    mobile 1080×1920 px · desktop 2560×1440 px. Để rỗng thì dùng nền gradient. */
  hero: {
    eyebrow: "MC sự kiện · Đám cưới · Doanh nghiệp",
    title: "[TEN_THUONG_HIEU]",
    highlight: "Dẫn dắt bằng cảm xúc",
    subtitle: "Mỗi khoảnh khắc được dẫn dắt tự nhiên, đúng nhịp và trọn vẹn.",
    note: "Báo giá miễn phí · Phản hồi trong ngày",
    image: {
      mobile: "public/images/hero/hero-01-m.webp",
      desktop: "public/images/hero/hero-01.webp",
      alt: "[TEN_THUONG_HIEU] dẫn chương trình trên sân khấu",
    },
    background: { mobile: "", desktop: "", alt: "" },
    primaryCta: { label: "Đặt lịch qua Zalo", action: "zalo" },
    secondaryCta: { label: "Xem showreel", action: "#videos" },
  },

  /* 6. GIỚI THIỆU — ảnh chân dung bên phải, chữ đè bên trái
   *    Ảnh chân dung tỉ lệ 4:5: mobile 1080×1350 px (dùng chung cho máy tính).
   *    summary: 1–2 câu luôn hiện. bio: các đoạn dài, thu gọn sau "Đọc thêm". */
  about: {
    eyebrow: "Giới thiệu",
    title: "Xin chào, tôi là [TEN_THUONG_HIEU]",
    summary:
      "MC chuyên dẫn đám cưới và sự kiện doanh nghiệp — giúp chương trình của bạn diễn ra tự nhiên, ấm áp và đúng kịch bản.",
    image: {
      mobile: "public/images/about/about-01.webp",
      desktop: "",
      alt: "Chân dung [TEN_THUONG_HIEU]",
    },
    highlights: [
      { value: "[SO_NAM]+", label: "năm kinh nghiệm" },
      { value: "[SO_SU_KIEN]+", label: "sự kiện" },
      { value: "[SO_DOI_TAC]+", label: "đối tác" },
    ],
    moreLabel: "Đọc thêm về tôi",
    bio: [
      "[TIEU_SU_NGAN] — VD: bắt đầu dẫn chương trình từ năm nào, học ở đâu, từng làm việc với những đơn vị nào.",
      "Với tôi, một MC giỏi không chỉ nói hay mà còn biết lắng nghe: lắng nghe cô dâu chú rể, lắng nghe ban tổ chức và cảm nhận không khí khán phòng để giữ nhịp cho cả chương trình.",
      "Trước mỗi sự kiện, tôi cùng bạn trao đổi kịch bản, timeline và những chi tiết riêng để mọi thứ diễn ra trơn tru, đúng tinh thần bạn mong muốn.",
    ],
  },

  /* 7. DỊCH VỤ — mảng thẻ dịch vụ
   *    icon: ring | briefcase | sparkles | gift | users | mic | globe | heart | calendar
   *    image (không bắt buộc): 1080×675 px (16:10), VD "public/images/services/service-01.webp" */
  services: {
    eyebrow: "Dịch vụ",
    title: "Một giọng dẫn, nhiều sắc thái",
    summary: "Chọn loại chương trình — tôi lo phần dẫn dắt.",
    mobileVisible: 3,
    moreLabel: "Xem tất cả dịch vụ",
    lessLabel: "Thu gọn",
    items: [
      { icon: "ring", title: "MC đám cưới", desc: "Lễ gia tiên, lễ thành hôn và tiệc cưới — ấm áp, chỉn chu từng nghi thức." },
      { icon: "briefcase", title: "Hội nghị & hội thảo", desc: "Điều phối đúng giờ, giữ nhịp cho diễn giả và khách mời." },
      { icon: "sparkles", title: "Gala & Year End Party", desc: "Năng lượng, sáng tạo, kết nối khán giả cho đêm tiệc." },
      { icon: "gift", title: "Khai trương & ra mắt", desc: "Tạo điểm nhấn cho thương hiệu trong khoảnh khắc khởi đầu." },
      { icon: "users", title: "Team building", desc: "Hoạt náo, dẫn trò chơi, gắn kết tập thể." },
      { icon: "mic", title: "Tư vấn kịch bản", desc: "Cùng bạn xây dựng kịch bản, timeline và lời dẫn." },
    ],
  },

  /* 8. VIDEO — 1 showreel lớn + danh sách video nhỏ (thu gọn)
   *    youtube: mã video, VD link https://youtu.be/AbC123xYz → "AbC123xYz"
   *    src: hoặc video tự lưu "public/videos/showreel.mp4" (≤ 20 MB, H.264)
   *    poster: ảnh bìa 16:9 — mobile 1280×720 px (dùng chung máy tính).
   *    Không có poster mà có mã YouTube → tự lấy ảnh bìa của YouTube.
   *    Video chỉ tải khi khách bấm Play. */
  videos: {
    eyebrow: "Video",
    title: "Xem tôi trên sân khấu",
    summary: "Vài phút để cảm nhận phong cách dẫn dắt.",
    showreel: {
      title: "Showreel [NAM]",
      duration: "[THOI_LUONG]",
      youtube: "[YOUTUBE_ID_SHOWREEL]",
      src: "",
      poster: { mobile: "public/images/videos/showreel-01.webp", desktop: "", alt: "Showreel [TEN_THUONG_HIEU]" },
    },
    mobileVisible: 2,
    moreLabel: "Xem thêm video",
    lessLabel: "Thu gọn",
    items: [
      { title: "Lễ cưới tại [DIA_DIEM_01]", tag: "Đám cưới", youtube: "[YOUTUBE_ID_01]", src: "", poster: { mobile: "public/images/videos/video-01.webp", alt: "Lễ cưới tại [DIA_DIEM_01]" } },
      { title: "Gala dinner [DOANH_NGHIEP_01]", tag: "Gala", youtube: "[YOUTUBE_ID_02]", src: "", poster: { mobile: "public/images/videos/video-02.webp", alt: "Gala dinner [DOANH_NGHIEP_01]" } },
      { title: "Hội nghị khách hàng [DOANH_NGHIEP_02]", tag: "Hội nghị", youtube: "[YOUTUBE_ID_03]", src: "", poster: { mobile: "public/images/videos/video-03.webp", alt: "Hội nghị khách hàng" } },
      { title: "Team building [DOANH_NGHIEP_03]", tag: "Team building", youtube: "[YOUTUBE_ID_04]", src: "", poster: { mobile: "public/images/videos/video-04.webp", alt: "Team building" } },
    ],
  },

  /* 9. GALLERY — mỗi danh mục là một khu vực riêng, có nút "Xem thêm ảnh"
   *    Mỗi ảnh: { src, alt } — thêm `thumb` nếu có ảnh nhỏ riêng.
   *    - thumb (ô lưới, tỉ lệ 4:5): mobile 600×750 px → dam-cuoi-01-m.webp
   *    - src   (xem phóng to): cạnh dài 1600–2000 px → dam-cuoi-01.webp
   *    Không có thumb thì lưới dùng luôn src.
   *    mobileVisible: số ảnh hiện sẵn (mọi kích thước màn hình), có thể đặt riêng
   *    cho từng danh mục. Muốn thêm danh mục: chép thêm một khối { id, title, ... }. */
  gallery: {
    eyebrow: "Hình ảnh",
    title: "Khoảnh khắc đáng nhớ",
    summary: "Chọn danh mục để xem nhanh.",
    mobileVisible: 6,
    moreLabel: "Xem thêm ảnh",
    lessLabel: "Thu gọn",
    countLabel: "ảnh",
    categories: [
      {
        id: "dam-cuoi",
        title: "Đám cưới",
        summary: "Lễ gia tiên, lễ đường và tiệc cưới.",
        images: album("public/images/gallery/dam-cuoi/dam-cuoi", 8, "Khoảnh khắc đám cưới"),
      },
      {
        id: "doanh-nghiep",
        title: "Sự kiện doanh nghiệp",
        summary: "Hội nghị, hội thảo, lễ ra mắt.",
        images: album("public/images/gallery/doanh-nghiep/doanh-nghiep", 8, "Sự kiện doanh nghiệp"),
      },
      {
        id: "gala",
        title: "Gala & tiệc",
        summary: "Year end party, gala dinner.",
        mobileVisible: 4,
        images: [
          { src: "public/images/gallery/gala/gala-01.webp", alt: "Gala dinner — khoảnh khắc 1" },
          { src: "public/images/gallery/gala/gala-02.webp", alt: "Gala dinner — khoảnh khắc 2" },
          { src: "public/images/gallery/gala/gala-03.webp", alt: "Gala dinner — khoảnh khắc 3" },
          { src: "public/images/gallery/gala/gala-04.webp", alt: "Gala dinner — khoảnh khắc 4" },
          { src: "public/images/gallery/gala/gala-05.webp", alt: "Gala dinner — khoảnh khắc 5" },
          { src: "public/images/gallery/gala/gala-06.webp", alt: "Gala dinner — khoảnh khắc 6" },
        ],
      },
    ],
  },

  /* 10. KHÁCH HÀNG / ĐỐI TÁC — dải logo chạy ngang
   *     Logo: SVG hoặc PNG nền trong suốt, cao 80 px (hiển thị cao 36 px).
   *     Chưa có logo → hiện tên đối tác dạng chữ. */
  clients: {
    eyebrow: "Đã đồng hành",
    title: "Khách hàng & đối tác",
    items: [
      { name: "Vietcombank", logo: "public/images/clients/client-01.png" },
      { name: "MB Bank", logo: "public/images/clients/client-02.png" },
      { name: "ACB", logo: "public/images/clients/client-03.png" },
      { name: "VPBank", logo: "public/images/clients/client-04.png" },
      { name: "VIB", logo: "public/images/clients/client-05.png" },
      { name: "HSBC", logo: "public/images/clients/client-06.png" },
    ],
  },

  /* 11. LIÊN HỆ
   *     phone: số gọi được, VD "0901 234 567" hoặc "+84 901 234 567"
   *     zalo: số Zalo (hoặc link https://zalo.me/...). Để "" thì dùng luôn số phone.
   *     form.action: link nhận form (VD Formspree: https://formspree.io/f/xxxx).
   *     Chưa có → nút Gửi sẽ soạn sẵn email (hoặc chép nội dung + mở Zalo). */
  contact: {
    eyebrow: "Liên hệ",
    title: "Giữ lịch cho ngày của bạn",
    summary: "Nhắn Zalo hoặc gọi trực tiếp — tôi phản hồi trong ngày.",
    phone: "[SO_DIEN_THOAI]",
    zalo: "[SO_ZALO]",
    email: "[EMAIL]",
    facebook: "[FACEBOOK_URL]",
    instagram: "",
    tiktok: "[TIKTOK_URL]",
    youtube: "[YOUTUBE_KENH_URL]",
    area: "[KHU_VUC_NHAN_LICH]",
    hours: "8:00 – 22:00 hằng ngày",
    labels: {
      phone: "Gọi điện",
      zalo: "Nhắn Zalo",
      email: "Email",
      area: "Khu vực",
      hours: "Giờ nhận tin",
      socials: "Mạng xã hội",
    },
    form: {
      enabled: true,
      action: "[FORM_ACTION_URL]",
      title: "Gửi yêu cầu báo giá",
      subject: "Yêu cầu báo giá MC",
      submitLabel: "Gửi yêu cầu",
      note: "Thông tin chỉ dùng để liên hệ lại với bạn.",
      success: "Đã gửi! Tôi sẽ liên hệ lại sớm.",
      error: "Chưa gửi được. Vui lòng gọi hoặc nhắn Zalo giúp tôi.",
      copied: "Đã chép nội dung — dán vào Zalo để gửi nhé.",
      fields: {
        name: "Họ và tên",
        phone: "Số điện thoại",
        email: "Email (không bắt buộc)",
        date: "Ngày tổ chức",
        type: "Loại sự kiện",
        message: "Ghi chú thêm",
      },
      eventTypes: ["Đám cưới", "Hội nghị / hội thảo", "Gala / Year End Party", "Khai trương / ra mắt", "Team building", "Khác"],
    },
  },

  /* 12. NÚT CTA NỔI — thanh bám đáy màn hình điện thoại (góc phải trên máy tính).
   *     Hiện khi đã cuộn qua nút ở hero, tự ẩn khi đang xem mục Liên hệ. */
  ctaBar: {
    enabled: true,
    label: "Đặt lịch ngay",
    action: "zalo",
    callLabel: "Gọi điện",
    zaloLabel: "Nhắn Zalo",
  },

  /* 13. FOOTER — {year} tự thay bằng năm hiện tại */
  footer: {
    tagline: "MC đám cưới & sự kiện doanh nghiệp.",
    copyright: "© {year} [TEN_THUONG_HIEU]. Bảo lưu mọi quyền.",
    backToTop: "Lên đầu trang",
  },

  /* 14. CHỮ GIAO DIỆN & TUỲ CHỌN
   *     imageHints: true → khung ảnh chưa có sẽ ghi tên file cần thêm (tiện khi làm).
   *     Đặt false trước khi đưa web lên nếu vẫn còn thiếu ảnh. */
  ui: {
    imageHints: true,
    skipLink: "Bỏ qua, tới nội dung chính",
    menuOpen: "Mở menu",
    menuClose: "Đóng menu",
    mainNav: "Menu chính",
    galleryNav: "Danh mục ảnh",
    playLabel: "Phát video",
    videoSoon: "Video sắp cập nhật",
    lightbox: { label: "Xem ảnh", close: "Đóng", prev: "Ảnh trước", next: "Ảnh sau" },
  },
};
