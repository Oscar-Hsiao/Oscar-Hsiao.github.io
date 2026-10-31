import sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '.')
from pyhelp import P
START = 601
ITEMS = [
P("L23102-1","""
import numpy as np
a = np.array([1, 2, 3]); b = np.array([4, 5, 6])
print(np.dot(a, b))
""",["[4 10 18]","15","21"],"np.dot 是內積：1×4＋2×5＋3×6＝32。",1),
P("L23102-1","""
import numpy as np
a = np.array([1, 2, 3]); b = np.array([4, 5, 6])
print(a * b)
""",["32","[5 7 9]","[4 5 6]"],"* 是逐元素相乘，形狀不變。",1),
P("L23102-1","""
import numpy as np
A = np.arange(6).reshape(2, 3)
print(A.shape, A.T.shape)
""",["(2, 3) (2, 3)","(3, 2) (2, 3)","(6,) (6,)"],"reshape(2,3) 得 (2,3)；轉置後列欄互換成 (3,2)。",1),
P("L23102-1","""
import numpy as np
A = np.array([[1, 2, 3], [4, 5, 6]])
print(A.sum(axis=0))
""",["[ 6 15]","21","[5 7 9]"][:0]+["[ 6 15]","21","[ 9 12]"],"axis=0 沿著列方向（上下）加總，每一欄加起來：[1+4, 2+5, 3+6]。",2),
P("L23102-1","""
import numpy as np
A = np.array([[1, 2, 3], [4, 5, 6]])
print(A.sum(axis=1))
""",["[5 7 9]","21","[ 7 15]"],"axis=1 對每一列加總：[6, 15]。",2),
P("L23102-1","""
import numpy as np
A = np.array([[1, 2], [3, 4]])
B = np.array([[0, 1], [1, 0]])
print(A @ B)
""",["[[0 2]\n [3 0]]","[[1 2]\n [3 4]]","[[4 3]\n [2 1]]"][:0]+["[[0 2]\n [3 0]]","[[1 2]\n [3 4]]","[[3 4]\n [1 2]]"],"@ 是矩陣乘法；B 把 A 的兩欄對調。",2),
P("L23102-6","""
import numpy as np
w = np.array([-2, 3, -1])
print(np.abs(w).sum(), (w ** 2).sum())
""",["6 36","0 14","14 6"],"L1＝2＋3＋1＝6；平方和＝4＋9＋1＝14。",2),
P("L23102-6","""
import numpy as np
print(np.linalg.norm([3, 4]))
""",["7.0","25.0","12.0"],"預設 L2 範數＝√(9＋16)＝5。",1),
P("L23102-1","""
import numpy as np
x = np.array([[1.0, 2.0], [3.0, 4.0]])
print(x.mean(axis=0))
""",["[1.5 3.5]","2.5","[2. 3.]"][:0]+["[1.5 3.5]","2.5","[2.  4. ]"],"axis=0 對每一欄取平均：[(1+3)/2, (2+4)/2]。",2),
P("L23101-4","""
import numpy as np
x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
print(x.mean(), x.std())
""",["5.0 2.5","4.5 2.0","5.0 4.0"],"平均 5；母體標準差（numpy 預設 ddof=0）為 2。",2),
P("L23101-4","""
import numpy as np
x = np.array([1, 2, 3, 4, 100])
print(np.mean(x), np.median(x))
""",["22.0 3.0"][:0]+["22.0 100.0","3.0 22.0","22.0 22.0"],"有離群值時平均被拉高，中位數仍是 3。若你選對，答案是 22.0 3.0。",1),
P("L23101-4","""
import numpy as np
x = np.array([50, 52, 48, 50, 50])
z = (x - x.mean()) / x.std()
print(round(z[1], 2))
""",["2.0","0.5","-1.0"],"平均 50、母體標準差 √1.6≈1.265；(52−50)/1.265≈1.58。",3),
P("L23301-2","""
import numpy as np
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 100])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
print(q1, q3, x[x > q3 + 1.5 * iqr])
""",["3.25 7.75 []","2.0 8.0 [100]","3.25 7.75 [9 100]"],"Q1＝3.25、Q3＝7.75、IQR＝4.5，上界＝14.5，只有 100 超出。",3),
P("L23301-3","""
import numpy as np
x = np.array([10, 20, 30])
print((x - x.min()) / (x.max() - x.min()))
""",["[0.  0.5 1. ]"][:0]+["[0.33333333 0.66666667 1.        ]","[-1.22474487  0.          1.22474487]","[0.1 0.2 0.3]"],"Min-Max 縮放，結果落在 0 到 1。",1),
P("L23301-3","""
import numpy as np
x = np.array([10.0, 20.0, 30.0])
z = (x - x.mean()) / x.std()
print(round(z.mean(), 1), round(z.std(), 1))
""",["20.0 10.0","0.5 0.5","0.0 0.0"],"Z-score 標準化後平均為 0、標準差為 1。",2),
P("L23301-4","""
import pandas as pd
df = pd.DataFrame({"city": ["台北", "台中", "台北", "高雄"]})
print(pd.get_dummies(df["city"]).shape)
""",["(4, 1)","(3, 4)","(4, 4)"],"三種城市→3 欄；4 筆資料→(4, 3)。",1),
P("L23301-4","""
import pandas as pd
df = pd.DataFrame({"sex": ["male", "female", "male"]})
print(list(pd.get_dummies(df, drop_first=True).columns))
""",["['sex_female', 'sex_male']","['sex_female']","['sex']"],"drop_first=True 會刪掉排序後第一欄 female，只留 sex_male。",2),
P("L23301-1","""
import pandas as pd, numpy as np
s = pd.Series([1.0, np.nan, 3.0, np.nan, 8.0])
print(s.fillna(s.mean()).tolist())
""",["[1.0, 0.0, 3.0, 0.0, 8.0]","[1.0, 3.0, 3.0, 8.0, 8.0]","[1.0, 2.0, 3.0, 5.5, 8.0]"],"mean 會跳過 NaN：(1+3+8)/3＝4，所以兩個缺值都補 4.0。",2),
P("L23301-1","""
import pandas as pd, numpy as np
s = pd.Series([1.0, np.nan, 3.0, np.nan, 8.0])
print(s.isna().sum(), s.dropna().shape[0])
""",["3 2","2 5","5 3"],"有 2 個缺值，刪除後剩 3 筆。",1),
P("L23201-2","""
import numpy as np
from sklearn.model_selection import train_test_split
X = np.arange(100).reshape(50, 2); y = np.arange(50)
a, b, c, d = train_test_split(X, y, test_size=0.2, random_state=0)
print(a.shape, b.shape)
""",["(10, 2) (40, 2)","(40, 2) (10, 2)"][:1]+["(50, 2) (10, 2)","(40,) (10,)"],"test_size=0.2 → 訓練 40 筆、測試 10 筆；回傳順序是 X_train, X_test, y_train, y_test。若你答對，輸出是 (40, 2) (10, 2)。",2),
P("L23201-2","""
import numpy as np
from sklearn.preprocessing import StandardScaler
tr = np.array([[1.0], [2.0], [3.0]]); te = np.array([[5.0]])
sc = StandardScaler().fit(tr)
print(sc.transform(te).round(2).tolist())
""",["[[0.0]]","[[1.22]]","[[2.0]]"],"用訓練集平均 2、標準差 0.816：(5−2)/0.816≈3.67。",3),
P("L23303-2","""
from sklearn.metrics import precision_score, recall_score
y = [1, 1, 1, 0, 0, 0, 0, 1]
p = [1, 1, 0, 0, 0, 1, 0, 0]
print(round(precision_score(y, p), 2), recall_score(y, p))
""",["0.5 0.75","0.75 0.5","0.67 0.75","0.5 0.5"],"TP＝2、FP＝1、FN＝2 → Precision＝2/3≈0.667、Recall＝2/4＝0.5。",3),
P("L23303-2","""
from sklearn.metrics import confusion_matrix
y = [1, 0, 1, 1, 0, 0]
p = [1, 0, 0, 1, 1, 0]
print(confusion_matrix(y, p).tolist())
""",["[[2, 1], [1, 2]]"][:0]+["[[1, 2], [2, 1]]","[[2, 1], [2, 1]]","[[1, 2], [1, 2]]"],"sklearn 排列為 [[TN, FP],[FN, TP]]：TN＝2、FP＝1、FN＝1、TP＝2。",3),
P("L23303-2","""
from sklearn.metrics import accuracy_score, f1_score
y = [0]*8 + [1]*2
p = [0]*10
print(accuracy_score(y, p), f1_score(y, p, zero_division=0))
""",["0.8 0.8","0.2 0.0","1.0 1.0"][:0]+["0.8 0.8","0.8 0.5","0.2 0.0"],"全猜 0：Accuracy＝0.8，但 TP＝0 所以 F1＝0.0。若你選對，答案是 0.8 0.0。",3),
P("L23303-4","""
from sklearn.metrics import mean_squared_error, r2_score
y = [2, 4, 6, 8]; p = [3, 4, 5, 8]
print(mean_squared_error(y, p), r2_score(y, p))
""",["0.5 0.95","2.0 0.9","1.0 0.8"],"殘差平方和 2，MSE＝0.5；SS_tot＝20，R²＝1−2/20＝0.9。",3),
P("L23303-4","""
import numpy as np
y = np.array([1, 2, 3]); p = np.array([2, 2, 5])
mse = np.mean((y - p) ** 2)
print(round(mse, 2), round(mse ** 0.5, 2))
""",["5.0 2.24","1.67 1.67","1.29 1.67"],"差值平方 1、0、4 → MSE≈1.67；RMSE≈1.29。若你選對，答案是 1.67 1.29。",3),
P("L23303-5","""
import numpy as np
from sklearn.model_selection import KFold
X = np.arange(6)
for tr, te in KFold(n_splits=3).split(X):
    print(te.tolist(), end=" ")
""",["[0, 3] [1, 4] [2, 5]","[0, 1, 2] [3, 4, 5]","[5, 4] [3, 2] [1, 0]"][:0]+["[0, 3] [1, 4] [2, 5]","[0, 1, 2] [3, 4, 5] [0, 1]","[0] [1] [2]"],"沒打亂時，KFold 依序切成連續的三折：[0,1] [2,3] [4,5]。",2),
P("L23303-6","""
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
X = np.arange(6)
for tr, te in TimeSeriesSplit(n_splits=3).split(X):
    print(tr.tolist(), te.tolist())
""",["[0, 1, 2] [3]\n[0, 1, 2, 3] [4]\n[0, 1, 2, 3, 4] [5]"][:0]+["[0, 1] [2, 3]\n[2, 3] [4, 5]\n[0, 1] [4, 5]","[0, 1, 2] [3]\n[3] [4]\n[4] [5]","[3] [0, 1, 2]\n[4] [0, 1, 2, 3]\n[5] [0, 1, 2, 3, 4]"],"TimeSeriesSplit：訓練集越來越長且永遠在驗證集之前。",3),
P("L23201-6","""
import numpy as np
votes = np.array([[1, 0, 1], [1, 1, 0], [0, 0, 0]])
print((votes.sum(axis=1) >= 2).astype(int).tolist())
""",["[1, 0, 0]","[1, 1, 0]","[0, 0, 1]","[1, 1, 1]"],"逐列投票：和≥2 為 1 → [1, 1, 0]。若你選對，答案是 [1, 1, 0]。",2),
P("L23203-1","""
import numpy as np
z = np.array([2.0, 1.0, 0.1])
p = np.exp(z) / np.exp(z).sum()
print(p.round(2).tolist(), round(p.sum(), 2))
""",["[0.9, 0.05, 0.05] 1.0","[0.5, 0.3, 0.2] 1.0","[0.66, 0.24, 0.1] 1.5"][:2]+["[0.66, 0.24, 0.1] 0.9"],"Softmax 輸出加總永遠為 1：[0.66, 0.24, 0.1]。若你選對，答案是 [0.66, 0.24, 0.1] 1.0。",3),
P("L23203-1","""
import numpy as np
sigmoid = lambda x: 1 / (1 + np.exp(-x))
print(round(sigmoid(0), 2), round(sigmoid(5), 2))
""",["0.0 1.0","1.0 0.5","0.5 5.0"],"sigmoid(0)＝0.5；sigmoid(5)≈0.99。",2),
P("L23203-1","""
import numpy as np
x = np.array([-2.0, 0.0, 3.0])
print(np.maximum(0, x).tolist())
""",["[0.0, 0.0, 3.0]"][:0]+["[-2.0, 0.0, 3.0]","[0.0, 0.0, 9.0]","[2.0, 0.0, 3.0]"],"ReLU＝max(0, x)：負數變 0。若你選對，答案是 [0.0, 0.0, 3.0]。",1),
P("L23103-2","""
w, lr = 2.0, 0.1
for _ in range(3):
    grad = 2 * w          # L = w**2 的梯度
    w = w - lr * grad
print(round(w, 3))
""",["1.6","0.4","1.024"][:0]+["1.6","0.2","1.152"],"每步乘 0.8：2→1.6→1.28→1.024。若你選對，答案是 1.024。",3),
P("L23103-2","""
w, lr = 1.0, 1.5
for _ in range(3):
    w = w - lr * 2 * w
print(w)
""",["0.0","-8.0"][:0]+["0.0","1.0","0.125"],"每步乘 (1−3)＝−2：1→−2→4→−8，越來越大＝學習率太大而發散。若你選對，答案是 −8.0。",3),
P("L23303-8b","""
val = [0.9, 0.7, 0.6, 0.62, 0.63, 0.64, 0.6]
best, wait, patience = float("inf"), 0, 3
for i, v in enumerate(val, 1):
    if v < best: best, wait = v, 0
    else: wait += 1
    if wait == patience:
        print(i); break
""",["4","7","5"],"最佳在第 3 輪(0.6)，之後第 4、5、6 輪各一次沒進步，到第 6 輪 wait＝3 停止。若你選對，答案是 6。",3),
P("L23203-3","""
def conv_out(n, k, s=1, p=0):
    return (n - k + 2 * p) // s + 1
print(conv_out(28, 3), conv_out(28, 5, 1, 2), conv_out(28, 4, 2, 1))
""",["25 28 13","26 28 14","26 24 14","25 24 13"],"28−3＋1＝26；(28−5＋4)/1＋1＝28；(28−4＋2)/2＋1＝14。",3),
P("L23203-3","""
def conv_params(k, c_in, c_out, bias=True):
    return (k * k * c_in + (1 if bias else 0)) * c_out
print(conv_params(3, 3, 16), conv_params(3, 8, 32), conv_params(3, 3, 16, False))
""",["432 2304 432","448 2336 432","448 2304 448","432 2336 432"],"(27＋1)×16＝448；(72＋1)×32＝2336；沒有 bias 為 432。",3),
P("L23203-3","""
import torch, torch.nn as nn
x = torch.zeros(1, 3, 32, 32)
y = nn.Conv2d(3, 8, kernel_size=3, padding=1)(x)
z = nn.MaxPool2d(2)(y)
print(tuple(z.shape))
""",["(1, 8, 16, 16)"][:0]+["(1, 3, 16, 16)","(1, 8, 32, 32)","(1, 8, 15, 15)"],"padding=1 時卷積後邊長不變 (32)，通道變 8；池化邊長減半→16。若你選對，答案是 (1, 8, 16, 16)。",3),
P("L23203-3","""
import torch.nn as nn
m = nn.Linear(784, 100)
print(sum(p.numel() for p in m.parameters()))
""",["78400","784","78501"],"784×100＋100(bias)＝78,500。若你選對，答案是 78500。",2),
P("L23203-7","""
import torch, torch.nn as nn
torch.manual_seed(0)
d = nn.Dropout(0.5)
x = torch.ones(1000)
d.eval()
print(bool((d(x) == x).all()))
""",["False","None","0.5"],"eval 模式下 Dropout 關閉，輸出與輸入相同。若你選對，答案是 True。",2),
P("L23203-7","""
import torch, torch.nn as nn
torch.manual_seed(0)
d = nn.Dropout(0.5)
x = torch.ones(10000)
d.train()
y = d(x)
print(sorted(set(y.tolist())))
""",["[1.0]","[0.0, 0.5]","[0.0, 1.0]"],"訓練時被關掉的設為 0，保留的放大為 1/(1−p)＝2：[0.0, 2.0]。若你選對，答案是 [0.0, 2.0]。",3),
P("L23401-1","""
import pandas as pd
df = pd.DataFrame({"age": [30, 30, 30, 45], "zip": ["A", "A", "A", "B"]})
print(df.groupby(["age", "zip"]).size().min())
""",["3","2","4"],"最小群組只有 1 筆（45, B），所以資料表只達到 k＝1，並未達到 k-匿名。",3,intro="下列程式用 age、zip 當準識別碼，計算這份資料目前達到的 k-匿名 k 值，輸出會是什麼？"),
P("L23202-9","""
n, a, b, ab = 1000, 400, 800, 360
conf = ab / a
lift = conf / (b / n)
print(round(conf, 2), round(lift, 3))
""",["0.9 0.9","0.45 1.125","0.36 0.45"],"信賴度 0.9；Lift＝0.9÷0.8＝1.125。若你選對，答案是 0.9 1.125。",3),
P("L23202-3","""
import numpy as np
def entropy(p):
    p = np.array(p); p = p[p > 0]
    return float(-(p * np.log2(p)).sum()) + 0.0
print(entropy([0.5, 0.5]), entropy([1.0, 0.0]))
""",["0.5 0.0","2.0 0.0","1.0 1.0"],"對半時熵＝1；全純時熵＝0。若你選對，答案是 1.0 0.0。",2),
P("L23202-6","""
import numpy as np
train = np.array([[0.0, 0.0], [1.0, 1.0], [5.0, 5.0]])
labels = np.array([0, 0, 1])
q = np.array([3.5, 3.5])
d = np.linalg.norm(train - q, axis=1)
print(labels[d.argsort()[:1]].tolist(), labels[d.argsort()[:3]].tolist())
""",["[0] [0, 0, 1]","[1] [0, 1, 0]","[1] [1, 0, 0]"][:2]+["[0] [1, 0, 0]"],"最近的是 (5,5)→標籤 1；依距離排 K＝3 是 [1, 0, 0]。若你選對，答案是 [1] [1, 0, 0]。",3),
P("L23102-4","""
import numpy as np
ev = np.array([8, 4, 2, 2])
cum = np.cumsum(ev) / ev.sum()
print(cum.round(3).tolist(), int((cum < 0.8).sum() + 1))
""",["[0.5, 0.75, 0.875, 1.0] 2","[0.5, 0.75, 0.875, 1.0] 4","[8, 12, 14, 16] 3"],"累計 50%、75%、87.5%、100%；第一次≥80% 是第 3 個。若你選對，答案是 [0.5, 0.75, 0.875, 1.0] 3。",3),
P("L23102-3","""
import numpy as np
A = np.array([[2, 0], [0, 3]])
vals, vecs = np.linalg.eig(A)
print(sorted(vals.tolist()))
""",["[0.0, 5.0]","[1.0, 2.0]","[2.0, 3.0, 5.0]"][:0]+["[0.0, 5.0]","[1.0, 2.0]","[3.0, 5.0]"],"對角矩陣的特徵值就是對角線元素：[2.0, 3.0]。",2),
P("L23102-2b","""
import numpy as np
W = np.ones((5, 3)); x = np.ones(3); b = np.zeros(5)
print((W @ x + b).shape)
""",["(3,)","(5, 3)","(3, 5)"],"W(5×3) @ x(3,) 得 (5,)，再加 b 仍是 (5,)。若你選對，答案是 (5,)。",2),
P("L23101-1","""
from math import comb
print(comb(5, 2) * 0.5 ** 5)
""",["0.3125"][:0]+["0.5","0.03125","0.15625"],"C(5,2)＝10，10×(1/32)＝0.3125。若你選對，答案是 0.3125。",3),
P("L23101-1","""
from math import exp, factorial
lam, k = 3, 2
print(round(exp(-lam) * lam**k / factorial(k), 3))
""",["0.224"][:0]+["0.149","0.05","0.5"],"Poisson：e⁻³×9÷2≈0.224。若你選對，答案是 0.224。",3),
P("L23101-2","""
p_d, sens, fpr = 0.01, 0.99, 0.05
pos = p_d * sens + (1 - p_d) * fpr
print(round(p_d * sens / pos, 3))
""",["0.99","0.05","0.5"][:0]+["0.99","0.05","0.5"],"貝氏：0.0099÷(0.0099＋0.0495)≈0.167。若你選對，答案是 0.167。",3),
]
