import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Check, Copy, Github, Linkedin, Mail, Send, X } from 'lucide-react';
import { RootState } from '@/store/store';
import { AnimationLevel, getAnimationLevel } from '@/lib/types';
import contact from '@/data/contact.json';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose }) => {
  const { animationLevel, soundEnabled } = useSelector((state: RootState) => state.mode);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form after showing success message
      setTimeout(() => {
        setIsSubmitted(false);
        setFormState({
          name: '',
          email: '',
          message: ''
        });
        onClose();
      }, 3000);
    }, 1500);
  }, [onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const dialogVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: animationLevel === AnimationLevel.High ? 'spring' : 'tween',
        stiffness: 300,
        damping: 20,
        duration: getAnimationLevel(animationLevel, { min: 0.2, max: 0.6 })
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { 
        duration: getAnimationLevel(animationLevel, { min: 0.1, max: 0.3 })
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Get In Touch</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>            
            <div className="p-5">
              {isSubmitted ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Thanks for reaching out. I'll get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formState.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>                    
                    <button
                      type="submit"
                      // disabled={isSubmitting}
                      disabled={true}
                      className={`w-full py-2.5 px-4 flex items-center justify-center rounded-md text-white bg-palette-teal hover:bg-palette-teal-light transition-colors duration-300 
                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? 'Sending...' : 'Send Message (Work In Progress)'}
                    </button>
                  </form>
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or reach out directly:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard('contact@example.com', 'email')}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {copied === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>                      
                      <div className="flex items-center space-x-3">
                        <a 
                          href={contact.github} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a 
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactDialog;