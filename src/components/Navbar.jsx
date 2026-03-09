import { Link, useNavigate } from "react-router-dom";
import {
  Gem,
  Menu,
  Search,
  User,
  Moon,
  Sun,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CARAT_TIERS = [
  { label: "Points (Below 1.00 Carat)", min: 0, max: 0.99 },
  { label: "1.00 To 1.49 Carat", min: 1.0, max: 1.49 },
  { label: "1.50 To 1.99 Carat", min: 1.5, max: 1.99 },
  { label: "2.00 To 2.49 Carat", min: 2.0, max: 2.49 },
  { label: "2.50 To 2.99 Carat", min: 2.5, max: 2.99 },
  { label: "3.00 To 3.49 Carat", min: 3.0, max: 3.49 },
  { label: "3.50 To 3.99 Carat", min: 3.5, max: 3.99 },
  { label: "4.00 To 4.49 Carat", min: 4.0, max: 4.49 },
  { label: "4.50 To 4.99 Carat", min: 4.5, max: 4.99 },
  { label: "5.00 To 5.99 Carat", min: 5.0, max: 5.99 },
  { label: "6.00 To 6.99 Carat", min: 6.0, max: 6.99 },
  { label: "7.00 To 7.99 Carat", min: 7.0, max: 7.99 },
  { label: "8.00 To 8.99 Carat", min: 8.0, max: 8.99 },
];

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, type");
    if (data) setCategories(data);
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const navigateToFilter = (type, value) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    if (type === "category") {
      navigate(`/catalog?category=${value}`);
    } else if (type === "carat") {
      navigate(`/catalog?caratTier=${encodeURIComponent(value)}`);
    }
  };

  const preciousGems = categories.filter((c) => c.type === "precious");
  const semiPreciousGems = categories.filter((c) => c.type === "semi-precious");

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-sapphire-800 dark:text-gold-500"
            >
              <Gem className="h-8 w-8" />
              <span className="font-serif text-2xl font-bold tracking-tight hidden lg:block">
                VETRO VIVO
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Precious Gems Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setActiveDropdown("precious")}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-400 font-medium py-7 transition-colors"
              >
                Precious Gems <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === "precious" && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-b-xl py-4"
                >
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto custom-scrollbar px-2">
                    {preciousGems.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => navigateToFilter("category", cat.id)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sapphire-600 dark:hover:text-gold-500 transition-colors rounded-lg"
                      >
                        {cat.name}
                      </button>
                    ))}
                    {preciousGems.length === 0 && (
                      <span className="px-4 py-2 text-xs text-slate-400">
                        No precious gems found.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Semi Precious Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setActiveDropdown("semiPrecious")}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-400 font-medium py-7 transition-colors"
              >
                Semi Precious <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === "semiPrecious" && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-b-xl py-4"
                >
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto custom-scrollbar px-2">
                    {semiPreciousGems.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => navigateToFilter("category", cat.id)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sapphire-600 dark:hover:text-gold-500 transition-colors rounded-lg"
                      >
                        {cat.name}
                      </button>
                    ))}
                    {semiPreciousGems.length === 0 && (
                      <span className="px-4 py-2 text-xs text-slate-400">
                        No semi-precious gems found.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Carat Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setActiveDropdown("carat")}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-400 font-medium py-7 transition-colors"
              >
                Carat <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === "carat" && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full left-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-b-xl py-4"
                >
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto custom-scrollbar px-2">
                    {CARAT_TIERS.map((tier) => (
                      <button
                        key={tier.label}
                        onClick={() => navigateToFilter("carat", tier.label)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sapphire-600 dark:hover:text-gold-500 transition-colors rounded-lg"
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className="text-slate-600 hover:text-sapphire-600 dark:text-slate-300 dark:hover:text-gold-400 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <Link
              to="/login"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 animate-slide-down shadow-xl overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-4 py-6 space-y-2">
            {/* Precious Gems Mobile */}
            <div className="mb-4">
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Precious Gems
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {preciousGems.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigateToFilter("category", cat.id)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Semi Precious Mobile */}
            <div className="mb-4">
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Semi Precious
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {semiPreciousGems.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigateToFilter("category", cat.id)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Carat Mobile */}
            <div className="mb-4">
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Carat Weight
              </h3>
              <div className="flex flex-wrap gap-2 px-4 py-2">
                {CARAT_TIERS.map((tier) => (
                  <button
                    key={tier.label}
                    onClick={() => navigateToFilter("carat", tier.label)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gold-500 hover:text-white transition-colors"
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/contact"
              className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
