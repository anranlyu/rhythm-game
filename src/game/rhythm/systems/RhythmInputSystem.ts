import { System } from '../../ecs/System';
import { Entity } from '../../ecs/Entity';
import { ComponentManager } from '../../ecs/ComponentManager';
import { EventManager } from '../../events/EventManager';
import { KeyboardEvent } from '../../events/KeyboardEvent';
import { Transform } from '../../ecs/components/Transform';
import { RhythmNote } from '../RhythmNote';
import { RhythmGameState } from '../RhythmGameState';
import { HitLine } from '../HitLine';
import type { EventListener } from '../../events/EventListener';
import type { Event } from '../../events/Event';

export class RhythmInputSystem extends System implements EventListener {
  private componentManager: ComponentManager;
  private eventManager: EventManager;
  private gameStateEntity: Entity | null = null;
  private hitLineEntity: Entity | null = null;

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    this.eventManager = EventManager.getInstance();
    
    // Register required components for input handling
    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(RhythmNote);
    
    // Subscribe to keyboard events
    this.eventManager.subscribe(KeyboardEvent.KEY_PRESSED, this);
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public setHitLineEntity(entity: Entity): void {
    this.hitLineEntity = entity;
  }

  public handleEvent(event: Event): void {
    if (event instanceof KeyboardEvent && event.isPressed()) {
      const keyNumber = event.getNumber();
      if (keyNumber !== null && keyNumber >= 1 && keyNumber <= 5) {
        this.handleLaneInput(keyNumber - 1); // Convert to 0-4 index
      }
    }
  }

  private handleLaneInput(laneIndex: number): void {
    if (!this.gameStateEntity || !this.hitLineEntity) return;

    const gameState = this.componentManager.getComponent(this.gameStateEntity, RhythmGameState);
    const hitLine = this.componentManager.getComponent(this.hitLineEntity, HitLine);

    if (!gameState || !hitLine) return;

    // Find notes in the correct lane that are in the hit zone
    let hitNote: Entity | null = null;
    let closestDistance = Infinity;

    for (const entity of this.entities) {
      const note = this.componentManager.getComponent(entity, RhythmNote);
      const transform = this.componentManager.getComponent(entity, Transform);

      if (!note || !transform || !note.isActive || note.lane !== laneIndex) continue;

      // Check if note is in hit zone
      if (hitLine.isNoteInHitZone(transform.position.y, note.size)) {
        const distance = Math.abs(transform.position.y + note.size / 2 - hitLine.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          hitNote = entity;
        }
      }
    }

    if (hitNote) {
      const note = this.componentManager.getComponent(hitNote, RhythmNote);
      if (note) {
        note.markAsHit();
        gameState.addScore(1);
        this.logger.info(`Hit! Score: ${gameState.score}`);
      }
    } else {
      this.logger.debug(`Miss in lane ${laneIndex + 1}`);
    }
  }

  public update(): void {
    // Clean up inactive notes
    for (const entity of this.entities) {
      const note = this.componentManager.getComponent(entity, RhythmNote);
      if (note && !note.isActive) {
        this.removeEntity(entity);
      }
    }
  }
} 