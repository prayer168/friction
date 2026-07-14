const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const tabs=$$('.tabs [role="tab"]');
function openTab(id,focus=false){
  tabs.forEach(tab=>{
    const on=tab.dataset.tab===id;
    tab.setAttribute('aria-selected',String(on));
    tab.tabIndex=on?0:-1;
    const panel=document.getElementById(tab.dataset.tab);
    panel.hidden=!on;
    panel.classList.toggle('active',on);
  });
  if(id!=='animation') pauseAnimation();
  if(id!=='lab') stopInclineAnimation();
  else if(lastInclineResult&&!$('#inclineLab').hidden)setCoinAtResult(lastInclineResult);
  if(focus) $(`[data-tab="${id}"]`).focus();
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>openTab(tab.dataset.tab));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    openTab(tabs[next].dataset.tab,true);
  });
});
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.go,true)));

const surfaces={
  smooth:{name:'滑面',level:'低阻力',muS:.18,muK:.12,pattern:'floorSmooth'},
  medium:{name:'一般面',level:'中阻力',muS:.35,muK:.25,pattern:'floorMedium'},
  rough:{name:'粗糙面',level:'高阻力',muS:.65,muK:.48,pattern:'floorRough'}
};
let selectedSurface='medium';
let prediction='';
let lastResult=null;
let trials=[];

function labValues(){
  const mass=Number($('#massRange').value);
  const push=Number($('#pushRange').value);
  const surface=surfaces[selectedSurface];
  const normal=mass*10;
  const staticMax=surface.muS*normal;
  const moves=push>staticMax;
  const friction=moves?surface.muK*normal:push;
  const net=moves?Math.max(0,push-friction):0;
  const acceleration=net/mass;
  return{mass,push,surface,normal,staticMax,moves,friction,net,acceleration};
}
function forceLength(force){return force===0?2:Math.max(12,Math.min(145,force*3.2));}
function updateLabPreview(){
  const value=labValues();
  $('#massOut').textContent=`${value.mass} kg`;
  $('#pushOut').textContent=`${value.push} N`;
  $('#crateMass').textContent=`${value.mass} kg`;
  $('#staticMax').textContent=`${value.staticMax.toFixed(1)} N`;
  $('#surfaceLabel').textContent=`${value.surface.name} · 模型係數 μs ${value.surface.muS.toFixed(2)} / μk ${value.surface.muK.toFixed(2)}`;
  $('#floorRect').setAttribute('fill',`url(#${value.surface.pattern})`);
  const pushLength=forceLength(value.push);
  $('#pushLine').setAttribute('d',`M492 230h${pushLength}`);
  $('#pushLabel').textContent=`推力 ${value.push} N`;
  $('#simDesc').textContent=`一個${value.mass}公斤箱子放在${value.surface.name}上，準備施加${value.push}牛頓水平推力。`;
  if(!lastResult){
    $('#actualFriction').textContent='—';$('#netForce').textContent='—';$('#motionState').textContent='—';
    $('#frictionLabel').textContent='摩擦力 ?';$('#frictionLine').setAttribute('d','M274 270H174');
  }
}
function markLabChanged(){
  lastResult=null;
  $('#recordBtn').disabled=true;
  $('#resultBadge').textContent='等待測試';
  $('#simulation').classList.remove('is-moving');
  $('#crateGroup').classList.remove('moves','stuck');
  $('#labFeedback').className='feedback';
  $('#labFeedback').textContent=prediction?'設定已改變，保留預測後重新測試。':'請先預測，再開始測試。';
  updateLabPreview();
}
$$('#surfaceOptions button').forEach(button=>button.addEventListener('click',()=>{
  selectedSurface=button.dataset.surface;
  $$('#surfaceOptions button').forEach(item=>item.classList.toggle('selected',item===button));
  markLabChanged();
}));
['massRange','pushRange'].forEach(id=>$('#'+id).addEventListener('input',markLabChanged));
$$('#predictionButtons button').forEach(button=>button.addEventListener('click',()=>{
  prediction=button.dataset.predict;
  $$('#predictionButtons button').forEach(item=>item.classList.toggle('selected',item===button));
  $('#labFeedback').className='feedback';
  $('#labFeedback').textContent=`已預測：${prediction==='still'?'不會滑動':'開始滑動'}。現在可以開始測試。`;
}));

