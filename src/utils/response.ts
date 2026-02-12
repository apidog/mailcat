/**
 * HTTP Response utilities
 */

import type { ApiResponse } from '../types';

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Test-Token',
};

/**
 * Create a JSON response with CORS headers
 */
export function json(
  data: ApiResponse, 
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

// RFC 9457 error code titles
const errorTitles: Record<string, string> = {
  unauthorized: 'Unauthorized',
  invalid_token: 'Invalid Token',
  rate_limit_exceeded: 'Rate Limit Exceeded',
  invalid_name: 'Invalid Name',
  name_taken: 'Name Already Taken',
  not_found: 'Not Found',
};

/**
 * Create an RFC 9457 Problem Details error response
 */
export function error(
  code: string, 
  detail: string, 
  status: number,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify({
    type: `https://mailcat.ai/errors/${code}`,
    title: errorTitles[code] || 'Error',
    status,
    detail,
  }), {
    status,
    headers: {
      'Content-Type': 'application/problem+json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

/**
 * Create a CORS preflight response
 */
export function corsPreflightResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Create a 204 No Content response
 */
export function noContent(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/**
 * Convert Unix timestamp (ms) to ISO 8601 string
 */
export function toISO8601(timestampMs: number): string {
  return new Date(timestampMs).toISOString();
}
