import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'
import ImageUploadField from '../../../components/ImageUploadField'

const SLUG = 'about'
const { Title } = Typography

interface AboutContent {
  hero: { label: string; title: string }
  stats: { value: number; suffix: string; label: string }[]
  whoWeAre: { sectionLabel: string; title: string; paragraph1: string; paragraph2: string; photoUrl: string | null }
  howWeWork: { sectionLabel: string; title: string; steps: { num: string; title: string; desc: string; note: string | null }[] }
  whyUs: { sectionLabel: string; title: string; items: { title: string; desc: string }[] }
  faq: { sectionLabel: string; title: string; items: { q: string; a: string }[] }
  contacts: { phone: string; phoneHref: string; email: string; instagramHandle: string; instagramHref: string; businessHours: string }
}

export default function AboutContentPage() {
  const [data, setData] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<AboutContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as AboutContent)
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
        <Title level={4} style={{ margin: 0 }}>Контент: Про нас</Title>
        <Button type="primary" onClick={save} loading={saving}>Зберегти всі зміни</Button>
      </div>

      <Card title="Hero-секція" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Мітка">
                <Input value={data.hero.label} onChange={e => set(['hero', 'label'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="Заголовок">
                <Input.TextArea rows={2} value={data.hero.title} onChange={e => set(['hero', 'title'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Статистика" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          {data.stats.map((stat, i) => (
            <Row gutter={16} key={i} align="middle">
              <Col span={6}>
                <Form.Item label={i === 0 ? 'Число' : ''}>
                  <InputNumber style={{ width: '100%' }} value={stat.value} onChange={v => set(['stats', String(i), 'value'], v)} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={i === 0 ? 'Суфікс' : ''}>
                  <Input value={stat.suffix} onChange={e => set(['stats', String(i), 'suffix'], e.target.value)} />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item label={i === 0 ? 'Підпис' : ''}>
                  <Input value={stat.label} onChange={e => set(['stats', String(i), 'label'], e.target.value)} />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </Form>
      </Card>

      <Card title="Хто ми" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Мітка секції">
                <Input value={data.whoWeAre.sectionLabel} onChange={e => set(['whoWeAre', 'sectionLabel'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Заголовок">
                <Input value={data.whoWeAre.title} onChange={e => set(['whoWeAre', 'title'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Абзац 1">
            <Input.TextArea rows={3} value={data.whoWeAre.paragraph1} onChange={e => set(['whoWeAre', 'paragraph1'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Абзац 2">
            <Input.TextArea rows={3} value={data.whoWeAre.paragraph2} onChange={e => set(['whoWeAre', 'paragraph2'], e.target.value)} />
          </Form.Item>
          <ImageUploadField slug={SLUG} field="who-we-are-photo" value={data.whoWeAre.photoUrl} onChange={url => set(['whoWeAre', 'photoUrl'], url)} label="Фото виробництва" />
        </Form>
      </Card>

      <Card title="Як ми працюємо" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Мітка секції">
                <Input value={data.howWeWork.sectionLabel} onChange={e => set(['howWeWork', 'sectionLabel'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Заголовок">
                <Input value={data.howWeWork.title} onChange={e => set(['howWeWork', 'title'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          {data.howWeWork.steps.map((step, i) => (
            <div key={i}>
              {i > 0 && <Divider style={{ margin: '8px 0' }} />}
              <Row gutter={16}>
                <Col span={4}><Form.Item label={`Крок ${i + 1} — №`}><Input value={step.num} onChange={e => set(['howWeWork', 'steps', String(i), 'num'], e.target.value)} /></Form.Item></Col>
                <Col span={8}><Form.Item label="Назва"><Input value={step.title} onChange={e => set(['howWeWork', 'steps', String(i), 'title'], e.target.value)} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Опис"><Input.TextArea rows={2} value={step.desc} onChange={e => set(['howWeWork', 'steps', String(i), 'desc'], e.target.value)} /></Form.Item></Col>
                <Col span={24}><Form.Item label="Примітка (необов'язково)"><Input value={step.note ?? ''} onChange={e => set(['howWeWork', 'steps', String(i), 'note'], e.target.value || null)} /></Form.Item></Col>
              </Row>
            </div>
          ))}
        </Form>
      </Card>

      <Card title="Чому обирають нас" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Мітка секції"><Input value={data.whyUs.sectionLabel} onChange={e => set(['whyUs', 'sectionLabel'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Заголовок"><Input value={data.whyUs.title} onChange={e => set(['whyUs', 'title'], e.target.value)} /></Form.Item></Col>
          </Row>
          {data.whyUs.items.map((item, i) => (
            <Row gutter={16} key={i}>
              <Col span={8}><Form.Item label={`Перевага ${i + 1} — назва`}><Input value={item.title} onChange={e => set(['whyUs', 'items', String(i), 'title'], e.target.value)} /></Form.Item></Col>
              <Col span={16}><Form.Item label="Опис"><Input.TextArea rows={2} value={item.desc} onChange={e => set(['whyUs', 'items', String(i), 'desc'], e.target.value)} /></Form.Item></Col>
            </Row>
          ))}
        </Form>
      </Card>

      <Card title="Часті запитання" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Мітка секції"><Input value={data.faq.sectionLabel} onChange={e => set(['faq', 'sectionLabel'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Заголовок"><Input value={data.faq.title} onChange={e => set(['faq', 'title'], e.target.value)} /></Form.Item></Col>
          </Row>
          {data.faq.items.map((item, i) => (
            <div key={i}>
              {i > 0 && <Divider style={{ margin: '8px 0' }} />}
              <Form.Item label={`Питання ${i + 1}`}><Input value={item.q} onChange={e => set(['faq', 'items', String(i), 'q'], e.target.value)} /></Form.Item>
              <Form.Item label="Відповідь"><Input.TextArea rows={3} value={item.a} onChange={e => set(['faq', 'items', String(i), 'a'], e.target.value)} /></Form.Item>
            </div>
          ))}
        </Form>
      </Card>

      <Card title="Контакти (на сторінці Про нас)" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Телефон (відображення)"><Input value={data.contacts.phone} onChange={e => set(['contacts', 'phone'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Телефон (href)"><Input value={data.contacts.phoneHref} onChange={e => set(['contacts', 'phoneHref'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Email"><Input value={data.contacts.email} onChange={e => set(['contacts', 'email'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Instagram handle"><Input value={data.contacts.instagramHandle} onChange={e => set(['contacts', 'instagramHandle'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Instagram href"><Input value={data.contacts.instagramHref} onChange={e => set(['contacts', 'instagramHref'], e.target.value)} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Години роботи"><Input value={data.contacts.businessHours} onChange={e => set(['contacts', 'businessHours'], e.target.value)} /></Form.Item></Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
