import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Button, Popconfirm, Image, Tag, Space, message, Tooltip } from 'antd'
import {
  DeleteOutlined, AppstoreOutlined, EditOutlined, PlusOutlined,
  DownloadOutlined, UploadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { productsStore } from '../../stores/ProductsStore'
import { getAllProducts, createProduct, updateProduct } from '../../api/products'
import { getProductCategories } from '../../api/productCategories'
import type { AdminProduct, ProductCategoryResponse } from '../../api/types'

const HEADERS = ['ID', 'Назва', 'Опис', 'Ціна', 'Категорія ID', 'Категорія', 'Підкатегорія ID', 'Підкатегорія', 'Статус']

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

function productToRow(p: AdminProduct) {
  return {
    'ID': p.id,
    'Назва': p.name,
    'Опис': p.description,
    'Ціна': p.price,
    'Категорія ID': p.categoryId,
    'Категорія': p.categoryName,
    'Підкатегорія ID': p.subcategoryId ?? '',
    'Підкатегорія': p.subcategoryName ?? '',
    'Статус': p.isDeleted ? 'Видалено' : 'Активний',
  }
}

const ProductsPage = observer(() => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => { productsStore.fetchProducts() }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const all = await getAllProducts()
      const ws = XLSX.utils.json_to_sheet(all.map(productToRow), { header: HEADERS })
      ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 12 }]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Продукти')
      XLSX.writeFile(wb, 'products.xlsx')
    } catch {
      message.error('Помилка при експорті')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS])
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Продукти')
    XLSX.writeFile(wb, 'products_template.xlsx')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)

    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      const cats: ProductCategoryResponse[] = await getProductCategories()

      let created = 0, updated = 0, errors = 0

      for (const row of rows) {
        try {
          const id = row['ID'] ? Number(row['ID']) : null
          const name = String(row['Назва'] ?? '').trim()
          const description = String(row['Опис'] ?? '').trim()
          const price = Number(row['Ціна'])

          if (!name || isNaN(price)) { errors++; continue }

          let categoryId = row['Категорія ID'] ? Number(row['Категорія ID']) : 0
          let categoryName = String(row['Категорія'] ?? '').trim()
          let subcategoryId: number | null = row['Підкатегорія ID'] ? Number(row['Підкатегорія ID']) : null
          let subcategoryName: string | null = String(row['Підкатегорія'] ?? '').trim() || null

          if (!categoryId && categoryName) {
            const cat = cats.find(c => c.name === categoryName)
            if (cat) { categoryId = cat.id }
          } else if (categoryId && !categoryName) {
            categoryName = cats.find(c => c.id === categoryId)?.name ?? ''
          }

          if (!categoryId) { errors++; continue }

          const parentCat = cats.find(c => c.id === categoryId)
          if (parentCat) {
            if (!subcategoryId && subcategoryName) {
              const sub = parentCat.subcategories.find(s => s.name === subcategoryName)
              if (sub) subcategoryId = sub.id
            } else if (subcategoryId && !subcategoryName) {
              subcategoryName = parentCat.subcategories.find(s => s.id === subcategoryId)?.name ?? null
            }
          }

          const payload = { name, description, price, categoryId, categoryName, subcategoryId: subcategoryId ?? null, subcategoryName: subcategoryName ?? null }

          if (id) {
            await updateProduct(id, payload)
            updated++
          } else {
            await createProduct(payload)
            created++
          }
        } catch {
          errors++
        }
      }

      message.success(`Імпорт завершено: ${created} створено, ${updated} оновлено${errors ? `, ${errors} помилок` : ''}`)
      productsStore.fetchProducts()
    } catch {
      message.error('Помилка при читанні файлу')
    } finally {
      setImporting(false)
    }
  }

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
        <Space>
          <Tooltip title="Завантажити шаблон Excel">
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              Шаблон
            </Button>
          </Tooltip>
          <Button
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            Експорт
          </Button>
          <Button
            icon={<UploadOutlined />}
            loading={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            Імпорт
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/new')}
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', border: 'none' }}
          >
            Новий продукт
          </Button>
        </Space>
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
