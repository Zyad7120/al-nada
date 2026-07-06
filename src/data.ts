export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  description: string;
  longDescription: string;
  rating: number;
  reviewsCount: number;
  features: string[];
  specs: { [key: string]: string };
  inStock: boolean;
  isPopular?: boolean;
  createdAt?: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'جميع المعروضات' },
  { id: 'faucets', name: 'خلاطات وصنابير مياه' },
  { id: 'showers', name: 'أنظمة الدش والاستحمام' },
  { id: 'toilets', name: 'مراحيض وأحواض بورسلين' },
  { id: 'accessories', name: 'إكسسوارات ومستلزمات الحمام' }
];

export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'g-faucet-1',
    name: 'خلاط مغسلة ذهبي فاخر',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800',
    category: 'faucets'
  },
  {
    id: 'g-faucet-2',
    name: 'صنبور كروم عصري',
    url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=800',
    category: 'faucets'
  },
  {
    id: 'g-shower-1',
    name: 'دش مطري أسود فاخر',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    category: 'showers'
  },
  {
    id: 'g-toilet-1',
    name: 'طقم مغسلة وحوض بورسلين',
    url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80&w=800',
    category: 'toilets'
  },
  {
    id: 'g-acc-1',
    name: 'طقم إكسسوارات رخامي',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800',
    category: 'accessories'
  }
];

export const STARTER_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'خلاط مغسلة كلاسيكي مطلي بالذهب عيار 24',
    category: 'faucets',
    price: 1450,
    oldPrice: 1950,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800',
    description: 'خلاط مياه مغسلة إيطالي فاخر مطلي بالذهب المقاوم للصدأ ومصمم لعمر افتراضي طويل.',
    longDescription: 'تألق مذهل وتصميم فاخر يضفي لمسة ملكية على حمامك. يأتي بقلب نحاسي بالكامل مقاوم للتآكل والترسبات الكلسية، مع آلية توفير المياه الذكية بنسبة 30%.',
    rating: 4.9,
    reviewsCount: 34,
    features: [
      'طلاء ذهبي عيار 24 قيراط معالج بتقنية PVD المقاومة للخدش والبهتان',
      'قلب سيراميك إيطالي عالي الجودة يدوم لأكثر من 500,000 استخدام',
      'فلتر لتنقية المياه وتوفير الاستهلاك مع الحفاظ على ضغط قوي'
    ],
    specs: {
      'المنشأ': 'إيطاليا',
      'الضمان': '5 سنوات شامل الاستبدال',
      'المادة الأساسية': 'نحاس نقي خالي من الرصاص'
    },
    inStock: true,
    isPopular: true
  },
  {
    name: 'طقم عمود دش مطري متكامل أسود مطفأ',
    category: 'showers',
    price: 2100,
    oldPrice: 2650,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    description: 'نظام دش مطري فاخر ذو تصميم عصري جذاب بلون أسود مطفأ أنيق مقاوم للتكلس والماء.',
    longDescription: 'تمتع بتجربة سبا متكاملة في منزلك مع دش مطري هادئ وتدفق مياه مثالي. يتميز بنظام تحكم ثيرموستاتيك دقيق لتثبيت درجة الحرارة ومنع الحروق المفاجئة.',
    rating: 4.8,
    reviewsCount: 48,
    features: [
      'رأس دش مطري مقاس 30×30 سم مع دش يدوي إضافي متعدد الوظائف',
      'جسم صمام ثرموستاتي ذكي مدمج لتنظيم درجة الحرارة بدقة',
      'مصنوع من الفولاذ المقاوم للصدأ SUS304 المعالج باللون الأسود المطفأ الفاخر'
    ],
    specs: {
      'المنشأ': 'ألمانيا',
      'الضمان': '7 سنوات',
      'نوع التركيب': 'جداري ظاهر أو مدفون حسب الرغبة'
    },
    inStock: true,
    isPopular: true
  },
  {
    name: 'مرحاض معلق ذو كفاءة مائية عالية',
    category: 'toilets',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1564540574859-0dfb63985953?auto=format&fit=crop&q=80&w=800',
    description: 'مرحاض معلق أنيق وعصري مصنوع من البورسلين الفاخر المصقول بالكامل مع غطاء هيدروليكي صامت.',
    longDescription: 'يجمع هذا المرحاض المعلق بين الجمالية العصرية وسهولة التنظيف التامة. بورسلين معالج بتقنية نانو المضادة للبكتيريا والالتصاق لضمان أقصى درجات النظافة والراحة.',
    rating: 4.9,
    reviewsCount: 19,
    features: [
      'نظام شطف توربيني قوي وصامت موفر استهلاك المياه بشكل استثنائي',
      'بورسلين فاخر مصقول بالكامل من الداخل والخارج لسهولة التنظيف التامة',
      'غطاء هيدروليكي ذو إغلاق ناعم وصامت يمنع الارتطام والكسر'
    ],
    specs: {
      'البلد المصنع': 'إسبانيا',
      'الأبعاد': '54 × 36 × 35 سم',
      'الوزن المدعوم': 'حتى 400 كجم'
    },
    inStock: true,
    isPopular: true
  },
  {
    name: 'مغسلة بورسلين إيطالي بيضاوية بيضاء',
    category: 'toilets',
    price: 850,
    oldPrice: 1100,
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80&w=800',
    description: 'حوض مغسلة بورسلين إيطالي يوضع فوق الرخام بتصميم بيضاوي انسيابي ناعم للغاية.',
    longDescription: 'أناقة لا تتأثر بالزمن. مغسلة مصنوعة من البورسلين المصقول المعزز حرارياً لمقاومة الخدش والصدمات والبقع بشكل كامل.',
    rating: 4.7,
    reviewsCount: 22,
    features: [
      'تصميم انسيابي بيضاوي رقيق الحواف مع متانة فائقة بفضل المعالجة الحرارية',
      'سطح أملس لامع مقاوم للبقع والألوان والترسبات الصفراء والصدأ',
      'سهلة التركيب فوق كافة أنواع الأسطح والرخام والخشب المعالج'
    ],
    specs: {
      'المنشأ': 'إيطاليا',
      'الأبعاد': '60 × 40 × 15 سم',
      'نوع الحوض': 'مغسلة فوق الرخام (سطحية)'
    },
    inStock: true,
    isPopular: false
  },
  {
    name: 'حامل مناشف جداري فاخر مطلي بالكروم',
    category: 'accessories',
    price: 320,
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800',
    description: 'حامل مناشف متعدد المستويات مصنع من النحاس والستانلس ستيل الكروم اللامع.',
    longDescription: 'تنظيم حمامك بأسلوب راقٍ. يضمن طلاء الكروم المقاوم للملوحة والرطوبة العالية لمعاناً مستداماً يمنع التقشير والصدأ تحت تأثير بخار الحمام.',
    rating: 4.6,
    reviewsCount: 15,
    features: [
      'مصنوع من خليط النحاس الأصفر والستانلس ستيل لمقاومة الرطوبة التامة',
      'طلاء كروم بريق المرآة سهل التنظيف بمجرد المسح بقطعة قماش ناعمة',
      'يتحمل الأوزان الثقيلة ومقاوم للاهتزاز بفضل مسامير التثبيت المخفية والمتينة'
    ],
    specs: {
      'المنشأ': 'تايوان',
      'الطول': '60 سم',
      'الضمان': '3 سنوات'
    },
    inStock: true,
    isPopular: false
  }
];
