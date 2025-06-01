import { GameController } from './controllers/GameController';

// Export the main GameController for external use
export { GameController } from './controllers/GameController';
export { GameService } from './services/GameService';
export { LocalizationService } from './services/LocalizationService';

// Export all types
export * from './types';

// Main entry point
if (require.main === module) {
  const gameController = new GameController();
  gameController.start().catch(console.error);
} 