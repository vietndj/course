import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# 1. Update Title & Top Nav
content = re.sub(r'<title>BÓC TÁCH TÂM LÝ ĐỜI THƯỜNG & KỊCH BẢN VIDEO • MASTER ENGINE</title>', '<title>CÔNG THỨC STORYTELLING ĐỜI THƯỜNG • MASTER ENGINE</title>', content)
content = re.sub(r'<span class="top-nav__title">BÓC TÁCH TÂM LÝ & KỊCH BẢN</span>', '<span class="top-nav__title">CÔNG THỨC STORYTELLING</span>', content)

# 2. Update Hero Section
content = re.sub(r'<h1 class="title-short">BÓC TÁCH TÂM LÝ ĐỜI THƯỜNG & KỊCH BẢN THỰC CHIẾN</h1>', '<h1 class="title-short">CÔNG THỨC STORYTELLING:<br>BIẾN ĐỜI THƯỜNG THÀNH CHUYỆN ĐẮT GIÁ</h1>', content)
content = re.sub(r'Biến 1 việc nhỏ đời thường thành bảng bóc tách sâu sắc và bộ kịch bản hoàn chỉnh tự quay tại bàn trong 60 giây\.', 'Biến một hành động vặt vãnh mỗi ngày thành một câu chuyện chạm đáy tâm lý và bộ kịch bản video hoàn chỉnh tự quay tại bàn chỉ trong 60 giây.', content)
content = re.sub(r'<span class="btn-copy-hero__title" id="copyText">SAO CHÉP CÂU LỆNH \(MEGAPROMPT\)</span>', '<span class="btn-copy-hero__title" id="copyText">SAO CHÉP CÂU LỆNH STORYTELLING (MEGAPROMPT)</span>', content)

# 3. Update Formulas Section
content = re.sub(r'<h2 class="title-short">BỘ CÔNG THỨC TOÁN HỌC TÂM LÝ</h2>', '<h2 class="title-short">BỘ CÔNG THỨC STORYTELLING 4 TẦNG NHẬN THỨC</h2>', content)
content = re.sub(r'Lý do AI suy luận sâu sắc và không đoán mò là nhờ bộ 4 công thức toán học tâm lý được cài sẵn vào nhân suy luận ngầm:', 'Lý do AI kể chuyện sâu sắc và không đoán mò là nhờ bộ 4 công thức storytelling được cài sẵn vào nhân suy luận ngầm:', content)

# 4. Update Flow Section
content = re.sub(r'<h2 class="title-short">3 NHỊP VẬN HÀNH THỰC TẾ</h2>', '<h2 class="title-short">3 NHỊP KỂ CHUYỆN THỰC TẾ</h2>', content)

# 5. Update Showcase Section
content = re.sub(r'<h2 class="title-short">LÁT CẮT ĐỜI THỰC ĐÃ CHẠY THỬ</h2>', '<h2 class="title-short">LÁT CẮT STORYTELLING ĐÃ CHẠY THỬ</h2>', content)
content = re.sub(r'Chạm vào từng ví dụ để xem cỗ máy chuyển hóa hành động thành kịch bản hoàn chỉnh:', 'Chạm vào từng ví dụ để xem cỗ máy chuyển hóa một sự việc tẻ nhạt thành câu chuyện ép tim khách hàng:', content)

# 6. Add FAQ Section right before the Footer
faq_html = """
    <!-- KHỐI FAQ -->
    <section class="cl-zebra-section cl-zebra--light" id="sec-faq">
      <div class="cl-sec-container">
        <div class="cl-badge">05 / GIẢI ĐÁP THỰC CHIẾN</div>
        <h2 class="title-short">HỎI ĐÁP: CÂU CHUYỆN SÂU SẮC & LƯỢT XEM</h2>
        <div class="script-box-full" style="background: #ffffff; color: var(--cl-text-body); border: 1px solid var(--cl-line); margin-top: 24px;">
          <h3 style="font-family: var(--font-display-long); font-size: 18px; color: var(--cl-text-base); margin-bottom: 12px;">Hỏi: Kịch bản này tương đối sâu. Kênh mới chưa có view thì có nên làm luôn không hay đợi kênh lớn rồi mới chia sẻ? Và làm sâu thế này có bị cạn ý tưởng không?</h3>
          <p style="font-family: var(--font-body); font-size: 16px; margin-bottom: 16px;"><b>Đáp:</b> Bạn không cần chờ có view mới làm. Phải làm ngay từ kênh 0 follow. Cứ có ý tưởng từ bất kỳ lát cắt đời thường nào là bấm máy luôn. Dưới đây là bản chất cốt lõi:</p>
          
          <div style="margin-bottom: 16px;">
            <b style="color: var(--cl-text-base);">1. Độ sâu chính là phễu lọc tệp khách hàng ngay từ đầu:</b><br>
            Nếu lúc đầu bạn làm nội dung hời hợt bề nổi để câu view, kênh sẽ toàn người thích giải trí, không chịu chi. Khi quay sang bán hàng, họ sẽ bỏ đi hết. Dùng nội dung sâu sắc ngay từ đầu là bộ lọc ra tệp khách trưởng thành, có tiền. Họ từng trải, nghe trúng "tim đen" là nảy sinh niềm tin hữu cơ và quẹt thẻ mua ngay không cần dụ dỗ.
          </div>
          
          <div style="margin-bottom: 16px;">
            <b style="color: var(--cl-text-base);">2. Chiều sâu nằm ở việc vặt vãnh, không bao giờ cạn ý tưởng:</b><br>
            Hoàn toàn làm nhiều được. Sự sâu sắc này không đòi hỏi bạn rặn ra triết lý hàn lâm đao to búa lớn. Nó nằm ở chính những thao tác vật lý nhỏ nhất: tiếng thở dài lúc nhắn tin, cái úp mặt điện thoại mệt mỏi, hay ánh mắt khựng lại trên bàn ăn. Cứ thấy "cấn cấn", "chạnh lòng" lúc làm nghề là có ngay một kịch bản chất lượng.
          </div>
          
          <div>
            <b style="color: var(--cl-text-base);">3. Chiến thuật đan xen nhịp thở:</b><br>
            Để người xem không bị ngợp, hãy đan xen nhịp thở cho kênh: 1 video bóc trần sự thật (Deep) đi kèm với 2-3 video ghi lại công việc nhẹ nhàng, thao tác nghề bình thường (Light). Sự chân thành mộc mạc không cần đợi đủ view mới dám sống thật.
          </div>
        </div>
      </div>
    </section>
"""

content = content.replace('<!-- Footer -->', faq_html + '\n    <!-- Footer -->')

with open("congthucstorytelling.html", "w") as f:
    f.write(content)

print("HTML content updated successfully.")
