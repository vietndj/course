import re

# Read Storytelling Prompt
with open('/Users/vietmac/Documents/CODE/course/mega_prompt_clean.txt', 'r', encoding='utf-8') as f:
    prompt1 = f.read().strip()

# Read HTML file
with open('/Users/vietmac/Documents/CODE/course/congthucstorytelling.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract Hook DNA
match_hook = re.search(r"<pre class=\"prompt-drawer__content\" id=\"hookdnaCodeBlock\">(.*?)</pre>", html_content, re.DOTALL)
prompt2 = match_hook.group(1).strip() if match_hook else ""

# Extract Pipeline
match_pipe = re.search(r"<pre class=\"prompt-drawer__content\" id=\"pipelineCodeBlock\">(.*?)</pre>", html_content, re.DOTALL)
prompt3 = match_pipe.group(1).strip() if match_pipe else ""

# Escape for JS backticks
def escape_js(text):
    return text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

prompt1_esc = escape_js(prompt1)
prompt2_esc = escape_js(prompt2)
prompt3_esc = escape_js(prompt3)

js_code = f"""function createMegaPromptSheet() {{
  const ss = SpreadsheetApp.create("📋 BỘ CÔNG CỤ MEGA PROMPT — VIDEO SUITE");
  
  const prompt1 = `{prompt1_esc}`;
  const prompt2 = `{prompt2_esc}`;
  const prompt3 = `{prompt3_esc}`;
  
  function formatPromptSheet(sheet, title, promptText, instructionText) {{
    sheet.getDataRange().setFontFamily("Arial").setFontSize(11);
    
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 800);
    sheet.setColumnWidth(3, 300);
    
    sheet.getRange("A1").setValue(title);
    sheet.getRange("A1:C1").mergeAcross();
    sheet.getRange("A1:C1").setFontSize(14).setFontWeight("bold").setBackground("#090d16").setFontColor("#ffffff").setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.setRowHeight(1, 40);
    
    sheet.getRange("A2").setValue("Hướng dẫn").setFontWeight("bold");
    sheet.getRange("B2").setValue(instructionText);
    
    sheet.getRange("A4").setValue("📋 PROMPT").setFontWeight("bold");
    
    const b4 = sheet.getRange("B4");
    b4.setValue(promptText);
    b4.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    b4.setFontFamily("Courier New").setFontSize(11);
    b4.setBorder(true, true, true, true, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID);
    
    sheet.getRange("A:A").setFontWeight("bold");
    sheet.getRange("A1:C1").setFontWeight("bold");
  }}
  
  const sheet1 = ss.insertSheet("Storytelling");
  formatPromptSheet(sheet1, "MEGA PROMPT: KỊCH BẢN STORYTELLING ĐỜI THƯỜNG", prompt1, "Bước 1: Copy toàn bộ ô B4 bên dưới. Bước 2: Mở ChatGPT/Gemini/Claude. Bước 3: Dán vào và nhấn Enter. Bước 4: Gõ 1 hành động đời thường + nghề của bạn.");
  
  const sheet2 = ss.insertSheet("Hook DNA");
  formatPromptSheet(sheet2, "MEGA PROMPT: HOOK DNA — KHOẢNH KHẮC INSIDER", prompt2, "Bước 1: Copy toàn bộ ô B4 bên dưới. Bước 2: Mở ChatGPT/Gemini/Claude. Bước 3: Dán vào và nhấn Enter. Bước 4: Làm theo hướng dẫn của AI.");
  
  const sheet3 = ss.insertSheet("Pipeline");
  formatPromptSheet(sheet3, "MEGA PROMPT: PIPELINE NHÂN HIỆU (HOOK + STORYTELLING)", prompt3, "Bước 1: Copy toàn bộ ô B4 bên dưới. Bước 2: Mở ChatGPT/Gemini/Claude. Bước 3: Dán vào và nhấn Enter. Bước 4: Làm theo hướng dẫn của AI.");
  
  const sheet4 = ss.insertSheet("Hướng Dẫn");
  sheet4.getDataRange().setFontFamily("Arial").setFontSize(11);
  sheet4.setColumnWidth(1, 120);
  sheet4.setColumnWidth(2, 800);
  sheet4.setColumnWidth(3, 300);
  
  sheet4.getRange("A1").setValue("📖 HƯỚNG DẪN SỬ DỤNG BỘ CÔNG CỤ MEGA PROMPT");
  sheet4.getRange("A1:C1").mergeAcross();
  sheet4.getRange("A1:C1").setFontSize(14).setFontWeight("bold").setBackground("#090d16").setFontColor("#ffffff").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet4.setRowHeight(1, 40);
  
  const hdData = [
    ["Bước 1", "Chọn tab phù hợp (Storytelling / Hook DNA / Pipeline)", "Mỗi tab giải quyết 1 bài toán khác nhau"],
    ["Bước 2", "Nhấn vào ô chứa prompt (ô lớn) → Menu 3 chấm → Sao chép", "Trên iPhone: chạm giữ ô → Sao chép"],
    ["Bước 3", "Mở ứng dụng AI yêu thích", "ChatGPT (miễn phí) / Gemini (miễn phí) / Claude"],
    ["Bước 4", "Dán prompt vào ô chat và nhấn Enter", "AI sẽ chào và hỏi bạn nhập thông tin"],
    ["Bước 5", "Làm theo hướng dẫn của AI", "Chỉ cần gõ 1 câu ngắn mô tả hành động đời thường"]
  ];
  sheet4.getRange(3, 1, 5, 3).setValues(hdData);
  sheet4.getRange("B3:C7").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  const tblData = [
    ["Tên Prompt", "Chức năng", "Phù hợp khi nào?"],
    ["Storytelling", "Bóc tách tâm lý từ 1 hành động đời thường → Kịch bản video 7 câu", "Muốn viết kịch bản video ngắn nhanh từ chất liệu đời sống"],
    ["Hook DNA", "Đào mỏ khoảnh khắc Insider Moment → 5 hook + 4 phiên bản content", "Muốn tìm câu hook đầu video/caption cuốn hút"],
    ["Pipeline", "Hợp nhất Hook DNA + Storytelling thành 1 quy trình liền mạch", "Muốn chạy 1 lần ra trọn bộ từ hook đến kịch bản"]
  ];
  sheet4.getRange(9, 1, 4, 3).setValues(tblData);
  sheet4.getRange("A9:C9").setFontWeight("bold").setBackground("#f3f3f3");
  sheet4.getRange("B9:C12").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  sheet4.getRange("A:A").setFontWeight("bold");
  sheet4.getRange("A1:C1").setFontWeight("bold");
  
  const sheet1Default = ss.getSheetByName("Sheet1");
  if (sheet1Default) {{
    ss.deleteSheet(sheet1Default);
  }}
}}

// HƯỚNG DẪN SỬ DỤNG:
// 1. Mở Google Drive → New → Google Apps Script
// 2. Dán toàn bộ code này vào
// 3. Nhấn ▶ Run → Chọn hàm createMegaPromptSheet
// 4. Cho phép quyền truy cập lần đầu
// 5. Sheet sẽ được tạo tự động trong Google Drive
"""

with open('/Users/vietmac/Documents/CODE/course/create_megaprompt_sheet.gs', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Created create_megaprompt_sheet.gs successfully!")
