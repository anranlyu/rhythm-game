import { Event } from './Event';
import type { EventListener } from './EventListener';

export class EventManager {
  private static instance: EventManager;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventQueue: Event[] = [];

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public subscribe(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  public unsubscribe(eventType: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  public emit(event: Event): void {
    this.eventQueue.push(event);
  }

  public emitImmediate(event: Event): void {
    this.processEvent(event);
  }

  public processEvents(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }
  }

  private processEvent(event: Event): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener.handleEvent(event);
        } catch (error) {
          console.error(`Error processing event ${event.type}:`, error);
        }
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
    this.eventQueue.length = 0;
  }

  public getListenerCount(eventType: string): number {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size : 0;
  }

  public hasListeners(eventType: string): boolean {
    return this.getListenerCount(eventType) > 0;
  }
} 