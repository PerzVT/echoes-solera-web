let ctx,enabled=true,lastHover=0;
export function setSoundEnabled(value){enabled=value;}
export function unlockSound(){if(!enabled)return;try{ctx??=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});}catch{}}
export function cue(kind='select'){
 if(!enabled||!ctx||ctx.state!=='running')return;
 const now=ctx.currentTime;if(kind==='hover'&&now-lastHover<.09)return;if(kind==='hover')lastHover=now;
 const notes=kind==='ready'?[660,880]:kind==='select'?[740,990]:kind==='locked'?[180]:[520];
 notes.forEach((hz,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=now+i*.055; o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='hover'?.018:.035,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.14);});
}
