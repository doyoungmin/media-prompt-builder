/* ── 이벤트 ── */

/* 현재 선택 목록 — 기본은 개수만 보여주고, 개별 해제가 필요할 때 편다.
   왼쪽에 칩이 켜져 있고 섹션마다 개수 뱃지가 있어 상시 노출할 이유가 없다. */
const selSumBox=document.getElementById("selSumBox");
const selSumHead=document.getElementById("selSumHead");
function setSelSumOpen(open){
  selSumBox.classList.toggle("open",open);
  selSumHead.setAttribute("aria-expanded",open);
}

/* 모바일에서는 우측 결과 레일을 하단 축소 바로 바꾸고, 요청할 때만 전체 화면으로 연다. */
const MOBILE_QUERY=window.matchMedia ? window.matchMedia("(max-width: 1039px)") : {matches:false};
const outRail=document.getElementById("outRail");
const outPanel=document.getElementById("outPanel");
const mobileOutBar=document.getElementById("mobileOutBar");
const mobileOutHead=document.getElementById("mobileOutHead");
const workspace=document.querySelector(".wrap");
function setMobileOutOpen(open,focusTarget=""){
  const mobile=!!MOBILE_QUERY.matches;
  const next=mobile && !!open;
  outRail.classList.toggle("mobile-open",next);
  mobileOutBar.setAttribute("aria-expanded",next);
  document.body.classList.toggle("mobile-out-open",next);
  workspace.inert=next;
  if(mobile){
    outPanel.inert=!next;
    outPanel.setAttribute("aria-hidden",String(!next));
  }else{
    outPanel.inert=false;
    outPanel.removeAttribute("aria-hidden");
  }
  if(next){
    outRail.setAttribute("role","dialog");
    outRail.setAttribute("aria-modal","true");
    outRail.setAttribute("aria-label","생성 결과");
  }else{
    outRail.removeAttribute("role");
    outRail.removeAttribute("aria-modal");
    outRail.removeAttribute("aria-label");
  }
  if(focusTarget==="head" && next) mobileOutHead.focus({preventScroll:true});
  if(focusTarget==="bar" && mobile) mobileOutBar.focus({preventScroll:true});
}
mobileOutBar.addEventListener("click",()=>setMobileOutOpen(true,"head"));
mobileOutHead.addEventListener("click",()=>setMobileOutOpen(false,"bar"));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && outRail.classList.contains("mobile-open")){
    e.preventDefault(); setMobileOutOpen(false,"bar");
  }
});
function syncViewport(){
  setMobileOutOpen(outRail.classList.contains("mobile-open"));
  if(MOBILE_QUERY.matches && document.activeElement===document.getElementById("subject"))
    document.getElementById("subject").blur();
}
syncViewport(); window.addEventListener("resize",syncViewport);

document.addEventListener("click",e=>{
  const t=e.target;
  if(t.closest("#builderBtn")){
    const open=!builderMenu.classList.contains("open");
    setBuilderOpen(open,open); return;
  }
  // 메뉴 밖을 누르면 닫고, 원래 하려던 동작은 그대로 이어간다
  if(!t.closest("#builderMenu")) setBuilderOpen(false);
  if(t.closest("#selSumHead")){
    setSelSumOpen(!selSumBox.classList.contains("open")); saveState(); return;
  }
  /* 결과 레일의 동작 버튼과 표시 수준 — 나머지와 같은 위임 방식으로 통일한다
     (인라인 onclick 은 전역 함수 이름에 묶여 있어 리네임에 취약하다) */
  const act=t.closest("[data-act]");
  if(act){
    if(act.dataset.act==="undo") undo();
    else if(act.dataset.act==="reset") reset();
    else if(act.dataset.act==="copy") copyIt();
    return;
  }
  const lv=t.closest("[data-level]");
  if(lv){ setLevel(lv.dataset.level); return; }
  const modelBtn=t.closest("[data-model]");
  if(modelBtn){ modelKey=modelBtn.dataset.model; sync(); return; }
  const len=t.closest("[data-length]");
  if(len){ outputLength=len.dataset.length; sync(); return; }
  const tab=t.closest(".modetab");
  if(tab){
    document.querySelectorAll(".modetab").forEach(x=>{
      x.classList.remove("on"); x.setAttribute("aria-selected","false"); x.tabIndex=-1; });
    document.querySelectorAll(".pane").forEach(x=>x.classList.remove("on"));
    tab.classList.add("on"); tab.setAttribute("aria-selected","true"); tab.tabIndex=0;
    document.getElementById("pane-"+tab.dataset.pane).classList.add("on"); return;
  }
  const opt=t.closest(".opt");
  if(opt){ pickWiz(opt.dataset.wiz, opt.dataset.opt); return; }
  const q=t.closest("[data-quick]");
  if(q){ const on=CONFIG.quick[q.dataset.quick];
    if(ORDER.every(id=>scope[id]===on.includes(id))) return;
    pushHistory();
    ORDER.forEach(id=>scope[id]=on.includes(id)); sync(); return; }
  if(t.closest("#guardBtn")){ pushHistory(); guardOn=!guardOn; sync(); return; }
  const en=t.closest("[data-enable]");
  if(en){ pushHistory(); scope[en.dataset.enable]=true; sync(); return; }
  const sc=t.closest("[data-scope]");
  if(sc){ pushHistory(); scope[sc.dataset.scope]=!scope[sc.dataset.scope]; sync(); return; }
  const head=t.closest(".sec-head");
  // .sec-bar 로 한 겹 감쌌으므로 parentElement 가 아니라 section 을 찾아야 한다
  if(head){ const open=head.closest("section").classList.toggle("open");
    head.setAttribute("aria-expanded",open); return; }
  const rm=t.closest("[data-remove]");
  if(rm){ pushHistory(); const kr=rm.dataset.remove; state[lookup[kr].sec].delete(kr);
    manualEdits=true; replacedNotice=false; lastApplied=null; conflictNotice=null;
    activePreset=null; sync(); return; }
  const chip=t.closest(".chip");
  if(chip) toggle(chip.dataset.sec, chip.dataset.kr);
});

