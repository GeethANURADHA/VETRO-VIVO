import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Contact = lazy(() => import('./pages/Contact'));
const GemDetail = lazy(() => import('./pages/GemDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Login = lazy(() => import('./pages/Login'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const ManageGems = lazy(() => import('./admin/ManageGems'));
const ManageCategories = lazy(() => import('./admin/ManageCategories'));
const ManageUsers = lazy(() => import('./admin/ManageUsers'));
const GemForm = lazy(() => import('./admin/GemForm'));
const CategoryForm = lazy(() => import('./admin/CategoryForm'));
const AdminForm = lazy(() => import('./admin/AdminForm'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-sapphire-200 border-t-sapphire-600"></div>
  </div>
);

const NotFound = () => <div className="p-8 text-center text-red-500">404 - Not Found</div>;

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
