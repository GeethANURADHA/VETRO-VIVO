import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '' // Only required for new users, managed carefully
  });

  useEffect(() => {
    if (isEditing) {
      fetchAdmin();
    }
  }, [id]);

  const fetchAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          email: data.email,
          role: data.role,
          password: '' // Don't fetch or display password
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!isEditing && formData.password.length < 6) {
      setError('Password must be at least 6 characters for new admins.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        // Just update role and name in the users table.
        const { error } = await supabase
          .from('users')
          .update({ name: formData.name, role: formData.role })
          .eq('id', id);
          
        if (error) throw error;
      } else {
        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Note: The id is returned in authData.user.id. 
        // 2. Insert into users table
        if (authData?.user) {
          const { error: dbError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              name: formData.name,
              email: formData.email,
              role: formData.role
            }]);

          if (dbError) throw dbError;
        }
      }

      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-600 dark:text-gold-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/admin/users" className="flex items-center gap-2 text-sm text-slate-500 hover:text-sapphire-600 dark:hover:text-gold-500 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Admins
        </Link>
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
          {isEditing ? 'Edit Administrator' : 'Add New Administrator'}
        </h1>
      </div>

      <div className="max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="main_admin">Main Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isEditing}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {isEditing && <p className="text-xs text-slate-500 mt-1">Email cannot be changed after creation.</p>}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!isEditing}
                    min="6"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 6 characters.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
            <Link 
              to="/admin/users"
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isEditing ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
