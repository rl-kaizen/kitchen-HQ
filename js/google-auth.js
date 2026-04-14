// Kitchen HQ — Google OAuth via Identity Services
const GoogleAuth = {
  SCOPES: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly',

  tokenClient: null,
  accessToken: null,
  tokenExpiry: null,

  init() {
    const stored = localStorage.getItem('khq-google-token');
    const expiry = localStorage.getItem('khq-google-token-expiry');
    if (stored && expiry) {
      if (Date.now() < parseInt(expiry, 10)) {
        this.accessToken = stored;
        this.tokenExpiry = parseInt(expiry, 10);
      } else {
        // Token expired — clear it
        this.accessToken = null;
        this.tokenExpiry = null;
        localStorage.removeItem('khq-google-token');
        localStorage.removeItem('khq-google-token-expiry');
      }
    }
  },

  getClientId() {
    return localStorage.getItem('khq-google-client-id') || '';
  },

  isAuthenticated() {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  },

  authenticate() {
    return new Promise((resolve, reject) => {
      const clientId = this.getClientId();
      if (!clientId) {
        reject(new Error('No Google Client ID configured. Please enter your Client ID in Settings.'));
        return;
      }

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: this.SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          // Validate that all requested scopes were granted
          const granted = (response.scope || '').split(' ');
          const required = this.SCOPES.split(' ');
          const missing = required.filter(s => !granted.includes(s));
          if (missing.length > 0) {
            console.warn('[GoogleAuth] Missing scopes:', missing);
            reject(new Error(`Google did not grant all required permissions. Missing: ${missing.join(', ')}. Please reconnect and grant all permissions.`));
            return;
          }

          this.accessToken = response.access_token;
          // expires_in is in seconds; default to 3600 if not provided
          const expiresIn = (response.expires_in || 3600) * 1000;
          this.tokenExpiry = Date.now() + expiresIn;
          localStorage.setItem('khq-google-token', this.accessToken);
          localStorage.setItem('khq-google-token-expiry', String(this.tokenExpiry));
          resolve(this.accessToken);
        },
      });

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  async getToken() {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    // Don't auto-authenticate — callers should check isAuthenticated()
    // first, and only user-gesture handlers should call authenticate()
    throw new Error('Not authenticated. Please connect your Google account in Settings.');
  },

  disconnect() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenClient = null;
    localStorage.removeItem('khq-google-token');
    localStorage.removeItem('khq-google-token-expiry');
  },

  async fetchJSON(url) {
    const token = await this.getToken();
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      // Token expired or revoked — clear it
      this.accessToken = null;
      this.tokenExpiry = null;
      localStorage.removeItem('khq-google-token');
      localStorage.removeItem('khq-google-token-expiry');
      throw new Error('Google session expired. Please reconnect your Google account in Settings.');
    }
    if (!res.ok) {
      throw new Error(`Google API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  async postJSON(url, body) {
    const token = await this.getToken();
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      this.accessToken = null;
      this.tokenExpiry = null;
      localStorage.removeItem('khq-google-token');
      localStorage.removeItem('khq-google-token-expiry');
      throw new Error('Google session expired. Please reconnect your Google account in Settings.');
    }
    if (!res.ok) {
      throw new Error(`Google API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  async putJSON(url, body) {
    const token = await this.getToken();
    let res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      this.accessToken = null;
      this.tokenExpiry = null;
      localStorage.removeItem('khq-google-token');
      localStorage.removeItem('khq-google-token-expiry');
      throw new Error('Google session expired. Please reconnect your Google account in Settings.');
    }
    if (!res.ok) {
      throw new Error(`Google API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  async deleteRequest(url) {
    const token = await this.getToken();
    let res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      this.accessToken = null;
      this.tokenExpiry = null;
      localStorage.removeItem('khq-google-token');
      localStorage.removeItem('khq-google-token-expiry');
      throw new Error('Google session expired. Please reconnect your Google account in Settings.');
    }
    if (!res.ok && res.status !== 204) {
      throw new Error(`Google API error ${res.status}: ${res.statusText}`);
    }
    return res;
  },
};
