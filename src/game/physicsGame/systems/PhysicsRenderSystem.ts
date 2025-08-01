import { System } from "../../ecs/System";
import { Entity } from '../../ecs/Entity';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent';
import { PlayerComponent } from '../components/PlayerComponent';
import { PhysicsGameStateComponent } from '../components/PhysicsGameStateComponent';
import * as PIXI from 'pixi.js';

export class PhysicsRenderSystem extends System {
    private app: PIXI.Application;
    private componentManager: ComponentManager;
    private gameLayer: PIXI.Container;
    private uiLayer: PIXI.Container;
    private renderedEntities = new Map<Entity, PIXI.Graphics>();
    private jumpText: PIXI.Text | null = null;
    private instructionText: PIXI.Text | null = null;
    private gameStateEntity: Entity | null = null;
    private groundGraphics: PIXI.Graphics | null = null;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        this.componentManager = ComponentManager.getInstance();
        
        // Register required components
        this.registerRequiredComponent(Transform);
        this.registerRequiredComponent(PhysicsBodyComponent);
        
        // Create layers
        this.gameLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
        
        this.app.stage.addChild(this.gameLayer);
        this.app.stage.addChild(this.uiLayer);
        
        // Create UI text
        this.jumpText = new PIXI.Text({
            text: 'Jumps: 0',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff,
            }
        });
        this.jumpText.x = 10;
        this.jumpText.y = 10;
        this.uiLayer.addChild(this.jumpText);

        this.instructionText = new PIXI.Text({
            text: 'Controls: SPACE or W to jump, A/D or Arrow Keys to move',
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xcccccc,
            }
        });
        this.instructionText.x = 10;
        this.instructionText.y = 40;
        this.uiLayer.addChild(this.instructionText);
    }

    public setGameStateEntity(entity: Entity): void {
        this.gameStateEntity = entity;
    }

    public renderGround(): void {
        if (!this.gameStateEntity) return;

        const gameState = this.componentManager.getComponent(this.gameStateEntity, PhysicsGameStateComponent);
        if (!gameState) return;

        // Only create ground graphics once
        if (!this.groundGraphics) {
            this.groundGraphics = new PIXI.Graphics();
            const groundY = gameState.getGroundY();
            
            // Draw ground
            this.groundGraphics.beginFill(0x4a4a4a); // Dark gray ground
            this.groundGraphics.drawRect(0, groundY, gameState.gameWidth, gameState.groundHeight);
            this.groundGraphics.endFill();
            
            // Add some texture to the ground
            this.groundGraphics.beginFill(0x666666); // Lighter gray for texture
            for (let x = 0; x < gameState.gameWidth; x += 50) {
                this.groundGraphics.drawRect(x, groundY - 5, 40, 5);
            }
            this.groundGraphics.endFill();
            
            this.gameLayer.addChild(this.groundGraphics);
        }
    }

    public update(_deltaTime: number): void {
        // Update jump counter
        this.updateUI();
        
        // Render ground
        this.renderGround();
        
        // Render physics objects
        this.renderPhysicsObjects();
    }

    private updateUI(): void {
        if (!this.jumpText || !this.gameStateEntity) return;
        
        const gameState = this.componentManager.getComponent(this.gameStateEntity, PhysicsGameStateComponent);
        const jumps = gameState ? gameState.playerJumps : 0;
        
        this.jumpText.text = `Jumps: ${jumps}`;
    }

    private renderPhysicsObjects(): void {
        try {
            // Clean up graphics for inactive entities
            for (const [entity, graphics] of this.renderedEntities) {
                const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);
                if (!physicsBody) {
                    this.gameLayer.removeChild(graphics);
                    graphics.destroy();
                    this.renderedEntities.delete(entity);
                }
            }

        // Render active physics objects
        for (const entity of this.entities) {
            const transform = this.componentManager.getComponent(entity, Transform);
            const physicsBody = this.componentManager.getComponent(entity, PhysicsBodyComponent);
            const player = this.componentManager.getComponent(entity, PlayerComponent);

            if (!transform || !physicsBody) continue;

            let graphics = this.renderedEntities.get(entity);
            
            if (!graphics) {
                // Create new graphics for this entity
                graphics = new PIXI.Graphics();
                this.renderedEntities.set(entity, graphics);
                this.gameLayer.addChild(graphics);
            }

            // Clear and redraw
            graphics.clear();
            
            if (player) {
                // Render player as a colorful rectangle
                const color = physicsBody.isOnGround() ? 0x00ff00 : 0xffff00; // Green when grounded, yellow when airborne
                
                // Draw player body
                graphics.beginFill(color);
                graphics.lineStyle(2, 0x000000);
                graphics.drawRect(-25, -25, 50, 50); // Player is 50x50 pixels
                graphics.endFill();
                
                // Add a simple face
                graphics.beginFill(0x000000);
                graphics.drawCircle(-8, -8, 3);
                graphics.drawCircle(8, -8, 3);
                graphics.drawRect(-5, 5, 10, 3);
                graphics.endFill();
            } else {
                // Render other physics objects as gray rectangles
                const body = physicsBody.body;
                const bounds = body.bounds;
                const width = bounds.max.x - bounds.min.x;
                const height = bounds.max.y - bounds.min.y;
                
                graphics.beginFill(0x888888);
                graphics.lineStyle(1, 0x000000);
                graphics.drawRect(-width/2, -height/2, width, height);
                graphics.endFill();
            }
            
            // Update position and rotation
            graphics.x = transform.position.x;
            graphics.y = transform.position.y;
            graphics.rotation = transform.rotation;
        }
        } catch (error) {
            console.error('Error rendering physics objects:', error);
        }
    }

    public cleanup(): void {
        // Clean up all graphics
        for (const graphics of this.renderedEntities.values()) {
            graphics.destroy();
        }
        this.renderedEntities.clear();
        
        if (this.jumpText) {
            this.jumpText.destroy();
            this.jumpText = null;
        }
        
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null;
        }

        if (this.groundGraphics) {
            this.groundGraphics.destroy();
            this.groundGraphics = null;
        }
        
        this.gameLayer.destroy();
        this.uiLayer.destroy();
    }
}