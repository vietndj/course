import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_footer = """  <!-- FOOTER -->
  <footer class="cl-zebra-section cl-zebra--tint" style="padding: 24px 0; border-top: 1px solid var(--cl-line);">
    <div class="cl-sec-container" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px;">
      
      <div style="display: flex; gap: 20px; align-items: center;">
        <!-- Zalo / Message -->
        <a href="https://zalo.me/0934688632" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Nhắn tin Zalo / iMessage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
            <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
          </svg>
        </a>

        <!-- Facebook Page -->
        <a href="https://www.facebook.com/nguyenducviet.video/reels/" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Facebook Reels">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-1.1 0-2 .9-2 2v1h3l-1 3h-2v6.8c4.56-.93 8-4.96 8-9.8z"/>
          </svg>
        </a>
        
        <!-- TikTok -->
        <a href="https://www.tiktok.com/nguyenducviet.viral" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-text-base)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="TikTok Viral">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95v7.4c-.01 2.98-1.73 5.82-4.5 6.9-2.77 1.09-6.07.67-8.41-1.1C1.34 19.5 0 16.63 0 13.62c0-2.9 1.25-5.7 3.44-7.53 2.2-1.84 5.25-2.4 8.02-1.55v4.22c-1.39-.48-2.98-.32-4.24.4-1.26.73-2.12 2.05-2.28 3.52-.16 1.48.37 2.97 1.43 3.99 1.06 1.01 2.58 1.41 4.02 1.05 1.43-.36 2.59-1.44 3.03-2.82.44-1.38.31-2.92-.35-4.18V.02z"/>
          </svg>
        </a>
        
        <!-- Personal Facebook -->
        <a href="http://facebook.com/nddviet" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Facebook Cá Nhân">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </a>
      </div>

      <div style="font-family: var(--font-mono); font-size: 13px; color: var(--cl-text-muted); opacity: 0.8; letter-spacing: 0.02em;">
        © nguyenducviet.video
      </div>
      
    </div>
  </footer>"""

html = re.sub(r'  <!-- FOOTER -->.*?</footer>', new_footer, html, flags=re.DOTALL)

with open('3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
