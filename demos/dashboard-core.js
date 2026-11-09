/* Pure calculations shared by the browser and independent source-fixture tests. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortfolioData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function filter(data, state = {}) {
    if (state.start && state.end && state.start > state.end) return [];
    return data.rows.filter(row => (!state.start || row.period >= state.start) &&
      (!state.end || row.period <= state.end) &&
      Object.entries(state.filters || {}).every(([key, value]) => !value || row[key] === value));
  }
  const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] || 0), 0);
  const ratio = (a, b) => b ? a / b : null;
  function totals(kind, rows) {
    if (kind === 'hotel') {
      const bookings = sum(rows, 'bookings'), canceled = sum(rows, 'canceled');
      return {bookings, canceled, checked_out: sum(rows, 'checked_out'), no_shows: sum(rows, 'no_shows'), rate: ratio(canceled, bookings)};
    }
    if (kind === 'sales') {
      const sales = sum(rows, 'sales'), profit = sum(rows, 'profit');
      const orders = new Set(rows.flatMap(row => row.orders)).size;
      return {sales, profit, orders, lines: sum(rows, 'lines'), margin: ratio(profit, sales), aov: ratio(sales, orders)};
    }
    if (kind === 'churn') {
      const customers = sum(rows, 'customers'), churned = sum(rows, 'churned');
      return {customers, churned, rate: ratio(churned, customers), charges: ratio(sum(rows, 'charges'), customers)};
    }
    return {};
  }
  function wilson(k, n) {
    if (!n) return [null, null];
    const z = 1.96, p = k / n, den = 1 + z * z / n;
    const centre = (p + z * z / (2 * n)) / den;
    const half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den;
    return [centre - half, centre + half];
  }
  function group(kind, rows, dimension, metric) {
    const groups = new Map();
    for (const row of rows) {
      if (!groups.has(row[dimension])) groups.set(row[dimension], []);
      groups.get(row[dimension]).push(row);
    }
    return [...groups].sort(([a], [b]) => String(a).localeCompare(String(b), 'en', {numeric:true})).map(([label, values]) => {
      const aggregate = totals(kind, values);
      return {label, value: aggregate[metric], ...aggregate};
    });
  }
  function view(data, state = {}) {
    const invalid = Boolean(state.start && state.end && state.start > state.end) || Boolean(data.range && (state.start === '' || state.end === ''));
    const rows = invalid ? [] : filter(data, state);
    if (data.kind === 'energy') {
      const sector = state.sector || 'All final users', factor = state.unit === 'TWh' ? 0.01163 : 1;
      const series = rows.filter(r => r.sector === sector).sort((a,b) => a.period.localeCompare(b.period));
      const first = series[0], last = series.at(-1);
      const selectedRows=sector==='All final users'?rows:rows.filter(r=>r.sector===sector);
      const bars = selectedRows.filter(r => r.period === last?.period && r.sector !== 'All final users').map(r => ({label:r.sector, value:r.value*factor}));
      return {invalid, rows:selectedRows, summary:{first:first ? first.value*factor : null, last:last ? last.value*factor : null,
        change:first && last ? last.value/first.value-1 : null}, bars,
        timeline:series.map(r=>({label:r.period,value:r.value*factor})), metric:'value', group:'sector', sector};
    }
    const metric = state.metric || data.defaultMetric, dimension = state.group || data.defaultGroup;
    let timeline=group(data.kind, rows, data.kind === 'churn' ? 'tenure' : 'period', metric);
    if(data.kind!=='churn'&&!invalid){
      const observed=new Map(timeline.map(r=>[r.label,r]));
      const periods=[...new Set(data.rows.map(r=>r.period))].filter(p=>(!state.start||p>=state.start)&&(!state.end||p<=state.end)).sort();
      const empty=totals(data.kind,[]);
      timeline=periods.map(p=>observed.get(p)||{label:p,value:empty[metric],...empty});
    }
    return {invalid, rows, metric, group:dimension, summary:totals(data.kind, rows),
      bars:group(data.kind, rows, dimension, metric),
      timeline};
  }
  function csv(rows) {
    const columns = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => k !== 'orders');
    const escape = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
    return [columns.map(escape).join(','), ...rows.map(r=>columns.map(k=>escape(r[k])).join(','))].join('\r\n');
  }
  return {filter, totals, group, view, wilson, csv};
});
