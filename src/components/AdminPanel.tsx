import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Image as ImageIcon, Plus, Trash2, HelpCircle, FolderOpen, Settings, Tag, Loader2, Zap, Inbox, ShoppingBag, Phone, MapPin, Calendar } from 'lucide-react';
import { Product } from '../data';
import { compressImage, compressBase64 } from '../imageCompressor';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSave: (productData: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  onOpenImageGallery: () => void;
  selectedImageUrl: string;
  setSelectedImageUrl: (url: string) => void;
  products: Product[];
  
  // Dynamic features requested by user
  categories: { id: string; name: string }[];
  onAddCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  
  phoneNumber: string;
  workingHoursWeekdays: string;
  workingHoursFriday: string;
  offers: string[];
  supportEmail: string;
  googleMapUrl: string;
  address: string;
  address2: string;
  googleMapUrl2: string;
  whatsappUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  twitterUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  onSaveSettings: (settings: {
    phoneNumber: string;
    workingHoursWeekdays: string;
    workingHoursFriday: string;
    offers: string[];
    supportEmail: string;
    googleMapUrl: string;
    address: string;
    address2: string;
    googleMapUrl2: string;
    whatsappUrl: string;
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    twitterUrl: string;
    instagramUrl: string;
    facebookUrl: string;
  }) => Promise<void>;
  initialTab?: 'product' | 'settings' | 'categories' | 'offers' | 'orders';
}

