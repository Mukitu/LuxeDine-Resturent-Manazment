import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Smartphone, 
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, Button, Input } from '@/src/components/UI';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

import { useAuthStore } from '@/src/store';

const providers = [
  { id: 'bkash', name: 'bKash', color: 'bg-pink-500' },
  { id: 'nagad', name: 'Nagad', color: 'bg-orange-500' },
  { id: 'rocket', name: 'Rocket', color: 'bg-purple-600' },
];

export const PaymentSettings = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'owner';
  const [settings, setSettings] = useState<Record<string, string>>({
    bkash: '',
    nagad: '',
    rocket: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*');
        
        if (error) throw error;
        
        const settingsMap: Record<string, string> = {};
        data.forEach((item: any) => {
          settingsMap[item.provider] = item.account_number;
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      } catch (error: any) {
        console.error('Error fetching payment settings:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const provider of providers) {
        const { error } = await supabase
          .from('payment_settings')
          .upsert({ 
            provider: provider.id, 
            account_number: settings[provider.id],
            updated_at: new Date().toISOString()
          }, { onConflict: 'provider' });
        
        if (error) throw error;
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setIsSaving(false);
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
        <h2 className="text-3xl font-display font-bold text-brand-900">Payment Settings</h2>
        <Button onClick={handleSave} isLoading={isSaving} disabled={!isAdmin}>
          <Save size={18} className="mr-2" />
          Save Changes
        </Button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 font-bold"
        >
          <CheckCircle2 size={20} />
          Payment numbers updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-2", provider.color)} />
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("p-3 rounded-2xl text-white", provider.color)}>
                <Smartphone size={24} />
              </div>
              <h4 className="text-xl font-bold">{provider.name} Number</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-400 uppercase mb-2 block">Account Number</label>
                <Input 
                  value={settings[provider.id]} 
                  onChange={(e) => setSettings({...settings, [provider.id]: e.target.value})}
                  placeholder="Enter number"
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Active for customers
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-brand-900 text-white border-none">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/10 rounded-3xl">
            <CreditCard size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-1">Payment Verification</h4>
            <p className="text-brand-300 text-sm">
              Customers will see these numbers during checkout. After they pay, you can verify their Transaction ID in the Orders section.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
