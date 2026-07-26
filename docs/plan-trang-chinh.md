# Plan chỉnh sửa Trang chính

Nguồn: `docs/TRANG CHINH.docx` (10 ảnh mẫu + chú thích). Chốt ngày 2026-07-26.

> **Trạng thái: ĐÃ CODE XONG (26/07/2026).** Build web + admin đều pass.
> **Còn 1 việc thủ công:** chạy `supabase/migrations/20260726120000_home_layout.sql`
> trong Supabase SQL Editor. Chưa chạy thì web vẫn hoạt động bình thường
> (mọi field mới fallback rỗng), nhưng bấm **Lưu cấu hình** trong admin sẽ báo lỗi
> thiếu cột.

**Quyết định đã chốt**
- Section danh mục trang chủ: **tự động** render theo danh mục đang có sản phẩm (không làm bảng cấu hình).
- Footer: **giữ nền trắng**, chỉ đổi bố cục.
- Link social / fanpage / map: làm ô nhập trong admin, **để trống → tự ẩn**.

---

## 1. Header — `apps/web/src/components/Header.tsx`

| Yêu cầu | Việc làm |
|---|---|
| Logo | Thay text `siteName` bằng `<Image>` từ `site_settings.logo_url` (bản ngang); fallback về text nếu trống. Footer dùng `logo_square_url`, trống thì không hiện. |
| "Danh sách sản phẩm" có icon 3 gạch + mũi tên | Component `CategoryMenu.tsx` mới: desktop = dropdown hover/click, mobile = drawer. Đổ danh mục thật từ `getCategories()`. |
| Đổi chữ nút gọi | `Gọi {phone}` → `Tư vấn và đặt hàng 0778.668.399` (label lấy từ `site_settings.header_cta_label`, mặc định "Tư vấn và đặt hàng"). |
| Thanh tìm | Giữ nguyên `SearchForm.tsx`. |

`layout.tsx` phải truyền thêm `categories` + `logoUrl` xuống `Header`.

## 2. Hero — `apps/web/src/app/page.tsx` + `HeroSlider.tsx` (mới)

- **Cột phải**: slider **5 ảnh**, auto-advance **5s**, loop vô hạn, rộng/dài như mẫu.
  - Client component, dot indicator, pause khi hover/focus, tôn trọng `prefers-reduced-motion`.
  - Ảnh đầu `priority` (LCP), các ảnh sau lazy.
  - Nguồn: `site_settings.hero_slides` (jsonb `[{url, alt, href}]`). Nếu rỗng → fallback về `hero_image_url` hiện tại.
- **Cột trái** (chữ nhỏ lại, layout theo ảnh mẫu):
  - Tiêu đề có cụm chữ **xanh** highlight → `hero_title` + `hero_highlight`.
  - Gạch ngang cam dưới tiêu đề.
  - **4 bullet, mỗi bullet 1 icon tròn** + phần in đậm + phần thường → `hero_bullets` (jsonb `[{icon, bold, text}]`).
  - 2 nút CTA giữ nguyên.
- Toàn bộ admin sửa được (đúng yêu cầu trong docx).

## 3. Thân trang chủ — `apps/web/src/app/page.tsx`

Thứ tự section:

1. **TOP MÁY XỊT RỬA CAO ÁP BÁN CHẠY** — banner **đỏ** đúng mẫu, 4 sản phẩm (sort `sold_desc`).
2. **Sản phẩm nổi bật** — **rút từ 8 xuống 4** ảnh nằm ngang.
3. **Section theo từng danh mục** — lặp qua danh mục có sản phẩm (hiện là 4: Máy Xịt Rửa, Máy rửa xe gia đình, Máy rửa xe bánh xe đẩy, Máy xịt rửa công nghiệp).
   - Mỗi section: tiêu đề in hoa + chip danh mục con (nếu có) + "Xem tất cả" + lưới **4 sản phẩm**.
   - Component `CategorySection.tsx` mới; data gom trong 1 lượt query rồi group theo `category_id` (tránh N+1).
   - Danh mục mới anh thêm trong admin → tự lên trang chủ.
4. **VIDEO REVIEW SẢN PHẨM** — grid video lấy từ `product_media.kind IN ('video','embed')`; ẩn cả section nếu chưa có video nào.

## 4. Product card — `apps/web/src/components/ProductCard.tsx`

> Lưu ý: card dùng chung nên đổi ở đây áp dụng cho cả `/san-pham`.

- Ảnh **vuông** `aspect-square` + `object-contain` (nền trắng) → thấy trọn sản phẩm.
- **Bỏ** dòng thương hiệu màu cam (`DEKO`) — gỡ luôn prop `brandName` ở các nơi gọi.
- Model: chỉ `Model: DEKO DK-X35A`, **bỏ** phần `· 220V – 50Hz (1 pha)` (gỡ `specEntries`).
- Nút `Liên hệ` → **`Xem thêm`**.

