// 后端适配器 - 在浏览器中运行真正的TypeScript后端
class BackendAdapter {
    constructor() {
        this.currentLanguage = 'zh';
        this.gameEngine = null;
        this.isInitialized = false;
        this.gameEngineBackend = null;
    }

    // 初始化后端引擎
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('Loading real backend engine...');
            
            // 加载编译后的游戏引擎
            await this.loadGameEngineScript();
            
            // 获取游戏引擎实例
            if (window.GameEngineBackend) {
                this.gameEngineBackend = window.GameEngineBackend;
                this.gameEngine = this.gameEngineBackend.gameEngine;
                
                // 初始化游戏引擎
                await this.gameEngine.initialize();
                
                this.isInitialized = true;
                console.log('Real backend engine initialized successfully');
            } else {
                throw new Error('GameEngineBackend not found in global scope');
            }
        } catch (error) {
            console.error('Failed to initialize backend:', error);
            throw error;
        }
    }

    // 动态加载游戏引擎脚本
    async loadGameEngineScript() {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载
            if (window.GameEngineBackend) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = './dist/game-engine.js';
            script.onload = () => {
                console.log('Game engine script loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Failed to load game engine script:', error);
                reject(new Error('Failed to load game engine script'));
            };
            
            document.head.appendChild(script);
        });
    }

    // 发送命令到后端
    sendCommand(command) {
        if (!this.isInitialized || !this.gameEngineBackend) {
            throw new Error('Backend not initialized');
        }
        
        try {
            const commandStr = typeof command === 'string' ? command : JSON.stringify(command);
            
            // 使用真正的后端引擎处理命令
            const responseStr = this.gameEngineBackend.sendCommand(commandStr);
            const response = JSON.parse(responseStr);
            
            return response;
        } catch (error) {
            console.error('Backend command error:', error);
            return {
                type: 'error',
                error: error.message || 'Unknown error'
            };
        }
    }

    // 队列式命令处理（可选）
    addCommandToQueue(command) {
        if (!this.isInitialized || !this.gameEngineBackend) {
            throw new Error('Backend not initialized');
        }
        
        const commandStr = typeof command === 'string' ? command : JSON.stringify(command);
        this.gameEngineBackend.addCommandToQueue(commandStr);
    }

    getNextResponse() {
        if (!this.isInitialized || !this.gameEngineBackend) {
            return null;
        }
        
        const responseStr = this.gameEngineBackend.getNextResponse();
        return responseStr ? JSON.parse(responseStr) : null;
    }

    // 设置语言
    setLanguage(language) {
        this.currentLanguage = language;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // 获取游戏状态
    getGameState() {
        return this.sendCommand({
            type: 'get_game_state',
            language: this.currentLanguage
        });
    }

    // 查询可用实体
    queryAvailableEntities() {
        return this.sendCommand({
            type: 'query_available_entities',
            language: this.currentLanguage
        });
    }

    // 查询实体事件
    queryEntityEvents(entityId) {
        return this.sendCommand({
            type: 'query_entity_events',
            params: { entity_id: entityId },
            language: this.currentLanguage
        });
    }

    // 查询当前位置
    queryLocation() {
        return this.sendCommand({
            type: 'query_location',
            language: this.currentLanguage
        });
    }

    // 执行事件
    executeEvent(eventId) {
        return this.sendCommand({
            type: 'execute_event',
            params: { event_id: eventId },
            language: this.currentLanguage
        });
    }

    // 查询库存
    queryInventory() {
        return this.sendCommand({
            type: 'query_inventory',
            language: this.currentLanguage
        });
    }

    // 保存游戏
    saveGame() {
        return this.sendCommand({
            type: 'save_game',
            language: this.currentLanguage
        });
    }

    // 加载游戏
    loadGame(saveData) {
        return this.sendCommand({
            type: 'load_game',
            params: { save_data: saveData },
            language: this.currentLanguage
        });
    }

    // 获取时间信息
    getTimeInfo() {
        return this.sendCommand({
            type: 'get_time_info',
            language: this.currentLanguage
        });
    }

    // 查询资源
    queryResource(resourceId) {
        return this.sendCommand({
            type: 'query_resource',
            params: { resource_id: resourceId },
            language: this.currentLanguage
        });
    }

    // 查询可用事件
    queryAvailableEvents() {
        return this.sendCommand({
            type: 'query_available_events',
            language: this.currentLanguage
        });
    }

    // 使用物品
    useItem(itemSlot) {
        return this.sendCommand({
            type: 'use_item',
            params: { item_slot: itemSlot },
            language: this.currentLanguage
        });
    }

    // 重置游戏
    resetGame() {
        if (this.gameEngine && this.gameEngine.resetGame) {
            this.gameEngine.resetGame();
        }
    }

    // 检查游戏是否结束
    isGameOver() {
        if (this.gameEngine && this.gameEngine.isGameOver) {
            return this.gameEngine.isGameOver();
        }
        return false;
    }

    // 获取当前结局
    getCurrentEnding() {
        if (this.gameEngine && this.gameEngine.getCurrentEnding) {
            return this.gameEngine.getCurrentEnding();
        }
        return null;
    }

    // 获取底层管理器（用于高级操作）
    getDataManager() {
        return this.gameEngine ? this.gameEngine.getDataManager() : null;
    }

    getResourceManager() {
        return this.gameEngine ? this.gameEngine.getResourceManager() : null;
    }

    getTimeManager() {
        return this.gameEngine ? this.gameEngine.getTimeManager() : null;
    }

    getEventProcessor() {
        return this.gameEngine ? this.gameEngine.getEventProcessor() : null;
    }

    getQueryService() {
        return this.gameEngine ? this.gameEngine.getQueryService() : null;
    }

    getSaveManager() {
        return this.gameEngine ? this.gameEngine.getSaveManager() : null;
    }
}

// 创建全局实例
window.backendAdapter = new BackendAdapter(); 