import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Card, Switch, Input, Select, Table, message, Spin, Tag, Popconfirm, Tooltip, Collapse,
} from 'antd'
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { getDeliveryMethod, updateDeliveryMethod } from '../../api/deliveryMethods'
import type { DeliveryMethodResponse, DeliveryCheckoutField } from '../../api/types'

type FieldKey = keyof DeliveryCheckoutField

const NP_CITY_EXAMPLE = JSON.stringify({
  modelName: 'Address',
  calledMethod: 'searchSettlements',
  searchParam: 'CityName',
  dataPath: 'data[0].Addresses',
  labelKey: 'Present',
  refKey: 'DeliveryCityRef',
})

const NP_WAREHOUSE_EXAMPLE = JSON.stringify({
  modelName: 'Address',
  calledMethod: 'getWarehouses',
  searchParam: 'FindByString',
  dataPath: 'data',
  labelKey: 'Description',
  refKey: 'Ref',
  dependsOn: 'city',
  dependsOnParam: 'CityRef',
})

const OPTIONS_JSON_TOOLTIP = (
  <div style={{ maxWidth: 360, fontSize: 12 }}>
    <div style={{ marginBottom: 6 }}>Конфіг для селекту (Nova Poshta):</div>
    <div style={{ marginBottom: 4 }}><b>Місто:</b></div>
    <pre style={{ fontSize: 11, margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{NP_CITY_EXAMPLE}</pre>
    <div style={{ marginBottom: 4 }}><b>Відділення:</b></div>
    <pre style={{ fontSize: 11, margin: 0, whiteSpace: 'pre-wrap' }}>{NP_WAREHOUSE_EXAMPLE}</pre>
  </div>
)

function newField(): DeliveryCheckoutField {
  return { key: '', label: '', type: 'input', required: false, isEnabled: true, optionsJson: '' }
}

function parseSettings(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw || '{}') } catch { return {} }
}

export default function DeliveryMethodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [method, setMethod] = useState<DeliveryMethodResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [isEnabled, setIsEnabled] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [extraSettings, setExtraSettings] = useState('{}')
  const [fields, setFields] = useState<DeliveryCheckoutField[]>([])

  useEffect(() => {
    getDeliveryMethod(Number(id))
      .then(m => {
        setMethod(m)
        setIsEnabled(m.isEnabled)
        const obj = parseSettings(m.settings)
        setApiUrl(String(obj.apiUrl ?? ''))
        setApiKey(String(obj.apiKey ?? ''))
        const { apiUrl: _u, apiKey: _k, ...rest } = obj
        setExtraSettings(Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '{}')
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
    let extra: Record<string, unknown> = {}
    try { extra = JSON.parse(extraSettings) } catch { message.error('Некоректний JSON в додаткових налаштуваннях'); return }

    const merged: Record<string, unknown> = {}
    if (apiUrl) merged.apiUrl = apiUrl
    if (apiKey) merged.apiKey = apiKey
    Object.assign(merged, extra)

    setSaving(true)
    try {
      const updated = await updateDeliveryMethod(Number(id), {
        isEnabled,
        settings: JSON.stringify(merged),
        checkoutFields: fields,
      })
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
      title: (
        <span>
          Options JSON{' '}
          <Tooltip title={OPTIONS_JSON_TOOLTIP} overlayStyle={{ maxWidth: 420 }}>
            <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      key: 'optionsJson',
      render: (_: unknown, f: DeliveryCheckoutField, i: number) => (
        <Input
          size="small"
          value={f.optionsJson}
          placeholder={f.type === 'select' ? '{"modelName":"Address","calledMethod":"..."}' : '—'}
          onChange={e => updateField(i, 'optionsJson', e.target.value)}
          disabled={f.type !== 'select'}
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

      {/* API Settings */}
      <Card
        title="Налаштування API"
        style={{ marginBottom: 16 }}
        size="small"
        extra={<span style={{ color: '#8c8c8c', fontSize: 12 }}>Ключі для інтеграції з службою доставки</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>API URL</div>
              <Input
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="https://api.novaposhta.ua/v2.0/json/"
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>API Key</div>
              <Input.Password
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Ключ API"
              />
            </div>
          </div>

          <Collapse
            ghost
            size="small"
            items={[{
              key: 'extra',
              label: <span style={{ fontSize: 12, color: '#8c8c8c' }}>Додаткові налаштування (JSON)</span>,
              children: (
                <Input.TextArea
                  value={extraSettings}
                  onChange={e => setExtraSettings(e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                  placeholder="{}"
                />
              ),
            }]}
          />
        </div>
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
