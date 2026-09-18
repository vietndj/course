import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# 1. Hide launcher-row and prompt-drawer
content = content.replace('<div class="launcher-row">', '<div class="launcher-row" style="display: none;">')
content = content.replace('<div class="prompt-drawer" id="promptDrawer">', '<div class="prompt-drawer" id="promptDrawer" style="display: none;">')

# 2. Change innerText to textContent in copyMasterPrompt
content = content.replace("document.getElementById('masterCodeBlock').innerText;", "document.getElementById('masterCodeBlock').textContent;")

# 3. Add window.open logic inside copyMasterPrompt
# We insert it right after showToast is called.
new_copy_logic = """navigator.clipboard.writeText(codeText).then(() => {
          showToast();
          setTimeout(() => {
            window.open('https://chatgpt.com/', '_blank');
            window.open('https://gemini.google.com/', '_blank');
          }, 300);
        }).catch"""

content = content.replace("navigator.clipboard.writeText(codeText).then(showToast).catch", new_copy_logic)

# Do the same for fallbackCopy
new_fallback_logic = """document.execCommand('copy');
        showToast();
        setTimeout(() => {
          window.open('https://chatgpt.com/', '_blank');
          window.open('https://gemini.google.com/', '_blank');
        }, 300);"""

content = content.replace("document.execCommand('copy');\n        showToast();", new_fallback_logic)

with open("congthucstorytelling.html", "w") as f:
    f.write(content)

print("Modification done.")
