/* ── Hero data ─────────────────────────────────────────────── */
const HERO_SELECTION = [
  {
    id: 'tuff-baby',
    name: 'Tuff Baby',
    preview: 'tuff-tuff-baby.gif',
    shortName: 'Baby'
  },
  {
    id: 'elmo-rage',
    name: 'Elmo Rage',
    preview: 'tuff-tuff-baby.gif',
    shortName: 'Elmo'
  },
  {
    id: 'will-slap',
    name: 'Will Slap',
    preview: 'tuff-tuff-baby.gif',
    shortName: 'Will'
  },
  {
    id: 'tung-tank',
    name: 'Tung Tank',
    preview: 'tuff-tuff-baby.gif',
    shortName: 'Tung'
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
  heroSelectionState.drafts[heroSelectionState.activePlayerIndex] = hero;
  heroSelectionState.statusLine = `Player ${heroSelectionState.activePlayerIndex + 1} is previewing ${hero.name}. ${randomMemeLine()}`;
  renderHeroSelection();
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
  renderHeroSelection();
  console.log('Hero selection complete', window.gameSelection);
}

function clearHeroTimer() {
  if (heroSelectionState.timerId) {
    window.clearInterval(heroSelectionState.timerId);
    heroSelectionState.timerId = null;
  }
}

/* ── Render ────────────────────────────────────────────────── */
function renderHeroSelection() {
  const turnLabel   = document.getElementById('turnLabel');
  const turnTimer   = document.getElementById('turnTimer');
  const selStatus   = document.getElementById('selectionStatus');
  const p1Preview   = document.getElementById('player1Preview');
  const p2Preview   = document.getElementById('player2Preview');
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
  [p1Preview, p2Preview].forEach((el, i) => {
    if (!el) return;
    const display = heroSelectionState.selections[i] || heroSelectionState.drafts[i];
    el.src = display ? display.preview : HERO_SELECTION_PLACEHOLDER;
    el.alt = display ? `${display.name} preview` : `Player ${i+1} hero preview`;
    el.style.opacity = display ? '1' : '0';
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
