import {
  Resource,
  Event,
  Item,
  Entity,
  TemporaryEvent,
  ScheduledTask,
  Location,
  Ending,
  GameText,
  GameState,
  TimeInfo,
  EventResult,
  TemporaryEventResult,
  ScheduledTaskResult
} from './types';
import { ConditionParser } from './conditionParser';
import { CSVLoader } from './csvLoader';
import { base64Encode, base64Decode } from './utils';

export class GameEngine {
  private resources: Map<number, Resource>;
  private events: Map<number, Event>;
  private items: Map<number, Item>;
  private entities: Map<number, Entity>;
  private temporaryEvents: Map<number, TemporaryEvent>;
  private scheduledTasks: Map<number, ScheduledTask>;
  private locations: Map<number, Location>;
  private endings: Map<number, Ending>;
  private gameTexts: Map<number, GameText>;
  
  private gameState: GameState;
  private commandQueue: string[] = [];
  private responseQueue: any[] = [];

  constructor() {
    // Initialize maps
    this.resources = new Map();
    this.events = new Map();
    this.items = new Map();
    this.entities = new Map();
    this.temporaryEvents = new Map();
    this.scheduledTasks = new Map();
    this.locations = new Map();
    this.endings = new Map();
    this.gameTexts = new Map();
    
    // Initialize game state
    this.gameState = {
      resources: {},
      temporary_event_triggers: {},
      last_task_triggers: {},
      game_over: false,
      current_ending: undefined
    };
    
    // Load all CSV data
    this.loadGameData();
  }

  private loadGameData() {
    const loader = new CSVLoader();
    const data = loader.loadAllData();
    
    // Convert arrays to maps for efficient lookup
    data.resources.forEach(r => {
      this.resources.set(r.resource_id, r);
      // Initialize resource values
      this.gameState.resources[r.resource_id] = r.initial_value;
    });
    
    data.events.forEach(e => this.events.set(e.event_id, e));
    data.items.forEach(i => this.items.set(i.item_id, i));
    data.entities.forEach(e => this.entities.set(e.entity_id, e));
    data.temporaryEvents.forEach(t => {
      this.temporaryEvents.set(t.temp_event_id, t);
      // Initialize trigger counts
      this.gameState.temporary_event_triggers[t.temp_event_id] = 0;
    });
    data.scheduledTasks.forEach(s => {
      this.scheduledTasks.set(s.task_id, s);
      this.gameState.last_task_triggers[s.task_id] = 0;
    });
    data.locations.forEach(l => this.locations.set(l.location_id, l));
    data.endings.forEach(e => this.endings.set(e.ending_id, e));
    this.gameTexts = data.gameTexts;
  }

  // Command processing methods
  processCommand(commandStr: string): any {
    try {
      const command = JSON.parse(commandStr);
      
      switch (command.type) {
        case 'execute_event':
          return this.executeEvent(command.params.event_id);
        case 'query_resource':
          return this.queryResource(command.params.resource_id);
        case 'query_location':
          return this.queryLocation(command.params.location_id);
        case 'query_available_events':
          return this.queryAvailableEvents();
        case 'query_inventory':
          return this.queryInventory();
        case 'use_item':
          return this.useItem(command.params.item_slot);
        case 'save_game':
          return this.saveGame();
        case 'load_game':
          return this.loadGame(command.params.save_data);
        case 'get_game_state':
          return this.getGameState();
        case 'get_time_info':
          return {
            type: 'query_result',
            data: this.getTimeInfo()
          };
        default:
          return { type: 'error', error: 'Unknown command type' };
      }
    } catch (error: any) {
      return { type: 'error', error: error.message || 'Command parse error' };
    }
  }

