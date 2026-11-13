/* =====================================================================
   DỰ ÁN: một đợt soạn đề gồm nhiều bộ đề, có Điều phối riêng (người tạo),
   thành viên được mời, khung bài tạo sẵn cho từng bộ đề, bảng phân công
   nhiều bài cùng lúc, bảng tiến độ cho Điều phối và "Việc của tôi".
   Dữ liệu: projects/{id} = {name, owner, ownerName, members[], sets[], due, note}
   Bài thuộc dự án: materials/{id}.prj = id dự án; materials/{id}.asg =
   {as, at, by, due} là phân công mới nhất (bảng dự án ghi thẳng vào đây,
   không đụng nội dung bài); trang gộp asg vào S.wf khi mở và khi lưu bài
   (bên nào đổi sau thì giữ bên đó).
   ===================================================================== */
var PRJ = {list:null, err:"", cur:null, tab:"tien-do", edit:{}, sel:{}, busy:false, msg:""};
var PRJ_ORDER = ["R1","R2","R3","R4","L1","L2a","L2b","L2c","L3a","L3b","L3c"];
// cấu trúc đề theo QĐ 730: Đề Đọc 4 part (mỗi part 1 bài); Đề Nghe 3 part, part có bài nhỏ
var PRJ_TREE = {
  R:[{part:"Part 1", note:"1 bài · 10 câu", items:[["R1","",""]]}, {part:"Part 2", note:"1 bài · 10 câu", items:[["R2","",""]]}, {part:"Part 3", note:"1 bài · 10 câu", items:[["R3","",""]]}, {part:"Part 4", note:"1 bài · 10 câu", items:[["R4","",""]]}],
  L:[{part:"Part 1", note:"8 bài ngắn · mỗi bài 1 câu", items:[1,2,3,4,5,6,7,8].map(function(n){ return ["L1", String(n), "Bài " + n]; })},
     {part:"Part 2", note:"3 hội thoại · mỗi hội thoại 4 câu", items:[["L2a","","Hội thoại 1"],["L2b","","Hội thoại 2"],["L2c","","Hội thoại 3"]]},
     {part:"Part 3", note:"3 bài nói · mỗi bài 5 câu", items:[["L3a","","Bài nói 1"],["L3b","","Bài nói 2"],["L3c","","Bài nói 3"]]}],
  W:[{part:"Task 1", note:"thư/email · tối thiểu 120 từ", items:[["W1","",""]]}, {part:"Task 2", note:"bài luận · tối thiểu 250 từ", items:[["W2","",""]]}],
  S:[{part:"Part 1", note:"giao tiếp xã hội · 2 chủ đề", items:[["S1","",""]]}, {part:"Part 2", note:"thảo luận giải pháp", items:[["S2","",""]]}, {part:"Part 3", note:"phát triển chủ đề", items:[["S3","",""]]}]
};
var PRJ_KIND = {R:"Đề Đọc", L:"Đề Nghe", W:"Đề Viết", S:"Đề Nói"};
var PRJ_SKN = {R:"Đọc ", L:"Nghe ", W:"Viết ", S:"Nói "}, PRJ_ICO = {R:"📖 ", L:"🎧 ", W:"✍️ ", S:"🗣️ "};
// vị trí của một bài trong cây: phần thi + bài nhỏ
function prjNode(spec, slot){ var k = (SPEC[spec] || {}).skill || "R", out = null; PRJ_TREE[k].forEach(function(pt){ pt.items.forEach(function(it){ if(it[0] === spec && (it[1] || "") === (slot || "")) out = {kind:k, part:pt.part, sub:it[2], note:pt.note}; }); }); if(!out && spec === "L1") out = {kind:"L", part:"Part 1", sub:"Bài " + (slot || "1"), note:""}; return out || {kind:k, part:(SPEC[spec] || {}).label || spec, sub:"", note:""}; }
// danh sách bộ đề kèm loại (Đọc / Nghe); dự án cũ chỉ có tên thì đoán loại theo tên hoặc theo bài đã có
function prjSetList(p){
  if(!p) return [];
  var kinds = p.setKinds || {};
  return (p.sets || []).map(function(n){
    var k = kinds[n];
    if(!k){ var xs = LIB.items.filter(function(x){ return x.prj === p.id && (x.meta || {}).set === n; }), sk = {}; xs.forEach(function(x){ sk[(x.meta || {}).skill] = 1; });
      k = /nghe|listen/i.test(n) ? "L" : /đọc|doc|read/i.test(n) ? "R" : /viết|writ/i.test(n) ? "W" : /nói|speak/i.test(n) ? "S" : sk.W && !sk.R && !sk.L && !sk.S ? "W" : sk.S && !sk.R && !sk.L && !sk.W ? "S" : (sk.L && !sk.R ? "L" : sk.R && !sk.L ? "R" : (sk.R && sk.L ? "RL" : "")); }
    return {name:n, kind:k};
  });
}
var PRJ_ROLES = ["nl","tdnl","ch","tdch"];
/* bài Viết, Nói không có phần câu hỏi: không giao Soạn CH, Thẩm định CH */
/* màu theo chặng ở bảng Phân công: Ngữ liệu (xanh dương nhạt), Câu hỏi (tím nhạt) */
function prjGrp(r){ return r === "ch" || r === "tdch" ? "pg-ch" : "pg-nl"; }
function prjNoRole(x, r){ var k = (x.meta || {}).skill; return (k === "W" || k === "S") && (r === "ch" || r === "tdch"); }
var PRJ_SHORT = {coord:"Điều phối", nl:"Soạn NL", tdnl:"TĐ NL", ch:"Soạn CH", tdch:"TĐ CH"};
var PRJ_STAGE = {"":0,"Chủ đề đề xuất":1,"Đang adapt":2,"Ngữ liệu cần sửa":2,"Chờ thẩm định ngữ liệu":3,"Ngữ liệu đã duyệt (khoá)":4,"Đang soạn câu hỏi":4,"Câu hỏi cần sửa":4,"Chờ thẩm định câu hỏi":5,"Câu hỏi đã duyệt":6,"Đã hoàn thiện":7};
var PRJ_DONE_AT = {nl:4, tdnl:4, ch:6, tdch:6, coord:7};

/* ---- tiện ích ---- */
// đếm ngược đến hạn (theo ngày lịch ở máy người xem)
function prjDaysLeft(d){ var m = String(d || "").match(/^(\d{4})-(\d\d)-(\d\d)$/); if(!m) return null; var t = new Date(+m[1], +m[2] - 1, +m[3]).getTime(), n = new Date(); n = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(); return Math.round((t - n) / 864e5); }
function prjLeftText(n){ return n < 0 ? "quá hạn " + (-n) + " ngày" : n === 0 ? "hạn hôm nay" : n === 1 ? "còn 1 ngày" : "còn " + n + " ngày"; }
function prjLeftCls(n){ return n < 0 ? "late" : n <= 1 ? "urgent" : n <= 3 ? "soon" : ""; }
// nhãn hạn: ngày + đếm ngược (active = việc chưa xong; xong rồi thì chỉ ghi ngày)
function prjDueChip(d, active, label){ if(!d) return ""; var n = prjDaysLeft(d); return '<span class="hdue ' + (active && n !== null ? prjLeftCls(n) : "") + '" title="' + esc((label || "Hạn") + " " + prjFmt(d)) + '">' + esc((label || "Hạn") + " " + prjFmt(d).slice(0, 5)) + (active && n !== null ? ' · <b>' + esc(prjLeftText(n)) + '</b>' : '') + '</span>'; }
function prjToday(){ var d = new Date(), p = function(n){ return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth()+1) + "-" + p(d.getDate()); }
function prjFmt(d){ var m = String(d||"").match(/^(\d{4})-(\d\d)-(\d\d)$/); return m ? m[3] + "/" + m[2] + "/" + m[1] : String(d||""); }
function prjMe(){ return typeof libEmail === "function" ? libEmail() : ""; }
function prjShort(em){ return typeof peopleName === "function" ? peopleName(em) : String(em||"").split("@")[0]; }
function prjById(id){ return (PRJ.list || []).filter(function(p){ return p.id === id; })[0] || null; }
function prjName(id){ var p = prjById(id); return p ? p.name : (PRJ.list ? "(dự án đã xoá)" : "…"); }
function prjPeople(id){ var p = prjById(id); if(!p) return []; var out = [p.owner].concat(p.members || []); return out.filter(function(x, i){ return x && out.indexOf(x) === i; }); }
function prjIsCoord(p){ return !!p && (p.owner === prjMe() || (typeof libIsAdmin === "function" && libIsAdmin())); }
function prjVisible(p){ var me = prjMe(); return !!p && (libIsAdmin() || p.owner === me || (p.members || []).indexOf(me) >= 0); }
function prjItems(id){
  var p = prjById(id), sets = (p && p.sets) || [];
  return LIB.items.filter(function(x){ return x.prj === id; }).sort(function(a, b){
    var ma = a.meta || {}, mb = b.meta || {}, sa = sets.indexOf(ma.set), sb = sets.indexOf(mb.set);
    if(sa !== sb) return (sa < 0 ? 999 : sa) - (sb < 0 ? 999 : sb);
    if((ma.set||"") !== (mb.set||"")) return (ma.set||"") < (mb.set||"") ? -1 : 1;
    var oa = PRJ_ORDER.indexOf(ma.spec), ob = PRJ_ORDER.indexOf(mb.spec); if(oa !== ob) return oa - ob;
    return (+ma.slot || 0) - (+mb.slot || 0);
  });
}
function prjShortLabel(x){ var m = x.meta || {}, n = prjNode(m.spec, m.slot); return n.part + (n.sub ? " · " + n.sub : ""); }
function prjLabel(x){ var m = x.meta || {}, n = prjNode(m.spec, m.slot); return (m.set ? m.set + " · " : "") + (PRJ_SKN[n.kind] || "") + n.part + (n.sub ? " · " + n.sub : ""); }
function prjAs(x){ var e = PRJ.edit[x.id]; return Object.assign({}, (x.wf && x.wf.as) || {}, e ? e.as : {}); }
function prjDue(x){ var e = PRJ.edit[x.id]; if(e && e.due !== undefined) return e.due; return x.due || ""; }
function prjEffDue(x, p){ return prjDue(x) || (p && p.due) || ""; }
// hạn riêng từng vai (phần sau chỉ bắt đầu khi phần trước xong); vai chưa có hạn riêng thì theo hạn cả bài
var PRJ_DUE_ROLES = ["nl","tdnl","ch","tdch"];
function prjDues(x){ var e = PRJ.edit[x.id]; return Object.assign({}, (x.wf && x.wf.dues) || (x.asg && x.asg.dues) || {}, e && e.dues ? e.dues : {}); }
function prjRoleDue(x, r, p){ if(r === "coord") return prjEffDue(x, p || prjById(x.prj)); return prjDues(x)[r] || prjEffDue(x, p || prjById(x.prj)); }
// hạn của bước đang làm (bước của người đang giữ bài)
function prjStageDue(x, p){ var ho = prjHolder(x); return ho.role ? prjPhaseDueOf(x, ho.role, p).d : prjEffDue(x, p); }
// hạn của việc đang làm; bị trả sửa thì cả phần phải xong trước hạn của người thẩm định
function prjPhaseDueOf(x, r, p){
  var w = x.wf || {}, st = w.st || "", rq = w.req || "", d = prjDues(x);
  if(r === "nl" && (st === "Ngữ liệu cần sửa" || rq === "chờ sửa" || rq === "đang sửa")) return {d:d.tdnl || prjEffDue(x, p || prjById(x.prj)), label:"Sửa xong trước"};
  if(r === "ch" && st === "Câu hỏi cần sửa") return {d:d.tdch || prjEffDue(x, p || prjById(x.prj)), label:"Sửa xong trước"};
  return {d:prjRoleDue(x, r, p), label:"Hạn"};
}
// thứ tự hạn: Soạn NL ≤ TĐ NL ≤ Soạn CH ≤ TĐ CH ≤ hoàn thiện (phần sau chỉ bắt đầu khi phần trước xong)
function prjDueOrderOf(d, fin){
  var seq = PRJ_DUE_ROLES.map(function(r){ return [r, d[r]]; }).filter(function(v){ return v[1]; });
  // không dùng Array.at(): Safari trên iPhone đời iOS dưới 15.4 không có, ô hạn sẽ không đổi được
  for(var i = 1; i < seq.length; i++) if(seq[i][1] < seq[i - 1][1]) return "hạn " + PRJ_SHORT[seq[i][0]] + " (" + prjFmt(seq[i][1]) + ") sớm hơn hạn " + PRJ_SHORT[seq[i - 1][0]] + " (" + prjFmt(seq[i - 1][1]) + ")";
  var last = seq[seq.length - 1];
  if(fin && last && last[1] > fin) return "hạn " + PRJ_SHORT[last[0]] + " (" + prjFmt(last[1]) + ") muộn hơn hạn hoàn thiện (" + prjFmt(fin) + ")";
  return "";
}
function prjDueOrder(x, p){ return prjDueOrderOf(prjDues(x), prjEffDue(x, p)); }
// khoảng ngày được chọn cho hạn một vai (ô ngày dùng làm min, max)
function prjDueRange(x, r, p){
  var d = prjDues(x), i = PRJ_DUE_ROLES.indexOf(r), lo = "", hi = "";
  PRJ_DUE_ROLES.forEach(function(k, j){ if(!d[k]) return; if(j < i && d[k] > lo) lo = d[k]; if(j > i && (!hi || d[k] < hi)) hi = d[k]; });
  if(r === "due"){ PRJ_DUE_ROLES.forEach(function(k){ if(d[k] && d[k] > lo) lo = d[k]; }); return {lo:lo, hi:""}; }
  var fin = prjEffDue(x, p); if(fin && (!hi || fin < hi)) hi = fin;
  return {lo:lo, hi:hi};
}
// đổi thử một ô hạn: sai thứ tự thì trả lại như cũ và cho biết lý do
function prjTryEdit(x, key, v, p){
  var snap = PRJ.edit[x.id] ? JSON.parse(JSON.stringify(PRJ.edit[x.id])) : null;
  prjSetEdit(x, key, v);
  var bad = prjDueOrder(x, p);
  if(bad){ if(snap) PRJ.edit[x.id] = snap; else delete PRJ.edit[x.id]; return bad; }
  return "";
}
function prjSt(x){ return (x.wf && x.wf.st) || ""; }
function prjStLabel(x){ var s = prjSt(x); return s || (x.wf && x.prj ? "Chưa bắt đầu" : (x.status || "Chưa vào quy trình")); }
function prjDone(x){ return prjSt(x) === "Đã hoàn thiện"; }
function prjStop(x){ return prjSt(x) === "Thay bài / Loại"; }
// trạng thái việc của một vai trong một bài: now (đến lượt), later (sắp tới), done (đã xong), stop (bài bị loại)
function prjRoleState(x, r){
  if(prjStop(x)) return "stop";
  if(libNeed(x) === r) return "now";
  return (PRJ_STAGE[prjSt(x)] || 0) >= PRJ_DONE_AT[r] ? "done" : "later";
}
function prjHolder(x){
  var need = libNeed(x); if(!need || prjDone(x) || prjStop(x)) return {role:"", who:""};
  var as = (x.wf && x.wf.as) || {};
  return {role:need, who:as[need] || (need === "coord" ? "quản trị thư viện" : "")};
}
function prjDays(x){ var t = x.wf && x.wf.stAt; if(!t){ var c = x.createdAt && x.createdAt.toDate ? x.createdAt.toDate().getTime() : 0; t = c; } return t ? Math.floor((Date.now() - t) / 864e5) : null; }

/* ---- gộp phân công từ bảng dự án vào bài ---- */
function prjMerge(w, asg){
  if(!asg || !w || (asg.at || 0) <= (w.asAt || 0)) return false;
  var old = w.as || {}, nw = asg.as || {}, ch = [];
  WF_ROLE_ORDER.forEach(function(r){ if((old[r]||"") !== (nw[r]||"")) ch.push(WF_ROLES[r] + ": " + (nw[r] || "(bỏ trống)")); });
  if((w.due||"") !== (asg.due||"")) ch.push("Hạn: " + (asg.due ? prjFmt(asg.due) : "(bỏ)"));
  var od = w.dues || {}, ndu = asg.dues || {};
  PRJ_DUE_ROLES.forEach(function(r){ if((od[r]||"") !== (ndu[r]||"")) ch.push("Hạn " + PRJ_SHORT[r] + ": " + (ndu[r] ? prjFmt(ndu[r]) : "(bỏ)")); });
  w.as = JSON.parse(JSON.stringify(nw)); w.due = asg.due || ""; w.dues = JSON.parse(JSON.stringify(ndu)); w.asAt = asg.at;
  if(ch.length || asg.note){ w.log = w.log || []; w.log.push({at:asg.at, by:asg.by || "", from:w.st || "", to:w.st || "", act:asg.note ? asg.note.split(":")[0] : "Phân công từ bảng dự án", note:(asg.note && asg.note.indexOf(":") > 0 ? asg.note.slice(asg.note.indexOf(":") + 1).trim() + (ch.length ? " · " : "") : "") + ch.join("; ")}); }
  return true;
}
function prjOnOpen(st, x, copy){
  if(copy){ st.prj = null; return; }
  st.prj = x.prj ? {id:x.prj, name:prjName(x.prj)} : null;
  if(x.asg && x.asg.as){ if(!st.wf) st.wf = {st:"", as:{}, log:[]}; prjMerge(st.wf, x.asg); }
}

