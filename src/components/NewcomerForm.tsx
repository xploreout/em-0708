import React, { useState } from 'react';
import { Send, CheckCircle, Heart } from 'lucide-react';
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
      other: false
    },
    activityDetails: {
      activityName: '',
      activityDate: ''
    },
    otherPurpose: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
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
      // Send emails using EmailJS
      await sendNewcomerFormEmails(formData as NewcomerFormData);
      
      console.log('Form submitted successfully:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting the form.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    
    // Reset form after 5 seconds
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
          other: false
        },
        activityDetails: {
          activityName: '',
          activityDate: ''
        },
        otherPurpose: '',
        activitySpecifyInNotes: false,
        otherSpecifyInNotes: false
      });
      setRecaptchaValue(null);
      setSubmitError(null);
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('purposes.')) {
      const purposeKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        purposes: {
          ...prev.purposes,
          [purposeKey]: (e.target as HTMLInputElement).checked
        }
      }));
    } else if (name.startsWith('activityDetails.')) {
      const detailKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        activityDetails: {
          ...prev.activityDetails,
          [detailKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  if (isSubmitted) {
    return (
      <section id="newcomer-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Thank you for connecting!</h2>
            <p className="text-green-700">We'll be in touch soon to welcome you to our community.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="newcomer-form" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <Heart className="h-4 w-4" />
            <span>Join Our Family</span>
          </div> */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600  to-green-600 bg-clip-text text-transparent">
              Let's Stay Connected
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            We'd love to learn more about you and to welcome you to our amazing adult community! 🌟
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="availableToServe" className="block text-sm font-medium text-gray-700 mb-2">
                  Available to Serve
                </label>
                <input
                  type="text"
                  id="availableToServe"
                  name="availableToServe"
                  value={formData.availableToServe}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  placeholder="How would you like to serve?"
                />
              </div>
            </div>

            {/* Purpose Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-purple-500" />
                What brings you here today?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="newcomer"
                    name="purposes.newcomer"
                    checked={formData.purposes.newcomer}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newcomer" className="block text-sm text-gray-700 font-medium">
                    I'm a newcomer and would like to learn more about the community 🆕
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="willingToServe"
                      name="purposes.willingToServe"
                      checked={formData.purposes.willingToServe}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="willingToServe" className="block text-sm text-gray-700 font-medium">
                      I am willing to help out and serve 🙌
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="activityInterest"
                      name="purposes.activityInterest"
                      checked={formData.purposes.activityInterest}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activityInterest" className="block text-sm text-gray-700 font-medium">
                      I'm interested in a specific activity or event 🎯
                    </label>
                  </div>
                  
                  {formData.purposes.activityInterest && (
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity/Event Name
                        </label>
                        <input
                          type="text"
                          name="activityDetails.activityName"
                          value={formData.activityDetails.activityName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., Fellowship Gathering, Bible Study"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date (if known)
                        </label>
                        <input
                          type="text"
                          name="activityDetails.activityDate"
                          value={formData.activityDetails.activityDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., March 15, 2024"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="other"
                      name="purposes.other"
                      checked={formData.purposes.other}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="other" className="block text-sm text-gray-700 font-medium">
                      Other reason 💭
                    </label>
                  </div>
                  
                  {formData.purposes.other && (
                    <div className="ml-8">
                      <textarea
                        name="otherPurpose"
                        value={formData.otherPurpose}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        placeholder="Please specify your reason for reaching out..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                value={formData.note}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                placeholder="Share anything you'd like us to know about you..."
              ></textarea>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6Ld2k4YrAAAAAJzKAMRU7GEZLVIECGowsGBFFr3i" 
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={!recaptchaValue || isSubmitting}
                className="bg-gradient-to-r from-blue-500  to-green-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Sending...' : "Let's Connect! 🚀"}</span>
              </button>
            </div>
            
            {/* Error Message */}
            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">{submitError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewcomerForm;