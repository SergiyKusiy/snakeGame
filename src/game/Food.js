import * as PIXI from 'pixi.js';
import {
  CELL_SIZE,
  FIELD_SIZE,
} from '../constants/gameConfig.js';

export class Food {
  constructor(app) {
    this.app = app;

    this.position = {
      x: 0,
      y: 0,
    };

    this.graphics = new PIXI.Graphics();

    this.app.stage.addChild(this.graphics);

    this.spawn();
  }

  spawn(snakeSegments = []) {
    let validPosition = false;

    while (!validPosition) {
      const newPosition = {
        x: Math.floor(Math.random() * FIELD_SIZE),
        y: Math.floor(Math.random() * FIELD_SIZE),
      };

      const onSnake = snakeSegments.some(segment =>
        segment.x === newPosition.x &&
        segment.y === newPosition.y
      );

      if (!onSnake) {
        this.position = newPosition;
        validPosition = true;
      }
    }
  }

  draw() {
    this.graphics.clear();

    this.graphics
      .circle(
        this.position.x * CELL_SIZE + CELL_SIZE / 2,
        this.position.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3
      )
      .fill('#ffcc00');
  }
}