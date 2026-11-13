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
    {k:"from", label:"Đoạn trích lấy từ đâu (sau \"Read the following extract from\")", type:"text", ph:"an article about online learning"},
    {k:"srcText", label:"Văn bản nguồn (để AI rút đoạn trích; không in vào đề)", type:"area", rows:5, optional:true, hint:"Dán bài gốc nếu muốn AI viết đoạn trích dựa trên nguồn thật."},
    {k:"ext", label:"Đoạn trích (extract)", type:"area", rows:6, words:true},
    {k:"adapted", label:"Adapted from (trích nguồn)", type:"text", hint:"VNCETA yêu cầu trích nguồn đoạn trích của Task 2.", ph:"tên bài, tác giả hoặc nơi đăng, năm"},
    {k:"url", label:"Link nguồn", type:"text", optional:true, ph:"https://…"},
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
function wsHasContent(){ return (WS_F[S.spec] || []).some(function(f){ return f.k !== "theme" && f.k !== "form" && wsV(f.k); }); }
function wsSync(){
  if(!wsOn()) return;
  S.slots = S.slots || {};
  S.slots.topic = wsV("theme");
  var t = wsHasContent() ? wsText() : "";
  if(S.slots.draft !== t){ S.slots.draft = t; S.slots.approved = t; }
}

