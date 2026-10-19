import React, { useState } from 'react';
import { Box, ExternalLink, Download, Sparkles, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { ProductCard } from '../store/ProductCard.tsx';
import type { Product } from '../../types/index.ts';

interface DigitalModelsViewProps {
  onQuickView: (product: Product) => void;
}

export const DigitalModelsView: React.FC<DigitalModelsViewProps> = ({ onQuickView }) => {
  const { products, parametricTools } = useStore();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'stl_models' | 'parametric_tools'>('stl_models');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);

  const digitalModels = products.filter(p => p.isDigital);

  const filteredModels = digitalModels.filter(m => {
    if (m.basePrice > maxPrice) return false;
    if (selectedFormat !== 'all' && m.digitalFormat !== selectedFormat) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase mb-2">
            <Box className="w-3.5 h-3.5 text-green-600" />
            <span>DIGITAL ASSETS &amp; PARAMETRIC DESIGN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            3D Models &amp; Parametric Tools
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Download print-ready STL &amp; 3MF digital models or generate custom dimensioned parts with MakerWorld parametric tools.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('stl_models')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'stl_models'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital 3D Files (STL)
          </button>
          <button
            onClick={() => setActiveTab('parametric_tools')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'parametric_tools'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span>MakerWorld Parametric</span>
          </button>
        </div>
      </div>

      {activeTab === 'stl_models' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                File Format
              </div>
              <div className="space-y-1">
                {['all', 'STL', '3MF'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      selectedFormat === fmt
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {fmt === 'all' ? 'All Formats' : `${fmt} Standard`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Max Price:</span>
                <span className="font-mono text-green-600">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxPrice}
                onChange={e => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full accent-green-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹50</span>
                <span>₹250</span>
                <span>₹500</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Instant Digital Fulfilment</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Purchasing digital models includes clean slice presets, orientation notes, and instant download delivery link upon WhatsApp confirmation.
              </p>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {filteredModels.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No 3D models match the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map(model => (
                  <ProductCard
                    key={model.id}
                    product={model}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Parametric Tools Directory (MakerWorld Integration) */
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-xs text-green-950 leading-relaxed">
              <strong>Parametric Customisation Engine:</strong> Customize dimensions, wall thickness, screw pitches, and compartments live in your browser using official MakerWorld parametric links. Once customized, download the sliced 3MF or request us to print it for you!
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {parametricTools.map(tool => (
              <div
                key={tool.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="aspect-video w-full rounded-lg bg-slate-100 overflow-hidden mb-3 border border-slate-200 flex items-center justify-center p-2">
                    <img
                      src={tool.thumbnail}
                      alt={tool.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{tool.category}</span>
                    {tool.badge && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200/60">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <a
                    href={tool.makerWorldUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Launch on MakerWorld</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
