import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import type { Product } from '../../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.occasionTags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 3D prints, keychains, plant pots, STL models..."
            autoFocus
            className="flex-1 text-sm font-medium focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Type keywords such as &ldquo;keychain&rdquo;, &ldquo;plant pot&rdquo;, &ldquo;moon lamp&rdquo;, or &ldquo;STL&rdquo;.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching products found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-slate-100 p-0.5 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {prod.coverImage && (
                      <img src={prod.coverImage} alt={prod.name} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">₹{prod.basePrice}</span>
                      <span>·</span>
                      <span>{prod.printType}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
