"""Read public official prospect sites; produce a sourced shortlist, never send mail."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from html.parser import HTMLParser
import json, re, time

ROOT=Path(__file__).resolve().parents[1]
seeds=json.loads((ROOT/'outreach/growth-prospect-seeds-2026-10-19.json').read_text())
HEAD={'User-Agent':'Mozilla/5.0 (compatible; public-contact-research/1.0)'}

class Page(HTMLParser):
    def __init__(self,html):
        super().__init__(); self.links=[]; self.text=[]; self.title=[]; self.in_title=False; self.ignore=0; self.feed(html)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in ('script','style'): self.ignore+=1
        if tag=='title':self.in_title=True
        if tag=='a' and attrs.get('href'):self.links.append(attrs['href'])
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.ignore=max(0,self.ignore-1)
        if tag=='title':self.in_title=False
    def handle_data(self,data):
        if not self.ignore:self.text.append(data)
        if self.in_title:self.title.append(data)

def fetch(url,timeout=18):
    with urlopen(Request(url,headers=HEAD),timeout=timeout) as r:
        return r.url,r.read(3_000_000).decode('utf8',errors='replace')

def inspect(item):
    kind,name,url=item
    result={'type':kind,'name':name,'website':url,'checked':'2026-10-19','status':'unresolved','contact':'','emails':[],'evidence':[]}
    try:
        final,html=fetch(url)
        soup=Page(html)
        text=' '.join(soup.text)
        if len(text)<100: return result
        result['website']=final; result['status']='official page read'
        signals=['International Baccalaureate','IB Diploma','boarding','science','geography','school trips','educational','fieldwork','outdoor']
        result['evidence']=[s for s in signals if s.lower() in text.lower()]
        links=[]
        for a in soup.links:
            href=urljoin(final,a)
            if re.search(r'contact',a,re.I) and urlparse(href).hostname==urlparse(final).hostname:
                if href not in links: links.append(href)
        result['contact']=links[0] if links else final
        pages=[(final,html)]
        if links:
            try:
                target,body=fetch(links[0],15);pages.insert(0,(target,body));result['contact']=target
            except Exception:pass
        for source,html in pages:
            dom=Page(html)
            for a in dom.links:
                if not a.startswith('mailto:'):continue
                email=a[7:].split('?')[0].strip().lower()
                if re.fullmatch(r'(info|contact|office|enquiries|enquiry|admissions|reception|travel|education|groups|sales|hello|tours)@[a-z0-9.-]+\.[a-z]{2,}',email):
                    if email not in [x['email'] for x in result['emails']]:result['emails'].append({'email':email,'source':source})
        title=' '.join(soup.title)
        result['page_title']=title[:180]
    except Exception as e: result['error']=type(e).__name__
    return result

items=[(kind,name,url) for kind,rows in seeds.items() for name,url in rows]
with ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(inspect,items))
# This official page was read through the web search tool on the same research date.
# The origin rejects this script's HTTP client. Keep the evidence route explicit.
for r in results:
    if r['name']=='NST' and r['status']=='unresolved':
        r.update(status='official indexed page verified',contact='https://www.nstgroup.co.uk/get-in-touch',evidence=['school trips','science','geography'],emails=[{'email':'info@nstgroup.co.uk','source':'https://www.nstgroup.co.uk/educational-school-trips'}])
out=ROOT/'outreach/growth-prospects-2026-10-19.json';out.write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
lines=['# Swiss school and school-travel partner shortlist','','Researched 19 October 2026 from official public pages. This is a research shortlist, not a sent or scheduled campaign. A contact form is a valid routing destination when no generic inbox was visible. Admissions/office addresses should be asked to route the introduction to the academic, visits or programme lead. No named personal emails have been inferred.','','Beau Soleil is an existing programme relationship and is excluded from cold prospects. Screen every future contact against the private suppression register and prior sent records. Do not treat website access, a public inbox or an admissions contact as proof of marketing permission or partnership interest.']
for kind,title in [('schools','Swiss schools'),('operators','UK school-travel operators')]:
    lines+=['',f'## {title}','','| Organisation | Official contact route | Public role inbox, if visible | On-page programme signals | Research status |','|---|---|---|---|---|']
    for r in results:
        if r['type']!=kind:continue
        emails='; '.join(f"[{e['email']}]({e['source']})" for e in r['emails'][:2]) or 'Use official contact route'
        evidence=', '.join(r['evidence']) or 'Programme fit requires manual confirmation'
        lines.append(f"| {r['name']} | {r['contact'] or r['website']} | {emails} | {evidence} | {r['status']} |")
lines+=['','## How to approach','','Schools: ask for the Head of Science/Biology, DP/ESS coordinator or educational visits lead. Lead with practical field investigation and the public Beau Soleil example, then offer the teacher pack. Tailor curriculum wording after confirming the school\'s actual programme.','','Operators: ask for the educational product, contracting or partnerships team. Offer EcoWise Italy as the local educational delivery partner. Send the partner brief when relevant. Discuss supplier terms directly with Adam; no commission or package protection has been promised.','','Read only the cited pages for the stated signals. A successful HTTP read does not establish inbox deliverability. Unresolved rows remain research tasks and must not be put into a send queue.']
(ROOT/'outreach/swiss-schools-and-operators-2026-10-19.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps({'total':len(results),'official_pages_read':sum(r['status']=='official page read' for r in results),'official_indexed_pages':sum(r['status']=='official indexed page verified' for r in results),'role_inboxes':sum(bool(r['emails']) for r in results),'unresolved':[r['name'] for r in results if r['status']=='unresolved']}))
