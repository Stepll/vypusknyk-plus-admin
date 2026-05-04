import { useEffect, useState } from 'react'
import { Button, Popconfirm, Table, Tag, message } from 'antd'
import { DeleteOutlined, EditOutlined, PercentageOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAdminPromotions, deletePromotion } from '../../api/promotions'
import type { AdminPromotionResponse } from '../../api/promotions'

const STATUS_TAGS: Record<string, { color: string; label: string }> = {
  active: { color: 'success', label: 'Активна' },
  upcoming: { color: 'processing', label: 'Запланована' },
  expired: { color: 'default', label: 'Завершена' },
  inactive: { color: 'error', label: 'Вимкнена' },
}

const SCOPE_LABELS: Record<string, string> = {
  Global: 'Всі товари',
  Category: 'Категорії',
  Volume: "Об'ємна",
  Bundle: 'Комплект',
}

export default function PromotionsPage() {
  const [items, setItems] = useState<AdminPromotionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      setItems(await getAdminPromotions())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    try {
      await deletePromotion(id)
      setItems(prev => prev.filter(i => i.id !== id))
      message.success('Акцію видалено')
    } catch {
      message.error('Помилка при видаленні')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Знижка',
      key: 'discount',
      render: (_: unknown, item: AdminPromotionResponse) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {item.discountType === 'Percentage' ? `${item.discountValue}%` : `${item.discountValue} ₴`}
        </Tag>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'scope',
      key: 'scope',
      render: (scope: string) => <span style={{ color: '#595959' }}>{SCOPE_LABELS[scope] ?? scope}</span>,
    },
    {
      title: 'Застосування',
      key: 'targets',
      render: (_: unknown, item: AdminPromotionResponse) => {
        if (item.scope === 'Global') return <span style={{ color: '#bfbfbf' }}>Всі товари</span>
        if (item.scope === 'Bundle') {
          return <span style={{ color: '#595959' }}>{item.bundleItems.map(b => b.subcategoryName).join(', ') || '—'}</span>
        }
        const names = item.targets.map(t => t.subcategoryName ?? t.categoryName).filter(Boolean)
        if (!names.length) return <span style={{ color: '#bfbfbf' }}>—</span>
        return (
          <span style={{ color: '#595959' }}>
            {names.slice(0, 2).join(', ')}{names.length > 2 ? ` +${names.length - 2}` : ''}
          </span>
        )
      },
    },
    {
      title: 'Термін',
      key: 'period',
      render: (_: unknown, item: AdminPromotionResponse) => {
        if (!item.startsAt && !item.endsAt) return <span style={{ color: '#bfbfbf' }}>Безмежно</span>
        const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('uk-UA') : '∞'
        return <span>{fmt(item.startsAt)} — {fmt(item.endsAt)}</span>
      },
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
      render: (_: unknown, item: AdminPromotionResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text" size="small" icon={<EditOutlined />}
            onClick={() => navigate(`/settings/promotions/${item.id}`)}
          />
          <Popconfirm
            title="Видалити акцію?"
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
            background: 'linear-gradient(135deg, #f5222d 0%, #fa541c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PercentageOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Акції</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Автоматичні знижки на замовлення</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/settings/promotions/new')}>
          Нова акція
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={item => ({ onDoubleClick: () => navigate(`/settings/promotions/${item.id}`) })}
      />
    </div>
  )
}
