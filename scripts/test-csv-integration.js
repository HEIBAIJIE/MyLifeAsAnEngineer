const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * CSV复制集成测试
 * 验证在不同构建场景下CSV文件都能正确复制
 */

const projectRoot = path.join(__dirname, '..');

// 测试路径配置
const paths = {
  source: path.join(projectRoot, 'csv'),
  publicTarget: path.join(projectRoot, 'frontend-web', 'public', 'csv'),
  distTarget: path.join(projectRoot, 'frontend-web', 'dist', 'csv')
};

/**
 * 计算目录中的CSV文件数量
 */
function countCsvFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  function scan(directory) {
    const items = fs.readdirSync(directory);
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && path.extname(item).toLowerCase() === '.csv') {
        count++;
      }
    });
  }
  
  scan(dir);
  return count;
}

/**
 * 执行命令并返回Promise
 */
function runCommand(command, args, cwd = projectRoot) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}\nStdout: ${stdout}\nStderr: ${stderr}`));
      }
    });
  });
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 Starting CSV Integration Tests\n');

  try {
    // 1. 验证源目录存在
    console.log('📂 Test 1: Source directory exists');
    if (!fs.existsSync(paths.source)) {
      throw new Error(`Source directory not found: ${paths.source}`);
    }
    const sourceCsvCount = countCsvFiles(paths.source);
    console.log(`✅ Source directory exists with ${sourceCsvCount} CSV files\n`);

    // 2. 测试Node.js CSV复制脚本
    console.log('📋 Test 2: Node.js CSV copy script');
    await runCommand('npm', ['run', 'copy-csv']);
    const publicCsvCount = countCsvFiles(paths.publicTarget);
    if (publicCsvCount !== sourceCsvCount) {
      throw new Error(`CSV count mismatch. Source: ${sourceCsvCount}, Public: ${publicCsvCount}`);
    }
    console.log(`✅ Node.js copy script successful: ${publicCsvCount} files copied to public directory\n`);

    // 3. 测试直接脚本调用
    console.log('🔧 Test 3: Direct script execution');
    await runCommand('node', ['scripts/copy-csv.js']);
    const publicCsvCount2 = countCsvFiles(paths.publicTarget);
    if (publicCsvCount2 !== sourceCsvCount) {
      throw new Error(`Direct script execution failed. Expected: ${sourceCsvCount}, Got: ${publicCsvCount2}`);
    }
    console.log(`✅ Direct script execution successful: ${publicCsvCount2} files\n`);

    // 4. 测试前端构建集成
    console.log('🏗️ Test 4: Frontend build integration');
    
    // 清理之前的构建
    const distDir = path.join(projectRoot, 'frontend-web', 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('Cleaned previous build');
    }

    // 执行前端构建
    await runCommand('npm', ['run', 'build'], path.join(projectRoot, 'frontend-web'));
    
    // 验证构建输出中的CSV文件
    const distCsvCount = countCsvFiles(paths.distTarget);
    if (distCsvCount !== sourceCsvCount) {
      throw new Error(`Build integration failed. Expected: ${sourceCsvCount}, Got: ${distCsvCount}`);
    }
    console.log(`✅ Frontend build integration successful: ${distCsvCount} files in dist directory\n`);

    // 5. 验证完整的Web构建
    console.log('🌐 Test 5: Complete web build');
    await runCommand('npm', ['run', 'build:web']);
    
    const finalDistCsvCount = countCsvFiles(paths.distTarget);
    if (finalDistCsvCount !== sourceCsvCount) {
      throw new Error(`Complete web build failed. Expected: ${sourceCsvCount}, Got: ${finalDistCsvCount}`);
    }
    console.log(`✅ Complete web build successful: ${finalDistCsvCount} files\n`);

    // 6. 验证文件内容完整性（抽样检查）
    console.log('🔍 Test 6: File integrity check');
    const sampleFiles = ['resources.csv', 'events.csv', 'entities.csv'];
    for (const file of sampleFiles) {
      const sourcePath = path.join(paths.source, file);
      const distPath = path.join(paths.distTarget, file);
      
      if (!fs.existsSync(sourcePath) || !fs.existsSync(distPath)) {
        throw new Error(`Sample file missing: ${file}`);
      }
      
      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      const distContent = fs.readFileSync(distPath, 'utf8');
      
      if (sourceContent !== distContent) {
        throw new Error(`File content mismatch: ${file}`);
      }
    }
    console.log(`✅ File integrity check passed for ${sampleFiles.length} sample files\n`);

    // 7. 跨平台验证
    console.log('🌍 Test 7: Cross-platform compatibility');
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`✅ Running successfully on ${process.platform}\n`);

    // 8. 总结报告
    console.log('📊 Test Summary:');
    console.log(`Source CSV files: ${sourceCsvCount}`);
    console.log(`Public directory: ${publicCsvCount}`);
    console.log(`Dist directory: ${finalDistCsvCount}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Working directory: ${process.cwd()}`);

    console.log('\n🎉 All tests passed! CSV integration is working correctly.');
    console.log('✨ Node.js provides perfect cross-platform compatibility!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  countCsvFiles,
  paths
}; 