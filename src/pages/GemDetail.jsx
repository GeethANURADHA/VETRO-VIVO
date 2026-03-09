import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function GemDetail() {
  const { id } = useParams();
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGem();
  }, [id]);

  const fetchGem = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gems")
        .select(
          `
          *,
          categories(name)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setGem(data);
    } catch (err) {
      console.error("Error fetching gem:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareGem = () => {
    if (navigator.share) {
      navigator.share({
        title: gem?.name,
        text: `Check out this beautiful ${gem?.name} on VETRO VIVO!`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sapphire-600 dark:text-gold-500" />
      </div>
    );
  }

  if (error || !gem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">
          Gemstone not found
        </h2>
        <p className="text-slate-600 mb-6 text-center">
          The gemstone you are looking for might have been sold or removed.
        </p>
        <Link
          to="/catalog"
          className="px-6 py-2 bg-sapphire-600 text-white rounded-lg"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${gem.name} (ID: ${gem.id}) listed on your website. Is it still available?`,
  );
  const whatsappUrl = `https://wa.me/94771234567?text=${whatsappMessage}`; // Replace with actual phone number

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-sapphire-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <img
              src={
                gem.image_url ||
                "https://via.placeholder.com/600?text=No+Image+Available"
              }
              alt={gem.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-sapphire-50 dark:bg-sapphire-900/30 text-sapphire-600 dark:text-gold-500 text-sm font-medium rounded-full mb-4">
              {gem.categories?.name || "Uncategorized"}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              {gem.name}
            </h1>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-3xl font-bold text-sapphire-600 dark:text-gold-500">
                ${gem.price?.toLocaleString()}
              </span>
              <span className="text-lg text-slate-400">|</span>
              <span className="text-lg text-slate-600 dark:text-slate-400">
                {gem.carat} Carats
              </span>
            </div>
            {gem.stock_status === "sold_out" && (
              <div className="mb-6 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium inline-block">
                Sold Out
              </div>
            )}
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {gem.description ||
                "No description available for this exquisite gemstone."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-grow flex items-center justify-center gap-2 px-8 py-4 bg-sapphire-600 hover:bg-sapphire-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-sapphire-600/20 transition-all active:scale-95"
            >
              <MessageSquare className="h-5 w-5" /> Inquire on WhatsApp
            </a>
            <button
              onClick={shareGem}
              className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-gold-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Authenticated
                </h4>
                <p className="text-xs text-slate-500">
                  GIA/NGJA certified stones
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 text-gold-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Secure Shipping
                </h4>
                <p className="text-xs text-slate-500">
                  Fully insured global delivery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-6 w-6 text-gold-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Return Policy
                </h4>
                <p className="text-xs text-slate-500">
                  7-day inspection period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
