import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  MoreVertical,
  Printer,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { Card, Button } from '@/src/components/UI';
import { cn, formatCurrency, ORDER_STATUS } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

import { Trash2 } from 'lucide-react';
import { useAuthStore } from '@/src/store';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-indigo-100 text-indigo-700',
    ready: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-brand-100 text-brand-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold capitalize", styles[status])}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const OrderManagement = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'owner' || user?.role === 'manager';
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name),
          restaurant_tables(table_number),
          order_items(
            *,
            food_items(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this order? This will remove it from revenue records.')) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-brand-900">Live Orders</h2>
          <p className="text-brand-500">Monitor and manage incoming orders in real-time.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            <Printer size={18} className="mr-2" />
            Print All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-brand-400 border-2 border-dashed border-brand-200 rounded-3xl">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p>No orders yet. They will appear here in real-time.</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="hover:shadow-2xl transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-900 font-bold">
                      {order.restaurant_tables?.table_number || 'DL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-lg">#{order.id?.slice(0, 8) || '...'}</h4>
                        <StatusBadge status={order.status} />
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          order.order_type === 'delivery' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {order.order_type || 'Dine-in'}
                        </span>
                      </div>
                      <p className="text-sm text-brand-500">
                        {order.profiles?.full_name || 'Guest'} • {order.order_items?.map((i: any) => `${i.food_items?.name} x${i.quantity}`).join(', ')}
                      </p>
                      {order.order_type === 'delivery' && order.delivery_address && (
                        <p className="text-xs text-brand-400 mt-1 italic">
                          Address: {order.delivery_address} • Phone: {order.customer_phone || 'N/A'}
                        </p>
                      )}
                      {order.order_type === 'dine-in' && order.customer_phone && (
                        <p className="text-xs text-brand-400 mt-1 italic">
                          Phone: {order.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-900">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-brand-400 flex items-center justify-end gap-1">
                        <Clock size={12} />
                        {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'pending' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, 'preparing');
                          }}
                        >
                          Accept
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, 'ready');
                          }}
                        >
                          Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, 'completed');
                          }}
                        >
                          Complete
                        </Button>
                      )}
                      {isAdmin && (
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Cancel this order?')) {
                            updateStatus(order.id, 'cancelled');
                          }
                        }}
                      >
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                    <ChevronRight size={20} className="text-brand-300" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
