import { useContext } from 'react';
import { ToastContext } from './ToastContext';

/** const toast = useToast();  toast.success('Added to cart');  toast.error('Only 3 in stock'); */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return toast;
}
