// 主游戏类
class Game {
    constructor() {
        this.currentScreen = 'start';
        this.gameState = null;
        this.currentLanguage = 'zh';
        this.availableEntities = [];
        this.currentLocation = null;
        this.inventory = [];
        this.selectedEntity = null; // 当前选中的实体
        this.entityEvents = null; // 当前实体的事件列表
        
        // 资源名称映射 - 从后端获取，这里只是备用
        this.resourceNames = {
            zh: {
                1: '💰 金钱',
                2: '❤️ 健康',
                3: '😴 疲劳',
                4: '🍽️ 饥饿',
                5: '🧠 理性',
                6: '💖 感性',
                7: '🎯 专注',
                8: '😊 心情',
                9: '🔧 技能',
                10: '👔 职级',
                23: '📊 项目',
                24: '😠 老板',
                25: '🤝 社交',
                26: '🏆 声誉',
                27: '🤔 感悟'
            },
            en: {
                1: '💰 Money',
                2: '❤️ Health',
                3: '😴 Fatigue',
                4: '🍽️ Hunger',
                5: '🧠 Rational',
                6: '💖 Emotional',
                7: '🎯 Focus',
                8: '😊 Mood',
                9: '🔧 Skill',
                10: '👔 Job Level',
                23: '📊 Project',
                24: '😠 Boss',
                25: '🤝 Social',
                26: '🏆 Reputation',
                27: '🤔 Insight'
            }
        };

        // 场景背景映射 - 可以硬编码
        this.sceneBackgrounds = {
            1: 'linear-gradient(135deg, #34495e, #2c3e50)', // 公司
            2: 'linear-gradient(135deg, #8e44ad, #9b59b6)', // 商店
            3: 'linear-gradient(135deg, #27ae60, #2ecc71)', // 家
            4: 'linear-gradient(135deg, #16a085, #1abc9c)', // 公园
            5: 'linear-gradient(135deg, #e67e22, #f39c12)', // 餐馆
            6: 'linear-gradient(135deg, #e74c3c, #c0392b)'  // 医院
        };

        // 实体图标映射 - 可以硬编码
        this.entityIcons = {
            '老板': '👔',
            '同事1': '👨‍💻',
            '同事2': '👩‍💻',
            '同事3': '🧑‍💻',
            '电脑': '💻',
            '工作电脑': '💻',
            '手机': '📱',
            '走廊': '🚶',
            '厕所': '🚽',
            '自己': '🧑‍💼',
            '会议室': '🏢',
            '食堂': '🍽️',
            '售货员': '👨‍💼',
            '家': '🏠',
            '公园': '🌳',
            '餐馆': '🍽️',
            '医院': '🏥'
        };

        this.init();
    }

    async init() {
        // 初始化后端适配器
        await window.backendAdapter.initialize();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 显示开始屏幕
        this.showScreen('start');
    }

