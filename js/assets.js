// Simple asset preloader for the landing page
const Assets = (function(){
  const images = [
    'tuff-tuff-baby.gif',
    'will_smith.jpeg',
    'elmo.jpeg',
    'tungtung.webp',
    'baby-laugh-ai-baby.webp',
    'assets/meme1.png',
    'gif/flying_monster.gif',
    'gif/dogie_mons.gif'
  ];

  function preload(cb){
    let loaded = 0;
    if(images.length===0){ cb && cb(); return; }
    images.forEach(src=>{
      const img = new Image();
      img.onload = ()=>{ loaded++; if(loaded===images.length) cb && cb(); };
      img.onerror = ()=>{ loaded++; if(loaded===images.length) cb && cb(); };
      img.src = src;
    });
  }

  return { preload };
})();

// Auto-preload on page load
window.addEventListener('DOMContentLoaded', ()=>{ Assets.preload(); });
