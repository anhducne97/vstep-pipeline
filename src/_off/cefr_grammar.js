/* CẤT RIÊNG, KHÔNG GHÉP VÀO TRANG (build.py không đọc thư mục _off).
   Nick chọn hướng 1 ngày 13/11/2026: bảng level không đo ngữ pháp; level tổng lấy từ Cathoven.
   Bật lại nếu nhóm cần ước lượng level tổng trước khi dán bài lên Cathoven (hướng 2). */
/* ================= Bảng level CEFR của bài (bản gốc và bản đã sửa) =================
   Mỗi dòng ghi nguồn của mốc so sánh:
   - Từ vựng: mức ở ngưỡng phủ 95% (bỏ qua từ ngoài danh sách), CEFR-J Wordlist 1.5 + Octanove C1/C2.
   - Dạng động từ, mệnh đề: CEFR-J Grammar Profile ver. 20180315 (Tono Laboratory, TUFS; bản tiếng Anh ở
     github.com/openlanguageprofiles/olp-en-cefrj). Mỗi điểm ngữ pháp có bậc theo 4 khung (CEFR-J, Core Inventory,
     English Grammar Profile, GSE); trang lấy bậc thấp nhất mà ít nhất một khung xếp vào (Nick chốt 13/11/2026).
     Xuất hiện 1 lần cũng tính.
   - Độ dài câu trung bình: Khalifa và Weir (2009), bài đọc Cambridge KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6.
   - Flesch Reading Ease: bảng quy đổi Flesch–CEFR của Linguapress.
   - Level tổng: quy tắc Cathoven v1.0, mức cao nhất của (từ vựng, dạng động từ, mệnh đề − 0,5). */
