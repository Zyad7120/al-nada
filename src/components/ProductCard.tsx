import React from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Sparkles, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { Product, CATEGORIES } from '../data';

interface ProductCardProps {
  key?: any;
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInWishlist: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function ProductCard({
  product,
  isAdmin,
  onEdit,
  onDelete,
  onViewDetails,
  onAddToCart,
  isInWishlist,
  onToggleWishlist
}: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full relative"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        
        {/* Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {product.isPopular && (
            <span className="bg-amber-50 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-amber-200">
              <Sparkles className="w-3 h-3 fill-current text-amber-500" />
              <span>رائج</span>
            </span>
          )}
        </div>

        {/* Wishlist toggle action button */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-rose-500 hover:bg-white shadow-sm transition-colors cursor-pointer"
          aria-label="أضف للمفضلة"
        >
          <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Preview hover overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onViewDetails(product)}
            className="bg-white/95 text-gray-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:bg-amber-500 hover:text-slate-950 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            عرض التفاصيل الفاخرة
          </button>
        </div>

        {/* Floating Admin Controls Overlay */}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 left-3 z-20 flex gap-2 justify-center bg-slate-950/70 backdrop-blur-md py-1.5 px-3 rounded-xl border border-white/10 shadow-lg">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Edit className="w-3 h-3" />
              <span>تعديل</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="حذف المنتج"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>

      {/* Product Content Card body */}
      <div className="p-5 flex flex-col flex-grow text-right">
        
        {/* Category & stars */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] text-amber-600 font-bold tracking-wider uppercase">
            {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <span className="text-[11px] text-amber-700 font-black">{product.rating || 4.8}</span>
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Title & Description */}
        <h4
          onClick={() => onViewDetails(product)}
          className="font-display font-bold text-gray-900 text-base mb-2 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
        >
          {product.name}
        </h4>
        
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Action Row */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-center">
          
          {/* CTA add to basket */}
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>أضف للسلة</span>
          </button>

        </div>

      </div>

    </motion.div>
  );
}
