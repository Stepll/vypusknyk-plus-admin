import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Alert } from 'antd'
import { authStore } from '../../stores/AuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const onFinish = async ({ email, password }: { email: string; password: string }) => {
    setError(null)
    try {
      await authStore.login(email, password)
      navigate('/', { replace: true })
    } catch {
      setError('Невірний email або пароль')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 10 }}>🎓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Випускник+</h1>
          <p style={{ color: '#8c8c8c', fontSize: 13, marginTop: 6, marginBottom: 0 }}>Панель адміністратора</p>
        </div>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Введіть email' }, { type: 'email', message: 'Невірний формат' }]}
          >
            <Input size="large" placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введіть пароль' }]}
            style={{ marginBottom: 20 }}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={authStore.loading}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', height: 44 }}
            >
              Увійти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
