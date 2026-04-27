import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Tag, message, Drawer, Input, Checkbox, Popconfirm, Space,
} from 'antd'
import { CheckCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getOrderStatuses, createOrderStatus, updateOrderStatus, deleteOrderStatus,
} from '../../api/orderStatuses'
import type { OrderStatusResponse, SaveOrderStatusRequest } from '../../api/types'

const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#3b82f6', '#10b981',
  '#ef4444', '#8b5cf6', '#06b6d4', '#f97316',
  '#ec4899', '#64748b',
]

const TOTAL_STEPS = 4

// ── Interactive step picker ──────────────────────────────────────────────────

function StepPicker({ value, onChange, color }: {
  value: number
  onChange: (v: number) => void
  color: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0', userSelect: 'none' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        const filled = step <= value
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: step < TOTAL_STEPS ? 1 : 0 }}>
            <div
              onClick={() => onChange(step)}
              title={`Крок ${step}`}
              style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: filled ? color : '#f0f0f0',
                border: `2px solid ${filled ? color : '#d9d9d9'}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: filled ? '#fff' : '#bbb',
                boxShadow: step === value ? `0 0 0 4px ${color}33` : 'none',
                transition: 'all 0.15s',
              }}
            >
              {step}
            </div>
            {step < TOTAL_STEPS && (
              <div
                onClick={() => onChange(step + 1)}
                style={{
                  flex: 1, height: 4, minWidth: 32,
                  background: step < value ? color : '#f0f0f0',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Mini preview in table ────────────────────────────────────────────────────

function StepPreview({ step, color }: { step: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const s = i + 1
        const filled = s <= step
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < TOTAL_STEPS ? 1 : 0 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: filled ? color : '#e5e7eb',
              border: `2px solid ${filled ? color : '#e5e7eb'}`,
            }} />
            {s < TOTAL_STEPS && (
              <div style={{
                flex: 1, height: 3, minWidth: 12,
                background: s < step ? color : '#e5e7eb',
                borderRadius: 2,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Default form state ───────────────────────────────────────────────────────

function emptyForm(): SaveOrderStatusRequest {
  return { name: '', color: PRESET_COLORS[0], sortOrder: 1, isFinal: false, isActive: true }
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function OrderStatusesPage() {
  const [statuses, setStatuses] = useState<OrderStatusResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<OrderStatusResponse | null>(null)
  const [form, setForm] = useState<SaveOrderStatusRequest>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    getOrderStatuses()
      .then(setStatuses)
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false))
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setDrawerOpen(true)
  }

  function openEdit(s: OrderStatusResponse) {
    setEditing(s)
    setForm({ name: s.name, color: s.color, sortOrder: s.sortOrder, isFinal: s.isFinal, isActive: s.isActive })
    setDrawerOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { message.warning('Введіть назву'); return }
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateOrderStatus(editing.id, form)
        setStatuses(prev => prev.map(s => s.id === editing.id ? updated : s).sort((a, b) => a.sortOrder - b.sortOrder))
      } else {
        const created = await createOrderStatus(form)
        setStatuses(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder))
      }
      setDrawerOpen(false)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(s: OrderStatusResponse, isActive: boolean) {
    setToggling(s.id)
    try {
      const updated = await updateOrderStatus(s.id, { ...s, isActive })
      setStatuses(prev => prev.map(x => x.id === s.id ? updated : x))
    } catch {
      message.error('Не вдалось змінити статус')
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteOrderStatus(id)
      setStatuses(prev => prev.filter(s => s.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const columns = [
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, s: OrderStatusResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{s.name}</span>
        </div>
      ),
    },
    {
      title: 'Крок',
      key: 'step',
      width: 180,
      render: (_: unknown, s: OrderStatusResponse) => (
        <StepPreview step={s.sortOrder} color={s.color} />
      ),
    },
    {
      title: 'Фінальний',
      key: 'isFinal',
      width: 110,
      render: (_: unknown, s: OrderStatusResponse) =>
        s.isFinal ? <Tag color="green">Фінал</Tag> : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Активний',
      key: 'isActive',
      width: 100,
      render: (_: unknown, s: OrderStatusResponse) => (
        <Switch
          checked={s.isActive}
          loading={toggling === s.id}
          onChange={v => handleToggle(s, v)}
        />
      ),
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      render: (_: unknown, s: OrderStatusResponse) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(s)} />
          <Popconfirm
            title="Видалити статус?"
            onConfirm={() => handleDelete(s.id)}
            okText="Так" cancelText="Ні"
          >
            <Button icon={<DeleteOutlined />} size="small" danger type="text" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <CheckCircleOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Статуси замовлень</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Прийнято, Виробництво, Відправлено, Доставлено</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Додати статус
        </Button>
      </div>

      <Table
        dataSource={statuses}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      {/* Create / Edit Drawer */}
      <Drawer
        title={editing ? `Редагувати: ${editing.name}` : 'Новий статус'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#595959' }}>Назва</div>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Наприклад: Прийнято"
            size="large"
          />
        </div>

        {/* Color */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#595959' }}>Колір</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                  outline: form.color === c ? `2px solid ${c}` : '2px solid transparent',
                  outlineOffset: 2,
                  transition: 'outline 0.1s',
                }}
              />
            ))}
          </div>
          <Input
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            style={{ marginTop: 8, fontFamily: 'monospace' }}
            placeholder="#6366f1"
          />
        </div>

        {/* Progress step picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#595959' }}>
            Крок у прогрес-барі
          </div>
          <StepPicker
            value={form.sortOrder}
            onChange={v => setForm(f => ({ ...f, sortOrder: v }))}
            color={form.color}
          />
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
            Натисніть на кружок, щоб обрати позицію статусу
          </div>
        </div>

        {/* Switches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>Активний</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Статус доступний для замовлень</div>
            </div>
            <Switch
              checked={form.isActive}
              onChange={v => setForm(f => ({ ...f, isActive: v }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>Фінальний</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Замовлення завершено, зміни не очікуються</div>
            </div>
            <Checkbox
              checked={form.isFinal}
              onChange={e => setForm(f => ({ ...f, isFinal: e.target.checked }))}
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