/* 탭 좌우 방향키 이동 (WAI-ARIA tablist 패턴) */
const modeTabs=[...document.querySelectorAll(".modetab")];
modeTabs.forEach(tab=>{ tab.tabIndex=tab.getAttribute("aria-selected")==="true"?0:-1; });
document.querySelector(".modetabs").addEventListener("keydown",e=>{
  if(e.key!=="ArrowLeft" && e.key!=="ArrowRight" && e.key!=="Home" && e.key!=="End") return;
  const tabs=[...document.querySelectorAll(".modetab")].filter(t=>t.offsetParent!==null||true);
  const i=tabs.indexOf(document.activeElement); if(i<0) return;
  e.preventDefault();
  const n = e.key==="Home" ? 0
          : e.key==="End" ? tabs.length-1
          : (i + (e.key==="ArrowRight"?1:-1) + tabs.length) % tabs.length;
  tabs[n].focus(); tabs[n].click();
});

/* ── 카드 설명 툴팁 ──
   카드 이미지는 기본 크기로 유지하고, 카드 안에서 감춘 설명만 카드 옆에 보여준다.
   짧은 지연을 둬서 목록 위로 마우스를 지나갈 때 깜빡이지 않는다. */
const PV_SEL=".chip.haspv,.opt.haspv,.preset-card";
const PV_DELAY=140;
/* 같은 설명을 선택 상태의 상시 툴팁과 호버 툴팁이 함께 사용한다. */
document.querySelectorAll(PV_SEL).forEach(card=>{
  const desc=card.querySelector(".desc,small");
  if(desc && desc.textContent.trim()) card.dataset.tip=desc.textContent.trim();
});
const pvTooltip=document.createElement("div");
pvTooltip.id="pvtooltip";
pvTooltip.setAttribute("role","tooltip");
pvTooltip.setAttribute("aria-hidden","true");
document.body.appendChild(pvTooltip);
let tooltipTimer=null, tooltipCard=null;
const cardSelected=card=>card.matches(".chip.on,.opt.on,.preset-card.sel");

