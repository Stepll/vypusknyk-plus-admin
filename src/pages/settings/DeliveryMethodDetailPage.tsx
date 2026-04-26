import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Card, Switch, Input, Select, Table, message, Spin, Tag, Popconfirm,
} from 'antd'
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined,
} from '@ant-design/icons'
import { getDeliveryMethod, updateDeliveryMethod } from '../../api/deliveryMethods'
import type { DeliveryMethodResponse, DeliveryCheckoutField } from '../../api/types'

type FieldKey = keyof DeliveryCheckoutField

function newField(): DeliveryCheckoutField {
  return { key: '', label: '', type: 'input', required: false, isEnabled: true, optionsJson: '' }
}

export default function DeliveryMethodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [method, setMethod] = useState<DeliveryMethodResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [isEnabled, setIsEnabled] = useState(false)
  const [settings, setSettings] = useState('{}')
  const [fields, setFields] = useState<DeliveryCheckoutField[]>([])

  useEffect(() => {
    getDeliveryMethod(Number(id))
      .then(m => {
        setMethod(m)
        setIsEnabled(m.isEnabled)
        setSettings(m.settings)
        setFields(m.checkoutFields)
      })
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false))
  }, [id])

  function updateField(index: number, key: FieldKey, value: string | boolean) {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f))
  }

  function removeField(index: number) {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateDeliveryMethod(Number(id), { isEnabled, settings, checkoutFields: fields })
      setMethod(updated)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const fieldColumns = [
    {
      title: 'Ключ',
      key: 'key',
      width: 130,
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Input
          size="small"
          value={f.key}
          placeholder="city"
          onChange={e => updateField(i, 'key', e.target.value)}
        />
      ),
    },
    {
      title: 'Назва поля',
      key: 'label',
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Input
          size="small"
          value={f.label}
          placeholder="Місто"
          onChange={e => updateField(i, 'label', e.target.value)}
        />
      ),
    },
    {
      title: 'Тип',
      key: 'type',
      width: 120,
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Select
          size="small"
          value={f.type}
          style={{ width: '100%' }}
          onChange={v => updateField(i, 'type', v)}
          options={[
            { value: 'input', label: 'Input' },
            { value: 'select', label: 'Select' },
          ]}
        />
      ),
    },
    {
      title: 'Обов\'язкове',
      key: 'required',
      width: 110,
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Switch
          size="small"
          checked={f.required}
          onChange={v => updateField(i, 'required', v)}
        />
      ),
    },
    {
      title: 'Options JSON',
      key: 'optionsJson',
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Input
          size="small"
          value={f.optionsJson}
          placeholder='{"url": "..."}'
          onChange={e => updateField(i, 'optionsJson', e.target.value)}
        />
      ),
    },
    {
      title: 'Активне',
      key: 'isEnabled',
      width: 90,
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Switch
          size="small"
          checked={f.isEnabled}
          onChange={v => updateField(i, 'isEnabled', v)}
        />
      ),
    },
    {
      title: '',
      key: 'delete',
      width: 40,
      render: (_: unknown, _f: DeliveryCheckoutField, i: number) => (
        <Popconfirm title="Видалити поле?" onConfirm={() => removeField(i)} okText="Так" cancelText="Ні">
          <Button icon={<DeleteOutlined />} size="small" danger type="text" />
        </Popconfirm>
      ),
    },
  ]

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!method) return <div style={{ color: '#8c8c8c', textAlign: 'center', paddingTop: 80 }}>Не знайдено</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/delivery')} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{method.name}</h2>
              <Tag color="blue">{method.slug}</Tag>
            </div>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Налаштування методу доставки</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>Активний</span>
          <Switch checked={isEnabled} onChange={setIsEnabled} />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Зберегти
          </Button>
        </div>
      </div>

      {/* Settings JSON */}
      <Card
        title="Налаштування (JSON)"
        style={{ marginBottom: 16 }}
        size="small"
        extra={<span style={{ color: '#8c8c8c', fontSize: 12 }}>API ключі та інтеграції</span>}
      >
        <Input.TextArea
          value={settings}
          onChange={e => setSettings(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 12 }}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
          placeholder="{}"
        />
      </Card>

      {/* Checkout Fields */}
      <Card
        title="Поля при оформленні замовлення"
        size="small"
        extra={
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setFields(prev => [...prev, newField()])}
          >
            Додати поле
          </Button>
        }
      >
        <Table
          dataSource={fields}
          columns={fieldColumns}
          rowKey={(_, i) => String(i)}
          pagination={false}
          size="small"
          locale={{ emptyText: 'Немає полів' }}
        />
      </Card>
    </div>
  )
}
