#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_course_manifest.py (Wrapper uỷ quyền sang build_repo_hub.py)
Đảm bảo tương thích ngược 100% với dong_bo.py và các script gọi build_manifest().
"""
from pathlib import Path
from build_repo_hub import build_repo_hub


def build_manifest():
    repo_dir = Path(__file__).resolve().parent
    return build_repo_hub(repo_dir, verify_posters=False)


if __name__ == "__main__":
    build_manifest()
