import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Menu,
  X,
  Heart,
  Star,
  Check,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Filter,
  ShieldCheck,
  Truck,
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  PlusCircle,
  Database,
  Loader2,
  Inbox
} from 'lucide-react';

// Data and Firebase imports
import { CATEGORIES, Product, STARTER_PRODUCTS } from './data';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

// Subcomponents imports
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import AdminPanel from './components/AdminPanel';
import ImageGalleryModal from './components/ImageGalleryModal';

interface CartItem {
  product: Product;
  quantity: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Navigation, Loading & Search State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Firestore Real-time Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('al_nada_admin') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  // Modals management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [adminPanelTab, setAdminPanelTab] = useState<'product' | 'settings' | 'categories' | 'offers' | 'orders'>('product');

  // E-commerce State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Checkout Form State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutCity, setCheckoutCity] = useState<string>('الرياض');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Contact Form State
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Notification Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Real-time Categories State from Firestore
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(CATEGORIES);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const list: { id: string; name: string }[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as { id: string; name: string });
        });
        
        if (list.length === 0) {
          // Seed default categories non-blockingly if database is empty
          const defaultCats = CATEGORIES.filter(c => c.id !== 'all');
          Promise.all(
            defaultCats.map(cat => setDoc(doc(db, 'categories', cat.id), { name: cat.name }))
          ).catch(err => console.error("Error seeding categories: ", err));
          setCategories(CATEGORIES);
        } else {
          // Always prepend 'all' category for the UI filter
          setCategories([{ id: 'all', name: 'جميع المعروضات' }, ...list]);
        }
      },
      (error) => {
        console.error("Firestore categories loading error: ", error);
        setCategories(CATEGORIES);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time Settings State from Firestore
  const [phoneNumber, setPhoneNumber] = useState<string>('920002837 (966+)');
  const [workingHoursWeekdays, setWorkingHoursWeekdays] = useState<string>('السبت - الخميس: 8:00 ص - 10:00 م');
  const [workingHoursFriday, setWorkingHoursFriday] = useState<string>('الجمعة: 4:00 م - 10:00 م');
  const [offers, setOffers] = useState<string[]>([]);
  const [supportEmail, setSupportEmail] = useState<string>('support@al-nada-luxury.com');
  const [googleMapUrl, setGoogleMapUrl] = useState<string>('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14498.423126837095!2d46.6669!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMDEuMiJF!5e0!3m2!1sar!2ssa!4v1625000000000!5m2!1sar!2ssa');
  const [address, setAddress] = useState<string>('الرياض، حي السلي، معرض الأدوات الصحية');
  const [address2, setAddress2] = useState<string>('جدة، حي الرويس، معرض الأدوات الصحية الثاني');
  const [googleMapUrl2, setGoogleMapUrl2] = useState<string>('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3711.23456789!2d39.15!3d21.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDMwJzAwLjAiTiAzOcKwMDknMDAuMCJF!5e0!3m2!1sar!2ssa!4v1625000000000!5m2!1sar!2ssa');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('https://wa.me/966500000000');
  const [heroBadge, setHeroBadge] = useState<string>('المنتج الأكثر شعبية');
  const [heroTitle, setHeroTitle] = useState<string>('خلاط الندى الذهبي عيار 24');
  const [heroDesc, setHeroDesc] = useState<string>('تصميم إيطالي ملكي بضمان خمس سنوات');
  const [twitterUrl, setTwitterUrl] = useState<string>('#');
  const [instagramUrl, setInstagramUrl] = useState<string>('#');
  const [facebookUrl, setFacebookUrl] = useState<string>('#');
  const [currentOfferIndex, setCurrentOfferIndex] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'config'),
      async (docSnap) => {
        if (!docSnap.exists()) {
          // Seed default settings if empty
          const defaults = {
            phoneNumber: '920002837 (966+)',
            workingHoursWeekdays: 'السبت - الخميس: 8:00 ص - 10:00 م',
            workingHoursFriday: 'الجمعة: 4:00 م - 10:00 م',
            supportEmail: 'support@al-nada-luxury.com',
            googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14498.423126837095!2d46.6669!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMDEuMiJF!5e0!3m2!1sar!2ssa!4v1625000000000!5m2!1sar!2ssa',
            address: 'الرياض، حي السلي، معرض الأدوات الصحية',
            address2: 'جدة، حي الرويس، معرض الأدوات الصحية الثاني',
            googleMapUrl2: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3711.23456789!2d39.15!3d21.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDMwJzAwLjAiTiAzOcKwMDknMDAuMCJF!5e0!3m2!1sar!2ssa!4v1625000000000!5m2!1sar!2ssa',
            whatsappUrl: 'https://wa.me/966500000000',
            offers: [
              'شحن وتوصيل مجاني لكافة مدن المملكة للطلبات الأكثر من 1000 ريال',
              'ضمان ذهبي حقيقي وخدمة صيانة مجانية لمدة 5 سنوات على كافة الخلاطات الإيطالية'
            ],
            heroBadge: 'المنتج الأكثر شعبية',
            heroTitle: 'خلاط الندى الذهبي عيار 24',
            heroDesc: 'تصميم إيطالي ملكي بضمان خمس سنوات',
            twitterUrl: '#',
            instagramUrl: '#',
            facebookUrl: '#'
          };
          await setDoc(doc(db, 'settings', 'config'), defaults);
        } else {
          const data = docSnap.data();
          if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
          if (data.workingHoursWeekdays) setWorkingHoursWeekdays(data.workingHoursWeekdays);
          if (data.workingHoursFriday) setWorkingHoursFriday(data.workingHoursFriday);
          if (data.offers) setOffers(data.offers);
          if (data.supportEmail) setSupportEmail(data.supportEmail);
          if (data.googleMapUrl !== undefined) setGoogleMapUrl(data.googleMapUrl);
          if (data.address) setAddress(data.address);
          if (data.address2) setAddress2(data.address2);
          if (data.googleMapUrl2 !== undefined) setGoogleMapUrl2(data.googleMapUrl2);
          if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
          if (data.heroBadge) setHeroBadge(data.heroBadge);
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroDesc) setHeroDesc(data.heroDesc);
          if (data.twitterUrl) setTwitterUrl(data.twitterUrl);
          if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
          if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
        }
      },
      (error) => {
        console.error("Firestore settings loading error: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Rotating offer interval
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setCurrentOfferIndex(0);
    }
  }, [offers]);

  const handleAddCategory = async (id: string, name: string) => {
    try {
      await setDoc(doc(db, 'categories', id), { name });
      triggerToast(`تمت إضافة القسم الجديد "${name}" ونشره فوراً!`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast('فشل في إضافة القسم الجديد', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      triggerToast('تم حذف القسم بنجاح من قائمة الأقسام.', 'info');
    } catch (err) {
      console.error(err);
      triggerToast('فشل في حذف القسم.', 'error');
    }
  };

  const handleSaveSettings = async (newSettings: {
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
  }) => {
    try {
      await setDoc(doc(db, 'settings', 'config'), newSettings);
      triggerToast('تم تحديث إعدادات الموقع ونشرها فوراً لجميع الزوار!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('فشل في حفظ الإعدادات في قاعدة البيانات.', 'error');
    }
  };

  // 1. Listen to products from Firestore in Real-Time!
  useEffect(() => {
    setIsLoadingProducts(true);
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });
        // Sort products by creation timestamp (newest first)
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setProducts(list);
        setIsLoadingProducts(false);
      },
      (error) => {
        console.error("Firestore listening error: ", error);
        triggerToast("فشل في تحميل المنتجات من السحابة", "error");
        setIsLoadingProducts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time counters for admin inbox
  const [inboxOrdersCount, setInboxOrdersCount] = useState<number>(0);
  const [inboxMessagesCount, setInboxMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setInboxOrdersCount(snapshot.size);
      },
      (error) => console.error("Error counting orders: ", error)
    );

    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        setInboxMessagesCount(snapshot.size);
      },
      (error) => console.error("Error counting messages: ", error)
    );

    return () => {
      unsubOrders();
      unsubMessages();
    };
  }, [isAdmin]);

  // Track page scroll to style header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show dynamic toast notifications
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Scroll smoothly to any element ID
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Filter products based on activeCategory and searchQuery
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const index = prev.indexOf(productId);
      if (index > -1) {
        triggerToast('تم إزالة المنتج من المفضلة', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        const prod = products.find((p) => p.id === productId);
        triggerToast(`تم إضافة "${prod?.name}" للمفضلة`, 'success');
        return [...prev, productId];
      }
    });
  };

  // Cart actions
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        triggerToast(`تم زيادة كمية "${product.name}" في السلة`, 'success');
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      triggerToast(`تم إضافة "${product.name}" إلى السلة`, 'success');
      return [...prev, { product, quantity: quantityToAdd }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      triggerToast(`تم إزالة "${item.product.name}" من السلة`, 'info');
    }
  };

  // Cart Pricing Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const vatAmount = useMemo(() => {
    return Math.round(cartSubtotal * 0.15); // 15% VAT (Saudi Arabia)
  }, [cartSubtotal]);

  const shippingCost = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 1000 ? 0 : 35; // Free shipping above 1000 SAR
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + vatAmount + shippingCost;
  }, [cartSubtotal, vatAmount, shippingCost]);

  // Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutPhone.trim()) {
      triggerToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    
    setIsSubmittingOrder(true);
    try {
      const randNum = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedOrderNumber = `NADA-${randNum}`;
      
      const orderData = {
        orderNumber: generatedOrderNumber,
        customerName: checkoutName.trim(),
        customerPhone: checkoutPhone.trim(),
        customerCity: checkoutCity.trim() || 'غير محدد',
        customerAddress: checkoutAddress.trim() || 'غير محدد',
        createdAt: new Date().toISOString(),
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity
        })),
        status: 'pending'
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderNumber(generatedOrderNumber);
      setIsOrderPlaced(true);
      triggerToast('تم إرسال طلب سلتك بنجاح للشركة!', 'success');
    } catch (err) {
      console.error("Error submitting order: ", err);
      triggerToast('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Close Order success state and reset
  const handleResetOrderFlow = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderPlaced(false);
    setCheckoutName('');
    setCheckoutPhone('');
    setCheckoutAddress('');
  };

  // Form submissions
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      triggerToast('يرجى ملء كافة تفاصيل الرسالة', 'error');
      return;
    }
    
    setIsSubmittingContact(true);
    try {
      const messageData = {
        customerName: contactName.trim(),
        customerPhone: contactPhone.trim(),
        message: contactMessage.trim(),
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      setContactSubmitted(true);
      triggerToast('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!', 'success');
      setContactName('');
      setContactPhone('');
      setContactMessage('');
      setTimeout(() => setContactSubmitted(false), 5000);
    } catch (err) {
      console.error("Error submitting message: ", err);
      triggerToast('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    triggerToast('شكراً لتسجيلك في قائمة متجر الندى الحصرية للخصومات والمجموعات الجديدة!', 'success');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 6000);
  };

  // Admin Log-in Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'Zyad71200') {
      setIsAdmin(true);
      sessionStorage.setItem('al_nada_admin', 'true');
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
      setAdminLoginError('');
      triggerToast('مرحباً بك يا مدير المتجر! تم تفعيل وضع التعديل الفوري للجميع.', 'success');
    } else {
      setAdminLoginError('رمز المرور خاطئ. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('al_nada_admin');
    triggerToast('تم الخروج من وضع المسؤول بنجاح.', 'info');
  };

  // Firestore Add/Edit Product Operations
  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    try {
      if (productData.id) {
        // Edit existing product in Firestore
        const docRef = doc(db, 'products', productData.id);
        const { id, ...dataToSave } = productData;
        await setDoc(docRef, dataToSave);
        triggerToast('تم تعديل تفاصيل المنتج الفاخر وتحديث المتجر فوراً!', 'success');
      } else {
        // Add new product to Firestore
        const colRef = collection(db, 'products');
        await addDoc(colRef, productData);
        triggerToast('تمت إضافة المنتج الفاخر الجديد ونشره مباشرة لجميع الزوار!', 'success');
      }
    } catch (err) {
      console.error("Error saving product: ", err);
      triggerToast('فشل حفظ المنتج في قاعدة البيانات الفورية.', 'error');
      throw err;
    }
  };

  // Firestore Delete Operation
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج الفاخر نهائياً من المتجر؟')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        triggerToast('تم حذف المنتج الفاخر نهائياً وتحديث الموقع فوراً.', 'info');
      } catch (err) {
        console.error("Error deleting product: ", err);
        triggerToast('فشل حذف المنتج من قاعدة البيانات.', 'error');
      }
    }
  };

  // Firestore Rate Product Operation
  const handleRateProduct = async (productId: string, starValue: number) => {
    try {
      const docRef = doc(db, 'products', productId);
      const product = products.find(p => p.id === productId);
      if (product) {
        const currentRating = product.rating || 4.8;
        const currentReviewsCount = product.reviewsCount || 10;
        
        // Calculate new average
        const newReviewsCount = currentReviewsCount + 1;
        const newRating = Number(((currentRating * currentReviewsCount + starValue) / newReviewsCount).toFixed(1));
        
        await updateDoc(docRef, {
          rating: newRating,
          reviewsCount: newReviewsCount
        });
        
        triggerToast('تم تسجيل تقييمك ونشره فوراً لجميع الزوار!', 'success');
      }
    } catch (err) {
      console.error("Error rating product: ", err);
      triggerToast('فشل في حفظ التقييم بقاعدة البيانات.', 'error');
    }
  };



  return (
    <div className="min-h-screen font-sans text-gray-800 bg-[#FAFBFD] relative" id="home">
      
      {/* Toast Notification HUD */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-lg flex items-center gap-3 text-white font-medium text-sm backdrop-blur-md pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-emerald-600/95 border-r-4 border-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-rose-600/95 border-r-4 border-rose-400'
                  : 'bg-slate-800/95 border-r-4 border-amber-400'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ADMIN FLOATING STICKY HEADER BAR (If logged in) */}
      {isAdmin && (
        <div className="bg-slate-950 text-white py-2 px-4 sticky top-0 z-50 flex items-center justify-between text-xs font-bold shadow-md flex-wrap gap-2" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-400 font-extrabold">بوابة المسؤول نشطة:</span>
            <span>أي تعديل تقوم به يظهر لجميع المستخدمين فوراً!</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setProductToEdit(null);
                setAdminPanelTab('orders');
                setIsAdminPanelOpen(true);
              }}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer relative"
              title="صندوق الوارد للرسائل والطلبات المستلمة"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>صندوق الوارد</span>
              {(inboxOrdersCount + inboxMessagesCount) > 0 && (
                <span className="min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border border-slate-950 animate-bounce">
                  {inboxOrdersCount + inboxMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setProductToEdit(null);
                setAdminPanelTab('product');
                setIsAdminPanelOpen(true);
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة منتج جديد</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              خروج من الإدارة
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Announcement Banner (Offers Bar) */}
      {offers && offers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 py-2.5 px-4 text-xs font-black shadow-inner relative overflow-hidden" dir="rtl">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse shrink-0"></span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentOfferIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center tracking-wide"
              >
                {offers[currentOfferIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 transition-all ${scrolled ? 'sticky top-0 z-40 shadow-sm' : ''}`} dir="rtl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with secret double-click entrance to the admin login */}
          <div 
            onClick={() => scrollToSection('home')} 
            onDoubleClick={() => {
              setShowAdminLoginModal(true);
              triggerToast('جاري تشغيل المدخل السري للخزانة الرقمية للمالك...', 'info');
            }}
            title="الندى للأدوات الصحية الفاخرة"
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 transform group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-display font-black text-xl tracking-wide text-gray-950">
                الــنــدى
              </span>
              <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">
                الأدوات الصحية الفاخرة
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group py-2 cursor-pointer"
            >
              الرئيسية
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </button>
            <button
              onClick={() => scrollToSection('products-catalog')}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group py-2 cursor-pointer"
            >
              معرض الأدوات الصحية
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </button>
            <button
              onClick={() => setIsContactOpen(true)}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group py-2 cursor-pointer"
            >
              اتصل بنا
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            
            {/* Wishlist HUD Indicator */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (wishlist.length === 0) {
                    triggerToast('قائمة المفضلة فارغة حالياً', 'info');
                  } else {
                    triggerToast(`لديك ${wishlist.length} منتجات في المفضلة، تصفحها بالأسفل`, 'success');
                    scrollToSection('products-catalog');
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors relative cursor-pointer"
                aria-label="المفضلة"
              >
                <Heart className={`w-6 h-6 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-bounce">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full bg-slate-900 hover:bg-amber-600 text-white transition-all duration-300 flex items-center gap-2 relative shadow-sm cursor-pointer"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-xs">السلة</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Contact Us Header Button */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="p-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm"
              aria-label="اتصل بنا"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline font-bold text-xs">اتصل بنا</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg md:hidden hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              aria-label="فتح القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col gap-3">
                <button
                  onClick={() => scrollToSection('home')}
                  className="py-3 px-4 rounded-xl text-right text-gray-800 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium"
                >
                  الرئيسية
                </button>
                <button
                  onClick={() => scrollToSection('products-catalog')}
                  className="py-3 px-4 rounded-xl text-right text-gray-800 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium"
                >
                  منتجات الندى الفاخرة
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsContactOpen(true);
                  }}
                  className="py-3 px-4 rounded-xl text-right text-gray-800 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium"
                >
                  اتصل بنا
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden relative bg-gradient-to-b from-amber-50/60 via-transparent to-[#FAFBFD]">
        
        {/* Subtle Decorative Background shapes */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-400/5 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col text-right">
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold w-fit mb-6 shadow-sm border border-amber-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>تشكيلة الندى للأدوات الصحية الفاخرة وصلت الآن</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight text-gray-950 mb-6"
              >
                اقتنِ الفخامة الحقيقية <br />
                <span className="bg-gradient-to-l from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  من متجر الندى
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
              >
                مجموعات الندى الفاخرة مصممة ومختارة بعناية فائقة لأولئك الذين يعشقون التميز والتفاصيل الراقية. نوفر لك الأناقة الاستثنائية والضمان التام.
              </motion.p>

              {/* Call-to-actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <button
                  onClick={() => scrollToSection('products-catalog')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>تصفح المنتجات المتوفرة</span>
                </button>
              </motion.div>

              {/* Minimal Trust Features list removed as requested */}

            </div>

            {/* Hero Image / Feature card */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="relative w-full max-w-md h-[400px] sm:h-[480px] rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/10 group"
              >
                {/* Overlay card details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent z-10"></div>
                
                <img
                  src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800"
                  alt="خلاط مغسلة كلاسيكي مطلي بالذهب"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Glass Card on top of Hero Image */}
                <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-white flex justify-between items-center">
                  <div>
                    <span className="text-xs text-amber-400 font-medium tracking-wide">{heroBadge}</span>
                    <h3 className="font-display font-bold text-lg mt-1">{heroTitle}</h3>
                    <p className="text-gray-200 text-xs mt-1">{heroDesc}</p>
                  </div>
                  <button
                    onClick={() => scrollToSection('products-catalog')}
                    className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-colors transform hover:scale-105 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Absolute Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 z-20 pointer-events-none"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-gray-900">شحن مجاني</h5>
                  <p className="text-[10px] text-gray-400">للطلبات أعلى من 1000 ريال</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>



      {/* PRODUCTS CATALOG SECTION */}
      <section className="py-16 md:py-24" id="products-catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-right">
            <div>
              <span className="text-xs text-amber-600 font-bold tracking-widest uppercase">رواق الفخامة</span>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-gray-950 mt-2">معروضات الندى الفاخرة</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xl">اختر ما يناسب ذوقك الرفيع من مجموعتنا المنتقاة بعناية تامة لترتقي بأسلوب حياتك اليومي.</p>
            </div>
            
            {/* Admin Add Product Shortcut */}
            {isAdmin && (
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setAdminPanelTab('product');
                  setIsAdminPanelOpen(true);
                }}
                className="mt-4 md:mt-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد فوراً</span>
              </button>
            )}
          </div>

          {/* Search and Category Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8" dir="rtl">
            
            {/* Search Input bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="ابحث عن خلاطات، دش، أحواض، مستلزمات صحية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl border border-gray-200 outline-none text-xs focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 bg-white shadow-sm transition-all text-right"
              />
              <Search className="w-5 h-5 text-gray-400 absolute top-3.5 right-4" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category horizontal scroller */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {(categories.length > 0 ? categories : CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/15'
                      : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-100'
                  } cursor-pointer`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>

          {/* Products Grid Content */}
          {isLoadingProducts && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
              <p className="text-gray-500 font-bold text-sm">جاري تحميل المعروضات الفاخرة من قاعدة البيانات...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={(p) => {
                    setProductToEdit(p);
                    setSelectedImageUrl(p.image);
                    setAdminPanelTab('product');
                    setIsAdminPanelOpen(true);
                  }}
                  onDelete={(id) => handleDeleteProduct(id)}
                  onViewDetails={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => addToCart(p, 1)}
                  isInWishlist={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-xl mx-auto shadow-sm">
              <Database className="w-12 h-12 text-amber-500/60 mx-auto mb-4" />
              <h3 className="font-display font-black text-gray-950 text-lg">لا توجد معروضات حالياً</h3>
              
              {products.length === 0 ? (
                <>
                  <p className="text-gray-500 text-xs leading-relaxed mt-2">
                    المتجر فارغ حالياً بانتظار إضافة المنتجات الفاخرة بواسطة الإدارة.
                  </p>
                  {isAdmin ? (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => {
                          setProductToEdit(null);
                          setAdminPanelTab('product');
                          setIsAdminPanelOpen(true);
                        }}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        إضافة أول منتج يدوياً الآن
                      </button>
                    </div>
                  ) : (
                    <p className="text-amber-600 text-xs font-bold mt-4">
                      يرجى النقر على قفل الإدارة في الأعلى لتسجيل الدخول وإضافة منتجات جديدة.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-xs leading-relaxed mt-2">
                  لم نجد أي منتج يطابق معايير البحث أو الفئة المحددة. جرب البحث عن كلمة أخرى.
                </p>
              )}
            </div>
          )}

        </div>
      </section>



      {/* Newsletter 'Nadi Al-Nada' section completely removed as requested */}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-white/5 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand block */}
          <div className="flex flex-col items-start md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="font-display font-black text-lg">الــنــدى</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">متجر الندي للادوات الصحيه خلاطات و انظمة شاور و احواض فائقة الجوده</p>
            <div className="flex items-center gap-3">
              <a
                href={twitterUrl || '#'}
                target={twitterUrl && twitterUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-gray-400 transition-colors"
                title="تويتر / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl || '#'}
                target={instagramUrl && instagramUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-gray-400 transition-colors"
                title="انستقرام"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl || '#'}
                target={facebookUrl && facebookUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-gray-400 transition-colors"
                title="فيسبوك"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-amber-500">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">الرئيسية</button></li>
              <li><button onClick={() => scrollToSection('products-catalog')} className="hover:text-white transition-colors">المعروضات الفاخرة</button></li>
              <li><button onClick={() => setIsContactOpen(true)} className="hover:text-white transition-colors">تواصل معنا</button></li>
            </ul>
          </div>

          {/* Categories links */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-amber-500">الأقسام الرئيسية</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {(categories.length > 0 ? categories : CATEGORIES).filter((c) => c.id !== 'all').map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(cat.id);
                      scrollToSection('products-catalog');
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Hours */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-amber-500">ساعات العمل والدعم</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              يسعدنا استقبال اتصالاتكم واستفساراتكم على مدار الساعة.
            </p>
            <p className="text-xs text-gray-300 font-bold mb-1">{workingHoursWeekdays}</p>
            <p className="text-xs text-gray-300 font-bold">{workingHoursFriday}</p>
          </div>

        </div>

        {/* Legal block */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4" dir="rtl">
          <p>© {new Date().getFullYear()} متجر الندى الفاخر (Al-Nada Luxury). جميع الحقوق محفوظة بالكامل.</p>
          <p>شحن آمن وعزل سحابي فوري وموثوق 🇸🇦</p>
        </div>
      </footer>

      {/* SHOPPING CART DRAWER / SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Sidebar content */}
            <div className="absolute inset-y-0 left-0 max-w-md w-full flex">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full bg-white flex flex-col shadow-2xl border-r border-gray-100"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFD]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-lg text-gray-950">حقيبة المشتريات</span>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items list */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-3 bg-[#FAFBFD] rounded-2xl border border-gray-50 relative group">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Title & info */}
                        <div className="flex-grow text-right min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs truncate mb-1">{item.product.name}</h4>
                          <span className="text-[10px] text-amber-600 font-bold block mb-2">
                            {(categories.length > 0 ? categories : CATEGORIES).find((c) => c.id === item.product.category)?.name || item.product.category}
                          </span>
                          
                          {/* Qty edit buttons */}
                          <div className="flex items-center justify-between max-w-[100px] border border-gray-200 rounded-lg p-0.5 bg-white">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-5 h-5 rounded hover:bg-gray-50 flex items-center justify-center text-gray-500"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-display font-black text-[11px]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-5 h-5 rounded hover:bg-gray-50 flex items-center justify-center text-gray-500"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="flex flex-col items-end justify-between shrink-0 h-full py-1">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-bold text-gray-800 text-sm">سلة المشتريات فارغة حالياً</h4>
                      <p className="text-gray-400 text-xs mt-1">تصفح رواق المنتجات الفاخرة وأضف لمساتك الراقية إلى السلة.</p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          scrollToSection('products-catalog');
                        }}
                        className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
                      >
                        ابدأ التصفح الآن
                      </button>
                    </div>
                  )}
                </div>

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-100 bg-[#FAFBFD] space-y-4 shrink-0">
                    <div className="space-y-2 text-right">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>عدد الأنواع المختارة:</span>
                        <span className="font-display font-bold">{cart.length} منتج</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>العدد الإجمالي للقطع:</span>
                        <span className="font-display font-bold">{cart.reduce((sum, i) => sum + i.quantity, 0)} قطعة</span>
                      </div>
                      <div className="text-[11px] text-amber-700 font-medium bg-amber-50 p-3 rounded-2xl border border-amber-100 leading-relaxed">
                        سيتم إرسال هذه المجموعة الفاخرة إلى الإدارة فوراً. وسيتواصل معكم فريق الندى لتأكيد التسليم في أسرع وقت.
                      </div>
                    </div>

                    {/* Button trigger checkout form */}
                    {isCheckoutOpen ? (
                      <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-black text-gray-900 text-xs">ارسل بياناتك</h4>
                          <button onClick={() => setIsCheckoutOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600">إلغاء</button>
                        </div>

                        {isOrderPlaced ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-center space-y-2">
                            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                            <h5 className="font-bold text-xs">تم تسجيل الطلب!</h5>
                            <p className="text-[10px] text-emerald-600">رقم طلبك هو: <strong className="font-display">{orderNumber}</strong></p>
                            <p className="text-[10px] text-gray-500">سيتواصل معك فريق الندى لتأكيد الشحن وتوصيل طلبك.</p>
                            <button
                              onClick={handleResetOrderFlow}
                              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-[10px] rounded-lg w-full"
                            >
                              إتمّام العودة للمتجر
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handlePlaceOrder} className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-700 mb-1">الاسم الكريم *</label>
                              <input
                                type="text"
                                required
                                value={checkoutName}
                                onChange={(e) => setCheckoutName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-xs text-right"
                                placeholder="الاسم ثلاثي"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-700 mb-1">رقم الهاتف الجوال *</label>
                              <input
                                type="tel"
                                required
                                value={checkoutPhone}
                                onChange={(e) => setCheckoutPhone(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-xs text-left"
                                placeholder="05xxxxxxxx"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingOrder}
                              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                              {isSubmittingOrder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <span>إرسال الطلب للإدارة الآن</span>
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full py-3 bg-slate-900 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>الانتقال لبيانات إرسال الطلب</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT US DRAWER / SIDEBAR */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Sidebar content */}
            <div className="absolute inset-y-0 left-0 max-w-md w-full flex">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full bg-white flex flex-col shadow-2xl border-r border-gray-100"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFD]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-display font-black text-lg text-gray-950">تواصل معنا</span>
                  </div>
                  <button onClick={() => setIsContactOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 text-right">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-gray-950 text-sm border-b border-gray-100 pb-2">بيانات الاتصال والمعارض</h3>
                    
                    {/* Contact info info-cards */}
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">المعرض الأول (الرئيسي)</h4>
                          <p className="text-gray-500 text-xs mt-1">{address}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">المعرض الثاني</h4>
                          <p className="text-gray-500 text-xs mt-1">{address2}</p>
                        </div>
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white hover:bg-emerald-50/30 border border-emerald-100 hover:border-emerald-200 rounded-2xl flex items-start gap-3 transition-all duration-300 group block cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs group-hover:text-emerald-700 transition-colors">خدمة العملاء (واتساب ومكالمات)</h4>
                          <p className="text-gray-500 text-[11px] mt-0.5 text-left dir-ltr">{phoneNumber}</p>
                          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">اضغط للتواصل الفوري عبر الواتساب 💬</span>
                        </div>
                      </a>

                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">البريد الإلكتروني</h4>
                          <p className="text-gray-500 text-[11px] mt-0.5 text-left dir-ltr">{supportEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-display font-bold text-gray-950 text-sm">أرسل لنا رسالة مباشرة</h3>
                    
                    {contactSubmitted ? (
                      <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                        <h4 className="font-bold text-sm">تم الإرسال بنجاح!</h4>
                        <p className="text-xs text-emerald-600 mt-1.5">شكراً لتواصلك معنا. سيتم الرد عليك في أسرع وقت ممكن.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">الاسم الكريم *</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none text-xs text-right"
                            placeholder="الاسم الثلاثي"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">رقم الهاتف الجوال *</label>
                          <input
                            type="tel"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none text-xs text-left"
                            placeholder="05XXXXXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">الرسالة أو الاستفسار *</label>
                          <textarea
                            rows={3}
                            required
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none text-xs text-right resize-none"
                            placeholder="اكتب استفسارك بالتفصيل وسنسعد بالرد..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingContact}
                          className="w-full py-3 bg-slate-900 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer text-xs"
                        >
                          {isSubmittingContact ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>إرسال الرسالة</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Smaller compact Maps inside the Drawer */}
                  {(googleMapUrl || googleMapUrl2) && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="font-display font-bold text-gray-950 text-sm">موقع معارضنا</h3>
                      <div className="space-y-3">
                        {googleMapUrl && (
                          <div className="w-full h-[150px] rounded-2xl overflow-hidden border border-gray-200 relative shadow-sm">
                            <iframe
                              title="موقع المعرض الأول"
                              src={googleMapUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen={false}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        )}
                        {googleMapUrl2 && (
                          <div className="w-full h-[150px] rounded-2xl overflow-hidden border border-gray-200 relative shadow-sm">
                            <iframe
                              title="موقع المعرض الثاني"
                              src={googleMapUrl2}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen={false}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PASSCODE LOGIN DIALOG POPUP */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAdminLoginModal(false)} />
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full z-10 text-right" dir="rtl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h4 className="font-display font-black text-gray-900 text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <span>دخول الإدارة والتحكم</span>
                </h4>
                <button onClick={() => setShowAdminLoginModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                يرجى إدخال رمز المرور لتفعيل وضع المسؤول. يتيح لك إضافة منتجات الندى وتعديلها وحذفها فوراً لجميع الزوار.
              </p>

              {adminLoginError && (
                <p className="text-rose-500 text-xs font-bold mb-3">{adminLoginError}</p>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  placeholder="أدخل رمز المرور هنا..."
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-xs text-center font-bold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs transition-colors"
                >
                  تأكيد تفعيل وضع الإدارة
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC MODALS USING OUR MODULAR SUBCOMPONENTS */}
      
      {/* Product Details Modal popup */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, q) => addToCart(p, q)}
          onRateProduct={handleRateProduct}
        />
      )}

      {/* Admin Panel add/edit product popup */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        selectedImageUrl={selectedImageUrl}
        setSelectedImageUrl={setSelectedImageUrl}
        products={products}
        categories={categories.length > 0 ? categories : CATEGORIES}
        phoneNumber={phoneNumber}
        workingHoursWeekdays={workingHoursWeekdays}
        workingHoursFriday={workingHoursFriday}
        offers={offers}
        supportEmail={supportEmail}
        googleMapUrl={googleMapUrl}
        address={address}
        address2={address2}
        googleMapUrl2={googleMapUrl2}
        whatsappUrl={whatsappUrl}
        heroBadge={heroBadge}
        heroTitle={heroTitle}
        heroDesc={heroDesc}
        twitterUrl={twitterUrl}
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveSettings={handleSaveSettings}
        initialTab={adminPanelTab}
      />

      {/* Image Gallery selector popup */}
      <ImageGalleryModal
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
        onSelectImage={(url) => {
          setSelectedImageUrl(url);
          triggerToast('تم اختيار الصورة الفاخرة بنجاح من المعرض!', 'success');
        }}
        currentSelectedUrl={selectedImageUrl}
      />

    </div>
  );
}
