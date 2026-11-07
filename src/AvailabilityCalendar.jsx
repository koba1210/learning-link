import { useState } from 'react'
import './calendar.css'
const dateKey = time => new Date(time + 9 * 3600000).toISOString().slice(0, 10)
const timeLabel = time => new Date(time).toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })
export default function AvailabilityCalendar({ slots, duration, choice, onSelect, from, to }) {
  const [offset, setOffset] = useState(0)
  const [day, setDay] = useState('')
  const first = new Date(from + 'T00:00:00+09:00').getTime()
  const firstDate = new Date(first + 32400000)
  const month = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + offset, 1))
  const year = month.getUTCFullYear(), monthIndex = month.getUTCMonth()
  const count = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const groups = new Map()
  for (const slot of slots) { const key = dateKey(slot); groups.set(key, [...(groups.get(key) || []), slot]) }
  const activeDay = day || (choice ? dateKey(choice) : slots.length ? dateKey(slots[0]) : '')
  const lastMonth = to.slice(0, 7)
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  return <section className="availability-calendar" aria-label="空き時間カレンダー">
    <div className="calendar-heading"><h3>空き時間カレンダー</h3><span>日本時間（Asia/Tokyo）</span></div>
    <p className="calendar-description">日付を選び、開始・終了時刻を確認して候補を1つ選択してください。デモのカレンダー情報です。</p>
    <div className="calendar-toolbar"><button type="button" className="secondary" disabled={offset === 0} onClick={() => setOffset(offset - 1)} aria-label="前の月">←</button><strong aria-live="polite">{year}年{monthIndex + 1}月</strong><button type="button" className="secondary" disabled={monthKey >= lastMonth} onClick={() => setOffset(offset + 1)} aria-label="次の月">→</button></div>
    <div className="calendar-grid">{['日', '月', '火', '水', '木', '金', '土'].map(label => <span className="weekday" key={label}>{label}</span>)}{Array.from({ length: month.getUTCDay() }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => {
      const key = dateKey(Date.UTC(year, monthIndex, i + 1) - 32400000)
      const available = groups.get(key) || []
      return <button type="button" className={`calendar-day ${key === activeDay ? 'active' : ''}`} key={key} disabled={!available.length} aria-pressed={key === activeDay} aria-label={`${key}、候補${available.length}件`} onClick={() => setDay(key)}><span>{i + 1}</span><small>{available.length ? `${available.length}枠` : '—'}</small></button>
    })}</div>
    <p className="calendar-description">「—」は選択できる候補なし。未取得・検索対象外の日も含みます。</p>
    <fieldset className="calendar-slots"><legend>{activeDay ? `${activeDay} の候補` : '候補日時'}</legend>{(groups.get(activeDay) || []).map(slot => <label key={slot} className={choice === slot ? 'chosen' : ''}><input type="radio" name="calendar-slot" checked={choice === slot} onChange={() => onSelect(slot)}/><span>{timeLabel(slot)} ～ {timeLabel(slot + Number(duration) * 60000)}</span></label>)}{!slots.length && <p>表示できる候補がありません。空き状況を取得してください。</p>}</fieldset>
    {choice && <p role="status" className="calendar-selection">選択中：{dateKey(choice)} {timeLabel(choice)} ～ {timeLabel(choice + Number(duration) * 60000)}</p>}
  </section>
}
