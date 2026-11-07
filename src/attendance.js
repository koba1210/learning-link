export const startAt = m => typeof m.when === 'number' ? m.when : Date.parse(m.when)
export const ended = (m, now=Date.now()) => m.status === '開催確定済み' && startAt(m)+Number(m.duration)*60000 <= now
export function answer(m, actor, target, value, now=Date.now()) {
 if(actor!==target || !m.participants.includes(actor) || m.organizer===actor || m.status!=='開催確定済み' || !(startAt(m)>now) || !['出席予定','欠席'].includes(value)) throw Error('本人だけが開催開始前に回答できます。')
 return {...m,rsvp:{...m.rsvp,[actor]:value}}
}
export function record(m, actor, target, value, now=Date.now()) {
 if(actor!==m.organizer || !m.participants.includes(target) || !ended(m,now) || !['参加','不参加','未確認'].includes(value)) throw Error('参加実績は終了後に主催者だけが登録できます。')
 return {...m,attendance:{...m.attendance,[target]:value}}
}
export function growth(items, actor, now=Date.now()) {
 const count=new Set(items.filter(m=>ended(m,now)&&m.participants.includes(actor)&&m.attendance?.[actor]==='参加').map(m=>m.id)).size
 const level=count>=5?3:count>=3?2:count>=1?1:0
 return {count,level,name:['たまご','誕生','成長','さらに成長'][level],remaining:level===3?0:[1,3,5][level]-count}
}
export function attendanceDemo(people, now=Date.now()) {
 const ids=people.map(p=>p.id), organizer=ids[1]
 return Array.from({length:7},(_,i)=>({id:`attendance-demo-${i}`,title:`【架空データ】学びの会 ${i+1}`,topic:'Python',organizer,participants:ids,status:i===6?'開催調整中':'開催確定済み',when:now+(i===5?2:-(i+1))*86400000,duration:'60',mode:'オンライン',url:'https://example.com/demo-meeting',room:'',preferences:{},attendance:i<5?Object.fromEntries(ids.map((id,index)=>[id,i<[0,1,3,5][index%4]?'参加':'未確認'])):{}}))
}
