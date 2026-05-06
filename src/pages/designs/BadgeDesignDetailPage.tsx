import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Card, Descriptions, Popconfirm, Spin, Tag } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'
import { getBadgeDesign, deleteBadgeDesign } from '../../api/badgeDesigns'
import type { AdminSavedBadgeDesignItem } from '../../api/types'

export default function BadgeDesignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [design, setDesign] = useState<AdminSavedBadgeDesignItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getBadgeDesign(Number(id))
      .then(setDesign)
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!design) return
    setDeleting(true)
    try {
      await deleteBadgeDesign(design.id)
      navigate('/designs')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!design) return <div style={{ padding: 40, color: '#888' }}>Дизайн не знайдено</div>

  const { state } = design

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/designs')} />
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #e91e8c 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <StarOutlined />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{design.designName}</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
            Збережено: {new Date(design.savedAt).toLocaleString('uk-UA', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <Tag color="purple">Значок</Tag>
        <Popconfirm
          title="Видалити дизайн?"
          description="Дію не можна скасувати."
          okText="Так, видалити"
          cancelText="Скасувати"
          okButtonProps={{ danger: true }}
          onConfirm={handleDelete}
        >
          <Button danger icon={<DeleteOutlined />} loading={deleting}>
            Видалити
          </Button>
        </Popconfirm>
      </div>

      {/* Preview circle */}
      <Card style={{ marginBottom: 20, background: '#f8f8fc' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e91e8c 0%, #8b5cf6 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700, textAlign: 'center', padding: 16,
            boxShadow: '0 4px 24px rgba(233,30,140,0.25)',
          }}>
            {state.topText && <div style={{ marginBottom: 4, opacity: 0.9 }}>{state.topText}</div>}
            <div style={{ fontSize: 28, lineHeight: 1 }}>◉</div>
            {state.bottomText && <div style={{ marginTop: 4, opacity: 0.9 }}>{state.bottomText}</div>}
          </div>
        </div>
      </Card>

      {/* User info */}
      <Card style={{ marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
          <div>
            <Link to={`/users/${design.userId}`} style={{ fontWeight: 600, fontSize: 15 }}>
              {design.userFullName}
            </Link>
            {design.userEmail && (
              <div style={{ fontSize: 13 }}>
                <Link to={`/users/${design.userId}`} style={{ color: '#8c8c8c' }}>
                  {design.userEmail}
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Design params */}
      <Card title="Параметри дизайну">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Верхній напис">{state.topText || '—'}</Descriptions.Item>
          <Descriptions.Item label="Нижній напис">{state.bottomText || '—'}</Descriptions.Item>
          <Descriptions.Item label="Розмір (ID)">{state.sizeId}</Descriptions.Item>
          <Descriptions.Item label="Розмір тексту">{state.fontSize} px</Descriptions.Item>
          <Descriptions.Item label="Колір тексту (ID)">{state.textColorId}</Descriptions.Item>
          <Descriptions.Item label="Шрифт">{state.fontSlug}</Descriptions.Item>
          {state.comment && (
            <Descriptions.Item label="Коментар" span={2}>{state.comment}</Descriptions.Item>
          )}
          <Descriptions.Item label="Фото">{state.photoUrl ? 'Є' : 'Немає'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
