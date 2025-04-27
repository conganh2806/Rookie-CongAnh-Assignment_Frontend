import { toast } from 'react-toastify';

export const handleAxiosError = (error, navigate) => {
  console.error(error);

  if (!error.response) {
    toast.error("Network error. Please check your internet connection.");
    return;
  }

  const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";

  if (error.response.status === 401) {
    toast.error(errorMessage);
    if (navigate) {
      navigate('/login');
    }
    return;
  }

  if (error.response.status === 403) {
    toast.error(errorMessage);
    return;
  }

  if (error.response.status === 404) {
    toast.error(errorMessage);
    return;
  }

  if (error.response.status >= 500) {
    toast.error("Server error. Please try again later.");
    return;
  }
  toast.error(errorMessage);
};
