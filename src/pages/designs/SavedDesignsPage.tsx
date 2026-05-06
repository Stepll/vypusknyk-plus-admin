import { useEffect, useState } from 'react'
import { Input, Table, Tabs, Tag } from 'antd'
import { HeartOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getSavedDesigns } from '../../api/designs'
import { getBadgeDesigns } from '../../api/badgeDesigns'
import type { AdminSavedDesignItem, AdminSavedBadgeDesignItem } from '../../api/types'
import RibbonEditorPreview from '../../components/RibbonEditorPreview'
import type { RibbonColor, TextColor, ExtraTextColor, Font } from '../../constants/ribbonRules'

const pageSize = 20

export default function SavedDesignsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'ribbon' | 'badge'>('ribbon')

  const [ribbonItems, setRibbonItems] = useState<AdminSavedDesignItem[]>([])
  const [ribbonTotal, setRibbonTotal] = useState(0)
  const [ribbonPage, setRibbonPage] = useState(1)
  const [ribbonLoading, setRibbonLoading] = useState(false)

  const [badgeItems, setBadgeItems] = useState<AdminSavedBadgeDesignItem[]>([])
  const [badgeTotal, setBadgeTotal] = useState(0)
  const [badgePage, setBadgePage] = useState(1)
  const [badgeLoading, setBadgeLoading] = useState(false)

  const [search, setSearch] = useState('')

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
      render: (_: unknown, row: AdminSavedBadgeDesignItem) => (
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #e91e8c 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, textAlign: 'center',
          padding: 6, lineHeight: 1.2,
        }}>
          {row.state.topText ? row.state.topText.slice(0, 12) : '•'}
        </div>
      ),
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
        onChange={k => setActiveTab(k as 'ribbon' | 'badge')}
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
        ]}
      />
    </div>
  )
}
