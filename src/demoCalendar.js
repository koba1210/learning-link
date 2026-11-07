const DAY = 86400000
const JST = 9 * 3600000
const key = t => new Date(t + JST).toISOString().slice(0, 10)
export function createDemoMeeting(organizer, people, now = Date.now()) {
 const peers = people.filter(p => p.id !== organizer.id && p.topic === organizer.topic)
 if (!peers.length) throw new Error('同じテーマの社員がいません。PythonまたはSQLの社員に切り替えてお試しください。')
 return { id: `calendar-demo-${organizer.id}-${key(now)}`, title: `【デモ】${organizer.topic}を一緒に学ぶ会`, topic: organizer.topic, organizer: organizer.id, participants: [organizer.id, ...peers.map(p => p.id)], duration: '60', from: key(now + DAY), to: key(now + 14 * DAY), start: '9', end: '18', days: ['1','2','3','4','5'], preferences: {}, status: '開催調整中' }
}
// 架空の予定は判定に必要な開始・終了時刻だけを保持する。
export function demoBusyIntervals(meeting, personIndex) {
 const busy = []
 for(let day = Date.parse(meeting.from + 'T00:00:00+09:00'), n = 0; day <= Date.parse(meeting.to + 'T00:00:00+09:00'); day += DAY, n++) {
  busy.push({ start: day + 12 * 3600000, end: day + 13 * 3600000 })
  const hour = 9 + (n + personIndex * 2) % 7
  busy.push({ start: day + hour * 3600000, end: day + (hour + 1) * 3600000 })
  if(n === 3 && personIndex === 1) busy.push({ start: day, end: day + DAY })
 }
 return busy
}
export function demoSlots(meeting, now = Date.now()) {
 const busy = meeting.participants.flatMap((_, i) => demoBusyIntervals(meeting, i))
 const result = [], duration = Number(meeting.duration) * 60000
 for(let day = Date.parse(meeting.from + 'T00:00:00+09:00'); day <= Date.parse(meeting.to + 'T00:00:00+09:00'); day += DAY) {
  if(!meeting.days.includes(String(new Date(day + JST).getUTCDay()))) continue
  for(let start = day + Number(meeting.start) * 3600000; start + duration <= day + Number(meeting.end) * 3600000; start += 1800000) {
   if(start > now && !busy.some(b => start < b.end && start + duration > b.start)) result.push(start)
  }
 }
 return result
}
