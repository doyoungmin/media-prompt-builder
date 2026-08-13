/* ── 동기화 ──
   두 갈래로 나눠 둔다.
     syncItems()  선택 상태·검색·표시 수준에 따라 좌측 칩 목록을 다시 그린다.
                  칩이 200개 안팎이라 이 루프가 sync() 비용의 대부분(측정 17.6ms 중 10ms)이다.
     syncOutput() 경고·프롬프트·단어 수 등 결과 쪽만 갱신한다. 훨씬 싸다.
   피사체를 한 글자 칠 때마다 바뀌는 것은 결과뿐이므로 그 경로는 syncOutput() 만 부른다.
   sync() 는 둘 다 부르는 기존 이름 그대로라, 나머지 호출부는 손대지 않아도 된다. */
let outTotal=0;   // 출력에 포함된 선택 개수 — syncItems 가 계산해 syncOutput 이 쓴다
/* 속성 선택자(querySelectorAll)는 문서 전체를 훑는다. 여기 요소들은 처음 만들어진 뒤
   바뀌지 않으므로 한 번만 찾아 둔다 — syncOutput 이 한 글자마다 도는 경로다. */
const LEN_BTNS=[...document.querySelectorAll("[data-length]")];
const LEN_SHORT=LEN_BTNS.find(b=>b.dataset.length==="short");
const LEN_DETAIL=LEN_BTNS.find(b=>b.dataset.length==="detail");
const MODEL_BTNS=[...document.querySelectorAll("[data-model]")];
const SUBJECT_BOX=document.querySelector(".subject-box");

/* ── Seedance 입력 패널 ──
   엔트리 HTML 3벌에 같은 마크업을 복사해 두지 않도록 여기서 한 번만 만든다.
   CONFIG.sd 가 없는 앱(이미지 빌더)에서는 아예 만들지 않는다. */
