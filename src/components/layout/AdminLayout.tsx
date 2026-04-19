import { useState } from 'react'
import { Layout, Menu, Button, Avatar } from 'antd'
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, TeamOutlined,
  LogoutOutlined, HeartOutlined, CrownOutlined, InboxOutlined, HistoryOutlined,
  SettingOutlined, BgColorsOutlined, TagsOutlined, CarOutlined,
  CreditCardOutlined, CheckCircleOutlined, ToolOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from '../../stores/AuthStore'

const { Header, Sider, Content } = Layout

const ROUTE_KEYS = [
  '/settings/constructor/colors',
  '/settings/categories',
  '/settings/delivery',
  '/settings/payment',
  '/settings/order-statuses',
  '/designs', '/admins', '/warehouse', '/history',
  '/orders', '/products', '/users',
]

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Замовлення' },
  { key: '/products', icon: <AppstoreOutlined />, label: 'Продукти' },
  { key: '/users', icon: <TeamOutlined />, label: 'Користувачі' },
  { key: '/designs', icon: <HeartOutlined />, label: 'Збережені дизайни' },
  { key: '/admins', icon: <CrownOutlined />, label: 'Адміни' },
  { key: '/warehouse', icon: <InboxOutlined />, label: 'Складський облік' },
  { key: '/history', icon: <HistoryOutlined />, label: 'Історія змін' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Налаштування',
    children: [
      { key: '/settings/categories', icon: <TagsOutlined />, label: 'Категорії товарів' },
      { key: '/settings/delivery', icon: <CarOutlined />, label: 'Методи доставки' },
      { key: '/settings/payment', icon: <CreditCardOutlined />, label: 'Методи оплати' },
      { key: '/settings/order-statuses', icon: <CheckCircleOutlined />, label: 'Статуси замовлень' },
      {
        key: 'constructor',
        icon: <ToolOutlined />,
        label: 'Конструктор',
        children: [
          { key: '/settings/constructor/colors', icon: <BgColorsOutlined />, label: 'Кольори' },
        ],
      },
    ],
  },
]

const AdminLayout = observer(() => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectedKey = pathname === '/' ? '/' : ROUTE_KEYS.find(k => pathname.startsWith(k)) ?? '/'

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname.startsWith('/settings/constructor')) return ['settings', 'constructor']
    if (pathname.startsWith('/settings')) return ['settings']
    return []
  })

  const initials = authStore.admin?.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'A'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={230}
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.18)',
          overflowY: 'auto',
        }}
      >
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>🎓</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>Випускник+</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Панель адміна</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={keys => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={({ key }) => { if (!key.startsWith('settings') && key !== 'constructor') navigate(key) }}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Sider>
      <Layout style={{ background: '#f0f2f5' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}>
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>
            Вітаємо, <strong style={{ color: '#262626' }}>{authStore.admin?.fullName}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={32} style={{ background: '#4f46e5', fontSize: 13, fontWeight: 600, cursor: 'default' }}>
              {initials}
            </Avatar>
            <Button
              icon={<LogoutOutlined />}
              type="text"
              size="small"
              onClick={() => { authStore.logout(); navigate('/login') }}
              style={{ color: '#8c8c8c' }}
            >
              Вийти
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '24px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            minHeight: 'calc(100vh - 56px - 48px)',
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
})

export default AdminLayout
