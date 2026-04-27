import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag, Tooltip,
} from 'antd'
import { FontSizeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { getRibbonFonts, createRibbonFont, updateRibbonFont, deleteRibbonFont } from '../../../api/ribbonFonts'
import type { RibbonFontResponse, SaveRibbonFontRequest } from '../../../api/types'

const EMPTY: SaveRibbonFontRequest = {
  name: '', slug: '', fontFamily: '', importUrl: null, isActive: true, sortOrder: 0,
}

const IMPORT_URL_TOOLTIP = (
  <div style={{ maxWidth: 280 }}>
    <p style={{ margin: '0 0 6px' }}>
      Посилання на CSS-файл шрифту, яке завантажується перед відображенням конструктора.
    </p>
    <p style={{ margin: '0 0 6px' }}>
      <strong>Google Fonts:</strong> відкрий fonts.google.com, обери шрифт → «Get embed code» → скопіюй URL з тегу <code>&lt;link href="..."&gt;</code>.
    </p>
    <p style={{ margin: 0 }}>
      <strong>Приклад:</strong><br />
      <code style={{ fontSize: 11 }}>https://fonts.googleapis.com/css2?family=Montserrat&display=swap</code>
    </p>
    <p style={{ margin: '6px 0 0' }}>
      Якщо шрифт системний (Arial, Georgia тощо) — залиш поле порожнім.
    </p>
  </div>
)

export default function FontsPage() {
  const [fonts, setFonts] = useState<RibbonFontResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonFontResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveRibbonFontRequest>()

  const load = () => {
    setLoading(true)
    getRibbonFonts()
      .then(setFonts)
      .catch(() => message.error('Не вдалося завантажити шрифти'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (f: RibbonFontResponse) => {
    setEditing(f)
    form.setFieldsValue({ ...f, importUrl: f.importUrl ?? null })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    const req: SaveRibbonFontRequest = {
      ...vals,
      importUrl: vals.importUrl?.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonFont(editing.id, req)
        setFonts(fs => fs.map(f => f.id === updated.id ? updated : f))
      } else {
        const created = await createRibbonFont(req)
        setFonts(fs => [...fs, created])
      }
      setDrawerOpen(false)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRibbonFont(id)
      setFonts(fs => fs.filter(f => f.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (f: RibbonFontResponse, val: boolean) => {
    try {
      const updated = await updateRibbonFont(f.id, { ...f, importUrl: f.importUrl, isActive: val })
      setFonts(fs => fs.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, f: RibbonFontResponse) => (
        <Space>
          <span style={{ fontFamily: f.fontFamily, fontSize: 15 }}>{f.name}</span>
          <Tag color="purple" style={{ fontSize: 11 }}>{f.slug}</Tag>
        </Space>
      ),
    },
    {
      title: 'font-family',
      dataIndex: 'fontFamily',
      key: 'fontFamily',
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'Import URL',
      dataIndex: 'importUrl',
      key: 'importUrl',
      render: (v: string | null) => v
        ? <Tag color="blue" style={{ fontSize: 11 }}>Google Fonts</Tag>
        : <span style={{ color: '#d9d9d9' }}>Системний</span>,
    },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, f: RibbonFontResponse) => (
        <Switch checked={f.isActive} onChange={val => handleToggle(f, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, f: RibbonFontResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(f)} />
          <Popconfirm
            title="Видалити шрифт?"
            onConfirm={() => handleDelete(f.id)}
            okText="Так" cancelText="Ні"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <FontSizeOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Шрифти</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Шрифти тексту у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={fonts}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати шрифт' : 'Новий шрифт'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="Монтсеррат" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="montserrat" />
          </Form.Item>

          <Form.Item name="fontFamily" label="CSS font-family" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder='"Montserrat", sans-serif' />
          </Form.Item>

          <Form.Item
            name="importUrl"
            label={
              <Space size={6}>
                <span>Import URL</span>
                <Tooltip title={IMPORT_URL_TOOLTIP} placement="right" overlayStyle={{ maxWidth: 320 }}>
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
          >
            <Input placeholder="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" />
          </Form.Item>

          <Form.Item name="sortOrder" label="Порядок сортування">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="Активний" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
