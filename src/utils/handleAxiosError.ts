import { toast } from 'react-toastify';

export const handleAxiosError = (error, navigate) => {
  if (!error.response) {
    toast.error("Network error. Please check your internet connection.");
    return;
  }

  if (error.response.status === 401) {
    toast.error("Session expired. Please log in again.");
    if (navigate) {
      navigate('/login');
    }
    return;
  }

  if (error.response.status === 403) {
    toast.error("Permission denied. You do not have access.");
    return;
  }

  if (error.response.status === 404) {
    toast.error("Resource not found. Please check your request.");
    return;
  }

  if (error.response.status >= 500) {
    toast.error("Server error. Please try again later.");
    return;
  }

  toast.error("Something went wrong. Please try again.");
};
