import { TimeInfo } from '../types';
import { ResourceManager } from './ResourceManager';

export class TimeManager {
  private resourceManager: ResourceManager;

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
  }

  getCurrentTime(): number {
    const time = this.resourceManager.getResourceValue(1);
    return time || 14; // Default start time when time is 0, null, or undefined
  }

  advanceTime(timeUnits: number): void {
    const currentTime = this.getCurrentTime();
    this.resourceManager.setResourceValue(1, currentTime + timeUnits);
  }

  getTimeInfo(): TimeInfo {
    const currentTime = this.getCurrentTime();
    // 修复时间计算逻辑 - 如果是默认时间，按正常计算；如果是0，也按正常计算
    const actualTime = this.resourceManager.getResourceValue(1);
    const timeToUse = actualTime !== null && actualTime !== undefined ? actualTime : 14;
    
    const hour = Math.floor((timeToUse % 48) / 2); // Convert to 24-hour format
    const daysPassed = Math.floor((timeToUse - 14) / 48);
    const dayOfWeek = (daysPassed % 7) + 1; // 1 = Monday, 7 = Sunday
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
    const isNight = hour >= 18 || hour < 6; // 6 PM to 6 AM is night
    
    return {
      current_time: timeToUse,
      hour: hour,
      day: Math.max(1, (daysPassed % 30) + 1), // Ensure day is at least 1
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_workday: !isWeekend,
      is_night: isNight
    };
  }

  isNightTime(): boolean {
    return this.getTimeInfo().is_night;
  }

  isWeekend(): boolean {
    return this.getTimeInfo().is_weekend;
  }

  isWorkday(): boolean {
    return this.getTimeInfo().is_workday;
  }

  getDayOfWeek(): number {
    return this.getTimeInfo().day_of_week;
  }

  getHour(): number {
    return this.getTimeInfo().hour;
  }

  getDaysPassed(): number {
    const currentTime = this.getCurrentTime();
    return Math.floor((currentTime - 14) / 48);
  }

  // Time-based calculations
  convertDaysToTimeUnits(days: number): number {
    return days * 48; // 48 time units per day
  }

  convertTimeUnitsToDays(timeUnits: number): number {
    return timeUnits / 48;
  }

  // Check if enough time has passed since a given time
  hasTimePassedSince(lastTime: number, intervalInDays: number): boolean {
    const currentTime = this.getCurrentTime();
    const intervalInTimeUnits = this.convertDaysToTimeUnits(intervalInDays);
    return (currentTime - lastTime) >= intervalInTimeUnits;
  }

  // Get time until next occurrence of a specific hour
  getTimeUntilHour(targetHour: number): number {
    const timeInfo = this.getTimeInfo();
    const currentHour = timeInfo.hour;
    
    if (targetHour > currentHour) {
      return (targetHour - currentHour) * 2; // Convert to time units
    } else {
      return (24 - currentHour + targetHour) * 2; // Next day
    }
  }

  // Apply night-time bonuses (if any)
  applyNightTimeBonus(): void {
    if (this.isNightTime()) {
      // Apply any night-time specific bonuses
      // This could be implemented based on game rules
    }
  }
} 