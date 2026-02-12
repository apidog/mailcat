import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global test timeout
    testTimeout: 30000,
    
    // Test file patterns
    include: ['test/**/*.test.ts'],
    
    // Exclude load tests by default
    exclude: ['test/load.test.ts'],
    
    // Reporter
    reporters: ['verbose'],
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/pages/**', 'src/index.ts'],
    },
    
    // Environment
    environment: 'node',
    
    // Global setup
    globalSetup: './test/setup.ts',
  },
});
