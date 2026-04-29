import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Tag } from 'antd'
import { CheckCircleFilled, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { usersStore } from '../../stores/UsersStore'
import type { AdminUser } from '../../api/types'

const Check = () => <CheckCircleFilled style={{ color: '#52c41a', fontSize: 13, marginLeft: 5 }} />

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  {
    title: 'Тип',
    dataIndex: 'isGuest',
    key: 'isGuest',
    width: 110,
    render: (isGuest: boolean) => isGuest
      ? <Tag color="orange">Гість</Tag>
      : <Tag color="green">Зареєстрований</Tag>,
  },
  {
    title: 'Email',
    key: 'email',
    render: (_: unknown, r: AdminUser) => (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {r.email ?? '—'}
        {r.email && r.isEmailVerified && <Check />}
      </span>
    ),
  },
  {
    title: "Ім'я",
    key: 'fullName',
    render: (_: unknown, r: AdminUser) => (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {r.fullName}
        {r.isNameVerified && <Check />}
      </span>
    ),
  },
  {
    title: 'Телефон',
    key: 'phone',
    render: (_: unknown, r: AdminUser) => (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {r.phone ?? '—'}
        {r.phone && r.isPhoneVerified && <Check />}
      </span>
    ),
  },
  { title: 'Замовлень', dataIndex: 'ordersCount', key: 'ordersCount', width: 100 },
  {
    title: 'Дата',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
  },
] satisfies import('antd').TableColumnsType<AdminUser>

const UsersPage = observer(() => {
  const navigate = useNavigate()
  useEffect(() => { usersStore.fetchUsers() }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <TeamOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Користувачі</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Зареєстровані користувачі платформи</p>
        </div>
      </div>
      <Table
        rowKey="id"
        dataSource={usersStore.users}
        columns={columns}
        loading={usersStore.loading}
        pagination={{
          current: usersStore.page,
          pageSize: usersStore.pageSize,
          total: usersStore.total,
          onChange: p => usersStore.setPage(p),
        }}
        onRow={record => ({ onClick: () => navigate(`/users/${record.id}`), style: { cursor: 'pointer' } })}
      />
    </div>
  )
})

export default UsersPage
