import re

with open('/Users/vietmac/Documents/CODE/course/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Thêm body overflow-x-hidden
content = content.replace('<body class="min-h-screen flex flex-col selection:bg-gray-200 selection:text-black bg-white">',
                          '<body class="min-h-screen flex flex-col selection:bg-gray-200 selection:text-black bg-white overflow-x-hidden">')

# 2. Thêm @font-face
font_faces = """
        @font-face {
            font-family: 'FD Aeonik Extended'; text-transform: uppercase;
            src: local('FD Aeonik Extended'), local('FDAeonikExtended-Bold');
            font-weight: 700;
        }
        @font-face {
            font-family: 'FD Aeonik';
            src: local('FD Aeonik'), local('FDAeonik-Bold');
            font-weight: 600;
        }
        @font-face {
            font-family: 'Tiempos Text';
            src: local('Tiempos Text'), local('TiemposText-Regular');
            font-weight: 400;
        }
"""
content = content.replace('/* Borderless and clean */', font_faces + '\n        /* Borderless and clean */')

# 3. Sửa font-display -> font-serif cho tiêu đề bài viết dài
content = content.replace('class="story-title text-2xl sm:text-[28px] font-bold font-display text-gray-900"',
                          'class="story-title text-2xl sm:text-[28px] font-bold font-serif text-gray-900"')
content = content.replace('class="story-title text-[15px] font-bold font-display text-gray-900 leading-tight"',
                          'class="story-title text-[15px] font-bold font-serif text-gray-900 leading-tight"')
content = content.replace('class="story-title text-[20px] font-bold font-display text-gray-900 leading-snug"',
                          'class="story-title text-[20px] font-bold font-serif text-gray-900 leading-snug"')
content = content.replace('class="story-title text-sm font-bold font-display text-gray-900 leading-snug"',
                          'class="story-title text-sm font-bold font-serif text-gray-900 leading-snug"')

# 4. Sửa Header overflow
header_old = """                <div class="flex items-center justify-between h-14 sm:h-16">
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
                        <div class="relative w-44 sm:w-64">"""

header_new = """                <div class="flex items-center justify-between h-14 sm:h-16">
                    <!-- Logo & Brand -->
                    <div class="flex items-center space-x-3 min-w-0">
                        <a href="https://go.fedu.vn" class="flex items-center gap-3 group min-w-0">
                            <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-display font-black text-lg shadow-sm shrink-0">
                                F
                            </div>
                            <div class="flex items-center gap-2 truncate min-w-0">
                                <span class="font-display font-bold text-lg sm:text-xl text-gray-900 tracking-tight truncate uppercase">TIÊU ĐIỂM</span>
                            </div>
                        </a>
                    </div>
                    <!-- Search & Actions -->
                    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div class="relative w-32 sm:w-64">"""

content = content.replace(header_old, header_new)

# 5. Fix Zebra Striping (Thay border-b bằng even/odd bg)
# Main container in JS
content = content.replace('<article class="group py-6 border-b border-gray-100 last:border-0 first:pt-0">',
                          '<article class="group py-6 px-4 -mx-4 sm:mx-0 sm:px-6 sm:rounded-xl even:bg-[#ffffff] odd:bg-[#f8fafc] last:border-0">')

with open('/Users/vietmac/Documents/CODE/course/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

