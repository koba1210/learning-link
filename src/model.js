export const TOPICS = ['Python', 'SQL', '生成AI', 'AWS認定', '基本情報技術者']
export const STORAGE_KEY = 'learning-link.profile.v1'
export const EMPLOYEES = [
  { id: 'demo-01', name: '田中 美咲', topic: 'Python', goal: '業務の集計作業を自動化したいです。小さなスクリプトを一緒に作りながら学びたいです。', department: '営業企画部', color: 'sage' },
  { id: 'demo-02', name: '佐藤 健太', topic: 'Python', goal: '', department: '経営管理部', color: 'sand' },
  { id: 'demo-03', name: '鈴木 遥', topic: 'SQL', goal: '週1回、SQLの練習問題について相談したいです。JOINや集計を実務で使えるようになりたいです。', department: 'マーケティング部', color: 'lavender' },
  { id: 'demo-04', name: '田中 美咲', topic: 'SQL', goal: 'データ分析の基礎を勉強中です。お互いの疑問を気軽に共有できると嬉しいです。', department: 'プロダクト開発部', color: 'sage' },
  { id: 'demo-05', name: '高橋 直人', topic: '生成AI', goal: '生成AIの業務活用について、試してみたことやプロンプトの工夫を共有したいです。', department: '人事部', color: 'sand' },
  { id: 'demo-06', name: '伊藤 葵', topic: 'AWS認定', goal: 'AWS認定の取得に向けて、つまずいた問題を一緒に振り返りたいです。', department: '情報システム部', color: 'lavender' },
]
export function validateProfile(profile) {
  const errors = {}
  if (typeof profile.name !== 'string' || !profile.name.trim()) errors.name = '表示名を入力してください。'
  else if (profile.name.trim().length > 40) errors.name = '表示名は40文字以内で入力してください。'
  if (!TOPICS.includes(profile.topic)) errors.topic = '学習テーマを1つ選択してください。'
  if (typeof profile.goal !== 'string' || profile.goal.length > 300) errors.goal = '一緒に学びたいことは300文字以内で入力してください。'
  return errors
}
export function recommendations(profile, employees = EMPLOYEES) {
  return employees.filter(employee => employee.id !== profile.id && employee.topic === profile.topic)
}
export function loadProfile(storage) {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return null
  const profile = JSON.parse(raw)
  if (!profile || typeof profile.id !== 'string' || !profile.id || Object.keys(validateProfile(profile)).length) throw new Error('Invalid profile')
  return profile
}
export function saveProfile(storage, draft, id) {
  if (Object.keys(validateProfile(draft)).length) throw new Error('Invalid profile')
  const profile = { id, name: draft.name.trim(), topic: draft.topic, goal: draft.goal.trim() }
  storage.setItem(STORAGE_KEY, JSON.stringify(profile))
  return profile
}
