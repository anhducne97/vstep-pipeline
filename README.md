# Quy trình ngữ liệu VSTEP

Trang web một file giúp giáo viên soạn ngữ liệu và câu hỏi VSTEP (Đọc, Nghe) với AI theo QĐ 730/QĐ-BGDĐT: dán đầu vào, sao chép câu lệnh gửi AI, dán kết quả lại; trang tự kiểm số từ, mức từ vựng, Flesch Reading Ease, khẩu ngữ hoá, căn cứ câu hỏi và khuôn phương án nhiễu.

## Dùng trang
Mở đường dẫn GitHub Pages của repo (Settings → Pages). Mỗi lần mã trên nhánh `main` thay đổi, trang tự cập nhật sau khoảng 1–2 phút; người dùng chỉ cần tải lại trang. Phiên bản đang chạy ghi cạnh tiêu đề (ngày giờ build và mã commit).

Bài đang làm lưu trong trình duyệt của từng người (localStorage) và trong file `.json` khi bấm "Lưu · Mở · Bài mới". Trang không gửi dữ liệu đi đâu.

## Cấu trúc
- `src/page.html`: khung trang, CSS và các bước. Có ba chỗ giữ chỗ: `/*CORE*/`, `/*UI*/`, `/*BUILD*/`.
- `src/core.js`: đặc tả từng Part (SPEC), các câu lệnh gửi AI (P), các ô dữ liệu (SLOTS), hàm ghép câu lệnh.
- `src/vocab.js` + `src/lexdata.json`: đo từ vựng theo CEFR-J/Octanove, Flesch Reading Ease, khoảng Flesch theo mức.
- `src/ui.js`: giao diện, các bước kiểm, kế hoạch sửa "tất cả các dòng đỏ".
- `src/qstep.js`: bước 9 (câu hỏi), khẩu ngữ hoá, xuất Word, lưu/mở file.
- `src/checklist.js`: checklist có mã (NL cuối bước Chất liệu, CH cuối bước Câu hỏi), ghi chú thẩm định theo khuôn, câu lệnh sửa theo ghi chú (AI trả THAY/BẰNG), báo tiêu chí bị xấu đi sau khi sửa, nhập bình luận từ file Word. Thêm tiêu chí mới: thêm một dòng vào `CL_ROWS` (hướng dẫn ở đầu file); không đánh số lại mã cũ.
- `src/notify.js`: **Thông báo** (chuông ở trang Nhóm và đầu trang soạn bài): mời vào dự án, giao việc (gộp theo người), đến lượt, trả sửa, hoàn thiện, yêu cầu sửa ngữ liệu, bình luận (một thông báo mỗi chủ đề), câu trả lời hay, chủ đề mới của dự án. Bấm thông báo thì đi thẳng tới dự án, bài (đúng bước) hoặc bình luận. Collection `notifs`: người làm việc gửi, chỉ người nhận đọc; trang hỏi lại mỗi phút.
- `src/forum.js`: **Diễn đàn** trong trang Nhóm: chủ đề theo 5 loại (Hỏi đáp, Kinh nghiệm, Thông báo, Tài liệu, Góp ý trang), chủ đề cả nhóm hoặc riêng một dự án, bình luận, 6 cảm xúc, người hỏi chọn câu trả lời hay, quản trị ghim; đánh dấu chủ đề mới theo trình duyệt.
- `src/project.js`: trang **Nhóm** (toàn màn hình, cũng là trang mở đầu: phải đăng nhập mới vào trang soạn bài): Việc của tôi, Dự án (tạo, mời thành viên, tạo khung bài, bảng phân công nhiều bài, chia đều tự động, tiến độ), Hồ sơ cá nhân, Thành viên (quản trị đổi quyền, khoá tài khoản).
- `src/workflow.js`: quy trình nhiều người: 11 trạng thái theo 4 cổng, phân công 5 vai, chặn tự duyệt (trừ cổng 1 khi Điều phối kiêm soạn ngữ liệu; cổng 2 được nhắc xét lại), Phiếu duyệt nổi (nút góc dưới bên phải) cho cả 3 cổng: bài vẫn hiện bên trái khi duyệt, khoá ngữ liệu sau cổng 2 và yêu cầu sửa ngữ liệu, nhật ký, bản đồ chất liệu sinh từ bảng phân bố, thẩm định câu hỏi (làm bài ẩn đáp án, quyết định từng câu), hồ sơ thẩm định trong file Word, chế độ nhà phát triển.
- `build.py`: ghép tất cả thành `dist/index.html`.

## Sửa và đăng
1. Sửa file trong `src/`.
2. Kiểm trên máy (không bắt buộc): `python3 build.py` rồi mở `dist/index.html`.
3. Commit và push lên `main`. GitHub Actions (`.github/workflows/pages.yml`) tự ghép và đăng.

Thay đổi lớn nên làm trên nhánh riêng và mở pull request, xem lại rồi mới gộp vào `main`.

## Thư viện bài (Firebase)

