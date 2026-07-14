# 測試報告

測試日期：2026-07-14

環境：Windows 11、Node.js、Chromium（桌機／平板／手機 viewport）

## 自動檢查

| 項目 | 結果 |
|---|---|
| `npm.cmd test`：頁籤、雙實驗、案例、題目、無障礙、來源、圖片資產、社群 metadata 與占位掃描 | 通過（19/19） |
| `npm.cmd run audit:physics`：斜坡臨界角、受力、加速度、速度、距離與趨勢 | 通過（59/59） |
| `npm.cmd run build`：靜態正式建置 | 通過；`dist/` 含 HTML、CSS、`incline-model.js`、SVG 與 WebP 資產 |
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
- `docs/screenshots/public-lab-mobile.png`：GitHub Pages 公開版 390×844 推箱互動結果。

初次目視發現推箱位移後，SVG 力箭頭的預設 marker 隨線寬放大並遮住箱體。已改為 `markerUnits="userSpaceOnUse"`、縮小示意位移，讓箭頭與箱子同步後以相同步驟重測通過。

## 1.0.1 公開部署驗證

- Repository：https://github.com/prayer168/friction
- GitHub Pages：https://prayer168.github.io/friction/
- Pages 來源：`main` 分支根目錄；狀態 `built`；HTTPS 強制啟用。
- 公開首頁、`styles.css`、`app.js`、`assets/favicon.svg`、`assets/social-preview.png`、`facebook-post.txt` 均回應 HTTP 200。
- 社群縮圖公開回應 `image/png`，檔案 149,609 bytes，尺寸精確為 1200×630。
- 公開 HTML 的 `og:url`、`og:image` 與 `twitter:card=summary_large_image` 均為正式絕對 HTTPS 值。
- 公開版 390×844 逐頁檢查：七頁籤皆 `scrollWidth=clientWidth=390`，無頁面水平溢出。
- 公開推箱實驗：4 kg、一般面、20 N 推力，結果為「開始滑動」、動摩擦力 10.0 N、合力 10.0 N。
- 公開版主控台 0 個錯誤、無錯誤覆蓋層；首頁、CSS、JavaScript 與 favicon 的瀏覽器請求均回應 200。

## 1.1.0 生活應用圖像驗證

- 八張生活應用圖案以 OpenAI Image 2.0 逐張重新繪製，統一為教室立體模型風格，並最佳化為 960×640 WebP 專案內資產。
- 桌機 1440×1000 為四欄、平板 768×1024 為兩欄、手機 390×844 為單欄；三種 viewport 均無頁面水平溢出。
- 八張圖片皆載入完成、自然尺寸皆為 960×640，且各自具備描述情境與摩擦力線索的繁體中文替代文字。
- 翻卡後 `aria-expanded=true`，背面解說完整可見；圖片載入不影響原有翻卡與鍵盤操作。
- 首頁、CSS、JavaScript、favicon 與八張 WebP 圖片的瀏覽器請求全部回應 HTTP 200；主控台 0 個錯誤。
- 專案未使用外部圖片 URL，公開教材不依賴第三方圖片服務。
- 目視證據：`docs/screenshots/applications-image2-desktop.png`、`applications-image2-tablet.png`、`applications-image2-mobile.png`。

## 1.2.0 斜坡滑幣驗證

- 物理模型：錢幣平放且不滾動；斜坡長 1.20 m、角度 5°–45°，三種斜坡表面；水平測距墊固定為 `μk=0.22`。
- 獨立數值稽核 59/59 通過：三種表面各測臨界角下方、臨界角等值與上方，並核對 `N`、`mg sinθ`、最大靜摩擦、動摩擦、加速度、坡底速度與停止距離。
- 關鍵結果：25°一般面滑行 1.22 m；25°粗糙面停住；30°粗糙面滑行 0.93 m；45°光滑面滑行 3.55 m。
- 趨勢檢查：固定表面時，30°到 40°的滑行距離增加；固定 30°時，光滑面距離大於一般面，一般面大於粗糙面。
- 互動狀態：必須先預測；設定變更會清除舊結果；最多記錄 6 次；切換場景或主頁籤會停止動畫，返回時恢復正確結果位置。
- 無障礙：雙實驗頁籤支援 ArrowLeft、ArrowRight、Home、End；`aria-selected`、`hidden`、即時回饋與 SVG 描述同步。
- 降低動畫：媒體查詢命中時，錢幣直接抵達計算後的停止位置，完整讀數與紀錄功能仍保留。
- 1440×1000、768×1024、390×844 均為 `scrollWidth=clientWidth`；手機紀錄表只在自身容器橫向捲動。
- 本機瀏覽器首頁、CSS、`incline-model.js`、`app.js`、favicon 均回應 HTTP 200；主控台 0 個錯誤、無錯誤覆蓋層。
- GitHub Pages 功能提交 `aae26a4` 建置狀態為 `built`；公開首頁、CSS、`incline-model.js`、`app.js` 與兩份物理稽核檔均回應 HTTP 200。
- 公開版 390×844 實測：30°粗糙面臨界角 26.6°，預測「不到 1 m」後得到 0.93 m；`scrollWidth=clientWidth=390`，主控台 0 個錯誤、無錯誤覆蓋層。
- 目視證據：`docs/screenshots/incline-initial-desktop.png`、`incline-result-desktop.png`、`incline-result-tablet.png`、`incline-result-mobile.png`。
- 完整物理稽核：`audit/incline-physics-audit.md` 與 `audit/incline-physics-audit.json`；重跑指令為 `npm.cmd run audit:physics`。

## 已知限制

- 教材是比較用乾燥滑動模型，不替代真實材料量測。
- 斜坡模型不處理錢幣滾動、彈跳、空氣阻力、坡底碰撞損失或材料係數隨速度改變；動畫時間為方便觀察的視覺時間。
- 未加入音效，避免課堂干擾並降低認知負荷。
