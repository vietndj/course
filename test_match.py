with open("storytelling.html", "r") as f:
    lines = f.readlines()
    start_idx = -1
    for i, line in enumerate(lines):
        if "Lòng tin con người không đến từ kịch bản làm màu" in line:
            start_idx = i
            break
    if start_idx != -1:
        print("".join(lines[start_idx-2:start_idx+35]))
