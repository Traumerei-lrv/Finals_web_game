const ARENA_STATE = {
  maxHealth: 100,
  slapDamage: 1,
  criticalDamage: 5,
  stunDurationMs: 1000,
  slapCooldownMs: 220,
  isOver: false,
  winner: null,
  lastSlapAt: { player1: 0, player2: 0 },
  stunUntil: { player1: 0, player2: 0 },
  slapMeters: { player1: 0, player2: 0 },
  fighters: {
    player1: { name: 'Player 1', health: 100, label: 'Player 1', portrait: '', hero: null },
    player2: { name: 'Player 2', health: 100, label: 'Player 2', portrait: '', hero: null }
  }
};

const PLAYER1_SLAP_FRAMES = [
  'assets/sasuke/Slap/tile000.png',
  'assets/sasuke/Slap/tile001.png',
  'assets/sasuke/Slap/tile002.png',
  'assets/sasuke/Slap/tile003.png',
  'assets/sasuke/Slap/tile004.png',
  'assets/sasuke/Slap/tile005.png',
  'assets/sasuke/Slap/tile006.png',
  'assets/sasuke/Slap/tile007.png'
];

const PLAYER2_SLAP_FRAMES = [
  'assets/sasuke/Slap/Player 2/tile000.png',
  'assets/sasuke/Slap/Player 2/tile001.png',
  'assets/sasuke/Slap/Player 2/tile002.png',
  'assets/sasuke/Slap/Player 2/tile003.png',
  'assets/sasuke/Slap/Player 2/tile004.png',
  'assets/sasuke/Slap/Player 2/tile005.png',
  'assets/sasuke/Slap/Player 2/tile006.png',
  'assets/sasuke/Slap/Player 2/tile007.png'
];

let player1SlapAnimationId = null;
let player1SlapAnimationToken = 0;
let player2SlapAnimationId = null;
let player2SlapAnimationToken = 0;
let player1HurtAnimationId = null;
let player1HurtAnimationToken = 0;
let player2HurtAnimationId = null;
let player2HurtAnimationToken = 0;
let player1ConfuseAnimationId = null;
let player1ConfuseAnimationToken = 0;
let player2ConfuseAnimationId = null;
let player2ConfuseAnimationToken = 0;
let player1StunTimeoutId = null;
let player2StunTimeoutId = null;
let player1DeathAnimationToken = 0;
let player2DeathAnimationToken = 0;
let player1VictoryAnimationToken = 0;
let player2VictoryAnimationToken = 0;
let hitEffectAnimationId = null;
const SLAP_FRAME_FILENAMES = [
  'tile000.png',
  'tile001.png',
  'tile002.png',
  'tile003.png',
  'tile004.png',
  'tile005.png',
  'tile006.png',
  'tile007.png'
];
const HIT_SOUND_FILES = [
  'assets/sounds/hit1.wav',
  'assets/sounds/hit2.wav',
  'assets/sounds/hit3.wav',
  'assets/sounds/hit4.wav'
];
const HURT_SOUND_FILES = [
  'assets/sounds/hurt1.wav',
  'assets/sounds/hurt2.wav',
  'assets/sounds/hurt3.wav',
  'assets/sounds/hurt4.wav'
];
const CRITICAL_SOUND_FILE = 'assets/sounds/explosion.wav';
const DEATH_SOUND_FILE = 'assets/sounds/lego-yoda-death-sound-effect.mp3';
const VICTORY_SOUND_FILE = 'assets/sounds/fatality.mp3';
const soundCache = new Map();

document.addEventListener('DOMContentLoaded', () => {
  hydrateFighters();
  renderArena();
  window.addEventListener('keydown', handleKeydown);
});

function hydrateFighters() {
  const storedSelection = readStoredSelection();
  const player1 = normalizeHeroIdentity(storedSelection?.player1);
  const player2 = normalizeHeroIdentity(storedSelection?.player2);

  ARENA_STATE.fighters.player1.name = player1?.name || 'Player 1';
  ARENA_STATE.fighters.player2.name = player2?.name || 'Player 2';
  ARENA_STATE.fighters.player1.label = player1?.shortName || player1?.name || 'Player 1';
  ARENA_STATE.fighters.player2.label = player2?.shortName || player2?.name || 'Player 2';
  ARENA_STATE.fighters.player1.hero = player1 || null;
  ARENA_STATE.fighters.player2.hero = player2 || null;
  ARENA_STATE.fighters.player1.portrait = getBattlePortrait(player1, 'player1');
  ARENA_STATE.fighters.player2.portrait = getBattlePortrait(player2, 'player2');

  const player1Name = document.getElementById('player1Name');
  const player2Name = document.getElementById('player2Name');
  const player1Label = document.getElementById('player1Label');
  const player2Label = document.getElementById('player2Label');
  const player1Portrait = document.getElementById('player1Portrait');
  const player2Portrait = document.getElementById('player2Portrait');
  const player1Placeholder = document.getElementById('player1Placeholder');
  const player2Placeholder = document.getElementById('player2Placeholder');

  if (player1Name) player1Name.textContent = ARENA_STATE.fighters.player1.name;
  if (player2Name) player2Name.textContent = ARENA_STATE.fighters.player2.name;
  if (player1Label) player1Label.textContent = ARENA_STATE.fighters.player1.label;
  if (player2Label) player2Label.textContent = ARENA_STATE.fighters.player2.label;

  applyPortrait(player1Portrait, player1Placeholder, ARENA_STATE.fighters.player1.portrait);
  applyPortrait(player2Portrait, player2Placeholder, ARENA_STATE.fighters.player2.portrait);
  resetDeathOverlay('player1');
  resetDeathOverlay('player2');
  resetVictoryOverlay('player1');
  resetVictoryOverlay('player2');
}

function normalizeHeroIdentity(hero) {
  if (!hero || typeof hero !== 'object') return hero;
  const normalized = { ...hero };
  const id = typeof normalized.id === 'string' ? normalized.id.toLowerCase() : '';
  const assetRoot = typeof normalized.assetRoot === 'string' ? normalized.assetRoot.toLowerCase() : '';

  if (id === 'sasuke' || id === 'sasake' || assetRoot === 'assets/sasuke') {
    normalized.id = 'sasuke';
    normalized.name = 'Sasake';
    normalized.shortName = 'Sasake';
    return normalized;
  }

  if (id === 'elmo-rage' || id === 'einstein' || assetRoot === 'assets/epstein') {
    normalized.id = 'elmo-rage';
    normalized.name = 'Einstein';
    normalized.shortName = 'Einstein';
    return normalized;
  }

  if (id === 'swag' || assetRoot === 'assets/dog2') {
    normalized.id = 'swag';
    normalized.name = 'Swag';
    normalized.shortName = 'Swag';
    return normalized;
  }

  if (id === 'stone' || assetRoot === 'assets/stone') {
    normalized.id = 'stone';
    normalized.name = 'Stone';
    normalized.shortName = 'Stone';
    return normalized;
  }

  return normalized;
}

function readStoredSelection() {
  try {
    const stored = window.sessionStorage.getItem('slapthtSelection');
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.warn('Unable to read fighter selection', error);
  }
  if (window.gameSelection) return window.gameSelection;
  return null;
}

