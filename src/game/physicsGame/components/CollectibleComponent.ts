import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';

/**
 * Tag component that marks an entity as a collectible object (e.g., dropping box).
 */
export class CollectibleComponent extends Component {
  constructor(entity: Entity) {
    super(entity);
  }
}
