import { useEffect, useMemo, useState } from 'react'
import {
  Table, Button, Drawer, Tabs, Form, Switch, Space, Typography,
  Tag, Spin, message, Select, Input, Divider,
} from 'antd'
import { EditOutlined, MailOutlined, SendOutlined, BellOutlined, PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getTriggerConfigs, updateTriggerConfig, getNotificationRecipients,
  type NotificationTriggerConfigResponse, type UpdateNotificationTriggerConfigRequest,
  type NotificationAdminRecipientDto,
} from '../../api/notifications'
import { getOrderStatuses } from '../../api/orderStatuses'
import type { OrderStatusResponse } from '../../api/types'

type AdminOption = NotificationAdminRecipientDto

interface TableRow {
  key: string
  triggerType: string
  displayName: string
  config?: NotificationTriggerConfigResponse
  children?: TableRow[]
}

const TRIGGER_VARS: Record<string, { key: string; label: string }[]> = {
  new_order: [
    { key: 'orderNumber', label: 'Номер замовлення' },
    { key: 'orderUrl', label: 'Посилання на замовлення' },
    { key: 'customerName', label: "Ім'я клієнта" },
    { key: 'customerPhone', label: 'Телефон' },
    { key: 'customerEmail', label: 'Email клієнта' },
    { key: 'total', label: 'Сума' },
    { key: 'itemCount', label: 'К-сть позицій' },
    { key: 'deliveryCity', label: 'Місто доставки' },
    { key: 'deliveryMethod', label: 'Метод доставки' },
    { key: 'paymentMethod', label: 'Метод оплати' },
    { key: 'comment', label: 'Коментар' },
  ],
  order_status_changed: [
    { key: 'orderNumber', label: 'Номер замовлення' },
    { key: 'orderUrl', label: 'Посилання на замовлення' },
    { key: 'statusName', label: 'Новий статус' },
    { key: 'previousStatus', label: 'Попередній статус' },
    { key: 'customerName', label: "Ім'я клієнта" },
    { key: 'customerPhone', label: 'Телефон' },
    { key: 'customerEmail', label: 'Email клієнта' },
    { key: 'total', label: 'Сума' },
    { key: 'deliveryCity', label: 'Місто доставки' },
    { key: 'deliveryMethod', label: 'Метод доставки' },
    { key: 'adminName', label: 'Адмін' },
  ],
  new_user: [
    { key: 'fullName', label: "Ім'я" },
    { key: 'userUrl', label: 'Посилання на користувача' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Телефон' },
    { key: 'registrationDate', label: 'Дата реєстрації' },
  ],
}

function getVarsForTrigger(triggerType: string) {
  if (triggerType.startsWith('order_status_changed'))
    return TRIGGER_VARS.order_status_changed
  return TRIGGER_VARS[triggerType] ?? []
}

// ── Metadata table ────────────────────────────────────────────────────────────

function MetadataTable({ triggerType }: { triggerType: string }) {
  const vars = getVarsForTrigger(triggerType)
  if (vars.length === 0) return null

  const copyVar = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`)
    message.success(`Скопійовано {{${key}}}`)
  }

  return (
    <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        Доступні змінні для шаблонів:
      </Typography.Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {vars.map(v => (
          <Tag
            key={v.key}
            style={{ cursor: 'pointer', fontSize: 12 }}
            icon={<CopyOutlined />}
            onClick={() => copyVar(v.key)}
          >
            {`{{${v.key}}}`} — {v.label}
          </Tag>
        ))}
      </div>
    </div>
  )
}

// ── System Tab ────────────────────────────────────────────────────────────────

function SystemTab({ form, admins, triggerKey }: { form: ReturnType<typeof Form.useForm>[0]; admins: AdminOption[]; triggerKey: string }) {
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    setSelected(form.getFieldValue('systemAdminIds') ?? [])
  }, [triggerKey])

  const update = (next: number[]) => { setSelected(next); form.setFieldValue('systemAdminIds', next) }
  const remove = (id: number) => update(selected.filter(i => i !== id))
  const add = (id: number) => { if (id && !selected.includes(id)) update([...selected, id]) }

  const selectedAdmins = admins.filter(a => selected.includes(a.id))
  const availableAdmins = admins.filter(a => !selected.includes(a.id))

  return (
    <div>
      <Form.Item name="systemEnabled" valuePropName="checked" label="Активовано">
        <Switch />
      </Form.Item>
      <Form.Item label={`Отримувачі (${selectedAdmins.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {selectedAdmins.map(admin => (
            <div key={admin.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', border: '1px solid #e8e8e8', borderRadius: 8, background: '#fafafa',
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{admin.fullName}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{admin.email}</div>
              </div>
              <Button icon={<DeleteOutlined />} type="text" danger size="small" onClick={() => remove(admin.id)} />
            </div>
          ))}
          {selectedAdmins.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>Немає отримувачів</Typography.Text>
          )}
        </div>
        {availableAdmins.length > 0 && (
          <Select
            placeholder="Додати адміна..."
            style={{ width: '100%' }}
            value={null}
            onChange={(id: number) => add(id)}
            options={availableAdmins.map(a => ({ value: a.id, label: `${a.fullName} (${a.email})` }))}
          />
        )}
      </Form.Item>
      <Divider style={{ fontSize: 13, color: '#8c8c8c', margin: '16px 0 12px' }}>Шаблон повідомлення</Divider>
      <Form.Item name="systemTitle" label="Заголовок">
        <Input placeholder="Наприклад: Нове замовлення #{{orderNumber}}" />
      </Form.Item>
      <Form.Item name="systemMessage" label="Текст">
        <Input.TextArea rows={3} placeholder="Наприклад: від {{customerName}}, сума {{total}} грн" />
      </Form.Item>
    </div>
  )
}

// ── Email Tab ─────────────────────────────────────────────────────────────────

function EmailTab({ form, triggerKey }: { form: ReturnType<typeof Form.useForm>[0]; triggerKey: string }) {
  const [newEmail, setNewEmail] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])

  useEffect(() => {
    setRecipients(form.getFieldValue('emailRecipients') ?? [])
  }, [triggerKey])

  const update = (next: string[]) => {
    setRecipients(next)
    form.setFieldValue('emailRecipients', next)
  }

  const add = () => {
    const trimmed = newEmail.trim()
    if (!trimmed || recipients.includes(trimmed)) return
    update([...recipients, trimmed])
    setNewEmail('')
  }

  return (
    <div>
      <Form.Item name="emailEnabled" valuePropName="checked" label="Активовано">
        <Switch />
      </Form.Item>
      <Form.Item label={`Отримувачі (${recipients.length})`}>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <input
            className="ant-input"
            placeholder="email@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            style={{ flex: 1, padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '6px 0 0 6px', outline: 'none', fontSize: 14 }}
          />
          <Button icon={<PlusOutlined />} onClick={add}>Додати</Button>
        </Space.Compact>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {recipients.map(email => (
            <Tag key={email} closable onClose={() => update(recipients.filter(e => e !== email))} icon={<MailOutlined />}>
              {email}
            </Tag>
          ))}
          {recipients.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>Немає отримувачів</Typography.Text>
          )}
        </div>
      </Form.Item>
      <Divider style={{ fontSize: 13, color: '#8c8c8c', margin: '16px 0 12px' }}>Шаблон листа</Divider>
      <Form.Item name="emailSubject" label="Тема">
        <Input placeholder="Наприклад: Нове замовлення #{{orderNumber}}" />
      </Form.Item>
      <Form.Item name="emailMessage" label="Текст">
        <Input.TextArea rows={5} placeholder="Наприклад: Клієнт {{customerName}} оформив замовлення на {{total}} грн." />
      </Form.Item>
    </div>
  )
}

