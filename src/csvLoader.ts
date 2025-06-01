import { 
  readFileSync, 
  existsSync, 
  readdirSync 
} from 'fs';
import { join } from 'path';
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

export class CSVLoader {
  private basePath: string;

  constructor(basePath: string = join(process.cwd(), 'csv')) {
    this.basePath = basePath;
  }

  private parseCSV<T>(filePath: string): T[] {
    const content = readFileSync(filePath, 'utf-8');
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

  loadResources(): Resource[] {
    return this.parseCSV<Resource>(join(this.basePath, 'resources.csv'));
  }

  loadEvents(): Event[] {
    const events = this.parseCSV<Event>(join(this.basePath, 'events.csv'));
    // Convert string event IDs that include scene transitions
    return events.map(event => {
      if (typeof event.event_id === 'string' && (event.event_id as string).includes('-')) {
        const [from, to] = (event.event_id as string).split('-').map(Number);
        event.event_id = from * 100 + to; // Generate unique ID for scene transitions
      }
      return event;
    });
  }

  loadItems(): Item[] {
    return this.parseCSV<Item>(join(this.basePath, 'items.csv'));
  }

  loadEntities(): Entity[] {
    const rawEntities = this.parseCSV<any>(join(this.basePath, 'entities.csv'));
    return rawEntities.map(rawEntity => {
      // Determine entity type based on entity name
      let entityType: 'person' | 'object' | 'facility' = 'object';
      const entityName = rawEntity.entity_name.toLowerCase();
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
        interaction_requirements: rawEntity.interaction_conditions || 'always'
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

  loadTemporaryEvents(): TemporaryEvent[] {
    return this.parseCSV<TemporaryEvent>(join(this.basePath, 'temporary_events.csv'));
  }

  loadScheduledTasks(): ScheduledTask[] {
    return this.parseCSV<ScheduledTask>(join(this.basePath, 'scheduled_tasks.csv'));
  }

  loadLocations(): Location[] {
    const locations = this.parseCSV<Location>(join(this.basePath, 'locations.csv'));
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

  loadEndings(): Ending[] {
    return this.parseCSV<Ending>(join(this.basePath, 'endings.csv'));
  }

  loadGameTexts(): Map<number, GameText> {
    const textsMap = new Map<number, GameText>();
    const gameTextsDir = join(this.basePath, 'game_texts');
    
    // Load all game_texts files
    if (existsSync(gameTextsDir)) {
      const files = readdirSync(gameTextsDir).filter(f => f.endsWith('.csv'));
      for (const file of files) {
        const texts = this.parseCSV<GameText>(join(gameTextsDir, file));
        texts.forEach(text => {
          textsMap.set(text.text_id, text);
        });
      }
    }

    return textsMap;
  }

  // Helper method to load all data at once
  loadAllData() {
    return {
      resources: this.loadResources(),
      events: this.loadEvents(),
      items: this.loadItems(),
      entities: this.loadEntities(),
      temporaryEvents: this.loadTemporaryEvents(),
      scheduledTasks: this.loadScheduledTasks(),
      locations: this.loadLocations(),
      endings: this.loadEndings(),
      gameTexts: this.loadGameTexts()
    };
  }
} 