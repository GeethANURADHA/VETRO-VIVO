import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link 
      to={`/catalog?category=${category.id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
    >
      <img 
        src={category.image_url || 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80'} 
        alt={category.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <h3 className="font-serif text-2xl font-bold text-white mb-2">{category.name}</h3>
        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          Explore collection →
        </p>
      </div>
    </Link>
  );
}
