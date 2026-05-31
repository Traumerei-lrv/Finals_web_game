/* ── Hero data ─────────────────────────────────────────────── */
const HERO_SELECTION = [
  {
    id: 'sasuke',
    name: 'Sasuke',
    preview: 'assets/sasuke/tile000.gif',
    assetRoot: 'assets/sasuke',
    slapFolder: 'Slap',
    hurtFolder: 'hurt',
    hurtFrame: 'hurt003.png',
    confuseFolder: 'hurt',
    confuseFrame: 'hurt002.png',
    deathFolder: 'death',
    deathSheet: 'death_sheet.png',
    deathPlayer1Folder: 'Player1_death',
    deathPlayer2Folder: 'Player2_death',
    deathFrameCount: 4,
    deathPlayer2Reversed: true,
    deathAlign: {
      player1Scale: 0.94,
      player2Scale: 0.87,
      player1TranslateY: 4,
      player2TranslateY: 4
    },
    victoryFolder: 'victory',
    victorySheet: 'victory_sheet.png',
    victoryPlayer1Folder: 'player1_victory',
    victoryPlayer2Folder: 'player2_victory',
    victoryFrameCount: 4,
    victoryPlayer2Reversed: false,
    victoryAlign: {
      player1Scale: 0.91,
      player2Scale: 0.84,
      player1TranslateY: 4,
      player2TranslateY: 4
    },
    hurtAlign: {
      player1Scale: 0.91,
      player2Scale: 0.83
    },
    shortName: 'Sasuke'
  },
  {
    id: 'elmo-rage',
    name: 'Elmo Rage',
    preview: './assets/epstein/tile000.gif',
    assetRoot: 'assets/epstein',
    slapFolder: 'slap',
    hurtFolder: 'Hurt',
    hurtFrame: 'tile003.png',
    confuseFolder: 'Hurt',
    confuseFrame: 'tile002.png',
    deathFolder: 'death',
    deathSheet: 'death_sheet.png',
    deathPlayer1Folder: 'player1_death',
    deathPlayer2Folder: 'player2_death',
    deathFrameCount: 4,
    deathPlayer2Reversed: true,
    deathAlign: {
      player1Scale: 0.95,
      player2Scale: 0.88,
      player1TranslateY: 4,
      player2TranslateY: 4
    },
    victoryFolder: 'victory',
    victorySheet: 'victory_sheet.png',
    victoryPlayer1Folder: 'player1_victory',
    victoryPlayer2Folder: 'player2_victory',
    victoryFrameCount: 4,
    victoryPlayer2Reversed: true,
    victoryAlign: {
      player1Scale: 0.95,
      player2Scale: 0.88,
      player1TranslateY: 4,
      player2TranslateY: 4
    },
    hurtAlign: {
      player1Scale: 0.95,
      player2Scale: 0.86
    },
    shortName: 'Elmo'
  },
  {
    id: 'tung-tank',
    name: 'Tung Tank',
    preview: 'tuff-tuff-baby.gif',
    shortName: 'Tung'
  },
  {
    id: 'tungtung',
    name: 'TungTung',
    preview: 'assets/tungtung/tuntung_poster-preview.png',
    previewType: 'video',
    previewPoster: 'assets/tungtung/tuntung_poster-preview.png',
    previewVideo: 'assets/tungtung/tungtung_preview.mp4',
    shortName: 'TungTung'
  },
  {
    id: 'swag',
    name: 'Swag',
    preview: 'assets/dog2/preview/dance000.gif',
    assetRoot: 'assets/dog2',
    slapFolder: 'slap',
    slapPlayer1Folder: 'slap_player1',
    slapPlayer2Folder: 'slap_player2',
    slapFrameFilenames: [
      'slap000.png',
      'slap001.png',
      'slap002.png',
      'slap003.png',
      'slap004.png',
      'slap005.png',
      'slap006.png',
      'slap007.png'
    ],
    slapFrameCount: 8,
    slapSheetFrameWidth: 125,
    slapSheetFrameHeight: 250,
    hurtFolder: 'hurt',
    hurtPlayer1Folder: 'player1_hurt',
    hurtPlayer2Folder: 'player2_hurt',
    hurtFrame: 'hurt_sheet.png',
    confuseFolder: 'confuse',
    confusePlayer1Folder: 'player1_confuse',
    confusePlayer2Folder: 'player2_confuse',
    confuseFrame: 'confuse_dog.png',
    deathFolder: 'death',
    deathSheet: 'death_sheet.png',
    deathPlayer1Folder: 'player1_death',
    deathPlayer2Folder: 'player2_death',
    deathFrameCount: 4,
    deathPlayer2Reversed: true,
    hurtAlign: {
      player1Scale: 0.92,
      player2Scale: 0.92
    },
    deathAlign: {
      player1Scale: 0.92,
      player2Scale: 0.92,
      player1TranslateY: 4,
      player2TranslateY: 4
    },
    shortName: 'Swag'
  }
];

