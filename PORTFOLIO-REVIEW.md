# Portfolio audit and implementation plan

Audit date: 27 October 2026. Baseline: e0cb657. Feature branch: feat/portfolio-recruiter-upgrade. No production deployment or main-branch changes authorised.

## What already works

Static HTML/CSS/JavaScript is appropriate for GitHub Pages. Seven substantive projects, local fonts, an existing public CV, native mobile-navigation dialog, keyboard-accessible image previews and reduced-motion handling are worth preserving. The original skull-and-stars identity and verified project results stay. Hotel workbook screenshots are genuine. Projects distinguish educational work from employment and proposals from implemented outcomes.

## Priorities, before implementation

1. **Evidence:** inspect all seven projects and linked repositories; distinguish original research from the reproducible historical energy analysis. Never infer forecast scores. Check sales images before using them as dashboard evidence.
2. **Recruiter access:** show full name, Data Analyst role, graduate/junior objective, Projects/GitHub/LinkedIn/CV links immediately. Promote energy into four featured projects. Remove the previously unwanted location wording.
3. **Design:** preserve ivory/navy/gold and skull avatar; replace the oversized decorative star and layered visual overrides with a coherent editorial layout. Use real charts as the visual focus, stronger typography, readable body text and consistent project previews. Retain every supporting project and credential.
4. **Case studies:** provide question, dataset, preparation, methodology, findings, implications, proposed next steps, limits and direct evidence links for each featured project. Remove repetition rather than rewriting verified findings.
5. **Quality:** add metadata, reliable no-script access, consistent headers, keyboard navigation, mobile layout and automated local-link/asset/claim checks. Run a local server and browser checks across widths before delivery.

## Baseline issues

Energy is collapsed below the three featured projects. Hero lacks CV and LinkedIn links. Tool logos claim breadth without connecting each skill to work. Decorative star and angel effects compete with evidence. Four CSS layers contain contradictory values, 19 text sizes, 31 text blocks below 13px, and multiple shadows and decorative rules (browser inspector baseline). Main project summaries repeat action/measurement prose. Featured case studies are short and use different terminology. Case headers use an older avatar. Some page descriptions and canonical metadata are absent. The README incorrectly describes case-study dialogs, now used for image previews.

## Evidence inventory

| Project | Evidence inspected | Safe claims / gaps |
| --- | --- | --- |
| Hotel | repository README, metrics, provenance, SQL, Excel report and original Power BI screenshot | 119,390 bookings; cancellation flag 37.0%, City 41.7%, Resort 27.8%; includes no-shows; 2015–2017 partial years. Original PBIX has documented measure/date issues. |
| Churn | repository README, metrics, contract counts/intervals and tenure standardisation CSV | 7,043 customers, 1,869 churned; 42.7% vs 2.8%; pooled-tenure adjustment reduces gap from 39.88 to 35.59 percentage points. Association only. |
| UK energy | repository README, metrics, sector CSV, analysis and source workbook manifest | 55 years, 1970–2024; total −12.3%; transport 42.2% in 2024. This repository contains historical analysis, not validated forecasting outputs. |
| Sales | repository README, metrics, annual CSV, workbook, PBIX and Slide1 image | 10,018 lines / 5,026 orders; 2024 total 733,948.35, +20.3%. Slide images are blank layout assets, not populated dashboard screenshots. PBIX exists but its measures were not evaluated in Desktop. Currency and upstream provenance unknown. |
| Cereal | existing case study and analysis script | Data quality and product-level modelling; source inputs are separately supplied, not in repository. Existing numerical results retained with their original caveats, not newly certified. |
| PySpark | existing case study | Reported coursework; original notebook, data and Tableau workbook absent. Reported metrics remain explicitly unverified. |
| Mushroom | README, metrics JSON and analysis pipeline | Reproducible educational benchmark; existing results retained; no field or safety inference. |
| Chatbot | linked repository README | In-development Python/Streamlit/SQLite prototype; HubSpot requests mocked. No live integration claimed. |

## Initial search and subsequently recovered materials

