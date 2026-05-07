import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Switch, Radio, InputNumber, message, Spin, Divider, Tooltip } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { getCertificateTemplateById, saveCertificateTemplateLayout } from '../../../../api/certificateTemplates'
import type {
  CertificateTemplateResponse, CertificateZoneKey,
  CertificateOrientationLayout, CertificateLayoutConfig,
} from '../../../../api/types'
import CertificateZoneEditor, { ZONE_LABELS } from './CertificateZoneEditor'
import { CANVAS_LANDSCAPE, CANVAS_PORTRAIT } from '../../../../constants/certificateLayout'

const DEFAULT_LANDSCAPE: CertificateOrientationLayout = {
  title:          { x: 60,  y: 82,  width: 520, height: 40  },
  name:           { x: 60,  y: 140, width: 520, height: 30  },
  bodyText:       { x: 60,  y: 195, width: 520, height: 120 },
  organization:   { x: 60,  y: 325, width: 520, height: 25  },
  year:           { x: 60,  y: 353, width: 520, height: 25  },
  signerName:     { x: 460, y: 386, width: 120, height: 25  },
  signerTitle:    { x: 460, y: 408, width: 120, height: 22  },
  signer2Name:    { x: 60,  y: 386, width: 120, height: 25  },
  signer2Title:   { x: 60,  y: 408, width: 120, height: 22  },
  additionalText: { x: 60,  y: 305, width: 520, height: 25  },
}

const DEFAULT_PORTRAIT: CertificateOrientationLayout = {
  title:          { x: 50,  y: 120, width: 353, height: 40  },
  name:           { x: 50,  y: 193, width: 353, height: 30  },
  bodyText:       { x: 50,  y: 258, width: 353, height: 180 },
  organization:   { x: 50,  y: 460, width: 353, height: 25  },
  year:           { x: 50,  y: 493, width: 353, height: 25  },
  signerName:     { x: 303, y: 546, width: 100, height: 25  },
  signerTitle:    { x: 303, y: 571, width: 100, height: 22  },
  signer2Name:    { x: 50,  y: 546, width: 100, height: 25  },
  signer2Title:   { x: 50,  y: 571, width: 100, height: 22  },
  additionalText: { x: 50,  y: 440, width: 353, height: 25  },
}

function buildDefaultLayout(): CertificateLayoutConfig {
  return { landscape: { ...DEFAULT_LANDSCAPE }, portrait: { ...DEFAULT_PORTRAIT } }
}

function parseLayout(json: string | null): CertificateLayoutConfig {
  if (!json) return buildDefaultLayout()
  try {
    const parsed = JSON.parse(json) as CertificateLayoutConfig
    return {
      landscape: { ...DEFAULT_LANDSCAPE, ...parsed.landscape },
      portrait:  { ...DEFAULT_PORTRAIT,  ...parsed.portrait  },
    }
  } catch {
    return buildDefaultLayout()
  }
}

