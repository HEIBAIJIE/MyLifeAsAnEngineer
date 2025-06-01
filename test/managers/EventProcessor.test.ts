import { EventProcessor } from '../../src/managers/EventProcessor';
import { GameDataManager } from '../../src/managers/GameDataManager';
import { ResourceManager } from '../../src/managers/ResourceManager';
import { TimeManager } from '../../src/managers/TimeManager';
import { TestDataProvider } from '../test-helpers/TestDataProvider';
import { Event, EventResult } from '../../src/types';

describe('EventProcessor', () => {
  let eventProcessor: EventProcessor;
  let mockDataManager: jest.Mocked<GameDataManager>;
  let mockResourceManager: jest.Mocked<ResourceManager>;
  let mockTimeManager: jest.Mocked<TimeManager>;

  beforeEach(() => {
    // Create mock managers
    mockDataManager = {
      getEvent: jest.fn(),
      getGameText: jest.fn(),
      getAllEvents: jest.fn(),
      getAllTemporaryEvents: jest.fn(),
      getAllScheduledTasks: jest.fn(),
      getAllEndings: jest.fn()
    } as any;

    mockResourceManager = {
      isGameOver: jest.fn(),
      getAllResourceValues: jest.fn(),
      getResourceValue: jest.fn(),
      changeResourceValue: jest.fn(),
      setResourceValue: jest.fn(),
      setGameOver: jest.fn(),
      setCurrentEnding: jest.fn(),
      getTemporaryEventTriggerCount: jest.fn(),
      incrementTemporaryEventTrigger: jest.fn(),
      getLastTaskTrigger: jest.fn(),
      setLastTaskTrigger: jest.fn(),
      getLastTaskTriggerTime: jest.fn(),
      setLastTaskTriggerTime: jest.fn()
    } as any;

    mockTimeManager = {
      getTimeInfo: jest.fn(),
      advanceTime: jest.fn(),
      applyNightTimeBonus: jest.fn(),
      hasTimePassedSince: jest.fn(),
      getCurrentTime: jest.fn()
    } as any;

    eventProcessor = new EventProcessor(mockDataManager, mockResourceManager, mockTimeManager);

    // Setup default mock returns
    mockResourceManager.isGameOver.mockReturnValue(false);
    mockResourceManager.getAllResourceValues.mockReturnValue({ 18: 100, 61: 1 });
    mockResourceManager.getResourceValue.mockImplementation((id: number) => {
      const values: Record<number, number> = { 1: 480, 18: 100, 61: 1, 14: 0 };
      return values[id] || 0;
    });
    mockResourceManager.changeResourceValue.mockImplementation((id: number, change: number) => change);
    
    mockTimeManager.getTimeInfo.mockReturnValue({
      current_time: 480,
      hour: 8,
      day: 1,
      day_of_week: 1,
      is_weekend: false,
      is_workday: true,
      is_night: false
    });

    mockDataManager.getGameText.mockReturnValue({
      text_id: 1,
      text_content: '测试事件完成',
      text_content_en: 'Test event completed'
    });
  });

  describe('executeEvent', () => {
    it('should successfully execute a basic event', () => {
      // Arrange
      const testEvent: Event = TestDataProvider.getBasicEvents()[0]; // Work event
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.event_id).toBe(1);
      expect(result.event_name).toBe('工作');
      expect(result.time_consumed).toBe(60);
      expect(result.resource_changes).toEqual({
        1: 60, // time cost
        14: 10, // fatigue
        18: -20, // focus
        20: 1, // skill
        2: 100 // money
      });
      
      // Verify time advancement
      expect(mockTimeManager.advanceTime).toHaveBeenCalledTimes(60);
      expect(mockTimeManager.applyNightTimeBonus).toHaveBeenCalledTimes(60);
    });

    it('should return failure when game is over', () => {
      // Arrange
      mockResourceManager.isGameOver.mockReturnValue(true);

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.text_content).toBe('Game is over');
      expect(result.time_consumed).toBe(0);
      expect(mockTimeManager.advanceTime).not.toHaveBeenCalled();
    });

    it('should return failure when event not found', () => {
      // Arrange
      mockDataManager.getEvent.mockReturnValue(undefined);

      // Act
      const result = eventProcessor.executeEvent(999);

      // Assert
      expect(result.success).toBe(false);
      expect(result.text_content).toBe('Event not found');
      expect(result.event_id).toBe(999);
    });

    it('should return failure when conditions not met', () => {
      // Arrange
      const testEvent: Event = {
        ...TestDataProvider.getBasicEvents()[2], // Study event requiring focus >= 30
        condition_expression: 'focus >= 50'
      };
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockResourceManager.getAllResourceValues.mockReturnValue({ 18: 20, 61: 1 }); // focus = 20

      // Act
      const result = eventProcessor.executeEvent(3);

      // Assert
      expect(result.success).toBe(false);
      expect(result.text_content).toBe('Conditions not met');
      expect(result.event_name).toBe('学习');
    });

    it('should return failure when not in correct location', () => {
      // Arrange
      const testEvent: Event = TestDataProvider.getBasicEvents()[0];
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        return id === 61 ? 2 : 100; // location = 2, but event requires location 1
      });

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.text_content).toBe('Not in correct location');
    });

    it('should trigger ending when conditions are met', () => {
      // Arrange
      const testEvent: Event = {
        ...TestDataProvider.getBasicEvents()[0],
        fatigue_change: 50 // Large fatigue increase
      };
      const endings = TestDataProvider.getBasicEndings();
      const endingsMap = new Map();
      endings.forEach(ending => endingsMap.set(ending.ending_id, ending));
      
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(endingsMap);
      
      // Mock fatigue reaching 100 after event - key point: getAllResourceValues is used by checkEndings
      mockResourceManager.getAllResourceValues
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 50, 1: 480 }) // Initial check in executeEvent
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 50, 1: 480 }) // During event resource changes
        .mockReturnValue({ 18: 80, 61: 1, 14: 100, 1: 480 }); // After event execution - fatigue = 100 for ending check
      
      // Mock individual resource changes
      mockResourceManager.changeResourceValue.mockImplementation((id: number, change: number) => {
        if (id === 14) return change; // fatigue change
        return change;
      });

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.ending_triggered).toBeDefined();
      expect(result.ending_triggered?.ending_name).toBe('过劳死');
      expect(mockResourceManager.setGameOver).toHaveBeenCalledWith(true);
      expect(mockResourceManager.setCurrentEnding).toHaveBeenCalledWith(endings[0]);
    });

    it('should handle temporary events during time advancement', () => {
      // Arrange
      const testEvent: Event = { ...TestDataProvider.getBasicEvents()[0], time_cost: 2 };
      const tempEvents = TestDataProvider.getBasicTemporaryEvents();
      const tempEventsMap = new Map();
      tempEvents.forEach(event => tempEventsMap.set(event.temp_event_id, event));
      
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(tempEventsMap);
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());
      
      // Mock resource manager methods for trigger checking
      mockResourceManager.getTemporaryEventTriggerCount.mockReturnValue(0);
      mockResourceManager.incrementTemporaryEventTrigger.mockReturnValue(undefined);
      mockResourceManager.changeResourceValue.mockReturnValue(0);
      
      // Mock time progression triggering temporary event
      // The condition is "time >= 540" so we need time to reach 540
      mockResourceManager.getAllResourceValues
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 480 }) // Initial check in executeEvent
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 480 }) // During event resource changes  
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 540 }) // First time advance iteration - condition "time >= 540" is met
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 541 }); // Second time advance iteration

      mockDataManager.getGameText
        .mockReturnValueOnce({ text_id: 1, text_content: '工作完成', text_content_en: 'Work completed' })
        .mockReturnValueOnce({ text_id: 10, text_content: '加班通知', text_content_en: 'Overtime notice' });

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.temporary_events_triggered).toHaveLength(1);
      expect(result.temporary_events_triggered[0].temp_event_id).toBe(1);
    });

    it('should handle scheduled tasks during time advancement', () => {
      // Arrange
      const testEvent: Event = { ...TestDataProvider.getBasicEvents()[0], time_cost: 1 };
      const scheduledTasks = TestDataProvider.getBasicScheduledTasks();
      const scheduledTasksMap = new Map();
      scheduledTasks.forEach(task => scheduledTasksMap.set(task.task_id, task));
      
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(scheduledTasksMap);
      mockDataManager.getAllEndings.mockReturnValue(new Map());
      
      // Mock resource manager methods for task checking
      mockResourceManager.getLastTaskTriggerTime.mockReturnValue(0);
      mockResourceManager.setLastTaskTriggerTime.mockReturnValue(undefined);
      mockResourceManager.changeResourceValue.mockReturnValue(50); // money change
      
      // Mock time manager for time checking
      mockTimeManager.hasTimePassedSince.mockReturnValue(true);
      mockTimeManager.getCurrentTime.mockReturnValue(480);
      
      // Mock TimeInfo to satisfy trigger_time condition 'time[hour] == 8'
      mockTimeManager.getTimeInfo.mockReturnValue({
        current_time: 480,
        hour: 8, // This will make 'time[hour] == 8' evaluate to true
        day: 1,
        day_of_week: 1,
        is_weekend: false,
        is_workday: true,
        is_night: false
      });
      
      // Mock resource values - checkScheduledTasks is called AFTER timeManager.advanceTime(1)
      // So when checkScheduledTasks is called, the time should already be 480
      mockResourceManager.getAllResourceValues
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 479 }) // Initial check in executeEvent (condition check)
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 479 }) // During applyEventResourceChanges
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 480 }) // After timeManager.advanceTime(1) - used in checkScheduledTasks
        .mockReturnValueOnce({ 18: 100, 61: 1, 14: 0, 1: 480 }); // Additional call if needed

      mockDataManager.getGameText
        .mockReturnValueOnce({ text_id: 1, text_content: '工作完成', text_content_en: 'Work completed' })
        .mockReturnValueOnce({ text_id: 20, text_content: '每日签到', text_content_en: 'Daily check-in' });

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.scheduled_tasks_triggered).toHaveLength(1);
      expect(result.scheduled_tasks_triggered[0].task_id).toBe(1);
    });

    it('should support English language', () => {
      // Arrange
      const testEvent: Event = TestDataProvider.getBasicEvents()[0];
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result = eventProcessor.executeEvent(1, 'en');

      // Assert
      expect(result.success).toBe(true);
      expect(result.event_name).toBe('Work');
      expect(result.text_content).toBe('Test event completed');
    });
  });

  describe('Resource Change Calculations', () => {
    it('should apply focus consumption reduction', () => {
      // Arrange
      const testEvent: Event = {
        ...TestDataProvider.getBasicEvents()[0],
        focus_change: -40
      };
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());
      
      // Mock 20% focus consumption reduction
      mockResourceManager.getResourceValue.mockImplementation((id: number) => {
        if (id === 78) return 20; // focus reduction %
        if (id === 61) return 1; // location
        return 100; // other resources
      });

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      // -40 * (100-20)/100 = -32
      expect(mockResourceManager.changeResourceValue).toHaveBeenCalledWith(18, -32);
    });
  });

  describe('Edge Cases', () => {
    it('should handle events with zero time cost', () => {
      // Arrange
      const testEvent: Event = {
        ...TestDataProvider.getBasicEvents()[0],
        time_cost: 0
      };
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.time_consumed).toBe(0);
      expect(mockTimeManager.advanceTime).not.toHaveBeenCalled();
    });

    it('should handle events with no resource changes', () => {
      // Arrange
      const testEvent: Event = {
        event_id: 1,
        event_name_cn: '空事件',
        event_name_en: 'Empty Event',
        time_cost: 0,
        condition_expression: 'always',
        location_requirement: 1,
        level_requirement: 0,
        text_id: 1
      };
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(Object.keys(result.resource_changes)).toHaveLength(0);
    });

    it('should handle missing game text gracefully', () => {
      // Arrange
      const testEvent: Event = TestDataProvider.getBasicEvents()[0];
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getGameText.mockReturnValue(undefined);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result = eventProcessor.executeEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.text_content).toBe('Event 工作 completed');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple rapid event executions', () => {
      // Arrange
      const testEvent: Event = { ...TestDataProvider.getBasicEvents()[0], time_cost: 1 };
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const results: EventResult[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(eventProcessor.executeEvent(1));
      }

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockTimeManager.advanceTime).toHaveBeenCalledTimes(10);
    });

    it('should maintain consistent state across executions', () => {
      // Arrange
      const testEvent: Event = TestDataProvider.getBasicEvents()[0];
      mockDataManager.getEvent.mockReturnValue(testEvent);
      mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
      mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
      mockDataManager.getAllEndings.mockReturnValue(new Map());

      // Act
      const result1 = eventProcessor.executeEvent(1);
      const result2 = eventProcessor.executeEvent(1);

      // Assert
      expect(result1.success).toBe(result2.success);
      expect(result1.event_id).toBe(result2.event_id);
      expect(result1.time_consumed).toBe(result2.time_consumed);
    });
  });
}); 