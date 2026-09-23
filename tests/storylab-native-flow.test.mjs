import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {scenes,byId,validScene,storyState,enterScene,characterNames} from '../public/story-lab/solera/scenes.js';
import {mediaAssets} from '../public/story-lab/solera/assets.generated.js';

test('unique scenes and complete static transitions',()=>{
 assert.equal(new Set(scenes.map(s=>s.id)).size,scenes.length);
 for(const s of scenes)for(const id of [s.next,s.videoNext,...(s.choices||[]).map(c=>c.to)].filter(Boolean))assert.ok(byId.has(id),s.id+' -> '+id);
 assert.equal(scenes.filter(s=>s.id==='lobby').length,1);
 assert.equal(byId.get('selection').choices.length,3);
});
test('all 24 adventurer routes finish through one shared companion node',()=>{
 for(const character of ['nova','ya'])for(const route of ['sword','bow','summon'])for(const challenge of [false,true])for(const companion of Object.keys(characterNames).filter(c=>c!==character)){
  Object.assign(storyState,{character,route,outcome:'skipped'});let id=character==='nova'?'spawn':'ya-spawn';const visited=[];
  for(let n=0;n<80;n++){
   enterScene(id);const s=byId.get(id);assert.ok(s,id);visited.push(id);if(s.end)break;
   if(id==='classes')id=character+'-'+route+'-start';
   else if(id===character+'-'+route+'-choice'){storyState.outcome=challenge?'entered':'skipped';id=challenge?'challenge-door':'lobby';}
   else if(id==='lobby'){assert.equal(s.image,'expanded/'+character+'-lobby.png');assert.equal(storyState.outcome,challenge?'escaped':'skipped');id=character+'-meet-'+companion;}
   else id=s.videoNext||s.next;
  }
  assert.ok(byId.get(id)?.end,[character,route,challenge,companion].join('/'));
  assert.equal(visited.filter(id=>id==='lobby').length,1);
  assert.equal(visited.includes('titan-reveal'),challenge);
  assert.equal(visited.includes(character+'-dragon-run'),challenge&&route==='summon');
 }
});
test('Or-en arrives as a native and never registers, trains or fights',()=>{
 for(const companion of ['nova','ya']){
  Object.assign(storyState,{character:'ya',route:'summon',outcome:'escaped'});
  let id=byId.get('selection').choices.find(c=>c.label==='Or-en').to;const visited=[];
  for(let n=0;n<12;n++){
   enterScene(id);const s=byId.get(id);assert.ok(s,id);visited.push(id);assert.ok(!s.clip&&!s.identity);
   if(s.end)break;
   if(id==='lobby'){assert.equal(storyState.character,'oren');assert.equal(storyState.route,'native');assert.equal(storyState.outcome,'native');assert.match(s.caption,/bench/);id='oren-meet-'+companion;}
   else id=s.next;
  }
  assert.deepEqual(visited.slice(0,5),['oren-village-departure','oren-city-sneak','oren-guild-sneak','oren-lobby-wait','lobby']);
  assert.ok(byId.get(id).end);
 }
 for(const s of scenes.filter(s=>s.character==='oren'))assert.ok(!/spawn|registered|scan|sword|bow|summon|dragon|boss|challenge/.test(s.id),s.id);
 assert.equal(validScene('oren-spawn'),'selection');
 enterScene('oren-village-departure');enterScene('classes');assert.equal(storyState.character,'nova');
});
test('all scene and gallery assets exist, only Nova has the capsule movie',()=>{
 for(const s of scenes){assert.ok(mediaAssets[s.image],s.image);assert.ok(existsSync(new URL('../public/story-lab/solera/'+mediaAssets[s.image],import.meta.url)),s.image);}
 const gallery=readFileSync(new URL('../public/story-lab/solera/review.html',import.meta.url),'utf8');
 const frames=JSON.parse(gallery.match(/const frames=(\[.*?\]);const \$/s)[1]);assert.equal(frames.length,90);
 for(const f of frames){assert.ok(mediaAssets[f.image]);assert.ok(byId.has(f.scene),f.scene);}
 assert.equal(scenes.filter(s=>s.clip).length,1);assert.equal(byId.get('spawn').clip,'spawn');
 assert.equal(byId.get('spawn').videoNext,'nova-threshold');
});