function runLab(){
  if(!prediction){
    $('#labFeedback').className='feedback incorrect';
    $('#labFeedback').textContent='請先做預測。科學探究要先留下想法，再用結果修正。';
    $('#predictionButtons button').focus();
    return;
  }
  const value=labValues();
  const actual=value.moves?'move':'still';
  const correct=prediction===actual;
  lastResult=value;
  $('#simulation').classList.toggle('is-moving',value.moves);
  const crate=$('#crateGroup');
  crate.classList.remove('moves','stuck');
  void crate.getBoundingClientRect();
  crate.classList.add(value.moves?'moves':'stuck');
  $('#resultBadge').textContent=value.moves?'開始滑動':'保持靜止';
  $('#actualFriction').textContent=`${value.friction.toFixed(1)} N`;
  $('#netForce').textContent=`${value.net.toFixed(1)} N`;
  $('#motionState').textContent=value.moves?`向右加速 ${value.acceleration.toFixed(1)} m/s²`:'水平力平衡';
  const frictionLength=forceLength(value.friction);
  $('#frictionLine').setAttribute('d',`M274 270h-${frictionLength}`);
  $('#frictionLabel').textContent=`${value.moves?'動':'靜'}摩擦力 ${value.friction.toFixed(1)} N`;
  $('#labFeedback').className=`feedback ${correct?'correct':'incorrect'}`;
  $('#labFeedback').textContent=`${correct?'預測吻合！':'預測不同，正好得到修正模型的證據。'} 推力 ${value.push.toFixed(1)} N ${value.moves?'超過':'沒有超過'} ${value.staticMax.toFixed(1)} N 的最大靜摩擦力。`;
  $('#evidenceText').textContent=value.moves
    ?`箱子先突破最大靜摩擦力；滑動後，模型中的動摩擦力為 ${value.friction.toFixed(1)} N，水平方向仍有 ${value.net.toFixed(1)} N 合力，所以向右加速。`
    :`箱子沒有滑動。靜摩擦力會回應推力，現在是 ${value.friction.toFixed(1)} N，與推力反向且大小相等；它不是一開始就等於 ${value.staticMax.toFixed(1)} N 的上限。`;
  $('#simDesc').textContent=`測試結果：箱子${value.moves?'開始向右滑動':'保持靜止'}。推力${value.push}牛頓，摩擦力${value.friction.toFixed(1)}牛頓，水平合力${value.net.toFixed(1)}牛頓。`;
  $('#recordBtn').disabled=false;
}
$('#testBtn').addEventListener('click',runLab);

function resetLab(){
  selectedSurface='medium';prediction='';lastResult=null;
  $('#massRange').value=4;$('#pushRange').value=20;
  $$('#surfaceOptions button').forEach(item=>item.classList.toggle('selected',item.dataset.surface==='medium'));
  $$('#predictionButtons button').forEach(item=>item.classList.remove('selected'));
  $('#resultBadge').textContent='等待預測';
  $('#simulation').classList.remove('is-moving');$('#crateGroup').classList.remove('moves','stuck');
  $('#labFeedback').className='feedback';$('#labFeedback').textContent='先選擇「不會滑動」或「開始滑動」，再開始測試。';
  $('#evidenceText').textContent='最大靜摩擦力是啟動前的門檻；實際靜摩擦力不會一開始就等於最大值。';
  $('#recordBtn').disabled=true;
  updateLabPreview();
}
$('#resetLabBtn').addEventListener('click',resetLab);

function renderTrials(){
  const body=$('#trialBody');
  if(!trials.length){body.innerHTML='<tr class="empty-row"><td colspan="6">尚未記錄測試</td></tr>';return;}
  body.innerHTML=trials.map((trial,index)=>`<tr><td>${index+1}</td><td>${trial.surface.name}</td><td>${trial.mass} kg</td><td>${trial.push} N</td><td>${trial.staticMax.toFixed(1)} N</td><td>${trial.moves?'滑動':'靜止'}</td></tr>`).join('');
  $('#trialPrompt').textContent=trials.length<3?'再記錄幾次，只改變一個變因。':'比較紀錄：哪個變因讓啟動門檻改變？';
}
$('#recordBtn').addEventListener('click',()=>{
  if(!lastResult)return;
  trials.push({...lastResult});
  if(trials.length>6)trials.shift();
  renderTrials();
  $('#recordBtn').disabled=true;
  $('#labFeedback').textContent+=' 已加入紀錄本。';
});
$('#clearTrials').addEventListener('click',()=>{trials=[];renderTrials();$('#trialPrompt').textContent='試著保持質量和推力不變，只改變表面。';});
updateLabPreview();

