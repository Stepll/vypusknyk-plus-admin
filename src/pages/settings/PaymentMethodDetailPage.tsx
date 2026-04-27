import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Switch, message, Spin, Tag } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { getPaymentMethod, updatePaymentMethod } from '../../api/paymentMethods'
import type { PaymentMethodResponse } from '../../api/types'

export default function PaymentMethodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [method, setMethod] = useState<PaymentMethodResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    getPaymentMethod(Number(id))
      .then(m => {
        setMethod(m)
        setIsEnabled(m.isEnabled)
      })
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updatePaymentMethod(Number(id), { isEnabled })
      setMethod(updated)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!method) return <div style={{ color: '#8c8c8c', textAlign: 'center', paddingTop: 80 }}>Не знайдено</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/payment')} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{method.name}</h2>
              <Tag color="purple">{method.slug}</Tag>
            </div>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Налаштування методу оплати</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Зберегти
        </Button>
      </div>

      <Card title="Статус" size="small">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch checked={isEnabled} onChange={setIsEnabled} />
          <span style={{ color: isEnabled ? '#52c41a' : '#8c8c8c' }}>
            {isEnabled ? 'Активний' : 'Вимкнений'}
          </span>
        </div>
        {method.slug === 'online' && !isEnabled && (
          <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
            Онлайн оплата поки не підключена. Увімкніть, коли платіжний провайдер буде налаштований.
          </p>
        )}
      </Card>
    </div>
  )
}
