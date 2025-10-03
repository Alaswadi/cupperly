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
  CreateSessionForm,
  GreenBeanGrading,
  CreateGreenBeanGradingForm
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: Function; reject: Function }> = [];

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

        // Debug logging for score submissions
        if (config.url?.includes('/scores')) {
          console.log('🔍 Score submission request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
          });
        }
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Debug logging for score submission errors
        if (error.config?.url?.includes('/scores')) {
          console.error('❌ Score submission error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config.url,
            method: error.config.method
          });
        }

        // Only try to refresh token if:
        // 1. The error is 401
        // 2. The failing request is NOT already a refresh token request
        // 3. The request hasn't already been retried
        if (error.response?.status === 401 &&
            !error.config?.url?.includes('/auth/refresh') &&
            !error.config?._retry) {

          // Mark this request as retried to prevent infinite loops
          error.config._retry = true;

          // If already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client.request(error.config);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.isRefreshing = false;

            // Process queued requests
            this.failedQueue.forEach(({ resolve }) => resolve());
            this.failedQueue = [];

            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            this.isRefreshing = false;

            // Reject all queued requests
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            // Clear any stored auth state and redirect to login
            if (typeof window !== 'undefined') {
              // Clear cookies if possible
              document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
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

  // Clear authentication state
  clearAuth() {
    if (typeof window !== 'undefined') {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }

  async getProfile() {
    return this.request<{ user: User; tenant: Organization }>('GET', '/api/auth/profile');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; email?: string; bio?: string; avatar?: string }) {
    return this.request<{ user: User }>('PUT', '/api/auth/profile', data);
  }

  async inviteUser(data: { email: string; role: string; firstName?: string; lastName?: string }) {
    return this.request('POST', '/api/auth/invite', data);
  }

  async createMember(data: { email: string; firstName: string; lastName: string; role: string; password: string }) {
    return this.request<{ user: User }>('POST', '/api/auth/create-member', data);
  }

  async getTeamMembers() {
    return this.request<{ users: User[] }>('GET', '/api/auth/team-members');
  }

  async updateTeamMember(id: string, data: { firstName?: string; lastName?: string; email?: string; role?: string; bio?: string }) {
    return this.request<{ user: User }>('PUT', `/api/auth/team-members/${id}`, data);
  }

  async deleteTeamMember(id: string) {
    return this.request('DELETE', `/api/auth/team-members/${id}`);
  }

  // Sample endpoints
  async getSamples() {
    return this.request<{ samples: Sample[]; pagination: any }>('GET', '/api/samples');
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
    return this.request<{ templates: CuppingTemplate[]; pagination: any }>('GET', '/api/templates');
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
    return this.request<Score>('POST', `/api/sessions/${sessionId}/samples/${sampleId}/scores`, data);
  }

  async updateScore(scoreId: string, data: any) {
    return this.request<Score>('PUT', `/api/scores/${scoreId}`, data);
  }

  // Flavor descriptor endpoints
  async getFlavorDescriptors() {
    return this.request<FlavorDescriptor[]>('GET', '/api/flavor-descriptors');
  }

  async createFlavorDescriptor(data: CreateFlavorDescriptorForm) {
    return this.request<FlavorDescriptor>('POST', '/api/flavor-descriptors', data);
  }

  async updateFlavorDescriptor(id: string, data: Partial<CreateFlavorDescriptorForm>) {
    return this.request<FlavorDescriptor>('PUT', `/api/flavor-descriptors/${id}`, data);
  }

  async deleteFlavorDescriptor(id: string) {
    return this.request('DELETE', `/api/flavor-descriptors/${id}`);
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
  updateProfile: api.updateProfile.bind(api),
  inviteUser: api.inviteUser.bind(api),
  createMember: api.createMember.bind(api),
  getTeamMembers: api.getTeamMembers.bind(api),
  updateTeamMember: api.updateTeamMember.bind(api),
  deleteTeamMember: api.deleteTeamMember.bind(api),
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

export const flavorDescriptorsApi = {
  getFlavorDescriptors: api.getFlavorDescriptors.bind(api),
  createFlavorDescriptor: api.createFlavorDescriptor.bind(api),
  updateFlavorDescriptor: api.updateFlavorDescriptor.bind(api),
  deleteFlavorDescriptor: api.deleteFlavorDescriptor.bind(api),
};

export const settingsApi = {
  getSettings: () => api.request<any>('GET', '/api/settings'),
  updateSettings: (data: any) => api.request<any>('PUT', '/api/settings', data),
};

export const aiApi = {
  generateSummary: (sessionId: string, sampleId: string) =>
    api.request<{ aiSummary: string; generatedAt: string }>('POST', `/api/ai/sessions/${sessionId}/samples/${sampleId}/summary`),
};

export const greenBeanGradingApi = {
  getGrading: (sampleId: string) =>
    api.request<GreenBeanGrading>('GET', `/api/samples/${sampleId}/grading`),
  createGrading: (sampleId: string, data: CreateGreenBeanGradingForm) =>
    api.request<GreenBeanGrading>('POST', `/api/samples/${sampleId}/grading`, data),
  updateGrading: (sampleId: string, data: CreateGreenBeanGradingForm) =>
    api.request<GreenBeanGrading>('PUT', `/api/samples/${sampleId}/grading`, data),
  deleteGrading: (sampleId: string) =>
    api.request<void>('DELETE', `/api/samples/${sampleId}/grading`),
  calculatePreview: (sampleId: string, data: {
    primaryDefects: number;
    secondaryDefects: number;
    moistureContent?: number;
    waterActivity?: number;
    colorScore?: number;
    uniformityScore?: number;
  }) =>
    api.request<{
      fullDefectEquivalents: number;
      classification: string;
      grade: string;
      qualityScore: number;
    }>('POST', `/api/samples/${sampleId}/grading/calculate`, data),
};

export default api;
