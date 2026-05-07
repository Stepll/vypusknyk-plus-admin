import { useEffect, useState } from 'react'
import { Card, InputNumber, Switch, Input, Button, Spin, message, Typography } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import {
  getAppSettings, updateAppSettings,
  GROUP_LABELS,
  type AppSettingResponse,
} from '../../api/appSettings'

const { Text } = Typography

const GROUP_ORDER = ['orders', 'store', 'ribbon', 'badge', 'certificate', 'contacts']

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<AppSettingResponse[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAppSettings()
      .then(data => {
        setSettings(data)
        const initial: Record<string, string> = {}
        data.forEach(s => { initial[s.key] = s.value })
        setValues(initial)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const updates = settings.map(s => ({ key: s.key, value: values[s.key] ?? s.value }))
      await updateAppSettings(updates)
      message.success('Налаштування збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  function setValue(key: string, raw: string | number | boolean | null | undefined) {
    const str = raw === null || raw === undefined ? '' : String(raw)
    setValues(prev => ({ ...prev, [key]: str }))
  }

  const grouped = GROUP_ORDER.map(group => ({
    group,
    label: GROUP_LABELS[group] ?? group,
    items: settings.filter(s => s.group === group),
  })).filter(g => g.items.length > 0)

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Налаштування магазину</h1>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Зберегти зміни
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {grouped.map(({ group, label, items }) => (
          <Card key={group} title={label} size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 13 }}>{s.label}</Text>
                    {s.description && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{s.description}</Text>
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {s.type === 'boolean' ? (
                      <Switch
                        checked={values[s.key] === 'true'}
                        onChange={v => setValue(s.key, v)}
                      />
                    ) : s.type === 'number' ? (
                      <InputNumber
                        value={Number(values[s.key])}
                        min={0}
                        onChange={v => setValue(s.key, v)}
                        style={{ width: 120 }}
                      />
                    ) : (
                      <Input
                        value={values[s.key] ?? ''}
                        onChange={e => setValue(s.key, e.target.value)}
                        style={{ width: 280 }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
