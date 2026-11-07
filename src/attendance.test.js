import {test} from 'node:test'
import assert from 'node:assert/strict'
import {answer,record,growth} from './attendance.js'
const now=2000000000000
const m={id:'m',status:'開催確定済み',organizer:'o',participants:['o','p'],when:now+1000,duration:60}
test('回答は本人・確定済み・開始前のみ。回答では成長しない',()=>{const a=answer(m,'p','p','出席予定',now);assert.equal(a.rsvp.p,'出席予定');assert.equal(answer(a,'p','p','欠席',now).rsvp.p,'欠席');assert.equal(growth([a],'p',now).count,0);assert.throws(()=>answer(m,'o','p','欠席',now));assert.throws(()=>answer(m,'p','p','欠席',now+1000));assert.throws(()=>answer({...m,status:'開催調整中'},'p','p','欠席',now))})
test('実績は終了後の主催者のみ。自己参加可。重複保存・訂正',()=>{assert.throws(()=>record(m,'o','p','参加',now));const past={...m,when:now-3600000};assert.throws(()=>record(past,'p','p','参加',now));let a=record(past,'o','p','参加',now);a=record(a,'o','p','参加',now);assert.equal(growth([a,a],'p',now).count,1);assert.equal(growth([record(a,'o','p','不参加',now)],'p',now).count,0);assert.equal(growth([record(a,'o','o','参加',now)],'o',now).count,1);assert.equal(JSON.parse(JSON.stringify(a)).attendance.p,'参加')})
test('0〜5回の成長境界と残り回数',()=>{for(let n=0;n<=5;n++){const items=Array.from({length:n},(_,i)=>({...m,id:String(i),when:now-3600000,attendance:{p:'参加'}}));const g=growth(items,'p',now);assert.equal(g.level,[0,1,1,2,2,3][n]);assert.equal(g.remaining,[1,2,1,2,1,0][n])}})
