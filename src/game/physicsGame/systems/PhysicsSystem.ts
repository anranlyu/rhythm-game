import { Engine, World, Body, Events } from 'matter-js';
import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { Vector2 } from '../../ecs/components/Vector2';

export class PhysicsSystem extends System {
  private engine: Engine;
  private world: World;
  private componentManager: ComponentManager;
  private playerBodies = new Set<Body>(); // Track player bodies

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    
    // matter engine
    this.engine = Engine.create();
    this.engine.gravity.y = 1.0;
    this.engine.gravity.x = 0;
    this.world = this.engine.world;
    
    // Set up collision events
    this.setupCollisionEvents();
    
    // Register required components
    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(PhysicsBodyComponent);
  }

  public getEngine(): Engine {
    return this.engine;
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
    const otherTop = otherBody.bounds.min.y; // Top of the other body
    
    // Check if player is above the platform (landing on top)
    if (this.isPlayerOnTopOfBody(playerBody, otherBody)) {
      const playerEntity = this.findEntityByBody(playerBody);
      if (playerEntity) {
        const physicsComponent = this.componentManager.getComponent(playerEntity, PhysicsBodyComponent);
        const animationComponent = this.componentManager.getComponent(playerEntity, AnimationComponent);
        
        if (physicsComponent) {
          // More lenient velocity check - allow grounding even with some downward velocity
          // This fixes the issue where player stays yellow when landing on platforms
          if (playerBody.velocity.y >= -5) { // Allow grounding if not moving up too fast
            const wasGrounded = physicsComponent.isOnGround();
            physicsComponent.setGrounded(true);
            
            // Trigger landing animation if player wasn't grounded before
            if (!wasGrounded && animationComponent) {
              animationComponent.startLandingAnimation(300); // 300ms landing animation
              console.log('🎬 LANDING ANIMATION TRIGGERED! Player landed on surface!');
            }
            
            console.log('Player landed on surface - grounded!', 'Player Y:', playerBody.position.y, 'Surface top:', otherTop, 'Velocity Y:', playerBody.velocity.y);
          }
        }
      }
    }
  }

  private isPlayerOnTopOfBody(playerBody: Body, otherBody: Body): boolean {
    const playerBottom = playerBody.position.y + 25; // Half player height
    const otherTop = otherBody.bounds.min.y; // Top of the other body
    const otherLeft = otherBody.bounds.min.x;
    const otherRight = otherBody.bounds.max.x;
    const playerLeft = playerBody.bounds.min.x;
    const playerRight = playerBody.bounds.max.x;
    
    // Check if player is above the platform
    const isAbove = playerBottom >= otherTop - 5 && playerBottom <= otherTop + 15;
    
    // Check if player is horizontally aligned with the platform
    const isAligned = playerRight > otherLeft && playerLeft < otherRight;
    
    return isAbove && isAligned;
  }

  private handlePlayerCollisionEnd(playerBody: Body, _otherBody: Body): void {
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
              // Use the same improved collision detection logic
              if (this.isPlayerOnTopOfBody(playerBody, body)) {
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

  update(_deltaTime: number): void {
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