import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token to headers
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token
          Cookies.remove('auth_token');
          
          // Only redirect if not already on login/register pages
          // This prevents redirect loop and allows login errors to display
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';
            
            if (!isAuthPage) {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  setAuthToken(token: string) {
    Cookies.set('auth_token', token, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  removeAuthToken() {
    Cookies.remove('auth_token');
  }

  getAuthToken(): string | undefined {
    return Cookies.get('auth_token');
  }
}

export const apiClient = new ApiClient();
export default apiClient.instance;