function getHeroPortrait(hero) {
  if (!hero) return '';
  if (typeof hero.preview === 'string' && /\.(png|jpe?g|gif|webp)$/i.test(hero.preview)) {
    return hero.preview;
  }
  if (typeof hero.previewPoster === 'string' && hero.previewPoster) {
    return hero.previewPoster;
  }
  return '';
}

function getBattlePortrait(hero, playerId) {
  if (!hero) return '';
  const slapFrames = getSlapFrames(hero, playerId);
  const slapFrame = slapFrames.length ? slapFrames[0] : '';
  if (slapFrame) {
    return slapFrame;
  }
  return getHeroPortrait(hero);
}

function getBattleAssetRoot(hero) {
  if (!hero) return '';
  if (typeof hero.assetRoot === 'string' && hero.assetRoot) {
    return hero.assetRoot.replace(/\/+$/, '');
  }

  const previewSource = typeof hero.preview === 'string' && hero.preview
    ? hero.preview
    : typeof hero.previewPoster === 'string' && hero.previewPoster
      ? hero.previewPoster
      : '';

  const match = previewSource.match(/(?:^|\.?\/)?(assets\/[^/]+)/i);
  if (match) {
    return match[1].replace(/\/+$/, '');
  }

  return '';
}

function getSlapFolder(hero) {
  if (!hero) return 'Slap';
  const fallbackConfig = getDefaultSlapConfig(hero);
  if (typeof hero.slapFolder === 'string' && hero.slapFolder) {
    return hero.slapFolder.replace(/^\/+|\/+$/g, '');
  }
  if (fallbackConfig?.folder) return fallbackConfig.folder;
  return 'Slap';
}

function getDefaultSlapConfig(hero) {
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const assetRoot = getBattleAssetRoot(hero).toLowerCase();
  const dogSlapFrames = [
    'slap000.png',
    'slap001.png',
    'slap002.png',
    'slap003.png',
    'slap004.png',
    'slap005.png',
    'slap006.png',
    'slap007.png'
  ];

  if (heroId === 'swag' || assetRoot === 'assets/dog2') {
    return {
      folder: 'slap',
      player1Folder: 'slap_player1',
      player2Folder: 'slap_player2',
      frameFilenames: dogSlapFrames
    };
  }
  if (heroId === 'stone' || assetRoot === 'assets/stone') {
    return {
      folder: 'slap',
      player1Folder: 'player1_slap',
      player2Folder: 'player2_slap',
      frameFilenames: [
        'slap000.png',
        'slap001.png',
        'slap002.png',
        'slap003.png',
        'slap004.png',
        'slap005.png'
      ]
    };
  }
  if (heroId === 'sasuke' || assetRoot === 'assets/sasuke') {
    return {
      folder: 'Slap',
      player1Folder: 'Player 1',
      player2Folder: 'Player 2',
      frameFilenames: SLAP_FRAME_FILENAMES
    };
  }
  if (heroId === 'elmo-rage' || assetRoot === 'assets/epstein') {
    return {
      folder: 'slap',
      player1Folder: 'Player 1',
      player2Folder: 'Player 2',
      frameFilenames: SLAP_FRAME_FILENAMES
    };
  }
  return null;
}

function getDefaultHurtConfig(hero) {
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const assetRoot = getBattleAssetRoot(hero).toLowerCase();

  if (heroId === 'stone' || assetRoot === 'assets/stone') {
    return { folder: 'hurt', frame: 'hurt_sheet.png' };
  }
  if (heroId === 'swag' || assetRoot === 'assets/dog2') {
    return { folder: 'hurt', frame: 'hurt_sheet.png' };
  }
  if (heroId === 'sasuke' || assetRoot === 'assets/sasuke') {
    return { folder: 'hurt', frame: 'hurt003.png' };
  }
  if (heroId === 'elmo-rage' || assetRoot === 'assets/epstein') {
    return { folder: 'Hurt', frame: 'tile003.png' };
  }
  return null;
}

function getDefaultConfuseConfig(hero) {
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const assetRoot = getBattleAssetRoot(hero).toLowerCase();

  if (heroId === 'stone' || assetRoot === 'assets/stone') {
    return { folder: 'confuse', frame: 'confuse.png' };
  }
  if (heroId === 'swag' || assetRoot === 'assets/dog2') {
    return { folder: 'confuse', frame: 'confuse_dog.png' };
  }
  if (heroId === 'sasuke' || assetRoot === 'assets/sasuke') {
    return { folder: 'hurt', frame: 'hurt002.png' };
  }
  if (heroId === 'elmo-rage' || assetRoot === 'assets/epstein') {
    return { folder: 'Hurt', frame: 'tile002.png' };
  }
  return null;
}

function getDefaultDeathConfig(hero) {
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const assetRoot = getBattleAssetRoot(hero).toLowerCase();

  if (heroId === 'stone' || assetRoot === 'assets/stone') {
    return {
      folder: 'death',
      sheet: 'death_sprite.png',
      player1Folder: 'player1_death',
      player2Folder: 'player2_death',
      frameCount: 6,
      player2Reversed: true
    };
  }
  if (heroId === 'swag' || assetRoot === 'assets/dog2') {
    return {
      folder: 'death',
      sheet: 'death_sheet.png',
      player1Folder: 'player1_death',
      player2Folder: 'player2_death',
      frameCount: 4,
      player2Reversed: true
    };
  }
  if (heroId === 'sasuke' || assetRoot === 'assets/sasuke') {
    return {
      folder: 'death',
      sheet: 'death_sheet.png',
      player1Folder: 'Player1_death',
      player2Folder: 'Player2_death',
      frameCount: 4,
      player2Reversed: true
    };
  }
  if (heroId === 'elmo-rage' || assetRoot === 'assets/epstein') {
    return {
      folder: 'death',
      sheet: 'death_sheet.png',
      player1Folder: 'player1_death',
      player2Folder: 'player2_death',
      frameCount: 4,
      player2Reversed: true
    };
  }
  return null;
}

function getDefaultVictoryConfig(hero) {
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const assetRoot = getBattleAssetRoot(hero).toLowerCase();

  if (heroId === 'stone' || assetRoot === 'assets/stone') {
    return {
      folder: 'victory',
      sheet: 'victory_sheet.png',
      player1Folder: 'player1_victory',
      player2Folder: 'player2_victory',
      frameCount: 4,
      player2Reversed: false
    };
  }
  if (heroId === 'swag' || assetRoot === 'assets/dog2') {
    return {
      folder: 'victory',
      sheet: 'victory_sheet.png',
      player1Folder: 'player1_victory',
      player2Folder: 'player2_victory',
      frameCount: 4,
      player2Reversed: true
    };
  }
  if (heroId === 'sasuke' || assetRoot === 'assets/sasuke') {
    return {
      folder: 'victory',
      sheet: 'victory_sheet.png',
      player1Folder: 'player1_victory',
      player2Folder: 'player2_victory',
      frameCount: 4,
      player2Reversed: false
    };
  }
  if (heroId === 'elmo-rage' || assetRoot === 'assets/epstein') {
    return {
      folder: 'victory',
      sheet: 'victory_sheet.png',
      player1Folder: 'player1_victory',
      player2Folder: 'player2_victory',
      frameCount: 4,
      player2Reversed: true
    };
  }
  return null;
}

