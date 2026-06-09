import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { sendNewcomerFormEmails, type NewcomerFormData } from '../services/emailService';

const NewcomerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    availableToServe: '',
    note: '',
    purposes: {
      newcomer: false,
      activityInterest: false,
      willingToServe: false,
      other: false,
    },
    activityDetails: {
      activityName: '',
      activityDate: '',
    },
    otherPurpose: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaValue) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await sendNewcomerFormEmails(formData as NewcomerFormData);
      setIsSubmitted(true);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        availableToServe: '',
        note: '',
        purposes: {
          newcomer: false,
          activityInterest: false,
          willingToServe: false,
          other: false,
        },
        activityDetails: { activityName: '', activityDate: '' },
        otherPurpose: '',
      });
      setRecaptchaValue(null);
      setSubmitError(null);
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('purposes.')) {
      const purposeKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        purposes: {
          ...prev.purposes,
          [purposeKey]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else if (name.startsWith('activityDetails.')) {
      const detailKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        activityDetails: { ...prev.activityDetails, [detailKey]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  if (isSubmitted) {
    return (
      <>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPopup(false)} />
            <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-stone-700 mb-3">Thank you for submitting the form.</h2>
              <p className="text-stone-500 leading-relaxed">
                We're glad to hear from you and look forward to connecting with you.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <section id="newcomer-form" className="py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks for reaching out!</h2>
              <p className="text-gray-500">We'll be in touch soon to welcome you to our community.</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <section id="newcomer-form" className="py-8">
      <div>
        <div>
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-700 leading-snug mb-3">
              We are glad you're here
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We're looking forward to connect with you in your faith journey!
            </p>
          </div>

          {/* Form */}
          <div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(xxx) xxx-xxxx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="availableToServe" className="block text-sm font-medium text-gray-700 mb-1.5">
                  How would you like to serve? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="availableToServe"
                  name="availableToServe"
                  value={formData.availableToServe}
                  onChange={handleChange}
                  placeholder="e.g. music, hospitality, youth"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">What brings you here?</p>
              <div className="space-y-2.5">
                {[
                  { key: 'newcomer', label: "I'm new and want to learn more about the community" },
                  { key: 'willingToServe', label: "I'd like to help out and serve" },
                  { key: 'activityInterest', label: "I'm interested in a specific event or activity" },
                  { key: 'other', label: 'Something else' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={`purposes.${key}`}
                      checked={formData.purposes[key as keyof typeof formData.purposes]}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Activity details */}
              {formData.purposes.activityInterest && (
                <div className="mt-3 ml-7 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Event or activity name</label>
                    <input
                      type="text"
                      name="activityDetails.activityName"
                      value={formData.activityDetails.activityName}
                      onChange={handleChange}
                      placeholder="e.g. Friday Fellowship"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date (if known)</label>
                    <input
                      type="text"
                      name="activityDetails.activityDate"
                      value={formData.activityDetails.activityDate}
                      onChange={handleChange}
                      placeholder="e.g. April 11, 2026"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Other reason */}
              {formData.purposes.other && (
                <div className="mt-3 ml-7">
                  <textarea
                    name="otherPurpose"
                    value={formData.otherPurpose}
                    onChange={handleChange}
                    placeholder="Tell us a little more about why you're reaching out..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">
                Anything else you'd like us to know? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={formData.note}
                onChange={handleChange}
                placeholder="Feel free to share anything — questions, background, how you heard about us..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6Ld2k4YrAAAAAJzKAMRU7GEZLVIECGowsGBFFr3i"
                onChange={(v) => setRecaptchaValue(v)}
                theme="light"
              />
            </div>

            {/* Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 text-center">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!recaptchaValue || isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-sm transition-colors duration-200"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewcomerForm;
