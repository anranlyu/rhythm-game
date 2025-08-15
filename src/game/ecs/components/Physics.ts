import * as Matter from 'matter-js';
import { Component } from '../Component';

interface PhysicsOptions {
    bodyType?: string;
    density?: number;
    friction?: number;
    restitution?: number;
    [key: string]: any;
}

export class Physics extends Component {
    public body: Matter.Body;
    public bodyType: string;

    constructor(entity: any, x: number, y: number, width: number, height: number, options: PhysicsOptions = {}) {
        super(entity);
        this.body = Matter.Bodies.rectangle(x, y, width, height, {
            density: 0.001,
            friction: 0.1,
            restitution: 0.8, // bounciness
            ...options
        });
        this.bodyType = options.bodyType || 'dynamic';
    }
}