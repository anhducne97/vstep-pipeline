/* ================= Xuất file Word theo mẫu nộp của VNCETA =================
   Một bài → một file .docx gồm hai phần, bố cục theo mẫu nộp:
   1. Ngữ liệu (khổ ngang): Nghe = Question | Original | Adapted; Đọc = Original text | Adapted text.
   2. Đề (Nghe khổ dọc, Đọc khổ ngang): Transcript/Reading text | Tiểu kỹ năng (Kỹ năng được đánh giá)/Level | Question.
   Ảnh minh chứng để chỗ trống có ghi chú, người soạn tự chèn. Thư viện docx (MIT) tải khi bấm nút. */
var XP_DOCX = null;
function xpLib(){ return XP_DOCX ? Promise.resolve(XP_DOCX) : import("./docx.mjs").then(function(m){ XP_DOCX = m; return m; }); }
var XP_QSTART = {L1:0, L2a:8, L2b:12, L2c:16, L3a:20, L3b:25, L3c:30, R1:0, R2:10, R3:20, R4:30};
function xpPart(){
  var s = S.spec;
  if(s === "L1") return "PART 1";
  if(/^L[23][abc]$/.test(s)) return "PART " + s[1] + "." + ("abc".indexOf(s[2]) + 1);
  return "PART " + s.slice(1);
}
function xpFirstQ(){ return (XP_QSTART[S.spec] || 0) + (S.spec === "L1" ? Math.max(0, (parseInt(S.l1slot,10)||1) - 1) : 0) + 1; }
function xpBac(lv, m){ return lv ? "Bậc " + lv.slice(1) + (m ? " " + m : "") : ""; }
/* kỹ năng được đánh giá của bài Đọc, theo cách diễn đạt của QĐ 730 (mục 2.2 Đọc) */
function xpRSkill(code, lv, m){
  var k = lv + " " + m, b5 = lv === "B5";
  var D = {
    "RE": k === "B3 thấp" ? "Xác định quy chiếu ngay trước hoặc sau từ quy chiếu" : "Xác định các quy chiếu phức tạp",
    "DE": k === "B3 thấp" ? "Nhận biết thông tin chi tiết được diễn đạt rõ ràng" : (b5 ? "Hiểu chi tiết tinh tế, phức tạp" : "Định vị và hiểu thông tin cụ thể"),
    "DE[P]": b5 ? "Hiểu thông tin được diễn giải khác bằng từ vựng bậc 5" : "Nhận biết thông tin tường minh được diễn đạt khác so với bài",
    "MI": "Xác định nội dung chính của văn bản",
    "MI[P]": "Hiểu ý chính của một đoạn văn bản",
    "IN": "Suy luận hàm ý của một câu hoặc chi tiết",
    "VO": k === "B4 thấp" ? "Đoán nghĩa từ mới trong ngữ cảnh\n(từ có nhiều nghĩa)" : "Đoán nghĩa của từ trong ngữ cảnh",
    "VO(ID)": "Hiểu thành ngữ, cách nói thông tục",
    "OP": b5 ? "Xác định quan điểm, thái độ hàm ngôn của tác giả" : (lv === "B4" && m !== "thấp" ? "Xác định lập trường, dụng ý của tác giả" : "Xác định quan điểm, thái độ được nói thẳng"),
    "TO": "Hiểu được giọng điệu chung của văn bản",
    "RP": b5 ? "Xác định mục đích của một thông tin hoặc lập luận" : "Hiểu mục đích, chức năng của văn bản",
    "LO": "Định vị thông tin cụ thể",
    "IS": b5 ? "Hiểu lô-gíc của một lập luận" : "Hiểu lô-gíc của câu dựa vào từ liên kết"
  };
  return D[code] || code || "";
}
/* tiểu kỹ năng của bài Nghe: theo dòng tương ứng của bảng phân bố */
function xpLSkill(i){
  var rows = [], R = (typeof qRows === "function") ? qRows() : [];
  R.forEach(function(r){ for(var j = 0; j < (r[2]||1); j++) rows.push(r); });
  var r = rows[i]; if(!r) return "";
  var sk = LSK[r[3][0]]; return sk ? sk[1] : "";
}
function xpLevelText(which){
  var parts = [], D = (typeof sbData === "function") ? sbData(which) : null;
  if(which === "a" && S.slots.pfLvl95 && S.slots.pfLvl95 !== "chưa đo") parts.push(S.slots.pfLvl95 + " (EC Text Profiler, mức từ vựng ở ngưỡng 95%)");
  var ext = (typeof sbSummary === "function") ? sbSummary(which) : ""; if(ext) parts.push(ext);
  if(!parts.length && D && D.voc !== null) parts.push("… (trang ước lượng: từ vựng ở ngưỡng 95% " + sbLvName(D.voc) + ", 96% tính cả từ ngoài danh sách " + sbLvName(D.voc98) + "; thay bằng số của công cụ)");
  return parts.length ? parts.join("; ") : "…";
}
function xpReadability(text){
  var f = text && text.trim() ? fleschOf(text) : null;
  if(!f || !f.ok) return "…";
  return "Flesch Reading Ease " + f.fre.toFixed(1) + (typeof f.fk === "number" ? "; Flesch–Kincaid Grade " + f.fk.toFixed(1) : "");
}
function xpSource(){
  var g = function(id){ return ((S.fields || {})[id] || "").trim(); };
  return [g("pc-src"), g("pc-url")].filter(Boolean).join(", ") || "…";
}
/* vị trí câu chứa căn cứ của từng câu hỏi trong bài */
function xpKeySpans(text, items, q0){
  var spans = [], low = text.toLowerCase();
  items.forEach(function(it, i){
    var b = (it.basis || "").trim(); if(!b) return;
    var s = low.indexOf(b.toLowerCase()), e = s >= 0 ? s + b.length : -1;
    if(s < 0){ try{ var f = qFuzzyLocate(text, b); if(f){ s = f.s; e = f.e; } }catch(x){} }
    if(s < 0) return;
    while(s > 0 && !/[.!?\n]/.test(text[s-1])) s--;
    while(s < e && /\s/.test(text[s])) s++;
    var m = text.slice(e).search(/[.!?…](["”’)]?)(\s|$)|\n/); if(m >= 0){ e = e + m; if(text[e] !== "\n"){ e++; while(/["”’)]/.test(text[e]||"")) e++; } } else e = text.length;
    spans.push({s:s, e:e, q:q0 + i});
  });
  spans.sort(function(a, b){ return a.s - b.s; });
  var out = []; spans.forEach(function(sp){ var last = out[out.length-1]; if(last && sp.s < last.e){ last.qs.push(sp.q); last.e = Math.max(last.e, sp.e); } else out.push({s:sp.s, e:sp.e, qs:[sp.q]}); });
  return out;
}
function xpBuild(d){
  var sp = SPEC[S.spec], isR = sp.skill === "R", P = (S.slots.questions||"").trim() ? parseQ(S.slots.questions).items : [];
  var orig = (S.srcLang === "vi" ? (S.slots.src || "") : (S.slots.src || S.slots.srcPdfText || "")).trim(), draft = (S.slots.draft || "").trim();
  var q0 = xpFirstQ(), qa = q0, qb = q0 + Math.max(P.length, (typeof qExpected === "function" ? qExpected() : 1)) - 1;
  var wcount = draft ? analyze(draft).total : 0;
  var FONT = "Times New Roman", SZ = 24;
  var T = function(t, o){ o = o || {}; return new d.TextRun({text:t, font:FONT, size:o.size || SZ, bold:!!o.b, italics:!!o.i, underline:o.u ? {} : undefined, color:o.c}); };
  var Pg = function(runs, o){ o = o || {}; return new d.Paragraph({children:runs, alignment:o.al, spacing:{after:o.after === undefined ? 80 : o.after}}); };
  var line = function(t, o){ return Pg([T(t, o)], o); };
  var note = function(t){ return line(t, {i:true, c:"7A7A7A"}); };
  var textParas = function(t){ return (t || "…").split(/\n/).filter(function(l){ return l.trim(); }).map(function(l){ return Pg([T(l)], {after:120}); }); };
  var cell = function(children, o){ o = o || {}; return new d.TableCell({children:children.length ? children : [Pg([T("")])], rowSpan:o.rs, width:o.w ? {size:o.w, type:d.WidthType.PERCENTAGE} : undefined, verticalAlign:o.va}); };
  var head = function(t){ return cell([Pg([T(t, {b:true})], {al:d.AlignmentType.CENTER})]); };
  var table = function(rows, pct){ var tw = 100; return new d.Table({rows:rows, width:{size:tw, type:d.WidthType.PERCENTAGE}, columnWidths:pct ? pct.map(function(x){ return Math.round(x * 140); }) : undefined, layout:d.TableLayoutType.FIXED}); };
  var A4 = {width:11906, height:16838}, M = {top:1134, bottom:1134, left:1134, right:1134};
  var landscape = {page:{size:{width:A4.width, height:A4.height, orientation:d.PageOrientation.LANDSCAPE}, margin:M}};
  var portrait = {page:{size:A4, margin:M}};
  var secs = [];
  /* 1. ngữ liệu */
  var c1 = [line(isR ? "READING – NGỮ LIỆU" : "LISTENING – NGỮ LIỆU", {b:true, size:28}), line(xpPart(), {b:true})];
  if(isR){
    c1.push(line("Source (Link/Book): " + xpSource()));
    c1.push(table([
      new d.TableRow({children:[head("Original text"), head("Adapted text")], tableHeader:true}),
      new d.TableRow({children:[
        cell(textParas(orig).concat([line("Readability: " + xpReadability(orig)), note("(Chèn ảnh chụp minh chứng đã đo)"), note("(Chèn ảnh chụp Original text)")]), {w:50}),
        cell(textParas(draft).concat([line("Readability: " + xpReadability(draft)), note("(Chèn ảnh chụp minh chứng đã đo)"), line("Word count: " + wcount)]), {w:50})
      ]})
    ], [50, 50]));
  } else {
    c1.push(table([
      new d.TableRow({children:[head("Question"), head("Original"), head("Adapted")], tableHeader:true}),
      new d.TableRow({children:[
        cell([Pg([T(qa === qb ? String(qa) : qa + "-" + qb)], {al:d.AlignmentType.CENTER})], {w:8}),
        cell(textParas(orig).concat([line("Level: " + xpLevelText("o")), note("(Chèn ảnh chụp minh chứng)"), line("Source (Link/Book): " + xpSource()), note("(Ảnh gốc nếu có)")]), {w:46}),
        cell(textParas(draft).concat([line("Level: " + xpLevelText("a")), note("(Chèn ảnh chụp minh chứng)"), line("Word count: " + wcount)]), {w:46})
      ]})
    ], [8, 46, 46]));
  }
  secs.push({properties:landscape, children:c1});
  /* 2. đề */
  var qCell = function(it, i){
    var n = q0 + i, kids = [Pg([T("Question " + n + ": ", {b:true}), T(it.stem || "…")])];
    ["A","B","C","D"].forEach(function(L){ var key = it.ans === L; kids.push(Pg([T(L + ". ", {u:key}), T(it.opts[L] || "", {u:key})], {after:40})); });
    if(isR){ var ex = [it.basis ? "… " + it.basis + " …" : "", it.explain || ""].filter(Boolean).join("\n"); kids.push(Pg([T("Giải thích: ", {b:true}), T(ex || "…")])); }
    return cell(kids, {w:isR ? 40 : 38});
  };
  var skillCell = function(it, i){
    var sk = isR ? xpRSkill(it.code, it.lv, it["mức"]) : xpLSkill(i);
    return cell([Pg([T((sk || "…") + "/" + (xpBac(it.lv, it["mức"]) || "…"))])], {w:isR ? 18 : 17});
  };
  var c2 = [];
  if(isR){
    var f = fleschOf(draft || "");
    c2.push(line("READING – " + xpPart(), {b:true, size:28}), line("Source: " + xpSource()), line("Readability: " + xpReadability(draft)), line("Word count: " + wcount));
    c2.push(line("Directions: In this section, you will read several passages. Each one is followed by several questions about it. For questions 1-40, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basis of what is stated or implied in that passage.", {i:true}));
    var rowsR = [new d.TableRow({children:[head("Reading text"), head("Kỹ năng được đánh giá/Bậc"), head("Question")], tableHeader:true})];
    var items = P.length ? P : [{stem:"", opts:{}}];
    items.forEach(function(it, i){
      var ch = [];
      if(i === 0) ch.push(cell(textParas(draft), {rs:items.length, w:42}));
      ch.push(skillCell(it, i), qCell(it, i));
      rowsR.push(new d.TableRow({children:ch}));
    });
    c2.push(table(rowsR, [42, 18, 40]));
    secs.push({properties:landscape, children:c2});
  } else {
    var lines = (draft || "…").split("\n"), spans = xpKeySpans(draft, P, q0), off = 0, tParas = [];
    lines.forEach(function(l){
      var runs = [], a = off, b = off + l.length, pos = a;
      spans.forEach(function(s){
        if(s.e <= a || s.s >= b) return;
        var ss = Math.max(s.s, a), ee = Math.min(s.e, b);
        if(ss > pos) runs.push(T(draft.slice(pos, ss)));
        if(ss === s.s) runs.push(T("(" + s.qs.map(function(q){ return "Q" + q; }).join(", ") + ") ", {b:true}));
        runs.push(T(draft.slice(ss, ee), {u:true})); pos = ee;
      });
      if(pos < b) runs.push(T(draft.slice(pos, b)));
      tParas.push(Pg(runs.length ? runs : [T("")]));
      off = b + 1;
    });
    tParas.push(line("(Word count: " + wcount + ")"));
    c2.push(line("LISTENING – " + xpPart(), {b:true, size:28}));
    c2.push(line(qa === qb ? "Question " + qa + ". Listen to …" : "Questions " + qa + " to " + qb + ". Listen to …", {i:true}));
    var rowsL = [new d.TableRow({children:[head("Transcript"), head("Tiểu kỹ năng/Level"), head("Question")], tableHeader:true})];
    var itemsL = P.length ? P : [{stem:"", opts:{}}];
    itemsL.forEach(function(it, i){
      var ch = [];
      if(i === 0) ch.push(cell(tParas, {rs:itemsL.length, w:45}));
      ch.push(skillCell(it, i), qCell(it, i));
      rowsL.push(new d.TableRow({children:ch}));
    });
    c2.push(table(rowsL, [45, 17, 38]));
    secs.push({properties:portrait, children:c2});
  }
  return new d.Document({creator:"Quy trình ngữ liệu VSTEP", styles:{default:{document:{run:{font:FONT, size:SZ}}}}, sections:secs});
}
function xpDownload(btn){
  if(!(S.slots.draft || "").trim()){ toast("Chưa có bài để xuất."); return; }
  var old = btn ? btn.textContent : ""; if(btn){ btn.disabled = true; btn.textContent = "Đang tạo file…"; }
  xpLib().then(function(d){ return d.Packer.toBlob(xpBuild(d)); }).then(function(blob){
    var name = ((S.code || "") + "_" + SPEC[S.spec].label).replace(/[\\\/:*?"<>|,]+/g, "").replace(/\s+/g, "_").replace(/^_+/, "") + ".docx";
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    toast("Đã tạo " + name + ". Mở file để chèn ảnh minh chứng.");
  }).catch(function(e){ toast("Không tạo được file: " + (e && e.message ? e.message : e)); })
  .then(function(){ if(btn){ btn.disabled = false; btn.textContent = old; } });
}
function bindXp(){
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-xpdocx]"); if(b) xpDownload(b); });
}
