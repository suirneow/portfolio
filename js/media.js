(function(){
  function resolveURL(src){
    if(!src || typeof src !== "string") return "";
    const value = src.trim();
    if(value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
      try{
        const u = new URL(value);
        if(u.hostname === "dropbox.com" || u.hostname.endsWith(".dropbox.com")){
          u.searchParams.delete("dl"); u.searchParams.set("raw","1");
          return u.toString();
        }
      }catch(e){}
      return value;
    }
    return value;
  }
  function fallback(label){
    const el=document.createElement("div"); el.className="media-fallback"; el.textContent=label || "MEDIA UNAVAILABLE"; return el;
  }
  function image(src,alt,className){
    const wrap=document.createElement("div"); wrap.className=className || "";
    const url=resolveURL(src);
    if(!url){wrap.appendChild(fallback("NO IMAGE"));return wrap;}
    const img=document.createElement("img"); img.src=url; img.alt=alt || ""; img.loading="lazy"; img.decoding="async";
    img.addEventListener("error",()=>{wrap.replaceChildren(fallback("IMAGE UNAVAILABLE"));});
    wrap.appendChild(img); return wrap;
  }
  function videoNode(src){
    const url=resolveURL(src);
    const wrap=document.createElement("div");
    if(!url){wrap.appendChild(fallback("NO VIDEO"));return wrap;}
    const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    const vm=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if(yt || vm){
      const frame=document.createElement("iframe"); frame.className="video-frame";
      frame.src=yt ? "https://www.youtube-nocookie.com/embed/"+yt[1] : "https://player.vimeo.com/video/"+vm[1];
      frame.title="Embedded video"; frame.loading="lazy"; frame.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"; frame.allowFullscreen=true;
      wrap.appendChild(frame);
    }else if(/\.mp4(?:$|\?)/i.test(url)){
      const video=document.createElement("video"); video.controls=true; video.preload="metadata"; video.src=url; video.playsInline=true; wrap.appendChild(video);
    }else{
      const a=document.createElement("a"); a.href=url; a.textContent="Open video"; a.target="_blank"; a.rel="noopener noreferrer"; wrap.appendChild(a);
    }
    return wrap;
  }
  window.Site=Object.assign(window.Site||{},{resolveURL,image,videoNode});
})();