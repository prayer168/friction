import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const [html,css,js]=await Promise.all(['index.html','styles.css','app.js'].map(file=>readFile(resolve(root,file),'utf8')));
const preview=await stat(resolve(root,'assets','social-preview.png')).catch(()=>null);
const applicationNames=['walk','brake','tread','oil','tire','eraser','chalk','roller'];
const applicationAssets=await Promise.all(applicationNames.map(name=>stat(resolve(root,'assets','applications',`${name}.webp`)).catch(()=>null)));
const checks=[
  ['七個頁籤',(html.match(/role="tab"/g)||[]).length===7],
  ['十題四選一',js.includes('const questions=[')&&(js.match(/\{q:'/g)||[]).length===10],
  ['八個生活案例',js.includes('const applications=[')&&(js.match(/icon:'/g)||[]).length===8],
  ['八張應用插圖',applicationAssets.every(file=>file?.isFile()&&file.size>30000)&&(js.match(/alt:'/g)||[]).length===8],
  ['三組表面模型',Object.keys((js.match(/const surfaces=\{([\s\S]*?)\n\};/)||[])[0]||{}).length>0&&['smooth','medium','rough'].every(key=>js.includes(`${key}:{`))],
  ['預測再測試',html.includes('data-predict="still"')&&html.includes('id="testBtn"')&&js.includes('if(!prediction)')],
  ['可記錄六次實驗',html.includes('id="trialBody"')&&js.includes('if(trials.length>6)')],
  ['五階段動畫',(html.match(/data-step="[0-4]"/g)||[]).length===5&&js.includes('stageText=[')],
  ['播放暫停重播',['playBtn','pauseBtn','replayBtn'].every(id=>html.includes(`id="${id}"`))],
  ['ARIA 與鍵盤頁籤',html.includes('aria-live="polite"')&&js.includes("'ArrowRight','ArrowLeft','Home','End'")],
  ['降低動畫',css.includes('@media(prefers-reduced-motion:reduce)')&&js.includes("prefers-reduced-motion: reduce")],
  ['三種響應式層級',css.includes('@media(max-width:960px)')&&css.includes('@media(max-width:640px)')],
  ['來源與查核日期',(html.match(/查核：2026-07-14/g)||[]).length===4],
  ['正式社群 metadata',html.includes('https://prayer168.github.io/friction/')&&html.includes('twitter:card')&&html.includes('og:image:width')&&html.includes('og:image:height')],
  ['社群預覽 PNG',Boolean(preview?.isFile()&&preview.size>10000)],
  ['沒有未完成占位',!/(待補|範例題|示範題|TODO|FIXME|placeholder)/i.test(html+css+js)],
  ['沒有外部圖片 URL',!/<img[^>]+src=["']https?:/i.test(html+js)&&!/^\s*(?:background-)?image\s*:\s*url\(['"]?https?:/im.test(css)]
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed){console.error(`${failed} check(s) failed`);process.exit(1);}
console.log(`${checks.length}/${checks.length} checks passed`);
