import { System } from '../../ecs/System';
import { ComponentManager } from '../../ecs/ComponentManager';
import { Transform } from '../../ecs/components/Transform';
import { Vector2 } from '../../ecs/components/Vector2';
import { RhythmNote } from '../RhythmNote';

export class RhythmNoteSystem extends System {
  private componentManager: ComponentManager;

  constructor() {
    super();
    this.componentManager = ComponentManager.getInstance();
    this.registerRequiredComponent(Transform);
    this.registerRequiredComponent(RhythmNote);
  }

  public update(deltaTime: number): void {
    for (const entity of this.entities) {
      const transform = this.componentManager.getComponent(entity, Transform);
      const note = this.componentManager.getComponent(entity, RhythmNote);

      if (!transform || !note || !note.isActive) continue;

      // Move note down
      const moveDistance = note.speed * deltaTime;
      transform.translate(new Vector2(0, moveDistance));

      // Check if note is off screen (missed)
      if (transform.position.y > 600) { // assuming screen height is 600
        note.markAsInactive();
        this.logger.debug(`Note in lane ${note.lane} missed`);
      }
    }
  }
} 