function hideTooltip(){
  clearTimeout(tooltipTimer); tooltipTimer=null; tooltipCard=null;
  pvTooltip.classList.remove("show");
  pvTooltip.setAttribute("aria-hidden","true");
}
function placeTooltip(card){
  const r=card.getBoundingClientRect();
  const inset=10, pad=10;
  pvTooltip.style.maxWidth=Math.max(120,r.width-inset*2)+"px";
  const w=pvTooltip.offsetWidth, h=pvTooltip.offsetHeight;
  // 카드 안쪽 상단 중앙에 놓고 화면 경계도 벗어나지 않게 한다
  let left=r.left+(r.width-w)/2;
  left=Math.min(Math.max(pad,left),Math.max(pad,window.innerWidth-w-pad));
  let top=r.top+inset;
  top=Math.min(Math.max(pad,top),Math.max(pad,window.innerHeight-h-pad));
  pvTooltip.style.left=Math.round(left)+"px";
  pvTooltip.style.top=Math.round(top)+"px";
}
function showTooltip(card){
  const descEl=card.querySelector(".desc,small");
  const desc=descEl&&descEl.textContent.trim();
  if(!desc) return;
  pvTooltip.textContent=desc;
  pvTooltip.classList.add("show");
  pvTooltip.setAttribute("aria-hidden","false");
  placeTooltip(card);         // 툴팁 크기가 정해진 뒤에 위치를 잡는다
}
function queueTooltip(card){
  if(cardSelected(card)){ hideTooltip(); return; }
  if(card===tooltipCard) return;
  clearTimeout(tooltipTimer); tooltipCard=card;
  tooltipTimer=setTimeout(()=>{
    if(tooltipCard===card && !cardSelected(card)) showTooltip(card);
  },PV_DELAY);
}
document.addEventListener("pointerover",e=>{
  if(!e.target.closest) return;
  const card=e.target.closest(PV_SEL);
  if(card) queueTooltip(card);
  else if(tooltipCard) hideTooltip();
});
document.addEventListener("pointerdown",hideTooltip);
document.addEventListener("focusin",e=>{
  const card=e.target.closest&&e.target.closest(PV_SEL);
  if(card) queueTooltip(card); else hideTooltip();
});
window.addEventListener("scroll",hideTooltip,true);
window.addEventListener("resize",hideTooltip);

document.getElementById("search").addEventListener("input",e=>{
  const prev=query; query=e.target.value.trim().toLowerCase();
  if(!prev && query){
    openBeforeSearch={};
    DATA.forEach(s=>openBeforeSearch[s.id]=document.getElementById("sec-"+s.id).classList.contains("open"));
  }else if(prev && !query && openBeforeSearch){
    DATA.forEach(s=>document.getElementById("sec-"+s.id).classList.toggle("open",openBeforeSearch[s.id]));
    openBeforeSearch=null;
  }
  sync();
});
const subjectEl=document.getElementById("subject");
subjectEl.addEventListener("focus",()=>{ subjectEditSnapshot=snapshot(); });
/* 피사체를 칠 때 바뀌는 것은 경고와 프롬프트뿐이다.
   칩 200개를 한 글자마다 다시 훑을 이유가 없다(그쪽이 sync() 비용의 대부분이다). */
subjectEl.addEventListener("input",syncOutput);
subjectEl.addEventListener("blur",()=>{
  if(subjectEditSnapshot && subjectEditSnapshot.subject!==subjectEl.value){
    pushHistory(subjectEditSnapshot);
    sync();
  }
  subjectEditSnapshot=null;
});
function syncLevelUI(){
  [["m-easy","easy"],["m-all","all"]].forEach(([id,v])=>{
    const b=document.getElementById(id);
    b.classList.toggle("on",level===v); b.setAttribute("aria-pressed",level===v);
  });
}
function setLevel(l){ level=l; syncLevelUI(); sync(); }

/* ── 선택 · 충돌 ── */
/* removed 배열을 넘기면 충돌 규칙 때문에 해제된 항목 이름이 담긴다.
   해제는 조용히 일어나면 안 된다 — 방금 고른 것이 사라진 것처럼 보이기 때문이다. */
function selectItem(kr, removed){
  const l=lookup[kr]; if(!l) return;
  const sec=DATA.find(d=>d.id===l.sec);
  const grp=sec.groups.find(g=>g.label===l.grp);
  const drop=n=>{
    if(n===kr) return;
    const t=lookup[n]; if(!t || !state[t.sec].has(n)) return;
    state[t.sec].delete(n);
    if(removed && !removed.includes(n)) removed.push(n);
  };
  if(grp.xg) DATA.forEach(s=>s.groups.forEach(g=>{
    if(g.xg===grp.xg) g.items.forEach(it=>drop(it[0]));
  }));
  EXCLUSIVE.forEach(set=>{ if(set.includes(kr)) set.forEach(drop); });
  PAIRS.forEach(([a,b])=>{
    if(a.includes(kr)) b.forEach(drop);
    if(b.includes(kr)) a.forEach(drop);
  });
  state[l.sec].add(kr);
}
function toggle(secId,kr){
  pushHistory();
  const removed=[];
  if(state[secId].has(kr)) state[secId].delete(kr); else selectItem(kr,removed);
  conflictNotice = removed.length ? {kept:kr, removed} : null;
  manualEdits=true; replacedNotice=false; lastApplied=null; activePreset=null; sync();
}

