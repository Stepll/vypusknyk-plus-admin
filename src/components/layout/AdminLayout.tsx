import { useState } from 'react'
import { Layout, Menu, Button, Avatar, Tag } from 'antd'
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, TeamOutlined,
  LogoutOutlined, HeartOutlined, CrownOutlined, InboxOutlined, HistoryOutlined,
  SettingOutlined, BgColorsOutlined, TagsOutlined, CarOutlined,
  CreditCardOutlined, CheckCircleOutlined, ToolOutlined, SafetyCertificateOutlined,
  TruckOutlined, ShopOutlined, FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from '../../stores/AuthStore'

const { Header, Sider, Content } = Layout

const ROUTE_KEYS = [
  '/settings/constructor/colors',
  '/settings/info-pages/privacy',
  '/settings/info-pages/terms',
  '/settings/info-pages/delivery',
  '/settings/info-pages',
  '/settings/categories',
  '/settings/delivery',
  '/settings/payment',
  '/settings/order-statuses',
  '/settings/roles',
  '/settings/suppliers',
  '/designs', '/admins', '/warehouse', '/deliveries', '/history',
  '/orders', '/products', '/users',
]

type MenuItem = {
  key: string
  icon?: React.ReactNode
  label: string
  pageKey?: string
  children?: MenuItem[]
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд', pageKey: 'dashboard' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Замовлення', pageKey: 'orders' },
  { key: '/products', icon: <AppstoreOutlined />, label: 'Продукти', pageKey: 'products' },
  { key: '/users', icon: <TeamOutlined />, label: 'Користувачі', pageKey: 'users' },
  { key: '/designs', icon: <HeartOutlined />, label: 'Збережені дизайни', pageKey: 'designs' },
  { key: '/admins', icon: <CrownOutlined />, label: 'Адміни', pageKey: 'admins' },
  { key: '/warehouse', icon: <InboxOutlined />, label: 'Складський облік', pageKey: 'warehouse' },
  { key: '/deliveries', icon: <TruckOutlined />, label: 'Поставки', pageKey: 'deliveries' },
  { key: '/history', icon: <HistoryOutlined />, label: 'Історія змін', pageKey: 'history' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Налаштування',
    children: [
      { key: '/settings/categories', icon: <TagsOutlined />, label: 'Категорії товарів', pageKey: 'settings.categories' },
      { key: '/settings/delivery', icon: <CarOutlined />, label: 'Методи доставки', pageKey: 'settings.delivery-methods' },
      { key: '/settings/payment', icon: <CreditCardOutlined />, label: 'Методи оплати', pageKey: 'settings.payment-methods' },
      { key: '/settings/order-statuses', icon: <CheckCircleOutlined />, label: 'Статуси замовлень', pageKey: 'settings.order-statuses' },
      { key: '/settings/suppliers', icon: <ShopOutlined />, label: 'Постачальники', pageKey: 'settings.suppliers' },
      { key: '/settings/roles', icon: <SafetyCertificateOutlined />, label: 'Ролі', pageKey: 'settings.roles' },
      {
        key: 'info-pages',
        icon: <FileTextOutlined />,
        label: 'Інформаційні сторінки',
        pageKey: 'settings.info-pages',
        children: [
          { key: '/settings/info-pages/privacy', icon: <FileTextOutlined />, label: 'Політика конфіденційності', pageKey: 'settings.info-pages' },
          { key: '/settings/info-pages/terms', icon: <FileTextOutlined />, label: 'Умови використання', pageKey: 'settings.info-pages' },
          { key: '/settings/info-pages/delivery', icon: <FileTextOutlined />, label: 'Доставка та оплата', pageKey: 'settings.info-pages' },
        ],
      },
      {
        key: 'constructor',
        icon: <ToolOutlined />,
        label: 'Конструктор',
        children: [
          { key: '/settings/constructor/colors', icon: <BgColorsOutlined />, label: 'Кольори', pageKey: 'settings.colors' },
        ],
      },
    ],
  },
]

function filterMenuItems(items: MenuItem[], pages: string[], isSuperAdmin: boolean): MenuItem[] {
  if (isSuperAdmin) return items
  return items.reduce<MenuItem[]>((acc, item) => {
    if (item.children) {
      const filtered = filterMenuItems(item.children, pages, false)
      if (filtered.length > 0) acc.push({ ...item, children: filtered })
    } else if (item.pageKey && pages.includes(item.pageKey)) {
      acc.push(item)
    }
    return acc
  }, [])
}

const AdminLayout = observer(() => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectedKey = pathname === '/' ? '/' : ROUTE_KEYS.find(k => pathname.startsWith(k)) ?? '/'

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname.startsWith('/settings/constructor')) return ['settings', 'constructor']
    if (pathname.startsWith('/settings/info-pages')) return ['settings', 'info-pages']
    if (pathname.startsWith('/settings')) return ['settings']
    return []
  })

  const initials = authStore.admin?.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'A'

  const menuItems = filterMenuItems(ALL_MENU_ITEMS, authStore.allowedPages, authStore.isSuperAdmin)

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
          onClick={({ key }) => { if (!['settings', 'constructor', 'info-pages'].includes(key)) navigate(key) }}
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
            {authStore.admin?.role && (
              <Tag color={authStore.admin.role.color} style={{ marginLeft: 8, fontSize: 11 }}>
                {authStore.admin.role.name}
              </Tag>
            )}
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
