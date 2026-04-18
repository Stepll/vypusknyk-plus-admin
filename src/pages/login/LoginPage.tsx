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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card style={{ width: 400 }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Випускник+</h1>
          <p className="text-gray-500 text-sm mt-1">Панель адміністратора</p>
        </div>
        {error && <Alert type="error" message={error} className="mb-4" />}
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
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={authStore.loading}
            >
              Увійти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
