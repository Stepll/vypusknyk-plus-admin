import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table } from 'antd'
import { TeamOutlined } from '@ant-design/icons'
import { usersStore } from '../../stores/UsersStore'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: "Ім'я", dataIndex: 'fullName', key: 'fullName' },
  { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v: string | null) => v ?? '—' },
  { title: 'Замовлень', dataIndex: 'ordersCount', key: 'ordersCount', width: 100 },
  {
    title: 'Зареєстрований',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
  },
]

const UsersPage = observer(() => {
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
      />
    </div>
  )
})

export default UsersPage