var GP_LV = {"TA.PRPFPRG.AFF":[2,{"cj":"B2.1","ci":"B1-B2","egp":"B1-C2","gse":"B2"}],"TA.PASTPF.AFF":[2,{"cj":"B1.2","ci":"B1-C1","egp":"B1-C2"}],"TA.PASTPFPRG.AFF":[2,{"ci":"B2","egp":"B1-B2"}],"TA.FUTPRG.AFF":[1,{"cj":"B2.1","ci":"B1-C1","egp":"A2-C1"}],"TA.FUTPF.AFF":[3,{"ci":"B2-C1","egp":"B2-C1"}],"TA.FUTPFPRG.AFF":[3,{"ci":"B2-C1","egp":"B2-C2"}],"TA.PRPF.AFF":[0,{"cj":"A2.1","ci":"A2-B1","egp":"B1-B2, C2","gse":"A1-A2"}],"TA.PASTPRG.AFF":[1,{"cj":"A2.1","ci":"A2-C1","egp":"A2-C2"}],"PASS.PRESENT":[0,{"cj":"A1.2","egp":"A2-B2","gse":"A2-B1"}],"PASS.PAST.AFF":[1,{"cj":"A2.1","ci":"B1-C1","egp":"A2-B2"}],"PASS.PRSPRG.AFF":[1,{"ci":"B2-C1","egp":"A2-B2","gse":"C1"}],"PASS.PASTPRG.AFF":[1,{"ci":"B2-C1","egp":"A2-B2"}],"PASS.PRSPF.AFF":[1,{"cj":"B2.1","ci":"B2-C1","egp":"A2-B2","gse":"A2"}],"PASS.PASTPF.AFF":[1,{"ci":"B2-C1","egp":"A2-B2","gse":"B2"}],"PASS.FUT.AFF":[3,{"cj":"B2.1","ci":"C1","egp":"B2"}],"PASS.MD.AFF":[2,{"cj":"B1.2","ci":"C1","egp":"B2","gse":"B2"}],"PASS.MDPF.AFF":[3,{"ci":"B2-C1"}],"MD.MD_PF.AFF":[2,{"cj":"B2.1","ci":"B1","egp":"B1-B2, C2","gse":"C1"}],"MD.MD_PRG.AFF":[3,{"cj":"B2.1","egp":"B2"}],"VG.having_VN":[3,{"egp":"B2","gse":"C1"}],"VG.being_VN":[3,{"cj":"B2.1","egp":"B2"}],"VG.having_been_VN":[5,{"egp":"C2"}],"TO.to_have_done":[4,{"egp":"C1-C2"}],"TO.to_be_done":[2,{"cj":"B2.1","egp":"B1-B2"}],"MD.used_to.AFF":[1,{"cj":"B1.1","ci":"A2-C1","egp":"B1, C2","gse":"B1"}],"TO.be_about_to_do":[3,{"egp":"B2"}],"PREL.NR":[1,{"cj":"B1.1","ci":"B2","egp":"A2-B2","gse":"B2"}],"PREL.PREP_PREL":[3,{"cj":"B2.1","egp":"B2"}],"PRELGEN":[2,{"ci":"B2","egp":"B1-B2","gse":"B2"}],"CL.WH.whether":[2,{"cj":"B2.1","egp":"B1","gse":"B2"}],"CL.so_that":[2,{"cj":"B2.1","egp":"B1"}],"CL.as_soon_as":[2,{"egp":"B2-B1","gse":"B1"}],"CL.by_the_time":[4,{"egp":"C1"}],"CL.that.APP":[3,{"egp":"B2"}],"PP.it_that.AFF":[3,{"egp":"B2-C1"}],"WH.-ever":[3,{"cj":"B2.1","egp":"C1-C2"}],"SUBJ.PAST.AFF":[1,{"cj":"B1.2","ci":"B1-C1","egp":"A2-B1, B2","gse":"B2"}],"SUBJ.PASTPF.AFF":[2,{"ci":"B1-C1","egp":"C1","gse":"B2"}],"SUBJ.wish_PAST":[2,{"ci":"B2-C1","egp":"B1","gse":"B2"}],"SUBJ.wish_PASTPF":[3,{"ci":"B2-C1","egp":"B2"}],"SUBJ.as_if.though_PAST":[2,{"egp":"B1","gse":"B2"}],"SUBJ.if_only_PASTPF":[3,{"ci":"C1","egp":"B2、C2"}],"SUBJ.if_should":[4,{"egp":"C1"}],"SUBJ.INV.should":[4,{"egp":"C1"}],"SUBJ.INV.PASTPF":[null,{}],"INV.never.etc":[3,{"ci":"C1","egp":"B2, C2"}],"SUBJ.were_it_not_for":[5,{"egp":"C2"}],"SUBJ.had_it_not_been_for":[5,{"egp":"C2"}],"SUBJ.if_it_were_not_for":[5,{"egp":"C2"}],"SUBJ.if_it_hadn't_been_for":[5,{"egp":"C2"}],"COMP.the_the":[3,{"egp":"B2"}],"VG.P.AFF":[2,{"cj":"B1.1","egp":"B2-C1","gse":"C1"}],"VN.P.AFF":[2,{"egp":"B1-B2"}],"RBDEG.so_JJ.RB_that":[2,{"egp":"B1","gse":"B1"}],"RBDEG.such_JJ":[2,{"cj":"B2.1","egp":"B1","gse":"B1"}]};
var GP_VI = {"TA.PRPFPRG.AFF":"hiện tại hoàn thành tiếp diễn","TA.PASTPF.AFF":"quá khứ hoàn thành","TA.PASTPFPRG.AFF":"quá khứ hoàn thành tiếp diễn","TA.FUTPRG.AFF":"tương lai tiếp diễn","TA.FUTPF.AFF":"tương lai hoàn thành","TA.FUTPFPRG.AFF":"tương lai hoàn thành tiếp diễn","TA.PRPF.AFF":"hiện tại hoàn thành","TA.PASTPRG.AFF":"quá khứ tiếp diễn","PASS.PRESENT":"bị động hiện tại đơn","PASS.PAST.AFF":"bị động quá khứ đơn","PASS.PRSPRG.AFF":"bị động hiện tại tiếp diễn","PASS.PASTPRG.AFF":"bị động quá khứ tiếp diễn","PASS.PRSPF.AFF":"bị động hiện tại hoàn thành","PASS.PASTPF.AFF":"bị động quá khứ hoàn thành","PASS.FUT.AFF":"bị động tương lai (will be done)","PASS.MD.AFF":"bị động sau khiếm khuyết (can be done)","PASS.MDPF.AFF":"bị động khiếm khuyết hoàn thành (could have been done)","MD.MD_PF.AFF":"khiếm khuyết + have done (should have done)","MD.MD_PRG.AFF":"khiếm khuyết + be doing","VG.having_VN":"having done","VG.being_VN":"being done","VG.having_been_VN":"having been done","TO.to_have_done":"to have done","TO.to_be_done":"to be done","MD.used_to.AFF":"used to","TO.be_about_to_do":"be about to","PREL.NR":"mệnh đề quan hệ không xác định (, which/who)","PREL.PREP_PREL":"giới từ + which/whom","PRELGEN":"whose","CL.WH.whether":"whether","CL.so_that":"so that","CL.as_soon_as":"as soon as","CL.by_the_time":"by the time","CL.that.APP":"the fact that","PP.it_that.AFF":"it is + tính từ + that","WH.-ever":"whatever, whoever…","SUBJ.PAST.AFF":"câu điều kiện loại 2","SUBJ.PASTPF.AFF":"câu điều kiện loại 3","SUBJ.wish_PAST":"wish + quá khứ","SUBJ.wish_PASTPF":"wish + quá khứ hoàn thành","SUBJ.as_if.though_PAST":"as if, as though","SUBJ.if_only_PASTPF":"if only + quá khứ hoàn thành","SUBJ.if_should":"if … should","SUBJ.INV.should":"đảo ngữ Should you …","SUBJ.INV.PASTPF":"đảo ngữ Had I known …","INV.never.etc":"đảo ngữ sau Never, Rarely, Not only …","SUBJ.were_it_not_for":"were it not for","SUBJ.had_it_not_been_for":"had it not been for","SUBJ.if_it_were_not_for":"if it were not for","SUBJ.if_it_hadn't_been_for":"if it hadn't been for","COMP.the_the":"the more …, the more …","VG.P.AFF":"mệnh đề phân từ -ing","VN.P.AFF":"mệnh đề phân từ quá khứ","RBDEG.so_JJ.RB_that":"so … that","RBDEG.such_JJ":"such (a) … that"};
function gpCat(code){ return /^(TA|PASS|MD|TO)\./.test(code) || /^VG\.(having|being)/.test(code) ? "v" : "c"; }
var GP_IRR = " arisen awoken been beaten become begun bent bet bitten bled blown broken bred brought built burnt burned burst bought caught chosen clung come cost crept cut dealt dug done drawn dreamt drunk driven eaten fallen fed felt fought found fled flown forbidden forgotten forgiven frozen got gotten given gone ground grown hung had heard hidden hit held hurt kept knelt known laid led leant leapt learnt left lent let lain lit lost made meant met mistaken overcome paid proven put quit read ridden rung risen run said seen sought sold sent set sewn shaken shed shone shot shown shrunk shut sung sunk sat slept slid spoken spent spilt spun split spread sprung stood stolen stuck stung struck sworn swept swum swung taken taught torn told thought thrown understood undertaken undergone upset woken worn woven wept won wound withdrawn written ";
var GP_ADV = " not never just already also always still ever even only now recently probably often usually really certainly actually finally generally widely largely currently increasingly originally first then soon long once both all ";
var GP_INGN = " thing nothing something anything everything morning evening during according king ring sing bring spring string wing ceiling building including regarding concerning considering excluding notwithstanding ";
function gpIsPP(w){
  if(GP_IRR.indexOf(" " + w + " ") >= 0) return true;
  if(!/[a-z]{2,}ed$/.test(w)) return false;
  try{ var l = lexLemma(w); return l !== null && l !== w; }catch(e){ return false; }
}
function gpNorm(sent){
  var s = " " + sent.replace(/^\s*[A-Z][\w .'-]{0,24}:\s+/, "").replace(/[’‘]/g, "'").toLowerCase() + " ";
  s = s.replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "can not").replace(/\bshan't\b/g, "shall not").replace(/n't\b/g, " not")
       .replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'re\b/g, " are").replace(/'m\b/g, " am")
       .replace(/'s(?=\s+been\b)/g, " has").replace(/'s\b/g, " is")
       .replace(/'d(?=\s+(?:not\s+|never\s+|already\s+|just\s+)?(\w+))/g, function(m, nx){ return nx === "been" || gpIsPP(nx) ? " had" : " would"; });
  return s.replace(/\s+/g, " ");
}
function gpTag(w){
  if(/^(am|is|are)$/.test(w)) return "p"; if(/^(was|were)$/.test(w)) return "w";
  if(w === "be") return "e"; if(w === "been") return "n"; if(w === "being") return "g"; if(w === "having") return "v";
  if(w === "have" || w === "has") return "h"; if(w === "had") return "d";
  if(w === "will" || w === "shall") return "l";
  if(/^(can|could|may|might|must|should|would|ought)$/.test(w)) return "m";
  if(w === "to") return "t"; if(w === "usedto") return "u";
  if(GP_ADV.indexOf(" " + w + " ") >= 0 || (/ly$/.test(w) && w.length > 4 && !/^(family|only|early|likely|daily|holy|rely|reply|supply|apply|fly|july|italy|lonely|lovely|friendly|ugly|silly)$/.test(w))) return "a";
  if(gpIsPP(w)) return "P";
  if(/[a-z]{3,}ing$/.test(w) && GP_INGN.indexOf(" " + w + " ") < 0) return "G";
  return "x";
}
var GP_VPAT = [[/la*ha*na*G/g,"TA.FUTPFPRG.AFF"],[/ma*ha*na*P/g,"PASS.MDPF.AFF"],[/la*ha*na*P/g,"TA.FUTPF.AFF"],[/la*ha*P/g,"TA.FUTPF.AFF"],[/ma*ha*P/g,"MD.MD_PF.AFF"],
  [/da*na*G/g,"TA.PASTPFPRG.AFF"],[/ha*na*G/g,"TA.PRPFPRG.AFF"],[/da*na*P/g,"PASS.PASTPF.AFF"],[/ha*na*P/g,"PASS.PRSPF.AFF"],
  [/la*ea*G/g,"TA.FUTPRG.AFF"],[/ma*ea*G/g,"MD.MD_PRG.AFF"],[/la*ea*P/g,"PASS.FUT.AFF"],[/ma*ea*P/g,"PASS.MD.AFF"],
  [/pa*ga*P/g,"PASS.PRSPRG.AFF"],[/wa*ga*P/g,"PASS.PASTPRG.AFF"],[/va*na*P/g,"VG.having_been_VN"],[/va*P/g,"VG.having_VN"],
  [/ta*ha*P/g,"TO.to_have_done"],[/ta*ea*P/g,"TO.to_be_done"],[/ga*P/g,"VG.being_VN"],[/da*P/g,"TA.PASTPF.AFF"],[/ha*P/g,"TA.PRPF.AFF"],
  [/wa*G/g,"TA.PASTPRG.AFF"],[/pa*P/g,"PASS.PRESENT"],[/wa*P/g,"PASS.PAST.AFF"],[/u/g,"MD.used_to.AFF"]];
var GP_CMP = "more|less|fewer|better|worse|bigger|smaller|higher|lower|faster|slower|longer|shorter|harder|easier|greater|sooner|later|earlier|older|younger|stronger|weaker|wider|deeper|cheaper|richer|poorer|larger|closer|further|farther";
function gpClauses(s, raw, add){
  var t = s.trim(), q = /\?\s*["”']?\s*$/.test(raw);
  var R = function(re, code){ var m = s.match(re); if(m) add(code, m.length); };
  R(/,\s*(which|who|whom|whose)\b/g, "PREL.NR");
  R(/\b(in|on|at|by|for|from|with|to|of|under|through|during|about|into|without|between|among|within|upon|after|before)\s+(which|whom)\b/g, "PREL.PREP_PREL");
  if(!/^whose\b/.test(t)) R(/\bwhose\b/g, "PRELGEN");
  R(/\bwhether\b/g, "CL.WH.whether"); R(/\bso that\b/g, "CL.so_that"); R(/\bas soon as\b/g, "CL.as_soon_as");
  R(/\bby the time\b/g, "CL.by_the_time"); R(/\bthe fact that\b/g, "CL.that.APP");
  R(/\bit (is|was|has been|seems|seemed|became|becomes|appears|appeared) (\w+ly )?\w+ that\b/g, "PP.it_that.AFF");
  R(/\b(whatever|whoever|whichever|wherever|whenever|whomever)\b/g, "WH.-ever");
  R(/\bso (?!that\b)(\w+ ){1,2}that\b/g, "RBDEG.so_JJ.RB_that");
  R(/\bsuch (a |an )?(\w+ ){1,3}that\b/g, "RBDEG.such_JJ");
  R(/\bas (if|though)\b/g, "SUBJ.as_if.though_PAST");
  R(new RegExp("\\bthe (" + GP_CMP + ")\\b[^.;]*?, the (" + GP_CMP + ")\\b", "g"), "COMP.the_the");
  R(/\bwere it not for\b/g, "SUBJ.were_it_not_for"); R(/\bhad it not been for\b/g, "SUBJ.had_it_not_been_for");
  R(/\bif it (were|was) not for\b/g, "SUBJ.if_it_were_not_for"); R(/\bif it had not been for\b/g, "SUBJ.if_it_hadn't_been_for");
  R(/\bif ([a-z]+ ){1,3}should\b/g, "SUBJ.if_should");
  if(/\bif only\b[^,.]*\bhad \w+/.test(s)) add("SUBJ.if_only_PASTPF", 1);
  var wm = s.match(/\bwish(?:es|ed)? (?:that )?(?:[a-z]+ ){1,2}had (?:not |never )?([a-z]+)/);
  if(wm && gpIsPP(wm[1])) add("SUBJ.wish_PASTPF", 1);
  else if(/\bwish(?:es|ed)? (?:that )?(?:i|you|he|she|we|they|it|there|people|everyone) (were|was|could|would|had|did|knew|lived|[a-z]+ed)\b/.test(s)) add("SUBJ.wish_PAST", 1);
  var hasIf = /\bif\b/.test(s), wHave = /\b(would|could|might) (not )?have [a-z]+/.test(s);
  if(hasIf && wHave && !/\bif it had not been for\b/.test(s)) add("SUBJ.PASTPF.AFF", 1);
  else if(hasIf && /\b(would|could|might) (not )?(?!have\b)[a-z]+/.test(s) && /\bif\b[^,]*\b(were|was|had|did|could|knew|went|came|got|made|took|[a-z]+ed)\b/.test(s)) add("SUBJ.PAST.AFF", 1);
  if(!q && /^should (you|we|they|he|she|it|i|anyone|there|the|this|your|any)\b/.test(t)) add("SUBJ.INV.should", 1);
  if(!q && /^(had|were) (i|you|he|she|we|they|it|there|the|this)\b/.test(t)) add("SUBJ.INV.PASTPF", 1);
  if(/^(never|rarely|seldom|hardly|scarcely|little|no sooner|not only|nowhere|under no circumstances|at no time|only (?:when|after|then|by|if|once|in|later|through|with))\b[^,.;]*?\b(have|has|had|do|does|did|is|are|was|were|will|can|could|would|should|must|may|might) (i|you|he|she|it|we|they|the|this|these|those|there|anyone|people|nobody|no|our|their|his|her|its|my|your)\b/.test(t)) add("INV.never.etc", 1);
  var fi = t.match(/^([a-z]+)\b[^,]{0,80},/);
  if(fi){
    var w = fi[1];
    if(/[a-z]{3,}ing$/.test(w) && w !== "having" && GP_INGN.indexOf(" " + w + " ") < 0) add("VG.P.AFF", 1);
    else if(gpIsPP(w) && w !== "had" && w !== "been") add("VN.P.AFF", 1);
  }
  var mi = s.match(/, ([a-z]{3,}ing)\b/g);
  if(mi) mi.forEach(function(x){ var w = x.slice(2); if(GP_INGN.indexOf(" " + w + " ") < 0 && w !== "having" && w !== "being") add("VG.P.AFF", 1); });
}
function gramProfile(text){
  var res = {}, ex = {};
  if(!text || !text.trim()) return null;
  analyze(text).sents.forEach(function(raw){
    var s = gpNorm(raw);
    var add = function(code, n){ res[code] = (res[code] || 0) + n; if(!ex[code]) ex[code] = raw.length > 110 ? raw.slice(0, 107) + "…" : raw; };
    var s2 = s.replace(/\bought to\b/g, "ought").replace(/(^|\s)(?!(?:am|is|are|was|were|be|been|being|get|got|gets|getting) )(\S+) used to\b/g, function(m, a, b){ return a + b + " usedto"; }).replace(/^ used to\b/, " usedto");
    var words = s2.match(/[a-z]+/g) || [], T = words.map(gpTag).join("");
    GP_VPAT.forEach(function(p){ T = T.replace(p[0], function(m){ add(p[1], 1); return m.replace(/./g, "x"); }); });
    if(/\b(am|is|are|was|were|be|been) (just )?about to\b/.test(s)) add("TO.be_about_to_do", 1);
    gpClauses(s, raw, add);
  });
  var items = Object.keys(res).map(function(c){ var g = GP_LV[c] || [null, {}]; return {code:c, n:res[c], lv:g[0], src:g[1], cat:gpCat(c), vi:GP_VI[c] || c, ex:ex[c]}; });
  items.sort(function(a, b){ return (b.lv === null ? -1 : b.lv) - (a.lv === null ? -1 : a.lv) || b.n - a.n; });
  function top(cat){ var it = items.filter(function(x){ return x.cat === cat && x.lv !== null; }); return it.length ? it[0] : null; }
  return {items:items, verb:top("v"), clause:top("c")};
}
/* ---------- level từng chỉ số ---------- */
var KW_ASL = [["A2",13.2],["B1",14.9],["B2",18.4],["C1",18.6],["C2",19.6]];
function aslBracket(asl){
  if(asl <= KW_ASL[0][1]) return {lo:0, hi:1, txt:"A2 trở xuống"};
  for(var i = 1; i < KW_ASL.length; i++) if(asl <= KW_ASL[i][1]) return {lo:LVL.indexOf(KW_ASL[i-1][0]), hi:LVL.indexOf(KW_ASL[i][0]), txt:KW_ASL[i-1][0] + "–" + KW_ASL[i][0]};
  return {lo:5, hi:5, txt:"C2"};
}
function cefrOf(text){
  if(!text || !text.trim()) return null;
  var vp = vocabProfile(text), f = fleschOf(text), g = gramProfile(text);
  var voc = vp.N ? vp.lvl95In : null;
  var vb = g && g.verb ? g.verb.lv : 0, cl = g && g.clause ? g.clause.lv : 0;
  var parts = [{k:"voc", v:voc === null ? -1 : voc}, {k:"verb", v:vb}, {k:"clause", v:cl - 0.5}];
  parts.sort(function(a, b){ return b.v - a.v; });
  var ov = voc === null ? null : parts[0].v;
  return {vp:vp, voc:voc, f:f, g:g, verb:vb, clause:cl, asl:f.ok ? f.asl : null, fre:f.ok ? f.fre : null, overall:ov, by:parts[0].k};
}
function sbLvName(i){ return i === null || i === undefined || i < 0 ? "—" : (i >= 6 ? "trên C2" : LVL[Math.floor(i)]); }
function sbCls(lo, hi, ti){ if(lo === null || lo === undefined) return "na"; if(hi === undefined) hi = lo; return hi < ti ? "lo" : (lo > ti ? "hi" : "ok"); }
function sbChip(txt, cls, tip){ return '<span class="sblv ' + cls + '"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(txt) + '</span>'; }
function sbSrcTip(it){ var m = {cj:"CEFR-J", ci:"Core Inventory", egp:"EGP", gse:"GSE"}; return Object.keys(it.src || {}).map(function(k){ return m[k] + " " + it.src[k]; }).join(" · "); }
function sbGramCell(top, lv, ti){
  if(!top) return sbChip("A1–A2", sbCls(1, 1, ti), "Chỉ có cấu trúc cơ bản") + '<div class="sbsub">chỉ cấu trúc cơ bản</div>';
  return sbChip(sbLvName(lv), sbCls(lv, lv, ti), sbSrcTip(top)) + '<div class="sbsub" title="' + esc(sbSrcTip(top)) + '">' + esc(top.vi) + ' ×' + top.n + '</div>';
}
var SB_EXT = [["ca","Cathoven General Level","Miễn phí; bài trên 250 từ cần tài khoản Cathoven Hub (miễn phí)"],["rg","roadtogrammar","Miễn phí; chỉ dựa vào từ vựng"],["ti","Text Inspector Scorecard","Gói trả phí (Standard)"]];
function sbParse(v){ var m = String(v || "").toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/); return m ? LVL.indexOf(m[1]) : null; }
var sbCache = {};
function sbData(which){
  var t = which === "o" ? (S.srcLang === "vi" ? "" : (S.slots.src || S.slots.srcPdfText || "")) : (S.slots.draft || "");
  var k = which + "|" + t.length + "|" + qHash(t);
  if(sbCache[which] && sbCache[which].k === k) return sbCache[which].d;
  var d = null; try{ d = cefrOf(t); }catch(e){ d = null; }
  sbCache[which] = {k:k, d:d}; return d;
}
function sbHTML(){
  var ti = LVL.indexOf(S.level), O = sbData("o"), A = sbData("a"), L = S.spec && S.spec.charAt(0) === "L";
  var ext = S.cefrExt || {o:{}, a:{}};
  if(!O && !A) return '<p class="small muted">Chưa có bài. Dán văn bản nguồn (bước Nguồn) và bài đang làm để xem bảng.</p>';
  function cell(D, fn){ return '<td>' + (D ? fn(D) : sbChip("—", "na")) + '</td>'; }
  var rows = [];
  rows.push('<tr class="sbgrp"><td colspan="4">Trang tự đo</td></tr>');
  rows.push('<tr><td>Từ vựng<div class="sbsub">mức ở ngưỡng phủ 95%, bỏ qua từ ngoài danh sách</div></td>' + cell(O, function(D){ return sbChip(sbLvName(D.voc), sbCls(D.voc, D.voc, ti)); }) + cell(A, function(D){ return sbChip(sbLvName(D.voc), sbCls(D.voc, D.voc, ti)); }) + '<td class="sbsrc">CEFR-J Wordlist 1.5 + Octanove C1/C2</td></tr>');
  rows.push('<tr><td>Dạng động từ<div class="sbsub">thì, bị động, khiếm khuyết; lấy cấu trúc cao nhất</div></td>' + cell(O, function(D){ return sbGramCell(D.g && D.g.verb, D.verb, ti); }) + cell(A, function(D){ return sbGramCell(D.g && D.g.verb, D.verb, ti); }) + '<td class="sbsrc">CEFR-J Grammar Profile: bậc thấp nhất trong 4 khung (CEFR-J, Core Inventory, EGP, GSE)</td></tr>');
  rows.push('<tr><td>Mệnh đề<div class="sbsub">quan hệ, trạng ngữ, điều kiện, đảo ngữ; lấy cấu trúc cao nhất</div></td>' + cell(O, function(D){ return sbGramCell(D.g && D.g.clause, D.clause, ti); }) + cell(A, function(D){ return sbGramCell(D.g && D.g.clause, D.clause, ti); }) + '<td class="sbsrc">CEFR-J Grammar Profile: bậc thấp nhất trong 4 khung</td></tr>');
  rows.push('<tr><td>Độ dài câu trung bình<div class="sbsub">tham khảo, không tính vào level tổng</div></td>' + cell(O, function(D){ if(D.asl === null) return sbChip("—", "na", "Bài quá ngắn"); var b = aslBracket(D.asl); return sbChip(b.txt, sbCls(b.lo, b.hi, ti)) + '<div class="sbsub">' + D.asl.toFixed(1).replace(".", ",") + ' từ</div>'; }) + cell(A, function(D){ if(D.asl === null) return sbChip("—", "na", "Bài quá ngắn"); var b = aslBracket(D.asl); return sbChip(b.txt, sbCls(b.lo, b.hi, ti)) + '<div class="sbsub">' + D.asl.toFixed(1).replace(".", ",") + ' từ</div>'; }) + '<td class="sbsrc">Khalifa và Weir (2009), bài đọc Cambridge: KET 13,2 · PET 14,9 · FCE 18,4 · CAE 18,6 · CPE 19,6' + (L ? '. Mốc của bài Đọc, bài Nghe chỉ để tham khảo' : '') + '</td></tr>');
  rows.push('<tr><td>Flesch Reading Ease</td>' + cell(O, function(D){ if(D.fre === null) return sbChip("—", "na", "Bài quá ngắn"); var lv = LVL.indexOf(freBand(D.fre)[2]); return sbChip(LVL[lv], sbCls(lv, lv, ti)) + '<div class="sbsub">' + D.fre.toFixed(1).replace(".", ",") + '</div>'; }) + cell(A, function(D){ if(D.fre === null) return sbChip("—", "na", "Bài quá ngắn"); var lv = LVL.indexOf(freBand(D.fre)[2]); return sbChip(LVL[lv], sbCls(lv, lv, ti)) + '<div class="sbsub">' + D.fre.toFixed(1).replace(".", ",") + '</div>'; }) + '<td class="sbsrc">Bảng quy đổi Flesch–CEFR của Linguapress: 90–100 A1 · 80–90 A2 · 70–80 B1 · 60–70 B2 · 50–60 C1 · dưới 50 C2' + (L ? '. Linguapress lưu ý Flesch chấm hội thoại dễ hơn thực tế' : '') + '</td></tr>');
  rows.push('<tr class="sbgrp"><td colspan="4">Ước lượng tổng</td></tr>');
  var byTxt = {voc:"từ vựng", verb:"dạng động từ", clause:"mệnh đề − 0,5"};
  rows.push('<tr class="sbtot"><td>Level tổng<div class="sbsub">mức cao nhất của: từ vựng, dạng động từ, mệnh đề − 0,5</div></td>' + cell(O, function(D){ return sbChip(sbLvName(D.overall), sbCls(D.overall === null ? null : Math.floor(D.overall), undefined, ti)) + '<div class="sbsub">theo ' + byTxt[D.by] + '</div>'; }) + cell(A, function(D){ return sbChip(sbLvName(D.overall), sbCls(D.overall === null ? null : Math.floor(D.overall), undefined, ti)) + '<div class="sbsub">theo ' + byTxt[D.by] + '</div>'; }) + '<td class="sbsrc">Quy tắc Cathoven v1.0 (trang hỏi đáp của Cathoven). Bản v2.0 của Cathoven có thêm mô hình AI chấm độ khó từng câu, không công bố, nên số của trang có thể khác Cathoven</td></tr>');
  rows.push('<tr class="sbgrp"><td colspan="4">Công cụ ngoài · nhập level công cụ cho ra</td></tr>');
  SB_EXT.forEach(function(e){
    var cellIn = function(w){ var v = (ext[w] || {})[e[0]] || "", lv = sbParse(v); return '<td><input type="text" class="sbin ' + (lv === null ? "" : sbCls(lv, lv, ti)) + '" data-sbext="' + w + '.' + e[0] + '" value="' + esc(v) + '" placeholder="ví dụ B2.6" aria-label="' + esc(e[1]) + (w === "o" ? " bản gốc" : " bản đã sửa") + '"></td>'; };
    rows.push('<tr><td>' + esc(e[1]) + '</td>' + cellIn("o") + cellIn("a") + '<td class="sbsrc">' + esc(e[2]) + '</td></tr>');
  });
  var det = function(D, name){
    if(!D || !D.g || !D.g.items.length) return '<p class="small muted">' + name + ': chưa thấy cấu trúc nào ngoài thì đơn, tiếp diễn cơ bản.</p>';
    return '<p class="small"><b>' + name + '</b></p><ul class="small sblist">' + D.g.items.map(function(it){ return '<li>' + sbChip(it.lv === null ? "?" : LVL[it.lv], it.lv === null ? "na" : sbCls(it.lv, it.lv, ti), it.lv === null ? "Không khung nào trong CEFR-J Grammar Profile ghi bậc cho cấu trúc này" : sbSrcTip(it)) + ' ' + esc(it.vi) + ' ×' + it.n + ' <span class="muted">(' + esc(it.cat === "v" ? "động từ" : "mệnh đề") + (it.lv === null ? "; nguồn không ghi bậc, không tính" : "; " + esc(sbSrcTip(it))) + ')</span><div class="muted sbex">' + esc(it.ex) + '</div></li>'; }).join("") + '</ul>';
  };
  return '<div class="sbhead"><span class="small">Mục tiêu <b>' + esc(S.level) + '</b></span><span class="small sblegend">' + sbChip(S.level, "ok") + ' đúng mức ' + sbChip("thấp", "lo") + ' thấp hơn ' + sbChip("cao", "hi") + ' cao hơn</span></div>'
    + '<div class="tablewrap"><table class="sbtab"><colgroup><col style="width:30%"><col style="width:17%"><col style="width:17%"><col style="width:36%"></colgroup><tr><th>Chỉ số</th><th>Bản gốc</th><th>Bản đã sửa</th><th>Nguồn của mốc</th></tr>' + rows.join("") + '</table></div>'
    + '<details class="sbdet"><summary class="small">Các cấu trúc trang nhận ra (nhận bằng luật nên có thể sót hoặc nhầm; rê chuột lên ô level để xem bậc của từng khung)</summary>' + det(O, "Bản gốc") + det(A, "Bản đã sửa") + '</details>';
}
function sbRender(){
  var box = document.querySelectorAll(".cefrsb"); if(!box.length) return;
  var focus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-sbext");
  if(focus) return;
  var h = sbHTML(); box.forEach(function(b){ var open = b.querySelector("details.sbdet") && b.querySelector("details.sbdet").open; b.innerHTML = h; if(open){ var d = b.querySelector("details.sbdet"); if(d) d.open = true; } });
}
function sbSummary(which){
  var D = sbData(which); if(!D) return "";
  var e = (S.cefrExt || {})[which] || {}, out = ["ước lượng " + sbLvName(D.overall)];
  SB_EXT.forEach(function(x){ if(e[x[0]]) out.push(x[1].replace(" General Level", "").replace(" Scorecard", "") + " " + e[x[0]]); });
  return out.join(", ");
}
function bindSb(){
  document.addEventListener("input", function(ev){
    var el = ev.target; if(!el || !el.getAttribute) return; var k = el.getAttribute("data-sbext"); if(!k) return;
    var sc = el.closest(".screen"); if(sc && typeof wfCanEditScreen === "function" && !wfCanEditScreen(sc.id)){ toast("Chế độ xem: bạn không sửa được ô này."); return; }
    var p = k.split("."); S.cefrExt = S.cefrExt || {o:{}, a:{}}; S.cefrExt[p[0]] = S.cefrExt[p[0]] || {}; S.cefrExt[p[0]][p[1]] = el.value; save();
    var lv = sbParse(el.value); el.classList.remove("ok", "lo", "hi"); if(lv !== null) el.classList.add(sbCls(lv, lv, LVL.indexOf(S.level)));
    document.querySelectorAll('[data-sbext="' + k + '"]').forEach(function(o){ if(o !== el){ o.value = el.value; o.className = el.className; } });
  });
  document.addEventListener("focusout", function(ev){ if(ev.target && ev.target.getAttribute && ev.target.getAttribute("data-sbext")) setTimeout(sbRender, 0); });
  sbRender();
}
