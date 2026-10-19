"""Build the public teacher planning guide and operator capability brief."""
from pathlib import Path
from html import escape
from io import BytesIO
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'wp-content/themes/ecowise-custom/assets/documents'
OUT.mkdir(parents=True, exist_ok=True)
PHOTOS = ROOT / 'wp-content/themes/ecowise-custom/assets/images/owner-album'
pdfmetrics.registerFont(TTFont('Eco', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('EcoBold', 'C:/Windows/Fonts/arialbd.ttf'))
GREEN = HexColor('#234a35'); YELLOW = HexColor('#f3d84b'); INK = HexColor('#1b2820'); GREY = HexColor('#59665e'); PALE = HexColor('#eef3eb')
W, H, M = 595.28, 841.89, 46
URL = 'https://ecowiseitaly.com/school-trips-italy/'
POST = 'https://www.facebook.com/Ecowiseitaly/posts/1088675720460799/'
style = ParagraphStyle('Body', fontName='Eco', fontSize=10.4, leading=15.5, textColor=INK, spaceAfter=0)

def para(c, text, x, y, width, size=10.4, color=INK, bold=False):
    s = ParagraphStyle('P', parent=style, fontName='EcoBold' if bold else 'Eco', fontSize=size, leading=size*1.48, textColor=color)
    p = Paragraph(text, s); _, h = p.wrap(width, 700); p.drawOn(c, x, y-h); return y-h

def label(c, text, y):
    c.setFillColor(GREEN); c.setFont('EcoBold', 9); c.drawString(M, y, text.upper())

def page(c, number, title, kicker='TEACHER PLANNING GUIDE'):
    c.setFillColor(GREEN); c.rect(0,H-12,W,12,fill=1,stroke=0)
    label(c, 'EcoWise Italy  /  Piemonte, Italy', H-43)
    c.setStrokeColor(HexColor('#d7e0d5')); c.line(M,H-59,W-M,H-59)
    label(c,kicker,H-88)
    y=para(c,title,M,H-107,W-2*M,28,GREEN,True)-24
    c.setFont('Eco',8); c.setFillColor(GREY)
    c.drawString(M,29,'ecowiseitaly.com  |  schools@ecowiseitaly.com  |  +39 342 136 3274')
    c.drawRightString(W-M,29,str(number))
    c.linkURL(URL,(M,22,W-M,40),relative=0)
    return y

def heading(c,text,y):
    return para(c,text,M,y,W-2*M,16,GREEN,True)-10

def bullet(c,text,y):
    c.setFillColor(GREEN); c.circle(M+3,y-7,2.5,fill=1,stroke=0)
    return para(c,text,M+16,y,W-2*M-16)-12

def photo(c, filename, x,y,w,h):
    im=Image.open(PHOTOS/filename).convert('RGB'); im.thumbnail((1400,1400)); iw,ih=im.size
    encoded=BytesIO(); im.save(encoded,format='JPEG',quality=83,optimize=True); encoded.seek(0)
    scale=max(w/iw,h/ih); dw,dh=iw*scale,ih*scale
    c.saveState(); p=c.beginPath(); p.rect(x,y-h,w,h); c.clipPath(p,stroke=0)
    c.drawImage(ImageReader(encoded),x+(w-dw)/2,y-h+(h-dh)/2,dw,dh); c.restoreState()

def cta(c,y,title='Start with a conversation',body=None):
    c.setFillColor(GREEN); c.roundRect(M,y-125,W-2*M,125,12,fill=1,stroke=0)
    para(c,title,M+20,y-18,W-2*M-40,18,white,True)
    para(c,body or 'Tell Adam your school, pupil ages, group size, preferred dates and learning aims. He replies personally within 24 hours.',M+20,y-48,W-2*M-40,10.4,white)
    para(c,'<link href="'+URL+'" color="#f3d84b">Explore the programme and request a proposal</link>',M+20,y-94,W-2*M-40,10.5,YELLOW,True)
    return y-145

def finish(c): c.showPage()

def teacher():
    c=canvas.Canvas(str(OUT/'ecowise-italy-teacher-planning-pack.pdf'),pagesize=(W,H)); c.setTitle('EcoWise Italy - Teacher planning guide'); c.setAuthor('EcoWise Italy')
    y=page(c,1,'Bring learning<br/>into the landscape.')
    y=para(c,'A practical guide to planning a tailored school residential in Piemonte, north-west Italy.',M,y,W-2*M,13,GREY)-24
    photo(c,'04-img_7740.webp',M,y,W-2*M,255); y-=272
    y=para(c,'Environmental science. Storytelling. Teamwork. Discovery.',M,y,W-2*M,17,GREEN,True)-20
    for text in ['Recommended international format: five days and four nights.', 'Typical class groups: 20-30 pupils; groups of approximately 15-80 considered.', 'Available throughout the year. Dates and programme fit are confirmed with Adam.']:
        y=bullet(c,text,y)
    cta(c,y-8); finish(c)

    y=page(c,2,'One landscape.<br/>Many ways to learn.')
    y=para(c,'Shape the balance around your pupils, curriculum and group aims. Field science can sit alongside creative, sensory and practical experiences.',M,y,W-2*M)-24
    items=[('Science, ecology and environment','Observe habitats, practise field methods and investigate ecological relationships.'),('Service education','Contribute to a locally agreed community or environmental project.'),('Storytelling and drama','Use myth-making, role-play and environmental art to explore place and perspective.'),('Teamwork and challenge','Develop cooperation, practical problem-solving and confidence through shared tasks.'),('Mindfulness and nature awareness','Use attention, observation and sensory discovery to deepen connection with place.'),('Wilderness and ecoliteracy','Explore living systems through sustained outdoor enquiry and group reflection.')]
    for title,body in items:
        y=heading(c,title,y); y=para(c,body,M,y,W-2*M)-19
    y=heading(c,'Useful learning outcomes',y-3)
    para(c,'Discuss evidence, choose and review methods, communicate findings, work as a group and connect classroom ideas to real landscapes. The exact objectives and level are agreed with the school.',M,y,W-2*M)
    finish(c)

    y=page(c,3,'A five-day journey')
    y=para(c,'An illustrative five-day/four-night structure, not a fixed itinerary. Adam adapts the locations, methods and sequence to your pupils, season, weather and learning aims.',M,y,W-2*M)-28
    days=[('01','Arrive and connect','Meet the team and landscape, establish group expectations and begin observation and place-based enquiry.'),('02','Explore habitats','Investigate suitable terrestrial or aquatic environments. Practise observation, recording and agreed field methods.'),('03','Investigate and interpret','Develop a focused question, collect appropriate data, discuss limitations and make sense of findings together.'),('04','Create and collaborate','Combine deeper enquiry with teamwork, practical challenges, storytelling or environmental art, as agreed.'),('05','Reflect and bring it home','Share discoveries, review learning and agree how pupils will use the experience back at school before departure.')]
    for n,title,body in days:
        c.setFillColor(YELLOW); c.roundRect(M,y-33,38,33,7,fill=1,stroke=0)
        para(c,n,M+8,y-6,25,16,GREEN,True)
        yy=para(c,title,M+55,y,W-2*M-55,15,GREEN,True)-7
        yy=para(c,body,M+55,yy,W-2*M-55); y=yy-28
    para(c,'Shorter visits, seven-day/six-night residentials and multi-week programmes can also be discussed. International travel arrangements may affect the time available for activities.',M,y,W-2*M,9.5,GREY)
    finish(c)

    y=page(c,4,'Field science in practice', 'PROGRAMME EXAMPLE')
    y=para(c,'Beau Soleil College',M,y,W-2*M,19,GREEN,True)-14
    y=para(c,'EcoWise Italy publicly documented its tenth annual environmental science and field sampling trip with Beau Soleil College in October 2026.',M,y,W-2*M,12)-24
    photo(c,'10-img_6782.webp',M,y,W-2*M,205); y-=216
    y=para(c,'Representative EcoWise Italy fieldwork photograph; not identified as the Beau Soleil trip.',M,y,W-2*M,8,GREY)-24
    for text in ['Five days of intensive, interdisciplinary science.', 'Established field methods for sampling terrestrial and aquatic environments.', 'Data collection for students\' DP internal assessment projects in biology and environmental studies.']:
        y=bullet(c,text,y)
    y=heading(c,'What this can mean for your school',y-5)
    y=para(c,'A focused residential can create sustained time for practical investigation and theoretical learning. Discuss your assessment requirements and appropriate activities directly with Adam; the school retains responsibility for assessment decisions.',M,y,W-2*M)-18
    para(c,'<link href="'+POST+'" color="#234a35">Read the original EcoWise Italy trip report on Facebook</link>',M,y,W-2*M,10,GREEN,True)
    finish(c)

    y=page(c,5,'Planning made clearer')
    for title,body in [('EcoWise Italy','Designs and delivers the educational programme, selects the site, checks availability and books accommodation and food on the school\'s behalf. This coordination is included in its service, with no extra EcoWise coordination fee.'),('Your school','Shares the group details, approves the programme and bookings, arranges main travel and maintains its supervision and insurance arrangements. EcoWise Italy may coordinate local transport where agreed.'),('Separate payments','For direct bookings, the school normally pays three invoices: the EcoWise programme; accommodation and food; and travel. A school-travel operator may instead package the trip and pay suppliers.'),('Insurance and planning evidence','EcoWise Italy holds public liability insurance and can provide evidence privately during planning. It does not provide travel insurance. Request the relevant programme, risk, safeguarding and cancellation information during planning.'),('Group size and adults','A usual planning ratio is one accompanying adult for every 10 pupils. Confirm the exact staffing for the ages, activity and location; this is not a universal ratio for every programme.'),('Dates and price','Delivery is available year-round. November-March often offers more flexibility. Every date requires a calendar check and every programme receives a bespoke per-person quote.')]:
        y=heading(c,title,y); y=para(c,body,M,y,W-2*M)-23
    para(c,'EcoWise Italy is the specialist educational provider, not an ATOL-protected travel organiser. Confirm any package protection and travel insurance with your travel provider.',M,y,W-2*M,9,GREY)
    finish(c)

    y=page(c,6,'Your first planning conversation')
    y=para(c,'You do not need a complete trip brief. These details are enough to start a useful conversation with Adam.',M,y,W-2*M,12)-26
    for title,body in [('School and contact','School name, country, your role and the best email or phone number.'),('Your group','Pupil ages or year groups, estimated number of pupils and accompanying adults.'),('Dates and duration','Preferred dates or season, date flexibility and how long you would like to stay.'),('Learning priorities','Science or fieldwork objectives, assessment context, teamwork, creativity or another programme focus.'),('Practical requirements','Any initial access or dietary planning questions. Do not send pupil names or sensitive medical information in the first enquiry.')]:
        y=heading(c,title,y); y=para(c,body,M,y,W-2*M)-23
    y=cta(c,y-2,'Tell Adam what you have in mind')
    para(c,'Email: <link href="mailto:schools@ecowiseitaly.com">schools@ecowiseitaly.com</link><br/>Phone / WhatsApp: +39 342 136 3274<br/>Via Mazzini 97, 14020 Aramengo, Asti, Italy',M,y,W-2*M,10,GREY)
    c.save()

def partner():
    c=canvas.Canvas(str(OUT/'ecowise-italy-school-travel-partner-brief.pdf'),pagesize=(W,H)); c.setTitle('EcoWise Italy - School travel partner brief'); c.setAuthor('EcoWise Italy')
    y=page(c,1,'A specialist education<br/>partner in Piemonte', 'SCHOOL TRAVEL PARTNER BRIEF')
    y=para(c,'Tailored outdoor education and field science, delivered locally for school groups travelling with your organisation.',M,y,W-2*M,12,GREY)-22
    photo(c,'09-img_6719.webp',M,y,W-2*M,200); y-=220
    for title,body in [('The programme','Environmental science and ecology, field investigation, storytelling, environmental art, nature awareness, teamwork and practical challenge. More than 20 years of programme experience.'),('The evidence','EcoWise Italy publicly documented its tenth annual five-day science and field sampling trip with Beau Soleil College in October 2026, including data collection for DP biology and environmental studies projects.'),('The fit','Typical classes of 20-30, groups of approximately 15-80 considered. Five days/four nights recommended for international schools; shorter and multi-week options. Year-round delivery, subject to calendar and programme confirmation.')]:
        y=heading(c,title,y); y=para(c,body,M,y,W-2*M)-20
    para(c,'<link href="'+URL+'" color="#234a35">Programme overview</link>  |  <link href="'+POST+'" color="#234a35">Public trip report</link>',M,y,W-2*M,10,GREEN,True)
    finish(c)
    y=page(c,2,'Build the right trip together', 'PARTNERSHIP CONVERSATION')
    for title,body in [('EcoWise Italy can contribute','Programme design and educational delivery, site selection, local knowledge, and coordination of accommodation and food bookings. Local transport coordination can be discussed.'),('Your operator role','Where agreed and within your own permissions, arrange and contract the travel/package, manage the school booking relationship and supplier payments, and provide the school with the applicable protection and travel information.'),('Agree before offering the programme','Learning outcomes and ages; group capacity and staffing; season and sites; net programme quote; accommodation/food model; responsibilities; insurance and risk documentation; cancellation terms; and who communicates with the school.'),('Commercial conversation','Adam is open to discussing a referral or supplier partnership. Rates, commissions, payment triggers and responsibilities are agreed directly before any offer is made. No commission percentage or exclusivity is pre-agreed.'),('Clear boundaries','EcoWise Italy holds public liability insurance and can supply evidence privately during due diligence. It does not provide travel insurance or hold an ATOL licence. The partner must confirm the scope of any package it offers.')]:
        y=heading(c,title,y); y=para(c,body,M,y,W-2*M)-18
    cta(c,y-3,'Discuss a programme partnership','Share your school-travel portfolio, the programmes you want to develop and the best person for Adam to speak with. He replies personally within 24 hours.')
    c.save()

teacher(); partner()
print('Built teacher guide (6 pages) and partner brief (2 pages).')
