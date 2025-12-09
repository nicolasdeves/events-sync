import axios from 'axios';
import { getToken, refreshToken, logout } from './authentication.service';

const AUTHENTICATION_PORT=3000
const URL = (import.meta as any).env.URL || 'localhost'


axios.defaults.withCredentials = true;

export const authApi = axios.create({
  baseURL: `${URL}:${AUTHENTICATION_PORT}`,
});

authApi.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/login') || config.url?.includes('/refresh')) {
      return config;
    }
    
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return authApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        
        if (newToken) {
          processQueue(null, newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          isRefreshing = false;
          return authApi(originalRequest);
        } else {
          processQueue(new Error('Não foi possível renovar o token'), null);
          isRefreshing = false;
          
          // Fazer logout completo quando o refresh token falhar
          logout();
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Fazer logout completo quando o refresh token falhar
        logout();
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);