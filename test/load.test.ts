/**
 * MailCat Load Tests
 * 
 * Tests API performance under load.
 * Run with: npm run test:load
 * 
 * Warning: These tests make many requests.
 * Do not run against production without permission.
 */

import { describe, it, expect } from 'vitest';

const API_BASE = process.env.API_BASE_URL || 'https://api.mailcat.ai';

interface LoadTestResult {
  total: number;
  successful: number;
  failed: number;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  requestsPerSecond: number;
}

interface RequestResult {
  success: boolean;
  latency: number;
  error?: string;
}

async function makeRequest(
  url: string, 
  options: RequestInit = {}
): Promise<RequestResult> {
  const start = Date.now();
  
  try {
    const res = await fetch(url, options);
    const latency = Date.now() - start;
    
    return {
      success: res.ok,
      latency,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - start,
      error: (error as Error).message,
    };
  }
}

function analyzeResults(results: RequestResult[]): LoadTestResult {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const latencies = successful.map(r => r.latency).sort((a, b) => a - b);
  
  const sum = latencies.reduce((a, b) => a + b, 0);
  const totalTime = Math.max(...results.map(r => r.latency));
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    minLatency: latencies[0] || 0,
    maxLatency: latencies[latencies.length - 1] || 0,
    avgLatency: latencies.length > 0 ? sum / latencies.length : 0,
    p50Latency: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95Latency: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99Latency: latencies[Math.floor(latencies.length * 0.99)] || 0,
    requestsPerSecond: results.length / (totalTime / 1000),
  };
}

describe('Load Tests', { timeout: 120000 }, () => {
  // Skip load tests by default - enable explicitly
  const runLoadTests = process.env.RUN_LOAD_TESTS === 'true';

  describe('Health Endpoint Load', () => {
    it.skipIf(!runLoadTests)('should handle 100 concurrent health checks', async () => {
      const concurrency = 100;
      
      const promises = Array(concurrency)
        .fill(null)
        .map(() => makeRequest(`${API_BASE}/health`));
      
      const results = await Promise.all(promises);
      const analysis = analyzeResults(results);
      
      console.log('Health endpoint load test results:', analysis);
      
      // Assertions
      expect(analysis.successful).toBeGreaterThan(concurrency * 0.95); // 95% success rate
      expect(analysis.p95Latency).toBeLessThan(500); // P95 under 500ms
    });

    it.skipIf(!runLoadTests)('should handle sustained load on health endpoint', async () => {
      const duration = 10000; // 10 seconds
      const interval = 100; // 100ms between requests
      const results: RequestResult[] = [];
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < duration) {
        const result = await makeRequest(`${API_BASE}/health`);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      
      const analysis = analyzeResults(results);
      
      console.log('Sustained health check results:', analysis);
      
      expect(analysis.successful / analysis.total).toBeGreaterThan(0.99);
    });
  });

  describe('Registration Load', () => {
    it.skipIf(!runLoadTests)('should handle 50 concurrent registrations', async () => {
      const concurrency = 50;
      
      const promises = Array(concurrency)
        .fill(null)
        .map(() => makeRequest(`${API_BASE}/mailboxes`, { method: 'POST' }));
      
      const results = await Promise.all(promises);
      const analysis = analyzeResults(results);
      
      console.log('Registration load test results:', analysis);
      
      // May hit rate limits, so expect some failures
      expect(analysis.successful).toBeGreaterThan(concurrency * 0.5);
      expect(analysis.p95Latency).toBeLessThan(2000); // P95 under 2s
    });
  });

  describe('Inbox Check Load', () => {
    it.skipIf(!runLoadTests)('should handle repeated inbox checks', async () => {
      // First, create a mailbox
      const registerRes = await fetch(`${API_BASE}/mailboxes`, { method: 'POST' });
      const { token } = await registerRes.json();
      
      const iterations = 100;
      const results: RequestResult[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const result = await makeRequest(`${API_BASE}/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        results.push(result);
      }
      
      const analysis = analyzeResults(results);
      
      console.log('Inbox check load test results:', analysis);
      
      expect(analysis.successful).toBe(iterations);
      expect(analysis.avgLatency).toBeLessThan(200);
    });
  });

  describe('Mixed Workload', () => {
    it.skipIf(!runLoadTests)('should handle mixed API operations', async () => {
      const results: RequestResult[] = [];
      const tokens: string[] = [];
      
      // Phase 1: Create mailboxes
      console.log('Phase 1: Creating mailboxes...');
      for (let i = 0; i < 10; i++) {
        const result = await makeRequest(`${API_BASE}/mailboxes`, { method: 'POST' });
        results.push(result);
        
        if (result.success) {
          const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST' });
          const data = await res.json();
          tokens.push(data.token);
        }
      }
      
      // Phase 2: Check inboxes
      console.log('Phase 2: Checking inboxes...');
      for (const token of tokens) {
        for (let i = 0; i < 5; i++) {
          const result = await makeRequest(`${API_BASE}/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          results.push(result);
        }
      }
      
      // Phase 3: Health checks
      console.log('Phase 3: Health checks...');
      for (let i = 0; i < 20; i++) {
        const result = await makeRequest(`${API_BASE}/health`);
        results.push(result);
      }
      
      const analysis = analyzeResults(results);
      
      console.log('Mixed workload results:', analysis);
      
      expect(analysis.successful / analysis.total).toBeGreaterThan(0.9);
    });
  });

  describe('Stress Test', () => {
    it.skipIf(!runLoadTests)('should handle burst traffic', async () => {
      const burstSize = 200;
      
      console.log(`Starting burst of ${burstSize} requests...`);
      
      const promises = Array(burstSize)
        .fill(null)
        .map(() => makeRequest(`${API_BASE}/health`));
      
      const results = await Promise.all(promises);
      const analysis = analyzeResults(results);
      
      console.log('Burst traffic results:', analysis);
      
      // Some failures expected under extreme load
      expect(analysis.successful).toBeGreaterThan(burstSize * 0.8);
    });
  });
});

