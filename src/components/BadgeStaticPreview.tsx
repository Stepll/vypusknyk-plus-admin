import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'

const CANVAS_SIZE = 320
const CX = CANVAS_SIZE / 2
const CY = CANVAS_SIZE / 2
const BADGE_RADIUS = 148

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  pos: 'top' | 'bottom',
  fontSize: number,
  fontFamily: string,
  textColor: string,
) {
  const r = BADGE_RADIUS - fontSize / 2 - 4

  ctx.save()
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  let totalWidth = 0
  chars.forEach(ch => { totalWidth += ctx.measureText(ch).width })
  const totalAngle = totalWidth / r

  ctx.translate(CX, CY)

  if (pos === 'top') {
    let angle = -totalAngle / 2
    for (const ch of chars) {
      const ca = ctx.measureText(ch).width / r
      angle += ca / 2
      ctx.save()
      ctx.rotate(angle)
      ctx.translate(0, -r)
      ctx.fillText(ch, 0, 0)
      ctx.restore()
      angle += ca / 2
    }
  } else {
    let angle = Math.PI + totalAngle / 2
    for (const ch of chars) {
      const ca = ctx.measureText(ch).width / r
      angle -= ca / 2
      ctx.save()
      ctx.rotate(angle)
      ctx.translate(0, -r)
      ctx.rotate(Math.PI)
      ctx.fillText(ch, 0, 0)
      ctx.restore()
      angle -= ca / 2
    }
  }

  ctx.restore()
}

interface Transform {
  scale: number
  x: number
  y: number
  rotation: number
}

interface Props {
  photoUrl: string | null
  photoTransform: Transform
  topText: string
  bottomText: string
  textColor: string
  fontSize: number
  fontFamily: string
  size?: number
}

export interface BadgeStaticPreviewRef {
  toDataUrl(): string
}

const BadgeStaticPreview = forwardRef<BadgeStaticPreviewRef, Props>(
  function BadgeStaticPreview({ photoUrl, photoTransform, topText, bottomText, textColor, fontSize, fontFamily, size = 320 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef    = useRef<HTMLImageElement | null>(null)

    const draw = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = '#f0f0f0'
      ctx.fill()
      ctx.restore()

      if (imgRef.current) {
        const img = imgRef.current
        const { scale, x, y, rotation } = photoTransform

        ctx.save()
        ctx.beginPath()
        ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
        ctx.clip()

        const fitScale =
          Math.max(
            (BADGE_RADIUS * 2) / img.naturalWidth,
            (BADGE_RADIUS * 2) / img.naturalHeight,
          ) * scale

        ctx.translate(CX + x, CY + y)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(
          img,
          (-img.naturalWidth  * fitScale) / 2,
          (-img.naturalHeight * fitScale) / 2,
          img.naturalWidth  * fitScale,
          img.naturalHeight * fitScale,
        )
        ctx.restore()
      } else {
        ctx.save()
        ctx.beginPath()
        ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = '#d1d5db'
        ctx.font = '48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('📷', CX, CY - 10)
        ctx.font = '13px Arial'
        ctx.fillStyle = '#9ca3af'
        ctx.fillText('Немає фото', CX, CY + 34)
        ctx.restore()
      }

      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, BADGE_RADIUS - 1, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(233, 30, 140, 0.55)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 5])
      ctx.stroke()
      ctx.restore()

      if (topText)    drawArcText(ctx, topText,    'top',    fontSize, fontFamily, textColor)
      if (bottomText) drawArcText(ctx, bottomText, 'bottom', fontSize, fontFamily, textColor)
    }, [photoTransform, topText, bottomText, textColor, fontSize, fontFamily])

    useEffect(() => {
      if (!photoUrl) {
        imgRef.current = null
        draw()
        return
      }
      const img = new Image()
      if (!photoUrl.startsWith('data:')) img.crossOrigin = 'anonymous'
      img.onload = () => { imgRef.current = img; draw() }
      img.src = photoUrl
    }, [photoUrl, draw])

    useEffect(() => { draw() }, [draw])

    useImperativeHandle(ref, () => ({
      toDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? '',
    }))

    return (
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          width: size,
          height: size,
        }}
      />
    )
  },
)

export default BadgeStaticPreview
