import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch categories with count of related gems
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          gems (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Any gems in this category will become uncategorized.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Manage Categories</h1>
          <p className="text-slate-600 dark:text-slate-400">Organize your jewel collections.</p>
        </div>
        <Link to="/admin/categories/add" className="flex items-center gap-2 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white rounded-lg font-medium transition-colors">
          <Plus className="h-5 w-5" /> Add Category
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
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Category Name</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Items Count</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {category.image_url && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {category.gems?.[0]?.count || 0} gems
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/categories/edit/${category.id}`} className="p-2 text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-400 transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No categories found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
