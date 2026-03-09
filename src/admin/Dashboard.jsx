import { useAuth } from '../hooks/useAuth';
import { Gem, Users, Eye, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { role } = useAuth();

  const stats = [
    { title: 'Total Gems', value: '1,245', icon: Gem, color: 'text-sapphire-600 dark:text-gold-500', bg: 'bg-sapphire-50 dark:bg-sapphire-900/30' },
    { title: 'Total Views', value: '45.2K', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { title: 'Active Inquiries', value: '28', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

  if (role === 'main_admin') {
    stats.push({ title: 'Total Admins', value: '3', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back to the marketplace control center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-xl flex-shrink-0 ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-sapphire-500 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-slate-900 dark:text-white font-medium">New Gem Added: Royal Blue Sapphire</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-slate-900 dark:text-white font-medium">System Update Completed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Yesterday at 4:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
