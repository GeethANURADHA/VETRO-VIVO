import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Gem, Users, Eye, TrendingUp, Loader2, MessageSquare, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { inquiriesApi, gemsApi } from '../services/api';
import { logger } from '../lib/logger';

// Palette for Category Pie Chart
const COLORS = [
  '#0f4c81', // Sapphire Blue
  '#d97706', // Gold/Amber
  '#10b981', // Emerald Green
  '#e11d48', // Ruby Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6b7280', // Slate Grey
];

export default function Dashboard() {
  const { role } = useAuth();
  const { stats, gemsByCategory, inquiriesOverTime, loading, error } = useStats(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Fetch recent activity: latest 3 gems and latest 3 inquiries
  useEffect(() => {
    async function fetchActivity() {
      try {
        setActivityLoading(true);
        const [gems, inquiries] = await Promise.all([
          gemsApi.getFeatured(3),
          inquiriesApi.getAll()
        ]);

        const activities = [];

        // Format gems activity
        gems.forEach(gem => {
          activities.push({
            id: `gem-${gem.id}`,
            type: 'gem',
            title: `New Gem Listed: ${gem.name}`,
            subtitle: `${gem.carat} ct | $${gem.price.toLocaleString()}`,
            timestamp: new Date(gem.created_at),
            icon: Gem,
            iconColor: 'text-sapphire-600 dark:text-gold-500',
            iconBg: 'bg-sapphire-50 dark:bg-sapphire-900/30'
          });
        });

        // Format inquiries activity
        inquiries.slice(0, 3).forEach(inq => {
          activities.push({
            id: `inq-${inq.id}`,
            type: 'inquiry',
            title: `New Inquiry from ${inq.user_name}`,
            subtitle: inq.gems?.name ? `Regarding: ${inq.gems.name}` : `Message: ${inq.message.slice(0, 45)}...`,
            timestamp: new Date(inq.created_at),
            icon: MessageSquare,
            iconColor: 'text-green-500',
            iconBg: 'bg-green-50 dark:bg-green-900/30'
          });
        });

        // Sort by timestamp descending
        activities.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivity(activities.slice(0, 5));
      } catch (err) {
        logger.error('Failed to load recent activity feed', err);
      } finally {
        setActivityLoading(false);
      }
    }

    fetchActivity();
  }, [stats.totalGems, stats.totalInquiries]); // Re-run when stats change (realtime triggers)

  const dashboardStats = [
    { title: 'Total Gems', value: stats.totalGems, icon: Gem, color: 'text-sapphire-600 dark:text-gold-500', bg: 'bg-sapphire-50 dark:bg-sapphire-900/30' },
    { title: 'Estimated Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { title: 'Active Inquiries', value: stats.totalInquiries, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

  if (role === 'main_admin') {
    dashboardStats.push({ title: 'Total Admins', value: stats.totalAdmins, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' });
  }

  // Format time elapsed
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back to the marketplace control center.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 rounded-xl">
          Error loading dashboard stats: {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && stats.totalGems === 0 ? (
          Array.from({ length: role === 'main_admin' ? 4 : 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 animate-pulse">
              <div className="p-7 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : (
          dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-xl flex-shrink-0 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inquiries Over Time - Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Inquiries Trend</h2>
          
          <div className="h-80 w-full">
            {loading && inquiriesOverTime.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
              </div>
            ) : inquiriesOverTime.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <TrendingUp className="h-10 w-10 mb-2 opacity-50" />
                <p>No inquiry history available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inquiriesOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                    }}
                  />
                  <Line type="monotone" dataKey="inquiries" stroke="#0f4c81" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gems by Category - Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Gems by Category</h2>
          
          <div className="h-60 w-full flex items-center justify-center">
            {loading && gemsByCategory.length === 0 ? (
              <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            ) : gemsByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Gem className="h-10 w-10 mb-2 opacity-50" />
                <p>No categories with gems listed.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gemsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gemsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legends */}
          <div className="mt-4 max-h-24 overflow-y-auto space-y-2 custom-scrollbar">
            {gemsByCategory.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-40">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity and Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Recent Live Activity</h2>
          
          <div className="space-y-6">
            {activityLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-slate-500 text-sm italic py-4">No recent activity detected.</p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-slate-800/10 p-2 rounded-xl transition-all">
                    <div className={`p-2.5 rounded-full flex-shrink-0 ${activity.iconBg}`}>
                      <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white font-semibold truncate">{activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{activity.subtitle}</p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap pt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">Quick Management Actions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create new catalog listings or category segments immediately.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/admin/gems/add" 
              className="flex items-center justify-center gap-3 p-5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-sapphire-500 dark:hover:border-gold-500 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-500 font-bold transition-all text-center group active:scale-95"
            >
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
              <span>Add New Gem</span>
            </a>
            <a 
              href="/admin/categories/add" 
              className="flex items-center justify-center gap-3 p-5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-sapphire-500 dark:hover:border-gold-500 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-sapphire-600 dark:hover:text-gold-500 font-bold transition-all text-center group active:scale-95"
            >
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
              <span>Add Category</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
