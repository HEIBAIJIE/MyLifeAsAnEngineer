# My Life As An Engineer - Backend Documentation

## Overview

This is the TypeScript backend for "My Life As An Engineer" game. It's designed to run independently from the Cocos frontend and provides a string-based command interface.

## Installation

```bash
npm install
npm run build
```

## Usage

### Running the CLI
```bash
npm start
```

### Integrating with Frontend

The backend exposes two main functions:

```typescript
// Synchronous command processing
import { sendCommand } from './dist/index';

const response = sendCommand('{"type":"execute_event","params":{"event_id":31}}');
console.log(JSON.parse(response));

// Queue-based processing
import { addCommandToQueue, getNextResponse } from './dist/index';

addCommandToQueue('{"type":"query_resource","params":{"resource_id":1}}');
const response = getNextResponse();
if (response) {
  console.log(JSON.parse(response));
}
```

## Command Interface

All commands are JSON strings with the following structure:
```json
{
  "type": "command_type",
  "params": {
    // command-specific parameters
  }
}
```

### Available Commands

1. **Execute Event**
   ```json
   {
     "type": "execute_event",
     "params": {
       "event_id": 31
     }
   }
   ```

2. **Query Resource**
   ```json
   {
     "type": "query_resource",
     "params": {
       "resource_id": 1
     }
   }
   ```

3. **Query Location**
   ```json
   {
     "type": "query_location"
   }
   ```

4. **Query Available Events**
   ```json
   {
     "type": "query_available_events"
   }
   ```

5. **Query Inventory**
   ```json
   {
     "type": "query_inventory"
   }
   ```

6. **Use Item**
   ```json
   {
     "type": "use_item",
     "params": {
       "item_slot": 1
     }
   }
   ```

7. **Save Game**
   ```json
   {
     "type": "save_game"
   }
   ```

8. **Load Game**
   ```json
   {
     "type": "load_game",
     "params": {
       "save_data": "base64_encoded_save_data"
     }
   }
   ```

9. **Get Game State**
   ```json
   {
     "type": "get_game_state"
   }
   ```

10. **Get Time Info**
    ```json
    {
      "type": "get_time_info"
    }
    ```

## Response Format

All responses are JSON objects with the following structure:

### Success Response
```json
{
  "type": "event_result" | "query_result" | "game_saved" | "game_loaded",
  "data": {
    // response-specific data
  }
}
```

### Error Response
```json
{
  "type": "error",
  "error": "Error message"
}
```

### Event Result
```json
{
  "type": "event_result",
  "data": {
    "success": true,
    "event_id": 31,
    "event_name": "询问今日工作（职级1）",
    "text_id": 1,
    "text_content": "老板分配了今天的任务...",
    "time_consumed": 1,
    "resource_changes": {
      "23": 5  // resource_id: change_amount
    },
    "temporary_events_triggered": [],
    "scheduled_tasks_triggered": [],
    "ending_triggered": null
  }
}
```

## Game Features

### Core Systems
- **Resource System**: 82 different resources including time, money, health, skills, etc.
- **Event System**: 200+ events with complex conditions and calculations
- **Item System**: Inventory management with food and tools
- **Entity System**: Interactive NPCs and objects
- **Temporary Events**: State-triggered events (fatigue warnings, promotions, etc.)
- **Scheduled Tasks**: Periodic events (salary, rent, etc.)
- **Ending System**: 13 different endings based on game state

### Special Features
- **Dual Philosophy System**: Balance between rational and emotional approaches
- **Day/Night Cycle**: 48 time units per day with night-time bonuses
- **Weekend System**: Different available events on weekends
- **Permanent Effects**: Tools that provide ongoing bonuses
- **Social System**: Relationships with colleagues affect gameplay
- **Career Progression**: 10 job levels with different responsibilities

### Condition System
The game uses a sophisticated condition parser supporting:
- Resource comparisons: `resource[14]>50`
- Time conditions: `time[weekend]==true`
- Complex logic: `resource[22]==1&resource[20]>=5`
- Calculations: `calc[8000+2000*resource[22]]`
- Conditionals: `conditional[resource[2]>=2800?0:-2800]`

## Architecture

The backend is structured as follows:

- `types.ts`: TypeScript interfaces for all game data
- `csvLoader.ts`: Loads and parses CSV configuration files
- `conditionParser.ts`: Evaluates complex condition expressions
- `gameEngine.ts`: Main game logic and state management
- `index.ts`: Command interface and CLI
- `utils.ts`: Utility functions

## Save System

The game state can be saved and loaded as base64-encoded JSON strings. This allows for:
- Platform-independent save files
- Easy transfer between devices
- No file system dependencies

## Configuration

All game content is configured through CSV files in the `/csv` directory:
- `resources.csv`: Resource definitions
- `events.csv`: Player-triggered events
- `items.csv`: Item definitions
- `entities.csv`: Interactive entities
- `temporary_events.csv`: State-triggered events
- `scheduled_tasks.csv`: Periodic tasks
- `locations.csv`: Game locations
- `endings.csv`: Game endings
- `game_texts/`: Localized text content 