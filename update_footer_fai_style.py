import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_footer = """  <!-- FOOTER -->
  <footer class="cl-zebra-section cl-zebra--tint" style="padding: 24px 0; border-top: 1px solid var(--cl-line);">
    <div class="cl-sec-container" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px;">
      
      <div style="display: flex; gap: 16px; align-items: center;">
        
        <!-- Zalo / Message -->
        <a href="https://zalo.me/0934688632" target="_blank" style="width: 40px; height: 40px; border-radius: 50%; background-color: transparent; border: 1px solid var(--cl-line); color: var(--cl-text-muted); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.borderColor='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.borderColor='var(--cl-line)'; this.style.transform='translateY(0)'" title="Nhắn tin Zalo">
          <svg width="24" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
          </svg>
        </a>

        <!-- Facebook Page -->
        <a href="https://www.facebook.com/nguyenducviet.video/reels/" target="_blank" style="width: 40px; height: 40px; border-radius: 50%; background-color: transparent; border: 1px solid var(--cl-line); color: var(--cl-text-muted); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.borderColor='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.borderColor='var(--cl-line)'; this.style.transform='translateY(0)'" title="Facebook Reels">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        
        <!-- TikTok -->
        <a href="https://www.tiktok.com/nguyenducviet.viral" target="_blank" style="width: 40px; height: 40px; border-radius: 50%; background-color: transparent; border: 1px solid var(--cl-line); color: var(--cl-text-muted); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='var(--cl-text-base)'; this.style.borderColor='var(--cl-text-base)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.borderColor='var(--cl-line)'; this.style.transform='translateY(0)'" title="TikTok Viral">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        </a>
        
        <!-- Personal Facebook -->
        <a href="http://facebook.com/nddviet" target="_blank" style="width: 40px; height: 40px; border-radius: 50%; background-color: transparent; border: 1px solid var(--cl-line); color: var(--cl-text-muted); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.color='var(--cl-accent)'; this.style.borderColor='var(--cl-accent)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.color='var(--cl-text-muted)'; this.style.borderColor='var(--cl-line)'; this.style.transform='translateY(0)'" title="Facebook Cá Nhân">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.58 0-4.9-1.13-6.49-2.92.05-2.15 4.34-3.33 6.49-3.33s6.44 1.18 6.49 3.33C16.9 18.87 14.58 20 12 20z"/>
          </svg>
        </a>
      </div>

      <div style="font-family: var(--font-mono); font-size: 13px; color: var(--cl-text-muted); opacity: 0.8; letter-spacing: 0.02em;">
        © nguyenducviet.video
      </div>
      
    </div>
  </footer>"""

html = re.sub(r'\s*<!-- FOOTER -->.*?</footer>', '\n' + new_footer, html, flags=re.DOTALL)

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
