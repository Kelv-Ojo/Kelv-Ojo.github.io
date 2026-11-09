const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sandbox={module:{exports:{}}};
require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'dashboard-core.js'),'utf8'),sandbox);
const core=sandbox.module.exports;
const data=Object.fromEntries(['hotel','sales','churn','energy'].map(k=>[k,JSON.parse(fs.readFileSync(path.join(__dirname,'dashboard-data',k+'.json')))]));
const cases=JSON.parse(fs.readFileSync(path.join(__dirname,'dashboard-data/acceptance-cases.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'dashboard-data/manifest.json')));
for(const [file,expected] of Object.entries(manifest.files))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file))).digest('hex'),expected,file);
for(const item of cases){
  const actual=core.view(data[item.kind],item.state).summary;
  for(const [key,expected] of Object.entries(item.expected)){
    if(expected===null) assert.equal(actual[key],null,JSON.stringify(item.state));
    else assert.ok(Math.abs(actual[key]-expected)<=Math.max(1e-7,Math.abs(expected)*1e-10),`${item.kind} ${key} ${JSON.stringify(item.state)}: ${actual[key]} != ${expected}`);
  }
}
for(const [kind,source] of Object.entries(data)){
  for(const [group] of Object.entries(source.dimensions)){
    if(kind==='energy')continue;
    for(const metric of Object.keys(source.metrics)){
      const view=core.view(source,{group,metric});
      assert.ok(view.bars.every(r=>r.value===null||Number.isFinite(r.value)));
      assert.ok(view.timeline.every(r=>r.value===null||Number.isFinite(r.value)));
      for(const bar of view.bars){
        const selected=core.view(source,{filters:{[group]:bar.label},metric});
        assert.equal(selected.summary[metric],bar.value);
      }
    }
  }
  if(source.range){
    assert.equal(core.view(source,{start:'9999',end:'0000'}).invalid,true);
    assert.equal(core.view(source,{start:'',end:source.range[1]}).invalid,true);
    assert.equal(core.view(source,{start:'9999',end:'9999'}).rows.length,0);
  }
}
assert.equal(core.view(data.hotel,{start:'2015-07',end:'2015-07'}).summary.bookings,2776);
assert.ok(core.view(data.energy,{sector:'Transport'}).rows.every(r=>r.sector==='Transport'));
assert.equal(core.view(data.energy,{sector:'Transport'}).bars.length,1);
assert.equal(core.view(data.hotel,{start:'2016-01',end:'2016-12',filters:{hotel:'City Hotel'}}).summary.bookings,38140);
const emptyMonths=core.view(data.hotel,{start:'2016-01',end:'2016-12',filters:{channel:'Undefined'},metric:'bookings'});
assert.equal(emptyMonths.timeline.length,12);
assert.ok(emptyMonths.timeline.every(r=>r.value===0));
assert.ok(core.view(data.hotel,{start:'2016-01',end:'2016-12',filters:{channel:'Undefined'},metric:'rate'}).timeline.every(r=>r.value===null));
const sales=core.view(data.sales);
assert.equal(sales.summary.orders,5026);
assert.ok(core.view(data.sales,{group:'category'}).bars.reduce((n,r)=>n+r.orders,0)>sales.summary.orders,'Distinct orders must not be summed across categories without deduplication');
assert.equal(core.view(data.churn,{filters:{contract:'Month-to-month',tenure:'0–12 months'}}).summary.customers,1994);
assert.equal(core.totals('churn',[]).rate,null);
assert.equal(JSON.stringify(core.wilson(0,0)),JSON.stringify([null,null]));
const ci=core.wilson(1655,3875);assert.ok(Math.abs(ci[0]*100-41.160167011245555)<1e-9);
assert.ok(!core.csv(data.sales.rows).includes('"orders"'));
assert.ok(!JSON.stringify(data).includes('Customer Name'));
console.log(`Passed ${cases.length} independent source fixtures, every measure/group drilldown, empty/range cases, Wilson intervals and distinct-order deduplication.`);
