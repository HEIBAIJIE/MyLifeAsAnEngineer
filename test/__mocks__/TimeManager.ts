export class TimeManager {
  getCurrentTime = jest.fn().mockReturnValue(0);
  advanceTime = jest.fn();
  getTimeInfo = jest.fn().mockReturnValue({
    current_time: 0,
    hour: 8,
    day: 1,
    day_of_week: 1,
    is_weekend: false,
    is_workday: true,
    is_night: false
  });
} 