const SD_BOX=CONFIG.sd ? buildSdPanel() : null;
function buildSdPanel(){
  const box=document.createElement("div");
  box.className="sd-box"; box.id="sdBox"; box.hidden=true;
  const seg=(label,name,opts)=>
    `<span class="profile-label">${label}</span>`
    +`<div class="seg" role="group" aria-label="${label}">`
    +opts.map(([v,t])=>`<button data-sd-${name}="${v}">${t}</button>`).join("")
    +`</div>`;
  box.innerHTML=
     seg("시간구간","count",[["2","2구간"],["3","3구간"]])
    +`<div class="sd-segs" id="sdSegs"></div>`
    +seg("오디오","audio",[["none","무음"],["ambient","환경음"],["dialogue","환경음+대사"]])
    +`<input class="sd-note" id="sdNote" aria-label="효과음·대사 메모"
       placeholder="효과음·대사를 직접 적을 수 있어요 (선택)">`
    +(CONFIG.sd.preserve
      ? seg("참조 이미지 유지","preserve",[["strict","엄격 유지"],["natural","자연스러운 변주"]])
      : "");
  SUBJECT_BOX.insertAdjacentElement("afterend",box);

  // 구간 입력칸은 개수가 바뀌므로 따로 그린다
  const segsEl=box.querySelector("#sdSegs");
  const drawSegs=()=>{
    const times=sdTimes();
    segsEl.innerHTML=times.map((t,i)=>
      `<label class="sd-seg"><span class="sd-time">${t}</span>`
      +`<input data-sd-seg="${i}" aria-label="${t} 구간 내용"`
      +` placeholder="${(CONFIG.sd.segHints||[])[i]||"이 구간에서 무엇이 일어나나요?"}"></label>`
    ).join("");
    times.forEach((_,i)=>{
      segsEl.querySelector(`[data-sd-seg="${i}"]`).value=sd.segs[i]||"";
    });
  };
  box.drawSegs=drawSegs;
  drawSegs();

  /* 구간·메모는 한 글자마다 결과만 바뀐다 — 칩 200개를 다시 훑을 이유가 없다.
     피사체 입력칸과 같은 이유로 syncOutput 만 부른다. */
  box.addEventListener("input",e=>{
    const s=e.target.closest("[data-sd-seg]");
    if(s){ sd.segs[+s.dataset.sdSeg]=s.value; syncOutput(); queueSave(); return; }
    if(e.target.id==="sdNote"){ sd.note=e.target.value; syncOutput(); queueSave(); }
  });
  /* 되돌리기 — 피사체 입력칸과 같은 방식으로 편집 전후를 한 단계로 묶는다.
     구간 수 버튼만 pushHistory 하고 텍스트 입력은 빼먹어서, 같은 패널 안에서
     되돌리기가 되는 것과 안 되는 것이 섞여 있었다.
     입력칸은 drawSegs 가 다시 만들므로 위임(focusin/focusout)으로 받는다. */
  const isSdText=el=>el && (el.matches("[data-sd-seg]") || el.id==="sdNote");
  let sdEditSnapshot=null;
  box.addEventListener("focusin",e=>{
    if(isSdText(e.target)) sdEditSnapshot=snapshot();
  });
  box.addEventListener("focusout",e=>{
    if(!isSdText(e.target) || !sdEditSnapshot) return;
    if(snapshotKey(sdEditSnapshot)!==snapshotKey(snapshot())){ pushHistory(sdEditSnapshot); sync(); }
    sdEditSnapshot=null;
  });
  box.addEventListener("click",e=>{
    const c=e.target.closest("[data-sd-count]");
    if(c){ pushHistory(); sd.count=+c.dataset.sdCount; drawSegs(); sync(); return; }
    const a=e.target.closest("[data-sd-audio]");
    if(a){ pushHistory(); sd.audio=a.dataset.sdAudio; sync(); return; }
    const p=e.target.closest("[data-sd-preserve]");
    if(p){ pushHistory(); sd.preserve=p.dataset.sdPreserve; sync(); }
  });
  return box;
}
/* 패널의 버튼 눌림 상태와 표시 여부를 현재 모델에 맞춘다 */
function syncSdUI(){
  if(!SD_BOX) return;
  const profile=currentSdProfile();
  SD_BOX.hidden = !profile;
  if(!profile) return;
  /* 버전을 바꾸면 같은 구간 내용은 유지하되 타임코드·제목은 새 프로필로 다시 그린다. */
  if(SD_BOX.dataset.model!==modelKey){
    SD_BOX.dataset.model=modelKey;
    redrawSd();
  }
  const label=SD_BOX.querySelector(".profile-label");
  label.textContent=profile.panelLabel;
  SD_BOX.querySelectorAll("[data-sd-count]").forEach(b=>{
    const count=+b.dataset.sdCount;
    const times=profile.timeline[count]||[];
    const end=((times.at(-1)||"").match(/-(\d+)s$/)||[])[1];
    b.textContent=`${count}구간${end?` · ${end}초`:""}`;
  });
  const mark=(name,val)=>SD_BOX.querySelectorAll(`[data-sd-${name}]`).forEach(b=>{
    const on=b.dataset[`sd${name[0].toUpperCase()+name.slice(1)}`]===String(val);
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  mark("count",sd.count); mark("audio",sd.audio); mark("preserve",sd.preserve);
  SD_BOX.querySelector("#sdNote").hidden = sd.audio==="none";
}
/* sd 를 통째로 갈아끼운 뒤(되돌리기·복원·초기화) 입력칸 값을 다시 채운다 */
function redrawSd(){
  if(!SD_BOX) return;
  SD_BOX.drawSegs();
  SD_BOX.querySelector("#sdNote").value=sd.note;
}
const PROMPT_EL=document.getElementById("prompt");
/* ── 네거티브 프롬프트 칸 ──
   Seedance 패널과 같은 이유로 여기서 한 번만 만든다 (엔트리 HTML 3벌 복사 방지).
   negative 를 쓰는 모델이 하나도 없는 앱에서는 아예 만들지 않는다.
   본문 아래·동작 버튼 위에 둔다 — 복사하고 나서 눈에 들어와야 하는 순서다. */
const NEG_BOX=CONFIG.models.some(m=>m.negative) ? buildNegPanel() : null;
function buildNegPanel(){
  const box=document.createElement("div");
  box.className="sd-box neg-box"; box.id="negBox"; box.hidden=true;
  box.innerHTML=
     `<span class="profile-label">네거티브 프롬프트 — 모델의 네거티브 입력란에 따로 넣으세요</span>`
    +`<div class="sd-seg">`
    +`<input class="sd-note" id="negPrompt" readonly aria-label="네거티브 프롬프트">`
    +`<button class="act copy neg-copy" id="negCopyBtn" title="네거티브 프롬프트를 클립보드로 복사"`
    +`><svg class="ic" aria-hidden="true"><use href="#i-copy"/></svg><span class="copy-tx">복사</span></button>`
    +`</div>`;
  PROMPT_EL.insertAdjacentElement("afterend",box);
  box.querySelector("#negCopyBtn").addEventListener("click",()=>
    copyText(box.querySelector("#negPrompt"), box.querySelector("#negCopyBtn")));
  return box;
}
const SUBJECT_NOTE=document.getElementById("subjectNote");
/* 결과 제목 옆 안내 — OUT_LAB 을 매번 다시 그리므로 노드를 만들어 들고 다닌다 */
const OUT_NOTE=document.createElement("span");
OUT_NOTE.id="outNote"; OUT_NOTE.setAttribute("role","status");
OUT_NOTE.setAttribute("aria-live","polite");
/* 좁은 자리라 첫 건만 적고 전체는 툴팁으로 넘긴다.
   내용이 같으면 건드리지 않는다 — 라이브 영역이라 매 입력마다 다시 쓰면
   스크린리더가 같은 문장을 계속 읽는다. */
function setNote(el, notes){
  const first=notes[0];
  /* 한 줄에 들어가는 건 앞머리뿐이다. 문구는 '요약 — 자세히' 로 쓰고
     여기서 앞머리만 떼어 쓴다(전체는 title 로 간다). */
  const text = first
    ? first.t.split("\n")[0].split(" — ")[0] + (notes.length>1 ? ` 외 ${notes.length-1}건` : "")
    : "";
  if(el.textContent!==text) el.textContent=text;
  const full=notes.map(n=>n.t).join("\n");
  if(el.title!==full) el.title=full;
  const cls="note"+(first?" show "+first.tone:"");
  if(el.className!==cls) el.className=cls;
}
const OUT_LAB=document.getElementById("outLab");
const MOBILE_OUT_SUM=document.getElementById("mobileOutSum");
const MOBILE_OUT_HEAD_SUM=document.getElementById("mobileOutHeadSum");

function sync(){ syncItems(); syncOutput(); }

function syncItems(){
  DATA.forEach(sec=>{
    const secEl=document.getElementById("sec-"+sec.id);
    let secVisible=0;
    sec.groups.forEach(g=>{
      const grpEl=secEl.querySelector(`[data-grp="${sec.id}|${g.label}"]`);
      let vis=0, hid=0;
      grpEl.querySelectorAll(".chip").forEach(c=>{
        const on=state[sec.id].has(c.dataset.kr);
        c.classList.toggle("on",on); c.setAttribute("aria-pressed",on);
        const show = query ? c.dataset.find.includes(query)
                           : (level==="all" || c.dataset.rec==="1" || on);
        c.classList.toggle("hide",!show);
        show ? vis++ : hid++;
      });
      grpEl.classList.toggle("hide",vis===0);
      const hn=grpEl.querySelector(".hidden-n");
      hn.textContent = (!query && level==="easy" && hid) ? `전문가 모드에 +${hid}개` : "";
      secVisible+=vis;
    });
    secEl.querySelector(".empty").style.display=secVisible?"none":"block";
    secEl.classList.toggle("hide", !!query && secVisible===0);
    if(query) secEl.classList.toggle("open", secVisible>0);
  });

  let total=0;
  DATA.forEach(sec=>{
    const n=state[sec.id].size; if(scope[sec.id]) total+=n;
    const b=document.getElementById("b-"+sec.id);
    b.textContent=n; b.classList.toggle("off",n===0);
    const off=!scope[sec.id];
    document.getElementById("sec-"+sec.id).classList.toggle("muted",off);
    document.getElementById("m-"+sec.id).style.display=off?"":"none";
    document.getElementById("note-"+sec.id).style.display=(off&&n>0)?"":"none";
  });
  ORDER.forEach(id=>{
    const el=document.getElementById("s-"+id);
    el.classList.toggle("on",scope[id]); el.setAttribute("aria-pressed",scope[id]);
    el.setAttribute("aria-label",`${SEC_SHORT[id]} 출력 ${scope[id]?"포함":"제외"}`);
    el.title = scope[id] ? `${SEC_SHORT[id]} 출력에서 제외` : `${SEC_SHORT[id]} 출력에 포함`;
  });
  /* 섹션 토글이 좌측 섹션 헤더로 갔으므로, 가이드·룩 탭에서는 보이지 않는다.
     무엇이 빠져 있는지는 출력 범위 줄에서 알려준다. */
  const offNames=ORDER.filter(id=>!scope[id]).map(id=>SEC_SHORT[id]);
  const offEl=document.getElementById("scopeOff");
  offEl.textContent = offNames.length ? `${offNames.join(" · ")} 제외됨` : "";
  offEl.classList.toggle("show", offNames.length>0);

  // 현재 선택 요약 (한국어, 클릭으로 개별 해제)
  const chosen=[];
  ORDER.forEach(id=>DATA.find(d=>d.id===id).groups.forEach(g=>g.items.forEach(it=>{
    if(state[id].has(it[0])) chosen.push({kr:it[0],off:!scope[id]});
  })));
  const sumEl=document.getElementById("selSummary");
  sumEl.innerHTML = chosen.length
    ? chosen.map(c=>`<button class="tag${c.off?" off":""}" data-remove="${c.kr}"
        title="클릭하면 해제">${c.kr}<i>×</i></button>`).join("")
    : `<span class="tag-empty">왼쪽에서 항목을 고르면 여기에 모입니다.</span>`;
  /* 접힌 상태에서도 몇 개를 골랐는지, 그중 몇 개가 출력에서 빠졌는지는 보여야 한다 */
  const offCount=chosen.filter(c=>c.off).length;
  document.getElementById("selSumCount").textContent = chosen.length
    ? `${chosen.length}개` + (offCount?` · ${offCount}개 제외`:"")
    : "없음";

  outTotal=total;
}

function syncOutput(){
  const total=outTotal;
  MODEL_BTNS.forEach(b=>{
    const on=b.dataset.model===modelKey;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  LEN_BTNS.forEach(b=>{
    const on=b.dataset.length===outputLength;
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });
  syncSdUI();
  const model=currentModel();
  /* 모델 선택을 망설이지 않도록 여기에는 '어디에 붙여넣는가'만 짧게 보여준다.
     간결/상세의 차이는 바로 아래 출력 밀도 버튼이 맡는다. */
  document.getElementById("modeHelp").textContent=model.help;
  const summary=`${model.label} · ${outputLength==="short"?"간결":"상세"}`;

  /* '텍스트 방지' — 방지 문구를 어디에 낼지는 모델마다 다르다.
     본문에 붙이는 모델(guard)과 네거티브 칸으로 빼는 모델(negative)이 있고,
     둘 다 없는 모델에서만 토글을 비활성화한다. */
  const gb=document.getElementById("guardBtn");
  const neg=negativeText();
  const noGuard=!model.guard && !model.negative;
  gb.disabled=noGuard;
  gb.classList.toggle("on", guardOn && !noGuard);
  gb.setAttribute("aria-pressed", guardOn && !noGuard);
  gb.title = noGuard ? model.noGuardReason
    : model.negative
      ? "텍스트·워터마크 방지 문구를 아래 '네거티브 프롬프트' 칸으로 냅니다 — 이 모델은 본문에 부정문을 넣으면 그 단어를 오히려 그립니다"
      : "프롬프트 끝에 텍스트·워터마크·카메라 UI가 화면에 그려지는 것을 막는 문구를 추가합니다";

  /* ── 안내 ──
     한곳에 모아 띄우던 팝업을 없애고, 고칠 곳 옆에 붙인다.
     입력에 관한 말은 입력칸 라벨 옆(inputNotes), 조합·적용·길이에 관한 말은
     결과 제목 옆(resultNotes). 좁은 자리라 첫 건만 쓰고 나머지는 툴팁으로 넘긴다. */
  const active=n=>{ const l=lookup[n]; return l && scope[l.sec] && state[l.sec].has(n); };
  const inputNotes=[], resultNotes=[];
  const subjText=document.getElementById("subject").value.trim();
  const subjEmpty=!subjText;

  /* 자리가 한 줄뿐이라 순서가 곧 우선순위다.
     방금 한 동작의 결과(해제·교체) → 고쳐야 할 것(조합·길이) → 잘 됐다는 확인(적용됨).
     '적용됨'은 사용자가 방금 의도한 일이라 가장 덜 급하다 — 맨 뒤로 미룬다. */
  if(conflictNotice)
    resultNotes.push({t:`${conflictNotice.kept}와(과) 충돌 — 함께 쓸 수 없어 자동 해제: ${conflictNotice.removed.join(" · ")}`,
                      tone:"swap"});
  if(replacedNotice)
    resultNotes.push({t:"직접 조정한 선택이 교체되었습니다 — '되돌리기'로 복구할 수 있어요", tone:"info"});
  SOFT.filter(r=>r.a.some(active)&&r.b.some(active))
      .forEach(r=>resultNotes.push({t:r.msg, tone:"warn"}));

  if(subjEmpty && total>0 && CONFIG.warnEmptySubject)
    inputNotes.push({t:CONFIG.warnEmptySubject, tone:"warn"});
  /* 조립되는 나머지 문구는 전부 영어다. 여기만 한국어면 모델이 그 부분을
     해석하지 못하거나 화면 속 글자로 그려낸다. */
  if(subjText && HANGUL_RE.test(subjText))
    inputNotes.push({t:`한국어입니다 — 영어로 쓰면 결과가 훨씬 안정적입니다`, tone:"warn"});
  // 입력 텍스트 ↔ 선택 항목 모순
  if(subjText) TEXT_CONFLICTS.forEach(r=>{
    const m=subjText.match(r.re);
    if(m){ const hit=r.items.filter(active);
      if(hit.length) inputNotes.push({t:`${r.msg(m[0])} — ${hit.join(", ")}`, tone:"warn"}); }
  });

  /* 되돌리기 — '되돌리기' 라는 글자는 아이콘이 이미 말한다.
     대신 몇 단계 남았는지를 숫자로 준다: 남은 단계 / 이번에 쌓인 최대 단계.
     되돌릴수록 앞 숫자만 줄어 어디까지 왔는지 보인다. */
  const undoBtn=document.getElementById("undoBtn");
  undoBtn.disabled=undoStack.length===0;
  undoHigh=Math.max(undoHigh, undoStack.length);
  if(!undoStack.length) undoHigh=0;
  document.getElementById("undoCount").textContent=`${undoStack.length}/${undoHigh}`;
  undoBtn.title=undoStack.length
    ? `되돌리기 — ${undoStack.length}단계 남음 (이번에 ${undoHigh}단계까지 쌓임)`
    : "되돌릴 단계가 없습니다";

  /* 출력 범위 빠른 선택 — 지금 범위와 정확히 같은 묶음을 눌린 상태로 둔다.
     누르고 나면 어느 것이 적용됐는지 알 수 없던 문제. */
  document.querySelectorAll("[data-quick]").forEach(b=>{
    const set=CONFIG.quick[b.dataset.quick];
    const on=ORDER.every(id=>scope[id]===set.includes(id));
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",on);
  });

  const shortWords=wordCount(buildForLength("short"));
  const detailWords=wordCount(buildForLength("detail"));
  LEN_SHORT.textContent=`간결 · ${shortWords}단어`;
  LEN_DETAIL.textContent=`상세 · ${detailWords}단어`;

  const txt=build();
  const promptEl=PROMPT_EL;
  promptEl.value=txt;
  /* I2V 처럼 특정 입력이 없으면 프롬프트를 만들지 않는 앱에서는,
     '항목을 고르면 만들어집니다' 라는 기본 안내가 사실과 달라진다.
     막힌 이유를 상자 안에 그대로 띄우고 입력칸을 표시한다. */
  const blocked = CONFIG.subjectRequired && !txt && subjEmpty && total>0;
  promptEl.placeholder = blocked
    ? `${CONFIG.shortLabel||CONFIG.subjectLabel}을 입력하면 프롬프트가 만들어집니다.\n항목 선택만으로는 만들어지지 않습니다.`
    : PROMPT_HINT;
  SUBJECT_BOX.classList.toggle("need",!!blocked);
  document.getElementById("copyBtn").disabled = !txt;   // 빈 상태에서는 복사 비활성
  /* 네거티브 칸은 본문이 있을 때만 낸다 — 본문이 비었는데 방지 문구만 떠 있으면
     아직 아무것도 안 만들어졌다는 사실이 가려진다. */
  if(NEG_BOX){
    NEG_BOX.hidden = !neg || !txt;
    NEG_BOX.querySelector("#negPrompt").value = neg;
  }
  const words=wordCount(txt);
  // limit은 모델의 하드 제한이 아니라 이 앱의 권장 길이 기준이다.
  const lim=model.limit || {short:80, detail:150};
  if(words>lim[outputLength]) resultNotes.push({
    t:"권장 길이보다 길어요 — "+(outputLength==="short"?"항목을 줄이세요":"간결 모드 권장"),
    tone:"warn"});
  // 확인 문구는 맨 뒤 — 고쳐야 할 것이 있으면 그쪽이 먼저 보여야 한다
  /* '현재 총 N개' 는 빼둔다 — '현재 선택' 이 같은 수를 더 정확히(출력 제외분까지)
     세고 있어서, 두 숫자가 어긋나 보이면 어느 쪽을 믿을지 헷갈린다. */
  if(lastApplied) resultNotes.push({
    t:`${lastApplied.label} → ${lastApplied.items.length}개 적용`
      +`${lastApplied.why?" · "+lastApplied.why:""}\n${lastApplied.items.join(" · ")}`, tone:"ok"});
  /* blocked 조건은 warnEmptySubject 와 같아서 따로 말하지 않는다 —
     그 문구가 이미 입력칸 옆에 떠 있고, .need 로 입력칸도 함께 표시된다. */
  setNote(SUBJECT_NOTE, inputNotes);
  OUT_LAB.textContent="생성된 프롬프트";
  OUT_LAB.appendChild(OUT_NOTE);
  setNote(OUT_NOTE, resultNotes);

  /* 모바일 접힘 바 — 개수·단어수 대신 지금 알아야 할 것 한 줄만 */
  const head=[...resultNotes,...inputNotes][0];
  MOBILE_OUT_SUM.textContent = head ? head.t.split("\n")[0]
    : (txt ? summary : "선택 결과가 여기에 표시됩니다.");
  MOBILE_OUT_HEAD_SUM.textContent=summary;

  queueSave();
}

/* ── 선택 상태 저장 ──
   새로고침이나 실수로 닫았을 때 고른 것을 잃지 않게 한다.
   단, 로컬 파일(file://)로 열면 브라우저가 저장소 접근 자체를 막는 경우가 있어
   (Chrome·Safari) 전부 실패해도 조용히 넘어간다 — 저장은 어디까지나 덤이다. */
/* 저장 키는 앱 id 로 잡는다. 주소로 잡으면 같은 앱인데 `/` · `/x` · `/x.html` 이
   각각 다른 칸에 저장돼, 메뉴로 옮겨 다닐 때 작업이 사라진 것처럼 보인다. */
const STORE_KEY="prompt-builder:"+APP_ID;
const STORE_V=2;
const isRecord=v=>!!v && typeof v==="object" && !Array.isArray(v);
const stringArray=v=>Array.isArray(v) ? v.filter(x=>typeof x==="string") : [];
/* v1 → v2 는 저장값 검증을 도입한 버전이다. 기존 선택은 유지하되,
   알 수 없는 버전은 무리하게 해석하지 않고 기본 상태로 시작한다. */
function migrateSavedState(saved){
  if(!isRecord(saved)) return null;
  if(saved.v===1) return {...saved,v:STORE_V};
  return saved.v===STORE_V ? saved : null;
}
function storage(){ try{ return window.localStorage; }catch(e){ return null; } }

/* ── 화면 테마 ── 앱별 작업 상태와 달리 세 빌더가 같은 선택을 공유한다. */
const THEME_KEY="prompt-builder:theme";
const THEME_COLORS={dark:"#06070A",light:"#f5f6f8"};
const THEME_BTNS=[...document.querySelectorAll("[data-theme-choice]")];
function applyTheme(theme,persist=true){
  const next=theme==="light"?"light":"dark";
  document.documentElement.dataset.theme=next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",THEME_COLORS[next]);
  THEME_BTNS.forEach(btn=>btn.setAttribute("aria-pressed",btn.dataset.themeChoice===next));
  if(!persist) return;
  const s=storage(); if(!s) return;
  try{ s.setItem(THEME_KEY,next); }catch(e){}
}
document.getElementById("themeSwitch").addEventListener("click",e=>{
  const btn=e.target.closest("[data-theme-choice]");
  if(btn) applyTheme(btn.dataset.themeChoice);
});
applyTheme(document.documentElement.dataset.theme==="light"?"light":"dark",false);

let saveTimer=null;
function saveState(){
  const s=storage(); if(!s) return;
  try{
    s.setItem(STORE_KEY, JSON.stringify({
      v:STORE_V,
      sel:Object.fromEntries(DATA.map(d=>[d.id,[...state[d.id]]])),
      subject:document.getElementById("subject").value,
      model:modelKey, length:outputLength, level,
      scope:Object.fromEntries(ORDER.map(id=>[id,scope[id]])),
      guard:guardOn, wiz:wizPick, preset:activePreset,
      selOpen:selSumBox.classList.contains("open"),
      sd:{...sd, segs:[...sd.segs]},
    }));
  }catch(e){}   // 용량 초과·비공개 모드 등 — 저장 실패는 앱 동작에 영향이 없다
}
function queueSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveState,400); }
/* 저장 키를 주소 기준에서 앱 id 기준으로 바꾸기 전에 쓰던 키들.
   그대로 두면 이미 저장해 둔 사람의 선택이 한 번 사라진 것처럼 보인다.
   한 번 옮겨 담고 옛 키는 지운다. 시간이 지나면 이 블록은 통째로 삭제해도 된다. */
function adoptLegacyState(s){
  const legacy=[
    "prompt-builder:"+THIS_APP.file,                       // /x.html 로 열었을 때
    "prompt-builder:"+THIS_APP.file.replace(/\.html$/,""), // Cloudflare 가 확장자를 뗀 주소
  ];
  if(APP_ID==="image") legacy.push("prompt-builder:");     // 루트(/)는 이미지 빌더였다
  for(const k of legacy){
    let v=null;
    try{ v=s.getItem(k); }catch(e){ continue; }
    if(!v) continue;
    try{ s.setItem(STORE_KEY,v); }catch(e){}
    legacy.forEach(old=>{ try{ s.removeItem(old); }catch(e){} });
    return v;
  }
  return null;
}

function restoreState(){
  const s=storage(); if(!s) return;
  let raw;
  try{ raw=s.getItem(STORE_KEY) || adoptLegacyState(s); }catch(e){ return; }
  let saved;
  try{ saved=JSON.parse(raw||"null"); }catch(e){ return; }
  saved=migrateSavedState(saved);
  if(!saved) return;
  // 저장된 뒤에 항목·모델이 바뀌었을 수 있으므로 지금 존재하는 것만 되살린다
  const savedSel=isRecord(saved.sel) ? saved.sel : {};
  DATA.forEach(d=>state[d.id]=new Set(stringArray(savedSel[d.id]).filter(has)));
  const savedScope=isRecord(saved.scope) ? saved.scope : {};
  ORDER.forEach(id=>{ if(typeof savedScope[id]==="boolean") scope[id]=savedScope[id]; });
  if(CONFIG.models.some(m=>m.key===saved.model)) modelKey=saved.model;
  if(saved.length==="short" || saved.length==="detail") outputLength=saved.length;
  if(saved.level==="easy" || saved.level==="all") level=saved.level;
  guardOn=typeof saved.guard==="boolean" ? saved.guard : true;
  const savedWiz=isRecord(saved.wiz) ? saved.wiz : {};
  wizPick={};
  WIZ.forEach(step=>{
    const value=savedWiz[step.key];
    if(typeof value==="string" && Object.prototype.hasOwnProperty.call(step.opts,value))
      wizPick[step.key]=value;
  });
  activePreset=(typeof saved.preset==="string" && PRESETS[saved.preset]) ? saved.preset : null;
  document.getElementById("subject").value=typeof saved.subject==="string" ? saved.subject : "";
  /* 저장된 값이 지금의 선택지에 없을 수 있다(구간 수·오디오 종류가 바뀐 경우) */
  if(isRecord(saved.sd)){
    const v=saved.sd;
    if(v.count===2 || v.count===3) sd.count=v.count;
    if(Array.isArray(v.segs)) sd.segs=[0,1,2].map(i=>typeof v.segs[i]==="string" ? v.segs[i] : "");
    if(typeof v.audio==="string" && Object.prototype.hasOwnProperty.call(SD_AUDIO,v.audio)) sd.audio=v.audio;
    if(v.preserve==="strict"||v.preserve==="natural") sd.preserve=v.preserve;
    sd.note=typeof v.note==="string" ? v.note : "";
    redrawSd();
  }
  setSelSumOpen(saved.selOpen===true);
  syncLevelUI(); syncWizUI(); syncPresetUI();
}