export default function CertificateTemplateEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [template, setTemplate]               = useState<CertificateTemplateResponse | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)
  const [viewOrientation, setViewOrientation] = useState<'portrait' | 'landscape'>('landscape')
  const [selectedZone, setSelectedZone]       = useState<CertificateZoneKey | null>('title')

  const [nativeOrientation, setNativeOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [hasSecondSigner, setHasSecondSigner]     = useState(false)
  const [hasAdditionalText, setHasAdditionalText] = useState(false)
  const [layout, setLayout]                       = useState<CertificateLayoutConfig>(buildDefaultLayout())

  useEffect(() => {
    if (!id) return
    getCertificateTemplateById(Number(id))
      .then(t => {
        setTemplate(t)
        setNativeOrientation(t.nativeOrientation)
        setHasSecondSigner(t.hasSecondSigner)
        setHasAdditionalText(t.hasAdditionalText)
        setLayout(parseLayout(t.layoutJson))
        setViewOrientation(t.nativeOrientation)
      })
      .catch(() => message.error('Не вдалося завантажити шаблон'))
      .finally(() => setLoading(false))
  }, [id])

  const activeZones: CertificateZoneKey[] = [
    'title', 'name', 'bodyText', 'organization', 'year', 'signerName', 'signerTitle',
    ...(hasSecondSigner ? ['signer2Name', 'signer2Title'] as CertificateZoneKey[] : []),
    ...(hasAdditionalText ? ['additionalText'] as CertificateZoneKey[] : []),
  ]

  const currentLayout = layout[viewOrientation]
  const { w: canvasW, h: canvasH } = viewOrientation === 'landscape' ? CANVAS_LANDSCAPE : CANVAS_PORTRAIT
  const BOARD_W = 640
  const BOARD_H = 500
  const scale = Math.min(BOARD_W / canvasW, BOARD_H / canvasH)

  const handleLayoutChange = (updated: CertificateOrientationLayout) => {
    setLayout(prev => ({ ...prev, [viewOrientation]: updated }))
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await saveCertificateTemplateLayout(Number(id), {
        nativeOrientation,
        hasSecondSigner,
        hasAdditionalText,
        layoutJson: JSON.stringify(layout),
      })
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  if (!template) {
    return <div style={{ padding: 40, color: '#888' }}>Шаблон не знайдено</div>
  }

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/constructor/certificates/templates')}>
          Назад
        </Button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{template.name}</h2>
          <div style={{ color: '#8c8c8c', fontSize: 13 }}>Налаштування зон</div>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{ background: '#c9a84c', borderColor: '#c9a84c' }}
        >
          Зберегти
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* ── Left: board ── */}
        <div style={{ flex: '0 0 auto' }}>
          {/* Orientation switcher */}
          <div style={{ marginBottom: 12 }}>
            <Radio.Group
              value={viewOrientation}
              onChange={e => setViewOrientation(e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="landscape">Альбомна</Radio.Button>
              <Radio.Button value="portrait">Книжкова</Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ width: BOARD_W, height: BOARD_H, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            {template.imageUrl ? (
              <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                <CertificateZoneEditor
                  imageUrl={template.imageUrl}
                  nativeOrientation={nativeOrientation}
                  viewOrientation={viewOrientation}
                  canvasW={canvasW}
                  canvasH={canvasH}
                  scale={scale}
                  layout={currentLayout}
                  activeZones={activeZones}
                  selectedZone={selectedZone}
                  onZoneSelect={setSelectedZone}
                  onChange={handleLayoutChange}
                />
              </div>
            ) : (
              <div style={{
                width: BOARD_W, height: BOARD_H,
                background: '#f0f0f0', border: '2px dashed #d9d9d9',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaa', fontSize: 14,
              }}>
                Спочатку завантажте зображення шаблону
              </div>
            )}
          </div>
        </div>

        {/* ── Right: settings + coordinates ── */}
        <div style={{ flex: '0 0 300px', minWidth: 260 }}>
          {/* Template settings */}
          <div style={{
            background: '#fafafa', border: '1px solid #e8e8e8',
            borderRadius: 8, padding: '16px', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Налаштування шаблону</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Нативна орієнтація PNG</div>
              <Radio.Group
                value={nativeOrientation}
                onChange={e => setNativeOrientation(e.target.value)}
                size="small"
              >
                <Radio.Button value="portrait">Книжкова</Radio.Button>
                <Radio.Button value="landscape">Альбомна</Radio.Button>
              </Radio.Group>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                Як завантажено зображення. При іншій орієнтації воно повернеться на 90°.
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>Другий підписант</span>
              <Switch size="small" checked={hasSecondSigner} onChange={setHasSecondSigner} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>Додатковий текст</span>
              <Switch size="small" checked={hasAdditionalText} onChange={setHasAdditionalText} />
            </div>
          </div>

          {/* Zone coordinates */}
          <div style={{
            background: '#fafafa', border: '1px solid #e8e8e8',
            borderRadius: 8, padding: '16px',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Зони — {viewOrientation === 'landscape' ? 'альбомна' : 'книжкова'}
            </div>

            {activeZones.map(key => {
              const r = currentLayout[key]
              const isSelected = selectedZone === key
              return (
                <div
                  key={key}
                  onClick={() => setSelectedZone(key)}
                  style={{
                    marginBottom: 8, padding: '8px 10px',
                    borderRadius: 6, cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#fff',
                    border: `1px solid ${isSelected ? '#3b82f6' : '#e8e8e8'}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    {ZONE_LABELS[key]}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {(['x', 'y', 'width', 'height'] as const).map(prop => (
                      <Tooltip key={prop} title={prop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10, color: '#9ca3af', width: 40, flexShrink: 0 }}>
                            {prop === 'width' ? 'Ш' : prop === 'height' ? 'В' : prop.toUpperCase()}
                          </span>
                          <InputNumber
                            size="small"
                            value={r[prop]}
                            min={prop === 'width' || prop === 'height' ? 10 : 0}
                            max={prop === 'x' || prop === 'width' ? canvasW : canvasH}
                            style={{ width: '100%', fontSize: 11 }}
                            onChange={val => {
                              if (val === null) return
                              handleLayoutChange({ ...currentLayout, [key]: { ...r, [prop]: val } })
                            }}
                          />
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
