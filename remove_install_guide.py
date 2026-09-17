import re

with open('/Users/vietmac/Documents/CODE/course/3congcu.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the install guide section
html = re.sub(r'\s*<!-- HOW TO INSTALL GUIDE -->.*?</section>', '', html, flags=re.DOTALL)

with open('3congcu.html', 'w', encoding='utf-8') as f:
    f.write(html)
