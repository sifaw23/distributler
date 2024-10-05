import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const variants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-100 border-green-400 text-green-700',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-100 border-red-400 text-red-700',
  },
  info: {
    icon: Info,
    className: 'bg-blue-100 border-blue-400 text-blue-700',
  },
};

export function Toast({ variant = 'info', title, description, duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const { icon: Icon, className } = variants[variant] || variants.info;

  return (
    <div className={`fixed bottom-4 right-4 w-full max-w-sm overflow-hidden rounded-lg border shadow-lg ${className}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm">{description}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                setIsVisible(false);
                onClose && onClose();
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (props) => {
    setToast(props);
  };

  const ToastComponent = toast ? (
    <Toast
      {...toast}
      onClose={() => setToast(null)}
    />
  ) : null;

  return [showToast, ToastComponent];
}