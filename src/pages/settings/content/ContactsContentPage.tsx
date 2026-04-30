import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Form, Input, Row, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'

const SLUG = 'contacts'
const { Title } = Typography

interface ContactsContent {
  hero: { label: string; title: string; subtitle: string }
  contactInfo: { phone: string; phoneHref: string; email: string; instagramHandle: string; instagramHref: string; businessHours: string }
  wholesale: { eyebrow: string; title: string; desc: string; listItems: string[]; viberHref: string; telegramHref: string }
}

export default function ContactsContentPage() {
  const [data, setData] = useState<ContactsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<ContactsContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as ContactsContent)
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
        <Title level={4} style={{ margin: 0 }}>Контент: Контакти</Title>
        <Button type="primary" onClick={save} loading={saving}>Зберегти всі зміни</Button>
      </div>

      <Card title="Hero-секція" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}><Form.Item label="Мітка"><Input value={data.hero.label} onChange={e => set(['hero', 'label'], e.target.value)} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Заголовок"><Input value={data.hero.title} onChange={e => set(['hero', 'title'], e.target.value)} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Підзаголовок"><Input.TextArea rows={2} value={data.hero.subtitle} onChange={e => set(['hero', 'subtitle'], e.target.value)} /></Form.Item></Col>
          </Row>
        </Form>
      </Card>

      <Card title="Контактна інформація" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Телефон (відображення)"><Input value={data.contactInfo.phone} onChange={e => set(['contactInfo', 'phone'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Телефон (href)"><Input value={data.contactInfo.phoneHref} onChange={e => set(['contactInfo', 'phoneHref'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Email"><Input value={data.contactInfo.email} onChange={e => set(['contactInfo', 'email'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Години роботи"><Input value={data.contactInfo.businessHours} onChange={e => set(['contactInfo', 'businessHours'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Instagram handle"><Input value={data.contactInfo.instagramHandle} onChange={e => set(['contactInfo', 'instagramHandle'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Instagram href"><Input value={data.contactInfo.instagramHref} onChange={e => set(['contactInfo', 'instagramHref'], e.target.value)} /></Form.Item></Col>
          </Row>
        </Form>
      </Card>

      <Card title="Блок оптових замовлень" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Надпис (над заголовком)"><Input value={data.wholesale.eyebrow} onChange={e => set(['wholesale', 'eyebrow'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Заголовок"><Input value={data.wholesale.title} onChange={e => set(['wholesale', 'title'], e.target.value)} /></Form.Item></Col>
          </Row>
          <Form.Item label="Опис">
            <Input.TextArea rows={3} value={data.wholesale.desc} onChange={e => set(['wholesale', 'desc'], e.target.value)} />
          </Form.Item>
          {data.wholesale.listItems.map((item, i) => (
            <Form.Item key={i} label={`Пункт списку ${i + 1}`}>
              <Input value={item} onChange={e => set(['wholesale', 'listItems', String(i)], e.target.value)} />
            </Form.Item>
          ))}
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Viber href"><Input value={data.wholesale.viberHref} onChange={e => set(['wholesale', 'viberHref'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Telegram href"><Input value={data.wholesale.telegramHref} onChange={e => set(['wholesale', 'telegramHref'], e.target.value)} /></Form.Item></Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
