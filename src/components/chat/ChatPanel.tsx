import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Input, Badge, Avatar, Empty, Spin, Button } from 'antd'
import { SendOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons'
import { chatStore } from '../../stores/ChatStore'
import type { ChatConversationListItem } from '../../api/chat'

interface Props {
  compact?: boolean
}

const ChatPanel = observer(({ compact = false }: Props) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatStore.activeMessages.length])

  const handleSend = async () => {
    if (!input.trim()) return
    await chatStore.sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', height: compact ? 440 : 'calc(100vh - 56px - 48px - 48px)', overflow: 'hidden' }}>
      {/* Список чатів */}
      <div style={{
        width: compact ? 220 : 280,
        borderRight: '1px solid #f0f0f0',
        overflowY: 'auto',
        flexShrink: 0,
        background: '#fafafa',
      }}>
        {chatStore.loading && <div style={{ padding: 16, textAlign: 'center' }}><Spin size="small" /></div>}
        {!chatStore.loading && chatStore.conversations.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Немає чатів" style={{ marginTop: 40 }} />
        )}
        {chatStore.conversations.map(conv => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            active={chatStore.activeConversationId === conv.id}
            compact={compact}
            onClick={() => chatStore.openConversation(conv.id)}
          />
        ))}
      </div>

      {/* Вікно повідомлень */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!chatStore.activeConversationId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: 40, marginBottom: 8 }} />
              <div>Оберіть чат</div>
            </div>
          </div>
        ) : (
          <>
            {/* Заголовок */}
            <div style={{
              padding: compact ? '8px 12px' : '12px 20px',
              borderBottom: '1px solid #f0f0f0',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}>
              <Avatar size={compact ? 28 : 32} icon={<UserOutlined />} style={{ background: '#4f46e5' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: compact ? 13 : 14, lineHeight: 1.2 }}>
                  {chatStore.activeConversation?.userFullName}
                </div>
                {chatStore.activeConversation?.userEmail && (
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{chatStore.activeConversation.userEmail}</div>
                )}
              </div>
            </div>

            {/* Повідомлення */}
            <div style={{ flex: 1, overflowY: 'auto', padding: compact ? '8px 10px' : '16px 20px' }}>
              {chatStore.activeMessages.map(msg => {
                const isAdmin = msg.senderType === 'Admin'
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      marginBottom: compact ? 6 : 10,
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: compact ? '6px 10px' : '8px 14px',
                      borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isAdmin ? '#4f46e5' : '#f5f5f5',
                      color: isAdmin ? '#fff' : '#262626',
                      fontSize: compact ? 12 : 13,
                      lineHeight: 1.5,
                    }}>
                      <div>{msg.text}</div>
                      <div style={{
                        fontSize: 10,
                        marginTop: 3,
                        opacity: 0.65,
                        textAlign: 'right',
                      }}>
                        {new Date(msg.sentAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Інпут */}
            <div style={{
              padding: compact ? '8px 10px' : '12px 20px',
              borderTop: '1px solid #f0f0f0',
              background: '#fff',
              display: 'flex',
              gap: 8,
              flexShrink: 0,
            }}>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Написати повідомлення..."
                size={compact ? 'small' : 'middle'}
                style={{ borderRadius: 20 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                size={compact ? 'small' : 'middle'}
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ borderRadius: 20, background: '#4f46e5', border: 'none' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
})

interface ConvItemProps {
  conv: ChatConversationListItem
  active: boolean
  compact: boolean
  onClick: () => void
}

const ConversationItem = ({ conv, active, compact, onClick }: ConvItemProps) => (
  <div
    onClick={onClick}
    style={{
      padding: compact ? '8px 12px' : '12px 16px',
      cursor: 'pointer',
      background: active ? '#ede9fe' : 'transparent',
      borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
      transition: 'background 0.15s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar size={compact ? 28 : 32} icon={<UserOutlined />} style={{ background: active ? '#4f46e5' : '#8c8c8c', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: compact ? 12 : 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
            {conv.userFullName}
          </span>
          <Badge count={conv.unreadCount} size="small" style={{ background: '#4f46e5' }} />
        </div>
        {conv.lastMessage && (
          <div style={{
            fontSize: 11,
            color: '#8c8c8c',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 2,
          }}>
            {conv.lastMessage}
          </div>
        )}
      </div>
    </div>
  </div>
)

export default ChatPanel
