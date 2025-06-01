import {
  Resource,
  Event,
  Item,
  Entity,
  TemporaryEvent,
  ScheduledTask,
  Location,
  Ending,
  GameText
} from '../types';
import { CSVLoader } from '../csvLoader';
import { Language, getResourceName, getTaskName, getEventName, getLocalizedText } from '../utils';

export class GameDataManager {
  private resources: Map<number, Resource> = new Map();
  private events: Map<number, Event> = new Map();
  private items: Map<number, Item> = new Map();
  private entities: Map<number, Entity> = new Map();
  private temporaryEvents: Map<number, TemporaryEvent> = new Map();
  private scheduledTasks: Map<number, ScheduledTask> = new Map();
  private locations: Map<number, Location> = new Map();
  private endings: Map<number, Ending> = new Map();
  private gameTexts: Map<number, GameText> = new Map();

  constructor() {
    this.loadGameData();
  }

  private loadGameData() {
    const loader = new CSVLoader();
    const data = loader.loadAllData();
    
    // Convert arrays to maps for efficient lookup
    data.resources.forEach(r => this.resources.set(r.resource_id, r));
    data.events.forEach(e => this.events.set(e.event_id, e));
    data.items.forEach(i => this.items.set(i.item_id, i));
    data.entities.forEach(e => this.entities.set(e.entity_id, e));
    data.temporaryEvents.forEach(t => this.temporaryEvents.set(t.temp_event_id, t));
    data.scheduledTasks.forEach(s => this.scheduledTasks.set(s.task_id, s));
    data.locations.forEach(l => this.locations.set(l.location_id, l));
    data.endings.forEach(e => this.endings.set(e.ending_id, e));
    this.gameTexts = data.gameTexts;
  }

  // Getter methods
  getResource(id: number): Resource | undefined {
    return this.resources.get(id);
  }

  getEvent(id: number): Event | undefined {
    return this.events.get(id);
  }

  getItem(id: number): Item | undefined {
    return this.items.get(id);
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getTemporaryEvent(id: number): TemporaryEvent | undefined {
    return this.temporaryEvents.get(id);
  }

  getScheduledTask(id: number): ScheduledTask | undefined {
    return this.scheduledTasks.get(id);
  }

  getLocation(id: number): Location | undefined {
    return this.locations.get(id);
  }

  getEnding(id: number): Ending | undefined {
    return this.endings.get(id);
  }

  getGameText(id: number): GameText | undefined {
    return this.gameTexts.get(id);
  }

  // Collection getters
  getAllResources(): Map<number, Resource> {
    return this.resources;
  }

  getAllEvents(): Map<number, Event> {
    return this.events;
  }

  getAllItems(): Map<number, Item> {
    return this.items;
  }

  getAllEntities(): Map<number, Entity> {
    return this.entities;
  }

  getAllTemporaryEvents(): Map<number, TemporaryEvent> {
    return this.temporaryEvents;
  }

  getAllScheduledTasks(): Map<number, ScheduledTask> {
    return this.scheduledTasks;
  }

  getAllLocations(): Map<number, Location> {
    return this.locations;
  }

  getAllEndings(): Map<number, Ending> {
    return this.endings;
  }

  getAllGameTexts(): Map<number, GameText> {
    return this.gameTexts;
  }

  // Localized getter methods
  getResourceName(id: number, language: Language = 'zh'): string {
    const resource = this.getResource(id);
    return resource ? getResourceName(resource, language) : `Resource ${id}`;
  }

  getTaskName(id: number, language: Language = 'zh'): string {
    const task = this.getScheduledTask(id);
    return task ? getTaskName(task, language) : `Task ${id}`;
  }

  getTemporaryEventName(id: number, language: Language = 'zh'): string {
    const event = this.getTemporaryEvent(id);
    return event ? getEventName(event, language) : `Event ${id}`;
  }

  getLocalizedGameText(id: number, language: Language = 'zh'): string {
    const gameText = this.getGameText(id);
    return gameText ? getLocalizedText(gameText, language) : `Text ${id}`;
  }
} 