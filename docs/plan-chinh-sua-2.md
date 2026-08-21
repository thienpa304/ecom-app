# Plan chỉnh sửa đợt 2 — Điện Máy Lộc Phát Đạt

Nguồn: `docs/chinh sua 2/` (admin.docx, trang chinh.docx, Tren đt.docx) + `docs/2aOboQs4on5k0eOuFUyWRWGgvJDAdBv8N0y3W8e0.jpg`

Tiếp nối `docs/plan-trang-chinh.md` (đợt 1, đã xong 26/07/2026).

Tổng: **23 yêu cầu**, chia **6 nhóm** chạy song song được (trừ nhóm 0 phải làm trước).

---

## TRẠNG THÁI (cập nhật 2026-08-18)

**Đã code xong 22/23 yêu cầu.** `pnpm build` cả web + admin đều pass. Smoke test 7 route đều 200.

| Nhóm | Trạng thái |
|---|---|
| 0 — Breadcrumb + SectionCard + AccordionItem + CollapsibleContent | ✅ xong |
| 1 — Trang SP: bố cục cột (#1 #2 #3 #18) | ✅ xong |
| 2 — Trang SP: nội dung (#4 #5 #6 #7 #8) | ✅ xong (#4 vốn đã đúng, không cần sửa) |
| 3 — Header / breadcrumb / spacing / đổi tên (#9 #10 #11 #12 #17 #21) | ✅ xong |
| 4 — Homepage mobile + Footer + Vì sao (#14 #15 #19 #20) | ✅ xong |
| 4.4 — Footer cột "HỖ TRỢ KHÁCH HÀNG" (#16) | ✅ code xong theo **phương án A** — ⚠️ còn 1 việc tay: chạy migration |
| 5 — Search ra cả video (#13) | ✅ xong |
| 6 — Admin sửa/sắp xếp danh mục + lọc (#22 #23) | ✅ xong |

**Mặc định đã áp dụng** (khách không chốt nên dùng mặc định trong bảng Q1–Q10):
- Q1: giữ nguyên URL `/cam-nang`, chỉ đổi chữ hiển thị → không mất SEO.
- Q2: nav dùng "Kiến thức", tiêu đề trang + footer dùng tên đầy đủ.
- Q4: video trang SP giữ tỉ lệ ngang 16:9 (giống ảnh demo khách gửi).
- Q5: 3 nút hero chỉ ẩn trên mobile (`hidden lg:block`), desktop giữ.
- Q6: "Xem tất cả" ở mục Sản phẩm đã xem trỏ `/san-pham`.
- Q7: video trong kết quả tìm kiếm nằm dưới lưới sản phẩm, trên phân trang.
- Q8: ↑↓ danh mục swap trong cùng cấp, bảng hiện dạng cây.
- Q9: lọc theo giá chỉ áp cho Sản phẩm.
- Q10: thông số kỹ thuật vốn đã hiện full → không sửa.

**File mới tạo:** `Breadcrumb.tsx`, `SectionCard.tsx`, `AccordionItem.tsx`, `CollapsibleContent.tsx`, `WhyChooseUs.tsx` (đều trong `apps/web/src/components/`).

### ⚠️ VIỆC THỦ CÔNG CÒN LẠI

Chạy `supabase/migrations/20260821090000_policy_pages.sql` trong **Supabase SQL Editor**
(giống quy trình đã làm với `20260726120000_home_layout.sql` ở đợt 1).

Chưa chạy thì:
- Web vẫn hoạt động bình thường, footer **tự ẩn** cột "Hỗ trợ khách hàng", `/chinh-sach/*` trả 404 (đã test).
- Trang admin **Trang chính sách** hiện cảnh báo "chưa có bảng" kèm tên file migration.

Sau khi chạy: 8 trang chính sách xuất hiện ngay ở footer trên mọi trang.

**⚠️ Nội dung 8 trang là BẢN NHÁP do AI viết** — chủ shop **phải đọc lại và sửa**
cho đúng thực tế vận hành trước khi coi là điều khoản chính thức. Mỗi trang đang
mở đầu bằng dòng in nghiêng "Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại
nội dung." Xoá dòng đó sau khi đã rà soát.

---

## Nhóm 0 — Nền tảng (làm TRƯỚC, các nhóm khác phụ thuộc)

Không phải yêu cầu của khách, nhưng bắt buộc vì code hiện tại duplicate ở 5 chỗ.

### 0.1 Tách component `<Breadcrumb>`
**Vấn đề:** breadcrumb đang copy-paste inline `<nav>` ở 5 file, không có component chung.

- `apps/web/src/app/san-pham/[slug]/page.tsx:156-180`
- `apps/web/src/app/danh-muc/[slug]/page.tsx:157-170`
- `apps/web/src/app/thuong-hieu/[slug]/page.tsx:159+`
- `apps/web/src/app/cam-nang/page.tsx:71-80`
- `apps/web/src/app/cam-nang/[slug]/page.tsx:116-129`

**Việc:** tạo `apps/web/src/components/Breadcrumb.tsx` nhận `items: {name, href?}[]`, thay thế cả 5 chỗ. Component này sẽ gánh luôn YC #11 (thu nhỏ + rút gọn) và #17 (ẩn trên mobile).

> Lưu ý: mảng `crumbs` ở `san-pham/[slug]/page.tsx:136-148` hiện chỉ dùng cho JSON-LD, không dùng render → sau khi tách thì dùng chung một nguồn.

### 0.2 Tách component `<SectionCard>`
**Vấn đề:** shell `mt-6 min-w-0 rounded-lg border border-gray-200 bg-white sm:mt-8` + `<h2 className="border-b border-gray-100 px-4 py-3 text-base font-bold uppercase text-gray-900">` lặp nguyên văn ở 6 nơi:

`page.tsx:257` (specs), `page.tsx:309` (mô tả), `StorePolicies.tsx:13`, `FaqSection.tsx:10`, `RelatedProducts.tsx:12`, `RecentlyViewed.tsx:64`

**Việc:** tạo `apps/web/src/components/SectionCard.tsx` với props `{ title, action?, collapsible?, defaultOpen?, children }`.
`action` = slot bên phải cho "Xem tất cả →" (YC #7). `collapsible` = accordion (YC #6).
Cái này giải quyết một lượt YC #6, #7, #9.
Sửa luôn bug nhỏ: `FaqSection.tsx:11` thiếu `uppercase` so với các section khác.

---

## Nhóm 1 — Trang sản phẩm: bố cục cột (YC #1, #2, #3, #18)

**File:** `apps/web/src/app/san-pham/[slug]/page.tsx`, `StoreCommitments.tsx`, `LeadForm.tsx`

### 1.1 (YC #1) Bỏ form "Để lại số điện thoại"
- Xóa block `page.tsx:248-253` (`<div id="lien-he">` + `<LeadForm />`) và import.
- `LeadForm.tsx` giữ file lại hay xóa? → **Khuyến nghị giữ**, vì bảng `leads` + trang admin Leads vẫn tồn tại. Nếu bỏ hẳn thì admin Leads thành trang chết. Chỉ gỡ khỏi trang SP.
- Kiểm tra: anchor `#lien-he` có được link tới từ đâu không → nếu có phải trỏ lại sang nút Gọi/Zalo.

### 1.2 (YC #2) Chuyển box CAM KẾT sang cột phải
Hiện tại:
```
page.tsx:182  grid lg:grid-cols-2
  ├ L183-186 cột trái:  <ProductGallery> + <StoreCommitments>
  └ L188-254 cột phải:  brand, h1, model, giá, note, badges, CTA, LeadForm
```
Sau khi sửa:
```
  ├ cột trái:  <ProductGallery>          (giữ nguyên aspect-square, size không đổi)
  └ cột phải:  brand, h1, model, giá, note, badges, CTA, <StoreCommitments>
```
- Di chuyển `<StoreCommitments />` từ L185 → cuối cột phải (sau `<ProductContactCta>`).
- Bỏ `mt-4` trong `StoreCommitments.tsx:16` (cột phải đã có `space-y-4 sm:space-y-5`).
- **Cân đối chiều cao:** thêm `lg:flex lg:flex-col` cho cột phải + `lg:mt-auto` cho `StoreCommitments` để nó tự đẩy xuống đáy, khớp mép dưới gallery. Không đụng vào gallery.

### 1.3 (YC #3) 3 dòng cam kết: bỏ UPPERCASE + nhỏ lại
`StoreCommitments.tsx`:
- L30: bỏ `uppercase`, đổi `text-sm` → `text-[13px]`, `font-semibold` → `font-medium`.
- L18-23 (heading): bỏ `uppercase`, `text-sm sm:text-base` → `text-sm`. Text nguồn đã là sentence case sẵn (`"Điện máy Lộc Phát Đạt cam kết"`) nên chỉ cần gỡ class CSS.
- Data L6-10 đã sentence case → không sửa.
- Icon L42 `h-5 w-5` → `h-4 w-4` cho cân với chữ nhỏ hơn.

### 1.4 (YC #18) Mobile: box cam kết xuống cuối, TRƯỚC thông số kỹ thuật
Sau 1.2, `StoreCommitments` nằm cuối cột phải → trên mobile (1 cột) nó tự động rơi xuống ngay trước section "Thông số kỹ thuật". **Xong luôn, không cần code thêm.**
Cần verify bằng screenshot mobile.

---

## Nhóm 2 — Trang sản phẩm: nội dung (YC #4, #5, #6, #7, #8)

### 2.1 (YC #4) Thông số kỹ thuật hiện full
`page.tsx:257-306` — **đã hiện full sẵn**, không truncate, không collapse, không `max-h`. **Không cần sửa.** Xác nhận lại với khách.

### 2.2 (YC #5) Mô tả sản phẩm: cắt + "Xem thêm"
`ProductDescription.tsx` hiện là server component render full, không có collapse.

**Cách làm** (kiểu CellphoneS như ảnh `image6.png`):
- Tạo `apps/web/src/components/CollapsibleContent.tsx` (`"use client"`):
  - Wrapper `max-h-[520px] overflow-hidden` + gradient fade `bg-gradient-to-t from-white` ở đáy khi đang thu.
  - Nút "Xem thêm ⌄" / "Thu gọn ⌃" căn giữa, style `text-accent font-semibold`.
  - Đo `scrollHeight` bằng `useRef` + `ResizeObserver`; content ngắn hơn ngưỡng thì **không render nút** (tránh nút vô nghĩa với sản phẩm mô tả ngắn).
- `ProductDescription.tsx` giữ nguyên server component (vì có `dangerouslySetInnerHTML` + `sanitizeProductHtml`), chỉ bọc output vào `<CollapsibleContent>`.
- **Không dùng `<details>`** ở đây vì cần fade gradient + đo chiều cao.

### 2.3 (YC #6) Chính sách + FAQ: accordion có mũi tên
- `FaqSection.tsx` — **đã là accordion `<details>/<summary>` collapsed sẵn** (L16-29, có caret `▼` + `group-open:rotate-180`). Không cần sửa logic, chỉ chuyển sang dùng `<SectionCard>`.
- `StorePolicies.tsx` — đang **luôn mở**. Chuyển 2 khối "Giao hàng" (L20-25) và "Đổi trả & bảo hành" (L30-35) thành `<details>` giống hệt pattern `FaqSection` (copy y nguyên class summary + caret để đồng bộ). Bỏ `sm:grid-cols-2`, chuyển thành list dọc `divide-y divide-gray-100`.

### 2.4 (YC #7) "Xem tất cả" bên phải
Dùng `action` slot của `<SectionCard>`, copy style từ `SectionHeading` của homepage (`app/page.tsx:252-258`): `text-sm font-semibold text-accent`, label `Xem tất cả →`.

- `RelatedProducts.tsx` → href = `/danh-muc/${category.slug}` (cần truyền thêm prop `category` từ `page.tsx:326`).
- `RecentlyViewed.tsx` → **chưa có route**. 2 lựa chọn:
  - **(a) Khuyến nghị:** href = `/san-pham` (rẻ, không tạo trang mới).
  - (b) Tạo route `/da-xem` đọc localStorage `lpd:recently-viewed` client-side. Tốn thêm 1 trang, SEO = noindex.
  → **Cần khách quyết.** Mặc định làm (a).

### 2.5 (YC #8) Thêm thanh video "REVIEW SẢN PHẨM" trước Sản phẩm liên quan
`VideoReviewSection.tsx` hiện **chỉ dùng ở homepage** (`app/page.tsx:170`), là server component nhận `products`.

**Việc:**
1. Trong `san-pham/[slug]/page.tsx`, gọi `listVideoProducts()` (`lib/data.ts:290`) — hoặc tốt hơn: viết `listVideoProductsByCategory(categorySlug, limit)` để video liên quan đúng ngành hàng.
2. Render `<SectionCard title="Video review sản phẩm">` + `<VideoReviewSection>` chèn vào **giữa L324 (`FaqSection`) và L326 (`RelatedProducts`)**.
3. Ảnh khách gửi (`image7.png`) cho thấy layout ngang giống homepage → **giữ nguyên card `aspect-video` hiện tại**, không đổi sang dọc, trừ khi khách muốn đúng tỉ lệ shorts 9:16.
   → **Cần khách xác nhận:** "shorts" = tỉ lệ dọc 9:16 hay chỉ là thanh video ngang như hiện tại? Ảnh demo là ngang.

> ⚠️ `listVideoProducts` (`data.ts:263-266`) query **toàn bộ** `product_media` không limit rồi mới dedupe → sẽ chậm dần khi data lớn. Nên thêm `.limit()` khi động vào file này.

---

## Nhóm 3 — Header / Breadcrumb / Spacing toàn site (YC #9, #10, #11, #12, #17, #21)

### 3.1 (YC #10) 2 thanh header thấp lại
`Header.tsx`:
| Chỗ | Line | Hiện tại | Đổi thành |
|---|---|---|---|
| Top bar padding | 30 | `py-2.5 sm:py-3` | `py-2 sm:py-2.5` |
| Logo | 39 | `h-9 sm:h-14` | `h-8 sm:h-11` |
| Search fallback | 53 | `h-10 sm:h-11` | `h-9 sm:h-10` |
| Nav bar padding | 83 | `py-2` | `py-1.5` |
| Nav item | 84, 94, 117 | `px-3 py-2 text-[15px]` | `px-2.5 py-1.5 text-sm` |
| Phone CTA | 62 | `min-h-11` | `min-h-10` |

Cũng phải chỉnh `SearchForm.tsx` (input height) cho khớp — kiểm tra `min-h-11` bên trong.

### 3.2 (YC #11 + #17) Breadcrumb: nhỏ, thấp, rút gọn, ẩn trên mobile
Trong `<Breadcrumb>` mới (nhóm 0.1):
- `text-xs sm:text-sm` → `text-xs` cố định; `mb-4`/`mb-3` → `mb-2.5`.
- **Ẩn mobile:** thêm `hidden sm:flex` (YC #17 — khách chỉ nói "trên đt").
- **Rút gọn 1 dòng:** bỏ `flex-wrap`, đổi thành `flex-nowrap` + `overflow-hidden`; item cuối `truncate`. Nếu số cấp > 3 thì thay các cấp giữa bằng `…`:
  `Trang chủ / … / Máy Phát Điện / Tên sản phẩm`
- JSON-LD (`breadcrumbJsonLd`, `lib/seo.ts:261`) **giữ nguyên đủ cấp** — chỉ rút gọn phần hiển thị, không đụng SEO.

### 3.3 (YC #12) "Cẩm nang" → "Kiến thức & Kinh nghiệm"
8 file, 15 chỗ:

| File | Line |
|---|---|
| `Header.tsx` | 118, 121 |
| `Footer.tsx` | 181, 182 |
| `app/cam-nang/page.tsx` | 12 (PATH), 13 (HEADLINE), 67, 79, 93 |
| `app/cam-nang/[slug]/page.tsx` | 65, 111, 124-125, 217 |
| `app/cam-nang/[slug]/not-found.tsx` | 18 |
| `components/PostCard.tsx` | 12 |
| `lib/seo.ts` | 224 |
| `app/sitemap.ts` | 70, 79 |

**❗ Quyết định cần khách xác nhận:** đổi **chữ hiển thị** hay đổi cả **URL `/cam-nang`**?
- **Khuyến nghị: chỉ đổi chữ hiển thị, GIỮ URL `/cam-nang`.** Đổi URL sẽ mất index Google của toàn bộ bài viết, phải làm 301 redirect trong `next.config`.
- Nếu khách vẫn muốn đổi URL → phải thêm redirect `/cam-nang/:path* → /kien-thuc/:path*` (permanent) + cập nhật sitemap.

Note: `Header.tsx:117-122` đang cho "Cẩm nang" style khác hẳn siblings (`text-accent font-bold`). Tên mới dài hơn → cân nhắc rút gọn nav thành **"Kiến thức"**, để tên đầy đủ ở tiêu đề trang, nếu không nav sẽ tràn.
→ **Cần khách quyết.**

### 3.4 (YC #9 + #21) Giảm khoảng trống giữa các section
**Trang chủ** (`app/page.tsx`):
| Chỗ | Line | Hiện tại | Đổi |
|---|---|---|---|
| Hero band | 116 | `py-10 sm:py-14` | `py-6 sm:py-10` |
| Shelf video | 165 | `py-8 sm:py-10` | `py-5 sm:py-7` |
| Shelf red_banner | 177 | `pt-8 sm:pt-10` (⚠️ thiếu pb) | `py-5 sm:py-7` |
| ProductShelf | 221 | `py-8 sm:py-10` | `py-5 sm:py-7` |
| SectionHeading | 239 | `mb-4 pb-2.5 sm:mb-5` | `mb-3 pb-2` |
| HeroIntro nội bộ | 38/50/53/59 | `mt-2/mt-3/mt-3/mt-4` | `mt-1.5/mt-2/mt-2/mt-3` |
| CTA block | 125 | `mt-6` | `mt-4` |

**Trang SP** (`san-pham/[slug]/page.tsx` + các component section):
- Wrapper L151: `py-6 sm:py-8` → `py-4 sm:py-6`.
- Grid L182: `gap-6 lg:gap-8` → `gap-5 lg:gap-7`.
- Sau khi có `<SectionCard>` (nhóm 0.2), gom margin về **một chỗ**: đổi wrapper thành `space-y-4 sm:space-y-6` và **xóa hết `mt-6 sm:mt-8` / `mt-8 sm:mt-10` trong 6 component**. Đây là lý do phải làm nhóm 0.2 trước.

**Footer** (`Footer.tsx`): grid L114 `gap-8 py-10` → `gap-6 py-7`; band tìm kiếm L288 `py-5` → `py-4`.

---

## Nhóm 4 — Homepage mobile + Footer + Section "Vì sao" (YC #14, #15, #16, #19, #20)

### 4.1 (YC #19) Mobile: banner lên trước
`app/page.tsx:116` — grid không có `order-*`, thứ tự = DOM order.
- Thêm `order-2 lg:order-1` cho cột trái (HeroIntro + CTA, L117).
- Thêm `order-1 lg:order-2` cho `<HeroSlider>` (L152-156).
- Fallback placeholder L155 đang `hidden lg:block` → giữ nguyên.

### 4.2 (YC #20) Bỏ 3 nút trên mobile
Khách nói **"Bỏ luôn 3 ô này"** — ảnh `Tren đt/image2.png`: "Xem tất cả sản phẩm", "Chat Zalo", "Gọi tư vấn ngay".
- Vị trí: `app/page.tsx:125-149` (block `mt-6 max-w-md space-y-3 lg:max-w-none`).
- **Chỉ bỏ trên mobile** hay bỏ hẳn desktop luôn? Doc chỉ nói mobile ("Tren đt.docx").
  → **Khuyến nghị: `hidden lg:block`** (giữ desktop). Trên mobile đã có `ContactFab` nổi Zalo/Gọi nên không mất chức năng.
  → **Cần khách xác nhận.**

### 4.3 (YC #14) Footer: hoán đổi "Liên kết" ↔ "Kết nối với chúng tôi"
`Footer.tsx` — 2 khối này là **sibling trong CÙNG một `<div>` cột 2**, không phải 2 cell riêng:
- "Liên kết" L168-185 (không có `mt-*`)
- "Danh mục" L187-205 (`mt-4`)
- "Thương hiệu" L207-225 (`mt-4`)
- "Kết nối với chúng tôi" L227-249 (`mt-6`)

**Việc:** đảo vị trí JSX của 2 khối, và đổi margin: khối lên đầu bỏ `mt-*`, khối xuống cuối nhận `mt-6`.

### 4.4 (YC #16) Footer: thêm cột "HỖ TRỢ KHÁCH HÀNG"
8 mục theo ảnh: Hướng dẫn mua hàng, Chính sách mua hàng, Chính sách thanh toán, Chính sách giao hàng, Chính sách đổi trả, Chính sách bảo hành, Chính sách bảo mật, Điều khoản sử dụng.

**❗ CHẶN — không có trang nào tồn tại.** Toàn bộ routes `chinh-sach-*`, `huong-dan-mua-hang`, `dieu-khoan`, `bao-mat` đều **chưa có** (đã kiểm tra toàn bộ `app/`). Nếu chỉ thêm link → 8 link 404, hại SEO nặng.

3 phương án:
| | Cách làm | Effort | Đánh giá |
|---|---|---|---|
| **A** ⭐ | Route động `/chinh-sach/[slug]` + bảng `policy_pages` (title, slug, content html) + trang admin quản lý | ~1 ngày | **Khuyến nghị.** Khách tự sửa nội dung, mở rộng được |
| B | 8 file `page.tsx` tĩnh, nội dung hardcode | ~3h | Nhanh, nhưng sửa nội dung phải deploy |
| C | Tận dụng `posts` (`cam-nang`) — tạo 8 bài rồi link tới | ~1h | Rẻ nhất nhưng URL `/cam-nang/chinh-sach-...` sai về mặt IA |

→ **Cần khách quyết + cần khách cấp nội dung 8 trang chính sách.**
Trong lúc chờ nội dung, có thể làm A với nội dung placeholder.

**Layout footer sau khi thêm:** `Footer.tsx:114-116` đang `lg:grid-cols-3` (khi có embed) / `lg:grid-cols-2`. Cần tách cột 2 ra:
```
Cột 1: Logo + blurb + liên hệ        (giữ nguyên L118-165)
Cột 2: DANH MỤC SẢN PHẨM              (tách từ L187-205)
Cột 3: HỖ TRỢ KHÁCH HÀNG              (MỚI)
Cột 4: THƯƠNG HIỆU (L207-225) + Liên kết + Kết nối
Cột 5 (nếu có embed): Fanpage + Map
```
→ `lg:grid-cols-4` / `lg:grid-cols-5`. Đúng như ảnh khách gửi (4 cột: LPD info / DANH MỤC SẢN PHẨM / HỖ TRỢ KHÁCH HÀNG / THƯƠNG HIỆU).

### 4.5 (YC #15) Section "VÌ SAO NÊN MUA TẠI ĐIỆN MÁY LỘC PHÁT ĐẠT"
**Chưa tồn tại gì tương tự** (đã grep: không có "Vì sao", "trust", "TrustBadge").

Tạo mới `apps/web/src/components/WhyChooseUs.tsx`, render trong `app/layout.tsx` ngay **trước `<Footer />`** (L95) để hiện trên **mọi trang** — đúng như ảnh ("Thêm cái này ở trước phần cuối").

Nội dung theo ảnh — 6 ô + 1 dải CTA:
| Ô | Tiêu đề | Mô tả | Icon |
|---|---|---|---|
| 1 | Hàng chính hãng | Sản phẩm 100% chính hãng, nguồn gốc rõ ràng | shield-check (xanh) |
| 2 | Giá cạnh tranh | Giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn | tag (cam) |
| 3 | Tư vấn chuyên nghiệp | Tư vấn đúng nhu cầu, đúng ngân sách | headset (xanh) |
| 4 | Bảo hành rõ ràng | Bảo hành chính hãng, hỗ trợ nhanh chóng | badge-check (cam) |
| 5 | Giao hàng toàn quốc | Giao hàng nhanh chóng, đóng gói an toàn | truck (xanh) |
| 6 | Hỗ trợ kỹ thuật | Hỗ trợ kỹ thuật trọn đời trong suốt quá trình sử dụng | tools (cam) |

Dải CTA dưới: icon phone + "CẦN TƯ VẤN CHỌN MÁY?" + mô tả + nút **GỌI NGAY 0778 668 399** (cam, `bg-accent`) + **NHẮN ZALO** (xanh, `bg-zalo`).

Layout: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, divider dọc `lg:divide-x`. CTA `flex-col sm:flex-row items-center justify-between`, `bg-gray-50` border-top.
Phone/Zalo lấy từ `settings` (đã có sẵn trong `layout.tsx`, đang truyền cho `Footer` và `ContactFab`).
Icon: inline SVG như các component khác trong repo (không thêm lib).
Tracking: gắn `trackEvent("contact_call"/"contact_zalo", { location: "why_us" })` như `ContactFab.tsx`.

> Cân nhắc: 3 chỗ CTA gọi/Zalo trên cùng 1 trang mobile (FAB + section này + ProductContactCta) hơi nhiều. Có thể ẩn dải CTA của section này trên mobile (`hidden sm:flex`) vì FAB đã cover.

---

## Nhóm 5 — Tìm kiếm ra cả video (YC #13)

**Hiện trạng:**
- `SearchForm.tsx` → điều hướng `/san-pham?q=...` (không phải server action).
- `api/search-suggest/route.ts` → chỉ `products`, `ilike` trên `name`/`model`, limit 6.
- `lib/data.ts:683` `buildSearchOr` → `ilike` trên `name`/`model`/`description`.
- **Không có bảng `videos` riêng.** Video là row trong `product_media` với `kind IN ('video','embed')`.

**Diễn giải yêu cầu:** gõ "X30A" → ra sản phẩm X30A **và** các video review của sản phẩm đó.

**Việc:**
1. `app/san-pham/page.tsx`: khi có `?q=`, chạy thêm query lấy video của các sản phẩm khớp.
   - Reuse `buildSearchOr` để lấy `product_id` khớp → join `product_media` where `kind IN ('video','embed')`.
   - Viết `listVideoProductsBySearch(q, limit)` trong `lib/data.ts` cạnh `listVideoProducts` (L259-300).
2. Render `<SectionCard title="Video review"><VideoReviewSection products={...} /></SectionCard>`.
   → **Cần khách quyết vị trí.** Khuyến nghị: dưới lưới sản phẩm, trên phân trang (không đẩy kết quả chính xuống).
3. `api/search-suggest/route.ts`: thêm cờ `hasVideo` vào từng item (đã select `product_media(*)` sẵn, chỉ cần check `kind`), hiện icon ▶ nhỏ trong dropdown gợi ý.
4. Không render gì nếu không có video khớp.

**Rủi ro:** `q` hiện chỉ `ilike` — "X30A" khớp được vì nằm trong `model`/`name`. Nhưng gõ có dấu / sai chính tả sẽ trượt. Muốn tìm kiếm thông minh hơn → cần migration thêm `tsvector` + GIN index. **Ngoài phạm vi đợt này**, chỉ ghi nhận.

---

## Nhóm 6 — Admin (YC #22, #23)

### 6.1 (YC #22) Danh mục: sửa tên + đổi thứ tự lên/xuống
**Hiện trạng:** `CategoriesManager.tsx` chỉ có **Thêm** + **Xóa**. Không có `updateCategory` / `reorderCategories` ở bất kỳ đâu trong repo. Xóa cũng thường fail vì `products.category_id` là `on delete restrict`.

**Có sẵn 2 template để copy y hệt:**
- **Sửa:** `apps/admin/components/BrandsManager.tsx` — `editing` state L38, `onEdit` L41-50, `onCancelEdit` L52-55, `onSubmit` phân nhánh L57-84, card title động L117, nút Lưu/Hủy L152-157, cột Thao tác `Space` L176-194.
- **Đổi thứ tự:** `apps/admin/components/HomeSectionsManager.tsx:156-175` — `onMove(id, direction: -1|1)` swap 2 id rồi post cả mảng. Store: `store.ts:665-683` `reorderHomeSections(ids)`. Action: `lib/actions/home-sections.ts:85-89`.

**Việc:**
1. `apps/admin/lib/store.ts`:
   - `updateCategory(id, input)` — copy pattern `updateHomeSection` (L624-650): `.update({name, slug, parent_id, sort_order}).eq("id", id).select("*").maybeSingle()`, return `null` nếu không có.
   - `reorderCategories(ids: string[])` — copy `reorderHomeSections` (L665-683).
2. `apps/admin/lib/actions/categories.ts`:
   - `updateCategoryAction(id, formData)` — `requireAdmin()` → `categoryInputSchema.safeParse` → `updateCategory` → `null` thì `throw new Error("Không tìm thấy danh mục")` → `revalidatePath("/categories")` + `revalidatePath("/")`.
   - `reorderCategoriesAction(ids)` — nhận mảng thẳng, không FormData (theo pattern home-sections).
3. `apps/admin/components/CategoriesManager.tsx`:
   - Thêm `editing` state, nút **Sửa** (`EditOutlined`) vào cột Thao tác.
   - Thêm 2 nút **↑ ↓** (`ArrowUpOutlined`/`ArrowDownOutlined`), disable ở đầu/cuối.
   - Form dùng chung cho create + edit, title động.

**⚠️ Bẫy phải xử lý:**
- **Cycle guard:** `Select` "Danh mục cha" (L104-113) hiện list **tất cả** categories → khi sửa, phải loại chính nó + toàn bộ con cháu, nếu không tạo vòng lặp cha-con làm chết `listCategoryNav()` bên web.
- **Đổi thứ tự trong cây phân cấp:** ↑↓ chỉ nên swap giữa **các anh em cùng `parent_id`**, không phải toàn bảng phẳng. Data hiện tại (ảnh `admin.docx/image1.png`) đang là `sort_order` phẳng 0,1,2,3,4,5 lẫn cha lẫn con → cần quyết:
  → **Khuyến nghị:** ↑↓ swap trong cùng cấp (group theo `parent_id`), và sắp bảng theo cây (cha → con thụt lề). Sạch hơn nhiều.
  → **Cần khách quyết.**
- Đổi `slug` sẽ **phá URL `/danh-muc/[slug]` đã được index**. Nên khóa field slug khi edit, hoặc cho sửa nhưng hiện warning.

### 6.2 (YC #23) Lọc/sắp xếp theo tên hoặc giá — Sản phẩm & Danh mục

**Sản phẩm** (`ProductsManager.tsx` L144-223 + `store.ts:134-179` `listProducts`):
- Hiện có: `q` (text), `brand`, `published`. Sắp xếp **hardcode** `.order("created_at", desc)` L147, không có tham số sort.
- **Việc:**
  - `listProducts` nhận thêm `sort?: "created_desc" | "name_asc" | "name_desc" | "price_asc" | "price_desc"`, map sang `.order(column, {ascending})`.
  - Cột giá: xác nhận tên (`price` / `sale_price`) — nếu sort theo giá bán thực thì cần `coalesce(sale_price, price)`, Supabase JS không hỗ trợ trực tiếp → hoặc tạo generated column, hoặc sort theo `price` và ghi rõ nhãn "Giá gốc".
  - `page.tsx` đọc `searchParams.sort`, `ProductsManager` thêm `<Select>` "Sắp xếp".
  - Thêm cả filter **Danh mục** — prop `categories` đã được truyền vào rồi nhưng chỉ dùng để hiện tên (L64-67), đang phí.
  - Thêm `sorter` cho cột Tên/Giá trong `<Table>` (L241-342) — phải là **server-side sorter** (`sortOrder` controlled + `onChange` → `pushQuery`), không dùng client sorter vì đang phân trang server (`.range()`).

**Danh mục** (`CategoriesManager.tsx` L125-157):
- Không có filter/sort gì. `pagination={false}`, dữ liệu ít.
- **Việc:** thêm `<Input.Search>` lọc theo tên (client-side, data đã có đủ trong props) + `sorter` client cho cột Tên và Thứ tự.
- **Lưu ý:** "theo giá" **không áp dụng** cho danh mục (categories không có giá). Yêu cầu gốc ghi *"lọc phân loại theo tên hoặc theo giá phần: Sản phẩm – danh mục"* → hiểu là: **Sản phẩm** lọc theo tên+giá, **Danh mục** lọc theo tên (+ thêm lọc sản phẩm theo danh mục).
  → **Cần khách xác nhận cách hiểu này.**

---

## Câu hỏi cần khách chốt trước khi code

| # | Câu hỏi | Mặc định nếu không trả lời |
|---|---|---|
| Q1 | "Cẩm nang" → đổi **chữ hiển thị** thôi hay đổi cả **URL `/cam-nang`**? | Chỉ đổi chữ, giữ URL (bảo toàn SEO) |
| Q2 | Nav bar dùng tên đầy đủ "Kiến thức & Kinh nghiệm" hay rút gọn "Kiến thức"? | Nav: "Kiến thức", trang: tên đầy đủ |
| Q3 | 8 trang chính sách: **động (admin sửa được)**, **tĩnh hardcode**, hay **tận dụng bài viết**? Ai cấp nội dung? | Động (`/chinh-sach/[slug]` + bảng + admin), nội dung placeholder chờ khách |
| Q4 | Thanh video trang SP: tỉ lệ **dọc 9:16 (shorts thật)** hay **ngang 16:9** như hiện tại? | Ngang 16:9 (giống ảnh demo khách gửi) |
| Q5 | 3 nút Hero: bỏ **chỉ trên mobile** hay bỏ **cả desktop**? | Chỉ mobile (`hidden lg:block`) |
| Q6 | "Xem tất cả" ở mục **Sản phẩm đã xem** trỏ đi đâu? | `/san-pham` |
| Q7 | Video trong kết quả tìm kiếm đặt **trên** hay **dưới** lưới sản phẩm? | Dưới lưới, trên phân trang |
| Q8 | Admin ↑↓ danh mục: swap **trong cùng cấp** hay **toàn bảng phẳng**? | Cùng cấp + hiện dạng cây |
| Q9 | Admin lọc "theo giá": chỉ áp cho Sản phẩm, đúng không? | Đúng — Danh mục chỉ lọc theo tên |
| Q10 | YC #4 "Thông số kỹ thuật hiện full" — hiện **đã full sẵn**. Khách thấy bị cắt ở đâu? | Không sửa gì |

---

## Thứ tự thực thi đề xuất

```
Bước 1 (tuần tự):  Nhóm 0        — Breadcrumb + SectionCard
                    ↓
Bước 2 (song song): Nhóm 1+2   Nhóm 3   Nhóm 4   Nhóm 5   Nhóm 6
                    (trang SP)  (header) (footer) (search) (admin)
                    ↓
Bước 3:            Verify — screenshot desktop 1440 + mobile 390, cả trang chủ & trang SP
                    ↓
Bước 4:            pnpm build + code-review + commit theo nhóm
```

- Nhóm 4 (footer) và phần spacing footer của Nhóm 3 đều đụng `Footer.tsx` → gộp spacing footer vào Nhóm 4.
- Nhóm 1 và Nhóm 2 đều đụng `san-pham/[slug]/page.tsx` → gộp làm 1 luồng.

**Ước lượng:** Nhóm 0 ~2h · Nhóm 1 ~2h · Nhóm 2 ~4h · Nhóm 3 ~3h · Nhóm 4 ~5h (chưa tính 8 trang chính sách) · Nhóm 5 ~3h · Nhóm 6 ~6h
