import { useEffect, useState } from 'react'
import { Table, Switch, Button, Tag, message } from 'antd'
import { CreditCardOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getPaymentMethods, updatePaymentMethod } from '../../api/paymentMethods'
import type { PaymentMethodResponse } from '../../api/types'

export default function PaymentMethodsPage() {
  const navigate = useNavigate()
  const [methods, setMethods] = useState<PaymentMethodResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    getPaymentMethods()
      .then(setMethods)
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(m: PaymentMethodResponse, enabled: boolean) {
    setToggling(m.id)
    try {
      const updated = await updatePaymentMethod(m.id, { isEnabled: enabled })
      setMethods(prev => prev.map(x => x.id === m.id ? updated : x))
    } catch {
      message.error('Не вдалось змінити статус')
    } finally {
      setToggling(null)
    }
  }

  const columns = [
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag color="purple">{slug}</Tag>,
    },
    {
      title: 'Активний',
      key: 'isEnabled',
      render: (_: unknown, m: PaymentMethodResponse) => (
        <Switch
          checked={m.isEnabled}
          loading={toggling === m.id}
          onChange={enabled => handleToggle(m, enabled)}
        />
      ),
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (_: unknown, m: PaymentMethodResponse) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => navigate(`/settings/payment/${m.id}`)}
        >
          Редагувати
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <CreditCardOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Методи оплати</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Накладний платіж, Онлайн оплата</p>
        </div>
      </div>

      <Table
        dataSource={methods}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />
    </div>
  )
}
