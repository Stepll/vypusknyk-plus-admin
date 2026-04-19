import { useEffect, useState } from 'react'
import { Table } from 'antd'
import { CrownOutlined } from '@ant-design/icons'
import { getAdmins } from '../../api/admins'
import type { AdminAdminItem } from '../../api/types'

export default function AdminsPage() {
  const [items, setItems] = useState<AdminAdminItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 20

  useEffect(() => {
    setLoading(true)
    getAdmins(page, pageSize)
      .then(res => { setItems(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [page])

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: "Ім'я", dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Доданий',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <CrownOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Адміни</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Список адміністраторів платформи</p>
        </div>
      </div>
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={{ current: page, pageSize, total, onChange: setPage }}
      />
    </div>
  )
}
