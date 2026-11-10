"""Read public corporate contact pages, including their public Cloudflare email markup."""
import json,re,html
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parents[1]
items=[r for r in json.loads((root/'outreach/growth-prospects-2026-10-19.json').read_text()) if r['type']=='operators']
def read(item):
    url=item['contact'] or item['website']
    try:
        with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20) as response:
            body=response.read(3_000_000).decode('utf8',errors='replace')
        found=re.findall(r'mailto:([^"\s<>?]+)',body,re.I)
        for data in re.findall(r'data-cfemail=["\']([0-9a-f]+)',body,re.I):
            raw=bytes.fromhex(data);found.append(''.join(chr(c^raw[0]) for c in raw[1:]))
        found+=re.findall(r'\b(?:info|enquiries|enquiry|schools|education|sales|tours|quote)@[a-z0-9.-]+\.[a-z]{2,}\b',html.unescape(body),re.I)
        addresses=sorted({html.unescape(x).lower() for x in found if re.fullmatch(r'(info|enquiries|enquiry|schools|education|sales|tours|quote|estsales)@[a-z0-9.-]+\.[a-z]{2,}',html.unescape(x),re.I)})
        return {'name':item['name'],'source':url,'emails':addresses}
    except Exception as exc:return {'name':item['name'],'source':url,'error':type(exc).__name__}
results=list(ThreadPoolExecutor(max_workers=6).map(read,items))
(root/'outreach/operator-contacts-rechecked-2026-10-19.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
