(() => {
  const WORDS = [
    'about','adore','agent','apple','baker','beach','blend','brain','candy','chair','charm','clean','clock','cloud','crane','dream',
    'eager','earth','flame','fresh','frost','grape','green','heart','house','jolly','light','lucky','magic','maple','metal','night',
    'ocean','paint','pearl','piano','pilot','plain','plane','point','pride','queen','quick','radio','river','rough','round','scale',
    'score','shine','smart','smile','snack','sound','spark','spice','spoon','stone','storm','table','tiger','toast','trace','train',
    'unity','vivid','water','whale','wheat','world','youth','zesty'
  ];

  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;
  const keyboardRows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
  ];

  const boardEl = document.getElementById('board');
  const keyboardEl = document.getElementById('keyboard');
  const statusEl = document.getElementById('game-status');
  const newGameBtn = document.getElementById('new-game-btn');
  if (!boardEl || !keyboardEl || !statusEl || !newGameBtn) return;

  let solution = '';
  let currentRow = 0;
  let currentGuess = '';
  let guesses = [];
  let finished = false;
  const keyStates = {};

  function pickDailyWord() {
    const now = new Date();
    const daySeed = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
    return WORDS[daySeed % WORDS.length];
  }

  function pickRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
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
    keyboardRows.forEach((rowKeys) => {
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
      const guess = guesses[r] || (r === currentRow ? currentGuess : '');
      for (let c = 0; c < WORD_LENGTH; c += 1) {
        const tile = rowEl.children[c];
        tile.textContent = guess[c] ? guess[c].toUpperCase() : '';
      }
    }
  }

  function evaluateGuess(guess) {
    const result = Array(WORD_LENGTH).fill('absent');
    const remaining = solution.split('');

    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (guess[i] === solution[i]) {
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

  function updateKeyState(letter, state) {
    const priority = { absent: 0, present: 1, correct: 2 };
    const current = keyStates[letter] || 'absent';
    if (!keyStates[letter] || priority[state] > priority[current]) keyStates[letter] = state;
  }

  function refreshKeyboardStates() {
    keyboardEl.querySelectorAll('.wordle-key').forEach((btn) => {
      const key = btn.dataset.key;
      if (!/^[A-Z]$/.test(key)) return;
      const state = keyStates[key.toLowerCase()];
      btn.classList.remove('correct', 'present', 'absent');
      if (state) btn.classList.add(state);
    });
  }

  function applyRowFeedback(rowIndex, states) {
    const rowEl = boardEl.children[rowIndex];
    const guess = guesses[rowIndex];
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      const tile = rowEl.children[i];
      tile.classList.remove('correct', 'present', 'absent');
      tile.classList.add(states[i]);
      updateKeyState(guess[i], states[i]);
    }
    refreshKeyboardStates();
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function finish(win) {
    finished = true;
    setStatus(win ? 'Nice! You solved it. Click New Game to play again.' : `Out of tries. The word was ${solution.toUpperCase()}.`);
  }

  function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
      setStatus('Enter a 5-letter word.');
      return;
    }

    if (!WORDS.includes(currentGuess)) {
      setStatus('Word not in list. Try another.');
      return;
    }

    guesses[currentRow] = currentGuess;
    const states = evaluateGuess(currentGuess);
    applyRowFeedback(currentRow, states);

    if (currentGuess === solution) {
      updateBoard();
      finish(true);
      return;
    }

    currentRow += 1;
    currentGuess = '';
    updateBoard();

    if (currentRow >= MAX_GUESSES) {
      finish(false);
    } else {
      setStatus(`${MAX_GUESSES - currentRow} tries left.`);
    }
  }

  function onKey(rawKey) {
    if (finished) return;
    const key = rawKey.toUpperCase();

    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === 'BACKSPACE' || key === '⌫') {
      currentGuess = currentGuess.slice(0, -1);
      updateBoard();
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      currentGuess += key.toLowerCase();
      updateBoard();
    }
  }

  function handlePhysicalKeyboard(e) {
    const key = e.key;
    if (key === 'Enter') {
      e.preventDefault();
      onKey('ENTER');
      return;
    }
    if (key === 'Backspace') {
      e.preventDefault();
      onKey('BACKSPACE');
      return;
    }
    if (/^[a-zA-Z]$/.test(key)) {
      onKey(key);
    }
  }

  function resetGame(random = false) {
    solution = random ? pickRandomWord() : pickDailyWord();
    currentRow = 0;
    currentGuess = '';
    guesses = [];
    finished = false;
    Object.keys(keyStates).forEach((k) => delete keyStates[k]);
    initBoard();
    renderKeyboard();
    updateBoard();
    setStatus('New game started. Good luck!');
  }

  document.addEventListener('keydown', handlePhysicalKeyboard);
  newGameBtn.addEventListener('click', () => resetGame(true));

  resetGame(false);
})();
