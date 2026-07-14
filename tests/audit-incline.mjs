import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const config=JSON.parse(await readFile(resolve(root,'physics-audit.json'),'utf8'));
await import('../incline-model.js');
const actualModel=globalThis[config.modelGlobal];
const tolerance=config.tolerance;
const checks=[];
const near=(actual,expected,tol=tolerance)=>Math.abs(actual-expected)<=tol;
const add=(name,pass,details)=>checks.push({name,pass,details});

function expected(angleDeg,surfaceKey){
  const {gravity:g,coinMassKg:m,rampLengthM:length,landingKineticCoefficient:landingMu}=config.assumptions;
  const coefficients=config.surfaces[surfaceKey];
  const theta=angleDeg*Math.PI/180;
  const normal=m*g*Math.cos(theta);
  const downhill=m*g*Math.sin(theta);
  const staticMax=coefficients.staticCoefficient*normal;
  const moves=downhill>staticMax+1e-12;
  const friction=moves?coefficients.kineticCoefficient*normal:downhill;
  const acceleration=moves?(downhill-friction)/m:0;
  const bottomSpeed=moves?Math.sqrt(2*acceleration*length):0;
  const distance=moves?bottomSpeed**2/(2*landingMu*g):0;
  return{normal,downhill,staticMax,moves,friction,acceleration,bottomSpeed,distance,criticalAngle:Math.atan(coefficients.staticCoefficient)*180/Math.PI};
}

for(const sample of config.boundarySamples){
  const coefficient=config.surfaces[sample.surface].staticCoefficient;
  const exact=Math.atan(coefficient)*180/Math.PI;
  const below=actualModel.calculate(sample.belowDeg,sample.surface);
  const at=actualModel.calculate(exact,sample.surface);
  const above=actualModel.calculate(sample.aboveDeg,sample.surface);
  add(`${sample.surface}：臨界角以下保持靜止`,!below.moves,`${sample.belowDeg}° → ${below.moves?'滑動':'靜止'}`);
  add(`${sample.surface}：臨界角等值保持靜止`,!at.moves,`${exact.toFixed(6)}° → ${at.moves?'滑動':'靜止'}`);
  add(`${sample.surface}：臨界角以上開始滑動`,above.moves,`${sample.aboveDeg}° → ${above.moves?'滑動':'靜止'}`);
}

for(const sample of config.numericSamples){
  const actual=actualModel.calculate(sample.angleDeg,sample.surface);
  const target=expected(sample.angleDeg,sample.surface);
  for(const key of ['normal','downhill','staticMax','friction','acceleration','bottomSpeed','distance','criticalAngle']){
    add(`${sample.surface} ${sample.angleDeg}°：${key}`,near(actual[key],target[key]),`actual=${actual[key].toFixed(9)}, expected=${target[key].toFixed(9)}`);
  }
  add(`${sample.surface} ${sample.angleDeg}°：運動分類`,actual.moves===target.moves,`actual=${actual.moves}, expected=${target.moves}`);
}

for(const surface of Object.keys(config.surfaces)){
  const low=actualModel.calculate(30,surface);
  const high=actualModel.calculate(40,surface);
  add(`${surface}：角度增加時滑行距離增加`,high.distance>low.distance,`30°=${low.distance.toFixed(3)} m, 40°=${high.distance.toFixed(3)} m`);
}
const sameAngle=Object.keys(config.surfaces).map(surface=>actualModel.calculate(30,surface));
add('同為 30°：光滑面比一般面滑得遠',sameAngle[0].distance>sameAngle[1].distance,`${sameAngle[0].distance.toFixed(3)} m > ${sameAngle[1].distance.toFixed(3)} m`);
add('同為 30°：一般面比粗糙面滑得遠',sameAngle[1].distance>sameAngle[2].distance,`${sameAngle[1].distance.toFixed(3)} m > ${sameAngle[2].distance.toFixed(3)} m`);

const passed=checks.filter(check=>check.pass).length;
const report={checkedDate:'2026-07-14',system:config.system,pass:passed,fail:checks.length-passed,total:checks.length,tolerance,checks};
await mkdir(resolve(root,'audit'),{recursive:true});
await writeFile(resolve(root,'audit','incline-physics-audit.json'),JSON.stringify(report,null,2)+'\n');
const markdown=['# 斜坡滑幣物理稽核','','檢查日期：2026-07-14',`結果：${passed}/${checks.length} 通過`,`數值容許誤差：${tolerance}`,'','## 模型範圍','','- 錢幣平放滑動，不處理滾動。','- 斜坡長 1.20 m；斜坡表面可變；水平測距墊固定為 μk 0.22。','- 啟動條件：`mg sinθ > μs mg cosθ`。','- 滑下加速度：`g(sinθ − μk cosθ)`。','- 坡底速度與水平停止距離分別以等加速度關係獨立驗證。','','## 檢查結果','',...checks.map(check=>`- ${check.pass?'PASS':'FAIL'}｜${check.name}｜${check.details}`),'','## 重跑','','`npm.cmd run audit:physics`',''];
await writeFile(resolve(root,'audit','incline-physics-audit.md'),markdown.join('\n'));
for(const check of checks)console.log(`${check.pass?'PASS':'FAIL'} ${check.name} — ${check.details}`);
console.log(`${passed}/${checks.length} incline physics checks passed`);
if(passed!==checks.length)process.exitCode=1;
