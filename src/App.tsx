import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LogIn, 
  ShoppingBag, 
  Menu as MenuIcon, 
  User, 
  LayoutDashboard,
  QrCode,
  Home,
  UtensilsCrossed
} from 'lucide-react';
import { useAuthStore, useCartStore } from '@/src/store';
import { supabase } from '@/src/lib/supabase';
import { Sidebar, TopBar } from '@/src/components/Layout';
import { Dashboard } from '@/src/components/Dashboard';
import { CustomerMenu, CartDrawer } from '@/src/components/Customer';
import { CustomerDashboard } from '@/src/components/CustomerDashboard';
import { OrderManagement } from '@/src/components/Orders';
import { TableManagement } from '@/src/components/Tables';
import { MenuManagement } from '@/src/components/MenuManagement';
import { StaffManagement } from '@/src/components/Staff';
import { PaymentSettings } from '@/src/components/PaymentSettings';
import { Button, Card, Input } from '@/src/components/UI';
import { cn } from '@/src/lib/utils';

export default function App() {
  const { user, setUser } = useAuthStore();
  const { items, isCartOpen, setCartOpen } = useCartStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customerTab, setCustomerTab] = useState<'menu' | 'dashboard'>('menu');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleAuth = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: loginEmail,
          password: loginPassword,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        alert('Signup successful! Please check your email for verification or sign in if auto-confirmed.');
        setAuthMode('signin');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) throw error;
        
        // Fetch profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role
          });
        }
        setIsLoginOpen(false);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col">
        <nav className="h-24 bg-transparent absolute top-0 left-0 right-0 px-8 flex items-center justify-between z-50">
          <h1 className="text-3xl font-display font-bold tracking-tighter text-white">
            Luxe<span className="text-brand-400">Dine</span>
          </h1>
          <div className="flex items-center gap-8">
            <button className="text-white/80 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors">Menu</button>
            <button className="text-white/80 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors">Experience</button>
            <button className="text-white/80 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors">Contact</button>
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setIsLoginOpen(true)}>Login</Button>
            <button 
              onClick={() => setCartOpen(true)}
              className="p-4 bg-white text-brand-950 rounded-full relative hover:scale-110 transition-transform shadow-xl"
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-brand-400 text-brand-950 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        <main className="flex-1">
          <CustomerMenu />
        </main>

        <footer className="bg-brand-950 text-white py-16 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">LuxeDine</h2>
              <p className="text-brand-400 text-sm">
                Elevating the dining experience through technology and culinary excellence.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-brand-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Our Menu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reservations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Delivery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-3 text-brand-400 text-sm">
                <li>Woman Collage Gate, Rajshahi</li>
                <li>+969372938</li>
                <li>hello@luxedine.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Newsletter</h4>
              <div className="flex gap-2">
                <Input placeholder="Email address" className="bg-white/10 border-white/20 text-white" />
                <Button size="sm">Join</Button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-brand-500 text-sm">
            Made by Nishat 2026
          </div>
        </footer>

        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />

        {/* Auth Modal */}
        {isLoginOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-3xl font-display font-bold text-center mb-4">
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-brand-500 text-center mb-8 text-sm">
                {authMode === 'signin' 
                  ? 'Sign in to access your LuxeDine account.' 
                  : 'Join LuxeDine for a premium dining experience.'}
              </p>
              
              {authError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-medium">
                  {authError}
                </div>
              )}

              <div className="space-y-4 mb-8">
                {authMode === 'signup' && (
                  <Input 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                )}
                <Input 
                  placeholder="Email Address" 
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <Input 
                  placeholder="Password" 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <Button 
                  className="w-full h-14" 
                  onClick={handleAuth}
                  isLoading={isLoading}
                >
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Button>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm font-bold text-brand-900 hover:underline"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign Up" 
                    : "Already have an account? Sign In"}
                </button>
              </div>

              <Button variant="ghost" className="w-full mt-6" onClick={() => setIsLoginOpen(false)}>Cancel</Button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Staff Dashboard View
  if (user.role !== 'customer') {
    return (
      <div className="flex min-h-screen bg-brand-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-8 overflow-y-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'menu' && (
              <MenuManagement />
            )}
            {activeTab === 'tables' && (
              <TableManagement />
            )}
            {activeTab === 'orders' && (
              <OrderManagement />
            )}
            {activeTab === 'staff' && (
              <StaffManagement />
            )}
            {activeTab === 'settings' && (
              <PaymentSettings />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Logged in Customer View
  return (
    <div className="min-h-screen bg-brand-50">
      <nav className="h-20 bg-white/50 backdrop-blur-md border-b border-brand-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-3xl font-display font-bold tracking-tighter text-brand-900 cursor-pointer" onClick={() => setCustomerTab('menu')}>
          Luxe<span className="text-brand-500">Dine</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 mr-4">
            <button 
              onClick={() => setCustomerTab('menu')}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors",
                customerTab === 'menu' ? "text-brand-900" : "text-brand-400 hover:text-brand-600"
              )}
            >
              Menu
            </button>
            <button 
              onClick={() => setCustomerTab('dashboard')}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors",
                customerTab === 'dashboard' ? "text-brand-900" : "text-brand-400 hover:text-brand-600"
              )}
            >
              My Orders
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-100 rounded-full">
            <User size={18} className="text-brand-600" />
            <span className="text-sm font-medium">{user.full_name}</span>
          </div>
          <button 
            onClick={() => setCartOpen(true)}
            className="p-3 bg-brand-900 text-white rounded-full relative hover:scale-110 transition-transform"
          >
            <ShoppingBag size={20} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {items.length}
              </span>
            )}
          </button>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </nav>
      <main>
        {customerTab === 'menu' ? <CustomerMenu /> : <CustomerDashboard />}
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

