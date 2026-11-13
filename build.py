#!/usr/bin/env python3
"""Ghép các file trong src/ thành một trang duy nhất: dist/index.html.
Chạy: python3 build.py   (không cần cài gì thêm)
"""
import os, re, subprocess, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
def rd(name):
    with open(os.path.join(ROOT, 'src', name), encoding='utf-8') as f:
        return f.read()

core = rd('core.js')
ui = rd('vocab.js').replace('/*LEXDATA*/', rd('lexdata.json')) + "\n" + rd('ui.js') + rd('qstep.js') + rd('lib.js') + rd('checklist.js') + rd('cefr.js') + rd('export.js') + rd('compare.js') + rd('workflow.js') + rd('project.js') + rd('forum.js') + rd('notify.js') + '\nspecsFromSession();\ninit();\nbindLib();\nbindCl();\nbindWf();\nbindPrj();\nbindForum();\nbindNtf();\nbindLv();\nbindSb();\nbindXp();\nclRender();\n'
page = rd('page.html')
for ph in ('/*CORE*/', '/*UI*/', '/*BUILD*/'):
    assert page.count(ph) == 1, 'page.html phải có đúng một ' + ph

try:
    sha = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROOT, stderr=subprocess.DEVNULL).decode().strip()
except Exception:
    sha = 'local'
now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
tag = 'bản ' + now.strftime('%d/%m/%Y %H:%M') + ' · ' + sha

html = page.replace('/*CORE*/', core).replace('/*UI*/', ui).replace('/*BUILD*/', tag)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
with open(os.path.join(ROOT, 'dist', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)
import shutil
shutil.copyfile(os.path.join(ROOT, 'src', 'vendor', 'firebase.mjs'), os.path.join(ROOT, 'dist', 'firebase.mjs'))
shutil.copyfile(os.path.join(ROOT, 'src', 'vendor', 'docx.mjs'), os.path.join(ROOT, 'dist', 'docx.mjs'))
print('Đã tạo dist/index.html (' + tag + ')')
