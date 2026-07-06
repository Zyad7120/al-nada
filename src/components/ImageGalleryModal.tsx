import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Link as LinkIcon, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { GALLERY_IMAGES, CATEGORIES, GalleryImage } from '../data';
import { compressImage } from '../imageCompressor';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentSelectedUrl?: string;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedUrl
}: ImageGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Handle local file upload (converts to Base64 with high-efficiency client-side compression)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).');
      return;
    }

    // Since we compress the image client-side, we can support files up to 10MB in size
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً. يرجى اختيار ملف صورة أقل من 10 ميغابايت.');
      return;
    }

    try {
      setUploadError('');
      setIsCompressing(true);
      // Compress to maximum 800x800 dimensions and 0.7 quality - resulting in ~30KB to 50KB size
      const compressedBase64 = await compressImage(file, 800, 800, 0.7);
      onSelectImage(compressedBase64);
      onClose();
    } catch (err) {
      console.error('Error compressing image:', err);
      setUploadError('حدث خطأ أثناء قراءة وضغط الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCompressing(false);
    }
  };

  const filteredImages = GALLERY_IMAGES.filter((img) => {
    const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-2xl w-full h-[600px] overflow-hidden flex flex-col z-10 text-right" dir="rtl">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-900 text-lg">معرض الصور الفاخرة</h3>
              <p className="text-gray-400 text-xs mt-0.5">اختر صورة للمنتج من المعرض، أو ارفع صورتك الخاصة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            معرض الصور الجاهزة
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'url'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            رابط صورة خارجي (URL)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            رفع صورة من جهازك
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'gallery' && (
            <div className="flex flex-col gap-4 h-full">
              {/* Filter and Search inside Gallery tab */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ابحث في الصور الجاهزة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 outline-none text-xs focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute top-2.5 right-3" />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        categoryFilter === cat.id
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1">
                {filteredImages.map((img) => {
                  const isSelected = currentSelectedUrl === img.url;
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        onSelectImage(img.url);
                        onClose();
                      }}
                      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 p-2 text-white">
                        <p className="text-[10px] font-bold truncate text-right">{img.name}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col gap-4 py-8 max-w-md mx-auto h-full justify-center">
              <div className="text-center mb-2">
                <LinkIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 text-sm">أضف رابط صورة خارجي</h4>
                <p className="text-gray-400 text-xs mt-1">انسخ رابط الصورة من أي موقع وألصقه بالأسفل لإضافته فوراً</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-product-image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs focus:border-amber-500 text-left dir-ltr"
                />
              </div>
              <button
                disabled={!customUrl.trim()}
                onClick={() => {
                  onSelectImage(customUrl);
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                تطبيق الصورة المحددة
              </button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col gap-4 py-6 max-w-md mx-auto h-full justify-center">
              {isCompressing ? (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                  <h4 className="font-bold text-gray-950 text-sm">جاري معالجة وضغط الصورة...</h4>
                  <p className="text-gray-400 text-xs">نقوم بتقليص حجم الصورة بنسبة 95% لتسريع التصفح والتحميل فوراً!</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 text-sm">رفع صورة مباشرة</h4>
                    <p className="text-gray-400 text-xs mt-1">اختر ملف صورة من جهازك ليتم تحويلها وحفظها بشكل آمن</p>
                  </div>

                  <div className="mt-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 hover:border-amber-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-amber-50/10 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">انقر هنا لاختيار الملف من حاسوبك</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold text-amber-600">سيتم ضغطها وتصغير حجمها تلقائياً</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </>
              )}

              {uploadError && (
                <p className="text-xs text-rose-500 text-center font-semibold mt-2">{uploadError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
