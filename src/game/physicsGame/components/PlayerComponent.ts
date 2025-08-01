import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';

export class PlayerComponent extends Component {
  public jumpForce: number;
  public moveSpeed: number;
  public canJump: boolean = true;
  public jumpCooldown: number = 0;
  public maxJumpCooldown: number = 200; // milliseconds

  constructor(entity: Entity, jumpForce: number = -15, moveSpeed: number = 5) {
    super(entity);
    this.jumpForce = jumpForce;
    this.moveSpeed = moveSpeed;
  }

  public canPerformJump(): boolean {
    return this.canJump && this.jumpCooldown <= 0;
  }

  public performJump(): void {
    if (this.canPerformJump()) {
      this.jumpCooldown = this.maxJumpCooldown;
      this.canJump = false;
    }
  }

  public updateCooldown(deltaTime: number): void {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
  }

  public resetJump(): void {
    this.canJump = true;
    this.jumpCooldown = 0;
  }
}