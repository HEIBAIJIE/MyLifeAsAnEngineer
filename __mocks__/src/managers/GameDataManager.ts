export class GameDataManager {
  getResource = jest.fn().mockReturnValue({
    resource_id: 1,
    resource_name: 'Test Resource',
    resource_name_en: 'Test Resource'
  });
} 