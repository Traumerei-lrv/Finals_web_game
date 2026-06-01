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
  let soundFallbackBound = false;
  let introSoundPlayed = false;

  if (slapAudio) {
    slapAudio.load();
  }

  // Always reset classes so intro can replay consistently (including bfcache/back navigation).
  landingPage?.classList.remove('is-ready');
  introSequence?.classList.remove('is-done', 'is-playing');

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

  function unbindSoundFallback() {
    if (!soundFallbackBound) {
      return;
    }
    window.removeEventListener('pointerdown', playSlapSound);
    window.removeEventListener('keydown', playSlapSound);
    soundFallbackBound = false;
  }

  function bindSoundFallback() {
    if (soundFallbackBound || introSoundPlayed) {
      return;
    }
    window.addEventListener('pointerdown', playSlapSound, { once: true });
    window.addEventListener('keydown', playSlapSound, { once: true });
    soundFallbackBound = true;
  }

  function playSlapSound() {
    if (!slapAudio || introSoundPlayed) {
      return;
    }

    try {
      slapAudio.currentTime = 0;
      const playAttempt = slapAudio.play();

      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt
          .then(() => {
            introSoundPlayed = true;
            unbindSoundFallback();
          })
          .catch(() => {
            bindSoundFallback();
          });
      } else {
        introSoundPlayed = true;
        unbindSoundFallback();
      }
    } catch (_error) {
      bindSoundFallback();
    }
  }

  startIntroVisuals();
  playSlapSound();

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