## 5. Footer — `apps/web/src/components/Footer.tsx` (nền trắng, 3 cột)

- **Cột trái**: logo → `Điện máy Lộc Phát Đạt` → 📍 địa chỉ → ☎ SĐT → ✉ mail (mỗi dòng 1 icon như ảnh mẫu).
- **Cột giữa**: "Liên kết / Trang chủ / Danh mục sản phẩm" **giữ nguyên**; phần trống bên dưới thêm **4 icon to xếp 2×2** — hàng trên **Facebook + YouTube**, hàng dưới **TikTok + Zalo**, mỗi icon có link. Icon nào chưa có link thì ẩn.
- **Cột phải**: **Fanpage Facebook** (iframe page plugin) + **Google Maps** (iframe). Trống → ẩn.
- Dòng copyright giữ nguyên.

## 6. Nút nổi — `apps/web/src/components/ContactFab.tsx`

- Nút tròn xanh hiện tại → **logo Zalo chính chủ** (SVG/PNG thật, không phải icon vẽ tay). Nút gọi cam giữ nguyên.

## 7. DB + Shared + Admin

**Migration mới** `supabase/migrations/2026072x_home_layout.sql` — thêm cột vào `site_settings`:

| Cột | Kiểu | Dùng cho |
|---|---|---|
| `logo_url` | text | Header (logo ngang `docs/logo/logo-horizontal.jpg`) |
| `logo_square_url` | text | Footer + favicon + ảnh OG (logo vuông `docs/logo/logo-square.jpg`) |
| `header_cta_label` | text | Nút "Tư vấn và đặt hàng" |
| `hero_slides` | jsonb `[]` | Slider 5 ảnh |
| `hero_highlight` | text | Cụm chữ xanh trong tiêu đề hero |
| `hero_bullets` | jsonb `[]` | 4 bullet hero |
| `facebook_url` / `youtube_url` / `tiktok_url` | text | Icon social footer |
| `fanpage_embed_url` | text | Fanpage FB cột phải |
| `map_embed_url` | text | Google Maps cột phải |

**`packages/shared`**: cập nhật `types.ts`, `schemas.ts` (zod cho slides/bullets), `mappers.ts` (2 chiều), `constants.ts` (default).

**`apps/admin`**:
- `SettingsForm.tsx` thêm 4 nhóm: **Logo & Header**, **Hero slider** (chọn nhiều ảnh từ Media Library, kéo sắp xếp, xóa), **Nội dung hero** (highlight + 4 bullet thêm/xóa), **Mạng xã hội & Nhúng**.
- `lib/actions/settings.ts` parse các field mới (jsonb qua hidden input JSON).

**`next.config.ts`**: thêm remotePattern nếu logo/slide dùng host ngoài Supabase.

---

## Khác so với plan ban đầu

- **Video review**: sản phẩm chưa có ảnh poster riêng thì tự lấy thumbnail YouTube
  (`i.ytimg.com` đã được thêm vào `next.config.ts`).
- **"Sản phẩm nổi bật"** lấy 4 sản phẩm bán chạy **tiếp theo** sau nhóm TOP, để hai
  kệ không trùng sản phẩm.
- Chữ đè lên ảnh poster (`heroCardTitle` / `heroCardCaption`) không còn hiển thị vì
  đã thay bằng slider; giá trị cũ vẫn được giữ trong DB.
- Thêm màu `brand` (navy #1e3a6e) vào `tailwind.config.ts` cho tiêu đề section và
  icon hero.

## Thứ tự thi công

1. ✅ Migration + `packages/shared` (types/schemas/mappers/constants)
2. ✅ Admin `SettingsForm` + action settings
3. ✅ Header (logo, menu danh mục, nút CTA)
4. ✅ Hero slider + block chữ trái
5. ✅ ProductCard (vuông, bỏ brand, model gọn, "Xem thêm")
6. ✅ Các section thân trang chủ (TOP đỏ → nổi bật 4 → danh mục → video)
7. ✅ Footer + ContactFab (logo Zalo)
8. ✅ Build + kiểm tra responsive mobile/desktop

## Việc anh cần làm sau khi deploy

- Vào **Media** upload logo + 5 ảnh banner slider.
- Vào **Cấu hình cửa hàng** chọn logo, chọn 5 ảnh slider, nhập 4 bullet hero, dán link FB/YouTube/TikTok/Zalo + fanpage + Google Maps.
- Nếu muốn có mục *Máy nén khí / Máy phát điện / Phụ kiện máy rửa xe / CN 1 pha / CN 3 pha* trên trang chủ → tạo danh mục đó trong admin và gán sản phẩm; section sẽ tự xuất hiện.
