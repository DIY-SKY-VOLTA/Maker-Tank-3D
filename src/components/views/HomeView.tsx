import React, { useState } from 'react';
import { ArrowRight, Printer, Sparkles, Box, ShieldCheck, Award, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProductCard } from '../store/ProductCard.tsx';
import { ASSETS } from '../../utils/assets.ts';
import { EditableText } from '../inline-editor/EditableText.tsx';
import { EditableImage } from '../inline-editor/EditableImage.tsx';
import { SectionEditorModal } from '../inline-editor/SectionEditorModal.tsx';
import type { Product } from '../../types/index.ts';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectEvent: (eventTag: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectEvent,
  onQuickView,
}) => {
  const { products, categories, settings, updateSettingsInDb, updateCategoryInDb } = useStore();
  const { isEditMode } = useAuth();

  const [activeSectionModal, setActiveSectionModal] = useState<string | null>(null);

  const featuredProducts = products.filter(p => p.isFeatured && !p.isDigital).slice(0, 4);
  const digitalModels = products.filter(p => p.isDigital).slice(0, 4);

  const eventPills = [
    { id: 'birthday', label: 'Birthday', icon: '🎂' },
    { id: 'parties', label: 'Parties', icon: '🎉' },
    { id: 'wedding', label: 'Wedding', icon: '💍' },
    { id: 'corporate', label: 'Office & Corporate', icon: '🏢' },
    { id: 'return_gifts', label: 'Return Gifts', icon: '🎁' },
    { id: 'festivals', label: 'Festivals', icon: '🪔' },
    { id: 'school', label: 'School & College', icon: '🎓' },
    { id: 'others', label: 'Others', icon: '🛍️' },
  ];

  const primaryCategories = categories.filter(c => !c.parentId);

  // Section visibility checks (default true if undefined)
  const showCategories = settings?.showCategoriesSection ?? true;
  const showEvents = settings?.showEventsSection ?? true;
  const showConcept = settings?.showConceptSection ?? true;
  const showFeatured = settings?.showFeaturedSection ?? true;
  const showModels = settings?.showModelsSection ?? true;
  const showWhyChoose = settings?.showWhyChooseSection ?? true;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-10 sm:pt-16 pb-12 border-b border-slate-100">
        {/* Subtle section editor trigger in Edit Mode */}
        {isEditMode && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-950 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span>Hero Section Editor: Click text or image to edit directly, or configure section settings.</span>
            </span>
            <button
              onClick={() => setActiveSectionModal('hero')}
              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <Settings className="w-3 h-3" />
              <span>Section Settings</span>
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headlines & Action CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-900 border border-green-200/80 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {isEditMode ? (
                  <EditableText
                    value={settings?.heroBadge || 'IDEAS • DESIGNS • FUNCTIONAL PARTS'}
                    onSave={async (val) => {
                      await updateSettingsInDb({ heroBadge: val });
                    }}
                    className="font-bold uppercase tracking-wide"
                  />
                ) : (
                  <span>{settings?.heroBadge || 'IDEAS • DESIGNS • FUNCTIONAL PARTS'}</span>
                )}
              </div>

              {/* Headline */}
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] text-balance">
                {isEditMode ? (
                  <EditableText
                    value={settings?.heroHeadline || 'Your Ideas, Printed for Real Life.'}
                    as="h1"
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]"
                    onSave={async (val) => {
                      await updateSettingsInDb({ heroHeadline: val });
                    }}
                  />
                ) : (
                  <h1>{settings?.heroHeadline || 'Your Ideas, Printed for Real Life.'}</h1>
                )}
              </div>

              {/* Subheadline */}
              <div className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {isEditMode ? (
                  <EditableText
                    value={settings?.heroSubheadline || 'Custom 3D printing, personalised gifts, functional parts and innovative designs for every occasion.'}
                    as="p"
                    multiline={true}
                    className="text-base sm:text-lg text-slate-600 leading-relaxed"
                    onSave={async (val) => {
                      await updateSettingsInDb({ heroSubheadline: val });
                    }}
                  />
                ) : (
                  <p>{settings?.heroSubheadline || 'Custom 3D printing, personalised gifts, functional parts and innovative designs for every occasion.'}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center">
                  <button
                    onClick={() => onNavigate(settings?.heroPrimaryBtnLink || 'shop')}
                    className="px-6 py-3.5 bg-theme hover:bg-theme-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2.5 group"
                  >
                    {isEditMode ? (
                      <EditableText
                        value={settings?.heroPrimaryBtnText || 'Explore Products'}
                        onSave={async (val) => {
                          await updateSettingsInDb({ heroPrimaryBtnText: val });
                        }}
                        className="text-white font-bold"
                      />
                    ) : (
                      <span>{settings?.heroPrimaryBtnText || 'Explore Products'}</span>
                    )}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="inline-flex items-center">
                  <button
                    onClick={() => onNavigate(settings?.heroSecondaryBtnLink || 'custom')}
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-green-600" />
                    {isEditMode ? (
                      <EditableText
                        value={settings?.heroSecondaryBtnText || 'Custom CAD & Print'}
                        onSave={async (val) => {
                          await updateSettingsInDb({ heroSecondaryBtnText: val });
                        }}
                        className="text-slate-900 font-bold"
                      />
                    ) : (
                      <span>{settings?.heroSecondaryBtnText || 'Custom CAD & Print'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Service Capability Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>FDM Printing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>SLA Resin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>CAD 3D Modelling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Personalisation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic with In-Place EditableImage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-white p-3 shadow-xl border border-slate-200 overflow-hidden">
                <EditableImage
                  src={settings?.heroImage || ASSETS.heroPrinter}
                  alt="Maker Tank 3D Precision 3D Printer"
                  title="Replace Hero Banner Image"
                  buttonLabel="Change Hero Image"
                  onSave={async (newUrl) => {
                    await updateSettingsInDb({ heroImage: newUrl });
                  }}
                  className="w-full h-auto rounded-xl object-contain"
                  containerClassName="w-full h-full"
                />

                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {isEditMode ? (
                        <EditableText
                          value={settings?.heroImageTag || 'Bambu Lab CoreXY Studio'}
                          onSave={async (val) => {
                            await updateSettingsInDb({ heroImageTag: val });
                          }}
                          className="font-extrabold text-slate-900"
                        />
                      ) : (
                        <span>{settings?.heroImageTag || 'Bambu Lab CoreXY Studio'}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isEditMode ? (
                        <EditableText
                          value={settings?.heroImageSubtag || '0.08mm layer precision · Multi-color ready'}
                          onSave={async (val) => {
                            await updateSettingsInDb({ heroImageSubtag: val });
                          }}
                          className="text-slate-500"
                        />
                      ) : (
                        <span>{settings?.heroImageSubtag || '0.08mm layer precision · Multi-color ready'}</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SECTION */}
      {showCategories && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {isEditMode ? (
                  <EditableText
                    value={settings?.categoriesTitle || 'Shop by Category'}
                    as="h2"
                    className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight"
                    onSave={async (val) => {
                      await updateSettingsInDb({ categoriesTitle: val });
                    }}
                  />
                ) : (
                  <h2>{settings?.categoriesTitle || 'Shop by Category'}</h2>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? (
                  <EditableText
                    value={settings?.categoriesSubtitle || 'Explore our curated collection of ready-to-order 3D printed items.'}
                    as="p"
                    className="text-xs text-slate-500"
                    onSave={async (val) => {
                      await updateSettingsInDb({ categoriesSubtitle: val });
                    }}
                  />
                ) : (
                  <p>{settings?.categoriesSubtitle || 'Explore our curated collection of ready-to-order 3D printed items.'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  onClick={() => setActiveSectionModal('categories')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Configure Categories Section"
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span>Configure Section</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {primaryCategories.map(cat => (
              <div
                key={cat.id}
                className="group p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-green-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-between relative"
              >
                <div
                  onClick={() => {
                    if (!isEditMode) {
                      onSelectCategory(cat.id);
                      onNavigate('shop');
                    }
                  }}
                  className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center mb-2 cursor-pointer relative"
                >
                  {isEditMode ? (
                    <EditableImage
                      src={cat.imageUrl || ASSETS.spiralPlantPot}
                      alt={cat.name}
                      title={`Replace Image: ${cat.name}`}
                      buttonLabel="Change"
                      onSave={async (newUrl) => {
                        await updateCategoryInDb(cat.id, { imageUrl: newUrl });
                      }}
                      className="w-full h-full object-contain"
                      containerClassName="w-full h-full"
                    />
                  ) : cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Box className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">
                  {isEditMode ? (
                    <EditableText
                      value={cat.name}
                      onSave={async (newName) => {
                        await updateCategoryInDb(cat.id, { name: newName });
                      }}
                      className="text-[11px] font-bold text-slate-800"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        onSelectCategory(cat.id);
                        onNavigate('shop');
                      }}
                      className="hover:text-green-600 transition-colors"
                    >
                      {cat.name}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SHOP BY EVENT / OCCASION SECTION */}
      {showEvents && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {isEditMode ? (
                  <EditableText
                    value={settings?.eventsTitle || 'Shop by Event'}
                    as="h2"
                    className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight"
                    onSave={async (val) => {
                      await updateSettingsInDb({ eventsTitle: val });
                    }}
                  />
                ) : (
                  <h2>{settings?.eventsTitle || 'Shop by Event'}</h2>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? (
                  <EditableText
                    value={settings?.eventsSubtitle || 'Find the perfect return gifts and customised items for every special occasion.'}
                    as="p"
                    className="text-xs text-slate-500"
                    onSave={async (val) => {
                      await updateSettingsInDb({ eventsSubtitle: val });
                    }}
                  />
                ) : (
                  <p>{settings?.eventsSubtitle || 'Find the perfect return gifts and customised items for every special occasion.'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  onClick={() => setActiveSectionModal('events')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Configure Events Section"
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span>Configure Section</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <span>View All Events</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {eventPills.map(evt => (
              <button
                key={evt.id}
                onClick={() => {
                  onSelectEvent(evt.id);
                  onNavigate('events');
                }}
                className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-green-500 hover:shadow-sm transition-all text-center flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <span className="text-2xl" role="img" aria-label={evt.label}>
                  {evt.icon}
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {evt.label}
                </span>
                <span className="text-[10px] text-green-600 font-semibold">
                  Explore →
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. FROM CONCEPT TO FINISHED PRODUCT SECTION */}
      {showConcept && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white text-slate-950 rounded-2xl overflow-hidden border border-slate-200 p-8 sm:p-12 relative shadow-xs">
            {isEditMode && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setActiveSectionModal('concept')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors"
                >
                  <Settings className="w-3 h-3 text-green-600" />
                  <span>Section Settings</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-green-600">
                  {isEditMode ? (
                    <EditableText
                      value={settings?.conceptTag || 'Custom Engineering & Prototyping'}
                      onSave={async (val) => {
                        await updateSettingsInDb({ conceptTag: val });
                      }}
                      className="text-xs font-bold uppercase tracking-widest text-green-600"
                    />
                  ) : (
                    <span>{settings?.conceptTag || 'Custom Engineering & Prototyping'}</span>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {isEditMode ? (
                    <EditableText
                      value={settings?.conceptTitle || 'From a concept to a finished product.'}
                      as="h2"
                      className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950"
                      onSave={async (val) => {
                        await updateSettingsInDb({ conceptTitle: val });
                      }}
                    />
                  ) : (
                    <h2>{settings?.conceptTitle || 'From a concept to a finished product.'}</h2>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEditMode ? (
                    <EditableText
                      value={settings?.conceptDescription || 'We design and 3D print custom models, prototypes, replacement parts and personalised products using industrial FDM and SLA resin technology.'}
                      as="p"
                      multiline={true}
                      className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                      onSave={async (val) => {
                        await updateSettingsInDb({ conceptDescription: val });
                      }}
                    />
                  ) : (
                    <p>{settings?.conceptDescription || 'We design and 3D print custom models, prototypes, replacement parts and personalised products using industrial FDM and SLA resin technology.'}</p>
                  )}
                </div>

                <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Custom CAD design from sketches or ideas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Science, STEM &amp; educational models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Industrial replacement components &amp; enclosures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Bulk batch personalisations for events</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <button
                    onClick={() => onNavigate(settings?.conceptBtnLink || 'custom')}
                    className="px-5 py-3 bg-theme hover:bg-theme-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    {isEditMode ? (
                      <EditableText
                        value={settings?.conceptBtnText || 'Discuss Your Project'}
                        onSave={async (val) => {
                          await updateSettingsInDb({ conceptBtnText: val });
                        }}
                        className="text-white font-bold"
                      />
                    ) : (
                      <span>{settings?.conceptBtnText || 'Discuss Your Project'}</span>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-md p-2 relative">
                  <EditableImage
                    src={settings?.conceptImage || ASSETS.conceptCad}
                    alt="CAD on laptop to precision 3D printed mechanical gears"
                    title="Replace Concept Section Image"
                    buttonLabel="Change Concept Graphic"
                    onSave={async (newUrl) => {
                      await updateSettingsInDb({ conceptImage: newUrl });
                    }}
                    className="w-full h-auto object-contain rounded-lg"
                    containerClassName="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED PRODUCTS SECTION */}
      {showFeatured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {isEditMode ? (
                  <EditableText
                    value={settings?.featuredTitle || 'Featured Products'}
                    as="h2"
                    className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight"
                    onSave={async (val) => {
                      await updateSettingsInDb({ featuredTitle: val });
                    }}
                  />
                ) : (
                  <h2>{settings?.featuredTitle || 'Featured Products'}</h2>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? (
                  <EditableText
                    value={settings?.featuredSubtitle || 'Popular designs, ready to be customized and printed for you.'}
                    as="p"
                    className="text-xs text-slate-500"
                    onSave={async (val) => {
                      await updateSettingsInDb({ featuredSubtitle: val });
                    }}
                  />
                ) : (
                  <p>{settings?.featuredSubtitle || 'Popular designs, ready to be customized and printed for you.'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  onClick={() => setActiveSectionModal('featured')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Configure Featured Section"
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span>Configure Section</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. 3D MODELS (DIGITAL FILES) SECTION */}
      {showModels && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {isEditMode ? (
                  <EditableText
                    value={settings?.modelsTitle || '3D Models (Digital Files)'}
                    as="h2"
                    className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight"
                    onSave={async (val) => {
                      await updateSettingsInDb({ modelsTitle: val });
                    }}
                  />
                ) : (
                  <h2>{settings?.modelsTitle || '3D Models (Digital Files)'}</h2>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? (
                  <EditableText
                    value={settings?.modelsSubtitle || 'Download and 3D print curated STL and 3MF models on your own machine.'}
                    as="p"
                    className="text-xs text-slate-500"
                    onSave={async (val) => {
                      await updateSettingsInDb({ modelsSubtitle: val });
                    }}
                  />
                ) : (
                  <p>{settings?.modelsSubtitle || 'Download and 3D print curated STL and 3MF models on your own machine.'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  onClick={() => setActiveSectionModal('models')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Configure Models Section"
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span>Configure Section</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('models')}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <span>View All 3D Files</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {digitalModels.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. WHY CHOOSE MAKER TANK 3D SECTION */}
      {showWhyChoose && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-8 sm:p-10 relative">
            {isEditMode && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setActiveSectionModal('whyChoose')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Settings className="w-3.5 h-3.5 text-green-600" />
                  <span>Configure Section</span>
                </button>
              </div>
            )}

            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="text-xl font-extrabold text-slate-950">
                {isEditMode ? (
                  <EditableText
                    value={settings?.whyChooseTitle || 'Why Choose Maker Tank 3D?'}
                    as="h3"
                    className="text-xl font-extrabold text-slate-950"
                    onSave={async (val) => {
                      await updateSettingsInDb({ whyChooseTitle: val });
                    }}
                  />
                ) : (
                  <h3>{settings?.whyChooseTitle || 'Why Choose Maker Tank 3D?'}</h3>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {isEditMode ? (
                  <EditableText
                    value={settings?.whyChooseSubtitle || 'Engineered with precision hardware, premium filaments, and rapid delivery.'}
                    as="p"
                    className="text-xs text-slate-500"
                    onSave={async (val) => {
                      await updateSettingsInDb({ whyChooseSubtitle: val });
                    }}
                  />
                ) : (
                  <p>{settings?.whyChooseSubtitle || 'Engineered with precision hardware, premium filaments, and rapid delivery.'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <Printer className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">High Quality Prints</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Detailed 0.08mm to 0.2mm layer resolution for ultra smooth durable parts.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Custom Design Support</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bring your raw ideas or logos to life with experienced CAD modelers.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <Box className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Wide Range of Materials</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Print in PLA, PETG, ABS, ASA, TPU flexible, or ultra-fine SLA resin.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Reliable &amp; Fast Shipping</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Carefully packaged with tracking and zero hassle WhatsApp order updates.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Section Settings Modals for Homepage Sections --- */}
      {activeSectionModal === 'hero' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Hero Banner Section"
          fields={[
            { key: 'heroBadge', label: 'Badge Text' },
            { key: 'heroHeadline', label: 'Main Headline' },
            { key: 'heroSubheadline', label: 'Subheadline', type: 'textarea' },
            { key: 'heroPrimaryBtnText', label: 'Primary Button Label' },
            { key: 'heroPrimaryBtnLink', label: 'Primary Button Destination View' },
            { key: 'heroSecondaryBtnText', label: 'Secondary Button Label' },
            { key: 'heroSecondaryBtnLink', label: 'Secondary Button Destination View' },
            { key: 'heroImage', label: 'Hero Image', type: 'image' },
            { key: 'heroImageTag', label: 'Hero Machine Tag' },
            { key: 'heroImageSubtag', label: 'Hero Machine Spec' },
          ]}
        />
      )}

      {activeSectionModal === 'categories' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Shop by Category Section"
          visibilityKey="showCategoriesSection"
          fields={[
            { key: 'categoriesTitle', label: 'Section Title' },
            { key: 'categoriesSubtitle', label: 'Section Subtitle' },
          ]}
        />
      )}

      {activeSectionModal === 'events' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Shop by Event Section"
          visibilityKey="showEventsSection"
          fields={[
            { key: 'eventsTitle', label: 'Section Title' },
            { key: 'eventsSubtitle', label: 'Section Subtitle' },
          ]}
        />
      )}

      {activeSectionModal === 'concept' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Concept to Finished Product Section"
          visibilityKey="showConceptSection"
          fields={[
            { key: 'conceptTag', label: 'Category Tag' },
            { key: 'conceptTitle', label: 'Section Title' },
            { key: 'conceptDescription', label: 'Section Description', type: 'textarea' },
            { key: 'conceptBtnText', label: 'Button Label' },
            { key: 'conceptBtnLink', label: 'Button Destination View' },
            { key: 'conceptImage', label: 'Concept Showcase Image', type: 'image' },
          ]}
        />
      )}

      {activeSectionModal === 'featured' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Featured Products Section"
          visibilityKey="showFeaturedSection"
          fields={[
            { key: 'featuredTitle', label: 'Section Title' },
            { key: 'featuredSubtitle', label: 'Section Subtitle' },
          ]}
        />
      )}

      {activeSectionModal === 'models' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="3D Models Section"
          visibilityKey="showModelsSection"
          fields={[
            { key: 'modelsTitle', label: 'Section Title' },
            { key: 'modelsSubtitle', label: 'Section Subtitle' },
          ]}
        />
      )}

      {activeSectionModal === 'whyChoose' && (
        <SectionEditorModal
          isOpen={true}
          onClose={() => setActiveSectionModal(null)}
          sectionName="Why Choose Us Section"
          visibilityKey="showWhyChooseSection"
          fields={[
            { key: 'whyChooseTitle', label: 'Section Title' },
            { key: 'whyChooseSubtitle', label: 'Section Subtitle' },
          ]}
        />
      )}
    </div>
  );
};
