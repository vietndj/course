import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

dark_mode_css = """
    /* DARK MODE AUTO SWITCH */
    @media (prefers-color-scheme: dark) {
      :root {
        --cl-bg: #0b0f19;
        --cl-tint: #111827;
        --cl-line: #1e293b;
        --cl-text-base: #f8fafc;
        --cl-text-body: #cbd5e1;
        --cl-text-muted: #64748b;
        --cl-accent: #3b82f6;
        --cl-accent-soft: rgba(59, 130, 246, 0.15);
      }
      body { background-color: var(--cl-bg); }
      .topbar { background: rgba(11, 15, 25, 0.94); border-bottom-color: var(--cl-line); }
      .hero-badge { background: var(--cl-text-base); color: var(--cl-bg); }
      .suite-card { background: var(--cl-tint); border-color: var(--cl-line); }
      .tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: var(--cl-text-base); }
      .tab-btn.active { color: var(--cl-bg); background: var(--cl-text-base); }
      .ext-panel { background: var(--cl-tint); border-color: var(--cl-line); }
      
      .btn-action--copy { background: #1e293b; color: #f8fafc; border-color: #334155; }
      .btn-action--copy:hover { background: #334155; }
      
      .cl-zebra--light { background-color: var(--cl-bg); }
      .cl-zebra--tint { background-color: var(--cl-tint); }
      
      /* Footer buttons override */
      .footer-btn { background: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
    }
"""

# Insert CSS right before </style>
html = html.replace('</style>', dark_mode_css + '\n  </style>')

# Replace hardcoded #fff in footer with class="footer-btn"
html = html.replace('style="padding: 8px 16px; background: #fff; border: 1px solid var(--cl-line); border-radius: 100px; color: var(--cl-text-body); font-weight: 600; font-size: 14px; text-decoration: none;"', 'class="footer-btn" style="padding: 8px 16px; background: #fff; border: 1px solid var(--cl-line); border-radius: 100px; color: var(--cl-text-body); font-weight: 600; font-size: 14px; text-decoration: none;"')

with open('3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
