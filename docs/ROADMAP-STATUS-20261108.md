# Portfolio roadmap verification — updated 9 November 2026

This continues the 8 November checkpoint. Completed source reconciliation and successful earlier tests were not repeated unnecessarily. The board now has four Done tasks, two Ready tasks and three Ideas; none In Progress or Review.

- **Hotel Power BI: Done for the documented native acceptance cases.** Final hotel commit `a984013` adds report caveats, explicit cross-filter interactions, acceptance evidence and the final repaired PBIX. Date-range, Month-Year, country and segment cases passed. July lower-chart rates and every nonempty adult/weekend matrix cell reconciled independently to the recovered source. Deposit and Direct selections correctly filter cards and lower visuals. Arrival-date, partial-year, cancellation/no-show and association caveats are visible. The final PBIX was saved, exported and reopened; caveats, cleared filters and full totals persisted, and a fresh Direct selection/clear worked. This is bounded acceptance coverage, not certification of every possible filter combination or Power BI Service behaviour. [Native verification and screenshots](https://github.com/Kelv-Ojo/hotel-booking-analysis/blob/main/docs/NATIVE-REPORT-REVIEW-20261108.md). [Passing CI](https://github.com/Kelv-Ojo/hotel-booking-analysis/actions/runs/42629466549).
- **Excel: Ready, incomplete.** Existing formula workbook preserved. Desktop Excel is unavailable; embedded native Power Query/PivotTables and Refresh All remain unverified. Its companion M query previously refreshed natively in Power BI to 176 rows and reconciled booking/status totals. This does not verify native Excel functionality.
- **Personal case study: Ready, recording required.** The verified complete-year comparison chart, narration, screen sequence and recording acceptance criteria were already published in hotel commit `25f7184`. [Recording runbook](https://github.com/Kelv-Ojo/hotel-booking-analysis/blob/main/docs/RECORDING-RUNBOOK.md). Kelvin must record and approve his own three-minute walkthrough.
- **Energy: Ideas, partial.** Existing separate historical rolling-origin consumption backtest uses lagged inputs with training-label cutoff assertions. New commit `9687343` adds an executable future-data isolation test: changing consumption from 2020 onward in temporary copies leaves all 162 earlier-origin predictions identical; all three models respond at later origins. Local test and [GitHub Actions](https://github.com/Kelv-Ojo/uk-energy-analysis/actions/runs/42628992904) passed. Public datasets and forecast outputs were not altered by this test. The privately recovered original notebook still has target-definition, unit, predictor-availability and evaluation issues. Missing original GDP/population snapshots, matched chronological ARIMA/RF/XGBoost comparison and uncertainty work prevent completion. The new backtest is not dissertation reproduction.
- **Turbulence: Ideas, blocked by evidence.** Notebook and Tableau workbook recovered privately; original input/results CSVs remain missing. Target/schema differences, potential leakage, authorship and redistribution rights remain unresolved. No corrected score or successful training is claimed.
- **Chatbot research: Ideas, evidence incomplete.** Recovered report reviewed, but the questionnaire, participant responses, consent and reuse rights are unverified. No human research data or permissions were invented. [CRM PR 3](https://github.com/Kelv-Ojo/Chat_bot/pull/3) and [research documentation PR 4](https://github.com/Kelv-Ojo/Chat_bot/pull/4) remain unmerged pending approval.
- **Earlier Done tasks preserved:** mushroom reproduction and fold-specific preprocessing checks; reproducible project pipelines; profile README, links and pin work. These were not duplicated.

## Preserved files and report verification

Original Hotel Bookings.pbix SHA256 remains `564b25bd09cdaadaefc8e163bc3f6f5474c048f43edb5d2a39a28ebe5c244332`.

Final `powerbi/Hotel Bookings-reviewed-20261108.pbix` SHA256 is `e472b23be365317c9856bb6a64d1cb04e2513a6b6067809343411b26cfa6027a`. The dated filename is retained to continue the existing review artefact. Editable PBIP source, native observation JSON and the independent source-comparison script are included in the hotel repository. Original source workbook stays private. Earlier native refresh, six hotel/year scopes, exact source reconciliation, dimension checks and M-query import remain valid.

Original website design is unchanged. Only this verification record is included in the portfolio commit; unrelated local design files are excluded. No existing pull request was merged.

## Exact continuation checkpoint

Hotel acceptance is finished: do not repeat recovery, source reconciliation, slicer checks or reopen tests unless subsequent report changes invalidate them.

1. Kelvin records and approves the prepared personal walkthrough.
2. With desktop Excel available, implement native Power Query/PivotTables and verify Refresh All, connections and six documented scopes. Do not substitute Power BI M execution for Excel evidence.
3. Energy: reconcile dissertation targets/units and obtain matching predictor snapshots before claiming an original-model reproduction; then compare models chronologically and assess uncertainty. Existing leakage regression test is in CI.
4. Turbulence needs the original CSV/results and rights/feature definitions before validation or publication.
5. Chatbot research needs original questionnaire, consent/response provenance and reuse rights. Existing PRs require explicit approval before merging.

No task becomes Done merely because its documentation was written. Local continuation details are saved in outputs/ROADMAP-RESUME-CHECKPOINT.md in the shared workspace.
