import { useEffect, useState } from 'react'
import {
  Button, Card, DatePicker, Divider, Form, Input, InputNumber,
  Select, Switch, Tag, message,
} from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { getAdminPromotion, createPromotion, updatePromotion } from '../../api/promotions'
import { getProductCategories } from '../../api/productCategories'
import type { AdminPromotionResponse, SavePromotionRequest, SaveVolumeTierRequest, SaveBundleItemRequest } from '../../api/promotions'
import type { ProductCategoryResponse, ProductSubcategoryResponse } from '../../api/types'

const { RangePicker } = DatePicker

interface VolumeTierRow {
  key: number
  minQty: number
  discountType: string
  discountValue: number
}

interface BundleItemRow {
  key: number
  subcategoryId: number
  requiredQty: number
}

export default function PromotionEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [promotion, setPromotion] = useState<AdminPromotionResponse | null>(null)
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [scope, setScope] = useState('Global')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([])
  const [volumeTiers, setVolumeTiers] = useState<VolumeTierRow[]>([])
  const [bundleItems, setBundleItems] = useState<BundleItemRow[]>([])
  const [tierKey, setTierKey] = useState(0)
  const [bundleKey, setBundleKey] = useState(0)
  const [form] = Form.useForm()

  // All subcategories across all selected categories for Volume scope
  const availableSubcategories: ProductSubcategoryResponse[] = categories.flatMap(c => c.subcategories)

  useEffect(() => {
    const init = async () => {
      const cats = await getProductCategories()
      setCategories(cats)

      if (!isNew) {
        let item: AdminPromotionResponse
        try {
          item = await getAdminPromotion(Number(id))
        } catch {
          message.error('Акцію не знайдено')
          navigate('/settings/promotions')
          return
        }
        setPromotion(item)
        setScope(item.scope)

        const catIds = [...new Set(item.targets.map(t => t.categoryId).filter((x): x is number => !!x))]
        const subcatIds = [...new Set(item.targets.map(t => t.subcategoryId).filter((x): x is number => !!x))]
        setSelectedCategoryIds(catIds)
        setSelectedSubcategoryIds(subcatIds)

        const tiers = item.volumeTiers.map((t, i) => ({ key: i, minQty: t.minQty, discountType: t.discountType, discountValue: t.discountValue }))
        setVolumeTiers(tiers)
        setTierKey(tiers.length)

        const bundles = item.bundleItems.map((b, i) => ({ key: i, subcategoryId: b.subcategoryId, requiredQty: b.requiredQty }))
        setBundleItems(bundles)
        setBundleKey(bundles.length)

        form.setFieldsValue({
          name: item.name,
          description: item.description,
          discountType: item.discountType,
          discountValue: item.discountValue,
          scope: item.scope,
          minOrderAmount: item.minOrderAmount,
          isActive: item.isActive,
          isOneTimePerUser: item.isOneTimePerUser,
          dateRange: item.startsAt || item.endsAt
            ? [item.startsAt ? dayjs(item.startsAt) : null, item.endsAt ? dayjs(item.endsAt) : null]
            : undefined,
        })
      } else {
        form.setFieldsValue({ isActive: true, discountType: 'Percentage', scope: 'Global' })
      }
      setLoading(false)
    }
    init()
  }, [])

  const addTier = () => {
    setVolumeTiers(prev => [...prev, { key: tierKey, minQty: 1, discountType: 'Percentage', discountValue: 5 }])
    setTierKey(k => k + 1)
  }

  const removeTier = (key: number) => setVolumeTiers(prev => prev.filter(t => t.key !== key))
  const updateTier = (key: number, field: keyof VolumeTierRow, value: unknown) =>
    setVolumeTiers(prev => prev.map(t => t.key === key ? { ...t, [field]: value } : t))

  const addBundle = () => {
    setBundleItems(prev => [...prev, { key: bundleKey, subcategoryId: 0, requiredQty: 1 }])
    setBundleKey(k => k + 1)
  }

  const removeBundle = (key: number) => setBundleItems(prev => prev.filter(b => b.key !== key))
  const updateBundle = (key: number, field: keyof BundleItemRow, value: unknown) =>
    setBundleItems(prev => prev.map(b => b.key === key ? { ...b, [field]: value } : b))

  const handleSave = async (values: Record<string, unknown>) => {
    if (scope === 'Volume' && volumeTiers.length === 0) {
      message.error("Додайте хоча б один ціновий поріг")
      return
    }
    if (scope === 'Bundle' && bundleItems.length < 2) {
      message.error("Комплект має містити мінімум 2 позиції")
      return
    }
    if (scope === 'Bundle' && bundleItems.some(b => !b.subcategoryId)) {
      message.error("Оберіть підкатегорію для кожної позиції комплекту")
      return
    }

    setSaving(true)
    try {
      const [start, end] = (values.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined) ?? [null, null]

      const req: SavePromotionRequest = {
        name: values.name as string,
        description: values.description as string | undefined,
        discountType: values.discountType as string,
        discountValue: values.discountValue as number,
        scope,
        targetCategoryIds: selectedCategoryIds,
        targetSubcategoryIds: selectedSubcategoryIds,
        volumeTiers: volumeTiers.map(t => ({
          minQty: t.minQty,
          discountType: t.discountType,
          discountValue: t.discountValue,
        }) as SaveVolumeTierRequest),
        bundleItems: bundleItems.map(b => ({
          subcategoryId: b.subcategoryId,
          requiredQty: b.requiredQty,
        }) as SaveBundleItemRequest),
        minOrderAmount: values.minOrderAmount as number | undefined,
        startsAt: start?.toISOString(),
        endsAt: end?.toISOString(),
        isActive: values.isActive as boolean,
        isOneTimePerUser: values.isOneTimePerUser as boolean,
      }

      if (isNew) {
        await createPromotion(req)
        message.success('Акцію створено')
      } else {
        await updatePromotion(Number(id), req)
        message.success('Акцію оновлено')
      }
      navigate('/settings/promotions')
    } catch {
      message.error('Помилка при збереженні')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  const scopeNeedsTargets = scope === 'Category' || scope === 'Volume'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/promotions')} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            {isNew ? 'Нова акція' : `Редагувати акцію${promotion ? ` — ${promotion.name}` : ''}`}
          </h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Автоматична знижка застосовується при оформленні</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Card style={{ marginBottom: 16 }}>
          <Form.Item label="Назва акції" name="name" rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="Весняний розпродаж" />
          </Form.Item>

          <Form.Item label="Опис (необов'язково)" name="description">
            <Input.TextArea rows={2} placeholder="Короткий опис умов акції" />
          </Form.Item>

          <Form.Item label="Тип акції" name="scope" initialValue="Global" style={{ marginBottom: 0 }}>
            <Select
              onChange={v => {
                setScope(v)
                setSelectedCategoryIds([])
                setSelectedSubcategoryIds([])
                setVolumeTiers([])
                setBundleItems([])
              }}
              options={[
                { value: 'Global', label: 'Глобальна — знижка на все замовлення' },
                { value: 'Category', label: "Категорія — знижка на товари обраних категорій" },
                { value: 'Volume', label: "Об'ємна — знижка залежить від кількості одиниць" },
                { value: 'Bundle', label: 'Комплект — знижка при купівлі набору підкатегорій' },
              ]}
            />
          </Form.Item>

          {scope === 'Global' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', fontSize: 13, color: '#389e0d' }}>
              Знижка застосовується до всього замовлення незалежно від складу
            </div>
          )}
        </Card>

        {scopeNeedsTargets && (
          <Card title="Цільові категорії" style={{ marginBottom: 16 }}>
            <Form.Item label="Категорії товарів">
              <Select
                mode="multiple"
                placeholder="Оберіть категорії"
                value={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
            <Form.Item label="Підкатегорії" style={{ marginBottom: 0 }}>
              <Select
                mode="multiple"
                placeholder="Оберіть підкатегорії (необов'язково)"
                value={selectedSubcategoryIds}
                onChange={setSelectedSubcategoryIds}
                options={availableSubcategories.map(s => ({
                  value: s.id,
                  label: `${categories.find(c => c.id === s.categoryId)?.name} / ${s.name}`,
                }))}
              />
            </Form.Item>
            <div style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>
              Якщо обрано підкатегорії — знижка діє тільки на них. Якщо тільки категорії — на всі товари в них.
            </div>
          </Card>
        )}

        {scope === 'Volume' && (
          <Card
            title="Цінові пороги"
            style={{ marginBottom: 16 }}
            extra={
              <Button size="small" icon={<PlusOutlined />} onClick={addTier}>
                Додати поріг
              </Button>
            }
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 12 }}>
              Знижка активується коли сумарна кількість товарів з обраних категорій досягає порогу
            </div>
            {volumeTiers.length === 0 && (
              <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '16px 0' }}>Немає порогів — додайте хоча б один</div>
            )}
            {volumeTiers.map((tier, idx) => (
              <div key={tier.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <Tag color="blue" style={{ flexShrink: 0 }}>#{idx + 1}</Tag>
                <InputNumber
                  min={1}
                  value={tier.minQty}
                  onChange={v => updateTier(tier.key, 'minQty', v ?? 1)}
                  addonBefore="від"
                  addonAfter="шт."
                  style={{ width: 160 }}
                />
                <Select
                  value={tier.discountType}
                  onChange={v => updateTier(tier.key, 'discountType', v)}
                  options={[
                    { value: 'Percentage', label: '%' },
                    { value: 'FixedAmount', label: '₴' },
                  ]}
                  style={{ width: 80 }}
                />
                <InputNumber
                  min={0.01}
                  value={tier.discountValue}
                  onChange={v => updateTier(tier.key, 'discountValue', v ?? 0)}
                  placeholder="0"
                  style={{ width: 100 }}
                />
                <Button
                  type="text" danger size="small" icon={<DeleteOutlined />}
                  onClick={() => removeTier(tier.key)}
                />
              </div>
            ))}
          </Card>
        )}

        {scope === 'Bundle' && (
          <Card
            title="Склад комплекту"
            style={{ marginBottom: 16 }}
            extra={
              <Button size="small" icon={<PlusOutlined />} onClick={addBundle}>
                Додати позицію
              </Button>
            }
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 12 }}>
              Знижка діє на товари комплекту коли клієнт замовляє всі перелічені позиції в потрібній кількості
            </div>
            {bundleItems.length === 0 && (
              <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '16px 0' }}>Немає позицій — додайте мінімум 2</div>
            )}
            {bundleItems.map((item, idx) => (
              <div key={item.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <Tag color="purple" style={{ flexShrink: 0 }}>#{idx + 1}</Tag>
                <Select
                  value={item.subcategoryId || undefined}
                  onChange={v => updateBundle(item.key, 'subcategoryId', v)}
                  placeholder="Підкатегорія"
                  style={{ flex: 1 }}
                  showSearch
                  filterOption={(input, opt) =>
                    (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableSubcategories.map(s => ({
                    value: s.id,
                    label: `${categories.find(c => c.id === s.categoryId)?.name} / ${s.name}`,
                  }))}
                />
                <InputNumber
                  min={1}
                  value={item.requiredQty}
                  onChange={v => updateBundle(item.key, 'requiredQty', v ?? 1)}
                  addonBefore="×"
                  style={{ width: 110 }}
                />
                <Button
                  type="text" danger size="small" icon={<DeleteOutlined />}
                  onClick={() => removeBundle(item.key)}
                />
              </div>
            ))}
            {bundleItems.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#f9f0ff', borderRadius: 8, fontSize: 12, color: '#722ed1' }}>
                Приклад: {bundleItems.map(b => {
                  const sub = availableSubcategories.find(s => s.id === b.subcategoryId)
                  return sub ? `${b.requiredQty}×${sub.name}` : null
                }).filter(Boolean).join(' + ') || '—'}
              </div>
            )}

            <Divider style={{ margin: '16px 0 12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Тип знижки на комплект</div>
                <Form.Item name="discountType" initialValue="Percentage" noStyle>
                  <Select
                    style={{ width: '100%' }}
                    options={[
                      { value: 'Percentage', label: 'Відсоток (%)' },
                      { value: 'FixedAmount', label: 'Фіксована (₴)' },
                    ]}
                  />
                </Form.Item>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Розмір знижки</div>
                <Form.Item name="discountValue" noStyle rules={[{ required: true, message: '' }]}>
                  <InputNumber min={0.01} style={{ width: '100%' }} placeholder="10" />
                </Form.Item>
              </div>
            </div>
          </Card>
        )}

        {scope !== 'Bundle' && (
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
            <Form.Item label="Мінімальна сума замовлення (₴)" name="minOrderAmount" style={{ marginBottom: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Без обмежень" />
            </Form.Item>
          </Card>
        )}

        {scope === 'Bundle' && (
          <Card title="Додаткові умови" style={{ marginBottom: 16 }}>
            <Form.Item label="Мінімальна сума замовлення (₴)" name="minOrderAmount" style={{ marginBottom: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Без обмежень" />
            </Form.Item>
          </Card>
        )}

        <Card title="Розклад та активність" style={{ marginBottom: 24 }}>
          <Form.Item label="Термін дії" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder={['Початок (необов\'язково)', 'Кінець (необов\'язково)']}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 32 }}>
            <Form.Item label="Активна" name="isActive" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item label="Одноразова для юзера" name="isOneTimePerUser" valuePropName="checked" initialValue={false} style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/settings/promotions')}>Скасувати</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {isNew ? 'Створити акцію' : 'Зберегти зміни'}
          </Button>
        </div>
      </Form>
    </div>
  )
}