function getHurtFolder(hero) {
  if (!hero) return 'hurt';
  if (typeof hero.hurtFolder === 'string' && hero.hurtFolder) {
    return hero.hurtFolder.replace(/^\/+|\/+$/g, '');
  }
  const fallbackConfig = getDefaultHurtConfig(hero);
  if (fallbackConfig?.folder) return fallbackConfig.folder;
  return 'hurt';
}

function getConfuseFolder(hero) {
  if (!hero) return getHurtFolder(hero);
  if (typeof hero.confuseFolder === 'string' && hero.confuseFolder) {
    return hero.confuseFolder.replace(/^\/+|\/+$/g, '');
  }
  const fallbackConfig = getDefaultConfuseConfig(hero);
  if (fallbackConfig?.folder) return fallbackConfig.folder;
  return getHurtFolder(hero);
}

function getDeathConfig(hero, playerId) {
  const defaultConfig = getDefaultDeathConfig(hero);
  const folder = typeof hero?.deathFolder === 'string' && hero.deathFolder
    ? hero.deathFolder.replace(/^\/+|\/+$/g, '')
    : defaultConfig?.folder || '';
  const sheet = typeof hero?.deathSheet === 'string' && hero.deathSheet
    ? hero.deathSheet
    : defaultConfig?.sheet || '';
  const player1Folder = typeof hero?.deathPlayer1Folder === 'string' && hero.deathPlayer1Folder
    ? hero.deathPlayer1Folder
    : defaultConfig?.player1Folder || '';
  const player2Folder = typeof hero?.deathPlayer2Folder === 'string' && hero.deathPlayer2Folder
    ? hero.deathPlayer2Folder
    : defaultConfig?.player2Folder || '';
  const playerFolder = playerId === 'player1' ? player1Folder : player2Folder;
  const frameCount = Number(hero?.deathFrameCount) || Number(defaultConfig?.frameCount) || 0;
  const reverseFrames = playerId === 'player2'
    ? (typeof hero?.deathPlayer2Reversed === 'boolean'
      ? hero.deathPlayer2Reversed
      : Boolean(defaultConfig?.player2Reversed))
    : false;
  if (!folder || !sheet || !playerFolder || frameCount < 2) return null;
  return { folder, sheet, playerFolder, frameCount, reverseFrames };
}

function getVictoryConfig(hero, playerId) {
  const defaultConfig = getDefaultVictoryConfig(hero);
  const folder = typeof hero?.victoryFolder === 'string' && hero.victoryFolder
    ? hero.victoryFolder.replace(/^\/+|\/+$/g, '')
    : defaultConfig?.folder || '';
  const sheet = typeof hero?.victorySheet === 'string' && hero.victorySheet
    ? hero.victorySheet
    : defaultConfig?.sheet || '';
  const player1Folder = typeof hero?.victoryPlayer1Folder === 'string' && hero.victoryPlayer1Folder
    ? hero.victoryPlayer1Folder
    : defaultConfig?.player1Folder || '';
  const player2Folder = typeof hero?.victoryPlayer2Folder === 'string' && hero.victoryPlayer2Folder
    ? hero.victoryPlayer2Folder
    : defaultConfig?.player2Folder || '';
  const playerFolder = playerId === 'player1' ? player1Folder : player2Folder;
  const frameCount = Number(hero?.victoryFrameCount) || Number(defaultConfig?.frameCount) || 0;
  const reverseFrames = playerId === 'player2'
    ? (typeof hero?.victoryPlayer2Reversed === 'boolean'
      ? hero.victoryPlayer2Reversed
      : Boolean(defaultConfig?.player2Reversed))
    : false;
  if (!folder || !sheet || !playerFolder || frameCount < 2) return null;
  return { folder, sheet, playerFolder, frameCount, reverseFrames };
}

function getSlapFrame(hero, playerId, filename) {
  const assetRoot = getBattleAssetRoot(hero);
  if (!assetRoot || !filename) return '';
  const slapFolder = getSlapFolder(hero);
  const fallbackConfig = getDefaultSlapConfig(hero);
  const playerFolder = playerId === 'player1'
    ? (typeof hero?.slapPlayer1Folder === 'string' && hero.slapPlayer1Folder
      ? hero.slapPlayer1Folder
      : (fallbackConfig?.player1Folder || 'Player 1'))
    : (typeof hero?.slapPlayer2Folder === 'string' && hero.slapPlayer2Folder
      ? hero.slapPlayer2Folder
      : (fallbackConfig?.player2Folder || 'Player 2'));
  return `${assetRoot}/${slapFolder}/${playerFolder}/${filename}`;
}

function getSlapFrames(hero, playerId) {
  const fallbackConfig = getDefaultSlapConfig(hero);
  const filenames = Array.isArray(hero?.slapFrameFilenames) && hero.slapFrameFilenames.length
    ? hero.slapFrameFilenames
    : (Array.isArray(fallbackConfig?.frameFilenames) && fallbackConfig.frameFilenames.length
      ? fallbackConfig.frameFilenames
      : SLAP_FRAME_FILENAMES);
  return filenames.map(filename => getSlapFrame(hero, playerId, filename)).filter(Boolean);
}

function getSlapSheetPath(hero, playerId) {
  const assetRoot = getBattleAssetRoot(hero);
  if (!assetRoot) return '';
  const slapFolder = getSlapFolder(hero);
  const sheetName = playerId === 'player1'
    ? (typeof hero?.slapSheetPlayer1 === 'string' && hero.slapSheetPlayer1
      ? hero.slapSheetPlayer1
      : (typeof hero?.slapSheet === 'string' ? hero.slapSheet : ''))
    : (typeof hero?.slapSheetPlayer2 === 'string' && hero.slapSheetPlayer2
      ? hero.slapSheetPlayer2
      : (typeof hero?.slapSheet === 'string' ? hero.slapSheet : ''));
  if (!sheetName) return '';
  const playerFolder = playerId === 'player1'
    ? (typeof hero?.slapPlayer1Folder === 'string' && hero.slapPlayer1Folder ? hero.slapPlayer1Folder : 'Player 1')
    : (typeof hero?.slapPlayer2Folder === 'string' && hero.slapPlayer2Folder ? hero.slapPlayer2Folder : 'Player 2');
  return `${assetRoot}/${slapFolder}/${playerFolder}/${sheetName}`;
}

function getSlapSheetConfig(hero, playerId) {
  const path = getSlapSheetPath(hero, playerId);
  const frameCount = Number(hero?.slapFrameCount) || 0;
  if (!path || frameCount < 2) return null;
  const frameWidth = Number(hero?.slapSheetFrameWidth) || 125;
  const frameHeight = Number(hero?.slapSheetFrameHeight) || 250;
  return { path, frameCount, frameWidth, frameHeight };
}

function getHurtFrame(hero, playerId, filename) {
  const assetRoot = getBattleAssetRoot(hero);
  if (!assetRoot || !filename) return '';
  const hurtFolder = getHurtFolder(hero);
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const isDog2 = heroId === 'swag' || assetRoot.toLowerCase() === 'assets/dog2';
  const isStone = heroId === 'stone' || assetRoot.toLowerCase() === 'assets/stone';
  const useSimpleHurtFolders = isDog2 || isStone;
  const playerFolder = playerId === 'player1'
    ? (typeof hero?.hurtPlayer1Folder === 'string' && hero.hurtPlayer1Folder ? hero.hurtPlayer1Folder : (useSimpleHurtFolders ? 'player1_hurt' : 'normal_hurt_player1'))
    : (typeof hero?.hurtPlayer2Folder === 'string' && hero.hurtPlayer2Folder ? hero.hurtPlayer2Folder : (useSimpleHurtFolders ? 'player2_hurt' : 'normal_hurt_player2'));
  return `${assetRoot}/${hurtFolder}/${playerFolder}/${filename}`;
}

