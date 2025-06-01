import { ConditionParser } from '../src/conditionParser';
import { TimeInfo } from '../src/types';

describe('ConditionParser', () => {
  let parser: ConditionParser;
  let mockResources: Record<number, number>;
  let mockTimeInfo: TimeInfo;

  beforeEach(() => {
    mockResources = {
      1: 100,  // Some resource
      2: 2500, // Money
      13: 80,  // Health
      14: 80,  // Fatigue
      15: 80,  // Hunger
      16: 90,  // Rational
      17: 85,  // Emotional
      18: 75,  // Focus
      19: 80,  // Mood
      20: 80   // Skill - all attributes > 60
    };

    mockTimeInfo = {
      current_time: 1000,
      hour: 14,
      day: 15,
      day_of_week: 3,
      is_weekend: false,
      is_workday: true,
      is_night: false
    };

    parser = new ConditionParser(mockResources, mockTimeInfo);
  });

  describe('Basic condition evaluation', () => {
    test('should return true for "always" condition', () => {
      expect(parser.evaluate('always')).toBe(true);
    });

    test('should return false for "never" condition', () => {
      expect(parser.evaluate('never')).toBe(false);
    });

    test('should return true for empty condition', () => {
      expect(parser.evaluate('')).toBe(true);
    });

    test('should handle null/undefined conditions', () => {
      expect(parser.evaluate(null as any)).toBe(true);
      expect(parser.evaluate(undefined as any)).toBe(true);
    });
  });

  describe('Comparison operations', () => {
    test('should handle equality comparisons', () => {
      expect(parser.evaluate('resource[1]==100')).toBe(true);
      expect(parser.evaluate('resource[1]==99')).toBe(false);
    });

    test('should handle inequality comparisons', () => {
      expect(parser.evaluate('resource[1]!=99')).toBe(true);
      expect(parser.evaluate('resource[1]!=100')).toBe(false);
    });

    test('should handle greater than comparisons', () => {
      expect(parser.evaluate('resource[1]>99')).toBe(true);
      expect(parser.evaluate('resource[1]>100')).toBe(false);
    });

    test('should handle less than comparisons', () => {
      expect(parser.evaluate('resource[1]<101')).toBe(true);
      expect(parser.evaluate('resource[1]<100')).toBe(false);
    });

    test('should handle greater than or equal comparisons', () => {
      expect(parser.evaluate('resource[1]>=100')).toBe(true);
      expect(parser.evaluate('resource[1]>=101')).toBe(false);
    });

    test('should handle less than or equal comparisons', () => {
      expect(parser.evaluate('resource[1]<=100')).toBe(true);
      expect(parser.evaluate('resource[1]<=99')).toBe(false);
    });
  });

  describe('Logical operations', () => {
    test('should handle AND operations', () => {
      expect(parser.evaluate('resource[1]>50 & resource[2]>2000')).toBe(true);
      expect(parser.evaluate('resource[1]>50 & resource[2]>3000')).toBe(false);
    });

    test('should handle OR operations', () => {
      expect(parser.evaluate('resource[1]>150 | resource[2]>2000')).toBe(true);
      expect(parser.evaluate('resource[1]>150 | resource[2]>3000')).toBe(false);
    });

    test('should handle NOT operations', () => {
      expect(parser.evaluate('!resource[1]>150')).toBe(true);
      expect(parser.evaluate('!resource[1]>50')).toBe(false);
    });

    test('should handle complex logical combinations', () => {
      expect(parser.evaluate('resource[1]>50 & (resource[2]>2000 | resource[13]>90)')).toBe(true);
      expect(parser.evaluate('resource[1]>150 & (resource[2]>2000 | resource[13]>90)')).toBe(false);
    });
  });

  describe('Special conditions', () => {
    test('should handle rent_payment_failed condition', () => {
      mockResources[2] = 2700; // Money < 2800
      parser = new ConditionParser(mockResources, mockTimeInfo);
      expect(parser.evaluate('rent_payment_failed')).toBe(true);

      mockResources[2] = 3000; // Money >= 2800
      parser = new ConditionParser(mockResources, mockTimeInfo);
      expect(parser.evaluate('rent_payment_failed')).toBe(false);
    });

    test('should handle all_attributes>60 condition', () => {
      // Debug: check individual attributes
      console.log('Resource 13 (Health):', mockResources[13]);
      console.log('Resource 14 (Fatigue):', mockResources[14]);
      console.log('Resource 15 (Hunger):', mockResources[15]);
      console.log('Resource 16 (Rational):', mockResources[16]);
      console.log('Resource 17 (Emotional):', mockResources[17]);
      console.log('Resource 18 (Focus):', mockResources[18]);
      console.log('Resource 19 (Mood):', mockResources[19]);
      console.log('Resource 20 (Skill):', mockResources[20]);
      
      // All attributes > 60
      const result = parser.evaluate('all_attributes>60');
      console.log('all_attributes>60 result:', result);
      expect(result).toBe(true);

      // One attribute <= 60
      mockResources[20] = 60; // Skill = 60
      parser = new ConditionParser(mockResources, mockTimeInfo);
      expect(parser.evaluate('all_attributes>60')).toBe(false);
    });

    test('should handle no_attribute<30 condition', () => {
      // No attributes < 30
      expect(parser.evaluate('no_attribute<30')).toBe(true);

      // One attribute < 30
      mockResources[20] = 25; // Skill = 25
      parser = new ConditionParser(mockResources, mockTimeInfo);
      expect(parser.evaluate('no_attribute<30')).toBe(false);
    });
  });

  describe('Expression evaluation', () => {
    test('should evaluate resource references', () => {
      expect(parser['evaluateExpression']('resource[1]')).toBe(100);
      expect(parser['evaluateExpression']('resource[999]')).toBe(0); // Non-existent resource
    });

    test('should evaluate time references', () => {
      expect(parser['evaluateExpression']('time[hour]')).toBe(14);
      expect(parser['evaluateExpression']('time[day]')).toBe(15);
      expect(parser['evaluateExpression']('time[workday]')).toBe(1);
      expect(parser['evaluateExpression']('time[weekend]')).toBe(0);
    });

    test('should evaluate numeric values', () => {
      expect(parser['evaluateExpression']('42')).toBe(42);
      expect(parser['evaluateExpression']('3.14')).toBe(3.14);
      expect(parser['evaluateExpression']('-10')).toBe(-10);
    });

    test('should evaluate boolean values', () => {
      expect(parser['evaluateExpression']('true')).toBe(1);
      expect(parser['evaluateExpression']('false')).toBe(0);
    });

    test('should handle floor function', () => {
      expect(parser['evaluateExpression']('floor[3.7]')).toBe(3);
      expect(parser['evaluateExpression']('floor[resource[1]]')).toBe(100); // floor(100) = 100
    });

    test('should handle conditional expressions', () => {
      expect(parser['evaluateExpression']('conditional[resource[1]>50?100:0]')).toBe(100);
      expect(parser['evaluateExpression']('conditional[resource[1]>150?100:0]')).toBe(0);
    });
  });

  describe('Calculation evaluation', () => {
    test('should evaluate basic arithmetic', () => {
      expect(parser['evaluateCalculation']('10+5')).toBe(15);
      expect(parser['evaluateCalculation']('20-8')).toBe(12);
      expect(parser['evaluateCalculation']('6*7')).toBe(42);
      expect(parser['evaluateCalculation']('15/3')).toBe(5);
    });

    test('should evaluate expressions with resources', () => {
      expect(parser['evaluateCalculation']('resource[1]+50')).toBe(150);
      expect(parser['evaluateCalculation']('resource[1]*2')).toBe(200);
      expect(parser['evaluateCalculation']('resource[1]/4')).toBe(25);
    });

    test('should evaluate expressions with time', () => {
      expect(parser['evaluateCalculation']('time[hour]+1')).toBe(15);
      expect(parser['evaluateCalculation']('time[day]*2')).toBe(30);
    });

    test('should handle complex calculations', () => {
      expect(parser['evaluateCalculation']('(resource[1]+resource[2])/2')).toBe(1300); // (100+2500)/2
      expect(parser['evaluateCalculation']('resource[1]*time[hour]/10')).toBe(140); // 100*14/10
    });
  });

  describe('Safe evaluation', () => {
    test('should handle invalid expressions safely', () => {
      expect(() => parser['safeEval']('invalid_expression')).toThrow();
      expect(() => parser['safeEval']('alert("hack")')).toThrow();
      expect(() => parser['safeEval']('console.log("test")')).toThrow();
    });

    test('should allow valid mathematical expressions', () => {
      expect(parser['safeEval']('1+2*3')).toBe(7);
      expect(parser['safeEval']('(10+5)*2')).toBe(30);
      expect(() => parser['safeEval']('Math.pow(2,3)')).toThrow(); // Math functions not allowed
    });
  });

  describe('Time property evaluation', () => {
    test('should get correct time properties', () => {
      expect(parser['getTimeProperty']('hour')).toBe(14);
      expect(parser['getTimeProperty']('day')).toBe(15);
      expect(parser['getTimeProperty']('day_of_week')).toBe(3);
      expect(parser['getTimeProperty']('workday')).toBe(1);
      expect(parser['getTimeProperty']('weekend')).toBe(0);
      expect(parser['getTimeProperty']('activated')).toBe(1);
    });

    test('should handle last_day_of_month', () => {
      expect(parser['getTimeProperty']('last_day_of_month')).toBe(0);
      
      mockTimeInfo.day = 30;
      parser = new ConditionParser(mockResources, mockTimeInfo);
      expect(parser['getTimeProperty']('last_day_of_month')).toBe(1);
    });

    test('should return 0 for unknown properties', () => {
      expect(parser['getTimeProperty']('unknown_property')).toBe(0);
    });
  });

  describe('Set operation evaluation', () => {
    test('should parse set operations', () => {
      const result = parser['evaluateSetOperation']('set[1]=50');
      expect(result).toEqual({ resourceId: 1, value: 50 });
    });

    test('should return null for non-set operations', () => {
      const result = parser['evaluateSetOperation']('resource[1]>50');
      expect(result).toBeNull();
    });

    test('should handle invalid set operations', () => {
      const result = parser['evaluateSetOperation']('set[invalid]=value');
      expect(result).toBeNull();
    });
  });

  describe('Error handling', () => {
    test('should handle malformed conditions gracefully', () => {
      expect(parser.evaluate('resource[1]>>')).toBe(false);
      expect(parser.evaluate('resource[abc]>50')).toBe(false);
      expect(parser.evaluate('invalid_syntax')).toBe(false);
    });

    test('should handle division by zero', () => {
      expect(parser['evaluateCalculation']('10/0')).toBe(Infinity);
    });

    test('should handle empty calculations', () => {
      expect(parser['evaluateCalculation']('')).toBe(0);
    });
  });
}); 