import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Card, Descriptions, Popconfirm, Spin, Tag, message } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined, FileImageOutlined } from '@ant-design/icons'
import { getCertificateDesign, deleteCertificateDesign } from '../../api/certificateDesigns'
import { getCertificateTemplateById } from '../../api/certificateTemplates'
import { getCertificateFonts } from '../../api/certificateFonts'
import type {
  AdminCertificateDesignItem,
  CertificateTemplateResponse,
  CertificateFontResponse,
  CertificateOrientationLayout,
  CertificateLayoutConfig,
} from '../../api/types'
import CertificatePreview from '../../components/CertificatePreview'

const ORIENTATION_LABELS: Record<string, string> = {
  landscape: 'Альбомна',
  portrait:  'Книжкова',
}

function parseLayout(json: string | null, orientation: 'landscape' | 'portrait'): CertificateOrientationLayout | null {
  if (!json) return null
  try {
    const cfg = JSON.parse(json) as CertificateLayoutConfig
    return cfg[orientation] ?? null
  } catch { return null }
}

export default function CertificateDesignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [design,   setDesign]   = useState<AdminCertificateDesignItem | null>(null)
  const [template, setTemplate] = useState<CertificateTemplateResponse | null>(null)
  const [font,     setFont]     = useState<CertificateFontResponse | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getCertificateDesign(Number(id))
      .then(d => {
        setDesign(d)
        return Promise.all([
          getCertificateTemplateById(d.state.templateId),
          getCertificateFonts(),
        ]).then(([tmpl, fonts]) => {
          setTemplate(tmpl)
          setFont(fonts.find(f => f.id === d.state.fontId) ?? null)
        })
      })
      .catch(() => message.error('Не вдалося завантажити дизайн'))
      .finally(() => setLoading(false))
  }, [id])

  const layout = useMemo(() =>
    design && template ? parseLayout(template.layoutJson, design.state.orientation) : null,
    [design, template],
  )

  const fontFamily = font?.fontFamily ?? 'Georgia, serif'

  async function handleDelete() {
    if (!design) return
    setDeleting(true)
    try {
      await deleteCertificateDesign(design.id)
      navigate('/designs')
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownloadBackground() {
    const url = template?.imageUrl
    if (!url) { message.warning('Зображення шаблону відсутнє'); return }
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${template!.name}_background.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      message.error('Не вдалося завантажити фон')
    }
  }

  function handleDownloadDesign() {
    const canvas = canvasRef.current
    if (!canvas) { message.error('Не вдалося отримати зображення'); return }
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${design?.designName ?? 'certificate'}.png`
    a.click()
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  if (!design) {
    return <div style={{ padding: 40, color: '#888' }}>Дизайн не знайдено</div>
  }

  const s = design.state

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/designs')}>
          Назад
        </Button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{design.designName}</h2>
          <div style={{ color: '#8c8c8c', fontSize: 13 }}>
            <Link to={`/users/${design.userId}`}>{design.userFullName}</Link>
            {design.userEmail && <span> · {design.userEmail}</span>}
          </div>
        </div>
        <Popconfirm
          title="Видалити цей дизайн?"
          okText="Так" cancelText="Ні" okType="danger"
          onConfirm={handleDelete}
        >
          <Button danger icon={<DeleteOutlined />} loading={deleting}>
            Видалити
          </Button>
        </Popconfirm>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: preview + downloads */}
        <div style={{ flex: '0 0 auto', maxWidth: 640 }}>
          <Card
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: 16 }}
          >
            <CertificatePreview
              ref={canvasRef}
              templateUrl={template?.imageUrl ?? null}
              nativeOrientation={template?.nativeOrientation ?? 'portrait'}
              orientation={s.orientation}
              layout={layout}
              title={s.title}
              bodyText={s.bodyText}
              organization={s.organization}
              year={s.year}
              signerName={s.signerName}
              signerTitle={s.signerTitle}
              signer2Name={s.signer2Name || undefined}
              signer2Title={s.signer2Title || undefined}
              additionalText={s.additionalText || undefined}
              fontFamily={fontFamily}
              previewName="Ім'я отримувача"
            />
          </Card>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<FileImageOutlined />}
              onClick={handleDownloadBackground}
              disabled={!template?.imageUrl}
              style={{ flex: 1 }}
            >
              Завантажити фон
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadDesign}
              style={{ flex: 1, background: '#c9a84c', borderColor: '#c9a84c' }}
            >
              Завантажити дизайн
            </Button>
          </div>
          {!template?.imageUrl && (
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6, textAlign: 'center' }}>
              Фон шаблону не завантажено
            </div>
          )}
        </div>

        {/* Right: info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card title="Параметри грамоти" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Назва дизайну">{design.designName}</Descriptions.Item>
              <Descriptions.Item label="Збережено">
                {new Date(design.savedAt).toLocaleString('uk-UA', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Користувач">
                <Link to={`/users/${design.userId}`}>{design.userFullName}</Link>
                {design.userEmail && <span style={{ color: '#8c8c8c', marginLeft: 6 }}>{design.userEmail}</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Орієнтація">
                <Tag color={s.orientation === 'landscape' ? 'blue' : 'purple'}>
                  {ORIENTATION_LABELS[s.orientation]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Шаблон">
                {template?.name ?? `ID: ${s.templateId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Шрифт">
                {font?.name ?? `ID: ${s.fontId}`}
                {font && <span style={{ color: '#8c8c8c', marginLeft: 6, fontFamily: font.fontFamily }}>({font.fontFamily})</span>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Текст грамоти" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Заголовок">
                <Tag color="gold">{s.title}</Tag>
              </Descriptions.Item>
              {s.bodyText && (
                <Descriptions.Item label="Текст нагороди">
                  <span style={{ whiteSpace: 'pre-wrap' }}>{s.bodyText}</span>
                </Descriptions.Item>
              )}
              {s.organization && (
                <Descriptions.Item label="Організація">{s.organization}</Descriptions.Item>
              )}
              {s.year && (
                <Descriptions.Item label="Рік">{s.year}</Descriptions.Item>
              )}
              {s.additionalText && (
                <Descriptions.Item label="Додатковий текст">{s.additionalText}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {(s.signerName || s.signerTitle || s.signer2Name || s.signer2Title) && (
            <Card title="Підписанти">
              <Descriptions column={1} size="small" bordered>
                {s.signerName && (
                  <Descriptions.Item label="Підписант 1 (ім'я)">{s.signerName}</Descriptions.Item>
                )}
                {s.signerTitle && (
                  <Descriptions.Item label="Підписант 1 (посада)">{s.signerTitle}</Descriptions.Item>
                )}
                {s.signer2Name && (
                  <Descriptions.Item label="Підписант 2 (ім'я)">{s.signer2Name}</Descriptions.Item>
                )}
                {s.signer2Title && (
                  <Descriptions.Item label="Підписант 2 (посада)">{s.signer2Title}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {s.comment && (
            <Card title="Коментар" style={{ marginTop: 16 }}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{s.comment}</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
