import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { CollectibleComponent } from '../components/CollectibleComponent';
import { PhysicsGameStateComponent } from '../components/PhysicsGameStateComponent';
import { Entity } from '../../ecs/Entity';
import { Body, World } from 'matter-js';

export class CollectibleSystem extends System {
  private componentManager: ComponentManager;
  private playerBodies: Set<Body> = new Set();
  private world: World | null = null;
  private gameStateEntity: Entity | null = null;

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();

    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(PhysicsBodyComponent);
    this.registerRequiredComponent(CollectibleComponent);
  }

  /** Call once when physics system is ready */
  public setPhysicsWorld(world: World): void {
    this.world = world;
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public registerPlayerBody(body: Body): void {
    this.playerBodies.add(body);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number): void {
    if (!this.world || this.playerBodies.size === 0) return;
    if (!this.gameStateEntity) return;

    const toRemove: { entity: Entity; body: Body }[] = [];

    // Detect collisions first
    for (const entity of this.entities) {
      const phys = this.componentManager.getComponent(entity, PhysicsBodyComponent);
      if (!phys) continue;

      for (const player of this.playerBodies) {
        if (this.areColliding(player, phys.body)) {
          toRemove.push({ entity, body: phys.body });
          break;
        }
      }
    }

    // Process removals after detection loop to avoid mutation during iteration
    for (const { entity, body } of toRemove) {
      // Make the body non-blocking immediately so the player doesn’t collide next frame
      body.isSensor = true;
      World.remove(this.world, body, true);

      this.componentManager.removeComponent(entity, PhysicsBodyComponent);
      this.componentManager.removeComponent(entity, CollectibleComponent);

      // Increment score
      const gameState = this.componentManager.getComponent(
        this.gameStateEntity!,
        PhysicsGameStateComponent,
      );
      if (gameState) {
        gameState.score += 1;
      }
    }

    // Synchronize boxesRemaining with actual collectible count
    if (this.gameStateEntity) {
      const gameState = this.componentManager.getComponent(this.gameStateEntity, PhysicsGameStateComponent);
      if (gameState) {
        gameState.boxesRemaining = this.entities.size;
      }
    }
  }

  private areColliding(a: Body, b: Body): boolean {
    return !(
      a.bounds.max.x < b.bounds.min.x ||
      a.bounds.min.x > b.bounds.max.x ||
      a.bounds.max.y < b.bounds.min.y ||
      a.bounds.min.y > b.bounds.max.y
    );
  }
}
