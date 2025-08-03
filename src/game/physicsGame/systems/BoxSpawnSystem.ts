import { System } from '../../ecs/System';
import { PhysicsGameStateComponent } from '../components/PhysicsGameStateComponent';
import { ComponentManager } from '../../ecs/ComponentManager';
import { EntityManager } from '../../ecs/EntityManager';
import { Transform } from '../../ecs/components/Transform';
import { CollectibleComponent } from '../components/CollectibleComponent';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { Bodies } from 'matter-js';
import { PhysicsSystem } from './PhysicsSystem';
import { Vector2 } from '../../ecs/components/Vector2';
import type { Entity } from '../../ecs/Entity';

export class BoxSpawnSystem extends System {
  private componentManager: ComponentManager;
  private physicsSystem: PhysicsSystem;
  private entityManager: EntityManager;
  private gameStateEntity: Entity | null = null;

  constructor(physicsSystem: PhysicsSystem) {
    super();
    this.physicsSystem = physicsSystem;
    this.componentManager = ComponentManager.getInstance();
    this.entityManager = EntityManager.getInstance();
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number): void {
    if (!this.gameStateEntity) return;
    const gameState = this.componentManager.getComponent(this.gameStateEntity, PhysicsGameStateComponent);
    if (!gameState) return;

    if (gameState.boxesRemaining === 0) {
      // spawn 5 new boxes

      for (let i = 0; i < 5; i++) {
        const boxEntity = this.entityManager.createEntity();
        const x = Math.random() * gameState.gameWidth;
        const y = -50;
        const body = Bodies.rectangle(x, y, 50, 50, {
          density: 0.5,
          friction: 0.4,
          restitution: 0.7,
        });
        const transform = new Transform(boxEntity, new Vector2(x, y));
        const physicsBody = new PhysicsBodyComponent(boxEntity, body);
        const collectible = new CollectibleComponent(boxEntity);
        this.componentManager.addComponent(boxEntity, transform);
        this.componentManager.addComponent(boxEntity, physicsBody);
        this.componentManager.addComponent(boxEntity, collectible);
        this.physicsSystem.addBody(body);
      }
      gameState.boxesRemaining = 5;
    }
  }
}
