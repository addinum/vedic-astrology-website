// Lightweight fetch wrapper for the backend API
const api = {
  async get(path) {
    const res = await fetch(`${CONFIG.API_BASE}/api${path}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  async post(path, body, opts = {}) {
    const isForm = body instanceof FormData;
    const res = await fetch(`${CONFIG.API_BASE}/api${path}`, {
      method: 'POST',
      headers: isForm ? opts.headers || {} : { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: isForm ? body : JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  async put(path, body, token) {
    const res = await fetch(`${CONFIG.API_BASE}/api${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  async del(path, token) {
    const res = await fetch(`${CONFIG.API_BASE}/api${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  async postAuth(path, body, token) {
    const isForm = body instanceof FormData;
    const res = await fetch(`${CONFIG.API_BASE}/api${path}`, {
      method: 'POST',
      headers: isForm ? { Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: isForm ? body : JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
};
