const fs = require('fs');
const path = require('path');

const BACKEND_FILE = path.join(__dirname, '../frontend-web/dist/game-engine.js');
const MAX_WAIT_TIME = 30; // 最大等待30秒
const CHECK_INTERVAL = 500; // 每500ms检查一次

let waitTime = 0;

function checkBackendReady() {
  if (fs.existsSync(BACKEND_FILE)) {
    const stats = fs.statSync(BACKEND_FILE);
    if (stats.size > 1000) { // 确保文件不为空（至少1KB）
      console.log('✅ Backend compilation ready!');
      process.exit(0);
    }
  }
  
  waitTime += CHECK_INTERVAL / 1000;
  
  if (waitTime >= MAX_WAIT_TIME) {
    console.log('❌ Timeout waiting for backend compilation');
    console.log(`Expected file: ${BACKEND_FILE}`);
    process.exit(1);
  }
  
  process.stdout.write(`⏳ Waiting for backend compilation... (${waitTime.toFixed(1)}s)\r`);
  setTimeout(checkBackendReady, CHECK_INTERVAL);
}

console.log('🔍 Checking for backend compilation...');
checkBackendReady(); 