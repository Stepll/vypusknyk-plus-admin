import { InboxOutlined } from '@ant-design/icons'

export default function WarehousePage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #0891b2 0%, #0369a1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <InboxOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Складський облік</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Управління залишками товарів</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#8c8c8c', paddingTop: 60, fontSize: 15 }}>В розробці</div>
    </div>
  )
}
