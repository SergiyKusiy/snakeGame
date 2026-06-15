import * as PIXI from 'pixi.js';
import {
  APP_WIDTH,
  APP_HEIGHT,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  FIELD_SIZE,
  CELL_SIZE,
} from '../constants/gameConfig.js';

import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { Wall } from './Wall.js';
import { InputManager } from '../managers/InputManager.js';

export class Game {
  constructor() {
    this.app = null;
    this.snake = null;
    this.food = null;
    this.food2 = null;
    this.walls = [];
    this.inputManager = null;
    this.gameLoop = null;
    this.score = 0;
    this.currentScoreElement = null;
    this.bestScoreElement = null;
    this.gameState = 'menu';
    this.menuButtons = null;
    this.gameButtons = null;
    this.gameMode = 'classic';
    this.currentInterval = 300;
  }

  async init() {
    this.app = new PIXI.Application();

    await this.app.init({
      width: APP_WIDTH,
      height: APP_HEIGHT,
      background: '#555555',
    });

    const container = document.getElementById('pixi-canvas-container');
    container.appendChild(this.app.canvas);

    this.currentScoreElement = document.getElementById('current-score');
    this.bestScoreElement = document.getElementById('best-score');
    this.menuButtons = document.getElementById('menu-buttons');
    this.gameButtons = document.getElementById('game-buttons');

    document.getElementById('btn-play').addEventListener('click', () => this.startGame());
    document.getElementById('btn-menu').addEventListener('click', () => this.goToMenu());
    document.getElementById('btn-exit').addEventListener('click', () => this.showExitOverlay());
    document.getElementById('btn-reopen').addEventListener('click', () => this.hideExitOverlay());

    this.drawField();
    this.updateScoreUI();
    this.showMenu();

    document.getElementById('btn-gameover-menu').addEventListener('click', () => {
      document.getElementById('gameover-overlay').classList.add('hidden');
      this.goToMenu();
    });
  }

  showMenu() {
    this.gameState = 'menu';
    this.menuButtons.classList.remove('hidden');
    this.gameButtons.classList.add('hidden');
  }

  startGame() {
    const selected = document.querySelector('input[name="gameMode"]:checked');
    this.gameMode = selected ? selected.value : 'classic';

    this.gameState = 'playing';
    this.menuButtons.classList.add('hidden');
    this.gameButtons.classList.remove('hidden');

    this.score = 0;
    this.updateScoreUI();

    if (this.inputManager) this.inputManager.destroy();
    if (this.snake) this.snake.graphics.destroy();
    if (this.food) this.food.graphics.destroy();
    if (this.food2) {
      this.food2.graphics.destroy();
      this.food2 = null;
    }
    if (this.walls.length) {
      this.walls.forEach(w => w.graphics.destroy());
      this.walls = [];
    }

    this.snake = new Snake(this.app);
    this.inputManager = new InputManager(this.snake);
    this.food = new Food(this.app);
    this.food.draw();

    if (this.gameMode === 'portal') {
      this.food2 = new Food(this.app);
      this.food2.spawn(this.snake.segments);
      this.food2.draw();
    }

    this.snake.draw();
    this.startGameLoop();
  }

  goToMenu() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    this.showMenu();
  }

  showExitOverlay() {
    document.getElementById('exit-overlay').classList.remove('hidden');
  }

  hideExitOverlay() {
    document.getElementById('exit-overlay').classList.add('hidden');
  }

  startGameLoop() {
    this.currentInterval = 300;

    const tick = () => {
      this.snake.move();
      this.handleEating();
      this.handleCollision();
      this.snake.draw();
      if (this.gameMode === 'walls') {
        this.walls.forEach(w => w.draw());
      }
    };

    this.gameLoop = setInterval(tick, this.currentInterval);
  }

  handleEating() {
    if (this.gameMode === 'portal') {
      this.handlePortalEating();
      return;
    }

    if (!this.snake.eat(this.food)) return;

    this.score++;
    this.updateBestScore();
    this.updateScoreUI();
    this.snake.grow();

    if (this.gameMode === 'walls') {
      this.food.spawn(this.snake.segments);
      this.food.draw();
      this.spawnWall();
    } else if (this.gameMode === 'speed') {
      this.food.spawn(this.snake.segments);
      this.food.draw();
      this.speedUp();
    } else {
      this.food.spawn(this.snake.segments);
      this.food.draw();
    }
  }

  handlePortalEating() {
    const ateFirst = this.snake.eat(this.food);
    const ateSecond = this.food2 && this.snake.eat(this.food2);

    if (!ateFirst && !ateSecond) return;

    this.score++;
    this.updateBestScore();
    this.updateScoreUI();

    const teleportTarget = ateFirst ? this.food2 : this.food;
    if (teleportTarget) {
      this.snake.teleport(teleportTarget.position);
    }

    this.food.spawn(this.snake.segments);
    this.food.draw();
    this.food2.spawn(this.snake.segments);
    this.food2.draw();
  }

  handleCollision() {
    if (this.gameMode === 'nodie') {
      this.snake.wrapAround();
      return;
    }

    if (this.gameMode === 'walls') {
      if (
        this.snake.checkWallCollision() ||
        this.snake.checkSelfCollision() ||
        this.checkWallModeCollision()
      ) {
        this.gameOver();
      }
      return;
    }

    if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
      this.gameOver();
    }
  }

  gameOver() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    document.getElementById('gameover-message').textContent = `Your score: ${this.score}`;
    document.getElementById('gameover-overlay').classList.remove('hidden');
  }

  speedUp() {
    this.currentInterval = Math.max(50, Math.floor(this.currentInterval * 0.9));
    clearInterval(this.gameLoop);

    this.gameLoop = setInterval(() => {
      this.snake.move();
      this.handleEating();
      this.handleCollision();
      this.snake.draw();
    }, this.currentInterval);
  }

  spawnWall() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * FIELD_SIZE),
        y: Math.floor(Math.random() * FIELD_SIZE),
      };
    } while (
      this.snake.segments.some(s => s.x === pos.x && s.y === pos.y) ||
      (this.food && this.food.position.x === pos.x && this.food.position.y === pos.y) ||
      this.walls.some(w => w.position.x === pos.x && w.position.y === pos.y)
    );

    const wall = new Wall(this.app, pos);
    wall.draw();
    this.walls.push(wall);
  }

  checkWallModeCollision() {
    const head = this.snake.segments[0];
    return this.walls.some(w => w.position.x === head.x && w.position.y === head.y);
  }

  loadBestScore() {
    return Number(localStorage.getItem('bestScore')) || 0;
  }

  updateBestScore() {
    if (this.score > this.loadBestScore()) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  updateScoreUI() {
    this.currentScoreElement.textContent = this.score;
    this.bestScoreElement.textContent = this.loadBestScore();
  }

  drawField() {
    const field = new PIXI.Graphics();
    field.rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).fill('#555555');
    this.app.stage.addChild(field);
  }
}