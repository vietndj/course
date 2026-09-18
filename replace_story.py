with open("storytelling.html", "r") as f:
    lines = f.readlines()
    start_idx = -1
    for i, line in enumerate(lines):
        if "Lòng tin con người không đến từ kịch bản làm màu" in line:
            start_idx = i
            break

if start_idx != -1:
    # Find the end of Hộp 2
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if "<!-- Hộp 2: Tín hiệu đắt giá -->" in lines[i]:
            # find the closing div of this box
            # It has <div style="font-size: ...
            # Then </div>
            # Then </div>
            for j in range(i+1, len(lines)):
                if "từng trả giá thật ngoài hiện trường" in lines[j]:
                    end_idx = j + 3
                    break
            break
            
    if end_idx != -1:
        new_html = """            <p style="font-size: 15.5px; line-height: 1.75; color: var(--cl-text-body); margin-bottom: 20px;">
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
            </div>\n"""
        
        # start_idx-1 is the <p> tag
        lines = lines[:start_idx-1] + [new_html] + lines[end_idx:]
        
        with open("storytelling.html", "w") as f:
            f.writelines(lines)
        print("Replaced!")
    else:
        print("End index not found")
else:
    print("Start not found")
