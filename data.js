const NAV=[
  {id:'overview',label:'首頁',icon:'⌂',type:'link'},
  {id:'articles',label:'文章專欄',icon:'▤',type:'accordion',children:[
    {id:'articles-職安衛',label:'職安衛',tag:'職安衛'},
    {id:'articles-ESG',label:'ESG／永續',tag:'ESG'},
    {id:'articles-AI',label:'AI',tag:'AI'}
  ]},
  {id:'tools',label:'工具總覽',icon:'⚙',type:'accordion',children:[
    {id:'tool-law',label:'法規登記系統',href:'法規登記系統.html'},
    {id:'tool-meeting',label:'會議追蹤工具',href:'會議追蹤工具.html'},
    {id:'tool-training',label:'教育訓練與證照管理',href:'教育訓練與證照管理系統.html'},
    {id:'tool-ghg',label:'溫室氣體盤查系統',href:'溫室氣體盤查系統.html'},
    {id:'tool-bully',label:'職場不法侵害防治工具',href:'職場霸凌防治因應工具.html'},
    {id:'tool-lawmap',label:'職安法子法地圖',href:'職安法子法地圖.html'}
  ]},
  {id:'about',label:'關於我',icon:'ⓘ',type:'link'}
];

const TOOLS=[
  {id:'tool-law',title:'法規登記系統',tags:[['法規管理','tag-blue'],['資料庫','tag-green']],
    desc:'集中管理適用法規清單，追蹤法規修訂與生效日期，建立可隨時查詢的法令資料庫，協助掌握法規異動狀況。',
    href:'法規登記系統.html',category:'osh'},
  {id:'tool-meeting',title:'會議追蹤工具',tags:[['會議管理','tag-yellow']],
    desc:'記錄會議內容、待辦事項與結案狀態，協助持續追蹤決議事項的執行進度。',
    href:'會議追蹤工具.html',category:'osh'},
  {id:'tool-training',title:'教育訓練與證照管理',tags:[['職安衛','tag-blue'],['教育訓練','tag-yellow']],
    desc:'管理人員教育訓練與法定證照紀錄，自動計算回訓到期日，並依事業單位類別與人數自動推算所需證照、時數與回訓週期。',
    href:'教育訓練與證照管理系統.html',category:'osh'},
  {id:'tool-ghg',title:'溫室氣體盤查系統',tags:[['ESG','tag-green']],
    desc:'彙整各範疇排放數據，協助 ESG 報告與碳盤查流程的資料整理與計算。',
    href:'溫室氣體盤查系統.html',category:'esg'},
  {id:'tool-bully',title:'職場不法侵害防治工具',tags:[['職安衛','tag-blue'],['2026修法','tag-red']],
    desc:'依職安法§36快速生成防治計畫書、申訴處理流程圖與懲處規範草案，涵蓋2026修法第三方騷擾新規。',
    href:'職場霸凌防治因應工具.html',category:'osh'},
  {id:'tool-lawmap',title:'職安法子法地圖',tags:[['職安衛','tag-blue'],['5M分類','tag-yellow']],
    desc:'以人機料法環五大面向整理職安法體系子法，異動日期每週自動同步全國法規資料庫，近90天修正自動標紅提醒。',
    href:'職安法子法地圖.html',category:'osh'}
];

