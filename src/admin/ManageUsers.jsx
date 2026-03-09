import { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldCheck, Mail, Edit2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ManageUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'main_admin'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this admin? This will only remove their admin privileges in the users table, and delete their auth account if applicable.')) return;

    try {
      // Typically you'd also want to delete from auth.users via an edge function, 
      // but deleting from the public.users table or changing role is a start.
      // Easiest is to delete from public table which cascades if foreign key is set up right
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAdmins(admins.filter(a => a.id !== id));
    } catch (err) {
      alert('Error deleting admin: ' + err.message);
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Manage Admin Users</h1>
          <p className="text-slate-600 dark:text-slate-400">Control access to the marketplace dashboard.</p>
        </div>
        <Link to="/admin/users/add" className="flex items-center gap-2 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white rounded-lg font-medium transition-colors">
          <Plus className="h-5 w-5" /> Add Admin
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sapphire-600 dark:text-gold-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Error: {error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">User Identity</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Role</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-sapphire-100 dark:bg-sapphire-900/30 p-2 rounded-full text-sapphire-700 dark:text-gold-500">
                          {admin.role === 'main_admin' ? <ShieldCheck className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{admin.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'main_admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {admin.role === 'main_admin' ? 'Main Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/users/edit/${admin.id}`} className="p-2 text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-400 transition-colors" title="Edit Admin">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        {admin.role !== 'main_admin' && (
                          <button onClick={() => handleDelete(admin.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Remove Admin">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && !error && admins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No admins found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
