import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'
import ImageUploadField from '../../../components/ImageUploadField'

const SLUG = 'home'
const { Title } = Typography

interface HomeContent {
  hero: { title: string; titleAccent: string; subtitle: string; button1Text: string; button2Text: string }
  stats: { value: number; suffix: string; label: string }[]
  howItWorks: { sectionLabel: string; sectionTitle: string; steps: { step: string; title: string; desc: string }[] }
  gallery: { sectionLabel: string; sectionTitle: string; items: { label: string; imageUrl: string | null }[] }
  banner: { title: string; subtitle: string; buttonText: string }
  testimonials: { sectionLabel: string; sectionTitle: string; items: { name: string; role: string; text: string }[] }
}

export default function HomeContentPage() {
  const [data, setData] = useState<HomeContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<HomeContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as HomeContent)
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
        <Title level={4} style={{ margin: 0 }}>Контент: Головна</Title>
        <Button type="primary" onClick={save} loading={saving}>Зберегти всі зміни</Button>
      </div>

      <Card title="Hero-секція" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Заголовок">
                <Input value={data.hero.title} onChange={e => set(['hero', 'title'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Акцент заголовку">
                <Input value={data.hero.titleAccent} onChange={e => set(['hero', 'titleAccent'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Підзаголовок">
            <Input.TextArea rows={2} value={data.hero.subtitle} onChange={e => set(['hero', 'subtitle'], e.target.value)} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Кнопка 1">
                <Input value={data.hero.button1Text} onChange={e => set(['hero', 'button1Text'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Кнопка 2">
                <Input value={data.hero.button2Text} onChange={e => set(['hero', 'button2Text'], e.target.value)} />
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

      <Card title="Як це працює" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Мітка секції">
                <Input value={data.howItWorks.sectionLabel} onChange={e => set(['howItWorks', 'sectionLabel'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Заголовок секції">
                <Input value={data.howItWorks.sectionTitle} onChange={e => set(['howItWorks', 'sectionTitle'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          {data.howItWorks.steps.map((step, i) => (
            <div key={i}>
              {i > 0 && <Divider style={{ margin: '8px 0' }} />}
              <Row gutter={16}>
                <Col span={4}>
                  <Form.Item label={`Крок ${i + 1} — номер`}>
                    <Input value={step.step} onChange={e => set(['howItWorks', 'steps', String(i), 'step'], e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Назва">
                    <Input value={step.title} onChange={e => set(['howItWorks', 'steps', String(i), 'title'], e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Опис">
                    <Input.TextArea rows={2} value={step.desc} onChange={e => set(['howItWorks', 'steps', String(i), 'desc'], e.target.value)} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
        </Form>
      </Card>

      <Card title="Галерея" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Мітка секції">
                <Input value={data.gallery.sectionLabel} onChange={e => set(['gallery', 'sectionLabel'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Заголовок секції">
                <Input value={data.gallery.sectionTitle} onChange={e => set(['gallery', 'sectionTitle'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {data.gallery.items.map((item, i) => (
              <Col span={8} key={i} style={{ marginBottom: 16 }}>
                <Form.Item label={`Фото ${i + 1} — підпис`}>
                  <Input value={item.label} onChange={e => set(['gallery', 'items', String(i), 'label'], e.target.value)} />
                </Form.Item>
                <ImageUploadField
                  slug={SLUG}
                  field={`gallery-${i}`}
                  value={item.imageUrl}
                  onChange={url => set(['gallery', 'items', String(i), 'imageUrl'], url)}
                />
              </Col>
            ))}
          </Row>
        </Form>
      </Card>

      <Card title="Банер" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Заголовок">
            <Input value={data.banner.title} onChange={e => set(['banner', 'title'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Підзаголовок">
            <Input.TextArea rows={2} value={data.banner.subtitle} onChange={e => set(['banner', 'subtitle'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Кнопка">
            <Input value={data.banner.buttonText} onChange={e => set(['banner', 'buttonText'], e.target.value)} />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Відгуки" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Мітка секції">
                <Input value={data.testimonials.sectionLabel} onChange={e => set(['testimonials', 'sectionLabel'], e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Заголовок секції">
                <Input value={data.testimonials.sectionTitle} onChange={e => set(['testimonials', 'sectionTitle'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
          {data.testimonials.items.map((t, i) => (
            <div key={i}>
              {i > 0 && <Divider style={{ margin: '8px 0' }} />}
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label={`Відгук ${i + 1} — ім'я`}>
                    <Input value={t.name} onChange={e => set(['testimonials', 'items', String(i), 'name'], e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Посада">
                    <Input value={t.role} onChange={e => set(['testimonials', 'items', String(i), 'role'], e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Текст відгуку">
                    <Input.TextArea rows={3} value={t.text} onChange={e => set(['testimonials', 'items', String(i), 'text'], e.target.value)} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
        </Form>
      </Card>
    </div>
  )
}
