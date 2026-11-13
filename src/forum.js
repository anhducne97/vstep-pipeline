/* =====================================================================
   DIỄN ĐÀN trong trang Nhóm: đăng chủ đề (hỏi đáp, kinh nghiệm, thông báo,
   tài liệu, góp ý trang), bình luận, thả cảm xúc, chọn câu trả lời hay, ghim.
   Dữ liệu: threads/{id} = {title, body, cat, prj, team, author, authorName,
   createdAt, lastAt, lastBy, lastByName, replyCount, reactions, solved, pinned, editedAt}
   threads/{id}/comments/{cid} = {body, author, authorName, at, reactions, editedAt}
   Chủ đề "cả nhóm" (prj = null): mọi thành viên đọc được. Chủ đề của một dự án:
   chỉ người trong dự án (trường team, như bài) đọc được.
   ===================================================================== */
var FORUM = {list:null, err:"", cur:null, comments:null, compose:false, edit:null, busy:false, filter:{cat:"", scope:"", q:"", open:false}};
var FR_CATS = [["hoi","Hỏi đáp","❓"],["kn","Kinh nghiệm","💡"],["tb","Thông báo","📣"],["tl","Tài liệu","📚"],["gy","Góp ý trang","🛠"]];
var FR_REACT = [["like","👍","Thích"],["love","❤️","Yêu thích"],["haha","😂","Haha"],["wow","😮","Bất ngờ"],["thanks","🙏","Cảm ơn"],["idea","💡","Hay quá"]];
function frCat(k){ return FR_CATS.filter(function(c){ return c[0] === k; })[0] || FR_CATS[0]; }
function frAgo(ms){
  if(!ms) return ""; var s = (Date.now() - ms) / 1000;
  if(s < 60) return "vừa xong"; if(s < 3600) return Math.floor(s / 60) + " phút trước"; if(s < 86400) return Math.floor(s / 3600) + " giờ trước";
  if(s < 172800) return "hôm qua"; if(s < 604800) return Math.floor(s / 86400) + " ngày trước";
  var d = new Date(ms), p = function(n){ return String(n).padStart(2, "0"); }; return p(d.getDate()) + "/" + p(d.getMonth()+1) + "/" + d.getFullYear();
}
// chữ thường an toàn: xuống dòng, đường link, **đậm**
function frText(t){ return esc(t || "").replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g, "<br>"); }
function frSeenKey(){ return "vstep-forum-seen:" + prjMe(); }
function frSeen(){ try{ return JSON.parse(localStorage.getItem(frSeenKey()) || "null"); }catch(e){ return null; } }
function frSeenSet(o){ try{ localStorage.setItem(frSeenKey(), JSON.stringify(o)); }catch(e){} }
function frIsNew(t){ var s = frSeen(); if(!s) return false; var at = (s.ids || {})[t.id]; return (t.lastAt || 0) > (at || s.base || 0) && t.lastBy !== prjMe(); }
function frNewCount(){ return (FORUM.list || []).filter(frIsNew).length; }
function frMarkSeen(t){ var s = frSeen() || {base:Date.now(), ids:{}}; s.ids = s.ids || {}; s.ids[t.id] = t.lastAt || Date.now(); frSeenSet(s); }
function frCanSee(t){ return libIsStaff() || !t.prj || (t.team || []).indexOf(prjMe()) >= 0; }
function frMine(x){ return x.author === prjMe(); }

