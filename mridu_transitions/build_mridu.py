import json, os

def build():
    data_dir_k1 = "/Users/vietmac/Documents/CODE/k/mridu_transitions/data/kieu1"
    data_dir_k2 = "/Users/vietmac/Documents/CODE/k/mridu_transitions/data/kieu2"
    out_path = "/Users/vietmac/Documents/CODE/k/mridu.html"

    def get_transitions(d_dir):
        if not os.path.exists(d_dir): return []
        transitions = []
        files = sorted(os.listdir(d_dir))
        for f in files:
            if not f.endswith(".json"): continue
            with open(os.path.join(d_dir, f)) as jf:
                data = json.load(jf)
                if "transitions" in data:
                    for t in data["transitions"]:
                        t["yt_id"] = data.get("yt_id") or ""
                        t["igid"] = data.get("igid", "")
                        transitions.append(t)
        return transitions

    trans_k1 = get_transitions(data_dir_k1)
    trans_k2 = get_transitions(data_dir_k2)

    html = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mridupawan Sharma - Phân tích</title>
    <style>
        :root {
            --cl-bg: #f9fafb; --cl-surface: #ffffff;
            --cl-text: #111827; --cl-text-muted: #6b7280;
            --cl-primary: #2563eb; --cl-primary-hover: #1d4ed8;
            --cl-border: #e5e7eb; --cl-tint: #eff6ff;
            --font-sans: system-ui, -apple-system, sans-serif;
            --font-mono: ui-monospace, SFMono-Regular, monospace;
        }
        body { margin: 0; font-family: var(--font-sans); background: var(--cl-bg); color: var(--cl-text); }
        .app-container { display: flex; height: 100vh; overflow: hidden; }
        
        /* Sidebar Player */
        .video-sidebar { width: 360px; background: #000; display: flex; flex-direction: column; border-right: 1px solid var(--cl-border); z-index: 10; box-shadow: 2px 0 8px rgba(0,0,0,0.05); }
        .video-wrap { width: 100%; aspect-ratio: 9/16; background: #111; position: relative; }
        .video-wrap iframe, .video-wrap video { width: 100%; height: 100%; border: none; object-fit: contain; }
        .video-controls { padding: 16px; background: #1f2937; color: white; flex: 1; }
        .speed-row, .action-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .ctrl-btn { flex: 1; padding: 8px; background: #374151; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .ctrl-btn:hover { background: #4b5563; }
        .ctrl-btn.active { background: var(--cl-primary); }
        #shotStatusTag { font-family: var(--font-mono); font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px; }

        /* Main Content */
        .content-column { flex: 1; overflow-y: auto; padding: 40px; }
        .header-badges { margin-bottom: 16px; }
        .header-badges span { display: inline-block; padding: 4px 12px; background: var(--cl-tint); color: var(--cl-primary); font-size: 12px; font-weight: 700; border-radius: 12px; text-transform: uppercase; }
        .report-title { font-size: 32px; font-weight: 800; margin: 0 0 24px; letter-spacing: -0.02em; }
        
        .script-axis-card, .overview-card { background: var(--cl-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--cl-border); margin-bottom: 24px; }
        .script-axis-title { font-weight: 700; color: var(--cl-primary); margin-bottom: 8px; }
        
        /* Tabs */
        .tabs-header { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 2px solid var(--cl-border); padding-bottom: 12px; }
        .tab-btn { background: none; border: none; font-size: 16px; font-weight: 600; color: var(--cl-text-muted); cursor: pointer; padding: 8px 16px; border-radius: 8px; transition: all 0.2s; }
        .tab-btn:hover { background: #f3f4f6; color: var(--cl-text); }
        .tab-btn.active { background: var(--cl-primary); color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Shot Cards */
        .shot-card { display: flex; gap: 20px; background: var(--cl-surface); padding: 20px; border-radius: 12px; border: 1px solid var(--cl-border); margin-bottom: 16px; cursor: pointer; transition: all 0.2s; }
        .shot-card:hover { border-color: #93c5fd; box-shadow: 0 4px 12px rgba(37,99,235,0.05); transform: translateY(-2px); }
        .shot-card.active-playing { border-color: var(--cl-primary); background: var(--cl-tint); box-shadow: 0 0 0 2px var(--cl-primary); }
        .shot-thumb { width: 140px; height: 200px; border-radius: 8px; overflow: hidden; background: #e5e7eb; flex-shrink: 0; }
        .shot-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .shot-body { flex: 1; }
        .shot-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .shot-num { font-size: 12px; font-weight: 700; color: var(--cl-primary); background: var(--cl-surface); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--cl-border); }
        .shot-time-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 600; }
        .shot-headline { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
        .shot-insight { color: var(--cl-text-muted); margin-bottom: 12px; }
        .shot-details { background: var(--cl-tint); padding: 12px; border-radius: 8px; }
    </style>
</head>
<body>
<div class="app-container">
    <div class="video-sidebar">
        <div id="playerContainer" class="video-wrap"><div id="ytPlayer"></div></div>
        <div class="video-controls">
            <div class="speed-row">
                <button class="ctrl-btn" onclick="setSpeed(0.25)">0.25x</button>
                <button class="ctrl-btn" onclick="setSpeed(0.5)">0.5x</button>
                <button class="ctrl-btn active" onclick="setSpeed(1)">1x</button>
                <button class="ctrl-btn" onclick="setSpeed(1.5)">1.5x</button>
            </div>
            <div class="action-row">
                <button class="ctrl-btn" onclick="stepFrame(-1)">-1F</button>
                <button class="ctrl-btn" onclick="stepFrame(1)">+1F</button>
                <button class="ctrl-btn" onclick="toggleMute(this)">Âm thanh</button>
                <button class="ctrl-btn" onclick="toggleLoop(this)">Tắt Lặp đoạn</button>
            </div>
            <div id="shotStatusTag">Sẵn sàng</div>
        </div>
    </div>

    <div class="content-column">
        <h1 class="report-title">Hồ Sơ Cắt Cảnh Mượt (@mridupawasharma)</h1>
        
        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchTab('tab1', this)">Kiểu 1: Quay Người</button>
            <button class="tab-btn" onclick="switchTab('tab2', this)">Kiểu 2: Mask Lướt</button>
        </div>

        <div id="tab1" class="tab-content active">
            <div class="script-axis-card">
                <div class="script-axis-title">TRỤC: Chuẩn bị xoay → Điểm cắt giấu bằng vai/lưng → Match chuyển động</div>
                <div>Chủ thể xoay thân/đầu ở cảnh A, lợi dụng blur hoặc che khung hình để cắt sang cảnh B và tiếp tục xoay khớp với hướng đó.</div>
            </div>
"""
    
    # Generate cards for Kieu 1
    idx = 0
    for t in trans_k1:
        html += f"""
            <div class="shot-card" id="card-{idx}" onclick="playTransition('{t['yt_id']}', {t['start']}, {t['end']}, 'card-{idx}', '{t['igid']}')">
                <div class="shot-thumb">
                    <img src="mridu_transitions/{t['frames']['cut']}" alt="Cut frame" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23ccc\\'/></svg>'">
                </div>
                <div class="shot-body">
                    <div class="shot-head">
                        <span class="shot-num">KIỂU 1 • {t.get('variant', 'K1a')}</span>
                        <span class="shot-time-badge">{t['start']:.2f}s – {t['end']:.2f}s (cut @{t['cut_time']:.2f}s)</span>
                    </div>
                    <h3 class="shot-headline">{t['scene_A']} → {t['scene_B']}</h3>
                    <p class="shot-insight">Giấu vết cắt: {t.get('hide_trick', 'Motion blur')}</p>
                </div>
            </div>
"""
        idx += 1

    html += """
        </div>
        <div id="tab2" class="tab-content">
            <div class="script-axis-card">
                <div class="script-axis-title">TRỤC: Vật lướt qua ống kính → Cắt khi khuất 100% → Mở cảnh mới cùng vật cản</div>
                <div>Dùng một người, phương tiện, hoặc cái cột nhà lướt qua che kín ống kính. Ở điểm tối nhất (hoặc blur nhất), cắt sang cảnh B.</div>
            </div>
"""
    
    # Generate cards for Kieu 2
    for t in trans_k2:
        html += f"""
            <div class="shot-card" id="card-{idx}" onclick="playTransition('{t['yt_id']}', {t['start']}, {t['end']}, 'card-{idx}', '{t['igid']}')">
                <div class="shot-thumb">
                    <img src="mridu_transitions/{t['frames']['cut']}" alt="Cut frame" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23ccc\\'/></svg>'">
                </div>
                <div class="shot-body">
                    <div class="shot-head">
                        <span class="shot-num">KIỂU 2 • {t.get('variant', 'Mask')}</span>
                        <span class="shot-time-badge">{t['start']:.2f}s – {t['end']:.2f}s (cut @{t['cut_time']:.2f}s)</span>
                    </div>
                    <h3 class="shot-headline">{t['scene_A']} → {t['scene_B']}</h3>
                    <p class="shot-insight">Giấu vết cắt: {t.get('hide_trick', 'Vật cản')}</p>
                </div>
            </div>
"""
        idx += 1

    html += """
        </div>
    </div>
</div>

<script src="https://www.youtube.com/iframe_api"></script>
<script>
    var ytPlayer;
    var currentYtId = '';
    var loopStart = 0;
    var loopEnd = 0;
    var isLooping = true;
    var checkInterval = null;

    function switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
    }

    function toggleLoop(btn) {
        isLooping = !isLooping;
        btn.innerText = isLooping ? 'Tắt Lặp đoạn' : 'Bật Lặp đoạn';
    }
    
    function setSpeed(speed) {
        if(ytPlayer && ytPlayer.setPlaybackRate) {
            ytPlayer.setPlaybackRate(speed);
        }
    }

    function checkLoop() {
        if(!isLooping || !ytPlayer || !ytPlayer.getCurrentTime) return;
        var t = ytPlayer.getCurrentTime();
        if(loopEnd > 0 && t >= loopEnd) {
            ytPlayer.seekTo(loopStart, true);
        }
    }

    function playTransition(ytId, start, end, cardId, igid) {
        document.querySelectorAll('.shot-card').forEach(c => c.classList.remove('active-playing'));
        var card = document.getElementById(cardId);
        if(card) card.classList.add('active-playing');
        
        document.getElementById('shotStatusTag').innerText = cardId + ' • ' + igid + ' • ' + start.toFixed(2) + 's–' + end.toFixed(2) + 's';
        
        loopStart = start;
        loopEnd = end;
        
        if (!document.getElementById('ytPlayer')) {
            ytPlayer = null;
        }

        if (!ytId || ytId === 'None') {
            ytPlayer = null;
            var container = document.getElementById('playerContainer');
            container.innerHTML = `<video id="htmlPlayer" src="mridu_transitions/lite/${igid}.mp4" autoplay playsinline muted></video>`;
            var vid = document.getElementById('htmlPlayer');
            vid.currentTime = start; vid.play();
            if(checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => {
                if(!isLooping) return;
                if(vid.currentTime >= end) {
                    vid.currentTime = start; vid.play();
                }
            }, 100);
            return;
        }

        if(!ytPlayer) {
            var container = document.getElementById('playerContainer');
            container.innerHTML = '<div id="ytPlayer"></div>';
            ytPlayer = new YT.Player('ytPlayer', {
                videoId: ytId,
                playerVars: { 'autoplay': 1, 'mute': 1, 'start': Math.floor(start) },
                events: {
                    'onReady': function(e) {
                        currentYtId = ytId;
                        e.target.seekTo(start, true);
                        e.target.playVideo();
                        if(checkInterval) clearInterval(checkInterval);
                        checkInterval = setInterval(checkLoop, 100);
                    },
                    'onError': function(e) {
                        playTransition(null, start, end, label, igid);
                    }
                }
            });
        } else {
            if (currentYtId !== ytId) {
                currentYtId = ytId;
                ytPlayer.loadVideoById({videoId: ytId, startSeconds: start});
            } else {
                ytPlayer.seekTo(start, true);
                ytPlayer.playVideo();
            }
        }
    }
</script>
</body>
</html>
"""
    with open(out_path, "w") as f:
        f.write(html)
    print("Build complete.")

if __name__ == "__main__":
    build()
