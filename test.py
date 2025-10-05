import numpy as np
import pandas as pd

data = pd.read_csv('Shared Data.csv')
a = data.corr(numeric_only=True).values
print(np.nan in a)
