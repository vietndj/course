# PLAYBOOK TEMPLATE CHO CÁC KIỂU CHUYỂN CẢNH

**Bài học rút ra từ quá trình làm Kiểu 1:**
- Phải dùng Playwright/trình duyệt thật để nghiệm thu video player.
- API YouTube IFrame rất dễ lỗi `150` (cấm embed), luôn phải có fallback HTML5 `<video>`.
- KHÔNG đoán bừa JSON, phải dùng `ffmpeg scene detect` và trích xuất khung ảnh thật để đối chiếu.

---

## 1. CÁCH DÙNG
Anh Việt copy khối "LỆNH DÁN SẴN" dưới đây, thay các biến `{...}` bằng nội dung thực tế (tham khảo bảng thông số), và dán vào chat.

## 2. LỆNH DÁN SẴN (Cho Kiểu Mới)

```text
/goal

Chạy quy trình phân tích tự động KIỂU 2 cho các video của @mridupawasharma.
Tên kiểu: {TEN_KIEU}
Định nghĩa: {DINH_NGHIA}
Biến thể: {BIEN_THE}
Dấu hiệu nhận diện: {DAU_HIEU_NHAN_DIEN}

Quy trình 5 bước:
1. Đọc lại `inventory.json` đã có. Lọc danh sách video nghi ngờ.
2. Dùng invoke_subagent (Model "pro", Role "Phân tích {TEN_KIEU} - <IGID>") để soi từng frame cắt. Yêu cầu:
   - Dùng ffmpeg tìm điểm cắt.
   - Trích 7 ảnh quanh điểm cắt, dùng `view_file` xem thật.
   - Lọc các đoạn thỏa mãn {DINH_NGHIA}.
   - Trích frames và ghi JSON vào `data/kieu2/<IGID>.json`.
3. Chạy `python3 build_mridu.py` (Script đã thiết kế hỗ trợ tự động gộp data/kieu*).
4. Dùng Playwright `qa_play_test.py` click thật từng card Kiểu 2 trên http://localhost:8765/mridu.html, đo player state.
5. Audit kết quả, commit và push lên nhánh.

BẮT BUỘC: KHÔNG bịa ảnh, CẤM hallucinate số liệu. Mọi lỗi phải báo nguyên văn.
```

## 3. BẢN ĐIỀN SẴN CHO KIỂU 2 (CHUYỂN CẢNH BẰNG MẶT NẠ - MASK/WIPE)

**{TEN_KIEU}**: Chuyển cảnh bằng Mặt nạ (Mask / Object-Wipe Transition)
**{DINH_NGHIA}**: Vật thể/bộ phận cơ thể (bàn tay, vai, ipad, ghế, áo, cánh cửa, chai, xe đi ngang...) che kín ống kính hoặc quét ngang khung hình làm "mặt nạ" (matte). Tại điểm che, video cắt sang cảnh B.
**{BIEN_THE}**: 
- M2a: che toàn khung (cover & reveal)
- M2b: quét ngang (wipe theo vật thể)
- M2c: lộ qua hình dạng/khe (shape reveal/window)
- M2d: mặt nạ chuyển động theo trục sâu (đi sát camera)
- M2e: mặt nạ bằng hiệu ứng/phần mềm
**{DAU_HIEU_NHAN_DIEN}**: Tỉ lệ pixel tối/đồng màu tăng đột ngột tại điểm cắt (ffmpeg signalstats / blackdetect), vật thể che ≥ 70% khung. Gợi ý từ tên file: DBDkvXPyeSN, DEcQIYAyLRq, DaXdrAVzGcc, DOA-Lk7E-Sa.

## 4. CHECKLIST CHỐNG HỜI HỢT
- [ ] Phải nhìn ảnh thật (view_file frames)
- [ ] 1 subagent = 1 video
- [ ] Khớp schema JSON 100%
- [ ] Playwright click play thật
- [ ] Fallback player nếu YT chết
- [ ] Không tự nghĩ ra timecode giả
- [ ] Không nói "đã xong" khi nghiệm thu dưới 95%
- [ ] Có ảnh `cut`/`before`/`after` dung lượng nhỏ

## 5. THAM SỐ TINH CHỈNH
- Threshold bắt cảnh: `scene>0.10` hoặc `scene>0.18`.
- Khung dò quanh cắt: `±0.6s, ±0.4s, ±0.2s, 0`.
- Padding đoạn player: `max(0, cut-0.5s)` đến `min(dur, cut+0.5s)`.
