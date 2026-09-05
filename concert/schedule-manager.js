(()=>{
  if(window.__scheduleManagerV2Loaded)return;
  window.__scheduleManagerV2Loaded=true;

  const style=document.createElement('style');
  style.textContent=`
    .dayhead{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .dayhead-main{min-width:0}.dayadd{flex:none;border:1px solid #dce6f3;background:#fff;color:#5d6a81;border-radius:10px;padding:6px 8px;font-size:10px;font-weight:900}
    .dayadd:hover{background:#f7fbff;color:#2875a4}.schedule-modal{padding:0;overflow:hidden}
    .editorhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 18px 12px;border-bottom:1px solid #edf1f7}.editorhead h3{margin:2px 0 0}
    .editor-kicker{font-size:10px;font-weight:950;letter-spacing:.12em;color:#6b9ec0}.iconbtn{width:34px;height:34px;border:1px solid var(--line);border-radius:11px;background:#fff;color:#7c879c;font-size:18px;line-height:1}
    .editorbody{padding:16px 18px 4px}.required-grid{display:grid;grid-template-columns:150px 1fr;gap:10px}.time-helper{grid-column:1/-1;margin-top:-2px}
    .time-presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.time-chip{border:1px solid #dbe5f2;background:#fafdff;color:#59677f;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:850}
    .time-chip:hover{border-color:#9ed9f8;background:#eef9ff;color:#2875a4}.sort-preview{margin-top:8px;padding:9px 10px;border-radius:11px;background:#f5f9ff;color:#62718a;font-size:11px;line-height:1.5}.sort-preview.warn{background:#fff8e8;color:#8b6814}
    .advanced{margin-top:12px;border:1px solid #e1e8f3;border-radius:14px;background:#fbfdff;overflow:hidden}.advanced summary{cursor:pointer;list-style:none;padding:11px 12px;font-size:12px;font-weight:900;color:#58657c}.advanced summary::-webkit-details-marker{display:none}.advanced summary:after{content:'＋';float:right;color:#8a96a9}.advanced[open] summary:after{content:'−'}
    .advanced-content{padding:0 12px 12px}.editor-actions{padding:12px 18px 16px;border-top:1px solid #edf1f7;margin-top:12px}.editor-actions .spacer{flex:1}.btn.danger{border-color:#f0cfd3;color:#b82c36;background:#fff8f8}.editor-help{font-size:10px;color:#8b95a8;margin-top:5px;line-height:1.45}
    @media(max-width:620px){.required-grid{grid-template-columns:1fr}.time-helper{grid-column:1}.editor-actions{flex-wrap:wrap}.editor-actions .spacer{display:none}.editor-actions .danger{margin-right:auto}}
  `;
  document.head.appendChild(style);

  const editorEl=document.getElementById('editor');
  if(!editorEl)return;
  editorEl.innerHTML=`
    <div class="modal schedule-modal">
      <div class="editorhead"><div><div class="editor-kicker" id="editorKicker">QUICK ADD</div><h3 id="editorTitle">일정 추가</h3></div><button class="iconbtn" type="button" onclick="editor.close()" aria-label="닫기">×</button></div>
      <div class="editorbody">
        <div class="required-grid">
          <label>날짜<select id="fDate"><option value="2026-09-12">9/12 토 · FIRST</option><option value="2026-09-13">9/13 일 · LAST</option><option value="2026-09-14">9/14 월 · CHECK OUT</option></select></label>
          <label>시간<input id="fTime" inputmode="text" autocomplete="off" placeholder="13:30 / 오전 / 공연 후"><div class="editor-help">숫자 시간은 저장하면 자동으로 시간순 배치돼.</div></label>
          <div class="time-helper"><div class="time-presets">
            ${['오전','도착 후','12:00','13:00','14:20','15:00','16:30','19:00','공연 후','시간 미정'].map(v=>`<button class="time-chip" type="button" data-time="${v}">${v}</button>`).join('')}
          </div><div class="sort-preview" id="scheduleSortPreview">저장하면 선택한 날짜 안에서 자동으로 시간순 정리돼.</div></div>
          <label class="full">일정명<input id="fTitle" autocomplete="off" placeholder="예: 점심 / 카페 이동 / 굿즈 수령"></label>
        </div>
        <details class="advanced" id="editorAdvanced"><summary>장소 · 이동 · 참가자 · 메모</summary><div class="advanced-content"><div class="formgrid">
          <label class="full">장소<input id="fPlace" placeholder="장소가 정해지지 않았으면 비워도 돼"></label>
          <label>이동수단<select id="fTransport"><option value="">없음 / 미정</option><option>🚗 차량</option><option>🚇 지하철</option><option>🚕 택시</option><option>🚶 도보</option></select></label>
          <label>상태<select id="fStatus"><option>확정</option><option>미정</option><option>확인 필요</option><option>완료</option></select></label>
          <label class="full">유형<select id="fType"><option value="personal">PERSONAL</option><option value="official">OFFICIAL</option></select></label>
          <div class="full"><label>참가자</label><div class="personchecks"><label><input class="fPerson" type="checkbox" value="yuji">유지</label><label><input class="fPerson" type="checkbox" value="narae">나래</label><label><input class="fPerson" type="checkbox" value="yerin">예린</label></div></div>
          <label class="full">메모<textarea id="fNote" placeholder="예약, 준비물, 확인할 내용 등을 적어줘"></textarea></label>
        </div></div></details>
      </div>
      <div class="modalactions editor-actions"><button class="btn danger hidden" id="deleteScheduleBtn" type="button">삭제</button><div class="spacer"></div><button class="btn" type="button" onclick="editor.close()">취소</button><button class="btn red" id="saveScheduleBtn" type="button">저장 · 자동 정렬</button></div>
    </div>`;

  const $=id=>document.getElementById(id);
  let editingIdLocal=null;

  window.timeSortValue=function(time){
    const t=(time||'').trim();
    const colon=t.match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)/);
    if(colon)return Number(colon[1])*60+Number(colon[2]);
    const kor=t.match(/(?:(오전|오후)\s*)?(\d{1,2})시(?:\s*(\d{1,2})분)?/);
    if(kor){let h=Number(kor[2]),m=Number(kor[3]||0);if(kor[1]==='오후'&&h<12)h+=12;if(kor[1]==='오전'&&h===12)h=0;if(h>=0&&h<=23&&m>=0&&m<=59)return h*60+m;}
    const named={'새벽':360,'아침':420,'오전':480,'도착 후':705,'점심':720,'오후':900,'저녁':1080,'공연 후':1320,'밤':1350,'시간 미정':1438,'미정':1439};
    if(Object.prototype.hasOwnProperty.call(named,t))return named[t];
    if(t.includes('공연 후'))return 1320;if(t.includes('도착 후'))return 705;if(t.includes('오전'))return 480;if(t.includes('오후'))return 900;if(t.includes('저녁'))return 1080;return 1435;
  };
  window.sortSchedules=function(){
    if(!data||!Array.isArray(data.schedules))return;
    data.schedules=data.schedules.map((item,index)=>({item,index})).sort((a,b)=>a.item.date!==b.item.date?a.item.date.localeCompare(b.item.date):(timeSortValue(a.item.time)-timeSortValue(b.item.time)||a.index-b.index)).map(x=>x.item);
  };

  function updatePreview(){
    const preview=$('scheduleSortPreview'),raw=($('fTime').value||'').trim(),date=$('fDate').value;
    if(!raw){preview.className='sort-preview';preview.textContent='시간을 입력하면 저장될 위치를 미리 보여줄게.';return;}
    const value=timeSortValue(raw),same=(data.schedules||[]).filter(x=>x.date===date&&x.id!==editingIdLocal).map((x,index)=>({x,index,v:timeSortValue(x.time)})).sort((a,b)=>a.v-b.v||a.index-b.index);
    const exact=same.filter(o=>o.v===value),before=same.filter(o=>o.v<=value).at(-1),after=same.find(o=>o.v>value);
    if(exact.length&&value<1435){preview.className='sort-preview warn';preview.textContent=`${raw} · 같은 시간 일정 ${exact.length}개 있음 → 그 뒤에 자동 배치`;}
    else if(before&&after){preview.className='sort-preview';preview.textContent=`저장 위치 · “${before.x.title}” 다음 → “${after.x.title}” 앞`;}
    else if(after){preview.className='sort-preview';preview.textContent=`저장 위치 · 이 날짜의 첫 일정 → “${after.x.title}” 앞`;}
    else if(before){preview.className='sort-preview';preview.textContent=`저장 위치 · “${before.x.title}” 다음`;}
    else{preview.className='sort-preview';preview.textContent='이 날짜의 첫 일정으로 저장돼.';}
  }

  function resetForm(date='2026-09-12'){
    editingIdLocal=null;$('editorKicker').textContent='QUICK ADD';$('editorTitle').textContent='일정 추가';$('fDate').value=date;$('fTime').value='';$('fTitle').value='';$('fPlace').value='';$('fTransport').value='';$('fType').value='personal';$('fStatus').value='미정';$('fNote').value='';document.querySelectorAll('.fPerson').forEach(c=>c.checked=true);$('editorAdvanced').open=false;$('deleteScheduleBtn').classList.add('hidden');updatePreview();
  }
  window.openAdd=function(){resetForm('2026-09-12');editorEl.showModal();setTimeout(()=>$('fTime').focus(),40);};
  window.openAddForDate=function(date){resetForm(date);editorEl.showModal();setTimeout(()=>$('fTime').focus(),40);};
  window.editItem=function(id){
    const it=data.schedules.find(x=>x.id===id);if(!it)return;editingIdLocal=id;$('editorKicker').textContent='EDIT SCHEDULE';$('editorTitle').textContent='일정 편집';$('fDate').value=it.date;$('fTime').value=it.time;$('fTitle').value=it.title;$('fPlace').value=it.place||'';$('fTransport').value=it.transport||'';$('fType').value=it.type||'personal';$('fStatus').value=it.status||'미정';$('fNote').value=it.note||'';document.querySelectorAll('.fPerson').forEach(c=>c.checked=(it.people||[]).includes(c.value));$('editorAdvanced').open=Boolean(it.place||it.transport||it.note||it.type==='official'||it.status==='확인 필요');$('deleteScheduleBtn').classList.remove('hidden');updatePreview();editorEl.showModal();
  };
  window.saveEditor=function(){
    const obj={id:editingIdLocal||uid(),date:$('fDate').value,time:$('fTime').value.trim()||'시간 미정',title:$('fTitle').value.trim(),place:$('fPlace').value.trim(),transport:$('fTransport').value,type:$('fType').value,status:$('fStatus').value,people:[...document.querySelectorAll('.fPerson:checked')].map(c=>c.value),note:$('fNote').value.trim()};
    if(!obj.title){alert('일정명을 입력해줘.');return;}if(editingIdLocal){const i=data.schedules.findIndex(x=>x.id===editingIdLocal);data.schedules[i]=obj;}else data.schedules.push(obj);sortSchedules();try{save();}catch(e){}render();editorEl.close();
  };
  window.sortAllSchedules=function(){sortSchedules();try{save();}catch(e){}render();const saved=$('saved');if(saved)saved.textContent='시간순 정리 완료 ✓';};

  window.renderOverview=function(){
    const root=$('overview');
    root.innerHTML=days.map(([date,label,desc,cls])=>{const items=data.schedules.filter(x=>x.date===date&&matchesPerson(x));return `<section class="day"><div class="dayhead ${cls}"><div class="dayhead-main"><div class="date">${label}</div><div class="desc">${desc} · 일정 ${items.length}개</div></div><button class="dayadd" type="button" onclick="event.stopPropagation();openAddForDate('${date}')">＋ 추가</button></div><div class="list">${items.map(it=>{const names=(it.people||[]).map(p=>peopleName[p]).join(' · '),statusText=it.status==='확인 필요'?' · 확인 필요':'',conflictText=conflict(it)?' · ⚠ 충돌':'';return `<article class="event ${it.type==='official'?'official':''} ${isVip(it)?'vip':''} ${conflict(it)?'conflict':''}" onclick="editItem('${it.id}')" title="눌러서 수정"><div class="time">${esc(it.time)}</div><div class="content"><div class="title">${esc(it.title)}</div><div class="chips">${names?`<span class="chip ${isVip(it)?'vip':''}">${esc(names)}</span>`:''}${statusText?`<span class="chip warn">${esc(statusText.replace(' · ',''))}</span>`:''}${conflictText?`<span class="chip warn">${esc(conflictText.replace(' · ',''))}</span>`:''}</div></div></article>`;}).join('')||'<div style="padding:18px;color:#939bad;text-align:center;font-size:12px">표시할 일정 없음</div>'}</div></section>`;}).join('');
  };

  const controls=document.querySelector('.controls');
  if(controls&&!document.getElementById('sortScheduleBtn')){const b=document.createElement('button');b.id='sortScheduleBtn';b.className='btn';b.type='button';b.textContent='↕ 시간순 정리';b.onclick=sortAllSchedules;const reset=[...controls.querySelectorAll('button')].find(x=>x.textContent.includes('기본값 복원'));controls.insertBefore(b,reset||$('saved'));}

  editorEl.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{$('fTime').value=b.dataset.time;updatePreview();if(!$('fTitle').value)$('fTitle').focus();}));
  $('fDate').addEventListener('change',updatePreview);$('fTime').addEventListener('input',updatePreview);$('fTitle').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();saveEditor();}});$('saveScheduleBtn').onclick=()=>window.saveEditor();$('deleteScheduleBtn').onclick=()=>{if(!editingIdLocal)return;const it=data.schedules.find(x=>x.id===editingIdLocal);if(!it||!confirm(`“${it.title}” 일정을 삭제할까?`))return;data.schedules=data.schedules.filter(x=>x.id!==editingIdLocal);sortSchedules();try{save();}catch(e){}render();editorEl.close();};

  sortSchedules();render();
})();