export class SaveManager {
  saveGame = jest.fn().mockReturnValue({
    type: 'game_saved',
    data: { save_data: 'test_save_data' }
  });

  loadGame = jest.fn().mockReturnValue({
    type: 'game_loaded',
    data: { success: true }
  });
} 