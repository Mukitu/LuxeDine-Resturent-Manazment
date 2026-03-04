import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  MoreVertical,
  Printer
} from 'lucide-react';
import { Card, Button } from '@/src/components/UI';
import { cn, formatCurrency, ORDER_STATUS } from '@/src/lib/utils';

const orders = [
  { 
    id: 'ORD-7241', 
    table: 'Table 04', 
    customer: 'John Doe', 
    items: ['Truffle Pasta x2', 'Red Wine x1'], 
    total: 64.00, 
    status: 'preparing',
    time: '12 mins ago'
  },
  { 
    id: 'ORD-7242', 
    table: 'Delivery', 
    customer: 'Sarah Smith', 
    items: ['Wagyu Burger x1', 'Fries x1'], 
    total: 24.50, 
    status: 'pending',
    time: '5 mins ago'
  },
  { 
    id: 'ORD-7243', 
    table: 'Table 12', 
    customer: 'Mike Ross', 
    items: ['Caesar Salad x1'], 
    total: 12.50, 
    status: 'ready',
    time: '25 mins ago'
  },
];

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
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-brand-900">Live Orders</h2>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            <Printer size={18} className="mr-2" />
            Print All
          </Button>
          <Button size="sm">
            <Plus size={18} className="mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="hover:shadow-2xl transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-900 font-bold">
                    {order.table.split(' ')[1] || 'DL'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-lg">{order.id}</h4>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-brand-500">
                      {order.customer} • {order.items.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-brand-400 flex items-center justify-end gap-1">
                      <Clock size={12} />
                      {order.time}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </Button>
                    <Button variant="secondary" size="icon">
                      <MoreVertical size={18} />
                    </Button>
                  </div>
                  <ChevronRight size={20} className="text-brand-300" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import { Plus } from 'lucide-react';
