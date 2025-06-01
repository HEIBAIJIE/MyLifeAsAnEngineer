# My Life As An Engineer - Backend Documentation

## Overview

This is the TypeScript backend for "My Life As An Engineer" game. It features a modular architecture with specialized managers and provides both a command interface and a complete CLI frontend.

## Installation

```bash
npm install
npm run build
```

## Usage

### Running the Game
```bash
# Start the complete CLI game
npm start
# or
npm run dev

# Run frontend only
npm run frontend

# Run backend CLI for testing
npx ts-node src/index.ts
```

### Integrating with External Frontend

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
  },
  "language": "zh" | "en"  // optional, defaults to "zh"
}
```

### Available Commands

1. **Execute Event**
   ```json
   {
     "type": "execute_event",
     "params": {
       "event_id": 31
     },
     "language": "zh"
   }
   ```

2. **Query Resource**
   ```json
   {
     "type": "query_resource",
     "params": {
       "resource_id": 1
     },
     "language": "zh"
   }
   ```

3. **Query Location**
   ```json
   {
     "type": "query_location",
     "params": {
       "location_id": 1
     },
     "language": "zh"
   }
   ```

4. **Query Available Events**
   ```json
   {
     "type": "query_available_events",
     "language": "zh"
   }
   ```

5. **Query Inventory**
   ```json
   {
     "type": "query_inventory",
     "language": "zh"
   }
   ```

6. **Use Item**
   ```json
   {
     "type": "use_item",
     "params": {
       "item_slot": 1
     },
     "language": "zh"
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
    "game_text": "老板分配了今天的任务...",
    "time_cost": 1,
    "resource_changes": [
      {
        "resource_id": 23,
        "resource_name": "项目进度",
        "change": 5
      }
    ],
    "temporary_events": [
      {
        "event_id": 1,
        "event_name": "疲劳警告",
        "description": "你感到有些疲劳..."
      }
    ],
    "scheduled_tasks": [
      {
        "task_id": 1,
        "task_name": "发工资",
        "description": "收到了本月工资"
      }
    ],
    "ending_triggered": null
  }
}
```

## Architecture

The backend uses a modular architecture with specialized managers:

### Core Components
- **`GameEngine`**: Main orchestrator that coordinates all managers
- **`GameDataManager`**: Loads and manages CSV data (events, resources, items, etc.)
- **`ResourceManager`**: Handles all resource values and game state
- **`TimeManager`**: Manages game time, day/night cycles, weekends
- **`EventProcessor`**: Processes event execution and effects
- **`QueryService`**: Handles all query operations
- **`SaveManager`**: Manages game save/load functionality

### File Structure
```
src/
├── index.ts              # Main entry point and command interface
├── gameEngine.ts         # Game engine orchestrator
├── types.ts              # TypeScript interfaces
├── csvLoader.ts          # CSV file loading utilities
├── conditionParser.ts    # Complex condition evaluation
├── utils.ts              # Utility functions
├── managers/             # Specialized manager classes
│   ├── GameDataManager.ts
│   ├── ResourceManager.ts
│   ├── TimeManager.ts
│   ├── EventProcessor.ts
│   ├── QueryService.ts
│   └── SaveManager.ts
└── frontend/             # Complete CLI frontend
    ├── controllers/
    ├── components/
    └── services/
```

## Game Features

### Core Systems
- **Resource System**: 82+ different resources including time, money, health, skills, etc.
- **Event System**: 200+ events with complex conditions and calculations
- **Item System**: Inventory management with food, tools, and books
- **Entity System**: Interactive NPCs and objects
- **Temporary Events**: State-triggered events (fatigue warnings, promotions, etc.)
- **Scheduled Tasks**: Periodic events (salary, rent, etc.)
- **Ending System**: 13+ different endings based on game state
- **Localization**: Full Chinese/English language support

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

## CLI Frontend

The backend includes a complete command-line frontend with:
- **Beautiful Unicode Interface**: Tables, borders, and emoji icons
- **Real-time Status Display**: All game attributes and status
- **Smart Event Grouping**: Events categorized by time consumption
- **Multi-language Support**: Chinese and English interfaces
- **Save/Load System**: Base64-encoded save states

### Frontend Controls
- **Numbers 1-6**: Quick location switching
- **Numbers 7+**: Execute events
- **Letter Commands**:
  - `s` - Save game
  - `l` - Load game
  - `i` - View inventory
  - `h` - Show help
  - `q` - Quit game
  - `lang` - Switch language

## Configuration

All game content is configured through CSV files in the `/csv` directory:
- `resources.csv`: Resource definitions (82 resources)
- `events.csv`: Player-triggered events (200+ events)
- `items.csv`: Item definitions
- `entities.csv`: Interactive entities
- `temporary_events.csv`: State-triggered events
- `scheduled_tasks.csv`: Periodic tasks
- `locations.csv`: Game locations
- `endings.csv`: Game endings
- `game_texts/`: Localized text content

## Save System

The game state can be saved and loaded as base64-encoded JSON strings. This allows for:
- Platform-independent save files
- Easy transfer between devices
- No file system dependencies
- Human-readable save codes

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run frontend-specific tests
npm run test:frontend

# Watch mode for development
npm run test:watch
```

## Development

### Adding New Features
1. Define interfaces in `types.ts`
2. Add CSV configuration if needed
3. Implement logic in appropriate manager
4. Update command interface in `GameEngine`
5. Add frontend support if needed

### Manager Dependencies
```
GameDataManager (base)
    ↓
ResourceManager
    ↓
TimeManager
    ↓
EventProcessor, QueryService, SaveManager
```

## Performance

- **Fast CSV Loading**: Optimized parsing with caching
- **Efficient Condition Evaluation**: Compiled expression trees
- **Memory Management**: Minimal object creation during gameplay
- **Responsive CLI**: Non-blocking input handling

---

This backend provides a complete, production-ready game engine with both programmatic API access and a full-featured command-line interface. 