const labSceneTabs=$$('.lab-switch [role="tab"]');
function openLabScene(scene,focus=false){
  labSceneTabs.forEach(tab=>{
    const active=tab.dataset.labScene===scene;
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!active;
  });
  if(scene!=='incline')stopInclineAnimation();
  else if(lastInclineResult)setCoinAtResult(lastInclineResult);
  if(focus)$(`[data-lab-scene="${scene}"]`).focus();
}
labSceneTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>openLabScene(tab.dataset.labScene));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?labSceneTabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+labSceneTabs.length)%labSceneTabs.length;
    openLabScene(labSceneTabs[next].dataset.labScene,true);
  });
});

let selectedInclineSurface='medium';
let inclinePrediction='';
let lastInclineResult=null;
let inclineTrials=[];
let inclineAnimationFrame=null;
let inclineAnimationToken=0;

function rotatePoint(x,y,angleDeg,cx=360,cy=340){
  const angle=angleDeg*Math.PI/180;
  return{x:cx+(x-cx)*Math.cos(angle)-(y-cy)*Math.sin(angle),y:cy+(x-cx)*Math.sin(angle)+(y-cy)*Math.cos(angle)};
}
function coinStart(angleDeg){return rotatePoint(112,307,angleDeg);}
function coinBottom(angleDeg){return rotatePoint(337,307,angleDeg);}
function coinTransform(x,y,rotation){return`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)})`;}
function inclineValues(){return InclineModel.calculate(Number($('#angleRange').value),selectedInclineSurface);}
function inclineOutcome(value){return value.moves?(value.distance<1?'short':'far'):'stay';}

function stopInclineAnimation(){
  inclineAnimationToken++;
  if(inclineAnimationFrame!==null)cancelAnimationFrame(inclineAnimationFrame);
  inclineAnimationFrame=null;
}
function setCoinAtStart(value){
  const start=coinStart(value.angleDeg);
  $('#inclineCoin').setAttribute('transform',coinTransform(start.x,start.y,value.angleDeg));
}
function setCoinAtResult(value){
  if(!value.moves){setCoinAtStart(value);return;}
  const finish={x:390+Math.min(4,value.distance)*100,y:328};
  $('#inclineCoin').setAttribute('transform',coinTransform(finish.x,finish.y,0));
}
function animateInclineCoin(value){
  stopInclineAnimation();
  const coin=$('#inclineCoin');
  coin.classList.remove('incline-stuck');
  const start=coinStart(value.angleDeg);
  if(!value.moves){
    coin.classList.add('incline-stuck');
    setTimeout(()=>coin.classList.remove('incline-stuck'),500);
    return;
  }
  const bottom=coinBottom(value.angleDeg);
  const landing={x:390,y:328};
  const finish={x:390+Math.min(4,value.distance)*100,y:328};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){setCoinAtResult(value);return;}
  const token=inclineAnimationToken;
  const duration=2400;
  const begun=performance.now();
  const mix=(a,b,t)=>a+(b-a)*t;
  function frame(now){
    if(token!==inclineAnimationToken)return;
    const t=Math.min(1,(now-begun)/duration);
    let x,y,rotation;
    if(t<.56){
      const p=t/.56;x=mix(start.x,bottom.x,p);y=mix(start.y,bottom.y,p);rotation=value.angleDeg;
    }else if(t<.66){
      const p=(t-.56)/.10;x=mix(bottom.x,landing.x,p);y=mix(bottom.y,landing.y,p);rotation=mix(value.angleDeg,0,p);
    }else{
      const p=(t-.66)/.34;x=mix(landing.x,finish.x,1-Math.pow(1-p,2));y=landing.y;rotation=0;
    }
    coin.setAttribute('transform',coinTransform(x,y,rotation));
    if(t<1)inclineAnimationFrame=requestAnimationFrame(frame);else{inclineAnimationFrame=null;setCoinAtResult(value);}
  }
  inclineAnimationFrame=requestAnimationFrame(frame);
}

function updateInclineGeometry(value){
  const angle=value.angleDeg;
  $('#inclineRampGroup').setAttribute('transform',`rotate(${angle} 360 340)`);
  $('#inclineForceGroup').setAttribute('transform',`rotate(${angle} 360 340)`);
  $('#inclineRamp').setAttribute('fill',`url(#${value.surface.pattern})`);
  const endX=360-70*Math.cos(value.angleRad);
  const endY=340-70*Math.sin(value.angleRad);
  $('#angleArcPath').setAttribute('d',`M290 340 A70 70 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`);
  const labelAngle=value.angleRad/2;
  $('#svgAngleLabel').setAttribute('x',(360-92*Math.cos(labelAngle)).toFixed(1));
  $('#svgAngleLabel').setAttribute('y',(347-92*Math.sin(labelAngle)).toFixed(1));
  $('#svgAngleLabel').textContent=`${angle}°`;
  setCoinAtStart(value);
}
function updateInclinePreview(){
  const value=inclineValues();
  $('#angleOut').textContent=`${value.angleDeg}°`;
  $('#criticalAngle').textContent=`${value.criticalAngle.toFixed(1)}°`;
  $('#downhillForce').textContent=`${value.downhill.toFixed(3)} N`;
  $('#inclineSurfaceLabel').textContent=`斜坡：${value.surface.name} · μs ${value.surface.muS.toFixed(2)} / μk ${value.surface.muK.toFixed(2)}`;
  $('#inclineDesc').textContent=`一枚平放的錢幣位於${value.angleDeg}度的${value.surface.name}斜坡頂端，等待釋放後測量水平滑行距離。`;
  updateInclineGeometry(value);
  if(!lastInclineResult){
    $('#inclineFriction').textContent='—';
    $('#travelDistance').textContent='—';
    $('#inclineForceGroup').setAttribute('opacity','0');
    $('#distanceMarker').setAttribute('opacity','0');
  }
}
function markInclineChanged(){
  stopInclineAnimation();
  lastInclineResult=null;
  $('#recordInclineBtn').disabled=true;
  $('#inclineResultBadge').textContent='等待測試';
  $('#inclineFeedback').className='feedback';
  $('#inclineFeedback').textContent=inclinePrediction?'設定已改變，保留預測後重新測試。':'請先預測，再釋放錢幣。';
  $('#inclineEvidence').textContent='角度增大會讓重力沿斜坡的分力增加；表面粗糙度會改變靜摩擦門檻與滑動摩擦力。';
  updateInclinePreview();
}
$$('#inclineSurfaceOptions button').forEach(button=>button.addEventListener('click',()=>{
  selectedInclineSurface=button.dataset.inclineSurface;
  $$('#inclineSurfaceOptions button').forEach(item=>item.classList.toggle('selected',item===button));
  markInclineChanged();
}));
$('#angleRange').addEventListener('input',markInclineChanged);
$$('#inclinePredictionButtons button').forEach(button=>button.addEventListener('click',()=>{
  inclinePrediction=button.dataset.inclinePredict;
  $$('#inclinePredictionButtons button').forEach(item=>item.classList.toggle('selected',item===button));
  const labels={stay:'留在斜坡',short:'滑行不到 1 m',far:'滑行至少 1 m'};
  $('#inclineFeedback').className='feedback';
  $('#inclineFeedback').textContent=`已預測：${labels[inclinePrediction]}。現在可以釋放錢幣。`;
}));

