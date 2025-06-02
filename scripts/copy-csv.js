const fs = require('fs');
const path = require('path');

/**
 * 跨平台复制CSV文件到前端public目录
 * 支持Windows和Linux/macOS
 */

// 源目录和目标目录
const sourceDir = path.join(__dirname, '..', 'csv');
const targetDir = path.join(__dirname, '..', 'frontend-web', 'public', 'csv');

/**
 * 递归复制目录
 * @param {string} src - 源目录
 * @param {string} dest - 目标目录
 */
function copyDirectory(src, dest) {
  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录内容
  const items = fs.readdirSync(src);

  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // 如果是目录，递归复制
      copyDirectory(srcPath, destPath);
    } else if (stat.isFile()) {
      // 如果是文件，复制文件
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

/**
 * 清理目标目录（可选）
 * @param {string} dir - 要清理的目录
 */
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned directory: ${dir}`);
  }
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('Starting CSV copy process...');
    console.log(`Source: ${sourceDir}`);
    console.log(`Target: ${targetDir}`);

    // 检查源目录是否存在
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory does not exist: ${sourceDir}`);
    }

    // 可选：清理目标目录（注释掉以保留已有文件）
    // cleanDirectory(targetDir);

    // 复制CSV文件
    copyDirectory(sourceDir, targetDir);

    console.log('CSV copy process completed successfully!');
    
    // 显示复制的文件统计
    const csvFiles = getAllCsvFiles(targetDir);
    console.log(`Total CSV files copied: ${csvFiles.length}`);
    
  } catch (error) {
    console.error('Error during CSV copy process:', error.message);
    process.exit(1);
  }
}

/**
 * 获取目录下所有CSV文件
 * @param {string} dir - 目录路径
 * @returns {string[]} CSV文件路径数组
 */
function getAllCsvFiles(dir) {
  const csvFiles = [];
  
  function scan(directory) {
    const items = fs.readdirSync(directory);
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && path.extname(item).toLowerCase() === '.csv') {
        csvFiles.push(fullPath);
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    scan(dir);
  }
  
  return csvFiles;
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  copyDirectory,
  cleanDirectory,
  main
}; 