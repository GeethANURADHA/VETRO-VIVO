import { useState, useEffect } from "react";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GemCard from "../components/GemCard";
import CategoryCard from "../components/CategoryCard";
import { useGems } from "../hooks/useGems";
import { useCategories } from "../hooks/useCategories";
import { GemCardSkeleton, CategoryCardSkeleton } from "../components/Skeletons";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { gems: featuredGems, fetchFeaturedGems, loading: gemsLoading } = useGems();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedGems(3);
    fetchCategories();
  }, [fetchFeaturedGems, fetchCategories]);

  const loading = gemsLoading || categoriesLoading;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">

          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 animate-fade-in-up">
            Unearth the Elegance of <br className="hidden md:block" />
            <span className="text-gold-400">Ceylon Gemstones</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light">
            Discover a curated collection of fully authenticated, ethically
            sourced precious stones from the world's most renowned mines.
          </p>

          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder="Search by gem name, color, or category..."
                className="w-full pl-6 pr-16 py-5 rounded-full bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 p-3 bg-gold-500 hover:bg-gold-600 text-white rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Gems Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                Featured Additions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                Explore our latest meticulously handpicked collection of
                exquisite rarity.
              </p>
            </div>
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 text-sapphire-600 dark:text-gold-500 font-semibold hover:gap-3 transition-all"
            >
              View Full Catalog <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <GemCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredGems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGems.map((gem) => (
                <GemCard key={gem.id} gem={gem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No gems available at the moment.
            </div>
          )}

          <div className="mt-12 md:hidden text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-medium rounded-lg"
            >
              View Full Catalog <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Whether you are looking for deep sea sapphires, fiery rubies, or
              enchanting emeralds.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No categories found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
