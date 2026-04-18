import { Layout, Menu, Button } from 'antd'
import { DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from '../../stores/AuthStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Замовлення' },
  { key: '/products', icon: <AppstoreOutlined />, label: 'Продукти' },
  { key: '/users', icon: <TeamOutlined />, label: 'Користувачі' },
]

const AdminLayout = observer(() => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectedKey = menuItems.find(item => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div className="text-white text-center py-4 font-bold text-lg border-b border-gray-700">
          Випускник+ Адмін
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-gray-500 text-sm">{authStore.admin?.fullName}</span>
          <Button
            icon={<LogoutOutlined />}
            type="text"
            onClick={() => { authStore.logout(); navigate('/login') }}
          >
            Вийти
          </Button>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: '24px', borderRadius: '8px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
})

export default AdminLayout
