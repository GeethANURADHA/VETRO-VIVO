import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { inquiriesApi } from '../services/api';

export default function Contact() {
  const waContactUrl = `https://wa.me/94712316378?text=Hello, I have an inquiry about a gemstone.`;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await inquiriesApi.create({
        user_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        message: `Subject: ${formData.subject || 'N/A'}\n\n${formData.message}`,
        gem_id: null
      });
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">Contact Us</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Have a question about a specific gemstone, need a custom sourcing request, or want to visit our showroom? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Information */}
        <div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 h-full">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">Get in Touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-sapphire-50 dark:bg-sapphire-900/30 p-3 rounded-full text-sapphire-600 dark:text-gold-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">Sri Lanka Office</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ratnapura,<br />
                    Sri Lanka,<br />
                    70000
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">+94 71 231 6378</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-sapphire-50 dark:bg-sapphire-900/30 p-3 rounded-full text-sapphire-600 dark:text-gold-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">Italy Office</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Naples,<br />
                    Italy,<br />
                    80137
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">+39 393 686 4440</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-sapphire-50 dark:bg-sapphire-900/30 p-3 rounded-full text-sapphire-600 dark:text-gold-500">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">WhatsApp</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">+39 393 686 4440</p>
                  <a 
                    href={waContactUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-sapphire-50 dark:bg-sapphire-900/30 p-3 rounded-full text-sapphire-600 dark:text-gold-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">vetrovivogems@gmail.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">Business Hours</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex justify-between"><span>Monday - Friday</span> <span>9:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 4:00 PM</span></li>
                <li className="flex justify-between text-sapphire-600 dark:text-gold-500 font-medium"><span>Sunday</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8">Send us a Message</h2>
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <span>Thank you! Your message has been received. We will get back to you shortly.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
              <input 
                type="text" 
                id="subject" 
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white"
                placeholder="Inquiry about a gemstone"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message *</label>
              <textarea 
                id="message" 
                rows="5" 
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 text-slate-900 dark:text-white resize-none"
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-sapphire-600 hover:bg-sapphire-700 dark:bg-gold-600 dark:hover:bg-gold-500 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
