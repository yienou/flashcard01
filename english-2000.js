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

  const $ = (id) => document.getElementById(id);
  const els = {
    tabs: $('tabs'), search: $('search'), chapterSelect: $('chapter-select'), unitSelect: $('unit-select'), levelSelect: $('level-select'), chips: $('chips'),
    speakCurrent: $('speak-current'), shuffle: $('shuffle'), reset: $('reset'),
    deckLabel: $('deck-label'), deckPercent: $('deck-percent'), deckMeter: $('deck-meter'),
    levelLabel: $('level-label'), quizScore: $('quiz-score'), quizRate: $('quiz-rate'), quizGrade: $('quiz-grade'), levelFamiliarity: $('level-familiarity'),
    views: {
      cards: $('cards-view'), meaning: $('meaning-view'), listen: $('listen-view'), spell: $('spell-view'), scramble: $('scramble-view'),
      chapter: $('chapter-view'), unit: $('unit-view'), speed: $('speed-view'), judge: $('judge-view'), list: $('list-view')
    },
    card: $('card'), cardScope: $('card-scope'), front: $('front'), back: $('back'), cardWord: $('card-word'), cardMeta: $('card-meta'),
    cardMeaning: $('card-meaning'), cardExample: $('card-example'), cardExampleZh: $('card-example-zh'), cardNote: $('card-note'), prev: $('prev'), flip: $('flip'),
    cardSpeak: $('card-speak'), weak: $('weak'), known: $('known'), next: $('next'),
    meaningWord: $('meaning-word'), meaningHint: $('meaning-hint'), meaningChoices: $('meaning-choices'), meaningFeedback: $('meaning-feedback'), meaningSpeak: $('meaning-speak'), meaningNext: $('meaning-next'),
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
    level: 'all',
    filter: 'all',
    query: '',
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
    chapterGame: null,
    unitGame: null,
    speed: null,
    judge: null
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
    els.cardScope.textContent = scopeText(card);
    els.cardWord.textContent = card.word;
    els.cardMeta.textContent = `${card.partOfSpeech || 'vocabulary'} / #${card.order}`;
    els.cardMeaning.textContent = meaningText(card);
    els.cardExample.textContent = firstExample(card);
    els.cardExampleZh.textContent = exampleZhText(card);
    els.cardNote.textContent = card.reviewNote || '';
    els.front.hidden = state.flipped;
    els.back.hidden = !state.flipped;
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

  function renderChapterGame() {
    if (!state.chapterGame) makeChapterGame();
    const game = state.chapterGame;
    if (!game) return;
    els.chapterWord.textContent = game.answer.word;
    els.chapterFeedback.textContent = '';
    els.chapterFeedback.className = 'feedback';
    renderChoices(els.chapterChoices, game.choices, (choice) => `${choice.chapterNo}. ${choice.title}`, (choice, button) => {
      const correct = choice.chapterNo === game.answer.chapterNo;
      finishChoice(button, els.chapterChoices, `${game.answer.chapterNo}. ${game.answer.chapterTitle}`, correct);
      els.chapterFeedback.textContent = correct ? '答對了。' : `${game.answer.word} 屬於 ${game.answer.chapterNo}. ${game.answer.chapterTitle}`;
      els.chapterFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      finishAnswer(game.answer, correct, () => { makeChapterGame(); renderChapterGame(); });
    });
  }

  function renderUnitGame() {
    if (!state.unitGame) makeUnitGame();
    const game = state.unitGame;
    if (!game) return;
    els.unitWord.textContent = game.answer.word;
    els.unitFeedback.textContent = '';
    els.unitFeedback.className = 'feedback';
    renderChoices(els.unitChoices, game.choices, (choice) => `${choice.unitNo}. ${choice.title}`, (choice, button) => {
      const correct = choice.unitNo === game.answer.unitNo;
      finishChoice(button, els.unitChoices, `${game.answer.unitNo}. ${game.answer.unitTitle}`, correct);
      els.unitFeedback.textContent = correct ? '單元配對成功。' : `${game.answer.word} 屬於 ${game.answer.unitNo}. ${game.answer.unitTitle}`;
      els.unitFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
      finishAnswer(game.answer, correct, () => { makeUnitGame(); renderUnitGame(); });
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
    if (state.mode === 'chapter') makeChapterGame();
    if (state.mode === 'unit') makeUnitGame();
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

  function makeChapterGame() {
    const answer = randomFrom(questionPool());
    if (!answer) return;
    const choices = uniqueBy([chapterMap.get(answer.chapterNo), ...shuffle(chapters.filter((chapter) => chapter.chapterNo !== answer.chapterNo)).slice(0, 3)], 'chapterNo');
    state.chapterGame = { answer, choices: shuffle(choices) };
  }

  function makeUnitGame() {
    const answer = randomFrom(questionPool());
    if (!answer) return;
    const choices = uniqueBy([unitMap.get(answer.unitNo), ...shuffle(units.filter((unit) => unit.unitNo !== answer.unitNo)).slice(0, 3)], 'unitNo');
    state.unitGame = { answer, choices: shuffle(choices) };
  }

  function makeSpeed() {
    const answer = randomFrom(questionPool());
    state.speed = { answer, choices: speedChoices(answer), score: 0, streak: 0, timeLeft: 30, running: false, timer: null, message: '' };
  }

  function makeJudge() {
    const word = randomFrom(questionPool());
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
    recordAnswer(correct);
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
    game.answer = randomFrom(questionPool());
    game.choices = speedChoices(game.answer);
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
    if (state.mode === 'meaning') return state.meaning?.answer.word;
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
