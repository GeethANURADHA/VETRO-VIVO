import { useState, useEffect, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GemCard from "../components/GemCard";
import CategoryCard from "../components/CategoryCard";
import { useGems } from "../hooks/useGems";
import { useCategories } from "../hooks/useCategories";
import { useHomepageSettings } from "../hooks/useHomepageSettings";
import { GemCardSkeleton, CategoryCardSkeleton } from "../components/Skeletons";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gemsError, setGemsError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const { gems: featuredGems, fetchFeaturedGems, loading: gemsLoading } = useGems();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
  const { settings } = useHomepageSettings();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedGems(3).catch(e => setGemsError(e.message));
    fetchCategories().catch(e => setCategoriesError(e.message));
  }, [fetchFeaturedGems, fetchCategories]);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ── Compute hero styles from settings ──
  const heroBackground = useMemo(() => {
    if (!settings) return { backgroundColor: '#6e7380' };
    if (settings.hero_bg_image_url) {
      return {
        backgroundImage: `url(${settings.hero_bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { backgroundColor: '#6e7380' };
  }, [settings]);

  const overlayStyle = useMemo(() => {
    if (!settings) return { backgroundColor: 'rgba(0,0,0,0.65)' };
    const hex = settings.hero_overlay_color || '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = (settings.hero_overlay_opacity ?? 65) / 100;
    return { backgroundColor: `rgba(${r},${g},${b},${a})` };
  }, [settings]);

  const welcomeText = settings?.hero_welcome_text || 'Welcome to VETRO VIVO';
  const headline =
    settings?.hero_headline ||
    "We bring the enchantment and purity of Sri Lanka's (ancient Ceylon) rarest gemstones directly to Naples and all of Europe. Every stone we offer tells a story of earth, light, and authenticity.";
  const paragraph =
    settings?.hero_paragraph ||
    'Why Choose Us?\n\nCertified Authenticity: Each gemstone is sourced directly by experts with generations of experience in the gem trade and is accompanied by official, recognized certificates.\nTotal Transparency: From the mine to the final cut, we guarantee 100% natural, untreated, and ethically sourced stones.\nLocal Presence, Global Trust: Based in Naples, we provide the security of direct customer support, insured shipping, and a guaranteed return policy under European laws.\n\nExplore our collection and find the gemstone that will illuminate your story.';

  return (
    <div className="flex flex-col">
      {/* ═══════════ Hero Section ═══════════ */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={heroBackground}
      >
        {/* Dynamic overlay */}
        <div className="absolute inset-0 z-0" style={overlayStyle} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
          {/* Welcome badge */}
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70 font-medium mb-6 animate-fade-in-up">
            {welcomeText}
          </p>

          {/* Luxury headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gold-400 mb-8 animate-fade-in-up leading-tight max-w-4xl mx-auto">
            {headline}
          </h1>

          {/* Supporting paragraph */}
          <div className="text-base sm:text-lg md:text-xl text-slate-200/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up whitespace-pre-line">
            {paragraph}
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto animate-fade-in-up">
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

          {gemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <GemCardSkeleton key={i} />
              ))}
            </div>
          ) : gemsError ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-3 font-medium">Could not load gems</p>
              <p className="text-slate-400 text-sm mb-6">{gemsError}</p>
              <button onClick={() => { setGemsError(null); fetchFeaturedGems(3).catch(e => setGemsError(e.message)); }}
                className="px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg text-sm transition-colors">
                Retry
              </button>
            </div>
          ) : featuredGems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGems.map((gem) => (
                <GemCard key={gem.id} gem={gem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">💎</p>
              <p className="text-slate-500 font-medium">No gems listed yet.</p>
              <p className="text-slate-400 text-sm mt-2">Add gems via the admin panel to display them here.</p>
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

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-3 font-medium">Could not load categories</p>
              <p className="text-slate-400 text-sm mb-6">{categoriesError}</p>
              <button onClick={() => { setCategoriesError(null); fetchCategories().catch(e => setCategoriesError(e.message)); }}
                className="px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg text-sm transition-colors">
                Retry
              </button>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🗂️</p>
              <p className="text-slate-500 font-medium">No categories yet.</p>
              <p className="text-slate-400 text-sm mt-2">Add categories via the admin panel to display them here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
