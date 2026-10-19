import React from 'react';
import { Printer, Sparkles, Cpu, Award, ArrowRight } from 'lucide-react';
import { ASSETS } from '../../utils/assets.ts';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-900 border border-green-200/80 text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ABOUT MAKER TANK 3D</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Engineering Ideas Into Tangible Reality
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Maker Tank 3D is a modern digital fabrication and additive manufacturing studio. We bridge the gap between digital CAD concepts and functional, beautiful physical objects.
        </p>
      </div>

      {/* Workshop & Technology Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/70 rounded-2xl border border-slate-200 p-6 sm:p-10">
        <div className="space-y-4">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
            Industrial Equipment
          </span>
          <h2 className="text-2xl font-extrabold text-slate-950">
            High-Speed CoreXY &amp; SLA Precision
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our workshop is powered by high-speed CoreXY 3D printers and 8K SLA resin machines capable of ultra-tight tolerances (±0.1mm) and layer heights down to 0.05mm.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-semibold">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Multi-color extrusion for crisp logo badges and keychains</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Enclosed heated chambers for warping-free ABS &amp; PETG engineering components</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Calibrated dimensional accuracy for interlocking mechanical assemblies</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2 shadow-md">
          <img
            src={ASSETS.heroPrinter}
            alt="Maker Tank 3D Bambu Lab Studio Equipment"
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Fast Turnaround</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rapid prototyping and small batch runs dispatched within 24 to 48 hours with door-to-door delivery across India.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Real Engineering</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Not just decorative trinkets: functional gears, snap-fit enclosures, and durable brackets tested under load.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Transparent Pricing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatic bulk tier discounts and zero hidden checkout fees. Straightforward WhatsApp order confirmation.
          </p>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-white text-slate-950 rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-xs">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Have an idea or custom component to print?
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Send us your file or brief today and get a tailored feasibility analysis within hours.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('custom')}
            className="px-5 py-2.5 bg-theme hover:bg-theme-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <span>Request Custom CAD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
