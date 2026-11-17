// Axios instance for the FrameSpace REST API.
import axios from 'axios';

const TOKEN_KEY = 'framespace_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn every failure into an Error with a readable message, the HTTP status
// and (for validation problems) a `fields` map the forms can display.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    let message = data?.message;
    if (!message) {
      if (err.code === 'ECONNABORTED') message = 'The request took too long. Please try again.';
      else if (!err.response) message = 'Cannot reach the server. Check that the backend is running.';
      else message = 'Something went wrong. Please try again.';
    }
    if (status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event('framespace:unauthorized'));
    }
    const error = new Error(message);
    error.status = status;
    error.fields = data?.fields;
    return Promise.reject(error);
  }
);

export default http;