function runInclineLab(){
  if(!inclinePrediction){
    $('#inclineFeedback').className='feedback incorrect';
    $('#inclineFeedback').textContent='請先預測錢幣會留在斜坡、滑不到 1 公尺，還是滑至少 1 公尺。';
    $('#inclinePredictionButtons button').focus();
    return;
  }
  const value=inclineValues();
  const actual=inclineOutcome(value);
  const correct=actual===inclinePrediction;
  lastInclineResult=value;
  $('#inclineResultBadge').textContent=value.moves?'滑下斜坡':'留在斜坡';
  $('#inclineFriction').textContent=`${value.friction.toFixed(3)} N`;
  $('#travelDistance').textContent=value.moves?`${value.distance.toFixed(2)} m`:'0.00 m';
  $('#inclineForceGroup').setAttribute('opacity','1');
  const downhillLength=48+value.downhill/.139*70;
  const frictionLength=35+value.friction/.10*55;
  $('#downhillArrow').setAttribute('d',`M150 274h${Math.min(120,downhillLength).toFixed(1)}`);
  $('#rampFrictionArrow').setAttribute('d',`M145 300h-${Math.min(105,frictionLength).toFixed(1)}`);
  if(value.moves){
    const markerX=390+Math.min(4,value.distance)*100;
    $('#distanceMarker').setAttribute('opacity','1');
    $('#distanceMarker path').setAttribute('d',`M390 390H${markerX.toFixed(1)}`);
    $('#distanceMarker circle').setAttribute('cx',markerX.toFixed(1));
    $('#distanceMarkerText').setAttribute('x',((390+markerX)/2).toFixed(1));
    $('#distanceMarkerText').textContent=`${value.distance.toFixed(2)} m`;
  }else $('#distanceMarker').setAttribute('opacity','0');
  $('#inclineFeedback').className=`feedback ${correct?'correct':'incorrect'}`;
  $('#inclineFeedback').textContent=`${correct?'預測吻合！':'預測不同，請用讀數修正想法。'} ${value.angleDeg}°${value.moves?'已超過':'尚未超過'}${value.surface.name}的 ${value.criticalAngle.toFixed(1)}° 臨界角。`;
  $('#inclineEvidence').textContent=value.moves
    ?`重力沿坡分力 ${value.downhill.toFixed(3)} N 超過最大靜摩擦力 ${value.staticMax.toFixed(3)} N，錢幣開始滑動；到坡底速度約 ${value.bottomSpeed.toFixed(2)} m/s，接著在固定測距墊上滑行 ${value.distance.toFixed(2)} m。`
    :`重力沿坡分力 ${value.downhill.toFixed(3)} N 沒有超過最大靜摩擦力 ${value.staticMax.toFixed(3)} N；實際靜摩擦力會平衡向下分力，所以錢幣留在原處。`;
  $('#inclineDesc').textContent=value.moves
    ?`測試結果：錢幣從${value.angleDeg}度的${value.surface.name}斜坡滑下，在固定測距墊上滑行${value.distance.toFixed(2)}公尺後停止。`
    :`測試結果：錢幣在${value.angleDeg}度的${value.surface.name}斜坡上保持靜止。`;
  $('#recordInclineBtn').disabled=false;
  animateInclineCoin(value);
}
$('#runInclineBtn').addEventListener('click',runInclineLab);

function resetInclineLab(){
  stopInclineAnimation();
  selectedInclineSurface='medium';inclinePrediction='';lastInclineResult=null;
  $('#angleRange').value=25;
  $$('#inclineSurfaceOptions button').forEach(item=>item.classList.toggle('selected',item.dataset.inclineSurface==='medium'));
  $$('#inclinePredictionButtons button').forEach(item=>item.classList.remove('selected'));
  $('#inclineResultBadge').textContent='等待預測';
  $('#inclineFeedback').className='feedback';$('#inclineFeedback').textContent='先選擇預測，再釋放錢幣。';
  $('#inclineEvidence').textContent='角度增大會讓重力沿斜坡的分力增加；表面粗糙度會改變靜摩擦門檻與滑動摩擦力。';
  $('#recordInclineBtn').disabled=true;
  updateInclinePreview();
}
$('#resetInclineBtn').addEventListener('click',resetInclineLab);

