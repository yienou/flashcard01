(() => {
  const raw = window.ENGLISH_2000_DATA;
  if (!raw || !Array.isArray(raw.words)) {
    document.body.innerHTML = '<main class="app"><section class="panel stage">找不到 english-2000-data.js。</section></main>';
    return;
  }

  const STORE_KEY = 'english-2000-progress-v1';
  const chapters = raw.chapters || [];
  const units = raw.units || [];
  const chapterMap = new Map(chapters.map((chapter) => [chapter.chapterNo, chapter]));
  const unitMap = new Map(units.map((unit) => [unit.unitNo, unit]));
  const words = raw.words.map((word) => ({
    ...word,
    word: String(word.word || '').trim(),
    translation: String(word.translation || '').trim(),
    partOfSpeech: String(word.partOfSpeech || '').trim(),
    examples: Array.isArray(word.examples) ? word.examples : []
  })).filter((word) => word.word);

  const $ = (id) => document.getElementById(id);
  const els = {
    tabs: $('tabs'), search: $('search'), chapterSelect: $('chapter-select'), unitSelect: $('unit-select'), chips: $('chips'),
    speakCurrent: $('speak-current'), shuffle: $('shuffle'), reset: $('reset'),
    deckLabel: $('deck-label'), deckPercent: $('deck-percent'), deckMeter: $('deck-meter'),
    views: {
      cards: $('cards-view'), listen: $('listen-view'), spell: $('spell-view'), scramble: $('scramble-view'),
      chapter: $('chapter-view'), unit: $('unit-view'), speed: $('speed-view'), judge: $('judge-view'), list: $('list-view')
    },
    card: $('card'), cardScope: $('card-scope'), front: $('front'), back: $('back'), cardWord: $('card-word'), cardMeta: $('card-meta'),
    cardMeaning: $('card-meaning'), cardExample: $('card-example'), cardNote: $('card-note'), prev: $('prev'), flip: $('flip'),
    cardSpeak: $('card-speak'), weak: $('weak'), known: $('known'), next: $('next'),
    listenHint: $('listen-hint'), listenChoices: $('listen-choices'), listenFeedback: $('listen-feedback'), listenPlay: $('listen-play'), listenNext: $('listen-next'),
    spellHint: $('spell-hint'), spellDetail: $('spell-detail'), spellInput: $('spell-input'), spellFeedback: $('spell-feedback'), spellSpeak: $('spell-speak'), spellCheck: $('spell-check'), spellNext: $('spell-next'),
    scrambleHint: $('scramble-hint'), scrambleDetail: $('scramble-detail'), scrambleAnswer: $('scramble-answer'), scrambleBank: $('scramble-bank'), scrambleFeedback: $('scramble-feedback'), scrambleUndo: $('scramble-undo'), scrambleCheck: $('scramble-check'), scrambleNext: $('scramble-next'),
    chapterWord: $('chapter-word'), chapterChoices: $('chapter-choices'), chapterFeedback: $('chapter-feedback'), chapterSpeak: $('chapter-speak'), chapterNext: $('chapter-next'),
    unitWord: $('unit-word'), unitChoices: $('unit-choices'), unitFeedback: $('unit-feedback'), unitSpeak: $('unit-speak'), unitNext: $('unit-next'),
    speedTime: $('speed-time'), speedScore: $('speed-score'), speedStreak: $('speed-streak'), speedWord: $('speed-word'), speedChoices: $('speed-choices'), speedFeedback: $('speed-feedback'), speedStart: $('speed-start'),
    judgeWord: $('judge-word'), judgeLabel: $('judge-label'), judgeTrue: $('judge-true'), judgeFalse: $('judge-false'), judgeFeedback: $('judge-feedback'), judgeSpeak: $('judge-speak'), judgeNext: $('judge-next'),
    wordGrid: $('word-grid'), copyList: $('copy-list'), scopeLabel: $('scope-label'), statKnown: $('stat-known'), statWeak: $('stat-weak'), statSeen: $('stat-seen'), statTotal: $('stat-total')
  };

  const state = {
    mode: 'cards',
    chapter: 'all',
    unit: 'all',
    filter: 'all',
    query: '',
    deck: [],
    index: 0,
    flipped: false,
    progress: loadProgress(),
    listen: null,
    spell: null,
    scramble: null,
    chapterGame: null,
    unitGame: null,
    speed: null,
    judge: null
  };

  initSelects();
  bindEvents();
  rebuildDeck();
  render();

  function initSelects() {
    els.chapterSelect.appendChild(option('all', `全部章節 (${chapters.length})`));
    chapters.forEach((chapter) => {
      els.chapterSelect.appendChild(option(String(chapter.chapterNo), `${chapter.chapterNo}. ${chapter.title} (${chapter.count})`));
    });
    refreshUnitSelect();
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

  function bindEvents() {
    els.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      state.mode = button.dataset.mode;
      makeGameForMode();
      render();
    });
    els.search.addEventListener('input', () => {
      state.query = els.search.value.trim().toLowerCase();
      state.index = 0;
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.chapterSelect.addEventListener('change', () => {
      state.chapter = els.chapterSelect.value;
      state.index = 0;
      refreshUnitSelect();
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.unitSelect.addEventListener('change', () => {
      state.unit = els.unitSelect.value;
      state.index = 0;
      rebuildDeck();
      makeGameForMode();
      render();
    });
    els.chips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.filter = button.dataset.filter;
      state.index = 0;
      rebuildDeck();
      makeGameForMode();
      render();
    });

    els.card.addEventListener('click', flipCard);
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

    els.listenPlay.addEventListener('click', () => speak(state.listen?.answer.word));
    els.listenNext.addEventListener('click', () => { makeListen(); renderListen(); });
    els.spellSpeak.addEventListener('click', () => speak(state.spell?.word));
    els.spellCheck.addEventListener('click', checkSpell);
    els.spellNext.addEventListener('click', () => { makeSpell(); renderSpell(); });
    els.spellInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') checkSpell(); });
    els.scrambleUndo.addEventListener('click', undoScramble);
    els.scrambleCheck.addEventListener('click', checkScramble);
    els.scrambleNext.addEventListener('click', () => { makeScramble(); renderScramble(); });
    els.chapterSpeak.addEventListener('click', () => speak(state.chapterGame?.answer.word));
    els.chapterNext.addEventListener('click', () => { makeChapterGame(); renderChapterGame(); });
    els.unitSpeak.addEventListener('click', () => speak(state.unitGame?.answer.word));
    els.unitNext.addEventListener('click', () => { makeUnitGame(); renderUnitGame(); });
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
    state.deck = words.filter((word) => {
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
    if (state.index >= state.deck.length) state.index = Math.max(0, state.deck.length - 1);
    state.flipped = false;
  }

  function render() {
    document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === state.mode));
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === state.filter));
    Object.entries(els.views).forEach(([mode, view]) => view.classList.toggle('active', mode === state.mode));
    renderStats();
    renderMeter();
    if (state.mode === 'cards') renderCard();
    if (state.mode === 'listen') renderListen();
    if (state.mode === 'spell') renderSpell();
    if (state.mode === 'scramble') renderScramble();
    if (state.mode === 'chapter') renderChapterGame();
    if (state.mode === 'unit') renderUnitGame();
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
    els.scopeLabel.textContent = `${chapter} / ${unit} / ${state.deck.length} 字`;
  }

  function renderCard() {
    const card = currentCard();
    if (!card) {
      els.cardWord.textContent = 'No words';
      els.cardMeta.textContent = '請調整篩選條件';
      return;
    }
    touch(card.id);
    els.cardScope.textContent = scopeText(card);
    els.cardWord.textContent = card.word;
    els.cardMeta.textContent = `${card.partOfSpeech || 'vocabulary'} / #${card.order}`;
    els.cardMeaning.textContent = meaningText(card);
    els.cardExample.textContent = firstExample(card);
    els.cardNote.textContent = `${card.source || ''} ${card.note || ''}`.trim();
    els.front.hidden = state.flipped;
    els.back.hidden = !state.flipped;
    els.flip.textContent = state.flipped ? '看英文' : '翻面';
    saveProgress();
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
      mark(game.answer.id, correct ? 'known' : 'weak');
      renderStats();
    });
    els.listenFeedback.textContent = '';
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

  function renderChapterGame() {
    if (!state.chapterGame) makeChapterGame();
    const game = state.chapterGame;
    if (!game) return;
    els.chapterWord.textContent = game.answer.word;
    els.chapterFeedback.textContent = '';
    renderChoices(els.chapterChoices, game.choices, (choice) => `${choice.chapterNo}. ${choice.title}`, (choice, button) => {
      const correct = choice.chapterNo === game.answer.chapterNo;
      finishChoice(button, els.chapterChoices, `${game.answer.chapterNo}. ${game.answer.chapterTitle}`, correct);
      els.chapterFeedback.textContent = correct ? '答對了。' : `${game.answer.word} 屬於 ${game.answer.chapterNo}. ${game.answer.chapterTitle}`;
      mark(game.answer.id, correct ? 'known' : 'weak');
      renderStats();
    });
  }

  function renderUnitGame() {
    if (!state.unitGame) makeUnitGame();
    const game = state.unitGame;
    if (!game) return;
    els.unitWord.textContent = game.answer.word;
    els.unitFeedback.textContent = '';
    renderChoices(els.unitChoices, game.choices, (choice) => `${choice.unitNo}. ${choice.title}`, (choice, button) => {
      const correct = choice.unitNo === game.answer.unitNo;
      finishChoice(button, els.unitChoices, `${game.answer.unitNo}. ${game.answer.unitTitle}`, correct);
      els.unitFeedback.textContent = correct ? '單元配對成功。' : `${game.answer.word} 屬於 ${game.answer.unitNo}. ${game.answer.unitTitle}`;
      mark(game.answer.id, correct ? 'known' : 'weak');
      renderStats();
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
    els.speedFeedback.textContent = game.message || (game.running ? '選出正確章節。' : '按開始後倒數 30 秒。');
    renderChoices(els.speedChoices, game.choices, (choice) => `${choice.chapterNo}. ${choice.title}`, (choice) => answerSpeed(choice));
    Array.from(els.speedChoices.children).forEach((child) => { child.disabled = !game.running; });
  }

  function renderJudge() {
    if (!state.judge) makeJudge();
    const game = state.judge;
    if (!game) return;
    els.judgeWord.textContent = game.word.word;
    els.judgeLabel.textContent = game.label;
    els.judgeFeedback.textContent = '判斷這組單字與章節/單元是否相符。';
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
    if (state.mode === 'listen') makeListen();
    if (state.mode === 'spell') makeSpell();
    if (state.mode === 'scramble') makeScramble();
    if (state.mode === 'chapter') makeChapterGame();
    if (state.mode === 'unit') makeUnitGame();
    if (state.mode === 'speed') makeSpeed();
    if (state.mode === 'judge') makeJudge();
  }

  function makeListen() {
    const answer = randomFrom(activePool());
    if (!answer) return;
    state.listen = { answer, choices: shuffle([answer, ...shuffle(words.filter((word) => word.id !== answer.id)).slice(0, 3)]) };
  }

  function makeSpell() {
    state.spell = randomFrom(activePool());
  }

  function makeScramble() {
    const pool = activePool().filter((word) => /^[a-z][a-z .'-]{2,}$/i.test(word.word) && word.word.length <= 18);
    const card = randomFrom(pool.length ? pool : activePool());
    if (!card) return;
    let chars = card.word.replace(/\s+/g, '').split('');
    let letters = shuffle(chars.map((char, index) => ({ char, index, used: false })));
    if (letters.map((item) => item.char).join('').toLowerCase() === chars.join('').toLowerCase()) letters = letters.reverse();
    state.scramble = { card, letters, picked: [] };
  }

  function makeChapterGame() {
    const answer = randomFrom(activePool());
    if (!answer) return;
    const choices = uniqueBy([chapterMap.get(answer.chapterNo), ...shuffle(chapters.filter((chapter) => chapter.chapterNo !== answer.chapterNo)).slice(0, 3)], 'chapterNo');
    state.chapterGame = { answer, choices: shuffle(choices) };
  }

  function makeUnitGame() {
    const answer = randomFrom(activePool());
    if (!answer) return;
    const choices = uniqueBy([unitMap.get(answer.unitNo), ...shuffle(units.filter((unit) => unit.unitNo !== answer.unitNo)).slice(0, 3)], 'unitNo');
    state.unitGame = { answer, choices: shuffle(choices) };
  }

  function makeSpeed() {
    const answer = randomFrom(activePool());
    state.speed = { answer, choices: speedChoices(answer), score: 0, streak: 0, timeLeft: 30, running: false, timer: null, message: '' };
  }

  function makeJudge() {
    const word = randomFrom(activePool());
    if (!word) return;
    const shouldMatch = Math.random() >= 0.5;
    const other = randomFrom(words.filter((item) => item.id !== word.id));
    const labelWord = shouldMatch ? word : other;
    state.judge = { word, shouldMatch, label: scopeText(labelWord), correctLabel: scopeText(word) };
  }

  function checkSpell() {
    const card = state.spell;
    if (!card) return;
    const correct = normalize(els.spellInput.value) === normalize(card.word);
    els.spellFeedback.textContent = correct ? '拼對了。' : `正確拼法：${card.word}`;
    els.spellFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    mark(card.id, correct ? 'known' : 'weak');
    renderStats();
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
    mark(game.card.id, correct ? 'known' : 'weak');
    renderStats();
  }

  function startSpeed() {
    clearSpeedTimer();
    const answer = randomFrom(activePool());
    state.speed = { answer, choices: speedChoices(answer), score: 0, streak: 0, timeLeft: 30, running: true, timer: null, message: '' };
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
    const correct = choice.chapterNo === game.answer.chapterNo;
    if (correct) {
      game.score += 10 + Math.min(game.streak, 5);
      game.streak += 1;
      game.message = '答對。';
      mark(game.answer.id, 'known');
    } else {
      game.streak = 0;
      game.message = `${game.answer.word} 屬於 ${game.answer.chapterNo}. ${game.answer.chapterTitle}`;
      mark(game.answer.id, 'weak');
    }
    game.answer = randomFrom(activePool());
    game.choices = speedChoices(game.answer);
    renderSpeed();
    renderStats();
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
    mark(game.word.id, correct ? 'known' : 'weak');
    renderStats();
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
    state.flipped = !state.flipped;
    renderCard();
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
    if (state.mode === 'listen') return state.listen?.answer.word;
    if (state.mode === 'spell') return state.spell?.word;
    if (state.mode === 'scramble') return state.scramble?.card.word;
    if (state.mode === 'chapter') return state.chapterGame?.answer.word;
    if (state.mode === 'unit') return state.unitGame?.answer.word;
    if (state.mode === 'speed') return state.speed?.answer.word;
    if (state.mode === 'judge') return state.judge?.word.word;
    return currentCard()?.word;
  }

  function activePool() {
    return state.deck.length ? state.deck : words;
  }

  function speedChoices(answer) {
    if (!answer) return [];
    return shuffle(uniqueBy([chapterMap.get(answer.chapterNo), ...shuffle(chapters.filter((chapter) => chapter.chapterNo !== answer.chapterNo)).slice(0, 3)], 'chapterNo'));
  }

  function scopeText(word) {
    return `Ch.${word.chapterNo} ${word.chapterTitle} / U${word.unitNo} ${word.unitTitle}`;
  }

  function meaningText(word) {
    return word.translation || `${word.unitTitle} / ${word.chapterTitle}`;
  }

  function firstExample(word) {
    return word.examples?.[0] || `This word belongs to ${word.unitTitle}.`;
  }

  function searchable(word) {
    return [word.word, word.translation, word.chapterTitle, word.unitTitle, word.partOfSpeech, word.examples.join(' ')].join(' ').toLowerCase();
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
    const text = state.deck.map((word) => [word.chapterNo, word.chapterTitle, word.unitNo, word.unitTitle, word.wordNo, word.word, word.translation].join('\t')).join('\n');
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
