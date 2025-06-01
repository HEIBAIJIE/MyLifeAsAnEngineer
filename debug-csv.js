const fs = require('fs');
const path = require('path');

// 读取events.csv文件的第32行（事件31）
const content = fs.readFileSync(path.join(__dirname, 'csv/events.csv'), 'utf-8');
const lines = content.split('\n').filter(line => line.trim());

console.log('CSV文件总行数:', lines.length);
console.log('标题行:', lines[0]);
console.log('事件31行:', lines[31]);

// 解析标题行
const headers = lines[0].split(',').map(h => h.trim());
console.log('标题数量:', headers.length);
console.log('最后几个标题:', headers.slice(-5));

// 解析事件31行
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

const values = parseCSVLine(lines[31]);
console.log('值数量:', values.length);
console.log('最后几个值:', values.slice(-5));

// 检查text_id字段
const textIdIndex = headers.indexOf('text_id');
console.log('text_id字段索引:', textIdIndex);
console.log('text_id值:', `"${values[textIdIndex]}"`);
console.log('text_id值长度:', values[textIdIndex].length);

// 检查是否是数字
const textIdValue = values[textIdIndex].trim();
console.log('trim后的text_id值:', `"${textIdValue}"`);
console.log('是否为数字:', !isNaN(Number(textIdValue)));
console.log('转换为数字:', Number(textIdValue)); 