import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  Truck, 
  MapPin,
  QrCode
} from 'lucide-react';
import { useCartStore, useAuthStore } from '@/src/store';
import { Button, Card, Input } from '@/src/components/UI';
import { formatCurrency } from '@/src/lib/utils';

export const CustomerMenu = () => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const { addItem } = useCartStore();
  
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'featured', name: 'Featured' },
    { id: 'starters', name: 'Starters' },
    { id: 'main', name: 'Main Course' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' },
  ];

  const items = [
    { id: '1', name: 'Truffle Pasta', price: 1250, category: 'main', is_featured: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80' },
    { id: '2', name: 'Wagyu Burger', price: 1890, category: 'main', is_featured: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
    { id: '3', name: 'Caesar Salad', price: 850, category: 'starters', is_featured: false, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
    { id: '4', name: 'Chocolate Fondant', price: 650, category: 'desserts', is_featured: true, image: 'https://images.unsplash.com/photo-1624353339193-2f03939a15d1?auto=format&fit=crop&w=800&q=80' },
    { id: '5', name: 'Craft Lemonade', price: 250, category: 'drinks', is_featured: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
    { id: '6', name: 'Ribeye Steak', price: 3200, category: 'main', is_featured: true, image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&w=800&q=80' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? items 
    : activeCategory === 'featured'
    ? items.filter(i => i.is_featured)
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="bg-brand-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover brightness-50"
            alt="Hero"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold tracking-widest uppercase mb-6">
              Est. 2026 • Rajshahi
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 tracking-tighter leading-none">
              The Art of <br />
              <span className="text-brand-400">Fine Dining</span>
            </h1>
            <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Experience a symphony of flavors crafted by world-class chefs in the heart of Rajshahi.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="px-10 h-16 text-lg rounded-full">
                Order Now
              </Button>
              <Button variant="secondary" size="lg" className="px-10 h-16 text-lg rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                View Menu
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-display font-bold text-brand-900 mb-4 tracking-tight">Our Culinary Selection</h2>
            <p className="text-brand-500 max-w-md">
              From locally sourced ingredients to exotic spices, every dish tells a unique story.
            </p>
          </div>
          
          <div className="flex overflow-x-auto gap-2 p-1 bg-brand-100 rounded-2xl no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-3 rounded-xl whitespace-nowrap transition-all font-bold text-sm",
                  activeCategory === cat.id 
                    ? "bg-white text-brand-950 shadow-sm" 
                    : "text-brand-500 hover:text-brand-900"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <Card className="p-0 overflow-hidden h-full flex flex-col border-none shadow-none bg-transparent">
                  <div className="relative h-[400px] overflow-hidden rounded-3xl mb-6">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Button 
                        onClick={() => addItem({ ...item, quantity: 1, image_url: item.image })}
                        className="w-full h-14 rounded-2xl bg-white text-brand-900 hover:bg-brand-50"
                      >
                        <Plus size={20} className="mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                    {item.is_featured && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-brand-950 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Chef's Choice
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-display font-bold text-brand-900">{item.name}</h3>
                      <span className="text-xl font-bold text-brand-600">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="text-brand-500 text-sm leading-relaxed">
                      A masterpiece of flavors, textures, and presentation that will delight your senses.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import { cn } from '@/src/lib/utils';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const [step, setStep] = React.useState<'cart' | 'checkout'>('cart');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-brand-100 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Your Order</h2>
              <button onClick={onClose} className="p-2 hover:bg-brand-50 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={64} className="text-brand-200 mb-4" />
                  <p className="text-brand-500">Your cart is empty</p>
                  <Button variant="ghost" onClick={onClose} className="mt-4">Browse Menu</Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/100/100`} 
                      className="w-20 h-20 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-900">{item.name}</h4>
                      <p className="text-sm text-brand-500">{formatCurrency(item.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-brand-100 rounded-lg"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-brand-100 rounded-lg"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-brand-50 border-t border-brand-100 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button className="w-full py-4 text-lg" onClick={() => setStep('checkout')}>
                  Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
