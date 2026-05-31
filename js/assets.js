// Simple asset preloader for the landing page
const Assets = (function () {
  const images = [
    'assets/intro/background.png',
    'assets/intro/frame.png',
    'assets/intro/landing_logo.png',
    'assets/intro/hand.png',
    'assets/intro/slap_impact.gif'
  ];

  function preload(cb) {
    let loaded = 0;
    if (images.length === 0) {
      if (cb) cb();
      return;
    }

    images.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded += 1;
        if (loaded === images.length && cb) cb();
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === images.length && cb) cb();
      };
      img.src = src;
    });
  }

  return { preload };
})();

window.addEventListener('DOMContentLoaded', () => {
  Assets.preload();
});
