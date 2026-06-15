export class InputManager {
  constructor(snake) {
    this.snake = snake;
    this.boundHandler = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.boundHandler);
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
        if (this.snake.direction.y !== 1) {
          this.snake.direction = { x: 0, y: -1 };
        }
        break;

      case 'ArrowDown':
        if (this.snake.direction.y !== -1) {
          this.snake.direction = { x: 0, y: 1 };
        }
        break;

      case 'ArrowLeft':
        if (this.snake.direction.x !== 1) {
          this.snake.direction = { x: -1, y: 0 };
        }
        break;

      case 'ArrowRight':
        if (this.snake.direction.x !== -1) {
          this.snake.direction = { x: 1, y: 0 };
        }
        break;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.boundHandler);
  }
}