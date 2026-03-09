import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

import Home from './pages/Home';

import Catalog from './pages/Catalog';
import Contact from './pages/Contact';
import GemDetail from './pages/GemDetail';
import Categories from './pages/Categories';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';

import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import ManageGems from './admin/ManageGems';
import ManageCategories from './admin/ManageCategories';
import ManageUsers from './admin/ManageUsers';
import GemForm from './admin/GemForm';
import CategoryForm from './admin/CategoryForm';
import AdminForm from './admin/AdminForm';

const NotFound = () => <div className="p-8 text-center text-red-500">404 - Not Found</div>;

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:id" element={<GemDetail />} />
            <Route path="categories" element={<Categories />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['main_admin', 'admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="gems" element={<ManageGems />} />
              <Route path="gems/add" element={<GemForm />} />
              <Route path="gems/edit/:id" element={<GemForm />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="categories/add" element={<CategoryForm />} />
              <Route path="categories/edit/:id" element={<CategoryForm />} />
            </Route>
          </Route>
          
          {/* Main Admin Only Route */}
          <Route element={<ProtectedRoute allowedRoles={['main_admin']} />}>
            <Route path="/admin/users" element={<AdminLayout />}>
              <Route index element={<ManageUsers />} />
              <Route path="add" element={<AdminForm />} />
              <Route path="edit/:id" element={<AdminForm />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
