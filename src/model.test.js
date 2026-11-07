import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EMPLOYEES, STORAGE_KEY, validateProfile, recommendations, loadProfile, saveProfile } from './model.js'
const profile = { id: 'self-123', name: '田中 美咲', topic: 'Python', goal: '' }
function storage() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } }
test('必須項目、テーマ候補と文字数を検証する。任意欄は空でもよい', () => {
  assert.deepEqual(Object.keys(validateProfile({ name: '  ', topic: '', goal: '' })), ['name', 'topic'])
  assert.deepEqual(validateProfile(profile), {})
  assert.ok(validateProfile({ ...profile, topic: 'Java' }).topic)
  assert.ok(validateProfile({ ...profile, name: 'あ'.repeat(41) }).name)
  assert.ok(validateProfile({ ...profile, goal: 'あ'.repeat(301) }).goal)
})
test('一致テーマのみ、本人IDを除外し、同名の別社員を含める', () => {
  const result = recommendations(profile, [...EMPLOYEES, profile])
  assert.deepEqual(result.map(person => person.id), ['demo-01', 'demo-02'])
  assert.equal(result[0].name, profile.name)
  assert.ok(result.every(person => person.id !== profile.id && person.topic === profile.topic))
  assert.equal(result[1].goal, '')
})
test('テーマ変更で推薦が入れ替わり、該当者0件も返す', () => {
  assert.deepEqual(recommendations({ ...profile, topic: 'SQL' }).map(person => person.id), ['demo-03', 'demo-04'])
  assert.deepEqual(recommendations({ ...profile, topic: '基本情報技術者' }), [])
})
test('保存と再読込でプロフィールとIDを保持し、編集時も同じIDで更新する', () => {
  const store = storage()
  assert.equal(loadProfile(store), null)
  saveProfile(store, { ...profile, name: ' 田中 美咲 ' }, profile.id)
  assert.deepEqual(loadProfile(store), profile)
  const changed = saveProfile(store, { ...profile, topic: 'SQL', goal: '週1回相談したい' }, profile.id)
  assert.deepEqual(loadProfile(store), changed)
  assert.equal(changed.id, profile.id)
})
test('不正データ、読込不可、保存不可を空プロフィールと混同しない', () => {
  const store = storage()
  for (const value of ['{broken', 'null', '{}', JSON.stringify({ ...profile, topic: 'Java' })]) {
    store.setItem(STORAGE_KEY, value)
    assert.throws(() => loadProfile(store))
    assert.equal(store.getItem(STORAGE_KEY), value)
  }
  assert.throws(() => loadProfile({ getItem() { throw new Error('blocked') } }))
  assert.throws(() => saveProfile({ setItem() { throw new Error('full') } }, profile, profile.id))
})
