/* Bascule clair / sombre partagée par index.html, concept.html et icons.html.
   Par défaut : réglage du téléphone. Le choix est mémorisé par navigateur (si possible). */
(function(){
  var KEY='pom-theme', root=document.documentElement, t=null;
  try{ t=localStorage.getItem(KEY); }catch(e){}
  if(t===null && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) t='dark';
  function apply(v){ if(v) root.setAttribute('data-theme',v); else root.removeAttribute('data-theme'); }
  apply(t);
  function wire(){
    var sel=document.getElementById('themeSel'); if(!sel) return;
    sel.value=t||'';
    sel.addEventListener('change',function(){ t=sel.value; apply(t); try{ localStorage.setItem(KEY,t); }catch(e){} });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();
