import { useEffect, useState } from 'react'
import { Button, Popconfirm, Table, Tag, message } from 'antd'
import { DeleteOutlined, EditOutlined, GiftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAdminPromoCodes, deletePromoCode } from '../../api/promotions'
import type { AdminPromoCodeResponse } from '../../api/promotions'

const STATUS_TAGS: Record<string, { color: string; label: string }> = {
  active: { color: 'success', label: 'Активний' },
  upcoming: { color: 'processing', label: 'Запланований' },
  expired: { color: 'default', label: 'Завершений' },
  inactive: { color: 'error', label: 'Вимкнений' },
}

export default function PromoCodesPage() {
  const [items, setItems] = useState<AdminPromoCodeResponse[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      setItems(await getAdminPromoCodes())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    try {
      await deletePromoCode(id)
      setItems(prev => prev.filter(i => i.id !== id))
      message.success('Промокод видалено')
    } catch {
      message.error('Помилка при видаленні')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Картка',
      key: 'card',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.cardColor, flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{item.displayName}</span>
        </div>
      ),
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',
      render: (code: string | null) => code
        ? <Tag style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}>{code}</Tag>
        : <span style={{ color: '#bfbfbf' }}>тільки за завдання</span>,
    },
    {
      title: 'Знижка',
      key: 'discount',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {item.discountType === 'Percentage' ? `${item.discountValue}%` : `${item.discountValue} ₴`}
        </Tag>
      ),
    },
    {
      title: 'Використань',
      key: 'usages',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <span style={{ color: '#595959' }}>
          {item.usagesCount}{item.maxUsages ? `/${item.maxUsages}` : ''}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const t = STATUS_TAGS[s] ?? { color: 'default', label: s }
        return <Tag color={t.color}>{t.label}</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text" size="small" icon={<EditOutlined />}
            onClick={() => navigate(`/settings/promo-codes/${item.id}`)}
          />
          <Popconfirm
            title="Видалити промокод?"
            description="Активовані картки у юзерів залишаться"
            okText="Так"
            cancelText="Ні"
            onConfirm={() => handleDelete(item.id)}
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF6B9D 0%, #D6336C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <GiftOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Промокоди</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Картки знижок для користувачів</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/settings/promo-codes/new')}>
          Новий промокод
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={item => ({ onDoubleClick: () => navigate(`/settings/promo-codes/${item.id}`) })}
      />
    </div>
  )
}
