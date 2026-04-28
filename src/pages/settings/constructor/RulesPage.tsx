import { useState, useEffect } from 'react'
import { ApartmentOutlined, PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Select, Input, Checkbox, Tabs, Popconfirm, message, Tag, Space } from 'antd'
import {
  getIncompatibilities, createIncompatibility, updateIncompatibility, deleteIncompatibility,
  getForcedTexts, createForcedText, updateForcedText, deleteForcedText,
} from '../../../api/constructorRules'
import { getRibbonPrintTypes } from '../../../api/ribbonPrintTypes'
import { getRibbonMaterials } from '../../../api/ribbonMaterials'
import { getRibbonFonts } from '../../../api/ribbonFonts'
import { getRibbonPrintColors } from '../../../api/ribbonPrintColors'
import { getRibbonColors } from '../../../api/ribbonColors'
import { getRibbonEmblems } from '../../../api/ribbonEmblems'
import type {
  SaveConstructorIncompatibilityRequest,
  SaveConstructorForcedTextRequest,
} from '../../../api/types'

type SlugOption = { slug: string; name: string }
type OptionMap = Record<string, SlugOption[]>

const FIELD_TYPES = [
  { value: 'printType', label: 'Тип друку' },
  { value: 'material',  label: 'Матеріал' },
  { value: 'font',      label: 'Шрифт' },
  { value: 'textColor', label: 'Колір тексту' },
  { value: 'color',     label: 'Колір стрічки' },
  { value: 'emblem',    label: 'Емблема' },
]

const TEXT_FIELDS = [
  { value: 'mainText', label: 'Основний текст' },
  { value: 'school',   label: 'Школа' },
]

const INCOMPAT_TYPES = [
  { value: false, label: 'недоступні' },
  { value: true,  label: 'попередження' },
]

let _negId = -1
const newNegId = () => _negId--

type IncompatDraft = SaveConstructorIncompatibilityRequest & { id: number }
type ForcedTextDraft = SaveConstructorForcedTextRequest & { id: number }

// ── Sub-components ────────────────────────────────────────────────────────────

const blockStyle: React.CSSProperties = {
  background: '#fff',
  border: '1.5px solid #e8e8f0',
  borderRadius: 12,
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#888',
  whiteSpace: 'nowrap',
}

interface IncompatCardProps {
  rule: IncompatDraft
  optionMap: OptionMap
  saving: boolean
  deleting: boolean
  onChange: (patch: Partial<IncompatDraft>) => void
  onSave: () => void
  onDelete: () => void
}

