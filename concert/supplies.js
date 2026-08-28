(()=>{
  const style=document.createElement('style');
  style.textContent='.checkitem input{flex:none}.checkitem .checktext{flex:1;min-width:0;word-break:break-word}.checkdelete{flex:none;border:0;background:transparent;color:#a2a9b8;width:26px;height:26px;border-radius:8px;padding:0;font-size:15px;font-weight:800}.checkdelete:hover{background:#fff0f2;color:#c92b38}.check-head-actions{display:flex;align-items:center;gap:8px}';
  document.head.appendChild(style);

  const checkSection=document.getElementById('checkView');
  const head=checkSection&&checkSection.querySelector('.section-head');
  if(head) head.innerHTML='<div><h2>체크리스트</h2><p>준비물 추가 · 체크 상태 모두 공용 자동 저장</p></div><div class="check-head-actions"><button class="btn primary" type="button" onclick="openSupplyEditor()">＋ 준비물 추가</button></div>';

  if(!document.getElementById('supplyDialog')) document.body.insertAdjacentHTML('beforeend','<dialog id="supplyDialog"><div class="modal"><h3>준비물 추가</h3><div class="formgrid"><label>분류<select id="supplyCategory"></select></label><label class="full">준비물<input id="supplyName" placeholder="예: 우비, 슬로건, 여분 렌즈"></label></div><div class="modalactions"><button class="btn" type="button" onclick="supplyDialog.close()">취소</button><button class="btn red" type="button" onclick="addSupply()">추가</button></div></div></dialog>');

  function ensureChecklistData(){
    if(!data.checklist||typeof data.checklist!=='object') data.checklist=clone(defaultData.checklist);
    if(!data.checked||typeof data.checked!=='object') data.checked={};
    if(!Array.isArray(data.customChecklist)) data.customChecklist=[];
  }
  function isCustomSupply(cat,item){ensureChecklistData();return data.customChecklist.some(x=>x.cat===cat&&x.item===item)}

  window.toggleCheckDecoded=function(cat,item,v){cat=decodeURIComponent(cat);item=decodeURIComponent(item);data.checked[cat+'::'+item]=v;save()};
  window.openSupplyEditor=function(){ensureChecklistData();supplyCategory.innerHTML=Object.keys(data.checklist).map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join('');supplyName.value='';supplyDialog.showModal();setTimeout(()=>supplyName.focus(),50)};
  window.addSupply=function(){ensureChecklistData();const cat=supplyCategory.value,item=supplyName.value.trim();if(!item){supplyName.focus();return}if(!data.checklist[cat])data.checklist[cat]=[];if(data.checklist[cat].some(x=>x.trim().toLowerCase()===item.toLowerCase())){alert('이미 같은 준비물이 있어.');return}data.checklist[cat].push(item);data.customChecklist.push({cat,item});save();renderChecklist();supplyDialog.close()};
  window.removeSupply=function(cat,item){cat=decodeURIComponent(cat);item=decodeURIComponent(item);if(!isCustomSupply(cat,item))return;if(!confirm('"'+item+'" 준비물을 삭제할까?'))return;data.checklist[cat]=(data.checklist[cat]||[]).filter(x=>x!==item);data.customChecklist=data.customChecklist.filter(x=>!(x.cat===cat&&x.item===item));delete data.checked[cat+'::'+item];save();renderChecklist()};

  renderChecklist=function(){
    ensureChecklistData();
    const root=document.getElementById('checkgrid');
    root.innerHTML=Object.entries(data.checklist).map(([cat,items])=>'<div class="checkcard"><h4>'+esc(cat)+'</h4>'+items.map(item=>{const k=cat+'::'+item,ec=encodeURIComponent(cat),ei=encodeURIComponent(item),del=isCustomSupply(cat,item)?'<button class="checkdelete" type="button" aria-label="삭제" title="추가한 준비물 삭제" onclick="event.preventDefault();event.stopPropagation();removeSupply(\''+ec+'\',\''+ei+'\')">×</button>':'';return '<label class="checkitem"><input type="checkbox" '+(data.checked[k]?'checked':'')+' onchange="toggleCheckDecoded(\''+ec+'\',\''+ei+'\',this.checked)"><span class="checktext">'+esc(item)+'</span>'+del+'</label>'}).join('')+'</div>').join('');
  };

  if(typeof closeDialogOnBackdrop==='function')closeDialogOnBackdrop(supplyDialog);
  supplyName.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addSupply()}});
  renderChecklist();
})();