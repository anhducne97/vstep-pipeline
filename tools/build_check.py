#!/usr/bin/env python3
"""Tạo dist/vstep_check.js: bộ kiểm của trang chạy bằng Node. Chạy cùng build.py."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(*p):
    with open(os.path.join(ROOT, *p), encoding='utf-8') as f: return f.read()
parts = [rd('tools','check_prelude.js'), rd('src','core.js'), rd('src','vocab.js').replace('/*LEXDATA*/', rd('src','lexdata.json')),
         rd('src','ui.js'), rd('src','qstep.js'), rd('src','lib.js'), rd('src','checklist.js'), rd('src','cefr.js'), rd('src','ws.js'), rd('src','compare.js'), rd('src','workflow.js'),
         rd('tools','check_cli.js')]
os.makedirs(os.path.join(ROOT,'dist'), exist_ok=True)
with open(os.path.join(ROOT,'dist','vstep_check.js'),'w',encoding='utf-8') as f: f.write("\n;\n".join(parts))
print("Đã tạo dist/vstep_check.js")
