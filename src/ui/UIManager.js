export class UIManager {
  constructor(game) {
    this.game = game;
    this.currentScreen = 'game';
    this.gameContainer = null;
    this.isDragging = false;
  }

  init() {
    this.createAppStructure();
    this.showScreen('game');
    this.startGamePlay();
    this.startGameTimer();
  }

  createAppStructure() {
    document.querySelector('#app').innerHTML = `
      <div class="game-container">
        <!--<div id="home-screen" class="screen">
          <div class="home-content">
            <h1 class="game-title">
              <span class="title-word">WORD</span>
              <span class="title-search">SEARCH</span>
            </h1>
            <p class="game-subtitle">Find all hidden words in the grid!</p>
            <div class="home-features">
              <div class="feature">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">Find 8 hidden words</div>
              </div>
              <div class="feature">
                <div class="feature-icon">⏱️</div>
                <div class="feature-text">Beat your best time</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔄</div>
                <div class="feature-text">Shuffle grid anytime</div>
              </div>
            </div>
            <button id="start-game" class="btn btn-primary">
              <span>Start Game</span>
              <div class="btn-shine"></div>
            </button>
          </div>
        </div>-->

        <div id="game-screen" class="screen">
          <div class="game-header">
            <div class="game-info">
              <div class="timer">
                <span class="timer-icon">⏱️</span>
                <span id="timer-display">00:00</span>
              </div>
              <div class="progress">
                <span id="found-count">0</span>/<span id="total-count">8</span> words found
              </div>
            </div>
            <div class="game-controls">
              <button id="reset-game" class="btn btn-secondary">
                <span>Reset</span>
              </button>
              <button id="hint-btn" class="btn btn-outline">
                <span>💡 Hint</span>
              </button>
              <!-- <button id="home-btn" class="btn btn-outline">
                <span>Home</span>
              </button> -->
            </div>
          </div>
          
          <div class="game-content">
            <div class="grid-container">
              <div id="word-grid" class="word-grid"></div>
            </div>
            
            <div class="words-panel">
              <h3>Find these words:</h3>
              <div id="word-list" class="word-list"></div>
            </div>
          </div>
        </div>

        <div id="win-screen" class="screen">
          <div class="win-content">
            <div class="win-animation">
              <div class="trophy">🏆</div>
              <div class="confetti">
                <div class="confetti-piece"></div>
                <div class="confetti-piece"></div>
                <div class="confetti-piece"></div>
                <div class="confetti-piece"></div>
                <div class="confetti-piece"></div>
                <div class="confetti-piece"></div>
              </div>
            </div>
            <h1 class="win-title">Congratulations!</h1>
            <p class="win-subtitle">You found all the words!</p>
            <div class="win-stats">
              <div class="stat">
                <div class="stat-value" id="final-time">00:00</div>
                <div class="stat-label">Your Time</div>
              </div>
              <div class="stat">
                <div class="stat-value">8/8</div>
                <div class="stat-label">Words Found</div>
              </div>
            </div>
            <div class="win-actions">
              <button id="play-again" class="btn btn-primary">
                <span>Play Again</span>
                <div class="btn-shine"></div>
              </button>
              <!-- <button id="back-home" class="btn btn-outline">
                 <span>Home</span>
               </button>-->
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  startGamePlay(){
    this.showScreen('game');
    this.initializeGame();
  }

  setupEventListeners() {
    // Home screen
    // document.getElementById('start-game').addEventListener('click', () => {
    //   this.showScreen('game');
    //   this.initializeGame();
    // });

    // Game screen
    document.getElementById('reset-game').addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('hint-btn').addEventListener('click', () => {
      this.showHint();
    });

    // document.getElementById('home-btn').addEventListener('click', () => {
    //   this.showScreen('home');
    // });

    // Win screen
    document.getElementById('play-again').addEventListener('click', () => {
      this.resetGame();
      this.showScreen('game');
    });

    // document.getElementById('back-home').addEventListener('click', () => {
    //   this.showScreen('home');
    // });
  }

  showScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => screen.classList.remove('active'));

    document.getElementById(`${screenName}-screen`).classList.add('active');
    this.currentScreen = screenName;
  }

  initializeGame() {
    this.createGrid();
    this.createWordList();
    this.updateGameInfo();
  }

  createGrid() {
    const gridElement = document.getElementById('word-grid');
    gridElement.innerHTML = '';

    // Remove any existing selection sprites
    const existingSprites = document.querySelectorAll('.selection-sprite');
    existingSprites.forEach((sprite) => sprite.remove());

    for (let row = 0; row < this.game.gridSize; row++) {
      for (let col = 0; col < this.game.gridSize; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = this.game.grid[row][col];
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Mouse events
        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.startSelection(row, col);
        });

        cell.addEventListener('mouseenter', () => {
          if (this.isDragging) {
            this.updateSelection(row, col);
          }
        });

        cell.addEventListener('mouseup', () => {
          this.endSelection();
        });

        // Touch events for mobile
        cell.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.startSelection(row, col);
        });

        cell.addEventListener('touchmove', (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const element = document.elementFromPoint(
            touch.clientX,
            touch.clientY
          );
          if (element && element.classList.contains('grid-cell')) {
            const touchRow = parseInt(element.dataset.row);
            const touchCol = parseInt(element.dataset.col);
            this.updateSelection(touchRow, touchCol);
          }
        });

        cell.addEventListener('touchend', (e) => {
          e.preventDefault();
          this.endSelection();
        });

        gridElement.appendChild(cell);
      }
    }

    // Global mouse up event
    document.addEventListener('mouseup', () => {
      this.endSelection();
    });
  }

  createWordList() {
    const wordListElement = document.getElementById('word-list');
    wordListElement.innerHTML = '';

    this.game.displayWords.forEach((word) => {      
      const wordElement = document.createElement('div');
      wordElement.className = 'word-item';
      wordElement.textContent = word;
      console.log('Original word:', word);
      word = word.replace(/\s+/g, '');
      wordElement.dataset.word = word;      
      console.log('Adding word to list:', wordElement.dataset.word);
      wordListElement.appendChild(wordElement);
    });
  }

  startSelection(row, col) {
    this.isDragging = true;
    this.game.startSelection(row, col);
    this.updateGridDisplay();
  }

  updateSelection(row, col) {
    if (!this.isDragging) return;
    this.game.updateSelection(row, col);
    this.updateGridDisplay();
  }

  endSelection() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const foundWord = this.game.endSelection();

    if (foundWord) {
      this.markWordAsFound(foundWord.word);
      this.updateGameInfo();

      if (this.game.isGameComplete()) {
        setTimeout(() => {
          this.showWinScreen();
        }, 500);
      }
    }

    this.updateGridDisplay();
  }

  updateGridDisplay() {
    const cells = document.querySelectorAll('.grid-cell');

    // Remove existing selection sprites
    const existingSprites = document.querySelectorAll('.selection-sprite');
    existingSprites.forEach((sprite) => sprite.remove());

    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      // Reset classes
      cell.classList.remove('selected');
      cell.classList.remove('found');

      // Check if cell is in a found word
      for (const placedWord of this.game.placedWords) {
        if (placedWord.found) {
          for (const [wordRow, wordCol] of placedWord.positions) {
            if (wordRow === row && wordCol === col) {
              cell.classList.add('found');
            }
          }
        }
      }
    });

    // Highlight currently selected cells
    for (const [row, col] of this.game.selectedCells) {
      const cell = document.querySelector(
        `.grid-cell[data-row="${row}"][data-col="${col}"]`
      );
      if (cell) cell.classList.add('selected');
    }

    // Create sprites for all found words
    this.game.placedWords.forEach((placedWord, index) => {
      if (placedWord.found) {
        this.createFoundWordSprite(placedWord, index);
      }
    });
  }

  createFoundWordSprite(placedWord, wordIndex) {
    const gridElement = document.getElementById('word-grid');
    const gridRect = gridElement.getBoundingClientRect();

    if (placedWord.positions.length < 2) return;

    // Get positions of first and last cells
    const firstPos = placedWord.positions[0];
    const lastPos = placedWord.positions[placedWord.positions.length - 1];

    const firstCellElement = document.querySelector(
      `[data-row="${firstPos[0]}"][data-col="${firstPos[1]}"]`
    );
    const lastCellElement = document.querySelector(
      `[data-row="${lastPos[0]}"][data-col="${lastPos[1]}"]`
    );

    if (!firstCellElement || !lastCellElement) return;

    const firstRect = firstCellElement.getBoundingClientRect();
    const lastRect = lastCellElement.getBoundingClientRect();

    // Calculate center points of the first and last cells
    const x1 = firstRect.left + firstRect.width / 2 - gridRect.left;
    const y1 = firstRect.top + firstRect.height / 2 - gridRect.top;
    const x2 = lastRect.left + lastRect.width / 2 - gridRect.left;
    const y2 = lastRect.top + lastRect.height / 2 - gridRect.top;

    // Calculate length and angle for the line
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    // Create the line sprite
    const sprite = document.createElement('div');
    sprite.className = `selection-sprite word-${wordIndex}`;
    sprite.style.position = 'absolute';
    sprite.style.left = `${x1}px`;
    sprite.style.top = `${y1 - 15}px`; // Center the line vertically (adjust 10 for your cell size)
    sprite.style.width = `${length}px`; //
    sprite.style.height = `28px`; // Thickness of the highlight (adjust as needed)
    sprite.style.transform = `rotate(${angle}deg)`;
    sprite.style.transformOrigin = '0 50%';
    sprite.style.pointerEvents = 'none'; // So it doesn't block clicks

    gridElement.appendChild(sprite);
  }

  createSelectionSprite(isActive = false) {
    const gridElement = document.getElementById('word-grid');
    const gridRect = gridElement.getBoundingClientRect();

    if (this.game.selectedCells.length < 2) return;

    // Get positions of first and last selected cells
    const firstCell = this.game.selectedCells[0];
    const lastCell =
      this.game.selectedCells[this.game.selectedCells.length - 1];

    const firstCellElement = document.querySelector(
      `[data-row="${firstCell[0]}"][data-col="${firstCell[1]}"]`
    );
    const lastCellElement = document.querySelector(
      `[data-row="${lastCell[0]}"][data-col="${lastCell[1]}"]`
    );

    if (!firstCellElement || !lastCellElement) return;

    const firstRect = firstCellElement.getBoundingClientRect();
    const lastRect = lastCellElement.getBoundingClientRect();

    // Calculate sprite dimensions and position
    const minX = Math.min(firstRect.left, lastRect.left) - gridRect.left;
    const maxX = Math.max(firstRect.right, lastRect.right) - gridRect.left;
    const minY = Math.min(firstRect.top, lastRect.top) - gridRect.top;
    const maxY = Math.max(firstRect.bottom, lastRect.bottom) - gridRect.top;

    const sprite = document.createElement('div');
    sprite.className = isActive
      ? 'selection-sprite active'
      : 'selection-sprite';
    sprite.style.left = `${minX}px`;
    sprite.style.top = `${minY}px`;
    sprite.style.width = `${maxX - minX}px`;
    sprite.style.height = `${maxY - minY}px`;

    gridElement.appendChild(sprite);
  }

  markWordAsFound(word) {
    console.log('Marking word as found:', word);
    const wordElement = document.querySelector(`[data-word="${word}"]`);
    if (wordElement) {
      wordElement.classList.add('found');
    }
  }

  updateGameInfo() {
    document.getElementById('found-count').textContent =
      this.game.foundWords.size;
    document.getElementById('total-count').textContent = this.game.words.length;
    
    // Update grid CSS to handle dynamic grid size
    const gridElement = document.getElementById('word-grid');
    gridElement.style.gridTemplateColumns = `repeat(${this.game.gridSize}, 1fr)`;
    
    // Dynamically adjust max-width based on grid size
    // Larger grids need more space
    //const baseSize = 400;
    //const sizeMultiplier = this.game.gridSize / 12; // 12 is our base grid size
    //const dynamicMaxWidth = Math.min(baseSize * sizeMultiplier, 810);
    //gridElement.style.maxWidth = `min(90vw, ${dynamicMaxWidth}px)`;
  }

  startGameTimer() {
    setInterval(() => {
      if (
        this.currentScreen === 'game' &&
        this.game.startTime &&
        !this.game.endTime
      ) {
        const time = this.game.getGameTime();
        const minutes = Math.floor(time / 60)
          .toString()
          .padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        document.getElementById(
          'timer-display'
        ).textContent = `${minutes}:${seconds}`;
      }
    }, 1000);
  }

  showWinScreen() {
    const finalTime = this.game.getGameTime();
    const minutes = Math.floor(finalTime / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (finalTime % 60).toString().padStart(2, '0');
    document.getElementById('final-time').textContent = `${minutes}:${seconds}`;

    this.showScreen('win');
  }

  resetGame() {
    this.game.reset();
    if (this.currentScreen === 'game' || this.currentScreen === 'win') {
      this.initializeGame();
     //on reset game timer also become 00:00
      document.getElementById('timer-display').textContent = '00:00';
      this.updateGameInfo();
      this.updateGridDisplay();
    }
  }

  showHint() {
    // Find unfound words
    const unfoundWords = this.game.placedWords.filter(word => !word.found);
    
    if (unfoundWords.length === 0) {
      return; // All words found
    }

    // Remove any existing hint highlights
    const existingHints = document.querySelectorAll('.hint-highlight');
    existingHints.forEach(hint => hint.remove());

    // Pick a random unfound word
    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    
    // Get the first letter position
    const firstPosition = randomWord.positions[0];
    const [row, col] = firstPosition;

    // Find the cell element
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    // Create hint highlight
    const hint = document.createElement('div');
    hint.className = 'hint-highlight';
    
    // Position the hint over the cell
    const cellRect = cell.getBoundingClientRect();
    const gridRect = document.getElementById('word-grid').getBoundingClientRect();
    
    hint.style.position = 'absolute';
    hint.style.left = `${cellRect.left - gridRect.left}px`;
    hint.style.top = `${cellRect.top - gridRect.top}px`;
    hint.style.width = `${cellRect.width}px`;
    hint.style.height = `${cellRect.height}px`;
    
    document.getElementById('word-grid').appendChild(hint);

    // Remove hint after 3 seconds
    setTimeout(() => {
      hint.remove();
    }, 3000);

    // Also highlight the word in the word list temporarily
    const wordElement = document.querySelector(`[data-word="${randomWord.word}"]`);
    if (wordElement) {
      wordElement.classList.add('hint-word');
      setTimeout(() => {
        wordElement.classList.remove('hint-word');
      }, 3000);
    }
  }
}