- Nút **Thư viện** ở đầu trang: đăng nhập Google, lưu bài lên Firestore (project `hiu-vstep`), mở, nhân bản, xem lịch sử 20 bản gần nhất, đổi trạng thái, xoá, xuất cả thư viện ra file.
- Tự đăng ký: ai đăng nhập Google lần đầu thì trang tự tạo tài khoản (`staff/{email}`, vai `user`, kèm hồ sơ). Không cần ai thêm email trước.
- Quyền: `user` (Thành viên) chỉ đọc, sửa bài mình tạo và bài của dự án mình được mời; `editor` (Thành viên nội bộ) và `admin` (Quản trị) đọc, sửa cả thư viện; `blocked` bị khoá. Quản trị đổi quyền ở trang **Nhóm → Thành viên**. Tài khoản cũ đã có trước đây (không ghi vai, hoặc vai editor) vẫn là Thành viên nội bộ.
- Bài thuộc dự án có trường `prj` (id dự án) và `team` (Điều phối và thành viên dự án); luật bảo mật dựa vào `team` để cho người trong dự án đọc bài. Điều phối mời, bỏ thành viên thì trang tự cập nhật `team` của các bài.
- Luật bảo mật mẫu: `firestore.rules.example` (thay `EMAIL_CHU_PROJECT` rồi dán vào Firebase Console → Firestore → Rules → Publish). **Bản này phải được dán lại mỗi khi file đổi**; chưa dán thì người mới chưa tự đăng ký được và Dự án chưa chạy. Bản thật chỉ nằm trên Firebase, không để trong repo.
- SDK Firebase đóng gói sẵn ở `src/vendor/firebase.mjs` (có `where` cho truy vấn theo người dùng), `build.py` chép sang `dist/`.
- Mã cấu hình Firebase trong `src/lib.js` là mã công khai (không phải mật khẩu); quyền truy cập do luật bảo mật quyết định.

## Nhóm và dự án

- Nút **Nhóm** ở đầu trang mở trang riêng: **Việc của tôi** (đến lượt, sắp tới, đã xong, quá hạn), **Dự án**, **Hồ sơ**, **Thành viên** (quản trị).
- Người tạo dự án là Điều phối của dự án đó. Điều phối mời bằng email Google, kể cả người chưa đăng nhập lần nào (lần đầu đăng nhập bằng đúng email đó là thấy dự án); trang không tự gửi thư mà mở thư soạn sẵn trong Gmail của Điều phối. Điều phối tạo khung bài cho từng bộ đề × phần thi (R1–R4, 8 bài Nghe Part 1, 3 hội thoại Part 2, 3 bài nói Part 3), giao việc ở bảng **Phân công** (chọn nhiều bài, giao một vai cho một người, đặt hạn, chia đều tự động) rồi theo dõi ở **Tổng quan**.
- Bảng phân công ghi vào trường `asg` của bài (`{as, at, by, due}`), không đụng nội dung bài. Khi mở hoặc lưu bài, trang gộp `asg` vào `S.wf`: bên nào đổi sau thì giữ bên đó, nhật ký ghi "Phân công từ bảng dự án".
- Chia đều tự động chỉ điền ô trống: người ít việc nhất được giao trước, không ai thẩm định bài mình soạn, cố để người soạn câu hỏi khác người soạn ngữ liệu; Điều phối không nhận soạn ngữ liệu (vì duyệt cổng 1) và chỉ nhận việc khác khi dự án có dưới 3 thành viên.

## Quy trình nhiều người

- Thanh **Quy trình** ở đầu trang: trạng thái của bài, các bước chuyển kèm điều kiện, phân công, nhật ký. Nút chuyển chỉ bấm được khi đủ điều kiện và đúng người; người thẩm định không duyệt bài mình làm.
- Vai chưa phân công thì người bấm bước chuyển đầu tiên của vai đó nhận vai (trừ Điều phối: mọi quản trị, hoặc người được ghi ở ô Điều phối).
- Dữ liệu quy trình nằm trong bài (`S.wf`, `S.map`) và được ghi thêm thành trường `wf` của bản ghi thư viện để lọc **Việc của tôi**. Không cần đổi luật bảo mật Firestore.
- **Chế độ nhà phát triển** (cuối thanh Quy trình): một người chạy mọi vai từ đầu đến cuối, bỏ qua phân công và quy tắc bốn mắt, nhật ký ghi "dev". Chỉ quản trị mới thấy. Bật/tắt lưu trong trình duyệt (`localStorage` khoá `vstep-dev`), không đi theo bài.


## Đặc tả riêng (tài liệu tập huấn)
Yêu cầu số từ của VNCETA, bảng phân bố câu hỏi và mẫu câu hỏi bài Đọc là tài liệu tập huấn có cam kết bảo mật, nên không nằm trong mã công khai. Quản trị dán nội dung (JSON) một lần ở trang Thành viên → Đặc tả riêng; dữ liệu lưu ở Firestore `config/specs`. Quản trị, Thành viên nội bộ và Thành viên được đánh dấu "Cho xem đặc tả riêng" tự tải khi đăng nhập; người khác thấy số của QĐ 730. Cần dán lại luật bảo mật mới (firestore.rules.example có mục `config`).
