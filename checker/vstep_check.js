// vstep_check.js — bộ kiểm của trang "Quy trình ngữ liệu VSTEP" chạy bằng Node (không cần trình duyệt).
// Dùng đúng mã của trang (src/*.js) nên số liệu y hệt trang. Tự sinh bằng tools/build_check.py; đừng sửa tay.
"use strict";
var __fs = require("fs");
var __nullEl = null;
function __list(){ var a = []; a.item = function(){ return null; }; return a; }
var __el = function(){ return {style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, setAttribute(){}, getAttribute(){return null;}, removeAttribute(){}, hasAttribute(){return false;}, appendChild(){}, removeChild(){}, insertAdjacentHTML(){}, addEventListener(){}, removeEventListener(){}, querySelector(){return null;}, querySelectorAll(){return __list();}, closest(){return null;}, contains(){return false;}, focus(){}, click(){}, getBoundingClientRect(){return {top:0,left:0,width:0,height:0};}, children:[], childNodes:[], dataset:{}, innerHTML:"", textContent:"", value:""}; };
var document = {
  getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return __list(); },
  createElement(){ return __el(); }, createTextNode(){ return __el(); }, addEventListener(){}, removeEventListener(){},
  body:__el(), documentElement:__el(), head:__el(), activeElement:null, title:"", hidden:false, visibilityState:"visible"
};
var window = globalThis; window.document = document; window.addEventListener = function(){}; window.removeEventListener = function(){};
window.__noGate = true; window.scrollTo = function(){}; window.matchMedia = function(){ return {matches:false, addEventListener(){}, addListener(){}}; };
var __store = {}; var localStorage = {getItem(k){ return k in __store ? __store[k] : null; }, setItem(k, v){ __store[k] = String(v); }, removeItem(k){ delete __store[k]; }};
var sessionStorage = {getItem(){ return null; }, setItem(){}, removeItem(){}};
var location = {hash:"", search:"", href:"", pathname:"/", origin:""}; var history = {replaceState(){}, pushState(){}};
var navigator = {userAgent:"node", clipboard:{writeText(){ return Promise.resolve(); }}, language:"vi"};
var requestAnimationFrame = function(f){ return setTimeout(f, 0); }; var alert = function(){}; var confirm = function(){ return true; };
var getComputedStyle = function(){ return {}; }; var MutationObserver = function(){ this.observe = function(){}; this.disconnect = function(){}; };
var Blob = globalThis.Blob || function(){}; var URL = globalThis.URL;

;

/* ---------- Specs ----------
   Bản công khai chỉ có số liệu của QĐ 730 (đã công bố). Yêu cầu số từ của VNCETA, bảng phân bố và mẫu câu hỏi bài Đọc
   là tài liệu tập huấn (cam kết bảo mật): lưu ở Firestore config/specs, chỉ tải khi người được quản trị cho xem đăng nhập (specsLoad trong lib.js). */
var SPEC = {
  R1:{skill:"R",label:"Đọc Part 1",preset:"Đọc Phần 1",words:"khoảng 450 (QĐ 730)",min:400,max:550,qd:"400–550",genre:"chủ đề đời sống hằng ngày; quảng cáo, tài liệu hướng dẫn, mô tả công việc, thư tín",qcount:"10 câu",qdist:"",skills:"",cov:95},
  R2:{skill:"R",label:"Đọc Part 2",preset:"Đọc Phần 2",words:"khoảng 450 (QĐ 730)",min:400,max:550,qd:"400–550",genre:"khoa học tự nhiên hoặc khoa học xã hội",qcount:"10 câu",qdist:"",skills:"",cov:95},
  R3:{skill:"R",label:"Đọc Part 3",preset:"Đọc Phần 3",words:"khoảng 450 (QĐ 730)",min:400,max:550,qd:"400–550",genre:"khoa học tự nhiên, khoa học xã hội hoặc chuyên ngành khác",qcount:"10 câu",qdist:"",skills:"",cov:95},
  R4:{skill:"R",label:"Đọc Part 4",preset:"Đọc Phần 4",words:"khoảng 500 (QĐ 730)",min:400,max:550,qd:"400–550",genre:"chuyên ngành hoặc văn chương",qcount:"10 câu",qdist:"",skills:"",cov:95},
  L1:{skill:"L",grp:1,label:"Nghe Part 1",preset:"Nghe Phần 1",words:"30–60 (QĐ 730)",min:30,max:60,qd:"30–60",genre:"thông báo, hướng dẫn hoặc hội thoại ngắn 3–5 lượt lời; chủ đề thiên về xã hội; ngữ liệu bậc 2–3",qcount:"1 câu (Part 1 có 8 bài, 8 câu)",speed:"130–170 từ/phút",cov:98},
  L2a:{skill:"L",grp:2,label:"Nghe Part 2, hội thoại 1",preset:"Nghe Phần 2 — hội thoại 1",words:"220–340 (QĐ 730)",min:220,max:340,qd:"220–340",genre:"hội thoại giữa 2 người; Part 2 có 3 hội thoại: 1 xã hội, 1 nghề nghiệp, 1 giáo dục; ngữ liệu bậc 3, 4, 5",qcount:"4 câu (Part 2 có 12 câu)",speed:"khoảng 2 phút; 110–170 từ/phút",cov:98},
  L2b:{skill:"L",grp:2,label:"Nghe Part 2, hội thoại 2",preset:"Nghe Phần 2 — hội thoại 2",words:"220–340 (QĐ 730)",min:220,max:340,qd:"220–340",genre:"hội thoại giữa 2 người; Part 2 có 3 hội thoại: 1 xã hội, 1 nghề nghiệp, 1 giáo dục; ngữ liệu bậc 3, 4, 5",qcount:"4 câu (Part 2 có 12 câu)",speed:"khoảng 2 phút; 110–170 từ/phút",cov:98},
  L2c:{skill:"L",grp:2,label:"Nghe Part 2, hội thoại 3",preset:"Nghe Phần 2 — hội thoại 3",words:"220–340 (QĐ 730)",min:220,max:340,qd:"220–340",genre:"hội thoại giữa 2 người; Part 2 có 3 hội thoại: 1 xã hội, 1 nghề nghiệp, 1 giáo dục; ngữ liệu bậc 3, 4, 5",qcount:"4 câu (Part 2 có 12 câu)",speed:"khoảng 2 phút; 110–170 từ/phút",cov:98},
  L3a:{skill:"L",grp:3,min:340,max:510,label:"Nghe Part 3, bài nói 1",preset:"Nghe Phần 3 — bài nói 1",words:"340–510 (QĐ 730)",qd:"340–510",genre:"bài nói của một người (bài giảng, thuyết trình, chương trình phát thanh, hướng dẫn, nói chuyện chuyên đề…)",qcount:"5 câu (Part 3 có 15 câu)",speed:"2–3 phút; khoảng 170 từ/phút",cov:98},
  L3b:{skill:"L",grp:3,min:340,max:510,label:"Nghe Part 3, bài nói 2",preset:"Nghe Phần 3 — bài nói 2",words:"340–510 (QĐ 730)",qd:"340–510",genre:"bài nói của một người (bài giảng, thuyết trình, chương trình phát thanh, hướng dẫn, nói chuyện chuyên đề…)",qcount:"5 câu (Part 3 có 15 câu)",speed:"2–3 phút; khoảng 170 từ/phút",cov:98},
  L3c:{skill:"L",grp:3,label:"Nghe Part 3, bài nói 3",preset:"Nghe Phần 3 — bài nói 3",words:"340–510 (QĐ 730)",min:340,max:510,qd:"340–510",genre:"bài nói của một người (bài giảng, thuyết trình, chương trình phát thanh, hướng dẫn, nói chuyện chuyên đề…)",qcount:"5 câu (Part 3 có 15 câu)",speed:"2–3 phút; khoảng 170 từ/phút",cov:98},
  // Viết, Nói (QĐ 730 mục 2.3, 2.4; biểu mẫu đề hoàn chỉnh của VNCETA): một bài = một nhiệm vụ
  W1:{skill:"W",label:"Viết Task 1",preset:"Viết Task 1 (thư/email)",words:"bài làm tối thiểu 120 từ (QĐ 730)",min:0,max:0,qd:"20 phút · tối thiểu 120 từ",genre:"thư/email trả lời một thư/email cho sẵn hoặc gửi người khác để hỏi thông tin, thực hiện nhu cầu giao tiếp; kiểm tra viết tương tác",qcount:"1 nhiệm vụ",cov:95},
  W2:{skill:"W",label:"Viết Task 2",preset:"Viết Task 2 (bài luận)",words:"bài làm tối thiểu 250 từ (QĐ 730)",min:0,max:0,qd:"40 phút · tối thiểu 250 từ",genre:"bài luận về một chủ đề cho sẵn, dùng lí do và ví dụ để bảo vệ ý kiến, quan điểm",qcount:"1 nhiệm vụ",cov:95},
  S1:{skill:"S",label:"Nói Part 1",preset:"Nói Part 1 · Giao tiếp xã hội",words:"3 phút (QĐ 730)",min:0,max:0,qd:"3 phút · 3–6 câu hỏi, 2 chủ đề",genre:"trả lời câu hỏi về hai chủ đề quen thuộc",qcount:"3–6 câu hỏi",cov:95},
  S2:{skill:"S",label:"Nói Part 2",preset:"Nói Part 2 · Thảo luận giải pháp",words:"4 phút, 1 phút chuẩn bị (QĐ 730)",min:0,max:0,qd:"4 phút · 1 tình huống, 3 giải pháp",genre:"tình huống có 3 giải pháp; thí sinh chọn giải pháp tối ưu và nói vì sao không chọn hai giải pháp kia",qcount:"1 tình huống",cov:95},
  S3:{skill:"S",label:"Nói Part 3",preset:"Nói Part 3 · Phát triển chủ đề",words:"5 phút, 1 phút chuẩn bị (QĐ 730)",min:0,max:0,qd:"5 phút · chủ đề, sơ đồ tư duy, 1–3 câu hỏi",genre:"trình bày một chủ đề theo sơ đồ tư duy cho sẵn hoặc ý riêng, rồi trả lời câu hỏi mở rộng",qcount:"1 chủ đề, 3 câu hỏi mở rộng",cov:95}
};
/* ô ngày đang gõ dở: trình duyệt báo "change" ngay khi năm mới có 1–3 chữ số (0002, 0020, 0202);
   bỏ qua cho tới khi năm đủ 4 chữ số và từ 1900 trở đi, để trang không vẽ lại bảng giữa chừng */
function dateTyping(t){ return !!t && t.type === "date" && !!t.value && parseInt(t.value.slice(0, 4), 10) < 1900; }
/* ô ngày đang mở bảng chọn: iPhone báo "change" ngay khi chạm/cuộn bảng chọn, Chrome báo khi gõ xong một ngày hợp lệ.
   Nếu xử lý ngay thì trang vẽ lại bảng, thay mất ô đang mở và bảng chọn ngày tự tắt. Vì vậy giữ lại, chỉ áp dụng
   khi rời ô (hoặc bấm Enter); nếu đang nhấn chuột/chạm thì đợi nhả ra để cú bấm (vd "Lưu phân công") không bị mất. */
var DATEQ = {el:null, ptr:false, wait:[]};
document.addEventListener("pointerdown", function(){ DATEQ.ptr = true; }, true);
["pointerup", "pointercancel"].forEach(function(n){ document.addEventListener(n, function(){ DATEQ.ptr = false; var w = DATEQ.wait; DATEQ.wait = []; w.forEach(function(f){ setTimeout(f, 0); }); }, true); });
function dateWhenFree(f){ if(DATEQ.ptr) DATEQ.wait.push(f); else setTimeout(f, 0); }
// true = giữ lại thay đổi này (ô vẫn đang được chọn); hàm xử lý "change" nên return ngay
function dateHold(t){
  if(!t || t.type !== "date" || t.__dateFire || document.activeElement !== t) return false;
  DATEQ.el = t;
  if(!t.__dateHold){
    t.__dateHold = true;
    var kd = function(e){ if(e.key === "Enter"){ e.preventDefault(); t.blur(); } };
    var go = function(){ t.removeEventListener("blur", go); t.removeEventListener("keydown", kd); t.__dateHold = false; dateWhenFree(dateFlush); };
    t.addEventListener("blur", go); t.addEventListener("keydown", kd);
  }
  return true;
}
// áp dụng thay đổi ngày đang giữ (gọi trước khi vẽ lại hoặc khi bấm nút); trả về true nếu có
function dateFlush(){
  var t = DATEQ.el; if(!t || document.activeElement === t) return false;
  DATEQ.el = null; t.__dateFire = true;
  try{ t.dispatchEvent(new Event("change", {bubbles:true})); } finally { t.__dateFire = false; }
  return true;
}
var SKILLCODES = "RE quy chiếu · DE chi tiết · DE[P] chi tiết diễn đạt khác · MI ý chính cả bài · MI[P] ý chính một đoạn · IN suy luận · VO đoán nghĩa từ · VO(ID) thành ngữ · OP quan điểm, thái độ · TO giọng điệu · RP mục đích · LO định vị thông tin · IS chèn câu";

/* ---------- Input slots (shared between steps) ---------- */
var SLOTS = {
  usedTopics:{label:"Chủ đề các bài khác trong đề", hint:"Để chatbot tránh trùng lĩnh vực. Có thể bỏ trống.", type:"text", optional:true, empty:"chưa có", ph:"ví dụ: rừng ngập mặn Cần Giờ; xe điện ở Hà Nội"},
  topic:{label:"Chủ đề bạn chọn", hint:"Chép một chủ đề từ bảng chatbot trả về, có thể sửa lại cho cụ thể.", type:"text", ph:"ví dụ: giao đồ ăn trực tuyến thay đổi thói quen ăn ngoài ở Jakarta"},
  srcVi:{label:"Văn bản nguồn tiếng Việt", hint:"Copy từ trang nguồn đã xác minh.", type:"area"},
  src:{label:"Bản gốc tiếng Anh", hint:"Văn bản nguồn tiếng Anh copy từ trang gốc, hoặc bản dịch ở bước 3.", type:"area"},
  facts:{label:"Đoạn dữ kiện", hint:"Kết quả chatbot trả về ở bước 4a.", type:"area"},
  draft:{label:"Bản hiện tại", hint:"Bài đọc hoặc kịch bản mới nhất. Mỗi khi chatbot trả về bản sửa, dán đè vào đây.", type:"area"},
  listenForm:{label:"Dạng bài", type:"select", options:["thông báo","hướng dẫn","hội thoại ngắn 3–5 lượt lời"]},
  context:{label:"Bối cảnh hội thoại", hint:"Mỗi hội thoại trong Part 2 một bối cảnh khác nhau.", type:"select", options:["xã hội","nghề nghiệp","giáo dục"]},
  contextDetail:{label:"Tình huống cụ thể", type:"text", ph:"ví dụ: hai sinh viên chuẩn bị chuyến đi thực tế"},
  roles:{label:"Hai người nói (tên và vai)", type:"text", ph:"ví dụ: Linh, sinh viên Việt Nam; Tom, bạn cùng lớp người Úc"},
  setting:{label:"Bối cảnh AI đặt cho kịch bản", hint:"Tự tách từ phần ghi chú cuối bài khi bạn dán kịch bản ở mục 3. Sửa tay nếu cần.", type:"area", optional:true, empty:"(AI chưa ghi bối cảnh; hãy tự đọc kịch bản để xác định người nói, người nghe và dịp nói)"},
  settingNote:{label:"Nhận xét của bạn về bối cảnh", hint:"Bối cảnh có hợp với nội dung, người nghe và mức của bài không? Chưa hợp thì ghi cần đổi gì, rồi dùng câu lệnh sửa bối cảnh bên dưới.", type:"area", ph:"ví dụ: nội dung là số liệu phát thải toàn cầu mà người nghe là học sinh nhỏ, chưa hợp; đổi sang chương trình radio cho người đi làm"},
  talkKind:{label:"Dạng bài nói", hint:"Ba bài nói trong một Part 3 nên khác bối cảnh nhau.", type:"select", optional:true, empty:"AI tự chọn bối cảnh hợp với chủ đề (không mặc định là bài giảng trên lớp)", options:["AI tự chọn bối cảnh hợp với chủ đề (không mặc định là bài giảng trên lớp)","bài giảng hoặc buổi học","buổi định hướng, giới thiệu chương trình cho người mới (sinh viên, nhân viên)","thuyết trình tại hội thảo hoặc hội nghị","chương trình phát thanh hoặc podcast","hướng dẫn viên nói với đoàn tham quan","buổi nói chuyện chuyên đề ở thư viện, bảo tàng, câu lạc bộ","bài phát biểu tại sự kiện cộng đồng","buổi tập huấn hoặc phổ biến tại nơi làm việc","hướng dẫn dài cho một nhóm người trước chuyến đi hoặc sự kiện"]},
  talkCtx:{label:"Bối cảnh cụ thể", type:"text", optional:true, empty:"(người soạn để trống: tự đặt cho hợp với dạng bài nói và chủ đề)", ph:"ví dụ: người dẫn chương trình radio buổi sáng nói với thính giả về thói quen giặt đồ"},
  notes:{label:"Ghi chú biên tập đã duyệt", hint:"Phần chatbot ghi sau dòng \"---\" ở bước 4: từ nhiều nghĩa, đại từ – tiền ngữ, phần đã lược. Tự tách khi bạn dán nguyên câu trả lời. Sửa lại nếu ghi chú chưa đúng.", type:"area", optional:true, empty:""},
  changes:{label:"Danh sách thay đổi chatbot báo", hint:"Tự tách từ phần sau dòng \"---\". Đối chiếu với phần so sánh ở bước 5.", type:"area", optional:true, empty:""},
  paraTarget:{label:"Phần cần sửa", type:"text", ph:"ví dụ: đoạn 3; hoặc các lượt lời từ \"Tom: Right!\" đến hết"},
  fixReason:{label:"Vấn đề cần sửa", type:"text", ph:"ví dụ: chưa có chi tiết nào để hỏi câu suy luận (IN)"},
  pfCov:{label:"1. Độ phủ ở mức mục tiêu (%)", hint:"Cài đặt mặc định của web.", type:"text", ph:"ví dụ: 97.5"},
  pfLvl95:{label:"2. Mức ở ngưỡng 95%", hint:"Bật \"bỏ qua off-list\".", type:"select", options:["chưa đo","A1","A2","B1","B2","C1","C2","trên C2"]},
  pfCovBelow:{label:"3. Độ phủ ở mức {belowLevel} (%)", hint:"Bật \"bỏ qua off-list\". Không bắt buộc; giúp ước lượng số từ cần nâng.", type:"text", optional:true, empty:"chưa đo", ph:"ví dụ: 96.2"},
  above:{label:"Bảng từ vượt mục tiêu", hint:"Copy từ Text Profiler (từ, mức, số lần).", type:"area"},
  keep:{label:"Từ giữ lại, không thay", hint:"Từ để hỏi đoán nghĩa, thuật ngữ chính, đơn vị đo. Có thể bỏ trống.", type:"text", optional:true, empty:"không có", ph:"ví dụ: figure, clustering, rupiah"}
};

/* ---------- Prompt templates ----------
   {var}  = thông số tự điền từ thiết lập
   {{slot}} = nội dung giáo viên dán (ô nhập) */
var P = {};
P.b1 = {title:"Prompt B1 · Lập danh sách chủ đề", inputs:["usedTopics"], outputs:[{slot:"topic"}], t:
"Bạn là chuyên gia ra đề thi VSTEP. Hãy đề xuất 12 chủ đề cho bài {skillName} {partShort} (thể loại theo QĐ 730/QĐ-BGDĐT: {genre}).\n\nYêu cầu:\n- Mới, cập nhật, phù hợp với người Việt Nam.\n- Không nhạy cảm về chính trị, tôn giáo, sắc tộc, chiến tranh, bệnh tật, tai nạn; không thiên về một nhóm thí sinh (giới, vùng miền, sở thích, trải nghiệm riêng).\n- Ít nhất 3 chủ đề có bối cảnh châu Á, ASEAN hoặc Việt Nam.\n- Không phải kiến thức phổ thông mà thí sinh trả lời được khi chưa {readOrListen} bài.\n- Không chọn chủ đề mà nguồn thường chỉ là lời khuyên chung (kiểu self-help), chỉ là danh sách ưu, nhược điểm, hoặc phải có kiến thức chuyên ngành mới hiểu: các bài đó khó ra câu ý chính, suy luận, quan điểm. Chủ đề chuyên môn vẫn được nếu người đọc phổ thông hiểu được (đề xuất của tập huấn).\n- Có đủ dữ kiện cụ thể (con số, kết quả nghiên cứu, ví dụ) để viết một bài {wordsK} từ.\n- Không trùng lĩnh vực với các chủ đề đã có trong đề: {{usedTopics}}.\n\nTrình bày bảng: chủ đề | lĩnh vực | vì sao phù hợp | rủi ro cần tránh."};
P.b2 = {title:"Prompt B2 · Tìm nguồn (bật tìm kiếm web hoặc deep research)", inputs:["topic"], outputs:[{slot:"src"},{slot:"srcVi"}], outputNote:"Sau khi tự mở và xác minh nguồn, copy văn bản từ trang gốc. Nguồn tiếng Anh: dán vào ô thứ nhất và bỏ qua bước 3. Nguồn tiếng Việt: dán vào ô thứ hai.", t:
"Tìm 5 nguồn chính thống về chủ đề: {{topic}}.\nLoại nguồn chấp nhận: báo chính thống, trang cơ quan nhà nước, tổ chức quốc tế, tạp chí khoa học phổ thông, hoặc trang có giấy phép mở. Ưu tiên nguồn tiếng Anh. Bài sẽ dùng làm ngữ liệu {skillName} {partShort} của đề thi VSTEP (thể loại: {genre}), nên nguồn cần đủ dữ kiện cho một bài {wordsK} từ. Tránh nguồn chỉ là lời khuyên chung (kiểu self-help), chỉ liệt kê ưu, nhược điểm, hoặc phải có kiến thức chuyên ngành mới hiểu, vì khó ra câu hỏi (đề xuất của tập huấn). Ưu tiên nguồn {sourceNeeds}\n\nVới mỗi nguồn ghi: tiêu đề | đơn vị xuất bản | ngày đăng | URL | giấy phép sử dụng (nếu có) | độ dài ước tính | 3 dữ kiện chính | nguồn có nhận định của tác giả hoặc chuyên gia, ví dụ minh hoạ, so sánh hay tranh luận không (trích ngắn một chỗ, nếu có).\n\nKhông bịa nguồn. URL nào chưa chắc, ghi \"chưa xác minh\"."};
P.b3 = {title:"Prompt B3 · Dịch nguồn tiếng Việt", inputs:["srcVi"], outputs:[{slot:"src"}], t:
"Dịch nội dung sau sang tiếng Anh, văn phong báo chí trung tính. Giữ nguyên mọi tên riêng, con số, ngày tháng. Không thêm, không bớt ý. Dùng chính tả {spelling}; viết ngày theo kiểu {dateEx}. Chỉ trả về bản dịch.\n\nNỘI DUNG:\n{{srcVi}}"};
P.b4 = {title:"Prompt B4 · Biên tập thành bài Đọc VSTEP", inputs:["src"], outputs:[{slot:"draft",split:"notes"},{slot:"notes"}], outputNote:"Dán nguyên câu trả lời vào ô Bản hiện tại. Phần sau dòng \"---\" (số từ, từ nhiều nghĩa, đại từ – tiền ngữ, phần đã lược) tự chuyển sang ô Ghi chú biên tập.", t:
"Biên tập văn bản dưới đây thành bài đọc cho {partShort} của đề thi Đọc VSTEP. Thông số:\n- Độ dài: {words} từ, tính cả tiêu đề. Tiêu đề tối đa 10 từ, không có dấu chấm cuối.\n- Số đoạn: {paras}; mỗi đoạn một ý chính rõ ràng; các đoạn không dài đều nhau. Các đoạn cách nhau một dòng trống.\n- Từ vựng: phần lớn ở mức {level} trở xuống, chỉ một số từ ít gặp; giữ {poly} từ nhiều nghĩa đoán được từ ngữ cảnh.\n- Hạn chế từ không có trong danh sách CEFR-J/Octanove: tránh từ phái sinh (đuôi -ly, -ness, -tion, -ity, -ize…) và thuật ngữ khi có từ thông dụng cùng nghĩa. Tổng số lượt từ trên mức {level} hoặc ngoài danh sách (không tính tên riêng) không quá {maxAbove}.\n- Ngữ pháp: kết hợp câu đơn, câu ghép, câu phức; hạn chế câu trên 25 từ.\n- Độ dễ đọc: {freHow}\n- Văn phong: khách quan, dựa trên dữ kiện. Giữ lại các quan điểm, nhận định, mức độ chắc chắn (may, suggest, argue, warn) và thái độ có trong nguồn, gán rõ cho tác giả hoặc người được nhắc tới; không thêm quan điểm của riêng bạn.\n- Liên kết: có đại từ quy chiếu mà tiền ngữ không nằm ngay trước; có từ nối chỉ đối lập và nguyên nhân–kết quả.\n- Giữ nguyên sự kiện, tên riêng, con số của bản gốc; không thêm thông tin mới. Nếu lược bớt, liệt kê phần đã lược.\n- Chỉ giữ ý, không giữ câu chữ: viết lại bằng cấu trúc câu và cách diễn đạt khác bản gốc (dưới 20% câu chữ của bản gốc).\n- Không thêm câu bình luận, câu kết luận hay câu lặp ý chỉ để đủ số từ. Nếu thiếu từ, báo lại thay vì tự thêm thông tin.\n- Giữ chất liệu để ra câu hỏi: khi viết lại, đừng làm mất những thứ sau nếu nguồn có; nếu nguồn không có thì KHÔNG tự tạo ra: ví dụ minh hoạ (such as, for example) cùng ý mà ví dụ đó minh hoạ; chỗ nguồn để người đọc tự suy ra thay vì nói thẳng; nhận định hoặc đánh giá của tác giả, chuyên gia; so sánh, đối lập giữa các ý.\n- Viết tự nhiên như một bài phổ biến kiến thức bằng tiếng Anh. Không chèn thành ngữ, từ đánh giá hay câu hỏi tu từ chỉ để có chỗ ra câu hỏi.\n- Chính tả {spelling} thống nhất, kể cả cách viết ngày tháng (ví dụ {dateEx}).\n\nTrình bày: bài đọc trước; sau một dòng \"---\", ghi (1) số từ; (2) các từ nhiều nghĩa đã giữ; (3) các đại từ quy chiếu và tiền ngữ của chúng; (4) phần đã lược; (5) các con số, tên riêng, ngày tháng đã dùng trong bài{pageNote}; (6) {anchorReq}\n\n{refs}\n\nVĂN BẢN GỐC:\n{{src}}"};
P.facts = {title:"Prompt 4a · Tóm tắt dữ kiện", inputs:["src"], outputs:[{slot:"facts"}], t:
"Rút các dữ kiện trong văn bản dưới đây thành một đoạn tiếng Anh ngắn (khoảng 120–180 từ). Chỉ gồm sự kiện, tên riêng, con số, ngày tháng và quan hệ nhân–quả có trong văn bản.{factsNoWaste}\n\nQuy tắc (mỗi câu của đoạn dữ kiện phải đối chiếu lại được với một chỗ cụ thể trong văn bản):\n1. Mỗi câu một dữ kiện, lấy từ một câu hoặc hai câu liền nhau của văn bản; giữ đúng thứ tự xuất hiện trong văn bản.\n2. Con số, đơn vị, phần trăm, ngày tháng, tên người, chức danh, tên tổ chức, tên địa danh: chép đúng như văn bản. Không làm tròn, không đổi đơn vị, không đổi cách viết (giữ \"per cent\" hay \"%\", \"m\" hay \"million\" như văn bản), không viết tắt hoặc viết đầy đủ khác văn bản.\n3. Giữ nguyên các từ chỉ mức độ chắc chắn, ước lượng và tần suất (may, could, about, nearly, more than, up to, at least, estimated, reportedly, often…): văn bản có thì giữ, văn bản không có thì không thêm.\n4. Giữ đúng ai nói, ai làm: nhận định của ai thì ghi rõ người đó (according to…, … says); không gán nhận định cho người khác, không biến ý kiến thành sự thật.\n5. Chỉ ghi quan hệ nhân–quả hoặc so sánh khi văn bản nói rõ bằng chữ (because, led to, as a result, more than…); không tự nối hai dữ kiện thành nhân–quả.\n6. Không gộp hai con số thuộc hai bối cảnh khác nhau vào một câu; không tính ra con số mới (cộng, trừ, quy đổi, lấy trung bình).\n7. Thuật ngữ và từ khoá dùng đúng từ của văn bản; chỉ được rút gọn phần diễn giải, không thay bằng từ đồng nghĩa.\n8. Không thêm, không suy luận, không nhận xét, không dùng kiến thức ngoài văn bản.\n\nTrước khi trả lời, tự soát từng câu với văn bản theo 8 quy tắc trên; câu nào không chỉ ra được chỗ tương ứng trong văn bản thì bỏ. Chỉ trả về đoạn dữ kiện.\n\nVĂN BẢN:\n{{src}}"};
P.b8_1 = {title:"Prompt B8 · Viết bài Nghe Part 1", inputs:["facts","listenForm"], outputs:[{slot:"draft",split:"discard"}], outputNote:"Dán nguyên câu trả lời; dòng ghi số từ sau \"---\" tự bị bỏ.", t:
"Viết một bài nghe ngắn cho Part 1 bài thi Nghe VSTEP từ nội dung dưới đây. Dạng bài: {{listenForm}}.\n- Độ dài {words} từ, tính cả tên người nói nếu là hội thoại.\n- Chủ đề đời sống xã hội; ngôn ngữ bậc 2–3; từ vựng phần lớn ở mức {level} trở xuống.\n- Có một thông tin chính để hỏi, và 1–2 thông tin dễ nhầm với nó (một giờ, địa điểm hoặc con số khác).\n- Văn nói tự nhiên, câu ngắn, có dạng rút gọn (I'm, don't).\n- Khẩu ngữ hoá (hướng dẫn của giảng viên; là hướng nên theo, không phải chỉ tiêu bắt buộc): so với NỘI DUNG ở cuối câu lệnh (đoạn dữ kiện, viết bằng văn viết), kịch bản dùng ít mệnh đề phụ hơn, gần như không có mệnh đề quan hệ chen giữa chủ ngữ và động từ chính (không viết kiểu \"The plants that they found were used…\"; mệnh đề quan hệ ở cuối câu như \"They found plants that clean fabric\" vẫn dùng được), ít câu bị động hơn; dùng nhiều hơn từ nối đơn giản (so, and, but), cách xưng I, we, câu hỏi (hỏi lại, xác nhận, câu hỏi đuôi, câu hỏi tu từ), lượt đáp rút gọn (Right. Got it. Not really.), từ đệm và từ nối thoại (well, you know, I mean, actually, anyway, right, okay, kind of; đều có trong CEFR-J), và một ít ngập ngừng có tiếng (uh, um). Chỗ ngập ngừng đặt ở ranh giới mệnh đề (đầu lượt lời, sau dấu phẩy trước mệnh đề mới, sau and, but, so, because), không chen giữa cụm từ (không viết the uh market). uh, um nằm ngoài danh sách từ vựng nên dùng ít, khoảng 1 chỗ trên 100 từ; không viết er, hmm, gonna, wanna.\n- Mức tối đa cho bài này (dồn câu hỏi, lượt đáp ngắn, từ đệm làm câu ngắn, từ ngắn nên đẩy Flesch lên; uh, um làm giảm độ phủ):\n{spkPlan}\n- THỨ TỰ ƯU TIÊN khi các yêu cầu đá nhau: (1) độ dài, độ phủ và mức từ vựng, Flesch Reading Ease trong khoảng của mức: bắt buộc; (2) nghe tự nhiên như người nói thật; (3) các hướng khẩu ngữ hoá ở trên. Không vặn câu chữ để chạm một hướng khẩu ngữ hoá nếu làm bài gượng.\n- Độ dễ đọc: {freHow} Trong văn nói: câu hỏi nên có từ nội dung (So what happens if you miss the deadline?) hơn là một hai từ (Really? Right?); lời phản hồi ngắn gắn vào câu sau bằng dấu phẩy (Right, so the form is due Friday.); nối ý bằng and, so, but thay vì chặt thành nhiều câu rất ngắn.\n- Thông tin cho câu hỏi dễ (bậc 3) nói thẳng, rõ một lần; chỗ nói vòng, tự sửa lời dành cho thông tin của câu hỏi khó. Chấm câu như người nói ngắt hơi, không viết câu nối dài bằng and…and.\n- Độ khó nằm ở từ nội dung, cụm động từ, kết hợp từ, thành ngữ thông dụng; không dùng từ trang trọng kiểu văn viết.\n- Chỉ dùng dữ kiện có trong nội dung; không thêm so sánh hay chi tiết mới về chủ đề.\n- Chính tả {spelling}, viết ngày theo kiểu {dateEx}. Nếu là hội thoại, ghi tên người nói ở đầu mỗi lượt lời, mỗi lượt một dòng. Cuối bài, sau một dòng \"---\", ghi số từ.\n{settingReq}\n\n{noWaste}\n\n{refs}\n\nNỘI DUNG:\n{{facts}}"};
P.b8_2 = {title:"Prompt B8 · Viết hội thoại Nghe Part 2", inputs:["facts","context","contextDetail","roles"], outputs:[{slot:"draft",split:"discard"}], outputNote:"Dán nguyên câu trả lời; dòng ghi số từ sau \"---\" tự bị bỏ.", t:
"Chuyển nội dung dưới đây thành hội thoại giữa 2 người cho Part 2 bài thi Nghe VSTEP. Bối cảnh: {{context}}; tình huống: {{contextDetail}}. Hai người nói: {{roles}}.\n- Độ dài {words} từ, tính cả tên người nói (khoảng 2 phút ở 150–170 từ/phút).\n- Văn nói tự nhiên: câu ngắn, dạng rút gọn (I'm, don't), từ đệm vừa phải, có hỏi lại, xác nhận, tự sửa lời; lượt lời dài ngắn khác nhau.\n- Khẩu ngữ hoá (hướng dẫn của giảng viên; là hướng nên theo, không phải chỉ tiêu bắt buộc): so với NỘI DUNG ở cuối câu lệnh (đoạn dữ kiện, viết bằng văn viết), kịch bản dùng ít mệnh đề phụ hơn, gần như không có mệnh đề quan hệ chen giữa chủ ngữ và động từ chính (không viết kiểu \"The plants that they found were used…\"; mệnh đề quan hệ ở cuối câu như \"They found plants that clean fabric\" vẫn dùng được), ít câu bị động hơn; dùng nhiều hơn từ nối đơn giản (so, and, but), cách xưng I, we, câu hỏi (hỏi lại, xác nhận, câu hỏi đuôi, câu hỏi tu từ), lượt đáp rút gọn (Right. Got it. Not really.), từ đệm và từ nối thoại (well, you know, I mean, actually, anyway, right, okay, kind of; đều có trong CEFR-J), và một ít ngập ngừng có tiếng (uh, um). Chỗ ngập ngừng đặt ở ranh giới mệnh đề (đầu lượt lời, sau dấu phẩy trước mệnh đề mới, sau and, but, so, because), không chen giữa cụm từ (không viết the uh market). uh, um nằm ngoài danh sách từ vựng nên dùng ít, khoảng 1 chỗ trên 100 từ; không viết er, hmm, gonna, wanna.\n- Mức tối đa cho bài này (dồn câu hỏi, lượt đáp ngắn, từ đệm làm câu ngắn, từ ngắn nên đẩy Flesch lên; uh, um làm giảm độ phủ):\n{spkPlan}\n- THỨ TỰ ƯU TIÊN khi các yêu cầu đá nhau: (1) độ dài, độ phủ và mức từ vựng, Flesch Reading Ease trong khoảng của mức: bắt buộc; (2) nghe tự nhiên như người nói thật; (3) các hướng khẩu ngữ hoá ở trên. Không vặn câu chữ để chạm một hướng khẩu ngữ hoá nếu làm bài gượng.\n- Độ dễ đọc: {freHow} Trong văn nói: câu hỏi nên có từ nội dung (So what happens if you miss the deadline?) hơn là một hai từ (Really? Right?); lời phản hồi ngắn gắn vào câu sau bằng dấu phẩy (Right, so the form is due Friday.); nối ý bằng and, so, but thay vì chặt thành nhiều câu rất ngắn.\n- Thông tin cho câu hỏi dễ (bậc 3) nói thẳng, rõ một lần; chỗ nói vòng, tự sửa lời dành cho thông tin của câu hỏi khó. Chấm câu như người nói ngắt hơi, không viết câu nối dài bằng and…and.\n- Hai chỗ có thông tin để hỏi không nằm liền trong cùng một câu hoặc cùng một lượt lời; giữa hai chỗ hỏi gần nhau có đoạn đệm ngắn (chuyển ý, hỏi lại, xác nhận) để thí sinh kịp xử lý, đoạn đệm không mở ý mới (đề xuất của tập huấn).\n- Độ khó nằm ở từ nội dung, cụm động từ, kết hợp từ, thành ngữ thông dụng; không dùng từ trang trọng kiểu văn viết.\n- Có ít nhất một chỗ người nói đổi ý hoặc sửa thông tin, và một con số hoặc tên riêng được nhắc tới nhưng không phải thông tin chính.\n- Chỉ dùng dữ kiện có trong nội dung; không thêm so sánh, nhận xét hay chi tiết mới về chủ đề. Quan điểm, thái độ của người nói (nếu có) lấy từ nhận định có trong nội dung, không ngược với nội dung. Phần bối cảnh của nhân vật (họ là ai, vì sao nói chuyện) được tự đặt.\n- Tình huống và vai của hai người phải là lý do tự nhiên để họ nói về đúng nội dung này và hợp thực tế (chuyện có thể xảy ra thật); độ quen thuộc của tình huống và mức chuyên sâu hợp với mức {level} (mức thấp: tình huống đời thường; mức cao mới dùng tình huống học thuật hoặc chuyên môn).\n- Vai và quan hệ của hai người gợi qua lời thoại (việc họ đang làm, cách xưng hô, điều họ nhắc tới), không tự giới thiệu thẳng nghề hay quan hệ (không viết kiểu \"As your manager, I…\"); các manh mối cùng chỉ về một khả năng.\n- Từ vựng phần lớn ở mức {level} trở xuống. Chính tả {spelling}, viết ngày theo kiểu {dateEx}. Ghi tên người nói ở đầu mỗi lượt lời, mỗi lượt một dòng. Cuối bài, sau một dòng \"---\", ghi số từ.\n{settingReq}\n\n{noWaste}\n\n{refs}\n\nNỘI DUNG:\n{{facts}}"};
P.b8_3 = {title:"Prompt B8 · Viết bài nói Nghe Part 3", inputs:["facts","talkKind","talkCtx"], outputs:[{slot:"draft",split:"discard"}], outputNote:"Dán nguyên câu trả lời; dòng ghi số từ sau \"---\" tự bị bỏ.", t:
"Chuyển nội dung dưới đây thành một bài nói của một người cho Part 3 bài thi Nghe VSTEP. Dạng bài nói: {{talkKind}}. Bối cảnh cụ thể: {{talkCtx}}.\n- Độ dài {words} từ (2–3 phút ở khoảng 170 từ/phút).\n- Bối cảnh khớp chủ đề và hợp thực tế (chuyện có thể xảy ra thật): người nói phải có lý do tự nhiên để nói về đúng nội dung này, với đúng nhóm người nghe này, trong dịp này; người nghe là người thật sự cần hoặc quan tâm thông tin đó. Không ghép chủ đề vào một bối cảnh gượng (ví dụ nội dung về thói quen giặt đồ thì hợp với chương trình radio về lối sống, buổi nói chuyện ở hội nhóm cộng đồng; không hợp với hướng dẫn viên bảo tàng nếu nội dung không gắn với bảo tàng).\n- Bối cảnh khớp mức {level}: người nghe, dịp nói và mức chuyên sâu hợp với mức của bài; bài mức thấp dùng tình huống đời thường, quen thuộc với người nghe phổ thông; bài mức cao mới dùng bối cảnh học thuật hoặc chuyên môn, nội dung trừu tượng hơn. Mức thuật ngữ theo người nghe: người nghe phổ thông thì thuật ngữ nào cũng được giải thích ngắn.\n- Người nói, dịp nói và người nghe nhất quán từ đầu đến cuối; cách xưng hô, giọng điệu theo bối cảnh (ví dụ người dẫn radio nói với thính giả, hướng dẫn viên nói với đoàn khách, người tập huấn nói với đồng nghiệp). Phần bối cảnh tự đặt không được thêm dữ kiện về chủ đề. Nếu dạng bài nói đã chọn không hợp với chủ đề hoặc mức, vẫn viết theo dạng đã chọn cho khớp nhất có thể, và ghi một dòng nhận xét về điều đó ở phần ghi chú cuối bài.\n- Gợi bối cảnh, không nói ra: không nêu thẳng nghề, vai của người nói, tên địa điểm hay tên chương trình. Cài ít nhất 2 manh mối gián tiếp (việc người nghe vừa làm hoặc sắp làm, đồ vật, thời điểm, cách gọi người nghe), đặt ở phần mở đầu và rải trong bài, không dồn vào một câu. Các manh mối cùng chỉ về một bối cảnh và không hợp với bối cảnh khác, để câu hỏi \"người nói là ai, đang ở đâu\" (nếu có) phải suy luận và chỉ có một đáp án.\n- Mở bài: 1–2 câu gợi bối cảnh rồi nêu chủ đề. Dùng từ báo hiệu (First, Let's turn to, What I want to stress is, To sum up) theo kiểu hợp với dạng bài nói; nêu quan điểm của người nói ở 1–2 chỗ, lấy từ nhận định, đánh giá có trong NỘI DUNG và nói lại ở ngôi thứ nhất (được thêm cảm xúc cùng chiều với nội dung; không đưa quan điểm mới hay ngược với nội dung, vì câu hỏi quan điểm phải có căn cứ đối chiếu được); giải thích ngắn khái niệm mới, nhưng phần giải thích không dùng làm chỗ hỏi.\n- Văn nói, không phải văn viết đem đọc: nói trực tiếp với người nghe (you, we, let's), dùng dạng rút gọn, câu ngắn; không dùng Furthermore, Moreover, In conclusion, ngoặc đơn, dấu chấm phẩy.\n- Khẩu ngữ hoá (hướng dẫn của giảng viên; là hướng nên theo, không phải chỉ tiêu bắt buộc): so với NỘI DUNG ở cuối câu lệnh (đoạn dữ kiện, viết bằng văn viết), kịch bản dùng ít mệnh đề phụ hơn, gần như không có mệnh đề quan hệ chen giữa chủ ngữ và động từ chính (không viết kiểu \"The plants that they found were used…\"; mệnh đề quan hệ ở cuối câu như \"They found plants that clean fabric\" vẫn dùng được), ít câu bị động hơn; dùng nhiều hơn từ nối đơn giản (so, and, but), cách xưng I, we, câu hỏi (hỏi lại, xác nhận, câu hỏi đuôi, câu hỏi tu từ), lượt đáp rút gọn (Right. Got it. Not really.), từ đệm và từ nối thoại (well, you know, I mean, actually, anyway, right, okay, kind of; đều có trong CEFR-J), và một ít ngập ngừng có tiếng (uh, um). Chỗ ngập ngừng đặt ở ranh giới mệnh đề (đầu lượt lời, sau dấu phẩy trước mệnh đề mới, sau and, but, so, because), không chen giữa cụm từ (không viết the uh market). uh, um nằm ngoài danh sách từ vựng nên dùng ít, khoảng 1 chỗ trên 100 từ; không viết er, hmm, gonna, wanna.\n- Mức tối đa cho bài này (dồn câu hỏi, lượt đáp ngắn, từ đệm làm câu ngắn, từ ngắn nên đẩy Flesch lên; uh, um làm giảm độ phủ):\n{spkPlan}\n- THỨ TỰ ƯU TIÊN khi các yêu cầu đá nhau: (1) độ dài, độ phủ và mức từ vựng, Flesch Reading Ease trong khoảng của mức: bắt buộc; (2) nghe tự nhiên như người nói thật; (3) các hướng khẩu ngữ hoá ở trên. Không vặn câu chữ để chạm một hướng khẩu ngữ hoá nếu làm bài gượng.\n- Độ dễ đọc: {freHow} Trong văn nói: câu hỏi nên có từ nội dung (So what happens if you miss the deadline?) hơn là một hai từ (Really? Right?); lời phản hồi ngắn gắn vào câu sau bằng dấu phẩy (Right, so the form is due Friday.); nối ý bằng and, so, but thay vì chặt thành nhiều câu rất ngắn.\n- Thông tin cho câu hỏi dễ (bậc 3) nói thẳng, rõ một lần; chỗ nói vòng, tự sửa lời dành cho thông tin của câu hỏi khó. Chấm câu như người nói ngắt hơi, không viết câu nối dài bằng and…and.\n- Hai chỗ có thông tin để hỏi không nằm liền trong cùng một câu; giữa hai chỗ hỏi gần nhau có đoạn đệm ngắn (chuyển ý, hỏi lại, xác nhận) để thí sinh kịp xử lý, đoạn đệm không mở ý mới (đề xuất của tập huấn).\n- Độ khó nằm ở từ nội dung, cụm động từ, kết hợp từ, thành ngữ thông dụng; không dùng từ trang trọng kiểu văn viết.\n- Chỉ dùng dữ kiện và nhận định có trong nội dung; quan điểm của người nói không thêm dữ kiện hay nhận định mới.\n- Từ vựng phần lớn ở mức {level} trở xuống. Chính tả {spelling}, viết ngày theo kiểu {dateEx}. Cuối bài, sau một dòng \"---\", ghi số từ.\n{settingReq}\n\n{noWaste}\n\n{refs}\n\nNỘI DUNG:\n{{facts}}"};
P.quickfix = {title:"Prompt sửa số từ và câu dài", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], outputNote:"Dán nguyên câu trả lời vào ô Bản hiện tại; danh sách thay đổi sau dòng \"---\" tự chuyển sang ô bên dưới. Sau đó xem phần so sánh ở bước 5.", t:
"Đây là bài {readOrListenNoun} hiện tại. Theo cách đếm của EC Text Profiler, bài có {nowWords} từ ({countIncl}); yêu cầu {words} từ. Các câu trên 25 từ: {nowLong}.\n\nHãy sửa: thêm hoặc bớt bằng cách diễn đạt lại, không thêm thông tin mới, không thêm câu bình luận; tách các câu dài. Giữ nguyên sự kiện, con số, thứ tự ý và chính tả {spelling}. Sửa ít câu nhất có thể.\n\n{slackRules}\n\n{locks}\n\nTrình bày: toàn bài đã sửa trước; sau một dòng \"---\", liệt kê từng thay đổi theo dạng: câu cũ → câu mới.\n\n{refs}\n\nBÀI HIỆN TẠI:\n{{draft}}"};
P.b6 = {title:"Prompt B6 · Hạ từ vượt mục tiêu (bài quá khó)", inputs:["above","keep"], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], outputNote:"Dán nguyên câu trả lời vào ô Bản hiện tại; danh sách thay đổi sau dòng \"---\" tự chuyển sang ô bên dưới. Sau đó xem phần so sánh ở bước 5.", t:
"Đây là bài {readOrListenNoun} cần hạ độ khó từ vựng. Mục tiêu: độ phủ từ vựng ở mức {level} từ {cov}% trở lên, số từ {words}.\n\n1. Thay các từ trong danh sách bên dưới bằng từ đồng nghĩa ở mức {level} trở xuống, trừ các từ giữ lại để hỏi: {{keep}}. Từ ghi \"ngoài danh sách\" thường là từ phái sinh (đuôi -ly, -ness, -tion…) hoặc thuật ngữ: thay bằng từ có trong CEFR-J nếu được, giữ nguyên tên riêng và thuật ngữ chính của bài.\n2. Tách các câu trên 25 từ: {nowLong}.\n3. Không đổi sự kiện, con số, thứ tự ý. Không thêm câu lặp ý để giữ số từ. Từ thay phải giữ đúng nghĩa trong câu, không rộng hơn hay hẹp hơn; nếu không có từ thay cùng nghĩa, giữ nguyên và báo lại.\n\n{slackRules}\n\n{locks}\n\nTrình bày: bài đã sửa trước; sau một dòng \"---\", liệt kê: từ cũ → từ mới, và câu cũ → câu mới nếu có tách câu.\n\n{refs}\n\nDANH SÁCH TỪ CẦN XỬ LÝ ({aboveSrc}):\n{aboveList}\n\nBÀI:\n{{draft}}"};
P.b6up = {title:"Prompt B6b · Nâng mức từ vựng (bài quá dễ)", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], outputNote:"Dán nguyên câu trả lời vào ô Bản hiện tại; danh sách thay từ sau dòng \"---\" tự chuyển sang ô bên dưới. Sau đó xem phần so sánh ở bước 5 và chạy lại Text Profiler.", t:
"Bài {readOrListenNoun} dưới đây có từ vựng thấp hơn mức mục tiêu. Kết quả đo (trang tự tra theo CEFR-J/Octanove, từ ngoài danh sách tính là từ khó, tên riêng không tính): mức ở ngưỡng 96% là {lvl98Txt}; độ phủ ở mức {belowLevel} là {covBelowTxt}. Yêu cầu: mức ở ngưỡng 96% đạt {floorText}, nghĩa là độ phủ ở mức {belowLevel} phải dưới 96%.\n\nHãy thay {upN} bằng từ cùng nghĩa ở mức {upRange} theo CEFR-J Wordlist 1.5 (A1–B2) hoặc Octanove Vocabulary Profile 1.0 (C1–C2):\n- Có thể bắt đầu từ các từ thông dụng dùng nhiều trong bài: {upCands}. Không thay từ khoá chủ đề của bài (các từ trong tiêu đề, tên khái niệm chính).\n- Chỉ thay khi từ mới tự nhiên, đúng nghĩa trong câu và hợp văn phong trung tính, khách quan. Không dùng từ trên mức {level}.\n- Chỉ dùng từ có trong hai danh sách trên. Không dùng từ phái sinh hay thuật ngữ ngoài danh sách, vì chúng bị tính là vượt mức ở độ phủ.\n- Rải đều các đoạn, không dồn vào một câu. Có thể đổi cấu trúc một số câu để từ mới dùng tự nhiên hơn.\n- Không thêm thông tin, không đổi sự kiện, con số. Giữ tổng số từ trong {wordsK}.\n\n{slackRules}\n\n{locks}\n\nTrình bày: toàn bài đã sửa trước; sau một dòng \"---\", liệt kê: từ cũ → từ mới (mức CEFR của từ mới).\n\n{refs}\n\nBÀI:\n{{draft}}"};
P.b7 = {title:"Câu lệnh kiểm nội dung và đề xuất sửa", inputs:["orig","draft"], t:
"Kiểm bản biên tập dưới đây so với bản gốc, theo từng ý, rồi đề xuất cách sửa. Mục đích: phát hiện thông tin sai hoặc bị thêm, KHÔNG phải soát cách diễn đạt.\n\nPHẦN A. KIỂM\n1. Tách bản biên tập thành các ý nhỏ (mỗi câu thường có 1–3 ý: một sự kiện, một con số, một quan hệ nhân–quả hoặc so sánh, một nhận định của tác giả).\n2. Với mỗi ý, đối chiếu bản gốc và chấm một trong ba nhãn: KHỚP / LỆCH / KHÔNG CÓ TRONG NGUỒN.\n- Diễn đạt khác, đổi cấu trúc câu, dùng từ đơn giản hơn mà nghĩa giữ nguyên: KHỚP. Không liệt kê.\n- Phần bản gốc bị lược bớt: không tính là lỗi.\n3. Chỉ liệt kê các ý LỆCH hoặc KHÔNG CÓ TRONG NGUỒN, chia mức:\n- PHẢI SỬA: sai con số, tên, ngày tháng; thêm thông tin không có trong nguồn; thêm nhận định, quan điểm không có trong nguồn hoặc ngược với nguồn (kể cả khi đặt vào lời người nói của bài nghe); đảo hoặc tự tạo quan hệ nhân–quả, so sánh.\n- NÊN XEM: đổi mức độ chắc chắn (ví dụ \"may\" thành \"will\"); nói chung hơn hoặc hẹp hơn nguồn; đổi thái độ của tác giả.\n- TỰ NHIÊN (không bắt buộc sửa): câu nghe gượng ép hoặc không tự nhiên với người bản xứ, lặp ý, chen từ hay thành ngữ không cần thiết. Chỉ ghi những câu thật sự gượng, tối đa 3 câu.\nTrình bày bảng: STT | mức | câu trong bản biên tập | nguồn nói gì{pageCol}.\n4. Dòng cuối phần A: \"Tổng: N ý; KHỚP: …; PHẢI SỬA: …; NÊN XEM: …\".{pdfExtra}\n\nPHẦN B. CÁC CHỖ SỬA\nViết đúng khuôn dưới đây để trang web tự áp dụng. Không thêm chữ nào khác trong phần này, không dùng bảng, không in đậm.\nDòng đầu tiên của phần B là:\n=== CÁC CHỖ SỬA ===\nMỗi dòng trong bảng ở phần A là một khối, theo đúng thứ tự STT:\nSỬA 1 | PHẢI SỬA (hoặc NÊN XEM, TỰ NHIÊN)\nCŨ: (chép y nguyên từng chữ, từng dấu câu của MỘT câu trong bản biên tập; không viết tắt, không thêm ngoặc kép, không thêm dấu …)\nMỚI: (câu thay thế cho đúng câu đó)\nLÝ DO: (một dòng)\nCác khối cách nhau một dòng trống. Nếu không có chỗ nào cần sửa, dưới dòng đầu tiên chỉ ghi: KHÔNG CÓ\n\nYêu cầu cho câu MỚI:\n- Chỉ sửa đúng chỗ sai; giữ nguyên các phần còn lại của câu.\n- Số từ chênh không quá 3 từ so với câu CŨ. Không tách câu, không gộp câu.\n- Chỉ dùng từ ở mức {level} trở xuống có trong CEFR-J Wordlist 1.5 hoặc Octanove Vocabulary Profile 1.0, trừ tên riêng, con số và thuật ngữ đã có trong nguồn.\n- Không chép nguyên văn câu của bản gốc.\n- Chính tả {spelling}.\n- Giữ Flesch Reading Ease {freWin}: không tách hay gộp câu, không đổi từ ngắn thành từ dài (hoặc ngược lại) nếu không cần.\n\n{keepPassing}\n\n{locks}\n\n{omitBlock}BẢN GỐC:\n{{orig}}\n\nBẢN BIÊN TẬP:\n{{draft}}"};
P.b7trans = {title:"Prompt kiểm bản dịch (cuộc trò chuyện mới)", inputs:["srcVi","src"], t:
"So sánh văn bản tiếng Việt và bản dịch tiếng Anh dưới đây. Liệt kê mọi chỗ bản dịch:\n- thêm ý không có trong bản tiếng Việt, hoặc bỏ sót ý;\n- đổi con số, tên riêng, ngày tháng;\n- đổi nghĩa (mạnh hơn, yếu hơn, rộng hơn, hẹp hơn), quan hệ nhân–quả, thái độ hoặc mức độ chắc chắn.\n\nTrình bày bảng: bản tiếng Việt | bản dịch | loại sai lệch | đề xuất sửa. Nếu không có sai lệch ở một loại, ghi \"Không phát hiện\".\n\nBẢN TIẾNG VIỆT:\n{{srcVi}}\n\nBẢN DỊCH:\n{{src}}"};
P.b7facts = {title:"Prompt kiểm đoạn dữ kiện (cuộc trò chuyện mới)", inputs:["src","facts"], t:
"So sánh văn bản nguồn và đoạn dữ kiện tóm tắt dưới đây. Đối chiếu từng câu của đoạn dữ kiện với chỗ tương ứng trong nguồn và liệt kê mọi chỗ đoạn dữ kiện:\n- thêm thông tin không có trong nguồn, hoặc có câu không tìm được chỗ tương ứng trong nguồn;\n- đổi con số, đơn vị, tên riêng, chức danh, ngày tháng, hoặc tính ra con số mới;\n- gộp hai con số hoặc hai dữ kiện thuộc hai bối cảnh khác nhau;\n- đổi người nói hoặc người làm, biến ý kiến thành sự thật;\n- đổi quan hệ nhân–quả, so sánh, hoặc tự nối hai dữ kiện thành nhân–quả;\n- thêm, bỏ hoặc đổi từ chỉ mức độ chắc chắn, ước lượng, tần suất (ví dụ \"may\" thành \"will\", thêm \"about\");\n- thay thuật ngữ bằng từ khác làm lệch nghĩa.\nKhông liệt kê chỗ chỉ rút gọn hoặc khác cách diễn đạt mà dữ kiện và nghĩa giữ nguyên.\n\nPhần A. Trình bày bảng: STT | nguồn (chép nguyên văn) | đoạn dữ kiện (chép nguyên văn) | loại thay đổi | cách sửa. Nếu không có chỗ nào sai, ghi \"Không phát hiện\".\n\nPhần B. Nếu phần A có ít nhất một chỗ sai: viết lại TOÀN BỘ đoạn dữ kiện đã sửa trong MỘT khối code (```text ... ```), chỉ sửa đúng các chỗ trong bảng, giữ nguyên các câu còn lại và thứ tự câu; không thêm dữ kiện mới. Nếu không có chỗ nào sai, ghi \"Không cần viết lại\" và không viết khối code.\n\nNGUỒN:\n{{src}}\n\nĐOẠN DỮ KIỆN:\n{{facts}}"};
P.fixpara = {title:"Prompt sửa một đoạn (giữ nguyên phần đã duyệt)", inputs:["paraTarget","fixReason"], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], outputNote:"Dán nguyên câu trả lời vào ô Bản hiện tại; danh sách thay đổi sau dòng \"---\" tự chuyển sang ô bên dưới. Sau đó xem phần so sánh ở bước 5.", t:
"Bài {readOrListenNoun} dưới đây đã được duyệt, trừ một phần cần sửa.\nPhần cần sửa: {{paraTarget}}.\nVấn đề: {{fixReason}}.\n\nChỉ viết lại phần này. Nếu cần thêm chi tiết, chỉ lấy dữ kiện có trong phần {fixSrcName} ở cuối câu lệnh này và diễn đạt bằng câu chữ của bạn, không chép nguyên câu. Giữ độ dài phần này gần như cũ (chênh không quá 10 từ) để tổng bài vẫn đạt độ dài {words} từ. Mọi phần khác giữ nguyên từng chữ.\n\n{keepPassing}\n\n{slackRules}\n\n{locks}\n\nTrình bày: toàn bài sau khi sửa; sau một dòng \"---\", ghi: phần cũ → phần mới.\n\n{refs}\n\n{fixSrcHead}:\n{{orig}}\n\nBÀI ĐÃ DUYỆT:\n{{draft}}"};
P.b5r = {title:"Prompt B5 · Lập bản đồ đoạn", inputs:["draft"], t:
"Với bài đọc dưới đây, lập bảng cho từng đoạn: (1) ý chính; (2) 1–2 dữ kiện tường minh; (3) đại từ quy chiếu và tiền ngữ của nó; (4) từ nhiều nghĩa có thể hỏi đoán nghĩa; (5) thái độ hoặc quan điểm ngầm, nếu có.\n\nĐánh dấu đoạn nào không đủ chất liệu cho ít nhất một câu hỏi. Chỉ ghi những gì có sẵn trong bài, không gợi ý thêm nội dung. Sau bảng, cho biết bài có đủ chất liệu cho các tiểu kỹ năng sau không, và tiểu kỹ năng nào còn thiếu: {skills}.\n(Mã tiểu kỹ năng: {skillcodes})\n\nKhông soạn câu hỏi.\n\nBÀI ĐỌC:\n{{draft}}"};
P.setfix = {title:"Câu lệnh sửa bối cảnh kịch bản", inputs:["draft","setting","settingNote","facts"], t:
"Kịch bản nghe dưới đây ({partShort} của đề thi Nghe VSTEP) đang có bối cảnh như sau:\n{{setting}}\n\nNgười soạn đề nhận xét: {{settingNote}}\n\nHãy sửa bối cảnh theo nhận xét:\n- Chỉ đổi những chỗ thuộc về bối cảnh: câu mở đầu gợi bối cảnh, cách xưng hô, giọng điệu, các manh mối về người nói, người nghe, dịp nói (với hội thoại: cả vai và quan hệ của hai người). Mọi câu khác giữ nguyên từng chữ.\n- Bối cảnh mới khớp chủ đề và hợp thực tế (chuyện có thể xảy ra thật; người nói có lý do tự nhiên để nói về đúng nội dung này với đúng người nghe này, trong dịp này), khớp mức {level} (mức thấp dùng tình huống đời thường, quen thuộc; mức cao mới dùng bối cảnh học thuật hoặc chuyên môn), và gợi chứ không nói ra: không nêu thẳng nghề, vai, địa điểm hay tên chương trình; ít nhất 2 manh mối gián tiếp ở phần mở đầu và rải trong bài, cùng chỉ về một bối cảnh.\n- Không thêm dữ kiện về chủ đề; giữ nguyên mọi dữ kiện, con số, tên riêng, thứ tự ý và các chỗ có thể đặt câu hỏi. Giữ độ dài gần như cũ (chênh không quá 10 từ) để bài vẫn đạt độ dài {wordsK} từ. Giữ văn nói và mức khẩu ngữ hoá hiện có.\n\n{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code. Trong khối code: toàn bộ kịch bản đã sửa; sau đó một dòng riêng \"=== GHI CHÚ ===\", rồi ghi số từ và mục bối cảnh mới theo đúng khuôn, mỗi trường một dòng:\n{settingFormat}\n\nVĂN BẢN NGUỒN (đoạn dữ kiện đã duyệt; chỉ để đối chiếu, không thêm dữ kiện):\n{{facts}}\n\nKỊCH BẢN HIỆN TẠI:\n{{draft}}"};
P.b5l = {title:"Prompt B5 · Lập bản đồ vùng thông tin", inputs:["draft"], t:
"Với kịch bản nghe dưới đây, lập bảng các vùng thông tin theo thứ tự xuất hiện: (1) câu hoặc lượt lời; (2) dữ kiện có thể hỏi; (3) thông tin dễ gây nhầm ở gần đó, kể cả chỗ người nói sửa lời hoặc đổi ý; (4) quan điểm hoặc thái độ của người nói, nếu có.\n\nBài này có {qcountShort} hỏi. Cho biết bài có đủ vùng thông tin tách biệt, không chồng lên nhau, cho {qcountShort} đó hay không. Không soạn câu hỏi.\n\nKỊCH BẢN:\n{{draft}}"};

/* ---------- State ---------- */
var KEY = "vstep-pipeline-v5";
var S = {step:"bat-dau",srcLang:"en",srcMode:"text",fixOpen:{},spec:"R2",level:"B2",spelling:"Anh–Anh",floor:"0",paras:"5",poly:"2–3",code:"",gates:{},fields:{},slots:{}};
function load(){ try{ var raw=localStorage.getItem(KEY); if(raw){ var o=JSON.parse(raw); for(var k in o){ S[k]=o[k]; } } }catch(e){} S.slots=S.slots||{}; S.fields=S.fields||{}; S.gates=S.gates||{}; }
var saveT; function save(){ clearTimeout(saveT); saveT=setTimeout(function(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} },250); }

function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function slug(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").trim().replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30); }
function slotVal(id){ if(id==="orig") id = origId(); if(isPdfSrc(id)) return pdfRef(); var v=S.slots[id]; if(v===undefined && SLOTS[id] && SLOTS[id].type==="select") v=SLOTS[id].options[0]; if(v==="chưa đo") v=""; return (v||"").trim(); }
function origId(){ return SPEC[S.spec].skill==="L" ? "facts" : "src"; }

/* ---------- Text analysis (Text Profiler counting rules) ---------- */
var US_WORDS = ["color","colors","colored","colorful","behavior","behaviors","favor","favorite","favorable","honor","honors","labor","neighbor","neighbors","neighborhood","humor","center","centers","centered","theater","theaters","traveling","traveled","traveler","travelers","canceled","canceling","modeling","modeled","labeled","labeling","gray","defense","offense","catalog","dialog","analog","jewelry","aluminum","fulfill","enroll","mom","program","programs","percent","fiber","liter","meters","kilometer","kilometers"];
var UK_WORDS = ["colour","colours","coloured","colourful","behaviour","behaviours","favour","favourite","favourable","honour","honours","labour","neighbour","neighbours","neighbourhood","humour","centre","centres","centred","theatre","theatres","travelling","travelled","traveller","travellers","cancelled","cancelling","modelling","modelled","labelled","labelling","grey","defence","offence","catalogue","dialogue","jewellery","aluminium","fulfil","enrol","mum","programme","programmes","per cent","fibre","litre","metres","kilometre","kilometres"];
var IZE_EXCL = ["size","sizes","sized","seize","seized","seizes","seizing","prize","prizes","capsize","capsized","citizen","bronze"];
var ISE_UK = /\b(recognis|organis|realis|apologis|emphasis(?:e|ed|es|ing)|summaris|criticis|prioritis|specialis|minimis|maximis|utilis|categoris|characteris|memoris|modernis|industrialis|urbanis|globalis|finalis|mobilis|stabilis|analys(?:e|ed|es|ing)\b)\w*/gi;
var MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";

function wc(s){ return s.replace(/[—–]/g," ").split(/\s+/).filter(function(t){ return /[\p{L}\p{N}]/u.test(t); }).length; }
function analyze(text){
  text = text.replace(/\r/g,"").replace(/[’‘]/g,"'");
  var paras = text.split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean);
  var total=0, titles=[], body=[], sents=[];
  paras.forEach(function(p){
    var n = wc(p); total += n;
    var isTitle = p.indexOf("\n")===-1 && n>=1 && n<=10 && !/[.?!…:;"'”’)\]]$/.test(p);
    if(isTitle) titles.push({text:p,n:n}); else body.push({text:p,n:n});
  });
  body.forEach(function(b){
    b.text.split(/\n/).forEach(function(line){
      line=line.trim(); if(!line) return;
      line.split(/(?<=[.!?…]["'”’)]?)\s+(?=["'“‘(]?[\p{Lu}\p{N}])/u).forEach(function(s){ if(s.trim()) sents.push(s.trim()); });
    });
  });
  var lens = sents.map(wc);
  var long = sents.filter(function(s,i){ return lens[i]>25; }).map(function(s){ return {s:s,n:wc(s)}; });
  var lower = " " + text.toLowerCase() + " ";
  var us=[], uk=[];
  US_WORDS.forEach(function(w){ if(new RegExp("\\b"+w+"\\b").test(lower)) us.push(w); });
  UK_WORDS.forEach(function(w){ if(new RegExp("\\b"+w.replace(" ","\\s")+"\\b").test(lower)) uk.push(w); });
  (text.match(/\b\w+(?:ize|izes|ized|izing|ization|izations|yze|yzed|yzes|yzing)\b/gi)||[]).forEach(function(w){ if(IZE_EXCL.indexOf(w.toLowerCase())===-1 && us.indexOf(w.toLowerCase())===-1) us.push(w.toLowerCase()); });
  (text.match(ISE_UK)||[]).forEach(function(w){ if(uk.indexOf(w.toLowerCase())===-1) uk.push(w.toLowerCase()); });
  var usDates = text.match(new RegExp("\\b(?:"+MONTHS+")\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}","g"))||[];
  var ukDates = text.match(new RegExp("\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:"+MONTHS+")\\s+\\d{4}","g"))||[];
  return {total:total,titles:titles,body:body,sents:sents,lens:lens,long:long,us:us,uk:uk,usDates:usDates,ukDates:ukDates};
}

/* ---------- Template variables ---------- */
function refsText(sp, v){
  var lines = [];
  lines.push("CĂN CỨ ĐO (bài sẽ được kiểm bằng EC Text Profiler, https://textprofiler.edtechcorner.com, preset \""+sp.preset+"\"):");
  lines.push("- Thông số phần thi theo Hướng dẫn định dạng đề thi bậc 3–5 (QĐ 730/QĐ-BGDĐT, cập nhật 13/5/2016) và yêu cầu của nhóm soạn đề: "+sp.label+"; "+sp.genre+"; "+sp.words+" từ (dải QĐ: "+sp.qd+")"+(sp.speed?"; "+sp.speed:"")+".");
  lines.push("- Cách đếm từ: " + (sp.skill==="R" ? "tính cả tiêu đề; " : "bài nghe không có tiêu đề; ") + "mỗi cụm có chữ cái hoặc chữ số là 1 từ (4,458; 13:00; 2020 đều là 1 từ); dạng rút gọn (don't) và từ có gạch nối (well-known) là 1 từ; dấu gạch dài (—) tách hai từ."+((sp.skill==="L"&&sp.grp!==3)?" Tên người nói ở đầu mỗi lượt lời cũng được tính.":""));
  if(sp.skill==="R") lines.push("- Tiêu đề: một dòng, 1–10 từ, không có dấu câu ở cuối. Đoạn văn cách nhau bằng một dòng trống. Câu dài là câu trên 25 từ.");
  else lines.push("- Câu dài là câu trên 25 từ." + (sp.grp===3 ? "" : " Bài hội thoại: mỗi lượt lời một dòng."));
  lines.push("- Mức từ vựng: tra theo từ gốc và từ loại trong CEFR-J Wordlist 1.5 (A1–B2) và Octanove Vocabulary Profile 1.0 (C1–C2), danh sách tại https://github.com/openlanguageprofiles/olp-en-cefrj. Độ phủ ở mức "+v.level+" = tỷ lệ lượt từ có mức từ "+v.level+" trở xuống, không tính danh từ riêng; yêu cầu từ "+sp.cov+"% trở lên.");
  lines.push("- Từ không có trong hai danh sách bị tính là không phủ, kể cả nhiều từ phái sinh (đuôi -ly, -ness, -tion; tiền tố un-, re-, dis-) và thuật ngữ. Khi có từ thông dụng cùng nghĩa, ưu tiên từ thông dụng.");
  return lines.join("\n");
}
function keepList(){ var a = (slotVal("keep")||"").split(/[,;\n]+/).map(function(s){return s.trim();}).filter(Boolean); if(typeof mapKeep==="function") mapKeep().forEach(function(w){ if(a.map(function(x){ return x.toLowerCase(); }).indexOf(w.toLowerCase()) < 0) a.push(w); }); return a; }
function locksText(sp, v){
  var keep = keepList();
  var L = ["NHỮNG ĐIỀU ĐÃ DUYỆT, KHÔNG ĐƯỢC ĐỔI:",
    "- Chỉ sửa đúng những gì được yêu cầu; mọi câu khác giữ nguyên từng chữ.",
    "- Giữ nguyên các từ sau (không thay, không bỏ): " + (keep.length ? keep.join(", ") : "không có") + "."];
  if(sp.skill==="R"){
    L.push("- Giữ nguyên tiêu đề, số đoạn (" + v.paras + ") và ý chính của từng đoạn.");
    L.push("- Giữ nguyên các từ nhiều nghĩa, các cặp đại từ quy chiếu – tiền ngữ (không đưa tiền ngữ lại gần đại từ), các từ nối chỉ đối lập, nguyên nhân–kết quả, và các chỗ ghi trong BẢN ĐỒ ĐIỂM NEO của ghi chú (nếu có).");
  } else {
    L.push((sp.grp===3 ? "- Giữ nguyên chỗ người nói tự sửa lời hoặc đổi ý, và các con số, tên riêng.\n" : "- Giữ nguyên tên người nói, thứ tự lượt lời, chỗ người nói sửa lời hoặc đổi ý, và các con số, tên riêng.\n") + "- Giữ văn nói: không bỏ dạng rút gọn, câu hỏi, cách xưng I/we, chỗ lược từ, từ đệm, chỗ ngập ngừng; không đổi sang văn viết (không thêm câu bị động, mệnh đề quan hệ chen trong câu, từ nối kiểu however, therefore, moreover).");
  }
  var notes = slotVal("notes");
  if(notes) L.push("GHI CHÚ BIÊN TẬP ĐÃ DUYỆT (chi tiết các mục trên):\n" + notes);
  return L.join("\n");
}
var lastAnalysis = null;
function vars(){
  var sp = SPEC[S.spec];
  var isR = sp.skill==="R";
  var v = {
    skillName: isR?"Đọc":"Nghe",
    partShort: sp.label.replace(/^Đọc |^Nghe /,""),
    genre: sp.genre, words: sp.words, qd: sp.qd,
    paras: isR ? (S.spec==="R1" ? "4" : (S.paras||"5")) : "",
    level: S.level, spelling: S.spelling,
    dateEx: S.spelling==="Anh–Anh" ? "21 January 2000" : "January 21, 2000",
    poly: S.poly||"2–3",
    skills: sp.skills||"", skillcodes: SKILLCODES,
    preset: sp.preset, cov: sp.cov, qcount: sp.qcount,
    qcountShort: (sp.qcount||"").split(" (")[0],
    readOrListen: isR?"đọc":"nghe",
    readOrListenNoun: isR?"đọc":"nghe (kịch bản)",
    speakerParen: (!isR && sp.grp!==3) ? " và tên người nói" : "",
    countIncl: isR ? "tính cả tiêu đề" : (sp.grp!==3 ? "tính cả tên người nói" : "bài nghe không có tiêu đề"),
    wordsK: /^khoảng/.test(sp.words||"") ? sp.words : "khoảng " + sp.words
  };
  var d = slotVal("draft");
  if(d){ var a = lastAnalysis || analyze(d); v.nowWords = String(a.total); v.nowLong = a.long.length ? a.long.map(function(l){ return "\""+l.s+"\" ("+l.n+" từ)"; }).join("; ") : "không có"; }
  else { v.nowWords = "[chưa có bản hiện tại]"; v.nowLong = "[chưa có bản hiện tại]"; }
  var LV = ["A1","A2","B1","B2","C1","C2"], ti = LV.indexOf(S.level), fl = Math.max(0, ti - (parseInt(S.floor,10)||0));
  v.floorLevel = LV[fl];
  v.upRange = fl===ti ? S.level : LV[fl] + "–" + S.level;
  v.floorText = fl===ti ? "đúng " + S.level : LV[fl] + " hoặc " + S.level;
  v.belowLevel = fl>0 ? LV[fl-1] : "(không có)";
  v.bandText = "độ phủ ở mức " + S.level + " từ " + sp.cov + "% trở lên (chặn trên), và mức ở ngưỡng 96%, tính cả từ ngoài danh sách, đạt " + v.floorText + " (chặn dưới)";
  var cb = parseFloat(String(S.slots.pfCovBelow||"").replace(",", "."));
  if(!isNaN(cb) && cb >= 95 && d){ var tok = Math.round((lastAnalysis||analyze(d)).total * 0.94); v.upN = "khoảng " + (Math.ceil((cb - 94.9) / 100 * tok) + 2) + " lượt từ (ước lượng để độ phủ ở mức " + v.belowLevel + " xuống dưới 95%, đã cộng 2 từ dự phòng)"; }
  else v.upN = "một số từ thông dụng (thường cần khoảng 3–6% số lượt từ của bài)";
  v.refs = refsText(sp, v);
  v.fixSrcName = "VĂN BẢN NGUỒN";
  var who = sp.grp===2 ? "hai người: vai và quan hệ của từng người" : (sp.grp===1 ? "ai nói; nếu là hội thoại thì vai và quan hệ của từng người" : "ai nói, vai gì");
  v.settingFormat = "BỐI CẢNH:\nNgười nói: (" + who + ")\nNgười nghe: (" + (sp.grp===2 ? "hai người nói với nhau; ghi thêm nếu có người nghe khác" : "nói với ai") + ")\nDịp, nơi nói: (…)\nManh mối trong bài: (trích nguyên văn các chỗ gợi bối cảnh, cách nhau bằng dấu chấm phẩy)\nHợp với nội dung và mức vì: (một câu)";
  v.settingReq = sp.skill==="L" ? "- Trong phần ghi chú cuối bài, sau số từ, ghi mục bối cảnh theo đúng khuôn sau, mỗi trường một dòng (người soạn đề sẽ đọc để xét bối cảnh có hợp không):\n" + v.settingFormat : "";
  v.fixSrcHead = sp.skill === "L" ? "VĂN BẢN NGUỒN (đoạn dữ kiện đã duyệt; chỉ để lấy dữ kiện)" : "VĂN BẢN NGUỒN (chỉ để lấy dữ kiện)";
  v.locks = locksText(sp, v);
  if(typeof extendVars==="function") extendVars(v);
  return v;
}

/* ---------- Prompt rendering ---------- */
function promptKey(name){
  var sp = SPEC[S.spec];
  if(name==="b8") return "b8_"+(sp.grp||2);
  if(name==="q") return sp.skill==="R" ? "qR" : "qL";
  if(name==="b5") return sp.skill==="R" ? "b5r" : "b5l";
  return name;
}
function slotsIn(t){ var out=[], re=/\{\{(\w+)\}\}/g, m; while((m=re.exec(t))){ if(out.indexOf(m[1])===-1) out.push(m[1]); } return out; }
function missing(p){
  return slotsIn(p.t).filter(function(id){ var real = id==="orig"?origId():id; return !SLOTS[real].optional && !slotVal(id); }).map(function(id){ var real = id==="orig"?origId():id; return isPdfSrc(real) ? "tên file PDF và phần dùng (bước Nguồn)" : SLOTS[real].label; });
}
function assemble(p, v){
  return p.t.replace(/\{\{(\w+)\}\}/g, function(m,id){ var real=id==="orig"?origId():id; var val=slotVal(id); return val || (SLOTS[real].optional ? SLOTS[real].empty : "["+SLOTS[real].label+"]"); })
            .replace(/\{(\w+)\}/g, function(m,k){ return (k in v) ? v[k] : m; });
}
function preview(p, v){
  var parts = p.t.split(/(\{\{\w+\}\}|\{\w+\})/);
  return parts.map(function(seg){
    var m2 = seg.match(/^\{\{(\w+)\}\}$/), m1 = seg.match(/^\{(\w+)\}$/);
    if(m2){
      var id=m2[1], real=id==="orig"?origId():id, val=slotVal(id), sl=SLOTS[real];
      if(!val) return sl.optional ? '<mark class="slot">'+esc(sl.empty)+'</mark>' : '<mark class="miss">[chưa nhập: '+esc(sl.label)+']</mark>';
      if(val.length>220){ return '<mark class="slot">'+esc(val.slice(0,200))+' … (toàn văn '+wc(val)+' từ sẽ được chép)</mark>'; }
      return '<mark class="slot">'+esc(val)+'</mark>';
    }
    if(m1){ var k=m1[1]; if(!(k in v)) return esc(seg); if(v[k]==="") return ""; return '<mark class="auto">'+esc(v[k])+'</mark>'; }
    return esc(seg);
  }).join("");
}
;
/* ================= Tra mức từ vựng CEFR-J + Octanove (chạy trên trang) ================= */
var LEXD = {"lv":{"A1":"a about above action activity actor add address aeroplane afraid after afternoon again age ago agree airplane airport album all almost alone along already also always am an and angry animal another answer any anybody anyone anything apple april apron are arm around arrive art article as ask at august aunt autumn awake away baby back bad bag ball banana band bank bar baseball basketball bat bath bathroom be beach bean bear beautiful because become bed bedroom bee beef before begin behind believe bell below beside best better between bicycle big bike bird birth birthday biscuit black blank block blow blue board boat body bone book bookstore boring borrow both bottle bottom bowl box boy boyfriend brain bread break breakfast breathe bridge bright bring broken brother brown brush bucket build building burger bus business busy but butter butterfly button buy by bye cafe cake call camera camp can candy cap car card care careful carefully carry cartoon case cat catch cd celebrate celebration chair change character check cheese chicken child chocolate choose church cinema circle city class classmate classroom clean clever climb clock close closed cloth clothes cloud cloudy club coach coat code coffee coke cold collect collection college color colour come computer concert contest conversation cook cookie cool cop copy corn corner correct couch could course cousin cover cow cream cry culture cup cut cute dad daddy dance dancing dark date daughter day dear december delicious describe design desk dictionary did difference different difficult dig dinner dirty discuss dish do doctor does dog doing doll dollar door down dr drama draw dream dress drink drive driver drop drum dry due dvd each ear early easy eat egg eight eighteen eighty either elementary eleven else email end engineer enjoy evening event every everybody everyday everyone everything everywhere example excellent excited exciting excuse exercise expensive eye face factory fair fairy false family famous fan farm farmer fast fat father favorite favourite february feed feel feeling festival fever field fifteen fifty fight file fill find fine finish fire first fish fishing five flag flat floor flower fly focus foggy following food football for foreign foreigner forget form forty four fourteen free friday friend frog from front fruit full fun funny future game garbage garden get ghost gift girl girlfriend give glad glass glasses go goal gold good grade grammar grandfather grandma grandmother grandpa grandparent grape grass gray great green greet grey ground group grow guess guest guitar guy habit had hair haircut half hall hamburger hand handsome happen happy hard has hat have he head headache health healthy hear heart heavy hello help her here hers hi hide high hill him his history hobby hold hole holiday home hometown homework hope horse hospital hot hotel hour house how hungry hurry hurt husband i ice idea ideal if imagine important in information inside interested interesting internet interview interviewer into introduce is island it item its jacket january jeans jet jewellery jewelry job join judge juice july jump june just keep key kick kid kill kind king kiss kitchen kite knee knife know lady language large late later laugh lazy leader leaf learn leave left leg lesson let letter library life light like lily line lion list listen little live living lonely long look lot love lovely luck lucky lunch machine magazine mail make man many map march match math maths matter may maybe me meal mean meat medicine meet meeting memory merry message middle milk mind mine minute miss mobile mom moment mommie mommy monday money monkey month moon more morning most mother mountain mouse mouth move movie mr mrs much mum music musician must my name nationality near neck need neighbor neighbour never new news newspaper nice night nine nineteen ninety no noise nose not note notebook nothing november now number nurse o'clock october of off office officer often ok okay old olympics on once one only open opera or orange order other our ours out outside over own owner page paint painting pair palace pants paper paragraph pardon parent park partner party past pay peace pen pencil people period person personal pet phone photo piano pick picnic picture piece pig pink pizza place plan plane play player please pleasure pm pocket poem point pollution pool poor pop post poster potato practice practise pray present pretty price prince princess problem program programme purple push put quarter question quickly quiet rabbit radio rain rainy rat read reader reading ready real really reason red remember repeat reporter restaurant result review ribbon rice rich ride right ring river role room rose row rude rule ruler run sad sailor salad sale same sandwich saturday save saw say school science scientist sea seat second section see self sell sentence september set seven seventeen seventy shake share she sheep shelf ship shirt shoe shop shopping short should shoulder show shower shy sick side sight sign sing singer sir sister sit site six sixteen sixty size skill skirt sky sleep slow small smart smell smile smith smoke smoking snake snow snowy so soccer social sofa solve some someone something son song soon sorry soup speak special speech spell spend sport spot spring spy stage stand star start station stay step still stone stop store story straight strange street strict strong student study subject subway successful sugar suggestion sum summer sun sunday sunny sunshine super supermarket sure surf surprise survey sweet swim swimming table take talk tall taxi tea teach teacher team technology telephone television tell temple ten tennis terrible test than thank thanks that the theater theatre their them then there these they thick thin thing think thirteen thirty this those three through throw thursday ticket tiger tight time tired to today together toilet tomato tomorrow tonight too tool tooth top topic touch towel tower town toy train travel tree trip trousers truck true try tube tuesday turkey turn tv twelve twenty two type ugly umbrella uncle under underline until up us use usually vacation vase vegetable very video visit volleyball vote wait waiter waitress wake walk wall want war warm was wash watch water way we wear weather wednesday week weekend welcome well were what wheel when where which white who whose why wife will win wind window winter wish with woman wonderful word work worker world worry would write writer wrong yard year yellow yes yesterday yet yoghurt yogurt you young your yours yourself zoo","A2":"ability abroad accept acceptable accident account achieve across act actually addition additional adjective adjust admire admit adult advanced advantage adventure advertisement advertising advice advise affair against aged agency agent ahead air aisle alarm alive allow alright although ambition among amused amusement ancestor ancient angel angrily ankle anniversary annoy annoying anxious anymore anyway anywhere apart apartment apologise apologize apparently appear appearance apply appointment appreciate appropriate architecture area argue argument armchair armed artificial asleep assistant association astronaut athlete atom attack attempt attention attitude attractive audience audio author automatic automatically average avoid award awful background badly badminton bake balcony balloon banking barbecue barber bargain base basic basically basket batch battery bay beauty been beer beg beginner beginning behavior behaviour being belly belong belt bench bend besides beyond bill bit bite blackboard blame blanket blonde blood bloom boil boiled bonus bookcase bookshelf bookshop bored boss bother bra brainstorm brake branch brand brave breeze bride brilliant budget bug bulb burn bury bush businessman businesswoman cab cafeteria calendar camping campus capital captain carrot cash cassette castle cause cent center centimeter centimetre centre century cereal certain certainly chain chairman challenge champagne championship chance chapter chart chat cheap cheek cheer chef chemical cheque chess chest childhood chili chilli chimpanzee chin chirp choice cigarette citizen claim classic cleaner clear clearly clerk click climbing clone clown clue coast coin cola colorful colourful column comb comfortable comic commitment committee common communicate communication company comparative compare competition complain complaint complete composer concentrate concern condition confident confuse confused consequence consider consist contact container context continent continue contrast control convenience convenient cooker cooking cooler correctly cost count country countryside couple court crazy create creative creativity creature credit cricket crime crisp criticise criticize cross crowd crowded crown cruise cupboard curry curse custom customer cycling daily dam dancer danger dangerous daylight dead deal death debate decide deep deeply degree delay dentist depend description desert dessert destroy detail develop developed diamond diary die diet differently difficulty dinosaur direct direction director disadvantage disagree disappear disappointed disappointing disco discover discussion dishonest dislike display disturb divide dizzy done double doubt download downstairs downtown drawer drawing dressed drill drug drugstore duck during dust earn earring earth earthquake easily east editor education educational effect effort elderly electric elephant elevator elsewhere embarrassing emergency empty encourage endangered ending energetic enormous enough enter entertainment entrance envelope envy episode error escalator escape especially essay establish euro even ever evidence exactly exam except exchange exhibition exist expect experience expert explain explanation explore express expression extra extremely fact fail fairly fall familiar fancy fantastic far fare fascinating fashion fault favor favour fear feather feature fee female fence few fiction fighter figure film final finally fisherman fit fix flea flight float flood flour fog folder follow fool footballer forbid force forest forever fork fortunately fortune forward frame frank freedom freeze fresh fridge fried friendship frighten frightened frightening fry fully function furniture further gallery garage garlic gas gate gather gender generation gentle given globe glove golden golf government grace gradually graduate gram gramme grandchild granddad granddaughter grandson granny grateful greatly greedy grilled guard guidebook gun ham handbag handicapped handle happily happiness hardly harm harmful harmony harvest hate headphone headteacher heat heating heavily helpful hero herself hey highway hike hiking himself hiphop hit hockey honey honor honour horror host however hug human hundred hunter id ill illegal image imagination impact impatient importance importantly impossible impress improve inch include increase indeed independence indicate indoor inexpensive influence injure inner insect inspiration instant instead instrument intelligence intelligent interest international invade invent invention invite issue itself jam jelly joke journey joy junior junk killer kilo kilogram kilogramme kilometer kilometre kindly kingdom kit knock knowledge labor labour lack lake lamp land landscape lane last latest latter law lawyer laziness lead learner least leather leisure lemon lemonade lend less level liberty licence license lie lifestyle likely lip liter litre lively load local lock logical loose lose lost loudly lover low luckily lunchtime lyric mad magic mainly major maker male mall manage manager manner mark market married marry marvellous marvelous material max meaning medal medical melon member mention menu metal meter method metre midday midnight might military million mirror missing mistake mix model modern mood mosque mostly motorway ms mug murder museum mushroom musical myself mysterious mystery napkin nation national native natural nature nearly necessary negative nervous net next nobody noisy noon normal north notice noun novel nowadays oak occupation offer official oil olympic omelet omelette onion online operate opinion opportunity oppose opposite organise organised organize organized original orphan ourselves oven overseas overweight pacific pack painter pal pan panic part partly pass passage passenger pasta path patient pc pea peaceful pear pence penfriend pepper perfect perfectly perform performance perfume perhaps permission personality petrol photograph photographer photography physical physically pile pilgrim pill pilot pity planet plant plastic plate playful playground pleasant pleased pleasing plenty plural plus police policeman policewoman polite political pollute popular population portrait position possible possibly pour power powerful precise predict prediction prefer prepare pressure pretend prevent pride principal print printer private pro probably produce product production professional progressive promise pronounce pronunciation proper provide psychologist public publish pull punctuation purpose pursue quality queen quick quietly quit quite quiz racket raincoat raise range rap rate rather rating raw ray reach realise realize receipt receive recent recently receptionist record recycle refer reflect refrigerator regret regular regularly relax relaxed release remain remind remote rent repair replace reply report represent request research response retire retired return reunion reveal rhythm road roast rob robbery robin rock roll romance romantic roof root rope roughly round roundabout royal rugby ruin rumor rumour runner running rush sadly safe sailing sake salt sample sandy satisfy sauce sausage scale scarf scene scenery schedule schoolchild schoolwork scientific scissors scream screen screw script seafood search seaside secret secretary seed seek seem semester send senior sense separate seriously serve several sew shade shadow shall shampoo shape shell shine shock shoot shore shorts shot shout shut sightseeing significant silence silently silly silver similar simple simply since singing single singular sink situation skate skateboarding skating ski skiing slave sleepless sleepy slice slide slim slowly smooth smoothly snack snowboarding soap society sock soda soft softly software soldier solution somebody someday somewhere sound source south space spaceship spaghetti speaker specific speed spill splash split spoon spread square stadium staff stair stamp state statement statue steak steal stomach stomachache storm stove stranger strategy strength strike string strongly structure stuff style succeed success successfully such sudden suggest suit suitable suitcase summary sunflower sunglasses sunlight superlative superstar supper support surfing surname surprised surprising survive swallow sweat sweater sweetheart swimsuit symbol symphony system tablespoon talent tap tape target task tear teenage teenager temperature terrify terrorist text textbook theirs themselves therefore thief third thirsty though thought thousand thunderstorm tidy tie tights till timetable tip title toast toe tone toothache toothbrush tour tourist toward towards track trade tradition traditional traffic training tram trap traveler traveller treasure trick trouble truly trust truth tune twice uncertain uncomfortable understand underwater uneasy unfair unforgettable unfortunately unhappy unhealthy uniform unimportant unit university unknown unlike unnecessary unpleasant unusual upon upset upstairs used useful usual valley value verb view village violent violin visitor vocabulary voice walking wallet wander wave weak wealth web website wedding weekday weekly weep weigh weight west wet whatever wheelchair while whole whom wide widely wild windy wine winner wisdom wise within without wonder wood wooden wool worldwide worried worse worst writing yeah youth zone","B1":"abandon able abnormal aboard aborigine absence absent absolute absolutely absorb abstract abundance abundant academic academy accent acceptance access accessible accessory accidental accidentally accompany accomplish accountant accuracy accurate accurately accuse accustom ache achievement acknowledge acknowledgement acknowledgment acquaintance acquire active actress ad adapt addressee administration admiration admission adopt adorable advance adverb adverbial advert advertise adviser advisor aerobics affect affection afford afterward afterwards agenda aggressive agreement agricultural agriculture aid aim airline alcohol alcoholic alike allergic allowance aloud alphabet alternative altogether amazed amazing ambitious ambulance amount amusing analyse analysis analyze anger angle animated animation announce announcement annoyance annoyed annual annually ant anti antique antonym anxiety anxiously anyhow ape apology apparent appeal appetite applaud applause application appoint appreciation approach approval approve approximately architect arise arithmetic army arrange arrangement arrest arrival arrow artist artistic ashamed aside aspect aspirin assign assignment assist assistance associate assume astronomer athletic atlantic atmosphere atomic attach attachment attain attend attract attraction authority auxiliary available avenue aware awareness awesome awkward babysit babysitter backache backpack backpacker backpacking bacon baggage baker bakery balance bald bandage bang bare barely bark barman barrel basement basin basis bathe battle beard beast beat beautifully beaver bedside behalf behave belief beloved beneath benefit bent bet bilingual bin biochemistry biography biology bishop bitter bleed blend bless blessing blind blog blogger blush boast bold boldly bomb bond booking boom boot border bore boredom bounce bound bow boxing bracelet brainstorming brass bravely breakthrough breast breath breathless breed breeding brick brief briefly brightly broad broadcast broccoli bronze brotherhood bubble buddy builder bull bullet bulletin bump bunch burden bureau burglar burning burst bust butcher buyer cabbage cabin cage calculate calculation calculator calf caller calm calmness camel campsite canal cancel cancer candle canned canteen capable capacity capsule capture career careless carelessly carelessness carpet carriage carton cashpoint casual categorise categorize category cattle caution cautious cave celebrity cell central ceremony certainty challenging champion channel chaos characterise characteristic characterize charge chariot charity charm chase checkout cheerful chemist chemistry cherish chief choir choke christian chronological chuckle circular circus citizenship civil civilisation civilization classical classify cliff climate climber clinic clip closely coal coastal cod coffin collapse collar columnist combination combine comedian comedy comet comfort comma command comment commercial commit commonly companion comparison compete competitive competitor complement completely complex complicate complicated compliment compose composition compound compromise concentration concept concerned conclude conclusion conduct confidence confirm confirmation conflict confusing confusion congratulate connect connection connexion conquer conscious consequently conservation conservative considerable consideration consonant constantly constitute constitution construct construction consume consumer consumption contain content continual continually continuous continuously contrary contribute contribution controversial convey convince copyright correction cotton cough council counseling counselling counter countless county courage courageous courgette craft crash creator criminal crisis critic critical crop crossing crossroads crow cruel crush cucumber cultivate cultural cure curiosity curious curiously curly currency current currently curriculum curtain curve cushion customs cv cycle daisy damage damaged damp dangerously dare darkness dating daze dazzle deadline deadly deaf dealer debris debt decision declaration declare decline decrease dedicate deed defeat defence defend defender defense deficiency define definite definitely definition delete delicate delight delighted delightful deliver delivery demand democracy democratic demonstrate demonstration deny depart department departure dependent deposit depressed depressing depression deprive depth derive deserve designer desire despair desperate despite destination destruction destructive detective determination determine devastate devastating development device devotion diagram dial dialog dialogue diameter diaper differ digital diligence diligent dioxide directly dirt disability disable disabled disagreement disappoint disappointment disaster disastrous disc discomfort discount discourage discovery discrimination disease disgusting dishwasher disk dissolve distance distant distinction distinctly distinguish distribute distribution district disturbance dive diver diverse divine diving divorced dj doc document documentary dolphin dot downward doze dozen drag dramatic drown drunk dude dull dump dustbin dusty duty duvet dynasty eager eagerness earache earnest eastern easygoing eco ecological ecology economic economics economy ecosystem ecstasy edge edition educate effective efficiency efficient elbow election electrical electricity electron electronic element eliminate embarrass embarrassed embarrassment emerge emotion emotional emotionally emperor emphasis emphasize empire employment enable enclose encounter encouragement encouraging encyclopaedia encyclopedia endanger endless endure enemy engage engaged engine engineering englishman enjoyable enjoyment enquiry enrich ensure entertain entertainer enthusiasm enthusiast enthusiastic entire entirely entry environmental environmentalist equal equality equally equipment era essence essential establishment estimate eternal eternity evenly eventually evident exact examination examine examiner excellence excess excitedly excitement exclusive exhausted existence exit expand expense experienced experiment exploration explosion expose extend extensively extent extinct extinction extraordinary extreme eyesight facility fade failure faint faithful fake fallen fantasy faraway farewell farming farmland farther farthest fascinate fashionable fasten favorable favourable fax feast fellow ferry festive fetch feverishly fifth filling filter finance financial finding finger firefighter firework firm firmly fitness flash flavor flavour flock flow flu fluent fluently flunk flute fold folk fond fondness foolish foot forbidden forecast forehead forgive formal formally format former formula forth fortnight fortunate foundation fountain fragment freely freezer freezing frequency frequent frequently freshman friendliness fright frost frozen frustrated frustration fuel fund funeral fur furnish furthermore furthest fuss gain gall gallon gaol gap gardening garment gay gee gene general generally generate generous genetic genetically genetics gentleman geographical geography geology gesture giant gifted giggle ginger giraffe glance glide glimpse glint global glorious glory goalkeeper goddess golfer goodness goods gorgeous gorilla gossip govern governor gown grab graceful graduation grant graph graphic graphics gratitude grave gravy greenhouse greeting grill groom grouping growth guarantee guidance guide guilt guilty guitarist gym gymnastics habitat hairdresser hairdryer hammer handball handkerchief handshake handwriting handy hang hanging harbor harbour hardship harness hasty hatch hatred haunt haven hazard headline heal healing hearing hearted hearty heater heaven heavenly heel height helmet helpless herd hesitate hidden highlight highly hip hire historian historic historical hiv holy homeless honest honestly honesty honeymoon hop hopeful hopefully hopeless horizon horn horrible horrify hostel household housework huge humanity humid humor humorous humour hunger hunt hurriedly hut identity idiom idol ignore illegally illness illuminate imaginary imitate immediate immediately immigrate immigration impair impression impressive improper improvement incident including income inconvenient incorrect increasingly incredible incredibly independent indirect indirectly individual indoors industrial industry inevitable infection infinitive inform informative ingredient inhabitant inhale initial initially inject injury ink innermost innocent innovator inquiry insane inscribe inscription insight insist inspection inspire instal install instance institute instruction instructor insurance intend intense intensive intention intentionally interact interaction intermediate intermission internal internationally interrupt interval interviewee introduction invasion invest investigation invitation involuntarily involve involved iron ironing irregular irritate isle isolation ivory jade jail jar jazz jealous jewel jog jogging joint journal journalist judgement judgment jug juicy jumper jungle justice kettle keyboard killing kindness kitten knit lab laboratory ladder lamb landlord largely lasting latecomer lately laughter launch lawful lay layer leadership leading league lean leap lecture legal legally length lessen lettuce liar liberate liberation librarian lifeguard lifelong lift lighter lightly lightning likeness limit limitation limited limp link liquid literary literature liver loaf locate location lodge log logic logo lorry loss lottery loud loudspeaker lovingly loyal loyalty luggage lung luxury magical magician magnificent mailbox main maintain maintenance majority management mankind maple marble marine marked marriage mash mass massive mathematician mathematics maximum mayor meaningful meanwhile measure measurement mechanic mechanical meditate meditation mediterranean medium melt membership memorable memorise memorize mend mental mentally merchant mere merely mess messy mild mile mineral minimise minimize minimum minor minority minus miracle mischief miserable misery mislead mission misty misunderstanding modal modem moderate modify moisture molecule monitor monk monster monthly monument moral moreover mosquito moss motherland motionless motivate motivation motive motor motorcycle motto mount mountaintop mourn movement mud mule murderer muscle mustard mutual myth nail naked nap narrate narrative narrow nasty nationalist naturally nearby necklace nectar needle negotiate negotiation neighborhood neighbourhood nephew nervousness ness network neutral nevertheless newborn newcomer newly nickname niece nightlife nod noisily none nonetheless nonsense nor normally northeast northeastern northern northwest northwestern noticeable noticeboard notion notorious novelist nowhere nuclear nucleus numerous nutrient nutrition nutritious object objection objective observation observe obstacle obtain obvious obviously occasion occasional occasionally occupy occur ocean offensive officially oily oneself onstage onto opening operation opposition oppress oppression option oral orbit orchestra orderly ordinary organ organic organisation organism organization origin otherwise outdoor outdoors outer outlaw outline outstanding outward outweigh overcome overjoyed overnight overwhelm overwhelming overwork owe owing oxygen pace package packing paddle paid pain painful pale palm parachute paradise paralyse paralyze parcel parental parking parrot partial participant participate participle particularly passion passive passport password patience patrol pattern pause peanut peculiar penniless penny per percent performer permanent permanently permit personally persuade persuasive phantom pharmacy phenomenon philosopher philosophy phoenix photocopy phrase physics pie piety pillow pin pineapple pipe pit plain platform pleasantly plug poet poetry poison poisonous pole policy politely politician politics pollutant pond popcorn pork port positive positively possess possession possessive possibility postcard postman pot potential pottery pound poverty powder practical praise prayer precious preference prefix pregnant prejudice preparation prepared preposition preschool prescription presence presentation preservation preserve president press previous priest primarily primitive principle prison prisoner privacy prize probability proceed process proclaim procrastination producer productive profession professor progress prohibition prominent promote promotion pronoun proof properly property proportion proposal propose prosperity prosperous protect protection protective protest proud prove proverb provided psychological pub publicly publisher pullover pump punish punishment pupil puppy pure purify purse puzzle quake qualified qualify quantity questionnaire queue race racial radiation rage rail railroad railway rainfall rainforest rank rapid rapidly rare rarely raspberry ration rational razor react realistic reality rearrange reasonable rebuild recall reception recite reclaim recognise recognize recommend recording recover recovery recycled recycling reduce reduction reef referee reflection refreshments refund refusal refuse regain regard regarding region regional register registration regulation reject relate relation relationship relative relatively relaxing reliable religion religious rely remainder remark remarkable remedy remembrance remove renew repay repeatedly representative reproduce republic reputation require requirement rescue researcher resemble reservation reserve resident residential resist resolve resort resource respect respectable respond responsibility responsible rest restore restrict retail retain retell retrospect reunification reunify revise revision reward rewrite rid riddle ridiculous ripe rise risk roadside robot rolling rotten rough routine rubber rubbish rudely runaway runway sacred sadness safari safeguard safely safety salesman salmon sand sandal satellite satisfaction satisfied saucepan saucer scan scare scared scary scatter scenic scholar scholarship schoolmate schoolteacher scold scope score scratch sculpture season seawater seaweed secretly secure security seize select selection selfish sensation separation sequence series serious server service session setting settle settlement settler severe severely sex shadowy shallow shame shameful sharp shave sheer sheet shelter sheriff shift shiny shiver shocked shocking shopper shortage shortly shrimp sickness sidewalk sigh signal signature significance signpost silent silk similarity similarly simplify simultaneously skeleton skin skyscraper slavery sleeve slight slightly slip slogan slope slot smoker sneeze snowboard snowstorm socially soil solid somehow someplace sometime sometimes soothe sophomore sore sorrow sort soul sour southeast southern southwest souvenir sparkle specialise specialist specialize specially spectacular spectator spelling sphere spice spicy spider spinach spiral spirit spiritual spoil sponge sponsor sports sportsmanship stable stall standard stare status steadily steady steam steel steep stem stick sticker sticky stir storage stormy storyteller strain strangely strategic straw strawberry stream strengthen stress stressed stressful stretch stricken strip stripe struggle stubborn stuck studio stuffed stumble stun stunning stupid stylish subconscious submarine substantial substitute suddenly suffer sufficient suffix suicide summarise summarize summit sunbathe sundial sunrise sunset superior superstition supply supporter supportive suppose supposedly surely surface surgeon surgery surprisingly surround surrounding survival survivor suspect suspicion swarm swear sweatshirt swell swimmer switch swollen sword sympathy symptom syndrome systematic tablet takeaway takeoff tale talented talkative tank taste tasteless tasty tax teaching teammate teamwork tease technique technological teen telecommunications telegram teller temper temporary tempt tend tendency tense tension tent term terminal terribly terrific terrified terror terrorism thankful theft theory thirst thorough threat threatening thriller throughout thumb thump thunder thunderous thus tick tide tighten tightly tile timely tin tiny tire tiring tissue tobacco tongue toothpaste tornado toss total totally tourism tournament trace tracksuit traditionally tragedy tragic trail transfer transform transformation transitional translate transport transportation trash treat treatment tremble tremendous trend trigger trim triumph tropical trumpet trustworthy tumble tuna turbulence turning turtle twin twist typical typically unable unafraid unbelievable uncertainty unclear uncontrollable uncover underage undergo underneath underpants undo undress unemployed unemployment unexpected unexpectedly unfairly unfit unfold unfortunate unfriendly unheard unify uninterested uninteresting union unique unite universe unless unlikely unlucky unpack unpredictable unrelated untidy unusually unwanted unwell update uplifted upload upper upward urge urgent usage useless vacancy vague vain valuable van variety various vary vast vegetarian vehicle vein vessel vet via vice victim victory viewpoint violence violently virtual virus visa visible vision visual visually vivid vividly volcano volume volunteer vowel voyage wagon ward wardrobe warmly warmth warn warning warranty warrior washbowl waste wasteful waterfall wax weakness weapon webcam weird westward wetland whale whenever wherever whether whichever whisper whistle whoever widespread wildlife wildly willingness windscreen windsurfing wing wire wither witness wizard working workout workplace workshop worn worth worthwhile worthy wound wrap wrapping wrist wristwatch written yell yoga","B2":"abandoned abnormally abolish aboriginal abruptly absentee absurd abuse accessibility accommodation accordingly accumulate accusation achievable acid acquisition actively actual acute adaptable addict addicted addiction additionally adequate adequately adjustment administrative admirable admiringly admittedly adopted adoption adore adorn advancement advent adventurous adverse adversely adversity affectionate affectionately affordable ageless aggressively agonise agonize agony aircraft aircrew alcoholism alert allegation alliance ally alongside alphabetical altar alter alternate alternatively altitude aluminium aluminum amaze amazement amazingly ambassador ambiguity ambiguous ammonia amongst ample amplifier amplify amuse analogy analyst anchor anchorage anchorman anchorperson anguish animate anonymous antiaircraft antibacterial anticancer anticipate anticipation antipollution antistatic antivirus apostrophe applicant appreciative appropriately approximate arch archaeologist archeologist arctic arena aristocracy armful arouse arrogant artery articulate artificially artistry ash aspiration aspire assault assemble assembly assert assess assessment assumption assurance assure astonish astonished astonishing astonishment astronomy athletics attached attainable attainment attendance attentive attentively attractiveness attribute atypical aubergine audit audition authorise authoritative authorize availability await awe ax axe axis backup backward backwards backyard badge balanced balky ballad ballet ballot ban banker bankrupt bankruptcy barbershop barley barn barometer barren barrier bartender bathhouse battlefield beagle beak beam bearing beautify bellow belongings beneficial benevolence benevolent berry bestow bestseller betray bewilder bewilderment bid bidding bikini billion bind bio biological biotechnology birdcage birthplace bitterly bizarre blade blast blaze blindly blindness blink bloodstream bloody blooming blossom blur blurt boiling bolt bombard bomber bombing bony bookish booklet bookmark boost booth bossy botany bothered bothersome bourbon boxer bracket brag bravery breakable breakdown breakup breathtaking breezy brewery brilliantly broadband broadcaster broaden broadly brochure browse browser bruise bud bulimia bully bum bumper bun burdensome bureaucracy burglary burgle burial bustle bustling buzz cabinet cable calmly campaign candidate cane cannonball canon capability caption captive caravan carbon cardboard cardigan carefree caring carnival carpool carve cascade cast casually catalog catalogue catalyst catastrophe catastrophic catchy categorisation categorization catering cathedral cease ceiling cellar cellist cello cemetery centigrade certificate certification certify chancellor chaotic charming cheat checkpoint cheeky cheerfully cheerfulness chemotherapy cherished cherry chew childish chimney chip chop chunk circuit circuitry circumstance citywide clam clap clarify classification clause clearness clerical client clog closure clothing clumsy coaching coalition coarse coastline cocktail cocoa coconut coherence coherent coincide coincidence colleague collector collocation colon colonial coma comfortably commander commemorate commerce commission commonwealth communicative community commute compassion compassionate compatible compensate compensation competence competent compile completion complexion complexity component comprehension comprehensive compress compression compulsory compute conceal concede conceit conceivable conceive conception concerning concession concrete condemn conductor cone conference conferencing confess confession confidently confine confront conjunction conquest conscience consciousness consensus consent considerably considering consistent consolation console constant consult consultant contaminate contemporary contempt contract contradict contradiction contradictory controversy conveniently convention conventional converse conversely conversion convert convinced cooperate cooperation cooperative cope copper coral core cornerstone cornet corona corporal corporate corporation correctness correspond correspondence correspondent corresponding corridor corrupt corruption cosiness costly costume cosy cottage countryman countrywide courtesy coward cowardly coziness cozy crab crack craftsman crater crawl crease creation creatively creek creepy crew cripple critically criticism crocodile crossly crucial cruelly cruelty crystallise crystallize cube cubism cuff culmination culturally curl cursor cyberaddict cybercafe cybercrime cyberpet cyberschool cyberspace cyclist daft damn dandelion darling dash data database dated dawn daytime dearly debit decade decay deceive decent deceptive decisive deck decomposition decorate decoration decorative dedication deduce deduction deem deer deficit deforestation defy dehumanise dehumanize delegate deliberate deliberately delicacy delicately demanding demolish denim dense densely dental dependable deputy descend descriptive desirable desktop desolation desperately desperation despise destiny detach detachment detailed detect determined determiner developing devil devote devoted diarrhea diarrhoea dictator digest dignify dignity dilemma dim dime dimension dip diphtheria diploma diplomat disappearance disapproval disapprove discharge disciple discipline disconnect discredit discriminate disgrace disguise dishonesty disillusion dismiss disorder disorderly disorganised disorganized dispensable displace displeasure disposal disposition dispute disqualify disregard disrupt dissatisfaction dissatisfied dissident distinguished distortion distract distraction distressing distributor diversion divert divided division divorce dna dock domestic dominate donate donation donkey doom doorkeeper doorway dorm dormitory dose doubly doubtful dove downfall downsize dowry draft drain dramatically drapery draught dread dreadful dreamy drinkable droop dropout drought duel dumb duplicate duplication dwarf dye dynamic eagerly eagle earnings ease eastward ecologically ecologist economical economist ecstatic edit editorial educated educator effectively effectiveness elect elective electrician electronically electronics elegance elegant elegantly elemental eligible elite eloquence eloquent embassy embrace emergence emphatically employ employee employer endeavor endeavour endlessly endorse endurance enduring energy enforce engagement engulf enhance enquire enrol enroll enterprise entertaining enthusiastically entitle entrepreneur environment environmentally equation equip equity erect erupt eruption essayist essentially estate estimated eternally ethic ethnic evacuate evacuation evaluate evaluation everlasting evidently evil evolution evolve exactness exaggerate exaggeration exalt examinee exceed excel exception exceptional exceptionally excessive exclaim exclude exclusion exclusively excursion execute execution executive exhaust exhausting exhaustion exhibit exile existing exotic expansion expectation expected expedition explode exploit explorer explosive export expressive exquisite extension extensive external extract extraordinarily exultant eyebrow eyelash eyelid fabric fabulous facilitate facilities factor faculty faith falter fame familiarise familiarize fantastically fascinated fascination fatal fate faulty fearsome feat federal feedback ferryboat fiber fibre fictional fierce fighting figurative filial financially finely fingernail firearm fireplace firmness firstly fiscal fixed flame flap flaw flawless flax flee fleet flesh flexibility flexible flexibly flip fluency fluid flutter follower folly fondly foolishly footnote forcefully foreman foresee forestry formation formerly formidable forthcoming foul found fox fragrance frankly frantically fraud freak friendly frigate frontier frugal fulfil fulfill fume functional functionality fundamental funk funky furious furiously furor furore gaiety gambling gang gangster gardener gasp gateway gaudy gaze gear generalisation generalise generalization generalize generosity generously genius genre gently genuine genuinely geographic germ getaway ghetto giveaway glacis glamorous glamourous glare gleam glee globally glocal gloomy glorify glow goat god godly goodwill gook gorge governmental gracefulness gradual grain grand graphically grasp gravestone gravitation greatness grief grieve grim grin grip gross growing guerrilla guideline gulp gum gunshot guts gymnastic habitant hail hairy handicap handicraft handout handrail hardware harmless harrow haste hastily hatching haunting hay hazardous headquarters heap heartbreaking heartwarming hedge helicopter hell helper hemp herb heritage hesitation hijack hilarious hint holder hollow holocaust homeward hone honorable honourable hood hook hospice hospitable hospitalise hospitality hospitalize hourly housekeeper housemaster housewife hover hugely humane humanise humanist humanize humble humbug humiliate humiliating humiliation hunting hush hybrid hygiene hyperbole hyphen iceman icon icy ideally identical identification identify ideology idiot idle idolise idolize ignorance ignorant illustrate illustration imagery imitation immerse immigrant immoral immortal immortality impartial impatiently imperative impermanent implement implication imply impolite impolitely import impose impossibility impractical impressed impressionism impressionist imprison imprisonment improbable improperly improved impulse impulsive inaccurate inadequate inanimate inborn incense incentive incur incurable indebted indent independently indescribable index indifferent indignity indispensable indulge indulgent industrialise industrialize ineffective inert inexperienced infant infect infected infectious infer inference inflammation inflammatory inflate inflation influential influenza informal infringe infringement inhabit inherit initiative injection injured innate innocently innovation innovative input inquire inseparable inspect inspector inspirational instantly instil instill instinct institution instruct insufficient insult integrate intellectual intent interactive interfere interior interpersonal interpret interpretation interpreter interruption intersection intimate intransitive intravenous intrude intruder intrusion invariable invariably inventor investigate investigator investment investor invisible invitingly invoke involvement ironically irrational irresistible irresistibly irresponsible irritated irritating irritation islander italicise italicize itch jaw jealously jeopardise jeopardize jeweler jeweller journalism judo juror jury justify kangaroo karaoke keen keeper kerosene keystroke kneel knot knowingly known label laborer labourer lame lance landing landlady landslide lap laptop lark laser lastly laundry lava lawmaker lawn lawsuit layabout leaflet leak learning lease leash lecturer leek legend legendary legislate legislation legislative legislator legislature legitimate leisurely lengthen lengthy leopard lest liberal lick lid lifeless lifetime lighten lighting likewise limb linen liner ling linger listener literal literally litter loan lobby loneliness loosely lousy lower lowland lucrative lush luxurious lyrics madam madame madness maestro magnify malady malaria mama mamma mango manipulate mansion manual manufacture manufacturer manufacturing marathon margin marketing mask massacre massage masseur master masterpiece mastery mate mathematical mature mausoleum means mechanise mechanize media mediaeval medication medieval mediocre melody memorial mentor merchandise mercy merge merger messenger metaphor metric micro microbe microcomputer micrometer micrometre microorganism microphone microscope microscopic microscopy microwave midst mighty migration mill millimeter millimetre millionaire mimic miniature minister mint misconception misfortune misleading missile mist mistreat mistrustful misunderstand mixture mobility mock modernisation modernise modernization modernize modest modification mogul mold momentarily momentary monastery moody moonlight moonscape morality morally mortal mortar mortgage mortify motion motivated motorbike motorist mould mournful moustache mover moving muddy multiple multiply mumble murmur muse mustache mutability mutable mutter mutton mystify nano narcissistic narrator narrowly nationwide naughty naval navigate navigation navy neat necessarily necessity needless needy negatively neglect neighboring neighbouring neither nerve nerves nervously netsurfer neurosis newscaster newsworthy nicely nightclub nightmare nobility noble nobleman nomad nomination nominee nonprofessional northward nostril nought nourish nourishment novelty nuisance numerical nursery nut nutshell oath obedience obedient obey obituary obligation observer obsess obsession obsessive odd offence offend offender offense offhand offshore ointment olive olympia olympiad openly operator opponent optimism optimist optimistic optional orator orchestral orchid organiser organizer originality originally originate ornament ounce outback outbreak outcome outdistance outdo outfit outgrow outing outlet outlive outlook outpatient output outrage outrageous outshine outsider outskirts outwardly oval overall overboard overbook overcoat overemphasise overemphasize overestimate overhear overlap overlook overly overshadow oversize overstep overtake overthrow overtime overturn ow owl ox ozone pa packed packet pad paintbrush pajamas pallet pancake pandemic panel papaya paperless paperwork parade paradox paralysis paramedic paratrooper parliament participation particle particular partisan partnership passionate passionately pastor pastoral patch patiently patriot patriotic patriotism patron pave pavement paw pawnbroker pawnshop payment peacefully peach peak pearl pebble pedal pedantic pedestrian pee peel peep peer peg penalise penalize penalty penetrate penguin penicillin pension pentagon perceive percentage perception permanence permeate perseverance persist persistence persistent personification personify personnel perspective perspiration persuasion pessimist pessimistic petrified petty ph pharmacist phase philosophical physician pi pickle picky picturesque pillowcase pine pint piracy pirate pitch plague planning playmate playwright plead plot pluck plum plumber pneumonia pointless polio polish politeness politically polity polo ponder popularise popularity popularize porch portion pose posh possessed postal postpone potent potentially powerfully practicality practically prance prawn precede precisely predicament predicate predicative predictable predictive predictor prefect preferable preferably prehistoric prehuman preindustrial prejudge preliminary preoccupy prescribe presenter presidency presidential prestige prestigious presumably prevail prevention preventive previously priceless prick primary prime prior priority privately privilege probable probe procedure profile profit profitable programmer programming prohibit project projection prom prominence prompt promptly proponent proposed prose prosecute prospect prosper proudly proven province provision proximity psychologically psychology publication publicise publicity publicize pudding pulse pumpkin punch punctual punctuality purchase purposeful pursuit puzzled pyjamas qualification quantify quarantine quarrel quarrelsome queer query quotable quotation quote racism racist rack radar radiate radical radically radium rafter rag rainbow rainstorm rally ram ramp ranger rape rash rattle ravage reaction readily realisation realization rear reasonably rebel rebellious recession recipe reckon recognition recollect recollection recommendable recommendation reconsider recreation recruit rectangular redo redundant reed reference referent refinery reflective reform refrain refresh refuge refugee refute regardless reggae regime regrettably regulate rehearsal reinforce reinforcement rejection rejoin related relativity relaxation relay relevant relic relief relieve relieved reluctant remaining remains remarkably reminder rental reorganise reorganize repaint repertoire repetition replacement replica repress repression reprint reprove residence resign resignation resistance resolution resonant respectably respected respiration respiratory restriction resume retailer retard retina retirement retreat retrieve revelation revenge revenue reverence reverse revival revive revolution revolutionary revolutionise revolutionize revolve rhinoceros rhyme rhythmic rib rider ridge righteousness rightly rim rip risky rite ritual rival roam roar rocket rocky roommate rosy route royalty rub rubble rug ruinous rural rusty sack sag sage sail salary salesmanship salesperson saleswoman salon salsa salty sandstone sanitary sanitation satisfactory saving savings scandal scar scarcely scarlet scent scheduled scheme scholasticism schoolgirl scientifically scooter scramble scribble scrooge scuba scythe seal seasonal secondary secondly sector seesaw segment seldom selfless seller semicolon seminar senator sensible sensitive separately serene serial servant setback sexism sexual sexy shabby shaken shakespearean shaky sharply shatter shed shield shipping shipwreck shooting shopkeeper shoplift shoplifter shoplifting shortness showbiz showcase shrink shrug significantly signify silverware simplification simultaneous sincere sincerity skateboard skateboarder sketch skilful skilfully skilled skillful skillfully skim skip skylark skyward slam slang slap slash slaughter sliver sloppy smash smokestack snap sneak sneer sniff snore snowball soak soaked soaking soar sob sociable socialise socialize softness solar solidity soliloquy solo solvent somewhat sonnet sophisticated soundtrack southward soviet soybean spa span spare sparerib spark sparkling sparrow specialty species specifically specify spectacle speeder spellbound spin spite splatter spokesman spokeswoman spray spreadsheet sprint spur squad squash squeeze stab stability stack stagger stain stake stammer standby standstill stanza startle starvation starve starving statesman statewide statistics steely steer stepfather stepmother stereotype stern stew stiff stimulant stimulate stimulation stingy stink stitch stock stockpile stonework stool stopover stopwatch straighten straightforward strait strand strangle strictly stride striking strive stroke stubbornly stylist subcontinent subculture subdivision subjunctive submit subplot subside substance subtitle subtle subtract suburb successive suck sue suffering sufficiently suitably sulfur sulphur sunbeam superb superintendent supernatural supervise supervision supervisor supplement supplier suppress surge surrender surroundings surveillance suspend suspicious suspiciously sustain swan sweep swift swing syllable symbolic sympathetic sympathise sympathize synonym tablecloth tabloid tack tackle tactile tag tail tame tan tanned tatter tattoo taunt teaspoon technical technically telescope temperate temporarily temptation tender tenderly tenderness terrace terrifying territory testify testimony theme theorist therapist therapy thereafter thermometer thesis thickly thickness thigh thinker thirdly thoroughly thoughtful thoughtless thread threaten thrill thrilled thrilling throat tickle tightrope timeless timeliness times timing tiptoe tiredness tiresome toenail toil tolerant tolerate toll tomb ton torch tortoiseshell torture tough toxic trader trailer trainee trainer trait traitor tramp trample transcript transfusion transient transistor transition transitive translation translator transmission transmit transparent traverse tray tread treaty trek tremendously tremor trial triangle tribe tricky trio trivial trolley troop trophy tropic troublesome trunk trusty truthful truthfulness tub tuberculosis tug tuition tulip tumor tumour tunnel turbulent tutor twinkle twisted typhoid tyranny tyrant ultimate ultimately unacceptable unashamedly unattractive unauthorised unauthorized unavailable unaware unbearable unbeatable unchanged uncharacteristic unclearly uncomfortably uncommon unconcerned unconscious underestimate undergraduate underground undersea understandable understanding undertake underwear undoubtedly undreamed undressed unease uneasily unenthusiastic uneven unfamiliar unfashionable unforeseen ungodly unhappiness unhelpful unimaginable unimaginably united universal unjustly unkind unlimited unload unlock unmistakable unmistakably unnatural unofficial unpopular unrealistic unreasonable unreliable unrest unsafe unsatisfactory unselfish unstoppable unsuccessful unsuitable unsure untalented unthinkably untie unto untreated untrimmed unusualness unwilling unwise unworldly upbringing upgrade upright urban urgently user usher utilise utility utilize utter utterly vacant vaccine valentine valid vanish vanity variation varied venture venue verbal verbally verse version versus veteran vibrate vibration viewer vigor vigorous vigorously vigour villa villager vinegar violate virtually virtue visibly vital vitamin vocalist vomit voter vow wage waist waistcoat walkabout walker wallboard walnut warship wartime wasp waterproof weaken weakly wealthy wearisome weary weave wed weed welfare western wheat whereas whip whiskey whisky widen widow width wilderness willing willingly winding windshield wink wipe wit withdraw withdrawal witty wolf wondrous woodcarving wordlessly workaholic workbench workman worktable worldly worldview worm wornout worrying worsen worship worthless wreck wrongly yacht yawn yearn yield youthful yummy zebra zip zoom","C1":"abound abstraction accustomed acidic acoustic acoustically acoustics acre acutely adjoin adjoining adjustable adrenaline advantageous adversary advisory aesthetic aesthetically agreeable aimless aimlessly alienate align alignment allege alleviate altruism altruistic amateur amid amplification amply anchored animatedly anthropologist anthropology anticlimactic antics antiquated antiquity appal appall appalling appallingly appliance apprehensive apprentice apprenticeship apt aqua aquarium artistically assertion astray atmospheric avid baldly batter battered bearded beforehand beguiling beguilingly believably benign benignly bequeath billiards blankness bliss blister blithely blockbuster bouquet brainwash brainwashing bribe bribery bubbly buffer buffoon bulk bulky bureaucratic bureaucratically buzzer bypass calorie candid candidly canoe carpenter carpentry carrier cavity ceaseless ceaselessly cessation chaotically characterisation characterization charter chauffer chill chilly chisel chiselled churn circulate circulation citation cite clammy clan classy claustrophobia claustrophobic cleanly clench cleverness climactic climax clinical cloak closeness clutch clutter collaborate collaboration collaborative collaborator commend commendation commercially compel complementary compliance compliant compliantly complimentary comply comprise compromised compulsion con concerto concur conditional conditionally confide confinement conform conformity congregate conjure connoisseur conscientious conscientiously conservatory conserve constraint consultancy consultation contested contextual contextually continuity contractor convict conviction convoluted corps coupled coverage crave craving creamy credential credibility credible credibly criteria crude crudely crumb crumble customary cynic cynical cynically cynicism damply darkroom daunt daunting daydream debut deceit degradation degrade degrading demise demo demographic demographically demography demolition depict depiction deprivation descent desertion detest detestable detriment detrimental detrimentally detritus devotee digitalisation digitalise digitalization digitalize discard discourse disdain disillusionment dislodge dismal dismally dismay dispensary dispense disquieting dissect dissection dither diverge divergence divergent diversity docile docilely domestically domesticate domestication dominant dominantly domination dramatist drawback durable duration dutiful dutifully dynamically eccentric eccentrically eclectic eclectically ecstatically effortless ego elaborate elaboration elastic elevate elevation elitist elongate elude elusive embark endorsement engross engrossing enormously enterprising enviable envisage estimation ethical ethically evoke ewe exert exhibitionist exhilarate exhilarating exhilaration exodus exotically expedite expire explanatory exploitation explosively exterior extortion extravagance exuberance exuberant exuberantly fabulously facial facilitation faction fanatic fanatically fanciful farce fatality fatigue favorably favourably ferocious ferociously fiddle fiddler fiddly fiend fiendish fiendishly fiercely firewall fissure fixture flashback flask flatter flattery flick flicker flourish folktale forensic forfeit formality formulate fossil fraction fragmentation frostily frosty fuse fusion gadget gamely gape gem genome geological geologically ghostly gig glean glum glumly gnaw goose gourmet graft grapefruit grounds gruelling gruesome gruesomely grumble gush gushing gushingly gusto gutsy gypsy hack haggle harass harassment headstrong hedgehog heifer heighten hence heroine hibernate hibernation homely honk hostess hostile hostility hypocrisy hypocrite hypocritical hypocritically immense immensely immortalize imp impede impediment impersonal impersonally impersonate impersonation impersonator impervious impish impishly implicate impoverished incision incisor inclusion inclusive inclusively indefinite indefinitely individuality induct induction inexcusable inexcusably inexhaustible inexplicable inexplicably ingenious ingenuity inherent inherently inheritance injustice innovate insecure insecurely insensitive insensitively insightful insightfully instinctive instinctively insubordinate insubordinately insubordination integral intellect interject interjection intuit intuition intuitive intuitively invoice irate irately irony isolate isolated itinerary jersey jurisdiction justly juvenile knowledgeable lackluster lacklustre lapse latent lavatory legacy lethargic lethargically lethargy liaison likelihood limitless linear linearly loom ludicrous ludicrously lust macabre magnetic magnetically magnetism malfunction maneuver manicure manipulation manoeuvre marginal marginally marvel maternal maternalistic meaningless meaninglessly mechanism methodical midwife mingle minutiae misplace monotonous monotonously monotony motley mountaineer munch muscular mutually mythological mythology naive naively naivety naturalness neglectful negligent negligently negligible neutralisation neutralise neutralization neutralize niche nocturnal nondescript norms notable notwithstanding numb oblige obscure obscurely occupant occupational oddity offspring orchard ordinarily organizational ornamental otter outset overalls overdraft oversee overseer panorama panoramic parasite paternal paternalistic pathos paywall peacock peasant pedicure pendulous pendulum peninsula perceptive perceptively perpetuate persecute persecution personalisation personalise personalization personalize persuasively pertinent phenomenal phenomenally physicality physique pigeon pinnacle pioneer placid placidly plaque plaster plausibility plausible plausibly pleasurable ploy plumbing plummet plunge poetess poise popularization portable portray portrayal possessor posture pounce preach preacher precision predecessor premier premise premises primitively principally privileged profess professionalism profound profoundly prohibitive prohibitively proliferate prolific prolifically prop prophet prophetic prospective protagonist provisions provocative provocatively provoke prowl psyche psychiatric psychiatrist purity quarry quest quip quirk quirky radiator rapport rarity raunchily raunchy readable realism realist reap reassurance reassure recess recessive recharge recognisable recognisably recognizable recognizably rediscover reenact refreshing refreshingly refurbish refurbishment relapse relinquish reluctantly remedial reminisce reminiscent remorse remorsefully remorseless remorselessly remotely removed render rendering renown repel repellant repertory repute resent resilience resilient resin resonate respite restoration restorative retention retrace revealing revere riveting robust robustly rotate roundup rudimentary rudiments rumble rustle ruthless ruthlessness sacrifice salivate saloon salvage salvation salve sanctity sap sarcasm sarcastic sarcastically sauna scathing scenario scoff scorn scornful scornfully screenplay screenwriter scrutinise scrutinize scrutiny sedate sedately sedentary seedling sentient sentiment sentimental sentimentally sequel settee shambles shortlist showy silhouette simplicity sketchbook slack slackly slob smug smugly snail snooze socialization somber somberly sombre sombrely somersault spacious spartan specification specimen speculate speculation speculative sponsorship spontaneous spontaneously sprawl sprout squander staccato staggering stamina staple startling startlingly stately stiffen stimuli stoke strap strapping stray stressfully stretching structural structurally stuffily stuffiness stuffy stylistic stylistically subordinate substantially subtly suburban suburbia succession succulent succulently suds suffice suitor superficial superficially supple suspension sustainable sustainably swap symptomatic synopsis synthetic synthetically tact tactful tactfully tailor tangle tangled tantamount tantrum tastebud taut tautly tedious tediously tedium telltale temperament temperamental temperamentally terrain testament thereby timid tinker torment torturous toughness tract trampoline tranquil tranquility transatlantic transfix transit trauma traumatic trying turmoil twitch tycoon unassisted unconventional unconvincing unconvincingly undaunted unenviable unenviably uneventful uniformity uninspiring unison unmanageable unmanned unmusical unmusically unoccupied unplug unreliably unscathing unsettle unsettling unsustainable unsustainably untangle untangled unwavering unwaveringly upheaval utensil vegetation venerate veneration ventilate ventilation verandah verdict versatile versatility vertical verve vicious viciously victorious victoriously violet vitality voluntarily voluntary voracious voraciously wares wary washtub waterfront wayside whilst wicked wickedly withdrawn wizened woo wooded wrangle wrench wry wryly zany","C2":"aberration abhor abhorrent abhorrently abject abundantly accountability accrue acreage acrobatic acrobatically acrobatics additive adept adhere adhesion adornment adulterate affectation aghast agile agility allegorical allegory allot allotment allude allusion amorphous amorphously anarchic angst angsty angular angularity annex anonymity antediluvian anthology anthropological anthropologically anticlimactically antidote antithesis antithetical apostle apprehend aptitude arcane arcanely archetypal archetype archival ardor ardour arduous arduously armory armoury articulation artifact artifice assimilate assimilation astringent athleticism attributive attrition attuned austere austerely austerity authenticity automate autonomous autonomously autopilot averse avian axiom axiomatic babble banish banishment baroque bauble behest belligerence belligerent beneficiary bereft bereftly besiege blandishment blight blitz blubber blubbery blurb bogus bout brandish breadwinner brevity brim brimstone brink brood brouhaha buccaneer buffoonery burgeoning buzzard caffeinate calamitous calamitously calamity callous callously calorific capacious carbonise carbonize catastrophically cay centralised centralized choreographical choreography chronologically chronology chrysalis cinematographer cinematography circumnavigate circumnavigation clinch cloister cloistered coax cocoon cogent cogently cognitive collide collider colloquial colloquially colloquium combustion commensurate commensurately commode commodity compellingly computerise computerize conciliation conciliatory concurrence condensation condone conduit confabulate confabulation confection confrontational confrontationally conglomerate conjecture connotation connote consign consignment consternation constrained contagion contemptuous contemptuously contractual contractually contraption contrive cordon corpse corpus correlate correlation cosmic cosset counsel counterproductive counterproductively crippling crony crystallisation crystallization cull cultish curate curator dampen deaden decentralise decentralize declination deficient deficiently delicatessen demystification demystify denotation denote denounce denunciation depraved depravity deprecate deprecatingly depressive derelict derision derisive derisively deterrent detract deviant deviantly diffuse diligently diminish disdainful disparage disparagement disparaging disparagingly dispersal disperse dissemble disseminate dissemination dissension distill distillation divination domesticity drabness dribble drudgery dubiously dwarfism ebb eccentricity echo echolocate echolocation economise economize ecotourism edification edifice edify egalitarian elasticity elated elation electrode elephantine embed embodiment embody eminence eminent emolument emulate emulation emulsification emulsifier emulsify enabler encompass encumber encumbrance enduringly engender enthuse ephemera ephemeral ephemerality epoxy equable equilibrium etch etching ethos euphemism euphemistic euphemistically euphoria euphoric euphorically evokingly exalted exaltedly exorcism exorcist extant extracurricular exude fabled fabricate fabrication fabulate fabulation facsimile fallacy farcical feign ferocity fete figuratively flagging flatout flightiness flighty flit floe floodgates fluctuate fluctuation forfeiture forlorn forlornly formidably fractious frolic fruition gale gambit gauche genomic genomically glitz glitzy gout gravitate gravitational gravitationally grievance habitation hamper haphazard haphazardly hapless happenstance haughtily haughty hauntingly headmistress helm herald hermetic hermit hinder hindrance hindsight histrionic histrionically hitch hitherto hoist homestead hotelier huddle hull hypnotherapy hypothesis hypothesize hypothetical hysteria hysterical hysterically idiomatic idiomatically idiosyncrasy idiosyncratic ignominious ignominiously impeccable impeccably imperceptible imperceptibly imposition impresario impressionistic impressionistically improvisational inartistic inchoate inchoately incipient incise incongruity incongruous incongruously incumbent indignant indignantly indiscrete indiscretion individualism indolence indolent indolently induce inducement indulgence indulgently inexorability inexorable inexorably infallibility infallible infallibly infernal infernally informant ingenuous ingenuously ingrate ingratiate ingratiating ingratiatingly innuendo inscrutable instantaneous instantaneously insular integration interlocking interlude intermediary interrogate interrogation interrogative interrogatively intersperse interweave intrinsic intrinsically ironic irrelevancy irrevocable irrevocably jargon jarring kinetic kinetically knack lament lamentation laryngitis lassitude laud laudatory leaven leavening legion liaise locomotion locomotive loiter lurid luridly lyrical lyrically lyricist maelstrom maggot magnanimity magnanimous magnanimously magnate magpie malice malicious maliciously malleability malleable mangle mariner marketability materialisation materialise materialism materialistic materialization materialize maverick meager meagre mediate mediation mediocrity melancholy melodious melodiously menace menacing menacingly menial mercantile mercenary merit mesh mesmeric metalled meteorological meteorology methodological methodologically methodology meticulous meticulously midwifery mien milieu minefield minster misdemanour misdemeanor modernism monastic moor moribund mottled mundanity munificence mutinous mutinously myriad mystique nascent neophyte nigh nonchalant nonchalantly nostalgia nostalgic nostalgically notoriety notoriously oblique octogenarian opacity opaque opulence opulent opulently ordain ore ornate ostensible ostensibly outmoded overlay painstaking painstakingly palatable palate parable paradoxical paradoxically paralysingly paralyzingly parameter paramount parasitic parochial patchily patchy patronise patronising patronisingly patronize patronizing patronizingly pedestal perch pervasive pervasiveness perverse perversity philanthropic philanthropically philanthropist philanthropy philistine physiological physiologically plumage plume plutocrat polysyllabic ponderous ponderously porten portraiture posit posterity postural posturing practitioner precocious precociously preconception predilection preeminent preoccupation prescriptive presentational preservationist pressurization pressurize presuppose presupposition primeval prise prissy procedural profitability proliferation prolong promenade promotable prone proportional proportionally proposition proprietary proprietorial proscribe proscription prostrate protrude protrusion proverbial provincial provocation proximal prurience prurient punitive punitively puritanical pyre qualitative qualm quiver rapture rapturous rapturously ravish rebound rebuke recitation recluse reclusive reconcile reconciliation recourse recumbent recuperate recuperation recuperative redundancy redundantly regulatory reissue relegate remit remittance remonstrance remonstrate remorseful repose reproach reptilian requisition residual residue resound resounding resoundingly resuscitate resuscitation retrospection retrospective revelatory reverb reverberate reverberation revile revulsion rhetoric rhetorical rhetorically rickety rife rift romp romper ruminant ruminate rumination ruminative salivary sandwiched scavenger scholarly scroll secular secularly seedy seismic selectivity shamble sheaf shimmer shoal singe skew slab slither smattering snippet snobbery solicit soliloquize solipsism solitariness solitary solitude spatial spatially spire splinter spontaneity spurious spuriously squint squirm squirmy stabilise stabilize standing sterility stipulate stipulation stoicism stratosphere stringent stringently stultify stultifyingly subsidize subsidy subsist subsistence substantiate succumb suffuse sulphuric summarily superfluous superfluously surrealism surrealist surreptitious surreptitiously swivel syllabic synthesis tacit tacitly taciturn taciturnity tactic tactical tactically tantalise tantalisingly tantalize tantalizingly teem telescopic telescopically tenacious tenaciously tenacity testimonial tetchy thicket timidity topographical topographically topography topple torrential totemic totter tranquilise tranquilize transmitter treacherous treacherously treachery trifle truism turret unadulterated uncanny undemonstrative undemonstratively undiminishing unencumbered unequivocal unequivocally unexceptional unexceptionally unexcused unfeasible unfeasibly unharried unmediated unnerve unnerving unnervingly unobtrusive unobtrusively unobtrusiveness unpromising unravel unsurpassed unsuspected utilisation utilitarian utilization vandal vandalize venomous venomously verbatim verily verisimilitude veritable vermin vestigial vestigially vicinity vindicate vindication virginal virtuosity virtuoso vocational voracity vortex wallow wane wayward wheeze whir whirlwind wholly wistful wistfully wordage wordsmith wrack zoologist zoology"},"irr":"abandoned>abandon accustomed>accustom adopted>adopt aged>age am>be anchored>anchor anchormen>anchorman annoyed>annoy antitheses>antithesis aquae>aqua aquaria>aquarium are>be areae>area arisen>arise armed>arm armsful>armful arose>arise ate>eat attached>attach awoke>awake awoken>awake babysat>babysit bade>bid balanced>balance banking>bank barmen>barman bearded>beard bearing>bear beaten>beat became>become been>be beeves>beef began>begin beginning>begin begun>begin being>be bent>bend bidden>bid bitten>bite bled>bleed blent>blend blest>bless blew>blow blooming>bloom blown>blow boiling>boil bombing>bomb booking>book bookshelves>bookshelf bore>bear born>bear borne>bear bothered>bother bought>buy boxing>box brainstorming>brainstorm breathed>breathe breathes>breathe breathing>breathe bred>breed broke>break brought>bring built>build bureaux>bureau burning>burn burnt>burn businessmen>businessman businesswomen>businesswoman busses>bus calli>callous calves>calf came>come camerae>camera campi>campus camping>camp caring>care caught>catch chairmen>chairman challenging>challenge charming>charm cherished>cherish children>child chiles>chili chillies>chili chose>choose chosen>choose chrysalides>chrysalis cleaner>clean climbing>climb coaching>coach coded>code codes>code coding>code colloquia>colloquium comae>coma compromised>compromise concerned>concern concerning>concern concerti>concerto coned>cone cones>cone confusing>confuse coning>cone considering>consider contested>contest convinced>convince cooking>cook cooler>cool coronae>corona corpora>corpus countrymen>countryman coupled>couple craftsmen>craftsman crew>crow crippling>cripple crises>crisis crossing>cross curricula>curriculum customs>custom dated>date dating>date daylit>daylight dealt>deal demanding>demand detailed>detail determined>determine developing>develop dice>die did>do dilemmata>dilemma diplomata>diploma distils>distill distinguished>distinguish divided>divide does>do doing>do done>do dove>dive drank>drink drawing>draw drawn>draw dreamt>dream dressed>dress drew>draw driven>drive drove>drive drunk>drink dug>dig dwarves>dwarf dying>die eaten>eat educated>educate elder>old eldest>old emphases>emphasis encouraging>encourage ending>end enduring>endure engineering>engineer entertaining>entertain equilibria>equilibrium estimated>estimate exalted>exalt existing>exist expected>expect experienced>experience facilities>facility fallen>fall farming>farm farther>far farthest>far fascinated>fascinate fed>feed feet>foot fell>fall felt>feel fighting>fight filling>fill finding>find fishermen>fisherman fixed>fix flagging>flag flatter>flat fled>flee flew>fly flown>fly foci>focus focusses>focus forbad>forbid forbade>forbid forbidden>forbid foremen>foreman foresaw>foresee foreseen>foresee forgave>forgive forgiven>forgive forgot>forget forgotten>forget formulae>formula fought>fight found>find freezing>freeze freshmen>freshman frolicked>frolic frolicking>frolic froze>freeze frozen>freeze furthest>far gardening>garden gasses>gas gave>give geese>goose gentlemen>gentleman gifted>gift given>give gone>go goods>good got>get gotten>get grandchildren>grandchild greeting>greet grew>grow grounds>ground grouping>group growing>grow grown>grow had>have halves>half handkerchieves>handkerchief has>have hatching>hatch haunting>haunt having>have heard>hear hearing>hear held>hold hid>hide hidden>hide hoped>hope hopes>hope hoping>hope housewives>housewife hung>hang hunting>hunt hypotheses>hypothesis impressed>impress improved>improve including>include indices>index influenzae>influenza injured>injure interwove>interweave interwoven>interweave irritated>irritate irritating>irritate is>be jarring>jar kept>keep killing>kill kited>kite kites>kite kiting>kite knelt>kneel knew>know knives>knife known>know laid>lay landing>land landslid>landslide laryngitides>laryngitis lasting>last latest>late lay>lie leading>lead leant>lean leapt>leap learning>learn learnt>learn led>lead lent>lend lighter>light lighting>light lit>light loaves>loaf lower>low lyrics>lyric made>make maestri>maestro mammae>mamma marked>mark marketing>market mausolea>mausoleum maxima>maximum meaning>mean means>mean meant>mean media>medium men>man met>meet metalled>metal mice>mouse midwived>midwife midwives>midwife midwiving>midwife might>may milieux>milieu minima>minimum misleading>mislead misled>mislead missing>miss mistaken>mistake mistook>mistake misunderstood>misunderstand monies>money motivated>motivate moving>move neighboring>neighbor neighbouring>neighbour neuroses>neurosis noblemen>nobleman nuclei>nucleus opening>open outbroke>outbreak outbroken>outbreak outdid>outdo outdone>outdo outgrew>outgrow outgrown>outgrow outshone>outshine overcame>overcome overheard>overhear overlaid>overlay oversaw>oversee overseen>oversee overtaken>overtake overthrew>overthrow overthrown>overthrow overtook>overtake owed>owe owes>owe packed>pack packing>pack paid>pay panicked>panic panicking>panic parking>park pastae>pasta pendula>pendulum phenomena>phenomenon picnicked>picnic picnicking>picnic pies>pie planning>plan pleased>please pleasing>please pled>plead plusses>plus pneumoniae>pneumonia policemen>policeman policewomen>policewoman possessed>possess postmen>postman posturing>posture prepared>prepare privileged>privilege programming>programme proposed>propose provided>provide provisions>provision puzzled>puzzle quizzes>quiz raged>rage rages>rage raging>rage ran>run rang>ring rebuilt>rebuild recording>record recycled>recycle recycling>recycle redid>redo redone>redo refreshing>refresh reis>real relaid>relay related>relate relaxing>relax remaining>remain remains>remain removed>remove repaid>repay respected>respect retinae>retina retold>retell revealing>reveal rewritten>rewrite rewrote>rewrite riales>real ridden>ride rides>ride riding>ride riper>ripe ripest>ripe risen>rise rode>ride rolling>roll rooves>roof rung>ring running>run said>say salesmen>salesman salespeople>salesperson saleswomen>saleswoman sandwiched>sandwich sang>sing sank>sink sat>sit satisfied>satisfy saving>save sawn>saw scares>scare scaring>scare scarves>scarf scheduled>schedule schoolchildren>schoolchild seen>see selves>self sent>send setting>set sewn>sew shaken>shake sheaves>sheaf shelves>shelf shipping>ship shocked>shock shocking>shock shod>shoe shone>shine shook>shake shooting>shoot shorts>short shown>show shrank>shrink shrunk>shrink shrunken>shrink singing>sing skiis>ski skilled>skill slept>sleep slid>slide smelt>smell sold>sell soli>solo sought>seek sparkling>sparkle sped>speed spelling>spell spelt>spell spent>spend spilt>spill spoilt>spoil spoke>speak spoken>speak spokesmen>spokesman spokeswomen>spokeswoman sports>sport sprang>spring sprung>spring spun>spin stadia>stadium staggering>stagger staid>stay standing>stand stank>stink startling>startle statesmen>statesman staves>stay stole>steal stolen>steal stood>stand stranger>strange stretching>stretch stricken>strike stridden>stride striking>strike striven>strive strode>stride strove>strive struck>strike strung>string stuffed>stuff stunk>stink suffering>suffer sung>sing sunk>sink surfing>surf surprised>surprise surprising>surprise swam>swim swept>sweep swore>swear sworn>swear swum>swim swung>swing synopses>synopsis syntheses>synthesis taken>take taught>teach taxying>taxi teaching>teach teeth>tooth terrified>terrify terrifying>terrify thieves>thief thought>think threw>throw thrown>throw times>time timing>time told>tell toned>tone tones>tone toning>tone took>take tore>tear torn>tear trafficked>traffic trafficking>traffic training>train traumata>trauma trod>tread trodden>tread trying>try tuberculoses>tuberculosis tubes>tube turning>turn twisted>twist undergone>undergo understanding>understand understood>understand undertaken>undertake undertook>undertake underwent>undergo undid>undo undone>undo undressed>undress united>unite used>use varied>vary viae>via virtuosi>virtuoso vortices>vortex walking>walk was>be went>go wept>weep were>be whirrs>whir winding>wind withdrawn>withdraw withdrew>withdraw wives>wife woke>wake woken>wake wolves>wolf women>woman won>win wooded>wood wore>wear working>work workmen>workman worn>wear worried>worry worrying>worry worse>bad worst>bad wound>wind wove>weave woven>weave writing>write written>write wrote>write","syl":{"4":"abolishes absolutely acceptances accomplishes accurately acknowledgement acknowledgements acknowledges acoustically actually adequately advantageous advantages adverbial advertisement advertisements advertises aesthetically aggressively agonizes alienates alleviate alleviates alliances allowances alternated altruism altruistic ambulances amplifier amplifiers amplifying analyses analyzes animated annoyances annually antiquated anxieties anxiety apostrophe apostrophes appearances appliances appreciate appreciates apprehended apprentices apprenticeship apprenticeships appropriate appropriates aquarium aquariums artistically assembling associate associates assurances attentively attractiveness attributed audiences authorizes automated barbecuing benefited benefitted bicycling biographies biography biology bulimia bureaucracies bureaucracy bureaucratic businesswoman businesswomen calculated casually catastrophe catastrophes celebrated centimetre centimetres certifying championing championship championships circulated circumstances clarifying classifying coalition coalitions coincided coincidence coinciding colonial colonials comedian comedians compensated complementary complemented complicated complimented compromises concentrated conferences confidences congregated consequences constituted contemptuously contextual continual continuing contractual contradicted contributed conveniences convoluted cooperate cooperates copyrighted corresponded coverages criteria criticism criticisms criticizes cultivated cynicism dandelion dandelions databases decorated dedicated definitely delegated delicately demolishes demonstrated deposited deprecated derisively desiring desperately devastated diagraming diameter diarrhea diarrheas diarrhoea differences diminishes diphtheria disabling disappointed disconnected discourages discredited disparages disregarded distinguishes distributed disturbances divergences documented domestically dominated dramatically duplicated dynamically easygoing ecstatically edifying educated effectively effectiveness elementary elevated elongated embarrasses embodying eminences emotionally emphasizes emphatically emulated enabler enabling encompasses encouragement encourages enterprises enthusiast enthusiasts entitling enviable envisages establishes estimated euphemism euphemisms euphoria evacuate evaluate evaluates everybody evidences exclusively executed exercises exhibited exorcism exorcisms expedited experience experienced explosively extensively exterior exteriors fabricated fantastically fascinated february ferociously fireplaces fluctuated fluctuating fluctuation fluctuations formulated fortunately generated genetically geographic geography geology glorifying gradually graduated graduating graduation graduations gravitated headmistresses heritages hesitated historian historians histrionic horrifying humanizes humiliate humiliates hypotheses hysteria hysterically idolizes illustrated imitated immediate immigrated implemented implicated incipient indicated indulgences industrial industrials inferences influences influencing influential influenza ingratiate ingredient ingredients inhabited inherited injustices innovated innuendo inquiries inquiring instinctively instituted insurances integrated interacted interior interiors interjected interpreted interrupted intersperses intimated introduces intuition intuitive ironically irritated isolated january jeopardizes journalism justifying karaoke kilometre kilometres laboratories laboratory legislated liberated librarian librarians linearly magnetism magnifying malaria maliciously malleable massacring masterpieces material materials mausoleum mechanism mechanisms mediated mediating mediation mediocre memorial memorials memorizes millimetre millimetres miniature miniatures minimizes moderated modernism modernizes modifying motivated multiplying mutually mystifying navigated negatively negotiate negotiates neutralizes obedience obedient occupying olympia olympiad operated optimism organism organisms organizes ornamented outdistances overseer overseers oversizes overweighted parachuted paradoxes paralyzes parochial passionately patriotic patronizes pedestrian pedestrians penalizes penetrated percentages performances permeated permeating perpetuate perpetuates persecuted persuasively pervasiveness pioneering policewoman policewomen positively predicated preeminent preferences prejudices preoccupied preoccupies preoccupy pressurizes presupposes priorities priority prohibited prolifically prominences prosecuted proverbial psychiatric psychiatrist psychiatrists punctuation purifying qualifying quantifying radiated radiating radiation radiator radiators realises realism realistic realities reality realizes realizing rearranging reassurance reassuring recognises recognizes recollected recommended recreation recycling reenacted references regulated reinforces reinforcing reissuing relatively relegated reliable relinquishes remedial remedying remembrances reminisces remittances reorganize reorganized represented reproduces requiring resembling residences residual residuals resilience resonated reunified reunify rhetorically ruminated sacrifices salivated sarcastically satisfactory satisfying scenario scenarios scientific scrutinizes separated separately signifying silhouetted simplifying situation situations societies society solicited specializes specifically specifying speculated spiritual spirituals stabilizes stereotype stereotyped stereotypes stimulated stipulated stoicism stultifying stylistically subsidizes substantiate substantiates substituted suburbia summarizes superior superiors supervises supplemented surrealism surreptitious suspiciously sympathizes synthetically tantalizes temperamental tenaciously terrifying terrorism testifying tolerated ultimately unassisted undergoing unexpected unifying uninteresting universes unlimited unreasonable unrelated unsettling unsuspected unusual usually utilizes variation variations varieties variety venerated ventilated vestigial vindicated violated violating violently virtually virtuoso zoologist zoologists zoology","3":"abler abounded absences abstracted abuses accented accepted accounted accruing accuses achievement achievements acquaintance acquire acquired acquires acreage actively actresses actual acutely adapted addicted addresses adjusted admired admitted adopted advancement advancements advances adversely advises affected afforded alerted alleges alliance allotted alluded allying amazement amazes ambitious amounted amusement amusements amuses angrier angriest annexes announcement announcements announces annual annuals anxiously anyone applauded appliance applying appointed approaches archetypal area areas arguing arises arouses arrangement arrangements arranges arrested aspires assaulted assembled asserted assesses assisted attaches attempted attended attracted audience audio audited austerely averaging avian avoided awaited awarded awareness axiom axioms babbling balances bandages bankrupted barrier barriers basically battling beautiful beautifully beautify beforehand behaviour behaviours bicycled birthplaces blanketed bloodier bloodiest bombarded bonuses bossier bottling brainwashes brandishes bubbling budgeted bulkier bullying burial burials burying busier busiest businessman businessmen bustling bypasses cabbages campuses capacious carefully carelessly carelessness carpeted carriages carrier carriers carrying cascaded casual casuals catalogue catalogued catalogues ceaselessly cereal cereals challenges champion championed champions chaotic chariot chariots cherishes chillier chilliest circling circuses classier climaxes coincide coincides collapses collected colleges collided comforted commanded commended commented committed commuted competed completed completely complexes compliance compliant complying composes compounded compresses comprises computed conceded concluded conducted conduit conduits conferencing confesses confided confinement conflicted confronted confuses connected consciences consciousness consented consisted constructed consulted contacted contented contested contracted contrasted conversely converses converted convicted convinces copying corrected corrupted costlier costliest cottages courageous cozier crazier craziest creamier creamiest created creating creation creations creative creator creators credited crippling crocodile crocodiles crumbling cubism curated currying cycling cyclist cyclists damages dazzling deadlier deadliest debated debited decided decorative decreases defeated defended defenses defying degraded deleted delicious delighted demanded denoted denounces denying departed depended depicted descended deserted desire desired desires despises detaches detected detested detracted deviant deviants devices devoted diagram diagrammed diagrams dialing dialog diapers diaries diary dieting differently diffuses digested dioxide dioxides directed dirtier dirtiest disabled discarded discharges discounted discourses discusses diseases disguises dismisses dispenses displaces disputed disrupted dissected distances distracted diverges diverted divided divorces dna donated doubling downloaded downsizes dribbling dvd dwarfism earlier earliest easier easiest echoing edited effected elaborate elated elected eluded embedded embraces emerges emphases empire emptier emptying enabled endorsement endorsements endorses enforces engagement engagements engages enhances enquire enriches entire entitled entrances erected erupted especially everyday everything everywhere exacted exalted exceeded excepted excesses exchanges excited excitement excluded excuses exerted exhausted existed exited expanded expected expenses expires exploded exploited exported exposes expresses extended extracted extremely exuded fancier fanciest ferocious ferrying fiddler fiddlers filial finances finishes firearm firearms firefighter flightier flightiest flourishes fluctuate fluctuates fluency fluently focuses foggiest footnoted forcefully forecasting foreseeing forested forfeited forwarded fragmented fragrances frequented friendlier friendliest fruition frustrated funnier funniest furnishes gambling garages gaudier geniuses gentlest genuine giggling gloomier goddesses gradual graduate graduates graphically greedier greediest greenhouses grievances grumbling haggling handier handiest happier happiest harasses harnesses harvested healthier healthiest heartier heartiest heavier heaviest heralded heroine heroines highlighted hindrances hiv holier holiest hopefully hospices hostesses housekeeper housekeepers huddling humbler humblest humbling hungrier hurrying idea ideas idiom idioms idiot idiots idler idling illnesses imageries imagery images immensely impacted impeded implying imported imposes impoverished impresses improvement improvements impulses inchoate included increases indebted indexes indices indifferent inducement inducements induces inducted indulges infected infectious inflated influence influenced infringement infringements infringes ingenious injected inquired inquires insisted inspected inspired instances instructed insulted intended interesting intruded intuit invaded invented invested invited invoices involvement involvements issuing jacketed juicier juiciest justices juvenile juveniles lamented languages latecomer latecomers lazier laziest leisurely licences licenses likelihood limited linear littler littlest lobbying located loneliness luckier luckiest lyrically macabre maestri mailboxes malicious management managements manages mangling manual manuals marketed marriages marrying massacre massacred massacres massages measurement measurements media mediate medium mediums menaces menial mercantile merited merrier messages messier middling mightier mightiest mingling ministering minuses misplaces mistreated molecule molecules mortgages muddier muddying mumbling muscling museum museums mustaches mutual myriad narrated nastier nastiest necklaces needier neediest neglected neophyte neophytes neuroses noisier noisiest nonetheless notices nourishes nuclear nuclei nucleus nuisances nutrient nutrients nutritious objected obliges obsesses offended offenses offices opposes oppresses oranges orbited ourselves outdoing outfitted outmoded outrageous outrages packages paddling paintbrushes palaces paraded partying passages patriot patriots peacefully perfected period periods permeate permeates permitted persisted persuaded piano pianos pickier picturesque pieties piety piloted pioneer pioneered pioneers pirated pitying plummeted pocketed poetry policeman policemen polices polio politely politeness polluted posited possesses powerfully practically practices practises preceded precisely precocious predicted premises presences presented prestigious pretended prettier prettiest prevented princesses principally privately proceeded processes produces professes profited progresses projected promises promoted pronounces proposes protected protested provided provinces prurient publishes punctual punishes purchases purposeful purposes pursuing puzzling quarrying quieted racism radiate radiates radically radio radioed radios radium railroaded rainiest rallying ravages reacted reacting reaction reactions readier readying realise realised realist realists realize realized rearrange rearranged reassure reassured reassures rebellious rebounded recesses recipe recipes recited reconcile reconciles recorded recovery recruited recycled redoing reduces reenact reenacts reflected refreshes refuges refunded refuses refuted regarded regretted reinforce reinforced reissue reissued rejected relapses related relaxes releases religious relying reminded remitted remorseful remorseless remotely repainted repeated replacement replacements replaces replying reported reprinted requested require required requirement requirements requires rescuing researches resembled resented resisted resorted resources respected responded responses restricted resulted retarded retirements retreated reunion reunions reverses revises rewarded righteousness riskier riskiest ritual rituals rocketed romances rosier rotated ruining ruinous rumbling rustier rustiest safeguarding salesmanship salespeople salesperson saleswoman saleswomen saltier sandwiches sarcasm sausages scarier scariest sciences scientist scientists scrambling scribbling seconded sedated sedately segmented selected sentences sequences serial serials services settler settling severely sexier sexiest sexism sexual shakier shakiest shortages showcases showiest silences sillier silliest simpler singling skateboarding sloppier sloppiest somebody souring soviet spirited spokeswoman spokeswomen stabler stablest stadia stadium stadiums stapling steadier stickier stickiest stingier stopwatches stormiest strangling struggling studio studios studying stumbling subconscious subjected submitted subsided substances subtitled subtler subtly subtracted succeeded successes suffices suffuses suggested suicide suicides suitcases sunglasses superfluous supplier suppliers supplying supported supposes suppresses surfaces surprises surrounded suspected suspended suspicious syntheses tabling talented targeted tastier taxiing tedium temperament temperaments temperature temperatures tenacious terraces theater theaters theatre theatres theorist theorists ticketed timeliness timetable timetables tinier tiniest toothbrushes toppling tormented tourism transients transited translated transmitted transported trembling triangle triangles trickier trickiest trivial troubling truism trumpeted tuition tuitions tumbling twinkling typically uglier ugliest unconscious undaunted undoing unfolded unforeseen united unlikely unloaded unsettled untreated unwanted updated upgraded uplifted uploaded usages usual valuing vanishes varying vegetable vegetables versatile viciously video videos villages violate violates violence violent violet violets violin violins virtual viruses visited visual voracious voyages waitresses warrior warriors weaknesses wealthier wealthiest wearying whoever witnesses workplaces worrying worthier worthiest wrangling wristwatches zaniest","6":"antibacterial beneficiaries beneficiary biotechnologies biotechnology conciliatory egalitarian encyclopaedia encyclopedia encyclopedias extraordinary idiosyncrasy idiosyncratic industrializing intermediaries intermediary malleability materialism materialistic materializes materializing mediterranean meteorology microorganism microorganisms octogenarian overemphasizes overestimated physiological professionalism reconciliation reconciliations reunification scientifically unadulterated underestimated unenthusiastic utilitarian","2":"acre acres acted added ageless ages agile ago aided angled antique antiques anxious any arches ashes aspirin averaged awesome axes babbled badges banded barely baroque baseball baseballs basement basements bases batches batted battled beaches bearded beauties beauty bedded being beings belted benches bended bequeath bequeathed bested bio blasted blazes blended blesses blighted blinded blithely blitzes blooded bluing blurted blushes boarded boasted boated bolted bonded boosted booted boredom bosses bottled bounces bounded boxes bracelet bracelets branches branded brasses bravely breasted breezes bridges bronzes brooded bruises brushes bubbled bunches bureau bureaus buses bushes business busses busted buzzes cabled cafe cages capsule capsules carded carefree careful careless cases cashes catches causes cautious cd ceaseless ceases centre centres chances changes chaos charges charted chases chatted cheated cheeses chocolate chocolates choices choir chooses chuckled churches circled cited classes clauses clenches client clients clinches closely closeness closes clouded clutches coaches coasted coated coaxes coded colleague colleagues compile compiles conscious console consoles corpses costed couches counted coupled courses courted crafted crashes creases create creates crippled crises crosses crowded crudely cruel cruises crumbled crushes crying curses cv cycled dances dashes dated daunted dazzled densely desperate dial dialed dials diet diets dishes dj docile doing doings doses dotted doubled doubted dozes drafted dreaded dresses dribbled drier driest drying duel dueled duels dusted dying eases ebbed eco edges ego elsewhere embed ended era etches evening evenings exile exiles eyebrow eyebrows eyelash eyelid eyelids eyesight fabled faces faded fainted farewell farewells fasted fated fatigue fatigued fatigues faulted faxes feasted female females fences fetches fibre fibres fiddled fielded fiercely finely fire fired fires firewall firework fireworks fishes fitted fixes flashes floated flooded flour flours fluent fluid fluids flying folded folktale footed forces forecast forecasts forehead foreheads foreman foremen foresaw foresee foreseen foresees founded foxes fractious freezes fronted frosted frying fuel fueled fuelled fuels funded fuses fusses gamely gases gasses gated gateway gateways gazes genre genres giant giants gifted giggled glances glasses glided glimpses going gorgeous gorges graceful graces graded grafted granted grapefruit grapefruits grasses grateful gravestone greeted grosses grounded grumbled guarded guesses guested guidebook guidebooks guided guideline guidelines gushes haggled handed handled hatches hated hatred haunted headed hearted heated hedgehog hedgehogs hedges herded hinted hire hired hires hitches hoisted homeless homely homestead homesteads hometown hometowns homeward homework hopeful hopefuls hopeless horses hosted hostile hour hours household households houses housewife housewives housework huddled hugely humbled hundred hunted iceman ices icy idled ids inches inhale interest interests itches jaded jetted jointed judgement judgements judges juices kidded kisses knotted landed lapses largely lasted lately lauded launches leant leases leashes liar liars lifeguard lifeguards lifeless lifelong lifestyle lifestyles lifetime lifetimes lifted lighted likely likeness likewise lion lions listed lively loaded lodges lonely loosely looses loses losses lovely lunches lusted lying mangled marbled marches masses matches mated maybe meanwhile melted mended merely merges meshes messes metre metres milieu minded minefield minefields mingled minted misled misses missile missiles mixes mobile mobiles molded mosses mottled mounted movement movements mr mrs mumbled muscled muses mystique naive naked needed needled netted nicely niches nieces nineteen ninety nodded noises noses notebook notebooks noted nurses oblique ok omelet omelets oneself opaque opera operas ounces our ours paces padded paddled pages painted parted passes patches pauses pavement pavements pc peaceful peaches peopled perches petted ph phases phrases physique pickled pieces pitches pitted places planted plated pleaded pleases plotted plunges pluses pm poem poems poet poets pointed porches ported poses posted potted pounded praises prances preaches precious presses priceless prices prided princes printed prior priors privilege privileged prizes profile profiles prompted psyche psyches pulses punches purses pushes puzzled pyre pyres queerer quizzes quoted races rages ragged raises ranges rarely rashes rated rattled reaches react reacts rented rested revile rhythm rhythms riddled ridges righted rises roasted rooted roses rounded routed rudely ruin ruined ruins rumbled rushes sacred safeguard safeguards safely safeties safety sages salesman salesmen salted sampled sanded saucepan sauces scarcely scented schedule schedules science scolded scrambled scratches scribbled scripted searches seated seeded seizes senses settled several sexes shaded shameful shielded shifted shorted shouted shying sided sidewalk sidewalks sighted singled sited sizes skateboard skated sketches skiing skirted slashes slices slighted slotted smarted smashes smokestack smokestacks sneezes someday somehow someplace something sometime sometimes somewhat somewhere sophomore sophomores sorted sounded sour sources soured sours spaces spaceship spaceships spacious sparkled speeches speeded spices splashes spokesman spokesmen sponges sported spotted sprinted sprouted spying squeezing stages stapled started startled stated stately statement statements statesman statesmen statewide stitches stockpile stockpiles stranded strangely strangled stresses stretches struggled stumbled suing suited surely surges sweated switches tabled tackled tactile tangled tasted tasteless taunted taxes teaches teases technique techniques telltale telltales temperate tempted tended tested thereby therefore theses threaded tickled timeless timely tire tired tires titled toasted toppled torches tosses touches traces traded trampled trashes treated trembled trended trial trials trio triumph triumphed triumphs troubled truest trusted trying tumbled tv twinkled twisted twitches tying unique urges useful useless uses vases verses vetted via vices vicious voices voted wages waited wanted warded washes wasted wasteful watches waxes wedded wednesday weeded weighted wheezes whistled whited wicked widely widespread winded wire wired wires wishes wooded worded worthwhile wounded wrangled wrenches yeses yielded","1":"aisle aisles cheque cheques chiles drawer drawers eyes file files gale gales hole holes isle isles league leagues male males mile miles mosque mosques mule mules pale pales pile piles plague plagued plagues plaque plaques pole poles prayer prayers queen queens queer queers queue queues role roles rule rules sale sales scale scales smile smiles squeeze squeezed stole style styles tale tales tile tiles tongue tongued tongues vague whale whales while whiles whole wholes","5":"aborigine accompanying accumulated adulterated affectionately alcoholism alienated alienating alleviated alleviating alternatively ambiguities ambiguity anticipated apologises apologizes appreciated appreciating appreciation appreciative appropriated appropriating approximated approximately articulated assimilated associated associating association associations athleticism automatically axiomatic biochemistry biological cafeteria cafeterias categorizes characterizes choreography chronologically claustrophobia coincidences collaborated commemorated commensurately communicated conciliation congratulated contaminated continually continuity contractually cooperated cooperating cooperation cooperations cooperative creativity curiosities curiosity deliberated deliberately demographically denunciation denunciations disadvantages disappearances discriminated disqualifying disseminated domesticated ecologically economizes editorial editorials elaborated eliminated emulsifier emulsifying enthusiasm enthusiasms enthusiastic equilibria equilibrium euphemistically evacuated evacuating evacuation evacuations evaluated evaluating evaluation evaluations eventually exaggerated exhilarated experiences experiencing experimented facilitated figuratively geographical geological gravitationally humiliated humiliating humiliation humiliations identifying ideologies ideology idiomatic illuminated immortalizes impersonated impresario impressionism incongruity indefinitely individual individuals industrialize industrialized inexperienced ingenuity ingratiating intellectual intellectuals intermediate intermediates interrogated invariable invariably investigated manipulated materialize materialized mediocrity negotiated negotiating negotiation negotiations notoriety obituaries obituary originated paradoxically participated patriotism perpetuated perpetuating personalizes personifying photocopying preoccupation preoccupations prohibitively proliferated pronunciation pronunciations proprietaries proprietary provocatively psychologically punctuality reassurances recuperated reorganizes reorganizing resuscitated reverberated sophisticated spontaneity stereotyping subordinated substantiated surreptitiously temperamentally testimonial testimonials undergraduate undergraduates unenviable unfortunately unreliable unusually vegetarian vegetarians virtuosity","7":"individualism individuality meteorological"}};
var LVL = ["A1","A2","B1","B2","C1","C2"];
var LEXM = Object.create(null), IRRM = Object.create(null);
LVL.forEach(function(L,i){ LEXD.lv[L].split(" ").forEach(function(w){ LEXM[w] = i; }); });
LEXD.irr.split(" ").forEach(function(p){ var a = p.split(">"); IRRM[a[0]] = a[1]; });

function lexCands(w){
  var c = [w], b;
  if(/ies$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/es$/.test(w)) c.push(w.slice(0,-2));
  if(/s$/.test(w) && !/ss$/.test(w)) c.push(w.slice(0,-1));
  if(/ied$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/ed$/.test(w)){ b = w.slice(0,-2); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  if(/ing$/.test(w)){ b = w.slice(0,-3); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); if(/y$/.test(b)) c.push(b.slice(0,-1)+"ie"); }
  if(/ier$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/iest$/.test(w)) c.push(w.slice(0,-4)+"y");
  if(/er$/.test(w)){ b = w.slice(0,-2); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  if(/est$/.test(w)){ b = w.slice(0,-3); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  return c;
}
function lexLemma(w){
  if(IRRM[w]) return IRRM[w];
  var c = lexCands(w);
  for(var i=0;i<c.length;i++) if(LEXM[c[i]]!==undefined) return c[i];
  return null;
}
var S_PRON = {"it":1,"he":1,"she":1,"that":1,"there":1,"what":1,"who":1,"here":1,"where":1,"how":1,"this":1};
var DERIV = /(ly|ness|tion|sion|ment|ity|ive|ous|able|ible|ful|less|ism|ist|ize|ise|ical|ally)$/;
function splitContraction(lw){
  var m;
  if(lw==="can't" || lw==="cannot") return ["can","not"];
  if(lw==="won't") return ["will","not"];
  if(lw==="shan't") return ["shall","not"];
  if((m = lw.match(/^(.+)n't$/))) return [m[1],"not"];
  if((m = lw.match(/^(.+)'s$/))) return m[1]==="let" ? ["let","us"] : (S_PRON[m[1]] ? [m[1],"be"] : [m[1]]);
  if((m = lw.match(/^(.+)'(re|m)$/))) return [m[1],"be"];
  if((m = lw.match(/^(.+)'ve$/))) return [m[1],"have"];
  if((m = lw.match(/^(.+)'ll$/))) return [m[1],"will"];
  if((m = lw.match(/^(.+)'d$/))) return [m[1],"would"];
  if((m = lw.match(/^(.+)'$/))) return [m[1]];
  return [lw];
}
var lastVocab = null;
function vocabProfile(text){
  var a = analyze(text);
  var sents = a.titles.map(function(t){ return {s:t.text, title:true}; }).concat(a.sents.map(function(s){ return {s:s, title:false}; }));
  var counts = [0,0,0,0,0,0], off = 0, N = 0, byLemma = Object.create(null), offW = Object.create(null), proper = Object.create(null);
  function add(part){
    var lem = lexLemma(part);
    N++;
    if(lem===null){ off++; offW[part] = (offW[part]||0) + 1; return; }
    var lv = LEXM[lem]; counts[lv]++;
    var k = lem; if(!byLemma[k]) byLemma[k] = {w:lem, lv:lv, n:0}; byLemma[k].n++;
  }
  sents.forEach(function(o){
    var s = o.s.replace(/[—–]/g," ").replace(/[’‘]/g,"'");
    var re = /[A-Za-z0-9]+(?:'[A-Za-z]+)*(?:-[A-Za-z0-9]+(?:'[A-Za-z]+)*)*'?/g, m, first = true;
    while((m = re.exec(s))){
      var t = m[0];
      if(/\d/.test(t)){ first = false; continue; }
      var initial = first || o.title; first = false;
      var lowT = t.toLowerCase();
      var mixed = /[a-z][A-Z]/.test(t), allCaps = /^[A-Z]{2,}$/.test(t.replace(/'.*$/,"")), cap = /^[A-Z]/.test(t);
      var isProper = false;
      if(mixed) isProper = true;
      else if(allCaps) isProper = lexLemma(lowT)===null;
      else if(cap && t!=="I"){
        if(!initial) isProper = true;
        else { var base = splitContraction(lowT)[0].split("-")[0]; isProper = lexLemma(base)===null && !DERIV.test(base); }
      }
      if(isProper){ proper[t] = (proper[t]||0) + 1; continue; }
      splitContraction(lowT).forEach(function(w){ w.split("-").forEach(function(p){ if(p && /[a-z]/.test(p)) add(p); }); });
    }
  });
  var cum = [], run = 0;
  for(var i=0;i<6;i++){ run += counts[i]; cum.push(N ? 100*run/N : 0); }
  var Nin = N - off, cumIn = [], run2 = 0;
  for(var j=0;j<6;j++){ run2 += counts[j]; cumIn.push(Nin ? 100*run2/Nin : 0); }
  function lvlAt(arr, th){ for(var k=0;k<6;k++) if(arr[k] >= th) return k; return 6; }
  var above = [], offList = [];
  Object.keys(byLemma).forEach(function(k){ var b = byLemma[k]; above.push(b); });
  Object.keys(offW).forEach(function(k){ offList.push({w:k, n:offW[k]}); });
  above.sort(function(x,y){ return y.lv-x.lv || y.n-x.n; });
  offList.sort(function(x,y){ return y.n-x.n; });
  return {N:N, off:off, counts:counts, cum:cum, cumIn:cumIn, lvl95:lvlAt(cum,95), lvl95In:lvlAt(cumIn,95), lvl98:lvlAt(cum,98), lvl98In:lvlAt(cumIn,98), lemmas:above, offList:offList, proper:Object.keys(proper)};
}
/* chặn dưới "không dễ quá": mức thấp nhất phủ được 96% tổng số lượt từ, từ ngoài danh sách tính là từ khó (tên riêng vẫn loại) — quy ước nhóm, thử nghiệm 42 bài đối chiếu Cathoven, Nick chốt 13/11/2026 */
var EASY_TH = 96;
function easyLvl(vp){ if(!vp || !vp.N) return 6; for(var k = 0; k < 6; k++) if(vp.cum[k] >= EASY_TH) return k; return 6; }
/* số lượt từ ở mức fl trở lên, cộng từ ngoài danh sách */
function easyUpto(vp, fl){ var u = vp.off || 0; for(var k = fl; k < 6; k++) u += vp.counts[k] || 0; return u; }
function covAt(vp, levelName, ignoreOff){ var i = LVL.indexOf(levelName); if(i<0) return null; return (ignoreOff ? vp.cumIn : vp.cum)[i]; }
function lvlName(i){ return i>=6 ? "trên C2" : LVL[i]; }

/* ================= Flesch Reading Ease (âm tiết theo CMU, từ ngoài bảng đoán theo chính tả) ================= */
var SYLX = Object.create(null);
Object.keys(LEXD.syl||{}).forEach(function(k){ LEXD.syl[k].split(" ").forEach(function(w){ SYLX[w] = +k; }); });
function sylHeur(w){
  if(w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  var m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 0);
}
function sylCount(tok){
  if(!/[A-Za-z]/.test(tok)) return 1;
  return tok.split("-").reduce(function(sum, part){
    var w = part.toLowerCase().replace(/[^a-z]/g, "");
    if(!w) return sum;
    return sum + (SYLX[w] || sylHeur(w));
  }, 0) || 1;
}
var FRE_MIN = {A1:90, A2:80, B1:70, B2:60, C1:50, C2:0};
var FRE_MAX = {A1:1e9, A2:90, B1:80, B2:70, C1:60, C2:50};
/* câu trung bình (từ) và âm tiết mỗi từ gợi ý để FRE rơi vào giữa khoảng của mức */
var FRE_ASL = {A1:[6,9], A2:[8,12], B1:[11,15], B2:[14,18], C1:[17,21], C2:[19,24]};
var FRE_SPW = {A1:"1.20–1.30", A2:"1.25–1.35", B1:"1.33–1.43", B2:"1.45–1.52", C1:"1.53–1.60", C2:"1.60–1.70"};
function freWin(L){ L = L || S.level; var a = FRE_MIN[L], b = FRE_MAX[L]; return b > 200 ? "từ " + a + " trở lên" : (a > 0 ? "từ " + a + " đến dưới " + b : "dưới " + b); }
function freWinShort(L){ L = L || S.level; var a = FRE_MIN[L], b = FRE_MAX[L]; return b > 200 ? "≥ " + a : (a > 0 ? a + "–" + (b - 0.1).toFixed(1) : "< " + b); }
function freIn(f, L){ L = L || S.level; return f >= FRE_MIN[L] && f < FRE_MAX[L]; }
var FRE_BANDS = [[90,"Very easy","A1"],[80,"Easy","A2"],[70,"Fairly easy","B1"],[60,"Standard","B2"],[50,"Fairly difficult","C1"],[-1e9,"Difficult to very difficult","C2"]];
function freBand(f){ for(var i=0;i<FRE_BANDS.length;i++) if(f >= FRE_BANDS[i][0]) return FRE_BANDS[i]; return FRE_BANDS[FRE_BANDS.length-1]; }
function fleschOf(text){
  var a = analyze(text), W = 0, Sy = 0, poly = Object.create(null);
  a.body.forEach(function(b){
    b.text.replace(/[—–]/g, " ").split(/\s+/).forEach(function(t){
      if(!/[\p{L}\p{N}]/u.test(t)) return;
      W++;
      var c = sylCount(t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""));
      Sy += c;
      if(c >= 3){ var k = t.toLowerCase().replace(/[^a-z-]/g, ""); if(k && !/^[A-Z]/.test(t.replace(/^[^A-Za-z]+/, ""))) poly[k] = (poly[k]||0) + 1; }
    });
  });
  var S = a.sents.length;
  if(W < 60 || S < 3) return {ok:false, W:W, S:S};
  var asl = W/S, spw = Sy/W;
  var fre = 206.835 - 1.015*asl - 84.6*spw, fk = 0.39*asl + 11.8*spw - 15.59;
  var polyList = Object.keys(poly).map(function(k){ return {w:k, n:poly[k]}; }).sort(function(x,y){ return y.n-x.n; });
  var longest = a.sents.map(function(s){ return {s:s, n:wc(s)}; }).sort(function(x,y){ return y.n-x.n; }).slice(0,3);
  var shortest = a.sents.map(function(s){ return {s:s, n:wc(s)}; }).filter(function(x){ return x.n <= 8; }).sort(function(x,y){ return x.n-y.n; }).slice(0,10);
  var mono = Object.create(null);
  a.body.forEach(function(b){ (b.text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).forEach(function(t){ if(/^[A-Z]/.test(t) || /['’]/.test(t)) return; var k = t.toLowerCase(); if(k.length >= 4 && sylCount(k)===1 && !(typeof STOPW!=="undefined" && STOPW[k])) mono[k] = (mono[k]||0) + 1; }); });
  var monoList = Object.keys(mono).map(function(k){ return {w:k, n:mono[k]}; }).sort(function(x,y){ return y.n-x.n; });
  return {ok:true, W:W, S:S, Sy:Sy, asl:asl, spw:spw, fre:fre, fk:fk, poly:polyList, longest:longest, shortest:shortest, mono:monoList};
}

;
/* ================= UI (giao diện từng bước) ================= */
var CODE_RULE = "Trình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: ";
function fmtPrompt(key, from, to){
  if(!P[key]) return;
  var before = P[key].t;
  P[key].t = before.replace(from, to);
  if(P[key].t === before && typeof console!=="undefined") console.warn("fmtPrompt: không thay được", key);
}
var NO_RARE = "Không làm bài khó lên bằng từ trên mức {level}, từ ít gặp hay câu đánh đố. Khi cần nâng độ khó (Flesch cao quá, mức từ vựng thấp hơn mục tiêu) thì dùng từ đúng mức {level}, cụm động từ, kết hợp từ, câu phức hợp lý (đề xuất của tập huấn; nếu đá với các yêu cầu bắt buộc ở trên thì theo yêu cầu bắt buộc).";
function applyOutputRules(){
  fmtPrompt("b4", 'Trình bày: bài đọc trước; sau một dòng "---", ghi ', CODE_RULE + 'bài đọc trước; sau đó một dòng riêng "=== GHI CHÚ ===", rồi ghi ');
  ["quickfix","b6up","frefix"].forEach(function(k){ fmtPrompt(k, /Trình bày: toàn bài đã sửa trước; sau một dòng "---", /, CODE_RULE + 'toàn bài đã sửa trước; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi '); });
  fmtPrompt("b6", /Trình bày: bài đã sửa trước; sau một dòng "---", /, CODE_RULE + 'toàn bài đã sửa trước; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi ');
  fmtPrompt("fixpara", /Trình bày: toàn bài sau khi sửa; sau một dòng "---", /, CODE_RULE + 'toàn bài sau khi sửa; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi ');
  ["b8_1","b8_2","b8_3"].forEach(function(k){ fmtPrompt(k, /Cuối bài, sau một dòng "---", ghi số từ\./, 'Trình bày toàn bộ trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code; cuối khối code là một dòng riêng "=== GHI CHÚ ===" rồi ghi số từ.'); });
  fmtPrompt("b3", "Chỉ trả về bản dịch.", "Chỉ trả về bản dịch, đặt trong MỘT khối code (```text ... ```); các đoạn cách nhau một dòng trống.");
  fmtPrompt("facts", "Chỉ trả về đoạn dữ kiện.", "Chỉ trả về đoạn dữ kiện, đặt trong MỘT khối code (```text ... ```).");
  fmtPrompt("b7", /Viết đúng khuôn dưới đây để trang web tự áp dụng\. Không thêm chữ nào khác trong phần này, không dùng bảng, không in đậm\.\nDòng đầu tiên của phần B là:/,
    "Đặt TOÀN BỘ phần B trong MỘT khối code (```text ... ```) để người dùng bấm nút Copy của khối code. Trong khối code: không dùng bảng, không in đậm, không gạch đầu dòng; mỗi trường SỬA, CŨ, MỚI, LÝ DO nằm trên một dòng riêng.\nDòng đầu tiên trong khối code là:");
  ["quickfix","b6","b6up","frefix","fixpara"].forEach(function(k){ fmtPrompt(k, /(=== THAY ĐỔI ===", rồi [^\n]*?)(\.?)(\n|$)/, "$1, mỗi thay đổi một dòng.$3"); });
  // trang tự so từng chữ với bản trước, nên không bắt AI tự kể các thay đổi (danh sách đó không được dùng)
  Object.keys(P).forEach(function(k){ if(!P[k] || !P[k].t) return; P[k].t = P[k].t.replace(/toàn bài (?:đã sửa trước|sau khi sửa|đã sửa); sau đó một dòng riêng "=== THAY ĐỔI ===", rồi [^\n]*?mỗi thay đổi một dòng\./g, "chỉ có toàn bài đã sửa, không viết gì thêm sau bài. Không cần liệt kê các thay đổi: trang soạn đề tự so từng chữ với bản trước."); });
  // không làm bài khó lên bằng từ hiếm (tập huấn, bước cân bằng độ khó): mọi câu lệnh sửa bài
  ["quickfix","b6","b6up","fixpara","frefix","bothfix","wordfix","fixall","ovfix"].forEach(function(k){
    if(!P[k] || !P[k].t || P[k].t.indexOf(NO_RARE) >= 0) return; var m = P[k].t.search(/\n(Trình bày TOÀN BỘ|Đặt TOÀN BỘ)/); if(m >= 0) P[k].t = P[k].t.slice(0, m + 1) + NO_RARE + "\n\n" + P[k].t.slice(m + 1);
  });
}
/* ---------- Làm sạch chữ dán từ chatbot ---------- */
/* chữ dán vào có thể ở dạng tách dấu (Unicode NFD, hay gặp khi chép trên máy Mac/iPhone): "DÒNG" thành D + O + dấu huyền + NG,
   các khuôn tìm "DÒNG", "CÂU", "CHỖ HỎI"… sẽ không nhận ra; đưa về dạng dựng sẵn (NFC) trước khi đọc */
function cleanPaste(t){
  t = t || ""; if(t.normalize) t = t.normalize("NFC");
  return t.replace(/\r/g,"").replace(/[​-‍﻿]/g,"").replace(/ /g," ")
    .split("\n").filter(function(l){ return !/^\s*```[\w-]*\s*$/.test(l); }).join("\n").replace(/^\s+|\s+$/g,"");
}
var SPLIT_RE = /\n[ \t]*(?:={2,}[ \t]*(?:GHI CH[ÚU]|THAY Đ[ỔO]I|THAY DOI)[ \t]*={2,}|-{3,}|\*{3,}|_{3,})[ \t]*(?:\n|$)/i;
var CHATTY_RE = /^(here is|here's|below is|sure|certainly|dưới đây|đây là|bài (đã|đọc|viết)|kịch bản)[^\n]{0,100}:\s*\n/i;
var REMIND_SPLIT = 'Hãy gửi lại TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```). Giữa bài và phần ghi chú phải có một dòng riêng "=== GHI CHÚ ===" (hoặc "=== THAY ĐỔI ===" nếu là bài đã sửa). Không viết gì bên ngoài khối code.';
var REMIND_B7 = 'Hãy viết lại PHẦN B trong MỘT khối code (```text ... ```). Dòng đầu tiên: === CÁC CHỖ SỬA ===. Mỗi chỗ sửa gồm 4 dòng riêng:\nSỬA 1 | PHẢI SỬA (hoặc NÊN XEM, TỰ NHIÊN)\nCŨ: (chép y nguyên một câu trong bản biên tập)\nMỚI: (câu thay thế)\nLÝ DO: (một dòng)\nCác khối cách nhau một dòng trống. Không in đậm, không dùng bảng, không gạch đầu dòng.';
function remindHTML(text){ return ' <button class="btn quiet" type="button" data-remind="' + esc(text).replace(/\n/g,"&#10;") + '">Sao chép câu nhắc AI</button>'; }
function bindRemind(root){ (root||document).querySelectorAll("[data-remind]").forEach(function(b){ if(b.dataset.bound) return; b.dataset.bound = "1"; b.addEventListener("click", function(){ copyText(b.getAttribute("data-remind"), b, "Sao chép câu nhắc AI", "Đã sao chép. Dán vào cùng cuộc trò chuyện với AI"); }); }); }
SLOTS.pdfName = {label:"Tên file PDF", type:"text", ph:"ví dụ: Safira_Chikaraishi_2022.pdf"};
SLOTS.pdfScope = {label:"Phần dùng trong file", hint:"Trang hoặc mục AI cần đọc.", type:"text", ph:"ví dụ: trang 2–9; mục Introduction, Results, Conclusion"};
SLOTS.srcPdfText = {label:"Chữ copy từ PDF (không bắt buộc)", type:"area", optional:true, empty:""};
function isPdfSrc(id){ return S.srcMode==="pdf" && ((id==="src" && S.srcLang!=="vi") || (id==="srcVi" && S.srcLang==="vi")); }
function pdfRef(){
  var n = (S.slots.pdfName||"").trim(), sc = (S.slots.pdfScope||"").trim();
  if(!n || !sc) return "";
  return "(Văn bản nguồn nằm trong file PDF đính kèm: \"" + n + "\". Chỉ dùng phần: " + sc + ". Đọc trực tiếp từ file. Chỗ nào trong file không đọc rõ (bảng, hình, chữ mờ, công thức) thì ghi rõ là không đọc được, không đoán.)";
}
function pdfOn(){ return S.srcMode==="pdf" && S.srcLang!=="vi" && SPEC[S.spec].skill==="R"; }
var SOURCE_NEEDS = {
  R1:"là văn bản thực dụng có nhiều mục thông tin tách bạch (thời gian, địa điểm, giá, điều kiện, cách liên hệ), đúng thể loại thông báo, quảng cáo, hướng dẫn, mô tả công việc hoặc thư.",
  R2:"có số liệu và kết quả nghiên cứu cụ thể, có giải thích nguyên nhân–kết quả, và nếu được thì có nhận định của nhà nghiên cứu.",
  R3:"có giải thích hoặc lập luận về một vấn đề, có ý kiến của chuyên gia hay nhà nghiên cứu (đồng tình, phản bác, cảnh báo), có ví dụ minh hoạ.",
  R4:"có quan điểm rõ của tác giả, có nhiều góc nhìn hoặc tranh luận, có ví dụ minh hoạ và có chỗ để người đọc tự suy luận (nếu là văn chương: có nhân vật, cảm xúc, ẩn ý).",
  L1:"có thông tin thực dụng ngắn, cụ thể: giờ, địa điểm, giá, cách làm.",
  L2:"có tình huống hai người có thể trao đổi: kế hoạch, lựa chọn, ý kiến khác nhau.",
  L3:"có giải thích một khái niệm, có lập luận, ý kiến của chuyên gia và ví dụ minh hoạ."
};
var ANCHOR_RE = /^\s*[-*•]?\s*(MI\[P\]|DE\[P\]|VO\(ID\)|RE|DE|MI|VO|OP|TO|RP|INF|IN|IS|SS|LO)\s*[|:]\s*([^|\n]*?)\s*(?:\|\s*(.*?))?\s*$/i;
function parseAnchors(notes){
  var map = {}, found = false;
  (notes||"").split(/\n/).forEach(function(line){
    var m = line.replace(/\*\*/g,"").match(ANCHOR_RE); if(!m) return;
    found = true;
    var code = m[1].toUpperCase().replace(/^INF$/,"IN"), a = (m[2]||"").trim(), q = (m[3]||"").replace(/^["“'”]+|["“”']+$/g,"").trim();
    if(!map[code]) map[code] = [];
    if(/không có/i.test(a) && !q) map[code].push({none:true});
    else map[code].push({para:a, quote:q});
  });
  return found ? map : null;
}
// khung câu hỏi ở bước 4: "CÂU 3 | B3 trung bình | DE[P] | đoạn 2 | trích"
var FRAME_RE = /^\s*[-*•]?\s*C[ÂA]U\s+(\d+|–|-)\s*\|\s*(B[345])\s+(thấp|trung bình|cao)\s*\|\s*([^|\n]*?)\s*(?:\|\s*([^|\n]*?)\s*)?(?:\|\s*(.*?))?\s*$/i;
function parseFrame(notes){
  var out = [];
  (notes||"").normalize("NFC").split(/\n/).forEach(function(line){
    var m = line.replace(/\*\*/g,"").match(FRAME_RE); if(!m) return;
    var none = /không có/i.test(m[4]||"");
    out.push({n:/\d/.test(m[1]) ? +m[1] : 0, lv:m[2].toUpperCase(), m:m[3].toLowerCase(), code:none ? "" : (typeof qNormCode === "function" ? qNormCode(m[4]) : m[4].toUpperCase()), para:(m[5]||"").trim(), quote:none ? "" : (m[6]||"").replace(/^["“'”]+|["“”']+$/g,"").trim(), none:none});
  });
  return out.length ? out : null;
}
function normQ(s){ return (s||"").toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim(); }
function renderAnchors(){
  var boxes = document.querySelectorAll(".anchormap"); if(!boxes.length) return;
  var sp = SPEC[S.spec];
  if(sp.skill!=="R" || !sp.skills){ boxes.forEach(function(b){ b.innerHTML = ""; }); return; }
  var fr = parseFrame(S.slots.notes), FL = typeof mapLines === "function" ? mapLines() : [];
  if(fr && FL.length){
    var dd = normQ(S.slots.draft), used = {}, real = fr.filter(function(x){ return !x.none; });
    real.forEach(function(x){ var l = FL.filter(function(l){ return !used[l.key] && l.lv === x.lv && l.m === x.m && l.codes.indexOf(x.code) >= 0; })[0]; if(l){ used[l.key] = 1; x.ok = true; } });
    var paras = SPEC[S.spec].skill === "R" ? analyze(S.slots.draft||"").body.length : 0, cov = {}; real.forEach(function(x){ var p = (x.para.match(/\d+/)||[])[0]; if(p) cov[p] = 1; });
    var noPara = []; for(var p = 1; p <= paras; p++) if(!cov[p]) noPara.push(p);
    var nOk = real.filter(function(x){ return x.ok; }).length;
    boxes.forEach(function(box){
      var checkDraft = box.hasAttribute("data-check");
      box.innerHTML = '<p class="small"><b>Khung câu hỏi: ' + nOk + ' / ' + FL.length + ' ô của bảng phân bố có chỗ hỏi.</b>' + (noPara.length ? ' Đoạn ' + noPara.join(", ") + ' chưa có câu.' : '') + '</p><ul class="anc">'
        + fr.slice().sort(function(a, b){ return (a.n || 99) - (b.n || 99); }).map(function(x){
          if(x.none) return '<li class="w"><b>' + esc(x.lv + " " + x.m) + '</b> không có chỗ tự nhiên</li>';
          var still = !checkDraft || !x.quote || dd.indexOf(normQ(x.quote)) >= 0;
          return '<li class="' + (x.ok && still ? "g" : "w") + '"><b>Câu ' + (x.n || "?") + ' · ' + esc(x.lv + " " + x.m) + ' · ' + esc(x.code) + '</b> ' + esc(x.para) + (x.quote ? ': <i>' + esc(x.quote) + '</i>' : '') + (!x.ok ? ' <span>(mã hoặc ô không khớp bảng phân bố, hoặc ô đã có câu)</span>' : '') + (checkDraft && !still ? ' <span>(không còn nguyên văn trong bài, có thể đã bị sửa)</span>' : '') + '</li>';
        }).join("") + '</ul><p class="small muted">Chỉ để tham khảo, không bắt sửa bài. Bước 8 (Chất liệu) có nút điền bản đồ từ khung này.</p>';
    });
    return;
  }
  var codes = sp.skills.split(/\s*,\s*/), map = parseAnchors(S.slots.notes), d = normQ(S.slots.draft);
  boxes.forEach(function(box){
    var checkDraft = box.hasAttribute("data-check");
    if(!map){ box.innerHTML = '<p class="small muted">Chưa có bản đồ điểm neo. Bản đồ nằm ở mục (6) trong phần ghi chú AI viết ở bước 4.</p>'; return; }
    var have = 0, missing = [];
    var rows = codes.map(function(c){
      var list = map[c.toUpperCase()];
      if(!list){ missing.push(c); return '<li class="w"><b>' + esc(c) + '</b> AI chưa ghi</li>'; }
      var real = list.filter(function(x){ return !x.none; });
      if(!real.length){ missing.push(c); return '<li class="w"><b>' + esc(c) + '</b> không có chỗ tự nhiên</li>'; }
      have++;
      return real.map(function(x){
        var still = !checkDraft || !x.quote || d.indexOf(normQ(x.quote)) >= 0;
        return '<li class="' + (still ? "g" : "w") + '"><b>' + esc(c) + '</b> ' + esc(x.para) + (x.quote ? ': <i>' + esc(x.quote) + '</i>' : '') + (checkDraft && !still ? ' <span>(không còn nguyên văn trong bài, có thể đã bị sửa)</span>' : '') + '</li>';
      }).join("");
    }).join("");
    var hi = missing.filter(function(c){ return /^(IN|INF|OP|TO|SS|IS)$/.test(c); });
    box.innerHTML = '<p class="small"><b>Có chỗ để hỏi: ' + have + ' / ' + codes.length + ' mã kỹ năng của ' + esc(sp.label) + '.</b> ' + (missing.length ? 'Chưa có: ' + esc(missing.join(", ")) + '.' : '') + '</p><ul class="anc">' + rows + '</ul>'
      + '<p class="small muted">Chỉ để tham khảo, không bắt sửa. Mã chưa có thì hỏi mã khác của Part. ' + (hi.length >= 2 ? '<b>Thiếu nhiều mã bậc cao (' + esc(hi.join(", ")) + '): nên cân nhắc chọn nguồn có lập luận, nhận định hoặc ví dụ hơn, thay vì ép AI thêm vào.</b>' : 'Đừng yêu cầu AI thêm vào để lấp mã thiếu, vì dễ làm bài gượng hoặc đi xa nguồn.') + '</p>';
  });
}
P.frefix = {title:"Câu lệnh tăng độ dễ đọc (Flesch Reading Ease)", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây có Flesch Reading Ease khoảng {freNow} (câu trung bình {aslNow} từ, trung bình {spwNow} âm tiết mỗi từ). Yêu cầu: Flesch Reading Ease từ {freMin} trở lên, ứng với mức {level}. Để đạt, cần khoảng: {freLever}\n\nHãy sửa theo thứ tự ưu tiên:\n1. Tách các câu dài hoặc nhiều mệnh đề thành câu ngắn hơn, nhất là các câu sau: {longestSents}\n2. Thay một số từ nhiều âm tiết bằng từ ngắn hơn cùng nghĩa, ở mức {level} trở xuống (ví dụ approximately → about, purchase → buy, however → but). Không thay tên riêng, thuật ngữ chính của bài và các từ giữ lại: {{keep}}. Các từ nhiều âm tiết dùng nhiều trong bài: {polyWords}\n3. Ưu tiên tách câu trước, vì thay từ dễ làm bài tụt dưới mức từ vựng {level}. Không thay một từ đúng mức {level} bằng từ dễ hơn hẳn nếu không cần.\n4. Không thêm thông tin, không đổi sự kiện, con số, thứ tự ý. Giữ tổng số từ trong {wordsK} và giữ số đoạn.\n\n{slackRules}\n\n{locks}\n\nTrình bày: toàn bài đã sửa trước; sau một dòng \"---\", liệt kê từng thay đổi theo dạng: câu cũ → câu mới.\n\n{refs}\n\nBÀI:\n{{draft}}"};
P.bothfix = {title:"Câu lệnh sửa cùng lúc: từ vựng dễ quá và độ dễ đọc thấp", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây đang gặp hai vấn đề ngược chiều nhau:\n- Từ vựng dễ hơn mức mục tiêu: tính cả từ ngoài danh sách là từ khó, mức ở ngưỡng 96% là {lvl98Txt}; cần {floorText}, tức độ phủ ở mức {belowLevel} (hiện {covBelowTxt}) phải xuống dưới 96%.\n- Độ dễ đọc thấp hơn yêu cầu: Flesch Reading Ease khoảng {freNow}, cần từ {freMin} (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ).\n\nCách thay từ thông thường sẽ làm vấn đề này tốt lên nhưng vấn đề kia xấu đi. Vì vậy CHỈ sửa theo hai cách sau, vì hai cách này có lợi cho cả hai:\n1. Tách câu: tách câu dài hoặc nhiều mệnh đề thành câu ngắn hơn. Độ dễ đọc tăng, từ vựng không đổi. Nhất là các câu: {longestSents}\n2. Thay từ dài mà dễ bằng từ ngắn mà khó hơn: thay các từ 3 âm tiết trở lên ở mức thấp (danh sách dưới) bằng từ 1–2 âm tiết, cùng nghĩa trong câu, ở mức {upRange} có trong CEFR-J Wordlist 1.5 hoặc Octanove Vocabulary Profile 1.0.{shortExamples} Cần thay {upN}.\nCác từ dài mà dễ trong bài: {longEasyWords}\n\nKhông được làm:\n- Không thay từ ngắn bằng từ dài hơn.\n- Không dùng từ trên mức {level} hoặc từ không có trong hai danh sách trên.\n- Không thay tên riêng, thuật ngữ chính, từ khoá trong tiêu đề, và các từ giữ lại: {{keep}}.\n- Không thêm thông tin, không đổi sự kiện, con số, thứ tự ý. Giữ tổng số từ trong {wordsK} và giữ số đoạn.\n\n{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: toàn bài đã sửa trước; sau đó một dòng riêng \"=== THAY ĐỔI ===\", rồi liệt kê từng thay đổi theo dạng: câu cũ → câu mới, hoặc từ cũ → từ mới (mức CEFR, số âm tiết), mỗi thay đổi một dòng.\n\n{refs}\n\nBÀI:\n{{draft}}"};
var SHORT_POOL = "cope grasp keen boost ease odd dense rural urban ban vital venue route trek lush soar vast scenic vivid hire tend urge eager gain taste ferry humid glimpse stall seek wander fare bold brief crisp fierce harsh steep swift chief prime core trait trend stake scope span shift grant yield cease crash crowd crew dawn dusk fade feast flaw frame gap gaze grief harm haste heap hint host lane leap lure mere mild myth norm path peak pile plea plot pose praise rage rash realm rely remote reveal roam rough rush scarce seize shed shelter shore slight sole stark sum surge tense theme thrill tide toll tough trace treat trim vague vow wage wealth wipe".split(" ");
function shortExamplesFor(levelIdx){
  var seen = {}, out = [];
  SHORT_POOL.forEach(function(w){ if(seen[w]) return; seen[w] = 1; if(LEXM[w]===levelIdx && sylCount(w) <= 2) out.push(w); });
  return out.slice(0, 14);
}
var lastFre = null;
function currentFre(){ var d = S.slots.draft||""; if(!d.trim()) return null; if(!lastFre) lastFre = fleschOf(d); return lastFre; }
function freHowText(L){
  L = L || S.level; var r = FRE_ASL[L];
  return "Flesch Reading Ease phải nằm trong khoảng " + freWin(L) + " (khoảng của mức " + L + "; cao hơn là dễ quá, thấp hơn là khó quá). Cách giữ trong khoảng: câu trung bình khoảng " + r[0] + "–" + r[1] + " từ, từ trung bình khoảng " + FRE_SPW[L] + " âm tiết; không câu nào trên 25 từ, không dồn nhiều câu rất ngắn liền nhau; dùng từ nội dung 2–3 âm tiết đúng mức " + L + " xen với từ ngắn, không cố chọn toàn từ ngắn hoặc toàn từ dài.";
}
function freExtend(v){
  var fm = FRE_MIN[S.level], fx = FRE_MAX[S.level]; v.freMin = String(fm); v.freMax = fx > 200 ? "" : String(fx);
  v.freWin = freWin(); v.freWinShort = freWinShort(); v.freHow = freHowText();
  var f = currentFre(), AR = FRE_ASL[S.level], isL = SPEC[S.spec].skill==="L";
  v.shortestSents = "không có"; v.monoWords = "không có"; v.spkTrim = "";
  if(!f || !f.ok){ v.freNow = "chưa đo"; v.aslNow = "?"; v.spwNow = "?"; v.freLever = "chưa đo được (bài cần ít nhất 60 từ và 3 câu)."; v.longestSents = "không có"; v.polyWords = "không có"; return; }
  v.freNow = f.fre.toFixed(1); v.aslNow = f.asl.toFixed(1); v.spwNow = f.spw.toFixed(2);
  var parts = [];
  if(freIn(f.fre)) parts.push("bài đã nằm trong khoảng; giữ nguyên độ dài câu và độ dài từ hiện tại.");
  else if(f.fre < fm){
    var tg = Math.min(fm + 3, (fm + fx) / 2), needAsl = (206.835 - 84.6*f.spw - tg) / 1.015;
    if(needAsl >= AR[0]){
      parts.push("tách câu: giảm độ dài câu trung bình từ " + f.asl.toFixed(1) + " xuống khoảng " + needAsl.toFixed(1) + " từ, tức tách thêm khoảng " + Math.max(1, Math.ceil(f.W/needAsl) - f.S) + " câu. Cách này đủ để đạt, không cần thay từ");
    } else {
      var aslT = Math.min(f.asl, AR[0]), spwT = (206.835 - 1.015*aslT - tg) / 84.6;
      var cut = Math.max(0, Math.ceil(f.W/aslT) - f.S), rep = Math.max(1, Math.ceil((f.spw - spwT) * f.W / 1.5));
      parts.push("chỉ tách câu là không đủ (câu sẽ ngắn dưới " + AR[0] + " từ, quá ngắn cho mức " + S.level + "). Cần kết hợp: " + (cut ? "tách thêm khoảng " + cut + " câu để câu trung bình còn khoảng " + aslT.toFixed(0) + " từ, và " : "") + "thay khoảng " + rep + " từ 3 âm tiết trở lên bằng từ 1–2 âm tiết cùng nghĩa (để số âm tiết trung bình còn khoảng " + spwT.toFixed(2) + ")");
    }
    parts.push("không sửa quá tay: Flesch phải dưới " + fx);
  } else {
    var tg2 = Math.max(fx - 3, (fm + fx) / 2), needAsl2 = (206.835 - 84.6*f.spw - tg2) / 1.015;
    if(needAsl2 <= AR[1]){
      parts.push("gộp câu: tăng độ dài câu trung bình từ " + f.asl.toFixed(1) + " lên khoảng " + needAsl2.toFixed(1) + " từ, tức gộp bớt khoảng " + Math.max(1, f.S - Math.floor(f.W/needAsl2)) + " câu (nối hai câu ngắn liền nhau bằng and, but, so, because hoặc dấu phẩy). Cách này đủ để đạt, không cần thay từ");
    } else {
      var aslH = Math.max(f.asl, AR[1]), spwH = (206.835 - 1.015*aslH - tg2) / 84.6;
      var join = Math.max(0, f.S - Math.floor(f.W/aslH)), rep2 = Math.max(1, Math.ceil((spwH - f.spw) * f.W / 1.2));
      parts.push("chỉ gộp câu là không đủ (câu sẽ dài quá " + AR[1] + " từ, nặng hơn mức " + S.level + "). Cần kết hợp: " + (join ? "gộp bớt khoảng " + join + " câu để câu trung bình lên khoảng " + aslH.toFixed(0) + " từ, và " : "") + "thay khoảng " + rep2 + " từ 1 âm tiết bằng từ 2–3 âm tiết cùng nghĩa, cùng mức " + S.level + " (để số âm tiết trung bình lên khoảng " + spwH.toFixed(2) + ")");
    }
    parts.push("không sửa quá tay: Flesch phải từ " + fm + " trở lên");
  }
  v.shortestSents = f.shortest.length ? f.shortest.map(function(l){ return "\"" + l.s + "\" (" + l.n + " từ)"; }).join("; ") : "không có";
  var keepM = {}; keepList().forEach(function(k){ keepM[k.toLowerCase()] = 1; });
  var mw = f.mono.filter(function(p){ return !keepM[p.w]; }).slice(0, 15).map(function(p){ return p.w + (p.n>1 ? " ×" + p.n : ""); });
  v.monoWords = mw.length ? mw.join(", ") : "không có";
  if(isL && typeof spkTrimText==="function") v.spkTrim = spkTrimText();
  v.freLever = parts.join("; ");
  var tiB = LVL.indexOf(S.level), bi2 = LVL.indexOf(v.belowLevel), keepB = {};
  keepList().forEach(function(k){ keepB[k.toLowerCase()] = 1; });
  var topicB = {}; (analyze(S.slots.draft||"").titles||[]).forEach(function(t){ (t.text.toLowerCase().match(/[a-z]+/g)||[]).forEach(function(w){ var l = lexLemma(w); topicB[l||w] = 1; }); });
  var le = f.poly.filter(function(p){ var parts = p.w.split("-"), lem = lexLemma(parts[parts.length-1]); if(keepB[p.w] || topicB[lem||p.w]) return false; return lem===null || LEXM[lem] <= Math.max(0, bi2); }).slice(0, 15)
    .map(function(p){ var parts = p.w.split("-"), lem = lexLemma(parts[parts.length-1]); return p.w + " (" + (lem===null ? "ngoài danh sách" : LVL[LEXM[lem]]) + ", " + sylCount(p.w) + " âm tiết" + (p.n>1 ? ", ×" + p.n : "") + ")"; });
  v.longEasyWords = le.length ? le.join("; ") : "không có";
  var ex = shortExamplesFor(tiB);
  v.shortExamples = ex.length ? " Ví dụ từ ngắn ở mức " + S.level + ": " + ex.join(", ") + "." : "";
  v.longestSents = f.longest.map(function(l){ return "\"" + l.s + "\" (" + l.n + " từ)"; }).join("; ");
  var keep = {}; keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var pw = f.poly.filter(function(p){ return !keep[p.w]; }).slice(0, 12).map(function(p){ return p.w + (p.n>1 ? " ×" + p.n : ""); });
  v.polyWords = pw.length ? pw.join(", ") : "không có";
}

/* ================= Bộ sửa tổng quát: tự sinh câu lệnh từ trạng thái các dòng kiểm ================= */
function draftSig(t){ var h = 0, s = (t||"").trim(); for(var i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) | 0; } return s.length + ":" + h; }
function pfUsable(){ return S.pfSig && S.pfSig === draftSig(S.slots.draft); }
function evalChecks(){
  var txt = S.slots.draft || ""; if(!txt.trim()) return null;
  var sp = SPEC[S.spec], a = lastAnalysis || analyze(txt), vp = currentVocab(), fr = currentFre();
  var ti = LVL.indexOf(S.level), fl = Math.max(0, ti - (parseInt(S.floor,10)||0)), fm = FRE_MIN[S.level];
  var C = {}, isR = sp.skill==="R";
  // độ dài
  if(sp.min){ var lo = sp.min, hi = sp.max; } else { var lo = sp.approx - 15, hi = sp.approx + 15; }
  C.len = {ok: a.total>=lo && a.total<=hi, now:a.total, lo:lo, hi:hi, room:{up:hi-a.total, down:a.total-lo}};
  C.len.near = C.len.ok && Math.min(C.len.room.up, C.len.room.down) <= 5;
  if(isR){
    var tp = S.spec==="R1" ? 4 : (parseInt(S.paras,10)||5);
    C.paras = {ok: a.body.length===tp, now:a.body.length, target:tp};
    C.title = {ok: a.titles.length===1, now:a.titles.length};
  }
  C.long = {ok: !a.long.length, list:a.long};
  // từ vựng: ưu tiên số Text Profiler nếu còn khớp bài hiện tại
  var usePf = pfUsable(), pfCov = parseFloat(String(S.slots.pfCov||"").replace(",", ".")), pfL = ["A1","A2","B1","B2","C1","C2","trên C2"].indexOf(S.slots.pfLvl95||"");
  var covNow = usePf && !isNaN(pfCov) ? pfCov : vp.cum[ti], lvlNow = usePf && pfL>=0 ? pfL : vp.lvl95In;
  C.hard = {ok: covNow >= sp.cov && !(usePf && pfL > ti), now:covNow, src: usePf && !isNaN(pfCov) ? "Text Profiler" : "trang ước lượng"};
  C.hard.near = C.hard.ok && covNow < sp.cov + 1.5;
  var belowCov = fl>0 ? vp.cumIn[fl-1] : 0;
  var lvlEasy = easyLvl(vp), belowCov98 = fl>0 ? vp.cum[fl-1] : 0;
  C.easy = {ok: lvlEasy >= fl, now:lvlEasy, floor:fl, src:"trang tính, ngưỡng " + EASY_TH + "%"};
  C.easy.near = C.easy.ok && fl>0 && belowCov98 >= EASY_TH - 1.5;
  if(fr && fr.ok){ var fx = FRE_MAX[S.level]; C.fre = {ok: freIn(fr.fre), low: fr.fre < fm, high: fr.fre >= fx, now:fr.fre, min:fm, max:fx}; C.fre.nearLow = C.fre.ok && fr.fre < fm + 3; C.fre.nearHigh = C.fre.ok && fx < 200 && fr.fre > fx - 3; C.fre.near = C.fre.nearLow || C.fre.nearHigh; }
  var wantUK = S.spelling==="Anh–Anh", wrong = (wantUK ? a.us : a.uk).concat(wantUK ? a.usDates : a.ukDates);
  C.spell = {ok: !wrong.length, list:wrong};
  var lostKeep = keepList().filter(function(k){ return !new RegExp("(^|[^\\p{L}])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?=$|[^\\p{L}])","u").test(txt.toLowerCase()); });
  C.keep = {ok: !lostKeep.length, list:lostKeep};
  return {C:C, a:a, vp:vp, fr:fr, ti:ti, fl:fl, fm:fm, sp:sp, isR:isR};
}
function buildFixPlan(){
  var E = evalChecks(); if(!E) return null;
  var C = E.C, sp = E.sp, L = S.level, goals = [], keeps = [], acts = [], data = [], forb = [];
  var floorName = LVL[E.fl], range = E.fl===E.ti ? L : floorName + "–" + L;
  var freTight = C.fre && (C.fre.low || C.fre.nearLow), freHi = C.fre && (C.fre.high || C.fre.nearHigh), easyTight = !C.easy.ok || C.easy.near, hardTight = !C.hard.ok || C.hard.near;
  // ---- mục tiêu (dòng đỏ) và thao tác tương ứng
  if(!C.len.ok){
    if(C.len.now < C.len.lo){
      goals.push("Độ dài: " + C.len.now + " từ, thiếu " + (C.len.lo - C.len.now) + " từ (cần " + sp.words + ", tính cả tiêu đề): thêm từ " + (C.len.lo - C.len.now) + " đến " + (C.len.hi - C.len.now) + " từ.");
      var addN = C.len.lo - C.len.now + 3, nS = Math.max(1, Math.round(addN/12));
      acts.push("Thêm khoảng " + addN + " từ (khoảng " + (nS<=2 ? "1–2" : nS) + " câu) diễn đạt lại " + (nS<=2 ? "một chi tiết" : "các chi tiết") + " CÓ TRONG NGUỒN mà bài chưa dùng (xem văn bản nguồn bên dưới)" + (nS>6 ? "; nếu nguồn không đủ chi tiết, dừng lại và báo thiếu bao nhiêu từ thay vì tự thêm ý" : "") + ". Câu thêm dài khoảng " + FRE_ASL[L][0] + "–" + FRE_ASL[L][1] + " từ" + (hardTight ? ", chỉ dùng từ ở mức " + L + " trở xuống có trong danh sách" : "") + (freTight ? ", ưu tiên từ 1–2 âm tiết" : (freHi ? ", không viết câu rất ngắn, có từ nội dung 2–3 âm tiết" : "")) + ". Không thêm ý ngoài nguồn, không thêm câu bình luận.");
    } else {
      goals.push("Độ dài: " + C.len.now + " từ, thừa " + (C.len.now - C.len.hi) + " từ (cần " + sp.words + "): bớt từ " + (C.len.now - C.len.hi) + " đến " + (C.len.now - C.len.lo) + " từ.");
      acts.push("Bớt khoảng " + (C.len.now - C.len.hi + 3) + " từ: rút gọn cách diễn đạt dài dòng, bỏ từ thừa, hoặc bỏ một chi tiết phụ không nằm trong bản đồ điểm neo và không chứa từ giữ lại.");
    }
  }
  if(C.paras && !C.paras.ok){ goals.push("Số đoạn: có " + C.paras.now + ", cần " + C.paras.target + "."); acts.push("Chia lại cho đúng " + C.paras.target + " đoạn theo ý chính (mỗi đoạn một ý, các đoạn không dài đều nhau, cách nhau một dòng trống). Không đổi câu chữ khi chia đoạn."); }
  if(C.title && !C.title.ok){ goals.push("Tiêu đề: " + (C.title.now ? "có " + C.title.now + " dòng giống tiêu đề" : "không có") + "."); acts.push("Đặt đúng một tiêu đề ở dòng đầu, tối đa 10 từ, không có dấu chấm cuối; các dòng khác đều phải kết thúc bằng dấu câu."); }
  if(!C.long.ok){ goals.push("Câu dài: " + C.long.list.length + " câu trên 25 từ: " + C.long.list.map(function(l){ return "\"" + l.s.split(/\s+/).slice(0, 6).join(" ") + "…\" (" + l.n + " từ)"; }).join("; ") + ". Tách mỗi câu thành hai câu."); acts.push("Tách các câu trên 25 từ thành câu ngắn hơn: " + C.long.list.map(function(l){ return "\"" + l.s + "\""; }).join("; ")); }
  if(!C.hard.ok){
    var cg = covGapText(C.hard.now, sp.cov, L);
    goals.push("Không khó quá: độ phủ ở mức " + L + " là " + C.hard.now.toFixed(1) + "% (" + C.hard.src + ")" + cg.now + ", cần từ " + sp.cov + "%" + cg.need + "." + aboveTopText(E.vp, E.ti, 8));
    acts.push("Thay các từ trên mức " + L + " và từ ngoài danh sách CEFR-J/Octanove (danh sách bên dưới) bằng từ cùng nghĩa ở mức " + range + (easyTight ? " (không thấp hơn " + floorName + ", vì bài đang sát ngưỡng \"không dễ quá\")" : "") + (freTight ? "; chọn từ 1–2 âm tiết" : (freHi ? "; chọn từ có số âm tiết bằng hoặc nhiều hơn từ cũ (Flesch đang ở mép trên)" : "")) + ". Giữ nguyên tên riêng và thuật ngữ chính.");
    data.push("TỪ CẦN HẠ (" + C.hard.src + "):\n{aboveList}");
  }
  if(!C.easy.ok){
    goals.push("Không dễ quá: tính cả từ ngoài danh sách là từ khó, mức ở ngưỡng " + EASY_TH + "% của bài đang là " + lvlName(C.easy.now) + " (" + C.easy.src + "), cần " + (E.fl===E.ti ? "đúng " + L : floorName + " hoặc " + L) + "." + easyGapText(E.vp, E.fl, E.ti) + " Từ dùng nhiều có thể nâng: {upCands6}.");
    if(freHi){
      acts.push("Thay một số từ ngắn, thông dụng (1 âm tiết) bằng từ cùng nghĩa ở mức " + range + " có 2–3 âm tiết: cách này vừa nâng mức từ vựng vừa kéo Flesch xuống. Cần {upN}.");
      data.push("TỪ THÔNG DỤNG CÓ THỂ NÂNG: {upCands}\nTỪ 1 ÂM TIẾT DÙNG NHIỀU: {monoWords}");
    } else if(freTight){
      acts.push("Thay từ dài mà dễ (3 âm tiết trở lên, mức thấp; danh sách bên dưới) bằng từ 1–2 âm tiết cùng nghĩa ở mức " + range + ". Cần {upN}." + "{shortExamples}");
      data.push("TỪ DÀI MÀ DỄ TRONG BÀI: {longEasyWords}");
    } else {
      acts.push("Thay một số từ thông dụng bằng từ cùng nghĩa ở mức " + range + ", có số âm tiết tương đương từ cũ. Cần {upN}." + "{shortExamples}");
      data.push("TỪ THÔNG DỤNG CÓ THỂ NÂNG: {upCands}");
    }
  }
  if(C.fre && C.fre.low){
    goals.push("Độ dễ đọc: Flesch Reading Ease " + C.fre.now.toFixed(1) + ", thấp hơn khoảng " + freWin() + " của mức " + L + " (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ). Cách đạt: {freLever}");
    acts.push("Tách câu dài hoặc nhiều mệnh đề thành câu ngắn hơn, nhất là: {longestSents}");
    if(!easyTight) acts.push("Thay từ nhiều âm tiết bằng từ ngắn hơn cùng nghĩa và CÙNG mức (không dễ hơn): {polyWords}");
  }
  if(C.fre && C.fre.high){
    goals.push("Độ dễ đọc: Flesch Reading Ease " + C.fre.now.toFixed(1) + ", cao hơn khoảng " + freWin() + " của mức " + L + ", tức dễ quá theo Flesch (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ). Cách đạt: {freLever}");
    acts.push("Gộp các câu rất ngắn liền nhau thành một câu (nối bằng and, but, so, because hoặc dấu phẩy), không tạo câu trên 25 từ" + (E.isR ? "" : "; lời đáp ngắn thì gắn vào câu sau bằng dấu phẩy (\"Right, so the deadline is Friday.\") thay vì để thành câu riêng") + ". Các câu ngắn trong bài: {shortestSents}");
    if(!hardTight) acts.push("Thay một số từ 1 âm tiết bằng từ cùng nghĩa, CÙNG mức " + L + ", có 2–3 âm tiết (không lên mức trên " + L + "). Từ 1 âm tiết dùng nhiều: {monoWords}");
    else acts.push("Từ vựng đang sát ngưỡng khó: KHÔNG thay từ để kéo Flesch xuống, chỉ gộp câu.");
    if(!E.isR) acts.push("{spkTrim}");
  }
  if(!C.spell.ok){ goals.push("Chính tả: có từ viết khác kiểu " + S.spelling + ": " + C.spell.list.join(", ") + "."); acts.push("Đổi sang chính tả " + S.spelling + " các từ: " + C.spell.list.join(", ") + "."); }
  // khẩu ngữ hoá là gợi ý của giảng viên, không bắt buộc: không đưa vào "cần sửa"; chỉ giữ chất văn nói
  var SPKE = spkEval();
  if(SPKE) forb.push("Giữ văn nói: không thêm câu bị động, mệnh đề quan hệ chen giữa chủ ngữ và động từ, từ nối kiểu văn viết; không bỏ câu hỏi, cách xưng I/we, chỗ lược từ, dạng rút gọn.");
  if(!C.keep.ok){ goals.push("Từ giữ lại bị mất: " + C.keep.list.join(", ") + "."); acts.push("Đưa lại các từ giữ lại đã mất vào đúng chỗ cũ (xem bản đồ điểm neo, ghi chú): " + C.keep.list.join(", ") + "."); }
  // ---- giữ đạt (dòng xanh) và điều cấm theo độ sát ngưỡng
  if(C.len.ok){ keeps.push("Độ dài " + C.len.now + " từ (cho phép " + C.len.lo + "–" + C.len.hi + ")."); forb.push("Tổng số từ sau khi sửa phải trong khoảng " + C.len.lo + "–" + C.len.hi + ": được thêm tối đa " + C.len.room.up + " từ, bớt tối đa " + C.len.room.down + " từ."); }
  else forb.push("Sau khi sửa, tổng số từ phải trong khoảng " + C.len.lo + "–" + C.len.hi + ".");
  if(C.paras && C.paras.ok){ keeps.push("Số đoạn " + C.paras.target + "."); forb.push("Giữ đúng " + C.paras.target + " đoạn và tiêu đề."); }
  if(C.long.ok){ keeps.push("Không có câu trên 25 từ."); forb.push("Không tạo câu nào trên 25 từ (khi gộp hoặc thêm câu)."); }
  if(C.hard.ok){ keeps.push("Không khó quá (độ phủ " + C.hard.now.toFixed(1) + "%; cần từ " + sp.cov + "%; xem GIỚI HẠN CÒN LẠI bên dưới)."); if(C.hard.near) forb.push("Không thêm từ trên mức " + L + " hoặc từ ngoài danh sách CEFR-J/Octanove: độ phủ đang sát ngưỡng " + sp.cov + "%."); else forb.push("Hạn chế thêm từ trên mức " + L + " hoặc ngoài danh sách."); }
  if(C.easy.ok){ keeps.push("Không dễ quá (mức " + lvlName(C.easy.now) + ")."); if(C.easy.near) forb.push("Không thay từ ở mức " + L + " bằng từ dễ hơn: từ vựng đang sát ngưỡng tụt mức."); }
  if(C.fre && C.fre.ok){ keeps.push("Flesch Reading Ease " + C.fre.now.toFixed(1) + " (khoảng " + freWin() + "; xem GIỚI HẠN CÒN LẠI bên dưới)."); if(C.fre.nearLow) forb.push("Không làm câu dài thêm và không thay từ ngắn bằng từ dài hơn: Flesch đang sát ngưỡng dưới " + C.fre.min + "."); if(C.fre.nearHigh) forb.push("Không tách câu, không thêm câu rất ngắn hoặc lời đáp ngắn đứng riêng, không thay từ dài bằng từ ngắn hơn: Flesch đang sát ngưỡng trên " + C.fre.max + "."); }
  if(C.fre) forb.push("Sau khi sửa, Flesch Reading Ease phải " + freWin() + ".");
  if(C.spell.ok) forb.push("Giữ chính tả " + S.spelling + ".");
  forb.push("Không thêm thông tin ngoài nguồn, không đổi sự kiện, con số, thứ tự ý.");
  var order = "Làm theo thứ tự: (1) cấu trúc: tiêu đề, số đoạn, độ dài; (2) câu: tách câu dài; (3) từ vựng; (4) chính tả. Sửa ít câu nhất có thể; câu nào không cần sửa thì giữ nguyên từng chữ.";
  var needSrc = !C.len.ok && C.len.now < C.len.lo;
  return {E:E, goals:goals, keeps:keeps, acts:acts, data:data, forb:forb, order:order, needSrc:needSrc};
}
P.wordfix = {title:"Câu lệnh sửa các từ AI dùng sai mức", inputs:["draft"], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây vừa được sửa. Trang soạn đề đã tra từng từ mới (so với bản đã duyệt) theo đúng hai danh sách mà bài sẽ được chấm: CEFR-J Wordlist 1.5 (A1–B2) và Octanove Vocabulary Profile 1.0 (C1–C2). Các từ sau không được tính như bạn nghĩ:\n{wordFixList}\n\nHãy thay đúng những từ này, ở mọi chỗ chúng xuất hiện, mỗi từ bằng một từ cùng nghĩa trong câu. {wordFixGoal} Nếu không tìm được từ phù hợp, trả lại cách viết ở bản trước (ghi trong ngoặc). Không đổi câu nào khác.\n\nCác từ mới sau đã được tính đúng mức {level}, GIỮ NGUYÊN: {wordFixKeep}\n\n{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code. Trong khối code: chỉ có toàn bài đã sửa, không viết gì thêm sau bài. Không cần liệt kê các thay đổi: trang soạn đề tự so từng chữ với bản trước.\n\n{refs}\n\nBÀI:\n{{draft}}"};
P.fixall = {title:"Câu lệnh sửa tất cả các dòng đỏ", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây chưa đạt một số yêu cầu. Hãy sửa để đạt TẤT CẢ các mục tiêu, và không làm hỏng bất kỳ yêu cầu nào đang đạt.\n\nMỤC TIÊU CẦN ĐẠT:\n{fixGoals}\n\nĐANG ĐẠT, PHẢI GIỮ:\n{fixKeeps}\n\nCÁCH SỬA ĐƯỢC DÙNG:\n{fixActs}\n\nKHÔNG ĐƯỢC LÀM:\n{fixForb}\n\n{fixOrder}\n\n{fixData}{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: toàn bài đã sửa trước; sau đó một dòng riêng \"=== THAY ĐỔI ===\", rồi liệt kê từng thay đổi theo dạng: câu cũ → câu mới, mỗi thay đổi một dòng.\n\n{refs}{fixSrc}\n\nBÀI:\n{{draft}}"};
/* ---- Tô màu từ theo mức CEFR + tra nhanh + đồng hồ mức (để người soạn sửa tay) ---- */
function lvTok(tok, initial){
  if(/^\d/.test(tok) || !/[A-Za-z]/.test(tok)) return {k:"num"};
  var mixed = /[a-z][A-Z]/.test(tok), allCaps = /^[A-Z]{2,}$/.test(tok.replace(/'.*$/, "")), cap = /^[A-Z]/.test(tok), low = tok.toLowerCase().replace(/[’‘]/g, "'");
  var isName = false;
  if(mixed) isName = true;
  else if(allCaps) isName = lexLemma(low) === null;
  else if(cap && tok !== "I"){
    if(!initial) isName = true;
    else { var base = splitContraction(low)[0].split("-")[0]; isName = lexLemma(base) === null && !DERIV.test(base); }
  }
  if(isName) return {k:"name"};
  var lv = -1, off = false, lem = [];
  splitContraction(low).forEach(function(w){ w.split("-").forEach(function(p){ if(!p || !/[a-z]/.test(p)) return; var l = lexLemma(p); if(l === null){ off = true; lem.push(p + " (không có trong danh sách)"); } else { lv = Math.max(lv, LEXM[l]); lem.push(l === p ? l + " " + LVL[LEXM[l]] : p + " → " + l + " " + LVL[LEXM[l]]); } }); });
  return off ? {k:"off", lem:lem} : {k:"lv", lv:lv, lem:lem};
}
var LV_KEYS = ["A1","A2","B1","B2","C1","C2","off","name"], LV_NAMES = {off:"không có trong danh sách", name:"tên riêng (không tính)"};
function lvShowDefault(){ var ti = LVL.indexOf(S.level), o = {}; LV_KEYS.forEach(function(k, i){ o[k] = (i < 6 && i >= ti) || k === "off"; }); return o; }
function lvShow(){ try{ var x = JSON.parse(localStorage.getItem("vstep.lvShow") || "null"); if(x && typeof x === "object") return x; }catch(e){} return lvShowDefault(); }
function lvSetShow(o){ try{ if(o) localStorage.setItem("vstep.lvShow", JSON.stringify(o)); else localStorage.removeItem("vstep.lvShow"); }catch(e){} }
function lvKey(r){ return r.k === "off" ? "off" : (r.k === "name" ? "name" : (r.k === "lv" ? LVL[r.lv] : "")); }
function lvViewHTML(text, ti, show){
  show = show || lvShow();
  var re = /[A-Za-z0-9]+(?:['’][A-Za-z]+)*(?:-[A-Za-z0-9]+(?:['’][A-Za-z]+)*)*['’]?/g, m, last = 0, out = "", lineStart = true;
  while((m = re.exec(text))){
    var gap = text.slice(last, m.index), t = m[0];
    var initial = last === 0 || /[.!?]["'”’)\]]*\s+$/.test(gap) || /\n\s*$/.test(gap) || /^\s*$/.test(text.slice(0, m.index));
    if(/\n/.test(gap)) lineStart = true;
    var isLabel = lineStart && text.charAt(m.index + t.length) === ":" && /^\s*$/.test(gap.split("\n").pop());
    lineStart = false;
    out += esc(gap);
    var k = isLabel ? "name" : lvKey(lvTok(t, initial));
    out += k && show[k] ? '<span class="lvc-' + k + '">' + esc(t) + '</span>' : esc(t);
    last = m.index + t.length;
  }
  return out + esc(text.slice(last)) + "\n ";
}
function lvTogHTML(){
  var ti = LVL.indexOf(S.level), sh = lvShow();
  return '<span class="muted">Tô:</span>' + LV_KEYS.map(function(k, i){ var lab = i < 6 ? k + (i === ti ? " (mức bài)" : "") : LV_NAMES[k]; return '<button type="button" class="lvc-' + k + (sh[k] ? " on" : "") + '" data-lvk="' + k + '" aria-pressed="' + (sh[k] ? "true" : "false") + '">' + esc(lab) + '</button>'; }).join("")
    + '<span class="sep"></span><button type="button" data-lvp="def">Theo mức bài</button><button type="button" data-lvp="all">Tất cả</button><button type="button" data-lvp="none">Tắt hết</button>';
}
function lvLookupHTML(q, ti){
  var L = S.level, words = String(q || "").split(/[,;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean).slice(0, 30);
  if(!words.length) return "";
  return words.map(function(w){
    var r = lvTok(w.replace(/^[A-Z]/, function(c){ return c.toLowerCase(); }), false), syl = sylCount(w), cls = "mid", note;
    if(r.k === "off"){ cls = "bad"; note = "không có trong danh sách: bị trừ độ phủ"; }
    else if(r.k !== "lv"){ note = "không tra được"; }
    else if(r.lv > ti){ cls = "bad"; note = LVL[r.lv] + ", trên mức " + L + ": bị trừ độ phủ"; }
    else if(r.lv === ti){ cls = "ok"; note = L + ", đúng mức: giúp nâng mức"; }
    else note = LVL[r.lv] + ", dưới mức " + L + ": không bị trừ, nhưng không giúp nâng mức";
    return '<span class="lv-chip ' + cls + '"><b>' + esc(w) + '</b> · ' + esc(note) + ' · ' + syl + ' âm tiết' + (r.lem && r.lem.length && r.lem.join("").indexOf("→") >= 0 ? ' <span class="muted">(' + esc(r.lem.join("; ")) + ')</span>' : '') + '</span>';
  }).join("");
}
function lvMeterHTML(ti){
  var vp = currentVocab(), fr = currentFre(), sp = SPEC[S.spec], L = S.level, v = V(); if(!vp || !vp.N) return "";
  var Nin = vp.N, upto = easyUpto(vp, ti);
  var atN = vp.counts[ti], fl = LVL.indexOf(v.floorLevel), lines = [];
  if(fl === ti && ti > 0){
    var share = Nin ? 100 * upto / Nin : 0, need = Math.floor(Nin * (100 - EASY_TH) / 100) + 1, more = Math.max(0, need - upto);
    lines.push("<b>Mức từ vựng (cần đúng " + L + "):</b> bài có " + upto + " lượt từ mức " + L + " trở lên hoặc ngoài danh sách (" + share.toFixed(1) + "% của " + Nin + " lượt, không tính tên riêng). Mức ở ngưỡng " + EASY_TH + "% lên " + L + " khi phần này trên " + (100 - EASY_TH) + "%, tức là ít nhất " + need + " lượt" + (more ? ": <b class=\"no\">cần thêm khoảng " + more + " lượt từ " + L + "</b>." : ": <b class=\"ok\">đã đủ</b>."));
  }
  var cov = vp.cum[ti], K = Math.floor(vp.N * (cov - sp.cov) / 100 + 1e-6);
  lines.push("<b>Độ phủ ở mức " + L + ":</b> " + cov.toFixed(1) + "% (cần từ " + sp.cov + "%): " + (K >= 0 ? "còn chỗ cho khoảng " + K + " lượt từ trên mức hoặc không có trong danh sách" : "<b class=\"no\">đang thừa khoảng " + (-K) + " lượt từ trên mức hoặc không có trong danh sách</b>") + ".");
  if(fr && fr.ok){
    var dd = 84.6 / fr.W, mn = FRE_MIN[L], mx = FRE_MAX[L];
    lines.push("<b>Flesch:</b> " + fr.fre.toFixed(1) + " (cần " + freWin() + "); mỗi âm tiết thêm vào làm giảm khoảng " + dd.toFixed(2) + " điểm" + (freIn(fr.fre) ? ": còn thêm được khoảng " + Math.max(0, Math.floor((fr.fre - mn) / dd)) + " âm tiết" + (mx < 200 ? ", bớt được khoảng " + Math.max(0, Math.floor((mx - 0.05 - fr.fre) / dd)) + " âm tiết" : "") : "") + ".");
  }
  lines.push("Thay một từ thường bằng từ " + L + " cùng số âm tiết là cách ít ảnh hưởng nhất: vừa nâng mức, không làm Flesch tụt. Tránh từ " + (ti < 5 ? LVL[ti + 1] + ", " : "") + "từ phái sinh lạ (-ly, -ness, -tion…) vì dễ không có trong danh sách.");
  return lines.map(function(x){ return "<div>" + x + "</div>"; }).join("");
}
function lvRender(){
  var boxes = document.querySelectorAll("[data-lvbox]"); if(!boxes.length) return;
  var txt = S.slots.draft || "", ti = LVL.indexOf(S.level);
  boxes.forEach(function(b){
    var back = b.querySelector(".lvback"), ta = b.querySelector(".lvta"), meter = b.querySelector(".lv-meter"), tog = b.querySelector(".lv-tog"), res = b.querySelector(".lv-res"), q = b.querySelector(".lv-q");
    tog.innerHTML = lvTogHTML();
    meter.innerHTML = txt.trim() ? lvMeterHTML(ti) : "";
    if(ta !== document.activeElement && ta.value !== txt) ta.value = txt;
    if(b.tagName !== "DETAILS" || b.open){ back.innerHTML = lvViewHTML(ta.value, ti); back.scrollTop = ta.scrollTop; }
    if(q && q.value) res.innerHTML = lvLookupHTML(q.value, ti);
  });
}
function lvWordAt(t, pos){ var L = pos, R = pos; while(L > 0 && /[A-Za-z0-9'’-]/.test(t.charAt(L-1))) L--; while(R < t.length && /[A-Za-z0-9'’-]/.test(t.charAt(R))) R++; return t.slice(L, R).replace(/^['’-]+|['’-]+$/g, ""); }
document.addEventListener("click", function(e){
  var g = e.target.closest && e.target.closest("[data-goto-editor]"); if(!g) return;
  var scr = g.closest(".screen"), box = scr ? scr.querySelector("[data-lvbox]") : null; if(!box) return;
  box.scrollIntoView({behavior:"smooth", block:"start"}); var ta = box.querySelector(".lvta"); if(ta) setTimeout(function(){ ta.focus(); }, 400);
});
function bindLv(){
  document.querySelectorAll("[data-lvbox]").forEach(function(b){
    var q = b.querySelector(".lv-q"), res = b.querySelector(".lv-res"), ta = b.querySelector(".lvta"), back = b.querySelector(".lvback");
    b.addEventListener("toggle", function(){ if(b.open) lvRender(); });
    q.addEventListener("input", function(){ res.innerHTML = lvLookupHTML(q.value, LVL.indexOf(S.level)); });
    ta.addEventListener("input", function(){ back.innerHTML = lvViewHTML(ta.value, LVL.indexOf(S.level)); back.scrollTop = ta.scrollTop; setSlot("draft", ta.value, ta); });
    ta.addEventListener("scroll", function(){ back.scrollTop = ta.scrollTop; });
    // dán kết quả AI: trông như cả bài (khối code, dòng phân cách, hoặc dài từ nửa bài) thì thay cả bài, có Hoàn tác
    ta.addEventListener("paste", function(e){
      var t = (e.clipboardData || window.clipboardData).getData("text") || "", cur = S.slots.draft || "";
      var full = /```/.test(t) || SPLIT_RE.test("\n" + t) || (cur.trim() && wc(t) >= 0.5 * wc(cur)) || !cur.trim();
      if(!full) return;
      e.preventDefault();
      var c = cleanPaste(t), msgs = [];
      if(CHATTY_RE.test(c + "\n")){ c = c.replace(CHATTY_RE, ""); msgs.push("Đã bỏ câu dẫn của AI ở đầu."); }
      var m = ("\n" + c).match(SPLIT_RE), body = c, after = "";
      if(m){ var idx = Math.max(0, m.index - 1); body = c.slice(0, idx).replace(/\s+$/, ""); after = c.slice(idx + m[0].length - 1).trim(); }
      var sp = b.getAttribute("data-split");
      if(after && sp && sp !== "discard"){ setSlot(sp, after); msgs.push("Phần AI liệt kê thay đổi đã tách riêng."); }
      else if(after) msgs.push("Đã bỏ phần ghi chú cuối bài.");
      var prev = cur;
      if(prev.trim()){ S.slots.prePaste = prev; S.diffBase = "paste"; }
      setSlot("draft", body);
      ta.value = S.slots.draft || ""; back.innerHTML = lvViewHTML(ta.value, LVL.indexOf(S.level));
      var msg = b.querySelector(".lv-msg");
      if(msg){
        msg.innerHTML = (prev.trim() ? '<b>Đã thay cả bài bằng kết quả vừa dán: ' + wc(prev) + ' → ' + wc(S.slots.draft || "") + ' từ.</b> ' : '<b>Đã dán bài (' + wc(S.slots.draft || "") + ' từ).</b> ') + esc(msgs.join(" ")) + (prev.trim() ? ' <button type="button" class="btn quiet sm" data-lvundo>Hoàn tác</button>' : '');
        var ub = msg.querySelector("[data-lvundo]");
        if(ub) ub.addEventListener("click", function(){ setSlot("draft", prev); ta.value = prev; back.innerHTML = lvViewHTML(prev, LVL.indexOf(S.level)); msg.textContent = "Đã quay lại bản trước khi dán (" + wc(prev) + " từ)."; });
      }
    });
    ta.addEventListener("click", function(){ var w = lvWordAt(ta.value, ta.selectionStart); if(w && /[A-Za-z]/.test(w) && ta.selectionStart === ta.selectionEnd){ q.value = w; res.innerHTML = lvLookupHTML(w, LVL.indexOf(S.level)); } });
    ta.addEventListener("blur", function(){ if(ta.value !== (S.slots.draft || "")) lvRender(); });
    b.querySelector(".lv-tog").addEventListener("click", function(e){
      var t = e.target.closest("button"); if(!t) return;
      var k = t.getAttribute("data-lvk"), pz = t.getAttribute("data-lvp"), sh = lvShow();
      if(k){ sh[k] = !sh[k]; lvSetShow(sh); }
      else if(pz === "def") lvSetShow(null);
      else if(pz === "all"){ LV_KEYS.forEach(function(x){ sh[x] = true; }); lvSetShow(sh); }
      else if(pz === "none"){ LV_KEYS.forEach(function(x){ sh[x] = false; }); lvSetShow(sh); }
      lvRender();
    });
  });
}
/* ---- Giới hạn còn lại: AI không đo được độ phủ, Flesch, nên trang đổi phần còn dư thành việc làm được ---- */
function slackRulesText(){
  var d = S.slots.draft || ""; if(!d.trim()) return "";
  var sp = SPEC[S.spec], L = S.level, ti = LVL.indexOf(L), vp = currentVocab(), fr = currentFre(), out = [];
  if(vp && vp.N){
    var cov = vp.cum[ti], K = Math.floor(vp.N * (cov - sp.cov) / 100 + 1e-6);
    if(cov >= sp.cov) out.push("- Độ phủ: trang đếm theo CEFR-J Wordlist 1.5 (A1–B2) và Octanove Vocabulary Profile 1.0 (C1–C2), không tính tên riêng và con số; mỗi lượt từ trên mức " + L + " hoặc không có trong hai danh sách đều bị trừ. Bài đang " + cov.toFixed(1) + "% trên " + vp.N + " lượt từ (cần từ " + sp.cov + "%), tức là cả bài " + (K > 0 ? "chỉ còn chỗ cho thêm khoảng " + K + " lượt từ như vậy" : "không còn chỗ cho thêm lượt từ nào như vậy") + ".");
    out.push("- Vì bạn không tra được hai danh sách: từ mới chỉ dùng từ thông dụng mà bạn chắc chắn ở mức " + L + " trở xuống; không dùng từ hiếm, từ chuyên ngành, từ trên mức " + L + "; tránh từ phái sinh (đuôi -ly, -ness, -tion, -ity, -ment, -ful, -less; tiền tố un-, re-, dis-, in-, over-) vì nhiều dạng không có trong danh sách và bị trừ. Không chắc thì giữ từ cũ. Sau khi bạn trả lời, trang sẽ tra lại từng từ mới.");
  }
  if(fr && fr.ok && freIn(fr.fre)){
    var mn = FRE_MIN[L], mx = FRE_MAX[L], dd = 84.6 / fr.W, down = Math.max(0, Math.floor((fr.fre - mn) / dd)), up = mx < 200 ? Math.max(0, Math.floor((mx - 0.05 - fr.fre) / dd)) : null;
    out.push("- Flesch Reading Ease: bài đang " + fr.fre.toFixed(1) + " (cần " + freWin() + "). Bài có " + fr.W + " từ, nên mỗi âm tiết thêm vào làm Flesch giảm khoảng " + dd.toFixed(2) + " điểm: cả bài chỉ được thêm tối đa khoảng " + down + " âm tiết (ví dụ thay " + Math.max(1, Math.floor(down / 2)) + " từ, mỗi từ mới dài hơn từ cũ 2 âm tiết)" + (up !== null ? "; nếu bớt âm tiết thì tối đa khoảng " + up + " âm tiết" : "") + ". Câu dài thêm cũng làm Flesch giảm: không gộp câu, không thêm từ vào câu khi không cần.");
  }
  return out.length ? "GIỚI HẠN CÒN LẠI (trang soạn đề tính sẵn theo đúng cách đo, vì bạn không đo được):\n" + out.join("\n") : "";
}
/* ---- Tra lại từ mới: so bản đang làm với bản đã duyệt, theo đúng danh sách và cách tra của trang ---- */
var WC_CACHE = {a:null, vp:null};
function wcNorm(t){ return String(t || "").toLowerCase().replace(/[’‘]/g, "'").replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""); }
function wcHunks(a, b){
  var A = dtok(a), B = dtok(b), pre = 0, suf = 0;
  while(pre < A.length && pre < B.length && A[pre] === B[pre]) pre++;
  while(suf < A.length - pre && suf < B.length - pre && A[A.length-1-suf] === B[B.length-1-suf]) suf++;
  var a2 = A.slice(pre, A.length - suf), b2 = B.slice(pre, B.length - suf), n = a2.length, m = b2.length, ops = [];
  if(n * m > 4000000) return [{del:a2, add:b2}];
  var W = m + 1, Lc = new Uint16Array((n + 1) * (m + 1));
  for(var i = n - 1; i >= 0; i--) for(var j = m - 1; j >= 0; j--) Lc[i*W+j] = a2[i] === b2[j] ? Lc[(i+1)*W+j+1] + 1 : Math.max(Lc[(i+1)*W+j], Lc[i*W+j+1]);
  var x = 0, y = 0;
  while(x < n && y < m){ if(a2[x] === b2[y]){ ops.push(["=", a2[x]]); x++; y++; } else if(Lc[(x+1)*W+y] >= Lc[x*W+y+1]){ ops.push(["-", a2[x]]); x++; } else { ops.push(["+", b2[y]]); y++; } }
  while(x < n) ops.push(["-", a2[x++]]); while(y < m) ops.push(["+", b2[y++]]);
  var hunks = [], cur = null;
  ops.forEach(function(o){ if(o[0] === "="){ cur = null; return; } if(!cur){ cur = {del:[], add:[]}; hunks.push(cur); } (o[0] === "-" ? cur.del : cur.add).push(o[1]); });
  return hunks;
}
function wcPartsOf(tok){ var w = wcNorm(tok), out = []; splitContraction(w).forEach(function(x){ x.split("-").forEach(function(p){ if(p && /[a-z]/.test(p)) out.push(p); }); }); return out; }
var WC_RES = {k:null, r:null};
function wordCheck(){
  var a = S.slots.approved || "", b = S.slots.draft || "", key = S.spec + "|" + S.level + "|" + a.length + "|" + b.length + "|" + qHashS(a) + "|" + qHashS(b);
  if(WC_RES.k === key) return WC_RES.r;
  WC_RES.k = key; WC_RES.r = wordCheckRun(a, b); return WC_RES.r;
}
function qHashS(t){ var h = 0; for(var i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; } return h; }
function wordCheckRun(a, b){
  if(!a.trim() || !b.trim() || a.trim() === b.trim()) return null;
  if(WC_CACHE.a !== a){ WC_CACHE.a = a; WC_CACHE.vp = vocabProfile(a); }
  var vA = WC_CACHE.vp, vB = currentVocab(); if(!vA || !vB) return null;
  var ti = LVL.indexOf(S.level), mA = Object.create(null), oA = Object.create(null), mB = Object.create(null);
  vA.lemmas.forEach(function(l){ mA[l.w] = l.n; }); vA.offList.forEach(function(o){ oA[o.w] = o.n; }); vB.lemmas.forEach(function(l){ mB[l.w] = l.n; });
  var above = [], off = [], at = [], near = [];
  vB.lemmas.forEach(function(l){ var dn = l.n - (mA[l.w] || 0); if(dn <= 0) return; var it = {w:l.w, lv:l.lv, n:dn, syl:sylCount(l.w)}; if(l.lv > ti) above.push(it); else if(l.lv === ti) at.push(it); else if(l.lv === ti - 1) near.push(it); });
  vB.offList.forEach(function(o){ var dn = o.n - (oA[o.w] || 0); if(dn > 0) off.push({w:o.w, n:dn, syl:sylCount(o.w), off:true}); });
  var lostAt = vA.lemmas.filter(function(l){ return l.lv === ti && l.n > (mB[l.w] || 0); }).map(function(l){ return l.w; });
  var hunks = null, findOld = function(it){
    if(!hunks) hunks = wcHunks(a, b);
    for(var i = 0; i < hunks.length; i++){
      var h = hunks[i], hit = h.add.some(function(t){ return wcPartsOf(t).some(function(p){ return it.off ? p === it.w : lexLemma(p) === it.w; }); });
      if(hit){ var d = h.del.filter(function(t){ return t !== "¶"; }); return d.length && d.length <= 8 ? d.join(" ").replace(/[.,;:!?]+$/, "") : (d.length ? d.slice(0, 8).join(" ") + "…" : ""); }
    }
    return "";
  };
  [above, off, at, near].forEach(function(arr){ arr.forEach(function(it){ it.old = findOld(it); }); });
  return {above:above, off:off, at:at, near:near, lostAt:lostAt};
}
function wcRaising(v){ var vp = currentVocab(); if(!vp || !v) return false; var fl = LVL.indexOf(v.floorLevel); return fl >= 0 && easyLvl(vp) < fl; }
function wcItemText(it, tag){ return it.w + " (" + tag + (it.n > 1 ? ", " + it.n + " lần" : "") + ", " + it.syl + " âm tiết" + (it.old ? "; bản trước: \"" + it.old + "\"" : "") + ")"; }
function wordFixExtend(v){
  var W = null; try{ W = wordCheck(); }catch(e){ W = null; }
  var raise = false; try{ raise = wcRaising(v); }catch(e){}
  var lines = [];
  if(W){
    W.above.forEach(function(it){ lines.push("- " + wcItemText(it, LVL[it.lv] + ", trên mức " + S.level) + ": bị trừ độ phủ. Thay bằng từ cùng nghĩa ở mức " + S.level + " trở xuống."); });
    W.off.forEach(function(it){ lines.push("- " + wcItemText(it, "không có trong danh sách") + ": bị trừ độ phủ. Thay bằng từ cùng nghĩa có trong danh sách (thường là dạng gốc hoặc từ thông dụng hơn)."); });
    if(raise) W.near.forEach(function(it){ lines.push("- " + wcItemText(it, LVL[it.lv]) + ": chỉ ở mức " + LVL[it.lv] + " nên chưa giúp bài lên " + S.level + ". Nếu có từ " + S.level + " cùng nghĩa, dùng tự nhiên trong câu thì thay; không thì giữ."); });
  }
  v.wordFixList = lines.join("\n");
  v.wordFixKeep = W && W.at.length ? W.at.map(function(it){ return it.w; }).join(", ") : "(không có)";
  v.wordFixGoal = raise ? "Bài đang cần nâng mức từ vựng lên " + S.level + ", nên khi thay, ưu tiên từ ở đúng mức " + S.level + "." : "Bài không cần nâng mức thêm, nên khi thay, dùng từ ở mức " + S.level + " trở xuống.";
  v.slackRules = slackRulesText();
}
function fixExtend(v){
  var plan = buildFixPlan();
  if(!plan){ v.fixGoals = v.fixKeeps = v.fixActs = v.fixForb = v.fixOrder = v.fixData = v.fixSrc = ""; v.keepPassing = ""; return; }
  var sub = function(s){ return s.replace(/\{(\w+)\}/g, function(m,k){ return (k in v) ? v[k] : m; }); };
  var num = function(arr){ return arr.length ? arr.map(function(x,i){ return (i+1) + ". " + sub(x); }).join("\n") : "(không có)"; };
  v.fixGoals = num(plan.goals); v.fixKeeps = num(plan.keeps); v.fixActs = num(plan.acts); v.fixForb = num(plan.forb); v.fixOrder = plan.order;
  v.fixData = plan.data.length ? plan.data.map(sub).join("\n\n") + "\n\n" : "";
  var o = plan.needSrc ? slotVal("orig") : "";
  var srcNm = SPEC[S.spec].skill === "L" ? "VĂN BẢN NGUỒN (đoạn dữ kiện đã duyệt)" : "VĂN BẢN NGUỒN";
  v.fixSrc = plan.needSrc ? "\n\n" + srcNm + " (chỉ để lấy chi tiết, không chép câu):\n" + (o || "[không có kèm theo: không thêm chi tiết mới; chỉ diễn đạt lại và triển khai các ý đã có trong bài]") : "";
  v.keepPassing = plan.keeps.length ? "CÁC YÊU CẦU ĐANG ĐẠT, KHÔNG ĐƯỢC LÀM HỎNG:\n" + plan.keeps.map(function(x,i){ return (i+1) + ". " + x; }).join("\n") + "\n" + plan.forb.map(function(x){ return "- " + x; }).join("\n") : "";
}
function renderFixAll(){
  var panels = document.querySelectorAll(".fixall-panel"); if(!panels.length) return;
  var plan = buildFixPlan(), v = plan ? V() : {};
  var sub = function(s){ return s.replace(/\{(\w+)\}/g, function(m,k){ return (k in v) ? v[k] : ""; }); };
  var show = plan && plan.goals.length;
  panels.forEach(function(p){
    p.classList.toggle("hidden", !show && !(S.fixOpen && S.fixOpen.all && (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== (S.slots.draft||"").trim()));
    var g = p.querySelector(".fixall-goals"), k = p.querySelector(".fixall-keeps");
    if(!plan){ g.innerHTML = ""; k.innerHTML = ""; return; }
    g.innerHTML = plan.goals.length ? plan.goals.map(function(x){ return '<li>' + esc(sub(x)) + '</li>'; }).join("") : '<li class="ok">Không còn dòng đỏ.</li>';
    k.innerHTML = plan.keeps.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + plan.forb.filter(function(x){ return /sát ngưỡng/.test(x); }).map(function(x){ return '<li class="nearf">' + esc(x) + '</li>'; }).join("");
  });
  if(show){ S.fixOpen = S.fixOpen || {}; S.fixOpen.all = true; }
}

function extendVars(v){
  vocabExtend(v);
  freExtend(v);
  fixExtend(v);
  try{ wordFixExtend(v); }catch(e){ v.wordFixList = ""; v.wordFixKeep = "(không có)"; v.wordFixGoal = ""; v.slackRules = ""; }
  qExtend(v);
  if(typeof wfExtend==="function") wfExtend(v);
  v.sourceNeeds = SOURCE_NEEDS[S.spec] || SOURCE_NEEDS[S.spec.slice(0,2)] || "";
  var frameRows = SPEC[S.spec].skill==="R" && typeof mapLines === "function" ? mapLines() : [];
  v.anchorReq = frameRows.length ? "KHUNG " + frameRows.length + " CÂU HỎI theo bảng phân bố của " + SPEC[S.spec].label + " (VSTEP Reading Specifications). Khi biên tập, giữ cho bài có một chỗ hỏi tự nhiên cho từng ô dưới đây, rồi ghi mỗi câu một dòng theo khuôn: CÂU số | bậc mức | MÃ | đoạn số | trích ngắn tối đa 12 từ, chép nguyên văn từ bài.\n   Quy tắc: mỗi ô đúng một câu, mã chọn trong các mã của ô; đánh số câu theo vị trí chỗ hỏi trong bài (CÂU 1 gần đầu bài nhất), câu hỏi về cả bài (MI cả bài, TO) đánh số cuối và ghi đoạn là \"cả bài\" (quy ước nhóm CH-B3); mỗi đoạn có ít nhất một câu; mỗi chỗ hỏi chỉ dùng cho một câu, câu văn dành cho câu chèn câu (IS) không làm chỗ hỏi của câu khác (CH-B6). Ô nào bài không có chỗ tự nhiên thì ghi: CÂU – | bậc mức | không có. Không thêm thông tin ngoài nguồn hay câu gượng ép chỉ để lấp ô.\n   CÁC Ô:\n" + frameRows.map(function(l, i){ return "   Ô " + (i+1) + " | " + l.lv + " " + l.m + " | chọn một mã: " + l.codes.join(", "); }).join("\n")
    : SPEC[S.spec].skill==="R" ? "BẢN ĐỒ ĐIỂM NEO: mỗi dòng theo khuôn MÃ | đoạn số | trích ngắn tối đa 12 từ, chép nguyên văn từ bài, cho các mã: " + (SPEC[S.spec].skills||"") + ". Mã nào bài không có chỗ tự nhiên để hỏi, ghi: MÃ | không có. Không sửa bài để lấp mã còn thiếu." : "";
  var pdfR = S.srcMode==="pdf" && S.srcLang!=="vi";
  var origPdf = pdfR && origId()==="src";
  v.pageNote = pdfR ? ", kèm số trang trong file PDF" : "";
  v.pageCol = origPdf ? " (ghi số trang)" : "";
  v.pdfExtra = origPdf ? "\n- Vì bản gốc là file PDF, liệt kê thêm các câu trong bản biên tập lặp lại nguyên văn từ 8 từ liên tiếp trở lên của nguồn." : "";
  var notes = (S.slots.notes||"").trim();
  v.omitBlock = notes ? "GHI CHÚ BIÊN TẬP (các phần ghi là đã lược thì không tính là lỗi):\n" + notes + "\n\n" : "";
}
SLOTS.above.optional = true; SLOTS.above.empty = "";
var STOPW = {};
"the a an be have do and or but of to in on at for with by from as that this it they he she we you i not no can will would could should may might must there which who what when where how than so if also more most some any all one their its his her our your my them us him me these those such other about into over after before because while very just only then out up get".split(" ").forEach(function(w){ STOPW[w] = 1; });
function currentVocab(){ var d = S.slots.draft||""; if(!d.trim()) return null; if(!lastVocab) lastVocab = vocabProfile(d); return lastVocab; }
function vocabExtend(v){
  var sp = SPEC[S.spec], vp = currentVocab(), ti = LVL.indexOf(S.level), keep = {};
  keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var base = sp.min || sp.approx || 400;
  v.maxAbove = "khoảng " + Math.max(3, Math.round(base * (100 - sp.cov) / 100 * 0.8)) + " lượt từ";
  var prof = (S.slots.above||"").trim();
  if(prof){ v.aboveList = prof; v.aboveSrc = "bảng từ Text Profiler"; }
  else if(vp){
    var ab = vp.lemmas.filter(function(l){ return l.lv > ti && !keep[l.w]; }).map(function(l){ return l.w + " (" + LVL[l.lv] + ") ×" + l.n; });
    var of = vp.offList.filter(function(o){ return !keep[o.w]; }).map(function(o){ return o.w + " ×" + o.n; });
    v.aboveList = "TRÊN MỨC " + S.level + ": " + (ab.length ? ab.join(", ") : "không có") + "\nNGOÀI DANH SÁCH CEFR-J/Octanove: " + (of.length ? of.join(", ") : "không có");
    v.aboveSrc = "trang tự tra theo CEFR-J/Octanove, không tính tên riêng";
  } else { v.aboveList = "[chưa có bài]"; v.aboveSrc = "chưa có"; }
  var pfL = S.slots.pfLvl95, pfB = parseFloat(String(S.slots.pfCovBelow||"").replace(",", "."));
  var usePf = pfL && pfL!=="chưa đo";
  v.measureSrc = usePf ? "EC Text Profiler" : "trang tự tra theo CEFR-J/Octanove, ước lượng";
  v.lvl95Txt = usePf ? pfL : (vp ? lvlName(vp.lvl95In) : "chưa đo");
  v.lvl98Txt = vp ? lvlName(easyLvl(vp)) : "chưa đo";
  var bi = LVL.indexOf(v.belowLevel), cb = vp && bi>=0 ? vp.cum[bi] : NaN;
  v.covBelowTxt = isNaN(cb) ? "chưa đo" : cb.toFixed(1) + "%";
  if(!isNaN(cb) && cb >= EASY_TH && vp){ var tok = vp.N; v.upN = "khoảng " + (Math.ceil((cb - (EASY_TH - 0.1)) / 100 * tok) + 1) + " lượt từ (ước lượng để độ phủ ở mức " + v.belowLevel + " xuống dưới " + EASY_TH + "%, đã cộng 1 từ dự phòng)"; }
  if(vp){
    var lowMax = bi >= 0 ? bi : 0, topic = {};
    var an = lastAnalysis || analyze(S.slots.draft||"");
    an.titles.map(function(t){ return t.text; }).concat([S.slots.topic || ""]).forEach(function(tx){ (tx.toLowerCase().match(/[a-z]+/g)||[]).forEach(function(w){ var l = lexLemma(w); topic[l||w] = 1; }); });
    /* từ nội dung lặp nhiều nhất của bài thường là từ chủ đề: không gợi ý nâng */
    vp.lemmas.filter(function(l){ return !STOPW[l.w] && l.w.length > 3; }).sort(function(x,y){ return y.n - x.n; }).slice(0,3).forEach(function(l){ if(l.n >= 4) topic[l.w] = 1; });
    var c = vp.lemmas.filter(function(l){ return l.lv <= lowMax && !STOPW[l.w] && !keep[l.w] && !topic[l.w] && l.w.length > 3; }).sort(function(x,y){ return y.n - x.n; }).slice(0,15).map(function(l){ return l.w + " (" + LVL[l.lv] + ") ×" + l.n; });
    v.upCands = c.length ? c.join(", ") : "không có gợi ý";
    v.upCands6 = c.length ? c.slice(0, 6).join(", ") : "không có gợi ý";
  } else { v.upCands = "chưa có bài"; v.upCands6 = "chưa có bài"; }
}
SLOTS.b7out = {label:"Câu trả lời của AI", type:"area", optional:true, empty:""};
/* ---------- Bước 7: đọc và áp dụng các chỗ sửa ---------- */
var b7Fixes = [];
function cleanVal(s){ return s.replace(/\*\*/g,"").replace(/^[\s"“”'`>•\-]+|[\s"“”'`>•\-]+$/g,"").replace(/\s+/g," ").trim(); }
function parseB7(raw){
  var txt = cleanPaste(raw).replace(/\*\*|__/g, "");
  var mk = txt.search(/C[ÁA]C\s+CH[ỖO]\s+S[ỬU]A/i);
  if(mk < 0) return {found:false, fixes:[]};
  var body = txt.slice(mk).replace(/^[^\n]*(\n|$)/, "");
  var LAB = /(^|[\s|>*\-•])(C[ŨU]|OLD|M[ỚO]I|NEW|L[ÝY]\s*DO|REASON)\s*:\s*/gi;
  var hasFields = /(^|[\s|>*\-•])(C[ŨU]|OLD)\s*:/i.test(body);
  if(!hasFields) return {found:true, none:/KH[ÔO]NG\s+C[ÓO]/i.test(body), fixes:[], bad:!/KH[ÔO]NG\s+C[ÓO]/i.test(body)};
  var HRE = /(^|\n|[\s|])[#>*\-•\s]*S[ỬU]A\s*(\d+)\s*(?:[|:–\-]\s*)?(PH[ẢA]I\s+S[ỬU]A|N[ÊE]N\s+XEM|T[ỰU]\s+NHI[ÊE]N)?/gi, hm, heads = [];
  while((hm = HRE.exec(body))){ heads.push({i:hm.index + hm[1].length, end:HRE.lastIndex, n:hm[2], lv:hm[3]||""}); }
  var blocks = [];
  if(heads.length){ heads.forEach(function(hd, k){ blocks.push({n:hd.n, lv:hd.lv, text:body.slice(hd.end, k+1<heads.length ? heads[k+1].i : body.length)}); }); }
  else { body.split(/(?=(?:^|\s)(?:C[ŨU]|OLD)\s*:)/i).forEach(function(t, k){ if(/(C[ŨU]|OLD)\s*:/i.test(t)) blocks.push({n:String(blocks.length+1), lv:"", text:t}); }); }
  var out = [], skipped = 0;
  blocks.forEach(function(b){
    var marks = [], m; LAB.lastIndex = 0;
    while((m = LAB.exec(b.text))){ marks.push({k:m[2].toUpperCase().replace(/\s+/g," "), s:m.index + m[1].length, e:LAB.lastIndex}); }
    var f = {};
    marks.forEach(function(mk2, j){
      var val = b.text.slice(mk2.e, j+1<marks.length ? marks[j+1].s : b.text.length);
      var key = /^(C[ŨU]|OLD)$/.test(mk2.k) ? "old" : (/^(M[ỚO]I|NEW)$/.test(mk2.k) ? "nw" : "why");
      if(!f[key]) f[key] = cleanVal(val);
    });
    var lvTxt = (b.lv + " " + b.text.split("\n")[0]).toUpperCase();
    var lvl = /T[ỰU]\s+NHI[ÊE]N/.test(lvTxt) ? "nat" : (/N[ÊE]N\s+XEM/.test(lvTxt) ? "see" : "must");
    if(!f.old || !f.nw){ skipped++; return; }
    out.push({n:b.n, lvl:lvl, old:f.old, nw:f.nw, why:f.why||"", on: lvl==="must"});
  });
  return {found:true, fixes:out, skipped:skipped};
}
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function findOld(draft, old){
  if(!old) return null;
  var i = draft.indexOf(old); if(i >= 0) return {i:i, len:old.length, n: draft.split(old).length - 1};
  var pat = escRe(old).replace(/\s+/g,"\\s+").replace(/['’‘]/g,"['’‘]").replace(/["“”]/g,"[\"“”]").replace(/[—–-]/g,"[—–-]");
  try{ var re = new RegExp(pat, "g"), m = re.exec(draft); if(m){ var cnt = (draft.match(new RegExp(pat,"g"))||[]).length; return {i:m.index, len:m[0].length, n:cnt}; } }catch(e){}
  return null;
}
function wordDiffHTML(a, b){
  var A = a.split(/\s+/), B = b.split(/\s+/), n = A.length, m = B.length, W = m+1, L = new Uint16Array((n+1)*(m+1));
  for(var i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--) L[i*W+j] = A[i]===B[j] ? L[(i+1)*W+j+1]+1 : Math.max(L[(i+1)*W+j], L[i*W+j+1]);
  var x=0, y=0, o="";
  while(x<n && y<m){ if(A[x]===B[y]){ o += esc(A[x])+" "; x++; y++; } else if(L[(x+1)*W+y]>=L[x*W+y+1]){ o += '<del class="dd">'+esc(A[x])+'</del> '; x++; } else { o += '<ins class="di">'+esc(B[y])+'</ins> '; y++; } }
  while(x<n) o += '<del class="dd">'+esc(A[x++])+'</del> '; while(y<m) o += '<ins class="di">'+esc(B[y++])+'</ins> ';
  return o;
}
function newWordFlags(old, nw){
  var ti = LVL.indexOf(S.level), had = {}, flags = [];
  (old.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]).forEach(function(w){ had[w] = 1; });
  var re = /[A-Za-z]+(?:'[A-Za-z]+)?/g, m, first = true;
  while((m = re.exec(nw))){
    var t = m[0], lw = t.toLowerCase(), initial = first; first = false;
    if(had[lw]) continue;
    if(/^[A-Z]/.test(t) && !initial) continue;
    var parts = splitContraction(lw);
    parts.forEach(function(p){ var lem = lexLemma(p); if(lem===null){ if(!(initial && /^[A-Z]/.test(t) && !DERIV.test(p))) flags.push(p + " (ngoài danh sách)"); } else if(LEXM[lem] > ti) flags.push(p + " (" + LVL[LEXM[lem]] + ")"); });
  }
  return flags;
}
function renderB7(){
  var box = document.getElementById("b7-fixes"), bar = document.getElementById("b7-applybar"); if(!box) return;
  var txt = S.slots.b7out || "";
  if(!txt.trim()){ box.innerHTML = ""; bar.classList.add("hidden"); b7Fixes = []; return; }
  var r = parseB7(txt), d = S.slots.draft || "";
  if(!r.found){ box.innerHTML = '<div class="note">Không thấy dòng <b>=== CÁC CHỖ SỬA ===</b> trong phần đã dán. Có thể AI chưa làm phần B, hoặc bạn chưa copy phần đó. Nhắn AI trong cùng cuộc trò chuyện rồi dán lại:' + remindHTML(REMIND_B7) + '</div>'; bindRemind(box); bar.classList.add("hidden"); return; }
  if(r.bad || (!r.none && !r.fixes.length)){ box.innerHTML = '<div class="note">Có dòng <b>=== CÁC CHỖ SỬA ===</b> nhưng trang không đọc được chỗ sửa nào (thiếu CŨ hoặc MỚI). Nhắn AI trong cùng cuộc trò chuyện rồi dán lại:' + remindHTML(REMIND_B7) + '</div>'; bindRemind(box); bar.classList.add("hidden"); b7Fixes = []; return; }
  if(r.none || !r.fixes.length){ box.innerHTML = '<div class="info"><span class="ok">✓</span> AI không đề xuất chỗ nào cần sửa. Vẫn nên đọc bảng ở phần A trong câu trả lời.</div>'; bar.classList.add("hidden"); b7Fixes = []; return; }
  b7Fixes = r.fixes;
  var maxD = 3;
  box.innerHTML = '<div style="display:grid;gap:10px">' + r.fixes.map(function(f, idx){
    var loc = findOld(d, f.old), dn = Math.abs(wc(f.nw) - wc(f.old)), flags = newWordFlags(f.old, f.nw), applied = !loc && d.indexOf(f.nw) >= 0;
    f.loc = loc; f.applied = applied; if(!loc) f.on = false;
    var st = applied ? '<span class="okf">Đã có trong bài (đã áp dụng)</span>' : (loc ? (loc.n > 1 ? '<span class="flag">Câu cũ xuất hiện ' + loc.n + ' lần; trang sẽ thay lần đầu.</span>' : '<span class="okf">Tìm thấy câu cũ trong bài.</span>') : '<span class="flag">Không tìm thấy câu cũ trong bài đang làm. AI chép sai câu, hoặc bài đã đổi. Nhắn AI chép lại đúng câu CŨ, hoặc sửa tay.</span>');
    var w = [];
    if(dn > maxD) w.push("Câu mới chênh " + dn + " từ (cho phép tối đa " + maxD + ").");
    if(flags.length) w.push("Từ mới vượt mức hoặc ngoài danh sách: " + esc(flags.join(", ")) + ".");
    return '<div class="fx ' + (f.lvl==="nat" ? "see nat" : f.lvl) + (applied ? ' done' : '') + '"><div class="fxh"><label><input type="checkbox" data-fx="' + idx + '"' + (f.on ? ' checked' : '') + (loc ? '' : ' disabled') + '> Áp dụng</label><span class="tag">' + (f.lvl==="must" ? "PHẢI SỬA" : (f.lvl==="nat" ? "TỰ NHIÊN" : "NÊN XEM")) + '</span><span class="muted small">Sửa ' + esc(f.n) + '</span></div>'
      + '<div class="row"><b>Đổi:</b> ' + wordDiffHTML(f.old, f.nw) + '</div>'
      + (f.why ? '<div class="row"><b>Vì:</b> ' + esc(f.why) + '</div>' : '')
      + '<div>' + st + '</div>' + (w.length ? '<div class="flag">' + w.join(" ") + '</div>' : '') + '</div>';
  }).join("") + '</div>';
  if(r.skipped) { box.insertAdjacentHTML("afterbegin", '<div class="note small">' + r.skipped + ' chỗ sửa bị thiếu CŨ hoặc MỚI nên trang bỏ qua. Nếu cần, nhắn AI:' + remindHTML(REMIND_B7) + '</div>'); bindRemind(box); }
  box.querySelectorAll("[data-fx]").forEach(function(c){ c.addEventListener("change", function(){ b7Fixes[+c.getAttribute("data-fx")].on = c.checked; }); });
  bar.classList.toggle("hidden", !r.fixes.some(function(f){ return f.loc; }));
}
function metricsOf(text){
  var a = analyze(text), vp = vocabProfile(text), sp = SPEC[S.spec], ti = LVL.indexOf(S.level), v = V();
  var hard = {}; vp.lemmas.forEach(function(l){ if(l.lv > ti) hard[l.w] = 1; }); vp.offList.forEach(function(o){ hard[o.w] = 1; });
  var fr = fleschOf(text);
  return {fre: fr.ok ? fr.fre : null, freOK: !fr.ok || freIn(fr.fre), words:a.total, longN:a.long.length, paras:a.body.length, cov:vp.cum[ti], lvlIn:easyLvl(vp), hard:hard,
    inRange: sp.min ? (a.total>=sp.min && a.total<=sp.max) : Math.abs(a.total-sp.approx)<=15,
    covOK: vp.cum[ti] >= sp.cov, floorOK: easyLvl(vp) >= LVL.indexOf(v.floorLevel), parasOK: sp.skill!=="R" || a.body.length===parseInt(v.paras,10)};
}
function applyB7(){
  var d = S.slots.draft || "", before = metricsOf(d), done = 0, miss = 0;
  b7Fixes.forEach(function(f){
    if(!f.on) return;
    var loc = findOld(d, f.old);
    if(!loc){ miss++; return; }
    d = d.slice(0, loc.i) + f.nw + d.slice(loc.i + loc.len); done++;
  });
  if(!done){ document.getElementById("b7-applymsg").textContent = miss ? "Không áp dụng được chỗ nào: không tìm thấy câu cũ." : "Chưa chọn chỗ nào để áp dụng."; return; }
  S.b7before = {m:before, at:Date.now()};
  setSlot("draft", d);
  document.getElementById("b7-applymsg").textContent = "Đã áp dụng " + done + " chỗ" + (miss ? "; " + miss + " chỗ không tìm thấy câu cũ" : "") + ". Xem kết quả kiểm lại ở mục 3.";
  renderB7(); renderRecheck();
}
function renderRecheck(){
  var card = document.getElementById("b7-recheck-card"); if(!card) return;
  var b = S.b7before, d = S.slots.draft || "";
  if(!b || !d.trim()){ card.classList.add("hidden"); return; }
  card.classList.remove("hidden");
  var m = metricsOf(d), o = b.m, sp = SPEC[S.spec], v = V(), rows = [];
  rows.push(srow(m.inRange ? "g" : "b", "<b>Độ dài:</b> " + o.words + " → " + m.words + " từ (cần " + esc(sp.words) + ")."));
  if(sp.skill==="R") rows.push(srow(m.parasOK ? "g" : "b", "<b>Số đoạn:</b> " + m.paras + "."));
  rows.push(srow(m.longN ? "b" : "g", "<b>Câu trên 25 từ:</b> " + o.longN + " → " + m.longN + "."));
  rows.push(srow(m.covOK ? (m.cov < sp.cov + 1.5 ? "w" : "g") : "b", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " " + o.cov.toFixed(1) + "% → " + m.cov.toFixed(1) + "% (cần từ " + sp.cov + "%)."));
  rows.push(srow(m.floorOK ? "g" : "b", "<b>Không dễ quá (ước lượng):</b> mức ở ngưỡng " + EASY_TH + "% " + lvlName(o.lvlIn) + " → " + lvlName(m.lvlIn) + " (cần " + esc(v.floorText) + ")."));
  if(m.fre!==null) rows.push(srow(m.freOK ? "g" : "b", "<b>Flesch Reading Ease:</b> " + (o.fre!==null ? o.fre.toFixed(1) : "?") + " → " + m.fre.toFixed(1) + " (cần " + freWin() + ")."));
  document.getElementById("b7-recheck").innerHTML = rows.join("");
  var newHard = Object.keys(m.hard).filter(function(w){ return !o.hard[w]; });
  var checks = [["độ dài", o.inRange, m.inRange], ["số đoạn", o.parasOK, m.parasOK], ["câu dài", o.longN===0, m.longN===0], ["không khó quá", o.covOK, m.covOK], ["không dễ quá", o.floorOK, m.floorOK], ["độ dễ đọc Flesch", o.freOK, m.freOK]];
  var regress = checks.filter(function(c){ return c[1] && !c[2]; }).map(function(c){ return c[0]; });
  var still = checks.filter(function(c){ return !c[1] && !c[2]; }).map(function(c){ return c[0]; });
  var adv, stillNote = still.length ? '<p class="small muted" style="margin-top:6px">Dòng đỏ "' + esc(still.join('", "')) + '" đã có từ trước khi sửa, không do các chỗ sửa gây ra. Nếu chưa xử lý ở bước 5, hãy quay lại xử lý.</p>' : '';
  if(regress.length) adv = '<div class="note"><b>Cần làm lại bước 5.</b> Các chỗ sửa làm hỏng: ' + esc(regress.join(", ")) + '. <button class="btn" type="button" data-goto="do-dai">Về bước 5</button></div>' + stillNote;
  else if(newHard.length || Math.abs(m.cov - o.cov) >= 0.5) adv = '<div class="note"><b>Các chỗ sửa không làm hỏng bước 5. Nên dán lại bài vào Text Profiler (bước 6) để xác nhận</b>, vì ' + (newHard.length ? "có từ mới vượt mức hoặc ngoài danh sách: " + esc(newHard.join(", ")) : "độ phủ thay đổi đáng kể") + '. <button class="btn" type="button" data-goto="tu-vung">Về bước 6</button></div>';
  else adv = '<div class="info"><span class="ok">✓</span> <b>Các chỗ sửa không cần làm lại bước 5 và 6.</b> Chúng không làm đổi độ dài, câu dài hay từ vựng đáng kể, và không thêm từ mới vượt mức.</div>';
  if(!regress.length) adv += stillNote;
  var ad = document.getElementById("b7-advice"); ad.innerHTML = adv;
  ad.querySelectorAll("[data-goto]").forEach(function(btn){ btn.addEventListener("click", function(){ show(btn.getAttribute("data-goto")); }); });
}
function needsPdf(p){ return slotsIn(p.t).some(function(id){ return isPdfSrc(id==="orig" ? origId() : id); }); }
function V(){ var v = vars(); v.unitName = SPEC[S.spec].skill==="R" ? "đoạn" : "phần"; return v; }
var fieldSeq = 0;

/* ---------- Fields ---------- */
function renderField(ph){
  var id = ph.getAttribute("data-field"), real = id==="orig" ? origId() : id, sl = SLOTS[real];
  var label = ph.getAttribute("data-label") || sl.label;
  var hint = ph.hasAttribute("data-hint") ? ph.getAttribute("data-hint") : (ph.hasAttribute("data-label") ? "" : (sl.hint || ""));
  var split = ph.getAttribute("data-split"), small = ph.hasAttribute("data-small");
  var fid = "f-" + real + "-" + (fieldSeq++), val = S.slots[real] || "", inner;
  if(sl.type==="area") inner = '<textarea id="'+fid+'" data-slot="'+real+'"'+(split?' data-split="'+split+'"':'')+(small?' class="sm"':'')+' placeholder="Dán vào đây">'+esc(val)+'</textarea>';
  else if(sl.type==="select") inner = '<select id="'+fid+'" data-slot="'+real+'">'+sl.options.map(function(o){ return '<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>'; }).join("")+'</select>';
  else inner = '<input type="text" id="'+fid+'" data-slot="'+real+'" value="'+esc(val)+'" placeholder="'+esc(sl.ph||"")+'">';
  var lab = esc(label).replace("{belowLevel}", '<span data-v="belowLevel"></span>');
  ph.innerHTML = '<label class="field" for="'+fid+'"><span class="lab">'+lab+(sl.optional?' <span class="meta">(không bắt buộc)</span>':'')+(sl.type==="area"?'<span class="meta" data-wc="'+real+'"></span>':'')+'</span>'
    + (hint ? '<span class="hint">'+esc(hint)+'</span>' : '') + inner + (split ? '<span class="splitmsg"></span>' : '') + '</label>';
  var el = ph.querySelector("[data-slot]");
  var pasted = false;
  var h = function(){
    var sp = el.getAttribute("data-split"), msg = ph.querySelector(".splitmsg"), msgs = [], wasPaste = pasted, prevDraft = real === "draft" ? (S.slots.draft || "") : null;
    if(sl.type==="area" && (pasted || /```/.test(el.value))){
      var c = cleanPaste(el.value);
      if(real==="draft" && CHATTY_RE.test(c + "\n")){ c = c.replace(CHATTY_RE, ""); msgs.push("Đã bỏ câu dẫn của AI ở đầu."); }
      if(c !== el.value) el.value = c;
    }
    if(sp){
      var m = ("\n" + el.value).match(SPLIT_RE);
      if(m){
        var idx = Math.max(0, m.index - 1), before = el.value.slice(0, idx).replace(/\s+$/,""), after = el.value.slice(idx + m[0].length - 1).trim();
        el.value = before;
        if(sp==="discard"){
          var stg = real==="draft" && SPEC[S.spec].skill==="L" ? extractSetting(after) : "";
          if(stg){ setSlot("setting", stg); msgs.push("Đã bỏ phần ghi chú cuối bài; phần bối cảnh AI đặt đã tách xuống mục 4 để bạn xem."); }
          else msgs.push("Đã bỏ phần ghi chú cuối bài." + (real==="draft" && SPEC[S.spec].skill==="L" ? " AI chưa ghi mục BỐI CẢNH nên mục 4 chưa có bối cảnh để xem." : ""));
        }
        else { setSlot(sp, after); msgs.push(sp==="notes" ? "Đã tách phần ghi chú của AI xuống ô bên dưới." : "Đã tách phần AI liệt kê thay đổi xuống ô bên dưới."); }
      } else if(pasted && /(\(1\)|\(6\)|BẢN ĐỒ|word count|số từ\s*:|→|->)/i.test(el.value.slice(-Math.min(el.value.length, 1500)))){
        if(msg){ msg.innerHTML = '<span class="no">Không thấy dòng phân cách giữa bài và phần ghi chú, nên trang chưa tách được.</span> Hãy dùng nút Copy của khối code, hoặc nhắn AI:' + remindHTML(REMIND_SPLIT); bindRemind(msg); }
        pasted = false; setSlot(real, el.value, el); return;
      }
    }
    if(msg) msg.textContent = msgs.join(" ");
    pasted = false;
    setSlot(real, el.value, el);
    var mtxt = msgs.join(" "); if(mtxt) setTimeout(function(){ var mm = ph.querySelector(".splitmsg"); if(mm && !mm.textContent) mm.textContent = mtxt; }, 0);
    if(real === "draft" && wasPaste && prevDraft !== null && prevDraft !== (S.slots.draft || "") && prevDraft.trim()){
      var pd = prevDraft, nw = S.slots.draft || "";
      S.slots.prePaste = pd; S.diffBase = "paste"; save(); runDiff();
      setTimeout(function(){
        var mm = ph.querySelector(".splitmsg"); if(!mm) return;
        mm.innerHTML = esc(mm.textContent ? mm.textContent + " " : "") + '<b>Đã thay bài đang làm: ' + wc(pd) + ' → ' + wc(nw) + ' từ.</b> <button type="button" class="btn quiet sm" data-undo-paste>Hoàn tác</button>';
        var ub = mm.querySelector("[data-undo-paste]");
        if(ub) ub.addEventListener("click", function(){ setSlot("draft", pd); mm.innerHTML = "Đã quay lại bản trước khi dán (" + wc(pd) + " từ)."; toast("Đã quay lại bản trước khi dán."); });
      }, 0);
    }
  };
  el.addEventListener("paste", function(){ pasted = true; });
  el.addEventListener("input", h); el.addEventListener("change", h);
}
// lấy mục BỐI CẢNH (Người nói, Người nghe, Dịp, Manh mối, Hợp với…) trong phần ghi chú AI trả về
function extractSetting(t){
  var L = String(t || "").split("\n"), i = -1;
  for(var k = 0; k < L.length; k++){ if(/^\s*[*#\-\s]*BỐI CẢNH\s*:?\s*\**\s*$/i.test(L[k]) || /^\s*[*#\-\s]*BỐI CẢNH\s*:/i.test(L[k])){ i = k; break; } }
  if(i < 0) return "";
  var out = [], first = L[i].replace(/^\s*[*#\-\s]*BỐI CẢNH\s*:?\s*\**/i, "").trim();
  if(first) out.push(first);
  for(var j = i + 1; j < L.length; j++){
    var ln = L[j].replace(/^\s*[*\-•]+\s*/, "").trim();
    if(!ln){ if(out.length) break; else continue; }
    if(/^(Người nói|Người nghe|Dịp|Nơi|Manh mối|Hợp với|Vai)/i.test(ln) || (out.length && /^\s{2,}/.test(L[j]))) out.push(ln);
    else if(out.length) break;
  }
  return out.join("\n");
}
// giải thích độ phủ bằng phần còn lại: bao nhiêu % (và khoảng bao nhiêu lượt) đang ở trên mức hoặc ngoài danh sách, và được phép tối đa bao nhiêu
function covGapText(now, need, L){
  var vp = lastVocab || (typeof currentVocab === "function" ? currentVocab() : null), N = vp && vp.N ? vp.N : 0, gap = Math.max(0, 100 - now), lim = Math.max(0, 100 - need);
  var U = N ? Math.round(N * gap / 100) : 0, A = N ? Math.floor(N * lim / 100 + 1e-6) : 0;
  return {
    now: " (tức là " + gap.toFixed(1) + "% lượt từ" + (N ? ", khoảng " + U + " lượt," : "") + " ở trên mức " + L + " hoặc không có trong danh sách CEFR-J/Octanove)",
    need: " (tức là tối đa " + lim + "%" + (N ? ", khoảng " + A + " lượt trong " + N + " lượt từ" + (U > A ? "; cần bớt ít nhất " + (U - A) + " lượt" : "") : "") + ")"
  };
}
// gợi ý tính sẵn cho "không dễ quá": cần thêm bao nhiêu lượt từ ở mức sàn trở lên
function easyGapText(vp, flIdx, tiIdx){
  if(!vp || !vp.N) return ""; var Nin = vp.N, upto = easyUpto(vp, flIdx);
  var need = Math.floor(Nin * (100 - EASY_TH) / 100) + 1, more = Math.max(0, need - upto), FL = LVL[flIdx], rng = flIdx === tiIdx ? FL : FL + "–" + LVL[tiIdx];
  return " Hiện có " + upto + " lượt từ mức " + FL + " trở lên hoặc ngoài danh sách (" + (Nin ? (100 * upto / Nin).toFixed(1) : "0") + "% của " + Nin + " lượt, không tính tên riêng); cần trên " + (100 - EASY_TH) + "%, tức ít nhất " + need + " lượt: đổi thêm khoảng " + more + " lượt từ dưới mức " + FL + " thành từ mức " + rng + " có trong danh sách (không dùng từ trên mức " + LVL[tiIdx] + "; từ ngoài danh sách tuy giúp qua sàn nhưng bị tính vào phần vượt mức ở độ phủ). Một từ nhắc lại nhiều lần được tính mỗi lần.";
}
// các từ trên mức dùng nhiều nhất (để sửa tay "không khó quá")
function aboveTopText(vp, tiIdx, n){
  if(!vp) return ""; var keep = {}; keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var L = vp.lemmas.filter(function(l){ return l.lv > tiIdx && !keep[l.w]; }).map(function(l){ return {w:l.w + " (" + LVL[l.lv] + ")", n:l.n}; })
    .concat(vp.offList.filter(function(o){ return !keep[o.w]; }).map(function(o){ return {w:o.w + " (ngoài danh sách)", n:o.n}; }))
    .sort(function(a, b){ return b.n - a.n; }).slice(0, n || 8);
  return L.length ? " Dùng nhiều nhất: " + L.map(function(x){ return x.w + (x.n > 1 ? " ×" + x.n : ""); }).join(", ") + "." : "";
}
function setSlot(id, val, src){
  // chế độ xem: không đổi nội dung (người khác đang giữ bước này, hoặc chưa tới bước này)
  if(!wfBypass && typeof wfCanEditSlot === "function" && val !== (S.slots[id] || "") && !wfCanEditSlot(id)){
    document.querySelectorAll('[data-slot="' + id + '"]').forEach(function(o){ if(o.value !== (S.slots[id] || "")) o.value = S.slots[id] || ""; });
    if(src) toast("Chế độ xem: bạn không sửa được bước này. Xem dòng ghi chú ở đầu bước."); return;
  }
  if(id==="draft" && !wfBypass && typeof wfDraftLocked==="function" && wfDraftLocked() && val !== (S.slots.draft||"")){
    document.querySelectorAll('[data-slot="draft"]').forEach(function(o){ o.value = S.slots.draft||""; });
    toast("Bài đã khoá (bản " + S.wf.lock.ver + "). Cần đổi bài thì gửi yêu cầu sửa ngữ liệu ở thanh Quy trình."); return;
  }
  S.slots[id] = val; save();
  document.querySelectorAll('[data-slot="'+id+'"]').forEach(function(o){ if(o!==src && o.value!==val) o.value = val; });
  if(id==="draft"){ lastAnalysis = null; lastVocab = null; lastFre = null; runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); }
  if(id==="draft" || id==="src" || id==="srcPdfText"){ try{ sbRender(); }catch(e){} }
  if(id==="src" || id==="srcPdfText") runOverlap();
  if(id==="keep") renderKeepCheck();
  if(id==="b7out" || id==="draft"){ renderB7(); }
  if(id==="notes" || id==="draft") renderAnchors();
  if(id==="draft") renderRecheck();
  if(id==="pfCov"||id==="pfLvl95"||id==="pfCovBelow"){ S.pfSig = draftSig(S.slots.draft); runBand(); }
  if(id==="topic"){ renderFilenames(); renderChip(); }
  if(id==="qblind") S.qBlindFor = qHash(S.slots.questions||"");
  if(id==="questions" || id==="draft" || id==="notes" || id==="qblind") renderQ();
  schedule();
}
var pvT; function schedule(){ clearTimeout(pvT); pvT = setTimeout(function(){ refreshText(); try{ clRender(); }catch(e){} updateStepper(); }, 150); }

/* ---------- AI boxes ---------- */
function renderAI(ph){
  var key = promptKey(ph.getAttribute("data-ai")); ph.setAttribute("data-key", key);
  var tip = key==="b2" ? 'Dán vào AI <b>đã bật tìm kiếm web</b>, trong một cuộc trò chuyện mới, rồi gửi.' : 'Dán vào <b>một cuộc trò chuyện mới</b> với AI rồi gửi.';
  if(P[key] && /khối code/.test(P[key].t)) tip += ' Khi AI trả lời, bấm <b>nút Copy ở góc khối code</b> để lấy kết quả, đừng bôi đen để copy.';
  ph.innerHTML = '<div class="ai"><p class="attach note small hidden"></p><button class="btn primary big" type="button">Sao chép câu lệnh</button><p class="small muted">'+tip+'</p><p class="warn"></p><details class="peek"><summary>Xem câu lệnh sẽ gửi</summary><pre></pre></details></div>';
  var btn = ph.querySelector("button"), warn = ph.querySelector(".warn");
  btn.addEventListener("click", function(){
    var p = P[ph.getAttribute("data-key")], miss = missing(p);
    if(miss.length){ warn.textContent = "Chưa sao chép được: còn trống ô " + miss.join(", ") + "."; return; }
    warn.textContent = "";
    copyText(assemble(p, vars()), btn, "Sao chép câu lệnh", "Đã sao chép. Giờ dán vào AI");
  });
}
function renderAllAI(){ document.querySelectorAll("[data-ai]").forEach(renderAI); }

function copyText(text, btn, label, okText){
  var old = label || btn.textContent;
  function done(ok){ btn.textContent = ok ? (okText || "Đã sao chép") : "Không sao chép được"; setTimeout(function(){ btn.textContent = old; }, 2200); }
  try{ navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(fallbackCopy(text)); }); }
  catch(e){ done(fallbackCopy(text)); }
}
function fallbackCopy(text){
  try{ var ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); var ok=document.execCommand("copy"); document.body.removeChild(ta); return ok; }catch(e){ return false; }
}

/* ---------- Text that depends on settings / slots ---------- */
function refreshText(){
  var v = V();
  document.querySelectorAll("[data-ai]").forEach(function(ph){
    var p = P[ph.getAttribute("data-key")]; if(!p) return;
    var pre = ph.querySelector("pre"); if(pre) pre.innerHTML = preview(p, v);
    var w = ph.querySelector(".warn"); if(w && w.textContent && !missing(p).length) w.textContent = "";
    var at = ph.querySelector(".attach");
    if(at){ var need = needsPdf(p); at.classList.toggle("hidden", !need); if(need) at.innerHTML = "Bước này cần <b>đính kèm file PDF</b>" + (S.slots.pdfName ? " <b>" + esc(S.slots.pdfName) + "</b>" : "") + " vào cuộc trò chuyện, rồi dán câu lệnh."; }
  });
  document.querySelectorAll("[data-v]").forEach(function(el){ var k = el.getAttribute("data-v"); el.textContent = v[k]!==undefined ? v[k] : ""; });
  document.querySelectorAll("[data-wc]").forEach(function(el){ var t = S.slots[el.getAttribute("data-wc")]; el.textContent = t && t.trim() ? " · " + wc(t) + " từ" : ""; });
  renderHave();
}
function haveLine(ok, text, goto, gotoName){
  return '<div>' + (ok ? '<span class="ok">✓</span> ' + text : '<span class="no">✗</span> ' + text + (goto ? ' <button class="btn quiet" type="button" data-goto="'+goto+'">Về bước '+gotoName+'</button>' : '')) + '</div>';
}
function renderHave(){
  var isL = SPEC[S.spec].skill==="L";
  document.querySelectorAll("[data-have]").forEach(function(el){
    var k = el.getAttribute("data-have"), h = "";
    if(k==="topic"){ var t = slotVal("topic"); h = haveLine(!!t, t ? "Chủ đề: <i>"+esc(t)+"</i>" : "Chưa có chủ đề.", "chu-de", "Chủ đề"); }
    if(k==="src"){
      if(isPdfSrc("src")){ var nm = (S.slots.pdfName||"").trim(), scp = (S.slots.pdfScope||"").trim(); h = haveLine(!!(nm && scp), nm && scp ? "Nguồn là file PDF <b>" + esc(nm) + "</b> (phần: " + esc(scp) + "). Nhớ đính kèm file khi gửi câu lệnh." : "Chưa ghi tên file PDF và phần cần dùng.", "nguon", "Nguồn"); }
      else { var s = slotVal("src"); h = haveLine(!!s, s ? "Đã có văn bản nguồn tiếng Anh ("+wc(s)+" từ)." : "Chưa có văn bản nguồn tiếng Anh.", "nguon", "Nguồn"); }
    }
    if(k==="orig"){
      var o = slotVal("orig"), d = slotVal("draft");
      h = haveLine(!!o, o ? (isL ? "Đoạn dữ kiện (" + wc(o) + " từ)" : (isPdfSrc("src") ? "Nguồn: file PDF <b>" + esc(S.slots.pdfName||"") + "</b>, nhớ đính kèm" : "Văn bản nguồn (" + wc(o) + " từ)")) : "Chưa có " + (isL ? "đoạn dữ kiện." : "nguồn."), isL ? "viet-kich-ban" : "nguon", isL ? "Viết kịch bản" : "Nguồn")
        + haveLine(!!d, d ? "Bài đang làm ("+wc(d)+" từ)" : "Chưa có bài đang làm.", isL ? "viet-kich-ban" : "viet-bai", isL ? "Viết kịch bản" : "Viết bài");
    }
    el.innerHTML = h;
    el.querySelectorAll("[data-goto]").forEach(function(b){ b.addEventListener("click", function(){ show(b.getAttribute("data-goto")); }); });
  });
}

/* ---------- Settings summary ---------- */
function renderChip(){ var sp = SPEC[S.spec]; document.getElementById("curbai").textContent = sp.label + (sp.skill === "W" || sp.skill === "S" ? "" : " · " + S.level) + (slotVal("topic") ? " · " + slotVal("topic").slice(0,40) : ""); }
function renderFilenames(){
  var sp = SPEC[S.spec], code = S.code ? slug(S.code) : S.spec, t = S.slots.topic ? slug(S.slots.topic) : "chu-de";
  var names = sp.skill==="R" ? ["nguon","bientap","chot"] : ["nguon","dukien","kichban","chot"];
  document.getElementById("fnames").textContent = names.map(function(n){ return code+"_"+t+"_"+n; }).join(", ");
}
function renderSpec(){
  var sp = SPEC[S.spec], v = V(), isR = sp.skill==="R";
  var parts = ["<b>" + esc(sp.label) + "</b> cần: " + esc(sp.words) + " từ" + (isR ? " (tính cả tiêu đề)" : (sp.grp!==3 ? " (tính cả tên người nói)" : ""))];
  if(isR) parts.push(esc(v.paras) + " đoạn");
  if(sp.speed) parts.push(esc(sp.speed));
  parts.push("nội dung: " + esc(sp.genre));
  parts.push("từ vựng mức " + esc(S.level));
  parts.push("Flesch Reading Ease " + freWin());
  parts.push(esc(sp.qcount) + (sp.qdist ? " (bậc 3/4/5: " + esc(sp.qdist) + ")" : ""));
  var lockNote = (typeof SPECS !== "undefined" && !SPECS.loaded) ? ' <span class="small muted">Số từ đang theo QĐ 730' + (isR ? ", chưa có bảng phân bố câu hỏi" : "") + '. Yêu cầu của VNCETA' + (isR ? " và bảng phân bố" : "") + ' là tài liệu tập huấn, chỉ tải khi đăng nhập bằng tài khoản được quản trị cho xem đặc tả.</span>' : "";
  document.getElementById("specsum").innerHTML = parts.join(" · ") + "." + lockNote;
  var lh = document.getElementById("level-hint"); if(lh) lh.textContent = levelHint();
  var qf = document.getElementById("q-format"); if(qf) qf.textContent = qFormatText();
  var pe = document.getElementById("set-paras"); pe.disabled = (!isR || S.spec==="R1"); if(S.spec==="R1") pe.value = 4;
  var q = ["<b>Số câu:</b> " + esc(sp.qcount)];
  q.push("<b>Số câu theo bậc 3 / 4 / 5:</b> " + (sp.qdist ? esc(sp.qdist) : "cả bài Nghe 14 / 12 / 9; chia theo phần theo hướng dẫn của nhóm"));
  if(sp.skills) q.push("<b>Kỹ năng được hỏi:</b> " + esc(sp.skills));
  var qse = document.getElementById("qspec"); if(qse) qse.innerHTML = q.join("<br>");
  renderChip(); renderFilenames();
}

/* ---------- Branch + navigation ---------- */
function screens(){ var sk = SPEC[S.spec].skill; return Array.prototype.filter.call(document.querySelectorAll(".screen"), function(s){ var b = s.getAttribute("data-branch"); var sx = s.getAttribute("data-specs"); return (b==="all" || b.split(" ").indexOf(sk) >= 0) && (!sx || sx.split(" ").indexOf(S.spec) >= 0); }); }
function applyBranch(){
  var sp = SPEC[S.spec], b = sp.skill;
  document.querySelectorAll("[data-branchtext]").forEach(function(el){ el.classList.toggle("hidden", el.getAttribute("data-branchtext")!==b); });
  document.querySelectorAll("[data-grp]").forEach(function(el){ el.classList.toggle("hidden", String(sp.grp)!==el.getAttribute("data-grp")); });
  document.querySelectorAll("[data-skills]").forEach(function(el){ el.classList.toggle("hidden", el.getAttribute("data-skills").split(" ").indexOf(b) < 0); });
  try{ wsSync(); wsRenderForm(); }catch(e){}
  var list = screens();
  if(list.map(function(s){return s.id;}).indexOf(S.step)===-1){
    if(S.step==="viet-bai" && b==="L") S.step = "viet-kich-ban";
    else if(S.step==="viet-kich-ban" && b==="R") S.step = "viet-bai";
    else S.step = "bat-dau";
  }
  list.forEach(function(s,i){ s.querySelector(".kicker").textContent = "Bước " + (i+1) + " / " + list.length; });
  show(S.step, true);
}
function gatesOf(s){ return Array.prototype.filter.call(s.querySelectorAll("input[data-gate]"), function(i){ var l = i.closest("label"); return !(l && l.classList.contains("hidden")); }); }
function updateStepper(){
  var nav = document.getElementById("stepper"), list = screens();
  nav.innerHTML = list.map(function(s,i){
    var g = gatesOf(s), done = g.length && g.every(function(x){return x.checked;});
    return '<button type="button" data-step="'+s.id+'" class="'+(s.id===S.step?"cur ":"")+(done?"done":"")+'"><span class="sn">'+(done?"✓":(i+1))+'</span>'+esc(s.getAttribute("data-name"))+'</button>';
  }).join("");
  nav.querySelectorAll("button").forEach(function(b){ b.addEventListener("click", function(){ show(b.getAttribute("data-step")); }); });
  var cur = nav.querySelector(".cur"); if(cur){ var l = cur.offsetLeft - nav.offsetLeft, r = l + cur.offsetWidth; if(l < nav.scrollLeft || r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = Math.max(0, l - 40); }
}
function show(id, noScroll){
  var list = screens(), ids = list.map(function(s){return s.id;});
  if(ids.indexOf(id)===-1) id = ids[0];
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.toggle("hidden", s.id!==id); });
  S.step = id; save();
  if(id==="nop" && (typeof wfCanEditScreen !== "function" || wfCanEditScreen("nop"))) try{ fillAuto(); }catch(e){}
  if(id==="chat-lieu" || id==="cau-hoi" || id==="ws-kiem") try{ clRender(); }catch(e){}
  if(id==="nguon" && typeof wfG1Render === "function") try{ wfG1Render(); }catch(e){}
  try{ cmpRenderMounts(); }catch(e){}
  try{ if(location.hash !== "#"+id) history.replaceState(null, "", "#"+id); }catch(e){}
  updateStepper();
  try{ wfModeApply(); }catch(e){}
  if(!noScroll) window.scrollTo(0,0);
}
function go(delta){
  var ids = screens().map(function(s){return s.id;}), i = ids.indexOf(S.step);
  if(i+delta>=0 && i+delta<ids.length) show(ids[i+delta]);
}
function bindNav(){
  document.querySelectorAll("[data-next]").forEach(function(b){
    var armed = false, scr = b.closest(".screen");
    b.addEventListener("click", function(){
      var left = gatesOf(scr).filter(function(x){return !x.checked;}).length, msg = scr.querySelector(".navmsg");
      if(left && !armed){ armed = true; msg.textContent = "Còn " + left + " mục chưa đánh dấu ở khung phía trên. Bấm Tiếp tục lần nữa nếu vẫn muốn sang bước sau."; return; }
      armed = false; msg.textContent = "";
      if(scr.hasAttribute("data-approve") && (S.slots.draft||"").trim()){ S.slots.approved = S.slots.draft; S.fixOpen = {}; save(); runDiff(); runLength(); runBand(); }
      go(1);
    });
  });
  document.querySelectorAll("[data-prev]").forEach(function(b){ b.addEventListener("click", function(){ go(-1); }); });
  window.addEventListener("hashchange", function(){ var h = location.hash.slice(1); if(h && h!==S.step) show(h); });
}

/* ---------- Bước 5: độ dài ---------- */
function srow(cls, html){ return '<div class="srow '+cls+'"><span class="ic">'+(cls==="g"?"✓":(cls==="b"?"!":"–"))+'</span><div>'+html+'</div></div>'; }
function runLength(){
  var box = document.getElementById("len-status");
  var txt = S.slots.draft || "", sp = SPEC[S.spec], v = V();
  if(!txt.trim()){ box.innerHTML = srow("w", "Chưa có bài. Quay lại bước 4 để dán bài AI viết."); document.getElementById("vocab-detail").innerHTML = ""; lastVocab = null; lastFre = null; renderFixAll(); return; }
  var a = analyze(txt); lastAnalysis = a;
  var rows = [], needFix = false;
  if(sp.min){
    var d = a.total<sp.min ? a.total-sp.min : (a.total>sp.max ? a.total-sp.max : 0);
    if(d===0) rows.push(srow("g", "<b>Độ dài:</b> " + a.total + " từ, đúng yêu cầu " + esc(sp.words) + "."));
    else { needFix = true; rows.push(srow("b", "<b>Độ dài:</b> " + a.total + " từ, " + (d<0 ? "thiếu " + (-d) : "thừa " + d) + " từ so với yêu cầu " + esc(sp.words) + ".")); }
  } else {
    var dd = a.total - sp.approx;
    if(Math.abs(dd)<=15) rows.push(srow("g", "<b>Độ dài:</b> " + a.total + " từ, gần mức yêu cầu " + esc(sp.words) + "."));
    else { needFix = true; rows.push(srow("b", "<b>Độ dài:</b> " + a.total + " từ, lệch " + (dd>0?"+":"") + dd + " so với " + esc(sp.words) + ".")); }
  }
  if(sp.skill==="R"){
    var target = parseInt(v.paras,10);
    if(a.body.length===target) rows.push(srow("g", "<b>Số đoạn:</b> " + target + " đoạn (" + a.body.map(function(b){return b.n;}).join(" / ") + " từ)."));
    else { needFix = true; rows.push(srow("b", "<b>Số đoạn:</b> có " + a.body.length + " đoạn, cần " + target + ". Các đoạn phải cách nhau một dòng trống.")); }
    if(a.titles.length===1) rows.push(srow("g", "<b>Tiêu đề:</b> " + esc(a.titles[0].text)));
    else if(!a.titles.length) rows.push(srow("b", "<b>Tiêu đề:</b> không thấy. Tiêu đề phải ở dòng đầu, tối đa 10 từ, không có dấu chấm cuối, cách đoạn đầu một dòng trống. Sửa tay trong ô \"Bài đang làm\"."));
    else rows.push(srow("b", "<b>Tiêu đề:</b> có " + a.titles.length + " dòng bị coi là tiêu đề (" + esc(a.titles.map(function(t){return t.text;}).join(" | ")) + "). Kiểm lại các dòng thiếu dấu chấm."));
  } else {
    rows.push(srow("w", "<b>Thời lượng ước tính:</b> " + fmtMin(a.total,150) + " ở 150 từ/phút (" + fmtMin(a.total,130) + " ở 130, " + fmtMin(a.total,170) + " ở 170)."));
  }
  if(!a.long.length) rows.push(srow("g", "<b>Câu dài:</b> không có câu nào trên 25 từ."));
  else { needFix = true; rows.push(srow("b", "<b>Câu dài:</b> " + a.long.length + " câu trên 25 từ: " + a.long.map(function(l){ return "<i>" + esc(l.s.slice(0,70)) + "…</i> (" + l.n + " từ)"; }).join("; "))); }
  var wantUK = S.spelling==="Anh–Anh", wrong = wantUK ? a.us : a.uk, wrongD = wantUK ? a.usDates : a.ukDates;
  if(!wrong.length && !wrongD.length) rows.push(srow("g", "<b>Chính tả:</b> thống nhất kiểu " + esc(S.spelling) + "."));
  else rows.push(srow("b", "<b>Chính tả:</b> có chỗ viết kiểu " + (wantUK?"Mỹ":"Anh") + ": " + esc(wrong.concat(wrongD).join(", ")) + ". Sửa tay trong ô \"Bài đang làm\"; ngày viết như " + esc(v.dateEx) + "."));
  if(/(^|\n)\s*-{3,}\s*(\n|$)/.test(txt) || /\b(word count|số từ)\b/i.test(txt)) rows.push(srow("b", "<b>Ghi chú lẫn vào bài:</b> có vẻ bài còn phần ghi chú của AI. Xoá đi trong ô \"Bài đang làm\"."));
  var vp = vocabProfile(txt); lastVocab = vp;
  var ti = LVL.indexOf(S.level), fl = LVL.indexOf(v.floorLevel), cT = vp.cum[ti], aboveN = 0;
  vp.lemmas.forEach(function(l){ if(l.lv > ti) aboveN += l.n; });
  var vHard = cT < sp.cov, vNear = !vHard && cT < sp.cov + 1.5, vEasy = easyLvl(vp) < fl;
  var det = aboveN + " lượt từ trên mức " + S.level + ", " + vp.off + " lượt ngoài danh sách (không tính tên riêng).";
  var cgv = covGapText(cT, sp.cov, S.level);
  if(vHard) rows.push(srow("b", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "%" + cgv.now + ", cần từ " + sp.cov + "%" + cgv.need + ". " + det + esc(aboveTopText(vp, ti, 8))));
  else if(vNear) rows.push(srow("w", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "%, sát ngưỡng " + sp.cov + "%. " + det + " Ước lượng của trang thường cao hơn Text Profiler khoảng 1 điểm, nên có thể sửa thêm."));
  else rows.push(srow("g", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "% (cần từ " + sp.cov + "%). " + det));
  if(vEasy) rows.push(srow("b", "<b>Không dễ quá (ước lượng):</b> tính cả từ ngoài danh sách, mức ở ngưỡng " + EASY_TH + "% của bài là " + lvlName(easyLvl(vp)) + ", cần " + esc(v.floorText) + "." + esc(easyGapText(vp, fl, ti)) + " Từ dùng nhiều có thể nâng: " + esc(v.upCands6 || "") + ". Bật màu " + esc(LVL[fl]) + " trong ô \"Bài đang làm\" để thấy chỗ đã đạt."));
  else rows.push(srow("g", "<b>Không dễ quá (ước lượng):</b> tính cả từ ngoài danh sách, mức ở ngưỡng " + EASY_TH + "% của bài là " + lvlName(easyLvl(vp)) + " (cần " + esc(v.floorText) + ")."));
  var fr = fleschOf(txt); lastFre = fr;
  var fm = FRE_MIN[S.level], freFail = false;
  if(!fr.ok) rows.push(srow("w", "<b>Độ dễ đọc (Flesch Reading Ease):</b> chưa tính được, bài cần ít nhất 60 từ và 3 câu."));
  else {
    var band = freBand(fr.fre);
    freFail = !freIn(fr.fre);
    var fx = FRE_MAX[S.level], AR = FRE_ASL[S.level], fNear = !freFail && (fr.fre < fm + 3 || (fx < 200 && fr.fre > fx - 3));
    rows.push(srow(freFail ? "b" : (fNear ? "w" : "g"), "<b>Độ dễ đọc (Flesch Reading Ease):</b> " + fr.fre.toFixed(1) + " · " + band[1] + " (dải " + band[2] + "); yêu cầu " + freWin() + " với mức " + S.level + (freFail ? (fr.fre < fm ? " — <b>khó quá</b> theo Flesch" : " — <b>dễ quá</b> theo Flesch") : (fNear ? " — sát mép, sửa tiếp cẩn thận" : "")) + ". Câu trung bình " + fr.asl.toFixed(1) + " từ (gợi ý " + AR[0] + "–" + AR[1] + "), " + fr.spw.toFixed(2) + " âm tiết mỗi từ (gợi ý " + FRE_SPW[S.level] + ")." + (freFail && v.freLever ? " Cách đạt: " + esc(v.freLever) + "." : "")));
  }
  if(sp.skill==="L"){ var spkR = spkRowHTML(); if(spkR) rows.push(spkR); }
  var WCK = null; try{ WCK = wordCheck(); }catch(e){ WCK = null; }
  var wcRaise = false; try{ wcRaise = wcRaising(v); }catch(e){}
  var wcBad = WCK ? WCK.above.length + WCK.off.length + (wcRaise ? WCK.near.length : 0) : 0;
  if(WCK && (WCK.above.length || WCK.off.length || WCK.at.length || WCK.near.length || WCK.lostAt.length)){
    var wl = function(arr, tag){ return arr.map(function(it){ return "<b>" + esc(it.w) + "</b> <span class=\"muted\">(" + esc(tag(it)) + (it.n > 1 ? " ×" + it.n : "") + ", " + it.syl + " âm tiết" + (it.old ? "; trước: " + esc(it.old) : "") + ")</span>"; }).join("; "); };
    var parts = [];
    if(WCK.above.length) parts.push("trên mức " + S.level + " (bị trừ độ phủ): " + wl(WCK.above, function(it){ return LVL[it.lv]; }));
    if(WCK.off.length) parts.push("không có trong danh sách (bị trừ độ phủ): " + wl(WCK.off, function(){ return "ngoài danh sách"; }));
    if(wcRaise && WCK.at.length) parts.push("đúng mức " + S.level + " (giúp nâng mức): " + wl(WCK.at, function(it){ return LVL[it.lv]; }));
    if(wcRaise && WCK.near.length) parts.push("chỉ ở mức " + LVL[LVL.indexOf(S.level) - 1] + " (chưa giúp nâng mức): " + wl(WCK.near, function(it){ return LVL[it.lv]; }));
    if(wcRaise && WCK.lostAt.length) parts.push("từ mức " + S.level + " bị mất so với bản đã duyệt: " + esc(WCK.lostAt.join(", ")));
    if(parts.length) rows.push(srow(wcBad ? "w" : "g", "<b>Tra lại từ mới so với bản đã duyệt</b> (theo đúng danh sách và cách tra của trang): " + parts.join(" · ") + (wcBad ? " · Dùng câu lệnh \"Sửa các từ AI dùng sai mức\" bên dưới." : "")));
  }
  document.querySelectorAll(".wordfix-panel").forEach(function(el){ el.classList.toggle("hidden", !wcBad); });
  box.innerHTML = rows.join("");
  try{ lvRender(); }catch(e){}
  var keepL = {}; keepList().forEach(function(k){ keepL[k.toLowerCase()] = 1; });
  var abL = vp.lemmas.filter(function(l){ return l.lv > ti; }).map(function(l){ return esc(l.w) + " <span class=\"muted\">(" + LVL[l.lv] + (l.n>1 ? " ×" + l.n : "") + ")</span>" + (keepL[l.w] ? " <span class=\"ok\">giữ lại</span>" : ""); });
  var ofL = vp.offList.map(function(o){ return esc(o.w) + (o.n>1 ? " <span class=\"muted\">×" + o.n + "</span>" : "") + (keepL[o.w] ? " <span class=\"ok\">giữ lại</span>" : ""); });
  var atL = vp.lemmas.filter(function(l){ return l.lv === ti; }).map(function(l){ return esc(l.w); });
  document.getElementById("vocab-detail").innerHTML =
    "<div><b>Trên mức " + S.level + ":</b> " + (abL.length ? abL.join(", ") : "không có") + "</div>"
    + "<div><b>Ngoài danh sách</b> (thường là từ phái sinh, thuật ngữ, từ ghép): " + (ofL.length ? ofL.join(", ") : "không có") + "</div>"
    + "<div><b>Đúng mức " + S.level + "</b> (tham khảo): " + (atL.length ? atL.join(", ") : "không có") + "</div>"
    + "<div class=\"muted\"><b>Coi là tên riêng, không tính:</b> " + (vp.proper.length ? esc(vp.proper.join(", ")) : "không có") + ". Nếu trang nhận nhầm một từ thường thành tên riêng, kết quả có thể lệch.</div>";
  renderFixAll();
  document.querySelectorAll('[data-slot="pfCov"]').forEach(function(el){ el.placeholder = "trang ước lượng: " + cT.toFixed(1); });
  var be = document.getElementById("band-est"); if(be) be.textContent = "Trang ước lượng ở bước 5: độ phủ ở mức " + S.level + " khoảng " + cT.toFixed(1) + "%, mức ở ngưỡng 95% (không tính từ ngoài danh sách) khoảng " + lvlName(vp.lvl95In) + ", ở ngưỡng " + EASY_TH + "% (tính cả từ ngoài danh sách) là " + lvlName(easyLvl(vp)) + ". Độ phủ lấy số Text Profiler làm chuẩn; ngưỡng " + EASY_TH + "% do trang tính (Text Profiler không báo).";
}

/* ---------- Bước 6: dải từ vựng ---------- */
function runBand(){
  var vd = document.getElementById("band-verdict"), det = document.getElementById("band-detail");
  var sp = SPEC[S.spec], v = V(), LV = ["A1","A2","B1","B2","C1","C2","trên C2"];
  var ti = LV.indexOf(S.level), fl = LV.indexOf(v.floorLevel);
  var cov = parseFloat(String(S.slots.pfCov||"").replace(",", ".")), l95 = LV.indexOf(S.slots.pfLvl95||"");
  var hard = false, easy = false, upOK = null, lowOK = null;
  if(!isNaN(cov)) upOK = cov >= sp.cov;
  if(l95>=0 && l95>ti) upOK = false;
  var vpE = currentVocab(), lE = vpE && vpE.N ? easyLvl(vpE) : -1;
  if(lE>=0) lowOK = lE >= fl;
  hard = upOK===false; easy = lowOK===false;
  S.fixOpen = S.fixOpen || {};
  if(hard) S.fixOpen.hard = true; if(easy) S.fixOpen.easy = true;
  var easyTxt = lE>=0 ? "mức ở ngưỡng " + EASY_TH + "% (trang tính, tính cả từ ngoài danh sách) là " + lvlName(lE) + ", cần " + v.floorText : "";
  if(isNaN(cov) && l95<0 && !easy){ vd.className = "verdict w"; vd.textContent = "Nhập số liệu để xem kết quả."; det.textContent = easyTxt ? "Không dễ quá: " + easyTxt + "." : ""; }
  else if(hard){ vd.className = "verdict b"; vd.textContent = "Khó quá: còn nhiều từ trên mức " + S.level + "."; det.textContent = "Độ phủ ở mức " + S.level + " cần từ " + sp.cov + "% trở lên. Làm theo khung màu đỏ bên dưới."; }
  else if(easy){ vd.className = "verdict b"; vd.textContent = "Dễ quá: " + easyTxt + "."; det.textContent = "Làm theo khung màu đỏ bên dưới: nâng bằng từ đúng mức, cụm động từ, kết hợp từ; không dùng từ hiếm, không đổi từ chủ đề. Có thể sửa tay trong ô \"Bài đang làm\" (bật màu " + LV[fl] + " để thấy chỗ đã đạt)."; }
  else if(upOK && lowOK){ vd.className = "verdict g"; vd.textContent = "Đạt: không khó quá, không dễ quá."; det.textContent = "Không dễ quá: " + easyTxt + ". Ghi các số này vào phiếu ở bước cuối."; }
  else { vd.className = "verdict w"; vd.textContent = "Nhập \"Độ phủ ở mức mục tiêu\" từ Text Profiler để kiểm có khó quá không."; det.textContent = easyTxt ? "Không dễ quá: " + easyTxt + "." : ""; }
  var changed = (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== (S.slots.draft||"").trim();
  renderFixAll();
  try{ sbRender(); }catch(e){}
  save(); schedule();
}

/* ---------- So sánh với bản đã duyệt ---------- */
function dtok(s){ return (s.replace(/\r/g,"").match(/\n\s*\n|\S+/g)||[]).map(function(t){ return /^\n/.test(t) ? "¶" : t; }); }
function runDiff(){
  var mode = S.diffBase === "approved" || !(S.slots.prePaste || "").trim() ? "approved" : "paste";
  var boxes = document.querySelectorAll(".diffbox"), a = mode === "paste" ? S.slots.prePaste : (S.slots.approved||""), b = S.slots.draft||"", html;
  var bar = '<div class="small" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px"><span class="muted">So với:</span>' + ((S.slots.prePaste||"").trim() ? '<button type="button" class="btn quiet sm' + (mode === "paste" ? ' on' : '') + '" data-diffbase="paste">Bản trước lần dán gần nhất</button>' : '') + '<button type="button" class="btn quiet sm' + (mode === "approved" ? ' on' : '') + '" data-diffbase="approved">Bản đã duyệt ở bước 4</button></div>';
  if(!a.trim()) html = '<p class="small muted">Chưa có bản đã duyệt để so. Bản được lưu mỗi khi bạn bấm Tiếp tục ở bước 4.</p>';
  else if(a.trim()===b.trim()) html = '<p class="small muted">Chưa có thay đổi nào so với bản đã duyệt.</p>';
  else {
    var A = dtok(a), B = dtok(b), pre = 0, suf = 0;
    while(pre<A.length && pre<B.length && A[pre]===B[pre]) pre++;
    while(suf<A.length-pre && suf<B.length-pre && A[A.length-1-suf]===B[B.length-1-suf]) suf++;
    var a2 = A.slice(pre, A.length-suf), b2 = B.slice(pre, B.length-suf), n = a2.length, m = b2.length, ops = [];
    if(n*m > 4000000){ ops = a2.map(function(t){return ["-",t];}).concat(b2.map(function(t){return ["+",t];})); }
    else {
      var W = m+1, L = new Uint16Array((n+1)*(m+1));
      for(var i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--) L[i*W+j] = a2[i]===b2[j] ? L[(i+1)*W+j+1]+1 : Math.max(L[(i+1)*W+j], L[i*W+j+1]);
      var x=0, y=0;
      while(x<n && y<m){ if(a2[x]===b2[y]){ ops.push(["=",a2[x]]); x++; y++; } else if(L[(x+1)*W+y]>=L[x*W+y+1]){ ops.push(["-",a2[x]]); x++; } else { ops.push(["+",b2[y]]); y++; } }
      while(x<n) ops.push(["-",a2[x++]]); while(y<m) ops.push(["+",b2[y++]]);
    }
    ops = A.slice(0,pre).map(function(t){return ["=",t];}).concat(ops, A.slice(A.length-suf).map(function(t){return ["=",t];}));
    var add = 0, del = 0; ops.forEach(function(o){ if(o[1]==="¶") return; if(o[0]==="+") add++; if(o[0]==="-") del++; });
    var render = function(list){
      var out = "", prev = null, buf = "";
      var flush = function(){ if(!buf) return; out += prev==="+" ? '<ins class="di">'+esc(buf)+'</ins>' : (prev==="-" ? '<del class="dd">'+esc(buf)+'</del>' : (prev==="…" ? '<span class="muted"> … </span>' : esc(buf))); buf = ""; };
      list.forEach(function(o){ if(o[0]!==prev){ flush(); prev = o[0]; } buf += o[0]==="…" ? "…" : (o[1]==="¶" ? "\n\n" : o[1] + " "); }); flush();
      return out;
    };
    var near = new Array(ops.length).fill(false), CTX = 8;
    ops.forEach(function(o,i){ if(o[0]!=="="){ for(var k=Math.max(0,i-CTX); k<=Math.min(ops.length-1,i+CTX); k++) near[k] = true; } });
    var snip = [], gap = false;
    ops.forEach(function(o,i){ if(near[i]){ if(gap && snip.length) snip.push(["…",""]); gap = false; snip.push(o[0]==="=" && o[1]==="¶" ? ["=","/"] : o); } else gap = true; });
    html = '<p class="small"><b>' + del + '</b> chữ bị xoá, <b>' + add + '</b> chữ được thêm. Dưới đây chỉ hiện các chỗ thay đổi:</p><div class="hl">' + render(snip) + '</div><details style="margin-top:6px"><summary>Xem toàn bài có tô màu</summary><div class="hl" style="margin-top:6px">' + render(ops) + '</div></details>';
  }
  boxes.forEach(function(el){ el.innerHTML = bar + html; });
}
document.addEventListener("click", function(e){ var t = e.target.closest && e.target.closest("[data-diffbase]"); if(!t) return; S.diffBase = t.getAttribute("data-diffbase"); runDiff(); });

/* ---------- Từ giữ lại ---------- */
function renderKeepCheck(){
  var keep = keepList(), d = (S.slots.draft||"").toLowerCase(), html;
  if(!keep.length) html = '<li>Chưa chọn từ giữ lại (bước 4).</li>';
  else if(!d.trim()) html = '<li>Chưa có bài.</li>';
  else html = keep.map(function(k){
    var re = new RegExp("(^|[^\\p{L}])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?=$|[^\\p{L}])", "u");
    return re.test(d) ? '<li class="g">✓ ' + esc(k) + '</li>' : '<li class="b">✗ ' + esc(k) + ' (đã mất)</li>';
  }).join("");
  document.querySelectorAll(".keepcheck").forEach(function(el){ el.innerHTML = html; });
}

/* ---------- Bước 7: trùng nguyên văn ---------- */
var lastOverlap = null;
function tokens(s){ var re=/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu, m, out=[]; while((m=re.exec(s))){ out.push({w:m[0].toLowerCase().replace(/’/g,"'"),i:m.index,e:m.index+m[0].length}); } return out; }
function runOverlap(){
  var pdfMode = S.srcMode==="pdf" && S.srcLang!=="vi";
  var a = pdfMode ? (S.slots.srcPdfText||"") : (S.slots.src||""), b = S.slots.draft||"", res = document.getElementById("ov-result"), hl = document.getElementById("ov-hl"), n = 5;
  var ovFix = document.getElementById("ov-fix");
  if(!a.trim() || !b.trim()){ lastOverlap = null; lastOvRuns = []; if(ovFix) ovFix.classList.add("hidden"); res.innerHTML = pdfMode ? '' : '<p class="small muted">Cần có văn bản nguồn tiếng Anh và bài đang làm.</p>'; hl.textContent = ""; return; }
  var ta = tokens(a), tb = tokens(b), set = new Set();
  for(var i=0;i+n<=ta.length;i++) set.add(ta.slice(i,i+n).map(function(t){return t.w;}).join(" "));
  var cov = new Array(tb.length).fill(false);
  for(var j=0;j+n<=tb.length;j++){ if(set.has(tb.slice(j,j+n).map(function(t){return t.w;}).join(" "))) for(var k=j;k<j+n;k++) cov[k] = true; }
  var c = cov.filter(Boolean).length, pct = tb.length ? 100*c/tb.length : 0; lastOverlap = pct;
  res.innerHTML = '<div class="verdict ' + (pct<20 ? 'g' : 'b') + '"><span class="big-num">' + pct.toFixed(1) + '%</span> ' + (pct<20 ? 'dưới 20%, đạt.' : 'từ 20% trở lên: cần viết lại các câu được tô đỏ.') + '</div><p class="small muted">Tính phần trăm chữ trong bài nằm trong các chuỗi từ 5 từ trở lên giống hệt nguồn. Đây là cách đo ước lượng; hỏi nhóm nếu có cách đo chính thức.</p>';
  var out = "", pos = 0, inOv = false;
  tb.forEach(function(t,idx){ var gap = b.slice(pos,t.i);
    if(cov[idx] && !inOv){ out += esc(gap) + '<span class="ov">'; inOv = true; }
    else if(!cov[idx] && inOv){ out += '</span>' + esc(gap); inOv = false; }
    else out += esc(gap);
    out += esc(b.slice(t.i,t.e)); pos = t.e; });
  if(inOv) out += "</span>"; out += esc(b.slice(pos)); hl.innerHTML = out;
  // các chỗ trùng, gom theo câu, để soạn câu lệnh sửa
  var runs = [], st = -1;
  for(var r=0;r<=tb.length;r++){ if(r<tb.length && cov[r]){ if(st<0) st = r; } else if(st>=0){ runs.push([st, r-1]); st = -1; } }
  var sents = [], sre = /[^.!?\n]+(?:[.!?]+["”’)]*)?/g, sm;
  while((sm = sre.exec(b))){ if(sm[0].trim()) sents.push({s:sm.index, e:sm.index + sm[0].length, t:sm[0].trim(), chunks:[], n:0}); }
  runs.forEach(function(rn){
    var cs = tb[rn[0]].i, ce = tb[rn[1]].e, chunk = b.slice(cs, ce);
    var sx = sents.filter(function(x){ return cs < x.e && ce > x.s; });
    sx.forEach(function(x){
      var a0 = Math.max(cs, x.s), e0 = Math.min(ce, x.e), part = b.slice(a0, e0).trim();
      var nt = tb.filter(function(t){ return t.i >= a0 && t.e <= e0; }).length;
      if(nt < 3) return;
      var trim2 = function(z){ return z.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,""); };
      x.chunks.push(trim2(part) === trim2(x.t.replace(/^[^:\n]{1,25}:\s*/,"")) || trim2(part) === trim2(x.t) ? "(cả câu)" : part); x.n += nt;
    });
  });
  lastOvRuns = sents.filter(function(x){ return x.chunks.length; }).map(function(x){ if(x.chunks.indexOf("(cả câu)")>=0) x.chunks = ["(cả câu)"]; return x; }).sort(function(p,q){ return q.n - p.n; });
  lastOvStat = {c:c, T:tb.length};
  if(ovFix){ S.fixOpen = S.fixOpen || {}; if(pct >= 20) S.fixOpen.ov = true;
    var changed = (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== b.trim();
    ovFix.classList.toggle("hidden", !(pct >= 20 || (S.fixOpen.ov && changed))); }
}
var lastOvRuns = [], lastOvStat = null;

/* ---------- Phiếu ---------- */
function fmtMin(w,speed){ var sec=Math.round(w/speed*60); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
var METRICS = [
  ["m-words","Số từ",function(sp){return sp.words;},function(){ return lastAnalysis ? String(lastAnalysis.total) : ""; }],
  ["m-paras","Số đoạn",function(sp){return sp.skill==="R" ? V().paras : "–";},function(){ return lastAnalysis && SPEC[S.spec].skill==="R" ? String(lastAnalysis.body.length) : ""; }],
  ["m-cov","Độ phủ ở mức mục tiêu (%)",function(sp){return "≥ "+sp.cov+"%";},function(){ return S.slots.pfCov||""; }],
  ["m-lvl98","Mức ở ngưỡng 96% (trang tính, tính cả off-list)",function(){return V().floorText;},function(){ var vp = currentVocab(); return vp && vp.N ? lvlName(easyLvl(vp)) : ""; }],
  ["m-lvl","Mức ở ngưỡng 95% (Text Profiler, bỏ qua off-list)",function(){return "ghi lại";},function(){ var x=S.slots.pfLvl95; return x && x!=="chưa đo" ? x : ""; }],
  ["m-fre","Flesch Reading Ease",function(){ return freWinShort() + " (mức " + S.level + ")"; },function(){ var f = currentFre(); return f && f.ok ? f.fre.toFixed(1) : ""; }],
  ["m-gloss","Số từ vượt mục tiêu / số từ cần chú giải để đạt độ phủ",function(sp){return "– / 0 (để đạt " + sp.cov + "%)";},function(){ var st = phieuStats(); return st ? st.over + " / " + st.gloss + " (ước lượng của trang)" : ""; }],
  ["m-long","Số câu trên 25 từ; câu dài nhất (từ)",function(){return "0; ≤ 25";},function(){ var st = phieuStats(); return lastAnalysis && st ? lastAnalysis.long.length + "; " + st.longest : ""; }],
  ["m-conn","Từ nối / 100 từ; đại từ / 100 từ",function(){return "> 5 / –";},function(){ var st = phieuStats(); return st ? st.conn + " / " + st.pron + " (ước lượng)" : ""; }],
  ["m-dens","Mật độ từ vựng (%)",function(sp){return sp.skill==="L" ? "thấp hơn bài Đọc" : "–";},function(){ var st = phieuStats(); return st ? st.dens + "% (ước lượng)" : ""; }],
  ["m-ov","Tỷ lệ chép nguyên văn",function(){return "< 20%";},function(){ return lastOverlap===null ? "" : lastOverlap.toFixed(1)+"%"; }],
  ["m-dur","Thời lượng ở 150 / 170 từ/phút (bài Nghe)",function(sp){return sp.skill==="L" ? (sp.speed||"") : "–";},function(){ return lastAnalysis && SPEC[S.spec].skill==="L" ? fmtMin(lastAnalysis.total,150) + " / " + fmtMin(lastAnalysis.total,170) : ""; }],
  ["m-fre0","Flesch Reading Ease bài gốc",function(){return "ghi lại";},function(){ var st = phieuStats(); return st && st.fre0 ? st.fre0 : ""; }],
  ["m-spell","Chính tả",function(){return "Một kiểu ("+S.spelling+")";},function(){ return ""; }]
];
var FIELD_IDS = ["pc-src","pc-url","pc-lic","pc-lvl","pc-b7","pc-vo","pc-dec"];
var PH_CONN = ["also","too","moreover","furthermore","in addition","besides","as well as","additionally","but","however","although","though","even though","yet","whereas","nevertheless","on the other hand","instead","despite","in contrast","in spite of","because","because of","due to","as a result","therefore","thus","so","consequently","hence","first","firstly","second","secondly","third","then","next","finally","later","meanwhile","afterwards","after that","for example","for instance","such as","if","unless","otherwise","in conclusion","overall","in short","to sum up","in other words","that is","in fact","actually","indeed","similarly","likewise","for this reason","as a consequence"];
var PH_PRON = " i me you he him she her it we us they them myself yourself himself herself itself ourselves yourselves themselves ";
var PH_FUNC = " a an the this that these those my your his her its our their some any no every each all both either neither much many more most few little several i me you he him she it we us they them myself yourself himself herself itself ourselves themselves who whom whose which what whatever whoever where when why how and or but nor so yet because although though if unless while whereas than as since until till after before of to in on at for by with from into onto about above below over under between among through during without within along across behind beyond near off out up down around against toward towards upon via per like be am is are was were been being have has had having do does did done doing will would shall should can could may might must not n't 's 're 've 'd 'll 'm there here then also too very just only even still already again ever never always often ";
var phStatsCache = null;
function phieuStats(){
  var d = S.slots.draft || ""; if(!d.trim()) return null;
  var key = d.length + "|" + qHash(d) + "|" + S.level + "|" + S.spec + "|" + qHash((S.slots.src||"") + (S.slots.srcPdfText||""));
  if(phStatsCache && phStatsCache.key === key) return phStatsCache;
  var sp = SPEC[S.spec], a = analyze(d), vp = vocabProfile(d), ti = LVL.indexOf(S.level);
  var over = vp.lemmas.filter(function(l){ return l.lv > ti; }), offs = vp.offList;
  var covered = 0; for(var i = 0; i <= ti; i++) covered += vp.counts[i];
  var cand = over.map(function(l){ return l.n; }).concat(offs.map(function(o){ return o.n; })).sort(function(x, y){ return y - x; }), gl = 0;
  while(vp.N && 100*covered/vp.N < sp.cov && gl < cand.length){ covered += cand[gl]; gl++; }
  var toks = (d.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z]+(?:'[a-z]+)?/g) || []), W = toks.length || 1, txt = " " + toks.join(" ") + " ";
  var conn = 0; PH_CONN.forEach(function(c){ var re = new RegExp(" " + c.replace(/ /g, " ") + "(?= )", "g"); conn += (txt.match(re) || []).length; });
  var pron = toks.filter(function(t){ return PH_PRON.indexOf(" " + t + " ") >= 0; }).length;
  var content = toks.filter(function(t){ var b = t.replace(/'(s|re|ve|d|ll|m|t)$/,""); return PH_FUNC.indexOf(" " + b + " ") < 0 && PH_FUNC.indexOf(" " + t + " ") < 0; }).length;
  var longest = a.sents.reduce(function(m, s){ return Math.max(m, wc(s)); }, 0);
  var src = S.srcLang === "vi" ? "" : (S.slots.src || S.slots.srcPdfText || ""), f0 = src.trim() ? fleschOf(src) : null, f1 = fleschOf(d);
  var hint = over.filter(function(l){ return keepList().map(function(k){ return k.toLowerCase(); }).indexOf(l.w) < 0; }).sort(function(x, y){ return y.lv - x.lv || y.n - x.n; }).slice(0, 8).map(function(l){ return l.w + " (" + LVL[l.lv] + ")"; });
  phStatsCache = {key:key, over:over.length + offs.length, gloss:gl, conn:(100*conn/W).toFixed(1), pron:(100*pron/W).toFixed(1), dens:(100*content/W).toFixed(1), longest:longest,
    fre0: f0 && f0.ok ? f0.fre.toFixed(1) + " (≈ " + freBand(f0.fre)[2] + ")" : "", fre1: f1 && f1.ok ? f1.fre.toFixed(1) + " (≈ " + freBand(f1.fre)[2] + ")" : "", voHint:hint, overN:over.length};
  return phStatsCache;
}
function renderMetrics(){
  var sp = SPEC[S.spec];
  document.getElementById("pc-metrics").innerHTML = METRICS.map(function(m){
    return '<tr><td>'+esc(m[1])+'</td><td>'+esc(m[2](sp))+'</td><td><input type="text" id="'+m[0]+'-1" aria-label="'+esc(m[1])+' lần 1"></td><td><input type="text" id="'+m[0]+'-2" aria-label="'+esc(m[1])+' lần 2"></td></tr>';
  }).join("");
  bindFields(); fillAuto();
}
function fillAuto(){
  METRICS.forEach(function(m){ var el = document.getElementById(m[0]+"-1"); if(el){ var a = m[3](); el.placeholder = a ? "tự điền: " + a : ""; } });
  var st = phieuStats(), vo = document.getElementById("pc-vo"); if(vo) vo.placeholder = keepList().join(", ");
  var vh = document.getElementById("pc-vohint");
  if(vh) vh.textContent = !st ? "" : (st.voHint.length ? "Gợi ý từ trên mức " + S.level + " trong bài (nên giữ 2–3 từ để đặt câu hỏi từ vựng): " + st.voHint.join(", ") + "." : "Bài không có từ nào trên mức " + S.level + " (theo danh sách CEFR-J): câu hỏi từ vựng sẽ hỏi từ ở mức " + S.level + " trở xuống.");
  var lv = document.getElementById("pc-lvl"); if(lv) lv.placeholder = pcLvlAuto() ? "tự điền: " + pcLvlAuto() : "";
  var b7 = document.getElementById("pc-b7"); if(b7 && !b7.value){ var ok = ["nd-1","nd-2","nd-3"].every(function(g){ return S.gates && S.gates[g]; }); b7.options[0].textContent = ok ? "Có (theo bước 7)" : "Chưa (bước 7 chưa xong)"; }
}
function pcLvlAuto(){
  var o = "", a = "", st = null; try{ o = sbSummary("o"); a = sbSummary("a"); }catch(e){}
  try{ st = phieuStats(); }catch(e){}
  var fl = st && (st.fre0 || st.fre1) ? "; Flesch " + (st.fre0 || "?") + " / " + (st.fre1 || "?") : "";
  if(!o && !a && !fl) return "";
  return "bài gốc " + (o || "chưa nhập") + " / bài đã chỉnh " + (a || "chưa nhập") + fl;
}
function bindFields(){
  var ids = FIELD_IDS.slice(); METRICS.forEach(function(m){ ids.push(m[0]+"-1", m[0]+"-2"); });
  ids.forEach(function(id){
    var el = document.getElementById(id); if(!el || el.dataset.bound) return; el.dataset.bound = "1";
    if(S.fields[id]!==undefined) el.value = S.fields[id];
    var h = function(){ var sc = el.closest(".screen"); if(sc && typeof wfCanEditScreen === "function" && !wfCanEditScreen(sc.id)){ el.value = S.fields[id] || ""; toast("Chế độ xem: bạn không sửa được ô này."); return; } S.fields[id] = el.value; save(); if(/^pc-(src|url|lic)$/.test(id) && typeof wfRender === "function"){ clearTimeout(bindFields.t); bindFields.t = setTimeout(wfRender, 300); } }; el.addEventListener("input", h); el.addEventListener("change", h);
  });
}
function phieuText(){
  var sp = SPEC[S.spec], g = function(id){ var e = document.getElementById(id); return e ? e.value : ""; };
  var L = ["PHIẾU THỰC HÀNH · " + sp.label + " · Mức mục tiêu: " + S.level + (S.code ? " · Mã bài: " + S.code : "") + (S.slots.topic ? " · Chủ đề: " + S.slots.topic : ""),
    "Nguồn: " + g("pc-src"), "Link, ngày truy cập: " + g("pc-url"), "Giấy phép: " + g("pc-lic"), "Level bài gốc / đã chỉnh: " + (g("pc-lvl") || pcLvlAuto()), "Đã đối chiếu sự kiện (B7)? " + (g("pc-b7") || (["nd-1","nd-2","nd-3"].every(function(x){ return S.gates && S.gates[x]; }) ? "Có" : "Chưa")), "", "Chỉ số | Yêu cầu | Lần đo 1 | Lần đo 2"];
  METRICS.forEach(function(m){ L.push(m[1] + " | " + m[2](sp) + " | " + (g(m[0]+"-1") || m[3]()) + " | " + g(m[0]+"-2")); });
  L.push("", "Từ giữ lại để hỏi đoán nghĩa: " + (g("pc-vo") || keepList().join(", ")), "Quyết định: " + g("pc-dec"));
  try{ L.push("", "Checklist ngữ liệu: " + clSummaryLine("NL") + ".", "Checklist câu hỏi: " + ((S.slots.questions||"").trim() ? clSummaryLine("CH") : "chưa có câu hỏi") + "."); }catch(e){}
  return L.join("\n");
}

/* ---------- Wire up ---------- */
function bindSettings(){
  var map = {"set-spec":"spec","set-level":"level","set-spelling":"spelling","set-floor":"floor","set-paras":"paras","set-poly":"poly","set-code":"code"};
  Object.keys(map).forEach(function(id){
    var el = document.getElementById(id), k = map[id];
    if(S[k]!==undefined && S[k]!==null) el.value = S[k];
    el.addEventListener(el.tagName==="SELECT" ? "change" : "input", function(){
      S[k] = el.value;
      if(k==="spec") applyLevelBySpec();
      save();
      renderSpec(); renderQ(); if(k==="spec"){ applyBranch(); renderAllAI(); } renderAnchors();
      renderMetrics(); runLength(); runBand(); refreshText(); try{ clRender(); }catch(e){} updateStepper();
    });
  });
  document.querySelectorAll('input[name="srclang"]').forEach(function(r){
    r.checked = (r.value === (S.srcLang||"en"));
    r.addEventListener("change", function(){ if(r.checked){ S.srcLang = r.value; save(); applyLang(); } });
  });
  document.querySelectorAll('input[name="srcmode"]').forEach(function(r){
    r.checked = (r.value === (S.srcMode||"text"));
    r.addEventListener("change", function(){ if(r.checked){ S.srcMode = r.value; save(); applyLang(); } });
  });
}
function applyLang(){
  var lang = S.srcLang||"en", mode = S.srcMode||"text";
  document.querySelectorAll("[data-srcshow]").forEach(function(el){
    var t = el.getAttribute("data-srcshow"), on;
    if(t==="text-en") on = mode==="text" && lang==="en";
    else if(t==="text-vi") on = mode==="text" && lang==="vi";
    else if(t==="pdf") on = mode==="pdf";
    else if(t==="pdf-en") on = mode==="pdf" && lang==="en";
    else if(t==="vi") on = lang==="vi";
    el.classList.toggle("hidden", !on);
  });
  refreshText(); runOverlap();
}
function bindGates(){
  document.querySelectorAll("input[data-gate]").forEach(function(i){
    var k = i.getAttribute("data-gate"); i.checked = !!S.gates[k];
    i.addEventListener("change", function(){ S.gates[k] = i.checked; save(); updateStepper(); });
  });
}
function init(){
  applyOutputRules();
  load(); S.slots = S.slots||{}; S.fixOpen = S.fixOpen||{};
  if(!SPEC[S.spec]) S.spec = "R2";
  var h = location.hash.slice(1); if(h && document.getElementById(h) && document.getElementById(h).classList.contains("screen")) S.step = h;
  if(!S.step) S.step = "bat-dau";
  document.querySelectorAll("[data-field]").forEach(renderField);
  renderAllAI(); bindSettings(); bindGates(); bindNav(); applyLang();
  renderSpec(); applyBranch(); renderMetrics();
  runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); refreshText(); fillAuto(); renderB7(); renderRecheck(); renderAnchors(); renderQ(); bindQ();
  document.getElementById("b7-apply").addEventListener("click", applyB7);
  document.querySelectorAll("[data-copyslot]").forEach(function(b){ var lab = b.textContent; b.addEventListener("click", function(){ var t = S.slots[b.getAttribute("data-copyslot")]||""; if(!t.trim()){ b.textContent = "Chưa có bài"; setTimeout(function(){ b.textContent = lab; }, 1800); return; } copyText(t, b, lab); }); });
  document.getElementById("pc-copy").addEventListener("click", function(e){ fillAuto(); copyText(phieuText(), e.currentTarget, "Sao chép phiếu"); });
  document.getElementById("nop").addEventListener("focusin", fillAuto);
  var panel = document.getElementById("clearpanel"), cb = document.getElementById("clearbtn");
  function togglePanel(open){ panel.classList.toggle("hidden", !open); cb.setAttribute("aria-expanded", open ? "true" : "false"); }
  cb.addEventListener("click", function(){ togglePanel(panel.classList.contains("hidden")); });
  document.getElementById("clear-cancel").addEventListener("click", function(){ togglePanel(false); });
  bindFilePanel(togglePanel);
  document.getElementById("clear-all").addEventListener("click", function(){ clearData(true); togglePanel(false); toast("Đã xoá hết dữ liệu. Bắt đầu lại từ bước 1."); });
}
var toastT;
function toast(msg){ var t = document.getElementById("toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.add("hidden"); }, 2600); }
function clearData(all){
  S.gates = {}; S.fields = {}; S.slots = {}; S.code = ""; S.l1slot = "1"; S.qman = {}; S.fixOpen = {}; S.srcLang = "en"; S.srcMode = "text"; S.b7before = null; S.lib = null; S.notes = []; S.cl = {}; S.wf = null; S.map = null; S.prj = null; delete S.libCopyTitle; delete S.qBlindFor;
  if(all){
    S.spec = "R2"; S.level = "B2"; S.spelling = "Anh–Anh"; S.floor = "0"; S.paras = "5"; S.poly = "2–3";
    try{ localStorage.removeItem(KEY); }catch(e){}
    var setv = {"set-spec":"R2","set-level":"B2","set-spelling":"Anh–Anh","set-floor":"0","set-paras":"5","set-poly":"2–3"};
    Object.keys(setv).forEach(function(id){ var el = document.getElementById(id); if(el) el.value = setv[id]; });
  }
  save();
  document.getElementById("set-code").value = "";
  document.querySelectorAll("input[data-gate]").forEach(function(i){ i.checked = false; });
  document.querySelectorAll("[data-slot]").forEach(function(el){ el.value = el.tagName==="SELECT" ? el.options[0].value : ""; });
  document.querySelectorAll(".splitmsg").forEach(function(el){ el.textContent = ""; });
  FIELD_IDS.forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ""; });
  document.querySelectorAll('input[name="srclang"]').forEach(function(r){ r.checked = r.value==="en"; });
  document.querySelectorAll('input[name="srcmode"]').forEach(function(r){ r.checked = r.value==="text"; });
  document.querySelectorAll(".navmsg").forEach(function(el){ el.textContent = ""; });
  lastAnalysis = null; lastOverlap = null; lastVocab = null; lastFre = null;
  renderSpec(); applyBranch(); renderAllAI(); applyLang(); renderMetrics();
  runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); refreshText(); renderB7(); renderRecheck(); renderAnchors(); renderQ();
  show("bat-dau");
}

;

/* ================= Bước soạn câu hỏi (theo QĐ 730, mục 2.1.2–2.1.3 và 2.2.2–2.2.4) ================= */
var LEVEL_BY_SPEC = {
  W1:{level:"B1", floor:"0", why:"ngữ liệu đầu vào của bài Viết viết ở trình độ bậc 3 (QĐ 730)"}, W2:{level:"B1", floor:"0", why:"ngữ liệu đầu vào của bài Viết viết ở trình độ bậc 3 (QĐ 730)"},
  S1:{level:"B1", floor:"0", why:"câu hỏi Nói dùng ngôn ngữ thí sinh bậc 3 hiểu được"}, S2:{level:"B1", floor:"0", why:"câu hỏi Nói dùng ngôn ngữ thí sinh bậc 3 hiểu được"}, S3:{level:"B1", floor:"0", why:"câu hỏi Nói dùng ngôn ngữ thí sinh bậc 3 hiểu được"},
  R1:{level:"B1", floor:"0", why:"văn bản bậc 3"}, R2:{level:"B2", floor:"0", why:"văn bản bậc 4"}, R3:{level:"B2", floor:"0", why:"văn bản bậc 4"}, R4:{level:"C1", floor:"0", why:"văn bản bậc 5"},
  L1:{level:"B1", floor:"1", why:"ngữ liệu bậc 2 và bậc 3"},
  L2a:{level:"B1", floor:"0", why:"Part 2 có 3 hội thoại ở bậc 3, 4, 5; hội thoại 1 lấy bậc 3"}, L2b:{level:"B2", floor:"0", why:"Part 2 có 3 hội thoại ở bậc 3, 4, 5; hội thoại 2 lấy bậc 4"}, L2c:{level:"C1", floor:"0", why:"Part 2 có 3 hội thoại ở bậc 3, 4, 5; hội thoại 3 lấy bậc 5"},
  L3a:{level:"B2", floor:"0", why:"Part 3 có 2 bài bậc 4 và 1 bài bậc 5; bài nói 1 lấy bậc 4"}, L3b:{level:"B2", floor:"0", why:"Part 3 có 2 bài bậc 4 và 1 bài bậc 5; bài nói 2 lấy bậc 4"}, L3c:{level:"C1", floor:"0", why:"Part 3 có 2 bài bậc 4 và 1 bài bậc 5; bài nói 3 lấy bậc 5"}
};
function applyLevelBySpec(){
  var d = LEVEL_BY_SPEC[S.spec]; if(!d) return;
  S.level = d.level; S.floor = d.floor;
  var l = document.getElementById("set-level"), f = document.getElementById("set-floor");
  if(l) l.value = d.level; if(f) f.value = d.floor;
}
function levelHint(){
  var d = LEVEL_BY_SPEC[S.spec]; if(!d) return "";
  var same = S.level===d.level && String(S.floor)===d.floor;
  return "Theo QĐ 730: " + d.why + " → mức " + d.level + (d.floor==="1" ? " (được dễ hơn 1 bậc)" : "") + ". " + (same ? "Trang đã tự chọn; chỉ đổi nếu nhóm quy định khác." : "Bạn đang chọn khác mức này.");
}

// Đọc: mã câu hỏi theo VSTEP Reading Test Guidelines; mức độ theo QĐ 730
var RCODE = {
  "RE":"câu hỏi quy chiếu (từ được hỏi là đại từ)",
  "DE":"câu hỏi chi tiết (phương án là chi tiết, thông tin cụ thể tường minh hoặc hàm ẩn)",
  "DE[P]":"câu hỏi chi tiết, phương án được diễn đạt lại (paraphrase)",
  "MI":"ý chính của cả bài",
  "MI[P]":"ý chính của một đoạn",
  "IN":"suy luận",
  "VO":"từ vựng (đoán nghĩa từ)",
  "VO(ID)":"từ vựng là thành ngữ",
  "OP":"quan điểm, ý kiến, thái độ của tác giả (nói thẳng hoặc ngầm)",
  "TO":"giọng điệu",
  "RP":"mục đích tu từ, chức năng (vì sao tác giả nhắc tới X)",
  "LO":"định vị thông tin (đoạn nào chứa thông tin)",
  "IS":"chèn câu"
};
var RLVNOTE = {
  "B3 thấp":"thông tin tường minh, diễn đạt bằng từ vựng và cấu trúc bậc 3; quy chiếu ngay trước hoặc sau, ít hoặc không có nhiễu",
  "B3 trung bình":"thông tin cụ thể ở một số đoạn, hoặc thông tin tường minh được diễn đạt khác so với bài",
  "B3 cao":"quy chiếu phức tạp có yếu tố gây nhiễu; ý chính của một đoạn; ý quan trọng trong bài",
  "B4 thấp":"từ có nhiều nghĩa; quan điểm, thái độ nói thẳng; ý chính (văn bản bậc 4, cấu trúc rõ ràng)",
  "B4 trung bình":"mục đích, chức năng của văn bản; thông tin rải rác phải đọc cả bài; lô-gíc câu dựa vào từ liên kết; quy chiếu phức tạp",
  "B4 cao":"có yếu tố hàm ngôn: chi tiết được diễn giải khác, lập trường hoặc dụng ý tác giả, giọng điệu, nội dung chính của cả bài",
  "B5 thấp":"hàm ý một câu hoặc chi tiết; mục đích của một thông tin hoặc lập luận; thành ngữ, cách nói thông tục; diễn giải khác có từ vựng bậc 5",
  "B5 trung bình":"chi tiết tinh tế, phức tạp về thái độ, suy diễn, ý kiến; câu gốc, câu diễn đạt lại và phương án dùng từ vựng bậc 5",
  "B5 cao":"quan điểm, thái độ hàm ngôn; hàm ý trong văn phong phức tạp hoặc chuyên ngành cao; thông tin rải rác trong cả bài; lô-gíc của một lập luận"
};
// mẫu câu hỏi theo mã (VSTEP Reading Test Guidelines): tài liệu tập huấn, tải từ config/specs khi đăng nhập
var R_STEMS = {};
// Tiểu kĩ năng Nghe
var LSK = {
  l1det:[["DE"],"Nhận biết thông tin chi tiết được diễn đạt rõ ràng","det"],
  l1main:[["MI"],"Nhận biết ý chính của thông báo","main"],
  l1instr:[["DE"],"Nghe và làm theo hướng dẫn; thông tin chi tiết có thể được diễn đạt gián tiếp trong thông báo hoặc tin nhắn về một đề tài cụ thể","det"],
  l1inf:[["IN"],"Nghe và suy luận đơn giản về ngữ cảnh","inf"],
  mainClear:[["MI"],"Nhận biết được ý chính nếu được diễn đạt rõ ràng","main"],
  mainCx:[["MI"],"Nhận biết được ý chính của cuộc đối thoại về chủ đề tương đối quen thuộc, với ngôn ngữ và lập luận phức tạp","main"],
  mainInd:[["MI"],"Nhận biết được ý chính khi được diễn đạt loanh quanh","main"],
  detClear:[["DE"],"Nhận biết thông tin chi tiết được diễn đạt rõ ràng","det"],
  detCx:[["DE"],"Nhận biết thông tin chi tiết được diễn đạt bằng ngôn ngữ phức tạp","det"],
  attClear:[["OP"],"Suy luận về thái độ, quan điểm của người nói khi thể hiện rõ ràng qua giọng điệu và ngôn ngữ","inf"],
  func:[["RP"],"Nhận biết chức năng của một diễn ngôn, mục đích nói của người nói","inf"],
  def:[["DE"],"Nghe giải nghĩa từ hoặc khái niệm mới","det"],
  struct:[["MI"],"Nhận biết được ý chính hoặc cấu trúc của bài thuyết trình phức tạp về cả nội dung và ngôn ngữ","main"],
  purpHid:[["RP"],"Nhận biết mục đích nói của người nói khi không được thể hiện rõ ràng","inf"],
  attHid:[["OP"],"Suy luận được thái độ và quan điểm người nói khi không được thể hiện rõ ràng","inf"],
  detCplx:[["DE"],"Nhận diện và hiểu được các thông tin chi tiết và phức tạp","det"],
  idiom:[["ID"],"Nghe hiểu thành ngữ","id"]
};
// Bảng phân bố: [bậc, mức, số câu, [tiểu kĩ năng]]. Bài Đọc (VSTEP Reading Specifications, tài liệu tập huấn) tải từ config/specs khi đăng nhập.
var QBP = {
  // Nghe Part 1: 8 thông báo, mỗi bài 1 câu
  L1:[["B3","thấp",1,["l1det"]],["B3","thấp",1,["l1det"]],["B3","thấp",1,["l1det"]],["B3","trung bình",1,["l1main"]],["B3","trung bình",1,["l1main"]],["B3","cao",1,["l1instr"]],["B4","thấp",1,["l1main"]],["B4","thấp",1,["l1inf"]]],
  // Nghe Part 2, Part 3: QĐ 730 chỉ quy định cho cả phần; chia theo bài là gợi ý của trang
  L2a:[["B3","trung bình",1,["mainClear"]],["B3","thấp",1,["detClear"]],["B3","trung bình",1,["detClear"]],["B3","cao",1,["detClear"]]],
  L2b:[["B3","trung bình",1,["detClear"]],["B3","cao",1,["detClear"]],["B4","thấp",1,["mainCx"]],["B4","trung bình",1,["attClear"]]],
  L2c:[["B4","cao",1,["detCx"]],["B5","thấp",1,["mainInd"]],["B5","thấp",1,["func"]],["B5","trung bình",1,["func"]]],
  L3a:[["B4","cao",1,["struct"]],["B4","thấp",1,["def"]],["B3","cao",2,["detCplx"]],["B4","trung bình",1,["detCplx"]]],
  L3b:[["B4","cao",1,["struct"]],["B4","thấp",1,["detCplx"]],["B4","trung bình",1,["detCplx"]],["B5","thấp",1,["purpHid"]],["B5","trung bình",1,["attHid"]]],
  L3c:[["B4","cao",1,["detCplx"]],["B5","thấp",1,["detCplx"]],["B5","thấp",1,["purpHid"]],["B5","trung bình",1,["idiom"]],["B5","cao",1,["attHid"]]]
};
var QPART = {
  L1:"Cả Part 1 (8 câu, mỗi thông báo 1 câu): ý chính 2 câu bậc 3 trung bình, 1 câu bậc 4 thấp; chi tiết 3 câu bậc 3 thấp; làm theo hướng dẫn 1 câu bậc 3 cao; suy luận về ngữ cảnh 1 câu bậc 4 thấp.",
  L2:"Cả Part 2 (12 câu, 3 hội thoại × 4 câu): ý chính 1 câu bậc 3 TB, 1 câu bậc 4 thấp, 1 câu bậc 5 thấp; chi tiết rõ ràng 1 câu bậc 3 thấp, 2 câu bậc 3 TB, 2 câu bậc 3 cao; chi tiết ngôn ngữ phức tạp 1 câu bậc 4 cao; thái độ, quan điểm 1 câu bậc 4 TB; chức năng, mục đích nói 1 câu bậc 5 TB, 1 câu bậc 5 thấp. QĐ 730 không chia theo từng hội thoại: cách chia cho bài này ở trên là gợi ý của nhóm soạn đề (hội thoại 1, 2, 3 ứng với bậc 3, 4, 5).",
  L3:"Cả Part 3 (15 câu, 3 bài × 5 câu): giải nghĩa từ hoặc khái niệm mới 1 câu bậc 4 thấp; ý chính hoặc cấu trúc 2 câu bậc 4 cao; mục đích nói 2 câu bậc 5 thấp; thái độ, quan điểm 1 câu bậc 5 TB, 1 câu bậc 5 cao; chi tiết phức tạp 2 câu bậc 3 cao, 1 câu bậc 4 thấp, 2 câu bậc 4 TB, 1 câu bậc 4 cao, 1 câu bậc 5 thấp; thành ngữ 1 câu bậc 5 TB. QĐ 730 không chia theo từng bài: cách chia cho bài này ở trên là gợi ý của nhóm soạn đề (bài 1, 2 bậc 4; bài 3 bậc 5)."
};
var LV_CEFR = {B3:"B1", B4:"B2", B5:"C1"};
function qIsR(){ return SPEC[S.spec].skill==="R"; }
function qSK(){ return LSK; }
function qNormCode(c){
  c = (c||"").toUpperCase().replace(/\s+/g,"").replace(/[ᴾᴵᴰ]/g, function(x){ return {"ᴾ":"P","ᴵ":"I","ᴰ":"D"}[x]; });
  if(/^INF?$/.test(c)) return "IN";
  if(/^DE[\[\(\^]?P[\]\)]?$/.test(c)) return "DE[P]";
  if(/^MI[\[\(\^]?P[\]\)]?$/.test(c)) return "MI[P]";
  if(/^VO[\[\(\^]?ID[\]\)]?$/.test(c)) return "VO(ID)";
  return c;
}
function qRows(){
  var rows = QBP[S.spec] || [];
  if(S.spec==="L1"){ var i = Math.max(0, Math.min(7, (parseInt(S.l1slot,10)||1) - 1)); return [rows[i]]; }
  return rows;
}
// không có bảng phân bố: bài Đọc thì bảng nằm trong đặc tả riêng (chưa tải cho tài khoản này), không phải lỗi chọn phần thi
function qbpWhy(){
  if(qRows().length) return "";
  if(qIsR() && typeof SPECS !== "undefined" && !SPECS.loaded) return "Bảng phân bố câu hỏi bài Đọc thuộc đặc tả riêng của VNCETA (tài liệu tập huấn) nên không có sẵn trong trang. Tài khoản này chưa được xem đặc tả riêng" + (SPECS.err ? " (" + SPECS.err + ")" : "") + ". Nhờ Quản trị bật \"Cho xem đặc tả riêng\" cho tài khoản ở trang Nhóm › Thành viên (hoặc đổi sang Thành viên nội bộ), rồi tải lại trang.";
  return "Phần thi này chưa có bảng phân bố câu hỏi. Kiểm tra lại phần thi đã chọn ở bước Bắt đầu.";
}
function qExpected(){ return qRows().reduce(function(s,r){ return s + r[2]; }, 0); }
function qRowCodes(r){ return qIsR() ? r[3] : r[3].map(function(k){ return LSK[k][0][0]; }); }
function qBlueprintText(){
  if(qIsR()) return qRows().map(function(r){
    var k = r[0] + " " + r[1];
    return "- " + r[2] + " câu bậc " + r[0].slice(1) + " mức " + r[1] + " (" + LV_CEFR[r[0]] + "." + ({"thấp":1,"trung bình":2,"cao":3})[r[1]] + "), chọn mã trong: " + r[3].join(", ") + ". Độ khó theo QĐ 730: " + RLVNOTE[k] + ".";
  }).join("\n") + "\nÝ nghĩa các mã: " + Object.keys(RCODE).map(function(c){ return c + " = " + RCODE[c]; }).join("; ") + ".";
  return qRows().map(function(r){
    return "- " + r[2] + " câu bậc " + r[0].slice(1) + ", mức " + r[1] + " (" + LV_CEFR[r[0]] + "): " + r[3].map(function(k){ return LSK[k][1] + " [mã " + LSK[k][0].join(" hoặc ") + "]"; }).join("; ") + ".";
  }).join("\n");
}
var R_RULES = {
  RE:"Câu hỏi quy chiếu (RE): từ được hỏi phải là đại từ; mỗi phương án không quá 3 từ, kể cả mạo từ; các phương án sai phải có trong bài và đúng ngữ pháp khi thay vào chỗ đại từ. Quy chiếu phức tạp cần có yếu tố gây nhiễu (từ khó, cấu trúc khó, vị trí của danh từ và đại từ).",
  VO:"Đoán nghĩa từ (VO, VO(ID)): từ hoặc cụm từ được hỏi phải có nguyên văn trong bài; VO ở bậc 4 thấp hỏi từ có nhiều nghĩa, VO(ID) hỏi thành ngữ hoặc cách nói thông tục.",
  LO:"Định vị thông tin (LO): bốn phương án là số đoạn (Paragraph 2, Paragraph 3…); đáp án là đoạn chứa thông tin.",
  DEsome:"Thông tin cụ thể trong một số đoạn (DE, bậc 3 trung bình): thông tin được hỏi rõ ràng, tường minh, cụ thể, được nhắc tới ở nhiều chỗ trong bài chứ không chỉ trong một đoạn; các phương án sai phải rõ ràng sai và phải có trong bài (tên riêng, địa điểm, sự kiện…); từ vựng và cấu trúc của câu hỏi và phương án ở bậc 3. Mẫu: According to the passage, who does X? / what country is mentioned as…?",
  DEP:"Thông tin diễn đạt khác (DE[P]): thông tin được hỏi rõ ràng, có trong bài nhưng được diễn đạt khác đi; từ vựng, cấu trúc của thông tin gốc, câu hỏi và phương án ở bậc 3 hoặc 4. Ba phương án sai: (1) thông tin đúng nhưng không liên quan; (2) dùng một vài từ của bài nhưng hiểu sai; (3) liên quan tới đáp án về nghĩa nhưng quá rộng hoặc quá hẹp. Mẫu: What made X happen?",
  IS:"Chèn câu (IS): CÂU CHÈN là một câu có sẵn trong bài, chép nguyên văn; trang sẽ tự rút câu này ra khỏi bài và đặt [A] [B] [C] [D] sau các câu ghi ở dòng VỊ TRÍ. Vị trí đúng là ngay sau câu đứng trước câu chèn. Các vị trí sai không được sai hiển nhiên về ngữ pháp và phải liên hệ với câu chèn ở các mức độ khác nhau; A, B, C, D xếp theo thứ tự xuất hiện trong bài. Mẫu: In which space (marked A, B, C and D in the passage) will the following sentence fit?",
  RP:"Mục đích của một thông tin (RP, bậc 5 thấp): thông tin được hỏi phải là hàm ý, không phải hiển ngôn. Ba phương án sai theo khuôn (1)(2)(3) của DE[P]. Mẫu: Why did the writer mention…?",
  IN:"Hàm ý, suy luận (IN): có yếu tố hàm ngôn. Ba phương án sai theo khuôn (1)(2)(3) của DE[P]. Mẫu: What does the writer mean when writing \"…\"? / What does the writer imply by…? / What does the writer most probably support?",
  SCAT:"Thông tin rải rác trong cả văn bản (DE ở bậc 4–5): thông tin liên quan được thảo luận trong toàn bài, không phải một chi tiết cụ thể. Ba phương án sai: (1) thông tin đúng nhưng không liên quan; (2) thông tin liên quan nhưng sai một phần; (3) gần đúng nhất nhưng có một khía cạnh không có trong bài. Mẫu: According to the passage, why does X happen? / what happens to X? / how is X done?"
};
var L_RULES = {
  det:{B3:"Chi tiết, bậc 3: mỗi phương án tối đa 7 từ (tính cả con số). Ba phương án sai: (1) một chi tiết không liên quan, không được nhắc trong bài; (2) một chi tiết không liên quan nhưng chứa một từ đọc gần giống từ khoá trong bài; (3) một chi tiết không chính xác. Đáp án: chi tiết đúng được diễn đạt lại đôi chút (giữ khoảng 50% số từ của bài nghe).",
       B4:"Chi tiết, bậc 4: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) chi tiết sai hoàn toàn; (2) chi tiết sai một phần; (3) chi tiết đúng nhưng người nói không đề cập. Đáp án: chi tiết đúng được diễn đạt lại.",
       B5:"Chi tiết, bậc 5: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) chi tiết đúng nhưng người nói không đề cập; (2) chi tiết đúng nhưng bị diễn đạt lại sai; (3) chi tiết không chính xác và diễn đạt lại sai. Đáp án: chi tiết đúng, diễn đạt lại đúng."},
  main:{B3:"Ý chính, bậc 3: mỗi phương án tối đa 7 từ. Ba phương án sai: (1) một chi tiết không được đề cập; (2) một chi tiết chứa từ đọc gần giống từ khoá; (3) một ý rộng hơn ý được đề cập. Đáp án: một phần ý chính được diễn đạt lại (khoảng 50% số từ của bài nghe).",
        B4:"Ý chính, bậc 4: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) một chi tiết chứa từ đọc gần giống từ khoá; (2) một ý rộng hơn ý được đề cập; (3) một ý chính không chính xác. Đáp án: ý chính được diễn đạt lại hoàn toàn.",
        B5:"Ý chính, bậc 5: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) một chi tiết quan trọng trong bài; (2) một ý phụ của bài; (3) một ý phụ khác. Đáp án: ý chính được diễn đạt lại hoàn toàn."},
  inf:{B3:"Suy luận, mục đích, thái độ, chức năng ngôn ngữ, bậc 3: mỗi phương án tối đa 7 từ. Ba phương án sai: (1) chứa một từ khoá của bài và diễn đạt khác ý người nói; (2) chứa một từ khoá và diễn đạt điều không được đề cập; (3) chứa một từ đọc gần giống từ khoá và diễn đạt ý không được đề cập. Đáp án: chứa từ khoá và diễn đạt hàm ý của người nói.",
       B4:"Suy luận, mục đích, thái độ, chức năng ngôn ngữ, bậc 4: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) chứa một từ khoá và diễn đạt khác ý người nói; (2) chứa một từ khoá và diễn đạt điều không được đề cập; (3) diễn đạt lại sai hàm ý của người nói. Đáp án: diễn đạt lại đúng hàm ý.",
       B5:"Suy luận, mục đích, thái độ, chức năng ngôn ngữ, bậc 5: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) chứa một từ khoá và diễn đạt khác ý người nói; (2) chứa một từ khoá và diễn đạt điều không được đề cập; (3) diễn đạt lại sai hàm ý của người nói. Đáp án: diễn đạt lại đúng hàm ý."},
  id:{B5:"Thành ngữ, bậc 5: mỗi phương án tối đa 9 từ. Ba phương án sai: (1) một nghĩa của cụm từ nhưng không hợp ngữ cảnh; (2) và (3) những khái niệm có trong bài nhưng không đúng nghĩa của cụm từ. Đáp án: nghĩa chính xác của cụm từ trong ngữ cảnh."}
};
var L_STEMS = {
  det:"What does the man/woman/speaker say about…? / What does the man/woman want? / What will happen if…? / What can you do when…? / Where…? When…? Which…? Who…? What type…? / How does the speaker describe…? / How long…? How often…? How much…? How many…?",
  main:"What is the main idea of the conversation/talk? / What is the conversation/talk mainly about? / What are the speakers doing? What is the main purpose of the conversation? (ví dụ: giới thiệu, tranh luận, quảng cáo, mặc cả)",
  inf:"What does the speaker say about…? / Who are the speakers most likely? / Where are the speakers most likely?",
  id:"What does the speaker mean/imply by saying \"…\"? / What does \"…\" probably mean according to the speaker?"
};
var Q_TIER_LEGEND = "Mỗi dòng ghi nguồn: [QĐ 730] = Quyết định 730/QĐ-BGDĐT; [Specs] = bảng phân bố, VSTEP Reading Test Guidelines, yêu cầu của dự án, hướng dẫn của Bộ qua góp ý đề; [Đề xuất] = quy ước của nhóm và các buổi tập huấn. Khi hai yêu cầu đá nhau: theo [QĐ 730] trước, rồi [Specs], rồi [Đề xuất].";
// số thứ tự câu, lượt lời tại một vị trí ký tự (để biết hai căn cứ có nằm cùng một câu, một lượt không)
function qSentAt(t, pos){ var m = String(t||"").slice(0, Math.max(0, pos)).match(/[.!?…]["”’)]?(?=\s|$)|\n/g); return m ? m.length : 0; }
function qTurnAt(t, pos){ var m = String(t||"").slice(0, Math.max(0, pos)).match(/\n/g); return m ? m.length : 0; }
function qRulesText(){
  var sk = qSK(), out = [], seen = {};
  var QD = "[QĐ 730] ", SP = "[Specs] ", DX = "[Đề xuất] ";
  out.push(Q_TIER_LEGEND);
  if(qIsR()){
    var codes = {}, at = {};
    qRows().forEach(function(r){ r[3].forEach(function(c){ codes[c] = 1; at[c + " " + r[0] + " " + r[1]] = 1; }); });
    if(codes.RE) out.push(QD + R_RULES.RE);
    if(codes.VO || codes["VO(ID)"]) out.push(QD + R_RULES.VO);
    if(codes.LO) out.push(QD + R_RULES.LO);
    if(at["DE B3 trung bình"]) out.push(QD + R_RULES.DEsome);
    if(codes["DE[P]"]) out.push(QD + R_RULES.DEP);
    if(codes.IS) out.push(QD + R_RULES.IS);
    if(at["RP B5 thấp"]) out.push(QD + R_RULES.RP);
    if(codes.IN) out.push(QD + R_RULES.IN);
    if(at["DE B4 cao"] || at["DE B4 trung bình"]) out.push(QD + R_RULES.SCAT);
    out.push(DX + "Các mã còn lại: phương án sai phải liên quan tới bài nhưng sai rõ ràng khi đối chiếu với bài; chỉ một đáp án đúng.");
    var stc = Object.keys(codes).filter(function(c){ return R_STEMS[c]; }); if(stc.length) out.push(SP + "Mẫu câu hỏi theo mã (VSTEP Reading Test Guidelines): " + stc.map(function(c){ return c + ": " + R_STEMS[c]; }).join(" | "));
  } else {
    qRows().forEach(function(r){ r[3].forEach(function(k){ var t = sk[k][2], key = t + r[0]; if(seen[key]) return; seen[key] = 1; out.push(QD + (L_RULES[t][r[0]] || L_RULES[t].B5)); }); });
    var ts = {}; qRows().forEach(function(r){ r[3].forEach(function(k){ ts[sk[k][2]] = 1; }); });
    out.push(QD + "Mẫu câu hỏi: " + Object.keys(ts).map(function(t){ return L_STEMS[t]; }).join(" | "));
    if(SPEC[S.spec].grp !== 1) out.push(DX + "Vị trí câu hỏi trong bài nghe: không hỏi vào thông tin ở khoảng 10–15 giây đầu (khoảng 25–40 từ đầu), để thí sinh quen giọng và bối cảnh; các câu rải đều theo tiến trình bài, hai câu liền nhau không hỏi vào hai chỗ quá sát nhau; câu cuối hỏi vào thông tin gần cuối bài, không để thừa một đoạn dài cuối bài không có câu hỏi.");
  }
  out.push(QD + "Với dạng câu có khuôn ba phương án sai (1), (2), (3): ba phương án sai phải lần lượt thuộc đúng ba loại đó, mỗi loại một phương án (riêng câu thành ngữ bài Nghe: loại (2) và (3) giống nhau); ghi số loại ở dòng LOẠI.");
  out.push(DX + "Bốn phương án cùng một dạng ngữ pháp (cùng là cụm danh từ, cùng bắt đầu bằng How to…, cùng là câu bắt đầu bằng It/They…, v.v.) và viết đúng ngữ pháp; không để một phương án khác dạng hẳn ba phương án còn lại, nhất là đáp án, vì thí sinh đoán được mà không cần " + (qIsR() ? "đọc" : "nghe") + " bài.");
  out.push(DX + "Câu hỏi chi tiết, suy luận, quan điểm phải hỏi vào một chỗ cụ thể trong bài; không hỏi chung về chủ đề của cả bài, để không trùng với câu hỏi ý chính.");
  out.push(DX + "Bốn phương án dài tương đối bằng nhau; đáp án không được dài hẳn hoặc chi tiết hơn hẳn các phương án sai. Không dùng All of the above, None of the above.");
  out.push(DX + "Các câu độc lập với nhau: câu hỏi hoặc phương án của câu này không được để lộ đáp án của câu khác.");
  out.push(DX + "Câu hỏi theo thứ tự thông tin trong bài; câu hỏi về cả bài (ý chính, giọng điệu) đặt cuối. Mỗi nội dung chỉ dùng cho một câu hỏi: căn cứ của hai câu không được trùng hoặc chồng lên nhau.");
  out.push(DX + "Trình bày: câu hỏi dạng câu hỏi (kết thúc bằng ?) thì phương án viết hoa chữ đầu; câu điền khuyết (có ______) kết thúc bằng dấu chấm và phương án viết thường chữ đầu (trừ tên riêng); phương án là câu đầy đủ có dấu chấm cuối, phương án là cụm từ thì không có dấu chấm.");
  if(qIsR()) out.push(DX + "Câu quy chiếu (RE) và từ vựng (VO): hỏi theo đoạn (in paragraph X), không theo dòng (line); từ được hỏi đặt trong ngoặc kép; câu VO có đáp án ở mức từ vựng bằng hoặc thấp hơn từ được hỏi. Mỗi đoạn của bài có ít nhất một câu hỏi.");
  else out.push(DX + "Câu hỏi Nghe viết ở dạng khẳng định, không dùng NOT, EXCEPT.");
  out.push(DX + "Câu hỏi nêu rõ một vấn đề, không có chi tiết thừa: chi tiết thừa là chi tiết vừa không cần để trả lời, vừa không giúp tìm chỗ trong bài. Cụm định vị như \"What does the woman say about the workshop?\" là cần, không phải thừa." + (qIsR() ? "" : " Câu hỏi bài Nghe được đọc trong thời gian cố định nên càng phải gọn."));
  out.push(DX + "Đáp án rải đều ở A, B, C, D, không theo quy luật. Không xếp phương án theo thứ tự các loại phương án trong bảng QĐ 730: chữ A–D trong bảng đó là tên loại, không phải vị trí, và bảng thường ghi đáp án đúng ở D (nghiên cứu Holzknecht và cộng sự, 2021: đáp án ở vị trí cuối làm câu khó hơn vì vị trí).");
  out.push(DX + "Không để đáp án là phương án duy nhất lặp nguyên văn một cụm từ của bài. Chỗ QĐ 730 yêu cầu đáp án giữ từ của bài (ví dụ câu chi tiết bậc 3 bài Nghe) thì làm đúng QĐ, và các phương án nhiễu cũng mang từ khoá của bài theo đúng khuôn.");
  if(!qIsR()) out.push(DX + "Từ trong câu hỏi và phương án không khó hơn từ của kịch bản (không dùng từ trên mức " + S.level + " mà kịch bản không có), để câu hỏi không chuyển sang đo kỹ năng đọc.");
  out.push(DX + "Mỗi câu có dòng GIẢI THÍCH: vì sao đáp án đúng, dựa vào chi tiết nào trong bài.");
  return out.map(function(x){ return "- " + x; }).join("\n");
}
function qFormatText(){
  var isR = qIsR();
  return "=== CÂU HỎI ===\nCÂU 1 | B3 thấp | " + (isR ? "RE | đoạn 2" : "DE") + "\nHỎI: (câu hỏi)\nA. …\nB. …\nC. …\nD. …\nĐÁP ÁN: (một chữ A, B, C hoặc D)\nCĂN CỨ: (chép y nguyên 5–20 từ liền nhau trong bài, kể cả dấu câu, đúng chỗ chứa đáp án; không thêm dấu …, không sửa chữ; câu hỏi về cả bài thì chép câu tiêu biểu nhất)\nLOẠI: A = (1); B = ĐÚNG; C = (3); D = (2)   (ghi cho cả bốn phương án: phương án đúng ghi ĐÚNG; phương án sai ghi số loại (1), (2), (3) theo khuôn phương án sai của dạng câu này; dạng câu không có khuôn thì ghi SAI)\nNHIỄU: A – (vì sao sai); C – …; D – …\nGIẢI THÍCH: (1–2 câu tiếng Việt: vì sao đáp án đúng, dựa vào chi tiết nào trong bài)"
    + (isR ? "\n\nRiêng câu chèn câu (IS) có thêm hai dòng ngay sau dòng HỎI:\nCÂU CHÈN: (chép nguyên văn một câu trong bài)\nVỊ TRÍ: A sau \"(5–10 từ cuối của câu đứng trước vị trí A)\"; B sau \"…\"; C sau \"…\"; D sau \"…\"" : "")
    + "\n\nCác câu cách nhau một dòng trống. Dòng đầu mỗi câu: CÂU số | bậc và mức viết đúng dạng B3 thấp, B3 trung bình, B3 cao, B4 thấp… (B3 = bậc 3, B4 = bậc 4, B5 = bậc 5) | mã kĩ năng" + (isR ? " | đoạn số (đoạn chứa căn cứ; tiêu đề không tính là đoạn; câu hỏi về cả bài ghi: cả bài)" : "") + ".";
}
P.qR = {title:"Câu lệnh soạn câu hỏi Đọc", inputs:["draft"], outputs:[{slot:"questions"}], t:
"Soạn câu hỏi trắc nghiệm cho bài đọc dưới đây ({partShort} của đề thi Đọc VSTEP), theo đúng đặc tả trong Hướng dẫn áp dụng định dạng đề thi bậc 3–5 (QĐ 730/QĐ-BGDĐT, cập nhật 13/5/2016), mục 2.2.2 và 2.2.4.\n\nBẢNG PHÂN BỐ (bắt buộc đủ {qN} câu, đúng số câu ở mỗi bậc và mức; mỗi câu chọn MỘT mã trong dòng của nó; bảng theo VSTEP Reading Specifications, độ khó theo QĐ 730):\n{qBlueprint}\n\nYÊU CẦU CHUNG:\n- [QĐ 730] Mỗi câu có 4 phương án A, B, C, D và chỉ một đáp án đúng, có căn cứ rõ trong bài.\n- [Đề xuất] Câu hỏi xếp theo thứ tự thông tin xuất hiện trong bài; câu hỏi về cả bài (ý chính, mục đích, giọng điệu, cách tổ chức của cả văn bản) đặt cuối. Các câu không gợi ý đáp án cho nhau.\n- [Đề xuất] Đáp án đúng nằm ở các vị trí A, B, C, D khác nhau, không theo quy luật.\n- [QĐ 730] Câu hỏi bậc 3: từ vựng và cấu trúc của câu hỏi và phương án ở bậc 3 (B1); riêng DE[P] được dùng bậc 3 hoặc 4.\n- Không sửa bài đọc. Câu hỏi đoán nghĩa từ ưu tiên các từ giữ lại để hỏi: {{keep}}.\n- [Đề xuất] Phương án sai không dùng từ ngữ tuyệt đối (all, every, always, never, only, completely, entirely, must, the most, the best, the highest…, các dạng so sánh nhất) trừ khi bài cũng nói đúng mức đó; nếu không, thí sinh loại được ngay mà không cần đọc bài. Phương án sai và đáp án nói cùng mức độ; không để đáp án là câu duy nhất có từ rào đón (may, some, often).\n{qAnchors}\nQUY TẮC THEO DẠNG CÂU VÀ QUY TẮC CHUNG (mỗi dòng ghi nguồn):\n{qRules}\n\nTRƯỚC KHI TRẢ LỜI, TỰ KIỂM TỪNG MỤC SAU (trang web sẽ kiểm tự động đúng các mục này):\n{qSelfCheck}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Theo đúng khuôn sau, không in đậm, không dùng bảng:\n{qFormat}\n\nBÀI ĐỌC (các nhãn [Đoạn N] chỉ để đánh số đoạn, không thuộc bài; tiêu đề không phải đoạn):\n{qPassage}"};
P.qL = {title:"Câu lệnh soạn câu hỏi Nghe", inputs:["draft"], outputs:[{slot:"questions"}], t:
"Soạn câu hỏi trắc nghiệm cho kịch bản nghe dưới đây ({partShort} của đề thi Nghe VSTEP), theo đúng đặc tả trong Hướng dẫn áp dụng định dạng đề thi bậc 3–5 (QĐ 730/QĐ-BGDĐT, cập nhật 13/5/2016), mục 2.1.2 và 2.1.3.\n\nBẢNG PHÂN BỐ CHO BÀI NÀY (bắt buộc đủ {qN} câu, đúng bậc và mức):\n{qBlueprint}\n{qPartNote}\nYÊU CẦU CHUNG:\n- [QĐ 730] Mỗi câu có 4 phương án A, B, C, D và chỉ một đáp án đúng, nghe được rõ trong bài.\n- [Đề xuất] Câu hỏi xếp theo thứ tự thông tin xuất hiện trong bài; câu hỏi về cả bài (ý chính, mục đích của cuộc nói chuyện) đặt cuối. Các câu không gợi ý đáp án cho nhau.\n- [Đề xuất] Đáp án đúng nằm ở các vị trí A, B, C, D khác nhau, không theo quy luật.\n- [Đề xuất] Thí sinh chỉ nghe một lần: đáp án của các câu không nằm quá sát nhau trong bài.\n- [Đề xuất] Phương án sai không dùng từ ngữ tuyệt đối (all, every, always, never, only, completely, entirely, must, the most, the best, the highest…, các dạng so sánh nhất) trừ khi bài cũng nói đúng mức đó; nếu không, thí sinh loại được ngay mà không cần đọc bài. Phương án sai và đáp án nói cùng mức độ; không để đáp án là câu duy nhất có từ rào đón (may, some, often).\n- [Specs] Không nghe thừa (hướng dẫn của Bộ): thông tin trong bài được dùng tối đa. Phương án sai ưu tiên lấy thông tin có trong bài ở gần căn cứ của câu đó (con số, tên, lựa chọn được nhắc rồi bỏ, ý bị đính chính), kể cả ở câu bậc 4–5. Mỗi căn cứ chỉ dùng cho một câu; thông tin nhiễu được dùng lại cho câu khác nhưng không được làm lộ đáp án câu đó.\n- Không sửa kịch bản.\n\nQUY TẮC THEO DẠNG CÂU VÀ QUY TẮC CHUNG (mỗi dòng ghi nguồn):\n{qRules}\n\nTRƯỚC KHI TRẢ LỜI, TỰ KIỂM TỪNG MỤC SAU (trang web sẽ kiểm tự động đúng các mục này):\n{qSelfCheck}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Theo đúng khuôn sau, không in đậm, không dùng bảng:\n{qFormat}\n\nKỊCH BẢN:\n{qPassage}"};
P.qfix = {title:"Câu lệnh sửa câu hỏi", inputs:["draft","questions"], outputs:[{slot:"questions"}], t:
"Bộ câu hỏi dưới đây cho bài {readOrListenNoun} VSTEP ({partShort}) còn các lỗi sau so với đặc tả QĐ 730:\n{qIssues}\n\nHãy sửa đúng các lỗi đó. Câu nào không bị nêu lỗi thì giữ nguyên từng chữ. Không sửa bài {readOrListenNoun}.\n\nKhi viết lại phương án ([Đề xuất]): phương án sai không dùng từ ngữ tuyệt đối (all, every, always, never, only, completely, entirely, must, the most, the best, the highest…, các dạng so sánh nhất) trừ khi bài cũng nói đúng mức đó; nếu không, thí sinh loại được ngay mà không cần đọc bài. Phương án sai và đáp án nói cùng mức độ; không để đáp án là câu duy nhất có từ rào đón (may, some, often).\n\nNhắc lại bảng phân bố:\n{qBlueprint}\n\nQuy tắc theo dạng câu:\n{qRules}\n\nTrình bày TOÀN BỘ bộ câu hỏi (cả các câu không sửa) trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, theo đúng khuôn:\n{qFormat}\n\nSau khi sửa, tự kiểm lại cả bộ:\n{qSelfCheck}\n\n{readOrListenNounCap}{qPassNote}:\n{qPassage}\n\nBỘ CÂU HỎI HIỆN TẠI:\n{{questions}}"};
SLOTS.questions = {label:"Bộ câu hỏi", type:"area"};
P.qblind = {title:"Câu lệnh thử mù (làm câu hỏi mà không có bài)", inputs:["questions"], outputs:[{slot:"qblind"}], t:
"Dưới đây là các câu hỏi trắc nghiệm của một bài {readOrListenVerb} tiếng Anh. Bạn KHÔNG có bài {readOrListenVerb}. Hãy thử làm từng câu chỉ bằng hiểu biết thông thường, logic đời sống và cách viết các phương án (ví dụ: phương án nào nghe hợp lý nhất, phương án nào khác hẳn ba phương án còn lại, phương án nào lặp lại từ của câu hỏi). Mục đích là kiểm xem câu hỏi có buộc thí sinh phải {readOrListenVerb} bài mới trả lời được không, nên hãy trả lời trung thực: câu nào không có cơ sở để đoán thì ghi ĐOÁN: -.\n\nTrả lời trong MỘT khối code, mỗi câu một dòng, đúng khuôn:\nCÂU 1 | ĐOÁN: B | CHẮC: cao | LÝ DO: (một câu ngắn)\nCHẮC chỉ ghi một trong ba chữ: cao, trung bình, thấp. Không viết gì ngoài khối code.\n\nCÁC CÂU HỎI:\n{qBlindItems}"};
SLOTS.qblind = {label:"Kết quả thử mù", type:"area"};
function qHash(s){ s = String(s||""); var h = 5381; for(var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h >>> 0); }
function parseBlind(t){
  var m = {}, n = 0;
  String(t||"").split(/\n/).forEach(function(l){
    l = l.replace(/\*\*/g,"").trim();
    var r = l.match(/^C[ÂA]U\s*(\d+)\s*\|\s*Đ?O[ÁA]N\s*:\s*([A-D\-–]|không)?[^|]*\|\s*CH[ẮA]C\s*:\s*([^|]*)\|?\s*(?:L[ÝY]\s*DO\s*:\s*(.*))?$/i);
    if(!r) return;
    var g = (r[2]||"").toUpperCase(); if(!/^[A-D]$/.test(g)) g = "";
    var c = (r[3]||"").toLowerCase().trim(); c = /cao|high/.test(c) ? "cao" : (/trung|medium|mid/.test(c) ? "trung bình" : "thấp");
    m[parseInt(r[1],10)] = {g:g, c:c, why:(r[4]||"").trim()}; n++;
  });
  return {map:m, n:n};
}
function qBlindItemsText(){
  var P0 = parseQ(S.slots.questions||"");
  return P0.items.map(function(it){ return "CÂU " + it.n + ". " + (it.stem||"") + "\nA. " + (it.opts.A||"") + "\nB. " + (it.opts.B||"") + "\nC. " + (it.opts.C||"") + "\nD. " + (it.opts.D||""); }).join("\n\n");
}

/* ---- Đọc khuôn ---- */
function qStrip(s){ return (s||"").replace(/\*\*/g,"").replace(/^[\s>•\-]+/,"").trim(); }
function qUnq(s){ return (s||"").trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g,"").trim(); }
function parseQ(text){
  var t = cleanPaste(text||"").replace(/\*\*/g,"");
  var out = [], errs = [];
  if(!t.trim()) return {items:out, errs:errs, empty:true};
  var re = /^[ \t>•\-]*C[ÂA]U\s+(\d+)\s*[|:.\-–]\s*(.*)$/gim, m, marks = [];
  while((m = re.exec(t))) marks.push({i:m.index, end:re.lastIndex, n:parseInt(m[1],10), head:m[2]});
  if(!marks.length){ errs.push("Không thấy dòng nào bắt đầu bằng \"CÂU 1 | …\"."); return {items:out, errs:errs}; }
  marks.forEach(function(mk, j){
    var body = t.slice(mk.end, j+1<marks.length ? marks[j+1].i : t.length);
    var h = mk.head.split("|").map(function(x){ return x.trim(); });
    var LVx = qParseLevel(h[0]||"");
    var it = {n:mk.n, lv:LVx.lv, mức:LVx.m, code:qNormCode(h[1]), para:(h[2]||"").trim(), opts:{}, raw:body};
    var lines = body.split("\n"), cur = null;
    lines.forEach(function(raw){
      var l = qStrip(raw); if(!l){ cur = null; return; }
      var f;
      if((f = l.match(/^(?:H[ỎO]I|C[ÂA]U H[ỎO]I|QUESTION)\s*[:：]\s*(.*)$/i))){ it.stem = f[1].trim(); cur = "stem"; return; }
      if((f = l.match(/^\(?([A-D])\s*[\.\)]\s*(.*)$/))){ it.opts[f[1]] = f[2].trim(); cur = "opt" + f[1]; return; }
      if((f = l.match(/^(?:Đ[ÁA]P [ÁA]N|DAP AN|ANSWER)\s*[:：]\s*\(?([A-D])\b/i))){ it.ans = f[1].toUpperCase(); cur = null; return; }
      if((f = l.match(/^(?:C[ĂA]N C[ỨU]|EVIDENCE)\s*[:：]\s*(.*)$/i))){ it.basis = qUnq(f[1]); cur = "basis"; return; }
      if((f = l.match(/^(?:LO[ẠA]I|TYPES?)\s*[:：]\s*(.*)$/i))){ it.types = {}; var tre = /\b([A-D])\s*[=:–\-]\s*\(?\s*([123]|đúng|dung|correct|đáp án|sai)/gi, tm; while((tm = tre.exec(f[1]))){ var tv = tm[2].toLowerCase(); it.types[tm[1].toUpperCase()] = /^[123]$/.test(tv) ? tv : (/sai/.test(tv) ? "sai" : "đúng"); } cur = null; return; }
      if((f = l.match(/^(?:NHI[ỄE]U|DISTRACTORS?)\s*[:：]\s*(.*)$/i))){ it.distr = f[1].trim(); cur = "distr"; return; }
      if((f = l.match(/^(?:GI[ẢA]I TH[ÍI]CH|EXPLANATION)\s*[:：]\s*(.*)$/i))){ it.explain = f[1].trim(); cur = "expl"; return; }
      if((f = l.match(/^(?:C[ÂA]U CH[ÈE]N)\s*[:：]\s*(.*)$/i))){ it.insert = qUnq(f[1]); cur = null; return; }
      if((f = l.match(/^(?:V[ỊI] TR[ÍI])\s*[:：]\s*(.*)$/i))){ it.pos = parsePos(f[1]); cur = null; return; }
      if(cur==="stem") it.stem += " " + l; else if(cur && cur.indexOf("opt")===0) it.opts[cur.slice(3)] += " " + l; else if(cur==="distr") it.distr += " " + l; else if(cur==="expl") it.explain += " " + l;
    });
    out.push(it);
  });
  return {items:out, errs:errs};
}
function qParseLevel(x){
  var t = (x||"").toLowerCase().normalize("NFC"), lv = "", m = "";
  var a = t.match(/\b([bc])\s*([12])\s*[.\-]\s*([123])\b/);
  if(a){ lv = a[1]==="c" ? "B5" : (a[2]==="1" ? "B3" : "B4"); m = ["thấp","trung bình","cao"][+a[3]-1]; return {lv:lv, m:m}; }
  var b = t.match(/\b(?:b|bậc|bac|level)\s*([345])\b/); if(b) lv = "B" + b[1];
  if(/thấp|thap|\blow\b/.test(t)) m = "thấp";
  else if(/trung\s*b[iì]nh|\btb\b|\bmid|medium/.test(t)) m = "trung bình";
  else if(/\bcao\b|\bhigh\b/.test(t)) m = "cao";
  return {lv:lv, m:m};
}
function parsePos(s){
  var res = {}, re = /\b([A-D])\s*(?:sau|after)?\s*[:：]?\s*["“]([^"”]+)["”]/gi, m;
  while((m = re.exec(s))) res[m[1].toUpperCase()] = m[2].trim();
  return res;
}

/* ---- Từ ngữ tuyệt đối trong phương án (quy ước của nhóm) ---- */
var ABS_WORDS = ["all","every","everyone","everybody","everything","everywhere","always","never","none","no one","nobody","nothing","nowhere","only","solely","entirely","completely","totally","absolutely","wholly","fully","perfectly","utterly","definitely","certainly","undoubtedly","must","impossible","forever","without exception","at all","all the time","in all cases","the whole"];
var ABS_NOT_SUP = " rest west interest forest guest request test contest chest nest quest protest harvest conquest suggest invest arrest digest manifest crest vest honest modest earnest ";
var HEDGE_RE = /\b(may|might|can|could|some|often|usually|sometimes|tend|tends|likely|probably|possibly|generally|mostly|partly|several|a few|seem|seems|appear|appears)\b/i;
function qAbsTerms(text){
  var t = qNorm(text), out = [];
  ABS_WORDS.forEach(function(w){ if(t.indexOf(" " + w + " ") >= 0) out.push(w); });
  var re = / the (most|least|best|worst|[a-z]+est) /g, m;
  while((m = re.exec(t))){ if(ABS_NOT_SUP.indexOf(" " + m[1] + " ") < 0) out.push("the " + m[1]); re.lastIndex--; }
  return out.filter(function(x,i,a){ return a.indexOf(x)===i; });
}
function qAbsSupported(term, zoneN){
  var core = term.replace(/^the /,"");
  return zoneN.indexOf(" " + term + " ") >= 0 || zoneN.indexOf(" " + core + " ") >= 0;
}
/* ---- Khẩu ngữ hoá: so sánh kịch bản với văn bản nguồn (hướng dẫn của giảng viên) ---- */
var SPK_TARGETS = [
  {k:"sub", label:"Mệnh đề phụ", dir:-1, pct:14},
  {k:"emb", label:"Mệnh đề lồng ghép (mệnh đề quan hệ)", dir:-1, pct:84},
  {k:"pas", label:"Thể bị động", dir:-1, pct:50},
  {k:"con", label:"Từ nối đơn giản (so, and, but)", dir:1, pct:28},
  {k:"fp", label:"Xưng hô ngôi thứ nhất (I, we…)", dir:1, pct:17},
  {k:"q", label:"Câu hỏi", dir:1, pct:92},
  {k:"ell", label:"Lược từ (câu rút gọn ≤ 5 từ)", dir:1, pct:0},
  {k:"dm", label:"Từ đệm và từ nối thoại (well, you know, I mean…)", dir:1, pct:86},
  {k:"fpz", label:"Ngập ngừng có tiếng (uh, um)", dir:1, pct:86}
];
var SPK_FPZ = ["uh","um","er","erm","uhm","hmm","mm"];
/* mức tối đa trên 100 từ cho các chỉ số làm câu ngắn và từ ngắn (đẩy Flesch lên); theo nhóm Part 1 / 2 / 3 */
var SPK_CAP = {q:{1:3,2:4,3:3}, ell:{1:2,2:4,3:2}, dm:{1:3,2:3,3:3}, fpz:{1:1,2:1,3:1}};
var SPK_CAPNAME = {q:"câu hỏi", ell:"lượt đáp hoặc câu rút gọn (≤ 5 từ)", dm:"từ đệm và từ nối thoại", fpz:"uh, um"};
function spkNeedRate(t, a, W){ if(a===null || a===undefined) return null; if(t.dir < 0) return null; if(a > 0) return t.pct ? a*(1 + t.pct/100) : a + 100/W; return 100/W; }
function spkCapRate(k, need){ var g = SPEC[S.spec].grp || 2, c = SPK_CAP[k] ? SPK_CAP[k][g] : null; if(c===null) return null; return need ? Math.max(c, need*1.15 + 0.3) : c; }
var SPK_DM2 = ["you know","i mean","kind of","sort of","you see"];
var SPK_DM1 = ["actually","anyway","basically","honestly","okay","ok","oh"];
var SPK_CLAUSE_START = " i you he she it we they there this that these those so and but because if when then well what why how who where i'm you're it's that's there's we're they're i've we've i'd i'll let's ";
var SPK_SUB = ["because","although","though","unless","whereas","whether","whilst","if","when","while","until","so that","even though","even if","in order that","provided that"];
var SPK_THAT_NO = " say said says think thought thinks know knew knows believe believed believes show shows showed shown suggest suggests suggested find found finds mean means meant claim claims claimed feel felt hope hoped sure so such now is was are were be been than of in on at to for with by and but or all like that this it notes noted argue argued argues explain explained explains report reported reports estimate estimated ";
var SPK_IRR_PP = " been born done made seen given taken known shown found built bought brought caught chosen drawn driven eaten fallen forgotten got gotten grown held hidden hit hurt kept laid led left lent lost meant met paid put read run said sent set shut sold spent spoken spread stood stolen struck sung taught told thought thrown understood won worn written ";
var SPK_FP = " i me my mine myself we us our ours ourselves i'm i've i'll i'd we're we've we'll we'd ";
var SPK_SUBJ = " i you he she it we they this that there these those i'm you're he's she's it's we're they're there's that's ";
var SPK_REL_NO = " about of on in to for at with by from into know knew knows ask asked asks tell told tells decide decided wonder wondered see saw sees seen explain explained understand understood choose chose show showed shows matter matters remember forget forgot find found learn learned care check is was are were be ";
var SPK_VERBS = " see saw seen hear heard like love want need do did does have had has get got make made take took tell told ask asked understand remember forget notice mean meant guess hope feel felt agree explain expect learn read try tried say said says think thought know knew believe show showed suggest suggested find found claim feel argue argued note noted report reported estimate estimated realise realised realize realized ";
// mệnh đề quan hệ chen giữa câu: trước đại từ quan hệ chưa có động từ chính (ước lượng)
var SPK_AUX = " am is are was were be been has have had do does did can could will would shall should may might must ";
var SPK_DET = " the a an this that these those my your his her its our their some many most all each every ";
function spkIsCenter(toks, i){
  for(var k = 0; k < i; k++){
    var w = toks[k], nx = toks[k+1] || "";
    if(SPK_AUX.indexOf(" " + w + " ") >= 0) return false;
    if(/'(s|re|m|ve|d|ll)$/.test(w) && SPK_SUBJ.indexOf(" " + w + " ") >= 0) return false;
    if(SPK_SUBJ.indexOf(" " + w + " ") >= 0 && k + 1 < i && !/^(and|or|but|so|who|which|that)$/.test(nx)) return false;
    if(/[a-z]{3,}ed$/.test(w) && k > 0 && SPK_DET.indexOf(" " + toks[k-1] + " ") < 0) return false;
  }
  return true;
}
function spkIsEmb(toks, i){
  var w = toks[i], prev = toks[i-1] || "", next = toks[i+1] || "";
  if(i===0) return false;
  if(w==="who" || w==="whom" || w==="whose" || w==="which") return SPK_REL_NO.indexOf(" " + prev + " ")<0 && SPK_VERBS.indexOf(" " + prev + " ")<0;
  if(w==="that"){
    if(SPK_THAT_NO.indexOf(" " + prev + " ")>=0 || SPK_SUBJ.indexOf(" " + prev + " ")>=0 || SPK_VERBS.indexOf(" " + prev + " ")>=0) return false;
    if(/^(a|an|lot|much|many|way|time|is|was|'s)$/.test(next)) return false;
    return Q_STOP.indexOf(" " + prev + " ")<0;
  }
  return false;
}
var SPK_FILLER_OFF = ["um","uh","er","erm","hmm","mm","mmm","uh-huh","mm-hmm","gonna","wanna","gotta"];
function spkText(raw, isScript){
  var lines = (raw||"").replace(/\r/g,"").split("\n");
  if(isScript) lines = lines.map(function(l){ return l.replace(/^\s*[A-Z][A-Za-z .'’\-]{0,30}:\s*/, ""); });
  return lines.join("\n");
}
function spkStats(raw, isScript){
  var t = spkText(raw, isScript), low = t.toLowerCase().replace(/[’‘]/g,"'");
  var toks = low.match(/[a-z0-9]+(?:['\-][a-z0-9]+)*/g) || [], W = toks.length;
  if(W < 30) return null;
  var sents = (t.match(/[^.!?\n]+[.!?]*/g) || []).map(function(x){ return x.trim(); }).filter(function(x){ return /[A-Za-z]/.test(x); });
  var c = {sub:0, emb:0, pas:0, con:0, fp:0, q:0, ell:0};
  var n = " " + toks.join(" ") + " ";
  SPK_SUB.forEach(function(w){ var re = new RegExp(" " + w + " ", "g"), m = n.match(re); if(m) c.sub += m.length; });
  for(var i=0;i<toks.length;i++){
    var w = toks[i], prev = toks[i-1] || "";
    if(spkIsEmb(toks, i)) c.rel = (c.rel||0) + 1;
    if(w==="so" || w==="and" || w==="but") c.con++;
    if(SPK_FP.indexOf(" " + w + " ")>=0) c.fp++;
    if(/^(am|is|are|was|were|be|been|being|get|gets|got|getting)$/.test(w)){
      for(var j=i+1;j<=Math.min(i+3, toks.length-1);j++){
        var x = toks[j];
        if(/^(not|never|also|often|always|usually|now|still|being|really|very|already|just|then)$/.test(x) || /ly$/.test(x)) continue;
        if(/^(supposed|used|able|going|born|interested|tired|married|excited|worried|pleased|surprised|bored)$/.test(x)) break;
        if((/[a-z]ed$/.test(x) && x.length > 4) || SPK_IRR_PP.indexOf(" " + x + " ")>=0) c.pas++;
        break;
      }
    }
  }
  // mệnh đề phụ tính mọi mệnh đề quan hệ; mệnh đề lồng ghép chỉ tính loại chen giữa chủ ngữ và động từ chính
  c.sub += (c.rel||0);
  sents.forEach(function(sx){ c.emb += spkStats1(sx).emb; });
  c.dm = 0; c.fpz = 0;
  SPK_DM2.forEach(function(w){ var m = n.match(new RegExp(" " + w + " ", "g")); if(m) c.dm += m.length; });
  SPK_DM1.forEach(function(w){ var m = n.match(new RegExp(" " + w + " ", "g")); if(m) c.dm += m.length; });
  var lowT = t.replace(/[’‘]/g,"'");
  var wellRe = /(^|[.!?,\n]\s*)(well|right|now|look|see)\s*[,.?!]/gim, wm; while((wm = wellRe.exec(lowT))) c.dm++;
  toks.forEach(function(w){ if(SPK_FPZ.indexOf(w)>=0) c.fpz++; });
  sents.forEach(function(sx){
    if(/\?\s*["”’)]*$/.test(sx)) c.q++;
    var ws = (sx.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z0-9]+(?:['\-][a-z0-9]+)*/g) || []);
    if(ws.length && ws.length <= 5 && SPK_SUBJ.indexOf(" " + ws[0] + " ")<0) c.ell++;
  });
  var r = {}; Object.keys(c).forEach(function(k){ r[k] = 100*c[k]/W; });
  var fill = toks.filter(function(w){ return SPK_FILLER_OFF.indexOf(w)>=0; });
  var passList = sents.filter(function(sx){ var st = spkStats1(sx); return st.pas; });
  var embList = sents.filter(function(sx){ var st = spkStats1(sx); return st.emb; });
  // vị trí ngập ngừng: ở ranh giới mệnh đề hay chen giữa cụm từ
  var pz = [], pre = new RegExp("(^|[\\s,.;:!?\"“”'‘’()\\-–—])(" + SPK_FPZ.join("|") + ")(?=[\\s,.;:!?…\\-–—]|$)", "gim"), pm;
  while((pm = pre.exec(lowT))){
    var at = pm.index + pm[1].length, before = lowT.slice(0, at), after = lowT.slice(at + pm[2].length);
    var prevCh = (before.match(/[^\s]\s*$/) || [""])[0].trim().slice(-1), prevW = ((before.match(/([a-z']+)[\s,]*$/) || ["",""])[1]);
    var nextW = ((after.match(/^[\s,.…\-–—]*([a-z']+)/) || ["",""])[1]);
    var atLineStart = /(^|\n)\s*$/.test(before);
    var ok = atLineStart || /[,.;:!?…\-–—]/.test(prevCh) || /^(and|but|so|because|if|when|then|or)$/.test(prevW) || SPK_CLAUSE_START.indexOf(" " + nextW + " ")>=0;
    var ctx = t.slice(Math.max(0, at-25), Math.min(t.length, at + pm[2].length + 25)).replace(/\n/g," ");
    pz.push({ok:ok, ctx:ctx});
  }
  return {W:W, c:c, r:r, fillOff:fill.filter(function(x,i,a){ return a.indexOf(x)===i && SPK_FPZ.indexOf(x)<0; }), passList:passList, embList:embList, S:sents.length, pauses:pz};
}
function spkStats1(sx){
  var low = sx.toLowerCase().replace(/[’‘]/g,"'"), toks = low.match(/[a-z0-9]+(?:['\-][a-z0-9]+)*/g) || [], c = {pas:0, emb:0};
  for(var i=0;i<toks.length;i++){
    var w = toks[i], prev = toks[i-1] || "";
    if(spkIsEmb(toks, i) && spkIsCenter(toks, i)) c.emb++;
    if(/^(am|is|are|was|were|be|been|being|get|gets|got|getting)$/.test(w)){
      for(var j=i+1;j<=Math.min(i+3, toks.length-1);j++){
        var x = toks[j];
        if(/^(not|never|also|often|always|usually|now|still|being|really|very|already|just|then)$/.test(x) || /ly$/.test(x)) continue;
        if(/^(supposed|used|able|going|born|interested|tired|married|excited|worried|pleased|surprised|bored)$/.test(x)) break;
        if((/[a-z]ed$/.test(x) && x.length > 4) || SPK_IRR_PP.indexOf(" " + x + " ")>=0) c.pas++;
        break;
      }
    }
  }
  return c;
}
// mốc so khẩu ngữ hoá: đoạn dữ kiện đã duyệt (văn bản nguồn ở giai đoạn viết kịch bản); chưa có thì dùng văn bản nguồn bước 3
function spkSourceText(){ return (S.slots.facts || "").trim() ? S.slots.facts : (S.slots.src || S.slots.srcPdfText || ""); }
function spkBaseName(){ return (S.slots.facts || "").trim() ? "đoạn dữ kiện" : "văn bản nguồn"; }
function spkEval(){
  if(SPEC[S.spec].skill!=="L") return null;
  var sc = spkStats(S.slots.draft||"", true); if(!sc) return null;
  var srcT = spkSourceText(), so = srcT.trim() ? spkStats(srcT, false) : null;
  var rows = SPK_TARGETS.map(function(t){
    var a = so ? so.r[t.k] : null, b = sc.r[t.k], ch = null, ok = null;
    if(so){
      if(a > 0){ ch = 100*(b - a)/a; ok = t.dir < 0 ? ch <= -t.pct : (t.pct ? ch >= t.pct : ch > 0); }
      else { ch = null; ok = t.dir < 0 ? b === 0 : b > 0; }
    }
    var need = so ? spkNeedRate(t, a, sc.W) : null, cap = spkCapRate(t.k, need);
    return {t:t, a:a, b:b, ch:ch, ok:ok, need:need, cap:cap, over: cap!==null && b > cap + 1e-9, n:Math.round(b*sc.W/100), needN: need===null ? null : Math.ceil(need*sc.W/100 - 1e-6), capN: cap===null ? null : Math.floor(cap*sc.W/100 + 1e-6)};
  });
  var P = sc.pauses, posOk = !P.length || P.filter(function(p){ return p.ok; }).length / P.length >= 0.8;
  return {sc:sc, so:so, rows:rows, fails:rows.filter(function(r){ return r.ok===false; }), posOk:posOk};
}
function spkPlanText(){
  if(SPEC[S.spec].skill!=="L") return "";
  var sp = SPEC[S.spec], Wt = sp.max || sp.approx || 300, g = sp.grp || 2;
  var items = Object.keys(SPK_CAP).map(function(k){ return SPK_CAPNAME[k] + " tối đa " + Math.max(1, Math.floor(SPK_CAP[k][g]*Wt/100 + 1e-6)) + " chỗ"; });
  return "  (cả bài, kịch bản " + (/^khoảng|–/.test(sp.words||"") ? sp.words : "khoảng " + (sp.words||Wt)) + " từ): " + items.join("; ") + ".";
}
function spkTrimText(){
  var E = spkEval(); if(!E) return "";
  var cuts = [];
  E.rows.forEach(function(r){
    if(!SPK_CAP[r.t.k] || r.needN===null && !E.so) return;
    var need = r.needN===null ? 0 : r.needN, extra = r.n - Math.max(need, 1);
    if(r.over || extra >= 2){
      var tgt = Math.max(need, Math.min(r.n, r.capN!==null ? r.capN : r.n));
      if(r.over) tgt = Math.max(need, r.capN); else tgt = Math.max(need, r.n - Math.ceil(extra/2));
      if(tgt >= r.n) return;
      cuts.push(SPK_CAPNAME[r.t.k] + ": đang " + r.n + " chỗ, còn khoảng " + tgt + " (nên còn ít nhất " + Math.max(need, 1) + " chỗ để giữ chất văn nói)" + (r.t.k==="q" ? "; bỏ trước các câu hỏi một hai từ (Really? Right? Is it?) hoặc đổi thành câu hỏi có từ nội dung" : r.t.k==="ell" ? "; gắn lời đáp ngắn vào câu bên cạnh bằng dấu phẩy" : r.t.k==="dm" ? "; bỏ trước các từ đệm đứng sát nhau hoặc lặp lại" : ""));
    }
  });
  if(!cuts.length) return "Giữ văn nói nhưng không thêm câu hỏi, lượt đáp ngắn, từ đệm hay uh/um mới (các chỉ số này đang vừa đủ).";
  return "Bớt phần khẩu ngữ hoá đang thừa (các chỉ số này làm câu ngắn, từ ngắn nên đẩy Flesch lên); không bỏ hết: " + cuts.join("; ") + ".";
}
function spkTargetText(t){ return t.dir < 0 ? "giảm từ " + t.pct + "%" : (t.pct ? "tăng từ " + t.pct + "%" : "tăng"); }
function spkRowHTML(){
  var E = spkEval(); if(!E) return "";
  var head = "<b>Khẩu ngữ hoá (hướng dẫn của giảng viên, gợi ý, không bắt buộc):</b> ";
  if(!E.so) return srow("w", head + "chưa có đoạn dữ kiện hoặc văn bản nguồn tiếng Anh để so. Các chỉ số tính trên 100 từ của kịch bản: " + E.rows.map(function(r){ return r.t.label + " " + r.b.toFixed(1); }).join("; ") + ".");
  var tb = '<table class="spk"><tr><th>Chỉ số (trên 100 từ)</th><th>' + (spkBaseName() === "đoạn dữ kiện" ? "Đoạn dữ kiện" : "Nguồn") + '</th><th>Kịch bản</th><th>Thay đổi</th><th>Gợi ý</th></tr>' + E.rows.map(function(r){
    return '<tr class="' + (r.ok ? (r.over ? "warn" : "ok") : "warn") + '"><td>' + esc(r.t.label) + '</td><td>' + r.a.toFixed(1) + '</td><td>' + r.b.toFixed(1) + '</td><td>' + (r.ch===null ? (r.a===0 ? "nguồn không có" : "–") : (r.ch>0 ? "+" : "") + r.ch.toFixed(0) + "%") + '</td><td>' + spkTargetText(r.t) + (r.cap!==null ? ", tối đa " + r.cap.toFixed(1) : "") + (r.ok ? (r.over ? " ⚠ quá tay" : " ✓") : " ✗") + '</td></tr>';
  }).join("") + '</table>' + (E.rows.some(function(r){ return r.over; }) ? '<div class="small warnc">Có chỉ số vượt mức tối đa: đạt chỉ tiêu nhưng dễ đẩy Flesch lên quá khoảng của mức. Nếu Flesch đang cao, câu lệnh sửa sẽ bảo AI bớt đúng các chỗ thừa này.</div>' : '');
  var extra = E.sc.fillOff.length ? '<div class="small">Từ ngoài danh sách CEFR-J nên tránh (gonna, wanna…): ' + esc(E.sc.fillOff.join(", ")) + '</div>' : "";
  var P = E.sc.pauses, pOk = P.filter(function(p){ return p.ok; }).length;
  if(P.length) extra += '<div class="small ' + (pOk/P.length >= 0.8 ? "ok" : "no") + '">Vị trí ngập ngừng: ' + pOk + "/" + P.length + " chỗ (" + Math.round(100*pOk/P.length) + "%) ở ranh giới mệnh đề, cần từ 80%." + (pOk < P.length ? " Chỗ chen giữa cụm từ: " + esc(P.filter(function(p){ return !p.ok; }).map(function(p){ return "…" + p.ctx + "…"; }).join(" | ")) : "") + '</div>'
    + '<div class="small muted">uh, um không có trong CEFR-J nên mỗi lần dùng bị tính là không phủ (kịch bản ' + E.sc.W + ' từ: mỗi chỗ làm độ phủ giảm khoảng ' + (100/E.sc.W).toFixed(1) + ' điểm).</div>';
  return srow(E.fails.length || !E.posOk || E.rows.some(function(r){ return r.over; }) ? "w" : "g", head + (E.fails.length ? E.fails.length + "/" + E.rows.length + " chỉ số chưa theo gợi ý so với " + spkBaseName() + (E.posOk ? ". " : "; vị trí ngập ngừng chưa đạt. ") : (E.posOk ? "đạt cả " + E.rows.length + " chỉ số và quy tắc vị trí. " : "đạt các chỉ số; vị trí ngập ngừng chưa đạt. ")) + '<span class="muted">Đếm bằng luật, là ước lượng; mệnh đề lồng ghép tính theo who, which, whose, whom, that sau danh từ.</span>' + tb + extra);
}
/* ---- Kiểm ---- */
var Q_PRON = "it its they them their theirs this that these those he him his she her hers one ones which who whom whose such there we us our you your i me my".split(" ");
function qNorm(s){ return " " + (s||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”]/g,'"').replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim() + " "; }
function qFind(passN, quote){
  var segs = (quote||"").split(/\.\.\.|…/).map(function(x){ return qNorm(x).trim(); }).filter(function(x){ return x.length > 2; });
  if(!segs.length) return -1;
  var first = -1;
  for(var i=0;i<segs.length;i++){ var p = passN.indexOf(" " + segs[i] + " "); if(p<0) return -1; if(first<0) first = p; }
  return first;
}
function qSpanOf(passN, quote){
  var segs = (quote||"").split(/\.\.\.|…/).map(function(x){ return qNorm(x).trim(); }).filter(function(x){ return x.length > 2; }), a = -1, b = -1;
  segs.forEach(function(sg){ var p = passN.indexOf(" " + sg + " "); if(p >= 0){ if(a < 0) a = p; b = Math.max(b, p + sg.length + 1); } });
  return a >= 0 ? [a, b] : null;
}
function qFuzzyLocate(raw, quote, NM){
  NM = NM || qNormMap(raw);
  var q = qNorm(quote).trim().split(" ").filter(Boolean); if(q.length < 3) return null;
  var toks = [], re = /[^ ]+/g, m;
  while((m = re.exec(NM.n))) toks.push({w:m[0], at:m.index});
  var best = null;
  for(var i=0;i<toks.length;i++){
    if(toks[i].w !== q[0] && toks[i].w !== q[1]) continue;
    var j = i, hit = 0, last = i;
    for(var k=0;k<q.length && j<toks.length && j < i + q.length + 4;k++){
      var f = -1; for(var t=j;t<Math.min(toks.length, j+3);t++){ if(toks[t].w===q[k]){ f = t; break; } }
      if(f>=0){ hit++; last = f; j = f + 1; }
    }
    var r = hit / q.length;
    if(!best || r > best.r) best = {r:r, i:i, last:last};
  }
  if(!best || best.r < 0.75) return null;
  var a = toks[best.i], b = toks[best.last];
  return {r:best.r, s:NM.map[a.at], e:NM.map[b.at + b.w.length - 1] + 1, pos:a.at};
}
var Q_ALLNONE = /\b(all|none|both|neither) of the (above|options|answers)\b/i;
function qFormatChecks(it, isR, probs, warns){
  var L = ["A","B","C","D"], stem = (it.stem||"").trim(), opts = L.map(function(x){ return (it.opts[x]||"").trim(); });
  if(!stem || opts.some(function(o){ return !o; })) return;
  // All/None of the above
  L.forEach(function(x, i){ if(Q_ALLNONE.test(opts[i])) probs.push("phương án " + x + " dùng \"" + opts[i].match(Q_ALLNONE)[0] + "\": không được dùng All/None of the above"); });
  // hỏi theo dòng
  if(isR && /\blines?\s+\d+|\bin line\b/i.test(stem)) probs.push("câu hỏi ghi theo dòng (line): phải hỏi theo đoạn (in paragraph X)");
  // Nghe: phủ định
  if(!isR && /\b(not|except|never)\b/i.test(stem)) warns.push("câu hỏi Nghe dùng phủ định (NOT, EXCEPT): nên viết ở dạng khẳng định");
  // viết hoa và chấm câu
  if(it.code!=="IS" && it.code!=="LO"){
    var blank = /_{3,}|…\s*$|\.\.\.\s*$/.test(stem), isQ = /\?\s*$/.test(stem);
    if(blank && /_{3,}/.test(stem) && !/[.]\s*$/.test(stem)) warns.push("câu điền khuyết nên kết thúc bằng dấu chấm (… ______.)");
    var low = [], up = [], perMiss = [], perExtra = [];
    L.forEach(function(x, i){
      var o = opts[i], f = (o.match(/[A-Za-z]/)||[""])[0], w1 = (o.match(/[A-Za-z][A-Za-z'’\-]*/)||[""])[0];
      if(/^\d/.test(o)) return;
      if(isQ && f && f !== f.toUpperCase()) low.push(x);
      if(blank && !isQ && f && f === f.toUpperCase() && w1 !== "I" && LEXM[w1.toLowerCase()] !== undefined && !/^[A-Z]{2,}$/.test(w1)) up.push(x);
      var form = qOptForm(o), dot = /[.]\s*$/.test(o) && !/\b(etc|Mr|Mrs|Dr|St)\.$/.test(o);
      if(form === "câu" && !dot && !blank) perMiss.push(x);
      if(form !== "câu" && form.indexOf("mệnh đề") !== 0 && dot && qWords(o) <= 6) perExtra.push(x);
    });
    if(low.length) warns.push("câu hỏi kết thúc bằng dấu ?, phương án " + low.join(", ") + " cần viết hoa chữ đầu");
    if(up.length) warns.push("câu điền khuyết: phương án " + up.join(", ") + " nên viết thường chữ đầu (trừ tên riêng)");
    if(perMiss.length) warns.push("phương án " + perMiss.join(", ") + " là câu đầy đủ, cần dấu chấm cuối");
    if(perExtra.length) warns.push("phương án " + perExtra.join(", ") + " là cụm từ, không đặt dấu chấm cuối");
  }
  // độ dài phương án
  if(it.code!=="LO" && it.code!=="IS" && it.code!=="RE"){
    var wl = opts.map(qWords), k = L.indexOf(it.ans);
    if(k >= 0){
      var others = wl.filter(function(n, i){ return i !== k; }), avg = others.reduce(function(a, b){ return a + b; }, 0) / others.length, mx = Math.max.apply(null, others);
      if(wl[k] > mx && wl[k] - mx >= 3 && wl[k] >= 1.5*avg) warns.push("đáp án " + it.ans + " dài hơn hẳn các phương án sai (" + wl[k] + " từ, các phương án sai trung bình " + Math.round(avg) + " từ): thí sinh dễ chọn theo mẹo \"phương án dài nhất\"");
      else if(Math.max.apply(null, wl) - Math.min.apply(null, wl) >= 5 && Math.max.apply(null, wl) >= 2*Math.min.apply(null, wl)) warns.push("độ dài bốn phương án chênh nhau nhiều (" + L.map(function(x, i){ return x + ": " + wl[i]; }).join(", ") + " từ): nên viết dài tương đối bằng nhau");
    }
  }
  // VO: đáp án không khó hơn từ được hỏi
  if(it.code==="VO" && it.ans){
    var tw = qQuoted(stem), tl = tw && tw.indexOf(" ") < 0 ? lexLemma(tw.toLowerCase()) : null, tlv = tl ? LEXM[tl] : undefined;
    if(tlv !== undefined){
      var vp = vocabProfile(opts[L.indexOf(it.ans)]), hi = vp.lemmas.filter(function(l){ return l.lv > tlv; });
      if(hi.length) warns.push("đáp án câu từ vựng có từ ở mức cao hơn từ được hỏi \"" + tw + "\" (" + LVL[tlv] + "): " + hi.map(function(l){ return l.w + " (" + LVL[l.lv] + ")"; }).join(", ") + ". Đáp án nên ở mức bằng hoặc thấp hơn từ được hỏi");
    }
  }
  if(!it.explain) warns.push("thiếu dòng GIẢI THÍCH (vì sao đáp án đúng); bản nộp cần có giải thích đáp án");
}
function qOptForm(o){
  var w = String(o||"").trim().replace(/^["“‘'(]+/,""), f = (w.split(/\s+/)[0]||"").toLowerCase().replace(/[^a-z0-9'’-]/g,"");
  if(!f) return "";
  var ws = w.toLowerCase().split(/\s+/), nx = (ws[1]||"").replace(/[^a-z'’]/g,"");
  var NUMW = /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|dozen|about|around|over|under|nearly|almost|more|less|exactly)$/;
  if(/^[\d$€£%.,]/.test(w) || (NUMW.test(f) && ws.slice(0, 3).some(function(t){ return /\d/.test(t) || /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|dozen)$/.test(t.replace(/[^a-z]/g,"")); })) || (ws.length <= 3 && /\d/.test(w))) return "số";
  if(ws.length >= 4 && !/^(how|what|when|where|why|who|which|whether|to)$/.test(f) && ws.slice(1).some(function(t){ return /^(is|are|was|were|can|could|will|would|should|must|may|might|do|does|did|has|have|had|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|can't|won't)$/.test(t.replace(/[^a-z']/g,"")); })) return "câu";
  if(/^(how|what|when|where|why|who|which|whether)$/.test(f)) return /^\S+\s+to\s/i.test(w) ? "wh- to…" : "mệnh đề wh-…";
  if(f==="to") return "to + động từ";
  if(/^(it|they|he|she|we|i|you|there)$/.test(f) || /^(it's|they're|there's|he's|she's|we're|you're)$/.test(f.replace("’","'"))) return "câu";
  if(/^(is|are|was|were|be|can|could|will|would|should|must|may|might|do|does|did|has|have|had)$/.test(f)) return "câu hỏi/động từ";
  if(/^(by|for|in|on|at|with|from|because|since|after|before|during|through|without|about|of|as)$/.test(f)) return "cụm giới từ";
  if(/ing$/.test(f) && f.length > 4 && /^(a|an|the|their|his|her|its|our|my|your|this|that|these|those|to|for|with|on|in|at|about|how|what|more|less|new|other|some|people|them|it|up|out|down|off)$/.test(nx) && !/^(thing|king|ring|string|spring|wing|evening|morning|building|meeting|feeling|ceiling|wedding|clothing|nothing|something|anything|everything)$/.test(f)) return "V-ing";
  return "cụm danh từ";
}
function qStem(w){ return w.replace(/'s$/,"").replace(/(ies)$/,"y").replace(/(es|s)$/,""); }
function qWords(s){ return ((s||"").match(/[A-Za-z0-9][A-Za-z0-9'’\-.,:]*/g)||[]).length; }
function qQuoted(stem){ var m = (stem||"").match(/["“‘']([^"”’']{1,60})["”’']/); return m ? m[1].trim() : ""; }
function qParaOf(paras, quote){
  for(var i=0;i<paras.length;i++){ if(qFind(qNorm(paras[i]), quote) >= 0) return i+1; }
  return 0;
}
var qPassLem = null;
function checkQ(){
  var txt = S.slots.questions||"", draft = S.slots.draft||"";
  var P0 = parseQ(txt), res = {items:[], global:[], parsed:P0, n:P0.items.length};
  if(P0.empty) return res;
  P0.errs.forEach(function(e){ res.global.push({c:"b", t:e, fix:"Trình bày lại đúng khuôn: mỗi câu bắt đầu bằng dòng \"CÂU số | bậc mức | mã" + (qIsR() ? " | đoạn số" : "") + "\"."}); });
  if(!P0.items.length) return res;
  var isR = qIsR(), sk = qSK(), rows = qRows(), exp = qExpected();
  var a = analyze(draft), paras = isR ? a.body.map(function(b){ return b.text; }) : [draft], passN = qNorm(draft);
  var tiB1 = 2, tiB2 = 3;
  // tổng số câu
  if(res.n !== exp) res.global.push({c:"b", t:"Có " + res.n + " câu, cần " + exp + " câu.", fix:"Bộ câu hỏi phải có đúng " + exp + " câu theo bảng phân bố."});
  // phân bố bậc, mức
  var need = {}, have = {};
  rows.forEach(function(r){ var k = r[0] + " " + r[1]; need[k] = (need[k]||0) + r[2]; });
  P0.items.forEach(function(it){ var k = it.lv + " " + it.mức; have[k] = (have[k]||0) + 1; });
  var diff = [];
  Object.keys(need).forEach(function(k){ if((have[k]||0) !== need[k]) diff.push(k + ": có " + (have[k]||0) + ", cần " + need[k]); });
  Object.keys(have).forEach(function(k){ if(!need[k]) diff.push(k + ": có " + have[k] + ", cần 0"); });
  if(diff.length){
    var hard = isR || S.spec==="L1";
    res.global.push({c: hard ? "b" : "w", t:"Phân bố bậc và mức chưa khớp: " + diff.join("; ") + "." + (hard ? "" : " (Với Part " + SPEC[S.spec].grp + ", cách chia theo bài là gợi ý; nếu bạn chia khác, nhớ cân lại với các bài còn lại để đủ tổng của cả phần.)"), fix:"Phân bố bậc và mức chưa khớp bảng: " + diff.join("; ") + "."});
  }
  // vị trí đáp án
  var dist = {A:0,B:0,C:0,D:0}; P0.items.forEach(function(it){ if(dist[it.ans]!==undefined) dist[it.ans]++; });
  var maxL = Object.keys(dist).reduce(function(x,k){ return dist[k] > dist[x] ? k : x; }, "A");
  res.answerDist = dist;
  if(res.n >= 4 && dist[maxL] > Math.ceil(res.n/2)){
    var onMax = P0.items.filter(function(it){ return it.ans === maxL; }).map(function(it){ return it.n; }), mv = dist[maxL] - Math.ceil(res.n/4), d2 = {A:dist.A, B:dist.B, C:dist.C, D:dist.D}, plan = [];
    onMax.slice(-mv).forEach(function(n){ var to = ["A","B","C","D"].filter(function(k){ return k !== maxL; }).sort(function(x, y){ return d2[x] - d2[y]; })[0]; d2[to]++; d2[maxL]--; plan.push("câu " + n + " → " + to); });
    var how = plan.length ? " Gợi ý: " + plan.join(", ") + " (đổi chỗ đáp án với phương án đang ở vị trí đó; khuôn loại nhiễu đổi theo)." : "";
    res.global.push({c:"w", t:"Đáp án dồn vào " + maxL + " (" + dist[maxL] + "/" + res.n + " câu: câu " + onMax.join(", ") + ")." + how, fix:"Đổi vị trí đáp án để A, B, C, D phân bố đều hơn (hiện " + maxL + " có " + dist[maxL] + "/" + res.n + " câu)." + how});
  }
  // từng câu
  var lastPos = -1, lastN = 0, globalCodes = {MI:1, TO:1};
  P0.items.forEach(function(it){
    var probs = [], warns = [];
    var mrows = rows.filter(function(r){ return r[0]===it.lv && r[1]===it.mức; }), row = mrows[0];
    if(!it.lv || !it.mức) probs.push("dòng đầu thiếu bậc hoặc mức");
    else if(row){
      var allowed = {}; mrows.forEach(function(r){ qRowCodes(r).forEach(function(c){ allowed[c] = 1; }); });
      if(it.code && !allowed[it.code]) (isR ? probs : warns).push("mã " + it.code + " không có trong các mã được dùng cho " + it.lv + " " + it.mức + " (" + Object.keys(allowed).join(", ") + ")");
    }
    if(!it.stem) probs.push("thiếu dòng HỎI");
    var L = ["A","B","C","D"], miss = L.filter(function(x){ return !it.opts[x]; });
    if(miss.length) probs.push("thiếu phương án " + miss.join(", "));
    if(!it.ans) probs.push("thiếu ĐÁP ÁN");
    var seenO = {}; L.forEach(function(x){ var o = qNorm(it.opts[x]); if(it.opts[x] && seenO[o]) probs.push("phương án " + seenO[o] + " và " + x + " trùng nhau"); seenO[o] = x; });
    // căn cứ
    var pos = -1;
    if(!it.basis) probs.push("thiếu CĂN CỨ");
    else {
      pos = qFind(passN, it.basis);
      if(pos>=0) it._span = qSpanOf(passN, it.basis);
      if(pos<0){
        var fz = qFuzzyLocate(draft, it.basis);
        if(fz){ pos = fz.pos; warns.push("CĂN CỨ chép lệch vài chữ so với bài (khớp khoảng " + Math.round(fz.r*100) + "%): trang vẫn tìm được chỗ, nên chép lại cho đúng"); }
        else probs.push("CĂN CỨ không tìm thấy trong bài");
      }
    }
    if(isR && pos>=0 && it.para && /\d/.test(it.para)){
        var pn = parseInt(it.para.match(/\d+/)[0],10), real = qParaOf(paras, it.basis);
        if(!real){ var fz2 = qFuzzyLocate(draft, it.basis); if(fz2){ var spx = qSpans(draft); spx.forEach(function(sp, ii){ if(fz2.s >= sp[0] && fz2.s < sp[1]) real = ii + 1; }); } }
      if(real && real !== pn) warns.push("căn cứ nằm ở đoạn " + real + ", dòng đầu ghi đoạn " + pn);
    }
    // dạng của bốn phương án
    if(it.code!=="IS" && it.code!=="LO" && it.code!=="VO" && it.code!=="VO(ID)" && L.every(function(x){ return it.opts[x]; })){
      var fm = {}, cnt = {}; L.forEach(function(x){ fm[x] = qOptForm(it.opts[x]); cnt[fm[x]] = (cnt[fm[x]]||0) + 1; });
      var kinds = Object.keys(cnt);
      if(kinds.length > 1){
        var maj = kinds.reduce(function(a, b){ return cnt[b] > cnt[a] ? b : a; });
        if(cnt[maj] >= 2 && kinds.filter(function(k){ return cnt[k]===cnt[maj]; }).length===1){
          var odd = L.filter(function(x){ return fm[x]!==maj; });
          warns.push((odd.length===1 && odd[0]===it.ans ? "đáp án " + it.ans + " là phương án duy nhất khác dạng (" + fm[it.ans] + ", ba phương án kia là " + maj + "): thí sinh đoán được mà không cần bài" : "phương án " + odd.join(", ") + " khác dạng với các phương án còn lại (" + odd.map(function(x){ return x + ": " + fm[x]; }).join("; ") + "; đa số là " + maj + ")") + "; nên viết bốn phương án cùng một dạng");
        } else warns.push("bốn phương án không cùng một dạng (" + L.map(function(x){ return x + ": " + fm[x]; }).join("; ") + "); nên viết cùng một dạng");
      }
    }
    // tỉ lệ từ của bài trong đáp án (Nghe; QĐ 730 mục 2.1.3)
    if(!isR && pos>=0 && it.ans && it.opts[it.ans] && (it.code==="DE" || it.code==="MI")){
      var bw = {}; qNorm(it.basis).trim().split(/\s+/).forEach(function(w){ if(w) bw[qStem(w)] = 1; });
      var kw = qNorm(it.opts[it.ans]).trim().split(/\s+/).filter(Boolean), hit = kw.filter(function(w){ return bw[qStem(w)]; }).length, rr = kw.length ? hit/kw.length : 0, pc = Math.round(rr*100);
      var kc = kw.filter(function(w){ return Q_STOP.indexOf(" " + w + " ") < 0; }), cr = kc.length ? kc.filter(function(w){ return bw[qStem(w)]; }).length/kc.length : rr;
      var shortKey = kw.length <= 3 || qOptForm(it.opts[it.ans])==="số";
      if(it.lv==="B3"){
        if(cr < 0.3 && rr < 0.5) warns.push("đáp án chỉ giữ " + pc + "% số từ của căn cứ (" + Math.round(cr*100) + "% từ nội dung): bậc 3 yêu cầu đáp án là chi tiết " + (it.code==="MI" ? "(một phần ý chính) " : "") + "được diễn đạt lại đôi chút, chứa khoảng 50% số từ trong bài nghe");
        else if(rr > 0.85 && !shortKey) warns.push("đáp án giữ " + pc + "% số từ của căn cứ, gần như chép nguyên văn: bậc 3 yêu cầu diễn đạt lại đôi chút (khoảng 50% số từ trong bài nghe)");
      } else if(it.code==="MI" && cr >= 0.6) warns.push("đáp án giữ " + Math.round(cr*100) + "% từ nội dung của căn cứ: câu ý chính bậc " + (it.lv==="B4" ? "4" : "5") + " yêu cầu ý chính được diễn đạt lại hoàn toàn");
    }
    // thứ tự
    if(pos>=0 && !globalCodes[it.code] && !/cả bài|whole|toàn bài/i.test(it.para||"")){
      if(pos < lastPos) probs.push("hỏi chỗ đứng trước chỗ của câu " + lastN + ": câu hỏi phải theo thứ tự thông tin trong bài (câu hỏi về cả bài đặt cuối)");
      lastPos = pos; lastN = it.n;
    }
    // quy chiếu
    var target = qQuoted(it.stem);
    if(it.code==="RE"){
      if(!target) probs.push("không thấy từ được hỏi đặt trong ngoặc kép");
      else if(Q_PRON.indexOf(target.toLowerCase())<0) probs.push("từ được hỏi \"" + target + "\" không phải đại từ");
      L.forEach(function(x){ var o = it.opts[x]; if(!o) return;
        if(qWords(o) > 3) probs.push("phương án " + x + " dài " + qWords(o) + " từ (tối đa 3)");
        var core = o.replace(/['’]s?\s*$/,"").replace(/[.]$/,"");
        if(qFind(passN, core) < 0) core = core.replace(/^(the|a|an)\s+/i,"");
        if(qFind(passN, core) < 0){
          var cw = qNorm(core).trim().split(" ").filter(function(w){ return w && Q_STOP.indexOf(" " + w + " ") < 0; }).map(qStem);
          var pw = {}; passN.trim().split(" ").forEach(function(w){ pw[qStem(w)] = 1; });
          if(!cw.length || !cw.every(function(w){ return pw[w]; })) probs.push("phương án " + x + " (\"" + o + "\") không có trong bài");
          else warns.push("phương án " + x + " (\"" + o + "\") khác chữ trong bài một chút (số ít, số nhiều, mạo từ): nên chép đúng chữ trong bài");
        }
      });
    }
    if((it.code==="VO" || it.code==="VO(ID)") && target && qFind(passN, target) < 0) probs.push("từ được hỏi \"" + target + "\" không có trong bài");
    // định vị thông tin
    if(it.code==="LO" && it.ans && it.opts[it.ans] && pos>=0){
      var lo = (it.opts[it.ans].match(/\d+/)||[])[0], realP = qParaOf(paras, it.basis);
      if(!lo) probs.push("phương án LO phải là số đoạn (Paragraph N)");
      else if(realP && parseInt(lo,10)!==realP) probs.push("đáp án ghi đoạn " + lo + " nhưng căn cứ nằm ở đoạn " + realP);
    }
    // chèn câu
    if(it.code==="IS"){
      if(!it.insert) probs.push("thiếu dòng CÂU CHÈN");
      else if(qFind(passN, it.insert) < 0) probs.push("CÂU CHÈN không có nguyên văn trong bài");
      var ps = it.pos || {}, pm = L.filter(function(x){ return !ps[x]; });
      if(pm.length) probs.push("dòng VỊ TRÍ thiếu " + pm.join(", "));
      else {
        var at = L.map(function(x){ return qFind(passN, ps[x]); });
        if(at.some(function(p){ return p<0; })) probs.push("có vị trí không tìm thấy trong bài: " + L.filter(function(x,i){ return at[i]<0; }).join(", "));
        else if(!(at[0] < at[1] && at[1] < at[2] && at[2] < at[3])) probs.push("A, B, C, D chưa xếp theo thứ tự xuất hiện trong bài");
        else if(it.insert && it.ans){
          var ins = qFind(passN, it.insert), ansEnd = at[L.indexOf(it.ans)] + qNorm(ps[it.ans]).trim().length + 1;
          if(ins >= 0 && Math.abs(ins - ansEnd) > 2) probs.push("vị trí đáp án " + it.ans + " không phải chỗ câu chèn được rút ra");
        }
      }
    }
    // dòng LOẠI khớp đáp án và khuôn
    var KTx = qKhuonTypes(it);
    if(it.types && Object.keys(it.types).length){
      var markedOk = L.filter(function(k){ return it.types[k]==="đúng"; });
      if(it.ans && markedOk.length && markedOk.indexOf(it.ans)<0) probs.push("dòng LOẠI ghi đáp án đúng là " + markedOk.join(", ") + " nhưng ĐÁP ÁN là " + it.ans);
      if(KTx){
        var nums = L.filter(function(k){ return k!==it.ans; }).map(function(k){ return it.types[k]; });
        if(nums.some(function(t){ return !/^[123]$/.test(t||""); })) warns.push("dòng LOẠI chưa ghi đủ số loại (1), (2), (3) cho các phương án sai");
        else if(it.code!=="ID" && (nums.slice().sort().join("")!=="123")) warns.push("ba phương án sai chưa đủ ba loại khác nhau theo khuôn (đang là " + nums.join(", ") + ")");
      }
    } else if(KTx) warns.push("thiếu dòng LOẠI (phương án nào thuộc loại nào trong khuôn của QĐ 730)");
    // QĐ 730: DE bậc 3 trung bình — phương án sai phải có trong bài; thông tin được nhắc ở nhiều chỗ, không chỉ một đoạn
    if(isR && it.code==="DE" && it.lv==="B3" && it.mức==="trung bình" && it.ans){
      var NMc = qNormMap(draft), spC = qSpans(draft);
      L.forEach(function(x){ if(x!==it.ans && it.opts[x] && !qOptRanges(draft, NMc, it.opts[x]).length) warns.push("phương án sai " + x + " không thấy trong bài (QĐ 730: các lựa chọn sai phải có trong bài đọc)"); });
      var pa = qParasOfRanges(spC, qOptRanges(draft, NMc, it.opts[it.ans]||"").concat(it.basis ? qLocate(draft, it.basis, NMc) : []));
      if(pa.length < 2) warns.push("thông tin của đáp án chỉ thấy ở " + (pa.length ? "đoạn " + pa[0] : "một chỗ") + " (QĐ 730: thông tin liên quan được nhắc đến trong cả bài chứ không chỉ trong một đoạn)");
    }
    // từ ngữ tuyệt đối không có trong bài
    if(it.stem && L.every(function(x){ return it.opts[x]; })){
      var zone = draft;
      if(isR){
        var bp = it.basis ? qParaOf(paras, it.basis) : 0, cp = it.para && /\d/.test(it.para) ? parseInt(it.para.match(/\d+/)[0],10) : 0;
        var ps = [bp, cp].filter(function(p){ return p > 0 && paras[p-1]; });
        if(ps.length) zone = ps.filter(function(p,i,a){ return a.indexOf(p)===i; }).map(function(p){ return paras[p-1]; }).join(" ");
      }
      var zoneN = qNorm(zone), absOpts = [];
      L.forEach(function(x){
        var bad = qAbsTerms(it.opts[x]).filter(function(w){ return !qAbsSupported(w, zoneN); });
        if(!bad.length) return;
        absOpts.push(x);
        if(x===it.ans) warns.push("đáp án " + x + " dùng từ tuyệt đối \"" + bad.join("\", \"") + "\" mà bài không nói tới mức đó: kiểm lại đáp án có nói quá bài không");
        else warns.push("phương án " + x + " dùng từ tuyệt đối \"" + bad.join("\", \"") + "\" mà bài không nói vậy: thí sinh dễ loại ngay; nên nói cùng mức độ với đáp án");
      });
      var wrongAbs = absOpts.filter(function(x){ return x!==it.ans; }).length;
      if(it.opts[it.ans] && HEDGE_RE.test(it.opts[it.ans]) && wrongAbs >= 2) warns.push("đáp án dùng từ rào đón (may, some, often…) trong khi " + wrongAbs + " phương án sai dùng từ tuyệt đối: thí sinh đoán được đáp án mà không cần đọc bài");
    }
    // độ dài phương án (Nghe)
    if(!isR){
      var maxW = it.lv==="B3" ? 7 : 9;
      L.forEach(function(x){ if(it.opts[x] && qWords(it.opts[x]) > maxW) probs.push("phương án " + x + " dài " + qWords(it.opts[x]) + " từ (câu " + it.lv + " tối đa " + maxW + ")"); });
    }
    // từ vựng của câu hỏi bậc 3 (Đọc)
    if(isR && it.lv==="B3" && it.stem){
      var txtQ = [it.stem.replace(/["“‘'][^"”’']{1,60}["”’']/g," ")].concat(L.map(function(x){ return it.opts[x]||""; })).join(". ") + ".";
      var lim = it.code==="DE[P]" ? tiB2 : tiB1, vp = vocabProfile(txtQ);
      if(!qPassLem || qPassLem.src !== draft){ var vpp = vocabProfile(draft), set = {}; vpp.lemmas.forEach(function(l){ set[l.w] = 1; }); vpp.offList.forEach(function(o){ set[o.w] = 1; }); qPassLem = {src:draft, set:set}; }
      var hi = vp.lemmas.filter(function(l){ return l.lv > lim && !qPassLem.set[l.w]; }).map(function(l){ return l.w + " (" + LVL[l.lv] + ")"; });
      if(hi.length) warns.push("câu bậc 3 có từ trên mức " + LVL[lim] + ": " + hi.join(", "));
    }
    // Nghe: từ trong câu hỏi, phương án không khó hơn kịch bản (tập huấn Viết Listening items)
    if(!isR && it.stem){
      var tiT = LVL.indexOf(S.level); if(tiT < 0) tiT = 3;
      var txtL = [it.stem.replace(/["“‘'][^"”’']{1,60}["”’']/g," ")].concat(L.map(function(x){ return it.opts[x]||""; })).join(". ") + ".", vpL = vocabProfile(txtL);
      if(!qPassLem || qPassLem.src !== draft){ var vpp2 = vocabProfile(draft), set2 = {}; vpp2.lemmas.forEach(function(l){ set2[l.w] = 1; }); vpp2.offList.forEach(function(o){ set2[o.w] = 1; }); qPassLem = {src:draft, set:set2}; }
      var hiL = vpL.lemmas.filter(function(l){ return l.lv > tiT && !qPassLem.set[l.w]; }).map(function(l){ return l.w + " (" + LVL[l.lv] + ")"; });
      if(hiL.length) warns.push("câu hỏi Nghe có từ trên mức của bài (" + S.level + ") mà kịch bản không có: " + hiL.join(", ") + ". Từ trong câu hỏi và phương án không nên khó hơn kịch bản, để câu không chuyển sang đo kỹ năng đọc");
    }
    // trình bày, độ dài phương án, All/None, NOT/EXCEPT, VO, giải thích
    qFormatChecks(it, isR, probs, warns);
    res.items.push({it:it, probs:probs, warns:warns, pos:pos});
  });
  // tính độc lập giữa các câu
  res.items.forEach(function(x){
    var k = x.it.ans && x.it.opts[x.it.ans]; if(!k || x.it.code==="LO" || x.it.code==="IS") return;
    var kn = qNorm(k).trim(), cw = kn.split(" ").filter(function(w){ return w && Q_STOP.indexOf(" " + w + " ") < 0; });
    if(cw.length < 2 || kn.length < 8) return;
    res.items.forEach(function(y){
      if(y===x) return;
      var hay = qNorm((y.it.stem||"") + " " + ["A","B","C","D"].map(function(z){ return y.it.opts[z]||""; }).join(" | "));
      if(hay.indexOf(" " + kn + " ") >= 0) y.warns.push("câu hỏi hoặc phương án có nguyên cụm \"" + k + "\", là đáp án của câu " + x.it.n + ": câu này để lộ đáp án câu kia, nên đổi cách diễn đạt");
    });
  });
  // mỗi nội dung chỉ dùng cho một câu hỏi (quy ước nhóm, Nick chốt 11/11/2026)
  var spans = res.items.filter(function(x){ return x.it._span && !globalCodes[x.it.code] && x.it.code!=="IS" && !/cả bài|whole|toàn bài/i.test(x.it.para||""); });
  spans.forEach(function(x, i){
    for(var j = 0; j < i; j++){ var y = spans[j], A = x.it._span, B = y.it._span;
      if(A[0] < B[1] && B[0] < A[1]){ x.probs.push("căn cứ trùng hoặc chồng lên căn cứ của câu " + y.it.n + ": mỗi nội dung chỉ dùng cho một câu hỏi, chọn chỗ hỏi khác cho một trong hai câu"); break; } }
  });
  // câu hỏi bám bản đồ chất liệu (quy trình)
  if(S.map && S.map.rows){
    var mrows = Object.keys(S.map.rows).map(function(k){ return S.map.rows[k]; }).filter(function(v){ return v.q; }).map(function(v){ return {code:v.code, sp:[qSpanOf(passN, v.q), v.alt ? qSpanOf(passN, v.alt) : null].filter(Boolean)}; });
    if(mrows.length) res.items.forEach(function(x){
      var A = x.it._span; if(!A || globalCodes[x.it.code] || x.it.code==="IS") return;
      var hit = mrows.filter(function(m){ return m.sp.some(function(B){ return A[0] < B[1] && B[0] < A[1]; }); });
      if(!hit.length) x.warns.push("căn cứ không thuộc chỗ hỏi nào trong bản đồ chất liệu đã duyệt: người thẩm định xét câu này");
      else if(!hit.some(function(m){ return !m.code || m.code === x.it.code; })) x.warns.push("mã " + x.it.code + " khác mã của dòng bản đồ chất liệu có chỗ hỏi này (" + hit.map(function(m){ return m.code; }).join(", ") + ")");
    });
    // đúng câu số n của bản đồ (đã xếp theo thứ tự trong đề)
    if(typeof mapOrder === "function" && typeof mapStatus === "function" && mapStatus().full){
      var ORD = mapOrder();
      res.items.forEach(function(x){ var e = ORD.seq[(+x.it.n || 0) - 1]; if(!e) return;
        if(x.it.lv !== e.l.lv || x.it.mức !== e.l.m || x.it.code !== e.code) x.warns.push("theo bản đồ chất liệu, câu " + x.it.n + " là " + e.l.lv + " " + e.l.m + " · " + e.code + (e.para ? " · đoạn " + e.para : "") + "; câu này ghi " + [x.it.lv, x.it.mức].join(" ") + " · " + x.it.code);
      });
    }
  }
  // bài Đọc: đoạn nào chưa có câu hỏi
  if(isR && paras.length > 1){
    var cov = {};
    res.items.forEach(function(x){
      var pn = (String(x.it.para||"").match(/\d+/)||[])[0];
      var bp = x.pos >= 0 ? qParaOf(paras, x.it.basis) : 0;
      if(bp) cov[bp] = 1; else if(pn) cov[+pn] = 1;
    });
    var miss = []; for(var pi = 1; pi <= paras.length; pi++) if(!cov[pi]) miss.push(pi);
    if(miss.length) res.global.push({c:"w", t:"Đoạn " + miss.join(", ") + " chưa có câu hỏi nào.", fix:"Mỗi đoạn của bài nên có ít nhất một câu hỏi (quy định của nhóm soạn đề). Đổi chỗ hỏi của một câu đang dồn vào đoạn khác sang đoạn " + miss.join(", ") + ", giữ đúng bậc, mức và mã câu."});
  }
  // thử mù
  var bl = (S.slots.qblind||"").trim();
  if(bl){
    if(S.qBlindFor && S.qBlindFor !== qHash(txt)) res.global.push({c:"w", t:"Kết quả thử mù là của bộ câu hỏi trước khi sửa.", fix:"Chạy lại câu lệnh thử mù cho bộ câu hiện tại nếu muốn kiểm lại."});
    else {
      var B = parseBlind(bl); res.blind = B;
      if(!B.n) res.global.push({c:"w", t:"Không đọc được kết quả thử mù.", fix:"Dán đúng khối code AI trả về, mỗi dòng dạng CÂU 1 | ĐOÁN: B | CHẮC: cao | LÝ DO: …"});
      res.items.forEach(function(x){ var b = B.map[x.it.n]; if(b && b.g && b.g===x.it.ans && b.c!=="thấp") x.warns.push("thử mù: không có bài, AI vẫn đoán đúng " + b.g + " (độ chắc " + b.c + ")" + (b.why ? "; lý do AI: " + b.why : "") + ". Xem mục \"Phụ thuộc bài\" khi soát tay"); });
    }
  }
  // vị trí và độ rải (Nghe Part 2, 3; kỹ thuật biên soạn)
  if(!isR && SPEC[S.spec].grp !== 1){
    var Wt = passN.trim() ? passN.trim().split(/\s+/).length : 0, wAt = function(p){ var s = passN.slice(0, p).trim(); return s ? s.split(/\s+/).length : 0; }, sec = function(w){ return Math.round(w/2.5); };
    var loc = res.items.filter(function(x){ return x.pos >= 0 && !globalCodes[x.it.code] && !/cả bài|whole|toàn bài/i.test(x.it.para||""); }).map(function(x){ var w0 = wAt(x.pos); return {x:x, w0:w0, w1: w0 + qNorm(x.it.basis).trim().split(/\s+/).length}; }).sort(function(a, b){ return a.w0 - b.w0; });
    if(Wt && loc.length){
      var f0 = loc[0]; if(f0.w0 < 25) f0.x.warns.push("căn cứ nằm ở " + f0.w0 + " từ đầu bài (khoảng " + sec(f0.w0) + " giây đầu): nên hỏi từ sau khoảng 25–40 từ đầu (10–15 giây) để thí sinh quen giọng và bối cảnh");
      var lz = loc[loc.length-1], tail = Wt - lz.w1, maxGap = 0; for(var g2 = 1; g2 < loc.length; g2++) maxGap = Math.max(maxGap, loc[g2].w0 - loc[g2-1].w1);
      if(loc.length > 1 && tail > maxGap && tail > 25) lz.x.warns.push("sau căn cứ của câu này còn khoảng " + tail + " từ (khoảng " + sec(tail) + " giây) không có câu hỏi, xa hơn mọi khoảng cách giữa hai câu liền nhau: câu cuối nên hỏi vào thông tin gần cuối bài");
      for(var k = 1; k < loc.length; k++){ var pa = loc[k-1], pb = loc[k], ea = pa.x.pos + qNorm(pa.x.it.basis).length - 1;
        if(pb.x.pos > ea && qSentAt(passN, ea) === qSentAt(passN, pb.x.pos)) pb.x.warns.push("căn cứ nằm cùng một câu với căn cứ của câu " + pa.x.it.n + ": hai câu hỏi quá sát, thí sinh khó kịp; tách sang câu khác hoặc chèn đoạn đệm (chuyển ý, hỏi lại, xác nhận)");
        else if(SPEC[S.spec].grp === 2 && pb.x.pos > ea && qTurnAt(passN, ea) === qTurnAt(passN, pb.x.pos)) pb.x.warns.push("căn cứ nằm cùng một lượt lời với căn cứ của câu " + pa.x.it.n + ": hai câu hỏi quá sát, thí sinh khó kịp; nên có lượt lời khác chen giữa"); }
    }
  }
  return res;
}
function qIssuesText(R){
  var L = [];
  R.global.forEach(function(g){ L.push("- Cả bộ: " + (g.c==="b" ? "[phải sửa] " : "[nên xem] ") + (g.fix || g.t)); });
  R.items.forEach(function(x){
    var p = x.probs.map(function(t){ return "[phải sửa] " + t; }).concat(x.warns.map(function(t){ return "[nên xem; chỉ sửa nếu đúng là lỗi, nếu bài cho phép thì giữ nguyên] " + t; })), f = qManFails(x.it), note = (qManState(x.it).note||"").trim();
    f.forEach(function(k){ p.push("[giáo viên soát] " + QMAN_FIX[k](x.it)); });
    if(f.length && note) p.push("ghi chú của giáo viên: " + note);
    if(p.length) L.push("- Câu " + x.it.n + ": " + p.map(function(t){ return t.trim().replace(/[.;\s]+$/,""); }).join("; ") + ".");
  });
  return L.length ? L.join("\n") : "(không có lỗi)";
}
function qPassageText(){
  var raw = S.slots.draft || "";
  if(!raw.trim()) return "[chưa có bài]";
  if(!qIsR()) return raw.trim();
  var a = analyze(raw), first = true, n = 0;
  return raw.split(/\n\s*\n/).map(function(p){ p = p.trim(); if(!p) return null;
    if(first && a.titles.length && a.titles[0].text.trim()===p){ first = false; return p; }
    first = false; n++; return "[Đoạn " + n + "] " + p; }).filter(function(x){ return x!==null; }).join("\n\n");
}
function qSelfCheckText(){
  var isR = qIsR(), n = qExpected(), L = [];
  L.push("Đủ " + n + " câu, đánh số liên tục; số câu ở mỗi bậc và mức đúng bảng phân bố; mã mỗi câu nằm trong các mã của dòng đó.");
  L.push("Dòng đầu mỗi câu đúng khuôn: CÂU số | bậc và mức viết dạng B3 thấp / B3 trung bình / B4 cao / B5 thấp… | mã" + (isR ? " | đoạn số" : "") + ".");
  L.push("Mỗi câu có đủ HỎI, A, B, C, D, ĐÁP ÁN, CĂN CỨ, LOẠI, NHIỄU; bốn phương án khác nhau.");
  L.push("Dòng LOẠI: phương án ghi ĐÚNG trùng với ĐÁP ÁN; ở dạng câu có khuôn, ba phương án sai thuộc ba loại (1), (2), (3) khác nhau và mỗi phương án đúng là loại đã ghi.");
  L.push("CĂN CỨ chép y nguyên 5–20 từ liền nhau trong " + (isR ? "bài (không chép nhãn [Đoạn N]" : "kịch bản (không chép tên người nói") + ", không sửa chữ, không thêm dấu …, không gộp hai chỗ)" + (isR ? "; số đoạn ở dòng đầu đúng là đoạn chứa CĂN CỨ theo nhãn [Đoạn N]" : "") + ".");
  L.push("Câu hỏi theo thứ tự xuất hiện của CĂN CỨ trong bài; câu hỏi về cả bài đặt cuối. Mỗi nội dung chỉ dùng cho một câu hỏi: căn cứ của hai câu không trùng, không chồng lên nhau.");
  L.push("Đáp án rải đều: với " + n + " câu, không chữ nào làm đáp án quá " + Math.ceil(n/2) + " lần" + (n >= 8 ? " (nên mỗi chữ 2–3 lần)" : "") + ".");
  if(isR){
    L.push("Câu RE: từ được hỏi đặt trong ngoặc kép và là đại từ; mỗi phương án tối đa 3 từ (kể cả mạo từ), chép đúng chữ có trong bài.");
    L.push("Câu VO, VO(ID): từ hoặc cụm từ được hỏi đặt trong ngoặc kép, có nguyên văn trong bài.");
    L.push("Câu LO: bốn phương án dạng Paragraph N; đáp án đúng là đoạn chứa CĂN CỨ.");
    L.push("Câu IS: CÂU CHÈN chép nguyên văn một câu trong bài; VỊ TRÍ A–D theo thứ tự trong bài; đáp án là vị trí ngay sau câu đứng trước câu chèn.");
    L.push("Câu DE bậc 3 trung bình: phương án sai đều có trong bài; thông tin của đáp án được nhắc ở ít nhất 2 đoạn.");
    L.push("Câu bậc 3: câu hỏi và phương án chỉ dùng từ mức B1 trở xuống (DE[P]: B2 trở xuống).");
  } else {
    L.push("Độ dài phương án: câu bậc 3 tối đa 7 từ, câu bậc 4 và 5 tối đa 9 từ, tính cả con số.");
  }
  L.push("Không phương án nào dùng từ tuyệt đối (all, every, always, never, only, completely, the most, the best…) mà bài không nói; đáp án không phải phương án duy nhất có từ rào đón (may, some, often…).");
  return L.map(function(x, i){ return (i+1) + ". " + x; }).join("\n");
}
P.ovfix = {title:"Câu lệnh sửa các câu chép nguyên văn", inputs:["draft"], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây còn {ovPct} chữ trùng nguyên văn với văn bản nguồn (tính các chuỗi từ 5 từ trở lên giống hệt nguồn); yêu cầu dưới 20%. Cần bớt ít nhất {ovNeed} từ trùng.\n\nHãy viết lại CHỈ những câu dưới đây (xếp từ chỗ trùng nhiều nhất); phần trong ngoặc kép là chuỗi đang trùng với nguồn:\n{ovList}\n\nCách viết lại:\n- Đổi cấu trúc câu và cách diễn đạt (đổi chủ ngữ, chủ động hoặc bị động, đổi thứ tự mệnh đề, dùng từ đồng nghĩa), không chỉ thay một hai từ. Sau khi sửa, không còn chuỗi 5 từ liền nhau nào giống chuỗi đang trùng.\n- Giữ nguyên nghĩa, sự kiện, con số, tên riêng, thuật ngữ, mức độ chắc chắn (may, suggest…) và thái độ của người viết hoặc người nói.\n- Phần trùng chỉ là tên riêng, tên tổ chức, thuật ngữ hoặc con số thì giữ nguyên, không cần sửa.\n- Không tách câu, không gộp câu; số từ mỗi câu chênh không quá 3 từ so với câu cũ.\n- Từ mới dùng ở mức {level} trở xuống có trong CEFR-J Wordlist 1.5 hoặc Octanove Vocabulary Profile 1.0; chọn từ có số âm tiết tương đương từ cũ, giữ độ dài câu tương đương câu cũ (Flesch Reading Ease phải {freWin}). Chính tả {spelling}.\n- Mọi câu khác giữ nguyên từng chữ.\n\n{keepPassing}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: toàn bài đã sửa trước; sau đó một dòng riêng \"=== THAY ĐỔI ===\", rồi liệt kê từng thay đổi theo dạng: câu cũ → câu mới, mỗi thay đổi một dòng.\n\nBÀI:\n{{draft}}"};
function qExtend(v){
  var st = lastOvStat, runs = lastOvRuns || [];
  v.ovPct = st && st.T ? (100*st.c/st.T).toFixed(1) + "%" : "?";
  v.ovNeed = st ? Math.max(1, Math.ceil(st.c - 0.18*st.T)) : "?";
  v.ovList = runs.length ? runs.map(function(x, i){ return (i+1) + ". " + x.t + "\n   Trùng: " + x.chunks.map(function(c){ return c==="(cả câu)" ? "cả câu chép nguyên văn" : "\"" + c + "\""; }).join("; "); }).join("\n") : "(không có)";
  v.qPassage = qPassageText(); v.qSelfCheck = qSelfCheckText();
  v.qN = qExpected(); v.qBlueprint = qBlueprintText(); v.qRules = qRulesText(); v.qFormat = qFormatText();
  var grp = SPEC[S.spec].grp;
  v.qPartNote = (!qIsR() && grp && QPART["L"+grp]) ? "Bối cảnh: " + QPART["L"+grp] + "\n" : "";
  var notes = slotVal("notes")||"", al = notes.split("\n").filter(function(l){ l = l.replace(/\*\*/g,""); return ANCHOR_RE.test(l) || FRAME_RE.test(l.normalize("NFC")); });
  v.qAnchors = qIsR() && al.length ? "- Dùng các điểm neo đã ghi khi biên tập (mã | đoạn | trích) làm chỗ ra câu hỏi khi phù hợp:\n" + al.join("\n") + "\n" : "";
  v.readOrListenNounCap = qIsR() ? "BÀI ĐỌC" : "KỊCH BẢN";
  v.qPassNote = qIsR() ? " (các nhãn [Đoạn N] chỉ để đánh số đoạn, không thuộc bài)" : "";
  v.qIssues = (S.slots.questions||"").trim() ? qIssuesText(checkQ()) : "";
  v.spkPlan = spkPlanText();
  v.qBlindItems = qBlindItemsText();
  v.readOrListenVerb = qIsR() ? "đọc" : "nghe";
}

/* ---- Soát tay (máy không kiểm được) ---- */
function qNeedsImplicit(it){ return qIsR() ? ((it.lv==="B4" && it.mức==="cao") || it.lv==="B5") : (it.lv==="B5" || it.code==="IN"); }
var KT_DEP = ["thông tin đúng nhưng không liên quan","dùng một vài từ của bài nhưng hiểu sai","liên quan về nghĩa nhưng quá rộng hoặc quá hẹp"];
var KT_SCAT = ["thông tin đúng nhưng không liên quan","thông tin liên quan nhưng sai một phần","gần đúng nhất nhưng một khía cạnh không có trong bài"];
var KT_L = {
  det:{B3:["chi tiết không liên quan, không được nhắc trong bài","chi tiết không liên quan, có từ đọc gần giống từ khoá","chi tiết không chính xác"],
       B4:["chi tiết sai hoàn toàn","chi tiết sai một phần","chi tiết đúng nhưng người nói không đề cập"],
       B5:["chi tiết đúng nhưng người nói không đề cập","chi tiết đúng nhưng bị diễn đạt lại sai","chi tiết không chính xác và diễn đạt lại sai"]},
  main:{B3:["chi tiết không được đề cập","chi tiết có từ đọc gần giống từ khoá","ý rộng hơn ý được đề cập"],
        B4:["chi tiết có từ đọc gần giống từ khoá","ý rộng hơn ý được đề cập","ý chính không chính xác"],
        B5:["một chi tiết quan trọng trong bài","một ý phụ của bài","một ý phụ khác"]},
  inf:{B3:["có từ khoá của bài, diễn đạt khác ý người nói","có từ khoá, nói điều không được đề cập","có từ đọc gần giống từ khoá, nói ý không được đề cập"],
       B4:["có từ khoá của bài, diễn đạt khác ý người nói","có từ khoá, nói điều không được đề cập","diễn đạt lại sai hàm ý của người nói"],
       B5:["có từ khoá của bài, diễn đạt khác ý người nói","có từ khoá, nói điều không được đề cập","diễn đạt lại sai hàm ý của người nói"]},
  id:{B5:["một nghĩa của cụm từ nhưng không hợp ngữ cảnh","khái niệm có trong bài nhưng không đúng nghĩa cụm từ","khái niệm có trong bài nhưng không đúng nghĩa cụm từ"]}
};
function qKhuonTypes(it){
  if(qIsR()){
    var c = it.code;
    if(c==="DE" && (it.lv==="B5" || (it.lv==="B4" && it.mức!=="thấp"))) return KT_SCAT;
    if(c==="DE[P]" || (c==="RP" && it.lv==="B5") || c==="IN" || (it.lv==="B5" && c!=="RE" && c!=="IS" && c!=="LO" && c!=="VO" && c!=="VO(ID)")) return KT_DEP;
    return null;
  }
  var t = {DE:"det", MI:"main", IN:"inf", OP:"inf", RP:"inf", ID:"id"}[it.code] || "det";
  return (KT_L[t] && (KT_L[t][it.lv] || KT_L[t].B5)) || null;
}
function qOptNote(it, k){
  if(k===it.ans) return "đáp án đúng";
  var kt = qKhuonTypes(it), t = it.types && it.types[k];
  if(kt && t && /^[123]$/.test(t)) return "nhiễu loại (" + t + "): " + kt[+t-1];
  return "phương án sai";
}
function qKhuon(it){
  if(qIsR()){
    var c = it.code;
    if(c==="RE") return R_RULES.RE;
    if(c==="IS") return R_RULES.IS;
    if(c==="LO") return R_RULES.LO;
    if(c==="VO" || c==="VO(ID)") return "QĐ 730 không quy định khuôn riêng cho câu đoán nghĩa từ. Khi soát: phương án sai phải thay được vào câu nhưng sai nghĩa trong ngữ cảnh (ví dụ một nghĩa khác của chính từ đó); phương án thí sinh loại được mà không cần đọc bài là nhiễu vô tác dụng.";
    if(c==="DE" && it.lv==="B3" && it.mức==="trung bình") return R_RULES.DEsome;
    if(c==="DE" && (it.lv==="B5" || (it.lv==="B4" && it.mức!=="thấp"))) return R_RULES.SCAT;
    if(c==="DE[P]" || (c==="RP" && it.lv==="B5") || c==="IN" || it.lv==="B5") return R_RULES.DEP;
    return "Phương án sai phải liên quan tới bài nhưng sai rõ ràng khi đối chiếu với bài; chỉ một đáp án đúng.";
  }
  var t = {DE:"det", MI:"main", IN:"inf", OP:"inf", RP:"inf", ID:"id"}[it.code] || "det";
  return (L_RULES[t] && (L_RULES[t][it.lv] || L_RULES[t].B5)) || "";
}
function qSig(it){ return draftSig([it.lv, it.mức, it.code, it.stem, it.opts.A, it.opts.B, it.opts.C, it.opts.D, it.ans].join("|")); }
function qManState(it){ S.qman = S.qman || {}; return S.qman[qSig(it)] || {}; }
function qManKeys(it){ return (qNeedsImplicit(it) ? ["imp"] : []).concat(["dis","one","dep"]); }
function qManDone(it){ var m = qManState(it); return qManKeys(it).every(function(k){ return m[k]===true; }); }
function qManFails(it){ var m = qManState(it); return qManKeys(it).filter(function(k){ return m[k]==="no"; }); }
var QMAN_FIX = {
  imp:function(it){ return "câu đang ghi " + it.lv + " " + it.mức + " nhưng đọc căn cứ là thấy ngay đáp án, chưa có hàm ngôn. Viết lại câu hỏi và các phương án để thí sinh phải suy ra đáp án từ bài (dụng ý, hàm ý, thái độ không nói thẳng); có thể chọn chỗ khác trong bài có hàm ý; giữ nguyên bậc, mức và mã"; },
  dis:function(it){ return "phương án nhiễu chưa đúng khuôn hoặc vô tác dụng (thí sinh loại được mà không cần đọc bài). Viết lại các phương án sai theo khuôn: " + qKhuon(it); },
  one:function(it){ return "có hơn một phương án bảo vệ được bằng bài. Sửa các phương án sai để chỉ còn đúng một đáp án, mỗi phương án sai phải sai rõ ràng khi đối chiếu với bài"; },
  dep:function(it){ return "trả lời được bằng hiểu biết thông thường hoặc logic đời sống mà không cần " + (qIsR() ? "đọc" : "nghe") + " bài. Sửa để chỉ bài mới cho biết đáp án: hỏi vào chi tiết riêng của bài (con số, lý do, quyết định, ý kiến của người nói) thay vì điều ai cũng đoán được, và viết các phương án sai cũng hợp lý ngang đáp án khi không có bài; giữ đúng căn cứ, bậc, mức và khuôn phương án nhiễu"; }
};
function qBlindNote(it){
  var bl = (S.slots.qblind||"").trim(); if(!bl || (S.qBlindFor && S.qBlindFor !== qHash(S.slots.questions||""))) return "";
  var b = parseBlind(bl).map[it.n]; if(!b) return "";
  var hit = b.g && b.g===it.ans;
  return ' <span class="' + (hit && b.c!=="thấp" ? "warnc" : "muted") + '">Thử mù: ' + (b.g ? "AI đoán " + esc(b.g) + (hit ? " (trúng đáp án)" : " (trật)") + ", độ chắc " + esc(b.c) : "AI không đoán") + (b.why ? "; " + esc(b.why) : "") + '.</span>';
}
function qManHTML(it){
  var sig = qSig(it), m = qManState(it), fails = qManFails(it);
  var row = function(k, label){
    var v = m[k], nm = 'qm-' + sig + '-' + k;
    return '<div class="qman"><div class="qmlab">' + label + '</div><div class="qmbtn">'
      + '<label class="qyes' + (v===true ? " on" : "") + '"><input type="radio" name="' + nm + '" data-qm="' + sig + '|' + k + '" value="yes"' + (v===true ? " checked" : "") + '>Đạt</label>'
      + '<label class="qno' + (v==="no" ? " on" : "") + '"><input type="radio" name="' + nm + '" data-qm="' + sig + '|' + k + '" value="no"' + (v==="no" ? " checked" : "") + '>Chưa đạt</label></div></div>';
  };
  return '<div class="qmanbox"><div class="small"><b>Bạn tự soát câu này</b> (máy không kiểm được):</div>'
    + (qNeedsImplicit(it) ? row("imp", "<b>Có hàm ngôn thật:</b> phải suy ra mới chọn được đáp án; nếu đọc căn cứ là thấy ngay thì câu chưa đạt " + esc(it.lv + " " + it.mức) + ".") : "")
    + row("dis", "<b>Phương án nhiễu đúng khuôn của QĐ 730</b> và đều có tác dụng (không có phương án loại được mà không cần đọc bài, ví dụ vì dùng từ tuyệt đối như the best, all, only… mà bài không nói). <span class=\"muted\">Khuôn: " + esc(qKhuon(it)) + "</span>")
    + row("one", "<b>Đúng một đáp án:</b> che đáp án, đọc lại căn cứ, không phương án nào khác bảo vệ được.")
    + row("dep", "<b>Phụ thuộc bài:</b> che bài, chỉ đọc câu hỏi và bốn phương án: không đoán được đáp án bằng hiểu biết thông thường hoặc logic đời sống (không có phương án nào hợp lý hẳn hay khác hẳn các phương án còn lại)." + qBlindNote(it))
    + (fails.length ? '<label class="field qmnote"><span class="lab small">Ghi chú cho AI (không bắt buộc): phương án nào, vì sao chưa đạt</span><textarea class="sm" data-qnote="' + sig + '" placeholder="ví dụ: phương án C không phải nghĩa của từ; B cũng đúng vì đoạn 3 có nói…">' + esc(m.note||"") + '</textarea></label><div class="small no">Câu này đã được đưa vào câu lệnh ở khung "Sửa các câu có lỗi" bên dưới.</div>' : "")
    + '</div>';
}
/* ---- Bài hiển thị song song, tô chỗ đang soát ---- */
function qNormMap(raw){
  var out = "", map = [], prevSp = true, low = raw.toLowerCase();
  for(var i=0;i<low.length;i++){
    var c = low[i];
    if(c==="’"||c==="‘"||c==="`") c = "'";
    if(/[a-z0-9']/.test(c)){ out += c; map.push(i); prevSp = false; }
    else if(!prevSp){ out += " "; map.push(i); prevSp = true; }
  }
  return {n:" " + out + " ", map:[-1].concat(map).concat([raw.length])};
}
function qLocate(raw, quote, NM, all){
  NM = NM || qNormMap(raw);
  var segs = (quote||"").split(/\.\.\.|…/).map(function(x){ return qNorm(x).trim(); }).filter(function(x){ return x.length > 1; });
  var res = [];
  segs.forEach(function(q){
    var from = 0, p;
    while((p = NM.n.indexOf(" " + q + " ", from)) >= 0){
      var s0 = NM.map[p+1], e0 = NM.map[p + q.length];
      if(s0!==undefined && e0!==undefined) res.push([s0, e0 + 1]);
      if(!all) break; from = p + 1;
    }
  });
  return res;
}
var Q_STOP = " a an the of to in on at for by with from and or but is are was were be been being it its this that these those they them their he she his her we you i as than then so such into about over after before more less most very can could may might will would should must not no do does did has have had there which who whom whose what when where why how all any some each other only also just because while if ";
function qSpans(raw){
  var sp = [], m, re = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g;
  while((m = re.exec(raw))){ if(m[0].trim()) sp.push([m.index, m.index + m[0].length]); }
  if(qIsR() && sp.length && analyze(raw).titles.length) sp.shift();
  return sp;
}
function qOptRanges(raw, NM, opt){
  var clean = (opt||"").trim().replace(/[.!?]$/,"").replace(/['’]s?$/,"").replace(/^(the|a|an)\s+/i,"");
  if(!clean) return [];
  var full = qLocate(raw, clean, NM, true);
  if(full.length) return full;
  var toks = qNorm(clean).trim().split(" ").filter(Boolean), used = [], res = [];
  for(var n = Math.min(toks.length, 8); n >= 2; n--){
    for(var i = 0; i + n <= toks.length; i++){
      if(used.slice(i, i+n).some(Boolean)) continue;
      var g = toks.slice(i, i+n);
      if(!g.some(function(w){ return w.length >= 3 && Q_STOP.indexOf(" " + w + " ") < 0; })) continue;
      if(Q_STOP.indexOf(" " + g[0] + " ") >= 0 || Q_STOP.indexOf(" " + g[g.length-1] + " ") >= 0) continue;
      var r = qLocate(raw, g.join(" "), NM, true);
      if(r.length){ res = res.concat(r); for(var j=i;j<i+n;j++) used[j] = true; }
    }
  }
  toks.forEach(function(w, i){
    if(used[i] || Q_STOP.indexOf(" " + w + " ") >= 0) return;
    var Wd = w.charAt(0).toUpperCase() + w.slice(1).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    var isNum = /\d/.test(w), isProper = new RegExp("[a-z,;:'’]\\s+" + Wd + "(?![a-z])").test(raw) && !new RegExp("(^|[^A-Za-z])" + w + "(?![a-z])").test(raw);
    if(isNum || isProper) res = res.concat(qLocate(raw, w, NM, true));
  });
  return res;
}
function qParasOfRanges(spans, rs){
  var out = [];
  rs.forEach(function(r){ spans.forEach(function(sp, i){ if(r[0] >= sp[0] && r[0] < sp[1] && out.indexOf(i+1) < 0) out.push(i+1); }); });
  return out.sort(function(a,b){ return a-b; });
}
var qActive = 0;
function renderQPass(){
  var box = document.getElementById("q-pass"); if(!box) return;
  var raw = S.slots.draft || "";
  if(!raw.trim()){ box.innerHTML = '<p class="small muted">Chưa có bài (bước 4).</p>'; return; }
  var isR = qIsR(), R = checkQ(), x = R.items.filter(function(y){ return y.it.n===qActive; })[0], it = x ? x.it : null;
  var rng = [], NM = qNormMap(raw), paraClaim = 0, spans = [], mm0, reP = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g;
  while((mm0 = reP.exec(raw))){ if(mm0[0].trim()) spans.push([mm0.index, mm0.index + mm0[0].length]); }
  if(isR && spans.length && analyze(raw).titles.length) spans.shift();
  if(it){
    var tgt = qQuoted(it.stem), m = (it.para||"").match(/\d+/); paraClaim = m ? parseInt(m[0],10) : 0;
    var bas = it.basis ? qLocate(raw, it.basis, NM) : [];
    if(it.basis && !bas.length){ var fz3 = qFuzzyLocate(raw, it.basis, NM); if(fz3) bas = [[fz3.s, fz3.e]]; }
    bas.forEach(function(r){ rng.push({s:r[0], e:r[1], c:"qb"}); });
    // vùng để tìm từ được hỏi và phương án: đoạn ghi ở dòng đầu (và đoạn trước nó), hoặc đoạn có căn cứ
    var lo = 0, hi = raw.length;
    if(isR && paraClaim && spans[paraClaim-1]){ lo = spans[Math.max(0, paraClaim-2)][0]; hi = spans[paraClaim-1][1]; }
    else if(bas.length){ var sp0 = spans.filter(function(x){ return x[0] <= bas[0][0] && bas[0][0] < x[1]; })[0]; if(sp0){ lo = sp0[0]; hi = sp0[1]; } }
    var inZone = function(r){ return r[0] >= lo && r[1] <= hi; };
    if(tgt){
      var ts = qLocate(raw, tgt, NM, true).filter(inZone);
      var inB = ts.filter(function(r){ return bas.some(function(b){ return r[0] >= b[0] && r[1] <= b[1]; }); });
      (inB.length ? inB : ts.slice(0, 1)).forEach(function(r){ rng.push({s:r[0], e:r[1], c:"qt"}); });
    }
    if(it.code!=="IS" && it.code!=="LO") ["A","B","C","D"].forEach(function(k){
      if(!it.opts[k]) return;
      var r = qOptRanges(raw, NM, it.opts[k]);
      if(it.code==="RE") r = r.filter(inZone);
      r.forEach(function(x){ rng.push({s:x[0], e:x[1], c:(k===it.ans ? "qa" : "qx"), k:k}); });
    });
    if(it.code==="IS" && it.insert) qLocate(raw, it.insert, NM).forEach(function(r){ rng.push({s:r[0], e:r[1], c:"qi"}); });
    if(it.code==="IS" && it.pos) ["A","B","C","D"].forEach(function(k){ if(!it.pos[k]) return; var r = qLocate(raw, it.pos[k], NM)[0]; if(!r) return; var e = r[1]; while(e < raw.length && /[.!?…"”’)]/.test(raw[e])) e++; rng.push({s:e, e:e, c:"pos", k:k}); });
  }
  // tô theo từng đoạn nhỏ: một chữ có thể vừa là căn cứ vừa là phương án
  var marks = rng.filter(function(r){ return r.c!=="pos" && r.e > r.s; });
  var kept = marks, poss = rng.filter(function(r){ return r.c==="pos"; });
  function paint(from, to){
    var cuts = [from, to];
    marks.forEach(function(r){ if(r.e > from && r.s < to){ cuts.push(Math.max(from, r.s)); cuts.push(Math.min(to, r.e)); } });
    poss.forEach(function(r){ if(r.s >= from && r.s <= to) cuts.push(r.s); });
    cuts = cuts.filter(function(x,i,a){ return a.indexOf(x)===i; }).sort(function(a,b){ return a-b; });
    var out = "";
    for(var i=0;i<cuts.length;i++){
      var p = cuts[i];
      poss.forEach(function(r){ if(r.s===p) out += '<span class="qpos' + (it && it.ans===r.k ? " ans" : "") + '">[' + r.k + ']</span>'; });
      if(i+1 >= cuts.length) break;
      var q = cuts[i+1], seg = raw.slice(p, q);
      var on = marks.filter(function(r){ return r.s <= p && r.e >= q; }), cls = [], ks = [];
      on.forEach(function(r){ if(cls.indexOf(r.c)<0) cls.push(r.c); if(r.k && ks.indexOf(r.k)<0) ks.push(r.k); });
      if(cls.indexOf("qa")>=0 && cls.indexOf("qx")>=0) cls = cls.filter(function(c){ return c!=="qx"; }).concat(["qax"]);
      out += cls.length ? '<mark class="' + cls.join(" ") + '"' + (ks.length ? ' title="Phương án ' + ks.join(", ") + '"' : "") + '>' + esc(seg) + '</mark>' : esc(seg);
    }
    return out;
  }
  var html = "", re = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g, mm, bodyN = 0;
  var basisPara = 0;
  if(isR){
    var a = analyze(raw), titles = a.titles.map(function(t){ return t.text; });
    while((mm = re.exec(raw))){
      var blk = mm[0], s0 = mm.index, e0 = s0 + blk.length;
      if(!blk.trim()) continue;
      var isT = titles.indexOf(blk.trim())>=0 && bodyN===0;
      if(isT){ html += '<div class="qtitle">' + paint(s0, e0) + '</div>'; continue; }
      bodyN++;
      var hasB = marks.some(function(r){ return r.c==="qb" && r.s>=s0 && r.e<=e0; }); if(hasB && !basisPara) basisPara = bodyN;
      html += '<p class="qpara' + (it && (paraClaim===bodyN || hasB) ? " on" : "") + '" data-p="' + bodyN + '"><span class="qpn">' + bodyN + '</span> ' + paint(s0, e0) + '</p>';
    }
  } else {
    var lineRe = /[^\n]+/g;
    while((mm = lineRe.exec(raw))){ html += '<p class="qline">' + paint(mm.index, mm.index + mm[0].length) + '</p>'; }
  }
  var head = it ? "Câu " + it.n + " · " + (it.lv||"") + " " + (it.mức||"") + " · " + (it.code||"") + (isR && paraClaim ? " · ghi đoạn " + paraClaim + (basisPara && basisPara!==paraClaim ? ", căn cứ ở đoạn " + basisPara : "") : "") : "Bấm một câu ở bên phải để tô chỗ cần soát";
  var miss = it && it.basis && !marks.some(function(r){ return r.c==="qb"; }) ? ' <span class="no">không tìm thấy căn cứ trong bài</span>' : "";
  var legend = '<div class="qleg"><mark class="qb">căn cứ</mark><mark class="qa">đáp án</mark><mark class="qx">phương án sai</mark><mark class="qt">từ được hỏi</mark></div>';
  box.innerHTML = '<div class="qph"><span>' + esc(head) + miss + '</span><span>' + (isR ? "Bài đọc" : "Kịch bản") + '</span></div>' + legend + html;
  var first = box.querySelector("mark.qb, .qpos.ans, mark.qt, mark.qa");
  if(first){ var top = first.offsetTop - box.clientHeight/3; box.scrollTo({top:Math.max(0, top), behavior:"smooth"}); }
}
/* ---- Giao diện ---- */
function renderQ(){
  var bp = document.getElementById("q-blueprint"); if(!bp) return;
  var sk = qSK(), rows = qRows(), isR = qIsR();
  var grp = SPEC[S.spec].grp;
  if(!rows.length){ bp.innerHTML = '<p class="small warnc">' + esc(qbpWhy()) + '</p>'; return; }
  bp.innerHTML = (!isR && grp ? '<p class="small muted">' + esc(QPART["L"+grp]) + '</p>' : "")
    + '<table class="qbp"><tr><th>Số câu</th><th>Bậc, mức</th><th>' + (isR ? 'Chọn một mã' : 'Chọn một trong các tiểu kĩ năng') + '</th></tr>'
    + rows.map(function(r){ return '<tr><td>' + r[2] + '</td><td>Bậc ' + r[0].slice(1) + ' ' + esc(r[1]) + '<br><span class="muted">' + LV_CEFR[r[0]] + '.' + ({"thấp":1,"trung bình":2,"cao":3})[r[1]] + '</span></td><td>' + (isR ? '<b>' + esc(r[3].join(", ")) + '</b><br><span class="small muted">' + esc(RLVNOTE[r[0] + " " + r[1]]) + '</span>' : r[3].map(function(k){ return '<b>' + esc(sk[k][0].join("/")) + '</b> ' + esc(sk[k][1]); }).join("<br>")) + '</td></tr>'; }).join("") + '</table>'
    + (isR ? '<p class="small muted">' + Object.keys(RCODE).map(function(c){ return '<b>' + esc(c) + '</b> ' + esc(RCODE[c]); }).join(" · ") + '</p>' : "");
  var l1 = document.getElementById("q-l1slot"); if(l1) l1.value = String(S.l1slot||1);
  var st = document.getElementById("q-status"), list = document.getElementById("q-items"), fx = document.getElementById("q-fix");
  var R = checkQ();
  if(!(S.slots.questions||"").trim()){ st.innerHTML = srow("w", "Chưa có câu hỏi. Dán kết quả của AI vào ô ở trên."); list.innerHTML = ""; fx.classList.add("hidden"); renderQOut(null); qSyncGate(null); renderQPass(); return; }
  var nb = R.items.filter(function(x){ return x.probs.length; }).length, nw = R.items.filter(function(x){ return !x.probs.length && x.warns.length; }).length;
  var gb = R.global.filter(function(g){ return g.c==="b"; }).length;
  var rowsH = [];
  rowsH.push(srow(R.n===qExpected() ? "g" : "b", "<b>Số câu:</b> " + R.n + " / " + qExpected() + "."));
  R.global.forEach(function(g){ rowsH.push(srow(g.c==="b" ? "b" : "w", esc(g.t))); });
  if(R.answerDist) rowsH.push(srow("w", "<b>Vị trí đáp án:</b> A " + R.answerDist.A + " · B " + R.answerDist.B + " · C " + R.answerDist.C + " · D " + R.answerDist.D + "."));
  rowsH.push(srow(nb ? "b" : (nw ? "w" : "g"), nb ? "<b>" + nb + " câu có lỗi</b>" + (nw ? ", " + nw + " câu cần xem lại" : "") + ". Xem từng câu ở dưới." : (nw ? "<b>" + nw + " câu cần xem lại</b> (không bắt buộc sửa)." : "<b>Từng câu:</b> đúng khuôn, căn cứ có trong bài.")));
  if(R.items.length && !R.items.some(function(x){ return x.it.n===qActive; })){ var fb = R.items.filter(function(x){ return x.probs.length || x.warns.length; })[0] || R.items[0]; qActive = fb.it.n; }
  var nMan = R.items.filter(function(x){ return qManDone(x.it); }).length, nNo = R.items.filter(function(x){ return qManFails(x.it).length; });
  rowsH.push(srow(nMan===R.items.length ? "g" : (nNo.length ? "b" : "w"), "<b>Bạn tự soát:</b> " + nMan + " / " + R.items.length + " câu đạt." + (nNo.length ? " <b>" + nNo.length + " câu bạn đánh dấu chưa đạt</b> (câu " + nNo.map(function(x){ return x.it.n; }).join(", ") + "): dùng khung \"Sửa các câu có lỗi\" bên dưới." : " Mở từng câu và chọn Đạt hoặc Chưa đạt ở cuối mỗi câu.")));
  st.innerHTML = rowsH.join("");
  qSyncGate(R);
  list.innerHTML = R.items.map(function(x){
    var it = x.it, cls = (x.probs.length || qManFails(it).length) ? "b" : (x.warns.length ? "w" : "g");
    var rawD = S.slots.draft || "", NMd = qNormMap(rawD), spD = qSpans(rawD);
    var opts = ["A","B","C","D"].map(function(k){
      var where = "";
      if(it.opts[k] && it.code!=="IS" && it.code!=="LO" && it.code!=="VO" && it.code!=="VO(ID)"){
        var ps = qParasOfRanges(spD, qOptRanges(rawD, NMd, it.opts[k]));
        where = isR ? (ps.length ? ' <span class="small muted">· có ở đoạn ' + ps.join(", ") + '</span>' : ' <span class="small muted">· không thấy trong bài</span>') : (ps.length ? ' <span class="small muted">· có trong kịch bản</span>' : ' <span class="small muted">· không thấy trong kịch bản</span>');
      }
      return '<div class="' + (k===it.ans ? "qans" : "qwrong") + '">' + k + ". " + esc(it.opts[k]||"") + ' <span class="small muted" style="font-style:italic">(' + esc(qOptNote(it, k)) + ')</span>' + where + '</div>';
    }).join("");
    return '<details class="qitem ' + cls + '" data-n="' + it.n + '"' + (cls!=="g" ? " open" : "") + '><summary><span class="qtag">Câu ' + it.n + '</span> ' + esc((it.lv||"?") + " " + (it.mức||"") + " · " + (it.code||"?") + (it.para ? " · " + it.para : "")) + (x.probs.length ? ' <span class="no">' + x.probs.length + ' lỗi</span>' : (x.warns.length ? ' <span class="muted">cần xem</span>' : ' <span class="ok">máy kiểm ổn</span>')) + (qManFails(it).length ? ' <span class="no">· soát tay: chưa đạt</span>' : (qManDone(it) ? ' <span class="ok">· soát tay: đạt</span>' : ' <span class="warnc">· chưa soát tay</span>')) + '</summary>'
      + '<div class="qbody"><div><b>' + esc(it.stem||"") + '</b></div>' + (it.insert ? '<div class="small muted">Câu chèn: ' + esc(it.insert) + '</div>' : "") + opts
      + (it.basis ? '<div class="small muted">Căn cứ: ' + esc(it.basis) + '</div>' : "")
      + (it.distr ? '<div class="small muted">AI giải thích phương án sai: ' + esc(it.distr) + '</div>' : "")
      + x.probs.map(function(p){ return '<div class="small no">• ' + esc(p) + '</div>'; }).join("") + x.warns.map(function(p){ return '<div class="small warnc">• ' + esc(p) + '</div>'; }).join("") + qManHTML(it) + '</div></details>';
  }).join("");
  var nFail = R.items.filter(function(x){ return qManFails(x.it).length; }).length;
  fx.classList.toggle("hidden", !(nb || nw || gb || R.global.length || nFail));
  renderQOut(R);
  Array.prototype.forEach.call(list.querySelectorAll("details.qitem"), function(d){ if(+d.getAttribute("data-n")===qActive) d.classList.add("qon"); });
  renderQPass();  try{ clRender(); }catch(e){}
}
function qSyncGate(R){
  var g = document.querySelector('input[data-gate="ch-man"]'); if(!g) return;
  var ok = !!(R && R.items.length && R.items.every(function(x){ return qManDone(x.it); }));
  S.gates = S.gates || {}; S.gates["ch-man"] = ok; g.checked = ok;
}
function qTestParts(R){
  var draft = S.slots.draft||"", isR = qIsR(), passage = draft, notes = [];
  var isI = R.items.filter(function(x){ return x.it.code==="IS" && x.it.insert && x.it.pos; })[0];
  if(isR && isI){
    var it = isI.it, esc2 = function(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+"); };
    var rm = new RegExp("\\s*" + esc2(it.insert));
    if(rm.test(passage)){ passage = passage.replace(rm, ""); notes.push("Đã rút câu chèn khỏi bài."); }
    ["D","C","B","A"].forEach(function(k){ var q = it.pos[k]; if(!q) return; var r = new RegExp(esc2(q) + "[.!?…\"”’)]*"); if(r.test(passage)) passage = passage.replace(r, function(m0){ return m0 + " [" + k + "]"; }); });
    var w = analyze(passage).total, sp = SPEC[S.spec];
    notes.push("Bài sau khi rút câu chèn: " + w + " từ" + (sp.min && (w < sp.min || w > sp.max) ? " (ngoài khoảng " + sp.words + ")" : "") + ".");
  }
  var qs = R.items.map(function(x, i){ var it = x.it; return (i+1) + ". " + (it.stem||"") + (it.insert ? "\n" + it.insert : "") + "\n" + ["A","B","C","D"].map(function(k){ return "   " + k + ". " + (it.opts[k]||""); }).join("\n"); }).join("\n\n");
  var key = R.items.map(function(x, i){ var it = x.it; return (i+1) + ". " + (it.ans||"?") + " · " + (it.lv||"") + " " + (it.mức||"") + " · " + (it.code||"") + (it.para ? " · " + it.para : "") + (it.basis ? " · căn cứ: \"" + it.basis + "\"" : ""); }).join("\n");
  return {passage:passage, qs:qs, key:key, notes:notes};
}
function qTranscript(R, ann){
  var script = (S.slots.draft||"").replace(/\r/g,"").trim(), lines = script.split("\n").filter(function(l){ return l.trim(); });
  var starts = [], acc = 0, joined = lines.join("\n");
  lines.forEach(function(l){ starts.push(acc); acc += l.length + 1; });
  var lineOf = function(at){ var k = 0; for(var i=0;i<starts.length;i++){ if(starts[i] <= at) k = i; } return k; };
  var isGlobal = function(it){ return it.code==="MI" || it.code==="TO" || /cả bài|whole|toàn bài/i.test(it.para||""); };
  var marks = [], globals = [], missing = 0;
  R.items.forEach(function(x, i){
    var n = i + 1;
    var glob = isGlobal(x.it), at = -1;
    if(x.it.basis){
      var r = qLocate(joined, x.it.basis);
      var en = -1;
      if(r.length){ at = r[0][0]; en = r[r.length-1][1]; }
      else { var fz = qFuzzyLocate(joined, x.it.basis); if(fz){ at = fz.s; en = fz.e; } }
    }
    if(glob){ globals.push({n:n, x:x, inline:at >= 0}); if(at < 0) return; }
    else if(at < 0){ missing++; globals.push({n:n, x:x, lost:true}); return; }
    var li0 = lineOf(at), lineEnd = starts[li0] + lines[li0].length;
    marks.push({at:at, end:Math.min(en < 0 ? at : en, lineEnd), n:n, x:x, line:li0, glob:glob});
  });
  marks.sort(function(p,q){ return p.at - q.at; });
  // chèn (Qn) ngay trước chỗ có đáp án, trong đúng lượt lời
  // chèn (Qn) trước căn cứ; căn cứ được đánh dấu để in đậm, gạch chân
  var ins = [];
  marks.forEach(function(m){ ins.push({p:m.at, t:"\u0003(Q" + m.n + ") \u0001", o:1}); if(m.end > m.at) ins.push({p:m.end, t:"\u0002", o:0}); });
  ins.sort(function(a,b){ return b.p - a.p || a.o - b.o; });
  var J = joined;
  ins.forEach(function(x){ J = J.slice(0, x.p) + x.t + J.slice(x.p); });
  J = J.replace(/(\S)\u0003/g, "$1 ").replace(/\u0003/g, "");
  var marked = J.split("\n");
  // mỗi hàng gồm trọn các lượt lời, chỉ ngắt ở đầu lượt lời có câu hỏi mới
  var rows = [], groups = [];
  marks.filter(function(m){ return !m.glob; }).forEach(function(m){ var g = groups[groups.length-1]; if(g && g.line===m.line) g.items.push(m); else groups.push({line:m.line, items:[m]}); });
  groups.forEach(function(g, gi){
    var from = gi===0 ? 0 : g.line, to = gi+1<groups.length ? groups[gi+1].line : marked.length;
    rows.push({c1:marked.slice(from, to).join("\n"), xs:g.items.map(function(m){ return m.x; })});
  });
  if(!groups.length) rows.push({c1:marked.join("\n"), xs:[]});
  globals.forEach(function(g){ rows.push({c1:g.lost ? "(không tìm thấy căn cứ trong kịch bản)" : (g.inline ? "(câu hỏi về cả bài; căn cứ tiêu biểu được đánh dấu (Q" + g.n + ") trong lời thoại ở trên)" : "(câu hỏi về cả bài)"), xs:[g.x]}); });
  var num = function(x){ return R.items.indexOf(x) + 1; };
  var c2 = function(xs){ return xs.map(function(x){ return "Câu " + num(x) + ": " + (x.it.code||"") + ", bậc " + (x.it.lv||"").slice(1) + " " + (x.it.mức||""); }).join("\n"); };
  var c3 = function(xs){ return xs.map(function(x){ var it = x.it; return "\u0006" + num(x) + ". " + (it.stem||"") + "\u0007\n" + ["A","B","C","D"].map(function(k){ return k + ". " + (it.opts[k]||"") + (ann ? " \u0004(" + qOptNote(it, k) + ")\u0005" : ""); }).join("\n") + "\nĐáp án: " + (it.ans||"?"); }).join("\n\n"); };
  var TH = 'style="border:1px solid #999;padding:6px;background:#eee;text-align:left"', TD = 'style="border:1px solid #999;padding:6px;vertical-align:top"';
  var cell = function(t){ return esc(t).replace(/\(Q(\d+)\)/g, "<b>(Q$1)</b>").replace(/\u0001/g, "<b><u>").replace(/\u0002/g, "</u></b>").replace(/\u0006/g, "<b>").replace(/\u0007/g, "</b>").replace(/\u0004/g, '<i style="color:#B8B8B8;font-size:10pt">').replace(/\u0005/g, "</i>").replace(/\n/g, "<br>"); };
  var turns = function(t){
    return t.split("\n").filter(function(l){ return l.trim(); }).map(function(l){
      var h = cell(l).replace(/^((?:<b>\(Q\d+\)<\/b>\s*)?)([A-Z][A-Za-z .'’\-]{0,30}?):\s*/, function(m0, q, name){ return q + "<b>" + name + ":</b> "; });
      return '<p style="margin:0 0 8pt">' + h + '</p>';
    }).join("");
  };
  var html = '<div style="' + QDOC_CSS + '"><table style="border-collapse:collapse;width:100%"><tr><th ' + TH + ' width="55%">Lời thoại</th><th ' + TH + ' width="15%">Kỹ năng, bậc</th><th ' + TH + ' width="30%">Câu hỏi và đáp án</th></tr>'
    + rows.map(function(r){ return '<tr><td ' + TD + '>' + turns(r.c1) + '</td><td ' + TD + '>' + cell(c2(r.xs)) + '</td><td ' + TD + '>' + cell(c3(r.xs)) + '</td></tr>'; }).join("") + '</table></div>';
  var tsv = rows.map(function(r){ return r.c1.replace(/[\u0001\u0002]/g, "").replace(/\n/g, "\n\n") + (r.xs.length ? "\n\n[" + c2(r.xs).replace(/\n/g,"; ") + "]\n" + c3(r.xs).replace(/[\u0004\u0005\u0006\u0007]/g, "") : ""); }).join("\n\n--------\n\n");
  return {html:html, tsv:tsv, missing:missing};
}
function copyRich(html, text, btn, label){
  var old = label || btn.textContent;
  function done(ok){ btn.textContent = ok ? "Đã sao chép" : "Không sao chép được"; setTimeout(function(){ btn.textContent = old; }, 2200); }
  function viaSelection(){
    try{
      var d = document.createElement("div");
      d.contentEditable = "true"; d.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;white-space:normal;color:#000;background:#fff";
      d.innerHTML = html; document.body.appendChild(d);
      var r = document.createRange(); r.selectNodeContents(d);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      var ok = document.execCommand("copy"); sel.removeAllRanges(); document.body.removeChild(d);
      return ok;
    }catch(e){ return false; }
  }
  try{
    if(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write){
      navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"}), "text/plain":new Blob([text],{type:"text/plain"})})]).then(function(){ done(true); }, function(){ done(viaSelection() || fallbackCopy(text)); });
      return;
    }
  }catch(e){}
  done(viaSelection() || fallbackCopy(text));
}
var QDOC_CSS = 'font-family:Arial,Helvetica,sans-serif;font-size:12pt;line-height:1.5;color:#000';
function qDocParts(R, ann){
  var t = qTestParts(R), isR = qIsR(), raw = t.passage.replace(/\r/g,"").trim();
  var blocks = raw.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean);
  var a = analyze(raw), hasTitle = isR && a.titles.length && blocks.length && a.titles[0].text.trim()===blocks[0];
  if(isR){
    // từ được hỏi ở câu RE, VO: in đậm, gạch chân trong bài
    R.items.forEach(function(x){
      var it = x.it; if(it.code!=="RE" && it.code!=="VO" && it.code!=="VO(ID)") return;
      var tw = qQuoted(it.stem); if(!tw) return;
      var re = new RegExp("(^|[^A-Za-z\u0001])(" + tw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+") + ")(?![A-Za-z])", "i");
      var pn = +((String(it.para||"").match(/\d+/)||[])[0]||0), bi = pn ? pn - 1 + (hasTitle ? 1 : 0) : -1;
      var order = bi >= 0 && bi < blocks.length ? [bi] : []; for(var j = 0; j < blocks.length; j++) if(j !== bi) order.push(j);
      var done = false, bs = (it.basis||"").trim();
      // ưu tiên đúng chỗ trong câu căn cứ
      if(bs) for(var k0 = 0; k0 < blocks.length && !done; k0++){ var at = blocks[k0].indexOf(bs); if(at >= 0){ var seg = blocks[k0].slice(at, at + bs.length); if(re.test(seg)){ blocks[k0] = blocks[k0].slice(0, at) + seg.replace(re, "$1\u0001$2\u0002") + blocks[k0].slice(at + bs.length); done = true; } } }
      for(var k = 0; k < order.length && !done; k++){ var b = blocks[order[k]]; if(re.test(b)){ blocks[order[k]] = b.replace(re, "$1\u0001$2\u0002"); done = true; } }
    });
  }
  var pHtml = blocks.map(function(p, i){
    var body = esc(p).replace(/\n/g, isR ? " " : "<br>").replace(/\[([A-D])\]/g, "<b>[$1]</b>").replace(/\u0001/g, "<b><u>").replace(/\u0002/g, "</u></b>");
    return (hasTitle && i===0) ? '<p style="text-align:center;margin:0 0 10pt"><b>' + body + '</b></p>' : '<p style="text-align:justify;margin:0 0 8pt">' + body + '</p>';
  }).join("");
  var qHtml = R.items.map(function(x, i){
    var it = x.it;
    return '<p style="margin:10pt 0 2pt"><b>' + (i+1) + '. ' + esc(it.stem||"") + '</b></p>'
      + (it.insert ? '<p style="margin:0 0 2pt 18pt"><i>' + esc(it.insert) + '</i></p>' : "")
      + ["A","B","C","D"].map(function(k){ var ot = esc(it.opts[k]||""); return '<p style="margin:0 0 0 18pt">' + k + '. ' + (ann && k===it.ans ? '<b><u>' + ot + '</u></b>' : ot) + (ann ? ' <i style="color:#B8B8B8;font-size:10pt">(' + esc(qOptNote(it, k)) + ')</i>' : "") + '</p>'; }).join("")
      + (ann ? '<p style="margin:2pt 0 0 18pt;color:#B8B8B8;font-size:10pt"><i>' + esc((it.lv||"") + " " + (it.mức||"") + " · " + (it.code||"") + (it.basis ? " · căn cứ: \"" + it.basis + "\"" : "")) + '</i></p>' : "")
      + (ann && it.explain ? '<p style="margin:2pt 0 0 18pt"><b>Giải thích:</b> ' + esc(it.explain) + '</p>' : "");
  }).join("");
  var plainQ = R.items.map(function(x, i){ var it = x.it; return (i+1) + ". " + (it.stem||"") + (it.insert ? "\n" + it.insert : "") + "\n" + ["A","B","C","D"].map(function(k){ return k + ". " + (it.opts[k]||"") + (ann ? " (" + qOptNote(it, k) + ")" : ""); }).join("\n") + (ann ? "\n[" + (it.lv||"") + " " + (it.mức||"") + " · " + (it.code||"") + (it.basis ? " · căn cứ: \"" + it.basis + "\"" : "") + "]" : "") + (ann && it.explain ? "\nGiải thích: " + it.explain : ""); }).join("\n\n");
  var plainP = blocks.map(function(p){ return (isR ? p.replace(/\n/g," ") : p).replace(/[\u0001\u0002]/g, ""); }).join("\n\n");
  var keyRows = R.items.map(function(x, i){ var it = x.it; return [String(i+1), it.ans||"?", (it.lv||"") + " " + (it.mức||""), it.code||"", it.para||"", it.basis||""]; });
  var th = ["Câu","Đáp án","Bậc, mức","Mã","Đoạn","Căn cứ"];
  if(!isR){ th.splice(4,1); keyRows = keyRows.map(function(r){ r.splice(4,1); return r; }); }
  var expl = R.items.map(function(x){ return x.it.explain || ""; }), hasExpl = expl.some(Boolean);
  var keyHtml = '<table style="border-collapse:collapse;' + QDOC_CSS + '"><tr>' + th.concat(hasExpl ? ["Giải thích"] : []).map(function(h){ return '<th style="border:1px solid #999;padding:4px 8px;background:#eee;text-align:left">' + h + '</th>'; }).join("") + '</tr>'
    + keyRows.map(function(r, i){ return '<tr>' + r.map(function(c, j){ var e = esc(c); return '<td style="border:1px solid #999;padding:4px 8px;vertical-align:top">' + (j===1 ? '<b><u>' + e + '</u></b>' : e) + '</td>'; }).join("") + (hasExpl ? '<td style="border:1px solid #999;padding:4px 8px;vertical-align:top">' + esc(expl[i]) + '</td>' : '') + '</tr>'; }).join("") + '</table>';
  var keyPlain = keyRows.map(function(r, i){ return r[0] + ". " + r[1] + " (" + r.slice(2, r.length-1).filter(Boolean).join(", ") + ")" + (r[r.length-1] ? " · căn cứ: \"" + r[r.length-1] + "\"" : "") + (expl[i] ? " · giải thích: " + expl[i] : ""); }).join("\n");
  return {
    testHtml:'<div style="' + QDOC_CSS + '">' + pHtml + '<p style="margin:14pt 0 4pt"><b>Questions 1–' + R.items.length + '</b></p>' + qHtml + '</div>',
    testText:plainP + "\n\nQuestions 1–" + R.items.length + "\n\n" + plainQ,
    keyHtml:keyHtml, keyText:keyPlain, notes:t.notes
  };
}
var CRC_T = null;
function crc32(u8){
  if(!CRC_T){ CRC_T = []; for(var n=0;n<256;n++){ var c = n; for(var k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC_T[n] = c >>> 0; } }
  var crc = 0xFFFFFFFF; for(var i=0;i<u8.length;i++) crc = CRC_T[(crc ^ u8[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function zipStore(files){
  var enc = new TextEncoder(), chunks = [], central = [], off = 0;
  var u16 = function(v){ return [v & 255, (v >>> 8) & 255]; }, u32 = function(v){ return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; };
  files.forEach(function(f){
    var name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data);
    var head = [].concat([0x50,0x4b,0x03,0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
    chunks.push(new Uint8Array(head), name, data);
    central.push(new Uint8Array([].concat([0x50,0x4b,0x01,0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), name);
    off += head.length + name.length + data.length;
  });
  var cdSize = central.reduce(function(s, c){ return s + c.length; }, 0);
  var end = new Uint8Array([].concat([0x50,0x4b,0x05,0x06], u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(off), u16(0)));
  return new Blob(chunks.concat(central).concat([end]), {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
function htmlToDocx(html){
  var dom = new DOMParser().parseFromString(html, "text/html");
  var xe = function(t){ return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };
  var PAGE_W = 9638;
  function st(el){ var o = {}; (el.getAttribute && el.getAttribute("style") || "").split(";").forEach(function(d){ var k = d.split(":")[0], v = d.slice(k.length+1); if(k.trim()) o[k.trim().toLowerCase()] = v.trim(); }); return o; }
  function pt(v){ var m = /([\d.]+)\s*pt/.exec(v||""); return m ? parseFloat(m[1]) : 0; }
  function marg(o){
    var r = {t:0, b:0, l:0};
    if(o.margin){ var a = o.margin.split(/\s+/).map(pt); if(a.length===1){ r.t = r.b = a[0]; } else if(a.length===2){ r.t = r.b = a[0]; } else if(a.length===3){ r.t = a[0]; r.b = a[2]; } else { r.t = a[0]; r.b = a[2]; r.l = a[3]; } }
    if(o["margin-left"]) r.l = pt(o["margin-left"]);
    return r;
  }
  function run(text, f){
    var p = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>' + (f.b ? '<w:b/>' : '') + (f.i ? '<w:i/>' : '') + (f.u ? '<w:u w:val="single"/>' : '') + (f.color ? '<w:color w:val="' + f.color + '"/>' : '') + '<w:sz w:val="' + (f.sz||24) + '"/><w:szCs w:val="' + (f.sz||24) + '"/>';
    return '<w:r><w:rPr>' + p + '</w:rPr><w:t xml:space="preserve">' + xe(text) + '</w:t></w:r>';
  }
  function fmt(el, f){
    var g = {b:f.b, i:f.i, u:f.u, color:f.color, sz:f.sz}, tag = el.tagName.toLowerCase(), o = st(el);
    if(tag==="b" || tag==="strong" || tag==="th") g.b = true;
    if(tag==="i" || tag==="em") g.i = true;
    if(tag==="u") g.u = true;
    if(o["font-weight"]==="bold") g.b = true;
    if(o["font-style"]==="italic") g.i = true;
    var c = /#([0-9a-f]{6})/i.exec(o.color||""); if(c) g.color = c[1].toUpperCase();
    if(o["font-size"]) g.sz = Math.round(pt(o["font-size"])*2);
    return g;
  }
  function inline(node, f, runs){
    Array.prototype.forEach.call(node.childNodes, function(ch){
      if(ch.nodeType===3){ var t = ch.nodeValue.replace(/\s+/g, " "); if(t) runs.push(run(t, f)); }
      else if(ch.nodeType===1){ var tg = ch.tagName.toLowerCase(); if(tg==="br") runs.push('<w:r><w:br/></w:r>'); else inline(ch, fmt(ch, f), runs); }
    });
  }
  function para(runs, o, extra){
    var m = marg(o), jc = {center:"center", justify:"both", right:"right"}[o["text-align"]||""];
    return '<w:p><w:pPr>' + (extra||"") + '<w:spacing w:before="' + Math.round(m.t*20) + '" w:after="' + Math.round(m.b*20) + '"/>' + (m.l ? '<w:ind w:left="' + Math.round(m.l*20) + '"/>' : '') + (jc ? '<w:jc w:val="' + jc + '"/>' : '') + '</w:pPr>' + runs.join("") + '</w:p>';
  }
  var BLOCK = {p:1, h2:1, h1:1, h3:1, div:1, table:1, tbody:1, thead:1};
  function container(node, f, out){
    var pending = [];
    var flush = function(){ if(pending.length){ out.push(para(pending, {})); pending = []; } };
    Array.prototype.forEach.call(node.childNodes, function(ch){
      if(ch.nodeType===1 && BLOCK[ch.tagName.toLowerCase()]){ flush(); block(ch, f, out); }
      else if(ch.nodeType===3){ var t = ch.nodeValue.replace(/\s+/g, " "); if(t.trim()) pending.push(run(t, f)); }
      else if(ch.nodeType===1){ if(ch.tagName.toLowerCase()==="br") pending.push('<w:r><w:br/></w:r>'); else inline(ch, fmt(ch, f), pending); }
    });
    flush();
  }
  function block(el, f, out){
    var tag = el.tagName.toLowerCase(), o = st(el);
    if(tag==="table"){ out.push(table(el, f)); return; }
    if(tag==="div" || tag==="tbody" || tag==="thead"){ container(el, fmt(el, f), out); return; }
    if(/page-break-before:\s*always/.test(el.getAttribute("style")||"")){ out.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'); if(!el.textContent.trim()) return; }
    var g = fmt(el, f);
    if(tag==="h2" || tag==="h1"){ g.b = true; g.sz = g.sz && g.sz!==24 ? g.sz : 28; if(!o.margin) o.margin = "12pt 0 6pt"; }
    var runs = []; inline(el, g, runs);
    out.push(para(runs, o));
  }
  function table(tbl, f){
    var rows = Array.prototype.slice.call(tbl.rows), first = rows[0] ? Array.prototype.slice.call(rows[0].cells) : [];
    var pcts = first.map(function(c){ var w = c.getAttribute("width"); return w ? parseFloat(w) : 0; });
    var tot = pcts.reduce(function(a,b){ return a+b; }, 0);
    var n = first.length || 1, ws = first.map(function(c, i){ return Math.round(tot ? PAGE_W*pcts[i]/tot : PAGE_W/n); });
    var B = '<w:top w:val="single" w:sz="4" w:color="999999"/><w:left w:val="single" w:sz="4" w:color="999999"/><w:bottom w:val="single" w:sz="4" w:color="999999"/><w:right w:val="single" w:sz="4" w:color="999999"/><w:insideH w:val="single" w:sz="4" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:color="999999"/>';
    var x = '<w:tbl><w:tblPr><w:tblW w:w="' + PAGE_W + '" w:type="dxa"/><w:tblBorders>' + B + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + ws.map(function(w){ return '<w:gridCol w:w="' + w + '"/>'; }).join("") + '</w:tblGrid>';
    rows.forEach(function(tr, ri){
      x += '<w:tr>' + (ri===0 && tr.cells[0] && tr.cells[0].tagName.toLowerCase()==="th" ? '<w:trPr><w:tblHeader/></w:trPr>' : '');
      Array.prototype.forEach.call(tr.cells, function(td, ci){
        var isTh = td.tagName.toLowerCase()==="th", inner = [];
        container(td, fmt(td, f), inner);
        if(!inner.length) inner.push('<w:p/>');
        x += '<w:tc><w:tcPr><w:tcW w:w="' + (ws[ci]||ws[0]) + '" w:type="dxa"/>' + (isTh ? '<w:shd w:val="clear" w:color="auto" w:fill="EEEEEE"/>' : '') + '</w:tcPr>' + inner.join("") + '</w:tc>';
      });
      x += '</w:tr>';
    });
    return x + '</w:tbl><w:p/>';
  }
  var body = []; container(dom.body, {}, body);
  var W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + W + '><w:body>' + body.join("") + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
  return zipStore([
    {name:"[Content_Types].xml", data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'},
    {name:"_rels/.rels", data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},
    {name:"word/document.xml", data:docXml}
  ]);
}
var qDownloads = null;
try{ if(window.claude && typeof window.claude.use === "function") window.claude.use("downloads").then(function(d){ qDownloads = d; }, function(){}); }catch(e){}
function qDownloadDoc(R, btn){
  var isR = qIsR(), parts = [], brk = '<p style="page-break-before:always;margin:0"></p>';
  var sp = SPEC[S.spec], code = S.code ? slug(S.code) : S.spec, t = S.slots.topic ? slug(S.slots.topic) : "chu-de";
  var h = function(x){ return '<h2 style="font-family:Arial;font-size:14pt">' + esc(x) + '</h2>'; };
  if(isR){
    var d0 = qDocParts(R, false), d1 = qDocParts(R, true);
    parts.push(h("Đề (không chú thích)") + d0.testHtml, h("Bản có chú thích") + d1.testHtml, h("Đáp án và căn cứ") + d1.keyHtml);
  } else {
    parts.push(h("Transcript (không chú thích)") + qTranscript(R, false).html, h("Transcript có chú thích") + qTranscript(R, true).html);
  }
  if(S.wf && S.wf.st && typeof wfDossierHTML === "function") parts.push(h("Hồ sơ thẩm định") + wfDossierHTML());
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(sp.label) + '</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:12pt}</style></head><body>' + parts.join(brk) + '</body></html>';
  var blob = htmlToDocx(html), name = code + "_" + t + "_cauhoi.docx", old = btn.textContent;
  var say = function(m){ btn.textContent = m; setTimeout(function(){ btn.textContent = old; }, 2500); };
  var go = function(dl){
    if(dl){ dl.save({filename:name, data:blob}).then(function(){ say("Đã tải file"); }, function(e){ say(e && e.code==="declined" ? "Đã huỷ" : "Không tải được"); }); return; }
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    say("Đã tải file");
  };
  if(qDownloads) go(qDownloads);
  else if(window.claude && typeof window.claude.use === "function"){ btn.textContent = "Đang chuẩn bị…"; window.claude.use("downloads").then(function(d){ qDownloads = d; go(d); }, function(){ go(null); }); }
  else go(null);
}
/* ---- Lưu, mở, tạo bài mới ---- */
function fpName(){
  var d = new Date(), p = function(n){ return String(n).padStart(2,"0"); };
  var code = S.code ? slug(S.code) : S.spec, t = S.slots.topic ? slug(S.slots.topic).slice(0,40) : "chu-de";
  return code + "_" + t + "_" + d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + ".json";
}
function fpHasWork(){ return Object.keys(S.slots||{}).some(function(k){ return String(S.slots[k]||"").trim(); }); }
function fpCur(){
  var sp = SPEC[S.spec]; var el = document.getElementById("fp-cur"); if(!el) return;
  el.textContent = sp.label + " · mức " + S.level + (S.slots.topic ? " · " + S.slots.topic : "") + (S.code ? " · mã " + S.code : "") + (fpHasWork() ? "" : " (chưa có nội dung)");
  var sv = document.getElementById("fp-saved"); if(sv && S.lastFileSave) sv.textContent = "Lưu ra file lần gần nhất: " + S.lastFileSave + ".";
}
function fpSave(btn, then){
  S.lastFileSave = new Date().toLocaleString("vi-VN"); S.fileHash = fpStateHash(); if(typeof libSetBase === "function") libSetBase();
  var data = JSON.stringify({app:"vstep-pipeline", format:1, savedAt:new Date().toISOString(), state:S}, null, 1);
  var name = fpName(), old = btn ? btn.innerHTML : "";
  var done = function(ok){ if(ok){ save(); fpCur(); toast("Đã lưu bài ra file " + name + "."); } else { delete S.fileHash; toast("Chưa lưu được file."); } if(then && ok) then(); };
  var go = function(dl){
    if(dl){ dl.save({filename:name, data:new Blob([data], {type:"application/json"})}).then(function(){ done(true); }, function(e){ done(false); }); return; }
    try{ var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], {type:"application/json"})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000); done(true); }catch(e){ done(false); }
  };
  if(qDownloads) go(qDownloads);
  else if(window.claude && typeof window.claude.use === "function") window.claude.use("downloads").then(function(d){ qDownloads = d; go(d); }, function(){ go(null); });
  else go(null);
}
function applyState(st){
  Object.keys(S).forEach(function(k){ delete S[k]; });
  Object.keys(st).forEach(function(k){ S[k] = st[k]; });
  S.slots = S.slots || {}; S.fields = S.fields || {}; S.gates = S.gates || {}; S.fixOpen = S.fixOpen || {};
  if(!SPEC[S.spec]) S.spec = "R2";
  save();
  var map = {"set-spec":"spec","set-level":"level","set-spelling":"spelling","set-floor":"floor","set-paras":"paras","set-poly":"poly","set-code":"code"};
  Object.keys(map).forEach(function(id){ var el = document.getElementById(id); if(el && S[map[id]]!==undefined && S[map[id]]!==null) el.value = S[map[id]]; else if(el && id==="set-code") el.value = ""; });
  document.querySelectorAll("[data-slot]").forEach(function(el){ var v = S.slots[el.getAttribute("data-slot")]; el.value = el.tagName==="SELECT" ? (v || el.options[0].value) : (v || ""); });
  document.querySelectorAll("input[data-gate]").forEach(function(i){ i.checked = !!S.gates[i.getAttribute("data-gate")]; });
  var ids = FIELD_IDS.slice(); METRICS.forEach(function(m){ ids.push(m[0]+"-1", m[0]+"-2"); });
  ids.forEach(function(id){ var el = document.getElementById(id); if(el) el.value = S.fields[id] || ""; });
  document.querySelectorAll('input[name="srclang"]').forEach(function(r){ r.checked = r.value === (S.srcLang||"en"); });
  document.querySelectorAll('input[name="srcmode"]').forEach(function(r){ r.checked = r.value === (S.srcMode||"text"); });
  document.querySelectorAll(".splitmsg, .navmsg").forEach(function(el){ el.textContent = ""; });
  lastAnalysis = null; lastOverlap = null; lastVocab = null; lastFre = null; qActive = 0;
  renderSpec(); applyBranch(); renderAllAI(); applyLang(); renderMetrics();
  runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); refreshText(); renderB7(); renderRecheck(); renderAnchors(); renderQ();
  show(S.step || "bat-dau");
  fpCur();
}
function bindFilePanel(togglePanel){
  var cb = document.getElementById("clearbtn"); if(cb) cb.addEventListener("click", fpCur);
  var conf = document.getElementById("fp-confirm"), main = document.getElementById("fp-main"), q = document.getElementById("fp-q"), pending = null;
  var ask = function(text, action){
    if(!fpUnsaved()){ action(); return; }
    pending = action; q.innerHTML = text + (typeof libUnsavedText === "function" ? '<br><span class="small">' + libUnsavedText() + '</span>' : ''); conf.classList.remove("hidden"); main.classList.add("hidden");
  };
  var close = function(){ pending = null; conf.classList.add("hidden"); main.classList.remove("hidden"); };
  document.getElementById("fp-no").addEventListener("click", close);
  document.getElementById("fp-yes").addEventListener("click", function(){ var a = pending; close(); if(a) a(); });
  document.getElementById("fp-yes-save").addEventListener("click", function(e){ var a = pending; close(); fpSave(e.currentTarget, a); });
  document.getElementById("fp-save").addEventListener("click", function(e){ fpSave(e.currentTarget); });
  var fi = document.getElementById("fp-file");
  document.getElementById("fp-open").addEventListener("click", function(){ fi.value = ""; fi.click(); });
  fi.addEventListener("change", function(){
    var f = fi.files && fi.files[0]; if(!f) return;
    var rd = new FileReader();
    rd.onload = function(){
      var o = null; try{ o = JSON.parse(rd.result); }catch(e){}
      if(!o || o.app!=="vstep-pipeline" || !o.state){ toast("File này không phải bài đã lưu từ trang này."); return; }
      ask("<b>Mở bài trong file " + esc(f.name) + "?</b> Bài đang làm sẽ được thay bằng bài trong file.", function(){ applyState(o.state); S.fileHash = fpStateHash(); if(typeof libSetBase === "function") libSetBase(); save(); togglePanel(false); toast("Đã mở bài từ " + f.name + "."); });
    };
    rd.readAsText(f);
  });
  document.getElementById("fp-new").addEventListener("click", function(){
    ask("<b>Tạo bài mới?</b> Bài đang làm sẽ bị xoá khỏi trang (phần thi và mức từ vựng vẫn giữ). Nên lưu ra file trước.", function(){ clearData(false); delete S.lastFileSave; save(); togglePanel(false); fpCur(); toast("Đã tạo bài mới."); });
  });
  fpCur();
}
var lastQR = null;
function renderQOut(R){
  lastQR = R;
  var box = document.getElementById("q-out"); if(!box) return;
  box.classList.toggle("hidden", !R || !R.items.length);
  var note = document.getElementById("q-outnote"); if(!note || !R || !R.items.length) return;
  var pv = document.getElementById("q-preview");
  if(qIsR()){ var d = qDocParts(R, true); note.textContent = d.notes.join(" "); if(pv) pv.innerHTML = d.testHtml + '<div style="height:14px"></div>' + d.keyHtml; }
  else { var tr = qTranscript(R); note.textContent = tr.missing ? "Có " + tr.missing + " câu chưa tìm được chỗ trong kịch bản để ghi (Q…): các câu này nằm ở cuối bảng." : "Mỗi câu đã có (Q…) ngay trước chỗ có đáp án."; if(pv) pv.innerHTML = qTranscript(R, true).html; }
}
function bindQ(){
  var qi = document.getElementById("q-items");
  if(qi) qi.addEventListener("click", function(e){
    if(e.target.closest && e.target.closest("input,textarea,label,.qman")) return;
    var d = e.target.closest && e.target.closest("details.qitem"); if(!d) return;
    var n = +d.getAttribute("data-n"); if(n===qActive) return;
    qActive = n;
    Array.prototype.forEach.call(qi.querySelectorAll("details.qitem"), function(x){ x.classList.toggle("qon", x===d); });
    renderQPass();
  });
  var setTop = function(){ var t = document.querySelector(".top"); if(t) document.documentElement.style.setProperty("--toph", t.offsetHeight + "px"); };
  setTop(); window.addEventListener("resize", setTop);
  if(qi) qi.addEventListener("change", function(e){
    var t = e.target; if(!t.matches || !t.matches("input[data-qm]")) return;
    var p = t.getAttribute("data-qm").split("|"); S.qman = S.qman || {};
    var key = p.slice(0, -1).join("|"), k = p[p.length-1];
    S.qman[key] = S.qman[key] || {}; S.qman[key][k] = t.value==="no" ? "no" : true; save();
    var open = Array.prototype.map.call(qi.querySelectorAll("details.qitem"), function(d){ return d.open; });
    renderQ(); Array.prototype.forEach.call(qi.querySelectorAll("details.qitem"), function(d, i){ if(open[i]!==undefined) d.open = open[i]; });
    updateStepper();
  });
  if(qi) qi.addEventListener("input", function(e){
    var t = e.target; if(!t.matches || !t.matches("textarea[data-qnote]")) return;
    var key = t.getAttribute("data-qnote"); S.qman = S.qman || {}; S.qman[key] = S.qman[key] || {}; S.qman[key].note = t.value; save(); schedule();
  });
  var l1 = document.getElementById("q-l1slot");
  if(l1) l1.addEventListener("change", function(){ S.l1slot = l1.value; save(); renderQ(); schedule(); });
  var bd = document.getElementById("q-doc");
  if(bd) bd.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; qDownloadDoc(R, bd); });
  var b1 = document.getElementById("q-copy-test"), b2 = document.getElementById("q-copy-key"), b3 = document.getElementById("q-copy-tr"), b4 = document.getElementById("q-copy-test-ann"), b5 = document.getElementById("q-copy-tr-ann");
  if(b4) b4.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; var d = qDocParts(R, true); copyRich(d.testHtml, d.testText, b4, "Sao chép bản có chú thích"); });
  if(b5) b5.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; var tr = qTranscript(R, true); copyRich(tr.html, tr.tsv, b5, "Sao chép transcript có chú thích"); });
  if(b1) b1.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; var d = qDocParts(R); copyRich(d.testHtml, d.testText, b1, "Sao chép bài và câu hỏi"); });
  if(b2) b2.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; var d = qDocParts(R); copyRich(d.keyHtml, d.keyText, b2, "Sao chép đáp án và căn cứ"); });
  if(b3) b3.addEventListener("click", function(){ var R = checkQ(); if(!R.items.length) return; var tr = qTranscript(R, false); copyRich(tr.html, tr.tsv, b3, "Sao chép transcript (không chú thích)"); });
}

;

/* ===== Thư viện bài trên Firebase (đăng nhập Google, Firestore) ===== */
var LIB_CFG = {
  apiKey: "AIzaSyD5wRBCtISjbWTbmbgT41RubAtWNynw_9E",
  authDomain: "hiu-vstep.firebaseapp.com",
  projectId: "hiu-vstep",
  storageBucket: "hiu-vstep.firebasestorage.app",
  messagingSenderId: "643187183365",
  appId: "1:643187183365:web:544a8f30e2a617ccb5b16c"
};
var LIB_STATUS = ["Đang soạn", "Chờ duyệt", "Đã duyệt", "Đã dùng trong đề"];
var LIB_KEEP = 20;           // số bản cũ giữ lại cho mỗi bài
var LIB_MAX = 900000;        // giới hạn kích thước một bài (Firestore cho tối đa 1 MiB mỗi bản ghi)
var LIB = {fb:null, app:null, auth:null, db:null, user:null, role:null, items:[], loading:false, err:"", view:"list", hist:null, staff:null, pending:null, filter:{q:"", spec:"", status:""}};

function libEl(){ return document.getElementById("libpanel"); }
function libEmail(){ return LIB.user && LIB.user.email ? LIB.user.email.toLowerCase() : ""; }
function libIsAdmin(){ return LIB.role === "admin"; }
// quản trị và thành viên nội bộ xem cả thư viện; người tự đăng ký chỉ xem bài của mình và bài trong dự án được mời
function libIsStaff(){ return LIB.role === "admin" || LIB.role === "editor"; }
function libStateCopy(){
  var o = JSON.parse(JSON.stringify(S)); delete o.lib; delete o.lastFileSave; delete o.libCopyTitle; delete o.fileHash;
  // chỉ là vị trí đang xem hoặc giá trị trang tự tính lại: không tính là thay đổi
  delete o.step;
  if(o.gates){ delete o.gates["cl-ck"]; delete o.gates["ch-ck"]; delete o.gates["ch-man"]; }
  if(o.cl){ delete o.cl.promptNotes; delete o.cl.patchRaw; if(!Object.keys(o.cl).some(function(k){ var v = o.cl[k]; return v && (typeof v !== "object" || Object.keys(v).length); })) delete o.cl; }
  if(o.map){ delete o.map.autoDone; if(!o.map.rows || !Object.keys(o.map.rows).length) delete o.map; }
  if(o.wf && !o.wf.st && !(o.wf.log||[]).length && !Object.keys(o.wf.as||{}).length) delete o.wf;
  if(o.notes && !o.notes.length) delete o.notes;
  return o;
}
function libHash(str){ return qHash(str); }
// so hai bản theo nội dung: bỏ thứ tự khoá, bỏ ô trống ("" / null / false / {} / []), để không báo "chưa lưu" khi chẳng đổi gì
function libCanon(v){
  if(Array.isArray(v)){ var a = v.map(libCanon).filter(function(x){ return x !== undefined; }); return a.length ? a : undefined; }
  if(v && typeof v === "object"){ var o = {}, ks = Object.keys(v).sort(); ks.forEach(function(k){ var c = libCanon(v[k]); if(c !== undefined) o[k] = c; }); return Object.keys(o).length ? o : undefined; }
  if(v === "" || v === null || v === false || v === undefined) return undefined;
  if(typeof v === "string" && !v.trim()) return undefined;
  return v;
}
function libStateHash(st){ return libHash(JSON.stringify(libCanon(st || libStateCopy()) || {})); }
// mốc so sánh trong phiên: bản vừa mở hoặc vừa lưu, để nói được ĐỔI CHỖ NÀO
var LIB_BASE = null;
function libSetBase(st){ LIB_BASE = libCanon(JSON.parse(JSON.stringify(st || libStateCopy()))) || {}; }
var LIB_PART_NAMES = {setting:"Bối cảnh AI đặt", settingNote:"Nhận xét bối cảnh", topic:"Chủ đề", src:"Nguồn", srcVi:"Nguồn tiếng Việt", draft:"Bài (kịch bản)", questions:"Câu hỏi", notes:"Ghi chú của AI", facts:"Tóm tắt dữ kiện"};
function libChangedParts(){
  if(!LIB_BASE) return [];
  var cur = libCanon(libStateCopy()) || {}, out = [], same = function(a, b){ return JSON.stringify(a) === JSON.stringify(b); };
  var top = {slots:1}, keys = {}; Object.keys(cur).concat(Object.keys(LIB_BASE)).forEach(function(k){ keys[k] = 1; });
  var slots = Object.assign({}, (LIB_BASE.slots || {}), (cur.slots || {})), other = 0;
  Object.keys(slots).forEach(function(k){ if(!same((LIB_BASE.slots || {})[k], (cur.slots || {})[k])){ if(LIB_PART_NAMES[k]) out.push(LIB_PART_NAMES[k]); else other++; } });
  if(other) out.push("các ô kết quả AI");
  var names = {fields:"Phiếu nộp", gates:"Ô đánh dấu đã làm", wf:"Quy trình, phân công", notes:"Ghi chú thẩm định", cl:"Checklist", map:"Bản đồ chất liệu", qman:"Soát từng câu hỏi", spec:"Phần thi", level:"Mức từ vựng", libSet:"Bộ đề"};
  Object.keys(keys).forEach(function(k){ if(top[k]) return; if(!same(LIB_BASE[k], cur[k])){ var n = names[k] || "Thiết lập bài"; if(out.indexOf(n) < 0) out.push(n); } });
  return out;
}
function libCurTitle(){ return (S.lib && S.lib.title) || (typeof libTitleDefault === "function" ? libTitleDefault() : "Bài đang làm"); }
// câu nhắc dùng chung: nói rõ bài nào, đổi chỗ nào
function libUnsavedText(){ var ch = libChangedParts(); return 'Bài đang mở <b>“' + esc(libCurTitle()) + '”</b> có thay đổi chưa lưu' + (ch.length ? ': ' + esc(ch.join(", ")) : ' (so với lần lưu gần nhất)') + '.'; }
function libTitleDefault(){
  var sp = SPEC[S.spec], t = (S.slots.topic || "").trim();
  return (S.code ? S.code + " · " : "") + sp.label + (t ? " · " + t : "");
}
function libWhen(ts){
  if(!ts) return "";
  var d = ts.toDate ? ts.toDate() : new Date(ts);
  var p = function(n){ return String(n).padStart(2, "0"); };
  return p(d.getHours()) + ":" + p(d.getMinutes()) + " " + p(d.getDate()) + "/" + p(d.getMonth()+1) + "/" + d.getFullYear();
}
function libErrText(e){
  var c = (e && e.code) || "";
  if(c === "permission-denied") return "Tài khoản này chưa có quyền. Nhờ quản trị thêm email vào danh sách thầy cô.";
  if(c === "unavailable" || /offline|network/i.test(String(e && e.message))) return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
  if(c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return "Đã đóng cửa sổ đăng nhập.";
  if(c === "auth/unauthorized-domain") return "Trang này chưa được phép đăng nhập. Quản trị cần thêm tên miền của trang vào Authorized domains của Firebase.";
  return "Có lỗi: " + ((e && (e.code || e.message)) || e);
}

function libLoad(){
  if(LIB.fb) return Promise.resolve(LIB.fb);
  return import("./firebase.mjs").then(function(fb){
    LIB.fb = fb;
    LIB.app = fb.initializeApp(LIB_CFG);
    LIB.auth = fb.getAuth(LIB.app);
    LIB.db = fb.getFirestore(LIB.app);
    fb.getRedirectResult(LIB.auth).catch(function(e){ LIB.err = libErrText(e); libRender(); });
    fb.onAuthStateChanged(LIB.auth, function(u){
      // vẫn là người đã dùng thẻ này trước khi tải lại: giữ dự án, chủ đề đang mở để về đúng chỗ cũ
      var pos = typeof hubPosGet === "function" ? hubPosGet() : null, keep = !!(u && pos && pos.uid && pos.uid === hubUid(u)); LIB.authReady = true;
      LIB.user = u; LIB.role = null; LIB.me = null; LIB.items = []; LIB.err = ""; LIB.view = "list";
      if(typeof FORUM !== "undefined"){ FORUM.list = null; FORUM.cur = keep ? pos.th || null : null; FORUM.comments = null; }
      if(typeof NTF !== "undefined"){ NTF.list = null; NTF.open = false; }
      if(typeof PRJ !== "undefined"){ PRJ.list = null; PRJ.edit = {}; PRJ.sel = {}; PRJ.cur = keep ? pos.cur || null : null; if(keep && pos.tab) PRJ.tab = pos.tab; if(keep && pos.open && pos.page && typeof HUB !== "undefined") HUB.page = pos.page; PRJ.msg = ""; }
      if(!u && SPECS.loaded) specsForget();
      if(u) libCheckRole(); else { libRender(); try{ wfRender(); if(typeof hubOpen === "function" && !window.__noGate){ if(!HUB.open) hubOpen("viec"); else hubRender(); } else if(typeof hubRender === "function") hubRender(); }catch(x){} }
      libChip();
    });
    return fb;
  });
}

/* ---------- Đặc tả riêng (tài liệu tập huấn, cam kết bảo mật) ----------
   Yêu cầu số từ của VNCETA, bảng phân bố và mẫu câu hỏi bài Đọc không nằm trong mã công khai.
   Quản trị dán một lần vào Firestore config/specs; người được xem (Quản trị, Thành viên nội bộ, hoặc Thành viên được quản trị cho phép)
   tải khi đăng nhập. Chưa tải thì trang dùng số của QĐ 730. */
var SPECS = {loaded:false, at:null, err:""};
var SPECS_KEY = "vstep.specs";
function specsApply(d, quiet){
  if(!d || typeof d !== "object") return false;
  Object.keys(d.spec || {}).forEach(function(k){
    var sp = SPEC[k], x = d.spec[k]; if(!sp || !x) return;
    ["words","qd","qdist","skills"].forEach(function(f){ if(x[f] !== undefined) sp[f] = x[f]; });
    if(x.approx){ sp.approx = x.approx; delete sp.min; delete sp.max; } else if(x.min !== undefined){ sp.min = x.min; sp.max = x.max; delete sp.approx; }
  });
  Object.keys(d.qbp || {}).forEach(function(k){ QBP[k] = d.qbp[k]; });
  Object.keys(d.rstems || {}).forEach(function(k){ R_STEMS[k] = d.rstems[k]; });
  SPECS.loaded = true; SPECS.at = d.updatedAt || null;
  if(!quiet) specsRerender();
  return true;
}
function specsRerender(){
  try{ renderSpec(); renderQ(); applyBranch(); renderAllAI(); renderAnchors(); renderMetrics(); runLength(); runBand(); refreshText(); clRender(); updateStepper(); }catch(e){}
}
function specsCanRead(){ return libIsStaff() || !!(LIB.me && LIB.me.specs === true && LIB.role === "user"); }
function specsLoad(){
  if(!LIB.fb || !LIB.user || !specsCanRead()) return;
  var fb = LIB.fb;
  fb.getDoc(fb.doc(LIB.db, "config", "specs")).then(function(d){
    if(!d.exists()){ SPECS.err = "chưa có"; return; }
    var x = d.data(), j = null; try{ j = JSON.parse(x.json || "{}"); }catch(e){ SPECS.err = "lỗi dữ liệu"; return; }
    j.updatedAt = x.updatedAt && x.updatedAt.toDate ? x.updatedAt.toDate().getTime() : null;
    try{ sessionStorage.setItem(SPECS_KEY, JSON.stringify(j)); }catch(e){}
    specsApply(j); SPECS.err = "";
    try{ if(typeof hubRender === "function") hubRender(); }catch(e){}
  }).catch(function(e){ SPECS.err = e && e.code === "permission-denied" ? "không có quyền" : "không tải được"; });
}
function specsFromSession(){ try{ var t = sessionStorage.getItem(SPECS_KEY); if(t) specsApply(JSON.parse(t), true); }catch(e){} }
function specsForget(){ var had = SPECS.loaded; try{ sessionStorage.removeItem(SPECS_KEY); }catch(e){} if(had) location.reload(); }
function specsSave(text){
  var j; try{ j = JSON.parse(text); }catch(e){ return Promise.reject(new Error("Nội dung không phải JSON hợp lệ.")); }
  if(!j.spec || !j.qbp) return Promise.reject(new Error("Thiếu phần spec hoặc qbp."));
  var fb = LIB.fb;
  return fb.setDoc(fb.doc(LIB.db, "config", "specs"), {json:JSON.stringify(j), by:libEmail(), updatedAt:fb.serverTimestamp()}).then(function(){ j.updatedAt = Date.now(); try{ sessionStorage.setItem(SPECS_KEY, JSON.stringify(j)); }catch(e){} specsApply(j); });
}
function libCheckRole(){
  var fb = LIB.fb; LIB.loading = true; libRender();
  var ref = fb.doc(LIB.db, "staff", libEmail());
  fb.getDoc(ref).then(function(d){
    if(d.exists()){ LIB.me = d.data(); var r = LIB.me.role; return r === "admin" || r === "user" || r === "blocked" ? r : "editor"; }
    // lần đầu: chủ project (ghi trong luật bảo mật) tự thành quản trị; người khác tự tạo tài khoản thành viên
    var prof = {name:(LIB.user.displayName || ""), title:"", org:"", bio:"", skills:[], levels:[], color:"", setup:false, joinedAt:fb.serverTimestamp()};
    return fb.setDoc(ref, Object.assign({role:"admin", addedBy:libEmail(), addedAt:fb.serverTimestamp()}, prof)).then(function(){ LIB.me = Object.assign({role:"admin"}, prof); LIB.justJoined = true; return "admin"; }, function(){
      return fb.setDoc(ref, Object.assign({role:"user"}, prof)).then(function(){ LIB.me = Object.assign({role:"user"}, prof); LIB.justJoined = true; return "user"; }, function(){ return "none"; });
    });
  }).then(function(role){
    LIB.role = role;
    if(role !== "none" && role !== "blocked") specsLoad();
    if(libIsStaff()) fb.getDocs(fb.collection(LIB.db, "staff")).then(function(s){ LIB.staff = s.docs.map(function(d){ var x = d.data(); x.email = d.id; return x; }); if(typeof peopleAdd === "function") peopleAdd(LIB.staff); try{ wfRender(); if(typeof hubRender === "function") hubRender(); }catch(y){} }).catch(function(){});
    if(LIB.me && typeof peopleAdd === "function"){ var mine = Object.assign({}, LIB.me); mine.email = libEmail(); peopleAdd([mine]); }
    return LIB.role === "none" || LIB.role === "blocked" ? null : libList();
  }).catch(function(e){
    LIB.role = "none"; if(e && e.code !== "permission-denied") LIB.err = libErrText(e);
  }).then(function(){ LIB.loading = false; libRender(); libChip(); try{ wfRender(); if(typeof hubRender === "function") hubRender(); if(typeof hubBadge === "function") hubBadge(); if(typeof HUB !== "undefined" && HUB.open && hubSigned()){ if(typeof frLoad === "function") frLoad(); } if(typeof ntfLoad === "function") ntfLoad(); }catch(x){} });
}
function libSignIn(){
  libLoad().then(function(fb){
    var pv = new fb.GoogleAuthProvider(); pv.setCustomParameters({prompt:"select_account"});
    return fb.signInWithPopup(LIB.auth, pv).catch(function(e){
      if(e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) return fb.signInWithRedirect(LIB.auth, pv);
      throw e;
    });
  }).catch(function(e){ LIB.err = libErrText(e); libRender(); });
}
function libList(){
  var fb = LIB.fb, col = fb.collection(LIB.db, "materials"), me = libEmail();
  var qs = libIsStaff() ? [fb.query(col, fb.orderBy("updatedAt", "desc"), fb.limit(500))] : [fb.query(col, fb.where("owner", "==", me)), fb.query(col, fb.where("team", "array-contains", me))];
  return Promise.all(qs.map(function(q){ return fb.getDocs(q); })).then(function(snaps){
    var seen = {}, out = [];
    snaps.forEach(function(snap){ snap.docs.forEach(function(d){ if(seen[d.id]) return; seen[d.id] = 1; var x = d.data(); x.id = d.id; if(x.prj && x.state) try{ x.prog = libProgFrom(JSON.parse(x.state), x); }catch(e){} delete x.state; out.push(x); }); });
    var tm = function(x){ return x.updatedAt && x.updatedAt.toDate ? x.updatedAt.toDate().getTime() : 0; };
    LIB.items = out.sort(function(a, b){ return tm(b) - tm(a); });
    return typeof prjLoad === "function" ? prjLoad() : null;
  });
}
// tiến độ từng bước của một bài, tính từ bản đã lưu (ô xác nhận cuối mỗi bước); bước chỉ có ô máy tự tích thì xét theo trạng thái quy trình
var LIB_AUTO_GATE = {"cl-ck":1, "ch-ck":1, "ch-man":1};
function libProgFrom(st, x){
  var sp = SPEC[st.spec]; if(!sp) return null;
  var sk = sp.skill, g = st.gates || {}, ws = (x.wf && x.wf.st) || (st.wf && st.wf.st) || "", wi = WF_ST.indexOf(ws), out = [];
  var past = {"chat-lieu": wi >= 2 && ws !== "Ngữ liệu cần sửa" && ws !== "Thay bài / Loại", "cau-hoi": wi >= 6 && ws !== "Câu hỏi cần sửa" && ws !== "Thay bài / Loại"};
  Array.prototype.forEach.call(document.querySelectorAll(".screen"), function(s){
    var b = s.getAttribute("data-branch"); if(b !== "all" && b !== sk) return;
    var ks = Array.prototype.filter.call(s.querySelectorAll("input[data-gate]"), function(i){ var l = i.closest("[data-branchtext]"); return !l || l.getAttribute("data-branchtext") === sk; }).map(function(i){ return i.getAttribute("data-gate"); });
    var man = ks.filter(function(k){ return !LIB_AUTO_GATE[k]; });
    out.push({id:s.id, n:s.getAttribute("data-name"), d: man.length ? man.every(function(k){ return g[k]; }) : !!past[s.id]});
  });
  return out;
}
function libRefresh(){ LIB.loading = true; LIB.err = ""; libRender(); libList().catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); }); }

/* ---- lưu ---- */
var LIB_ASIA = /\b(viet ?nam(ese)?|ha ?noi|ho chi minh|sai ?gon|da nang|hue|mekong|can gio|ha long|asean|asia(n)?|southeast asia|thai(land)?|bangkok|indonesia(n)?|jakarta|malaysia(n)?|philippines|filipino|manila|singapore(an)?|laos|lao|cambodia(n)?|myanmar|brunei|china|chinese|beijing|japan(ese)?|tokyo|korea(n)?|seoul|india(n)?|taiwan(ese)?|mongolia(n)?|bangladesh|nepal|sri lanka)\b/i;
function libUrl(){ var m = String(S.fields && S.fields["pc-url"] || "").match(/https?:\/\/\S+/) || String(S.slots.src||"").match(/https?:\/\/\S+/); return m ? m[0] : ""; }
function libNormUrl(u){ return String(u||"").toLowerCase().replace(/^https?:\/\/(www\.)?/,"").replace(/[?#].*$/,"").replace(/\/+$/,""); }
function libMeta(){
  var sp = SPEC[S.spec], d = S.slots.draft || "", R = (S.slots.questions||"").trim() ? parseQ(S.slots.questions) : null, topic = (S.slots.topic||"").trim();
  return {spec:S.spec, specLabel:sp.label, skill:sp.skill, level:S.level, topic:topic, code:S.code||"", set:(S.libSet||"").trim(), url:libUrl(), asia:LIB_ASIA.test(topic + " " + d), words:(d.trim() ? d.trim().split(/\s+/).length : 0), questions:(R ? R.items.length : 0), step:S.step||"", slot:(S.spec === "L1" ? String(S.l1slot || "") : "")};
}
function libTopicWords(s){ return String(s||"").toLowerCase().normalize("NFC").split(/[^a-z0-9à-ỹđ]+/).filter(function(w){ return w.length >= 3 && " the and for with from that this của các những cho trong một về với được người bài ".indexOf(" " + w + " ") < 0; }); }
function libDupes(){
  var me = libMeta(), out = [], tw = libTopicWords(me.topic + " " + (S.lib ? "" : "")), nu = libNormUrl(me.url);
  LIB.items.forEach(function(x){
    if(S.lib && S.lib.id === x.id) return;
    var m = x.meta || {}, why = [];
    if(nu && libNormUrl(m.url) === nu) why.push("cùng nguồn");
    var xw = libTopicWords(m.topic);
    if(tw.length && xw.length){
      var set = {}, inter = 0; tw.forEach(function(w){ set[w] = 1; }); var uni = Object.keys(set).length;
      xw.forEach(function(w){ if(set[w] === 1){ inter++; set[w] = 2; } else if(!set[w]){ set[w] = 3; uni++; } });
      if(inter >= 2 && inter / uni >= 0.5) why.push("chủ đề gần giống");
    }
    if(why.length) out.push({x:x, why:why.join(", ")});
  });
  return out;
}
function libSetsHTML(){
  var sets = {};
  LIB.items.forEach(function(x){ var m = x.meta || {}; if(!m.set) return; (sets[m.set] = sets[m.set] || []).push(x); });
  var names = Object.keys(sets).sort(); if(!names.length) return "";
  return '<details class="small"><summary>Bộ đề trong thư viện (' + names.length + ')</summary><table class="libtab"><tr><th>Bộ đề</th><th>Các phần đã có</th><th>Bài Đọc bối cảnh Việt Nam hoặc châu Á</th></tr>' + names.map(function(n){
    var xs = sets[n], parts = {}, asiaR = xs.filter(function(x){ var m = x.meta || {}; return m.skill === "R" && m.asia; });
    xs.forEach(function(x){ var m = x.meta || {}; parts[m.specLabel || m.spec] = (parts[m.specLabel || m.spec] || 0) + 1; });
    var hasR = xs.some(function(x){ return (x.meta||{}).skill === "R"; }), missR = ["R1","R2","R3","R4"].filter(function(k){ return !xs.some(function(x){ return (x.meta||{}).spec === k; }); });
    return '<tr><td><b>' + esc(n) + '</b></td><td>' + Object.keys(parts).sort().map(function(p){ return esc(p) + (parts[p] > 1 ? " ×" + parts[p] : ""); }).join(", ") + (hasR && missR.length ? '<div class="muted">Đọc còn thiếu: ' + missR.map(function(k){ return SPEC[k] ? SPEC[k].label : k; }).join(", ") + '</div>' : '') + '</td><td>' + (!hasR ? '<span class="muted">chưa có bài Đọc</span>' : asiaR.length ? '<span class="libok">Có: ' + asiaR.map(function(x){ return esc(x.title); }).join("; ") + '</span>' : '<span class="libdirty">Chưa có. Mỗi bộ đề Đọc cần ít nhất 1 bài chủ đề Việt Nam hoặc châu Á.</span>') + '</td></tr>';
  }).join("") + '</table><p class="muted">Trang tự nhận bài có bối cảnh Việt Nam hoặc châu Á theo tên địa danh, quốc gia trong chủ đề và bài.</p></details>';
}
function libSave(asNew, title){
  var fb = LIB.fb; if(!fb || !LIB.user || LIB.role === "none" || !LIB.role){ toast("Cần đăng nhập bằng tài khoản có trong danh sách."); return; }
  var st = libStateCopy(), json = JSON.stringify(st);
  if(json.length > LIB_MAX){ LIB.err = "Bài quá lớn để lưu (" + Math.round(json.length/1024) + " KB, tối đa khoảng 880 KB). Thường do văn bản nguồn quá dài: rút bớt phần nguồn không dùng rồi thử lại."; libRender(); return; }
  var link = (!asNew && S.lib && S.lib.id) ? S.lib : null;
  var ref = link ? fb.doc(LIB.db, "materials", link.id) : fb.doc(fb.collection(LIB.db, "materials"));
  var me = libEmail(), name = (LIB.user.displayName || me), meta = libMeta();
  var t = (title || (link && link.title) || libTitleDefault()).trim().slice(0, 200);
  LIB.loading = true; LIB.err = ""; libRender();
  return fb.runTransaction(LIB.db, function(tx){
    return tx.get(ref).then(function(cur){
      var rev = 1, base = {owner:me, ownerName:name, createdAt:fb.serverTimestamp(), status:LIB_STATUS[0]};
      if(cur.exists()){
        var c = cur.data();
        if(link && (c.rev||0) !== (link.rev||0)){ var er = new Error("conflict"); er.code = "lib/conflict"; er.cur = c; throw er; }
        rev = (c.rev||0) + 1; base = {owner:c.owner, ownerName:c.ownerName, createdAt:c.createdAt, status:c.status || LIB_STATUS[0], prj:c.prj || null, asg:c.asg || null, due:c.due || "", team:c.team || [], rem:c.rem || null, stats:c.stats || null};
        // phân công đổi ở bảng dự án sau lần mở bài: lấy về trước khi lưu
        if(c.asg && typeof prjMerge === "function"){ if(!S.wf && c.asg.as) S.wf = {st:"", as:{}, log:[]}; if(S.wf && prjMerge(S.wf, c.asg)){ json = JSON.stringify(libStateCopy()); } }
      } else if(link){ var e2 = new Error("gone"); e2.code = "lib/gone"; throw e2; }
      else { base.prj = (S.prj && S.prj.id) || null; base.team = (base.prj && typeof prjPeople === "function") ? prjPeople(base.prj) : []; }
      var wfs = typeof wfSummary==="function" ? wfSummary() : null, hasWf = !!(S.wf && (S.wf.st || Object.keys(S.wf.as||{}).length || (S.wf.log||[]).length));
      var rec = {title:t, owner:base.owner, ownerName:base.ownerName, createdAt:base.createdAt, status:(wfs && wfs.st) || base.status, wf:wfs, rev:rev, updatedAt:fb.serverTimestamp(), updatedBy:me, updatedByName:name, meta:meta, state:json,
        prj:base.prj || null, team:base.team || [], rem:base.rem || null, stats:base.stats || null, due:hasWf ? (S.wf.due || "") : (base.due || ""), asg:hasWf ? {as:JSON.parse(JSON.stringify(S.wf.as || {})), at:S.wf.asAt || (base.asg && base.asg.at) || 0, by:(base.asg && base.asg.by) || me, due:S.wf.due || "", dues:JSON.parse(JSON.stringify(S.wf.dues || {}))} : base.asg};
      tx.set(ref, rec);
      tx.set(fb.doc(LIB.db, "materials", ref.id, "versions", "v" + (rev % LIB_KEEP)), {rev:rev, savedAt:fb.serverTimestamp(), savedBy:me, savedByName:name, title:t, state:json});
      return rev;
    });
  }).then(function(rev){
    S.lib = {id:ref.id, rev:rev, title:t, hash:libStateHash(JSON.parse(json))}; libSetBase(JSON.parse(json)); delete S.libCopyTitle; save();
    LIB.view = "list"; toast("Đã lưu lên thư viện: " + t + " (bản " + rev + ").");
    return libList();
  }).catch(function(e){
    if(e && e.code === "lib/conflict"){ LIB.view = "conflict"; LIB.pending = e.cur; }
    else if(e && e.code === "lib/gone"){ LIB.err = "Bài này đã bị xoá khỏi thư viện. Bấm \"Lưu thành bài mới\" để lưu lại."; }
    else LIB.err = libErrText(e);
  }).then(function(){ LIB.loading = false; libRender(); libChip(); });
}

/* ---- mở, nhân bản, lịch sử, xoá, trạng thái ---- */
// chip Thư viện: so riêng với bản trên thư viện
function libLibDirty(){ if(!S.lib || !S.lib.id) return fpUnsaved(); var h = libStateHash(); if(h === S.lib.hash) return false; if(LIB_BASE && !libChangedParts().length){ S.lib.hash = h; return false; } return true; }
// hỏi trước khi thay bài: chưa lưu ở đâu cả (thư viện hoặc file) mới hỏi
function libDirty(){ return fpUnsaved(); }
function fpStateHash(){ return libStateHash(); }
// có nội dung chưa lưu ở đâu cả (thư viện hoặc file)
function fpUnsaved(){
  if(!fpHasWork()) return false;
  var h = fpStateHash();
  if(S.lib && S.lib.id && S.lib.hash === h) return false;
  if(S.fileHash && S.fileHash === h) return false;
  // có mốc trong phiên mà không đổi phần nào: coi như đã lưu (khoá ẩn đổi thứ tự, ô trống…)
  if(LIB_BASE && !libChangedParts().length) return false;
  return true;
}
function libAsk(text, action){
  if(!libDirty()){ action(); return; }
  LIB.pending = {text:text + '<br><span class="small">' + libUnsavedText() + '</span>', action:action, back:(LIB.view === "prj" || LIB.view === "prjd") ? LIB.view : "list"}; LIB.view = "ask"; libRender();
}
function libFetch(id){ var fb = LIB.fb; return fb.getDoc(fb.doc(LIB.db, "materials", id)); }
function libOpen(id, copy, force){
  var it = LIB.items.filter(function(x){ return x.id === id; })[0]; if(!it) return;
  (force ? function(t, a){ a(); } : libAsk)((copy ? "<b>Nhân bản bài \"" + esc(it.title) + "\"?</b>" : "<b>Mở bài \"" + esc(it.title) + "\"?</b>") + " Bài đó sẽ thay cho bài đang mở trên trang.", function(){
    LIB.loading = true; libRender();
    libFetch(id).then(function(d){
      if(!d.exists()){ LIB.err = "Bài này không còn trong thư viện."; return libList(); }
      var x = d.data(), st = JSON.parse(x.state);
      if(typeof prjOnOpen === "function") prjOnOpen(st, x, copy);
      st.step = libStepFor(x.status || (st.wf && st.wf.st), x.step || (x.meta || {}).step, ((st.wf || {}).as || {}).nl !== libEmail());
      applyState(st); try{ window.scrollTo(0, 0); }catch(y){}
      if(copy){ S.lib = null; S.libCopyTitle = "Bản sao của " + x.title; toast("Đã nhân bản. Bấm \"Lưu lên thư viện\" để lưu thành bài mới."); }
      else { S.lib = {id:id, rev:x.rev, title:x.title, hash:libStateHash()}; libSetBase(); toast("Đã mở: " + x.title + " (bản " + x.rev + "). Đang ở bước " + libStepName(S.step) + "."); }
      save(); libToggle(false); if(typeof hubClose === "function") hubClose();
    }).catch(function(e){ LIB.err = libErrText(e); if(typeof hubRender === "function") hubRender(); }).then(function(){ LIB.loading = false; libRender(); libChip(); });
  });
}
// mở bài thì vào thẳng bước đang cần làm theo trạng thái quy trình; giai đoạn soạn ngữ liệu thì về bước người soạn dừng lần trước
function libStepFor(st, saved, notNl){
  var ok = function(id){ return id && document.getElementById(id) && document.getElementById(id).classList.contains("screen"); };
  var pre = ["bat-dau","chu-de","nguon"], nl = ["bat-dau","chu-de","nguon","viet-bai","viet-kich-ban","do-dai","tu-vung","noi-dung","chat-lieu"];
  // người duyệt cổng 1 (không phải người soạn) vào thẳng Phiếu duyệt đề xuất ở đầu bước Nguồn
  if(st === "Chủ đề đề xuất") return notNl ? "nguon" : (pre.indexOf(saved) >= 0 ? saved : "nguon");
  if(st === "Đang adapt" || st === "Ngữ liệu cần sửa") return nl.indexOf(saved) >= 2 ? saved : "viet-bai";
  if(st === "Chờ thẩm định ngữ liệu") return "chat-lieu";
  if(st === "Ngữ liệu đã duyệt (khoá)" || st === "Đang soạn câu hỏi" || st === "Chờ thẩm định câu hỏi" || st === "Câu hỏi cần sửa") return saved === "nop" && st === "Đang soạn câu hỏi" ? "nop" : "cau-hoi";
  if(st === "Câu hỏi đã duyệt" || st === "Đã hoàn thiện") return "nop";
  return ok(saved) ? saved : "bat-dau";
}
function libStepName(id){ var el = document.getElementById(id); return el ? (el.getAttribute("data-name") || id) : id; }
function libHistory(id){
  var fb = LIB.fb, it = LIB.items.filter(function(x){ return x.id === id; })[0];
  LIB.view = "hist"; LIB.hist = {id:id, title:it ? it.title : "", list:null, cmp:""}; LIB.loading = true; libRender();
  fb.getDocs(fb.collection(LIB.db, "materials", id, "versions")).then(function(s){
    LIB.hist.list = s.docs.map(function(d){ var x = d.data(); x.vid = d.id; delete x.state; return x; }).sort(function(a, b){ return b.rev - a.rev; });
  }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); });
}
function libOpenVersion(id, vid){
  var fb = LIB.fb;
  libAsk("<b>Mở bản cũ này?</b> Bài đó sẽ thay cho bài đang mở trên trang.", function(){
    LIB.loading = true; libRender();
    Promise.all([fb.getDoc(fb.doc(LIB.db, "materials", id, "versions", vid)), libFetch(id)]).then(function(r){
      var v = r[0].data(), cur = r[1].exists() ? r[1].data() : null;
      var vs = JSON.parse(v.state); if(cur && typeof prjOnOpen === "function") prjOnOpen(vs, cur, false); vs.step = libStepFor(vs.wf && vs.wf.st, cur && (cur.meta || {}).step);
      applyState(vs); try{ window.scrollTo(0, 0); }catch(y){}
      S.lib = cur ? {id:id, rev:cur.rev, title:cur.title, hash:""} : null; save();
      toast("Đã mở bản " + v.rev + ". Bấm \"Lưu lên thư viện\" nếu muốn khôi phục bản này thành bản mới nhất.");
      libToggle(false);
    }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); libChip(); });
  });
}
function libCompareVersion(id, vid){
  var fb = LIB.fb; LIB.loading = true; libRender();
  fb.getDoc(fb.doc(LIB.db, "materials", id, "versions", vid)).then(function(r){
    var v = r.data(), o = JSON.parse(v.state), od = (o.slots || {}).draft || "", oq = (o.slots || {}).questions || "", cd = S.slots.draft || "", cq = S.slots.questions || "";
    var h = '<h4>Bản ' + v.rev + ' (' + esc(libWhen(v.savedAt)) + ') so với bài đang mở</h4>';
    h += '<p class="small"><b>Bài:</b> ' + (od === cd ? "không đổi." : "chỉ hiện các đoạn đã đổi (chữ gạch là bản cũ, chữ tô là bản đang mở).") + '</p>' + (od === cd ? "" : '<div class="small">' + wfDiffUnits(od, cd) + '</div>');
    if(oq || cq){
      if(oq === cq) h += '<p class="small"><b>Câu hỏi:</b> không đổi.</p>';
      else {
        var A = oq.trim() ? parseQ(oq).items : [], B = cq.trim() ? parseQ(cq).items : [], rows = [];
        var byN = {}; A.forEach(function(it){ byN[it.n] = it; });
        B.forEach(function(it){ var p = byN[it.n]; if(!p) rows.push('<div class="small"><b>Câu ' + it.n + ':</b> câu mới.</div>'); else if(qSig(p) !== qSig(it)) rows.push('<div class="small"><b>Câu ' + it.n + ':</b> ' + wordDiffHTML(wfItemText(p), wfItemText(it)) + '</div>'); delete byN[it.n]; });
        Object.keys(byN).forEach(function(n){ rows.push('<div class="small"><b>Câu ' + n + ':</b> đã bỏ.</div>'); });
        h += '<p class="small"><b>Câu hỏi:</b> ' + (rows.length ? rows.length + " câu khác." : "chỉ khác cách trình bày.") + '</p>' + rows.join("");
      }
    }
    var ow = (o.wf || {}).st, cw = (S.wf || {}).st; if(ow !== cw) h += '<p class="small"><b>Trạng thái:</b> ' + esc(ow || "chưa vào quy trình") + ' → ' + esc(cw || "chưa vào quy trình") + '</p>';
    LIB.hist.cmp = h;
  }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); });
}
function libSetStatus(id, status){
  var fb = LIB.fb;
  fb.updateDoc(fb.doc(LIB.db, "materials", id), {status:status, statusBy:libEmail(), statusAt:fb.serverTimestamp()}).then(function(){
    LIB.items.forEach(function(x){ if(x.id === id) x.status = status; }); toast("Đã đổi trạng thái: " + status + ".");
  }).catch(function(e){ LIB.err = libErrText(e); libRender(); });
}
function libDelete(id){
  var fb = LIB.fb, it = LIB.items.filter(function(x){ return x.id === id; })[0]; if(!it) return;
  LIB.pending = {text:"<b>Xoá hẳn bài \"" + esc(it.title) + "\" khỏi thư viện?</b> Không khôi phục được. Nên xuất thư viện ra file trước.", action:function(){
    LIB.loading = true; libRender();
    fb.getDocs(fb.collection(LIB.db, "materials", id, "versions")).then(function(s){
      return Promise.all(s.docs.map(function(d){ return fb.deleteDoc(d.ref); }));
    }).then(function(){ return fb.deleteDoc(fb.doc(LIB.db, "materials", id)); }).then(function(){
      if(S.lib && S.lib.id === id){ S.lib = null; save(); }
      toast("Đã xoá: " + it.title + "."); return libList();
    }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); libChip(); });
  }, danger:true};
  LIB.view = "ask"; libRender();
}
function libExportAll(){
  var fb = LIB.fb; LIB.loading = true; libRender();
  fb.getDocs(fb.collection(LIB.db, "materials")).then(function(s){
    var out = {app:"vstep-pipeline-library", format:1, exportedAt:new Date().toISOString(), materials:s.docs.map(function(d){ var x = d.data(); return {id:d.id, title:x.title, status:x.status, owner:x.owner, rev:x.rev, meta:x.meta, updatedAt:x.updatedAt && x.updatedAt.toDate ? x.updatedAt.toDate().toISOString() : null, state:JSON.parse(x.state)}; })};
    var d = new Date(), p = function(n){ return String(n).padStart(2, "0"); };
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], {type:"application/json"}));
    a.download = "thu-vien-vstep_" + d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + ".json"; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("Đã xuất " + out.materials.length + " bài ra file.");
  }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); });
}

/* ---- thành viên (quản trị) ---- */
function libStaffLoad(){
  var fb = LIB.fb; LIB.view = "staff"; LIB.staff = null; LIB.loading = true; libRender();
  fb.getDocs(fb.collection(LIB.db, "staff")).then(function(s){
    LIB.staff = s.docs.map(function(d){ var x = d.data(); x.email = d.id; return x; }).sort(function(a, b){ return a.email < b.email ? -1 : 1; });
  }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ LIB.loading = false; libRender(); });
}
function libStaffAdd(emails, role){
  var fb = LIB.fb, list = String(emails||"").split(/[\s,;]+/).map(function(x){ return x.trim().toLowerCase(); }).filter(function(x){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x); });
  if(!list.length){ toast("Chưa có email hợp lệ."); return; }
  LIB.loading = true; libRender();
  Promise.all(list.map(function(em){ return fb.setDoc(fb.doc(LIB.db, "staff", em), {role:role === "admin" ? "admin" : "editor", addedBy:libEmail(), addedAt:fb.serverTimestamp()}); }))
    .then(function(){ toast("Đã thêm " + list.length + " email."); libStaffLoad(); })
    .catch(function(e){ LIB.err = libErrText(e); LIB.loading = false; libRender(); });
}
function libStaffRemove(em){
  var fb = LIB.fb; if(em === libEmail()){ toast("Không tự xoá chính mình."); return; }
  fb.deleteDoc(fb.doc(LIB.db, "staff", em)).then(function(){ toast("Đã bỏ " + em + "."); libStaffLoad(); }).catch(function(e){ LIB.err = libErrText(e); libRender(); });
}

/* ---- giao diện ---- */
function libChip(){
  if(typeof edRender === "function"){ try{ edRender(); }catch(e){} }
  var c = document.getElementById("libchip"); if(!c) return;
  if(S.lib && S.lib.id){ var dirty = libLibDirty(); c.textContent = "Thư viện: " + S.lib.title + (dirty ? " · có thay đổi chưa lưu" : " · đã lưu"); c.className = "chip " + (dirty ? "libdirty" : "libok"); c.classList.remove("hidden"); }
  else c.classList.add("hidden");
}
function libRowHTML(x){
  var mine = x.owner === libEmail(), canDel = mine || libIsAdmin(), cur = S.lib && S.lib.id === x.id, m = x.meta || {};
  var w = x.wf || {}, as = w.as || {}, task = libMyTask(x);
  return '<tr' + (cur ? ' class="libcur"' : '') + '><td><b>' + esc(x.title) + '</b>' + (cur ? ' <span class="small libok">đang mở</span>' : '') +
    '<div class="small muted">' + (m.set ? "Bộ đề " + esc(m.set) + " · " : "") + esc(m.specLabel || m.spec || "") + (m.level ? " · " + esc(m.level) : "") + (m.words ? " · " + m.words + " từ" : "") + (m.questions ? " · " + m.questions + " câu hỏi" : "") + '</div></td>' +
    '<td><span class="wfst">' + esc((x.wf && !x.wf.st && x.prj) ? "Chưa bắt đầu" : (x.status || "")) + '</span>' + (x.prj && typeof prjName === "function" ? '<div class="small muted">Dự án: ' + esc(prjName(x.prj)) + (x.due ? " · hạn " + esc(prjFmt(x.due)) : "") + '</div>' : '') + '' + (w.req ? '<div class="small warnc">Yêu cầu sửa ngữ liệu: ' + esc(w.req) + '</div>' : '') + (w.lockVer ? '<div class="small muted">khoá bản ' + w.lockVer + '</div>' : '') + (task ? '<div class="small libok"><b>Việc của bạn</b></div>' : '') + '<div class="small muted">' + ["nl","tdnl","ch","tdch"].filter(function(r){ return as[r]; }).map(function(r){ return ({nl:"NL",tdnl:"TĐ NL",ch:"CH",tdch:"TĐ CH"})[r] + ": " + esc(as[r].split("@")[0]); }).join(" · ") + '</div></td>' +
    '<td class="small">' + esc(x.ownerName || x.owner || "") + '<div class="muted">sửa lần cuối: ' + esc(x.updatedByName || x.updatedBy || "") + '<br>' + esc(libWhen(x.updatedAt)) + ' · bản ' + (x.rev||1) + '</div></td>' +
    '<td class="libacts"><button class="btn" type="button" data-libopen="' + esc(x.id) + '">Mở</button> <button class="btn quiet" type="button" data-libcopy="' + esc(x.id) + '">Nhân bản</button> <button class="btn quiet" type="button" data-libhist="' + esc(x.id) + '">Lịch sử</button>' + (canDel ? ' <button class="btn quiet danger" type="button" data-libdel="' + esc(x.id) + '">Xoá</button>' : '') + '</td></tr>';
}
function libRender(){
  var el = libEl(); if(!el || el.classList.contains("hidden")) return;
  var h = '<div class="libhead"><b>Thư viện bài</b>' + (LIB.user ? ' <span class="small muted">' + esc(LIB.user.email) + (libIsAdmin() ? " · quản trị" : LIB.role === "user" ? " · thành viên" : "") + '</span> <button class="btn quiet" type="button" id="lib-out">Đăng xuất</button>' : '') + ' <button class="btn quiet" type="button" id="lib-close">Đóng</button></div>';
  if(LIB.err) h += '<p class="libmsg bad">' + esc(LIB.err) + '</p>';
  if(LIB.loading) h += '<p class="small muted">Đang xử lý…</p>';
  if(!LIB.fb){ h += '<p class="small muted">Đang tải…</p>'; el.innerHTML = h; return; }
  if(!LIB.user){
    h += '<p>Thư viện lưu bài lên máy chủ để thầy cô mở lại ở máy khác và làm việc theo dự án. Lần đầu đăng nhập bằng Google, trang tự tạo tài khoản cho bạn.</p><button class="btn primary" type="button" id="lib-in">Đăng nhập bằng Google</button>';
    el.innerHTML = h; return;
  }
  if(LIB.role === "blocked"){ h += '<p>Tài khoản <b>' + esc(LIB.user.email) + '</b> đã bị quản trị khoá.</p>'; el.innerHTML = h; return; }
  if(LIB.role === "none"){
    h += '<p>Chưa tạo được tài khoản cho <b>' + esc(LIB.user.email) + '</b>. Thường do máy chủ còn dùng luật bảo mật cũ: quản trị dán luật mới trong file firestore.rules.example vào Firebase rồi tải lại trang.</p>';
    el.innerHTML = h; return;
  }
  if(!LIB.role){ el.innerHTML = h; return; }
  if(LIB.view === "ask" && LIB.pending){
    h += '<div class="fpconfirm"><p>' + LIB.pending.text + '</p><div class="clearbtns">' +
      (LIB.pending.danger ? '<button class="btn danger" type="button" id="lib-yes">' + esc(LIB.pending.yes || "Xoá") + '</button>' : '<button class="btn primary" type="button" id="lib-yes-save">Lưu “' + esc(libCurTitle()) + '” lên thư viện trước</button><button class="btn" type="button" id="lib-yes">Tiếp tục, bỏ thay đổi</button>') +
      '<button class="btn quiet" type="button" id="lib-back">Huỷ</button></div></div>';
    el.innerHTML = h; return;
  }
  if(LIB.view === "conflict" && LIB.pending){
    var c = LIB.pending;
    h += '<div class="fpconfirm"><p><b>Bài này vừa được ' + esc(c.updatedByName || c.updatedBy || "người khác") + ' lưu lúc ' + esc(libWhen(c.updatedAt)) + ' (bản ' + c.rev + ')</b>, sau lần bạn mở. Nếu lưu đè, phần sửa của họ sẽ mất.</p><div class="clearbtns">' +
      '<button class="btn primary" type="button" id="lib-conf-new">Lưu bản của tôi thành bài mới</button>' +
      '<button class="btn" type="button" id="lib-conf-open">Mở bản mới nhất của họ (bỏ thay đổi của tôi)</button>' +
      '<button class="btn quiet" type="button" id="lib-back">Huỷ</button></div></div>';
    el.innerHTML = h; return;
  }
  if(LIB.view === "hist" && LIB.hist){
    h += '<p><button class="btn quiet" type="button" id="lib-back">← Danh sách</button> <b>Lịch sử: ' + esc(LIB.hist.title) + '</b> <span class="small muted">(giữ ' + LIB_KEEP + ' bản gần nhất)</span></p>';
    if(LIB.hist.list) h += '<table class="libtab"><tr><th>Bản</th><th>Lưu lúc</th><th>Người lưu</th><th></th></tr>' + LIB.hist.list.map(function(v){ return '<tr><td>' + v.rev + '</td><td>' + esc(libWhen(v.savedAt)) + '</td><td>' + esc(v.savedByName || v.savedBy || "") + '</td><td><button class="btn quiet" type="button" data-libver="' + esc(v.vid) + '">Mở bản này</button> ' + (S.lib && S.lib.id === LIB.hist.id ? '<button class="btn quiet" type="button" data-libcmp="' + esc(v.vid) + '">So với bài đang mở</button>' : '') + '</td></tr>'; }).join("") + '</table>' + (LIB.hist.cmp ? '<div class="libcmp">' + LIB.hist.cmp + '</div>' : (S.lib && S.lib.id === LIB.hist.id ? '' : '<p class="small muted">Mở bài này trên trang để so một bản cũ với bản đang làm.</p>'));
    el.innerHTML = h; return;
  }
  if(LIB.view === "staff"){
    h += '<p><button class="btn quiet" type="button" id="lib-back">← Danh sách</button> <b>Thành viên</b></p>' +
      '<p class="small muted">Thầy cô đăng nhập bằng đúng email Google ghi ở đây. Quản trị được thêm, bỏ thành viên và xoá mọi bài; thành viên thường xem, sửa mọi bài và chỉ xoá bài mình tạo.</p>' +
      '<div class="librow"><textarea id="lib-newstaff" rows="2" placeholder="Một hoặc nhiều email, cách nhau bằng dấu phẩy hoặc xuống dòng"></textarea><select id="lib-newrole"><option value="editor">Thành viên</option><option value="admin">Quản trị</option></select><button class="btn primary" type="button" id="lib-addstaff">Thêm</button></div>';
    if(LIB.staff) h += '<table class="libtab"><tr><th>Email</th><th>Vai trò</th><th></th></tr>' + LIB.staff.map(function(x){ return '<tr><td>' + esc(x.email) + '</td><td>' + (x.role === "admin" ? "Quản trị" : "Thành viên") + '</td><td>' + (x.email === libEmail() ? '' : '<button class="btn quiet danger" type="button" data-libunstaff="' + esc(x.email) + '">Bỏ</button>') + '</td></tr>'; }).join("") + '</table>';
    el.innerHTML = h; return;
  }
  if((LIB.view === "prj" || LIB.view === "prjd") && typeof prjHTML === "function"){ h += prjHTML(); el.innerHTML = h; if(typeof prjAfterRender === "function") prjAfterRender(el); return; }
  // danh sách
  var linked = S.lib && S.lib.id;
  if(LIB.role === "user") h += '<p class="small muted">Bạn thấy bài mình tạo và bài trong các dự án bạn được mời. Quản trị có thể cho bạn xem cả thư viện ở mục Thành viên.</p>';
  h += '<div class="librow">' +
    '<input id="lib-title" type="text" value="' + esc(linked ? S.lib.title : (S.libCopyTitle || libTitleDefault())) + '" aria-label="Tên bài" placeholder="Tên bài">' +
    '<button class="btn primary" type="button" id="lib-save">' + (linked ? "Lưu thay đổi lên thư viện" : "Lưu bài đang làm lên thư viện") + '</button>' +
    (linked ? '<button class="btn" type="button" id="lib-saveas">Lưu thành bài mới</button>' : '') + '</div>' +
    '<div class="librow small"><label for="lib-set">Bộ đề</label><input id="lib-set" type="text" value="' + esc(S.libSet || "") + '" placeholder="Tên hoặc mã bộ đề, ví dụ: Đề 01 (không bắt buộc)"></div>';
  var dup = libDupes();
  if(dup.length) h += '<p class="libmsg libdirty"><b>Có thể trùng với bài đã có trong thư viện:</b> ' + dup.map(function(d){ return '"' + esc(d.x.title) + '" (' + esc(d.why) + '; ' + esc(d.x.ownerName || d.x.owner || "") + ', ' + esc(d.x.status || "") + ')'; }).join("; ") + '. Kiểm lại trước khi soạn tiếp để thành viên trong nhóm không làm trùng chủ đề hoặc nguồn.</p>';
  if(linked) h += '<p class="small muted">Bài trên trang đang gắn với bài "' + esc(S.lib.title) + '" trong thư viện (bản ' + S.lib.rev + '). ' + (libDirty() ? '<b>Có thay đổi chưa lưu.</b>' : 'Không có thay đổi chưa lưu.') + '</p>';
  var specs = {}; LIB.items.forEach(function(x){ var m = x.meta || {}; if(m.spec) specs[m.spec] = m.specLabel || m.spec; });
  h += '<div class="librow small"><input id="lib-q" type="search" placeholder="Tìm theo tên, chủ đề, người soạn" value="' + esc(LIB.filter.q) + '">' +
    '<select id="lib-fspec"><option value="">Mọi phần thi</option>' + Object.keys(specs).sort().map(function(k){ return '<option value="' + esc(k) + '"' + (LIB.filter.spec === k ? ' selected' : '') + '>' + esc(specs[k]) + '</option>'; }).join("") + '</select>' +
    '<label><input type="checkbox" id="lib-mine"' + (LIB.filter.mine ? ' checked' : '') + '> Việc của tôi (' + LIB.items.filter(libMyTask).length + ')</label>' +
    '<select id="lib-fst"><option value="">Mọi trạng thái</option>' + WF_ST.concat(LIB_STATUS).map(function(s){ return '<option' + (LIB.filter.status === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join("") + '</select>' +
    '<button class="btn quiet" type="button" id="lib-refresh">Tải lại</button><button class="btn quiet" type="button" id="lib-export">Xuất cả thư viện ra file</button>' + (libIsAdmin() ? '<button class="btn quiet" type="button" id="lib-staff">Thành viên</button>' : '') + '</div>';
  if(typeof prjEntryHTML === "function") h += prjEntryHTML();
  var q = LIB.filter.q.toLowerCase();
  var rows = LIB.items.filter(function(x){
    var m = x.meta || {};
    if(LIB.filter.spec && m.spec !== LIB.filter.spec) return false;
    if(LIB.filter.status && x.status !== LIB.filter.status) return false;
    if(LIB.filter.mine && !libMyTask(x)) return false;
    if(q && (x.title + " " + (m.topic||"") + " " + (x.ownerName||"") + " " + (x.owner||"") + " " + (m.code||"") + " " + (m.set||"")).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  h += libSetsHTML();
  h += rows.length ? '<div class="libwrap"><table class="libtab"><tr><th>Bài</th><th>Trạng thái</th><th>Người soạn</th><th></th></tr>' + rows.map(libRowHTML).join("") + '</table></div>' : '<p class="small muted">' + (LIB.items.length ? "Không có bài nào khớp bộ lọc." : "Thư viện chưa có bài nào.") + '</p>';
  el.innerHTML = h;
}
function libToggle(open){
  var el = libEl(), b = document.getElementById("libbtn"); if(!el) return;
  el.classList.toggle("hidden", !open); if(!open) document.body.classList.remove("libopen"); if(b) b.setAttribute("aria-expanded", open ? "true" : "false");
  if(open){
    var cp = document.getElementById("clearpanel"); if(cp && !cp.classList.contains("hidden")) document.getElementById("clearbtn").click();
    LIB.err = ""; if(["list","staff","prj","prjd"].indexOf(LIB.view) < 0) LIB.view = "list";
    libRender();
    libLoad().then(function(){ libRender(); if(LIB.user && LIB.role && LIB.role !== "none") libRefresh(); }).catch(function(e){ LIB.err = "Không tải được phần đăng nhập. Thư viện chỉ chạy khi mở trang qua đường dẫn web (không mở từ file trên máy). " + (e && e.message ? "(" + e.message + ")" : ""); libRender(); });
  }
}
function bindLib(){
  var b = document.getElementById("libbtn"), el = libEl(); if(!b || !el) return;
  b.addEventListener("click", function(){ libToggle(el.classList.contains("hidden")); });
  el.addEventListener("click", function(e){
    var t = e.target.closest ? e.target.closest("button") : null; if(!t) return;
    var id = t.id, a;
    if(id === "lib-close"){ libToggle(false); return; }
    if(id === "lib-in"){ LIB.err = ""; libSignIn(); return; }
    if(id === "lib-out"){ LIB.fb.signOut(LIB.auth); LIB.view = "list"; return; }
    if(id === "lib-back"){ LIB.view = (LIB.pending && LIB.pending.back) || "list"; LIB.pending = null; libRender(); return; }
    if(id === "lib-yes"){ a = LIB.pending && LIB.pending.action; LIB.view = (LIB.pending && LIB.pending.back) || "list"; LIB.pending = null; if(a) a(); return; }
    if(id === "lib-yes-save"){ a = LIB.pending && LIB.pending.action; LIB.view = (LIB.pending && LIB.pending.back) || "list"; LIB.pending = null; libSaveThen(a); return; }
    if(id === "lib-save" || id === "lib-saveas"){ var ti = document.getElementById("lib-title"), se = document.getElementById("lib-set"); if(se){ S.libSet = se.value.trim(); save(); } libSave(id === "lib-saveas", ti ? ti.value : ""); return; }
    if(id === "lib-conf-new"){ LIB.view = "list"; LIB.pending = null; libSave(true, (S.lib ? S.lib.title : libTitleDefault()) + " (bản của " + (LIB.user.displayName || libEmail()) + ")"); return; }
    if(id === "lib-conf-open"){ var oid = S.lib && S.lib.id; LIB.view = "list"; LIB.pending = null; if(oid){ S.lib.hash = libStateHash(); libOpen(oid, false); } return; }
    if(id === "lib-refresh"){ libRefresh(); return; }
    if(id === "lib-export"){ libExportAll(); return; }
    if(id === "lib-staff"){ if(typeof hubOpen === "function"){ libToggle(false); hubOpen("tv"); } else libStaffLoad(); return; }
    if(id === "lib-addstaff"){ libStaffAdd(document.getElementById("lib-newstaff").value, document.getElementById("lib-newrole").value); return; }
    if(t.hasAttribute("data-libopen")){ libOpen(t.getAttribute("data-libopen"), false); return; }
    if(t.hasAttribute("data-libcopy")){ libOpen(t.getAttribute("data-libcopy"), true); return; }
    if(t.hasAttribute("data-libhist")){ libHistory(t.getAttribute("data-libhist")); return; }
    if(t.hasAttribute("data-libdel")){ libDelete(t.getAttribute("data-libdel")); return; }
    if(t.hasAttribute("data-libver")){ libOpenVersion(LIB.hist.id, t.getAttribute("data-libver")); return; }
    if(t.hasAttribute("data-libcmp")){ libCompareVersion(LIB.hist.id, t.getAttribute("data-libcmp")); return; }
    if(t.hasAttribute("data-libunstaff")){ libStaffRemove(t.getAttribute("data-libunstaff")); return; }
  });
  el.addEventListener("change", function(e){
    var t = e.target;
    if(t.hasAttribute && t.hasAttribute("data-libst")){ libSetStatus(t.getAttribute("data-libst"), t.value); return; }
    if(t.id === "lib-fspec"){ LIB.filter.spec = t.value; libRender(); }
    if(t.id === "lib-fst"){ LIB.filter.status = t.value; libRender(); }
    if(t.id === "lib-mine"){ LIB.filter.mine = t.checked; libRender(); }
  });
  el.addEventListener("input", function(e){
    if(e.target.id === "lib-set"){ S.libSet = e.target.value; save(); return; }
    if(e.target.id === "lib-q"){ LIB.filter.q = e.target.value; var pos = e.target.selectionStart; libRender(); var n = document.getElementById("lib-q"); if(n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(x){} } }
  });
  // bài đang mở từ trước bản này: hash kiểu cũ (chuỗi thô) đúng thì đổi sang hash theo nội dung, coi như đã lưu
  try{ if(S.lib && S.lib.hash && libHash(JSON.stringify(libStateCopy())) === S.lib.hash){ S.lib.hash = libStateHash(); libSetBase(); save(); } else if(S.fileHash && libHash(JSON.stringify(libStateCopy())) === S.fileHash){ S.fileHash = libStateHash(); libSetBase(); save(); } }catch(e){}
  setInterval(libChip, 4000); libChip();
  // các ô do trang vẽ lại (bản đồ, câu hỏi, checklist) cũng phải theo chế độ xem
  setInterval(function(){ try{ if(typeof wfModeApply === "function") wfModeApply(); }catch(e){} }, 1200);
  // trang được mở lại sau khi đăng nhập kiểu chuyển trang: nạp sẵn để nhận kết quả
  if(S.lib || /firebase|__\/auth/.test(document.referrer || "")) libLoad().catch(function(){});
  // trang luôn mở vào trang Nhóm: phải đăng nhập mới dùng được (không còn chế độ dùng một mình)
  if(typeof hubGateStart === "function") hubGateStart();
}
function libMyTask(x){
  var w = x.wf, me = libEmail(), need = libNeed(x); if(!w || !me || !need) return false;
  if(typeof PRJ !== "undefined" && PRJ.list && !(x.prj && prjById(x.prj))) return false;
  var as = w.as || {};
  if(need === "coord") return as.coord ? as.coord === me : libIsAdmin();
  return as[need] === me;
}
// vai đang phải làm việc tiếp theo của một bài (theo trạng thái quy trình)
function libNeed(x){
  var w = x.wf; if(!w) return "";
  if(!w.st) return (w.as && w.as.nl) || x.prj ? "nl" : "";
  var need = {"Chủ đề đề xuất":"nl","Đang adapt":"nl","Chờ thẩm định ngữ liệu":"tdnl","Ngữ liệu cần sửa":"nl","Ngữ liệu đã duyệt (khoá)":"ch","Đang soạn câu hỏi":"ch","Chờ thẩm định câu hỏi":"tdch","Câu hỏi cần sửa":"ch","Câu hỏi đã duyệt":"coord"}[w.st];
  var sk = (x.meta && x.meta.skill) || (SPEC[S.spec] || {}).skill; if((sk === "W" || sk === "S") && w.st === "Ngữ liệu đã duyệt (khoá)") need = "coord";
  if(w.req === "chờ sửa" || w.req === "đang sửa") need = "nl"; else if(w.req === "chờ duyệt") need = "tdnl";
  return need || "";
}
function libSaveThen(after){
  var before = S.lib && S.lib.rev, iv = 0;
  var ti = document.getElementById("lib-title");
  libSave(false, ti ? ti.value : "");
  var wait = setInterval(function(){
    iv++;
    if(!LIB.loading){ clearInterval(wait); if(LIB.view === "list" && !LIB.err && S.lib && S.lib.rev !== before && after) after(); }
    else if(iv > 60) clearInterval(wait);
  }, 250);
}

;

/* =====================================================================
   CHECKLIST CÓ MÃ + GHI CHÚ THẨM ĐỊNH + SỬA THEO GHI CHÚ (THAY/BẰNG)
   ---------------------------------------------------------------------
   THÊM TIÊU CHÍ MỚI (ví dụ hướng dẫn từ nghiên cứu):
   - Thêm một dòng vào CL_ROWS.NL hoặc CL_ROWS.CH, cuối nhóm phù hợp,
     dùng số tiếp theo. KHÔNG đánh số lại mã cũ; tiêu chí bỏ đi thì
     giữ mã và đặt off:true.
   - Trường: c (mã), g (nhóm), t (tiêu chí), src (căn cứ: QĐ 730 /
     Bảng nhóm / Quy ước nhóm / tên nghiên cứu), who ("M" máy, "H" người,
     "MH" máy + người, "Q" soát tay từng câu), sk ("R"/"L" nếu chỉ áp dụng
     một kỹ năng), dep (người đánh dấu bị bỏ khi: "text" bài đổi ở đoạn
     liên quan, "items" câu hỏi đổi, "topic", "src"), ev (hàm máy chấm,
     trả về {s:"ok"|"fail"|"warn"|"na", d:"chi tiết", keep:"điều phải giữ"}).
   - Tiêu chí do người kiểm chỉ cần c, g, t, src, who:"H", dep.
   ===================================================================== */
var CL_GROUPS = {
  NL:{A:"Chủ đề và nguồn", B:"Chỉ số (máy đo)", C:"Nội dung", D:"Bản đồ chất liệu"},
  CH:{A:"Phân bố", B:"Căn cứ", C:"Phương án", D:"Trình bày", E:"Soát tay"}
};
var CL_SCOPE_NAME = {NL:"ngữ liệu", CH:"câu hỏi"};
var clECache = null;
function clE(){
  var sl = S.slots||{}, key = qHash([sl.draft, sl.keep, sl.pfCov, sl.pfLvl95, sl.pfCovBelow, S.pfSig, S.spec, S.level, S.floor, S.spelling, S.paras].join("\u0001"));
  if(clECache && clECache.key===key) return clECache.v;
  var v; try{ v = evalChecks(); }catch(e){ v = null; } clECache = {key:key, v:v}; return v;
}
function clPh(){ try{ return phieuStats(); }catch(e){ return null; } }
function clNum(x, d){ return (Math.round(x * Math.pow(10, d||0)) / Math.pow(10, d||0)).toFixed(d||0); }
function clNoDraft(){ return {s:"na", d:"Chưa có bài."}; }
var CL_ROWS = {NL:[
  {c:"NL-A1", g:"A", t:"Chủ đề đúng theme của Part trong bảng phân bố", src:"Bảng phân bố (VSTEP Specifications); chủ đề Nghe theo QĐ 730", tier:"spec", who:"H", dep:"topic"},
  {c:"NL-A2", g:"A", t:"Không chạm chủ đề nhạy cảm (chính trị, tôn giáo, sắc tộc, chiến tranh, bệnh tật, tai nạn)", src:"Tập huấn · Ứng dụng AI (Phụ lục D); Viết Listening items (trung lập)", tier:"dx", who:"H", dep:"topic"},
  {c:"NL-A3", g:"A", t:"Không phải kiến thức phổ thông trả lời được khi chưa đọc/nghe; công bằng với mọi thí sinh (không thiên về giới, vùng miền, sở thích, trải nghiệm riêng)", src:"Tập huấn · Ứng dụng AI (Phụ lục D); Tổng quan thẩm định (công bằng)", tier:"dx", who:"H", dep:"topic"},
  {c:"NL-A4", g:"A", t:"Có nguồn, URL và giấy phép sử dụng", src:"Tập huấn · Ứng dụng AI (Phụ lục D)", tier:"dx", who:"MH", dep:"src", ev:function(){
    var u = typeof libUrl==="function" ? libUrl() : "", f = S.fields||{}, miss = [];
    if(!u) miss.push("URL"); if(!String(f["pc-lic"]||"").trim()) miss.push("giấy phép"); if(!String(f["pc-src"]||"").trim()) miss.push("tên nguồn");
    return miss.length ? {s:"warn", d:"Chưa ghi " + miss.join(", ") + " (khung Thông tin nguồn ở bước Nguồn; URL cũng lấy được từ văn bản nguồn)."} : {s:"ok", d:"Đã ghi nguồn, URL, giấy phép."};
  }},
  {c:"NL-A5", g:"A", t:"Không trùng nguồn hoặc chủ đề với bài đã có trong thư viện", src:"Tập huấn · Thiết kế câu hỏi Reading (chủ đề trùng giữa thành viên)", tier:"dx", who:"M", ev:function(){
    if(typeof LIB==="undefined" || !LIB.user) return {s:"na", d:"Đăng nhập thư viện để so trùng."};
    if(!LIB.items.length) return {s:"na", d:"Mở danh sách thư viện một lần để trang tải các bài đã có."};
    var D = libDupes(); return D.length ? {s:"warn", d:"Giống " + D.length + " bài: " + D.slice(0,3).map(function(x){ return "\"" + ((x.x.meta||{}).topic || x.x.title || "?") + "\" (" + x.why + ")"; }).join("; ") + "."} : {s:"ok", d:"Không trùng " + LIB.items.length + " bài trong thư viện."};
  }},
  {c:"NL-A6", g:"A", t:"Nguồn chính thống, đủ dài và đủ dữ kiện (8–12 thông tin kiểm tra được); không phải bài chỉ là lời khuyên chung (self-help), chỉ liệt kê ưu nhược điểm, hay phải có kiến thức chuyên ngành mới hiểu", src:"Tập huấn · Thiết kế câu hỏi Reading (checklist chọn văn bản)", tier:"dx", who:"H", dep:"src"},
  {c:"NL-B1", g:"B", t:"Số từ trong khoảng của Part (tính cả tiêu đề)", src:"Yêu cầu số từ của VNCETA (đơn vị chấm sản phẩm tập huấn); chưa tải đặc tả riêng thì theo dải QĐ 730", tier:"spec", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var L = E.C.len;
    return {s:L.ok ? "ok" : "fail", d:L.now + " từ (cần " + L.lo + "–" + L.hi + ")" + (L.now < L.lo ? ": thêm " + (L.lo - L.now) + "–" + (L.hi - L.now) + " từ." : (L.now > L.hi ? ": bớt " + (L.now - L.hi) + "–" + (L.now - L.lo) + " từ." : ".")), keep:"Số từ đang " + L.now + ", giữ trong " + L.lo + "–" + L.hi + "."};
  }},
  {c:"NL-B2", g:"B", t:"Đúng số đoạn, có một tiêu đề", src:"Bảng nhóm; Part 1 gồm 4 đoạn (QĐ 730); tối đa 9 đoạn (tập huấn)", tier:"spec", who:"M", sk:"R", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var P = E.C.paras, T = E.C.title, ok = P.ok && T.ok;
    return {s:ok ? "ok" : "fail", d:P.now + " đoạn (cần " + P.target + "); " + T.now + " tiêu đề (cần 1).", keep:"Giữ đúng " + P.target + " đoạn và một tiêu đề."};
  }},
  {c:"NL-B3", g:"B", t:"Độ phủ từ vựng ở mức mục tiêu đạt ngưỡng (Đọc 95%, Nghe 98%)", src:"Tập huấn · Ứng dụng AI", tier:"dx", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var H = E.C.hard, cv = E.sp.cov;
    return {s:H.ok ? "ok" : "fail", d:"Độ phủ ở " + S.level + ": " + clNum(H.now,1) + "% (cần ≥ " + cv + "%, " + H.src + ")." + (H.ok ? "" : covGapText(H.now, cv, S.level).need.replace(/^ \(tức là /, " Tức là ").replace(/\)$/, ".") + aboveTopText(E.vp, E.ti, 6)), keep:"Độ phủ ở mức " + S.level + " đang " + clNum(H.now,1) + "%, phải giữ từ " + cv + "% trở lên: không thêm từ trên mức " + S.level + "."};
  }},
  {c:"NL-B4", g:"B", t:"Mức từ vựng ở ngưỡng 96%, tính cả từ ngoài danh sách, không thấp hơn sàn đã đặt (mặc định đúng mức mục tiêu)", src:"Quy ước nhóm: thử nghiệm 42 bài đối chiếu Cathoven (Nick chốt 13/11/2026)", tier:"dx", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var Y = E.C.easy;
    if(!Y.floor) return {s:"ok", d:"Không đặt sàn (mức tối thiểu)."};
    return {s:Y.ok ? "ok" : "fail", d:"Mức ở ngưỡng " + EASY_TH + "%: " + lvlName(Y.now) + " (sàn " + LVL[Y.floor] + ", " + Y.src + ")." + (Y.ok ? "" : easyGapText(E.vp, Y.floor, E.ti)), keep:"Mức ở ngưỡng " + EASY_TH + "% đang " + lvlName(Y.now) + ", không để thấp hơn " + LVL[Y.floor] + ": không thay từ đúng mức bằng từ dễ hẳn."};
  }},
  {c:"NL-B5", g:"B", t:"Flesch Reading Ease trong khoảng của bậc", src:"Khoảng của bậc theo bảng quy đổi Flesch–CEFR của Linguapress", tier:"spec", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var F = E.C.fre; if(!F) return {s:"na", d:"Chưa tính được Flesch."};
    var rng = F.min + (F.max < 200 ? "–<" + F.max : " trở lên");
    return {s:F.ok ? "ok" : "fail", d:"Flesch " + clNum(F.now,1) + " (cần " + rng + ")" + (F.near ? ", sát biên" : "") + "." + (F.ok ? "" : (function(){ try{ var fv = V().freLever; return fv ? " Cách đạt: " + fv + "." : ""; }catch(e){ return ""; } })()), keep:"Flesch Reading Ease đang " + clNum(F.now,1) + ", phải giữ trong " + rng + ": tách câu làm Flesch tăng, gộp câu và dùng từ nhiều âm tiết làm Flesch giảm."};
  }},
  {c:"NL-B6", g:"B", t:"Hạn chế câu trên 25 từ", src:"Tập huấn · Ứng dụng AI (Phụ lục D); mốc 25 từ theo EC Text Profiler", tier:"dx", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var n = E.C.long.list.length;
    return {s:n ? "warn" : "ok", d:n ? n + " câu trên 25 từ." : "Không có câu trên 25 từ.", keep:n ? "" : "Không tạo câu trên 25 từ."};
  }},
  {c:"NL-B7", g:"B", t:"Trùng nguyên văn với nguồn dưới 20%", src:"Tập huấn · Ứng dụng AI (Phụ lục D)", tier:"dx", who:"M", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft();
    if(lastOverlap===null) return {s:"na", d:"Cần văn bản nguồn tiếng Anh để đo."};
    return {s:lastOverlap < 20 ? "ok" : "fail", d:"Trùng " + clNum(lastOverlap,1) + "% (cần < 20%).", keep:"Trùng nguyên văn với nguồn đang " + clNum(lastOverlap,1) + "%, giữ dưới 20%: không chép lại câu chữ của nguồn."};
  }},
  {c:"NL-B8", g:"B", t:"Một kiểu chính tả thống nhất, kể cả ngày tháng", src:"Tập huấn · Ứng dụng AI (Phụ lục D)", tier:"dx", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var L = E.C.spell.list;
    return {s:L.length ? "fail" : "ok", d:L.length ? "Lệch chính tả " + S.spelling + ": " + L.slice(0,6).join(", ") + "." : "Đúng chính tả " + S.spelling + ".", keep:"Chính tả " + S.spelling + "."};
  }},
  {c:"NL-B9", g:"B", t:"Không còn từ cần chú giải để đạt độ phủ", src:"Tập huấn · Ứng dụng AI", tier:"dx", who:"M", ev:function(){
    var P = clPh(); if(!P) return clNoDraft();
    return {s:P.gloss ? "warn" : "ok", d:P.gloss ? "Ước lượng còn " + P.gloss + " từ cần chú giải." : "0 từ cần chú giải."};
  }},
  {c:"NL-B10", g:"B", t:"Từ nối trên 5 trên 100 từ", src:"Tập huấn · Ứng dụng AI", tier:"dx", who:"M", ev:function(){
    var P = clPh(); if(!P) return clNoDraft(); var v = parseFloat(P.conn);
    return {s:v > 5 ? "ok" : "warn", d:"Từ nối " + P.conn + "/100 từ (nên trên 5)" + (v > 5 ? "." : (function(){ var E2 = clE(), W = E2 ? E2.C.len.now : 0; return W ? ": thêm khoảng " + Math.max(1, Math.ceil((5.01 - v) * W / 100)) + " từ nối (however, therefore, so, because, for example…)." : "."; })()), keep:v > 5 ? "Từ nối đang " + P.conn + "/100 từ, giữ trên 5: không bỏ các từ nối khi sửa." : ""};
  }},
  {c:"NL-B11", g:"B", t:"Nghe: khẩu ngữ hoá theo hướng dẫn của giảng viên (gợi ý, không bắt buộc), không vượt mức tối đa", src:"Tập huấn · Viết Listening items; mức gợi ý: Nick chốt 12/11/2026", tier:"dx", who:"M", sk:"L", ev:function(){
    var K; try{ K = spkEval(); }catch(e){ K = null; } if(!K) return clNoDraft();
    if(!K.so) return {s:"na", d:"Cần văn bản nguồn để so khẩu ngữ hoá."};
    var over = K.rows.filter(function(r){ return r.over; }), out = [];
    if(K.fails.length) out.push("chưa theo gợi ý: " + K.fails.map(function(r){ return r.t.label; }).join(", "));
    if(over.length) out.push("vượt trần: " + over.map(function(r){ return r.t.label; }).join(", "));
    if(!K.posOk) out.push("dưới 80% chỗ ngập ngừng đúng ranh giới");
    return {s:out.length ? "warn" : "ok", d:out.length ? out.join("; ") + "." : "Đủ 9 chỉ số, không vượt trần.", keep:K.fails.length ? "" : "Các chỉ số khẩu ngữ hoá đang đạt: không bỏ câu hỏi, lượt đáp ngắn, từ đệm, ngập ngừng đã có; không thêm quá mức trần."};
  }},
  {c:"NL-B12", g:"B", t:"Đã ghi level bài gốc và bài đã chỉnh cho file nộp, có ảnh minh chứng", src:"Mẫu nộp của VNCETA: ô Level (Nghe) hoặc Readability (Đọc) có minh chứng", tier:"spec", who:"M", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft();
    var a = (typeof sbSummary === "function") ? sbSummary("a") : "", o = (typeof sbSummary === "function") ? sbSummary("o") : "", pf = S.slots.pfLvl95 && S.slots.pfLvl95 !== "chưa đo";
    if(!a && !pf) return {s:"warn", d:"Chưa ghi level bài đã chỉnh. Ghi mức của EC Text Profiler (bước 6, mục 2) hoặc level Cathoven (bảng level, nếu bài dưới 500 từ), và lưu ảnh chụp màn hình."};
    return {s:"ok", d:"Bài đã chỉnh: " + [a, pf ? "Text Profiler " + S.slots.pfLvl95 : ""].filter(Boolean).join("; ") + (o ? ". Bài gốc: " + o : ". Bài gốc: nhớ ghi level và chụp ảnh") + "."};
  }},
  {c:"NL-C1", full:true, g:"C", t:"Dữ kiện, con số, tên riêng đúng với nguồn", src:"Tập huấn · Ứng dụng AI (Phụ lục D, đối chiếu dữ kiện); Tổng quan thẩm định", tier:"dx", who:"H", dep:"text"},
  {c:"NL-C2", full:true, g:"C", t:"Quan điểm, nhận định trong bài có trong nguồn, không ngược nguồn; người soạn không thêm nhận định của mình", src:"Tập huấn · Ứng dụng AI (lời người biên tập); áp cho bài Nghe: Nick chốt 12/11/2026", tier:"dx", who:"H", dep:"text"},
  {c:"NL-C3", full:true, g:"C", t:"Mỗi đoạn một ý chính rõ ràng", src:"Tập huấn · Ứng dụng AI (câu lệnh biên tập); Thiết kế câu hỏi Reading", tier:"dx", who:"H", sk:"R", dep:"text"},
  {c:"NL-C4", full:true, g:"C", t:"Nghe: đọc lên nghe tự nhiên như lời nói", src:"Tập huấn · Ứng dụng AI (Phụ lục D); Lỗi sai thường gặp", tier:"dx", who:"H", sk:"L", dep:"text"},
  {c:"NL-C5", full:true, g:"C", t:"Thông tin để hỏi chỉ có trong bài, không đoán được nếu không đọc/nghe", src:"Tập huấn · Viết Listening items (passage dependence); Ứng dụng AI", tier:"dx", who:"H", dep:"text"},
  {c:"NL-C6", full:true, g:"C", t:"Nghe: không nghe thừa; mọi thông tin trong bài được dùng làm đáp án hoặc chất liệu nhiễu", src:"Hướng dẫn của Bộ (góp ý đề)", tier:"spec", who:"H", sk:"L", dep:"text"},
  {c:"NL-D1", g:"D", t:"Bản đồ chất liệu phủ đủ mọi dòng của bảng phân bố (chỗ hỏi đúng điều kiện máy kiểm được theo mã)", src:"Quy trình trang soạn đề", tier:"qt", who:"M", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft();
    var m = mapStatus(), n = m.E.res.length, ok = m.E.res.filter(function(x){ return x.s !== "fail"; }).length;
    return {s:m.full ? "ok" : "fail", d:ok + "/" + n + " dòng có chỗ hỏi hợp lệ" + (m.full ? "." : "; " + m.why + ". Xem bản đồ ở trên."), keep:m.full ? "Giữ nguyên văn mọi chỗ hỏi trong bản đồ chất liệu (sửa thì câu hỏi mất chỗ hỏi)." : ""};
  }},
  {c:"NL-D2", full:true, g:"D", t:"Chỗ hỏi đúng điều kiện của mã (hàm ngôn thật, từ đoán được nghĩa, đại từ có tiền ngữ xa…)", src:"QĐ 730", tier:"qd", who:"H", dep:"text"},
  {c:"NL-D3", g:"D", t:"Đọc: đoạn nào cũng có ít nhất một chỗ hỏi; không dồn một đoạn", src:"Tập huấn · Ứng dụng AI (8 tiêu chí)", tier:"dx", who:"M", sk:"R", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft(); var E = mapEval(); if(!E.res.some(function(x){ return x.v.q; })) return {s:"warn", d:"Chưa có bản đồ chất liệu."};
    var g = E.glob.filter(function(x){ return x.c === "NL-D3"; }); return {s:g.length ? "warn" : "ok", d:g.length ? g.map(function(x){ return x.t; }).join(" ") : "Đoạn nào cũng có chỗ hỏi."};
  }},
  {c:"NL-D4", g:"D", t:"Nghe: điểm hỏi đầu không nằm trong khoảng 10–15 giây đầu (25–40 từ); hai điểm hỏi liền nhau không cùng một câu (Part 2: không cùng một lượt lời); có điểm hỏi gần cuối bài", src:"Tập huấn · Viết Listening items; 25 từ quy đổi từ 10 giây ở 150 từ/phút", tier:"dx", who:"M", sk:"L", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft(); if(SPEC[S.spec].grp === 1) return {s:"na", d:"Part 1: mỗi bài một câu."}; var E = mapEval(); if(!E.res.some(function(x){ return x.v.q; })) return {s:"warn", d:"Chưa có bản đồ chất liệu."};
    var g = E.glob.filter(function(x){ return x.c === "NL-D4"; }); return {s:g.length ? "warn" : "ok", d:g.length ? g.map(function(x){ return x.t; }).join(" ") : "Vị trí các điểm hỏi hợp lý."};
  }},
  {c:"NL-D5", full:true, g:"D", t:"Có sẵn trong bài chất liệu cho phương án nhiễu", src:"QĐ 730", tier:"qd", who:"MH", dep:"text", ev:function(){
    if(!(S.slots.draft||"").trim()) return clNoDraft(); var E = mapEval(), bad = E.res.filter(function(x){ return x.msgs.some(function(m){ return /nhiễu|cụm danh từ/.test(m); }); });
    return {s:bad.length ? "warn" : "ok", d:bad.length ? "Dòng " + bad.map(function(x){ return x.idx + 1; }).join(", ") + " thiếu hoặc sai trích dẫn nhiễu." : "Dòng nào cũng có trích dẫn nhiễu trong bài (máy kiểm). Người thẩm định xét chúng có dùng được không."};
  }},
  {c:"NL-D6", g:"D", t:"Từ giữ lại để hỏi vẫn còn trong bài", src:"Quy trình trang soạn đề", tier:"qt", who:"M", ev:function(){
    var E = clE(); if(!E) return clNoDraft(); var L = E.C.keep.list, k = keepList();
    if(!k.length) return {s:"na", d:"Chưa chọn từ giữ lại."};
    return {s:L.length ? "fail" : "ok", d:L.length ? "Đã mất: " + L.join(", ") + "." : "Còn đủ " + k.length + " từ.", keep:"Không bỏ hoặc thay các từ giữ lại: " + k.join(", ") + "."};
  }}
], CH:[
  {c:"CH-A1", g:"A", t:"Đủ số câu của Part", src:"Bảng phân bố (VSTEP Specifications)", tier:"spec", who:"M"},
  {c:"CH-A2", g:"A", t:"Bậc, mức, mã từng câu đúng bảng phân bố", src:"Bảng phân bố (VSTEP Specifications); bậc theo QĐ 730", tier:"spec", who:"M"},
  {c:"CH-A3", g:"A", t:"Đáp án rải đều A–D", src:"Nghiên cứu Holzknecht và cộng sự (2021): đáp án ở vị trí cuối làm câu khó hơn", tier:"dx", who:"M"},
  {c:"CH-B1", g:"B", t:"CĂN CỨ chép nguyên văn từ bài", src:"Quy trình trang soạn đề", tier:"qt", who:"M"},
  {c:"CH-B2", g:"B", t:"Căn cứ đúng đoạn ghi ở dòng đầu", src:"Quy trình trang soạn đề", tier:"qt", who:"M", sk:"R"},
  {c:"CH-B3", g:"B", t:"Câu hỏi theo thứ tự căn cứ trong bài; câu hỏi cả bài (MI, TO) đặt cuối", src:"Nick chốt 11/11/2026", tier:"dx", who:"M"},
  {c:"CH-B4", g:"B", t:"Nghe: vị trí và khoảng cách các căn cứ hợp lý", src:"Tập huấn · Viết Listening items", tier:"dx", who:"M", sk:"L"},
  {c:"CH-B5", g:"B", t:"Đọc: đoạn nào cũng có câu hỏi", src:"Tập huấn · Ứng dụng AI (8 tiêu chí)", tier:"dx", who:"M", sk:"R"},
  {c:"CH-B6", g:"B", t:"Mỗi nội dung chỉ dùng cho một câu hỏi: căn cứ hai câu không trùng, không chồng lên nhau (trừ câu hỏi cả bài)", src:"Nick chốt 11/11/2026", tier:"dx", who:"M"},
  {c:"CH-B7", g:"B", t:"Câu hỏi dùng chỗ hỏi đã duyệt trong bản đồ chất liệu (cùng mã)", src:"Quy trình trang soạn đề", tier:"qt", who:"M"},
  {c:"CH-C1", g:"C", t:"Ba phương án sai theo khuôn nhiễu (dòng LOẠI), có trong bài khi QĐ yêu cầu", src:"QĐ 730", tier:"qd", who:"M"},
  {c:"CH-C2", g:"C", t:"Độ dài phương án: Nghe ≤7 từ (bậc 3), ≤9 từ (bậc 4–5); RE ≤3 từ và có trong bài", src:"QĐ 730", tier:"qd", who:"M"},
  {c:"CH-C3", g:"C", t:"Không dùng từ tuyệt đối làm lộ đáp án", src:"Tập huấn · Thiết kế câu hỏi Reading", tier:"dx", who:"M"},
  {c:"CH-C4", g:"C", t:"Bốn phương án cùng một dạng", src:"Tập huấn · Viết Listening items", tier:"dx", who:"M"},
  {c:"CH-C5", g:"C", t:"Bốn phương án dài tương đương; đáp án không dài hẳn", src:"Tập huấn · Thiết kế câu hỏi Reading; Viết Listening items", tier:"dx", who:"M"},
  {c:"CH-C6", g:"C", t:"Không dùng All / None of the above", src:"Tập huấn · Thiết kế câu hỏi Reading; Viết Listening items", tier:"dx", who:"M"},
  {c:"CH-C7", g:"C", t:"Câu từ vựng: đáp án không khó hơn từ được hỏi", src:"Tập huấn · Thiết kế câu hỏi Reading", tier:"dx", who:"M"},
  {c:"CH-C8", g:"C", t:"Nghe bậc 3 giữ khoảng 50% từ của căn cứ; ý chính bậc 4–5 diễn đạt lại hoàn toàn", src:"QĐ 730", tier:"qd", who:"M", sk:"L"},
  {c:"CH-C9", g:"C", t:"Câu bậc 3: từ vựng không vượt bậc", src:"QĐ 730", tier:"qd", who:"M"},
  {c:"CH-C10", g:"C", t:"Nghe: từ trong câu hỏi, phương án không khó hơn kịch bản", src:"Tập huấn · Viết Listening items", tier:"dx", who:"M", sk:"L"},
  {c:"CH-D1", g:"D", t:"Hỏi theo đoạn (paragraph), không theo dòng", src:"Tập huấn · Thiết kế câu hỏi Reading", tier:"dx", who:"M", sk:"R"},
  {c:"CH-D2", g:"D", t:"Viết hoa, dấu chấm phương án đúng quy ước", src:"Tập huấn · Thiết kế câu hỏi Reading", tier:"dx", who:"M"},
  {c:"CH-D3", g:"D", t:"Nghe: câu hỏi ở dạng khẳng định (không NOT, EXCEPT)", src:"Tập huấn · Viết Listening items", tier:"dx", who:"M", sk:"L"},
  {c:"CH-D4", g:"D", t:"Mỗi câu có dòng GIẢI THÍCH", src:"Tập huấn · Thiết kế câu hỏi Reading", tier:"dx", who:"M"},
  {c:"CH-D5", g:"D", t:"Câu hỏi dùng mẫu trong Guidelines", src:"VSTEP Reading Test Guidelines", tier:"spec", who:"H", sk:"R", dep:"items"},
  {c:"CH-D6", g:"D", t:"Đúng khuôn trình bày: đủ dòng đầu, HỎI, A–D, ĐÁP ÁN; RE/VO có từ được hỏi trong ngoặc kép", src:"Quy trình trang soạn đề", tier:"qt", who:"M"},
  {c:"CH-E1", g:"E", t:"Câu bậc 4 cao, bậc 5 có hàm ngôn thật", src:"QĐ 730", tier:"qd", who:"Q", qk:"imp"},
  {c:"CH-E2", g:"E", t:"Phương án nhiễu đúng khuôn và đều có tác dụng", src:"QĐ 730", tier:"qd", who:"Q", qk:"dis"},
  {c:"CH-E3", g:"E", t:"Mỗi câu đúng một đáp án", src:"QĐ 730 (một đáp án đúng, ba phương án sai)", tier:"qd", who:"Q", qk:"one"},
  {c:"CH-E4", g:"E", t:"Không trả lời được khi chưa đọc/nghe bài", src:"Tập huấn · Viết Listening items (passage dependence, thử không nghe)", tier:"dx", who:"Q", qk:"dep"},
  {c:"CH-E5", full:true, g:"E", t:"Câu này không để lộ đáp án câu khác", src:"Tập huấn · Tổng quan thẩm định (tính độc lập)", tier:"dx", who:"MH", dep:"items"},
  {c:"CH-E7", full:true, g:"E", t:"Câu hỏi nêu rõ một vấn đề, không có chi tiết thừa (chi tiết vừa không cần để trả lời, vừa không giúp tìm chỗ trong bài)", src:"Tập huấn · Thiết kế câu hỏi Reading; Viết Listening items", tier:"dx", who:"H", dep:"items"},
  {c:"CH-E6", g:"E", t:"Người thẩm định làm cả bộ khi ẩn đáp án; câu chọn khác đáp án được xem kỹ", src:"Quy trình (cổng 3)", tier:"qt", who:"M", ev:function(){
    var R = wfReviewState(); if(!R.n) return {s:"na", d:"Chưa có câu hỏi."};
    if(R.taken < R.n) return {s:"todo", d:"Người thẩm định đã làm " + R.taken + "/" + R.n + " câu (khung Thẩm định câu hỏi)."};
    return R.wrong.length ? {s:"warn", d:"Chọn khác đáp án ở câu " + R.wrong.join(", ") + ": xem kỹ trước khi quyết định."} : {s:"ok", d:"Làm đúng cả " + R.n + " câu."};
  }}
]};
// thông báo của checkQ → mã CH (thứ tự quan trọng)
var CL_QMAP = [
  [/từ trên mức của bài/i,"CH-C10"],
  [/bản đồ chất liệu/i,"CH-B7"],
  [/mỗi nội dung chỉ dùng/i,"CH-B6"],
  [/of the above|All\/None/i,"CH-C6"], [/\(line\)/i,"CH-D1"], [/NOT, EXCEPT/,"CH-D3"],
  [/GIẢI THÍCH/,"CH-D4"], [/viết hoa|dấu chấm/i,"CH-D2"], [/dài hơn hẳn|chênh nhau nhiều/i,"CH-C5"],
  [/câu từ vựng có từ ở mức/i,"CH-C7"], [/câu bậc 3 có từ trên mức/i,"CH-C9"], [/từ tuyệt đối|từ rào đón/i,"CH-C3"],
  [/cùng một dạng|khác dạng/i,"CH-C4"], [/số từ của căn cứ|từ nội dung của căn cứ/i,"CH-C8"], [/để lộ đáp án/i,"CH-E5"],
  [/thử mù/i,"CH-E4"], [/thứ tự thông tin/i,"CH-B3"], [/giây|rải đều|quá sát/i,"CH-B4"],
  [/dòng LOẠI|khuôn|QĐ 730/i,"CH-C1"], [/tối đa \d/i,"CH-C2"], [/^phương án [A-D] \(".*"\) (không có trong bài|khác chữ)/i,"CH-C2"],
  [/căn cứ nằm ở đoạn|đáp án ghi đoạn/i,"CH-B2"], [/CĂN CỨ|CÂU CHÈN|vị trí đáp án/i,"CH-B1"],
  [/bậc hoặc mức|không có trong các mã/i,"CH-A2"]
];
var CL_QGMAP = [[/^Có \d+ câu, cần/,"CH-A1"], [/Phân bố bậc/,"CH-A2"], [/Đáp án dồn/,"CH-A3"], [/chưa có câu hỏi/,"CH-B5"], [/thử mù/i,"CH-E4"]];
function clQCode(msg, map){ for(var i = 0; i < map.length; i++) if(map[i][0].test(msg)) return map[i][1]; return "CH-D6"; }
function clRows(sc){ var sk = SPEC[S.spec].skill; return (CL_ROWS[sc] || []).filter(function(r){ return !r.off && (!r.sp || r.sp.indexOf(S.spec) >= 0) && (!r.sk || r.sk===sk); }); }
function clAllCodes(){ return CL_ROWS.NL.concat(CL_ROWS.CH, CL_ROWS.WS || []).map(function(r){ return r.c; }); }

/* ---- đơn vị để biết người đánh dấu có còn hiệu lực ---- */
function clUnits(){
  var d = S.slots.draft || ""; if(!d.trim()) return [];
  if(qIsR()){ var a = analyze(d); return a.titles.map(function(t){ return {k:"tiêu đề", t:t.text}; }).concat(a.body.map(function(b, i){ return {k:"đoạn " + (i+1), t:b.text}; })); }
  return d.split(/\n/).map(function(s){ return s.trim(); }).filter(Boolean).map(function(t, i){ return {k:"dòng " + (i+1), t:t}; });
}
function clSig(r){
  if(r.dep==="topic") return {h:qHash(S.spec + "|" + (S.slots.topic||""))};
  if(r.dep==="src") return {h:qHash((typeof libUrl==="function" ? libUrl() : "") + "|" + ((S.fields||{})["pc-lic"]||"") + "|" + ((S.fields||{})["pc-src"]||""))};
  if(r.dep==="items"){ var P = parseQ(S.slots.questions||""), m = {}; P.items.forEach(function(it){ m[it.n] = qSig(it); }); return {items:m}; }
  return {u:clUnits().map(function(x){ return qHash(normQ(x.t)); })};
}
function clStale(r, tk){
  var now = clSig(r), old = tk.sig || {};
  if(now.h !== undefined) return now.h !== old.h ? ["chủ đề hoặc nguồn"] : [];
  if(now.items){ var ch = []; Object.keys(now.items).forEach(function(n){ if(!old.items || old.items[n] !== now.items[n]) ch.push("câu " + n); }); return ch; }
  var had = {}; (old.u||[]).forEach(function(h){ had[h] = 1; });
  var U = clUnits(), out = []; (now.u||[]).forEach(function(h, i){ if(!had[h]) out.push(U[i].k); });
  return out;
}
function clTicks(){ S.cl = S.cl || {}; S.cl.ticks = S.cl.ticks || {}; return S.cl.ticks; }

/* ---- đọc toàn bài trước khi xét ---- */
function clReadUnits(sc){ return sc === "CH" ? wfQItems().map(function(it){ return {k:"câu " + it.n, t:qSig(it)}; }) : clUnits(); }
function clReadState(sc){
  var r = S.cl && S.cl.read && S.cl.read[sc], U = clReadUnits(sc);
  if(!U.length) return {ok:false, none:true, changed:[]};
  if(!r) return {ok:false, changed:[]};
  var had = {}; (r.u || []).forEach(function(h){ had[h] = 1; });
  var changed = U.filter(function(x){ return !had[qHash(sc === "CH" ? x.t : normQ(x.t))]; }).map(function(x){ return x.k; });
  return {ok:!changed.length, changed:changed, r:r};
}
function clReadMark(sc){ S.cl = S.cl || {}; S.cl.read = S.cl.read || {}; S.cl.read[sc] = {u:clReadUnits(sc).map(function(x){ return qHash(sc === "CH" ? x.t : normQ(x.t)); }), by:wfWho(), at:Date.now()}; save(); }
function clReadHTML(sc){
  if(sc === "WS") return "";
  var R = clReadState(sc); if(R.none) return "";
  var st = R.ok ? '<span class="cls ok">✓ Đã đọc toàn ' + (sc === "CH" ? "bộ" : "bài") + (R.r.by ? " · " + esc(R.r.by) : "") + " · " + esc(libWhenMs(R.r.at)) + '</span>' : (R.r ? '<span class="cls recheck">↺ ' + (sc === "CH" ? "Bộ câu hỏi" : "Bài") + ' đã sửa sau lần đọc: đọc lại ' + esc(R.changed.join(", ")) + '</span>' : '<span class="cls todo">○ Chưa đọc toàn ' + (sc === "CH" ? "bộ" : "bài") + '</span>');
  var body = "", ch = {}; R.changed.forEach(function(k){ ch[k] = 1; });
  if(sc === "NL"){
    var src = clSrcText(), US = qIsR() ? null : clUsage();
    var unused = US ? function(x){ var n = qNorm(x.s); return US.some(function(z){ return z.line === x.ui + 1 && !z.uses.length && !z.ex && qNorm(z.s) === n; }); } : null;
    body = (US ? '<p class="small muted">Câu tô xám: chưa thấy dùng làm chỗ hỏi, căn cứ hoặc nhiễu (xem dòng NL-C6).</p>' : '') + cmpBox("NL", clUnits(), cmpParas(src), {lName:"Bài", rName:"Nguồn", rTitle:"Văn bản nguồn", changed:ch, unused:unused});
  } else {
    var items = wfQItems().map(function(it){ return {k:"câu " + it.n, whole:true, basis:it.basis, t:"Câu " + it.n + ". " + (it.stem || "") + "\n" + ["A","B","C","D"].map(function(k){ return k + ". " + ((it.opts || {})[k] || "") + (k === it.ans ? "   ← đáp án" : ""); }).join("\n")}; });
    var force = function(x, y){ var b = qNorm(y.u.basis || "").trim(), n = qNorm(x.s).trim(); return !!(b && n && (n.indexOf(b) >= 0 || b.indexOf(n) >= 0)); };
    body = cmpBox("CH", clUnits(), items, {lName:"Bài", rName:"Bộ câu hỏi", rTitle:"Bộ câu hỏi", rChanged:ch, force:force, forceOnly:true, senLabel:"Câu hỏi và căn cứ", noNomatch:true, note:"Ở chế độ Câu hỏi và căn cứ, câu hỏi cùng màu với câu trong bài chứa căn cứ của nó."});
  }
  return '<details class="box clread" data-k="read"' + (R.ok ? "" : " open") + '><summary>' + (sc === "CH" ? "Đọc cả bộ câu hỏi" : "Đọc toàn bài") + ' trước khi xét các dòng có nhãn <span class="cls na">đọc toàn ' + (sc === "CH" ? "bộ" : "bài") + '</span> ' + st + '</summary>' + body + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn ' + (R.ok ? "quiet" : "primary") + '" data-clread="' + sc + '">' + (R.ok ? "Đánh dấu đọc lại" : "Tôi đã đọc toàn " + (sc === "CH" ? "bộ" : "bài")) + '</button><span class="small muted">' + (sc === "NL" ? "Các dòng NL-C và NL-D2, D5 chỉ bấm Đạt được sau khi đọc. Bài sửa ở đoạn nào thì chỉ cần đọc lại đoạn đó (tô vàng)." : "Dòng CH-E5 chỉ bấm Đạt được sau khi đọc cả bộ. Câu nào sửa thì chỉ cần đọc lại câu đó.") + '</span></div></details>';
}
/* đối chiếu bài với nguồn: từ khoá chung cùng màu, câu tương ứng cùng màu */
var clReadMode = "kw", CL_KW_N = 8;
var CL_COMMONKW = {}; "really also just very much many more most some thing things people time make made like know think going want good well right okay yeah actually said says there here what when where which while about would could should will have has been being that's it's don't doesn't can't you're they're we're i'm other even only every each them then than into your their there's what's does didn't isn't aren't wasn't kind sort mean".split(" ").forEach(function(w){ CL_COMMONKW[w] = 1; });
function clTok(t){ var out = [], re = /\d[\d,.:]*\d%?|\d%?|[A-Za-z][A-Za-z'’-]*/g, m; while((m = re.exec(t))) out.push({i:m.index, s:m[0]}); return out; }
function clKey(tok){
  if(/^\d/.test(tok)) return "#" + tok.replace(/,/g, "").replace(/[.:]$/, "");
  var w = tok.toLowerCase().replace(/’/g, "'").replace(/'s$/, "");
  if(w.length < 4 || Q_STOP.indexOf(" " + w + " ") >= 0 || CL_COMMONKW[w]) return null;
  var lm = null; try{ lm = lexLemma(w); }catch(e){}
  if(lm) return lm;
  return w.replace(/ies$/, "y").replace(/([^s])s$/, "$1");
}
function clLegendHTML(sc){
  var g = CL_GROUPS[sc];
  return '<p class="small cltierline">Nhãn nguồn: <span class="cltier qd">QĐ 730</span> Quyết định 730/QĐ-BGDĐT · <span class="cltier sp">Specs</span> bảng phân bố, Guidelines, yêu cầu dự án, hướng dẫn của Bộ · <span class="cltier dx">Đề xuất</span> quy ước nhóm, tập huấn, nghiên cứu · <span class="cltier qt">Quy trình</span> cách trang kiểm. Hai tiêu chí đá nhau thì theo QĐ 730, rồi Specs, rồi Đề xuất. Nhãn không đổi mức đỏ/vàng của từng dòng.</p><details class="small cllegend" data-k="legend"><summary>Cách đặt mã</summary><p>Mã có dạng <b>' + sc + '-' + Object.keys(g)[0] + '1</b>: <b>' + sc + '</b> là ' + (sc === "NL" ? "checklist ngữ liệu (cổng 1 và cổng 2)" : "checklist câu hỏi (cổng 3)") + '; chữ cái là nhóm; số là thứ tự trong nhóm.</p><ul>' + Object.keys(g).map(function(k){ return '<li><b>' + sc + '-' + k + '</b>: ' + esc(g[k]) + (sc === "NL" && k === "A" ? " (xét ở cổng 1)" : "") + '</li>'; }).join("") + '</ul><p>Số thứ tự cố định, không đánh lại; tiêu chí mới (ví dụ từ các nghiên cứu) thêm vào cuối nhóm với số tiếp theo; tiêu chí bỏ đi vẫn giữ mã. Khi ghi chú, mở đầu bằng mã, ví dụ <b>[' + (sc === "NL" ? "NL-C1" : "CH-C5") + '] · PHẢI SỬA</b>. Cột dưới tên tiêu chí ghi căn cứ (QĐ 730, Bảng nhóm, Quy ước nhóm, Quy trình) và ai kiểm (Máy, Người, Máy + người, Soát từng câu).</p></details>';
}

/* ---- chấm ---- */
var clQCache = null;
function clQ(){ var t = S.slots.questions||"", key = qHash(t + "|" + (S.slots.draft||"") + "|" + S.spec + "|" + (S.slots.qblind||"")); if(clQCache && clQCache.key===key) return clQCache.R; var R = null; try{ R = t.trim() ? checkQ() : null; }catch(e){ R = null; } clQCache = {key:key, R:R}; return R; }
function clEval(sc){
  var rows = clRows(sc), out = {}, tk = clTicks(), R = sc==="CH" ? clQ() : null, byCode = {};
  if(sc==="CH" && R){
    R.global.forEach(function(g){ var c = clQCode(g.t, CL_QGMAP); (byCode[c] = byCode[c] || []).push({n:0, s:g.c==="b" ? "fail" : "warn", t:g.t}); });
    R.items.forEach(function(x){
      x.probs.forEach(function(p){ var c = clQCode(p, CL_QMAP); (byCode[c] = byCode[c] || []).push({n:x.it.n, s:"fail", t:p}); });
      x.warns.forEach(function(p){ var c = clQCode(p, CL_QMAP); (byCode[c] = byCode[c] || []).push({n:x.it.n, s:"warn", t:p}); });
    });
  }
  rows.forEach(function(r){
    var m = null;
    if(r.ev){ try{ m = r.ev(); }catch(e){ m = {s:"na", d:"Không chấm được."}; } }
    else if(sc==="CH" && r.who!=="H" && r.who!=="Q"){
      if(!R) m = {s:"na", d:"Chưa có câu hỏi."};
      else { var L = byCode[r.c] || []; m = !L.length ? {s:"ok", d:"Máy kiểm ổn."} : {s:L.some(function(x){ return x.s==="fail"; }) ? "fail" : "warn", list:L, d:L.slice(0,3).map(function(x){ return (x.n ? "Câu " + x.n + ": " : "") + x.t.replace(/[.\s]+$/,""); }).join("; ") + (L.length > 3 ? "; và " + (L.length-3) + " chỗ khác" : "") + "."}; }
    }
    if(sc==="CH" && r.who==="MH" && R && byCode[r.c]){ var L2 = byCode[r.c]; m = {s:L2.some(function(x){ return x.s==="fail"; }) ? "fail" : "warn", list:L2, d:L2.map(function(x){ return (x.n ? "Câu " + x.n + ": " : "") + x.t; }).join("; ")}; }
    var res = {r:r, m:m, s:"ok", d:"", keep:""};
    if(r.who==="Q"){
      if(!R || !R.items.length){ res.s = "na"; res.d = "Chưa có câu hỏi."; }
      else {
        var need = R.items.filter(function(x){ return qManKeys(x.it).indexOf(r.qk) >= 0; });
        if(!need.length){ res.s = "na"; res.d = "Không có câu nào cần soát mục này."; }
        else {
          var no = need.filter(function(x){ return qManState(x.it)[r.qk]==="no"; }), yes = need.filter(function(x){ return qManState(x.it)[r.qk]===true; });
          res.s = no.length ? "fail" : (yes.length===need.length ? "ok" : "todo");
          res.d = no.length ? "Chưa đạt: câu " + no.map(function(x){ return x.it.n; }).join(", ") + "." : yes.length + "/" + need.length + " câu đã soát đạt (đánh dấu ở cuối mỗi câu).";
          if(r.c==="CH-E4" && byCode[r.c]) res.d += " Thử mù: " + byCode[r.c].map(function(x){ return (x.n ? "câu " + x.n : "cả bộ"); }).join(", ") + " cần xem.";
        }
      }
      out[r.c] = res; return;
    }
    if(m){ res.s = m.s; res.d = m.d; res.keep = m.keep || ""; res.list = m.list; }
    if(r.who==="H" || r.who==="MH"){
      var t = tk[r.c], humanNA = (sc==="CH" && !R) || (sc==="NL" && r.g!=="A" && !(S.slots.draft||"").trim()) || (sc==="WS" && !(S.slots.draft||"").trim());
      if(humanNA){ if(r.who==="H"){ res.s = "na"; res.d = sc==="CH" ? "Chưa có câu hỏi." : sc==="WS" ? "Chưa có đề." : "Chưa có bài."; } }
      else if(res.s !== "fail"){
        var hs;
        if(!t) hs = "todo";
        else if(t.v==="no") hs = "fail";
        else { var st = clStale(r, t); hs = st.length ? "recheck" : "ok"; if(st.length) res.stale = st; }
        res.h = hs;
        if(hs==="fail") res.s = "fail";
        else if(hs==="todo" || hs==="recheck") res.s = hs;
        else if(res.s==="na" || !m) res.s = "ok";
      }
      if(t && t.note) res.tnote = t.note;
    }
    out[r.c] = res;
  });
  return out;
}
var CL_SLAB = {ok:"Đạt", fail:"Phải sửa", warn:"Nên xem", na:"Chưa áp dụng", todo:"Chờ người soát", recheck:"Soát lại"};
function clSummary(sc, ev){
  ev = ev || clEval(sc); var cnt = {ok:0, fail:0, warn:0, na:0, todo:0, recheck:0};
  Object.keys(ev).forEach(function(k){ cnt[ev[k].s]++; });
  var open = clNotes(sc).filter(function(n){ return n.st==="Mở" && n.sev==="PHẢI SỬA"; }).length;
  return {cnt:cnt, open:open, pass: !cnt.fail && !cnt.todo && !cnt.recheck && !open && (sc!=="CH" || !!(S.slots.questions||"").trim()) && (sc==="CH" || !!(S.slots.draft||"").trim())};
}

/* ---- ghi chú ---- */
function clNotes(sc){ S.notes = S.notes || []; return sc ? S.notes.filter(function(n){ return n.sc===sc; }) : S.notes; }
function clNoteId(){ return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
var CL_FIELDS = [["loc","Vị trí"],["quote","Trích"],["issue","Vấn đề"],["target","Cần đạt"],["suggest","Đề xuất (gợi ý)"],["range","Phạm vi"],["keep","Giữ"]];
function clNoteText(n, num){
  var head = (num ? "GHI CHÚ " + num + " · " : "") + "[" + n.code + "] · " + n.sev;
  var parts = CL_FIELDS.filter(function(f){ return String(n[f[0]]||"").trim(); }).map(function(f){ return f[1] + ": " + (f[0]==="quote" ? "\"" + n[f[0]] + "\"" : n[f[0]]); });
  return head + "\n" + parts.join(" | ");
}
var CL_HEAD_RE = /^[ \t>*•\-#]*(?:GHI\s*CH[ÚU]\s*\d+\s*[·|:\-–]\s*)?\[?\s*((?:NL|CH)\s*-\s*[A-Z]\s*\d+|KH[ÁA]C)\s*\]?\s*(?:[·|:\-–]\s*\[?\s*(PH[ẢA]I\s+S[ỬU]A|G[ỢO]I\s+[ÝY])\s*\]?)?(.*)$/i;
function clParseNotes(raw){
  var lines = cleanPaste(raw||"").replace(/\*\*/g,"").split(/\n/), blocks = [], cur = null;
  lines.forEach(function(l){
    var m = l.match(CL_HEAD_RE);
    if(m){ cur = {code:m[1].toUpperCase().replace(/\s+/g,"").replace(/^KH[ÁA]C$/,"KHÁC"), sev:m[2] ? (/PH/i.test(m[2]) ? "PHẢI SỬA" : "GỢI Ý") : "", body:[m[3]||""]}; blocks.push(cur); }
    else if(cur) cur.body.push(l);
  });
  return blocks.map(function(b){ var n = clFieldsFrom(b.body.join(" | ")); n.code = b.code; n.sev = b.sev || "PHẢI SỬA"; n.sevGuess = !b.sev; return n; });
}
function clFieldsFrom(text){
  var n = {}, LAB = /(V[ịi]\s*tr[íi]|Tr[íi]ch|V[ấa]n\s*đ[ềe]|C[ầa]n\s*đ[ạa]t|Đ[ềe]\s*xu[ấa]t(?:\s*\(g[ợo]i\s*[ýy]\))?|Ph[ạa]m\s*vi|Gi[ữu])\s*:/gi, m, marks = [];
  var keyOf = function(s){ s = s.toLowerCase().normalize("NFC"); return /^v[ịi]/.test(s) && /tr/.test(s) ? "loc" : /^tr/.test(s) ? "quote" : /^v[ấa]n/.test(s) ? "issue" : /^c[ầa]n/.test(s) ? "target" : /^đ/.test(s) ? "suggest" : /^ph/.test(s) ? "range" : "keep"; };
  while((m = LAB.exec(text))) marks.push({k:keyOf(m[1]), s:m.index, e:LAB.lastIndex});
  var pre = (marks.length ? text.slice(0, marks[0].s) : text).replace(/^[\s|·\-–:]+|[\s|·\-–:]+$/g,"").trim();
  marks.forEach(function(k, i){ var v = text.slice(k.e, i+1 < marks.length ? marks[i+1].s : text.length).replace(/^[\s|]+|[\s|]+$/g,"").replace(/\s*\|\s*$/,"").trim(); if(k.k==="quote") v = v.replace(/^["“”'‘]+|["“”'’]+$/g,"").trim(); if(!n[k.k]) n[k.k] = v; });
  if(pre && !n.issue) n.issue = pre;
  return n;
}
function clAddNotes(list, sc, from){
  var added = 0;
  list.forEach(function(n){
    var s = /^NL-/.test(n.code) ? "NL" : (/^CH-/.test(n.code) ? "CH" : sc);
    S.notes = S.notes || [];
    S.notes.push({id:clNoteId(), sc:s, code:n.code||"KHÁC", sev:n.sev||"PHẢI SỬA", loc:n.loc||"", quote:n.quote||"", issue:n.issue||"", target:n.target||"", suggest:n.suggest||"", range:n.range||"", keep:n.keep||"", st:"Mở", by:n.by||"", from:from||"tay", sevGuess:!!n.sevGuess, at:Date.now()});
    added++;
    clEnsureBase(s);
  });
  save(); return added;
}
function clEnsureBase(sc){ S.cl = S.cl || {}; S.cl.base = S.cl.base || {}; if(!S.cl.base[sc]) S.cl.base[sc] = {at:Date.now(), st:clStates(sc)}; }
function clStates(sc){ var ev = clEval(sc), o = {}; Object.keys(ev).forEach(function(k){ o[k] = ev[k].s; }); return o; }
// vị trí của trích dẫn
function clLocate(n){
  if(!n.quote) return null;
  var q = qNorm(n.quote).trim(); if(!q) return null;
  var d = S.slots.draft || "", Qt = S.slots.questions || "";
  if(n.sc==="CH" && Qt){
    var i = qNorm(Qt).indexOf(" " + q + " ");
    if(i >= 0){ var loc = findOld(Qt, n.quote) || {i:-1}, n0 = 0; if(loc.i >= 0){ var re = /^[ \t>•\-]*C[ÂA]U\s+(\d+)/gim, mm; while((mm = re.exec(Qt)) && mm.index <= loc.i) n0 = +mm[1]; } return {where:n0 ? "câu " + n0 : "trong bộ câu hỏi", unit:n0 ? "câu " + n0 : ""}; }
  }
  if(d && qNorm(d).indexOf(" " + q + " ") >= 0){
    if(qIsR()){ var p = qParaOf(analyze(d).body.map(function(b){ return b.text; }), n.quote); return {where:p ? "đoạn " + p : "trong bài", unit:p ? "đoạn " + p : "", inDraft:true}; }
    var lines = d.split(/\n/).map(function(s){ return s.trim(); }).filter(Boolean); for(var k = 0; k < lines.length; k++) if(qNorm(lines[k]).indexOf(" " + q + " ") >= 0) return {where:"dòng " + (k+1), unit:"dòng " + (k+1), inDraft:true};
    return {where:"trong bài", unit:"", inDraft:true};
  }
  return {where:"", missing:true};
}
function clScopeUnits(n, sc){
  var txt = ((n.range||"") + " " + (n.loc||"")).toLowerCase().normalize("NFC");
  if(/cả bài|toàn bài|cả bộ|toàn bộ|whole/.test(n.range||"")) return null;
  var word = sc==="CH" ? "câu" : (qIsR() ? "đoạn" : "dòng"), out = [];
  var re = new RegExp(word + "\\s*((?:\\d+\\s*(?:,|và|-|–|đến)?\\s*)+)", "g"), m;
  while((m = re.exec(txt))){ var nums = m[1].match(/\d+/g)||[]; if(/[-–]|đến/.test(m[1]) && nums.length===2){ for(var x = +nums[0]; x <= +nums[1]; x++) out.push(word + " " + x); } else nums.forEach(function(v){ out.push(word + " " + v); }); }
  if(sc==="NL" && qIsR() && /tiêu đề|title/.test(txt)) out.push("tiêu đề");
  var L = clLocate(n); if(L && L.unit) out.push(L.unit);
  return out.length ? out : null;
}

/* ---- câu lệnh sửa theo ghi chú ---- */
function clKeepLines(sc){
  var ev = clEval(sc), L = [];
  clRows(sc).forEach(function(r){ var e = ev[r.c]; if(!e || e.s!=="ok") return; if(e.keep) L.push("- " + r.c + " " + e.keep); else L.push("- " + r.c + " " + r.t + (r.who!=="M" ? " (người thẩm định đã xác nhận)" : "") + "."); });
  return L;
}
function clFixPrompt(sc, record){
  var notes = clNotes(sc).filter(function(n){ return n.st==="Mở"; });
  if(!notes.length) return "";
  var isR = qIsR(), noun = isR ? "bài đọc" : "kịch bản nghe";
  var keep = clKeepLines(sc), kw = keepList();
  if(sc==="CH") keep = keep.concat(clKeepLines("NL").length ? [] : []);
  var L = [];
  if(sc==="NL"){
    L.push("Bạn là biên tập viên đề thi VSTEP. Sửa " + noun + " dưới đây theo các ghi chú thẩm định. Mỗi ghi chú có mã tiêu chí trong checklist của nhóm.", "", "QUY TẮC",
      "1. Chỉ sửa đúng các chỗ ghi chú yêu cầu, trong phạm vi ghi ở từng ghi chú. Mọi chỗ khác giữ nguyên từng chữ, kể cả dấu câu và xuống dòng.",
      "2. Không thêm thông tin, không đổi sự kiện, con số, tên riêng, thứ tự ý. Chính tả " + S.spelling + ".",
      "3. Ghi chú PHẢI SỬA: bắt buộc sửa. Ghi chú GỢI Ý: chỉ sửa nếu không làm hỏng tiêu chí ở mục 4; không sửa thì ghi KHÔNG SỬA kèm lý do.",
      "4. Các tiêu chí sau đang đạt; sửa xong vẫn phải đạt:");
    L = L.concat(keep.length ? keep : ["- (chưa có tiêu chí nào đạt để giữ)"]);
    var locks = [];
    if(kw.length) locks.push("các từ giữ lại để hỏi: " + kw.join(", "));
    var Qp = (S.slots.questions||"").trim() ? parseQ(S.slots.questions).items.filter(function(it){ return it.basis; }) : [];
    if(Qp.length) locks.push("các câu đang làm căn cứ câu hỏi (sửa câu này thì câu hỏi mất căn cứ): " + Qp.map(function(it){ return "\"" + it.basis + "\""; }).join("; "));
    L.push("5. Giữ nguyên: " + (locks.length ? locks.join(". ") + "." : "không có mục khoá riêng."));
  } else {
    L.push("Bạn là biên tập viên đề thi VSTEP. Sửa BỘ CÂU HỎI dưới đây theo các ghi chú thẩm định. Mỗi ghi chú có mã tiêu chí trong checklist của nhóm. Bài " + (isR ? "đọc" : "nghe") + " chỉ để đối chiếu, không sửa bài.", "", "QUY TẮC",
      "1. Chỉ sửa đúng các câu, các phương án ghi chú yêu cầu. Câu không có ghi chú giữ nguyên từng chữ.",
      "2. Giữ khuôn trình bày của bộ câu (dòng CÂU số | bậc mức | mã" + (isR ? " | đoạn" : "") + ", HỎI, A–D, ĐÁP ÁN, CĂN CỨ, LOẠI, GIẢI THÍCH). Giữ bậc, mức, mã của câu. CĂN CỨ phải chép nguyên văn từ bài. Nếu đổi đáp án đúng thì sửa cả dòng ĐÁP ÁN, LOẠI, GIẢI THÍCH cho khớp.",
      "3. Ghi chú PHẢI SỬA: bắt buộc sửa. Ghi chú GỢI Ý: chỉ sửa nếu không làm hỏng tiêu chí ở mục 4; không sửa thì ghi KHÔNG SỬA kèm lý do.",
      "4. Các tiêu chí sau đang đạt; sửa xong vẫn phải đạt:");
    L = L.concat(keep.length ? keep : ["- (chưa có tiêu chí nào đạt để giữ)"]);
    L.push("5. Câu hỏi theo thứ tự căn cứ trong bài; câu này không được để lộ đáp án câu khác; phương án sai không dùng từ tuyệt đối mà bài không nói tới.");
  }
  L.push("", "GHI CHÚ");
  notes.forEach(function(n, i){ L.push(clNoteText(n, i + 1)); });
  L.push("", "TRÌNH BÀY",
    "Trình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code. KHÔNG trả lại cả " + (sc==="NL" ? "bài" : "bộ câu hỏi") + ". Mỗi chỗ sửa là một khối 3 dòng, các khối cách nhau một dòng trống:",
    "SỬA 1 | GHI CHÚ 1",
    "THAY: (chép y nguyên một đoạn liền trong " + (sc==="NL" ? "bài" : "bộ câu hỏi") + ", đủ dài để chỉ có đúng một chỗ như vậy)",
    "BẰNG: (đoạn mới thay vào)",
    "Ghi chú nào không sửa: một dòng KHÔNG SỬA | GHI CHÚ số | lý do.", "");
  if(sc==="CH"){ L.push("BÀI (chỉ để đối chiếu)", S.slots.draft||"", "", "BỘ CÂU HỎI", S.slots.questions||""); }
  else L.push((isR ? "BÀI" : "KỊCH BẢN"), S.slots.draft||"");
  if(record){ S.cl = S.cl || {}; S.cl.promptNotes = S.cl.promptNotes || {}; S.cl.promptNotes[sc] = notes.map(function(n){ return n.id; }); save(); }
  return L.join("\n");
}

/* ---- đọc kết quả THAY/BẰNG ---- */
function clParsePatches(raw){
  var txt = cleanPaste(raw||"").replace(/\r/g,"").replace(/\*\*/g,"");
  var HRE = /^[ \t>#*•\-]*S[ỬU]A\s*(\d+)\s*(?:[|:–\-]\s*(.*))?$/gim, hm, heads = [], skips = [], out = [];
  var SK = /^[ \t>#*•\-]*KH[ÔO]NG\s+S[ỬU]A\s*[|:–\-]?\s*(.*)$/gim, sm;
  while((sm = SK.exec(txt))) skips.push(sm[1].trim());
  var clean = txt.replace(SK, "");
  while((hm = HRE.exec(clean))) heads.push({i:hm.index, end:HRE.lastIndex, n:hm[1], ref:hm[2]||""});
  heads.forEach(function(h, k){
    var body = clean.slice(h.end, k+1 < heads.length ? heads[k+1].i : clean.length);
    var mO = body.match(/(?:^|\n)[ \t>*•\-]*(?:THAY|C[ŨU]|OLD)\s*:\s*([\s\S]*?)(?=\n[ \t>*•\-]*(?:B[ẰA]NG|M[ỚO]I|NEW)\s*:)/i), mN = body.match(/\n[ \t>*•\-]*(?:B[ẰA]NG|M[ỚO]I|NEW)\s*:[ \t]*([\s\S]*)$/i);
    if(!mO || !mN) return;
    var old = mO[1].trim(), nw = mN[1].replace(/\s+$/,"").replace(/^[ \t]+/,"");
    var unq = function(s){ return /^["“][\s\S]*["”]$/.test(s) && (s.match(/["“”]/g)||[]).length===2 ? s.slice(1,-1) : s; };
    old = unq(old); nw = unq(nw.trim());
    var refs = [], rm, RR = /GHI\s*CH[ÚU]\s*(\d+)/gi; while((rm = RR.exec(h.ref))) refs.push(+rm[1]);
    var codes = (h.ref.match(/(?:NL|CH)-[A-Z]\d+/gi)||[]).map(function(c){ return c.toUpperCase(); });
    out.push({n:h.n, refs:refs, codes:codes, old:old, nw:nw});
  });
  return {patches:out, skips:skips};
}
function clUnitAt(sc, text, pos){
  if(sc==="CH"){ var re = /^[ \t>•\-]*C[ÂA]U\s+(\d+)/gim, mm, n0 = 0; while((mm = re.exec(text)) && mm.index <= pos) n0 = +mm[1]; return n0 ? "câu " + n0 : ""; }
  var before = text.slice(0, pos);
  if(qIsR()){
    var parts = before.split(/\n\s*\n/), idx = parts.length - 1, a = analyze(text), titles = a.titles.length;
    return idx < titles ? "tiêu đề" : "đoạn " + (idx - titles + 1);
  }
  return "dòng " + before.split(/\n/).filter(function(s){ return s.trim(); }).length;
}
function clPatchNotes(sc, p){
  var ids = (S.cl && S.cl.promptNotes && S.cl.promptNotes[sc]) || [], all = clNotes(sc), res = [];
  p.refs.forEach(function(k){ var n = all.filter(function(x){ return x.id===ids[k-1]; })[0]; if(n) res.push(n); });
  if(!res.length && p.codes.length) res = all.filter(function(x){ return x.st==="Mở" && p.codes.indexOf(x.code) >= 0; });
  return res;
}
var clPatchState = {NL:null, CH:null};
function clReviewPatches(sc){
  var raw = (S.cl && S.cl.patchRaw && S.cl.patchRaw[sc]) || "";
  if(!raw.trim()){ clPatchState[sc] = null; return null; }
  var P = clParsePatches(raw), text = sc==="NL" ? (S.slots.draft||"") : (S.slots.questions||"");
  P.patches.forEach(function(p){
    var loc = findOld(text, p.old); p.loc = loc;
    p.notes = clPatchNotes(sc, p);
    if(!loc){ p.err = text.indexOf(p.nw) >= 0 && p.nw.trim() ? "đã áp dụng" : "không tìm thấy đoạn THAY"; p.on = false; return; }
    if(loc.n > 1){ p.err = "đoạn THAY có " + loc.n + " chỗ giống hệt: cần chép dài hơn"; p.on = false; return; }
    p.unit = clUnitAt(sc, text, loc.i);
    var allowed = null; p.notes.forEach(function(n){ var u = clScopeUnits(n, sc); if(u===null){ allowed = allowed || null; return; } allowed = (allowed || []).concat(u); });
    if(p.notes.some(function(n){ return clScopeUnits(n, sc)===null; })) allowed = null;
    p.out = !!(allowed && p.unit && allowed.indexOf(p.unit) < 0);
    p.on = !p.out;
  });
  clPatchState[sc] = P; return P;
}
function clApplyPatches_guard(){ if(typeof wfCanEditSlot === "function" && !wfCanEditSlot("draft")){ toast("Chế độ xem: chỉ người đang soạn bài mới áp phần sửa vào bài."); return false; } return true; }
function clApplyPatches(sc){
  if(!clApplyPatches_guard()) return;
  var P = clPatchState[sc]; if(!P) return;
  if(sc==="NL" && typeof wfDraftLocked==="function" && wfDraftLocked()){ P.msg = "Bài đã khoá: cần đổi bài thì gửi yêu cầu sửa ngữ liệu ở thanh Quy trình."; clRender(); return; }
  var slot = sc==="NL" ? "draft" : "questions", text = S.slots[slot] || "", before = {NL:clStates("NL"), CH:(S.slots.questions||"").trim() ? clStates("CH") : null}, done = [], miss = [];
  var ticksBefore = JSON.parse(JSON.stringify(clTicks()));
  P.patches.forEach(function(p){
    if(!p.on) return;
    var loc = findOld(text, p.old);
    if(!loc || loc.n !== 1){ miss.push(p.n); return; }
    text = text.slice(0, loc.i) + p.nw + text.slice(loc.i + loc.len); done.push(p);
  });
  if(!done.length){ clPatchState[sc].msg = miss.length ? "Không áp dụng được chỗ nào (không còn khớp đúng một chỗ)." : "Chưa chọn chỗ nào."; clRender(); return; }
  S.cl.undo = {sc:sc, slot:slot, text:S.slots[slot]||"", notes:JSON.parse(JSON.stringify(S.notes||[])), at:Date.now()};
  setSlot(slot, text);
  var fixedIds = {}; done.forEach(function(p){ p.notes.forEach(function(n){ fixedIds[n.id] = 1; }); });
  (S.notes||[]).forEach(function(n){ if(fixedIds[n.id] && n.st==="Mở") n.st = "Đã sửa"; });
  // kiểm từ phải giữ trong ghi chú
  var keepLost = [];
  done.forEach(function(p){ p.notes.forEach(function(n){ (String(n.keep||"").match(/["“]([^"”]{2,80})["”]/g)||[]).forEach(function(q){ q = q.slice(1,-1); if(qNorm(text).indexOf(qNorm(q)) < 0 && qNorm(S.cl.undo.text).indexOf(qNorm(q)) >= 0) keepLost.push(n.code + ": \"" + q + "\""); }); }); });
  var after = {NL:clStates("NL"), CH:(S.slots.questions||"").trim() ? clStates("CH") : null};
  S.cl.lastApply = {sc:sc, at:Date.now(), n:done.length, miss:miss, diff:clDiff(before, after), keepLost:keepLost, units:done.map(function(p){ return p.unit; }).filter(Boolean)};
  S.cl.patchRaw[sc] = ""; clPatchState[sc] = null; save();
  clRender();
}
var CL_RANK = {ok:0, na:0, warn:1, todo:2, recheck:2, fail:3};
function clDiff(a, b){
  var worse = [], better = [];
  ["NL","CH"].forEach(function(sc){ if(!a[sc] || !b[sc]) return; Object.keys(b[sc]).forEach(function(c){ var x = a[sc][c], y = b[sc][c]; if(x===undefined) return; if(CL_RANK[y] > CL_RANK[x]) worse.push({c:c, from:x, to:y}); else if(CL_RANK[y] < CL_RANK[x]) better.push({c:c, from:x, to:y}); }); });
  return {worse:worse, better:better};
}
function clUndo(){
  var u = S.cl && S.cl.undo; if(!u) return;
  S.notes = u.notes; S.cl.undo = null; S.cl.lastApply = null; save();
  setSlot(u.slot, u.text); clRender(); toast("Đã hoàn tác lần sửa vừa rồi.");
}

/* ---- nhập bình luận Word (.docx) ---- */
function clU16(b, o){ return b[o] | (b[o+1] << 8); }
function clU32(b, o){ return (b[o] | (b[o+1] << 8) | (b[o+2] << 16) | (b[o+3] << 24)) >>> 0; }
function clUnzip(buf){
  var b = new Uint8Array(buf), e = -1;
  for(var i = b.length - 22; i >= Math.max(0, b.length - 70000); i--) if(clU32(b, i)===0x06054b50){ e = i; break; }
  if(e < 0) return Promise.reject(new Error("không phải file .docx"));
  var cnt = clU16(b, e+10), off = clU32(b, e+16), files = {};
  for(var k = 0; k < cnt; k++){
    if(clU32(b, off)!==0x02014b50) break;
    var meth = clU16(b, off+10), csz = clU32(b, off+20), nl = clU16(b, off+28), xl = clU16(b, off+30), cl = clU16(b, off+32), lo = clU32(b, off+42);
    var name = new TextDecoder().decode(b.subarray(off+46, off+46+nl));
    files[name] = {meth:meth, csz:csz, lo:lo};
    off += 46 + nl + xl + cl;
  }
  return {get:function(name){
    var f = files[name]; if(!f) return Promise.resolve(null);
    var lo = f.lo, ds = lo + 30 + clU16(b, lo+26) + clU16(b, lo+28), data = b.subarray(ds, ds + f.csz);
    if(f.meth===0) return Promise.resolve(new TextDecoder().decode(data));
    var stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Response(stream).text();
  }};
}
var CL_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
function clDocxComments(buf){
  var Z; try{ Z = clUnzip(buf); }catch(e){ return Promise.reject(e); }
  if(Z.then) return Z;
  return Promise.all([Z.get("word/comments.xml"), Z.get("word/document.xml"), Z.get("word/commentsExtended.xml")]).then(function(r){
    if(!r[0]) return [];
    var dp = new DOMParser(), C = dp.parseFromString(r[0], "application/xml"), D = r[1] ? dp.parseFromString(r[1], "application/xml") : null;
    var replyPara = {};
    if(r[2]){ var X = dp.parseFromString(r[2], "application/xml"), ex = X.getElementsByTagName("*"); for(var i = 0; i < ex.length; i++){ if(ex[i].localName==="commentEx"){ var par = ex[i].getAttributeNS(null, "paraIdParent") || ex[i].getAttribute("w15:paraIdParent"); if(par){ var pid = ex[i].getAttribute("w15:paraId") || ex[i].getAttributeNS(null,"paraId"); if(pid) replyPara[pid] = 1; } } } }
    var anchors = {};
    if(D){
      var open = {}, walk = D.createTreeWalker(D.documentElement, 1);
      var nd = walk.currentNode;
      while(nd){
        if(nd.namespaceURI===CL_W){
          var ln = nd.localName, id = nd.getAttributeNS(CL_W, "id");
          if(ln==="commentRangeStart"){ open[id] = 1; anchors[id] = anchors[id] || ""; }
          else if(ln==="commentRangeEnd"){ delete open[id]; }
          else if(ln==="t"){ for(var k in open) anchors[k] += nd.textContent; }
          else if(ln==="p" || ln==="tab" || ln==="br"){ for(var k2 in open) anchors[k2] += " "; }
        }
        nd = walk.nextNode();
      }
    }
    var out = [], cs = C.getElementsByTagNameNS(CL_W, "comment");
    for(var j = 0; j < cs.length; j++){
      var c = cs[j], ps = c.getElementsByTagNameNS(CL_W, "p"), isReply = false, lines = [];
      for(var q = 0; q < ps.length; q++){ var pid2 = ps[q].getAttribute("w14:paraId"); if(pid2 && replyPara[pid2]) isReply = true; var ts = ps[q].getElementsByTagNameNS(CL_W, "t"), s = ""; for(var z = 0; z < ts.length; z++) s += ts[z].textContent; lines.push(s); }
      if(isReply) continue;
      out.push({id:c.getAttributeNS(CL_W, "id"), author:c.getAttributeNS(CL_W, "author") || "", text:lines.join("\n").trim(), anchor:(anchors[c.getAttributeNS(CL_W, "id")]||"").replace(/\s+/g," ").trim()});
    }
    return out;
  });
}
function clCommentToNote(cm){
  var t = cm.text, P = clParseNotes(t), n;
  if(P.length){ n = P[0]; }
  else {
    var m = t.match(/^\s*\[?\s*((?:NL|CH)\s*-\s*[A-Z]\s*\d+)\s*\]?\s*[·|:\-–]?\s*/i);
    n = clFieldsFrom(m ? t.slice(m[0].length) : t); n.code = m ? m[1].toUpperCase().replace(/\s+/g,"") : "KHÁC";
    var sv = t.match(/PH[ẢA]I\s+S[ỬU]A|G[ỢO]I\s+[ÝY]/i); n.sev = sv ? (/PH/i.test(sv[0]) ? "PHẢI SỬA" : "GỢI Ý") : "PHẢI SỬA"; n.sevGuess = !sv;
    if(n.issue) n.issue = n.issue.replace(/^\s*(PH[ẢA]I\s+S[ỬU]A|G[ỢO]I\s+[ÝY])\s*[·|:\-–]?\s*/i, "");
  }
  if(!n.quote && cm.anchor) n.quote = cm.anchor.length > 200 ? cm.anchor.slice(0, 200) : cm.anchor;
  n.by = cm.author;
  return n;
}

/* ---- giao diện ---- */
var CL_TIER = {qd:["QĐ 730","qd"], spec:["Specs","sp"], dx:["Đề xuất","dx"], qt:["Quy trình","qt"]};
function clTierHTML(r){ var t = CL_TIER[r.tier || (/QĐ 730/.test(r.src||"") ? "qd" : "dx")]; return '<span class="cltier ' + t[1] + '" title="Thứ tự ưu tiên khi hai tiêu chí đá nhau: QĐ 730, rồi Specs, rồi Đề xuất. Quy trình là cách trang kiểm, không phải tiêu chí nội dung.">' + t[0] + '</span> '; }
var CL_WHO = {M:"Máy", H:"Người", MH:"Máy + người", Q:"Soát từng câu"};
var CL_IC = {ok:"✓", fail:"!", warn:"?", na:"–", todo:"○", recheck:"↺"};
function clStatusHTML(e){ return '<span class="cls ' + e.s + '">' + CL_IC[e.s] + " " + CL_SLAB[e.s] + '</span>'; }
function clRowHTML(sc, e){
  var r = e.r, tk = clTicks()[r.c], human = r.who==="H" || r.who==="MH";
  var notesN = clNotes(sc).filter(function(n){ return n.code===r.c && n.st==="Mở"; }).length;
  var det = esc(e.d || "");
  if(e.stale) det += (det ? " " : "") + '<span class="warnc">Đã sửa sau khi đánh dấu: ' + esc(e.stale.join(", ")) + '. Soát lại phần này.</span>';
  if(e.list && e.list.length > 3) det += '<details class="cllist"><summary>Xem cả ' + e.list.length + ' chỗ</summary><ul>' + e.list.map(function(x){ return '<li>' + (x.n ? "Câu " + x.n + ": " : "") + esc(x.t) + '</li>'; }).join("") + '</ul></details>';
  var act = "";
  var needRead = r.full && !clReadState(sc).ok;
  if(human && e.s!=="na"){
    act += '<button type="button" class="btn quiet sm' + (tk && tk.v==="ok" && e.h!=="recheck" ? " on" : "") + '" data-cltick="' + r.c + '" data-v="ok"' + (needRead ? ' disabled title="Đọc toàn ' + (sc === "CH" ? "bộ" : "bài") + ' trước (khung ở đầu checklist)"' : '') + '>Đạt</button>'
      + '<button type="button" class="btn quiet sm' + (tk && tk.v==="no" ? " on no" : "") + '" data-cltick="' + r.c + '" data-v="no">Chưa đạt</button>';
  }
  act += '<button type="button" class="btn quiet sm" data-clnote="' + r.c + '" title="Thêm ghi chú cho tiêu chí này">+ Ghi chú</button>';
  var aid = (r.who === "H" || r.who === "MH") && CL_AIDS[r.c] ? '<details class="claid" data-aid="' + r.c + '"' + (clAidOpen[r.c] ? " open" : "") + '><summary class="small">Xem để xét</summary><div class="claidb">' + (clAidOpen[r.c] ? (function(){ try{ return clAid(r.c); }catch(x){ return ""; } })() : "") + '</div></details>' : '';
  return '<tr class="clr ' + e.s + '"><td class="clc"><b>' + esc(r.c) + '</b></td><td>' + esc(r.t) + '<div class="small muted">' + clTierHTML(r) + esc(r.src) + ' · ' + CL_WHO[r.who] + (r.full ? ' · <span class="cls na">đọc toàn ' + (sc === "CH" ? "bộ" : "bài") + '</span>' : '') + (notesN ? ' · <span class="no">' + notesN + ' ghi chú mở</span>' : '') + '</div></td><td>' + clStatusHTML(e) + (det ? '<div class="small">' + det + '</div>' : '') + '</td><td class="cla">' + act + '</td></tr>' + (aid ? '<tr class="claidrow"><td></td><td colspan="3">' + aid + '</td></tr>' : '');
}
function clNoteHTML(n, i){
  var L = clLocate(n), cls = n.st==="Mở" ? (n.sev==="PHẢI SỬA" ? "must" : "see") : "done";
  var where = !n.quote ? "" : (L && !L.missing ? '<span class="okf">Tìm thấy: ' + esc(L.where || "") + '</span>' : '<span class="flag">Không còn thấy đoạn trích trong bài' + (n.sc==="CH" ? " hoặc bộ câu hỏi" : "") + (n.st==="Mở" ? " (có thể đã sửa)" : "") + '</span>');
  return '<div class="fx ' + cls + '" data-nid="' + n.id + '"><div class="fxh"><span class="tag">' + esc(n.sev) + '</span><b>[' + esc(n.code) + ']</b>'
    + '<select data-nst="' + n.id + '" aria-label="Trạng thái ghi chú">' + ["Mở","Đã sửa","Đã xác nhận"].map(function(s){ return '<option' + (s===n.st ? " selected" : "") + '>' + s + '</option>'; }).join("") + '</select>'
    + (n.by ? '<span class="small muted">' + esc(n.by) + '</span>' : '') + (n.from && n.from!=="tay" ? '<span class="small muted">· ' + esc(n.from) + '</span>' : '') + (n.sevGuess ? '<span class="small warnc">· chưa ghi mức, tạm xếp PHẢI SỬA</span>' : '')
    + '<span style="margin-left:auto"></span><button type="button" class="btn quiet sm" data-nedit="' + n.id + '">Sửa</button><button type="button" class="btn quiet sm" data-ndel="' + n.id + '">Xoá</button></div>'
    + CL_FIELDS.filter(function(f){ return String(n[f[0]]||"").trim(); }).map(function(f){ return '<div class="row"><b>' + f[1] + ':</b> ' + (f[0]==="quote" ? "<i>\"" + esc(n[f[0]]) + "\"</i>" : esc(n[f[0]])) + '</div>'; }).join("")
    + (where ? '<div>' + where + '</div>' : '') + '</div>';
}
var clForm = {NL:null, CH:null, WS:null};
function clFormHTML(sc){
  var f = clForm[sc] || {code:"", sev:"PHẢI SỬA"}, codes = clRows(sc).map(function(r){ return r.c; }).concat(["KHÁC"]);
  return '<div class="clform" data-clform="' + sc + '">' + (sc === "WS" && typeof wsPickHTML === "function" ? wsPickHTML() : "") + '<div class="grid2">'
    + '<label class="small">Mã tiêu chí<select data-ff="code">' + codes.map(function(c){ var r = clRows(sc).filter(function(x){ return x.c===c; })[0]; return '<option value="' + c + '"' + (c===f.code ? " selected" : "") + '>' + c + (r ? " · " + esc(r.t.slice(0,60)) : " · chưa có mã phù hợp") + '</option>'; }).join("") + '</select></label>'
    + '<label class="small">Mức<select data-ff="sev"><option' + (f.sev==="PHẢI SỬA" ? " selected" : "") + '>PHẢI SỬA</option><option' + (f.sev==="GỢI Ý" ? " selected" : "") + '>GỢI Ý</option></select></label></div>'
    + CL_FIELDS.map(function(x){ var ph = {loc:sc==="NL" ? "đoạn 3, câu 2" : sc==="WS" ? "ví dụ: Chủ đề 1, câu 2" : "câu 4, phương án C", quote:"chép nguyên văn chỗ có lỗi (tiếng Anh)", issue:sc==="WS" ? "sự kiện kiểm được, ví dụ: hỏi trùng ý với câu 1" : "sự kiện kiểm được, ví dụ: câu 31 từ, có hai mệnh đề quan hệ", target:sc==="WS" ? "ví dụ: câu hỏi về một khía cạnh khác của chủ đề" : "ví dụ: dưới 25 từ; Flesch ≥ 60", suggest:"không bắt buộc", range:sc==="NL" ? "chỉ đoạn 3" : sc==="WS" ? "chỉ câu này" : "chỉ câu 4", keep:sc==="WS" ? "ví dụ: giữ chủ đề shopping" : "ví dụ: giữ \"insulation\" (từ để hỏi VO)"}[x[0]];
      return '<label class="small">' + x[1] + (x[0]==="quote" || x[0]==="issue" ? " *" : "") + '<input type="text" data-ff="' + x[0] + '" value="' + esc(f[x[0]]||"") + '" placeholder="' + esc(ph) + '"></label>'; }).join("")
    + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn primary" data-fsave="' + sc + '">' + (f.id ? "Lưu thay đổi" : "Thêm ghi chú") + '</button>' + (f.id ? '<button type="button" class="btn quiet" data-fcancel="' + sc + '">Huỷ</button>' : '') + '<span class="small muted" data-fmsg></span></div></div>';
}
function clPatchHTML(sc){
  var P = clPatchState[sc] || clReviewPatches(sc); if(!P) return "";
  if(!P.patches.length) return '<div class="note small">Không đọc được khối SỬA nào (mỗi khối cần dòng "SỬA số", "THAY:" và "BẰNG:").' + remindHTML(CL_REMIND) + '</div>';
  return '<div style="display:grid;gap:10px">' + P.patches.map(function(p, i){
    var st = p.err ? '<span class="flag">' + esc(p.err) + '</span>' : (p.out ? '<span class="flag">Nằm ở ' + esc(p.unit) + ', ngoài phạm vi ghi chú cho phép. Mặc định không áp dụng.</span>' : '<span class="okf">Khớp đúng một chỗ' + (p.unit ? " (" + esc(p.unit) + ")" : "") + '.</span>');
    return '<div class="fx ' + (p.err ? "see done" : (p.out ? "see" : "must")) + '"><div class="fxh"><label><input type="checkbox" data-pon="' + i + '"' + (p.on ? " checked" : "") + (p.err ? " disabled" : "") + '> Áp dụng</label><span class="muted small">Sửa ' + esc(p.n) + (p.notes.length ? " · " + p.notes.map(function(n){ return n.code; }).join(", ") : "") + '</span></div><div class="row">' + wordDiffHTML(p.old, p.nw) + '</div><div>' + st + '</div></div>';
  }).join("") + (P.skips.length ? '<div class="small muted">AI không sửa: ' + P.skips.map(esc).join("; ") + '</div>' : '') + '</div>'
    + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="button" class="btn primary" data-papply="' + sc + '">Áp dụng các chỗ đã chọn</button><span class="small muted">' + esc(P.msg||"") + '</span></div>';
}
var CL_REMIND = 'Hãy gửi lại TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```). Không trả lại cả bài. Mỗi chỗ sửa gồm 3 dòng riêng:\nSỬA 1 | GHI CHÚ 1\nTHAY: (chép y nguyên một đoạn liền, đủ dài để chỉ có một chỗ như vậy)\nBẰNG: (đoạn mới)\nCác khối cách nhau một dòng trống. Ghi chú nào không sửa: KHÔNG SỬA | GHI CHÚ số | lý do.';
function clDiffHTML(D, title){
  if(!D) return "";
  var lab = function(x){ return CL_SLAB[x.from] + " → " + CL_SLAB[x.to]; };
  var bad = D.worse.filter(function(x){ return x.to!=="recheck"; }), re = D.worse.filter(function(x){ return x.to==="recheck"; });
  return '<div class="' + (bad.length ? "note" : "info") + ' small"><b>' + esc(title) + '</b> ' + (bad.length ? '<span class="no">Tiêu chí bị xấu đi: ' + bad.map(function(x){ return esc(x.c) + " (" + lab(x) + ")"; }).join(", ") + '.</span> ' : 'Không tiêu chí nào bị xấu đi. ') + (re.length ? 'Cần người soát lại phần vừa sửa: ' + re.map(function(x){ return esc(x.c); }).join(", ") + '. ' : '') + (D.better.length ? 'Đã tốt lên: ' + D.better.map(function(x){ return esc(x.c) + " (" + lab(x) + ")"; }).join(", ") + '.' : '') + '</div>';
}
function clGateSync(sc, sum){
  var id = sc==="NL" ? "cl-ck" : sc==="WS" ? "ws-ck" : "ch-ck", g = document.querySelector('input[data-gate="' + id + '"]');
  S.gates = S.gates || {}; S.gates[id] = !!sum.pass; if(g) g.checked = !!sum.pass;
}
function clRender(){
  document.querySelectorAll("[data-cl]").forEach(function(box){
    var sc = box.getAttribute("data-cl"), scr = box.closest(".screen");
    var ev = clEval(sc), sum = clSummary(sc, ev); clGateSync(sc, sum);
    if(scr && scr.classList.contains("hidden") && box.dataset.drawn) return;
    var keepOpen = {}; box.querySelectorAll("details[data-k]").forEach(function(d){ keepOpen[d.getAttribute("data-k")] = d.open; });
    var c = sum.cnt, notes = clNotes(sc), nOpen = notes.filter(function(n){ return n.st==="Mở"; }).length;
    var h = '<h3>Checklist ' + CL_SCOPE_NAME[sc] + ' (' + sc + ')</h3>'
      + '<div class="clsum"><span class="cls ok">✓ ' + c.ok + ' đạt</span><span class="cls fail">! ' + c.fail + ' phải sửa</span><span class="cls warn">? ' + c.warn + ' nên xem</span><span class="cls todo">○ ' + (c.todo + c.recheck) + ' chờ người soát</span>' + (c.na ? '<span class="cls na">– ' + c.na + ' chưa áp dụng</span>' : '') + (sum.open ? '<span class="cls fail">' + sum.open + ' ghi chú PHẢI SỬA còn mở</span>' : '') + '</div>'
      + clLegendHTML(sc) + clReadHTML(sc)
      + '<p class="small muted">Dòng "Máy" trang tự chấm. Dòng "Người" do người thẩm định bấm Đạt hoặc Chưa đạt; chưa đạt thì ghi chú theo khuôn để người soạn sửa tay hoặc dán vào câu lệnh sửa bằng AI. Khi bài hoặc câu hỏi bị sửa, chỉ dấu Đạt ở phần bị sửa phải soát lại.</p>';
    Object.keys(CL_GROUPS[sc]).forEach(function(g){
      var rows = clRows(sc).filter(function(r){ return r.g===g; }); if(!rows.length) return;
      var bad = rows.filter(function(r){ return ev[r.c].s!=="ok" && ev[r.c].s!=="na"; }).length;
      h += '<details class="clgrp" data-k="g' + g + '"' + (keepOpen["g"+g]!==undefined ? (keepOpen["g"+g] ? " open" : "") : (bad ? " open" : "")) + '><summary><b>' + sc + "-" + g + '. ' + esc(CL_GROUPS[sc][g]) + '</b> <span class="small muted">' + (rows.length - bad) + "/" + rows.length + ' ổn</span></summary><table class="cltab"><tbody>' + rows.map(function(r){ return clRowHTML(sc, ev[r.c]); }).join("") + '</tbody></table></details>';
    });
    // ghi chú
    h += '<h3 style="margin-top:14px">Ghi chú thẩm định</h3>';
    var base = S.cl && S.cl.base && S.cl.base[sc];
    if(base && notes.length){ var Dd = clDiff({NL:sc==="NL" ? base.st : null, CH:sc==="CH" ? base.st : null}, {NL:sc==="NL" ? clStates("NL") : null, CH:sc==="CH" ? clStates("CH") : null}); if(Dd.worse.length || Dd.better.length) h += clDiffHTML(Dd, "So với lúc bắt đầu ghi chú:"); }
    var la = S.cl && S.cl.lastApply;
    if(la && la.sc===sc) h += clDiffHTML(la.diff, "Lần sửa vừa áp dụng (" + la.n + " chỗ" + (la.units.length ? ": " + la.units.join(", ") : "") + "):") + (la.keepLost.length ? '<div class="note small no">Mất phần ghi chú yêu cầu giữ: ' + la.keepLost.map(esc).join("; ") + '</div>' : '') + (S.cl.undo ? '<div><button type="button" class="btn quiet" data-clundo>Hoàn tác lần sửa này</button></div>' : '');
    h += notes.length ? '<p class="small"><b>' + notes.length + ' ghi chú</b>: ' + nOpen + ' mở · ' + notes.filter(function(n){ return n.st==="Đã sửa"; }).length + ' đã sửa · ' + notes.filter(function(n){ return n.st==="Đã xác nhận"; }).length + ' đã xác nhận.</p><div style="display:grid;gap:10px">' + notes.map(clNoteHTML).join("") + '</div>' : '<p class="small muted">Chưa có ghi chú.</p>';
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn quiet" data-clcopy="' + sc + '">Sao chép báo cáo checklist và ghi chú</button>' + (notes.length ? '<button type="button" class="btn quiet" data-clbase="' + sc + '">Lấy trạng thái hiện tại làm mốc so sánh</button>' : '') + '</div>';
    h += '<details class="box" data-k="form"' + (keepOpen.form || clForm[sc] ? " open" : "") + '><summary>' + (clForm[sc] && clForm[sc].id ? "Sửa ghi chú" : "Thêm ghi chú") + '</summary>' + clFormHTML(sc) + '</details>';
    h += '<details class="box" data-k="paste"' + (keepOpen.paste ? " open" : "") + '><summary>Dán ghi chú theo khuôn, hoặc nhập bình luận từ file Word</summary><div style="display:grid;gap:10px;margin-top:10px"><pre class="small">[Mã] · [PHẢI SỬA / GỢI Ý]\nVị trí: … | Trích: "…" | Vấn đề: … | Cần đạt: … | Đề xuất (gợi ý): … | Phạm vi: … Giữ: …</pre><textarea rows="5" data-clpaste="' + sc + '" placeholder="Dán một hoặc nhiều ghi chú; mỗi ghi chú bắt đầu bằng [Mã]."></textarea><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="btn" data-clparse="' + sc + '">Đọc ghi chú</button><label class="btn quiet">Nhập bình luận từ file Word (.docx)<input type="file" accept=".docx" data-cldocx="' + sc + '" hidden></label><span class="small muted" data-clmsg></span></div><p class="small muted">Bình luận trong Word nên mở đầu bằng [Mã] và mức, ví dụ "[CH-C5] · PHẢI SỬA · Vấn đề: …". Chỗ bôi chọn khi bình luận được lấy làm đoạn trích. Bình luận trả lời (reply) được bỏ qua.</p></div></details>';
    var pr = nOpen && sc !== "WS" ? clFixPrompt(sc) : "";
    if(sc === "WS"){ box.innerHTML = h; box.dataset.drawn = "1"; bindRemind(box); return; }
    h += '<details class="box" data-k="ai"' + (keepOpen.ai ? " open" : "") + '><summary>Sửa theo ghi chú bằng AI (' + nOpen + ' ghi chú mở)</summary><div style="display:grid;gap:10px;margin-top:10px">'
      + (nOpen ? '<p class="small muted">Câu lệnh gồm các ghi chú đang mở, các tiêu chí đang đạt kèm con số phải giữ, và các phần bị khoá. AI chỉ trả các cặp THAY / BẰNG, không trả cả bài; trang áp từng cặp khớp đúng một chỗ, rồi chấm lại toàn bộ checklist và báo tiêu chí nào bị xấu đi.</p><div style="display:flex;gap:10px"><button type="button" class="btn primary" data-clprompt="' + sc + '">Sao chép câu lệnh</button></div><details><summary class="small">Xem câu lệnh</summary><pre class="small clpre">' + esc(pr) + '</pre></details>'
        + '<textarea rows="6" data-clpatch="' + sc + '" placeholder="Dán kết quả của AI (nút Copy của khối code)">' + esc((S.cl && S.cl.patchRaw && S.cl.patchRaw[sc]) || "") + '</textarea>' + clPatchHTML(sc) : '<p class="small muted">Chưa có ghi chú mở.</p>')
      + '</div></details>';
    box.innerHTML = h; box.dataset.drawn = "1";
    ["read","legend"].forEach(function(k){ var dd = box.querySelector('details[data-k="' + k + '"]'); if(dd && keepOpen[k] !== undefined) dd.open = keepOpen[k]; });
    cmpRestore(box);
    bindRemind(box);
  });
  try{ wfRender(); }catch(e){}
  try{ cmpRenderMounts(); }catch(e){}
}
function clReport(sc){
  var ev = clEval(sc), sum = clSummary(sc, ev), L = ["CHECKLIST " + CL_SCOPE_NAME[sc].toUpperCase() + " · " + SPEC[S.spec].label + " · " + S.level + (S.code ? " · " + S.code : "") + (S.slots.topic ? " · " + S.slots.topic : ""), "Đạt " + sum.cnt.ok + " · Phải sửa " + sum.cnt.fail + " · Nên xem " + sum.cnt.warn + " · Chờ người soát " + (sum.cnt.todo + sum.cnt.recheck) + " · Chưa áp dụng " + sum.cnt.na, ""];
  clRows(sc).forEach(function(r){ var e = ev[r.c]; L.push(r.c + " | " + CL_SLAB[e.s] + " | " + r.t + (e.d ? " | " + e.d : "") + (e.stale ? " | soát lại: " + e.stale.join(", ") : "")); });
  var notes = clNotes(sc); if(notes.length){ L.push("", "GHI CHÚ"); notes.forEach(function(n){ L.push(clNoteText(n) + " | Trạng thái: " + n.st + (n.by ? " | " + n.by : "")); }); }
  return L.join("\n");
}
function clSummaryLine(sc){ var s = clSummary(sc); return "đạt " + s.cnt.ok + ", phải sửa " + s.cnt.fail + ", nên xem " + s.cnt.warn + ", chờ người soát " + (s.cnt.todo + s.cnt.recheck) + (s.open ? ", " + s.open + " ghi chú PHẢI SỬA còn mở" : ""); }
function clFormRead(box){ var f = {}; box.querySelectorAll("[data-ff]").forEach(function(el){ f[el.getAttribute("data-ff")] = el.value.trim(); }); return f; }
function bindCl(){
  document.addEventListener("click", function(ev){
    var t = ev.target.closest("button, [data-cltick]"); if(!t || !t.closest("[data-cl]")) return;
    var box = t.closest("[data-cl]"), sc = box.getAttribute("data-cl"), a;
    if((a = t.getAttribute("data-cltick"))){
      var r = CL_ROWS[sc].filter(function(x){ return x.c===a; })[0], v = t.getAttribute("data-v"), tk = clTicks();
      if(tk[a] && tk[a].v===v && !(v==="ok" && clStale(r, tk[a]).length)) delete tk[a]; else tk[a] = {v:v, sig:clSig(r), at:Date.now(), by:wfMe(), dev:wfDevOn()};
      save(); if(v==="no" && tk[a]){ clForm[sc] = {code:a, sev:"PHẢI SỬA"}; clRender(); var fm = box.querySelector('[data-k="form"]'); if(fm){ fm.open = true; fm.scrollIntoView({block:"center"}); } } else clRender();
      updateStepper(); return;
    }
    if((a = t.getAttribute("data-clnote"))){ clForm[sc] = {code:a, sev:"PHẢI SỬA"}; clRender(); var f2 = box.querySelector('[data-k="form"]'); if(f2){ f2.open = true; f2.scrollIntoView({block:"center"}); var q = f2.querySelector('[data-ff="loc"]'); if(q) q.focus(); } return; }
    if(t.hasAttribute("data-fsave")){
      var fb = box.querySelector("[data-clform]"), f = clFormRead(fb), msg = fb.querySelector("[data-fmsg]");
      if(!f.issue){ msg.textContent = "Cần ghi Vấn đề."; return; }
      if(!f.quote && !f.loc){ msg.textContent = "Cần ghi Trích (nguyên văn) hoặc Vị trí."; return; }
      var ed = clForm[sc] && clForm[sc].id;
      if(ed){ var n0 = (S.notes||[]).filter(function(x){ return x.id===ed; })[0]; if(n0){ Object.keys(f).forEach(function(k){ n0[k] = f[k]; }); n0.sevGuess = false; } save(); }
      else clAddNotes([f], sc, "tay");
      clForm[sc] = null; clRender(); updateStepper(); return;
    }
    if(t.hasAttribute("data-fcancel")){ clForm[sc] = null; clRender(); return; }
    if((a = t.getAttribute("data-nedit"))){ var n1 = (S.notes||[]).filter(function(x){ return x.id===a; })[0]; if(n1){ clForm[sc] = JSON.parse(JSON.stringify(n1)); clRender(); var f3 = box.querySelector('[data-k="form"]'); if(f3){ f3.open = true; f3.scrollIntoView({block:"center"}); } } return; }
    if((a = t.getAttribute("data-ndel"))){ S.notes = (S.notes||[]).filter(function(x){ return x.id!==a; }); save(); clRender(); updateStepper(); return; }
    if(t.hasAttribute("data-clparse")){
      var ta = box.querySelector("[data-clpaste]"), L = clParseNotes(ta.value), m = box.querySelector("[data-clmsg]");
      if(!L.length){ m.textContent = "Không đọc được ghi chú nào: mỗi ghi chú cần mở đầu bằng [Mã], ví dụ [NL-B6]."; return; }
      var k = clAddNotes(L, sc, "dán"); ta.value = ""; clRender(); updateStepper(); toast("Đã thêm " + k + " ghi chú."); return;
    }
    if(t.hasAttribute("data-clread")){ clReadMark(sc); clRender(); toast("Đã ghi nhận đọc toàn " + (sc === "CH" ? "bộ" : "bài") + "."); return; }
    if(t.hasAttribute("data-clcopy")){ copyText(clReport(sc), t, "Sao chép báo cáo checklist và ghi chú"); return; }
    if(t.hasAttribute("data-clbase")){ S.cl = S.cl || {}; S.cl.base = S.cl.base || {}; S.cl.base[sc] = {at:Date.now(), st:clStates(sc)}; save(); clRender(); toast("Đã lấy trạng thái hiện tại làm mốc."); return; }
    if(t.hasAttribute("data-clprompt")){ copyText(clFixPrompt(sc, true), t, "Sao chép câu lệnh", "Đã sao chép. Dán vào AI, rồi dán kết quả vào ô bên dưới"); return; }
    if(t.hasAttribute("data-papply")){ clApplyPatches(sc); updateStepper(); return; }
    if(t.hasAttribute("data-clundo")){ clUndo(); updateStepper(); return; }
  });
  document.addEventListener("change", function(ev){
    var t = ev.target; if(!t.closest || !t.closest("[data-cl]")) return;
    var sc = t.closest("[data-cl]").getAttribute("data-cl"), a;
    if((a = t.getAttribute("data-nst"))){ var n = (S.notes||[]).filter(function(x){ return x.id===a; })[0]; if(n){ n.st = t.value; save(); clRender(); updateStepper(); } return; }
    if((a = t.getAttribute("data-pon"))!==null && clPatchState[sc]){ clPatchState[sc].patches[+a].on = t.checked; return; }
    if(t.hasAttribute("data-cldocx") && t.files && t.files[0]){
      var m = t.closest("[data-cl]").querySelector("[data-clmsg]"), file = t.files[0];
      m.textContent = "Đang đọc " + file.name + "…";
      file.arrayBuffer().then(clDocxComments).then(function(list){
        if(!list.length){ m.textContent = "File không có bình luận nào."; return; }
        var k = clAddNotes(list.map(clCommentToNote), sc, "Word: " + file.name); clRender(); updateStepper(); toast("Đã nhập " + k + " bình luận từ Word.");
      }).catch(function(e){ m.textContent = "Không đọc được file: " + (e && e.message || e); });
      t.value = ""; return;
    }
  });
  document.addEventListener("click", function(ev){
    var sn = ev.target.closest && ev.target.closest(".clalign .clsen"); if(!sn) return;
    var al = sn.closest(".clalign"), on = sn.classList.contains("clfocus");
    al.querySelectorAll(".clfocus").forEach(function(x){ x.classList.remove("clfocus"); });
    if(on) return;
    sn.classList.add("clfocus");
    var ids = (sn.getAttribute("data-pair") || "").split(" ").filter(Boolean), first = null;
    ids.forEach(function(id){ var o = al.querySelector('[data-sid="' + id + '"]'); if(o){ o.classList.add("clfocus"); if(!first) first = o; } });
    if(first){ var pn = first.closest(".clreadtxt"); var off = first.getBoundingClientRect().top - pn.getBoundingClientRect().top + pn.scrollTop; pn.scrollTop = Math.max(0, off - pn.clientHeight / 3); }
  });
  document.addEventListener("mouseover", function(ev){
    var k = ev.target.closest && ev.target.closest(".clalign .clkw"); var al = ev.target.closest && ev.target.closest(".clalign"); if(!al) return;
    al.querySelectorAll(".kwon").forEach(function(x){ x.classList.remove("kwon"); });
    if(k){ var key = k.getAttribute("data-kw"); al.querySelectorAll('.clkw[data-kw="' + key.replace(/"/g, '\\"') + '"]').forEach(function(x){ x.classList.add("kwon"); }); }
  });
  var pt, stt; document.addEventListener("input", function(ev){
    var t = ev.target;
    if(!t.getAttribute || !t.hasAttribute("data-clpatch")) return;
    var sc = t.getAttribute("data-clpatch"); S.cl = S.cl || {}; S.cl.patchRaw = S.cl.patchRaw || {}; S.cl.patchRaw[sc] = t.value; save();
    clearTimeout(pt); pt = setTimeout(function(){ clPatchState[sc] = null; var y = window.scrollY; clRender(); window.scrollTo(0, y); var ta = document.querySelector('[data-clpatch="' + sc + '"]'); if(ta){ ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; } }, 400);
  });
}

/* ---- tư liệu đối chiếu cho người thẩm định (mở ở từng dòng "Người") ---- */
var clAidOpen = {};
var CL_AIDS = {"NL-C6":1,"NL-A1":1,"NL-A2":1,"NL-A3":1,"NL-A4":1,"NL-A6":1,"NL-C1":1,"NL-C2":1,"NL-C3":1,"NL-C4":1,"NL-C5":1,"NL-D2":1,"NL-D5":1,"CH-D5":1,"CH-E5":1};
function clSrcText(){ var pdf = S.srcMode === "pdf" && S.srcLang !== "vi"; return (pdf ? S.slots.srcPdfText : S.slots.src) || ""; }
function clSents(t){ return [].concat.apply([], (t||"").split(/\n+/).map(function(par){ return (par.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || []); })).map(function(x){ return x.trim(); }).filter(Boolean); }
function clMark(s, list){ var h = esc(s); list.forEach(function(w){ if(!w) return; var e = esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), re = new RegExp((/^\w/.test(w) ? "\\b" : "") + "(" + e + ")" + (/\w$/.test(w) ? "\\b" : ""), "g" + (/^[a-z]/.test(w) ? "i" : "")); h = h.replace(re, "<mark>$1</mark>"); }); return h; }
// tiếng đệm của văn nói (viết hoa đầu câu nhưng không phải tên riêng); thứ trong tuần thường là chi tiết bối cảnh người soạn thêm
var CL_FILLER = /^(uh|um|umm|uhm|er|erm|hmm|hm|mm|mhm|ah|oh|eh|huh|wow|yeah|yep|okay|ok|alright|right|so|well|now|anyway)$/i;
var CL_DAYS = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?$/i;
// con số viết bằng chữ ở nguồn: 10 = ten, 35 = thirty-five
var CL_NW1 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "), CL_NW10 = ",,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety".split(",");
function clNumWords(n){
  n = parseInt(n, 10); if(isNaN(n) || n < 0 || n > 999) return [];
  var w = function(k){ if(k < 20) return [CL_NW1[k]]; var t = CL_NW10[Math.floor(k / 10)], u = k % 10; return u ? [t + "-" + CL_NW1[u], t + " " + CL_NW1[u]] : [t]; };
  if(n < 100) return w(n);
  var h = CL_NW1[Math.floor(n / 100)] + " hundred", r = n % 100; if(!r) return [h, "a hundred"].slice(0, Math.floor(n / 100) === 1 ? 2 : 1);
  return w(r).map(function(x){ return h + " and " + x; }).concat(w(r).map(function(x){ return h + " " + x; }));
}
function clFacts(text){
  var out = [], seen = {};
  clSents(text).forEach(function(s){
    (s.match(/\b\d[\d,.:]*\d%?|\b\d%?/g) || []).forEach(function(n){ var k = "n:" + n; if(!seen[k]){ seen[k] = 1; out.push({t:"số", v:n, s:s}); } });
    var ws = s.split(/\s+/), i = 0, clean = function(t){ return (t||"").replace(/^[("“'‘]+|[)"”'’.,;:!?]+$/g, ""); }, endP = function(t){ return /[.,;:!?)"”]$/.test(t||""); };
    var common = function(w){ var b = w.toLowerCase().replace(/’/g, "'").replace(/n't$/, "").replace(/'(ll|re|ve|d|s|m)$/, ""); if(/^(we|you|they|he|she|it|i|that|there|here|what|who|let|don|doesn|didn|isn|aren|wasn|weren|can|couldn|won|wouldn|shouldn)$/.test(b)) return true; try{ var l = lexLemma(b); return l !== null && LEXM[l] !== undefined; }catch(e){ return false; } };
    var start = 0;
    while(i < ws.length){
      var w = clean(ws[i]);
      // chữ cái đứng một mình (không phải I, A): thường là nhãn người nói còn sót, ví dụ "L Also, ..."
      if(/^[B-HJ-Z]$/.test(w)){ var k3 = "x:" + i + ":" + s; if(!seen[k3]){ seen[k3] = 1; out.push({t:"ký tự lạc", v:w, s:s, stray:true}); } if(i === start) start = i + 1; i++; continue; }
      if(/^[A-Z][a-zA-Z'’-]+$/.test(w) && w !== "I" && !CL_FILLER.test(w) && (i > start || !common(w))){
        var run = [w], j = i + 1;
        if(!endP(ws[i])) while(j < ws.length){ var w2 = clean(ws[j]); if(/^[A-Z][a-zA-Z'’-]*$/.test(w2)){ run.push(w2); j++; if(endP(ws[j-1])) break; } else break; }
        var v = run.join(" "), k2 = "p:" + v;
        if(!seen[k2]){ seen[k2] = 1; out.push(CL_DAYS.test(v) ? {t:"ngày", v:v, s:s, ctx:true} : {t:"tên", v:v, s:s}); }
        i = j; continue;
      }
      i++;
    }
  });
  return out;
}
function clKwBag(t){ var o = {}; String(t || "").toLowerCase().replace(/[’']/g, "'").split(/[^a-z0-9'-]+/).forEach(function(w){ w = w.replace(/^'+|'+$/g, ""); if(w.length < 3 || CL_COMMONKW[w] || /^(the|and|for|with|from|that|this|are|was|were|has|had|its|our|can|may|not|but|who|how|why|one|per)$/.test(w)) return; var l = w; try{ var lm = lexLemma(w); if(lm) l = lm; }catch(e){} o[l.replace(/(ies|es|s)$/, "")] = 1; }); return o; }
function clInSrc(src, f){
  var sN = src.replace(/(\d),(\d)/g, "$1$2"), v = f.v.replace(/(\d),(\d)/g, "$1$2");
  var ss = clSents(src);
  // nhiều câu nguồn cùng chứa con số / tên: lấy câu giống câu trong bài nhất (nhiều từ nội dung chung nhất), không lấy câu đầu tiên gặp
  var nw = f.t === "số" && /^\d+%?$/.test(v) ? clNumWords(v.replace("%", "")) : [], nwRe = nw.length ? new RegExp("\\b(" + nw.join("|") + ")\\b", "i") : null;
  var hits = ss.filter(function(y){ var x = y.replace(/(\d),(\d)/g, "$1$2"); return f.t === "số" ? new RegExp("(^|[^\\d])" + v.replace(/[.%]/g, "\\$&") + "($|[^\\d])").test(x) || !!(nwRe && nwRe.test(x)) : x.indexOf(v) >= 0; });
  if(hits.length > 1 && f.s){
    var bag = clKwBag(f.s); hits = hits.map(function(y, i){ var b = clKwBag(y), n = 0; Object.keys(bag).forEach(function(k){ if(b[k]) n++; }); return {y:y, n:n, i:i}; }).sort(function(a, b){ return b.n - a.n || a.i - b.i; }).map(function(o){ return o.y; });
  }
  if(hits.length) return hits[0];
  return sN.indexOf(v) >= 0 ? "(có trong nguồn)" : "";
}
// bài nói: gọi người nghe (we, you, our) là tự nhiên nên không bắt; chỉ bắt chỗ nêu ý kiến, cảm xúc riêng
var CL_EDIT_RE_L = /\b(I think|I believe|I feel|I found|I find|I'd say|I guess|I suppose|I reckon|in my (?:view|opinion)|personally|honestly|frankly|to be honest|interestingly|surprisingly|clearly|obviously|unfortunately|fortunately|remarkably|undoubtedly|sadly|amazing(?:ly)?|wonderful|terrible|fantastic|incredibl[ey]|shocking|appalling|ingenious|brilliant|awful|disappointing|fascinating|ridiculous|pointless|a drop in the ocean|should|must|ought to)\b|[!]/gi;
var CL_EDIT_RE = /\b(I|I'm|I've|I'd|we|we're|we've|our|ours|us|you|your|interestingly|surprisingly|clearly|obviously|of course|unfortunately|fortunately|remarkably|importantly|undoubtedly|certainly|sadly|amazing(?:ly)?|wonderful|terrible|fantastic|incredibl[ey]|shocking|should|must|ought to|in my opinion|I think|I believe)\b|[!]/gi;
function clTbl(rows, head){ return '<table class="cltab claidt">' + (head ? '<thead><tr>' + head.map(function(h){ return '<th>' + h + '</th>'; }).join("") + '</tr></thead>' : '') + '<tbody>' + rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table>'; }
function clParasOf(){ var d = S.slots.draft || ""; return qIsR() ? analyze(d).body.map(function(b){ return b.text; }) : d.split(/\n/).map(function(s){ return s.trim(); }).filter(Boolean); }
function clAid(code){
  var d = S.slots.draft || "", src = clSrcText(), sp = SPEC[S.spec], url = typeof libUrl === "function" ? libUrl() : "";
  var srcNote = !src.trim() ? '<p class="small no">Chưa có văn bản nguồn ở bước Nguồn nên không đối chiếu tự động được. Mở nguồn gốc' + (url ? ' (<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a>)' : '') + ' để xét.</p>' : (S.srcLang === "vi" ? '<p class="small muted">Nguồn là tiếng Việt: trang chỉ đối chiếu được con số; tên riêng và ý thì người thẩm định tự so.</p>' : '');
  var E, rows;
  switch(code){
    case "NL-A1": return '<p><b>Phần thi:</b> ' + esc(sp.label) + ' · <b>Theme của Part:</b> ' + esc(sp.genre || "") + '</p><p><b>Chủ đề bài:</b> ' + esc(S.slots.topic || "(chưa ghi)") + '</p>' + (qIsR() ? '<p><b>Tiêu đề:</b> ' + esc((analyze(d).titles[0] || {}).text || "(chưa có)") + '</p>' : '');
    case "NL-A2": case "NL-A3": return '<p><b>Chủ đề:</b> ' + esc(S.slots.topic || "(chưa ghi)") + '</p>' + (d.trim() ? '<p class="small"><b>Đoạn đầu của bài:</b> ' + esc(clParasOf()[0] || "") + '</p>' : '') + (code === "NL-A3" ? '<p class="small muted">Cách xét: che bài, đọc chủ đề; nếu người có hiểu biết phổ thông trả lời được phần lớn chỗ định hỏi thì chưa đạt.</p>' : '<p class="small muted">Cách xét: chủ đề có chạm chính trị, tôn giáo, sắc tộc, bệnh tật, tai nạn, thiên tai gây thương vong, hay điều có thể làm một nhóm thí sinh khó chịu không.</p>');
    case "NL-A4": var f = S.fields || {}; return clTbl([["Tên nguồn", esc(f["pc-src"] || "(chưa ghi)")], ["Link", url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a>' : "(chưa có)"], ["Giấy phép", esc(f["pc-lic"] || "(chưa ghi)")]]);
    case "NL-A6": if(!src.trim()) return srcNote; var fs = clFacts(src); return '<p>Nguồn dài <b>' + src.trim().split(/\s+/).length + ' từ</b>, có <b>' + fs.length + ' dữ kiện</b> máy nhận ra (con số, tên riêng; cần khoảng 8–12 thông tin kiểm tra được):</p><p class="small">' + fs.slice(0, 40).map(function(x){ return esc(x.v); }).join(" · ") + '</p>';
    case "NL-C1":
      if(!d.trim()) return "";
      return srcNote + clFactTable(clParasOf(), src, "nguồn") + '<p class="small muted">Đối chiếu cả câu: mở khung Đọc toàn bài ở đầu checklist (tô màu từ khoá chung, câu tương ứng).</p>';
    case "NL-C2":
      if(!d.trim()) return "";
      return clEditTable(d, src, "nguồn");
    case "NL-C3":
      return clTbl(clParasOf().map(function(p, i){ var ss = clSents(p); return ["<b>" + (i+1) + "</b>", "<b>" + esc(ss[0] || "") + "</b> " + '<span class="muted">' + esc(ss.slice(1).join(" ")) + '</span>', p.split(/\s+/).length + " từ"]; }), ["Đoạn", "Câu đầu (in đậm) và phần còn lại", "Độ dài"]) + '<p class="small muted">Cách xét: câu đầu nêu ý chính; các câu sau chỉ triển khai ý đó.</p>';
    case "NL-C4":
      return '<ol class="small">' + clParasOf().map(function(l){ return '<li>' + esc(l) + '</li>'; }).join("") + '</ol><p class="small muted">Cách xét: đọc to từng lượt lời; chỗ nào nghe như văn viết (câu quá dài, từ nối kiểu bài luận, không có ngập ngừng hay đáp lời) thì ghi chú.</p>';
    case "NL-C6": return clUsageHTML();
    case "NL-C5": case "NL-D2": case "NL-D5":
      E = mapEval(); if(!E.res.some(function(x){ return x.v.q; })) return '<p class="small no">Chưa có bản đồ chất liệu.</p>';
      rows = E.res.map(function(x, i){ var v = x.v; return ["<b>" + (i+1) + "</b><div class='small muted'>" + esc(x.l.lv + " " + x.l.m) + "</div>", esc(x.code || "?") + (v.w ? "<div class='small'>từ: <b>" + esc(v.w) + "</b></div>" : "") + (x.para ? "<div class='small muted'>đoạn " + x.para + "</div>" : ""), code === "NL-D5" ? esc(v.dis || "(chưa có)") : esc(v.q || "") + (v.alt ? "<div class='small muted'>Dự phòng: " + esc(v.alt) + "</div>" : ""), x.msgs.length ? '<span class="small ' + (x.s === "fail" ? "no" : "warnc") + '">' + x.msgs.map(esc).join("; ") + '</span>' : '<span class="small ok">máy kiểm ổn</span>']; });
      return clTbl(rows, ["Dòng", "Mã", code === "NL-D5" ? "Chất liệu nhiễu" : "Chỗ hỏi", "Máy kiểm"]) + '<p class="small muted">' + (code === "NL-C5" ? "Cách xét: che bài, chỉ đọc từng chỗ hỏi như một câu hỏi; nếu đoán được bằng hiểu biết thông thường thì ghi chú dòng đó." : code === "NL-D2" ? "Cách xét: chỗ hỏi có đúng điều kiện của mã không (IN phải suy ra mới thấy; VO đoán được nghĩa từ ngữ cảnh; RE có tiền ngữ không đứng ngay trước; RP nói được mục đích; DE bậc 3 tường minh)." : "Cách xét: mỗi trích dẫn có đủ gần để làm phương án sai hợp lý, không sai hiển nhiên.") + '</p>';
    case "CH-D5":
      return clTbl(wfQItems().map(function(it){ return ["<b>" + it.n + "</b>", esc(it.code || ""), esc(it.stem || ""), '<span class="small muted">' + esc(R_STEMS[it.code] || "(không có mẫu)") + '</span>']; }), ["Câu", "Mã", "Câu hỏi", "Mẫu trong Guidelines"]);
    case "CH-E5":
      return clTbl(wfQItems().map(function(it){ return ["<b>" + it.n + "</b>", esc(it.stem || ""), esc(it.ans || "") + ". " + esc((it.opts || {})[it.ans] || "")]; }), ["Câu", "Câu hỏi", "Đáp án"]) + '<p class="small muted">Cách xét: đọc lần lượt; câu hỏi hoặc phương án của câu nào nhắc lại, gợi ý đáp án của câu khác thì ghi chú.</p>';
  }
  return "";
}
document.addEventListener("toggle", function(e){
  var dt = e.target; if(!dt.classList || !dt.classList.contains("claid")) return;
  var c = dt.getAttribute("data-aid"); clAidOpen[c] = dt.open;
  if(dt.open){ var b = dt.querySelector(".claidb"); try{ b.innerHTML = clAid(c) || '<p class="small muted">Chưa có gì để đối chiếu.</p>'; }catch(x){ b.textContent = "Không dựng được bảng đối chiếu."; } }
}, true);

/* ---- không nghe thừa (bài Nghe): câu nào đã được dùng làm chỗ hỏi hoặc nhiễu ---- */
// câu đệm (chuyển ý, nhắc lại, hỏi lại, xác nhận): mọi từ nội dung và con số đều đã có ở câu khác của bài, nên câu không mang thông tin mới
// (dung hoà "không nghe thừa" của Bộ với khoảng đệm giữa hai chỗ hỏi của tập huấn Viết Listening items)
var clUsageSents = null;
var CL_DISC = /^(turn|turning|move|moving|look|looking|start|starting|talk|talking|focus|next|first|second|third|then|finally|lastly|point|points|part|topic|thing|things|bit|idea|mean|means|meant|think|know|said|mentioned|earlier|remember|okay|alright|right|really|actually|basically|anyway|quickly|briefly|again|back|well|just|let|lets|let's|that's|here|there|what|sure|clear|make|sense|everyone|everybody|guys|folks|today|now|recap|summary|remind|reminder|repeat|again|said|saying|note|noted|mind|keep)$/;
function clNoNewInfo(x, i){
  var S2 = clUsageSents || []; var cw = function(t){ return qNorm(t).trim().split(" ").filter(function(w){ return /\d/.test(w) || (w.length > 3 && Q_STOP.indexOf(" " + w + " ") < 0 && !CL_DISC.test(w)); }).map(qStem); };
  var mine = cw(x.s); if(!mine.length) return true;
  var other = {}; S2.forEach(function(y, j){ if(j !== i) cw(y.s).forEach(function(w){ other[w] = 1; }); });
  return mine.every(function(w){ return other[w]; });
}
function clUsage(){
  var d = S.slots.draft || ""; if(!d.trim()) return [];
  var passN = qNorm(d), sents = [], cur = 0, words = 0;
  d.split(/\n+/).forEach(function(line, li){
    var lab = (line.match(/^\s*([A-Z][\w .'’-]{0,24}):\s*/) || [""])[0], body = line.slice(lab.length);
    clSents(body).forEach(function(s, si){
      var n = qNorm(s).trim(); if(!n) return;
      var p = passN.indexOf(" " + n + " ", cur); if(p < 0) p = passN.indexOf(" " + n + " ");
      var span = p >= 0 ? [p, p + n.length + 1] : null; if(p >= 0) cur = p + n.length;
      var wc = n.split(" ").length;
      sents.push({line:li + 1, lab:lab.replace(/:\s*$/, "").trim(), s:s, span:span, w0:words, wc:wc, uses:[]}); words += wc;
    });
  });
  var add = function(q, tag){ if(!q) return; var sp = qSpanOf(passN, q); if(!sp) return; sents.forEach(function(x){ if(x.span && x.span[0] < sp[1] && sp[0] < x.span[1] && x.uses.indexOf(tag) < 0) x.uses.push(tag); }); };
  try{ mapEval().res.forEach(function(x){ var v = x.v, k = "dòng " + (x.idx + 1); add(v.q, "chỗ hỏi " + k); add(v.alt, "dự phòng " + k); mapQuotes(v.dis).forEach(function(q){ add(q, "nhiễu " + k); }); }); }catch(e){}
  var items = []; try{ items = wfQItems(); }catch(e){}
  items.forEach(function(it){
    add(it.basis, "căn cứ câu " + it.n);
    ["A","B","C","D"].forEach(function(k){
      if(k === it.ans) return; var o = (it.opts || {})[k]; if(!o) return;
      var cw = qNorm(o).trim().split(" ").filter(function(w){ return w.length > 3 && Q_STOP.indexOf(" " + w + " ") < 0; }).map(qStem);
      if(!cw.length) return;
      sents.forEach(function(x){ var sw = {}; qNorm(x.s).trim().split(" ").forEach(function(w){ sw[qStem(w)] = 1; }); var hit = cw.filter(function(w){ return sw[w]; }).length; if(hit >= Math.min(2, cw.length) && x.uses.indexOf("nhiễu câu " + it.n) < 0) x.uses.push("có thể là nhiễu câu " + it.n + " (" + k + ")"); });
    });
  });
  clUsageSents = sents;
  var firstUsed = sents.findIndex(function(x){ return x.uses.length; });
  sents.forEach(function(x, i){
    if(x.uses.length) return;
    if(x.wc <= 3) x.ex = "lượt đáp ngắn";
    else if(/^(hi|hello|hey|good (morning|afternoon|evening)|welcome|thanks|thank you|bye|goodbye|see you|nice to)\b/i.test(x.s.replace(/^[^a-z]*/i, ""))) x.ex = "chào hỏi";
    else if(i < (firstUsed < 0 ? 0 : firstUsed) && x.w0 < 60) x.ex = "mở đầu";
    else if(/\?\s*["”’)]*$/.test(x.s) && sents.slice(i + 1, i + 3).some(function(y){ return y.uses.length && y.line !== x.line; })) x.ex = "câu hỏi dẫn vào ý được dùng";
    else if(clNoNewInfo(x, i)) x.ex = "đệm: không mang thông tin mới";
  });
  return sents;
}
function clUsageHTML(){
  var U = clUsage(); if(!U.length) return "";
  var content = U.filter(function(x){ return !x.ex; }), used = content.filter(function(x){ return x.uses.length; }), unused = content.filter(function(x){ return !x.uses.length; });
  var hasMap = U.some(function(x){ return x.uses.some(function(u){ return /^(chỗ hỏi|dự phòng|nhiễu) dòng/.test(u); }); });
  return '<p class="small">' + used.length + "/" + content.length + ' câu có nội dung đã thấy dùng làm chỗ hỏi, căn cứ hoặc nhiễu' + (unused.length ? '; <b class="warnc">' + unused.length + ' câu chưa thấy dùng</b> (tô xám)' : '') + '. Không tính lời chào, lượt đáp ngắn, câu mở đầu trước chỗ hỏi đầu tiên, câu hỏi dẫn vào ý được dùng. Đây là số đếm để người xét tham khảo, không có ngưỡng.</p>'
    + (!hasMap ? '<p class="small no">Chưa có bản đồ chất liệu: máy chỉ dựa vào câu hỏi (nếu có).</p>' : '')
    + clTbl(U.map(function(x){ return ['<span class="small muted">' + x.line + '</span>', (x.lab ? '<b class="small">' + esc(x.lab) + ':</b> ' : '') + '<span class="' + (!x.uses.length && !x.ex ? "clunused" : "") + '">' + esc(x.s) + '</span>', x.uses.length ? '<span class="small ok">' + esc(x.uses.join("; ")) + '</span>' : (x.ex ? '<span class="small muted">' + esc(x.ex) + '</span>' : '<span class="small warnc">chưa thấy dùng</span>')]; }), ["Dòng", "Câu", "Dùng làm"])
    + '<p class="small muted">Cách xét (hướng dẫn của Bộ: không nghe thừa): câu xám nào chứa thông tin mà không làm đáp án hay nhiễu cho câu hỏi nào thì ghi chú để cắt, hoặc biến thành nhiễu cho câu hỏi gần đó. Câu đệm giữa hai chỗ hỏi (chuyển ý, nhắc lại, hỏi lại, xác nhận) không tính là thừa nếu không mang thông tin mới: máy không tô xám câu có mọi từ nội dung và con số đã xuất hiện ở câu khác. Máy chỉ so theo chữ, nên phương án diễn đạt lại có thể không được nhận ra.</p>';
}

;
/* ================= Bảng level CEFR của bài (bản gốc và bản đã sửa) =================
   Nick chốt 13/11/2026 (hướng 1): level tổng lấy từ Cathoven CEFR Checker (có ảnh minh chứng), không do trang tự tính.
   Trang chỉ đo các chỉ số có nguồn quy đổi công bố:
   - Từ vựng: mức ở ngưỡng phủ 95% (bỏ qua từ ngoài danh sách), CEFR-J Wordlist 1.5 + Octanove C1/C2. Gợi ý.
   - Độ dài câu trung bình: Khalifa và Weir (2009), bài đọc Cambridge KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6. Tham khảo.
   - Flesch Reading Ease: bảng quy đổi Flesch–CEFR của Linguapress.
   Bộ nhận diện ngữ pháp (hướng 2) cất ở src/_off/cefr_grammar.js, không ghép vào trang. */
var KW_ASL = [["A2",13.2],["B1",14.9],["B2",18.4],["C1",18.6],["C2",19.6]];
function aslBracket(asl){
  if(asl <= KW_ASL[0][1]) return {lo:0, hi:1, txt:"A2 trở xuống"};
  for(var i = 1; i < KW_ASL.length; i++) if(asl <= KW_ASL[i][1]) return {lo:LVL.indexOf(KW_ASL[i-1][0]), hi:LVL.indexOf(KW_ASL[i][0]), txt:KW_ASL[i-1][0] + "–" + KW_ASL[i][0]};
  return {lo:5, hi:5, txt:"C2"};
}
function sbText(which){ return which === "o" ? (S.srcLang === "vi" ? "" : (S.slots.src || S.slots.srcPdfText || "")) : (S.slots.draft || ""); }
function sbSig(which){ var t = sbText(which); return t.trim() ? t.length + ":" + qHash(t) : ""; }
var sbCache = {};
function sbData(which){
  var t = sbText(which), k = which + "|" + sbSig(which);
  if(sbCache[which] && sbCache[which].k === k) return sbCache[which].d;
  var d = null;
  if(t.trim()){ try{ var vp = vocabProfile(t), f = fleschOf(t); d = {voc:vp.N ? vp.lvl95In : null, voc98:vp.N ? easyLvl(vp) : null, asl:f.ok ? f.asl : null, fre:f.ok ? f.fre : null}; }catch(e){ d = null; } }
  sbCache[which] = {k:k, d:d}; return d;
}
var SB_EXT = [["ca","Cathoven General Level","Tham khảo, ghi vào ô Level của file nộp. Miễn phí đến 250 từ; tài khoản miễn phí đến 500 từ"],["rg","roadtogrammar","Tham khảo. Miễn phí; chỉ dựa vào từ vựng"],["ti","Text Inspector Scorecard","Tham khảo. Gói trả phí (Standard)"]];
function sbParse(v){ var m = String(v || "").toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/); return m ? LVL.indexOf(m[1]) : null; }
function sbExt(which, key){ var e = (S.cefrExt || {})[which] || {}; return {v:e[key] || "", lv:sbParse(e[key]), stale:!!(e[key] && e[key + "Sig"] && e[key + "Sig"] !== sbSig(which))}; }
/* level Cathoven của bản đã sửa, dùng cho NL-B12 và câu lệnh sửa */
function cathovenNow(){ var x = sbExt("a", "ca"); return x.v ? x : null; }
function sbLvName(i){ return i === null || i === undefined || i < 0 ? "—" : (i >= 6 ? "trên C2" : LVL[i]); }
function sbCls(lo, hi, ti){ if(lo === null || lo === undefined) return "na"; if(hi === undefined) hi = lo; return hi < ti ? "lo" : (lo > ti ? "hi" : "ok"); }
function sbChip(txt, cls, tip){ return '<span class="sblv ' + cls + '"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(txt) + '</span>'; }
function sbHTML(){
  var ti = LVL.indexOf(S.level), O = sbData("o"), A = sbData("a"), isL = SPEC[S.spec] && SPEC[S.spec].skill === "L";
  function cell(D, fn){ return '<td>' + (D ? fn(D) : sbChip("—", "na", "Chưa có bài")) + '</td>'; }
  function vocC(D){ return sbChip(sbLvName(D.voc), sbCls(D.voc, D.voc, ti)); }
  function voc98C(D){ return sbChip(sbLvName(D.voc98), D.voc98 === null ? "na" : (D.voc98 < ti ? "lo" : "ok"), "Chặn dưới: chỉ cần không thấp hơn " + LVL[ti] + "; cao hơn không bị trừ ở dòng này"); }
  function aslC(D){ if(D.asl === null) return sbChip("—", "na", "Bài quá ngắn để tính"); var b = aslBracket(D.asl); return sbChip(b.txt, sbCls(b.lo, b.hi, ti)) + '<div class="sbsub">' + D.asl.toFixed(1).replace(".", ",") + ' từ</div>'; }
  function freC(D){ if(D.fre === null) return sbChip("—", "na", "Bài quá ngắn để tính"); var lv = LVL.indexOf(freBand(D.fre)[2]); return sbChip(LVL[lv], sbCls(lv, lv, ti)) + '<div class="sbsub">' + D.fre.toFixed(1).replace(".", ",") + '</div>'; }
  var rows = [];
  rows.push('<tr class="sbgrp"><td colspan="4">Trang tự đo</td></tr>');
  rows.push('<tr><td>Từ vựng ở ngưỡng 95%<div class="sbsub">mức thấp nhất phủ được 95% bài; ngưỡng của bài Đọc</div></td>' + cell(O, vocC) + cell(A, vocC) + '<td class="sbsrc">CEFR-J Wordlist 1.5 + Octanove C1/C2, bỏ qua từ ngoài danh sách (như ô "Mức ở ngưỡng 95%" của EC Text Profiler)</td></tr>');
  rows.push('<tr><td>Từ vựng ở ngưỡng 96%<div class="sbsub">chặn dưới "không dễ quá" (NL-B4), tính cả từ ngoài danh sách là từ khó: không thấp hơn mức mục tiêu</div></td>' + cell(O, voc98C) + cell(A, voc98C) + '<td class="sbsrc">Cùng danh sách; từ ngoài danh sách tính là từ khó, giống Cathoven xếp từ không nhận ra ở mức trên C2; tên riêng không tính. Ngưỡng 96%: quy ước nhóm sau thử nghiệm 42 bài đối chiếu Cathoven (nhận đúng 80% bài đúng mức, để lọt 7% bài dưới mức)</td></tr>');
  rows.push('<tr><td>Flesch Reading Ease</td>' + cell(O, freC) + cell(A, freC) + '<td class="sbsrc">Bảng quy đổi Flesch–CEFR của Linguapress: 90–100 A1 · 80–90 A2 · 70–80 B1 · 60–70 B2 · 50–60 C1 · dưới 50 C2' + (isL ? '. Linguapress lưu ý Flesch chấm hội thoại dễ hơn thực tế' : '') + '</td></tr>');
  rows.push('<tr><td>Độ dài câu trung bình<div class="sbsub">tham khảo: không tách được B2 với C1</div></td>' + cell(O, aslC) + cell(A, aslC) + '<td class="sbsrc">Khalifa và Weir (2009), bài đọc Cambridge: KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6' + (isL ? '. Mốc của bài Đọc' : '') + '</td></tr>');
  rows.push('<tr class="sbgrp"><td colspan="4">Công cụ ngoài · nhập level công cụ cho ra, lưu ảnh chụp màn hình</td></tr>');
  SB_EXT.forEach(function(e, i){
    var cellIn = function(w){
      var x = sbExt(w, e[0]), cls = x.lv === null ? "" : (x.stale ? "na" : sbCls(x.lv, x.lv, ti));
      return '<td><input type="text" class="sbin ' + cls + '" data-sbext="' + w + '.' + e[0] + '" value="' + esc(x.v) + '" placeholder="ví dụ B2.6" aria-label="' + esc(e[1]) + (w === "o" ? " bản gốc" : " bản đã sửa") + '">' + (x.stale ? '<div class="sbsub warnc">bài đã đổi sau lần nhập: chạy lại</div>' : '') + '</td>';
    };
    rows.push('<tr><td>' + esc(e[1]) + (i === 0 ? '<div class="sbsub">ghi vào file nộp nếu bài dưới 500 từ</div>' : '') + '</td>' + cellIn("o") + cellIn("a") + '<td class="sbsrc">' + esc(e[2]) + '</td></tr>');
  });
  return '<div class="sbhead"><span class="small">Mục tiêu <b>' + esc(S.level) + '</b> · Bản gốc là văn bản nguồn ở bước Nguồn</span><span class="small sblegend">' + sbChip(S.level, "ok") + ' đúng mức' + (ti > 0 ? ' ' + sbChip(LVL[ti-1], "lo") + ' thấp hơn' : '') + (ti < 5 ? ' ' + sbChip(LVL[ti+1], "hi") + ' cao hơn' : '') + '</span></div>'
    + '<div class="tablewrap"><table class="sbtab"><colgroup><col style="width:28%"><col style="width:17%"><col style="width:17%"><col style="width:38%"></colgroup><tr><th>Chỉ số</th><th>Bản gốc</th><th>Bản đã sửa</th><th>Nguồn</th></tr>' + rows.join("") + '</table></div>'
    + '<p class="small muted">Cách lấy level tổng: mở <a href="https://www.cathoven.com/cefr-checker/" target="_blank" rel="noopener">Cathoven CEFR Checker</a>, dán bài, ghi General Level vào ô, chụp màn hình kết quả và lưu vào thư mục bài. Trang ghi nhớ bài lúc nhập: sửa bài sau đó thì ô chuyển xám, cần chạy lại.</p>';
}
function sbRender(){
  var box = document.querySelectorAll(".cefrsb"); if(!box.length) return;
  var a = document.activeElement; if(a && a.getAttribute && a.getAttribute("data-sbext")) return;
  var h = sbHTML(); box.forEach(function(b){ b.innerHTML = h; });
}
function sbSummary(which){
  var parts = [];
  SB_EXT.forEach(function(x){ var e = sbExt(which, x[0]); if(e.v) parts.push(x[1].replace(" General Level", "").replace(" Scorecard", "") + " " + e.v + (e.stale ? " (chưa chạy lại)" : "")); });
  return parts.join(", ");
}
function bindSb(){
  document.addEventListener("input", function(ev){
    var el = ev.target; if(!el || !el.getAttribute) return; var k = el.getAttribute("data-sbext"); if(!k) return;
    var sc = el.closest(".screen"), p = k.split(".");
    if(sc && typeof wfCanEditScreen === "function" && !wfCanEditScreen(sc.id)){ el.value = sbExt(p[0], p[1]).v; toast("Chế độ xem: bạn không sửa được ô này."); return; }
    S.cefrExt = S.cefrExt || {o:{}, a:{}}; S.cefrExt[p[0]] = S.cefrExt[p[0]] || {};
    S.cefrExt[p[0]][p[1]] = el.value; S.cefrExt[p[0]][p[1] + "Sig"] = el.value.trim() ? sbSig(p[0]) : ""; save();
    var lv = sbParse(el.value); el.classList.remove("ok", "lo", "hi", "na"); if(lv !== null) el.classList.add(sbCls(lv, lv, LVL.indexOf(S.level)));
    document.querySelectorAll('[data-sbext="' + k + '"]').forEach(function(o){ if(o !== el){ o.value = el.value; o.className = el.className; } });
    try{ clRender(); }catch(e){}
  });
  document.addEventListener("focusout", function(ev){ if(ev.target && ev.target.getAttribute && ev.target.getAttribute("data-sbext")) setTimeout(function(){ sbRender(); try{ fillAuto(); }catch(e){} }, 0); });
  sbRender();
}

;
/* =====================================================================
   VIẾT VÀ NÓI
   Một bài trong thư viện = một nhiệm vụ: Viết Task 1, Viết Task 2, Nói Part 1, 2, 3.
   Căn cứ: QĐ 730 mục 2.3 (Viết), 2.4 (Nói) và đề mẫu; biểu mẫu đề hoàn chỉnh và yêu cầu sản phẩm
   của VNCETA (Specs); ghi chép tập huấn (Đề xuất).
   Nội dung lưu ở S.ws; S.slots.draft là bản ghép của cả đề (để thư viện, khoá bài, quy trình dùng chung).
   ===================================================================== */
function wsOn(){ var sp = SPEC[S.spec]; return !!sp && (sp.skill === "W" || sp.skill === "S"); }
function wsData(){ S.ws = S.ws || {}; return S.ws; }
var WS_THEME = {k:"theme", label:"Lĩnh vực, chủ đề của đề", hint:"Ghi ngắn để thư viện báo khi trùng chủ đề với đề khác (ví dụ: tình nguyện ở thư viện cộng đồng).", ph:"ví dụ: học kỹ năng mới qua mạng"};
var WS_F = {
  W1:[WS_THEME,
    {k:"form", label:"Dạng", type:"select", options:["letter","email"]},
    {k:"sit", label:"Tình huống (câu dẫn trước thư)", type:"area", rows:3, hint:"Ai viết cho ai, vì sao. Kết thúc bằng câu mời đọc thư.", ph:"You have invited an American businessman, Mr. Noah Watson, to give a talk at your English club. Read part of the letter from him below."},
    {k:"ext", label:"Thư hoặc email cho sẵn (extract)", type:"area", rows:7, words:true},
    {k:"req", label:"Yêu cầu viết", type:"area", rows:2, ph:"Write a letter responding to Mr. Noah Watson."},
    {k:"pts", label:"Các ý phải trả lời (nếu ghi rõ; mỗi ý một dòng)", type:"area", rows:3, optional:true, hint:"Để trống nếu yêu cầu chỉ là \"Write a letter responding to …\"."}],
  W2:[WS_THEME,
    {k:"srcTitle", src:true, label:"Tiêu đề bài gốc", type:"text", ph:"Vietnam's young people turn to online courses"},
    {k:"srcPub", src:true, label:"Tác giả hoặc đơn vị xuất bản", type:"text", ph:"VnExpress International"},
    {k:"srcYear", src:true, label:"Ngày hoặc năm đăng", type:"text", ph:"2025"},
    {k:"url", src:true, label:"Link nguồn", type:"text", ph:"https://…"},
    {k:"srcLic", src:true, label:"Giấy phép sử dụng", type:"text", optional:true, hint:"Ghi đúng như trang gốc (CC BY, CC BY-SA…); không thấy giấy phép mở thì ghi \"không công bố giấy phép mở\".", ph:"CC BY 4.0"},
    {k:"srcShot", src:true, label:"Đã chụp màn hình bài gốc (minh chứng nguồn)", type:"check", optional:true},
    {k:"srcText", src:true, label:"Văn bản gốc (không in vào đề)", type:"area", rows:8, optional:true, hint:"Dán bài gốc để AI rút đoạn trích và để trang đo phần chép nguyên văn."},
    {k:"from", label:"Đoạn trích lấy từ đâu (sau \"Read the following extract from\")", type:"text", ph:"an article about online learning"},
    {k:"ext", label:"Đoạn trích (extract)", type:"area", rows:6, words:true},
    {k:"adapted", label:"Adapted from (trích nguồn)", type:"text", hint:"Trang tự ghép từ thông tin ở bước Nguồn; sửa tay được.", ph:"tên bài, tác giả hoặc nơi đăng, năm"},
    {k:"req", label:"Yêu cầu viết", type:"area", rows:2, ph:"Write an essay to an educated reader to discuss whether …"}],
  S1:[WS_THEME,
    {k:"t1", label:"Chủ đề 1 (sau \"Let's talk about\")", type:"text", ph:"your free time activities"},
    {k:"q1", label:"Câu hỏi chủ đề 1 (mỗi câu một dòng)", type:"area", rows:3, ph:"What do you often do in your free time?\nDo you read books? If no, why not? If yes, what kinds of books do you like best? Why?"},
    {k:"t2", label:"Chủ đề 2 (sau \"Now, let's talk about\")", type:"text", ph:"your neighbourhood"},
    {k:"q2", label:"Câu hỏi chủ đề 2 (mỗi câu một dòng)", type:"area", rows:3}],
  S2:[WS_THEME,
    {k:"sit", label:"Tình huống (2–3 câu; câu cuối nêu 3 giải pháp)", type:"area", rows:4, ph:"A group of people is planning a trip from Danang to Hanoi. Three means of transport are suggested: by train, by plane, and by coach."},
    {k:"o1", label:"Giải pháp 1 (chép đúng như trong tình huống)", type:"text", ph:"by train"},
    {k:"o2", label:"Giải pháp 2", type:"text", ph:"by plane"},
    {k:"o3", label:"Giải pháp 3", type:"text", ph:"by coach"},
    {k:"req", label:"Câu hỏi", type:"text", ph:"Which means of transport do you think is the best choice?"}],
  S3:[WS_THEME,
    {k:"topic", label:"Chủ đề (một câu hoàn chỉnh)", type:"text", ph:"Reading habit should be encouraged among teenagers."},
    {k:"m1", label:"Ý 1 trong sơ đồ tư duy", type:"text", ph:"personal development"},
    {k:"m2", label:"Ý 2 trong sơ đồ tư duy", type:"text", ph:"relaxation"},
    {k:"m3", label:"Ý 3 trong sơ đồ tư duy", type:"text", ph:"academic results"},
    {k:"f1", label:"Câu hỏi mở rộng 1 (cho thí sinh bậc 3)", type:"text"},
    {k:"f2", label:"Câu hỏi mở rộng 2 (bậc 4)", type:"text"},
    {k:"f3", label:"Câu hỏi mở rộng 3 (bậc 5 trở lên)", type:"text"}]
};
/* các dòng cố định của biểu mẫu đề hoàn chỉnh (cùng câu chữ đề mẫu QĐ 730) */
var WS_FIX = {
  W1a:"You should spend about 20 minutes on this task.",
  W1z:"You should write at least 120 words. You are not allowed to include your name or addresses. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.",
  W2a:"You should spend about 40 minutes on this task.",
  W2g:"Give reasons for your answer and include any relevant examples from your own knowledge and experience.",
  W2z:"You should write at least 250 words. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.",
  S1h:"PART I: SOCIAL INTERACTION (~ 3 mins)", S2h:"PART II: SOLUTION DISCUSSION (~4 mins)", S3h:"PART III: TOPIC DEVELOPMENT (~ 5 mins)",
  S3n:"Note: You do not need to answer all the questions."
};
function wsV(k){ return String(wsData()[k] || "").trim(); }
function wsLines(t){ return String(t || "").split(/\n/).map(function(x){ return x.replace(/^\s*(?:[-•*–]|\d+[.)])\s*/, "").trim(); }).filter(Boolean); }
function wsSents(t){ return (String(t || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || []).map(function(x){ return x.trim(); }).filter(Boolean); }
var WS_WH = /\b(what|why|which|how|where|when|who|whom|whose)\b/i;
var WS_AUX = /^(do|does|did|are|is|am|was|were|have|has|had|can|could|would|will|should|shall|may|might|must)\b/i;
/* ghép cả đề thành văn bản (bản nộp, bản khoá, số từ trong thư viện) */
function wsText(spec){
  spec = spec || S.spec; var L = [];
  if(spec === "W1"){
    L.push("TASK 1", WS_FIX.W1a, wsV("sit"), wsV("ext"), wsV("req"));
    wsLines(wsV("pts")).forEach(function(p, i){ L.push((i + 1) + ". " + p); });
    L.push(WS_FIX.W1z);
  } else if(spec === "W2"){
    L.push("TASK 2", WS_FIX.W2a, "Read the following extract from " + (wsV("from") || "…") + ":", wsV("ext"), "Adapted from " + (wsV("adapted") || "…"), wsV("req"), WS_FIX.W2g, WS_FIX.W2z);
  } else if(spec === "S1"){
    L.push(WS_FIX.S1h, "Let's talk about " + wsV("t1").replace(/[.\s]+$/, "") + ".");
    wsLines(wsV("q1")).forEach(function(q){ L.push("- " + q); });
    L.push("Now, let's talk about " + wsV("t2").replace(/[.\s]+$/, "") + ".");
    wsLines(wsV("q2")).forEach(function(q){ L.push("- " + q); });
  } else if(spec === "S2"){
    L.push(WS_FIX.S2h, "Situation: " + wsV("sit"), wsV("req"));
  } else if(spec === "S3"){
    L.push(WS_FIX.S3h, "Topic: " + wsV("topic"), "Mind map: " + ["m1","m2","m3"].map(wsV).filter(Boolean).concat(["Your own ideas"]).join(" | "), "Follow up questions:");
    ["f1","f2","f3"].map(wsV).filter(Boolean).forEach(function(q, i){ L.push((i + 1) + ". " + q); });
    L.push(WS_FIX.S3n);
  }
  return L.filter(function(x){ return String(x).trim(); }).join("\n\n");
}
/* phần ngôn ngữ đầu vào do người soạn viết (để đo từ vựng; không gồm các dòng cố định) */
function wsInput(){
  var s = S.spec;
  if(s === "W1") return [wsV("sit"), wsV("ext"), wsV("req"), wsV("pts")].join("\n");
  if(s === "W2") return [wsV("ext"), wsV("req")].join("\n");
  if(s === "S1") return [wsV("q1"), wsV("q2")].join("\n");
  if(s === "S2") return [wsV("sit"), wsV("req")].join("\n");
  if(s === "S3") return ["topic","m1","m2","m3","f1","f2","f3"].map(wsV).join("\n");
  return "";
}
function wsHasContent(){ return (WS_F[S.spec] || []).some(function(f){ return !f.src && f.k !== "theme" && f.k !== "form" && wsV(f.k); }); }
function wsAdaptedAuto(){ var t = wsV("srcTitle"), p = wsV("srcPub"), y = wsV("srcYear"); return [t ? "\u201c" + t + "\u201d" : "", p, y].filter(Boolean).join(", "); }
function wsSync(){
  if(!wsOn()) return;
  S.slots = S.slots || {};
  S.slots.topic = wsV("theme");
  if(S.spec === "W2"){
    var D = wsData(), au = wsAdaptedAuto();
    if(au && (!D.adapted || D.adapted === D.adaptedAuto)){ D.adapted = au; } D.adaptedAuto = au;
    S.fields = S.fields || {}; S.fields["pc-url"] = wsV("url"); S.fields["pc-src"] = wsV("adapted");
  }
  var t = wsHasContent() ? wsText() : "";
  if(S.slots.draft !== t){ S.slots.draft = t; S.slots.approved = t; }
}

/* ---------- checklist WS (dùng chung khung checklist có mã) ---------- */
function wsMiss(){ return (WS_F[S.spec] || []).filter(function(f){ return !f.optional && !f.src && f.k !== "theme" && !wsV(f.k); }).map(function(f){ return f.label.replace(/\s*\(.*$/, ""); }); }
function wsNoContent(){ return wsHasContent() ? null : {s:"na", d:"Chưa có đề."}; }
/* phần chép nguyên văn: từ của đoạn trích nằm trong chuỗi ≥ 5 từ liên tiếp trùng bài gốc */
function wsCopied(ext, src){
  var tok = function(t){ return (String(t).toLowerCase().match(/[a-z0-9']+/g) || []); }, E = tok(ext), R = tok(src), N = 5, G = {};
  for(var i = 0; i + N <= R.length; i++) G[R.slice(i, i + N).join(" ")] = 1;
  var mark = E.map(function(){ return false; });
  for(var j = 0; j + N <= E.length; j++) if(G[E.slice(j, j + N).join(" ")]) for(var k = j; k < j + N; k++) mark[k] = true;
  var cnt = mark.filter(Boolean).length, best = 0, cur = 0, end = -1;
  mark.forEach(function(m, i){ cur = m ? cur + 1 : 0; if(cur > best){ best = cur; end = i; } });
  return {pct:E.length ? 100 * cnt / E.length : 0, longest:best, run:best ? E.slice(end - best + 1, end + 1).join(" ") : ""};
}
function wsCovB1(t){ if(!String(t || "").trim()) return null; var vp = vocabProfile(t); if(!vp || !vp.N) return null; return {cov:vp.cum[2], vp:vp}; }
function wsAbove(vp, n){ var L = (vp.lemmas || []).filter(function(x){ return x.lv > 2; }).map(function(x){ return x.w + " (" + (LVL[x.lv] || "?") + ")"; }); return L.concat((vp.offList || []).map(function(x){ return x.w + " (ngoài danh sách)"; })).slice(0, n || 10); }
var WS_ROWS = [
  {c:"WS-A1", g:"A", t:"Chủ đề mới, đa dạng, cập nhật, phù hợp với người Việt Nam; không sao chép từ đề thi, sách luyện thi, ngân hàng câu hỏi đã công bố", src:"Yêu cầu sản phẩm của VNCETA (mục 2.2 và 2.4.3c)", tier:"spec", who:"H", dep:"text"},
  {c:"WS-A2", g:"A", t:"Ngôn ngữ của đề chính xác, cụ thể, rõ ràng", src:"Yêu cầu sản phẩm của VNCETA (mục 2.4.3c)", tier:"spec", who:"H", dep:"text"},
  {c:"WS-A3", g:"A", t:"Đề đủ các phần của biểu mẫu đề hoàn chỉnh", src:"Biểu mẫu đề hoàn chỉnh của VNCETA", tier:"spec", who:"M", ev:function(){
    var n = wsNoContent(); if(n) return n; var m = wsMiss();
    return m.length ? {s:"fail", d:"Còn trống: " + m.join(", ") + "."} : {s:"ok", d:"Đủ các phần.", keep:"Giữ đủ các phần của biểu mẫu."};
  }},
  // Viết
  {c:"WS-B1", g:"B", sp:["W1"], t:"Thư hoặc email cho sẵn dài 80–90 từ (chỉ tính phần extract)", src:"QĐ 730 mục 2.3.1 (ngữ liệu nguồn Bài viết 1: 80–90 từ); ghi chép tập huấn", tier:"qd", who:"M", ev:function(){
    var t = wsV("ext"); if(!t) return {s:"na", d:"Chưa có thư cho sẵn."}; var n = wc(t);
    if(n >= 80 && n <= 90) return {s:"ok", d:n + " từ.", keep:"Giữ thư cho sẵn trong 80–90 từ."};
    return {s:"fail", d:n + " từ: cần " + (n < 80 ? "thêm " + (80 - n) + " đến " + (90 - n) : "bớt " + (n - 90) + " đến " + (n - 80)) + " từ."};
  }},
  {c:"WS-B2", g:"B", sp:["W1","W2"], t:"Ngữ liệu đầu vào viết ở trình độ bậc 3: độ phủ từ vựng ở mức B1 từ 95% trở lên", src:"QĐ 730 mục 2.3.1 (ngữ liệu đầu vào viết theo ngôn ngữ ở trình độ 3); ngưỡng 95% theo Phụ lục A tập huấn (dùng cho bài Đọc)", tier:"qd", who:"M", ev:function(){
    var n = wsNoContent(); if(n) return n; var C = wsCovB1(wsInput()); if(!C) return {s:"na", d:"Chưa có ngữ liệu đầu vào."};
    var tok = C.vp.N, K = Math.floor(tok * (C.cov - 95) / 100 + 1e-6);
    if(C.cov >= 95) return {s:"ok", d:"Độ phủ ở B1: " + clNum(C.cov, 1) + "% (trang ước lượng, " + tok + " lượt từ).", keep:"Độ phủ ở B1 đang " + clNum(C.cov, 1) + "%: không thêm từ trên B1."};
    return {s:"fail", d:"Độ phủ ở B1: " + clNum(C.cov, 1) + "%, cần từ 95%: thay khoảng " + (-K) + " lượt từ trên B1 hoặc ngoài danh sách bằng từ B1 trở xuống. Từ đang vượt: " + wsAbove(C.vp, 12).join(", ") + "."};
  }},
  {c:"WS-B3", g:"B", sp:["W1"], t:"Yêu cầu viết bắt đầu bằng \"Write a letter …\" hoặc \"Write an email …\"", src:"Biểu mẫu đề hoàn chỉnh (Write an …) và đề mẫu QĐ 730", tier:"spec", who:"M", ev:function(){
    var t = wsV("req"); if(!t) return {s:"na", d:"Chưa có yêu cầu."};
    return /^write (a letter|an email|an e-mail|a reply|a response)\b/i.test(t) ? {s:"ok", d:"Đúng khuôn."} : {s:"fail", d:"Yêu cầu đang bắt đầu bằng \"" + t.split(/\s+/).slice(0, 4).join(" ") + "…\"."};
  }},
  {c:"WS-B4", g:"B", sp:["W1"], t:"Tình huống nêu rõ vì sao phải viết, viết cho ai, quan hệ giữa người viết và người nhận, và mục đích (hỏi, cung cấp thông tin, giải thích hay đề xuất); không đòi lập luận vượt bậc 3", src:"Ghi chép tập huấn, phần Viết Task 1", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B5", g:"B", sp:["W1"], t:"Yêu cầu nội dung rõ; giọng văn cần dùng hợp với người nhận", src:"Ghi chép tập huấn, phần Viết Task 1", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B6", g:"B", sp:["W1","W2"], t:"Đã dự đoán bài làm: các ý yêu cầu viết được trong số từ và thời gian; văn phong và yêu cầu nhận thức hợp bậc", src:"Ghi chép tập huấn, quy trình soạn đề Viết (bước 4)", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B7", g:"B", sp:["W2"], t:"Có trích nguồn đoạn trích (Adapted from …)", src:"Yêu cầu sản phẩm của VNCETA (mục 2.4.3c)", tier:"spec", who:"M", ev:function(){
    var n = wsNoContent(); if(n) return n; var a = wsV("adapted");
    return a ? {s:"ok", d:"Adapted from " + a + (wsV("url") ? " · " + wsV("url") : "") + "."} : {s:"fail", d:"Chưa ghi nguồn của đoạn trích."};
  }},
  {c:"WS-B8", g:"B", sp:["W2"], t:"Yêu cầu viết bắt đầu bằng \"Write an essay …\"", src:"Biểu mẫu đề hoàn chỉnh và đề mẫu QĐ 730", tier:"spec", who:"M", ev:function(){
    var t = wsV("req"); if(!t) return {s:"na", d:"Chưa có yêu cầu."};
    return /^(now,\s*)?write an essay\b/i.test(t) ? {s:"ok", d:"Đúng khuôn."} : {s:"fail", d:"Yêu cầu đang bắt đầu bằng \"" + t.split(/\s+/).slice(0, 4).join(" ") + "…\"."};
  }},
  {c:"WS-B9", g:"B", sp:["W2"], t:"Chủ đề không đòi kiến thức chuyên môn sâu; đoạn trích cho bối cảnh và dẫn tới vấn đề cần bàn, không cho sẵn quá nhiều ý để thí sinh chép, không có nhiều cụm học thuật hay chuyên ngành vượt bậc 3", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B10", g:"B", sp:["W2"], t:"Yêu cầu nêu rõ nhiệm vụ lập luận (trình bày quan điểm, đánh giá, thảo luận ưu nhược); đủ mở để phát triển các lập luận khác nhau; không mơ hồ, không giả định (A is harmful), không định hướng thí sinh đồng tình với một quan điểm", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B11", g:"B", sp:["W2"], t:"Phạm vi vấn đề vừa với bài tối thiểu 250 từ trong 40 phút", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B12", g:"B", sp:["W2"], t:"Đoạn trích dài 50–60 từ", src:"QĐ 730 mục 2.3.1 (ngữ liệu nguồn Bài viết 2: đoạn văn, đoạn trích báo hoặc bài giảng, 50–60 từ)", tier:"qd", who:"M", ev:function(){
    var t = wsV("ext"); if(!t) return {s:"na", d:"Chưa có đoạn trích."}; var n = wc(t);
    if(n >= 50 && n <= 60) return {s:"ok", d:n + " từ.", keep:"Giữ đoạn trích trong 50–60 từ."};
    return {s:"fail", d:n + " từ: cần " + (n < 50 ? "thêm " + (50 - n) + " đến " + (60 - n) : "bớt " + (n - 60) + " đến " + (n - 50)) + " từ."};
  }},
  {c:"WS-B13", g:"B", sp:["W2"], t:"Đoạn trích đề cập và thảo luận một chủ đề liên quan đến Việt Nam hoặc khu vực", src:"QĐ 730 mục 2.3.1 (ngữ liệu nguồn Bài viết 2)", tier:"qd", who:"H", dep:"text"},
  {c:"WS-B14", g:"B", sp:["W2"], t:"Nguồn chính thống: có link hoặc ảnh bài gốc, ảnh chụp màn hình; ghi giấy phép", src:"Phụ lục tập huấn Ứng dụng AI (A3, D)", tier:"dx", who:"MH", dep:"text", ev:function(){
    var miss = [];
    if(!wsV("url")) miss.push("link"); if(!wsV("srcTitle")) miss.push("tiêu đề bài gốc"); if(!wsV("srcPub")) miss.push("tác giả hoặc đơn vị xuất bản"); if(!wsV("srcYear")) miss.push("ngày đăng");
    if(!wsV("srcLic")) miss.push("giấy phép"); if(!wsData().srcShot) miss.push("ảnh chụp màn hình");
    return miss.length ? {s:"fail", d:"Bước Nguồn còn thiếu: " + miss.join(", ") + "."} : {s:"ok", d:wsV("srcPub") + " · " + wsV("srcYear") + " · " + wsV("srcLic") + ". Người thẩm định xem nguồn có chính thống không."};
  }},
  {c:"WS-B15", g:"B", sp:["W2"], t:"Chỉ lấy ý của bài gốc, không chép nguyên đoạn (dưới 20% bài gốc)", src:"Phụ lục tập huấn Ứng dụng AI (A3, D)", tier:"dx", who:"MH", dep:"text", ev:function(){
    var e = wsV("ext"), src = wsV("srcText"); if(!e) return {s:"na", d:"Chưa có đoạn trích."};
    if(!src) return {s:"warn", d:"Chưa dán văn bản gốc ở bước Nguồn nên trang chưa đo được phần chép nguyên văn."};
    var C = wsCopied(e, src);
    var d = "Trang đo: " + clNum(C.pct, 0) + "% số từ của đoạn trích nằm trong chuỗi từ 5 từ trở lên trùng nguyên văn bài gốc" + (C.longest ? "; chuỗi dài nhất " + C.longest + " từ: \"" + C.run + "\"" : "") + ".";
    return {s:C.pct > 20 ? "warn" : "ok", d:d + (C.pct > 20 ? " Viết lại bằng lời mới những chỗ chép." : "")};
  }},
  {c:"WS-B16", g:"B", sp:["W2"], t:"Đã đối chiếu sự kiện, con số, người nói giữa bài gốc và đoạn trích; không thêm hay đổi chiều quan điểm", src:"Phụ lục tập huấn Ứng dụng AI (D, bước B7)", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B17", g:"B", sp:["W2"], t:"Nguồn và chủ đề không nhạy cảm (chính trị, tôn giáo, sắc tộc, bệnh tật, tai nạn), không vi phạm pháp luật, văn hoá", src:"Phụ lục tập huấn Ứng dụng AI (A3, B1)", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B18", g:"B", sp:["W2"], t:"Không trùng nguồn hoặc chủ đề với bài đã có trong thư viện", src:"Ghi chép tập huấn (chủ đề trùng giữa thành viên)", tier:"dx", who:"M", ev:function(){
    if(!wsV("url") && !wsV("theme")) return {s:"na", d:"Chưa có chủ đề và nguồn."};
    if(typeof LIB === "undefined" || !LIB.items || !LIB.items.length) return {s:"na", d:"Chưa tải thư viện (đăng nhập để kiểm)."};
    var d = libDupes(); return d.length ? {s:"fail", d:"Trùng với: " + d.map(function(x){ return x.x.title + " (" + x.why + ")"; }).join("; ") + "."} : {s:"ok", d:"Không trùng với bài nào trong thư viện."};
  }},
  // Nói
  {c:"WS-C1", g:"C", sp:["S1"], t:"Hai chủ đề khác nhau", src:"QĐ 730 mục 2.4.1", tier:"qd", who:"M", ev:function(){
    var a = wsV("t1"), b = wsV("t2"); if(!a && !b) return {s:"na", d:"Chưa có chủ đề."};
    if(!a || !b) return {s:"fail", d:"Mới có " + (a || b ? 1 : 0) + " chủ đề."};
    return a.toLowerCase() === b.toLowerCase() ? {s:"fail", d:"Hai chủ đề trùng nhau."} : {s:"ok", d:"\"" + a + "\" và \"" + b + "\"."};
  }},
  {c:"WS-C2", g:"C", sp:["S1"], t:"Có 3–6 câu hỏi, mỗi chủ đề ít nhất 1 câu", src:"QĐ 730 mục 2.4.1 (3–6 câu hỏi); ghi chép tập huấn (mỗi chủ đề ít nhất 1 câu)", tier:"qd", who:"M", ev:function(){
    var a = wsLines(wsV("q1")).length, b = wsLines(wsV("q2")).length, n = a + b; if(!n) return {s:"na", d:"Chưa có câu hỏi."};
    var ok = n >= 3 && n <= 6 && a >= 1 && b >= 1;
    return {s:ok ? "ok" : "fail", d:"Chủ đề 1: " + a + " câu, chủ đề 2: " + b + " câu, tổng " + n + "." + (ok ? "" : (n < 3 ? " Cần thêm câu." : n > 6 ? " Cần bớt câu." : " Chủ đề nào cũng cần ít nhất 1 câu."))};
  }},
  {c:"WS-C3", g:"C", sp:["S1"], t:"Câu hỏi nghi vấn (Do you…?) có kèm câu hỏi có từ để hỏi (Why? Why not? …) để gợi mở", src:"QĐ 730 mục 2.4.1", tier:"qd", who:"M", ev:function(){
    var L = wsLines(wsV("q1")).concat(wsLines(wsV("q2"))); if(!L.length) return {s:"na", d:"Chưa có câu hỏi."};
    var bad = L.filter(function(q){ return WS_AUX.test(q) && !WS_WH.test(q.replace(/^[^?]*\?/, "")); });
    var noQ = L.filter(function(q){ return !/\?\s*$/.test(q); });
    if(bad.length) return {s:"fail", d:"Chưa có câu hỏi có từ để hỏi đi kèm: " + bad.map(function(q){ return "\"" + q + "\""; }).join("; ") + "."};
    if(noQ.length) return {s:"warn", d:"Dòng không kết thúc bằng dấu hỏi: " + noQ.map(function(q){ return "\"" + q + "\""; }).join("; ") + "."};
    return {s:"ok", d:L.length + " câu đều đúng dạng."};
  }},
  {c:"WS-C4", g:"C", sp:["S1"], t:"Câu hỏi cùng chủ đề không hỏi trùng ý; bộ câu hỏi tương đối đồng đều; không giả định trải nghiệm; không đòi nhận thức quá cao (most effective method → best way)", src:"Ghi chép tập huấn, phần Nói Part 1", tier:"dx", who:"H", dep:"text"},
  {c:"WS-C5", g:"C", sp:["S2"], t:"Tình huống là đoạn 2–3 câu: 1–2 câu mô tả tình huống, 1 câu nêu 3 giải pháp", src:"QĐ 730 mục 2.4.1", tier:"qd", who:"M", ev:function(){
    var t = wsV("sit"); if(!t) return {s:"na", d:"Chưa có tình huống."};
    var n = wsSents(t).length, O = ["o1","o2","o3"].map(wsV), miss = O.filter(function(o){ return !o; }).length, notIn = O.filter(function(o){ return o && t.toLowerCase().indexOf(o.toLowerCase()) < 0; });
    var P = [];
    if(n < 2 || n > 3) P.push("tình huống có " + n + " câu, cần 2–3 câu");
    if(miss) P.push("mới ghi " + (3 - miss) + "/3 giải pháp ở các ô bên dưới");
    if(notIn.length) P.push("không thấy trong tình huống: " + notIn.map(function(o){ return "\"" + o + "\""; }).join(", "));
    if(P.length) return {s:"fail", d:P.join("; ") + "."};
    var last = wsSents(t).slice(-1)[0].toLowerCase(), allLast = O.every(function(o){ return last.indexOf(o.toLowerCase()) >= 0; });
    return {s:allLast ? "ok" : "warn", d:n + " câu; độ dài 3 giải pháp: " + O.map(function(o){ return wc(o) + " từ"; }).join(" / ") + "." + (allLast ? "" : " Ba giải pháp nên nằm trong cùng một câu (câu cuối).")};
  }},
  {c:"WS-C6", g:"C", sp:["S2"], t:"Câu hỏi theo dạng \"Which … do you think is the best choice …?\"", src:"Biểu mẫu đề hoàn chỉnh và đề mẫu QĐ 730", tier:"spec", who:"M", ev:function(){
    var t = wsV("req"); if(!t) return {s:"na", d:"Chưa có câu hỏi."};
    if(!/^which\b/i.test(t) || !/\?\s*$/.test(t)) return {s:"fail", d:"Câu hỏi cần bắt đầu bằng Which và kết thúc bằng dấu hỏi."};
    return /best choice/i.test(t) ? {s:"ok", d:"Đúng khuôn."} : {s:"warn", d:"Biểu mẫu dùng cụm \"the best choice\"."};
  }},
  {c:"WS-C7", g:"C", sp:["S2"], t:"Ba giải pháp cân đối độ dài, nội dung, phạm vi, thời gian, nguồn lực; giải pháp nào cũng có cân nhắc thật; không kèm lợi ích cụ thể làm sẵn ý cho thí sinh", src:"Ghi chép tập huấn, phần Nói Part 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-C8", g:"C", sp:["S2"], t:"Tình huống rõ đối tượng cần hỗ trợ; không đưa quá nhiều điều kiện phải nhớ; không mơ hồ", src:"Ghi chép tập huấn, phần Nói Part 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-C9", g:"C", sp:["S3"], t:"Chủ đề là một câu hoàn chỉnh", src:"QĐ 730 mục 2.4.1", tier:"qd", who:"M", ev:function(){
    var t = wsV("topic"); if(!t) return {s:"na", d:"Chưa có chủ đề."}; var n = wsSents(t).length;
    if(n !== 1) return {s:"fail", d:"Chủ đề đang có " + n + " câu."};
    return /[.!]["”’]?$/.test(t) && !/\?$/.test(t) ? {s:"ok", d:"Một câu."} : {s:"warn", d:"Chủ đề nên là câu trần thuật kết thúc bằng dấu chấm."};
  }},
  {c:"WS-C10", g:"C", sp:["S3"], t:"Sơ đồ tư duy có 3 ý; mỗi ý là danh từ hoặc cụm danh từ (có thể là động từ, tính từ), không phải câu", src:"QĐ 730 mục 2.4.1; biểu mẫu đề hoàn chỉnh (3 ô ý và ô Your own ideas)", tier:"qd", who:"M", ev:function(){
    var M = ["m1","m2","m3"].map(wsV), n = M.filter(Boolean).length; if(!n) return {s:"na", d:"Chưa có ý."};
    if(n < 3) return {s:"fail", d:"Mới có " + n + "/3 ý."};
    var bad = M.filter(function(x){ return /[.?!]$/.test(x); });
    return bad.length ? {s:"warn", d:"Ý có dấu câu như câu hoàn chỉnh: " + bad.map(function(x){ return "\"" + x + "\""; }).join(", ") + "."} : {s:"ok", d:M.join(" · ")};
  }},
  {c:"WS-C11", g:"C", sp:["S3"], t:"Có 3 câu hỏi mở rộng, ưu tiên câu hỏi có từ để hỏi", src:"QĐ 730 mục 2.4.1 (1–3 câu, ưu tiên từ để hỏi); biểu mẫu đề hoàn chỉnh (3 câu)", tier:"qd", who:"M", ev:function(){
    var F = ["f1","f2","f3"].map(wsV), n = F.filter(Boolean).length; if(!n) return {s:"na", d:"Chưa có câu hỏi."};
    if(n < 3) return {s:"fail", d:"Mới có " + n + "/3 câu."};
    var noQ = F.filter(function(q){ return !/\?\s*$/.test(q); }), noWh = F.filter(function(q){ return !WS_WH.test(q); });
    if(noQ.length) return {s:"fail", d:"Không kết thúc bằng dấu hỏi: " + noQ.map(function(q){ return "\"" + q + "\""; }).join("; ") + "."};
    return noWh.length ? {s:"warn", d:"Câu chưa có từ để hỏi: " + noWh.map(function(q){ return "\"" + q + "\""; }).join("; ") + "."} : {s:"ok", d:"3 câu, đều có từ để hỏi."};
  }},
  {c:"WS-C12", g:"C", sp:["S3"], t:"Câu hỏi 1 cho thí sinh có thể đạt bậc 3, câu 2 bậc 4, câu 3 bậc 5 trở lên; tăng yêu cầu nhận thức có chủ đích, không chỉ tăng độ khó từ vựng", src:"QĐ 730 mục 2.4.1; ghi chép tập huấn (tăng yêu cầu nhận thức)", tier:"qd", who:"H", dep:"text"},
  {c:"WS-C13", g:"C", sp:["S3"], t:"Câu hỏi mở rộng không lặp lại ý trong sơ đồ tư duy", src:"Ghi chép tập huấn, phần Nói Part 3", tier:"dx", who:"MH", dep:"text", ev:function(){
    var F = ["f1","f2","f3"].map(wsV).filter(Boolean), M = ["m1","m2","m3"].map(wsV).filter(Boolean); if(!F.length || !M.length) return {s:"na", d:"Chưa đủ ý và câu hỏi."};
    var hits = [];
    F.forEach(function(q, i){ var qb = clKwBag(q); M.forEach(function(m){ var mb = Object.keys(clKwBag(m)).filter(function(w){ return w.length > 3; }); var common = mb.filter(function(w){ return qb[w]; }); if(common.length) hits.push("câu " + (i + 1) + " có \"" + common.join(", ") + "\" của ý \"" + m + "\""); }); });
    return hits.length ? {s:"warn", d:"Trùng từ với sơ đồ tư duy: " + hits.join("; ") + ". Xem câu hỏi có lặp ý không."} : {s:"ok", d:"Không thấy trùng từ với sơ đồ tư duy."};
  }},
  {c:"WS-C14", g:"C", sp:["S3"], t:"Chủ đề định hướng rõ bài nói (không gợi ý sẵn), đủ rộng để phát triển ý; không áp đặt lập trường (why A is better than B); hạn chế thuật ngữ chuyên ngành", src:"Ghi chép tập huấn, phần Nói Part 3", tier:"dx", who:"H", dep:"text"},
  {c:"WS-C15", g:"C", sp:["S1","S2","S3"], t:"Thẩm định Nói: chủ đề tiếp cận được bằng kiến thức thông thường; không dùng từ, cấu trúc khó không cần thiết; đề tạo đúng hoạt động nói cần đánh giá; công bằng (không giả định trải nghiệm, không định hướng lựa chọn, không áp đặt quan điểm); mức gợi ý và cơ hội phát triển ý tương đương giữa các đề", src:"Ghi chép tập huấn, checklist thẩm định Speaking", tier:"dx", who:"H", dep:"text"}
];
CL_ROWS.WS = WS_ROWS;
CL_GROUPS.WS = {A:"Chung", B:"Viết", C:"Nói"};
CL_SCOPE_NAME.WS = "đề Viết, Nói";
/* ---------- câu lệnh AI soạn nháp ---------- */
var WS_OUT = {
  W1:["THEME","FORM","SITUATION","EXTRACT","TASK","POINTS"], W2:["THEME","FROM","EXTRACT","ADAPTED FROM","TASK"],
  S1:["THEME","TOPIC 1","QUESTIONS 1","TOPIC 2","QUESTIONS 2"], S2:["THEME","SITUATION","OPTION 1","OPTION 2","OPTION 3","QUESTION"],
  S3:["THEME","TOPIC","IDEA 1","IDEA 2","IDEA 3","FOLLOW-UP 1","FOLLOW-UP 2","FOLLOW-UP 3"]
};
var WS_MAP = {"THEME":"theme","FORM":"form","SITUATION":"sit","EXTRACT":"ext","TASK":"req","POINTS":"pts","FROM":"from","ADAPTED FROM":"adapted","TOPIC 1":"t1","QUESTIONS 1":"q1","TOPIC 2":"t2","QUESTIONS 2":"q2","OPTION 1":"o1","OPTION 2":"o2","OPTION 3":"o3","QUESTION":"req","TOPIC":"topic","IDEA 1":"m1","IDEA 2":"m2","IDEA 3":"m3","FOLLOW-UP 1":"f1","FOLLOW-UP 2":"f2","FOLLOW-UP 3":"f3"};
function wsPrompt(){
  var s = S.spec, th = wsV("theme") || "(tự chọn một chủ đề quen thuộc, phù hợp với người Việt Nam)", L = [];
  L.push("Bạn là người soạn đề thi VSTEP (bậc 3–5) có kinh nghiệm. Hãy soạn MỘT nhiệm vụ " + SPEC[s].label + " mới hoàn toàn (không chép từ đề thi, sách luyện thi đã công bố), theo Định dạng đề thi VSTEP (QĐ 730/QĐ-BGDĐT).", "", "Chủ đề: " + th, "");
  L.push("YÊU CẦU:");
  if(s === "W1") L.push("- Thí sinh viết một bức thư/email (tối thiểu 120 từ, 20 phút) trả lời thư/email cho sẵn hoặc gửi người khác để hỏi thông tin, thực hiện nhu cầu giao tiếp. Nhiệm vụ kiểm tra viết tương tác.",
    "- SITUATION: 1–2 câu tiếng Anh nêu rõ vì sao phải viết, viết cho ai, quan hệ người viết – người nhận; kết thúc bằng câu mời đọc thư (ví dụ \"Read part of the letter from him below.\").",
    "- EXTRACT: thư/email cho sẵn dài 80–90 từ (chỉ tính phần thư), ngôn ngữ bậc 3, nêu 2–3 điều người nhận cần trả lời (hỏi, cung cấp thông tin, giải thích hoặc đề xuất). Không đòi lập luận vượt bậc 3.",
    "- TASK: một câu bắt đầu bằng \"Write a letter\" hoặc \"Write an email\" (ví dụ \"Write a letter responding to Mr. Noah Watson.\").",
    "- POINTS: để trống, hoặc liệt kê các ý phải trả lời nếu muốn ghi rõ (mỗi ý một dòng).",
    "- Tên người trong đề là tên giả; giọng văn của thư cho sẵn hợp với quan hệ hai người.");
  if(s === "W2") L.push("- Thí sinh viết bài luận (tối thiểu 250 từ, 40 phút) dùng lí do và ví dụ để bảo vệ ý kiến, quan điểm.",
    "- EXTRACT: đoạn văn hoặc đoạn trích báo, bài giảng dài 50–60 từ, đề cập và thảo luận một chủ đề liên quan đến Việt Nam hoặc khu vực (QĐ 730). Ngôn ngữ bậc 3; cho bối cảnh và dẫn tới vấn đề cần bàn; không cho sẵn quá nhiều ý để thí sinh chép; không có cụm học thuật, chuyên ngành vượt bậc 3." + (wsV("srcText") ? " Viết đoạn trích dựa trên VĂN BẢN NGUỒN bên dưới: chỉ lấy ý, viết lại bằng lời mới (không chép quá 20% câu chữ của bài gốc); giữ đúng sự kiện, con số, người nói; không thêm quan điểm hay số liệu ngoài nguồn." : ""),
    "- FROM: nơi lấy đoạn trích, viết tiếp sau \"Read the following extract from\" (ví dụ \"an article about online learning\").",
    "- ADAPTED FROM: " + (wsV("adapted") ? "chép đúng dòng sau: " + wsV("adapted") : "nguồn thật của đoạn trích (tên bài, tác giả hoặc nơi đăng, năm). Nếu không có nguồn thật, ghi \"CẦN BỔ SUNG\"."),
    "- TASK: một câu bắt đầu bằng \"Write an essay to an educated reader to discuss …\", nêu rõ nhiệm vụ lập luận (trình bày quan điểm, đánh giá, thảo luận ưu nhược); đủ mở; không mơ hồ; không giả định (A is harmful); không định hướng thí sinh đồng tình với một quan điểm.",
    "- Chủ đề không đòi kiến thức chuyên môn sâu; phạm vi vừa bài 250 từ trong 40 phút.");
  if(s === "S1") L.push("- Giám khảo hỏi thí sinh 3–6 câu thuộc hai chủ đề quen thuộc khác nhau; mỗi chủ đề ít nhất 1 câu (nên 3 câu mỗi chủ đề).",
    "- Câu hỏi có từ để hỏi (What, Where, Who…). Khi dùng câu nghi vấn (Do you…?), thêm câu hỏi có từ để hỏi để gợi mở (If no, why not? If yes, …? Why?).",
    "- Câu cùng chủ đề không hỏi trùng ý; bộ câu tương đối đồng đều; không giả định trải nghiệm (\"if you travel abroad\", không phải \"when you travel abroad\"); không đòi nhận thức quá cao.",
    "- TOPIC 1, TOPIC 2: cụm danh từ viết tiếp sau \"Let's talk about\". QUESTIONS 1, QUESTIONS 2: mỗi câu một dòng.");
  if(s === "S2") L.push("- Một tình huống với 3 giải pháp; thí sinh chọn giải pháp tối ưu và lập luận vì sao không chọn hai giải pháp kia (4 phút, 1 phút chuẩn bị).",
    "- SITUATION: đoạn 2–3 câu: 1–2 câu mô tả tình huống (rõ đối tượng cần hỗ trợ, không quá nhiều điều kiện phải nhớ), 1 câu nêu 3 giải pháp.",
    "- OPTION 1–3: chép đúng ba giải pháp như trong câu cuối. Ba giải pháp cân đối về độ dài, nội dung, phạm vi, thời gian, nguồn lực; giải pháp nào cũng có cân nhắc thật; không kèm lợi ích cụ thể.",
    "- QUESTION: dạng \"Which … do you think is the best choice …?\"");
  if(s === "S3") L.push("- Thí sinh trình bày một chủ đề (5 phút, 1 phút chuẩn bị) theo sơ đồ tư duy cho sẵn hoặc ý riêng, rồi trả lời câu hỏi mở rộng.",
    "- TOPIC: một câu hoàn chỉnh, định hướng rõ bài nói, đủ rộng để phát triển ý, không áp đặt lập trường, hạn chế thuật ngữ.",
    "- IDEA 1–3: ba ý của sơ đồ tư duy, mỗi ý là danh từ hoặc cụm danh từ (có thể là động từ hoặc tính từ), không phải câu.",
    "- FOLLOW-UP 1–3: câu hỏi có từ để hỏi; câu 1 cho thí sinh bậc 3, câu 2 bậc 4, câu 3 bậc 5 trở lên (tăng yêu cầu nhận thức, không chỉ tăng độ khó từ vựng); không lặp lại ý trong sơ đồ tư duy; không giả định trải nghiệm.");
  L.push("- Ngôn ngữ của đề chính xác, cụ thể, rõ ràng; chính tả " + (S.spelling === "Anh–Mỹ" ? "Anh–Mỹ" : "Anh–Anh") + ".", "");
  L.push("Trình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), đúng các nhãn sau, mỗi nhãn ở đầu dòng, nội dung viết ngay sau nhãn hoặc ở các dòng tiếp theo:");
  WS_OUT[s].forEach(function(k){ L.push(k + ":"); });
  L.push("Sau khối code, viết 2–3 dòng tiếng Việt: thí sinh bậc 3, 4, 5 sẽ viết hoặc nói được gì với đề này (dự đoán bài làm).");
  if(s === "W2" && wsV("srcText")) L.push("", "VĂN BẢN NGUỒN (chỉ để lấy ý):", wsV("srcText"));
  return L.join("\n");
}
/* Task 2: câu lệnh tìm nguồn (bước Nguồn, theo Phụ lục B2) và câu lệnh kiểm khớp nguồn (bước Soạn đề, sau khi có đoạn trích; theo Phụ lục D, B7) */
/* gợi ý chủ đề theo mẫu B1 của Phụ lục tập huấn, thêm tiêu chí riêng của từng nhiệm vụ (QĐ 730, ghi chép tập huấn) */
function wsUsedTopics(){
  if(typeof LIB === "undefined" || !LIB.items) return [];
  var set = (S.libSet || "").trim(), cur = S.lib && S.lib.id, seen = {}, out = [];
  LIB.items.forEach(function(x){
    var m = x.meta || {}, t = (m.topic || "").trim(); if(!t || x.id === cur) return;
    if(!((set && m.set === set) || m.skill === "W" || m.skill === "S")) return;
    var k = t.toLowerCase(); if(seen[k]) return; seen[k] = 1; out.push(t);
  });
  return out.slice(0, 40);
}
function wsTopicPrompt(){
  var s = S.spec, sp = SPEC[s], man = String((S.slots || {}).usedTopics || "").split(/[;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean), used = man.concat(wsUsedTopics().filter(function(t){ return man.indexOf(t) < 0; })), L = [];
  L.push("Bạn là chuyên gia ra đề thi VSTEP. Hãy đề xuất 10 chủ đề cho " + sp.label + " (QĐ 730/QĐ-BGDĐT: " + sp.genre + ").", "", "Yêu cầu chung:",
    "- Mới, đa dạng, cập nhật, phù hợp với người Việt Nam (yêu cầu sản phẩm của VNCETA).",
    "- Không nhạy cảm về chính trị, tôn giáo, sắc tộc, chiến tranh, bệnh tật, tai nạn; không vi phạm pháp luật, văn hoá; không thiên về một nhóm thí sinh (giới, vùng miền, sở thích, trải nghiệm riêng).",
    "- Không chép từ đề thi, sách luyện thi đã công bố.",
    "- Không trùng lĩnh vực với các chủ đề đã có: " + (used.length ? used.join("; ") : "chưa có") + ".", "", "Yêu cầu riêng:");
  if(s === "W1") L.push("- Mỗi chủ đề là một tình huống, sự kiện quen thuộc trong cuộc sống đòi hỏi hồi đáp bằng thư hoặc email (QĐ 730), ví dụ trả lời thư mời, hỏi thông tin, giải thích, đề xuất.",
    "- Nêu được vì sao phải viết, viết cho ai, quan hệ người viết và người nhận, mục đích; nhiệm vụ không đòi lập luận vượt bậc 3 (ghi chép tập huấn).");
  if(s === "W2") L.push("- Chủ đề liên quan đến Việt Nam hoặc khu vực (QĐ 730: đoạn trích đề cập và thảo luận chủ đề liên quan đến Việt Nam hoặc khu vực).",
    "- Có một vấn đề nhiều phía để bàn, đủ cho bài luận nêu quan điểm, đánh giá hoặc thảo luận ưu nhược điểm tối thiểu 250 từ trong 40 phút.",
    "- Không đòi kiến thức chuyên môn sâu (ghi chép tập huấn); dễ tìm được bài báo chính thống về chủ đề để rút đoạn trích.");
  if(s === "S1") L.push("- Mỗi dòng là MỘT CẶP hai chủ đề quen thuộc, khác nhau (QĐ 730: hai chủ đề khác nhau), ví dụ \"your free time\" và \"your neighbourhood\".",
    "- Thí sinh nào cũng có thể nói được; không giả định trải nghiệm (ví dụ không giả định thí sinh đã ra nước ngoài, có xe riêng).");
  if(s === "S2") L.push("- Mỗi chủ đề là một tình huống có một người hoặc nhóm cần giúp và 3 giải pháp (QĐ 730), ví dụ chọn phương tiện, chọn cách học, chọn quà.",
    "- Ba giải pháp cân đối về độ dài, nội dung, phạm vi, thời gian, nguồn lực; giải pháp nào cũng có cân nhắc thật (ghi chép tập huấn).");
  if(s === "S3") L.push("- Mỗi chủ đề viết được thành một câu hoàn chỉnh (QĐ 730), đủ rộng để phát triển ý trong 5 phút, có thể chia thành 3 ý cho sơ đồ tư duy.",
    "- Không áp đặt lập trường (không viết kiểu \"why A is better than B\"), hạn chế thuật ngữ chuyên ngành; mở được câu hỏi mở rộng cho bậc 3, 4, 5 (ghi chép tập huấn).");
  L.push("", "Trình bày bảng: chủ đề" + (s === "S2" ? " (tình huống và 3 giải pháp)" : s === "S1" ? " (cặp hai chủ đề)" : "") + " | lĩnh vực | vì sao phù hợp | rủi ro cần tránh.");
  return L.join("\n");
}
function wsRenderTopic(){
  var a = document.getElementById("ws-topicai"), b = document.getElementById("ws-topicbox"); if(!a || !b || !wsOn()) return;
  a.innerHTML = '<p class="small muted">Câu lệnh theo mẫu B1 (lập danh sách chủ đề) của Phụ lục tập huấn, thêm tiêu chí riêng của ' + esc(SPEC[S.spec].label) + ' theo QĐ 730 và ghi chép tập huấn. AI trả về bảng: chủ đề | lĩnh vực | vì sao phù hợp | rủi ro cần tránh. Mở cuộc trò chuyện mới cho mỗi câu lệnh.</p><button class="btn primary" type="button" id="ws-copytopic">Sao chép câu lệnh gợi ý chủ đề</button>';
  // đang gõ trong ô chủ đề thì không vẽ lại ô đó (chỉ khi chính ô này vừa đổi); mở bài khác thì luôn vẽ lại
  if(wsRenderTopic.hold && b.contains(document.activeElement)) return;
  b.innerHTML = wsFieldHTML({k:"theme", label:"Chủ đề bạn chọn", hint:"Chép một chủ đề trong bảng AI đưa ra. Có thể viết cụ thể hơn." + (S.spec === "W2" ? " Câu lệnh tìm nguồn ở bước sau dùng chủ đề này." : " Câu lệnh soạn nháp ở bước Soạn đề dùng chủ đề này.") + " Thư viện báo khi trùng chủ đề với bài đã có.", ph:S.spec === "S1" ? "ví dụ: your free time; your neighbourhood" : "ví dụ: học kỹ năng mới qua mạng"});
}
function wsThemeLine(){ return '<p class="small">Chủ đề: <b>' + esc(wsV("theme") || "chưa chọn") + '</b> <button class="btn sm quiet" type="button" data-wsgo="ws-chude">' + (wsV("theme") ? "Đổi ở bước Chủ đề" : "Chọn ở bước Chủ đề") + '</button></p>'; }
function wsSrcPrompt(){
  var th = wsV("theme") || "[chủ đề]";
  return ["(Bật chế độ tìm kiếm web hoặc deep research.)",
    "Tìm 5 nguồn chính thống về chủ đề: " + th + ". Loại nguồn chấp nhận: báo chính thống, trang cơ quan nhà nước, tổ chức quốc tế, tạp chí khoa học phổ thông, hoặc trang có giấy phép mở. Ưu tiên nguồn tiếng Anh.",
    "Nguồn dùng để rút một đoạn trích 50–60 từ cho Viết Task 2 của đề thi VSTEP (bài luận nêu quan điểm, đánh giá hoặc thảo luận ưu nhược điểm), nên nguồn cần:",
    "- đề cập và thảo luận một chủ đề liên quan đến Việt Nam hoặc khu vực (QĐ 730);",
    "- nêu một vấn đề có nhiều phía để bàn (đồng ý và phản đối, lợi và hại, các cách đánh giá khác nhau); bài nêu cả hai phía là nguồn tốt;",
    "- chủ đề phổ thông, không đòi kiến thức chuyên môn sâu; không nhạy cảm về chính trị, tôn giáo, sắc tộc, bệnh tật, tai nạn; không vi phạm pháp luật, văn hoá;",
    "- mới, cập nhật.",
    "",
    "Với mỗi nguồn ghi: tiêu đề | đơn vị xuất bản hoặc tác giả | ngày đăng | URL | giấy phép sử dụng (nếu có) | vấn đề cần bàn (1 câu) | các phía, quan điểm chính (mỗi phía 1 dòng).",
    "",
    "Không bịa nguồn. URL nào chưa chắc, ghi \"chưa xác minh\"."].join("\n");
}
function wsFitPrompt(){
  return ["So sánh ĐOẠN TRÍCH với BÀI GỐC dưới đây. Đoạn trích là ngữ liệu đầu vào Viết Task 2 của đề thi VSTEP, chỉ được lấy ý của bài gốc.",
    "Liệt kê từng lỗi theo các loại: (1) sai sự kiện, con số, ngày tháng, tên riêng; (2) sai người nói, người làm; (3) quan điểm bị đổi chiều hoặc nói chắc hơn, yếu hơn bài gốc; (4) thêm ý, số liệu hay quan điểm bài gốc không có; (5) chép nguyên văn một câu hoặc cụm dài của bài gốc.",
    "Với mỗi lỗi ghi: loại | chỗ trong đoạn trích (chép nguyên văn) | chỗ tương ứng trong bài gốc | cách sửa. Không liệt kê chỗ chỉ rút gọn hoặc diễn đạt khác mà nghĩa giữ nguyên.",
    "Có lỗi thì viết lại cả đoạn trích đã sửa (50–60 từ, ngôn ngữ bậc 3) trong một khối code. Không có lỗi thì trả lời đúng một dòng: Không phát hiện.",
    "", "ĐOẠN TRÍCH:", wsV("ext") || "[chưa có đoạn trích]", "", "BÀI GỐC:", wsV("srcText") || "[dán bài gốc]"].join("\n");
}
function wsParse(raw){
  var keys = WS_OUT[S.spec] || [], txt = String(raw || ""), out = {}, cur = null;
  var cb = txt.match(/```[a-z]*\n?([\s\S]*?)(```|$)/i); if(cb) txt = cb[1];
  var re = new RegExp("^\\s*\\**\\s*(" + keys.map(function(k){ return k.replace(/[-]/g, "\\-"); }).sort(function(a, b){ return b.length - a.length; }).join("|") + ")\\s*\\**\\s*:\\s*(.*)$", "i");
  txt.split(/\n/).forEach(function(line){
    var m = line.match(re);
    if(m){ cur = m[1].toUpperCase(); out[cur] = m[2] ? [m[2]] : []; return; }
    if(cur) out[cur].push(line);
  });
  var res = {};
  Object.keys(out).forEach(function(k){ var v = out[k].join("\n").replace(/^\s+|\s+$/g, ""); if(WS_MAP[k]) res[WS_MAP[k]] = v; });
  if(res.form) res.form = /mail/i.test(res.form) ? "email" : "letter";
  if(res.adapted && /CẦN BỔ SUNG/i.test(res.adapted)) res.adapted = "";
  if(S.spec === "W2" && wsAdaptedAuto()) delete res.adapted;
  return res;
}

/* các chỗ trong đề để người thẩm định bấm chọn khi ghi chú (điền sẵn Vị trí và Trích) */
function wsLocName(k){
  var s = S.spec;
  return ({sit:"Tình huống", ext:s === "W2" ? "Đoạn trích" : "Thư cho sẵn", req:s === "S2" ? "Câu hỏi" : "Yêu cầu viết", pts:"Ý phải trả lời", from:"Nguồn trích", adapted:"Adapted from",
    t1:"Chủ đề 1", q1:"Chủ đề 1", t2:"Chủ đề 2", q2:"Chủ đề 2", o1:"Giải pháp 1", o2:"Giải pháp 2", o3:"Giải pháp 3", topic:"Chủ đề",
    m1:"Sơ đồ tư duy, ý 1", m2:"Sơ đồ tư duy, ý 2", m3:"Sơ đồ tư duy, ý 3", f1:"Câu hỏi mở rộng 1", f2:"Câu hỏi mở rộng 2", f3:"Câu hỏi mở rộng 3"})[k] || k;
}
function wsUnits(){
  var U = [];
  (WS_F[S.spec] || []).forEach(function(f){
    var k = f.k, v = wsV(k); if(!v || f.src || k === "theme" || k === "form") return;
    if(k === "q1" || k === "q2" || k === "pts") wsLines(v).forEach(function(q, i){ U.push({loc:wsLocName(k) + ", câu " + (i + 1), text:q}); });
    else if(k === "ext" || k === "sit"){ var ss = wsSents(v); if(ss.length > 1) ss.forEach(function(q, i){ U.push({loc:wsLocName(k) + ", câu " + (i + 1), text:q}); }); else U.push({loc:wsLocName(k), text:v}); }
    else U.push({loc:(k === "t1" || k === "t2") ? wsLocName(k) + " (tên chủ đề)" : wsLocName(k), text:v});
  });
  return U;
}
function wsPickHTML(){
  var U = wsUnits(); if(!U.length) return "";
  return '<div class="wspick"><div class="small"><b>Bấm vào chỗ có lỗi</b> để điền sẵn Vị trí và Trích (không phải mở lại bước Soạn đề):</div><div class="wspicks">'
    + U.map(function(u, i){ return '<button type="button" class="wspk" data-wspick="' + i + '"><span class="wspl">' + esc(u.loc) + '</span>' + esc(u.text.length > 140 ? u.text.slice(0, 137) + "…" : u.text) + '</button>'; }).join("") + '</div></div>';
}
/* ---------- giao diện ---------- */
function wsFieldHTML(f){
  var v = wsData()[f.k] || "", lab = '<span class="lab">' + esc(f.label) + (f.optional ? ' <span class="muted">(không bắt buộc)</span>' : '') + '</span>' + (f.hint ? '<span class="hint">' + esc(f.hint) + '</span>' : '');
  var cnt = f.words ? ' <span class="small muted" data-wswc="' + f.k + '">' + (v.trim() ? wc(v) + " từ" : "") + '</span>' : '';
  if(f.type === "check") return '<label class="field"><span style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-ws="' + f.k + '"' + (wsData()[f.k] ? " checked" : "") + '> <span class="lab" style="margin:0">' + esc(f.label) + '</span></span></label>';
  if(f.type === "select") return '<label class="field">' + lab + '<select data-ws="' + f.k + '">' + f.options.map(function(o){ return '<option' + (o === (v || f.options[0]) ? " selected" : "") + '>' + esc(o) + '</option>'; }).join("") + '</select></label>';
  if(f.type === "area") return '<label class="field">' + lab + '<textarea data-ws="' + f.k + '" rows="' + (f.rows || 3) + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '>' + esc(v) + '</textarea>' + cnt + '</label>';
  return '<label class="field">' + lab + '<input type="text" data-ws="' + f.k + '" value="' + esc(v) + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '></label>';
}
function wsPreviewHTML(){
  if(!wsHasContent()) return '<p class="small muted">Điền các ô bên trái để xem đề.</p>';
  var s = S.spec, h = "", p = function(t, cls){ return t ? '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(t).replace(/\n/g, "<br>") + '</p>' : ""; };
  if(s === "W1"){ h += p("TASK 1", "wsh") + p(WS_FIX.W1a, "wsi") + p(wsV("sit")) + '<div class="wsbox">' + p(wsV("ext")) + '</div>' + p(wsV("req")); var P = wsLines(wsV("pts")); if(P.length) h += '<ol>' + P.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + '</ol>'; h += p(WS_FIX.W1z, "wsi"); }
  if(s === "W2") h += p("TASK 2", "wsh") + p(WS_FIX.W2a, "wsi") + p("Read the following extract from " + (wsV("from") || "…") + ":") + '<div class="wsbox">' + p(wsV("ext")) + p("Adapted from " + (wsV("adapted") || "…"), "wsi") + '</div>' + p(wsV("req")) + p(WS_FIX.W2g) + p(WS_FIX.W2z, "wsi");
  if(s === "S1") [["t1","q1","Let's talk about "],["t2","q2","Now, let's talk about "]].forEach(function(x, i){ if(!i) h += p(WS_FIX.S1h, "wsh"); h += p(x[2] + wsV(x[0]).replace(/[.\s]+$/, "") + ".") + '<ul>' + wsLines(wsV(x[1])).map(function(q){ return '<li>' + esc(q) + '</li>'; }).join("") + '</ul>'; });
  if(s === "S2") h += p(WS_FIX.S2h, "wsh") + p("Situation: " + wsV("sit")) + p(wsV("req"));
  if(s === "S3"){
    h += p(WS_FIX.S3h, "wsh") + p("Topic: " + wsV("topic"));
    h += '<div class="wsmind"><div class="wsmt">' + esc(wsV("topic") || "Topic") + '</div>' + ["m1","m2","m3"].map(function(k){ return '<div class="wsmi">' + esc(wsV(k) || "…") + '</div>'; }).join("") + '<div class="wsmi own">Your own ideas</div></div>';
    h += p("Follow up questions:") + '<ol>' + ["f1","f2","f3"].map(wsV).filter(Boolean).map(function(q){ return '<li>' + esc(q) + '</li>'; }).join("") + '</ol>' + p(WS_FIX.S3n, "wsi");
  }
  return '<div class="wspaper">' + h + '</div>';
}
/* tự kiểm ngay ở bước Soạn đề: dòng máy kiểm chạy theo từng lần gõ; dòng người soát để người soạn tự rà trước khi gửi */
function wsSelfHTML(){
  if(!wsHasContent()) return '<p class="small muted">Điền đề ở mục 2, trang chấm ngay các dòng máy kiểm.</p>';
  var ev = clEval("WS"), R = clRows("WS"), M = R.filter(function(r){ return r.who === "M" || r.who === "MH"; }), H = R.filter(function(r){ return r.who === "H" || r.who === "MH"; });
  var ico = {ok:"✓", fail:"✗", warn:"!", na:"–"}, nf = M.filter(function(r){ return ev[r.c] && ev[r.c].s === "fail"; }).length;
  var h = '<div class="small ' + (nf ? "no" : "ok") + '" style="margin-bottom:6px"><b>' + (nf ? nf + " dòng máy kiểm phải sửa trước khi gửi thẩm định." : "Các dòng máy kiểm không còn đỏ.") + '</b></div><div class="wsself">';
  h += M.map(function(r){ var e = ev[r.c] || {s:"na", d:""}, st = e.s === "todo" || e.s === "recheck" ? "na" : e.s; return '<div class="wsr ' + st + '"><span class="wsi">' + (ico[st] || "–") + '</span><div><b>' + r.c + '</b> ' + esc(r.t) + ' ' + clTierHTML(r) + (e.d ? '<div class="small muted">' + esc(e.d) + '</div>' : '') + '</div></div>'; }).join("");
  h += '</div><div class="small" style="margin:10px 0 4px"><b>Tự rà trước khi gửi</b> <span class="muted">(người thẩm định sẽ xét các dòng này)</span></div><ul class="wshum">'
    + H.map(function(r){ return '<li><b>' + r.c + '</b> ' + esc(r.t) + ' ' + clTierHTML(r) + '</li>'; }).join("") + '</ul>';
  return h;
}
function wsRenderSelf(){ var b = document.getElementById("ws-self"); if(b && wsOn()) b.innerHTML = wsSelfHTML(); }
function wsF(k){ return (WS_F[S.spec] || []).filter(function(f){ return f.k === k; })[0]; }
function wsSrcStatHTML(){
  var e = wsV("ext"), src = wsV("srcText"), h = "";
  if(src) h += '<span class="small muted">Văn bản gốc: ' + wc(src) + ' từ.</span> ';
  if(e && src){ var C = wsCopied(e, src); h += '<span class="small ' + (C.pct > 20 ? "no" : "ok") + '">Đoạn trích hiện có ' + clNum(C.pct, 0) + '% số từ nằm trong chuỗi ≥ 5 từ trùng nguyên văn bài gốc.</span>'; }
  return h;
}
function wsRenderSrc(){
  var box = document.getElementById("ws-src"); if(!box) return;
  if(S.spec !== "W2"){ box.innerHTML = ""; return; }
  var au = wsV("adapted");
  box.innerHTML = '<div class="info small"><b>QĐ 730, ngữ liệu nguồn Bài viết 2:</b> một đoạn văn cho sẵn, đoạn trích trong báo hoặc đoạn bài giảng, đề cập đến và thảo luận về một chủ đề liên quan đến Việt Nam hoặc khu vực (50–60 từ). <b>Phụ lục tập huấn:</b> nguồn chính thống, có link hoặc ảnh bài gốc, ảnh chụp màn hình, ghi giấy phép; chỉ tham khảo ý tưởng (dưới 20% bài gốc).</div>'
    + '<div class="card act"><div class="n">1</div><div class="actbody"><h3 class="acttitle">Tìm nguồn</h3>' + wsThemeLine() + '<p class="small muted">Câu lệnh theo mẫu tìm nguồn của Phụ lục tập huấn (B2), thêm tiêu chí riêng của Task 2. Bật tìm kiếm web hoặc deep research; mở cuộc trò chuyện mới. Mở từng link để kiểm, không dùng nguồn \"chưa xác minh\".</p><button class="btn primary" type="button" id="ws-copysrc">Sao chép câu lệnh tìm nguồn</button></div></div>'
    + '<div class="card act"><div class="n">2</div><div class="actbody"><h3 class="acttitle">Ghi nguồn đã chọn</h3><div class="grid2">' + ["srcTitle","srcPub","srcYear","url"].map(function(k){ return wsFieldHTML(wsF(k)); }).join("") + '</div>' + wsFieldHTML(wsF("srcLic")) + wsFieldHTML(wsF("srcShot"))
    + '<p class="small">Dòng trong đề: <b>Adapted from</b> <span id="ws-adpv">' + esc(au || "…") + '</span></p></div></div>'
    + '<div class="card act"><div class="n">3</div><div class="actbody"><h3 class="acttitle">Dán văn bản gốc</h3>' + wsFieldHTML(wsF("srcText")) + '<div id="ws-srcstat">' + wsSrcStatHTML() + '</div><p class="small muted">Sang bước Soạn đề: câu lệnh soạn nháp dùng văn bản gốc này để rút đoạn trích 50–60 từ.</p></div></div>';
}
function wsRenderForm(){
  wsRenderTopic(); wsRenderSrc();
  var box = document.getElementById("ws-form"); if(!box) return;
  if(!wsOn()){ box.innerHTML = ""; return; }
  var sp = SPEC[S.spec], F = WS_F[S.spec];
  box.innerHTML = '<div class="info small"><b>' + esc(sp.label) + ':</b> ' + esc(sp.genre) + '. ' + esc(sp.qd) + '.</div>'
    + '<div class="card act"><div class="n">1</div><div class="actbody"><h3 class="acttitle">Soạn nháp bằng AI (không bắt buộc)</h3>'
    + (S.spec === "W2" ? wsThemeLine() + '<p class="small">' + (wsV("srcText") ? 'câu lệnh dùng văn bản gốc ở bước Nguồn (' + wc(wsV("srcText")) + ' từ).' : '<span class="no">chưa dán văn bản gốc ở bước Nguồn.</span>') + '</p>' : wsThemeLine())
    + '<p class="small muted">Câu lệnh nhờ AI viết một đề mới theo đặc tả. Mỗi lần dán câu lệnh, mở một cuộc trò chuyện mới. Nhóm không đưa đề chưa công bố lên AI thì bỏ qua bước này và soạn thẳng ở mục 2.</p>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" type="button" id="ws-copy">Sao chép câu lệnh</button></div>'
    + '<label class="field"><span class="lab">Dán câu trả lời của AI</span><span class="hint">Bấm nút Copy ở góc khối code của AI rồi dán vào đây; trang tự điền các ô ở mục 2.</span><textarea id="ws-paste" rows="4" placeholder="THEME: …"></textarea></label>'
    + '<div><button class="btn" type="button" id="ws-fill">Điền vào các ô</button> <span class="small muted" id="ws-fillmsg"></span></div></div></div>'
    + '<div class="card act"><div class="n">2</div><div class="actbody"><h3 class="acttitle">Các phần của đề</h3><div class="wsgrid"><div>'
    + F.filter(function(f){ return f.k !== "theme" && !f.src; }).map(wsFieldHTML).join("")
    + '</div><div><div class="small muted">Đề như khi in</div><div id="ws-preview">' + wsPreviewHTML() + '</div></div></div></div></div>'
    + (S.spec === "W2" ? '<div class="card act"><div class="n">3</div><div class="actbody"><h3 class="acttitle">Kiểm khớp nguồn</h3><p class="small muted">Có đoạn trích ở mục 2 rồi thì nhờ AI so đoạn trích với văn bản gốc ở bước Nguồn: sai sự kiện, con số, người nói; quan điểm đổi chiều; thêm ý ngoài nguồn; chép nguyên văn. AI báo "Không phát hiện" thì người soạn tự đối chiếu lại rồi bấm Đạt ở dòng WS-B16.</p><button class="btn" type="button" id="ws-copyfit">Sao chép câu lệnh kiểm khớp nguồn</button></div></div>' : '')
    + '<div class="card act"><div class="n">' + (S.spec === "W2" ? 4 : 3) + '</div><div class="actbody"><h3 class="acttitle">Tự kiểm theo checklist</h3><p class="small muted">Cùng các tiêu chí người thẩm định dùng ở bước Kiểm và xuất. Sửa hết dòng đỏ rồi mới gửi thẩm định.</p><div id="ws-self">' + wsSelfHTML() + '</div></div></div>';
}
var wsT = null;
function wsAfterEdit(full){
  wsSync(); save();
  var pv = document.getElementById("ws-preview"); if(pv) pv.innerHTML = wsPreviewHTML();
  var st = document.getElementById("ws-srcstat"); if(st) st.innerHTML = wsSrcStatHTML();
  var ap = document.getElementById("ws-adpv"); if(ap) ap.textContent = wsV("adapted") || "…";
  document.querySelectorAll("[data-wswc]").forEach(function(el){ var v = wsV(el.getAttribute("data-wswc")); el.textContent = v ? wc(v) + " từ" : ""; });
  clearTimeout(wsT); wsT = setTimeout(function(){ try{ wsRenderSelf(); }catch(e){} try{ clRender(); }catch(e){} try{ renderChip(); }catch(e){} updateStepper(); }, full ? 0 : 400);
}
function bindWs(){
  document.addEventListener("input", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-ws"); if(!k || !wsOn() || e.target.type === "checkbox") return;
    wsData()[k] = e.target.value; wsAfterEdit(false);
  });
  document.addEventListener("change", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-ws"); if(!k || !wsOn()) return;
    wsData()[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if(k === "theme"){ wsSync(); wsRenderSrc(); var fm = document.getElementById("ws-form"); if(fm && document.getElementById("ws-soan").classList.contains("hidden")){ wsRenderTopic.hold = true; try{ wsRenderForm(); } finally { wsRenderTopic.hold = false; } } }
    if(k === "srcTitle" || k === "srcPub" || k === "srcYear"){ wsSync(); var ad = document.querySelector('[data-ws="adapted"]'); if(ad) ad.value = wsV("adapted"); }
    wsAfterEdit(true);
  });
  document.addEventListener("click", function(e){
    var pk = e.target.closest && e.target.closest("[data-wspick]");
    if(pk){
      var u = wsUnits()[+pk.getAttribute("data-wspick")], fm = pk.closest(".clform"); if(!u || !fm) return;
      var set = function(ff, v){ var el = fm.querySelector('[data-ff="' + ff + '"]'); if(el){ el.value = v; el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, 700); } };
      set("loc", u.loc); set("quote", u.text);
      fm.querySelectorAll(".wspk.on").forEach(function(b){ b.classList.remove("on"); }); pk.classList.add("on");
      var iss = fm.querySelector('[data-ff="issue"]'); if(iss && !iss.value) iss.focus();
      return;
    }
    var go = e.target.closest && e.target.closest("[data-wsgo]"); if(go){ show(go.getAttribute("data-wsgo")); return; }
    var t = e.target.closest && e.target.closest("#ws-copy, #ws-fill, [data-wsdocx], #ws-copysrc, #ws-copyfit, #ws-copytopic"); if(!t) return;
    if(t.id === "ws-copytopic"){ copyText(wsTopicPrompt(), t, "Sao chép câu lệnh gợi ý chủ đề", "Đã sao chép. Giờ dán vào AI"); return; }
    if(t.id === "ws-copysrc"){ copyText(wsSrcPrompt(), t, "Sao chép câu lệnh tìm nguồn", "Đã sao chép. Giờ dán vào AI"); return; }
    if(t.id === "ws-copyfit"){ if(!wsV("ext") || !wsV("srcText")){ toast(!wsV("srcText") ? "Chưa có văn bản gốc: dán ở bước Nguồn." : "Chưa có đoạn trích: điền ô Đoạn trích ở mục 2."); return; } copyText(wsFitPrompt(), t, "Sao chép câu lệnh kiểm khớp nguồn", "Đã sao chép. Giờ dán vào AI"); return; }
    if(t.id === "ws-copy"){ copyText(wsPrompt(), t, "Sao chép câu lệnh", "Đã sao chép. Giờ dán vào AI"); return; }
    if(t.id === "ws-fill"){
      var raw = (document.getElementById("ws-paste") || {}).value || "", r = wsParse(raw), n = Object.keys(r).length, msg = document.getElementById("ws-fillmsg");
      if(!n){ if(msg) msg.textContent = "Không đọc được nhãn nào (THEME:, …). Dán đúng khối code của AI."; return; }
      if(typeof wfCanEditScreen === "function" && !wfCanEditScreen(S.step)){ toast("Chế độ xem: chưa sửa được đề ở bước này."); return; }
      var D = wsData(); Object.keys(r).forEach(function(k){ if(r[k]) D[k] = r[k]; });
      wsRenderForm(); wsAfterEdit(true);
      msg = document.getElementById("ws-fillmsg"); if(msg) msg.textContent = "Đã điền " + n + " ô. Đọc lại, sửa tay nếu cần.";
      try{ wfModeApply(); }catch(e){}
      return;
    }
    if(t.hasAttribute("data-wsdocx")) wsDownload(t);
  });
}

/* ---------- xuất Word theo biểu mẫu đề hoàn chỉnh ---------- */
function wsDocChildren(D){
  var s = S.spec, out = [], TNR = "Times New Roman";
  function P(text, o){ o = o || {}; return new D.Paragraph({alignment:o.center ? D.AlignmentType.CENTER : undefined, spacing:{after:120}, indent:o.indent ? {left:360} : undefined, children:[new D.TextRun({text:text, bold:!!o.bold, italics:!!o.italic, font:TNR, size:24})]}); }
  function box(paras){ return new D.Table({width:{size:100, type:D.WidthType.PERCENTAGE}, rows:[new D.TableRow({children:[new D.TableCell({margins:{top:100, bottom:100, left:140, right:140}, children:paras})]})]}); }
  function lines(t){ return String(t || "").split(/\n+/).filter(function(x){ return x.trim(); }); }
  if(s === "W1" || s === "W2") out.push(P("WRITING", {bold:true, center:true}));
  else out.push(P("SPEAKING", {bold:true, center:true}));
  if(s === "W1"){
    out.push(P("TASK 1", {bold:true}), P(WS_FIX.W1a, {italic:true}));
    lines(wsV("sit")).forEach(function(l){ out.push(P(l)); });
    out.push(box(lines(wsV("ext")).map(function(l){ return P(l); })));
    out.push(P(""), P(wsV("req"), {bold:true}));
    wsLines(wsV("pts")).forEach(function(x, i){ out.push(P((i + 1) + ". " + x, {indent:true})); });
    out.push(P(WS_FIX.W1z, {italic:true}));
  }
  if(s === "W2"){
    out.push(P("TASK 2", {bold:true}), P(WS_FIX.W2a, {italic:true}), P("Read the following extract from " + wsV("from") + ":"));
    out.push(box(lines(wsV("ext")).map(function(l){ return P(l); }).concat([P("Adapted from " + wsV("adapted"), {italic:true})])));
    out.push(P(""), P(wsV("req"), {bold:true}), P(WS_FIX.W2g), P(WS_FIX.W2z, {italic:true}));
  }
  if(s === "S1"){
    out.push(P(WS_FIX.S1h, {bold:true}));
    [["t1","q1","Let's talk about "],["t2","q2","Now, let's talk about "]].forEach(function(x){ out.push(P(x[2] + wsV(x[0]).replace(/[.\s]+$/, "") + ".", {bold:true})); wsLines(wsV(x[1])).forEach(function(q){ out.push(P("- " + q, {indent:true})); }); });
  }
  if(s === "S2") out.push(P(WS_FIX.S2h, {bold:true}), P("Situation: " + wsV("sit")), P(wsV("req"), {bold:true}));
  if(s === "S3"){
    out.push(P(WS_FIX.S3h, {bold:true}), P("Topic: " + wsV("topic"), {bold:true}));
    var cell = function(t, b){ return new D.TableCell({margins:{top:80, bottom:80, left:100, right:100}, children:[P(t, {center:true, bold:!!b})]}); };
    out.push(new D.Table({width:{size:100, type:D.WidthType.PERCENTAGE}, rows:[
      new D.TableRow({children:[cell(wsV("m1")), cell(wsV("m2"))]}),
      new D.TableRow({children:[cell(wsV("topic"), true), cell("Your own ideas")]}),
      new D.TableRow({children:[cell(wsV("m3")), cell("")]})]}));
    out.push(P(""), P("Follow up questions:", {bold:true}));
    ["f1","f2","f3"].map(wsV).filter(Boolean).forEach(function(q, i){ out.push(P((i + 1) + ". " + q, {indent:true})); });
    out.push(P(WS_FIX.S3n, {italic:true}));
  }
  if(s === "W2" && wsV("url")) out.push(P(""), P("Nguồn: " + wsV("adapted") + " · " + wsV("url"), {italic:true}));
  return out;
}
function wsDownload(btn){
  if(!wsHasContent()){ toast("Chưa có đề để xuất."); return; }
  var old = btn.textContent; btn.disabled = true; btn.textContent = "Đang tạo file…";
  xpLib().then(function(D){
    var doc = new D.Document({styles:{default:{document:{run:{font:"Times New Roman", size:24}}}}, sections:[{properties:{page:{margin:{top:1134, bottom:1134, left:1134, right:1134}}}, children:wsDocChildren(D)}]});
    return D.Packer.toBlob(doc);
  }).then(function(blob){
    var a = document.createElement("a"), nm = ((S.code || "").trim() || SPEC[S.spec].label).replace(/[\\/:*?"<>|]+/g, "_");
    a.href = URL.createObjectURL(blob); a.download = nm + ".docx"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    toast("Đã tải file Word.");
  }).catch(function(e){ toast("Không tạo được file: " + (e && e.message || e)); }).then(function(){ btn.disabled = false; btn.textContent = old; });
}

;

/* =====================================================================
   KHUNG ĐỐI CHIẾU HAI VĂN BẢN (dùng chung cho mọi bước cần soát tay)
   - tìm từ khoá ở cả hai cột; từ khoá chung cùng màu; câu tương ứng cùng màu;
   - bấm một câu để làm nổi câu tương ứng bên kia; rê chuột lên từ khoá.
   Đặt ở: bước Nguồn (bản dịch ↔ nguồn tiếng Việt), bước Viết bài nhánh Nghe
   (đoạn dữ kiện ↔ nguồn), bước Nội dung (bài ↔ nguồn hoặc đoạn dữ kiện),
   khung Đọc toàn bài của checklist NL (bài ↔ nguồn) và CH (bài ↔ bộ câu hỏi).
   ===================================================================== */
var CMP = {mode:{}, q:{}, idx:{}};
function cmpParas(t){ return (t || "").split(/\n+/).map(function(s){ return s.trim(); }).filter(Boolean).map(function(x){ return {k:"", t:x}; }); }
function cmpAlign(key, L, R, o){
  o = o || {};
  var mode = CMP.mode[key] || o.defMode || "kw", ls = [], rs = [];
  var split = function(units, out){
    units.forEach(function(u, ui){
      if(u.whole){ out.push({ui:ui, s:u.t, lab:"", whole:true, u:u}); return; }
      var lab = (u.t.match(/^\s*([A-Z][\w .'’-]{0,24}):\s*/) || [""])[0];
      clSents(u.t.slice(lab.length)).forEach(function(t, k){ out.push({ui:ui, s:t, lab:k === 0 ? lab.trim() : "", u:u}); });
    });
  };
  split(L, ls); split(R, rs);
  var keysOf = function(x){ var k = {}; clTok(x.s).forEach(function(t){ var kk = clKey(t.s); if(kk){ k[kk] = (k[kk] || 0) + 1; if(/^[A-Z]/.test(t.s) && !/^\d/.test(t.s)) k["^" + kk] = 1; } }); x.keys = k; x.nk = Object.keys(k).filter(function(z){ return z[0] !== "^"; }).length; };
  ls.forEach(keysOf); rs.forEach(keysOf);
  var inL = {}, inR = {}, cap = {};
  ls.forEach(function(x){ Object.keys(x.keys).forEach(function(k){ if(k[0] === "^"){ cap[k.slice(1)] = 1; return; } inL[k] = (inL[k] || 0) + 1; }); });
  rs.forEach(function(x){ Object.keys(x.keys).forEach(function(k){ if(k[0] === "^"){ cap[k.slice(1)] = 1; return; } inR[k] = 1; }); });
  var kw = {}, order = 0, lim = o.kwMax || 3;
  var pick = function(lim2, onlyHard){ kw = {}; order = 0; ls.forEach(function(x){ clTok(x.s).forEach(function(t){ var k = clKey(t.s); if(!k || kw[k] !== undefined || !inR[k]) return; if(k[0] === "#" || cap[k] || (!onlyHard && inL[k] <= lim2)){ kw[k] = order % CL_KW_N; order++; } }); }); };
  pick(lim, false);
  if(order > 60) pick(1, false);   // quá nhiều màu thì chỉ giữ từ hiếm (một câu), con số, tên riêng
  if(order > 60) pick(0, true);
  var score = function(a, b){ var sh = 0; Object.keys(a.keys).forEach(function(k){ if(k[0] !== "^" && b.keys[k]) sh += k[0] === "#" ? 2 : 1; }); return a.nk && b.nk ? sh / Math.sqrt(a.nk * b.nk) : 0; };
  rs.forEach(function(y, j){ y.pair = []; y.col = j % CL_KW_N; });
  ls.forEach(function(x){
    x.pair = []; x.col = -1; if(!rs.length) return;
    var best = -1, bv = 0;
    rs.forEach(function(y, j){ var v = o.force && o.force(x, y) ? 10 : (o.forceOnly ? 0 : score(x, y)); y._v = v; if(v > bv){ bv = v; best = j; } });
    if(bv >= (o.minScore || 0.2)){ x.pair = [best]; x.col = rs[best].col; rs.forEach(function(y, j){ if(j !== best && y._v >= Math.max(o.minScore || 0.2, bv >= 10 ? 10 : bv * 0.8)) x.pair.push(j); }); }
  });
  ls.forEach(function(x, i){ x.pair.forEach(function(j){ rs[j].pair.push(i); }); });
  var senHTML = function(x, i, pane){
    var h = "", last = 0;
    clTok(x.s).forEach(function(t){ var k = clKey(t.s); h += esc(x.s.slice(last, t.i)); h += (k && kw[k] !== undefined) ? '<span class="clkw k' + kw[k] + '" data-kw="' + esc(k) + '">' + esc(t.s) + '</span>' : esc(t.s); last = t.i + t.s.length; });
    h += esc(x.s.slice(last));
    if(x.whole) h = h.replace(/\n/g, "<br>");
    if(o.decorate) h = o.decorate(x, h, pane);
    var nomatch = pane === "b" && rs.length && !x.pair.length && x.nk >= 3 && !o.noNomatch;
    var cls = "clsen" + (x.col >= 0 && x.pair.length ? " s" + x.col : "") + (nomatch ? " clnomatch" : "") + (pane === "b" && o.unused && o.unused(x) ? " clunused" : "");
    return (x.lab ? '<b>' + esc(x.lab) + '</b> ' : '') + '<span class="' + cls + '" data-sid="' + pane + i + '" data-pair="' + x.pair.map(function(j){ return (pane === "b" ? "s" : "b") + j; }).join(" ") + '"' + (nomatch ? ' title="Không thấy câu tương ứng ở cột bên kia"' : '') + '>' + h + '</span> ';
  };
  var paneHTML = function(units, sents, pane, ch){
    return units.map(function(u, ui){ var body = sents.map(function(x, i){ return x.ui === ui ? senHTML(x, i, pane) : ""; }).join(""); return '<p class="' + (ch && ch[u.k] ? "clchg" : "") + '">' + (u.k && (!u.whole || (ch && ch[u.k])) ? '<b class="small muted">' + esc(u.k) + (ch && ch[u.k] ? " · đã sửa" : "") + '</b><br>' : '') + body + '</p>'; }).join("");
  };
  var nKw = Object.keys(kw).length, nNo = ls.filter(function(x){ return !x.pair.length && x.nk >= 3; }).length, two = R.length > 0;
  var bar = two ? '<div class="clmodes small"><span class="muted">Tô màu:</span>' + [["kw","Từ khoá chung (" + nKw + ")"],["sen", o.senLabel || "Câu tương ứng"],["off","Tắt"]].map(function(m){ return '<button type="button" class="btn sm ' + (mode === m[0] ? "primary" : "quiet") + '" data-cmpmode="' + m[0] + '">' + m[1] + '</button>'; }).join("") + '<span class="muted">Bấm vào một câu để làm nổi câu tương ứng bên kia; rê chuột lên từ khoá để thấy mọi chỗ có từ đó.' + (nNo && !o.noNomatch ? ' Ở chế độ ' + (o.senLabel || "Câu tương ứng") + ', ' + nNo + ' câu ở cột trái không thấy câu nào gần bên phải được gạch chấm đỏ.' : '') + (o.note ? ' ' + o.note : '') + '</span></div>' : '';
  return bar + '<div class="clalign clmode-' + mode + ' ' + (two ? "claid2" : "") + '"><div class="clreadtxt" data-pane="' + esc(o.lName || "Bài") + '">' + (o.lTitle ? '<b class="small muted">' + esc(o.lTitle) + '</b>' : '') + paneHTML(L, ls, "b", o.changed) + '</div>' + (two ? '<div class="clreadtxt" data-pane="' + esc(o.rName || "Nguồn") + '">' + (o.rTitle ? '<b class="small muted">' + esc(o.rTitle) + '</b>' : '') + paneHTML(R, rs, "s", o.rChanged) + '</div>' : '') + '</div>';
}
function cmpBox(key, L, R, o){
  return '<div class="cmpbox" data-cmp="' + esc(key) + '"><div class="clsearch"><input type="search" data-cmpsearch placeholder="Tìm từ khoá ở cả hai cột (Enter: chỗ tiếp theo, Shift+Enter: chỗ trước)" value="' + esc(CMP.q[key] || "") + '"><button type="button" class="btn quiet sm" data-cmpnav="-1" aria-label="Chỗ trước">↑</button><button type="button" class="btn quiet sm" data-cmpnav="1" aria-label="Chỗ tiếp theo">↓</button><span class="small muted" data-cmpcount></span></div>' + cmpAlign(key, L, R, o) + '</div>';
}
function cmpSearch(cont, jump){
  if(!cont) return; var key = cont.getAttribute("data-cmp");
  var q = (CMP.q[key] || "").trim(), panes = cont.querySelectorAll(".clreadtxt"), cnt = cont.querySelector("[data-cmpcount]");
  panes.forEach(function(p){ if(p.dataset.orig === undefined) p.dataset.orig = p.innerHTML; else p.innerHTML = p.dataset.orig; });
  if(!q){ if(cnt) cnt.textContent = ""; CMP.idx[key] = -1; return; }
  var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "gi"), per = [];
  panes.forEach(function(p){
    var n = 0, walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [], t;
    while((t = walk.nextNode())) nodes.push(t);
    nodes.forEach(function(tn){
      var txt = tn.nodeValue, m, last = 0, frag = null; re.lastIndex = 0;
      while((m = re.exec(txt))){ if(!m[0]){ re.lastIndex++; continue; } frag = frag || document.createDocumentFragment(); frag.appendChild(document.createTextNode(txt.slice(last, m.index))); var mk = document.createElement("mark"); mk.className = "clhit"; mk.textContent = m[0]; frag.appendChild(mk); last = m.index + m[0].length; n++; }
      if(frag){ frag.appendChild(document.createTextNode(txt.slice(last))); tn.parentNode.replaceChild(frag, tn); }
    });
    per.push(p.getAttribute("data-pane") + ": " + n);
  });
  var hits = cont.querySelectorAll("mark.clhit");
  if(!hits.length){ if(cnt) cnt.textContent = "Không thấy (" + per.join(" · ") + ")"; CMP.idx[key] = -1; return; }
  var i = CMP.idx[key]; if(i === undefined) i = -1;
  if(jump) i = ((i < 0 ? (jump > 0 ? -1 : 0) : i) + jump + hits.length) % hits.length; else if(i < 0 || i >= hits.length) i = 0;
  CMP.idx[key] = i;
  var cur = hits[i]; cur.classList.add("cur");
  var pane = cur.closest(".clreadtxt"), scrollTo = function(pn, mk){ var off = mk.getBoundingClientRect().top - pn.getBoundingClientRect().top + pn.scrollTop; pn.scrollTop = Math.max(0, off - pn.clientHeight / 2); };
  if(pane){
    scrollTo(pane, cur);
    var ord = Array.prototype.indexOf.call(pane.querySelectorAll("mark.clhit"), cur);
    panes.forEach(function(p){ if(p === pane) return; var hs = p.querySelectorAll("mark.clhit"); if(hs.length){ var m2 = hs[Math.min(ord, hs.length - 1)]; m2.classList.add("pair"); scrollTo(p, m2); } });
  }
  if(cnt) cnt.textContent = (i + 1) + "/" + hits.length + " · " + per.join(" · ");
}
function cmpRestore(root){ (root || document).querySelectorAll(".cmpbox").forEach(function(c){ if(CMP.q[c.getAttribute("data-cmp")]) cmpSearch(c, 0); }); }

/* ---- bảng dữ kiện và dấu hiệu lời người soạn (dùng ở bước Nội dung và checklist) ---- */
function clFactTable(paras, ref, refName){
  refName = refName || "nguồn";
  var facts = clFacts(paras.join("\n")), bad = 0, has = !!(ref || "").trim();
  var ctxN = 0;
  var rows = facts.map(function(x){ var hit = x.stray ? "" : (has ? clInSrc(ref, x) : null), ctx = has && !hit && x.ctx; if(ctx) ctxN++; else if(x.stray || (has && !hit)) bad++;
    if(x.stray) return {miss:true, r:["ký tự lạc: <b>" + esc(x.v) + "</b>", clMark(x.s, [x.v]), '<span class="no">chữ "' + esc(x.v) + '" đứng một mình: có thể là nhãn người nói còn sót, xoá đi</span>']};
    var mk = [x.v].concat(x.t === "số" && hit ? clNumWords(x.v.replace("%", "")) : []);
    return {miss:has && !hit && !ctx, ctx:ctx, r:[esc(x.t) + ": <b>" + esc(x.v) + "</b>", clMark(x.s, [x.v]), hit === null ? '<span class="muted">—</span>' : (hit ? clMark(hit, mk) : (ctx ? '<span class="warnc">không có trong ' + esc(refName) + ': chi tiết bối cảnh người soạn thêm, xem có hợp không</span>' : '<span class="no">không thấy trong ' + esc(refName) + '</span>'))]}; })
    .sort(function(a, b){ return (b.miss ? 2 : b.ctx ? 1 : 0) - (a.miss ? 2 : a.ctx ? 1 : 0); }).map(function(x){ return x.r; });
  return '<p class="small">' + facts.length + ' dữ kiện (con số, tên riêng) trong bài' + (has ? ', <b class="' + (bad ? "no" : "ok") + '">' + bad + ' không thấy nguyên dạng trong ' + esc(refName) + '</b> (có thể do diễn đạt lại: xem câu bên phải để quyết định)' + (ctxN ? ', ' + ctxN + ' chi tiết bối cảnh (thứ trong tuần) không tính là lỗi' : '') : '') + '.</p>' + (facts.length ? clTbl(rows, ["Dữ kiện", "Câu trong bài", "Câu trong " + refName]) : '');
}
function clEditTable(text, ref, refName){
  refName = refName || "nguồn";
  var hits = [], has = !!(ref || "").trim();
  var L = typeof qIsR === "function" && !qIsR(), RE = L ? CL_EDIT_RE_L : CL_EDIT_RE;
  clSents(text).forEach(function(s){ var m = s.match(RE); if(!m) return; var uniq = m.filter(function(x, i, a){ return a.indexOf(x) === i; }); var inSrc = has ? uniq.filter(function(w){ return w !== "!" && new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(ref); }) : []; hits.push([clMark(s, uniq), esc(uniq.join(", ")), has ? (inSrc.length === uniq.length ? '<span class="muted">' + esc(refName) + ' cũng dùng</span>' : '<span class="warnc">' + esc(refName) + ' không dùng: có thể là lời người soạn</span>') : '<span class="muted">—</span>']); });
  return (hits.length ? '<p class="small">' + hits.length + ' câu có dấu hiệu lời người ' + (L ? 'nói tự thêm ý kiến (I think, I believe, honestly, từ đánh giá, should/must). Bài nói gọi người nghe bằng we, you, our là bình thường nên máy không bắt. Ý kiến có trong nguồn thì vẫn đạt; ý kiến nguồn không có là thông tin bịa thêm.' : 'viết (ngôi thứ nhất, thứ hai, từ đánh giá, câu cảm thán, should/must). Câu thuật lại ý tác giả gốc thì vẫn đạt.') + '</p>' + clTbl(hits, ["Câu", "Dấu hiệu", "So với " + refName]) : '<p class="small ok">Máy không thấy dấu hiệu lời bình luận của người soạn.</p>') + '<p class="small muted">Máy chỉ bắt được các dấu hiệu từ ngữ; vẫn đọc lại cả bài.</p>';
}

/* ---- các chỗ đặt khung đối chiếu trên trang ---- */
var CMP_MOUNTS = {
  nd: function(){
    var d = S.slots.draft || "", oid = origId(), ref = (oid === "src" ? clSrcText() : S.slots[oid]) || "", isR = qIsR(), refName = oid === "facts" ? "đoạn dữ kiện" : "nguồn";
    if(!d.trim()) return '<p class="small muted">Chưa có bài.</p>';
    if(!ref.trim()) return '<p class="small no">Chưa có ' + (oid === "facts" ? "đoạn dữ kiện (bước Viết bài)" : "văn bản nguồn tiếng Anh (bước Nguồn)") + ' nên không đặt cạnh nhau được.' + (S.srcMode === "pdf" ? " Nguồn là PDF: dán chữ của phần dùng vào ô ở mục 4 bên dưới để trang có chữ mà so." : "") + '</p>';
    var open = function(k){ return CMP.open && CMP.open[k] ? " open" : ""; };
    return cmpBox("nd", clUnits(), cmpParas(ref), {lName:"Bài", rName:oid === "facts" ? "Dữ kiện" : "Nguồn", rTitle:oid === "facts" ? "Đoạn dữ kiện" : "Văn bản nguồn"})
      + '<details class="box" data-ck="fact"' + open("fact") + '><summary>Bảng dữ kiện: con số, tên riêng trong bài so với ' + refName + '</summary>' + clFactTable(clParasOf(), ref, refName) + '</details>'
      + '<details class="box" data-ck="edit"' + open("edit") + '><summary>Câu có dấu hiệu lời người soạn</summary>' + clEditTable(d, ref, refName) + '</details>';
  },
  tr: function(){
    var vi = S.slots.srcVi || "", en = S.slots.src || "";
    if(!vi.trim() || !en.trim()) return '<p class="small muted">Cần có nguồn tiếng Việt và bản dịch thì mới đặt cạnh nhau được.</p>';
    return cmpBox("tr", cmpParas(en), cmpParas(vi), {lName:"Bản dịch", rName:"Nguồn tiếng Việt", lTitle:"Bản dịch tiếng Anh", rTitle:"Nguồn tiếng Việt", defMode:"kw", noNomatch:true, note:"Hai thứ tiếng nên trang chỉ khớp được con số và tên riêng; ghép câu dựa vào đó."})
      + '<details class="box" data-ck="trfact"><summary>Bảng con số, tên riêng: bản dịch so với nguồn tiếng Việt</summary>' + clFactTable(cmpParas(en).map(function(x){ return x.t; }), vi, "nguồn tiếng Việt") + '</details>';
  },
  fa: function(){
    var f = S.slots.facts || "", src = clSrcText();
    if(!f.trim() || !src.trim()) return '<p class="small muted">Cần có văn bản nguồn tiếng Anh và đoạn dữ kiện thì mới đặt cạnh nhau được.</p>';
    return cmpBox("fa", cmpParas(f), cmpParas(src), {lName:"Dữ kiện", rName:"Nguồn", lTitle:"Đoạn dữ kiện", rTitle:"Văn bản nguồn", kwMax:4})
      + '<details class="box" data-ck="fafact"><summary>Bảng con số, tên riêng: đoạn dữ kiện so với nguồn</summary>' + clFactTable(cmpParas(f).map(function(x){ return x.t; }), src, "nguồn") + '</details>';
  }
};
function cmpRenderMounts(force){
  document.querySelectorAll("[data-cmpmount]").forEach(function(m){
    var scr = m.closest(".screen"); if(scr && scr.classList.contains("hidden") && !force) return;
    var k = m.getAttribute("data-cmpmount"), fn = CMP_MOUNTS[k]; if(!fn) return;
    CMP.open = CMP.open || {}; m.querySelectorAll("details[data-ck]").forEach(function(d){ CMP.open[d.getAttribute("data-ck")] = d.open; });
    var focus = document.activeElement && m.contains(document.activeElement) && document.activeElement.hasAttribute("data-cmpsearch");
    var h; try{ h = fn(); }catch(e){ h = '<p class="small no">Không dựng được khung đối chiếu.</p>'; }
    m.innerHTML = h; cmpRestore(m);
    if(focus){ var inp = m.querySelector("[data-cmpsearch]"); if(inp){ inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; } }
  });
}
document.addEventListener("click", function(ev){
  var t = ev.target.closest && ev.target.closest("[data-cmpmode],[data-cmpnav]"); if(!t) return;
  var cont = t.closest(".cmpbox"); if(!cont) return; var key = cont.getAttribute("data-cmp");
  if(t.hasAttribute("data-cmpnav")){ cmpSearch(cont, +t.getAttribute("data-cmpnav")); return; }
  var mode = t.getAttribute("data-cmpmode"); CMP.mode[key] = mode;
  var al = cont.querySelector(".clalign"); if(al) al.className = al.className.replace(/clmode-\w+/, "clmode-" + mode);
  cont.querySelectorAll("[data-cmpmode]").forEach(function(b){ var on = b.getAttribute("data-cmpmode") === mode; b.classList.toggle("primary", on); b.classList.toggle("quiet", !on); });
});
document.addEventListener("keydown", function(ev){
  var t = ev.target; if(!t.hasAttribute || !t.hasAttribute("data-cmpsearch") || ev.key !== "Enter") return;
  ev.preventDefault(); cmpSearch(t.closest(".cmpbox"), ev.shiftKey ? -1 : 1);
});
var cmpT; document.addEventListener("input", function(ev){
  var t = ev.target; if(!t.hasAttribute || !t.hasAttribute("data-cmpsearch")) return;
  var cont = t.closest(".cmpbox"), key = cont.getAttribute("data-cmp"); CMP.q[key] = t.value; CMP.idx[key] = -1;
  clearTimeout(cmpT); cmpT = setTimeout(function(){ cmpSearch(cont, 0); }, 200);
});

;

/* =====================================================================
   QUY TRÌNH NHIỀU NGƯỜI: trạng thái, phân công, cổng duyệt, khoá ngữ liệu,
   yêu cầu sửa ngữ liệu, nhật ký, bản đồ chất liệu theo bảng phân bố,
   thẩm định câu hỏi (làm bài ẩn đáp án, quyết định từng câu),
   chế độ nhà phát triển (một người chạy mọi vai).
   Dữ liệu quy trình nằm trong S.wf (đi cùng bài khi lưu thư viện);
   bản tóm tắt S.wf được ghi thêm thành trường wf của bản ghi thư viện
   để làm danh sách "Việc của tôi".
   ===================================================================== */
var WF_ST = ["Chủ đề đề xuất","Đang adapt","Chờ thẩm định ngữ liệu","Ngữ liệu cần sửa","Ngữ liệu đã duyệt (khoá)","Đang soạn câu hỏi","Chờ thẩm định câu hỏi","Câu hỏi cần sửa","Câu hỏi đã duyệt","Đã hoàn thiện","Thay bài / Loại"];
var WF_ROLES = {coord:"Điều phối", nl:"Người soạn ngữ liệu", tdnl:"Người thẩm định ngữ liệu", ch:"Người soạn câu hỏi", tdch:"Người thẩm định câu hỏi"};
var WF_ROLE_ORDER = ["coord","nl","tdnl","ch","tdch"];
var WF_LOCKED = {"Ngữ liệu đã duyệt (khoá)":1, "Đang soạn câu hỏi":1, "Chờ thẩm định câu hỏi":1, "Câu hỏi cần sửa":1, "Câu hỏi đã duyệt":1, "Đã hoàn thiện":1};
var WF_MAXROUND = 2; // số lần trả sửa tối đa trước khi Điều phối quyết (đề xuất của quy trình)

/* ---- chế độ nhà phát triển ---- */
var WFDEV_KEY = "vstep-dev";
function wfDev(){ try{ return JSON.parse(localStorage.getItem(WFDEV_KEY) || "{}"); }catch(e){ return {}; } }
function wfDevSet(o){ try{ localStorage.setItem(WFDEV_KEY, JSON.stringify(o)); }catch(e){} }
function wfDevAllowed(){ return typeof LIB==="undefined" || LIB.role==="admin" || (!LIB.user && !!window.__noGate); }
function wfDevOn(){ return !!wfDev().on && wfDevAllowed(); }
function wfDevRole(){ return wfDev().role || "nl"; }

/* ---- dữ liệu ---- */
function wfData(){ if(!S.wf) S.wf = {st:"", as:{}, log:[], rounds:{nl:0, ch:0}, lock:null, req:null, take:{}, dec:{}, qVer:0}; var w = S.wf; w.as = w.as || {}; w.log = w.log || []; w.rounds = w.rounds || {nl:0, ch:0}; w.take = w.take || {}; w.dec = w.dec || {}; return w; }
function wfMe(){ return (typeof libEmail==="function" && libEmail()) || ""; }
function wfWho(){ var me = wfMe(); return wfDevOn() ? (me || "nhà phát triển") + " (vai " + WF_ROLES[wfDevRole()] + ")" : me; }
function wfIsCoordUser(){ var w = wfData(), me = wfMe(); return !!me && (w.as.coord === me || (typeof libIsAdmin==="function" && libIsAdmin())); }
/* quản trị làm được việc của mọi vai ở mọi bài (vẫn giữ luật không tự duyệt bài mình soạn) */
function wfAdmin(){ return !wfDevOn() && typeof libIsAdmin === "function" && libIsAdmin(); }
function wfHas(role){
  if(wfDevOn()) return wfDevRole() === role;
  if(wfAdmin() && wfMe()) return true;
  var w = wfData(), me = wfMe(); if(!me) return false;
  if(role === "coord") return wfIsCoordUser();
  return w.as[role] === me;
}
function wfSummary(){ var w = wfData(), stAt = 0; for(var i = w.log.length - 1; i >= 0; i--){ if(w.log[i].from !== w.log[i].to){ stAt = w.log[i].at || 0; break; } } return {st:w.st||"", as:w.as, req:w.req ? w.req.st : "", reqNote:w.req ? String(w.req.note || "").slice(0, 160) : "", lockVer:w.lock ? w.lock.ver : 0, rounds:w.rounds, due:w.due || "", dues:w.dues || {}, stAt:stAt}; }
function wfDraftLocked(){ var w = S.wf; if(!w || !w.lock || !WF_LOCKED[w.st]) return false; return !(w.req && w.req.st === "đang sửa"); }

/* ---- điều kiện dùng chung ---- */
function wfNL(){ return clEval("NL"); }
function wfRowsOk(ev, codes){ return codes.filter(function(c){ return ev[c] && ev[c].s !== "ok" && ev[c].s !== "na"; }); }
function wfMachineFails(sc, ev){ return clRows(sc).filter(function(r){ return (r.who === "M" || r.who === "MH") && ev[r.c] && ev[r.c].s === "fail"; }).map(function(r){ return r.c; }); }
function wfOpenMust(sc){ return clNotes(sc).filter(function(n){ return n.st === "Mở" && n.sev === "PHẢI SỬA"; }).length; }
function wfTickBy(codes, notWho){ var tk = clTicks(), bad = []; if(wfDevOn() || !notWho) return bad; codes.forEach(function(c){ if(tk[c] && tk[c].by === notWho) bad.push(c); }); return bad; }
function wfQItems(){ var t = S.slots.questions || ""; return t.trim() ? parseQ(t).items : []; }
function wfCond(ok, text){ return {ok:!!ok, t:text}; }
/* Viết, Nói: cùng quy trình đề xuất → soạn → thẩm định → khoá, rồi Điều phối duyệt hoàn thiện (không có phần câu hỏi) */
function wfIsWS(){ var k = (SPEC[S.spec] || {}).skill; return k === "W" || k === "S"; }
function wfSc(){ return wfIsWS() ? "WS" : "NL"; }
function wfDupCond(){ var d = (typeof LIB !== "undefined" && LIB.items && LIB.items.length) ? libDupes() : []; return [wfCond(!d.length, d.length ? "Trùng bài trong thư viện: " + d.map(function(x){ return x.x.title; }).join("; ") : "Không trùng bài trong thư viện")]; }
function wfApplies(t){ return !t.off && (!t.only || t.only === (wfIsWS() ? "WS" : "RL")); }
function wfWSHuman(){ return clRows("WS").filter(function(r){ return r.who === "H" || r.who === "MH"; }).map(function(r){ return r.c; }); }
function wfWSCond(id){
  var w = wfData();
  if(id === "propose"){ var d = (typeof LIB !== "undefined" && LIB.items.length) ? libDupes() : []; return [wfCond(wsV("theme"), "Có chủ đề (bước Soạn đề)"), wfCond(!d.length, d.length ? "Trùng chủ đề với bài trong thư viện: " + d.map(function(x){ return x.x.title; }).join(", ") : "Không trùng chủ đề với bài trong thư viện")]; }
  if(id === "g1ok") return [wfCond(wsV("theme"), "Có chủ đề")];
  if(id === "nlsub"){ var ev = clEval("WS"), f = wfMachineFails("WS", ev); return [wfCond(wsV("theme"), "Có chủ đề (bước Chủ đề)"), wfCond(wsHasContent(), "Có đề"), wfCond(!f.length, "Mọi dòng máy kiểm của checklist WS không đỏ" + (f.length ? ": còn " + f.join(", ") : ""))]; }
  if(id === "g2ok"){ var sum = clSummary("WS"), by = wfTickBy(wfWSHuman(), w.as.nl); return [wfCond(sum.pass, "Checklist WS đạt: không đỏ, mọi dòng Người đã bấm Đạt, không còn ghi chú PHẢI SỬA mở"), wfCond(!by.length, by.length ? "Các dòng " + by.join(", ") + " do chính người soạn bấm Đạt: người thẩm định phải tự xét" : "Các dòng Người do người thẩm định xét")]; }
  return null;
}

/* ---- các bước chuyển ---- */
var WF_T = [
  {id:"propose", off:true, from:["", "Thay bài / Loại"], to:"Chủ đề đề xuất", role:"nl", label:"Đề xuất chủ đề", cond:function(){ var _ws = wfIsWS() ? wfWSCond("propose") : null; if(_ws) return _ws;
    var ev = wfNL(), d = (typeof LIB!=="undefined" && LIB.items.length) ? libDupes() : [];
    return [wfCond((S.slots.topic||"").trim(), "Có chủ đề (bước Chủ đề)"), wfCond(ev["NL-A4"] && ev["NL-A4"].d.indexOf("Chưa ghi") < 0, "Có nguồn, URL, giấy phép (khung Thông tin nguồn ở bước Nguồn)"), wfCond(!d.length, d.length ? "Trùng bài trong thư viện: " + d.map(function(x){ return x.x.title; }).join("; ") : "Không trùng bài trong thư viện")];
  }},
  {id:"g1ok", off:true, from:["Chủ đề đề xuất"], to:"Đang adapt", role:"coord", label:"Duyệt cổng 1", cond:function(){ var _ws = wfIsWS() ? wfWSCond("g1ok") : null; if(_ws) return _ws;
    var ev = wfNL(), bad = wfRowsOk(ev, ["NL-A1","NL-A2","NL-A3","NL-A4","NL-A6"]);
    return [wfCond(!bad.length, "Phiếu duyệt đề xuất đạt (NL-A1, A2, A3, A4, A6 · trong Phiếu duyệt)" + (bad.length ? ": chưa đạt " + bad.join(", ") : ""))];
  }},
  {id:"g1no", off:true, from:["Chủ đề đề xuất"], to:"Thay bài / Loại", role:"coord", label:"Không duyệt chủ đề (thay bài)", note:true, cond:function(){ return []; }},
  // Bỏ cổng 1 (14/11/2026, theo yêu cầu nhóm): người soạn làm liền từ Chủ đề đến Gửi thẩm định ngữ liệu; chủ đề, nguồn, giấy phép do người thẩm định ngữ liệu xét ở cổng 2 (các dòng NL-A).
  // "Chủ đề đề xuất" chỉ còn ở bài cũ: coi như đang soạn.
  {id:"nlsub", from:["", "Chủ đề đề xuất", "Đang adapt","Ngữ liệu cần sửa"], to:"Chờ thẩm định ngữ liệu", role:"nl", label:"Gửi thẩm định ngữ liệu", cond:function(){ var _ws = wfIsWS() ? wfWSCond("nlsub") : null; if(_ws) return _ws.concat(wfDupCond());
    var ev = wfNL(), f = wfMachineFails("NL", ev), b7 = ["nd-1","nd-2","nd-3"].every(function(g){ return S.gates && S.gates[g]; }), m = mapStatus();
    return [wfCond((S.slots.topic||"").trim(), "Có chủ đề (bước Chủ đề)"), wfCond(ev["NL-A4"] && ev["NL-A4"].d.indexOf("Chưa ghi") < 0, "Có nguồn, URL, giấy phép (khung Thông tin nguồn ở bước Nguồn)"), wfCond((S.slots.draft||"").trim(), "Có bài"), wfCond(!f.length, "Mọi dòng máy kiểm của checklist NL không đỏ" + (f.length ? ": còn " + f.join(", ") : "")), wfCond(b7, "Đã đối chiếu nguồn (bước Nội dung, 3 ô cuối bước)"), wfCond(m.full, "Bản đồ chất liệu phủ đủ mọi dòng của bảng phân bố" + (m.full ? "" : ": " + m.why)), wfCond(!wfOpenMust("NL"), "Không còn ghi chú NL PHẢI SỬA đang mở")].concat(wfDupCond());
  }},
  {id:"g2ok", from:["Chờ thẩm định ngữ liệu"], to:"Ngữ liệu đã duyệt (khoá)", role:"tdnl", four:"nl", label:"Duyệt cổng 2 và khoá bài", cond:function(){ var _ws = wfIsWS() ? wfWSCond("g2ok") : null; if(_ws) return _ws;
    var sum = clSummary("NL"), by = wfTickBy(["NL-C1","NL-C2","NL-C3","NL-C4","NL-C5","NL-D1","NL-D2","NL-D5"], wfData().as.nl);
    return [wfCond(sum.pass, "Checklist NL đạt: không đỏ, mọi dòng Người đã bấm Đạt, không còn ghi chú PHẢI SỬA mở"), wfCond(!by.length, by.length ? "Các dòng " + by.join(", ") + " do chính người soạn bấm Đạt: người thẩm định phải tự xét" : "Các dòng Người do người thẩm định bấm")];
  }, act:function(w){ var d = S.slots.draft||""; w.lock = {ver:(w.lock ? w.lock.ver : (w.lockVerMax || 0)) + 1, hash:qHash(d), text:d, at:Date.now(), by:wfWho()}; w.req = null; }},
  {id:"g2back", from:["Chờ thẩm định ngữ liệu"], to:"Ngữ liệu cần sửa", role:"tdnl", four:"nl", label:"Trả sửa ngữ liệu", cond:function(){
    var w = wfData(); return [wfCond(wfOpenMust(wfSc()) || clNotes(wfSc()).some(function(n){ return n.st === "Mở"; }), "Có ghi chú NL đang mở (nhận xét theo đoạn hoặc theo dòng bản đồ)"), wfCond(w.rounds.nl < WF_MAXROUND, "Chưa quá " + WF_MAXROUND + " lần trả sửa (đã " + w.rounds.nl + "); quá thì Điều phối quyết")];
  }, act:function(w){ w.rounds.nl++; }},
  {id:"g2backc", from:["Chờ thẩm định ngữ liệu"], to:"Ngữ liệu cần sửa", role:"coord", label:"Điều phối: trả sửa thêm lần nữa", note:true, cond:function(){ var w = wfData(); return [wfCond(w.rounds.nl >= WF_MAXROUND, "Đã trả sửa " + w.rounds.nl + " lần (Điều phối chỉ quyết khi đủ " + WF_MAXROUND + " lần)")]; }, act:function(w){ w.rounds.nl++; }},
  {id:"g2no", from:["Chờ thẩm định ngữ liệu","Ngữ liệu cần sửa","Đang adapt"], to:"Thay bài / Loại", role:"tdnl", label:"Thay bài", note:true, cond:function(){ return []; }},
  {id:"g2noc", from:["", "Chủ đề đề xuất", "Đang adapt","Chờ thẩm định ngữ liệu","Ngữ liệu cần sửa","Ngữ liệu đã duyệt (khoá)","Đang soạn câu hỏi","Chờ thẩm định câu hỏi","Câu hỏi cần sửa"], to:"Thay bài / Loại", role:"coord", label:"Điều phối: thay bài hoặc loại", note:true, cond:function(){ return []; }},
  {id:"chstart", only:"RL", from:["Ngữ liệu đã duyệt (khoá)"], to:"Đang soạn câu hỏi", role:"ch", label:"Nhận bài, bắt đầu soạn câu hỏi", cond:function(){ return [wfCond(wfData().lock, "Bài đã khoá")]; }, act:function(w){ w.qVer = w.lock.ver; }},
  {id:"chsub", only:"RL", from:["Đang soạn câu hỏi","Câu hỏi cần sửa"], to:"Chờ thẩm định câu hỏi", role:"ch", label:"Gửi thẩm định câu hỏi", cond:function(){
    var w = wfData(), ev = clEval("CH"), f = wfMachineFails("CH", ev), self = wfRowsOk(ev, ["CH-E1","CH-E2","CH-E3","CH-E4"]);
    return [wfCond(wfQItems().length, "Có bộ câu hỏi"), wfCond(!f.length, "Mọi dòng máy kiểm của checklist CH không đỏ" + (f.length ? ": còn " + f.join(", ") : "")), wfCond(!self.length, "Đã tự soát 4 mục từng câu (CH-E1 đến E4)" + (self.length ? ": chưa xong " + self.join(", ") : "")), wfCond(!w.req, "Không có yêu cầu sửa ngữ liệu đang mở"), wfCond(w.lock && w.qVer === w.lock.ver, "Câu hỏi soạn trên bản khoá mới nhất" + (w.lock ? " (bản " + w.lock.ver + ")" : "")), wfCond(!wfOpenMust("CH"), "Không còn ghi chú CH PHẢI SỬA đang mở")];
  }},
  {id:"g3ok", only:"RL", from:["Chờ thẩm định câu hỏi"], to:"Câu hỏi đã duyệt", role:"tdch", four:"ch", label:"Duyệt cổng 3", cond:function(){
    var R = wfReviewState(), ev = clEval("CH"), f = wfMachineFails("CH", ev), hb = wfRowsOk(ev, ["CH-D5","CH-E5"]), by = wfTickBy(["CH-D5","CH-E5"], wfData().as.ch);
    return [wfCond(R.n && R.taken === R.n, "Người thẩm định đã làm cả bộ khi ẩn đáp án (" + R.taken + "/" + R.n + ")"), wfCond(R.n && R.pass === R.n, "Mọi câu có quyết định Đạt (" + R.pass + "/" + R.n + ")"), wfCond(!hb.length && !by.length, "Dòng Người của checklist CH (D5, E5) do người thẩm định bấm Đạt"), wfCond(!f.length, "Không còn dòng đỏ"), wfCond(!wfOpenMust("CH"), "Không còn ghi chú CH PHẢI SỬA đang mở")];
  }},
  {id:"g3back", only:"RL", from:["Chờ thẩm định câu hỏi"], to:"Câu hỏi cần sửa", role:"tdch", four:"ch", label:"Trả sửa câu hỏi", cond:function(){
    var R = wfReviewState(), w = wfData();
    return [wfCond(R.n && R.decided === R.n, "Câu nào cũng có quyết định (" + R.decided + "/" + R.n + ")"), wfCond(R.pass < R.n, "Có câu chưa Đạt, kèm nhận xét"), wfCond(w.rounds.ch < WF_MAXROUND, "Chưa quá " + WF_MAXROUND + " lần trả sửa (đã " + w.rounds.ch + "); quá thì Điều phối quyết")];
  }, act:function(w){ w.rounds.ch++; w.qReviewed = S.slots.questions || ""; }},
  {id:"g3backc", only:"RL", from:["Chờ thẩm định câu hỏi"], to:"Câu hỏi cần sửa", role:"coord", label:"Điều phối: trả sửa câu hỏi thêm lần nữa", note:true, cond:function(){ var w = wfData(); return [wfCond(w.rounds.ch >= WF_MAXROUND, "Đã trả sửa " + w.rounds.ch + " lần")]; }, act:function(w){ w.rounds.ch++; w.qReviewed = S.slots.questions || ""; }},
  // quay lại khi một bước chưa ổn (đều phải ghi lý do, ghi vào nhật ký)
  {id:"nlwd", from:["Chờ thẩm định ngữ liệu"], to:"Đang adapt", role:"nl", label:"Rút lại để sửa tiếp", back:true, note:true, ph:"Lý do rút lại (người thẩm định sẽ thấy trong nhật ký)", cond:function(){ return []; }},
  {id:"g2undo", from:["Ngữ liệu đã duyệt (khoá)"], to:"Chờ thẩm định ngữ liệu", role:"tdnl", four:"nl", label:"Mở lại cổng 2 (chưa ai nhận soạn câu hỏi)", back:true, note:true, ph:"Vì sao mở lại: duyệt nhầm, phát hiện lỗi…", cond:function(){ return []; }, act:wfUnlock},
  {id:"g2undoc", from:["Ngữ liệu đã duyệt (khoá)","Đang soạn câu hỏi","Câu hỏi cần sửa","Chờ thẩm định câu hỏi"], to:"Chờ thẩm định ngữ liệu", role:"coord", label:"Điều phối: mở lại cổng 2, thẩm định lại toàn bài", back:true, note:true, ph:"Vì sao phải thẩm định lại bài (câu hỏi đã soạn được giữ, dấu soát từng câu bị bỏ)", cond:function(){ return []; }, act:function(w){ wfUnlock(w); S.qman = {}; w.take = {}; w.dec = {}; }},
  {id:"chwd", only:"RL", from:["Chờ thẩm định câu hỏi"], to:"Đang soạn câu hỏi", role:"ch", label:"Rút lại câu hỏi để sửa tiếp", back:true, note:true, ph:"Lý do rút lại", cond:function(){ return []; }},
  {id:"g3undo", only:"RL", from:["Câu hỏi đã duyệt"], to:"Chờ thẩm định câu hỏi", role:"tdch", four:"ch", label:"Mở lại cổng 3", back:true, note:true, ph:"Vì sao mở lại", cond:function(){ return []; }},
  {id:"g4back", only:"RL", from:["Câu hỏi đã duyệt"], to:"Câu hỏi cần sửa", role:"coord", label:"Điều phối: trả câu hỏi về sửa", back:true, note:true, ph:"Cần sửa gì (nên ghi thêm ghi chú CH theo khuôn)", cond:function(){ return []; }},
  {id:"reopen", from:["Đã hoàn thiện"], to:"Câu hỏi đã duyệt", toFn:function(){ return wfIsWS() ? "Ngữ liệu đã duyệt (khoá)" : "Câu hỏi đã duyệt"; }, role:"coord", label:"Điều phối: mở lại bài đã hoàn thiện", back:true, note:true, ph:"Vì sao mở lại", cond:function(){ return []; }},
  {id:"restore", from:["Thay bài / Loại"], to:"", toFn:function(w){ for(var i = w.log.length - 1; i >= 0; i--){ var e = w.log[i]; if(e.to === "Thay bài / Loại" && e.from && e.from !== "Thay bài / Loại") return e.from; } return "Chủ đề đề xuất"; }, role:"coord", label:"Điều phối: khôi phục bài về trạng thái trước khi loại", back:true, note:true, cond:function(){ return []; }},
  {id:"g4", only:"RL", from:["Câu hỏi đã duyệt"], to:"Đã hoàn thiện", role:"coord", label:"Duyệt cổng 4 (hoàn thiện)", cond:function(){
    var f = S.fields || {}, miss = [["pc-src","tên nguồn"],["pc-url","link"],["pc-lic","giấy phép"]].filter(function(x){ return !String(f[x[0]]||"").trim(); }).map(function(x){ return x[1]; });
    var set = wfSetCheck();
    return [wfCond(!miss.length, "Phiếu nộp đủ nguồn, link, giấy phép" + (miss.length ? ": thiếu " + miss.join(", ") : "")), wfCond(String(S.slots.pfCov||"").trim(), "Đã ghi kết quả Text Profiler (bước Từ vựng)"), wfCond(wfData().lock, "Bài đã khoá"), {ok:true, info:true, t:set}];
  }},
  {id:"g4ws", only:"WS", from:["Ngữ liệu đã duyệt (khoá)"], to:"Đã hoàn thiện", role:"coord", label:"Duyệt hoàn thiện đề", cond:function(){
    var c = [wfCond(wfData().lock, "Đề đã khoá sau thẩm định")]; if(S.spec === "W2") c.push(wfCond(wsV("adapted"), "Có trích nguồn đoạn trích (Adapted from)"));
    c.push({ok:true, info:true, t:wfSetCheck()}); return c;
  }}
];
function wfSetCheck(){
  var setName = (S.libSet || "").trim(); if(!setName) return "Bài chưa gắn bộ đề (ô Bộ đề trong Thư viện).";
  if(typeof LIB === "undefined" || !LIB.items.length) return "Mở Thư viện để kiểm cấp bộ đề " + setName + ".";
  var xs = LIB.items.filter(function(x){ return (x.meta||{}).set === setName; }), parts = {}, asia = xs.some(function(x){ var m = x.meta||{}; return m.skill === "R" && m.asia; });
  xs.forEach(function(x){ parts[(x.meta||{}).spec] = 1; });
  // chỉ xét các phần cùng loại đề với bài này (Đề Đọc: R1–R4; Đề Nghe: L1, L2a–c, L3a–c)
  var sk = (SPEC[S.spec] || {}).skill, miss = Object.keys(SPEC).filter(function(k){ return SPEC[k].skill === sk && !parts[k] && k !== S.spec; });
  if(wfIsWS()) return "Bộ đề " + setName + ": " + (miss.length ? "còn thiếu " + miss.join(", ") : "đủ phần") + " (chỉ để Điều phối xem, không chặn).";
  return "Bộ đề " + setName + ": " + (miss.length ? "còn thiếu " + miss.join(", ") : "đủ phần") + "; " + (asia || LIB_ASIA.test((S.slots.topic||"") + " " + (S.slots.draft||"")) && qIsR() ? "có" : "chưa có") + " bài Đọc bối cảnh Việt Nam hoặc châu Á (chỉ để Điều phối xem, không chặn).";
}
/* yêu cầu sửa ngữ liệu (cờ đi kèm trạng thái soạn câu hỏi) */
var WF_R = [
  {id:"g1fix", off:true, when:function(w){ return false; }, role:"coord", label:"Yêu cầu sửa đề xuất (giữ trạng thái)", note:true, ph:"Cần sửa gì: chủ đề, nguồn, giấy phép… (thành ghi chú NL PHẢI SỬA)", act:function(w, note){ clAddNotes([{code:"KHÁC", sev:"PHẢI SỬA", loc:"cổng 1", issue:note, by:wfWho()}], wfSc(), "cổng 1"); }},
  {id:"rq", when:function(w){ return (w.st === "Đang soạn câu hỏi" || w.st === "Câu hỏi cần sửa") && !w.req; }, role:"ch", label:"Gửi yêu cầu sửa ngữ liệu", note:true, ph:"Chỗ cần đổi (đoạn, câu); nội dung đề xuất; lý do (ô nào của bảng phân bố đang không hỏi được)", act:function(w, note){ w.req = {st:"chờ sửa", note:note, by:wfWho(), at:Date.now()}; }},
  {id:"rqopen", when:function(w){ return w.req && w.req.st === "chờ sửa"; }, role:"nl", label:"Mở khoá để sửa theo yêu cầu", act:function(w){ w.req.st = "đang sửa"; }},
  {id:"rqsend", when:function(w){ return w.req && w.req.st === "đang sửa"; }, role:"nl", label:"Gửi duyệt phần sửa", cond:function(){ var f = wfMachineFails("NL", wfNL()); return [wfCond((S.slots.draft||"") !== wfData().lock.text, "Bài đã khác bản khoá"), wfCond(!f.length, "Chạy lại kiểm bước 2: không còn dòng đỏ" + (f.length ? " (" + f.join(", ") + ")" : ""))]; }, act:function(w){ w.req.st = "chờ duyệt"; }},
  {id:"rqok", when:function(w){ return w.req && w.req.st === "chờ duyệt"; }, role:"tdnl", four:"nl", label:"Duyệt phần sửa, khoá bản mới", act:function(w){ wfRelock(w); }},
  {id:"rqback", when:function(w){ return w.req && w.req.st === "chờ duyệt"; }, role:"tdnl", label:"Trả lại phần sửa", note:true, act:function(w){ w.req.st = "đang sửa"; }},
  {id:"rqfull", when:function(w){ return w.req && w.req.st === "chờ duyệt"; }, role:"tdnl", label:"Phần sửa lớn: thẩm định lại toàn bài (cổng 2 đầy đủ)", note:true, act:function(w){ w.req = null; w.st = "Chờ thẩm định ngữ liệu"; S.qman = {}; clTicksResetNL(); }},
  {id:"rqcancel", when:function(w){ return !!w.req; }, role:"ch", label:"Huỷ yêu cầu sửa ngữ liệu", note:true, act:function(w){ if(w.lock && (S.slots.draft||"") !== w.lock.text){ S.slots.draft = w.lock.text; wfSetDraftQuiet(w.lock.text); } w.req = null; }}
];
function wfUnlock(w){ if(w.lock){ w.lockVerMax = Math.max(w.lockVerMax || 0, w.lock.ver); } w.lock = null; w.req = null; }
function clTicksResetNL(){ var tk = clTicks(); ["NL-C1","NL-C2","NL-C3","NL-C4","NL-C5","NL-D1","NL-D2","NL-D5"].forEach(function(c){ delete tk[c]; }); }
function wfSetDraftQuiet(t){ wfBypass = true; try{ setSlot("draft", t); }finally{ wfBypass = false; } }
var wfBypass = false;
function wfUnitsOf(text){
  if(qIsR()) return analyze(text||"").body.map(function(b){ return b.text; });
  return (text||"").split(/\n/).map(function(s){ return s.trim(); }).filter(Boolean);
}
function wfRelock(w){
  var old = w.lock ? w.lock.text : "", d = S.slots.draft || "", had = {}, changed = [];
  wfUnitsOf(old).forEach(function(u){ had[qHash(normQ(u))] = 1; });
  var U = wfUnitsOf(d); U.forEach(function(u, i){ if(!had[qHash(normQ(u))]) changed.push(i); });
  w.lock = {ver:(w.lock ? w.lock.ver : 0) + 1, hash:qHash(d), text:d, at:Date.now(), by:wfWho()};
  w.qVer = w.lock.ver; w.req = null;
  // câu hỏi có căn cứ trong phần vừa sửa: bỏ dấu đã soát, thêm ghi chú
  var passN = qNorm(d), recheck = [];
  wfQItems().forEach(function(it){
    var hit = !it.basis || qFind(passN, it.basis) < 0;
    if(!hit) changed.forEach(function(i){ if(qFind(qNorm(U[i]), it.basis) >= 0) hit = true; });
    if(hit){ recheck.push(it.n); if(S.qman) delete S.qman[qSig(it)]; delete w.dec[qSig(it)]; delete w.take[qSig(it)]; }
  });
  if(recheck.length) clAddNotes(recheck.map(function(n){ return {code:"CH-B1", sev:"PHẢI SỬA", loc:"câu " + n, range:"chỉ câu " + n, issue:"Căn cứ nằm trong phần ngữ liệu vừa sửa (bản khoá " + w.lock.ver + "): soát lại câu này, chép lại căn cứ nếu cần.", by:"trang"}; }), "CH", "khoá bản mới");
  w.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:w.st, to:w.st, act:"Khoá bản " + w.lock.ver, note:(changed.length ? "Phần đổi: " + changed.map(function(i){ return (qIsR() ? "đoạn " : "dòng ") + (i+1); }).join(", ") : "không đổi đoạn nào") + (recheck.length ? "; câu cần soát lại: " + recheck.join(", ") : "")});
}

/* ---- thực hiện ---- */
function wfAvail(t){
  var w = wfData(), me = wfMe(), why = [];
  if(!wfApplies(t) || (t.when ? !t.when(w) : t.from.indexOf(w.st || "") < 0)) return {t:t, why:["không áp dụng ở trạng thái hiện tại"], conds:[], ok:false};
  var claim = !wfDevOn() && !!me && t.role !== "coord" && !w.as[t.role];
  if(!wfHas(t.role) && !claim) why.push(wfDevOn() ? "đổi vai sang " + WF_ROLES[t.role] : "việc của " + WF_ROLES[t.role] + (t.role !== "coord" && w.as[t.role] ? " (" + w.as[t.role] + ")" : (t.role === "coord" ? " (" + (w.as.coord || "quản trị thư viện") + ")" : " (chưa phân công)")));
  if(t.four && !wfDevOn() && me && (w.as[t.four] === me)) why.push("bạn là " + WF_ROLES[t.four] + " của bài này: không tự duyệt");
  if(!wfDevOn() && !me) why.push("đăng nhập Thư viện (hoặc bật chế độ nhà phát triển để chạy thử một mình)");
  var conds = t.cond ? t.cond() : [];
  return {t:t, why:why, conds:conds, ok:!why.length && conds.every(function(c){ return c.ok; })};
}
function wfDo(t, note, isReq){
  var w = wfData(), from = w.st || "";
  if(t.note && !String(note||"").trim()){ toast("Cần ghi nhận xét hoặc lý do."); return; }
  var A = wfAvail(t); if(!A.ok){ toast("Chưa đủ điều kiện."); return; }
  if(t.role !== "coord" && !w.as[t.role] && wfMe() && !wfDevOn()){ w.as[t.role] = wfMe(); w.log.push({at:Date.now(), by:wfWho(), from:from, to:from, act:"Nhận vai " + WF_ROLES[t.role], note:""}); }
  var forWho = wfAdmin() && t.role !== "coord" && w.as[t.role] && w.as[t.role] !== wfMe() ? " (quản trị làm thay " + (typeof peopleName === "function" ? peopleName(w.as[t.role]) : w.as[t.role]) + ", " + WF_ROLES[t.role] + ")" : "";
  if(t.act) t.act(w, note);
  // cổng 1: Điều phối kiêm soạn ngữ liệu được tự duyệt; cổng 2 xét lại chủ đề, nguồn, giấy phép
  var g1self = t.id === "g1ok" && !wfDevOn() && !!wfMe() && w.as.nl === wfMe();
  if(t.id === "g1ok") w.g1self = g1self;
  if(!isReq){ w.st = t.toFn ? t.toFn(w) : t.to; }
  w.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:from, to:w.st, act:t.label + (g1self ? " (Điều phối kiêm soạn ngữ liệu, tự duyệt)" : "") + forWho, note:note||""});
  save(); wfRender(); try{ clRender(); renderQ(); }catch(e){} updateStepper();
  if(typeof LIB !== "undefined" && LIB.user && LIB.role && LIB.role !== "none"){ var pr = libSave(false); if(pr && pr.then && typeof ntfWorkflow === "function") pr.then(function(){ if(!LIB.err && S.lib && S.lib.id) ntfWorkflow(t, note); }); }
  else toast(t.label + ": đã ghi trên máy này" + (wfDevOn() ? " (chế độ nhà phát triển)." : ". Lưu lên Thư viện để người khác thấy."));
}
function wfForce(st, note){
  var w = wfData(), from = w.st;
  w.st = st; if(WF_LOCKED[st] && !w.lock){ var d = S.slots.draft||""; w.lock = {ver:1, hash:qHash(d), text:d, at:Date.now(), by:wfWho()}; w.qVer = 1; }
  w.log.push({at:Date.now(), by:wfWho(), dev:true, from:from, to:st, act:"Đặt trạng thái (nhà phát triển)", note:note||""});
  save(); wfRender(); try{ clRender(); renderQ(); }catch(e){} updateStepper();
}

/* ---- thẩm định câu hỏi: làm bài ẩn đáp án, quyết định từng câu ---- */
var WF_DEC = ["Đạt","Sửa nhỏ","Viết lại","Loại"];
function wfReviewState(){
  var w = wfData(), its = wfQItems(), o = {n:its.length, taken:0, decided:0, pass:0, wrong:[], items:its};
  its.forEach(function(it){ var g = qSig(it), a = w.take[g], d = w.dec[g]; if(a){ o.taken++; if(a.a !== it.ans) o.wrong.push(it.n); } if(d && d.d){ o.decided++; if(d.d === "Đạt") o.pass++; } });
  return o;
}
var wfTaking = false;
function wfPrevItem(n){ var t = wfData().qReviewed; if(!t) return null; var P = parseQ(t).items.filter(function(x){ return x.n === n; }); return P[0] || null; }
function wfItemText(it){ return (it.stem||"") + " | A. " + (it.opts.A||"") + " | B. " + (it.opts.B||"") + " | C. " + (it.opts.C||"") + " | D. " + (it.opts.D||"") + " | Đáp án " + (it.ans||""); }
function wfReviewHTML(){
  var w = wfData(), R = wfReviewState(), show = w.st === "Chờ thẩm định câu hỏi" || (wfDevOn() && wfDevRole() === "tdch") || R.decided || R.taken;
  if(!show || !R.n) return "";
  var mine = wfHas("tdch"), h = '<h3>Thẩm định câu hỏi (cổng 3)</h3>';
  if(wfTaking){
    var todo = R.items.filter(function(it){ return !w.take[qSig(it)]; });
    h += '<p class="small muted">Đang làm bài: đáp án và kết quả máy kiểm được ẩn. Chọn đáp án cho ' + todo.length + ' câu' + (todo.length < R.n ? ' (các câu đã làm trước đó và chưa đổi được giữ nguyên)' : '') + '. Câu nào phân vân giữa hai phương án thì đánh dấu để xem kỹ.</p>'
      + '<details class="box" open><summary>' + (qIsR() ? "Bài đọc" : "Kịch bản (bài Nghe: nên nghe bản thu nếu đã có)") + '</summary><div class="wfpass">' + esc(S.slots.draft||"").replace(/\n/g,"<br>") + '</div></details>'
      + todo.map(function(it){ var g = qSig(it); return '<div class="wftake" data-sig="' + g + '"><div><b>Câu ' + it.n + '.</b> ' + esc(it.stem||"") + (it.insert ? '<div class="small muted">Câu chèn: ' + esc(it.insert) + '</div>' : '') + '</div>' + ["A","B","C","D"].map(function(k){ return '<label class="wfopt"><input type="radio" name="tk' + g + '" value="' + k + '"> ' + k + '. ' + esc(it.opts[k]||"") + '</label>'; }).join("") + '<label class="small"><input type="checkbox" data-unsure> Phân vân</label></div>'; }).join("")
      + '<div style="display:flex;gap:10px"><button type="button" class="btn primary" id="wf-take-done">Nộp bài làm</button><button type="button" class="btn quiet" id="wf-take-cancel">Thôi</button></div>';
    return h;
  }
  h += '<p class="small muted">Làm cả bộ khi ẩn đáp án trước, rồi quyết định từng câu: Đạt, Sửa nhỏ, Viết lại hoặc Loại, kèm nhận xét. Câu chưa Đạt có nhận xét sẽ thành ghi chú CH PHẢI SỬA để người soạn sửa tay hoặc đưa vào câu lệnh sửa bằng AI. Câu bị sửa sau lần xét trước phải xét lại; câu không đổi giữ quyết định cũ.</p>';
  h += '<div class="clsum"><span class="cls ' + (R.taken === R.n ? "ok" : "todo") + '">Đã làm ' + R.taken + "/" + R.n + '</span><span class="cls ' + (R.wrong.length ? "warn" : "ok") + '">Chọn khác đáp án: ' + (R.wrong.length ? "câu " + R.wrong.join(", ") : "không") + '</span><span class="cls ' + (R.pass === R.n ? "ok" : "todo") + '">Đạt ' + R.pass + "/" + R.n + '</span></div>';
  if(R.taken < R.n) h += '<div><button type="button" class="btn primary" id="wf-take"' + (mine ? '' : ' disabled title="Chỉ người thẩm định câu hỏi làm bài"') + '>Làm bài (ẩn đáp án) · ' + (R.n - R.taken) + ' câu</button></div>';
  if(R.taken){
    h += '<table class="cltab wfdec"><tbody>' + R.items.map(function(it){
      var g = qSig(it), a = w.take[g], d = w.dec[g] || {}, prev = wfPrevItem(it.n), changed = prev && qSig(prev) !== g;
      var codes = CL_ROWS.CH.map(function(r){ return r.c; }).concat(["KHÁC"]);
      return '<tr data-sig="' + g + '"><td class="clc"><b>Câu ' + it.n + '</b><div class="small muted">' + esc((it.lv||"") + " " + (it.mức||"") + " · " + (it.code||"")) + '</div></td><td>' + esc(it.stem||"") + '<div class="small">' + (a ? (a.a === it.ans ? '<span class="ok">Bạn chọn ' + a.a + ', đúng đáp án</span>' : '<span class="no">Bạn chọn ' + a.a + ', đáp án là ' + esc(it.ans||"?") + ': xem kỹ</span>') + (a.unsure ? ' <span class="warnc">· phân vân</span>' : '') : '<span class="muted">chưa làm</span>') + '</div>' + (changed ? '<details class="small"><summary class="warnc">Đã sửa sau lần xét trước: xem chỗ khác</summary>' + wordDiffHTML(wfItemText(prev), wfItemText(it)) + '</details>' : '') + '</td>'
        + '<td class="cla"><select data-dec="d"' + (mine ? '' : ' disabled') + '><option value="">Quyết định…</option>' + WF_DEC.map(function(x){ return '<option' + (d.d === x ? " selected" : "") + '>' + x + '</option>'; }).join("") + '</select>'
        + '<select data-dec="code"' + (mine ? '' : ' disabled') + '>' + codes.map(function(c){ return '<option' + ((d.code || "KHÁC") === c ? " selected" : "") + '>' + c + '</option>'; }).join("") + '</select>'
        + '<input type="text" data-dec="note" placeholder="Nhận xét (bắt buộc khi chưa Đạt)" value="' + esc(d.note||"") + '"' + (mine ? '' : ' disabled') + '></td></tr>';
    }).join("") + '</tbody></table>';
  }
  return h;
}
function wfDecSet(sig, field, val){
  var w = wfData(), d = w.dec[sig] = w.dec[sig] || {}, it = wfQItems().filter(function(x){ return qSig(x) === sig; })[0]; if(!it) return;
  d[field] = val; d.by = wfWho(); d.at = Date.now();
  // nhận xét thành ghi chú
  S.notes = S.notes || [];
  var n = S.notes.filter(function(x){ return x.qsig === sig && x.from === "cổng 3"; })[0];
  if(d.d && d.d !== "Đạt" && String(d.note||"").trim()){
    if(!n){ n = {id:clNoteId(), sc:"CH", from:"cổng 3", st:"Mở", at:Date.now(), qsig:sig}; S.notes.push(n); clEnsureBase("CH"); }
    n.code = d.code || "KHÁC"; n.sev = "PHẢI SỬA"; n.loc = "câu " + it.n; n.range = d.d === "Loại" || d.d === "Viết lại" ? "câu " + it.n + " (viết lại cả câu, giữ bậc, mức, mã)" : "chỉ câu " + it.n; n.issue = d.d + ": " + d.note; n.quote = ""; n.by = wfWho();
  } else if(n && n.st === "Mở") S.notes = S.notes.filter(function(x){ return x !== n; });
  save();
}

/* ---- bản đồ chất liệu theo bảng phân bố ---- */
function mapData(){ S.map = S.map || {rows:{}}; return S.map; }
function mapLines(){
  var out = [], rows = qRows();
  rows.forEach(function(r, ri){ for(var i = 0; i < r[2]; i++){ var key = r[0] + "|" + r[1] + "|" + ri + "|" + i; out.push({key:key, lv:r[0], m:r[1], codes:qRowCodes(r).filter(function(c, j, a){ return a.indexOf(c) === j; }), sk:qIsR() ? null : r[3]}); } });
  return out;
}
function mapQuotes(s){ var out = [], re = /["“]([^"”]{2,300})["”]/g, m; while((m = re.exec(s||""))) out.push(m[1].trim()); if(!out.length) (s||"").split(/[;\n]+/).forEach(function(x){ x = x.trim(); if(x.length > 1) out.push(x); }); return out; }
function mapParas(){ var d = S.slots.draft || ""; return qIsR() ? analyze(d).body.map(function(b){ return b.text; }) : [d]; }
function mapEval(){
  var M = mapData(), L = mapLines(), d = S.slots.draft || "", passN = qNorm(d), paras = mapParas(), isR = qIsR();
  var res = L.map(function(l, idx){
    var v = M.rows[l.key] || {}, msgs = [], s = "ok", code = v.code || l.codes[0] || "";
    var fail = function(t){ msgs.push(t); s = "fail"; }, warn = function(t){ msgs.push(t); if(s === "ok") s = "warn"; };
    var out = {l:l, v:v, code:code, idx:idx};
    if(!code) fail("chưa chọn mã");
    if(!v.q){ fail("chưa có chỗ hỏi"); out.s = s; out.msgs = msgs; return out; }
    var pos = qFind(passN, v.q); out.span = pos >= 0 ? qSpanOf(passN, v.q) : null;
    if(pos < 0){ fail("chỗ hỏi không có nguyên văn trong bài"); out.s = s; out.msgs = msgs; return out; }
    out.para = isR ? qParaOf(paras, v.q) : 0;
    var dis = mapQuotes(v.dis), disIn = dis.filter(function(q){ return qFind(passN, q) >= 0; });
    if(code === "RE"){
      if(!v.w) fail("chưa ghi đại từ được hỏi");
      else { if(Q_PRON.indexOf(v.w.toLowerCase()) < 0) fail("\"" + v.w + "\" không phải đại từ"); if(qNorm(v.q).indexOf(" " + qNorm(v.w).trim() + " ") < 0) fail("đại từ không nằm trong chỗ hỏi"); }
      var long = dis.filter(function(q){ return qWords(q) > 3; });
      if(disIn.length < 3) warn("RE cần ít nhất 3 cụm danh từ khác trong bài làm phương án sai (có " + disIn.length + ")");
      if(long.length) warn("cụm nhiễu dài quá 3 từ: " + long.join("; "));
    } else if(code === "VO" || code === "VO(ID)"){
      if(!v.w) fail("chưa ghi từ được hỏi");
      else if(qNorm(v.q).indexOf(" " + qNorm(v.w).trim() + " ") < 0) fail("từ được hỏi không nằm trong chỗ hỏi");
      else if(code === "VO"){ var lem = lexLemma(v.w.toLowerCase()); out.lvl = lem !== null && LEXM[lem] !== undefined ? LVL[LEXM[lem]] : "ngoài danh sách"; }
    } else if(code === "IS"){
      if(!/^\s*(it|its|they|them|their|this|that|these|those|he|she|his|her|such|however|but|also|so|therefore|thus|in addition|moreover|for example|for instance|as a result|instead|similarly|yet|still|then|another|the)\b/i.test(v.q)) warn("câu chèn nên mở đầu bằng đại từ, từ nối hoặc từ lặp lại để có dấu nối với câu trước");
    } else if(code === "LO"){
      var cnt = paras.filter(function(p){ return qFind(qNorm(p), v.q) >= 0; }).length; if(cnt > 1) fail("thông tin có ở " + cnt + " đoạn (LO cần thông tin chỉ có ở một đoạn)");
    }
    if(code !== "RE" && code !== "LO" && code !== "IS" && code !== "VO" && code !== "VO(ID)" && code !== "MI" && code !== "TO" && disIn.length < 2) warn("chất liệu nhiễu: cần ít nhất 2 trích dẫn có trong bài (có " + disIn.length + ")");
    if(dis.length > disIn.length) warn("trích dẫn nhiễu không có nguyên văn trong bài: " + dis.filter(function(q){ return disIn.indexOf(q) < 0; }).join("; "));
    if(isR && code === "DE" && (l.lv === "B3" && l.m === "trung bình" || l.lv !== "B3")){
      var ps = {}; [v.q, v.alt].concat(dis).forEach(function(q){ if(q){ var p = qParaOf(paras, q); if(p) ps[p] = 1; } });
      if(Object.keys(ps).length < 2) warn(l.lv === "B3" ? "DE bậc 3 trung bình: thông tin nên được nhắc tới ở nhiều chỗ (QĐ 730); ghi thêm chỗ thứ hai ở đoạn khác" : "DE rải rác: thông tin nên nằm ở ít nhất 2 đoạn");
    }
    if(l.lv !== "B3" && !v.alt) warn("nên có chỗ hỏi thứ hai (dự phòng) cho ô bậc 4–5");
    if(v.alt && qFind(passN, v.alt) < 0) warn("chỗ hỏi dự phòng không có nguyên văn trong bài");
    out.s = s; out.msgs = msgs; return out;
  });
  // trùng chỗ hỏi
  var sp = res.filter(function(x){ return x.span && x.code !== "MI" && x.code !== "TO"; });
  sp.forEach(function(x, i){ for(var j = 0; j < i; j++){ var y = sp[j]; if(x.span[0] < y.span[1] && y.span[0] < x.span[1]){ x.msgs.push("trùng hoặc chồng lên chỗ hỏi của dòng " + (y.idx+1) + ": mỗi nội dung chỉ dùng cho một câu hỏi"); x.s = "fail"; break; } } });
  var glob = [];
  if(isR && paras.length){ var cov = {}; res.forEach(function(x){ if(x.para) cov[x.para] = (cov[x.para]||0) + 1; }); var miss = []; for(var p = 1; p <= paras.length; p++) if(!cov[p]) miss.push(p); if(miss.length) glob.push({s:"warn", t:"Đoạn " + miss.join(", ") + " chưa có chỗ hỏi.", c:"NL-D3"}); var heavy = Object.keys(cov).filter(function(k){ return cov[k] >= 4; }); if(heavy.length) glob.push({s:"warn", t:"Dồn nhiều chỗ hỏi vào đoạn " + heavy.join(", ") + ".", c:"NL-D3"}); }
  if(!isR && SPEC[S.spec].grp !== 1 && passN.trim()){
    var Wt = passN.trim().split(/\s+/).length, wAt = function(p){ var s = passN.slice(0, p).trim(); return s ? s.split(/\s+/).length : 0; };
    var loc = res.filter(function(x){ return x.span && x.code !== "MI"; }).map(function(x){ return {x:x, w0:wAt(x.span[0]), w1:wAt(x.span[1])}; }).sort(function(a, b){ return a.w0 - b.w0; });
    if(loc.length){
      if(loc[0].w0 < 25) glob.push({s:"warn", t:"Chỗ hỏi đầu tiên (dòng " + (loc[0].x.idx+1) + ") nằm trong " + loc[0].w0 + " từ đầu: nên sau khoảng 25–40 từ.", c:"NL-D4"});
      for(var k = 1; k < loc.length; k++){ var ea = loc[k-1].x.span[1] - 1, sb = loc[k].x.span[0];
        if(sb > ea && qSentAt(passN, ea) === qSentAt(passN, sb)) glob.push({s:"warn", t:"Chỗ hỏi dòng " + (loc[k].x.idx+1) + " nằm cùng một câu với chỗ hỏi dòng " + (loc[k-1].x.idx+1) + ": quá sát, thí sinh khó kịp.", c:"NL-D4"});
        else if(SPEC[S.spec].grp === 2 && sb > ea && qTurnAt(passN, ea) === qTurnAt(passN, sb)) glob.push({s:"warn", t:"Chỗ hỏi dòng " + (loc[k].x.idx+1) + " nằm cùng một lượt lời với chỗ hỏi dòng " + (loc[k-1].x.idx+1) + ": quá sát, nên có lượt lời khác chen giữa.", c:"NL-D4"}); }
      var tail = Wt - loc[loc.length-1].w1, maxGap = 0; for(var g2 = 1; g2 < loc.length; g2++) maxGap = Math.max(maxGap, loc[g2].w0 - loc[g2-1].w1);
      if(loc.length > 1 && tail > maxGap && tail > 25) glob.push({s:"warn", t:"Chỗ hỏi cuối cách cuối bài " + tail + " từ, xa hơn mọi khoảng cách giữa hai chỗ hỏi liền nhau: nên có chỗ hỏi gần cuối bài.", c:"NL-D4"});
    }
  }
  return {res:res, glob:glob};
}
function mapStatus(){
  var E = mapEval(), bad = E.res.filter(function(x){ return x.s === "fail"; });
  return {E:E, full:!bad.length && E.res.length > 0, why:bad.length ? bad.length + " dòng chưa đạt (dòng " + bad.map(function(x){ return x.idx + 1; }).join(", ") + ")" : ""};
}
// thứ tự câu trong đề (quy ước nhóm CH-B3): theo vị trí chỗ hỏi trong bài; câu về cả bài (MI, TO) xếp cuối
var MAP_GLOBAL = {MI:1, TO:1};
function mapOrder(E){
  E = E || mapEval();
  var placed = E.res.filter(function(x){ return x.span; });
  var seq = placed.filter(function(x){ return !MAP_GLOBAL[x.code]; }).sort(function(a, b){ return a.span[0] - b.span[0] || a.idx - b.idx; })
    .concat(placed.filter(function(x){ return MAP_GLOBAL[x.code]; }));
  var num = {}; seq.forEach(function(x, i){ num[x.idx] = i + 1; });
  return {seq:seq, num:num, missing:E.res.filter(function(x){ return !x.span; })};
}
function mapKeep(){ var M = S.map; if(!M) return []; var out = []; Object.keys(M.rows).forEach(function(k){ var v = M.rows[k]; if(v.w && /^(RE|VO|VO\(ID\))$/.test(v.code||"")) out.push(v.w); if(v.code === "IS" && v.q) out.push(v.q); }); return out; }
function mapText(){
  var E = mapEval(); if(!E.res.some(function(x){ return x.v.q; })) return "";
  var O = mapOrder(E), line = function(x){ var v = x.v; return x.l.lv + " " + x.l.m + " | " + (x.code || "?") + (MAP_GLOBAL[x.code] ? " | cả bài" : x.para ? " | đoạn " + x.para : "") + " | CHỖ HỎI: \"" + (v.q||"") + "\"" + (v.w ? " | TỪ: " + v.w : "") + (v.alt ? " | DỰ PHÒNG: \"" + v.alt + "\"" : "") + (v.dis ? " | NHIỄU: " + v.dis : ""); };
  return O.seq.map(function(x, i){ return "CÂU " + (i+1) + " | " + line(x); }).concat(O.missing.map(function(x){ return "CHƯA CÓ CHỖ HỎI | " + x.l.lv + " " + x.l.m + " | " + (x.code || "?"); })).join("\n");
}
function mapParseAI(raw){
  var M = mapData(), L = mapLines(), n = 0, t = cleanPaste(raw||"").replace(/\*\*/g,"");
  t.split(/\n/).forEach(function(line){
    var m = line.match(/^\s*[-•>]*\s*D[ÒO]NG\s+(\d+)\s*\|(.*)$/i); if(!m) return;
    var l = L[+m[1] - 1]; if(!l) return;
    var parts = m[2].split("|").map(function(x){ return x.trim(); }), v = M.rows[l.key] = M.rows[l.key] || {};
    parts.forEach(function(p){
      var f;
      if((f = p.match(/^CH[ỖO]\s*H[ỎO]I\s*:\s*(.*)$/i))) v.q = /^\(?\s*kh[ôo]ng\s+c[óo]/i.test(f[1]) ? "" : qUnq(f[1]);
      else if((f = p.match(/^T[ỪU]\s*:\s*(.*)$/i))) v.w = qUnq(f[1]);
      else if((f = p.match(/^D[ỰU]\s*PH[ÒO]NG\s*:\s*(.*)$/i))) v.alt = qUnq(f[1]);
      else if((f = p.match(/^NHI[ỄE]U\s*:\s*(.*)$/i))) v.dis = f[1].trim();
      else { var c = qNormCode(p.replace(/^M[ÃA]\s*:\s*/i, "")); if(c && l.codes.indexOf(c) >= 0){ v.code = c; v.codeAuto = false; v.codeAI = ""; } else if(c && /^[A-Z][A-Z\[\]\(\)]{1,7}$/.test(c)) v.codeAI = c; }
    });
    if(!v.code && l.codes.length){ v.code = l.codes[0]; v.codeAuto = true; }
    n++;
  });
  save(); return n;
}
function mapFromAnchors(){
  var fr = typeof parseFrame === "function" ? parseFrame(S.slots.notes) : null;
  if(fr && fr.length){
    var M0 = mapData(), used0 = {}, n0 = 0, L0 = mapLines();
    fr.filter(function(x){ return x.quote; }).forEach(function(x){
      var l = L0.filter(function(l){ return l.lv === x.lv && l.m === x.m && !used0[l.key] && !(M0.rows[l.key] && M0.rows[l.key].q) && (!x.code || l.codes.indexOf(x.code) >= 0); })[0]
        || L0.filter(function(l){ return l.lv === x.lv && l.m === x.m && !used0[l.key] && !(M0.rows[l.key] && M0.rows[l.key].q); })[0];
      if(!l) return; used0[l.key] = 1;
      var v = M0.rows[l.key] = M0.rows[l.key] || {}; v.q = x.quote; if(x.code && l.codes.indexOf(x.code) >= 0){ v.code = x.code; v.codeAuto = false; } n0++;
    });
    if(n0){ save(); return n0; }
  }
  var map = parseAnchors(S.slots.notes); if(!map) return 0;
  var M = mapData(), used = {}, n = 0;
  mapLines().forEach(function(l){
    var v = M.rows[l.key] = M.rows[l.key] || {}; if(v.q) return;
    for(var i = 0; i < l.codes.length; i++){ var c = l.codes[i], list = (map[c.toUpperCase()]||[]).filter(function(x){ return !x.none && x.quote && !used[x.quote]; }); if(list.length){ v.code = c; v.q = list[0].quote; used[list[0].quote] = 1; n++; break; } }
  });
  save(); return n;
}
P.mapai = {title:"Câu lệnh đề xuất bản đồ chất liệu", inputs:["draft"], t:
"Bạn giúp nhóm ra đề VSTEP lập BẢN ĐỒ CHẤT LIỆU cho {readOrListenNoun} dưới đây ({partShort}). Không soạn câu hỏi. Với mỗi dòng của bảng phân bố, chọn một mã trong các mã được phép và chỉ ra chỗ hỏi có sẵn trong bài.\n\nYÊU CẦU CHUNG\n- CHỖ HỎI chép nguyên văn từ bài (một câu hoặc một cụm, tối đa khoảng 25 từ). Không sửa bài.\n- Mỗi nội dung chỉ dùng cho một dòng: chỗ hỏi của hai dòng không trùng, không chồng lên nhau.\n- NHIỄU: ít nhất 2 trích dẫn nguyên văn trong bài làm chất liệu cho phương án sai, mỗi trích dẫn trong ngoặc kép, cách nhau bằng dấu chấm phẩy.\n- Ô bậc 4–5: ghi thêm DỰ PHÒNG là chỗ hỏi thứ hai, cũng chép nguyên văn.\n{mapCodeRules}\n- Không có chỗ tự nhiên cho dòng nào thì ghi CHỖ HỎI: không có. Đừng đề xuất sửa bài để lấp.\n\nCÁC DÒNG\n{mapRowsText}\n\nTRÌNH BÀY: Trình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code. Mỗi dòng một hàng:\nDÒNG 1 | MÃ | CHỖ HỎI: \"…\" | TỪ: … | DỰ PHÒNG: \"…\" | NHIỄU: \"…\"; \"…\"\n(TỪ chỉ ghi cho RE, VO, VO(ID): đại từ hoặc từ, cụm được hỏi.)\n\n{readOrListenNounCap}:\n{{draft}}"};
function wfExtend(v){
  v.mapRowsText = mapLines().map(function(l, i){ return "DÒNG " + (i+1) + " | " + l.lv + " " + l.m + " | chọn một mã: " + l.codes.join(", ") + (l.sk ? " (" + l.sk.map(function(k){ return LSK[k] ? LSK[k][1] : k; }).join("; ") + ")" : ""); }).join("\n");
  v.mapCodeRules = qIsR() ? "- RE: đại từ có tiền ngữ rõ, tiền ngữ không đứng ngay trước; NHIỄU là ít nhất 3 cụm danh từ khác trong bài, mỗi cụm tối đa 3 từ.\n- DE bậc 3 trung bình: thông tin tường minh, nhắc tới ở nhiều chỗ; ghi DỰ PHÒNG là chỗ nhắc lại ở đoạn khác.\n- DE[P], RP, IN: đủ chất liệu cho ba loại nhiễu: (1) đúng nhưng không liên quan; (2) vài từ của bài dễ hiểu sai; (3) ý liên quan nhưng rộng hoặc hẹp hơn.\n- IN: thông tin hàm ẩn, suy ra chắc chắn từ một hoặc vài chi tiết.\n- RP: tác giả nêu ví dụ, số liệu hoặc lời trích nhằm một mục đích nói ra được.\n- LO: thông tin chỉ có ở một đoạn.\n- VO: từ đoán được nghĩa từ ngữ cảnh, nên đa nghĩa; có từ đồng nghĩa ở mức bằng hoặc thấp hơn. VO(ID): thành ngữ hoặc cụm cố định.\n- IS: một câu tách ra được, mở đầu bằng đại từ, từ nối hoặc từ lặp lại.\n- OP, TO: tác giả có quan điểm hoặc thái độ thể hiện qua từ đánh giá.\n- Bài Đọc: mỗi đoạn có ít nhất một chỗ hỏi; không dồn một đoạn." : "- Mỗi dòng một điểm hỏi. Điểm đầu không nằm trong 25–40 từ đầu; hai điểm liền nhau cách nhau ít nhất khoảng 12 từ; điểm cuối gần cuối bài.\n- Chất liệu nhiễu nằm gần điểm hỏi: một con số hoặc tên khác được nhắc, người nói đính chính, một lựa chọn được cân nhắc rồi bỏ, từ đọc gần giống từ khoá.\n- Chỗ hỏi không phải điều ai cũng đoán được bằng hiểu biết đời sống.\n- Không nghe thừa (hướng dẫn của Bộ): mọi câu có nội dung trong bài nên là chỗ hỏi, chỗ hỏi dự phòng hoặc nhiễu của một dòng. Sau các dòng, thêm mục CÂU THỪA: chép nguyên văn những câu có nội dung chưa dùng được cho dòng nào (không tính lời chào, câu dẫn bối cảnh, câu chuyển ý, lượt đáp ngắn, từ đệm), mỗi câu một dòng.";
  var nQ = mapLines().length, grp = SPEC[S.spec].grp;
  v.noWaste = qIsR() ? "" : "- KHÔNG NGHE THỪA (hướng dẫn của Bộ): thông tin trong bài nghe phải được dùng tối đa để đặt câu hỏi, làm đáp án đúng hoặc chất liệu nhiễu. Bài này có " + nQ + " câu hỏi theo bảng phân bố:\n" + v.mapRowsText.replace(/ \| chọn một mã: /g, " | ") + "\nTrước khi viết, chọn từ NỘI DUNG chỉ những dữ kiện phục vụ " + nQ + " câu này: mỗi câu một thông tin để hỏi và 1–2 thông tin cạnh tranh nằm gần đó (một con số, tên, lựa chọn khác được nhắc rồi bỏ, một ý người nói đính chính). Câu hỏi về cả bài (ý chính, thái độ, mục đích) dùng thông tin rải khắp bài. Bỏ các dữ kiện, ví dụ, giai thoại không vào được câu nào. Lời chào, câu dẫn bối cảnh ngắn ở đầu, câu chuyển ý, lượt đáp ngắn, từ đệm, ngập ngừng không tính là thừa. Mỗi thông tin để hỏi chỉ dùng cho một câu."
    + (grp === 1 ? "\n- Bài ngắn một câu hỏi: mọi chi tiết cụ thể (giờ, ngày, địa điểm, tên, con số) là thông tin để hỏi hoặc thông tin nhiễu cho câu đó; không đưa chi tiết cụ thể nào khác." : grp === 2 ? "\n- Hội thoại: giữ lượt lời ngắn, đổi lượt như nói chuyện thật. Giảm thừa bằng cách bỏ chủ đề con không dùng, không gộp nhiều ý vào một lượt lời dài. Nếu cắt ý thừa làm bài thiếu số từ, thêm lượt hỏi lại, xác nhận, đính chính mang thông tin nhiễu của chính ý đang nói, không mở ý mới." : "\n- Bài nói: ý nào được triển khai cũng gắn với một câu hỏi; ví dụ, số liệu chỉ giữ khi là căn cứ hoặc nhiễu; câu chuyển ý được giữ.")
    + "\n- Trong phần ghi chú cuối bài (sau dòng ghi số từ), liệt kê ngắn từng câu hỏi dự kiến: thông tin để hỏi; thông tin nhiễu.";
  v.factsNoWaste = qIsR() ? "" : " Bài nghe sẽ có " + nQ + " câu hỏi: chỉ rút những dữ kiện đủ cho " + nQ + " câu (mỗi câu một thông tin để hỏi và 1–2 thông tin cạnh tranh, như một con số, tên hoặc lựa chọn khác); bỏ phần còn lại để bài nghe không có thông tin thừa (hướng dẫn của Bộ).";
  var mt = mapText(); if(mt){ v.qAnchors = "- BẢN ĐỒ CHẤT LIỆU ĐÃ DUYỆT, đã xếp theo thứ tự câu trong đề (theo vị trí chỗ hỏi trong bài; câu về cả bài ở cuối): soạn CÂU 1, CÂU 2… đúng số câu, bậc, mức, mã và chỗ hỏi của từng dòng; không đổi thứ tự, không hỏi ngoài bản đồ:\n" + mt + "\n"; }
}

/* ---- giao diện: thanh quy trình ---- */
function wfStChip(st){ return '<span class="wfst">' + esc(st || (S.prj ? "Chưa bắt đầu" : "Chưa vào quy trình")) + '</span>'; }
function wfCondHTML(c){ return '<li class="' + (c.info ? "i" : (c.ok ? "g" : "b")) + '">' + (c.info ? "ℹ " : (c.ok ? "✓ " : "✗ ")) + esc(c.t) + '</li>'; }
function wfActHTML(A, isReq, i){
  var t = A.t;
  return '<div class="wfact' + (A.ok ? " ok" : "") + '"><div class="wfacth"><b>' + esc(t.label) + '</b>' + (isReq ? "" : ' <span class="small muted">→ ' + esc(t.toFn ? t.toFn(wfData()) : t.to) + '</span>') + ' <span class="small muted">· ' + WF_ROLES[t.role] + '</span></div>'
    + (A.why.length ? '<div class="small warnc">' + esc(A.why.join("; ")) + '</div>' : '')
    + (A.conds.length ? '<ul class="wfcond">' + A.conds.map(wfCondHTML).join("") + '</ul>' : '')
    + (t.note && !A.why.length ? '<textarea rows="2" data-wfnote="' + (isReq ? "r" : "t") + i + '" placeholder="' + esc(t.ph || "Nhận xét, lý do (bắt buộc)") + '"></textarea>' : '')
    + '<button type="button" class="btn ' + (A.ok ? "primary" : "quiet") + '" data-wfgo="' + (isReq ? "r" : "t") + i + '"' + (A.ok ? "" : " disabled") + '>' + esc(t.label) + '</button></div>';
}
function wfRender(){
  var box = document.getElementById("wfbar"); if(!box) return;
  // đang mở bảng chọn ngày ở thanh Quy trình: hoãn vẽ lại tới khi rời ô (vẽ lại làm bảng chọn ngày tự tắt)
  var ae = document.activeElement;
  if(ae && ae.type === "date" && box.contains(ae)){ if(!ae.__wfWait){ ae.__wfWait = true; var go = function(){ ae.removeEventListener("blur", go); ae.__wfWait = false; dateWhenFree(wfRender); }; ae.addEventListener("blur", go); } return; }
  dateFlush();
  wfApplyLock();
  var w = wfData(), me = wfMe(), dev = wfDevOn(), openK = {}; box.querySelectorAll("details[data-k]").forEach(function(d){ openK[d.getAttribute("data-k")] = d.open; });
  var mine = WF_ROLE_ORDER.filter(function(r){ return !dev && me && (r === "coord" ? wfIsCoordUser() : w.as[r] === me); });
  var acts = WF_T.map(function(t, i){ return {t:t, i:i}; }).filter(function(x){ return wfApplies(x.t) && x.t.from.indexOf(w.st || "") >= 0; }).map(function(x){ return {A:wfAvail(x.t), i:x.i}; });
  var reqs = WF_R.map(function(t, i){ return {t:t, i:i}; }).filter(function(x){ return wfApplies(x.t) && x.t.when(w); }).map(function(x){ return {A:wfAvail(x.t), i:x.i}; });
  var ready = acts.concat(reqs).filter(function(x){ return x.A.ok; }).length;
  var rank = function(x){ return x.A.ok ? 0 : (x.A.why.length ? 2 : 1); };
  acts.sort(function(a, b){ return rank(a) - rank(b); }); reqs.sort(function(a, b){ return rank(a) - rank(b); });
  var sum = (S.prj ? '<span class="wfst">Dự án: ' + esc(S.prj.name || "") + '</span> ' : '') + (function(){ var need = typeof libNeed === "function" ? libNeed({wf:wfSummary(), prj:S.prj && S.prj.id}) : "", pdu = wfPhaseDue(need), sd = pdu.d; var n = typeof prjDaysLeft === "function" ? prjDaysLeft(sd) : null, act = w.st !== "Đã hoàn thiện" && n !== null; return sd ? '<span class="wfst ' + (act ? prjLeftCls(n) : "") + '">' + (pdu.label === "Sửa xong trước" ? "Sửa xong trước " : need && need !== "coord" && (w.dues || {})[need] ? "Hạn " + esc(PRJ_SHORT[need]) + " " : "Hạn ") + esc(prjFmt(sd)) + (act ? ' · ' + esc(prjLeftText(n)) : '') + '</span> ' : ''; })() + wfStChip(w.st) + (w.lock ? ' <span class="wfst lock">Khoá bản ' + w.lock.ver + '</span>' : '') + (w.req ? ' <span class="wfst req">Yêu cầu sửa ngữ liệu: ' + esc(w.req.st) + '</span>' : '') + (dev ? ' <span class="wfst dev">Nhà phát triển · vai ' + esc(WF_ROLES[wfDevRole()]) + '</span>' : (mine.length ? ' <span class="small muted">Vai của bạn: ' + mine.map(function(r){ return WF_ROLES[r]; }).join(", ") + '</span>' : ''));
  var h = '<details data-k="main"' + (openK.main ? " open" : "") + '><summary><b>Quy trình</b> ' + sum + (ready ? ' <span class="cls ok">' + ready + ' việc làm được ngay</span>' : '') + '</summary><div class="wfbody">';
  if(!dev && !me) h += '<p class="small muted">Đăng nhập Thư viện để làm việc nhiều người (giao việc, duyệt, khoá bài). ' + (wfDevAllowed() ? 'Hoặc bật chế độ nhà phát triển bên dưới để một mình chạy thử mọi vai.' : '') + '</p>';
  if(w.req) h += '<div class="note small"><b>Yêu cầu sửa ngữ liệu</b> (' + esc(w.req.st) + ', ' + esc(w.req.by||"") + '): ' + esc(w.req.note||"") + (w.lock && (S.slots.draft||"") !== w.lock.text ? '<details><summary>Phần khác so với bản khoá ' + w.lock.ver + '</summary><div class="small">' + wfDiffUnits(w.lock.text, S.slots.draft||"") + '</div></details>' : '') + '</div>';
  var fwd = acts.filter(function(x){ return !x.A.t.back; }), bk = acts.filter(function(x){ return x.A.t.back; });
  h += fwd.length || reqs.length ? '<div class="wfacts">' + fwd.map(function(x){ return wfActHTML(x.A, false, x.i); }).join("") + reqs.map(function(x){ return wfActHTML(x.A, true, x.i); }).join("") + '</div>' : '<p class="small muted">Không có bước chuyển tiếp từ trạng thái này.</p>';
  if(bk.length) h += '<details data-k="back"' + (openK.back ? " open" : "") + '><summary>Quay lại bước trước (' + bk.length + ')</summary><p class="small muted">Dùng khi một bước đã qua nhưng chưa ổn. Mỗi lần quay lại phải ghi lý do và được ghi vào nhật ký; quy tắc không tự duyệt vẫn áp dụng.</p><div class="wfacts">' + bk.map(function(x){ return wfActHTML(x.A, false, x.i); }).join("") + '</div></details>';
  // phân công
  var canAs = dev || wfIsCoordUser() || (!w.st && !S.prj);
  var pool = (S.prj && typeof prjPeople === "function") ? prjPeople(S.prj.id) : ((typeof LIB !== "undefined" && LIB.staff) ? LIB.staff.map(function(x){ return x.email; }) : []);
  h += '<details data-k="as"' + (openK.as ? " open" : "") + '><summary>Phân công</summary><div class="wfas">' + WF_ROLE_ORDER.map(function(r){ return '<label class="small">' + WF_ROLES[r] + '<input type="email" data-wfas="' + r + '" list="wf-staff" value="' + esc(w.as[r]||"") + '" placeholder="' + (r === "coord" ? "để trống: mọi quản trị" : "email Google") + '"' + (canAs ? "" : " disabled") + '>' + (r !== "coord" ? '<span class="wfrdue"><span class="muted">xong trước</span><input type="date" data-wfrdue="' + r + '" value="' + esc((w.dues || {})[r] || "") + '"' + (canAs ? "" : " disabled") + '></span>' : '') + '</label>'; }).join("") + '<datalist id="wf-staff">' + pool.map(function(x){ return '<option value="' + esc(x) + '">'; }).join("") + '</datalist>'
    + '<label class="small">Hạn hoàn thành bài<input type="date" id="wf-due" value="' + esc(w.due || "") + '"' + (canAs ? "" : " disabled") + '></label>'
    + (w.as.nl && w.as.nl === w.as.tdnl ? '<p class="small no">Người soạn ngữ liệu trùng người thẩm định ngữ liệu: không ai duyệt bài của chính mình.</p>' : '') + (w.as.ch && w.as.ch === w.as.tdch ? '<p class="small no">Người soạn câu hỏi trùng người thẩm định câu hỏi.</p>' : '') + (w.as.nl && w.as.nl === w.as.ch ? '<p class="small muted">Nên để người soạn câu hỏi khác người soạn ngữ liệu (khuyến khích, không bắt buộc).</p>' : '')
    + (S.prj ? '<p class="small muted">Bài thuộc dự án ' + esc(S.prj.name || "") + '. Điều phối phân công nhiều bài cùng lúc ở trang Nhóm → Dự án.</p>' : '') + (canAs ? '' : '<p class="small muted">Chỉ Điều phối hoặc quản trị đổi phân công.</p>') + '</div></details>';
  // nhật ký
  h += '<details data-k="log"' + (openK.log ? " open" : "") + '><summary>Nhật ký (' + w.log.length + ')</summary>' + (w.log.length ? '<table class="cltab"><tbody>' + w.log.slice().reverse().map(function(e){ return '<tr><td class="small">' + esc(libWhenMs(e.at)) + '</td><td class="small">' + esc(e.by||"") + (e.dev ? ' <span class="wfst dev">dev</span>' : '') + '</td><td class="small"><b>' + esc(e.act||"") + '</b>' + (e.from !== e.to ? ': ' + esc(e.from || "chưa vào quy trình") + ' → ' + esc(e.to) : '') + (e.note ? '<div>' + esc(e.note) + '</div>' : '') + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="small muted">Chưa có.</p>') + '</details>';
  // nhà phát triển
  if(wfDevAllowed()){
    var dv = wfDev();
    h += '<details data-k="dev"' + (openK.dev || dv.on ? " open" : "") + '><summary>Chế độ nhà phát triển</summary><div class="wfdev"><label class="small"><input type="checkbox" id="wf-dev"' + (dv.on ? " checked" : "") + '> Bật: một người chạy mọi vai từ đầu đến cuối. Bỏ qua phân công và quy tắc bốn mắt; mọi bước vẫn phải đủ điều kiện; nhật ký ghi rõ "dev". Chỉ quản trị mới thấy mục này.</label>'
      + (dv.on ? '<div class="wfrole">' + WF_ROLE_ORDER.map(function(r){ return '<button type="button" class="btn sm ' + (wfDevRole() === r ? "primary" : "quiet") + '" data-wfrole="' + r + '">' + WF_ROLES[r] + '</button>'; }).join("") + '</div><label class="small">Đặt thẳng trạng thái (để thử một đoạn của quy trình) <select id="wf-force"><option value="">…</option>' + WF_ST.map(function(s){ return '<option>' + esc(s) + '</option>'; }).join("") + '</select></label><button type="button" class="btn quiet sm" id="wf-auto">Đổi vai theo việc tiếp theo</button>' : '') + '</div></details>';
  }
  h += '</div></details>';
  var keepNotes = {}; box.querySelectorAll("[data-wfnote]").forEach(function(t){ if(t.value) keepNotes[t.getAttribute("data-wfnote")] = t.value; });
  box.innerHTML = h;
  Object.keys(keepNotes).forEach(function(k){ var t = box.querySelector('[data-wfnote="' + k + '"]'); if(t) t.value = keepNotes[k]; });
  wfG1Render();
  var rv = document.getElementById("wf-review"), keepTk = {};
  if(rv) rv.querySelectorAll("input[type=radio]:checked, input[data-unsure]:checked").forEach(function(i){ keepTk[i.name ? i.name + "=" + i.value : "u" + i.closest(".wftake").getAttribute("data-sig")] = 1; });
  if(rv){ var rh = wfReviewHTML(); rv.innerHTML = rh; rv.classList.toggle("hidden", !rh);
    rv.querySelectorAll("input[type=radio]").forEach(function(i){ if(keepTk[i.name + "=" + i.value]) i.checked = true; });
    rv.querySelectorAll("input[data-unsure]").forEach(function(i){ if(keepTk["u" + i.closest(".wftake").getAttribute("data-sig")]) i.checked = true; }); }
  var cs = document.getElementById("cau-hoi"); if(cs) cs.classList.toggle("wftaking", !!wfTaking);
  rvRender();
  mapRender();
  try{ wfModeApply(); }catch(e){}
}
function libWhenMs(ms){ return typeof libWhen === "function" ? libWhen(ms) : new Date(ms).toLocaleString(); }
function wfDiffUnits(a, b){
  var A = wfUnitsOf(a), B = wfUnitsOf(b), had = {}, out = [];
  A.forEach(function(u){ had[qHash(normQ(u))] = u; });
  B.forEach(function(u, i){ if(!had[qHash(normQ(u))]){ var old = A[i] || ""; out.push('<div><b>' + (qIsR() ? "Đoạn " : "Dòng ") + (i+1) + ':</b> ' + wordDiffHTML(old, u) + '</div>'); } });
  if(A.length > B.length) out.push('<div class="no">Bản mới ít hơn ' + (A.length - B.length) + (qIsR() ? " đoạn" : " dòng") + '.</div>');
  return out.join("") || "Không khác.";
}
function wfApplyLock(){
  var lk = wfDraftLocked();
  document.querySelectorAll('textarea[data-slot="draft"]').forEach(function(t){ t.readOnly = lk; t.classList.toggle("wflocked", lk); });
  document.querySelectorAll(".wflockmsg").forEach(function(e){ e.remove(); });
  if(lk) document.querySelectorAll('textarea[data-slot="draft"]').forEach(function(t){ var p = document.createElement("p"); p.className = "wflockmsg small no"; p.textContent = "Bài đã khoá (bản " + S.wf.lock.ver + "). Cần đổi bài thì người soạn câu hỏi gửi yêu cầu sửa ngữ liệu ở thanh Quy trình."; t.parentNode.insertBefore(p, t); });
}
/* bản đồ chất liệu: giao diện */
// dòng đã có chỗ hỏi mà chưa có mã: chọn sẵn mã đầu tiên của dòng trong bảng phân bố; người soạn đổi được
function mapFillCodes(){ var M = mapData(); mapLines().forEach(function(l){ var v = M.rows[l.key]; if(v && v.q && !v.code && l.codes.length){ v.code = l.codes[0]; v.codeAuto = true; } }); }
function mapRender(){
  var box = document.getElementById("mapbox"); if(!box) return;
  if(!wfDraftLocked()) mapFillCodes();
  if(!mapLines().length){ box.innerHTML = '<p class="small warnc">' + esc(qbpWhy()) + '</p>'; return; }
  var M0 = mapData();
  if(!M0.autoDone && wfCanEditScreen("chat-lieu") && (S.slots.draft||"").trim() && !Object.keys(M0.rows).some(function(k){ return M0.rows[k].q; }) && parseAnchors(S.slots.notes)){ M0.autoDone = true; var na = mapFromAnchors(); if(na) toast("Đã điền sẵn " + na + " dòng bản đồ từ điểm neo AI ghi ở bước 4."); }
  var E = mapEval(), M = mapData(), lk = wfDraftLocked(), ORD = mapOrder(E);
  var nOk = E.res.filter(function(x){ return x.s === "ok"; }).length, nF = E.res.filter(function(x){ return x.s === "fail"; }).length;
  var foc = document.activeElement && box.contains(document.activeElement) ? {k:document.activeElement.getAttribute("data-mk"), f:document.activeElement.getAttribute("data-mf"), s:document.activeElement.selectionStart} : null;
  var h = '<h3>Bản đồ chất liệu theo bảng phân bố</h3><p class="small muted">Mỗi dòng là một câu hỏi của bảng phân bố. Chọn mã, chép nguyên văn chỗ hỏi trong bài và ít nhất 2 trích dẫn làm chất liệu nhiễu. Ô bậc 4–5 nên có thêm chỗ hỏi dự phòng. Từ được hỏi (RE, VO, câu IS) tự vào danh sách từ giữ lại. Bài chỉ gửi thẩm định được khi không còn dòng đỏ.</p>'
    + '<div class="clsum"><span class="cls ok">✓ ' + nOk + ' dòng đạt</span><span class="cls fail">! ' + nF + ' dòng chưa đạt</span><span class="cls warn">? ' + (E.res.length - nOk - nF) + ' dòng nên xem</span></div>'
    + E.glob.map(function(g){ return '<div class="small warnc">• ' + esc(g.t) + '</div>'; }).join("")
    + '<p class="small muted">Dòng xếp theo bảng phân bố. <b>→ Câu n</b> là số câu trong đề, tính theo vị trí chỗ hỏi trong bài; câu về cả bài (MI, TO) xếp cuối (quy ước nhóm CH-B3). Câu lệnh soạn câu hỏi ở bước 9 dùng đúng thứ tự này.</p>'
    + '<table class="cltab maptab"><tbody>' + E.res.map(function(x, i){
      var v = x.v, l = x.l, k = l.key, dis = lk ? " disabled" : "";
      return '<tr class="clr ' + x.s + '"><td class="clc"><b>' + (i+1) + '</b><div class="small muted">' + esc(l.lv + " " + l.m) + '</div>' + (ORD.num[i] ? '<div class="small mapqn" title="Số câu trong đề: theo vị trí chỗ hỏi trong bài; câu về cả bài xếp cuối">→ Câu ' + ORD.num[i] + '</div>' : '') + '</td><td>'
        + '<div class="mapf"><select data-mk="' + k + '" data-mf="code"' + dis + '><option value="">Mã…</option>' + l.codes.map(function(c){ return '<option' + (x.code === c ? " selected" : "") + '>' + c + '</option>'; }).join("") + '</select>' + (v.codeAuto && x.code ? '<span class="small muted" title="Trang chọn sẵn mã đầu tiên của dòng này trong bảng phân bố' + (v.codeAI ? '; AI ghi ' + esc(v.codeAI) + ', mã này không có ở dòng này' : '') + '. Đổi được.">chọn sẵn' + (v.codeAI ? ' (AI ghi ' + esc(v.codeAI) + ')' : '') + '</span>' : '')
        + (l.sk ? '<span class="small muted">' + esc(l.sk.map(function(s){ return LSK[s] ? LSK[s][1] : s; }).join("; ")) + '</span>' : '')
        + (/^(RE|VO|VO\(ID\))$/.test(x.code) ? '<input type="text" data-mk="' + k + '" data-mf="w" placeholder="' + (x.code === "RE" ? "đại từ" : "từ, cụm được hỏi") + '" value="' + esc(v.w||"") + '"' + dis + '>' : '') + (x.lvl ? '<span class="small muted">mức ' + esc(x.lvl) + '</span>' : '') + (x.para ? '<span class="small muted">đoạn ' + x.para + '</span>' : '') + '</div>'
        + '<label class="mapl"><span>Chỗ hỏi</span><input type="text" class="mapq" data-mk="' + k + '" data-mf="q" placeholder="chép nguyên văn trong bài" value="' + esc(v.q||"") + '"' + dis + '></label>'
        + (l.lv !== "B3" || /^DE$/.test(x.code) ? '<label class="mapl"><span>Dự phòng</span><input type="text" class="mapq" data-mk="' + k + '" data-mf="alt" placeholder="chỗ hỏi thứ hai (nên có ở ô bậc 4–5; DE bậc 3 trung bình: chỗ nhắc lại ở đoạn khác)" value="' + esc(v.alt||"") + '"' + dis + '></label>' : '')
        + '<label class="mapl"><span>Nhiễu</span><input type="text" class="mapq" data-mk="' + k + '" data-mf="dis" placeholder="&quot;trích 1&quot;; &quot;trích 2&quot;" value="' + esc(v.dis||"") + '"' + dis + '></label>'
        + (x.msgs.length ? '<div class="small ' + (x.s === "fail" ? "no" : "warnc") + '">' + x.msgs.map(esc).join("; ") + '</div>' : '') + '</td></tr>';
    }).join("") + '</tbody></table>'
    + (lk ? '<p class="small muted">Bài đã khoá: bản đồ đã duyệt là đề bài giao cho người soạn câu hỏi.</p>' : '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="btn quiet" id="map-anch">Lấy khung câu hỏi ở bước 4 (chỉ điền dòng còn trống)</button><span class="small muted">Kết quả AI dán ở ô 1 phía trên. AI chỉ đề xuất; người soạn chọn và chịu trách nhiệm từng dòng.</span></div>');
  box.innerHTML = h;
  box.querySelectorAll("[data-ai]").forEach(renderAI);
  if(foc && foc.k){ var el = box.querySelector('[data-mk="' + foc.k + '"][data-mf="' + foc.f + '"]'); if(el){ el.focus(); try{ if(foc.s !== null) el.setSelectionRange(foc.s, foc.s); }catch(e){} } }
}
function wfDossierHTML(){
  var w = S.wf; if(!w) return "";
  var row = function(a, b){ return '<tr><td style="border:1px solid #999;padding:4px;vertical-align:top"><b>' + a + '</b></td><td style="border:1px solid #999;padding:4px">' + b + '</td></tr>'; };
  var h = '<table style="border-collapse:collapse;width:100%">' + row("Trạng thái", esc(w.st || "")) + row("Bản khoá", w.lock ? "bản " + w.lock.ver + " · " + esc(w.lock.by||"") + " · " + esc(libWhenMs(w.lock.at)) : "chưa khoá") + WF_ROLE_ORDER.map(function(r){ return row(WF_ROLES[r], esc(w.as[r]||"")); }).join("") + '</table>';
  h += '<p><b>Nhật ký</b></p><table style="border-collapse:collapse;width:100%">' + (w.log||[]).map(function(e){ return row(esc(libWhenMs(e.at)) + "<br>" + esc(e.by||"") + (e.dev ? " (dev)" : ""), esc(e.act||"") + (e.from !== e.to ? ": " + esc(e.from||"") + " → " + esc(e.to) : "") + (e.note ? "<br>" + esc(e.note) : "")); }).join("") + '</table>';
  var notes = (S.notes||[]); if(notes.length) h += '<p><b>Ghi chú thẩm định</b></p><table style="border-collapse:collapse;width:100%">' + notes.map(function(n){ return row(esc(n.code) + " · " + esc(n.sev) + "<br>" + esc(n.st), esc(clNoteText(n)).replace(/\n/g,"<br>") + (n.by ? "<br><i>" + esc(n.by) + "</i>" : "")); }).join("") + '</table>';
  var R = wfReviewState(); if(R.n) h += '<p><b>Quyết định cổng 3</b></p><table style="border-collapse:collapse;width:100%">' + R.items.map(function(it){ var d = (w.dec||{})[qSig(it)] || {}, a = (w.take||{})[qSig(it)]; return row("Câu " + it.n, esc(d.d || "chưa quyết định") + (d.note ? ": " + esc(d.note) : "") + (a ? " · người thẩm định chọn " + esc(a.a) + (a.a === it.ans ? " (đúng)" : " (đáp án " + esc(it.ans||"") + ")") : "")); }).join("") + '</table>';
  try{ h += '<p>Checklist ngữ liệu: ' + esc(clSummaryLine("NL")) + '.<br>Checklist câu hỏi: ' + esc(clSummaryLine("CH")) + '.</p>'; }catch(e){}
  return h;
}
/* ---- phiếu duyệt đề xuất (cổng 1): đặt ở đầu bước Nguồn ---- */
var WF_G1 = ["NL-A1","NL-A2","NL-A3","NL-A4","NL-A6"];
function wfFind(id){ var a = WF_T.concat(WF_R).filter(function(t){ return t.id === id; })[0]; return a; }
function wfPropHTML(){
  return ""; // cổng 1 đã bỏ
  var w = wfData(), st = w.st || "";
  if(st === "" || st === "Thay bài / Loại"){
    if(!wfCan("nl") || (!wfMe() && !wfDevOn())) return "";
    var P = wfAvail(wfFind("propose"));
    return '<div class="wfg1h"><div><div class="kicker">Cổng 1</div><h3>Gửi đề xuất cho Điều phối</h3></div></div>'
      + '<p class="small muted">Có chủ đề và điền khung Thông tin nguồn (cuối bước này) rồi thì gửi để Điều phối duyệt trước khi viết bài.</p>'
      + (P.conds.length ? '<ul class="wfcond">' + P.conds.map(wfCondHTML).join("") + '</ul>' : '')
      + (P.why.length ? '<div class="small warnc">' + esc(P.why.join("; ")) + '</div>' : '')
      + '<div><button type="button" class="btn ' + (P.ok ? "primary" : "quiet") + '" data-g1go="propose"' + (P.ok ? "" : " disabled") + '>Gửi đề xuất chủ đề</button></div>';
  }
  if(st === "Chủ đề đề xuất") return '<div class="wfg1h"><div><div class="kicker">Cổng 1</div><h3>Đề xuất đang chờ duyệt</h3></div><button type="button" class="btn sm" data-rvopen="1">Mở Phiếu duyệt</button></div><p class="small muted">' + (wfCan("coord") ? 'Thầy cô là Điều phối: bấm Mở Phiếu duyệt (hoặc nút Phiếu duyệt ở góc dưới bên phải) để xét và duyệt.' : 'Điều phối (' + esc(wfWhoName("coord")) + ') đang xét. Yêu cầu sửa (nếu có) hiện trong Phiếu duyệt.') + '</p>';
  return "";
}
function wfG1HTML(){
  return ""; // cổng 1 đã bỏ
  var w = wfData(), st = w.st || "";
  if(st !== "Chủ đề đề xuất") return "";
  var coord = wfCan("coord");
  if(wsOn()){ var hw = '<div class="rvlead"><p class="small muted">Xét chủ đề và bản nháp đề: chủ đề mới, đa dạng, cập nhật, phù hợp với người Việt Nam; không trùng đề khác trong thư viện. Duyệt thì người soạn hoàn thiện đề rồi gửi thẩm định.</p></div><p class="small"><b>Chủ đề:</b> ' + esc(wsV("theme") || "chưa ghi") + '</p>' + wsPreviewHTML(); return coord ? hw + wfG1Acts([]) : hw; }
  var ev = wfNL(), tk = clTicks(), f = S.fields || {}, sp = (typeof SPEC !== "undefined" && SPEC[S.spec]) || {};
  var url = f["pc-url"] || "", m = String(url).match(/https?:\/\/\S+/), src = typeof clSrcText === "function" ? clSrcText() : "";
  var sent = null; for(var i = w.log.length - 1; i >= 0; i--){ if(w.log[i].to === "Chủ đề đề xuất" && w.log[i].from !== "Chủ đề đề xuất"){ sent = w.log[i]; break; } }
  var who = w.as.nl ? wfWhoName("nl") : (sent && sent.by) || "Người soạn";
  var row = function(k, v){ return '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; };
  var h = '<div class="wfg1h"><div><div class="kicker">Cổng 1 · đề xuất chủ đề</div><h3>Phiếu duyệt đề xuất</h3></div><span class="cls warn">Chờ Điều phối duyệt</span></div>'
    + '<p class="small muted">' + esc(who) + ' gửi đề xuất' + (sent && sent.at ? " lúc " + esc(new Date(sent.at).toLocaleString("vi-VN", {hour:"2-digit", minute:"2-digit", day:"2-digit", month:"2-digit"})) : "") + '. '
    + (coord ? 'Thầy cô xem đề xuất, bấm Đạt hoặc Chưa đạt cho từng tiêu chí, rồi chọn cách xử lý ở cuối phiếu.' : 'Đang chờ ' + esc(wfWhoName("coord")) + ' duyệt. Thầy cô xem được phiếu, chưa duyệt được.') + '</p>'
    + '<div class="tablewrap"><table class="form wfg1t"><tbody>'
    + row("Phần thi", esc(sp.label || "") + (sp.genre ? ' <span class="small muted">· theme: ' + esc(sp.genre) + '</span>' : ''))
    + row("Chủ đề", esc(S.slots.topic || "(chưa ghi)"))
    + row("Nguồn", esc(f["pc-src"] || "(chưa ghi)"))
    + row("Đường link", m ? '<a href="' + esc(m[0]) + '" target="_blank" rel="noopener">' + esc(url) + '</a>' : esc(url || "(chưa có)"))
    + row("Giấy phép", esc(f["pc-lic"] || "(chưa ghi)"))
    + row("Văn bản nguồn", src.trim() ? src.trim().split(/\s+/).length + " từ đã dán ở bước này" : '<span class="muted">chưa dán</span>')
    + '</tbody></table></div>';
  var open = clNotes("NL").filter(function(n){ return n.st === "Mở" && n.loc === "cổng 1"; });
  if(open.length) h += '<div class="note small"><b>Yêu cầu sửa đang chờ người soạn:</b><ul>' + open.map(function(n){ return '<li>' + esc(n.issue) + (n.by ? ' <span class="muted">(' + esc(typeof peopleName === "function" && /@/.test(n.by) ? peopleName(n.by) : n.by) + ')</span>' : '') + '</li>'; }).join("") + '</ul></div>';
  h += '<div class="wfg1rows">' + WF_G1.concat(["NL-A5"]).map(function(c){
    var r = CL_ROWS.NL.filter(function(x){ return x.c === c; })[0], e = ev[c] || {s:"na", d:""}, t = tk[c], human = r.who === "H" || r.who === "MH";
    var btn = coord && human ? '<div class="wfg1b"><button type="button" class="btn quiet sm' + (t && t.v === "ok" && e.s !== "recheck" ? " on" : "") + '" data-g1tick="' + c + '" data-v="ok">Đạt</button><button type="button" class="btn quiet sm' + (t && t.v === "no" ? " on no" : "") + '" data-g1tick="' + c + '" data-v="no">Chưa đạt</button></div>' : '';
    var aid = CL_AIDS[c] ? '<details class="claid"><summary class="small">Xem để xét</summary><div class="claidb">' + (function(){ try{ return clAid(c); }catch(x){ return ""; } })() + '</div></details>' : '';
    return '<div class="wfg1r ' + e.s + '"><div class="wfg1c"><div><b>' + c + '</b> ' + esc(r.t) + (human ? '' : ' <span class="small muted">· máy kiểm</span>') + '</div>' + (e.d ? '<div class="small muted">' + esc(e.d) + '</div>' : '') + aid + '</div><div class="wfg1s">' + clStatusHTML(e) + btn + '</div></div>';
  }).join("") + '</div>';
  if(!coord) return h;
  return h + wfG1Acts(WF_G1.filter(function(c){ return !ev[c] || ev[c].s !== "ok"; }));
}
function wfG1Acts(left){
  var A = wfAvail(wfFind("g1ok")), h = "";
  var why = A.why.concat(left.length ? ["còn " + left.length + " tiêu chí chưa Đạt: " + left.join(", ")] : []);
  h += '<div class="wfg1a">'
    + '<div class="wfg1go"><button type="button" class="btn ' + (A.ok ? "primary" : "quiet") + ' big" data-g1go="ok"' + (A.ok ? "" : " disabled") + '>Duyệt đề xuất</button><span class="small' + (A.ok ? " muted" : " warnc") + '">' + (A.ok ? "Bài chuyển sang Đang adapt; người soạn nhận thông báo để viết tiếp." : esc("Chưa duyệt được: " + why.join("; ") + ".")) + '</span></div>'
    + '<div class="wfg1fix"><label class="small" for="wf-g1fix"><b>Cần người soạn sửa đề xuất?</b> Ghi rõ sửa gì. Bài giữ trạng thái chờ duyệt, người soạn nhận thông báo; sửa xong thầy cô duyệt lại ở phiếu này.</label>'
    + '<textarea id="wf-g1fix" rows="3" data-g1note="fix" placeholder="Ví dụ: [NL-A4] Chưa có giấy phép sử dụng của nguồn."></textarea><div><button type="button" class="btn" data-g1go="fix">Gửi yêu cầu sửa</button></div></div>'
    + '<details class="wfg1no"><summary class="small">Không duyệt chủ đề này, cho thay bài</summary><textarea rows="2" data-g1note="no" placeholder="Vì sao cho thay bài (bắt buộc)"></textarea><div><button type="button" class="btn quiet" data-g1go="no">Không duyệt, thay bài</button></div></details>'
    + '</div>';
  return h;
}
function wfG1Render(){
  var pp = document.getElementById("wf-prop"); if(pp){ var ph = ""; try{ ph = wfPropHTML(); }catch(e){} if(pp.getAttribute("data-h") !== ph){ pp.innerHTML = ph; pp.setAttribute("data-h", ph); } pp.classList.toggle("hidden", !ph); }
  var b = document.getElementById("wf-g1"); if(!b) return;
  var keep = {}, noOpen = !!b.querySelector("details.wfg1no[open]"), aids = [];
  b.querySelectorAll("[data-g1note]").forEach(function(t){ if(t.value) keep[t.getAttribute("data-g1note")] = t.value; });
  b.querySelectorAll(".wfg1r details.claid").forEach(function(d, i){ if(d.open) aids.push(i); });
  var h = ""; try{ h = wfG1HTML(); }catch(e){ h = ""; }
  b.innerHTML = h; b.classList.toggle("hidden", !h);
  Object.keys(keep).forEach(function(k){ var t = b.querySelector('[data-g1note="' + k + '"]'); if(t) t.value = keep[k]; });
  if(noOpen){ var d = b.querySelector("details.wfg1no"); if(d) d.open = true; }
  var ds = b.querySelectorAll(".wfg1r details.claid"); aids.forEach(function(i){ if(ds[i]) ds[i].open = true; });
}
function bindWfG1(){
  ["wf-g1", "wf-prop"].forEach(function(bid){ var b = document.getElementById(bid); if(!b) return;
  b.addEventListener("click", function(e){
    var t = e.target.closest("button"); if(!t) return;
    if(t.hasAttribute("data-rvopen")){ rvOpen(true); return; }
    var c = t.getAttribute("data-g1tick");
    if(c){
      var r = CL_ROWS.NL.filter(function(x){ return x.c === c; })[0], v = t.getAttribute("data-v"), tk = clTicks();
      if(tk[c] && tk[c].v === v && !(v === "ok" && clStale(r, tk[c]).length)) delete tk[c]; else tk[c] = {v:v, sig:clSig(r), at:Date.now(), by:wfMe(), dev:wfDevOn()};
      save(); try{ clRender(); }catch(x){} wfRender(); try{ updateStepper(); }catch(x){}
      if(v === "no" && tk[c]){ var ta = b.querySelector('[data-g1note="fix"]'); if(ta){ if(ta.value.indexOf("[" + c + "]") < 0) ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, "") + "\n" : "") + "[" + c + "] "; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }
      return;
    }
    var go = t.getAttribute("data-g1go"); if(!go) return;
    var T = wfFind({ok:"g1ok", fix:"g1fix", no:"g1no", propose:"propose"}[go]), ta2 = b.querySelector('[data-g1note="' + go + '"]'), note = ta2 ? ta2.value.trim() : "";
    if(T.note && !note){ toast(go === "fix" ? "Ghi rõ cần sửa gì trước khi gửi." : "Ghi lý do cho thay bài."); if(ta2) ta2.focus(); return; }
    if(!wfAvail(T).ok){ toast("Chưa đủ điều kiện."); return; }
    if(ta2) ta2.value = "";
    wfDo(T, note, go === "fix");
    if(go === "fix") toast("Đã gửi yêu cầu sửa cho người soạn.");
  });
  });
}

/* ---- phiếu duyệt nổi: một khung bên phải cho cả 3 cổng, bài vẫn hiện bên trái ---- */
var RV = {open:false, key:""};
function rvState(){
  var w = wfData(), st = w.st || "", me = wfMe(), ws = wfIsWS();
  if(!wfModeActive()) return {g:0};
  if(st === "Chờ thẩm định ngữ liệu" || (w.req && w.req.st === "chờ duyệt")) return {g:2, title:w.req && w.req.st === "chờ duyệt" ? "Cổng 2 · Duyệt phần sửa ngữ liệu" : "Cổng 2 · Thẩm định ngữ liệu", mine:wfCan("tdnl") && (wfDevOn() || w.as.nl !== me)};
  if(st === "Chờ thẩm định câu hỏi") return {g:3, title:"Cổng 3 · Thẩm định câu hỏi", mine:wfCan("tdch") && (wfDevOn() || w.as.ch !== me)};
  if(st === "Đã hoàn thiện" || st === "Thay bài / Loại") return {g:0};
  if(st === (ws ? "Ngữ liệu đã duyệt (khoá)" : "Câu hỏi đã duyệt")) return {g:4, title:ws ? "Duyệt hoàn thiện đề" : "Cổng 4 · Duyệt hoàn thiện", mine:wfDevOn() ? wfDevRole() === "coord" : wfIsCoordUser()};
  // người soạn: khung "Chốt và gửi" (chỉ hiện với người giữ vai, hoặc vai chưa giao mà mình nhận được)
  var own = function(r){ return wfDevOn() ? wfDevRole() === r : (!!me && (w.as[r] === me || (!w.as[r] && wfCan(r)))); };
  var c = [];
  if(w.req && (w.req.st === "chờ sửa" || w.req.st === "đang sửa")) c.push({g:5, role:"nl", acts:["rqopen","rqsend"], title:"Chốt và gửi · Phần sửa ngữ liệu"});
  if(["", "Chủ đề đề xuất", "Đang adapt", "Ngữ liệu cần sửa"].indexOf(st) >= 0) c.push({g:5, role:"nl", acts:["nlsub"], title:ws ? "Chốt và gửi · Đề" : "Chốt và gửi · Ngữ liệu"});
  if(!ws && ["Ngữ liệu đã duyệt (khoá)", "Đang soạn câu hỏi", "Câu hỏi cần sửa"].indexOf(st) >= 0) c.push({g:6, role:"ch", acts:["chstart","chsub"], title:"Chốt và gửi · Câu hỏi"});
  var pick = c.filter(function(x){ return own(x.role); })[0];
  if(!pick) return {g:0};
  pick.send = true; pick.mine = true; return pick;
}
function rvActs(ids){
  var w = wfData(), out = [];
  WF_T.forEach(function(t, i){ if(ids.indexOf(t.id) >= 0 && wfApplies(t) && t.from.indexOf(w.st || "") >= 0) out.push({A:wfAvail(t), i:i, r:false}); });
  WF_R.forEach(function(t, i){ if(ids.indexOf(t.id) >= 0 && wfApplies(t) && t.when(w)) out.push({A:wfAvail(t), i:i, r:true}); });
  // giữ thứ tự của danh sách gọi: việc chính trước, việc trả về sau
  return out.filter(function(x){ return wfDevOn() ? wfDevRole() === x.A.t.role : (x.A.t.role === "coord" ? wfIsCoordUser() : wfCan(x.A.t.role)); }).sort(function(a, b){ return ids.indexOf(a.A.t.id) - ids.indexOf(b.A.t.id); });
}
/* ai nhận thông báo khi bấm: vai kế tiếp và tên người giữ vai */
var RV_NEXT = {nlsub:"tdnl", rqsend:"tdnl", chsub:"tdch", g2ok:"ch", g3ok:"coord"};
function rvNextLine(ids){
  var w = wfData(), out = [];
  ids.forEach(function(id){
    var r = RV_NEXT[id]; if(!r) return; var T = wfFind(id); if(!T || !wfApplies(T)) return;
    if(id === "g2ok" && wfIsWS()) r = "coord";
    var who = w.as[r] || "", name = who ? (typeof peopleName === "function" ? peopleName(who) : who) : "";
    if(r === "coord" && !who) out.push("<b>" + esc(T.label) + "</b>: trang báo cho quản trị thư viện (bài chưa có Điều phối).");
    else if(who) out.push("<b>" + esc(T.label) + "</b>: trang báo ngay cho " + esc(WF_ROLES[r]) + " <b>" + esc(name) + "</b> ở chuông thông báo.");
    else out.push('<span class="warnc"><b>' + esc(T.label) + "</b>: chưa giao " + esc(WF_ROLES[r]) + ". Bấm gửi thì trang báo Điều phối (" + esc(wfWhoName("coord")) + ") để giao người.</span>");
  });
  return out.length ? '<p class="small">' + out.join("<br>") + "</p>" : "";
}
function rvActsHTML(ids){ return rvActs(ids).map(function(x){ return wfActHTML(x.A, x.r, x.i); }).join(""); }
function rvLead(g){
  var w = wfData(), st = w.st || "";
  if(g === 2){
    var rq = w.req && w.req.st === "chờ duyệt", mine = rvState().mine;
    return '<div class="rvlead"><p class="small muted">' + (rq ? "Người soạn câu hỏi yêu cầu sửa bài đã khoá; người soạn ngữ liệu đã sửa xong. Xem phần khác so với bản khoá, rồi duyệt hoặc trả lại." : (mine ? "Đọc bài ở bên trái (bước Viết bài hoặc Chất liệu), bấm Đạt hoặc Chưa đạt cho từng dòng checklist dưới đây. Lỗi nào cũng ghi chú để người soạn sửa, không sửa thẳng vào bài. Xong thì chọn duyệt hoặc trả sửa ở cuối phiếu." : "Người thẩm định ngữ liệu (" + esc(wfWhoName("tdnl")) + ") đang xét. Thầy cô xem được phiếu.")) + '</p>'
      + (w.g1self ? '<div class="note small">Cổng 1 của bài này do Điều phối kiêm người soạn tự duyệt: xét kỹ các dòng NL-A (chủ đề, nguồn, giấy phép).</div>' : '') + '</div>';
  }
  if(g === 3){
    var mine3 = rvState().mine;
    return '<div class="rvlead"><p class="small muted">' + (mine3 ? "Làm bài khi ẩn đáp án trước, rồi quyết định từng câu và xét checklist CH. Không sửa câu hỏi: góp ý để người soạn sửa. Xong thì chọn duyệt hoặc trả sửa ở cuối phiếu." : "Người thẩm định câu hỏi (" + esc(wfWhoName("tdch")) + ") đang xét. Thầy cô xem được phiếu.") + '</p></div>';
  }
  if(g === 4){
    var mine4 = rvState().mine, ws = wfIsWS(), sc = ws ? ["WS"] : ["NL", "CH"], lines = [];
    var last = function(re){ for(var i = (w.log || []).length - 1; i >= 0; i--){ var e = w.log[i]; if(re.test(e.act || "")) return e; } return null; };
    var fmt = function(e){ return e ? esc(typeof peopleName === "function" && e.by && e.by.indexOf("@") > 0 ? peopleName(e.by) : (e.by || "")) + ", " + new Date(e.at).toLocaleDateString("vi-VN") : "chưa thấy trong lịch sử"; };
    lines.push((ws ? "Thẩm định đề" : "Cổng 2 (ngữ liệu)") + ": " + fmt(last(/^Duyệt cổng 2|^Duyệt phần sửa/)));
    if(!ws) lines.push("Cổng 3 (câu hỏi): " + fmt(last(/^Duyệt cổng 3/)));
    sc.forEach(function(k){ try{ var f = wfMachineFails(k, clEval(k)), m = wfOpenMust(k); lines.push("Checklist " + k + ": " + (f.length ? '<span class="warnc">máy báo chưa đạt ' + esc(f.join(", ")) + "</span>" : "máy kiểm đạt") + (m ? '; <span class="warnc">' + m + " ghi chú PHẢI SỬA còn mở</span>" : "")); }catch(e){} });
    return '<div class="rvlead"><p class="small muted">' + (mine4 ? "Bài đã qua thẩm định. Xem lại bài" + (ws ? "" : " và bộ câu hỏi") + ", phiếu nộp, rồi duyệt hoàn thiện hoặc trả về sửa. Duyệt xong, trang báo cho cả nhóm của bài." : "Điều phối (" + esc(wfWhoName("coord")) + ") đang duyệt hoàn thiện.") + '</p><ul class="small">' + lines.map(function(x){ return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
  }
  if(g === 5 || g === 6){
    var R = rvState();
    return '<div class="rvlead"><p class="small muted">' + (g === 5 ? (wfIsWS() ? "Soạn xong đề và checklist máy kiểm đạt thì gửi thẩm định." : "Viết xong bài, sửa hết dòng đỏ, ghi đủ nguồn thì gửi thẩm định ngữ liệu.") : "Soạn xong bộ câu hỏi, sửa hết lỗi máy báo thì gửi thẩm định câu hỏi.") + " Điều kiện chưa đạt hiện ngay dưới nút.</p>" + rvNextLine(R.acts || []) + "</div>";
  }
  return "";
}
function rvRender(){
  var d = document.getElementById("rvdrawer"); if(!d) return;
  var R = rvState();
  var keep = {}; d.querySelectorAll("[data-wfnote]").forEach(function(t){ if(t.value) keep[t.getAttribute("data-wfnote")] = t.value; });
  var g2 = document.getElementById("wf-g2"), g3 = document.getElementById("wf-g3");
  if(g2){ var cb = g2.querySelector(".clbox"), want = wfIsWS() ? "WS" : "NL"; if(cb && cb.getAttribute("data-cl") !== want){ cb.setAttribute("data-cl", want); cb.innerHTML = ""; delete cb.dataset.drawn; setTimeout(function(){ try{ clRender(); }catch(e){} }, 0); } }
  if(g2){ g2.classList.toggle("hidden", R.g !== 2); if(R.g === 2){ document.getElementById("wf-g2h").innerHTML = rvLead(2); document.getElementById("wf-g2a").innerHTML = rvActsHTML(["g2ok","g2back","g2backc","g2no","rqok","rqback","rqfull"]); } }
  if(g3){ g3.classList.toggle("hidden", R.g !== 3); if(R.g === 3){ document.getElementById("wf-g3h").innerHTML = rvLead(3); document.getElementById("wf-g3a").innerHTML = rvActsHTML(["g3ok","g3back","g3backc"]); } }
  var gx = document.getElementById("wf-gx"), gxOn = R.g === 4 || R.g === 5 || R.g === 6;
  if(gx){ gx.classList.toggle("hidden", !gxOn); if(gxOn){ document.getElementById("wf-gxh").innerHTML = rvLead(R.g); document.getElementById("wf-gxa").innerHTML = rvActsHTML(R.g === 4 ? ["g4","g4ws","g4back","g2undoc","g2noc"] : R.acts); } }
  var g1 = document.getElementById("wf-g1"); if(g1 && R.g !== 1) g1.classList.add("hidden");
  Object.keys(keep).forEach(function(k){ var t = d.querySelector('[data-wfnote="' + k + '"]'); if(t) t.value = keep[k]; });
  d.classList.toggle("wftaking", !!wfTaking);
  rvSync();
}
function rvSync(){
  var d = document.getElementById("rvdrawer"), f = document.getElementById("rvfab"); if(!d || !f) return;
  var R = rvState();
  // vào bài đang chờ mình duyệt thì mở sẵn phiếu (màn hình rộng)
  var key = R.g ? ((S.lib && S.lib.id) || "") + "|" + R.g : "";
  // khung "Chốt và gửi" của người soạn không tự mở (người soạn đang làm bài); đổi bài hay đổi bước thì đóng
  if(key !== RV.key){ RV.key = key; RV.open = !!(R.g && R.mine && !R.send && window.innerWidth >= 900); var rb = d.querySelector(".rvbody"); if(rb) rb.scrollTop = 0; }
  if(!R.g) RV.open = false;
  var fh = "";
  if(R.send){ var nOk = rvActs(R.acts).filter(function(x){ return x.A.ok; }).length; fh = '<span aria-hidden="true">📤</span> Chốt và gửi <span class="rvsub">· ' + (R.g === 5 ? (wfIsWS() ? "đề" : "ngữ liệu") : "câu hỏi") + '</span> <span class="rvchip' + (nOk ? " rvready" : "") + '">' + (nOk ? "Sẵn sàng gửi" : "Chưa đủ điều kiện") + '</span>'; }
  else if(R.g) fh = '<span aria-hidden="true">📋</span> Phiếu duyệt <span class="rvsub">· ' + (R.g === 4 ? (wfIsWS() ? "Hoàn thiện" : "Cổng 4") : "Cổng " + R.g) + '</span>' + (R.mine ? ' <span class="rvchip">Đến lượt bạn</span>' : '');
  if(f.getAttribute("data-h") !== fh){ f.innerHTML = fh; f.setAttribute("data-h", fh); }
  f.classList.toggle("hidden", !R.g); f.classList.toggle("mine", !!R.mine);
  f.setAttribute("aria-expanded", RV.open ? "true" : "false");
  d.classList.toggle("hidden", !RV.open);
  document.body.classList.toggle("rvopen", !!RV.open);
  var tt = document.getElementById("rv-title"); if(tt && tt.textContent !== (R.title || "")) tt.textContent = R.title || "";
  var kk = document.getElementById("rv-kick"), kt = R.send ? "Chốt và gửi" : "Phiếu duyệt"; if(kk && kk.textContent !== kt) kk.textContent = kt;
  d.setAttribute("aria-label", kt);
}
function rvOpen(on){ RV.open = !!on; rvSync(); if(on){ try{ clRender(); }catch(e){} } }
function bindRv(){
  var f = document.getElementById("rvfab"), d = document.getElementById("rvdrawer"); if(!f || !d) return;
  f.addEventListener("click", function(){ rvOpen(!RV.open); });
  document.getElementById("rv-close").addEventListener("click", function(){ rvOpen(false); });
  d.addEventListener("click", function(e){
    var b = e.target.closest("button"); if(!b) return;
    var g = b.getAttribute("data-wfgo");
    if(g){ var isR = g[0] === "r", t = (isR ? WF_R : WF_T)[+g.slice(1)], ta = d.querySelector('[data-wfnote="' + g + '"]'); wfDo(t, ta ? ta.value : "", isR); }
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && RV.open && !e.target.closest("input, textarea, select")){ rvOpen(false); } });
}

function bindWf(){
  bindWfG1(); bindRv();
  var box = document.getElementById("wfbar"); if(!box) return;
  box.addEventListener("click", function(e){
    var b = e.target.closest("button"); if(!b) return;
    dateFlush();
    var g = b.getAttribute("data-wfgo");
    if(g){ var isR = g[0] === "r", t = (isR ? WF_R : WF_T)[+g.slice(1)], ta = box.querySelector('[data-wfnote="' + g + '"]'); wfDo(t, ta ? ta.value : "", isR); return; }
    var r = b.getAttribute("data-wfrole"); if(r){ var d = wfDev(); d.role = r; wfDevSet(d); wfRender(); try{ clRender(); renderQ(); }catch(x){} return; }
    if(b.id === "wf-auto"){ var w = wfData(), nx = WF_T.filter(function(t){ return wfApplies(t) && t.from.indexOf(w.st||"") >= 0 && !t.back && t.id.slice(-1) !== "c" && !/no$/.test(t.id); })[0] || WF_R.filter(function(t){ return t.when(w) && t.id !== "rqcancel"; })[0]; if(nx){ var d2 = wfDev(); d2.role = nx.role; wfDevSet(d2); toast("Đổi vai: " + WF_ROLES[nx.role] + "."); } wfRender(); try{ clRender(); renderQ(); }catch(x){} return; }
  });
  box.addEventListener("change", function(e){
    var t = e.target; if(dateTyping(t) || dateHold(t)) return;
    if(t.id === "wf-dev"){ var d = wfDev(); d.on = t.checked; if(!d.role) d.role = "nl"; wfDevSet(d); wfRender(); try{ clRender(); renderQ(); }catch(x){} return; }
    var rd = t.getAttribute && t.getAttribute("data-wfrdue"); if(rd){ var wr = wfData(); wr.dues = wr.dues || {}; var nd = Object.assign({}, wr.dues); if(t.value) nd[rd] = t.value; else delete nd[rd]; var badO = typeof prjDueOrderOf === "function" ? prjDueOrderOf(nd, wr.due || (S.prj && prjById(S.prj.id) && prjById(S.prj.id).due) || "") : ""; if(badO){ toast("Không đổi được: " + badO + ". Phần sau chỉ bắt đầu khi phần trước xong."); wfRender(); return; } if(t.value) wr.dues[rd] = t.value; else delete wr.dues[rd]; wr.asAt = Date.now(); wr.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:wr.st, to:wr.st, act:"Đổi hạn " + WF_ROLES[rd], note:t.value ? prjFmt(t.value) : "(bỏ hạn)"}); save(); wfRender(); return; }
    if(t.id === "wf-due"){ var wd = wfData(); if(t.value && typeof prjDueOrderOf === "function"){ var bd = prjDueOrderOf(wd.dues || {}, t.value); if(bd){ toast("Không đổi được hạn hoàn thiện: " + bd + "."); wfRender(); return; } } wd.due = t.value || ""; wd.asAt = Date.now(); wd.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:wd.st, to:wd.st, act:"Đổi hạn", note:t.value ? prjFmt(t.value) : "(bỏ hạn)"}); save(); wfRender(); return; }
    if(t.id === "wf-force" && t.value){ wfForce(t.value, "đặt thẳng để thử"); return; }
    var r = t.getAttribute("data-wfas"); if(r){ var w = wfData(), v = t.value.trim().toLowerCase(); var was = w.as[r] || ""; if(v) w.as[r] = v; else delete w.as[r]; w.asAt = Date.now(); if(v && v !== was && typeof ntfAssignOne === "function") ntfAssignOne(r, v); w.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:w.st, to:w.st, act:"Phân công " + WF_ROLES[r], note:v || "(bỏ trống)"}); save(); wfRender(); }
  });
  var rv = document.getElementById("wf-review");
  if(rv){
    rv.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      if(b.id === "wf-take"){ wfTaking = true; wfRender(); rv.scrollIntoView({block:"start"}); return; }
      if(b.id === "wf-take-cancel"){ wfTaking = false; wfRender(); return; }
      if(b.id === "wf-take-done"){
        var w = wfData(), miss = 0;
        rv.querySelectorAll(".wftake").forEach(function(d){ var sg = d.getAttribute("data-sig"), c = d.querySelector("input[type=radio]:checked"); if(!c){ miss++; return; } w.take[sg] = {a:c.value, unsure:d.querySelector("[data-unsure]").checked, by:wfWho(), at:Date.now()}; });
        if(miss){ toast("Còn " + miss + " câu chưa chọn đáp án."); return; }
        w.log.push({at:Date.now(), by:wfWho(), dev:wfDevOn(), from:w.st, to:w.st, act:"Làm bài khi ẩn đáp án", note:""});
        wfTaking = false; save(); wfRender(); try{ clRender(); }catch(x){} return;
      }
    });
    rv.addEventListener("change", function(e){
      var t = e.target, f = t.getAttribute("data-dec"); if(!f) return;
      var tr = t.closest("tr"); wfDecSet(tr.getAttribute("data-sig"), f, t.value); wfRender(); try{ clRender(); }catch(x){} updateStepper();
    });
  }
  var mp = document.getElementById("map-paste");
  if(mp){ var mpt; mp.addEventListener("input", function(){ clearTimeout(mpt); mpt = setTimeout(function(){
    var msg = document.getElementById("map-msg");
    if(wfDraftLocked()){ msg.textContent = "Bài đã khoá: không đổi bản đồ."; return; }
    if(!mp.value.trim()){ msg.textContent = ""; return; }
    var n = mapParseAI(mp.value); mapRender(); try{ clRender(); renderKeepCheck(); }catch(x){}
    var E = mapEval(), bad = E.res.filter(function(x){ return x.s === "fail"; }).length;
    msg.textContent = n ? "Đã điền " + n + " dòng vào bản đồ bên dưới. " + (bad ? bad + " dòng còn đỏ: xem lý do ở từng dòng và sửa tay, hoặc nhờ AI đề xuất lại." : "Không còn dòng đỏ; vẫn đọc lại từng dòng.") : !mapLines().length ? "Chưa điền được bản đồ. " + qbpWhy() : /^\s*[-•>]*\s*D[ÒO]NG\s+\d+\s*\|/im.test(cleanPaste(mp.value)) ? "Có dòng \"DÒNG số |\" nhưng số dòng vượt quá " + mapLines().length + " dòng của bảng phân bố. Kiểm tra lại dạng bài (Part) đã chọn." : "Không thấy dòng nào bắt đầu bằng \"DÒNG số |\". Hãy nhắc AI trình bày đúng khuôn trong một khối code.";
  }, 400); }); }
  var mb = document.getElementById("mapbox");
  if(mb){
    var mt; mb.addEventListener("input", function(e){
      var t = e.target, k = t.getAttribute("data-mk"); if(!k) return;
      var M = mapData(); M.rows[k] = M.rows[k] || {}; M.rows[k][t.getAttribute("data-mf")] = t.value; if(t.getAttribute("data-mf") === "code"){ M.rows[k].codeAuto = false; M.rows[k].codeAI = ""; } save();
      clearTimeout(mt); mt = setTimeout(function(){ mapRender(); try{ clRender(); renderKeepCheck(); }catch(x){} }, t.tagName === "SELECT" ? 0 : 500);
    });
    mb.addEventListener("change", function(e){ if(e.target.tagName === "SELECT"){ mapRender(); try{ clRender(); }catch(x){} } });
    mb.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      if(b.id === "map-anch"){ var n2 = mapFromAnchors(); mapRender(); try{ clRender(); renderKeepCheck(); }catch(x){} toast(n2 ? "Đã điền " + n2 + " dòng từ điểm neo bước 4." : "Không có điểm neo phù hợp (ghi chú bước 4 chưa có mục 6, hoặc các dòng đã điền)."); return; }
    });
  }
}

/* ---- chế độ soạn / chế độ xem theo vai và theo tiến trình ----
   Ai cũng xem được mọi bước; chỉ người đang đến lượt (đúng vai, đúng giai đoạn) mới sửa nội dung.
   Người thẩm định xem bài và dùng checklist, ghi chú; không sửa bài. */
var WF_STAGE_OF = {"ws-chude":"A","ws-nguon":"A","ws-soan":"A","ws-kiem":"A","bat-dau":"A","chu-de":"A","nguon":"A","viet-bai":"B","viet-kich-ban":"B","do-dai":"B","tu-vung":"B","noi-dung":"B","chat-lieu":"B","cau-hoi":"C","nop":"D"};
var WF_C_OPEN = {"Ngữ liệu đã duyệt (khoá)":1,"Đang soạn câu hỏi":1,"Chờ thẩm định câu hỏi":1,"Câu hỏi cần sửa":1,"Câu hỏi đã duyệt":1,"Đã hoàn thiện":1};
var WF_MODE_KEEP = ".clbox, #wf-review, #wf-g1, #wfbar, [data-cmpmount], .clsearch, .modebar, [data-cmpsearch], .navrow";
function wfModeActive(){ return !window.__noGate && !!(S.wf && S.lib && S.lib.id && (S.prj || S.wf.st)) || (!!window.__noGate && !!(S.wf && S.lib && S.lib.id && S.prj)); }
function wfCan(r){ var w = wfData(), me = wfMe(); if(wfDevOn()) return wfDevRole() === r; if(r === "coord") return wfIsCoordUser(); if(wfAdmin() && me) return true; return !!me && (w.as[r] === me || !w.as[r]); }
function wfWhoName(r){ var w = wfData(), e = w.as[r]; return e ? (typeof peopleName === "function" ? peopleName(e) : e) : (r === "coord" ? "Điều phối" : "chưa giao"); }
// hạn của phần đang làm; bị trả sửa thì hạn là hạn của người thẩm định (cả phần phải xong trước đó)
function wfPhaseDue(role){
  var w = wfData(), d = w.dues || {}, st = w.st || "", rq = w.req && w.req.st, fin = w.due || (S.prj && typeof prjById === "function" && prjById(S.prj.id) ? prjById(S.prj.id).due || "" : "");
  if(role === "nl" && (st === "Ngữ liệu cần sửa" || rq === "chờ sửa" || rq === "đang sửa")) return {d:d.tdnl || fin, label:"Sửa xong trước"};
  if(role === "ch" && st === "Câu hỏi cần sửa") return {d:d.tdch || fin, label:"Sửa xong trước"};
  return {d:(role && role !== "coord" ? d[role] : "") || fin, label:"Hạn"};
}
function wfModeFor(sid){
  var w = wfData(), st = w.st || "", rq = w.req && w.req.st, X = WF_STAGE_OF[sid] || "A", lockedNl = !!WF_LOCKED[st];
  var aEdit = ["", "Chủ đề đề xuất", "Đang adapt", "Ngữ liệu cần sửa"].indexOf(st) >= 0 || rq === "đang sửa";
  var bOpen = true, bEdit = ["", "Chủ đề đề xuất", "Đang adapt", "Ngữ liệu cần sửa"].indexOf(st) >= 0 || rq === "đang sửa";
  var cOpen = !!WF_C_OPEN[st], cEdit = st === "Đang soạn câu hỏi" || st === "Câu hỏi cần sửa";
  var open = true, edit = false, role = "nl", pend = "";
  if(X === "A"){ edit = aEdit; role = "nl"; }
  else if(X === "B"){ open = bOpen; edit = bOpen && bEdit; role = "nl"; pend = "mở khi Điều phối duyệt cổng 1 (chủ đề, nguồn)"; }
  else if(X === "C"){ open = cOpen; edit = cEdit; role = "ch"; pend = "mở khi ngữ liệu được duyệt và khoá (cổng 2)"; }
  else { role = cEdit ? "ch" : "nl"; edit = (aEdit || bEdit || cEdit); }
  var mine = edit && (wfCan(role) || (X === "D" && wfCan("coord")));
  var extra = [];
  if(st === "Chờ thẩm định ngữ liệu" && w.g1self && wfCan("tdnl") && (X === "A" || X === "B")) extra.push("Cổng 1 của bài này do Điều phối kiêm người soạn tự duyệt: xét kỹ các dòng NL-A (chủ đề, nguồn, giấy phép) vì chưa có người thứ hai xem.");
  if(st === "Chờ thẩm định ngữ liệu" && wfCan("tdnl") && (X === "A" || X === "B")) extra.push("Bạn là người thẩm định ngữ liệu: đọc bài, rồi xét checklist NL và duyệt trong Phiếu duyệt (góc dưới bên phải). Lỗi nào cũng ghi chú để người soạn sửa, không sửa thẳng vào bài.");
  if(rq === "chờ duyệt" && wfCan("tdnl") && (X === "A" || X === "B")) extra.push("Bạn duyệt phần sửa ngữ liệu theo yêu cầu: xem phần khác so với bản khoá ở thanh Quy trình.");
  if(st === "Chờ thẩm định câu hỏi" && wfCan("tdch") && X === "C") extra.push("Bạn là người thẩm định câu hỏi: mở Phiếu duyệt (góc dưới bên phải) để làm bài khi ẩn đáp án, quyết định từng câu và xét checklist CH. Không sửa câu hỏi.");
  if(st === "Ngữ liệu đã duyệt (khoá)" && wfCan("ch") && X === "C") extra.push("Bấm \"Nhận bài, bắt đầu soạn câu hỏi\" ở thanh Quy trình để mở phần soạn.");
  if(lockedNl && !rq && wfCan("ch") && (X === "A" || X === "B")) extra.push("Bài đã khoá. Cần đổi bài thì gửi Yêu cầu sửa ngữ liệu ở thanh Quy trình.");
  if(!open) return {mode:"pending", head:"🔒 Chưa tới bước này", sub:"Bước này " + pend + ". Bạn xem được, chưa ai sửa được.", extra:extra};
  if(mine){ var pd = wfPhaseDue(role), n = pd.d && typeof prjDaysLeft === "function" ? prjDaysLeft(pd.d) : null;
    var subA = wfAdmin() && w.as[role] && w.as[role] !== wfMe() ? "Bạn là quản trị, đang sửa thay " + wfWhoName(role) + ". " : "";
    return {mode:"edit", head:"✏️ Bạn đang soạn · vai " + WF_ROLES[role], sub:subA + ((st === "Ngữ liệu cần sửa" || st === "Câu hỏi cần sửa") ? "Bài được trả sửa: xem ghi chú, sửa xong thì đo lại và gửi thẩm định lại." : ""), due:pd.d ? {d:pd.d, label:pd.label, n:n} : null, extra:extra}; }
  var why = edit ? "Người sửa bước này: " + wfWhoName(role) + " (" + WF_ROLES[role] + ")." : (X === "C" && st === "Ngữ liệu đã duyệt (khoá)") ? "Chờ người soạn câu hỏi (" + wfWhoName("ch") + ") nhận bài." : (lockedNl && X !== "C") ? "Bài đã khoá sau cổng 2" + (w.lock ? " (bản " + w.lock.ver + ")" : "") + "." : st ? "Bài đang ở trạng thái: " + st + "." : "";
  return {mode:"view", head:"👁 Chế độ xem", sub:why, extra:extra};
}
function wfCanEditScreen(sid){ if(!wfModeActive() || wfBypass) return true; return wfModeFor(sid).mode === "edit"; }
function wfCanEditSlot(id){ var el = document.querySelector('[data-slot="' + id + '"]'), scr = el && el.closest(".screen"); return !scr || wfCanEditScreen(scr.id); }
function wfModeApply(){
  // thanh chế độ dính ngay dưới thanh đầu trang (chiều cao đổi theo màn hình, tên bài dài)
  try{ var tp = document.querySelector(".top"); if(tp){ var hh = Math.round(tp.getBoundingClientRect().height) + "px"; if(document.documentElement.style.getPropertyValue("--toph") !== hh) document.documentElement.style.setProperty("--toph", hh); } }catch(e){}
  try{ rvSync(); }catch(e){}
  var scr = document.querySelector(".screen:not(.hidden)"); if(!scr) return;
  var on = wfModeActive(), m = on ? wfModeFor(scr.id) : null;
  document.querySelectorAll(".screen").forEach(function(s){ if(s !== scr) s.classList.remove("mode-edit", "mode-view", "mode-pending"); });
  scr.classList.toggle("mode-edit", !!m && m.mode === "edit"); scr.classList.toggle("mode-view", !!m && m.mode !== "edit"); scr.classList.toggle("mode-pending", !!m && m.mode === "pending");
  var bar = scr.querySelector(":scope > .modebar");
  if(!m){ if(bar) bar.remove(); }
  else {
    if(!bar){ bar = document.createElement("div"); bar.className = "modebar"; var k = scr.querySelector(":scope > .kicker"); if(k) k.insertAdjacentElement("afterend", bar); else scr.insertBefore(bar, scr.firstChild); }
    var kk = scr.querySelector(":scope > .kicker"), stepLbl = ((kk ? kk.textContent.trim() + " · " : "") + (scr.getAttribute("data-name") || "")).trim();
    var html = (stepLbl ? '<div class="modestep">' + esc(stepLbl) + '</div>' : '') + '<div class="modehead"><b>' + esc(m.head) + '</b>' + (m.due ? ' <span class="hdue ' + (m.due.n !== null ? prjLeftCls(m.due.n) : "") + '">' + esc(m.due.label + " " + prjFmt(m.due.d)) + (m.due.n !== null ? ' · <b>' + esc(prjLeftText(m.due.n)) + '</b>' : '') + '</span>' : '') + '</div>' + (m.sub ? '<div class="small">' + esc(m.sub) + '</div>' : '') + m.extra.map(function(t){ return '<div class="small modeextra">' + esc(t) + '</div>'; }).join("");
    bar.className = "modebar " + m.mode; if(bar.getAttribute("data-h") !== html){ bar.innerHTML = html; bar.setAttribute("data-h", html); }
  }
  var lock = !!m && m.mode !== "edit";
  scr.querySelectorAll("textarea, input, select, #mapbox button").forEach(function(el){
    if(el.closest(WF_MODE_KEEP) || el.type === "search" || el.type === "hidden" || el.type === "file") return;
    var text = el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && /^(text|number|url|email|)$/.test(el.type || ""));
    if(lock){ if(!el.hasAttribute("data-modelock")){ el.setAttribute("data-modelock", text ? (el.readOnly ? "keep" : "1") : (el.disabled ? "keep" : "1")); if(text) el.readOnly = true; else el.disabled = true; } }
    else if(el.hasAttribute("data-modelock")){ var v = el.getAttribute("data-modelock"); el.removeAttribute("data-modelock"); if(v === "1"){ if(text) el.readOnly = false; else el.disabled = false; } }
  });
  // thanh bước: bước chưa tới có ổ khoá, bước mình đang soạn có chấm xanh
  document.querySelectorAll("[data-step]").forEach(function(b){ var id = b.getAttribute("data-step"), mm = on ? wfModeFor(id) : null; b.classList.toggle("stlock", !!mm && mm.mode === "pending"); b.classList.toggle("stmine", !!mm && mm.mode === "edit"); b.title = mm ? (mm.mode === "pending" ? mm.sub : mm.mode === "edit" ? "Bạn đang soạn bước này" : "Chế độ xem") : ""; });
  // phiếu Nộp hiện lại thông tin nguồn ghi ở bước Nguồn
  document.querySelectorAll(".pcmirror").forEach(function(sp){ var v = (S.fields || {})[sp.getAttribute("data-of")] || ""; sp.textContent = v || "chưa ghi"; sp.classList.toggle("muted", !v); });
}

;
/* ===== Giao diện dòng lệnh =====
   node vstep_check.js <state.json> [lệnh] [tham số]
   Lệnh:
     check               (mặc định) in báo cáo JSON: số liệu, cách sửa, checklist NL/CH/WS, bản đồ chất liệu, câu hỏi
     prompt <khoá>       in câu lệnh đã ghép đủ thông số (như nút "Sao chép câu lệnh" của trang)
     keys                liệt kê khoá câu lệnh
     apply-map <file>    đọc câu trả lời bản đồ chất liệu (DÒNG n | …) vào state.map, ghi lại state.json
     apply-ws <file>     đọc câu trả lời soạn đề Viết, Nói (khối code) vào state.ws, ghi lại state.json
     frame-map           điền bản đồ chất liệu từ khung câu hỏi trong slots.notes, ghi lại state.json
   state.json: {"spec":"R2","level":"B2","floor":"0","spelling":"Anh–Anh","paras":"5","l1slot":"1",
                "specs":{…đặc tả riêng: spec, qbp, rstems…} hoặc "specsFile":"đường dẫn",
                "slots":{"topic","usedTopics","src","draft","notes","keep","questions","facts",…},
                "fields":{"pc-src","pc-url","pc-lic",…}, "ws":{…}, "map":{"rows":{}}, "gates":{}} */
(function(){
  var argv = process.argv.slice(2), file = argv[0], cmd = argv[1] || "check";
  if(!file){ console.error("Cách dùng: node vstep_check.js state.json [check|prompt <khoá>|keys|apply-map <file>|apply-ws <file>|frame-map]"); process.exit(2); }
  var st = JSON.parse(__fs.readFileSync(file, "utf8"));
  var specs = st.specs || (st.specsFile ? JSON.parse(__fs.readFileSync(st.specsFile, "utf8")) : null);
  if(specs) specsApply(specs, true);
  if(!SPEC[st.spec]){ console.error("Phần thi không có: " + st.spec + ". Dùng một trong: " + Object.keys(SPEC).join(", ")); process.exit(2); }
  S.spec = st.spec;
  var LB = typeof LEVEL_BY_SPEC !== "undefined" ? LEVEL_BY_SPEC[st.spec] : null;
  S.level = st.level || (LB && LB.level) || S.level; S.floor = (LB && LB.floor) || "0";
  ["floor","spelling","paras","l1slot","srcLang","srcMode"].forEach(function(k){ if(st[k] !== undefined) S[k] = String(st[k]); });
  S.slots = Object.assign({}, st.slots || {}); S.fields = Object.assign({}, st.fields || {}); S.gates = Object.assign({}, st.gates || {});
  S.ws = Object.assign({}, st.ws || {}); S.map = st.map ? JSON.parse(JSON.stringify(st.map)) : {rows:{}}; S.notes = st.notes || []; S.qman = st.qman || {};
  S.wf = null; S.lib = null;
  lastAnalysis = null; lastVocab = null; lastFre = null; try{ lastOverlap = null; }catch(e){}
  var isWS = typeof wsOn === "function" && wsOn(), sk = SPEC[S.spec].skill;
  // một số phép đo của trang ghi kết quả ra giao diện: chạy với phần tử giả để lấy số
  function withDom(fn){ var g = document.getElementById, q = document.querySelector; document.getElementById = function(){ return __el(); }; document.querySelector = function(){ return __el(); }; try{ fn(); }catch(e){} document.getElementById = g; document.querySelector = q; }
  if(!isWS && (S.slots.draft || "").trim()) withDom(function(){ runOverlap(); });
  try{ if(isWS) wsSync(); }catch(e){}
  function save(){ st.map = S.map; st.ws = S.ws; st.slots = S.slots; __fs.writeFileSync(file, JSON.stringify(st, null, 1)); }
  function out(o){ process.stdout.write(typeof o === "string" ? o + "\n" : JSON.stringify(o, null, 1) + "\n"); }
  function promptKeys(){
    var ks = Object.keys(P).filter(function(k){ return P[k] && P[k].t; }).map(function(k){ return {key:k, title:P[k].title}; });
    if(isWS) ks = ks.concat([{key:"ws-topic", title:"Gợi ý chủ đề Viết, Nói"}, {key:"ws-src", title:"Tìm nguồn Viết Task 2"}, {key:"ws-draft", title:"Soạn nháp đề Viết, Nói"}, {key:"ws-fit", title:"Kiểm khớp nguồn Viết Task 2"}]);
    return ks;
  }
  if(cmd === "keys"){ out(promptKeys()); return; }
  if(cmd === "prompt"){
    var k = argv[2];
    if(k === "ws-topic") return out(wsTopicPrompt());
    if(k === "ws-src") return out(wsSrcPrompt());
    if(k === "ws-draft") return out(wsPrompt());
    if(k === "ws-fit") return out(wsFitPrompt());
    if(!P[k]){ console.error("Không có khoá " + k + ". Xem: keys"); process.exit(2); }
    var v = V(); var miss = missing(P[k]);
    if(miss.length) console.error("Thiếu: " + miss.join("; "));
    return out(assemble(P[k], v));
  }
  if(cmd === "apply-map"){ var n = mapParseAI(__fs.readFileSync(argv[2], "utf8")); save(); return out({filled:n}); }
  if(cmd === "apply-ws"){ var r = wsParse(__fs.readFileSync(argv[2], "utf8")); try{ wsSync(); }catch(e){} save(); return out({filled:r}); }
  if(cmd === "frame-map"){ var n2 = mapFromAnchors(); save(); return out({filled:n2}); }

  // ---- check ----
  var rep = {spec:S.spec, label:SPEC[S.spec].label, level:S.level, specsLoaded:!!(typeof SPECS !== "undefined" && SPECS.loaded)};
  function rows(sc){
    var ev = clEval(sc);
    return clRows(sc).map(function(r){ var e = ev[r.c] || {}; return {code:r.c, who:r.who, tier:r.tier, text:r.t, src:r.src, status:e.s || "na", detail:(e.d || "").replace(/<[^>]+>/g, "")}; }).filter(function(x){ return x.status !== "na"; });
  }
  try{
    if(isWS){
      rep.task = wsText();
      rep.checklist = {WS:rows("WS")};
      try{ rep.copied = typeof wsCopied === "function" ? wsCopied() : null; }catch(e){}
    } else {
      var d = S.slots.draft || "";
      if(d.trim()){
        var m = metricsOf(d), E = evalChecks();
        rep.metrics = {words:m.words, paras:m.paras, longSentences:m.longN, coverage:m.cov, levelAt96:LVL[m.lvlIn] || "trên C2", flesch:m.fre,
          wordsOK:m.inRange, coverageOK:m.covOK, notTooEasyOK:m.floorOK, fleschOK:m.freOK, parasOK:m.parasOK};
        rep.checks = E ? E.C : null;
        var allOk = E && Object.keys(E.C).every(function(k){ return !E.C[k] || E.C[k].ok !== false; });
        if(!allOk){ try{ rep.fixPrompt = assemble(P.fixall, V()); }catch(e){ rep.fixPromptError = String(e); } }
      }
      rep.frame = parseFrame(S.slots.notes || "");
      if(mapLines().length){
        var ME = mapEval(), O = mapOrder(ME);
        rep.map = {rows:ME.res.map(function(x, i){ return {line:i+1, slot:x.l.lv + " " + x.l.m, codes:x.l.codes, code:x.code, para:x.para || null, testQ:O.num[i] || null, status:x.s, notes:x.msgs}; }),
          global:ME.glob, order:mapText(), full:mapStatus().full};
      } else rep.map = {note:qbpWhy()};
      if((S.slots.questions || "").trim()){
        var R = checkQ();
        if(R){ rep.questions = {global:R.global, items:R.items.map(function(x){ return {n:x.it.n, slot:(x.it.lv||"") + " " + (x.it.mức||""), code:x.it.code, answer:x.it.ans, problems:x.probs, warnings:x.warns}; })}; }
      }
      rep.checklist = {NL:rows("NL")};
      if((S.slots.questions || "").trim()) rep.checklist.CH = rows("CH");
    }
  }catch(e){ rep.error = String(e && e.stack || e); }
  var cl = rep.checklist || {}, all = [].concat(cl.NL || [], cl.CH || [], cl.WS || []);
  rep.summary = {fail:all.filter(function(r){ return r.status === "fail"; }).map(function(r){ return r.code; }),
    warn:all.filter(function(r){ return r.status === "warn"; }).map(function(r){ return r.code; }),
    needJudgement:all.filter(function(r){ return r.status === "todo" || r.status === "h"; }).map(function(r){ return r.code; })};
  out(rep);
})();