// ── Telegram Tab ──────────────────────────────────────────────────────────────

function TelegramTab({ form, triggerKey }: { form: ReturnType<typeof Form.useForm>[0]; triggerKey: string }) {
  const [newId, setNewId] = useState('')
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(form.getFieldValue('telegramUserIds') ?? [])
  }, [triggerKey])

  const update = (next: string[]) => {
    setIds(next)
    form.setFieldValue('telegramUserIds', next)
  }

  const add = () => {
    const trimmed = newId.trim()
    if (!trimmed || ids.includes(trimmed)) return
    update([...ids, trimmed])
    setNewId('')
  }

  return (
    <div>
      <Form.Item name="telegramEnabled" valuePropName="checked" label="Активовано">
        <Switch />
      </Form.Item>
      <Form.Item name="telegramGroupEnabled" valuePropName="checked" label="Спільна група">
        <Switch />
      </Form.Item>
      <Form.Item label={`User ID (${ids.length})`}>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <input
            className="ant-input"
            placeholder="123456789"
            value={newId}
            onChange={e => setNewId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            style={{ flex: 1, padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '6px 0 0 6px', outline: 'none', fontSize: 14 }}
          />
          <Button icon={<PlusOutlined />} onClick={add}>Додати</Button>
        </Space.Compact>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ids.map(id => (
            <Tag key={id} closable color="blue" onClose={() => update(ids.filter(i => i !== id))} icon={<SendOutlined />}>
              {id}
            </Tag>
          ))}
          {ids.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>Немає ID</Typography.Text>
          )}
        </div>
      </Form.Item>
      <Divider style={{ fontSize: 13, color: '#8c8c8c', margin: '16px 0 12px' }}>Шаблон повідомлення</Divider>
      <Form.Item name="telegramMessage" label="Текст">
        <Input.TextArea rows={4} placeholder="Наприклад: 📦 Нове замовлення #{{orderNumber}} від {{customerName}}" />
      </Form.Item>
    </div>
  )
}

