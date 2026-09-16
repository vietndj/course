#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tự động quét toàn bộ kho bài giảng HTML trong repo 'course'
và xuất ra 'posts-manifest.json' phục vụ hiển thị trên trang chủ fedu.vn/course/
"""

import os
import glob
import re
import json
import subprocess
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

COURSE_DIR = Path("/Users/vietmac/Documents/CODE/course")
BAI_GIANG_DIR = Path("/Users/vietmac/Documents/CODE/BAI GIANG VIDEO")
OUTPUT_MANIFEST = COURSE_DIR / "posts-manifest.json"

CURATED_COVERS = {
    'casestudy': [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80'
    ],
    'broll': [
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1200&auto=format&fit=crop&q=80'
    ],
    'script': [
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80'
    ],
    'science': [
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80'
    ],
    'camera': [
        'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80'
    ],
    'storytelling': [
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&auto=format&fit=crop&q=80'
    ],
    'growth': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80'
    ],
    'other': [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80'
    ]
}

def sync_folders():
    """Tự động đồng bộ các file HTML mới giữa BAI GIANG VIDEO và course"""
    if not BAI_GIANG_DIR.exists() or not COURSE_DIR.exists():
        return
    import shutil
    # Copy missing files from BAI GIANG VIDEO to course
    for f in BAI_GIANG_DIR.glob("*.html"):
        dest = COURSE_DIR / f.name
        if not dest.exists():
            shutil.copy2(f, dest)
            print(f"📋 Đã đồng bộ sang course: {f.name}")
        elif f.stat().st_mtime > dest.stat().st_mtime:
            shutil.copy2(f, dest)
            print(f"🔄 Đã cập nhật sang course: {f.name}")

def get_file_time(filename):
    """Lấy thời gian cập nhật chính xác (ưu tiên mtime nếu file mới sửa gần đây)"""
    file_path = COURSE_DIR / filename
    mtime = file_path.stat().st_mtime if file_path.exists() else 0
    mtime_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S +0700')
    
    try:
        res = subprocess.run(['git', 'log', '-1', '--format=%ci|%s', '--', filename], cwd=COURSE_DIR, stdout=subprocess.PIPE, text=True)
        out = res.stdout.strip()
        if out:
            date_str, msg = out.split('|', 1)
            # Kiểm tra nếu file có thay đổi unstaged thì lấy mtime
            status_res = subprocess.run(['git', 'status', '--porcelain', '--', filename], cwd=COURSE_DIR, stdout=subprocess.PIPE, text=True)
            if status_res.stdout.strip():
                return mtime_str, 'Vừa cập nhật'
            return date_str, msg
    except Exception:
        pass
        
    return mtime_str, 'Local file'

def clean_title(title_raw, filename):
    if not title_raw:
        title_raw = filename.replace('.html', '').replace('-', ' ')
    # Clean noise and generic suffixes
    title = re.sub(r'\s*\|\s*.*$', '', title_raw)
    title = re.sub(r' - Khóa Học.*$', '', title)
    title = re.sub(r' - The Ultimate Guide.*$', '', title)
    title = re.sub(r'^[ổỗô]\s*Tay', 'Sổ Tay', title)
    title = title.strip()
    return title if len(title) > 3 else filename.replace('.html', '').replace('-', ' ').title()

def categorize(filename, title, text_content):
    lower = (filename + ' ' + title + ' ' + text_content[:5000]).lower()
    
    # 1. Case Study thực chiến học viên
    if ('case' in lower or 'học viên' in lower or '7 màn' in lower or '7-man' in lower) and any(k in lower for k in ['chị hằng', 'hangbds', 'trang trương', 'trangtruong', 'đào trung nghĩa', 'daotrungnghia', 'quỳnh anh', 'quynhanhbep', 'linh dulin', 'linhdulin', 'hữu việt', 'huuviet', 'kiên phân bón', 'kienpb', 'chị kat', 'katbanh', 'bất động sản', 'tiệm bánh', 'dạy nghề', 'đồ bếp', 'tóc', 'salon', 'offline 3', 'offline 2', 'offline']):
        return 'casestudy', '🏆 Case Study Thực Chiến'
    elif 'broll' in lower or 'b-roll' in lower or 'cảnh trám' in lower:
        return 'broll', '🎬 B-Roll & Cảnh Trám'
    elif 'kich-ban' in lower or 'kịch bản' in lower or 'script' in lower or 'bat-dau' in lower or 'thu-vo-van' in lower:
        return 'script', '📝 Kịch Bản Thực Chiến'
    elif 'tam-ly' in lower or 'than-kinh' in lower or 'cang-thang' in lower or 'science' in lower or 'não bộ' in lower or 'dopamine' in lower or 'con kiến' in lower:
        return 'science', '🧠 Tâm Lý & Não Bộ'
    elif 'chuyen-canh' in lower or 'camera-motion' in lower or 'co-canh' in lower or 'goc-may' in lower or 'match-cut' in lower or 'loop' in lower:
        return 'camera', '🎥 Góc Máy & Chuyển Cảnh'
    elif 'storytelling' in lower or 'influencer' in lower or 'de-che' in lower or 'xay-kenh' in lower:
        return 'storytelling', '🚀 Xây Kênh & Story'
    elif 'landing' in lower or 'up-sale' in lower or 'niche' in lower:
        return 'growth', '💎 Landing & Kinh Doanh'
    return 'other', '📌 Tài Liệu Chuyên Đề'

def build_manifest():
    sync_folders()
    files = glob.glob(os.path.join(COURSE_DIR, '*.html'))
    posts = []

    for idx, f in enumerate(sorted(files)):
        name = os.path.basename(f)
        if name in ['index.html', 'fix-url.html', '404.html']:
            continue
        
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
        except Exception:
            continue

        soup = BeautifulSoup(content, 'html.parser')
        
        raw_title = soup.title.string if soup.title else (soup.h1.get_text(strip=True) if soup.h1 else '')
        title = clean_title(raw_title, name)
        
        # Extract full plain text for accurate categorization
        text_content = soup.get_text(separator=' ', strip=True)
        
        # Extract excerpt
        p_tags = soup.find_all('p')
        excerpt = ''
        for p in p_tags:
            text = p.get_text(strip=True)
            if len(text) > 35 and not text.startswith('http') and not text.startswith('<'):
                excerpt = text
                break
        if not excerpt:
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                excerpt = meta_desc['content'].strip()
            else:
                excerpt = 'Tài liệu hướng dẫn chuyên sâu về kỹ thuật quay dựng, xây dựng tư duy thị giác và kịch bản thực chiến.'
                
        if len(excerpt) > 170:
            excerpt = excerpt[:167] + '...'
            
        cat_key, cat_label = categorize(name, title, text_content)
        
        # Find embedded image
        img_urls = re.findall(r'https?://[^\s\"\'\(\)<>]+\.(?:jpg|jpeg|png|webp)', content, re.I)
        cover_img = None
        if img_urls:
            for u in img_urls:
                u_low = u.lower()
                if 'icon' not in u_low and 'avatar' not in u_low and 'logo' not in u_low and 'svg' not in u_low:
                    cover_img = u
                    break
        if not cover_img:
            pool = CURATED_COVERS.get(cat_key, CURATED_COVERS['other'])
            cover_img = pool[idx % len(pool)]
            
        date_str, commit_msg = get_file_time(name)
        
        # Estimation of read time
        word_count = len(re.findall(r'\w+', text_content))
        read_mins = max(2, min(18, round(word_count / 170)))
        
        posts.append({
            'filename': name,
            'title': title,
            'excerpt': excerpt,
            'category_key': cat_key,
            'category_label': cat_label,
            'cover_image': cover_img,
            'updated_at': date_str,
            'read_time': f'{read_mins} phút đọc',
            'file_size_kb': round(os.path.getsize(f) / 1024, 1)
        })

    # Sort newest first
    posts.sort(key=lambda x: x['updated_at'], reverse=True)
    
    manifest_data = {
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total_posts': len(posts),
        'posts': posts
    }
    
    with open(OUTPUT_MANIFEST, 'w', encoding='utf-8') as out_fp:
        json.dump(manifest_data, out_fp, indent=2, ensure_ascii=False)
        
    print(f"✅ Đã xuất thành công {len(posts)} bài viết vào '{OUTPUT_MANIFEST}'!")
    return manifest_data

if __name__ == '__main__':
    build_manifest()
