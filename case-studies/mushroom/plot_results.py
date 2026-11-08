"""Visualise the saved benchmark metrics; does not rerun model training."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parent
data = json.loads((root / 'metrics.json').read_text())
models = data['models']
for model in models:
    cm = model['confusion_matrix_true_rows_predicted_columns']
    assert sum(map(sum, cm)) == data['test_rows']
    assert cm[1][0] == model['false_negatives']
    assert abs(sum(cm[i][i] for i in range(2)) / data['test_rows'] - model['test_accuracy']) < 1e-10
labels = ['Majority baseline', 'Logistic + PCA', 'Decision tree', 'Categorical NB']
assert len(models) == len(labels)
fig, axes = plt.subplots(1, 2, figsize=(12, 4.7), gridspec_kw={'width_ratios': [1, 1.12]})
colors = ['#8d9daf', '#2384b9', '#2384b9', '#2384b9']
for ax in axes:
    ax.spines[['top', 'right']].set_visible(False)
    ax.set_axisbelow(True)
    ax.grid(axis='x', color='#e3e8ee')
    ax.invert_yaxis()
accuracy = [100 * m['test_accuracy'] for m in models]
axes[0].barh(labels, accuracy, color=colors)
axes[0].set(xlim=(0, 113), xlabel='Test accuracy (%)', title='Accuracy alone hides the errors')
for i, value in enumerate(accuracy): axes[0].text(value + 1, i, f'{value:.2f}%', va='center', fontsize=9)
missed = [m['false_negatives'] for m in models]
axes[1].barh(labels, missed, color=colors)
axes[1].set(xlim=(0, 890), xlabel='Poisonous labels predicted edible (count)', title='Missed positives on the same holdout')
for i, value in enumerate(missed): axes[1].text(value + 10, i, str(value), va='center', fontsize=10)
fig.suptitle('Mushroom benchmark · 1,625 test rows', fontsize=15, x=.05, ha='left')
fig.text(.05, .015, 'Source: saved metrics.json · stratified row holdout, seed 42 · educational analysis, not a food-safety tool', fontsize=9, color='#4c5969')
fig.tight_layout(rect=(0, .06, 1, .94))
out = root / 'assets/screenshots'; out.mkdir(parents=True, exist_ok=True)
fig.savefig(out / 'model-comparison.png', dpi=160, facecolor='white')
print('Verified confusion-matrix totals and saved benchmark visual.')
