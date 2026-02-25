import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: 'User' | 'Verifier' | 'Approver';
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    _hasHydrated: boolean; // Flag penanda hydration
    setHasHydrated: (state: boolean) => void;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-storage',
            // Fungsi ini dipanggil otomatis setelah Zustand selesai meload data dari localStorage
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);