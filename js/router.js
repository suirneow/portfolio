(function(){
  function id(){return new URLSearchParams(location.search).get("id");}
  window.Site=Object.assign(window.Site||{},{queryId:id});
})();