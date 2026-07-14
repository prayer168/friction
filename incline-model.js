(function(root){
  'use strict';

  const G=9.8;
  const COIN_MASS=0.020;
  const RAMP_LENGTH=1.20;
  const LANDING_MU_K=0.22;
  const surfaces={
    smooth:{name:'光滑面',muS:0.12,muK:0.08,pattern:'inclineSmooth'},
    medium:{name:'一般面',muS:0.30,muK:0.22,pattern:'inclineMedium'},
    rough:{name:'粗糙面',muS:0.50,muK:0.38,pattern:'inclineRough'}
  };

  function calculate(angleDeg,surfaceKey){
    const surface=surfaces[surfaceKey];
    if(!surface)throw new RangeError(`Unknown incline surface: ${surfaceKey}`);
    if(!Number.isFinite(angleDeg)||angleDeg<0||angleDeg>=90)throw new RangeError('Incline angle must be from 0° to less than 90°.');
    const angleRad=angleDeg*Math.PI/180;
    const normal=COIN_MASS*G*Math.cos(angleRad);
    const downhill=COIN_MASS*G*Math.sin(angleRad);
    const staticMax=surface.muS*normal;
    const criticalAngle=Math.atan(surface.muS)*180/Math.PI;
    const moves=downhill>staticMax+1e-12;
    const friction=moves?surface.muK*normal:downhill;
    const net=moves?Math.max(0,downhill-friction):0;
    const acceleration=net/COIN_MASS;
    const bottomSpeed=moves?Math.sqrt(2*acceleration*RAMP_LENGTH):0;
    const distance=moves?(bottomSpeed*bottomSpeed)/(2*LANDING_MU_K*G):0;
    return{angleDeg,angleRad,surfaceKey,surface,normal,downhill,staticMax,criticalAngle,moves,friction,net,acceleration,bottomSpeed,distance};
  }

  root.InclineModel=Object.freeze({G,COIN_MASS,RAMP_LENGTH,LANDING_MU_K,surfaces:Object.freeze(surfaces),calculate});
})(typeof window==='undefined'?globalThis:window);
