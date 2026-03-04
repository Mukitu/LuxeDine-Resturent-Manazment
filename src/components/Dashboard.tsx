import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
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
import { formatCurrency } from '@/src/lib/utils';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 2000, orders: 12 },
  { name: 'Thu', revenue: 2780, orders: 20 },
  { name: 'Fri', revenue: 1890, orders: 15 },
  { name: 'Sat', revenue: 2390, orders: 25 },
  { name: 'Sun', revenue: 3490, orders: 30 },
];

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

import { cn } from '@/src/lib/utils';

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-brand-900">Overview</h2>
          <p className="text-brand-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-brand-200 rounded-xl px-4 py-2 text-sm outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(12840)} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="12.5" 
        />
        <StatCard 
          title="Total Orders" 
          value="482" 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="8.2" 
        />
        <StatCard 
          title="Active Customers" 
          value="1,240" 
          icon={Users} 
          trend="down" 
          trendValue="3.1" 
        />
        <StatCard 
          title="Avg. Prep Time" 
          value="18 min" 
          icon={Clock} 
          trend="up" 
          trendValue="2.4" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-[400px]">
          <h4 className="text-lg font-bold mb-6">Revenue Analytics</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
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
            <BarChart data={data}>
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