    bindEventListeners() {
        // 开始屏幕事件
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.showLoadDialog();
        });

        document.getElementById('exit-game-btn').addEventListener('click', () => {
            this.exitGame();
        });

        document.getElementById('confirm-load-btn').addEventListener('click', () => {
            this.loadGame();
        });

        document.getElementById('cancel-load-btn').addEventListener('click', () => {
            this.hideLoadDialog();
        });

        // 场景屏幕事件
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('load-btn').addEventListener('click', () => {
            this.showLoadDialog();
        });

        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.showInventory();
        });

        document.getElementById('worldmap-btn').addEventListener('click', () => {
            this.showWorldMap();
        });

        document.getElementById('lang-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // 对话框事件
        document.getElementById('close-event-btn').addEventListener('click', () => {
            this.hideEventDialog();
        });

        document.getElementById('close-inventory-btn').addEventListener('click', () => {
            this.hideInventoryDialog();
        });

        document.getElementById('close-save-btn').addEventListener('click', () => {
            this.hideSaveDialog();
        });

        document.getElementById('copy-save-btn').addEventListener('click', () => {
            this.copySaveData();
        });

        // 大地图事件
        document.getElementById('back-to-scene-btn').addEventListener('click', () => {
            this.showScreen('scene');
        });

        // 结局屏幕事件
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });

        // 大地图位置卡片事件 - 使用事件委托
        document.addEventListener('click', (event) => {
            const locationCard = event.target.closest('.location-card');
            if (locationCard) {
                const locationId = parseInt(locationCard.dataset.location);
                if (locationId) {
                    this.travelToLocation(locationId).catch(error => {
                        console.error('Travel error from event listener:', error);
                    });
                }
            }
        });

        // 实体选择事件 - 使用事件委托
        document.addEventListener('click', (event) => {
            const entityCard = event.target.closest('.entity-card');
            if (entityCard) {
                const entityId = parseInt(entityCard.dataset.entityId);
                if (entityId) {
                    this.selectEntity(entityId);
                }
            }
        });

        // 事件执行按钮 - 使用事件委托
        document.addEventListener('click', (event) => {
            const eventBtn = event.target.closest('.event-btn');
            if (eventBtn) {
                const eventId = parseInt(eventBtn.dataset.eventId);
                if (eventId) {
                    this.executeEvent(eventId);
                }
            }
        });

        // 返回实体选择按钮
        document.addEventListener('click', (event) => {
            if (event.target.closest('#back-to-entities-btn')) {
                this.backToEntitySelection();
            }
        });
    }

    showScreen(screenName) {
        console.log(`Switching to screen: ${screenName}`);
        
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // 显示指定屏幕
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`Successfully activated ${screenName}-screen`);
        } else {
            console.error(`Screen ${screenName}-screen not found!`);
        }
        
        this.currentScreen = screenName;

        // 如果是场景屏幕，更新游戏状态
        if (screenName === 'scene') {
            console.log('Updating game display for scene screen...');
            this.updateGameDisplay();
        }
    }

    async startNewGame() {
        try {
            console.log('Starting new game...');
            
            // 重置选中状态
            this.selectedEntity = null;
            this.entityEvents = null;
            
            // 重置游戏状态 - 直接调用后端适配器的重置方法
            try {
                if (window.backendAdapter.gameEngineBackend && window.backendAdapter.gameEngineBackend.gameEngine) {
                    window.backendAdapter.gameEngineBackend.gameEngine.resetGame();
                    console.log('Game reset successfully');
                }
            } catch (resetError) {
                console.warn('Failed to reset game:', resetError);
            }
            
            // 获取初始游戏状态
            console.log('Updating game state...');
            await this.updateGameState();
            
            // 检查游戏是否意外结束
            if (this.gameState && this.gameState.game_over) {
                console.warn('Game is over immediately after reset, this might be a bug');
                console.log('Game state details:', this.gameState);
                // 强制重置游戏状态
                this.gameState.game_over = false;
                console.log('Forced game_over to false');
            }
            
            console.log('Showing scene screen...');
            this.showScreen('scene');
        } catch (error) {
            console.error('Failed to start new game:', error);
            alert('启动游戏失败，请刷新页面重试');
        }
    }

    showLoadDialog() {
        document.getElementById('load-dialog').style.display = 'flex';
    }

    hideLoadDialog() {
        document.getElementById('load-dialog').style.display = 'none';
    }

    async loadGame() {
        try {
            const saveData = document.getElementById('save-input').value.trim();
            if (!saveData) {
                alert(this.currentLanguage === 'zh' ? '请输入存档数据' : 'Please enter save data');
                return;
            }

            const response = window.backendAdapter.sendCommand({
                type: 'load_game',
                params: { save_data: saveData },
                language: this.currentLanguage
            });

            if (response.type === 'game_loaded') {
                this.hideLoadDialog();
                await this.updateGameState();
                this.showScreen('scene');
                alert(this.currentLanguage === 'zh' ? '读档成功！' : 'Game loaded successfully!');
            } else {
                alert(response.error || (this.currentLanguage === 'zh' ? '读档失败' : 'Failed to load game'));
            }
        } catch (error) {
            console.error('Load game error:', error);
            alert(this.currentLanguage === 'zh' ? '读档失败' : 'Failed to load game');
        }
    }

    exitGame() {
        if (confirm(this.currentLanguage === 'zh' ? '确定要退出游戏吗？' : 'Are you sure you want to exit?')) {
            window.close();
        }
    }

    async saveGame() {
        try {
            const response = window.backendAdapter.sendCommand({
                type: 'save_game',
                language: this.currentLanguage
            });

            if (response.type === 'game_saved') {
                document.getElementById('save-data-text').value = response.data.save_data;
                document.getElementById('save-dialog').style.display = 'flex';
            } else {
                alert(response.error || (this.currentLanguage === 'zh' ? '保存失败' : 'Save failed'));
            }
        } catch (error) {
            console.error('Save game error:', error);
            alert(this.currentLanguage === 'zh' ? '保存失败' : 'Save failed');
        }
    }

    hideSaveDialog() {
        document.getElementById('save-dialog').style.display = 'none';
    }

    copySaveData() {
        const saveDataText = document.getElementById('save-data-text');
        saveDataText.select();
        document.execCommand('copy');
        alert(this.currentLanguage === 'zh' ? '存档数据已复制到剪贴板' : 'Save data copied to clipboard');
    }

    async showInventory() {
        try {
            const response = window.backendAdapter.sendCommand({
                type: 'query_inventory',
                language: this.currentLanguage
            });

            if (response.type === 'query_result') {
                this.inventory = response.data.inventory || [];
                this.renderInventory();
                document.getElementById('inventory-dialog').style.display = 'flex';
            }
        } catch (error) {
            console.error('Failed to get inventory:', error);
        }
    }

    hideInventoryDialog() {
        document.getElementById('inventory-dialog').style.display = 'none';
    }

    renderInventory() {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';

        if (this.inventory.length === 0) {
            inventoryList.innerHTML = `<div class="empty-inventory">${this.currentLanguage === 'zh' ? '背包是空的' : 'Inventory is empty'}</div>`;
            return;
        }

        this.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.item_name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
                <button class="use-item-btn" onclick="game.useItem(${item.slot})">
                    ${this.currentLanguage === 'zh' ? '使用' : 'Use'}
                </button>
            `;
            inventoryList.appendChild(itemElement);
        });
    }

    async useItem(itemSlot) {
        try {
            const response = window.backendAdapter.sendCommand({
                type: 'use_item',
                params: { item_slot: itemSlot },
                language: this.currentLanguage
            });

            if (response.type === 'event_result') {
                this.showEventResult(response.data);
                await this.updateGameState();
                await this.showInventory(); // 刷新库存显示
            } else {
                alert(response.error || (this.currentLanguage === 'zh' ? '使用物品失败' : 'Failed to use item'));
            }
        } catch (error) {
            console.error('Use item error:', error);
        }
    }

    showWorldMap() {
        this.updateWorldMapDisplay();
        this.showScreen('worldmap');
    }

    updateWorldMapDisplay() {
        const worldMapContainer = document.getElementById('worldmap-container');
        const currentLocationId = this.gameState?.resources[61] || 3;
        
        // 位置信息 - 可以硬编码
        const locations = [
            { id: 1, name: '公司', name_en: 'Company', description: '工作的地方', description_en: 'Workplace' },
            { id: 2, name: '商店', name_en: 'Store', description: '购买物品', description_en: 'Buy items' },
            { id: 3, name: '家', name_en: 'Home', description: '休息的地方', description_en: 'Place to rest' },
            { id: 4, name: '公园', name_en: 'Park', description: '锻炼身体', description_en: 'Exercise' },
            { id: 5, name: '餐馆', name_en: 'Restaurant', description: '享用美食', description_en: 'Enjoy food' },
            { id: 6, name: '医院', name_en: 'Hospital', description: '治疗疾病', description_en: 'Medical care' }
        ];

        worldMapContainer.innerHTML = locations.map(location => `
            <div class="location-card ${location.id === currentLocationId ? 'current-location' : ''}" 
                 data-location="${location.id}">
                <h3>${this.currentLanguage === 'zh' ? location.name : location.name_en}</h3>
                <p>${this.currentLanguage === 'zh' ? location.description : location.description_en}</p>
                ${location.id === currentLocationId ? 
                    `<span class="current-marker">${this.currentLanguage === 'zh' ? '当前位置' : 'Current'}</span>` : 
                    `<button class="travel-btn">${this.currentLanguage === 'zh' ? '前往' : 'Go'}</button>`
                }
            </div>
        `).join('');
    }

    async travelToLocation(locationId) {
        try {
            // 使用后端适配器的移动方法
            const result = await window.backendAdapter.travelToLocation(locationId);
            
            if (result.success) {
                // 移动成功，更新游戏状态并切换到场景页面
                await this.updateGameState();
                this.showScreen('scene');
            } else {
                console.error('Travel failed:', result.error);
                alert(this.currentLanguage === 'zh' ? '移动失败：' + result.error : 'Travel failed: ' + result.error);
            }
        } catch (error) {
            console.error('Travel error:', error);
            alert(this.currentLanguage === 'zh' ? '移动失败' : 'Travel failed');
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        window.backendAdapter.setLanguage(this.currentLanguage);
        
        // 更新语言按钮文本
        document.getElementById('lang-btn').textContent = this.currentLanguage === 'zh' ? 'EN' : '中文';
        
        // 重新渲染界面
        this.updateGameDisplay();
    }

    async updateGameState() {
        try {
            // 获取游戏状态
            const gameStateResponse = window.backendAdapter.sendCommand({
                type: 'get_game_state',
                language: this.currentLanguage
            });
            
            console.log('Game state response:', gameStateResponse);
            
            if (gameStateResponse.type === 'query_result') {
                this.gameState = gameStateResponse.data;
                console.log('Updated game state:', this.gameState);
                console.log('Game over status:', this.gameState.game_over);
            }

            // 获取当前位置信息
            const locationResponse = window.backendAdapter.sendCommand({
                type: 'query_location',
                language: this.currentLanguage
            });
            
            console.log('Location response:', locationResponse);
            
            if (locationResponse.type === 'query_result') {
                this.currentLocation = locationResponse.data;
                console.log('Current location:', this.currentLocation);
            }

            // 获取可用实体
            const entitiesResponse = window.backendAdapter.sendCommand({
                type: 'query_available_entities',
                language: this.currentLanguage
            });
            
            console.log('Entities response:', entitiesResponse);
            
            if (entitiesResponse.type === 'query_result') {
                this.availableEntities = entitiesResponse.data.available_entities || [];
                console.log('Available entities:', this.availableEntities);
            }

            // 重置选中状态
            this.selectedEntity = null;
            this.entityEvents = null;

        } catch (error) {
            console.error('Failed to update game state:', error);
        }
    }

    async updateGameDisplay() {
        if (!this.gameState || !this.currentLocation) {
            await this.updateGameState();
        }

        this.renderStatusBar();
        this.renderCharacterStatus();
        this.updateSceneBackground();
        
        // 根据当前状态渲染不同的内容
        if (this.selectedEntity && this.entityEvents) {
            this.renderEntityEvents();
        } else {
            this.renderSceneEntities();
        }
    }

    renderStatusBar() {
        const statusBar = document.getElementById('status-bar');
        if (!this.gameState || !this.currentLocation) return;

        const timeInfo = this.gameState.time_info;
        statusBar.innerHTML = `
            <div class="status-item">
                <span class="status-label">${this.currentLanguage === 'zh' ? '时间' : 'Time'}:</span>
                <span class="status-value">${timeInfo.time_display}</span>
            </div>
            <div class="status-item">
                <span class="status-label">${this.currentLanguage === 'zh' ? '位置' : 'Location'}:</span>
                <span class="status-value">${this.currentLocation.location_name}</span>
            </div>
        `;
    }

    renderCharacterStatus() {
        const characterStatus = document.getElementById('character-status');
        if (!this.gameState) return;

        const resources = this.gameState.resources;
        const resourcesHtml = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 23, 24, 25, 26, 27].map(id => {
            const value = resources[id] || 0;
            const name = this.resourceNames[this.currentLanguage][id] || `Resource ${id}`;
            return `
                <div class="resource-item">
                    <span class="resource-name">${name}</span>
                    <span class="resource-value">${value}</span>
                </div>
            `;
        }).join('');

        characterStatus.innerHTML = `
            <h3>${this.currentLanguage === 'zh' ? '角色状态' : 'Character Status'}</h3>
            <div class="resources-grid">
                ${resourcesHtml}
            </div>
        `;
    }

    renderSceneEntities() {
        const actionsContainer = document.getElementById('actions-container');
        
        actionsContainer.innerHTML = `
            <h3>${this.currentLanguage === 'zh' ? '可交互实体' : 'Available Entities'}</h3>
            <div class="entities-grid">
                ${this.availableEntities.map(entity => `
                    <div class="entity-card ${entity.can_interact ? 'interactive' : 'non-interactive'}" 
                         data-entity-id="${entity.entity_id}">
                        <div class="entity-icon">${this.entityIcons[entity.entity_name] || '❓'}</div>
                        <div class="entity-info">
                            <div class="entity-name">${entity.entity_name}</div>
                            <div class="entity-events-count">
                                ${entity.available_events_count} ${this.currentLanguage === 'zh' ? '个可用事件' : 'events available'}
                            </div>
                        </div>
                        ${entity.can_interact ? 
                            `<div class="interact-hint">${this.currentLanguage === 'zh' ? '点击交互' : 'Click to interact'}</div>` : 
                            `<div class="no-interact">${this.currentLanguage === 'zh' ? '无法交互' : 'Cannot interact'}</div>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }

    async selectEntity(entityId) {
        try {
            const entity = this.availableEntities.find(e => e.entity_id === entityId);
            if (!entity || !entity.can_interact) {
                return;
            }

            // 获取实体的事件列表
            const response = window.backendAdapter.sendCommand({
                type: 'query_entity_events',
                params: { entity_id: entityId },
                language: this.currentLanguage
            });

            if (response.type === 'query_result') {
                this.selectedEntity = entity;
                this.entityEvents = response.data;
                this.renderEntityEvents();
            } else {
                console.error('Failed to get entity events:', response.error);
            }
        } catch (error) {
            console.error('Select entity error:', error);
        }
    }

    renderEntityEvents() {
        const actionsContainer = document.getElementById('actions-container');
        
        if (!this.selectedEntity || !this.entityEvents) {
            this.renderSceneEntities();
            return;
        }

        actionsContainer.innerHTML = `
            <div class="entity-events-header">
                <button id="back-to-entities-btn" class="back-btn">
                    ← ${this.currentLanguage === 'zh' ? '返回实体选择' : 'Back to Entities'}
                </button>
                <h3>${this.currentLanguage === 'zh' ? '与' : 'Interact with'} "${this.entityEvents.entity_name}" ${this.currentLanguage === 'zh' ? '交互' : ''}</h3>
            </div>
            <div class="events-grid">
                ${this.entityEvents.available_events.map(event => `
                    <div class="event-card ${event.can_execute ? 'executable' : 'non-executable'}">
                        <div class="event-info">
                            <div class="event-name">${this.currentLanguage === 'zh' ? event.event_name_cn : event.event_name_en}</div>
                            <div class="event-time">${this.currentLanguage === 'zh' ? '耗时' : 'Time'}: ${event.time_cost} ${this.currentLanguage === 'zh' ? '小时' : 'hours'}</div>
                        </div>
                        ${event.can_execute ? 
                            `<button class="event-btn" data-event-id="${event.event_id}">
                                ${this.currentLanguage === 'zh' ? '执行' : 'Execute'}
                            </button>` : 
                            `<div class="cannot-execute">${this.currentLanguage === 'zh' ? '无法执行' : 'Cannot execute'}</div>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }

    backToEntitySelection() {
        this.selectedEntity = null;
        this.entityEvents = null;
        this.renderSceneEntities();
    }

    updateSceneBackground() {
        const sceneScreen = document.getElementById('scene-screen');
        const currentLocationId = this.gameState?.resources[61] || 3;
        const background = this.sceneBackgrounds[currentLocationId] || this.sceneBackgrounds[3];
        sceneScreen.style.background = background;
    }

    async executeEvent(eventId) {
        try {
            const response = window.backendAdapter.sendCommand({
                type: 'execute_event',
                params: { event_id: eventId },
                language: this.currentLanguage
            });

            if (response.type === 'event_result') {
                this.showEventResult(response.data);
                
                // 更新游戏状态
                await this.updateGameState();
                
                // 检查游戏是否结束
                if (this.gameState.game_over) {
                    this.showEnding();
                    return;
                }
                
                // 刷新显示
                this.updateGameDisplay();
            } else {
                alert(response.error || (this.currentLanguage === 'zh' ? '执行事件失败' : 'Failed to execute event'));
            }
        } catch (error) {
            console.error('Execute event error:', error);
            alert(this.currentLanguage === 'zh' ? '执行事件失败' : 'Failed to execute event');
        }
    }

    showEventResult(eventData) {
        const eventDialog = document.getElementById('event-dialog');
        const eventContent = document.getElementById('event-content');
        
        let resultHtml = `
            <div class="event-result">
                <h3>${eventData.success ? 
                    (this.currentLanguage === 'zh' ? '✅ 执行成功' : '✅ Success') : 
                    (this.currentLanguage === 'zh' ? '❌ 执行失败' : '❌ Failed')
                }</h3>
                <p class="event-text">${eventData.game_text}</p>
                <p class="time-cost">${this.currentLanguage === 'zh' ? '耗时' : 'Time cost'}: ${eventData.time_cost} ${this.currentLanguage === 'zh' ? '小时' : 'hours'}</p>
        `;

        if (eventData.resource_changes && eventData.resource_changes.length > 0) {
            resultHtml += `
                <div class="resource-changes">
                    <h4>${this.currentLanguage === 'zh' ? '资源变化' : 'Resource Changes'}:</h4>
                    ${eventData.resource_changes.map(change => `
                        <div class="resource-change ${change.change > 0 ? 'positive' : 'negative'}">
                            ${change.resource_name}: ${change.change > 0 ? '+' : ''}${change.change}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (eventData.temporary_events && eventData.temporary_events.length > 0) {
            resultHtml += `
                <div class="temporary-events">
                    <h4>${this.currentLanguage === 'zh' ? '临时效果' : 'Temporary Effects'}:</h4>
                    ${eventData.temporary_events.map(temp => `
                        <div class="temp-event">
                            <strong>${temp.event_name}</strong>: ${temp.description}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (eventData.scheduled_tasks && eventData.scheduled_tasks.length > 0) {
            resultHtml += `
                <div class="scheduled-tasks">
                    <h4>${this.currentLanguage === 'zh' ? '计划任务' : 'Scheduled Tasks'}:</h4>
                    ${eventData.scheduled_tasks.map(task => `
                        <div class="scheduled-task">
                            <strong>${task.task_name}</strong>: ${task.description}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        resultHtml += '</div>';
        eventContent.innerHTML = resultHtml;
        eventDialog.style.display = 'flex';
    }

    hideEventDialog() {
        document.getElementById('event-dialog').style.display = 'none';
    }

    showEnding() {
        const endingScreen = document.getElementById('ending-screen');
        const endingContent = document.getElementById('ending-content');
        
        if (this.gameState.current_ending) {
            endingContent.innerHTML = `
                <h2>${this.gameState.current_ending.title}</h2>
                <p>${this.gameState.current_ending.description}</p>
            `;
        } else {
            endingContent.innerHTML = `
                <h2>${this.currentLanguage === 'zh' ? '游戏结束' : 'Game Over'}</h2>
                <p>${this.currentLanguage === 'zh' ? '感谢您的游玩！' : 'Thank you for playing!'}</p>
            `;
        }
        
        this.showScreen('ending');
    }
}

// 创建全局游戏实例
const game = new Game(); 