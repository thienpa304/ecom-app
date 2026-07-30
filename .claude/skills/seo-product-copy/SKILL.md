---
name: seo-product-copy
description: Write or rewrite Vietnamese on-page SEO copy (meta title, meta description, product description opening, image alt) for products, categories and brands in this repo. Use when asked to improve SEO text, fix meta tags, write product descriptions for search, or audit existing SEO copy. Contains the shop's data model, verified Google rules, and hard constraints that must not be violated.
---

# Viết SEO copy cho Điện Máy Lộc Phát Đạt

Shop bán máy xịt rửa cao áp, máy rửa xe, máy nén khí tại 855 Quốc Lộ 1A,
Phường Bình Hưng Hòa, TP Hồ Chí Minh. Hotline 0778 668 399.
Không có giỏ hàng, không thanh toán online — khách gọi điện hoặc chat Zalo để chốt.
Thị trường: Việt Nam, tiếng Việt, phần lớn truy cập bằng điện thoại.

## Ràng buộc cứng — vi phạm là sai, không phải "tuỳ khẩu vị"

1. **KHÔNG gõ tên shop vào Meta title.** `apps/web/src/app/layout.tsx` có
   `title.template = "%s | ${siteName}"` nên hệ thống tự thêm. Gõ thêm sẽ ra
   `... | Điện Máy Lộc Phát Đạt | Điện Máy Lộc Phát Đạt`. Google ghi rõ
   "redundant branding" là một lý do khiến nó **viết lại title của bạn**.
2. **KHÔNG bịa thông số.** Chỉ dùng số có thật trong cột `specs`, `price`,
   `sale_price`, `warranty`, `origin`, `motor`, `sold_count` của sản phẩm đó.
   Không có dữ liệu thì không nhắc tới.
3. **KHÔNG bịa thông tin hãng** (năm thành lập, nước sản xuất, nhà phân phối
   độc quyền) nếu cột `origin` không ghi. Sai sự thật trên trang bán hàng là
   rủi ro pháp lý và uy tín thật.
4. **KHÔNG hứa chính sách** (miễn phí giao hàng, đổi trả 30 ngày, bảo hành
   toàn quốc) trừ khi `site_settings.shipping_policy` / `return_policy` có ghi.
5. **KHÔNG viết HOA toàn bộ.** Google có thể viết lại, và đọc như đang hét.
6. **Chủ shop chưa đăng ký doanh nghiệp** — không dùng từ "công ty", không
   nhắc mã số thuế / giấy phép kinh doanh.

## Nguyên tắc từ tài liệu Google (đã kiểm chứng, không phải folklore)

Nguồn: Google Search Central — *Title links* và *Snippets*.

- **Không có giới hạn ký tự cứng.** Google cắt theo bề rộng thiết bị. Con số
  ~60 (title) và ~155 (description) là kinh nghiệm thực dụng để tránh bị cắt
  trên mobile, không phải quy định.
- Mỗi trang phải có title **riêng biệt**. Title giống nhau giữa các trang cùng
  loại ("micro-boilerplate") là lý do Google viết lại.
- Meta description **không phải yếu tố xếp hạng**, nhưng quyết định người ta
  có bấm hay không. Nên chứa dữ liệu cụ thể (giá, thông số) — Google khuyến
  khích cả việc sinh tự động từ database.
- Google **tự viết snippet khác** nếu thấy nội dung trang mô tả chính xác hơn
  meta description bạn viết.
- Tránh: liệt kê từ khoá không có ngữ cảnh, mô tả trùng lặp, câu chung chung
  không liên quan nội dung thật, mô tả quá ngắn.

## Công thức

### Meta title (~50–60 ký tự)
```
<Loại sản phẩm> <Hãng> <Model> <1 thông số quyết định mua> <chính hãng|giá tốt>
```
Chọn **một** thông số mà người mua ngành này thật sự so sánh: áp lực (Bar),
công suất (kW), lưu lượng (lít/phút), dung tích bình (lít). Không nhồi cả 3.

Ví dụ đạt: `Máy xịt rửa cao áp DEKO DK-X35A 3.5kW 300 Bar chính hãng`