The initial bounded search did not locate the original report. The author then supplied the recovered DOCX. Its detailed model and forecast tables were read and selected figures extracted. The original notebook, split indices and saved prediction files are still missing. The report is not independently reproduced. See [the full consistency review](research/dissertation/README.md). Source DOCX SHA-256: `453be2ddf7e9c48c9cfb9e12e4f17d2c1b9a3bcc6d6e61545e62e302247aac98`. The complete source report is outside the public repository.

Sales needs a genuine populated Power BI export plus measure verification. Keep the Python source chart and direct PBIX link meanwhile. No replacement dashboard is fabricated.

## Research

- CareerFoundry: https://careerfoundry.com/en/blog/data-analytics/data-analytics-portfolio-examples/#harrison-jansma — reviewed the article's emphasis on personal identity, navigable projects and communicating analysis to non-technical readers.
- CadetX: https://www.cadetx.co.uk/blog/data-analyst-portfolio-project-ideas — reviewed question-first summaries, process and depth over project count.
- Canva: https://mgnovandri.my.canva.site/ — initial web extraction was empty, but the page was subsequently read and photographed in a real browser. Reviewed its prominent personal identity, skills grouping and project links to code/reports. Its portrait treatment and claims were not copied.

## Design rationale

On this page, Kelvin Ojogbede's full name becomes the opening typographic statement; his four documented analyses become the visual evidence underneath it. Keep original Manrope/DM Sans fonts, ivory/navy/gold and original skull identity. The dealt name-led direction is adapted to recruiter needs: visible role and four requested actions. The user's follow-up explicitly preserves the interactive star, dotted angel, report-frame depth and twelve tool logos. Those preferences override generic design-skill bans on decorative gradients and shadows. No stock photographs, invented outcomes or unrelated video fill. Project filters progressively enhance readable projects.

## Implementation and verification

- Four featured projects, three supporting projects and existing certification/study content retained. Hero now exposes Projects/GitHub/LinkedIn/CV. Location wording removed. All twelve original named tool logos restored alongside evidence-linked skill groups.
- Shared CSS replaces four runtime style layers, while legacy files remain available. Original skull imagery stays; interactive star, dotted angel and pointer-responsive chart depth remain, with pause controls and reduced-motion support.
- All four featured case studies now explain sources, preparation, methods, findings, proposals, limitations and direct evidence. Supporting analytical content is preserved with consistent metadata, styling and avatar.
- Energy includes six reported evaluation rows, fifteen model/year forecast pairs for two targets, three original diagnostic images and a public consistency note. Conflicting forecast figures, full report and identifying front matter are withheld.
- `scripts/check_site.py`: eight HTML pages pass local paths, fragments, metadata, image alt attributes, CV signature, seven-project count and transcription/caveat checks. `node --check app.js` passes.
- Browser QA: all eight pages at 320, 390, 768 and 1440px; no viewport overflow, failed images or JavaScript exceptions. Filters, native mobile menu, Escape/focus return, hash navigation, CV HTTP download, reduced motion and no-script navigation checked. Rechecked after restoring artwork and skills.
- Historical analysis checks rerun successfully in all four project repositories: hotel, churn (including tenure standardisation), energy and sales matched source fingerprints and baseline totals. These do not certify Power BI Desktop or reproduce dissertation forecasting.
- External link sweep: 37 unique HTTPS links, 34 returned 200. LinkedIn blocks automated requests (999); DOI and Oliver Wyman requests encounter local certificate-chain errors. Those three links are retained and require normal-browser verification rather than being labelled broken.
- Design inspector baseline: 10 fail categories / 8 warnings; initial redesign: 3 / 4, mainly heuristic labels, collapsed-details false positives and restrained motion. Final inspection permits gradients/shadows solely for the user's retained angel and depth effects. This is a design heuristic, not an accessibility conformance certificate.

## Remaining work

Resolve dissertation unit/target/split/plot discrepancies with original code before presenting forecasts as validated projections. Obtain a populated Power BI export and check native measures in Desktop. Supporting cereal inputs and original PySpark notebook/Tableau workbook remain unavailable; their caveats remain. No additional proficiency, commercial impact or credential is invented. Review the feature branch before approving any merge or publication.
