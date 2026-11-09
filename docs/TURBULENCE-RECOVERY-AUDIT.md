# Turbulence recovery audit

Reviewed 8 November 2026. A privately recovered archive contains a PySpark notebook, Tableau .twb, dashboard image and two PDFs. It does not contain komegasst.csv or the prediction/metrics/importance CSVs referenced by Tableau. No original artefacts or client-identifying report material are republished.

The notebook selects komegasst_k as target and six velocity, omega, pressure and turbulent-viscosity features. It does not use REF_a_11 or REF_tau_11. The board's REF target description therefore cannot be assumed to describe this notebook. Resolve which report, pipeline and dataset belong together before scientific conclusions.

The notebook fits StandardScaler before a random row split (cell 22, zero-based). It trains a Random Forest without a linear baseline in this recovered code. It labels R² × 100 as accuracy in cells 26 and 33; that terminology is wrong for a regression fit metric. Case/spatial grouping and the physical dependency among kinetic energy, omega and turbulent viscosity must be checked with source definitions. No leakage-free engineering generalisation is established by a random row holdout.

Tableau connections refer to regression_results.csv, model_metrics.csv and feature_importance.csv; none is in the archive. Opening .twb text establishes connections, not a refreshed dashboard. The required dataset, case identifiers, source licence and authorship/redistribution clearance remain unresolved. No model training, corrected performance score or runtime claim is made. Keep this card unfinished until those inputs permit a case-based evaluation and a defensible leakage audit.

## Feature-definition follow-up — 9 November 2026

The recovered notebook's cell 17 explicitly names the following inputs. These are code labels and comments, not an independently verified data dictionary or unit declaration:

| Field | Notebook description | Verification required |
| --- | --- | --- |
| komegasst_k | Target: turbulent kinetic energy | Solver definition, normalisation, units and availability |
| komegasst_U_1 / U_2 / U_3 | Three velocity components | Coordinate frame, dimensionalisation and whether available at deployment |
| komegasst_omega | Specific dissipation rate | Solver convention, units and target dependency |
| komegasst_p | Pressure | Kinematic versus dynamic pressure, reference and units |
| komegasst_nut | Turbulent viscosity | Kinematic versus dynamic viscosity, source equation and target dependency |

There is a concrete reason to question nut/omega as predictors of k. The [OpenFOAM SST source](https://develop.openfoam.com/Development/OpenFOAM-plus/-/blob/f1c4b4580d9daedc57b82ff9dc9ed60740a3638c/src/TurbulenceModels/turbulenceModels/Base/kOmegaSST/kOmegaSSTBase.C) calculates turbulent viscosity from k and omega with a strain/blending limiter. In the omega-limited branch, its relation reduces to nut = k / omega. Thus nut and omega may directly encode the target in a solver-generated table. This is a **conditional leakage risk**, not proof that the missing dataset used that solver, implementation, branch or units. Do not assert that k always equals nut × omega for every SST sample.

Before modelling, identify the actual solver/version and retain case, mesh/location and time identifiers. Evaluate deployment-available features without nut/omega against a separately labelled solver-state reconstruction experiment. Hold out entire flow cases or geometries where available, with training-only transformations. A high random-row R² would not establish unseen-case performance. Neither REF_a_11 nor REF_tau_11 is defined by this notebook; do not rename its target to match the board's earlier description.

The export code limits prediction rows to 10,000 without a representative sampling guarantee. If a results CSV is recovered, reconcile the full holdout metrics to its exported subset and identify which rows the Tableau dashboard actually displays. A screenshot cannot establish that relationship.

## Recovery and publication decision

A focused public search for the exact filename komegasst.csv did not establish an attributable original dataset. No new archive location was supplied, so completed local/email/backup searches were not repeated. The file's generic solver-style name does not identify its licence.

The next useful evidence is the original CSV with its source link/licence and case dictionary, the three connected Tableau CSVs, and confirmation of the author's contribution and permission concerning client-labelled material. A public solver source is not a licence for this particular dataset or report. Keep original files private until rights are established. Do not substitute an unrelated public turbulence dataset and call it the recovered original; no new project or model scores have been created.
