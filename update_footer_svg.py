import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_footer = """  <!-- FOOTER -->
  <footer class="cl-zebra-section cl-zebra--tint" style="padding: 24px 0; border-top: 1px solid var(--cl-line);">
    <div class="cl-sec-container" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 32px;">
      
      <div style="display: flex; gap: 24px; align-items: center;">
        <!-- Zalo / Message -->
        <a href="https://zalo.me/0934688632" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Nhắn tin Zalo / iMessage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 2H7C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h2v3.5l4-3.5h4c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5zm-3 11H10v-1.5h4V13zm2-4H8V7.5h8V9z"/>
          </svg>
        </a>

        <!-- Facebook Page -->
        <a href="https://www.facebook.com/nguyenducviet.video/reels/" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Facebook Reels">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.32h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 3.32h-2.33v6.559C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
        
        <!-- TikTok -->
        <a href="https://www.tiktok.com/nguyenducviet.viral" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-text-base)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="TikTok Viral">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95v7.4c-.01 2.98-1.73 5.82-4.5 6.9-2.77 1.09-6.07.67-8.41-1.1C1.34 19.5 0 16.63 0 13.62c0-2.9 1.25-5.7 3.44-7.53 2.2-1.84 5.25-2.4 8.02-1.55v4.22c-1.39-.48-2.98-.32-4.24.4-1.26.73-2.12 2.05-2.28 3.52-.16 1.48.37 2.97 1.43 3.99 1.06 1.01 2.58 1.41 4.02 1.05 1.43-.36 2.59-1.44 3.03-2.82.44-1.38.31-2.92-.35-4.18V.02z"/>
          </svg>
        </a>
        
        <!-- Personal Facebook -->
        <a href="http://facebook.com/nddviet" target="_blank" style="color: var(--cl-text-muted); transition: color 0.2s, transform 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.transform='translateY(0)'" title="Facebook Cá Nhân">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.58 0-4.9-1.13-6.49-2.92.05-2.15 4.34-3.33 6.49-3.33s6.44 1.18 6.49 3.33C16.9 18.87 14.58 20 12 20z"/>
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
