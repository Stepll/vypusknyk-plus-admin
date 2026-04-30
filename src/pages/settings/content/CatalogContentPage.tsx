import { useEffect, useState } from 'react'
import { App, Button, Card, Form, Input, Spin, Typography } from 'antd'
import { getPageContent, updatePageContent } from '../../../api/pageContent'

const SLUG = 'catalog'
const { Title } = Typography

interface CatalogContent {
  constructorPromo: { label: string; title: string; desc: string; buttonText: string; hint: string }
}

export default function CatalogContentPage() {
  const [data, setData] = useState<CatalogContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { message } = App.useApp()

  useEffect(() => {
    getPageContent<CatalogContent>(SLUG).then(setData).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const saved = await updatePageContent(SLUG, data)
      setData(saved as CatalogContent)
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
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Контент: Каталог</Title>
        <Button type="primary" onClick={save} loading={saving}>Зберегти всі зміни</Button>
      </div>

      <Card title="Блок промо конструктора (в каталозі)">
        <Form layout="vertical">
          <Form.Item label="Мітка (напр. «Новинка»)">
            <Input value={data.constructorPromo.label} onChange={e => set(['constructorPromo', 'label'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Заголовок">
            <Input value={data.constructorPromo.title} onChange={e => set(['constructorPromo', 'title'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Опис">
            <Input.TextArea rows={3} value={data.constructorPromo.desc} onChange={e => set(['constructorPromo', 'desc'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Текст кнопки">
            <Input value={data.constructorPromo.buttonText} onChange={e => set(['constructorPromo', 'buttonText'], e.target.value)} />
          </Form.Item>
          <Form.Item label="Підказка під кнопкою">
            <Input value={data.constructorPromo.hint} onChange={e => set(['constructorPromo', 'hint'], e.target.value)} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
