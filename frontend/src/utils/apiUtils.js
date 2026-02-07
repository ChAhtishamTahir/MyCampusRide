import { toast } from 'react-toastify';

export const handleUnauthorized = () => {
  toast.warning("Your session has expired for security. Please log in again.", { autoClose: 4000 });
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Simple function to make API requests with error handling
export const makeApiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error; // Re-throw the error so the calling function can handle it
  }
};