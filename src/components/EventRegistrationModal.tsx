import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Clock, Users, Send, CheckCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { sendEventRegistrationEmails, type EventRegistrationData } from '../services/emailService';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: Event | null;
  allEvents: Event[];
  onRegister: (eventIds: number[], contactInfo: any) => void;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  allEvents,
  onRegister
}) => {
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });
  
  const [selectedEvents, setSelectedEvents] = useState<number[]>(
    selectedEvent ? [selectedEvent.id] : []
  );
  
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
      // Prepare event registration data
      const selectedEventDetails = allEvents.filter(event => selectedEvents.includes(event.id));
      const registrationData: EventRegistrationData = {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        note: contactInfo.note,
        selectedEvents: selectedEventDetails
      };
      
      // Send emails using EmailJS
      await sendEventRegistrationEmails(registrationData);
      
      // Call the registration handler to update UI
      onRegister(selectedEvents, contactInfo);
      
      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting your registration.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactInfo({ name: '', email: '', phone: '', note: '' });
      setSelectedEvents([]);
      setRecaptchaValue(null);
      onClose();
    }, 5000);
  };

  const handleEventToggle = (eventId: number) => {
    // Prevent event propagation to avoid double-clicking
    event?.stopPropagation();
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your interest! We've sent confirmation emails to both you and our team.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive more details about the selected events soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Event Registration 🎊</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-orange-100 mt-2">
            Join our activities!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-orange-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={contactInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="note"
                  value={contactInfo.note}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any questions or special requests?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-pink-500" />
              Select Events to Join
            </h3>
            <div className="space-y-3">
              {allEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    selectedEvents.includes(event.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <label className="flex items-start space-x-3 cursor-pointer w-full">
                      <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                        className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information Display */}
          {/* <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-orange-500" />
              Need Help? Contact Us
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span>info@acbcc.org</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                <span>123 Faith Avenue, Community City, ST 12345</span>
              </div>
            </div>
          </div> */}

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6Ld2k4YrAAAAAJzKAMRU7GEZLVIECGowsGBFFr3i" 
              onChange={handleRecaptchaChange}
              theme="light"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedEvents.length === 0 || !contactInfo.name || !contactInfo.email || !recaptchaValue || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>{isSubmitting ? 'Sending...' : 'Register Now! 🚀'}</span>
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
  );
};

export default EventRegistrationModal;