function getHurtFrames(hero, playerId) {
  if (Array.isArray(hero?.hurtFrames) && hero.hurtFrames.length) {
    return hero.hurtFrames.map(filename => getHurtFrame(hero, playerId, filename)).filter(Boolean);
  }
  if (typeof hero?.hurtFrame === 'string' && hero.hurtFrame) {
    const hurtFrame = getHurtFrame(hero, playerId, hero.hurtFrame);
    return hurtFrame ? [hurtFrame] : [];
  }
  const fallbackConfig = getDefaultHurtConfig(hero);
  if (fallbackConfig?.frame) {
    const hurtFrame = getHurtFrame(hero, playerId, fallbackConfig.frame);
    return hurtFrame ? [hurtFrame] : [];
  }
  return [];
}

function getConfuseFrame(hero, playerId, filename) {
  const assetRoot = getBattleAssetRoot(hero);
  if (!assetRoot || !filename) return '';
  const confuseFolder = getConfuseFolder(hero);
  const heroId = typeof hero?.id === 'string' ? hero.id.toLowerCase() : '';
  const isDog2 = heroId === 'swag' || assetRoot.toLowerCase() === 'assets/dog2';
  const isStone = heroId === 'stone' || assetRoot.toLowerCase() === 'assets/stone';
  const useSimpleConfuseFolders = isDog2 || isStone;
  const playerFolder = playerId === 'player1'
    ? (typeof hero?.confusePlayer1Folder === 'string' && hero.confusePlayer1Folder ? hero.confusePlayer1Folder : (useSimpleConfuseFolders ? 'player1_confuse' : 'confuse_player1'))
    : (typeof hero?.confusePlayer2Folder === 'string' && hero.confusePlayer2Folder ? hero.confusePlayer2Folder : (useSimpleConfuseFolders ? 'player2_confuse' : 'confuse_player2'));
  return `${assetRoot}/${confuseFolder}/${playerFolder}/${filename}`;
}

function getConfuseFrames(hero, playerId) {
  if (Array.isArray(hero?.confuseFrames) && hero.confuseFrames.length) {
    return hero.confuseFrames.map(filename => getConfuseFrame(hero, playerId, filename)).filter(Boolean);
  }
  if (typeof hero?.confuseFrame === 'string' && hero.confuseFrame) {
    const confuseFrame = getConfuseFrame(hero, playerId, hero.confuseFrame);
    return confuseFrame ? [confuseFrame] : [];
  }
  const fallbackConfig = getDefaultConfuseConfig(hero);
  if (fallbackConfig?.frame) {
    const confuseFrame = getConfuseFrame(hero, playerId, fallbackConfig.frame);
    return confuseFrame ? [confuseFrame] : [];
  }
  return [];
}

function getDeathSheet(hero, playerId) {
  const assetRoot = getBattleAssetRoot(hero);
  const deathConfig = getDeathConfig(hero, playerId);
  if (!assetRoot || !deathConfig) return '';
  return `${assetRoot}/${deathConfig.folder}/${deathConfig.playerFolder}/${deathConfig.sheet}`;
}

function getVictorySheet(hero, playerId) {
  const assetRoot = getBattleAssetRoot(hero);
  const victoryConfig = getVictoryConfig(hero, playerId);
  if (!assetRoot || !victoryConfig) return '';
  return `${assetRoot}/${victoryConfig.folder}/${victoryConfig.playerFolder}/${victoryConfig.sheet}`;
}

function applyHurtPortraitStyle(imageEl, hero, playerId) {
  if (!imageEl) return;
  const hurtAlign = hero?.hurtAlign || null;
  const isPlayer1 = playerId === 'player1';
  const scale = isPlayer1
    ? Number(hurtAlign?.player1Scale) || 0.92
    : Number(hurtAlign?.player2Scale) || 0.86;
  const translateY = 4;

  imageEl.classList.add('is-hurt');
  imageEl.style.maxWidth = 'none';
  if (isPlayer1) {
    imageEl.style.transform = `scale(${scale}) translateY(${translateY}%)`;
  } else {
    imageEl.style.transform = `scaleX(-1) scale(${scale}) translateY(${translateY}%)`;
  }
}

function applyConfusePortraitStyle(imageEl, hero, playerId) {
  if (!imageEl) return;
  const hurtAlign = hero?.hurtAlign || null;
  const isPlayer1 = playerId === 'player1';
  const scale = isPlayer1
    ? Number(hurtAlign?.player1Scale) || 0.92
    : Number(hurtAlign?.player2Scale) || 0.86;
  const translateY = 4;

  imageEl.classList.add('is-hurt');
  imageEl.style.maxWidth = 'none';
  imageEl.style.transform = `scale(${scale}) translateY(${translateY}%)`;
}

function applyDeathPortraitStyle(deathEl, hero, playerId) {
  if (!deathEl) return;
  const deathAlign = hero?.deathAlign || hero?.hurtAlign || null;
  const isPlayer1 = playerId === 'player1';
  const scale = isPlayer1
    ? Number(deathAlign?.player1Scale) || 0.95
    : Number(deathAlign?.player2Scale) || 0.88;
  const translateY = isPlayer1
    ? Number(deathAlign?.player1TranslateY) || 4
    : Number(deathAlign?.player2TranslateY) || 4;
  deathEl.style.transform = `scale(${scale}) translateY(${translateY}%)`;
}

function applyVictoryPortraitStyle(victoryEl, hero, playerId) {
  if (!victoryEl) return;
  const victoryAlign = hero?.victoryAlign || hero?.hurtAlign || null;
  const isPlayer1 = playerId === 'player1';
  const scale = isPlayer1
    ? Number(victoryAlign?.player1Scale) || 0.95
    : Number(victoryAlign?.player2Scale) || 0.88;
  const translateY = isPlayer1
    ? Number(victoryAlign?.player1TranslateY) || 4
    : Number(victoryAlign?.player2TranslateY) || 4;
  victoryEl.style.transform = `scale(${scale}) translateY(${translateY}%)`;
}

function resetPortraitStyle(imageEl) {
  if (!imageEl) return;
  imageEl.classList.remove('is-hurt');
  imageEl.style.removeProperty('max-width');
  imageEl.style.removeProperty('transform');
}

function applyPortrait(imageEl, placeholderEl, src) {
  if (!imageEl || !placeholderEl) return;
  if (src) {
    imageEl.src = src;
    imageEl.dataset.baseSrc = src;
    resetPortraitStyle(imageEl);
    imageEl.classList.add('has-image');
    imageEl.parentElement?.classList.add('has-image');
    placeholderEl.textContent = placeholderEl.id === 'player1Placeholder' ? 'P1' : 'P2';
  } else {
    imageEl.removeAttribute('src');
    delete imageEl.dataset.baseSrc;
    imageEl.classList.remove('has-image');
    imageEl.parentElement?.classList.remove('has-image');
    placeholderEl.textContent = placeholderEl.id === 'player1Placeholder' ? 'P1' : 'P2';
  }
}

