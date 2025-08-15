import * as PIXI from 'pixi.js';
import { Bodies } from 'matter-js';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { SystemManager } from '../ecs/SystemManager';
import { Transform } from '../ecs/components/Transform';
import { Vector2 } from '../ecs/components/Vector2';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { PhysicsRenderSystem } from './systems/PhysicsRenderSystem';
import { PlayerInputSystem } from './systems/PlayerInputSystem';
import { AnimationSystem } from './systems/AnimationSystem';
import { PhysicsBodyComponent } from './components/PhysicsBodyComponent';
import { PlayerComponent } from './components/PlayerComponent';
import { PhysicsGameStateComponent } from './components/PhysicsGameStateComponent';
import { AnimationComponent } from './components/AnimationComponent';

export class PhysicsGame {
  private entityManager: EntityManager;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private physicsSystem: PhysicsSystem;
  private renderSystem: PhysicsRenderSystem;
  private inputSystem: PlayerInputSystem;
  private animationSystem: AnimationSystem;
  private gameWidth: number;
  private gameHeight: number;

  constructor(app: PIXI.Application) {
    this.gameWidth = app.screen.width;
    this.gameHeight = app.screen.height;

    // Initialize ECS
    this.entityManager = EntityManager.getInstance();
    this.componentManager = ComponentManager.getInstance();
    this.systemManager = SystemManager.getInstance();
    
    // Connect ComponentManager to SystemManager for automatic entity-system management
    this.componentManager.setSystemNotifier(this.systemManager);

    // Create systems
    this.physicsSystem = new PhysicsSystem();
    this.renderSystem = new PhysicsRenderSystem(app);
    this.inputSystem = new PlayerInputSystem();
    this.animationSystem = new AnimationSystem();

    // Add systems to system manager
    this.systemManager.addSystem(this.physicsSystem);
    this.systemManager.addSystem(this.renderSystem);
    this.systemManager.addSystem(this.inputSystem);
    this.systemManager.addSystem(this.animationSystem);
  }

  public async initialize(): Promise<void> {
    // Create game state entity
    const gameStateEntity = this.entityManager.createEntity();
    const gameState = new PhysicsGameStateComponent(gameStateEntity, this.gameWidth, this.gameHeight);
    this.componentManager.addComponent(gameStateEntity, gameState);

    // Set game state for systems
    this.renderSystem.setGameStateEntity(gameStateEntity);
    this.inputSystem.setGameStateEntity(gameStateEntity);

    // Create ground
    this.createGround(gameState);

    // Create player
    this.createPlayer(gameState);

    // Create some platforms for jumping
    this.createPlatforms(gameState);

    // Create invisible walls to prevent player from leaving screen
    this.createBoundaryWalls();

    console.log('Physics Game initialized successfully!');
  }

  private createGround(gameState: PhysicsGameStateComponent): void {
    const groundEntity = this.entityManager.createEntity();
    
    // Create physics body for ground
    const groundBody = Bodies.rectangle(
      this.gameWidth / 2,
      gameState.getGroundY(),
      this.gameWidth,
      gameState.groundHeight,
      { isStatic: true, friction: 0.8, restitution: 0.2 }
    );

    // Add components
    const transform = new Transform(
      groundEntity,
      new Vector2(this.gameWidth / 2, gameState.getGroundY())
    );
    const physicsBody = new PhysicsBodyComponent(groundEntity, groundBody);

    this.componentManager.addComponent(groundEntity, transform);
    this.componentManager.addComponent(groundEntity, physicsBody);

    // Add to physics world
    this.physicsSystem.addBody(groundBody);
  }

  private createPlayer(gameState: PhysicsGameStateComponent): void {
    const playerEntity = this.entityManager.createEntity();
    
    // Player starts above ground
    const startX = this.gameWidth / 2;
    const startY = gameState.getGroundY() - 100;
    
    console.log('Creating player at:', startX, startY, 'Ground Y:', gameState.getGroundY());

    // Create physics body for player
    const playerBody = Bodies.rectangle(startX, startY, 50, 50, {
      density: 0.1, // higher density for dramatic physics
      friction: 0.1,
      restitution: 0.1, // bouncy
      frictionAir: 0.03 // air resistance
    });

    // Add components
    const transform = new Transform(playerEntity, new Vector2(startX, startY));
    const physicsBody = new PhysicsBodyComponent(playerEntity, playerBody);
    const player = new PlayerComponent(playerEntity, -12, 8); // Reasonable jump force
    const animation = new AnimationComponent(playerEntity);

    this.componentManager.addComponent(playerEntity, transform);
    this.componentManager.addComponent(playerEntity, physicsBody);
    this.componentManager.addComponent(playerEntity, player);
    this.componentManager.addComponent(playerEntity, animation);

    // Add to physics world only - ECS will handle adding to systems automatically
    this.physicsSystem.addBody(playerBody, true); // Mark as player body
  }

  private createPlatforms(gameState: PhysicsGameStateComponent): void {
    const platforms = [
      { x: 200, y: gameState.getGroundY() - 150, width: 150, height: 20 },
      { x: 500, y: gameState.getGroundY() - 200, width: 120, height: 20 },
      { x: 700, y: gameState.getGroundY() - 100, width: 100, height: 20 },
      { x: 300, y: gameState.getGroundY() - 300, width: 80, height: 20 },
    ];

    platforms.forEach((platform) => {
      const platformEntity = this.entityManager.createEntity();
      
      // Create physics body for platform
      const platformBody = Bodies.rectangle(
        platform.x,
        platform.y,
        platform.width,
        platform.height,
        { isStatic: true, friction: 0.8, restitution: 0.1 }
      );

      // Add components
      const transform = new Transform(
        platformEntity,
        new Vector2(platform.x, platform.y)
      );
      const physicsBody = new PhysicsBodyComponent(platformEntity, platformBody);

      this.componentManager.addComponent(platformEntity, transform);
      this.componentManager.addComponent(platformEntity, physicsBody);

      // Add to physics world only - ECS will handle adding to systems automatically
      this.physicsSystem.addBody(platformBody);
    });
  }

  private createBoundaryWalls(): void {
    const wallThickness = 50;
    
    // Left wall
    const leftWallBody = Bodies.rectangle(
      -wallThickness / 2,
      this.gameHeight / 2,
      wallThickness,
      this.gameHeight,
      { isStatic: true }
    );
    
    // Right wall  
    const rightWallBody = Bodies.rectangle(
      this.gameWidth + wallThickness / 2,
      this.gameHeight / 2,
      wallThickness,
      this.gameHeight,
      { isStatic: true }
    );

    // Add walls to physics world (but not to render system since they're invisible)
    this.physicsSystem.addBody(leftWallBody);
    this.physicsSystem.addBody(rightWallBody);
  }

  public update(deltaTime: number): void {
    this.systemManager.update(deltaTime);
  }

  public cleanup(): void {
    this.renderSystem.cleanup();
    this.systemManager.cleanup();
    this.entityManager.cleanup();
  }

  public reset(): void {
    // Clean up current game
    this.cleanup();
    
    // Reinitialize
    this.initialize();
  }
}