// utils/axios.ts
import axios from 'axios'
import LocalStorageService from './localStorageService.ts'
import { API_BASE_URL } from '../constants/config.js';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const localStorageService = LocalStorageService.getService()

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorageService.getAccessToken()

    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({ message: "Network error" });
    }

    if (
      error.response.status === 401 &&
      originalRequest.url.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorageService.getRefreshToken();
        const res = await axios.post(
          'http://localhost:5017/api/auth/refresh-token',
          { token: refreshToken },
          { withCredentials: true }
        );

        if (res.status === 201) {
          localStorageService.setToken(res.data);
          originalRequest.headers['Authorization'] = 'Bearer ' + localStorageService.getAccessToken();
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance
