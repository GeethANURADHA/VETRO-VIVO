import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';

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
const HomepageSettings = lazy(() => import('./admin/HomepageSettings'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-sapphire-200 border-t-sapphire-600"></div>
  </div>
);

const NotFound = () => <div className="p-8 text-center text-red-500">404 - Not Found</div>;

function AdminFixHelper() {
  const { user, role } = useAuth();
  
  if (user?.email === 'vetrovivo.lk@gmail.com' && role === 'user') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-md w-full shadow-2xl border border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Access Blocked</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Your account is currently registered as a standard "user" in the database because the SQL fix script was not run.
          </p>
          <button 
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('users')
                  .update({ role: 'main_admin' })
                  .eq('id', user.id);
                  
                if (error) {
                  alert("Failed to update: " + error.message);
                } else {
                  alert("Success! Your account has been upgraded. The page will now reload.");
                  window.location.href = '/admin';
                }
              } catch (err) {
                alert("Error: " + err.message);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Click Here to Force Upgrade to Admin
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function App() {

  return (
    <AuthProvider>
      <AdminFixHelper />
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
                <Route path="settings" element={<HomepageSettings />} />
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
