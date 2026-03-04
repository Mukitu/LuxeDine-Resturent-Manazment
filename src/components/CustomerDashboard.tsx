import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Phone,
  Utensils,
  History,
  User as UserIcon
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store';
import { Card, Button } from '@/src/components/UI';
import { cn, formatCurrency } from '@/src/lib/utils';

export const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, food_items(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        // Filter orders by customer_phone if available, otherwise show all for now (or fix schema)
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-emerald-100 text-emerald-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-brand-100 text-brand-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-brand-900 mb-2">Welcome back, {user?.full_name}</h2>
          <p className="text-brand-500">Track your orders and manage your dining experience.</p>
        </div>
        <div className="flex gap-4">
          <Card className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm border-none">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Total Orders</p>
              <p className="text-2xl font-bold text-brand-900">{orders.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="text-brand-900" size={24} />
            <h3 className="text-2xl font-display font-bold text-brand-900">Order History</h3>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-brand-200 bg-transparent">
              <Package size={48} className="mx-auto mb-4 text-brand-200" />
              <p className="text-brand-500 mb-6">You haven't placed any orders yet.</p>
              <Button onClick={() => window.location.href = '/'}>Browse Menu</Button>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                <div className="p-6 border-b border-brand-50 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-900 font-bold">
                      #{order.id?.slice(0, 4) || '...'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-900">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'N/A'}
                      </p>
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-1",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-brand-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-brand-900">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
                
                <div className="p-6 bg-brand-50/30">
                  <div className="space-y-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-brand-100 text-brand-900 text-[10px] font-bold flex items-center justify-center rounded-md">
                            {item.quantity}x
                          </span>
                          <p className="text-sm font-medium text-brand-900">{item.food_items?.name}</p>
                        </div>
                        <p className="text-sm font-bold text-brand-600">{formatCurrency(item.price_at_time * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-brand-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-brand-500">
                      {order.order_type === 'dine-in' ? (
                        <>
                          <Utensils size={16} />
                          <span>Dine-in • Table {order.table_id || 'N/A'}</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={16} />
                          <span className="line-clamp-1">{order.delivery_address}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-brand-500 md:justify-end">
                      <Phone size={16} />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-md bg-brand-900 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <UserIcon size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold">{user?.full_name}</h4>
                <p className="text-brand-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button variant="secondary" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                Edit Profile
              </Button>
              <Button variant="ghost" className="w-full text-brand-400 hover:text-white" onClick={() => window.location.href = '/'}>
                Back to Menu
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-md">
            <h4 className="font-bold text-brand-900 mb-6">Need Help?</h4>
            <p className="text-sm text-brand-500 mb-6">
              If you have any issues with your order, please contact our support team.
            </p>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
