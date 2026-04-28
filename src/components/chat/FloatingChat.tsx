import { observer } from 'mobx-react-lite'
import { Badge, Button, Tooltip } from 'antd'
import { MessageOutlined, CloseOutlined, ExpandAltOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { chatStore } from '../../stores/ChatStore'
import ChatPanel from './ChatPanel'

const FloatingChat = observer(() => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (pathname === '/chats') return null

  return (
    <>
      {/* Floating button */}
      {!chatStore.isWidgetOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Tooltip title="Чати" placement="left">
            <Badge count={chatStore.unreadCount} size="small" style={{ background: '#ef4444' }}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<MessageOutlined style={{ fontSize: 20 }} />}
                onClick={() => chatStore.setWidgetOpen(true)}
                style={{
                  width: 52,
                  height: 52,
                  background: '#4f46e5',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
                }}
              />
            </Badge>
          </Tooltip>
        </div>
      )}

      {/* Widget panel */}
      {chatStore.isWidgetOpen && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 520,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Widget header */}
          <div style={{
            padding: '10px 14px',
            background: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
              Чати
              {chatStore.unreadCount > 0 && (
                <Badge count={chatStore.unreadCount} size="small" style={{ marginLeft: 8, background: '#ef4444' }} />
              )}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Tooltip title="Розгорнути">
                <Button
                  type="text"
                  size="small"
                  icon={<ExpandAltOutlined />}
                  onClick={() => { chatStore.setWidgetOpen(false); navigate('/chats') }}
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </Tooltip>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => chatStore.setWidgetOpen(false)}
                style={{ color: 'rgba(255,255,255,0.8)' }}
              />
            </div>
          </div>

          <ChatPanel compact />
        </div>
      )}
    </>
  )
})

export default FloatingChat
