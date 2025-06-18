import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';
import { Color } from '../../ecs/components/Color';

export class RhythmNoteComponent extends Component {
  public lane: number; // 0-4 (lanes 1-5)
  public color: Color;
  public speed: number;
  public size: number;
  public isHit: boolean;
  public isActive: boolean;

  constructor(entity: Entity, lane: number, color?: Color, speed: number = 50, size: number = 50) {
    super(entity);
    this.lane = lane;
    this.color = color || this.getDefaultColorForLane(lane);
    this.speed = speed;
    this.size = size;
    this.isHit = false;
    this.isActive = true;
  }

  private getDefaultColorForLane(lane: number): Color {
    const colors = [
      Color.red(),
      Color.blue(),
      Color.green(),
      Color.yellow(),
      Color.magenta()
    ];
    return colors[lane] || Color.white();
  }

  public markAsHit(): void {
    this.isHit = true;
    this.isActive = false;
  }

  public markAsInactive(): void {
    this.isActive = false;
  }
} 