#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
dong_bo.py
Script đồng bộ 1-chạm 2 chiều (Mac ⇄ Windows) cho toàn bộ hệ sinh thái Antigravity & Bài Giảng Video:
1. Đồng bộ Não bộ & 43 Kỹ năng (vietndj/antigravity-config-backup) + Self-Healing DB
2. Đồng bộ Nội dung Bài Giảng, 4 Định dạng HTML, 14 Nhánh HTML & Artifacts (vietndj/course)
"""

import os
import sys
import json
import shutil
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

HOME = Path.home()
IS_WINDOWS = sys.platform.startswith("win")
IS_MAC = sys.platform == "darwin"
OS_NAME = "windows" if IS_WINDOWS else ("mac" if IS_MAC else "linux")

CODE_DIR = HOME / "Documents" / "CODE"
BACKUP_REPO = CODE_DIR / "antigravity-config-backup"
COURSE_REPO = CODE_DIR / "course"
BAI_GIANG_REPO = CODE_DIR / "BAI GIANG VIDEO"

GEMINI_DIR = HOME / ".gemini"
SKILLS_DIR = GEMINI_DIR / "config" / "skills"
BRAIN_DIR = GEMINI_DIR / "antigravity" / "brain"
ANN_DIR = GEMINI_DIR / "antigravity" / "annotations"
CONV_DIR = GEMINI_DIR / "antigravity" / "conversations"

def print_banner(text):
    print(f"\n{'='*70}\n  {text}\n{'='*70}")

def run_git(cwd: Path, args: list):
    """Chạy lệnh git an toàn và trả về kết quả"""
    try:
        res = subprocess.run(["git"] + args, cwd=str(cwd), capture_output=True, text=True)
        return res.returncode == 0, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def ensure_repos():
    """Đảm bảo các repo đã được clone về máy"""
    CODE_DIR.mkdir(parents=True, exist_ok=True)
    
    if not BACKUP_REPO.exists():
        print(f"📦 Đang clone repo antigravity-config-backup về {BACKUP_REPO}...")
        subprocess.run(["git", "clone", "https://github.com/vietndj/antigravity-config-backup.git", str(BACKUP_REPO)], check=True)

    target_course = BAI_GIANG_REPO if BAI_GIANG_REPO.exists() and (BAI_GIANG_REPO / ".git").exists() else COURSE_REPO
    if not target_course.exists():
        print(f"📦 Đang clone repo course về {target_course}...")
        subprocess.run(["git", "clone", "https://github.com/vietndj/course.git", str(target_course)], check=True)

def pull_all():
    """Kéo toàn bộ tri thức và bài giảng về máy hiện tại"""
    print_banner(f"📥 BẮT ĐẦU ĐỒNG BỘ TỪ GITHUB VỀ MÁY {OS_NAME.upper()}")
    ensure_repos()

    # 1. Kéo antigravity-config-backup
    print("\n1️⃣  Cập nhật cấu hình & Não bộ (antigravity-config-backup)...")
    ok, out, err = run_git(BACKUP_REPO, ["pull", "--rebase", "origin", "main"])
    if ok:
        print("   ✅ Git pull backup thành công.")
    else:
        print(f"   ⚠️ Git pull backup warning: {err or out}")

    # Đồng bộ skills vào .gemini
    repo_skills = BACKUP_REPO / "config" / "skills"
    if repo_skills.exists():
        SKILLS_DIR.mkdir(parents=True, exist_ok=True)
        print("   🛠️  Đang cài đặt 43 kỹ năng vào Antigravity...")
        for item in repo_skills.iterdir():
            if item.is_dir():
                target = SKILLS_DIR / item.name
                if target.exists():
                    shutil.rmtree(target)
                shutil.copytree(item, target)
        print(f"   ✅ Đã nạp thành công {len(list(SKILLS_DIR.iterdir()))} kỹ năng.")

    # Đồng bộ annotations
    repo_ann = BACKUP_REPO / "annotations"
    if repo_ann.exists():
        ANN_DIR.mkdir(parents=True, exist_ok=True)
        for p in repo_ann.glob("*.pbtxt"):
            shutil.copy2(p, ANN_DIR / p.name)
        print(f"   ✅ Đã nạp {len(list(ANN_DIR.glob('*.pbtxt')))} danh mục chat.")

    # Đồng bộ brain
    repo_brain = BACKUP_REPO / "brain_sync"
    if repo_brain.exists():
        BRAIN_DIR.mkdir(parents=True, exist_ok=True)
        for cdir in repo_brain.iterdir():
            if not cdir.is_dir():
                continue
            t_cdir = BRAIN_DIR / cdir.name
            t_cdir.mkdir(parents=True, exist_ok=True)
            log_dir = t_cdir / ".system_generated" / "logs"
            log_dir.mkdir(parents=True, exist_ok=True)
            
            src_log = cdir / "transcript.jsonl"
            if src_log.exists():
                shutil.copy2(src_log, log_dir / "transcript.jsonl")
            for md in cdir.glob("*.md"):
                shutil.copy2(md, t_cdir / md.name)
        print(f"   ✅ Đã nạp dữ liệu Brain cho {len(list(BRAIN_DIR.iterdir()))} cuộc trò chuyện.")

    # Tự động Self-Healing SQLite Database
    heal_script = BACKUP_REPO / "self_heal_conversations.py"
    if heal_script.exists():
        print("\n   🩺 Đang chạy Self-Healing để tái tạo SQLite DB trên Sidebar...")
        subprocess.run([sys.executable, str(heal_script)], check=False)

    # 2. Kéo bài giảng video (course / BAI GIANG VIDEO)
    print("\n2️⃣  Cập nhật Tài liệu Bài Giảng (4 định dạng & 14 HTML nhánh)...")
    for rpath in [COURSE_REPO, BAI_GIANG_REPO]:
        if rpath.exists() and (rpath / ".git").exists():
            ok, out, err = run_git(rpath, ["pull", "--rebase", "origin", "main"])
            if ok:
                print(f"   ✅ Cập nhật thư mục {rpath.name} thành công.")
            else:
                print(f"   ⚠️ {rpath.name} warning: {err or out}")

    print_banner(f"🎉 HOÀN TẤT ĐỒNG BỘ VỀ MÁY {OS_NAME.upper()}! BẠN CÓ THỂ LÀM VIỆC TIẾP TỤC NGAY.")

def push_all():
    """Đóng gói và đẩy toàn bộ thay đổi lên GitHub"""
    print_banner(f"🚀 BẮT ĐẦU ĐÓNG GÓI & ĐẨY LÊN GITHUB TỪ MÁY {OS_NAME.upper()}")
    ensure_repos()

    # 1. Xuất các cuộc trò chuyện nhánh mới ra HTML
    export_script = BACKUP_REPO / "export_nhanh_to_html.py"
    if export_script.exists():
        print("\n1️⃣  Đang xuất bản các cuộc trò chuyện [Nhánh] sang HTML...")
        subprocess.run([sys.executable, str(export_script)], check=False)

    # 2. Đẩy tài liệu bài giảng
    print("\n2️⃣  Đang kiểm tra và đẩy tài liệu Bài Giảng...")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for rpath in [COURSE_REPO, BAI_GIANG_REPO]:
        if rpath.exists() and (rpath / ".git").exists():
            run_git(rpath, ["add", "."])
            ok_diff, out_diff, _ = run_git(rpath, ["diff", "--staged", "--quiet"])
            if not ok_diff: # Có diff
                run_git(rpath, ["commit", "-m", f"Sync course updates from {OS_NAME} [{now_str}]"])
                ok_push, _, err_push = run_git(rpath, ["push", "origin", "main"])
                if ok_push:
                    print(f"   ✅ Đã đẩy cập nhật {rpath.name} lên GitHub.")
                else:
                    print(f"   ⚠️ Lỗi đẩy {rpath.name}: {err_push}")
            else:
                print(f"   ✨ {rpath.name} không có thay đổi mới.")

    # 3. Đẩy antigravity-config-backup (sync_chat.py)
    print("\n3️⃣  Đang đồng bộ Não bộ & Skills lên antigravity-config-backup...")
    sync_chat_script = BACKUP_REPO / "sync_chat.py"
    if sync_chat_script.exists():
        subprocess.run([sys.executable, str(sync_chat_script), "--push"], check=False)

    print_banner(f"🎉 HOÀN TẤT ĐẨY LÊN GITHUB TỪ MÁY {OS_NAME.upper()}!")

def main():
    parser = argparse.ArgumentParser(description="Đồng bộ 2 chiều Antigravity & Bài Giảng Video (Mac ⇄ Windows)")
    parser.add_argument("--pull", action="store_true", help="Kéo toàn bộ dữ liệu từ GitHub về máy hiện tại")
    parser.add_argument("--push", action="store_true", help="Đẩy toàn bộ dữ liệu từ máy hiện tại lên GitHub")
    args = parser.parse_args()

    if args.pull:
        pull_all()
    elif args.push:
        push_all()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
