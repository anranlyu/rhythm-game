import * as PIXI from 'pixi.js';
import { System } from '../../ecs/System';
import { Entity } from '../../ecs/Entity';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { RhythmNoteComponent } from '../components/RhythmNoteComponent';
import { RhythmLaneComponent } from '../components/RhythmLaneComponent';
import { HitLineComponent } from '../components/HitLineComponent';
import { RhythmGameStateComponent } from '../components/RhythmGameStateComponent';

export class RhythmRenderSystem extends System {
  private componentManager: ComponentManager;
  private app: PIXI.Application;
  private gameLayer: PIXI.Container;
  private uiLayer: PIXI.Container;
  private scoreText: PIXI.Text | null = null;
  private renderedEntities = new Map<Entity, PIXI.Graphics>();
  private gameStateEntity: Entity | null = null;

  constructor(app: PIXI.Application) {
    super();
    this.componentManager = ComponentManager.getInstance();
    this.app = app;
    
    // Register required components for note rendering
    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(RhythmNoteComponent);
    
    // Create layers
    this.gameLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    
    this.app.stage.addChild(this.gameLayer);
    this.app.stage.addChild(this.uiLayer);
    
    // Create score text
    this.scoreText = new PIXI.Text({
      text: 'Score: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
      }
    });
    this.scoreText.x = 10;
    this.scoreText.y = 10;
    this.uiLayer.addChild(this.scoreText);
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public renderLanes(lanes: Entity[]): void {
    // Clear existing lane graphics
    this.gameLayer.removeChildren();

    for (const laneEntity of lanes) {
      const lane = this.componentManager.getComponent(laneEntity, RhythmLaneComponent);
      if (!lane) continue;

      const graphics = new PIXI.Graphics();
      
      // Draw lane background with border
      graphics.rect(lane.x, lane.y, lane.width, lane.height);
      graphics.fill(lane.color.toPixiColor());
      graphics.stroke({ width: 2, color: 0x555555 });
      
      this.gameLayer.addChild(graphics);
    }
  }

  public renderHitLine(hitLineEntity: Entity): void {
    const hitLine = this.componentManager.getComponent(hitLineEntity, HitLineComponent);
    if (!hitLine) return;

    const graphics = new PIXI.Graphics();
    graphics.rect(0, hitLine.y, hitLine.width, hitLine.height);
    graphics.fill(hitLine.color.toPixiColor());
    
    this.gameLayer.addChild(graphics);
  }

  public update(_deltaTime: number): void {
    // Update score display
    this.updateScoreDisplay();
    
    // Render notes
    this.renderNotes();
  }

  private updateScoreDisplay(): void {
    if (!this.scoreText || !this.gameStateEntity) return;
    
    const gameState = this.componentManager.getComponent(this.gameStateEntity, RhythmGameStateComponent);
    const currentScore = gameState ? gameState.score : 0;
    
    this.scoreText.text = `Score: ${currentScore}`;
  }

  private renderNotes(): void {
    // Clean up graphics for inactive entities
    for (const [entity, graphics] of this.renderedEntities) {
      const note = this.componentManager.getComponent(entity, RhythmNoteComponent);
      if (!note || !note.isActive) {
        this.gameLayer.removeChild(graphics);
        graphics.destroy();
        this.renderedEntities.delete(entity);
      }
    }

    // Render active notes
    for (const entity of this.entities) {
      const transform = this.componentManager.getComponent(entity, Transform);
      const note = this.componentManager.getComponent(entity, RhythmNoteComponent);

      if (!transform || !note || !note.isActive) continue;

      let graphics = this.renderedEntities.get(entity);
      
      if (!graphics) {
        // Create new graphics for this note
        graphics = new PIXI.Graphics();
        this.renderedEntities.set(entity, graphics);
        this.gameLayer.addChild(graphics);
      }

      // Clear and redraw
      graphics.clear();
      graphics.rect(0, 0, note.size, note.size);
      graphics.fill(note.color.toPixiColor());
      
      // Update position
      graphics.x = transform.position.x;
      graphics.y = transform.position.y;
    }
  }

  public updateScore(score: number): void {
    if (this.scoreText) {
      this.scoreText.text = `Score: ${score}`;
    }
  }

  public cleanup(): void {
    // Clean up all graphics
    for (const graphics of this.renderedEntities.values()) {
      graphics.destroy();
    }
    this.renderedEntities.clear();
    
    if (this.scoreText) {
      this.scoreText.destroy();
      this.scoreText = null;
    }
    
    this.gameLayer.destroy();
    this.uiLayer.destroy();
  }
} 