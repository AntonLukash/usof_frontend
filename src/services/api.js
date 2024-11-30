import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  return response.data;
};

export const getUserProfile = async (userId, token) => {
  return axios.get(`http://localhost:5000/api/users/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getPosts = async (params) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPostComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const addComment = async (postId, commentData) => {
  const response = await api.post(`/posts/${postId}/comments`, commentData);
  return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  };
  
export const updateAvatar = async (formData) => {
    const response = await api.patch('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  