/* ── 프롬프트 조립 ── */
function items(secId){
  if(!scope[secId]) return [];
  const sec=DATA.find(d=>d.id===secId); if(!sec) return [];
  const out=[];
  sec.groups.forEach(g=>g.items.forEach(it=>{
    if(state[secId].has(it[0])) out.push({kr:it[0],en:it[1],ext:EXT[it[0]]||""});
  }));
  return out;
}
const pick=(...ids)=>ids.flatMap(items);
/* 한 섹션 안에서도 그룹에 따라 라벨을 갈라야 하는 곳이 있다 (MOVE_GROUPS 참고).
   lookup 에 담아 둔 그룹 라벨로 거른다 — 화면에 보이는 묶음과 같은 기준이다. */
const itemsIn=(secId,groups)=>items(secId).filter(it=>groups.includes(lookup[it.kr].grp));
function itemText(it){ return outputLength==="detail" && it.ext ? `${it.en}, ${it.ext}` : it.en; }
function listText(arr){ return arr.map(itemText).filter(Boolean).join(", "); }
function block(label,arr){ const t=listText(arr); return t?`${label}: ${t}.`:""; }
/* 라벨 없이 문장 조각을 이어 쓰는 모델(Seedance 등)에서 첫 글자만 올린다.
   한글·숫자로 시작하면 toUpperCase 가 원본을 그대로 돌려주므로 그대로 통과한다. */
function cap(t){ const s=(t||"").trim(); return s ? s[0].toUpperCase()+s.slice(1) : ""; }
const dot=t=>/[.!?]$/.test(t) ? t : t+".";

/* ── Seedance 2.0 프롬프트 조립 ──
   2.0 은 시간 구간을 줄 단위로 읽는다. 한 문단으로 뭉개면 '언제 무엇이 바뀌는가'가
   사라지므로 여기서 만든 줄바꿈은 끝까지 살려야 한다(dedupePhrases 참고). */
function sdSegments(){
  return SD_TIMES[sd.count]
    .map((time,i)=>({time, text:(sd.segs[i]||"").trim()}))
    .filter(s=>s.text);
}
function sdAudioLine(){
  const body=SD_AUDIO[sd.audio];
  if(!body) return "";                     // 무음 — 줄 자체를 만들지 않는다 (메모 입력칸도 숨는다)
  const note=sd.note.trim();
  return "Audio: "+body+(note ? " "+dot(cap(note)) : "");
}
function sdPrompt({head, camera, motion, style, keep}){
  /* 사람이 쓴 내용이 하나도 없으면 프롬프트를 만들지 않는다.
     유지 지시와 가드만으로도 문자열이 비지 않아, 아무것도 입력하지 않은 상태에서
     복사 버튼이 살아 있었다 — 보일러플레이트만 든 '완성된 프롬프트' 가 복사돼 나간다. */
  const segs=sdSegments();
  if(!head && !segs.length) return "";
  const lines=[];
  if(head)   lines.push(dot(cap(head)));
  segs.forEach(s=>lines.push(`${s.time}: ${dot(cap(s.text))}`));
  if(camera) lines.push(dot("Camera: "+camera));
  /* 카메라의 움직임과 '피사체가 얼마나 움직이는가' 는 다른 지시다. 한 줄에 몰면
     "다가가면서 거의 정지" 로 읽힌다 (MOVE_GROUPS 참고). */
  if(motion) lines.push(dot("Motion: "+motion));
  if(style)  lines.push(dot("Style: "+style));
  const audio=sdAudioLine();
  if(audio)  lines.push(audio);
  if(keep)   lines.push(keep);
  return lines.join("\n");
}
function plain(label,t){ const c=(t||"").trim().replace(/[.\s]+$/,""); return c?`${label}: ${c}.`:""; }
/* 꼬리 마침표를 여기서 떼는 이유 — 키워드 나열형(범용)은 피사체를 쉼표로 이어 붙이므로
   "a cat sits on a piano." 를 그대로 쓰면 "…piano., golden hour…" 가 나간다.
   문장형(Veo·Seedance)은 plain() 과 dot() 이 필요한 자리에서 다시 붙인다. */
const subjectText=()=>document.getElementById("subject").value.trim().replace(/[.\s]+$/,"");
const currentModel=()=>CONFIG.models.find(m=>m.key===modelKey);

function withGuard(txt){
  const g=currentModel().guard;
  if(!guardOn || !txt || !g) return txt;
  return txt+g;
}

/* ── 네거티브 프롬프트 ──
   키워드 나열형 모델(SDXL · Kling · Pika 계열)은 본문에 "no text, watermark" 를 넣으면
   그 단어 자체가 토큰으로 들어가 오히려 그것을 그리는 쪽으로 가중된다. 이 모델들은
   네거티브 프롬프트 입력란이 따로 있으므로, 본문에 붙이는 대신 그쪽에 넣도록 따로 낸다.
   문장 해석이 되는 모델(Veo · Seedance · 문장형)은 부정문을 지시로 처리하므로 그대로 둔다. */