const HERO_SELECTION_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const heroSelectionState = {
  activePlayerIndex: 0,
  secondsRemaining: 30,
  timerId: null,
  selections: [null, null],
  drafts: [null, null],
  isActive: false,
  statusLine: 'Player 1 starts - 30 seconds per pick.'
};

const carouselState = {
  heroIds: [],
  activeIndex: 0
};

const previewSheetState = [
  { timerId: null, src: '' },
  { timerId: null, src: '' }
];

const MEME_STATUS_LINES = [
  'Absolute cinema.',
  'Lock in and embrace the chaos.',
  'Certified meme matchup incoming.',
  'No meta. Only vibes.',
  'Brainrot buff activated.'
];

function randomMemeLine() {
  return MEME_STATUS_LINES[Math.floor(Math.random() * MEME_STATUS_LINES.length)];
}

/* ── Boot ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const heroCards = document.querySelectorAll('[data-hero-id]');
  heroCards.forEach(card => {
    if (!card.disabled) {
      card.addEventListener('click', () => selectHero(card.dataset.heroId));
    }
  });

  const lockBtn = document.getElementById('lockBtn');
  if (lockBtn) lockBtn.addEventListener('click', lockHero);
  initCarousel();

  // Auto-start since there's no landing screen
  heroSelectionState.isActive = true;
  heroSelectionState.activePlayerIndex = 0;
  heroSelectionState.selections = [null, null];
  heroSelectionState.drafts = [null, null];
  beginTurn(0);
});

/* ── Turn management ───────────────────────────────────────── */
function beginTurn(playerIndex) {
  clearHeroTimer();
  heroSelectionState.activePlayerIndex = playerIndex;
  heroSelectionState.secondsRemaining = 30;
  heroSelectionState.statusLine = `Player ${playerIndex + 1} picks now`;
  syncCarouselToTurn();
  renderHeroSelection();

  heroSelectionState.timerId = window.setInterval(() => {
    heroSelectionState.secondsRemaining -= 1;
    if (heroSelectionState.secondsRemaining <= 0) { autoPickHero(); return; }
    renderHeroSelection();
  }, 1000);
}

function selectHero(heroId) {
  if (!heroSelectionState.isActive) return;
  const hero = HERO_SELECTION.find(h => h.id === heroId);
  if (!hero) return;
  const heroIndex = carouselState.heroIds.indexOf(heroId);
  if (heroIndex >= 0) {
    carouselState.activeIndex = heroIndex;
  }
  heroSelectionState.drafts[heroSelectionState.activePlayerIndex] = hero;
  heroSelectionState.statusLine = `Player ${heroSelectionState.activePlayerIndex + 1} is previewing ${hero.name}. ${randomMemeLine()}`;
  renderHeroSelection();
  scrollCarouselCardIntoView(heroId, true);
}

