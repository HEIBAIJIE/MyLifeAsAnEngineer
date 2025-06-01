// Test setup file
// This file is run before each test file

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(10000);

// Setup for all tests
import 'jest';

// Add btoa and atob polyfills for Node.js environment
global.btoa = (str: string): string => {
  return Buffer.from(str, 'binary').toString('base64');
};

global.atob = (str: string): string => {
  return Buffer.from(str, 'base64').toString('binary');
};

// Setup common test configuration
beforeEach(() => {
  jest.clearAllMocks();
}); 