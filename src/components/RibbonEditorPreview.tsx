import { useId, useRef, useState, useEffect, useCallback } from 'react'
import {
  RIBBON_COLORS,
  FONTS,
  type RibbonColor,
  type TextColor,
  type ExtraTextColor,
  type Font,
} from '../constants/ribbonRules'
import './RibbonEditorPreview.css'

function darkenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  const nL = Math.max(0, l - amount / 100)
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let nr: number, ng: number, nb: number
  if (s === 0) { nr = ng = nb = nL } else {
    const q2 = nL < 0.5 ? nL * (1 + s) : nL + s - nL * s
    const p2 = 2 * nL - q2
    nr = hue2rgb(p2, q2, h + 1 / 3)
    ng = hue2rgb(p2, q2, h)
    nb = hue2rgb(p2, q2, h - 1 / 3)
  }
  const toH = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toH(nr)}${toH(ng)}${toH(nb)}`
}

const TEXT_HEX: Record<TextColor, string> = { white: '#e8e8e8', black: '#1a1a2e', gold: '#c9a84c' }
const EXTRA_HEX: Record<ExtraTextColor, string> = { white: '#e8e8e8', yellow: '#FFD700' }

function getRibbonHex(c: RibbonColor) { return RIBBON_COLORS.find(x => x.value === c)?.hex ?? '#dc2626' }
function getFontFamily(f: Font) { return FONTS.find(x => x.value === f)?.fontFamily ?? '"Times New Roman", serif' }

const EMB_NATIVE_W = 48
const EMB_NATIVE_H = 52

type SvgEntry = { inner: string; vbW: number; vbH: number }
const _svgCache = new Map<string, SvgEntry>()

function parseSvgViewBox(text: string): { vbW: number; vbH: number } {
  const vb = text.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']/)
  if (vb) return { vbW: parseFloat(vb[1]), vbH: parseFloat(vb[2]) }
  const w = text.match(/\bwidth=["']([\d.]+)["']/)
  const h = text.match(/\bheight=["']([\d.]+)["']/)
  if (w && h) return { vbW: parseFloat(w[1]), vbH: parseFloat(h[1]) }
  return { vbW: EMB_NATIVE_W, vbH: EMB_NATIVE_H }
}

function EmblemFromUrl({ url, color, opacity = 0.92 }: { url: string; color: string; opacity?: number }) {
  const innerRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!url) return

    const apply = ({ inner, vbW, vbH }: SvgEntry) => {
      const el = innerRef.current
      if (!el) return
      const scale = Math.min(EMB_NATIVE_W / vbW, EMB_NATIVE_H / vbH)
      const tx = (EMB_NATIVE_W - vbW * scale) / 2
      const ty = (EMB_NATIVE_H - vbH * scale) / 2
      el.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`)
      el.innerHTML = inner
    }

    const cached = _svgCache.get(url)
    if (cached) { apply(cached); return }

    fetch(url)
      .then(r => r.text())
      .then(text => {
        const inner = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)?.[1] ?? ''
        const entry = { inner, ...parseSvgViewBox(text) }
        _svgCache.set(url, entry)
        apply(entry)
      })
      .catch(() => {})
  }, [url])

  return (
    <g fill={color} fillOpacity={opacity}>
      <g ref={innerRef} />
    </g>
  )
}

