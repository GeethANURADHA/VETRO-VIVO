import { useState, useEffect } from 'react';
import CategoryCard from '../components/CategoryCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sapphire-600 dark:text-gold-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-sapphire-50 dark:bg-sapphire-900/30 rounded-full mb-4">
          <Sparkles className="h-6 w-6 text-sapphire-600 dark:text-gold-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">Explore Our Collections</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          From the deep blues of Ceylon sapphires to the fiery reds of Burmese rubies, discover gemstones curated for their exceptional beauty and rarity.
        </p>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-500">
          Error loading categories: {error}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <div key={category.id} className="group flex flex-col">
              <CategoryCard category={category} />
              <div className="pt-6 px-2 text-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">{category.name}</h3>
                {/* Description isn't in DB yet, could add it later if needed */}
                <p className="text-slate-600 dark:text-slate-400">Exquisite {category.name.toLowerCase()} sourced from the finest mines.</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          No categories found.
        </div>
      )}
    </div>
  );
}
