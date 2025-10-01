import './style.css'
import { WordSearchGame } from './game/WordSearchGame.js'
import { UIManager } from './ui/UIManager.js'

// Initialize the game
const game = new WordSearchGame();
const ui = new UIManager(game);

// Start the application
ui.init();