export default function AdminPanel({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  onOpenImageGallery,
  selectedImageUrl,
  setSelectedImageUrl,
  products,
  categories,
  onAddCategory,
  onDeleteCategory,
  phoneNumber,
  workingHoursWeekdays,
  workingHoursFriday,
  offers,
  supportEmail,
  googleMapUrl,
  address,
  address2,
  googleMapUrl2,
  whatsappUrl,
  heroBadge,
  heroTitle,
  heroDesc,
  twitterUrl,
  instagramUrl,
  facebookUrl,
  onSaveSettings,
  initialTab = 'product'
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'product' | 'settings' | 'categories' | 'offers' | 'orders'>('product');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [oldPrice, setOldPrice] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('faucets');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  // Firestore orders & messages
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  
  // Lists for dynamic features and specifications
  const [features, setFeatures] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isCompressingAdditional, setIsCompressingAdditional] = useState(false);

  // Website dynamic settings states
  const [localPhone, setLocalPhone] = useState('');
  const [localHoursWeekdays, setLocalHoursWeekdays] = useState('');
  const [localHoursFriday, setLocalHoursFriday] = useState('');
  const [localSupportEmail, setLocalSupportEmail] = useState('');
  const [localGoogleMapUrl, setLocalGoogleMapUrl] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localAddress2, setLocalAddress2] = useState('');
  const [localGoogleMapUrl2, setLocalGoogleMapUrl2] = useState('');
  const [localWhatsappUrl, setLocalWhatsappUrl] = useState('');
  const [localHeroBadge, setLocalHeroBadge] = useState('');
  const [localHeroTitle, setLocalHeroTitle] = useState('');
  const [localHeroDesc, setLocalHeroDesc] = useState('');
  const [localTwitterUrl, setLocalTwitterUrl] = useState('');
  const [localInstagramUrl, setLocalInstagramUrl] = useState('');
  const [localFacebookUrl, setLocalFacebookUrl] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedCount, setOptimizedCount] = useState<number | null>(null);

  const handleOptimizeImages = async () => {
    try {
      setIsOptimizing(true);
      setOptimizedCount(null);
      setError('');
      let count = 0;
      for (const prod of products) {
        // If image is a large base64 string (> 100KB)
        if (prod.image && prod.image.startsWith('data:image/') && prod.image.length > 100000) {
          const compressed = await compressBase64(prod.image, 800, 800, 0.7);
          if (compressed.length < prod.image.length * 0.9) {
            const { id, ...dataToSave } = prod;
            await onSave({ id, ...dataToSave });
            count++;
          }
        }
      }
      setOptimizedCount(count);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحسين وضغط الصور القديمة.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Update dynamic settings values on open
  useEffect(() => {
    if (isOpen) {
      setLocalPhone(phoneNumber || '');
      setLocalHoursWeekdays(workingHoursWeekdays || '');
      setLocalHoursFriday(workingHoursFriday || '');
      setLocalSupportEmail(supportEmail || '');
      setLocalGoogleMapUrl(googleMapUrl || '');
      setLocalAddress(address || '');
      setLocalAddress2(address2 || '');
      setLocalGoogleMapUrl2(googleMapUrl2 || '');
      setLocalWhatsappUrl(whatsappUrl || '');
      setLocalHeroBadge(heroBadge || '');
      setLocalHeroTitle(heroTitle || '');
      setLocalHeroDesc(heroDesc || '');
      setLocalTwitterUrl(twitterUrl || '');
      setLocalInstagramUrl(instagramUrl || '');
      setLocalFacebookUrl(facebookUrl || '');
      
      if (productToEdit) {
        setActiveTab('product');
      } else if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, phoneNumber, workingHoursWeekdays, workingHoursFriday, supportEmail, googleMapUrl, address, address2, googleMapUrl2, whatsappUrl, heroBadge, heroTitle, heroDesc, twitterUrl, instagramUrl, facebookUrl, productToEdit, initialTab]);

  // Listen to Firestore orders & messages
  useEffect(() => {
    if (!isOpen) return;

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort by createdAt descending
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setDbOrders(list);
      },
      (error) => console.error("Error listening to orders: ", error)
    );

    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort by createdAt descending
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setDbMessages(list);
      },
      (error) => console.error("Error listening to messages: ", error)
    );

    return () => {
      unsubOrders();
      unsubMessages();
    };
  }, [isOpen]);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      console.error("Error deleting order: ", err);
      alert('فشل في حذف الطلب');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة نهائياً؟')) return;
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (err) {
      console.error("Error deleting message: ", err);
      alert('فشل في حذف الرسالة');
    }
  };

  // Load product to edit if present
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price);
      setOldPrice(productToEdit.oldPrice);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setLongDescription(productToEdit.longDescription || '');
      setInStock(productToEdit.inStock);
      setIsPopular(!!productToEdit.isPopular);
      setSelectedImageUrl(productToEdit.image);
      setAdditionalImages(productToEdit.images || (productToEdit.image ? [productToEdit.image] : []));
      
      setFeatures(productToEdit.features && productToEdit.features.length > 0 ? productToEdit.features : ['']);
      
      const specPairs = productToEdit.specs && Object.keys(productToEdit.specs).length > 0
        ? Object.entries(productToEdit.specs).map(([key, value]) => ({ key, value }))
        : [{ key: '', value: '' }];
      setSpecs(specPairs);
    } else {
      // Reset form for adding new
      setName('');
      setPrice(0);
      setOldPrice(undefined);
      const defaultCat = categories.find(c => c.id !== 'all')?.id || 'faucets';
      setCategory(defaultCat);
      setDescription('');
      setLongDescription('');
      setInStock(true);
      setIsPopular(false);
      setSelectedImageUrl('');
      setAdditionalImages([]);
      setFeatures(['']);
      setSpecs([{ key: '', value: '' }]);
    }
    setError('');
  }, [productToEdit, isOpen, setSelectedImageUrl, categories]);

  // Update image URL if chosen from gallery modal
  useEffect(() => {
    if (selectedImageUrl && isOpen) {
      // Image has been set
    }
  }, [selectedImageUrl, isOpen]);

  if (!isOpen) return null;

  // Manage features list
  const handleAddFeature = () => setFeatures([...features, '']);
  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  // Manage specifications list
  const handleAddSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], [field]: val };
    setSpecs(updated);
  };
  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatName.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة لقسم جديد');
      return;
    }
    const cleanId = newCatId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId) {
      alert('اسم المعرف بالإنجليزية غير صالح');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddCategory(cleanId, newCatName.trim());
      setNewCatId('');
      setNewCatName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategoryClick = async (catId: string) => {
    if (catId === 'all') return;
    if (confirm(`هل أنت متأكد من حذف قسم "${categories.find(c => c.id === catId)?.name}"؟ لن يؤثر هذا على المنتجات ولكن لن يظهر في القوائم.`)) {
      setIsSubmitting(true);
      try {
        await onDeleteCategory(catId);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveSettingsClick = async () => {
    if (!localPhone.trim() || !localHoursWeekdays.trim() || !localHoursFriday.trim() || !localSupportEmail.trim()) {
      alert('يرجى ملء جميع حقول الاتصال، البريد وساعات العمل');
      return;
    }

    let finalMapUrl = localGoogleMapUrl.trim();
    if (finalMapUrl.includes('<iframe')) {
      const match = finalMapUrl.match(/src="([^"]+)"/);
      if (match && match[1]) {
        finalMapUrl = match[1];
      }
    }

    let finalMapUrl2 = localGoogleMapUrl2.trim();
    if (finalMapUrl2.includes('<iframe')) {
      const match = finalMapUrl2.match(/src="([^"]+)"/);
      if (match && match[1]) {
        finalMapUrl2 = match[1];
      }
    }

    setIsSubmitting(true);
    try {
      await onSaveSettings({
        phoneNumber: localPhone.trim(),
        workingHoursWeekdays: localHoursWeekdays.trim(),
        workingHoursFriday: localHoursFriday.trim(),
        offers: offers,
        supportEmail: localSupportEmail.trim(),
        googleMapUrl: finalMapUrl,
        address: localAddress.trim(),
        address2: localAddress2.trim(),
        googleMapUrl2: finalMapUrl2,
        whatsappUrl: localWhatsappUrl.trim(),
        heroBadge: localHeroBadge.trim(),
        heroTitle: localHeroTitle.trim(),
        heroDesc: localHeroDesc.trim(),
        twitterUrl: localTwitterUrl.trim(),
        instagramUrl: localInstagramUrl.trim(),
        facebookUrl: localFacebookUrl.trim()
      });
      alert('تم حفظ كافة إعدادات الموقع بنجاح!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOfferClick = async () => {
    if (!newOffer.trim()) return;
    setIsSubmitting(true);
    try {
      const updatedOffers = [...offers, newOffer.trim()];
      await onSaveSettings({
        phoneNumber: phoneNumber,
        workingHoursWeekdays: workingHoursWeekdays,
        workingHoursFriday: workingHoursFriday,
        offers: updatedOffers,
        supportEmail: supportEmail,
        googleMapUrl: googleMapUrl,
        address: address,
        address2: address2,
        googleMapUrl2: googleMapUrl2,
        whatsappUrl: whatsappUrl,
        heroBadge: heroBadge,
        heroTitle: heroTitle,
        heroDesc: heroDesc,
        twitterUrl: twitterUrl,
        instagramUrl: instagramUrl,
        facebookUrl: facebookUrl
      });
      setNewOffer('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOfferClick = async (indexToDelete: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض الترويجي؟')) {
      setIsSubmitting(true);
      try {
        const updatedOffers = offers.filter((_, idx) => idx !== indexToDelete);
        await onSaveSettings({
          phoneNumber: phoneNumber,
          workingHoursWeekdays: workingHoursWeekdays,
          workingHoursFriday: workingHoursFriday,
          offers: updatedOffers,
          supportEmail: supportEmail,
          googleMapUrl: googleMapUrl,
          address: address,
          address2: address2,
          googleMapUrl2: googleMapUrl2,
          whatsappUrl: whatsappUrl,
          heroBadge: heroBadge,
          heroTitle: heroTitle,
          heroDesc: heroDesc,
          twitterUrl: twitterUrl,
          instagramUrl: instagramUrl,
          facebookUrl: facebookUrl
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى إدخال اسم المنتج.');
      return;
    }
    if (!selectedImageUrl && additionalImages.length === 0) {
      setError('يرجى تحديد صورة واحدة على الأقل للمنتج.');
      return;
    }
    if (!description.trim()) {
      setError('يرجى إدخال وصف قصير للمنتج.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean up features and specs arrays
      const cleanedFeatures = features.filter((f) => f.trim() !== '');
      
      const cleanedSpecs: { [key: string]: string } = {};
      specs.forEach((item) => {
        if (item.key.trim() && item.value.trim()) {
          cleanedSpecs[item.key.trim()] = item.value.trim();
        }
      });

      const mainImg = selectedImageUrl || additionalImages[0] || '';
      const allImgs = additionalImages.length > 0 ? additionalImages : [mainImg];

      const productPayload: Omit<Product, 'id'> & { id?: string } = {
        name: name.trim(),
        price: 0,
        category,
        image: mainImg,
        images: allImgs,
        description: description.trim(),
        longDescription: longDescription.trim() || description.trim(),
        rating: productToEdit?.rating || Number((4.5 + Math.random() * 0.5).toFixed(1)),
        reviewsCount: productToEdit?.reviewsCount || Math.floor(10 + Math.random() * 150),
        features: cleanedFeatures,
        specs: cleanedSpecs,
        inStock,
        isPopular,
        createdAt: productToEdit?.createdAt || new Date().toISOString()
      };

      if (productToEdit?.id) {
        productPayload.id = productToEdit.id;
      }

      await onSave(productPayload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('فشلت عملية الحفظ. يرجى التحقق من المدخلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Form Container */}
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10 text-right" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-900 text-lg">
                بوابة تعديل وإدارة موقع الندى الفاخر
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">الخزانة الرقمية نشطة | المالك: <strong className="text-indigo-600 font-extrabold">{supportEmail}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 overflow-x-auto whitespace-nowrap scrollbar-none" dir="rtl">
          <button
            type="button"
            onClick={() => setActiveTab('product')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'product'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{productToEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>أقسام الموقع ({categories.filter(c => c.id !== 'all').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>الهاتف وساعات العمل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'offers'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>شريط الإعلانات والعروض ({offers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-indigo-600'
            }`}
          >
            <Inbox className={`w-4 h-4 ${activeTab === 'orders' ? 'text-indigo-600 animate-bounce' : 'text-gray-400'}`} />
            <span>صندوق الرسائل والطلبات الواردة ({dbOrders.length + dbMessages.length})</span>
            {(dbOrders.length + dbMessages.length) > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'product' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold">
                  {error}
                </div>
              )}

              {/* Section: Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: خلاط مغسلة مطلي بالذهب عيار 24"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">الفئة *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                  >
                    {categories.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Chooser */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">صورة المنتج الرئيسية *</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <label className={`px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer ${isCompressingImage ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isCompressingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري معالجة وضغط الصورة...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>رفع صورة من جهازك (المعرض)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsCompressingImage(true);
                            const compressedBase64 = await compressImage(file, 800, 800, 0.7);
                            setSelectedImageUrl(compressedBase64);
                            setAdditionalImages((prev) => {
                              if (!prev.includes(compressedBase64)) {
                                return [compressedBase64, ...prev];
                              }
                              return prev;
                            });
                          } catch (err) {
                            console.error("Error compressing image:", err);
                          } finally {
                            setIsCompressingImage(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={onOpenImageGallery}
                    className="px-4 py-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>أو اختر صورة جاهزة</span>
                  </button>
                  
                  <input
                    type="text"
                    required
                    placeholder="أو الصق رابط الصورة المباشر هنا..."
                    value={selectedImageUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedImageUrl(val);
                      if (val) {
                        setAdditionalImages((prev) => {
                          if (!prev.includes(val)) {
                            return [val, ...prev];
                          }
                          return prev;
                        });
                      }
                    }}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-left dir-ltr"
                  />
                </div>
                {selectedImageUrl && (
                  <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={selectedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setAdditionalImages((prev) => prev.filter(img => img !== selectedImageUrl));
                        setSelectedImageUrl('');
                      }}
                      className="absolute inset-0 bg-slate-900/60 text-white opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold"
                    >
                      إزالة
                    </button>
                  </div>
                )}
              </div>

              {/* Multiple Images Selector */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">ألبوم صور المعرض الإضافية (يمكنك إضافة صور متعددة لنفس العرض) - اضغط Enter بعد اللصق</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <label className={`px-4 py-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer ${isCompressingAdditional ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isCompressingAdditional ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري ضغط الصورة...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>رفع وإضافة صورة للألبوم</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressingAdditional}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsCompressingAdditional(true);
                            const compressedBase64 = await compressImage(file, 800, 800, 0.7);
                            setAdditionalImages((prev) => [...prev, compressedBase64]);
                            if (!selectedImageUrl) {
                              setSelectedImageUrl(compressedBase64);
                            }
                          } catch (err) {
                            console.error("Error compressing image:", err);
                          } finally {
                            setIsCompressingAdditional(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="أو الصق رابط صورة مباشر هنا واضغط Enter للإضافة للألبوم..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setAdditionalImages((prev) => {
                            if (!prev.includes(val)) {
                              return [...prev, val];
                            }
                            return prev;
                          });
                          if (!selectedImageUrl) {
                            setSelectedImageUrl(val);
                          }
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-left dir-ltr"
                  />
                </div>

                {/* Display list of additional images */}
                {additionalImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {additionalImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageUrl(imgUrl);
                            }}
                            className="text-[9px] text-amber-400 font-bold hover:underline"
                          >
                            رئيسية
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalImages((prev) => prev.filter((_, i) => i !== idx));
                              if (selectedImageUrl === imgUrl) {
                                setSelectedImageUrl(additionalImages.find((_, i) => i !== idx) || '');
                              }
                            }}
                            className="text-[9px] text-rose-400 font-bold hover:underline"
                          >
                            حذف
                          </button>
                        </div>
                        {selectedImageUrl === imgUrl && (
                          <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[9px] font-black text-center py-0.5">
                            الرئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">وصف قصير للبطاقة *</label>
                <input
                  type="text"
                  required
                  placeholder="وصف مشوق وسريع يظهر في شبكة المنتجات..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">الوصف التفصيلي (لنافذة المنتج)</label>
                <textarea
                  rows={3}
                  placeholder="قصة وتفاصيل المنتج وتجربة الاستخدام بالتفصيل..."
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 p-4 bg-gray-50 rounded-2xl">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/20 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800">المنتج متوفر بالمخزن</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/20 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800">تمييز المنتج كرائج (Popular)</span>
                </label>
              </div>

              {/* Section: Features (Dynamic fields) */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-gray-900">المزايا البارزة للمنتج (نقاط تسويقية)</h4>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ميزة</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`الميزة رقم ${idx + 1}`}
                        value={feature}
                        onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                        className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Specifications (Dynamic keys/values) */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-gray-900">جدول المواصفات الفنية</h4>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مواصفة</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {specs.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="العنوان (مثل: المنشأ)"
                        value={item.key}
                        onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                        className="w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                      />
                      <input
                        type="text"
                        placeholder="القيمة (مثل: إيطاليا)"
                        value={item.value}
                        onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                        className="w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-xs transition-all text-right"
                      />
                      {specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product actions footer */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء التغييرات
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري حفظ المنتج...' : 'حفظ ونشر على الموقع'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
                هنا يمكنك إضافة أقسام منتجات جديدة لتظهر في الموقع فوراً، أو حذف الأقسام الفارغة التي لم تعد ترغب بها.
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-900 mb-2">الأقسام الحالية بالمتجر</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <div key={cat.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div className="text-right">
                        <span className="font-bold text-xs block text-gray-950">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">ID: {cat.id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategoryClick(cat.id)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف هذا القسم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-extrabold text-gray-900 mb-4">إضافة قسم جديد</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">اسم القسم بالعربية *</label>
                    <input
                      type="text"
                      placeholder="مثال: أحواض جاكوزي"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right animate-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">المعرف الفريد بالإنجليزية (ID) *</label>
                    <input
                      type="text"
                      placeholder="مثال: jacuzzis"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategorySubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ونشر القسم الجديد</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
                هنا يمكنك تعديل رقم هاتف التواصل ومواعيد العمل المعروضة للزبائن في كامل صفحات الموقع وتذييله.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم هاتف خدمة العملاء (مكالمات وواتساب) *</label>
                  <input
                    type="text"
                    required
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                    placeholder="920002837 (966+)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">مواعيد العمل طوال الأسبوع (السبت - الخميس) *</label>
                  <input
                    type="text"
                    required
                    value={localHoursWeekdays}
                    onChange={(e) => setLocalHoursWeekdays(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                    placeholder="السبت - الخميس: 8:00 ص - 10:00 م"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">مواعيد العمل يوم الجمعة *</label>
                  <input
                    type="text"
                    required
                    value={localHoursFriday}
                    onChange={(e) => setLocalHoursFriday(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                    placeholder="الجمعة: 4:00 م - 10:00 م"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">البريد الإلكتروني المباشر للموقع *</label>
                  <input
                    type="email"
                    required
                    value={localSupportEmail}
                    onChange={(e) => setLocalSupportEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left"
                    placeholder="support@al-nada-luxury.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط تضمين خريطة جوجل ماب الأولى (Google Maps Embed URL) *</label>
                  <textarea
                    rows={3}
                    value={localGoogleMapUrl}
                    onChange={(e) => setLocalGoogleMapUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    رابط الخريطة الأولى للمعرض الأول.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">العنوان الجغرافي للمعرض الأول *</label>
                  <input
                    type="text"
                    required
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                    placeholder="الرياض، حي السلي، معرض الأدوات الصحية"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط تضمين خريطة جوجل ماب الثانية (Google Maps Embed URL) *</label>
                  <textarea
                    rows={3}
                    value={localGoogleMapUrl2}
                    onChange={(e) => setLocalGoogleMapUrl2(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    رابط الخريطة الثانية للمعرض الثاني.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">العنوان الجغرافي للمعرض الثاني *</label>
                  <input
                    type="text"
                    required
                    value={localAddress2}
                    onChange={(e) => setLocalAddress2(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                    placeholder="جدة، حي الرويس، معرض الأدوات الصحية الثاني"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط واتساب الأعمال المباشر خدمة العملاء *</label>
                  <input
                    type="text"
                    required
                    value={localWhatsappUrl}
                    onChange={(e) => setLocalWhatsappUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                    placeholder="https://wa.me/966XXXXXXXXX"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6">
                  <h4 className="text-xs font-black text-amber-600 mb-3">محتويات بطاقة خلاط الندى الذهبي (على الصورة الرئيسية)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">شعار التنبيه الصغير بالبطاقة</label>
                      <input
                        type="text"
                        value={localHeroBadge}
                        onChange={(e) => setLocalHeroBadge(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                        placeholder="المنتج الأكثر شعبية"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">العنوان الرئيسي بالبطاقة</label>
                      <input
                        type="text"
                        value={localHeroTitle}
                        onChange={(e) => setLocalHeroTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                        placeholder="خلاط الندى الذهبي عيار 24"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">الوصف الفرعي بالبطاقة</label>
                      <input
                        type="text"
                        value={localHeroDesc}
                        onChange={(e) => setLocalHeroDesc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                        placeholder="تصميم إيطالي ملكي بضمان خمس سنوات"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6">
                  <h4 className="text-xs font-black text-amber-600 mb-3">روابط صفحات التواصل الاجتماعي (تذييل الموقع)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط حساب تويتر (X)</label>
                      <input
                        type="text"
                        value={localTwitterUrl}
                        onChange={(e) => setLocalTwitterUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط حساب انستقرام</label>
                      <input
                        type="text"
                        value={localInstagramUrl}
                        onChange={(e) => setLocalInstagramUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">رابط صفحة فيسبوك</label>
                      <input
                        type="text"
                        value={localFacebookUrl}
                        onChange={(e) => setLocalFacebookUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-left font-mono"
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                  </div>
                </div>

                {/* Database Optimization Tool */}
                <div className="border-t border-gray-100 pt-6 mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-right">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-right">
                      <h4 className="text-xs font-black text-slate-800">تحسين سرعة تحميل الموقع وأداء الصور الفوري</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        إذا تم رفع صور ذات حجم كبير سابقاً، فقد يؤدي ذلك إلى ثقل تحميل المتجر للزبائن وتأخر الحفظ. انقر على الزر أدناه ليقوم النظام فوراً بفحص جميع الصور في قاعدة البيانات، وضغطها وتقليص حجمها بنسبة تصل إلى 95% مع الحفاظ التام على جودتها وجمالها!
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOptimizeImages}
                      disabled={isOptimizing}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isOptimizing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري فحص وضغط صور المتجر...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>فحص وضغط صور المنتجات القديمة تلقائياً</span>
                        </>
                      )}
                    </button>

                    {optimizedCount !== null && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        {optimizedCount === 0 
                          ? 'جميع صور المتجر مثالية ومضغوطة بالفعل لسرعة فائقة!' 
                          : `تم ضغط وتحسين ${optimizedCount} من الصور بنجاح! تم تسريع المتجر فوراً.`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleSaveSettingsClick}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات الفورية'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
                هنا يمكنك إضافة وحذف التنبيهات والعروض الترويجية التي تظهر في شريط الإعلانات أعلى الموقع لمصنع ومتجر الندى.
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-900 mb-2">العروض الترويجية الحالية المعروضة أعلى الصفحة</h4>
                {offers.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-4">لا توجد عروض ترويجية نشطة حالياً.</p>
                ) : (
                  <div className="space-y-2">
                    {offers.map((offer, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                        <span className="font-bold text-xs text-gray-950 text-right flex-grow">{offer}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOfferClick(idx)}
                          disabled={isSubmitting}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="حذف هذا العرض"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-extrabold text-gray-900 mb-3">إضافة عرض ترويجي جديد</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: خصم إضافي 15% على مغاسل البورسلين الإيطالية لفترة محدودة"
                    value={newOffer}
                    onChange={(e) => setNewOffer(e.target.value)}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-right"
                  />
                  <button
                    type="button"
                    onClick={handleAddOfferClick}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8" dir="rtl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Orders List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-display font-black text-gray-900 text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>طلبات السلة المستلمة ({dbOrders.length})</span>
                    </h3>
                  </div>

                  {dbOrders.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">لا توجد طلبات سلة مستلمة حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none">
                      {dbOrders.map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 relative text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-SA') : ''}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-950">العميل: <span className="font-medium text-gray-700">{order.customerName}</span></p>
                            <p className="text-xs font-bold text-gray-950 flex items-center gap-1">
                              <span>الهاتف:</span>
                              <a href={`tel:${order.customerPhone}`} className="text-amber-600 hover:underline font-mono">{order.customerPhone}</a>
                              <a
                                href={`https://wa.me/${order.customerPhone.startsWith('0') ? '966' + order.customerPhone.slice(1) : order.customerPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 flex items-center gap-1"
                              >
                                تواصل واتساب
                              </a>
                            </p>
                            <p className="text-xs font-bold text-gray-950">المدينة: <span className="font-medium text-gray-700">{order.customerCity}</span></p>
                            <p className="text-xs font-bold text-gray-950">العنوان: <span className="font-medium text-gray-700">{order.customerAddress}</span></p>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-xl space-y-2">
                            <p className="text-[10px] font-black text-gray-400">المنتجات المطلوبة في السلة:</p>
                            {order.items && order.items.map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} className="w-6 h-6 rounded-md object-cover" />
                                  )}
                                  <span className="font-bold text-gray-800">{item.name}</span>
                                </div>
                                <span className="bg-slate-900 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                                  الكمية: {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-display font-black text-gray-900 text-sm flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-amber-600" />
                      <span>رسائل واستفسارات العملاء ({dbMessages.length})</span>
                    </h3>
                  </div>

                  {dbMessages.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">لا توجد رسائل مستلمة حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none">
                      {dbMessages.map((msg) => (
                        <div key={msg.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2.5 relative text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الرسالة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                              رسالة استفسار
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleString('ar-SA') : ''}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-950">الاسم: <span className="font-medium text-gray-700">{msg.customerName}</span></p>
                            <p className="text-xs font-bold text-gray-950 flex items-center gap-1">
                              <span>الهاتف:</span>
                              <a href={`tel:${msg.customerPhone}`} className="text-amber-600 hover:underline font-mono">{msg.customerPhone}</a>
                              <a
                                href={`https://wa.me/${msg.customerPhone.startsWith('0') ? '966' + msg.customerPhone.slice(1) : msg.customerPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 flex items-center gap-1"
                              >
                                تواصل واتساب
                              </a>
                            </p>
                          </div>

                          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-50">
                            <p className="text-[10px] font-black text-amber-700 mb-1">الرسالة:</p>
                            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
