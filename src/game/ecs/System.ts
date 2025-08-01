import { Entity } from './Entity';
import { Component } from './Component';
import { Logger } from '../utils/Logger';

export abstract class System {
  public requiredComponents: (new (...args: any[]) => Component)[] = [];
  public optionalComponents: (new (...args: any[]) => Component)[] = [];
  public entities: Set<Entity> = new Set();
  public logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public registerRequiredComponent(componentType: new (...args: any[]) => Component): void {
    this.requiredComponents.push(componentType);
  }

  public registerOptionalComponent(componentType: new (...args: any[]) => Component): void {
    this.optionalComponents.push(componentType);
  }

  public addEntity(entity: Entity): void {
    this.entities.add(entity);
  }

  public removeEntity(entity: Entity): void {
    this.entities.delete(entity);
  }

  public getEntities(): Set<Entity> {
    return this.entities;
  }

  public abstract update(deltaTime: number): void;

  public onComponentAdded(_entity: Entity, _component: Component): void {
    // Override in derived classes if needed
  }

  public onComponentRemoved(_entity: Entity, _component: Component): void {
    // Override in derived classes if needed
  }
} 