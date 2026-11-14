/* ===== Giao diện dòng lệnh =====
   node vstep_check.js <state.json> [lệnh] [tham số]
   Lệnh:
     check               (mặc định) in báo cáo JSON: số liệu, cách sửa, checklist NL/CH/WS, bản đồ chất liệu, câu hỏi
     prompt <khoá>       in câu lệnh đã ghép đủ thông số (như nút "Sao chép câu lệnh" của trang)
     keys                liệt kê khoá câu lệnh
     apply-map <file>    đọc câu trả lời bản đồ chất liệu (DÒNG n | …) vào state.map, ghi lại state.json
     apply-ws <file>     đọc câu trả lời soạn đề Viết, Nói (khối code) vào state.ws, ghi lại state.json
     frame-map           điền bản đồ chất liệu từ khung câu hỏi trong slots.notes, ghi lại state.json
   state.json: {"spec":"R2","level":"B2","floor":"0","spelling":"Anh–Anh","paras":"5","l1slot":"1",
                "specs":{…đặc tả riêng: spec, qbp, rstems…} hoặc "specsFile":"đường dẫn",
                "slots":{"topic","usedTopics","src","draft","notes","keep","questions","facts",…},
                "fields":{"pc-src","pc-url","pc-lic",…}, "ws":{…}, "map":{"rows":{}}, "gates":{}} */
