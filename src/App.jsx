import Meetings from './Meetings.jsx'
import { useRef, useState } from 'react'
import { EMPLOYEES, TOPICS, loadProfile, saveProfile, validateProfile, recommendations } from './model.js'

const topicIcons = ['Py', 'SQL', '✧', '☁', 'IT']
function readSaved() {
  try { return { profile: loadProfile(window.localStorage), error: false } }
  catch { return { profile: null, error: true } }
}
function ProfileForm({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState(profile || { name: '', topic: '', goal: '' })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState(false)
  const formRef = useRef(null)
  function update(key, value) { setDraft({ ...draft, [key]: value }); setSaveError(false) }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateProfile(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    try { onSave(draft) } catch { setSaveError(true) }
  }
  return <form ref={formRef} onSubmit={submit} noValidate className="profile-form">
    <div className="section-heading"><span className="eyebrow">YOUR PROFILE</span><h2>{profile ? 'プロフィールを編集' : 'あなたの学びを教えてください'}</h2><p>{profile ? '保存すると、おすすめの仲間も更新されます。' : 'まずはテーマを1つ。共通の学びが、出会いのきっかけに。'}</p></div>
    <div className="field"><label htmlFor="display-name">表示名 <span className="required">必須</span></label><input id="display-name" value={draft.name} maxLength={40} autoComplete="nickname" placeholder="例：田中 美咲" required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} onChange={e => update('name', e.target.value)}/>{errors.name && <p id="name-error" className="field-error">{errors.name}</p>}</div>
    <fieldset aria-describedby={errors.topic ? 'topic-error' : 'topic-help'}><legend>学習テーマ <span className="required">必須</span></legend><p id="topic-help" className="hint">いま学んでいる、またはこれから学びたいテーマを1つ選択</p><div className="topic-options">{TOPICS.map((topic, i) => <label className={`topic-option ${draft.topic === topic ? 'selected' : ''}`} key={topic}><input type="radio" name="topic" value={topic} checked={draft.topic === topic} required aria-invalid={!!errors.topic} aria-describedby={errors.topic ? 'topic-error' : undefined} onChange={() => update('topic', topic)}/><span className="topic-icon" aria-hidden="true">{topicIcons[i]}</span><span>{topic}</span></label>)}</div>{errors.topic && <p id="topic-error" className="field-error">{errors.topic}</p>}</fieldset>
    <div className="field"><label htmlFor="goal">一緒に学びたいこと <span className="optional">任意</span></label><p id="goal-help" className="hint">例：週1回、SQLの練習問題について相談したい</p><textarea id="goal" rows={3} maxLength={300} value={draft.goal} aria-describedby="goal-help goal-count" aria-invalid={!!errors.goal} placeholder="学習の目的や、仲間と取り組んでみたいことなど" onChange={e => update('goal', e.target.value)}/><span id="goal-count" className="counter">{draft.goal.length} / 300</span>{errors.goal && <p className="field-error">{errors.goal}</p>}</div>
    {saveError && <div role="alert" className="error-box"><strong>プロフィールを保存できませんでした。</strong><p>ブラウザーの保存領域が利用できないか、空き容量が不足しています。設定・空き容量を確認して、もう一度保存してください。入力内容はこの画面に残っています。</p></div>}
    <div className="form-actions">{profile && <button type="button" className="secondary" onClick={onCancel}>キャンセル</button>}<button type="submit" className="primary">{profile ? '変更を保存する' : '登録して仲間を見つける'} <span aria-hidden="true">→</span></button></div>
    {!profile && <p className="form-note">あとから、いつでもプロフィールを変更できます。</p>}
  </form>
}
function App() {
  const [saved, setSaved] = useState(readSaved)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const headingRef = useRef(null)
  const profile = saved.profile
  const showForm = !profile || editing
  const matches = profile ? recommendations(profile, [...EMPLOYEES, profile]) : []
  function save(draft) {
    const next = saveProfile(window.localStorage, draft, profile?.id || crypto.randomUUID())
    setSaved({ profile: next, error: false }); setEditing(false)
    setNotice(profile ? 'プロフィールの変更を保存しました。おすすめを更新しました。' : 'プロフィールを登録しました。同じテーマの仲間が見つかります。')
    requestAnimationFrame(() => headingRef.current?.focus())
  }
  function edit() { setEditing(true); setNotice(''); requestAnimationFrame(() => document.getElementById('display-name')?.focus()) }
  function cancel() { setEditing(false); requestAnimationFrame(() => headingRef.current?.focus()) }
  return <div className="app-shell">
    <header className="site-header"><div className="brand"><span className="brand-symbol" aria-hidden="true">ll<span>↗</span></span><span>Learning Link<small>学びで、つながる。</small></span></div><div className="header-meta"><span className="demo-dot"/> レビュー用デモ<span className="header-divider"/>社内の学びをつなぐ</div></header>
    <main>
      <div className="page-intro"><div><p className="eyebrow">GROW TOGETHER, WORK BETTER.</p><h1>ひとりの学びを、<br className="mobile-break"/>仲間との学びに。</h1><p>同じことを学ぶ仲間は、きっと社内にいる。</p></div><div className="connection-art" aria-hidden="true"><span>学</span><i>····</i><span>学</span><small>小さな共通点から、つながろう。</small></div></div>
      {notice && <div role="status" className="success-notice"><span aria-hidden="true">✓</span>{notice}</div>}
      {profile && !editing && <Meetings profile={profile}/>}
      {saved.error ? <section className="panel load-error" role="alert"><span className="eyebrow">STORAGE ERROR</span><h2>登録情報を読み込めませんでした</h2><p>ブラウザーの保存設定、または保存データに問題があります。保存を許可してから再試行してください。既存のデータは上書きしていません。</p><button className="primary" onClick={() => setSaved(readSaved())}>読み込みを再試行</button></section> : showForm ? <div className="onboarding-layout"><section className="panel"><ProfileForm profile={profile} onSave={save} onCancel={cancel}/></section><aside className="onboarding-aside"><span className="eyebrow">A LITTLE CONNECTION</span><h2>「それ、私も勉強中です。」<br/>から始まるつながり。</h2><p>部署も、経験も違うからこそ、<br/>一緒に学ぶと新しい発見がある。</p><div className="steps"><div><b>01</b><span>学んでいることを登録<small>テーマは1つ選ぶだけ。</small></span></div><div><b>02</b><span>同じテーマの仲間に出会う<small>登録すると自動でおすすめを表示。</small></span></div><div><b>03</b><span>一緒に学びたいことを知る<small>相手の目的から、共通点を見つけよう。</small></span></div></div><div className="demo-guide"><strong>このデモで試せること</strong><p>Python・SQL：同じテーマの仲間が複数<br/>基本情報技術者：該当する仲間が0人</p><small>表示される社員はすべて架空のデータです。</small></div></aside></div> : <div className="dashboard-layout"><aside className="panel my-profile"><span className="eyebrow">MY LEARNING</span><div className="my-avatar" aria-hidden="true">{profile.name.slice(0, 1)}</div><h2>{profile.name}</h2><span className="self-label">あなたのプロフィール</span><div className="profile-detail"><span>学習中のテーマ</span><strong className="topic-pill">{profile.topic}</strong></div><div className="profile-detail"><span>一緒に学びたいこと</span><p>{profile.goal || '未登録'}</p></div><button className="secondary edit-button" onClick={edit}>プロフィールを編集 <span aria-hidden="true">↗</span></button><p className="profile-footnote">テーマを変えると、おすすめも変わります。</p></aside><section className="recommendations" aria-labelledby="recommendation-title"><div className="results-heading"><div><p className="eyebrow">YOUR LEARNING CIRCLE</p><h2 id="recommendation-title" ref={headingRef} tabIndex={-1}>同じテーマを学ぶ仲間 <span>{matches.length}人</span></h2><p><strong>{profile.topic}</strong> を学習中の社員をご紹介します。</p></div><span className="demo-badge">デモデータ</span></div>{matches.length ? <div className="employee-grid">{matches.map((employee, index) => <article className="employee-card" key={employee.id}><div className="person-heading"><div className={`avatar ${employee.color}`} aria-hidden="true">{employee.name.slice(0, 1)}</div><div><p className="department">{employee.department}</p><h3>{employee.name}</h3></div><span className="card-number" aria-hidden="true">0{index + 1}</span></div><span className="topic-pill"><span aria-hidden="true">↗ </span>{employee.topic}<span className="common-label">共通のテーマ</span></span><div className="learning-goal"><h4>一緒に学びたいこと</h4><p className={employee.goal ? '' : 'unregistered'}>{employee.goal || '未登録'}</p></div><div className="card-footer"><span className="small-dot"/> 同じ学びが、つながりのきっかけに。</div></article>)}</div> : <div className="empty-state"><span className="empty-icon" aria-hidden="true">↗</span><h3>同じテーマを学習中の社員はまだいません</h3><p>あなたが学習中のテーマは「{profile.topic}」です。<br/>別の学びにも興味があれば、プロフィールから変更できます。</p><button className="secondary" onClick={edit}>プロフィールを編集</button></div>}<div className="recommendation-note"><span aria-hidden="true">ⓘ</span><p>同じ学習テーマを登録した社員を表示しています。<br/>社員は一意のIDで区別し、同じ表示名でも別の社員として表示します。</p></div></section></div>}
      <div className="data-notice"><button className="secondary" type="button" onClick={() => { try { const keys = ['learning-link.profile.v1', 'meetings']; const backup = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])); localStorage.setItem('learning-link.review-backup', JSON.stringify(backup)); keys.forEach(key => localStorage.removeItem(key)); window.location.reload(); } catch { window.alert('クリアできませんでした。ブラウザーの保存設定を確認してください。'); } }}>レビュー用に登録データをクリア</button><button className="secondary" type="button" onClick={() => { try { const raw = localStorage.getItem('learning-link.review-backup'); if (!raw) { window.alert('復元できるバックアップがありません。'); return; } const backup = JSON.parse(raw); for (const key of ['learning-link.profile.v1', 'meetings']) { if (backup[key] === null) localStorage.removeItem(key); else if (typeof backup[key] === 'string') localStorage.setItem(key, backup[key]); } window.location.reload(); } catch { window.alert('復元できませんでした。'); } }}>直前のクリアを元に戻す</button><strong>レビュー用デモ</strong><p>登録内容はこのブラウザーだけに保存されます。ほかの社員・端末とは共有されません。おすすめは架空の社員データです。</p></div>
    </main><footer><span>Learning Link</span><p>学ぶきっかけを、つながるきっかけに。</p><small>INTERNAL LEARNING COMMUNITY · DEMO</small></footer>
  </div>
}
export default App
