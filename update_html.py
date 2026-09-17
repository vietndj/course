with open('/Users/vietmac/Documents/CODE/course/miss-extensions.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Title and H1
html = html.replace('BỘ TỨ TIỆN ÍCH', 'BỘ BA TIỆN ÍCH')
html = html.replace('Toàn bộ 4 Trợ lý chuyên trách (Miss Idea, Miss Vlog, Miss Video Ads, Miss Sale Page)', 'Toàn bộ 3 Trợ lý chuyên trách (Miss Idea, Miss Vlog, Miss Video Ads)')

# 2. Remove Miss Sale Page from grid
start_idx = html.find('<!-- 4. Miss Sale Page -->')
end_idx = html.find('</div>\n      </div>\n    </div>\n  </section>')
if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]

# 3. Remove tab button
start_idx = html.find('<button class="tab-btn" id="tabbtn-salepage"')
end_idx = html.find('</button>', start_idx) + len('</button>')
if start_idx != -1:
    html = html[:start_idx] + html[end_idx:]

# 4. Remove panel-salepage
start_idx = html.find('<!-- TAB 4: MISS SALE PAGE -->')
end_idx = html.find('</div>\n\n    </div>\n  </section>\n\n  <!-- HOW TO INSTALL GUIDE -->')
if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]

# 5. Remove sim-box for all
import re
html = re.sub(r'\s*<div class="sim-box">.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)

# 6. Make prompt-container accordion (details/summary)
css_addition = """
    details.prompt-container summary { list-style: none; cursor: pointer; }
    details.prompt-container summary::-webkit-details-marker { display: none; }
"""
html = html.replace('</style>', css_addition + '  </style>')

html = html.replace('<div class="prompt-container">', '<details class="prompt-container">')
html = re.sub(r'<div class="prompt-header">', r'<summary class="prompt-header">', html)
html = re.sub(r'(Sao Chép Prompt</button>)\s*</div>', r'\1\n          </summary>', html)
html = re.sub(r'</pre>\s*</div>', r'</pre>\n        </details>', html)

# 7. Update script ids array
html = html.replace('["idea", "vlog", "ads", "salepage"]', '["idea", "vlog", "ads"]')

# 8. Rewrite "CÁCH CÀI ĐẶT EXTENSION LÊN CHROME" section
start_idx = html.find('<div style="display: flex; flex-direction: column; gap: 16px;">')
end_idx = html.find('</div>\n    </div>\n  </section>\n\n  <!-- TOAST -->')
if start_idx != -1 and end_idx != -1:
    new_install = """<div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: var(--cl-tint); border: 1px solid var(--cl-line); border-radius: 12px; padding: 18px 20px;">
          <strong style="font-family: var(--font-display-long); font-size: 17px; display: block; margin-bottom: 12px;">Link Cài Đặt 3 Extension:</strong>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a href="https://chromewebstore.google.com/detail/miss-idea-%E2%80%94-tr%E1%BB%A3-l%C3%BD-c%E1%BB%91-v%E1%BA%A5n/gcaepndecljnaifdbicjaijndohfjdem" target="_blank" rel="noopener" class="btn-action btn-action--cws" style="width: fit-content;">💡 Miss Idea ↗</a>
            <a href="https://chromewebstore.google.com/detail/miss-vlog-%E2%80%94-tr%E1%BB%A3-l%C3%BD-k%E1%BB%8Bch-b%E1%BA%A5n-x%C3%A2y-k%C3%AAnh/mbhaoimppkeikgjnjebppglamceilbhi" target="_blank" rel="noopener" class="btn-action btn-action--cws" style="width: fit-content;">📹 Miss Vlog ↗</a>
            <a href="https://chromewebstore.google.com/detail/miss-video-ads-%E2%80%94-tr%E1%BB%A3-l%C3%BD-k%E1%BB%8Bch-b%E1%BA%A5n/inmgamfhjhbkejanlljppaflicemgbpe" target="_blank" rel="noopener" class="btn-action btn-action--cws" style="width: fit-content;">🎬 Miss Video Ads ↗</a>
          </div>
        </div>
      """
    html = html[:start_idx] + new_install + html[end_idx:]

with open('miss-extensions.html', 'w', encoding='utf-8') as f:
    f.write(html)
