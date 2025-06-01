import {
  Event,
  TemporaryEvent,
  ScheduledTask,
  Ending,
  EventResult,
  TemporaryEventResult,
  ScheduledTaskResult
} from '../types';
import { GameDataManager } from './GameDataManager';
import { ResourceManager } from './ResourceManager';
import { TimeManager } from './TimeManager';
import { ConditionParser } from '../conditionParser';
import { Language, getEventName, getTaskName, getLocalizedText } from '../utils';

export class EventProcessor {
  private dataManager: GameDataManager;
  private resourceManager: ResourceManager;
  private timeManager: TimeManager;

  constructor(
    dataManager: GameDataManager,
    resourceManager: ResourceManager,
    timeManager: TimeManager
  ) {
    this.dataManager = dataManager;
    this.resourceManager = resourceManager;
    this.timeManager = timeManager;
  }

  executeEvent(eventId: number, language: 'zh' | 'en' = 'zh'): EventResult {
    if (this.resourceManager.isGameOver()) {
      return this.createFailureResult(eventId, '', 'Game is over', language);
    }

    const event = this.dataManager.getEvent(eventId);
    if (!event) {
      return this.createFailureResult(eventId, '', 'Event not found', language);
    }

    // Check if event can be executed
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );

    if (!conditionParser.evaluate(event.condition_expression)) {
      return this.createFailureResult(eventId, getEventName(event, language), 'Conditions not met', language);
    }

    // Check location requirement
    if (event.location_requirement && 
        event.location_requirement !== this.resourceManager.getResourceValue(61)) {
      return this.createFailureResult(eventId, getEventName(event, language), 'Not in correct location', language);
    }

    // Execute the event
    const resourceChanges: Record<number, number> = {};
    const temporaryEventsTriggered: TemporaryEventResult[] = [];
    const scheduledTasksTriggered: ScheduledTaskResult[] = [];

    // Apply resource changes
    this.applyEventResourceChanges(event, resourceChanges);

    // Record time consumption (resource 1 - time)
    if (event.time_cost > 0) {
      resourceChanges[1] = event.time_cost; // 记录时间消耗
    }

    // Consume time and process each time unit
    for (let i = 0; i < event.time_cost; i++) {
      this.timeManager.advanceTime(1);
      
      // Check and trigger temporary events
      const tempEvents = this.checkTemporaryEvents(language);
      temporaryEventsTriggered.push(...tempEvents);
      
      // Check and trigger scheduled tasks
      const schedTasks = this.checkScheduledTasks(language);
      scheduledTasksTriggered.push(...schedTasks);
      
      // Apply night-time bonuses if applicable
      this.timeManager.applyNightTimeBonus();
    }

    // Check for game ending
    const ending = this.checkEndings();
    if (ending) {
      this.resourceManager.setGameOver(true);
      this.resourceManager.setCurrentEnding(ending);
    }

    // Get text content based on language
    const text = this.dataManager.getGameText(event.text_id);
    const textContent = text ? 
      (language === 'en' ? text.text_content_en : text.text_content) : 
      `Event ${getEventName(event, language)} completed`;