/* ---- máy chủ ---- */
function frLoad(){
  var fb = LIB.fb, me = prjMe(); if(!fb || !LIB.user || !LIB.role || LIB.role === "none" || LIB.role === "blocked") return Promise.resolve();
  var col = fb.collection(LIB.db, "threads"), qs = libIsStaff() ? [fb.query(col, fb.orderBy("lastAt", "desc"), fb.limit(300))] : [fb.query(col, fb.where("prj", "==", null)), fb.query(col, fb.where("team", "array-contains", me))];
  return Promise.all(qs.map(function(q){ return fb.getDocs(q); })).then(function(ss){
    var seen = {}, out = []; ss.forEach(function(s){ s.docs.forEach(function(d){ if(seen[d.id]) return; seen[d.id] = 1; var x = d.data(); x.id = d.id; out.push(x); }); });
    FORUM.list = out.sort(function(a, b){ return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.lastAt || 0) - (a.lastAt || 0); }); FORUM.err = "";
    if(!frSeen()) frSeenSet({base:Date.now() - 7 * 864e5, ids:{}});
    var ppl = {}; out.forEach(function(t){ ppl[t.author] = 1; if(t.lastBy) ppl[t.lastBy] = 1; }); frPeople(Object.keys(ppl));
  }).catch(function(e){ FORUM.list = FORUM.list || []; FORUM.err = e && e.code === "permission-denied" ? "rules" : libErrText(e); }).then(function(){ hubRender(); });
}
function frPeople(list){
  var fb = LIB.fb, miss = list.filter(function(e){ return e && !PEOPLE[e]; }); if(!miss.length) return;
  Promise.all(miss.map(function(e){ return fb.getDoc(fb.doc(LIB.db, "staff", e)).then(function(d){ var x = d.exists() ? d.data() : {missing:true}; x.email = e; peopleAdd([x]); }, function(){ peopleAdd([{email:e, missing:true}]); }); })).then(function(){ hubRender(); });
}
function frErr(e){ FORUM.busy = false; HUB.err = e && e.code === "permission-denied" ? "Máy chủ từ chối. Quản trị cần dán luật bảo mật mới (có khối threads) vào Firebase." : libErrText(e); hubRender(); }
function frOpen(id){
  var fb = LIB.fb, t = (FORUM.list || []).filter(function(x){ return x.id === id; })[0]; if(!t) return;
  FORUM.cur = id; FORUM.comments = null; FORUM.edit = null; HUB.page = "dd-ct"; frMarkSeen(t); hubRender(); var el = hubEl(); if(el) el.scrollTop = 0;
  fb.getDocs(fb.collection(LIB.db, "threads", id, "comments")).then(function(s){
    FORUM.comments = s.docs.map(function(d){ var x = d.data(); x.id = d.id; return x; }).sort(function(a, b){ return (a.at || 0) - (b.at || 0); });
    frPeople(FORUM.comments.map(function(c){ return c.author; })); hubRender();
    if(FORUM.focus){ var fe = document.getElementById("frc-" + FORUM.focus); if(fe) fe.scrollIntoView({block:"center", behavior:"smooth"}); setTimeout(function(){ FORUM.focus = ""; }, 4000); }
  }).catch(frErr);
}
function frPost(el){
  var fb = LIB.fb, me = prjMe(), title = el.querySelector("#fr-title").value.trim(), body = el.querySelector("#fr-body").value.trim();
  var cat = (el.querySelector('input[name="fr-cat"]:checked') || {}).value || "hoi", scope = el.querySelector("#fr-scope").value || "";
  if(!title){ toast("Cần tiêu đề."); return; }
  var ref = fb.doc(fb.collection(LIB.db, "threads")), now = Date.now();
  var rec = {title:title.slice(0, 160), body:body.slice(0, 6000), cat:cat, prj:scope || null, team:scope ? prjPeople(scope) : [], author:me, authorName:peopleName(me), createdAt:now, lastAt:now, lastBy:me, lastByName:peopleName(me), replyCount:0, reactions:{}, solved:"", pinned:false};
  FORUM.busy = true; hubRender();
  fb.setDoc(ref, rec).then(function(){ rec.id = ref.id; FORUM.list = [rec].concat(FORUM.list || []); if(typeof ntfPost === "function") ntfPost(rec); FORUM.compose = false; FORUM.busy = false; frClear(el, ["fr-title","fr-body"]); toast("Đã đăng chủ đề."); frOpen(ref.id); }).catch(frErr);
}
function frClear(el, ids){ ids.forEach(function(i){ var x = el.querySelector("#" + i); if(x) x.value = ""; }); }
function frComment(el){
  var fb = LIB.fb, me = prjMe(), t = frCur(), box = el.querySelector("#fr-cmt"), body = box ? box.value.trim() : "";
  if(!t || !body) return;
  var ref = fb.doc(fb.collection(LIB.db, "threads", t.id, "comments")), now = Date.now(), c = {body:body.slice(0, 4000), author:me, authorName:peopleName(me), at:now, reactions:{}};
  FORUM.busy = true; hubRender();
  var prev = (FORUM.comments || []).slice();
  fb.setDoc(ref, c).then(function(){
    c.id = ref.id; FORUM.comments = (FORUM.comments || []).concat([c]); if(typeof ntfComment === "function") ntfComment(t, c, prev);
    var n = FORUM.comments.length; t.replyCount = n; t.lastAt = now; t.lastBy = me; t.lastByName = peopleName(me); frMarkSeen(t);
    return fb.updateDoc(fb.doc(LIB.db, "threads", t.id), {replyCount:n, lastAt:now, lastBy:me, lastByName:peopleName(me)});
  }).then(function(){ FORUM.busy = false; frClear(el, ["fr-cmt"]); hubRender(); }).catch(frErr);
}
function frCur(){ return (FORUM.list || []).filter(function(x){ return x.id === FORUM.cur; })[0] || null; }
// thả, bỏ cảm xúc: đọc rồi ghi lại trong một giao dịch để hai người bấm cùng lúc không mất lượt
function frReact(kind, cid, key){
  var fb = LIB.fb, me = prjMe(), t = frCur(); if(!t) return;
  var ref = cid ? fb.doc(LIB.db, "threads", t.id, "comments", cid) : fb.doc(LIB.db, "threads", t.id);
  var local = cid ? (FORUM.comments || []).filter(function(c){ return c.id === cid; })[0] : t; if(!local) return;
  var want = ((local.reactions || {})[key] || []).indexOf(me) < 0;
  var setTo = function(r){ r = JSON.parse(JSON.stringify(r || {})); var a = r[key] || [], i = a.indexOf(me); if(want && i < 0) a.push(me); if(!want && i >= 0) a.splice(i, 1); if(a.length) r[key] = a; else delete r[key]; return r; };
  var before = local.reactions; local.reactions = setTo(local.reactions); hubRender();
  fb.runTransaction(LIB.db, function(tx){ return tx.get(ref).then(function(d){ if(!d.exists()) return; var x = d.data(); x.reactions = setTo(x.reactions); tx.set(ref, x); local.reactions = x.reactions; }); }).then(function(){ hubRender(); }).catch(function(e){ local.reactions = before; frErr(e); });
}
function frSaveEdit(el){
  var fb = LIB.fb, e = FORUM.edit, t = frCur(); if(!e || !t) return;
  var now = Date.now(), patch, ref, local;
  if(e.cid){ local = (FORUM.comments || []).filter(function(c){ return c.id === e.cid; })[0]; patch = {body:el.querySelector("#fr-ebody").value.trim().slice(0, 4000), editedAt:now}; ref = fb.doc(LIB.db, "threads", t.id, "comments", e.cid); if(!patch.body) return; }
  else { local = t; patch = {title:el.querySelector("#fr-etitle").value.trim().slice(0, 160), body:el.querySelector("#fr-ebody").value.trim().slice(0, 6000), cat:((el.querySelector('input[name="fr-ecat"]:checked') || {}).value || t.cat), editedAt:now}; ref = fb.doc(LIB.db, "threads", t.id); if(!patch.title){ toast("Cần tiêu đề."); return; } }
  FORUM.busy = true; hubRender();
  fb.updateDoc(ref, patch).then(function(){ Object.assign(local, patch); FORUM.edit = null; FORUM.busy = false; toast("Đã sửa."); hubRender(); }).catch(frErr);
}
function frDelete(cid){
  var fb = LIB.fb, t = frCur(); if(!t) return;
  if(cid){
    hubAsk("<b>Xoá bình luận này?</b>", "Xoá", function(){
      FORUM.busy = true; hubRender();
      fb.deleteDoc(fb.doc(LIB.db, "threads", t.id, "comments", cid)).then(function(){ FORUM.comments = (FORUM.comments || []).filter(function(c){ return c.id !== cid; }); t.replyCount = FORUM.comments.length; var patch = {replyCount:t.replyCount}; if(t.solved === cid){ t.solved = ""; } return fb.updateDoc(fb.doc(LIB.db, "threads", t.id), patch).then(function(){ if(!t.solved && frMine(t)) return fb.updateDoc(fb.doc(LIB.db, "threads", t.id), {solved:""}); }); }).then(function(){ FORUM.busy = false; toast("Đã xoá bình luận."); hubRender(); }).catch(frErr);
    }, true);
    return;
  }
  hubAsk("<b>Xoá chủ đề \"" + esc(t.title) + "\"?</b> Mọi bình luận trong chủ đề cũng bị xoá.", "Xoá chủ đề", function(){
    FORUM.busy = true; hubRender();
    fb.getDocs(fb.collection(LIB.db, "threads", t.id, "comments")).then(function(s){ return Promise.all(s.docs.map(function(d){ return fb.deleteDoc(d.ref); })); }).then(function(){ return fb.deleteDoc(fb.doc(LIB.db, "threads", t.id)); }).then(function(){ FORUM.list = (FORUM.list || []).filter(function(x){ return x.id !== t.id; }); FORUM.cur = null; FORUM.busy = false; HUB.page = "dd"; toast("Đã xoá chủ đề."); hubRender(); }).catch(frErr);
  }, true);
}
function frPatchThread(patch, msg){
  var fb = LIB.fb, t = frCur(); if(!t) return;
  fb.updateDoc(fb.doc(LIB.db, "threads", t.id), patch).then(function(){ Object.assign(t, patch); if(msg) toast(msg); hubRender(); }).catch(frErr);
}
// mời, bỏ người khỏi dự án thì chủ đề của dự án cũng đổi người đọc được
function frSyncTeam(pid){
  var fb = LIB.fb, team = prjPeople(pid);
  var xs = (FORUM.list || []).filter(function(t){ return t.prj === pid && JSON.stringify((t.team || []).slice().sort()) !== JSON.stringify(team.slice().sort()); });
  return Promise.all(xs.map(function(t){ return fb.updateDoc(fb.doc(LIB.db, "threads", t.id), {team:team}).then(function(){ t.team = team; }); })).catch(function(){});
}