function renderInclineTrials(){
  const body=$('#inclineTrialBody');
  if(!inclineTrials.length){body.innerHTML='<tr class="empty-row"><td colspan="6">尚未記錄測試</td></tr>';return;}
  body.innerHTML=inclineTrials.map((trial,index)=>`<tr><td>${index+1}</td><td>${trial.surface.name}</td><td>${trial.angleDeg}°</td><td>${trial.criticalAngle.toFixed(1)}°</td><td>${trial.moves?'滑下':'停住'}</td><td>${trial.distance.toFixed(2)} m</td></tr>`).join('');
  $('#inclineTrialPrompt').textContent=inclineTrials.length<3?'再記錄幾次，每次只改變角度或表面其中一項。':'比較紀錄：角度與表面分別如何改變啟動門檻和距離？';
}
$('#recordInclineBtn').addEventListener('click',()=>{
  if(!lastInclineResult)return;
  inclineTrials.push({...lastInclineResult});
  if(inclineTrials.length>6)inclineTrials.shift();
  renderInclineTrials();
  $('#recordInclineBtn').disabled=true;
  $('#inclineFeedback').textContent+=' 已加入斜坡比較表。';
});
$('#clearInclineTrials').addEventListener('click',()=>{
  inclineTrials=[];renderInclineTrials();
  $('#inclineTrialPrompt').textContent='先固定表面，只改變角度；再固定角度，只改變表面。';
});
updateInclinePreview();

const stageText=[
  '階段 1／5：箱子尚未受到水平推力，沒有滑動趨勢；本圖先聚焦水平方向。',
  '階段 2／5：輕推箱子仍不動。靜摩擦力向左，會增大到剛好平衡向右推力。',
  '階段 3／5：推力更大，靜摩擦力也跟著變大；只要沒超過上限，箱子仍保持靜止。',
  '階段 4／5：推力超過最大靜摩擦力，接觸面開始相對滑動；摩擦轉為動摩擦力。',
  '階段 5／5：箱子向右滑動，動摩擦力向左。部分機械能轉移成內能，使接觸處略微升溫。'
];
const stageLabels=['準備觀察兩個接觸面','輕推：兩個水平力平衡','加大推力：仍未突破門檻','突破靜摩擦上限，開始滑動','滑動中：動摩擦力反抗滑動'];
let currentStage=0;
let animationTimer=null;
function updateAnimation(stage){
  currentStage=Math.max(0,Math.min(4,stage));
  $('#animationStage').dataset.stage=String(currentStage);
  $('#animationCaption').textContent=stageText[currentStage];
  $('.anim-stage-label').textContent=stageLabels[currentStage];
  $$('.stage-list button').forEach(button=>button.classList.toggle('active',Number(button.dataset.step)===currentStage));
  $('#animDesc').textContent=stageText[currentStage].replace(/^階段 \d／5：/,'');
}
function pauseAnimation(){if(animationTimer){clearInterval(animationTimer);animationTimer=null;}}
function playAnimation(){
  pauseAnimation();
  if(currentStage===4)updateAnimation(0);
  animationTimer=setInterval(()=>{
    if(currentStage>=4){pauseAnimation();return;}
    updateAnimation(currentStage+1);
  },1800);
}
$('#playBtn').addEventListener('click',playAnimation);
$('#pauseBtn').addEventListener('click',pauseAnimation);
$('#replayBtn').addEventListener('click',()=>{updateAnimation(0);playAnimation();});
$$('.stage-list button').forEach(button=>button.addEventListener('click',()=>{pauseAnimation();updateAnimation(Number(button.dataset.step));}));
$('#revealObservation').addEventListener('click',()=>{
  const hint=$('#observationHint');hint.hidden=!hint.hidden;
  $('#revealObservation').textContent=hint.hidden?'查看提示':'收起提示';
});

