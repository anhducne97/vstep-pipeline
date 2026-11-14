
/* ===== Đề xuất sửa trực tiếp của người thẩm định (Nick chốt 14/11/2026) =====
   Người thẩm định sửa thẳng vào một bản nháp trong Phiếu duyệt. Khi bấm Trả sửa, trang tách bản nháp
   thành từng chỗ đổi (THAY / BẰNG) và gửi người soạn. Người soạn xem từng chỗ, bấm Nhận hoặc Bỏ;
   nhận thì trang áp vào bài, chấm lại checklist, báo tiêu chí bị xấu đi, có Hoàn tác.
   Phạm vi: cổng 2 (bài đọc, kịch bản, đề Viết/Nói) và cổng 3 (bộ câu hỏi). */
var SUG_SLOT = {NL:"draft", CH:"questions"};
function sugData(){ S.sug = S.sug || {}; S.sugWork = S.sugWork || {}; return S.sug; }
function sugList(sc){ return (sugData()[sc] || []); }
function sugOpen(sc){ return sugList(sc).filter(function(x){ return x.st === "Mở"; }); }
function sugScOf(g){ return g === 3 ? "CH" : (wfIsWS() ? "WS" : "NL"); }
/* các trường của đề Viết, Nói được sửa trực tiếp: ô chữ, bỏ phần ghi nguồn */
function sugWsFields(){ return ((typeof WS_F !== "undefined" && WS_F[S.spec]) || []).filter(function(f){ return (f.type === "area" || f.type === "text" || !f.type) && !f.src && f.k; }); }
function sugBase(sc, k){ return sc === "WS" ? String(wsData()[k] || "") : String(S.slots[SUG_SLOT[sc]] || ""); }