/* ---- máy chủ ---- */
function prjLoad(){
  var fb = LIB.fb, me = prjMe(); if(!fb || !LIB.db) return Promise.resolve();
  var col = fb.collection(LIB.db, "projects"), qs = libIsStaff() ? [col] : [fb.query(col, fb.where("owner", "==", me)), fb.query(col, fb.where("members", "array-contains", me))];
  return Promise.all(qs.map(function(q){ return fb.getDocs(q); })).then(function(ss){
    var seen = {}, out = []; ss.forEach(function(s){ s.docs.forEach(function(d){ if(seen[d.id]) return; seen[d.id] = 1; var x = d.data(); x.id = d.id; out.push(x); }); });
    PRJ.list = out.sort(function(a, b){ return (a.name||"") < (b.name||"") ? -1 : 1; }); PRJ.err = "";
  }).catch(function(e){ PRJ.list = []; PRJ.err = e && e.code === "permission-denied" ? "rules" : libErrText(e); });
}
function prjReload(){ PRJ.busy = true; hubRender(); return libList().then(function(){ try{ prjDueSweep(); }catch(e){} return peopleEnsure(); }).catch(function(e){ LIB.err = libErrText(e); }).then(function(){ PRJ.busy = false; hubRender(); }); }
function prjErr(e){ PRJ.busy = false; PRJ.msg = ""; HUB.err = e && e.code === "permission-denied" ? "Máy chủ từ chối. Nếu đây là lần đầu dùng Dự án, quản trị cần dán lại luật bảo mật mới (README, mục Dự án) vào Firebase." : libErrText(e); hubRender(); }
function prjEmailOk(e){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }
function prjCreate(name, due, sets, coord){
  var fb = LIB.fb, me = prjMe(); name = String(name||"").trim();
  if(!name){ toast("Cần tên dự án."); return; }
  coord = String(coord || "").trim().toLowerCase();
  if(!coord || !libIsAdmin()) coord = me;
  if(!prjEmailOk(coord)){ toast("Email Điều phối chưa đúng."); return; }
  var ref = fb.doc(fb.collection(LIB.db, "projects"));
  var rec = {name:name.slice(0, 120), owner:coord, ownerName:(coord === me ? (LIB.user.displayName || me) : peopleName(coord)), createdBy:me, members:[], sets:prjNewSets(sets).names, setKinds:prjNewSets(sets).kinds, due:due || "", note:"", createdAt:fb.serverTimestamp(), updatedAt:fb.serverTimestamp()};
  PRJ.busy = true; hubRender();
  fb.setDoc(ref, rec).then(function(){
    PRJ.cur = ref.id; PRJ.tab = "thiet-lap"; HUB.page = "duan-ct";
    if(coord === me) toast("Đã tạo dự án " + name + ". Bạn là Điều phối. Mời thành viên và tạo khung bài ở mục Thiết lập.");
    else { toast("Đã tạo dự án " + name + " và giao Điều phối cho " + peopleName(coord) + "."); try{ ntfSend([{to:coord, type:"turn", text:"Bạn được giao làm Điều phối dự án " + name, link:{kind:"prj", prj:ref.id, tab:"thiet-lap"}}]); }catch(e){} }
    return prjReload();
  }).catch(prjErr);
}
/* quản trị đổi Điều phối: người cũ ở lại dự án với vai thành viên; bài của dự án chuyển phần Điều phối sang người mới */
function prjSetCoord(p, em){
  var fb = LIB.fb, old = p.owner; em = String(em || "").trim().toLowerCase();
  if(!libIsAdmin()){ toast("Chỉ quản trị đổi được Điều phối."); return; }
  if(!prjEmailOk(em)){ toast("Email Điều phối chưa đúng."); return; }
  if(em === old){ toast(peopleName(em) + " đang là Điều phối."); return; }
  if((PEOPLE[em] || {}).role === "blocked"){ toast("Tài khoản này đang bị khoá."); return; }
  var members = (p.members || []).filter(function(e){ return e !== em; });
  if(old && members.indexOf(old) < 0 && (PEOPLE[old] || {}).role !== "admin") members.push(old);
  PRJ.busy = true; hubRender();
  fb.updateDoc(fb.doc(LIB.db, "projects", p.id), {owner:em, ownerName:peopleName(em), members:members, updatedAt:fb.serverTimestamp()}).then(function(){
    p.owner = em; p.members = members;
    var xs = prjItems(p.id);
    return Promise.all(xs.map(function(x){
      var patch = {team:prjPeople(p.id)}, as = (x.wf && x.wf.as) || {};
      if(!as.coord || as.coord === old) patch["wf.as.coord"] = em;
      if(x.asg && x.asg.as && (!x.asg.as.coord || x.asg.as.coord === old)) patch["asg.as.coord"] = em;
      return fb.updateDoc(fb.doc(LIB.db, "materials", x.id), patch);
    }));
  }).then(function(){
    try{ ntfSend([{to:em, type:"turn", text:"Bạn được giao làm Điều phối dự án " + p.name, link:{kind:"prj", prj:p.id, tab:"thiet-lap"}}].concat(old ? [{to:old, type:"back", text:"Dự án " + p.name + " đã chuyển Điều phối sang " + peopleName(em) + "; bạn vẫn là thành viên", link:{kind:"prj", prj:p.id, tab:"thiet-lap"}}] : [])); }catch(e){}
    toast("Đã giao Điều phối dự án cho " + peopleName(em) + "."); return prjReload();
  }).catch(prjErr);
}
function prjNewSets(n){ var names = [], kinds = {}, pad = function(i){ return String(i).padStart(2, "0"); }; if(typeof n === "string"){ prjSplit(n).forEach(function(x){ names.push(x); }); return {names:names, kinds:kinds}; } ["R","L","W","S"].forEach(function(k){ for(var i = 1; i <= Math.min(20, n[k] || 0); i++){ var nm = PRJ_KIND[k] + " " + pad(i); names.push(nm); kinds[nm] = k; } }); return {names:names, kinds:kinds}; }
function prjSplit(s){ var out = String(s||"").split(/[\n,;]+/).map(function(x){ return x.trim(); }).filter(Boolean); return out.filter(function(x, i){ return out.indexOf(x) === i; }); }
function prjUpdate(p, patch, msg){
  var fb = LIB.fb; patch.updatedAt = fb.serverTimestamp(); PRJ.busy = true; hubRender();
  return fb.updateDoc(fb.doc(LIB.db, "projects", p.id), patch).then(function(){ if(msg) toast(msg); return prjReload(); }).catch(prjErr);
}
// mời thẳng bằng email: người chưa đăng nhập lần nào vẫn vào dự án; lần đầu đăng nhập bằng đúng email đó là thấy dự án và việc được giao
function prjInvite(p, raw){
  var fb = LIB.fb, all = prjSplit(String(raw||"").toLowerCase().replace(/\s+/g, ","));
  var bad = all.filter(function(e){ return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); });
  var list = all.filter(function(e){ return bad.indexOf(e) < 0 && e !== p.owner && (p.members||[]).indexOf(e) < 0; });
  if(bad.length){ PRJ.msg = "Email chưa đúng dạng: " + bad.join(", ") + "."; }
  if(!list.length){ if(!bad.length) toast("Không có email mới để mời."); hubRender(); return; }
  PRJ.busy = true; hubRender();
  Promise.all(list.map(function(e){ return fb.getDoc(fb.doc(LIB.db, "staff", e)).then(function(d){ var x = d.exists() ? d.data() : {missing:true}; x.email = e; peopleAdd([x]); }, function(){ peopleAdd([{email:e, missing:true}]); }); })).then(function(){
    var pend = list.filter(function(e){ return (PEOPLE[e] || {}).missing; });
    PRJ.msg = (bad.length ? PRJ.msg + " " : "") + (pend.length ? pend.length + " người chưa đăng nhập trang lần nào nên chưa biết mình được mời. Bấm \"Gửi lời mời qua Gmail\" ở danh sách thành viên để báo cho họ." : "");
    PRJ.invited = pend;
    prjUpdate(p, {members:(p.members || []).concat(list)}, "Đã mời " + list.length + " người vào dự án.").then(function(){ if(typeof ntfInvite === "function") ntfInvite(p, list); return prjSyncTeam(p.id); }).then(function(){ if(typeof frSyncTeam === "function") return frSyncTeam(p.id); });
  });
}
function prjSiteUrl(){ return location.href.split("#")[0].split("?")[0]; }
function prjInviteMail(p, emails){
  var me = prjMe(), su = "Mời tham gia dự án " + p.name + " (Nhóm soạn đề VSTEP)";
  var body = "Chào bạn,\n\n" + peopleName(me) + " mời bạn tham gia dự án \"" + p.name + "\" trên trang Nhóm soạn đề VSTEP" + (p.due ? " (hạn " + prjFmt(p.due) + ")" : "") + ".\n\nBạn mở đường link sau và bấm Đăng nhập bằng Google, chọn đúng tài khoản " + (emails.length === 1 ? emails[0] : "Gmail nhận thư này") + ":\n" + prjSiteUrl() + "\n\nĐăng nhập xong, dự án và việc được giao hiện ngay ở mục Việc của tôi. Không cần đăng ký gì thêm.\n\nCảm ơn bạn!\n" + peopleName(me);
  return {gmail:"https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(emails.join(",")) + "&su=" + encodeURIComponent(su) + "&body=" + encodeURIComponent(body), mailto:"mailto:" + emails.map(encodeURIComponent).join(",") + "?subject=" + encodeURIComponent(su) + "&body=" + encodeURIComponent(body)};
}
// ai trong dự án thì đọc được bài của dự án: ghi danh sách người vào từng bài (luật bảo mật dựa vào trường team)
function prjSyncTeam(pid){
  var fb = LIB.fb, team = prjPeople(pid);
  var xs = prjItems(pid).filter(function(x){ return JSON.stringify((x.team || []).slice().sort()) !== JSON.stringify(team.slice().sort()); });
  if(!xs.length) return Promise.resolve();
  return Promise.all(xs.map(function(x){ return fb.updateDoc(fb.doc(LIB.db, "materials", x.id), {team:team}).then(function(){ x.team = team; }); })).catch(prjErr);
}
function prjUninvite(p, em){
  var n = prjItems(p.id).filter(function(x){ var as = (x.wf && x.wf.as) || {}; return PRJ_ROLES.some(function(r){ return as[r] === em; }); }).length;
  hubAsk("<b>Bỏ " + esc(prjShort(em)) + " khỏi dự án?</b>" + (n ? " Người này đang được phân công ở " + n + " bài; phân công đó giữ nguyên cho đến khi bạn giao lại ở bảng Phân công. Sau khi bỏ, người này không mở được bài của dự án nữa." : " Sau khi bỏ, người này không mở được bài của dự án nữa."), "Bỏ khỏi dự án", function(){ prjUpdate(p, {members:(p.members || []).filter(function(x){ return x !== em; })}, "Đã bỏ " + prjShort(em) + ".").then(function(){ return prjSyncTeam(p.id); }).then(function(){ if(typeof frSyncTeam === "function") return frSyncTeam(p.id); }); }, true);
}
function prjDelete(p){
  var xs = prjItems(p.id);
  hubAsk("<b>Xoá dự án \"" + esc(p.name) + "\"?</b> " + xs.length + " bài của dự án vẫn ở lại Thư viện của người tạo bài và quản trị, giữ nguyên nội dung; trang bỏ gắn bài với dự án và xoá phân công, hạn của các bài để không còn hiện trong Việc của tôi.", "Xoá dự án", function(){
    var fb = LIB.fb, now = Date.now(), me = prjMe(); PRJ.busy = true; HUB.page = "duan"; hubRender();
    Promise.all(xs.map(function(x){ return fb.updateDoc(fb.doc(LIB.db, "materials", x.id), {prj:null, team:[], due:"", asg:{as:{}, at:now, by:me, due:"", dues:{}, note:"Xoá dự án: " + p.name}, "wf.as":{}, "wf.due":"", "wf.dues":{}}); })).then(function(){ return fb.deleteDoc(fb.doc(LIB.db, "projects", p.id)); }).then(function(){ PRJ.cur = null; toast("Đã xoá dự án."); return prjReload(); }).catch(prjErr);
  }, true);
}
// tạo khung bài trống cho các nhánh đã đánh dấu trong cây (bỏ qua bài đã có)
function prjHave(p){ var have = {}; prjItems(p.id).forEach(function(x){ var m = x.meta || {}; have[m.set + "|" + m.spec + "|" + (m.slot||"")] = 1; }); return have; }
function prjMakeItems(p, list){
  var fb = LIB.fb, me = prjMe(), name = LIB.user.displayName || me, now = Date.now(), have = prjHave(p);
  var make = list.filter(function(it){ return !have[it.set + "|" + it.spec + "|" + (it.slot || "")]; });
  if(!make.length){ toast("Chưa đánh dấu bài mới nào để tạo."); return; }
  PRJ.busy = true; hubRender();
  Promise.all(make.map(function(it){
    var sp = SPEC[it.spec], lv = LEVEL_BY_SPEC[it.spec] || {level:"B2", floor:"0"}, nd = prjNode(it.spec, it.slot);
    var wf = {st:"", as:{coord:p.owner}, log:[{at:now, by:me, from:"", to:"", act:"Tạo khung bài trong dự án " + p.name, note:""}], rounds:{nl:0, ch:0}, lock:null, req:null, take:{}, dec:{}, qVer:0, due:"", asAt:now};
    var st = {step:"bat-dau", srcLang:"en", srcMode:"text", fixOpen:{}, spec:it.spec, level:lv.level, floor:lv.floor, spelling:"Anh–Anh", paras:"5", poly:"2–3", code:"", gates:{}, fields:{}, slots:{}, l1slot:it.slot || "1", libSet:it.set, prj:{id:p.id, name:p.name}, wf:wf};
    var json = JSON.stringify(st), t = it.set + " · " + (PRJ_SKN[nd.kind] || "") + nd.part + (nd.sub ? " · " + nd.sub : "");
    var ref = fb.doc(fb.collection(LIB.db, "materials"));
    var meta = {spec:it.spec, specLabel:sp.label, skill:sp.skill, level:lv.level, topic:"", code:"", set:it.set, url:"", asia:false, words:0, questions:0, step:"bat-dau", slot:it.slot || ""};
    var rec = {title:t, owner:me, ownerName:name, createdAt:fb.serverTimestamp(), status:"", wf:{st:"", as:wf.as, req:"", lockVer:0, rounds:wf.rounds, due:"", stAt:0}, rev:1, updatedAt:fb.serverTimestamp(), updatedBy:me, updatedByName:name, meta:meta, state:json, prj:p.id, team:prjPeople(p.id), due:"", asg:{as:{coord:p.owner}, at:now, by:me, due:""}};
    return fb.setDoc(ref, rec).then(function(){ return fb.setDoc(fb.doc(LIB.db, "materials", ref.id, "versions", "v1"), {rev:1, savedAt:fb.serverTimestamp(), savedBy:me, savedByName:name, title:t, state:json}); });
  })).then(function(){
    toast("Đã tạo " + make.length + " khung bài. Sang mục Phân công để giao việc.");
    PRJ.tab = "phan-cong"; return prjReload();
  }).catch(prjErr);
}
// thêm, bỏ bộ đề (bỏ được khi bộ đề chưa có bài)
function prjAddSet(p, name, kind){
  name = String(name || "").trim(); if(!name){ toast("Cần tên bộ đề."); return; }
  if((p.sets || []).indexOf(name) >= 0){ toast("Đã có bộ đề tên này."); return; }
  var kinds = Object.assign({}, p.setKinds || {}); prjSetList(p).forEach(function(x){ if(x.kind && !kinds[x.name]) kinds[x.name] = x.kind; }); kinds[name] = kind;
  prjUpdate(p, {sets:(p.sets || []).concat([name]), setKinds:kinds}, "Đã thêm bộ đề " + name + " (" + PRJ_KIND[kind] + "). Đánh dấu các phần cần tạo rồi bấm Tạo khung bài.");
}
function prjDelSet(p, name){
  if(prjItems(p.id).some(function(x){ return (x.meta || {}).set === name; })){ toast("Bộ đề đã có bài nên không bỏ được."); return; }
  var kinds = Object.assign({}, p.setKinds || {}); delete kinds[name];
  prjUpdate(p, {sets:(p.sets || []).filter(function(s){ return s !== name; }), setKinds:kinds}, "Đã bỏ bộ đề " + name + ".");
}
function prjSetKind(p, name, kind){ var kinds = Object.assign({}, p.setKinds || {}); kinds[name] = kind; prjUpdate(p, {setKinds:kinds}); }
function prjAttachable(p){ return LIB.items.filter(function(x){ return !x.prj && (p.sets || []).indexOf((x.meta || {}).set) >= 0; }); }
function prjAttach(p){
  var fb = LIB.fb, xs = prjAttachable(p), me = prjMe(), now = Date.now(); if(!xs.length) return;
  PRJ.busy = true; hubRender();
  Promise.all(xs.map(function(x){
    var as = Object.assign({}, (x.wf && x.wf.as) || {}); if(!as.coord) as.coord = p.owner;
    return fb.updateDoc(fb.doc(LIB.db, "materials", x.id), {prj:p.id, team:prjPeople(p.id), asg:{as:as, at:now, by:me, due:x.due || ""}, wf:Object.assign({st:"", req:"", lockVer:0, rounds:{nl:0, ch:0}, due:"", stAt:0}, x.wf || {}, {as:as})});
  })).then(function(){ toast("Đã gắn " + xs.length + " bài vào dự án."); return prjReload(); }).catch(prjErr);
}
// lưu các ô phân công đã đổi ở bảng (ghi asg, không đụng nội dung bài)
function prjSaveEdits(p){
  var fb = LIB.fb, me = prjMe(), now = Date.now(), ids = Object.keys(PRJ.edit);
  if(!ids.length) return;
  var bad = ids.filter(function(id){ var x = LIB.items.filter(function(y){ return y.id === id; })[0]; return x && prjConflicts(prjAs(x)).hard.length; });
  if(bad.length){ PRJ.msg = bad.length + " bài có người tự duyệt bài của mình (ô đỏ). Sửa trước khi lưu."; toast(PRJ.msg); hubRender(); return; }
  var badD = ids.map(function(id){ var x = LIB.items.filter(function(y){ return y.id === id; })[0]; return x && prjDueOrder(x, p) ? prjShortLabel(x) + ": " + prjDueOrder(x, p) : ""; }).filter(Boolean);
  if(badD.length){ PRJ.msg = "Chưa lưu được: " + badD.length + " bài sai thứ tự hạn (" + badD[0] + (badD.length > 1 ? "…" : "") + "). Sửa các ô có dòng đỏ rồi lưu lại."; toast(PRJ.msg); hubRender(); return; }
  var changes = [];
  ids.forEach(function(id){ var x = LIB.items.filter(function(y){ return y.id === id; })[0]; if(!x) return; var old = (x.wf && x.wf.as) || {}, nw = prjAs(x), od = (x.wf && x.wf.dues) || {}, nd = prjDues(x); PRJ_ROLES.forEach(function(r){ if(nw[r] && (nw[r] !== old[r] || (nd[r] || "") !== (od[r] || ""))) changes.push({to:nw[r], role:r, x:x, due:prjRoleDue(x, r, p), redue:nw[r] === old[r]}); }); });
  // người được giao nhưng chưa ở trong dự án: mời vào dự án trước, để họ đọc được bài (luật dựa vào trường team)
  var inP = prjPeople(p.id), add = [];
  ids.forEach(function(id){ var x = LIB.items.filter(function(y){ return y.id === id; })[0]; if(!x) return; var as = prjAs(x); Object.keys(as).forEach(function(r){ var e = as[r]; if(e && inP.indexOf(e) < 0 && add.indexOf(e) < 0) add.push(e); }); });
  PRJ.busy = true; hubRender();
  var pre = add.length ? fb.updateDoc(fb.doc(LIB.db, "projects", p.id), {members:(p.members || []).concat(add), updatedAt:fb.serverTimestamp()}).then(function(){ p.members = (p.members || []).concat(add); if(typeof ntfInvite === "function") ntfInvite(p, add); }) : Promise.resolve();
  pre.then(function(){ return Promise.all(ids.map(function(id){
    var x = LIB.items.filter(function(y){ return y.id === id; })[0]; if(!x) return null;
    var as = prjAs(x), due = prjDue(x), dues = prjDues(x); Object.keys(as).forEach(function(r){ if(!as[r]) delete as[r]; }); Object.keys(dues).forEach(function(r){ if(!dues[r]) delete dues[r]; }); if(!as.coord) as.coord = p.owner;
    return fb.updateDoc(fb.doc(LIB.db, "materials", id), {asg:{as:as, at:now, by:me, due:due, dues:dues}, due:due, wf:Object.assign({st:"", req:"", lockVer:0, rounds:{nl:0, ch:0}, stAt:0}, x.wf || {}, {as:as, due:due, dues:dues})});
  })); }).then(function(){ return add.length ? prjSyncTeam(p.id) : null; }).then(function(){ if(typeof ntfAssignBatch === "function") ntfAssignBatch(p, changes); toast("Đã lưu phân công " + ids.length + " bài." + (add.length ? " Đã mời " + add.map(prjShort).join(", ") + " vào dự án." : "") + " Ai đang mở bài sẽ nhận phân công mới khi mở lại hoặc khi lưu."); PRJ.edit = {}; PRJ.msg = ""; return prjReload(); }).catch(prjErr);
}
function prjConflicts(as){
  var hard = [], soft = [];
  if(as.nl && as.nl === as.tdnl) hard.push("Soạn NL trùng TĐ NL");
  if(as.ch && as.ch === as.tdch) hard.push("Soạn CH trùng TĐ CH");
  if(as.nl && as.nl === as.ch) soft.push("Soạn CH nên khác Soạn NL");
  return {hard:hard, soft:soft};
}
function prjSetEdit(x, role, v){
  var e = PRJ.edit[x.id] || {as:{}, dues:{}}; e.dues = e.dues || {};
  if(role === "due") e.due = v; else if(role.indexOf("due:") === 0) e.dues[role.slice(4)] = v; else e.as[role] = v;
  // bỏ ô trùng với giá trị gốc
  var base = (x.wf && x.wf.as) || {}, bd = (x.wf && x.wf.dues) || (x.asg && x.asg.dues) || {};
  Object.keys(e.as).forEach(function(r){ if((e.as[r]||"") === (base[r]||"")) delete e.as[r]; });
  Object.keys(e.dues).forEach(function(r){ if((e.dues[r]||"") === (bd[r]||"")) delete e.dues[r]; });
  if(e.due !== undefined && (e.due||"") === (x.due||"")) delete e.due;
  if(Object.keys(e.as).length || Object.keys(e.dues).length || e.due !== undefined) PRJ.edit[x.id] = e; else delete PRJ.edit[x.id];
}
// lập lịch nối tiếp: từ ngày bắt đầu, mỗi phần cộng số ngày Điều phối nhập; phần để trống thì bỏ qua
function prjAddDays(d, n){ var t = Date.parse(d + "T00:00:00Z") + n * 864e5; return new Date(t).toISOString().slice(0, 10); }
function prjSchedule(p, start, days){
  var xs = prjItems(p.id).filter(function(x){ return !prjDone(x) && !prjStop(x); }), n = 0;
  if(!start){ PRJ.msg = "Chọn ngày bắt đầu."; hubRender(); return; }
  if(!PRJ_DUE_ROLES.concat(["coord"]).some(function(r){ return days[r] > 0; })){ PRJ.msg = "Nhập số ngày cho ít nhất một phần."; hubRender(); return; }
  var skip = [];
  xs.forEach(function(x){
    var cur = start, snap = PRJ.edit[x.id] ? JSON.parse(JSON.stringify(PRJ.edit[x.id])) : null;
    PRJ_DUE_ROLES.forEach(function(r){ if(days[r] > 0 && !prjNoRole(x, r)){ cur = prjAddDays(cur, days[r]); prjSetEdit(x, "due:" + r, cur); } });
    if(days.coord > 0){ cur = prjAddDays(cur, days.coord); prjSetEdit(x, "due", cur); }
    var bad = prjDueOrder(x, p);
    if(bad){ if(snap) PRJ.edit[x.id] = snap; else delete PRJ.edit[x.id]; skip.push(prjShortLabel(x) + ": " + bad); } else n++;
  });
  PRJ.msg = (n ? "Đã lập lịch cho " + n + " bài (chưa lưu). Xem lại các ô hạn rồi bấm Lưu phân công." : "") + (skip.length ? " Không lập được " + skip.length + " bài vì sai thứ tự hạn (" + skip[0] + (skip.length > 1 ? "…" : "") + "). Nhập thêm số ngày cho Điều phối duyệt, hoặc lùi hạn hoàn thiện." : ""); hubRender();
}
// chia đều: chỉ điền ô trống; mỗi lần chọn người đang ít việc nhất, tránh tự duyệt, cố để Soạn CH khác Soạn NL
function prjAuto(p){
  // Điều phối đã giữ cổng 1 và 4: chỉ nhận việc soạn, thẩm định khi dự án có dưới 3 thành viên
  var mem = (p.members || []).slice(), people = mem.length >= 3 ? mem : prjPeople(p.id);
  if(people.length < 2){ PRJ.msg = "Cần ít nhất 2 người trong dự án để chia việc mà không ai tự duyệt bài của mình (nên có từ 3 người để người soạn câu hỏi khác người soạn ngữ liệu)."; hubRender(); return; }
  var xs = prjItems(p.id).filter(function(x){ return !prjDone(x) && !prjStop(x); }), selIds = [];
  var load = {}; people.forEach(function(e){ load[e] = 0; });
  prjItems(p.id).forEach(function(x){ var as = prjAs(x); PRJ_ROLES.forEach(function(r){ if(as[r] && load[as[r]] !== undefined) load[as[r]]++; }); });
  var filled = 0, turn = 0;
  xs.forEach(function(x){
    var as = prjAs(x);
    PRJ_ROLES.forEach(function(r){
      if(as[r] || prjNoRole(x, r)) return;
      var avoid = {nl:[as.tdnl], tdnl:[as.nl], ch:[as.tdch], tdch:[as.ch]}[r], prefer = {ch:[as.nl], nl:[as.ch]}[r] || [];
      var cand = people.filter(function(e){ return avoid.indexOf(e) < 0; }), better = cand.filter(function(e){ return prefer.indexOf(e) < 0; });
      if(better.length) cand = better; if(!cand.length) return;
      cand.sort(function(a, b){ return load[a] - load[b] || ((people.indexOf(a) - turn + people.length) % people.length) - ((people.indexOf(b) - turn + people.length) % people.length); });
      as[r] = cand[0]; load[cand[0]]++; turn = (turn + 1) % people.length; prjSetEdit(x, r, cand[0]); filled++;
    });
  });
  PRJ.msg = filled ? "Đã điền " + filled + " ô trống (chưa lưu). Xem lại rồi bấm Lưu phân công." : "Không còn ô trống" + (selIds.length ? " ở các bài đã chọn." : ".");
  hubRender();
}

/* ---- giao diện ---- */
function prjMineAll(){
  var me = prjMe(), out = [], ready = !!PRJ.list;
  LIB.items.forEach(function(x){
    // chỉ việc của dự án còn tồn tại; bài đã tách khỏi dự án (dự án bị xoá) không còn là việc
    if(ready && !(x.prj && prjById(x.prj))) return;
    var as = (x.wf && x.wf.as) || {};
    WF_ROLE_ORDER.forEach(function(r){
      var mine = r === "coord" ? (as.coord ? as.coord === me : (x.wf && x.wf.st && libIsAdmin() && libNeed(x) === "coord")) : as[r] === me;
      if(mine) out.push({x:x, r:r, s:prjRoleState(x, r)});
    });
  });
  return out;
}
/* ---- người: tên hiển thị, ảnh đại diện ---- */
var PEOPLE = {};
var PEOPLE_COLORS = ["#0d6870","#2d6cdf","#7a4fd6","#c2410c","#15803d","#b4236b","#4b5563","#a16207"];
function peopleAdd(list){ (list || []).forEach(function(x){ if(x && x.email) PEOPLE[x.email] = Object.assign(PEOPLE[x.email] || {}, x); }); }
function peopleName(em){ var x = PEOPLE[em]; return (x && x.name) || String(em||"").split("@")[0]; }
function peopleColor(em){ var x = PEOPLE[em]; if(x && x.color) return x.color; var h = 0; String(em||"").split("").forEach(function(c){ h = (h * 31 + c.charCodeAt(0)) % 997; }); return PEOPLE_COLORS[h % PEOPLE_COLORS.length]; }
function peopleInitial(em){ var w = peopleName(em).trim().split(/\s+/); return (w[w.length - 1] || "?").charAt(0).toUpperCase(); }
function avatar(em, big){ return '<span class="hav' + (big ? " big" : "") + '" style="background:' + esc(peopleColor(em)) + '" title="' + esc(peopleName(em) + " · " + em) + '">' + esc(peopleInitial(em)) + '</span>'; }
function avatars(list, max){ max = max || 6; var xs = list.slice(0, max); return '<span class="havs">' + xs.map(function(e){ return avatar(e); }).join("") + (list.length > max ? '<span class="hav more">+' + (list.length - max) + '</span>' : '') + '</span>'; }
function peopleEnsure(){
  var fb = LIB.fb, want = {};
  (PRJ.list || []).forEach(function(p){ [p.owner].concat(p.members || []).forEach(function(e){ want[e] = 1; }); });
  LIB.items.forEach(function(x){ var as = (x.wf && x.wf.as) || {}; Object.keys(as).forEach(function(r){ if(as[r]) want[as[r]] = 1; }); });
  var miss = Object.keys(want).filter(function(e){ return e && !PEOPLE[e]; });
  if(!fb || !miss.length) return Promise.resolve();
  return Promise.all(miss.map(function(e){ return fb.getDoc(fb.doc(LIB.db, "staff", e)).then(function(d){ var x = d.exists() ? d.data() : {missing:true}; x.email = e; peopleAdd([x]); }, function(){ peopleAdd([{email:e, missing:true}]); }); }));
}

/* ---- không gian nhóm (trang riêng, toàn màn hình) ---- */
var HUB = {open:false, page:"viec", ask:null, err:"", newOpen:false};
function hubEl(){ return document.getElementById("hub"); }
function hubOpen(page){
  var el = hubEl(); if(!el) return;
  HUB.open = true; if(page) HUB.page = page; HUB.err = "";
  el.classList.remove("hidden"); document.body.classList.add("hubon"); el.scrollTop = 0;
  hubRender();
  libLoad().then(function(){ hubRender(); if(hubSigned()){ prjReload(); if(typeof frLoad === "function") frLoad(); } }).catch(function(e){ HUB.err = "Không tải được phần đăng nhập. Trang chỉ chạy khi mở qua đường dẫn web. " + (e && e.message ? "(" + e.message + ")" : ""); hubRender(); });
}
function hubSigned(){ return !!(LIB.user && LIB.role && LIB.role !== "none" && LIB.role !== "blocked"); }
function hubGateStart(){
  if(window.__noGate) return;
  var wasEditing = !!(S.lib && S.lib.id) && /^#[a-z-]+$/.test(location.hash) && document.getElementById(location.hash.slice(1));
  hubOpen("viec");
  // đang soạn dở một bài rồi tải lại trang: đăng nhập xong thì về thẳng bài đó
  if(wasEditing){ var iv = setInterval(function(){ if(!LIB.authReady || (LIB.user && !LIB.role)) return; clearInterval(iv); if(hubSigned()) hubClose(); }, 200); setTimeout(function(){ clearInterval(iv); }, 15000); }
}
function hubClose(){ if(!window.__noGate && (!hubSigned() || !(S.lib && S.lib.id))) return; var el = hubEl(); HUB.open = false; HUB.ask = null; if(el) el.classList.add("hidden"); document.body.classList.remove("hubon"); }
function hubAsk(text, yes, action, danger, extra){ HUB.ask = {text:text, btns:(extra || []).concat([{label:yes, cls:danger ? "danger" : "primary", fn:action}])}; hubRender(); }
// thanh đầu trang soạn bài khi đang làm một bài của thư viện (theo dự án): cùng kiểu trang Nhóm
function edRender(){
  var bar = document.getElementById("edbar"); if(!bar) return;
  var on = !window.__noGate && hubSigned() && !!(S.lib && S.lib.id);
  document.body.classList.toggle("prjmode", on); bar.classList.toggle("hidden", !on);
  if(!on){ bar.innerHTML = ""; return; }
  var me = prjMe(), dirty = typeof libLibDirty === "function" ? libLibDirty() : false, st = (S.wf && S.wf.st) || (S.prj ? "Chưa bắt đầu" : "");
  var tag = (document.getElementById("build-tag") || {}).textContent || "";
  var h = '<span class="hublogo" title="' + esc(tag) + '">V</span><button class="btn quiet sm" type="button" id="ed-back">← Về Nhóm</button>'
    + '<div class="edcrumb"><div class="edpath">' + (S.prj ? '<button type="button" id="ed-prj">' + esc(S.prj.name || prjName(S.prj.id)) + '</button><span>›</span>' : '<span>Bài trong thư viện</span><span>›</span>') + (st ? '<span class="hst ' + prjStCls({wf:{st:st === "Chưa bắt đầu" ? "" : st}}) + '">' + esc(st) + '</span>' : '') + '</div><div class="edtitle">' + esc(S.lib.title || "") + '</div></div>'
    + '<div class="edright"><button class="btn sm edsave' + (dirty ? " primary" : " saved") + '" type="button" id="ed-save" title="Lưu lên thư viện">' + (LIB.loading ? "Đang lưu…" : dirty ? "💾 Lưu thay đổi" : "✓ Đã lưu") + '</button>'
    + (libIsAdmin() ? '<button class="btn quiet sm" type="button" id="ed-lib" title="Thư viện (quản trị)">Thư viện</button>' : '')
    + (function(){ var nu = typeof ntfUnread === "function" ? ntfUnread() : 0; return '<button class="hubbell" type="button" id="ntfbtn" aria-label="Thông báo' + (nu ? ", " + nu + " chưa đọc" : "") + '">🔔' + (nu ? ' <span class="hubbadge">' + (nu > 99 ? "99+" : nu) + '</span>' : '') + '</button>'; })() + '<button type="button" class="hubme" id="ed-me">' + avatar(me) + '<span>' + esc(peopleName(me)) + '</span></button></div>';
  // giữ nguyên khi không đổi, để không giật chữ mỗi lần cập nhật
  if(bar.getAttribute("data-h") !== h){ bar.innerHTML = h; bar.setAttribute("data-h", h); }
  var old = document.querySelector(".toprow #ntfbtn"); if(old) old.remove();
  // bài thuộc dự án: phần thi do khung bài quyết định, không đổi ở bước 1
  var sp = document.getElementById("set-spec"); if(sp){ sp.disabled = !!S.prj; sp.title = S.prj ? "Phần thi của bài trong dự án do Điều phối tạo khung, không đổi ở đây." : ""; }
}
function hubBadge(){
  try{ edRender(); }catch(e){}
  var b = document.getElementById("hubbtn"); if(!b) return;
  var n = (LIB.user && LIB.items) ? prjMineAll().filter(function(t){ return t.s === "now"; }).length : 0;
  var fn = typeof frNewCount === "function" ? frNewCount() : 0; b.innerHTML = 'Nhóm' + (n + fn ? ' <span class="hubbadge">' + (n + fn) + '</span>' : '');
  var nb = document.getElementById("ntfbtn"), nu = typeof ntfUnread === "function" && LIB.user ? ntfUnread() : 0; if(nb){ nb.classList.toggle("hidden", !(LIB.user && LIB.role && LIB.role !== "none")); nb.innerHTML = '🔔' + (nu ? ' <span class="hubbadge">' + (nu > 99 ? "99+" : nu) + '</span>' : ''); nb.setAttribute("aria-label", "Thông báo" + (nu ? ", " + nu + " chưa đọc" : "")); }
}
function hubRender(){
  hubBadge();
  var el = hubEl(); if(!el || !HUB.open) return;
  var me = prjMe(), signed = LIB.user && LIB.role && LIB.role !== "none" && LIB.role !== "blocked";
  var frN = typeof frNewCount === "function" ? frNewCount() : 0;
  var pages = [["viec","Việc của tôi"],["duan","Dự án"],["dd","Diễn đàn" + (frN ? ' <span class="hubbadge">' + frN + '</span>' : '')],["hoso","Hồ sơ"]]; if(libIsAdmin()) pages.push(["tv","Thành viên"]);
  var cur = HUB.page === "duan-ct" ? "duan" : HUB.page === "dd-ct" ? "dd" : HUB.page;
  var h = '<header class="hubtop"><div class="hubbrand"><span class="hublogo">V</span><div><b>Nhóm soạn đề VSTEP</b><div class="small muted">Dự án · phân công · tiến độ</div></div></div>'
    + (signed ? '<nav class="hubnav">' + pages.map(function(p){ return '<button type="button" data-hubpage="' + p[0] + '" class="' + (cur === p[0] ? "on" : "") + '">' + p[1] + '</button>'; }).join("") + '</nav>' : '<span></span>')
    + '<div class="hubright">' + (signed && typeof ntfBellHTML === "function" ? ntfBellHTML() : '') + (signed ? '<button type="button" class="hubme" data-hubpage="hoso">' + avatar(me) + '<span>' + esc(peopleName(me)) + '</span></button>' + (S.lib && S.lib.id && S.prj ? '<button class="btn quiet" type="button" id="hub-close" title="Quay lại bài đang mở">↩ ' + esc(String(S.lib.title || "Bài đang mở").slice(0, 28)) + '</button>' : '') : '') + '</div></header><main class="hubmain">';
  if(HUB.err) h += '<div class="hubcard hubbad">' + esc(HUB.err) + '</div>';
  if(LIB.err) h += '<div class="hubcard hubbad">' + esc(LIB.err) + '</div>';
  if(!LIB.fb || !LIB.authReady || (LIB.user && !LIB.role)) h += '<div class="hubcard"><p class="muted">Đang tải…</p></div>';
  else if(!LIB.user) h += hubWelcomeHTML();
  else if(LIB.role === "none") h += '<div class="hubcard"><h2>Chưa tạo được tài khoản</h2><p>Máy chủ còn dùng luật bảo mật cũ nên chưa cho tự đăng ký. Quản trị mở Firebase Console → Firestore Database → Rules, dán luật mới trong file firestore.rules.example rồi bấm Publish. Sau đó tải lại trang.</p><button class="btn quiet" type="button" id="hub-out">Đăng xuất</button></div>';
  else if(LIB.role === "blocked") h += '<div class="hubcard"><h2>Tài khoản đã bị khoá</h2><p>Liên hệ quản trị nhóm nếu đây là nhầm lẫn.</p><button class="btn quiet" type="button" id="hub-out">Đăng xuất</button></div>';
  else {
    if(PRJ.busy || LIB.loading) h += '<div class="hubbusy">Đang cập nhật…</div>';
    if(PRJ.msg) h += '<div class="hubcard hubwarn">' + esc(PRJ.msg) + '</div>';
    if(PRJ.err === "rules") h += '<div class="hubcard hubbad">Máy chủ chưa cho đọc, ghi dự án. Quản trị dán luật mới trong file firestore.rules.example vào Firebase (Firestore Database → Rules → Publish) rồi tải lại trang.</div>';
    else if(PRJ.err) h += '<div class="hubcard hubbad">' + esc(PRJ.err) + '</div>';
    var p = HUB.page === "duan-ct" ? prjById(PRJ.cur) : null;
    if(HUB.page === "duan-ct" && p) h += prjDetailHTML(p);
    else if(HUB.page === "duan" || HUB.page === "duan-ct") h += prjListHTML();
    else if(HUB.page === "hoso") h += hubProfileHTML();
    else if(HUB.page === "tv" && libIsAdmin()) h += hubMembersHTML();
    else if(HUB.page === "dd" || HUB.page === "dd-ct") h += forumHTML();
    else h += hubTasksHTML();
  }
  h += '</main>';
  if(HUB.ask) h += '<div class="hubmodal"><div class="hubcard"><p>' + HUB.ask.text + '</p><div class="hubbtns">' + HUB.ask.btns.map(function(b, i){ return '<button class="btn ' + (b.cls || "") + '" type="button" data-hubask="' + i + '">' + esc(b.label) + '</button>'; }).join("") + '<button class="btn quiet" type="button" data-hubask="x">Huỷ</button></div></div></div>';
  var keep = {}; el.querySelectorAll("input[id], textarea[id]").forEach(function(i){ if(i.type !== "checkbox" && i.type !== "radio" && i.value && /^(prj-n|prj-nr|prj-nl|prj-nw|prj-ns|prj-d|prj-inv|prj-sstart|prj-bdue|prj-setn)$/.test(i.id)) keep[i.id] = i.value; });
  var keepDays = {}; el.querySelectorAll("[data-prjdays]").forEach(function(i){ if(i.value) keepDays[i.getAttribute("data-prjdays")] = i.value; });
  var keepSel = {}; ["prj-brole","prj-bwho","prj-bduerole"].forEach(function(k){ var i = el.querySelector("#" + k); if(i) keepSel[k] = i.value; });
  el.innerHTML = h;
  Object.keys(keep).forEach(function(k){ var i = document.getElementById(k); if(i && !i.value) i.value = keep[k]; });
  Object.keys(keepDays).forEach(function(k){ var i = el.querySelector('[data-prjdays="' + k + '"]'); if(i && !i.value) i.value = keepDays[k]; });
  Object.keys(keepSel).forEach(function(k){ var i = el.querySelector("#" + k); if(i) i.value = keepSel[k]; });
  prjAfterRender(el);
}
function hubWelcomeHTML(){
  return '<div class="hubhero"><h1>Cùng soạn đề, rõ ai làm gì</h1><p>Đăng nhập bằng tài khoản Google. Lần đầu đăng nhập, trang tự tạo tài khoản cho bạn; không cần ai thêm email trước.</p><ul class="hubpoints"><li><b>Soạn bài:</b> từ chủ đề, nguồn đến câu hỏi và phiếu nộp, có AI hỗ trợ và máy kiểm theo QĐ 730.</li><li><b>Việc của tôi:</b> bài nào đang đến lượt bạn, hạn khi nào.</li><li><b>Dự án:</b> người tạo dự án là Điều phối, mời thành viên, giao việc nhiều bài cùng lúc.</li><li><b>Tiến độ:</b> bài nào đang ở ai, bài nào quá hạn, ai đang nhiều việc.</li><li><b>Diễn đàn:</b> hỏi nhanh, chia sẻ kinh nghiệm, thả cảm xúc.</li></ul><button class="btn primary big" type="button" id="hub-in">Đăng nhập bằng Google</button><p class="small muted">Bài trong dự án chỉ người được mời vào dự án mới mở được.</p></div>';
}
function hubStat(n, label, cls){ return '<div class="hubstat ' + (cls || "") + '"><b>' + n + '</b><span>' + label + '</span></div>'; }
var PRJ_ROLECLS = {coord:"rc0", nl:"rc1", tdnl:"rc2", ch:"rc3", tdch:"rc4"};
function prjStCls(x){ var s = prjSt(x); if(!s) return "s0"; if(s === "Đã hoàn thiện") return "s5"; if(s === "Thay bài / Loại") return "s6"; if(/^Chờ|đã duyệt$/.test(s) || s === "Chủ đề đề xuất") return "s3"; if(/câu hỏi/i.test(s) || s === "Ngữ liệu đã duyệt (khoá)") return "s2"; return "s1"; }
function prjTaskCard(t, withPrj){
  var p = prjById(t.x.prj), ph = prjPhaseDueOf(t.x, t.r, p), d = ph.d, late = d && d < prjToday() && !prjDone(t.x) && t.s !== "done";
  return '<div class="htask ' + PRJ_ROLECLS[t.r] + '"><div class="htaskm"><div class="htaskt">' + esc(prjLabel(t.x) || t.x.title) + '</div><div class="htaskmeta"><span class="hrole ' + PRJ_ROLECLS[t.r] + '">' + esc(WF_ROLES[t.r]) + '</span><span class="hst ' + prjStCls(t.x) + '">' + esc(prjStLabel(t.x)) + '</span>' + prjDueChip(d, t.s !== "done" && !prjDone(t.x), ph.label) + (withPrj && t.x.prj ? '<span class="muted small">' + esc(prjName(t.x.prj)) + '</span>' : '') + ((t.x.meta || {}).topic ? '<span class="muted small">' + esc(t.x.meta.topic) + '</span>' : '') + '</div>' + prjProgHTML(t.x) + '</div><button class="btn' + (t.s === "now" ? " primary" : " quiet") + '" type="button" data-prjitem="' + esc(t.x.id) + '">' + (t.s === "now" ? "Làm tiếp →" : "Mở bài") + '</button></div>';
}
/* Việc của tôi xếp dạng cây: Dự án → Bộ đề → việc; nhớ nhánh nào đang mở, đóng */
var PRJ_TREE_OPEN = {};
function prjMineTree(list, withPrj, grp, sorter){
  var today = prjToday(), byP = {}, order = [];
  list.forEach(function(t){
    var pid = t.x.prj || "", set = ((t.x.meta || {}).set) || "(chưa gắn bộ đề)";
    if(!byP[pid]){ byP[pid] = {sets:{}, order:[], n:0, late:0}; order.push(pid); }
    var P = byP[pid]; if(!P.sets[set]){ P.sets[set] = []; P.order.push(set); }
    P.sets[set].push(t); P.n++;
    var d = t.s === "now" ? prjRoleDue(t.x, t.r) : ""; if(d && d < today) P.late++;
  });
  var nat = function(a, b){ return a.localeCompare(b, "vi", {numeric:true}); };
  var node = function(key, sum, body, dflt){ var o = PRJ_TREE_OPEN[key]; return '<details class="ptn" data-tree="' + esc(key) + '"' + ((o === undefined ? dflt : o) ? " open" : "") + '><summary>' + sum + '</summary><div class="ptnb">' + body + '</div></details>'; };
  var nSets = order.reduce(function(n, pid){ return n + byP[pid].order.length; }, 0), setOpen = nSets <= 1;
  var setsHTML = function(pid, P){
    // dự án chỉ có một bộ đề trong nhóm này: hiện thẳng các việc, không thêm tầng bộ đề
    if(P.order.length === 1) return P.sets[P.order[0]].slice().sort(sorter).map(function(t){ return prjTaskCard(t, false); }).join("");
    return P.order.sort(nat).map(function(set){
      var ts = P.sets[set].slice().sort(sorter), kind = prjKindOf((prjById(pid) || {}), set);
      var lateN = ts.filter(function(t){ var d = t.s === "now" ? prjRoleDue(t.x, t.r) : ""; return d && d < today; }).length;
      var parts = ts.slice().sort(function(a, b){ return nat(prjLabel(a.x) || "", prjLabel(b.x) || ""); }).map(function(t){ var nd = prjNode((t.x.meta || {}).spec, (t.x.meta || {}).slot); return (nd.sub || nd.part || "") + " (" + (PRJ_SHORT[t.r] || t.r) + ")"; });
      return node(grp + "|" + pid + "|" + set, '<span class="ptnset">' + (PRJ_ICO[kind] || "") + esc(set) + '</span> <span class="muted small">' + ts.length + ' việc: ' + esc(parts.join(", ")) + '</span>' + (lateN ? ' <span class="hdue late">' + lateN + ' quá hạn</span>' : ''), ts.map(function(t){ return prjTaskCard(t, false); }).join(""), setOpen);
    }).join("");
  };
  if(!withPrj){ var only = order[0]; return only === undefined ? "" : setsHTML(only, byP[only]); }
  return order.sort(function(a, b){ return nat((prjById(a) || {}).name || "", (prjById(b) || {}).name || ""); }).map(function(pid){
    var P = byP[pid], p = prjById(pid) || {name:"(không thuộc dự án)"};
    return node(grp + "|" + pid, '<span class="ptnprj">' + esc(p.name) + '</span> <span class="muted small">' + P.n + ' việc</span>' + (P.late ? ' <span class="hdue late">' + P.late + ' quá hạn</span>' : ''), setsHTML(pid, P), true);
  }).join("");
}
function prjKindOf(p, set){ var k = (p.setKinds || {})[set]; if(k) return k; var m = /đọc|read/i.test(set) ? "R" : /nghe|listen/i.test(set) ? "L" : /viết|writ/i.test(set) ? "W" : /nói|speak/i.test(set) ? "S" : ""; return m; }
function prjMineHTML(list, withPrj){
  var g = {now:[], later:[], done:[]};
  list.forEach(function(t){ if(g[t.s]) g[t.s].push(t); });
  var byTitle = function(a, b){ return (prjLabel(a.x) || a.x.title || "").localeCompare(prjLabel(b.x) || b.x.title || "", "vi", {numeric:true}); };
  var byDue = function(a, b){ var da = prjRoleDue(a.x, a.r) || "9", db = prjRoleDue(b.x, b.r) || "9"; return da < db ? -1 : da > db ? 1 : byTitle(a, b); };
  if(!list.length) return '<div class="hubempty">Chưa được giao việc nào. Khi Điều phối giao việc, việc sẽ hiện ở đây.</div>';
  var h = '<h3 class="hubh">Đến lượt bạn <span class="muted">(' + g.now.length + ')</span></h3>' + (g.now.length ? prjMineTree(g.now, withPrj, "now", byDue) : '<div class="hubempty">Không có việc đang chờ bạn. Nghỉ tay chút nhé.</div>');
  var o = function(k){ return PRJ_TREE_OPEN[k] ? " open" : ""; };
  h += '<details class="hubdet" data-tree="later"' + o("later") + '><summary>Sắp tới <span class="muted">(' + g.later.length + ', bài chưa đến bước của bạn)</span></summary>' + prjMineTree(g.later, withPrj, "later", byDue) + '</details>';
  h += '<details class="hubdet" data-tree="done"' + o("done") + '><summary>Đã xong <span class="muted">(' + g.done.length + ')</span></summary>' + prjMineTree(g.done, withPrj, "done", byTitle) + '</details>';
  return h;
}
document.addEventListener("toggle", function(e){ var t = e.target; if(t && t.getAttribute && t.hasAttribute("data-tree")) PRJ_TREE_OPEN[t.getAttribute("data-tree")] = t.open; }, true);
function hubTasksHTML(){
  var me = prjMe(), all = prjMineAll(), today = prjToday();
  var n = function(s){ return all.filter(function(t){ return t.s === s; }).length; }, late = all.filter(function(t){ var d = t.s === "now" ? prjRoleDue(t.x, t.r) : ""; return t.s !== "done" && t.s !== "stop" && d && d < today; }).length;
  var h = '<div class="hubhello"><div>' + avatar(me, true) + '</div><div><h2>Chào ' + esc(peopleName(me)) + '</h2><p class="muted">' + (n("now") ? "Bạn có " + n("now") + " việc đang đến lượt." : "Hôm nay chưa có việc nào đến lượt bạn.") + '</p></div></div>';
  if(LIB.me && !LIB.me.setup) h += '<div class="hubcard hubtip"><b>Chào mừng bạn vào nhóm!</b> Điền vài dòng hồ sơ (tên hiển thị, chức danh, kỹ năng phụ trách) để Điều phối dễ giao việc. <button class="btn sm" type="button" data-hubpage="hoso">Cập nhật hồ sơ</button></div>';
  h += '<div class="hubstats">' + hubStat(n("now"), "Đến lượt", "a") + hubStat(n("later"), "Sắp tới", "") + hubStat(late, "Quá hạn", late ? "b" : "") + hubStat(n("done"), "Đã xong", "g") + '</div>';
  h += prjMineHTML(all, true);
  if(!(PRJ.list || []).filter(prjVisible).length) h += '<div class="hubcard hubtip">Bạn chưa ở dự án nào. Tạo dự án mới thì bạn là Điều phối; hoặc chờ người khác mời. <button class="btn sm" type="button" data-hubpage="duan">Sang Dự án</button></div>';
  return h;
}
function prjEntryHTML(){
  var now = (PRJ.list && LIB.user) ? prjMineAll().filter(function(t){ return t.s === "now"; }).length : 0;
  return '<div class="prjentry"><b>Nhóm</b> <span class="small muted">việc của tôi, dự án, phân công' + (now ? " · " + now + " việc đến lượt bạn" : "") + '</span> <button class="btn" type="button" id="hub-open">Mở trang Nhóm</button></div>';
}
function prjBar(done, total){ var pc = total ? Math.round(done * 100 / total) : 0; return '<div class="prjbar" title="' + done + '/' + total + ' bài hoàn thiện"><span style="width:' + pc + '%"></span></div><div class="small muted">' + done + '/' + total + ' bài hoàn thiện</div>'; }
function prjListHTML(){
  var vis = (PRJ.list || []).filter(prjVisible), today = prjToday();
  var h = '<div class="hubrow"><h2>Dự án</h2><button class="btn primary" type="button" id="prj-newtoggle">+ Dự án mới</button></div>';
  if(HUB.newOpen || !vis.length) h += '<div class="hubcard"><h3>Tạo dự án mới</h3><p class="small muted">' + (libIsAdmin() ? 'Quản trị tạo dự án và giao Điều phối cho một người; để trống ô Điều phối thì bạn làm Điều phối. ' : 'Bạn là Điều phối của dự án mình tạo. ') + 'Điều phối mời thành viên, tạo khung bài, giao việc và duyệt cổng 1, cổng 4.</p><div class="prjform">'
    + '<label class="small">Tên dự án<input type="text" id="prj-n" placeholder="Ví dụ: Đợt soạn tháng 12/2026"></label>'
    + '<div class="prjrow"><label class="small">Số đề Đọc<input type="number" min="0" max="20" id="prj-nr" placeholder="0" class="prjdays"></label><label class="small">Số đề Nghe<input type="number" min="0" max="20" id="prj-nl" placeholder="0" class="prjdays"></label><label class="small">Số đề Viết<input type="number" min="0" max="20" id="prj-nw" placeholder="0" class="prjdays"></label><label class="small">Số đề Nói<input type="number" min="0" max="20" id="prj-ns" placeholder="0" class="prjdays"></label><span class="small muted">Trang đặt tên Đề Đọc 01, Đề Nghe 01, Đề Viết 01, Đề Nói 01…; thêm, bớt sau ở mục Thiết lập được.</span></div>'
    + '<label class="small">Hạn hoàn thành dự án<input type="date" id="prj-d"></label>'
    + (libIsAdmin() ? '<label class="small">Điều phối (để trống: bạn làm Điều phối)<input type="text" id="prj-c" list="prj-coords" placeholder="Email Google của người làm Điều phối">' + prjStaffList("prj-coords") + '</label>' : '')
    + '<div class="hubbtns"><button class="btn primary" type="button" id="prj-new">Tạo dự án</button>' + (vis.length ? '<button class="btn quiet" type="button" id="prj-newtoggle">Đóng</button>' : '') + '</div></div></div>';
  if(!vis.length) return h + '<div class="hubempty">Bạn chưa ở dự án nào. Tạo dự án ở trên, hoặc chờ Điều phối của dự án khác mời bạn.</div>';
  h += '<div class="hgrid">' + vis.map(function(p){
    var xs = prjItems(p.id).filter(function(x){ return !prjStop(x); }), done = xs.filter(prjDone).length, late = xs.filter(function(x){ var d = prjStageDue(x, p); return d && d < today && !prjDone(x); }).length;
    var mine = prjMineAll().filter(function(t){ return t.x.prj === p.id && t.s === "now"; }).length;
    return '<div class="hpcard" data-prjgo="' + esc(p.id) + '" role="button" tabindex="0"><div class="hpname">' + esc(p.name) + '</div><div class="small muted">' + avatar(p.owner) + ' Điều phối: ' + esc(peopleName(p.owner)) + (p.owner === prjMe() ? " (bạn)" : "") + '</div>'
      + '<div class="hpmeta">' + prjDueChip(p.due, done < xs.length) + '<span class="muted small">' + (p.sets || []).length + ' bộ đề · ' + xs.length + ' bài</span>' + (late ? '<span class="hdue late">' + late + ' bài quá hạn</span>' : '') + (mine ? '<span class="hrole rc1">' + mine + ' việc của bạn</span>' : '') + '</div>'
      + prjBar(done, xs.length) + '<div class="hpfoot">' + avatars(prjPeople(p.id)) + '<span class="hplink">Mở →</span></div></div>';
  }).join("") + '</div>';
  return h;
}
function prjDetailHTML(p){
  var coord = prjIsCoord(p), tabs = [["tien-do","Tổng quan"],["phan-cong","Phân công"],["viec","Việc của tôi"],["thiet-lap", coord ? "Thành viên và thiết lập" : "Thành viên"]];
  var h = '<div class="hpdhead"><button class="btn quiet sm" type="button" id="prj-home">← Dự án</button><div class="hpdtitle"><h2>' + esc(p.name) + '</h2><div class="small muted">' + avatar(p.owner) + ' Điều phối: ' + esc(peopleName(p.owner)) + (p.owner === prjMe() ? " (bạn)" : coord ? " · bạn là quản trị" : "") + (p.due ? ' · hạn ' + esc(prjFmt(p.due)) : '') + '</div></div><div class="hpdppl">' + avatars(prjPeople(p.id), 8) + '</div></div>';
  h += '<div class="hubtabs">' + tabs.map(function(t){ return '<button type="button" class="' + (PRJ.tab === t[0] ? "on" : "") + '" data-prjtab="' + t[0] + '">' + t[1] + (t[0] === "phan-cong" && Object.keys(PRJ.edit).length ? " · " + Object.keys(PRJ.edit).length + " chưa lưu" : "") + '</button>'; }).join("") + '<button type="button" id="prj-reload" title="Tải lại">↻</button></div>';
  if(PRJ.tab === "phan-cong") return h + prjBoardHTML(p, coord);
  if(PRJ.tab === "viec") return h + prjMineHTML(prjMineAll().filter(function(t){ return t.x.prj === p.id; }), false);
  if(PRJ.tab === "thiet-lap") return h + prjSetupHTML(p, coord);
  return h + prjProgressHTML(p);
}
function prjProgressHTML(p){
  var all = prjItems(p.id), xs = all.filter(function(x){ return !prjStop(x); }), today = prjToday();
  if(!all.length) return '<div class="hubempty">Dự án chưa có bài. ' + (prjIsCoord(p) ? '<button class="btn sm" type="button" data-prjtab="thiet-lap">Tạo khung bài</button>' : 'Điều phối sẽ tạo khung bài.') + '</div>';
  var cnt = {}; all.forEach(function(x){ var s = prjStLabel(x); cnt[s] = (cnt[s] || 0) + 1; });
  var order = ["Chưa bắt đầu"].concat(WF_ST), done = xs.filter(prjDone).length;
  var lateN = xs.filter(function(x){ var d = prjStageDue(x, p); return d && d < today && !prjDone(x); }).length;
  var h = '<div class="hubstats">' + hubStat(xs.length, "Bài", "") + hubStat(done, "Hoàn thiện", "g") + hubStat(xs.length - done, "Đang làm", "a") + hubStat(lateN, "Quá hạn", lateN ? "b" : "") + '</div>';
  h += '<div class="hubcard">' + prjBar(done, xs.length) + '<div class="hchips">' + order.filter(function(s){ return cnt[s]; }).map(function(s){ var fake = {wf:{st:s === "Chưa bắt đầu" ? "" : s}}; return '<span class="hst ' + prjStCls(fake) + '">' + esc(s) + ' · ' + cnt[s] + '</span>'; }).join("") + '</div></div>';
  var att = [];
  xs.forEach(function(x){
    if(prjDone(x)) return;
    var why = [], ho = prjHolder(x), d = prjStageDue(x, p), w = x.wf || {}, rs = w.rounds || {};
    var dl = d ? prjDaysLeft(d) : null;
    var late = dl !== null && dl < 0 && ho.role && ho.role !== "coord";
    if(dl !== null && dl < 0) why.push((ho.role ? "phần " + PRJ_SHORT[ho.role] + " " : "") + "quá hạn " + (-dl) + " ngày (hạn " + prjFmt(d) + ")" + (ho.who && ho.role !== "coord" ? " · " + prjShort(ho.who) : ""));
    else if(dl !== null && dl <= 3 && ho.role) why.push("phần " + PRJ_SHORT[ho.role] + " " + prjLeftText(dl) + " (hạn " + prjFmt(d) + ")");
    if(ho.role && !ho.who) why.push("chưa có " + WF_ROLES[ho.role] + " (đang đến lượt vai này)");
    if((rs.nl || 0) >= WF_MAXROUND && /ngữ liệu/.test(prjSt(x))) why.push("ngữ liệu đã trả sửa " + rs.nl + " lần: lần sau Điều phối quyết");
    if((rs.ch || 0) >= WF_MAXROUND && /Câu hỏi cần sửa|Chờ thẩm định câu hỏi/.test(prjSt(x))) why.push("câu hỏi đã trả sửa " + rs.ch + " lần: lần sau Điều phối quyết");
    if(w.req) why.push("người soạn câu hỏi yêu cầu sửa ngữ liệu (" + w.req + ")" + (w.reqNote ? ": “" + w.reqNote.slice(0, 90) + (w.reqNote.length > 90 ? "…" : "") + "”" : "") + " · có thể cần dời hạn phần câu hỏi");
    if(ho.role === "coord") why.push("chờ Điều phối duyệt");
    if(why.length) att.push({x:x, why:why, late:late, dl:dl, ho:ho, d:d});
  });
  var coord = prjIsCoord(p), lateAll = att.filter(function(a){ return a.late && a.ho.who; });
  h += '<div class="hubrow"><h3 class="hubh">Cần để ý <span class="muted">(' + att.length + ')</span></h3>' + (coord && lateAll.length ? '<a class="btn sm" target="_blank" rel="noopener" href="' + esc(prjLateMail(p, lateAll)) + '">✉️ Nhắc qua Gmail ' + prjUniq(lateAll.map(function(a){ return a.ho.who; })).length + ' người đang trễ</a>' : '') + '</div>'
    + (att.length ? att.map(function(a){ return prjAttnRow(p, a, coord); }).join("") : '<div class="hubempty">Không có bài quá hạn, sắp đến hạn, thiếu người hay chờ Điều phối.</div>');
  var sets = {}; all.forEach(function(x){ var s = (x.meta || {}).set || "(chưa gắn bộ đề)"; (sets[s] = sets[s] || []).push(x); });
  h += '<h3 class="hubh">Theo bộ đề</h3>' + Object.keys(sets).map(function(s){
    var ys = sets[s], dn = ys.filter(prjDone).length, tot = ys.filter(function(x){ return !prjStop(x); }).length;
    return '<details class="hubdet"><summary><b>' + esc(s) + '</b> <span class="muted">· ' + dn + '/' + tot + ' hoàn thiện</span></summary><table class="libtab htab"><tr><th>Bài</th><th>Trạng thái</th><th>Đang ở ai</th><th></th></tr>' + ys.map(function(x){
      var ho = prjHolder(x), d = prjStageDue(x, p), days = prjDays(x), late = d && d < today && !prjDone(x);
      return '<tr><td><b>' + esc(prjShortLabel(x)) + '</b>' + ((x.meta || {}).topic ? '<div class="small muted">' + esc(x.meta.topic) + '</div>' : '') + '</td><td><span class="hst ' + prjStCls(x) + '">' + esc(prjStLabel(x)) + '</span>' + (days !== null && !prjDone(x) ? '<div class="small muted">ở trạng thái này ' + days + ' ngày</div>' : '') + prjProgHTML(x) + (d ? '<div>' + prjDueChip(d, !prjDone(x), ho.role && ho.role !== "coord" ? "Hạn " + PRJ_SHORT[ho.role] : "Hạn") + '</div>' : '') + '</td><td class="small">' + (ho.role ? (ho.who && ho.role !== "coord" || (ho.role === "coord" && ((x.wf || {}).as || {}).coord) ? avatar(ho.who) + ' ' + esc(prjShort(ho.who)) : esc(ho.who) || '<span class="no">chưa phân công</span>') + '<div class="muted">' + esc(WF_ROLES[ho.role]) + '</div>' : '<span class="muted">—</span>') + '</td><td><button class="btn quiet sm" type="button" data-prjitem="' + esc(x.id) + '">Mở bài</button></td></tr>';
    }).join("") + '</table></details>';
  }).join("");
  var L = {};
  prjPeople(p.id).forEach(function(e){ L[e] = {now:0, later:0, done:0, roles:{}}; });
  all.forEach(function(x){ var as = (x.wf && x.wf.as) || {}; PRJ_ROLES.forEach(function(r){ var e = as[r]; if(!e) return; if(!L[e]) L[e] = {now:0, later:0, done:0, roles:{}, out:true}; var s = prjRoleState(x, r); if(L[e][s] !== undefined) L[e][s]++; L[e].roles[r] = (L[e].roles[r] || 0) + 1; }); });
  all.forEach(function(x){ var st = x.stats || {}; Object.keys(st.late || {}).forEach(function(e){ if(L[e]) L[e].late = (L[e].late || 0) + st.late[e]; }); Object.keys(st.ext || {}).forEach(function(e){ if(L[e]) L[e].ext = (L[e].ext || 0) + st.ext[e]; }); });
  h += '<h3 class="hubh">Việc của từng người</h3><div class="hgrid sm">' + Object.keys(L).map(function(e){ var o = L[e]; return '<div class="hpcard flat"><div class="hpp">' + avatar(e) + '<div><b>' + esc(prjShort(e)) + '</b>' + (e === p.owner ? ' <span class="small muted">Điều phối</span>' : '') + (o.out ? ' <span class="small warnc">không còn trong dự án</span>' : '') + '<div class="small muted">' + esc(((PEOPLE[e] || {}).title) || "") + '</div></div></div><div class="hpcount"><span><b>' + o.now + '</b> đến lượt</span>' + (o.late ? '<span class="no"><b>' + o.late + '</b> lần trễ hạn</span>' : '') + (o.ext ? '<span class="warnc"><b>' + o.ext + '</b> lần gia hạn</span>' : '') + '<span><b>' + o.later + '</b> sắp tới</span><span><b>' + o.done + '</b> đã xong</span></div><div class="small muted">' + (PRJ_ROLES.filter(function(r){ return o.roles[r]; }).map(function(r){ return PRJ_SHORT[r] + " " + o.roles[r]; }).join(" · ") || "chưa nhận việc") + '</div></div>'; }).join("") + '</div>';
  return h;
}
function prjUniq(a){ return a.filter(function(v, i){ return v && a.indexOf(v) === i; }); }
// tiến độ: thanh các bước (xanh = đã xác nhận xong) + lần lưu cuối
function prjAgo(ts){
  var t = ts && ts.toDate ? ts.toDate().getTime() : (typeof ts === "number" ? ts : 0); if(!t) return "";
  var m = Math.floor((Date.now() - t) / 6e4), d = new Date(t), p = function(n){ return String(n).padStart(2, "0"); }, hm = p(d.getHours()) + ":" + p(d.getMinutes());
  if(m < 1) return "vừa xong"; if(m < 60) return m + " phút trước";
  var t0 = new Date(); t0.setHours(0, 0, 0, 0); var day = Math.floor((t0.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 864e5);
  return day <= 0 ? hm + " hôm nay" : (day === 1 ? hm + " hôm qua" : hm + " " + p(d.getDate()) + "/" + p(d.getMonth() + 1));
}
function prjProgHTML(x){
  var P = x.prog, saved = (x.rev || 0) > 1 || (x.updatedBy && x.updatedBy !== x.owner);
  var bar = "", txt = "";
  if(P && P.length){
    var dn = P.filter(function(s){ return s.d; }).length, nx = P.filter(function(s){ return !s.d; })[0];
    bar = '<span class="hprog" title="' + esc(P.map(function(s, i){ return (i + 1) + ". " + s.n + (s.d ? " ✓" : ""); }).join("\n")) + '">' + P.map(function(s){ return '<i class="' + (s.d ? "on" : (s === nx ? "nx" : "")) + '"></i>'; }).join("") + '</span>';
    var busy = /^(|Chủ đề đề xuất|Đang adapt|Ngữ liệu cần sửa|Đang soạn câu hỏi|Câu hỏi cần sửa|Ngữ liệu đã duyệt \(khoá\))$/.test(prjSt(x));
    txt = '<b>' + dn + '/' + P.length + '</b> bước xong' + (nx && busy && (dn || saved) ? ' · đang ở bước ' + esc(nx.n) : '');
  }
  var who = x.updatedByName || (x.updatedBy ? prjShort(x.updatedBy) : "");
  return '<div class="hprogrow">' + bar + (txt ? '<span class="small">' + txt + '</span>' : '') + '<span class="small muted">' + (saved ? (prjAgo(x.updatedAt) ? 'lưu lần cuối ' + esc(prjAgo(x.updatedAt)) : 'đã lưu') + (who ? ' · ' + esc(who) : '') : 'chưa ai lưu bài này') + '</span></div>';
}
// một dòng ở mục Cần để ý; bài trễ có nút Gia hạn, Giao người khác, Nhắc (Điều phối)
function prjAttnRow(p, a, coord){
  var x = a.x, act = PRJ.act && PRJ.act.id === x.id ? PRJ.act.kind : "", ho = a.ho;
  var h = '<div class="htask rc0' + (a.late ? " lateRow" : "") + '"><div class="htaskm"><div class="htaskt">' + esc(prjLabel(x)) + '</div><div class="htaskmeta"><span class="hst ' + prjStCls(x) + '">' + esc(prjStLabel(x)) + '</span>' + a.why.map(function(w){ return '<span class="hwhy' + (/quá hạn/.test(w) ? " bad" : "") + '">' + esc(w) + '</span>'; }).join("") + '</div>' + prjProgHTML(x);
  if(coord && act === "ext"){
    var key = prjPhaseKey(x, ho.role), cur = a.d || "";
    h += '<div class="prjact"><b class="small">Gia hạn phần ' + esc(WF_ROLES[ho.role]) + '</b><div class="prjrow"><label class="small">Hạn mới<input type="date" id="prj-xd" value="' + esc(cur && prjDaysLeft(cur) < 0 ? prjAddDays(prjToday(), 2) : cur) + '" min="' + esc(prjToday()) + '"></label><label class="small" style="flex:1 1 220px">Lý do (ghi vào nhật ký của bài)<input type="text" id="prj-xr" placeholder="Ví dụ: nguồn phải đổi, người soạn ốm"></label></div>'
      + '<label class="small"><input type="checkbox" id="prj-xs" checked> Dời các phần sau cùng số ngày</label> <label class="small"><input type="checkbox" id="prj-xf"> Dời cả hạn hoàn thiện</label>'
      + '<div class="hubbtns"><button class="btn primary sm" type="button" data-prjxsave="' + esc(x.id) + '">Lưu gia hạn</button><button class="btn quiet sm" type="button" data-prjxcancel="1">Huỷ</button></div><div class="small muted">Phần đang tính: ' + esc(key === "due" ? "hạn hoàn thiện" : "hạn " + WF_ROLES[key]) + (cur ? " (" + prjFmt(cur) + ")" : "") + '.</div></div>';
  }
  if(coord && act === "re"){
    h += '<div class="prjact"><b class="small">Giao phần ' + esc(WF_ROLES[ho.role]) + ' cho người khác</b><div class="prjrow"><select id="prj-ra">' + prjPeople(p.id).filter(function(e){ return e !== ho.who; }).map(function(e){ return '<option value="' + esc(e) + '">' + esc(prjShort(e)) + '</option>'; }).join("") + '</select><input type="text" id="prj-rr" placeholder="Lý do (ghi vào nhật ký)" style="flex:1 1 220px"></div><p class="small muted">Phần đã làm trong bài vẫn giữ nguyên; người mới làm tiếp. Cả hai người đều nhận thông báo.</p><div class="hubbtns"><button class="btn primary sm" type="button" data-prjrsave="' + esc(x.id) + '">Giao lại</button><button class="btn quiet sm" type="button" data-prjxcancel="1">Huỷ</button></div></div>';
  }
  h += '</div><div class="prjattbtns"><button class="btn quiet sm" type="button" data-prjitem="' + esc(x.id) + '">Mở bài</button>' + (coord && ho.role && ho.role !== "coord" && a.d ? '<button class="btn sm" type="button" data-prjext="' + esc(x.id) + '">Gia hạn</button>' : '') + (coord && ho.role && ho.role !== "coord" ? '<button class="btn sm" type="button" data-prjre="' + esc(x.id) + '">Giao người khác</button>' : '') + (coord && ho.who && ho.role !== "coord" && a.d && a.dl !== null && a.dl <= 3 ? '<button class="btn sm" type="button" data-prjnudge="' + esc(x.id) + '">🔔 Nhắc</button>' : '') + '</div></div>';
  return h;
}
// khoá hạn của phần đang làm (bị trả sửa thì là hạn người thẩm định)
function prjPhaseKey(x, r){ var w = x.wf || {}, st = w.st || "", rq = w.req || "";
  if(r === "nl" && (st === "Ngữ liệu cần sửa" || rq === "chờ sửa" || rq === "đang sửa")) return "tdnl";
  if(r === "ch" && st === "Câu hỏi cần sửa") return "tdch";
  return r === "coord" ? "due" : r; }
function prjDaysBetween(a, b){ return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 864e5); }
// ghi phân công của một bài (không đụng nội dung bài); extra = trường thêm (thống kê)
function prjPatchAsg(p, x, as, dues, due, note, extra){
  var fb = LIB.fb, me = prjMe(), now = Date.now();
  Object.keys(dues).forEach(function(r){ if(!dues[r]) delete dues[r]; }); if(!as.coord) as.coord = p.owner;
  var rec = {asg:{as:as, at:now, by:me, due:due, dues:dues, note:note || ""}, due:due, wf:Object.assign({st:"", req:"", lockVer:0, rounds:{nl:0, ch:0}, stAt:0}, x.wf || {}, {as:as, due:due, dues:dues})};
  Object.keys(extra || {}).forEach(function(k){ rec[k] = extra[k]; });
  PRJ.busy = true; hubRender();
  return fb.updateDoc(fb.doc(LIB.db, "materials", x.id), rec).then(function(){ PRJ.act = null; return prjReload(); }).catch(prjErr);
}
function prjExtend(p, x, nd, reason, shift, shiftFin){
  var ho = prjHolder(x), key = prjPhaseKey(x, ho.role), dues = prjDues(x), fin = prjDue(x), cur = key === "due" ? prjEffDue(x, p) : (dues[key] || prjEffDue(x, p));
  if(!nd){ PRJ.msg = "Chọn hạn mới."; hubRender(); return; }
  if(!String(reason || "").trim()){ PRJ.msg = "Ghi lý do gia hạn (để cả nhóm biết vì sao lịch đổi)."; hubRender(); return; }
  var delta = cur ? prjDaysBetween(cur, nd) : 0, order = PRJ_DUE_ROLES.concat(["due"]), i = order.indexOf(key);
  if(key === "due") fin = nd; else dues[key] = nd;
  if(shift && delta > 0) order.slice(i + 1).forEach(function(k){ if(k === "due"){ if(shiftFin){ var f0 = prjEffDue(x, p); if(f0) fin = prjAddDays(f0, delta); } } else if(dues[k]) dues[k] = prjAddDays(dues[k], delta); });
  else if(shiftFin && delta > 0 && key !== "due"){ var f1 = prjEffDue(x, p); if(f1) fin = prjAddDays(f1, delta); }
  var bad = prjDueOrderOf(dues, fin || (p && p.due) || "");
  if(bad){ PRJ.msg = "Chưa gia hạn được: " + bad + ". Chọn \"Dời cả hạn hoàn thiện\", hoặc chỉnh tay ở mục Phân công."; hubRender(); return; }
  var st = JSON.parse(JSON.stringify(x.stats || {})); st.ext = st.ext || {}; if(ho.who) st.ext[ho.who] = (st.ext[ho.who] || 0) + 1;
  var as = Object.assign({}, (x.wf && x.wf.as) || {});
  prjPatchAsg(p, x, as, dues, fin, "Gia hạn phần " + WF_ROLES[ho.role] + (cur ? " từ " + prjFmt(cur) : "") + " đến " + prjFmt(nd) + (shift && delta > 0 ? ", dời các phần sau " + delta + " ngày" : "") + ": " + reason, {stats:st}).then(function(){
    if(typeof ntfSend === "function") ntfSend([{to:ho.who, type:"assign", text:peopleName(prjMe()) + " gia hạn phần " + WF_ROLES[ho.role] + " · bài " + prjLabel(x) + " đến " + prjFmt(nd), note:reason, link:{kind:"item", item:x.id, prj:p.id}}]);
    toast("Đã gia hạn.");
  });
}
function prjReassign(p, x, to, reason){
  var ho = prjHolder(x); if(!to){ return; }
  var as = Object.assign({}, (x.wf && x.wf.as) || {}); var old = as[ho.role]; as[ho.role] = to;
  if(prjConflicts(as).hard.length){ PRJ.msg = "Không giao được: " + prjConflicts(as).hard.join("; ") + "."; hubRender(); return; }
  prjPatchAsg(p, x, as, prjDues(x), prjDue(x), "Giao lại phần " + WF_ROLES[ho.role] + " từ " + prjShort(old) + " cho " + prjShort(to) + (reason ? ": " + reason : ""), {}).then(function(){
    if(typeof ntfSend === "function") ntfSend([{to:to, type:"assign", text:peopleName(prjMe()) + " giao bạn phần " + WF_ROLES[ho.role] + " · bài " + prjLabel(x) + " (làm tiếp từ " + prjShort(old) + ")", note:reason, link:{kind:"item", item:x.id, prj:p.id}}, {to:old, type:"back", text:peopleName(prjMe()) + " giao phần " + WF_ROLES[ho.role] + " · bài " + prjLabel(x) + " cho " + prjShort(to), note:reason, link:{kind:"item", item:x.id, prj:p.id}}]);
    toast("Đã giao lại cho " + prjShort(to) + ".");
  });
}
function prjNudge(p, x){
  var ho = prjHolder(x), d = prjStageDue(x, p), n = d ? prjDaysLeft(d) : null;
  if(typeof ntfSend === "function") ntfSend([{to:ho.who, type:"turn", text:peopleName(prjMe()) + " nhắc: phần " + WF_ROLES[ho.role] + " · bài " + prjLabel(x) + (d ? " hạn " + prjFmt(d) + (n !== null ? " (" + prjLeftText(n) + ")" : "") : ""), link:{kind:"item", item:x.id, prj:p.id}}]).then(function(){ toast("Đã gửi nhắc cho " + prjShort(ho.who) + "."); });
}
function prjLateMail(p, list){
  var by = {}; list.forEach(function(a){ (by[a.ho.who] = by[a.ho.who] || []).push(a); });
  var body = "Chào thầy cô,\n\nMột số phần việc trong dự án \"" + p.name + "\" đã quá hạn:\n\n" + Object.keys(by).map(function(e){ return "- " + peopleName(e) + ": " + by[e].map(function(a){ return WF_ROLES[a.ho.role] + " · " + prjLabel(a.x) + " (hạn " + prjFmt(a.d) + ", " + prjLeftText(a.dl) + ")"; }).join("; "); }).join("\n") + "\n\nThầy cô mở trang, vào Việc của tôi để làm tiếp: " + prjSiteUrl() + "\nNếu cần thêm thời gian, thầy cô báo lại để mình gia hạn nhé.\n\nCảm ơn thầy cô!\n" + peopleName(prjMe());
  return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(Object.keys(by).join(",")) + "&su=" + encodeURIComponent("Nhắc hạn · dự án " + p.name) + "&body=" + encodeURIComponent(body);
}
// nhắc hạn tự động: khi có người trong dự án mở trang, gửi nhắc 2 ngày trước, đúng ngày hạn, khi trễ (mỗi mốc một lần, ghi dấu trên bài)
function prjDueSweep(){
  if(!LIB.fb || !hubSigned() || (typeof wfDevOn === "function" && wfDevOn())) return;
  if(PRJ.sweptAt && Date.now() - PRJ.sweptAt < 10 * 60000) return; PRJ.sweptAt = Date.now();
  var fb = LIB.fb, me = prjMe(), out = [];
  LIB.items.forEach(function(x){
    if(!x.prj || prjDone(x) || prjStop(x)) return;
    var p = prjById(x.prj); if(!p) return;
    var ho = prjHolder(x); if(!ho.role || ho.role === "coord" || !ho.who) return;
    var ph = prjPhaseDueOf(x, ho.role, p), d = ph.d; if(!d) return;
    var n = prjDaysLeft(d), kind = n < 0 ? "late" : n === 0 ? "today" : n <= 2 ? "soon" : ""; if(!kind) return;
    var k = ho.role + "|" + kind + "|" + d, rem = x.rem || {}; if(rem[k]) return;
    var lbl = "phần " + WF_ROLES[ho.role] + " · bài " + prjLabel(x), link = {kind:"item", item:x.id, prj:p.id};
    var msg = kind === "late" ? "Quá hạn " + (-n) + " ngày: " + lbl + " (hạn " + prjFmt(d) + ")" : kind === "today" ? "Hôm nay là hạn " + lbl : "Còn " + n + " ngày: " + lbl + " (hạn " + prjFmt(d) + ")";
    out.push({to:ho.who, type:kind === "late" ? "back" : "turn", text:msg, link:link});
    if(kind === "late") out.push({to:p.owner, type:"back", text:prjShort(ho.who) + " trễ hạn " + lbl + " (" + (-n) + " ngày)", link:{kind:"prj", prj:p.id, tab:"tien-do"}});
    var nr = Object.assign({}, rem); nr[k] = Date.now();
    var upd = {rem:nr};
    if(kind === "late"){ var st = JSON.parse(JSON.stringify(x.stats || {})); st.late = st.late || {}; st.late[ho.who] = (st.late[ho.who] || 0) + 1; upd.stats = st; x.stats = st; }
    x.rem = nr; fb.updateDoc(fb.doc(LIB.db, "materials", x.id), upd).catch(function(){});
  });
  if(out.length && typeof ntfSend === "function") ntfSend(out);
}
function prjBoardHTML(p, coord){
  var xs = prjItems(p.id), ppl = prjPeople(p.id), nEd = Object.keys(PRJ.edit).length;
  if(!xs.length) return '<div class="hubempty">Dự án chưa có bài. ' + (coord ? '<button class="btn sm" type="button" data-prjtab="thiet-lap">Tạo khung bài</button>' : '') + '</div>';
  var others = (LIB.staff || []).map(function(x){ return x.role === "blocked" ? "" : x.email; }).filter(function(e){ return e && ppl.indexOf(e) < 0; }).sort(function(a, b){ return prjShort(a).localeCompare(prjShort(b), "vi"); });
  var o1 = function(e, v){ return '<option value="' + esc(e) + '"' + (e === v ? " selected" : "") + '>' + esc(prjShort(e)) + '</option>'; };
  var opt = function(v, empty){ var inP = ppl.concat(v && ppl.indexOf(v) < 0 && others.indexOf(v) < 0 ? [v] : []); return '<option value="">' + (empty || "— chưa giao —") + '</option>' + (others.length ? '<optgroup label="Trong dự án">' : '') + inP.map(function(e){ return o1(e, v); }).join("") + (others.length ? '</optgroup><optgroup label="Ngoài dự án (lưu sẽ mời vào dự án)">' + others.map(function(e){ return o1(e, v); }).join("") + '</optgroup>' : ''); };
  var dis = coord ? "" : " disabled";
  var h = coord ? '<div class="hubcard hubtip small prjhow"><b>Cách dùng:</b> chọn người và hạn ngay trong từng ô của bảng, như bảng tính. Muốn giao cả cột cho một người thì dùng ô <b>Điền cả cột</b> ở dòng đầu bảng. Ô vừa đổi có nền vàng; xong thì bấm <b>Lưu phân công</b> ở đáy màn hình.</div>'
    : '<div class="hubcard hubtip">Chỉ Điều phối của dự án (' + esc(peopleName(p.owner)) + ') đổi phân công. Bạn xem được ai làm gì, hạn khi nào.</div>';
  // bảng chính
  h += '<div class="hubcard flushx"><table class="libtab htab prjboard"><tr class="prjgrp"><th></th><th colspan="2" class="pg-nl">Chặng Ngữ liệu</th><th colspan="2" class="pg-ch">Chặng Câu hỏi</th><th></th></tr><tr><th>Bài</th>' + PRJ_ROLES.map(function(r){ return '<th class="' + prjGrp(r) + '">' + WF_ROLES[r] + '</th>'; }).join("") + '<th>Hạn hoàn thiện</th></tr>';
  if(coord) h += '<tr class="prjfill"><td><b class="small">Điền cả cột</b><div class="small muted">áp cho mọi bài chưa xong</div></td>' + PRJ_ROLES.map(function(r){ return '<td class="' + prjGrp(r) + '"><label><span class="prjlbl">' + PRJ_SHORT[r] + ' </span><select data-prjcol="' + r + '" aria-label="Giao cả cột ' + esc(WF_ROLES[r]) + '">' + opt("", "Giao cả cột cho…") + '</select></label><label class="prjrdue"><span class="small muted">hạn cả cột</span><input type="date" data-prjcoldue="' + r + '"></label></td>'; }).join("") + '<td><label class="prjrdue"><span class="small muted">hạn hoàn thiện cả cột</span><input type="date" data-prjcoldue="due"></label></td></tr>';
  var lastSet = null, lastPart = null;
  xs.forEach(function(x){
    var set = (x.meta || {}).set || "";
    var nd = prjNode((x.meta || {}).spec, (x.meta || {}).slot);
    if(set !== lastSet){ lastSet = set; lastPart = null; h += '<tr class="prjsetrow"><td colspan="6">' + (PRJ_ICO[nd.kind] || "") + '<b>' + esc(set || "(chưa gắn bộ đề)") + '</b></td></tr>'; }
    if(nd.sub && nd.part !== lastPart){ lastPart = nd.part; h += '<tr class="prjpartrow"><td colspan="6"><b>' + esc(nd.part) + '</b> <span class="small muted">' + esc(nd.note) + '</span></td></tr>'; }
    if(!nd.sub) lastPart = null;
    var as = prjAs(x), e = PRJ.edit[x.id] || {as:{}, dues:{}}, cf = prjConflicts(as), done = prjDone(x) || prjStop(x), ord = prjDueOrder(x, p);
    h += '<tr class="' + (cf.hard.length ? "prjbad" : "") + '"><td><b>' + esc(nd.sub ? nd.sub : nd.part) + '</b><div><span class="hst ' + prjStCls(x) + '">' + esc(prjStLabel(x)) + '</span></div>' + (cf.hard.length ? '<div class="small no">' + cf.hard.join("; ") + '</div>' : '') + (cf.soft.length ? '<div class="small warnc">' + cf.soft.join("; ") + '</div>' : '') + (ord ? '<div class="small no">Sai thứ tự hạn: ' + esc(ord) + '</div>' : '') + '</td>'
      + PRJ_ROLES.map(function(r){ if(prjNoRole(x, r)) return '<td class="small muted ' + prjGrp(r) + '">không có phần câu hỏi</td>'; var st = prjRoleState(x, r), rd = prjDues(x)[r] || "", ef = prjRoleDue(x, r, p), late = st === "now" && ef && ef < prjToday(); return '<td class="' + prjGrp(r) + (e.as[r] !== undefined || (e.dues || {})[r] !== undefined ? " prjch" : "") + (st === "now" ? " prjnow" : "") + '"><label><span class="prjlbl">' + PRJ_SHORT[r] + ' </span><select data-prjas="' + esc(x.id) + '|' + r + '"' + dis + (done ? " disabled" : "") + '>' + opt(as[r] || "") + '</select></label><label class="prjrdue"><span class="small muted">xong trước</span><input type="date" data-prjrdue="' + esc(x.id) + '|' + r + '" value="' + esc(rd) + '"' + (function(){ var g = prjDueRange(x, r, p); return (g.lo ? ' min="' + g.lo + '"' : '') + (g.hi ? ' max="' + g.hi + '"' : ''); })() + dis + (done ? " disabled" : "") + '></label>' + (st === "now" ? '<div class="small libok">● đang đến lượt</div>' + (ef ? prjDueChip(ef, true, rd ? "Hạn" : "Hạn bài") : '') : st === "done" ? '<div class="small muted">✓ xong</div>' : '') + '</td>'; }).join("")
      + '<td class="' + (e.due !== undefined ? "prjch" : "") + '"><label><span class="prjlbl">Hạn hoàn thiện </span><input type="date" data-prjdue="' + esc(x.id) + '" value="' + esc(prjDue(x)) + '"' + (function(){ var g = prjDueRange(x, "due", p); return g.lo ? ' min="' + g.lo + '"' : ''; })() + dis + '></label>' + (!prjDue(x) && p.due ? '<div class="small muted">theo dự án ' + esc(prjFmt(p.due)) + '</div>' : '') + '</td></tr>';
  });
  h += '</table></div>';
  if(!coord) return h;
  // làm nhanh: đóng sẵn, mỗi việc một khối có câu giải thích
  h += '<details class="hubdet prjquick"' + (PRJ.quickOpen ? " open" : "") + '><summary>⚡ Làm nhanh (không bắt buộc)</summary>'
    + '<div class="prjqk"><b>Chia đều người cho các ô còn trống</b><p class="small muted">Trang tự điền người vào các ô "chưa giao": ai ít việc nhất được giao trước, không ai thẩm định bài mình soạn, người soạn câu hỏi khác người soạn ngữ liệu nếu đủ người. Điều phối không nhận soạn ngữ liệu (vì Điều phối duyệt cổng 1). Ô đã có người giữ nguyên.</p><button class="btn" type="button" id="prj-auto">✨ Chia đều cho ô còn trống</button></div>'
    + '<div class="prjqk"><b>Lập lịch nối tiếp</b><p class="small muted">Nhập ngày bắt đầu và số ngày cho từng phần; phần sau bắt đầu khi phần trước xong. Trang điền hạn cho mọi bài chưa xong; phần để trống thì giữ hạn cũ.</p><div class="prjrow"><label class="small">Bắt đầu<input type="date" id="prj-sstart"></label>' + PRJ_DUE_ROLES.concat(["coord"]).map(function(r){ return '<label class="small">' + (r === "coord" ? "Điều phối duyệt" : PRJ_SHORT[r]) + '<input type="number" min="0" max="365" class="prjdays" data-prjdays="' + r + '" placeholder="số ngày"></label>'; }).join("") + '<button class="btn" type="button" id="prj-sched">📅 Điền hạn</button></div></div></details>';
  // thanh lưu ghim đáy màn hình, chỉ hiện khi có thay đổi
  if(nEd) h += '<div class="prjsavebar"><span>✏️ Đã đổi <b>' + nEd + '</b> bài, chưa lưu</span><div class="hubbtns"><button class="btn quiet" type="button" id="prj-discard">Bỏ thay đổi</button><button class="btn primary" type="button" id="prj-saveas">Lưu phân công</button></div></div>';
  return h;
}
function prjSetupHTML(p, coord){
  var dis = coord ? "" : " disabled", staff = (LIB.staff || []).map(function(x){ return x.email; }).filter(function(e){ return prjPeople(p.id).indexOf(e) < 0 && (PEOPLE[e] || {}).role !== "blocked"; });
  var pend = prjPeople(p.id).filter(function(e){ return (PEOPLE[e] || {}).missing; });
  var h = '<div class="hubcard"><h3>Thành viên (' + prjPeople(p.id).length + ')</h3>' + (coord && pend.length > 1 ? '<div class="hubtip hubcard small">' + pend.length + ' người chưa đăng nhập lần nào. <a class="btn sm" target="_blank" rel="noopener" href="' + esc(prjInviteMail(p, pend).gmail) + '">✉️ Gửi lời mời cho cả ' + pend.length + ' người qua Gmail</a></div>' : '') + '<div class="hmembers">' + prjPeople(p.id).map(function(e){ var x = PEOPLE[e] || {}, ml = x.missing && coord ? prjInviteMail(p, [e]) : null; return '<div class="hmem">' + avatar(e) + '<div class="hmemt"><b>' + esc(peopleName(e)) + '</b>' + (e === p.owner ? ' <span class="hrole rc0">Điều phối</span>' : '') + (x.missing ? ' <span class="hst s3">chưa đăng nhập lần nào</span>' : '') + (ml ? '<div class="hubbtns"><a class="btn sm" target="_blank" rel="noopener" href="' + esc(ml.gmail) + '">✉️ Gửi lời mời qua Gmail</a><a class="btn quiet sm" href="' + esc(ml.mailto) + '">Ứng dụng thư khác</a></div>' : '') + '<div class="small muted">' + esc([x.title, x.org].filter(Boolean).join(" · ") || e) + '</div>' + ((x.skills || []).length ? '<div class="small muted">Phụ trách: ' + esc(x.skills.map(function(k){ return k === "R" ? "Đọc" : "Nghe"; }).join(", ")) + ((x.levels || []).length ? " · " + esc(x.levels.join(", ")) : "") + '</div>' : '') + '</div>' + (coord && e !== p.owner ? '<button class="btn quiet danger sm" type="button" data-prjunmem="' + esc(e) + '">Bỏ</button>' : '') + '</div>'; }).join("") + '</div>';
  if(coord) h += '<div class="prjrow"><input type="text" id="prj-inv" list="prj-staff" placeholder="Email Google của người cần mời (nhiều email cách nhau dấu phẩy)"><datalist id="prj-staff">' + staff.map(function(e){ return '<option value="' + esc(e) + '">' + esc(peopleName(e)) + '</option>'; }).join("") + '</datalist><button class="btn primary" type="button" id="prj-invite">Mời vào dự án</button></div><p class="small muted">Mời được cả người chưa đăng nhập trang lần nào: họ vào dự án ngay, và lần đầu đăng nhập bằng đúng Gmail đó là thấy dự án và việc được giao. Trang không tự gửi thư; bấm "Gửi lời mời qua Gmail" để mở thư soạn sẵn từ Gmail của bạn. <button class="btn quiet sm" type="button" id="prj-copylink">Chép đường link trang</button></p>';
  h += '</div>';
  h += '<div class="hubcard"><h3>Thông tin dự án</h3><div class="prjform"><label class="small">Tên dự án<input type="text" id="prj-en" value="' + esc(p.name) + '"' + dis + '></label><label class="small">Hạn hoàn thành dự án (bài chưa có hạn riêng thì theo hạn này)<input type="date" id="prj-ed" value="' + esc(p.due || "") + '"' + dis + '></label>' + (coord ? '<div class="hubbtns"><button class="btn" type="button" id="prj-esave">Lưu thông tin</button></div>' : '') + '</div></div>';
  h += '<div class="hubcard"><h3>Điều phối</h3><p class="small">' + avatar(p.owner) + ' <b>' + esc(peopleName(p.owner)) + '</b> <span class="muted">' + esc(p.owner) + '</span></p>'
    + (libIsAdmin() ? '<p class="small muted">Quản trị đổi được Điều phối. Người cũ ở lại dự án với vai thành viên; các bài của dự án chuyển phần Điều phối sang người mới.</p><div class="prjrow"><input type="text" id="prj-co" list="prj-coords2" placeholder="Email Google của Điều phối mới">' + prjStaffList("prj-coords2") + '<button class="btn" type="button" id="prj-cosave">Giao Điều phối</button></div>' : '<p class="small muted">Chỉ quản trị đổi được Điều phối.</p>')
    + '</div>';
  h += prjTreeHTML(p, coord);
  if(coord){
    var at = prjAttachable(p);
    if(at.length) h += '<div class="hubcard hubtip">' + at.length + ' bài trong Thư viện có Bộ đề thuộc dự án nhưng chưa gắn vào dự án nào. <button class="btn sm" type="button" id="prj-attach">Gắn vào dự án</button></div>';
    h += '<div class="hubcard"><h3>Xoá dự án</h3><p class="small muted">Các bài của dự án vẫn còn trong Thư viện.</p><button class="btn quiet danger" type="button" id="prj-del">Xoá dự án</button></div>';
  }
  return h;
}
// cây bộ đề: Bộ đề (Đọc / Nghe) › Part › bài nhỏ; nhánh đã có bài hiện ✓, nhánh chưa có thì đánh dấu để tạo
function prjTreeHTML(p, coord){
  var sets = prjSetList(p), have = prjHave(p), byKey = {};
  prjItems(p.id).forEach(function(x){ var m = x.meta || {}; byKey[m.set + "|" + m.spec + "|" + (m.slot || "")] = x; });
  var h = '<div class="hubcard"><h3>Bộ đề và khung bài</h3><p class="small muted">Mỗi bộ đề là một <b>Đề Đọc</b> (Part 1–4), một <b>Đề Nghe</b> (Part 1: 8 bài ngắn; Part 2: 3 hội thoại; Part 3: 3 bài nói), một <b>Đề Viết</b> (Task 1, Task 2) hoặc một <b>Đề Nói</b> (Part 1–3), theo QĐ 730. Đánh dấu phần cần tạo rồi bấm <b>Tạo khung bài</b>: trang tạo sẵn bài trống để giao việc. Phần đã có bài hiện dấu ✓.</p>';
  if(!sets.length) h += '<div class="hubempty">Dự án chưa có bộ đề. Thêm bộ đề ở dưới.</div>';
  h += '<div class="ptree">' + sets.map(function(st){
    var nItems = prjItems(p.id).filter(function(x){ return (x.meta || {}).set === st.name; }).length;
    var head = '<div class="ptset"><span class="ptkind k' + (st.kind || "x") + '">' + (PRJ_KIND[st.kind] ? PRJ_ICO[st.kind] + PRJ_KIND[st.kind] : st.kind === "RL" ? "Đọc + Nghe" : "Chưa rõ loại") + '</span><b>' + esc(st.name) + '</b><span class="small muted">' + nItems + ' bài đã tạo</span>' + (coord && !nItems ? '<button class="btn quiet sm danger" type="button" data-prjdelset="' + esc(st.name) + '">Bỏ bộ đề</button>' : '') + '</div>';
    if(!st.kind || st.kind === "RL"){
      return '<div class="ptbox">' + head + (coord ? '<div class="prjrow small">Bộ đề này là: <button class="btn sm" type="button" data-prjsetkind="' + esc(st.name) + '|R">📖 Đề Đọc</button><button class="btn sm" type="button" data-prjsetkind="' + esc(st.name) + '|L">🎧 Đề Nghe</button><button class="btn sm" type="button" data-prjsetkind="' + esc(st.name) + '|W">✍️ Đề Viết</button><button class="btn sm" type="button" data-prjsetkind="' + esc(st.name) + '|S">🗣️ Đề Nói</button>' + (st.kind === "RL" ? '<span class="muted">(bộ đề này đang có cả bài Đọc và Nghe từ trước)</span>' : '') + '</div>' : '') + '</div>';
    }
    return '<div class="ptbox">' + head + PRJ_TREE[st.kind].map(function(pt){
      var subs = pt.items.map(function(it){ var key = st.name + "|" + it[0] + "|" + (it[1] || ""), x = byKey[key]; return {it:it, key:key, x:x}; });
      var allHave = subs.every(function(v){ return v.x; });
      var single = subs.length === 1;
      var partBox = '<label class="ptpart' + (allHave ? " done" : "") + '"><input type="checkbox" data-prjmkpart="' + esc(st.name + "|" + pt.part) + '"' + (allHave ? " checked disabled" : (coord ? " checked" : " disabled")) + '><b>' + esc(pt.part) + '</b><span class="small muted">' + esc(pt.note) + '</span>' + (allHave ? '<span class="small libok">✓ đã có' + (single ? "" : " đủ") + '</span>' : '') + '</label>';
      if(single){ var v = subs[0]; return '<div class="ptrow">' + partBox.replace('data-prjmkpart=', 'data-prjmk="' + esc(v.key) + '" data-prjmkpart=') + '</div>'; }
      return '<div class="ptrow">' + partBox + '<div class="ptsubs">' + subs.map(function(v){ return '<label class="hcheck ptsub' + (v.x ? " done" : "") + '"><input type="checkbox" data-prjmk="' + esc(v.key) + '" data-prjmkof="' + esc(st.name + "|" + pt.part) + '"' + (v.x ? " checked disabled" : (coord ? " checked" : " disabled")) + '> ' + esc(v.it[2]) + (v.x ? " ✓" : "") + '</label>'; }).join("") + '</div></div>';
    }).join("") + '</div>';
  }).join("") + '</div>';
  if(coord) h += '<div class="prjrow ptadd"><b class="small">Thêm bộ đề</b><input type="text" id="prj-setn" placeholder="Tên, ví dụ: Đề Đọc 03"><button class="btn" type="button" data-prjaddset="R">＋ 📖 Đề Đọc</button><button class="btn" type="button" data-prjaddset="L">＋ 🎧 Đề Nghe</button><button class="btn" type="button" data-prjaddset="W">＋ ✍️ Đề Viết</button><button class="btn" type="button" data-prjaddset="S">＋ 🗣️ Đề Nói</button></div>'
    + '<div class="small muted" id="prj-mkplan"></div><div class="hubbtns"><button class="btn primary" type="button" id="prj-mk"' + (sets.length ? "" : " disabled") + '>Tạo khung bài</button></div>';
  return h + '</div>';
}
function prjMkList(el){ var out = []; el.querySelectorAll("[data-prjmk]").forEach(function(c){ if(c.checked && !c.disabled){ var a = c.getAttribute("data-prjmk").split("|"); out.push({set:a[0], spec:a[1], slot:a[2] || ""}); } }); return out; }
function prjMkSel(el){
  var sets = [], parts = [];
  el.querySelectorAll("[data-prjmkset]").forEach(function(c){ if(c.checked) sets.push(c.getAttribute("data-prjmkset")); });
  el.querySelectorAll("[data-prjmkpart]").forEach(function(c){ if(c.checked) parts.push(c.getAttribute("data-prjmkpart")); });
  return {sets:sets, parts:parts};
}
function prjAfterRender(el){
  var pl = el.querySelector("#prj-mkplan"), p = prjById(PRJ.cur); if(!pl || !p) return;
  var n = prjMkList(el).length;
  pl.textContent = n ? "Sẽ tạo " + n + " bài mới." : "Chưa đánh dấu bài mới nào.";
}
// rời bảng phân công khi còn ô chưa lưu thì hỏi trước
function prjGuard(action){ if(!Object.keys(PRJ.edit).length){ action(); return; } hubAsk("<b>Còn ô phân công chưa lưu.</b> Rời đi thì các thay đổi này mất.", "Bỏ thay đổi và tiếp tục", function(){ PRJ.edit = {}; action(); }, true); }
function prjOpenItem(id){
  prjGuard(function(){
    if(!libDirty()){ libOpen(id, false, true); return; }
    var tgt = LIB.items.filter(function(x){ return x.id === id; })[0];
    hubAsk(libUnsavedText() + (tgt ? '<br><span class="small muted">Sắp mở: “' + esc(prjLabel(tgt) || tgt.title) + '”</span>' : ''), "Bỏ thay đổi, mở bài", function(){ libOpen(id, false, true); }, true,
      [{label:"Lưu “" + libCurTitle() + "” rồi mở", cls:"primary", fn:function(){ libSaveThen(function(){ libOpen(id, false, true); }); }}]);
  });
}

/* ---- hồ sơ cá nhân ---- */
function hubProfileHTML(){
  var me = prjMe(), x = PEOPLE[me] || LIB.me || {}, sk = x.skills || [], lv = x.levels || [];
  var role = {admin:"Quản trị (xem, sửa cả thư viện; quản lý thành viên)", editor:"Thành viên nội bộ (xem cả thư viện)", user:"Thành viên (xem bài của mình và bài trong dự án được mời)"}[LIB.role] || LIB.role;
  return '<h2>Hồ sơ của tôi</h2><div class="hubcard hprof"><div class="hprofav">' + avatar(me, true) + '<div class="small muted">' + esc(me) + '</div><div class="small">' + esc(role) + '</div></div><div class="prjform">'
    + '<label class="small">Tên hiển thị<input type="text" id="pf-name" value="' + esc(x.name || "") + '" placeholder="Ví dụ: Phạm Anh Đức"></label>'
    + '<label class="small">Chức danh<input type="text" id="pf-title" value="' + esc(x.title || "") + '" placeholder="Ví dụ: Giảng viên, người soạn đề"></label>'
    + '<label class="small">Đơn vị<input type="text" id="pf-org" value="' + esc(x.org || "") + '" placeholder="Trường, trung tâm, khoa"></label>'
    + '<div class="hchecks"><b class="small">Kỹ năng phụ trách</b>' + [["R","Đọc"],["L","Nghe"]].map(function(k){ return '<label class="hcheck"><input type="checkbox" data-pfskill="' + k[0] + '"' + (sk.indexOf(k[0]) >= 0 ? " checked" : "") + '> ' + k[1] + '</label>'; }).join("") + '</div>'
    + '<div class="hchecks"><b class="small">Bậc phụ trách</b>' + ["B1","B2","C1"].map(function(k){ return '<label class="hcheck"><input type="checkbox" data-pflevel="' + k + '"' + (lv.indexOf(k) >= 0 ? " checked" : "") + '> ' + k + ' (bậc ' + ({B1:3, B2:4, C1:5})[k] + ')</label>'; }).join("") + '</div>'
    + '<label class="small">Giới thiệu ngắn<textarea id="pf-bio" rows="3" placeholder="Kinh nghiệm soạn đề, chủ đề quen thuộc…">' + esc(x.bio || "") + '</textarea></label>'
    + '<div class="hchecks"><b class="small">Màu ảnh đại diện</b>' + PEOPLE_COLORS.map(function(c){ return '<label class="hswatch" style="background:' + c + '"><input type="radio" name="pf-color" value="' + c + '"' + ((x.color || peopleColor(me)) === c ? " checked" : "") + ' aria-label="Màu ' + c + '"></label>'; }).join("") + '</div>'
    + '<div class="hubbtns"><button class="btn primary" type="button" id="pf-save">Lưu hồ sơ</button><button class="btn quiet" type="button" id="hub-out">Đăng xuất</button></div></div></div>';
}
function hubProfileSave(el){
  var fb = LIB.fb, me = prjMe(), c = el.querySelector('input[name="pf-color"]:checked');
  var d = {name:el.querySelector("#pf-name").value.trim().slice(0, 80), title:el.querySelector("#pf-title").value.trim().slice(0, 80), org:el.querySelector("#pf-org").value.trim().slice(0, 120), bio:el.querySelector("#pf-bio").value.trim().slice(0, 600),
    skills:[].slice.call(el.querySelectorAll("[data-pfskill]:checked")).map(function(i){ return i.getAttribute("data-pfskill"); }), levels:[].slice.call(el.querySelectorAll("[data-pflevel]:checked")).map(function(i){ return i.getAttribute("data-pflevel"); }), color:c ? c.value : "", setup:true, updatedAt:fb.serverTimestamp()};
  PRJ.busy = true; hubRender();
  fb.updateDoc(fb.doc(LIB.db, "staff", me), d).then(function(){ LIB.me = Object.assign(LIB.me || {}, d); var x = Object.assign({}, d); x.email = me; peopleAdd([x]); PRJ.busy = false; toast("Đã lưu hồ sơ."); hubRender(); try{ wfRender(); }catch(e){} }).catch(prjErr);
}

/* ---- thành viên (quản trị) ---- */
function hubMembersHTML(){
  var list = (LIB.staff || []).slice().sort(function(a, b){ return peopleName(a.email) < peopleName(b.email) ? -1 : 1; });
  var roles = [["admin","Quản trị"],["editor","Thành viên nội bộ"],["user","Thành viên"],["blocked","Khoá tài khoản"]];
  return '<h2>Thành viên (' + list.length + ')</h2><div class="hubcard hubtip small">Ai đăng nhập bằng Google cũng tự có tài khoản <b>Thành viên</b>: thấy bài mình tạo và bài của dự án được mời. <b>Thành viên nội bộ</b> thấy cả thư viện. <b>Quản trị</b> thêm quản lý thành viên và xoá mọi bài. <b>Khoá tài khoản</b> chặn người không thuộc nhóm.</div>'
    + '<div class="hgrid sm">' + list.map(function(x){ var e = x.email, r = x.role === "admin" || x.role === "user" || x.role === "blocked" ? x.role : "editor"; return '<div class="hpcard flat"><div class="hpp">' + avatar(e) + '<div><b>' + esc(peopleName(e)) + '</b><div class="small muted">' + esc(e) + '</div><div class="small muted">' + esc([x.title, x.org].filter(Boolean).join(" · ")) + '</div></div></div>' + (e === prjMe() ? '<div class="small muted">Bạn · Quản trị</div>' : '<label class="small">Quyền<select data-hubrole="' + esc(e) + '">' + roles.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === r ? " selected" : "") + '>' + o[1] + '</option>'; }).join("") + '</select></label>' + (r === "user" ? '<label class="small"><input type="checkbox" data-hubspecs="' + esc(e) + '"' + (x.specs === true ? " checked" : "") + '> Cho xem đặc tả riêng</label>' : '') + (libIsAdmin() ? '<button class="btn sm quiet danger" type="button" data-hubunstaff="' + esc(e) + '">Xoá khỏi danh sách</button>' : '')) + '</div>'; }).join("") + '</div>' + hubSpecsHTML();
}
function hubSpecsHTML(){
  var st = SPECS.loaded ? "Đã tải" + (SPECS.at ? " (cập nhật " + new Date(SPECS.at).toLocaleString("vi-VN") + ")" : "") : ("Chưa tải" + (SPECS.err ? ": " + SPECS.err : ""));
  return '<h2>Đặc tả riêng</h2><div class="hubcard"><p class="small">Yêu cầu số từ của VNCETA, bảng phân bố và mẫu câu hỏi bài Đọc là tài liệu tập huấn (cam kết bảo mật), nên không nằm trong mã công khai của trang. Quản trị dán nội dung một lần ở đây; Quản trị, Thành viên nội bộ và Thành viên được đánh dấu "Cho xem đặc tả riêng" sẽ tự tải khi đăng nhập. Người chưa được xem thấy số của QĐ 730.</p><p class="small"><b>Trạng thái:</b> ' + esc(st) + '</p>'
    + '<details class="small"><summary>Dán hoặc thay nội dung đặc tả riêng (JSON)</summary><textarea id="spec-json" rows="8" style="width:100%" placeholder="Dán nội dung file vstep_dac_ta_rieng.json"></textarea><button class="btn sm" type="button" id="spec-save">Lưu đặc tả riêng</button></details></div>';
}
function hubSetSpecs(em, on){
  var fb = LIB.fb; PRJ.busy = true; hubRender();
  fb.updateDoc(fb.doc(LIB.db, "staff", em), {specs:!!on, specsBy:prjMe(), specsAt:fb.serverTimestamp()}).then(function(){ (LIB.staff || []).forEach(function(x){ if(x.email === em) x.specs = !!on; }); PRJ.busy = false; toast((on ? "Đã cho " : "Đã bỏ quyền xem đặc tả của ") + peopleName(em) + (on ? " xem đặc tả riêng." : ".")); hubRender(); }).catch(prjErr);
}
/* xoá tài khoản khỏi danh sách thành viên (ví dụ tài khoản thử): bỏ khỏi thành viên các dự án; phân công trong bài giữ nguyên để Điều phối giao lại */
function hubStaffDelete(em){
  if(em === prjMe()){ toast("Không tự xoá chính mình."); return; }
  var asg = LIB.items.filter(function(x){ var as = (x.wf && x.wf.as) || {}; return Object.keys(as).some(function(r){ return as[r] === em; }); });
  var own = (PRJ.list || []).filter(function(p){ return p.owner === em; }), mem = (PRJ.list || []).filter(function(p){ return p.owner !== em && (p.members || []).indexOf(em) >= 0; });
  var txt = "<b>Xoá " + esc(peopleName(em)) + " (" + esc(em) + ") khỏi danh sách thành viên?</b> Tài khoản không còn hiện ở ô chọn người khi giao việc" + (mem.length ? " và được bỏ khỏi " + mem.length + " dự án (" + esc(mem.map(function(p){ return p.name; }).join(", ")) + ")" : "") + ".";
  if(asg.length) txt += " <b>Lưu ý:</b> người này còn được phân công ở " + asg.length + " bài; phân công đó giữ nguyên, Điều phối giao lại ở mục Phân công.";
  if(own.length) txt += " <b>Lưu ý:</b> người này đang là Điều phối của " + own.length + " dự án (" + esc(own.map(function(p){ return p.name; }).join(", ")) + "); quản trị đổi Điều phối ở tab Thành viên và thiết lập của dự án.";
  txt += " Nếu tài khoản này đăng nhập lại, trang sẽ tự tạo lại tài khoản Thành viên; muốn chặn hẳn thì chọn Khoá tài khoản.";
  hubAsk(txt, "Xoá khỏi danh sách", function(){
    var fb = LIB.fb; PRJ.busy = true; HUB.ask = null; hubRender();
    Promise.all(mem.map(function(p){ return fb.updateDoc(fb.doc(LIB.db, "projects", p.id), {members:(p.members || []).filter(function(m){ return m !== em; })}); }))
      .then(function(){ return fb.deleteDoc(fb.doc(LIB.db, "staff", em)); })
      .then(function(){ LIB.staff = (LIB.staff || []).filter(function(x){ return x.email !== em; }); if(PEOPLE[em]) delete PEOPLE[em]; PRJ.busy = false; toast("Đã xoá " + em + " khỏi danh sách."); return prjReload(); })
      .catch(prjErr);
  }, true);
}
function hubSetRole(em, role){
  var fb = LIB.fb; PRJ.busy = true; hubRender();
  fb.updateDoc(fb.doc(LIB.db, "staff", em), {role:role, roleBy:prjMe(), roleAt:fb.serverTimestamp()}).then(function(){ (LIB.staff || []).forEach(function(x){ if(x.email === em) x.role = role; }); if(PEOPLE[em]) PEOPLE[em].role = role; PRJ.busy = false; toast("Đã đổi quyền của " + peopleName(em) + "."); hubRender(); }).catch(prjErr);
}

