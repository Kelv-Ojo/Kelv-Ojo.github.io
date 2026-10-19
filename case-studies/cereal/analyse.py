"""Reproduce the Oliver Wyman cereal simulation analysis. UK English.
Run: python analyse.py (requires pandas, numpy, scikit-learn).
"""
from pathlib import Path
import json, shutil
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, precision_score,
                            recall_score, f1_score, roc_auc_score, average_precision_score,
                            confusion_matrix)

ROOT = Path(__file__).resolve().parent
raw = pd.read_csv(ROOT/'data/raw.csv')
complete = pd.read_csv(ROOT/'data/supplied_complete.csv')
clean = raw.copy()
clean['Cereal'] = clean.Cereal.str.strip()
# Whitespace changes are certain; the spelling variant remains unresolved in Task 1.
clean['CustomerCountMissing'] = clean.CustomerCount.isna().astype(int)
clean['ZeroSales'] = (clean.TotalSales == 0).astype(int)
clean.to_csv(ROOT/'data/cleaned_raw.csv', index=False)
quality = pd.DataFrame({'Field':raw.columns, 'Unique values':raw.nunique().values,
    'Missing values':raw.isna().sum().values,
    'Missing proportion':raw.isna().mean().values,
    'Completeness':1-raw.isna().mean().values})
quality.to_csv(ROOT/'data/quality.csv', index=False)
products = clean.groupby('Cereal').agg(Records=('Month','size'), Months=('Month','nunique'),
    FlagValues=('Flag','nunique'), Flag=('Flag','first'), Sales=('TotalSales','sum'),
    MissingCustomers=('CustomerCountMissing','sum'), ZeroSales=('ZeroSales','sum')).reset_index()
products.to_csv(ROOT/'data/product_summary.csv', index=False)
coverage = pd.crosstab(clean.Cereal, clean.Month).reindex(columns=range(1,13), fill_value=0)
coverage.to_csv(ROOT/'data/month_coverage.csv')
monthly = clean.groupby('Month').agg(Records=('Cereal','size'), Sales=('TotalSales','sum'),
    MissingCustomers=('CustomerCountMissing','sum'), ZeroSales=('ZeroSales','sum')).reset_index()
monthly.to_csv(ROOT/'data/monthly.csv', index=False)
outliers = []
for col in raw.select_dtypes('number').columns.drop(['Flag','Month']):
    q1,q3=raw[col].quantile([.25,.75]); iqr=q3-q1
    mask=(raw[col]<q1-1.5*iqr)|(raw[col]>q3+1.5*iqr)
    for idx in raw.index[mask]:
        outliers.append({'SourceRow':int(idx+2),'Cereal':raw.loc[idx,'Cereal'],
          'Month':int(raw.loc[idx,'Month']),'Field':col,'Value':float(raw.loc[idx,col]),
          'LowerFence':float(q1-1.5*iqr),'UpperFence':float(q3+1.5*iqr)})
pd.DataFrame(outliers).to_csv(ROOT/'data/outliers.csv',index=False)

# Task 3 uses the separately supplied complete data. Never fill raw gaps from it silently.
assert not complete.isna().any().any()
assert complete.groupby('Cereal').Flag.nunique().max()==1
assert not complete.duplicated(['Cereal','Month']).any()
features=['TotalSales','CustomerCount','PricePerKilogram','WalletShare','Stock cost']
# Product means prevent longer coverage mechanically increasing the model's sales feature.
X=complete.groupby('Cereal')[features].mean().sort_index()
y=complete.groupby('Cereal').Flag.first().reindex(X.index)
train,test=train_test_split(np.arange(len(X)),test_size=.2,stratify=y,random_state=42)
models={'Majority baseline':DummyClassifier(strategy='prior'),
    'Logistic regression':make_pipeline(StandardScaler(),LogisticRegression(class_weight='balanced',max_iter=2000,random_state=42)),
    'Random forest':RandomForestClassifier(n_estimators=300,min_samples_leaf=3,class_weight='balanced',max_depth=4,random_state=42,n_jobs=1)}
