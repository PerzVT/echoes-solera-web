import test from 'node:test';
import assert from 'node:assert/strict';
import {access,recommendation,markCompleted,purchaseUnlock,commit,validateSchedule} from '../public/media-preview/episode-state.mjs';
const episodes=[1,2,3,3.5,4].map((part,i)=>({id:'series:'+part,part:String(part),ready:true,price:i===4?1:0,freeAt:'2026-10-02T00:00:00Z',duration:120}));
const fresh=()=>({balance:0,history:[],progress:{},completed:[],unlocked:[],receipts:[],demoRelease:'before'});
test('new, partial, completed and caught-up recommendations preserve supplied order',()=>{
 let s=fresh();assert.equal(recommendation(episodes,s).episode.part,'1');
 s.history=['series:3'];s.progress['series:3']=119;assert.equal(recommendation(episodes,s).kind,'resume');
 s=markCompleted(s,episodes[2]);assert.equal(recommendation(episodes,s).episode.part,'3.5');
 for(const e of episodes)s=markCompleted(s,e);assert.equal(recommendation(episodes,s).kind,'caught-up');
});
test('access supports before/after release, unlocked and unavailable states',()=>{
 const s=fresh(),last=episodes.at(-1);assert.equal(access(last,s),'locked');
 s.demoRelease='after';assert.equal(access(last,s),'free');s.demoRelease='before';s.unlocked=[last.id];assert.equal(access(last,s),'unlocked');
 assert.equal(access({...last,ready:false},s),'unavailable');
});
test('exact shortfall, funded wallet and duplicate unlock are correct',()=>{
 let s=fresh();let result=purchaseUnlock(s,episodes.at(-1),{id:'r1'});assert.equal(result.next.receipts[0].cash,1.1);assert.equal(result.next.balance,0);assert.equal(s.unlocked.length,0);
 assert.equal(purchaseUnlock(result.next,episodes.at(-1),{id:'r2'}).duplicate,true);
 s.balance=5;result=purchaseUnlock(s,episodes.at(-1),{id:'r3'});assert.equal(result.next.balance,4);assert.equal(result.next.receipts[0].cash,0);assert.equal(result.next.receipts[0].balanceUsed,1);
});
test('storage failure cannot commit a purchase or mutate the prior balance',()=>{
 const prior=fresh(),purchase=purchaseUnlock(prior,episodes.at(-1),{id:'r1'});let current=prior;
 assert.throws(()=>{current=commit({setItem(){throw Error('Quota exceeded');}},'test',purchase.next);});assert.equal(current,prior);assert.equal(current.unlocked.length,0);
});
test('scheduled episodes require video and valid timing while drafts can be incomplete',()=>{
 const e={title:'Part one',status:'Scheduled',date:'2026-10-02',early:true,earlyDate:'2026-09-25',price:1};
 assert.match(validateSchedule(e,false,'2026-09-25'),/video/);assert.equal(validateSchedule(e,true,'2026-09-25'),'');
 assert.match(validateSchedule({...e,earlyDate:e.date},true,'2026-09-25'),/before/);assert.match(validateSchedule({...e,date:'2026-09-24'},true,'2026-09-25'),/past/);
 assert.equal(validateSchedule({title:'Draft',status:'Draft',early:false},false,'2026-09-25'),'');
});
