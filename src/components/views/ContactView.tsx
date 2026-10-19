import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Instagram, Youtube, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { EditableText } from '../inline-editor/EditableText.tsx';

export const ContactView: React.FC = () => {
  const { settings, updateSettingsInDb } = useStore();
  const { isEditMode } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitContact({
        name,
        email,
        phone,
        subject,
        message,
      });

      setSuccessMsg(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Contact Us
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              We&apos;d love to hear from you. Have a question, custom 3D printing project, or bulk order enquiry? Reach out to our engineering workshop directly.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <Mail className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Email Address</div>
                {isEditMode ? (
                  <EditableText
                    value={settings?.contactEmail || 'hello@makertank3d.com'}
                    onSave={async (val) => {
                      await updateSettingsInDb({ contactEmail: val });
                    }}
                    className="text-xs text-slate-700"
                  />
                ) : (
                  <div className="text-xs text-slate-600">{settings?.contactEmail || 'hello@makertank3d.com'}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <Phone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Phone &amp; WhatsApp</div>
                {isEditMode ? (
                  <EditableText
                    value={settings?.phoneNumber || '+91 98765 43210'}
                    onSave={async (val) => {
                      await updateSettingsInDb({ phoneNumber: val });
                    }}
                    className="text-xs text-slate-700"
                  />
                ) : (
                  <div className="text-xs text-slate-600">{settings?.phoneNumber || '+91 98765 43210'}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Workshop Location</div>
                {isEditMode ? (
                  <EditableText
                    value={settings?.address || 'Innovation Tech Hub, Industrial Layout, Bangalore, India'}
                    multiline={true}
                    onSave={async (val) => {
                      await updateSettingsInDb({ address: val });
                    }}
                    className="text-xs text-slate-700 leading-relaxed"
                  />
                ) : (
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {settings?.address || 'Innovation Tech Hub, Industrial Layout, Bangalore, India'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Socials & WhatsApp direct */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-900 mb-2">Instant Chat:</div>
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <h2 className="text-base font-extrabold text-slate-950">
              Send Us a Message
            </h2>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Bulk order question / Custom CAD"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Message *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message or inquiry here..."
                rows={4}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-theme hover:bg-theme-hover text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
