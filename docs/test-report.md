# 測試報告

測試日期：2026-07-14

環境：Windows 11、Node.js、Chromium（桌機／平板／手機 viewport）

## 自動檢查

| 項目 | 結果 |
|---|---|
| `npm.cmd test`：頁籤、案例、題目、互動、無障礙、來源與占位掃描 | 通過（14/14） |
| `npm.cmd run build`：靜態正式建置 | 通過；`dist/` 含 HTML、CSS、JS、SVG 資產 |
| `npm.cmd audit`：套件安全檢查 | 通過；0 個弱點 |
| `git diff --cached --check`：空白與衝突標記 | 通過 |

## 瀏覽器驗證

| Viewport | 主要檢查 | 結果 |
|---|---|---|
| 1440×1000 | 七頁籤、推箱實驗、五階段動畫、翻卡、10 題測驗 | 通過；頁面與活動無水平溢出 |
| 768×1024 | 單欄重排、翻卡雙欄、按鈕觸控尺寸 | 通過；七頁籤逐頁 `scrollWidth=clientWidth=768` |
| 390×844 | 導覽橫向捲動、控制單欄、紀錄表橫向容器 | 通過；七頁籤逐頁 `scrollWidth=clientWidth=390` |

## 互動與科學檢核

- 邊界案例：0 N 推力、最小／最大質量、三種表面、剛好等於與略超過靜摩擦上限。
- 4 kg 一般面結果：0 N 與 14 N 保持靜止；16 N 開始滑動、動摩擦力 10 N、合力 6 N；80 N 合力 70 N。
- 狀態同步：設定改變後清除舊結果；預測是測試必要步驟；紀錄只接受最新有效測試。
- 動畫：播放、暫停、重播、逐步跳轉與切頁停止計時器。
- 無障礙：頁籤方向鍵、可見焦點、ARIA 狀態、即時回饋、降低動畫模式。
- 鍵盤：任務頁籤聚焦後按 ArrowRight，正確切換至探索頁籤。
- 降低動畫：媒體查詢命中，箱子轉場縮短至 `0.000001 s`，資訊與控制保留。
- 測驗：十題正確答案可得 10/10；每題作答後鎖定並顯示解釋，總結區正確出現。
- 主控台：0 個頁面錯誤；無框架錯誤覆蓋層。
- 網路：首頁、`styles.css`、`app.js`、`assets/favicon.svg` 皆回應 200，無失敗請求。

## 目視證據

- `docs/screenshots/mission-desktop.png`：任務首頁與四項可觀察目標。
- `docs/screenshots/lab-moving-desktop.png`：推箱開始滑動、力箭頭、讀數與證據解讀。
- `docs/screenshots/lab-mobile.png`：手機單欄控制、模擬、回饋與紀錄表容器。
- `docs/screenshots/animation-stage5-desktop.png`：動摩擦階段、能量轉移線索與控制。
- `docs/screenshots/applications-desktop.png`、`applications-tablet.png`：八案例與翻卡狀態。
- `docs/screenshots/quiz-desktop.png`、`quiz-complete-desktop.png`：作答鎖定、即時回饋與完成總結。

初次目視發現推箱位移後，SVG 力箭頭的預設 marker 隨線寬放大並遮住箱體。已改為 `markerUnits="userSpaceOnUse"`、縮小示意位移，讓箭頭與箱子同步後以相同步驟重測通過。

## 已知限制

- 教材是比較用乾燥滑動模型，不替代真實材料量測。
- 未加入音效，避免課堂干擾並降低認知負荷。
