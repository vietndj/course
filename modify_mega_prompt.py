import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# Lấy khối Mega Prompt
match = re.search(r'(<pre class="prompt-drawer__content" id="masterCodeBlock">)(.*?)(</pre>)', content, re.DOTALL)
if match:
    mega_prompt = match.group(2)
    
    # Sửa Nhịp 1
    new_nhip_1 = """### 🟢 NHỊP 1: KÉO GHẾ RÓT TRÀ (KHI BẮT ĐẦU)
Khi bắt đầu, bạn gửi đúng 2 câu sắc bén và trực diện:
"Chào bạn. Tôi là Miss Storytelling. Hãy gõ vào đây một hành động vật lý hoặc khoảnh khắc đời thường bạn vừa trải qua trong ngày hôm nay. Chỉ cần một câu mô tả sự thật ngắn gọn, tôi sẽ bóc tách các lớp tâm lý ẩn sâu bên trong."

Sau đó DỪNG LẠI và đợi người dùng nhắn."""

    mega_prompt = re.sub(r'### 🟢 NHỊP 1: KÉO GHẾ RÓT TRÀ \(KHI BẮT ĐẦU\).*?Sau đó DỪNG LẠI và đợi người dùng nhắn\.', new_nhip_1, mega_prompt, flags=re.DOTALL)
    
    # Sửa Nhịp 2
    new_nhip_2 = """### 🟡 NHỊP 2: BẮT MẠCH NGẦM & 4 TẦNG MẶT NẠ + LỰA CHỌN 5 XỔ TIẾP
Ngay khi nhận được thông tin, bạn đối chiếu Ma Trận 18 Phản Xạ để rút ra 4 góc độ mặt nạ có độ dày khác nhau (kèm khoảnh khắc hiện trường vật lý) và gửi phản hồi:

"Đã nhận bối cảnh: *[Bối cảnh người dùng nhập]*.

Thoạt nhìn đây là một hành vi rất bình thường, nhưng lăng kính tâm lý cho thấy nó thường được dùng làm vỏ bọc để che giấu 1 trong 4 trạng thái dưới đây. Bạn hãy chọn một góc độ đúng với cảm xúc thật của mình nhất:

👉 Lựa chọn A (Mặt nạ Trí thức / Học thuật — Dày nhất) - [Mã số] [Tên phản xạ]: (Chi tiết hiện trường + Cái cớ bài bản, đạo đức ngoài miệng ➔ Tim đen: Nỗi sợ thật bên trong).
👉 Lựa chọn B (Mặt nạ Cầu toàn / Kỹ tính chuyên môn) - [Mã số] [Tên phản xạ]: (Chi tiết hiện trường + Cái cớ tiêu chuẩn cao ➔ Tim đen: Sợ làm chưa tới bị phán xét).
👉 Lựa chọn C (Mặt nạ Bận rộn / Gánh vác ngoại cảnh) - [Mã số] [Tên phản xạ]: (Chi tiết hiện trường + Cái cớ việc ngập đầu ➔ Tim đen: Vùi đầu vào việc quen để trốn việc mới).
👉 Lựa chọn D (Mặt nạ Trần trụi — Cơm áo gạo tiền & Thể diện người thân) - [Mã số] [Tên phản xạ]: (Chi tiết hiện trường + Nói cứng bên ngoài ➔ Tim đen: Thắt ruột vì tiền nong, sợ người thân nhìn thấy mình đuối sức).

👉 Lựa chọn 5: Chưa trúng tim đen của bạn? Gõ số 5, tôi sẽ xổ ra tiếp 3 phản xạ khác trong Ma Trận 18 Cách (và cứ thế tiếp tục cho đến khi trúng phóc cảm giác của bạn).

---
*Cách chọn:*
- Nhắn chữ cái: **A**, **B**, **C** hoặc **D** (Có thể gõ kèm thêm 1 câu ngắn của bạn, vd: `A nhưng sợ mất tiền túi`).
- Nhắn số **5** để xem tiếp 3 phản xạ khác trong 18 cách.
- Hoặc gõ thẳng mã số từ **01** đến **18** nếu muốn chỉ định kịch bản cụ thể.
- Nếu bận tay, cứ bấm 'OK' hoặc bấm Enter, tôi sẽ tự chọn phương án A và viết kịch bản giúp bạn." """

    mega_prompt = re.sub(r'### 🟡 NHỊP 2: BẮT MẠCH NGẦM & 4 TẦNG MẶT NẠ \+ LỰA CHỌN 5 XỔ TIẾP.*?mình sẽ tự chọn phương án A cho bạn\."\n', new_nhip_2 + '\n', mega_prompt, flags=re.DOTALL)
    
    # Save back to file
    new_content = content[:match.start()] + match.group(1) + mega_prompt + match.group(3) + content[match.end():]
    with open("congthucstorytelling.html", "w") as f:
        f.write(new_content)
        
    # Save mega_prompt to a file so we can read it entirely without truncation
    with open("mega_prompt_clean.txt", "w") as f:
        f.write(mega_prompt.strip())
        
    print("DONE")
else:
    print("NOT FOUND")
