import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const icons = {
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  error: <AlertCircle className="w-6 h-6 text-red-500" />,
};

const Toast = ({ message, type = 'success', onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`neo-card flex items-center p-4 space-x-4 max-w-md w-full z-[100] ${type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}
      role="alert"
    >
      {icons[type]}
      <p className={`font-bold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
      <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 inline-flex h-8 w-8">
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default Toast;