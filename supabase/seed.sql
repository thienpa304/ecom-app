-- Sample data matching packages/shared/src/seed.ts

truncate table public.leads, public.product_media, public.products, public.brands, public.categories restart identity cascade;

insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('cat-may-xit-rua', 'Máy Xịt Rửa Áp Lực', 'may-xit-rua-ap-luc', null, 1),
  ('cat-gia-dinh', 'Máy xịt rửa gia đình', 'may-xit-rua-gia-dinh', 'cat-may-xit-rua', 1),
  ('cat-cong-nghiep', 'Máy xịt rửa công nghiệp', 'may-xit-rua-cong-nghiep', 'cat-may-xit-rua', 2),
  ('cat-phu-kien', 'Phụ kiện máy xịt rửa', 'phu-kien-may-xit-rua', 'cat-may-xit-rua', 3);

insert into public.brands (id, name, slug) values
  ('brand-dekton', 'Dekton', 'dekton'),
  ('brand-bosch', 'Bosch', 'bosch'),
  ('brand-karcher', 'Kärcher', 'karcher');

insert into public.products (
  id, name, slug, model, brand_id, category_id,
  price, sale_price, stock_status, sold_count,
  warranty, origin, motor, specs, is_published, description
) values
(
  'prod-dekton-dk-1400',
  'Máy xịt rửa áp lực Dekton DK-1400',
  'may-xit-rua-dekton-dk-1400',
  'DK-1400',
  'brand-dekton',
  'cat-gia-dinh',
  1890000, 1490000, 'in_stock', 1286,
  '12 tháng', 'Trung Quốc', 'Induction 1400W',
  '{"Công suất":"1400W","Áp lực":"100 bar","Lưu lượng":"6.5 L/phút","Điện áp":"220V-50Hz","Trọng lượng":"5.2 kg"}'::jsonb,
  true,
  'Máy xịt rửa áp lực Dekton DK-1400 phù hợp vệ sinh xe máy, sân nhà, ban công. Motor cảm ứng bền, vận hành êm.'
),
(
  'prod-dekton-dk-1800',
  'Máy xịt rửa áp lực Dekton DK-1800',
  'may-xit-rua-dekton-dk-1800',
  'DK-1800',
  'brand-dekton',
  'cat-gia-dinh',
  2490000, 1990000, 'in_stock', 942,
  '12 tháng', 'Trung Quốc', 'Induction 1800W',
  '{"Công suất":"1800W","Áp lực":"120 bar","Lưu lượng":"7.2 L/phút","Điện áp":"220V-50Hz","Trọng lượng":"6.8 kg"}'::jsonb,
  true,
  'Dekton DK-1800 công suất cao hơn, rửa xe ô tô và sân vườn hiệu quả, kèm đầu phun đa chế độ.'
),
(
  'prod-dekton-dk-2200',
  'Máy xịt rửa áp lực Dekton DK-2200',
  'may-xit-rua-dekton-dk-2200',
  'DK-2200',
  'brand-dekton',
  'cat-gia-dinh',
  3290000, 2690000, 'in_stock', 715,
  '18 tháng', 'Trung Quốc', 'Induction 2200W',
  '{"Công suất":"2200W","Áp lực":"140 bar","Lưu lượng":"8.0 L/phút","Dây cao áp":"8 m","Trọng lượng":"8.5 kg"}'::jsonb,
  true,
  'DK-2200 dòng gia đình cao cấp, áp lực mạnh, dây dài tiện di chuyển quanh nhà.'
),
(
  'prod-dekton-dk-3000',
  'Máy xịt rửa áp lực Dekton DK-3000 Pro',
  'may-xit-rua-dekton-dk-3000-pro',
  'DK-3000',
  'brand-dekton',
  'cat-cong-nghiep',
  5490000, 4790000, 'in_stock', 318,
  '24 tháng', 'Trung Quốc', 'Induction 3000W',
  '{"Công suất":"3000W","Áp lực":"180 bar","Lưu lượng":"10 L/phút","Dây cao áp":"10 m","Trọng lượng":"14 kg"}'::jsonb,
  true,
  'Dekton DK-3000 Pro dành cho gara, quán rửa xe nhỏ — áp lực cao, motor công nghiệp.'
),
(
  'prod-dekton-dk-3500',
  'Máy xịt rửa áp lực Dekton DK-3500',
  'may-xit-rua-dekton-dk-3500',
  'DK-3500',
  'brand-dekton',
  'cat-cong-nghiep',
  7890000, 6990000, 'in_stock', 156,
  '24 tháng', 'Trung Quốc', 'Induction 3500W',
  '{"Công suất":"3500W","Áp lực":"200 bar","Lưu lượng":"12 L/phút","Dây cao áp":"15 m","Trọng lượng":"22 kg"}'::jsonb,
  true,
  'DK-3500 công suất lớn cho tiệm rửa xe, vệ sinh nhà xưởng nhẹ.'
),
(
  'prod-dekton-dk-mini',
  'Máy xịt rửa cầm tay Dekton Mini DK-M20',
  'may-xit-rua-dekton-mini-dk-m20',
  'DK-M20',
  'brand-dekton',
  'cat-gia-dinh',
  890000, 690000, 'in_stock', 2104,
  '6 tháng', 'Trung Quốc', 'Brushless 20V',
  '{"Pin":"20V 2.0Ah","Áp lực":"25 bar","Dung tích bình":"0.5 L","Trọng lượng":"1.1 kg"}'::jsonb,
  true,
  'Máy xịt cầm tay pin sạc Dekton Mini — rửa xe máy, kính, ban công không cần ổ điện.'
),
(
  'prod-bosch-aquatak-110',
  'Máy xịt rửa Bosch EasyAquatak 110',
  'may-xit-rua-bosch-easyaquatak-110',
  'EasyAquatak 110',
  'brand-bosch',
  'cat-gia-dinh',
  3150000, 2790000, 'in_stock', 534,
  '12 tháng', 'Đức / lắp ráp Trung Quốc', '1300W',
  '{"Công suất":"1300W","Áp lực":"110 bar","Lưu lượng":"330 L/giờ","Dây cao áp":"5 m","Trọng lượng":"4.6 kg"}'::jsonb,
  true,
  'Bosch EasyAquatak 110 gọn nhẹ, thương hiệu Đức tin cậy cho hộ gia đình.'
),
(
  'prod-bosch-aquatak-150',
  'Máy xịt rửa Bosch UniversalAquatak 150',
  'may-xit-rua-bosch-universalaquatak-150',
  'UniversalAquatak 150',
  'brand-bosch',
  'cat-gia-dinh',
  5990000, 5290000, 'in_stock', 289,
  '24 tháng', 'Đức / lắp ráp Trung Quốc', '2100W',
  '{"Công suất":"2100W","Áp lực":"150 bar","Lưu lượng":"480 L/giờ","Dây cao áp":"8 m","Trọng lượng":"9.3 kg"}'::jsonb,
  true,
  'UniversalAquatak 150 áp lực mạnh, phù hợp rửa xe SUV và sân rộng.'
),
(
  'prod-karcher-k2',
  'Máy xịt rửa Kärcher K2 Compact',
  'may-xit-rua-karcher-k2-compact',
  'K2 Compact',
  'brand-karcher',
  'cat-gia-dinh',
  2890000, 2450000, 'in_stock', 876,
  '12 tháng', 'Đức', '1400W',
  '{"Công suất":"1400W","Áp lực":"110 bar","Lưu lượng":"360 L/giờ","Dây cao áp":"4 m","Trọng lượng":"4.0 kg"}'::jsonb,
  true,
  'Kärcher K2 Compact siêu gọn, lý tưởng căn hộ / nhà phố nhỏ.'
),
(
  'prod-karcher-k5',
  'Máy xịt rửa Kärcher K5 Premium',
  'may-xit-rua-karcher-k5-premium',
  'K5 Premium',
  'brand-karcher',
  'cat-cong-nghiep',
  12990000, 11490000, 'in_stock', 97,
  '24 tháng', 'Đức', '2100W',
  '{"Công suất":"2100W","Áp lực":"145 bar","Lưu lượng":"500 L/giờ","Dây cao áp":"10 m","Trọng lượng":"13.6 kg"}'::jsonb,
  true,
  'Kärcher K5 Premium dòng cao cấp, điều chỉnh áp lực thông minh, bền bỉ.'
),
(
  'prod-dekton-dk-2500',
  'Máy xịt rửa áp lực Dekton DK-2500',
  'may-xit-rua-dekton-dk-2500',
  'DK-2500',
  'brand-dekton',
  'cat-cong-nghiep',
  4290000, null, 'out_of_stock', 421,
  '18 tháng', 'Trung Quốc', 'Induction 2500W',
  '{"Công suất":"2500W","Áp lực":"160 bar","Lưu lượng":"9 L/phút","Dây cao áp":"10 m"}'::jsonb,
  true,
  'DK-2500 tạm hết hàng — đặt trước để nhận khi về kho.'
),
(
  'prod-dekton-dk-legacy',
  'Máy xịt rửa Dekton DK-1000 (ngừng SX)',
  'may-xit-rua-dekton-dk-1000',
  'DK-1000',
  'brand-dekton',
  'cat-gia-dinh',
  1290000, null, 'discontinued', 3200,
  'Hết bảo hành hãng', 'Trung Quốc', '1000W',
  '{"Công suất":"1000W","Áp lực":"80 bar","Lưu lượng":"5.5 L/phút"}'::jsonb,
  false,
  'Model cũ đã ngừng sản xuất — chỉ hiển thị nội bộ admin.'
),
(
  'prod-acc-sung-phun',
  'Súng phun áp lực Dekton chuẩn nhanh',
  'sung-phun-ap-luc-dekton',
  'ACC-GUN-01',
  'brand-dekton',
  'cat-phu-kien',
  320000, 259000, 'in_stock', 1840,
  '3 tháng', 'Trung Quốc', null,
  '{"Chuẩn khớp":"Quick connect","Chất liệu":"Nhựa ABS + đồng","Áp lực tối đa":"200 bar"}'::jsonb,
  true,
  'Súng phun thay thế / nâng cấp cho máy xịt Dekton và tương thích.'
),
(
  'prod-acc-day-cao-ap',
  'Dây cao áp 10m chuẩn Kärcher / Dekton',
  'day-cao-ap-10m',
  'ACC-HOSE-10',
  'brand-dekton',
  'cat-phu-kien',
  450000, 379000, 'in_stock', 1120,
  '6 tháng', 'Trung Quốc', null,
  '{"Chiều dài":"10 m","Áp lực tối đa":"250 bar","Đầu nối":"M22 / Quick"}'::jsonb,
  true,
  'Dây cao áp gia cố, chống xoắn, dùng cho máy gia đình và bán công nghiệp.'
),
(
  'prod-acc-voi-xoay',
  'Đầu phun xoay 360° Bosch / đa năng',
  'dau-phun-xoay-360',
  'ACC-NOZZLE-360',
  'brand-bosch',
  'cat-phu-kien',
  280000, 199000, 'in_stock', 965,
  '3 tháng', 'Trung Quốc', null,
  '{"Góc xoay":"360°","Chất liệu":"Đồng + thép không gỉ","Tương thích":"Bosch, Dekton, Kärcher (adapter)"}'::jsonb,
  true,
  'Đầu phun xoay làm sạch khe gạch, bánh xe hiệu quả hơn đầu thẳng.'
);