const applications=[
  {title:'走路不打滑',key:'需要增大',front:'腳向後推地面，什麼力幫助身體向前？',back:'地面對鞋底的靜摩擦力可向前作用，讓人能加速前進。鞋底抓地不足時容易滑倒。',icon:'walk',alt:'運動鞋鞋底緊貼石板路面，鞋跟後方有輕微動作線，呈現走路時的接觸。'},
  {title:'腳踏車煞車',key:'需要增大',front:'握下煞車把手，哪個接觸位置改變？',back:'煞車塊更緊壓輪圈或碟盤，摩擦力讓轉動減慢，機械能主要轉成內能。',icon:'brake',alt:'腳踏車碟煞特寫，煞車卡鉗與兩側來令片位在金屬碟盤的接觸處。'},
  {title:'雨鞋排水紋',key:'維持抓地',front:'鞋底溝紋在濕地面上有什麼任務？',back:'溝紋幫助排開接觸面的水，讓鞋底較能接觸地面；效果仍受材料、磨耗與路況影響。',icon:'tread',alt:'雨鞋深溝鞋底壓在濕地面上，少量水沿鞋底溝槽向外排出。'},
  {title:'門鉸鏈上油',key:'需要減小',front:'為什麼加潤滑油後，門比較好開？',back:'潤滑層改變兩表面的直接接觸與剪切情況，通常可減少摩擦與磨耗。',icon:'oil',alt:'潤滑油瓶尖端把一滴油準確滴在門鉸鏈中央轉軸接縫。'},
  {title:'輪胎抓地',key:'需要適當增大',front:'車輛轉彎、加速與煞車都需要什麼？',back:'輪胎與路面間的摩擦提供改變速度方向或大小所需的水平力；濕滑時應降低速度。',icon:'tire',alt:'有深溝胎紋的車輪接觸微濕路面，水滴分布在胎紋與接觸區附近。'},
  {title:'橡皮擦鉛筆字',key:'摩擦會磨耗',front:'擦拭後為什麼會出現橡皮屑？',back:'橡皮與紙面摩擦，帶走部分石墨，也造成材料磨耗並產生少量熱。',icon:'eraser',alt:'粉紅橡皮擦貼著紙面上的石墨筆跡，接觸處留下幾粒粉紅橡皮屑。'},
  {title:'攀岩用粉袋',key:'改善接觸',front:'手汗多時，攀岩者為何使用粉末？',back:'攀岩粉可吸收部分水分，改善手與岩點的接觸和抓握；仍須依安全裝備與專業指導操作。',icon:'chalk',alt:'一隻手伸入攀岩粉袋，另一隻手掌與指尖覆有薄薄白色攀岩粉。'},
  {title:'搬運用滾輪',key:'改變接觸方式',front:'重物放上滾輪後，為什麼常較省力？',back:'把大量滑動接觸改為滾動，許多情況下阻力較小；軸承也能降低部件間的滑動摩擦。',icon:'roller',alt:'木箱完整放在三根互相平行的橘色圓柱滾輪上，箱後有輕微移動線。'}
];
$('#applyGrid').innerHTML=applications.map((item,index)=>`<article class="apply-card"><button type="button" aria-expanded="false" aria-label="${item.title}：翻卡查看解釋"><span class="apply-inner"><span class="apply-face apply-front"><span class="science-key">${item.key}</span><img class="case-visual" src="assets/applications/${item.icon}.webp" width="960" height="640" loading="lazy" decoding="async" alt="${item.alt}" /><h3>${item.title}</h3><p>${item.front}</p><small>點擊翻面 →</small></span><span class="apply-face apply-back"><span class="science-key">科學解釋</span><h3>${item.title}</h3><p>${item.back}</p><small>再點一次回到提問</small></span></span></button></article>`).join('');
$$('.apply-card button').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('.apply-card');
  const flipped=card.classList.toggle('is-flipped');
  button.setAttribute('aria-expanded',String(flipped));
}));

