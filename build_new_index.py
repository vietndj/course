import re

html_content = r"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIDEO COURSE • Kho Kịch Bản & Kiến Trúc Thị Giác</title>
    <meta name="description" content="Kho lưu trữ kịch bản quay, ma trận B-roll, tư duy thị giác và bài giảng video ngắn thực chiến của anh Việt.">
    
    <!-- Google Fonts Fallbacks -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        medium: {
                            green: '#1a8917',
                            dark: '#242424'
                        }
                    },
                    fontFamily: {
                        sans: ['"FD Aeonik"', 'Inter', '-apple-system', 'sans-serif'],
                        serif: ['"Tiempos Text"', 'Lora', 'Georgia', 'serif'],
                        display: ['"FD Aeonik Extended"', '"FD Aeonik"', 'Newsreader', 'sans-serif']
                    }
                }
            }
        }
    </script>
    
    <style>
        body {
            background-color: #ffffff; /* Zebra striping base */
            color: #191919;
            -webkit-font-smoothing: antialiased;
        }

        /* Borderless and clean */
        .story-title {
            letter-spacing: -0.02em;
            line-height: 1.2;
            transition: color 0.15s ease;
        }
        .story-title:hover {
            color: #1a8917;
        }

        /* Image hover zoom */
        .img-zoom-box {
            overflow: hidden;
        }
        .img-zoom-box img {
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .img-zoom-box img {
            transform: scale(1.035);
        }

        /* Custom Scrollbar for topic tabs */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Shimmer effect for skeleton */
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        .shimmer-anim {
            position: relative;
            overflow: hidden;
        }
        .shimmer-anim::after {
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0));
            animation: shimmer 1.6s infinite;
            content: '';
        }

        /* Shake animation for incorrect passcode */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
            animation: shake 0.4s ease-in-out;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-gray-200 selection:text-black bg-white">

    <!-- ================= GATEKEEPER LOCK SCREEN ================= -->
    <div id="gatekeeper-screen" class="fixed inset-0 z-[9999] bg-[#080a0f] text-slate-100 flex flex-col justify-between items-center px-4 py-8 sm:py-12 overflow-y-auto">
        <!-- Ambient Glows -->
        <div class="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"></div>
        <div class="fixed bottom-10 right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Top Header Minimal -->
        <div class="w-full max-w-md flex items-center justify-between z-10">
            <a href="https://go.fedu.vn" class="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span>go.fedu.vn</span>
            </a>
            <span class="text-[11px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400">
                VIDEO VAULT • SECURE
            </span>
        </div>

        <!-- Center Card Box -->
        <div class="w-full max-w-md my-auto py-6 z-10">
            <div id="pin-card" class="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center space-y-6 transition-transform">
                
                <!-- Icon & Badges -->
                <div class="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 flex items-center justify-center shadow-inner">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
                    <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                </div>

                <!-- Headline -->
                <div class="space-y-1.5">
                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                        Kho Kịch Bản & Khóa Học
                    </h1>
                    <p class="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                        Khu vực dành riêng cho học viên & thành viên VIDEO.<br>Vui lòng nhập mật khẩu để mở khóa truy cập.
                    </p>
                </div>

                <!-- PIN Input Field -->
                <div class="space-y-3">
                    <div class="flex justify-center">
                        <input 
                            type="password" 
                            id="pin-input" 
                            maxlength="6" 
                            inputmode="numeric" 
                            pattern="[0-9]*" 
                            placeholder="••••"
                            autocomplete="off"
                            class="w-52 text-center text-3xl tracking-[0.5em] font-mono py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-emerald-400 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                        />
                    </div>
                    <!-- Error or Hint message -->
                    <div id="pin-feedback" class="text-xs min-h-[18px] text-slate-500 font-mono transition-colors">
                        Nhập mã 4 chữ số
                    </div>
                </div>

                <!-- Keypad -->
                <div class="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="1">1</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="2">2</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="3">3</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="4">4</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="5">5</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="6">6</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="7">7</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="8">8</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="9">9</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/30 hover:bg-rose-900/30 active:scale-95 text-xs font-medium text-slate-400 hover:text-rose-300 border border-slate-800 transition" data-key="clear">Xóa</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-base font-semibold text-white border border-slate-700/50 transition font-mono" data-key="0">0</button>
                    <button type="button" class="key-btn h-12 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 active:scale-95 text-xs font-medium text-slate-400 hover:text-white border border-slate-800 transition flex items-center justify-center" data-key="del">⌫</button>
                </div>

                <!-- Submit Button -->
                <button 
                    id="submit-unlock-btn" 
                    type="button" 
                    class="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <span>Mở Khóa Truy Cập</span>
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>

            </div>
        </div>

        <!-- Bottom Assistance -->
        <div class="w-full max-w-md text-center text-xs text-slate-500 z-10 space-y-1">
            <p>Học viên liên hệ qua Zalo / Skool hoặc nhắn trực tiếp anh Việt để nhận mã truy cập.</p>
        </div>
    </div>
    <!-- ================= END GATEKEEPER ================= -->

    <!-- ================= MAIN COURSE APP VIEW (Google News UX) ================= -->
    <div id="app-view" style="display: none;" class="min-h-screen flex flex-col flex-grow bg-[#f8fafc]"> <!-- Zebra #f8fafc base -->

        <!-- Top Announcement / Top Bar Minimal -->
        <header class="border-b border-gray-200 sticky top-0 bg-white z-50">
            <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-14 sm:h-16">
                    <!-- Logo & Brand -->
                    <div class="flex items-center space-x-3">
                        <a href="https://go.fedu.vn" class="flex items-center gap-3 group">
                            <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-lg shadow-sm">
                                F
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-display font-bold text-lg sm:text-xl text-gray-900 tracking-tight">Tiêu Điểm Thực Chiến</span>
                            </div>
                        </a>
                    </div>
                    <!-- Search & Actions -->
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="relative w-44 sm:w-64">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <input type="text" id="search-input" placeholder="Tìm kiếm..." 
                                class="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 border-none rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all font-sans">
                        </div>
                        <button id="lock-screen-btn" title="Khóa lại" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition cursor-pointer">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- 3-Column Layout Container -->
        <main class="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            <!-- Left Column: Navigation (15%) -->
            <aside class="hidden lg:block lg:w-[180px] shrink-0">
                <div class="sticky top-24 space-y-6">
                    <div>
                        <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Chuyên mục</h3>
                        <nav class="space-y-1 text-sm font-medium font-sans">
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg bg-gray-200 text-gray-900 transition-colors" data-category="all">Tất cả bài viết</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="casestudy">🏆 Case Study</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="script">📝 Kịch Bản</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="broll">🎬 B-Roll</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="science">🧠 Tâm Lý</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="storytelling">🚀 Storytelling</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="growth">💎 Landing Page</button>
                            <button class="topic-filter-btn w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" data-category="other">📌 Chuyên Đề Khác</button>
                        </nav>
                    </div>
                    <div>
                        <a href="./skills.html" class="block w-full text-left px-3 py-2 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-bold font-sans">
                            ⚡️ Kho Kỹ Năng AI
                        </a>
                    </div>
                </div>
            </aside>

            <!-- Mobile Navigation (Horizontal scroll) -->
            <div class="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-gray-200 text-sm">
                <button class="topic-filter-btn active shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-900 text-white" data-category="all">Tất cả</button>
                <button class="topic-filter-btn shrink-0 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 bg-white border border-gray-200" data-category="casestudy">🏆 Case Study</button>
                <button class="topic-filter-btn shrink-0 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 bg-white border border-gray-200" data-category="script">📝 Kịch Bản</button>
                <!-- Add others if needed -->
            </div>

            <!-- Middle Column: Main Feed (55%) -->
            <div class="flex-grow max-w-3xl bg-white p-6 sm:p-8 rounded-none sm:rounded-2xl shadow-sm border border-gray-100">
                
                <!-- Section Title -->
                <div class="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-900">
                    <h2 id="section-title" class="font-display font-bold text-2xl text-gray-900 tracking-tight">Tin Nổi Bật</h2>
                    <span id="results-count" class="text-xs text-gray-500 font-mono">0 bài</span>
                </div>

                <!-- Skeleton Loader -->
                <div id="skeleton-loader" class="space-y-8">
                    <div class="space-y-3">
                        <div class="h-48 bg-gray-100 rounded-lg shimmer-anim"></div>
                        <div class="h-6 bg-gray-200 rounded w-3/4 shimmer-anim mt-4"></div>
                        <div class="h-4 bg-gray-100 rounded w-1/4 shimmer-anim"></div>
                    </div>
                </div>

                <!-- Hero Asymmetrical Section (Injected via JS) -->
                <div id="hero-featured" class="hidden mb-10 border-b border-gray-200 pb-10">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <!-- Headline Post (Left) -->
                        <div class="md:col-span-8 flex flex-col group">
                            <a id="hero-link" href="#" target="_blank" class="block space-y-3">
                                <div class="img-zoom-box aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden mb-3">
                                    <img id="hero-img" src="" alt="" class="w-full h-full object-cover">
                                </div>
                                <h3 id="hero-title" class="story-title text-2xl sm:text-[28px] font-bold font-display text-gray-900">Tiêu đề Headline</h3>
                                <p id="hero-excerpt" class="text-sm text-gray-600 font-serif leading-relaxed line-clamp-3">Mô tả bài viết...</p>
                                <div class="text-[11px] text-gray-500 font-sans mt-2 flex items-center gap-1.5">
                                    <span id="hero-category" class="text-emerald-700 font-semibold uppercase tracking-wider">Danh mục</span>
                                    <span>•</span>
                                    <span id="hero-date">Ngày</span>
                                </div>
                            </a>
                        </div>
                        
                        <!-- Top Stories List (Right) -->
                        <div class="md:col-span-4 flex flex-col space-y-6" id="hero-side-stories">
                            <!-- Injected via JS -->
                        </div>
                    </div>
                </div>

                <!-- Main Posts Feed -->
                <div id="posts-container" class="space-y-6">
                    <!-- Rendered by JS -->
                </div>

                <!-- Empty State -->
                <div id="empty-state" class="hidden py-16 text-center">
                    <h3 class="text-lg font-bold font-display text-gray-900 mb-1">Không tìm thấy bài viết</h3>
                    <p class="text-sm text-gray-500 font-sans">Thử từ khóa khác hoặc danh mục khác.</p>
                </div>

                <!-- Load More -->
                <div id="load-more-wrapper" class="mt-10 text-center hidden">
                    <button id="load-more-btn" class="px-6 py-2 rounded-full border border-gray-300 font-medium text-xs text-gray-800 hover:border-black hover:text-black transition-all">
                        Xem thêm bài viết
                    </button>
                </div>

            </div>

            <!-- Right Column: Sidebar (25%) -->
            <aside class="hidden xl:block w-[300px] shrink-0">
                <div class="sticky top-24">
                    <h3 class="font-display font-bold text-lg text-gray-900 mb-4 pb-2 border-b border-gray-200">Đọc Nhiều Nhất</h3>
                    <div id="sidebar-posts" class="space-y-5">
                        <!-- Rendered by JS -->
                    </div>
                </div>
            </aside>
            
        </main>
    </div>

    <!-- Application Script -->
    <script>
        const AUTH_STORAGE_KEY = 'fedu_vault_auth_v1';
        const PASSCODE_PLAIN = '0070';
        const PASSCODE_HASH = '71ffe84afd528a0365d6ec95c89a64cd6979b4a15730649feddf2dc390db9e3c';

        async function sha256Hex(str) {
            try {
                const buffer = new TextEncoder().encode(str);
                const hash = await crypto.subtle.digest('SHA-256', buffer);
                return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) { return ''; }
        }

        function isUserUnlocked() {
            return localStorage.getItem(AUTH_STORAGE_KEY) === PASSCODE_HASH;
        }

        let feedInitialized = false;
        function unlockVault() {
            localStorage.setItem(AUTH_STORAGE_KEY, PASSCODE_HASH);
            const gate = document.getElementById('gatekeeper-screen');
            const app = document.getElementById('app-view');
            if (gate) gate.style.display = 'none';
            if (app) app.style.display = 'flex';
            if (!feedInitialized) {
                feedInitialized = true;
                initFeed();
            }
        }

        function lockVault() {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            window.location.reload();
        }

        async function verifyPasscode(rawPin) {
            const pin = (rawPin || '').trim();
            const pinFeedback = document.getElementById('pin-feedback');
            const pinCard = document.getElementById('pin-card');
            if (!pin) {
                if (pinFeedback) { pinFeedback.textContent = 'Vui lòng nhập mật khẩu'; pinFeedback.className = 'text-xs text-amber-400 font-mono'; }
                return;
            }
            let isCorrect = (pin === PASSCODE_PLAIN);
            if (!isCorrect) {
                const hash = await sha256Hex(pin);
                if (hash === PASSCODE_HASH) isCorrect = true;
            }
            if (isCorrect) {
                if (pinFeedback) { pinFeedback.textContent = '✅ Đang mở khóa...'; pinFeedback.className = 'text-xs text-emerald-400 font-mono font-semibold'; }
                setTimeout(() => unlockVault(), 200);
            } else {
                if (pinCard) { pinCard.classList.remove('animate-shake'); void pinCard.offsetWidth; pinCard.classList.add('animate-shake'); }
                if (pinFeedback) { pinFeedback.textContent = '❌ Sai mật khẩu'; pinFeedback.className = 'text-xs text-rose-400 font-mono font-semibold'; }
            }
        }

        // Setup Keypad Events
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.getAttribute('data-key');
                const inp = document.getElementById('pin-input');
                if(val === 'clear') { inp.value = ''; }
                else if(val === 'del') { inp.value = inp.value.slice(0, -1); }
                else if(inp.value.length < 6) { inp.value += val; }
            });
        });
        document.getElementById('submit-unlock-btn').addEventListener('click', () => {
            verifyPasscode(document.getElementById('pin-input').value);
        });
        document.getElementById('pin-input').addEventListener('keydown', (e) => {
            if(e.key === 'Enter') verifyPasscode(e.target.value);
        });
        document.getElementById('lock-screen-btn').addEventListener('click', lockVault);

        if (isUserUnlocked()) {
            unlockVault();
        } else {
            document.getElementById('pin-input').focus();
        }

        // App State
        let allPosts = [];
        let filteredPosts = [];
        let currentCategory = 'all';
        let currentSearch = '';
        let displayLimit = 15;
        const PAGE_SIZE = 15;

        const CATEGORY_MAP = {
            'casestudy': { label: 'Case Study', color: 'text-emerald-700' },
            'broll': { label: 'B-Roll', color: 'text-amber-700' },
            'script': { label: 'Kịch Bản', color: 'text-teal-700' },
            'science': { label: 'Tâm Lý', color: 'text-indigo-700' },
            'camera': { label: 'Góc Máy', color: 'text-sky-700' },
            'storytelling': { label: 'Storytelling', color: 'text-purple-700' },
            'growth': { label: 'Kinh Doanh', color: 'text-rose-700' },
            'other': { label: 'Chuyên Đề', color: 'text-gray-600' }
        };

        function formatDateVN(dateString) {
            if (!dateString) return 'Gần đây';
            try {
                const date = new Date(dateString.replace(' ', 'T'));
                if (isNaN(date.getTime())) return dateString.split(' ')[0] || 'Gần đây';
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            } catch (e) { return dateString.split(' ')[0] || 'Gần đây'; }
        }

        function removeAccents(str) {
            if (!str) return '';
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        }

        async function initFeed() {
            try {
                const res = await fetch(`./posts-manifest.json?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    allPosts = data.posts || [];
                }
            } catch (err) {}
            
            checkGitHubLiveUpdates();
            filterAndRender();
            renderSidebar();
            document.getElementById('skeleton-loader').classList.add('hidden');
        }

        async function checkGitHubLiveUpdates() {
            try {
                const apiRes = await fetch(`https://api.github.com/repos/vietndj/course/contents?t=${Date.now()}`);
                if (!apiRes.ok) return;
                const contents = await apiRes.json();
                const existingFiles = new Set(allPosts.map(p => p.filename));
                let newFound = false;
                contents.forEach(item => {
                    if (item.type === 'file' && item.name.endsWith('.html') && !['index.html', 'fix-url.html', '404.html'].includes(item.name)) {
                        if (!existingFiles.has(item.name)) {
                            const cleanName = item.name.replace('.html', '').replace(/-/g, ' ');
                            allPosts.unshift({
                                filename: item.name, title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
                                excerpt: 'Tài liệu mới.', category_key: 'other', category_label: '📌 Tài Liệu Mới',
                                cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
                                updated_at: new Date().toISOString(), read_time: '5 phút đọc', file_size_kb: Math.round(item.size/1024)
                            });
                            newFound = true;
                        }
                    }
                });
                if (newFound) { filterAndRender(); renderSidebar(); }
            } catch (e) {}
        }

        function filterAndRender() {
            const query = removeAccents(currentSearch.trim());
            filteredPosts = allPosts.filter(post => {
                const matchCat = (currentCategory === 'all' || post.category_key === currentCategory);
                if (!matchCat) return false;
                if (!query) return true;
                const textToSearch = removeAccents(`${post.title} ${post.excerpt} ${post.filename}`);
                return textToSearch.includes(query);
            });

            document.getElementById('results-count').innerText = `${filteredPosts.length} bài`;
            document.getElementById('section-title').innerText = currentCategory === 'all' ? (query ? 'Kết Quả Tìm Kiếm' : 'Tin Nổi Bật') : CATEGORY_MAP[currentCategory]?.label;

            const heroSec = document.getElementById('hero-featured');
            if (currentCategory === 'all' && !query && filteredPosts.length >= 4) {
                renderHero(filteredPosts[0], filteredPosts.slice(1, 4));
                heroSec.classList.remove('hidden');
                renderPostsList(filteredPosts.slice(4, displayLimit + 4));
            } else {
                heroSec.classList.add('hidden');
                renderPostsList(filteredPosts.slice(0, displayLimit));
            }
        }

        function renderHero(mainPost, sidePosts) {
            const postUrl = `./${encodeURIComponent(mainPost.filename)}`;
            document.getElementById('hero-title').innerText = mainPost.title;
            document.getElementById('hero-excerpt').innerText = mainPost.excerpt;
            document.getElementById('hero-date').innerText = formatDateVN(mainPost.updated_at);
            document.getElementById('hero-category').innerText = mainPost.category_label;
            document.getElementById('hero-img').src = mainPost.cover_image;
            document.getElementById('hero-link').href = postUrl;

            // Render side stories (small list)
            const sideContainer = document.getElementById('hero-side-stories');
            sideContainer.innerHTML = sidePosts.map(post => {
                const url = `./${encodeURIComponent(post.filename)}`;
                return `
                <a href="${url}" target="_blank" class="group flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div class="flex-grow space-y-1">
                        <h4 class="story-title text-[15px] font-bold font-display text-gray-900 leading-tight">${post.title}</h4>
                        <div class="text-[10px] text-gray-500 font-sans flex items-center gap-1 uppercase tracking-wider">
                            <span>${formatDateVN(post.updated_at)}</span>
                        </div>
                    </div>
                    <div class="w-16 h-16 shrink-0 img-zoom-box bg-gray-100 rounded-md overflow-hidden">
                        <img src="${post.cover_image}" alt="" class="w-full h-full object-cover">
                    </div>
                </a>
                `;
            }).join('');
        }

        function renderPostsList(posts) {
            const container = document.getElementById('posts-container');
            const emptyState = document.getElementById('empty-state');
            const loadMoreWrapper = document.getElementById('load-more-wrapper');

            if (posts.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                loadMoreWrapper.classList.add('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            
            // Borderless layout with thin lines
            container.innerHTML = posts.map(post => {
                const url = `./${encodeURIComponent(post.filename)}`;
                const catInfo = CATEGORY_MAP[post.category_key] || CATEGORY_MAP['other'];
                // Minimal meta
                return `
                <article class="group py-5 border-b border-gray-100 last:border-0">
                    <a href="${url}" target="_blank" class="flex flex-col sm:flex-row gap-5 items-start">
                        <!-- Content -->
                        <div class="flex-grow order-2 sm:order-1 space-y-2">
                            <div class="flex items-center gap-1.5 text-[11px] font-sans">
                                <span class="font-bold uppercase tracking-wider ${catInfo.color}">${post.category_label}</span>
                                <span class="text-gray-300">•</span>
                                <span class="text-gray-500">${formatDateVN(post.updated_at)}</span>
                                <span class="text-gray-300 hidden sm:inline">•</span>
                                <span class="text-gray-500 hidden sm:inline">${post.read_time}</span>
                            </div>
                            <h3 class="story-title text-xl font-bold font-display text-gray-900 leading-snug">${post.title}</h3>
                            <p class="text-sm text-gray-600 font-serif leading-relaxed line-clamp-2">${post.excerpt}</p>
                        </div>
                        <!-- Thumbnail 1:1 or 4:3 for desktop, full for mobile -->
                        <div class="w-full sm:w-32 lg:w-40 shrink-0 aspect-[16/9] sm:aspect-square img-zoom-box rounded-lg overflow-hidden bg-gray-100 order-1 sm:order-2">
                            <img src="${post.cover_image}" alt="${post.title}" loading="lazy" class="w-full h-full object-cover">
                        </div>
                    </a>
                </article>
                `;
            }).join('');

            const totalAvail = currentCategory === 'all' && !currentSearch ? filteredPosts.length - 4 : filteredPosts.length;
            if (posts.length < totalAvail) loadMoreWrapper.classList.remove('hidden');
            else loadMoreWrapper.classList.add('hidden');
        }

        // Render Sidebar (Just random 5 case studies to simulate "Đọc nhiều")
        function renderSidebar() {
            const sidebar = document.getElementById('sidebar-posts');
            const topPosts = allPosts.filter(p => p.category_key === 'casestudy').slice(0, 5);
            sidebar.innerHTML = topPosts.map((post, idx) => {
                const url = `./${encodeURIComponent(post.filename)}`;
                return `
                <a href="${url}" target="_blank" class="group flex gap-4 items-start border-b border-gray-100 py-3 last:border-0">
                    <div class="text-2xl font-display font-black text-gray-200 w-6 shrink-0">${idx + 1}</div>
                    <div class="space-y-1">
                        <h4 class="story-title text-sm font-bold font-display text-gray-900 leading-snug">${post.title}</h4>
                        <div class="text-[10px] text-gray-400 font-sans uppercase">${formatDateVN(post.updated_at)}</div>
                    </div>
                </a>
                `;
            }).join('');
        }

        // Event Listeners
        document.querySelectorAll('.topic-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.topic-filter-btn').forEach(b => {
                    b.classList.remove('bg-gray-900', 'text-white', 'bg-gray-200');
                    if (b.parentElement.tagName === 'NAV') { // Desktop sidebar
                        b.classList.add('text-gray-600');
                        b.classList.remove('bg-gray-200', 'text-gray-900');
                    } else { // Mobile scroll
                        b.classList.add('bg-white', 'text-gray-600', 'border');
                    }
                });
                
                if (btn.parentElement.tagName === 'NAV') {
                    btn.classList.add('bg-gray-200', 'text-gray-900');
                    btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
                } else {
                    btn.classList.remove('bg-white', 'text-gray-600', 'border');
                    btn.classList.add('bg-gray-900', 'text-white');
                }
                
                currentCategory = btn.getAttribute('data-category');
                displayLimit = PAGE_SIZE;
                filterAndRender();
            });
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            currentSearch = e.target.value;
            displayLimit = PAGE_SIZE;
            filterAndRender();
        });

        document.getElementById('load-more-btn').addEventListener('click', () => {
            displayLimit += PAGE_SIZE;
            filterAndRender();
        });

    </script>
</body>
</html>
