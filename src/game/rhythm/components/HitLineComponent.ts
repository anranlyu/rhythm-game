import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';
import { Color } from '../../ecs/components/Color';

export class HitLineComponent extends Component {
  public y: number;
  public width: number;
  public height: number;
  public color: Color;
  public hitTolerance: number; // pixels above/below the line that count as hits

  constructor(entity: Entity, y: number, width: number, height: number = 5, hitTolerance: number = 25) {
    super(entity);
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = Color.white();
    this.hitTolerance = hitTolerance;
  }

  public isNoteInHitZone(noteY: number, noteSize: number): boolean {    
    const noteCenter = noteY + noteSize / 2;
    
    return Math.abs(noteCenter - this.y) <= this.hitTolerance;
  }
} 