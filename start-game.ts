#!/usr/bin/env ts-node

import { GameController } from './src/frontend/controllers/GameController';

console.log('正在启动《工程师日记》命令行版本...\n');

const game = new GameController();
game.start().catch((error: Error) => {
  console.error('游戏启动失败:', error);
  process.exit(1);
}); 