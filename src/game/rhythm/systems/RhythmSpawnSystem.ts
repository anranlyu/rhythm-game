import { System } from '../../ecs/System';
import { Entity } from '../../ecs/Entity';
import { EntityManager } from '../../ecs/EntityManager';
import { ComponentManager } from '../../ecs/ComponentManager';
import { SystemManager } from '../../ecs/SystemManager';
import { Transform } from '../../ecs/components/Transform';
import { Vector2 } from '../../ecs/components/Vector2';
import { RhythmNoteComponent } from '../components/RhythmNoteComponent';
import { RhythmGameStateComponent } from '../components/RhythmGameStateComponent';

export class RhythmSpawnSystem extends System {
  private componentManager: ComponentManager;
  private entityManager: EntityManager;
  private gameStateEntity: Entity | null = null;

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    this.entityManager = EntityManager.getInstance();
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public update(deltaTime: number): void {
    if (!this.gameStateEntity) return;

    const gameState = this.componentManager.getComponent(this.gameStateEntity, RhythmGameStateComponent);
    if (!gameState || !gameState.isGameRunning) return;

    // Update spawn timer
    gameState.noteSpawnTimer += deltaTime * 1000; // Convert to milliseconds

    // Check if it's time to spawn a new note
    if (gameState.noteSpawnTimer >= gameState.noteSpawnInterval) {
      this.spawnRandomNote(gameState);
      gameState.noteSpawnTimer = 0;
    }
  }

  private spawnRandomNote(gameState: RhythmGameStateComponent): void {
    // Choose random lane (0-4)
    const randomLane = Math.floor(Math.random() * 5);
    
    // Create note entity
    const noteEntity = this.entityManager.createEntity(`Note_Lane${randomLane}_${Date.now()}`);
    
    // Add transform component
    const startX = gameState.getLaneCenter(randomLane) - 25; // Center in lane, offset by half note size
    const startY = -50; // Start above screen
    const transform = new Transform(noteEntity, new Vector2(startX, startY));
    this.componentManager.addComponent(noteEntity, transform);
    
    // Add rhythm note component
    const note = new RhythmNoteComponent(noteEntity, randomLane);
    this.componentManager.addComponent(noteEntity, note);

    // Notify SystemManager about the new entity
    const systemManager = SystemManager.getInstance();
    systemManager.notifyEntityAdded(noteEntity);

    this.logger.debug(`Spawned note in lane ${randomLane}`);
  }
} 