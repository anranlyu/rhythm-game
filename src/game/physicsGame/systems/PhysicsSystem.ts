import { Engine, World, Body, Events } from 'matter-js';
import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { PlayerComponent } from '../components/PlayerComponent';
import { Vector2 } from '../../ecs/components/Vector2';

export class PhysicsSystem extends System {
  private engine: Engine;
  private world: World;
  private componentManager: ComponentManager;
  private playerBodies = new Set<Body>(); // Track player bodies

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    
    // Create engine with proper gravity for jumping game
    this.engine = Engine.create();
    this.engine.gravity.y = 1.0; // Normal gravity
    this.engine.gravity.x = 0;
    this.world = this.engine.world;
    
    // Set up collision events
    this.setupCollisionEvents();
    
    // Register required components
    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(PhysicsBodyComponent);
  }

  private setupCollisionEvents(): void {
    // Listen for collision start events
    Events.on(this.engine, 'collisionStart', (event) => {
      console.log('Collision detected! Pairs:', event.pairs.length);
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        
        console.log('Collision between bodies at:', bodyA.position, 'and', bodyB.position);
        
        // Check if one of the bodies is a player
        if (this.playerBodies.has(bodyA)) {
          console.log('Player collision detected - bodyA is player');
          this.handlePlayerCollision(bodyA, bodyB);
        } else if (this.playerBodies.has(bodyB)) {
          console.log('Player collision detected - bodyB is player');
          this.handlePlayerCollision(bodyB, bodyA);
        }
      });
    });

    // Listen for collision end events
    Events.on(this.engine, 'collisionEnd', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        
        // Check if one of the bodies is a player
        if (this.playerBodies.has(bodyA)) {
          this.handlePlayerCollisionEnd(bodyA, bodyB);
        } else if (this.playerBodies.has(bodyB)) {
          this.handlePlayerCollisionEnd(bodyB, bodyA);
        }
      });
    });
  }

  private handlePlayerCollision(playerBody: Body, otherBody: Body): void {
    // Check if player is landing on top of the other body (not side collision)
    const playerBottom = playerBody.position.y + 25; // Half player height
    const otherTop = otherBody.bounds.min.y; // Top of the other body
    
    // Only consider grounded if player is above the platform and moving downward slowly (landed)
    if (playerBottom >= otherTop - 5 && playerBottom <= otherTop + 15) {
      const playerEntity = this.findEntityByBody(playerBody);
      if (playerEntity) {
        const physicsComponent = this.componentManager.getComponent(playerEntity, PhysicsBodyComponent);
        if (physicsComponent && Math.abs(playerBody.velocity.y) < 2) { // Nearly stopped vertically
          physicsComponent.setGrounded(true);
          console.log('Player landed on surface - grounded!', 'Player Y:', playerBody.position.y, 'Surface top:', otherTop);
        }
      }
    }
  }

  private handlePlayerCollisionEnd(playerBody: Body, otherBody: Body): void {
    // Check if player is no longer touching any ground surfaces
    const playerEntity = this.findEntityByBody(playerBody);
    if (playerEntity) {
      const physicsComponent = this.componentManager.getComponent(playerEntity, PhysicsBodyComponent);
      if (physicsComponent) {
        // Small delay to check if player is truly airborne
        setTimeout(() => {
          // Check if player is still in contact with any surfaces by checking all current collisions
          let stillGrounded = false;
          const allBodies = this.world.bodies;
          
          for (const body of allBodies) {
            if (body !== playerBody && this.areColliding(playerBody, body)) {
              const playerBottom = playerBody.position.y + 25;
              const bodyTop = body.bounds.min.y;
              
              // If still on top of something
              if (playerBottom >= bodyTop - 5 && playerBottom <= bodyTop + 15) {
                stillGrounded = true;
                break;
              }
            }
          }
          
          if (!stillGrounded) {
            physicsComponent.setGrounded(false);
            console.log('Player left surface - airborne!');
          }
        }, 100);
      }
    }
  }

  private areColliding(bodyA: Body, bodyB: Body): boolean {
    // Simple bounds check to see if bodies are overlapping
    return !(bodyA.bounds.max.x < bodyB.bounds.min.x || 
             bodyA.bounds.min.x > bodyB.bounds.max.x || 
             bodyA.bounds.max.y < bodyB.bounds.min.y || 
             bodyA.bounds.min.y > bodyB.bounds.max.y);
  }

  private findEntityByBody(body: Body): any {
    for (const entity of this.entities) {
      const physicsComponent = this.componentManager.getComponent(entity, PhysicsBodyComponent);
      if (physicsComponent && physicsComponent.body === body) {
        return entity;
      }
    }
    return null;
  }

  public getWorld(): World {
    return this.world;
  }

  public addBody(body: Body, isPlayer: boolean = false): void {
    World.add(this.world, body);
    if (isPlayer) {
      this.playerBodies.add(body);
    }
  }

  public removeBody(body: Body): void {
    World.remove(this.world, body);
  }

  update(deltaTime: number): void {
    // Use fixed timestep for consistent physics - Matter.js expects ~16.67ms (60fps)
    const fixedTimeStep = 16.67;
    Engine.update(this.engine, fixedTimeStep);
    
    // Sync physics bodies with transform components
    for (const entity of this.entities) {
      const transform = this.componentManager.getComponent(entity, Transform);
      const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);
      
      if (transform && physicsBody && physicsBody.body) {
        // Sync physics to transform
        
        // Update transform position from physics body
        transform.position = new Vector2(
          physicsBody.body.position.x,
          physicsBody.body.position.y
        );
        transform.rotation = physicsBody.body.angle;
      }
    }
  }
}