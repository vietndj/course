import re

with open("congthucstorytelling.html", "r") as f:
    content = f.read()

# 1. Fix Dead Link
content = content.replace('<a href="#sec-showcase" class="top-nav__navlink">Xem Mẫu Kịch Bản ↓</a>', '<a href="#sec-faq" class="top-nav__navlink">Hỏi Đáp Thực Chiến ↓</a>')

# 2. Fix Persona Mismatch in HTML
content = content.replace('Lý do AI kể chuyện sâu sắc', 'Lý do Miss Storytelling kể chuyện sâu sắc')

# Fix Persona in Mega Prompt
content = content.replace('AI lấy tiếp 3 phản xạ tiếp theo', 'bạn lấy tiếp 3 phản xạ tiếp theo')

# 3. Add Micro-copy under Copy button
micro_copy = '''<div style="font-family: var(--font-body); font-size: 14px; color: var(--cl-text-muted); margin-top: 16px;">
          <i>* Mẹo: Dán câu lệnh vào AI và bắt đầu bằng cách gõ 1 hành động vật lý (Ví dụ: Úp mặt điện thoại xuống bàn).</i>
        </div>'''
content = content.replace('</a>\n      </div>\n    </section>\n\n    <!-- KHỐI 2', micro_copy + '\n      </div>\n    </section>\n\n    <!-- KHỐI 2')
# Actually, let's use regex to safely insert it after the button wrapper
content = re.sub(r'(<a href="javascript:void\(0\)" class="btn-copy-hero".*?</a>)', r'\1\n        ' + micro_copy, content, flags=re.DOTALL)

# 4. Implement JS Accordion for FAQ
faq_html_new = """
    <!-- KHỐI FAQ -->
    <section class="cl-zebra-section cl-zebra--light" id="sec-faq">
      <div class="cl-sec-container">
        <div class="cl-badge">05 / GIẢI ĐÁP THỰC CHIẾN</div>
        <h2 class="title-short">HỎI ĐÁP: CÂU CHUYỆN SÂU SẮC & LƯỢT XEM</h2>
        
        <style>
          .faq-item {
            border: 1px solid var(--cl-line);
            margin-bottom: 12px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .faq-question {
            padding: 20px;
            font-family: var(--font-display-long);
            font-size: 18px;
            font-weight: 600;
            color: var(--cl-text-base);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
          }
          .faq-icon {
            font-size: 24px;
            font-weight: 300;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.35, 1.05);
          }
          .faq-answer-wrapper {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s cubic-bezier(0.25, 1, 0.35, 1.05);
            background: #f8fafc;
          }
          .faq-answer {
            padding: 0 20px 24px 20px;
            font-family: 'Tiempos Text', serif;
            font-size: 16.5px;
            line-height: 1.82;
            color: var(--cl-text-body);
            border-left: 3px solid var(--cl-accent);
            margin-left: 20px;
            margin-bottom: 24px;
          }
          .faq-item.active {
            border-color: var(--cl-accent);
          }
          .faq-item.active .faq-icon {
            transform: rotate(45deg);
            color: var(--cl-accent);
          }
        </style>

        <div class="faq-container" style="margin-top: 32px;">
          
          <div class="faq-item">
            <div class="faq-question">Kênh mới chưa có view thì có nên chia sẻ quá sâu không?<span class="faq-icon">+</span></div>
            <div class="faq-answer-wrapper">
              <div class="faq-answer">
                <b>Không cần chờ có view mới làm. Phải làm ngay từ kênh 0 follow.</b><br><br>
                Độ sâu chính là phễu lọc tệp khách hàng ngay từ đầu. Nếu lúc đầu bạn làm nội dung hời hợt bề nổi để câu view, kênh sẽ toàn người thích giải trí, không chịu chi. Khi quay sang bán hàng, họ sẽ bỏ đi hết. Dùng nội dung sâu sắc ngay từ đầu là bộ lọc ra tệp khách trưởng thành, có tiền. Họ từng trải, nghe trúng "tim đen" là nảy sinh niềm tin hữu cơ (Organic Trust) và quẹt thẻ mua ngay không cần dụ dỗ.
              </div>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question">Cuộc sống tẻ nhạt, không có biến cố thì lấy ý tưởng ở đâu?<span class="faq-icon">+</span></div>
            <div class="faq-answer-wrapper">
              <div class="faq-answer">
                <b>Chiều sâu nằm ở việc vặt vãnh, bạn sẽ không bao giờ cạn ý tưởng.</b><br><br>
                Sự sâu sắc này không đòi hỏi bạn rặn ra triết lý hàn lâm đao to búa lớn. Nó nằm ở chính những thao tác vật lý nhỏ nhất: tiếng thở dài lúc nhắn tin, cái úp mặt điện thoại mệt mỏi, hay ánh mắt khựng lại trên bàn ăn. Cứ thấy "cấn cấn", "chạnh lòng" lúc làm nghề là có ngay một kịch bản chất lượng mà không cần phải diễn drama.
              </div>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question">Chia sẻ tâm lý nặng nề liên tục có làm người xem bị ngợp?<span class="faq-icon">+</span></div>
            <div class="faq-answer-wrapper">
              <div class="faq-answer">
                <b>Cần chiến thuật đan xen nhịp thở cho kênh.</b><br><br>
                Để người xem không bị ngợp, hãy đan xen nhịp thở: 1 video bóc trần sự thật (Deep) đi kèm với 2-3 video ghi lại công việc nhẹ nhàng, thao tác nghề bình thường (Light). Sự chân thành mộc mạc không cần đợi đủ view mới dám sống thật.
              </div>
            </div>
          </div>

        </div>

        <script>
          document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
              const item = question.parentElement;
              const wrapper = item.querySelector('.faq-answer-wrapper');
              
              // Close others
              document.querySelectorAll('.faq-item').forEach(otherItem => {
                if(otherItem !== item) {
                  otherItem.classList.remove('active');
                  otherItem.querySelector('.faq-answer-wrapper').style.maxHeight = null;
                }
              });

              // Toggle current
              if (item.classList.contains('active')) {
                item.classList.remove('active');
                wrapper.style.maxHeight = null;
              } else {
                item.classList.add('active');
                wrapper.style.maxHeight = wrapper.scrollHeight + "px";
              }
            });
          });
        </script>

      </div>
    </section>
"""

# Replace old FAQ block with new FAQ HTML
content = re.sub(r'<!-- KHỐI FAQ -->.*?<!-- Footer -->', faq_html_new + '\n    <!-- Footer -->', content, flags=re.DOTALL)

with open("congthucstorytelling.html", "w") as f:
    f.write(content)

print("HTML fixed successfully.")
