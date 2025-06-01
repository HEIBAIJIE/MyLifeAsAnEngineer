const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running All Tests for My Life As An Engineer Backend');
console.log('='.repeat(60));

const tests = [
  {
    name: 'CSV Parsing Test',
    file: 'test-csv-parsing.js',
    description: 'Tests CSV data loading and game text parsing'
  },
  {
    name: 'Frontend Connection Test (JS)',
    file: 'test-frontend.js',
    description: 'Tests frontend-backend communication with JavaScript'
  },
  {
    name: 'Frontend Connection Test (TS)',
    file: 'test-frontend.ts',
    description: 'Tests frontend-backend communication with TypeScript',
    command: 'npx ts-node'
  },
  {
    name: 'Event Execution Test',
    file: 'test-event.js',
    description: 'Tests event execution and game text display'
  },
  {
    name: 'Event 31 Specific Test',
    file: 'test-event31.js',
    description: 'Tests specific event 31 execution'
  },
  {
    name: 'Frontend Event 31 Test',
    file: 'test-frontend-event31.js',
    description: 'Tests event 31 through frontend interface'
  },
  {
    name: 'Main Backend Test',
    file: 'test.js',
    description: 'Comprehensive backend functionality test'
  }
];

let passed = 0;
let failed = 0;
const results = [];

for (const test of tests) {
  console.log(`\n📋 Running: ${test.name}`);
  console.log(`   ${test.description}`);
  console.log('-'.repeat(50));
  
  try {
    const command = test.command || 'node';
    const fullCommand = `${command} test/${test.file}`;
    
    const output = execSync(fullCommand, { 
      encoding: 'utf8',
      timeout: 10000,
      cwd: process.cwd()
    });
    
    console.log('✅ PASSED');
    if (output.trim()) {
      // Show first few lines of output
      const lines = output.trim().split('\n');
      const preview = lines.slice(0, 3).join('\n');
      console.log(`   Output preview: ${preview}${lines.length > 3 ? '...' : ''}`);
    }
    
    passed++;
    results.push({ name: test.name, status: 'PASSED', error: null });
    
  } catch (error) {
    console.log('❌ FAILED');
    console.log(`   Error: ${error.message}`);
    if (error.stdout) {
      console.log(`   Output: ${error.stdout.toString().substring(0, 200)}...`);
    }
    
    failed++;
    results.push({ name: test.name, status: 'FAILED', error: error.message });
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${tests.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log('\n❌ Failed Tests:');
  results.filter(r => r.status === 'FAILED').forEach(r => {
    console.log(`   - ${r.name}: ${r.error}`);
  });
}

console.log('\n🎉 All tests completed!');
console.log('If all tests passed, the backend is ready for use.');
console.log('You can now run "npx ts-node start-game.ts" to start the game.'); 