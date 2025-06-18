import { Graphics } from 'pixi.js';

export class Entity {
  private static nextId = 1;
  
  public readonly id: number;
  public name: string;
  public active: boolean;
  public graphics?: Graphics;

  constructor(name: string = '') {
    this.id = Entity.nextId++;
    this.name = name || `Entity_${this.id}`;
    this.active = true;
  }

  public setGraphics(graphics: Graphics): void {
    this.graphics = graphics;
  }

  public destroy(): void {
    this.active = false;
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = undefined;
    }
  }
} 