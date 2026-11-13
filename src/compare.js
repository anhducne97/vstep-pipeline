
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