function EmblemShape({ k, color, opacity = 0.92 }: { k: number; color: string; opacity?: number }) {
  const p = { fill: color, fillOpacity: opacity }
  switch (k) {
    case 0: return (
      <g {...p}>
        <path d="M24 4C16 4 10 11 10 20v10l-4 6h36l-4-6V20C38 11 32 4 24 4z" />
        <circle cx="24" cy="42" r="4" />
        <path d="M20 4 Q24 1 28 4 Q24 6 20 4z" />
      </g>
    )
    case 1: return <path d="M24 3 L28 15H41L31 23L35 36L24 28L13 36L17 23L7 15H20Z" {...p} />
    case 2: return (
      <g {...p}>
        <rect x="8" y="4" width="32" height="38" rx="3" />
        <rect x="14" y="12" width="20" height="2.5" rx="1.2" fill="rgba(0,0,0,0.22)" fillOpacity={1} />
        <rect x="14" y="18" width="20" height="2.5" rx="1.2" fill="rgba(0,0,0,0.22)" fillOpacity={1} />
        <rect x="14" y="24" width="14" height="2.5" rx="1.2" fill="rgba(0,0,0,0.22)" fillOpacity={1} />
        <circle cx="33" cy="38" r="5" />
      </g>
    )
    case 3: return <path d="M24 43C24 43 4 30 4 17C4 11 9 7 14 7C18 7 22 9.5 24 13C26 9.5 30 7 34 7C39 7 44 11 44 17C44 30 24 43 24 43Z" {...p} />
    case 4: return (
      <g {...p}>
        <path d="M24 46 L20 30C17 26 17 16 20 10C21.5 7 26.5 7 28 10C31 16 31 26 28 30Z" />
        <path d="M19 10C18 6 21 2 24 2C27 2 30 6 29 10" fillOpacity={0.6} />
      </g>
    )
    case 5: return <path d="M24 3 L28 15H41L31 23L35 36L24 28L13 36L17 23L7 15H20Z" {...p} />
    default: return <path d="M24 3 L28 15H41L31 23L35 36L24 28L13 36L17 23L7 15H20Z" {...p} />
  }
}

const RIBBON_H  = 140
const RY        = 10
const VBH       = RIBBON_H + 24
const MAIN_FONT = 78
const SUB_FONT  = 24
const EMB_SCALE = 1.7
const EMB_W     = 48 * EMB_SCALE
const EMB_H     = 52 * EMB_SCALE
const GAP       = 14
const SIDE_PAD  = 50
const BASE_VBW  = 1000

export interface EmblemEntry { sortOrder: number; svgUrlLeft: string | null; svgUrlRight: string | null }

export interface RibbonEditorPreviewProps {
  mainText?:       string
  school?:         string
  className?:      string
  names?:          string[]
  color?:          RibbonColor
  textColor?:      TextColor
  extraTextColor?: ExtraTextColor
  font?:           Font
  fontFamily?:     string
  emblemKey?:      number
  emblems?:        EmblemEntry[]
}

