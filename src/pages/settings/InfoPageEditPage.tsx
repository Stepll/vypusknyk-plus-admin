import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, Typography, Spin, message, Space } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { getInfoPages, updateInfoPage } from '../../api/info-pages'
import type { InfoPageResponse } from '../../api/types'

const { Title, Text } = Typography
const { TextArea } = Input

const SLUG_LABELS: Record<string, string> = {
  privacy: 'Політика конфіденційності',
  terms: 'Умови використання',
  delivery: 'Доставка та оплата',
}

export default function InfoPageEditPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [page, setPage] = useState<InfoPageResponse | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getInfoPages()
      .then(pages => {
        const found = pages.find(p => p.slug === slug)
        if (found) {
          setPage(found)
          setTitle(found.title)
          setContent(found.content)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleSave = async () => {
    if (!slug) return
    setSaving(true)
    try {
      const updated = await updateInfoPage(slug, { title, content })
      setPage(updated)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />

  if (!page) return <Text type="secondary">Сторінку не знайдено</Text>

  const updatedAt = page.updatedAt
    ? new Date(page.updatedAt).toLocaleString('uk-UA')
    : null

  return (
    <div style={{ maxWidth: 860 }}>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/info-pages')}>
          Назад
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {SLUG_LABELS[slug ?? ''] ?? page.title}
        </Title>
      </Space>

      {updatedAt && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
          Останнє оновлення: {updatedAt}
        </Text>
      )}

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>Заголовок</Text>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Заголовок сторінки"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>
          Контент <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>(Markdown)</Text>
        </Text>
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={28}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
          placeholder="# Заголовок&#10;&#10;Текст сторінки..."
        />
      </div>

      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={saving}
        onClick={handleSave}
      >
        Зберегти
      </Button>
    </div>
  )
}
