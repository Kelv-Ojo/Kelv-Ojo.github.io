from pathlib import Path
import urllib.request,csv,io
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parent
def render(filename,title,labels,values,dark=False):
 ink="#f0f1ee" if dark else "#172238";grid="#445168" if dark else "#deded9"
 n=len(values);xs=[112,302] if n==2 else [84,222,360];w=70 if n==2 else 54
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 315" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">Flat column comparison on a shared zero baseline. '+escape("; ".join(f"{a}: {v:.1f}%" for a,v in zip(labels,values)))+'. Bar heights encode percentages on a shared zero baseline.</desc>']
 if dark:parts.append('<rect width="480" height="315" fill="#172238"/>')
 parts.append(f'<text x="20" y="27" fill="{ink}" font-family="Arial,sans-serif" font-size="19" font-weight="600">{escape(title)}</text>')
 for tick in range(0,51,10):
  y=245-tick*3.6
  parts.append(f'<path d="M50 {y}H455" stroke="{grid}" stroke-width="1"/><text x="39" y="{y+5}" text-anchor="end" fill="{ink}" font-family="Arial,sans-serif" font-size="14">{tick}%</text>')
 palettes=[("#c9a967","#8c6d35","#ead7af"),("#91a5bd","#526b89","#c3cfdd"),("#526b89","#30445f","#8da4bf")]
 for i,(label,val,x) in enumerate(zip(labels,values,xs)):
  y=245-val*3.6;front,side,top=palettes[i];d=0
  parts.append(f'<path d="M{x+w} {y}l{d} -{d}V{245-d}l-{d} {d}Z" fill="{side}"/><path d="M{x} {y}l{d} -{d}h{w}l-{d} {d}Z" fill="{top}"/><rect x="{x}" y="{y}" width="{w}" height="{val*3.6}" fill="{front}"/><text x="{x+w/2+5}" y="{y-21}" text-anchor="middle" fill="{ink}" font-family="Arial,sans-serif" font-size="22" font-weight="700">{val:.1f}%</text>')
  for j,line in enumerate(label.split("|")):
   parts.append(f'<text x="{x+w/2+5}" y="{274+j*20}" text-anchor="middle" fill="{ink}" font-family="Arial,sans-serif" font-size="16">{escape(line)}</text>')
 parts.append('</svg>');(ROOT/"assets"/filename).write_text("".join(parts))
# Rounded hotel rates already reported in the linked SQL case study.
render("hotel-columns.svg","Cancellation rates by hotel",["City Hotel","Resort Hotel"],[41.7,27.8],True)
# Churn values are read directly from the repository's reproducible SQL summary.
url="https://raw.githubusercontent.com/Kelv-Ojo/telco-churn-analysis/main/reports/contract_summary.csv"
rows=list(csv.DictReader(io.StringIO(urllib.request.urlopen(url).read().decode())))
assert sum(int(r["customers"]) for r in rows)==7043
values=[float(r["churn_pct"]) for r in rows]
assert all(0<=v<=50 for v in values)
render("churn-columns.svg","Churn by contract type",["Month-to-|month","One year","Two year"],values)
print("Rendered hotel and churn columns from documented project values.")
