"""Training-fold preprocessing and pre-specified benchmark models."""
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import CategoricalNB
from sklearn.dummy import DummyClassifier

def encode():
    return [SimpleImputer(missing_values='?',strategy='most_frequent'),
            OneHotEncoder(handle_unknown='ignore',sparse_output=False)]
def make_models():
 return {
 'Majority baseline':DummyClassifier(strategy='most_frequent'),
 'Logistic regression with PCA':make_pipeline(*encode(),StandardScaler(),PCA(n_components=.95,svd_solver='full'),LogisticRegression(max_iter=2000,random_state=42)),
 'Decision tree':make_pipeline(*encode(),DecisionTreeClassifier(max_depth=10,random_state=42)),
 'Categorical naive Bayes on binary encoded features':make_pipeline(*encode(),CategoricalNB(min_categories=2))}
