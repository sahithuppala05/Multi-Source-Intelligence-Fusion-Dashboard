import axios from 'axios';

// In production (Render), VITE_API_URL is set to the backend Render URL.
// In development, Vite proxy handles /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const fetchIntelData = async (type = null) => {
  const params = type ? { type } : {};
  const { data } = await api.get('/data', { params });
  return data;
};

export const uploadDataFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const createIntel = async (payload) => {
  const { data } = await api.post('/data', payload);
  return data;
};

export const deleteIntel = async (id) => {
  const { data } = await api.delete(`/data/${id}`);
  return data;
};

export default api;
