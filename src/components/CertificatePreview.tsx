import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { CertificateOrientationLayout } from '../api/types'
import { CANVAS_LANDSCAPE, CANVAS_PORTRAIT } from '../constants/certificateLayout'

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}

interface Props {
  templateUrl: string | null
  nativeOrientation: 'portrait' | 'landscape'
  orientation: 'portrait' | 'landscape'
  layout: CertificateOrientationLayout | null
  title: string
  bodyText: string
  organization: string
  year: string
  signerName: string
  signerTitle: string
  signer2Name?: string
  signer2Title?: string
  additionalText?: string
  fontFamily: string
  previewName?: string
  style?: React.CSSProperties
}

const CertificatePreview = forwardRef<HTMLCanvasElement, Props>(function CertificatePreview(
  {
    templateUrl, nativeOrientation, orientation, layout,
    title, bodyText, organization, year,
    signerName, signerTitle, signer2Name, signer2Title, additionalText,
    fontFamily, previewName = '', style,
  },
  ref,
) {
  const { w, h } = orientation === 'landscape' ? CANVAS_LANDSCAPE : CANVAS_PORTRAIT
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const templateRef = useRef<HTMLImageElement | null>(null)
  const drawRef     = useRef<(() => void) | null>(null)

  useImperativeHandle(ref, () => canvasRef.current!, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    if (templateRef.current) {
      const needsRotation = orientation !== nativeOrientation
      ctx.save()
      if (needsRotation) {
        if (nativeOrientation === 'portrait') {
          ctx.translate(w, 0)
          ctx.rotate(Math.PI / 2)
        } else {
          ctx.translate(0, h)
          ctx.rotate(-Math.PI / 2)
        }
        ctx.drawImage(templateRef.current, 0, 0, h, w)
      } else {
        ctx.drawImage(templateRef.current, 0, 0, w, h)
      }
      ctx.restore()
    } else {
      ctx.strokeStyle = '#c9a84c'
      ctx.lineWidth = 3
      ctx.strokeRect(16, 16, w - 32, h - 32)
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(22, 22, w - 44, h - 44)
    }

    if (layout) {
      drawWithLayout(ctx, layout)
    } else {
      drawFallback(ctx)
    }
  }, [orientation, nativeOrientation, w, h, layout, title, bodyText, organization, year, // eslint-disable-line react-hooks/exhaustive-deps
      signerName, signerTitle, signer2Name, signer2Title, additionalText, fontFamily, previewName])

  function clipZone(ctx: CanvasRenderingContext2D, zone: { x: number; y: number; width: number; height: number }) {
    ctx.beginPath()
    ctx.rect(zone.x, zone.y, zone.width, zone.height)
    ctx.clip()
  }

  function drawWithLayout(ctx: CanvasRenderingContext2D, zones: CertificateOrientationLayout) {
    const clip = (zone: { x: number; y: number; width: number; height: number }) => clipZone(ctx, zone)

    const titleZone = zones.title
    ctx.save()
    clip(titleZone)
    ctx.font = `bold ${orientation === 'landscape' ? 28 : 24}px ${fontFamily}`
    ctx.fillStyle = '#1a1a2e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText(title, titleZone.x + titleZone.width / 2, titleZone.y + titleZone.height / 2)
    ctx.restore()

    ctx.save()
    const lineW = Math.min(180, titleZone.width * 0.4)
    const lineCx = titleZone.x + titleZone.width / 2
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(lineCx - lineW / 2, titleZone.y + titleZone.height + 4)
    ctx.lineTo(lineCx + lineW / 2, titleZone.y + titleZone.height + 4)
    ctx.stroke()
    ctx.restore()

    if (previewName) {
      const nameZone = zones.name
      ctx.save()
      clip(nameZone)
      ctx.font = `italic ${orientation === 'landscape' ? 20 : 18}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(previewName, nameZone.x + nameZone.width / 2, nameZone.y + nameZone.height / 2)
      ctx.restore()
    }

    if (bodyText) {
      const bz = zones.bodyText
      ctx.save()
      clip(bz)
      ctx.font = `${orientation === 'landscape' ? 13 : 12}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      wrapText(ctx, bodyText, bz.x + bz.width / 2, bz.y + 12, bz.width, 20)
      ctx.restore()
    }

    if (additionalText && zones.additionalText) {
      const az = zones.additionalText
      ctx.save()
      clip(az)
      ctx.font = `13px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(additionalText, az.x + az.width / 2, az.y + az.height / 2)
      ctx.restore()
    }

    if (organization) {
      const oz = zones.organization
      ctx.save()
      clip(oz)
      ctx.font = `600 ${orientation === 'landscape' ? 12 : 11}px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(organization, oz.x + oz.width / 2, oz.y + oz.height / 2)
      ctx.restore()
    }

    if (year) {
      const yz = zones.year
      ctx.save()
      clip(yz)
      ctx.font = `12px ${fontFamily}`
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(year, yz.x + yz.width / 2, yz.y + yz.height / 2)
      ctx.restore()
    }

    if (signerName || signerTitle) {
      const snz = zones.signerName
      const stz = zones.signerTitle
      ctx.save()
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      const lEnd = snz.x + snz.width
      ctx.moveTo(lEnd - Math.min(120, snz.width), snz.y - 4)
      ctx.lineTo(lEnd, snz.y - 4)
      ctx.stroke()
      ctx.restore()
      if (signerName) {
        ctx.save()
        clip(snz)
        ctx.font = `600 12px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(signerName, snz.x + snz.width, snz.y + snz.height / 2)
        ctx.restore()
      }
      if (signerTitle) {
        ctx.save()
        clip(stz)
        ctx.font = `11px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(signerTitle, stz.x + stz.width, stz.y + stz.height / 2)
        ctx.restore()
      }
    }

    if ((signer2Name || signer2Title) && zones.signer2Name) {
      const s2n = zones.signer2Name
      const s2t = zones.signer2Title
      ctx.save()
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(s2n.x, s2n.y - 4)
      ctx.lineTo(s2n.x + Math.min(120, s2n.width), s2n.y - 4)
      ctx.stroke()
      ctx.restore()
      if (signer2Name) {
        ctx.save()
        clip(s2n)
        ctx.font = `600 12px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(signer2Name, s2n.x, s2n.y + s2n.height / 2)
        ctx.restore()
      }
      if (signer2Title && s2t) {
        ctx.save()
        clip(s2t)
        ctx.font = `11px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(signer2Title, s2t.x, s2t.y + s2t.height / 2)
        ctx.restore()
      }
    }
  }

  function drawFallback(ctx: CanvasRenderingContext2D) {
    const cx = w / 2
    const margin = orientation === 'landscape' ? 60 : 50
    const bodyMaxW = w - margin * 2
    const titleY = orientation === 'landscape' ? 100 : 140
    const nameY  = orientation === 'landscape' ? 155 : 210
    const bodyY  = orientation === 'landscape' ? 210 : 275
    const orgY   = orientation === 'landscape' ? 340 : 475
    const yearY  = orientation === 'landscape' ? 368 : 508
    const snY    = orientation === 'landscape' ? 400 : 560
    const stY    = orientation === 'landscape' ? 420 : 585
    const snX    = w - margin

    ctx.save()
    ctx.font = `bold ${orientation === 'landscape' ? 32 : 28}px ${fontFamily}`
    ctx.fillStyle = '#1a1a2e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText(title, cx, titleY)
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - 90, titleY + 22)
    ctx.lineTo(cx + 90, titleY + 22)
    ctx.stroke()
    ctx.restore()

    if (previewName) {
      ctx.save()
      ctx.font = `italic ${orientation === 'landscape' ? 22 : 20}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(previewName, cx, nameY)
      ctx.restore()
    }

    if (bodyText) {
      ctx.save()
      ctx.font = `${orientation === 'landscape' ? 14 : 13}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      wrapText(ctx, bodyText, cx, bodyY, bodyMaxW, 22)
      ctx.restore()
    }

    if (organization) {
      ctx.save()
      ctx.font = `600 ${orientation === 'landscape' ? 13 : 12}px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(organization, cx, orgY)
      ctx.restore()
    }

    if (year) {
      ctx.save()
      ctx.font = `13px ${fontFamily}`
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(year, cx, yearY)
      ctx.restore()
    }

    if (signerName || signerTitle) {
      ctx.save()
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      if (signerName) {
        ctx.font = `600 13px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.fillText(signerName, snX, snY)
      }
      if (signerTitle) {
        ctx.font = `12px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText(signerTitle, snX, stY)
      }
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(snX - 120, snY - 18)
      ctx.lineTo(snX, snY - 18)
      ctx.stroke()
      ctx.restore()
    }
  }

  useEffect(() => { drawRef.current = draw }, [draw])

  useEffect(() => {
    if (!templateUrl) {
      templateRef.current = null
      drawRef.current?.()
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { templateRef.current = img; drawRef.current?.() }
    img.onerror = () => { templateRef.current = null; drawRef.current?.() }
    img.src = templateUrl
  }, [templateUrl])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = w
    canvas.height = h
    draw()
  }, [w, h, draw])

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8, ...style }}
    />
  )
})

export default CertificatePreview
