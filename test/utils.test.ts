import { 
  base64Encode, 
  base64Decode, 
  log, 
  error, 
  getResourceName, 
  getTaskName, 
  getEventName, 
  getLocalizedText 
} from '../src/utils';

describe('Utils', () => {
  describe('Base64 encoding/decoding', () => {
    test('should encode and decode strings correctly', () => {
      const testStrings = [
        'Hello World',
        'Test123',
        'Special chars: !@#$%^&*()',
        ''
      ];

      testStrings.forEach(str => {
        const encoded = base64Encode(str);
        const decoded = base64Decode(encoded);
        expect(decoded).toEqual(str);
      });
    });

    test('should handle empty string', () => {
      const encoded = base64Encode('');
      expect(encoded).toBe('');
      const decoded = base64Decode('');
      expect(decoded).toBe('');
    });

    test('should handle unicode characters', () => {
      const unicodeStr = '测试';
      const encoded = base64Encode(unicodeStr);
      const decoded = base64Decode(encoded);
      expect(decoded).toBe(unicodeStr);
    });

    test('should decode standard base64 strings', () => {
      // Test with known base64 values
      expect(base64Decode('SGVsbG8gV29ybGQ=')).toEqual('Hello World');
      expect(base64Decode('VGVzdDEyMw==')).toEqual('Test123');
    });
  });

  describe('Logging functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should call console.log when available', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      log('test message', 123);
      expect(consoleSpy).toHaveBeenCalledWith('test message', 123);
    });

    test('should call console.error when available', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      error('error message', 'details');
      expect(consoleSpy).toHaveBeenCalledWith('error message', 'details');
    });

    test('should handle missing console gracefully', () => {
      const originalConsole = global.console;
      // @ts-ignore
      global.console = undefined;
      
      expect(() => log('test')).not.toThrow();
      expect(() => error('test')).not.toThrow();
      
      global.console = originalConsole;
    });
  });

  describe('Language utilities', () => {
    const mockResource = {
      resource_name: '健康',
      resource_name_en: 'Health'
    };

    const mockTask = {
      task_name: '工作',
      task_name_en: 'Work'
    };

    const mockEvent = {
      event_name_cn: '吃饭',
      event_name_en: 'Eat'
    };

    const mockGameText = {
      text_content: '你感到很饿',
      text_content_en: 'You feel hungry'
    };

    describe('getResourceName', () => {
      test('should return Chinese name by default', () => {
        expect(getResourceName(mockResource)).toBe('健康');
      });

      test('should return Chinese name when language is zh', () => {
        expect(getResourceName(mockResource, 'zh')).toBe('健康');
      });

      test('should return English name when language is en', () => {
        expect(getResourceName(mockResource, 'en')).toBe('Health');
      });
    });

    describe('getTaskName', () => {
      test('should return Chinese name by default', () => {
        expect(getTaskName(mockTask)).toBe('工作');
      });

      test('should return Chinese name when language is zh', () => {
        expect(getTaskName(mockTask, 'zh')).toBe('工作');
      });

      test('should return English name when language is en', () => {
        expect(getTaskName(mockTask, 'en')).toBe('Work');
      });
    });

    describe('getEventName', () => {
      test('should return Chinese name by default', () => {
        expect(getEventName(mockEvent)).toBe('吃饭');
      });

      test('should return Chinese name when language is zh', () => {
        expect(getEventName(mockEvent, 'zh')).toBe('吃饭');
      });

      test('should return English name when language is en', () => {
        expect(getEventName(mockEvent, 'en')).toBe('Eat');
      });
    });

    describe('getLocalizedText', () => {
      test('should return Chinese text by default', () => {
        expect(getLocalizedText(mockGameText)).toBe('你感到很饿');
      });

      test('should return Chinese text when language is zh', () => {
        expect(getLocalizedText(mockGameText, 'zh')).toBe('你感到很饿');
      });

      test('should return English text when language is en', () => {
        expect(getLocalizedText(mockGameText, 'en')).toBe('You feel hungry');
      });
    });
  });
}); 