/* ---------- checklist WS (dùng chung khung checklist có mã) ---------- */
function wsMiss(){ return (WS_F[S.spec] || []).filter(function(f){ return !f.optional && f.k !== "srcText" && f.k !== "theme" && !wsV(f.k); }).map(function(f){ return f.label.replace(/\s*\(.*$/, ""); }); }
function wsNoContent(){ return wsHasContent() ? null : {s:"na", d:"Chưa có đề."}; }
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
  {c:"WS-B1", g:"B", sp:["W1"], t:"Thư hoặc email cho sẵn dài 80–90 từ (chỉ tính phần extract)", src:"Ghi chép tập huấn, phần Viết Task 1", tier:"dx", who:"M", ev:function(){
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
    return a ? {s:"ok", d:"Adapted from " + a + (wsV("url") ? " · " + wsV("url") : "") + ". Đoạn trích " + wc(wsV("ext")) + " từ (không có quy định số từ)."} : {s:"fail", d:"Chưa ghi nguồn của đoạn trích."};
  }},
  {c:"WS-B8", g:"B", sp:["W2"], t:"Yêu cầu viết bắt đầu bằng \"Write an essay …\"", src:"Biểu mẫu đề hoàn chỉnh và đề mẫu QĐ 730", tier:"spec", who:"M", ev:function(){
    var t = wsV("req"); if(!t) return {s:"na", d:"Chưa có yêu cầu."};
    return /^(now,\s*)?write an essay\b/i.test(t) ? {s:"ok", d:"Đúng khuôn."} : {s:"fail", d:"Yêu cầu đang bắt đầu bằng \"" + t.split(/\s+/).slice(0, 4).join(" ") + "…\"."};
  }},
  {c:"WS-B9", g:"B", sp:["W2"], t:"Chủ đề không đòi kiến thức chuyên môn sâu; đoạn trích cho bối cảnh và dẫn tới vấn đề cần bàn, không cho sẵn quá nhiều ý để thí sinh chép, không có nhiều cụm học thuật hay chuyên ngành vượt bậc 3", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B10", g:"B", sp:["W2"], t:"Yêu cầu nêu rõ nhiệm vụ lập luận (trình bày quan điểm, đánh giá, thảo luận ưu nhược); đủ mở để phát triển các lập luận khác nhau; không mơ hồ, không giả định (A is harmful), không định hướng thí sinh đồng tình với một quan điểm", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
  {c:"WS-B11", g:"B", sp:["W2"], t:"Phạm vi vấn đề vừa với bài tối thiểu 250 từ trong 40 phút", src:"Ghi chép tập huấn, phần Viết Task 2", tier:"dx", who:"H", dep:"text"},
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
    "- EXTRACT: đoạn trích ngắn, ngôn ngữ bậc 3, cho bối cảnh và dẫn tới vấn đề cần bàn; không cho sẵn quá nhiều ý để thí sinh chép; không có cụm học thuật, chuyên ngành vượt bậc 3." + (wsV("srcText") ? " Viết đoạn trích dựa trên VĂN BẢN NGUỒN bên dưới (chỉ lấy ý, viết lại bằng lời mới)." : ""),
    "- FROM: nơi lấy đoạn trích, viết tiếp sau \"Read the following extract from\" (ví dụ \"an article about online learning\").",
    "- ADAPTED FROM: nguồn thật của đoạn trích (tên bài, tác giả hoặc nơi đăng, năm)." + (wsV("srcText") ? "" : " Nếu không có nguồn thật, ghi \"CẦN BỔ SUNG\"."),
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
    var k = f.k, v = wsV(k); if(!v || k === "theme" || k === "form" || k === "srcText" || k === "url") return;
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
function wsRenderForm(){
  var box = document.getElementById("ws-form"); if(!box) return;
  if(!wsOn()){ box.innerHTML = ""; return; }
  var sp = SPEC[S.spec], F = WS_F[S.spec];
  box.innerHTML = '<div class="info small"><b>' + esc(sp.label) + ':</b> ' + esc(sp.genre) + '. ' + esc(sp.qd) + '.</div>'
    + '<div class="card act"><div class="n">1</div><div class="actbody"><h3 class="acttitle">Soạn nháp bằng AI (không bắt buộc)</h3>'
    + wsFieldHTML(F[0]) + (S.spec === "W2" ? wsFieldHTML(F.filter(function(f){ return f.k === "srcText"; })[0]) : "")
    + '<p class="small muted">Câu lệnh nhờ AI viết một đề mới theo đặc tả. Mỗi lần dán câu lệnh, mở một cuộc trò chuyện mới. Nhóm không đưa đề chưa công bố lên AI thì bỏ qua bước này và soạn thẳng ở mục 2.</p>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" type="button" id="ws-copy">Sao chép câu lệnh</button></div>'
    + '<label class="field"><span class="lab">Dán câu trả lời của AI</span><span class="hint">Bấm nút Copy ở góc khối code của AI rồi dán vào đây; trang tự điền các ô ở mục 2.</span><textarea id="ws-paste" rows="4" placeholder="THEME: …"></textarea></label>'
    + '<div><button class="btn" type="button" id="ws-fill">Điền vào các ô</button> <span class="small muted" id="ws-fillmsg"></span></div></div></div>'
    + '<div class="card act"><div class="n">2</div><div class="actbody"><h3 class="acttitle">Các phần của đề</h3><div class="wsgrid"><div>'
    + F.filter(function(f){ return f.k !== "theme" && f.k !== "srcText"; }).map(wsFieldHTML).join("")
    + '</div><div><div class="small muted">Đề như khi in</div><div id="ws-preview">' + wsPreviewHTML() + '</div></div></div></div></div>'
    + '<div class="card act"><div class="n">3</div><div class="actbody"><h3 class="acttitle">Tự kiểm theo checklist</h3><p class="small muted">Cùng các tiêu chí người thẩm định dùng ở bước Kiểm và xuất. Sửa hết dòng đỏ rồi mới gửi thẩm định.</p><div id="ws-self">' + wsSelfHTML() + '</div></div></div>';
}
var wsT = null;
function wsAfterEdit(full){
  wsSync(); save();
  var pv = document.getElementById("ws-preview"); if(pv) pv.innerHTML = wsPreviewHTML();
  document.querySelectorAll("[data-wswc]").forEach(function(el){ var v = wsV(el.getAttribute("data-wswc")); el.textContent = v ? wc(v) + " từ" : ""; });
  clearTimeout(wsT); wsT = setTimeout(function(){ try{ wsRenderSelf(); }catch(e){} try{ clRender(); }catch(e){} try{ renderChip(); }catch(e){} updateStepper(); }, full ? 0 : 400);
}
function bindWs(){
  document.addEventListener("input", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-ws"); if(!k || !wsOn()) return;
    wsData()[k] = e.target.value; wsAfterEdit(false);
  });
  document.addEventListener("change", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-ws"); if(!k || !wsOn()) return;
    wsData()[k] = e.target.value; wsAfterEdit(true);
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
    var t = e.target.closest && e.target.closest("#ws-copy, #ws-fill, [data-wsdocx]"); if(!t) return;
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
