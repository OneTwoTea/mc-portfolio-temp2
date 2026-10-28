# MC Portfolio — website tĩnh, ưu tiên điện thoại

Website giới thiệu MC dựng bằng **HTML + Tailwind CSS v4 + JavaScript thuần**, không framework, không bundler.
Toàn bộ nội dung nằm trong **một file duy nhất: `site.config.js`**. Muốn đổi chữ, ảnh, video hay link thì chỉ sửa file này.

## 1. Cài đặt

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev        # xem thử tại http://localhost:5173, tự build lại khi lưu file
```

`npm run dev` in thêm địa chỉ dạng `http://192.168.x.x:5173/`. Mở địa chỉ đó trên **điện thoại dùng chung Wi-Fi** để xem bản thật.

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Build (không nén CSS), theo dõi `index.html`, `site.config.js`, `src/`, `public/`, tự tải lại trang |
| `npm run build` | Build bản chính thức ra `dist/` (CSS đã nén) |
| `npm run preview` | Chỉ phục vụ `dist/` đang có, không build lại |
| `node scripts/build.mjs --html-only` | Chỉ dựng lại `dist/index.html` |
| `npm run dev -- --base=/ten-repo/` | Giả lập GitHub Pages dạng `ten-ban.github.io/ten-repo/` |
| `PORT=3000 npm run dev` | Đổi cổng (PowerShell: `$env:PORT=3000; npm run dev`) |

Sau mỗi lần build, terminal sẽ báo:
- **Ảnh/video chưa có**: file được khai báo trong config nhưng chưa có trong `public/`. Trang vẫn hiện khung thay thế đúng tỉ lệ.
- **Placeholder chưa điền**: các chỗ còn dạng `[TEN_IN_HOA]`, kèm vị trí key.
- **Lỗi key template**: `index.html` gọi tới key không có trong config. Build sẽ trả mã lỗi 1.

## 2. Sửa nội dung

Mở `site.config.js`. Mỗi khu vực là một key, có comment đánh số và kích thước ảnh gợi ý (điện thoại trước, máy tính sau).

| Key | Khu vực |
|---|---|
| `seo` | Tiêu đề tab, mô tả Google, ảnh chia sẻ Facebook/Zalo |
| `brand` | Tên thương hiệu, vai trò |
| `nav` | Các mục menu |
| `header.cta` | Nút "Đặt lịch" trên header |
| `hero` | Màn hình đầu: ảnh ngang lớn, tên, câu nhấn, 2 nút |
| `about` | Giới thiệu: ảnh chân dung, 1–2 câu, số liệu, tiểu sử thu gọn |
| `services` | Thẻ dịch vụ |
| `videos` | Showreel và danh sách video |
| `gallery` | Ảnh, chia theo danh mục |
| `clients` | Dải logo đối tác |
| `contact` | Điện thoại, Zalo, email, mạng xã hội, form |
| `ctaBar` | Thanh nút nổi bám theo khi cuộn |
| `footer` | Chân trang (`{year}` tự thay bằng năm hiện tại) |
| `ui` | Chữ trên giao diện (nhãn nút, menu…) và tuỳ chọn hiển thị |

Quy ước:
- Đường dẫn ảnh/video viết dạng `public/images/...`, **không** có dấu `/` ở đầu.
- Còn dạng `[TEN_IN_HOA]` nghĩa là chưa điền. Link điện thoại/Zalo/email/mạng xã hội còn placeholder sẽ trỏ về mục Liên hệ thay vì tạo link hỏng.
- Muốn ẩn một dòng (VD Instagram), để chuỗi rỗng `""`.
- `contact.zalo` để `""` thì dùng luôn số `contact.phone`.
- `action` của nút nhận: `"zalo"`, `"phone"`, `"email"`, `"#id-khu-vuc"` hoặc một link `https://...`.

### Chỉnh số mục hiển thị trên điện thoại

Danh sách dài trên điện thoại chỉ hiện vài mục đầu, phần còn lại thu gọn sau nút "Xem thêm (N)". Nội dung thu gọn vẫn có sẵn trong HTML (tốt cho SEO), và khi tắt JavaScript thì hiện đầy đủ.

| Key | Mặc định | Ghi chú |
|---|---|---|
| `services.mobileVisible` | `3` | Từ màn hình 1024px trở lên luôn hiện đủ |
| `videos.mobileVisible` | `2` | Số video nhỏ hiện sẵn. Từ 1024px trở lên hiện đủ |
| `gallery.mobileVisible` | `6` | Áp dụng cho **mọi** kích thước màn hình, vì gallery thường có nhiều ảnh |
| `gallery.categories[i].mobileVisible` | — | Ghi đè riêng cho một danh mục |
| `about.bio` | — | Tiểu sử dài nằm trong ô "Đọc thêm" (`<details>`) |

Nhãn nút đổi được qua `moreLabel` / `lessLabel` của từng khu vực.

### Các key dành riêng cho bố cục điện thoại

