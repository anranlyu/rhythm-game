import { Component } from '../ecs/Component';
import { Entity } from '../ecs/Entity';
import { Color } from '../ecs/components/Color';

export class RhythmLane extends Component {
  public laneIndex: number; // 0-4 (lanes 1-5)
  public width: number;
  public height: number;
  public x: number;
  public y: number;
  public color: Color;
  public keyBinding: string; // '1', '2', '3', '4', '5'

  constructor(entity: Entity, laneIndex: number, width: number, height: number, x: number, y: number) {
    super(entity);
    this.laneIndex = laneIndex;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = this.getDefaultColorForLane(laneIndex);
    this.keyBinding = (laneIndex + 1).toString(); // 1-5
  }

  private getDefaultColorForLane(laneIndex: number): Color {
    // Alternating gray shades for lanes
    return laneIndex % 2 === 0 ? Color.fromHex('#2a2a2a') : Color.fromHex('#1a1a1a');
  }

  public isKeyMatch(key: string): boolean {
    return key === this.keyBinding;
  }
} 