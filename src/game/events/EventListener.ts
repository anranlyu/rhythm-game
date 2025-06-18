import { Event } from './Event';

export interface EventListener {
  handleEvent(event: Event): void;
} 