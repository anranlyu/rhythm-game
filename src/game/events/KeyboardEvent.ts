import { Event } from './Event';

export enum KeyState {
  PRESSED,
  RELEASED,
  HELD
}

export class KeyboardEvent extends Event {
  public static readonly KEY_PRESSED = 'KeyPressed';
  public static readonly KEY_RELEASED = 'KeyReleased';
  public static readonly KEY_HELD = 'KeyHeld';

  public readonly key: string;
  public readonly code: string;
  public readonly state: KeyState;
  public readonly originalEvent?: KeyboardEvent;

  constructor(type: string, key: string, code: string, state: KeyState, originalEvent?: KeyboardEvent) {
    super(type);
    this.key = this.normalizeKey(key);
    this.code = code;
    this.state = state;
    this.originalEvent = originalEvent;
  }

  private normalizeKey(key: string): string {
    // Normalize common keys
    const keyMap: { [key: string]: string } = {
      ' ': 'Space',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'Enter': 'Return',
      'Escape': 'Escape'
    };

    return keyMap[key] || key.toLowerCase();
  }

  public static createPressed(key: string, code: string, originalEvent?: KeyboardEvent): KeyboardEvent {
    return new KeyboardEvent(KeyboardEvent.KEY_PRESSED, key, code, KeyState.PRESSED, originalEvent);
  }

  public static createReleased(key: string, code: string, originalEvent?: KeyboardEvent): KeyboardEvent {
    return new KeyboardEvent(KeyboardEvent.KEY_RELEASED, key, code, KeyState.RELEASED, originalEvent);
  }

  public static createHeld(key: string, code: string, originalEvent?: KeyboardEvent): KeyboardEvent {
    return new KeyboardEvent(KeyboardEvent.KEY_HELD, key, code, KeyState.HELD, originalEvent);
  }

  public isPressed(): boolean {
    return this.state === KeyState.PRESSED;
  }

  public isReleased(): boolean {
    return this.state === KeyState.RELEASED;
  }

  public isHeld(): boolean {
    return this.state === KeyState.HELD;
  }

  public isKey(key: string): boolean {
    return this.key === key.toLowerCase() || this.code === key;
  }

  public isNumber(): boolean {
    return /^\d$/.test(this.key);
  }

  public getNumber(): number | null {
    return this.isNumber() ? parseInt(this.key) : null;
  }
} 