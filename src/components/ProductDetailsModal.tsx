import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Star, ShoppingCart, Sparkles, Plus, Minus, Info } from 'lucide-react';
import { Product, CATEGORIES } from '../data';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRateProduct?: (productId: string, ratingValue: number) => Promise<void>;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onRateProduct
}: ProductDetailsModalProps) {
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Rating interactive states
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(() => {
    return localStorage.getItem(`rated_prod_${product.id}`) === 'true';
  });

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden z-10 text-right flex flex-col md:flex-row relative" dir="rtl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 relative bg-gray-50 flex flex-col justify-between p-4 min-h-[350px]">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-gray-100 flex-grow flex items-center justify-center">
            {product.isPopular && (
              <span className="absolute top-4 right-4 z-10 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>رائج ومفضل للعملاء</span>
              </span>
            )}
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2.5 mt-2 justify-center scrollbar-none">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === imgUrl ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/10' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          <div>
            {/* Category */}
            <span className="text-xs text-amber-600 font-bold tracking-wider uppercase bg-amber-50 px-2.5 py-1 rounded-lg w-fit block mb-3">
              {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
            </span>

            {/* Title */}
            <h3 className="font-display font-black text-2xl text-gray-950 mb-3">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg text-amber-700 font-bold text-xs">
                <span>{product.rating || 4.8}</span>
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-xs text-gray-400">({product.reviewsCount || 10} تقييم حقيقي من عملائنا)</span>
            </div>

            {/* Price section removed */}

            {/* Short Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.longDescription || product.description}</p>

            {/* Interactive Rating Component */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
              <div>
                <h4 className="text-xs font-black text-slate-800">ما هو تقييمك لهذا العرض؟</h4>
                <p className="text-[10px] text-slate-500 mt-1">اضغط على النجوم لتقديم تقييمك الحقيقي وسيظهر عند جميع الزوار فوراً</p>
              </div>
              <div className="flex items-center gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={async () => {
                      if (hasRated) return;
                      setHoverRating(0);
                      setHasRated(true);
                      setUserRating(starValue);
                      localStorage.setItem(`rated_prod_${product.id}`, 'true');
                      if (onRateProduct) {
                        await onRateProduct(product.id, starValue);
                      }
                    }}
                    onMouseEnter={() => !hasRated && setHoverRating(starValue)}
                    onMouseLeave={() => !hasRated && setHoverRating(0)}
                    disabled={hasRated}
                    className={`p-1 transition-transform transform active:scale-95 ${hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
                  >
                    <Star
                      className={`w-5.5 h-5.5 transition-colors ${
                        starValue <= (hoverRating || userRating || (hasRated ? product.rating : 0))
                          ? 'fill-amber-500 text-amber-500 animate-pulse'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {hasRated && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 ml-2">
                    مقيّم!
                  </span>
                )}
              </div>
            </div>

            {/* Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 text-sm mb-3">أبرز المزايا الفاخرة:</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Details Table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>المواصفات الفنية والقياسية:</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="text-right">
                      <span className="text-[10px] text-gray-400 block">{key}</span>
                      <span className="text-xs font-bold text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-1 shrink-0 bg-white sm:w-32">
              <button
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-black text-sm">{qty}</span>
              <button
                onClick={() => setQty((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* CTA Buy */}
            <button
              onClick={() => {
                onAddToCart(product, qty);
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transform hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>إضافة {qty} منتجات إلى سلة المشتريات</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
