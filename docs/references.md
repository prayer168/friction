# 內容查核與來源

查核日期：2026-07-14

## 核心來源

1. OpenStax, *University Physics Volume 1*, 6.2 Friction

   https://openstax.org/books/university-physics-volume-1/pages/6-2-friction

   用途：查核摩擦力方向、靜摩擦與動摩擦定義、`fs ≤ μsN`、`fk = μkN`、材料組合與正向力關係，以及此模型為經驗近似。

   使用方式：只採概念與公式，未重製圖片或長文。

2. Georgia State University, HyperPhysics, *Friction*

   https://hyperphysics.phy-astr.gsu.edu/hbase/frict.html

   用途：交叉查核摩擦係數、正向力，以及啟動物體通常比維持滑動需要更大作用力。

   使用方式：只採概念摘要，未嵌入外部資產。

3. University of Colorado Boulder, PhET, *Forces and Motion: Basics*

   https://phet.colorado.edu/zh_TW/simulations/forces-and-motion-basics

   用途：交叉查核以推力、摩擦滑桿、力箭頭、速度與加速度組成的適齡互動模式。

   使用方式：作為延伸資源；本教材程式與視覺均自行製作。

4. Purdue University, Hardware Store Science, *Contact Forces: Sliding Friction*

   https://www.purdue.edu/hardware-store-science/wp-content/uploads/2021/09/9.0-Contact-Forces-Sliding-Friction_STEM-Content.pdf

   用途：交叉查核靜摩擦隨外力增加至上限、滑動後動摩擦近似穩定，以及實驗教學脈絡。

   使用方式：只採教學概念，未重製圖表。

5. OpenStax, *Physics*, 5.4 Inclined Planes

   https://openstax.org/books/physics/pages/5-4-inclined-planes

   用途：查核斜坡上重力沿坡分力、正向力、摩擦力方向，以及比較不同表面需要多大角度才開始滑動的教學設計。

   使用方式：只採力學關係與探究問題，SVG、數值模型與文字均為本教材原生製作。

## 教材中的簡化與推論

- 水平桌面上取正向力 `N ≈ mg`；模擬以 `g=10 m/s²` 計算。
- 表面模型設定：滑面 `μs=0.18, μk=0.12`；一般面 `0.35, 0.25`；粗糙面 `0.65, 0.48`。這些是教學用相對設定，網頁與文件均未宣稱為材料查表值。
- 箱子開始滑動後的動畫位移用來表達「有向右合力」，不是按真實時間與距離比例呈現。
- 接觸面放大圖為示意；文字明確補充材料分子作用、表面污染與變形等因素。
- 斜坡滑幣模型使用 `N=mg cosθ`、沿坡分力 `mg sinθ`；當 `mg sinθ > μsN` 才啟動，滑動後以 `a=g(sinθ−μk cosθ)` 計算坡上加速度。
- 錢幣平放且不滾動，斜坡長 1.20 m；坡底速度以 `v²=2aL` 計算，再以固定測距墊的 `d=v²/(2μkg)` 得到停止距離。三種斜坡係數與測距墊係數皆為教學比較設定。

## 資產授權

- HTML、CSS、JavaScript 與所有 SVG／CSS 圖像均為本專案原生製作。
- 生活應用頁八張 WebP 情境插圖於 2026-07-14 使用 OpenAI Image 2.0 依本教材專屬提示生成，未使用第三方照片、圖示或品牌資產；提示要求無文字、無標誌並維持科學接觸位置。
- 生成圖以專案內 960×640 WebP 提供，原始生成檔保留於 Codex 圖庫；網頁不依賴圖庫或外部影像網址。
- 未下載、描摹或嵌入第三方圖片、圖示、字型或音訊。
