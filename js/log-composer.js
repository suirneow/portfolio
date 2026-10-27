(function(){
  const $ = id => document.getElementById(id);
  const draft = $('log-draft'), image = $('log-image-url'), count = $('log-char-count');
  const status = $('log-compose-status'), output = $('log-compose-output'), indexLine = $('log-index-line');
  if(!draft || !image) return;
  const storageKey = 'suimeow-log-draft-v1';
  function updateCount(){ count.textContent = String(draft.value.length) + ' / 1000'; }
  function saveDraft(){
    try { localStorage.setItem(storageKey, JSON.stringify({text:draft.value,image:image.value})); status.textContent = 'Draft saved on this device.'; }
    catch(e){ status.textContent = 'Could not save locally in this browser.'; }
  }
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if(saved){draft.value=saved.text||'';image.value=saved.image||'';} } catch(e){}
  updateCount();
  function autosave(){try{localStorage.setItem(storageKey,JSON.stringify({text:draft.value,image:image.value}));}catch(e){}}
  draft.addEventListener('input',()=>{updateCount();autosave();});
  image.addEventListener('input',autosave);
  $('log-save-draft').addEventListener('click',saveDraft);
  $('log-generate').addEventListener('click',()=>{
    const body=draft.value.trim();
    if(!body){status.textContent='Write a note first.';draft.focus();return;}
    const now=new Date();
    const pad=n=>String(n).padStart(2,'0');
    const stamp=now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'-'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds());
    const id='log-'+stamp;
    const date=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'T'+pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
    const imageUrl=image.value.trim();
    const safeBody=body.replace(/\r/g,'').split('\n').map(line=>line ? line : '').join('\n');
    const front=['---','id: '+id,'date: "'+date+'"','published: true','images:'];
    if(imageUrl) front.push('  - "'+imageUrl.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"');
    const markdown=front.concat(['---','',safeBody,'']).join('\n');
    const blob=new Blob([markdown],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=id+'.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    indexLine.value=JSON.stringify({id:id,file:now.getFullYear()+'/'+pad(now.getMonth()+1)+'/'+id+'.md',published:true},null,2);
    output.hidden=false;
    status.textContent='Markdown file generated. Put it in data/log/'+now.getFullYear()+'/'+pad(now.getMonth()+1)+'/, then add the index entry below. Commit both files to publish.';
    saveDraft();
  });
  $('log-copy-index').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(indexLine.value);status.textContent='Index entry copied. Paste it into the items array in data/log/index.json.'; }
    catch(e){indexLine.focus();indexLine.select();status.textContent='Select and copy the index entry above.';}
  });
})();
