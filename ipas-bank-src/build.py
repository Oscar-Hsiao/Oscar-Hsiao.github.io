#!/usr/bin/env python3
"""合併 ipas-bank-src/batch_*.json → ipas-s3-bank.js，並做品質檢查。用法: python3 build.py"""
import json,glob,re,sys,collections,os
d=os.path.dirname(os.path.abspath(__file__))
Q=[]
import random
for f in sorted(glob.glob(d+'/batch_*.json')):
    Q+=json.load(open(f,encoding='utf8'))
nid=max([q['id'] for q in Q] or [0])+1
for f in sorted(glob.glob(d+'/batch_*.py')):
    ns={}; exec(open(f,encoding='utf8').read(),ns)
    nid=ns.get('START',nid)
    for it in ns['ITEMS']:
        tag,code,q,right,wrongs,exp=it[:6]
        o=[right]+list(wrongs); r=random.Random(nid*7919); r.shuffle(o)
        dd={'id':nid,'ch':int(code[3])+2,'tag':tag,'code':code,'q':q,'opts':o,'ans':o.index(right),'exp':exp}
        if len(it)>=8: dd['diff'],dd['kind']=it[6],it[7]
        Q.append(dd); nid+=1
for f in sorted(glob.glob(d+'/fixes_*.py')):
    ns={}; exec(open(f,encoding='utf8').read(),ns)
    for q in Q:
        if q['id'] in ns['FIXES']:
            r,w=ns['FIXES'][q['id']]
            r=r or q['opts'][q['ans']]
            o=[r]+list(w); random.Random(q['id']*7919).shuffle(o)
            q['opts']=o; q['ans']=o.index(r)
def classify(q):
    t=q['q']; mx=max(len(o) for o in q['opts'])
    neg=bool(re.search(r'不正確|不是|錯誤|最不|不適用|不屬於|何者不|不會',t))
    if re.search(r'np\.|numpy|pd\.|\.fit|sklearn|PyTorch|Keras|torch|Pipeline|clip_grad|get_dummies|drop\(|model\.|Dense\(|Conv2D|Conv2d|loss\.|optimizer|cross_val|KFold|train_test_split|StandardScaler\(|sparse_categorical|from_logits|import ',t): kind='Python'
    elif re.search(r'\d',t) and re.search(r'多少|幾個|幾倍|幾次|第幾|算出|約為|是多少|共有幾|機率最接近',t): kind='計算'
    elif len(t)>=42 or re.match(r'^(某|一|公司|工廠|銀行|醫院|假設|有一|在查詢|保險|貸款|電商|客服|想|要)',t): kind='情境'
    else: kind='概念'
    if kind=='計算' or (neg and q['tag'] in('回馬槍','易混淆')) or q['tag']=='考古題' or mx>=32: diff=3
    elif q['tag']=='指引' and len(t)<=34 and not neg: diff=1
    elif kind=='情境' and q['tag']=='回馬槍': diff=3
    else: diff=2
    return diff,kind
for q in Q:
    if 'diff' not in q: q['diff'],q['kind']=classify(q)
bad=[];warn=[];ids=set();texts=set()
for i,q in enumerate(Q):
    tag=f"#{q.get('id','?')}"
    if q.get('id') in ids: bad.append(tag+' id重複')
    ids.add(q.get('id'))
    if q.get('ch') not in (3,4,5,6): bad.append(tag+' ch錯')
    if q.get('tag') not in ('回馬槍','易混淆','考古題','指引'): bad.append(tag+' tag錯')
    if not re.match(r'L23\d{3}-',q.get('code','')): bad.append(tag+' code錯')
    elif int(q['code'][3])+2!=q['ch']: bad.append(tag+' code與ch不符')
    o=q.get('opts',[])
    if len(o)!=4 or len(set(o))!=4: bad.append(tag+' 選項非4個相異')
    if q.get('ans') not in (0,1,2,3): bad.append(tag+' ans錯')
    if not q.get('exp'): bad.append(tag+' 缺解析')
    if q['q'] in texts: bad.append(tag+' 題目重複')
    texts.add(q['q'])
    if len(o)==4 and q.get('ans') in (0,1,2,3):
        L=[len(x) for x in o]; a=L[q['ans']]
        if a>=14 and a>max(L[k] for k in range(4) if k!=q['ans'])*1.4+4: warn.append(q['id'])
    if re.search(r'以上(皆|都)|皆是|皆非|(選項|答案)\s*[A-D]',json.dumps(o,ensure_ascii=False)): bad.append(tag+' 選項互相引用')
print('總題數',len(Q))
print('章節',dict(sorted(collections.Counter(q['ch'] for q in Q).items())))
print('題型',dict(collections.Counter(q['tag'] for q in Q)))
longest=sum(1 for q in Q if len(q['opts'][q['ans']])==max(len(x) for x in q['opts']))
print('正解為最長選項的比例 %.0f%%'%(longest*100/len(Q)))
print('難度',dict(sorted(collections.Counter(q['diff'] for q in Q).items())),'題型',dict(collections.Counter(q['kind'] for q in Q)))
print('答案分布(新題原始)',dict(sorted(collections.Counter(q['ans'] for q in Q).items())),'(頁面會再洗牌)')
print('⚠ 正解明顯偏長(待修)',len(warn),'題:',warn)
for b in bad: print('❌',b)
if bad: sys.exit(1)
open(os.path.dirname(d)+'/ipas-s3-bank.js','w',encoding='utf8').write('const Q = '+json.dumps(Q,ensure_ascii=False,separators=(',',':'))+';\n')
print('✅ 已寫出 ipas-s3-bank.js')
