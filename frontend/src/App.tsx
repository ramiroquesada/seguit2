import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EquipmentListPage } from './pages/Equipment/EquipmentListPage';
import { EquipmentDetailPage } from './pages/Equipment/EquipmentDetailPage';
import { EquipmentFormPage } from './pages/Equipment/EquipmentFormPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { UsersPage } from './pages/Users/UsersPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/Layout/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/equipment" element={<EquipmentListPage />} />
                <Route path="/equipment/new" element={<EquipmentFormPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
                <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Admin only routes */}
                <Route element={<PrivateRoute allowedRoles={['ROOT']} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
