"""Revised evaluation of Kelvin's mushroom classification coursework.

Educational benchmark only. Not a tool for deciding whether to eat a mushroom.
Run python analyse.py --download to fetch the UCI source if absent.
"""
from pathlib import Path
import argparse
import hashlib
import io
import json
import urllib.request
import zipfile
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import CategoricalNB
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--download',action='store_true')
args=parser.parse_args()
source=ROOT/'data/agaricus-lepiota.data'
if not source.exists() and args.download:
    with urllib.request.urlopen('https://archive.ics.uci.edu/static/public/73/mushroom.zip') as response:
        archive=zipfile.ZipFile(io.BytesIO(response.read()))
    source.parent.mkdir(parents=True,exist_ok=True)
    source.write_bytes(archive.read('agaricus-lepiota.data'))
if not source.exists():
    raise SystemExit('Source missing. Run python analyse.py --download or copy the UCI data file into data/.')
df=pd.read_csv(source,header=None,dtype=str)
assert hashlib.sha256(source.read_bytes()).hexdigest()=='e65d082030501a3ebcbcd7c9f7c71aa9d28fdfff463bf4cf4716a3fe13ac360e', 'Unexpected dataset version'
assert df.shape==(8124,23) and not df.isna().any().any()
assert set(df[0])=={'e','p'}
X=df.iloc[:,1:].copy(); X.columns=[str(c) for c in X.columns]
y=df[0].map({'e':0,'p':1})
assert int((X=='?').sum().sum())==2480
assert (X=='?').sum().loc['11']==2480
train,test=train_test_split(df.index,test_size=.2,stratify=y,random_state=42)
assert not set(train)&set(test)
def encode():
    return [SimpleImputer(missing_values='?',strategy='most_frequent'),
            OneHotEncoder(handle_unknown='ignore',sparse_output=False)]
models={
 'Majority baseline':DummyClassifier(strategy='most_frequent'),
 'Logistic regression with PCA':make_pipeline(*encode(),StandardScaler(),PCA(n_components=.95,svd_solver='full'),LogisticRegression(max_iter=2000,random_state=42)),
 'Decision tree':make_pipeline(*encode(),DecisionTreeClassifier(max_depth=10,random_state=42)),
 'Categorical naive Bayes on binary encoded features':make_pipeline(*encode(),CategoricalNB(min_categories=2))}
cv=StratifiedKFold(n_splits=5,shuffle=True,random_state=42)
rows=[]
for name,model in models.items():
    # Every preprocessing operation is refitted within each CV training fold.
    scores=cross_validate(model,X.loc[train],y.loc[train],cv=cv,
        scoring={'accuracy':'accuracy','recall':'recall'},error_score='raise')
    model.fit(X.loc[train],y.loc[train])
    predicted=model.predict(X.loc[test]); probs=model.predict_proba(X.loc[test])[:,1]
    cm=confusion_matrix(y.loc[test],predicted,labels=[0,1])
    rows.append({'model':name,'cv_accuracy_mean':float(scores['test_accuracy'].mean()),
      'cv_accuracy_std':float(scores['test_accuracy'].std()),'cv_poisonous_recall_mean':float(scores['test_recall'].mean()),
      'test_accuracy':accuracy_score(y.loc[test],predicted),'test_precision_poisonous':precision_score(y.loc[test],predicted,zero_division=0),
      'test_recall_poisonous':recall_score(y.loc[test],predicted),'test_f1_poisonous':f1_score(y.loc[test],predicted),
      'test_roc_auc':roc_auc_score(y.loc[test],probs),'false_negatives':int(cm[1,0]),
      'confusion_matrix_true_rows_predicted_columns':cm.tolist()})
result={'source_url':'https://archive.ics.uci.edu/dataset/73/mushroom',
 'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'rows':len(df),'features':X.shape[1],'missing_stalk_root':2480,
 'class_counts':{'edible':int((y==0).sum()),'poisonous':int((y==1).sum())},
 'train_rows':len(train),'test_rows':len(test),'test_poisonous':int(y.loc[test].sum()),
 'split':'Stratified row holdout, random_state=42. Does not test new species.',
 'models':rows}
(ROOT/'metrics.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
