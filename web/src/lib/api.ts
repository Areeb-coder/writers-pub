const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async refreshTokens() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('Session expired');
    }

    const { data } = await res.json();
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data.accessToken;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    let res = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (Token expired)
    if (res.status === 401 && typeof window !== 'undefined') {
      try {
        const newToken = await this.refreshTokens();
        res = await fetch(url, {
          ...options,
          headers: { ...headers, 'Authorization': `Bearer ${newToken}` },
        });
      } catch (err) {
        window.location.href = '/login';
        throw err;
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return await res.json();
  }

  get<T>(endpoint: string) {
    return this.request<ApiResponse<T>>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown = {}) {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown = {}) {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body: unknown = {}) {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<ApiResponse<T>>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
