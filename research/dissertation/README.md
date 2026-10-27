# Dissertation evidence and consistency review

Source: Kelvin Ojogbede, *Predicting UK Renewable and Non-Renewable Energy Consumption Using Machine Learning*, recovered MSc report supplied by the author, reviewed 27 October 2026. Report text is dated 4 December 2025. No model experiments were rerun. Only three selected analytical images and transcribed results are retained for the portfolio; the complete report, identifying front matter, approval records and supervisor material are not published.

## What can be said

The report describes reshaping ECUK energy data, joining World Bank GDP/population and Met Office weather by year, and comparing separate models for two report-defined targets. ARIMA uses (2,1,2); Random Forest uses GridSearchCV and shuffled 5-fold KFold; XGBoost uses RandomizedSearchCV and proxy tuning on the renewable target. Future predictors are themselves projected. The detailed test tables place XGBoost lowest on MAE, RMSE and MAPE for both targets. This is a reported result, not an independently reproduced ranking or demonstrated future performance.

## Discrepancies flagged before use

| Issue | Report evidence | Portfolio treatment |
| --- | --- | --- |
| Forecast horizon | Aim/title mentions 2030; all three numerical forecast tables cover 2025–2029. | Display 2025–2029 only. No invented 2030 result. |
| Unit scale | Dataset described as ktoe; conversion section states 1 toe = 11,630 kWh; displayed national totals are around 10^9 kWh. | Preserve numbers as reported with an adjacent unresolved-unit notice. A factor-of-1,000 omission is plausible but not silently corrected without code. Correct conversion is 1 ktoe = 11,630,000 kWh = 0.01163 TWh. |
| Target definitions | Electricity and bioenergy/waste grouped as renewable; heat grouped with non-renewables. | Call these report-defined categories. ECUK final-consumption data alone cannot identify electricity generation source; waste and heat also need attribution. |
| Test comparability | ARIMA describes the last five years and calls them in-sample; tree models describe approximately ten test years. Shuffled KFold and random test splits appear elsewhere. Test points in original diagrams are scattered across history. | Do not claim a shared chronological holdout or established forecasting superiority. Recommend rolling-origin evaluation. |
| ARIMA metrics | Detailed table gives renewable MAPE 3.36%, non-renewable MAE 1.44×10^8 and RMSE 1.45×10^8. Later prose says 3.37%, 1.40×10^8 and 1.41×10^8. | Use detailed table consistently and disclose the conflict. |
| Forecast figure/table mismatch | XGBoost table gives non-renewable values around 1.13–1.15×10^9; original historical/forecast and combined plots show around 1.3–1.4×10^9. Combined renewable plot also differs from table. | Withhold inconsistent forecast graphics; publish labelled table transcriptions and selected diagnostics only. |
| Importance table | XGBoost renewable importance values 0.635+0.370+0.004+0.001 = 1.010. | Do not use exact importance percentages or infer causation from them. |
| Overstated improvement | Prose claims orders of magnitude and hundreds of kWh errors. Detailed XGBoost/RF scores are close and absolute errors are millions. | Explain modest reported difference; retain detailed numbers with unit caution. |
| Time coverage | Rainfall description mentions 2008–2020 despite 1970–2024 study scope. | Require original join/coverage and missing-data checks. |
| Forecast uncertainty | Point estimates and projected external predictors; no forecast intervals in tables. | No invented intervals. Describe input dependence and need for scenarios. |

## Transcription provenance

`reported-results.json` records the detailed ARIMA test table under “ARIMA modelling”, Random Forest “Test Set Evaluation”, XGBoost “Test Set Evaluation”, and each model's “Future Forecasts” table. All forecast values use a common multiplier of 10^8; this only changes display notation, not units or results. Forecast row/column order is explicit in the JSON. All six evaluation rows were checked against the document tables. Source file SHA-256 is recorded in the delivery audit after extraction.

Selected original images: XGBoost actual-versus-predicted diagnostics (document relationship rId40, appendix Figure 29), XGBoost learning curves (rId38, Figure 28), Random Forest diagnostics (rId35, Figure 25). Axis values retain the report's unresolved scale. No visualisations imply a new run. The appendix repeats Figure 31 for two different plots, so filenames and document relationship IDs disambiguate them.

Needed to resolve the issues: original notebook/code, exact transformed target definitions and units, predictor snapshots and alignment, train/test indices, seeds, saved predictions, model artefacts, and the dataset used for each figure. The existing public energy repository reproduces descriptive historical sector findings only.
