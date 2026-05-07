import { useEffect, useRef, useCallback } from 'react'
import type { CertificateZoneKey, CertificateZoneRect, CertificateOrientationLayout } from '../../../../api/types'

export const ZONE_LABELS: Record<CertificateZoneKey, string> = {
  title:          'Заголовок',
  name:           "Ім'я",
  bodyText:       'Текст нагороди',
  organization:   'Від кого',
  year:           'Рік',
  signerName:     'Підписант (ім\'я)',
  signerTitle:    'Підписант (посада)',
  signer2Name:    '2-й підписант (ім\'я)',
  signer2Title:   '2-й підписант (посада)',
  additionalText: 'Додатковий текст',
}

const ZONE_COLORS: Record<CertificateZoneKey, string> = {
  title:          '#2563eb',
  name:           '#7c3aed',
  bodyText:       '#0891b2',
  organization:   '#059669',
  year:           '#d97706',
  signerName:     '#dc2626',
  signerTitle:    '#db2777',
  signer2Name:    '#9333ea',
  signer2Title:   '#6d28d9',
  additionalText: '#65a30d',
}

type DragType = 'move' | 'nw' | 'ne' | 'sw' | 'se'
interface DragState {
  type: DragType
  key: CertificateZoneKey
  startX: number
  startY: number
  startRect: CertificateZoneRect
}

interface Props {
  imageUrl: string | null
  nativeOrientation: 'portrait' | 'landscape'
  viewOrientation: 'portrait' | 'landscape'
  canvasW: number
  canvasH: number
  layout: CertificateOrientationLayout
  activeZones: CertificateZoneKey[]
  selectedZone: CertificateZoneKey | null
  onZoneSelect: (key: CertificateZoneKey) => void
  onChange: (layout: CertificateOrientationLayout) => void
}

export default function CertificateZoneEditor({
  imageUrl, nativeOrientation, viewOrientation,
  canvasW, canvasH, layout, activeZones, selectedZone, onZoneSelect, onChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef    = useRef<HTMLImageElement | null>(null)
  const dragRef   = useRef<DragState | null>(null)
  const boardRef  = useRef<HTMLDivElement>(null)

  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, canvasW, canvasH)
    const img = imgRef.current
    if (!img) return
    const needsRotation = viewOrientation !== nativeOrientation
    ctx.save()
    if (needsRotation) {
      if (nativeOrientation === 'portrait') {
        ctx.translate(canvasW, 0)
        ctx.rotate(Math.PI / 2)
      } else {
        ctx.translate(0, canvasH)
        ctx.rotate(-Math.PI / 2)
      }
      ctx.drawImage(img, 0, 0, canvasH, canvasW)
    } else {
      ctx.drawImage(img, 0, 0, canvasW, canvasH)
    }
    ctx.restore()
  }, [imageUrl, nativeOrientation, viewOrientation, canvasW, canvasH]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!imageUrl) { imgRef.current = null; drawBackground(); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { imgRef.current = img; drawBackground() }
    img.onerror = () => { imgRef.current = null; drawBackground() }
    img.src = imageUrl
  }, [imageUrl, drawBackground])

  useEffect(() => { drawBackground() }, [drawBackground])

  const handleMouseDown = (key: CertificateZoneKey, type: DragType, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = { type, key, startX: e.clientX, startY: e.clientY, startRect: { ...layout[key] } }
    onZoneSelect(key)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const { type, key, startX, startY, startRect } = dragRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const r = { ...startRect }
    const MIN = 20
    if (type === 'move') {
      r.x = Math.max(0, Math.min(canvasW - r.width,  startRect.x + dx))
      r.y = Math.max(0, Math.min(canvasH - r.height, startRect.y + dy))
    } else if (type === 'nw') {
      const newW = Math.max(MIN, startRect.width  - dx)
      const newH = Math.max(MIN, startRect.height - dy)
      r.x = startRect.x + startRect.width  - newW
      r.y = startRect.y + startRect.height - newH
      r.width = newW; r.height = newH
    } else if (type === 'ne') {
      r.width  = Math.max(MIN, startRect.width  + dx)
      const newH = Math.max(MIN, startRect.height - dy)
      r.y = startRect.y + startRect.height - newH
      r.height = newH
    } else if (type === 'sw') {
      const newW = Math.max(MIN, startRect.width - dx)
      r.x = startRect.x + startRect.width - newW
      r.width = newW; r.height = Math.max(MIN, startRect.height + dy)
    } else if (type === 'se') {
      r.width  = Math.max(MIN, startRect.width  + dx)
      r.height = Math.max(MIN, startRect.height + dy)
    }
    onChange({ ...layout, [key]: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) } })
  }, [layout, canvasW, canvasH, onChange])

  const handleMouseUp = () => { dragRef.current = null }

  const handleStyle = (cursor: string): React.CSSProperties => ({
    position: 'absolute', width: 10, height: 10,
    background: '#fff', border: '2px solid #2563eb',
    cursor, zIndex: 10, borderRadius: 2,
  })

  return (
    <div
      ref={boardRef}
      style={{ position: 'relative', width: canvasW, height: canvasH, userSelect: 'none', flexShrink: 0 }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} width={canvasW} height={canvasH} style={{ display: 'block', pointerEvents: 'none' }} />

      {activeZones.map(key => {
        const r = layout[key]
        const color = ZONE_COLORS[key]
        const isSelected = selectedZone === key
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: r.x, top: r.y,
              width: r.width, height: r.height,
              border: `2px solid ${color}`,
              boxSizing: 'border-box',
              cursor: 'move',
              opacity: isSelected ? 1 : 0.7,
              boxShadow: isSelected ? `0 0 0 1px ${color}40` : undefined,
            }}
            onMouseDown={e => handleMouseDown(key, 'move', e)}
          >
            {/* Label above top border */}
            <div style={{
              position: 'absolute', top: -20, left: 0,
              background: color, color: '#fff',
              fontSize: 10, fontWeight: 600, lineHeight: '16px',
              padding: '0 5px', borderRadius: '3px 3px 0 0',
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              {ZONE_LABELS[key]}
            </div>
            {/* Corner handles */}
            <div style={{ ...handleStyle('nw-resize'), top: -5, left: -5 }}
              onMouseDown={e => handleMouseDown(key, 'nw', e)} />
            <div style={{ ...handleStyle('ne-resize'), top: -5, right: -5 }}
              onMouseDown={e => handleMouseDown(key, 'ne', e)} />
            <div style={{ ...handleStyle('sw-resize'), bottom: -5, left: -5 }}
              onMouseDown={e => handleMouseDown(key, 'sw', e)} />
            <div style={{ ...handleStyle('se-resize'), bottom: -5, right: -5 }}
              onMouseDown={e => handleMouseDown(key, 'se', e)} />
          </div>
        )
      })}
    </div>
  )
}
