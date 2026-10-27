(function(){
  const $=s=>document.querySelector(s);
  const text=(tag,value,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=value==null?"":String(value);return e;};
  const list=v=>Array.isArray(v)?v.filter(Boolean):[];
  const published=async section=>Site.indexed(section);
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function workCard(item){
    const card=document.createElement("article");card.className="work-item";
    const a=document.createElement("a");a.className="work-thumb";a.href="work.html?id="+encodeURIComponent(item.id);a.setAttribute("aria-label",item.title||"Untitled work");
    const src=item.thumbnail && item.thumbnail.src,alt=item.thumbnail && item.thumbnail.alt;
    a.appendChild(Site.image(src,alt,"thumb-inner"));card.appendChild(a);
    const meta=document.createElement("div");meta.className="work-meta";
    meta.appendChild(text("span",item.title||"Untitled", "work-title"));meta.appendChild(text("span",item.year||"", "work-year"));card.appendChild(meta);
    return card;
  }
  async function renderWorkIndex(){
    const grid=$("#work-grid"),filters=$("#genre-filters"),empty=$("#empty-state"),count=$("#work-count");
    try{
      const items=await published("work");
      items.sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0)||String(b.date||"").localeCompare(String(a.date||"")));
      const genres=[...new Set(items.flatMap(x=>list(x.genre)))].sort();
      let active="All";
      function paint(){
        grid.replaceChildren();
        const shown=active==="All"?items:items.filter(x=>list(x.genre).includes(active));
        shown.forEach(x=>grid.appendChild(workCard(x)));
        empty.hidden=shown.length>0;
        count.textContent=" / "+shown.length;
        filters.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.genre===active)));
      }
      filters.replaceChildren();
      ["All",...genres].forEach(g=>{
        const b=text("button",g,"filter-button");b.type="button";b.dataset.genre=g;b.setAttribute("aria-pressed",String(g==="All"));
        b.addEventListener("click",()=>{active=g;paint();});filters.appendChild(b);
      });
      paint();
    }catch(err){grid.replaceChildren(text("p","Could not load work index. Check the data/work/index.json path.","error-note"));console.error(err);}
  }
  function mediaNode(m){
    if(!m)return document.createElement("span");
    if(m.type==="video"||m.type==="mp4"||m.type==="youtube"||m.type==="vimeo")return Site.videoNode(m.src||m.url);
    return Site.image(m.src||m.url,m.alt||"","detail-image");
  }
  function captionLines(item){
    const c=item.caption||{},out=[];
    if(c.screen)out.push("Screen: "+c.screen);
    list(c.technique).forEach(x=>out.push(x));
    if(list(c.software).length)out.push("Software: "+list(c.software).join(", "));
    return out;
  }
  async function renderWorkDetail(){
    const root=$("#work-detail"),id=Site.queryId();
    try{
      const items=await published("work");
      const item=items.find(x=>x.id===id);
      if(!item){root.replaceChildren(text("p","This work is unavailable.","error-note"));return;}
      document.title=(item.title||"Work")+" — SHUNTO TAKAYA";
      const all=items.slice().sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0));
      const idx=all.findIndex(x=>x.id===item.id);
      const layout=item.detail&&item.detail.layout||"full";
      const detailMedia=list(item.detail&&item.detail.media);
      const heroMedia=detailMedia[0];
      const heroSrc=heroMedia&&heroMedia.src || (item.thumbnail&&item.thumbnail.src);
      const heroAlt=heroMedia&&heroMedia.alt || (item.thumbnail&&item.thumbnail.alt)||item.title||"";
      if(layout==="spread"){
        const spread=document.createElement("section");spread.className="spread-layout";
        const left=document.createElement("div");left.className="spread-primary";
        left.appendChild(Site.image(item.thumbnail&&item.thumbnail.src,heroAlt,"spread-image"));
        left.appendChild(text("h1",item.title||"","detail-title"));
        if(item.description)left.appendChild(text("p",item.description,"description"));
        const meta=text("div",captionLines(item).join(" / "),"meta-list");left.appendChild(meta);
        const right=document.createElement("div");right.className="spread-process";
        if(list(item.process).length){right.appendChild(text("h2","(Design Process)"));const pl=document.createElement("div");pl.className="process-list";list(item.process).forEach(p=>{const row=document.createElement("div");row.className="process-item";if(p.src)row.appendChild(Site.image(p.src,p.alt||"","process-image"));if(p.text)row.appendChild(text("p",p.text));pl.appendChild(row);});right.appendChild(pl);}
        spread.append(left,right);root.replaceChildren(spread);
      }else{
        const hero=document.createElement("section");hero.className="work-detail-hero";
        if(heroMedia&&heroMedia.type&&heroMedia.type!=="image")hero.appendChild(Site.videoNode(heroMedia.src));
        else hero.appendChild(Site.image(heroSrc,heroAlt,"hero-image"));
        const captions=document.createElement("div");captions.className="detail-captions";
        captions.appendChild(text("div",captionLines(item).join(" / "),"detail-caption-en"));
        captions.appendChild(text("div",item.description||"","detail-description"));
        hero.appendChild(captions);root.replaceChildren(hero);
        if(detailMedia.length>1 || list(item.process).length){
          const content=document.createElement("section");content.className="detail-content";
          if(detailMedia.length>1){const gallery=document.createElement("div");gallery.className="detail-media-grid";detailMedia.slice(1).forEach(m=>gallery.appendChild(mediaNode(m)));content.appendChild(gallery);}
          if(list(item.process).length){content.appendChild(text("h2","(Design Process)"));const pl=document.createElement("div");pl.className="process-list";list(item.process).forEach(p=>{const row=document.createElement("div");row.className="process-item";if(p.src)row.appendChild(Site.image(p.src,p.alt||"","process-image"));if(p.text)row.appendChild(text("p",p.text));pl.appendChild(row);});content.appendChild(pl);}
          root.appendChild(content);
        }
      }
      const nav=document.createElement("nav");nav.className="detail-navigation";nav.setAttribute("aria-label","Work navigation");
      const prev=all[idx+1],next=all[idx-1];
      const left=prev?Object.assign(document.createElement("a"),{href:"work.html?id="+encodeURIComponent(prev.id),textContent:"← "+(prev.title||"Previous")}):text("span","");
      const center=Object.assign(document.createElement("a"),{href:"index.html",textContent:"All work"});
      const right=next?Object.assign(document.createElement("a"),{href:"work.html?id="+encodeURIComponent(next.id),textContent:(next.title||"Next")+" →"}):text("span","");
      nav.append(left,center,right);root.appendChild(nav);
    }catch(err){root.replaceChildren(text("p","Could not load this work.","error-note"));console.error(err);}
  }
  function articleRow(item){
    const row=document.createElement("a");row.className="article-row";row.href="writing.html?id="+encodeURIComponent(item.id);
    row.appendChild(text("span",item.meta.date||"","article-date"));
    row.appendChild(text("span",item.meta.title||item.id||"Untitled","article-title"));
    if(item.meta.thumbnail){const im=Site.image(item.meta.thumbnail,"","article-thumb");row.appendChild(im.querySelector("img")||im);}
    else row.appendChild(text("span","","article-date"));
    return row;
  }
  async function renderWriting(){
    const root=$("#writing-root"),id=Site.queryId();
    try{
      const items=await published("writing");
      items.sort((a,b)=>String(b.meta.date||"").localeCompare(String(a.meta.date||"")));
      if(id){
        const item=items.find(x=>x.id===id);
        if(!item){root.replaceChildren(text("p","This article is unavailable.","error-note"));return;}
        const article=document.createElement("article");article.className="article-detail";
        article.appendChild(text("div",item.meta.date||"","article-date"));
        article.appendChild(text("h1",item.meta.title||"Untitled"));
        if(item.meta.tags&&item.meta.tags.length){article.appendChild(text("div",item.meta.tags.join(" / "),"tag-list"));}
        const body=document.createElement("div");body.className="article-body";body.innerHTML=Site.renderMarkdown(item.content);article.appendChild(body);root.replaceChildren(article);
        document.title=(item.meta.title||"Writing")+" — SHUNTO TAKAYA";
      }else{
        const listEl=document.createElement("div");listEl.className="article-list";
        items.forEach(item=>listEl.appendChild(articleRow(item)));
        root.replaceChildren(listEl);
        if(!items.length)root.appendChild(text("p","No published writing.","empty-state"));
      }
    }catch(err){root.replaceChildren(text("p","Could not load writing.","error-note"));console.error(err);}
  }
  function logEntry(item){
    const entry=document.createElement("article");entry.className="log-entry";entry.id=item.id;
    const date=text("time",item.meta.date||"","log-date");if(item.meta.date)date.dateTime=item.meta.date;entry.appendChild(date);
    const body=document.createElement("div");body.className="log-body";body.innerHTML=Site.renderMarkdown(item.content);entry.appendChild(body);
    const imgs=list(item.meta.images);
    if(imgs.length){const gallery=document.createElement("div");gallery.className="log-images";imgs.slice(0,4).forEach(src=>gallery.appendChild(Site.image(src,"","log-image")));entry.appendChild(gallery);}
    if(item.meta.video){entry.appendChild(Site.videoNode(item.meta.video));}
    const link=text("a","Permalink","log-actions");link.href="log.html?id="+encodeURIComponent(item.id);entry.appendChild(link);
    return entry;
  }
  async function renderLog(){
    const root=$("#log-root"),id=Site.queryId();
    try{
      const items=await published("log");
      items.sort((a,b)=>String(b.meta.date||"").localeCompare(String(a.meta.date||"")));
      if(id){
        const item=items.find(x=>x.id===id);
        if(!item){root.replaceChildren(text("p","This note is unavailable.","error-note"));return;}
        const listEl=document.createElement("div");listEl.className="log-list";listEl.appendChild(logEntry(item));root.replaceChildren(listEl);document.title="Log — SHUNTO TAKAYA";return;
      }
      const listEl=document.createElement("div");listEl.className="log-list";let shown=0;const step=20;
      function appendNext(){items.slice(shown,shown+step).forEach(item=>listEl.appendChild(logEntry(item)));shown=Math.min(shown+step,items.length);if(shown>=items.length&&more)more.hidden=true;}
      items.slice(0,step).forEach(item=>listEl.appendChild(logEntry(item)));shown=Math.min(step,items.length);
      root.replaceChildren(listEl);
      const more=document.createElement("button");more.className="load-more";more.textContent="Load more";more.hidden=shown>=items.length;more.addEventListener("click",appendNext);root.appendChild(more);
      if(!items.length)root.appendChild(text("p","No published notes.","empty-state"));
    }catch(err){root.replaceChildren(text("p","Could not load log.","error-note"));console.error(err);}
  }
  async function renderInfo(){
    const root=$("#info-root");
    try{
      const p=await Site.getJSON("info/profile.json");root.replaceChildren();
      if(p.profile)root.appendChild(text("p",p.profile));
      const sections=[["Education",p.education],["Career",p.career],["Tools",p.tools]];
      sections.forEach(([label,values])=>{if(!Array.isArray(values)||!values.length)return;const sec=document.createElement("section");sec.className="info-section";sec.appendChild(text("h2",label));const ul=document.createElement("ul");values.forEach(v=>ul.appendChild(text("li",typeof v==="string"?v:(v.label||v.name||""))));sec.appendChild(ul);root.appendChild(sec);});
      if(!p.profile&&!p.education?.length&&!p.career?.length&&!p.tools?.length)root.appendChild(text("p","Profile content has not been added yet.","empty-state"));
    }catch(err){root.replaceChildren(text("p","Could not load profile.","error-note"));}
  }
  async function renderContact(){
    const root=$("#contact-root");
    try{
      const p=await Site.getJSON("info/profile.json");root.replaceChildren();
      if(p.email){const sec=document.createElement("section");sec.className="info-section";sec.appendChild(text("h2","Email"));const a=text("a",p.email);a.href="mailto:"+p.email;sec.appendChild(a);root.appendChild(sec);}
      if(Array.isArray(p.socials)&&p.socials.length){const sec=document.createElement("section");sec.className="info-section";sec.appendChild(text("h2","Elsewhere"));const ul=document.createElement("ul");p.socials.forEach(s=>{const li=document.createElement("li");const a=text("a",s.label||s.url);a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";li.appendChild(a);ul.appendChild(li);});sec.appendChild(ul);root.appendChild(sec);}
      if(!p.email&&!p.socials?.length)root.appendChild(text("p","Contact details have not been added yet.","empty-state"));
    }catch(err){root.replaceChildren(text("p","Could not load contact information.","error-note"));}
  }
  async function renderSandbox(){
    const root=$("#sandbox-root");
    try{
      const items=await published("sandbox");const grid=document.createElement("div");grid.className="sandbox-grid";
      items.forEach(item=>{const card=document.createElement("article");card.className="sandbox-item";card.appendChild(Site.image(item.thumbnail&&item.thumbnail.src,item.thumbnail&&item.thumbnail.alt));card.appendChild(text("h2",item.title||"Untitled"));if(item.description)card.appendChild(text("p",item.description));if(item.media&&item.media.length)item.media.forEach(m=>card.appendChild(mediaNode(m)));grid.appendChild(card);});
      root.replaceChildren(grid);if(!items.length)root.appendChild(text("p","No published experiments.","empty-state"));
    }catch(err){root.replaceChildren(text("p","Could not load sandbox.","error-note"));}
  }
  window.Site=Object.assign(window.Site||{},{renderWorkIndex,renderWorkDetail,renderWriting,renderLog,renderInfo,renderContact,renderSandbox});
})();