/* ---- giao diện ---- */
function frReactBar(r, cid, small){
  r = r || {}; var me = prjMe(), used = FR_REACT.filter(function(x){ return (r[x[0]] || []).length; });
  var pill = function(x){ var a = r[x[0]] || [], on = a.indexOf(me) >= 0; return '<button type="button" class="frr' + (on ? " on" : "") + '" data-frreact="' + x[0] + '" data-frc="' + esc(cid || "") + '" title="' + esc(x[2] + (a.length ? ": " + a.map(peopleName).join(", ") : "")) + '">' + x[1] + (a.length ? ' <b>' + a.length + '</b>' : '') + '</button>'; };
  return '<div class="frreacts' + (small ? " sm" : "") + '">' + used.map(pill).join("") + '<details class="frpick"><summary title="Thả cảm xúc">' + (used.length ? "＋" : "😊 Thả cảm xúc") + '</summary><div class="frpickbox">' + FR_REACT.map(pill).join("") + '</div></details></div>';
}
function frReactTotal(r){ var n = 0; Object.keys(r || {}).forEach(function(k){ n += (r[k] || []).length; }); return n; }
function frTopEmoji(r){ return FR_REACT.filter(function(x){ return ((r || {})[x[0]] || []).length; }).sort(function(a, b){ return (r[b[0]] || []).length - (r[a[0]] || []).length; }).slice(0, 3).map(function(x){ return x[1]; }).join(""); }
function frScopeChip(t){ return t.prj ? '<span class="frscope" title="Chỉ người trong dự án đọc được">🔒 ' + esc(prjName(t.prj)) + '</span>' : '<span class="frscope all">🌐 Cả nhóm</span>'; }
function forumHTML(){
  if(FORUM.err === "rules") return '<div class="hubcard hubbad">Máy chủ chưa cho dùng Diễn đàn. Quản trị dán luật bảo mật mới (có khối threads) vào Firebase rồi tải lại trang.</div>';
  var h = FORUM.err ? '<div class="hubcard hubbad">' + esc(FORUM.err) + '</div>' : '';
  if(HUB.page === "dd-ct" && frCur()) return h + frThreadHTML(frCur());
  return h + frListHTML();
}
function frComposerHTML(){
  var vis = (PRJ.list || []).filter(prjVisible);
  return '<div class="hubcard frcompose"><h3>Đặt câu hỏi hoặc chia sẻ</h3><div class="prjform wide">'
    + '<div class="hchecks">' + FR_CATS.map(function(c, i){ return '<label class="hcheck frcat-' + c[0] + '"><input type="radio" name="fr-cat" value="' + c[0] + '"' + (i === 0 ? " checked" : "") + '> ' + c[2] + ' ' + c[1] + '</label>'; }).join("") + '</div>'
    + '<label class="small">Tiêu đề<input type="text" id="fr-title" maxlength="160" placeholder="Ví dụ: Câu DE[P] bậc 4 nên diễn đạt lại đến mức nào?"></label>'
    + '<label class="small">Nội dung<textarea id="fr-body" rows="6" placeholder="Mô tả rõ câu hỏi, ví dụ đã thử… Có thể dán đường link; **chữ đậm** dùng hai dấu sao."></textarea></label>'
    + '<label class="small">Ai đọc được<select id="fr-scope"><option value="">🌐 Cả nhóm (mọi thành viên đã đăng nhập)</option>' + vis.map(function(p){ return '<option value="' + esc(p.id) + '">🔒 Dự án ' + esc(p.name) + ' (' + prjPeople(p.id).length + ' người)</option>'; }).join("") + '</select></label>'
    + '<p class="small frwarn">Không dán nội dung đề, câu hỏi chưa công bố vào chủ đề cả nhóm: ai đăng nhập cũng có tài khoản. Bàn về bài cụ thể thì chọn chủ đề của dự án.</p>'
    + '<div class="hubbtns"><button class="btn primary" type="button" id="fr-post">Đăng</button><button class="btn quiet" type="button" id="fr-compose">Huỷ</button></div></div></div>';
}
// danh sách theo bộ lọc đang chọn (trang chủ diễn đàn dùng; nút trước, sau đi theo cùng bộ lọc)
function frFiltered(){
  var f = FORUM.filter, q = f.q.toLowerCase();
  return (FORUM.list || []).filter(function(t){
    if(f.cat && t.cat !== f.cat) return false;
    if(f.open && (t.replyCount || 0) > 0) return false;
    if(f.scope === "all" && t.prj) return false; if(f.scope && f.scope !== "all" && t.prj !== f.scope) return false;
    if(q && (t.title + " " + (t.body || "")).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
// bài trước, bài sau: theo thứ tự đăng (cũ → mới), để loạt bài đăng nối tiếp đọc liền một mạch
function frNeighbors(t){
  var xs = frFiltered(); if(xs.indexOf(t) < 0) xs = (FORUM.list || []).slice();
  xs = xs.slice().sort(function(a, b){ return (a.createdAt || 0) - (b.createdAt || 0); });
  var i = xs.indexOf(t); return {prev:i > 0 ? xs[i - 1] : null, next:i >= 0 && i < xs.length - 1 ? xs[i + 1] : null, i:i, n:xs.length};
}
function frNavHTML(t, where){
  var nb = frNeighbors(t); if(nb.n < 2) return "";
  var card = function(x, dir){ if(!x) return '<div class="frnavc off"></div>'; var c = frCat(x.cat); return '<button type="button" class="frnavc ' + dir + ' frcat-' + c[0] + '" data-frnav="' + esc(x.id) + '"><span class="frnavl">' + (dir === "prev" ? "← Bài trước" : "Bài sau →") + '</span><span class="frnavt">' + esc(x.title) + '</span></button>'; };
  return '<nav class="frnav' + (where === "top" ? " top" : "") + '" aria-label="Chuyển bài">' + card(nb.prev, "prev") + '<span class="frnavpos">' + (nb.i + 1) + ' / ' + nb.n + '</span>' + card(nb.next, "next") + '</nav>';
}
function frListHTML(){
  var f = FORUM.filter, q = f.q.toLowerCase(), vis = (PRJ.list || []).filter(prjVisible);
  var h = '<div class="hubrow"><div><h2>Diễn đàn</h2><p class="small muted">Hỏi nhanh, chia sẻ kinh nghiệm soạn đề, góp ý cho trang.</p></div><button class="btn primary" type="button" id="fr-compose">' + (FORUM.compose ? "Đóng" : "＋ Đặt câu hỏi") + '</button></div>';
  if(FORUM.compose) h += frComposerHTML();
  h += '<div class="frfilters"><input type="search" id="fr-q" placeholder="🔍 Tìm chủ đề" value="' + esc(f.q) + '">'
    + '<div class="hchips">' + [["","Tất cả","✨"]].concat(FR_CATS).map(function(c){ return '<button type="button" class="frchip' + (f.cat === c[0] ? " on" : "") + (c[0] ? " frcat-" + c[0] : "") + '" data-frcat="' + c[0] + '">' + c[2] + ' ' + c[1] + '</button>'; }).join("")
    + '<button type="button" class="frchip' + (f.open ? " on" : "") + '" data-fropen="1">🙋 Chưa có trả lời</button></div>'
    + (vis.length ? '<select id="fr-fscope" aria-label="Nơi đăng"><option value="">Mọi nơi</option><option value="all"' + (f.scope === "all" ? " selected" : "") + '>🌐 Cả nhóm</option>' + vis.map(function(p){ return '<option value="' + esc(p.id) + '"' + (f.scope === p.id ? " selected" : "") + '>🔒 ' + esc(p.name) + '</option>'; }).join("") + '</select>' : '') + '<button type="button" class="btn quiet sm" id="fr-reload" title="Tải lại">↻</button></div>';
  if(!FORUM.list) return h + '<div class="hubempty">Đang tải…</div>';
  var xs = frFiltered();
  if(!xs.length) return h + '<div class="hubempty">' + (FORUM.list.length ? "Không có chủ đề khớp bộ lọc." : "Chưa có chủ đề nào. Mở màn bằng một câu hỏi nhé! 👋") + '</div>';
  return h + '<div class="frlist">' + xs.map(function(t){
    var c = frCat(t.cat), n = t.replyCount || 0, rt = frReactTotal(t.reactions), nw = frIsNew(t);
    return '<div class="frcard frcat-' + c[0] + (nw ? " new" : "") + '" data-frgo="' + esc(t.id) + '" role="button" tabindex="0">' + avatar(t.author) + '<div class="frcardm"><div class="frcardt">' + (t.pinned ? '<span title="Đã ghim">📌</span> ' : '') + esc(t.title) + (nw ? ' <span class="frnew">mới</span>' : '') + '</div>'
      + '<div class="frex">' + esc(String(t.body || "").replace(/\s+/g, " ").slice(0, 180)) + '</div>'
      + '<div class="frmeta"><span class="frtag frcat-' + c[0] + '">' + c[2] + ' ' + c[1] + '</span>' + frScopeChip(t) + '<span class="muted">' + esc(peopleName(t.author)) + ' · ' + esc(frAgo(t.createdAt)) + '</span>' + (t.solved ? '<span class="frsolved">✓ Đã có câu trả lời hay</span>' : '') + '</div></div>'
      + '<div class="frstats"><span class="frcount' + (n ? "" : " zero") + '" title="Bình luận">💬 ' + n + '</span>' + (rt ? '<span class="frcount" title="Cảm xúc">' + frTopEmoji(t.reactions) + ' ' + rt + '</span>' : '') + (t.lastBy && n ? '<span class="small muted">' + esc(peopleName(t.lastBy)) + ' · ' + esc(frAgo(t.lastAt)) + '</span>' : '') + '</div></div>';
  }).join("") + '</div>';
}
function frThreadHTML(t){
  var c = frCat(t.cat), me = prjMe(), canEdit = frMine(t) || libIsAdmin(), ed = FORUM.edit;
  var h = '<div class="hpdhead"><button class="btn quiet sm" type="button" id="fr-back">← Diễn đàn</button></div>';
  h += '<article class="hubcard frpost frcat-' + c[0] + '">';
  if(ed && !ed.cid) h += '<div class="prjform wide"><div class="hchecks">' + FR_CATS.map(function(k){ return '<label class="hcheck frcat-' + k[0] + '"><input type="radio" name="fr-ecat" value="' + k[0] + '"' + (t.cat === k[0] ? " checked" : "") + '> ' + k[2] + ' ' + k[1] + '</label>'; }).join("") + '</div><label class="small">Tiêu đề<input type="text" id="fr-etitle" value="' + esc(t.title) + '"></label><label class="small">Nội dung<textarea id="fr-ebody" rows="7">' + esc(t.body || "") + '</textarea></label><div class="hubbtns"><button class="btn primary" type="button" id="fr-esave">Lưu</button><button class="btn quiet" type="button" id="fr-ecancel">Huỷ</button></div></div>';
  else h += '<div class="frmeta"><span class="frtag frcat-' + c[0] + '">' + c[2] + ' ' + c[1] + '</span>' + frScopeChip(t) + (t.pinned ? '<span class="frtag">📌 Đã ghim</span>' : '') + '</div><h2 class="frtitle">' + esc(t.title) + '</h2>'
    + '<div class="frauthor">' + avatar(t.author) + '<div><b>' + esc(peopleName(t.author)) + '</b><div class="small muted">' + esc(((PEOPLE[t.author] || {}).title) || "") + (((PEOPLE[t.author] || {}).title) ? " · " : "") + esc(frAgo(t.createdAt)) + (t.editedAt ? " · đã sửa" : "") + '</div></div></div>'
    + (t.body ? '<div class="frbody">' + frText(t.body) + '</div>' : '')
    + '<div class="frfoot">' + frReactBar(t.reactions, "") + '<div class="frtools">' + (canEdit ? '<button class="btn quiet sm" type="button" data-fredit="">Sửa</button><button class="btn quiet sm danger" type="button" data-frdel="">Xoá</button>' : '') + (libIsAdmin() ? '<button class="btn quiet sm" type="button" id="fr-pin">' + (t.pinned ? "Bỏ ghim" : "📌 Ghim") + '</button>' : '') + '</div></div>';
  h += '</article>' + frNavHTML(t, "top");
  var cs = FORUM.comments;
  h += '<h3 class="hubh">💬 ' + (cs ? cs.length : (t.replyCount || 0)) + ' bình luận</h3>';
  if(!cs) h += '<div class="hubempty">Đang tải bình luận…</div>';
  else if(!cs.length) h += '<div class="hubempty">Chưa có ai trả lời. Bạn biết thì trả lời giúp nhé! 🙌</div>';
  else {
    var list = cs.slice(); if(t.solved) list.sort(function(a, b){ return (b.id === t.solved ? 1 : 0) - (a.id === t.solved ? 1 : 0); });
    h += '<div class="frcmts">' + list.map(function(k){
      var mine = frMine(k), op = k.author === t.author, best = t.solved === k.id;
      if(ed && ed.cid === k.id) return '<div class="frcmt edit">' + avatar(k.author) + '<div class="frbubble"><textarea id="fr-ebody" rows="4">' + esc(k.body) + '</textarea><div class="hubbtns"><button class="btn primary sm" type="button" id="fr-esave">Lưu</button><button class="btn quiet sm" type="button" id="fr-ecancel">Huỷ</button></div></div></div>';
      return '<div class="frcmt' + (best ? " best" : "") + (mine ? " mine" : "") + (FORUM.focus === k.id ? " focus" : "") + '" id="frc-' + esc(k.id) + '">' + avatar(k.author) + '<div class="frbubble">' + (best ? '<div class="frbest">✓ Câu trả lời được người hỏi chọn</div>' : '') + '<div class="frcmth"><b>' + esc(peopleName(k.author)) + '</b>' + (op ? ' <span class="frop">người hỏi</span>' : '') + ' <span class="small muted">' + esc(frAgo(k.at)) + (k.editedAt ? " · đã sửa" : "") + '</span></div><div class="frbody">' + frText(k.body) + '</div>'
        + '<div class="frfoot">' + frReactBar(k.reactions, k.id, true) + '<div class="frtools">' + (frMine(t) && !op ? '<button class="btn quiet sm" type="button" data-frbest="' + esc(k.id) + '">' + (best ? "Bỏ chọn" : "✓ Chọn là câu trả lời hay") + '</button>' : '') + (mine || libIsAdmin() ? '<button class="btn quiet sm" type="button" data-fredit="' + esc(k.id) + '">Sửa</button><button class="btn quiet sm danger" type="button" data-frdel="' + esc(k.id) + '">Xoá</button>' : '') + '</div></div></div></div>';
    }).join("") + '</div>';
  }
  h += '<div class="frcmt compose">' + avatar(me) + '<div class="frbubble"><textarea id="fr-cmt" rows="3" placeholder="Viết bình luận… (Ctrl + Enter để gửi)"></textarea><div class="hubbtns"><button class="btn primary" type="button" id="fr-send">Gửi</button></div></div></div>' + frNavHTML(t, "bottom");
  return h;
}
function bindForum(){
  var el = hubEl(); if(!el) return;
  el.addEventListener("click", function(e){
    var card = e.target.closest ? e.target.closest(".frcard[data-frgo]") : null;
    if(card){ frOpen(card.getAttribute("data-frgo")); return; }
    var t = e.target.closest ? e.target.closest("button") : null; if(!t) return;
    var id = t.id;
    if(id === "fr-compose"){ FORUM.compose = !FORUM.compose; hubRender(); var ti = el.querySelector("#fr-title"); if(ti) ti.focus(); return; }
    if(id === "fr-post"){ frPost(el); return; }
    if(id === "fr-reload"){ FORUM.list = null; hubRender(); frLoad(); return; }
    if(id === "fr-back"){ FORUM.cur = null; FORUM.edit = null; HUB.page = "dd"; hubRender(); frLoad(); return; }
    if(id === "fr-send"){ frComment(el); return; }
    if(id === "fr-esave"){ frSaveEdit(el); return; }
    if(id === "fr-ecancel"){ FORUM.edit = null; hubRender(); return; }
    if(id === "fr-pin"){ var tt = frCur(); if(tt) frPatchThread({pinned:!tt.pinned}, tt.pinned ? "Đã bỏ ghim." : "Đã ghim chủ đề."); return; }
    if(t.hasAttribute("data-frnav")){ frOpen(t.getAttribute("data-frnav")); return; }
    if(t.hasAttribute("data-frcat")){ FORUM.filter.cat = t.getAttribute("data-frcat"); hubRender(); return; }
    if(t.hasAttribute("data-fropen")){ FORUM.filter.open = !FORUM.filter.open; hubRender(); return; }
    if(t.hasAttribute("data-frreact")){ var pk = t.closest(".frpick"); if(pk) pk.open = false; frReact("", t.getAttribute("data-frc"), t.getAttribute("data-frreact")); return; }
    if(t.hasAttribute("data-fredit")){ FORUM.edit = {cid:t.getAttribute("data-fredit")}; hubRender(); var eb = el.querySelector("#fr-ebody"); if(eb) eb.focus(); return; }
    if(t.hasAttribute("data-frdel")){ frDelete(t.getAttribute("data-frdel")); return; }
    if(t.hasAttribute("data-frbest")){ var cur = frCur(), cid = t.getAttribute("data-frbest"); if(cur){ var pick = cur.solved !== cid; frPatchThread({solved:pick ? cid : ""}, pick ? "Đã chọn câu trả lời hay. Cảm ơn người trả lời nhé!" : "Đã bỏ chọn."); if(pick && typeof ntfBest === "function") ntfBest(cur, (FORUM.comments || []).filter(function(k){ return k.id === cid; })[0]); } return; }
  });
  el.addEventListener("keydown", function(e){
    var c = e.target.closest && e.target.closest(".frcard[data-frgo]"); if(c && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); c.click(); return; }
    if(e.target.id === "fr-cmt" && e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); frComment(el); return; }

  });
  el.addEventListener("input", function(e){
    if(e.target.id === "fr-q"){ FORUM.filter.q = e.target.value; var pos = e.target.selectionStart; hubRender(); var n = el.querySelector("#fr-q"); if(n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(x){} } }
  });
  // phím mũi tên trái, phải chuyển bài (khi không đang gõ)
  window.addEventListener("keydown", function(e){
    if(!HUB.open || HUB.page !== "dd-ct" || HUB.ask || (e.key !== "ArrowLeft" && e.key !== "ArrowRight") || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable)) return;
    var cur = frCur(); if(!cur) return; var nb = frNeighbors(cur), go = e.key === "ArrowLeft" ? nb.prev : nb.next;
    if(go){ e.preventDefault(); frOpen(go.id); }
  });
  el.addEventListener("change", function(e){ if(e.target.id === "fr-fscope"){ FORUM.filter.scope = e.target.value; hubRender(); } });
}
