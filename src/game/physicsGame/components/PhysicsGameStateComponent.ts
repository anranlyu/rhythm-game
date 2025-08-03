import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';

export class PhysicsGameStateComponent extends Component {
  public gameWidth: number;
  public gameHeight: number;
  public groundHeight: number;
  public isGameRunning: boolean;
  public playerJumps: number = 0;
  public score: number = 0;
  public boxesRemaining: number = 0;

  constructor(entity: Entity, gameWidth: number, gameHeight: number) {
    super(entity);
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.groundHeight = 100;
    this.isGameRunning = true;
  }

  public incrementJumps(): void {
    this.playerJumps++;
  }

  public reset(): void {
    this.playerJumps = 0;
    this.isGameRunning = true;
  }

  public getGroundY(): number {
    return this.gameHeight - this.groundHeight / 2;
  }
}