import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  QrCode, 
  Trash2, 
  Edit3,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, Button, Input } from '@/src/components/UI';
import { cn } from '@/src/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const tables = [
  { id: '1', number: '01', capacity: 4, status: 'available', waiter: 'Sarah J.' },
  { id: '2', number: '02', capacity: 2, status: 'occupied', waiter: 'Mike R.' },
  { id: '3', number: '03', capacity: 6, status: 'reserved', waiter: 'Sarah J.' },
  { id: '4', number: '04', capacity: 4, status: 'cleaning', waiter: 'John D.' },
];

export const TableManagement = () => {
  const [showQR, setShowQR] = React.useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-brand-900">Tables & QR Codes</h2>
        <Button size="sm">
          <Plus size={18} className="mr-2" />
          Add Table
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="relative group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-brand-950 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                {table.number}
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                table.status === 'available' ? "bg-emerald-100 text-emerald-700" :
                table.status === 'occupied' ? "bg-blue-100 text-blue-700" :
                table.status === 'reserved' ? "bg-amber-100 text-amber-700" :
                "bg-brand-100 text-brand-700"
              )}>
                {table.status}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-brand-600">
                <Users size={16} />
                <span>Capacity: {table.capacity} Persons</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-600">
                <User size={16} />
                <span>Waiter: {table.waiter}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowQR(table.number)}
              >
                <QrCode size={16} className="mr-2" />
                QR Code
              </Button>
              <Button variant="secondary" size="icon">
                <Edit3 size={16} />
              </Button>
              <Button variant="secondary" size="icon" className="text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center"
          >
            <h3 className="text-2xl font-display font-bold mb-2">Table {showQR}</h3>
            <p className="text-brand-500 text-sm mb-8">Scan to view menu and order</p>
            
            <div className="bg-brand-50 p-8 rounded-3xl mb-8 flex justify-center">
              <QRCodeSVG 
                value={`https://luxedine.com/table/${showQR}`} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => window.print()}>Print QR</Button>
              <Button variant="ghost" className="flex-1" onClick={() => setShowQR(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

import { Plus, User } from 'lucide-react';