/* tách văn bản thành đơn vị so sánh: bài thì theo câu (giữ khoảng trắng sau câu), câu hỏi thì theo dòng */
function sugUnits(t, byLine){
  var out = [], re = byLine ? /[^\n]*\n|[^\n]+$/g : /[^.!?…\n]*(?:[.!?…]+["”’)]*|\n|$)[ \t]*\n*/g, m;
  while((m = re.exec(t)) && m[0] !== ""){ out.push(m[0]); if(re.lastIndex >= t.length) break; }
  return out;
}
/* so hai văn bản, trả các cặp THAY / BẰNG; chỗ THAY luôn khớp đúng một chỗ trong văn bản cũ */
function sugPairs(oldT, newT, byLine){
  if(oldT === newT) return [];
  var A = sugUnits(oldT, byLine), B = sugUnits(newT, byLine), n = A.length, m = B.length, W = m + 1, L = new Uint16Array((n + 1) * (m + 1));
  var k = function(s){ return s.replace(/\s+/g, " ").trim(); };
  for(var i = n - 1; i >= 0; i--) for(var j = m - 1; j >= 0; j--) L[i*W+j] = k(A[i]) === k(B[j]) ? L[(i+1)*W+j+1] + 1 : Math.max(L[(i+1)*W+j], L[i*W+j+1]);
  var ops = [], x = 0, y = 0;
  while(x < n || y < m){
    if(x < n && y < m && k(A[x]) === k(B[y])){ ops.push({eq:true, a:x, b:y}); x++; y++; }
    else if(y < m && (x >= n || L[x*W+y+1] >= L[(x+1)*W+y])){ ops.push({ins:true, b:y}); y++; }
    else { ops.push({del:true, a:x}); x++; }
  }
  // gom các đoạn đổi liền nhau
  var runs = [], cur = null;
  ops.forEach(function(o, idx){ if(o.eq){ cur = null; return; } if(!cur){ cur = {as:[], bs:[], at:idx}; runs.push(cur); } if(o.del) cur.as.push(o.a); else cur.bs.push(o.b); });
  var off = [], p = 0; A.forEach(function(u){ off.push(p); p += u.length; });
  var pairs = [];
  runs.forEach(function(r){
    var prev = null, next = null;
    for(var q = r.at - 1; q >= 0; q--) if(ops[q].eq){ prev = ops[q]; break; }
    for(var q2 = r.at; q2 < ops.length; q2++) if(ops[q2].eq){ next = ops[q2]; break; }
    var oldS = r.as.map(function(i){ return A[i]; }).join(""), newS = r.bs.map(function(j){ return B[j]; }).join("");
    var lo = r.as.length ? r.as[0] : (prev ? prev.a + 1 : (next ? next.a : 0)), hi = r.as.length ? r.as[r.as.length - 1] + 1 : lo;
    // chỉ thêm mới: bám vào câu đứng trước (hoặc sau) để biết chèn ở đâu
    if(!r.as.length){ if(prev){ lo = prev.a; oldS = A[prev.a]; newS = B[prev.b] + newS; } else if(next){ hi = next.a + 1; oldS = A[next.a]; newS = newS + B[next.b]; } }
    // chỗ THAY phải là duy nhất: nới rộng sang câu bên cạnh cho tới khi chỉ còn một chỗ khớp
    var guard = 0;
    while(oldS && oldT.split(oldS).length - 1 > 1 && guard++ < 6){
      if(lo > 0){ lo--; oldS = A[lo] + oldS; newS = A[lo] + newS; } else if(hi < n){ oldS = oldS + A[hi]; newS = newS + A[hi]; hi++; } else break;
    }
    if(oldS.trim() === newS.trim() && oldS.replace(/\s+/g, " ") === newS.replace(/\s+/g, " ")) return;
    pairs.push({old:oldS, nw:newS, pos:off[lo] || 0});
  });
  return pairs;
}
function sugDraftPairs(sc){
  var W = sugData() && S.sugWork[sc];
  if(sc === "WS"){
    var out = []; if(!W) return out;
    sugWsFields().forEach(function(f){ if(W[f.k] === undefined) return; var o = sugBase("WS", f.k), nw = String(W[f.k]); if(o !== nw) out.push({k:f.k, label:f.label, old:o, nw:nw}); });
    return out;
  }
  if(typeof W !== "string") return [];
  return sugPairs(sugBase(sc), W, sc === "CH");
}
/* bấm Trả sửa: chốt bản nháp thành các đề xuất gửi người soạn */
function sugCommit(sc){
  var P = sugDraftPairs(sc), D = sugData(), now = Date.now(), by = wfMe() || wfWho();
  D[sc] = P.map(function(p, i){ return {id:"s" + now.toString(36) + i, k:p.k || "", label:p.label || "", old:p.old, nw:p.nw, st:"Mở", by:by, at:now}; });
  delete S.sugWork[sc];
  return D[sc].length;
}

/* ---- phía người thẩm định: ô sửa trực tiếp trong Phiếu duyệt ---- */
function sugCanEdit(sc){ return typeof clCanTick === "function" ? clCanTick(sc, "rv") : {ok:true}; }
function sugEditorHTML(g){
  var sc = sugScOf(g), can = sugCanEdit(sc), D = sugData(), last = sugList(sc), P = sugDraftPairs(sc);
  var h = '<details class="box sugbox" data-k="sug' + g + '"' + (P.length ? " open" : "") + '><summary>✏️ Sửa trực tiếp <span class="small muted">(gửi người soạn nhận hoặc bỏ' + (P.length ? "; đang có " + P.length + " chỗ sửa" : "") + ')</span></summary><div class="sugbody">';
  if(last.length){
    var nNh = last.filter(function(x){ return x.st === "Đã nhận"; }).length, bo = last.filter(function(x){ return x.st === "Đã bỏ"; }), mo = last.filter(function(x){ return x.st === "Mở"; }).length;
    h += '<div class="note small">Lần trả trước: người soạn <b>nhận ' + nNh + '</b>, <b>bỏ ' + bo.length + '</b>' + (mo ? ", còn " + mo + " chưa xử lý" : "") + ' trên ' + last.length + ' đề xuất.' + (bo.length ? '<details><summary>Xem các chỗ bị bỏ</summary>' + bo.map(function(x){ return '<div class="row">' + (x.label ? "<b>" + esc(x.label) + ":</b> " : "") + wordDiffHTML(x.old, x.nw) + (x.why ? '<div class="small muted">Lý do bỏ: ' + esc(x.why) + '</div>' : '') + '</div>'; }).join("") + '</details>' : '') + '</div>';
  }
  if(!can.ok){ return h + '<p class="small muted">' + esc(can.why) + '</p></div></details>'; }
  h += '<p class="small muted">Sửa thẳng vào ô dưới như sửa văn bản bình thường. Trang không đổi bài ngay: khi bấm <b>' + (g === 3 ? "Trả sửa câu hỏi" : "Trả sửa ngữ liệu") + '</b>, mỗi chỗ đổi thành một đề xuất; người soạn xem chỗ gạch, chỗ thêm và quyết định nhận hay bỏ. Chỗ cần giải thích thì vẫn ghi chú như cũ.</p>';
  if(sc === "WS"){
    var W = S.sugWork.WS || {};
    h += sugWsFields().map(function(f){ var v = W[f.k] !== undefined ? W[f.k] : sugBase("WS", f.k); return '<label class="small">' + esc(f.label) + '<textarea rows="' + Math.min(10, Math.max(2, String(v).split("\n").length + 1)) + '" data-sugws="' + f.k + '">' + esc(v) + '</textarea></label>'; }).join("");
  } else {
    var v = typeof S.sugWork[sc] === "string" ? S.sugWork[sc] : sugBase(sc);
    h += '<textarea class="sugta" rows="14" data-sugta="' + sc + '">' + esc(v) + '</textarea>';
  }
  h += '<div class="sugprev" data-sugprev="' + sc + '">' + sugPrevHTML(sc) + '</div>';
  h += '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn quiet sm" data-sugreset="' + sc + '">Bỏ hết phần đang sửa</button></div>';
  return h + '</div></details>';
}
function sugPrevHTML(sc){
  var P = sugDraftPairs(sc);
  if(!P.length) return '<p class="small muted">Chưa sửa chỗ nào.</p>';
  return '<p class="small"><b>' + P.length + ' chỗ sửa</b> sẽ gửi người soạn khi bấm Trả sửa:</p>' + P.map(function(p, i){ return '<div class="fx see"><div class="small muted">' + (i + 1) + (p.label ? " · " + esc(p.label) : "") + '</div><div class="row">' + wordDiffHTML(p.old, p.nw) + '</div></div>'; }).join("");
}

/* ---- phía người soạn: nhận hoặc bỏ từng đề xuất ---- */
var SUG_TARGET = {NL:function(){ return qIsR() ? "viet-bai" : "viet-kich-ban"; }, CH:function(){ return "cau-hoi"; }, WS:function(){ return "ws-soan"; }};
function sugAuthorCan(sc){
  if(typeof wfModeActive !== "function" || !wfModeActive()) return {ok:true};
  var au = sc === "CH" ? "ch" : "nl", st = wfData().st;
  if(!(wfDevOn() ? wfDevRole() === au : wfHas(au))) return {ok:false, why:"Chỉ " + WF_ROLES[au] + " (" + wfWhoName(au) + ") nhận hoặc bỏ đề xuất sửa."};
  var okSt = sc === "CH" ? ["Đang soạn câu hỏi", "Câu hỏi cần sửa"] : ["Ngữ liệu cần sửa", "Đang adapt", ""];
  if(okSt.indexOf(st || "") < 0) return {ok:false, why:"Bài đang ở trạng thái " + (st || "chưa bắt đầu") + ": chưa nhận đề xuất được."};
  return {ok:true};
}
function sugAuthorHTML(sc){
  var L = sugList(sc); if(!L.length) return "";
  var open = L.filter(function(x){ return x.st === "Mở"; }), can = sugAuthorCan(sc), dis = can.ok ? "" : ' disabled title="' + esc(can.why) + '"';
  var who = L[0].by ? (typeof peopleName === "function" ? peopleName(L[0].by) : L[0].by) : "người thẩm định";
  var h = '<div class="card sugcard' + (open.length ? " open" : "") + '"><h3>✏️ Đề xuất sửa của ' + esc(who) + ' <span class="small muted">(' + open.length + ' chưa xử lý / ' + L.length + ')</span></h3>';
  if(open.length) h += '<p class="small">Mỗi ô là một chỗ người thẩm định sửa thẳng: <del class="dd">gạch</del> là bỏ, <ins class="di">tô xanh</ins> là thêm. Bấm <b>Nhận</b> để áp vào bài (trang chấm lại checklist, báo nếu tiêu chí nào xấu đi, có Hoàn tác) hoặc <b>Bỏ</b> kèm lý do. Xử lý hết mới gửi lại được.</p>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="btn primary sm" data-sugall="' + sc + '"' + dis + '>Nhận tất cả</button></div>';
  h += L.map(function(x){
    var stc = x.st === "Mở" ? "must" : (x.st === "Đã nhận" ? "done" : "see done");
    return '<div class="fx ' + stc + '" data-sugid="' + x.id + '"><div class="fxh">' + (x.label ? '<b>' + esc(x.label) + '</b>' : '') + '<span class="tag">' + esc(x.st) + '</span><span style="margin-left:auto"></span>'
      + (x.st === "Mở" ? '<button type="button" class="btn primary sm" data-sugyes="' + x.id + '"' + dis + '>Nhận</button><button type="button" class="btn quiet sm" data-sugno="' + x.id + '"' + dis + '>Bỏ</button>'
        : '<button type="button" class="btn quiet sm" data-sugundo="' + x.id + '"' + dis + '>Hoàn tác</button>') + '</div>'
      + '<div class="row">' + wordDiffHTML(x.old, x.nw) + '</div>' + (x.why ? '<div class="small muted">Lý do bỏ: ' + esc(x.why) + '</div>' : '') + (x.err ? '<div class="small no">' + esc(x.err) + '</div>' : '') + '</div>';
  }).join("");
  return h + '</div>';
}
function sugRenderAuthor(){
  ["NL", "CH", "WS"].forEach(function(sc){
    var fn = SUG_TARGET[sc]; if(!fn) return; var id; try{ id = fn(); }catch(e){ return; }
    var scr = document.getElementById(id); if(!scr) return;
    var box = scr.querySelector(":scope > .sugmount");
    var applies = (sc === "WS") === (typeof wsOn === "function" && wsOn());
    var h = applies ? sugAuthorHTML(sc) : "";
    if(!h){ if(box) box.remove(); return; }
    if(!box){ box = document.createElement("div"); box.className = "sugmount"; var after = scr.querySelector(":scope > .modebar") || scr.querySelector(":scope > h2"); if(after) after.insertAdjacentElement("afterend", box); else scr.insertBefore(box, scr.firstChild); }
    if(box.getAttribute("data-h") !== h){ box.innerHTML = h; box.setAttribute("data-h", h); }
  });
}
/* áp một đề xuất vào bài; trả "" nếu được, hoặc lý do không áp được */
function sugApplyOne(sc, x, back){
  var from = back ? x.nw : x.old, to = back ? x.old : x.nw;
  if(sc === "WS"){
    if(String(wsData()[x.k] || "") !== from) return "Ô " + (x.label || x.k) + " đã đổi sau khi người thẩm định sửa: sửa tay theo đề xuất rồi bấm Bỏ.";
    wsData()[x.k] = to; return "";
  }
  var slot = SUG_SLOT[sc], t = String(S.slots[slot] || ""), loc = findOld(t, from);
  if(!loc || loc.n !== 1) return back ? "Không còn thấy đúng một chỗ đã nhận trong bài (bài đã đổi tiếp): sửa tay nếu cần." : "Không còn thấy đúng một chỗ cần đổi trong bài (bài đã đổi ở đoạn này): sửa tay theo đề xuất rồi bấm Bỏ.";
  S.sugTmp = S.sugTmp || {}; S.sugTmp[slot] = t.slice(0, loc.i) + to + t.slice(loc.i + loc.len);
  return "";
}
function sugFinish(sc, before){
  if(sc === "WS"){ try{ wsSync(); }catch(e){} try{ wsRenderForm(); }catch(e){} try{ wsAfterEdit(true); }catch(e){} }
  else { var slot = SUG_SLOT[sc]; if(S.sugTmp && S.sugTmp[slot] !== undefined){ var v = S.sugTmp[slot]; delete S.sugTmp[slot]; wfBypass = true; try{ setSlot(slot, v); }finally{ wfBypass = false; } var ta = document.querySelector('textarea[data-slot="' + slot + '"]'); if(ta && ta.value !== v) ta.value = v; } }
  save(); try{ clRender(); }catch(e){} try{ if(sc === "CH") renderQ(); }catch(e){} try{ updateStepper(); }catch(e){}
  if(before && sc !== "WS"){
    var after = {NL:clStates("NL"), CH:(S.slots.questions||"").trim() ? clStates("CH") : null}, D = clDiff(before, after);
    if(D.worse.length) toast("Đã áp. Tiêu chí bị xấu đi: " + D.worse.map(function(w){ return w.c + " (" + (CL_SLAB[w.to] || w.to) + ")"; }).join(", ") + ". Bấm Hoàn tác nếu muốn quay lại.");
  }
  sugRenderAuthor();
}
function sugStates(){ return {NL:clStates("NL"), CH:(S.slots.questions||"").trim() ? clStates("CH") : null}; }
function bindSug(){
  document.addEventListener("input", function(e){
    var t = e.target; if(!t.getAttribute) return;
    var sc = t.getAttribute("data-sugta"), k = t.getAttribute("data-sugws");
    if(!sc && !k) return;
    sugData();
    if(sc) S.sugWork[sc] = t.value; else { S.sugWork.WS = S.sugWork.WS || {}; S.sugWork.WS[k] = t.value; sc = "WS"; }
    clearTimeout(bindSug.t); bindSug.t = setTimeout(function(){ save(); var pv = document.querySelector('[data-sugprev="' + sc + '"]'); if(pv) pv.innerHTML = sugPrevHTML(sc); try{ rvRender(); }catch(x){} }, 350);
  });
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("button"); if(!b) return;
    var a;
    if((a = b.getAttribute("data-sugreset"))){ sugData(); delete S.sugWork[a]; save(); try{ rvRender(); }catch(x){} toast("Đã bỏ hết phần đang sửa."); return; }
    var find = function(id){ var r = null; ["NL","CH","WS"].forEach(function(sc){ sugList(sc).forEach(function(x){ if(x.id === id) r = {sc:sc, x:x}; }); }); return r; };
    if((a = b.getAttribute("data-sugyes")) || (a = b.getAttribute("data-sugundo"))){
      var f = find(a); if(!f) return; var can = sugAuthorCan(f.sc); if(!can.ok){ toast(can.why); return; }
      var back = b.hasAttribute("data-sugundo"), before = f.sc === "WS" ? null : sugStates();
      if(back && f.x.st === "Đã bỏ"){ f.x.st = "Mở"; delete f.x.why; delete f.x.err; save(); sugRenderAuthor(); return; }
      var err = sugApplyOne(f.sc, f.x, back);
      if(err){ f.x.err = err; save(); sugRenderAuthor(); toast(err); return; }
      delete f.x.err; f.x.st = back ? "Mở" : "Đã nhận"; f.x.doneAt = Date.now();
      sugFinish(f.sc, before); return;
    }
    if((a = b.getAttribute("data-sugno"))){
      var g = find(a); if(!g) return; var can2 = sugAuthorCan(g.sc); if(!can2.ok){ toast(can2.why); return; }
      var why = window.prompt("Lý do bỏ đề xuất này (người thẩm định sẽ đọc):", ""); if(why === null) return;
      g.x.st = "Đã bỏ"; g.x.why = why.trim(); delete g.x.err; save(); sugRenderAuthor(); try{ wfRender(); }catch(x){} return;
    }
    if((a = b.getAttribute("data-sugall"))){
      var can3 = sugAuthorCan(a); if(!can3.ok){ toast(can3.why); return; }
      var before2 = a === "WS" ? null : sugStates(), bad = 0, okN = 0;
      // áp lần lượt trên bản đang đổi dần
      sugOpen(a).forEach(function(x){ if(a !== "WS" && S.sugTmp && S.sugTmp[SUG_SLOT[a]] !== undefined){ var tmp = S.sugTmp[SUG_SLOT[a]]; S.slots[SUG_SLOT[a]] = tmp; } var er = sugApplyOne(a, x, false); if(er){ x.err = er; bad++; } else { delete x.err; x.st = "Đã nhận"; x.doneAt = Date.now(); okN++; } });
      sugFinish(a, before2);
      toast("Đã nhận " + okN + " chỗ" + (bad ? "; " + bad + " chỗ không áp được (xem dòng đỏ trong từng ô)." : "."));
      return;
    }
  });
}
