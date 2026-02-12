const adjectives = [
  'swift', 'bright', 'calm', 'bold', 'warm', 'cool', 'kind', 'wise',
  'keen', 'fair', 'pure', 'true', 'free', 'wild', 'soft', 'deep',
  'clear', 'fresh', 'light', 'quick', 'sharp', 'smart', 'proud', 'brave',
  'gentle', 'happy', 'lucky', 'merry', 'noble', 'quiet', 'royal', 'sunny',
  'vivid', 'witty', 'zesty', 'agile', 'clever', 'daring', 'eager', 'fancy'
];

const nouns = [
  'coral', 'river', 'cloud', 'spark', 'flame', 'bloom', 'frost', 'storm',
  'stone', 'maple', 'cedar', 'ocean', 'pearl', 'amber', 'crystal', 'ember',
  'forest', 'garden', 'harbor', 'island', 'jungle', 'meadow', 'mountain', 'prairie',
  'rainbow', 'shadow', 'sunset', 'thunder', 'valley', 'whisper', 'zenith', 'aurora',
  'breeze', 'canyon', 'delta', 'echo', 'falcon', 'glacier', 'horizon', 'ivy'
];

export function generateEmailName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

export function isValidName(name: string): boolean {
  // Allow: lowercase letters, numbers, hyphens, underscores
  // Length: 3-30 characters
  return /^[a-z0-9_-]{3,30}$/.test(name);
}
