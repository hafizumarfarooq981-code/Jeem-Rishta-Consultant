const BASE_URL = '/api';

export const adminApi = {
  getToken() {
    return localStorage.getItem('jrc_admin_token');
  },

  setToken(token) {
    localStorage.setItem('jrc_admin_token', token);
  },

  removeToken() {
    localStorage.removeItem('jrc_admin_token');
    localStorage.removeItem('jrc_admin_user');
  },

  getStoredAdmin() {
    const raw = localStorage.getItem('jrc_admin_user');
    return raw ? JSON.parse(raw) : null;
  },

  setStoredAdmin(admin) {
    localStorage.setItem('jrc_admin_user', JSON.stringify(admin));
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        window.dispatchEvent(new CustomEvent('admin-auth-expired'));
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  },

  // Auth
  async login(username, password) {
    const res = await this.request('/admin/login', {
      method: 'POST',
      body: { username, password }
    });
    if (res.token) {
      this.setToken(res.token);
      this.setStoredAdmin(res.admin);
    }
    return res;
  },

  // Dashboard
  async getDashboard() {
    return this.request('/admin/dashboard');
  },

  // Users
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  },

  async setUserStatus(userId, status) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: { status }
    });
  },

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async getUserProfiles(userId) {
    return this.request(`/admin/users/${userId}/profiles`);
  },

  // Profiles
  async getProfiles(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/profiles?${query}`);
  },

  async getProfileDetails(profileId) {
    return this.request(`/admin/profiles/${profileId}`);
  },

  async setProfileStatus(profileId, status) {
    return this.request(`/admin/profiles/${profileId}/status`, {
      method: 'POST',
      body: { status }
    });
  },

  // Settings
  async getSettings() {
    return this.request('/admin/settings');
  },

  async updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: { settings }
    });
  },

  // Audit logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/audit-logs?${query}`);
  }
};
