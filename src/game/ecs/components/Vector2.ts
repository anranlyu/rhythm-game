export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  public static one(): Vector2 {
    return new Vector2(1, 1);
  }

  public static up(): Vector2 {
    return new Vector2(0, -1);
  }

  public static down(): Vector2 {
    return new Vector2(0, 1);
  }

  public static left(): Vector2 {
    return new Vector2(-1, 0);
  }

  public static right(): Vector2 {
    return new Vector2(1, 0);
  }

  public add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public divide(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) return Vector2.zero();
    return this.divide(mag);
  }

  public distance(other: Vector2): number {
    return this.subtract(other).magnitude();
  }

  public distanceSquared(other: Vector2): number {
    return this.subtract(other).magnitudeSquared();
  }

  public lerp(other: Vector2, t: number): Vector2 {
    t = Math.max(0, Math.min(1, t));
    return new Vector2(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  public copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }
} 