import * as Matter from 'matter-js';
class Physics {
    constructor(x, y, width, height, options = {}) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            density: 0.001,
            friction: 0.1,
            restitution: 0.8, // bounciness
            ...options
        });
        this.bodyType = options.bodyType || 'dynamic';
    }
}