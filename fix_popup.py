import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# Replace the 2 window.open logic with just 1
old_logic = """setTimeout(() => {
            window.open('https://chatgpt.com/', '_blank');
            window.open('https://gemini.google.com/', '_blank');
          }, 300);"""

new_logic = """setTimeout(() => {
            window.open('https://chatgpt.com/', '_blank');
          }, 300);"""

content = content.replace(old_logic, new_logic)

with open("congthucstorytelling.html", "w") as f:
    f.write(content)

print("Fixed")
