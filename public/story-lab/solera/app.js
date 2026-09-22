import {scenes,byId,validScene} from './scenes.js?v=diegetic-1';
import {clips,audio as audioFiles} from './media.js';
const $=id=>document.getElementById(id),video=$('video'),voice=new Audio();
let current=validScene(location.hash.slice(1)),history=[],timer,confirmTimer,auto=false,sound=false,epoch=0,confirming=false;
const portrait=()=>document.body.classList.contains('portrait')||matchMedia('(max-width:700px)').matches;
const spatialIds=new Set(['selection','classes','training','lobby']);
function novaLight(on){$('stage').classList.toggle('nova-lit',on);}
function worldChoices(s){
 const spatial=spatialIds.has(s.id);$('stage').classList.toggle('spatial',spatial);$('stage').dataset.scene=s.id;$('hotspots').hidden=!spatial;$('hotspots').setAttribute('aria-label',s.id==='selection'?'Character selection':'World choices');
 $('hoverImage').hidden=s.id!=='selection';novaLight(false);$('stage').style.setProperty('--scene-bg',`url("assets/${s.image}")`);
 if(!spatial)return;
 $('hotspots').replaceChildren();
 const positions={selection:[[14,4,23,91],[38,4,24,91],[65,4,23,91]],classes:[[3,10,24,44],[37,8,26,46],[69,10,25,44]],training:[[25,57,58,36]],lobby:[[58,8,20,85],[74,51,19,44]]}[s.id];
 s.choices.forEach((c,i)=>{const b=document.createElement('button');b.className='hotspot world-target';b.dataset.index=String(i);const [x,y,w,h]=positions[i];Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});b.setAttribute('aria-label',c.label+(c.locked?', locked':''));if(c.locked)b.setAttribute('aria-disabled','true');
 const label=document.createElement('span');label.className='world-label';const glyph=document.createElement('span');glyph.className=c.locked?'world-glyph locked-glyph':'world-glyph';glyph.textContent=c.locked?'⊘':s.id==='classes'?'↑':'◇';glyph.setAttribute('aria-hidden','true');const name=document.createElement('span');name.textContent=s.id==='selection'?['Ya','Nova','Or-en'][i]:c.label;label.append(glyph,name);b.append(label);
 if(s.id==='selection'&&i===1){b.addEventListener('pointerenter',()=>novaLight(true));b.addEventListener('pointerleave',()=>{if(!confirming&&document.activeElement!==b)novaLight(false);});b.addEventListener('focus',()=>novaLight(true));b.addEventListener('blur',()=>{if(!confirming)novaLight(false);});}
 b.addEventListener('click',()=>choose(i));$('hotspots').append(b);});
}
scenes.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.chapter.split(' / ')[0]+' · '+s.title;$('sceneSelect').append(o);});
function stop(){clearTimeout(timer);clearTimeout(confirmTimer);video.onended=null;video.onerror=null;voice.onended=null;voice.onerror=null;video.pause();voice.pause();video.removeAttribute('src');video.load();video.hidden=true;voice.removeAttribute('src');confirming=false;}
function go(id,{back=false}={}){if(!byId.has(id))return;if(!back&&id!==current)history.push(current);current=id;window.history.replaceState(null,'','#'+id);render();}
function choose(index){if(confirming)return;const s=byId.get(current),c=s.choices?.[index];if(!c)return;if(c.locked){$('feedback').textContent=c.label+' is locked for this preview.';return;}if(current==='selection'){confirming=true;clearTimeout(timer);$('feedback').textContent='Nova selected';document.querySelector('.hotspot[data-index="1"]')?.classList.add('selected');confirmTimer=setTimeout(()=>go(c.to),500);}else go(!video.hidden&&s.videoNext?s.videoNext:c.to);}
function advance(){const s=byId.get(current);if(s.end){auto=false;syncTools();return;}if(s.choices)choose(s.choices.findIndex(c=>!c.locked));else go(!video.hidden&&s.videoNext?s.videoNext:s.next);}
function ready(){return (video.hidden||video.ended)&&(!voice.getAttribute('src')||voice.ended);}
function schedule(){clearTimeout(timer);if(!auto)return;const s=byId.get(current);if(s.end){auto=false;syncTools();return;}if(!ready())return;const token=epoch;timer=setTimeout(()=>{if(token===epoch)advance();},s.seconds*1000);}
function syncTools(){$('tour').textContent=auto?'Pause walkthrough':'Play walkthrough';$('tour').setAttribute('aria-pressed',String(auto));$('audio').textContent=sound?'Sound on':'Sound off';$('audio').setAttribute('aria-pressed',String(sound));$('soundCue').hidden=video.hidden||sound||video.ended;}
function playCurrent(){const token=epoch;if(!video.hidden)video.play().catch(()=>{if(token===epoch&&!video.hidden)$('feedback').textContent='Use the video play button to begin.';});if(sound&&voice.getAttribute('src'))voice.play().catch(()=>{});}
function render(){stop();epoch++;const s=byId.get(current),token=epoch;$('stage').classList.toggle('selection',s.id==='selection');$('poster').src='assets/'+s.image;$('poster').alt=s.alt;$('chapter').textContent=s.chapter;$('title').textContent=s.title;$('speaker').textContent=s.speaker||'';$('caption').textContent=s.caption;$('feedback').textContent='';$('guideArrow').hidden=!s.arrow;$('identity').hidden=!s.identity;$('hotspots').hidden=s.id!=='selection';$('hotspots').replaceChildren();$('choices').replaceChildren();$('sceneSelect').value=s.id;$('back').disabled=!history.length;$('counter').textContent=(scenes.indexOf(s)+1)+' / '+scenes.length;
 const options=s.choices||[{label:s.end?'Play again':s.action||'Continue',to:s.end?'selection':s.next}];options.forEach((c,i)=>{const b=document.createElement('button');b.textContent=(c.locked?'⌑ ':'')+c.label;b.className=c.locked?'':'primary';if(c.locked)b.setAttribute('aria-disabled','true');b.addEventListener('click',()=>{if(s.choices)choose(i);else if(s.end){auto=false;history=[];go('selection',{back:true});}else go(!video.hidden&&s.videoNext?s.videoNext:c.to);});$('choices').append(b);if(s.id==='selection'){const h=document.createElement('button');h.className='hotspot';h.dataset.index=String(i);h.setAttribute('aria-label',c.label+(c.locked?', locked':''));if(c.locked)h.setAttribute('aria-disabled','true');const label=document.createElement('span');label.className='character-label';label.textContent=['Ya','Nova','Or-en'][i];const sub=document.createElement('small');sub.textContent=c.locked?'⌑ LOCKED':'SELECT';label.append(sub);h.append(label);h.addEventListener('click',()=>choose(i));$('hotspots').append(h);}});
 worldChoices(s);
 const item=clips[s.clip],portraitSource=portrait()&&item?.portrait,src=item&&(portraitSource||item.landscape);$('mediaStatus').textContent=src?'Video preview':'Storyboard preview';$('choices').hidden=Boolean(src);$('clipPlay').hidden=!src;$('clipSkip').hidden=!src;$('stage').classList.toggle('portrait-video',Boolean(portraitSource));$('stage').classList.toggle('clip-playing',Boolean(src));
 $('stage').classList.toggle('cinematic',Boolean(src&&s.cinematic));
 if(src&&s.videoAction){const action=$('choices').querySelector('button');if(action)action.textContent=s.videoAction;}
 if(src){video.hidden=false;video.poster='assets/'+s.image;video.src=src;video.muted=!sound;video.controls=false;video.onended=()=>{if(epoch!==token)return;$('stage').classList.remove('clip-playing');$('choices').hidden=false;$('clipSkip').hidden=true;if(auto&&ready())advance();syncTools();};video.onerror=()=>{if(epoch!==token)return;video.hidden=true;$('stage').classList.remove('portrait-video','clip-playing');$('choices').hidden=false;$('clipPlay').hidden=true;$('clipSkip').hidden=true;$('mediaStatus').textContent='Storyboard preview';$('feedback').textContent='Clip unavailable. Continue with the storyboard.';schedule();};playCurrent();}
 const audioSrc=s.audio&&audioFiles[s.audio];if(audioSrc){voice.src=audioSrc;voice.muted=!sound;voice.onended=()=>{if(token===epoch&&auto&&ready())advance();};voice.onerror=()=>{if(token!==epoch)return;voice.removeAttribute('src');schedule();};voice.play().catch(()=>{if(token===epoch){voice.removeAttribute('src');$('feedback').textContent='Greeting audio could not start. Continue to the next beat.';schedule();}});}schedule();syncTools();}
