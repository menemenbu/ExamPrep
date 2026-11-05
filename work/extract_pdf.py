from pathlib import Path
from pypdf import PdfReader
p=next(Path(r'.\sources').glob('*.pdf'))
r=PdfReader(str(p),strict=False)
print('pages',len(r.pages),'metadata',r.metadata)
out=Path(r'.\work\pages_1_94.txt')
with out.open('w',encoding='utf-8') as f:
 for i in range(min(94,len(r.pages))):
  text=r.pages[i].extract_text(extraction_mode='layout') or r.pages[i].extract_text() or ''
  f.write(f'\n\n----- PDF PAGE {i+1} -----\n{text}\n')
print('extracted',out.stat().st_size)