function IncompatCard({ rule, optionMap, saving, deleting, onChange, onSave, onDelete }: IncompatCardProps) {
  const slugsForType = (type: string) => (optionMap[type] ?? []).map(o => ({ value: o.slug, label: o.name }))

  return (
    <div style={blockStyle}>
      {/* Row 1: Якщо [typeA] = [slugA] → [недоступні|попередження] [typeB] */}
      <div style={rowStyle}>
        <span style={labelStyle}>Якщо</span>
        <Select
          style={{ width: 140 }}
          value={rule.typeA}
          options={FIELD_TYPES}
          onChange={v => onChange({ typeA: v, slugA: '' })}
        />
        <span style={labelStyle}>=</span>
        <Select
          style={{ width: 160 }}
          value={rule.slugA || undefined}
          placeholder="Значення..."
          options={slugsForType(rule.typeA)}
          onChange={v => onChange({ slugA: v })}
        />
        <span style={{ fontSize: 18, color: '#7c3aed', margin: '0 4px' }}>→</span>
        <Select
          style={{ width: 160 }}
          value={rule.isWarning}
          options={INCOMPAT_TYPES}
          onChange={v => onChange({ isWarning: v })}
        />
        <Select
          style={{ width: 140 }}
          value={rule.typeB}
          options={FIELD_TYPES}
          onChange={v => onChange({ typeB: v, slugsB: [] })}
        />
        <span style={labelStyle}>:</span>
      </div>

      {/* Row 2: Checkboxes for slugsB */}
      {rule.typeB && (
        <div style={{ paddingLeft: 4 }}>
          <Checkbox.Group
            value={rule.slugsB}
            onChange={vals => onChange({ slugsB: vals as string[] })}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          >
            {slugsForType(rule.typeB).map(opt => (
              <Checkbox key={opt.value} value={opt.value}>
                {opt.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      )}

      {/* Row 3: Message */}
      <div style={rowStyle}>
        <span style={labelStyle}>Повідомлення:</span>
        <Input
          style={{ flex: 1 }}
          value={rule.message ?? ''}
          placeholder="Підказка при наведенні (необов'язково)"
          onChange={e => onChange({ message: e.target.value || null })}
        />
      </div>

      {/* Row 4: Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Popconfirm title="Видалити правило?" onConfirm={onDelete} okText="Так" cancelText="Ні">
          <Button icon={<DeleteOutlined />} danger loading={deleting}>Видалити</Button>
        </Popconfirm>
        <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={onSave}>
          Зберегти
        </Button>
      </div>
    </div>
  )
}

interface ForcedTextCardProps {
  rule: ForcedTextDraft
  optionMap: OptionMap
  saving: boolean
  deleting: boolean
  newValueInput: string
  onChange: (patch: Partial<ForcedTextDraft>) => void
  onNewValueChange: (val: string) => void
  onAddValue: (val: string) => void
  onRemoveValue: (val: string) => void
  onSave: () => void
  onDelete: () => void
}

function ForcedTextCard({
  rule, optionMap, saving, deleting, newValueInput,
  onChange, onNewValueChange, onAddValue, onRemoveValue, onSave, onDelete,
}: ForcedTextCardProps) {
  const slugsForType = (type: string) => (optionMap[type] ?? []).map(o => ({ value: o.slug, label: o.name }))

  return (
    <div style={blockStyle}>
      {/* Row 1: Якщо [triggerType] = [triggerSlug] → [targetField] */}
      <div style={rowStyle}>
        <span style={labelStyle}>Якщо</span>
        <Select
          style={{ width: 140 }}
          value={rule.triggerType}
          options={FIELD_TYPES}
          onChange={v => onChange({ triggerType: v, triggerSlug: '' })}
        />
        <span style={labelStyle}>=</span>
        <Select
          style={{ width: 160 }}
          value={rule.triggerSlug || undefined}
          placeholder="Значення..."
          options={slugsForType(rule.triggerType)}
          onChange={v => onChange({ triggerSlug: v })}
        />
        <span style={{ fontSize: 18, color: '#7c3aed', margin: '0 4px' }}>→</span>
        <Select
          style={{ width: 180 }}
          value={rule.targetField}
          options={TEXT_FIELDS}
          onChange={v => onChange({ targetField: v })}
        />
        <span style={labelStyle}>дозволені значення:</span>
      </div>

      {/* Row 2: Value chips + add input */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingLeft: 4 }}>
        {rule.values.map(v => (
          <Tag
            key={v}
            closable
            onClose={() => onRemoveValue(v)}
            style={{ fontSize: 13, padding: '2px 10px', borderRadius: 6 }}
          >
            {v}
          </Tag>
        ))}
        <Space.Compact>
          <Input
            style={{ width: 200 }}
            placeholder="Новий варіант..."
            value={newValueInput}
            onChange={e => onNewValueChange(e.target.value)}
            onPressEnter={() => newValueInput.trim() && onAddValue(newValueInput.trim())}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => newValueInput.trim() && onAddValue(newValueInput.trim())}
          >
            Додати
          </Button>
        </Space.Compact>
      </div>

      {/* Row 3: Message */}
      <div style={rowStyle}>
        <span style={labelStyle}>Повідомлення:</span>
        <Input
          style={{ flex: 1 }}
          value={rule.message ?? ''}
          placeholder="Підказка при наведенні (необов'язково)"
          onChange={e => onChange({ message: e.target.value || null })}
        />
      </div>

      {/* Row 4: Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Popconfirm title="Видалити правило?" onConfirm={onDelete} okText="Так" cancelText="Ні">
          <Button icon={<DeleteOutlined />} danger loading={deleting}>Видалити</Button>
        </Popconfirm>
        <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={onSave}>
          Зберегти
        </Button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RulesPage() {
  const [optionMap, setOptionMap] = useState<OptionMap>({})
  const [incompats, setIncompats] = useState<IncompatDraft[]>([])
  const [forcedTexts, setForcedTexts] = useState<ForcedTextDraft[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({})

  useEffect(() => {
    Promise.all([
      getIncompatibilities(),
      getForcedTexts(),
      getRibbonPrintTypes(),
      getRibbonMaterials(),
      getRibbonFonts(),
      getRibbonPrintColors(),
      getRibbonColors(),
      getRibbonEmblems(),
    ]).then(([incs, fts, pts, mats, fonts, pcs, colors, emblems]) => {
      setOptionMap({
        printType: pts.map(x => ({ slug: x.slug, name: x.name })),
        material:  mats.map(x => ({ slug: x.slug, name: x.name })),
        font:      fonts.map(x => ({ slug: x.slug, name: x.name })),
        textColor: pcs.map(x => ({ slug: x.slug, name: x.name })),
        color:     colors.map(x => ({ slug: x.slug, name: x.name })),
        emblem:    emblems.map(x => ({ slug: x.slug, name: x.name })),
      })
      setIncompats(incs.map(r => ({
        id: r.id, typeA: r.typeA, slugA: r.slugA, typeB: r.typeB,
        isWarning: r.isWarning, message: r.message, slugsB: r.slugsB,
      })))
      setForcedTexts(fts.map(r => ({
        id: r.id, triggerType: r.triggerType, triggerSlug: r.triggerSlug,
        targetField: r.targetField, message: r.message, values: r.values,
      })))
    }).catch(() => message.error('Помилка завантаження'))
  }, [])

  // ── Incompatibilities ─────────────────────────────────────────────────────

  function patchIncompat(id: number, patch: Partial<IncompatDraft>) {
    setIncompats(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  async function saveIncompat(draft: IncompatDraft) {
    setSaving(draft.id)
    try {
      const payload: SaveConstructorIncompatibilityRequest = {
        typeA: draft.typeA, slugA: draft.slugA, typeB: draft.typeB,
        isWarning: draft.isWarning, message: draft.message, slugsB: draft.slugsB,
      }
      if (draft.id < 0) {
        const res = await createIncompatibility(payload)
        setIncompats(prev => prev.map(r => r.id === draft.id ? { ...res } : r))
      } else {
        const res = await updateIncompatibility(draft.id, payload)
        setIncompats(prev => prev.map(r => r.id === draft.id ? { ...res } : r))
      }
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(null)
    }
  }

  async function removeIncompat(id: number) {
    setDeleting(id)
    try {
      if (id > 0) await deleteIncompatibility(id)
      setIncompats(prev => prev.filter(r => r.id !== id))
    } catch {
      message.error('Помилка видалення')
    } finally {
      setDeleting(null)
    }
  }

  // ── Forced Texts ──────────────────────────────────────────────────────────

  function patchFT(id: number, patch: Partial<ForcedTextDraft>) {
    setForcedTexts(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  async function saveFT(draft: ForcedTextDraft) {
    setSaving(draft.id)
    try {
      const payload: SaveConstructorForcedTextRequest = {
        triggerType: draft.triggerType, triggerSlug: draft.triggerSlug,
        targetField: draft.targetField, message: draft.message, values: draft.values,
      }
      if (draft.id < 0) {
        const res = await createForcedText(payload)
        setForcedTexts(prev => prev.map(r => r.id === draft.id ? { ...res } : r))
      } else {
        const res = await updateForcedText(draft.id, payload)
        setForcedTexts(prev => prev.map(r => r.id === draft.id ? { ...res } : r))
      }
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(null)
    }
  }

  async function removeFT(id: number) {
    setDeleting(id)
    try {
      if (id > 0) await deleteForcedText(id)
      setForcedTexts(prev => prev.filter(r => r.id !== id))
    } catch {
      message.error('Помилка видалення')
    } finally {
      setDeleting(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <ApartmentOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Правила конструктора</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Сумісність опцій конструктора між собою</p>
        </div>
      </div>

      <Tabs
        items={[
          {
            key: 'incompatibilities',
            label: `Несумісності (${incompats.length})`,
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900 }}>
                {incompats.map(rule => (
                  <IncompatCard
                    key={rule.id}
                    rule={rule}
                    optionMap={optionMap}
                    saving={saving === rule.id}
                    deleting={deleting === rule.id}
                    onChange={patch => patchIncompat(rule.id, patch)}
                    onSave={() => saveIncompat(rule)}
                    onDelete={() => removeIncompat(rule.id)}
                  />
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => setIncompats(prev => [...prev, {
                    id: newNegId(), typeA: 'printType', slugA: '',
                    typeB: 'emblem', isWarning: false, message: null, slugsB: [],
                  }])}
                >
                  Додати правило
                </Button>
              </div>
            ),
          },
          {
            key: 'forcedTexts',
            label: `Фіксований текст (${forcedTexts.length})`,
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900 }}>
                {forcedTexts.map(rule => (
                  <ForcedTextCard
                    key={rule.id}
                    rule={rule}
                    optionMap={optionMap}
                    saving={saving === rule.id}
                    deleting={deleting === rule.id}
                    newValueInput={newValueInputs[rule.id] ?? ''}
                    onChange={patch => patchFT(rule.id, patch)}
                    onNewValueChange={val => setNewValueInputs(prev => ({ ...prev, [rule.id]: val }))}
                    onAddValue={val => {
                      patchFT(rule.id, { values: [...rule.values, val] })
                      setNewValueInputs(prev => ({ ...prev, [rule.id]: '' }))
                    }}
                    onRemoveValue={val => patchFT(rule.id, { values: rule.values.filter(v => v !== val) })}
                    onSave={() => saveFT(rule)}
                    onDelete={() => removeFT(rule.id)}
                  />
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => setForcedTexts(prev => [...prev, {
                    id: newNegId(), triggerType: 'printType', triggerSlug: '',
                    targetField: 'mainText', message: null, values: [],
                  }])}
                >
                  Додати правило
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
