
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
  var notes = slotVal("notes")||"", al = notes.split("\n").filter(function(l){ return ANCHOR_RE.test(l.replace(/\*\*/g,"")); });
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
