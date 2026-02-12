import type { ExtractedData } from '../types';

// Patterns for verification codes
const codePatterns = [
  // English patterns
  /(?:code|otp|pin|passcode|password|verification)[:\s]+(\d{4,8})/gi,
  /(?:enter|use|your)\s+(?:code|otp|pin)[:\s]+(\d{4,8})/gi,
  /(\d{4,8})\s+(?:is your|is the)?\s*(?:code|otp|pin|verification)/gi,
  /verification[:\s]*(\d{4,8})/gi,
  /one-time\s*(?:password|code)[:\s]*(\d{4,8})/gi,
  
  // Chinese patterns
  /验证码[：:\s]*(\d{4,8})/g,
  /校验码[：:\s]*(\d{4,8})/g,
  /动态码[：:\s]*(\d{4,8})/g,
  /安全码[：:\s]*(\d{4,8})/g,
  /(\d{4,8})[是为]?[您你]的?验证码/g,
];

// Patterns for action links
const linkPatterns = [
  // Verification/confirmation links
  /https?:\/\/[^\s<>"]+(?:verify|confirm|activate|validate|auth)[^\s<>"]*/gi,
  
  // Password reset links
  /https?:\/\/[^\s<>"]+(?:reset|password|recover)[^\s<>"]*/gi,
  
  // Magic login links
  /https?:\/\/[^\s<>"]+(?:magic|login|signin|sign-in)[^\s<>"]*/gi,
  
  // Token-based links (common pattern)
  /https?:\/\/[^\s<>"]+[?&](?:token|code|key)=[a-zA-Z0-9_-]+[^\s<>"]*/gi,
  
  // Unsubscribe links
  /https?:\/\/[^\s<>"]+(?:unsubscribe|opt-out|optout)[^\s<>"]*/gi,
];

export function extractData(text: string, html?: string): ExtractedData {
  const content = `${text} ${html || ''}`;
  
  // Extract codes
  let code: string | null = null;
  for (const pattern of codePatterns) {
    const match = pattern.exec(content);
    if (match && match[1]) {
      code = match[1];
      break;
    }
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
  }
  
  // Extract links
  const links: Set<string> = new Set();
  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Clean up the URL (remove trailing punctuation)
      let url = match[0].replace(/[.,;:!?)\]}>]+$/, '');
      links.add(url);
    }
    pattern.lastIndex = 0;
  }
  
  return {
    code,
    links: links.size > 0 ? Array.from(links) : null,
  };
}