const ARTICLES=[
  {id:'a4',date:'2026-06-21',cover:'images/a4-mgmt-vs-bullying.webp',tags:['職安衛','法規','不法侵害'],title:'不法侵害怎麼認定？7月1日職安法霸凌防治專章上路，企業該怎麼準備',
   excerpt:'從4個真實判決拆解「管理」與「霸凌」的法律界線，並解析7月1日起《職業安全衛生法》新增霸凌防治專章對企業申訴、調查機制的新要求，附法規連結與企業端SOP。',
   body:`<img src="images/a4-mgmt-vs-bullying.webp" alt="合理管理 vs 職場霸凌">
   <div class="notion-asset-caption">合理管理與職場霸凌的法律界線示意圖</div>
   <div class="tip-box tip-goal">🎯 這篇文章帶你搞懂：法院怎麼判斷「管理權行使」與「職場霸凌」的界線、7月1日起職安法新增的霸凌防治專章對企業有什麼新義務，以及企業端可以照走的標準處理流程。</div>

   <p>不法侵害這件事，像是一條畫在地上、但肉眼看不見的界線——管理權跟霸凌站在同一條路上，差別只在於有沒有越線。問題是，企業往往要等到員工申訴、甚至上了法院，才發現自己已經踩過去了。</p>
   <p>員工申訴霸凌，不代表行為就一定違法；但企業也不能因此就什麼都不處理。這條界線該怎麼劃，連法院判決彼此之間都各有側重的角度。</p>
   <p>本文從 4 個真實判決拆解法院認定的核心邏輯，並解析 2026 年 7 月 1 日起上路的職安法霸凌防治專章，企業的申訴、調查機制該怎麼準備。</p>

   <hr style="border:none;border-top:1px solid var(--border);margin:24px 0">

   <h4>一、不法侵害的法律定義</h4>
   <p>依《<a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060001" target="_blank" rel="noopener">職業安全衛生法</a>》第 6 條第 2 項規定，雇主對於執行職務因他人行為遭受身體或精神不法侵害，應採取必要的預防措施。白話來說：<b>不是員工「覺得」被霸凌就成立</b>，而是行為要符合特定構成要件，這也是為什麼同樣是主管要求加班、調職，有些被法院認定是合理管理，有些卻被認定是霸凌。</p>

   <h4>二、法院怎麼判斷「管理」跟「霸凌」的界線？四個核心要件</h4>
   <p>整理近期判決可以發現，法院認定不法侵害通常會檢視以下四個要件：</p>
   <table>
     <tr><th>要件</th><th>檢視重點</th></tr>
     <tr><td><b>是否有敵意或惡意</b></td><td>主管是否基於敵視、討厭、歧視等目的</td></tr>
     <tr><td><b>是否持續反覆</b></td><td>單次衝突或單次嚴厲管理，通常不容易構成霸凌</td></tr>
     <tr><td><b>是否逾越社會通念</b></td><td>行為是否超過一般職場可接受的程度</td></tr>
     <tr><td><b>是否與管理目的有關</b></td><td>若基於工作需求、稽核、績效、紀律調整，較可能被認定為管理權行使</td></tr>
   </table>

   <div class="tip-box tip-info">💡 案例整理：以下案例參考自林裕老師（性騷擾調查/職場霸凌調查專業人才）公開彙整的判決重點，案號已附上方便自行查閱原始判決，正式法律行動仍建議委請專業律師核對判決全文。</div>

   <table>
     <tr><th>案件</th><th>案件性質</th><th>判決結果</th><th>法院重點</th></tr>
     <tr><td>能元科技案<br><span style="color:var(--text3);font-size:.8rem">臺南高等行政法院 114重勞上1號</span></td><td>確認僱傭關係存在，雇主依勞基法第12條第1項第4款解僱</td><td>勞方敗訴，解僱合法</td><td>勞工持續拒絕 PIP 與合理調動，已破壞勞資信任；即使部分懲處有瑕疵，核心違規事實「情節重大」仍成立</td></tr>
     <tr><td>信義房屋案<br><span style="color:var(--text3);font-size:.8rem">臺北地方法院 114勞小1號</span></td><td>職場霸凌損害賠償</td><td>勞方敗訴，資方及主管免賠</td><td>搬運年鑑、催促簽呈等屬一般公務指派，未逾越合理範圍，不構成霸凌</td></tr>
     <tr><td>南亞科技案<br><span style="color:var(--text3);font-size:.8rem">新北地方法院 113訴232號</span></td><td>確認僱傭關係存在，雇主依勞基法第11條第5款資遣</td><td>勞方敗訴，資遣合法</td><td>不能勝任不只看能力不足，也包含「能做卻不做」的消極不作為；資方已多次輔導與調整，符合最後手段性</td></tr>
     <tr><td>公審決字案<br><span style="color:var(--text3);font-size:.8rem">115公審決字第000356號</span></td><td>公務員懲處爭議</td><td>復審駁回，申誡一次合法</td><td>霸凌不成立，不代表行為就合法；高聲咆嘯、摔公文、厲聲斥責、黃色笑話，仍屬言行失檢，可予懲處</td></tr>
   </table>

   <h4>三、不一定構成霸凌的管理權行使 vs 高風險行為</h4>
   <table>
     <tr><th>不一定構成霸凌（多屬管理權）</th><th>可能構成霸凌（高風險）</th></tr>
     <tr><td>✅ 要求員工提交報告</td><td>❌ 針對特定人長期羞辱</td></tr>
     <tr><td>✅ 催促簽呈或預算資料</td><td>❌ 公開貶低人格</td></tr>
     <tr><td>✅ 要求交出稽核資料</td><td>❌ 故意孤立、排擠</td></tr>
     <tr><td>✅ 要求配合 PIP</td><td>❌ 不合理加重工作</td></tr>
     <tr><td>✅ 調動部門或工作內容</td><td>❌ 用歧視、敵意語言對待</td></tr>
     <tr><td>✅ 對違規行為約談、懲處</td><td>❌ 申訴後報復懲處</td></tr>
   </table>

   <h4>四、7 月 1 日起，職安法「霸凌防治專章」上路了什麼？</h4>
   <p>過去不法侵害預防主要依附在《職業安全衛生法》第 6 條的概括規定，具體預防措施則寫在《<a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060009" target="_blank" rel="noopener">職業安全衛生設施規則</a>》第 324-3 條這個行政層級的規則裡，並沒有明確規定企業的申訴、調查程序。2026 年 7 月 1 日起，職安法新增「霸凌防治專章」，把不法侵害預防正式拉到法律層級，並依企業規模課予分級義務：</p>
   <table>
     <tr><th>企業規模</th><th>新增義務</th></tr>
     <tr><td>10 人以上</td><td>應建立申訴管道</td></tr>
     <tr><td>30 人以上</td><td>應訂定預防措施（書面計畫）</td></tr>
     <tr><td>100 人以上</td><td>應設置調查委員會</td></tr>
   </table>
   <div class="tip-box tip-warn">⚠️ 新制上路後罰鍰金額大幅提高，企業若未依規定建立申訴、調查機制，最高罰鍰可達 450 萬元。具體條文編號待行政院公告施行版本確定後可能調整，建議上路前直接查閱《<a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060001" target="_blank" rel="noopener">職業安全衛生法</a>》最新版本確認條號。</div>

   <h4>五、企業端標準處理流程（SOP）</h4>
   <img src="images/a4-sop-7steps.webp" alt="企業端標準處理流程 SOP 7步驟">
   <div class="notion-asset-caption">企業端標準處理流程（SOP）7 步驟</div>

   <hr style="border:none;border-top:1px solid var(--border);margin:24px 0">

   <p>從這幾個判決可以看出一句貫穿全部案例的邏輯：<b>職場霸凌不是員工覺得委屈就成立，而是主管行為必須逾越合理管理界線</b>；但反過來，霸凌不成立也不代表行為就毫無問題，公審決字案就是最好的例子。</p>
   <p>7 月 1 日的修法把這條界線的責任更明確地交到企業手上——不是不能管理員工，而是管理行為要有合理理由、正當程序與完整紀錄。</p>
   <p>學會合法管理、理性管理、留痕管理，才能降低企業端的爭訟風險，同時也保護真正受到不法侵害的員工。</p>
   <div class="tip-box tip-info">📌 延伸閱讀：<a href="#" onclick="event.preventDefault();currentSection='articles-職安衛';currentArticle='a1';renderNav();renderMain();window.scrollTo(0,0);">事業單位的安全衛生人員配置怎麼算？</a></div>`},
  {id:'a1',date:'2026-06-15',cover:'images/a1-cover-godzilla.webp',tags:['職安衛','法規'],title:'事業單位的安全衛生人員配置怎麼算？',
   excerpt:'每次人數一變動就要重新查表算一次配置門檻，乾脆把規則整個拆開來看，順手做成系統，下次不用再重算。',
   body:`<img src="images/a1-cover-godzilla.webp" alt="職安衛人員配置怎麼算">
   <div class="notion-asset-caption">事業單位安全衛生人員配置示意圖</div>
   <p>每隔一段時間，HR 那邊就會丟一句「我們這個月又新增了幾個人，職安衛人員夠不夠？」過來。一開始我都是翻法規、查表、用 Excel 手動對照人數區間，算完才發現——上次算的版本早就過期了。後來乾脆把整套規則拆開來看一次，順手寫成系統，這篇就是拆解過程的筆記。</p>

   <div class="summary-box"><div class="summary-title">🎯 這篇文章的重點</div>
   <ul>
     <li>事業單位先分類（第一類／第二類／第三類），分類依據是「行業風險」，不是公司大小</li>
     <li>同一類事業，人數區間不同，應配置的業務主管／管理人員等級也不同</li>
     <li>第一類事業 100～300 人是常見的「卡關區間」：要設乙級＋甲級主管，還要設一級管理單位</li>
     <li>第二類、第三類也有義務，只是門檻人數比較寬鬆，不是「風險低就不用管」</li>
     <li>規則文字很長，但拆成表格之後其實沒那麼可怕</li>
   </ul></div>

   <h4>一、先搞懂「事業單位分類」是怎麼分的</h4>
   <p>《職業安全衛生法施行細則》把所有行業依「危害風險程度」分成第一類、第二類、第三類事業，並由勞動部公告對照表，把每個行業的「行業標準分類代號」對應到這三類裡——也就是說，公司屬於哪一類，**第一步是去查自己登記的行業代號**，不是自己感覺風險高低，也不是看公司人數多寡。同一個人數規模，落在不同類別，配置義務完全不一樣。</p>

   <h4>二、三個類別分別長什麼樣子</h4>
   <table>
     <thead><tr><th>類別</th><th>風險定位</th><th>常見行業舉例</th></tr></thead>
     <tbody>
       <tr><td><strong>第一類</strong></td><td>高風險</td><td>製造業、營造業、礦業及土石採取業、農林漁牧業中的部分高風險作業</td></tr>
       <tr><td><strong>第二類</strong></td><td>中風險</td><td>一般製造業以外的工業、批發零售業、運輸倉儲業、住宿餐飲業</td></tr>
       <tr><td><strong>第三類</strong></td><td>低風險</td><td>金融保險業、不動產業、專業服務業（如會計師、律師事務所）、辦公室型服務業</td></tr>
     </tbody>
   </table>
   <div class="tip">📍 同樣是 150 人的公司，第一類事業要配置的人員規格，會比第三類事業嚴格不少——分類錯了，後面全部算錯，建議先用公司營業登記的行業代號去對照勞動部公告的分類表確認，不要憑感覺判斷。</div>

   <img src="images/a1-three-categories.webp" alt="第一類、第二類、第三類事業示意圖">
   <div class="notion-asset-caption">第一類（製造業）、第二類（批發零售）、第三類（辦公室服務業）事業示意圖</div>

   <h4>三、第一類事業：100～300 人是關鍵卡點</h4>
   <p>以製造業這種第一類事業來說，依規模分級大致如下：</p>
   <ul>
     <li>未滿 30 人：置丙級業務主管 1 人</li>
     <li>30～100 人：乙級業務主管 1 人＋甲級業務主管 1 人</li>
     <li><strong>100～300 人</strong>：乙級業務主管 1 人＋甲級業務主管 1 人（不須專職），並設置「直接隸屬雇主」的一級管理單位</li>
     <li>300～500 人：再加 1 位甲級安全衛生管理師</li>
     <li>500 人以上：業務主管改為專職，且管理單位升級為專責一級管理單位</li>
   </ul>
   <p>人數一旦跨過某個門檻，規格就會往上跳一級——換句話說，公司每次擴編，職安衛配置都要重新對一次表，不是設定好就一輩子不用管。</p>

   <h4>四、第二類事業：門檻比第一類寬，但邏輯一樣</h4>
   <p>第二類事業（例如批發零售、住宿餐飲）風險中等，配置門檻會比第一類事業寬鬆，常見規則大致是：未滿 100 人置丙級業務主管；100～300 人升到乙級業務主管；300～500 人乙級＋甲級業務主管；500 人以上再加 1 位甲級安全衛生管理師。同樣的「人數變動就要重新對表」邏輯，在第二類事業一樣適用。</p>

   <h4>五、第三類事業：門檻最寬，但不是不用管</h4>
   <p>第三類事業（例如金融保險、辦公室型服務業）風險最低，門檻人數拉得最高：未滿 300 人只需丙級業務主管；300～1000 人才升到乙級業務主管；超過 1000 人才需要乙級＋甲級業務主管。門檻寬鬆不代表完全免責，只要超過門檻，一樣得照規定設置。</p>
   <div class="tip">📍 常見誤解：「我們是辦公室，不用管職安衛」。只要勞工人數夠多，第三類事業一樣有配置義務，只是門檻比製造業寬鬆很多，企業常常因為「自認低風險」而忽略這塊。</div>

   <p style="margin-top:24px">把這些區間整理成表格之後，其實邏輯不難，麻煩的是「每次人數變動、或不確定自己事業類別時都要重新查一次」。後來我把這套規則直接寫進「<a href="教育訓練與證照管理系統.html">教育訓練與證照管理系統</a>」工具裡——輸入事業類別與目前人數，系統會自動推算應配置的證照、人數與回訓週期，不用再每次翻法規對表。算是把這篇文章拆解的規則，變成可以重複使用的工具。</p>`},
  {id:'a2',date:'2026-06-10',cover:'images/a2-cover-godzilla.webp',tags:['ESG','溫室氣體'],title:'中小企業做溫室氣體盤查，第一步該從哪裡開始？範疇一、二、三全解析',
   excerpt:'完全沒接觸過溫盤的新手也能看懂：用「邊、源、算、報、查」五個字，帶你走一遍溫室氣體盤查的完整流程。',
   body:`<img src="images/a2-cover-godzilla.webp" alt="中小企業溫室氣體盤查 5步驟一次搞懂">
   <div class="notion-asset-caption">中小企業溫室氣體盤查「邊、源、算、報、查」5步驟</div>
   <p>每次客戶或主管問「我們公司要做溫室氣體盤查，要從哪裡開始」，我都看到對方臉上閃過一絲「這聽起來很麻煩」的表情。說實話，第一次聽到「範疇一、二、三」也覺得很難，但拆開來看，整個流程其實可以濃縮成 5 個字：<strong>邊、源、算、報、查</strong>。把這 5 個字記住，照順序做一遍，就是一次完整的溫盤。</p>

   <div class="summary-box"><div class="summary-title">🎯 這篇文章的重點</div>
   <ul>
     <li>溫盤不是先算數字，是先「畫邊界」決定算誰的</li>
     <li>範疇一二三分別對應「自己排放」「外購能源」「價值鏈間接排放」</li>
     <li>核心公式只有一個：活動量 × 排放係數 = 排放量</li>
     <li>第一次盤查不用急著做外部查證，先把內部資料庫建起來最重要</li>
   </ul></div>

   <div class="step"><div class="num">邊</div><div><h4 style="margin-top:0">畫邊界 — 先決定「算誰的」</h4>
   <p>第一步不是去算數字，而是先決定「這次盤查要算哪些範圍」，叫做<strong>組織邊界</strong>（公司有哪些廠區、辦公室都算進來）與<strong>營運邊界</strong>（要算到範疇一、二，還是連範疇三都算）。</p>
   <div class="tip">💡 新手常見誤解：以為要把「全世界跟公司有關的碳排放」都算進來。其實第一次盤查通常只先抓組織邊界內、自己能直接掌握數據的部分（範疇一、二），範疇三可以之後再逐步擴大。</div></div></div>

   <div class="step"><div class="num">源</div><div><h4 style="margin-top:0">找排放源 — 公司哪裡會排碳？</h4>
   <p>畫完邊界後，要逐一列出邊界內有哪些「會排放溫室氣體的活動」，並依照國際通用的「範疇」分類：</p>
   <table>
     <thead><tr><th>範疇</th><th>定義</th><th>生活化比喻</th><th>常見例子</th></tr></thead>
     <tbody>
       <tr><td><strong>範疇一</strong></td><td>公司自己直接排放</td><td>自己的車自己加的油</td><td>公司自有車輛燃油、鍋爐燃燒、滅火器逸散</td></tr>
       <tr><td><strong>範疇二</strong></td><td>外購能源間接排放</td><td>家裡每月的電費單</td><td>外購電力、外購蒸氣／冷氣</td></tr>
       <tr><td><strong>範疇三</strong></td><td>價值鏈其他間接排放</td><td>買東西時，背後藏的碳足跡</td><td>員工通勤、商務出差、原物料採購、廢棄物處理</td></tr>
     </tbody>
   </table>
   <div class="tip">💡 新手小提醒：範疇一、二是「公司自己能控制」的部分，建議第一次盤查先把這兩塊做好做滿；範疇三項目多又難蒐集，可以排在進階階段再補。</div></div></div>

   <div class="step"><div class="num">算</div><div><h4 style="margin-top:0">算排放量 — 一個公式套到底</h4>
   <p>找到排放源後，計算方式幾乎都是同一個公式：</p>
   <p style="text-align:center;font-family:var(--mono);font-size:1.05rem;background:var(--bg3);padding:14px;border-radius:10px">活動量 × 排放係數 = 溫室氣體排放量（CO2e）</p>
   <p>用加油站比喻最好懂：「加了多少升油（活動量）」乘上「每升油會排多少碳（排放係數，環保署有公告固定數值）」，就等於這次加油實際排放的碳量。電費單也是同樣道理：用了多少度電，乘上台電的「電力排放係數」，就是這個月用電產生的碳排放。</p>
   <div class="tip">💡 排放係數不用自己估算，環境部「溫室氣體排放係數管理表」每年都會公告最新版本，直接查表代入公式即可。</div></div></div>

   <div class="step"><div class="num">報</div><div><h4 style="margin-top:0">報告登錄 — 讓數字正式生效</h4>
   <p>算出各排放源的數值後，要彙整成正式的「溫室氣體排放清冊報告」，並依規定登錄到主管機關指定的平台（如環境部溫室氣體排放量資訊平台），逾規定門檻的事業單位需依法申報。</p>
   <div class="tip">💡 即使公司目前還沒被強制要求申報，先建立內部報告格式與資料庫，未來法規擴大適用範圍或客戶要求 ESG 數據時就不會手忙腳亂。</div></div></div>

   <div class="step"><div class="num">查</div><div><h4 style="margin-top:0">第三方查驗 — 讓數字被外部相信</h4>
   <p>最後一步是請第三方驗證機構（如 SGS、BSI 等）依照 ISO 14064-1 等標準，對盤查結果進行查證，確認數據的計算邏輯與來源證據都經得起檢驗。</p>
   <p>查證後取得的「查驗聲明書」，是企業對外（客戶、投資人、主管機關）證明碳排放數據可信度的關鍵文件，也是申請碳權、迴應供應鏈查核時的必備材料。</p>
   <div class="tip">💡 第一次盤查不一定要馬上做外部查證，可以先完成內部盤查、累積 1～2 年數據後再尋求查證，逐步走完整套流程。</div></div></div>

   <p style="margin-top:24px">把「邊、源、算、報、查」這 5 個步驟走完一輪，就是一次完整的溫室氣體盤查。本系統的「<a href="溫室氣體盤查系統.html">溫室氣體盤查系統</a>」工具，已將範疇一～三的資料登錄與彙整介面準備好，協助企業從零開始逐步建立可追蹤的碳排放資料庫。</p>`},
  {id:'a3',date:'2026-06-01',cover:'images/a3-cover-godzilla.webp',tags:['AI','職安衛'],title:'用 AI 協助職安衛文件管理：從手動到自動化的轉變',
   excerpt:'說實話，職安衛最花時間的從來不是「懂法規」，而是「每個月重複對表」。把規則寫進系統之後，這件事終於不用再手動做了。',
   body:`<img src="images/a3-cover-godzilla.webp" alt="用AI協助職安衛文件管理：從手動到自動化的轉變">
   <div class="notion-asset-caption">職安衛文件管理：從手動比對到 AI 自動化的轉變</div>
   <p>講個老實話：職安衛這個工作，難的從來不是看懂法規條文，而是「每個月都要重複做一次同樣的比對」——這個人的證照是不是要到期了、這個月的會議紀錄誰還沒簽核、公司人數變動了配置夠不夠。一開始我也是滿桌子的證照清單、訓練紀錄、會議紀錄三個資料夾，外加一台快被我按壞的計算機，每次要查證照到期日都要把三個資料夾全部翻一遍。後來忍不住把整套邏輯寫成系統，這篇就是整理這段「從手忙腳亂到自動化」的轉變過程。</p>

   <div class="summary-box"><div class="summary-title">🎯 這篇文章的重點</div>
   <ul>
     <li>職安衛的痛點不是「不懂法規」，而是「重複比對太耗時」</li>
     <li>把法規規則（門檻人數、回訓週期、訓練時數）寫成資料表，就能讓系統自動算</li>
     <li>從「人工查表」變成「輸入資料 → 系統跳出建議」，是這次自動化的核心轉變</li>
     <li>自動化不是取代判斷，是把「重複計算」的部分交出去，人力留給真正需要判斷的事</li>
   </ul></div>

   <h4>一、轉變前：三本資料夾、一台計算機、滿桌便利貼</h4>
   <p>轉變之前的日常大概是這樣：證照清單一本、訓練紀錄一本、會議紀錄一本，旁邊貼著「證照到期？」「訓練時數比對⋯」「會議紀錄誰還沒簽？」的便利貼提醒自己。職安衛日常會反覆碰到三件事——法規異動要比對、證照到期要追蹤、會議決議要持續追蹤執行進度。這些事情單獨看都不難，難的是「量大又重複」：人員一多、證照種類一多，光是對表就佔掉大半天，更別說還要記得每隔幾年法規會修一次，記憶力再好也扛不住。</p>

   <h4>二、轉變後：輸入資料，系統直接告訴你答案</h4>
   <p>後來的做法很單純：把職安衛規則拆成可以查表的資料，而不是記在自己腦子裡或散落在各個 Excel 分頁，例如：</p>
   <ul>
     <li>不同事業類別、不同人數區間，應配置的業務主管／管理人員等級（門檻規則）</li>
     <li>每種證照的回訓週期與初訓／回訓時數（時數規則）</li>
     <li>會議追蹤的待辦事項與結案狀態（流程規則）</li>
   </ul>
   <p>把這些規則寫進系統之後，使用情境就從「我要去查法規、算人數」變成「我輸入目前人數跟類別，系統直接告訴我需要哪些證照、什麼時候要回訓」。下面這張對照表，大概是這次轉變最直接的感受：</p>
   <table>
     <thead><tr><th>項目</th><th>手動管理時期</th><th>AI 自動化管理之後</th></tr></thead>
     <tbody>
       <tr><td>證照到期</td><td>翻證照清單，自己算還剩幾天</td><td>系統依到期日自動跳出「30 天後到期」提醒</td></tr>
       <tr><td>訓練時數</td><td>對著訓練紀錄本逐筆加總</td><td>進度條直接顯示「已完成 80%」，一眼看完</td></tr>
       <tr><td>會議追蹤</td><td>翻會議紀錄找誰還沒簽、哪些還沒結案</td><td>待辦事項／已結案狀態自動分類顯示</td></tr>
     </tbody>
   </table>
   <div class="tip">📍 這裡的「AI」不是指要多花錢買大模型 API，而是用簡單的規則引擎（if 人數在這個區間 → 配置這些人員）就能解決大部分日常重複比對的問題，成本反而低，這也是為什麼這套工具可以完全跑在瀏覽器裡，不需要額外的伺服器費用。</div>

   <h4>三、實際案例：證照回訓提醒怎麼運作</h4>
   <p>以「<a href="教育訓練與證照管理系統.html">教育訓練與證照管理系統</a>」這個工具為例：選擇證照項目後，系統會自動帶入該證照的初訓時數與回訓週期，新增紀錄時也會自動算出下次回訓日，並依「即將到期」「已過期」分類提醒——不用再靠人工記憶或另開提醒表，更不用在桌上貼滿便利貼。</p>

   <h4>四、自動化不是偷懶，是把腦力留給真正需要判斷的事</h4>
   <p>這套轉變最讓我有感的地方，其實不是「省了多少時間」，而是發現自己終於不用把腦容量耗在「記得要去查表」這件事上。法規條文怎麼解讀、員工的個案怎麼處理，這些才是真正需要人去判斷的事；至於「這個人的證照還有幾天到期」，本來就不該占用人腦的記憶體。</p>

   <p style="margin-top:24px">這也是本作品集所有工具背後共同的設計理念：把「規則」寫進系統，把「重複的計算與比對」交給工具，人力留下來處理真正需要判斷與溝通的事情。法規不會自己變簡單，但至少對表這件事，可以不用再靠人腦了。</p>`},
  {id:'a5',date:'2026-07-14',cover:'images/a5-cover-godzilla.webp',tags:['AI'],title:'從認識到打造：手把手教你做出屬於自己的 Claude Skill',
   excerpt:'很多人以為「跟 AI 一直重複貼一樣的指令」就是極限，其實不用。這篇整理 Claude Skills 的觀念與建立方法，從「這是什麼」到「動手做一個」，5 個步驟帶你打造屬於自己的 AI 工作技能包。',
   body:`<img src="images/a5-cover-godzilla.webp" alt="從認識到打造：手把手教你做出屬於自己的 Claude Skill">
   <div class="notion-asset-caption">從「認識 Skills」到「打造第一個 Skill」的完整路徑</div>

   <div class="summary-box"><div class="summary-title">🎯 這篇文章帶你搞懂</div>
   <ul>
     <li>Skill 到底是什麼、跟你平常「複製貼上同一段指令」有什麼本質上的不同</li>
     <li>一個 Skill 資料夾長怎樣、SKILL.md 裡最重要的幾個欄位是什麼</li>
     <li>從零開始，5 個步驟做出你自己的第一個 Skill</li>
     <li>個人 / 專案 / 外掛三種存放位置怎麼選</li>
     <li>一個貼近職安衛場景的實戰範例，以及新手最常踩的雷</li>
   </ul></div>

   <p>我自己每天用 Claude Code 做的事很雜：早上拉 Notion 行程、整理會議紀錄、分析股票、把學習內容存成 Obsidian 知識卡。這些事情如果每次都要重新打一次落落長的指令，光打字就先累了。後來全部改用 Skills 處理——現在只要說一句「今天行程」，背後一整套「去哪個資料庫抓資料、怎麼分類、怎麼寫回去」的流程就自動跑完。這篇文章想把「認識 Skills」到「自己動手做一個」的完整路徑整理出來，不需要寫程式背景也能跟著做。</p>

   <hr style="border:none;border-top:1px solid var(--border);margin:24px 0">

   <h4>一、Skill 到底是什麼？跟「貼一樣的指令」差在哪</h4>
   <p>最直覺的理解：<b>Skill 就是把你重複交代 AI 的做事方法，寫成一份說明書存起來</b>。之後 AI 遇到符合情境的請求，會自己去把這份說明書叫出來讀一遍再開始做事，你不用每次重新解釋一遍「要注意什麼、順序是什麼、格式要長怎樣」。</p>
   <p>官方文件給的判斷標準很實用：<b>當你發現自己一直把同一段指令、checklist 或流程貼進對話框，或是專案說明檔裡有一整段其實是「流程」而不是「事實」，那就是該做成 Skill 的時候了。</b></p>
   <table>
     <thead><tr><th>比較項目</th><th>一直複製貼上指令</th><th>做成 Skill</th></tr></thead>
     <tbody>
       <tr><td>存放位置</td><td>散落在對話紀錄、備忘錄裡，事後很難找</td><td>固定存成資料夾裡的一份檔案，隨時可查、可改</td></tr>
       <tr><td>觸發方式</td><td>每次都要自己想起來、自己貼</td><td>AI 讀到相關請求時「自動」想到並套用</td></tr>
       <tr><td>耗費資源</td><td>每次對話都要重打一次，佔用當次輸入</td><td>不用的時候完全不佔資源，要用才載入（progressive disclosure）</td></tr>
       <tr><td>可攜性</td><td>只活在你腦子或某個人的習慣裡</td><td>可以整包分享給別人、放進專案跟團隊共用</td></tr>
     </tbody>
   </table>
   <div class="tip">💡 用一句話記住差別：Prompt 是「這一次」的臨時指令，Skill 是「以後每一次」都能重複使用的能力包。</div>

   <h4>二、一個 Skill 長什麼樣子：資料夾結構與關鍵欄位</h4>
   <p>每個 Skill 其實就是一個資料夾，裡面至少要有一份 <code>SKILL.md</code>，其他檔案都是選配：</p>
   <pre style="background:var(--bg3);padding:14px;border-radius:10px;overflow-x:auto;font-family:var(--mono);font-size:.85rem;line-height:1.7">my-skill/
├── SKILL.md          ← 必要，主要說明書
├── template.md        ← 選配，要填的範本
├── scripts/
│   └── build.py        ← 選配，AI 可以直接執行的腳本
└── reference.md        ← 選配，較長的參考資料，需要時才載入</pre>
   <p><code>SKILL.md</code> 檔案本身分兩段：最上面用 <code>---</code> 包起來的是 YAML 設定區（frontmatter），下面才是實際要 AI 遵守的說明文字。新手先記住這幾個欄位就夠用：</p>
   <table>
     <thead><tr><th>欄位</th><th>用途</th><th>新手建議</th></tr></thead>
     <tbody>
       <tr><td><b>name</b></td><td>顯示名稱，不填就用資料夾名稱</td><td>可以先不填</td></tr>
       <tr><td><b>description</b></td><td>AI 判斷「什麼時候該用這個 Skill」的依據</td><td>一定要寫，而且要具體，寫清楚適用情境與關鍵字</td></tr>
       <tr><td><b>disable-model-invocation</b></td><td>設 true 代表 AI 不會自己觸發，只有你打指令才會跑</td><td>會寄信、部署、刪東西這類有副作用的動作，一定要設 true</td></tr>
       <tr><td><b>allowed-tools</b></td><td>這個 Skill 執行時可以免詢問直接使用的工具</td><td>不確定就先不填，讓系統照預設權限詢問</td></tr>
       <tr><td><b>argument-hint</b></td><td>輸入指令時顯示的提示文字，例如 [issue-number]</td><td>需要帶參數的 Skill 才需要</td></tr>
     </tbody>
   </table>
   <div class="tip-box tip-info">💡 唯一真正建議一定要寫的欄位只有 <code>description</code>。它會常駐在 AI 的判斷依據裡，寫得越具體、越貼近你平常會講的話，AI 越容易在對的時機自動叫出這個 Skill。</div>

   <h4>三、動手做：5 個步驟打造你的第一個 Skill</h4>
   <img src="images/a5-5steps-godzilla.webp" alt="從重複到自動化的 5 步驟" style="max-width:100%;border-radius:12px;margin:12px 0 20px">

   <div class="step-block"><div class="step-title"><span class="step-num">STEP 1</span>想清楚要解決哪個「重複性工作」</div>
   <p>不是所有事情都值得做成 Skill。先問自己：這件事我是不是一個月內至少重複做了 3 次以上，而且每次的步驟、格式、注意事項都差不多？例如「整理會議紀錄成固定格式」「查行程並更新進度表」都很適合；但只做一次的事，直接對話講清楚就好，不用特地包裝成 Skill。</p>
   <div class="step-done">✅ 完成：你已經有一個明確、會反覆發生的目標任務</div></div>

   <div class="step-block"><div class="step-title"><span class="step-num">STEP 2</span>建立 Skill 資料夾</div>
   <p>個人使用最簡單的做法，是放在個人資料夾裡，所有專案都能共用：</p>
   <pre style="background:var(--bg3);padding:14px;border-radius:10px;overflow-x:auto;font-family:var(--mono);font-size:.85rem">mkdir -p ~/.claude/skills/我的skill名稱</pre>
   <div class="step-done">✅ 完成：資料夾已經建好，等著放進說明書</div></div>

   <div class="step-block"><div class="step-title"><span class="step-num">STEP 3</span>寫 SKILL.md：把你的做事方法交代清楚</div>
   <p>在資料夾裡新增 <code>SKILL.md</code>，上半段填 frontmatter，下半段用條列的方式，把「遇到這種情境時，該照什麼順序做、格式要長怎樣」寫下來，就像在教一位新來的同事做事一樣：</p>
   <pre style="background:var(--bg3);padding:14px;border-radius:10px;overflow-x:auto;font-family:var(--mono);font-size:.85rem;line-height:1.7">---
description: 整理會議逐字稿成結構化紀錄。當使用者貼上會議內容
  或說「幫我整理會議」時使用。
---

## 你的任務
把使用者貼上來的會議內容，整理成以下格式：

1. 會議主題與日期
2. 決議事項（條列）
3. 待辦事項（含負責人、截止日）
4. 需要追蹤的風險或未決議事項

語氣簡潔，不要逐字翻譯，抓重點就好。</pre>
   <div class="step-done">✅ 完成：AI 現在知道「遇到這種情境該怎麼做」</div></div>

   <div class="step-block"><div class="step-title"><span class="step-num">STEP 4</span>實際測試觸發</div>
   <p>寫完之後，用兩種方式驗證都可以正常運作：</p>
   <ul>
     <li><b>讓 AI 自動判斷</b>：直接講一句符合情境的話，例如「幫我整理這份會議紀錄」，看 AI 會不會自己叫出這個 Skill</li>
     <li><b>直接手動指定</b>：輸入 <code>/我的skill名稱</code> 直接觸發，確認內容跑起來沒問題</li>
   </ul>
   <div class="step-done">✅ 完成：確認 Skill 真的能被叫出來，而且輸出符合你要的格式</div></div>

   <div class="step-block"><div class="step-title"><span class="step-num">STEP 5</span>依實際使用情況微調</div>
   <p>第一版通常不會一次到位。如果發現該觸發的時候沒觸發，通常是 <code>description</code> 寫得不夠具體，補上你平常真的會講的關鍵字就好；如果內容跑出來的格式不對，就直接回去改 SKILL.md 的說明文字，不需要重啟，改完馬上生效。</p>
   <div class="step-done">✅ 完成：你已經走完一輪「建立 → 測試 → 調整」，這個 Skill 正式可以長期使用了</div></div>

   <h4>四、存放位置怎麼選？</h4>
   <p>同一份 Skill 放的位置不同，能用的範圍也不同：</p>
   <table>
     <thead><tr><th>存放位置</th><th>路徑</th><th>誰能用</th></tr></thead>
     <tbody>
       <tr><td><b>個人</b></td><td><code>~/.claude/skills/</code></td><td>你自己所有專案都能用，最適合個人日常工作流程</td></tr>
       <tr><td><b>專案</b></td><td><code>.claude/skills/</code>（放在專案資料夾裡）</td><td>只有這個專案能用，適合跟團隊一起共用、一起進版控</td></tr>
       <tr><td><b>外掛（Plugin）</b></td><td>打包成 plugin 分享</td><td>可以發布出去讓其他人安裝使用</td></tr>
     </tbody>
   </table>
   <div class="tip">💡 剛開始不用想太多，先全部放個人資料夾練手感；等到某個 Skill 已經穩定、而且是團隊共用的流程，再考慮搬進專案資料夾一起進版控。</div>

   <h4>五、實戰範例：做一個「職安衛週報」Skill</h4>
   <p>用一個貼近職安衛工作的例子收尾。假設你每週都要把「本週稽核結果、教育訓練進度、待改善事項」彙整成固定格式的週報，可以這樣寫：</p>
   <pre style="background:var(--bg3);padding:14px;border-radius:10px;overflow-x:auto;font-family:var(--mono);font-size:.85rem;line-height:1.7">---
description: 產出職安衛週報。當使用者說「幫我做這週的職安衛週報」
  或「整理本週稽核與訓練進度」時使用。
disable-model-invocation: true
---

## 你的任務
向使用者索取以下三項本週資料（若使用者已提供則直接使用）：
1. 稽核結果（含缺失項目與改善期限）
2. 教育訓練完成進度
3. 待改善事項與負責人

整理成以下固定格式的週報：
- 標題：{年月日} 職安衛週報
- 一、本週稽核重點
- 二、教育訓練進度
- 三、待改善事項追蹤表（負責人／期限／狀態）
- 四、下週工作重點

語氣正式，適合直接寄給主管。</pre>
   <p>特別注意這裡把 <code>disable-model-invocation</code> 設成 <code>true</code>——週報通常是要主動觸發、確認資料沒問題才送出的動作，不太適合讓 AI 自己「覺得時機到了」就自動生成，這也是下一段要提醒的重點。</p>

   <h4>六、新手最常踩的雷</h4>
   <div class="tip-box tip-warn">⚠️ <b>有副作用的動作，一定要設 disable-model-invocation: true。</b>寄信、部署、刪除資料這類做了就很難復原的事，不要讓 AI 自己判斷「時機到了」就觸發，一定要改成你手動打指令才會跑，才不會在你還沒確認資料的時候就搶先送出去。</div>
   <div class="tip-box tip-warn">⚠️ <b>description 寫得太籠統，AI 根本不會想到要用它。</b>「這是一個很好用的工具」這種描述沒有任何幫助，要具體寫出「什麼情境」「使用者可能會怎麼講」，關鍵字要跟你平常說話的方式一致。</div>
   <div class="tip">💡 內容不用一次寫到完美，SKILL.md 本來就是「用著改、改著用」的東西，先求有再求好，用個兩三次之後再回頭優化最快。</div>

   <p style="margin-top:24px">把重複的工作流程寫成 Skill，本質上跟本作品集其他工具背後的想法是同一件事：<b>把「規則」與「流程」交給系統記住，人力留給真正需要判斷的事</b>。之前在〈用 AI 協助職安衛文件管理〉那篇提過，職安衛最耗時間的從來不是懂法規，而是重複對表；Skills 則是把這個邏輯往前推一步——連「怎麼對表」這個做事方法本身，都可以直接寫成一份說明書交給 AI 記住。從今天開始，找一件你這週已經重複做第三次的事，把它寫成你的第一個 Skill 吧。</p>`}
];
