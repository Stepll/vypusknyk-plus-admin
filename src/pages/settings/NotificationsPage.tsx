import { useEffect, useState } from 'react'
import {
  Table, Button, Drawer, Tabs, Form, Switch, Input, Space, Typography,
  Tag, Spin, message, Select, Divider, Tooltip,
} from 'antd'
import { EditOutlined, MailOutlined, SendOutlined, BellOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getTriggerConfigs, updateTriggerConfig,
  type NotificationTriggerConfigResponse, type UpdateNotificationTriggerConfigRequest,
} from '../../api/notifications'
import { getAdmins } from '../../api/admins'

const ORDER_STATUSES = ['Прийнято', 'У виробництві', 'Відправлено', 'Доставлено']

interface AdminOption { id: number; fullName: string; email: string }

function TriggerExtraConfigField({ triggerType, value, onChange }: {
  triggerType: string
  value?: string
  onChange?: (v: string) => void
}) {
  if (triggerType !== 'order_status_changed') return null

  let parsed: { statusFilter?: string } = {}
  try { parsed = JSON.parse(value ?? '{}') } catch { /* */ }

  return (
    <Form.Item label="Фільтр статусу" style={{ marginBottom: 16 }}>
      <Select
        value={parsed.statusFilter ?? 'any'}
        onChange={v => onChange?.(JSON.stringify({ statusFilter: v }))}
        options={[
          { value: 'any', label: 'Будь-який статус' },
          ...ORDER_STATUSES.map(s => ({ value: s, label: s })),
        ]}
      />
    </Form.Item>
  )
}

function EmailTab({ form }: { form: ReturnType<typeof Form.useForm>[0] }) {
  const [newEmail, setNewEmail] = useState('')
  const recipients: string[] = Form.useWatch('emailRecipients', form) ?? []

  const add = () => {
    const trimmed = newEmail.trim()
    if (!trimmed || recipients.includes(trimmed)) return
    form.setFieldValue('emailRecipients', [...recipients, trimmed])
    setNewEmail('')
  }

  const remove = (email: string) => {
    form.setFieldValue('emailRecipients', recipients.filter(e => e !== email))
  }

  return (
    <div>
      <Form.Item name="emailEnabled" valuePropName="checked" label="Активовано">
        <Switch />
      </Form.Item>
      <Form.Item label={`Отримувачі (${recipients.length})`}>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            placeholder="email@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onPressEnter={add}
          />
          <Button icon={<PlusOutlined />} onClick={add}>Додати</Button>
        </Space.Compact>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {recipients.map(email => (
            <Tag
              key={email}
              closable
              onClose={() => remove(email)}
              icon={<MailOutlined />}
              style={{ fontSize: 13 }}
            >
              {email}
            </Tag>
          ))}
          {recipients.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>Немає отримувачів</Typography.Text>
          )}
        </div>
      </Form.Item>
    </div>
  )
}

function TelegramTab({ form }: { form: ReturnType<typeof Form.useForm>[0] }) {
  const [newId, setNewId] = useState('')
  const ids: string[] = Form.useWatch('telegramUserIds', form) ?? []

  const add = () => {
    const trimmed = newId.trim()
    if (!trimmed || ids.includes(trimmed)) return
    form.setFieldValue('telegramUserIds', [...ids, trimmed])
    setNewId('')
  }

  const remove = (id: string) => {
    form.setFieldValue('telegramUserIds', ids.filter(i => i !== id))
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
          <Input
            placeholder="123456789"
            value={newId}
            onChange={e => setNewId(e.target.value)}
            onPressEnter={add}
          />
          <Button icon={<PlusOutlined />} onClick={add}>Додати</Button>
        </Space.Compact>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ids.map(id => (
            <Tag
              key={id}
              closable
              onClose={() => remove(id)}
              icon={<SendOutlined />}
              color="blue"
              style={{ fontSize: 13 }}
            >
              {id}
            </Tag>
          ))}
          {ids.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>Немає ID</Typography.Text>
          )}
        </div>
      </Form.Item>
    </div>
  )
}

