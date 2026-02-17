import { toast as sonnerToast } from 'sonner';
import type { ApiError } from '@/types';

const TOAST_DURATION_ERROR = 5000;
const TOAST_DURATION_DEFAULT = 3000;

/**
 * Show a toast notification using sonner
 */
export function toast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  options?: { duration?: number }
) {
  const duration = options?.duration || (type === 'error' ? TOAST_DURATION_ERROR : TOAST_DURATION_DEFAULT);

  switch (type) {
    case 'success':
      sonnerToast.success(message, { duration });
      break;
    case 'error':
      sonnerToast.error(message, { duration });
      break;
    case 'warning':
      sonnerToast.warning(message, { duration });
      break;
    case 'info':
    default:
      sonnerToast.info(message, { duration });
      break;
  }
}

/**
 * Show a confirmation dialog
 */
export async function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    
    const handleResolve = (value: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(value);
      }
    };
    
    sonnerToast(message, {
      duration: Infinity,
      action: {
        label: 'Confirm',
        onClick: () => handleResolve(true),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => handleResolve(false),
      },
      onDismiss: () => handleResolve(false),
      onAutoClose: () => handleResolve(false),
    });
  });
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: ApiError, customMessage?: string) {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.error;
  
  let message = customMessage || 'An error occurred';
  
  if (serverMessage) {
    message = serverMessage;
  } else if (status) {
    switch (status) {
      case 400:
        message = 'Invalid request';
        break;
      case 401:
        message = 'Unauthorized - please log in';
        break;
      case 403:
        message = 'Access forbidden';
        break;
      case 404:
        message = 'Resource not found';
        break;
      case 409:
        message = 'Conflict - resource already exists';
        break;
      case 422:
        message = 'Validation error';
        break;
      case 429:
        message = 'Too many requests - please slow down';
        break;
      case 500:
        message = 'Server error - please try again';
        break;
      case 503:
        message = 'Service unavailable';
        break;
      default:
        message = `Error: ${status}`;
    }
  } else if (error.message) {
    message = error.message.includes('Network')
      ? 'Network error - check your connection'
      : error.message;
  }
  
  toast(message, 'error');
}
