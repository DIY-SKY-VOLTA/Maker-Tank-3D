import React, { useState } from 'react';
import { Gift, ChevronRight, Sparkles, Heart, Briefcase, Cake, Settings } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProductCard } from '../store/ProductCard.tsx';
import { ASSETS } from '../../utils/assets.ts';
import { EditableText } from '../inline-editor/EditableText.tsx';
import { EditableImage } from '../inline-editor/EditableImage.tsx';
import { SectionEditorModal } from '../inline-editor/SectionEditorModal.tsx';
import type { Product } from '../../types/index.ts';

interface EventsViewProps {
  onQuickView: (product: Product) => void;
  onNavigate: (view: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onQuickView, onNavigate }) => {
  const { products, selectedEvent, setSelectedEvent, settings, updateSettingsInDb } = useStore();
  const { isEditMode } = useAuth();
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const eventCategories = [
    { id: 'birthday', label: 'Birthday', icon: '🎂', desc: 'Party favours, name gifts and cake decorations.' },
    { id: 'parties', label: 'Parties', icon: '🎉', desc: 'Fun and creative 3D prints for all kinds of parties.' },
    { id: 'wedding', label: 'Wedding', icon: '💍', desc: 'Elegant and personalised gifts for your special day.' },
    { id: 'corporate', label: 'Office & Corporate', icon: '🏢', desc: 'Branded desk accessories and client gifting.' },
    { id: 'return_gifts', label: 'Return Gifts', icon: '🎁', desc: 'Thoughtful return gifts for bulk occasions.' },
    { id: 'festivals', label: 'Festivals', icon: '🪔', desc: 'Decorative and gifting ideas for celebrations.' },
    { id: 'school', label: 'School & College', icon: '🎓', desc: 'Custom gifts for students, clubs, and teachers.' },
    { id: 'baby', label: 'Baby & Kids', icon: '🧸', desc: 'Keepsakes, name signs, and articulated toys.' },
    { id: 'others', label: 'Others', icon: '🛍️', desc: 'Custom themes, trophies, and bulk orders.' },
  ];

  // Specific Curated Collections matching mockups
  const birthdayProducts = products.filter(p => p.occasionTags?.includes('birthday')).slice(0, 4);
  const weddingProducts = products.filter(p => p.occasionTags?.includes('wedding')).slice(0, 4);
  const corporateProducts = products.filter(p => p.occasionTags?.includes('corporate')).slice(0, 4);

  // If user selected a specific occasion filter
  const activeEventProducts = selectedEvent
    ? products.filter(p => p.occasionTags?.includes(selectedEvent.toLowerCase()))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. HERO BANNER */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-rose-50 shadow-sm">
        {isEditMode && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={() => setIsSectionModalOpen(true)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-300 shadow-2xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-orange-600" />
              <span>Configure Banner</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-10">
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              {isEditMode ? (
                <EditableText
                  value={settings?.eventsBannerTag || 'SPECIAL OCCASIONS & BULK RETURN GIFTS'}
                  onSave={async (val) => {
                    await updateSettingsInDb({ eventsBannerTag: val });
                  }}
                  className="font-bold uppercase tracking-wide"
                />
              ) : (
                <span>{settings?.eventsBannerTag || 'SPECIAL OCCASIONS & BULK RETURN GIFTS'}</span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {isEditMode ? (
                <EditableText
                  value={settings?.eventsBannerTitle || 'Unique 3D Printed Gifts for Every Event'}
                  as="h1"
                  className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight"
                  onSave={async (val) => {
                    await updateSettingsInDb({ eventsBannerTitle: val });
                  }}
                />
              ) : (
                <h1>{settings?.eventsBannerTitle || 'Unique 3D Printed Gifts for Every Event'}</h1>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
              {isEditMode ? (
                <EditableText
                  value={settings?.eventsBannerSubtitle || 'Make every moment memorable. Customise name keychains, cake toppers, corporate logo stands, and bulk gift boxes with tailored color palettes.'}
                  as="p"
                  multiline={true}
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                  onSave={async (val) => {
                    await updateSettingsInDb({ eventsBannerSubtitle: val });
                  }}
                />
              ) : (
                <p>
                  {settings?.eventsBannerSubtitle ||
                    'Make every moment memorable. Customise name keychains, cake toppers, corporate logo stands, and bulk gift boxes with tailored color palettes.'}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigate(settings?.eventsBannerBtnLink || 'custom')}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                {isEditMode ? (
                  <EditableText
                    value={settings?.eventsBannerBtnText || 'Request Custom Occasion Batch'}
                    onSave={async (val) => {
                      await updateSettingsInDb({ eventsBannerBtnText: val });
                    }}
                    className="text-white font-bold"
                  />
                ) : (
                  <span>{settings?.eventsBannerBtnText || 'Request Custom Occasion Batch'}</span>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-xs rounded-xl overflow-hidden border border-rose-200 bg-white p-2 shadow-md relative">
              <EditableImage
                src={settings?.eventsBannerImage || ASSETS.eventGifting}
                alt="Maker Tank 3D Event Return Gifts"
                title="Replace Events Banner Image"
                buttonLabel="Change Gift Graphic"
                onSave={async (newUrl) => {
                  await updateSettingsInDb({ eventsBannerImage: newUrl });
                }}
                className="w-full h-auto object-contain rounded-lg"
                containerClassName="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. OCCASION SELECTOR GRID */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
            Choose an Occasion
          </h2>
          {selectedEvent && (
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Show All Occasions
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {eventCategories.map(evt => {
            const isSelected = selectedEvent === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEvent(isSelected ? null : evt.id)}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-all focus:outline-none ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 shadow-sm ring-1 ring-orange-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl mb-1" role="img" aria-label={evt.label}>
                  {evt.icon}
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {evt.label}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {evt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTERED OR CURATED SECTIONS */}
      {selectedEvent && activeEventProducts ? (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              Curated for {selectedEvent.replace('_', ' ')} ({activeEventProducts.length} items)
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Clear Filter
            </button>
          </div>

          {activeEventProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">
                No items specifically tagged for this event yet. You can request a custom design batch anytime!
              </p>
              <button
                onClick={() => onNavigate('custom')}
                className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Request Custom Batch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeEventProducts.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section: Popular Picks for Birthdays */}
          {birthdayProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-600" />
                  <div className="text-lg font-extrabold text-slate-950">
                    {isEditMode ? (
                      <EditableText
                        value={settings?.birthdaySectionTitle || 'Popular Picks for Birthdays'}
                        as="h3"
                        className="text-lg font-extrabold text-slate-950"
                        onSave={async (val) => {
                          await updateSettingsInDb({ birthdaySectionTitle: val });
                        }}
                      />
                    ) : (
                      <h3>{settings?.birthdaySectionTitle || 'Popular Picks for Birthdays'}</h3>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    · Custom name gifts, cake toppers, keychains &amp; mini figurines
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEvent('birthday')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View All Birthday</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {birthdayProducts.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
                ))}
              </div>
            </div>
          )}

          {/* Section: Popular Picks for Weddings */}
          {weddingProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  <div className="text-lg font-extrabold text-slate-950">
                    {isEditMode ? (
                      <EditableText
                        value={settings?.weddingSectionTitle || 'Popular Picks for Weddings'}
                        as="h3"
                        className="text-lg font-extrabold text-slate-950"
                        onSave={async (val) => {
                          await updateSettingsInDb({ weddingSectionTitle: val });
                        }}
                      />
                    ) : (
                      <h3>{settings?.weddingSectionTitle || 'Popular Picks for Weddings'}</h3>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    · Elegant couple name plaques, wedding favours, and return gift boxes
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEvent('wedding')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View All Wedding</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {weddingProducts.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
                ))}
              </div>
            </div>
          )}

          {/* Section: Popular Picks for Office & Corporate */}
          {corporateProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-800" />
                  <div className="text-lg font-extrabold text-slate-950">
                    {isEditMode ? (
                      <EditableText
                        value={settings?.corporateSectionTitle || 'Popular Picks for Office & Corporate'}
                        as="h3"
                        className="text-lg font-extrabold text-slate-950"
                        onSave={async (val) => {
                          await updateSettingsInDb({ corporateSectionTitle: val });
                        }}
                      />
                    ) : (
                      <h3>{settings?.corporateSectionTitle || 'Popular Picks for Office & Corporate'}</h3>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    · Branded client gifts, custom desk stands, and company logo keychains
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEvent('corporate')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View All Corporate</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {corporateProducts.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events Banner Section Settings Modal */}
      {isSectionModalOpen && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setIsSectionModalOpen(false)}
          sectionName="Events Page Banner"
          fields={[
            { key: 'eventsBannerTag', label: 'Banner Badge' },
            { key: 'eventsBannerTitle', label: 'Banner Title' },
            { key: 'eventsBannerSubtitle', label: 'Banner Description', type: 'textarea' },
            { key: 'eventsBannerBtnText', label: 'Button Label' },
            { key: 'eventsBannerBtnLink', label: 'Button Destination View' },
            { key: 'eventsBannerImage', label: 'Banner Image', type: 'image' },
            { key: 'birthdaySectionTitle', label: 'Birthday Section Title' },
            { key: 'weddingSectionTitle', label: 'Wedding Section Title' },
            { key: 'corporateSectionTitle', label: 'Corporate Section Title' },
          ]}
        />
      )}
    </div>
  );
};
