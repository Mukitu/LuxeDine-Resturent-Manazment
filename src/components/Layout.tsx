import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  QrCode
} from 'lucide-react';
import { useAuthStore } from '@/src/store';
import { cn } from '@/src/lib/utils';

export const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { user, logout } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'waiter'] },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, roles: ['owner', 'manager'] },
    { id: 'tables', label: 'Table Management', icon: QrCode, roles: ['owner', 'manager', 'waiter'] },
    { id: 'orders', label: 'Orders', icon: ClipboardList, roles: ['owner', 'manager', 'waiter'] },
    { id: 'staff', label: 'Staff', icon: Users, roles: ['owner'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const sidebarContent = (
    <div className="h-full bg-brand-950 text-white flex flex-col overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        {(!isCollapsed || isMobileOpen) && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-display font-bold tracking-tighter"
          >
            Luxe<span className="text-brand-400">Dine</span>
          </motion.h1>
        )}
        <button 
          onClick={() => isMobileOpen ? setIsMobileOpen?.(false) : setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:block hidden"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button 
          onClick={() => setIsMobileOpen?.(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden block"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobileOpen) setIsMobileOpen?.(false);
            }}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
              activeTab === item.id 
                ? "bg-white text-brand-950 font-semibold" 
                : "text-brand-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={22} />
            {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className={cn("flex items-center gap-3 p-2", isCollapsed && !isMobileOpen && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center font-bold shrink-0">
            {user?.full_name?.charAt(0)}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-brand-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 p-3 mt-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all",
            isCollapsed && !isMobileOpen && "justify-center"
          )}
        >
          <LogOut size={22} />
          {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="h-screen bg-brand-950 text-white hidden lg:flex flex-col sticky top-0 overflow-hidden z-50"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-[280px] bg-brand-950 text-white z-[110] lg:hidden shadow-2xl"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export const TopBar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  return (
    <header className="h-20 bg-white/50 backdrop-blur-md border-b border-brand-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-brand-100 rounded-lg lg:hidden text-brand-900"
        >
          <LayoutDashboard size={24} />
        </button>
        <div className="hidden md:flex items-center gap-4 bg-brand-100/50 px-4 py-2 rounded-xl w-96">
          <Search size={18} className="text-brand-400" />
          <input 
            type="text" 
            placeholder="Search for orders, tables, or food..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <button className="p-2 hover:bg-brand-100 rounded-full relative transition-colors">
          <Bell size={20} className="text-brand-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-brand-200 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm font-medium text-brand-600">Restaurant Open</span>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
};
