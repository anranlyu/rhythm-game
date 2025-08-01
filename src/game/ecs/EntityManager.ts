import { Entity } from './Entity';
import { ComponentManager } from './ComponentManager';

export class EntityManager {
  private static instance: EntityManager;
  private entities: Map<number, Entity> = new Map();
  private entitiesByName: Map<string, Entity> = new Map();
  private componentManager: ComponentManager;

  private constructor() {
    this.componentManager = ComponentManager.getInstance();
  }

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  public createEntity(name?: string): Entity {
    const entity = new Entity(name);
    this.entities.set(entity.id, entity);
    
    if (entity.name) {
      this.entitiesByName.set(entity.name, entity);
    }
    
    return entity;
  }

  public getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  public getEntityByName(name: string): Entity | undefined {
    return this.entitiesByName.get(name);
  }

  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  public getActiveEntities(): Entity[] {
    return Array.from(this.entities.values()).filter(entity => entity.active);
  }

  public destroyEntity(entity: Entity): void {
    this.componentManager.removeAllComponents(entity);
    
    this.entities.delete(entity.id);
    if (entity.name) {
      this.entitiesByName.delete(entity.name);
    }
    
    entity.destroy();
  }

  public clear(): void {
    for (const entity of this.entities.values()) {
      this.destroyEntity(entity);
    }
    this.entities.clear();
    this.entitiesByName.clear();
  }

  public cleanup(): void {
    this.clear();
  }
} 