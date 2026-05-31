(() => {
  const howToPlayBtn = document.getElementById('howToPlayBtn');
  const closeBtn = document.getElementById('closeHowToPlayBtn');
  const modal = document.getElementById('howToPlayModal');
  const landingPage = document.querySelector('.landing-page');
  const introSequence = document.getElementById('introSequence');
  const slapAudio = document.getElementById('slapSfx');

  const INTRO_DURATION_MS = 1180;
  let introStarted = false;
  let introFinished = false;
  let introStartFallbackBound = false;

  if (slapAudio) {
    slapAudio.load();
  }

  function finishIntro() {
    if (introFinished) {
      return;
    }
    introFinished = true;

    if (landingPage) {
      landingPage.classList.add('is-ready');
    }
    if (introSequence) {
      introSequence.classList.add('is-done');
    }
  }

  function startIntroVisuals() {
    if (introStarted) {
      return;
    }
    introStarted = true;

    if (introSequence) {
      introSequence.classList.add('is-playing');
    }

    window.setTimeout(finishIntro, INTRO_DURATION_MS);
  }

  function unbindIntroStartFallback() {
    if (!introStartFallbackBound) {
      return;
    }
    window.removeEventListener('pointerdown', handleIntroStartGesture);
    window.removeEventListener('keydown', handleIntroStartGesture);
    introStartFallbackBound = false;
  }

  function bindIntroStartFallback() {
    if (introStartFallbackBound || introStarted) {
      return;
    }
    window.addEventListener('pointerdown', handleIntroStartGesture, { once: true });
    window.addEventListener('keydown', handleIntroStartGesture, { once: true });
    introStartFallbackBound = true;
  }

  function handleIntroStartGesture() {
    unbindIntroStartFallback();
    tryStartIntro();
  }

  function tryStartIntro() {
    if (introStarted) {
      return;
    }

    if (!slapAudio) {
      startIntroVisuals();
      return;
    }

    try {
      slapAudio.currentTime = 0;
      const playAttempt = slapAudio.play();

      if (playAttempt && typeof playAttempt.then === 'function') {
        playAttempt
          .then(() => {
            unbindIntroStartFallback();
            startIntroVisuals();
          })
          .catch(() => {
            bindIntroStartFallback();
          });
      } else {
        unbindIntroStartFallback();
        startIntroVisuals();
      }
    } catch (_error) {
      bindIntroStartFallback();
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishIntro();
  } else {
    tryStartIntro();
  }

  if (!howToPlayBtn || !closeBtn || !modal) {
    return;
  }

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  howToPlayBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
})();