describe('Latency Benchmarks', () => {
  const runBenchmarks = process.env.RUN_BENCHMARKS === 'true';

  it.skipIf(!runBenchmarks)('benchmark: health endpoint', async () => {
    const iterations = 50;
    const latencies: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await fetch(`${API_BASE}/health`);
      latencies.push(Date.now() - start);
    }
    
    latencies.sort((a, b) => a - b);
    
    console.log('Health endpoint benchmark:');
    console.log(`  Min: ${latencies[0]}ms`);
    console.log(`  Max: ${latencies[latencies.length - 1]}ms`);
    console.log(`  Avg: ${(latencies.reduce((a, b) => a + b, 0) / iterations).toFixed(2)}ms`);
    console.log(`  P50: ${latencies[Math.floor(iterations * 0.5)]}ms`);
    console.log(`  P95: ${latencies[Math.floor(iterations * 0.95)]}ms`);
  });

  it.skipIf(!runBenchmarks)('benchmark: registration', async () => {
    const iterations = 20; // Fewer due to rate limits
    const latencies: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await fetch(`${API_BASE}/mailboxes`, { method: 'POST' });
      latencies.push(Date.now() - start);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    latencies.sort((a, b) => a - b);
    
    console.log('Registration benchmark:');
    console.log(`  Min: ${latencies[0]}ms`);
    console.log(`  Max: ${latencies[latencies.length - 1]}ms`);
    console.log(`  Avg: ${(latencies.reduce((a, b) => a + b, 0) / iterations).toFixed(2)}ms`);
    console.log(`  P50: ${latencies[Math.floor(iterations * 0.5)]}ms`);
    console.log(`  P95: ${latencies[Math.floor(iterations * 0.95)]}ms`);
  });

  it.skipIf(!runBenchmarks)('benchmark: inbox check', async () => {
    // Create a mailbox first
    const res = await fetch(`${API_BASE}/mailboxes`, { method: 'POST' });
    const { token } = await res.json();
    
    const iterations = 50;
    const latencies: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await fetch(`${API_BASE}/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      latencies.push(Date.now() - start);
    }
    
    latencies.sort((a, b) => a - b);
    
    console.log('Inbox check benchmark:');
    console.log(`  Min: ${latencies[0]}ms`);
    console.log(`  Max: ${latencies[latencies.length - 1]}ms`);
    console.log(`  Avg: ${(latencies.reduce((a, b) => a + b, 0) / iterations).toFixed(2)}ms`);
    console.log(`  P50: ${latencies[Math.floor(iterations * 0.5)]}ms`);
    console.log(`  P95: ${latencies[Math.floor(iterations * 0.95)]}ms`);
  });
});
