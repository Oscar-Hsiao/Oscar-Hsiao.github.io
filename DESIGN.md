---
name: Oscar Hsiao — 職安 × AI × 永續
description: 個人作品集／部落格，主題為職業安全衛生、ESG 永續與 AI 應用工具
colors:
  ink: "#23282E"
  ash: "#6B7280"
  mist: "#A3ABB5"
  paper: "#FAF9F7"
  surface: "#FFFFFF"
  surface-2: "#F3F1ED"
  border: "#E6E3DD"
  border-strong: "#D8D4CC"
  navy: "#1D4E89"
  navy-bg: "#E4ECF6"
  copper: "#B8742E"
  copper-bg: "#F7ECDD"
  sage: "#3A6B45"
  sage-bg: "#E9F1E9"
  sidebar: "#2E3440"
typography:
  display:
    fontFamily: "Noto Serif TC, Georgia, serif"
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Noto Serif TC, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans TC, -apple-system, 'Segoe UI', 'Microsoft JhengHei', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "JetBrains Mono, 'Courier New', monospace"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "20px"
  lg: "32px"
  xl: "48px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-hover:
    backgroundColor: "{colors.surface}"
  tag-navy:
    backgroundColor: "{colors.navy-bg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  tag-copper:
    backgroundColor: "{colors.copper-bg}"
    textColor: "{colors.copper}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  tag-sage:
    backgroundColor: "{colors.sage-bg}"
    textColor: "{colors.sage}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.mist}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
  nav-item-active:
    backgroundColor: "#3D4452"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
---

# Design System: Oscar Hsiao — 職安 × AI × 永續

## 1. Overview

**Creative North Star: "The Regulatory Atelier"**

這是一間把法規條文當作素材、用設計工藝重新打磨的工作室。基調延續現有淺色、紙感的閱讀體驗——這對長文與法規條文的可讀性是對的——但把過去那套「Notion 灰白 + 鼠尾草藍/綠/黃」的安全色盤，換成一組更有主張的顏色：深琉璃藍（navy）作為品牌主色，呼應法規與職安的權威感；溫潤的金屬銅（copper）作為強調色，標示 AI／工具相關的內容；草本綠（sage）保留給 ESG／永續主題，但飽和度提高，不再是裝飾性的淺綠標籤。

本系統明確拒絕 SaaS 行銷頁的套路：不使用漸層文字、不做「大數字 + 小標籤」的核心指標牆、不讓四個同形卡片並排成牆。指標數據改用更克制的文字化呈現，工具卡片之間以內容差異（標籤、狀態、敘述長度）建立節奏，而不是視覺上的整齊劃一。

**Key Characteristics:**
- 紙感淺色背景，深藍灰文字，高可讀性
- 一個飽和、有記憶點的主色（深琉璃藍），其餘為輔助色
- 卡片輕微浮起、柔和陰影，邊框退居其次
- 襯線（Noto Serif TC）用於標題，建立出版物般的權威感；正文用 Noto Sans TC；資料/標籤用 JetBrains Mono

## 2. Colors

整體是「克制的淺色基調 + 一個飽和主色」的策略：背景與卡片維持接近紙白的中性色，深琉璃藍承擔品牌識別與互動色的角色，銅色與草本綠是次要的語意色（AI/工具、ESG）。

