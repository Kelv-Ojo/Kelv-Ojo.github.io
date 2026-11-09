"""Export deidentified aggregates and independent calculation fixtures from verified sources.

Run in the portfolio checkout; sibling project checkouts supply original inputs.
No customer identifiers, names, addresses or native report files are modified.
"""
from pathlib import Path
import hashlib
import itertools
import json
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT.parent
OUT = ROOT / 'demos/dashboard-data'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    OUT.mkdir(exist_ok=True)
    datasets = {}
    hotel_root = PROJECTS / 'hotel-booking-analysis'
    hotel = pd.read_csv(hotel_root / 'reports/excel_source.csv').rename(columns={'year_month':'period','distribution_channel':'channel'})
    assert len(hotel) == 176 and hotel.bookings.sum() == 119390 and hotel.canceled.sum() == 44224
    assert (hotel.bookings == hotel.canceled + hotel.checked_out).all()
    assert (hotel.no_shows <= hotel.canceled).all()
    hotel = hotel.drop(columns='year')
    datasets['hotel'] = {'kind':'hotel','title':'Hotel booking dashboard','defaultMetric':'rate','defaultGroup':'hotel',
        'dimensions':{'hotel':'Hotel','channel':'Channel'},
        'metrics':{'bookings':'Bookings','canceled':'Cancellation flags','checked_out':'Checked out','no_shows':'No-shows','rate':'Cancellation rate'},
        'note':'Interactive web representation of verified monthly exports, not an embedded Excel or Power BI report. Arrival months July 2015–August 2017; 2015 and 2017 are partial years. Cancellation flags include no-shows. Bookings are not guests or room-nights.',
        'links':{'Excel workbook':'https://github.com/Kelv-Ojo/hotel-booking-analysis/blob/main/excel/Hotel%20Reporting.xlsx','Reviewed Power BI file':'https://github.com/Kelv-Ojo/hotel-booking-analysis/blob/main/powerbi/Hotel%20Bookings-reviewed-20261108.pbix','GitHub and definitions':'https://github.com/Kelv-Ojo/hotel-booking-analysis'},
        'source_sha256':sha(hotel_root / 'reports/excel_source.csv'),'rows':hotel.to_dict('records')}
    sales_root = PROJECTS / 'Dashboard-sales'
    sales_path = sales_root / 'Sales Overview Data.xlsx'
    expected = json.loads((sales_root / 'reports/metrics.json').read_text())
    assert sha(sales_path) == expected['source_sha256']
    sales = pd.read_excel(sales_path,sheet_name='Sales Data')
    assert len(sales) == expected['rows'] and sales['Order ID'].nunique() == expected['orders']
    assert abs(sales.Sales.sum()-expected['sales_sum']) < 1e-6
    sales['period'] = pd.to_datetime(sales['Order Date']).dt.strftime('%Y-%m')
    sales['order_key'] = pd.factorize(sales['Order ID'])[0]
    sales = sales.rename(columns={'Region':'region','Category':'category','Segment':'segment'})
    exported = []
    for keys, frame in sales.groupby(['period','region','category','segment']):
        exported.append(dict(zip(['period','region','category','segment'],keys),sales=float(frame.Sales.sum()),profit=float(frame.Profit.sum()),lines=len(frame),orders=sorted(map(int,frame.order_key.unique()))))
    datasets['sales'] = {'kind':'sales','title':'Sales dashboard','defaultMetric':'sales','defaultGroup':'region',
        'dimensions':{'region':'Region','category':'Category','segment':'Customer segment'},
        'metrics':{'sales':'Sales','profit':'Source Profit','orders':'Distinct orders','lines':'Order lines','margin':'Source profit margin','aov':'Average order value'},
        'note':'Interactive web representation of verified workbook aggregates, not an embedded Power BI report. January 2021–December 2024; original dates 3 Jan 2021–30 Dec 2024. Currency, upstream publisher and licence remain unverified. Profit retains the source field definition. Distinct orders are counted across selected groups; names, addresses and source identifiers are excluded.',
        'links':{'Power BI report':'https://github.com/Kelv-Ojo/Dashboard-sales/blob/main/salesoverview-reviewed-20261030.pbix','Source workbook':'https://github.com/Kelv-Ojo/Dashboard-sales/blob/main/Sales%20Overview%20Data.xlsx','GitHub and definitions':'https://github.com/Kelv-Ojo/Dashboard-sales'},
        'source_sha256':sha(sales_path),'rows':exported}
    churn_root = PROJECTS / 'telco-churn-analysis'
    churn_path = churn_root / 'data/WA_Fn-UseC_-Telco-Customer-Churn.csv'
    manifest = json.loads((churn_root / 'data/manifest.json').read_text())
    assert sha(churn_path) == manifest[churn_path.name]
    churn = pd.read_csv(churn_path)
    assert churn.customerID.is_unique and len(churn)==7043 and churn.Churn.eq('Yes').sum()==1869
    churn['tenure'] = pd.cut(churn.tenure,[-1,12,24,48,float('inf')],labels=['0–12 months','13–24 months','25–48 months','49+ months']).astype(str)
    churn['churned'] = churn.Churn.eq('Yes').astype(int)
    churn = churn.rename(columns={'Contract':'contract','InternetService':'internet','PaymentMethod':'payment'})
    c = churn.groupby(['contract','tenure','internet','payment']).agg(customers=('churned','size'),churned=('churned','sum'),charges=('MonthlyCharges','sum')).reset_index()
    datasets['churn'] = {'kind':'churn','title':'Telco churn dashboard','defaultMetric':'rate','defaultGroup':'contract',
        'dimensions':{'contract':'Contract','tenure':'Tenure band','internet':'Internet service','payment':'Payment method'},
        'metrics':{'rate':'Churn proportion','customers':'Customers','churned':'Churned customers','charges':'Average monthly charge'},
        'note':'Interactive descriptive analysis of the IBM Telco educational sample. No customer identifiers are exported. This sample has no acquisition/churn dates: tenure filters are not date filters, and churn proportions are not monthly hazards. Small groups are flagged; illustrative Wilson intervals do not establish causality or population representativeness. The 11 blank TotalCharges records remain in customer denominators.',
        'links':{'GitHub and source attribution':'https://github.com/Kelv-Ojo/telco-churn-analysis'},'source_sha256':sha(churn_path),'rows':c.to_dict('records')}
    energy_root = PROJECTS / 'uk-energy-analysis'
    e = pd.read_csv(energy_root/'reports/sector_totals_ktoe.csv')
    energy = e.melt(id_vars='year',var_name='sector',value_name='value').rename(columns={'year':'period'})
    energy['period'] = energy.period.astype(str)
    datasets['energy'] = {'kind':'energy','title':'UK energy dashboard','dimensions':{'sector':'Sector'},'metrics':{'value':'Final consumption'},
        'note':'Verified historical Table C1 consumption, 1970–2024. Choose ktoe or TWh. All final users is the published total; it is not added to its component sectors. This dashboard contains no dissertation model forecasts or renewable-share claims.',
        'links':{'Visual gallery':'energy.html#visual-gallery','GitHub and source attribution':'https://github.com/Kelv-Ojo/uk-energy-analysis'},'source_sha256':sha(energy_root/'reports/sector_totals_ktoe.csv'),'rows':energy.to_dict('records')}
    cases=[]
    # Independent source-frame results, including combined filters and year boundaries.
    for kind, frame in [('hotel',hotel),('sales',sales),('churn',churn)]:
        dims=list(datasets[kind]['dimensions'])
        combinations=itertools.product(*[['']+sorted(frame[d].unique().tolist()) for d in dims])
        for values in combinations:
            filters=dict(zip(dims,values)); selected=frame
            for key,value in filters.items():
                if value:selected=selected[selected[key].eq(value)]
            states=[{}] if kind=='churn' else [{},{'start':'2016-01' if kind=='hotel' else '2024-01','end':'2016-12' if kind=='hotel' else '2024-12'}]
            for period in states:
                sub=selected
                if period:sub=sub[sub.period.between(period['start'],period['end'])]
                if kind=='hotel': result={'bookings':int(sub.bookings.sum()),'canceled':int(sub.canceled.sum()),'checked_out':int(sub.checked_out.sum()),'no_shows':int(sub.no_shows.sum())};result['rate']=result['canceled']/result['bookings'] if result['bookings'] else None
                elif kind=='sales':
                    result={'sales':float(sub.Sales.sum()),'profit':float(sub.Profit.sum()),'lines':len(sub),'orders':int(sub['Order ID'].nunique())}
                    result.update(margin=result['profit']/result['sales'] if result['sales'] else None,aov=result['sales']/result['orders'] if result['orders'] else None)
                else:
                    result={'customers':len(sub),'churned':int(sub.churned.sum()),'charges':float(sub.MonthlyCharges.mean()) if len(sub) else None,'rate':float(sub.churned.mean()) if len(sub) else None}
                cases.append({'kind':kind,'state':{'filters':filters,**period},'expected':result})
    for sector in sorted(energy.sector.unique()):
        for start,end in [('1970','2024'),('2000','2024'),('2024','2024')]:
            series=e[e.year.between(int(start),int(end))][sector]
            for unit in ['ktoe','TWh']:
                factor=.01163 if unit=='TWh' else 1
                cases.append({'kind':'energy','state':{'sector':sector,'start':start,'end':end,'unit':unit},'expected':{'first':float(series.iloc[0]*factor),'last':float(series.iloc[-1]*factor),'change':float(series.iloc[-1]/series.iloc[0]-1)}})
    for kind,data in datasets.items():
        periods=sorted({r['period'] for r in data['rows'] if 'period' in r})
        data['range']=[periods[0],periods[-1]] if periods else None
        (OUT/f'{kind}.json').write_text(json.dumps(data,separators=(',',':'),allow_nan=False)+'\n', encoding='utf-8', newline='\n')
    (OUT/'acceptance-cases.json').write_text(json.dumps(cases,separators=(',',':'),allow_nan=False)+'\n', encoding='utf-8', newline='\n')
    delivery={'acceptance_cases':len(cases),'files':{f'demos/dashboard-data/{kind}.json':sha(OUT/f'{kind}.json') for kind in datasets},
              'sources':{kind:data['source_sha256'] for kind,data in datasets.items()},
              'chart_library':'Chart.js 4.5.1, MIT; self-hosted with its licence'}
    delivery['files']['demos/dashboard-data/acceptance-cases.json']=sha(OUT/'acceptance-cases.json')
    delivery['files']['demos/vendor/chart.umd.min.js']=sha(ROOT/'demos/vendor/chart.umd.min.js')
    (OUT/'manifest.json').write_text(json.dumps(delivery,indent=2)+'\n', encoding='utf-8', newline='\n')
    print(f'Exported four verified aggregate datasets and {len(cases)} independent cross-filter acceptance cases.')


if __name__=='__main__':main()
