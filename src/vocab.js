/* ================= Tra mức từ vựng CEFR-J + Octanove (chạy trên trang) ================= */
var LEXD = /*LEXDATA*/;
var LVL = ["A1","A2","B1","B2","C1","C2"];
var LEXM = Object.create(null), IRRM = Object.create(null);
LVL.forEach(function(L,i){ LEXD.lv[L].split(" ").forEach(function(w){ LEXM[w] = i; }); });
LEXD.irr.split(" ").forEach(function(p){ var a = p.split(">"); IRRM[a[0]] = a[1]; });

function lexCands(w){
  var c = [w], b;
  if(/ies$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/es$/.test(w)) c.push(w.slice(0,-2));
  if(/s$/.test(w) && !/ss$/.test(w)) c.push(w.slice(0,-1));
  if(/ied$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/ed$/.test(w)){ b = w.slice(0,-2); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  if(/ing$/.test(w)){ b = w.slice(0,-3); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); if(/y$/.test(b)) c.push(b.slice(0,-1)+"ie"); }
  if(/ier$/.test(w)) c.push(w.slice(0,-3)+"y");
  if(/iest$/.test(w)) c.push(w.slice(0,-4)+"y");
  if(/er$/.test(w)){ b = w.slice(0,-2); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  if(/est$/.test(w)){ b = w.slice(0,-3); c.push(b, b+"e"); if(b.length>1 && b[b.length-1]===b[b.length-2]) c.push(b.slice(0,-1)); }
  return c;
}
function lexLemma(w){
  if(IRRM[w]) return IRRM[w];
  var c = lexCands(w);
  for(var i=0;i<c.length;i++) if(LEXM[c[i]]!==undefined) return c[i];
  return null;
}
var S_PRON = {"it":1,"he":1,"she":1,"that":1,"there":1,"what":1,"who":1,"here":1,"where":1,"how":1,"this":1};
var DERIV = /(ly|ness|tion|sion|ment|ity|ive|ous|able|ible|ful|less|ism|ist|ize|ise|ical|ally)$/;
function splitContraction(lw){
  var m;
  if(lw==="can't" || lw==="cannot") return ["can","not"];
  if(lw==="won't") return ["will","not"];
  if(lw==="shan't") return ["shall","not"];
  if((m = lw.match(/^(.+)n't$/))) return [m[1],"not"];
  if((m = lw.match(/^(.+)'s$/))) return m[1]==="let" ? ["let","us"] : (S_PRON[m[1]] ? [m[1],"be"] : [m[1]]);
  if((m = lw.match(/^(.+)'(re|m)$/))) return [m[1],"be"];
  if((m = lw.match(/^(.+)'ve$/))) return [m[1],"have"];
  if((m = lw.match(/^(.+)'ll$/))) return [m[1],"will"];
  if((m = lw.match(/^(.+)'d$/))) return [m[1],"would"];
  if((m = lw.match(/^(.+)'$/))) return [m[1]];
  return [lw];
}
var lastVocab = null;
function vocabProfile(text){
  var a = analyze(text);
  var sents = a.titles.map(function(t){ return {s:t.text, title:true}; }).concat(a.sents.map(function(s){ return {s:s, title:false}; }));
  var counts = [0,0,0,0,0,0], off = 0, N = 0, byLemma = Object.create(null), offW = Object.create(null), proper = Object.create(null);
  function add(part){
    var lem = lexLemma(part);
    N++;
    if(lem===null){ off++; offW[part] = (offW[part]||0) + 1; return; }
    var lv = LEXM[lem]; counts[lv]++;
    var k = lem; if(!byLemma[k]) byLemma[k] = {w:lem, lv:lv, n:0}; byLemma[k].n++;
  }
  sents.forEach(function(o){
    var s = o.s.replace(/[—–]/g," ").replace(/[’‘]/g,"'");
    var re = /[A-Za-z0-9]+(?:'[A-Za-z]+)*(?:-[A-Za-z0-9]+(?:'[A-Za-z]+)*)*'?/g, m, first = true;
    while((m = re.exec(s))){
      var t = m[0];
      if(/\d/.test(t)){ first = false; continue; }
      var initial = first || o.title; first = false;
      var lowT = t.toLowerCase();
      var mixed = /[a-z][A-Z]/.test(t), allCaps = /^[A-Z]{2,}$/.test(t.replace(/'.*$/,"")), cap = /^[A-Z]/.test(t);
      var isProper = false;
      if(mixed) isProper = true;
      else if(allCaps) isProper = lexLemma(lowT)===null;
      else if(cap && t!=="I"){
        if(!initial) isProper = true;
        else { var base = splitContraction(lowT)[0].split("-")[0]; isProper = lexLemma(base)===null && !DERIV.test(base); }
      }
      if(isProper){ proper[t] = (proper[t]||0) + 1; continue; }
      splitContraction(lowT).forEach(function(w){ w.split("-").forEach(function(p){ if(p && /[a-z]/.test(p)) add(p); }); });
    }
  });
  var cum = [], run = 0;
  for(var i=0;i<6;i++){ run += counts[i]; cum.push(N ? 100*run/N : 0); }
  var Nin = N - off, cumIn = [], run2 = 0;
  for(var j=0;j<6;j++){ run2 += counts[j]; cumIn.push(Nin ? 100*run2/Nin : 0); }
  function lvlAt(arr, th){ for(var k=0;k<6;k++) if(arr[k] >= th) return k; return 6; }
  var above = [], offList = [];
  Object.keys(byLemma).forEach(function(k){ var b = byLemma[k]; above.push(b); });
  Object.keys(offW).forEach(function(k){ offList.push({w:k, n:offW[k]}); });
  above.sort(function(x,y){ return y.lv-x.lv || y.n-x.n; });
  offList.sort(function(x,y){ return y.n-x.n; });
  return {N:N, off:off, counts:counts, cum:cum, cumIn:cumIn, lvl95:lvlAt(cum,95), lvl95In:lvlAt(cumIn,95), lvl98:lvlAt(cum,98), lvl98In:lvlAt(cumIn,98), lemmas:above, offList:offList, proper:Object.keys(proper)};
}
/* chặn dưới "không dễ quá": mức thấp nhất phủ được 96% tổng số lượt từ, từ ngoài danh sách tính là từ khó (tên riêng vẫn loại) — quy ước nhóm, thử nghiệm 42 bài đối chiếu Cathoven, Nick chốt 13/11/2026 */
var EASY_TH = 96;
function easyLvl(vp){ if(!vp || !vp.N) return 6; for(var k = 0; k < 6; k++) if(vp.cum[k] >= EASY_TH) return k; return 6; }
/* số lượt từ ở mức fl trở lên, cộng từ ngoài danh sách */
function easyUpto(vp, fl){ var u = vp.off || 0; for(var k = fl; k < 6; k++) u += vp.counts[k] || 0; return u; }
function covAt(vp, levelName, ignoreOff){ var i = LVL.indexOf(levelName); if(i<0) return null; return (ignoreOff ? vp.cumIn : vp.cum)[i]; }
function lvlName(i){ return i>=6 ? "trên C2" : LVL[i]; }

/* ================= Flesch Reading Ease (âm tiết theo CMU, từ ngoài bảng đoán theo chính tả) ================= */
var SYLX = Object.create(null);
Object.keys(LEXD.syl||{}).forEach(function(k){ LEXD.syl[k].split(" ").forEach(function(w){ SYLX[w] = +k; }); });
function sylHeur(w){
  if(w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  var m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 0);
}
function sylCount(tok){
  if(!/[A-Za-z]/.test(tok)) return 1;
  return tok.split("-").reduce(function(sum, part){
    var w = part.toLowerCase().replace(/[^a-z]/g, "");
    if(!w) return sum;
    return sum + (SYLX[w] || sylHeur(w));
  }, 0) || 1;
}
var FRE_MIN = {A1:90, A2:80, B1:70, B2:60, C1:50, C2:0};
var FRE_MAX = {A1:1e9, A2:90, B1:80, B2:70, C1:60, C2:50};
/* câu trung bình (từ) và âm tiết mỗi từ gợi ý để FRE rơi vào giữa khoảng của mức */
var FRE_ASL = {A1:[6,9], A2:[8,12], B1:[11,15], B2:[14,18], C1:[17,21], C2:[19,24]};
var FRE_SPW = {A1:"1.20–1.30", A2:"1.25–1.35", B1:"1.33–1.43", B2:"1.45–1.52", C1:"1.53–1.60", C2:"1.60–1.70"};
function freWin(L){ L = L || S.level; var a = FRE_MIN[L], b = FRE_MAX[L]; return b > 200 ? "từ " + a + " trở lên" : (a > 0 ? "từ " + a + " đến dưới " + b : "dưới " + b); }
function freWinShort(L){ L = L || S.level; var a = FRE_MIN[L], b = FRE_MAX[L]; return b > 200 ? "≥ " + a : (a > 0 ? a + "–" + (b - 0.1).toFixed(1) : "< " + b); }
function freIn(f, L){ L = L || S.level; return f >= FRE_MIN[L] && f < FRE_MAX[L]; }
var FRE_BANDS = [[90,"Very easy","A1"],[80,"Easy","A2"],[70,"Fairly easy","B1"],[60,"Standard","B2"],[50,"Fairly difficult","C1"],[-1e9,"Difficult to very difficult","C2"]];
function freBand(f){ for(var i=0;i<FRE_BANDS.length;i++) if(f >= FRE_BANDS[i][0]) return FRE_BANDS[i]; return FRE_BANDS[FRE_BANDS.length-1]; }
function fleschOf(text){
  var a = analyze(text), W = 0, Sy = 0, poly = Object.create(null);
  a.body.forEach(function(b){
    b.text.replace(/[—–]/g, " ").split(/\s+/).forEach(function(t){
      if(!/[\p{L}\p{N}]/u.test(t)) return;
      W++;
      var c = sylCount(t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""));
      Sy += c;
      if(c >= 3){ var k = t.toLowerCase().replace(/[^a-z-]/g, ""); if(k && !/^[A-Z]/.test(t.replace(/^[^A-Za-z]+/, ""))) poly[k] = (poly[k]||0) + 1; }
    });
  });
  var S = a.sents.length;
  if(W < 60 || S < 3) return {ok:false, W:W, S:S};
  var asl = W/S, spw = Sy/W;
  var fre = 206.835 - 1.015*asl - 84.6*spw, fk = 0.39*asl + 11.8*spw - 15.59;
  var polyList = Object.keys(poly).map(function(k){ return {w:k, n:poly[k]}; }).sort(function(x,y){ return y.n-x.n; });
  var longest = a.sents.map(function(s){ return {s:s, n:wc(s)}; }).sort(function(x,y){ return y.n-x.n; }).slice(0,3);
  var shortest = a.sents.map(function(s){ return {s:s, n:wc(s)}; }).filter(function(x){ return x.n <= 8; }).sort(function(x,y){ return x.n-y.n; }).slice(0,10);
  var mono = Object.create(null);
  a.body.forEach(function(b){ (b.text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).forEach(function(t){ if(/^[A-Z]/.test(t) || /['’]/.test(t)) return; var k = t.toLowerCase(); if(k.length >= 4 && sylCount(k)===1 && !(typeof STOPW!=="undefined" && STOPW[k])) mono[k] = (mono[k]||0) + 1; }); });
  var monoList = Object.keys(mono).map(function(k){ return {w:k, n:mono[k]}; }).sort(function(x,y){ return y.n-x.n; });
  return {ok:true, W:W, S:S, Sy:Sy, asl:asl, spw:spw, fre:fre, fk:fk, poly:polyList, longest:longest, shortest:shortest, mono:monoList};
}