function resetDeathOverlay(playerId) {
  const deathEl = document.getElementById(`${playerId}Death`);
  const imageEl = document.getElementById(`${playerId}Portrait`);
  if (deathEl) {
    deathEl.style.removeProperty('background-image');
    deathEl.style.removeProperty('background-size');
    deathEl.style.removeProperty('background-position');
    deathEl.style.removeProperty('transform');
  }
  if (imageEl) {
    imageEl.parentElement?.classList.remove('is-dead');
    imageEl.style.removeProperty('opacity');
  }
}

function resetVictoryOverlay(playerId) {
  const victoryEl = document.getElementById(`${playerId}Victory`);
  const imageEl = document.getElementById(`${playerId}Portrait`);
  if (victoryEl) {
    victoryEl.style.removeProperty('background-image');
    victoryEl.style.removeProperty('background-size');
    victoryEl.style.removeProperty('background-position');
    victoryEl.style.removeProperty('transform');
  }
  if (imageEl) {
    imageEl.parentElement?.classList.remove('is-victory');
    imageEl.style.removeProperty('opacity');
  }
}

function isPlayerStunned(playerId) {
  return Date.now() < (ARENA_STATE.stunUntil[playerId] || 0);
}

function getStunRemainingMs(playerId) {
  return Math.max(0, (ARENA_STATE.stunUntil[playerId] || 0) - Date.now());
}

function clearPlayerStun(playerId) {
  ARENA_STATE.stunUntil[playerId] = 0;
  if (playerId === 'player1' && player1StunTimeoutId) {
    window.clearTimeout(player1StunTimeoutId);
    player1StunTimeoutId = null;
  }
  if (playerId === 'player2' && player2StunTimeoutId) {
    window.clearTimeout(player2StunTimeoutId);
    player2StunTimeoutId = null;
  }
}

function handleKeydown(event) {
  if (ARENA_STATE.isOver || event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'a') {
    event.preventDefault();
    if (isPlayerStunned('player1')) {
      const remaining = Math.ceil(getStunRemainingMs('player1') / 100) / 10;
      showBattleStatus(`${ARENA_STATE.fighters.player1.name} is confused for ${remaining.toFixed(1)}s.`);
      return;
    }
    triggerSlap('player1', 'player2');
  } else if (key === 'l') {
    event.preventDefault();
    if (isPlayerStunned('player2')) {
      const remaining = Math.ceil(getStunRemainingMs('player2') / 100) / 10;
      showBattleStatus(`${ARENA_STATE.fighters.player2.name} is confused for ${remaining.toFixed(1)}s.`);
      return;
    }
    triggerSlap('player2', 'player1');
  }
}

function triggerSlap(attackerId, defenderId) {
  if (isPlayerStunned(attackerId)) return;
  const now = Date.now();
  const elapsed = now - ARENA_STATE.lastSlapAt[attackerId];
  if (elapsed < ARENA_STATE.slapCooldownMs) return;

  ARENA_STATE.lastSlapAt[attackerId] = now;

  const meterGain = getMeterGain(elapsed);
  ARENA_STATE.slapMeters[attackerId] = Math.min(100, ARENA_STATE.slapMeters[attackerId] + meterGain);
  const isCritical = ARENA_STATE.slapMeters[attackerId] >= 100;
  const damage = isCritical ? ARENA_STATE.criticalDamage : ARENA_STATE.slapDamage;

  if (isCritical) {
    ARENA_STATE.slapMeters[attackerId] = 0;
  }

  const defender = ARENA_STATE.fighters[defenderId];
  defender.health = Math.max(0, defender.health - damage);

  if (attackerId === 'player1') {
    playPlayer1SlapAnimation();
  } else if (attackerId === 'player2') {
    playPlayer2SlapAnimation();
  }
  if (isCritical) {
    playCriticalSoundEffect();
  } else {
    playHitSoundEffect();
  }

  animateHit(attackerId, defenderId, isCritical);
  renderArena();

  if (defender.health === 0) {
    ARENA_STATE.isOver = true;
    ARENA_STATE.winner = attackerId;
    playDeathAnimation(defenderId);
    playVictoryAnimation(attackerId);
    showBattleStatus(isCritical
      ? `${ARENA_STATE.fighters[attackerId].name} lands a critical slapout.`
      : `${ARENA_STATE.fighters[attackerId].name} wins by slapout.`);
  } else {
    showBattleStatus(isCritical
      ? `${ARENA_STATE.fighters[attackerId].name} triggers a critical slap! ${ARENA_STATE.fighters[defenderId].name} is stunned!`
      : `${ARENA_STATE.fighters[attackerId].name} slaps ${ARENA_STATE.fighters[defenderId].name}!`);
  }
}

function getMeterGain(elapsedMs) {
  if (elapsedMs <= 220) return 18;
  if (elapsedMs <= 360) return 12;
  if (elapsedMs <= 540) return 8;
  if (elapsedMs <= 800) return 5;
  return 3;
}

function positionImpactText(defenderEl, defenderId, impactText) {
  if (!defenderEl || !impactText) return;
  const rect = defenderEl.getBoundingClientRect();
  const x = defenderId === 'player2'
    ? rect.left + rect.width * 0.72
    : rect.left + rect.width * 0.28;
  const y = rect.top + rect.height * 0.2;

  impactText.style.left = `${x}px`;
  impactText.style.top = `${y}px`;
}

function animateHit(attackerId, defenderId, isCritical) {
  const attackerEl = document.querySelector(`.fighter[data-side="${attackerId}"]`);
  const defenderEl = document.querySelector(`.fighter[data-side="${defenderId}"]`);
  const impactText = document.getElementById('impactText');

  attackerEl?.classList.add('is-hit');
  defenderEl?.classList.add('is-hit');
  if (isCritical) {
    applyCriticalStun(defenderId);
  } else if (!isPlayerStunned(defenderId)) {
    playPlayerHurtAnimation(defenderId);
  }
  if (defenderEl) {
    defenderEl.classList.remove('show-hit-effect-normal', 'show-hit-effect-critical');
    void defenderEl.offsetWidth;
    defenderEl.classList.add(isCritical ? 'show-hit-effect-critical' : 'show-hit-effect-normal');
  }
  positionImpactText(defenderEl, defenderId, impactText);
  impactText && (impactText.textContent = isCritical ? 'CRITICAL!' : 'SLAP!');
  impactText?.classList.add('is-visible');

  if (hitEffectAnimationId) {
    window.clearTimeout(hitEffectAnimationId);
  }

  hitEffectAnimationId = window.setTimeout(() => {
    attackerEl?.classList.remove('is-hit');
    defenderEl?.classList.remove('is-hit');
    defenderEl?.classList.remove('show-hit-effect-normal', 'show-hit-effect-critical');
    impactText?.classList.remove('is-visible');
    if (impactText) {
      impactText.textContent = 'SLAP!';
      impactText.style.removeProperty('left');
      impactText.style.removeProperty('top');
    }
    hitEffectAnimationId = null;
  }, 240);
}

function renderArena() {
  renderHealth('player1', 'player1HealthFill', 'player1HealthText');
  renderHealth('player2', 'player2HealthFill', 'player2HealthText');
  renderMeter('player1', 'player1MeterFill', 'player1MeterText');
  renderMeter('player2', 'player2MeterFill', 'player2MeterText');
  if (!ARENA_STATE.isOver) {
    showBattleStatus('Ready to slap.');
  }
}

