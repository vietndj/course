import re

with open("storytelling.html", "r") as f:
    content = f.read()

# Define the old block regex
pattern = re.compile(
    r'<p class="cl-body-text" style="font-weight: 500; color: var\(--cl-text-strong\); margin-bottom: 24px;">\s*Lòng tin con người không đến từ kịch bản làm màu hay lời xưng danh uy tín. Nó vận hành chặt chẽ theo <b>2 quy luật khoa học tự nhiên</b>:\s*</p>\s*<!-- Hộp 1: Nguyên lý chẩn đoán -->\s*<div style="background: var\(--cl-tint\); border: 1px solid var\(--cl-line-strong\); border-left: 4px solid var\(--cl-accent\); border-radius: var\(--cl-radius-sm\); padding: 16px 18px; margin-bottom: 14px;">\s*<div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">\s*<span style="font-family: var\(--font-mono\); font-size: 11\.5px; font-weight: 800; color: var\(--cl-accent\); text-transform: uppercase;">\s*1\. NGUYÊN LÝ CHẨN ĐOÁN\s*</span>\s*<a href="storytelling-khoa-hoc\.html#sec-khoa-hoc"[^>]*>.*?</a>\s*</div>\s*<div style="font-size: 14\.5px; line-height: 1\.6; color: var\(--cl-text-base\);">\s*<b>Chỉ đúng chỗ hỏng &rarr; não người tự tin mình biết sửa\.</b> Kẻ nào gọi trúng cơ chế hỏng hóc mà người khác đang giấu, người nghe tự khắc tin kẻ đó có thuốc chữa\.\s*</div>\s*</div>\s*<!-- Hộp 2: Tín hiệu đắt giá -->\s*<div style="background: var\(--cl-tint\); border: 1px solid var\(--cl-line-strong\); border-left: 4px solid var\(--cl-emerald\); border-radius: var\(--cl-radius-sm\); padding: 16px 18px; margin-bottom: 20px;">\s*<div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">\s*<span style="font-family: var\(--font-mono\); font-size: 11\.5px; font-weight: 800; color: var\(--cl-emerald\); text-transform: uppercase;">\s*2\. TÍN HIỆU ĐẮT GIÁ\s*</span>\s*<a href="storytelling-khoa-hoc\.html#sec-khoa-hoc"[^>]*>.*?</a>\s*</div>\s*<div style="font-size: 14\.5px; line-height: 1\.6; color: var\(--cl-text-base\);">\s*<b>Phải là việc thật &rarr; không thể làm giả hay dùng AI\.</b> Tự xưng uy tín là lời nói rẻ tiền\. Não người chỉ tin chi tiết thực tế của người từng va vấp, từng đền tiền, từng trả giá thật ngoài hiện trường\.\s*</div>\s*</div>',
    re.DOTALL
)

new_html = """<p class="cl-body-text" style="font-weight: 500; color: var(--cl-text-strong); margin-bottom: 24px;">
              Lòng tin của con người không hình thành từ các kịch bản tô vẽ hay danh xưng tự phong. Nó vận hành chặt chẽ dựa trên <b>hai cơ chế tâm lý học cốt lõi</b>:
            </p>

            <!-- Hộp 1: Nguyên lý chẩn đoán -->
            <div style="background: var(--cl-tint); border: 1px solid var(--cl-line-strong); border-left: 4px solid var(--cl-accent); border-radius: var(--cl-radius-sm); padding: 16px 18px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
                <span style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 800; color: var(--cl-accent); text-transform: uppercase;">
                  1. NGUYÊN LÝ CHẨN ĐOÁN VI MÔ
                </span>
              </div>
              <div style="font-size: 14.5px; line-height: 1.6; color: var(--cl-text-base);">
                Giới nghiên cứu tâm lý học hành vi đã đúc kết một tiên đề: <i>"Nếu bạn có thể mô tả vấn đề của người khác ở cấp độ vi mô chính xác hơn chính họ, họ sẽ mặc định tin rằng bạn đang nắm trong tay thuốc giải."</i> Khả năng gọi tên chính xác căn bệnh chính là công tắc tự động kích hoạt niềm tin.
              </div>
            </div>

            <!-- Hộp 2: Tín hiệu đắt giá -->
            <div style="background: var(--cl-tint); border: 1px solid var(--cl-line-strong); border-left: 4px solid var(--cl-emerald); border-radius: var(--cl-radius-sm); padding: 16px 18px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
                <span style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 800; color: var(--cl-emerald); text-transform: uppercase;">
                  2. NÚT THẮT CỦA SỰ THẬT
                </span>
              </div>
              <div style="font-size: 14.5px; line-height: 1.6; color: var(--cl-text-base);">
                Và để có thể mô tả được vấn đề sâu sắc hơn chính người ta, bạn bắt buộc phải trực tiếp trải qua nó &mdash; đó chính là điểm nút thắt cốt lõi của định dạng này. Tức là: Muốn có lòng tin, bạn phải thật. Mọi đạo lý đều có thể sao chép, nhưng trải nghiệm vi mô là màng lọc thực chứng không thể làm giả.
              </div>
            </div>"""

if pattern.search(content):
    content = pattern.sub(new_html, content)
    with open("storytelling.html", "w") as f:
        f.write(content)
    print("Replace successful!")
else:
    print("Pattern not found!")
