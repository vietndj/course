#!/usr/bin/env python3
"""
Trích xuất 2 bảng lưới ảnh kiểm định cho motion02_v2_precue_10s_9x16_60fps.mp4:
1. v2_precue_10s_40frames_grid.jpg: 40 frames (mỗi 0.25s = 15 frames từ f0 đến f585)
2. v2_precue_transitions_closeup.jpg: 16 frames cận cảnh Pre-Cue & Transitions
   (f4, f12, f88, f104, f168, f180, f192, f232, f238, f246, f274, f320, f336, f428, f440, f516)
"""

import os
import cv2
import numpy as np

VIDEO_PATH = "/Users/vietmac/Documents/CODE/course_repo/assets/motion02/motion02_v2_precue_10s_9x16_60fps.mp4"
FRAMES_DIR = "/Users/vietmac/Documents/CODE/course_repo/assets/motion02/frames"
GRID_40_PATH = os.path.join(FRAMES_DIR, "v2_precue_10s_40frames_grid.jpg")
GRID_16_PATH = os.path.join(FRAMES_DIR, "v2_precue_transitions_closeup.jpg")


def extract_frames_map(video_path, target_frames):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")
    out = {}
    max_f = max(target_frames)
    f_idx = 0
    target_set = set(target_frames)
    while f_idx <= max_f:
        ret, frame = cap.read()
        if not ret:
            break
        if f_idx in target_set:
            out[f_idx] = frame
        f_idx += 1
    cap.release()
    return out


def annotate_tile(img, f_idx, fps=60, subtitle=""):
    h, w = img.shape[:2]
    out = img.copy()
    sec = f_idx / float(fps)
    label = f"f{f_idx:03d} ({sec:.2f}s)"
    cv2.rectangle(out, (8, 8), (w - 8, 52 if not subtitle else 78), (8, 9, 12), -1)
    cv2.rectangle(out, (8, 8), (w - 8, 52 if not subtitle else 78), (21, 204, 250), 2)
    cv2.putText(
        out,
        label,
        (18, 38),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.78,
        (71, 224, 253),
        2,
        cv2.LINE_AA,
    )
    if subtitle:
        cv2.putText(
            out,
            subtitle,
            (18, 66),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.58,
            (245, 248, 250),
            1,
            cv2.LINE_AA,
        )
    return out


def build_grid(frames_map, frame_list, cols, tile_w, tile_h, notes=None):
    rows = (len(frame_list) + cols - 1) // cols
    canvas = np.zeros((rows * tile_h, cols * tile_w, 3), dtype=np.uint8)
    for idx, f_num in enumerate(frame_list):
        r = idx // cols
        c = idx % cols
        raw = frames_map.get(f_num)
        if raw is None:
            tile = np.zeros((tile_h, tile_w, 3), dtype=np.uint8)
        else:
            tile = cv2.resize(raw, (tile_w, tile_h), interpolation=cv2.INTER_AREA)
        note = notes.get(f_num, "") if notes else ""
        tile = annotate_tile(tile, f_num, fps=60, subtitle=note)
        canvas[r * tile_h : (r + 1) * tile_h, c * tile_w : (c + 1) * tile_w] = tile
    return canvas


def main():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    frames_40 = [i * 15 for i in range(40)]  # f0, f15, ..., f585
    frames_16 = [
        4, 12, 88, 104,
        168, 180, 192, 232,
        238, 246, 274, 320,
        336, 428, 440, 516,
    ]
    notes_16 = {
        4: "PreCue 1a: Seed Node Pop",
        12: "PreCue 1a: Figma Box Expand",
        88: "PreCue 1b: Caret Drop + Seed M",
        104: "Text 1b: Word Wave + Caret",
        168: "PreCue 1c: Recoil Blur + ****",
        180: "PreCue 1c: Diagonal Blade Rip",
        192: "Text 1c: Hard Invert Slam",
        232: "Morph: Strike -> Comet Cursor",
        238: "Transition 1->2: Whip-Pan Blur",
        246: "PreCue 2a: Comet Brake NOW Pill",
        274: "PreCue 2b-1: 6 AI Cursors Swarm",
        320: "PreCue 2b-2: <SEMANTIC_CORE>",
        336: "Climax 2b: 3D Gold NGU NGHIA",
        428: "Transition 2->3: Portal Open",
        440: "PreCue 3a: Portal + Caret Sweep",
        516: "Climax 3b: Slot-Wheel Lock IDOL",
    }

    all_needed = sorted(set(frames_40 + frames_16))
    frames_map = extract_frames_map(VIDEO_PATH, all_needed)

    grid40 = build_grid(frames_map, frames_40, cols=8, tile_w=324, tile_h=576)
    cv2.imwrite(GRID_40_PATH, grid40, [int(cv2.IMWRITE_JPEG_QUALITY), 92])

    grid16 = build_grid(frames_map, frames_16, cols=4, tile_w=450, tile_h=800, notes=notes_16)
    cv2.imwrite(GRID_16_PATH, grid16, [int(cv2.IMWRITE_JPEG_QUALITY), 94])

    print("Saved 40-frame grid:", GRID_40_PATH)
    print("Saved 16-frame closeup grid:", GRID_16_PATH)


if __name__ == "__main__":
    main()