$('tour').onclick=()=>{auto=!auto;if(auto){if(video.ended)advance();else{playCurrent();schedule();}}else{clearTimeout(timer);clearTimeout(confirmTimer);confirming=false;video.pause();voice.pause();}syncTools();};
$('audio').onclick=()=>{sound=!sound;video.muted=!sound;voice.muted=!sound;if(sound&&voice.getAttribute('src'))voice.play().catch(()=>{});syncTools();};
$('soundCue').onclick=()=>{sound=true;video.muted=false;voice.muted=false;video.play().catch(()=>{});syncTools();};
$('restart').onclick=()=>{auto=false;history=[];go('selection',{back:true});};
$('clipPlay').onclick=()=>{if(video.paused){$('stage').classList.add('clip-playing');$('choices').hidden=true;$('clipSkip').hidden=false;video.play().catch(()=>{$('feedback').textContent='Unable to play this clip.';});}else video.pause();};
$('clipSkip').onclick=()=>{video.pause();auto=false;$('stage').classList.remove('clip-playing');$('choices').hidden=false;$('clipSkip').hidden=true;syncTools();};
$('back').onclick=()=>{const id=history.pop();if(id){auto=false;go(id,{back:true});}};
$('sceneSelect').onchange=e=>{auto=false;go(e.target.value);};
$('format').onclick=()=>{document.body.classList.toggle('portrait');const p=document.body.classList.contains('portrait');$('format').textContent=p?'16:9':'9:16';$('format').setAttribute('aria-label',p?'Switch to landscape preview':'Switch to portrait preview');render();};
window.addEventListener('hashchange',()=>{const id=validScene(location.hash.slice(1));if(id!==current){auto=false;current=id;render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);video.pause();voice.pause();}else if(auto){playCurrent();schedule();}});
render();
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('gameMenu').open=!$('gameMenu').open;});




