"""Source official school contacts. Output is a review shortlist, never a send queue."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin,urlparse
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
import json,re,html
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self,body):
        super().__init__();self.links=[];self.words=[];self.ignore=0;self.feed(body)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','style'):self.ignore+=1
        if tag=='a' and a.get('href'):self.links.append((a['href'],a.get('data-cfemail','')))
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.ignore=max(0,self.ignore-1)
    def handle_data(self,data):
        if not self.ignore:self.words.append(data)
def fetch(url):
    with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=18) as r:return r.url,r.read(3_000_000).decode('utf8',errors='replace')
def inspect(item):
    result=dict(item,checked='2026-11-10',status='needs manual verification',signals=[],contacts=[],emails=[],send_status='not authorised or scheduled')
    try:
        final,body=fetch(item['website']);p=Page(body)
        text=' '.join(p.words)
        if len(text)<200: return result
        result['website']=final;result['status']='official homepage read'
        result['signals']=[s for s in ('International Baccalaureate','IB Diploma','boarding','secondary','sixth form','science','outdoor','British curriculum','English') if s.lower() in text.lower()]
        candidates=[]
        for link,_ in p.links:
            target=urljoin(final,link)
            if urlparse(target).hostname==urlparse(final).hostname and re.search('contact',link,re.I) and not re.search('/pta/|alumni|careers|jobs',link,re.I) and target not in candidates:candidates.append(target)
        pages=[(final,body)]
        for target in candidates[:2]:
            try:
                url,contact=fetch(target);pages.append((url,contact));result['contacts'].append(url)
            except Exception:pass
        for url,body in pages:
            emails=re.findall(r'mailto:([^"\s<>?]+)',html.unescape(body),re.I)
            emails+=re.findall(r'\b(?:info|office|contact|reception|admissions|admission|school|enquiries|enquiry|admin|secretariat)@[a-z0-9.-]+\.[a-z]{2,}\b',html.unescape(body),re.I)
            for value in emails:
                value=value.strip().lower()
                allowed_domains=item.get('email_domains',[urlparse(final).hostname.removeprefix('www.')])
                if re.fullmatch(r'(?:info|office|contact|reception|admissions|admission|school|enquiries|enquiry|admin|secretariat)@[a-z0-9.-]+\.[a-z]{2,}',value) and value.split('@')[-1] in allowed_domains and value not in [e['email'] for e in result['emails']]:result['emails'].append({'email':value,'source':url})
    except Exception as e:result['error']=type(e).__name__
    return result
seeds=json.loads((ROOT/'outreach/europe-school-seeds-2026-11-10.json').read_text())
results=list(ThreadPoolExecutor(max_workers=6).map(inspect,seeds))
(ROOT/'outreach/europe-schools-research-2026-11-10.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
lines=['# European international-school research — 10 November 2026','','Review shortlist only. No messages sent or scheduled. Public contact details do not establish marketing permission, academic suitability or inbox delivery. Check current secondary provision and the correct visits/science role before use.','','| School | Country | Official source/contact | Public organisation inbox | Visible homepage signals | Check |','|---|---|---|---|---|---|']
for r in results:
    contacts=r['contacts'][:1] or [r['website']]
    emails=', '.join(e['email'] for e in r['emails']) or 'Use official contact route / manually verify'
    lines.append(f"| {r['name']} | {r['country']} | {'; '.join(contacts)} | {emails} | {', '.join(r['signals']) or 'Manual qualification needed'} | {r['status']} |")
(ROOT/'outreach/europe-schools-shortlist-2026-11-10.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps({'schools':len(results),'official_reads':sum(r['status']=='official homepage read' for r in results),'public_generic_inboxes':sum(bool(r['emails']) for r in results),'manual_checks':[r['name'] for r in results if r['status']!='official homepage read']}))