function SystemTab({ form, admins }: { form: ReturnType<typeof Form.useForm>[0]; admins: AdminOption[] }) {
  const selected: number[] = Form.useWatch('systemAdminIds', form) ?? []

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      form.setFieldValue('systemAdminIds', selected.filter(i => i !== id))
    } else {
      form.setFieldValue('systemAdminIds', [...selected, id])
    }
  }

  return (
    <div>
      <Form.Item name="systemEnabled" valuePropName="checked" label="Активовано">
        <Switch />
      </Form.Item>
      <Form.Item label={`Отримувачі (${selected.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {admins.map(admin => {
            const isSelected = selected.includes(admin.id)
            return (
              <div
                key={admin.id}
                onClick={() => toggle(admin.id)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${isSelected ? '#4f46e5' : '#d9d9d9'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isSelected ? '#f0f0ff' : '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{admin.fullName}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{admin.email}</div>
                </div>
                {isSelected && <Tag color="purple" style={{ margin: 0 }}>Отримує</Tag>}
              </div>
            )
          })}
          {admins.length === 0 && (
            <Typography.Text type="secondary">Немає адмінів</Typography.Text>
          )}
        </div>
      </Form.Item>
    </div>
  )
}

export default function NotificationsPage() {
  const [configs, setConfigs] = useState<NotificationTriggerConfigResponse[]>([])
  const [admins, setAdmins] = useState<AdminOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationTriggerConfigResponse | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      getTriggerConfigs(),
      getAdmins(1, 100),
    ]).then(([cfgs, adminsRes]) => {
      setConfigs(cfgs)
      setAdmins(adminsRes.items.map(a => ({ id: a.id, fullName: a.fullName, email: a.email })))
    }).finally(() => setLoading(false))
  }, [])

  const openDrawer = (config: NotificationTriggerConfigResponse) => {
    setEditing(config)
    form.setFieldsValue({
      extraConfig: config.extraConfig,
      emailEnabled: config.emailEnabled,
      emailRecipients: config.emailRecipients,
      telegramEnabled: config.telegramEnabled,
      telegramUserIds: config.telegramUserIds,
      telegramGroupEnabled: config.telegramGroupEnabled,
      systemEnabled: config.systemEnabled,
      systemAdminIds: config.systemAdminIds,
    })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return
    const values = form.getFieldsValue()
    const req: UpdateNotificationTriggerConfigRequest = {
      extraConfig: values.extraConfig,
      emailEnabled: values.emailEnabled ?? false,
      emailRecipients: values.emailRecipients ?? [],
      telegramEnabled: values.telegramEnabled ?? false,
      telegramUserIds: values.telegramUserIds ?? [],
      telegramGroupEnabled: values.telegramGroupEnabled ?? false,
      systemEnabled: values.systemEnabled ?? false,
      systemAdminIds: values.systemAdminIds ?? [],
    }
    setSaving(true)
    try {
      await updateTriggerConfig(editing.triggerType, req)
      setConfigs(prev => prev.map(c =>
        c.triggerType === editing.triggerType
          ? { ...c, ...req }
          : c
      ))
      message.success('Збережено')
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnsType<NotificationTriggerConfigResponse> = [
    {
      title: 'Тригер',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.triggerType === 'order_status_changed' && record.extraConfig && (() => {
            try {
              const { statusFilter } = JSON.parse(record.extraConfig)
              return (
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                  Статус: {statusFilter === 'any' ? 'будь-який' : statusFilter}
                </div>
              )
            } catch { return null }
          })()}
        </div>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      width: 160,
      render: (_, record) => {
        const count = record.emailRecipients.length
        return (
          <Tooltip title={count > 0 ? record.emailRecipients.join(', ') : undefined}>
            <Space size={4}>
              <MailOutlined style={{ color: count > 0 && record.emailEnabled ? '#52c41a' : '#d9d9d9' }} />
              <span style={{ color: count > 0 ? '#262626' : '#bfbfbf' }}>
                {count > 0 ? `${count} отримувач${count === 1 ? '' : 'ів'}` : '—'}
              </span>
            </Space>
          </Tooltip>
        )
      },
    },
    {
      title: 'Telegram',
      key: 'telegram',
      width: 160,
      render: (_, record) => {
        const count = record.telegramUserIds.length
        const hasGroup = record.telegramGroupEnabled
        const total = count + (hasGroup ? 1 : 0)
        const active = record.telegramEnabled && total > 0
        return (
          <Space size={4}>
            <SendOutlined style={{ color: active ? '#1890ff' : '#d9d9d9' }} />
            <span style={{ color: total > 0 ? '#262626' : '#bfbfbf' }}>
              {total === 0 ? '—' : `${count} ID${hasGroup ? ' + група' : ''}`}
            </span>
          </Space>
        )
      },
    },
    {
      title: 'Система',
      key: 'system',
      width: 160,
      render: (_, record) => {
        const count = record.systemAdminIds.length
        const active = record.systemEnabled && count > 0
        return (
          <Space size={4}>
            <BellOutlined style={{ color: active ? '#722ed1' : '#d9d9d9' }} />
            <span style={{ color: count > 0 ? '#262626' : '#bfbfbf' }}>
              {count > 0 ? `${count} адмін${count === 1 ? '' : 'ів'}` : '—'}
            </span>
          </Space>
        )
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => openDrawer(record)}
        />
      ),
    },
  ]

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20 }}>Налаштування сповіщень</Typography.Title>

      <Spin spinning={loading}>
        <Table
          dataSource={configs}
          columns={columns}
          rowKey="triggerType"
          pagination={false}
          bordered={false}
        />
      </Spin>

      <Drawer
        title={editing?.displayName ?? 'Тригер'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={460}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          {editing && (
            <TriggerExtraConfigField
              triggerType={editing.triggerType}
              value={form.getFieldValue('extraConfig')}
              onChange={v => form.setFieldValue('extraConfig', v)}
            />
          )}
          {editing?.triggerType === 'order_status_changed' && <Divider style={{ margin: '0 0 16px' }} />}

          <Tabs
            items={[
              {
                key: 'system',
                label: 'Система',
                children: <SystemTab form={form} admins={admins} />,
              },
              {
                key: 'email',
                label: 'Email',
                children: <EmailTab form={form} />,
              },
              {
                key: 'telegram',
                label: 'Telegram',
                children: <TelegramTab form={form} />,
              },
            ]}
          />
        </Form>
      </Drawer>
    </div>
  )
}
