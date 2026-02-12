/**
 * MailCat JavaScript/TypeScript SDK
 * 
 * A simple client for the MailCat API.
 * 
 * Usage:
 *   import { MailCat } from './mailcat.js';
 *   
 *   const client = new MailCat();
 *   const mailbox = await client.createMailbox();
 *   console.log(`Email: ${mailbox.email}`);
 *   
 *   const email = await client.waitForEmail();
 *   console.log(`Code: ${email.code}`);
 */

class MailCatError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MailCatError';
    this.code = code;
  }
}

class RateLimitError extends MailCatError {
  constructor(message) {
    super(message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

class AuthenticationError extends MailCatError {
  constructor(message) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * MailCat API client
 */
class MailCat {
  /**
   * Create a new MailCat client
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - API base URL (default: https://api.mailcat.ai)
   * @param {number} options.timeout - Request timeout in ms (default: 30000)
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || 'https://api.mailcat.ai').replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this._token = null;
    this._email = null;
  }

  /**
   * Make an API request
   * @private
   */
  async _request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...options.headers };

    if (options.auth && this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.status === 429) {
        throw new RateLimitError(data.error || 'Rate limit exceeded');
      }

      if (response.status === 401) {
        throw new AuthenticationError(data.error || 'Authentication failed');
      }

      if (!data.success && data.success !== undefined) {
        throw new MailCatError(data.error || 'Unknown error');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new MailCatError('Request timeout', 'TIMEOUT');
      }
      throw error;
    }
  }

  /**
   * Create a new mailbox
   * @returns {Promise<{email: string, token: string}>} Mailbox info
   * 
   * @example
   * const mailbox = await client.createMailbox();
   * console.log(mailbox.email); // swift-coral-42@mailcat.ai
   */
  async createMailbox() {
    const response = await this._request('POST', '/mailboxes');
    const data = response.data;
    
    this._token = data.token;
    this._email = data.email;
    
    return {
      email: data.email,
      token: data.token,
    };
  }

  /**
   * Get list of emails in inbox
   * @returns {Promise<Array<{id: string, from: string, subject: string, receivedAt: string}>>}
   * 
   * @example
   * const emails = await client.getInbox();
   * emails.forEach(e => console.log(e.subject));
   */
  async getInbox() {
    const response = await this._request('GET', '/inbox', { auth: true });
    return response.data || [];
  }

  /**
   * Get full email content by ID
   * @param {string} emailId - Email ID from inbox
   * @returns {Promise<{email: Object, code: string|null, links: string[]}>}
   * 
   * @example
   * const email = await client.getEmail('abc123');
   * console.log(email.code); // Extracted verification code
   */
  async getEmail(emailId) {
    const response = await this._request('GET', `/emails/${emailId}`, { auth: true });
    const data = response.data || {};
    return {
      email: data.email || {},
      code: data.code || null,
      links: data.links || [],
    };
  }

  /**
   * Delete an email
   * @param {string} emailId - Email ID to delete
   * @returns {Promise<boolean>}
   */
  async deleteEmail(emailId) {
    await this._request('DELETE', `/emails/${emailId}`, { auth: true });
    return true;
  }

  /**
   * Wait for an email to arrive
   * @param {Object} options - Wait options
   * @param {number} options.timeout - Max wait time in ms (default: 300000)
   * @param {number} options.pollInterval - Poll interval in ms (default: 10000)
   * @param {string} options.subjectContains - Filter by subject
   * @returns {Promise<Object|null>} Email object or null if timeout
   * 
   * @example
   * const email = await client.waitForEmail({ timeout: 60000 });
   * if (email) console.log(`Got code: ${email.code}`);
   */
  async waitForEmail(options = {}) {
    const timeout = options.timeout || 300000;
    const pollInterval = options.pollInterval || 10000;
    const subjectContains = options.subjectContains?.toLowerCase();
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const emails = await this.getInbox();
      
      for (const summary of emails) {
        if (subjectContains && !summary.subject?.toLowerCase().includes(subjectContains)) {
          continue;
        }
        
        return this.getEmail(summary.id);
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return null;
  }

  /**
   * Wait for an email with a verification code
   * @param {Object} options - Wait options
   * @returns {Promise<string|null>} Verification code or null
   * 
   * @example
   * const code = await client.waitForCode({ timeout: 60000 });
   * if (code) console.log(`Code: ${code}`);
   */
  async waitForCode(options = {}) {
    const email = await this.waitForEmail(options);
    return email?.code || null;
  }

  /**
   * Current mailbox email address
   * @returns {string|null}
   */
  get email() {
    return this._email;
  }

  /**
   * Current mailbox token
   * @returns {string|null}
   */
  get token() {
    return this._token;
  }
}

/**
 * Create a new client with a mailbox
 * @param {string} baseUrl - API base URL
 * @returns {Promise<MailCat>}
 * 
 * @example
 * const client = await createMailbox();
 * console.log(client.email);
 */
async function createMailbox(baseUrl = 'https://api.mailcat.ai') {
  const client = new MailCat({ baseUrl });
  await client.createMailbox();
  return client;
}

// ES Module exports
export { MailCat, MailCatError, RateLimitError, AuthenticationError, createMailbox };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MailCat, MailCatError, RateLimitError, AuthenticationError, createMailbox };
}
