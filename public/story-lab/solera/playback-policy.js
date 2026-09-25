export function canAdvance(phase,hidden=false){return !hidden&&(phase==='ready'||phase==='ended');}
export function skipTarget(scene){return scene?.clip?(scene.videoNext||scene.next||null):null;}
