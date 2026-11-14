/* =====================================================================
   THÔNG BÁO: chuông ở trang Nhóm và đầu trang soạn bài.
   notifs/{id} = {to, type, text, note, link, by, byName, at, read}
   Người làm việc gửi thông báo cho người liên quan ngay khi làm (mời vào dự án,
   giao việc, đến lượt, trả sửa, hoàn thiện, bình luận, câu trả lời hay).
   link = {kind:"prj", prj, tab} | {kind:"item", item, prj} | {kind:"thread", thread, comment}
   Firestore bản lite không nghe thay đổi: trang hỏi lại mỗi phút và khi mở trang Nhóm.
   ===================================================================== */
var NTF = {list:null, open:false, timer:null};
var NTF_ICON = {invite:"📨", assign:"🧩", turn:"⏳", back:"↩️", done:"🎉", stop:"⛔", comment:"💬", best:"✅", req:"🛠", post:"📝"};
function ntfMe(){ return typeof libEmail === "function" ? libEmail() : ""; }
function ntfReady(){ return typeof hubSigned === "function" && hubSigned() && LIB.fb && LIB.db; }
function ntfUnread(){ return (NTF.list || []).filter(function(n){ return !n.read; }).length; }
function ntfLoad(){
  if(!ntfReady()) return Promise.resolve();
  var fb = LIB.fb, me = ntfMe();
  return fb.getDocs(fb.query(fb.collection(LIB.db, "notifs"), fb.where("to", "==", me))).then(function(s){
    var all = s.docs.map(function(d){ var x = d.data(); x.id = d.id; return x; }).sort(function(a, b){ return (b.at || 0) - (a.at || 0); });
    // dọn: thông báo đã đọc quá 30 ngày, và phần dư quá 150 cái
    var old = all.filter(function(n, i){ return (n.read && Date.now() - (n.at || 0) > 30 * 864e5) || i >= 150; });
    old.forEach(function(n){ fb.deleteDoc(fb.doc(LIB.db, "notifs", n.id)).catch(function(){}); });
    NTF.list = all.filter(function(n){ return old.indexOf(n) < 0; });
    hubBadge(); if(HUB.open) hubRender();
  }).catch(function(){ if(!NTF.list) NTF.list = []; });
}
function ntfStart(){ if(NTF.timer) return; NTF.timer = setInterval(function(){ if(ntfReady() && !document.hidden) ntfLoad(); }, 60000); }
// gửi: bỏ người nhận là chính mình, email sai dạng, trùng nhau
function ntfSend(items){
  if(!ntfReady() || (typeof wfDevOn === "function" && wfDevOn())) return Promise.resolve();
  var fb = LIB.fb, me = ntfMe(), seen = {}, now = Date.now();
  var xs = (items || []).filter(function(n){ if(!n || !n.to || n.to === me || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(n.to)) return false; var k = n.to + "|" + n.text; if(seen[k]) return false; seen[k] = 1; return true; });
  return Promise.all(xs.map(function(n){
    var rec = {to:n.to, type:n.type || "turn", text:String(n.text || "").slice(0, 300), note:String(n.note || "").slice(0, 300), link:n.link || null, by:me, byName:peopleName(me), at:now, read:false};
    // có key (bình luận trong một chủ đề): ghi đè một thông báo duy nhất cho mỗi người nhận, không dồn hàng chục cái
    var ref = n.key ? fb.doc(LIB.db, "notifs", "k" + qHash(n.to + "|" + n.key)) : fb.doc(fb.collection(LIB.db, "notifs"));
    return fb.setDoc(ref, rec).catch(function(){});
  }));
}
function ntfMark(ids){
  var fb = LIB.fb; (NTF.list || []).forEach(function(n){ if(ids.indexOf(n.id) >= 0) n.read = true; });
  ids.forEach(function(id){ fb.updateDoc(fb.doc(LIB.db, "notifs", id), {read:true}).catch(function(){}); });
  hubBadge(); hubRender();
}
// bấm thông báo: đánh dấu đã đọc rồi đi đến đúng chỗ
function ntfGo(n){
  NTF.open = false; if(!n.read) ntfMark([n.id]);
  var l = n.link || {};
  if(l.kind === "prj"){
    var goPrj = function(){ PRJ.cur = l.prj; PRJ.tab = l.tab || "tien-do"; PRJ.sel = {}; PRJ.msg = ""; HUB.page = prjById(l.prj) ? "duan-ct" : "duan"; if(!HUB.open) hubOpen(HUB.page); else hubRender(); var el = hubEl(); if(el) el.scrollTop = 0; };
    if(prjById(l.prj)) goPrj(); else prjReload().then(goPrj);
    return;
  }
  if(l.kind === "item"){
    var goItem = function(){ if(LIB.items.some(function(x){ return x.id === l.item; })) prjOpenItem(l.item); else { HUB.err = "Không mở được bài này: bài đã bị xoá hoặc bạn không còn trong dự án."; hubRender(); } };
    if(!HUB.open) hubOpen("viec");
    if(LIB.items.some(function(x){ return x.id === l.item; })) goItem(); else prjReload().then(goItem);
    return;
  }
  if(l.kind === "thread"){
    FORUM.focus = l.comment || "";
    var goT = function(){ if((FORUM.list || []).some(function(t){ return t.id === l.thread; })) frOpen(l.thread); else { HUB.page = "dd"; HUB.err = "Chủ đề này đã bị xoá."; hubRender(); } };
    if(!HUB.open) hubOpen("dd"); else { HUB.page = "dd"; hubRender(); }
    if((FORUM.list || []).some(function(t){ return t.id === l.thread; })) goT(); else frLoad().then(goT);
    return;
  }
  hubRender();
}
function ntfBellHTML(){
  var n = ntfUnread();
  return '<div class="ntfwrap"><button type="button" class="hubbell' + (NTF.open ? " on" : "") + '" id="ntf-bell" aria-label="Thông báo' + (n ? ", " + n + " chưa đọc" : "") + '" aria-expanded="' + (NTF.open ? "true" : "false") + '">🔔' + (n ? '<span class="hubbadge">' + (n > 99 ? "99+" : n) + '</span>' : '') + '</button>' + (NTF.open ? ntfPanelHTML() : '') + '</div>';
}
function ntfPanelHTML(){
  var xs = NTF.list, n = ntfUnread();
  var h = '<div class="ntfpanel" role="dialog" aria-label="Thông báo"><div class="ntfhead"><b>Thông báo</b>' + (n ? '<button type="button" class="btn quiet sm" id="ntf-all">Đánh dấu đã đọc hết</button>' : '') + '</div>';
  if(!xs) return h + '<div class="ntfempty">Đang tải…</div></div>';
  if(!xs.length) return h + '<div class="ntfempty">Chưa có thông báo nào. Khi được mời, giao việc hay có người trả lời, thông báo sẽ hiện ở đây 🔔</div></div>';
  return h + '<div class="ntflist">' + xs.slice(0, 60).map(function(x){
    return '<button type="button" class="ntfitem' + (x.read ? "" : " unread") + '" data-ntf="' + esc(x.id) + '"><span class="ntfic">' + (NTF_ICON[x.type] || "🔔") + '</span><span class="ntfbody"><span class="ntftext">' + esc(x.text) + '</span>' + (x.note ? '<span class="ntfnote">“' + esc(x.note) + '”</span>' : '') + '<span class="ntftime">' + esc(frAgo(x.at)) + '</span></span>' + (x.read ? '' : '<span class="ntfdot" aria-label="chưa đọc"></span>') + '</button>';
  }).join("") + '</div></div>';
}

