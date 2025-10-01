export class WordSearchGame {
  constructor() {
    this.grid = [];
    this.displayWords = [
      'ROV SYSTEMS',
      'UMBILICAL',
      'MOBILE ROBOTICS',
      'CLAMP CONNECTOR',
      'SUBSEA INSPECTION',
      'ROTATOR VALVE',
      'CNAV ANTENNA',
      'WELL INTERVENTION',
      'OCEAN EVOLUTION',
      'PIPELINE REPAIR',
    ];
    this.words = [
      'ROVSYSTEMS',
      'UMBILICAL',
      'MOBILEROBOTICS',
      'CLAMPCONNECTOR',
      'SUBSEAINSPECTION',
      'ROTATORVALVE',
      'CNAVANTENNA',
      'WELLINTERVENTION',
      'OCEANEVOLUTION',
      'PIPELINEREPAIR',
    ];
    this.gridSize = this.calculateOptimalGridSize();
    this.placedWords = [];
    this.foundWords = new Set();
    this.isSelecting = false;
    this.selectedCells = [];
    this.startTime = null;
    this.endTime = null;

    this.initializeGrid();
    this.placeWords();
    this.fillEmptySpaces();
  }

  calculateOptimalGridSize() {
    // Find the longest word
    const longestWordLength = Math.max(...this.words.map(word => word.length));
    
    // Calculate minimum grid size needed
    // We need at least the length of the longest word
    // Add some buffer for better word placement (minimum 12x12, maximum 20x20)
    const minSize = Math.max(12, longestWordLength + 2);
    const maxSize = 20;
    
    // For more words, we need a larger grid
    const wordCountFactor = Math.ceil(Math.sqrt(this.words.length * 2));
    
    return Math.min(maxSize, Math.max(minSize, wordCountFactor + longestWordLength));
  }

  initializeGrid() {
    this.grid = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(''));
  }

  placeWords() {
    this.placedWords = [];
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [-1, 1], // diagonal up-right
      [0, -1], // horizontal backwards
      [-1, 0], // vertical backwards
      [-1, -1], // diagonal up-left
      [1, -1], // diagonal down-left
    ];

    for (const word of this.words) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * this.gridSize);
        const startCol = Math.floor(Math.random() * this.gridSize);

        if (this.canPlaceWord(word, startRow, startCol, direction)) {
          this.placeWord(word, startRow, startCol, direction);
          placed = true;
        }
        attempts++;
      }
    }
  }

  canPlaceWord(word, row, col, direction) {
    const [dRow, dCol] = direction;

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;

      if (
        newRow < 0 ||
        newRow >= this.gridSize ||
        newCol < 0 ||
        newCol >= this.gridSize
      ) {
        return false;
      }

      if (
        this.grid[newRow][newCol] !== '' &&
        this.grid[newRow][newCol] !== word[i]
      ) {
        return false;
      }
    }
    return true;
  }

  placeWord(word, row, col, direction) {
    const [dRow, dCol] = direction;
    const positions = [];

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      this.grid[newRow][newCol] = word[i];
      positions.push([newRow, newCol]);
    }

    this.placedWords.push({
      word,
      positions,
      found: false,
    });
  }

  fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === '') {
          this.grid[row][col] =
            letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  startSelection(row, col) {
    this.isSelecting = true;
    this.selectedCells = [[row, col]];
    if (!this.startTime) {
      this.startTime = Date.now();
    }
  }

  updateSelection(row, col) {
    if (!this.isSelecting) return;

    const start = this.selectedCells[0];
    const cells = this.getLineCells(start[0], start[1], row, col);
    this.selectedCells = cells;
  }

  endSelection() {
    if (!this.isSelecting || this.selectedCells.length === 0) {
      this.isSelecting = false;
      this.selectedCells = [];
      return null;
    }

    this.isSelecting = false;
    const selectedWord = this.getSelectedWord();
    const foundWord = this.checkWord(selectedWord);

    if (!foundWord) {
      this.selectedCells = [];
    }

    return foundWord;
  }

  getLineCells(startRow, startCol, endRow, endCol) {
    const dRow = endRow - startRow;
    const dCol = endCol - startCol;

    // Horizontal
    if (dRow === 0 && dCol !== 0) {
      const step = dCol > 0 ? 1 : -1;
      return Array.from({ length: Math.abs(dCol) + 1 }, (_, i) => [
        startRow,
        startCol + i * step,
      ]);
    }
    // Vertical
    if (dCol === 0 && dRow !== 0) {
      const step = dRow > 0 ? 1 : -1;
      return Array.from({ length: Math.abs(dRow) + 1 }, (_, i) => [
        startRow + i * step,
        startCol,
      ]);
    }
    // Diagonal
    if (Math.abs(dRow) === Math.abs(dCol) && dRow !== 0) {
      const stepRow = dRow > 0 ? 1 : -1;
      const stepCol = dCol > 0 ? 1 : -1;
      return Array.from({ length: Math.abs(dRow) + 1 }, (_, i) => [
        startRow + i * stepRow,
        startCol + i * stepCol,
      ]);
    }
    // Not a straight line: only select the starting cell
    return [[startRow, startCol]];
  }

  getSelectedWord() {
    return this.selectedCells.map(([row, col]) => this.grid[row][col]).join('');
  }

  checkWord(selectedWord) {
    const reversedWord = selectedWord.split('').reverse().join('');

    for (const placedWord of this.placedWords) {
      if (
        !placedWord.found &&
        (placedWord.word === selectedWord || placedWord.word === reversedWord)
      ) {
        placedWord.found = true;
        this.foundWords.add(placedWord.word);

        if (this.foundWords.size === this.words.length) {
          this.endTime = Date.now();
        }

        return placedWord;
      }
    }

    return null;
  }

  getGameTime() {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  isGameComplete() {
    return this.foundWords.size === this.words.length;
  }

  reset() {
    this.grid = [];
    this.placedWords = [];
    this.foundWords = new Set();
    this.isSelecting = false;
    this.selectedCells = [];
    this.startTime = null;
    this.endTime = null;

    this.initializeGrid();
    this.placeWords();
    this.fillEmptySpaces();
  }
}
