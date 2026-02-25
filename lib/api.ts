import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Membuat instance Axios
const api = axios.create({
    // Kita pakai environment variable agar gampang diganti saat deployment
    // Fallback ke localhost:8000/api kalau env belum diset
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 1. Request Interceptor: Menyisipkan Token
api.interceptors.request.use(
    (config) => {
        // Mengambil token dari state Zustand di luar React component
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Response Interceptor: Menangani Error Global (misal: Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika backend merespons dengan 401 Unauthorized (belum login / token expired)
        if (error.response && error.response.status === 401) {
            // Hapus data user dan token dari lokal storage
            useAuthStore.getState().logout();

            // Redirect ke halaman login secara paksa jika kita berada di environment browser
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;