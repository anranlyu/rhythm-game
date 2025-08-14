import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { CollectibleComponent } from '../components/CollectibleComponent';
import { PhysicsGameStateComponent } from '../components/PhysicsGameStateComponent';
import { Entity } from '../../ecs/Entity';
import { Body, World, Events, Engine } from 'matter-js';

export class CollectibleSystem extends System {
  private componentManager: ComponentManager;
  private playerBodies: Set<Body> = new Set();
  private collectibleBodies: Map<Body, Entity> = new Map();
  private world: World | null = null;
  private engine: Engine | null = null;
  private gameStateEntity: Entity | null = null;
  private bodiesToRemove: Set<Body> = new Set();

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();

    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(PhysicsBodyComponent);
    this.registerRequiredComponent(CollectibleComponent);
  }

  /** Call once when physics system is ready */
  public setPhysicsWorld(world: World, engine: Engine): void {
    this.world = world;
    this.engine = engine;
    

    if (this.engine) {
      Events.on(this.engine, 'collisionStart', (event) => {
        this.handleCollisionStart(event);
      });
    }
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public registerPlayerBody(body: Body): void {
    this.playerBodies.add(body);
  }

  private handleCollisionStart(event: Matter.IEventCollision<Matter.Engine>): void {
    const pairs = event.pairs;
    
    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;
      
      // Check 
      let playerBody: Body | null = null;
      let collectibleBody: Body | null = null;
      
      if (this.playerBodies.has(bodyA)) {
        playerBody = bodyA;
        if (this.collectibleBodies.has(bodyB)) {
          collectibleBody = bodyB;
        }
      } else if (this.playerBodies.has(bodyB)) {
        playerBody = bodyB;
        if (this.collectibleBodies.has(bodyA)) {
          collectibleBody = bodyA;
        }
      }
      
      // If we have a player-collectible collision, mark for removal
      if (playerBody && collectibleBody) {
        console.log('Player collected a box!');
        this.bodiesToRemove.add(collectibleBody);
      }
    }
  }

  update(_dt: number): void {
    if (!this.world) return;

    // Update our tracking of collectible bodies
    this.updateCollectibleTracking();

    // Process any pending removals from collision events
    this.processRemovals();

    // Update boxes remaining count
    this.updateBoxCount();
  }

  private updateCollectibleTracking(): void {

    this.collectibleBodies.clear();
    
    for (const entity of this.entities) {
      const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);
      if (physicsBody && physicsBody.body) {
        this.collectibleBodies.set(physicsBody.body, entity);
      }
    }
  }

  private processRemovals(): void {
    if (!this.world || this.bodiesToRemove.size === 0) return;

    for (const body of this.bodiesToRemove) {
      const entity = this.collectibleBodies.get(body);
      if (!entity) continue;

      // Make the body non-blocking immediately
      body.isSensor = true;
      
      // Remove from physics world
      World.remove(this.world, body, true);

      // Remove components to remove entity from systems
      this.componentManager.removeComponent(entity, PhysicsBodyComponent);
      this.componentManager.removeComponent(entity, CollectibleComponent);

      // Increment score
      if (this.gameStateEntity) {
        const gameState = this.componentManager.getComponent(
          this.gameStateEntity,
          PhysicsGameStateComponent
        );
        if (gameState) {
          gameState.score += 1;
          console.log(`Score: ${gameState.score}`);
        }
      }

      // Remove from our tracking
      this.collectibleBodies.delete(body);
    }

    // Clear the removal set
    this.bodiesToRemove.clear();
  }

  private updateBoxCount(): void {
    if (this.gameStateEntity) {
      const gameState = this.componentManager.getComponent(
        this.gameStateEntity,
        PhysicsGameStateComponent
      );
      if (gameState) {
        gameState.boxesRemaining = this.entities.size;
      }
    }
  }
}