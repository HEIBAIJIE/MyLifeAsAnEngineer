import { LocalizationService } from '../../../src/frontend/services/LocalizationService';

describe('LocalizationService', () => {
  let localizationService: LocalizationService;

  beforeEach(() => {
    localizationService = LocalizationService.getInstance();
    // Reset to default language
    localizationService.setLanguage('zh');
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = LocalizationService.getInstance();
      const instance2 = LocalizationService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Language Management', () => {
    test('should set and get language correctly', () => {
      expect(localizationService.getCurrentLanguage()).toBe('zh');
      
      localizationService.setLanguage('en');
      expect(localizationService.getCurrentLanguage()).toBe('en');
      
      localizationService.setLanguage('zh');
      expect(localizationService.getCurrentLanguage()).toBe('zh');
    });
  });

  describe('Text Retrieval', () => {
    test('should return Chinese texts when language is zh', () => {
      localizationService.setLanguage('zh');
      const texts = localizationService.getTexts();
      
      expect(texts.gameStatus).toBe('游戏状态');
      expect(texts.money).toBe('金钱');
      expect(texts.health).toBe('健康');
      expect(texts.weekDays).toEqual(['周日', '周一', '周二', '周三', '周四', '周五', '周六']);
    });

    test('should return English texts when language is en', () => {
      localizationService.setLanguage('en');
      const texts = localizationService.getTexts();
      
      expect(texts.gameStatus).toBe('Game Status');
      expect(texts.money).toBe('Money');
      expect(texts.health).toBe('Health');
      expect(texts.weekDays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

    test('should return specific text by key', () => {
      localizationService.setLanguage('zh');
      expect(localizationService.getText('money')).toBe('金钱');
      
      localizationService.setLanguage('en');
      expect(localizationService.getText('money')).toBe('Money');
    });
  });

  describe('Resource Emoji', () => {
    test('should return correct emoji for known resource IDs', () => {
      expect(localizationService.getResourceEmoji(2)).toBe('💰'); // 金钱
      expect(localizationService.getResourceEmoji(13)).toBe('❤️'); // 健康
      expect(localizationService.getResourceEmoji(14)).toBe('😴'); // 疲劳
      expect(localizationService.getResourceEmoji(15)).toBe('🍽️'); // 饥饿
      expect(localizationService.getResourceEmoji(16)).toBe('🧠'); // 理性
      expect(localizationService.getResourceEmoji(17)).toBe('💖'); // 感性
      expect(localizationService.getResourceEmoji(18)).toBe('🎯'); // 专注
      expect(localizationService.getResourceEmoji(19)).toBe('😊'); // 心情
      expect(localizationService.getResourceEmoji(20)).toBe('🔧'); // 专业技能
      expect(localizationService.getResourceEmoji(21)).toBe('😠'); // 老板不满
      expect(localizationService.getResourceEmoji(22)).toBe('👔'); // 职级
      expect(localizationService.getResourceEmoji(23)).toBe('📊'); // 项目进度
      expect(localizationService.getResourceEmoji(70)).toBe('🤝'); // 社交影响力
      expect(localizationService.getResourceEmoji(71)).toBe('🏆'); // 技术声誉
      expect(localizationService.getResourceEmoji(72)).toBe('🤔'); // 哲学感悟
    });

    test('should return default emoji for unknown resource IDs', () => {
      expect(localizationService.getResourceEmoji(999)).toBe('📈');
      expect(localizationService.getResourceEmoji(0)).toBe('📈');
    });
  });

  describe('Welcome Message', () => {
    test('should return Chinese welcome message when language is zh', () => {
      localizationService.setLanguage('zh');
      const message = localizationService.getWelcomeMessage();
      
      expect(message).toContain('My Life As An Engineer');
      expect(message).toContain('命令行游戏界面');
      expect(message).toContain('欢迎来到《我的工程师生活》！');
      expect(message).toContain('通过感性和理性两条路径');
    });

    test('should return English welcome message when language is en', () => {
      localizationService.setLanguage('en');
      const message = localizationService.getWelcomeMessage();
      
      expect(message).toContain('My Life As An Engineer');
      expect(message).toContain('Command Line Interface');
      expect(message).toContain('Welcome to "My Life As An Engineer"!');
      expect(message).toContain('emotional and rational paths');
    });
  });

  describe('Help Message', () => {
    test('should return Chinese help message when language is zh', () => {
      localizationService.setLanguage('zh');
      const message = localizationService.getHelpMessage();
      
      expect(message).toContain('游戏帮助');
      expect(message).toContain('游戏目标:');
      expect(message).toContain('基本操作:');
      expect(message).toContain('游戏机制:');
      expect(message).toContain('数字1-6: 切换场景');
      expect(message).toContain('时间系统: 每天48个时间单元');
    });

    test('should return English help message when language is en', () => {
      localizationService.setLanguage('en');
      const message = localizationService.getHelpMessage();
      
      expect(message).toContain('Game Help');
      expect(message).toContain('Game Objective:');
      expect(message).toContain('Basic Controls:');
      expect(message).toContain('Game Mechanics:');
      expect(message).toContain('Numbers 1-6: Switch scenes');
      expect(message).toContain('Time system: 48 time units per day');
    });
  });

  describe('Language Persistence', () => {
    test('should maintain language setting across multiple calls', () => {
      localizationService.setLanguage('en');
      
      expect(localizationService.getCurrentLanguage()).toBe('en');
      expect(localizationService.getText('money')).toBe('Money');
      expect(localizationService.getCurrentLanguage()).toBe('en');
      
      const texts = localizationService.getTexts();
      expect(texts.money).toBe('Money');
      expect(localizationService.getCurrentLanguage()).toBe('en');
    });
  });
}); 