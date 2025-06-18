import { Component } from '../Component';
import { Entity } from '../Entity';
import { Vector2 } from './Vector2';

export class Transform extends Component {
  public position: Vector2;
  public rotation: number; // in radians
  public scale: Vector2;

  constructor(entity: Entity, position?: Vector2, rotation: number = 0, scale?: Vector2) {
    super(entity);
    this.position = position?.copy() || Vector2.zero();
    this.rotation = rotation;
    this.scale = scale?.copy() || Vector2.one();
  }

  public translate(offset: Vector2): void {
    this.position = this.position.add(offset);
  }

  public rotate(angle: number): void {
    this.rotation += angle;
  }

  public setPosition(position: Vector2): void {
    this.position = position.copy();
  }

  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  public setScale(scale: Vector2): void {
    this.scale = scale.copy();
  }

  public getWorldPosition(): Vector2 {
    // For now, just return position (no parent hierarchy)
    return this.position.copy();
  }

  public getWorldRotation(): number {
    // For now, just return rotation (no parent hierarchy)
    return this.rotation;
  }

  public getWorldScale(): Vector2 {
    // For now, just return scale (no parent hierarchy)
    return this.scale.copy();
  }
} 