    return {
      success: true,
      event_id: eventId,
      event_name: getEventName(event, language),
      text_id: event.text_id,
      text_content: textContent,
      time_consumed: event.time_cost,
      resource_changes: resourceChanges,
      temporary_events_triggered: temporaryEventsTriggered,
      scheduled_tasks_triggered: scheduledTasksTriggered,
      ending_triggered: ending
    };
  }

  private createFailureResult(eventId: number, eventName: string, message: string, language: 'zh' | 'en' = 'zh'): EventResult {
    return {
      success: false,
      event_id: eventId,
      event_name: eventName,
      text_id: 0,
      text_content: message,
      time_consumed: 0,
      resource_changes: {},
      temporary_events_triggered: [],
      scheduled_tasks_triggered: []
    };
  }

  private applyEventResourceChanges(event: Event, changes: Record<number, number>) {
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    
    // Apply permanent effect calculations
    let focusConsumption = event.focus_change || 0;
    let projectProgress = event.project_progress_change || 0;
    
    // Apply permanent effect modifiers
    if (focusConsumption < 0) {
      const reduction = this.resourceManager.getResourceValue(78) || 0; // Focus consumption reduction %
      focusConsumption = Math.floor(focusConsumption * (100 - reduction) / 100);
    }
    
    // Simple resource changes
    const simpleChanges = {
      14: event.fatigue_change,
      13: event.health_change,
      15: event.hunger_change,
      16: event.rational_change,
      17: event.emotional_change,
      18: focusConsumption,
      19: event.mood_change,
      20: event.skill_change,
      21: event.boss_dissatisfaction_change,
      22: event.job_level_change,
      2: event.money_change,
      24: event.books_change,
      62: event.colleague1_favor_change,
      63: event.colleague1_skill_change,
      64: event.colleague2_favor_change,
      65: event.colleague2_skill_change,
      66: event.colleague3_favor_change,
      67: event.colleague3_skill_change,
      70: event.social_influence_change,
      71: event.tech_reputation_change,
      72: event.philosophy_insight_change
    };

    // Apply simple changes
    Object.entries(simpleChanges).forEach(([resourceId, change]) => {
      if (change !== undefined && change !== null) {
        const id = parseInt(resourceId);
        const actualChange = this.resourceManager.changeResourceValue(id, change);
        if (actualChange !== 0) {
          changes[id] = actualChange;
        }
      }
    });

    // Handle calculated project progress
    if (typeof projectProgress === 'string') {
      if (projectProgress.startsWith('calc[')) {
        projectProgress = conditionParser.evaluateExpression(projectProgress);
      } else if (projectProgress.startsWith('set[')) {
        const setOp = conditionParser.evaluateSetOperation(projectProgress);
        if (setOp) {
          this.resourceManager.setResourceValue(setOp.resourceId, setOp.value);
          changes[setOp.resourceId] = setOp.value;
        }
        projectProgress = 0;
      } else if (projectProgress.startsWith('reset[')) {
        const match = projectProgress.match(/reset\[(\d+)\]/);
        if (match) {
          const resourceId = parseInt(match[1]);
          this.resourceManager.setResourceValue(resourceId, 0);
          changes[resourceId] = 0;
        }
        projectProgress = 0;
      }
    }
    
    if (typeof projectProgress === 'number' && projectProgress !== 0) {
      const actualChange = this.resourceManager.changeResourceValue(23, projectProgress);
      if (actualChange !== 0) {
        changes[23] = actualChange;
      }
    }

    // Handle item gains
    if (event.item_gained && event.item_quantity) {
      this.resourceManager.addItemToInventory(event.item_gained, event.item_quantity);
    }

    // Handle permanent effect changes
    if (event.permanent_effect_change) {
      if (typeof event.permanent_effect_change === 'string') {
        if (event.permanent_effect_change.startsWith('set[')) {
          const setOp = conditionParser.evaluateSetOperation(event.permanent_effect_change);
          if (setOp) {
            this.resourceManager.setResourceValue(setOp.resourceId, setOp.value);
            changes[setOp.resourceId] = setOp.value;
          }
        } else if (event.permanent_effect_change.startsWith('reset[')) {
          const match = event.permanent_effect_change.match(/reset\[(\d+)\]/);
          if (match) {
            const resourceId = parseInt(match[1]);
            this.resourceManager.setResourceValue(resourceId, 0);
            changes[resourceId] = 0;
          }
        }
      }
    }
  }

  private checkTemporaryEvents(language: 'zh' | 'en' = 'zh'): TemporaryEventResult[] {
    const triggered: TemporaryEventResult[] = [];
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    
    this.dataManager.getAllTemporaryEvents().forEach((tempEvent, id) => {
      // Check if already triggered max times
      const triggerCount = this.resourceManager.getTemporaryEventTriggerCount(id);
      if (triggerCount >= tempEvent.max_triggers) return;
      
      // Check condition
      if (!conditionParser.evaluate(tempEvent.trigger_condition)) return;
      
      // Trigger the event
      this.resourceManager.incrementTemporaryEventTrigger(id);
      
      // Apply effects
      const changes: Record<number, number> = {};
      this.applyTemporaryEventChanges(tempEvent, changes);
      
      // Check for ending
      let ending: Ending | undefined;
      if (tempEvent.ending_triggered) {
        ending = this.dataManager.getEnding(tempEvent.ending_triggered);
        if (ending) {
          this.resourceManager.setGameOver(true);
          this.resourceManager.setCurrentEnding(ending);
        }
      }
      
      // Get text
      const text = typeof tempEvent.text_id === 'number' 
        ? this.dataManager.getGameText(tempEvent.text_id)
        : undefined;
      
      triggered.push({
        temp_event_id: id,
        event_name: getEventName(tempEvent, language),
        text_id: tempEvent.text_id,
        text_content: text ? 
          (language === 'en' ? text.text_content_en : text.text_content) : getEventName(tempEvent, language),
        resource_changes: changes,
        ending_triggered: ending
      });
    });
    
    return triggered;
  }

  private applyTemporaryEventChanges(tempEvent: TemporaryEvent, changes: Record<number, number>) {
    const simpleChanges = {
      14: tempEvent.fatigue_change,
      13: tempEvent.health_change,
      15: tempEvent.hunger_change,
      16: tempEvent.rational_change,
      17: tempEvent.emotional_change,
      18: tempEvent.focus_change,
      19: tempEvent.mood_change,
      20: tempEvent.skill_change,
      21: tempEvent.boss_dissatisfaction_change,
      22: tempEvent.job_level_change,
      2: tempEvent.money_change
    };

    Object.entries(simpleChanges).forEach(([resourceId, change]) => {
      if (change !== undefined && change !== null) {
        const id = parseInt(resourceId);
        const actualChange = this.resourceManager.changeResourceValue(id, change);
        if (actualChange !== 0) {
          changes[id] = actualChange;
        }
      }
    });

    // Handle calculated changes
    if (tempEvent.project_progress_change) {
      const conditionParser = new ConditionParser(
        this.resourceManager.getAllResourceValues(),
        this.timeManager.getTimeInfo()
      );
      if (typeof tempEvent.project_progress_change === 'string') {
        const setOp = conditionParser.evaluateSetOperation(tempEvent.project_progress_change);
        if (setOp) {
          this.resourceManager.setResourceValue(setOp.resourceId, setOp.value);
          changes[setOp.resourceId] = setOp.value;
        }
      }
    }
  }

  private checkScheduledTasks(language: 'zh' | 'en' = 'zh'): ScheduledTaskResult[] {
    const triggered: ScheduledTaskResult[] = [];
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    
    this.dataManager.getAllScheduledTasks().forEach((task, id) => {
      if (!task.is_active) return;
      
      // Check trigger condition
      if (!conditionParser.evaluate(task.trigger_condition)) return;
      
      // Check trigger time
      if (!conditionParser.evaluate(task.trigger_time)) return;
      
      // Check if enough time has passed since last trigger
      const lastTrigger = this.resourceManager.getLastTaskTriggerTime(id);
      if (!this.timeManager.hasTimePassedSince(lastTrigger, task.repeat_interval)) return;
      
      // Trigger the task
      this.resourceManager.setLastTaskTriggerTime(id, this.timeManager.getCurrentTime());
      
      // Apply effects
      const changes: Record<number, number> = {};
      this.applyScheduledTaskChanges(task, changes);
      
      // Get text
      const text = typeof task.text_id === 'number' 
        ? this.dataManager.getGameText(task.text_id)
        : undefined;
      
      triggered.push({
        task_id: id,
        task_name: task.task_name,
        text_id: task.text_id,
        text_content: text ? 
          (language === 'en' ? text.text_content_en : text.text_content) : task.task_name,
        resource_changes: changes
      });
    });
    
    return triggered;
  }

  private applyScheduledTaskChanges(task: ScheduledTask, changes: Record<number, number>) {
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    
    // Handle calculated money changes
    if (task.money_change) {
      let moneyChange = 0;
      if (typeof task.money_change === 'string') {
        if (task.money_change.startsWith('calc[') || task.money_change.startsWith('conditional[')) {
          moneyChange = conditionParser.evaluateExpression(task.money_change);
        }
      } else {
        moneyChange = task.money_change;
      }
      
      if (moneyChange !== 0) {
        const actualChange = this.resourceManager.changeResourceValue(2, moneyChange);
        if (actualChange !== 0) {
          changes[2] = actualChange;
        }
      }
    }

    // Handle project progress changes
    if (task.project_progress_change) {
      if (typeof task.project_progress_change === 'string') {
        if (task.project_progress_change.startsWith('calc[')) {
          const progress = conditionParser.evaluateExpression(task.project_progress_change);
          const actualChange = this.resourceManager.changeResourceValue(23, progress);
          if (actualChange !== 0) {
            changes[23] = actualChange;
          }
        } else if (task.project_progress_change.startsWith('set[')) {
          const setOp = conditionParser.evaluateSetOperation(task.project_progress_change);
          if (setOp) {
            this.resourceManager.setResourceValue(setOp.resourceId, setOp.value);
            changes[setOp.resourceId] = setOp.value;
          }
        }
      }
    }

    // Apply other simple changes
    const simpleChanges = {
      14: task.fatigue_change,
      13: task.health_change,
      15: task.hunger_change,
      16: task.rational_change,
      17: task.emotional_change,
      18: task.focus_change,
      19: task.mood_change,
      20: task.skill_change,
      21: task.boss_dissatisfaction_change
    };

    Object.entries(simpleChanges).forEach(([resourceId, change]) => {
      if (change !== undefined && change !== null) {
        const id = parseInt(resourceId);
        const actualChange = this.resourceManager.changeResourceValue(id, change);
        if (actualChange !== 0) {
          changes[id] = actualChange;
        }
      }
    });
  }

  private checkEndings(): Ending | undefined {
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    
    for (const [id, ending] of this.dataManager.getAllEndings()) {
      if (conditionParser.evaluate(ending.trigger_condition)) {
        return ending;
      }
    }
    
    return undefined;
  }
} 