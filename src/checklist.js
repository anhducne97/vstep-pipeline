
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
  return '<div class="clform" data-clform="' + sc + '"><div class="grid2">'
    + '<label class="small">Mã tiêu chí<select data-ff="code">' + codes.map(function(c){ var r = clRows(sc).filter(function(x){ return x.c===c; })[0]; return '<option value="' + c + '"' + (c===f.code ? " selected" : "") + '>' + c + (r ? " · " + esc(r.t.slice(0,60)) : " · chưa có mã phù hợp") + '</option>'; }).join("") + '</select></label>'
    + '<label class="small">Mức<select data-ff="sev"><option' + (f.sev==="PHẢI SỬA" ? " selected" : "") + '>PHẢI SỬA</option><option' + (f.sev==="GỢI Ý" ? " selected" : "") + '>GỢI Ý</option></select></label></div>'
    + CL_FIELDS.map(function(x){ var ph = {loc:sc==="NL" ? "đoạn 3, câu 2" : "câu 4, phương án C", quote:"chép nguyên văn chỗ có lỗi (tiếng Anh)", issue:"sự kiện kiểm được, ví dụ: câu 31 từ, có hai mệnh đề quan hệ", target:"ví dụ: dưới 25 từ; Flesch ≥ 60", suggest:"không bắt buộc", range:sc==="NL" ? "chỉ đoạn 3" : "chỉ câu 4", keep:"ví dụ: giữ \"insulation\" (từ để hỏi VO)"}[x[0]];
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
