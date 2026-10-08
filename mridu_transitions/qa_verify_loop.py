from playwright.sync_api import sync_playwright
import time
import os
import cv2
import numpy as np

os.makedirs("/Users/vietmac/Documents/CODE/k/mridu_transitions/qa_shots_v3", exist_ok=True)

def image_diff(img1_path, img2_path):
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    if img1.shape != img2.shape: return 1.0 # completely different
    diff = cv2.absdiff(img1, img2)
    return np.mean(diff) / 255.0

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto("http://localhost:8765/mridu.html")
    time.sleep(2)
    
    cards = page.locator(".shot-card").all()
    print("Testing 3 cards to ensure player correctly switches video...")
    
    player = page.locator("#playerContainer")
    shots = []
    
    for idx in range(3):
        print(f"Clicking card {idx}...")
        cards[idx].evaluate("node => node.scrollIntoView()")
        cards[idx].evaluate("node => node.click()")
        time.sleep(3)
        
        path = f"/Users/vietmac/Documents/CODE/k/mridu_transitions/qa_shots_v3/player_shot_{idx}.jpg"
        player.screenshot(path=path)
        shots.append(path)
        
        if idx > 0:
            diff = image_diff(shots[idx-1], shots[idx])
            print(f"Diff from previous: {diff:.4f}")
            if diff < 0.01:
                print("FAIL: The video didn't change visually! Bug exists.")
                exit(1)
            else:
                print("PASS: The video changed successfully.")
                
    print("QA Loop PASS: All clicks resulted in correct video switches.")
    browser.close()