const questions=[
  {q:'箱子有向右滑動的趨勢，但仍靜止。地面對箱子的摩擦力方向通常是？',c:['向右','向左','向上','沒有摩擦力'],a:1,e:'靜摩擦力反抗箱子相對地面向右滑動的趨勢，所以方向向左。'},
  {q:'輕推箱子但箱子沒動。下列哪個說法最精確？',c:['箱子完全不受摩擦力','靜摩擦力與推力平衡','摩擦力一定等於最大值','推力消失了'],a:1,e:'尚未滑動時，靜摩擦力會在上限內配合外力改變，平衡這次的水平推力。'},
  {q:'推力剛超過最大靜摩擦力時，箱子最可能怎樣？',c:['開始滑動','質量變小','摩擦力消失','離開地面'],a:0,e:'超過靜摩擦門檻後，接觸面開始相對滑動，摩擦轉為動摩擦力。'},
  {q:'在同一水平表面上，箱子加重後通常更難推動。簡化模型如何解釋？',c:['正向力增加，摩擦上限通常增加','重力變成水平力','表面自動變光滑','動摩擦力變成零'],a:0,e:'水平面上箱子更重時，地面支持它的正向力通常較大，因此模型中的最大靜摩擦力較大。'},
  {q:'人向前走路時，地面給鞋底的靜摩擦力可以有什麼作用？',c:['幫助人向前','只會讓人向後','讓重量消失','讓地面變輕'],a:0,e:'腳向後推地面時，地面可透過靜摩擦力向前推腳，幫助人前進。'},
  {q:'下列哪個做法主要是減小摩擦？',c:['鞋底加深溝紋','門鉸鏈加潤滑油','煞車塊夾緊輪圈','輪胎使用抓地材料'],a:1,e:'潤滑會改變接觸狀況，常用來減少摩擦、噪音與磨耗。'},
  {q:'箱子正向右滑動，只有地面摩擦作用在水平方向。它的速度會如何？',c:['逐漸減小','逐漸增大','方向立刻向上','保持不變'],a:0,e:'動摩擦力向左，與向右滑動相反，使箱子的向右速度逐漸減小。'},
  {q:'關於摩擦係數，下列何者最合理？',c:['只由其中一個物體決定','與接觸的材料組合及狀況有關','所有表面都相同','永遠不受潤滑影響'],a:1,e:'摩擦係數描述一對接觸表面在特定條件下的行為；材料、潤滑與表面狀況都重要。'},
  {q:'為什麼教材把 f≈μN 標成簡化模型？',c:['因為力沒有單位','因為真實摩擦還受多種條件影響','因為摩擦無法測量','因為正向力不存在'],a:1,e:'模型對許多乾燥滑動情況有用，但潤滑、速度、溫度、變形等都可能使真實行為偏離模型。'},
  {q:'若要比較兩種表面哪一種更難啟動箱子，哪個實驗較公平？',c:['同時改變箱子與推力','保持箱子相同，只改表面','每次換不同測量方法','只看表面顏色'],a:1,e:'公平比較要控制其他變因；保持同一箱子與操作方法，只改表面，才容易判斷表面的影響。'}
];
let score=0,answered=0;
function renderQuiz(){
  score=0;answered=0;$('#score').textContent='0';$('#progress').textContent='已完成 0 題';$('#quizSummary').hidden=true;
  $('#quizList').innerHTML=questions.map((item,index)=>`<article class="quiz-card"><header><span class="question-number">${index+1}</span><h3>${item.q}</h3></header><div class="choices">${item.c.map((choice,choiceIndex)=>`<button type="button" class="choice" data-q="${index}" data-choice="${choiceIndex}">${choice}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p></article>`).join('');
  $$('.choice').forEach(button=>button.addEventListener('click',answerQuestion));
}
function answerQuestion(event){
  const button=event.currentTarget;
  const index=Number(button.dataset.q),choice=Number(button.dataset.choice),item=questions[index];
  const card=button.closest('.quiz-card');
  $$('.choice',card).forEach(option=>{option.disabled=true;if(Number(option.dataset.choice)===item.a)option.classList.add('correct');});
  const ok=choice===item.a;
  if(ok)score++;else button.classList.add('incorrect');
  answered++;
  const feedback=$('.quiz-feedback',card);feedback.className=`quiz-feedback show ${ok?'good':'try'}`;feedback.textContent=`${ok?'答對了。':'再整理一次線索。'} ${item.e}`;
  $('#score').textContent=String(score);$('#progress').textContent=`已完成 ${answered} 題`;
  if(answered===questions.length){
    $('#quizSummary').hidden=false;
    $('#summaryTitle').textContent=score>=9?'摩擦力首席偵探！':score>=7?'證據鏈已經很完整！':'回頭補找兩條線索';
    $('#summaryText').textContent=`你答對 ${score} 題。${score<7?'建議重看「靜摩擦力會配合外力改變」與「摩擦反抗相對滑動」兩個概念。':'你已能用方向、接觸面與受力門檻解釋多數情境。'}`;
    $('#quizSummary').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  }
}
$('#restartQuiz').addEventListener('click',renderQuiz);
renderQuiz();
