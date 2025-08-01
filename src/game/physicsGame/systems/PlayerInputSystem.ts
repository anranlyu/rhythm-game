import { System } from '../../ecs/System';
import { Entity } from '../../ecs/Entity';
import { ComponentManager } from '../../ecs/ComponentManager';
import { EventManager } from '../../events/EventManager';
import { KeyboardEvent } from '../../events/KeyboardEvent';
import { PlayerComponent } from '../components/PlayerComponent';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { PhysicsGameStateComponent } from '../components/PhysicsGameStateComponent';
import { Body } from 'matter-js';
import type { EventListener } from '../../events/EventListener';
import type { Event } from '../../events/Event';

export class PlayerInputSystem extends System implements EventListener {
  private componentManager: ComponentManager;
  private eventManager: EventManager;
  private gameStateEntity: Entity | null = null;
  private keysPressed = new Set<string>();

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    this.eventManager = EventManager.getInstance();
    
    // Register required components
    this.registerRequiredComponent(PlayerComponent);
    this.registerRequiredComponent(PhysicsBodyComponent);
    
    // Subscribe to keyboard events
    this.eventManager.subscribe(KeyboardEvent.KEY_PRESSED, this);
    this.eventManager.subscribe(KeyboardEvent.KEY_RELEASED, this);
  }

  public setGameStateEntity(entity: Entity): void {
    this.gameStateEntity = entity;
  }

  public handleEvent(event: Event): void {
    if (event instanceof KeyboardEvent) {
      if (event.isPressed()) {
        const normalizedKey = event.key.toLowerCase();
        this.keysPressed.add(normalizedKey);
        this.handleKeyPress(normalizedKey);
      } else {
        this.keysPressed.delete(event.key.toLowerCase());
      }
    }
  }

  private handleKeyPress(key: string): void {
    if (!this.gameStateEntity) return;

    const gameState = this.componentManager.getComponent(this.gameStateEntity, PhysicsGameStateComponent);
    if (!gameState || !gameState.isGameRunning) return;

    // Handle jump input (spacebar or up arrow or w)
    // Key normalization: space becomes 'space', ArrowUp becomes 'up'
    if (key === 'space' || key === 'up' || key === 'w') {
      console.log('Jump key pressed:', key);
      this.handleJumpInput(gameState);
    }
  }

  private handleJumpInput(gameState: PhysicsGameStateComponent): void {
    for (const entity of this.entities) {
      const player = this.componentManager.getComponent(entity, PlayerComponent);
      const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);
      const animationComponent = this.componentManager.getComponent(entity, AnimationComponent);

      if (!player || !physicsBody) continue;

      // Check if player can jump (is grounded and cooldown is ready)
      console.log('Jump attempt - Grounded:', physicsBody.isOnGround(), 'Can jump:', player.canPerformJump(), 'Player Y:', physicsBody.body.position.y);
      if (physicsBody.isOnGround() && player.canPerformJump()) {
        // Apply jump force
        Body.applyForce(physicsBody.body, physicsBody.body.position, {
          x: 0,
          y: player.jumpForce
        });

        player.performJump();
        gameState.incrementJumps();
        
        // Trigger jump animation
        if (animationComponent) {
          animationComponent.startJumpAnimation(200); // 200ms jump animation
          console.log('🚀 JUMP ANIMATION TRIGGERED! Player jumped!');
        }
        
        console.log(`Jump! Total jumps: ${gameState.playerJumps}`);
        break; // Only jump with first valid player
      }
    }
  }

  public update(deltaTime: number): void {
    // Removed debug logging
    
    // Update player movement and cooldowns
    for (const entity of this.entities) {
      const player = this.componentManager.getComponent(entity, PlayerComponent);
      const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);

      if (!player || !physicsBody) continue;

      // Update jump cooldown
      player.updateCooldown(deltaTime);

      // Handle horizontal movement
      let horizontalForce = 0;
      if (this.keysPressed.has('a') || this.keysPressed.has('left')) {
        horizontalForce = -player.moveSpeed;
      }
      if (this.keysPressed.has('d') || this.keysPressed.has('right')) {
        horizontalForce = player.moveSpeed;
      }

      // Apply horizontal movement force with screen boundary check
      if (horizontalForce !== 0) {
        const gameState = this.componentManager.getComponent(this.gameStateEntity!, PhysicsGameStateComponent);
        const playerX = physicsBody.body.position.x;
        const playerWidth = 50; // Player is 50x50 pixels
        
        // Check screen boundaries
        const leftBound = playerWidth / 2;
        const rightBound = gameState ? gameState.gameWidth - playerWidth / 2 : 800;
        
        // Only apply force if not at boundary or moving away from boundary
        const canMoveLeft = horizontalForce < 0 && playerX > leftBound;
        const canMoveRight = horizontalForce > 0 && playerX < rightBound;
        
        if (canMoveLeft || canMoveRight) {
          Body.applyForce(physicsBody.body, physicsBody.body.position, {
            x: horizontalForce * 0.01, // Reasonable horizontal force
            y: 0
          });
        }
      }

      // Simple fallback ground detection
      const gameState = this.componentManager.getComponent(this.gameStateEntity!, PhysicsGameStateComponent);
      if (gameState && !physicsBody.isOnGround()) {
        const groundY = gameState.getGroundY();
        const playerY = physicsBody.body.position.y;
        
        // Simple ground detection
        if (playerY >= groundY - 100) {
          console.log('Fallback ground detection - setting grounded at Y:', playerY);
          physicsBody.setGrounded(true);
        }
      }
      
      // Reset jump ability when grounded
      if (physicsBody.isOnGround() && !player.canJump) {
        player.resetJump();
      }
    }
  }
}