export default function RibbonEditorPreview({
  mainText       = 'Випускник 2026',
  school,
  className: classNameProp,
  names,
  color          = 'blue-yellow',
  textColor      = 'white',
  extraTextColor = 'white',
  font           = 'classic',
  fontFamily:    fontFamilyProp,
  emblemKey      = 0,
  emblems,
}: RibbonEditorPreviewProps) {
  const uid     = useId().replace(/:/g, '')
  const sheenId = `rep-sheen-${uid}`
  const byId    = `rep-by-${uid}`

  const mainTextRef = useRef<SVGTextElement>(null)
  const [measuredW, setMeasuredW] = useState(0)

  const validNames = (names ?? []).filter(n => n.trim().length > 0)
  const [nameIdx, setNameIdx] = useState(0)

  useEffect(() => {
    if (validNames.length <= 1) return
    const timer = setInterval(() => {
      setNameIdx(prev => (prev + 1) % validNames.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [validNames.length])

  useEffect(() => { setNameIdx(0) }, [validNames.length])

  const currentName = validNames.length > 0 ? validNames[nameIdx % validNames.length] : undefined

  const measure = useCallback(() => {
    if (mainTextRef.current) setMeasuredW(mainTextRef.current.getBBox().width)
  }, [])

  useEffect(() => { measure() }, [mainText, font, measure])

  const ribbonHex  = getRibbonHex(color)
  const shadowHex  = darkenHex(ribbonHex, 18)
  const textHex    = TEXT_HEX[textColor]
  const extraHex   = EXTRA_HEX[extraTextColor]
  const fontFamily   = fontFamilyProp ?? getFontFamily(font)
  const emblemEntry    = emblems?.find(e => e.sortOrder === emblemKey)
  const emblemSvgLeft  = emblemEntry?.svgUrlLeft  ?? null
  const emblemSvgRight = emblemEntry?.svgUrlRight ?? null

  const isBlueYellow = color === 'blue-yellow'
  const is3D         = emblemKey === 5
  const hasName      = Boolean(currentName?.trim())
  const hasClass     = Boolean(classNameProp?.trim())
  const hasSchool    = Boolean(school?.trim())

  const textW    = measuredW > 0 ? measuredW : mainText.length * MAIN_FONT * 0.58
  const contentW = EMB_W + GAP + textW + (is3D ? GAP + EMB_W : 0)
  const vbw      = Math.max(BASE_VBW, contentW + SIDE_PAD * 2)
  const contentX = (vbw - contentW) / 2

  const embLeftX  = contentX
  const embY      = RY + (RIBBON_H - EMB_H) / 2
  const textLeftX = contentX + EMB_W + GAP
  const textCX    = textLeftX + textW / 2
  const embRightX = contentX + EMB_W + GAP + textW + GAP

  const mainY  = RY + (hasName ? 100 : 95)
  const nameX  = textLeftX + textW * 0.365
  const classX = textLeftX + textW * 0.14
  const schoolX = textLeftX + textW * 0.55
  const nameY   = RY + 44
  const bottomY = RY + 124

  return (
    <div className="ribbon-editor-wrap">
      <svg
        viewBox={`0 0 ${vbw} ${VBH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.20)" />
            <stop offset="40%"  stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
          </linearGradient>
          {isBlueYellow && (
            <linearGradient id={byId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="50%" stopColor="#1a56a0" />
              <stop offset="50%" stopColor="#FFD500" />
            </linearGradient>
          )}
        </defs>

        <rect x="6" y={RY + 6} width={vbw - 6} height={RIBBON_H} rx="8" fill={shadowHex} opacity="0.25" />

        <rect
          x="0" y={RY} width={vbw} height={RIBBON_H} rx="8"
          fill={isBlueYellow ? `url(#${byId})` : ribbonHex}
          style={{ transition: 'fill 0.25s ease' }}
        />

        <rect x="0" y={RY} width={vbw} height={RIBBON_H} rx="8" fill={`url(#${sheenId})`} />

        <g transform={`translate(${embLeftX}, ${embY}) scale(${EMB_SCALE})`}>
          {emblemSvgLeft
            ? <EmblemFromUrl url={emblemSvgLeft} color={textHex} />
            : <EmblemShape k={emblemKey} color={textHex} />}
        </g>

        {is3D && (
          <g
            transform={`translate(${embRightX + EMB_W}, ${embY}) scale(${-EMB_SCALE}, ${EMB_SCALE})`}
            opacity="0.78"
          >
            {emblemSvgRight
              ? <EmblemFromUrl url={emblemSvgRight} color={textHex} />
              : <EmblemShape k={emblemKey} color={textHex} />}
          </g>
        )}

        {hasName && (
          <text
            x={nameX} y={nameY}
            textAnchor="middle"
            fontSize={SUB_FONT}
            fontFamily={fontFamily}
            fontStyle="italic"
            fill={extraHex}
            opacity="0.90"
            className="ribbon-editor-name"
          >
            {currentName}
          </text>
        )}

        <text
          ref={mainTextRef}
          x={textCX} y={mainY}
          textAnchor="middle"
          fontSize={MAIN_FONT}
          fontFamily={fontFamily}
          fontStyle="italic"
          fontWeight="700"
          fill={textHex}
          style={{ transition: 'fill 0.2s ease' }}
        >
          {mainText}
        </text>

        {hasClass && (
          <text
            x={classX} y={bottomY}
            textAnchor="middle"
            fontSize={SUB_FONT}
            fontFamily={fontFamily}
            fontStyle="italic"
            fill={extraHex}
            opacity="0.82"
          >
            {classNameProp}
          </text>
        )}

        {hasSchool && (
          <text
            x={schoolX} y={bottomY}
            textAnchor="middle"
            fontSize={SUB_FONT}
            fontFamily={fontFamily}
            fontStyle="italic"
            fill={extraHex}
            opacity="0.82"
          >
            {school}
          </text>
        )}
      </svg>
    </div>
  )
}
