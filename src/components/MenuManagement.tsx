import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card, Button, Input } from '@/src/components/UI';
import { cn, formatCurrency } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store';

export const MenuManagement = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    image_url: '',
    description: '',
    is_featured: false,
    is_available: true
  });

  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'owner' || user?.role === 'manager';
  const isAdmin = user?.role === 'owner';

  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      const { data: itemData } = await supabase.from('food_items').select('*, categories(name)').order('created_at', { ascending: false });
      
      setCategories(catData || []);
      setItems(itemData || []);
    } catch (error: any) {
      console.error('Error fetching menu:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url,
        description: formData.description,
        is_featured: formData.is_featured,
        is_available: formData.is_available
      };

      if (editingItem) {
        const { error } = await supabase
          .from('food_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Item updated successfully!' });
      } else {
        const { error } = await supabase.from('food_items').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Item added successfully!' });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', price: '', category_id: '', image_url: '', description: '', is_featured: false, is_available: true });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      description: item.description || '',
      is_featured: item.is_featured,
      is_available: item.is_available
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('food_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      setMessage({ type: 'success', text: 'Item deleted' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = newCatName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name: newCatName, slug: slug || `cat-${Date.now()}` })
          .eq('id', editingCategory.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Category updated!' });
      } else {
        const { error } = await supabase.from('categories').insert([{ 
          name: newCatName,
          slug: slug || `cat-${Date.now()}`
        }]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Category added!' });
      }

      setNewCatName('');
      setEditingCategory(null);
      setIsCatModalOpen(false);
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will un-categorize all items in this category.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Category deleted' });
      fetchData();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-brand-900">Menu Management</h2>
          <p className="text-brand-500 text-sm lg:text-base">Manage your restaurant's food and drink offerings.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(true)} className="flex-1 sm:flex-none">
            <Plus size={16} className="mr-1 sm:mr-2" />
            Category
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none">
            <Plus size={16} className="mr-1 sm:mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button 
                onClick={() => {
                  setIsCatModalOpen(false);
                  setEditingCategory(null);
                  setNewCatName('');
                }} 
                className="p-2 hover:bg-brand-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-900">Category Name</label>
                <Input 
                  required
                  placeholder="e.g. Main Course, Drinks" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => {
                    setIsCatModalOpen(false);
                    setEditingCategory(null);
                    setNewCatName('');
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" type="submit" isLoading={isSubmitting}>
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-1 bg-brand-100 text-brand-900 px-4 py-2 rounded-full text-sm font-bold">
            <span>{cat.name}</span>
            <button onClick={() => handleEditCategory(cat)} className="p-1 hover:bg-brand-200 rounded-full transition-colors">
              <Edit3 size={14} />
            </button>
            {isAdmin && (
              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-brand-400 border-2 border-dashed border-brand-200 rounded-3xl">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p>No menu items found. Add your first item!</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="group overflow-hidden p-0 border-none shadow-lg hover:shadow-2xl transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image_url || 'https://picsum.photos/seed/food/800/600'} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {item.is_featured && (
                    <span className="bg-brand-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Featured
                    </span>
                  )}
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                    item.is_available ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {item.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">
                      {item.categories?.name || 'Uncategorized'}
                    </p>
                    <h4 className="text-xl font-bold text-brand-900">{item.name}</h4>
                  </div>
                  <p className="text-xl font-bold text-brand-900">{formatCurrency(item.price)}</p>
                </div>
                <p className="text-sm text-brand-500 line-clamp-2 mb-6">{item.description}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => handleEdit(item)}>
                    <Edit3 size={16} className="mr-2" />
                    Edit
                  </Button>
                  {isAuthorized && (
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                  setFormData({ name: '', price: '', category_id: '', image_url: '', description: '', is_featured: false, is_available: true });
                }} 
                className="p-2 hover:bg-brand-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-900">Item Name</label>
                  <Input 
                    required
                    placeholder="e.g. Signature Truffle Pasta" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-900">Price (BDT)</label>
                  <Input 
                    required
                    type="number"
                    placeholder="e.g. 1250" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-900">Category</label>
                  <select 
                    className="w-full h-12 px-4 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-900/10 transition-all text-sm"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-900">Image URL</label>
                  <Input 
                    placeholder="https://..." 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-900">Description</label>
                <textarea 
                  className="w-full p-4 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-900/10 transition-all text-sm min-h-[100px]"
                  placeholder="Describe the dish..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-md border-brand-200 text-brand-900 focus:ring-brand-900"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-brand-900">Featured Item</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-md border-brand-200 text-brand-900 focus:ring-brand-900"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-brand-900">Available Now</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setFormData({ name: '', price: '', category_id: '', image_url: '', description: '', is_featured: false, is_available: true });
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" type="submit" isLoading={isSubmitting}>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
