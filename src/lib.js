
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
      LIB.authReady = true;
      LIB.user = u; LIB.role = null; LIB.me = null; LIB.items = []; LIB.err = ""; LIB.view = "list";
      if(typeof FORUM !== "undefined"){ FORUM.list = null; FORUM.cur = null; FORUM.comments = null; }
      if(typeof NTF !== "undefined"){ NTF.list = null; NTF.open = false; }
      if(typeof PRJ !== "undefined"){ PRJ.list = null; PRJ.edit = {}; PRJ.sel = {}; PRJ.cur = null; PRJ.msg = ""; }
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
  var as = w.as || {};
  if(need === "coord") return as.coord ? as.coord === me : libIsAdmin();
  return as[need] === me;
}
// vai đang phải làm việc tiếp theo của một bài (theo trạng thái quy trình)
function libNeed(x){
  var w = x.wf; if(!w) return "";
  if(!w.st) return (w.as && w.as.nl) || x.prj ? "nl" : "";
  var need = {"Chủ đề đề xuất":"coord","Đang adapt":"nl","Chờ thẩm định ngữ liệu":"tdnl","Ngữ liệu cần sửa":"nl","Ngữ liệu đã duyệt (khoá)":"ch","Đang soạn câu hỏi":"ch","Chờ thẩm định câu hỏi":"tdch","Câu hỏi cần sửa":"ch","Câu hỏi đã duyệt":"coord"}[w.st];
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
