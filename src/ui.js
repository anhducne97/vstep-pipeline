/* ================= UI (giao diện từng bước) ================= */
var CODE_RULE = "Trình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: ";
function fmtPrompt(key, from, to){
  if(!P[key]) return;
  var before = P[key].t;
  P[key].t = before.replace(from, to);
  if(P[key].t === before && typeof console!=="undefined") console.warn("fmtPrompt: không thay được", key);
}
var NO_RARE = "Không làm bài khó lên bằng từ trên mức {level}, từ ít gặp hay câu đánh đố. Khi cần nâng độ khó (Flesch cao quá, mức từ vựng thấp hơn mục tiêu) thì dùng từ đúng mức {level}, cụm động từ, kết hợp từ, câu phức hợp lý (đề xuất của tập huấn; nếu đá với các yêu cầu bắt buộc ở trên thì theo yêu cầu bắt buộc).";
function applyOutputRules(){
  fmtPrompt("b4", 'Trình bày: bài đọc trước; sau một dòng "---", ghi ', CODE_RULE + 'bài đọc trước; sau đó một dòng riêng "=== GHI CHÚ ===", rồi ghi ');
  ["quickfix","b6up","frefix"].forEach(function(k){ fmtPrompt(k, /Trình bày: toàn bài đã sửa trước; sau một dòng "---", /, CODE_RULE + 'toàn bài đã sửa trước; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi '); });
  fmtPrompt("b6", /Trình bày: bài đã sửa trước; sau một dòng "---", /, CODE_RULE + 'toàn bài đã sửa trước; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi ');
  fmtPrompt("fixpara", /Trình bày: toàn bài sau khi sửa; sau một dòng "---", /, CODE_RULE + 'toàn bài sau khi sửa; sau đó một dòng riêng "=== THAY ĐỔI ===", rồi ');
  ["b8_1","b8_2","b8_3"].forEach(function(k){ fmtPrompt(k, /Cuối bài, sau một dòng "---", ghi số từ\./, 'Trình bày toàn bộ trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code; cuối khối code là một dòng riêng "=== GHI CHÚ ===" rồi ghi số từ.'); });
  fmtPrompt("b3", "Chỉ trả về bản dịch.", "Chỉ trả về bản dịch, đặt trong MỘT khối code (```text ... ```); các đoạn cách nhau một dòng trống.");
  fmtPrompt("facts", "Chỉ trả về đoạn dữ kiện.", "Chỉ trả về đoạn dữ kiện, đặt trong MỘT khối code (```text ... ```).");
  fmtPrompt("b7", /Viết đúng khuôn dưới đây để trang web tự áp dụng\. Không thêm chữ nào khác trong phần này, không dùng bảng, không in đậm\.\nDòng đầu tiên của phần B là:/,
    "Đặt TOÀN BỘ phần B trong MỘT khối code (```text ... ```) để người dùng bấm nút Copy của khối code. Trong khối code: không dùng bảng, không in đậm, không gạch đầu dòng; mỗi trường SỬA, CŨ, MỚI, LÝ DO nằm trên một dòng riêng.\nDòng đầu tiên trong khối code là:");
  ["quickfix","b6","b6up","frefix","fixpara"].forEach(function(k){ fmtPrompt(k, /(=== THAY ĐỔI ===", rồi [^\n]*?)(\.?)(\n|$)/, "$1, mỗi thay đổi một dòng.$3"); });
  // trang tự so từng chữ với bản trước, nên không bắt AI tự kể các thay đổi (danh sách đó không được dùng)
  Object.keys(P).forEach(function(k){ if(!P[k] || !P[k].t) return; P[k].t = P[k].t.replace(/toàn bài (?:đã sửa trước|sau khi sửa|đã sửa); sau đó một dòng riêng "=== THAY ĐỔI ===", rồi [^\n]*?mỗi thay đổi một dòng\./g, "chỉ có toàn bài đã sửa, không viết gì thêm sau bài. Không cần liệt kê các thay đổi: trang soạn đề tự so từng chữ với bản trước."); });
  // không làm bài khó lên bằng từ hiếm (tập huấn, bước cân bằng độ khó): mọi câu lệnh sửa bài
  ["quickfix","b6","b6up","fixpara","frefix","bothfix","wordfix","fixall","ovfix"].forEach(function(k){
    if(!P[k] || !P[k].t || P[k].t.indexOf(NO_RARE) >= 0) return; var m = P[k].t.search(/\n(Trình bày TOÀN BỘ|Đặt TOÀN BỘ)/); if(m >= 0) P[k].t = P[k].t.slice(0, m + 1) + NO_RARE + "\n\n" + P[k].t.slice(m + 1);
  });
}
/* ---------- Làm sạch chữ dán từ chatbot ---------- */
/* chữ dán vào có thể ở dạng tách dấu (Unicode NFD, hay gặp khi chép trên máy Mac/iPhone): "DÒNG" thành D + O + dấu huyền + NG,
   các khuôn tìm "DÒNG", "CÂU", "CHỖ HỎI"… sẽ không nhận ra; đưa về dạng dựng sẵn (NFC) trước khi đọc */
function cleanPaste(t){
  t = t || ""; if(t.normalize) t = t.normalize("NFC");
  return t.replace(/\r/g,"").replace(/[​-‍﻿]/g,"").replace(/ /g," ")
    .split("\n").filter(function(l){ return !/^\s*```[\w-]*\s*$/.test(l); }).join("\n").replace(/^\s+|\s+$/g,"");
}
var SPLIT_RE = /\n[ \t]*(?:={2,}[ \t]*(?:GHI CH[ÚU]|THAY Đ[ỔO]I|THAY DOI)[ \t]*={2,}|-{3,}|\*{3,}|_{3,})[ \t]*(?:\n|$)/i;
var CHATTY_RE = /^(here is|here's|below is|sure|certainly|dưới đây|đây là|bài (đã|đọc|viết)|kịch bản)[^\n]{0,100}:\s*\n/i;
var REMIND_SPLIT = 'Hãy gửi lại TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```). Giữa bài và phần ghi chú phải có một dòng riêng "=== GHI CHÚ ===" (hoặc "=== THAY ĐỔI ===" nếu là bài đã sửa). Không viết gì bên ngoài khối code.';
var REMIND_B7 = 'Hãy viết lại PHẦN B trong MỘT khối code (```text ... ```). Dòng đầu tiên: === CÁC CHỖ SỬA ===. Mỗi chỗ sửa gồm 4 dòng riêng:\nSỬA 1 | PHẢI SỬA (hoặc NÊN XEM, TỰ NHIÊN)\nCŨ: (chép y nguyên một câu trong bản biên tập)\nMỚI: (câu thay thế)\nLÝ DO: (một dòng)\nCác khối cách nhau một dòng trống. Không in đậm, không dùng bảng, không gạch đầu dòng.';
function remindHTML(text){ return ' <button class="btn quiet" type="button" data-remind="' + esc(text).replace(/\n/g,"&#10;") + '">Sao chép câu nhắc AI</button>'; }
function bindRemind(root){ (root||document).querySelectorAll("[data-remind]").forEach(function(b){ if(b.dataset.bound) return; b.dataset.bound = "1"; b.addEventListener("click", function(){ copyText(b.getAttribute("data-remind"), b, "Sao chép câu nhắc AI", "Đã sao chép. Dán vào cùng cuộc trò chuyện với AI"); }); }); }
SLOTS.pdfName = {label:"Tên file PDF", type:"text", ph:"ví dụ: Safira_Chikaraishi_2022.pdf"};
SLOTS.pdfScope = {label:"Phần dùng trong file", hint:"Trang hoặc mục AI cần đọc.", type:"text", ph:"ví dụ: trang 2–9; mục Introduction, Results, Conclusion"};
SLOTS.srcPdfText = {label:"Chữ copy từ PDF (không bắt buộc)", type:"area", optional:true, empty:""};
function isPdfSrc(id){ return S.srcMode==="pdf" && ((id==="src" && S.srcLang!=="vi") || (id==="srcVi" && S.srcLang==="vi")); }
function pdfRef(){
  var n = (S.slots.pdfName||"").trim(), sc = (S.slots.pdfScope||"").trim();
  if(!n || !sc) return "";
  return "(Văn bản nguồn nằm trong file PDF đính kèm: \"" + n + "\". Chỉ dùng phần: " + sc + ". Đọc trực tiếp từ file. Chỗ nào trong file không đọc rõ (bảng, hình, chữ mờ, công thức) thì ghi rõ là không đọc được, không đoán.)";
}
function pdfOn(){ return S.srcMode==="pdf" && S.srcLang!=="vi" && SPEC[S.spec].skill==="R"; }
var SOURCE_NEEDS = {
  R1:"là văn bản thực dụng có nhiều mục thông tin tách bạch (thời gian, địa điểm, giá, điều kiện, cách liên hệ), đúng thể loại thông báo, quảng cáo, hướng dẫn, mô tả công việc hoặc thư.",
  R2:"có số liệu và kết quả nghiên cứu cụ thể, có giải thích nguyên nhân–kết quả, và nếu được thì có nhận định của nhà nghiên cứu.",
  R3:"có giải thích hoặc lập luận về một vấn đề, có ý kiến của chuyên gia hay nhà nghiên cứu (đồng tình, phản bác, cảnh báo), có ví dụ minh hoạ.",
  R4:"có quan điểm rõ của tác giả, có nhiều góc nhìn hoặc tranh luận, có ví dụ minh hoạ và có chỗ để người đọc tự suy luận (nếu là văn chương: có nhân vật, cảm xúc, ẩn ý).",
  L1:"có thông tin thực dụng ngắn, cụ thể: giờ, địa điểm, giá, cách làm.",
  L2:"có tình huống hai người có thể trao đổi: kế hoạch, lựa chọn, ý kiến khác nhau.",
  L3:"có giải thích một khái niệm, có lập luận, ý kiến của chuyên gia và ví dụ minh hoạ."
};
var ANCHOR_RE = /^\s*[-*•]?\s*(MI\[P\]|DE\[P\]|VO\(ID\)|RE|DE|MI|VO|OP|TO|RP|INF|IN|IS|SS|LO)\s*[|:]\s*([^|\n]*?)\s*(?:\|\s*(.*?))?\s*$/i;
function parseAnchors(notes){
  var map = {}, found = false;
  (notes||"").split(/\n/).forEach(function(line){
    var m = line.replace(/\*\*/g,"").match(ANCHOR_RE); if(!m) return;
    found = true;
    var code = m[1].toUpperCase().replace(/^INF$/,"IN"), a = (m[2]||"").trim(), q = (m[3]||"").replace(/^["“'”]+|["“”']+$/g,"").trim();
    if(!map[code]) map[code] = [];
    if(/không có/i.test(a) && !q) map[code].push({none:true});
    else map[code].push({para:a, quote:q});
  });
  return found ? map : null;
}
function normQ(s){ return (s||"").toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim(); }
function renderAnchors(){
  var boxes = document.querySelectorAll(".anchormap"); if(!boxes.length) return;
  var sp = SPEC[S.spec];
  if(sp.skill!=="R" || !sp.skills){ boxes.forEach(function(b){ b.innerHTML = ""; }); return; }
  var codes = sp.skills.split(/\s*,\s*/), map = parseAnchors(S.slots.notes), d = normQ(S.slots.draft);
  boxes.forEach(function(box){
    var checkDraft = box.hasAttribute("data-check");
    if(!map){ box.innerHTML = '<p class="small muted">Chưa có bản đồ điểm neo. Bản đồ nằm ở mục (6) trong phần ghi chú AI viết ở bước 4.</p>'; return; }
    var have = 0, missing = [];
    var rows = codes.map(function(c){
      var list = map[c.toUpperCase()];
      if(!list){ missing.push(c); return '<li class="w"><b>' + esc(c) + '</b> AI chưa ghi</li>'; }
      var real = list.filter(function(x){ return !x.none; });
      if(!real.length){ missing.push(c); return '<li class="w"><b>' + esc(c) + '</b> không có chỗ tự nhiên</li>'; }
      have++;
      return real.map(function(x){
        var still = !checkDraft || !x.quote || d.indexOf(normQ(x.quote)) >= 0;
        return '<li class="' + (still ? "g" : "w") + '"><b>' + esc(c) + '</b> ' + esc(x.para) + (x.quote ? ': <i>' + esc(x.quote) + '</i>' : '') + (checkDraft && !still ? ' <span>(không còn nguyên văn trong bài, có thể đã bị sửa)</span>' : '') + '</li>';
      }).join("");
    }).join("");
    var hi = missing.filter(function(c){ return /^(IN|INF|OP|TO|SS|IS)$/.test(c); });
    box.innerHTML = '<p class="small"><b>Có chỗ để hỏi: ' + have + ' / ' + codes.length + ' mã kỹ năng của ' + esc(sp.label) + '.</b> ' + (missing.length ? 'Chưa có: ' + esc(missing.join(", ")) + '.' : '') + '</p><ul class="anc">' + rows + '</ul>'
      + '<p class="small muted">Chỉ để tham khảo, không bắt sửa. Mã chưa có thì hỏi mã khác của Part. ' + (hi.length >= 2 ? '<b>Thiếu nhiều mã bậc cao (' + esc(hi.join(", ")) + '): nên cân nhắc chọn nguồn có lập luận, nhận định hoặc ví dụ hơn, thay vì ép AI thêm vào.</b>' : 'Đừng yêu cầu AI thêm vào để lấp mã thiếu, vì dễ làm bài gượng hoặc đi xa nguồn.') + '</p>';
  });
}
P.frefix = {title:"Câu lệnh tăng độ dễ đọc (Flesch Reading Ease)", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây có Flesch Reading Ease khoảng {freNow} (câu trung bình {aslNow} từ, trung bình {spwNow} âm tiết mỗi từ). Yêu cầu: Flesch Reading Ease từ {freMin} trở lên, ứng với mức {level}. Để đạt, cần khoảng: {freLever}\n\nHãy sửa theo thứ tự ưu tiên:\n1. Tách các câu dài hoặc nhiều mệnh đề thành câu ngắn hơn, nhất là các câu sau: {longestSents}\n2. Thay một số từ nhiều âm tiết bằng từ ngắn hơn cùng nghĩa, ở mức {level} trở xuống (ví dụ approximately → about, purchase → buy, however → but). Không thay tên riêng, thuật ngữ chính của bài và các từ giữ lại: {{keep}}. Các từ nhiều âm tiết dùng nhiều trong bài: {polyWords}\n3. Ưu tiên tách câu trước, vì thay từ dễ làm bài tụt dưới mức từ vựng {level}. Không thay một từ đúng mức {level} bằng từ dễ hơn hẳn nếu không cần.\n4. Không thêm thông tin, không đổi sự kiện, con số, thứ tự ý. Giữ tổng số từ trong {wordsK} và giữ số đoạn.\n\n{slackRules}\n\n{locks}\n\nTrình bày: toàn bài đã sửa trước; sau một dòng \"---\", liệt kê từng thay đổi theo dạng: câu cũ → câu mới.\n\n{refs}\n\nBÀI:\n{{draft}}"};
P.bothfix = {title:"Câu lệnh sửa cùng lúc: từ vựng dễ quá và độ dễ đọc thấp", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây đang gặp hai vấn đề ngược chiều nhau:\n- Từ vựng dễ hơn mức mục tiêu: tính cả từ ngoài danh sách là từ khó, mức ở ngưỡng 96% là {lvl98Txt}; cần {floorText}, tức độ phủ ở mức {belowLevel} (hiện {covBelowTxt}) phải xuống dưới 96%.\n- Độ dễ đọc thấp hơn yêu cầu: Flesch Reading Ease khoảng {freNow}, cần từ {freMin} (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ).\n\nCách thay từ thông thường sẽ làm vấn đề này tốt lên nhưng vấn đề kia xấu đi. Vì vậy CHỈ sửa theo hai cách sau, vì hai cách này có lợi cho cả hai:\n1. Tách câu: tách câu dài hoặc nhiều mệnh đề thành câu ngắn hơn. Độ dễ đọc tăng, từ vựng không đổi. Nhất là các câu: {longestSents}\n2. Thay từ dài mà dễ bằng từ ngắn mà khó hơn: thay các từ 3 âm tiết trở lên ở mức thấp (danh sách dưới) bằng từ 1–2 âm tiết, cùng nghĩa trong câu, ở mức {upRange} có trong CEFR-J Wordlist 1.5 hoặc Octanove Vocabulary Profile 1.0.{shortExamples} Cần thay {upN}.\nCác từ dài mà dễ trong bài: {longEasyWords}\n\nKhông được làm:\n- Không thay từ ngắn bằng từ dài hơn.\n- Không dùng từ trên mức {level} hoặc từ không có trong hai danh sách trên.\n- Không thay tên riêng, thuật ngữ chính, từ khoá trong tiêu đề, và các từ giữ lại: {{keep}}.\n- Không thêm thông tin, không đổi sự kiện, con số, thứ tự ý. Giữ tổng số từ trong {wordsK} và giữ số đoạn.\n\n{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: toàn bài đã sửa trước; sau đó một dòng riêng \"=== THAY ĐỔI ===\", rồi liệt kê từng thay đổi theo dạng: câu cũ → câu mới, hoặc từ cũ → từ mới (mức CEFR, số âm tiết), mỗi thay đổi một dòng.\n\n{refs}\n\nBÀI:\n{{draft}}"};
var SHORT_POOL = "cope grasp keen boost ease odd dense rural urban ban vital venue route trek lush soar vast scenic vivid hire tend urge eager gain taste ferry humid glimpse stall seek wander fare bold brief crisp fierce harsh steep swift chief prime core trait trend stake scope span shift grant yield cease crash crowd crew dawn dusk fade feast flaw frame gap gaze grief harm haste heap hint host lane leap lure mere mild myth norm path peak pile plea plot pose praise rage rash realm rely remote reveal roam rough rush scarce seize shed shelter shore slight sole stark sum surge tense theme thrill tide toll tough trace treat trim vague vow wage wealth wipe".split(" ");
function shortExamplesFor(levelIdx){
  var seen = {}, out = [];
  SHORT_POOL.forEach(function(w){ if(seen[w]) return; seen[w] = 1; if(LEXM[w]===levelIdx && sylCount(w) <= 2) out.push(w); });
  return out.slice(0, 14);
}
var lastFre = null;
function currentFre(){ var d = S.slots.draft||""; if(!d.trim()) return null; if(!lastFre) lastFre = fleschOf(d); return lastFre; }
function freHowText(L){
  L = L || S.level; var r = FRE_ASL[L];
  return "Flesch Reading Ease phải nằm trong khoảng " + freWin(L) + " (khoảng của mức " + L + "; cao hơn là dễ quá, thấp hơn là khó quá). Cách giữ trong khoảng: câu trung bình khoảng " + r[0] + "–" + r[1] + " từ, từ trung bình khoảng " + FRE_SPW[L] + " âm tiết; không câu nào trên 25 từ, không dồn nhiều câu rất ngắn liền nhau; dùng từ nội dung 2–3 âm tiết đúng mức " + L + " xen với từ ngắn, không cố chọn toàn từ ngắn hoặc toàn từ dài.";
}
function freExtend(v){
  var fm = FRE_MIN[S.level], fx = FRE_MAX[S.level]; v.freMin = String(fm); v.freMax = fx > 200 ? "" : String(fx);
  v.freWin = freWin(); v.freWinShort = freWinShort(); v.freHow = freHowText();
  var f = currentFre(), AR = FRE_ASL[S.level], isL = SPEC[S.spec].skill==="L";
  v.shortestSents = "không có"; v.monoWords = "không có"; v.spkTrim = "";
  if(!f || !f.ok){ v.freNow = "chưa đo"; v.aslNow = "?"; v.spwNow = "?"; v.freLever = "chưa đo được (bài cần ít nhất 60 từ và 3 câu)."; v.longestSents = "không có"; v.polyWords = "không có"; return; }
  v.freNow = f.fre.toFixed(1); v.aslNow = f.asl.toFixed(1); v.spwNow = f.spw.toFixed(2);
  var parts = [];
  if(freIn(f.fre)) parts.push("bài đã nằm trong khoảng; giữ nguyên độ dài câu và độ dài từ hiện tại.");
  else if(f.fre < fm){
    var tg = Math.min(fm + 3, (fm + fx) / 2), needAsl = (206.835 - 84.6*f.spw - tg) / 1.015;
    if(needAsl >= AR[0]){
      parts.push("tách câu: giảm độ dài câu trung bình từ " + f.asl.toFixed(1) + " xuống khoảng " + needAsl.toFixed(1) + " từ, tức tách thêm khoảng " + Math.max(1, Math.ceil(f.W/needAsl) - f.S) + " câu. Cách này đủ để đạt, không cần thay từ");
    } else {
      var aslT = Math.min(f.asl, AR[0]), spwT = (206.835 - 1.015*aslT - tg) / 84.6;
      var cut = Math.max(0, Math.ceil(f.W/aslT) - f.S), rep = Math.max(1, Math.ceil((f.spw - spwT) * f.W / 1.5));
      parts.push("chỉ tách câu là không đủ (câu sẽ ngắn dưới " + AR[0] + " từ, quá ngắn cho mức " + S.level + "). Cần kết hợp: " + (cut ? "tách thêm khoảng " + cut + " câu để câu trung bình còn khoảng " + aslT.toFixed(0) + " từ, và " : "") + "thay khoảng " + rep + " từ 3 âm tiết trở lên bằng từ 1–2 âm tiết cùng nghĩa (để số âm tiết trung bình còn khoảng " + spwT.toFixed(2) + ")");
    }
    parts.push("không sửa quá tay: Flesch phải dưới " + fx);
  } else {
    var tg2 = Math.max(fx - 3, (fm + fx) / 2), needAsl2 = (206.835 - 84.6*f.spw - tg2) / 1.015;
    if(needAsl2 <= AR[1]){
      parts.push("gộp câu: tăng độ dài câu trung bình từ " + f.asl.toFixed(1) + " lên khoảng " + needAsl2.toFixed(1) + " từ, tức gộp bớt khoảng " + Math.max(1, f.S - Math.floor(f.W/needAsl2)) + " câu (nối hai câu ngắn liền nhau bằng and, but, so, because hoặc dấu phẩy). Cách này đủ để đạt, không cần thay từ");
    } else {
      var aslH = Math.max(f.asl, AR[1]), spwH = (206.835 - 1.015*aslH - tg2) / 84.6;
      var join = Math.max(0, f.S - Math.floor(f.W/aslH)), rep2 = Math.max(1, Math.ceil((spwH - f.spw) * f.W / 1.2));
      parts.push("chỉ gộp câu là không đủ (câu sẽ dài quá " + AR[1] + " từ, nặng hơn mức " + S.level + "). Cần kết hợp: " + (join ? "gộp bớt khoảng " + join + " câu để câu trung bình lên khoảng " + aslH.toFixed(0) + " từ, và " : "") + "thay khoảng " + rep2 + " từ 1 âm tiết bằng từ 2–3 âm tiết cùng nghĩa, cùng mức " + S.level + " (để số âm tiết trung bình lên khoảng " + spwH.toFixed(2) + ")");
    }
    parts.push("không sửa quá tay: Flesch phải từ " + fm + " trở lên");
  }
  v.shortestSents = f.shortest.length ? f.shortest.map(function(l){ return "\"" + l.s + "\" (" + l.n + " từ)"; }).join("; ") : "không có";
  var keepM = {}; keepList().forEach(function(k){ keepM[k.toLowerCase()] = 1; });
  var mw = f.mono.filter(function(p){ return !keepM[p.w]; }).slice(0, 15).map(function(p){ return p.w + (p.n>1 ? " ×" + p.n : ""); });
  v.monoWords = mw.length ? mw.join(", ") : "không có";
  if(isL && typeof spkTrimText==="function") v.spkTrim = spkTrimText();
  v.freLever = parts.join("; ");
  var tiB = LVL.indexOf(S.level), bi2 = LVL.indexOf(v.belowLevel), keepB = {};
  keepList().forEach(function(k){ keepB[k.toLowerCase()] = 1; });
  var topicB = {}; (analyze(S.slots.draft||"").titles||[]).forEach(function(t){ (t.text.toLowerCase().match(/[a-z]+/g)||[]).forEach(function(w){ var l = lexLemma(w); topicB[l||w] = 1; }); });
  var le = f.poly.filter(function(p){ var parts = p.w.split("-"), lem = lexLemma(parts[parts.length-1]); if(keepB[p.w] || topicB[lem||p.w]) return false; return lem===null || LEXM[lem] <= Math.max(0, bi2); }).slice(0, 15)
    .map(function(p){ var parts = p.w.split("-"), lem = lexLemma(parts[parts.length-1]); return p.w + " (" + (lem===null ? "ngoài danh sách" : LVL[LEXM[lem]]) + ", " + sylCount(p.w) + " âm tiết" + (p.n>1 ? ", ×" + p.n : "") + ")"; });
  v.longEasyWords = le.length ? le.join("; ") : "không có";
  var ex = shortExamplesFor(tiB);
  v.shortExamples = ex.length ? " Ví dụ từ ngắn ở mức " + S.level + ": " + ex.join(", ") + "." : "";
  v.longestSents = f.longest.map(function(l){ return "\"" + l.s + "\" (" + l.n + " từ)"; }).join("; ");
  var keep = {}; keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var pw = f.poly.filter(function(p){ return !keep[p.w]; }).slice(0, 12).map(function(p){ return p.w + (p.n>1 ? " ×" + p.n : ""); });
  v.polyWords = pw.length ? pw.join(", ") : "không có";
}

/* ================= Bộ sửa tổng quát: tự sinh câu lệnh từ trạng thái các dòng kiểm ================= */
function draftSig(t){ var h = 0, s = (t||"").trim(); for(var i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) | 0; } return s.length + ":" + h; }
function pfUsable(){ return S.pfSig && S.pfSig === draftSig(S.slots.draft); }
function evalChecks(){
  var txt = S.slots.draft || ""; if(!txt.trim()) return null;
  var sp = SPEC[S.spec], a = lastAnalysis || analyze(txt), vp = currentVocab(), fr = currentFre();
  var ti = LVL.indexOf(S.level), fl = Math.max(0, ti - (parseInt(S.floor,10)||0)), fm = FRE_MIN[S.level];
  var C = {}, isR = sp.skill==="R";
  // độ dài
  if(sp.min){ var lo = sp.min, hi = sp.max; } else { var lo = sp.approx - 15, hi = sp.approx + 15; }
  C.len = {ok: a.total>=lo && a.total<=hi, now:a.total, lo:lo, hi:hi, room:{up:hi-a.total, down:a.total-lo}};
  C.len.near = C.len.ok && Math.min(C.len.room.up, C.len.room.down) <= 5;
  if(isR){
    var tp = S.spec==="R1" ? 4 : (parseInt(S.paras,10)||5);
    C.paras = {ok: a.body.length===tp, now:a.body.length, target:tp};
    C.title = {ok: a.titles.length===1, now:a.titles.length};
  }
  C.long = {ok: !a.long.length, list:a.long};
  // từ vựng: ưu tiên số Text Profiler nếu còn khớp bài hiện tại
  var usePf = pfUsable(), pfCov = parseFloat(String(S.slots.pfCov||"").replace(",", ".")), pfL = ["A1","A2","B1","B2","C1","C2","trên C2"].indexOf(S.slots.pfLvl95||"");
  var covNow = usePf && !isNaN(pfCov) ? pfCov : vp.cum[ti], lvlNow = usePf && pfL>=0 ? pfL : vp.lvl95In;
  C.hard = {ok: covNow >= sp.cov && !(usePf && pfL > ti), now:covNow, src: usePf && !isNaN(pfCov) ? "Text Profiler" : "trang ước lượng"};
  C.hard.near = C.hard.ok && covNow < sp.cov + 1.5;
  var belowCov = fl>0 ? vp.cumIn[fl-1] : 0;
  var lvlEasy = easyLvl(vp), belowCov98 = fl>0 ? vp.cum[fl-1] : 0;
  C.easy = {ok: lvlEasy >= fl, now:lvlEasy, floor:fl, src:"trang tính, ngưỡng " + EASY_TH + "%"};
  C.easy.near = C.easy.ok && fl>0 && belowCov98 >= EASY_TH - 1.5;
  if(fr && fr.ok){ var fx = FRE_MAX[S.level]; C.fre = {ok: freIn(fr.fre), low: fr.fre < fm, high: fr.fre >= fx, now:fr.fre, min:fm, max:fx}; C.fre.nearLow = C.fre.ok && fr.fre < fm + 3; C.fre.nearHigh = C.fre.ok && fx < 200 && fr.fre > fx - 3; C.fre.near = C.fre.nearLow || C.fre.nearHigh; }
  var wantUK = S.spelling==="Anh–Anh", wrong = (wantUK ? a.us : a.uk).concat(wantUK ? a.usDates : a.ukDates);
  C.spell = {ok: !wrong.length, list:wrong};
  var lostKeep = keepList().filter(function(k){ return !new RegExp("(^|[^\\p{L}])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?=$|[^\\p{L}])","u").test(txt.toLowerCase()); });
  C.keep = {ok: !lostKeep.length, list:lostKeep};
  return {C:C, a:a, vp:vp, fr:fr, ti:ti, fl:fl, fm:fm, sp:sp, isR:isR};
}
function buildFixPlan(){
  var E = evalChecks(); if(!E) return null;
  var C = E.C, sp = E.sp, L = S.level, goals = [], keeps = [], acts = [], data = [], forb = [];
  var floorName = LVL[E.fl], range = E.fl===E.ti ? L : floorName + "–" + L;
  var freTight = C.fre && (C.fre.low || C.fre.nearLow), freHi = C.fre && (C.fre.high || C.fre.nearHigh), easyTight = !C.easy.ok || C.easy.near, hardTight = !C.hard.ok || C.hard.near;
  // ---- mục tiêu (dòng đỏ) và thao tác tương ứng
  if(!C.len.ok){
    if(C.len.now < C.len.lo){
      goals.push("Độ dài: " + C.len.now + " từ, thiếu " + (C.len.lo - C.len.now) + " từ (cần " + sp.words + ", tính cả tiêu đề): thêm từ " + (C.len.lo - C.len.now) + " đến " + (C.len.hi - C.len.now) + " từ.");
      var addN = C.len.lo - C.len.now + 3, nS = Math.max(1, Math.round(addN/12));
      acts.push("Thêm khoảng " + addN + " từ (khoảng " + (nS<=2 ? "1–2" : nS) + " câu) diễn đạt lại " + (nS<=2 ? "một chi tiết" : "các chi tiết") + " CÓ TRONG NGUỒN mà bài chưa dùng (xem văn bản nguồn bên dưới)" + (nS>6 ? "; nếu nguồn không đủ chi tiết, dừng lại và báo thiếu bao nhiêu từ thay vì tự thêm ý" : "") + ". Câu thêm dài khoảng " + FRE_ASL[L][0] + "–" + FRE_ASL[L][1] + " từ" + (hardTight ? ", chỉ dùng từ ở mức " + L + " trở xuống có trong danh sách" : "") + (freTight ? ", ưu tiên từ 1–2 âm tiết" : (freHi ? ", không viết câu rất ngắn, có từ nội dung 2–3 âm tiết" : "")) + ". Không thêm ý ngoài nguồn, không thêm câu bình luận.");
    } else {
      goals.push("Độ dài: " + C.len.now + " từ, thừa " + (C.len.now - C.len.hi) + " từ (cần " + sp.words + "): bớt từ " + (C.len.now - C.len.hi) + " đến " + (C.len.now - C.len.lo) + " từ.");
      acts.push("Bớt khoảng " + (C.len.now - C.len.hi + 3) + " từ: rút gọn cách diễn đạt dài dòng, bỏ từ thừa, hoặc bỏ một chi tiết phụ không nằm trong bản đồ điểm neo và không chứa từ giữ lại.");
    }
  }
  if(C.paras && !C.paras.ok){ goals.push("Số đoạn: có " + C.paras.now + ", cần " + C.paras.target + "."); acts.push("Chia lại cho đúng " + C.paras.target + " đoạn theo ý chính (mỗi đoạn một ý, các đoạn không dài đều nhau, cách nhau một dòng trống). Không đổi câu chữ khi chia đoạn."); }
  if(C.title && !C.title.ok){ goals.push("Tiêu đề: " + (C.title.now ? "có " + C.title.now + " dòng giống tiêu đề" : "không có") + "."); acts.push("Đặt đúng một tiêu đề ở dòng đầu, tối đa 10 từ, không có dấu chấm cuối; các dòng khác đều phải kết thúc bằng dấu câu."); }
  if(!C.long.ok){ goals.push("Câu dài: " + C.long.list.length + " câu trên 25 từ: " + C.long.list.map(function(l){ return "\"" + l.s.split(/\s+/).slice(0, 6).join(" ") + "…\" (" + l.n + " từ)"; }).join("; ") + ". Tách mỗi câu thành hai câu."); acts.push("Tách các câu trên 25 từ thành câu ngắn hơn: " + C.long.list.map(function(l){ return "\"" + l.s + "\""; }).join("; ")); }
  if(!C.hard.ok){
    var cg = covGapText(C.hard.now, sp.cov, L);
    goals.push("Không khó quá: độ phủ ở mức " + L + " là " + C.hard.now.toFixed(1) + "% (" + C.hard.src + ")" + cg.now + ", cần từ " + sp.cov + "%" + cg.need + "." + aboveTopText(E.vp, E.ti, 8));
    acts.push("Thay các từ trên mức " + L + " và từ ngoài danh sách CEFR-J/Octanove (danh sách bên dưới) bằng từ cùng nghĩa ở mức " + range + (easyTight ? " (không thấp hơn " + floorName + ", vì bài đang sát ngưỡng \"không dễ quá\")" : "") + (freTight ? "; chọn từ 1–2 âm tiết" : (freHi ? "; chọn từ có số âm tiết bằng hoặc nhiều hơn từ cũ (Flesch đang ở mép trên)" : "")) + ". Giữ nguyên tên riêng và thuật ngữ chính.");
    data.push("TỪ CẦN HẠ (" + C.hard.src + "):\n{aboveList}");
  }
  if(!C.easy.ok){
    goals.push("Không dễ quá: tính cả từ ngoài danh sách là từ khó, mức ở ngưỡng " + EASY_TH + "% của bài đang là " + lvlName(C.easy.now) + " (" + C.easy.src + "), cần " + (E.fl===E.ti ? "đúng " + L : floorName + " hoặc " + L) + "." + easyGapText(E.vp, E.fl, E.ti) + " Từ dùng nhiều có thể nâng: {upCands6}.");
    if(freHi){
      acts.push("Thay một số từ ngắn, thông dụng (1 âm tiết) bằng từ cùng nghĩa ở mức " + range + " có 2–3 âm tiết: cách này vừa nâng mức từ vựng vừa kéo Flesch xuống. Cần {upN}.");
      data.push("TỪ THÔNG DỤNG CÓ THỂ NÂNG: {upCands}\nTỪ 1 ÂM TIẾT DÙNG NHIỀU: {monoWords}");
    } else if(freTight){
      acts.push("Thay từ dài mà dễ (3 âm tiết trở lên, mức thấp; danh sách bên dưới) bằng từ 1–2 âm tiết cùng nghĩa ở mức " + range + ". Cần {upN}." + "{shortExamples}");
      data.push("TỪ DÀI MÀ DỄ TRONG BÀI: {longEasyWords}");
    } else {
      acts.push("Thay một số từ thông dụng bằng từ cùng nghĩa ở mức " + range + ", có số âm tiết tương đương từ cũ. Cần {upN}." + "{shortExamples}");
      data.push("TỪ THÔNG DỤNG CÓ THỂ NÂNG: {upCands}");
    }
  }
  if(C.fre && C.fre.low){
    goals.push("Độ dễ đọc: Flesch Reading Ease " + C.fre.now.toFixed(1) + ", thấp hơn khoảng " + freWin() + " của mức " + L + " (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ). Cách đạt: {freLever}");
    acts.push("Tách câu dài hoặc nhiều mệnh đề thành câu ngắn hơn, nhất là: {longestSents}");
    if(!easyTight) acts.push("Thay từ nhiều âm tiết bằng từ ngắn hơn cùng nghĩa và CÙNG mức (không dễ hơn): {polyWords}");
  }
  if(C.fre && C.fre.high){
    goals.push("Độ dễ đọc: Flesch Reading Ease " + C.fre.now.toFixed(1) + ", cao hơn khoảng " + freWin() + " của mức " + L + ", tức dễ quá theo Flesch (câu trung bình {aslNow} từ, {spwNow} âm tiết mỗi từ). Cách đạt: {freLever}");
    acts.push("Gộp các câu rất ngắn liền nhau thành một câu (nối bằng and, but, so, because hoặc dấu phẩy), không tạo câu trên 25 từ" + (E.isR ? "" : "; lời đáp ngắn thì gắn vào câu sau bằng dấu phẩy (\"Right, so the deadline is Friday.\") thay vì để thành câu riêng") + ". Các câu ngắn trong bài: {shortestSents}");
    if(!hardTight) acts.push("Thay một số từ 1 âm tiết bằng từ cùng nghĩa, CÙNG mức " + L + ", có 2–3 âm tiết (không lên mức trên " + L + "). Từ 1 âm tiết dùng nhiều: {monoWords}");
    else acts.push("Từ vựng đang sát ngưỡng khó: KHÔNG thay từ để kéo Flesch xuống, chỉ gộp câu.");
    if(!E.isR) acts.push("{spkTrim}");
  }
  if(!C.spell.ok){ goals.push("Chính tả: có từ viết khác kiểu " + S.spelling + ": " + C.spell.list.join(", ") + "."); acts.push("Đổi sang chính tả " + S.spelling + " các từ: " + C.spell.list.join(", ") + "."); }
  // khẩu ngữ hoá là gợi ý của giảng viên, không bắt buộc: không đưa vào "cần sửa"; chỉ giữ chất văn nói
  var SPKE = spkEval();
  if(SPKE) forb.push("Giữ văn nói: không thêm câu bị động, mệnh đề quan hệ chen giữa chủ ngữ và động từ, từ nối kiểu văn viết; không bỏ câu hỏi, cách xưng I/we, chỗ lược từ, dạng rút gọn.");
  if(!C.keep.ok){ goals.push("Từ giữ lại bị mất: " + C.keep.list.join(", ") + "."); acts.push("Đưa lại các từ giữ lại đã mất vào đúng chỗ cũ (xem bản đồ điểm neo, ghi chú): " + C.keep.list.join(", ") + "."); }
  // ---- giữ đạt (dòng xanh) và điều cấm theo độ sát ngưỡng
  if(C.len.ok){ keeps.push("Độ dài " + C.len.now + " từ (cho phép " + C.len.lo + "–" + C.len.hi + ")."); forb.push("Tổng số từ sau khi sửa phải trong khoảng " + C.len.lo + "–" + C.len.hi + ": được thêm tối đa " + C.len.room.up + " từ, bớt tối đa " + C.len.room.down + " từ."); }
  else forb.push("Sau khi sửa, tổng số từ phải trong khoảng " + C.len.lo + "–" + C.len.hi + ".");
  if(C.paras && C.paras.ok){ keeps.push("Số đoạn " + C.paras.target + "."); forb.push("Giữ đúng " + C.paras.target + " đoạn và tiêu đề."); }
  if(C.long.ok){ keeps.push("Không có câu trên 25 từ."); forb.push("Không tạo câu nào trên 25 từ (khi gộp hoặc thêm câu)."); }
  if(C.hard.ok){ keeps.push("Không khó quá (độ phủ " + C.hard.now.toFixed(1) + "%; cần từ " + sp.cov + "%; xem GIỚI HẠN CÒN LẠI bên dưới)."); if(C.hard.near) forb.push("Không thêm từ trên mức " + L + " hoặc từ ngoài danh sách CEFR-J/Octanove: độ phủ đang sát ngưỡng " + sp.cov + "%."); else forb.push("Hạn chế thêm từ trên mức " + L + " hoặc ngoài danh sách."); }
  if(C.easy.ok){ keeps.push("Không dễ quá (mức " + lvlName(C.easy.now) + ")."); if(C.easy.near) forb.push("Không thay từ ở mức " + L + " bằng từ dễ hơn: từ vựng đang sát ngưỡng tụt mức."); }
  if(C.fre && C.fre.ok){ keeps.push("Flesch Reading Ease " + C.fre.now.toFixed(1) + " (khoảng " + freWin() + "; xem GIỚI HẠN CÒN LẠI bên dưới)."); if(C.fre.nearLow) forb.push("Không làm câu dài thêm và không thay từ ngắn bằng từ dài hơn: Flesch đang sát ngưỡng dưới " + C.fre.min + "."); if(C.fre.nearHigh) forb.push("Không tách câu, không thêm câu rất ngắn hoặc lời đáp ngắn đứng riêng, không thay từ dài bằng từ ngắn hơn: Flesch đang sát ngưỡng trên " + C.fre.max + "."); }
  if(C.fre) forb.push("Sau khi sửa, Flesch Reading Ease phải " + freWin() + ".");
  if(C.spell.ok) forb.push("Giữ chính tả " + S.spelling + ".");
  forb.push("Không thêm thông tin ngoài nguồn, không đổi sự kiện, con số, thứ tự ý.");
  var order = "Làm theo thứ tự: (1) cấu trúc: tiêu đề, số đoạn, độ dài; (2) câu: tách câu dài; (3) từ vựng; (4) chính tả. Sửa ít câu nhất có thể; câu nào không cần sửa thì giữ nguyên từng chữ.";
  var needSrc = !C.len.ok && C.len.now < C.len.lo;
  return {E:E, goals:goals, keeps:keeps, acts:acts, data:data, forb:forb, order:order, needSrc:needSrc};
}
P.wordfix = {title:"Câu lệnh sửa các từ AI dùng sai mức", inputs:["draft"], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây vừa được sửa. Trang soạn đề đã tra từng từ mới (so với bản đã duyệt) theo đúng hai danh sách mà bài sẽ được chấm: CEFR-J Wordlist 1.5 (A1–B2) và Octanove Vocabulary Profile 1.0 (C1–C2). Các từ sau không được tính như bạn nghĩ:\n{wordFixList}\n\nHãy thay đúng những từ này, ở mọi chỗ chúng xuất hiện, mỗi từ bằng một từ cùng nghĩa trong câu. {wordFixGoal} Nếu không tìm được từ phù hợp, trả lại cách viết ở bản trước (ghi trong ngoặc). Không đổi câu nào khác.\n\nCác từ mới sau đã được tính đúng mức {level}, GIỮ NGUYÊN: {wordFixKeep}\n\n{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code. Trong khối code: chỉ có toàn bài đã sửa, không viết gì thêm sau bài. Không cần liệt kê các thay đổi: trang soạn đề tự so từng chữ với bản trước.\n\n{refs}\n\nBÀI:\n{{draft}}"};
P.fixall = {title:"Câu lệnh sửa tất cả các dòng đỏ", inputs:[], outputs:[{slot:"draft",split:"changes"},{slot:"changes"}], t:
"Bài {readOrListenNoun} dưới đây chưa đạt một số yêu cầu. Hãy sửa để đạt TẤT CẢ các mục tiêu, và không làm hỏng bất kỳ yêu cầu nào đang đạt.\n\nMỤC TIÊU CẦN ĐẠT:\n{fixGoals}\n\nĐANG ĐẠT, PHẢI GIỮ:\n{fixKeeps}\n\nCÁCH SỬA ĐƯỢC DÙNG:\n{fixActs}\n\nKHÔNG ĐƯỢC LÀM:\n{fixForb}\n\n{fixOrder}\n\n{fixData}{slackRules}\n\n{locks}\n\nTrình bày TOÀN BỘ câu trả lời trong MỘT khối code (```text ... ```), không viết gì bên ngoài khối code, để người dùng bấm nút Copy của khối code. Trong khối code: toàn bài đã sửa trước; sau đó một dòng riêng \"=== THAY ĐỔI ===\", rồi liệt kê từng thay đổi theo dạng: câu cũ → câu mới, mỗi thay đổi một dòng.\n\n{refs}{fixSrc}\n\nBÀI:\n{{draft}}"};
/* ---- Tô màu từ theo mức CEFR + tra nhanh + đồng hồ mức (để người soạn sửa tay) ---- */
function lvTok(tok, initial){
  if(/^\d/.test(tok) || !/[A-Za-z]/.test(tok)) return {k:"num"};
  var mixed = /[a-z][A-Z]/.test(tok), allCaps = /^[A-Z]{2,}$/.test(tok.replace(/'.*$/, "")), cap = /^[A-Z]/.test(tok), low = tok.toLowerCase().replace(/[’‘]/g, "'");
  var isName = false;
  if(mixed) isName = true;
  else if(allCaps) isName = lexLemma(low) === null;
  else if(cap && tok !== "I"){
    if(!initial) isName = true;
    else { var base = splitContraction(low)[0].split("-")[0]; isName = lexLemma(base) === null && !DERIV.test(base); }
  }
  if(isName) return {k:"name"};
  var lv = -1, off = false, lem = [];
  splitContraction(low).forEach(function(w){ w.split("-").forEach(function(p){ if(!p || !/[a-z]/.test(p)) return; var l = lexLemma(p); if(l === null){ off = true; lem.push(p + " (không có trong danh sách)"); } else { lv = Math.max(lv, LEXM[l]); lem.push(l === p ? l + " " + LVL[LEXM[l]] : p + " → " + l + " " + LVL[LEXM[l]]); } }); });
  return off ? {k:"off", lem:lem} : {k:"lv", lv:lv, lem:lem};
}
var LV_KEYS = ["A1","A2","B1","B2","C1","C2","off","name"], LV_NAMES = {off:"không có trong danh sách", name:"tên riêng (không tính)"};
function lvShowDefault(){ var ti = LVL.indexOf(S.level), o = {}; LV_KEYS.forEach(function(k, i){ o[k] = (i < 6 && i >= ti) || k === "off"; }); return o; }
function lvShow(){ try{ var x = JSON.parse(localStorage.getItem("vstep.lvShow") || "null"); if(x && typeof x === "object") return x; }catch(e){} return lvShowDefault(); }
function lvSetShow(o){ try{ if(o) localStorage.setItem("vstep.lvShow", JSON.stringify(o)); else localStorage.removeItem("vstep.lvShow"); }catch(e){} }
function lvKey(r){ return r.k === "off" ? "off" : (r.k === "name" ? "name" : (r.k === "lv" ? LVL[r.lv] : "")); }
function lvViewHTML(text, ti, show){
  show = show || lvShow();
  var re = /[A-Za-z0-9]+(?:['’][A-Za-z]+)*(?:-[A-Za-z0-9]+(?:['’][A-Za-z]+)*)*['’]?/g, m, last = 0, out = "", lineStart = true;
  while((m = re.exec(text))){
    var gap = text.slice(last, m.index), t = m[0];
    var initial = last === 0 || /[.!?]["'”’)\]]*\s+$/.test(gap) || /\n\s*$/.test(gap) || /^\s*$/.test(text.slice(0, m.index));
    if(/\n/.test(gap)) lineStart = true;
    var isLabel = lineStart && text.charAt(m.index + t.length) === ":" && /^\s*$/.test(gap.split("\n").pop());
    lineStart = false;
    out += esc(gap);
    var k = isLabel ? "name" : lvKey(lvTok(t, initial));
    out += k && show[k] ? '<span class="lvc-' + k + '">' + esc(t) + '</span>' : esc(t);
    last = m.index + t.length;
  }
  return out + esc(text.slice(last)) + "\n ";
}
function lvTogHTML(){
  var ti = LVL.indexOf(S.level), sh = lvShow();
  return '<span class="muted">Tô:</span>' + LV_KEYS.map(function(k, i){ var lab = i < 6 ? k + (i === ti ? " (mức bài)" : "") : LV_NAMES[k]; return '<button type="button" class="lvc-' + k + (sh[k] ? " on" : "") + '" data-lvk="' + k + '" aria-pressed="' + (sh[k] ? "true" : "false") + '">' + esc(lab) + '</button>'; }).join("")
    + '<span class="sep"></span><button type="button" data-lvp="def">Theo mức bài</button><button type="button" data-lvp="all">Tất cả</button><button type="button" data-lvp="none">Tắt hết</button>';
}
function lvLookupHTML(q, ti){
  var L = S.level, words = String(q || "").split(/[,;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean).slice(0, 30);
  if(!words.length) return "";
  return words.map(function(w){
    var r = lvTok(w.replace(/^[A-Z]/, function(c){ return c.toLowerCase(); }), false), syl = sylCount(w), cls = "mid", note;
    if(r.k === "off"){ cls = "bad"; note = "không có trong danh sách: bị trừ độ phủ"; }
    else if(r.k !== "lv"){ note = "không tra được"; }
    else if(r.lv > ti){ cls = "bad"; note = LVL[r.lv] + ", trên mức " + L + ": bị trừ độ phủ"; }
    else if(r.lv === ti){ cls = "ok"; note = L + ", đúng mức: giúp nâng mức"; }
    else note = LVL[r.lv] + ", dưới mức " + L + ": không bị trừ, nhưng không giúp nâng mức";
    return '<span class="lv-chip ' + cls + '"><b>' + esc(w) + '</b> · ' + esc(note) + ' · ' + syl + ' âm tiết' + (r.lem && r.lem.length && r.lem.join("").indexOf("→") >= 0 ? ' <span class="muted">(' + esc(r.lem.join("; ")) + ')</span>' : '') + '</span>';
  }).join("");
}
function lvMeterHTML(ti){
  var vp = currentVocab(), fr = currentFre(), sp = SPEC[S.spec], L = S.level, v = V(); if(!vp || !vp.N) return "";
  var Nin = vp.N, upto = easyUpto(vp, ti);
  var atN = vp.counts[ti], fl = LVL.indexOf(v.floorLevel), lines = [];
  if(fl === ti && ti > 0){
    var share = Nin ? 100 * upto / Nin : 0, need = Math.floor(Nin * (100 - EASY_TH) / 100) + 1, more = Math.max(0, need - upto);
    lines.push("<b>Mức từ vựng (cần đúng " + L + "):</b> bài có " + upto + " lượt từ mức " + L + " trở lên hoặc ngoài danh sách (" + share.toFixed(1) + "% của " + Nin + " lượt, không tính tên riêng). Mức ở ngưỡng " + EASY_TH + "% lên " + L + " khi phần này trên " + (100 - EASY_TH) + "%, tức là ít nhất " + need + " lượt" + (more ? ": <b class=\"no\">cần thêm khoảng " + more + " lượt từ " + L + "</b>." : ": <b class=\"ok\">đã đủ</b>."));
  }
  var cov = vp.cum[ti], K = Math.floor(vp.N * (cov - sp.cov) / 100 + 1e-6);
  lines.push("<b>Độ phủ ở mức " + L + ":</b> " + cov.toFixed(1) + "% (cần từ " + sp.cov + "%): " + (K >= 0 ? "còn chỗ cho khoảng " + K + " lượt từ trên mức hoặc không có trong danh sách" : "<b class=\"no\">đang thừa khoảng " + (-K) + " lượt từ trên mức hoặc không có trong danh sách</b>") + ".");
  if(fr && fr.ok){
    var dd = 84.6 / fr.W, mn = FRE_MIN[L], mx = FRE_MAX[L];
    lines.push("<b>Flesch:</b> " + fr.fre.toFixed(1) + " (cần " + freWin() + "); mỗi âm tiết thêm vào làm giảm khoảng " + dd.toFixed(2) + " điểm" + (freIn(fr.fre) ? ": còn thêm được khoảng " + Math.max(0, Math.floor((fr.fre - mn) / dd)) + " âm tiết" + (mx < 200 ? ", bớt được khoảng " + Math.max(0, Math.floor((mx - 0.05 - fr.fre) / dd)) + " âm tiết" : "") : "") + ".");
  }
  lines.push("Thay một từ thường bằng từ " + L + " cùng số âm tiết là cách ít ảnh hưởng nhất: vừa nâng mức, không làm Flesch tụt. Tránh từ " + (ti < 5 ? LVL[ti + 1] + ", " : "") + "từ phái sinh lạ (-ly, -ness, -tion…) vì dễ không có trong danh sách.");
  return lines.map(function(x){ return "<div>" + x + "</div>"; }).join("");
}
function lvRender(){
  var boxes = document.querySelectorAll("[data-lvbox]"); if(!boxes.length) return;
  var txt = S.slots.draft || "", ti = LVL.indexOf(S.level);
  boxes.forEach(function(b){
    var back = b.querySelector(".lvback"), ta = b.querySelector(".lvta"), meter = b.querySelector(".lv-meter"), tog = b.querySelector(".lv-tog"), res = b.querySelector(".lv-res"), q = b.querySelector(".lv-q");
    tog.innerHTML = lvTogHTML();
    meter.innerHTML = txt.trim() ? lvMeterHTML(ti) : "";
    if(ta !== document.activeElement && ta.value !== txt) ta.value = txt;
    if(b.tagName !== "DETAILS" || b.open){ back.innerHTML = lvViewHTML(ta.value, ti); back.scrollTop = ta.scrollTop; }
    if(q && q.value) res.innerHTML = lvLookupHTML(q.value, ti);
  });
}
function lvWordAt(t, pos){ var L = pos, R = pos; while(L > 0 && /[A-Za-z0-9'’-]/.test(t.charAt(L-1))) L--; while(R < t.length && /[A-Za-z0-9'’-]/.test(t.charAt(R))) R++; return t.slice(L, R).replace(/^['’-]+|['’-]+$/g, ""); }
document.addEventListener("click", function(e){
  var g = e.target.closest && e.target.closest("[data-goto-editor]"); if(!g) return;
  var scr = g.closest(".screen"), box = scr ? scr.querySelector("[data-lvbox]") : null; if(!box) return;
  box.scrollIntoView({behavior:"smooth", block:"start"}); var ta = box.querySelector(".lvta"); if(ta) setTimeout(function(){ ta.focus(); }, 400);
});
function bindLv(){
  document.querySelectorAll("[data-lvbox]").forEach(function(b){
    var q = b.querySelector(".lv-q"), res = b.querySelector(".lv-res"), ta = b.querySelector(".lvta"), back = b.querySelector(".lvback");
    b.addEventListener("toggle", function(){ if(b.open) lvRender(); });
    q.addEventListener("input", function(){ res.innerHTML = lvLookupHTML(q.value, LVL.indexOf(S.level)); });
    ta.addEventListener("input", function(){ back.innerHTML = lvViewHTML(ta.value, LVL.indexOf(S.level)); back.scrollTop = ta.scrollTop; setSlot("draft", ta.value, ta); });
    ta.addEventListener("scroll", function(){ back.scrollTop = ta.scrollTop; });
    // dán kết quả AI: trông như cả bài (khối code, dòng phân cách, hoặc dài từ nửa bài) thì thay cả bài, có Hoàn tác
    ta.addEventListener("paste", function(e){
      var t = (e.clipboardData || window.clipboardData).getData("text") || "", cur = S.slots.draft || "";
      var full = /```/.test(t) || SPLIT_RE.test("\n" + t) || (cur.trim() && wc(t) >= 0.5 * wc(cur)) || !cur.trim();
      if(!full) return;
      e.preventDefault();
      var c = cleanPaste(t), msgs = [];
      if(CHATTY_RE.test(c + "\n")){ c = c.replace(CHATTY_RE, ""); msgs.push("Đã bỏ câu dẫn của AI ở đầu."); }
      var m = ("\n" + c).match(SPLIT_RE), body = c, after = "";
      if(m){ var idx = Math.max(0, m.index - 1); body = c.slice(0, idx).replace(/\s+$/, ""); after = c.slice(idx + m[0].length - 1).trim(); }
      var sp = b.getAttribute("data-split");
      if(after && sp && sp !== "discard"){ setSlot(sp, after); msgs.push("Phần AI liệt kê thay đổi đã tách riêng."); }
      else if(after) msgs.push("Đã bỏ phần ghi chú cuối bài.");
      var prev = cur;
      if(prev.trim()){ S.slots.prePaste = prev; S.diffBase = "paste"; }
      setSlot("draft", body);
      ta.value = S.slots.draft || ""; back.innerHTML = lvViewHTML(ta.value, LVL.indexOf(S.level));
      var msg = b.querySelector(".lv-msg");
      if(msg){
        msg.innerHTML = (prev.trim() ? '<b>Đã thay cả bài bằng kết quả vừa dán: ' + wc(prev) + ' → ' + wc(S.slots.draft || "") + ' từ.</b> ' : '<b>Đã dán bài (' + wc(S.slots.draft || "") + ' từ).</b> ') + esc(msgs.join(" ")) + (prev.trim() ? ' <button type="button" class="btn quiet sm" data-lvundo>Hoàn tác</button>' : '');
        var ub = msg.querySelector("[data-lvundo]");
        if(ub) ub.addEventListener("click", function(){ setSlot("draft", prev); ta.value = prev; back.innerHTML = lvViewHTML(prev, LVL.indexOf(S.level)); msg.textContent = "Đã quay lại bản trước khi dán (" + wc(prev) + " từ)."; });
      }
    });
    ta.addEventListener("click", function(){ var w = lvWordAt(ta.value, ta.selectionStart); if(w && /[A-Za-z]/.test(w) && ta.selectionStart === ta.selectionEnd){ q.value = w; res.innerHTML = lvLookupHTML(w, LVL.indexOf(S.level)); } });
    ta.addEventListener("blur", function(){ if(ta.value !== (S.slots.draft || "")) lvRender(); });
    b.querySelector(".lv-tog").addEventListener("click", function(e){
      var t = e.target.closest("button"); if(!t) return;
      var k = t.getAttribute("data-lvk"), pz = t.getAttribute("data-lvp"), sh = lvShow();
      if(k){ sh[k] = !sh[k]; lvSetShow(sh); }
      else if(pz === "def") lvSetShow(null);
      else if(pz === "all"){ LV_KEYS.forEach(function(x){ sh[x] = true; }); lvSetShow(sh); }
      else if(pz === "none"){ LV_KEYS.forEach(function(x){ sh[x] = false; }); lvSetShow(sh); }
      lvRender();
    });
  });
}
/* ---- Giới hạn còn lại: AI không đo được độ phủ, Flesch, nên trang đổi phần còn dư thành việc làm được ---- */
function slackRulesText(){
  var d = S.slots.draft || ""; if(!d.trim()) return "";
  var sp = SPEC[S.spec], L = S.level, ti = LVL.indexOf(L), vp = currentVocab(), fr = currentFre(), out = [];
  if(vp && vp.N){
    var cov = vp.cum[ti], K = Math.floor(vp.N * (cov - sp.cov) / 100 + 1e-6);
    if(cov >= sp.cov) out.push("- Độ phủ: trang đếm theo CEFR-J Wordlist 1.5 (A1–B2) và Octanove Vocabulary Profile 1.0 (C1–C2), không tính tên riêng và con số; mỗi lượt từ trên mức " + L + " hoặc không có trong hai danh sách đều bị trừ. Bài đang " + cov.toFixed(1) + "% trên " + vp.N + " lượt từ (cần từ " + sp.cov + "%), tức là cả bài " + (K > 0 ? "chỉ còn chỗ cho thêm khoảng " + K + " lượt từ như vậy" : "không còn chỗ cho thêm lượt từ nào như vậy") + ".");
    out.push("- Vì bạn không tra được hai danh sách: từ mới chỉ dùng từ thông dụng mà bạn chắc chắn ở mức " + L + " trở xuống; không dùng từ hiếm, từ chuyên ngành, từ trên mức " + L + "; tránh từ phái sinh (đuôi -ly, -ness, -tion, -ity, -ment, -ful, -less; tiền tố un-, re-, dis-, in-, over-) vì nhiều dạng không có trong danh sách và bị trừ. Không chắc thì giữ từ cũ. Sau khi bạn trả lời, trang sẽ tra lại từng từ mới.");
  }
  if(fr && fr.ok && freIn(fr.fre)){
    var mn = FRE_MIN[L], mx = FRE_MAX[L], dd = 84.6 / fr.W, down = Math.max(0, Math.floor((fr.fre - mn) / dd)), up = mx < 200 ? Math.max(0, Math.floor((mx - 0.05 - fr.fre) / dd)) : null;
    out.push("- Flesch Reading Ease: bài đang " + fr.fre.toFixed(1) + " (cần " + freWin() + "). Bài có " + fr.W + " từ, nên mỗi âm tiết thêm vào làm Flesch giảm khoảng " + dd.toFixed(2) + " điểm: cả bài chỉ được thêm tối đa khoảng " + down + " âm tiết (ví dụ thay " + Math.max(1, Math.floor(down / 2)) + " từ, mỗi từ mới dài hơn từ cũ 2 âm tiết)" + (up !== null ? "; nếu bớt âm tiết thì tối đa khoảng " + up + " âm tiết" : "") + ". Câu dài thêm cũng làm Flesch giảm: không gộp câu, không thêm từ vào câu khi không cần.");
  }
  return out.length ? "GIỚI HẠN CÒN LẠI (trang soạn đề tính sẵn theo đúng cách đo, vì bạn không đo được):\n" + out.join("\n") : "";
}
/* ---- Tra lại từ mới: so bản đang làm với bản đã duyệt, theo đúng danh sách và cách tra của trang ---- */
var WC_CACHE = {a:null, vp:null};
function wcNorm(t){ return String(t || "").toLowerCase().replace(/[’‘]/g, "'").replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""); }
function wcHunks(a, b){
  var A = dtok(a), B = dtok(b), pre = 0, suf = 0;
  while(pre < A.length && pre < B.length && A[pre] === B[pre]) pre++;
  while(suf < A.length - pre && suf < B.length - pre && A[A.length-1-suf] === B[B.length-1-suf]) suf++;
  var a2 = A.slice(pre, A.length - suf), b2 = B.slice(pre, B.length - suf), n = a2.length, m = b2.length, ops = [];
  if(n * m > 4000000) return [{del:a2, add:b2}];
  var W = m + 1, Lc = new Uint16Array((n + 1) * (m + 1));
  for(var i = n - 1; i >= 0; i--) for(var j = m - 1; j >= 0; j--) Lc[i*W+j] = a2[i] === b2[j] ? Lc[(i+1)*W+j+1] + 1 : Math.max(Lc[(i+1)*W+j], Lc[i*W+j+1]);
  var x = 0, y = 0;
  while(x < n && y < m){ if(a2[x] === b2[y]){ ops.push(["=", a2[x]]); x++; y++; } else if(Lc[(x+1)*W+y] >= Lc[x*W+y+1]){ ops.push(["-", a2[x]]); x++; } else { ops.push(["+", b2[y]]); y++; } }
  while(x < n) ops.push(["-", a2[x++]]); while(y < m) ops.push(["+", b2[y++]]);
  var hunks = [], cur = null;
  ops.forEach(function(o){ if(o[0] === "="){ cur = null; return; } if(!cur){ cur = {del:[], add:[]}; hunks.push(cur); } (o[0] === "-" ? cur.del : cur.add).push(o[1]); });
  return hunks;
}
function wcPartsOf(tok){ var w = wcNorm(tok), out = []; splitContraction(w).forEach(function(x){ x.split("-").forEach(function(p){ if(p && /[a-z]/.test(p)) out.push(p); }); }); return out; }
var WC_RES = {k:null, r:null};
function wordCheck(){
  var a = S.slots.approved || "", b = S.slots.draft || "", key = S.spec + "|" + S.level + "|" + a.length + "|" + b.length + "|" + qHashS(a) + "|" + qHashS(b);
  if(WC_RES.k === key) return WC_RES.r;
  WC_RES.k = key; WC_RES.r = wordCheckRun(a, b); return WC_RES.r;
}
function qHashS(t){ var h = 0; for(var i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; } return h; }
function wordCheckRun(a, b){
  if(!a.trim() || !b.trim() || a.trim() === b.trim()) return null;
  if(WC_CACHE.a !== a){ WC_CACHE.a = a; WC_CACHE.vp = vocabProfile(a); }
  var vA = WC_CACHE.vp, vB = currentVocab(); if(!vA || !vB) return null;
  var ti = LVL.indexOf(S.level), mA = Object.create(null), oA = Object.create(null), mB = Object.create(null);
  vA.lemmas.forEach(function(l){ mA[l.w] = l.n; }); vA.offList.forEach(function(o){ oA[o.w] = o.n; }); vB.lemmas.forEach(function(l){ mB[l.w] = l.n; });
  var above = [], off = [], at = [], near = [];
  vB.lemmas.forEach(function(l){ var dn = l.n - (mA[l.w] || 0); if(dn <= 0) return; var it = {w:l.w, lv:l.lv, n:dn, syl:sylCount(l.w)}; if(l.lv > ti) above.push(it); else if(l.lv === ti) at.push(it); else if(l.lv === ti - 1) near.push(it); });
  vB.offList.forEach(function(o){ var dn = o.n - (oA[o.w] || 0); if(dn > 0) off.push({w:o.w, n:dn, syl:sylCount(o.w), off:true}); });
  var lostAt = vA.lemmas.filter(function(l){ return l.lv === ti && l.n > (mB[l.w] || 0); }).map(function(l){ return l.w; });
  var hunks = null, findOld = function(it){
    if(!hunks) hunks = wcHunks(a, b);
    for(var i = 0; i < hunks.length; i++){
      var h = hunks[i], hit = h.add.some(function(t){ return wcPartsOf(t).some(function(p){ return it.off ? p === it.w : lexLemma(p) === it.w; }); });
      if(hit){ var d = h.del.filter(function(t){ return t !== "¶"; }); return d.length && d.length <= 8 ? d.join(" ").replace(/[.,;:!?]+$/, "") : (d.length ? d.slice(0, 8).join(" ") + "…" : ""); }
    }
    return "";
  };
  [above, off, at, near].forEach(function(arr){ arr.forEach(function(it){ it.old = findOld(it); }); });
  return {above:above, off:off, at:at, near:near, lostAt:lostAt};
}
function wcRaising(v){ var vp = currentVocab(); if(!vp || !v) return false; var fl = LVL.indexOf(v.floorLevel); return fl >= 0 && easyLvl(vp) < fl; }
function wcItemText(it, tag){ return it.w + " (" + tag + (it.n > 1 ? ", " + it.n + " lần" : "") + ", " + it.syl + " âm tiết" + (it.old ? "; bản trước: \"" + it.old + "\"" : "") + ")"; }
function wordFixExtend(v){
  var W = null; try{ W = wordCheck(); }catch(e){ W = null; }
  var raise = false; try{ raise = wcRaising(v); }catch(e){}
  var lines = [];
  if(W){
    W.above.forEach(function(it){ lines.push("- " + wcItemText(it, LVL[it.lv] + ", trên mức " + S.level) + ": bị trừ độ phủ. Thay bằng từ cùng nghĩa ở mức " + S.level + " trở xuống."); });
    W.off.forEach(function(it){ lines.push("- " + wcItemText(it, "không có trong danh sách") + ": bị trừ độ phủ. Thay bằng từ cùng nghĩa có trong danh sách (thường là dạng gốc hoặc từ thông dụng hơn)."); });
    if(raise) W.near.forEach(function(it){ lines.push("- " + wcItemText(it, LVL[it.lv]) + ": chỉ ở mức " + LVL[it.lv] + " nên chưa giúp bài lên " + S.level + ". Nếu có từ " + S.level + " cùng nghĩa, dùng tự nhiên trong câu thì thay; không thì giữ."); });
  }
  v.wordFixList = lines.join("\n");
  v.wordFixKeep = W && W.at.length ? W.at.map(function(it){ return it.w; }).join(", ") : "(không có)";
  v.wordFixGoal = raise ? "Bài đang cần nâng mức từ vựng lên " + S.level + ", nên khi thay, ưu tiên từ ở đúng mức " + S.level + "." : "Bài không cần nâng mức thêm, nên khi thay, dùng từ ở mức " + S.level + " trở xuống.";
  v.slackRules = slackRulesText();
}
function fixExtend(v){
  var plan = buildFixPlan();
  if(!plan){ v.fixGoals = v.fixKeeps = v.fixActs = v.fixForb = v.fixOrder = v.fixData = v.fixSrc = ""; v.keepPassing = ""; return; }
  var sub = function(s){ return s.replace(/\{(\w+)\}/g, function(m,k){ return (k in v) ? v[k] : m; }); };
  var num = function(arr){ return arr.length ? arr.map(function(x,i){ return (i+1) + ". " + sub(x); }).join("\n") : "(không có)"; };
  v.fixGoals = num(plan.goals); v.fixKeeps = num(plan.keeps); v.fixActs = num(plan.acts); v.fixForb = num(plan.forb); v.fixOrder = plan.order;
  v.fixData = plan.data.length ? plan.data.map(sub).join("\n\n") + "\n\n" : "";
  var o = plan.needSrc ? slotVal("orig") : "";
  var srcNm = SPEC[S.spec].skill === "L" ? "VĂN BẢN NGUỒN (đoạn dữ kiện đã duyệt)" : "VĂN BẢN NGUỒN";
  v.fixSrc = plan.needSrc ? "\n\n" + srcNm + " (chỉ để lấy chi tiết, không chép câu):\n" + (o || "[không có kèm theo: không thêm chi tiết mới; chỉ diễn đạt lại và triển khai các ý đã có trong bài]") : "";
  v.keepPassing = plan.keeps.length ? "CÁC YÊU CẦU ĐANG ĐẠT, KHÔNG ĐƯỢC LÀM HỎNG:\n" + plan.keeps.map(function(x,i){ return (i+1) + ". " + x; }).join("\n") + "\n" + plan.forb.map(function(x){ return "- " + x; }).join("\n") : "";
}
function renderFixAll(){
  var panels = document.querySelectorAll(".fixall-panel"); if(!panels.length) return;
  var plan = buildFixPlan(), v = plan ? V() : {};
  var sub = function(s){ return s.replace(/\{(\w+)\}/g, function(m,k){ return (k in v) ? v[k] : ""; }); };
  var show = plan && plan.goals.length;
  panels.forEach(function(p){
    p.classList.toggle("hidden", !show && !(S.fixOpen && S.fixOpen.all && (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== (S.slots.draft||"").trim()));
    var g = p.querySelector(".fixall-goals"), k = p.querySelector(".fixall-keeps");
    if(!plan){ g.innerHTML = ""; k.innerHTML = ""; return; }
    g.innerHTML = plan.goals.length ? plan.goals.map(function(x){ return '<li>' + esc(sub(x)) + '</li>'; }).join("") : '<li class="ok">Không còn dòng đỏ.</li>';
    k.innerHTML = plan.keeps.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + plan.forb.filter(function(x){ return /sát ngưỡng/.test(x); }).map(function(x){ return '<li class="nearf">' + esc(x) + '</li>'; }).join("");
  });
  if(show){ S.fixOpen = S.fixOpen || {}; S.fixOpen.all = true; }
}

function extendVars(v){
  vocabExtend(v);
  freExtend(v);
  fixExtend(v);
  try{ wordFixExtend(v); }catch(e){ v.wordFixList = ""; v.wordFixKeep = "(không có)"; v.wordFixGoal = ""; v.slackRules = ""; }
  qExtend(v);
  if(typeof wfExtend==="function") wfExtend(v);
  v.sourceNeeds = SOURCE_NEEDS[S.spec] || SOURCE_NEEDS[S.spec.slice(0,2)] || "";
  v.anchorReq = SPEC[S.spec].skill==="R" ? "BẢN ĐỒ ĐIỂM NEO: mỗi dòng theo khuôn MÃ | đoạn số | trích ngắn tối đa 12 từ, chép nguyên văn từ bài, cho các mã: " + (SPEC[S.spec].skills||"") + ". Mã nào bài không có chỗ tự nhiên để hỏi, ghi: MÃ | không có. Không sửa bài để lấp mã còn thiếu." : "";
  var pdfR = S.srcMode==="pdf" && S.srcLang!=="vi";
  var origPdf = pdfR && origId()==="src";
  v.pageNote = pdfR ? ", kèm số trang trong file PDF" : "";
  v.pageCol = origPdf ? " (ghi số trang)" : "";
  v.pdfExtra = origPdf ? "\n- Vì bản gốc là file PDF, liệt kê thêm các câu trong bản biên tập lặp lại nguyên văn từ 8 từ liên tiếp trở lên của nguồn." : "";
  var notes = (S.slots.notes||"").trim();
  v.omitBlock = notes ? "GHI CHÚ BIÊN TẬP (các phần ghi là đã lược thì không tính là lỗi):\n" + notes + "\n\n" : "";
}
SLOTS.above.optional = true; SLOTS.above.empty = "";
var STOPW = {};
"the a an be have do and or but of to in on at for with by from as that this it they he she we you i not no can will would could should may might must there which who what when where how than so if also more most some any all one their its his her our your my them us him me these those such other about into over after before because while very just only then out up get".split(" ").forEach(function(w){ STOPW[w] = 1; });
function currentVocab(){ var d = S.slots.draft||""; if(!d.trim()) return null; if(!lastVocab) lastVocab = vocabProfile(d); return lastVocab; }
function vocabExtend(v){
  var sp = SPEC[S.spec], vp = currentVocab(), ti = LVL.indexOf(S.level), keep = {};
  keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var base = sp.min || sp.approx || 400;
  v.maxAbove = "khoảng " + Math.max(3, Math.round(base * (100 - sp.cov) / 100 * 0.8)) + " lượt từ";
  var prof = (S.slots.above||"").trim();
  if(prof){ v.aboveList = prof; v.aboveSrc = "bảng từ Text Profiler"; }
  else if(vp){
    var ab = vp.lemmas.filter(function(l){ return l.lv > ti && !keep[l.w]; }).map(function(l){ return l.w + " (" + LVL[l.lv] + ") ×" + l.n; });
    var of = vp.offList.filter(function(o){ return !keep[o.w]; }).map(function(o){ return o.w + " ×" + o.n; });
    v.aboveList = "TRÊN MỨC " + S.level + ": " + (ab.length ? ab.join(", ") : "không có") + "\nNGOÀI DANH SÁCH CEFR-J/Octanove: " + (of.length ? of.join(", ") : "không có");
    v.aboveSrc = "trang tự tra theo CEFR-J/Octanove, không tính tên riêng";
  } else { v.aboveList = "[chưa có bài]"; v.aboveSrc = "chưa có"; }
  var pfL = S.slots.pfLvl95, pfB = parseFloat(String(S.slots.pfCovBelow||"").replace(",", "."));
  var usePf = pfL && pfL!=="chưa đo";
  v.measureSrc = usePf ? "EC Text Profiler" : "trang tự tra theo CEFR-J/Octanove, ước lượng";
  v.lvl95Txt = usePf ? pfL : (vp ? lvlName(vp.lvl95In) : "chưa đo");
  v.lvl98Txt = vp ? lvlName(easyLvl(vp)) : "chưa đo";
  var bi = LVL.indexOf(v.belowLevel), cb = vp && bi>=0 ? vp.cum[bi] : NaN;
  v.covBelowTxt = isNaN(cb) ? "chưa đo" : cb.toFixed(1) + "%";
  if(!isNaN(cb) && cb >= EASY_TH && vp){ var tok = vp.N; v.upN = "khoảng " + (Math.ceil((cb - (EASY_TH - 0.1)) / 100 * tok) + 1) + " lượt từ (ước lượng để độ phủ ở mức " + v.belowLevel + " xuống dưới " + EASY_TH + "%, đã cộng 1 từ dự phòng)"; }
  if(vp){
    var lowMax = bi >= 0 ? bi : 0, topic = {};
    var an = lastAnalysis || analyze(S.slots.draft||"");
    an.titles.map(function(t){ return t.text; }).concat([S.slots.topic || ""]).forEach(function(tx){ (tx.toLowerCase().match(/[a-z]+/g)||[]).forEach(function(w){ var l = lexLemma(w); topic[l||w] = 1; }); });
    /* từ nội dung lặp nhiều nhất của bài thường là từ chủ đề: không gợi ý nâng */
    vp.lemmas.filter(function(l){ return !STOPW[l.w] && l.w.length > 3; }).sort(function(x,y){ return y.n - x.n; }).slice(0,3).forEach(function(l){ if(l.n >= 4) topic[l.w] = 1; });
    var c = vp.lemmas.filter(function(l){ return l.lv <= lowMax && !STOPW[l.w] && !keep[l.w] && !topic[l.w] && l.w.length > 3; }).sort(function(x,y){ return y.n - x.n; }).slice(0,15).map(function(l){ return l.w + " (" + LVL[l.lv] + ") ×" + l.n; });
    v.upCands = c.length ? c.join(", ") : "không có gợi ý";
    v.upCands6 = c.length ? c.slice(0, 6).join(", ") : "không có gợi ý";
  } else { v.upCands = "chưa có bài"; v.upCands6 = "chưa có bài"; }
}
SLOTS.b7out = {label:"Câu trả lời của AI", type:"area", optional:true, empty:""};
/* ---------- Bước 7: đọc và áp dụng các chỗ sửa ---------- */
var b7Fixes = [];
function cleanVal(s){ return s.replace(/\*\*/g,"").replace(/^[\s"“”'`>•\-]+|[\s"“”'`>•\-]+$/g,"").replace(/\s+/g," ").trim(); }
function parseB7(raw){
  var txt = cleanPaste(raw).replace(/\*\*|__/g, "");
  var mk = txt.search(/C[ÁA]C\s+CH[ỖO]\s+S[ỬU]A/i);
  if(mk < 0) return {found:false, fixes:[]};
  var body = txt.slice(mk).replace(/^[^\n]*(\n|$)/, "");
  var LAB = /(^|[\s|>*\-•])(C[ŨU]|OLD|M[ỚO]I|NEW|L[ÝY]\s*DO|REASON)\s*:\s*/gi;
  var hasFields = /(^|[\s|>*\-•])(C[ŨU]|OLD)\s*:/i.test(body);
  if(!hasFields) return {found:true, none:/KH[ÔO]NG\s+C[ÓO]/i.test(body), fixes:[], bad:!/KH[ÔO]NG\s+C[ÓO]/i.test(body)};
  var HRE = /(^|\n|[\s|])[#>*\-•\s]*S[ỬU]A\s*(\d+)\s*(?:[|:–\-]\s*)?(PH[ẢA]I\s+S[ỬU]A|N[ÊE]N\s+XEM|T[ỰU]\s+NHI[ÊE]N)?/gi, hm, heads = [];
  while((hm = HRE.exec(body))){ heads.push({i:hm.index + hm[1].length, end:HRE.lastIndex, n:hm[2], lv:hm[3]||""}); }
  var blocks = [];
  if(heads.length){ heads.forEach(function(hd, k){ blocks.push({n:hd.n, lv:hd.lv, text:body.slice(hd.end, k+1<heads.length ? heads[k+1].i : body.length)}); }); }
  else { body.split(/(?=(?:^|\s)(?:C[ŨU]|OLD)\s*:)/i).forEach(function(t, k){ if(/(C[ŨU]|OLD)\s*:/i.test(t)) blocks.push({n:String(blocks.length+1), lv:"", text:t}); }); }
  var out = [], skipped = 0;
  blocks.forEach(function(b){
    var marks = [], m; LAB.lastIndex = 0;
    while((m = LAB.exec(b.text))){ marks.push({k:m[2].toUpperCase().replace(/\s+/g," "), s:m.index + m[1].length, e:LAB.lastIndex}); }
    var f = {};
    marks.forEach(function(mk2, j){
      var val = b.text.slice(mk2.e, j+1<marks.length ? marks[j+1].s : b.text.length);
      var key = /^(C[ŨU]|OLD)$/.test(mk2.k) ? "old" : (/^(M[ỚO]I|NEW)$/.test(mk2.k) ? "nw" : "why");
      if(!f[key]) f[key] = cleanVal(val);
    });
    var lvTxt = (b.lv + " " + b.text.split("\n")[0]).toUpperCase();
    var lvl = /T[ỰU]\s+NHI[ÊE]N/.test(lvTxt) ? "nat" : (/N[ÊE]N\s+XEM/.test(lvTxt) ? "see" : "must");
    if(!f.old || !f.nw){ skipped++; return; }
    out.push({n:b.n, lvl:lvl, old:f.old, nw:f.nw, why:f.why||"", on: lvl==="must"});
  });
  return {found:true, fixes:out, skipped:skipped};
}
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function findOld(draft, old){
  if(!old) return null;
  var i = draft.indexOf(old); if(i >= 0) return {i:i, len:old.length, n: draft.split(old).length - 1};
  var pat = escRe(old).replace(/\s+/g,"\\s+").replace(/['’‘]/g,"['’‘]").replace(/["“”]/g,"[\"“”]").replace(/[—–-]/g,"[—–-]");
  try{ var re = new RegExp(pat, "g"), m = re.exec(draft); if(m){ var cnt = (draft.match(new RegExp(pat,"g"))||[]).length; return {i:m.index, len:m[0].length, n:cnt}; } }catch(e){}
  return null;
}
function wordDiffHTML(a, b){
  var A = a.split(/\s+/), B = b.split(/\s+/), n = A.length, m = B.length, W = m+1, L = new Uint16Array((n+1)*(m+1));
  for(var i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--) L[i*W+j] = A[i]===B[j] ? L[(i+1)*W+j+1]+1 : Math.max(L[(i+1)*W+j], L[i*W+j+1]);
  var x=0, y=0, o="";
  while(x<n && y<m){ if(A[x]===B[y]){ o += esc(A[x])+" "; x++; y++; } else if(L[(x+1)*W+y]>=L[x*W+y+1]){ o += '<del class="dd">'+esc(A[x])+'</del> '; x++; } else { o += '<ins class="di">'+esc(B[y])+'</ins> '; y++; } }
  while(x<n) o += '<del class="dd">'+esc(A[x++])+'</del> '; while(y<m) o += '<ins class="di">'+esc(B[y++])+'</ins> ';
  return o;
}
function newWordFlags(old, nw){
  var ti = LVL.indexOf(S.level), had = {}, flags = [];
  (old.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]).forEach(function(w){ had[w] = 1; });
  var re = /[A-Za-z]+(?:'[A-Za-z]+)?/g, m, first = true;
  while((m = re.exec(nw))){
    var t = m[0], lw = t.toLowerCase(), initial = first; first = false;
    if(had[lw]) continue;
    if(/^[A-Z]/.test(t) && !initial) continue;
    var parts = splitContraction(lw);
    parts.forEach(function(p){ var lem = lexLemma(p); if(lem===null){ if(!(initial && /^[A-Z]/.test(t) && !DERIV.test(p))) flags.push(p + " (ngoài danh sách)"); } else if(LEXM[lem] > ti) flags.push(p + " (" + LVL[LEXM[lem]] + ")"); });
  }
  return flags;
}
function renderB7(){
  var box = document.getElementById("b7-fixes"), bar = document.getElementById("b7-applybar"); if(!box) return;
  var txt = S.slots.b7out || "";
  if(!txt.trim()){ box.innerHTML = ""; bar.classList.add("hidden"); b7Fixes = []; return; }
  var r = parseB7(txt), d = S.slots.draft || "";
  if(!r.found){ box.innerHTML = '<div class="note">Không thấy dòng <b>=== CÁC CHỖ SỬA ===</b> trong phần đã dán. Có thể AI chưa làm phần B, hoặc bạn chưa copy phần đó. Nhắn AI trong cùng cuộc trò chuyện rồi dán lại:' + remindHTML(REMIND_B7) + '</div>'; bindRemind(box); bar.classList.add("hidden"); return; }
  if(r.bad || (!r.none && !r.fixes.length)){ box.innerHTML = '<div class="note">Có dòng <b>=== CÁC CHỖ SỬA ===</b> nhưng trang không đọc được chỗ sửa nào (thiếu CŨ hoặc MỚI). Nhắn AI trong cùng cuộc trò chuyện rồi dán lại:' + remindHTML(REMIND_B7) + '</div>'; bindRemind(box); bar.classList.add("hidden"); b7Fixes = []; return; }
  if(r.none || !r.fixes.length){ box.innerHTML = '<div class="info"><span class="ok">✓</span> AI không đề xuất chỗ nào cần sửa. Vẫn nên đọc bảng ở phần A trong câu trả lời.</div>'; bar.classList.add("hidden"); b7Fixes = []; return; }
  b7Fixes = r.fixes;
  var maxD = 3;
  box.innerHTML = '<div style="display:grid;gap:10px">' + r.fixes.map(function(f, idx){
    var loc = findOld(d, f.old), dn = Math.abs(wc(f.nw) - wc(f.old)), flags = newWordFlags(f.old, f.nw), applied = !loc && d.indexOf(f.nw) >= 0;
    f.loc = loc; f.applied = applied; if(!loc) f.on = false;
    var st = applied ? '<span class="okf">Đã có trong bài (đã áp dụng)</span>' : (loc ? (loc.n > 1 ? '<span class="flag">Câu cũ xuất hiện ' + loc.n + ' lần; trang sẽ thay lần đầu.</span>' : '<span class="okf">Tìm thấy câu cũ trong bài.</span>') : '<span class="flag">Không tìm thấy câu cũ trong bài đang làm. AI chép sai câu, hoặc bài đã đổi. Nhắn AI chép lại đúng câu CŨ, hoặc sửa tay.</span>');
    var w = [];
    if(dn > maxD) w.push("Câu mới chênh " + dn + " từ (cho phép tối đa " + maxD + ").");
    if(flags.length) w.push("Từ mới vượt mức hoặc ngoài danh sách: " + esc(flags.join(", ")) + ".");
    return '<div class="fx ' + (f.lvl==="nat" ? "see nat" : f.lvl) + (applied ? ' done' : '') + '"><div class="fxh"><label><input type="checkbox" data-fx="' + idx + '"' + (f.on ? ' checked' : '') + (loc ? '' : ' disabled') + '> Áp dụng</label><span class="tag">' + (f.lvl==="must" ? "PHẢI SỬA" : (f.lvl==="nat" ? "TỰ NHIÊN" : "NÊN XEM")) + '</span><span class="muted small">Sửa ' + esc(f.n) + '</span></div>'
      + '<div class="row"><b>Đổi:</b> ' + wordDiffHTML(f.old, f.nw) + '</div>'
      + (f.why ? '<div class="row"><b>Vì:</b> ' + esc(f.why) + '</div>' : '')
      + '<div>' + st + '</div>' + (w.length ? '<div class="flag">' + w.join(" ") + '</div>' : '') + '</div>';
  }).join("") + '</div>';
  if(r.skipped) { box.insertAdjacentHTML("afterbegin", '<div class="note small">' + r.skipped + ' chỗ sửa bị thiếu CŨ hoặc MỚI nên trang bỏ qua. Nếu cần, nhắn AI:' + remindHTML(REMIND_B7) + '</div>'); bindRemind(box); }
  box.querySelectorAll("[data-fx]").forEach(function(c){ c.addEventListener("change", function(){ b7Fixes[+c.getAttribute("data-fx")].on = c.checked; }); });
  bar.classList.toggle("hidden", !r.fixes.some(function(f){ return f.loc; }));
}
function metricsOf(text){
  var a = analyze(text), vp = vocabProfile(text), sp = SPEC[S.spec], ti = LVL.indexOf(S.level), v = V();
  var hard = {}; vp.lemmas.forEach(function(l){ if(l.lv > ti) hard[l.w] = 1; }); vp.offList.forEach(function(o){ hard[o.w] = 1; });
  var fr = fleschOf(text);
  return {fre: fr.ok ? fr.fre : null, freOK: !fr.ok || freIn(fr.fre), words:a.total, longN:a.long.length, paras:a.body.length, cov:vp.cum[ti], lvlIn:easyLvl(vp), hard:hard,
    inRange: sp.min ? (a.total>=sp.min && a.total<=sp.max) : Math.abs(a.total-sp.approx)<=15,
    covOK: vp.cum[ti] >= sp.cov, floorOK: easyLvl(vp) >= LVL.indexOf(v.floorLevel), parasOK: sp.skill!=="R" || a.body.length===parseInt(v.paras,10)};
}
function applyB7(){
  var d = S.slots.draft || "", before = metricsOf(d), done = 0, miss = 0;
  b7Fixes.forEach(function(f){
    if(!f.on) return;
    var loc = findOld(d, f.old);
    if(!loc){ miss++; return; }
    d = d.slice(0, loc.i) + f.nw + d.slice(loc.i + loc.len); done++;
  });
  if(!done){ document.getElementById("b7-applymsg").textContent = miss ? "Không áp dụng được chỗ nào: không tìm thấy câu cũ." : "Chưa chọn chỗ nào để áp dụng."; return; }
  S.b7before = {m:before, at:Date.now()};
  setSlot("draft", d);
  document.getElementById("b7-applymsg").textContent = "Đã áp dụng " + done + " chỗ" + (miss ? "; " + miss + " chỗ không tìm thấy câu cũ" : "") + ". Xem kết quả kiểm lại ở mục 3.";
  renderB7(); renderRecheck();
}
function renderRecheck(){
  var card = document.getElementById("b7-recheck-card"); if(!card) return;
  var b = S.b7before, d = S.slots.draft || "";
  if(!b || !d.trim()){ card.classList.add("hidden"); return; }
  card.classList.remove("hidden");
  var m = metricsOf(d), o = b.m, sp = SPEC[S.spec], v = V(), rows = [];
  rows.push(srow(m.inRange ? "g" : "b", "<b>Độ dài:</b> " + o.words + " → " + m.words + " từ (cần " + esc(sp.words) + ")."));
  if(sp.skill==="R") rows.push(srow(m.parasOK ? "g" : "b", "<b>Số đoạn:</b> " + m.paras + "."));
  rows.push(srow(m.longN ? "b" : "g", "<b>Câu trên 25 từ:</b> " + o.longN + " → " + m.longN + "."));
  rows.push(srow(m.covOK ? (m.cov < sp.cov + 1.5 ? "w" : "g") : "b", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " " + o.cov.toFixed(1) + "% → " + m.cov.toFixed(1) + "% (cần từ " + sp.cov + "%)."));
  rows.push(srow(m.floorOK ? "g" : "b", "<b>Không dễ quá (ước lượng):</b> mức ở ngưỡng " + EASY_TH + "% " + lvlName(o.lvlIn) + " → " + lvlName(m.lvlIn) + " (cần " + esc(v.floorText) + ")."));
  if(m.fre!==null) rows.push(srow(m.freOK ? "g" : "b", "<b>Flesch Reading Ease:</b> " + (o.fre!==null ? o.fre.toFixed(1) : "?") + " → " + m.fre.toFixed(1) + " (cần " + freWin() + ")."));
  document.getElementById("b7-recheck").innerHTML = rows.join("");
  var newHard = Object.keys(m.hard).filter(function(w){ return !o.hard[w]; });
  var checks = [["độ dài", o.inRange, m.inRange], ["số đoạn", o.parasOK, m.parasOK], ["câu dài", o.longN===0, m.longN===0], ["không khó quá", o.covOK, m.covOK], ["không dễ quá", o.floorOK, m.floorOK], ["độ dễ đọc Flesch", o.freOK, m.freOK]];
  var regress = checks.filter(function(c){ return c[1] && !c[2]; }).map(function(c){ return c[0]; });
  var still = checks.filter(function(c){ return !c[1] && !c[2]; }).map(function(c){ return c[0]; });
  var adv, stillNote = still.length ? '<p class="small muted" style="margin-top:6px">Dòng đỏ "' + esc(still.join('", "')) + '" đã có từ trước khi sửa, không do các chỗ sửa gây ra. Nếu chưa xử lý ở bước 5, hãy quay lại xử lý.</p>' : '';
  if(regress.length) adv = '<div class="note"><b>Cần làm lại bước 5.</b> Các chỗ sửa làm hỏng: ' + esc(regress.join(", ")) + '. <button class="btn" type="button" data-goto="do-dai">Về bước 5</button></div>' + stillNote;
  else if(newHard.length || Math.abs(m.cov - o.cov) >= 0.5) adv = '<div class="note"><b>Các chỗ sửa không làm hỏng bước 5. Nên dán lại bài vào Text Profiler (bước 6) để xác nhận</b>, vì ' + (newHard.length ? "có từ mới vượt mức hoặc ngoài danh sách: " + esc(newHard.join(", ")) : "độ phủ thay đổi đáng kể") + '. <button class="btn" type="button" data-goto="tu-vung">Về bước 6</button></div>';
  else adv = '<div class="info"><span class="ok">✓</span> <b>Các chỗ sửa không cần làm lại bước 5 và 6.</b> Chúng không làm đổi độ dài, câu dài hay từ vựng đáng kể, và không thêm từ mới vượt mức.</div>';
  if(!regress.length) adv += stillNote;
  var ad = document.getElementById("b7-advice"); ad.innerHTML = adv;
  ad.querySelectorAll("[data-goto]").forEach(function(btn){ btn.addEventListener("click", function(){ show(btn.getAttribute("data-goto")); }); });
}
function needsPdf(p){ return slotsIn(p.t).some(function(id){ return isPdfSrc(id==="orig" ? origId() : id); }); }
function V(){ var v = vars(); v.unitName = SPEC[S.spec].skill==="R" ? "đoạn" : "phần"; return v; }
var fieldSeq = 0;

/* ---------- Fields ---------- */
function renderField(ph){
  var id = ph.getAttribute("data-field"), real = id==="orig" ? origId() : id, sl = SLOTS[real];
  var label = ph.getAttribute("data-label") || sl.label;
  var hint = ph.hasAttribute("data-hint") ? ph.getAttribute("data-hint") : (ph.hasAttribute("data-label") ? "" : (sl.hint || ""));
  var split = ph.getAttribute("data-split"), small = ph.hasAttribute("data-small");
  var fid = "f-" + real + "-" + (fieldSeq++), val = S.slots[real] || "", inner;
  if(sl.type==="area") inner = '<textarea id="'+fid+'" data-slot="'+real+'"'+(split?' data-split="'+split+'"':'')+(small?' class="sm"':'')+' placeholder="Dán vào đây">'+esc(val)+'</textarea>';
  else if(sl.type==="select") inner = '<select id="'+fid+'" data-slot="'+real+'">'+sl.options.map(function(o){ return '<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>'; }).join("")+'</select>';
  else inner = '<input type="text" id="'+fid+'" data-slot="'+real+'" value="'+esc(val)+'" placeholder="'+esc(sl.ph||"")+'">';
  var lab = esc(label).replace("{belowLevel}", '<span data-v="belowLevel"></span>');
  ph.innerHTML = '<label class="field" for="'+fid+'"><span class="lab">'+lab+(sl.optional?' <span class="meta">(không bắt buộc)</span>':'')+(sl.type==="area"?'<span class="meta" data-wc="'+real+'"></span>':'')+'</span>'
    + (hint ? '<span class="hint">'+esc(hint)+'</span>' : '') + inner + (split ? '<span class="splitmsg"></span>' : '') + '</label>';
  var el = ph.querySelector("[data-slot]");
  var pasted = false;
  var h = function(){
    var sp = el.getAttribute("data-split"), msg = ph.querySelector(".splitmsg"), msgs = [], wasPaste = pasted, prevDraft = real === "draft" ? (S.slots.draft || "") : null;
    if(sl.type==="area" && (pasted || /```/.test(el.value))){
      var c = cleanPaste(el.value);
      if(real==="draft" && CHATTY_RE.test(c + "\n")){ c = c.replace(CHATTY_RE, ""); msgs.push("Đã bỏ câu dẫn của AI ở đầu."); }
      if(c !== el.value) el.value = c;
    }
    if(sp){
      var m = ("\n" + el.value).match(SPLIT_RE);
      if(m){
        var idx = Math.max(0, m.index - 1), before = el.value.slice(0, idx).replace(/\s+$/,""), after = el.value.slice(idx + m[0].length - 1).trim();
        el.value = before;
        if(sp==="discard"){
          var stg = real==="draft" && SPEC[S.spec].skill==="L" ? extractSetting(after) : "";
          if(stg){ setSlot("setting", stg); msgs.push("Đã bỏ phần ghi chú cuối bài; phần bối cảnh AI đặt đã tách xuống mục 4 để bạn xem."); }
          else msgs.push("Đã bỏ phần ghi chú cuối bài." + (real==="draft" && SPEC[S.spec].skill==="L" ? " AI chưa ghi mục BỐI CẢNH nên mục 4 chưa có bối cảnh để xem." : ""));
        }
        else { setSlot(sp, after); msgs.push(sp==="notes" ? "Đã tách phần ghi chú của AI xuống ô bên dưới." : "Đã tách phần AI liệt kê thay đổi xuống ô bên dưới."); }
      } else if(pasted && /(\(1\)|\(6\)|BẢN ĐỒ|word count|số từ\s*:|→|->)/i.test(el.value.slice(-Math.min(el.value.length, 1500)))){
        if(msg){ msg.innerHTML = '<span class="no">Không thấy dòng phân cách giữa bài và phần ghi chú, nên trang chưa tách được.</span> Hãy dùng nút Copy của khối code, hoặc nhắn AI:' + remindHTML(REMIND_SPLIT); bindRemind(msg); }
        pasted = false; setSlot(real, el.value, el); return;
      }
    }
    if(msg) msg.textContent = msgs.join(" ");
    pasted = false;
    setSlot(real, el.value, el);
    var mtxt = msgs.join(" "); if(mtxt) setTimeout(function(){ var mm = ph.querySelector(".splitmsg"); if(mm && !mm.textContent) mm.textContent = mtxt; }, 0);
    if(real === "draft" && wasPaste && prevDraft !== null && prevDraft !== (S.slots.draft || "") && prevDraft.trim()){
      var pd = prevDraft, nw = S.slots.draft || "";
      S.slots.prePaste = pd; S.diffBase = "paste"; save(); runDiff();
      setTimeout(function(){
        var mm = ph.querySelector(".splitmsg"); if(!mm) return;
        mm.innerHTML = esc(mm.textContent ? mm.textContent + " " : "") + '<b>Đã thay bài đang làm: ' + wc(pd) + ' → ' + wc(nw) + ' từ.</b> <button type="button" class="btn quiet sm" data-undo-paste>Hoàn tác</button>';
        var ub = mm.querySelector("[data-undo-paste]");
        if(ub) ub.addEventListener("click", function(){ setSlot("draft", pd); mm.innerHTML = "Đã quay lại bản trước khi dán (" + wc(pd) + " từ)."; toast("Đã quay lại bản trước khi dán."); });
      }, 0);
    }
  };
  el.addEventListener("paste", function(){ pasted = true; });
  el.addEventListener("input", h); el.addEventListener("change", h);
}
// lấy mục BỐI CẢNH (Người nói, Người nghe, Dịp, Manh mối, Hợp với…) trong phần ghi chú AI trả về
function extractSetting(t){
  var L = String(t || "").split("\n"), i = -1;
  for(var k = 0; k < L.length; k++){ if(/^\s*[*#\-\s]*BỐI CẢNH\s*:?\s*\**\s*$/i.test(L[k]) || /^\s*[*#\-\s]*BỐI CẢNH\s*:/i.test(L[k])){ i = k; break; } }
  if(i < 0) return "";
  var out = [], first = L[i].replace(/^\s*[*#\-\s]*BỐI CẢNH\s*:?\s*\**/i, "").trim();
  if(first) out.push(first);
  for(var j = i + 1; j < L.length; j++){
    var ln = L[j].replace(/^\s*[*\-•]+\s*/, "").trim();
    if(!ln){ if(out.length) break; else continue; }
    if(/^(Người nói|Người nghe|Dịp|Nơi|Manh mối|Hợp với|Vai)/i.test(ln) || (out.length && /^\s{2,}/.test(L[j]))) out.push(ln);
    else if(out.length) break;
  }
  return out.join("\n");
}
// giải thích độ phủ bằng phần còn lại: bao nhiêu % (và khoảng bao nhiêu lượt) đang ở trên mức hoặc ngoài danh sách, và được phép tối đa bao nhiêu
function covGapText(now, need, L){
  var vp = lastVocab || (typeof currentVocab === "function" ? currentVocab() : null), N = vp && vp.N ? vp.N : 0, gap = Math.max(0, 100 - now), lim = Math.max(0, 100 - need);
  var U = N ? Math.round(N * gap / 100) : 0, A = N ? Math.floor(N * lim / 100 + 1e-6) : 0;
  return {
    now: " (tức là " + gap.toFixed(1) + "% lượt từ" + (N ? ", khoảng " + U + " lượt," : "") + " ở trên mức " + L + " hoặc không có trong danh sách CEFR-J/Octanove)",
    need: " (tức là tối đa " + lim + "%" + (N ? ", khoảng " + A + " lượt trong " + N + " lượt từ" + (U > A ? "; cần bớt ít nhất " + (U - A) + " lượt" : "") : "") + ")"
  };
}
// gợi ý tính sẵn cho "không dễ quá": cần thêm bao nhiêu lượt từ ở mức sàn trở lên
function easyGapText(vp, flIdx, tiIdx){
  if(!vp || !vp.N) return ""; var Nin = vp.N, upto = easyUpto(vp, flIdx);
  var need = Math.floor(Nin * (100 - EASY_TH) / 100) + 1, more = Math.max(0, need - upto), FL = LVL[flIdx], rng = flIdx === tiIdx ? FL : FL + "–" + LVL[tiIdx];
  return " Hiện có " + upto + " lượt từ mức " + FL + " trở lên hoặc ngoài danh sách (" + (Nin ? (100 * upto / Nin).toFixed(1) : "0") + "% của " + Nin + " lượt, không tính tên riêng); cần trên " + (100 - EASY_TH) + "%, tức ít nhất " + need + " lượt: đổi thêm khoảng " + more + " lượt từ dưới mức " + FL + " thành từ mức " + rng + " có trong danh sách (không dùng từ trên mức " + LVL[tiIdx] + "; từ ngoài danh sách tuy giúp qua sàn nhưng bị tính vào phần vượt mức ở độ phủ). Một từ nhắc lại nhiều lần được tính mỗi lần.";
}
// các từ trên mức dùng nhiều nhất (để sửa tay "không khó quá")
function aboveTopText(vp, tiIdx, n){
  if(!vp) return ""; var keep = {}; keepList().forEach(function(k){ keep[k.toLowerCase()] = 1; });
  var L = vp.lemmas.filter(function(l){ return l.lv > tiIdx && !keep[l.w]; }).map(function(l){ return {w:l.w + " (" + LVL[l.lv] + ")", n:l.n}; })
    .concat(vp.offList.filter(function(o){ return !keep[o.w]; }).map(function(o){ return {w:o.w + " (ngoài danh sách)", n:o.n}; }))
    .sort(function(a, b){ return b.n - a.n; }).slice(0, n || 8);
  return L.length ? " Dùng nhiều nhất: " + L.map(function(x){ return x.w + (x.n > 1 ? " ×" + x.n : ""); }).join(", ") + "." : "";
}
function setSlot(id, val, src){
  // chế độ xem: không đổi nội dung (người khác đang giữ bước này, hoặc chưa tới bước này)
  if(!wfBypass && typeof wfCanEditSlot === "function" && val !== (S.slots[id] || "") && !wfCanEditSlot(id)){
    document.querySelectorAll('[data-slot="' + id + '"]').forEach(function(o){ if(o.value !== (S.slots[id] || "")) o.value = S.slots[id] || ""; });
    if(src) toast("Chế độ xem: bạn không sửa được bước này. Xem dòng ghi chú ở đầu bước."); return;
  }
  if(id==="draft" && !wfBypass && typeof wfDraftLocked==="function" && wfDraftLocked() && val !== (S.slots.draft||"")){
    document.querySelectorAll('[data-slot="draft"]').forEach(function(o){ o.value = S.slots.draft||""; });
    toast("Bài đã khoá (bản " + S.wf.lock.ver + "). Cần đổi bài thì gửi yêu cầu sửa ngữ liệu ở thanh Quy trình."); return;
  }
  S.slots[id] = val; save();
  document.querySelectorAll('[data-slot="'+id+'"]').forEach(function(o){ if(o!==src && o.value!==val) o.value = val; });
  if(id==="draft"){ lastAnalysis = null; lastVocab = null; lastFre = null; runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); }
  if(id==="draft" || id==="src" || id==="srcPdfText"){ try{ sbRender(); }catch(e){} }
  if(id==="src" || id==="srcPdfText") runOverlap();
  if(id==="keep") renderKeepCheck();
  if(id==="b7out" || id==="draft"){ renderB7(); }
  if(id==="notes" || id==="draft") renderAnchors();
  if(id==="draft") renderRecheck();
  if(id==="pfCov"||id==="pfLvl95"||id==="pfCovBelow"){ S.pfSig = draftSig(S.slots.draft); runBand(); }
  if(id==="topic"){ renderFilenames(); renderChip(); }
  if(id==="qblind") S.qBlindFor = qHash(S.slots.questions||"");
  if(id==="questions" || id==="draft" || id==="notes" || id==="qblind") renderQ();
  schedule();
}
var pvT; function schedule(){ clearTimeout(pvT); pvT = setTimeout(function(){ refreshText(); try{ clRender(); }catch(e){} updateStepper(); }, 150); }

/* ---------- AI boxes ---------- */
function renderAI(ph){
  var key = promptKey(ph.getAttribute("data-ai")); ph.setAttribute("data-key", key);
  var tip = key==="b2" ? 'Dán vào AI <b>đã bật tìm kiếm web</b>, trong một cuộc trò chuyện mới, rồi gửi.' : 'Dán vào <b>một cuộc trò chuyện mới</b> với AI rồi gửi.';
  if(P[key] && /khối code/.test(P[key].t)) tip += ' Khi AI trả lời, bấm <b>nút Copy ở góc khối code</b> để lấy kết quả, đừng bôi đen để copy.';
  ph.innerHTML = '<div class="ai"><p class="attach note small hidden"></p><button class="btn primary big" type="button">Sao chép câu lệnh</button><p class="small muted">'+tip+'</p><p class="warn"></p><details class="peek"><summary>Xem câu lệnh sẽ gửi</summary><pre></pre></details></div>';
  var btn = ph.querySelector("button"), warn = ph.querySelector(".warn");
  btn.addEventListener("click", function(){
    var p = P[ph.getAttribute("data-key")], miss = missing(p);
    if(miss.length){ warn.textContent = "Chưa sao chép được: còn trống ô " + miss.join(", ") + "."; return; }
    warn.textContent = "";
    copyText(assemble(p, vars()), btn, "Sao chép câu lệnh", "Đã sao chép. Giờ dán vào AI");
  });
}
function renderAllAI(){ document.querySelectorAll("[data-ai]").forEach(renderAI); }

function copyText(text, btn, label, okText){
  var old = label || btn.textContent;
  function done(ok){ btn.textContent = ok ? (okText || "Đã sao chép") : "Không sao chép được"; setTimeout(function(){ btn.textContent = old; }, 2200); }
  try{ navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(fallbackCopy(text)); }); }
  catch(e){ done(fallbackCopy(text)); }
}
function fallbackCopy(text){
  try{ var ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); var ok=document.execCommand("copy"); document.body.removeChild(ta); return ok; }catch(e){ return false; }
}

/* ---------- Text that depends on settings / slots ---------- */
function refreshText(){
  var v = V();
  document.querySelectorAll("[data-ai]").forEach(function(ph){
    var p = P[ph.getAttribute("data-key")]; if(!p) return;
    var pre = ph.querySelector("pre"); if(pre) pre.innerHTML = preview(p, v);
    var w = ph.querySelector(".warn"); if(w && w.textContent && !missing(p).length) w.textContent = "";
    var at = ph.querySelector(".attach");
    if(at){ var need = needsPdf(p); at.classList.toggle("hidden", !need); if(need) at.innerHTML = "Bước này cần <b>đính kèm file PDF</b>" + (S.slots.pdfName ? " <b>" + esc(S.slots.pdfName) + "</b>" : "") + " vào cuộc trò chuyện, rồi dán câu lệnh."; }
  });
  document.querySelectorAll("[data-v]").forEach(function(el){ var k = el.getAttribute("data-v"); el.textContent = v[k]!==undefined ? v[k] : ""; });
  document.querySelectorAll("[data-wc]").forEach(function(el){ var t = S.slots[el.getAttribute("data-wc")]; el.textContent = t && t.trim() ? " · " + wc(t) + " từ" : ""; });
  renderHave();
}
function haveLine(ok, text, goto, gotoName){
  return '<div>' + (ok ? '<span class="ok">✓</span> ' + text : '<span class="no">✗</span> ' + text + (goto ? ' <button class="btn quiet" type="button" data-goto="'+goto+'">Về bước '+gotoName+'</button>' : '')) + '</div>';
}
function renderHave(){
  var isL = SPEC[S.spec].skill==="L";
  document.querySelectorAll("[data-have]").forEach(function(el){
    var k = el.getAttribute("data-have"), h = "";
    if(k==="topic"){ var t = slotVal("topic"); h = haveLine(!!t, t ? "Chủ đề: <i>"+esc(t)+"</i>" : "Chưa có chủ đề.", "chu-de", "Chủ đề"); }
    if(k==="src"){
      if(isPdfSrc("src")){ var nm = (S.slots.pdfName||"").trim(), scp = (S.slots.pdfScope||"").trim(); h = haveLine(!!(nm && scp), nm && scp ? "Nguồn là file PDF <b>" + esc(nm) + "</b> (phần: " + esc(scp) + "). Nhớ đính kèm file khi gửi câu lệnh." : "Chưa ghi tên file PDF và phần cần dùng.", "nguon", "Nguồn"); }
      else { var s = slotVal("src"); h = haveLine(!!s, s ? "Đã có văn bản nguồn tiếng Anh ("+wc(s)+" từ)." : "Chưa có văn bản nguồn tiếng Anh.", "nguon", "Nguồn"); }
    }
    if(k==="orig"){
      var o = slotVal("orig"), d = slotVal("draft");
      h = haveLine(!!o, o ? (isL ? "Đoạn dữ kiện (" + wc(o) + " từ)" : (isPdfSrc("src") ? "Nguồn: file PDF <b>" + esc(S.slots.pdfName||"") + "</b>, nhớ đính kèm" : "Văn bản nguồn (" + wc(o) + " từ)")) : "Chưa có " + (isL ? "đoạn dữ kiện." : "nguồn."), isL ? "viet-kich-ban" : "nguon", isL ? "Viết kịch bản" : "Nguồn")
        + haveLine(!!d, d ? "Bài đang làm ("+wc(d)+" từ)" : "Chưa có bài đang làm.", isL ? "viet-kich-ban" : "viet-bai", isL ? "Viết kịch bản" : "Viết bài");
    }
    el.innerHTML = h;
    el.querySelectorAll("[data-goto]").forEach(function(b){ b.addEventListener("click", function(){ show(b.getAttribute("data-goto")); }); });
  });
}

/* ---------- Settings summary ---------- */
function renderChip(){ var sp = SPEC[S.spec]; document.getElementById("curbai").textContent = sp.label + (sp.skill === "W" || sp.skill === "S" ? "" : " · " + S.level) + (slotVal("topic") ? " · " + slotVal("topic").slice(0,40) : ""); }
function renderFilenames(){
  var sp = SPEC[S.spec], code = S.code ? slug(S.code) : S.spec, t = S.slots.topic ? slug(S.slots.topic) : "chu-de";
  var names = sp.skill==="R" ? ["nguon","bientap","chot"] : ["nguon","dukien","kichban","chot"];
  document.getElementById("fnames").textContent = names.map(function(n){ return code+"_"+t+"_"+n; }).join(", ");
}
function renderSpec(){
  var sp = SPEC[S.spec], v = V(), isR = sp.skill==="R";
  var parts = ["<b>" + esc(sp.label) + "</b> cần: " + esc(sp.words) + " từ" + (isR ? " (tính cả tiêu đề)" : (sp.grp!==3 ? " (tính cả tên người nói)" : ""))];
  if(isR) parts.push(esc(v.paras) + " đoạn");
  if(sp.speed) parts.push(esc(sp.speed));
  parts.push("nội dung: " + esc(sp.genre));
  parts.push("từ vựng mức " + esc(S.level));
  parts.push("Flesch Reading Ease " + freWin());
  parts.push(esc(sp.qcount) + (sp.qdist ? " (bậc 3/4/5: " + esc(sp.qdist) + ")" : ""));
  var lockNote = (typeof SPECS !== "undefined" && !SPECS.loaded) ? ' <span class="small muted">Số từ đang theo QĐ 730' + (isR ? ", chưa có bảng phân bố câu hỏi" : "") + '. Yêu cầu của VNCETA' + (isR ? " và bảng phân bố" : "") + ' là tài liệu tập huấn, chỉ tải khi đăng nhập bằng tài khoản được quản trị cho xem đặc tả.</span>' : "";
  document.getElementById("specsum").innerHTML = parts.join(" · ") + "." + lockNote;
  var lh = document.getElementById("level-hint"); if(lh) lh.textContent = levelHint();
  var qf = document.getElementById("q-format"); if(qf) qf.textContent = qFormatText();
  var pe = document.getElementById("set-paras"); pe.disabled = (!isR || S.spec==="R1"); if(S.spec==="R1") pe.value = 4;
  var q = ["<b>Số câu:</b> " + esc(sp.qcount)];
  q.push("<b>Số câu theo bậc 3 / 4 / 5:</b> " + (sp.qdist ? esc(sp.qdist) : "cả bài Nghe 14 / 12 / 9; chia theo phần theo hướng dẫn của nhóm"));
  if(sp.skills) q.push("<b>Kỹ năng được hỏi:</b> " + esc(sp.skills));
  var qse = document.getElementById("qspec"); if(qse) qse.innerHTML = q.join("<br>");
  renderChip(); renderFilenames();
}

/* ---------- Branch + navigation ---------- */
function screens(){ var sk = SPEC[S.spec].skill; return Array.prototype.filter.call(document.querySelectorAll(".screen"), function(s){ var b = s.getAttribute("data-branch"); var sx = s.getAttribute("data-specs"); return (b==="all" || b.split(" ").indexOf(sk) >= 0) && (!sx || sx.split(" ").indexOf(S.spec) >= 0); }); }
function applyBranch(){
  var sp = SPEC[S.spec], b = sp.skill;
  document.querySelectorAll("[data-branchtext]").forEach(function(el){ el.classList.toggle("hidden", el.getAttribute("data-branchtext")!==b); });
  document.querySelectorAll("[data-grp]").forEach(function(el){ el.classList.toggle("hidden", String(sp.grp)!==el.getAttribute("data-grp")); });
  document.querySelectorAll("[data-skills]").forEach(function(el){ el.classList.toggle("hidden", el.getAttribute("data-skills").split(" ").indexOf(b) < 0); });
  try{ wsSync(); wsRenderForm(); }catch(e){}
  var list = screens();
  if(list.map(function(s){return s.id;}).indexOf(S.step)===-1){
    if(S.step==="viet-bai" && b==="L") S.step = "viet-kich-ban";
    else if(S.step==="viet-kich-ban" && b==="R") S.step = "viet-bai";
    else S.step = "bat-dau";
  }
  list.forEach(function(s,i){ s.querySelector(".kicker").textContent = "Bước " + (i+1) + " / " + list.length; });
  show(S.step, true);
}
function gatesOf(s){ return Array.prototype.filter.call(s.querySelectorAll("input[data-gate]"), function(i){ var l = i.closest("label"); return !(l && l.classList.contains("hidden")); }); }
function updateStepper(){
  var nav = document.getElementById("stepper"), list = screens();
  nav.innerHTML = list.map(function(s,i){
    var g = gatesOf(s), done = g.length && g.every(function(x){return x.checked;});
    return '<button type="button" data-step="'+s.id+'" class="'+(s.id===S.step?"cur ":"")+(done?"done":"")+'"><span class="sn">'+(done?"✓":(i+1))+'</span>'+esc(s.getAttribute("data-name"))+'</button>';
  }).join("");
  nav.querySelectorAll("button").forEach(function(b){ b.addEventListener("click", function(){ show(b.getAttribute("data-step")); }); });
  var cur = nav.querySelector(".cur"); if(cur){ var l = cur.offsetLeft - nav.offsetLeft, r = l + cur.offsetWidth; if(l < nav.scrollLeft || r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = Math.max(0, l - 40); }
}
function show(id, noScroll){
  var list = screens(), ids = list.map(function(s){return s.id;});
  if(ids.indexOf(id)===-1) id = ids[0];
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.toggle("hidden", s.id!==id); });
  S.step = id; save();
  if(id==="nop" && (typeof wfCanEditScreen !== "function" || wfCanEditScreen("nop"))) try{ fillAuto(); }catch(e){}
  if(id==="chat-lieu" || id==="cau-hoi" || id==="ws-kiem") try{ clRender(); }catch(e){}
  if(id==="nguon" && typeof wfG1Render === "function") try{ wfG1Render(); }catch(e){}
  try{ cmpRenderMounts(); }catch(e){}
  try{ if(location.hash !== "#"+id) history.replaceState(null, "", "#"+id); }catch(e){}
  updateStepper();
  try{ wfModeApply(); }catch(e){}
  if(!noScroll) window.scrollTo(0,0);
}
function go(delta){
  var ids = screens().map(function(s){return s.id;}), i = ids.indexOf(S.step);
  if(i+delta>=0 && i+delta<ids.length) show(ids[i+delta]);
}
function bindNav(){
  document.querySelectorAll("[data-next]").forEach(function(b){
    var armed = false, scr = b.closest(".screen");
    b.addEventListener("click", function(){
      var left = gatesOf(scr).filter(function(x){return !x.checked;}).length, msg = scr.querySelector(".navmsg");
      if(left && !armed){ armed = true; msg.textContent = "Còn " + left + " mục chưa đánh dấu ở khung phía trên. Bấm Tiếp tục lần nữa nếu vẫn muốn sang bước sau."; return; }
      armed = false; msg.textContent = "";
      if(scr.hasAttribute("data-approve") && (S.slots.draft||"").trim()){ S.slots.approved = S.slots.draft; S.fixOpen = {}; save(); runDiff(); runLength(); runBand(); }
      go(1);
    });
  });
  document.querySelectorAll("[data-prev]").forEach(function(b){ b.addEventListener("click", function(){ go(-1); }); });
  window.addEventListener("hashchange", function(){ var h = location.hash.slice(1); if(h && h!==S.step) show(h); });
}

/* ---------- Bước 5: độ dài ---------- */
function srow(cls, html){ return '<div class="srow '+cls+'"><span class="ic">'+(cls==="g"?"✓":(cls==="b"?"!":"–"))+'</span><div>'+html+'</div></div>'; }
function runLength(){
  var box = document.getElementById("len-status");
  var txt = S.slots.draft || "", sp = SPEC[S.spec], v = V();
  if(!txt.trim()){ box.innerHTML = srow("w", "Chưa có bài. Quay lại bước 4 để dán bài AI viết."); document.getElementById("vocab-detail").innerHTML = ""; lastVocab = null; lastFre = null; renderFixAll(); return; }
  var a = analyze(txt); lastAnalysis = a;
  var rows = [], needFix = false;
  if(sp.min){
    var d = a.total<sp.min ? a.total-sp.min : (a.total>sp.max ? a.total-sp.max : 0);
    if(d===0) rows.push(srow("g", "<b>Độ dài:</b> " + a.total + " từ, đúng yêu cầu " + esc(sp.words) + "."));
    else { needFix = true; rows.push(srow("b", "<b>Độ dài:</b> " + a.total + " từ, " + (d<0 ? "thiếu " + (-d) : "thừa " + d) + " từ so với yêu cầu " + esc(sp.words) + ".")); }
  } else {
    var dd = a.total - sp.approx;
    if(Math.abs(dd)<=15) rows.push(srow("g", "<b>Độ dài:</b> " + a.total + " từ, gần mức yêu cầu " + esc(sp.words) + "."));
    else { needFix = true; rows.push(srow("b", "<b>Độ dài:</b> " + a.total + " từ, lệch " + (dd>0?"+":"") + dd + " so với " + esc(sp.words) + ".")); }
  }
  if(sp.skill==="R"){
    var target = parseInt(v.paras,10);
    if(a.body.length===target) rows.push(srow("g", "<b>Số đoạn:</b> " + target + " đoạn (" + a.body.map(function(b){return b.n;}).join(" / ") + " từ)."));
    else { needFix = true; rows.push(srow("b", "<b>Số đoạn:</b> có " + a.body.length + " đoạn, cần " + target + ". Các đoạn phải cách nhau một dòng trống.")); }
    if(a.titles.length===1) rows.push(srow("g", "<b>Tiêu đề:</b> " + esc(a.titles[0].text)));
    else if(!a.titles.length) rows.push(srow("b", "<b>Tiêu đề:</b> không thấy. Tiêu đề phải ở dòng đầu, tối đa 10 từ, không có dấu chấm cuối, cách đoạn đầu một dòng trống. Sửa tay trong ô \"Bài đang làm\"."));
    else rows.push(srow("b", "<b>Tiêu đề:</b> có " + a.titles.length + " dòng bị coi là tiêu đề (" + esc(a.titles.map(function(t){return t.text;}).join(" | ")) + "). Kiểm lại các dòng thiếu dấu chấm."));
  } else {
    rows.push(srow("w", "<b>Thời lượng ước tính:</b> " + fmtMin(a.total,150) + " ở 150 từ/phút (" + fmtMin(a.total,130) + " ở 130, " + fmtMin(a.total,170) + " ở 170)."));
  }
  if(!a.long.length) rows.push(srow("g", "<b>Câu dài:</b> không có câu nào trên 25 từ."));
  else { needFix = true; rows.push(srow("b", "<b>Câu dài:</b> " + a.long.length + " câu trên 25 từ: " + a.long.map(function(l){ return "<i>" + esc(l.s.slice(0,70)) + "…</i> (" + l.n + " từ)"; }).join("; "))); }
  var wantUK = S.spelling==="Anh–Anh", wrong = wantUK ? a.us : a.uk, wrongD = wantUK ? a.usDates : a.ukDates;
  if(!wrong.length && !wrongD.length) rows.push(srow("g", "<b>Chính tả:</b> thống nhất kiểu " + esc(S.spelling) + "."));
  else rows.push(srow("b", "<b>Chính tả:</b> có chỗ viết kiểu " + (wantUK?"Mỹ":"Anh") + ": " + esc(wrong.concat(wrongD).join(", ")) + ". Sửa tay trong ô \"Bài đang làm\"; ngày viết như " + esc(v.dateEx) + "."));
  if(/(^|\n)\s*-{3,}\s*(\n|$)/.test(txt) || /\b(word count|số từ)\b/i.test(txt)) rows.push(srow("b", "<b>Ghi chú lẫn vào bài:</b> có vẻ bài còn phần ghi chú của AI. Xoá đi trong ô \"Bài đang làm\"."));
  var vp = vocabProfile(txt); lastVocab = vp;
  var ti = LVL.indexOf(S.level), fl = LVL.indexOf(v.floorLevel), cT = vp.cum[ti], aboveN = 0;
  vp.lemmas.forEach(function(l){ if(l.lv > ti) aboveN += l.n; });
  var vHard = cT < sp.cov, vNear = !vHard && cT < sp.cov + 1.5, vEasy = easyLvl(vp) < fl;
  var det = aboveN + " lượt từ trên mức " + S.level + ", " + vp.off + " lượt ngoài danh sách (không tính tên riêng).";
  var cgv = covGapText(cT, sp.cov, S.level);
  if(vHard) rows.push(srow("b", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "%" + cgv.now + ", cần từ " + sp.cov + "%" + cgv.need + ". " + det + esc(aboveTopText(vp, ti, 8))));
  else if(vNear) rows.push(srow("w", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "%, sát ngưỡng " + sp.cov + "%. " + det + " Ước lượng của trang thường cao hơn Text Profiler khoảng 1 điểm, nên có thể sửa thêm."));
  else rows.push(srow("g", "<b>Không khó quá (ước lượng):</b> độ phủ ở mức " + S.level + " là " + cT.toFixed(1) + "% (cần từ " + sp.cov + "%). " + det));
  if(vEasy) rows.push(srow("b", "<b>Không dễ quá (ước lượng):</b> tính cả từ ngoài danh sách, mức ở ngưỡng " + EASY_TH + "% của bài là " + lvlName(easyLvl(vp)) + ", cần " + esc(v.floorText) + "." + esc(easyGapText(vp, fl, ti)) + " Từ dùng nhiều có thể nâng: " + esc(v.upCands6 || "") + ". Bật màu " + esc(LVL[fl]) + " trong ô \"Bài đang làm\" để thấy chỗ đã đạt."));
  else rows.push(srow("g", "<b>Không dễ quá (ước lượng):</b> tính cả từ ngoài danh sách, mức ở ngưỡng " + EASY_TH + "% của bài là " + lvlName(easyLvl(vp)) + " (cần " + esc(v.floorText) + ")."));
  var fr = fleschOf(txt); lastFre = fr;
  var fm = FRE_MIN[S.level], freFail = false;
  if(!fr.ok) rows.push(srow("w", "<b>Độ dễ đọc (Flesch Reading Ease):</b> chưa tính được, bài cần ít nhất 60 từ và 3 câu."));
  else {
    var band = freBand(fr.fre);
    freFail = !freIn(fr.fre);
    var fx = FRE_MAX[S.level], AR = FRE_ASL[S.level], fNear = !freFail && (fr.fre < fm + 3 || (fx < 200 && fr.fre > fx - 3));
    rows.push(srow(freFail ? "b" : (fNear ? "w" : "g"), "<b>Độ dễ đọc (Flesch Reading Ease):</b> " + fr.fre.toFixed(1) + " · " + band[1] + " (dải " + band[2] + "); yêu cầu " + freWin() + " với mức " + S.level + (freFail ? (fr.fre < fm ? " — <b>khó quá</b> theo Flesch" : " — <b>dễ quá</b> theo Flesch") : (fNear ? " — sát mép, sửa tiếp cẩn thận" : "")) + ". Câu trung bình " + fr.asl.toFixed(1) + " từ (gợi ý " + AR[0] + "–" + AR[1] + "), " + fr.spw.toFixed(2) + " âm tiết mỗi từ (gợi ý " + FRE_SPW[S.level] + ")." + (freFail && v.freLever ? " Cách đạt: " + esc(v.freLever) + "." : "")));
  }
  if(sp.skill==="L"){ var spkR = spkRowHTML(); if(spkR) rows.push(spkR); }
  var WCK = null; try{ WCK = wordCheck(); }catch(e){ WCK = null; }
  var wcRaise = false; try{ wcRaise = wcRaising(v); }catch(e){}
  var wcBad = WCK ? WCK.above.length + WCK.off.length + (wcRaise ? WCK.near.length : 0) : 0;
  if(WCK && (WCK.above.length || WCK.off.length || WCK.at.length || WCK.near.length || WCK.lostAt.length)){
    var wl = function(arr, tag){ return arr.map(function(it){ return "<b>" + esc(it.w) + "</b> <span class=\"muted\">(" + esc(tag(it)) + (it.n > 1 ? " ×" + it.n : "") + ", " + it.syl + " âm tiết" + (it.old ? "; trước: " + esc(it.old) : "") + ")</span>"; }).join("; "); };
    var parts = [];
    if(WCK.above.length) parts.push("trên mức " + S.level + " (bị trừ độ phủ): " + wl(WCK.above, function(it){ return LVL[it.lv]; }));
    if(WCK.off.length) parts.push("không có trong danh sách (bị trừ độ phủ): " + wl(WCK.off, function(){ return "ngoài danh sách"; }));
    if(wcRaise && WCK.at.length) parts.push("đúng mức " + S.level + " (giúp nâng mức): " + wl(WCK.at, function(it){ return LVL[it.lv]; }));
    if(wcRaise && WCK.near.length) parts.push("chỉ ở mức " + LVL[LVL.indexOf(S.level) - 1] + " (chưa giúp nâng mức): " + wl(WCK.near, function(it){ return LVL[it.lv]; }));
    if(wcRaise && WCK.lostAt.length) parts.push("từ mức " + S.level + " bị mất so với bản đã duyệt: " + esc(WCK.lostAt.join(", ")));
    if(parts.length) rows.push(srow(wcBad ? "w" : "g", "<b>Tra lại từ mới so với bản đã duyệt</b> (theo đúng danh sách và cách tra của trang): " + parts.join(" · ") + (wcBad ? " · Dùng câu lệnh \"Sửa các từ AI dùng sai mức\" bên dưới." : "")));
  }
  document.querySelectorAll(".wordfix-panel").forEach(function(el){ el.classList.toggle("hidden", !wcBad); });
  box.innerHTML = rows.join("");
  try{ lvRender(); }catch(e){}
  var keepL = {}; keepList().forEach(function(k){ keepL[k.toLowerCase()] = 1; });
  var abL = vp.lemmas.filter(function(l){ return l.lv > ti; }).map(function(l){ return esc(l.w) + " <span class=\"muted\">(" + LVL[l.lv] + (l.n>1 ? " ×" + l.n : "") + ")</span>" + (keepL[l.w] ? " <span class=\"ok\">giữ lại</span>" : ""); });
  var ofL = vp.offList.map(function(o){ return esc(o.w) + (o.n>1 ? " <span class=\"muted\">×" + o.n + "</span>" : "") + (keepL[o.w] ? " <span class=\"ok\">giữ lại</span>" : ""); });
  var atL = vp.lemmas.filter(function(l){ return l.lv === ti; }).map(function(l){ return esc(l.w); });
  document.getElementById("vocab-detail").innerHTML =
    "<div><b>Trên mức " + S.level + ":</b> " + (abL.length ? abL.join(", ") : "không có") + "</div>"
    + "<div><b>Ngoài danh sách</b> (thường là từ phái sinh, thuật ngữ, từ ghép): " + (ofL.length ? ofL.join(", ") : "không có") + "</div>"
    + "<div><b>Đúng mức " + S.level + "</b> (tham khảo): " + (atL.length ? atL.join(", ") : "không có") + "</div>"
    + "<div class=\"muted\"><b>Coi là tên riêng, không tính:</b> " + (vp.proper.length ? esc(vp.proper.join(", ")) : "không có") + ". Nếu trang nhận nhầm một từ thường thành tên riêng, kết quả có thể lệch.</div>";
  renderFixAll();
  document.querySelectorAll('[data-slot="pfCov"]').forEach(function(el){ el.placeholder = "trang ước lượng: " + cT.toFixed(1); });
  var be = document.getElementById("band-est"); if(be) be.textContent = "Trang ước lượng ở bước 5: độ phủ ở mức " + S.level + " khoảng " + cT.toFixed(1) + "%, mức ở ngưỡng 95% (không tính từ ngoài danh sách) khoảng " + lvlName(vp.lvl95In) + ", ở ngưỡng " + EASY_TH + "% (tính cả từ ngoài danh sách) là " + lvlName(easyLvl(vp)) + ". Độ phủ lấy số Text Profiler làm chuẩn; ngưỡng " + EASY_TH + "% do trang tính (Text Profiler không báo).";
}

/* ---------- Bước 6: dải từ vựng ---------- */
function runBand(){
  var vd = document.getElementById("band-verdict"), det = document.getElementById("band-detail");
  var sp = SPEC[S.spec], v = V(), LV = ["A1","A2","B1","B2","C1","C2","trên C2"];
  var ti = LV.indexOf(S.level), fl = LV.indexOf(v.floorLevel);
  var cov = parseFloat(String(S.slots.pfCov||"").replace(",", ".")), l95 = LV.indexOf(S.slots.pfLvl95||"");
  var hard = false, easy = false, upOK = null, lowOK = null;
  if(!isNaN(cov)) upOK = cov >= sp.cov;
  if(l95>=0 && l95>ti) upOK = false;
  var vpE = currentVocab(), lE = vpE && vpE.N ? easyLvl(vpE) : -1;
  if(lE>=0) lowOK = lE >= fl;
  hard = upOK===false; easy = lowOK===false;
  S.fixOpen = S.fixOpen || {};
  if(hard) S.fixOpen.hard = true; if(easy) S.fixOpen.easy = true;
  var easyTxt = lE>=0 ? "mức ở ngưỡng " + EASY_TH + "% (trang tính, tính cả từ ngoài danh sách) là " + lvlName(lE) + ", cần " + v.floorText : "";
  if(isNaN(cov) && l95<0 && !easy){ vd.className = "verdict w"; vd.textContent = "Nhập số liệu để xem kết quả."; det.textContent = easyTxt ? "Không dễ quá: " + easyTxt + "." : ""; }
  else if(hard){ vd.className = "verdict b"; vd.textContent = "Khó quá: còn nhiều từ trên mức " + S.level + "."; det.textContent = "Độ phủ ở mức " + S.level + " cần từ " + sp.cov + "% trở lên. Làm theo khung màu đỏ bên dưới."; }
  else if(easy){ vd.className = "verdict b"; vd.textContent = "Dễ quá: " + easyTxt + "."; det.textContent = "Làm theo khung màu đỏ bên dưới: nâng bằng từ đúng mức, cụm động từ, kết hợp từ; không dùng từ hiếm, không đổi từ chủ đề. Có thể sửa tay trong ô \"Bài đang làm\" (bật màu " + LV[fl] + " để thấy chỗ đã đạt)."; }
  else if(upOK && lowOK){ vd.className = "verdict g"; vd.textContent = "Đạt: không khó quá, không dễ quá."; det.textContent = "Không dễ quá: " + easyTxt + ". Ghi các số này vào phiếu ở bước cuối."; }
  else { vd.className = "verdict w"; vd.textContent = "Nhập \"Độ phủ ở mức mục tiêu\" từ Text Profiler để kiểm có khó quá không."; det.textContent = easyTxt ? "Không dễ quá: " + easyTxt + "." : ""; }
  var changed = (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== (S.slots.draft||"").trim();
  renderFixAll();
  try{ sbRender(); }catch(e){}
  save(); schedule();
}

/* ---------- So sánh với bản đã duyệt ---------- */
function dtok(s){ return (s.replace(/\r/g,"").match(/\n\s*\n|\S+/g)||[]).map(function(t){ return /^\n/.test(t) ? "¶" : t; }); }
function runDiff(){
  var mode = S.diffBase === "approved" || !(S.slots.prePaste || "").trim() ? "approved" : "paste";
  var boxes = document.querySelectorAll(".diffbox"), a = mode === "paste" ? S.slots.prePaste : (S.slots.approved||""), b = S.slots.draft||"", html;
  var bar = '<div class="small" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px"><span class="muted">So với:</span>' + ((S.slots.prePaste||"").trim() ? '<button type="button" class="btn quiet sm' + (mode === "paste" ? ' on' : '') + '" data-diffbase="paste">Bản trước lần dán gần nhất</button>' : '') + '<button type="button" class="btn quiet sm' + (mode === "approved" ? ' on' : '') + '" data-diffbase="approved">Bản đã duyệt ở bước 4</button></div>';
  if(!a.trim()) html = '<p class="small muted">Chưa có bản đã duyệt để so. Bản được lưu mỗi khi bạn bấm Tiếp tục ở bước 4.</p>';
  else if(a.trim()===b.trim()) html = '<p class="small muted">Chưa có thay đổi nào so với bản đã duyệt.</p>';
  else {
    var A = dtok(a), B = dtok(b), pre = 0, suf = 0;
    while(pre<A.length && pre<B.length && A[pre]===B[pre]) pre++;
    while(suf<A.length-pre && suf<B.length-pre && A[A.length-1-suf]===B[B.length-1-suf]) suf++;
    var a2 = A.slice(pre, A.length-suf), b2 = B.slice(pre, B.length-suf), n = a2.length, m = b2.length, ops = [];
    if(n*m > 4000000){ ops = a2.map(function(t){return ["-",t];}).concat(b2.map(function(t){return ["+",t];})); }
    else {
      var W = m+1, L = new Uint16Array((n+1)*(m+1));
      for(var i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--) L[i*W+j] = a2[i]===b2[j] ? L[(i+1)*W+j+1]+1 : Math.max(L[(i+1)*W+j], L[i*W+j+1]);
      var x=0, y=0;
      while(x<n && y<m){ if(a2[x]===b2[y]){ ops.push(["=",a2[x]]); x++; y++; } else if(L[(x+1)*W+y]>=L[x*W+y+1]){ ops.push(["-",a2[x]]); x++; } else { ops.push(["+",b2[y]]); y++; } }
      while(x<n) ops.push(["-",a2[x++]]); while(y<m) ops.push(["+",b2[y++]]);
    }
    ops = A.slice(0,pre).map(function(t){return ["=",t];}).concat(ops, A.slice(A.length-suf).map(function(t){return ["=",t];}));
    var add = 0, del = 0; ops.forEach(function(o){ if(o[1]==="¶") return; if(o[0]==="+") add++; if(o[0]==="-") del++; });
    var render = function(list){
      var out = "", prev = null, buf = "";
      var flush = function(){ if(!buf) return; out += prev==="+" ? '<ins class="di">'+esc(buf)+'</ins>' : (prev==="-" ? '<del class="dd">'+esc(buf)+'</del>' : (prev==="…" ? '<span class="muted"> … </span>' : esc(buf))); buf = ""; };
      list.forEach(function(o){ if(o[0]!==prev){ flush(); prev = o[0]; } buf += o[0]==="…" ? "…" : (o[1]==="¶" ? "\n\n" : o[1] + " "); }); flush();
      return out;
    };
    var near = new Array(ops.length).fill(false), CTX = 8;
    ops.forEach(function(o,i){ if(o[0]!=="="){ for(var k=Math.max(0,i-CTX); k<=Math.min(ops.length-1,i+CTX); k++) near[k] = true; } });
    var snip = [], gap = false;
    ops.forEach(function(o,i){ if(near[i]){ if(gap && snip.length) snip.push(["…",""]); gap = false; snip.push(o[0]==="=" && o[1]==="¶" ? ["=","/"] : o); } else gap = true; });
    html = '<p class="small"><b>' + del + '</b> chữ bị xoá, <b>' + add + '</b> chữ được thêm. Dưới đây chỉ hiện các chỗ thay đổi:</p><div class="hl">' + render(snip) + '</div><details style="margin-top:6px"><summary>Xem toàn bài có tô màu</summary><div class="hl" style="margin-top:6px">' + render(ops) + '</div></details>';
  }
  boxes.forEach(function(el){ el.innerHTML = bar + html; });
}
document.addEventListener("click", function(e){ var t = e.target.closest && e.target.closest("[data-diffbase]"); if(!t) return; S.diffBase = t.getAttribute("data-diffbase"); runDiff(); });

/* ---------- Từ giữ lại ---------- */
function renderKeepCheck(){
  var keep = keepList(), d = (S.slots.draft||"").toLowerCase(), html;
  if(!keep.length) html = '<li>Chưa chọn từ giữ lại (bước 4).</li>';
  else if(!d.trim()) html = '<li>Chưa có bài.</li>';
  else html = keep.map(function(k){
    var re = new RegExp("(^|[^\\p{L}])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?=$|[^\\p{L}])", "u");
    return re.test(d) ? '<li class="g">✓ ' + esc(k) + '</li>' : '<li class="b">✗ ' + esc(k) + ' (đã mất)</li>';
  }).join("");
  document.querySelectorAll(".keepcheck").forEach(function(el){ el.innerHTML = html; });
}

/* ---------- Bước 7: trùng nguyên văn ---------- */
var lastOverlap = null;
function tokens(s){ var re=/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu, m, out=[]; while((m=re.exec(s))){ out.push({w:m[0].toLowerCase().replace(/’/g,"'"),i:m.index,e:m.index+m[0].length}); } return out; }
function runOverlap(){
  var pdfMode = S.srcMode==="pdf" && S.srcLang!=="vi";
  var a = pdfMode ? (S.slots.srcPdfText||"") : (S.slots.src||""), b = S.slots.draft||"", res = document.getElementById("ov-result"), hl = document.getElementById("ov-hl"), n = 5;
  var ovFix = document.getElementById("ov-fix");
  if(!a.trim() || !b.trim()){ lastOverlap = null; lastOvRuns = []; if(ovFix) ovFix.classList.add("hidden"); res.innerHTML = pdfMode ? '' : '<p class="small muted">Cần có văn bản nguồn tiếng Anh và bài đang làm.</p>'; hl.textContent = ""; return; }
  var ta = tokens(a), tb = tokens(b), set = new Set();
  for(var i=0;i+n<=ta.length;i++) set.add(ta.slice(i,i+n).map(function(t){return t.w;}).join(" "));
  var cov = new Array(tb.length).fill(false);
  for(var j=0;j+n<=tb.length;j++){ if(set.has(tb.slice(j,j+n).map(function(t){return t.w;}).join(" "))) for(var k=j;k<j+n;k++) cov[k] = true; }
  var c = cov.filter(Boolean).length, pct = tb.length ? 100*c/tb.length : 0; lastOverlap = pct;
  res.innerHTML = '<div class="verdict ' + (pct<20 ? 'g' : 'b') + '"><span class="big-num">' + pct.toFixed(1) + '%</span> ' + (pct<20 ? 'dưới 20%, đạt.' : 'từ 20% trở lên: cần viết lại các câu được tô đỏ.') + '</div><p class="small muted">Tính phần trăm chữ trong bài nằm trong các chuỗi từ 5 từ trở lên giống hệt nguồn. Đây là cách đo ước lượng; hỏi nhóm nếu có cách đo chính thức.</p>';
  var out = "", pos = 0, inOv = false;
  tb.forEach(function(t,idx){ var gap = b.slice(pos,t.i);
    if(cov[idx] && !inOv){ out += esc(gap) + '<span class="ov">'; inOv = true; }
    else if(!cov[idx] && inOv){ out += '</span>' + esc(gap); inOv = false; }
    else out += esc(gap);
    out += esc(b.slice(t.i,t.e)); pos = t.e; });
  if(inOv) out += "</span>"; out += esc(b.slice(pos)); hl.innerHTML = out;
  // các chỗ trùng, gom theo câu, để soạn câu lệnh sửa
  var runs = [], st = -1;
  for(var r=0;r<=tb.length;r++){ if(r<tb.length && cov[r]){ if(st<0) st = r; } else if(st>=0){ runs.push([st, r-1]); st = -1; } }
  var sents = [], sre = /[^.!?\n]+(?:[.!?]+["”’)]*)?/g, sm;
  while((sm = sre.exec(b))){ if(sm[0].trim()) sents.push({s:sm.index, e:sm.index + sm[0].length, t:sm[0].trim(), chunks:[], n:0}); }
  runs.forEach(function(rn){
    var cs = tb[rn[0]].i, ce = tb[rn[1]].e, chunk = b.slice(cs, ce);
    var sx = sents.filter(function(x){ return cs < x.e && ce > x.s; });
    sx.forEach(function(x){
      var a0 = Math.max(cs, x.s), e0 = Math.min(ce, x.e), part = b.slice(a0, e0).trim();
      var nt = tb.filter(function(t){ return t.i >= a0 && t.e <= e0; }).length;
      if(nt < 3) return;
      var trim2 = function(z){ return z.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,""); };
      x.chunks.push(trim2(part) === trim2(x.t.replace(/^[^:\n]{1,25}:\s*/,"")) || trim2(part) === trim2(x.t) ? "(cả câu)" : part); x.n += nt;
    });
  });
  lastOvRuns = sents.filter(function(x){ return x.chunks.length; }).map(function(x){ if(x.chunks.indexOf("(cả câu)")>=0) x.chunks = ["(cả câu)"]; return x; }).sort(function(p,q){ return q.n - p.n; });
  lastOvStat = {c:c, T:tb.length};
  if(ovFix){ S.fixOpen = S.fixOpen || {}; if(pct >= 20) S.fixOpen.ov = true;
    var changed = (S.slots.approved||"").trim() && (S.slots.approved||"").trim() !== b.trim();
    ovFix.classList.toggle("hidden", !(pct >= 20 || (S.fixOpen.ov && changed))); }
}
var lastOvRuns = [], lastOvStat = null;

/* ---------- Phiếu ---------- */
function fmtMin(w,speed){ var sec=Math.round(w/speed*60); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
var METRICS = [
  ["m-words","Số từ",function(sp){return sp.words;},function(){ return lastAnalysis ? String(lastAnalysis.total) : ""; }],
  ["m-paras","Số đoạn",function(sp){return sp.skill==="R" ? V().paras : "–";},function(){ return lastAnalysis && SPEC[S.spec].skill==="R" ? String(lastAnalysis.body.length) : ""; }],
  ["m-cov","Độ phủ ở mức mục tiêu (%)",function(sp){return "≥ "+sp.cov+"%";},function(){ return S.slots.pfCov||""; }],
  ["m-lvl98","Mức ở ngưỡng 96% (trang tính, tính cả off-list)",function(){return V().floorText;},function(){ var vp = currentVocab(); return vp && vp.N ? lvlName(easyLvl(vp)) : ""; }],
  ["m-lvl","Mức ở ngưỡng 95% (Text Profiler, bỏ qua off-list)",function(){return "ghi lại";},function(){ var x=S.slots.pfLvl95; return x && x!=="chưa đo" ? x : ""; }],
  ["m-fre","Flesch Reading Ease",function(){ return freWinShort() + " (mức " + S.level + ")"; },function(){ var f = currentFre(); return f && f.ok ? f.fre.toFixed(1) : ""; }],
  ["m-gloss","Số từ vượt mục tiêu / số từ cần chú giải để đạt độ phủ",function(sp){return "– / 0 (để đạt " + sp.cov + "%)";},function(){ var st = phieuStats(); return st ? st.over + " / " + st.gloss + " (ước lượng của trang)" : ""; }],
  ["m-long","Số câu trên 25 từ; câu dài nhất (từ)",function(){return "0; ≤ 25";},function(){ var st = phieuStats(); return lastAnalysis && st ? lastAnalysis.long.length + "; " + st.longest : ""; }],
  ["m-conn","Từ nối / 100 từ; đại từ / 100 từ",function(){return "> 5 / –";},function(){ var st = phieuStats(); return st ? st.conn + " / " + st.pron + " (ước lượng)" : ""; }],
  ["m-dens","Mật độ từ vựng (%)",function(sp){return sp.skill==="L" ? "thấp hơn bài Đọc" : "–";},function(){ var st = phieuStats(); return st ? st.dens + "% (ước lượng)" : ""; }],
  ["m-ov","Tỷ lệ chép nguyên văn",function(){return "< 20%";},function(){ return lastOverlap===null ? "" : lastOverlap.toFixed(1)+"%"; }],
  ["m-dur","Thời lượng ở 150 / 170 từ/phút (bài Nghe)",function(sp){return sp.skill==="L" ? (sp.speed||"") : "–";},function(){ return lastAnalysis && SPEC[S.spec].skill==="L" ? fmtMin(lastAnalysis.total,150) + " / " + fmtMin(lastAnalysis.total,170) : ""; }],
  ["m-fre0","Flesch Reading Ease bài gốc",function(){return "ghi lại";},function(){ var st = phieuStats(); return st && st.fre0 ? st.fre0 : ""; }],
  ["m-spell","Chính tả",function(){return "Một kiểu ("+S.spelling+")";},function(){ return ""; }]
];
var FIELD_IDS = ["pc-src","pc-url","pc-lic","pc-lvl","pc-b7","pc-vo","pc-dec"];
var PH_CONN = ["also","too","moreover","furthermore","in addition","besides","as well as","additionally","but","however","although","though","even though","yet","whereas","nevertheless","on the other hand","instead","despite","in contrast","in spite of","because","because of","due to","as a result","therefore","thus","so","consequently","hence","first","firstly","second","secondly","third","then","next","finally","later","meanwhile","afterwards","after that","for example","for instance","such as","if","unless","otherwise","in conclusion","overall","in short","to sum up","in other words","that is","in fact","actually","indeed","similarly","likewise","for this reason","as a consequence"];
var PH_PRON = " i me you he him she her it we us they them myself yourself himself herself itself ourselves yourselves themselves ";
var PH_FUNC = " a an the this that these those my your his her its our their some any no every each all both either neither much many more most few little several i me you he him she it we us they them myself yourself himself herself itself ourselves themselves who whom whose which what whatever whoever where when why how and or but nor so yet because although though if unless while whereas than as since until till after before of to in on at for by with from into onto about above below over under between among through during without within along across behind beyond near off out up down around against toward towards upon via per like be am is are was were been being have has had having do does did done doing will would shall should can could may might must not n't 's 're 've 'd 'll 'm there here then also too very just only even still already again ever never always often ";
var phStatsCache = null;
function phieuStats(){
  var d = S.slots.draft || ""; if(!d.trim()) return null;
  var key = d.length + "|" + qHash(d) + "|" + S.level + "|" + S.spec + "|" + qHash((S.slots.src||"") + (S.slots.srcPdfText||""));
  if(phStatsCache && phStatsCache.key === key) return phStatsCache;
  var sp = SPEC[S.spec], a = analyze(d), vp = vocabProfile(d), ti = LVL.indexOf(S.level);
  var over = vp.lemmas.filter(function(l){ return l.lv > ti; }), offs = vp.offList;
  var covered = 0; for(var i = 0; i <= ti; i++) covered += vp.counts[i];
  var cand = over.map(function(l){ return l.n; }).concat(offs.map(function(o){ return o.n; })).sort(function(x, y){ return y - x; }), gl = 0;
  while(vp.N && 100*covered/vp.N < sp.cov && gl < cand.length){ covered += cand[gl]; gl++; }
  var toks = (d.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z]+(?:'[a-z]+)?/g) || []), W = toks.length || 1, txt = " " + toks.join(" ") + " ";
  var conn = 0; PH_CONN.forEach(function(c){ var re = new RegExp(" " + c.replace(/ /g, " ") + "(?= )", "g"); conn += (txt.match(re) || []).length; });
  var pron = toks.filter(function(t){ return PH_PRON.indexOf(" " + t + " ") >= 0; }).length;
  var content = toks.filter(function(t){ var b = t.replace(/'(s|re|ve|d|ll|m|t)$/,""); return PH_FUNC.indexOf(" " + b + " ") < 0 && PH_FUNC.indexOf(" " + t + " ") < 0; }).length;
  var longest = a.sents.reduce(function(m, s){ return Math.max(m, wc(s)); }, 0);
  var src = S.srcLang === "vi" ? "" : (S.slots.src || S.slots.srcPdfText || ""), f0 = src.trim() ? fleschOf(src) : null, f1 = fleschOf(d);
  var hint = over.filter(function(l){ return keepList().map(function(k){ return k.toLowerCase(); }).indexOf(l.w) < 0; }).sort(function(x, y){ return y.lv - x.lv || y.n - x.n; }).slice(0, 8).map(function(l){ return l.w + " (" + LVL[l.lv] + ")"; });
  phStatsCache = {key:key, over:over.length + offs.length, gloss:gl, conn:(100*conn/W).toFixed(1), pron:(100*pron/W).toFixed(1), dens:(100*content/W).toFixed(1), longest:longest,
    fre0: f0 && f0.ok ? f0.fre.toFixed(1) + " (≈ " + freBand(f0.fre)[2] + ")" : "", fre1: f1 && f1.ok ? f1.fre.toFixed(1) + " (≈ " + freBand(f1.fre)[2] + ")" : "", voHint:hint, overN:over.length};
  return phStatsCache;
}
function renderMetrics(){
  var sp = SPEC[S.spec];
  document.getElementById("pc-metrics").innerHTML = METRICS.map(function(m){
    return '<tr><td>'+esc(m[1])+'</td><td>'+esc(m[2](sp))+'</td><td><input type="text" id="'+m[0]+'-1" aria-label="'+esc(m[1])+' lần 1"></td><td><input type="text" id="'+m[0]+'-2" aria-label="'+esc(m[1])+' lần 2"></td></tr>';
  }).join("");
  bindFields(); fillAuto();
}
function fillAuto(){
  METRICS.forEach(function(m){ var el = document.getElementById(m[0]+"-1"); if(el){ var a = m[3](); el.placeholder = a ? "tự điền: " + a : ""; } });
  var st = phieuStats(), vo = document.getElementById("pc-vo"); if(vo) vo.placeholder = keepList().join(", ");
  var vh = document.getElementById("pc-vohint");
  if(vh) vh.textContent = !st ? "" : (st.voHint.length ? "Gợi ý từ trên mức " + S.level + " trong bài (nên giữ 2–3 từ để đặt câu hỏi từ vựng): " + st.voHint.join(", ") + "." : "Bài không có từ nào trên mức " + S.level + " (theo danh sách CEFR-J): câu hỏi từ vựng sẽ hỏi từ ở mức " + S.level + " trở xuống.");
  var lv = document.getElementById("pc-lvl"); if(lv) lv.placeholder = pcLvlAuto() ? "tự điền: " + pcLvlAuto() : "";
  var b7 = document.getElementById("pc-b7"); if(b7 && !b7.value){ var ok = ["nd-1","nd-2","nd-3"].every(function(g){ return S.gates && S.gates[g]; }); b7.options[0].textContent = ok ? "Có (theo bước 7)" : "Chưa (bước 7 chưa xong)"; }
}
function pcLvlAuto(){
  var o = "", a = "", st = null; try{ o = sbSummary("o"); a = sbSummary("a"); }catch(e){}
  try{ st = phieuStats(); }catch(e){}
  var fl = st && (st.fre0 || st.fre1) ? "; Flesch " + (st.fre0 || "?") + " / " + (st.fre1 || "?") : "";
  if(!o && !a && !fl) return "";
  return "bài gốc " + (o || "chưa nhập") + " / bài đã chỉnh " + (a || "chưa nhập") + fl;
}
function bindFields(){
  var ids = FIELD_IDS.slice(); METRICS.forEach(function(m){ ids.push(m[0]+"-1", m[0]+"-2"); });
  ids.forEach(function(id){
    var el = document.getElementById(id); if(!el || el.dataset.bound) return; el.dataset.bound = "1";
    if(S.fields[id]!==undefined) el.value = S.fields[id];
    var h = function(){ var sc = el.closest(".screen"); if(sc && typeof wfCanEditScreen === "function" && !wfCanEditScreen(sc.id)){ el.value = S.fields[id] || ""; toast("Chế độ xem: bạn không sửa được ô này."); return; } S.fields[id] = el.value; save(); if(/^pc-(src|url|lic)$/.test(id) && typeof wfRender === "function"){ clearTimeout(bindFields.t); bindFields.t = setTimeout(wfRender, 300); } }; el.addEventListener("input", h); el.addEventListener("change", h);
  });
}
function phieuText(){
  var sp = SPEC[S.spec], g = function(id){ var e = document.getElementById(id); return e ? e.value : ""; };
  var L = ["PHIẾU THỰC HÀNH · " + sp.label + " · Mức mục tiêu: " + S.level + (S.code ? " · Mã bài: " + S.code : "") + (S.slots.topic ? " · Chủ đề: " + S.slots.topic : ""),
    "Nguồn: " + g("pc-src"), "Link, ngày truy cập: " + g("pc-url"), "Giấy phép: " + g("pc-lic"), "Level bài gốc / đã chỉnh: " + (g("pc-lvl") || pcLvlAuto()), "Đã đối chiếu sự kiện (B7)? " + (g("pc-b7") || (["nd-1","nd-2","nd-3"].every(function(x){ return S.gates && S.gates[x]; }) ? "Có" : "Chưa")), "", "Chỉ số | Yêu cầu | Lần đo 1 | Lần đo 2"];
  METRICS.forEach(function(m){ L.push(m[1] + " | " + m[2](sp) + " | " + (g(m[0]+"-1") || m[3]()) + " | " + g(m[0]+"-2")); });
  L.push("", "Từ giữ lại để hỏi đoán nghĩa: " + (g("pc-vo") || keepList().join(", ")), "Quyết định: " + g("pc-dec"));
  try{ L.push("", "Checklist ngữ liệu: " + clSummaryLine("NL") + ".", "Checklist câu hỏi: " + ((S.slots.questions||"").trim() ? clSummaryLine("CH") : "chưa có câu hỏi") + "."); }catch(e){}
  return L.join("\n");
}

/* ---------- Wire up ---------- */
function bindSettings(){
  var map = {"set-spec":"spec","set-level":"level","set-spelling":"spelling","set-floor":"floor","set-paras":"paras","set-poly":"poly","set-code":"code"};
  Object.keys(map).forEach(function(id){
    var el = document.getElementById(id), k = map[id];
    if(S[k]!==undefined && S[k]!==null) el.value = S[k];
    el.addEventListener(el.tagName==="SELECT" ? "change" : "input", function(){
      S[k] = el.value;
      if(k==="spec") applyLevelBySpec();
      save();
      renderSpec(); renderQ(); if(k==="spec"){ applyBranch(); renderAllAI(); } renderAnchors();
      renderMetrics(); runLength(); runBand(); refreshText(); try{ clRender(); }catch(e){} updateStepper();
    });
  });
  document.querySelectorAll('input[name="srclang"]').forEach(function(r){
    r.checked = (r.value === (S.srcLang||"en"));
    r.addEventListener("change", function(){ if(r.checked){ S.srcLang = r.value; save(); applyLang(); } });
  });
  document.querySelectorAll('input[name="srcmode"]').forEach(function(r){
    r.checked = (r.value === (S.srcMode||"text"));
    r.addEventListener("change", function(){ if(r.checked){ S.srcMode = r.value; save(); applyLang(); } });
  });
}
function applyLang(){
  var lang = S.srcLang||"en", mode = S.srcMode||"text";
  document.querySelectorAll("[data-srcshow]").forEach(function(el){
    var t = el.getAttribute("data-srcshow"), on;
    if(t==="text-en") on = mode==="text" && lang==="en";
    else if(t==="text-vi") on = mode==="text" && lang==="vi";
    else if(t==="pdf") on = mode==="pdf";
    else if(t==="pdf-en") on = mode==="pdf" && lang==="en";
    else if(t==="vi") on = lang==="vi";
    el.classList.toggle("hidden", !on);
  });
  refreshText(); runOverlap();
}
function bindGates(){
  document.querySelectorAll("input[data-gate]").forEach(function(i){
    var k = i.getAttribute("data-gate"); i.checked = !!S.gates[k];
    i.addEventListener("change", function(){ S.gates[k] = i.checked; save(); updateStepper(); });
  });
}
function init(){
  applyOutputRules();
  load(); S.slots = S.slots||{}; S.fixOpen = S.fixOpen||{};
  if(!SPEC[S.spec]) S.spec = "R2";
  var h = location.hash.slice(1); if(h && document.getElementById(h) && document.getElementById(h).classList.contains("screen")) S.step = h;
  if(!S.step) S.step = "bat-dau";
  document.querySelectorAll("[data-field]").forEach(renderField);
  renderAllAI(); bindSettings(); bindGates(); bindNav(); applyLang();
  renderSpec(); applyBranch(); renderMetrics();
  runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); refreshText(); fillAuto(); renderB7(); renderRecheck(); renderAnchors(); renderQ(); bindQ();
  document.getElementById("b7-apply").addEventListener("click", applyB7);
  document.querySelectorAll("[data-copyslot]").forEach(function(b){ var lab = b.textContent; b.addEventListener("click", function(){ var t = S.slots[b.getAttribute("data-copyslot")]||""; if(!t.trim()){ b.textContent = "Chưa có bài"; setTimeout(function(){ b.textContent = lab; }, 1800); return; } copyText(t, b, lab); }); });
  document.getElementById("pc-copy").addEventListener("click", function(e){ fillAuto(); copyText(phieuText(), e.currentTarget, "Sao chép phiếu"); });
  document.getElementById("nop").addEventListener("focusin", fillAuto);
  var panel = document.getElementById("clearpanel"), cb = document.getElementById("clearbtn");
  function togglePanel(open){ panel.classList.toggle("hidden", !open); cb.setAttribute("aria-expanded", open ? "true" : "false"); }
  cb.addEventListener("click", function(){ togglePanel(panel.classList.contains("hidden")); });
  document.getElementById("clear-cancel").addEventListener("click", function(){ togglePanel(false); });
  bindFilePanel(togglePanel);
  document.getElementById("clear-all").addEventListener("click", function(){ clearData(true); togglePanel(false); toast("Đã xoá hết dữ liệu. Bắt đầu lại từ bước 1."); });
}
var toastT;
function toast(msg){ var t = document.getElementById("toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.add("hidden"); }, 2600); }
function clearData(all){
  S.gates = {}; S.fields = {}; S.slots = {}; S.code = ""; S.l1slot = "1"; S.qman = {}; S.fixOpen = {}; S.srcLang = "en"; S.srcMode = "text"; S.b7before = null; S.lib = null; S.notes = []; S.cl = {}; S.wf = null; S.map = null; S.prj = null; delete S.libCopyTitle; delete S.qBlindFor;
  if(all){
    S.spec = "R2"; S.level = "B2"; S.spelling = "Anh–Anh"; S.floor = "0"; S.paras = "5"; S.poly = "2–3";
    try{ localStorage.removeItem(KEY); }catch(e){}
    var setv = {"set-spec":"R2","set-level":"B2","set-spelling":"Anh–Anh","set-floor":"0","set-paras":"5","set-poly":"2–3"};
    Object.keys(setv).forEach(function(id){ var el = document.getElementById(id); if(el) el.value = setv[id]; });
  }
  save();
  document.getElementById("set-code").value = "";
  document.querySelectorAll("input[data-gate]").forEach(function(i){ i.checked = false; });
  document.querySelectorAll("[data-slot]").forEach(function(el){ el.value = el.tagName==="SELECT" ? el.options[0].value : ""; });
  document.querySelectorAll(".splitmsg").forEach(function(el){ el.textContent = ""; });
  FIELD_IDS.forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ""; });
  document.querySelectorAll('input[name="srclang"]').forEach(function(r){ r.checked = r.value==="en"; });
  document.querySelectorAll('input[name="srcmode"]').forEach(function(r){ r.checked = r.value==="text"; });
  document.querySelectorAll(".navmsg").forEach(function(el){ el.textContent = ""; });
  lastAnalysis = null; lastOverlap = null; lastVocab = null; lastFre = null;
  renderSpec(); applyBranch(); renderAllAI(); applyLang(); renderMetrics();
  runLength(); runBand(); runDiff(); renderKeepCheck(); runOverlap(); refreshText(); renderB7(); renderRecheck(); renderAnchors(); renderQ();
  show("bat-dau");
}
