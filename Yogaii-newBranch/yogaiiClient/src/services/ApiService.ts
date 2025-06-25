import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5171/api'; // Adjust port as needed

// Axios interceptor to add authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yogaii_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface YogaPose {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  confidence?: number;
}

export interface YogaPosePrediction {
  predictedPose: YogaPose;
  confidence: number;
  timestamp: string;
  allPredictions: Record<string, number>;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
  success: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  passwordHash: string;
}

export interface LoginRequest {
  username: string;
  passwordHash: string;
}

export interface ApiError {
  message: string;
  success?: boolean;
}

class ApiService {
  async getAllPoses(): Promise<YogaPose[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/YogaPose`);
      return response.data;
    } catch (error) {
      console.error('Error fetching poses:', error);
      throw error;
    }
  }

  async getPoseByName(name: string): Promise<YogaPose> {
    try {
      const response = await axios.get(`${API_BASE_URL}/YogaPose/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pose ${name}:`, error);
      throw error;
    }
  }

  async predictPose(imageBase64: string): Promise<YogaPosePrediction> {
    try {
      const response = await axios.post(`${API_BASE_URL}/YogaPose/predict`, {
        imageBase64
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting pose:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔄 Login isteği gönderiliyor...');
      console.log('📤 Request URL:', `${API_BASE_URL}/authentication/login`);
      
      // Backend LoginRequest DTO'su bekliyor
      const loginData = {
        username: username,
        passwordHash: password
      };
      
      console.log('📤 Request Body:', loginData);
      
      const response = await axios.post(`${API_BASE_URL}/authentication/login`, loginData);
      
      console.log('✅ Login başarılı!');
      console.log('📥 Response:', response.data);
      
      // Token'ı localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem('yogaii_token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login hatası detayları:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
      console.error('Request Config:', error.config);
      
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message || 'Giriş başarısız';
      throw new Error(errorMessage);
    }
  }

  async register(username: string, email: string, password: string): Promise<{message: string, success: boolean}> {
    try {
      console.log('🔄 Register isteği gönderiliyor...');
      console.log('📤 Request URL:', `${API_BASE_URL}/authentication/register`);
      
      // Backend RegisterRequest DTO'su bekliyor
      const registerData = {
        username: username,
        email: email,
        passwordHash: password
      };
      
      console.log('📤 Request Body:', registerData);
      
      const response = await axios.post(`${API_BASE_URL}/authentication/register`, registerData);
      
      console.log('✅ Register başarılı!');
      console.log('📥 Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Register hatası detayları:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
      
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.message || 'Kayıt başarısız';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('yogaii_token');
      if (!token) return null;

      // JWT token'dan user bilgisini çıkarmak için decode edeceğiz
      // Şimdilik localStorage'dan user'ı alıyoruz
      const userStr = localStorage.getItem('yogaii_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('yogaii_token');
    localStorage.removeItem('yogaii_user');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('yogaii_token');
    return !!token;
  }
}

export default new ApiService();