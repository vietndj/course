import re

with open('/Users/vietmac/Documents/CODE/course/miss-extensions.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the 'Mẹo cài đặt nhanh' div
html = re.sub(r'<div style="background: var\(--cl-accent-soft\).*?</div>\n', '', html, flags=re.DOTALL)

# Remove insight-box
html = re.sub(r'\s*<div class="insight-box">.*?</div>', '', html, flags=re.DOTALL)

# Remove guard-card
# Since it is followed by <details class="prompt-container">, we can match up to that.
html = re.sub(r'\s*<div class="guard-card">.*?(?=<details class="prompt-container">)', '\n\n        ', html, flags=re.DOTALL)

with open('miss-extensions.html', 'w', encoding='utf-8') as f:
    f.write(html)
