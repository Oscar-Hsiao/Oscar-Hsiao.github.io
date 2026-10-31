import sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '.')
from pyhelp import P
START = 652
def C(code,intro): return intro+"\n```\n"+code.strip('\n')+"\n```"
ITEMS = [
P("L23304-1a","""
from sklearn.model_selection import ParameterGrid
grid = {"C": [0.1, 1, 10], "kernel": ["linear", "rbf"], "gamma": [0.01, 0.1, 1, 10]}
print(len(ParameterGrid(grid)), len(ParameterGrid(grid)) * 5)
""",["9 45","24 24","14 70","12 60"],"3×2×4＝24 組；5 折交叉驗證總訓練次數 24×5＝120（不含最後重新訓練）。",3,intro="下列網格搜尋有幾組參數組合？搭配 5 折交叉驗證又要訓練幾次？輸出為何？"),
P("L23304-2","""
import numpy as np
from sklearn.linear_model import Lasso, Ridge
rng = np.random.RandomState(0)
X = rng.randn(200, 5)
y = 3 * X[:, 0] + 0.5 * rng.randn(200)      # 只有第 0 個特徵有用
print(int((Lasso(alpha=0.5).fit(X, y).coef_ == 0).sum()), int((Ridge(alpha=0.5).fit(X, y).coef_ == 0).sum()))
""",["0 4","0 0","4 4","5 0"],"Lasso（L1）把無用特徵的係數壓成精確的 0；Ridge（L2）只縮小，不會剛好為 0。",3,intro="只有第 0 個特徵真正有用，下列程式輸出（Lasso 係數為 0 的個數、Ridge 係數為 0 的個數）為何？"),
P("L23202-8","""
import numpy as np
from sklearn.cluster import DBSCAN
X = np.array([[1, 1], [1.1, 1], [1, 1.1], [5, 5], [5.1, 5], [5, 5.1], [20, 20]])
labels = DBSCAN(eps=0.5, min_samples=2).fit_predict(X)
print(labels.tolist())
""",["[0, 0, 0, 1, 1, 1, 2]","[0, 0, 0, 0, 0, 0, 0]","[-1, -1, -1, 0, 0, 0, 1]","[0, 0, 0, 1, 1, 1, 0]"],"DBSCAN 不需指定群數，離群的點標為 −1（雜訊）。",3,intro="下列 DBSCAN 的分群標籤輸出為何？"),
P("L23202-8","""
import numpy as np
from sklearn.cluster import KMeans
X = np.array([[1, 1], [1.2, 1], [8, 8], [8.2, 8], [8, 8.2]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print(sorted(np.bincount(km.labels_).tolist()))
""",["[1, 4]","[2, 2]","[5]","[1, 1, 3]"],"K-means 依距離分成兩群：左下 2 筆、右上 3 筆。",2,intro="K-means 分成兩群後，各群的樣本數（由小到大）為何？"),
P("L23102-4","""
import numpy as np
from sklearn.decomposition import PCA
X = np.random.RandomState(0).randn(100, 6)
print(PCA(n_components=2).fit_transform(X).shape)
""",["(100, 6)","(2, 6)","(100, 4)","(6, 2)"],"PCA 不改變樣本數，只把欄位數降成 2。",1),
P("L23102-4","""
import numpy as np
from sklearn.decomposition import PCA
X = np.random.RandomState(0).randn(100, 6)
p = PCA().fit(X)
print(len(p.explained_variance_ratio_), round(float(p.explained_variance_ratio_.sum()), 2))
""",["2 1.0","6 0.5","100 1.0","6 6.0"],"不設 n_components 會保留全部 6 個主成分，解釋變異量比例加總為 1。",2),
P("L23303-5","""
import numpy as np
from sklearn.model_selection import StratifiedKFold
y = np.array([0]*8 + [1]*2)
X = np.zeros((10, 1))
print([int(y[te].sum()) for _, te in StratifiedKFold(n_splits=2).split(X, y)])
""",["[2, 0]","[0, 2]","[1, 1]","[4, 4]"][:3]+["[0, 0]"],"分層切分讓每折都保有相同比例的少數類（各 1 筆）。",3,intro="資料有 8 筆 0、2 筆 1，用 StratifiedKFold(2) 切折，各折測試集中 1 的個數為何？"),
P("L23301-7","""
import numpy as np
y = np.array([0]*95 + [1]*5)
pred = np.zeros(100, dtype=int)
print((pred == y).mean(), (pred[y == 1] == 1).mean())
""",["0.05 0.95","0.95 0.95","1.0 1.0","0.95 1.0"][:2]+["0.5 0.5","0.05 0.0"],"全猜 0 的 Accuracy＝0.95，但 Recall＝0.0。",2,intro="全部預測為 0 的模型，輸出（Accuracy, 少數類 Recall）為何？"),
P("L23103-5b","""
import numpy as np
g = np.array([30.0, 40.0])             # 梯度向量，L2 範數 = 50
max_norm = 5.0
scale = min(1.0, max_norm / np.linalg.norm(g))
print((g * scale).round(1).tolist())
""",["[30.0, 40.0]","[5.0, 5.0]","[0.6, 0.8]","[15.0, 20.0]"],"範數 50 超過上限 5，等比例縮小成 0.1 倍：[3.0, 4.0]（方向不變）。",3,intro="梯度裁剪（clip by norm）後的梯度為何？"),
P("L23103-4","""
import numpy as np
v, beta, lr = 0.0, 0.9, 0.1
for g in [1.0, 1.0, 1.0]:
    v = beta * v + g
    print(round(v, 3), end=" ")
""",["1.0 1.0 1.0","0.1 0.1 0.1","1.0 1.9 3.0","0.9 1.71 2.439"],"Momentum 累積過去的方向：1.0、1.9、2.71。",3,intro="動量（Momentum）累積量 v 的輸出為何？"),
P("L23203-1b","""
import numpy as np
logits = np.array([2.0, -1.0, 0.5])
p = 1 / (1 + np.exp(-logits))
print(p.round(2).tolist(), round(float(p.sum()), 2) == 1)
""",["[0.88, 0.27, 0.62] True","[0.66, 0.04, 0.3] True","[0.88, 0.27, 0.62] False"][:1]+["[0.66, 0.04, 0.3] True","[0.5, 0.5, 0.5] False","[0.88, 0.27, 0.62] True"][:3],"對每個 logit 各自做 sigmoid（多標籤）：機率不必加總為 1。",3,intro="對 logits 逐一套用 sigmoid（多標籤做法），輸出為何？"),
P("L23101-4","""
import pandas as pd
s = pd.Series([2, 4, 4, 4, 5, 5, 7, 9])
print(s.quantile(0.25), s.quantile(0.75), s.median())
""",["2.0 7.0 4.0","3.5 6.5 4.5","4.0 5.0 4.5","3.5 6.5 5.0"],"pandas 預設線性插值：Q1＝4.0、Q3＝5.5、中位數＝4.5。",3),
P("L23301-1","""
import pandas as pd, numpy as np
df = pd.DataFrame({"a": [1, np.nan, 3], "b": [np.nan, np.nan, 6]})
print(df.isna().mean().round(2).tolist())
""",["[0.33, 0.67]"][:0]+["[0.5, 0.5]","[1, 2]","[0.67, 0.33]","[0.33, 1.0]"],"a 缺 1／3＝0.33；b 缺 2／3＝0.67。",2,intro="下列程式計算各欄位缺失比例，輸出為何？"),
P("L23301-4","""
import pandas as pd
df = pd.DataFrame({"level": ["Bronze", "Gold", "Silver", "Gold"]})
order = {"Bronze": 0, "Silver": 1, "Gold": 2}
print(df["level"].map(order).tolist())
""",["[0, 1, 2, 1]","[1, 0, 2, 0]","[2, 0, 1, 0]","[0, 2, 1, 2]"][:0]+["[0, 1, 2, 1]","[1, 0, 2, 0]","[2, 0, 1, 0]"],"有序類別用對應表編碼：Bronze→0、Silver→1、Gold→2。",1),
P("L23303-6","""
import pandas as pd
s = pd.Series([10, 20, 30, 40, 50])
print(s.rolling(3).mean().round(1).tolist())
""",["[10.0, 15.0, 20.0, 30.0, 40.0]","[nan, nan, 20.0, 30.0, 40.0]"][:0]+["[10.0, 15.0, 20.0, 30.0, 40.0]","[20.0, 30.0, 40.0]","[nan, 15.0, 25.0, 35.0, 45.0]"],"rolling(3) 前兩筆不足 3 個值，結果為 NaN。",2),
P("L23301-8","""
import pandas as pd
s = pd.Series([10, 20, 30, 40])
print(s.shift(1).tolist())
""",["[20, 30, 40, nan]","[10, 20, 30, 40]","[nan, 10.0, 20.0, 30.0]"][:0]+["[20.0, 30.0, 40.0, nan]","[10, 20, 30, 40]","[nan, 20.0, 30.0, 40.0]"],"shift(1) 把資料往下移一格，是最常用的滯後特徵（lag 1）。",2),
P("L23301-9","""
import numpy as np
x = np.array([1, 10, 100, 1000])
print(np.log10(x).tolist(), np.log1p(np.array([0, 9])).round(2).tolist())
""",["[1, 2, 3, 4] [0.0, 2.3]","[0.0, 1.0, 2.0, 3.0] [0.0, 9.0]","[10, 100, 1000, 10000] [0.0, 2.3]","[0.0, 1.0, 2.0, 3.0] [1.0, 10.0]"],"log10 把每相差 10 倍的數壓成相差 1；log1p(0)＝0，log1p(9)＝ln10≈2.3，可處理含 0 的資料。",2),
P("L23201-5","""
import numpy as np
from sklearn.preprocessing import StandardScaler
train = np.array([[0.0], [10.0]]); test = np.array([[20.0]])
a = StandardScaler().fit(train).transform(test)[0, 0]
b = StandardScaler().fit(test).transform(test)[0, 0]
print(a, b)
""",["4.0 0.0","2.0 1.0","0.0 4.0","4.0 4.0"],"正確做法（訓練集 fit）得 3.0；用測試集自己 fit，標準化後必為 0.0，等於資料洩漏且尺度不一致。",3,intro="StandardScaler 以訓練集 fit，與錯誤地以測試集自己 fit，所得的結果分別為（a b）？"),
(C("""
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)
""","下列程式碼的主要問題是什麼？")[:0] or "指引","L23201-5",
 "下列程式碼的主要問題是什麼？\n```\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nX_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)\n```",
 "在切分前就對全部資料 fit，測試集統計量洩漏進訓練",["train_test_split 不能接受標準化後的資料","StandardScaler 不能用在 y 以外的資料","test_size 不可以設成 0.2 以外的數值"],"fit_transform(X) 的 X 含測試集；應先切分，只用 X_train fit。",2,'Python'),
("回馬槍","L23201-5","下列程式碼用於交叉驗證，哪一行最可能造成洩漏？\n```\nX_sel = SelectKBest(f_classif, k=10).fit_transform(X, y)   # A\nscores = cross_val_score(model, X_sel, y, cv=5)             # B\n```",
 "A 行：先用全部資料與標籤挑特徵，再交叉驗證",["B 行：cv 設為 5","B 行：沒有指定 scoring 參數","A 行：k 設為 10 太小"],"任何用到資料與標籤的步驟（特徵選擇、標準化、降維）都要放進交叉驗證每一折，建議用 Pipeline。",3,'Python'),
("回馬槍","L23301-7","下列做法中，哪一個把 SMOTE 用在正確位置？",
 "只在訓練集呼叫 fit_resample，測試集保持原樣",["先對全部資料 SMOTE，再 train_test_split","只對測試集做 SMOTE 讓比例平衡","訓練集與測試集都 SMOTE 以保持一致"],"口訣：考卷不能動，只有課本可以加料。",2,'Python'),
("指引","L23201-2","寫法 A：`train_test_split(X, y, test_size=0.2)`；寫法 B：`train_test_split(X, y, test_size=0.2, stratify=y)`。兩者的差別是？",
 "B 會讓訓練與測試集的類別比例與原資料一致",["B 會讓測試集變成 0.4","A 一定會讓資料洩漏","兩者結果完全相同"],"stratify=y 做分層抽樣，適合類別不平衡的分類資料。",2,'Python'),
("指引","L23303-6","要預測下週的銷量，資料依日期排列，下列切分哪個正確？\n```\n# A\ntrain_test_split(X, y, test_size=0.2, shuffle=True)\n# B\ntrain_test_split(X, y, test_size=0.2, shuffle=False)\n```",
 "B：shuffle=False，保持時間順序",["A：shuffle=True，打亂更公平","兩者都可以，結果一樣","A：因為資料量夠多"],"時間序列打亂就是用未來預測過去，造成時間洩漏。",2,'Python'),
("回馬槍","L23203-7","PyTorch 推論（預測）時，下列哪種寫法最完整？",
 "model.eval() 搭配 with torch.no_grad():",["只寫 torch.no_grad()","只寫 model.train()","不用任何設定，直接 model(x)"],"eval() 關閉 Dropout、BatchNorm 用累積統計；no_grad() 省記憶體。",2,'Python'),
("指引","L23103-5b","PyTorch 訓練迴圈中，梯度裁剪應放在哪個位置？\n```\noptimizer.zero_grad()\nloss = criterion(model(x), y)\n# (1)\nloss.backward()\n# (2)\noptimizer.step()\n# (3)\n```",
 "(2)：backward 之後、step 之前",["(1)：backward 之前","(3)：step 之後","放在哪裡都一樣"],"梯度在 backward 才算出來；要在更新權重前裁剪。",2,'Python'),
("回馬槍","L23203-1b","PyTorch 做 4 類互斥分類，損失函數為 nn.CrossEntropyLoss()，最後一層該怎麼寫？",
 "nn.Linear(h, 4)，不加 Softmax",["nn.Sequential(nn.Linear(h, 4), nn.Softmax(dim=1))","nn.Linear(h, 1)","nn.Sequential(nn.Linear(h, 4), nn.Sigmoid())"],"CrossEntropyLoss 內建 LogSoftmax＋NLLLoss，輸入要是 logits。",2,'Python'),
("回馬槍","L23203-1b","Keras 做 3 類互斥分類，標籤為整數 0、1、2，下列何者正確？\n```\nmodel.add(Dense(3, activation='softmax'))\nmodel.compile(loss=???, optimizer='adam')\n```",
 "sparse_categorical_crossentropy",["binary_crossentropy","categorical_crossentropy","mean_squared_error"],"整數標籤用 sparse；One-Hot 標籤才用 categorical。",2,'Python'),
("回馬槍","L23203-1b","Keras 多標籤分類（一張圖可同時有貓、狗、草地），下列設定何者正確？",
 "Dense(3, activation='sigmoid')，loss='binary_crossentropy'",["Dense(3, activation='softmax')，loss='categorical_crossentropy'","Dense(1, activation='sigmoid')，loss='binary_crossentropy'","Dense(3, activation='relu')，loss='mse'"],"多標籤各自是／否，每個輸出獨立用 sigmoid。",2,'Python'),
("指引","L23203-3","Keras 程式：Conv2D(32, (3,3), padding='same') 接 MaxPooling2D((2,2))，輸入為 (32, 32, 3)，輸出形狀是？",
 "(16, 16, 32)",["(32, 32, 32)","(30, 30, 3)","(15, 15, 32)"],"same 邊長不變，通道＝濾波器數 32；池化邊長減半 16。",2,'Python'),
("指引","L23203-3","Keras 程式：Conv2D(16, (5,5), padding='valid')，輸入 (28, 28, 1)，輸出形狀是？",
 "(24, 24, 16)",["(28, 28, 16)","(24, 24, 1)","(23, 23, 16)"],"valid 不補零：28−5＋1＝24；通道數＝濾波器數 16。",2,'Python'),
("指引","L23203-7","Keras 中，要在驗證損失連續 3 輪沒進步時停止訓練並還原最佳權重，應如何設定？",
 "EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)",["EarlyStopping(monitor='loss', patience=3)","EarlyStopping(monitor='val_loss', patience=0)","ModelCheckpoint(monitor='accuracy')"],"要監控驗證指標（val_loss），而不是訓練損失。",2,'Python'),
("回馬槍","L23302-2","下列 sklearn 建模流程，何者順序正確？",
 "read_csv → 特徵工程 → train_test_split → fit → predict",["read_csv → fit → train_test_split → 特徵工程 → predict","train_test_split → read_csv → predict → fit","read_csv → predict → fit → train_test_split"],"fit 在切分之後；predict 在 fit 之後。",1,'Python'),
("指引","L23301-4","`pd.get_dummies(df, columns=['city'], drop_first=True)` 的 drop_first=True 主要目的是？",
 "避免虛擬變數共線性，K 類只留 K−1 欄",["讓類別順序依字母排列","刪除資料的第一筆樣本","把類別轉成連續數值"],"一欄可由其他欄推得（共線性）。",2,'Python'),
("指引","L23302-2","要把標準化與分類器串成一個流程，並避免交叉驗證洩漏，較合適的寫法是？\n```\npipe = Pipeline([('scaler', StandardScaler()), ('clf', LogisticRegression())])\ncross_val_score(pipe, X, y, cv=5)\n```",
 "此寫法正確：每折只用訓練折 fit 標準化",["此寫法錯誤：Pipeline 不能放標準化","此寫法錯誤：標準化會用到驗證折的資料","此寫法錯誤：cross_val_score 不能搭配 Pipeline"],"Pipeline 把前處理與模型包在一起，每折各自 fit。",2,'Python'),
("指引","L23303-5","`cross_val_score(clf, X, y, cv=5)` 對分類器（clf）預設用哪種切法？",
 "StratifiedKFold（分層）",["TimeSeriesSplit","LeaveOneOut","普通 KFold 並打亂"],"cv 為整數且是分類器時，sklearn 預設分層；迴歸則是普通 KFold。",2,'Python'),
("易混淆","L23202-6","KNN 程式 `KNeighborsClassifier(n_neighbors=1)` 在訓練集上準確率 100%、驗證集很低，應如何調整？",
 "增大 n_neighbors，例如 5 或 15",["把 n_neighbors 再調成 1","把特徵全部取對數","移除標準化"],"K 太小（1）容易過擬合；增大 K 讓邊界平滑。",2,'Python'),
("指引","L23202-2b","`LogisticRegression(C=0.01)` 與 `LogisticRegression(C=100)`，哪個正則化較強？",
 "C＝0.01 較強（C 是 λ 的倒數）",["C＝100 較強","兩者相同","要看是否標準化才能決定"],"過擬合時把 C 調小。",2,'Python'),
("易混淆","L23304-3","PyTorch 在驗證階段忘了 model.eval()，模型含 Dropout，可能的結果是？",
 "每次預測結果略有不同，準確度可能下降",["結果會更穩定","記憶體用量大幅變小","梯度被自動關閉"],"Dropout 仍在隨機關神經元。",2,'Python'),
("指引","L23303-2","程式 `tp / (tp + fn)` 計算的是什麼指標？",
 "Recall（召回率）",["Precision（精確率）","Accuracy（準確率）","Specificity（特異度）"],"分母是實際為正的數量；Precision 的分母是 tp＋fp。",1,'Python'),
("指引","L23303-4","程式 `1 - ss_res / ss_tot` 計算的是什麼指標？",
 "R²（決定係數）",["RMSE","MAE","Accuracy"],"ss_res＝殘差平方和；ss_tot＝總變異平方和。",2,'Python'),
("回馬槍","L23102-1","a、b 為 numpy 陣列，下列何者能算出內積？",
 "np.dot(a, b)",["a * b","a + b","np.cross(a, b)"],"* 是逐元素相乘；內積要用 np.dot 或 @。",1,'Python'),
("考古題","L23102-1","（114-2 改編）numpy 中算反矩陣、行列式、特徵值，分別用哪個函式？",
 "np.linalg.inv、np.linalg.det、np.linalg.eig",["np.linalg.eig、np.linalg.inv、np.linalg.det","np.linalg.det、np.linalg.eig、np.linalg.inv","np.dot、np.linalg.inv、np.linalg.det"],"inv＝反矩陣、det＝行列式、eig＝特徵值（特徵向量）。",2,'Python'),
("指引","L23101-1","要從伯努利／二項分布模擬 1000 次拋硬幣，常見做法是？",
 "np.random.binomial(1, 0.5, size=1000)",["np.random.normal(0.5, 1, 1000)","np.random.shuffle(1000)","np.dot(0.5, 1000)"],"binomial(n=1, p) 即伯努利試驗。",2,'Python'),
("指引","L23101-7","用蒙地卡羅估計圓周率：在單位正方形內隨機丟點，統計落在四分之一圓內的比例 r，則 π 約為？",
 "4 × r",["r ÷ 4","2 × r","r × r"],"四分之一圓面積＝π/4，所以 π≈4×落入比例。",2,'Python'),
("考古題","L23201-1","（115-1 改編）以 `IsolationForest` 或 `OneClassSVM` 只用大量正常資料訓練，偵測異常，屬於哪類學習？",
 "非監督／半監督的異常偵測",["監督式二元分類","強化學習","遷移學習"],"只需要正常資料，不需要故障標註。",2,'Python'),
]
