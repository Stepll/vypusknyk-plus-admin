import { CarOutlined } from '@ant-design/icons'

export default function DeliveryMethodsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <CarOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Методи доставки</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Нова Пошта, Укрпошта, Самовивіз</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#8c8c8c', paddingTop: 60, fontSize: 15 }}>В розробці</div>
    </div>
  )
}
