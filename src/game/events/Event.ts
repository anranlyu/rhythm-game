export abstract class Event {
  public readonly type: string;
  public readonly timestamp: number;
 
  constructor(type: string) {
    this.type = type;
    this.timestamp = performance.now();
  }
} 