import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

# New premium footer HTML
new_footer = """  <!-- FOOTER -->
  <footer class="cl-zebra-section cl-zebra--tint" style="padding: 80px 0 60px; border-top: 1px solid var(--cl-line);">
    <div class="cl-sec-container cl-sec-container--narrow" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div class="cl-badge" style="margin-bottom: 20px;">LIÊN HỆ & CỘNG ĐỒNG</div>
      
      <h2 class="title-short" style="font-size: clamp(24px, 4vw, 32px); margin-bottom: 16px;">KẾT NỐI VỚI NGUYỄN VIỆT</h2>
      <p class="cl-body" style="margin-bottom: 40px; color: var(--cl-text-muted); max-width: 480px;">
        Đừng ngại nhắn tin trực tiếp để trao đổi công việc, đăng ký khóa học hoặc nhờ tư vấn giải pháp thực chiến.
      </p>

      <a href="https://zalo.me/0934688632" target="_blank" class="btn-action" style="margin-bottom: 48px; width: 100%; max-width: 340px; font-family: var(--font-display-short); letter-spacing: 0.05em; padding: 18px 24px; border-radius: 100px; font-size: 15px;">
        💬 NHẮN TIN ZALO / IMESSAGE
      </a>
      
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; font-family: var(--font-display-long); font-size: 15px; font-weight: 600;">
        <a href="https://www.facebook.com/nguyenducviet.video/reels/" target="_blank" style="color: var(--cl-text-base); text-decoration: none; border-bottom: 2px solid var(--cl-accent); padding-bottom: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Facebook Reels ↗</a>
        <a href="https://www.tiktok.com/nguyenducviet.viral" target="_blank" style="color: var(--cl-text-base); text-decoration: none; border-bottom: 2px solid var(--cl-accent); padding-bottom: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">TikTok Viral ↗</a>
        <a href="http://facebook.com/nddviet" target="_blank" style="color: var(--cl-text-base); text-decoration: none; border-bottom: 2px solid var(--cl-accent); padding-bottom: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Facebook Cá Nhân ↗</a>
      </div>

      <div style="margin-top: 64px; font-family: var(--font-mono); font-size: 13px; color: var(--cl-text-muted); opacity: 0.7;">
        © NGUYEN VIET VIDEO STUDIO
      </div>
    </div>
  </footer>"""

# Replace old footer
html = re.sub(r'  <!-- FOOTER -->.*?</footer>', new_footer, html, flags=re.DOTALL)

# Remove the ugly footer-btn hack in dark mode CSS
html = re.sub(r'\s*/\* Footer buttons override \*/\s*\.footer-btn.*?}', '', html, flags=re.DOTALL)

with open('3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
