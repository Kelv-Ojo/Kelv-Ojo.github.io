# Interactive portfolio dashboards

The homepage now contains working chart previews for Hotel, Sales, Churn and UK Energy. Each corresponding case study opens a larger dashboard with filters, recalculated summaries, hover tooltips, chart category selection, reset, exact-value tables and filtered aggregate CSV export. Existing screenshots, case studies, the dissertation gallery, original workbook/report links and the earlier explorer remain available.

These are **interactive web representations**, not embedded Excel or Power BI sessions. Native report measures, refresh and interactions are not executed in a browser. Native Excel verification remains a separate outstanding roadmap task.

## Available controls and verified scope

| Dashboard | Filters and interactions | Source and calculation |
| --- | --- | --- |
| Hotel | Hotel, channel, inclusive arrival-month range; five measures; hotel/channel breakdown; click a bar or use a keyboard category button | Existing verified 176-row month/hotel/channel export representing 119,390 bookings. Sum counts first, then canceled / bookings; no-shows are included in cancellation flags. Partial 2015/2017 coverage remains explicit. |
| Sales | Region, category, customer segment, inclusive order-month range; six measures; three breakdowns | Source-hash-checked workbook, 10,018 lines and 5,026 distinct orders. Anonymous integer membership keys deduplicate orders across categories without exposing original IDs. Sales/profit are summed; margin = profit / sales; AOV = sales / distinct orders. Currency, publisher/licence and source profit definition remain qualified. |
| Telco Churn | Contract, tenure band, internet service, payment method; four measures and breakdowns | Source-hash-checked IBM educational sample, 7,043 customers and 1,869 churn labels. Rates and mean monthly charges use selected customer counts. The 11 missing TotalCharges cases stay in denominators. No customer identifiers exported. Groups under 50 are flagged; illustrative Wilson bounds appear in tooltips and the accessible table. No date filter is fabricated for this cross-sectional sample. |
| UK Energy | Sector, year range, ktoe/TWh; linked sector comparison and trend | Verified Table C1 published sector totals, 1970–2024. 1 ktoe = 0.01163 TWh. All final users is separate from component sectors, never added to them. The homepage preview changes its historical series when the sector changes. No unverified dissertation forecast is made interactive. |

Filters affect the dashboard, not the scope of the original written findings. Hotel/Sales time series retain zero-activity months within the observed source coverage; rates with no denominator remain unavailable. Invalid ranges clear results with an explanation. Empty selections show zero counts and unavailable rates instead of stale values.

## Accessibility, performance and preservation

Native labelled selectors and date/year inputs work with keyboard and touch. Chart selection also has visible keyboard buttons; focus returns to an appropriate filter after selection. Live status text announces changed scope and errors. Tables expose exact plotted values and time-series values, including Wilson limits for churn. Chart-library failure leaves filters, tables and calculations working; data failures offer a retry. Original saved images remain accessible without JavaScript.

Chart.js 4.5.1 is self-hosted with its MIT licence, so visitors do not need a third-party chart CDN. Dashboard data is loaded near the viewport, charts disable animation and source rows are compact aggregates. Names, addresses, customer IDs and original order IDs are excluded. Sales membership tokens stay out of CSV downloads; per-group distinct order counts must not be summed across categories. The site retains its existing fonts, palette, animations and project filtering.

## Reproduce and verify

With the existing sibling project checkouts and pandas/openpyxl available:

```text
python demos/build_dashboards.py
node demos/test-dashboards.cjs
node --check demos/dashboards.js
```

The builder uses original sales/churn inputs, existing verified hotel exports and energy totals. It creates 626 independent pandas-based expectations for cross-filter combinations, year scopes and unit conversions. Node tests compare the browser calculation functions with those fixtures, exercise every measure/group drilldown, verify distinct-order deduplication, range/empty behaviour, zero-activity months and Wilson calculations, and check delivery hashes. Source and output hashes are in demos/dashboard-data/manifest.json. The GitHub Actions dashboard workflow runs these checks without private source files or a build framework.

Browser acceptance covers combined filters, all Sales/Churn measure and breakdown controls, chart clicks, keyboard category selection/reset, month/year boundaries, small groups, filtered CSV download, all four lazy homepage previews and original project expansion. Separate local test pages exercise unavailable-chart and unavailable-data states; those test pages are not published. Mobile and live delivery results are recorded in the continuation verification record.

Verification applies to the web representation and saved source snapshot. It does not certify native Excel refresh, reproduce dissertation modelling, resolve dataset licensing, or establish causal/commercial impact.
