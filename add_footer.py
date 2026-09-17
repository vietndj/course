import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

footer_html = """
  <!-- FOOTER -->
  <footer class="cl-zebra-section cl-zebra--tint" style="padding: 60px 0; border-top: 1px solid var(--cl-line);">
    <div class="cl-sec-container cl-sec-container--narrow" style="text-align: center;">
      <h3 style="font-family: var(--font-display-short); font-size: 16px; letter-spacing: 0.1em; color: var(--cl-text-muted); margin-bottom: 24px; text-transform: uppercase;">Kết Nối Trực Tiếp</h3>
      
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 32px;">
        <a href="https://www.facebook.com/nguyenducviet.video/reels/" target="_blank" style="padding: 8px 16px; background: #fff; border: 1px solid var(--cl-line); border-radius: 100px; color: var(--cl-text-body); font-weight: 600; font-size: 14px; text-decoration: none;">▶ FB Reels</a>
        <a href="https://www.tiktok.com/nguyenducviet.viral" target="_blank" style="padding: 8px 16px; background: #fff; border: 1px solid var(--cl-line); border-radius: 100px; color: var(--cl-text-body); font-weight: 600; font-size: 14px; text-decoration: none;">▶ TikTok Viral</a>
        <a href="http://facebook.com/nddviet" target="_blank" style="padding: 8px 16px; background: #fff; border: 1px solid var(--cl-line); border-radius: 100px; color: var(--cl-text-body); font-weight: 600; font-size: 14px; text-decoration: none;">👤 FB Cá Nhân</a>
      </div>

      <a href="https://zalo.me/0934688632" target="_blank" class="btn-action" style="display: inline-block; width: auto; padding: 14px 40px; border-radius: 100px;">💬 Nhắn Tin Zalo / iMessage</a>
    </div>
  </footer>

"""

# Insert right before <!-- TOAST -->
if '<!-- TOAST -->' in html:
    html = html.replace('<!-- TOAST -->', footer_html + '  <!-- TOAST -->')

with open('3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
