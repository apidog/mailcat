export function getHomePage(domain: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MailCat - Open Source Email Service for AI Agents</title>
  <meta name="description" content="Free, open-source email service for AI agents. Instant mailbox creation, receive emails, no signup required. Self-host or use our API. MIT licensed.">
  <meta name="keywords" content="AI email, AI agent email, temporary email API, disposable email, verification code extraction, open source email, email for bots, automated email">
  <meta name="author" content="MailCat">
  <meta name="theme-color" content="#C041FF">
  <link rel="canonical" href="https://${domain}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${domain}">
  <meta property="og:title" content="MailCat - Open Source Email for AI Agents">
  <meta property="og:description" content="Free, open-source email service for AI agents. Instant mailbox, auto code extraction. Self-host or use our API.">
  <meta property="og:image" content="https://${domain}/og-image.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="MailCat - Open Source Email for AI Agents">
  <meta name="twitter:description" content="Free, open-source email service for AI agents. Instant mailbox, auto code extraction.">
  
  <link rel="icon" href="/favicon.ico">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MailCat",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Open-source email service for AI agents with receive emails, no signup required",
    "url": "https://${domain}",
    "author": {
      "@type": "Organization",
      "name": "MailCat"
    },
    "license": "https://opensource.org/licenses/MIT"
  }
  </script>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --primary: #C041FF;
      --primary-dark: #A030E0;
      --primary-light: #D070FF;
      --gradient: linear-gradient(135deg, #FF7366 0%, #FF4DB5 25%, #C041FF 50%, #5983FF 75%, #4DC4FF 100%);
      --bg: #09090B;
      --bg-secondary: #18181B;
      --bg-tertiary: #27272A;
      --text: #FAFAFA;
      --text-secondary: #A1A1AA;
      --text-muted: #71717A;
      --border: #27272A;
      --border-light: #3F3F46;
      --success: #22C55E;
      --code-bg: #0C0C0E;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header */
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 16px 0;
      background: rgba(9, 9, 11, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }
    
    .logo-icon { display: flex; align-items: center; }
    
    nav {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    
    nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    nav a:hover { color: var(--text); }
    
    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .nav-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-light);
    }
    
    .github-stars {
      display: flex;
      align-items: center;
    }
    
    .github-stars img {
      height: 20px;
    }
    
    /* Hero */
    .hero {
      padding: 160px 0 80px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 600px;
      background: radial-gradient(ellipse, rgba(192, 65, 255, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-light);
      border-radius: 100px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 24px;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .hero-badge:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--text-muted);
      color: var(--text);
    }
    
    .hero-badge svg {
      width: 16px;
      height: 16px;
    }
    
    .hero h1 {
      font-size: 64px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }
    
    .hero h1 span {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-subtitle {
      font-size: 20px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
    }
    
    .btn-primary {
      background: var(--gradient);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(192, 65, 255, 0.4);
    }
    
    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text);
      border: 1px solid var(--border);
    }
    
    .btn-secondary:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-light);
    }
    
    /* Try It Section */
    .try-it {
      padding: 80px 0;
    }
    
    .try-it-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .try-it-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .try-it-header h2 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .try-it-badge {
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
      border-radius: 100px;
      font-weight: 500;
    }
    
    .try-it-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--border);
    }
    
    .try-it-left, .try-it-right {
      background: var(--bg-secondary);
      padding: 24px;
    }
    
    .endpoint-label {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .method-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .method-post { background: rgba(34, 197, 94, 0.15); color: #22C55E; }
    .method-get { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
    
    .endpoint-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .code-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
    }
    
    .code-tab {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;
    }
    
    .code-tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    
    .code-content {
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.7;
      overflow-x: auto;
    }
    
    .code-content pre { margin: 0; }
    .code-comment { color: var(--text-muted); }
    .code-string { color: #A5D6FF; }
    .code-key { color: #7EE787; }
    .code-number { color: #FFA657; }
    
    .response-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .status-badge {
      font-size: 12px;
      padding: 2px 8px;
      background: rgba(34, 197, 94, 0.15);
      color: var(--success);
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* Prompt Box */
    .prompt-section {
      padding: 60px 0;
    }
    
    .prompt-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
    }
    
    .prompt-box h3 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .prompt-box > p {
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    
    .prompt-input {
      display: flex;
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .prompt-input code {
      flex: 1;
      padding: 16px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: var(--text-secondary);
      text-align: left;
      line-height: 1.6;
    }
    
    .prompt-input button {
      padding: 16px 24px;
      background: var(--gradient);
      color: white;
      border: none;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .prompt-input button:hover {
      opacity: 0.9;
    }
    
    .prompt-hint {
      margin-top: 16px;
      font-size: 14px;
      color: var(--text-muted);
    }
    
    /* Features */
    .features {
      padding: 80px 0;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }
    
    .section-header h2 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    .section-header p {
      font-size: 18px;
      color: var(--text-secondary);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .feature-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      transition: all 0.2s;
    }
    
    .feature-card:hover {
      border-color: var(--border-light);
      transform: translateY(-4px);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(255, 115, 102, 0.15) 0%, rgba(192, 65, 255, 0.15) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }
    
    .feature-card h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .feature-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    /* Use Cases */
    .use-cases {
      padding: 80px 0;
      background: var(--bg-secondary);
    }
    
    .use-cases-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .use-case-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
    }
    
    .use-case-icon {
      font-size: 32px;
      margin-bottom: 16px;
    }
    
    .use-case-card h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .use-case-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    /* FAQ */
    .faq {
      padding: 80px 0;
    }
    
    .faq-list {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .faq-item {
      border-bottom: 1px solid var(--border);
    }
    
    .faq-item:first-child {
      border-top: 1px solid var(--border);
    }
    
    .faq-item summary {
      padding: 20px 0;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .faq-item summary::-webkit-details-marker { display: none; }
    
    .faq-item summary::after {
      content: '+';
      font-size: 24px;
      color: var(--text-muted);
      transition: transform 0.2s;
    }
    
    .faq-item[open] summary::after {
      transform: rotate(45deg);
    }
    
    .faq-item p {
      padding-bottom: 20px;
      color: var(--text-secondary);
      line-height: 1.7;
    }
    
    /* CTA */
    .cta {
      padding: 100px 0;
      text-align: center;
    }
    
    .cta h2 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .cta p {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    
    .cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 24px;
    }
    
    /* Footer */
    footer {
      padding: 32px 0;
      border-top: 1px solid var(--border);
      text-align: center;
    }
    
    footer p {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    footer a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    footer a:hover { color: var(--text); }
    
    /* Playground */
    .playground {
      padding: 80px 0;
    }
    
    .playground-box {
      max-width: 600px;
      margin: 0 auto;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
    }
    
    .playground-result {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      min-height: 120px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }
    
    .playground-hint {
      color: var(--text-muted);
      text-align: center;
    }
    
    .playground-actions {
      display: flex;
      gap: 12px;
    }
    
    .playground-actions .btn {
      flex: 1;
    }
    
    .playground-email {
      color: var(--primary);
      font-weight: 600;
    }
    
    .playground-token {
      color: var(--text-muted);
      font-size: 12px;
      word-break: break-all;
    }
    
    .playground-inbox-item {
      padding: 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-top: 8px;
    }
    
    .playground-inbox-item strong {
      color: var(--primary);
    }

    /* Responsive */
    @media (max-width: 900px) {
      .features-grid, .use-cases-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .try-it-content {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 640px) {
      .hero h1 { font-size: 40px; }
      .hero-subtitle { font-size: 16px; }
      .features-grid, .use-cases-grid {
        grid-template-columns: 1fr;
      }
      nav { display: none; }
      .prompt-input {
        flex-direction: column;
      }
      .prompt-input code {
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <a href="/" class="logo">
        <span class="logo-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><defs><linearGradient id="lg" x1="21.7" x2="2.4" y1="2.9" y2="20.9" gradientUnits="userSpaceOnUse"><stop stop-color="#FF7366"/><stop offset=".25" stop-color="#FF4DB5"/><stop offset=".5" stop-color="#C041FF"/><stop offset=".75" stop-color="#5983FF"/><stop offset="1" stop-color="#4DC4FF"/></linearGradient></defs><path fill="url(#lg)" d="M19.279 4.262c-.337-.4-.703-.77-1.095-1.11a1.2 1.2 0 0 0-1.764.209l-.943 1.32-1.148 1.609a12.726 12.726 0 0 0-4.656 0L8.525 4.68l-.944-1.32a1.2 1.2 0 0 0-1.763-.21 9.94 9.94 0 0 0-1.095 1.11A10.204 10.204 0 0 0 2.387 9.75a7.47 7.47 0 0 0-.027.401 1.05 1.05 0 0 0 1.049 1.099h.341c.774 0 1.418-.59 1.493-1.36.006-.053.01-.1.017-.14a7.426 7.426 0 0 1 1.195-3.064l.376.526 1.23 1.723c.265.37.736.523 1.17.39a9.367 9.367 0 0 1 2.333-.39c.146-.005.291-.01.438-.01.147 0 .293.005.438.01a9.436 9.436 0 0 1 2.333.39c.435.133.905-.02 1.17-.39l1.23-1.723.376-.526c.229.335.431.693.603 1.069.432.944.675 2.003.675 3.12 0 .556-.06 1.098-.174 1.618-.683 3.125-3.3 5.48-6.445 5.578-.069.002-.138.004-.207.004-.069 0-.137-.002-.206-.004-2.447-.077-4.574-1.52-5.72-3.628a1.784 1.784 0 0 0-1.563-.943H4.13a1.05 1.05 0 0 0-.968 1.46c1.471 3.42 4.729 5.837 8.534 5.96.102.002.204.005.305.005s.203-.003.305-.005c4.707-.153 8.578-3.815 9.262-8.546.07-.489.108-.989.108-1.498 0-2.53-.905-4.845-2.396-6.614z"/></svg></span>
        <span>MailCat<span style="font-size: 14px; color: var(--text-secondary); font-weight: 400;">.ai</span></span>
      </a>
      <nav>
        <a href="https://${domain}/skill.md">Skill.md</a>
        <a href="https://api.${domain}/health">Status</a>
        <a href="https://github.com/mailneural/mailcat" target="_blank" class="github-stars">
          <img src="https://img.shields.io/github/stars/mailneural/mailcat?style=social" alt="GitHub stars">
        </a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <a href="https://github.com/mailneural/mailcat" target="_blank" class="hero-badge">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Open Source · MIT License
        </a>
        <h1>Give your <span>AI Agent</span><br>its own email address</h1>
        <p class="hero-subtitle">
          Empower your AI agent (e.g., OpenClaw) to create mailboxes and receive emails on its own—no signup required. 
          <br/>
          Free, open-source, and self-hostable.
        </p>
        <div class="hero-actions">
          <a href="https://${domain}/skill.md" class="btn btn-primary">
            View Skill.md
          </a>
          <a href="https://github.com/mailneural/mailcat" target="_blank" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            Star on GitHub
          </a>
        </div>
      </div>
    </section>

    <section class="prompt-section">
      <div class="container">
        <div class="prompt-box">
          <h3>Get Started in Seconds</h3>
          <p>Copy this prompt to your AI agent:</p>
          <div class="prompt-input">
            <code id="prompt-text">Read https://${domain}/skill.md and set up a MailCat mailbox for yourself. Save the token securely.</code>
            <button onclick="copyPrompt()">Copy</button>
          </div>
          <p class="prompt-hint">Your agent will handle the rest — no human intervention needed.</p>
        </div>
      </div>
    </section>

    <section class="playground">
      <div class="container">
        <div class="section-header">
          <h2>Try It Now</h2>
          <p>Create a mailbox instantly — no signup required</p>
        </div>
        <div class="playground-box">
          <div class="playground-result" id="playground-result">
            <p class="playground-hint">Click the button to create your mailbox</p>
          </div>
          <div class="playground-actions">
            <button class="btn btn-primary" id="create-btn" onclick="createMailbox()">
              Create Mailbox
            </button>
            <button class="btn btn-secondary" id="check-btn" onclick="checkInbox()" style="display: none;">
              Check Inbox
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Everything You Need</h2>
          <p>Built for AI agents, designed for developers</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant Mailboxes</h3>
            <p>Create a mailbox with a single API call. No signup, no verification required.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Auto-Extraction</h3>
            <p>Verification codes and action links are automatically extracted from every email.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>Built for AI</h3>
            <p>Simple REST API designed for AI agents. Perfect for automated workflows.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>Emails auto-delete after 1 hour. No logs, no tracking.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h3>Self-Hostable</h3>
            <p>Deploy on your own Cloudflare account in minutes. Full control, zero vendor lock-in.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💻</div>
            <h3>100% Open Source</h3>
            <p>MIT licensed. Read the code, contribute, or fork it.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="use-cases">
      <div class="container">
        <div class="section-header">
          <h2>Use Cases</h2>
          <p>Real scenarios where MailCat shines</p>
        </div>
        <div class="use-cases-grid">
          <div class="use-case-card">
            <div class="use-case-icon">🔐</div>
            <h3>Autonomous Signups</h3>
            <p>Let your agent register for services. Verification codes are auto-extracted.</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon">📰</div>
            <h3>Newsletter Reader</h3>
            <p>Subscribe to newsletters. Your agent reads, summarizes, and briefs you.</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon">🔔</div>
            <h3>Notification Monitor</h3>
            <p>Receive alerts and updates. Your agent watches and acts on important emails.</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon">📊</div>
            <h3>Automated Reports</h3>
            <p>Collect scheduled reports and data exports. Agent processes and extracts insights.</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon">🔒</div>
            <h3>Privacy Email</h3>
            <p>Forward only specific emails here. Your agent sees only what you allow.</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon">⚡</div>
            <h3>Email Triggers</h3>
            <p>Trigger workflows when specific emails arrive. Approvals, reminders, automations.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="faq">
      <div class="container">
        <div class="section-header">
          <h2>FAQ</h2>
          <p>Common questions answered</p>
        </div>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Is MailCat really free?</summary>
            <p>Yes, completely free. No credit card, no hidden fees. Open source and community-driven.</p>
          </details>
          <details class="faq-item">
            <summary>How long are emails stored?</summary>
            <p>Emails auto-delete after 1 hour. This is by design for temporary verification flows.</p>
          </details>
          <details class="faq-item">
            <summary>Can I self-host MailCat?</summary>
            <p>Yes! Clone the repo, deploy to your Cloudflare account, and you own everything. MIT licensed.</p>
          </details>
          <details class="faq-item">
            <summary>What about rate limits?</summary>
            <p>10 mailbox registrations per hour per IP. API calls have no hard limit (fair use).</p>
          </details>
          <details class="faq-item">
            <summary>Is my data private?</summary>
            <p>Yes. Emails are encrypted in transit, stored temporarily, and auto-deleted. You can also self-host.</p>
          </details>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Ready to Start?</h2>
        <p>Give your AI agent email superpowers today.</p>
        <div class="hero-actions">
          <a href="https://${domain}/skill.md" class="btn btn-primary">
            Get Started
          </a>
          <a href="https://github.com/mailneural/mailcat" target="_blank" class="btn btn-secondary">
            View on GitHub
          </a>
        </div>
        <p class="cta-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Open source under MIT License
        </p>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>
        Built with 🧡 by the MailCat community
        &nbsp;·&nbsp;
        <a href="https://${domain}/skill.md">API</a>
        &nbsp;·&nbsp;
        <a href="https://github.com/mailneural/mailcat" target="_blank">GitHub</a>
      </p>
    </div>
  </footer>

  <script>
    let mailboxToken = null;
    let mailboxEmail = null;
    
    function copyPrompt() {
      const text = document.getElementById('prompt-text').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.prompt-input button');
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = 'Copy', 2000);
      });
    }
    
    async function createMailbox() {
      const result = document.getElementById('playground-result');
      const createBtn = document.getElementById('create-btn');
      const checkBtn = document.getElementById('check-btn');
      
      result.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Creating mailbox...</p>';
      createBtn.disabled = true;
      
      try {
        const res = await fetch('https://api.${domain}/mailboxes', { method: 'POST' });
        const data = await res.json();
        
        if (data.data && data.data.email) {
          mailboxToken = data.data.token;
          mailboxEmail = data.data.email;
          
          result.innerHTML = \`
            <p style="margin-bottom: 12px;"><strong style="color: var(--success);">✓ Mailbox created!</strong></p>
            <p style="margin-bottom: 8px;">📧 Email: <span class="playground-email">\${data.data.email}</span></p>
            <p style="margin-bottom: 12px;">🔑 Token: <span class="playground-token">\${data.data.token}</span></p>
            <p style="color: var(--text-muted); font-size: 12px;">Send an email to this address, then click "Check Inbox"</p>
          \`;
          
          createBtn.style.display = 'none';
          checkBtn.style.display = 'block';
        } else {
          result.innerHTML = '<p style="color: #ff6b6b;">Error: ' + (data.error || 'Unknown error') + '</p>';
        }
      } catch (e) {
        result.innerHTML = '<p style="color: #ff6b6b;">Error: ' + e.message + '</p>';
      }
      
      createBtn.disabled = false;
    }
    
    async function checkInbox() {
      const result = document.getElementById('playground-result');
      const checkBtn = document.getElementById('check-btn');
      
      checkBtn.disabled = true;
      checkBtn.innerText = 'Checking...';
      
      try {
        const res = await fetch('https://api.${domain}/inbox', {
          headers: { 'Authorization': 'Bearer ' + mailboxToken }
        });
        const data = await res.json();
        
        if (data.data) {
          const emails = data.data;
          if (emails.length > 0) {
            let html = '<p style="margin-bottom: 8px;">📧 <span class="playground-email">' + mailboxEmail + '</span></p>';
            html += '<p style="margin-bottom: 4px; font-size: 12px;">🔑 <span class="playground-token">' + mailboxToken + '</span></p>';
            html += '<p style="margin: 12px 0;"><strong>📬 Inbox (' + emails.length + ' emails)</strong></p>';
            emails.slice(0, 3).forEach(email => {
              html += \`<div class="playground-inbox-item">
                <strong>\${email.subject || '(no subject)'}</strong><br>
                <span style="color: var(--text-muted); font-size: 12px;">From: \${email.from}</span>
              </div>\`;
            });
            result.innerHTML = html;
          } else {
            result.innerHTML = \`
              <p style="margin-bottom: 8px;">📧 <span class="playground-email">\${mailboxEmail}</span></p>
              <p style="margin-bottom: 12px; font-size: 12px;">🔑 <span class="playground-token">\${mailboxToken}</span></p>
              <p style="color: var(--text-muted); text-align: center;">No emails yet. Send one and check again!</p>
            \`;
          }
        }
      } catch (e) {
        result.innerHTML += '<p style="color: #ff6b6b; margin-top: 8px;">Error: ' + e.message + '</p>';
      }
      
      checkBtn.disabled = false;
      checkBtn.innerText = 'Check Inbox';
    }
  </script>
</body>
</html>`
}