  // Main event execution method
  private executeEvent(eventId: number): EventResult {
    if (this.gameState.game_over) {
      return {
        success: false,
        event_id: eventId,
        event_name: '',
        text_id: 0,
        text_content: 'Game is over',
        time_consumed: 0,
        resource_changes: {},
        temporary_events_triggered: [],
        scheduled_tasks_triggered: []
      };
    }

    const event = this.events.get(eventId);
    if (!event) {
      return {
        success: false,
        event_id: eventId,
        event_name: '',
        text_id: 0,
        text_content: 'Event not found',
        time_consumed: 0,
        resource_changes: {},
        temporary_events_triggered: [],
        scheduled_tasks_triggered: []
      };
    }

    // Check if event can be executed
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    if (!conditionParser.evaluate(event.condition_expression)) {
      return {
        success: false,
        event_id: eventId,
        event_name: event.event_name,
        text_id: 0,
        text_content: 'Conditions not met',
        time_consumed: 0,
        resource_changes: {},
        temporary_events_triggered: [],
        scheduled_tasks_triggered: []
      };
    }

    // Check location requirement
    if (event.location_requirement && 
        event.location_requirement !== this.gameState.resources[61]) {
      return {
        success: false,
        event_id: eventId,
        event_name: event.event_name,
        text_id: 0,
        text_content: 'Not in correct location',
        time_consumed: 0,
        resource_changes: {},
        temporary_events_triggered: [],
        scheduled_tasks_triggered: []
      };
    }

    // Execute the event
    const resourceChanges: Record<number, number> = {};
    const temporaryEventsTriggered: TemporaryEventResult[] = [];
    const scheduledTasksTriggered: ScheduledTaskResult[] = [];

    // Apply resource changes
    this.applyEventResourceChanges(event, resourceChanges);

    // Consume time and process each time unit
    for (let i = 0; i < event.time_cost; i++) {
      this.gameState.resources[1] += 1; // Increment time
      
      // Check and trigger temporary events
      const tempEvents = this.checkTemporaryEvents();
      temporaryEventsTriggered.push(...tempEvents);
      
      // Check and trigger scheduled tasks
      const schedTasks = this.checkScheduledTasks();
      scheduledTasksTriggered.push(...schedTasks);
      
      // Apply night-time bonuses if applicable
      this.applyNightTimeBonus();
    }

    // Check for game ending
    const ending = this.checkEndings();
    if (ending) {
      this.gameState.game_over = true;
      this.gameState.current_ending = ending;
    }

    // Get text content
    const text = this.gameTexts.get(event.text_id);
    const textContent = text ? text.chinese_text : `Event ${event.event_name} completed`;

    return {
      success: true,
      event_id: eventId,
      event_name: event.event_name,
      text_id: event.text_id,
      text_content: textContent,
      time_consumed: event.time_cost,
      resource_changes: resourceChanges,
      temporary_events_triggered: temporaryEventsTriggered,
      scheduled_tasks_triggered: scheduledTasksTriggered,
      ending_triggered: ending
    };
  }

