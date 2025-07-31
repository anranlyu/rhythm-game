import { System } from "../../ecs/System";
import * as PIXI from 'pixi.js';

export class PhysicsRenderSystem extends System {
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        
    }
    
}