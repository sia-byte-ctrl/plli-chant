(()=>{
  if(window.__concertChecklistPack20260909)return;
  window.__concertChecklistPack20260909=true;

  const PACK={
    "필수 · 콘서트":[
      "콘서트 티켓","신분증","멤버십 카드","플리 여권","티켓 케이스","슬로건 케이스","가방 보관 지퍼백","아봉","여분 건전지","보조배터리","충전기","휴대폰","스밍폰","이어폰","지갑","포카","인형","나눔물품","목캔디","벌레 기피제","얇은 방석","피로회복제"
    ],
    "현장 · 건강":[
      "보조가방","모자","양우산","손풍기","선글라스","마스크","쿨패치","쿨링타올","복용중인 약","상비약","반창고","여성용품","지퍼백","비닐봉지","포켓 휴지","물티슈","생수","이온음료","간식","얇은 겉옷","손수건"
    ],
    "숙박 · 세면":[
      "샴푸","트리트먼트","린스","립앤아이리무버","클렌징오일","클렌징폼","치약","칫솔","치실","구강청결제","비누","바디워시","샤워타올","수건","마스크팩","머리끈","헤어집게","잠옷","속옷","여벌옷","양말"
    ],
    "개인 · 뷰티":[
      "스킨","로션","선크림","선스틱","립밤","헤어에센스","바디로션","빗","면봉","화장품","향수","헤어롤","드라이기","고데기","안경","일회용 렌즈","렌즈 세척액","인공눈물","체력","예의","배려하는 마음"
    ]
  };

  const CATEGORY_MAP={
    "티켓":"필수 · 콘서트",
    "공연":"현장 · 건강",
    "숙박":"숙박 · 세면",
    "개인":"개인 · 뷰티"
  };

  const ALIASES={
    "콘서트 티켓":["공연 티켓"],
    "멤버십 카드":["PLLI 멤버십"],
    "아봉":["응원봉"],
    "여분 건전지":["응원봉 배터리"],
    "생수":["물"],
    "일회용 렌즈":["렌즈"],
    "여벌옷":["옷"]
  };

  const clonePack=()=>Object.fromEntries(Object.entries(PACK).map(([k,v])=>[k,[...v]]));

  function checkedItemNames(checked){
    const set=new Set();
    Object.entries(checked||{}).forEach(([key,value])=>{
      if(!value)return;
      const pos=key.indexOf("::");
      if(pos>=0)set.add(key.slice(pos+2));
    });
    return set;
  }

  function normalizeCustom(custom){
    const out=[];
    const seen=new Set();
    (Array.isArray(custom)?custom:[]).forEach(x=>{
      if(!x||!x.item)return;
      const cat=CATEGORY_MAP[x.cat]||x.cat||"개인 · 뷰티";
      const item=String(x.item).trim();
      if(!item)return;
      if((PACK[cat]||[]).includes(item))return;
      const key=cat+"::"+item;
      if(seen.has(key))return;
      seen.add(key);
      out.push({cat,item});
    });
    return out;
  }

  function makeChecked(oldChecked,newChecklist){
    const oldNames=checkedItemNames(oldChecked);
    const next={};
    Object.entries(newChecklist).forEach(([cat,items])=>{
      items.forEach(item=>{
        const sources=[item,...(ALIASES[item]||[])];
        if(sources.some(name=>oldNames.has(name)))next[cat+"::"+item]=true;
      });
    });
    return next;
  }

  function migrate(target,isDefault=false){
    if(!target||typeof target!=="object")return false;
    const before=JSON.stringify({checklist:target.checklist,checked:target.checked,customChecklist:target.customChecklist});
    const custom=isDefault?[]:normalizeCustom(target.customChecklist);
    const checklist=clonePack();
    custom.forEach(({cat,item})=>{
      if(!checklist[cat])checklist[cat]=[];
      if(!checklist[cat].includes(item))checklist[cat].push(item);
    });
    const checked=isDefault?{}:makeChecked(target.checked,checklist);
    target.checklist=checklist;
    target.customChecklist=custom;
    if(!isDefault)target.checked=checked;
    const after=JSON.stringify({checklist:target.checklist,checked:target.checked,customChecklist:target.customChecklist});
    return before!==after;
  }

  try{ migrate(defaultData,true); }catch(e){ console.error("checklist default migration failed",e); }

  const baseRenderChecklist=typeof renderChecklist==="function"?renderChecklist:null;
  if(baseRenderChecklist){
    renderChecklist=function(){
      let changed=false;
      try{ changed=migrate(data,false); }catch(e){ console.error("checklist migration failed",e); }
      baseRenderChecklist();
      if(changed){
        try{ save(); }catch(e){}
      }
    };
  }

  function applyNow(){
    try{
      const changed=migrate(data,false);
      if(typeof renderChecklist==="function")renderChecklist();
      if(changed){ try{save();}catch(e){} }
    }catch(e){ console.error("checklist pack apply failed",e); }
  }

  applyNow();
  setTimeout(applyNow,700);
  setTimeout(applyNow,2200);
})();