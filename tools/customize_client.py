#!/usr/bin/env python3
"""
法規鑑別清單管理系統 — 客製化腳本
用途：為每位客戶產生專屬 HTML 檔案，並自動建立 JSONBin Bin
使用：python3 customize_client.py
"""

import hashlib
import sys
import os
import re
import json
import urllib.request
import urllib.parse
import getpass

BASE_HTML = os.path.join(os.path.dirname(__file__), '..', '法規登記系統.html')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'clients')
JSONBIN_BASE = 'https://api.jsonbin.io/v3/b'


def sha256(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def create_jsonbin(master_key, company_name):
    """建立新的 JSONBin Bin，回傳 bin_id"""
    data = json.dumps({"init": True, "company": company_name}).encode('utf-8')
    req = urllib.request.Request(
        JSONBIN_BASE,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'X-Master-Key': master_key,
            'X-Bin-Name': f'法規系統-{company_name}',
            'X-Bin-Private': 'true',
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            return result['metadata']['id']
    except Exception as e:
        print(f'  ⚠️  JSONBin 建立失敗：{e}')
        return None


def customize(company_name, password, output_filename, master_key=None):
    with open(BASE_HTML, 'r', encoding='utf-8') as f:
        html = f.read()

    # 替換公司名稱（4 處）
    html = html.replace('示範股份有限公司', company_name)

    # 替換管理者密碼 hash
    new_hash = sha256(password)
    html = re.sub(
        r"const ADMIN_HASH = '[0-9a-f]{64}';.*",
        f"const ADMIN_HASH = '{new_hash}'; // {company_name}",
        html
    )

    # 建立 JSONBin Bin
    bin_id = None
    if master_key:
        print('  正在建立 JSONBin Bin...')
        bin_id = create_jsonbin(master_key, company_name)
        if bin_id:
            print(f'  ✅ Bin ID：{bin_id}')

    # 確保輸出目錄存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, output_filename)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    return out_path, bin_id


def main():
    print('=' * 55)
    print('  法規鑑別清單管理系統 — 客製化工具')
    print('=' * 55)
    print()

    # 收集基本資訊
    company_name = input('客戶公司名稱（例：台灣製造股份有限公司）：').strip()
    if not company_name:
        print('錯誤：公司名稱不能為空')
        sys.exit(1)

    print('\n設定管理者密碼（客戶登入用）')
    while True:
        password = getpass.getpass('  密碼：')
        confirm = getpass.getpass('  確認密碼：')
        if password == confirm:
            break
        print('  ⚠️  密碼不一致，請重試')

    # 輸出檔名
    safe_name = re.sub(r'[^\w一-鿿]', '_', company_name)
    default_filename = f'法規鑑別清單_{safe_name}.html'
    filename_input = input(f'\n輸出檔名 [{default_filename}]：').strip()
    output_filename = filename_input if filename_input else default_filename

    # JSONBin 設定
    print('\n是否自動建立 JSONBin Bin？（需提供 Master Key）')
    print('  若跳過，客戶需自行在系統內設定雲端')
    use_jsonbin = input('  建立 JSONBin Bin？[Y/n]：').strip().lower()

    master_key = None
    if use_jsonbin != 'n':
        master_key = getpass.getpass('  JSONBin Master Key：').strip()
        if not master_key:
            master_key = None
            print('  ⚠️  未輸入 Key，略過 JSONBin 建立')

    # 執行
    print('\n正在產生客製化檔案...')
    out_path, bin_id = customize(company_name, password, output_filename, master_key)

    print()
    print('=' * 55)
    print('✅ 完成！')
    print(f'   輸出檔案：{out_path}')
    if bin_id and master_key:
        print()
        print('📋 請將以下資訊交給客戶（或協助他們在系統內輸入）：')
        print(f'   X-Master-Key：{master_key}')
        print(f'   Bin ID：      {bin_id}')
        print()
        print('   客戶登入後進入 ☁ 雲端設定，輸入以上兩個值即可。')
    elif not bin_id:
        print()
        print('📋 提醒：客戶需自行設定雲端（☁ 雲端設定）才能啟用資料同步。')
    print('=' * 55)


if __name__ == '__main__':
    main()
