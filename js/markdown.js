(function(){
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  function safeUrl(url){
    const u=String(url||"").trim();
    if(/^(javascript|vbscript|file):/i.test(u)) return "#";
    return u;
  }
  function inline(s){
    let out=esc(s);
    out=out.replace(/`([^`]+)`/g,"<code>$1</code>");
    out=out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>'<img loading="lazy" alt="'+alt+'" src="'+esc(safeUrl(url))+'">');
    out=out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,(_,label,url)=>'<a href="'+esc(safeUrl(url))+'" target="_blank" rel="noopener noreferrer">'+label+'</a>');
    out=out.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
    return out;
  }
  function renderMarkdown(md){
    const lines=String(md||"").replace(/\r/g,"").split("\n");
    let out="", para=[], list=null, inCode=false, code=[], quote=[];
    const flushPara=()=>{if(para.length){out+="<p>"+inline(para.join("\n")).replace(/\n/g,"<br>")+"</p>";para=[];}};
    const flushList=()=>{if(list){out+="<"+list+">"+listItems.map(x=>"<li>"+inline(x)+"</li>").join("")+"</"+list+">";list=null;listItems=[];}};
    const flushQuote=()=>{if(quote.length){out+="<blockquote><p>"+quote.map(inline).join("<br>")+"</p></blockquote>";quote=[];}};
    let listItems=[];
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(line.trim().startsWith("```")){
        flushPara();flushList();flushQuote();
        if(inCode){out+="<pre><code>"+esc(code.join("\n"))+"</code></pre>";code=[];inCode=false;}
        else inCode=true;
        continue;
      }
      if(inCode){code.push(line);continue;}
      if(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(line.trim())){
        flushPara();flushList();flushQuote();
        const url=line.trim(); let id="",src="";
        const y=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
        const v=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if(y)src="https://www.youtube-nocookie.com/embed/"+y[1];else if(v)src="https://player.vimeo.com/video/"+v[1];
        if(src)out+='<iframe class="video-frame" src="'+src+'" title="Embedded video" loading="lazy" allowfullscreen></iframe>';
        else out+='<p><a href="'+esc(url)+'">'+esc(url)+'</a></p>';
        continue;
      }
      const hm=line.match(/^(#{1,3})\s+(.+)$/);
      if(hm){flushPara();flushList();flushQuote();const n=hm[1].length;out+="<h"+n+">"+inline(hm[2])+"</h"+n+">";continue;}
      if(/^\s*>\s?/.test(line)){flushPara();flushList();quote.push(line.replace(/^\s*>\s?/,""));continue;}else flushQuote();
      const lm=line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
      if(lm){flushPara();const type=/^\d/.test(lm[1])?"ol":"ul";if(list!==type){flushList();list=type;listItems=[];}listItems.push(lm[2]);continue;}else flushList();
      const tm=line.match(/^\|(.+)\|$/);
      if(tm && i+1<lines.length && /^\|[\s:|-]+\|$/.test(lines[i+1])){
        flushPara();flushQuote();const headers=tm[1].split("|").map(x=>x.trim());i+=1;let rows=[];
        while(i+1<lines.length && /^\|.*\|$/.test(lines[i+1])){i++;rows.push(lines[i].slice(1,-1).split("|").map(x=>x.trim()));}
        out+="<table><thead><tr>"+headers.map(x=>"<th>"+inline(x)+"</th>").join("")+"</tr></thead><tbody>"+rows.map(row=>"<tr>"+headers.map((_,j)=>"<td>"+inline(row[j]||"")+"</td>").join("")+"</tr>").join("")+"</tbody></table>";continue;
      }
      if(!line.trim()){flushPara();continue;}
      para.push(line);
    }
    flushPara();flushList();flushQuote();
    if(inCode)out+="<pre><code>"+esc(code.join("\n"))+"</code></pre>";
    return out;
  }
  window.Site=Object.assign(window.Site||{},{renderMarkdown});
})();