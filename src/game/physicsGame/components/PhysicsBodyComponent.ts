import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';
import { Body } from 'matter-js';

export class PhysicsBodyComponent extends Component {
  public body: Body;
  public isGrounded: boolean = false;

  constructor(entity: Entity, body: Body) {
    super(entity);
    this.body = body;
  }

  public setGrounded(grounded: boolean): void {
    this.isGrounded = grounded;
  }

  public isOnGround(): boolean {
    return this.isGrounded;
  }
}