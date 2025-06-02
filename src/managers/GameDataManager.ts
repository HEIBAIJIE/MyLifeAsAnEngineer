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
  private dataLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.loadGameData();
  }

  private loadGameData() {
    const loader = new CSVLoader();
    
    // Check if we're in browser environment and need async loading
    if (typeof window !== 'undefined') {
      this.loadingPromise = this.loadGameDataAsync(loader);
    } else {
      this.loadGameDataSync(loader);
    }
  }

  private async loadGameDataAsync(loader: any) {
    try {
      const data = await loader.loadAllData();
      this.processLoadedData(data);
    } catch (error) {
      console.error('Error loading game data:', error);
      throw error;
    }
  }

  private loadGameDataSync(loader: any) {
    const data = loader.loadAllData();
    this.processLoadedData(data);
  }

  private processLoadedData(data: any) {
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

    this.dataLoaded = true;
  }

  // Method to ensure data is loaded before accessing it
  async ensureDataLoaded(): Promise<void> {
    if (this.dataLoaded) {
      return;
    }
    if (this.loadingPromise) {
      await this.loadingPromise;
    }
    if (!this.dataLoaded) {
      throw new Error('Game data failed to load');
    }
  }

  // Async getter methods for browser compatibility
  async getResourceAsync(id: number): Promise<Resource | undefined> {
    await this.ensureDataLoaded();
    return this.resources.get(id);
  }

  async getEventAsync(id: number): Promise<Event | undefined> {
    await this.ensureDataLoaded();
    return this.events.get(id);
  }

  async getItemAsync(id: number): Promise<Item | undefined> {
    await this.ensureDataLoaded();
    return this.items.get(id);
  }

  async getEntityAsync(id: number): Promise<Entity | undefined> {
    await this.ensureDataLoaded();
    return this.entities.get(id);
  }

  async getTemporaryEventAsync(id: number): Promise<TemporaryEvent | undefined> {
    await this.ensureDataLoaded();
    return this.temporaryEvents.get(id);
  }

  async getScheduledTaskAsync(id: number): Promise<ScheduledTask | undefined> {
    await this.ensureDataLoaded();
    return this.scheduledTasks.get(id);
  }

  async getLocationAsync(id: number): Promise<Location | undefined> {
    await this.ensureDataLoaded();
    return this.locations.get(id);
  }

  async getEndingAsync(id: number): Promise<Ending | undefined> {
    await this.ensureDataLoaded();
    return this.endings.get(id);
  }

  async getGameTextAsync(id: number): Promise<GameText | undefined> {
    await this.ensureDataLoaded();
    return this.gameTexts.get(id);
  }

  // Synchronous getter methods (for backward compatibility, will throw if data not loaded in browser)
  getResource(id: number): Resource | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getResourceAsync() in browser environment.');
    }
    return this.resources.get(id);
  }

  getEvent(id: number): Event | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getEventAsync() in browser environment.');
    }
    return this.events.get(id);
  }

  getItem(id: number): Item | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getItemAsync() in browser environment.');
    }
    return this.items.get(id);
  }

  getEntity(id: number): Entity | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getEntityAsync() in browser environment.');
    }
    return this.entities.get(id);
  }

  getTemporaryEvent(id: number): TemporaryEvent | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getTemporaryEventAsync() in browser environment.');
    }
    return this.temporaryEvents.get(id);
  }

  getScheduledTask(id: number): ScheduledTask | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getScheduledTaskAsync() in browser environment.');
    }
    return this.scheduledTasks.get(id);
  }

  getLocation(id: number): Location | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getLocationAsync() in browser environment.');
    }
    return this.locations.get(id);
  }

  getEnding(id: number): Ending | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getEndingAsync() in browser environment.');
    }
    return this.endings.get(id);
  }

  getGameText(id: number): GameText | undefined {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getGameTextAsync() in browser environment.');
    }
    return this.gameTexts.get(id);
  }

  // Collection getters
  async getAllResourcesAsync(): Promise<Map<number, Resource>> {
    await this.ensureDataLoaded();
    return this.resources;
  }

  async getAllEventsAsync(): Promise<Map<number, Event>> {
    await this.ensureDataLoaded();
    return this.events;
  }

  async getAllItemsAsync(): Promise<Map<number, Item>> {
    await this.ensureDataLoaded();
    return this.items;
  }

  async getAllEntitiesAsync(): Promise<Map<number, Entity>> {
    await this.ensureDataLoaded();
    return this.entities;
  }

  async getAllTemporaryEventsAsync(): Promise<Map<number, TemporaryEvent>> {
    await this.ensureDataLoaded();
    return this.temporaryEvents;
  }

  async getAllScheduledTasksAsync(): Promise<Map<number, ScheduledTask>> {
    await this.ensureDataLoaded();
    return this.scheduledTasks;
  }

  async getAllLocationsAsync(): Promise<Map<number, Location>> {
    await this.ensureDataLoaded();
    return this.locations;
  }

  async getAllEndingsAsync(): Promise<Map<number, Ending>> {
    await this.ensureDataLoaded();
    return this.endings;
  }

  async getAllGameTextsAsync(): Promise<Map<number, GameText>> {
    await this.ensureDataLoaded();
    return this.gameTexts;
  }

  // Synchronous collection getters (for backward compatibility)
  getAllResources(): Map<number, Resource> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllResourcesAsync() in browser environment.');
    }
    return this.resources;
  }

  getAllEvents(): Map<number, Event> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllEventsAsync() in browser environment.');
    }
    return this.events;
  }

  getAllItems(): Map<number, Item> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllItemsAsync() in browser environment.');
    }
    return this.items;
  }

  getAllEntities(): Map<number, Entity> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllEntitiesAsync() in browser environment.');
    }
    return this.entities;
  }

  getAllTemporaryEvents(): Map<number, TemporaryEvent> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllTemporaryEventsAsync() in browser environment.');
    }
    return this.temporaryEvents;
  }

  getAllScheduledTasks(): Map<number, ScheduledTask> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllScheduledTasksAsync() in browser environment.');
    }
    return this.scheduledTasks;
  }

  getAllLocations(): Map<number, Location> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllLocationsAsync() in browser environment.');
    }
    return this.locations;
  }

  getAllEndings(): Map<number, Ending> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllEndingsAsync() in browser environment.');
    }
    return this.endings;
  }

  getAllGameTexts(): Map<number, GameText> {
    if (!this.dataLoaded && typeof window !== 'undefined') {
      throw new Error('Game data not loaded yet. Use getAllGameTextsAsync() in browser environment.');
    }
    return this.gameTexts;
  }

  // Localized getter methods
  async getResourceNameAsync(id: number, language: Language = 'zh'): Promise<string> {
    const resource = await this.getResourceAsync(id);
    return resource ? getResourceName(resource, language) : `Resource ${id}`;
  }

  async getTaskNameAsync(id: number, language: Language = 'zh'): Promise<string> {
    const task = await this.getScheduledTaskAsync(id);
    return task ? getTaskName(task, language) : `Task ${id}`;
  }

  async getTemporaryEventNameAsync(id: number, language: Language = 'zh'): Promise<string> {
    const event = await this.getTemporaryEventAsync(id);
    return event ? getEventName(event, language) : `Event ${id}`;
  }

  async getLocalizedGameTextAsync(id: number, language: Language = 'zh'): Promise<string> {
    const gameText = await this.getGameTextAsync(id);
    return gameText ? getLocalizedText(gameText, language) : `Text ${id}`;
  }

  // Synchronous localized getters (for backward compatibility)
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