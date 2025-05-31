import { TimeInfo } from '../types';
import { ResourceManager } from './ResourceManager';

export class TimeManager {
  private resourceManager: ResourceManager;

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
  }

  getCurrentTime(): number {
    return this.resourceManager.getResourceValue(1) || 14; // Default start time
  }

  advanceTime(timeUnits: number): void {
    const currentTime = this.getCurrentTime();
    this.resourceManager.setResourceValue(1, currentTime + timeUnits);
  }

  getTimeInfo(): TimeInfo {
    const currentTime = this.getCurrentTime();
    const hour = currentTime % 48;
    const daysPassed = Math.floor((currentTime - 14) / 48);
    const dayOfWeek = (daysPassed % 7) + 1; // 1 = Monday, 7 = Sunday
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;
    const isNight = hour >= 36 || hour < 14;
    
    return {
      current_time: currentTime,
      hour: Math.floor(hour / 2), // Convert to 24-hour format
      day: (daysPassed % 30) + 1,
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