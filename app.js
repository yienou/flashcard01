(() => {
  const raw = window.VOCABULARY_DATA || readSeedData();
  if (!raw || !Array.isArray(raw.units) || !raw.units.length) {
    document.body.innerHTML = '<main class="app"><section class="panel empty-state">找不到單字資料，請確認 <code>vocabulary.json</code> 與 <code>vocabulary-data.js</code> 已正確建立。</section></main>';
    return;
  }

  const palette = ['#f28f6b', '#5ca8ff', '#76c893', '#f4b942', '#7fb6d6', '#8ccf86', '#ef8fa3', '#74a9d8', '#f3c56b', '#9ad18b'];

  const pronunciationOverrides = {
    'Mr.': 'Mister',
    'Mrs.': 'Misses',
    'Ms.': 'Miz',
    'Dr.': 'Doctor',
    "ma'am": 'maam',
    'last name / family name': 'last name family name'
  };

  const exampleOverrides = {
    baby: 'The baby is sleeping peacefully.',
    born: 'She was born in Taipei.',
    child: 'Every child needs care and love.',
    kid: 'The kid is playing soccer.',
    childhood: 'Childhood is full of happy memories.',
    boy: 'The boy is reading a book.',
    girl: 'The girl is smiling brightly.',
    teenager: 'A teenager is learning every day.',
    youth: 'Youth is a time to dream big.',
    adult: 'An adult can make careful choices.',
    man: 'The man is waiting at the station.',
    guy: 'That guy is my friend.',
    woman: 'The woman is teaching the class.',
    male: 'The male lion is strong.',
    female: 'The female singer has a clear voice.',
    kingdom: 'The kingdom is peaceful and beautiful.',
    castle: 'The castle stands on the hill.',
    king: 'The king wears a gold crown.',
    queen: 'The queen is wise and kind.',
    beauty: 'Beauty can be found in nature.',
    prince: 'The prince rides a white horse.',
    princess: 'The princess waves to the crowd.',
    master: 'He is a master of music.',
    angel: 'The angel is shining in the sky.',
    god: 'Many people pray to God.',
    human: 'Every human needs water.',
    person: 'Each person is important.',
    people: 'People should help each other.',
    common: 'This idea is common in daily life.',
    servant: 'The servant brings tea.',
    farmer: 'The farmer grows rice.',
    title: 'What is your title?',
    sir: 'Sir, please come in.',
    'Mr.': 'Mr. Chen is my teacher.',
    Miss: 'Miss Lin is our friend.',
    "ma'am": 'Maam, please sit here.',
    'Ms.': 'Ms. Wang is in the office.',
    'Mrs.': 'Mrs. Lee is my neighbor.',
    married: 'They are married and happy.',
    gentleman: 'The gentleman opens the door.',
    lady: 'The lady wears a pink hat.',
    'Dr.': 'Dr. Chen works at the hospital.',
    dear: 'Dear Anna, thank you for your letter.',
    name: 'My name is Kevin.',
    'first name': 'Your first name comes first.',
    'last name / family name': 'Your last name is written at the end.',
    artist: 'The artist paints a beautiful picture.',
    create: 'We create new ideas in class.',
    paint: 'The children paint with bright colors.',
    painter: 'The painter is fixing the wall.',
    actor: 'The actor smiles on stage.',
    actress: 'The actress performs a great role.',
    act: 'They act in the school play.',
    cowboy: 'The cowboy rides across the field.',
    player: 'The player is ready for the game.',
    magician: 'The magician pulls a rabbit from the hat.',
    magic: 'Magic makes the show exciting.',
    model: 'The model walks on the runway.',
    musician: 'The musician plays the piano.',
    singer: 'The singer has a lovely voice.',
    sing: 'We sing together at the concert.',
    company: 'The company is growing fast.',
    manager: 'The manager leads the team.',
    assistant: 'The assistant helps the teacher.',
    secretary: 'The secretary answers the phone.',
    army: 'The army protects the country.',
    captain: 'The captain leads the ship.',
    general: 'The general gives the order.',
    major: 'He is a major in the army.',
    sailor: 'The sailor works on the ship.',
    soldier: 'The soldier stands at attention.',
    tank: 'The tank moves slowly.',
    president: 'The president gives a speech.',
    officer: 'The officer checks the ID.',
    police: 'The police keep the city safe.',
    duty: 'It is my duty to help.',
    thief: 'The thief runs away quickly.',
    doctor: 'The doctor helps sick people.',
    dentist: 'The dentist checks my teeth.',
    nurse: 'The nurse cares for patients.',
    diplomat: 'The diplomat talks with other countries.',
    judge: 'The judge listens carefully.',
    lawyer: 'The lawyer explains the case.',
    'deal with': 'We deal with problems one by one.',
    mechanic: 'The mechanic fixes the car.',
    check: 'Please check your answers again.',
    engineer: 'The engineer designs bridges.',
    operation: 'The operation lasted two hours.',
    scientist: 'The scientist studies the stars.',
    invent: 'Students invent new tools in class.',
    coach: 'The coach trains the team.',
    service: 'The service was very friendly.',
    barber: 'The barber cuts hair neatly.',
    'hair dresser': 'The hair dresser styles my hair.',
    cook: 'The cook prepares dinner.',
    waiter: 'The waiter brings the menu.',
    waitress: 'The waitress serves soup.',
    serve: 'They serve food to the guests.',
    driver: 'The driver stopped at the red light.',
    mailman: 'The mailman delivers letters.',
    mail: 'I sent a mail today.',
    guide: 'The guide shows us the museum.',
    lead: 'Please lead the way.',
    journalist: 'The journalist writes a news story.',
    reporter: 'The reporter asks questions.',
    writer: 'The writer finishes a new book.',
    deliver: 'The courier will deliver the box.',
    boss: 'The boss is meeting the team.',
    owner: 'The owner opened the shop.',
    own: 'I own this notebook.',
    businessman: 'The businessman travels a lot.',
    business: 'The business is open today.',
    branch: 'Our school has one branch here.',
    employ: 'The company will employ more workers.',
    worker: 'The worker wears a helmet.',
    hire: 'They hire a new teacher.',
    meeting: 'The meeting starts at nine.',
    contract: 'We signed the contract.',
    clerk: 'The clerk helps customers at the counter.',
    job: 'My job is to help others.',
    interview: 'The interview starts soon.',
    work: 'I work after school.',
    experience: 'Experience helps you learn faster.',
    earn: 'He earns money every week.',
    income: 'Her income comes from two jobs.',
    production: 'The production line is busy.',
    salesman: 'The salesman shows a new phone.',
    sell: 'They sell fresh fruit here.',
    thing: 'This thing is very useful.',
    discover: 'Scientists discover new facts every year.',
    valuable: 'Time is valuable.',
    increase: 'The number will increase tomorrow.',
    sale: 'The store has a big sale today.',
    decrease: 'The rain will decrease later.',
    find: 'I can find my key now.',
    produce: 'The factory produces bread.',
    advertisement: 'The advertisement is on the screen.',
    compare: 'We compare two answers.',
    complain: 'Do not complain too much.',
    satisfy: 'This result can satisfy everyone.',
    express: 'You can express your ideas clearly.',
    success: 'Success takes time.',
    succeed: 'If you study, you can succeed.',
    become: 'You can become a better reader.',
    effort: 'Effort helps you grow.',
    gather: 'People gather in the hall.',
    useful: 'This tool is useful.',
    stay: 'Please stay calm.',
    positive: 'Stay positive every day.',
    cheerleader: 'The cheerleader cheers for the team.',
    continue: 'Please continue reading.',
    focus: 'Focus on your goals.',
    ready: 'I am ready to start.',
    handle: 'You can handle this task.',
    difficult: 'This problem is difficult.',
    develop: 'We develop new skills.'
  };

  const verbWords = new Set([
    'born', 'become', 'create', 'paint', 'act', 'sing', 'own', 'employ',
    'hire', 'deal with', 'check', 'invent', 'increase', 'decrease', 'find',
    'produce', 'compare', 'complain', 'satisfy', 'express', 'succeed',
    'gather', 'stay', 'continue', 'focus', 'handle', 'develop', 'sell',
    'discover', 'lead', 'serve', 'deliver', 'work', 'earn', 'guide'
  ]);

  const adjectiveWords = new Set([
    'common', 'valuable', 'useful', 'positive', 'ready', 'difficult', 'married'
  ]);

  const elements = {
    heroKicker: document.getElementById('hero-kicker'),
    heroTitle: document.getElementById('hero-title'),
    heroSubtitle: document.getElementById('hero-subtitle'),
    heroImage: document.getElementById('hero-image'),
    statTotal: document.getElementById('stat-total'),
    statVisible: document.getElementById('stat-visible'),
    statKnown: document.getElementById('stat-known'),
    statFavorites: document.getElementById('stat-favorites'),
    searchInput: document.getElementById('search-input'),
    filterChips: document.getElementById('filter-chips'),
    modeTabs: document.querySelectorAll('[data-mode]'),
    unitRail: document.getElementById('unit-rail'),
    libraryTitle: document.getElementById('library-title'),
    librarySubtitle: document.getElementById('library-subtitle'),
    grid: document.getElementById('card-grid'),
    detail: document.getElementById('detail-panel'),
    flash: document.getElementById('flash-panel'),
    quiz: document.getElementById('quiz-panel'),
    spell: document.getElementById('spell-panel'),
    shuffleVisibleBtn: document.getElementById('shuffle-visible-btn'),
    clearSearchBtn: document.getElementById('clear-search-btn')
  };

  const units = raw.units.map((unit, index) => {
    const accent = palette[index % palette.length];
    const cards = unit.words.map((word, wordIndex) => ({
      id: word.id || 'unit-' + unit.number + '-word-' + (wordIndex + 1),
      unitId: unit.id,
      unitNumber: unit.number,
      unitTitle: unit.title,
      unitTitleZh: unit.titleZh,
      accent,
      word: word.word,
      translation: word.translation,
      example: exampleFor(word.word, unit.title),
      pronunciation: pronunciationFor(word.word),
      cardImage: word.cardImage || '',
      coverImage: unit.coverImage
    }));

    return {
      id: unit.id,
      number: unit.number,
      title: unit.title,
      titleZh: unit.titleZh,
      coverImage: unit.coverImage,
      accent,
      cards
    };
  });

  const allCards = units.flatMap((unit) => unit.cards);
  const byId = new Map(allCards.map((card) => [card.id, card]));
  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  const state = {
    unitId: 'all',
    search: '',
    filter: 'all',
    mode: 'flash',
    selectedId: allCards[0] ? allCards[0].id : null,
    flip: false,
    favorites: readStoredSet('vocab-flashcards-favorites'),
    known: readStoredSet('vocab-flashcards-known'),
    quiz: null,
    spell: null
  };

  bindEvents();
  renderAll();

  function readSeedData() {
    const seed = document.getElementById('seed-data');
    if (!seed) return null;
    try {
      return JSON.parse(seed.textContent);
    } catch (error) {
      return null;
    }
  }

  function readStoredSet(key) {
    try {
      const rawValue = localStorage.getItem(key);
      return new Set(rawValue ? JSON.parse(rawValue) : []);
    } catch (error) {
      return new Set();
    }
  }

  function writeStoredSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(value)));
    } catch (error) {}
  }

  function pronunciationFor(word) {
    return pronunciationOverrides[word] || String(word).replace(/\s*\/\s*/g, ' ').replace(/\./g, '');
  }

  function exampleFor(word, unitTitle) {
    if (exampleOverrides[word]) return exampleOverrides[word];
    if (verbWords.has(word)) return 'We can ' + word + ' every day.';
    if (adjectiveWords.has(word)) return 'It is very ' + word + '.';

    const fallbackByUnit = {
      'Life Stages': 'This word is used to talk about people at different ages.',
      'A Kingdom': 'This word is part of a story world or kingdom.',
      'Forms of Address': 'This word is used when we speak to people politely.',
      'Artists and Performers': 'This word is connected to art or performance.',
      'Job Titles': 'This word names a role at work.',
      'Professionals': 'This word names a helpful professional.',
      'Services and Media': 'This word is used in service or media work.',
      'In an Office': 'This word appears often in an office setting.',
      'Sales': 'This word is useful in sales conversations.',
      'Ways to Achieve Success': 'This word helps describe the path to success.'
    };

    return fallbackByUnit[unitTitle] || ('This is a ' + word + '.');
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function splitAnswers(word) {
    return String(word)
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function pickRandom(list, exceptId) {
    const pool = exceptId ? list.filter((item) => item.id !== exceptId) : list.slice();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
    }
    return copy;
  }

  function currentUnit() {
    return state.unitId === 'all' ? null : unitById.get(state.unitId) || null;
  }

  function visibleIndexOfSelected() {
    const visible = visibleCards();
    const index = visible.findIndex((card) => card.id === state.selectedId);
    return { visible, index };
  }

  function visibleCards() {
    const searchText = normalize(state.search);
    const pool = state.unitId === 'all'
      ? allCards
      : (unitById.get(state.unitId) ? unitById.get(state.unitId).cards : []);

    return pool.filter((card) => {
      if (state.filter === 'favorites' && !state.favorites.has(card.id)) return false;
      if (state.filter === 'known' && !state.known.has(card.id)) return false;
      if (state.filter === 'learning' && state.known.has(card.id)) return false;

      if (!searchText) return true;

      return [
        card.word,
        card.translation,
        card.unitTitle,
        card.unitTitleZh
      ].some((value) => normalize(value).includes(searchText));
    });
  }

  function selectedCard() {
    const card = byId.get(state.selectedId);
    const visible = visibleCards();
    if (!visible.length) return null;
    if (card && visible.some((item) => item.id === card.id)) return card;
    if (visible[0]) {
      state.selectedId = visible[0].id;
      return visible[0];
    }
    return null;
  }

  function setSelected(id) {
    if (!byId.has(id)) return;
    state.selectedId = id;
    state.flip = false;
    state.quiz = null;
    state.spell = null;
  }

  function moveSelection(offset) {
    const { visible, index } = visibleIndexOfSelected();
    if (!visible.length) return;
    const currentIndex = index >= 0 ? index : 0;
    const nextIndex = (currentIndex + offset + visible.length) % visible.length;
    setSelected(visible[nextIndex].id);
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mode = mode;
    elements.modeTabs.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    if (mode === 'quiz' && !state.quiz) buildQuizRound();
    if (mode === 'spell' && !state.spell) buildSpellRound();
    renderPractice();
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    writeStoredSet('vocab-flashcards-favorites', state.favorites);
    renderAll();
  }

  function toggleKnown(id) {
    if (state.known.has(id)) state.known.delete(id);
    else state.known.add(id);
    writeStoredSet('vocab-flashcards-known', state.known);
    renderAll();
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      window.alert('這個瀏覽器目前不支援語音朗讀。');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(String(text || ''));
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function buildQuizRound() {
    const visible = visibleCards();
    if (!visible.length) {
      state.quiz = null;
      return;
    }

    const pool = visible.length >= 4 ? visible : allCards;
    const answer = pickRandom(pool);
    if (!answer) {
      state.quiz = null;
      return;
    }

    const options = shuffle([
      answer,
      ...shuffle(allCards.filter((card) => card.id !== answer.id)).slice(0, 3)
    ]).slice(0, 4);

    state.quiz = {
      answerId: answer.id,
      choiceId: null,
      options: options.map((item) => item.id)
    };
  }

  function buildSpellRound() {
    const visible = visibleCards();
    if (!visible.length) {
      state.spell = null;
      return;
    }

    const pool = visible;
    const answer = pickRandom(pool);
    if (!answer) {
      state.spell = null;
      return;
    }

    state.spell = {
      answerId: answer.id,
      value: '',
      result: null
    };
  }

  function bindEvents() {
    elements.searchInput.addEventListener('input', (event) => {
      state.search = event.target.value || '';
      state.quiz = null;
      state.spell = null;
      renderAll();
    });

    elements.filterChips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.filter = button.dataset.filter;
      state.quiz = null;
      state.spell = null;
      renderAll();
    });

    elements.modeTabs.forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });

    elements.shuffleVisibleBtn.addEventListener('click', () => {
      const visible = visibleCards();
      if (!visible.length) return;
      const randomCard = pickRandom(visible);
      if (!randomCard) return;
      setSelected(randomCard.id);
      renderAll();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      state.search = '';
      elements.searchInput.value = '';
      renderAll();
    });

    elements.unitRail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-unit-id]');
      if (!button) return;
      state.unitId = button.dataset.unitId;
      state.quiz = null;
      state.spell = null;
      renderAll();
    });

    elements.grid.addEventListener('click', (event) => {
      const star = event.target.closest('[data-action="favorite"]');
      const known = event.target.closest('[data-action="known"]');
      const cardButton = event.target.closest('[data-card-id]');

      if (star) {
        event.stopPropagation();
        toggleFavorite(star.dataset.id);
        return;
      }

      if (known) {
        event.stopPropagation();
        toggleKnown(known.dataset.id);
        return;
      }

      if (cardButton) {
        setSelected(cardButton.dataset.cardId);
        renderAll();
      }
    });

    elements.detail.addEventListener('click', handlePracticeClick);
    elements.flash.addEventListener('click', handlePracticeClick);
    elements.quiz.addEventListener('click', handlePracticeClick);
    elements.spell.addEventListener('click', handlePracticeClick);

    elements.spell.addEventListener('input', (event) => {
      const input = event.target.closest('[data-role="spell-input"]');
      if (!input || !state.spell) return;
      state.spell.value = input.value;
    });

    elements.spell.addEventListener('keydown', (event) => {
      const input = event.target.closest('[data-role="spell-input"]');
      if (!input || event.key !== 'Enter') return;
      event.preventDefault();

      if (state.spell && state.spell.result) {
        buildSpellRound();
        renderPractice();
        const nextInput = elements.spell.querySelector('[data-role="spell-input"]');
        if (nextInput) nextInput.focus();
      } else {
        checkSpell();
      }
    });
  }

  function handlePracticeClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) {
      const flipper = event.target.closest('[data-action="flip"]');
      if (flipper) {
        state.flip = !state.flip;
        renderPractice();
      }
      return;
    }

    const action = actionEl.dataset.action;
    const id = actionEl.dataset.id;

    if (action === 'flip') {
      state.flip = !state.flip;
      renderPractice();
      return;
    }

    if (action === 'favorite' && id) {
      toggleFavorite(id);
      return;
    }

    if (action === 'known' && id) {
      toggleKnown(id);
      return;
    }

    if (action === 'speak' && id) {
      const card = byId.get(id);
      if (card) speak(card.pronunciation || card.word);
      return;
    }

    if (action === 'random-visible') {
      const pool = visibleCards().length ? visibleCards() : allCards;
      const randomCard = pickRandom(pool);
      if (!randomCard) return;
      setSelected(randomCard.id);
      renderAll();
      return;
    }

    if (action === 'next-card') {
      moveSelection(1);
      renderAll();
      return;
    }

    if (action === 'prev-card') {
      moveSelection(-1);
      renderAll();
      return;
    }

    if (action === 'known-next' && id) {
      if (!state.known.has(id)) {
        state.known.add(id);
        writeStoredSet('vocab-flashcards-known', state.known);
      }
      moveSelection(1);
      renderAll();
      return;
    }

    if (action === 'again-next' && id) {
      if (state.known.has(id)) {
        state.known.delete(id);
        writeStoredSet('vocab-flashcards-known', state.known);
      }
      moveSelection(1);
      renderAll();
      return;
    }

    if (action === 'quiz-choice' && id) {
      if (!state.quiz || state.quiz.choiceId) return;
      state.quiz.choiceId = id;
      renderPractice();
      return;
    }

    if (action === 'quiz-next') {
      buildQuizRound();
      renderPractice();
      return;
    }

    if (action === 'spell-check') {
      checkSpell();
      return;
    }

    if (action === 'spell-next') {
      buildSpellRound();
      renderPractice();
      const input = elements.spell.querySelector('[data-role="spell-input"]');
      if (input) input.focus();
    }
  }

  function checkSpell() {
    if (!state.spell || state.spell.result) return;
    const answer = byId.get(state.spell.answerId);
    if (!answer) return;
    const answers = splitAnswers(answer.word).map(normalize);
    const value = normalize(state.spell.value);
    state.spell.result = answers.includes(value) ? 'correct' : 'wrong';
    renderPractice();
  }

  function renderAll() {
    ensureSelection();
    renderHero();
    renderFilters();
    renderUnits();
    renderGrid();
    renderPractice();
  }

  function ensureSelection() {
    const visible = visibleCards();
    if (!visible.length) return;
    if (!state.selectedId || !visible.some((card) => card.id === state.selectedId)) {
      state.selectedId = visible[0].id;
      state.flip = false;
    }
  }

  function renderHero() {
    const unit = currentUnit();
    const visible = visibleCards();

    if (unit) {
      elements.heroKicker.textContent = 'Unit ' + unit.number;
      elements.heroTitle.textContent = unit.title + ' / ' + unit.titleZh;
      elements.heroSubtitle.textContent = '這個單元共有 ' + unit.cards.length + ' 個單字。主流程是翻卡記憶、朗讀、判斷自己是否已經記住，再繼續下一張。';
      elements.heroImage.src = unit.coverImage;
      elements.heroImage.alt = unit.title;
    } else {
      elements.heroKicker.textContent = '全部單字';
      elements.heroTitle.textContent = 'Vocabulary Memory Cards';
      elements.heroSubtitle.textContent = '整合 10 個單元、156 個單字。這是一個以記憶為主的單字程式：翻卡、朗讀、標記已熟悉或待加強，讓你一直往下背。';
      elements.heroImage.src = units[0].coverImage;
      elements.heroImage.alt = 'Vocabulary units';
    }

    elements.statTotal.textContent = allCards.length + ' 張卡';
    elements.statVisible.textContent = visible.length + ' 張目前顯示';
    elements.statKnown.textContent = state.known.size + ' 張已熟悉';
    elements.statFavorites.textContent = state.favorites.size + ' 張收藏';
  }

  function renderFilters() {
    Array.from(elements.filterChips.querySelectorAll('[data-filter]')).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === state.filter);
    });
  }

  function renderUnits() {
    const items = [{
      id: 'all',
      number: 'ALL',
      title: 'All Units',
      titleZh: '全部單元',
      coverImage: units[0].coverImage,
      accent: '#5ca8ff',
      count: allCards.length
    }].concat(units.map((unit) => ({
      id: unit.id,
      number: unit.number,
      title: unit.title,
      titleZh: unit.titleZh,
      coverImage: unit.coverImage,
      accent: unit.accent,
      count: unit.cards.length
    })));

    elements.unitRail.innerHTML = items.map((unit) => {
      const active = state.unitId === unit.id ? ' is-active' : '';
      return [
        '<button class="unit-card' + active + '" type="button" data-unit-id="' + escapeHtml(unit.id) + '">',
        '<div class="unit-card__top">',
        '<span class="unit-card__badge" style="background:' + escapeHtml(unit.accent) + ';">' + escapeHtml(String(unit.number)) + '</span>',
        '<span class="unit-card__count">' + unit.count + ' 字</span>',
        '</div>',
        '<div>',
        '<h3 class="unit-card__title">' + escapeHtml(unit.title) + '</h3>',
        '<div class="unit-card__subtitle">' + escapeHtml(unit.titleZh) + '</div>',
        '</div>',
        '<div class="unit-card__thumb"><img src="' + escapeHtml(unit.coverImage) + '" alt="' + escapeHtml(unit.title) + '"></div>',
        '</button>'
      ].join('');
    }).join('');
  }

  function renderGrid() {
    const visible = visibleCards();
    const unit = currentUnit();

    elements.libraryTitle.textContent = unit
      ? 'Unit ' + unit.number + ' 記憶清單'
      : '全部記憶清單';

    elements.librarySubtitle.textContent = visible.length
      ? '目前顯示 ' + visible.length + ' 張卡。挑一張開始背，右側會用連續記憶流程帶你往下走。'
      : '目前沒有符合條件的單字，試試看切換篩選或清除搜尋。';

    if (!visible.length) {
      elements.grid.innerHTML = '<div class="panel empty-state">目前沒有符合條件的單字。</div>';
      return;
    }

    elements.grid.innerHTML = visible.map((card) => {
      const favorite = state.favorites.has(card.id);
      const known = state.known.has(card.id);
      const active = state.selectedId === card.id ? ' is-active' : '';

      return [
        '<article class="word-card' + active + '" data-card-id="' + escapeHtml(card.id) + '">',
        '<div class="word-card__top">',
        '<span class="word-card__unit"><span class="word-card__swatch" style="background:' + escapeHtml(card.accent) + ';"></span>Unit ' + card.unitNumber + '</span>',
        '<button class="word-card__star" type="button" data-action="favorite" data-id="' + escapeHtml(card.id) + '" aria-label="收藏">' + (favorite ? '★' : '☆') + '</button>',
        '</div>',
        '<h3 class="word-card__word">' + escapeHtml(card.word) + '</h3>',
        '<div class="word-card__translation">' + escapeHtml(card.translation) + '</div>',
        '<div class="word-card__bottom">',
        '<span class="word-card__tag">' + escapeHtml(card.unitTitleZh) + '</span>',
        '<button class="word-card__known" type="button" data-action="known" data-id="' + escapeHtml(card.id) + '">' + (known ? '已熟悉' : '待加強') + '</button>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderPractice() {
    renderDetail();
    renderFlash();
    renderQuiz();
    renderSpell();
  }

  function renderDetail() {
    const card = selectedCard();
    if (!card) {
      elements.detail.innerHTML = '<div class="empty-state">沒有可顯示的單字。</div>';
      return;
    }

    const favorite = state.favorites.has(card.id);
    const known = state.known.has(card.id);

    elements.detail.innerHTML = [
      '<div class="detail-card">',
      '<div class="detail-top">',
      '<div>',
      '<h3 class="detail-word">' + escapeHtml(card.word) + '</h3>',
      '<p class="panel-subtitle">Unit ' + card.unitNumber + ' / ' + escapeHtml(card.unitTitleZh) + '</p>',
      '</div>',
      '<div class="detail-meta">',
      '<span class="meta-pill">' + (favorite ? '★ 已收藏' : '☆ 可收藏') + '</span>',
      '<span class="meta-pill">' + (known ? '已熟悉' : '待加強') + '</span>',
      '</div>',
      '</div>',
      '<img class="detail-image" src="' + escapeHtml(card.cardImage) + '" alt="' + escapeHtml(card.word) + '">',
      '<div class="detail-block">',
      '<div class="detail-label">Translation</div>',
      '<div class="detail-translation">' + escapeHtml(card.translation) + '</div>',
      '</div>',
      '<div class="detail-block">',
      '<div class="detail-label">Example</div>',
      '<p class="detail-example">' + escapeHtml(card.example) + '</p>',
      '</div>',
      '<div class="detail-block">',
      '<div class="detail-label">Pronunciation</div>',
      '<p class="detail-pronunciation"><strong>' + escapeHtml(card.pronunciation) + '</strong></p>',
      '</div>',
      '<div class="detail-actions">',
      '<button class="action-button is-accent" type="button" data-action="speak" data-id="' + escapeHtml(card.id) + '">發音</button>',
      '<button class="action-button is-soft" type="button" data-action="favorite" data-id="' + escapeHtml(card.id) + '">' + (favorite ? '取消收藏' : '加入收藏') + '</button>',
      '<button class="action-button is-soft" type="button" data-action="known" data-id="' + escapeHtml(card.id) + '">' + (known ? '標記待加強' : '標記已熟悉') + '</button>',
      '</div>',
      '</div>'
    ].join('');
  }

  function renderFlash() {
    const card = selectedCard();
    if (!card) {
      elements.flash.innerHTML = '<div class="empty-state">沒有可顯示的單字。</div>';
      return;
    }

    const { visible, index } = visibleIndexOfSelected();
    const current = index >= 0 ? index + 1 : 1;
    const total = visible.length || 1;
    const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
    const known = state.known.has(card.id);

    elements.flash.innerHTML = [
      '<h3>記憶卡流程</h3>',
      '<p class="panel-subtitle">先看正面想答案，再翻到背面確認。最後決定這張要標記已熟悉，還是再看一次。</p>',
      '<div class="memory-progress">',
      '<div class="memory-progress__meta"><span>第 ' + current + ' / ' + total + ' 張</span><span>' + percent + '%</span></div>',
      '<div class="memory-progress__bar"><div class="memory-progress__fill" style="width:' + percent + '%;"></div></div>',
      '</div>',
      '<div class="practice-actions">',
      '<button class="action-button is-soft" type="button" data-action="prev-card">上一張</button>',
      '<button class="action-button is-accent" type="button" data-action="flip">翻面</button>',
      '<button class="action-button is-soft" type="button" data-action="speak" data-id="' + escapeHtml(card.id) + '">朗讀</button>',
      '<button class="action-button is-soft" type="button" data-action="next-card">下一張</button>',
      '</div>',
      '<div class="flashcard">',
      '<div class="flashcard-shell' + (state.flip ? ' is-flipped' : '') + '" data-action="flip">',
      '<div class="flashcard-shell__inner">',
      '<section class="flashcard-side">',
      '<span class="flashcard-label">Front</span>',
      '<div class="flashcard-word">',
      '<p>' + escapeHtml(card.unitTitleZh) + '</p>',
      '<h4>' + escapeHtml(card.word) + '</h4>',
      '<p>點一下翻到背面</p>',
      '</div>',
      '</section>',
      '<section class="flashcard-side flashcard-side--back">',
      '<span class="flashcard-label">Back</span>',
      '<div class="flashcard-back">',
      '<img class="flashcard-back__image" src="' + escapeHtml(card.cardImage) + '" alt="' + escapeHtml(card.word) + '">',
      '<div class="flashcard-back__translation">' + escapeHtml(card.translation) + '</div>',
      '<p class="flashcard-back__example">' + escapeHtml(card.example) + '</p>',
      '<p class="flashcard-back__pronunciation">Pronunciation: <strong>' + escapeHtml(card.pronunciation) + '</strong></p>',
      '</div>',
      '</section>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="practice-actions">',
      '<button class="action-button is-soft" type="button" data-action="again-next" data-id="' + escapeHtml(card.id) + '">' + (known ? '改成待加強並下一張' : '再看一次並下一張') + '</button>',
      '<button class="action-button is-accent" type="button" data-action="known-next" data-id="' + escapeHtml(card.id) + '">' + (known ? '保持已熟悉並下一張' : '已經記住並下一張') + '</button>',
      '<button class="action-button is-soft" type="button" data-action="random-visible">隨機抽背</button>',
      '</div>'
    ].join('');
  }

  function renderQuiz() {
    if (!state.quiz) buildQuizRound();
    if (!state.quiz) {
      elements.quiz.innerHTML = '<div class="empty-state">沒有足夠的單字可出題。</div>';
      return;
    }

    const answer = byId.get(state.quiz.answerId);
    const choiceId = state.quiz.choiceId;
    const feedback = choiceId
      ? (choiceId === state.quiz.answerId
        ? '答對了，這張圖對應的單字是 ' + answer.word + '。'
        : '這題答案是 ' + answer.word + '，可以再聽一次發音。')
      : '請從下方選出正確的英文單字。';

    elements.quiz.innerHTML = [
      '<h3>選擇題</h3>',
      '<p class="panel-subtitle">先看圖片和中文，再選正確英文。</p>',
      '<div class="quiz-card">',
      '<img class="quiz-media" src="' + escapeHtml(answer.cardImage) + '" alt="' + escapeHtml(answer.word) + '">',
      '<p class="quiz-prompt">請選出符合 <strong>' + escapeHtml(answer.translation) + '</strong> 的英文單字。</p>',
      '<div class="quiz-options">',
      state.quiz.options.map((id) => {
        const option = byId.get(id);
        const className = choiceId
          ? (id === state.quiz.answerId ? 'choice-button is-correct' : (id === choiceId ? 'choice-button is-wrong' : 'choice-button'))
          : 'choice-button';

        return [
          '<button class="' + className + '" type="button" data-action="quiz-choice" data-id="' + escapeHtml(id) + '">',
          '<strong>' + escapeHtml(option.word) + '</strong>',
          '<small>' + escapeHtml(option.unitTitleZh) + '</small>',
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '<div class="feedback">' + escapeHtml(feedback) + '</div>',
      '<div class="practice-actions">',
      '<button class="action-button is-soft" type="button" data-action="speak" data-id="' + escapeHtml(answer.id) + '">朗讀答案</button>',
      '<button class="action-button is-accent" type="button" data-action="quiz-next">' + (choiceId ? '下一題' : '換題目') + '</button>',
      '</div>',
      '</div>'
    ].join('');
  }

  function renderSpell() {
    if (!state.spell) buildSpellRound();
    if (!state.spell) {
      elements.spell.innerHTML = '<div class="empty-state">沒有可練習的單字。</div>';
      return;
    }

    const answer = byId.get(state.spell.answerId);
    const result = state.spell.result;
    const feedback = result === 'correct'
      ? '答對了，答案是 ' + answer.word + '。'
      : (result === 'wrong'
        ? '這次答案是 ' + answer.word + '。再拼一次就會更穩。'
        : '請根據圖片與中文輸入英文單字。');

    elements.spell.innerHTML = [
      '<h3>拼字練習</h3>',
      '<p class="panel-subtitle">看到圖片和中文後，自己拼出英文單字。</p>',
      '<div class="spell-card">',
      '<img class="spell-media" src="' + escapeHtml(answer.cardImage) + '" alt="' + escapeHtml(answer.word) + '">',
      '<p class="spell-prompt">請輸入 <strong>' + escapeHtml(answer.translation) + '</strong> 的英文單字。</p>',
      '<p class="spell-prompt">' + escapeHtml(answer.example) + '</p>',
      '<label class="sr-only" for="spell-input">輸入英文單字</label>',
      '<input id="spell-input" class="spell-input" data-role="spell-input" type="text" autocomplete="off" spellcheck="false" value="' + escapeHtml(state.spell.value) + '" placeholder="Type the word here">',
      '<div class="feedback">' + escapeHtml(feedback) + '</div>',
      '<div class="practice-actions">',
      '<button class="action-button is-soft" type="button" data-action="speak" data-id="' + escapeHtml(answer.id) + '">朗讀提示</button>',
      '<button class="action-button is-soft" type="button" data-action="spell-check">檢查</button>',
      '<button class="action-button is-accent" type="button" data-action="spell-next">' + (result ? '下一題' : '換一題') + '</button>',
      '</div>',
      '</div>'
    ].join('');
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
