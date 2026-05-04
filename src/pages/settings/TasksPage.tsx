import { useEffect, useState } from 'react'
import { Button, Popconfirm, Table, Tag, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAdminTasks, deleteTask, TASK_TYPE_LABELS } from '../../api/tasks'
import type { AdminTaskResponse } from '../../api/tasks'

export default function TasksPage() {
  const [items, setItems] = useState<AdminTaskResponse[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      setItems(await getAdminTasks())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id)
      setItems(prev => prev.filter(i => i.id !== id))
      message.success('Завдання видалено')
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
      title: 'Тип',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: string) => (
        <Tag color="blue">{TASK_TYPE_LABELS[type] ?? type}</Tag>
      ),
    },
    {
      title: 'Нагорода',
      key: 'reward',
      render: (_: unknown, item: AdminTaskResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: item.rewardPromoCodeCardColor, flexShrink: 0,
          }} />
          <span style={{ color: '#595959' }}>{item.rewardPromoCodeDisplayName}</span>
          <Tag color="volcano" style={{ fontWeight: 600, marginLeft: 2 }}>
            {item.rewardDiscountType === 'Percentage'
              ? `${item.rewardDiscountValue}%`
              : `${item.rewardDiscountValue} ₴`}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Виконань',
      dataIndex: 'completionsCount',
      key: 'completionsCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'endsAt',
      key: 'endsAt',
      render: (endsAt?: string) => endsAt
        ? <span style={{ color: '#595959' }}>{new Date(endsAt).toLocaleDateString('uk-UA')}</span>
        : <span style={{ color: '#bfbfbf' }}>—</span>,
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: unknown, item: AdminTaskResponse) => {
        if (!item.isActive) return <Tag color="error">Вимкнено</Tag>
        if (item.endsAt && new Date(item.endsAt) < new Date()) return <Tag color="default">Завершено</Tag>
        return <Tag color="success">Активне</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, item: AdminTaskResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text" size="small" icon={<EditOutlined />}
            onClick={() => navigate(`/settings/tasks/${item.id}`)}
          />
          <Popconfirm
            title="Видалити завдання?"
            description="Прогрес юзерів та видані картки залишаться"
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
            background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <TrophyOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Завдання</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Місії що автоматично видають промокоди</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/settings/tasks/new')}>
          Нове завдання
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={item => ({ onDoubleClick: () => navigate(`/settings/tasks/${item.id}`) })}
      />
    </div>
  )
}
