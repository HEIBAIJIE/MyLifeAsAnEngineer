export class QueryService {
  queryResource = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { resource_id: 1, value: 100 }
  });

  queryLocation = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { location_id: 1, name: 'Test Location' }
  });

  queryAvailableEvents = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { events: [] }
  });

  queryInventory = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { items: [] }
  });

  getGameState = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { state: 'running' }
  });

  getTimeInfo = jest.fn().mockReturnValue({
    type: 'query_result',
    data: { hour: 14, day: 1 }
  });
} 