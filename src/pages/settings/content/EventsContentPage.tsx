import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'

const SLUG = 'events'
const { Title } = Typography

interface EventItem {
  id: string; month: number; day: number; dateLabel: string
  title: string; desc: string; discountLabel: string; discountDescription: string
}

interface EventsContent {
  hero: { eyebrow: string; title: string; subtitle: string }
  events: EventItem[]
}

export default function EventsContentPage() {
  const [data, setData] = useState<EventsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<EventsContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as EventsContent)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) return <Spin />

  const set = (path: string[], value: unknown) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      let cur = next
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]]
      cur[path[path.length - 1]] = value
      return next
    })
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Контент: Шкільні свята</Title>
        <Button type="primary" onClick={save} loading={saving}>Зберегти всі зміни</Button>
      </div>

      <Card title="Hero-секція" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}><Form.Item label="Надпис над заголовком"><Input value={data.hero.eyebrow} onChange={e => set(['hero', 'eyebrow'], e.target.value)} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Заголовок"><Input value={data.hero.title} onChange={e => set(['hero', 'title'], e.target.value)} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Підзаголовок"><Input.TextArea rows={2} value={data.hero.subtitle} onChange={e => set(['hero', 'subtitle'], e.target.value)} /></Form.Item></Col>
          </Row>
        </Form>
      </Card>

      <Card title="Події">
        <Form layout="vertical">
          {data.events.map((ev, i) => (
            <div key={ev.id}>
              {i > 0 && <Divider />}
              <Title level={5} style={{ marginBottom: 12 }}>{ev.title || `Подія ${i + 1}`}</Title>
              <Row gutter={16}>
                <Col span={6}><Form.Item label="Дата (відображення)"><Input value={ev.dateLabel} onChange={e => set(['events', String(i), 'dateLabel'], e.target.value)} /></Form.Item></Col>
                <Col span={4}><Form.Item label="Місяць (1–12)"><InputNumber style={{ width: '100%' }} min={1} max={12} value={ev.month} onChange={v => set(['events', String(i), 'month'], v)} /></Form.Item></Col>
                <Col span={4}><Form.Item label="День"><InputNumber style={{ width: '100%' }} min={1} max={31} value={ev.day} onChange={v => set(['events', String(i), 'day'], v)} /></Form.Item></Col>
                <Col span={10}><Form.Item label="Назва події"><Input value={ev.title} onChange={e => set(['events', String(i), 'title'], e.target.value)} /></Form.Item></Col>
              </Row>
              <Form.Item label="Опис">
                <Input.TextArea rows={3} value={ev.desc} onChange={e => set(['events', String(i), 'desc'], e.target.value)} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="Акція — заголовок"><Input value={ev.discountLabel} onChange={e => set(['events', String(i), 'discountLabel'], e.target.value)} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Акція — умови"><Input value={ev.discountDescription} onChange={e => set(['events', String(i), 'discountDescription'], e.target.value)} /></Form.Item></Col>
              </Row>
            </div>
          ))}
        </Form>
      </Card>
    </div>
  )
}
