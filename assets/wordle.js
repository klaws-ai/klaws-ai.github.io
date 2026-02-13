(() => {
  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;
  const EPOCH_DAY = Math.floor(Date.UTC(2021, 5, 19) / 86400000);

  const I18N = {
    en: {
      rules: 'Guess the 5-letter word in 6 tries. Green = correct spot, yellow = in word wrong spot, red = not in word.',
      loading: 'Loading dictionary…',
      startDaily: 'Daily game loaded. Good luck!',
      startRandom: 'Random game loaded. Good luck!',
      invalidLength: 'Enter a 5-letter word.',
      notAllowed: 'Word not in list.',
      triesLeft: (n) => `${n} ${n === 1 ? 'try' : 'tries'} left.`,
      win: (n) => `Great! Solved in ${n} ${n === 1 ? 'guess' : 'guesses'}.`,
      lose: (w) => `Out of tries. The word was ${w.toUpperCase()}.`,
      loadError: 'Could not load word lists. Please refresh.',
      keyboard: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
      ]
    },
    de: {
      rules: 'Errate das Wort mit 5 Buchstaben in 6 Versuchen. Grün = richtige Position, Gelb = im Wort aber falsche Position, Rot = nicht im Wort.',
      loading: 'Wörterbuch wird geladen…',
      startDaily: 'Tagesspiel geladen. Viel Erfolg!',
      startRandom: 'Zufallsspiel geladen. Viel Erfolg!',
      invalidLength: 'Bitte ein Wort mit 5 Buchstaben eingeben.',
      notAllowed: 'Wort nicht in der Liste.',
      triesLeft: (n) => `${n} ${n === 1 ? 'Versuch' : 'Versuche'} übrig.`,
      win: (n) => `Stark! In ${n} ${n === 1 ? 'Versuch' : 'Versuchen'} gelöst.`,
      lose: (w) => `Keine Versuche mehr. Lösung: ${w.toUpperCase()}.`,
      loadError: 'Wortlisten konnten nicht geladen werden. Bitte neu laden.',
      keyboard: [
        ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
      ]
    }
  };

  const boardEl = document.getElementById('board');
  const keyboardEl = document.getElementById('keyboard');
  const statusEl = document.getElementById('game-status');
  const rulesTextEl = document.getElementById('rules-text');
  const langSelectEl = document.getElementById('language-select');
  const newGameBtn = document.getElementById('new-game-btn');
  const dailyGameBtn = document.getElementById('daily-game-btn');

  if (!boardEl || !keyboardEl || !statusEl || !rulesTextEl || !langSelectEl || !newGameBtn || !dailyGameBtn) return;

  const state = {
    lang: 'en',
    answers: [],
    allowed: new Set(),
    solution: '',
    currentRow: 0,
    currentGuess: '',
    guesses: [],
    evaluations: [],
    finished: false,
    keyStates: {}
  };

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function dayIndex() {
    const today = Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) / 86400000);
    return today - EPOCH_DAY;
  }

  function pickDailyWord() {
    return state.answers[((dayIndex() % state.answers.length) + state.answers.length) % state.answers.length];
  }

  function pickRandomWord() {
    return state.answers[Math.floor(Math.random() * state.answers.length)];
  }

  async function loadWordData(lang) {
    const [answersRes, allowedRes] = await Promise.all([
      fetch(`./assets/wordle-data/${lang}.answers.json`, { cache: 'no-store' }),
      fetch(`./assets/wordle-data/${lang}.allowed.json`, { cache: 'no-store' })
    ]);
    if (!answersRes.ok || !allowedRes.ok) throw new Error('word data fetch failed');

    const [answers, allowed] = await Promise.all([answersRes.json(), allowedRes.json()]);
    state.answers = answers;
    state.allowed = new Set(allowed);
  }

  function initBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < MAX_GUESSES; r += 1) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      for (let c = 0; c < WORD_LENGTH; c += 1) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  function renderKeyboard() {
    keyboardEl.innerHTML = '';
    I18N[state.lang].keyboard.forEach((rowKeys) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'wordle-kb-row';
      rowKeys.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wordle-key';
        btn.dataset.key = key;
        btn.textContent = key === 'BACKSPACE' ? '⌫' : key;
        if (key === 'ENTER' || key === 'BACKSPACE') btn.classList.add('wordle-key-wide');
        btn.addEventListener('click', () => onKey(key));
        rowEl.appendChild(btn);
      });
      keyboardEl.appendChild(rowEl);
    });
  }

  function updateBoard() {
    for (let r = 0; r < MAX_GUESSES; r += 1) {
      const rowEl = boardEl.children[r];
      const guess = state.guesses[r] || (r === state.currentRow ? state.currentGuess : '');
      const result = state.evaluations[r];
      rowEl.classList.toggle('active', !state.finished && r === state.currentRow);

      for (let c = 0; c < WORD_LENGTH; c += 1) {
        const tile = rowEl.children[c];
        tile.textContent = guess[c] ? guess[c].toUpperCase() : '';
        tile.classList.remove('correct', 'present', 'absent');
        if (result && result[c]) tile.classList.add(result[c]);
      }
    }
  }

  // Faithful duplicate handling: score greens first, then yellows from remaining counts.
  function evaluateGuess(guess) {
    const result = Array(WORD_LENGTH).fill('absent');
    const remaining = state.solution.split('');

    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (guess[i] === state.solution[i]) {
        result[i] = 'correct';
        remaining[i] = null;
      }
    }

    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (result[i] === 'correct') continue;
      const idx = remaining.indexOf(guess[i]);
      if (idx !== -1) {
        result[i] = 'present';
        remaining[idx] = null;
      }
    }

    return result;
  }

  function updateKeyState(letter, value) {
    const rank = { absent: 0, present: 1, correct: 2 };
    const prev = state.keyStates[letter];
    if (!prev || rank[value] > rank[prev]) state.keyStates[letter] = value;
  }

  function refreshKeyboardState() {
    keyboardEl.querySelectorAll('.wordle-key').forEach((btn) => {
      const key = btn.dataset.key;
      if (!/^[A-Z]$/.test(key)) return;
      const v = state.keyStates[key.toLowerCase()];
      btn.classList.remove('correct', 'present', 'absent');
      if (v) btn.classList.add(v);
    });
  }

  function applyGuessResult(rowIndex, result) {
    const guess = state.guesses[rowIndex];
    for (let i = 0; i < WORD_LENGTH; i += 1) updateKeyState(guess[i], result[i]);
    refreshKeyboardState();
    updateBoard();
  }

  function resetRound(useRandom = false) {
    state.currentRow = 0;
    state.currentGuess = '';
    state.guesses = [];
    state.evaluations = [];
    state.finished = false;
    state.keyStates = {};
    state.solution = useRandom ? pickRandomWord() : pickDailyWord();

    initBoard();
    renderKeyboard();
    updateBoard();
    setStatus(useRandom ? I18N[state.lang].startRandom : I18N[state.lang].startDaily);
  }

  function submitGuess() {
    if (state.finished || state.currentRow >= MAX_GUESSES) return;

    const guess = state.currentGuess;
    if (guess.length !== WORD_LENGTH) {
      setStatus(I18N[state.lang].invalidLength);
      return;
    }

    const isAllowedGuess = state.allowed.has(guess);

    state.guesses[state.currentRow] = guess;
    const result = evaluateGuess(guess);
    state.evaluations[state.currentRow] = result;
    applyGuessResult(state.currentRow, result);

    if (guess === state.solution) {
      state.finished = true;
      setStatus(I18N[state.lang].win(state.currentRow + 1));
      updateBoard();
      return;
    }

    state.currentRow += 1;
    state.currentGuess = '';
    updateBoard();

    if (state.currentRow >= MAX_GUESSES) {
      state.finished = true;
      setStatus(I18N[state.lang].lose(state.solution));
      return;
    }

    if (isAllowedGuess) {
      setStatus(I18N[state.lang].triesLeft(MAX_GUESSES - state.currentRow));
    } else {
      setStatus(`${I18N[state.lang].notAllowed} ${I18N[state.lang].triesLeft(MAX_GUESSES - state.currentRow)}`);
    }
  }

  function normalizePhysicalKey(raw) {
    if (raw === 'Enter') return 'ENTER';
    if (raw === 'Backspace') return 'BACKSPACE';
    if (!/^[a-zA-Z]$/.test(raw)) return null;

    // e.key is already layout-aware (e.g., German QWERTZ emits "z" for Z keypresses).
    // Do not remap Y/Z here, otherwise letters are double-swapped and validation breaks.
    return raw.toUpperCase();
  }

  function onKey(rawKey) {
    if (state.finished || state.currentRow >= MAX_GUESSES) return;
    const key = rawKey.toUpperCase();

    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === 'BACKSPACE') {
      if (state.currentGuess.length > 0) {
        state.currentGuess = state.currentGuess.slice(0, -1);
        updateBoard();
      }
      return;
    }

    if (/^[A-Z]$/.test(key) && state.currentGuess.length < WORD_LENGTH) {
      state.currentGuess += key.toLowerCase();
      updateBoard();
    }
  }

  async function switchLanguage(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    rulesTextEl.textContent = I18N[lang].rules;
    setStatus(I18N[lang].loading);

    try {
      await loadWordData(lang);
      resetRound(false);
    } catch {
      setStatus(I18N[lang].loadError);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof HTMLSelectElement) return;

    const key = normalizePhysicalKey(e.key);
    if (!key) return;
    if (key === 'ENTER' && e.repeat) return;

    e.preventDefault();
    onKey(key);
  });

  langSelectEl.addEventListener('change', () => {
    switchLanguage(langSelectEl.value);
  });

  newGameBtn.addEventListener('click', () => {
    if (!state.answers.length) return;
    resetRound(true);
  });

  dailyGameBtn.addEventListener('click', () => {
    if (!state.answers.length) return;
    resetRound(false);
  });

  switchLanguage(langSelectEl.value || 'en');
})();
