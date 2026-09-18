import re

files_to_update = [
    "/Users/vietmac/Documents/CODE/course/voiceover.html",
    "/Users/vietmac/Documents/CODE/course/9_kich_ban_thuc_chien.html"
]

replacements = {
    "Bài 1": "kich_ban_01_ngoi_ca_phe_10h_toi.html",
    "Bài 2": "kich_ban_02_tien_mat_bang_va_cua_hang_vang_khach.html",
    "Bài 3": "kich_ban_03_chung_lai_sau_tuoi_30.html",
    "Bài 4": "kich_ban_04_tien_quang_cao_an_het_tien_lai.html",
    "Bài 5": "kich_ban_05_het_khach_tu_moi_quan_he_quen.html",
    "Bài 6": "kich_ban_06_tay_nghe_tot_nhung_van_vang_khach.html",
    "Bài 7": "kich_ban_07_bi_canh_tranh_boi_tong_kho_va_gia_goc.html",
    "Bài 8": "kich_ban_08_bat_dau_lai_tu_con_so_0.html",
    "Bài 9": "kich_ban_09_hang_lam_ky_nhung_bi_so_sanh_gia.html"
}

# The previous command I ran was: 
# sed -i '' 's/href="kichban[0-9].html"/href="..\/k\/kichbanoffline.html"/g'
# So the current href is "../k/kichbanoffline.html"
# But they are next to the words "Bài X," or inside a card for "BÀI TẬP 0X".

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The structure in voiceover.html is:
    # <div class="script-num">BÀI TẬP 01</div>
    # ...
    # <a href="../k/kichbanoffline.html" target="_blank" class="script-btn">Ấn vào để xem ↗</a>
    # 
    # We can use regex to find BÀI TẬP 0X or Bài X and then the next href.
    
    # We will do a generic replacement: replace all "../k/kichbanoffline.html" with the correct link sequentially, because they appear in order 1 to 9.
    
    # Check if there are exactly 9 (or 18 in 9_kich_ban_thuc_chien.html)
    count = content.count("../k/kichbanoffline.html")
    print(f"{path} has {count} links to replace.")
    
    if count == 9:
        for i in range(1, 10):
            link = f"../offline02/{replacements['Bài ' + str(i)]}"
            content = content.replace("../k/kichbanoffline.html", link, 1)
    elif count == 18:
        for _ in range(2):
            for i in range(1, 10):
                link = f"../offline02/{replacements['Bài ' + str(i)]}"
                content = content.replace("../k/kichbanoffline.html", link, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

for p in files_to_update:
    update_file(p)