function renderHealth(playerId, fillId, textId) {
  const fighter = ARENA_STATE.fighters[playerId];
  const fill = document.getElementById(fillId);
  const text = document.getElementById(textId);
  const pct = (fighter.health / ARENA_STATE.maxHealth) * 100;

  if (fill) {
    fill.style.width = `${pct}%`;
  }
  if (text) {
    text.textContent = `${fighter.health} / ${ARENA_STATE.maxHealth}`;
  }
}

function renderMeter(playerId, fillId, textId) {
  const meter = ARENA_STATE.slapMeters[playerId];
  const fill = document.getElementById(fillId);
  const text = document.getElementById(textId);

  if (fill) {
    fill.style.width = `${meter}%`;
  }
  if (text) {
    text.textContent = `${meter}%`;
  }
}

function showBattleStatus(message) {
  const status = document.getElementById('battleStatus');
  if (status) status.textContent = message;
}

function pickRandom(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[Math.floor(Math.random() * list.length)] || '';
}

function playSoundEffect(src, volume = 1) {
  if (!src) return;
  try {
    let base = soundCache.get(src);
    if (!base) {
      base = new Audio(src);
      base.preload = 'auto';
      soundCache.set(src, base);
    }

    const clip = base.cloneNode();
    clip.volume = Math.max(0, Math.min(1, volume));
    const playPromise = clip.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  } catch (error) {
    // Ignore playback issues (unsupported format/autoplay policies)
  }
}

function playHitSoundEffect() {
  playSoundEffect(pickRandom(HIT_SOUND_FILES), 0.8);
}

function playHurtSoundEffect() {
  playSoundEffect(pickRandom(HURT_SOUND_FILES), 0.85);
}

function playCriticalSoundEffect() {
  playSoundEffect(CRITICAL_SOUND_FILE, 0.95);
}

function playDeathSoundEffect() {
  playSoundEffect(DEATH_SOUND_FILE, 0.95);
}

function playVictorySoundEffect() {
  playSoundEffect(VICTORY_SOUND_FILE, 0.95);
}

function applyCriticalStun(playerId) {
  const fighter = ARENA_STATE.fighters[playerId];
  const confuseFrames = getConfuseFrames(fighter?.hero, playerId);
  if (!confuseFrames.length) return;

  ARENA_STATE.stunUntil[playerId] = Date.now() + ARENA_STATE.stunDurationMs;

  if (playerId === 'player1' && player1StunTimeoutId) {
    window.clearTimeout(player1StunTimeoutId);
    player1StunTimeoutId = null;
  }
  if (playerId === 'player2' && player2StunTimeoutId) {
    window.clearTimeout(player2StunTimeoutId);
    player2StunTimeoutId = null;
  }

  playConfuseAnimation(playerId, confuseFrames, ARENA_STATE.stunDurationMs);

  const clearStunTimer = window.setTimeout(() => {
    clearPlayerStun(playerId);
  }, ARENA_STATE.stunDurationMs + 30);

  if (playerId === 'player1') {
    player1StunTimeoutId = clearStunTimer;
  } else {
    player2StunTimeoutId = clearStunTimer;
  }
}

function playDeathAnimation(playerId) {
  const fighter = ARENA_STATE.fighters[playerId];
  const hero = fighter?.hero || null;
  const deathSheet = getDeathSheet(hero, playerId);
  const deathConfig = getDeathConfig(hero, playerId);
  const deathEl = document.getElementById(`${playerId}Death`);
  const imageEl = document.getElementById(`${playerId}Portrait`);
  if (!deathSheet || !deathConfig || !deathEl || !imageEl) return;
  playDeathSoundEffect();

  clearPlayerStun(playerId);
  if (playerId === 'player1') {
    player1SlapAnimationToken += 1;
    player1HurtAnimationToken += 1;
    player1ConfuseAnimationToken += 1;
    if (player1SlapAnimationId) {
      window.clearTimeout(player1SlapAnimationId);
      player1SlapAnimationId = null;
    }
    if (player1HurtAnimationId) {
      window.clearTimeout(player1HurtAnimationId);
      player1HurtAnimationId = null;
    }
    if (player1ConfuseAnimationId) {
      window.clearTimeout(player1ConfuseAnimationId);
      player1ConfuseAnimationId = null;
    }
    player1DeathAnimationToken += 1;
  } else {
    player2SlapAnimationToken += 1;
    player2HurtAnimationToken += 1;
    player2ConfuseAnimationToken += 1;
    if (player2SlapAnimationId) {
      window.clearTimeout(player2SlapAnimationId);
      player2SlapAnimationId = null;
    }
    if (player2HurtAnimationId) {
      window.clearTimeout(player2HurtAnimationId);
      player2HurtAnimationId = null;
    }
    if (player2ConfuseAnimationId) {
      window.clearTimeout(player2ConfuseAnimationId);
      player2ConfuseAnimationId = null;
    }
    player2DeathAnimationToken += 1;
  }

  const frameCount = deathConfig.frameCount;
  const animationToken = playerId === 'player1' ? player1DeathAnimationToken : player2DeathAnimationToken;
  const frameOrder = deathConfig.reverseFrames
    ? Array.from({ length: frameCount }, (_, i) => frameCount - 1 - i)
    : Array.from({ length: frameCount }, (_, i) => i);
  const frameDuration = 140;

  deathEl.style.backgroundImage = `url("${deathSheet}")`;
  deathEl.style.backgroundSize = `${frameCount * 100}% 100%`;
  applyDeathPortraitStyle(deathEl, hero, playerId);
  imageEl.parentElement?.classList.add('is-dead', 'has-image');
  imageEl.style.opacity = '0';

  frameOrder.forEach((frame, index) => {
    window.setTimeout(() => {
      const currentToken = playerId === 'player1' ? player1DeathAnimationToken : player2DeathAnimationToken;
      if (currentToken !== animationToken) return;
      const framePos = frameCount > 1 ? (frame * 100) / (frameCount - 1) : 0;
      deathEl.style.backgroundPosition = `${framePos}% 0%`;
    }, index * frameDuration);
  });
}

