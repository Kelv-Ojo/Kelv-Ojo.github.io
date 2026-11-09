(function() {
  'use strict';
  const Core = window.PortfolioData, cache = new Map();
  const names = {hotel:'hotel.html', sales:'sales.html', churn:'churn.html', energy:'energy.html'};
  let sequence = 0;
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function format(value, key) {
    if (value === null || value === undefined || !Number.isFinite(value)) return 'Not available';
    if (['rate','margin','change'].includes(key)) return (value*100).toLocaleString('en-GB',{maximumFractionDigits:1})+'%';
    return value.toLocaleString('en-GB',{maximumFractionDigits:['bookings','customers','churned','canceled','checked_out','no_shows','orders','lines'].includes(key)?0:2});
  }
  async function getData(kind) {
    if (!cache.has(kind)) cache.set(kind, fetch('demos/dashboard-data/'+kind+'.json').then(response=>{
      if (!response.ok) throw new Error('The dashboard data could not be loaded. Please use the project links or retry.');
      return response.json();
    }));
    return cache.get(kind);
  }
  async function mount(root) {
    const kind = root.dataset.dashboard, compact = root.hasAttribute('data-compact'), prefix = 'dashboard-'+(++sequence);
    root.setAttribute('aria-busy','true'); root.setAttribute('data-ui','');
    const loading = node('p','Loading verified project data…');root.append(loading);
    try {
      const data = await getData(kind);
      root.setAttribute('role','region');root.setAttribute('aria-label',data.title+(compact?' interactive preview':''));
      if(window.Chart) Chart.defaults.font.family=getComputedStyle(root).fontFamily;
      const state = {filters:{},start:data.range?.[0]||'',end:data.range?.[1]||'',metric:data.defaultMetric,group:data.defaultGroup,sector:'All final users',unit:'ktoe'};
      const charts = [], controls = new Map();let downloadURL;
      const heading = node(compact?'p':'h2',compact?'Explore the data':data.title,'dashboard-title');
      const provenance = node('p',compact?(kind==='energy'?'Verified historical data.':'Web preview from verified exports.')+' Filters change this chart; project text retains its original scope.':data.note+' Dashboard filters change this view; written findings retain their original scopes.','dashboard-note');
      const form = node('form',undefined,'dashboard-controls');form.addEventListener('submit',event=>event.preventDefault());
      const summary = node('dl',undefined,'dashboard-summary');
      const status = node('p',undefined,'dashboard-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      const chartsWrap = node('div',undefined,'dashboard-charts');
      const primary = node('div',undefined,'dashboard-chart'), secondary = node('div',undefined,'dashboard-chart');
      const chartTitle = node('h3'), lineTitle = node('h3');
      const canvasBox = node('div',undefined,'dashboard-canvas'), lineBox = node('div',undefined,'dashboard-canvas');
      const canvas = node('canvas'), line = node('canvas');
      [canvas,line].forEach(c=>{c.setAttribute('role','img');c.textContent='Use the filter controls and data table below for the same values.';});
      canvasBox.append(canvas);lineBox.append(line);primary.append(chartTitle,canvasBox);secondary.append(lineTitle,lineBox);chartsWrap.append(primary);
      if (!compact) chartsWrap.append(secondary);
      const actions = node('div',undefined,'dashboard-actions');
      const reset = node('button','Reset filters');reset.type='button';reset.addEventListener('click',()=>{
        Object.assign(state,{filters:{},start:data.range?.[0]||'',end:data.range?.[1]||'',metric:data.defaultMetric,group:data.defaultGroup,sector:'All final users',unit:'ktoe'});sync();render();
      });form.append(reset);
      const download = node('a','Download filtered aggregates (CSV)');download.download=kind+'-filtered-aggregates.csv';
      const detail = node('details',undefined,'dashboard-data');detail.append(node('summary',compact?'Chart values and keyboard selections':'Chart values and accessible category selection'));
      const tableWrap = node('div',undefined,'table-scroll');tableWrap.tabIndex=0;tableWrap.setAttribute('role','region');tableWrap.setAttribute('aria-label',data.title+' chart values');
      const table = node('table');const caption = node('caption');table.append(caption);tableWrap.append(table);detail.append(tableWrap);
      const choiceControls = node('div',undefined,'dashboard-category-buttons');detail.append(choiceControls);
      function select(label, key, options, current, change) {
        const wrapper = node('label',label), input = node('select');input.id=prefix+'-'+key;
        input.setAttribute('aria-label',label);
        for (const [value,text] of options) {const option=node('option',text);option.value=value;input.append(option);}
        input.value=current||'';wrapper.htmlFor=input.id;wrapper.append(input);form.insertBefore(wrapper,reset);
        input.addEventListener('change',()=>{change(input.value);render();});controls.set(key,input);return input;
      }
      function period(label,key) {
        const wrapper=node('label',label),input=node('input');input.type=kind==='energy'?'number':'month';input.id=prefix+'-'+key;
        input.setAttribute('aria-label',label);
        input.min=data.range[0];input.max=data.range[1];input.value=state[key];input.required=true;
        wrapper.htmlFor=input.id;wrapper.append(input);form.insertBefore(wrapper,reset);controls.set(key,input);
        const updatePeriod=()=>{state[key]=input.value;render();};
        input.addEventListener('input',updatePeriod);input.addEventListener('change',updatePeriod);
      }
      if (kind==='energy') {
        select('Sector','sector', [...new Set(data.rows.map(r=>r.sector))].map(s=>[s,s]),state.sector,value=>state.sector=value);
        if (!compact) select('Units','unit',[['ktoe','ktoe'],['TWh','TWh']],state.unit,value=>state.unit=value);
      } else {
        const dimensions = Object.entries(data.dimensions);
        const compactDimension = kind==='hotel'?'channel':kind==='sales'?'category':'tenure';
        for (const [key,label] of dimensions) {
          if (compact && key!==compactDimension) continue;
          select(label,key,[['','All'],...[...new Set(data.rows.map(r=>r[key]))].sort().map(v=>[v,v])],state.filters[key],value=>state.filters[key]=value);
        }
        if (!compact) {
          select('Measure','metric',Object.entries(data.metrics),state.metric,value=>state.metric=value);
          select('Break down by','group',dimensions.map(([key,label])=>[key,label]),state.group,value=>state.group=value);
        }
      }
      if (!compact && data.range) {period(kind==='energy'?'From year':'From month','start');period(kind==='energy'?'To year':'To month','end');}
      if (!compact) {
        actions.append(download);
        for (const [text,href] of Object.entries(data.links)) {const link=node('a',text+' ↗');link.href=href;actions.append(link);}
      } else {const link=node('a','Open interactive dashboard →');link.href=names[kind]+'#interactive-dashboard';actions.append(link);}
      root.replaceChildren(heading,provenance,form);
      if (!compact) root.append(summary);
      root.append(status,chartsWrap,detail,actions);
      function sync() {
        for (const [key,input] of controls) input.value=['metric','group','start','end','sector','unit'].includes(key)?state[key]:(state.filters[key]||'');
      }
      function choose(label) {
        const keyboard = document.activeElement?.tagName === 'BUTTON';
        if (kind==='energy') state.sector=label;
        else state.filters[state.group]=state.filters[state.group]===label?'':label;
        sync();render();
        if(keyboard) (controls.get(kind==='energy'?'sector':state.group)||reset).focus();
      }
      function chart(target, values, title, type, onClick) {
        if (!window.Chart) return;
        const isPercent=['rate','margin'].includes(state.metric);
        const chart = new Chart(target,{type,data:{labels:values.map(r=>r.label),datasets:[{
          label:title,data:values.map(r=>r.value===null?null:r.value*(isPercent?100:1)),
          backgroundColor:'#326d9c',borderColor:'#326d9c',borderWidth:type==='line'?2:0,pointRadius:compact?2:3,tension:0,fill:false
        }]},options:{responsive:true,maintainAspectRatio:false,animation:false,
          interaction:{mode:'index',intersect:false},
          onClick:(_event,elements)=>{if (onClick&&elements.length) onClick(values[elements[0].index].label);},
          plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>{
            const row=values[context.dataIndex];let text=format(row.value,state.metric)+(isPercent?'':'');
            if (row.customers!==undefined) {text+=' · n='+row.customers.toLocaleString('en-GB');if(state.metric==='rate'){const ci=Core.wilson(row.churned,row.customers);text+=' · Wilson interval '+format(ci[0],'rate')+' to '+format(ci[1],'rate');}}
            if (row.bookings!==undefined&&state.metric!=='bookings') text+=' · '+row.bookings.toLocaleString('en-GB')+' bookings';return text;
          }}}},scales:{x:{grid:{display:false},ticks:{maxRotation:compact?20:35,maxTicksLimit:compact?5:12}},y:{beginAtZero:type==='bar'||kind!=='energy',title:{display:!compact,text:isPercent?'Percent':kind==='energy'?state.unit:state.metric==='sales'||state.metric==='profit'||state.metric==='aov'?'Source currency units':data.metrics[state.metric]},ticks:{maxTicksLimit:5}}}}});
        charts.push(chart);
      }
      function render() {
        while(charts.length) charts.pop().destroy();
        const view=Core.view(data,state), hasRows=view.rows.length>0;
        const selected=kind==='energy'?'Sector: '+state.sector:Object.entries(state.filters).filter(([,value])=>value).map(([key,value])=>data.dimensions[key]+': '+value).join('; ');
        status.textContent=view.invalid?'Choose both boundaries, with the start before or equal to the end.':!hasRows?'No observations match these filters. Reset filters to restore the full dataset.':
          (selected||'All categories')+(data.range?' · '+state.start+' to '+state.end:'')+(kind==='churn'&&view.summary.customers<50?' · Small group: fewer than 50 customers; interpret cautiously.':'');
        if (!window.Chart) status.textContent+=' Charts unavailable; use the working filters and accessible values below.';
        summary.replaceChildren();
        const labels=kind==='hotel'?{bookings:'Bookings',checked_out:'Checked out',canceled:'Cancellation flags',rate:'Cancellation rate'}:
          kind==='sales'?{sales:'Sales (source units)',profit:'Profit (source units)',orders:'Distinct orders',margin:'Source profit margin'}:
          kind==='churn'?{customers:'Customers',churned:'Churned',rate:'Churn proportion',charges:'Average monthly charge (source units)'}:
          {first:'First selected year ('+state.unit+')',last:'Last selected year ('+state.unit+')',change:'Change across selection'};
        for(const [key,label] of Object.entries(labels)){const part=node('div');part.append(node('dt',label),node('dd',view.invalid?'Not available':format(view.summary[key],key)));summary.append(part);}
        chartTitle.textContent=kind==='energy'?(compact?state.sector+' over time ('+state.unit+')':'Sector consumption in '+(view.timeline.at(-1)?.label||'the last selected year')+' ('+state.unit+')'):data.metrics[state.metric]+' by '+data.dimensions[state.group].toLowerCase();
        lineTitle.textContent=kind==='energy'?state.sector+' over time':kind==='churn'?data.metrics[state.metric]+' by tenure band':data.metrics[state.metric]+(kind==='hotel'?' by arrival month':' by order month');
        canvas.setAttribute('aria-label',chartTitle.textContent+'. Exact values and keyboard category buttons follow.');
        line.setAttribute('aria-label',lineTitle.textContent+'. Exact values follow.');
        const displayed=kind==='energy'&&compact?view.timeline:view.bars;
        chart(canvas,displayed,chartTitle.textContent,kind==='energy'&&compact?'line':'bar',kind==='energy'&&compact?null:choose);
        if(!compact) chart(line,view.timeline,lineTitle.textContent,kind==='churn'?'bar':'line',null);
        caption.textContent=chartTitle.textContent+'; filtered values'+(kind==='churn'?'. Wilson intervals are illustrative.':'');
        table.replaceChildren(caption);choiceControls.replaceChildren();
        const head=node('thead'),header=node('tr');
        const columns=kind==='hotel'?['label','bookings','canceled','checked_out','rate']:kind==='sales'?['label','sales','profit','orders','margin']:kind==='churn'?['label','customers','churned','rate','ci_low','ci_high']:['label','value'];
        for(const key of columns){const th=node('th',key==='label'?'Category':key==='value'?state.unit:key==='ci_low'?'Wilson lower':key==='ci_high'?'Wilson upper':(data.metrics[key]||key.replaceAll('_',' ')));th.scope='col';header.append(th);}head.append(header);table.append(head);
        const body=node('tbody');
        for(const row of displayed){const tr=node('tr');const ci=kind==='churn'?Core.wilson(row.churned,row.customers):[];for(const key of columns)tr.append(node('td',key==='label'?row.label+(kind==='churn'&&row.customers<50?' (small group)':''):key==='ci_low'?format(ci[0],'rate'):key==='ci_high'?format(ci[1],'rate'):format(row[key],key)));body.append(tr);}
        for(const row of view.bars){const button=node('button',(kind==='energy'?'Show ':'Filter ')+row.label);button.type='button';button.addEventListener('click',()=>choose(row.label));choiceControls.append(button);}
        table.append(body);
        if(!compact){const timeline=node('details');timeline.append(node('summary',kind==='churn'?'Tenure chart values':'Time-series chart values'));const t=node('table');t.append(node('caption',lineTitle.textContent));const th=node('thead'),h=node('tr');for(const label of ['Period / group','Value']){const c=node('th',label);c.scope='col';h.append(c);}th.append(h);t.append(th);const tb=node('tbody');for(const r of view.timeline){const tr=node('tr');tr.append(node('td',r.label),node('td',format(r.value,state.metric)));tb.append(tr);}t.append(tb);timeline.append(t);tableWrap.replaceChildren(table,timeline);}
        if(downloadURL) URL.revokeObjectURL(downloadURL);
        downloadURL=URL.createObjectURL(new Blob([Core.csv(view.rows)],{type:'text/csv;charset=utf-8'}));download.href=downloadURL;
        download.setAttribute('aria-disabled',view.invalid||!hasRows?'true':'false');download.hidden=view.invalid||!hasRows;
        root.setAttribute('aria-busy','false');root.dataset.ready='true';
      }
      render();
    } catch(error) {
      const message=node('p',error.message);message.setAttribute('role','alert');root.replaceChildren(message);const retry=node('button','Retry dashboard');retry.type='button';retry.addEventListener('click',()=>{cache.delete(kind);root.replaceChildren();mount(root);});root.append(retry);root.setAttribute('aria-busy','false');
    }
  }
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){observer.unobserve(entry.target);mount(entry.target);}
  }),{rootMargin:'300px'});
  document.querySelectorAll('[data-dashboard]').forEach(root=>observer.observe(root));
})();
