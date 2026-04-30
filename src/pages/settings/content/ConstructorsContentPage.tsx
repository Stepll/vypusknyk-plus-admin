import { useEffect, useState } from 'react'
import { App, Button, Card, Col, Form, Input, Row, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'

const SLUG = 'constructors'
const { Title } = Typography

interface ConstructorsContent {
  hero: { title: string; subtitle: string }
  ribbon: { title: string; desc: string }
  medal: { title: string; desc: string }
  cert: { title: string; desc: string }
}

export default function ConstructorsContentPage() {
  const [data, setData] = useState<ConstructorsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<ConstructorsContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as ConstructorsContent)
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

  const constructorCards = [
    { key: 'ribbon', label: 'Стрічка' },
    { key: 'medal', label: 'Медаль' },
    { key: 'cert', label: 'Грамота' },
  ] as const

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Контент: Конструктори</Title>
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
              <Form.Item label="Підзаголовок">
                <Input.TextArea rows={2} value={data.hero.subtitle} onChange={e => set(['hero', 'subtitle'], e.target.value)} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {constructorCards.map(({ key, label }) => (
        <Card key={key} title={`Картка: ${label}`} style={{ marginBottom: 16 }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Назва">
                  <Input value={data[key].title} onChange={e => set([key, 'title'], e.target.value)} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="Опис">
                  <Input.TextArea rows={2} value={data[key].desc} onChange={e => set([key, 'desc'], e.target.value)} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ))}
    </div>
  )
}
