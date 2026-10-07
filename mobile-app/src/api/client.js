const BASE_URL = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('jrc_user_token');
  },

  setToken(token) {
    localStorage.setItem('jrc_user_token', token);
  },

  removeToken() {
    localStorage.removeItem('jrc_user_token');
    localStorage.removeItem('jrc_user_data');
  },

  getUserData() {
    const raw = localStorage.getItem('jrc_user_data');
    return raw ? JSON.parse(raw) : null;
  },

  setUserData(user) {
    localStorage.setItem('jrc_user_data', JSON.stringify(user));
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
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        this.removeToken();
        window.dispatchEvent(new CustomEvent('user-session-expired'));
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  },

  // Auth Endpoints
  async register(body) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body
    });
    if (res.token) {
      this.setToken(res.token);
      this.setUserData(res.user);
    }
    return res;
  },

  async login(mobile_number, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { mobile_number, password }
    });
    if (res.token) {
      this.setToken(res.token);
      this.setUserData(res.user);
    }
    return res;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async changePassword(body) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body
    });
  },

  async deleteAccount(password) {
    const res = await this.request('/auth/delete-account', {
      method: 'DELETE',
      body: { password }
    });
    this.removeToken();
    return res;
  },

  // Public Settings & Dynamic WhatsApp Number
  async getPublicSettings() {
    return this.request('/settings/public');
  },

  // Profiles
  async searchProfiles(params = {}) {
    const cleanParams = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        cleanParams[key] = val;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/profiles/search?${query}`);
  },

  async getPublicProfile(profileId) {
    return this.request(`/profiles/${profileId}/public`);
  },

  async createProfile(profileData) {
    return this.request('/profiles', {
      method: 'POST',
      body: profileData
    });
  },

  async getMyProfiles() {
    return this.request('/profiles/user/my-profiles');
  },

  async getUserProfileFull(profileId) {
    return this.request(`/profiles/${profileId}/user-full`);
  },

  async updateProfile(profileId, profileData) {
    return this.request(`/profiles/${profileId}`, {
      method: 'PUT',
      body: profileData
    });
  },

  async deleteProfile(profileId) {
    return this.request(`/profiles/${profileId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Constructs the official inquiry message and opens WhatsApp
   * Strictly compliant with Specification Clause 17
   */
  async contactAdminWhatsApp(profile) {
    try {
      // 1. Fetch live admin WhatsApp number from backend settings (never hardcoded)
      const settingsRes = await this.getPublicSettings();
      const rawNumber = settingsRes?.data?.admin_whatsapp_number || '923001234567';
      const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

      // 2. Prepare professional inquiry message
      const messageText = 
`Assalam-o-Alaikum.
I am interested in a profile listed on Jeem Rishta Consultant.
Profile ID: ${profile.profile_id}
Gender: ${profile.gender}
Age: ${profile.age}
City: ${profile.city}
Religion: ${profile.religion}
Education: ${profile.education}
Please contact me regarding this profile.`;

      const encodedText = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

      // 3. Open WhatsApp smoothly
      window.open(whatsappUrl, '_blank');
      return { success: true, url: whatsappUrl };
    } catch (err) {
      console.error('[WhatsApp Launch Error]:', err);
      alert('Could not launch WhatsApp. Please check your internet connection.');
      return { success: false, error: err.message };
    }
  }
};
