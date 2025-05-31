#!/usr/bin/env ts-node

import { GameCLI } from './frontend-cli';

console.log('正在启动《我的工程师生活》命令行版本...\n');

const game = new GameCLI();
game.start().catch((error) => {
  console.error('游戏启动失败:', error);
  process.exit(1);
}); 