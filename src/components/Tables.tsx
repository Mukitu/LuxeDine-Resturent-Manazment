import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  QrCode, 
  Trash2, 
  Edit3,
  CheckCircle2,
  XCircle,
  Plus,
  User,
  Loader2,
  X
} from 'lucide-react';
import { Card, Button, Input } from '@/src/components/UI';
import { cn } from '@/src/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/src/lib/supabase';

import { useAuthStore } from '@/src/store';

export const TableManagement = () => {
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'owner' || user?.role === 'manager';
  const isAdmin = user?.role === 'owner';
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingTable, setEditingTable] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    status: 'available'
  });

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*, profiles(full_name)')
        .order('table_number');
      
      if (error) throw error;
      setTables(data || []);
    } catch (error: any) {
      console.error('Error fetching tables:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        table_number: formData.table_number,
        capacity: parseInt(formData.capacity.toString()),
        status: formData.status
      };

      if (editingTable) {
        const { error } = await supabase
          .from('restaurant_tables')
          .update(payload)
          .eq('id', editingTable.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Table updated successfully!' });
      } else {
        const { error } = await supabase.from('restaurant_tables').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Table added successfully!' });
      }

      setIsModalOpen(false);
      setEditingTable(null);
      setFormData({ table_number: '', capacity: 4, status: 'available' });
      fetchTables();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (table: any) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
      if (error) throw error;
      setTables(tables.filter(t => t.id !== id));
      setMessage({ type: 'success', text: 'Table deleted' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
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
          <h2 className="text-3xl font-display font-bold text-brand-900">Tables & QR Codes</h2>
          <p className="text-brand-500">Manage your restaurant layout and generate ordering QR codes.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Table
        </Button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl flex items-center gap-3 font-bold",
            message.type === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}
        >
          <CheckCircle2 size={20} />
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-brand-400 border-2 border-dashed border-brand-200 rounded-3xl">
            <QrCode size={48} className="mb-4 opacity-20" />
            <p>No tables found. Add your first table!</p>
          </div>
        ) : (
          tables.map((table) => (
            <Card key={table.id} className="relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-brand-950 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                  {table.table_number}
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
                  <span>Waiter: {table.profiles?.full_name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowQR(table.table_number)}
                >
                  <QrCode size={16} className="mr-2" />
                  QR Code
                </Button>
                <Button variant="secondary" size="icon" onClick={() => handleEdit(table)}>
                  <Edit3 size={16} />
                </Button>
                {isAuthorized && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTable(null);
                  setFormData({ table_number: '', capacity: 4, status: 'available' });
                }} 
                className="p-2 hover:bg-brand-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-900">Table Number / Name</label>
                <Input 
                  required
                  placeholder="e.g. 01 or VIP-1" 
                  value={formData.table_number}
                  onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-900">Capacity (Persons)</label>
                <Input 
                  required
                  type="number"
                  placeholder="e.g. 4" 
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-900">Initial Status</label>
                <select 
                  className="w-full h-12 px-4 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-900/10 transition-all text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTable(null);
                    setFormData({ table_number: '', capacity: 4, status: 'available' });
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" type="submit" isLoading={isSubmitting}>
                  {editingTable ? 'Update Table' : 'Add Table'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                value={`${window.location.origin}/table/${showQR}`} 
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
