import { useEffect, useState } from 'react'
import { Table, Switch, Button, Tag, message } from 'antd'
import { CarOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getDeliveryMethods, updateDeliveryMethod } from '../../api/deliveryMethods'
import type { DeliveryMethodResponse } from '../../api/types'

export default function DeliveryMethodsPage() {
  const navigate = useNavigate()
  const [methods, setMethods] = useState<DeliveryMethodResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    getDeliveryMethods()
      .then(setMethods)
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(m: DeliveryMethodResponse, enabled: boolean) {
    setToggling(m.id)
    try {
      const updated = await updateDeliveryMethod(m.id, {
        isEnabled: enabled,
        settings: m.settings,
        checkoutFields: m.checkoutFields,
      })
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
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Полів оформлення',
      key: 'fields',
      render: (_: unknown, m: DeliveryMethodResponse) => (
        <span style={{ color: '#8c8c8c' }}>{m.checkoutFields.length} шт.</span>
      ),
    },
    {
      title: 'Активний',
      key: 'isEnabled',
      render: (_: unknown, m: DeliveryMethodResponse) => (
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
      render: (_: unknown, m: DeliveryMethodResponse) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => navigate(`/settings/delivery/${m.id}`)}
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
          background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <CarOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Методи доставки</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Нова Пошта, Укрпошта</p>
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
