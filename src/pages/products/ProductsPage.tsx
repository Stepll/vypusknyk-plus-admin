import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Button, Popconfirm, Image, Tag, Space } from 'antd'
import { DeleteOutlined, AppstoreOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { productsStore } from '../../stores/ProductsStore'
import type { AdminProduct } from '../../api/types'

const buildColumns = (navigate: ReturnType<typeof useNavigate>) => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  {
    title: 'Зображення',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 80,
    render: (url: string | null) =>
      url
        ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 8 }} />
        : <span style={{ color: '#bfbfbf' }}>—</span>,
  },
  { title: 'Назва', dataIndex: 'name', key: 'name' },
  {
    title: 'Категорія',
    key: 'category',
    render: (_: unknown, r: AdminProduct) => (
      <span>{r.categoryName}{r.subcategoryName ? ` / ${r.subcategoryName}` : ''}</span>
    ),
  },
  { title: 'Ціна', dataIndex: 'price', key: 'price', render: (v: number) => <strong>{v} грн</strong> },
  {
    title: 'Статус',
    dataIndex: 'isDeleted',
    key: 'isDeleted',
    render: (v: boolean) => v
      ? <Tag color="red">Видалено</Tag>
      : <Tag color="green">Активний</Tag>,
  },
  {
    title: 'Дії',
    key: 'actions',
    width: 110,
    render: (_: unknown, r: AdminProduct) => (
      <Space>
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => navigate(`/products/${r.id}`)}
        />
        <Popconfirm
          title="Видалити продукт?"
          onConfirm={() => productsStore.deleteProduct(r.id)}
          okText="Так"
          cancelText="Ні"
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      </Space>
    ),
  },
]

const ProductsPage = observer(() => {
  const navigate = useNavigate()
  useEffect(() => { productsStore.fetchProducts() }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <AppstoreOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Продукти</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Каталог товарів платформи</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products/new')}
          style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', border: 'none' }}
        >
          Новий продукт
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={productsStore.products}
        columns={buildColumns(navigate)}
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
