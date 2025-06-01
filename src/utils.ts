// Base64 encoding/decoding without Node.js Buffer
export function base64Encode(str: string): string {
  if (!str) return '';
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  // Convert string to UTF-8 bytes first
  const utf8Bytes = unescape(encodeURIComponent(str));
  let result = '';
  
  for (let i = 0; i < utf8Bytes.length; i += 3) {
    const a = utf8Bytes.charCodeAt(i);
    const b = i + 1 < utf8Bytes.length ? utf8Bytes.charCodeAt(i + 1) : 0;
    const c = i + 2 < utf8Bytes.length ? utf8Bytes.charCodeAt(i + 2) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i + 1 < utf8Bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i + 2 < utf8Bytes.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
}

export function base64Decode(str: string): string {
  if (!str) return '';
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  // Remove whitespace and check for padding
  str = str.replace(/\s/g, '');
  const paddingCount = (str.match(/=/g) || []).length;
  
  // Remove padding for processing
  str = str.replace(/=/g, '');
  
  let i = 0;
  while (i < str.length) {
    const encoded1 = chars.indexOf(str.charAt(i++));
    const encoded2 = chars.indexOf(str.charAt(i++));
    const encoded3 = chars.indexOf(str.charAt(i++));
    const encoded4 = chars.indexOf(str.charAt(i++));
    
    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
    
    result += String.fromCharCode((bitmap >> 16) & 255);
    if (i - 2 < str.length || paddingCount < 2) {
      result += String.fromCharCode((bitmap >> 8) & 255);
    }
    if (i - 1 < str.length || paddingCount < 1) {
      result += String.fromCharCode(bitmap & 255);
    }
  }
  
  // Convert UTF-8 bytes back to Unicode string
  try {
    return decodeURIComponent(escape(result));
  } catch (e) {
    return result;
  }
}

// Console logging wrapper for environments without console
export function log(...args: any[]): void {
  if (typeof console !== 'undefined' && console.log) {
    console.log(...args);
  }
}

export function error(...args: any[]): void {
  if (typeof console !== 'undefined' && console.error) {
    console.error(...args);
  }
}

// Language support utilities
export type Language = 'zh' | 'en';

export function getResourceName(resource: { resource_name: string; resource_name_en: string }, language: Language = 'zh'): string {
  return language === 'en' ? resource.resource_name_en : resource.resource_name;
}

export function getTaskName(task: { task_name: string; task_name_en: string }, language: Language = 'zh'): string {
  return language === 'en' ? task.task_name_en : task.task_name;
}

export function getEventName(event: { event_name_cn: string; event_name_en: string }, language: Language = 'zh'): string {
  return language === 'en' ? event.event_name_en : event.event_name_cn;
}

// Helper function to get localized text from GameText
export function getLocalizedText(gameText: { text_content: string; text_content_en: string }, language: Language = 'zh'): string {
  return language === 'en' ? gameText.text_content_en : gameText.text_content;
} 