-- Trang chính sách / hỗ trợ khách hàng (cột "HỖ TRỢ KHÁCH HÀNG" ở footer).
-- Nội dung seed dưới đây là BẢN NHÁP, chủ shop phải đọc lại và sửa cho đúng
-- thực tế vận hành trước khi coi là điều khoản chính thức.

create table if not exists public.policy_pages (
  id text primary key,
  title text not null,
  slug text not null unique,
  body text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.policy_pages is
  'Các trang tĩnh chính sách/hỗ trợ, hiện ở cột HỖ TRỢ KHÁCH HÀNG trong footer';
comment on column public.policy_pages.body is
  'Nội dung dạng HTML (rich text từ admin), render qua sanitizeArticleHtml';
comment on column public.policy_pages.meta_title is
  'SEO title override; rỗng = dùng title. KHÔNG gõ tên shop, layout tự thêm qua title.template';
comment on column public.policy_pages.meta_description is
  'SEO meta description; rỗng = derive từ text thuần của body';
comment on column public.policy_pages.sort_order is
  'Thứ tự hiển thị trong footer, nhỏ hơn nằm trên';

create index if not exists idx_policy_pages_slug on public.policy_pages (slug);
create index if not exists idx_policy_pages_sort_order
  on public.policy_pages (sort_order);

alter table public.policy_pages enable row level security;

create policy "anon_select_published_policy_pages"
  on public.policy_pages for select
  to anon
  using (is_published = true);

create policy "authenticated_all_policy_pages"
  on public.policy_pages for all
  to authenticated
  using (true)
  with check (true);

-- Seed 8 trang theo ảnh yêu cầu của khách. Dùng on conflict do nothing để
-- chạy lại migration không ghi đè nội dung chủ shop đã sửa.
insert into public.policy_pages (id, title, slug, body, sort_order) values
(
  'policy-huong-dan-mua-hang',
  'Hướng dẫn mua hàng',
  'huong-dan-mua-hang',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Cách 1: Gọi điện hoặc nhắn Zalo</h2><p>Đây là cách nhanh nhất. Quý khách gọi hotline hoặc nhắn Zalo, nhân viên sẽ tư vấn model phù hợp với nhu cầu và ngân sách, báo giá chính xác tại thời điểm mua và chốt đơn ngay.</p><h2>Cách 2: Đặt hàng trên website</h2><ol><li>Tìm sản phẩm bằng thanh tìm kiếm hoặc chọn theo danh mục.</li><li>Mở trang sản phẩm, đọc kỹ thông số kỹ thuật và mô tả.</li><li>Bấm <strong>Gọi ngay</strong> hoặc <strong>Nhận báo giá Zalo</strong> để liên hệ chốt đơn.</li></ol><h2>Thông tin cần cung cấp khi đặt hàng</h2><ul><li>Tên sản phẩm và model.</li><li>Số lượng.</li><li>Họ tên, số điện thoại người nhận.</li><li>Địa chỉ nhận hàng đầy đủ.</li><li>Yêu cầu riêng nếu có (xuất hóa đơn, giao giờ hành chính…).</li></ul><h2>Lưu ý về giá</h2><p>Giá niêm yết trên website có thể được điều chỉnh theo thời điểm và chương trình khuyến mãi. Quý khách vui lòng liên hệ để được báo giá chính xác nhất.</p>',
  1
),
(
  'policy-chinh-sach-mua-hang',
  'Chính sách mua hàng',
  'chinh-sach-mua-hang',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Phạm vi áp dụng</h2><p>Chính sách này áp dụng cho mọi đơn hàng đặt qua website, hotline và Zalo của chúng tôi.</p><h2>Xác nhận đơn hàng</h2><p>Sau khi quý khách để lại thông tin, nhân viên sẽ liên hệ lại trong giờ làm việc để xác nhận model, số lượng, giá và địa chỉ giao hàng. Đơn hàng chỉ được coi là đã chốt sau khi hai bên xác nhận qua điện thoại hoặc Zalo.</p><h2>Giá bán</h2><ul><li>Giá trên website là giá tham khảo tại thời điểm hiển thị.</li><li>Giá có thể thay đổi theo tỷ giá, chi phí nhập khẩu và chương trình khuyến mãi.</li><li>Giá cuối cùng là giá được nhân viên xác nhận khi chốt đơn.</li></ul><h2>Hóa đơn</h2><p>Chúng tôi xuất hóa đơn theo quy định. Quý khách có nhu cầu xuất hóa đơn vui lòng cung cấp thông tin đơn vị ngay khi đặt hàng.</p><h2>Trường hợp hết hàng</h2><p>Nếu sản phẩm hết hàng sau khi quý khách đã đặt, chúng tôi sẽ thông báo ngay và đề xuất model tương đương hoặc hoàn lại toàn bộ khoản đã thanh toán.</p>',
  2
),
(
  'policy-chinh-sach-thanh-toan',
  'Chính sách thanh toán',
  'chinh-sach-thanh-toan',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Các hình thức thanh toán</h2><ul><li><strong>Thanh toán khi nhận hàng (COD):</strong> quý khách kiểm tra hàng rồi thanh toán trực tiếp cho nhân viên giao hàng.</li><li><strong>Chuyển khoản ngân hàng:</strong> áp dụng cho đơn hàng giá trị lớn hoặc giao xa. Thông tin tài khoản do nhân viên cung cấp khi chốt đơn.</li><li><strong>Thanh toán tại cửa hàng:</strong> quý khách đến trực tiếp xem máy và thanh toán.</li></ul><h2>Đặt cọc</h2><p>Với đơn hàng số lượng lớn, hàng đặt riêng hoặc giao đi tỉnh xa, chúng tôi có thể đề nghị đặt cọc một phần giá trị đơn hàng. Mức cọc được thống nhất trước khi chốt đơn.</p><h2>Lưu ý quan trọng</h2><ul><li>Chỉ chuyển khoản vào tài khoản do nhân viên chính thức cung cấp.</li><li>Giữ lại biên lai chuyển khoản để đối chiếu khi cần.</li><li>Vui lòng gọi hotline xác nhận nếu nhận được yêu cầu chuyển tiền từ số lạ.</li></ul>',
  3
),
(
  'policy-chinh-sach-giao-hang',
  'Chính sách giao hàng',
  'chinh-sach-giao-hang',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Phạm vi giao hàng</h2><p>Chúng tôi giao hàng toàn quốc thông qua đội xe của cửa hàng và các đơn vị vận chuyển đối tác.</p><h2>Thời gian giao hàng</h2><ul><li><strong>Nội thành TP. Hồ Chí Minh:</strong> thường trong ngày hoặc ngày làm việc kế tiếp.</li><li><strong>Các tỉnh thành khác:</strong> thường từ 2 đến 5 ngày làm việc tùy khu vực.</li></ul><p>Thời gian trên là dự kiến, có thể thay đổi do thời tiết, dịp lễ hoặc lịch trình của đơn vị vận chuyển.</p><h2>Phí giao hàng</h2><p>Phí giao hàng được báo rõ khi chốt đơn, phụ thuộc khối lượng, kích thước máy và khoảng cách. Một số khu vực và mức giá trị đơn hàng được miễn phí giao hàng.</p><h2>Kiểm tra hàng khi nhận</h2><p>Quý khách vui lòng kiểm tra ngoại quan thùng hàng và sản phẩm trước khi thanh toán. Nếu phát hiện hư hỏng do vận chuyển, vui lòng từ chối nhận hoặc chụp ảnh và thông báo ngay cho chúng tôi.</p>',
  4
),
(
  'policy-chinh-sach-doi-tra',
  'Chính sách đổi trả',
  'chinh-sach-doi-tra',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Trường hợp được đổi trả</h2><ul><li>Sản phẩm giao sai model, sai số lượng so với đơn đã xác nhận.</li><li>Sản phẩm bị hư hỏng, móp méo do quá trình vận chuyển.</li><li>Sản phẩm có lỗi kỹ thuật từ nhà sản xuất, không hoạt động đúng thông số.</li></ul><h2>Điều kiện đổi trả</h2><ul><li>Thông báo cho chúng tôi trong thời hạn được ghi trên phiếu bảo hành hoặc thỏa thuận khi mua.</li><li>Sản phẩm còn đầy đủ hộp, phụ kiện, phiếu bảo hành và tem niêm phong.</li><li>Sản phẩm chưa bị can thiệp, tự sửa chữa hoặc hư hỏng do sử dụng sai hướng dẫn.</li></ul><h2>Trường hợp không áp dụng đổi trả</h2><ul><li>Hư hỏng do sử dụng sai hướng dẫn, quá tải, thiếu bảo dưỡng.</li><li>Sản phẩm đã qua sửa chữa ở nơi khác.</li><li>Hao mòn tự nhiên của vật tư tiêu hao.</li></ul><h2>Quy trình</h2><ol><li>Liên hệ hotline hoặc Zalo, cung cấp thông tin đơn hàng và ảnh hoặc video hiện trạng.</li><li>Nhân viên kỹ thuật xác nhận nguyên nhân.</li><li>Hai bên thống nhất phương án đổi máy, sửa chữa hoặc hoàn tiền.</li></ol>',
  5
),
(
  'policy-chinh-sach-bao-hanh',
  'Chính sách bảo hành',
  'chinh-sach-bao-hanh',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Thời hạn bảo hành</h2><p>Thời hạn bảo hành của từng sản phẩm được ghi rõ trên trang sản phẩm và trên phiếu bảo hành đi kèm. Bảo hành theo tiêu chuẩn của nhà sản xuất.</p><h2>Phạm vi bảo hành</h2><p>Bảo hành áp dụng cho các lỗi kỹ thuật phát sinh từ nhà sản xuất trong điều kiện sử dụng và bảo dưỡng bình thường.</p><h2>Không thuộc phạm vi bảo hành</h2><ul><li>Hư hỏng do sử dụng sai hướng dẫn, vận hành quá công suất cho phép.</li><li>Hư hỏng do nguồn điện không ổn định, thiếu nước, chạy khô.</li><li>Hư hỏng do rơi, va đập, ngập nước, cháy nổ, thiên tai.</li><li>Sản phẩm đã tự tháo, tự sửa hoặc sửa tại nơi không được ủy quyền.</li><li>Tem bảo hành bị xóa, sửa hoặc không còn nguyên vẹn.</li><li>Vật tư tiêu hao và phụ kiện hao mòn tự nhiên.</li></ul><h2>Quy trình bảo hành</h2><ol><li>Liên hệ hotline hoặc Zalo, mô tả hiện tượng lỗi.</li><li>Kỹ thuật hướng dẫn kiểm tra sơ bộ từ xa; nhiều trường hợp xử lý được ngay.</li><li>Nếu cần mang máy về, chúng tôi hướng dẫn cách gửi hoặc hẹn thời gian nhận máy.</li><li>Thông báo kết quả và thời gian hoàn thành cho quý khách.</li></ol><h2>Hỗ trợ sau bảo hành</h2><p>Hết thời hạn bảo hành, chúng tôi vẫn nhận sửa chữa và cung cấp phụ tùng thay thế, tính phí theo thực tế.</p>',
  6
),
(
  'policy-chinh-sach-bao-mat',
  'Chính sách bảo mật',
  'chinh-sach-bao-mat',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Thông tin chúng tôi thu thập</h2><p>Chúng tôi chỉ thu thập những thông tin cần thiết để xử lý đơn hàng và hỗ trợ quý khách: họ tên, số điện thoại, địa chỉ nhận hàng, email nếu có, và nội dung yêu cầu tư vấn.</p><h2>Mục đích sử dụng</h2><ul><li>Liên hệ xác nhận và giao đơn hàng.</li><li>Hỗ trợ kỹ thuật, xử lý bảo hành và đổi trả.</li><li>Thông báo chương trình khuyến mãi khi quý khách đồng ý nhận.</li></ul><h2>Chia sẻ thông tin</h2><p>Chúng tôi không bán, không cho thuê và không trao đổi thông tin khách hàng với bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ với đơn vị vận chuyển ở mức tối thiểu cần thiết để giao hàng, hoặc khi có yêu cầu hợp pháp từ cơ quan chức năng.</p><h2>Lưu trữ và bảo mật</h2><p>Thông tin được lưu trên hệ thống có kiểm soát truy cập. Chỉ nhân viên có nhiệm vụ liên quan mới được xem thông tin đơn hàng.</p><h2>Quyền của khách hàng</h2><p>Quý khách có quyền yêu cầu xem, sửa hoặc xóa thông tin cá nhân của mình bằng cách liên hệ hotline hoặc email của cửa hàng.</p><h2>Cookie và số liệu truy cập</h2><p>Website sử dụng cookie và công cụ thống kê truy cập để cải thiện trải nghiệm. Quý khách có thể tắt cookie trong trình duyệt, một số tính năng có thể hoạt động không đầy đủ.</p>',
  7
),
(
  'policy-dieu-khoan-su-dung',
  'Điều khoản sử dụng',
  'dieu-khoan-su-dung',
  '<p><em>Bản nháp — chủ shop vui lòng kiểm tra và cập nhật lại nội dung.</em></p><h2>Chấp nhận điều khoản</h2><p>Khi truy cập và sử dụng website này, quý khách đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng website.</p><h2>Thông tin trên website</h2><p>Chúng tôi cố gắng cập nhật thông tin sản phẩm, thông số kỹ thuật và giá bán chính xác nhất. Tuy nhiên có thể xuất hiện sai sót trong quá trình nhập liệu. Thông tin và giá cuối cùng là thông tin được nhân viên xác nhận khi chốt đơn.</p><h2>Quyền sở hữu nội dung</h2><p>Toàn bộ hình ảnh, bài viết và nội dung do chúng tôi tạo ra trên website thuộc quyền sở hữu của cửa hàng. Vui lòng không sao chép sử dụng cho mục đích thương mại khi chưa được đồng ý. Logo và hình ảnh sản phẩm của các hãng thuộc quyền sở hữu của hãng tương ứng.</p><h2>Trách nhiệm của khách hàng</h2><ul><li>Cung cấp thông tin liên hệ và địa chỉ chính xác.</li><li>Không sử dụng website để thực hiện hành vi vi phạm pháp luật.</li><li>Đọc kỹ hướng dẫn sử dụng trước khi vận hành thiết bị.</li></ul><h2>Giới hạn trách nhiệm</h2><p>Chúng tôi không chịu trách nhiệm với thiệt hại phát sinh từ việc sử dụng thiết bị sai hướng dẫn hoặc sai mục đích thiết kế của nhà sản xuất.</p><h2>Thay đổi điều khoản</h2><p>Chúng tôi có thể cập nhật điều khoản này khi cần. Bản mới có hiệu lực kể từ khi được đăng trên website.</p>',
  8
)
on conflict (id) do nothing;
