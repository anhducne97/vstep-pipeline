/* ================= Bảng level CEFR của bài (bản gốc và bản đã sửa) =================
   Nick chốt 13/11/2026 (hướng 1): level tổng lấy từ Cathoven CEFR Checker (có ảnh minh chứng), không do trang tự tính.
   Trang chỉ đo các chỉ số có nguồn quy đổi công bố:
   - Từ vựng: mức ở ngưỡng phủ 95% (bỏ qua từ ngoài danh sách), CEFR-J Wordlist 1.5 + Octanove C1/C2. Gợi ý.
   - Độ dài câu trung bình: Khalifa và Weir (2009), bài đọc Cambridge KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6. Tham khảo.
   - Flesch Reading Ease: bảng quy đổi Flesch–CEFR của Linguapress.
   Bộ nhận diện ngữ pháp (hướng 2) cất ở src/_off/cefr_grammar.js, không ghép vào trang. */
var KW_ASL = [["A2",13.2],["B1",14.9],["B2",18.4],["C1",18.6],["C2",19.6]];
function aslBracket(asl){
  if(asl <= KW_ASL[0][1]) return {lo:0, hi:1, txt:"A2 trở xuống"};
  for(var i = 1; i < KW_ASL.length; i++) if(asl <= KW_ASL[i][1]) return {lo:LVL.indexOf(KW_ASL[i-1][0]), hi:LVL.indexOf(KW_ASL[i][0]), txt:KW_ASL[i-1][0] + "–" + KW_ASL[i][0]};
  return {lo:5, hi:5, txt:"C2"};
}
function sbText(which){ return which === "o" ? (S.srcLang === "vi" ? "" : (S.slots.src || S.slots.srcPdfText || "")) : (S.slots.draft || ""); }
function sbSig(which){ var t = sbText(which); return t.trim() ? t.length + ":" + qHash(t) : ""; }
var sbCache = {};
function sbData(which){
  var t = sbText(which), k = which + "|" + sbSig(which);
  if(sbCache[which] && sbCache[which].k === k) return sbCache[which].d;
  var d = null;
  if(t.trim()){ try{ var vp = vocabProfile(t), f = fleschOf(t); d = {voc:vp.N ? vp.lvl95In : null, voc98:vp.N ? vp.lvl98In : null, asl:f.ok ? f.asl : null, fre:f.ok ? f.fre : null}; }catch(e){ d = null; } }
  sbCache[which] = {k:k, d:d}; return d;
}
var SB_EXT = [["ca","Cathoven General Level","Tham khảo, ghi vào ô Level của file nộp. Miễn phí đến 250 từ; tài khoản miễn phí đến 500 từ"],["rg","roadtogrammar","Tham khảo. Miễn phí; chỉ dựa vào từ vựng"],["ti","Text Inspector Scorecard","Tham khảo. Gói trả phí (Standard)"]];
function sbParse(v){ var m = String(v || "").toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/); return m ? LVL.indexOf(m[1]) : null; }
function sbExt(which, key){ var e = (S.cefrExt || {})[which] || {}; return {v:e[key] || "", lv:sbParse(e[key]), stale:!!(e[key] && e[key + "Sig"] && e[key + "Sig"] !== sbSig(which))}; }
/* level Cathoven của bản đã sửa, dùng cho NL-B12 và câu lệnh sửa */
function cathovenNow(){ var x = sbExt("a", "ca"); return x.v ? x : null; }
function sbLvName(i){ return i === null || i === undefined || i < 0 ? "—" : (i >= 6 ? "trên C2" : LVL[i]); }
function sbCls(lo, hi, ti){ if(lo === null || lo === undefined) return "na"; if(hi === undefined) hi = lo; return hi < ti ? "lo" : (lo > ti ? "hi" : "ok"); }
function sbChip(txt, cls, tip){ return '<span class="sblv ' + cls + '"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(txt) + '</span>'; }
function sbHTML(){
  var ti = LVL.indexOf(S.level), O = sbData("o"), A = sbData("a"), isL = SPEC[S.spec] && SPEC[S.spec].skill === "L";
  function cell(D, fn){ return '<td>' + (D ? fn(D) : sbChip("—", "na", "Chưa có bài")) + '</td>'; }
  function vocC(D){ return sbChip(sbLvName(D.voc), sbCls(D.voc, D.voc, ti)); }
  function voc98C(D){ return sbChip(sbLvName(D.voc98), sbCls(D.voc98, D.voc98, ti)); }
  function aslC(D){ if(D.asl === null) return sbChip("—", "na", "Bài quá ngắn để tính"); var b = aslBracket(D.asl); return sbChip(b.txt, sbCls(b.lo, b.hi, ti)) + '<div class="sbsub">' + D.asl.toFixed(1).replace(".", ",") + ' từ</div>'; }
  function freC(D){ if(D.fre === null) return sbChip("—", "na", "Bài quá ngắn để tính"); var lv = LVL.indexOf(freBand(D.fre)[2]); return sbChip(LVL[lv], sbCls(lv, lv, ti)) + '<div class="sbsub">' + D.fre.toFixed(1).replace(".", ",") + '</div>'; }
  var rows = [];
  rows.push('<tr class="sbgrp"><td colspan="4">Trang tự đo</td></tr>');
  rows.push('<tr><td>Từ vựng ở ngưỡng 95%<div class="sbsub">mức thấp nhất phủ được 95% bài; ngưỡng của bài Đọc</div></td>' + cell(O, vocC) + cell(A, vocC) + '<td class="sbsrc">CEFR-J Wordlist 1.5 + Octanove C1/C2, bỏ qua từ ngoài danh sách (như ô "Mức ở ngưỡng 95%" của EC Text Profiler)</td></tr>');
  rows.push('<tr><td>Từ vựng ở ngưỡng 98%<div class="sbsub">chặn dưới "không dễ quá" (NL-B4): không thấp hơn mức mục tiêu</div></td>' + cell(O, voc98C) + cell(A, voc98C) + '<td class="sbsrc">Cùng danh sách. 95% và 98% là hai mức độ phủ thường dùng làm chỉ dấu của việc hiểu đủ (Laufer và Ravenhorst-Kalovski, 2010); trang tự tính vì EC Text Profiler chỉ báo mức 95%. Ngưỡng 98% làm chặn dưới: quy ước nhóm sau thử nghiệm 22 bài đối chiếu Cathoven</td></tr>');
  rows.push('<tr><td>Flesch Reading Ease</td>' + cell(O, freC) + cell(A, freC) + '<td class="sbsrc">Bảng quy đổi Flesch–CEFR của Linguapress: 90–100 A1 · 80–90 A2 · 70–80 B1 · 60–70 B2 · 50–60 C1 · dưới 50 C2' + (isL ? '. Linguapress lưu ý Flesch chấm hội thoại dễ hơn thực tế' : '') + '</td></tr>');
  rows.push('<tr><td>Độ dài câu trung bình<div class="sbsub">tham khảo: không tách được B2 với C1</div></td>' + cell(O, aslC) + cell(A, aslC) + '<td class="sbsrc">Khalifa và Weir (2009), bài đọc Cambridge: KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6' + (isL ? '. Mốc của bài Đọc' : '') + '</td></tr>');
  rows.push('<tr class="sbgrp"><td colspan="4">Công cụ ngoài · nhập level công cụ cho ra, lưu ảnh chụp màn hình</td></tr>');
  SB_EXT.forEach(function(e, i){
    var cellIn = function(w){
      var x = sbExt(w, e[0]), cls = x.lv === null ? "" : (x.stale ? "na" : sbCls(x.lv, x.lv, ti));
      return '<td><input type="text" class="sbin ' + cls + '" data-sbext="' + w + '.' + e[0] + '" value="' + esc(x.v) + '" placeholder="ví dụ B2.6" aria-label="' + esc(e[1]) + (w === "o" ? " bản gốc" : " bản đã sửa") + '">' + (x.stale ? '<div class="sbsub warnc">bài đã đổi sau lần nhập: chạy lại</div>' : '') + '</td>';
    };
    rows.push('<tr><td>' + esc(e[1]) + (i === 0 ? '<div class="sbsub">ghi vào file nộp nếu bài dưới 500 từ</div>' : '') + '</td>' + cellIn("o") + cellIn("a") + '<td class="sbsrc">' + esc(e[2]) + '</td></tr>');
  });
  return '<div class="sbhead"><span class="small">Mục tiêu <b>' + esc(S.level) + '</b> · Bản gốc là văn bản nguồn ở bước Nguồn</span><span class="small sblegend">' + sbChip(S.level, "ok") + ' đúng mức' + (ti > 0 ? ' ' + sbChip(LVL[ti-1], "lo") + ' thấp hơn' : '') + (ti < 5 ? ' ' + sbChip(LVL[ti+1], "hi") + ' cao hơn' : '') + '</span></div>'
    + '<div class="tablewrap"><table class="sbtab"><colgroup><col style="width:28%"><col style="width:17%"><col style="width:17%"><col style="width:38%"></colgroup><tr><th>Chỉ số</th><th>Bản gốc</th><th>Bản đã sửa</th><th>Nguồn</th></tr>' + rows.join("") + '</table></div>'
    + '<p class="small muted">Cách lấy level tổng: mở <a href="https://www.cathoven.com/cefr-checker/" target="_blank" rel="noopener">Cathoven CEFR Checker</a>, dán bài, ghi General Level vào ô, chụp màn hình kết quả và lưu vào thư mục bài. Trang ghi nhớ bài lúc nhập: sửa bài sau đó thì ô chuyển xám, cần chạy lại.</p>';
}
function sbRender(){
  var box = document.querySelectorAll(".cefrsb"); if(!box.length) return;
  var a = document.activeElement; if(a && a.getAttribute && a.getAttribute("data-sbext")) return;
  var h = sbHTML(); box.forEach(function(b){ b.innerHTML = h; });
}
function sbSummary(which){
  var parts = [];
  SB_EXT.forEach(function(x){ var e = sbExt(which, x[0]); if(e.v) parts.push(x[1].replace(" General Level", "").replace(" Scorecard", "") + " " + e.v + (e.stale ? " (chưa chạy lại)" : "")); });
  return parts.join(", ");
}
function bindSb(){
  document.addEventListener("input", function(ev){
    var el = ev.target; if(!el || !el.getAttribute) return; var k = el.getAttribute("data-sbext"); if(!k) return;
    var sc = el.closest(".screen"), p = k.split(".");
    if(sc && typeof wfCanEditScreen === "function" && !wfCanEditScreen(sc.id)){ el.value = sbExt(p[0], p[1]).v; toast("Chế độ xem: bạn không sửa được ô này."); return; }
    S.cefrExt = S.cefrExt || {o:{}, a:{}}; S.cefrExt[p[0]] = S.cefrExt[p[0]] || {};
    S.cefrExt[p[0]][p[1]] = el.value; S.cefrExt[p[0]][p[1] + "Sig"] = el.value.trim() ? sbSig(p[0]) : ""; save();
    var lv = sbParse(el.value); el.classList.remove("ok", "lo", "hi", "na"); if(lv !== null) el.classList.add(sbCls(lv, lv, LVL.indexOf(S.level)));
    document.querySelectorAll('[data-sbext="' + k + '"]').forEach(function(o){ if(o !== el){ o.value = el.value; o.className = el.className; } });
    try{ clRender(); }catch(e){}
  });
  document.addEventListener("focusout", function(ev){ if(ev.target && ev.target.getAttribute && ev.target.getAttribute("data-sbext")) setTimeout(function(){ sbRender(); try{ fillAuto(); }catch(e){} }, 0); });
  sbRender();
}
