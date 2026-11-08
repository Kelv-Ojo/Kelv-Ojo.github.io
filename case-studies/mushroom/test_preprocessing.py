"""Regression checks for preprocessing fitted only on training folds."""
import unittest
import numpy as np
from sklearn.base import clone
from sklearn.model_selection import StratifiedKFold,cross_validate
from models import make_models
class PreprocessingTests(unittest.TestCase):
 def test_unknown_categories_and_missing_values(self):
  pipe=make_models()['Decision tree']
  pipe.fit(np.array([['a','x'],['a','?'],['b','x'],['b','y']],dtype=object),[0,0,1,1])
  imputer=pipe.named_steps['simpleimputer'];before=imputer.statistics_.copy()
  prediction=pipe.predict(np.array([['unseen','?']],dtype=object))
  self.assertEqual(len(prediction),1)
  np.testing.assert_array_equal(imputer.statistics_,before)
  self.assertEqual(imputer.statistics_[1],'x')
 def test_each_cv_fold_learns_its_own_imputation(self):
  X=np.array([['a'],['a'],['b'],['?'],['b'],['a'],['b'],['?']],dtype=object);y=np.array([0,1,0,1,0,1,0,1])
  cv=list(StratifiedKFold(2,shuffle=True,random_state=7).split(X,y))
  result=cross_validate(make_models()['Decision tree'],X,y,cv=cv,return_estimator=True,error_score='raise')
  for (train,valid),estimator in zip(cv,result['estimator']):
   self.assertFalse(set(train)&set(valid))
   observed=X[train,0];observed=observed[observed!='?'];values,counts=np.unique(observed,return_counts=True)
   self.assertEqual(estimator.named_steps['simpleimputer'].statistics_[0],values[np.argmax(counts)])
 def test_baseline_and_model_set_remain_explicit(self):
  self.assertEqual(len(make_models()),4)
  self.assertIn('Majority baseline',make_models())
if __name__=='__main__':unittest.main()