/* ── 되돌리기 ── */
function snapshot(){
  const sel={}; DATA.forEach(s=>sel[s.id]=[...state[s.id]]);
  return {
    sel,
    wiz:{...wizPick},
    subject:document.getElementById("subject").value,
    preset:activePreset,
    scope:Object.fromEntries(ORDER.map(id=>[id,scope[id]])),
    guard:guardOn,
    manual:manualEdits,
    applied:lastApplied ? {...lastApplied,items:[...lastApplied.items]} : null,
    replaced:replacedNotice,
    sd:{...sd, segs:[...sd.segs]},
  };
}
function normalizeSnapshot(sn){
  const sortedObject=obj=>Object.fromEntries(
    Object.keys(obj||{}).sort().map(key=>[key,obj[key]])
  );
  return {
    sel:Object.fromEntries(ORDER.slice().sort().map(id=>[
      id,[...(sn.sel[id]||[])].sort()
    ])),
    wiz:sortedObject(sn.wiz),
    subject:sn.subject,
    preset:sn.preset||null,
    scope:sortedObject(sn.scope),
    guard:!!sn.guard,
    manual:!!sn.manual,
    applied:sn.applied ? {
      label:sn.applied.label,
      items:[...(sn.applied.items||[])].sort(),
      why:sn.applied.why||"",
    } : null,
    replaced:!!sn.replaced,
    sd:sn.sd ? {...sn.sd, segs:[...(sn.sd.segs||[])]} : null,
  };
}
function snapshotKey(sn){ return JSON.stringify(normalizeSnapshot(sn)); }
function pushHistory(snap=snapshot()){
  const last=undoStack[undoStack.length-1];
  if(last && snapshotKey(last)===snapshotKey(snap)) return;
  undoStack.push(snap);
  if(undoStack.length>20) undoStack.shift();
}
/* 가이드 옵션의 시각 상태와 aria 상태를 함께 갱신한다 */
function syncWizUI(){
  document.querySelectorAll(".opt").forEach(b=>{
    const on=wizPick[b.dataset.wiz]===b.dataset.opt;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
}
function syncPresetUI(){
  document.querySelectorAll(".preset-card").forEach(c=>{
    c.classList.toggle("sel",c.dataset.preset===activePreset);
  });
}

function undo(){
  const sn=undoStack.pop(); if(!sn) return;
  DATA.forEach(s=>state[s.id]=new Set(sn.sel[s.id]));
  wizPick={...sn.wiz};
  document.getElementById("subject").value=sn.subject;
  activePreset=sn.preset||null;
  ORDER.forEach(id=>scope[id]=sn.scope[id]);
  guardOn=sn.guard;
  manualEdits=sn.manual;
  lastApplied=sn.applied ? {...sn.applied,items:[...sn.applied.items]} : null;
  replacedNotice=sn.replaced;
  conflictNotice=null;
  if(sn.sd){ sd={...sn.sd, segs:[...sn.sd.segs]}; redrawSd(); }
  syncWizUI();
  syncPresetUI();
  sync();
}
function applySelection(list, keep){
  conflictNotice=null;   // 가이드·프리셋 적용은 그 자체가 '교체' 안내를 따로 낸다
  if(!keep){
    DATA.forEach(sec=>state[sec.id].clear());
  }
  list.forEach(kr=>selectItem(kr));   // forEach 의 index 가 removed 로 새어들지 않게 한다
  sync();
}
function pickWiz(key,opt){
  pushHistory();
  replacedNotice=manualEdits && DATA.some(s=>state[s.id].size>0);
  const turningOn = wizPick[key]!==opt;
  wizPick[key]=turningOn?opt:null;
  syncWizUI();
  activePreset=null; syncPresetUI();
  const list=[]; WIZ.forEach(s=>{ const p=wizPick[s.key]; if(p) list.push(...s.opts[p]); });
  // 무엇이 왜 적용됐는지 그 자리에서 알려준다
  lastApplied = turningOn
    ? {label:opt, items:WIZ.find(s=>s.key===key).opts[opt],
       why:(WIZ.find(s=>s.key===key).why||{})[opt]||""}
    : null;
  manualEdits=false;
  applySelection(list,false);
}
function reset(){
  const changed=DATA.some(s=>state[s.id].size>0)
    ||document.getElementById("subject").value.trim()
    ||ORDER.some(id=>!scope[id]) || !guardOn || Object.keys(wizPick).length || activePreset
    ||sd.segs.some(t=>t.trim()) || sd.note.trim();
  if(changed) pushHistory();
  DATA.forEach(sec=>state[sec.id].clear());
  ORDER.forEach(id=>scope[id]=true);
  wizPick={}; syncWizUI();
  activePreset=null; syncPresetUI();
  document.getElementById("subject").value="";
  sd={count:2, segs:["","",""], audio:"none", note:"", preserve:"strict"}; redrawSd();
  document.getElementById("search").value=""; query=""; openBeforeSearch=null;
  manualEdits=false; replacedNotice=false; lastApplied=null; conflictNotice=null;
  sync();
}

