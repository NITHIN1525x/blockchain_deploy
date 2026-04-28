// src/api/axios.js
import axios from 'axios';

// Base URL pointing to Django backend
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If token expired, clear storage and redirect to login
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;