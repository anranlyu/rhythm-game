import * as Matter from 'matter-js';

export class Physics {
    public body: Matter.Body;
    public bodyType: string;
    
    constructor(x: number, y: number, width: number, height: number, options: any = {}) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            density: 0.001,
            friction: 0.1,
            restitution: 0.8, // bounciness
            ...options
        });
        this.bodyType = options.bodyType || 'dynamic';
    }
}