function initCarousel() {
  carouselState.heroIds = HERO_SELECTION.map(hero => hero.id);
  carouselState.activeIndex = 0;

  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  prevBtn?.addEventListener('click', () => moveCarousel(-1));
  nextBtn?.addEventListener('click', () => moveCarousel(1));

  document.addEventListener('keydown', (event) => {
    if (!heroSelectionState.isActive) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCarousel(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveCarousel(1);
    }
  });
}

function moveCarousel(step) {
  if (!carouselState.heroIds.length || !heroSelectionState.isActive) return;

  const total = carouselState.heroIds.length;
  carouselState.activeIndex = (carouselState.activeIndex + step + total) % total;
  const nextHeroId = carouselState.heroIds[carouselState.activeIndex];
  selectHero(nextHeroId);
  scrollCarouselCardIntoView(nextHeroId, true);
}

function syncCarouselToTurn() {
  if (!carouselState.heroIds.length) return;

  const draft = heroSelectionState.drafts[heroSelectionState.activePlayerIndex];
  const selected = heroSelectionState.selections[heroSelectionState.activePlayerIndex];
  const targetHero = draft || selected || HERO_SELECTION[0] || null;
  if (!targetHero) return;

  const index = carouselState.heroIds.indexOf(targetHero.id);
  carouselState.activeIndex = index >= 0 ? index : 0;
  const heroId = carouselState.heroIds[carouselState.activeIndex];
  if (!draft) {
    selectHero(heroId);
  } else {
    scrollCarouselCardIntoView(heroId, false);
  }
}

function scrollCarouselCardIntoView(heroId, smooth) {
  const card = document.querySelector(`.hero-card[data-hero-id="${heroId}"]`);
  card?.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'nearest',
    inline: 'center'
  });
}

function lockHero() {
  if (!heroSelectionState.isActive) return;
  const draft = heroSelectionState.drafts[heroSelectionState.activePlayerIndex];
  if (!draft) return;
  heroSelectionState.selections[heroSelectionState.activePlayerIndex] = draft;
  heroSelectionState.drafts[heroSelectionState.activePlayerIndex] = null;
  heroSelectionState.statusLine = `Player ${heroSelectionState.activePlayerIndex + 1} locked ${draft.name}. ${randomMemeLine()}`;
  renderHeroSelection();

  if (heroSelectionState.selections[0] && heroSelectionState.selections[1]) {
    completeSelection(); return;
  }
  beginTurn(heroSelectionState.activePlayerIndex === 0 ? 1 : 0);
}

function autoPickHero() {
  const currentDraft = heroSelectionState.drafts[heroSelectionState.activePlayerIndex];
  const nextHero = currentDraft || HERO_SELECTION[0];
  if (!nextHero) { completeSelection(); return; }
  heroSelectionState.drafts[heroSelectionState.activePlayerIndex] = nextHero;
  lockHero();
}

function completeSelection() {
  clearHeroTimer();
  heroSelectionState.isActive = false;
  heroSelectionState.secondsRemaining = 0;
  window.gameSelection = {
    player1: heroSelectionState.selections[0],
    player2: heroSelectionState.selections[1]
  };
  try {
    window.sessionStorage.setItem('slapthtSelection', JSON.stringify(window.gameSelection));
  } catch (error) {
    console.warn('Unable to persist fighter selection', error);
  }
  renderHeroSelection();
  console.log('Hero selection complete', window.gameSelection);
  window.setTimeout(() => {
    window.location.href = 'arena.html';
  }, 150);
}

function clearHeroTimer() {
  if (heroSelectionState.timerId) {
    window.clearInterval(heroSelectionState.timerId);
    heroSelectionState.timerId = null;
  }
}

