(() => {
  const raw = window.ENGLISH_2000_DATA;
  if (!raw || !Array.isArray(raw.words)) {
    document.body.innerHTML = '<main class="app"><section class="panel stage">找不到 english-2000-data.js。</section></main>';
    return;
  }

  const STORE_KEY = 'english-2000-progress-v1';
  const LEVEL_SIZE = 20;
  const chapters = raw.chapters || [];
  const units = raw.units || [];
  const chapterMap = new Map(chapters.map((chapter) => [chapter.chapterNo, chapter]));
  const unitMap = new Map(units.map((unit) => [unit.unitNo, unit]));
  const words = raw.words.map((word) => ({
    ...word,
    word: String(word.word || '').trim(),
    translation: String(word.translation || '').trim(),
    exampleZh: String(word.exampleZh || '').trim(),
    partOfSpeech: String(word.partOfSpeech || '').trim(),
    examples: Array.isArray(word.examples) ? word.examples : [],
    examplesZh: Array.isArray(word.examplesZh) ? word.examplesZh : []
  })).filter((word) => word.word);
  const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/';
  const OPENMOJI_BASE = 'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/';
  const EXACT_EMOJI = {
    baby: '👶', born: '🍼', child: '🧒', kid: '🧒', childhood: '🧸', boy: '👦', girl: '👧', teenager: '🧑', youth: '🌱', adult: '🧑', man: '👨', guy: '👨', woman: '👩', male: '👨', female: '👩',
    kingdom: '🏰', castle: '🏰', king: '👑', queen: '👑', beauty: '🌹', prince: '🤴', princess: '👸', master: '🎓', angel: '👼', god: '⚡', human: '🧑', person: '🧑', people: '👥', common: '🏘️', servant: '🍽️', farmer: '🌾',
    title: '🏷️', sir: '🎩', mr: '🎩', miss: '🙋', maam: '🙋', ms: '🙋', mrs: '💍', married: '💍', gentleman: '🎩', lady: '👒', dr: '🩺', dear: '💌', name: '🏷️', 'first name': '🏷️', 'last name family name': '🏷️',
    artist: '🎨', create: '💡', paint: '🎨', painter: '🎨', actor: '🎭', actress: '🎭', act: '🎭', cowboy: '🤠', player: '⚾', magician: '🎩', magic: '🪄', model: '💃', musician: '🎹', singer: '🎤', sing: '🎤',
    company: '🏢', manager: '💼', assistant: '📋', secretary: '☎️', army: '🎖️', captain: '⚓', general: '🎖️', major: '🎖️', sailor: '⚓', soldier: '🎖️', tank: '🛡️', president: '🏛️', officer: '🚓', police: '🚓', duty: '✅', thief: '💰',
    doctor: '🩺', dentist: '🦷', nurse: '🏥', diplomat: '🤝', judge: '⚖️', lawyer: '⚖️', mechanic: '🔧', check: '✅', engineer: '🏗️', operation: '🏥', scientist: '🔬', invent: '💡', coach: '🏅',
    service: '🛎️', barber: '💈', 'hair dresser': '💇', cook: '🍳', waiter: '🍽️', waitress: '🍽️', serve: '🍽️', driver: '🚕', mailman: '📮', mail: '✉️', guide: '🧭', lead: '🧭', journalist: '📰', reporter: '🎙️', writer: '✍️', deliver: '📦',
    boss: '💼', owner: '🔑', own: '🔑', businessman: '💼', business: '🏢', branch: '🏬', employ: '🤝', worker: '👷', hire: '🤝', meeting: '🗣️', contract: '📄', clerk: '🧾', job: '💼', work: '💼', experience: '🏆', earn: '💵', income: '💵', salary: '💵', production: '🏭',
    salesman: '🛒', sell: '🛒', thing: '📦', discover: '🔎', valuable: '💎', increase: '📈', sale: '🏷️', decrease: '📉', find: '🔎', produce: '🏭', advertisement: '📣', compare: '⚖️', complain: '☎️', satisfy: '👍', express: '💬',
    success: '🏆', succeed: '🎯', become: '🌱', effort: '💪', gather: '📚', useful: '🧰', stay: '🪑', positive: '☀️', cheerleader: '📣', continue: '➡️', focus: '🎯', ready: '🟢', handle: '🧩', difficult: '⛰️', develop: '🌱'
  };
  const KEYWORD_EMOJI = [
    [/apple|banana|orange|fruit|grape|lemon|melon|peach|pear|berry|mango/i, '🍎'],
    [/rice|noodle|bread|pizza|burger|cake|cookie|snack|food|meal|breakfast|lunch|dinner/i, '🍽️'],
    [/vegetable|carrot|onion|potato|tomato|bean|corn|cabbage/i, '🥕'],
    [/meat|beef|pork|chicken|egg|fish/i, '🍗'],
    [/shirt|dress|coat|pants|shoe|hat|sock|wear|clothes|jacket|uniform/i, '👕'],
    [/red|blue|green|yellow|black|white|color|purple|pink|brown|gray/i, '🎨'],
    [/ball|baseball|basketball|soccer|tennis|swim|run|sport|game|toy|hobby|music|piano|guitar/i, '🏀'],
    [/dog|cat|bird|horse|cow|pig|animal|plant|tree|flower|leaf|grass/i, '🐾'],
    [/rain|sun|cloud|wind|snow|weather|nature|mountain|river|sea|ocean|sky/i, '🌤️'],
    [/car|bus|train|bike|plane|ship|taxi|truck|traffic|road|station|transport/i, '🚗'],
    [/school|class|teacher|student|test|book|pen|pencil|paper|language|math|course/i, '📚'],
    [/home|house|room|bed|kitchen|bathroom|sofa|table|chair|door|window/i, '🏠'],
    [/internet|computer|phone|message|information|news|media|web|online/i, '💻'],
    [/crime|war|fight|danger|safe|gun|attack|steal|law/i, '🛡️'],
    [/money|dollar|coin|price|pay|buy|cost|cash|bank/i, '💵'],
    [/time|day|week|month|year|hour|minute|morning|night|season|date/i, '🕒'],
    [/family|father|mother|parent|son|daughter|brother|sister|wife|husband/i, '👨‍👩‍👧'],
    [/happy|sad|angry|afraid|mood|emotion|smile|cry/i, '🙂'],
    [/face|eye|ear|nose|mouth|head|body|health|sick|cold|flu|hurt|pain/i, '🩺'],
    [/place|location|city|country|street|building|park|store|restaurant/i, '📍'],
    [/number|one|two|three|first|second|third|many|few|meter|weight|size|measure/i, '🔢']
  ];
  const CHAPTER_EMOJI = {
    1: '🧑', 2: '💼', 3: '🙂', 4: '🩺', 5: '👨‍👩‍👧', 6: '🔢', 7: '🕒', 8: '💵', 9: '🍽️', 10: '👕',
    11: '🏀', 12: '💻', 13: '🤝', 14: '🏠', 15: '📚', 16: '📍', 17: '🚗', 18: '📏', 19: '🎉', 20: '🌤️',
    21: '🐾', 22: '↔️', 23: '🔁', 24: '⚡', 25: '✅', 26: '❓', 27: '🔤', 28: '👤', 29: '🧭', 30: '🔗'
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    focusToggle: $('focus-toggle'),
    tabs: $('tabs'), search: $('search'), chapterSelect: $('chapter-select'), unitSelect: $('unit-select'), levelSelect: $('level-select'), chips: $('chips'),
    speakCurrent: $('speak-current'), shuffle: $('shuffle'), reset: $('reset'),
    deckLabel: $('deck-label'), deckPercent: $('deck-percent'), deckMeter: $('deck-meter'),
    levelLabel: $('level-label'), quizScore: $('quiz-score'), quizRate: $('quiz-rate'), quizGrade: $('quiz-grade'), levelFamiliarity: $('level-familiarity'),
    views: {
      cards: $('cards-view'), meaning: $('meaning-view'), listen: $('listen-view'), spell: $('spell-view'), scramble: $('scramble-view'),
      falling: $('falling-view'), mole: $('mole-view'), speed: $('speed-view'), judge: $('judge-view'), list: $('list-view')
    },
    card: $('card'), cardScope: $('card-scope'), front: $('front'), back: $('back'), cardWord: $('card-word'), cardMeta: $('card-meta'),
    cardArt: $('card-art'), cardArtImg: $('card-art-img'), cardArtEmoji: $('card-art-emoji'),
    cardBackArt: $('card-back-art'), cardBackArtImg: $('card-back-art-img'), cardBackArtEmoji: $('card-back-art-emoji'),
    cardMeaning: $('card-meaning'), cardExample: $('card-example'), cardExampleZh: $('card-example-zh'), cardNote: $('card-note'), prev: $('prev'), flip: $('flip'),
    cardSpeak: $('card-speak'), weak: $('weak'), known: $('known'), next: $('next'),
    meaningWord: $('meaning-word'), meaningHint: $('meaning-hint'), meaningChoices: $('meaning-choices'), meaningFeedback: $('meaning-feedback'), meaningSpeak: $('meaning-speak'), meaningNext: $('meaning-next'),
    listenHint: $('listen-hint'), listenChoices: $('listen-choices'), listenFeedback: $('listen-feedback'), listenPlay: $('listen-play'), listenNext: $('listen-next'),
    spellHint: $('spell-hint'), spellDetail: $('spell-detail'), spellInput: $('spell-input'), spellFeedback: $('spell-feedback'), spellSpeak: $('spell-speak'), spellCheck: $('spell-check'), spellNext: $('spell-next'),
    scrambleHint: $('scramble-hint'), scrambleDetail: $('scramble-detail'), scrambleAnswer: $('scramble-answer'), scrambleBank: $('scramble-bank'), scrambleFeedback: $('scramble-feedback'), scrambleUndo: $('scramble-undo'), scrambleCheck: $('scramble-check'), scrambleNext: $('scramble-next'),
    fallingWord: $('falling-word'), fallingHint: $('falling-hint'), fallingStage: $('falling-stage'), fallingFeedback: $('falling-feedback'), fallingSpeak: $('falling-speak'), fallingNext: $('falling-next'),
    molePrompt: $('mole-prompt'), moleHint: $('mole-hint'), moleGrid: $('mole-grid'), moleFeedback: $('mole-feedback'), moleSpeak: $('mole-speak'), moleNext: $('mole-next'),
    speedTime: $('speed-time'), speedScore: $('speed-score'), speedStreak: $('speed-streak'), speedWord: $('speed-word'), speedChoices: $('speed-choices'), speedFeedback: $('speed-feedback'), speedStart: $('speed-start'),
    judgeWord: $('judge-word'), judgeLabel: $('judge-label'), judgeTrue: $('judge-true'), judgeFalse: $('judge-false'), judgeFeedback: $('judge-feedback'), judgeSpeak: $('judge-speak'), judgeNext: $('judge-next'),
    wordGrid: $('word-grid'), copyList: $('copy-list'), scopeLabel: $('scope-label'), statKnown: $('stat-known'), statWeak: $('stat-weak'), statSeen: $('stat-seen'), statTotal: $('stat-total')
  };

  const state = {
    mode: 'cards',
    chapter: 'all',
    unit: 'all',
    level: 'all',
    filter: 'all',
    query: '',
    settingsOpen: false,
    deck: [],
    index: 0,
    flipped: false,
    progress: loadProgress(),
    quiz: { correct: 0, attempts: 0, streak: 0 },
    advanceTimer: null,
    meaning: null,
    listen: null,
    spell: null,
    scramble: null,
    falling: null,
    mole: null,
    speed: null,
    judge: null,
    touch: { startX: 0, startY: 0, swiped: false }
  };

  initSelects();
  ensureMeaningView();
  bindEvents();
  rebuildDeck();
  render();

  function initSelects() {
    els.chapterSelect.appendChild(option('all', `全部章節 (${chapters.length})`));
    chapters.forEach((chapter) => {
      els.chapterSelect.appendChild(option(String(chapter.chapterNo), `${chapter.chapterNo}. ${chapter.title} (${chapter.count})`));
    });
    refreshUnitSelect();
    refreshLevelSelect();
  }

  function refreshUnitSelect() {
    const current = els.unitSelect.value || 'all';
    els.unitSelect.innerHTML = '';
    const list = units.filter((unit) => state.chapter === 'all' || String(unit.chapterNo) === state.chapter);
    els.unitSelect.appendChild(option('all', `全部單元 (${list.length})`));
    list.forEach((unit) => {
      els.unitSelect.appendChild(option(String(unit.unitNo), `${unit.unitNo}. ${unit.title} (${unit.count})`));
    });
    els.unitSelect.value = list.some((unit) => String(unit.unitNo) === current) ? current : 'all';
    state.unit = els.unitSelect.value;
  }

  function refreshLevelSelect() {
    const current = state.level || 'all';
    const base = filteredWordsWithoutLevel();
    const count = Math.max(1, Math.ceil(base.length / LEVEL_SIZE));
    els.levelSelect.innerHTML = '';
    els.levelSelect.appendChild(option('all', `全部關卡 (${base.length} 字)`));
    for (let level = 1; level <= count; level++) {
      const start = (level - 1) * LEVEL_SIZE + 1;
      const end = Math.min(level * LEVEL_SIZE, base.length);
      els.levelSelect.appendChild(option(String(level), `第 ${level} 關 (${start}-${end})`));
    }
    els.levelSelect.value = current === 'all' || Number(current) <= count ? current : 'all';
    state.level = els.levelSelect.value;
  }

  function bindEvents() {
    els.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      clearAutoAdvance();
      state.mode = button.dataset.mode;
      makeGameForMode();
      render();
    });
    els.search.addEventListener('input', () => {
      state.query = els.search.value.trim().toLowerCase();
      state.index = 0;
      state.level = 'all';
      resetQuiz();
      refreshLevelSelect();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.chapterSelect.addEventListener('change', () => {
      state.chapter = els.chapterSelect.value;
      state.index = 0;
      state.level = 'all';
      resetQuiz();
      refreshUnitSelect();
      refreshLevelSelect();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.unitSelect.addEventListener('change', () => {
      state.unit = els.unitSelect.value;
      state.index = 0;
      state.level = 'all';
      resetQuiz();
      refreshLevelSelect();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.chips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.filter = button.dataset.filter;
      state.index = 0;
      state.level = 'all';
      resetQuiz();
      refreshLevelSelect();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.levelSelect.addEventListener('change', () => {
      state.level = els.levelSelect.value;
      state.index = 0;
      resetQuiz();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.focusToggle?.addEventListener('click', () => {
      state.settingsOpen = !state.settingsOpen;
      render();
    });

    els.card.addEventListener('click', flipCard);
    els.card.addEventListener('touchstart', handleCardTouchStart, { passive: true });
    els.card.addEventListener('touchend', handleCardTouchEnd, { passive: true });
    els.card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flipCard();
      }
    });
    els.flip.addEventListener('click', flipCard);
    els.prev.addEventListener('click', () => moveCard(-1));
    els.next.addEventListener('click', () => moveCard(1));
    els.cardSpeak.addEventListener('click', () => speak(currentCard()?.word));
    els.speakCurrent.addEventListener('click', () => speak(currentQuestionWord()));
    els.weak.addEventListener('click', () => markCurrent('weak'));
    els.known.addEventListener('click', () => markCurrent('known'));
    els.shuffle.addEventListener('click', () => {
      state.deck = shuffle([...state.deck]);
      state.index = 0;
      state.flipped = false;
      render();
    });
    els.reset.addEventListener('click', () => {
      if (!confirm('確定要清除這份 2000 字學習進度嗎？')) return;
      state.progress = {};
      saveProgress();
      render();
    });

    els.meaningSpeak?.addEventListener('click', () => speak(state.meaning?.answer.word));
    els.meaningNext?.addEventListener('click', () => { makeMeaning(); renderMeaning(); });
    els.listenPlay.addEventListener('click', () => speak(state.listen?.answer.word));
    els.listenNext.addEventListener('click', () => { makeListen(); renderListen(); });
    els.spellSpeak.addEventListener('click', () => speak(state.spell?.word));
    els.spellCheck.addEventListener('click', checkSpell);
    els.spellNext.addEventListener('click', () => { makeSpell(); renderSpell(); });
    els.spellInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') checkSpell(); });
    els.scrambleUndo.addEventListener('click', undoScramble);
    els.scrambleCheck.addEventListener('click', checkScramble);
    els.scrambleNext.addEventListener('click', () => { makeScramble(); renderScramble(); });
    els.fallingSpeak.addEventListener('click', () => speak(state.falling?.answer.word));
    els.fallingNext.addEventListener('click', () => { makeFalling(); renderFalling(); });
    els.moleSpeak.addEventListener('click', () => speak(state.mole?.answer.word));
    els.moleNext.addEventListener('click', () => { makeMole(); renderMole(); });
    els.speedStart.addEventListener('click', startSpeed);
    els.judgeTrue.addEventListener('click', () => answerJudge(true));
    els.judgeFalse.addEventListener('click', () => answerJudge(false));
    els.judgeSpeak.addEventListener('click', () => speak(state.judge?.word.word));
    els.judgeNext.addEventListener('click', () => { makeJudge(); renderJudge(); });
    els.copyList.addEventListener('click', copyList);

    document.addEventListener('keydown', (event) => {
      if (event.target.matches('input, textarea, select')) return;
      if (event.key === ' ') {
        event.preventDefault();
        if (state.mode === 'cards') flipCard();
      }
      if (event.key === 'ArrowLeft' && state.mode === 'cards') moveCard(-1);
      if (event.key === 'ArrowRight' && state.mode === 'cards') moveCard(1);
      if (event.key.toLowerCase() === 's') speak(currentQuestionWord());
    });
  }

  function rebuildDeck() {
    const base = filteredWordsWithoutLevel();
    if (state.level === 'all') {
      state.deck = base;
    } else {
      const start = (Number(state.level) - 1) * LEVEL_SIZE;
      state.deck = base.slice(start, start + LEVEL_SIZE);
    }
    if (state.index >= state.deck.length) state.index = Math.max(0, state.deck.length - 1);
    state.flipped = false;
  }

  function filteredWordsWithoutLevel() {
    return words.filter((word) => {
      if (state.chapter !== 'all' && String(word.chapterNo) !== state.chapter) return false;
      if (state.unit !== 'all' && String(word.unitNo) !== state.unit) return false;
      const progress = progressOf(word.id);
      if (state.filter === 'weak' && progress.status !== 'weak') return false;
      if (state.filter === 'known' && progress.status !== 'known') return false;
      if (state.filter === 'unseen' && progress.seen) return false;
      if (state.filter === 'translated' && !word.translation) return false;
      if (!state.query) return true;
      return searchable(word).includes(state.query);
    });
  }

  function render() {
    document.body.className = `mode-${state.mode}${state.settingsOpen ? ' settings-open' : ''}`;
    if (els.focusToggle) {
      els.focusToggle.textContent = state.settingsOpen ? '學習' : '設定';
      els.focusToggle.setAttribute('aria-pressed', String(state.settingsOpen));
    }
    document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === state.mode));
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === state.filter));
    Object.entries(els.views).forEach(([mode, view]) => view?.classList.toggle('active', mode === state.mode));
    renderStats();
    renderQuizStatus();
    renderMeter();
    if (state.mode === 'cards') renderCard();
    if (state.mode === 'meaning') renderMeaning();
    if (state.mode === 'listen') renderListen();
    if (state.mode === 'spell') renderSpell();
    if (state.mode === 'scramble') renderScramble();
    if (state.mode === 'falling') renderFalling();
    if (state.mode === 'mole') renderMole();
    if (state.mode === 'speed') renderSpeed();
    if (state.mode === 'judge') renderJudge();
    if (state.mode === 'list') renderList();
  }

  function renderMeter() {
    const total = state.deck.length || 1;
    const pos = state.deck.length ? state.index + 1 : 0;
    const pct = state.deck.length ? Math.round((pos / total) * 100) : 0;
    els.deckLabel.textContent = state.deck.length ? `第 ${pos} / ${state.deck.length} 張` : '沒有符合條件的單字';
    els.deckPercent.textContent = `${pct}%`;
    els.deckMeter.style.width = `${pct}%`;
  }

  function renderStats() {
    const known = state.deck.filter((word) => progressOf(word.id).status === 'known').length;
    const weak = state.deck.filter((word) => progressOf(word.id).status === 'weak').length;
    const seen = state.deck.filter((word) => progressOf(word.id).seen).length;
    els.statKnown.textContent = known;
    els.statWeak.textContent = weak;
    els.statSeen.textContent = seen;
    els.statTotal.textContent = state.deck.length;
    const chapter = state.chapter === 'all' ? '全部章節' : `${state.chapter}. ${chapterMap.get(Number(state.chapter))?.title}`;
    const unit = state.unit === 'all' ? '全部單元' : `${state.unit}. ${unitMap.get(Number(state.unit))?.title}`;
    const level = state.level === 'all' ? '全部關卡' : `第 ${state.level} 關`;
    els.scopeLabel.textContent = `${chapter} / ${unit} / ${level} / ${state.deck.length} 字`;
  }

  function renderQuizStatus() {
    const known = state.deck.filter((word) => progressOf(word.id).status === 'known').length;
    const familiarity = state.deck.length ? Math.round((known / state.deck.length) * 100) : 0;
    const attempts = state.quiz.attempts;
    const correct = state.quiz.correct;
    const rate = attempts ? Math.round((correct / attempts) * 100) : 0;
    els.levelLabel.textContent = state.level === 'all' ? '全部關卡' : `第 ${state.level} 關`;
    els.quizScore.textContent = `${correct} / ${attempts}`;
    els.quizRate.textContent = attempts ? `${rate}%` : '--';
    els.quizGrade.textContent = gradeLabel(rate, attempts);
    els.levelFamiliarity.textContent = `${familiarity}%`;
  }

  function renderCard() {
    const card = currentCard();
    if (!card) {
      els.cardWord.textContent = 'No words';
      els.cardMeta.textContent = '請調整篩選條件';
      return;
    }
    touch(card.id);
    renderCardArt(card);
    els.cardScope.textContent = scopeText(card);
    els.cardWord.textContent = card.word;
    els.cardMeta.textContent = `${card.partOfSpeech || 'vocabulary'} / #${card.order}`;
    els.cardMeaning.textContent = meaningText(card);
    els.cardExample.textContent = firstExample(card);
    els.cardExampleZh.textContent = exampleZhText(card);
    els.cardNote.textContent = card.reviewNote || '';
    els.front.hidden = false;
    els.back.hidden = false;
    els.card.classList.toggle('is-flipped', state.flipped);
    els.flip.textContent = state.flipped ? '看英文' : '翻面';
    saveProgress();
  }

  function renderMeaning() {
    ensureMeaningView();
    if (!state.meaning) makeMeaning();
    const game = state.meaning;
    if (!game) return;
    els.meaningWord.textContent = game.answer.word;
    els.meaningHint.textContent = `${scopeText(game.answer)} / 選出正確中文意思`;
    els.meaningFeedback.textContent = '四個選項中只有一個最符合。';
    els.meaningFeedback.className = 'feedback';
    renderChoices(els.meaningChoices, game.choices, (choice) => meaningText(choice), (choice, button) => {
      const correct = choice.id === game.answer.id;
      finishChoice(button, els.meaningChoices, meaningText(game.answer), correct);
      els.meaningFeedback.textContent = correct ? `答對：${firstExample(game.answer)}` : `正確答案：${meaningText(game.answer)}`;
      els.meaningFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      finishAnswer(game.answer, correct, () => { makeMeaning(); renderMeaning(); });
    });
  }

  function ensureMeaningView() {
    if (els.meaningWord && els.meaningChoices && els.meaningFeedback) return;
    let view = els.views.meaning || document.getElementById('meaning-view');
    const stage = document.querySelector('.stage');
    if (!view && stage) {
      view = document.createElement('div');
      view.className = 'view';
      view.id = 'meaning-view';
      const game = document.createElement('div');
      game.className = 'game';
      const prompt = document.createElement('div');
      prompt.className = 'prompt';
      const title = document.createElement('h2');
      title.id = 'meaning-word';
      title.textContent = 'word';
      const hint = document.createElement('p');
      hint.id = 'meaning-hint';
      hint.textContent = '看英文，選出正確中文意思。';
      const choices = document.createElement('div');
      choices.className = 'choices';
      choices.id = 'meaning-choices';
      const feedback = document.createElement('div');
      feedback.className = 'feedback';
      feedback.id = 'meaning-feedback';
      const row = document.createElement('div');
      row.className = 'btn-row';
      const speakButton = document.createElement('button');
      speakButton.className = 'btn';
      speakButton.id = 'meaning-speak';
      speakButton.type = 'button';
      speakButton.textContent = '發音';
      const nextButton = document.createElement('button');
      nextButton.className = 'btn primary';
      nextButton.id = 'meaning-next';
      nextButton.type = 'button';
      nextButton.textContent = '下一題';
      prompt.appendChild(title);
      prompt.appendChild(hint);
      row.appendChild(speakButton);
      row.appendChild(nextButton);
      game.appendChild(prompt);
      game.appendChild(choices);
      game.appendChild(feedback);
      game.appendChild(row);
      view.appendChild(game);
      stage.appendChild(view);
      els.views.meaning = view;
    }
    els.meaningWord = document.getElementById('meaning-word');
    els.meaningHint = document.getElementById('meaning-hint');
    els.meaningChoices = document.getElementById('meaning-choices');
    els.meaningFeedback = document.getElementById('meaning-feedback');
    els.meaningSpeak = document.getElementById('meaning-speak');
    els.meaningNext = document.getElementById('meaning-next');
    els.meaningSpeak?.addEventListener('click', () => speak(state.meaning?.answer.word));
    els.meaningNext?.addEventListener('click', () => { makeMeaning(); renderMeaning(); });
    Object.entries(els.views).forEach(([mode, item]) => item?.classList.toggle('active', mode === state.mode));
  }

  function renderListen() {
    if (!state.listen) makeListen();
    const game = state.listen;
    if (!game) return;
    els.listenHint.textContent = `${scopeText(game.answer)} / 聽發音選英文`;
    renderChoices(els.listenChoices, game.choices, (choice) => choice.word, (choice, button) => {
      const correct = choice.id === game.answer.id;
      finishChoice(button, els.listenChoices, game.answer.word, correct);
      els.listenFeedback.textContent = correct ? `答對：${meaningText(game.answer)}` : `正確答案是 ${game.answer.word}`;
      els.listenFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      finishAnswer(game.answer, correct, () => { makeListen(); renderListen(); });
    });
    els.listenFeedback.textContent = '';
    els.listenFeedback.className = 'feedback';
    setTimeout(() => speak(game.answer.word), 180);
  }

  function renderSpell() {
    if (!state.spell) makeSpell();
    const card = state.spell;
    if (!card) return;
    els.spellHint.textContent = meaningText(card);
    els.spellDetail.textContent = `${scopeText(card)} / ${firstExample(card).replace(new RegExp(escapeRegExp(card.word), 'ig'), '_____')}`;
    els.spellInput.value = '';
    els.spellFeedback.textContent = '';
    els.spellFeedback.className = 'feedback';
    els.spellCheck.disabled = false;
    setTimeout(() => els.spellInput.focus(), 0);
  }

  function renderScramble() {
    if (!state.scramble) makeScramble();
    const game = state.scramble;
    if (!game) return;
    els.scrambleHint.textContent = meaningText(game.card);
    els.scrambleDetail.textContent = scopeText(game.card);
    els.scrambleAnswer.textContent = game.picked.map((item) => item.char).join('') || ' ';
    els.scrambleFeedback.textContent = '';
    els.scrambleFeedback.className = 'feedback';
    els.scrambleCheck.disabled = false;
    els.scrambleBank.innerHTML = '';
    game.letters.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = `btn letter ${item.used ? 'used' : ''}`;
      button.type = 'button';
      button.textContent = item.char;
      button.addEventListener('click', () => {
        if (item.used) return;
        item.used = true;
        game.picked.push({ index, char: item.char });
        renderScramble();
      });
      els.scrambleBank.appendChild(button);
    });
  }

  function renderFalling() {
    if (!state.falling) makeFalling();
    const game = state.falling;
    if (!game) return;
    els.fallingWord.textContent = game.answer.word;
    els.fallingHint.textContent = '中文翻譯會往下掉，點到正確意思。';
    els.fallingFeedback.textContent = '';
    els.fallingFeedback.className = 'feedback';
    els.fallingStage.innerHTML = '';
    game.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice falling-choice';
      button.type = 'button';
      button.textContent = meaningText(choice);
      button.style.left = `${8 + (index % 4) * 22}%`;
      button.style.animationDelay = `${index * 0.42}s`;
      button.style.setProperty('--fall-speed', `${6.4 + index * 0.25}s`);
      button.addEventListener('click', () => answerFalling(choice, button));
      if (choice.id === game.answer.id) {
        button.addEventListener('animationend', () => {
          if (state.falling === game && !game.done) {
            game.done = true;
            els.fallingFeedback.textContent = `太慢了：${game.answer.word} = ${meaningText(game.answer)}`;
            els.fallingFeedback.className = 'feedback bad';
            finishAnswer(game.answer, false, () => { makeFalling(); renderFalling(); });
          }
        }, { once: true });
      }
      els.fallingStage.appendChild(button);
    });
  }

  function renderMole() {
    if (!state.mole) makeMole();
    const game = state.mole;
    if (!game) return;
    els.molePrompt.textContent = meaningText(game.answer);
    els.moleHint.textContent = '敲出對應的英文單字。';
    els.moleFeedback.textContent = '';
    els.moleFeedback.className = 'feedback';
    els.moleGrid.innerHTML = '';
    game.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = `mole ${index % 2 === 0 ? 'pop' : ''}`;
      button.type = 'button';
      button.textContent = choice.word;
      button.addEventListener('click', () => answerMole(choice, button));
      els.moleGrid.appendChild(button);
    });
  }

  function renderSpeed() {
    if (!state.speed) makeSpeed();
    const game = state.speed;
    if (!game) return;
    els.speedTime.textContent = game.timeLeft;
    els.speedScore.textContent = game.score;
    els.speedStreak.textContent = game.streak;
    els.speedWord.textContent = game.answer?.word || 'Ready';
    els.speedFeedback.textContent = game.message || (game.running ? '選出正確中文意思。' : '按開始後倒數 30 秒。');
    renderChoices(els.speedChoices, game.choices, (choice) => meaningText(choice), (choice) => answerSpeed(choice));
    Array.from(els.speedChoices.children).forEach((child) => { child.disabled = !game.running; });
  }

  function renderJudge() {
    if (!state.judge) makeJudge();
    const game = state.judge;
    if (!game) return;
    els.judgeWord.textContent = game.word.word;
    els.judgeLabel.textContent = game.label;
    els.judgeFeedback.textContent = '判斷英文與中文意思是否相符。';
    els.judgeFeedback.className = 'feedback';
    els.judgeTrue.disabled = false;
    els.judgeFalse.disabled = false;
    els.judgeTrue.className = 'choice';
    els.judgeFalse.className = 'choice';
  }

  function renderList() {
    els.wordGrid.innerHTML = '';
    state.deck.forEach((word) => {
      const row = document.createElement('article');
      row.className = 'word-row';
      row.innerHTML = `<strong>${escapeHtml(word.word)}</strong><span>${escapeHtml(meaningText(word))}</span><span>${escapeHtml(scopeText(word))}</span>`;
      row.addEventListener('click', () => {
        state.mode = 'cards';
        state.index = state.deck.findIndex((item) => item.id === word.id);
        state.flipped = false;
        render();
      });
      els.wordGrid.appendChild(row);
    });
  }

  function makeGameForMode() {
    clearAutoAdvance();
    if (state.mode === 'meaning') makeMeaning();
    if (state.mode === 'listen') makeListen();
    if (state.mode === 'spell') makeSpell();
    if (state.mode === 'scramble') makeScramble();
    if (state.mode === 'falling') makeFalling();
    if (state.mode === 'mole') makeMole();
    if (state.mode === 'speed') makeSpeed();
    if (state.mode === 'judge') makeJudge();
  }

  function makeMeaning() {
    const answer = randomFrom(questionPool().filter((word) => meaningText(word)));
    if (!answer) return;
    const others = shuffle(words.filter((word) => word.id !== answer.id && meaningText(word) && meaningText(word) !== meaningText(answer)));
    const choices = uniqueBy([answer, ...others], 'translation').slice(0, 4);
    state.meaning = { answer, choices: shuffle(choices) };
  }

  function makeListen() {
    const answer = randomFrom(questionPool());
    if (!answer) return;
    state.listen = { answer, choices: shuffle([answer, ...shuffle(words.filter((word) => word.id !== answer.id)).slice(0, 3)]) };
  }

  function makeSpell() {
    state.spell = randomFrom(questionPool());
  }

  function makeScramble() {
    const pool = questionPool().filter((word) => /^[a-z][a-z .'-]{2,}$/i.test(word.word) && word.word.length <= 18);
    const card = randomFrom(pool.length ? pool : questionPool());
    if (!card) return;
    let chars = card.word.replace(/\s+/g, '').split('');
    let letters = shuffle(chars.map((char, index) => ({ char, index, used: false })));
    if (letters.map((item) => item.char).join('').toLowerCase() === chars.join('').toLowerCase()) letters = letters.reverse();
    state.scramble = { card, letters, picked: [] };
  }

  function makeFalling() {
    const answer = randomFrom(questionPool().filter((word) => meaningText(word)));
    if (!answer) return;
    state.falling = { answer, choices: meaningChoices(answer, 5), done: false };
  }

  function makeMole() {
    const answer = randomFrom(questionPool().filter((word) => meaningText(word)));
    if (!answer) return;
    const others = shuffle(words.filter((word) => word.id !== answer.id && word.word && meaningText(word) !== meaningText(answer)));
    state.mole = { answer, choices: shuffle([answer, ...others.slice(0, 5)]), done: false };
  }

  function makeSpeed() {
    const answer = randomFrom(questionPool());
    state.speed = { answer, choices: meaningChoices(answer, 4), score: 0, streak: 0, timeLeft: 30, running: false, timer: null, message: '' };
  }

  function makeJudge() {
    const word = randomFrom(questionPool());
    if (!word) return;
    const shouldMatch = Math.random() >= 0.5;
    const other = randomFrom(words.filter((item) => item.id !== word.id && meaningText(item) !== meaningText(word)));
    const labelWord = shouldMatch ? word : other;
    state.judge = { word, shouldMatch, label: meaningText(labelWord), correctLabel: meaningText(word) };
  }

  function checkSpell() {
    const card = state.spell;
    if (!card) return;
    const correct = normalize(els.spellInput.value) === normalize(card.word);
    els.spellFeedback.textContent = correct ? '拼對了。' : `正確拼法：${card.word}`;
    els.spellFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    els.spellCheck.disabled = true;
    finishAnswer(card, correct, () => { makeSpell(); renderSpell(); });
  }

  function undoScramble() {
    const game = state.scramble;
    if (!game?.picked.length) return;
    const last = game.picked.pop();
    game.letters[last.index].used = false;
    renderScramble();
  }

  function checkScramble() {
    const game = state.scramble;
    if (!game) return;
    const guess = normalize(game.picked.map((item) => item.char).join('')).replace(/\s+/g, '');
    const answer = normalize(game.card.word).replace(/\s+/g, '');
    const correct = guess === answer;
    els.scrambleFeedback.textContent = correct ? '重組成功。' : `正確答案：${game.card.word}`;
    els.scrambleFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    els.scrambleCheck.disabled = true;
    finishAnswer(game.card, correct, () => { makeScramble(); renderScramble(); });
  }

  function answerFalling(choice, button) {
    const game = state.falling;
    if (!game || game.done) return;
    const correct = choice.id === game.answer.id;
    game.done = true;
    button.classList.add(correct ? 'correct' : 'wrong');
    Array.from(els.fallingStage.children).forEach((child) => {
      child.style.animationPlayState = 'paused';
      child.disabled = true;
      if (child.textContent === meaningText(game.answer)) child.classList.add('correct');
    });
    els.fallingFeedback.textContent = correct ? '抓到了。' : `正確意思：${meaningText(game.answer)}`;
    els.fallingFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    finishAnswer(game.answer, correct, () => { makeFalling(); renderFalling(); });
  }

  function answerMole(choice, button) {
    const game = state.mole;
    if (!game || game.done) return;
    const correct = choice.id === game.answer.id;
    game.done = true;
    button.classList.add(correct ? 'correct' : 'wrong');
    Array.from(els.moleGrid.children).forEach((child) => {
      child.disabled = true;
      if (child.textContent === game.answer.word) child.classList.add('correct');
    });
    els.moleFeedback.textContent = correct ? '敲對了。' : `正確英文：${game.answer.word}`;
    els.moleFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    finishAnswer(game.answer, correct, () => { makeMole(); renderMole(); });
  }

  function startSpeed() {
    clearSpeedTimer();
    const answer = randomFrom(questionPool());
    state.speed = { answer, choices: meaningChoices(answer, 4), score: 0, streak: 0, timeLeft: 30, running: true, timer: null, message: '' };
    state.speed.timer = setInterval(() => {
      state.speed.timeLeft -= 1;
      if (state.speed.timeLeft <= 0) {
        state.speed.timeLeft = 0;
        state.speed.running = false;
        state.speed.message = `時間到，總分 ${state.speed.score}`;
        clearSpeedTimer();
      }
      renderSpeed();
    }, 1000);
    renderSpeed();
  }

  function answerSpeed(choice) {
    const game = state.speed;
    if (!game?.running) return;
    const correct = choice.id === game.answer.id;
    recordAnswer(correct);
    if (correct) {
      game.score += 10 + Math.min(game.streak, 5);
      game.streak += 1;
      game.message = '答對。';
      mark(game.answer.id, 'known');
    } else {
      game.streak = 0;
      game.message = `${game.answer.word} = ${meaningText(game.answer)}`;
      mark(game.answer.id, 'weak');
    }
    game.answer = randomFrom(questionPool());
    game.choices = meaningChoices(game.answer, 4);
    renderSpeed();
    renderStats();
    renderQuizStatus();
  }

  function answerJudge(value) {
    const game = state.judge;
    if (!game) return;
    const correct = value === game.shouldMatch;
    els.judgeFeedback.textContent = correct ? '判斷正確。' : `應該是「${game.shouldMatch ? '正確' : '錯誤'}」：${game.correctLabel}`;
    els.judgeTrue.disabled = true;
    els.judgeFalse.disabled = true;
    els.judgeTrue.classList.toggle('correct', game.shouldMatch);
    els.judgeFalse.classList.toggle('correct', !game.shouldMatch);
    finishAnswer(game.word, correct, () => { makeJudge(); renderJudge(); });
  }

  function finishAnswer(word, correct, nextFn) {
    recordAnswer(correct);
    mark(word.id, correct ? 'known' : 'weak');
    renderStats();
    renderQuizStatus();
    scheduleAutoNext(nextFn);
  }

  function recordAnswer(correct) {
    state.quiz.attempts += 1;
    if (correct) {
      state.quiz.correct += 1;
      state.quiz.streak += 1;
    } else {
      state.quiz.streak = 0;
    }
  }

  function resetQuiz() {
    clearAutoAdvance();
    state.quiz = { correct: 0, attempts: 0, streak: 0 };
  }

  function scheduleAutoNext(nextFn) {
    clearAutoAdvance();
    state.advanceTimer = setTimeout(() => {
      state.advanceTimer = null;
      nextFn();
      renderStats();
      renderQuizStatus();
    }, 850);
  }

  function clearAutoAdvance() {
    if (state.advanceTimer) clearTimeout(state.advanceTimer);
    state.advanceTimer = null;
  }

  function renderChoices(container, choices, label, onClick) {
    container.innerHTML = '';
    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = label(choice);
      button.addEventListener('click', () => onClick(choice, button));
      container.appendChild(button);
    });
  }

  function finishChoice(button, container, correctLabel, correct) {
    button.classList.add(correct ? 'correct' : 'wrong');
    Array.from(container.children).forEach((child) => {
      if (child.textContent === correctLabel) child.classList.add('correct');
      child.disabled = true;
    });
  }

  function flipCard() {
    if (!currentCard()) return;
    if (state.touch.swiped) {
      state.touch.swiped = false;
      return;
    }
    state.flipped = !state.flipped;
    renderCard();
  }

  function handleCardTouchStart(event) {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    state.touch.startX = touch.clientX;
    state.touch.startY = touch.clientY;
    state.touch.swiped = false;
  }

  function handleCardTouchEnd(event) {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - state.touch.startX;
    const dy = touch.clientY - state.touch.startY;
    if (Math.abs(dx) < 54 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    state.touch.swiped = true;
    moveCard(dx < 0 ? 1 : -1);
  }

  function moveCard(delta) {
    if (!state.deck.length) return;
    state.index = (state.index + delta + state.deck.length) % state.deck.length;
    state.flipped = false;
    render();
  }

  function markCurrent(status) {
    const card = currentCard();
    if (!card) return;
    mark(card.id, status);
    moveCard(1);
  }

  function mark(id, status) {
    const progress = progressOf(id);
    progress.status = status;
    progress.seen = true;
    progress.updatedAt = Date.now();
    saveProgress();
  }

  function touch(id) {
    const progress = progressOf(id);
    progress.seen = true;
    progress.updatedAt = progress.updatedAt || Date.now();
  }

  function progressOf(id) {
    if (!state.progress[id]) state.progress[id] = { seen: false, status: 'new', updatedAt: 0 };
    return state.progress[id];
  }

  function currentCard() {
    return state.deck[state.index] || null;
  }

  function currentQuestionWord() {
    if (state.mode === 'meaning') return state.meaning?.answer.word;
    if (state.mode === 'listen') return state.listen?.answer.word;
    if (state.mode === 'spell') return state.spell?.word;
    if (state.mode === 'scramble') return state.scramble?.card.word;
    if (state.mode === 'falling') return state.falling?.answer.word;
    if (state.mode === 'mole') return state.mole?.answer.word;
    if (state.mode === 'speed') return state.speed?.answer.word;
    if (state.mode === 'judge') return state.judge?.word.word;
    return currentCard()?.word;
  }

  function activePool() {
    return state.deck.length ? state.deck : words;
  }

  function questionPool() {
    if (state.deck.length) return state.deck;
    let base = words.filter((word) => {
      if (state.chapter !== 'all' && String(word.chapterNo) !== state.chapter) return false;
      if (state.unit !== 'all' && String(word.unitNo) !== state.unit) return false;
      if (!state.query) return true;
      return searchable(word).includes(state.query);
    });
    if (state.level !== 'all') {
      const start = (Number(state.level) - 1) * LEVEL_SIZE;
      base = base.slice(start, start + LEVEL_SIZE);
    }
    return base.length ? base : words;
  }

  function meaningChoices(answer, count = 4) {
    if (!answer) return [];
    const others = shuffle(words.filter((word) => word.id !== answer.id && meaningText(word) && meaningText(word) !== meaningText(answer)));
    return shuffle(uniqueBy([answer, ...others], 'translation').slice(0, count));
  }

  function renderCardArt(card) {
    const emoji = emojiForWord(card);
    const code = emojiCode(emoji);
    const label = `${card.word} picture`;
    setArtElement(els.cardArt, els.cardArtImg, els.cardArtEmoji, emoji, code, label);
    setArtElement(els.cardBackArt, els.cardBackArtImg, els.cardBackArtEmoji, emoji, code, label);
  }

  function setArtElement(wrapper, image, emojiNode, emoji, code, label) {
    if (!wrapper || !image || !emojiNode) return;
    wrapper.classList.remove('native');
    emojiNode.textContent = emoji;
    image.alt = label;
    image.dataset.fallback = 'openmoji';
    image.onerror = () => {
      if (image.dataset.fallback === 'openmoji') {
        image.dataset.fallback = 'native';
        image.src = `${OPENMOJI_BASE}${code.toUpperCase()}.svg`;
        return;
      }
      wrapper.classList.add('native');
      image.removeAttribute('src');
      image.onerror = null;
    };
    image.src = `${TWEMOJI_BASE}${code}.svg`;
  }

  function emojiForWord(word) {
    const key = normalizeWord(word.word);
    if (EXACT_EMOJI[key]) return EXACT_EMOJI[key];
    const haystack = `${word.word} ${word.translation} ${word.unitTitle} ${word.chapterTitle} ${word.partOfSpeech}`.toLowerCase();
    const match = KEYWORD_EMOJI.find(([pattern]) => pattern.test(haystack));
    return match?.[1] || CHAPTER_EMOJI[word.chapterNo] || '📘';
  }

  function emojiCode(emoji) {
    return Array.from(emoji)
      .map((char) => char.codePointAt(0).toString(16))
      .filter((code) => code !== 'fe0f')
      .join('-');
  }

  function normalizeWord(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }

  function scopeText(word) {
    return `Ch.${word.chapterNo} ${word.chapterTitle} / U${word.unitNo} ${word.unitTitle}`;
  }

  function meaningText(word) {
    return word.translation || `${word.unitTitle} / ${word.chapterTitle}`;
  }

  function gradeLabel(rate, attempts) {
    if (!attempts) return '準備中';
    if (rate >= 95) return 'S 精熟';
    if (rate >= 85) return 'A 很穩';
    if (rate >= 70) return 'B 熟悉';
    if (rate >= 55) return 'C 加強中';
    return 'D 需複習';
  }

  function firstExample(word) {
    return word.examples?.[0] || `This word belongs to ${word.unitTitle}.`;
  }

  function exampleZhText(word) {
    return word.exampleZh || word.examplesZh?.[0] || '';
  }

  function searchable(word) {
    return [word.word, word.translation, word.exampleZh, word.chapterTitle, word.unitTitle, word.partOfSpeech, word.examples.join(' '), word.examplesZh.join(' ')].join(' ').toLowerCase();
  }

  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  function copyList() {
    const text = state.deck.map((word) => [word.chapterNo, word.chapterTitle, word.unitNo, word.unitTitle, word.wordNo, word.word, word.translation, firstExample(word), exampleZhText(word)].join('\t')).join('\n');
    navigator.clipboard?.writeText(text);
    els.copyList.textContent = '已複製';
    setTimeout(() => { els.copyList.textContent = '複製清單'; }, 1000);
  }

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
  }

  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.progress)); } catch {}
  }

  function clearSpeedTimer() {
    if (state.speed?.timer) clearInterval(state.speed.timer);
    if (state.speed) state.speed.timer = null;
  }

  function option(value, label) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = label;
    return item;
  }

  function uniqueBy(list, key) {
    const seen = new Set();
    return list.filter((item) => item && !seen.has(item[key]) && seen.add(item[key]));
  }

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)] || null;
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }
})();
