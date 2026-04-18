import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table } from 'antd'
import { usersStore } from '../../stores/UsersStore'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Ім\'я', dataIndex: 'fullName', key: 'fullName' },
  { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v: string | null) => v ?? '—' },
  { title: 'Замовлень', dataIndex: 'ordersCount', key: 'ordersCount' },
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
      <h2 className="text-xl font-semibold mb-4">Користувачі</h2>
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
