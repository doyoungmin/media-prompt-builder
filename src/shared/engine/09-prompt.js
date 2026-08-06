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
function sdPrompt({head, camera, style, keep}){
  const lines=[];
  if(head)   lines.push(dot(cap(head)));
  sdSegments().forEach(s=>lines.push(`${s.time}: ${dot(cap(s.text))}`));
  if(camera) lines.push(dot("Camera: "+camera));
  if(style)  lines.push(dot("Style: "+style));
  const audio=sdAudioLine();
  if(audio)  lines.push(audio);
  if(keep)   lines.push(keep);
  return lines.join("\n");
}
function plain(label,t){ const c=(t||"").trim().replace(/[.\s]+$/,""); return c?`${label}: ${c}.`:""; }
const subjectText=()=>document.getElementById("subject").value.trim();
const currentModel=()=>CONFIG.models.find(m=>m.key===modelKey);

function withGuard(txt){
  const g=currentModel().guard;
  if(!guardOn || !txt || !g) return txt;
  return txt+g;
}

/* 같은 문구가 두 번 들어가는 것을 막는다.
   예: f/1.8 은 "shallow depth of field" 를 이미 포함하는데
       '얕은 심도 보케' 를 같이 고르면 그 문구가 두 번 나간다.
   중복은 모델이 그 개념에 과도한 가중치를 주게 만들고 프롬프트만 길어진다. */
function dedupePhrases(txt){
  if(!txt) return txt;
  const seen=new Set();
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
      if(seen.has(k)) return false;
      seen.add(k); return true;
    });
    if(kept.length) out.push(label+kept.join(", ")+(period?".":""), sep);
  }
  return out.join("").replace(/\s+$/,"");
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

function copyIt(){
  const t=document.getElementById("prompt").value; if(!t) return;
  const btn=document.getElementById("copyBtn");
  const label=btn.querySelector(".copy-tx");
  const done=()=>{ label.textContent="복사됨 ✓"; btn.classList.add("done");
    setTimeout(()=>{label.textContent="복사"; btn.classList.remove("done");},1400); };
  const fb=()=>{ const ta=document.getElementById("prompt");
    ta.removeAttribute("readonly"); ta.select();
    try{ document.execCommand("copy"); done(); }catch(e){}
    ta.setAttribute("readonly",""); window.getSelection().removeAllRanges(); };
  if(navigator.clipboard && window.isSecureContext)
    navigator.clipboard.writeText(t).then(done).catch(fb);
  else fb();
}

restoreState();
sync();
/* input[autofocus] 의 focus 이벤트는 이 스크립트가 실행되기 전에 이미 지나갔다.
   그래서 페이지를 열자마자 한 첫 입력은 스냅샷이 없어 되돌릴 수 없었다. */
if(document.activeElement===subjectEl) subjectEditSnapshot=snapshot();
