import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ManageGems() {
  const [searchTerm, setSearchTerm] = useState('');
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGems();
  }, []);

  const fetchGems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gems')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gemstone?')) return;

    try {
      const { error } = await supabase
        .from('gems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGems(gems.filter(gem => gem.id !== id));
    } catch (err) {
      alert('Error deleting gem: ' + err.message);
    }
  };

  const filteredGems = gems.filter(gem => 
    gem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Manage Gems</h1>
          <p className="text-slate-600 dark:text-slate-400">Add, edit, or remove gemstone listings.</p>
        </div>
        <Link to="/admin/gems/add" className="flex items-center gap-2 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white rounded-lg font-medium transition-colors">
          <Plus className="h-5 w-5" /> Add New Gem
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search gems..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

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
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Gem Details</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Category</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Price</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Qty</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm">Stock</th>
                  <th className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredGems.map((gem) => (
                  <tr key={gem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {gem.image_url ? (
                            <img src={gem.image_url} alt={gem.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{gem.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{gem.carat} ct</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {gem.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                      ${gem.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${gem.quantity === 0 ? 'text-red-500' : gem.quantity <= 2 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {gem.quantity || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {gem.stock_status === 'sold_out' || gem.quantity === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Sold Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/gems/edit/${gem.id}`} className="p-2 text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-400 transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(gem.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && !error && filteredGems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No gems found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
