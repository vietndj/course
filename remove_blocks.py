import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# Remove Khối 3 (sec-flow)
content = re.sub(r'<!-- KHỐI 3: 3 NHỊP VẬN HÀNH.*?<!-- KHỐI 4: LÁT CẮT KỊCH BẢN MẪU', '<!-- KHỐI 4: LÁT CẮT KỊCH BẢN MẪU', content, flags=re.DOTALL)

# Remove Khối 4 (sec-showcase)
content = re.sub(r'<!-- KHỐI 4: LÁT CẮT KỊCH BẢN MẪU.*?<!-- KHỐI FAQ -->', '<!-- KHỐI FAQ -->', content, flags=re.DOTALL)

with open("congthucstorytelling.html", "w") as f:
    f.write(content)

print("Blocks removed.")
