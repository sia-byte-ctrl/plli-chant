(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .check-head-actions{display:flex;align-items:center;gap:8px}
    .checkitem{display:flex;align-items:center;gap:7px}
    .checkitem input{flex:none}
    .checktext{flex:1;min-width:0;word-break:break-word}
    .checkdelete{flex:none;border:0;background:transparent;color:#a2a9b8;width:26px;height:26px;border-radius:8px;padding:0;font-size:15px;font-weight:800}
    .checkdelete:hover{background:#fff0f2;color:#c92b38}
  `;
  document.head.appendChild(style);

  const checkSection=document.getElementById('checkView');
  const head=checkSection?.querySelector('.section-head');
  if(head){
    head.innerHTML='';
    const left=document.createElement('div');
    left.innerHTML='<h2>체크리스트</h2><p>준비물 추가 · 체크 상태 모두 공용 자동 저장</p>';
    const right=document.createElement('div');
    right.className='check-head-actions';
    const addBtn=document.createElement('button');
    addBtn.className='btn primary';
    addBtn.type='button';
    addBtn.textContent='＋ 준비물 추가';
    right.appendChild(addBtn);
    head.append(left,right);
    addBtn.addEventListener('click',openSupplyEditor);
  }

  let dialog=document.getElementById('supplyDialog');
  if(!dialog){
    dialog=document.createElement('dialog');
    dialog.id='supplyDialog';
    dialog.innerHTML=`<div class="modal"><h3>준비물 추가</h3><div class="formgrid"><label>분류<select id="supplyCategory"></select></label><label class="full">준비물<input id="supplyName" placeholder="예: 우비, 슬로건, 여분 렌즈"></label></div><div class="modalactions"><button class="btn" type="button" id="supplyCancel">취소</button><button class="btn red" type="button" id="supplyAdd">추가</button></div></div>`;
    document.body.appendChild(dialog);
  }

  const category=dialog.querySelector('#supplyCategory');
  const nameInput=dialog.querySelector('#supplyName');
  dialog.querySelector('#supplyCancel').addEventListener('click',()=>dialog.close());
  dialog.querySelector('#supplyAdd').addEventListener('click',addSupply);
  nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addSupply();}});
  if(typeof closeDialogOnBackdrop==='function') closeDialogOnBackdrop(dialog);

  function ensure(){
    if(!data.checklist||typeof data.checklist!=='object') data.checklist=clone(defaultData.checklist);
    if(!data.checked||typeof data.checked!=='object') data.checked={};
    if(!Array.isArray(data.customChecklist)) data.customChecklist=[];
  }
  function isCustom(cat,item){
    ensure();
    return data.customChecklist.some(x=>x.cat===cat&&x.item===item);
  }
  function openSupplyEditor(){
    ensure();
    category.innerHTML='';
    Object.keys(data.checklist).forEach(cat=>{
      const o=document.createElement('option');
      o.value=cat;
      o.textContent=cat;
      category.appendChild(o);
    });
    nameInput.value='';
    dialog.showModal();
    setTimeout(()=>nameInput.focus(),30);
  }
  function addSupply(){
    ensure();
    const cat=category.value;
    const item=nameInput.value.trim();
    if(!item){nameInput.focus();return;}
    if(data.checklist[cat].some(x=>x.trim().toLowerCase()===item.toLowerCase())){
      alert('이미 같은 준비물이 있어.');
      return;
    }
    data.checklist[cat].push(item);
    data.customChecklist.push({cat,item});
    save();
    renderChecklist();
    dialog.close();
  }
  function removeSupply(cat,item){
    if(!isCustom(cat,item)) return;
    if(!confirm(`"${item}" 준비물을 삭제할까?`)) return;
    data.checklist[cat]=data.checklist[cat].filter(x=>x!==item);
    data.customChecklist=data.customChecklist.filter(x=>!(x.cat===cat&&x.item===item));
    delete data.checked[cat+'::'+item];
    save();
    renderChecklist();
  }

  window.openSupplyEditor=openSupplyEditor;
  window.addSupply=addSupply;
  window.removeSupply=removeSupply;

  window.renderChecklist=function(){
    ensure();
    const root=document.getElementById('checkgrid');
    root.innerHTML='';
    Object.entries(data.checklist).forEach(([cat,items])=>{
      const card=document.createElement('div');
      card.className='checkcard';
      const h=document.createElement('h4');
      h.textContent=cat;
      card.appendChild(h);
      items.forEach(item=>{
        const row=document.createElement('label');
        row.className='checkitem';
        const cb=document.createElement('input');
        cb.type='checkbox';
        cb.checked=!!data.checked[cat+'::'+item];
        cb.addEventListener('change',()=>{
          data.checked[cat+'::'+item]=cb.checked;
          save();
        });
        const text=document.createElement('span');
        text.className='checktext';
        text.textContent=item;
        row.append(cb,text);
        if(isCustom(cat,item)){
          const del=document.createElement('button');
          del.type='button';
          del.className='checkdelete';
          del.textContent='×';
          del.title='추가한 준비물 삭제';
          del.addEventListener('click',e=>{
            e.preventDefault();
            e.stopPropagation();
            removeSupply(cat,item);
          });
          row.appendChild(del);
        }
        card.appendChild(row);
      });
      root.appendChild(card);
    });
  };

  renderChecklist();
})();