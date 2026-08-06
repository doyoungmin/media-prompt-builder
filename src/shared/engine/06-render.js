/* ── 렌더링 ── */
/* 제목은 '앱 이름 + 갈래(<em>)' 로 되어 있다. 예: 영상 프롬프트 빌더 + · 텍스트에서 생성.
   한 덩어리 글자로 눌러 놓으면 좁은 화면에서 아무 데서나 접혀 "생성" 같은 조각만
   다음 줄로 떨어진다. 둘을 나눠 두고, 이름은 절대 접지 않는다. */
function splitTitle(html){
  const box=document.createElement("div");
  box.innerHTML=html;
  const em=box.querySelector("em");
  const note=em ? em.textContent.replace(/\s+/g," ").trim() : "";
  if(em) em.remove();
  return {name:box.textContent.replace(/\s+/g," ").trim(), note};
}
/* ── 세 빌더의 정체성 ──
   예전에는 주소에서 파일명을 읽어(`location.pathname`) 자기가 어느 빌더인지 알아냈다.
   Cloudflare 정적 배포는 `/x.html` 을 `/x` 로 정규화하고 루트는 `/` 라서, 어떤 키에도
   맞지 않아 아이콘·메뉴·저장소가 전부 어긋났다.
   그래서 빌드할 때 <html data-app="..."> 로 심고 그것만 본다. 주소가 어떻게 바뀌든
   흔들리지 않는다. 짧은 이름·아이콘·설명도 여기 한 줄에 모아 둔다(예전엔 맵 네 개였다). */
const APPS=[
  {id:"image", file:"/image/", icon:"i-image",
   short:"이미지",                note:"정지 이미지"},
  {id:"t2v",   file:"/t2v/", icon:"i-t2v",
   short:"영상 · 텍스트에서 생성", note:"텍스트에서 영상"},
  {id:"i2v",   file:"/i2v/", icon:"i-i2v",
   short:"영상 · 이미지에 모션",   note:"이미지에 모션"},
];
const APP_ID=document.documentElement.dataset.app||"image";
{
  const t=splitTitle(CONFIG.title);
  const nameEl=document.getElementById("appTitleText");
  nameEl.textContent=t.name;
  if(t.note){
    // 이름과 갈래를 한 묶음으로 싼다 — 캐럿이 갈래를 따라 내려가지 않게 묶음 밖에 남긴다
    const grp=document.createElement("span"); grp.id="appTitleGroup";
    nameEl.replaceWith(grp);
    const note=document.createElement("span"); note.id="appTitleNote"; note.textContent=t.note;
    grp.append(nameEl, document.createTextNode(" "), note);
  }
}
/* 앱 설명(CONFIG.sub)은 화면에서 뺐다 — 제목과 아이콘이 이미 같은 말을 한다.
   검색·공유용 <meta description> 은 엔트리 HTML 에 그대로 남아 있다. */
document.getElementById("subject").placeholder=CONFIG.subjectPlaceholder;
document.getElementById("subject").setAttribute("aria-label",CONFIG.subjectLabel);
const subjectFieldLabel=document.getElementById("subjectFieldLabel");
// 아이콘을 지우지 않도록 글자만 담는 자리에 넣는다
document.getElementById("subjectFieldText").textContent=CONFIG.shortLabel||CONFIG.subjectLabel;
if(CONFIG.subjectRequired){
  const req=document.createElement("em"); req.textContent="필수";
  subjectFieldLabel.appendChild(req);
}
/* 프롬프트 상자의 기본 안내 문구 — 막혔을 때는 이유를 대신 보여준다 */
const PROMPT_HINT=document.getElementById("prompt").placeholder;
document.getElementById("modelSwitch").innerHTML=CONFIG.models.map((m,i)=>
  `<button${i===0?' class="on"':''} data-model="${m.key}" aria-pressed="${i===0}"
     title="${m.label}">${m.shortLabel||m.label}</button>`).join("");
document.getElementById("guideTabSub").textContent=`${WIZ.length}가지만 답하면 자동 완성`;
const LOOK=CONFIG.look||{};
document.getElementById("lookTabName").textContent=LOOK.tab||"레퍼런스 룩";
document.getElementById("lookTabSub").textContent=LOOK.tabSub||"유명 스타일 한 번에";
/* 탭이 헤더 한 줄로 들어가면서 보조 설명을 화면에 펼칠 자리가 없어졌다.
   글자를 지우지는 않고(스크린리더는 읽는다) 마우스 설명으로 옮긴다. */
