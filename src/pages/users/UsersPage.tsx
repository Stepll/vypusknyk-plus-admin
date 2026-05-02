import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Tag } from 'antd'
import { CheckCircleFilled, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { usersStore } from '../../stores/UsersStore'
import type { AdminUser } from '../../api/types'

const Check = () => <CheckCircleFilled style={{ color: '#52c41a', fontSize: 13, marginLeft: 5 }} />

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" style={{ marginLeft: 5, flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

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
        {r.email && (r.hasGoogleId ? <GoogleIcon /> : r.isEmailVerified && <Check />)}
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
