import { useEffect, useState } from 'react'
import {
  Button, Card, ColorPicker, DatePicker, Form, Input, InputNumber,
  Select, Switch, message,
} from 'antd'
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { getAdminPromoCodes, createPromoCode, updatePromoCode } from '../../api/promotions'
import type { AdminPromoCodeResponse, SavePromoCodeRequest } from '../../api/promotions'

const { RangePicker } = DatePicker

const PRESET_COLORS = [
  '#FF6B9D', '#E91E8C', '#D6336C', '#C2185B',
  '#FF8C42', '#F59E0B', '#22C55E', '#3B82F6',
  '#7C3AED', '#EC4899', '#0EA5E9', '#6366F1',
]

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function CardPreview({ color, displayName, discountType, discountValue, description, endsAt }: {
  color: string
  displayName: string
  discountType: string
  discountValue?: number
  description?: string
  endsAt?: string
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      borderRadius: 12,
      padding: '20px 24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${color}66`,
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: -10, width: 80, height: 80,
        borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
      }} />
      <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
        Випускник+
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        {displayName || 'Назва акції'}
      </div>
      {discountValue ? (
        <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.95 }}>
          {discountType === 'Percentage' ? `−${discountValue}%` : `−${discountValue} ₴`} на замовлення
        </div>
      ) : null}
      {description ? (
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{description}</div>
      ) : null}
      {endsAt ? (
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
          до {new Date(endsAt).toLocaleDateString('uk-UA')}
        </div>
      ) : null}
    </div>
  )
}

export default function PromoCodeEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [promoCode, setPromoCode] = useState<AdminPromoCodeResponse | null>(null)
  const [cardColor, setCardColor] = useState('#FF6B9D')
  const [previewData, setPreviewData] = useState({
    displayName: '', discountType: 'Percentage',
    discountValue: undefined as number | undefined, description: '', endsAt: '',
  })
  const [form] = Form.useForm()

  const syncPreview = () => {
    const vals = form.getFieldsValue()
    const dateRange = vals.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined
    setPreviewData({
      displayName: vals.displayName || '',
      discountType: vals.discountType || 'Percentage',
      discountValue: vals.discountValue,
      description: vals.description || '',
      endsAt: dateRange?.[1]?.toISOString() || '',
    })
  }

  useEffect(() => {
    const init = async () => {
      if (!isNew) {
        const items = await getAdminPromoCodes()
        const item = items.find(p => p.id === Number(id))
        if (!item) {
          message.error('Промокод не знайдено')
          navigate('/settings/promo-codes')
          return
        }
        setPromoCode(item)
        setCardColor(item.cardColor)
        form.setFieldsValue({
          code: item.code,
          displayName: item.displayName,
          description: item.description,
          discountType: item.discountType,
          discountValue: item.discountValue,
          minOrderAmount: item.minOrderAmount,
          maxUsages: item.maxUsages,
          isOneTimePerUser: item.isOneTimePerUser,
          isActive: item.isActive,
          dateRange: item.startsAt || item.endsAt
            ? [item.startsAt ? dayjs(item.startsAt) : null, item.endsAt ? dayjs(item.endsAt) : null]
            : undefined,
        })
        setPreviewData({
          displayName: item.displayName,
          discountType: item.discountType,
          discountValue: item.discountValue,
          description: item.description || '',
          endsAt: item.endsAt || '',
        })
      } else {
        form.setFieldsValue({ isActive: true, discountType: 'Percentage' })
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      const [start, end] = (values.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined) ?? [null, null]
      const req: SavePromoCodeRequest = {
        code: (values.code as string).trim().toUpperCase(),
        displayName: values.displayName as string,
        cardColor,
        description: values.description as string | undefined,
        discountType: values.discountType as string,
        discountValue: values.discountValue as number,
        minOrderAmount: values.minOrderAmount as number | undefined,
        maxUsages: values.maxUsages as number | undefined,
        isOneTimePerUser: (values.isOneTimePerUser as boolean) ?? false,
        startsAt: start?.toISOString(),
        endsAt: end?.toISOString(),
        isActive: values.isActive as boolean,
      }
      if (isNew) {
        await createPromoCode(req)
        message.success('Промокод створено')
      } else {
        await updatePromoCode(Number(id), req)
        message.success('Промокод оновлено')
      }
      navigate('/settings/promo-codes')
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Помилка при збереженні')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/promo-codes')} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            {isNew ? 'Новий промокод' : `Редагувати${promoCode ? ` — ${promoCode.displayName}` : ''}`}
          </h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Картка знижки яку юзер активує та зберігає у себе</p>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardPreview
          color={cardColor}
          displayName={previewData.displayName}
          discountType={previewData.discountType}
          discountValue={previewData.discountValue}
          description={previewData.description}
          endsAt={previewData.endsAt}
        />
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={syncPreview}>
        <Card title="Інформація про картку" style={{ marginBottom: 16 }}>
          <Form.Item label="Назва картки (бачить юзер)" name="displayName" rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="Весняна знижка" />
          </Form.Item>

          <Form.Item label="Код (прихований від юзера)" name="code" rules={[{ required: true, message: 'Введіть код' }]}>
            <Input
              placeholder="SPRING2025"
              style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}
              addonAfter={
                <Button
                  type="text" size="small" icon={<ReloadOutlined />}
                  onClick={() => form.setFieldValue('code', generateCode())}
                  style={{ height: 20, padding: '0 4px' }}
                />
              }
            />
          </Form.Item>

          <Form.Item label="Опис (необов'язково)" name="description" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Необов'язковий опис для картки" />
          </Form.Item>
        </Card>

        <Card title="Колір картки" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {PRESET_COLORS.map(color => (
              <div
                key={color}
                onClick={() => { setCardColor(color); syncPreview() }}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  cursor: 'pointer',
                  border: cardColor === color ? '3px solid #1677ff' : '3px solid transparent',
                  outline: cardColor === color ? `2px solid ${color}` : 'none',
                  outlineOffset: 2, transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
          <ColorPicker
            value={cardColor}
            onChange={c => { setCardColor(c.toHexString()); syncPreview() }}
            showText
          />
        </Card>

        <Card title="Умови знижки" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item label="Тип знижки" name="discountType" initialValue="Percentage">
              <Select options={[
                { value: 'Percentage', label: 'Відсоток (%)' },
                { value: 'FixedAmount', label: 'Фіксована сума (₴)' },
              ]} />
            </Form.Item>
            <Form.Item label="Розмір знижки" name="discountValue" rules={[{ required: true, message: 'Введіть розмір' }]}>
              <InputNumber min={0.01} style={{ width: '100%' }} placeholder="10" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
            <Form.Item label="Мін. сума (₴)" name="minOrderAmount" style={{ marginBottom: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Без обмежень" />
            </Form.Item>
            <Form.Item label="Ліміт використань" name="maxUsages" style={{ marginBottom: 0 }}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Безліміт" />
            </Form.Item>
          </div>
        </Card>

        <Card title="Розклад та активність" style={{ marginBottom: 24 }}>
          <Form.Item label="Термін дії" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder={['Початок', 'Кінець']}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 32 }}>
            <Form.Item label="Активний" name="isActive" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item label="Один раз на юзера" name="isOneTimePerUser" valuePropName="checked" initialValue={false} style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/settings/promo-codes')}>Скасувати</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isNew ? 'Створити промокод' : 'Зберегти зміни'}
          </Button>
        </div>
      </Form>
    </div>
  )
}
