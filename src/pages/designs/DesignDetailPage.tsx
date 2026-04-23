import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Card, Descriptions, Popconfirm, Spin, Tag, Table } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, HeartOutlined, UserOutlined } from '@ant-design/icons'
import { getSavedDesign, deleteSavedDesign } from '../../api/designs'
import type { AdminSavedDesignDetail } from '../../api/types'
import RibbonEditorPreview from '../../components/RibbonEditorPreview'
import {
  RIBBON_COLORS,
  PRINT_TYPES,
  MATERIALS,
  FONTS,
  EMBLEMS,
} from '../../constants/ribbonRules'
import type { RibbonColor, TextColor, ExtraTextColor, Font } from '../../constants/ribbonRules'

function labelOf(list: { value: string; label: string }[], val: string) {
  return list.find(x => x.value === val)?.label ?? val
}

const TEXT_COLOR_LABELS: Record<string, string> = { white: 'Білий', black: 'Чорний', gold: 'Золотий' }
const EXTRA_COLOR_LABELS: Record<string, string> = { white: 'Білий', yellow: 'Жовтий' }

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [design, setDesign] = useState<AdminSavedDesignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getSavedDesign(Number(id))
      .then(setDesign)
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!design) return
    setDeleting(true)
    try {
      await deleteSavedDesign(design.id)
      navigate('/designs')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!design) return <div style={{ padding: 40, color: '#888' }}>Дизайн не знайдено</div>

  const { state } = design
  const colorInfo = RIBBON_COLORS.find(c => c.value === state.color)
  const allNames = (state.classes ?? []).flatMap(g =>
    g.names.split('\n').map(s => s.trim()).filter(Boolean)
  )
  const firstClass = state.classes?.[0]?.className?.trim() || undefined

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/designs')} />
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <HeartOutlined />
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

      {/* Preview */}
      <Card style={{ marginBottom: 20, background: '#f8f8fc' }}>
        <RibbonEditorPreview
          mainText={state.mainText || undefined}
          school={state.school || undefined}
          className={firstClass}
          names={allNames}
          color={state.color as RibbonColor}
          textColor={state.textColor as TextColor}
          extraTextColor={state.extraTextColor as ExtraTextColor}
          font={state.font as Font}
          emblemKey={state.emblemKey}
        />
      </Card>

      {/* User info */}
      <Card style={{ marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
          <div>
            <Link to={`/users/${design.userId}`} style={{ fontWeight: 600, fontSize: 15 }}>
              {design.userFullName}
            </Link>
            <div style={{ fontSize: 13 }}>
              <Link to={`/users/${design.userId}`} style={{ color: '#8c8c8c' }}>
                {design.userEmail}
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Design params */}
      <Card title="Параметри дизайну" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Основний текст">{state.mainText || '—'}</Descriptions.Item>
          <Descriptions.Item label="Школа">{state.school || '—'}</Descriptions.Item>
          <Descriptions.Item label="Колір">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {colorInfo && (
                <span style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: colorInfo.hex, border: '1px solid #d9d9d9',
                  display: 'inline-block',
                }} />
              )}
              {labelOf(RIBBON_COLORS, state.color)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Матеріал">{labelOf(MATERIALS, state.material)}</Descriptions.Item>
          <Descriptions.Item label="Тип друку">
            <Tag>{labelOf(PRINT_TYPES, state.printType)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Шрифт">{labelOf(FONTS, state.font)}</Descriptions.Item>
          <Descriptions.Item label="Колір тексту">{TEXT_COLOR_LABELS[state.textColor] ?? state.textColor}</Descriptions.Item>
          <Descriptions.Item label="Колір доп. тексту">{EXTRA_COLOR_LABELS[state.extraTextColor] ?? state.extraTextColor}</Descriptions.Item>
          <Descriptions.Item label="Емблема">
            {EMBLEMS.find(e => e.key === state.emblemKey)?.label ?? `#${state.emblemKey}`}
          </Descriptions.Item>
          {state.comment && (
            <Descriptions.Item label="Коментар" span={2}>{state.comment}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Classes & names */}
      {(state.classes ?? []).length > 0 && (
        <Card title={`Класи та імена (${allNames.length} учнів)`}>
          {state.classes.map((group, i) => {
            const names = group.names.split('\n').map(s => s.trim()).filter(Boolean)
            return (
              <div key={i} style={{ marginBottom: i < state.classes.length - 1 ? 20 : 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a1a2e' }}>
                  {group.className || `Клас ${i + 1}`}
                  <Tag style={{ marginLeft: 8 }}>{names.length} учнів</Tag>
                </div>
                <Table
                  size="small"
                  dataSource={names.map((name, j) => ({ key: j, name }))}
                  columns={[
                    { title: '#', dataIndex: 'key', width: 50, render: (v: number) => v + 1 },
                    { title: "Ім'я", dataIndex: 'name' },
                  ]}
                  pagination={false}
                  showHeader={false}
                />
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
