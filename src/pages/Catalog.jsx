import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GemCard from '../components/GemCard';
import { Search, SlidersHorizontal, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CARAT_TIERS = [
  { label: 'Points (Below 1.00 Carat)', min: 0, max: 0.99 },
  { label: '1.00 To 1.49 Carat', min: 1.00, max: 1.49 },
  { label: '1.50 To 1.99 Carat', min: 1.50, max: 1.99 },
  { label: '2.00 To 2.49 Carat', min: 2.00, max: 2.49 },
  { label: '2.50 To 2.99 Carat', min: 2.50, max: 2.99 },
  { label: '3.00 To 3.49 Carat', min: 3.00, max: 3.49 },
  { label: '3.50 To 3.99 Carat', min: 3.50, max: 3.99 },
  { label: '4.00 To 4.49 Carat', min: 4.00, max: 4.49 },
  { label: '4.50 To 4.99 Carat', min: 4.50, max: 4.99 },
  { label: '5.00 To 5.99 Carat', min: 5.00, max: 5.99 },
  { label: '6.00 To 6.99 Carat', min: 6.00, max: 6.99 },
  { label: '7.00 To 7.99 Carat', min: 7.00, max: 7.99 },
  { label: '8.00 To 8.99 Carat', min: 8.00, max: 8.99 },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  
  const [gems, setGems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('minPrice') || '', 
    max: searchParams.get('maxPrice') || '' 
  });
  const [selectedCaratTier, setSelectedCaratTier] = useState(searchParams.get('caratTier') || '');

  const [expandedSections, setExpandedSections] = useState({
    precious: true,
    semiPrecious: true,
    carat: true,
    price: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGems();
  }, [searchParams]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name, type');
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchGems = async () => {
    try {
      setLoading(true);
      const search = searchParams.get('search') || '';
      const categoryId = searchParams.get('category') || '';
      const minPrice = searchParams.get('minPrice') || '';
      const maxPrice = searchParams.get('maxPrice') || '';
      const caratTierLabel = searchParams.get('caratTier') || '';

      let query = supabase
        .from('gems')
        .select(`
          *,
          categories(name)
        `);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }

      if (caratTierLabel) {
        const tier = CARAT_TIERS.find(t => t.label === caratTierLabel);
        if (tier) {
          query = query.gte('carat', tier.min).lte('carat', tier.max);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setGems(data || []);
    } catch (err) {
      console.error('Error fetching gems:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchParams(prev => {
      if (searchQuery) prev.set('search', searchQuery);
      else prev.delete('search');
      return prev;
    });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (priceRange.min) prev.set('minPrice', priceRange.min);
      else prev.delete('minPrice');
      if (priceRange.max) prev.set('maxPrice', priceRange.max);
      else prev.delete('maxPrice');
      return prev;
    });
  };

  const updateCaratTier = (label) => {
    setSelectedCaratTier(label);
    setSearchParams(prev => {
      if (label) prev.set('caratTier', label);
      else prev.delete('caratTier');
      return prev;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const preciousGems = categories.filter(c => c.type === 'precious');
  const semiPreciousGems = categories.filter(c => c.type === 'semi-precious');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-3">Gemstone Catalog</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Discover our exclusive collection of precious and semi-precious stones.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold shadow-sm"
        >
          <SlidersHorizontal className="h-5 w-5" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <div className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 sticky top-28 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-8 md:hidden">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Global Search */}
            <div className="mb-10">
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 ml-1">Search</label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find your gem..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-slate-900 dark:text-white transition-all shadow-inner"
                />
              </form>
            </div>

            {/* Precious Gems Section */}
            <div className="mb-8">
              <button 
                onClick={() => toggleSection('precious')}
                className="w-full flex items-center justify-between py-2 mb-2 group"
              >
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Precious Gems</label>
                {expandedSections.precious ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {expandedSections.precious && (
                <div className="space-y-1 mt-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {preciousGems.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchParams(prev => { prev.set('category', cat.id); return prev; });
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-all ${
                        selectedCategory === cat.id 
                        ? 'bg-sapphire-600 text-white font-bold shadow-md shadow-sapphire-600/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {preciousGems.length === 0 && <p className="text-xs text-slate-400 italic">No precious gems listed.</p>}
                </div>
              )}
            </div>

            {/* Semi Precious Section */}
            <div className="mb-8">
              <button 
                onClick={() => toggleSection('semiPrecious')}
                className="w-full flex items-center justify-between py-2 mb-2 group"
              >
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Semi Precious</label>
                {expandedSections.semiPrecious ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {expandedSections.semiPrecious && (
                <div className="space-y-1 mt-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {semiPreciousGems.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchParams(prev => { prev.set('category', cat.id); return prev; });
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-all ${
                        selectedCategory === cat.id 
                        ? 'bg-sapphire-600 text-white font-bold shadow-md shadow-sapphire-600/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {semiPreciousGems.length === 0 && <p className="text-xs text-slate-400 italic">No semi-precious gems listed.</p>}
                </div>
              )}
            </div>

            {/* Carat Section */}
            <div className="mb-8">
              <button 
                onClick={() => toggleSection('carat')}
                className="w-full flex items-center justify-between py-2 mb-2 group"
              >
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Carat Weight</label>
                {expandedSections.carat ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {expandedSections.carat && (
                <div className="space-y-1 mt-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {CARAT_TIERS.map(tier => (
                    <button
                      key={tier.label}
                      onClick={() => updateCaratTier(tier.label)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-all ${
                        selectedCaratTier === tier.label 
                        ? 'bg-gold-500 text-white font-bold shadow-md shadow-gold-500/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedCaratTier('');
                setPriceRange({ min: '', max: '' });
                setSearchParams({});
              }}
              className="w-full mt-4 py-3 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-grow">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 gap-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-4">
              Showing <span className="text-slate-900 dark:text-white font-bold">{gems.length}</span> precious stones
            </span>
            <div className="flex items-center gap-4">
              <select className="bg-slate-50 dark:bg-slate-950 border-none text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-gold-500 block px-6 py-2 cursor-pointer outline-none">
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Carat: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-gold-500" />
              <p className="text-slate-500 font-serif animate-pulse">Consulting the vault...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
              <p className="text-red-500 font-medium">Error loading catalog: {error}</p>
            </div>
          ) : gems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {gems.map(gem => (
                <GemCard key={gem.id} gem={gem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800">
              <Search className="mx-auto h-16 w-16 text-slate-300 mb-6" />
              <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">No stones match your criteria</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Perhaps try adjusting your filters or search terms for a wider selection.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedCaratTier('');
                  setSearchParams({});
                }}
                className="mt-10 px-8 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-2xl shadow-lg shadow-sapphire-600/20 transition-all font-bold"
              >
                Show All Inventory
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
