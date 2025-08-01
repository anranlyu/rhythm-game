import { System } from './System';
import { Entity } from './Entity';
import { Component } from './Component';
import { ComponentManager } from './ComponentManager';
import { PerformanceMetrics } from '../utils/PerformanceMetrics';

export class SystemManager {
  private static instance: SystemManager;
  private systems: System[] = [];
  private componentManager: ComponentManager;
  private performanceMetrics: PerformanceMetrics;

  private constructor() {
    this.componentManager = ComponentManager.getInstance();
    this.performanceMetrics = PerformanceMetrics.getInstance();
  }

  public static getInstance(): SystemManager {
    if (!SystemManager.instance) {
      SystemManager.instance = new SystemManager();
    }
    return SystemManager.instance;
  }

  public addSystem(system: System): void {
    this.systems.push(system);
  }

  public removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
    }
  }

  public cleanup(): void {
    this.systems = [];
  }

  public update(deltaTime: number): void {
    this.updateSystems(deltaTime);
  }

  public updateSystems(deltaTime: number): void {
    for (const system of this.systems) {
      const systemName = system.constructor.name;
      const guard = this.performanceMetrics.createPerformanceGuard(systemName);
      
      try {
        system.update(deltaTime);
      } catch (error) {
        console.error(`Error in system ${systemName}:`, error);
      } finally {
        guard.dispose();
      }
    }
  }

  public notifyEntityAdded(entity: Entity): void {
    for (const system of this.systems) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
    }
  }

  public notifyEntityRemoved(entity: Entity): void {
    for (const system of this.systems) {
      system.removeEntity(entity);
    }
  }

  public notifyComponentAdded(entity: Entity, component: Component): void {
    for (const system of this.systems) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
      system.onComponentAdded(entity, component);
    }
  }

  public notifyComponentRemoved(entity: Entity, component: Component): void {
    for (const system of this.systems) {
      if (!this.entityMatchesSystem(entity, system)) {
        system.removeEntity(entity);
      }
      system.onComponentRemoved(entity, component);
    }
  }

  private entityMatchesSystem(entity: Entity, system: System): boolean {
    const requiredComponents = (system as any).requiredComponents || [];
    
    for (const componentType of requiredComponents) {
      if (!this.componentManager.hasComponent(entity, componentType)) {
        return false;
      }
    }
    
    return true;
  }
} 