// ── Summary cells ─────────────────────────────────────────────────────────────

function EmailCell({ config }: { config?: NotificationTriggerConfigResponse }) {
  const count = config?.emailRecipients.length ?? 0
  const active = config?.emailEnabled && count > 0
  return (
    <Space size={4}>
      <MailOutlined style={{ color: active ? '#52c41a' : '#d9d9d9' }} />
      <span style={{ color: count > 0 ? '#262626' : '#bfbfbf' }}>
        {count > 0 ? `${count}` : '—'}
      </span>
    </Space>
  )
}

function TelegramCell({ config }: { config?: NotificationTriggerConfigResponse }) {
  const count = (config?.telegramUserIds.length ?? 0) + (config?.telegramGroupEnabled ? 1 : 0)
  const active = config?.telegramEnabled && count > 0
  return (
    <Space size={4}>
      <SendOutlined style={{ color: active ? '#1890ff' : '#d9d9d9' }} />
      <span style={{ color: count > 0 ? '#262626' : '#bfbfbf' }}>{count > 0 ? `${count}` : '—'}</span>
    </Space>
  )
}

function SystemCell({ config }: { config?: NotificationTriggerConfigResponse }) {
  const count = config?.systemAdminIds.length ?? 0
  const active = config?.systemEnabled && count > 0
  return (
    <Space size={4}>
      <BellOutlined style={{ color: active ? '#722ed1' : '#d9d9d9' }} />
      <span style={{ color: count > 0 ? '#262626' : '#bfbfbf' }}>{count > 0 ? `${count}` : '—'}</span>
    </Space>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [configs, setConfigs] = useState<NotificationTriggerConfigResponse[]>([])
  const [admins, setAdmins] = useState<AdminOption[]>([])
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<{ triggerType: string; displayName: string } | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      getTriggerConfigs(),
      getNotificationRecipients(),
      getOrderStatuses(),
    ]).then(([cfgs, recipients, statuses]) => {
      setConfigs(cfgs)
      setAdmins(recipients)
      setOrderStatuses(statuses.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder))
    }).finally(() => setLoading(false))
  }, [])

  const configMap = useMemo(() =>
    new Map(configs.map(c => [c.triggerType, c])),
    [configs]
  )

  const openDrawer = (triggerType: string, displayName: string) => {
    const config = configMap.get(triggerType)
    setEditing({ triggerType, displayName })
    form.setFieldsValue({
      emailEnabled: config?.emailEnabled ?? false,
      emailRecipients: config?.emailRecipients ?? [],
      emailSubject: config?.emailSubject ?? '',
      emailMessage: config?.emailMessage ?? '',
      telegramEnabled: config?.telegramEnabled ?? false,
      telegramUserIds: config?.telegramUserIds ?? [],
      telegramGroupEnabled: config?.telegramGroupEnabled ?? false,
      telegramMessage: config?.telegramMessage ?? '',
      systemEnabled: config?.systemEnabled ?? false,
      systemAdminIds: config?.systemAdminIds ?? [],
      systemTitle: config?.systemTitle ?? '',
      systemMessage: config?.systemMessage ?? '',
    })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return
    const values = form.getFieldsValue()
    const req: UpdateNotificationTriggerConfigRequest = {
      emailEnabled: values.emailEnabled ?? false,
      emailRecipients: form.getFieldValue('emailRecipients') ?? [],
      emailSubject: values.emailSubject ?? '',
      emailMessage: values.emailMessage ?? '',
      telegramEnabled: values.telegramEnabled ?? false,
      telegramUserIds: form.getFieldValue('telegramUserIds') ?? [],
      telegramGroupEnabled: values.telegramGroupEnabled ?? false,
      telegramMessage: values.telegramMessage ?? '',
      systemEnabled: values.systemEnabled ?? false,
      systemAdminIds: form.getFieldValue('systemAdminIds') ?? [],
      systemTitle: values.systemTitle ?? '',
      systemMessage: values.systemMessage ?? '',
    }
    setSaving(true)
    try {
      await updateTriggerConfig(editing.triggerType, req)
      setConfigs(prev => {
        const exists = prev.some(c => c.triggerType === editing.triggerType)
        const updated: NotificationTriggerConfigResponse = {
          triggerType: editing.triggerType,
          displayName: editing.displayName,
          ...req,
        }
        return exists
          ? prev.map(c => c.triggerType === editing.triggerType ? updated : c)
          : [...prev, updated]
      })
      message.success('Збережено')
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const tableData: TableRow[] = useMemo(() => [
    {
      key: 'new_order',
      triggerType: 'new_order',
      displayName: 'Нове замовлення',
      config: configMap.get('new_order'),
    },
    {
      key: 'order_status_changed',
      triggerType: 'order_status_changed',
      displayName: 'Замовлення змінило статус (будь-який)',
      config: configMap.get('order_status_changed'),
      children: orderStatuses.map(s => ({
        key: `order_status_changed:${s.name}`,
        triggerType: `order_status_changed:${s.name}`,
        displayName: s.name,
        config: configMap.get(`order_status_changed:${s.name}`),
      })),
    },
    {
      key: 'new_user',
      triggerType: 'new_user',
      displayName: 'Нова реєстрація користувача',
      config: configMap.get('new_user'),
    },
  ], [configMap, orderStatuses])

  const columns: ColumnsType<TableRow> = [
    {
      title: 'Тригер',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name, row) => (
        <span style={{ fontWeight: row.children ? 600 : 400 }}>{name}</span>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      width: 70,
      render: (_, row) => <EmailCell config={row.config} />,
    },
    {
      title: 'Telegram',
      key: 'telegram',
      width: 90,
      render: (_, row) => <TelegramCell config={row.config} />,
    },
    {
      title: 'Система',
      key: 'system',
      width: 90,
      render: (_, row) => <SystemCell config={row.config} />,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, row) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => openDrawer(row.triggerType, row.displayName)}
        />
      ),
    },
  ]

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20 }}>Налаштування сповіщень</Typography.Title>

      <Spin spinning={loading}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          pagination={false}
          defaultExpandedRowKeys={['order_status_changed']}
          indentSize={24}
        />
      </Spin>

      <Drawer
        title={editing?.displayName ?? 'Тригер'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={500}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs
            items={[
              { key: 'system', label: 'Система', children: <SystemTab form={form} admins={admins} triggerKey={editing?.triggerType ?? ''} /> },
              { key: 'email', label: 'Email', children: <EmailTab form={form} triggerKey={editing?.triggerType ?? ''} /> },
              { key: 'telegram', label: 'Telegram', children: <TelegramTab form={form} triggerKey={editing?.triggerType ?? ''} /> },
            ]}
          />
          <MetadataTable triggerType={editing?.triggerType ?? ''} />
        </Form>
      </Drawer>
    </div>
  )
}
