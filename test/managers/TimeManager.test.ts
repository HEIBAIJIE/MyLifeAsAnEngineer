import { TimeManager } from '../../src/managers/TimeManager';
import { ResourceManager } from '../../src/managers/ResourceManager';

// Mock ResourceManager
jest.mock('../../src/managers/ResourceManager');

describe('TimeManager', () => {
  let timeManager: TimeManager;
  let mockResourceManager: jest.Mocked<ResourceManager>;

  beforeEach(() => {
    mockResourceManager = new ResourceManager(null as any) as jest.Mocked<ResourceManager>;
    mockResourceManager.getResourceValue.mockReturnValue(14); // Default start time
    mockResourceManager.setResourceValue.mockImplementation(() => {});
    
    timeManager = new TimeManager(mockResourceManager);
  });

  describe('Time initialization', () => {
    test('should initialize with default time values', () => {
      const timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.current_time).toBe(14);
      expect(timeInfo.hour).toBe(7); // 14/2 = 7
      expect(timeInfo.day).toBe(1);
      expect(timeInfo.day_of_week).toBe(1);
      expect(timeInfo.is_weekend).toBe(false);
      expect(timeInfo.is_workday).toBe(true);
      expect(timeInfo.is_night).toBe(false);
    });

    test('should get current time from resource manager', () => {
      mockResourceManager.getResourceValue.mockReturnValue(62); // Some time
      expect(timeManager.getCurrentTime()).toBe(62);
      expect(mockResourceManager.getResourceValue).toHaveBeenCalledWith(1); // Time resource ID
    });
  });

  describe('Time advancement', () => {
    test('should advance time and update resource', () => {
      mockResourceManager.getResourceValue.mockReturnValue(14); // Start time
      
      timeManager.advanceTime(4); // Advance 4 time units (2 hours)
      
      expect(mockResourceManager.setResourceValue).toHaveBeenCalledWith(1, 18);
    });

    test('should handle time advancement across day boundaries', () => {
      mockResourceManager.getResourceValue.mockReturnValue(60); // Near end of day
      
      timeManager.advanceTime(10); // Advance into next day
      
      expect(mockResourceManager.setResourceValue).toHaveBeenCalledWith(1, 70);
    });
  });

  describe('Time calculations', () => {
    test('should calculate correct hour from time units', () => {
      mockResourceManager.getResourceValue.mockReturnValue(18); // 18/2 = 9 AM
      
      const timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.hour).toBe(9);
    });

    test('should calculate correct day from time units', () => {
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 2); // Day 3 (2 days passed)
      
      const timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.day).toBe(3);
    });

    test('should calculate correct day of week', () => {
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48); // Day 2 (1 day passed)
      
      const timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.day_of_week).toBe(2);
    });

    test('should identify weekends correctly', () => {
      // Saturday (day 6) - 5 days passed
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 5);
      let timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_weekend).toBe(true);
      expect(timeInfo.is_workday).toBe(false);

      // Sunday (day 7) - 6 days passed
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 6);
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_weekend).toBe(true);
      expect(timeInfo.is_workday).toBe(false);
    });

    test('should identify workdays correctly', () => {
      // Monday (day 1) - 0 days passed
      mockResourceManager.getResourceValue.mockReturnValue(14);
      let timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_workday).toBe(true);
      expect(timeInfo.is_weekend).toBe(false);

      // Friday (day 5) - 4 days passed
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 4);
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_workday).toBe(true);
      expect(timeInfo.is_weekend).toBe(false);
    });

    test('should identify night time correctly', () => {
      // 10:00 PM (hour 22) = time unit 44
      mockResourceManager.getResourceValue.mockReturnValue(44);
      let timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_night).toBe(true);

      // 2:00 AM (hour 2) = time unit 4
      mockResourceManager.getResourceValue.mockReturnValue(4);
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_night).toBe(true);

      // 10:00 AM (hour 10) = time unit 20
      mockResourceManager.getResourceValue.mockReturnValue(20);
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.is_night).toBe(false);
    });
  });

  describe('Time conversion utilities', () => {
    test('should convert days to time units', () => {
      expect(timeManager.convertDaysToTimeUnits(1)).toBe(48);
      expect(timeManager.convertDaysToTimeUnits(2.5)).toBe(120);
    });

    test('should convert time units to days', () => {
      expect(timeManager.convertTimeUnitsToDays(48)).toBe(1);
      expect(timeManager.convertTimeUnitsToDays(120)).toBe(2.5);
    });

    test('should check if time has passed since a given time', () => {
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 2); // 2 days later
      
      expect(timeManager.hasTimePassedSince(14, 1)).toBe(true); // 1 day has passed
      expect(timeManager.hasTimePassedSince(14, 3)).toBe(false); // 3 days have not passed
    });

    test('should calculate time until specific hour', () => {
      mockResourceManager.getResourceValue.mockReturnValue(20); // 10 AM
      
      expect(timeManager.getTimeUntilHour(14)).toBe(8); // 4 hours = 8 time units
      expect(timeManager.getTimeUntilHour(8)).toBe(44); // Next day 8 AM
    });
  });

  describe('Edge cases', () => {
    test('should handle default time when resource is 0', () => {
      mockResourceManager.getResourceValue.mockReturnValue(0);
      
      expect(timeManager.getCurrentTime()).toBe(14); // Default start time
    });

    test('should handle very large time values', () => {
      const largeTime = 14 + 48 * 365; // 1 year later
      mockResourceManager.getResourceValue.mockReturnValue(largeTime);
      
      const timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.current_time).toBe(largeTime);
      expect(timeInfo.hour).toBeGreaterThanOrEqual(0);
      expect(timeInfo.hour).toBeLessThan(24);
    });

    test('should handle hour boundary calculations', () => {
      // Test exact hour boundaries
      mockResourceManager.getResourceValue.mockReturnValue(0); // Midnight
      let timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.hour).toBe(0);

      mockResourceManager.getResourceValue.mockReturnValue(24); // Noon
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.hour).toBe(12);

      mockResourceManager.getResourceValue.mockReturnValue(46); // 11:00 PM
      timeInfo = timeManager.getTimeInfo();
      expect(timeInfo.hour).toBe(23);
    });
  });

  describe('Helper methods', () => {
    test('should provide convenience methods', () => {
      mockResourceManager.getResourceValue.mockReturnValue(44); // Night time
      
      expect(timeManager.isNightTime()).toBe(true);
      expect(timeManager.isWeekend()).toBe(false);
      expect(timeManager.isWorkday()).toBe(true);
      expect(timeManager.getHour()).toBe(22);
      expect(timeManager.getDayOfWeek()).toBe(1);
    });

    test('should calculate days passed correctly', () => {
      mockResourceManager.getResourceValue.mockReturnValue(14 + 48 * 3); // 3 days passed
      
      expect(timeManager.getDaysPassed()).toBe(3);
    });
  });
}); 