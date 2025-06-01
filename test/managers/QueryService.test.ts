import { QueryService } from '../../src/managers/QueryService';
import { GameDataManager } from '../../src/managers/GameDataManager';
import { ResourceManager } from '../../src/managers/ResourceManager';
import { TimeManager } from '../../src/managers/TimeManager';
import { TestDataProvider } from '../test-helpers/TestDataProvider';
import { Event, Resource, Location, Entity, Item } from '../../src/types';

describe('QueryService', () => {
  let queryService: QueryService;
  let mockDataManager: jest.Mocked<GameDataManager>;
  let mockResourceManager: jest.Mocked<ResourceManager>;
  let mockTimeManager: jest.Mocked<TimeManager>;

  beforeEach(() => {
    // Create mock managers
    mockDataManager = {
      getResource: jest.fn(),
      getLocation: jest.fn(),
      getEntity: jest.fn(),
      getItem: jest.fn(),
      getAllEvents: jest.fn(),
      getAllResources: jest.fn(),
      getAllItems: jest.fn()
    } as any;

    mockResourceManager = {
      getResourceValue: jest.fn(),
      getAllResourceValues: jest.fn(),
      isGameOver: jest.fn(),
      getCurrentEnding: jest.fn()
    } as any;

    mockTimeManager = {
      getTimeInfo: jest.fn()
    } as any;

    queryService = new QueryService(mockDataManager, mockResourceManager, mockTimeManager);

    // Setup default mock returns
    mockResourceManager.getResourceValue.mockImplementation((id: number) => {
      const values: Record<number, number> = { 
        61: 1, // current location
        18: 100, // focus
        2: 1000, // money
        3: 0, 5: 0, 7: 0, 9: 0, 11: 0 // inventory slots (item ids)
      };
      return values[id] || 0;
    });

    mockResourceManager.getAllResourceValues.mockReturnValue({
      61: 1, 18: 100, 2: 1000
    });

    mockTimeManager.getTimeInfo.mockReturnValue({
      current_time: 480,
      hour: 8,
      day: 1,
      day_of_week: 1,
      is_weekend: false,
      is_workday: true,
      is_night: false
    });
  });

  describe('queryResource', () => {
    it('should return resource information successfully', () => {
      // Arrange
      const testResource: Resource = TestDataProvider.getBasicResources()[1]; // Money
      mockDataManager.getResource.mockReturnValue(testResource);
      mockResourceManager.getResourceValue.mockReturnValue(1000);

      // Act
      const result = queryService.queryResource(2);

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data).toEqual({
        resource_id: 2,
        resource_name: '金钱',
        value: 1000,
        max_value: 999999,
        min_value: 0
      });
    });

    it('should handle unknown resource gracefully', () => {
      // Arrange
      mockDataManager.getResource.mockReturnValue(undefined);
      mockResourceManager.getResourceValue.mockReturnValue(0);

      // Act
      const result = queryService.queryResource(999);

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.resource_name).toBe('Unknown');
      expect(result.data.resource_id).toBe(999);
    });

    it('should support English language', () => {
      // Arrange
      const testResource: Resource = TestDataProvider.getBasicResources()[1];
      mockDataManager.getResource.mockReturnValue(testResource);
      mockResourceManager.getResourceValue.mockReturnValue(1000);

      // Act
      const result = queryService.queryResource(2, 'en');

      // Assert
      expect(result.data.resource_name).toBe('Money');
    });
  });

  describe('queryLocation', () => {
    it('should return current location information', () => {
      // Arrange
      const testLocation: Location = TestDataProvider.getBasicLocations()[0];
      mockDataManager.getLocation.mockReturnValue(testLocation);
      mockResourceManager.getResourceValue.mockReturnValue(1);

      // Act
      const result = queryService.queryLocation();

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data).toEqual({
        location_id: 1,
        location_name: '办公室',
        available_entities: [1, 2]
      });
    });

    it('should return specific location information', () => {
      // Arrange
      const testLocation: Location = TestDataProvider.getBasicLocations()[1];
      mockDataManager.getLocation.mockReturnValue(testLocation);

      // Act
      const result = queryService.queryLocation(2);

      // Assert
      expect(result.data.location_id).toBe(2);
      expect(result.data.location_name).toBe('家');
    });

    it('should handle unknown location gracefully', () => {
      // Arrange
      mockDataManager.getLocation.mockReturnValue(undefined);

      // Act
      const result = queryService.queryLocation(999);

      // Assert
      expect(result.data.location_name).toBe('Unknown');
      expect(result.data.available_entities).toEqual([]);
    });
  });

  describe('queryAvailableEvents', () => {
    it('should return available events for current location', () => {
      // Arrange
      const events = TestDataProvider.getBasicEvents();
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getResourceValue.mockReturnValue(1); // current location
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 100 });

      // Act
      const result = queryService.queryAvailableEvents();

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.available_events).toHaveLength(3); // All events pass conditions with focus=100
      expect(result.data.available_events[0]).toEqual({
        event_id: 1,
        event_name_cn: '工作',
        event_name_en: 'Work',
        time_cost: 60
      });
    });

    it('should filter events by location requirements', () => {
      // Arrange
      const events = [
        ...TestDataProvider.getBasicEvents(),
        {
          event_id: 4,
          event_name_cn: '睡觉',
          event_name_en: 'Sleep',
          time_cost: 480,
          condition_expression: 'always',
          location_requirement: 2, // Different location
          level_requirement: 0,
          text_id: 4
        }
      ];
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getResourceValue.mockReturnValue(1); // current location = 1
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 100 }); // High focus

      // Act
      const result = queryService.queryAvailableEvents();

      // Assert
      expect(result.data.available_events).toHaveLength(3); // Only location 1 events that pass conditions (all 3 basic events)
      expect(result.data.available_events.every((e: any) => e.event_id !== 4)).toBe(true);
    });

    it('should filter events by condition requirements', () => {
      // Arrange
      const events = TestDataProvider.getBasicEvents(); // Study event requires focus >= 30
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getResourceValue.mockReturnValue(1);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 20 }); // Low focus

      // Act
      const result = queryService.queryAvailableEvents();

      // Assert
      expect(result.data.available_events).toHaveLength(2); // Excludes study event
      expect(result.data.available_events.find((e: any) => e.event_id === 3)).toBeUndefined();
    });

    it('should support English language', () => {
      // Arrange
      const events = TestDataProvider.getBasicEvents();
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getResourceValue.mockReturnValue(1);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 100 });

      // Act
      const result = queryService.queryAvailableEvents('en');

      // Assert
      expect(result.data.available_events[0].event_name_en).toBe('Work');
    });
  });

  describe('queryInventory', () => {
    it('should return empty inventory when no items', () => {
      // Arrange
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        // All inventory slots empty
        if ([3, 5, 7, 9, 11].includes(id)) return 0; // item IDs
        if ([4, 6, 8, 10, 12].includes(id)) return 0; // quantities
        return 0;
      });

      // Act
      const result = queryService.queryInventory();

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.inventory).toHaveLength(0);
    });

    it('should return inventory with items', () => {
      // Arrange
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        if (id === 3) return 1; // item ID 1 in slot 1
        if (id === 4) return 5; // quantity 5
        if (id === 5) return 2; // item ID 2 in slot 2
        if (id === 6) return 3; // quantity 3
        return 0;
      });

      const mockItem: Item = { 
        item_id: 1, 
        item_name: '面包', 
        item_type: 'food',
        price: 10,
        storage_location: 'inventory',
        description_cn: '普通面包',
        description_en: 'Regular bread'
      };
      mockDataManager.getItem.mockReturnValue(mockItem);

      // Act
      const result = queryService.queryInventory();

      // Assert
      expect(result.data.inventory).toHaveLength(2);
      expect(result.data.inventory[0]).toEqual({
        slot: 1,
        item_id: 1,
        item_name: '面包',
        quantity: 5
      });
    });

    it('should handle unknown items gracefully', () => {
      // Arrange
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        if (id === 3) return 999; // unknown item ID
        if (id === 4) return 1;
        return 0;
      });

      mockDataManager.getItem.mockReturnValue(undefined);

      // Act
      const result = queryService.queryInventory();

      // Assert
      expect(result.data.inventory[0].item_name).toBe('Unknown');
    });
  });

  describe('getGameState', () => {
    it('should return complete game state', () => {
      // Arrange
      const mockResources = { 1: 480, 2: 1000, 18: 100 };
      const mockTimeInfo = {
        current_time: 480,
        hour: 8,
        day: 1,
        day_of_week: 1,
        is_weekend: false,
        is_workday: true,
        is_night: false
      };

      mockResourceManager.getAllResourceValues.mockReturnValue(mockResources);
      mockResourceManager.isGameOver.mockReturnValue(false);
      mockResourceManager.getCurrentEnding.mockReturnValue(undefined);
      mockTimeManager.getTimeInfo.mockReturnValue(mockTimeInfo);

      // Act
      const result = queryService.getGameState();

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data).toEqual({
        resources: mockResources,
        game_over: false,
        current_ending: undefined,
        time_info: mockTimeInfo
      });
    });
  });

  describe('queryEventsByLocation', () => {
    it('should return events for specific location', () => {
      // Arrange
      const events = TestDataProvider.getBasicEvents();
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 100 });

      // Act
      const result = queryService.queryEventsByLocation(1);

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.location_id).toBe(1);
      expect(result.data.events).toHaveLength(3);
      expect(result.data.events[0]).toEqual({
        event_id: 1,
        event_name_cn: '工作',
        event_name_en: 'Work',
        time_cost: 60,
        can_execute: true
      });
    });

    it('should include execution status for each event', () => {
      // Arrange
      const events = TestDataProvider.getBasicEvents();
      const eventsMap = new Map();
      events.forEach(event => eventsMap.set(event.event_id, event));
      
      mockDataManager.getAllEvents.mockReturnValue(eventsMap);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 20 }); // Low focus

      // Act
      const result = queryService.queryEventsByLocation(1);

      // Assert
      const studyEvent = result.data.events.find((e: any) => e.event_id === 3);
      expect(studyEvent).toBeDefined();
      expect(studyEvent!.can_execute).toBe(false); // focus < 30
    });
  });

  describe('queryResourcesByType', () => {
    it('should return resources of specific type', () => {
      // Arrange
      const resources = TestDataProvider.getBasicResources();
      const resourcesMap = new Map();
      resources.forEach(resource => resourcesMap.set(resource.resource_id, resource));
      
      mockDataManager.getAllResources.mockReturnValue(resourcesMap);
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        const values: Record<number, number> = { 2: 1000, 13: 100, 14: 0, 15: 0, 18: 100 };
        return values[id] || 0;
      });

      // Act
      const result = queryService.queryResourcesByType('basic');

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.resources.length).toBeGreaterThan(0);
      expect(result.data.resources.every((r: any) => r.resource_id !== 1)).toBe(true); // Excludes system type
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle manager dependencies gracefully', () => {
      // Arrange
      mockResourceManager.getAllResourceValues.mockReturnValue({});
      mockDataManager.getAllEvents.mockReturnValue(new Map());

      // Act
      const result = queryService.queryAvailableEvents();

      // Assert
      expect(result.type).toBe('query_result');
      expect(result.data.available_events).toHaveLength(0);
    });

    it('should handle empty data collections', () => {
      // Arrange
      mockDataManager.getAllResources.mockReturnValue(new Map());

      // Act
      const result = queryService.queryResourcesByType('basic');

      // Assert
      expect(result.data.resources).toHaveLength(0);
    });

    it('should maintain performance with large datasets', () => {
      // Arrange
      const largeEventsMap = new Map();
      for (let i = 1; i <= 1000; i++) {
        largeEventsMap.set(i, {
          event_id: i,
          event_name_cn: `事件${i}`,
          event_name_en: `Event${i}`,
          time_cost: 60,
          condition_expression: 'always',
          location_requirement: 1,
          level_requirement: 0,
          text_id: i
        });
      }
      
      mockDataManager.getAllEvents.mockReturnValue(largeEventsMap);
      mockResourceManager.getResourceValue.mockReturnValue(1);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 61: 1, 18: 100 });

      // Act
      const startTime = Date.now();
      const result = queryService.queryAvailableEvents();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(result.data.available_events).toHaveLength(1000);
    });
  });
}); 