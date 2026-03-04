import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { Card } from '@/src/components/UI';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency, cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <Card className="relative overflow-hidden group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-brand-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-900">{value}</h3>
      </div>
      <div className="p-3 bg-brand-100 rounded-2xl text-brand-900 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={cn(
        "flex items-center text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}%
      </span>
      <span className="text-xs text-brand-400">vs last week</span>
    </div>
  </Card>
);

export const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    prepTime: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch real stats from Supabase
        const { data: orders } = await supabase.from('orders').select('total_amount, status');
        const { count: customerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        
        const totalRevenue = orders?.reduce((acc, o) => acc + (o.status === 'completed' ? Number(o.total_amount) : 0), 0) || 0;
        const totalOrders = orders?.length || 0;

        setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          customers: customerCount || 0,
          prepTime: 15 // Mock for now as we don't track prep time yet
        });

        // Empty chart data for now
        setChartData([
          { name: 'Mon', revenue: 0, orders: 0 },
          { name: 'Tue', revenue: 0, orders: 0 },
          { name: 'Wed', revenue: 0, orders: 0 },
          { name: 'Thu', revenue: 0, orders: 0 },
          { name: 'Fri', revenue: 0, orders: 0 },
          { name: 'Sat', revenue: 0, orders: 0 },
          { name: 'Sun', revenue: 0, orders: 0 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-brand-900">Overview</h2>
          <p className="text-brand-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue)} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="0" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="0" 
        />
        <StatCard 
          title="Active Customers" 
          value={stats.customers} 
          icon={Users} 
          trend="up" 
          trendValue="0" 
        />
        <StatCard 
          title="Avg. Prep Time" 
          value={`${stats.prepTime} min`} 
          icon={Clock} 
          trend="up" 
          trendValue="0" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-[400px]">
          <h4 className="text-lg font-bold mb-6">Revenue Analytics</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-[400px]">
          <h4 className="text-lg font-bold mb-6">Orders by Day</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="orders" fill="#0f172a" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