  private applyEventResourceChanges(event: Event, changes: Record<number, number>) {
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    
    // Apply permanent effect calculations
    let focusConsumption = event.focus_change || 0;
    let projectProgress = event.project_progress_change || 0;
    
    // Apply permanent effect modifiers
    if (focusConsumption < 0) {
      const reduction = this.gameState.resources[78] || 0; // Focus consumption reduction %
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
        const oldValue = this.gameState.resources[id] || 0;
        const newValue = this.clampResourceValue(id, oldValue + change);
        this.gameState.resources[id] = newValue;
        changes[id] = newValue - oldValue;
      }
    });

    // Handle calculated project progress
    if (typeof projectProgress === 'string') {
      if (projectProgress.startsWith('calc[')) {
        projectProgress = conditionParser.evaluateExpression(projectProgress);
      } else if (projectProgress.startsWith('set[')) {
        const setOp = conditionParser.evaluateSetOperation(projectProgress);
        if (setOp) {
          this.gameState.resources[setOp.resourceId] = setOp.value;
          changes[setOp.resourceId] = setOp.value;
        }
        projectProgress = 0;
      } else if (projectProgress.startsWith('reset[')) {
        const match = projectProgress.match(/reset\[(\d+)\]/);
        if (match) {
          const resourceId = parseInt(match[1]);
          this.gameState.resources[resourceId] = 0;
          changes[resourceId] = 0;
        }
        projectProgress = 0;
      }
    }
    
    if (typeof projectProgress === 'number' && projectProgress !== 0) {
      const id = 23; // Project progress resource ID
      const oldValue = this.gameState.resources[id] || 0;
      const newValue = this.clampResourceValue(id, oldValue + projectProgress);
      this.gameState.resources[id] = newValue;
      changes[id] = newValue - oldValue;
    }

    // Handle item gains
    if (event.item_gained && event.item_quantity) {
      this.addItemToInventory(event.item_gained, event.item_quantity);
    }
  }

  private clampResourceValue(resourceId: number, value: number): number {
    const resource = this.resources.get(resourceId);
    if (!resource) return value;
    
    return Math.max(resource.min_value, Math.min(resource.max_value, value));
  }

  private addItemToInventory(itemType: string, quantity: number) {
    // TODO: Implement item addition logic based on itemType
    // This would involve finding an empty slot or stacking items
  }

  private checkTemporaryEvents(): TemporaryEventResult[] {
    const triggered: TemporaryEventResult[] = [];
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    
    this.temporaryEvents.forEach((tempEvent, id) => {
      // Check if already triggered max times
      const triggerCount = this.gameState.temporary_event_triggers[id] || 0;
      if (triggerCount >= tempEvent.max_triggers) return;
      
      // Check condition
      if (!conditionParser.evaluate(tempEvent.trigger_condition)) return;
      
      // Trigger the event
      this.gameState.temporary_event_triggers[id] = triggerCount + 1;
      
      // Apply effects
      const changes: Record<number, number> = {};
      this.applyTemporaryEventChanges(tempEvent, changes);
      
      // Check for ending
      let ending: Ending | undefined;
      if (tempEvent.ending_triggered) {
        ending = this.endings.get(tempEvent.ending_triggered);
        if (ending) {
          this.gameState.game_over = true;
          this.gameState.current_ending = ending;
        }
      }
      
      // Get text
      const text = typeof tempEvent.text_id === 'number' 
        ? this.gameTexts.get(tempEvent.text_id)
        : undefined;
      
      triggered.push({
        temp_event_id: id,
        event_name: tempEvent.event_name,
        text_id: tempEvent.text_id,
        text_content: text ? text.chinese_text : tempEvent.event_name,
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
        const oldValue = this.gameState.resources[id] || 0;
        const newValue = this.clampResourceValue(id, oldValue + change);
        this.gameState.resources[id] = newValue;
        changes[id] = newValue - oldValue;
      }
    });

    // Handle calculated changes
    if (tempEvent.project_progress_change) {
      const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
      if (typeof tempEvent.project_progress_change === 'string') {
        const setOp = conditionParser.evaluateSetOperation(tempEvent.project_progress_change);
        if (setOp) {
          this.gameState.resources[setOp.resourceId] = setOp.value;
          changes[setOp.resourceId] = setOp.value;
        }
      }
    }
  }

  private checkScheduledTasks(): ScheduledTaskResult[] {
    const triggered: ScheduledTaskResult[] = [];
    const timeInfo = this.getTimeInfo();
    const conditionParser = new ConditionParser(this.gameState.resources, timeInfo);
    
    this.scheduledTasks.forEach((task, id) => {
      if (!task.is_active) return;
      
      // Check trigger condition
      if (!conditionParser.evaluate(task.trigger_condition)) return;
      
      // Check trigger time
      if (!conditionParser.evaluate(task.trigger_time)) return;
      
      // Check if enough time has passed since last trigger
      const lastTrigger = this.gameState.last_task_triggers[id] || 0;
      const currentTime = this.gameState.resources[1];
      const intervalInTimeUnits = task.repeat_interval * 48; // Convert days to time units
      
      if (currentTime - lastTrigger < intervalInTimeUnits) return;
      
      // Trigger the task
      this.gameState.last_task_triggers[id] = currentTime;
      
      // Apply effects
      const changes: Record<number, number> = {};
      this.applyScheduledTaskChanges(task, changes);
      
      // Get text
      const text = typeof task.text_id === 'number' 
        ? this.gameTexts.get(task.text_id)
        : undefined;
      
      triggered.push({
        task_id: id,
        task_name: task.task_name,
        text_id: task.text_id,
        text_content: text ? text.chinese_text : task.task_name,
        resource_changes: changes
      });
    });
    
    return triggered;
  }

  private applyScheduledTaskChanges(task: ScheduledTask, changes: Record<number, number>) {
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    
    // Handle calculated money changes
    if (task.money_change) {
      let moneyChange = 0;
      if (typeof task.money_change === 'string') {
        if (task.money_change.startsWith('calc[')) {
          moneyChange = conditionParser.evaluateExpression(task.money_change);
        } else if (task.money_change.startsWith('conditional[')) {
          moneyChange = conditionParser.evaluateExpression(task.money_change);
        }
      } else {
        moneyChange = task.money_change;
      }
      
      if (moneyChange !== 0) {
        const oldValue = this.gameState.resources[2] || 0;
        const newValue = this.clampResourceValue(2, oldValue + moneyChange);
        this.gameState.resources[2] = newValue;
        changes[2] = newValue - oldValue;
      }
    }

    // Handle project progress changes
    if (task.project_progress_change) {
      if (typeof task.project_progress_change === 'string') {
        if (task.project_progress_change.startsWith('calc[')) {
          const progress = conditionParser.evaluateExpression(task.project_progress_change);
          const oldValue = this.gameState.resources[23] || 0;
          const newValue = this.clampResourceValue(23, oldValue + progress);
          this.gameState.resources[23] = newValue;
          changes[23] = newValue - oldValue;
        } else if (task.project_progress_change.startsWith('set[')) {
          const setOp = conditionParser.evaluateSetOperation(task.project_progress_change);
          if (setOp) {
            this.gameState.resources[setOp.resourceId] = setOp.value;
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
        const oldValue = this.gameState.resources[id] || 0;
        const newValue = this.clampResourceValue(id, oldValue + change);
        this.gameState.resources[id] = newValue;
        changes[id] = newValue - oldValue;
      }
    });
  }

  private applyNightTimeBonus() {
    // Night time bonuses are applied when events are executed during night time
    // This is handled in the event execution logic
  }

  private checkEndings(): Ending | undefined {
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    
    for (const [id, ending] of this.endings) {
      if (conditionParser.evaluate(ending.trigger_condition)) {
        return ending;
      }
    }
    
    return undefined;
  }

  private getTimeInfo(): TimeInfo {
    const currentTime = this.gameState.resources[1] || 14;
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

  // Query methods
  private queryResource(resourceId: number) {
    const resource = this.resources.get(resourceId);
    const value = this.gameState.resources[resourceId] || 0;
    
    return {
      type: 'query_result',
      data: {
        resource_id: resourceId,
        resource_name: resource?.resource_name || 'Unknown',
        value: value,
        max_value: resource?.max_value || 0,
        min_value: resource?.min_value || 0
      }
    };
  }

  private queryLocation(locationId?: number) {
    const currentLocationId = locationId || this.gameState.resources[61];
    const location = this.locations.get(currentLocationId);
    
    return {
      type: 'query_result',
      data: {
        location_id: currentLocationId,
        location_name: location?.location_name || 'Unknown',
        available_entities: location?.available_entities || []
      }
    };
  }

  private queryAvailableEvents() {
    const currentLocation = this.gameState.resources[61];
    const conditionParser = new ConditionParser(this.gameState.resources, this.getTimeInfo());
    const availableEvents: Event[] = [];
    
    this.events.forEach(event => {
      // Check location
      if (event.location_requirement && event.location_requirement !== currentLocation) {
        return;
      }
      
      // Check conditions
      if (!conditionParser.evaluate(event.condition_expression)) {
        return;
      }
      
      availableEvents.push(event);
    });
    
    return {
      type: 'query_result',
      data: {
        available_events: availableEvents.map(e => ({
          event_id: e.event_id,
          event_name: e.event_name,
          time_cost: e.time_cost
        }))
      }
    };
  }

  private queryInventory() {
    const inventory = [];
    
    // Check inventory slots (resources 3-12)
    for (let i = 3; i <= 11; i += 2) {
      const itemId = this.gameState.resources[i] || 0;
      const quantity = this.gameState.resources[i + 1] || 0;
      
      if (itemId > 0 && quantity > 0) {
        const item = this.items.get(itemId);
        inventory.push({
          slot: Math.floor((i - 3) / 2) + 1,
          item_id: itemId,
          item_name: item?.item_name || 'Unknown',
          quantity: quantity
        });
      }
    }
    
    return {
      type: 'query_result',
      data: { inventory }
    };
  }

  private useItem(itemSlot: number) {
    // TODO: Implement item usage logic
    return {
      type: 'error',
      error: 'Item usage not yet implemented'
    };
  }

  private saveGame() {
    // Simple base64 encoding without Buffer
    const stateStr = JSON.stringify(this.gameState);
    const saveData = base64Encode(stateStr);
    return {
      type: 'game_saved',
      data: { save_data: saveData }
    };
  }

  private loadGame(saveData: string) {
    try {
      const stateStr = base64Decode(saveData);
      this.gameState = JSON.parse(stateStr);
      return {
        type: 'game_loaded',
        data: { success: true }
      };
    } catch (error) {
      return {
        type: 'error',
        error: 'Failed to load save data'
      };
    }
  }

  private getGameState() {
    return {
      type: 'query_result',
      data: {
        resources: this.gameState.resources,
        game_over: this.gameState.game_over,
        current_ending: this.gameState.current_ending,
        time_info: this.getTimeInfo()
      }
    };
  }

  // Public interface for command queue
  addCommand(command: string) {
    this.commandQueue.push(command);
  }

  getNextResponse(): any | null {
    if (this.responseQueue.length === 0 && this.commandQueue.length > 0) {
      const command = this.commandQueue.shift()!;
      const response = this.processCommand(command);
      this.responseQueue.push(response);
    }
    
    return this.responseQueue.shift() || null;
  }
} 