function bindPrj(){
  var el = hubEl(); if(!el) return;
  document.addEventListener("click", function(e){
    var t = e.target.closest ? e.target.closest("#hub-open, #hubbtn") : null;
    if(t){ if(typeof libToggle === "function") libToggle(false); hubOpen(HUB.page === "duan-ct" ? "duan-ct" : (HUB.page || "viec")); }
  });
  var bar = document.getElementById("edbar");
  if(bar) bar.addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest("button") : null; if(!b) return;
    if(b.id === "ed-back" || b.id === "ed-me"){ hubOpen(b.id === "ed-me" ? "hoso" : (HUB.page || "viec")); return; }
    if(b.id === "ed-prj" && S.prj){ PRJ.cur = S.prj.id; PRJ.tab = "tien-do"; hubOpen("duan-ct"); return; }
    if(b.id === "ed-save"){ if(!libLibDirty()){ toast("Bài đã được lưu, không có gì mới."); return; } var pr = libSave(false); edRender(); if(pr && pr.then) pr.then(function(){ edRender(); }); return; }
    if(b.id === "ed-lib"){ var lp = document.getElementById("libpanel"), op = lp.classList.contains("hidden"); libToggle(op); document.body.classList.toggle("libopen", op); return; }
  });
  el.addEventListener("keydown", function(e){ var c = e.target.closest && e.target.closest(".hpcard[data-prjgo]"); if(c && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); c.click(); } });
  el.addEventListener("click", function(e){
    var card = e.target.closest ? e.target.closest(".hpcard[data-prjgo]") : null;
    if(card && !e.target.closest("button")){ var pid0 = card.getAttribute("data-prjgo"); prjGuard(function(){ PRJ.cur = pid0; PRJ.tab = "tien-do"; PRJ.sel = {}; PRJ.msg = ""; HUB.page = "duan-ct"; hubRender(); el.scrollTop = 0; }); return; }
    var t = e.target.closest ? e.target.closest("button") : null; if(!t) return;
    var id = t.id, p = prjById(PRJ.cur);
    if(t.hasAttribute("data-hubask")){ var k = t.getAttribute("data-hubask"), a = HUB.ask; HUB.ask = null; hubRender(); if(k !== "x" && a && a.btns[+k]) a.btns[+k].fn(); return; }
    if(t.hasAttribute("data-hubpage")){ var pg = t.getAttribute("data-hubpage"); prjGuard(function(){ HUB.page = pg; PRJ.msg = ""; HUB.newOpen = false; hubRender(); el.scrollTop = 0; }); return; }
    if(id === "hub-close"){ prjGuard(function(){ hubClose(); }); return; }
    if(id === "hub-in"){ LIB.err = ""; libSignIn(); return; }
    if(id === "hub-out"){ prjGuard(function(){ LIB.fb.signOut(LIB.auth); HUB.page = "viec"; FORUM.list = null; }); return; }
    if(id === "pf-save"){ hubProfileSave(el); return; }
    if(id === "prj-newtoggle"){ HUB.newOpen = !HUB.newOpen; hubRender(); return; }
    if(id === "prj-home"){ prjGuard(function(){ PRJ.sel = {}; HUB.page = "duan"; PRJ.msg = ""; hubRender(); }); return; }
    if(id === "spec-save"){ var ta = document.getElementById("spec-json"); if(!ta || !ta.value.trim()){ toast("Chưa dán nội dung."); return; } PRJ.busy = true; specsSave(ta.value).then(function(){ PRJ.busy = false; toast("Đã lưu đặc tả riêng."); hubRender(); }, function(err){ PRJ.busy = false; toast("Không lưu được: " + (err && err.message ? err.message : err)); hubRender(); }); return; }
    if(id === "prj-reload"){ prjReload(); return; }
    if(id === "prj-new"){ var pc = el.querySelector("#prj-c"); HUB.newOpen = false; prjCreate(el.querySelector("#prj-n").value, el.querySelector("#prj-d").value, {R:parseInt(el.querySelector("#prj-nr").value, 10) || 0, L:parseInt(el.querySelector("#prj-nl").value, 10) || 0, W:parseInt((el.querySelector("#prj-nw") || {}).value, 10) || 0, S:parseInt((el.querySelector("#prj-ns") || {}).value, 10) || 0}, pc ? pc.value : ""); return; }
    if(t.hasAttribute("data-prjtab")){ PRJ.tab = t.getAttribute("data-prjtab"); PRJ.msg = ""; hubRender(); return; }
    if(t.hasAttribute("data-prjitem")){ prjOpenItem(t.getAttribute("data-prjitem")); return; }
    if(t.hasAttribute("data-hubunstaff")){ if(libIsAdmin()) hubStaffDelete(t.getAttribute("data-hubunstaff")); return; }
    if(!p) return;
    if(t.hasAttribute("data-prjext")){ PRJ.act = {id:t.getAttribute("data-prjext"), kind:"ext"}; PRJ.msg = ""; hubRender(); return; }
    if(t.hasAttribute("data-prjre")){ PRJ.act = {id:t.getAttribute("data-prjre"), kind:"re"}; PRJ.msg = ""; hubRender(); return; }
    if(t.hasAttribute("data-prjxcancel")){ PRJ.act = null; hubRender(); return; }
    if(t.hasAttribute("data-prjnudge")){ var xn = LIB.items.filter(function(y){ return y.id === t.getAttribute("data-prjnudge"); })[0]; if(xn) prjNudge(p, xn); return; }
    if(t.hasAttribute("data-prjxsave")){ var xe = LIB.items.filter(function(y){ return y.id === t.getAttribute("data-prjxsave"); })[0]; if(xe) prjExtend(p, xe, el.querySelector("#prj-xd").value, el.querySelector("#prj-xr").value, el.querySelector("#prj-xs").checked, el.querySelector("#prj-xf").checked); return; }
    if(t.hasAttribute("data-prjrsave")){ var xr = LIB.items.filter(function(y){ return y.id === t.getAttribute("data-prjrsave"); })[0]; if(xr) prjReassign(p, xr, el.querySelector("#prj-ra").value, el.querySelector("#prj-rr").value); return; }
    if(id === "prj-copylink"){ var url = location.href.split("#")[0].split("?")[0]; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function(){ toast("Đã chép: " + url); }, function(){ PRJ.msg = "Đường link trang: " + url; hubRender(); }); return; }
    if(id === "prj-selall"){ prjItems(p.id).forEach(function(x){ PRJ.sel[x.id] = true; }); hubRender(); return; }
    if(id === "prj-selnone"){ PRJ.sel = {}; hubRender(); return; }
    if(t.hasAttribute("data-prjselset")){ var ss = t.getAttribute("data-prjselset"); prjItems(p.id).forEach(function(x){ if((x.meta || {}).set === ss) PRJ.sel[x.id] = true; }); hubRender(); return; }
    if(id === "prj-bulk"){ var r = el.querySelector("#prj-brole").value, w = el.querySelector("#prj-bwho").value, n = 0; prjItems(p.id).forEach(function(x){ if(PRJ.sel[x.id] && !prjDone(x) && !prjStop(x)){ prjSetEdit(x, r, w); n++; } }); PRJ.msg = "Đã điền " + WF_ROLES[r] + " cho " + n + " bài (chưa lưu)."; hubRender(); return; }
    if(id === "prj-bulkdue"){ var d = el.querySelector("#prj-bdue").value, dr = el.querySelector("#prj-bduerole").value, m = 0; prjItems(p.id).forEach(function(x){ if(PRJ.sel[x.id]){ prjSetEdit(x, dr, d); m++; } }); PRJ.msg = (d ? "Đã đặt hạn " + prjFmt(d) : "Đã bỏ hạn") + (dr === "due" ? " hoàn thiện" : " phần " + PRJ_SHORT[dr.slice(4)]) + " cho " + m + " bài (chưa lưu)."; hubRender(); return; }
    if(id === "prj-sched"){ PRJ.quickOpen = true; var days = {}; el.querySelectorAll("[data-prjdays]").forEach(function(i){ var v = parseInt(i.value, 10); if(v > 0) days[i.getAttribute("data-prjdays")] = v; }); PRJ.schedOpen = true; prjSchedule(p, el.querySelector("#prj-sstart").value, days); return; }
    if(id === "prj-auto"){ PRJ.quickOpen = true; prjAuto(p); return; }
    if(id === "prj-saveas"){ prjSaveEdits(p); return; }
    if(id === "prj-discard"){ PRJ.edit = {}; PRJ.msg = ""; hubRender(); return; }
    if(id === "prj-invite"){ prjInvite(p, el.querySelector("#prj-inv").value); return; }
    if(t.hasAttribute("data-prjunmem")){ prjUninvite(p, t.getAttribute("data-prjunmem")); return; }
    if(id === "prj-cosave"){ var co = el.querySelector("#prj-co").value; if(!co.trim()){ toast("Nhập email Điều phối mới."); return; } if(confirm("Giao Điều phối dự án " + p.name + " cho " + co.trim() + "?")) prjSetCoord(p, co); return; }
    if(id === "prj-esave"){ var nm = el.querySelector("#prj-en").value.trim(); if(!nm){ toast("Cần tên dự án."); return; } prjUpdate(p, {name:nm, due:el.querySelector("#prj-ed").value || ""}, "Đã lưu thông tin dự án."); return; }
    if(id === "prj-mk"){ prjMakeItems(p, prjMkList(el)); return; }
    if(t.hasAttribute("data-prjaddset")){ var sn = el.querySelector("#prj-setn"), k = t.getAttribute("data-prjaddset"); var nm = (sn && sn.value.trim()) || (PRJ_KIND[k] + " " + String(prjSetList(p).filter(function(x){ return x.kind === k; }).length + 1).padStart(2, "0")); if(sn) sn.value = ""; prjAddSet(p, nm, k); return; }
    if(t.hasAttribute("data-prjdelset")){ prjDelSet(p, t.getAttribute("data-prjdelset")); return; }
    if(t.hasAttribute("data-prjsetkind")){ var sk = t.getAttribute("data-prjsetkind").split("|"); prjSetKind(p, sk[0], sk[1]); return; }
    if(id === "prj-attach"){ prjAttach(p); return; }
    if(id === "prj-del"){ prjDelete(p); return; }
  });
  el.addEventListener("change", function(e){
    var t = e.target, p = prjById(PRJ.cur); if(!t.getAttribute || dateTyping(t)) return;
    var a = t.getAttribute("data-prjas"), dd = t.getAttribute("data-prjdue"), sl = t.getAttribute("data-prjsel"), hr = t.getAttribute("data-hubrole");
    var find = function(id){ return LIB.items.filter(function(y){ return y.id === id; })[0]; };
    if(hr){ hubSetRole(hr, t.value); return; }
    var hsp = t.getAttribute("data-hubspecs"); if(hsp){ hubSetSpecs(hsp, t.checked); return; }
    if(a){ var parts = a.split("|"), x = find(parts[0]); if(x){ prjSetEdit(x, parts[1], t.value); hubRender(); } return; }
    if(dd){ var x2 = find(dd); if(x2){ var b2 = prjTryEdit(x2, "due", t.value, p); PRJ.msg = b2 ? "Không đổi được hạn hoàn thiện " + prjShortLabel(x2) + ": " + b2 + "." : ""; if(b2) toast(PRJ.msg); hubRender(); } return; }
    var rdd = t.getAttribute("data-prjrdue"); if(rdd){ var pp = rdd.split("|"), x3 = find(pp[0]); if(x3){ var b3 = prjTryEdit(x3, "due:" + pp[1], t.value, p); PRJ.msg = b3 ? "Không đổi được hạn " + WF_ROLES[pp[1]] + " của " + prjShortLabel(x3) + ": " + b3 + ". Phần sau chỉ bắt đầu khi phần trước xong." : ""; if(b3) toast(PRJ.msg); hubRender(); } return; }
    if(sl){ PRJ.sel[sl] = t.checked; hubRender(); return; }
    var col = t.getAttribute("data-prjcol"), cold = t.getAttribute("data-prjcoldue");
    if((col || cold) && p){
      var n = 0, skipC = []; prjItems(p.id).forEach(function(x){ if(prjDone(x) || prjStop(x)) return; if(col){ if(t.value && !prjNoRole(x, col)){ prjSetEdit(x, col, t.value); n++; } } else { if(prjNoRole(x, cold)) return; if(prjTryEdit(x, cold === "due" ? "due" : "due:" + cold, t.value, p)) skipC.push(prjShortLabel(x)); else n++; } });
      PRJ.msg = n ? (col ? "Đã giao cột " + WF_ROLES[col] + " cho " + peopleName(t.value) : "Đã điền hạn cả cột " + (cold === "due" ? "hoàn thiện" : WF_ROLES[cold])) + " ở " + n + " bài (chưa lưu). Kiểm tra ô đỏ nếu có, rồi bấm Lưu phân công." : "";
      if(skipC.length){ PRJ.msg += " Bỏ qua " + skipC.length + " bài vì ngày đó làm sai thứ tự hạn (" + skipC.slice(0, 3).join(", ") + (skipC.length > 3 ? "…" : "") + ")."; toast(PRJ.msg); }
      hubRender(); return;
    }
    // đánh dấu cả Part thì đánh dấu mọi bài nhỏ của nó, và ngược lại
    if(t.hasAttribute("data-prjmkpart") && !t.hasAttribute("data-prjmk")){ var key = t.getAttribute("data-prjmkpart"); el.querySelectorAll('[data-prjmkof]').forEach(function(c){ if(c.getAttribute("data-prjmkof") === key && !c.disabled) c.checked = t.checked; }); }
    if(t.hasAttribute("data-prjmkof")){ var of = t.getAttribute("data-prjmkof"), subs = [].slice.call(el.querySelectorAll('[data-prjmkof]')).filter(function(c){ return c.getAttribute("data-prjmkof") === of; }), pb = [].slice.call(el.querySelectorAll('[data-prjmkpart]')).filter(function(c){ return c.getAttribute("data-prjmkpart") === of && !c.hasAttribute("data-prjmk"); })[0]; if(pb && !pb.disabled){ var on = subs.filter(function(c){ return c.checked; }).length; pb.checked = on === subs.length; pb.indeterminate = on > 0 && on < subs.length; } }
    if(t.hasAttribute("data-prjmk") || t.hasAttribute("data-prjmkpart")){ if(p) prjAfterRender(el); return; }
  });
  window.addEventListener("keydown", function(e){ if(e.key === "Escape" && HUB.open){ if(HUB.ask){ HUB.ask = null; hubRender(); } } });
}

function prjStaffList(id){
  var em = (LIB.staff || []).filter(function(x){ return x.role !== "blocked"; }).map(function(x){ return x.email; });
  return '<datalist id="' + id + '">' + em.map(function(e){ return '<option value="' + esc(e) + '">' + esc(peopleName(e)) + '</option>'; }).join("") + '</datalist>';
}