function stopPreviewSheetAnimation(slotIndex, imageEl) {
  const state = previewSheetState[slotIndex];
  if (state?.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  if (state) {
    state.src = '';
  }
  if (imageEl) {
    imageEl.style.removeProperty('object-fit');
    imageEl.style.removeProperty('object-position');
    imageEl.style.removeProperty('aspect-ratio');
    imageEl.style.removeProperty('max-width');
    imageEl.style.removeProperty('width');
    imageEl.style.removeProperty('height');
  }
}

function startPreviewSheetAnimation(slotIndex, imageEl, hero) {
  if (!imageEl || !hero || hero.previewType !== 'sheet') return;

  const sheetSrc = hero.previewSheet;
  const frameCount = Number(hero.previewFrameCount) || 0;
  const frameWidth = Number(hero.previewFrameWidth) || 125;
  const frameHeight = Number(hero.previewFrameHeight) || 250;
  if (!sheetSrc || frameCount < 2) return;

  const state = previewSheetState[slotIndex];
  if (!state) return;

  const totalWidth = frameCount * frameWidth;
  const shouldReset = state.src !== sheetSrc;

  imageEl.src = sheetSrc;
  imageEl.style.objectFit = 'none';
  imageEl.style.objectPosition = '0px top';
  imageEl.style.aspectRatio = `${totalWidth} / ${frameHeight}`;
  imageEl.style.maxWidth = 'none';
  imageEl.style.width = 'auto';
  imageEl.style.height = '100%';

  if (!shouldReset) return;

  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  state.src = sheetSrc;

  let frameIndex = 0;
  state.timerId = window.setInterval(() => {
    frameIndex = (frameIndex + 1) % frameCount;
    imageEl.style.objectPosition = `${-(frameIndex * frameWidth)}px top`;
  }, 90);
}

/* ── Render ────────────────────────────────────────────────── */
function renderHeroSelection() {
  const turnLabel   = document.getElementById('turnLabel');
  const turnTimer   = document.getElementById('turnTimer');
  const selStatus   = document.getElementById('selectionStatus');
  const p1Preview   = document.getElementById('player1Preview');
  const p2Preview   = document.getElementById('player2Preview');
  const p1Video     = document.getElementById('player1PreviewVideo');
  const p2Video     = document.getElementById('player2PreviewVideo');
  const p1Label     = document.getElementById('turnLabelPlayer1');
  const p2Label     = document.getElementById('turnLabelPlayer2');
  const lockBtn     = document.getElementById('lockBtn');
  const heroCards   = document.querySelectorAll('.hero-card');
  const p1Card      = document.querySelector('.preview-card[data-player="1"]');
  const p2Card      = document.querySelector('.preview-card[data-player="2"]');
  const timerEl     = document.getElementById('turnTimer');

  // Active card highlight
  if (heroSelectionState.isActive) {
    p1Card && p1Card.classList.toggle('is-active', heroSelectionState.activePlayerIndex === 0);
    p2Card && p2Card.classList.toggle('is-active', heroSelectionState.activePlayerIndex === 1);
  } else {
    p1Card && p1Card.classList.remove('is-active');
    p2Card && p2Card.classList.remove('is-active');
  }

  if (turnLabel) {
    turnLabel.textContent = heroSelectionState.isActive
      ? `Player ${heroSelectionState.activePlayerIndex + 1}`
      : 'Done';
  }

  if (timerEl) {
    const s = heroSelectionState.secondsRemaining || 0;
    timerEl.textContent = String(s).padStart(2, '0');
    timerEl.classList.toggle('is-warning', s <= 10 && s > 5);
    timerEl.classList.toggle('is-critical', s <= 5 && s > 0);
  }

  if (selStatus && heroSelectionState.isActive) {
    selStatus.textContent = heroSelectionState.statusLine;
  }

  // Previews
  [
    { image: p1Preview, video: p1Video },
    { image: p2Preview, video: p2Video }
  ].forEach(({ image, video }, i) => {
    const display = heroSelectionState.selections[i] || heroSelectionState.drafts[i];
    const isVideo = Boolean(display && display.previewType === 'video' && video);
    const isSheet = Boolean(display && display.previewType === 'sheet' && image);

    if (image) {
      image.src = display && !isVideo ? display.preview : HERO_SELECTION_PLACEHOLDER;
      image.alt = display ? `${display.name} preview` : `Player ${i + 1} hero preview`;
      image.style.opacity = display && !isVideo ? '1' : '0';
      image.classList.toggle('is-hidden', Boolean(display && isVideo));
      if (isSheet) {
        startPreviewSheetAnimation(i, image, display);
      } else {
        stopPreviewSheetAnimation(i, image);
      }
    }

    if (video) {
      if (display && isVideo) {
        const nextSrc = display.previewVideo;
        if (video.dataset.previewSrc !== nextSrc) {
          video.src = nextSrc;
          video.poster = display.previewPoster || display.preview;
          video.dataset.previewSrc = nextSrc;
          video.load();
        }
        video.style.opacity = '1';
        video.classList.remove('is-hidden');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
        if (video.dataset.previewSrc) {
          video.removeAttribute('src');
          video.removeAttribute('poster');
          delete video.dataset.previewSrc;
          video.load();
        }
        video.style.opacity = '0';
        video.classList.add('is-hidden');
      }
    }

    if (!display && image) {
      stopPreviewSheetAnimation(i, image);
    }
  });

  if (p1Label) p1Label.textContent = heroSelectionState.selections[0]?.name || 'Waiting';
  if (p2Label) p2Label.textContent = heroSelectionState.selections[1]?.name || 'Waiting';

  if (lockBtn) {
    const activeDraft = heroSelectionState.drafts[heroSelectionState.activePlayerIndex];
    lockBtn.disabled = !heroSelectionState.isActive || !activeDraft;
    const btnSpan = lockBtn.querySelector('span');
    if (btnSpan) {
      btnSpan.textContent = heroSelectionState.isActive
        ? `Lock P${heroSelectionState.activePlayerIndex + 1}`
        : '✓ Locked';
    }
  }

  heroCards.forEach(card => {
    const heroId = card.dataset.heroId;
    const hero = HERO_SELECTION.find(h => h.id === heroId);
    if (!hero) return; // locked/coming-soon cards
    const curSel = heroSelectionState.selections[heroSelectionState.activePlayerIndex];
    const curDraft = heroSelectionState.drafts[heroSelectionState.activePlayerIndex];
    const isSelByCur = curSel && curSel.id === heroId;
    const isDraft = curDraft && curDraft.id === heroId;
    const isSelByAny = heroSelectionState.selections.some(s => s && s.id === heroId);

    card.classList.toggle('is-selected', isSelByAny);
    card.classList.toggle('is-drafted', isDraft && !isSelByCur);
    card.classList.toggle('is-carousel-active', carouselState.heroIds[carouselState.activeIndex] === heroId);
    card.disabled = !heroSelectionState.isActive || isSelByCur;
    card.setAttribute('aria-pressed', String(isDraft || isSelByCur));

    const smallLabel = card.querySelector('small');
    if (smallLabel) {
      if (isSelByCur)                               smallLabel.textContent = '✓ Selected';
      else if (isDraft && heroSelectionState.isActive) smallLabel.textContent = 'Previewing…';
      else if (isSelByAny)                          smallLabel.textContent = 'Already picked';
      else if (!heroSelectionState.isActive)        smallLabel.textContent = 'Locked';
      else                                          smallLabel.textContent = `Pick for P${heroSelectionState.activePlayerIndex + 1}`;
    }
  });

  // Fallbacks
  document.querySelectorAll('.preview-card').forEach((card, i) => {
    const fallback = card.querySelector('.preview-card__fallback');
    if (fallback) {
      const has = heroSelectionState.drafts[i] || heroSelectionState.selections[i];
      fallback.classList.toggle('is-hidden', Boolean(has));
    }
  });

  // Final status
  if (!heroSelectionState.isActive && heroSelectionState.selections[0] && heroSelectionState.selections[1]) {
    if (selStatus) {
      selStatus.textContent = `Player 1: ${heroSelectionState.selections[0].name}  ·  Player 2: ${heroSelectionState.selections[1].name}  ·  ${randomMemeLine()}`;
    }
  }
}