### Meta description (~150–160 ký tự)
```
<Tên + model>, <2–3 thông số>, <1 điểm tiện dụng>. Bảo hành <x>. Gọi <hotline>.
```
Phải là **câu hoàn chỉnh**. Lỗi hay gặp nhất trong repo này: copy 155 ký tự
đầu của phần mô tả rồi để câu bị cắt giữa dòng.

### Mở đầu phần mô tả — 3 câu, quan trọng nhất cả trang
- **Câu 1:** model này dành cho ai (gia đình / hộ kinh doanh / gara / xưởng).
- **Câu 2:** thông số chính giải quyết công việc gì cụ thể.
- **Câu 3:** xử lý một **lo lắng thật khi mua**.

Câu 3 là chỗ ăn điểm. Ví dụ có thật lấy từ `specs`:
- `Điện áp = 220V – 50Hz (1 pha)` → "lắp được ở mặt bằng thuê, không phải kéo
  điện 3 pha" — nỗi lo thật của người mở tiệm rửa xe.
- `Khả năng tự hút nước = Có` → "hút trực tiếp từ thùng, không cần bồn trên cao".
- `Thiết kế = Xe đẩy + rulo cuốn dây` → "không phải cuộn dây bằng tay sau mỗi ca".

Đừng viết câu 3 chung chung kiểu "chất lượng cao, giá tốt, uy tín".

### Alt ảnh
Mỗi ảnh mô tả **góc chụp hoặc bối cảnh khác nhau**. Không lặp y tên sản phẩm
ở cả 5 ảnh — lặp thì không thêm ngữ cảnh nào cho Google Images.

## Model có 2 cách viết
Nhiều sản phẩm có `name` và `model` lệch nhau (ví dụ tên ghi `DK-X35A`, cột
model ghi `DK-X35`). Khách gõ cả hai. Nhắc **cả hai** trong phần mô tả, dạng
`DK-X35A (còn gọi DK-X35)`, để trang khớp cả 2 truy vấn.

## Từ khoá SEO (`seo_keywords`)
Google **bỏ qua meta keywords từ 2009**. Không mất công tối ưu ô này.

## Chiến lược từ khoá cho shop này
Domain mới, ít backlink, chưa có Google Business Profile.

- **Đừng nhắm** từ khoá đầu ("máy xịt rửa cao áp", "máy nén khí") — top 10 là
  các site lớn nhiều năm tuổi.
- **Nhắm được ngay:** tên model cụ thể (`DEKO DK-X35 giá bao nhiêu`) — cạnh
  tranh thấp, người tìm đang sắp mua. Mỗi trang sản phẩm nhắm đúng 1 model.
- **Nhắm được:** long-tail theo nhu cầu (`máy rửa xe cho gara 30 xe/ngày`).
- **Local** (`máy xịt rửa Bình Tân`) thắng bằng Google Business Profile, không
  bằng on-page.
- **Một trang nhắm một keyword.** Hai trang cùng nhắm một từ sẽ cắn nhau.

## Nơi lưu trong hệ thống

| Nội dung | Bảng.cột | Sửa ở đâu trong admin |
|---|---|---|
| Meta title | `products.meta_title` | Sản phẩm → Sửa |
| Meta description | `products.meta_description` | Sản phẩm → Sửa |
| Mô tả (HTML rich text) | `products.description` | Sản phẩm → Sửa |
| Alt ảnh | `product_media.alt` | Sản phẩm → Media |
| Mô tả thương hiệu | `brands.description` | Thương hiệu → Sửa |
| FAQ, chính sách, giờ mở cửa | `site_settings` | Cấu hình cửa hàng |

Web đọc các cột này qua `packages/shared/src/mappers.ts` và render ở
`apps/web/src/app/san-pham/[slug]/page.tsx`. `meta_title` rỗng thì fallback về
`product.name`; `meta_description` rỗng thì fallback về text thuần của
`description`.

## Cách tự kiểm sau khi sửa
```
curl -s https://dienmaylocphatdat.vn/san-pham/<slug> | grep -o '<title>[^<]*'
curl -s https://dienmaylocphatdat.vn/san-pham/<slug> | grep -o 'name="description" content="[^"]*'
```
Kiểm: title không lặp tên shop, độ dài hợp lý, description là câu hoàn chỉnh.
ISR revalidate 60s nên đợi khoảng 1 phút sau khi lưu.
