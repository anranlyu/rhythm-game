import { Entity } from './Entity';
import { Component } from './Component';

interface SystemNotifier {
  notifyComponentAdded(entity: Entity, component: Component): void;
  notifyComponentRemoved(entity: Entity, component: Component): void;
}

export class ComponentManager {
  private static instance: ComponentManager;
  private components: Map<number, Map<string, Component>> = new Map();
  private systemNotifier: SystemNotifier | null = null;

  private constructor() {}

  public static getInstance(): ComponentManager {
    if (!ComponentManager.instance) {
      ComponentManager.instance = new ComponentManager();
    }
    return ComponentManager.instance;
  }

  public setSystemNotifier(systemNotifier: SystemNotifier): void {
    this.systemNotifier = systemNotifier;
  }

  public addComponent<T extends Component>(entity: Entity, component: T): T {
    if (!this.components.has(entity.id)) {
      this.components.set(entity.id, new Map());
    }
    
    const entityComponents = this.components.get(entity.id)!;
    const componentType = component.constructor.name;
    
    entityComponents.set(componentType, component);
    component.onAdd();
    
    // Notify SystemManager about component addition
    if (this.systemNotifier) {
      this.systemNotifier.notifyComponentAdded(entity, component);
    }
    
    return component;
  }

  public getComponent<T extends Component>(entity: Entity, componentType: new (...args: any[]) => T): T | undefined {
    const entityComponents = this.components.get(entity.id);
    if (!entityComponents) return undefined;
    
    return entityComponents.get(componentType.name) as T | undefined;
  }

  public hasComponent<T extends Component>(entity: Entity, componentType: new (...args: any[]) => T): boolean {
    const entityComponents = this.components.get(entity.id);
    if (!entityComponents) return false;
    
    return entityComponents.has(componentType.name);
  }

  public removeComponent<T extends Component>(entity: Entity, componentType: new (...args: any[]) => T): void {
    const entityComponents = this.components.get(entity.id);
    if (!entityComponents) return;
    
    const component = entityComponents.get(componentType.name);
    if (component) {
      component.onRemove();
      entityComponents.delete(componentType.name);
      
      // Notify SystemManager about component removal
      if (this.systemNotifier) {
        this.systemNotifier.notifyComponentRemoved(entity, component);
      }
    }
  }

  public removeAllComponents(entity: Entity): void {
    const entityComponents = this.components.get(entity.id);
    if (!entityComponents) return;
    
    for (const component of entityComponents.values()) {
      component.onRemove();
    }
    
    this.components.delete(entity.id);
  }

  public getEntityComponents(entity: Entity): Component[] {
    const entityComponents = this.components.get(entity.id);
    return entityComponents ? Array.from(entityComponents.values()) : [];
  }
} 