# 斜坡滑幣物理稽核

檢查日期：2026-07-14
結果：59/59 通過
數值容許誤差：1e-9

## 模型範圍

- 錢幣平放滑動，不處理滾動。
- 斜坡長 1.20 m；斜坡表面可變；水平測距墊固定為 μk 0.22。
- 啟動條件：`mg sinθ > μs mg cosθ`。
- 滑下加速度：`g(sinθ − μk cosθ)`。
- 坡底速度與水平停止距離分別以等加速度關係獨立驗證。

## 檢查結果

- PASS｜smooth：臨界角以下保持靜止｜5° → 靜止
- PASS｜smooth：臨界角等值保持靜止｜6.842773° → 靜止
- PASS｜smooth：臨界角以上開始滑動｜7° → 滑動
- PASS｜medium：臨界角以下保持靜止｜16° → 靜止
- PASS｜medium：臨界角等值保持靜止｜16.699244° → 靜止
- PASS｜medium：臨界角以上開始滑動｜17° → 滑動
- PASS｜rough：臨界角以下保持靜止｜26° → 靜止
- PASS｜rough：臨界角等值保持靜止｜26.565051° → 靜止
- PASS｜rough：臨界角以上開始滑動｜27° → 滑動
- PASS｜smooth 25°：normal｜actual=0.177636326, expected=0.177636326
- PASS｜smooth 25°：downhill｜actual=0.082833179, expected=0.082833179
- PASS｜smooth 25°：staticMax｜actual=0.021316359, expected=0.021316359
- PASS｜smooth 25°：friction｜actual=0.014210906, expected=0.014210906
- PASS｜smooth 25°：acceleration｜actual=3.431113660, expected=3.431113660
- PASS｜smooth 25°：bottomSpeed｜actual=2.869611957, expected=2.869611957
- PASS｜smooth 25°：distance｜actual=1.909710757, expected=1.909710757
- PASS｜smooth 25°：criticalAngle｜actual=6.842773413, expected=6.842773413
- PASS｜smooth 25°：運動分類｜actual=true, expected=true
- PASS｜medium 25°：normal｜actual=0.177636326, expected=0.177636326
- PASS｜medium 25°：downhill｜actual=0.082833179, expected=0.082833179
- PASS｜medium 25°：staticMax｜actual=0.053290898, expected=0.053290898
- PASS｜medium 25°：friction｜actual=0.039079992, expected=0.039079992
- PASS｜medium 25°：acceleration｜actual=2.187659376, expected=2.187659376
- PASS｜medium 25°：bottomSpeed｜actual=2.291371315, expected=2.291371315
- PASS｜medium 25°：distance｜actual=1.217621174, expected=1.217621174
- PASS｜medium 25°：criticalAngle｜actual=16.699244234, expected=16.699244234
- PASS｜medium 25°：運動分類｜actual=true, expected=true
- PASS｜rough 25°：normal｜actual=0.177636326, expected=0.177636326
- PASS｜rough 25°：downhill｜actual=0.082833179, expected=0.082833179
- PASS｜rough 25°：staticMax｜actual=0.088818163, expected=0.088818163
- PASS｜rough 25°：friction｜actual=0.082833179, expected=0.082833179
- PASS｜rough 25°：acceleration｜actual=0.000000000, expected=0.000000000
- PASS｜rough 25°：bottomSpeed｜actual=0.000000000, expected=0.000000000
- PASS｜rough 25°：distance｜actual=0.000000000, expected=0.000000000
- PASS｜rough 25°：criticalAngle｜actual=26.565051177, expected=26.565051177
- PASS｜rough 25°：運動分類｜actual=false, expected=false
- PASS｜smooth 45°：normal｜actual=0.138592929, expected=0.138592929
- PASS｜smooth 45°：downhill｜actual=0.138592929, expected=0.138592929
- PASS｜smooth 45°：staticMax｜actual=0.016631151, expected=0.016631151
- PASS｜smooth 45°：friction｜actual=0.011087434, expected=0.011087434
- PASS｜smooth 45°：acceleration｜actual=6.375274739, expected=6.375274739
- PASS｜smooth 45°：bottomSpeed｜actual=3.911605728, expected=3.911605728
- PASS｜smooth 45°：distance｜actual=3.548390393, expected=3.548390393
- PASS｜smooth 45°：criticalAngle｜actual=6.842773413, expected=6.842773413
- PASS｜smooth 45°：運動分類｜actual=true, expected=true
- PASS｜rough 45°：normal｜actual=0.138592929, expected=0.138592929
- PASS｜rough 45°：downhill｜actual=0.138592929, expected=0.138592929
- PASS｜rough 45°：staticMax｜actual=0.069296465, expected=0.069296465
- PASS｜rough 45°：friction｜actual=0.052665313, expected=0.052665313
- PASS｜rough 45°：acceleration｜actual=4.296380802, expected=4.296380802
- PASS｜rough 45°：bottomSpeed｜actual=3.211123468, expected=3.211123468
- PASS｜rough 45°：distance｜actual=2.391306569, expected=2.391306569
- PASS｜rough 45°：criticalAngle｜actual=26.565051177, expected=26.565051177
- PASS｜rough 45°：運動分類｜actual=true, expected=true
- PASS｜smooth：角度增加時滑行距離增加｜30°=2.349 m, 40°=3.172 m
- PASS｜medium：角度增加時滑行距離增加｜30°=1.688 m, 40°=2.587 m
- PASS｜rough：角度增加時滑行距離增加｜30°=0.932 m, 40°=1.918 m
- PASS｜同為 30°：光滑面比一般面滑得遠｜2.349 m > 1.688 m
- PASS｜同為 30°：一般面比粗糙面滑得遠｜1.688 m > 0.932 m

## 重跑

`npm.cmd run audit:physics`
