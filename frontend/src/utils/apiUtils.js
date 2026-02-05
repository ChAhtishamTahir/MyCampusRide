// Simple function to handle 401 errors (unauthorized)
export const handleUnauthorized = () => {
  localStorage.removeItem('user');
  // Redirect to login page
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