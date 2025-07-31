import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';

export class RhythmGameStateComponent extends Component {
  public score: number;
  public noteSpawnTimer: number;
  public noteSpawnInterval: number; // milliseconds
  public gameWidth: number;
  public gameHeight: number;
  public laneWidth: number;
  public hitLineY: number;
  public isGameRunning: boolean;

  constructor(entity: Entity, gameWidth: number, gameHeight: number) {
    super(entity);
    this.score = 0;
    this.noteSpawnTimer = 0;
    this.noteSpawnInterval = 6000; // spawn a note every 1 second
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.laneWidth = gameWidth / 5; // 5 lanes
    this.hitLineY = gameHeight - 100; // hit line near bottom
    this.isGameRunning = true;
  }

  public addScore(points: number = 1): void {
    this.score += points;
  }

  public getLaneX(laneIndex: number): number {
    return laneIndex * this.laneWidth;
  }

  public getLaneCenter(laneIndex: number): number {
    return this.getLaneX(laneIndex) + this.laneWidth / 2;
  }

  public reset(): void {
    this.score = 0;
    this.noteSpawnTimer = 0;
    this.isGameRunning = true;
  }
}