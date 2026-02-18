const API_URL = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(endpoint, options = {}) {
  const { body, method = "GET", ...customOptions } = options;

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = { method, headers, ...customOptions };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, params) => {
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams(params).toString();
      return request(`${endpoint}?${qs}`);
    }
    return request(endpoint);
  },
  post: (endpoint, body) => request(endpoint, { method: "POST", body }),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),
};

export default api;