(function(){
  var argv = process.argv.slice(2), file = argv[0], cmd = argv[1] || "check";
  if(!file){ console.error("Cách dùng: node vstep_check.js state.json [check|prompt <khoá>|keys|apply-map <file>|apply-ws <file>|frame-map]"); process.exit(2); }
  var st = JSON.parse(__fs.readFileSync(file, "utf8"));
  var specs = st.specs || (st.specsFile ? JSON.parse(__fs.readFileSync(st.specsFile, "utf8")) : null);
  if(specs) specsApply(specs, true);
  if(!SPEC[st.spec]){ console.error("Phần thi không có: " + st.spec + ". Dùng một trong: " + Object.keys(SPEC).join(", ")); process.exit(2); }
  S.spec = st.spec;
  var LB = typeof LEVEL_BY_SPEC !== "undefined" ? LEVEL_BY_SPEC[st.spec] : null;
  S.level = st.level || (LB && LB.level) || S.level; S.floor = (LB && LB.floor) || "0";
  ["floor","spelling","paras","l1slot","srcLang","srcMode"].forEach(function(k){ if(st[k] !== undefined) S[k] = String(st[k]); });
  S.slots = Object.assign({}, st.slots || {}); S.fields = Object.assign({}, st.fields || {}); S.gates = Object.assign({}, st.gates || {});
  S.ws = Object.assign({}, st.ws || {}); S.map = st.map ? JSON.parse(JSON.stringify(st.map)) : {rows:{}}; S.notes = st.notes || []; S.qman = st.qman || {};
  S.wf = null; S.lib = null;
  lastAnalysis = null; lastVocab = null; lastFre = null; try{ lastOverlap = null; }catch(e){}
  var isWS = typeof wsOn === "function" && wsOn(), sk = SPEC[S.spec].skill;
  // một số phép đo của trang ghi kết quả ra giao diện: chạy với phần tử giả để lấy số
  function withDom(fn){ var g = document.getElementById, q = document.querySelector; document.getElementById = function(){ return __el(); }; document.querySelector = function(){ return __el(); }; try{ fn(); }catch(e){} document.getElementById = g; document.querySelector = q; }
  if(!isWS && (S.slots.draft || "").trim()) withDom(function(){ runOverlap(); });
  try{ if(isWS) wsSync(); }catch(e){}
  function save(){ st.map = S.map; st.ws = S.ws; st.slots = S.slots; __fs.writeFileSync(file, JSON.stringify(st, null, 1)); }
  function out(o){ process.stdout.write(typeof o === "string" ? o + "\n" : JSON.stringify(o, null, 1) + "\n"); }
  function promptKeys(){
    var ks = Object.keys(P).filter(function(k){ return P[k] && P[k].t; }).map(function(k){ return {key:k, title:P[k].title}; });
    if(isWS) ks = ks.concat([{key:"ws-topic", title:"Gợi ý chủ đề Viết, Nói"}, {key:"ws-src", title:"Tìm nguồn Viết Task 2"}, {key:"ws-draft", title:"Soạn nháp đề Viết, Nói"}, {key:"ws-fit", title:"Kiểm khớp nguồn Viết Task 2"}]);
    return ks;
  }
  if(cmd === "keys"){ out(promptKeys()); return; }
  if(cmd === "prompt"){
    var k = argv[2];
    if(k === "ws-topic") return out(wsTopicPrompt());
    if(k === "ws-src") return out(wsSrcPrompt());
    if(k === "ws-draft") return out(wsPrompt());
    if(k === "ws-fit") return out(wsFitPrompt());
    if(!P[k]){ console.error("Không có khoá " + k + ". Xem: keys"); process.exit(2); }
    var v = V(); var miss = missing(P[k]);
    if(miss.length) console.error("Thiếu: " + miss.join("; "));
    return out(assemble(P[k], v));
  }
  if(cmd === "apply-map"){ var n = mapParseAI(__fs.readFileSync(argv[2], "utf8")); save(); return out({filled:n}); }
  if(cmd === "apply-ws"){ var r = wsParse(__fs.readFileSync(argv[2], "utf8")); try{ wsSync(); }catch(e){} save(); return out({filled:r}); }
  if(cmd === "frame-map"){ var n2 = mapFromAnchors(); save(); return out({filled:n2}); }

  // ---- check ----
  var rep = {spec:S.spec, label:SPEC[S.spec].label, level:S.level, specsLoaded:!!(typeof SPECS !== "undefined" && SPECS.loaded)};
  function rows(sc){
    var ev = clEval(sc);
    return clRows(sc).map(function(r){ var e = ev[r.c] || {}; return {code:r.c, who:r.who, tier:r.tier, text:r.t, src:r.src, status:e.s || "na", detail:(e.d || "").replace(/<[^>]+>/g, "")}; }).filter(function(x){ return x.status !== "na"; });
  }
  try{
    if(isWS){
      rep.task = wsText();
      rep.checklist = {WS:rows("WS")};
      try{ rep.copied = typeof wsCopied === "function" ? wsCopied() : null; }catch(e){}
    } else {
      var d = S.slots.draft || "";
      if(d.trim()){
        var m = metricsOf(d), E = evalChecks();
        rep.metrics = {words:m.words, paras:m.paras, longSentences:m.longN, coverage:m.cov, levelAt96:LVL[m.lvlIn] || "trên C2", flesch:m.fre,
          wordsOK:m.inRange, coverageOK:m.covOK, notTooEasyOK:m.floorOK, fleschOK:m.freOK, parasOK:m.parasOK};
        rep.checks = E ? E.C : null;
        var allOk = E && Object.keys(E.C).every(function(k){ return !E.C[k] || E.C[k].ok !== false; });
        if(!allOk){ try{ rep.fixPrompt = assemble(P.fixall, V()); }catch(e){ rep.fixPromptError = String(e); } }
      }
      rep.frame = parseFrame(S.slots.notes || "");
      if(mapLines().length){
        var ME = mapEval(), O = mapOrder(ME);
        rep.map = {rows:ME.res.map(function(x, i){ return {line:i+1, slot:x.l.lv + " " + x.l.m, codes:x.l.codes, code:x.code, para:x.para || null, testQ:O.num[i] || null, status:x.s, notes:x.msgs}; }),
          global:ME.glob, order:mapText(), full:mapStatus().full};
      } else rep.map = {note:qbpWhy()};
      if((S.slots.questions || "").trim()){
        var R = checkQ();
        if(R){ rep.questions = {global:R.global, items:R.items.map(function(x){ return {n:x.it.n, slot:(x.it.lv||"") + " " + (x.it.mức||""), code:x.it.code, answer:x.it.ans, problems:x.probs, warnings:x.warns}; })}; }
      }
      rep.checklist = {NL:rows("NL")};
      if((S.slots.questions || "").trim()) rep.checklist.CH = rows("CH");
    }
  }catch(e){ rep.error = String(e && e.stack || e); }
  var cl = rep.checklist || {}, all = [].concat(cl.NL || [], cl.CH || [], cl.WS || []);
  rep.summary = {fail:all.filter(function(r){ return r.status === "fail"; }).map(function(r){ return r.code; }),
    warn:all.filter(function(r){ return r.status === "warn"; }).map(function(r){ return r.code; }),
    needJudgement:all.filter(function(r){ return r.status === "todo" || r.status === "h"; }).map(function(r){ return r.code; })};
  out(rep);
})();
