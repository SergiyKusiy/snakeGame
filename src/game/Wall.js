import * as PIXI from 'pixi.js';
import { CELL_SIZE } from '../constants/gameConfig.js';

export class Wall {
    constructor(app, position) {
        this.app = app;
        this.position = position;
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
    }

    draw() {
        this.graphics.clear();
        this.graphics
            .rect(
                this.position.x * CELL_SIZE,
                this.position.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            )
            .fill('#8B4513');
    }
}