import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDemoMeeting, demoSlots, demoBusyIntervals } from './demoCalendar.js'
const people=[{id:'a',topic:'Python'},{id:'b',topic:'Python'},{id:'c',topic:'SQL'}]
test('デモは未来の2週間・同テーマの別社員を対象にする',()=>{const now=Date.parse('2026-11-06T15:00:00+09:00');const m=createDemoMeeting(people[0],people,now);assert.equal(m.from,'2026-11-07');assert.equal(m.to,'2026-11-20');assert.deepEqual(m.participants,['a','b']);const slots=demoSlots(m,now);assert.ok(slots.length>1);const busy=m.participants.flatMap((_,i)=>demoBusyIntervals(m,i));assert.ok(slots.every(t=>t>now&&!busy.some(b=>t<b.end&&t+3600000>b.start)));assert.deepEqual(demoSlots({...m,start:'12',end:'13'},now),[])})