document.querySelectorAll(".modetab").forEach(tab=>{
  const sub=tab.querySelector("small");
  const name=tab.querySelector(".modetab-tx").firstChild.textContent.trim()
    || tab.querySelector(".modetab-tx").textContent.trim();
  tab.title = sub && sub.textContent.trim() ? `${name} — ${sub.textContent.trim()}` : name;
});
document.getElementById("lookHeading").textContent=LOOK.heading||"대표 스타일을 고르세요";
document.getElementById("lookNote").textContent=LOOK.note
  ||"카드 이미지는 각 프리셋으로 실제 생성한 예시입니다. 마우스를 올리면 구성 항목이 보입니다.";
/* 빌더 전환 — 제목을 누르면 세 빌더가 펼쳐진다.
   제목과 전환 대상이 같은 것을 가리키므로 컨트롤을 따로 두지 않는다.
   항상 세 개이고, 그중 하나가 현재 앱이다(주소가 아니라 data-app 으로 가른다). */
const builderBtn=document.getElementById("builderBtn");
const builderMenu=document.getElementById("builderMenu");
builderMenu.innerHTML=APPS.map(a=>{
  const inner=`<svg class="ic" aria-hidden="true"><use href="#${a.icon}"/></svg>`
    +`<span class="bm-name">${a.short}</span><span class="bm-note">${a.note}</span>`;
  return a.id===APP_ID
    ? `<span class="bm-item on" role="menuitem" aria-current="page">${inner}</span>`
    : `<a class="bm-item" role="menuitem" href="${a.file}">${inner}</a>`;
}).join("");

function setBuilderOpen(open){
  builderMenu.classList.toggle("open",open);
  builderBtn.setAttribute("aria-expanded",open);
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && builderMenu.classList.contains("open")){
    setBuilderOpen(false); builderBtn.focus();
  }
});

const secWrap=document.getElementById("sections");
DATA.forEach((sec,i)=>{
  const el=document.createElement("section");
  el.id="sec-"+sec.id;
  el.className = i<2 ? "open" : "";
  el.innerHTML=`
    <div class="sec-bar">
      <button class="sec-head" aria-expanded="${i<2}" aria-controls="body-${sec.id}">
        <span class="arrow">▶</span>
        <svg class="ic sec-ic" aria-hidden="true"><use href="#i-${sec.id}"/></svg>
        <span class="sec-title">${sec.title}<em>${sec.note}</em></span>
        <span class="muted-tag" id="m-${sec.id}" style="display:none">출력 제외</span>
        <span class="badge off" id="b-${sec.id}">0</span>
      </button>
      <button class="sec-scope on" data-scope="${sec.id}" id="s-${sec.id}" aria-pressed="true">
        <svg class="ic ic-on" aria-hidden="true"><use href="#i-eye"/></svg>
        <svg class="ic ic-off" aria-hidden="true"><use href="#i-eye-off"/></svg>
      </button>
    </div>
    <div class="sec-body" id="body-${sec.id}">
      <div class="scope-note" id="note-${sec.id}" style="display:none">
        이 항목은 현재 출력에 포함되지 않습니다.
        <button data-enable="${sec.id}">출력에 포함</button>
      </div>
      ${sec.groups.map(g=>{
        /* 그룹은 한 종류의 미리보기만 가진다(사진 그룹 / 도식 그룹 / 스와치 그룹).
           사진이 아닌 것 — 손으로 그린 도식, 단색 스와치 — 은 크게 볼 것이 없으므로
           변을 절반(면적 1/4)으로 줄인다. */
        const kinds=new Set(g.items.map(it=>pvKind(it[0])).filter(Boolean));
        const gridClass = kinds.size
          ? " pvgrid" + (kinds.has("photo") ? "" : " minigrid")
          : "";
        return `
        <div class="grp" data-grp="${sec.id}|${g.label}">
          <div class="grp-label">${g.label}${g.sub?`<u>${g.sub}</u>`:""}
            <i class="hidden-n" data-hn="${sec.id}|${g.label}"></i></div>
          <div class="chips${gridClass}">
            ${g.items.map(it=>`
              <button class="chip${pvOf(it[0])?" haspv":""}" data-sec="${sec.id}" data-kr="${it[0]}" aria-pressed="false"
                      data-rec="${it[3]?1:0}" data-find="${(it[0]+" "+it[1]+" "+it[2]).toLowerCase()}">
                ${pvOf(it[0])||""}
                <span class="txt"><span class="kr">${it[0]}</span>
                <span class="desc">${it[2]}</span></span>
              </button>`).join("")}
          </div>
        </div>`;}).join("")}
      <div class="empty" style="display:none">검색 결과가 없습니다.</div>
    </div>`;
  secWrap.appendChild(el);
});
document.getElementById("m-all").textContent=`전문가 ${Object.keys(lookup).length}개`;