/* ---- các lúc gửi thông báo ---- */
function ntfItemTitle(){ return (S.lib && S.lib.title) || (typeof libTitleDefault === "function" ? libTitleDefault() : "bài"); }
// sau mỗi bước quy trình: báo người phải làm tiếp hoặc người bị ảnh hưởng
var NTF_WF = {
  propose:[["coord"], "đề xuất chủ đề bài {t}: chờ bạn duyệt cổng 1", "turn"],
  g1ok:[["nl"], "đã duyệt chủ đề bài {t}: bạn soạn tiếp ngữ liệu", "turn"],
  g1no:[["nl"], "chưa duyệt chủ đề bài {t}, cần thay bài", "stop"],
  g1fix:[["nl"], "yêu cầu sửa đề xuất bài {t}", "back"],
  nlsub:[["tdnl"], "gửi bài {t}: chờ bạn thẩm định ngữ liệu", "turn"],
  nlwd:[["tdnl"], "rút bài {t} lại để sửa tiếp", "back"],
  g2ok:[["ch"], "đã duyệt và khoá ngữ liệu bài {t}: đến lượt bạn soạn câu hỏi", "turn", ["nl"], "đã duyệt ngữ liệu bài {t} của bạn", "done"],
  g2back:[["nl"], "trả sửa ngữ liệu bài {t}", "back"], g2backc:[["nl"], "trả sửa ngữ liệu bài {t} thêm một lần", "back"],
  g2no:[["nl","ch"], "chuyển bài {t} sang Thay bài / Loại", "stop"], g2noc:[["nl","ch"], "chuyển bài {t} sang Thay bài / Loại", "stop"],
  g2undo:[["nl","ch"], "mở lại cổng 2 của bài {t}", "back"], g2undoc:[["nl","tdnl","ch"], "mở lại cổng 2, thẩm định lại toàn bài {t}", "back"],
  chsub:[["tdch"], "gửi bộ câu hỏi bài {t}: chờ bạn thẩm định", "turn"],
  chwd:[["tdch"], "rút bộ câu hỏi bài {t} lại để sửa tiếp", "back"],
  g3ok:[["coord"], "đã duyệt câu hỏi bài {t}: chờ bạn duyệt hoàn thiện (cổng 4)", "turn", ["ch"], "đã duyệt bộ câu hỏi bài {t} của bạn", "done"],
  g3back:[["ch"], "trả sửa câu hỏi bài {t}", "back"], g3backc:[["ch"], "trả sửa câu hỏi bài {t} thêm một lần", "back"],
  g3undo:[["ch"], "mở lại cổng 3 của bài {t}", "back"], g4back:[["ch","tdch"], "trả câu hỏi bài {t} về sửa", "back"],
  g4:[["nl","tdnl","ch","tdch"], "duyệt hoàn thiện bài {t} 🎉", "done"],
  reopen:[["nl","tdnl","ch","tdch"], "mở lại bài {t} đã hoàn thiện", "back"],
  restore:[["nl"], "khôi phục bài {t}", "turn"],
  rq:[["nl"], "yêu cầu sửa ngữ liệu bài {t}", "req", ["tdnl"], "yêu cầu sửa ngữ liệu bài {t} (bạn sẽ duyệt phần sửa)", "req"],
  rqsend:[["tdnl"], "gửi phần sửa ngữ liệu bài {t}: chờ bạn duyệt", "turn"],
  rqok:[["ch","nl"], "duyệt phần sửa ngữ liệu bài {t}, khoá bản mới", "turn"],
  rqback:[["nl"], "trả lại phần sửa ngữ liệu bài {t}", "back"],
  rqfull:[["nl","ch"], "chuyển bài {t} về thẩm định lại toàn bài vì phần sửa lớn", "back"],
  rqcancel:[["nl","tdnl"], "huỷ yêu cầu sửa ngữ liệu bài {t}", "req"],
  // Viết, Nói: không có phần câu hỏi; duyệt đề xong thì đến lượt Điều phối duyệt hoàn thiện
  g2okws:[["coord"], "đã duyệt và khoá đề {t}: chờ bạn duyệt hoàn thiện", "turn", ["nl"], "đã duyệt đề {t} của bạn", "done"],
  g4ws:[["nl","tdnl"], "duyệt hoàn thiện đề {t} 🎉", "done"]
};
function ntfWorkflow(t, note){
  var key = t.id === "g2ok" && typeof wfIsWS === "function" && wfIsWS() ? "g2okws" : t.id;
  var m = NTF_WF[key]; if(!m || !S.lib || !S.lib.id) return;
  var w = wfData(), me = ntfMe(), title = ntfItemTitle(), out = [], told = [], miss = [], selfNext = [];
  var who = function(r){ return r === "coord" ? (w.as.coord || "") : (w.as[r] || ""); };
  var link = {kind:"item", item:S.lib.id, prj:(S.prj && S.prj.id) || ""};
  var g1 = t.id === "nlsub" && w.g1self ? " (cổng 1 do Điều phối tự duyệt: xét kỹ chủ đề, nguồn, giấy phép)" : "";
  for(var i = 0; i + 2 < m.length; i += 3) m[i].forEach(function(r){
    var to = who(r), type = m[i + 2];
    if(type === "turn" && r !== "coord"){ if(!to) miss.push(r); else if(to !== me) told.push(peopleName(to) + " (" + WF_ROLES[r] + ")"); else selfNext.push(WF_ROLES[r]); }
    if(type === "turn" && r === "coord" && to && to !== me) told.push(peopleName(to) + " (Điều phối)");
    out.push({to:to, type:type, text:peopleName(me) + " " + m[i + 1].replace("{t}", title) + (r === "tdnl" ? g1 : ""), note:note, link:link});
  });
  // bước kế chưa giao người: báo Điều phối để giao, không để thông báo rơi mất
  var co = w.as.coord || "";
  if(miss.length && co && co !== me) out.push({to:co, type:"assign", text:peopleName(me) + " " + m[1].replace("{t}", title).replace(/: .*$/, "") + ". Phần " + miss.map(function(r){ return WF_ROLES[r]; }).join(", ") + " chưa giao người: cần giao để làm tiếp.", note:note, link:link});
  ntfSend(out);
  if(typeof toast === "function" && !(typeof wfDevOn === "function" && wfDevOn())){
    var msg = told.length ? "Đã báo " + told.join(", ") + "." : "";
    if(selfNext.length) msg += (msg ? " " : "") + "Bước kế cũng là việc của bạn (kiêm " + selfNext.join(", ") + ").";
    if(miss.length) msg += (msg ? " " : "") + "Chưa giao " + miss.map(function(r){ return WF_ROLES[r]; }).join(", ") + (co && co !== me ? ": đã báo Điều phối để giao người." : ": vào Phân công để giao người.");
    if(msg) setTimeout(function(){ toast(msg); }, 400);
  }
}
// giao việc từ thanh Quy trình của một bài
function ntfAssignOne(role, email){
  if(!email || !S.lib || !S.lib.id) return;
  ntfSend([{to:email, type:"assign", text:peopleName(ntfMe()) + " giao bạn vai " + WF_ROLES[role] + " · bài " + ntfItemTitle(), link:{kind:"item", item:S.lib.id, prj:(S.prj && S.prj.id) || ""}}]);
}
// giao việc từ bảng phân công: mỗi người một thông báo, gộp các bài
function ntfAssignBatch(p, changes){
  var by = {};
  changes.forEach(function(c){ (by[c.to] = by[c.to] || []).push(c); });
  var me = peopleName(ntfMe());
  ntfSend(Object.keys(by).map(function(to){
    var cs = by[to];
    var hd = function(c){ return c.due ? " (xong trước " + prjFmt(c.due) + ")" : ""; };
    var onlyDue = cs.every(function(c){ return c.redue; });
    if(cs.length === 1) return {to:to, type:"assign", text:me + (cs[0].redue ? " đổi hạn vai " : " giao bạn vai ") + WF_ROLES[cs[0].role] + " · bài " + prjLabel(cs[0].x) + hd(cs[0]) + " · dự án " + p.name, link:{kind:"item", item:cs[0].x.id, prj:p.id}};
    var list = cs.slice(0, 3).map(function(c){ return PRJ_SHORT[c.role] + " " + prjLabel(c.x) + hd(c); }).join("; ");
    return {to:to, type:"assign", text:me + (onlyDue ? " đổi hạn " : " giao bạn ") + cs.length + " việc trong dự án " + p.name + ": " + list + (cs.length > 3 ? "…" : ""), link:{kind:"prj", prj:p.id, tab:"viec"}};
  }));
}
function ntfInvite(p, emails){
  var me = peopleName(ntfMe());
  ntfSend(emails.map(function(e){ return {to:e, type:"invite", text:me + " mời bạn vào dự án " + p.name + (p.due ? " (hạn " + prjFmt(p.due) + ")" : ""), link:{kind:"prj", prj:p.id, tab:"viec"}}; }));
}
function ntfComment(t, c, prevComments){
  var me = ntfMe(), name = peopleName(me), out = [{to:t.author, key:"cmt|" + t.id, type:"comment", text:name + " bình luận trong chủ đề của bạn: " + t.title, note:c.body.slice(0, 140), link:{kind:"thread", thread:t.id, comment:c.id}}];
  (prevComments || []).forEach(function(k){ if(k.author !== t.author) out.push({to:k.author, key:"cmt|" + t.id, type:"comment", text:name + " cũng bình luận trong chủ đề: " + t.title, note:c.body.slice(0, 140), link:{kind:"thread", thread:t.id, comment:c.id}}); });
  ntfSend(out);
}
function ntfBest(t, c){ if(c) ntfSend([{to:c.author, type:"best", text:peopleName(ntfMe()) + " chọn bình luận của bạn là câu trả lời hay: " + t.title, link:{kind:"thread", thread:t.id, comment:c.id}}]); }
function ntfPost(t){ if(!t.prj) return; ntfSend((t.team || []).map(function(e){ return {to:e, type:"post", text:peopleName(ntfMe()) + " đăng chủ đề mới trong dự án " + prjName(t.prj) + ": " + t.title, link:{kind:"thread", thread:t.id}}; })); }

