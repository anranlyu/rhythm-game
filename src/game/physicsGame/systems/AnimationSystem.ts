import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { AnimationComponent } from '../components/AnimationComponent';

export class AnimationSystem extends System {
  private componentManager: ComponentManager;

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    
    // Register required components
    this.registerRequiredComponent(AnimationComponent);
  }

  public update(deltaTime: number): void {
    // Update all entities with animation components
    for (const entity of this.entities) {
      const animationComponent = this.componentManager.getComponent(entity, AnimationComponent);
      
      if (animationComponent) {
        // Update the animation
        animationComponent.updateAnimation(deltaTime);
      }
    }
  }
} 