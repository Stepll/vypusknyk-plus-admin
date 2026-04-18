import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Button, Popconfirm, Image, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { productsStore } from '../../stores/ProductsStore'
import type { AdminProduct } from '../../api/types'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  {
    title: 'Зображення',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 80,
    render: (url: string | null) =>
      url ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover' }} /> : <span className="text-gray-400">—</span>,
  },
  { title: 'Назва', dataIndex: 'name', key: 'name' },
  { title: 'Категорія', dataIndex: 'category', key: 'category' },
  { title: 'Ціна', dataIndex: 'price', key: 'price', render: (v: number) => `${v} грн` },
  {
    title: 'Статус',
    dataIndex: 'isDeleted',
    key: 'isDeleted',
    render: (v: boolean) => v ? <Tag color="red">Видалено</Tag> : <Tag color="green">Активний</Tag>,
  },
  {
    title: 'Дії',
    key: 'actions',
    render: (_: unknown, r: AdminProduct) => (
      <Popconfirm
        title="Видалити продукт?"
        onConfirm={() => productsStore.deleteProduct(r.id)}
        okText="Так"
        cancelText="Ні"
      >
        <Button danger icon={<DeleteOutlined />} size="small" />
      </Popconfirm>
    ),
  },
]

const ProductsPage = observer(() => {
  useEffect(() => { productsStore.fetchProducts() }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Продукти</h2>
      <Table
        rowKey="id"
        dataSource={productsStore.products}
        columns={columns}
        loading={productsStore.loading}
        pagination={{
          current: productsStore.page,
          pageSize: productsStore.pageSize,
          total: productsStore.total,
          onChange: p => productsStore.setPage(p),
        }}
      />
    </div>
  )
})

export default ProductsPage