function playVictoryAnimation(playerId) {
  const fighter = ARENA_STATE.fighters[playerId];
  const hero = fighter?.hero || null;
  const victorySheet = getVictorySheet(hero, playerId);
  const victoryConfig = getVictoryConfig(hero, playerId);
  const victoryEl = document.getElementById(`${playerId}Victory`);
  const imageEl = document.getElementById(`${playerId}Portrait`);
  if (!victorySheet || !victoryConfig || !victoryEl || !imageEl) return;
  playVictorySoundEffect();

  clearPlayerStun(playerId);
  if (playerId === 'player1') {
    player1SlapAnimationToken += 1;
    player1HurtAnimationToken += 1;
    player1ConfuseAnimationToken += 1;
    if (player1SlapAnimationId) {
      window.clearTimeout(player1SlapAnimationId);
      player1SlapAnimationId = null;
    }
    if (player1HurtAnimationId) {
      window.clearTimeout(player1HurtAnimationId);
      player1HurtAnimationId = null;
    }
    if (player1ConfuseAnimationId) {
      window.clearTimeout(player1ConfuseAnimationId);
      player1ConfuseAnimationId = null;
    }
    player1VictoryAnimationToken += 1;
  } else {
    player2SlapAnimationToken += 1;
    player2HurtAnimationToken += 1;
    player2ConfuseAnimationToken += 1;
    if (player2SlapAnimationId) {
      window.clearTimeout(player2SlapAnimationId);
      player2SlapAnimationId = null;
    }
    if (player2HurtAnimationId) {
      window.clearTimeout(player2HurtAnimationId);
      player2HurtAnimationId = null;
    }
    if (player2ConfuseAnimationId) {
      window.clearTimeout(player2ConfuseAnimationId);
      player2ConfuseAnimationId = null;
    }
    player2VictoryAnimationToken += 1;
  }

  const frameCount = victoryConfig.frameCount;
  const animationToken = playerId === 'player1' ? player1VictoryAnimationToken : player2VictoryAnimationToken;
  const frameOrder = victoryConfig.reverseFrames
    ? Array.from({ length: frameCount }, (_, i) => frameCount - 1 - i)
    : Array.from({ length: frameCount }, (_, i) => i);
  const frameDuration = 140;

  victoryEl.style.backgroundImage = `url("${victorySheet}")`;
  victoryEl.style.backgroundSize = `${frameCount * 100}% 100%`;
  applyVictoryPortraitStyle(victoryEl, hero, playerId);
  imageEl.parentElement?.classList.add('is-victory', 'has-image');
  imageEl.style.opacity = '0';

  frameOrder.forEach((frame, index) => {
    window.setTimeout(() => {
      const currentToken = playerId === 'player1' ? player1VictoryAnimationToken : player2VictoryAnimationToken;
      if (currentToken !== animationToken) return;
      const framePos = frameCount > 1 ? (frame * 100) / (frameCount - 1) : 0;
      victoryEl.style.backgroundPosition = `${framePos}% 0%`;
    }, index * frameDuration);
  });
}

function playPlayerHurtAnimation(playerId) {
  const fighter = ARENA_STATE.fighters[playerId];
  const hurtFrames = getHurtFrames(fighter?.hero, playerId);
  if (!hurtFrames.length) return;
  playHurtSoundEffect();
  playHurtAnimation(playerId, hurtFrames);
}

function playConfuseAnimation(playerId, frames, durationMs) {
  const imageEl = document.getElementById(`${playerId}Portrait`);
  const placeholderEl = document.getElementById(`${playerId}Placeholder`);
  if (!imageEl || !placeholderEl || !frames.length) return;

  const hero = ARENA_STATE.fighters[playerId]?.hero || null;
  const baseSrc = imageEl.dataset.baseSrc || '';
  imageEl.dataset.baseSrc = baseSrc;

  if (playerId === 'player1') {
    player1SlapAnimationToken += 1;
    player1HurtAnimationToken += 1;
    if (player1SlapAnimationId) {
      window.clearTimeout(player1SlapAnimationId);
      player1SlapAnimationId = null;
    }
    if (player1HurtAnimationId) {
      window.clearTimeout(player1HurtAnimationId);
      player1HurtAnimationId = null;
    }
    if (player1ConfuseAnimationId) {
      window.clearTimeout(player1ConfuseAnimationId);
      player1ConfuseAnimationId = null;
    }
    player1ConfuseAnimationToken += 1;
  } else {
    player2SlapAnimationToken += 1;
    player2HurtAnimationToken += 1;
    if (player2SlapAnimationId) {
      window.clearTimeout(player2SlapAnimationId);
      player2SlapAnimationId = null;
    }
    if (player2HurtAnimationId) {
      window.clearTimeout(player2HurtAnimationId);
      player2HurtAnimationId = null;
    }
    if (player2ConfuseAnimationId) {
      window.clearTimeout(player2ConfuseAnimationId);
      player2ConfuseAnimationId = null;
    }
    player2ConfuseAnimationToken += 1;
  }

  const animationToken = playerId === 'player1' ? player1ConfuseAnimationToken : player2ConfuseAnimationToken;
  applyConfusePortraitStyle(imageEl, hero, playerId);
  imageEl.parentElement?.classList.add('has-image');
  placeholderEl.textContent = playerId === 'player1' ? 'P1' : 'P2';
  imageEl.src = frames[0];
  imageEl.classList.add('has-image');

  const resetId = window.setTimeout(() => {
    const currentToken = playerId === 'player1' ? player1ConfuseAnimationToken : player2ConfuseAnimationToken;
    if (currentToken !== animationToken) return;

    if (baseSrc) {
      imageEl.src = baseSrc;
      resetPortraitStyle(imageEl);
      imageEl.classList.add('has-image');
    } else {
      imageEl.removeAttribute('src');
      resetPortraitStyle(imageEl);
      imageEl.classList.remove('has-image');
      imageEl.parentElement?.classList.remove('has-image');
    }

    if (playerId === 'player1') {
      player1ConfuseAnimationId = null;
    } else {
      player2ConfuseAnimationId = null;
    }
  }, durationMs);

  if (playerId === 'player1') {
    player1ConfuseAnimationId = resetId;
  } else {
    player2ConfuseAnimationId = resetId;
  }
}

function playPlayer1SlapAnimation() {
  const hero = ARENA_STATE.fighters.player1.hero;
  const frames = getSlapFrames(hero, 'player1');
  if (frames.length) {
    playSlapAnimation('player1', frames);
    return;
  }
  const sheetConfig = getSlapSheetConfig(hero, 'player1');
  if (sheetConfig) {
    playSlapSheetAnimation('player1', hero, sheetConfig);
    return;
  }
  playSlapAnimation('player1', []);
}

function playPlayer2SlapAnimation() {
  const hero = ARENA_STATE.fighters.player2.hero;
  const frames = getSlapFrames(hero, 'player2');
  if (frames.length) {
    playSlapAnimation('player2', frames);
    return;
  }
  const sheetConfig = getSlapSheetConfig(hero, 'player2');
  if (sheetConfig) {
    playSlapSheetAnimation('player2', hero, sheetConfig);
    return;
  }
  playSlapAnimation('player2', []);
}

