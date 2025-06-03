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
} from './types';

// 浏览器版本的CSVLoader，使用fetch加载CSV文件
export class CSVLoader {
  private basePath: string;

  constructor(basePath: string = './csv') {
    this.basePath = basePath;
  }

  private async fetchCSV(filePath: string): Promise<string> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
    }
    return response.text();
  }

  private async parseCSV<T>(filePath: string): Promise<T[]> {
    const content = await this.fetchCSV(filePath);
    const lines = content.split(/\r?\n/).filter((line: string) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h: string) => h.trim());
    const records: T[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      // Fill missing columns with empty strings
      while (values.length < headers.length) {
        values.push('');
      }
      
      // Skip lines that have too many columns (malformed)
      if (values.length > headers.length) continue;

      const record: any = {};
      headers.forEach((header: string, index: number) => {
        const value = values[index].trim();
        // Parse boolean values
        if (value === 'true') record[header] = true;
        else if (value === 'false') record[header] = false;
        // Parse numbers
        else if (value !== '' && !isNaN(Number(value))) record[header] = Number(value);
        // Keep as string
        else record[header] = value;
      });
      records.push(record as T);
    }

    return records;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  async loadResources(): Promise<Resource[]> {
    return this.parseCSV<Resource>(`${this.basePath}/resources.csv`);
  }

  async loadEvents(): Promise<Event[]> {
    const events = await this.parseCSV<Event>(`${this.basePath}/events.csv`);
    // Convert string event IDs that include scene transitions
    return events.map(event => {
      if (typeof event.event_id === 'string' && (event.event_id as string).includes('-')) {
        const [from, to] = (event.event_id as string).split('-').map(Number);
        event.event_id = from * 100 + to; // Generate unique ID for scene transitions
      }
      return event;
    });
  }

  async loadItems(): Promise<Item[]> {
    return this.parseCSV<Item>(`${this.basePath}/items.csv`);
  }

  async loadEntities(): Promise<Entity[]> {
    const rawEntities = await this.parseCSV<any>(`${this.basePath}/entities.csv`);
    return rawEntities.map(rawEntity => {
      // Determine entity type based on entity name
      let entityType: 'person' | 'object' | 'facility' = 'object';
      const entityName = rawEntity.entity_name?.toLowerCase() || '';
      if (entityName.includes('老板') || entityName.includes('同事') || entityName.includes('售货员') || 
          entityName.includes('服务员') || entityName.includes('医生') || entityName.includes('护士') || 
          entityName.includes('路人')) {
        entityType = 'person';
      } else if (entityName.includes('会议室') || entityName.includes('走廊') || entityName.includes('厕所') || 
                 entityName.includes('食堂') || entityName.includes('长椅') || entityName.includes('街道')) {
        entityType = 'facility';
      }

      // Map CSV field names to Entity interface fields
      const entity: Entity = {
        entity_id: rawEntity.entity_id,
        entity_name: rawEntity.entity_name,
        entity_name_en: rawEntity.entity_name_en,
        entity_type: entityType,
        location: rawEntity.location_id,
        available_events: [],
        interaction_requirements: rawEntity.interaction_conditions || 'always',
        description: rawEntity.description,
        description_en: rawEntity.description_en
      };

      // Parse available_events string (comma-separated in quotes)
      if (typeof rawEntity.available_events === 'string') {
        const eventsStr = rawEntity.available_events.replace(/"/g, ''); // Remove quotes
        entity.available_events = eventsStr
          .split(',')
          .map((e: string) => parseInt(e.trim()))
          .filter((e: number) => !isNaN(e));
      }

      return entity;
    });
  }

  async loadTemporaryEvents(): Promise<TemporaryEvent[]> {
    return this.parseCSV<TemporaryEvent>(`${this.basePath}/temporary_events.csv`);
  }

  async loadScheduledTasks(): Promise<ScheduledTask[]> {
    return this.parseCSV<ScheduledTask>(`${this.basePath}/scheduled_tasks.csv`);
  }

  async loadLocations(): Promise<Location[]> {
    const locations = await this.parseCSV<Location>(`${this.basePath}/locations.csv`);
    return locations.map(location => {
      // Parse available_entities array
      if (typeof location.available_entities === 'string') {
        location.available_entities = (location.available_entities as string)
          .split(';')
          .map(e => parseInt(e.trim()))
          .filter(e => !isNaN(e));
      }
      return location;
    });
  }

  async loadEndings(): Promise<Ending[]> {
    return this.parseCSV<Ending>(`${this.basePath}/endings.csv`);
  }

  async loadGameTexts(): Promise<Map<number, GameText>> {
    const textsMap = new Map<number, GameText>();
    
    // In browser environment, we need to know the game_texts files beforehand
    // or use a directory listing API. For now, we'll try to load known files
    const gameTextFiles = [
      'game_texts1~20.csv',
      'game_texts21~40.csv',
      'game_texts41~60.csv',
      'game_texts61~80.csv',
      'game_texts81~100.csv',
      'game_texts101~120.csv',
      'game_texts121~140.csv',
      'game_texts141~160.csv',
      'game_texts161~180.csv',
      'game_texts181~200.csv',
      'game_texts201~220.csv',
      'game_texts221~240.csv',
      'game_texts241~260.csv',
      'game_texts301~320.csv',
      'game_texts501~520.csv',
      'game_texts521~540.csv'
    ];

    for (const file of gameTextFiles) {
      try {
        const texts = await this.parseCSV<GameText>(`${this.basePath}/game_texts/${file}`);
        texts.forEach(text => {
          textsMap.set(text.text_id, text);
        });
      } catch (error) {
        // File might not exist, continue with others
        console.warn(`Could not load game_texts file: ${file}`);
      }
    }

    return textsMap;
  }

  // Helper method to load all data at once
  async loadAllData() {
    const [
      resources,
      events,
      items,
      entities,
      temporaryEvents,
      scheduledTasks,
      locations,
      endings,
      gameTexts
    ] = await Promise.all([
      this.loadResources(),
      this.loadEvents(),
      this.loadItems(),
      this.loadEntities(),
      this.loadTemporaryEvents(),
      this.loadScheduledTasks(),
      this.loadLocations(),
      this.loadEndings(),
      this.loadGameTexts()
    ]);

    return {
      resources,
      events,
      items,
      entities,
      temporaryEvents,
      scheduledTasks,
      locations,
      endings,
      gameTexts
    };
  }
}