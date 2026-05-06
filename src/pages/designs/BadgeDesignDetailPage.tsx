import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Card, Descriptions, Popconfirm, Spin, Tag, message } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'
import { getBadgeDesign, deleteBadgeDesign } from '../../api/badgeDesigns'
import { getBadgeTextColors } from '../../api/badgeTextColors'
import { getBadgeFonts } from '../../api/badgeFonts'
import { getBadgeImages } from '../../api/badgeImages'
import type { AdminSavedBadgeDesignItem, BadgeTextColorResponse, BadgeFontResponse, BadgeImageResponse } from '../../api/types'
import BadgeStaticPreview, { type BadgeStaticPreviewRef } from '../../components/BadgeStaticPreview'

export default function BadgeDesignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [design, setDesign]         = useState<AdminSavedBadgeDesignItem | null>(null)
  const [textColors, setTextColors] = useState<BadgeTextColorResponse[]>([])
  const [fonts, setFonts]           = useState<BadgeFontResponse[]>([])
  const [images, setImages]         = useState<BadgeImageResponse[]>([])
  const [loading, setLoading]       = useState(true)
  const [deleting, setDeleting]     = useState(false)

  const previewRef = useRef<BadgeStaticPreviewRef>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getBadgeDesign(Number(id)),
      getBadgeTextColors(),
      getBadgeFonts(),
      getBadgeImages(),
    ])
      .then(([d, tc, f, imgs]) => {
        setDesign(d)
        setTextColors(tc)
        setFonts(f)
        setImages(imgs)
      })
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

  async function handleDownloadPhoto() {
    const url = design?.state.photoUrl
    if (!url) return
    try {
      if (url.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = url
        a.download = `${design!.designName}-photo.png`
        a.click()
      } else {
        const response = await fetch(url)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = `${design!.designName}-photo.png`
        a.click()
        URL.revokeObjectURL(objectUrl)
      }
    } catch {
      message.error('Не вдалося завантажити фото')
    }
  }

  function handleDownloadBadge() {
    const dataUrl = previewRef.current?.toDataUrl()
    if (!dataUrl) { message.error('Не вдалося отримати зображення'); return }
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${design!.designName}.png`
    a.click()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!design) return <div style={{ padding: 40, color: '#888' }}>Дизайн не знайдено</div>

  const { state } = design

  const colorHex    = textColors.find(c => c.id === state.textColorId)?.hex ?? '#1a1a2e'
  const colorName   = textColors.find(c => c.id === state.textColorId)?.name ?? `ID ${state.textColorId}`
  const fontFamily  = fonts.find(f => f.slug === state.fontSlug)?.fontFamily ?? 'Arial, sans-serif'
  const fontName    = fonts.find(f => f.slug === state.fontSlug)?.name ?? state.fontSlug
  const templateImg = state.photoUrl ? images.find(img => img.imageUrl === state.photoUrl) : null
  const isUpload    = state.photoUrl?.startsWith('data:') ?? false
  const photoLabel  = templateImg ? templateImg.name : isUpload ? 'Завантажене фото' : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
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

      {/* Preview + photo info side by side */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Badge preview */}
        <Card style={{ background: '#f8f8fc', flexShrink: 0 }} styles={{ body: { padding: 32 } }}>
          <BadgeStaticPreview
            ref={previewRef}
            photoUrl={state.photoUrl}
            photoTransform={state.photoTransform}
            topText={state.topText}
            bottomText={state.bottomText}
            textColor={colorHex}
            fontSize={state.fontSize}
            fontFamily={fontFamily}
          />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadBadge}
              style={{ background: '#e91e8c', borderColor: '#e91e8c', borderRadius: 999 }}
            >
              Завантажити значок
            </Button>
          </div>
        </Card>

        {/* Photo info */}
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Фото" styles={{ body: { padding: '16px 20px' } }}>
            {state.photoUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#8c8c8c', fontSize: 13 }}>Шаблон:</span>
                  <span style={{ fontWeight: 500 }}>{photoLabel ?? '—'}</span>
                  {templateImg && (
                    <img
                      src={templateImg.imageUrl ?? undefined}
                      alt={templateImg.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                    />
                  )}
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPhoto}
                >
                  Завантажити фото
                </Button>
              </div>
            ) : (
              <span style={{ color: '#bfbfbf', fontSize: 14 }}>Фото не додано</span>
            )}
          </Card>

          {/* User info */}
          <Card title="Користувач" styles={{ body: { padding: '16px 20px' } }}>
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
        </div>
      </div>

      {/* Design params */}
      <Card title="Параметри дизайну">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Верхній напис">{state.topText || '—'}</Descriptions.Item>
          <Descriptions.Item label="Нижній напис">{state.bottomText || '—'}</Descriptions.Item>
          <Descriptions.Item label="Колір тексту">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: colorHex, border: '1px solid #d9d9d9',
                display: 'inline-block', flexShrink: 0,
              }} />
              {colorName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Шрифт">{fontName}</Descriptions.Item>
          <Descriptions.Item label="Розмір тексту">{state.fontSize} px</Descriptions.Item>
          <Descriptions.Item label="Розмір значка (ID)">{state.sizeId}</Descriptions.Item>
          {state.comment && (
            <Descriptions.Item label="Коментар" span={2}>{state.comment}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )
}
