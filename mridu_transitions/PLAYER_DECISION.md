# Quyết định Player

1. **Phương án YouTube IFrame (Chính):**
   - Đã kiểm tra qua `oembed` và Playwright, các video test của @mridupawasharma (KetLXEHPVZ8, WYoeJ4tKtBM, 40kwtL0MEPU) đều trả về public và cho phép embed.
   - Thử nghiệm Playwright ở chế độ `file://` và `http://localhost:8765` đều tải được thành công.
   - Ảnh bằng chứng đã được lưu:
     - `/tmp/arc_player_file.png`
     - `/tmp/arc_player_localhost.png`
   - Repo K hiện tại chưa có cấu hình domain qua `CNAME`.

2. **Phương án `<video>` tag (Dự phòng / Fallback):**
   - Rất cần thiết cho các video không có YouTube ID (`yt_id = null`) hoặc khi YT API lỗi mạng/origin.
   - Khi đó player sẽ chuyển sang nguồn video nhẹ tại `mridu_transitions/lite/<IGID>.mp4`.
   - Nếu lỗi API YouTube > 4s, sẽ tự động chuyển fallback local video.

Quyết định: Sử dụng YouTube IFrame API làm phương án A và Local HTML5 `<video>` làm phương án B (fallback/thay thế nếu YT ID = null).
