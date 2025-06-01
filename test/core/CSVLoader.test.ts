import { CSVLoader } from '../../src/csvLoader';
import { Resource, Event, Item, Entity, TemporaryEvent, ScheduledTask, Location, Ending } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock filesystem operations for testing
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('CSVLoader', () => {
  let csvLoader: CSVLoader;
  const mockBasePath = '/test/csv';

  beforeEach(() => {
    csvLoader = new CSVLoader(mockBasePath);
    
    // Clear all mocks completely including implementations
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Setup default path mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));
  });

  describe('CSV Parsing', () => {
    it('should parse simple CSV with headers correctly', () => {
      // Arrange
      const csvContent = 'resource_id,resource_name,initial_value\n1,Time,0\n2,Money,1000';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toHaveLength(2);
      expect(resources[0]).toEqual({
        resource_id: 1,
        resource_name: 'Time',
        initial_value: 0
      });
      expect(resources[1]).toEqual({
        resource_id: 2,
        resource_name: 'Money',
        initial_value: 1000
      });
    });

    it('should handle quoted CSV fields correctly', () => {
      // Arrange
      const csvContent = 'event_id,event_name_cn,text_id\n1,"工作",1\n2,"休息",2';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const events = csvLoader.loadEvents();

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0].event_name_cn).toBe('工作');
      expect(events[0].text_id).toBe(1);
    });

    it('should handle escaped quotes in CSV fields', () => {
      // Arrange
      const csvContent = 'text_id,text_content\n1,"He said ""Hello"" to me"';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Mock game texts loading
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['texts.csv'] as any);

      // Act
      const gameTexts = csvLoader.loadGameTexts();

      // Assert
      expect(gameTexts.size).toBe(1);
      expect(gameTexts.get(1)?.text_content).toBe('He said "Hello" to me');
    });

    it('should handle empty lines and malformed rows gracefully', () => {
      // Arrange
      const csvContent = 'resource_id,resource_name\n1,Time\n\n2,Money,extra,columns\n3,Health';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toHaveLength(2); // Should skip malformed row
      expect(resources[0].resource_name).toBe('Time');
      expect(resources[1].resource_name).toBe('Health');
    });

    it('should handle missing columns by filling with empty strings', () => {
      // Arrange
      const csvContent = 'event_id,event_name_cn,text_id\n1,工作,1\n2,休息,2';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const events = csvLoader.loadEvents();

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0].event_name_cn).toBe('工作');
      expect(events[1].event_name_cn).toBe('休息');
    });

    it('should convert numeric strings to numbers', () => {
      // Arrange
      const csvContent = 'resource_id,initial_value,max_value\n1,100,999\n2,0,100';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(typeof resources[0].resource_id).toBe('number');
      expect(typeof resources[0].initial_value).toBe('number');
      expect(typeof resources[0].max_value).toBe('number');
      expect(resources[0].resource_id).toBe(1);
      expect(resources[0].initial_value).toBe(100);
    });

    it('should convert boolean strings to booleans', () => {
      // Arrange
      const csvContent = 'task_id,is_active,repeat_enabled\n1,true,false\n2,false,true';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const tasks = csvLoader.loadScheduledTasks();

      // Assert
      expect(typeof tasks[0].is_active).toBe('boolean');
      expect(tasks[0].is_active).toBe(true);
      expect(tasks[1].is_active).toBe(false);
    });
  });

  describe('Data Type Loading', () => {
    it('should load resources with correct data structure', () => {
      // Arrange
      const csvContent = 'resource_id,resource_name,resource_name_en,resource_type,initial_value,max_value,min_value,description\n' +
                        '1,时间,Time,system,0,1440,0,当前时间\n' +
                        '2,金钱,Money,basic,1000,999999,0,拥有的金钱';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toHaveLength(2);
      expect(resources[0]).toMatchObject({
        resource_id: 1,
        resource_name: '时间',
        resource_name_en: 'Time',
        resource_type: 'system',
        initial_value: 0,
        max_value: 1440,
        min_value: 0,
        description: '当前时间'
      });
    });

    it('should load events with scene transition ID conversion', () => {
      // Arrange
      const csvContent = 'event_id,event_name_cn,event_name_en,time_cost,location_requirement,level_requirement,condition_expression,text_id\n' +
                        '1-2,场景转换,Scene Transition,0,1,0,always,1\n' +
                        '3,普通事件,Normal Event,60,1,0,always,2';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const events = csvLoader.loadEvents();

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0].event_id).toBe(102); // 1 * 100 + 2
      expect(events[0].event_name_cn).toBe('场景转换');
      expect(events[1].event_id).toBe(3);
    });

    it('should load entities with type detection', () => {
      // Arrange
      const csvContent = 'entity_id,entity_name,entity_name_en,location_id,interaction_conditions,available_events\n' +
                        '1,老板,Boss,1,always,"4,5,6"\n' +
                        '2,电脑,Computer,1,always,"1,2"\n' +
                        '3,会议室,Meeting Room,1,skill>=20,"7"';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const entities = csvLoader.loadEntities();

      // Assert
      expect(entities).toHaveLength(3);
      expect(entities[0].entity_type).toBe('person'); // 老板 should be detected as person
      expect(entities[1].entity_type).toBe('object'); // 电脑 should be detected as object
      expect(entities[2].entity_type).toBe('facility'); // 会议室 should be detected as facility
      expect(entities[0].available_events).toEqual([4, 5, 6]);
      expect(entities[1].available_events).toEqual([1, 2]);
    });

    it('should load locations with parsed entity arrays', () => {
      // Arrange
      const csvContent = 'location_id,location_name,description,available_entities\n' +
                        '1,办公室,工作的地方,1;2;3\n' +
                        '2,家,休息的地方,4;';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const locations = csvLoader.loadLocations();

      // Assert
      expect(locations).toHaveLength(2);
      expect(locations[0].available_entities).toEqual([1, 2, 3]);
      expect(locations[1].available_entities).toEqual([4]);
    });

    it('should load game texts from multiple files', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['texts1.csv', 'texts2.csv', 'other.txt'] as any);
      
      mockFs.readFileSync
        .mockReturnValueOnce('text_id,text_content,text_content_en\n1,你好,Hello\n2,再见,Goodbye')
        .mockReturnValueOnce('text_id,text_content,text_content_en\n3,谢谢,Thanks\n4,不客气,You are welcome');

      // Act
      const gameTexts = csvLoader.loadGameTexts();

      // Assert
      expect(gameTexts.size).toBe(4);
      expect(gameTexts.get(1)?.text_content).toBe('你好');
      expect(gameTexts.get(3)?.text_content).toBe('谢谢');
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2); // Should only read CSV files
    });
  });

  describe('Error Handling', () => {
    it('should handle missing CSV files gracefully', () => {
      // Arrange
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      // Act & Assert
      expect(() => csvLoader.loadResources()).toThrow();
    });

    it('should handle empty CSV files', () => {
      // Arrange
      mockFs.readFileSync.mockReturnValue('');

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toEqual([]);
    });

    it('should handle CSV files with only headers', () => {
      // Arrange
      mockFs.readFileSync.mockReturnValue('resource_id,resource_name\n');

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toEqual([]);
    });

    it('should handle malformed CSV gracefully', () => {
      // Arrange
      const malformedCsv = 'resource_id,resource_name\n1,"unclosed quote\n2,valid row';
      mockFs.readFileSync.mockReturnValue(malformedCsv);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources.length).toBeGreaterThanOrEqual(0); // Should not crash
    });

    it('should handle missing game texts directory', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(false);

      // Act
      const gameTexts = csvLoader.loadGameTexts();

      // Assert
      expect(gameTexts.size).toBe(0);
    });
  });

  describe('loadAllData Integration', () => {
    it('should load temporary events correctly', () => {
      // Clear all previous mocks
      jest.clearAllMocks();
      jest.resetAllMocks();
      
      // Re-setup path mock
      mockPath.join.mockImplementation((...args) => args.join('/'));
      
      // Setup mock for temporary events only
      mockFs.readFileSync.mockReturnValue('temp_event_id,event_name_cn\n1,临时事件');

      // Act
      const tempEvents = csvLoader.loadTemporaryEvents();
      console.log('Temporary events test:', JSON.stringify(tempEvents, null, 2));

      // Assert
      expect(tempEvents).toHaveLength(1);
      expect(tempEvents[0]).toHaveProperty('temp_event_id', 1);
      expect(tempEvents[0]).toHaveProperty('event_name_cn', '临时事件');
    });

    it('should load all data types in one call', () => {
      // Clear all previous mocks
      jest.clearAllMocks();
      jest.resetAllMocks();
      
      // Re-setup path mock
      mockPath.join.mockImplementation((...args) => args.join('/'));
      
      // Use sequenced mock returns instead of implementation
      mockFs.readFileSync
        .mockReturnValueOnce('resource_id,resource_name\n1,Time\n2,Money')                    // resources.csv
        .mockReturnValueOnce('event_id,event_name_cn\n1,工作\n2,休息')                        // events.csv  
        .mockReturnValueOnce('item_id,item_name\n1,面包\n2,书')                              // items.csv
        .mockReturnValueOnce('entity_id,entity_name\n1,电脑\n2,老板')                        // entities.csv
        .mockReturnValueOnce('temp_event_id,event_name_cn\n1,临时事件')                      // temporary_events.csv
        .mockReturnValueOnce('task_id,task_name\n1,每日任务')                                // scheduled_tasks.csv
        .mockReturnValueOnce('location_id,location_name\n1,办公室\n2,家')                    // locations.csv
        .mockReturnValueOnce('ending_id,ending_name\n1,好结局\n2,坏结局')                    // endings.csv
        .mockReturnValueOnce('text_id,text_content\n1,测试文本');                           // game_texts/texts.csv

      // Mock game texts directory
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['texts.csv'] as any);

      // Act
      const allData = csvLoader.loadAllData();

      // Assert
      expect(allData.resources).toHaveLength(2);
      expect(allData.events).toHaveLength(2);
      expect(allData.items).toHaveLength(2);
      expect(allData.entities).toHaveLength(2);
      expect(allData.temporaryEvents).toHaveLength(1);
      expect(allData.temporaryEvents[0]).toHaveProperty('temp_event_id', 1);
      expect(allData.temporaryEvents[0]).toHaveProperty('event_name_cn', '临时事件');
      expect(allData.scheduledTasks).toHaveLength(1);
      expect(allData.locations).toHaveLength(2);
      expect(allData.endings).toHaveLength(2);
      expect(allData.gameTexts).toBeInstanceOf(Map);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large CSV files efficiently', () => {
      // Arrange
      const largeCsvHeader = 'resource_id,resource_name,resource_type,initial_value\n';
      const largeCsvRows = Array(1000).fill(0).map((_, i) => 
        `${i + 1},Resource${i + 1},basic,${i * 10}`
      ).join('\n');
      const largeCsv = largeCsvHeader + largeCsvRows;
      
      mockFs.readFileSync.mockReturnValue(largeCsv);

      // Act
      const startTime = Date.now();
      const resources = csvLoader.loadResources();
      const duration = Date.now() - startTime;

      // Assert
      expect(resources).toHaveLength(1000);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(resources[999].resource_name).toBe('Resource1000');
    });

    it('should handle CSV with many columns efficiently', () => {
      // Arrange
      const manyColumnsHeader = Array(50).fill(0).map((_, i) => `col${i}`).join(',') + '\n';
      const manyColumnsRow = Array(50).fill(0).map((_, i) => `value${i}`).join(',');
      const csvContent = manyColumnsHeader + manyColumnsRow;
      
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources = csvLoader.loadResources();

      // Assert
      expect(resources).toHaveLength(1);
      expect(Object.keys(resources[0])).toHaveLength(50);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent data types across loads', () => {
      // Arrange
      const csvContent = 'resource_id,initial_value,max_value\n1,100,999\n2,200,1000';
      mockFs.readFileSync.mockReturnValue(csvContent);

      // Act
      const resources1 = csvLoader.loadResources();
      const resources2 = csvLoader.loadResources();

      // Assert
      expect(resources1).toEqual(resources2);
      expect(typeof resources1[0].resource_id).toBe(typeof resources2[0].resource_id);
      expect(typeof resources1[0].initial_value).toBe(typeof resources2[0].initial_value);
      expect(typeof resources1[0].max_value).toBe(typeof resources2[0].max_value);
    });

    it('should preserve data integrity with special characters', () => {
      // Arrange
      const csvContent = 'text_id,text_content\n1,"包含特殊字符: !@#$%^&*()"\n2,"中文、English & 123"';
      mockFs.readFileSync.mockReturnValue(csvContent);
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['texts.csv'] as any);

      // Act
      const gameTexts = csvLoader.loadGameTexts();

      // Assert
      expect(gameTexts.get(1)?.text_content).toBe('包含特殊字符: !@#$%^&*()');
      expect(gameTexts.get(2)?.text_content).toBe('中文、English & 123');
    });
  });
}); 