import api from './api';
import {
  ApiResponse,
  User,
  Resume,
  AnalysisResult,
  JobMatchResult,
  PaymentStatus,
  LoginCredentials,
  RegisterCredentials,
  PaginationInfo,
} from '../types';

// Auth API
export const authApi = {
  register: async (data: RegisterCredentials) => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  login: async (data: LoginCredentials) => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      data
    );
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post<ApiResponse>('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post<ApiResponse>('/auth/reset-password', { token, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },
};

// Resume API
export const resumeApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post<ApiResponse<{ resumeId: string; fileName: string; sections: unknown }>>(
      '/resume/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  analyze: async (resumeId: string) => {
    const response = await api.post<ApiResponse<{ resumeId: string; atsScore: number; analysis: AnalysisResult }>>(
      `/resume/analyze/${resumeId}`
    );
    return response.data;
  },

  matchJob: async (resumeId: string, jobDescription: string) => {
    const response = await api.post<ApiResponse<{ resumeId: string; currentAtsScore: number; matchResult: JobMatchResult }>>(
      '/resume/match-job',
      { resumeId, jobDescription }
    );
    return response.data;
  },

  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<{ resumes: Resume[]; pagination: PaginationInfo }>>(
      `/resume/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<ApiResponse<{ resume: Resume }>>(`/resume/${id}`);
    return response.data;
  },

  getResume: async (id: string) => {
    const response = await api.get<ApiResponse<{ resume: Resume }>>(`/resume/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/resume/${id}`);
    return response.data;
  },

  deleteResume: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/resume/${id}`);
    return response.data;
  },

  sendReport: async (resumeId: string) => {
    const response = await api.post<ApiResponse>('/resume/send-report', { resumeId });
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  getStatus: async () => {
    const response = await api.get<ApiResponse<PaymentStatus>>('/payment/status');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get<ApiResponse<{ payments: PaymentStatus['payments'] }>>('/payment/history');
    return response.data;
  },
};
