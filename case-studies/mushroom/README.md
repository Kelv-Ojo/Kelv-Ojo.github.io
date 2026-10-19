# Mushroom classification coursework review

Educational machine learning project by Kelvin Ojogbede, developed from 7072CEM coursework. This portfolio revision and validation were prepared with AI assistance. It is not a mushroom identification or food-safety tool.

## Question

How do logistic regression, a decision tree and naive Bayes compare on a categorical benchmark, and what does accuracy hide about missed positive cases?

## Source and preparation

[UCI Mushroom dataset](https://archive.ics.uci.edu/dataset/73/mushroom), DOI [10.24432/C5959T](https://doi.org/10.24432/C5959T), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The original creators retain their rights. It describes hypothetical samples, not a field-validation cohort. There are 8,124 records, 22 features, 4,208 edible labels and 3,916 poisonous labels. Unknown edibility is combined with the poisonous category in the source.

The stalk-root field has 2,480 question-mark values. The revised workflow learns the most frequent replacement from each training fold. One-hot encoding is also fitted within the fold, with unknown categories ignored. Logistic regression uses scaling and PCA retaining 95% of variance; the other classifiers use binary encoded features without PCA. Categorical naive Bayes treats each binary column as categorical, which is a baseline representation with dependent dummy variables rather than an ideal conditional-independence model.

## What was improved

The original notebook performed some preprocessing before cross-validation, and the written report contained conflicting accuracy figures. The revised analysis fits imputation, encoding, scaling and PCA inside pipelines, adds a majority-class baseline, uses a stratified holdout and reports poisonous-class recall and false negatives. The numbers below come from the new execution and supersede conflicting figures in the earlier report. The full report, submission receipts, student number and original notebook metadata are not published here.

## Verified results

Training: 6,499 rows. Test: 1,625 rows, including 783 poisonous labels. Five-fold stratified cross-validation runs on training data only. All random splits use seed 42.

| Model | CV accuracy | Test accuracy | Poisonous recall | False negatives |
|---|---:|---:|---:|---:|
| Majority baseline | 51.79% | 51.82% | 0.00% | 783 |
| Logistic regression with PCA | 99.97% | 99.88% | 99.74% | 2 |
| Decision tree | 99.97% | 100.00% | 100.00% | 0 |
| Categorical naive Bayes | 94.03% | 93.35% | 87.74% | 96 |

The tree makes no errors in this particular test. This does not demonstrate safety or generalisation to new species, regions or field observations. The comparison is a benchmark exercise, with all pre-specified models reported rather than repeatedly tuning against the test set. Random row splitting does not establish independence at species level, and species groups are not provided for a grouped split.

## Reproduce

Use Python 3.11 or 3.12. From this folder:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python analyse.py --download
```

On Windows, activate with `.venv\Scripts\activate`. The explicit download option retrieves the source archive from UCI only if the data file is absent. Alternatively, place `agaricus-lepiota.data` in `data/` and run `python analyse.py`. The script verifies the source fingerprint, schema, labels, missing-value count and disjoint split indices, then regenerates [metrics.json](metrics.json), including every confusion matrix and the cross-validation variation. Data is fetched from the credited source rather than duplicated in this repository.

## Explain the analysis

- Why put preprocessing inside cross-validation? Each validation fold must be evaluated using transformations learnt without its rows.
- Why report false negatives? A high overall accuracy can conceal missed positive labels, as the naive Bayes results show.
- Why not use this for foraging? The benchmark does not validate field identification, unknown species or consequences of measurement errors.