cv=StratifiedKFold(n_splits=5,shuffle=True,random_state=42)
scores=[]
for name,model in models.items():
    result=cross_validate(model,X.iloc[train],y.iloc[train],cv=cv,
      scoring={'AP':'average_precision','ROC':'roc_auc','BA':'balanced_accuracy'},error_score='raise')
    scores.append({'Model':name,'CV average precision':float(result['test_AP'].mean()),
      'CV AP standard deviation':float(result['test_AP'].std()),
      'CV ROC AUC':float(result['test_ROC'].mean()),'CV balanced accuracy':float(result['test_BA'].mean())})
scoretable=pd.DataFrame(scores)
selected=scoretable.sort_values('CV average precision',ascending=False).iloc[0]['Model']
model=models[selected]
model.fit(X.iloc[train],y.iloc[train])
prob=model.predict_proba(X.iloc[test])[:,1]; pred=(prob>=.5).astype(int)
yt=y.iloc[test]
metrics={'selected_model':selected,'train_products':len(train),'test_products':len(test),
 'train_important':int(y.iloc[train].sum()),'test_important':int(yt.sum()),
 'accuracy':accuracy_score(yt,pred),'balanced_accuracy':balanced_accuracy_score(yt,pred),
 'precision':precision_score(yt,pred,zero_division=0),'recall':recall_score(yt,pred),
 'f1':f1_score(yt,pred),'roc_auc':roc_auc_score(yt,prob),
 'average_precision':average_precision_score(yt,prob),'confusion_matrix':confusion_matrix(yt,pred).tolist()}
scoretable.to_csv(ROOT/'data/model_comparison.csv',index=False)
holdout=X.iloc[test].copy();holdout['ActualFlag']=yt;holdout['Probability']=prob;holdout['Prediction']=pred
holdout.to_csv(ROOT/'data/holdout_predictions.csv')
# Diagnostic OOF scores across all products, after model selection: not an independent test.
oof=cross_val_predict(models[selected],X,y,cv=cv,method='predict_proba')[:,1]
review=pd.DataFrame({'Cereal':X.index,'ActualFlag':y.values,'OOF_probability':oof})
review['Disagreement']=((review.OOF_probability>=.5).astype(int)!=review.ActualFlag).astype(int)
review.sort_values(['Disagreement','OOF_probability'],ascending=False).to_csv(ROOT/'data/product_review.csv',index=False)
model.fit(X,y)
if selected=='Logistic regression':
    importance=pd.DataFrame({'Feature':features,'Standardised coefficient':model[-1].coef_[0]})
elif selected=='Random forest':
    importance=pd.DataFrame({'Feature':features,'Impurity importance':model.feature_importances_})
else: importance=pd.DataFrame({'Feature':features,'Importance':[0]*len(features)})
importance.to_csv(ROOT/'data/model_features.csv',index=False)
summary={'rows':len(raw),'raw_names':raw.Cereal.nunique(),'trimmed_names':clean.Cereal.nunique(),
 'missing_customer_count':int(raw.CustomerCount.isna().sum()),'zero_sales_rows':int((raw.TotalSales==0).sum()),
 'exact_duplicates':int(raw.duplicated().sum()),'trimmed_key_duplicates':int(clean.duplicated(['Cereal','Month']).sum()),
 'flag_conflicts':int((clean.groupby('Cereal').Flag.nunique()>1).sum()),
 'whitespace_rows':int((raw.Cereal!=clean.Cereal).sum()),'missing_months':sorted(set(range(1,13))-set(raw.Month)),
 'complete_rows':len(complete),'complete_products':complete.Cereal.nunique(),
 'complete_flag_counts':complete.groupby('Cereal').Flag.first().value_counts().to_dict(),
 'total_sales':float(raw.TotalSales.sum()),'outlier_cells':len(outliers),'model':metrics}
(ROOT/'results.json').write_text(json.dumps(summary,indent=2))
# Lightweight data-quality and leakage checks.
assert len(clean)==len(raw)==811
assert clean.CustomerCount.isna().sum()==46
assert not set(X.index[train]) & set(X.index[test])
assert quality['Missing values'].sum()==46
assert coverage.to_numpy().sum()==811
assert len(holdout)==15
print(json.dumps(summary,indent=2))
