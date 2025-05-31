import { GameState, TimeInfo } from './types';
import { error } from './utils';

export class ConditionParser {
  private resources: Record<number, number>;
  private timeInfo: TimeInfo;

  constructor(resources: Record<number, number>, timeInfo: TimeInfo) {
    this.resources = resources;
    this.timeInfo = timeInfo;
  }

  // Main evaluation method
  evaluate(condition: string): boolean {
    if (!condition || condition === 'always') return true;
    if (condition === 'never') return false;
    
    try {
      return this.parseCondition(condition);
    } catch (err) {
      error(`Error evaluating condition: ${condition}`, err);
      return false;
    }
  }

  // Parse and evaluate a condition expression
  private parseCondition(condition: string): boolean {
    // Handle OR conditions
    if (condition.includes('|')) {
      return condition.split('|').some(part => this.parseCondition(part.trim()));
    }
    
    // Handle AND conditions
    if (condition.includes('&')) {
      return condition.split('&').every(part => this.parseCondition(part.trim()));
    }
    
    // Handle NOT conditions
    if (condition.startsWith('!')) {
      return !this.parseCondition(condition.substring(1).trim());
    }
    
    // Handle comparison operations
    const comparisonMatch = condition.match(/(.+?)(==|!=|>=|<=|>|<)(.+)/);
    if (comparisonMatch) {
      const [, left, operator, right] = comparisonMatch;
      const leftValue = this.evaluateExpression(left.trim());
      const rightValue = this.evaluateExpression(right.trim());
      
      switch (operator) {
        case '==': return leftValue === rightValue;
        case '!=': return leftValue !== rightValue;
        case '>=': return leftValue >= rightValue;
        case '<=': return leftValue <= rightValue;
        case '>': return leftValue > rightValue;
        case '<': return leftValue < rightValue;
        default: return false;
      }
    }
    
    // Handle special conditions
    if (condition === 'rent_payment_failed') {
      return this.resources[2] < 2800; // Money < rent
    }
    
    if (condition === 'all_attributes>60') {
      const attributeIds = [13, 14, 15, 16, 17, 18, 19, 20]; // Health, fatigue, hunger, rational, emotional, focus, mood, skill
      return attributeIds.every(id => this.resources[id] > 60);
    }
    
    if (condition === 'no_attribute<30') {
      const attributeIds = [13, 14, 15, 16, 17, 18, 19, 20];
      return !attributeIds.some(id => this.resources[id] < 30);
    }
    
    // TODO: Handle more complex conditions like consecutive_7days, skill_not_improved_for_15_days, etc.
    
    return false;
  }

  // Evaluate an expression to get a numeric value
  evaluateExpression(expression: string): number {
    expression = expression.trim();
    
    // Handle resource references
    const resourceMatch = expression.match(/resource\[(\d+)\]/);
    if (resourceMatch) {
      const resourceId = parseInt(resourceMatch[1]);
      return this.resources[resourceId] || 0;
    }
    
    // Handle time references
    const timeMatch = expression.match(/time\[(\w+)\]/);
    if (timeMatch) {
      const property = timeMatch[1];
      return this.getTimeProperty(property);
    }
    
    // Handle calc expressions
    const calcMatch = expression.match(/calc\[(.+)\]/);
    if (calcMatch) {
      return this.evaluateCalculation(calcMatch[1]);
    }
    
    // Handle floor function
    const floorMatch = expression.match(/floor\[(.+)\]/);
    if (floorMatch) {
      return Math.floor(this.evaluateExpression(floorMatch[1]));
    }
    
    // Handle conditional expressions
    const conditionalMatch = expression.match(/conditional\[(.+?)\?(.+?):(.+?)\]/);
    if (conditionalMatch) {
      const [, condition, trueValue, falseValue] = conditionalMatch;
      return this.parseCondition(condition) 
        ? this.evaluateExpression(trueValue) 
        : this.evaluateExpression(falseValue);
    }
    
    // Handle true/false as 1/0
    if (expression === 'true') return 1;
    if (expression === 'false') return 0;
    
    // Handle numeric values
    const num = parseFloat(expression);
    if (!isNaN(num)) return num;
    
    return 0;
  }

  // Evaluate mathematical calculations
  private evaluateCalculation(calc: string): number {
    // Replace resource references with their values
    let expression = calc.replace(/resource\[(\d+)\]/g, (match, id) => {
      return String(this.resources[parseInt(id)] || 0);
    });
    
    // Replace time references with their values
    expression = expression.replace(/time\[(\w+)\]/g, (match, property) => {
      return String(this.getTimeProperty(property));
    });
    
    // Safely evaluate the mathematical expression
    try {
      // Simple math evaluation - only supports basic operations
      return this.safeEval(expression);
    } catch (err) {
      error(`Error evaluating calculation: ${calc}`, err);
      return 0;
    }
  }

  // Safe evaluation of mathematical expressions
  private safeEval(expression: string): number {
    // Remove all whitespace
    expression = expression.replace(/\s/g, '');
    
    // Validate expression contains only allowed characters
    if (!/^[\d+\-*/().,]+$/.test(expression)) {
      throw new Error('Invalid expression');
    }
    
    // Use Function constructor for safe evaluation
    try {
      const result = new Function('return ' + expression)();
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      throw new Error('Evaluation failed');
    }
  }

  // Get time-related properties
  private getTimeProperty(property: string): number {
    switch (property) {
      case 'hour': return this.timeInfo.hour;
      case 'day': return this.timeInfo.day;
      case 'day_of_week': return this.timeInfo.day_of_week;
      case 'workday': return this.timeInfo.is_workday ? 1 : 0;
      case 'weekend': return this.timeInfo.is_weekend ? 1 : 0;
      case 'last_day_of_month': 
        // Simple check - assumes 30 days per month
        return this.timeInfo.day === 30 ? 1 : 0;
      case 'activated': 
        // This would need to be handled differently for scheduled tasks
        return 1;
      default: return 0;
    }
  }

  // Special method for checking set operations
  evaluateSetOperation(operation: string): { resourceId: number; value: number } | null {
    // Handle set operations
    const setMatch = operation.match(/set\[(\d+)\]=(\d+)/);
    if (setMatch) {
      return {
        resourceId: parseInt(setMatch[1]),
        value: parseInt(setMatch[2])
      };
    }
    
    // Handle reset operations
    const resetMatch = operation.match(/reset\[(\d+)\]/);
    if (resetMatch) {
      return {
        resourceId: parseInt(resetMatch[1]),
        value: 0
      };
    }
    
    return null;
  }
} 