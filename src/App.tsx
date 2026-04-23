import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/login/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrdersPage from './pages/orders/OrdersPage'
import OrderDetailPage from './pages/orders/OrderDetailPage'
import ProductsPage from './pages/products/ProductsPage'
import ProductEditPage from './pages/products/ProductEditPage'
import UsersPage from './pages/users/UsersPage'
import UserDetailPage from './pages/users/UserDetailPage'
import SavedDesignsPage from './pages/designs/SavedDesignsPage'
import DesignDetailPage from './pages/designs/DesignDetailPage'
import AdminsPage from './pages/admins/AdminsPage'
import AdminDetailPage from './pages/admins/AdminDetailPage'
import WarehousePage from './pages/warehouse/WarehousePage'
import DeliveriesPage from './pages/deliveries/DeliveriesPage'
import DeliveryDetailPage from './pages/deliveries/DeliveryDetailPage'
import NewDeliveryPage from './pages/deliveries/NewDeliveryPage'
import HistoryPage from './pages/history/HistoryPage'
import CategoriesPage from './pages/settings/CategoriesPage'
import DeliveryMethodsPage from './pages/settings/DeliveryMethodsPage'
import PaymentMethodsPage from './pages/settings/PaymentMethodsPage'
import OrderStatusesPage from './pages/settings/OrderStatusesPage'
import ColorsPage from './pages/settings/constructor/ColorsPage'
import RolesPage from './pages/settings/RolesPage'
import SuppliersPage from './pages/settings/SuppliersPage'
import InfoPageEditPage from './pages/settings/InfoPageEditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductEditPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="designs" element={<SavedDesignsPage />} />
            <Route path="designs/:id" element={<DesignDetailPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="admins/:id" element={<AdminDetailPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="deliveries/new" element={<NewDeliveryPage />} />
            <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings/categories" element={<CategoriesPage />} />
            <Route path="settings/delivery" element={<DeliveryMethodsPage />} />
            <Route path="settings/payment" element={<PaymentMethodsPage />} />
            <Route path="settings/order-statuses" element={<OrderStatusesPage />} />
            <Route path="settings/constructor/colors" element={<ColorsPage />} />
            <Route path="settings/roles" element={<RolesPage />} />
            <Route path="settings/suppliers" element={<SuppliersPage />} />
            <Route path="settings/info-pages/:slug" element={<InfoPageEditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
