import { useState } from 'react'
import { Badge, Popover, Button, List, Typography, Empty, Divider } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { notificationsStore } from '../../stores/NotificationsStore'
import type { AdminNotificationDto } from '../../api/notifications'

const ENTITY_ROUTES: Record<string, string> = {
  order: '/orders',
  user: '/users',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'щойно'
  if (diffMin < 60) return `${diffMin} хв тому`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} год тому`
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

const NotificationItem = observer(({ n }: { n: AdminNotificationDto }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (!n.isRead) notificationsStore.markRead(n.id)
    if (n.entityType && n.entityId && ENTITY_ROUTES[n.entityType]) {
      navigate(`${ENTITY_ROUTES[n.entityType]}/${n.entityId}`)
    }
  }

  return (
    <List.Item
      onClick={handleClick}
      style={{
        padding: '10px 16px',
        cursor: n.entityId ? 'pointer' : 'default',
        background: n.isRead ? 'transparent' : '#f0f4ff',
        borderRadius: 8,
        marginBottom: 2,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        {!n.isRead && (
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#4f46e5',
            marginTop: 6, flexShrink: 0,
          }} />
        )}
        {n.isRead && <div style={{ width: 7, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13, color: '#262626', lineHeight: 1.4 }}>
            {n.title}
          </div>
          <div style={{ fontSize: 12, color: '#595959', marginTop: 2, lineHeight: 1.4 }}>
            {n.body}
          </div>
          <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
            {formatTime(n.createdAt)}
          </div>
        </div>
      </div>
    </List.Item>
  )
})

const NotificationsContent = observer(({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate()
  const { notifications, unreadCount } = notificationsStore

  return (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 8px' }}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          Сповіщення {unreadCount > 0 && <span style={{ color: '#4f46e5' }}>({unreadCount})</span>}
        </Typography.Text>
        <div style={{ display: 'flex', gap: 4 }}>
          {unreadCount > 0 && (
            <Button
              type="text" size="small" icon={<CheckOutlined />}
              onClick={() => notificationsStore.markAllRead()}
              style={{ fontSize: 12, color: '#8c8c8c' }}
            >
              Всі прочитано
            </Button>
          )}
          <Button
            type="text" size="small"
            onClick={() => { navigate('/settings/notifications'); onClose() }}
            style={{ fontSize: 12, color: '#8c8c8c' }}
          >
            Налаштування
          </Button>
        </div>
      </div>
      <Divider style={{ margin: '0 0 4px' }} />
      {notifications.length === 0 ? (
        <Empty description="Немає сповіщень" style={{ padding: '24px 0' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <List
            dataSource={notifications}
            renderItem={n => <NotificationItem key={n.id} n={n} />}
            split={false}
          />
        </div>
      )}
    </div>
  )
})

const NotificationsPopover = observer(() => {
  const [open, setOpen] = useState(false)
  const { unreadCount } = notificationsStore

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={<NotificationsContent onClose={() => setOpen(false)} />}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayStyle={{ padding: 0 }}
      overlayInnerStyle={{ borderRadius: 12, padding: '12px 8px 8px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
    >
      <Badge count={unreadCount} size="small" overflowCount={99} offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}
        />
      </Badge>
    </Popover>
  )
})

export default NotificationsPopover
