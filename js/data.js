(function(){
  const root = window.SITE_CONFIG.dataRoot;
  async function getJSON(path){
    const res = await fetch(root + path);
    if(!res.ok) throw new Error("Could not load " + path + " (" + res.status + ")");
    return res.json();
  }
  async function getText(path){
    const res = await fetch(root + path);
    if(!res.ok) throw new Error("Could not load " + path + " (" + res.status + ")");
    return res.text();
  }
  async function indexed(section){
    const index = await getJSON(section + "/index.json");
    const records = await Promise.all((index.items || []).map(async entry => {
      try {
        const raw = section === "work" || section === "sandbox"
          ? await getJSON(section + "/" + entry.file)
          : await getText(section + "/" + entry.file);
        if(typeof raw === "string"){
          const parsed = Site.parseFrontMatter(raw);
          return Object.assign({}, entry, {content: parsed.body, meta: parsed.meta});
        }
        return Object.assign({}, entry, raw);
      } catch(err) {
        console.warn(err);
        return null;
      }
    }));
    return records.filter(Boolean).filter(item => item.published === true && (!item.meta || item.meta.published === true));
  }
  window.Site = Object.assign(window.Site || {}, {
    getJSON, getText, indexed,
    parseFrontMatter(source){
      const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
      if(!match) return {meta:{},body:source};
      const meta = {};
      let currentKey = null;
      for(const line of match[1].split(/\r?\n/)){
        const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if(m){
          currentKey = m[1];
          const val = m[2].trim();
          if(val === "") meta[currentKey] = [];
          else if(val === "true") meta[currentKey] = true;
          else if(val === "false") meta[currentKey] = false;
          else if(val.startsWith("[") || val.startsWith("{") || val.startsWith('"') || val.startsWith("'")){
            try { meta[currentKey] = JSON.parse(val.replace(/'/g,'"')); }
            catch { meta[currentKey] = val.replace(/^['"]|['"]$/g,""); }
          } else meta[currentKey] = val.replace(/^['"]|['"]$/g,"");
        } else if(currentKey && /^\s+-\s+/.test(line)){
          meta[currentKey].push(line.replace(/^\s+-\s+/,"").replace(/^['"]|['"]$/g,""));
        }
      }
      return {meta,body:source.slice(match[0].length)};
    }
  });
})();