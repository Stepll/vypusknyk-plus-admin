import { useEffect, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Switch, message } from 'antd'
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getAdminTasks, createTask, updateTask,
  TASK_TYPE_LABELS, TASK_TYPE_WITH_TARGET, TASK_TYPE_NEEDS_CATEGORY,
} from '../../api/tasks'
import type { AdminTaskResponse, SaveTaskRequest } from '../../api/tasks'
import { getAdminPromoCodes } from '../../api/promotions'
import type { AdminPromoCodeResponse } from '../../api/promotions'
import { getProductCategories } from '../../api/productCategories'
import type { ProductCategoryResponse } from '../../api/types'

const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export default function TaskEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [task, setTask] = useState<AdminTaskResponse | null>(null)
  const [promoCodes, setPromoCodes] = useState<AdminPromoCodeResponse[]>([])
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [taskType, setTaskType] = useState<string>('Registration')
  const [form] = Form.useForm()

  useEffect(() => {
    const init = async () => {
      const [codes, cats] = await Promise.all([
        getAdminPromoCodes(),
        getProductCategories(),
      ])
      setPromoCodes(codes)
      setCategories(cats)

      if (!isNew) {
        const tasks = await getAdminTasks()
        const found = tasks.find(t => t.id === Number(id))
        if (!found) {
          message.error('Завдання не знайдено')
          navigate('/settings/tasks')
          return
        }
        setTask(found)
        setTaskType(found.taskType)
        form.setFieldsValue({
          name: found.name,
          description: found.description,
          taskType: found.taskType,
          targetValue: found.targetValue,
          targetCategoryId: found.targetCategoryId,
          rewardPromoCodeId: found.rewardPromoCodeId,
          isVisibleToGuests: found.isVisibleToGuests,
          isActive: found.isActive,
          sortOrder: found.sortOrder,
          endsAt: found.endsAt ? dayjs(found.endsAt) : undefined,
        })
      } else {
        form.setFieldsValue({
          taskType: 'Registration',
          targetValue: 1,
          isVisibleToGuests: false,
          isActive: true,
          sortOrder: 0,
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      const req: SaveTaskRequest = {
        name: values.name as string,
        description: values.description as string | undefined,
        taskType: values.taskType as string,
        targetValue: values.targetValue as number,
        targetCategoryId: values.targetCategoryId as number | undefined,
        rewardPromoCodeId: values.rewardPromoCodeId as number,
        isVisibleToGuests: (values.isVisibleToGuests as boolean) ?? false,
        endsAt: (values.endsAt as dayjs.Dayjs | undefined)?.toISOString(),
        isActive: values.isActive as boolean,
        sortOrder: (values.sortOrder as number) ?? 0,
      }

      if (!TASK_TYPE_NEEDS_CATEGORY.has(req.taskType)) {
        req.targetCategoryId = undefined
      }

      if (isNew) {
        await createTask(req)
        message.success('Завдання створено')
      } else {
        await updateTask(Number(id), req)
        message.success('Завдання оновлено')
      }
      navigate('/settings/tasks')
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Помилка при збереженні')
    } finally {
      setSaving(false)
    }
  }

  const showTarget = taskType in TASK_TYPE_WITH_TARGET
  const needsCategory = TASK_TYPE_NEEDS_CATEGORY.has(taskType)
  const targetUnit = TASK_TYPE_WITH_TARGET[taskType]

  if (loading) return null

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/settings/tasks')} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
            {isNew ? 'Нове завдання' : `Редагувати${task ? ` — ${task.name}` : ''}`}
          </h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
            Місія для юзера, виконання якої автоматично видає промокод
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Card title="Основне" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Назва завдання"
            name="name"
            rules={[{ required: true, message: "Введіть назву" }]}
          >
            <Input placeholder="Зроби перше замовлення" />
          </Form.Item>

          <Form.Item label="Опис (необов'язково)" name="description">
            <Input.TextArea rows={2} placeholder="Необов'язковий опис завдання" />
          </Form.Item>

          <Form.Item label="Порядок сортування" name="sortOrder" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Card>

        <Card title="Тип та умова" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Тип завдання"
            name="taskType"
            rules={[{ required: true }]}
          >
            <Select
              options={TASK_TYPE_OPTIONS}
              onChange={val => {
                setTaskType(val)
                if (!TASK_TYPE_WITH_TARGET[val]) {
                  form.setFieldValue('targetValue', 1)
                }
                if (!TASK_TYPE_NEEDS_CATEGORY.has(val)) {
                  form.setFieldValue('targetCategoryId', undefined)
                }
              }}
            />
          </Form.Item>

          {showTarget && (
            <Form.Item
              label={`Цільове значення (${targetUnit})`}
              name="targetValue"
              rules={[{ required: true, message: 'Введіть значення' }]}
            >
              <InputNumber
                min={0.01}
                step={needsCategory ? 1 : undefined}
                precision={needsCategory ? 0 : 2}
                style={{ width: '100%' }}
                addonAfter={targetUnit}
              />
            </Form.Item>
          )}

          {needsCategory && (
            <Form.Item
              label="Категорія товарів"
              name="targetCategoryId"
              rules={[{ required: true, message: 'Виберіть категорію' }]}
            >
              <Select
                placeholder="Виберіть категорію"
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          )}
        </Card>

        <Card title="Нагорода" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Промокод (картка)"
            name="rewardPromoCodeId"
            rules={[{ required: true, message: 'Виберіть промокод' }]}
          >
            <Select
              placeholder="Виберіть промокод-нагороду"
              optionRender={option => {
                const code = promoCodes.find(c => c.id === option.value)
                if (!code) return option.label
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: code.cardColor, flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 500 }}>{code.displayName}</span>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                      {code.discountType === 'Percentage'
                        ? `${code.discountValue}%`
                        : `${code.discountValue} ₴`}
                    </span>
                    {!code.code && (
                      <span style={{ color: '#faad14', fontSize: 11 }}>без коду</span>
                    )}
                  </div>
                )
              }}
              options={promoCodes.map(c => ({
                value: c.id,
                label: c.displayName,
              }))}
            />
          </Form.Item>
        </Card>

        <Card title="Розклад та видимість" style={{ marginBottom: 24 }}>
          <Form.Item label="Дедлайн (необов'язково)" name="endsAt">
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder="Без дедлайну"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 32 }}>
            <Form.Item
              label="Активне"
              name="isActive"
              valuePropName="checked"
              initialValue={true}
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Видно гостям"
              name="isVisibleToGuests"
              valuePropName="checked"
              initialValue={false}
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/settings/tasks')}>Скасувати</Button>
          <Button type="primary" htmlType="submit" loading={saving} icon={<TrophyOutlined />}>
            {isNew ? 'Створити завдання' : 'Зберегти зміни'}
          </Button>
        </div>
      </Form>
    </div>
  )
}
