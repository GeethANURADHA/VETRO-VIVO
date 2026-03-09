import { Link } from 'react-router-dom';

export default function GemCard({ gem }) {
  // Use WhatsApp buy format spec
  const waBuyUrl = `https://wa.me/9477XXXXXXX?text=I want to buy ${gem.name} ${gem.carat} carat gemstone.`;

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={gem.image_url || 'https://images.unsplash.com/photo-1599725427295-b90302faeb25?auto=format&fit=crop&q=80'} 
          alt={gem.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-sapphire-800 dark:text-gold-500 rounded-full backdrop-blur-sm">
            {gem.categories?.name || 'Gemstone'}
          </span>
          {gem.stock_status === 'sold_out' && (
            <span className="px-3 py-1 text-xs font-semibold bg-red-500/90 text-white rounded-full backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {gem.stock_status === 'in_stock' && (
            <span className="px-3 py-1 text-xs font-semibold bg-green-500/90 text-white rounded-full backdrop-blur-sm">
              In Stock
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-2">{gem.name}</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-semibold text-sapphire-600 dark:text-gold-500">
            ${gem.price?.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {gem.carat} ct
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link 
            to={`/catalog/${gem.id}`} 
            className="text-center px-4 py-2 border border-slate-200 dark:border-slate-700 hover:border-sapphire-500 dark:hover:border-gold-500 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-500"
          >
            View Details
          </Link>
          <a 
            href={waBuyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
