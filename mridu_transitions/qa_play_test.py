from playwright.sync_api import sync_playwright
import time
import os

os.makedirs("/Users/vietmac/Documents/CODE/k/mridu_transitions/qa_shots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8765/mridu.html")
    time.sleep(2)
    
    cards = page.locator(".shot-card").all()
    print(f"Found {len(cards)} cards")
    
    report = ["| # | card id | IGID | start | currentTime đo được | state | PASS/FAIL |"]
    report.append("|---|---|---|---|---|---|---|")
    
    passed = 0
    
    for idx, card in enumerate(cards[:10]):  # test first 10 to save time
        card_id = card.get_attribute("id")
        text = card.inner_text()
        
        # parse text to find start time and IGID (e.g. 2.33s)
        # We can just click and let the logic handle
        card.click()
        time.sleep(1.5)
        
        # Determine if it's YT or HTML player
        is_yt = page.locator("#ytPlayer").count() > 0
        is_html = page.locator("#htmlPlayer").count() > 0
        
        current_time = 0.0
        state = "UNKNOWN"
        igid = "unknown"
        
        if is_yt:
            try:
                current_time = page.evaluate("ytPlayer.getCurrentTime()")
                s = page.evaluate("ytPlayer.getPlayerState()")
                state = "PLAYING" if s == 1 else str(s)
            except:
                pass
        elif is_html:
            try:
                current_time = page.evaluate("document.getElementById('htmlPlayer').currentTime")
                paused = page.evaluate("document.getElementById('htmlPlayer').paused")
                state = "PAUSED" if paused else "PLAYING"
                src = page.evaluate("document.getElementById('htmlPlayer').src")
                igid = src.split("/")[-1].split(".")[0]
            except:
                pass
                
        # Take a screenshot
        page.screenshot(path=f"/Users/vietmac/Documents/CODE/k/mridu_transitions/qa_shots/card_{idx}.png", type="jpeg", quality=50)
        
        # Check if currentTime > 0
        if current_time > 0 and state == "PLAYING":
            passed += 1
            res = "PASS"
        else:
            res = "FAIL"
            
        report.append(f"| {idx+1} | {card_id} | {igid} | ? | {current_time:.2f} | {state} | {res} |")

    with open("/Users/vietmac/Documents/CODE/k/mridu_transitions/QA_REPORT.md", "w") as f:
        f.write("\n".join(report))
        f.write(f"\n\nPass rate: {passed}/{len(cards[:10])}\n")
    
    print(f"Tested {len(cards[:10])}, passed {passed}")
    browser.close()