function playSlapSheetAnimation(playerId, hero, sheetConfig) {
  const imageEl = document.getElementById(`${playerId}Portrait`);
  const placeholderEl = document.getElementById(`${playerId}Placeholder`);
  if (!imageEl || !placeholderEl || !sheetConfig) return;

  resetPortraitStyle(imageEl);
  const baseSrc = imageEl.dataset.baseSrc || '';
  imageEl.dataset.baseSrc = baseSrc;

  if (playerId === 'player1' && player1SlapAnimationId) {
    window.clearTimeout(player1SlapAnimationId);
    player1SlapAnimationId = null;
  }
  if (playerId === 'player2' && player2SlapAnimationId) {
    window.clearTimeout(player2SlapAnimationId);
    player2SlapAnimationId = null;
  }

  if (playerId === 'player1') {
    player1HurtAnimationToken += 1;
    if (player1HurtAnimationId) {
      window.clearTimeout(player1HurtAnimationId);
      player1HurtAnimationId = null;
    }
    player1SlapAnimationToken += 1;
  } else {
    player2HurtAnimationToken += 1;
    if (player2HurtAnimationId) {
      window.clearTimeout(player2HurtAnimationId);
      player2HurtAnimationId = null;
    }
    player2SlapAnimationToken += 1;
  }

  const animationToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
  const frameDuration = 45;
  const { path, frameCount, frameWidth, frameHeight } = sheetConfig;
  const totalWidth = frameCount * frameWidth;

  imageEl.parentElement?.classList.add('has-image');
  placeholderEl.textContent = playerId === 'player1' ? 'P1' : 'P2';
  imageEl.src = path;
  imageEl.classList.add('has-image');
  imageEl.style.maxWidth = 'none';
  imageEl.style.width = 'auto';
  imageEl.style.height = '100%';
  imageEl.style.objectFit = 'none';
  imageEl.style.objectPosition = `0px top`;
  imageEl.style.aspectRatio = `${totalWidth} / ${frameHeight}`;

  for (let i = 0; i < frameCount; i += 1) {
    window.setTimeout(() => {
      const currentToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
      if (currentToken !== animationToken) return;
      const x = -(i * frameWidth);
      imageEl.style.objectPosition = `${x}px top`;
    }, i * frameDuration);
  }

  const resetId = window.setTimeout(() => {
    const currentToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
    if (currentToken !== animationToken) return;

    if (baseSrc) {
      imageEl.src = baseSrc;
      imageEl.classList.add('has-image');
    } else {
      imageEl.removeAttribute('src');
      imageEl.classList.remove('has-image');
      imageEl.parentElement?.classList.remove('has-image');
    }
    imageEl.style.removeProperty('max-width');
    imageEl.style.removeProperty('width');
    imageEl.style.removeProperty('height');
    imageEl.style.removeProperty('object-fit');
    imageEl.style.removeProperty('object-position');
    imageEl.style.removeProperty('aspect-ratio');

    if (playerId === 'player1') {
      player1SlapAnimationId = null;
    } else {
      player2SlapAnimationId = null;
    }
  }, frameCount * frameDuration + 15);

  if (playerId === 'player1') {
    player1SlapAnimationId = resetId;
  } else {
    player2SlapAnimationId = resetId;
  }
}

function playHurtAnimation(playerId, frames) {
  const imageEl = document.getElementById(`${playerId}Portrait`);
  const placeholderEl = document.getElementById(`${playerId}Placeholder`);
  if (!imageEl || !placeholderEl || !frames.length) return;

  const hero = ARENA_STATE.fighters[playerId]?.hero || null;
  const baseSrc = imageEl.dataset.baseSrc || '';
  imageEl.dataset.baseSrc = baseSrc;

  if (playerId === 'player1') {
    player1SlapAnimationToken += 1;
    if (player1SlapAnimationId) {
      window.clearTimeout(player1SlapAnimationId);
      player1SlapAnimationId = null;
    }
  }
  if (playerId === 'player2') {
    player2SlapAnimationToken += 1;
    if (player2SlapAnimationId) {
      window.clearTimeout(player2SlapAnimationId);
      player2SlapAnimationId = null;
    }
  }

  if (playerId === 'player1' && player1HurtAnimationId) {
    window.clearTimeout(player1HurtAnimationId);
    player1HurtAnimationId = null;
  }
  if (playerId === 'player2' && player2HurtAnimationId) {
    window.clearTimeout(player2HurtAnimationId);
    player2HurtAnimationId = null;
  }

  if (playerId === 'player1') {
    player1HurtAnimationToken += 1;
  } else {
    player2HurtAnimationToken += 1;
  }

  const animationToken = playerId === 'player1' ? player1HurtAnimationToken : player2HurtAnimationToken;
  const frameDuration = 40;

  applyHurtPortraitStyle(imageEl, hero, playerId);
  imageEl.parentElement?.classList.add('has-image');
  placeholderEl.textContent = playerId === 'player1' ? 'P1' : 'P2';

  frames.forEach((frameSrc, index) => {
    window.setTimeout(() => {
      const currentToken = playerId === 'player1' ? player1HurtAnimationToken : player2HurtAnimationToken;
      if (currentToken !== animationToken) return;
      imageEl.src = frameSrc;
      imageEl.classList.add('has-image');
    }, index * frameDuration);
  });

  const resetId = window.setTimeout(() => {
    const currentToken = playerId === 'player1' ? player1HurtAnimationToken : player2HurtAnimationToken;
    if (currentToken !== animationToken) return;

    if (baseSrc) {
      imageEl.src = baseSrc;
      resetPortraitStyle(imageEl);
      imageEl.classList.add('has-image');
    } else {
      imageEl.removeAttribute('src');
      resetPortraitStyle(imageEl);
      imageEl.classList.remove('has-image');
      imageEl.parentElement?.classList.remove('has-image');
    }

    if (playerId === 'player1') {
      player1HurtAnimationId = null;
    } else {
      player2HurtAnimationId = null;
    }
  }, frames.length * frameDuration + 60);

  if (playerId === 'player1') {
    player1HurtAnimationId = resetId;
  } else {
    player2HurtAnimationId = resetId;
  }
}

function playSlapAnimation(playerId, frames) {
  const imageEl = document.getElementById(`${playerId}Portrait`);
  const placeholderEl = document.getElementById(`${playerId}Placeholder`);
  if (!imageEl || !placeholderEl) return;

  resetPortraitStyle(imageEl);
  const baseSrc = imageEl.dataset.baseSrc || '';
  imageEl.dataset.baseSrc = baseSrc;

  if (playerId === 'player1' && player1SlapAnimationId) {
    window.clearTimeout(player1SlapAnimationId);
    player1SlapAnimationId = null;
  }
  if (playerId === 'player2' && player2SlapAnimationId) {
    window.clearTimeout(player2SlapAnimationId);
    player2SlapAnimationId = null;
  }

  if (playerId === 'player1') {
    player1HurtAnimationToken += 1;
    if (player1HurtAnimationId) {
      window.clearTimeout(player1HurtAnimationId);
      player1HurtAnimationId = null;
    }
    player1SlapAnimationToken += 1;
  } else {
    player2HurtAnimationToken += 1;
    if (player2HurtAnimationId) {
      window.clearTimeout(player2HurtAnimationId);
      player2HurtAnimationId = null;
    }
    player2SlapAnimationToken += 1;
  }

  const animationToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
  const frameDuration = 45;

  imageEl.parentElement?.classList.add('has-image');
  placeholderEl.textContent = playerId === 'player1' ? 'P1' : 'P2';

  frames.forEach((frameSrc, index) => {
    window.setTimeout(() => {
      const currentToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
      if (currentToken !== animationToken) return;
      imageEl.src = frameSrc;
      imageEl.classList.add('has-image');
    }, index * frameDuration);
  });

  const resetId = window.setTimeout(() => {
    const currentToken = playerId === 'player1' ? player1SlapAnimationToken : player2SlapAnimationToken;
    if (currentToken !== animationToken) return;

    if (baseSrc) {
      imageEl.src = baseSrc;
      imageEl.classList.add('has-image');
    } else {
      imageEl.removeAttribute('src');
      imageEl.classList.remove('has-image');
      imageEl.parentElement?.classList.remove('has-image');
    }

    if (playerId === 'player1') {
      player1SlapAnimationId = null;
    } else {
      player2SlapAnimationId = null;
    }
  }, frames.length * frameDuration + 10);

  if (playerId === 'player1') {
    player1SlapAnimationId = resetId;
  } else {
    player2SlapAnimationId = resetId;
  }
}
