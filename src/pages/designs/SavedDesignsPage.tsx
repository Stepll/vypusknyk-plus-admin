import { useEffect, useState } from 'react'
import { Input, Table, Tabs, Tag } from 'antd'
import { HeartOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getSavedDesigns } from '../../api/designs'
import { getBadgeDesigns } from '../../api/badgeDesigns'
import { getCertificateDesigns } from '../../api/certificateDesigns'
import { getBadgeTextColors } from '../../api/badgeTextColors'
import { getBadgeFonts } from '../../api/badgeFonts'
import type {
  AdminSavedDesignItem, AdminSavedBadgeDesignItem, AdminCertificateDesignItem,
  BadgeTextColorResponse, BadgeFontResponse,
} from '../../api/types'
import RibbonEditorPreview from '../../components/RibbonEditorPreview'
import BadgeStaticPreview from '../../components/BadgeStaticPreview'
import type { RibbonColor, TextColor, ExtraTextColor, Font } from '../../constants/ribbonRules'

const pageSize = 20

export default function SavedDesignsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'ribbon' | 'badge' | 'certificate'>('ribbon')

  const [ribbonItems, setRibbonItems] = useState<AdminSavedDesignItem[]>([])
  const [ribbonTotal, setRibbonTotal] = useState(0)
  const [ribbonPage, setRibbonPage] = useState(1)
  const [ribbonLoading, setRibbonLoading] = useState(false)

  const [badgeItems, setBadgeItems] = useState<AdminSavedBadgeDesignItem[]>([])
  const [badgeTotal, setBadgeTotal] = useState(0)
  const [badgePage, setBadgePage] = useState(1)
  const [badgeLoading, setBadgeLoading] = useState(false)

  const [certItems, setCertItems] = useState<AdminCertificateDesignItem[]>([])
  const [certTotal, setCertTotal] = useState(0)
  const [certPage, setCertPage] = useState(1)
  const [certLoading, setCertLoading] = useState(false)

  const [search, setSearch] = useState('')

  const [textColors, setTextColors] = useState<BadgeTextColorResponse[]>([])
  const [fonts, setFonts] = useState<BadgeFontResponse[]>([])

  useEffect(() => {
    Promise.all([getBadgeTextColors(), getBadgeFonts()])
      .then(([tc, f]) => { setTextColors(tc); setFonts(f) })
  }, [])

  useEffect(() => {
    setRibbonLoading(true)
    getSavedDesigns(ribbonPage, pageSize)
      .then(res => { setRibbonItems(res.items); setRibbonTotal(res.total) })
      .finally(() => setRibbonLoading(false))
  }, [ribbonPage])

  useEffect(() => {
    setBadgeLoading(true)
    getBadgeDesigns(badgePage, pageSize)
      .then(res => { setBadgeItems(res.items); setBadgeTotal(res.total) })
      .finally(() => setBadgeLoading(false))
  }, [badgePage])

  useEffect(() => {
    setCertLoading(true)
    getCertificateDesigns(certPage, pageSize)
      .then(res => { setCertItems(res.items); setCertTotal(res.total) })
      .finally(() => setCertLoading(false))
  }, [certPage])

  const filteredRibbons = search.trim()
    ? ribbonItems.filter(d =>
        d.userFullName.toLowerCase().includes(search.toLowerCase()) ||
        (d.userEmail ?? '').toLowerCase().includes(search.toLowerCase()) ||
        d.designName.toLowerCase().includes(search.toLowerCase())
      )
    : ribbonItems

  const filteredBadges = search.trim()
    ? badgeItems.filter(d =>
        d.userFullName.toLowerCase().includes(search.toLowerCase()) ||
        (d.userEmail ?? '').toLowerCase().includes(search.toLowerCase()) ||
        d.designName.toLowerCase().includes(search.toLowerCase())
      )
    : badgeItems

  const filteredCerts = search.trim()
    ? certItems.filter(d =>
        d.userFullName.toLowerCase().includes(search.toLowerCase()) ||
        (d.userEmail ?? '').toLowerCase().includes(search.toLowerCase()) ||
        d.designName.toLowerCase().includes(search.toLowerCase())
      )
    : certItems

  const certColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Назва',
      key: 'info',
      render: (_: unknown, row: AdminCertificateDesignItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userFullName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Тип',
      key: 'type',
      width: 80,
      render: () => <Tag color="gold">Грамота</Tag>,
    },
    {
      title: 'Збережено',
      dataIndex: 'savedAt',
      key: 'savedAt',
      width: 130,
      render: (v: string) => new Date(v).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    },
  ]

  const ribbonColumns = [
    {
      title: 'Превью',
      key: 'preview',
      width: 300,
      render: (_: unknown, row: AdminSavedDesignItem) => (
        <div style={{ width: 280, pointerEvents: 'none' }}>
          <RibbonEditorPreview
            mainText={row.state.mainText || undefined}
            school={row.state.school || undefined}
            color={row.state.color as RibbonColor}
            textColor={row.state.textColor as TextColor}
            extraTextColor={row.state.extraTextColor as ExtraTextColor}
            font={row.state.font as Font}
            emblemKey={row.state.emblemKey}
          />
        </div>
      ),
    },
    {
      title: 'Назва',
      key: 'info',
      render: (_: unknown, row: AdminSavedDesignItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userFullName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Збережено',
      dataIndex: 'savedAt',
      key: 'savedAt',
      width: 130,
      render: (v: string) => new Date(v).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    },
  ]

  const badgeColumns = [
    {
      title: 'Превью',
      key: 'preview',
      width: 100,
      render: (_: unknown, row: AdminSavedBadgeDesignItem) => {
        const colorHex   = textColors.find(c => c.id === row.state.textColorId)?.hex ?? '#1a1a2e'
        const fontFamily = fonts.find(f => f.slug === row.state.fontSlug)?.fontFamily ?? 'Arial, sans-serif'
        return (
          <div style={{ pointerEvents: 'none' }}>
            <BadgeStaticPreview
              photoUrl={row.state.photoUrl}
              photoTransform={row.state.photoTransform}
              topText={row.state.topText}
              bottomText={row.state.bottomText}
              textColor={colorHex}
              fontSize={row.state.fontSize}
              fontFamily={fontFamily}
              size={80}
            />
          </div>
        )
      },
    },
    {
      title: 'Назва',
      key: 'info',
      render: (_: unknown, row: AdminSavedBadgeDesignItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designName}</div>
          {row.state.topText && <div style={{ fontSize: 13, color: '#555' }}>Верх: {row.state.topText}</div>}
          {row.state.bottomText && <div style={{ fontSize: 13, color: '#555' }}>Низ: {row.state.bottomText}</div>}
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userFullName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{row.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Тип',
      key: 'type',
      width: 80,
      render: () => <Tag color="purple">Значок</Tag>,
    },
    {
      title: 'Збережено',
      dataIndex: 'savedAt',
      key: 'savedAt',
      width: 130,
      render: (v: string) => new Date(v).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <HeartOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Збережені дизайни</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Всі збережені дизайни користувачів</p>
        </div>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="Пошук по імені, email або назві дизайну"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 16 }}
        allowClear
      />

      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as 'ribbon' | 'badge' | 'certificate')}
        items={[
          {
            key: 'ribbon',
            label: `Стрічки (${ribbonTotal})`,
            children: (
              <Table
                rowKey="id"
                dataSource={filteredRibbons}
                columns={ribbonColumns}
                loading={ribbonLoading}
                pagination={{ current: ribbonPage, pageSize, total: ribbonTotal, onChange: setRibbonPage }}
                onRow={record => ({ onClick: () => navigate(`/designs/${record.id}`) })}
                rowClassName={() => 'clickable-row'}
                style={{ cursor: 'pointer' }}
                components={{
                  body: {
                    row: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
                      <tr {...props} style={{ ...props.style, height: 200 }} />
                    ),
                  },
                }}
              />
            ),
          },
          {
            key: 'badge',
            label: `Значки (${badgeTotal})`,
            children: (
              <Table
                rowKey="id"
                dataSource={filteredBadges}
                columns={badgeColumns}
                loading={badgeLoading}
                pagination={{ current: badgePage, pageSize, total: badgeTotal, onChange: setBadgePage }}
                onRow={record => ({ onClick: () => navigate(`/designs/badge/${record.id}`) })}
                rowClassName={() => 'clickable-row'}
                style={{ cursor: 'pointer' }}
              />
            ),
          },
          {
            key: 'certificate',
            label: `Грамоти (${certTotal})`,
            children: (
              <Table
                rowKey="id"
                dataSource={filteredCerts}
                columns={certColumns}
                loading={certLoading}
                pagination={{ current: certPage, pageSize, total: certTotal, onChange: setCertPage }}
                rowClassName={() => 'clickable-row'}
                style={{ cursor: 'pointer' }}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
