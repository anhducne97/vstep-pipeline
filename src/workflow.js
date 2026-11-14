
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
  var w = wfData(), st = w.st || "", me = wfMe();
  if(!wfModeActive()) return {g:0};
  if(st === "Chờ thẩm định ngữ liệu" || (w.req && w.req.st === "chờ duyệt")) return {g:2, title:w.req && w.req.st === "chờ duyệt" ? "Cổng 2 · Duyệt phần sửa ngữ liệu" : "Cổng 2 · Thẩm định ngữ liệu", mine:wfCan("tdnl") && (wfDevOn() || w.as.nl !== me)};
  if(st === "Chờ thẩm định câu hỏi") return {g:3, title:"Cổng 3 · Thẩm định câu hỏi", mine:wfCan("tdch") && (wfDevOn() || w.as.ch !== me)};
  return {g:0};
}
function rvActsHTML(ids, roles){
  var w = wfData(), out = [];
  WF_T.forEach(function(t, i){ if(ids.indexOf(t.id) >= 0 && wfApplies(t) && t.from.indexOf(w.st || "") >= 0) out.push({A:wfAvail(t), i:i, r:false}); });
  WF_R.forEach(function(t, i){ if(ids.indexOf(t.id) >= 0 && t.when(w)) out.push({A:wfAvail(t), i:i, r:true}); });
  out = out.filter(function(x){ return wfDevOn() ? wfDevRole() === x.A.t.role : (x.A.t.role === "coord" ? wfIsCoordUser() : wfCan(x.A.t.role)); });
  return out.map(function(x){ return wfActHTML(x.A, x.r, x.i); }).join("");
}
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
  if(key !== RV.key){ RV.key = key; if(R.g && R.mine && window.innerWidth >= 900) RV.open = true; var rb = d.querySelector(".rvbody"); if(rb) rb.scrollTop = 0; }
  if(!R.g) RV.open = false;
  var fh = R.g ? '<span aria-hidden="true">📋</span> Phiếu duyệt <span class="rvsub">· Cổng ' + R.g + '</span>' + (R.mine ? ' <span class="rvchip">Đến lượt bạn</span>' : '') : "";
  if(f.getAttribute("data-h") !== fh){ f.innerHTML = fh; f.setAttribute("data-h", fh); }
  f.classList.toggle("hidden", !R.g); f.classList.toggle("mine", !!R.mine);
  f.setAttribute("aria-expanded", RV.open ? "true" : "false");
  d.classList.toggle("hidden", !RV.open);
  document.body.classList.toggle("rvopen", !!RV.open);
  var tt = document.getElementById("rv-title"); if(tt && tt.textContent !== (R.title || "")) tt.textContent = R.title || "";
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
