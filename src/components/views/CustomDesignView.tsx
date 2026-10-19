import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useStore } from '../../context/StoreContext.tsx';

export const CustomDesignView: React.FC = () => {
  const { settings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [technology, setTechnology] = useState<'FDM' | 'SLA' | 'CAD Design' | 'Unsure'>('FDM');
  const [materialPreference, setMaterialPreference] = useState('Standard Tough PLA');

  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; originalName: string; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const file = e.target.files[0];
      const res = await api.uploadFile(file);
      setUploadedFiles(prev => [
        ...prev,
        { url: res.url, originalName: res.originalName || file.name, size: file.size },
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !projectDetails) {
      setErrorMessage('Please fill in your name, phone number, and project details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitCustomEnquiry({
        customerName,
        customerEmail,
        customerPhone,
        projectDetails,
        technology,
        materialPreference,
        fileUrls: uploadedFiles.map(f => f.url),
      });

      setSubmitSuccess(res.enquiry.id);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setProjectDetails('');
      setUploadedFiles([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-900 border border-green-200/80 text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BESPOKE 3D PRINTING &amp; CAD</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Request a Custom Design
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Upload your logo, rough sketch, 3D file, or broken part photo, and our engineers will model and print it with industrial precision.
        </p>
      </div>

      {submitSuccess ? (
        <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4 animate-in fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950">
            Quote Request Received! (Ref: #{submitSuccess})
          </h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
            Our 3D design team will review your specifications and files. We will contact you via WhatsApp / email within 24 hours with a feasibility check and pricing quote.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSubmitSuccess(null)}
              className="px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Submit Another Request
            </button>

            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Maker Tank 3D, I just submitted custom quote enquiry #${submitSuccess}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. File Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Upload Reference File / Logo / 3D Model:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-green-500 rounded-xl p-6 sm:p-8 text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.stl,.3mf,.obj,.step,.stp"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Click to upload or drag and drop
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supported: PNG, JPG, PDF (drawings &amp; logos) or STL, STEP, 3MF (3D CAD files up to 25MB)
              </div>
              {isUploading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading file...</span>
                </div>
              )}
            </div>

            {/* Uploaded File Chips */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{f.originalName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Project Details */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Project Details &amp; Specifications *:
            </label>
            <textarea
              value={projectDetails}
              onChange={e => setProjectDetails(e.target.value)}
              placeholder="Tell us about your project (e.g. logo keychain, replacement gear, scale dimensions, quantity required, indoor vs outdoor use)..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 3. Tech & Material Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Technology Preference:
              </label>
              <select
                value={technology}
                onChange={e => setTechnology(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="FDM">FDM Printing (Tough, Durable, Functional &amp; Decorative)</option>
                <option value="SLA">SLA Resin (Ultra-smooth surface, Miniatures, Jewelry)</option>
                <option value="CAD Design">CAD Modeling Only (Need STL/STEP file designed)</option>
                <option value="Unsure">Unsure (Recommend best for my budget)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Material Preference:
              </label>
              <select
                value={materialPreference}
                onChange={e => setMaterialPreference(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="Standard Tough PLA">Standard Tough PLA (Eco-friendly, High Detail)</option>
                <option value="PETG / ABS">PETG / ABS (High Temperature &amp; Outdoor UV Resistance)</option>
                <option value="SLA Precision Resin">SLA Precision Resin (Ultra Fine 0.05mm Layer)</option>
                <option value="TPU Flexible">TPU Flexible (Rubber-like Shore 95A)</option>
                <option value="Dual-Color Silk">Dual-Color Silk PLA (Shiny Luxury Finish)</option>
              </select>
            </div>
          </div>

          {/* 4. Customer Contact Details */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Your Contact Information:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Your Full Name *"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="WhatsApp Phone Number *"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Your Project Details...</span>
              </>
            ) : (
              <span>Submit Request for Free Quote</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
