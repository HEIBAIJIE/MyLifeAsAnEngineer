export class EventProcessor {
  executeEvent = jest.fn().mockReturnValue({
    success: true,
    event_id: 1,
    event_name: 'Test Event',
    text_id: 1,
    text_content: 'Test event executed',
    time_consumed: 2,
    resource_changes: {},
    temporary_events_triggered: [],
    scheduled_tasks_triggered: [],
    ending_triggered: null
  });
} 