function bindNtf(){
  var el = hubEl(); if(!el) return;
  el.addEventListener("click", function(e){
    var t = e.target.closest ? e.target.closest("button") : null;
    if(!t){ if(NTF.open && !e.target.closest(".ntfwrap")){ NTF.open = false; hubRender(); } return; }
    if(t.id === "ntf-bell"){ NTF.open = !NTF.open; hubRender(); if(NTF.open) ntfLoad(); return; }
    if(t.id === "ntf-all"){ ntfMark((NTF.list || []).filter(function(n){ return !n.read; }).map(function(n){ return n.id; })); return; }
    if(t.hasAttribute("data-ntf")){ var n = (NTF.list || []).filter(function(x){ return x.id === t.getAttribute("data-ntf"); })[0]; if(n) ntfGo(n); return; }
    if(NTF.open && !t.closest(".ntfwrap")){ NTF.open = false; }
  }, true);
  document.addEventListener("click", function(e){ var b = e.target.closest ? e.target.closest("#ntfbtn") : null; if(!b) return; if(typeof libToggle === "function") libToggle(false); NTF.open = true; hubOpen(HUB.page || "viec"); ntfLoad(); });
  window.addEventListener("keydown", function(e){ if(e.key === "Escape" && NTF.open){ NTF.open = false; hubRender(); } });
  ntfStart();
}
