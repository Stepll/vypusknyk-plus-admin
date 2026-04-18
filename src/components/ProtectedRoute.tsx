import { observer } from 'mobx-react-lite'
import { Navigate, Outlet } from 'react-router-dom'
import { authStore } from '../stores/AuthStore'

const ProtectedRoute = observer(() => {
  if (!authStore.isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
})

export default ProtectedRoute
