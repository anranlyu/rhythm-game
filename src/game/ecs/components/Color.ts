export class Color {
  public r: number; // 0-255
  public g: number; // 0-255
  public b: number; // 0-255
  public a: number; // 0-255

  constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 255) {
    this.r = Math.max(0, Math.min(255, Math.floor(r)));
    this.g = Math.max(0, Math.min(255, Math.floor(g)));
    this.b = Math.max(0, Math.min(255, Math.floor(b)));
    this.a = Math.max(0, Math.min(255, Math.floor(a)));
  }

  public static white(): Color {
    return new Color(255, 255, 255, 255);
  }

  public static black(): Color {
    return new Color(0, 0, 0, 255);
  }

  public static red(): Color {
    return new Color(255, 0, 0, 255);
  }

  public static green(): Color {
    return new Color(0, 255, 0, 255);
  }

  public static blue(): Color {
    return new Color(0, 0, 255, 255);
  }

  public static yellow(): Color {
    return new Color(255, 255, 0, 255);
  }

  public static cyan(): Color {
    return new Color(0, 255, 255, 255);
  }

  public static magenta(): Color {
    return new Color(255, 0, 255, 255);
  }

  public static transparent(): Color {
    return new Color(0, 0, 0, 0);
  }

  public static fromHex(hex: string): Color {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = cleanHex.length === 8 ? parseInt(cleanHex.substring(6, 8), 16) : 255;
    return new Color(r, g, b, a);
  }

  public static fromRgbNormalized(r: number, g: number, b: number, a: number = 1): Color {
    return new Color(r * 255, g * 255, b * 255, a * 255);
  }

  public toHex(): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(this.a)}`;
  }

  public toRgb(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  public toRgba(): string {
    const alpha = this.a / 255;
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
  }

  public toPixiColor(): number {
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  public getNormalized(): { r: number; g: number; b: number; a: number } {
    return {
      r: this.r / 255,
      g: this.g / 255,
      b: this.b / 255,
      a: this.a / 255
    };
  }

  public copy(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }

  public equals(other: Color): boolean {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }

  public lerp(other: Color, t: number): Color {
    t = Math.max(0, Math.min(1, t));
    return new Color(
      this.r + (other.r - this.r) * t,
      this.g + (other.g - this.g) * t,
      this.b + (other.b - this.b) * t,
      this.a + (other.a - this.a) * t
    );
  }

  public toString(): string {
    return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
} 