import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginForm, 
  RegisterOrganizationForm,
  User,
  Organization,
  Sample,
  CuppingSession,
  CuppingTemplate,
  Score,
  CreateSampleForm,
  CreateSessionForm
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add tenant header interceptor
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        let subdomain = null;
        if (parts.length > 2 && parts[0] !== 'www') {
          subdomain = parts[0];
        } else if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
          subdomain = 'demo'; // Default for development
        }
        
        if (subdomain) {
          config.headers['X-Tenant-ID'] = subdomain;
        }
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: {
          message: error.message || 'An unexpected error occurred',
        },
      };
    }
  }

  // Auth endpoints
  async login(data: LoginForm) {
    return this.request<{ user: User; organization: Organization; tokens: any }>('POST', '/api/auth/login', data);
  }

  async registerOrganization(data: RegisterOrganizationForm) {
    return this.request<{ user: User; organization: Organization; tokens: any }>('POST', '/api/auth/register-organization', data);
  }

  async logout() {
    return this.request('POST', '/api/auth/logout');
  }

  async refreshToken() {
    return this.request<{ tokens: any }>('POST', '/api/auth/refresh');
  }

  async getProfile() {
    return this.request<{ user: User; tenant: Organization }>('GET', '/api/auth/profile');
  }

  async inviteUser(data: { email: string; role: string; firstName?: string; lastName?: string }) {
    return this.request('POST', '/api/auth/invite', data);
  }

  // Sample endpoints
  async getSamples() {
    return this.request<Sample[]>('GET', '/api/samples');
  }

  async getSample(id: string) {
    return this.request<Sample>('GET', `/api/samples/${id}`);
  }

  async createSample(data: CreateSampleForm) {
    return this.request<Sample>('POST', '/api/samples', data);
  }

  async updateSample(id: string, data: Partial<CreateSampleForm>) {
    return this.request<Sample>('PUT', `/api/samples/${id}`, data);
  }

  async deleteSample(id: string) {
    return this.request('DELETE', `/api/samples/${id}`);
  }

  // Session endpoints
  async getSessions() {
    return this.request<{ sessions: CuppingSession[]; pagination: any }>('GET', '/api/sessions');
  }

  async getSession(id: string) {
    return this.request<CuppingSession>('GET', `/api/sessions/${id}`);
  }

  async createSession(data: CreateSessionForm) {
    return this.request<CuppingSession>('POST', '/api/sessions', data);
  }

  async updateSession(id: string, data: Partial<CreateSessionForm>) {
    return this.request<CuppingSession>('PUT', `/api/sessions/${id}`, data);
  }

  async deleteSession(id: string) {
    return this.request('DELETE', `/api/sessions/${id}`);
  }

  async startSession(id: string) {
    return this.request<CuppingSession>('POST', `/api/sessions/${id}/start`);
  }

  async completeSession(id: string) {
    return this.request<CuppingSession>('POST', `/api/sessions/${id}/complete`);
  }

  // Template endpoints
  async getTemplates() {
    return this.request<CuppingTemplate[]>('GET', '/api/templates');
  }

  async getTemplate(id: string) {
    return this.request<CuppingTemplate>('GET', `/api/templates/${id}`);
  }

  async createTemplate(data: any) {
    return this.request<CuppingTemplate>('POST', '/api/templates', data);
  }

  // Score endpoints
  async getSessionScores(sessionId: string) {
    return this.request<Score[]>('GET', `/api/sessions/${sessionId}/scores`);
  }

  async submitScore(sessionId: string, sampleId: string, data: any) {
    return this.request<Score>('POST', `/api/sessions/${sessionId}/samples/${sampleId}/score`, data);
  }

  async updateScore(scoreId: string, data: any) {
    return this.request<Score>('PUT', `/api/scores/${scoreId}`, data);
  }

  // Health check
  async healthCheck() {
    return this.request('GET', '/api/health');
  }
}

// Create singleton instance
export const api = new ApiClient();

// Export specific API modules
export const authApi = {
  login: api.login.bind(api),
  registerOrganization: api.registerOrganization.bind(api),
  logout: api.logout.bind(api),
  refreshToken: api.refreshToken.bind(api),
  getProfile: api.getProfile.bind(api),
  inviteUser: api.inviteUser.bind(api),
};

export const samplesApi = {
  getSamples: api.getSamples.bind(api),
  getSample: api.getSample.bind(api),
  createSample: api.createSample.bind(api),
  updateSample: api.updateSample.bind(api),
  deleteSample: api.deleteSample.bind(api),
};

export const sessionsApi = {
  getSessions: api.getSessions.bind(api),
  getSession: api.getSession.bind(api),
  createSession: api.createSession.bind(api),
  updateSession: api.updateSession.bind(api),
  deleteSession: api.deleteSession.bind(api),
  startSession: api.startSession.bind(api),
  completeSession: api.completeSession.bind(api),
};

export const templatesApi = {
  getTemplates: api.getTemplates.bind(api),
  getTemplate: api.getTemplate.bind(api),
  createTemplate: api.createTemplate.bind(api),
};

export const scoresApi = {
  getSessionScores: api.getSessionScores.bind(api),
  submitScore: api.submitScore.bind(api),
  updateScore: api.updateScore.bind(api),
};

export default api;