/* 가이드 선택지의 미리보기 — 전용 예시 사진이 있으면 그것을,
   없으면 그 선택지가 적용하는 첫 항목의 SVG 도식·스와치를 재사용한다 */
function optPv(label, payload){
  if(typeof GUIDE_IMG!=="undefined" && GUIDE_IMG[label])
    return `<span class="pv ph"><img src="${GUIDE_IMG[label]}" alt="" loading="lazy"></span>`;
  for(const k of payload){ const p=pvOf(k); if(p) return p; }
  return "";
}
document.getElementById("wiz").innerHTML = WIZ.map((s,i)=>{
  const hasPv=Object.entries(s.opts).some(([o,p])=>optPv(o,p));
  return `
  <div class="wiz-step" data-step="${s.key}">
    <div class="wiz-q"><b>${"①②③④"[i]}</b>${s.q}</div>
    <div class="opts${hasPv?" pvgrid":""}">
      ${Object.entries(s.opts).map(([o,p])=>{
        const pv=optPv(o,p);
        return `<button class="opt${pv?" haspv":""}" data-wiz="${s.key}" data-opt="${o}" aria-pressed="false">`
          +pv+`<span class="txt"><span class="kr">${o}</span>`
          +((s.why&&s.why[o])?`<span class="desc">${s.why[o]}</span>`:"")
          +`</span></button>`;}).join("")}
    </div>
  </div>`;}).join("") +
  `<div class="wiz-note">답할수록 프롬프트가 자동으로 채워집니다. 답하지 않은 항목은 비워두셔도 됩니다.</div>`;

const presetWrap=document.getElementById("presets");
function presetPreview(name,payload){
  const img=(typeof PRESET_IMG!=="undefined" && PRESET_IMG[name]) || "";
  if(img) return `<img src="${img}" alt="${name} 예시" loading="lazy">`;
  const explicit=CONFIG.presetPv && CONFIG.presetPv[name];
  if(explicit){
    const p=pvOf(explicit);
    if(p) return p;
  }
  for(const item of payload){
    const p=pvOf(item);
    if(p) return p;
  }
  return "";
}
if(Object.keys(PRESETS).length===0){
  document.querySelector('[data-pane="look"]').style.display="none";
}else{
  Object.keys(PRESETS).forEach(name=>{
    const b=document.createElement("button");
    b.className="preset-card";
    const tip=PRESETS[name].join(" · ");
    const preview=presetPreview(name,PRESETS[name]);
    // title 을 두면 커스텀 툴팁과 브라우저 기본 툴팁이 같은 내용으로 겹쳐 뜬다
    b.dataset.preset=name;
    b.innerHTML=preview+`<span class="preset-name">${name}</span><small>${tip}</small>`;
    b.onclick=()=>{
      // 이미 선택된 프리셋을 다시 눌러도 의미 없는 undo 단계를 만들지 않는다.
      if(activePreset===name) return;
      pushHistory();
      replacedNotice=manualEdits && DATA.some(s=>state[s.id].size>0);
      activePreset=name;
      wizPick={}; syncWizUI(); syncPresetUI();
      lastApplied={label:name, items:PRESETS[name], why:""};
      manualEdits=false;
      applySelection(PRESETS[name]);
    };
    presetWrap.appendChild(b);
  });
}

/* 섹션 하나하나를 켜고 끄는 일은 섹션 헤더가 맡는다(조작 대상 옆).
   여기에는 여러 섹션을 한 번에 바꾸는 프리셋과, 출력 전체에 걸리는 텍스트 방지만 둔다. */
const SEC_SHORT=CONFIG.short;
document.getElementById("scope").innerHTML =
  // 제외 목록은 '출력 범위' 라벨 줄의 오른쪽 끝에 붙인다 (빠진 게 있다는 사실이 제목과 한 줄)
  `<span class="scope-lab">출력 범위<span class="scope-off" id="scopeOff"></span></span>` +
  /* 묶음은 한 번에 하나만 걸리므로 낱개 칩이 아니라 탭(세그먼트)으로 둔다.
     '텍스트 방지'는 성격이 다른 켬/끔이라 세그먼트 밖에 남긴다. */
  `<div class="seg scope-quick" role="group" aria-label="출력 범위 묶음">` +
  Object.keys(CONFIG.quick).map(k=>`<button data-quick="${k}">${k}</button>`).join("") +
  `</div>
   <button class="sc on" id="guardBtn" aria-pressed="true"
     title="프롬프트 끝에 텍스트·워터마크·카메라 UI가 화면에 그려지는 것을 막는 문구를 추가합니다"
     ><svg class="ic" aria-hidden="true"><use href="#i-no-text"/></svg>텍스트 방지</button>`;

