#!/usr/bin/env python3
import os, sys, re, glob, argparse

def main():
    parser = argparse.ArgumentParser(description='Gắn favicon chuẩn Cinema REC Monogram (VI / DEO) vào tất cả file HTML')
    parser.add_argument('--dry-run', action='store_true', help='Chạy thử nghiệm không ghi đè')
    args = parser.parse_args()

    chosen_tags = '''  <!-- Favicon System (Chuẩn Chữ VIDEO - Cinema REC Monogram) -->
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%230B0F19'/%3E%3Crect x='1.5' y='1.5' width='61' height='61' rx='14.5' fill='none' stroke='%23FFFFFF' stroke-opacity='0.14' stroke-width='1.5'/%3E%3Ctext x='25' y='25' text-anchor='middle' dominant-baseline='central' font-family='system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' font-weight='900' font-size='21.5' letter-spacing='2px' fill='%23FFFFFF'%3EVI%3C/text%3E%3Ccircle cx='47' cy='25' r='7' fill='%23EF4444' fill-opacity='0.25'/%3E%3Ccircle cx='47' cy='25' r='4.2' fill='%23EF4444'/%3E%3Ccircle cx='47' cy='25' r='1.6' fill='%23FFFFFF' opacity='0.9'/%3E%3Ctext x='32' y='46' text-anchor='middle' dominant-baseline='central' font-family='system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' font-weight='900' font-size='19' letter-spacing='1.2px' fill='%23F8FAFC'%3EDEO%3C/text%3E%3C/svg%3E">'''

    html_files = [f for f in glob.glob("*.html") if f != "favicon-preview.html"]
    print(f"Kiểm tra {len(html_files)} file HTML...")

    updated_count = 0
    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if "<!-- Favicon System (Chuẩn Chữ VIDEO" in content:
            new_content = re.sub(
                r'  <!-- Favicon System \(Chuẩn Chữ VIDEO.*?-->\s*(<link rel="icon"[^>]*>\s*)+',
                chosen_tags + "\n",
                content
            )
        else:
            cleaned_content = re.sub(r'\s*<link rel="(icon|alternate icon)"[^>]*>', '', content)
            if re.search(r'</title>', cleaned_content, flags=re.IGNORECASE):
                new_content = re.sub(
                    r'(</title>)',
                    r'\1\n\n' + chosen_tags,
                    cleaned_content,
                    count=1,
                    flags=re.IGNORECASE
                )
            elif re.search(r'<head[^>]*>', cleaned_content, flags=re.IGNORECASE):
                new_content = re.sub(
                    r'(<head[^>]*>)',
                    r'\1\n' + chosen_tags,
                    cleaned_content,
                    count=1,
                    flags=re.IGNORECASE
                )
            else:
                continue

        if new_content != content:
            if not args.dry_run:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
            updated_count += 1

    print(f"Hoàn tất! {len(html_files) - updated_count} file đã chuẩn, cập nhật thêm {updated_count} file.")

if __name__ == '__main__':
    main()
