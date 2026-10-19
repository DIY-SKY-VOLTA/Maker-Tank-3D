import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProductCard } from '../store/ProductCard.tsx';
import { EditableText } from '../inline-editor/EditableText.tsx';
import type { Product } from '../../types/index.ts';

interface ShopViewProps {
  onQuickView: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onQuickView }) => {
  const { products, categories, selectedCategory, setSelectedCategory, updateCategoryInDb } = useStore();
  const { isEditMode } = useAuth();

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [printTypeFilter, setPrintTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Hierarchy: Primary categories & Subcategories
  const primaryCategories = categories.filter(c => !c.parentId);
  const subcategories = categories.filter(c => c.parentId === selectedCategory);

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Exclude purely digital items if browsing physical shop unless digital category selected
      if (selectedCategory !== 'cat-3d-models' && p.isDigital && !selectedCategory) {
        return false;
      }

      // Category filter
      if (selectedCategory && p.categoryId !== selectedCategory && p.subcategoryId !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (activeSubcategory && p.subcategoryId !== activeSubcategory) {
        return false;
      }

      // Price filter
      if (p.basePrice > maxPrice) {
        return false;
      }

      // Color filter
      if (selectedColor && p.colors) {
        const hasColor = p.colors.some(c => c.name.toLowerCase().includes(selectedColor.toLowerCase()));
        if (!hasColor) return false;
      }

      // Print type
      if (printTypeFilter !== 'all' && p.printType !== printTypeFilter && p.printType !== 'BOTH') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.basePrice - b.basePrice;
      if (sortBy === 'price_high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.isFeatured ? 1 : -1;
    });
  }, [products, selectedCategory, activeSubcategory, maxPrice, selectedColor, printTypeFilter, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory(null);
    setActiveSubcategory(null);
    setMaxPrice(3000);
    setSelectedColor(null);
    setPrintTypeFilter('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  const sampleColors = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#18181b' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Gold', hex: '#f59e0b' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner & Header */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <button onClick={() => setSelectedCategory(null)} className="hover:text-slate-900">
              All Products
            </button>
            {currentCategoryObj && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentCategoryObj.name}</span>
              </>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {isEditMode && currentCategoryObj ? (
              <EditableText
                value={currentCategoryObj.name}
                as="h1"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight"
                onSave={async (newName) => {
                  await updateCategoryInDb(currentCategoryObj.id, { name: newName });
                }}
              />
            ) : (
              <h1>{currentCategoryObj ? currentCategoryObj.name : '3D Printed Store'}</h1>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 max-w-xl">
            {isEditMode && currentCategoryObj ? (
              <EditableText
                value={currentCategoryObj.description || ''}
                as="p"
                multiline={true}
                className="text-xs text-slate-500"
                placeholder="Click to add category description..."
                onSave={async (newDesc) => {
                  await updateCategoryInDb(currentCategoryObj.id, { description: newDesc });
                }}
              />
            ) : (
              <p>
                {currentCategoryObj?.description ||
                  'Explore our premium ready-to-order 3D prints, custom keychains with bulk tiers, and functional home decor.'}
              </p>
            )}
          </div>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-44 sm:w-56"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories Selector */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Categories</span>
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveSubcategory(null);
                  }}
                  className="text-[10px] text-orange-600 hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveSubcategory(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedCategory === null
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Products
              </button>

              {primaryCategories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isEditMode ? (
                      <div className="flex-1 mr-1">
                        <EditableText
                          value={cat.name}
                          className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}
                          onSave={async (newName) => {
                            await updateCategoryInDb(cat.id, { name: newName });
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveSubcategory(null);
                        }}
                        className="flex-1 text-left truncate"
                      >
                        {cat.name}
                      </button>
                    )}
                    {isEditMode && (
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveSubcategory(null);
                        }}
                        className={`text-[10px] underline ml-1 shrink-0 ${isSelected ? 'text-orange-300' : 'text-orange-600'}`}
                      >
                        Filter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nested Subcategories if applicable */}
            {subcategories.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subcategories
                </div>
                {subcategories.map(sub => (
                  <div
                    key={sub.id}
                    className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-md transition-colors ${
                      activeSubcategory === sub.id
                        ? 'bg-orange-100 text-orange-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-200 font-medium'
                    }`}
                  >
                    {isEditMode ? (
                      <div className="flex-1 mr-1">
                        <EditableText
                          value={sub.name}
                          prefix="• "
                          className="text-xs font-medium text-slate-700"
                          onSave={async (newName) => {
                            await updateCategoryInDb(sub.id, { name: newName });
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? null : sub.id)}
                        className="flex-1 text-left truncate"
                      >
                        • {sub.name}
                      </button>
                    )}
                    {isEditMode && (
                      <button
                        onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? null : sub.id)}
                        className="text-[10px] text-orange-600 underline ml-1 shrink-0"
                      >
                        Filter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Slider */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Max Price:</span>
              <span className="font-mono text-orange-600">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹50</span>
              <span>₹1,500</span>
              <span>₹3,000</span>
            </div>
          </div>

          {/* Color Filter */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Filter by Color:</span>
              {selectedColor && (
                <button
                  onClick={() => setSelectedColor(null)}
                  className="text-[10px] text-orange-600 hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sampleColors.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedColor === c.name
                      ? 'border-orange-600 scale-110 shadow-xs'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Print Technology Filter */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900">Print Technology:</div>
            <div className="grid grid-cols-3 gap-1">
              {['all', 'FDM', 'SLA'].map(type => (
                <button
                  key={type}
                  onClick={() => setPrintTypeFilter(type)}
                  className={`py-1 text-xs font-semibold rounded capitalize transition-colors ${
                    printTypeFilter === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No products match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try expanding your price range or resetting color/subcategory filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
