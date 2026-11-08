# Turbulence recovery audit

Reviewed 8 November 2026. A privately recovered archive contains a PySpark notebook, Tableau .twb, dashboard image and two PDFs. It does not contain komegasst.csv or the prediction/metrics/importance CSVs referenced by Tableau. No original artefacts or client-identifying report material are republished.

The notebook selects komegasst_k as target and six velocity, omega, pressure and turbulent-viscosity features. It does not use REF_a_11 or REF_tau_11. The board's REF target description therefore cannot be assumed to describe this notebook. Resolve which report, pipeline and dataset belong together before scientific conclusions.

The notebook fits StandardScaler before a random row split (cell 22, zero-based). It trains a Random Forest without a linear baseline in this recovered code. It labels R² × 100 as accuracy in cells 26 and 33; that terminology is wrong for a regression fit metric. Case/spatial grouping and the physical dependency among kinetic energy, omega and turbulent viscosity must be checked with source definitions. No leakage-free engineering generalisation is established by a random row holdout.

Tableau connections refer to regression_results.csv, model_metrics.csv and feature_importance.csv; none is in the archive. Opening .twb text establishes connections, not a refreshed dashboard. The required dataset, case identifiers, source licence and authorship/redistribution clearance remain unresolved. No model training, corrected performance score or runtime claim is made. Keep this card unfinished until those inputs permit a case-based evaluation and a defensible leakage audit.
