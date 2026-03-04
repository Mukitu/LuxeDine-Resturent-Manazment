import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, 
  Mail,
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, Button } from '@/src/components/UI';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

import { useAuthStore } from '@/src/store';

export const StaffManagement = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'owner';
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setStaff(staff.map(s => s.id === userId ? { ...s, role: newRole } : s));
      setMessage({ type: 'success', text: 'Role updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(null);
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
        <h2 className="text-3xl font-display font-bold text-brand-900">Staff & Permissions</h2>
        <Button size="sm">
          <UserPlus size={18} className="mr-2" />
          Invite Staff
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

      <div className="grid grid-cols-1 gap-4">
        {staff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-900 font-bold text-xl">
                  {member.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-lg">{member.full_name || 'Anonymous User'}</h4>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      member.role === 'owner' ? "bg-brand-950 text-white" :
                      member.role === 'manager' ? "bg-blue-100 text-blue-700" :
                      member.role === 'waiter' ? "bg-emerald-100 text-emerald-700" :
                      "bg-brand-100 text-brand-700"
                    )}>
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-brand-500">
                    <span className="flex items-center gap-1"><Mail size={14} /> {member.email}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> 
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-xs text-brand-400 font-bold uppercase tracking-tighter">Change Role</span>
                  <div className="flex items-center gap-2">
                    {isUpdating === member.id && <Loader2 size={14} className="animate-spin text-brand-500" />}
                    <select 
                      disabled={!isAdmin || isUpdating === member.id || member.email === 'mukituislamnishat@gmail.com'}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="bg-transparent border-none text-sm font-bold text-brand-900 outline-none cursor-pointer disabled:opacity-50"
                      value={member.role}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="waiter">Waiter</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