### Primary
- **深琉璃藍 Deep Glaze Blue** (#1D4E89): 連結、互動元素的 hover/active 狀態、品牌強調文字、圖表主色。比舊版的 #1F6C9F 更飽和、更深，建立權威感而非「安全藍」。

### Secondary
- **溫潤銅 Warm Copper** (#B8742E): 標示 AI／自動化／工具相關標籤與重點數字，與深琉璃藍形成暖冷對比，是整套系統裡少數允許「搶眼」的顏色。

### Tertiary
- **草本綠 Herb Sage** (#3A6B45): ESG／永續主題的語意色，飽和度高於舊版的 #346538 淺綠，避免「裝飾性綠色標籤」的感覺。

### Neutral
- **墨色 Ink** (#23282E): 主要文字顏色，所有正文、標題使用，對比度遠高於舊版 #2F3437。
- **灰燼 Ash** (#6B7280): 次要文字、說明文字、meta 資訊。
- **薄霧 Mist** (#A3ABB5): 第三層文字、側邊欄未啟用項目文字、極淡的輔助說明。
- **紙白 Paper** (#FAF9F7): 頁面背景。
- **表面白 Surface** (#FFFFFF): 卡片、輸入框背景。
- **次表面 Surface-2** (#F3F1ED): 區塊分隔背景、hover 狀態的淡背景。
- **邊框 Border** (#E6E3DD) / **強邊框 Border-strong** (#D8D4CC): 卡片與分隔線。
- **側邊欄墨藍 Sidebar** (#2E3440): 側邊欄背景，比舊版 #4E565C 更深、更偏藍灰，與深琉璃藍主色同一色系，視覺上把側邊欄和品牌色綁在一起。

### Named Rules
**The One Saturated Voice Rule.** 整個介面只有深琉璃藍與銅色兩個飽和色可以「被注意到」；草本綠維持中等飽和度作語意標示，其餘一律是中性紙色與墨色。任何畫面中飽和色覆蓋面積不超過 15%。

## 3. Typography

**Display Font:** Noto Serif TC (with Georgia, serif)
**Body Font:** Noto Sans TC (with -apple-system, 'Segoe UI', 'Microsoft JhengHei', sans-serif)
**Label/Mono Font:** JetBrains Mono (with 'Courier New', monospace)

**Character:** 襯線標題＋無襯線正文的經典出版物配對，建立「這是一份被仔細編輯過的專業內容」的感覺；JetBrains Mono 僅用於日期、標籤、資料數值等「機器產生」的資訊，與敘述性文字明確區分。

### Hierarchy
- **Display** (600, clamp(1.8rem, 4vw, 2.6rem), 1.3): 頁面主標題（Hero h1）。
- **Title** (600, 1.25rem, 1.4): 卡片標題、文章標題、區塊副標。
- **Body** (400, 0.95rem, 1.8): 正文、卡片描述，行寬上限 70ch。
- **Label** (600, 0.7rem, letter-spacing 0.08em, uppercase): 區塊分類標籤（如「最新文章」）、標籤 chip、metric label。

### Named Rules
**The One Typeface Per Role Rule.** 標題只用 Noto Serif TC，正文只用 Noto Sans TC，資料/標籤只用 JetBrains Mono；三者不互相混用於同一語意角色。

## 4. Elevation

整體偏扁平，邊框與底色分層為主，但卡片允許「輕微浮起」的柔和陰影——呼應紙張疊放的質感，而非數位玻璃感。

### Shadow Vocabulary
- **card-rest** (`box-shadow: 0 1px 2px rgba(35,40,46,0.04)`): 卡片預設狀態，極淡，幾乎只在邊緣可察覺。
- **card-hover** (`box-shadow: 0 8px 24px rgba(35,40,46,0.08)`): 卡片 hover 時的浮起感，搭配 `transform: translateY(-2px)`。

### Named Rules
**The Paper Stack Rule.** 陰影只用來表示「這張卡片離桌面有多遠」，永遠是中性墨色的低透明度陰影，禁止使用任何彩色光暈（glow）或漸層陰影。

## 5. Components

### Buttons / Links
- **Shape:** 文字連結為主，無背景按鈕；若需要實心按鈕，使用 `{rounded.sm}` (6px)。
- **Primary（連結）:** 文字色為深琉璃藍 (#1D4E89)，無底色，依語意加箭頭符號。
- **Hover / Focus:** 文字略微加深至 #163A66，並加上 2px 的 `outline` 於 focus-visible 狀態，確保鍵盤可見。

### Chips / Tags
- **Style:** `{rounded.pill}`，padding `4px 12px`，字級 `{typography.label}`。
- **語意配色:** 深琉璃藍系 `tag-navy`（法規/管理類）、銅色 `tag-copper`（AI/工具/教育訓練）、草本綠 `tag-sage`（ESG/永續）。每個標籤只承擔一個語意分類，不疊加裝飾色。

### Cards / Containers
- **Corner Style:** `{rounded.lg}` (14px)，比舊版 10-12px 略大，呼應「紙張」的柔和邊角。
- **Background:** `{colors.surface}` (#FFFFFF)，置於 `{colors.paper}` (#FAF9F7) 背景之上。
- **Shadow Strategy:** `card-rest` → `card-hover`（見 Elevation），搭配 `translateY(-2px)`。
- **Border:** 1px `{colors.border}`，hover 時不變色，靠陰影表達互動。
- **Internal Padding:** `{spacing.md}`–`{spacing.lg}` (20-32px)。

### Metrics（總覽指標）
不採用「四欄同形大數字卡片」的 SaaS 模板。改為單行文字化敘述（例如「目前已上線 4 項工具，涵蓋職安衛 3 項、ESG 1 項，累積文章 3 篇」），數字以 `{typography.label}`（JetBrains Mono）穿插在句子中強調，而非獨立成卡片牆。

### Navigation（側邊欄）
- **Style:** 深色側邊欄 `{colors.sidebar}` (#2E3440)，與主色同一藍灰色系。
- **Typography:** 群組標題使用 `{typography.label}`，導覽項目使用 `{typography.body}` 但縮小至 0.85rem。
- **States:** 預設文字色 `{colors.mist}`；hover 時背景 `rgba(255,255,255,.06)`、文字轉白；active 項目背景 `#3D4452`、文字 `{colors.paper}`，並在左側加入 2px 的深琉璃藍指示條（僅此一處允許邊框型強調，作為「目前位置」的功能性指示，非裝飾）。
- **Mobile:** 900px 以下隱藏側邊欄（維持現有行為），未來可改為頂部摺疊選單。

## 6. Do's and Don'ts

### Do:
- **Do** 使用深琉璃藍 (#1D4E89) 作為唯一的主互動色，銅色 (#B8742E) 與草本綠 (#3A6B45) 僅作語意標籤。
- **Do** 卡片使用 `card-rest` → `card-hover` 的柔和陰影 + `translateY(-2px)`，邊框維持 1px `{colors.border}`。
- **Do** 標題一律使用 Noto Serif TC，正文 Noto Sans TC，資料/標籤 JetBrains Mono，三者角色不互換。
- **Do** 正文文字使用 `{colors.ink}` (#23282E)，確保對比度 ≥ 4.5:1；次要文字使用 `{colors.ash}` (#6B7280)，不要再用接近白色的淺灰。

### Don't:
- **Don't** 使用「大數字 + 小標籤」的四欄指標卡片牆（hero-metric template）；改用文字化敘述。
- **Don't** 在任何卡片、列表項或提示框上使用超過 1px 的 `border-left`/`border-right` 色條作裝飾。
- **Don't** 對標題文字使用漸層 (`background-clip: text` + gradient)。
- **Don't** 讓相同造型的卡片（icon + 標題 + 文字）無差異地重複排列；以內容差異與不規則節奏取代整齊的網格牆。
- **Don't** 使用接近白色的淺灰作正文文字（如舊版 `#787774` 用於說明文字以外的內容）；對比不足的「優雅淺灰」是讀起來最累的設計。
