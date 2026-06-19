(() => {
  const raw = window.MINDMAP_771_DATA;
  if (!raw || !Array.isArray(raw.words)) {
    document.body.innerHTML = '<main class="app"><section class="panel stage">找不到 mindmap-771-data.js，請確認資料檔在同一個資料夾。</section></main>';
    return;
  }

  const STORE_KEY = 'mindmap-771-progress-v1';
  const topics = Array.isArray(raw.topics) ? raw.topics : [];
  const topicNames = new Map(topics.map((topic) => [topic.topicNo, topic]));
  const words = raw.words.map((item) => ({
    id: item.id,
    order: item.order,
    word: cleanWord(item.word),
    topicNo: item.topicNo,
    topicZh: item.topicZh || topicNames.get(item.topicNo)?.zhTitle || '',
    topicEn: item.topicEn || topicNames.get(item.topicNo)?.enTitle || '',
    sequenceInTopic: item.sequenceInTopic,
    partOfSpeech: arrayText(item.partOfSpeech),
    translation: arrayText(item.translation),
    examples: item.examples || [],
    notes: item.notes || []
  })).filter((item) => item.word);

  const els = {
    modeTabs: document.getElementById('mode-tabs'),
    search: document.getElementById('search'),
    topicSelect: document.getElementById('topic-select'),
    chips: document.getElementById('filter-chips'),
    speakCurrent: document.getElementById('speak-current'),
    shuffleDeck: document.getElementById('shuffle-deck'),
    resetProgress: document.getElementById('reset-progress'),
    deckLabel: document.getElementById('deck-label'),
    deckPercent: document.getElementById('deck-percent'),
    deckMeter: document.getElementById('deck-meter'),
    views: {
      cards: document.getElementById('cards-view'),
      quiz: document.getElementById('quiz-view'),
      spell: document.getElementById('spell-view'),
      match: document.getElementById('match-view'),
      listen: document.getElementById('listen-view'),
      scramble: document.getElementById('scramble-view'),
      cloze: document.getElementById('cloze-view'),
      speed: document.getElementById('speed-view'),
      judge: document.getElementById('judge-view'),
      list: document.getElementById('list-view')
    },
    flashcard: document.getElementById('flashcard'),
    cardTopic: document.getElementById('card-topic'),
    cardFront: document.getElementById('card-front'),
    cardBack: document.getElementById('card-back'),
    cardWord: document.getElementById('card-word'),
    cardPos: document.getElementById('card-pos'),
    cardTranslation: document.getElementById('card-translation'),
    cardExample: document.getElementById('card-example'),
    cardNotes: document.getElementById('card-notes'),
    prevCard: document.getElementById('prev-card'),
    flipCard: document.getElementById('flip-card'),
    cardSpeak: document.getElementById('card-speak'),
    markWeak: document.getElementById('mark-weak'),
    markKnown: document.getElementById('mark-known'),
    nextCard: document.getElementById('next-card'),
    quizWord: document.getElementById('quiz-word'),
    quizHint: document.getElementById('quiz-hint'),
    quizChoices: document.getElementById('quiz-choices'),
    quizFeedback: document.getElementById('quiz-feedback'),
    quizSpeak: document.getElementById('quiz-speak'),
    quizNext: document.getElementById('quiz-next'),
    spellTranslation: document.getElementById('spell-translation'),
    spellExample: document.getElementById('spell-example'),
    spellInput: document.getElementById('spell-input'),
    spellFeedback: document.getElementById('spell-feedback'),
    spellSpeak: document.getElementById('spell-speak'),
    spellCheck: document.getElementById('spell-check'),
    spellNext: document.getElementById('spell-next'),
    matchBoard: document.getElementById('match-board'),
    matchFeedback: document.getElementById('match-feedback'),
    matchNew: document.getElementById('match-new'),
    listenHint: document.getElementById('listen-hint'),
    listenChoices: document.getElementById('listen-choices'),
    listenFeedback: document.getElementById('listen-feedback'),
    listenPlay: document.getElementById('listen-play'),
    listenNext: document.getElementById('listen-next'),
    scrambleTranslation: document.getElementById('scramble-translation'),
    scrambleTopic: document.getElementById('scramble-topic'),
    scrambleAnswer: document.getElementById('scramble-answer'),
    scrambleBank: document.getElementById('scramble-bank'),
    scrambleFeedback: document.getElementById('scramble-feedback'),
    scrambleUndo: document.getElementById('scramble-undo'),
    scrambleCheck: document.getElementById('scramble-check'),
    scrambleNext: document.getElementById('scramble-next'),
    clozeSentence: document.getElementById('cloze-sentence'),
    clozeTranslation: document.getElementById('cloze-translation'),
    clozeChoices: document.getElementById('cloze-choices'),
    clozeFeedback: document.getElementById('cloze-feedback'),
    clozeSpeak: document.getElementById('cloze-speak'),
    clozeNext: document.getElementById('cloze-next'),
    speedTime: document.getElementById('speed-time'),
    speedScore: document.getElementById('speed-score'),
    speedStreak: document.getElementById('speed-streak'),
    speedWord: document.getElementById('speed-word'),
    speedChoices: document.getElementById('speed-choices'),
    speedFeedback: document.getElementById('speed-feedback'),
    speedStart: document.getElementById('speed-start'),
    judgeWord: document.getElementById('judge-word'),
    judgeTranslation: document.getElementById('judge-translation'),
    judgeTrue: document.getElementById('judge-true'),
    judgeFalse: document.getElementById('judge-false'),
    judgeFeedback: document.getElementById('judge-feedback'),
    judgeSpeak: document.getElementById('judge-speak'),
    judgeNext: document.getElementById('judge-next'),
    wordGrid: document.getElementById('word-grid'),
    exportFiltered: document.getElementById('export-filtered'),
    scopeLabel: document.getElementById('scope-label'),
    statKnown: document.getElementById('stat-known'),
    statWeak: document.getElementById('stat-weak'),
    statSeen: document.getElementById('stat-seen'),
    statTotal: document.getElementById('stat-total')
  };

  const state = {
    mode: 'cards',
    topicNo: 'all',
    filter: 'all',
    query: '',
    deck: [],
    index: 0,
    flipped: false,
    progress: loadProgress(),
    quiz: null,
    spell: null,
    match: null,
    listen: null,
    scramble: null,
    cloze: null,
    speed: null,
    judge: null
  };

  initTopicSelect();
  bindEvents();
  rebuildDeck();
  render();

  function initTopicSelect() {
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = `全部主題 (${words.length})`;
    els.topicSelect.appendChild(all);

    topics.forEach((topic) => {
      const option = document.createElement('option');
      option.value = String(topic.topicNo);
      const count = words.filter((word) => word.topicNo === topic.topicNo).length;
      option.textContent = `${topic.topicNo}. ${topic.zhTitle} ${topic.enTitle ? '/ ' + topic.enTitle : ''} (${count})`;
      els.topicSelect.appendChild(option);
    });
  }

  function bindEvents() {
    els.modeTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      state.mode = button.dataset.mode;
      if (state.mode === 'quiz') makeQuiz();
      if (state.mode === 'spell') makeSpell();
      if (state.mode === 'match') makeMatch();
      if (state.mode === 'listen') makeListen();
      if (state.mode === 'scramble') makeScramble();
      if (state.mode === 'cloze') makeCloze();
      if (state.mode === 'speed') makeSpeed();
      if (state.mode === 'judge') makeJudge();
      render();
    });

    els.search.addEventListener('input', () => {
      state.query = els.search.value.trim().toLowerCase();
      state.index = 0;
      rebuildDeck();
      render();
    });

    els.topicSelect.addEventListener('change', () => {
      state.topicNo = els.topicSelect.value;
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

    els.flashcard.addEventListener('click', flipCard);
    els.flashcard.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flipCard();
      }
    });
    els.flipCard.addEventListener('click', flipCard);
    els.prevCard.addEventListener('click', () => moveCard(-1));
    els.nextCard.addEventListener('click', () => moveCard(1));
    els.cardSpeak.addEventListener('click', () => speak(currentCard()?.word));
    els.speakCurrent.addEventListener('click', () => speak(currentQuestionWord()));
    els.markWeak.addEventListener('click', () => markCurrent('weak'));
    els.markKnown.addEventListener('click', () => markCurrent('known'));
    els.shuffleDeck.addEventListener('click', () => {
      state.deck = shuffle([...state.deck]);
      state.index = 0;
      state.flipped = false;
      render();
    });
    els.resetProgress.addEventListener('click', () => {
      if (!confirm('確定要清除 771 單字的學習進度嗎？')) return;
      state.progress = {};
      saveProgress();
      rebuildDeck();
      render();
    });

    els.quizNext.addEventListener('click', () => { makeQuiz(); renderQuiz(); });
    els.quizSpeak.addEventListener('click', () => speak(state.quiz?.answer.word));
    els.spellCheck.addEventListener('click', checkSpell);
    els.spellNext.addEventListener('click', () => { makeSpell(); renderSpell(); });
    els.spellSpeak.addEventListener('click', () => speak(state.spell?.word));
    els.spellInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') checkSpell();
    });
    els.matchNew.addEventListener('click', () => { makeMatch(); renderMatch(); });
    els.listenPlay.addEventListener('click', () => speak(state.listen?.answer.word));
    els.listenNext.addEventListener('click', () => { makeListen(); renderListen(); });
    els.scrambleUndo.addEventListener('click', undoScramble);
    els.scrambleCheck.addEventListener('click', checkScramble);
    els.scrambleNext.addEventListener('click', () => { makeScramble(); renderScramble(); });
    els.clozeSpeak.addEventListener('click', () => speak(state.cloze?.answer.word));
    els.clozeNext.addEventListener('click', () => { makeCloze(); renderCloze(); });
    els.speedStart.addEventListener('click', startSpeed);
    els.judgeTrue.addEventListener('click', () => answerJudge(true));
    els.judgeFalse.addEventListener('click', () => answerJudge(false));
    els.judgeSpeak.addEventListener('click', () => speak(state.judge?.word.word));
    els.judgeNext.addEventListener('click', () => { makeJudge(); renderJudge(); });
    els.exportFiltered.addEventListener('click', copyFilteredList);

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
      if (state.topicNo !== 'all' && String(word.topicNo) !== state.topicNo) return false;
      const progress = progressOf(word.id);
      if (state.filter === 'weak' && progress.status !== 'weak') return false;
      if (state.filter === 'known' && progress.status !== 'known') return false;
      if (state.filter === 'unseen' && progress.seen) return false;
      if (!state.query) return true;
      return searchable(word).includes(state.query);
    });
    if (state.index >= state.deck.length) state.index = Math.max(0, state.deck.length - 1);
    state.flipped = false;
  }

  function render() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === state.mode);
    });
    document.querySelectorAll('[data-filter]').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === state.filter);
    });
    Object.entries(els.views).forEach(([mode, view]) => view.classList.toggle('active', mode === state.mode));
    renderStats();
    renderMeter();
    if (state.mode === 'cards') renderCard();
    if (state.mode === 'quiz') renderQuiz();
    if (state.mode === 'spell') renderSpell();
    if (state.mode === 'match') renderMatch();
    if (state.mode === 'listen') renderListen();
    if (state.mode === 'scramble') renderScramble();
    if (state.mode === 'cloze') renderCloze();
    if (state.mode === 'speed') renderSpeed();
    if (state.mode === 'judge') renderJudge();
    if (state.mode === 'list') renderList();
  }

  function renderMeter() {
    const total = state.deck.length || 1;
    const position = state.deck.length ? state.index + 1 : 0;
    const percent = Math.round((position / total) * 100);
    els.deckLabel.textContent = state.deck.length ? `第 ${position} / ${state.deck.length} 張` : '沒有符合條件的單字';
    els.deckPercent.textContent = `${state.deck.length ? percent : 0}%`;
    els.deckMeter.style.width = `${state.deck.length ? percent : 0}%`;
  }

  function renderCard() {
    const card = currentCard();
    if (!card) {
      els.cardTopic.textContent = 'No cards';
      els.cardWord.textContent = '沒有單字';
      els.cardPos.textContent = '請調整篩選條件';
      els.cardFront.hidden = false;
      els.cardBack.hidden = true;
      return;
    }
    touch(card.id);
    els.cardTopic.textContent = `${card.topicNo}. ${card.topicZh} ${card.topicEn ? '/ ' + card.topicEn : ''}`;
    els.cardWord.textContent = card.word;
    els.cardPos.textContent = card.partOfSpeech || 'word';
    els.cardTranslation.textContent = card.translation || '尚無翻譯';
    els.cardExample.textContent = firstExample(card);
    els.cardNotes.textContent = card.notes.join('  ');
    els.cardFront.hidden = state.flipped;
    els.cardBack.hidden = !state.flipped;
    els.flipCard.textContent = state.flipped ? '看英文' : '翻面';
    saveProgress();
    renderStats();
  }

  function renderStats() {
    const scoped = state.deck;
    const known = scoped.filter((word) => progressOf(word.id).status === 'known').length;
    const weak = scoped.filter((word) => progressOf(word.id).status === 'weak').length;
    const seen = scoped.filter((word) => progressOf(word.id).seen).length;
    els.statKnown.textContent = known;
    els.statWeak.textContent = weak;
    els.statSeen.textContent = seen;
    els.statTotal.textContent = scoped.length;
    const topicText = state.topicNo === 'all'
      ? '全部主題'
      : `${state.topicNo}. ${topicNames.get(Number(state.topicNo))?.zhTitle || ''}`;
    els.scopeLabel.textContent = `${topicText} / ${scoped.length} 字`;
  }

  function renderQuiz() {
    if (!state.quiz) makeQuiz();
    const quiz = state.quiz;
    if (!quiz) return;
    els.quizWord.textContent = quiz.answer.word;
    els.quizHint.textContent = `${quiz.answer.topicNo}. ${quiz.answer.topicZh} / 選出最適合的中文意思`;
    els.quizFeedback.textContent = '';
    els.quizChoices.innerHTML = '';
    quiz.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = choice.translation || choice.word;
      button.addEventListener('click', () => {
        const correct = choice.id === quiz.answer.id;
        button.classList.add(correct ? 'correct' : 'wrong');
        els.quizFeedback.textContent = correct ? '答對了，這張記為已熟悉。' : `再想一下：${quiz.answer.word} = ${quiz.answer.translation}`;
        mark(quiz.answer.id, correct ? 'known' : 'weak');
        Array.from(els.quizChoices.children).forEach((child) => {
          if (child.textContent === quiz.answer.translation) child.classList.add('correct');
          child.disabled = true;
        });
        renderStats();
      });
      els.quizChoices.appendChild(button);
    });
  }

  function renderSpell() {
    if (!state.spell) makeSpell();
    if (!state.spell) return;
    const card = state.spell;
    els.spellTranslation.textContent = card.translation || card.topicZh;
    els.spellExample.textContent = firstExample(card).replace(new RegExp(escapeRegExp(card.word), 'ig'), '_____');
    els.spellInput.value = '';
    els.spellFeedback.textContent = '';
    setTimeout(() => els.spellInput.focus(), 0);
  }

  function renderMatch() {
    if (!state.match) makeMatch();
    if (!state.match) return;
    els.matchBoard.innerHTML = '';
    els.matchFeedback.textContent = `已完成 ${state.match.done.size / 2} / ${state.match.cards.length} 組`;
    state.match.tiles.forEach((tile) => {
      const button = document.createElement('button');
      button.className = 'match-tile';
      button.type = 'button';
      button.textContent = tile.text;
      button.dataset.key = tile.key;
      button.dataset.side = tile.side;
      if (state.match.done.has(tile.tileId)) button.classList.add('done', 'correct');
      if (state.match.selected?.tileId === tile.tileId) button.classList.add('selected');
      button.addEventListener('click', () => chooseMatch(tile));
      els.matchBoard.appendChild(button);
    });
  }

  function renderListen() {
    if (!state.listen) makeListen();
    const game = state.listen;
    if (!game) return;
    els.listenHint.textContent = `${game.answer.topicNo}. ${game.answer.topicZh} / 聽發音後選英文`;
    els.listenFeedback.textContent = '';
    els.listenChoices.innerHTML = '';
    game.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = choice.word;
      button.addEventListener('click', () => {
        const correct = choice.id === game.answer.id;
        button.classList.add(correct ? 'correct' : 'wrong');
        els.listenFeedback.textContent = correct
          ? `答對了：${game.answer.word} = ${game.answer.translation}`
          : `正確答案是 ${game.answer.word}。`;
        mark(game.answer.id, correct ? 'known' : 'weak');
        Array.from(els.listenChoices.children).forEach((child) => {
          if (child.textContent === game.answer.word) child.classList.add('correct');
          child.disabled = true;
        });
        renderStats();
      });
      els.listenChoices.appendChild(button);
    });
    setTimeout(() => speak(game.answer.word), 180);
  }

  function renderScramble() {
    if (!state.scramble) makeScramble();
    const game = state.scramble;
    if (!game) return;
    els.scrambleTranslation.textContent = game.card.translation || game.card.topicZh;
    els.scrambleTopic.textContent = `${game.card.topicNo}. ${game.card.topicZh} / ${game.card.partOfSpeech}`;
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

  function renderCloze() {
    if (!state.cloze) makeCloze();
    const game = state.cloze;
    if (!game) return;
    els.clozeSentence.textContent = game.sentence;
    els.clozeTranslation.textContent = game.answer.translation || game.answer.topicZh;
    els.clozeFeedback.textContent = '';
    els.clozeChoices.innerHTML = '';
    game.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = choice.word;
      button.addEventListener('click', () => {
        const correct = choice.id === game.answer.id;
        button.classList.add(correct ? 'correct' : 'wrong');
        els.clozeFeedback.textContent = correct
          ? `漂亮，${game.answer.word} 放在句子裡很自然。`
          : `正確填空是 ${game.answer.word}。`;
        mark(game.answer.id, correct ? 'known' : 'weak');
        Array.from(els.clozeChoices.children).forEach((child) => {
          if (child.textContent === game.answer.word) child.classList.add('correct');
          child.disabled = true;
        });
        renderStats();
      });
      els.clozeChoices.appendChild(button);
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
    els.speedFeedback.textContent = game.message || (game.running ? '選出正確中文意思。' : '按開始後會倒數 30 秒。');
    els.speedChoices.innerHTML = '';
    game.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = choice.translation || choice.word;
      button.disabled = !game.running;
      button.addEventListener('click', () => answerSpeed(choice));
      els.speedChoices.appendChild(button);
    });
  }

  function renderJudge() {
    if (!state.judge) makeJudge();
    const game = state.judge;
    if (!game) return;
    els.judgeWord.textContent = game.word.word;
    els.judgeTranslation.textContent = game.translation;
    els.judgeFeedback.textContent = '判斷這組英文與中文是否相符。';
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
      row.innerHTML = `
        <strong>${escapeHtml(word.word)}</strong>
        <span>${escapeHtml(word.translation || '')}</span>
        <span>${word.topicNo}. ${escapeHtml(word.topicZh)} ${escapeHtml(word.topicEn)}</span>
      `;
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
    if (state.mode === 'quiz') makeQuiz();
    if (state.mode === 'spell') makeSpell();
    if (state.mode === 'match') makeMatch();
    if (state.mode === 'listen') makeListen();
    if (state.mode === 'scramble') makeScramble();
    if (state.mode === 'cloze') makeCloze();
    if (state.mode === 'speed') makeSpeed();
    if (state.mode === 'judge') makeJudge();
  }

  function makeQuiz() {
    const pool = activePool();
    const answer = randomFrom(pool);
    if (!answer) return;
    const choices = shuffle([
      answer,
      ...shuffle(words.filter((word) => word.id !== answer.id && word.translation)).slice(0, 3)
    ]);
    state.quiz = { answer, choices };
  }

  function makeSpell() {
    state.spell = randomFrom(activePool());
  }

  function makeMatch() {
    const cards = shuffle(activePool().filter((word) => word.translation)).slice(0, 6);
    const tiles = shuffle(cards.flatMap((card) => [
      { tileId: `${card.id}-word`, key: card.id, side: 'word', text: card.word },
      { tileId: `${card.id}-translation`, key: card.id, side: 'translation', text: card.translation }
    ]));
    state.match = { cards, tiles, selected: null, done: new Set() };
  }

  function makeListen() {
    const answer = randomFrom(activePool());
    if (!answer) return;
    const choices = shuffle([
      answer,
      ...shuffle(words.filter((word) => word.id !== answer.id)).slice(0, 3)
    ]);
    state.listen = { answer, choices };
  }

  function makeScramble() {
    const pool = activePool().filter((word) => /^[a-z][a-z -]{2,}$/i.test(word.word) && word.word.length <= 16);
    const card = randomFrom(pool.length ? pool : activePool());
    if (!card) return;
    const letters = shuffle(card.word.replace(/\s+/g, '').split('').map((char, index) => ({ char, index, used: false })));
    if (letters.map((item) => item.char).join('').toLowerCase() === card.word.replace(/\s+/g, '').toLowerCase()) {
      letters.reverse();
    }
    state.scramble = { card, letters, picked: [] };
  }

  function makeCloze() {
    const pool = activePool().filter((word) => firstExample(word).toLowerCase().includes(word.word.toLowerCase()));
    const answer = randomFrom(pool.length ? pool : activePool());
    if (!answer) return;
    const sentence = firstExample(answer).replace(new RegExp(escapeRegExp(answer.word), 'ig'), '_____');
    const choices = shuffle([
      answer,
      ...shuffle(words.filter((word) => word.id !== answer.id && word.word.length <= Math.max(answer.word.length + 4, 8))).slice(0, 3)
    ]);
    state.cloze = { answer, sentence, choices };
  }

  function makeSpeed() {
    const answer = randomFrom(activePool());
    if (!answer) return;
    state.speed = {
      answer,
      choices: makeTranslationChoices(answer),
      score: 0,
      streak: 0,
      timeLeft: 30,
      running: false,
      timer: null,
      message: ''
    };
  }

  function makeJudge() {
    const word = randomFrom(activePool());
    if (!word) return;
    const shouldMatch = Math.random() >= 0.5;
    const other = randomFrom(words.filter((item) => item.id !== word.id && item.translation));
    state.judge = {
      word,
      shouldMatch,
      translation: shouldMatch ? word.translation : (other?.translation || word.translation),
      correctTranslation: word.translation
    };
  }

  function chooseMatch(tile) {
    if (state.match.done.has(tile.tileId)) return;
    const selected = state.match.selected;
    if (!selected) {
      state.match.selected = tile;
      renderMatch();
      return;
    }
    if (selected.tileId === tile.tileId) {
      state.match.selected = null;
      renderMatch();
      return;
    }
    const isMatch = selected.key === tile.key && selected.side !== tile.side;
    if (isMatch) {
      state.match.done.add(selected.tileId);
      state.match.done.add(tile.tileId);
      mark(tile.key, 'known');
      els.matchFeedback.textContent = '配對成功。';
    } else {
      mark(tile.key, 'weak');
      els.matchFeedback.textContent = '這組不對，再試一次。';
    }
    state.match.selected = null;
    renderMatch();
    renderStats();
  }

  function checkSpell() {
    const card = state.spell;
    if (!card) return;
    const answer = normalizeAnswer(card.word);
    const guess = normalizeAnswer(els.spellInput.value);
    const correct = answer === guess;
    els.spellFeedback.textContent = correct ? '拼對了，這張記為已熟悉。' : `正確拼法：${card.word}`;
    els.spellFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    mark(card.id, correct ? 'known' : 'weak');
    renderStats();
  }

  function undoScramble() {
    const game = state.scramble;
    if (!game || !game.picked.length) return;
    const last = game.picked.pop();
    game.letters[last.index].used = false;
    renderScramble();
  }

  function checkScramble() {
    const game = state.scramble;
    if (!game) return;
    const guess = normalizeAnswer(game.picked.map((item) => item.char).join(''));
    const answer = normalizeAnswer(game.card.word).replace(/\s+/g, '');
    const correct = guess === answer;
    els.scrambleFeedback.textContent = correct ? '重組成功，這張記為已熟悉。' : `再排一次，正確是 ${game.card.word}`;
    els.scrambleFeedback.className = `feedback ${correct ? 'good' : 'bad'}`;
    mark(game.card.id, correct ? 'known' : 'weak');
    renderStats();
  }

  function startSpeed() {
    clearSpeedTimer();
    const answer = randomFrom(activePool());
    state.speed = {
      answer,
      choices: makeTranslationChoices(answer),
      score: 0,
      streak: 0,
      timeLeft: 30,
      running: true,
      timer: null,
      message: ''
    };
    state.speed.timer = setInterval(() => {
      state.speed.timeLeft -= 1;
      if (state.speed.timeLeft <= 0) {
        state.speed.timeLeft = 0;
        state.speed.running = false;
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
    if (correct) {
      game.score += 10 + Math.min(game.streak, 5);
      game.streak += 1;
      mark(game.answer.id, 'known');
      game.message = '答對，加速前進。';
    } else {
      game.streak = 0;
      mark(game.answer.id, 'weak');
      game.message = `答錯，${game.answer.word} = ${game.answer.translation}`;
    }
    game.answer = randomFrom(activePool());
    game.choices = makeTranslationChoices(game.answer);
    renderSpeed();
    renderStats();
  }

  function answerJudge(value) {
    const game = state.judge;
    if (!game) return;
    const correct = value === game.shouldMatch;
    els.judgeFeedback.textContent = correct
      ? `答對：${game.word.word} = ${game.correctTranslation}`
      : `這題應該選「${game.shouldMatch ? '正確' : '錯誤'}」：${game.word.word} = ${game.correctTranslation}`;
    els.judgeTrue.disabled = true;
    els.judgeFalse.disabled = true;
    els.judgeTrue.classList.toggle('correct', game.shouldMatch);
    els.judgeFalse.classList.toggle('correct', !game.shouldMatch);
    mark(game.word.id, correct ? 'known' : 'weak');
    renderStats();
  }

  function makeTranslationChoices(answer) {
    if (!answer) return [];
    return shuffle([
      answer,
      ...shuffle(words.filter((word) => word.id !== answer.id && word.translation)).slice(0, 3)
    ]);
  }

  function clearSpeedTimer() {
    if (state.speed?.timer) clearInterval(state.speed.timer);
    if (state.speed) state.speed.timer = null;
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

  function currentCard() {
    return state.deck[state.index] || null;
  }

  function currentQuestionWord() {
    if (state.mode === 'quiz') return state.quiz?.answer.word;
    if (state.mode === 'spell') return state.spell?.word;
    if (state.mode === 'listen') return state.listen?.answer.word;
    if (state.mode === 'scramble') return state.scramble?.card.word;
    if (state.mode === 'cloze') return state.cloze?.answer.word;
    if (state.mode === 'speed') return state.speed?.answer.word;
    if (state.mode === 'judge') return state.judge?.word.word;
    return currentCard()?.word;
  }

  function activePool() {
    return state.deck.length ? state.deck : words;
  }

  function progressOf(id) {
    if (!state.progress[id]) state.progress[id] = { seen: false, status: 'new', updatedAt: 0 };
    return state.progress[id];
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.progress));
    } catch {}
  }

  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  function copyFilteredList() {
    const text = state.deck.map((word) => [
      word.topicNo,
      word.word,
      word.partOfSpeech,
      word.translation,
      firstExample(word)
    ].join('\t')).join('\n');
    navigator.clipboard?.writeText(text);
    els.exportFiltered.textContent = '已複製';
    setTimeout(() => { els.exportFiltered.textContent = '複製清單'; }, 1000);
  }

  function searchable(word) {
    return [
      word.word,
      word.topicZh,
      word.topicEn,
      word.partOfSpeech,
      word.translation,
      word.examples.join(' '),
      word.notes.join(' ')
    ].join(' ').toLowerCase();
  }

  function arrayText(value) {
    return Array.isArray(value) ? value.filter(Boolean).join('；') : String(value || '');
  }

  function firstExample(card) {
    return card.examples?.[0] || `This word is ${card.word}.`;
  }

  function cleanWord(word) {
    return String(word || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeAnswer(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
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

  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }
})();