| Key | Tác dụng |
|---|---|
| `*.mobileVisible` | Số mục hiện sẵn trước khi thu gọn |
| `*.moreLabel`, `*.lessLabel` | Chữ trên nút "Xem thêm" / "Thu gọn" |
| `hero.image.mobile`, `hero.image.desktop` | Ảnh riêng cho điện thoại (3:2) và máy tính (16:7) |
| `hero.background` | Ảnh nghệ thuật mờ phía sau hero (không bắt buộc) |
| `about.summary`, `about.bio` | Câu ngắn luôn hiện, tiểu sử dài thu gọn |
| `about.highlights` | 3 con số nổi bật |
| `gallery.categories` | Mỗi danh mục là một khu vực riêng có nút "Xem thêm ảnh" |
| `ctaBar` | Thanh nút nổi (Gọi, Zalo, Đặt lịch) |
| `ui.imageHints` | `true` thì khung ảnh chưa có sẽ ghi tên file cần thêm. Đặt `false` trước khi đưa web lên nếu vẫn còn thiếu ảnh |

### Thêm ảnh Gallery nhanh

Đầu `site.config.js` có hàm `album()`:

```js
images: album("public/images/gallery/dam-cuoi/dam-cuoi", 12, "Khoảnh khắc đám cưới"),
// → dam-cuoi-01.webp … dam-cuoi-12.webp
```

Chép ảnh vào thư mục, đặt tên theo số thứ tự, rồi sửa con số. Muốn thêm danh mục mới thì chép thêm một khối `{ id, title, summary, images }`.

## 3. Ảnh cần chuẩn bị

Ưu tiên `.webp`, tên kebab-case có số thứ tự. Bản riêng cho điện thoại thêm đuôi `-m`.

| File | Điện thoại | Máy tính |
|---|---|---|
| `public/images/hero/hero-01-m.webp` | 1080×720 (3:2) | — |
| `public/images/hero/hero-01.webp` | — | 2400×1050 (16:7) |
| `public/images/about/about-01.webp` | 1080×1350 (4:5) | dùng chung |
| `public/images/videos/showreel-01.webp` | 1280×720 (16:9) | dùng chung |
| `public/images/videos/video-01…04.webp` | 1280×720 (16:9) | dùng chung |
| `public/images/gallery/<danh-muc>/<danh-muc>-01.webp` | cạnh dài 1600–2000 (xem phóng to) | dùng chung |
| `…/<danh-muc>-01-m.webp` (không bắt buộc, khai báo `thumb`) | 600×750 (4:5, ô lưới) | dùng chung |
| `public/images/clients/client-01…06.svg` | logo nền trong suốt, cao 80px | dùng chung |
| `public/images/background/…` (không bắt buộc) | 1080×1920 | 2560×1440 |
| `public/images/og/og-image.png` | 1200×630 (đã có bản mẫu) | — |

Video có thể dùng mã YouTube (`youtube: "AbC123xYz"`) hoặc file tự lưu (`src: "public/videos/showreel.mp4"`). Video chỉ tải khi khách bấm Play. Có mã YouTube mà chưa có poster thì trang tự lấy ảnh bìa của YouTube.

## 4. Form liên hệ

- Có link nhận form (VD [Formspree](https://formspree.io): `https://formspree.io/f/xxxx`): điền vào `contact.form.action`. Form sẽ gửi thẳng, không rời trang.
- Chưa có link: nút Gửi soạn sẵn một email tới `contact.email`. Nếu chưa có email, nút sẽ chép nội dung rồi mở Zalo.

## 5. Đưa lên GitHub Pages

1. Đẩy code lên nhánh `main`.
2. Vào **Settings → Pages → Source**, chọn **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` sẽ tự chạy `npm install` → `npm run build` → đưa `dist/` lên Pages.
4. Điền `seo.siteUrl` (VD `https://ten-ban.github.io/mc-portfolio/`) để có link canonical và ảnh chia sẻ chuẩn.

Trang dùng đường dẫn tương đối nên chạy được cả trên tên miền riêng lẫn đường dẫn `/ten-repo/`. Nếu dùng hosting khác (Netlify, Vercel, Cloudflare Pages), chỉ cần lệnh build `npm run build` và thư mục xuất bản `dist`.

## 6. Cấu trúc thư mục

```
site.config.js          DỮ LIỆU — chỉ cần sửa file này
index.html              KHUNG HTML (template)
src/templates.js        Bộ render: config → HTML
src/input.css           CSS nguồn Tailwind v4 (màu, font trong @theme)
src/js/main.js          JS trình duyệt: menu, thu gọn, lightbox, vuốt, video, CTA nổi, form
public/                 Ảnh, icon, video
scripts/build.mjs       Build ra dist/
scripts/dev.mjs         Server xem thử
dist/                   Tự sinh — KHÔNG sửa tay
```

## 7. Giao diện

- Thiết kế cho màn hình 390px trước, sau đó mở rộng lên tablet và máy tính.
- Màu và font khai báo một lần trong `@theme` của `src/input.css`: nền kem sáng, chữ tím than đậm, điểm nhấn hồng–tím–cam kèm các mảng pastel. Font Montserrat.
- Hiệu ứng: hiện dần khi cuộn, nút có ánh sáng lướt và gợn sóng khi chạm, chữ nhấn đổi màu nhẹ, nền hero chuyển động chậm, dải logo chạy ngang. Tất cả tự tắt khi máy bật "giảm chuyển động".
