import { MessageOutlined } from '@ant-design/icons'
import ChatPanel from '../../components/chat/ChatPanel'

export default function ChatsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <MessageOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Чати</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Спілкування з клієнтами</p>
        </div>
      </div>
      <div style={{ margin: '-24px -28px -24px', borderTop: '1px solid #f0f0f0' }}>
        <ChatPanel />
      </div>
    </div>
  )
}
