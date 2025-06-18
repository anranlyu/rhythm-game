import { Entity } from './Entity';

export abstract class Component {
  public readonly entity: Entity;

  constructor(entity: Entity) {
    this.entity = entity;
  }

  public onAdd(): void {
    // Override in derived classes if needed
  }

  public onRemove(): void {
    // Override in derived classes if needed
  }
} 