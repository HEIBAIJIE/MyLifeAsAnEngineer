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
import { Language, getResourceName, getTaskName, getEventName, getLocalizedText } from '../utils';

// 条件导入：在浏览器环境中使用浏览器版本的CSVLoader
declare const window: any;
let CSVLoader: any;
if (typeof window !== 'undefined') {
  // 浏览器环境
  CSVLoader = require('../csvLoader.browser').CSVLoader;
} else {
  // Node.js环境
  CSVLoader = require('../csvLoader').CSVLoader;
}

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
    
    console.log('Loading game data...');
    console.log('Events from CSV loader:', data.events.length);
    console.log('First 10 events:', data.events.slice(0, 10));
    
    // Convert arrays to maps for efficient lookup
    data.resources.forEach((r: Resource) => this.resources.set(r.resource_id, r));
    data.events.forEach((e: Event) => {
      console.log(`Loading event ${e.event_id}: ${e.event_name_cn}`);
      this.events.set(e.event_id, e);
    });
    data.items.forEach((i: Item) => this.items.set(i.item_id, i));
    data.entities.forEach((e: Entity) => this.entities.set(e.entity_id, e));
    data.temporaryEvents.forEach((t: TemporaryEvent) => this.temporaryEvents.set(t.temp_event_id, t));
    data.scheduledTasks.forEach((s: ScheduledTask) => this.scheduledTasks.set(s.task_id, s));
    data.locations.forEach((l: Location) => this.locations.set(l.location_id, l));
    data.endings.forEach((e: Ending) => this.endings.set(e.ending_id, e));
    this.gameTexts = data.gameTexts;
    
    console.log('Game data loaded:', {
      resources: this.resources.size,
      events: this.events.size,
      items: this.items.size,
      entities: this.entities.size,
      temporaryEvents: this.temporaryEvents.size,
      scheduledTasks: this.scheduledTasks.size,
      locations: this.locations.size,
      endings: this.endings.size,
      gameTexts: this.gameTexts.size
    });
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