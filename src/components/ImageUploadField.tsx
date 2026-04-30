import { useState } from 'react'
import { Button, Image, Upload, App } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { uploadPageContentImage } from '../api/pageContent'

interface Props {
  slug: string
  field: string
  value: string | null | undefined
  onChange: (url: string) => void
  label?: string
}

export default function ImageUploadField({ slug, field, value, onChange, label }: Props) {
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  const handleUpload = async (file: File) => {
    setLoading(true)
    try {
      const url = await uploadPageContentImage(slug, field, file)
      onChange(url)
    } catch {
      message.error('Помилка завантаження')
    } finally {
      setLoading(false)
    }
    return false
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={{ fontWeight: 500 }}>{label}</span>}
      {value && (
        <Image src={value} width={200} style={{ borderRadius: 6, objectFit: 'cover' }} />
      )}
      <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/jpeg,image/png,image/webp">
        <Button icon={<UploadOutlined />} loading={loading}>
          {value ? 'Замінити фото' : 'Завантажити фото'}
        </Button>
      </Upload>
    </div>
  )
}