function negativeText(){
  const m=currentModel();
  return guardOn && m.negative ? m.negative : "";
}

/* 같은 문구가 두 번 들어가는 것을 막는다.
   예: f/1.8 은 "shallow depth of field" 를 이미 포함하는데
       '얕은 심도 보케' 를 같이 고르면 그 문구가 두 번 나간다.
   중복은 모델이 그 개념에 과도한 가중치를 주게 만들고 프롬프트만 길어진다. */
function dedupeSentences(txt, seen, drop){
  /* 문장을 가른 공백을 함께 담아 두고 그대로 되돌린다.
     예전처럼 join(" ") 로 합치면 Seedance 2.0 의 시간 구간 줄바꿈이 한 줄로 뭉개진다.
     한 칸 공백으로 이어지던 기존 모델(Veo·범용)의 출력은 그대로다. */
  const parts=txt.split(/(?<=[.;])(\s+)/);
  const out=[];
  for(let i=0;i<parts.length;i+=2){
    const sent=parts[i], sep=parts[i+1]||"";
    const head=sent.match(/^[^:.]{1,40}:\s*/);      // "Camera and lens: " 같은 라벨은 보존
    const label=head?head[0]:"";
    let body=sent.slice(label.length);
    const period=/\.$/.test(body);
    if(period) body=body.slice(0,-1);
    const kept=body.split(", ").filter(p=>{
      const k=p.trim().toLowerCase();
      if(!k) return false;
      if(seen.has(k)) return drop ? false : true;   // 지키는 줄은 걸러내지 않고 등록만 한다
      seen.add(k); return true;
    });
    if(kept.length) out.push(label+kept.join(", ")+(period?".":""), sep);
  }
  return out.join("");
}

/* 사람이 직접 쓴 줄은 줄바꿈만이 아니라 '내용'도 지켜야 한다.
   구간 서술("0-3s: …")이나 피사체 한 줄에 항목과 같은 문구를 쓰면 그 부분이 통째로
   지워져, 쓴 사람 입장에서는 입력한 문장이 이유 없이 사라진 것으로 보였다.
   중복 제거는 항목에서 조립된 Camera·Style 줄에만 걸면 충분하다. */
const SD_ITEM_LINE=/^(Camera|Style): /;
function dedupePhrases(txt){
  if(!txt) return txt;
  const seen=new Set();
  /* 한 줄짜리 출력(Veo·범용)은 예전 경로 그대로 — 줄 단위 분기가 개입하지 않는다. */
  if(!txt.includes("\n")) return dedupeSentences(txt, seen, true).replace(/\s+$/,"");
  return txt.split("\n")
    .map(line=>dedupeSentences(line, seen, SD_ITEM_LINE.test(line)))
    .filter(line=>line!=="")
    .join("\n").replace(/\s+$/,"");
}

function build(){ return withGuard(dedupePhrases(CONFIG.build(modelKey))); }
function wordCount(txt){ return txt && txt.trim() ? txt.trim().split(/\s+/).length : 0; }
function buildForLength(length){
  const prev=outputLength;
  try{
    outputLength=length;
    return build();
  }finally{
    outputLength=prev;
  }
}

/* 손이 카드 위에 있어도 바로 복사할 수 있게 하는 키보드 단축키 */
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey) && e.key==="Enter"){
    e.preventDefault();
    if(!document.getElementById("copyBtn").disabled) copyIt();
  }
});

/* 복사할 칸이 둘이 됐다(본문 · 네거티브). 되돌림 문구와 대체 경로가 같으므로
   버튼 구조는 그대로 두고 대상만 인자로 받는다 — verify:copy 가 보는 #copyBtn 의
   아이콘·레이블 구조는 건드리지 않는다. */
function copyText(srcEl, btn){
  const t=srcEl.value; if(!t) return;
  const label=btn.querySelector(".copy-tx");
  const done=()=>{ label.textContent="복사됨 ✓"; btn.classList.add("done");
    setTimeout(()=>{label.textContent="복사"; btn.classList.remove("done");},1400); };
  const fb=()=>{ srcEl.removeAttribute("readonly"); srcEl.select();
    try{ document.execCommand("copy"); done(); }catch(e){}
    srcEl.setAttribute("readonly",""); window.getSelection().removeAllRanges(); };
  if(navigator.clipboard && window.isSecureContext)
    navigator.clipboard.writeText(t).then(done).catch(fb);
  else fb();
}
function copyIt(){
  copyText(document.getElementById("prompt"), document.getElementById("copyBtn"));
}

restoreState();
sync();
/* input[autofocus] 의 focus 이벤트는 이 스크립트가 실행되기 전에 이미 지나갔다.
   그래서 페이지를 열자마자 한 첫 입력은 스냅샷이 없어 되돌릴 수 없었다. */
if(document.activeElement===subjectEl) subjectEditSnapshot=snapshot();