insert into public.product_media (id, product_id, kind, url, alt, sort_order, storage_path, poster_url) values
  ('prod-dekton-dk-1400-media-0', 'prod-dekton-dk-1400', 'image', 'https://picsum.photos/seed/prod-dekton-dk-1400-0/800/800', 'Dekton DK-1400 mặt trước', 0, null, null),
  ('prod-dekton-dk-1400-media-1', 'prod-dekton-dk-1400', 'image', 'https://picsum.photos/seed/prod-dekton-dk-1400-1/800/800', 'Dekton DK-1400 phụ kiện', 1, null, null),
  ('prod-dekton-dk-1800-media-0', 'prod-dekton-dk-1800', 'image', 'https://picsum.photos/seed/prod-dekton-dk-1800-0/800/800', 'Dekton DK-1800', 0, null, null),
  ('prod-dekton-dk-1800-media-1', 'prod-dekton-dk-1800', 'image', 'https://picsum.photos/seed/prod-dekton-dk-1800-1/800/800', 'Dekton DK-1800 đang sử dụng', 1, null, null),
  ('prod-dekton-dk-2200-media-0', 'prod-dekton-dk-2200', 'image', 'https://picsum.photos/seed/prod-dekton-dk-2200-0/800/800', 'Dekton DK-2200', 0, null, null),
  ('prod-dekton-dk-3000-media-0', 'prod-dekton-dk-3000', 'image', 'https://picsum.photos/seed/prod-dekton-dk-3000-0/800/800', 'Dekton DK-3000 Pro', 0, null, null),
  ('prod-dekton-dk-3000-media-1', 'prod-dekton-dk-3000', 'image', 'https://picsum.photos/seed/prod-dekton-dk-3000-1/800/800', 'Dekton DK-3000 chi tiết', 1, null, null),
  ('prod-dekton-dk-3500-media-0', 'prod-dekton-dk-3500', 'image', 'https://picsum.photos/seed/prod-dekton-dk-3500-0/800/800', 'Dekton DK-3500', 0, null, null),
  ('prod-dekton-dk-mini-media-0', 'prod-dekton-dk-mini', 'image', 'https://picsum.photos/seed/prod-dekton-dk-mini-0/800/800', 'Dekton Mini DK-M20', 0, null, null),
  ('prod-bosch-aquatak-110-media-0', 'prod-bosch-aquatak-110', 'image', 'https://picsum.photos/seed/prod-bosch-aquatak-110-0/800/800', 'Bosch EasyAquatak 110', 0, null, null),
  ('prod-bosch-aquatak-110-media-1', 'prod-bosch-aquatak-110', 'image', 'https://picsum.photos/seed/prod-bosch-aquatak-110-1/800/800', 'Bosch EasyAquatak 110 hộp', 1, null, null),
  ('prod-bosch-aquatak-150-media-0', 'prod-bosch-aquatak-150', 'image', 'https://picsum.photos/seed/prod-bosch-aquatak-150-0/800/800', 'Bosch UniversalAquatak 150', 0, null, null),
  ('prod-karcher-k2-media-0', 'prod-karcher-k2', 'image', 'https://picsum.photos/seed/prod-karcher-k2-0/800/800', 'Kärcher K2 Compact', 0, null, null),
  ('prod-karcher-k2-media-1', 'prod-karcher-k2', 'image', 'https://picsum.photos/seed/prod-karcher-k2-1/800/800', 'Kärcher K2 đang xịt', 1, null, null),
  ('prod-karcher-k5-media-0', 'prod-karcher-k5', 'image', 'https://picsum.photos/seed/prod-karcher-k5-0/800/800', 'Kärcher K5 Premium', 0, null, null),
  ('prod-dekton-dk-2500-media-0', 'prod-dekton-dk-2500', 'image', 'https://picsum.photos/seed/prod-dekton-dk-2500-0/800/800', 'Dekton DK-2500', 0, null, null),
  ('prod-dekton-dk-legacy-media-0', 'prod-dekton-dk-legacy', 'image', 'https://picsum.photos/seed/prod-dekton-dk-legacy-0/800/800', 'Dekton DK-1000', 0, null, null),
  ('prod-acc-sung-phun-media-0', 'prod-acc-sung-phun', 'image', 'https://picsum.photos/seed/prod-acc-sung-phun-0/800/800', 'Súng phun Dekton', 0, null, null),
  ('prod-acc-day-cao-ap-media-0', 'prod-acc-day-cao-ap', 'image', 'https://picsum.photos/seed/prod-acc-day-cao-ap-0/800/800', 'Dây cao áp 10m', 0, null, null),
  ('prod-acc-voi-xoay-media-0', 'prod-acc-voi-xoay', 'image', 'https://picsum.photos/seed/prod-acc-voi-xoay-0/800/800', 'Đầu phun xoay 360', 0, null, null);

insert into public.leads (id, product_id, name, phone, note, created_at) values
  ('lead-001', 'prod-dekton-dk-1800', 'Nguyễn Văn An', '0901234567', 'Muốn tư vấn máy rửa xe máy + sân nhà', '2026-07-18T09:30:00.000Z'),
  ('lead-002', 'prod-karcher-k5', 'Trần Thị Bình', '0918765432', 'Hỏi bảo hành và giao hàng HCM', '2026-07-19T14:15:00.000Z');
