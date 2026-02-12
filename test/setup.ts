/**
 * Global test setup
 */

// Test bypass token - set this in .dev.vars and as a secret in production
export const TEST_BYPASS_TOKEN = process.env.TEST_BYPASS_TOKEN || '';

// Headers to include in API requests that need rate limit bypass
export const testHeaders = {
  'X-Test-Token': TEST_BYPASS_TOKEN,
};

export async function setup() {
  console.log('\n🐱 MailCat API Tests');
  console.log(`📡 API: ${process.env.API_BASE_URL || 'https://api.mailcat.ai'}`);
  if (TEST_BYPASS_TOKEN) {
    console.log('🔓 Rate limit bypass enabled');
  }
  console.log('');
  
  // Verify API is reachable
  try {
    const res = await fetch(`${process.env.API_BASE_URL || 'https://api.mailcat.ai'}/health`);
    if (!res.ok) {
      console.warn('⚠️  API health check failed');
    } else {
      console.log('✅ API is reachable');
    }
  } catch (error) {
    console.error('❌ Cannot reach API:', (error as Error).message);
    console.error('   Tests may fail. Check API_BASE_URL environment variable.');
  }
  
  console.log('');
}

export async function teardown() {
  console.log('\n🏁 Tests complete\n');
}
