(() => {
  const raw = window.VOCABULARY_DATA;
  if (!raw || !Array.isArray(raw.units)) {
    document.body.innerHTML = '<main class="app"><section class="panel stage">找不到單字資料。</section></main>';
    return;
  }

  const STORE_KEY = 'memory-cards-progress-v1';
  const palette = ['#ff8a65', '#60a5fa', '#8bdc77', '#f7c948', '#c084fc', '#29c7ac'];

  const examples = {
    baby: 'The baby is sleeping peacefully.',
    born: 'She was born in Taipei.',
    child: 'Every child needs care and love.',
    kingdom: 'The kingdom is peaceful and beautiful.',
    castle: 'The castle stands on the hill.',
    king: 'The king wears a gold crown.',
    queen: 'The queen is wise and kind.',
    man: 'The man is waiting at the station.',
    woman: 'The woman is teaching the class.',
    success: 'Success takes time.',
    effort: 'Effort helps you grow.',
    useful: 'This tool is useful.',
    focus: 'Focus on your goals.',
    ready: 'I am ready to start.',
    difficult: 'This problem is difficult.'
  };

  const els = {
    modeTabs: document.getElementById('mode-tabs'),
    unitStrip: document.getElementById('unit-strip'),
    cardsView: document.getElementById('cards-view'),
    imageView: document.getElementById('image-view'),
    pairView: document.getElementById('pair-view'),
    spellView: document.getElementById('spell-view'),
    sprintView: document.getElementById('sprint-view'),
    resetProgress: document.getElementById('reset-progress'),
    speakCurrent: document.getElementById('speak-current'),
    reviewWeak: document.getElementById('review-weak'),
    shuffleDeck: document.getElementById('shuffle-deck'),
    meterLabel: document.getElementById('meter-label'),
    meterPercent: document.getElementById('meter-percent'),
    meterFill: document.getElementById('meter-fill'),
    statKnown: document.getElementById('stat-known'),
    statWeak: document.getElementById('stat-weak'),
    statSeen: document.getElementById('stat-seen'),
    statTotal: document.getElementById('stat-total')
  };

  const units = raw.units.map((unit, index) => ({
    ...unit,
    accent: palette[index % palette.length],
    words: unit.words.map((word) => ({
      ...word,
      unitId: unit.id,
      unitNumber: unit.number,
      unitTitle: unit.title,
      unitTitleZh: unit.titleZh,
      coverImage: unit.coverImage,
      example: examples[word.word] || defaultExample(word.word, unit.title),
      pronunciation: pronunciationFor(word.word),
      fullCardImage: word.cardImage ? word.cardImage.replace('assets/cards/', 'assets/cards-full/') : word.cardImage
    }))
  }));

  const allCards = units.flatMap((unit) => unit.words);
  const byId = new Map(allCards.map((card) => [card.id, card]));
  const state = {
    mode: 'cards',
    unitId: units[0]?.id || 'all',
    reviewWeakOnly: false,
    deck: [],
    index: 0,
    flipped: false,
    progress: loadProgress(),
    imageRound: null,
    pairRound: null,
    spellRound: null,
    sprintRound: null,
    sprintScore: 0
  };

  rebuildDeck();
  bindEvents();
  renderAll();

  function defaultExample(word, unitTitle) {
    const article = /^[aeiou]/i.test(word) ? 'an' : 'a';
    if (unitTitle === 'Ways to Achieve Success') return 'This word helps us talk about success.';
    if (unitTitle === 'Sales') return 'This word is useful in sales conversations.';
    if (unitTitle === 'In an Office') return 'This word appears often in an office.';
    if (unitTitle === 'Services and Media') return 'This word is useful in daily services.';
    if (unitTitle === 'Professionals') return 'This word names a helpful professional.';
    if (unitTitle === 'Job Titles') return 'This word names a job or role.';
    return 'This is ' + article + ' ' + word + '.';
  }

  function pronunciationFor(word) {
    return String(word)
      .replace(/\s*\/\s*/g, ' ')
      .replace(/\./g, '')
      .replace("ma'am", 'maam');
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.progress));
    } catch (error) {}
  }

  function progressOf(id) {
    if (!state.progress[id]) {
      state.progress[id] = { seen: 0, correct: 0, wrong: 0, status: 'new' };
    }
    return state.progress[id];
  }

  function markSeen(card) {
    const item = progressOf(card.id);
    item.seen += 1;
    if (item.status === 'new') item.status = 'learning';
    saveProgress();
  }

  function markKnown(card) {
    const item = progressOf(card.id);
    item.seen += 1;
    item.correct += 1;
    item.status = 'known';
    saveProgress();
  }

  function markWeak(card) {
    const item = progressOf(card.id);
    item.seen += 1;
    item.wrong += 1;
    item.status = 'weak';
    saveProgress();
  }

  function currentUnit() {
    return units.find((unit) => unit.id === state.unitId) || units[0];
  }

  function unitCards() {
    const unit = currentUnit();
    let cards = unit ? unit.words.slice() : allCards.slice();
    if (state.reviewWeakOnly) {
      const weak = cards.filter((card) => progressOf(card.id).status === 'weak');
      if (weak.length) cards = weak;
    }
    return cards;
  }

  function currentCard() {
    if (!state.deck.length) rebuildDeck();
    return state.deck[state.index] || state.deck[0] || allCards[0];
  }

  function randomStudyCard() {
    const cards = unitCards();
    const weak = cards.filter((card) => progressOf(card.id).status === 'weak');
    const pool = weak.length && Math.random() < 0.55 ? weak : cards;
    return pool[Math.floor(Math.random() * pool.length)] || cards[0] || allCards[0];
  }

  function rebuildDeck(options = {}) {
    const cards = unitCards();
    state.deck = options.shuffle ? shuffle(cards) : cards;
    state.index = Math.min(state.index, Math.max(0, state.deck.length - 1));
    state.flipped = false;
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function sample(list, count, excludeId) {
    return shuffle(list.filter((card) => card.id !== excludeId)).slice(0, count);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function bindEvents() {
    els.modeTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      state.mode = button.dataset.mode;
      resetRounds();
      renderAll();
    });

    els.unitStrip.addEventListener('click', (event) => {
      const button = event.target.closest('[data-unit]');
      if (!button) return;
      state.unitId = button.dataset.unit;
      state.reviewWeakOnly = false;
      state.index = 0;
      rebuildDeck();
      resetRounds();
      renderAll();
    });

    els.speakCurrent.addEventListener('click', () => {
      const card = currentPromptCard();
      if (card) speak(card.pronunciation || card.word);
    });

    els.resetProgress.addEventListener('click', () => {
      state.progress = {};
      saveProgress();
      rebuildDeck();
      resetRounds();
      renderAll();
    });

    els.reviewWeak.addEventListener('click', () => {
      state.reviewWeakOnly = !state.reviewWeakOnly;
      state.index = 0;
      rebuildDeck({ shuffle: true });
      resetRounds();
      renderAll();
    });

    els.shuffleDeck.addEventListener('click', () => {
      rebuildDeck({ shuffle: true });
      resetRounds();
      renderAll();
    });

    els.cardsView.addEventListener('click', handleCards);
    els.imageView.addEventListener('click', handleImage);
    els.pairView.addEventListener('click', handlePair);
    els.spellView.addEventListener('click', handleSpell);
    els.sprintView.addEventListener('click', handleSprint);
    els.spellView.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const input = event.target.closest('[data-spell-input]');
        if (input) checkSpell(input.value);
      }
    });
  }

  function resetRounds() {
    state.imageRound = null;
    state.pairRound = null;
    state.spellRound = null;
    state.sprintRound = null;
  }

  function currentPromptCard() {
    if (state.mode === 'image' && state.imageRound) return byId.get(state.imageRound.answerId);
    if (state.mode === 'spell' && state.spellRound) return byId.get(state.spellRound.answerId);
    if (state.mode === 'sprint' && state.sprintRound) return byId.get(state.sprintRound.answerId);
    return currentCard();
  }

  function handleCards(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const card = currentCard();
    if (!action || !card) return;

    if (action === 'flip') {
      state.flipped = !state.flipped;
      markSeen(card);
    }

    if (action === 'prev') {
      state.index = (state.index - 1 + state.deck.length) % state.deck.length;
      state.flipped = false;
    }

    if (action === 'next') {
      state.index = (state.index + 1) % state.deck.length;
      state.flipped = false;
    }

    if (action === 'known') {
      markKnown(card);
      state.index = (state.index + 1) % state.deck.length;
      state.flipped = false;
    }

    if (action === 'weak') {
      markWeak(card);
      state.index = (state.index + 1) % state.deck.length;
      state.flipped = false;
    }

    if (action === 'speak') speak(card.pronunciation || card.word);
    renderAll();
  }

  function handleImage(event) {
    const choice = event.target.closest('[data-choice-id]');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'new-image') {
      state.index = (state.index + 1) % Math.max(1, state.deck.length);
      state.imageRound = null;
      renderAll();
      return;
    }
    if (!choice || !state.imageRound || state.imageRound.done) return;
    const answer = byId.get(state.imageRound.answerId);
    state.imageRound.choiceId = choice.dataset.choiceId;
    state.imageRound.done = true;
    if (choice.dataset.choiceId === state.imageRound.answerId) markKnown(answer);
    else markWeak(answer);
    renderAll();
  }

  function handlePair(event) {
    const tile = event.target.closest('[data-pair-id]');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'new-pair') {
      state.pairRound = null;
      renderAll();
      return;
    }
    if (!tile || !state.pairRound) return;

    const side = tile.dataset.side;
    const id = tile.dataset.pairId;
    if (state.pairRound.matched.includes(id)) return;
    state.pairRound.selected[side] = id;

    const left = state.pairRound.selected.left;
    const right = state.pairRound.selected.right;
    if (left && right) {
      if (left === right) {
        state.pairRound.matched.push(left);
        markKnown(byId.get(left));
      } else {
        markWeak(byId.get(left));
        state.pairRound.flashWrong = [left, right];
      }
      state.pairRound.selected = {};
    }
    renderAll();
  }

  function handleSpell(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'spell-new') {
      state.index = (state.index + 1) % Math.max(1, state.deck.length);
      state.spellRound = null;
      renderAll();
      return;
    }
    if (action === 'spell-check') {
      const input = els.spellView.querySelector('[data-spell-input]');
      checkSpell(input ? input.value : '');
    }
  }

  function checkSpell(value) {
    if (!state.spellRound || state.spellRound.done) return;
    const answer = byId.get(state.spellRound.answerId);
    const ok = normalize(value) === normalize(answer.word);
    state.spellRound.value = value;
    state.spellRound.done = true;
    state.spellRound.correct = ok;
    if (ok) markKnown(answer);
    else markWeak(answer);
    renderAll();
  }

  function handleSprint(event) {
    const choice = event.target.closest('[data-sprint-id]');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'sprint-new') {
      state.index = (state.index + 1) % Math.max(1, state.deck.length);
      state.sprintRound = null;
      renderAll();
      return;
    }
    if (!choice || !state.sprintRound || state.sprintRound.done) return;
    const answer = byId.get(state.sprintRound.answerId);
    state.sprintRound.choiceId = choice.dataset.sprintId;
    state.sprintRound.done = true;
    if (choice.dataset.sprintId === state.sprintRound.answerId) {
      state.sprintScore += 1;
      state.sprintRound.score = state.sprintScore;
      markKnown(answer);
    } else {
      markWeak(answer);
    }
    renderAll();
  }

  function renderAll() {
    renderModeTabs();
    renderUnits();
    renderStatus();
    renderViews();
  }

  function renderModeTabs() {
    els.modeTabs.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === state.mode);
    });
  }

  function renderUnits() {
    els.unitStrip.innerHTML = units.map((unit) => [
      '<button class="unit-tab ' + (unit.id === state.unitId ? 'active' : '') + '" type="button" data-unit="' + escapeHtml(unit.id) + '">',
      '<span>Unit ' + unit.number + '</span>',
      '<small>' + escapeHtml(unit.titleZh) + ' / ' + unit.words.length + ' 字</small>',
      '</button>'
    ].join('')).join('');
  }

  function renderStatus() {
    const cards = unitCards();
    const stats = cards.reduce((acc, card) => {
      const item = progressOf(card.id);
      if (item.status === 'known') acc.known += 1;
      if (item.status === 'weak') acc.weak += 1;
      if (item.seen > 0) acc.seen += 1;
      return acc;
    }, { known: 0, weak: 0, seen: 0 });

    const percent = cards.length ? Math.round((stats.known / cards.length) * 100) : 0;
    els.meterLabel.textContent = state.reviewWeakOnly ? '待加強複習' : currentUnit().titleZh;
    els.meterPercent.textContent = percent + '%';
    els.meterFill.style.width = percent + '%';
    els.statKnown.textContent = stats.known;
    els.statWeak.textContent = stats.weak;
    els.statSeen.textContent = stats.seen;
    els.statTotal.textContent = cards.length;
    els.reviewWeak.classList.toggle('primary', state.reviewWeakOnly);
  }

  function renderViews() {
    const views = {
      cards: els.cardsView,
      image: els.imageView,
      pair: els.pairView,
      spell: els.spellView,
      sprint: els.sprintView
    };
    Object.entries(views).forEach(([mode, el]) => el.classList.toggle('active', mode === state.mode));
    if (state.mode === 'cards') renderCards();
    if (state.mode === 'image') renderImageGame();
    if (state.mode === 'pair') renderPairGame();
    if (state.mode === 'spell') renderSpellGame();
    if (state.mode === 'sprint') renderSprintGame();
  }

  function renderCards() {
    const card = currentCard();
    if (!card) {
      els.cardsView.innerHTML = '<div class="prompt-card">沒有單字。</div>';
      return;
    }
    const item = progressOf(card.id);
    const count = state.deck.length ? state.index + 1 + ' / ' + state.deck.length : '0 / 0';
    els.cardsView.innerHTML = [
      '<div class="study-shell">',
      '<div class="meter" style="width:min(640px,100%);">',
      '<div class="meter-row"><span>第 ' + count + ' 張</span><span>' + statusText(item.status) + '</span></div>',
      '<div class="bar"><span style="width:' + Math.round(((state.index + 1) / Math.max(1, state.deck.length)) * 100) + '%"></span></div>',
      '</div>',
      '<div class="memory-card ' + (state.flipped ? 'flipped' : '') + '">',
      '<div class="memory-card-inner">',
      '<article class="card-face front" data-action="flip">',
      '<div class="front-meta"><span class="pill">Unit ' + card.unitNumber + '</span><span class="pill">' + escapeHtml(card.unitTitleZh) + '</span></div>',
      '<h2 class="front-word">' + escapeHtml(card.word) + '</h2>',
      '</article>',
      '<article class="card-face back" data-action="flip">',
      '<div class="card-image-box"><img src="' + escapeHtml(card.fullCardImage || card.cardImage) + '" alt="' + escapeHtml(card.word) + '"></div>',
      '<div class="answer-block">',
      '<h2>' + escapeHtml(card.translation) + '</h2>',
      '<p>' + escapeHtml(card.example) + '</p>',
      '<p><strong>Pronunciation:</strong> ' + escapeHtml(card.pronunciation) + '</p>',
      '</div>',
      '</article>',
      '</div>',
      '</div>',
      '<div class="card-actions">',
      '<button class="btn" type="button" data-action="prev">上一張</button>',
      '<button class="btn primary" type="button" data-action="flip">翻面</button>',
      '<button class="btn" type="button" data-action="speak">發音</button>',
      '<button class="btn warn" type="button" data-action="weak">再練</button>',
      '<button class="btn good" type="button" data-action="known">會了</button>',
      '<button class="btn" type="button" data-action="next">下一張</button>',
      '</div>',
      '</div>'
    ].join('');
  }

  function renderImageGame() {
    if (!state.imageRound) {
      const answer = randomStudyCard();
      const options = shuffle([answer, ...sample(unitCards(), 3, answer.id)]).slice(0, 4);
      state.imageRound = { answerId: answer.id, options: options.map((card) => card.id), done: false, choiceId: null };
    }
    const round = state.imageRound;
    const answer = byId.get(round.answerId);
    els.imageView.innerHTML = [
      gameHeader('圖片配對', escapeHtml(answer.word), '<button class="btn" type="button" data-action="new-image">下一題</button>'),
      '<div class="choice-grid">',
      round.options.map((id) => imageChoice(id, round)).join(''),
      '</div>',
      '<div class="feedback">' + imageFeedback(round) + '</div>'
    ].join('');
  }

  function imageChoice(id, round) {
    const card = byId.get(id);
    let className = 'choice';
    if (round.done && id === round.answerId) className += ' correct';
    else if (round.done && id === round.choiceId) className += ' wrong';
    return [
      '<button class="' + className + '" type="button" data-choice-id="' + escapeHtml(id) + '">',
      '<img src="' + escapeHtml(card.cardImage) + '" alt="">',
      '<strong>' + escapeHtml(card.translation) + '</strong>',
      '</button>'
    ].join('');
  }

  function imageFeedback(round) {
    if (!round.done) return '選出符合英文單字的圖片。';
    const answer = byId.get(round.answerId);
    return round.choiceId === round.answerId ? '答對了：' + escapeHtml(answer.translation) : '答案是：' + escapeHtml(answer.translation);
  }

  function renderPairGame() {
    if (!state.pairRound) {
      const cards = shuffle(unitCards()).slice(0, Math.min(6, unitCards().length));
      state.pairRound = {
        ids: cards.map((card) => card.id),
        left: shuffle(cards.map((card) => card.id)),
        right: shuffle(cards.map((card) => card.id)),
        selected: {},
        matched: [],
        flashWrong: []
      };
    }
    const round = state.pairRound;
    els.pairView.innerHTML = [
      gameHeader('中英配對', round.matched.length + ' / ' + round.ids.length, '<button class="btn" type="button" data-action="new-pair">重開一局</button>'),
      '<div class="pair-board">',
      '<div class="pair-column">' + round.left.map((id) => pairTile(id, 'left', byId.get(id).word, round)).join('') + '</div>',
      '<div class="pair-column">' + round.right.map((id) => pairTile(id, 'right', byId.get(id).translation, round)).join('') + '</div>',
      '</div>',
      '<div class="feedback">' + (round.matched.length === round.ids.length ? '全部配對完成。' : '點一個英文，再點它的中文。') + '</div>'
    ].join('');
  }

  function pairTile(id, side, text, round) {
    let className = 'pair-tile';
    if (round.selected[side] === id) className += ' selected';
    if (round.matched.includes(id)) className += ' matched correct';
    if (round.flashWrong.includes(id)) className += ' wrong';
    return '<button class="' + className + '" type="button" data-side="' + side + '" data-pair-id="' + escapeHtml(id) + '">' + escapeHtml(text) + '</button>';
  }

  function renderSpellGame() {
    if (!state.spellRound) {
      const answer = randomStudyCard();
      state.spellRound = { answerId: answer.id, value: '', done: false, correct: false };
    }
    const round = state.spellRound;
    const answer = byId.get(round.answerId);
    els.spellView.innerHTML = [
      gameHeader('拼字挑戰', escapeHtml(answer.translation), '<button class="btn" type="button" data-action="spell-new">下一題</button>'),
      '<div class="spell-box">',
      '<div class="spell-image"><img src="' + escapeHtml(answer.cardImage) + '" alt=""></div>',
      '<div class="spell-form">',
      '<input data-spell-input type="text" autocomplete="off" spellcheck="false" value="' + escapeHtml(round.value) + '" placeholder="輸入英文單字">',
      '<div class="game-actions">',
      '<button class="btn primary" type="button" data-action="spell-check">檢查</button>',
      '<button class="btn" type="button" data-action="spell-new">換一題</button>',
      '</div>',
      '<div class="feedback">' + spellFeedback(round, answer) + '</div>',
      '</div>',
      '</div>'
    ].join('');
    const input = els.spellView.querySelector('[data-spell-input]');
    if (input && !round.done) input.focus();
  }

  function spellFeedback(round, answer) {
    if (!round.done) return '可以先聽發音，再自己拼出來。';
    return round.correct ? '答對了。' : '答案是 ' + escapeHtml(answer.word) + '。';
  }

  function renderSprintGame() {
    if (!state.sprintRound) {
      const answer = randomStudyCard();
      const options = shuffle([answer, ...sample(unitCards(), 3, answer.id)]).slice(0, 4);
      state.sprintRound = {
        answerId: answer.id,
        options: options.map((card) => card.id),
        done: false,
        choiceId: null,
        score: state.sprintScore
      };
    }
    const round = state.sprintRound;
    const answer = byId.get(round.answerId);
    els.sprintView.innerHTML = [
      gameHeader('快問快答', 'Score ' + round.score, '<button class="btn" type="button" data-action="sprint-new">下一題</button>'),
      '<div class="sprint-card">',
      '<h2>' + escapeHtml(answer.translation) + '</h2>',
      '<div class="choice-grid" style="width:100%;">',
      round.options.map((id) => sprintChoice(id, round)).join(''),
      '</div>',
      '<div class="feedback">' + sprintFeedback(round, answer) + '</div>',
      '</div>'
    ].join('');
  }

  function sprintChoice(id, round) {
    const card = byId.get(id);
    let className = 'choice';
    if (round.done && id === round.answerId) className += ' correct';
    else if (round.done && id === round.choiceId) className += ' wrong';
    return '<button class="' + className + '" type="button" data-sprint-id="' + escapeHtml(id) + '"><strong>' + escapeHtml(card.word) + '</strong></button>';
  }

  function sprintFeedback(round, answer) {
    if (!round.done) return '看到中文，立刻選英文。';
    return round.choiceId === round.answerId ? '反應很好。' : '答案是 ' + escapeHtml(answer.word) + '。';
  }

  function gameHeader(title, prompt, actionHtml) {
    return [
      '<header class="game-header">',
      '<div class="game-title">',
      '<h2>' + title + '</h2>',
      '<p>' + prompt + '</p>',
      '</div>',
      '<div class="game-actions">' + actionHtml + '</div>',
      '</header>'
    ].join('');
  }

  function statusText(status) {
    if (status === 'known') return '已熟悉';
    if (status === 'weak') return '待加強';
    if (status === 'learning') return '學習中';
    return '新單字';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
