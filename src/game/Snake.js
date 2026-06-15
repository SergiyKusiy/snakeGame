import * as PIXI from 'pixi.js';
import { CELL_SIZE, FIELD_SIZE } from '../constants/gameConfig.js';

export class Snake {
  constructor(app) {
    this.app = app;

    this.segments = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    this.direction = {
      x: 1,
      y: 0,
    };

    this.shouldGrow = false;

    this.graphics = new PIXI.Graphics();

    this.app.stage.addChild(this.graphics);
  }

  move() {
    const head = this.segments[0];

    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    this.segments.unshift(newHead);

    if (!this.shouldGrow) {
      this.segments.pop();
    }

    this.shouldGrow = false;
  }

  draw() {
    this.graphics.clear();

    for (let i = 1; i < this.segments.length - 1; i++) {
      const segment = this.segments[i];
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      const r = CELL_SIZE / 4;

      this.graphics.roundRect(x, y, CELL_SIZE, CELL_SIZE, r).fill('#00cc44');
    }

    const tail = this.segments[this.segments.length - 1];
    const beforeTail = this.segments[this.segments.length - 2];
    const dx = tail.x - beforeTail.x;
    const dy = tail.y - beforeTail.y;

    const tx = tail.x * CELL_SIZE;
    const ty = tail.y * CELL_SIZE;
    const half = CELL_SIZE / 2;

    if (dx === 1) {
      this.graphics.poly([
        tx, ty,
        tx, ty + CELL_SIZE,
        tx + CELL_SIZE, ty + half,
      ]).fill('#00cc44');
    } else if (dx === -1) {
      this.graphics.poly([
        tx + CELL_SIZE, ty,
        tx + CELL_SIZE, ty + CELL_SIZE,
        tx, ty + half,
      ]).fill('#00cc44');
    } else if (dy === 1) {
      this.graphics.poly([
        tx, ty,
        tx + CELL_SIZE, ty,
        tx + half, ty + CELL_SIZE,
      ]).fill('#00cc44');
    } else {
      this.graphics.poly([
        tx, ty + CELL_SIZE,
        tx + CELL_SIZE, ty + CELL_SIZE,
        tx + half, ty,
      ]).fill('#00cc44');
    }

    const head = this.segments[0];
    this.graphics
      .circle(
        head.x * CELL_SIZE + CELL_SIZE / 2,
        head.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 1
      )
      .fill('#00ff88');

    const eyeOffset = CELL_SIZE / 4;
    const eyeRadius = CELL_SIZE / 10;

    let eye1, eye2;

    if (this.direction.x === 1) {
      eye1 = { x: head.x * CELL_SIZE + CELL_SIZE - eyeOffset, y: head.y * CELL_SIZE + eyeOffset };
      eye2 = { x: head.x * CELL_SIZE + CELL_SIZE - eyeOffset, y: head.y * CELL_SIZE + CELL_SIZE - eyeOffset };
    } else if (this.direction.x === -1) {
      eye1 = { x: head.x * CELL_SIZE + eyeOffset, y: head.y * CELL_SIZE + eyeOffset };
      eye2 = { x: head.x * CELL_SIZE + eyeOffset, y: head.y * CELL_SIZE + CELL_SIZE - eyeOffset };
    } else if (this.direction.y === -1) {
      eye1 = { x: head.x * CELL_SIZE + eyeOffset, y: head.y * CELL_SIZE + eyeOffset };
      eye2 = { x: head.x * CELL_SIZE + CELL_SIZE - eyeOffset, y: head.y * CELL_SIZE + eyeOffset };
    } else {
      eye1 = { x: head.x * CELL_SIZE + eyeOffset, y: head.y * CELL_SIZE + CELL_SIZE - eyeOffset };
      eye2 = { x: head.x * CELL_SIZE + CELL_SIZE - eyeOffset, y: head.y * CELL_SIZE + CELL_SIZE - eyeOffset };
    }

    this.graphics.circle(eye1.x, eye1.y, eyeRadius).fill('#000');
    this.graphics.circle(eye2.x, eye2.y, eyeRadius).fill('#000');
  }

  checkWallCollision() {
    const head = this.segments[0];
    return (
      head.x < 0 ||
      head.x >= FIELD_SIZE ||
      head.y < 0 ||
      head.y >= FIELD_SIZE
    );
  }

  checkSelfCollision() {
    const head = this.segments[0];
    return this.segments
      .slice(1)
      .some(segment => segment.x === head.x && segment.y === head.y);
  }

  eat(food) {
    const head = this.segments[0];
    return head.x === food.position.x && head.y === food.position.y;
  }

  grow() {
    this.shouldGrow = true;
  }

  wrapAround() {
    const head = this.segments[0];

    if (head.x < 0) head.x = FIELD_SIZE - 1;
    if (head.x >= FIELD_SIZE) head.x = 0;
    if (head.y < 0) head.y = FIELD_SIZE - 1;
    if (head.y >= FIELD_SIZE) head.y = 0;
  }

  teleport(position) {
    this.segments[0] = { x: position.x, y: position.y };
  }
}